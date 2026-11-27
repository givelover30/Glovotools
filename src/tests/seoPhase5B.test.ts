import { describe, it, expect } from 'vitest';
import { buildSitemapEntries, renderSitemapXml } from '../../scripts/generate-sitemap.ts';
import { CALCULATORS, CATEGORIES } from '../data/calculators.ts';

describe('Phase 5B: International SEO & Sitemap Verification', () => {
  it('builds valid sitemap entries with 9 locales and hreflang alternates', () => {
    const { entries, counts } = buildSitemapEntries(process.cwd(), 'https://glovotools.com', '2026-11-27');
    expect(entries.length).toBeGreaterThan(3000);
    expect(counts.totalLocales).toBe(9);

    const sampleEntry = entries[0];
    expect(sampleEntry.loc).toContain('https://glovotools.com');
    expect(sampleEntry.alternates.length).toBe(10); // 9 locales + x-default
    expect(sampleEntry.alternates.some(a => a.hreflang === 'x-default')).toBe(true);
    expect(sampleEntry.alternates.some(a => a.hreflang === 'es')).toBe(true);
  });

  it('renders valid XML sitemap string', () => {
    const { entries } = buildSitemapEntries(process.cwd(), 'https://glovotools.com', '2026-11-27');
    const xml = renderSitemapXml(entries.slice(0, 5));
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('xhtml:link');
    expect(xml).toContain('hreflang="es"');
    expect(xml).toContain('hreflang="x-default"');
  });

  it('verifies catalog and calculator counts for SEO indexing', () => {
    expect(CALCULATORS.length).toBeGreaterThan(4000);
    expect(CATEGORIES.length).toBeGreaterThan(40);
  });
});
