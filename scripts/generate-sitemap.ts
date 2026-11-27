import fs from 'node:fs';
import path from 'node:path';
import { CALCULATORS, CATEGORIES, SUBCATEGORIES } from '../src/data/calculators.ts';

export interface SitemapAlternate {
  hreflang: string;
  href: string;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  alternates: SitemapAlternate[];
}

const DEFAULT_BASE_URL = 'https://glovotools.com';
const MAX_SITEMAP_URLS = 50_000;
const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN', 'pl', 'pt-BR'];

const STATIC_ROUTE_METADATA: Record<
  string,
  { changefreq: SitemapEntry['changefreq']; priority: string }
> = {
  '/': { changefreq: 'weekly', priority: '1.0' },
  '/calculators': { changefreq: 'weekly', priority: '0.9' },
  '/all-calculators': { changefreq: 'weekly', priority: '0.9' },
  '/about': { changefreq: 'monthly', priority: '0.6' },
  '/contact': { changefreq: 'monthly', priority: '0.6' },
  '/privacy': { changefreq: 'monthly', priority: '0.5' },
  '/terms': { changefreq: 'monthly', priority: '0.5' },
  '/favorites': { changefreq: 'weekly', priority: '0.4' },
};

function resolveBaseUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    DEFAULT_BASE_URL;
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^/\s]+/i.test(trimmed)) {
    throw new Error(`Invalid sitemap base URL: "${raw}"`);
  }
  return trimmed;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function crawlStaticRoutes(rootDir: string): string[] {
  const appPath = path.resolve(rootDir, 'src/App.tsx');
  const discovered = new Set<string>(['/', '/calculators']);

  if (fs.existsSync(appPath)) {
    const source = fs.readFileSync(appPath, 'utf8');
    const parseFnMatch = source.match(
      /export function parseUrlPath\([\s\S]*?\n\}/
    );
    if (parseFnMatch) {
      const singleSegmentMatches = parseFnMatch[0].matchAll(
        /if\s*\(\s*parts\[0\]\s*===\s*['"]([a-z0-9-]+)['"]\s*\)/g
      );
      for (const match of singleSegmentMatches) {
        discovered.add(`/${match[1]}`);
      }
    }
  }

  for (const fallbackRoute of Object.keys(STATIC_ROUTE_METADATA)) {
    discovered.add(fallbackRoute);
  }

  const ordered = [
    ...Object.keys(STATIC_ROUTE_METADATA).filter((r) => discovered.has(r)),
    ...[...discovered]
      .filter((r) => !(r in STATIC_ROUTE_METADATA))
      .sort(),
  ];

  return ordered;
}

export function buildSitemapEntries(
  rootDir: string = process.cwd(),
  baseUrl: string = resolveBaseUrl(),
  lastmod: string = new Date().toISOString().slice(0, 10)
): {
  entries: SitemapEntry[];
  counts: {
    staticPages: number;
    categories: number;
    subcategories: number;
    calculators: number;
    totalLocales: number;
  };
} {
  const rawPaths: Array<{ path: string; changefreq: SitemapEntry['changefreq']; priority: string }> = [];

  // 1. Static pages
  for (const route of crawlStaticRoutes(rootDir)) {
    const meta = STATIC_ROUTE_METADATA[route] ?? {
      changefreq: 'monthly' as const,
      priority: '0.5',
    };
    rawPaths.push({ path: route, changefreq: meta.changefreq, priority: meta.priority });
  }

  // 2. Category landing pages
  const categoryById = new Map(CATEGORIES.map((cat) => [cat.id, cat]));
  for (const cat of CATEGORIES) {
    if (!cat?.slug) continue;
    rawPaths.push({ path: `/calculators/${cat.slug}`, changefreq: 'weekly', priority: '0.9' });
  }

  // 3. Subcategory landing pages
  for (const sub of SUBCATEGORIES) {
    if (!sub?.slug || !sub?.categoryId) continue;
    const parentCat = categoryById.get(sub.categoryId);
    if (!parentCat?.slug) continue;
    rawPaths.push({ path: `/calculators/${parentCat.slug}/${sub.slug}`, changefreq: 'weekly', priority: '0.8' });
  }

  // 4. Calculator routes
  for (const calc of CALCULATORS) {
    if (!calc?.id) continue;
    rawPaths.push({ path: `/calculator/${calc.id}`, changefreq: 'weekly', priority: '0.8' });
  }

  const entries: SitemapEntry[] = [];
  const seenUrls = new Set<string>();

  let staticPages = 0;
  let categories = 0;
  let subcategories = 0;
  let calculators = 0;

  for (const item of rawPaths) {
    const normalizedBasePath = item.path === '/' ? '' : `/${item.path.replace(/^\/+/, '')}`;
    
    // Build alternate links for all 9 locales + x-default
    const alternates: SitemapAlternate[] = SUPPORTED_LOCALES.map((code) => ({
      hreflang: code,
      href: `${baseUrl}/${code}${normalizedBasePath}`,
    }));
    alternates.push({
      hreflang: 'x-default',
      href: `${baseUrl}/en${normalizedBasePath}`,
    });

    for (const locale of SUPPORTED_LOCALES) {
      const routePath = `/${locale}${normalizedBasePath}`;
      const fullUrl = `${baseUrl}${encodeURI(routePath)}`;
      if (seenUrls.has(fullUrl)) continue;
      seenUrls.add(fullUrl);

      entries.push({
        loc: fullUrl,
        lastmod,
        changefreq: item.changefreq,
        priority: item.priority,
        alternates,
      });
    }

    if (item.path.startsWith('/calculator/')) calculators++;
    else if (item.path.startsWith('/calculators/')) {
      if (item.path.split('/').length === 3) categories++;
      else subcategories++;
    } else {
      staticPages++;
    }
  }

  if (entries.length > MAX_SITEMAP_URLS) {
    throw new Error(
      `Sitemap exceeds ${MAX_SITEMAP_URLS.toLocaleString()} URL protocol limit (${entries.length.toLocaleString()} URLs).`
    );
  }

  return {
    entries,
    counts: {
      staticPages: staticPages * SUPPORTED_LOCALES.length,
      categories: categories * SUPPORTED_LOCALES.length,
      subcategories: subcategories * SUPPORTED_LOCALES.length,
      calculators: calculators * SUPPORTED_LOCALES.length,
      totalLocales: SUPPORTED_LOCALES.length,
    },
  };
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map((entry) => {
      const alternateNodes = entry.alternates
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`
        )
        .join('\n');
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${alternateNodes}
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes}
</urlset>
`;
}

export function generateSitemap(rootDir: string = process.cwd()): {
  outputPath: string;
  totalUrls: number;
  counts: {
    staticPages: number;
    categories: number;
    subcategories: number;
    calculators: number;
    totalLocales: number;
  };
} {
  const baseUrl = resolveBaseUrl();
  const { entries, counts } = buildSitemapEntries(rootDir, baseUrl);
  const xml = renderSitemapXml(entries);

  const publicDir = path.resolve(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');

  console.log(
    `[Sitemap Generator] Wrote ${entries.length.toLocaleString()} URLs across ${counts.totalLocales} locales to ${path.relative(rootDir, outputPath)}`
  );

  return {
    outputPath,
    totalUrls: entries.length,
    counts,
  };
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.replace(/\\/g, '/').endsWith('/scripts/generate-sitemap.ts');

if (isDirectExecution) {
  generateSitemap();
}
