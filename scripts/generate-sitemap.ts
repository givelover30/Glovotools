import fs from 'node:fs';
import path from 'node:path';
import { CALCULATORS, CATEGORIES, SUBCATEGORIES } from '../src/data/calculators.ts';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

const DEFAULT_BASE_URL = 'https://glovotools.com';
const MAX_SITEMAP_URLS = 50_000;

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

/**
 * Crawls static SPA page routes declared in src/App.tsx `parseUrlPath`,
 * merging with canonical baseline routes so directory & informational pages stay indexed.
 */
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

  // Keep deterministic canonical ordering: prioritized known routes first, then alphabetical
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
  };
} {
  const entries: SitemapEntry[] = [];
  const seenUrls = new Set<string>();

  const addRoute = (
    routePath: string,
    changefreq: SitemapEntry['changefreq'],
    priority: string
  ): boolean => {
    const normalizedPath = routePath === '/' ? '/' : `/${routePath.replace(/^\/+/, '')}`;
    const fullUrl = `${baseUrl}${normalizedPath === '/' ? '/' : encodeURI(normalizedPath)}`;
    if (seenUrls.has(fullUrl)) return false;
    seenUrls.add(fullUrl);
    entries.push({ loc: fullUrl, lastmod, changefreq, priority });
    return true;
  };

  // 1. Static pages (from src/App.tsx parseUrlPath)
  let staticPages = 0;
  for (const route of crawlStaticRoutes(rootDir)) {
    const meta = STATIC_ROUTE_METADATA[route] ?? {
      changefreq: 'monthly' as const,
      priority: '0.5',
    };
    if (addRoute(route, meta.changefreq, meta.priority)) {
      staticPages++;
    }
  }

  // 2. Category landing pages (/calculators/:categorySlug)
  const categoryById = new Map(CATEGORIES.map((cat) => [cat.id, cat]));
  let categories = 0;
  for (const cat of CATEGORIES) {
    if (!cat?.slug) continue;
    if (addRoute(`/calculators/${cat.slug}`, 'weekly', '0.9')) {
      categories++;
    }
  }

  // 3. Subcategory landing pages (/calculators/:categorySlug/:subcategorySlug)
  let subcategories = 0;
  for (const sub of SUBCATEGORIES) {
    if (!sub?.slug || !sub?.categoryId) continue;
    const parentCat = categoryById.get(sub.categoryId);
    if (!parentCat?.slug) continue;
    if (addRoute(`/calculators/${parentCat.slug}/${sub.slug}`, 'weekly', '0.8')) {
      subcategories++;
    }
  }

  // 4. All registered calculator/tool routes (/calculator/:id), deduplicated by ID
  let calculators = 0;
  for (const calc of CALCULATORS) {
    if (!calc?.id) continue;
    if (addRoute(`/calculator/${calc.id}`, 'weekly', '0.8')) {
      calculators++;
    }
  }

  if (entries.length > MAX_SITEMAP_URLS) {
    throw new Error(
      `Sitemap exceeds ${MAX_SITEMAP_URLS.toLocaleString()} URL protocol limit (${entries.length.toLocaleString()} URLs). Split into a sitemap index.`
    );
  }

  return {
    entries,
    counts: { staticPages, categories, subcategories, calculators },
  };
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
    `[Sitemap Generator] Wrote ${entries.length.toLocaleString()} URLs to ${path.relative(rootDir, outputPath)} ` +
      `(static=${counts.staticPages}, categories=${counts.categories}, subcategories=${counts.subcategories}, calculators=${counts.calculators}, base=${baseUrl})`
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
