import { describe, it, expect } from 'vitest';
import { parseUrlPath } from '../App.tsx';
import { LANGUAGES } from '../i18n/translations.ts';

const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

describe('Phase 5A: Language-Aware URL Routing', () => {
  it('parses locale-prefixed home URLs correctly across all 9 languages', () => {
    for (const code of SUPPORTED_CODES) {
      const parsed = parseUrlPath(`/${code}`);
      expect(parsed.view).toBe('home');
      expect(parsed.locale).toBe(code);
    }
  });

  it('parses locale-prefixed calculator URLs correctly across all 9 languages', () => {
    for (const code of SUPPORTED_CODES) {
      const parsed = parseUrlPath(`/${code}/calculator/percentage`);
      expect(parsed.view).toBe('calculator');
      expect(parsed.calculatorId).toBe('percentage');
      expect(parsed.locale).toBe(code);
    }
  });

  it('parses legacy non-prefixed URLs with null locale for backward compatibility', () => {
    const parsed = parseUrlPath('/calculator/percentage');
    expect(parsed.view).toBe('calculator');
    expect(parsed.calculatorId).toBe('percentage');
    expect(parsed.locale).toBeNull();
  });

  it('handles unknown calculator IDs with not-found view', () => {
    const parsed = parseUrlPath('/en/calculator/nonexistent-tool-xyz');
    expect(parsed.view).toBe('not-found');
    expect(parsed.calculatorId).toBeNull();
  });

  it('handles category detail routing with locale prefixes', () => {
    const parsed = parseUrlPath('/es/calculators/basic-math');
    expect(parsed.view).toBe('category-detail');
    expect(parsed.categoryId).toBe('basic-math');
    expect(parsed.locale).toBe('es');
  });
});
