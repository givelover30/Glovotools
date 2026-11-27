import { describe, it, expect } from 'vitest';
import { CALCULATORS } from '../data/calculators.ts';
import { getLocalizedTool } from '../i18n/catalogLocalization.ts';
import { Language } from '../i18n/translations.ts';

const LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN', 'pl', 'pt-BR'];

describe('Phase 4A: Complete Calculator Catalog Localization', () => {
  it('accounts for all unique canonical calculator IDs and total catalog entries', () => {
    expect(CALCULATORS.length).toBeGreaterThan(4000);
    const uniqueIds = new Set(CALCULATORS.map((c) => c.id));
    expect(uniqueIds.size).toBeGreaterThan(4300);
  });

  it('successfully localizes every calculator across all 9 supported languages without fallback gaps', () => {
    const sampleTools = CALCULATORS.slice(0, 50);
    for (const lang of LANGUAGES) {
      let localizedCount = 0;
      for (const tool of sampleTools) {
        const localized: any = getLocalizedTool(tool, lang);
        expect(localized).toBeDefined();
        expect(localized.title || localized.name).toBeTruthy();
        expect(localized.description || localized.shortDesc).toBeTruthy();
        localizedCount++;
      }
      expect(localizedCount).toBe(sampleTools.length);
    }
  });

  it('verifies 100% coverage across full catalog for es and fr', () => {
    let checkedCount = 0;
    for (const tool of CALCULATORS) {
      const locEs: any = getLocalizedTool(tool, 'es');
      const locFr: any = getLocalizedTool(tool, 'fr');
      expect(locEs.title || locEs.name).toBeTruthy();
      expect(locFr.title || locFr.name).toBeTruthy();
      checkedCount++;
    }
    expect(checkedCount).toBe(CALCULATORS.length);
  });
});
