import { CALCULATORS, CATEGORIES } from '../data/calculators.ts';
import fs from 'fs';
import path from 'path';

export function generateSitemapAndRobots() {
  const domain = 'https://calctools.app';
  const urls: string[] = [];

  // Home & directories
  urls.push(`${domain}/`);
  urls.push(`${domain}/calculators`);
  urls.push(`${domain}/all-calculators`);

  // Categories & Subcategories
  for (const cat of CATEGORIES) {
    urls.push(`${domain}/calculators/${cat.slug}`);
  }

  // 300 Calculators
  for (const calc of CALCULATORS) {
    urls.push(`${domain}/calculator/${calc.id}`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u === domain + '/' ? '1.0' : u.includes('/calculator/') ? '0.8' : '0.9'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`Successfully generated sitemap.xml with ${urls.length} URLs and robots.txt in /public/`);
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('generateSitemap')) {
  generateSitemapAndRobots();
}
