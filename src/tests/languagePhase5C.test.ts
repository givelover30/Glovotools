import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  detectBrowserLanguage, 
  getSavedLocale, 
  saveLocale, 
  resolveInitialLanguage, 
  getLocalizedUrlForLanguage, 
  isValidLocale,
  SUPPORTED_LOCALES 
} from '../i18n/languageUtils.ts';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    }
  };
}

describe('Phase 5C: Browser Language Detection & Persistence', () => {
  const originalStorage = typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined;
  const originalNavigator = typeof globalThis !== 'undefined' ? globalThis.navigator : undefined;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalStorage) (globalThis as any).localStorage = originalStorage;
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true
      });
    }
  });

  it('validates supported locales correctly', () => {
    for (const code of SUPPORTED_LOCALES) {
      expect(isValidLocale(code)).toBe(true);
    }
    expect(isValidLocale('xx')).toBe(false);
    expect(isValidLocale(null)).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
  });

  it('maps browser languages correctly for all nine locales and handles unsupported fallbacks', () => {
    const testCases = [
      { lang: 'es-ES', expected: 'es' },
      { lang: 'es-MX', expected: 'es' },
      { lang: 'fr-FR', expected: 'fr' },
      { lang: 'de-DE', expected: 'de' },
      { lang: 'it-IT', expected: 'it' },
      { lang: 'ja-JP', expected: 'ja' },
      { lang: 'zh-CN', expected: 'zh-CN' },
      { lang: 'zh', expected: 'zh-CN' },
      { lang: 'pl-PL', expected: 'pl' },
      { lang: 'pt-BR', expected: 'pt-BR' },
      { lang: 'en-US', expected: 'en' },
      { lang: 'pt-PT', expected: null },
      { lang: 'zh-TW', expected: null },
      { lang: 'xx-XX', expected: null }
    ];

    for (const tc of testCases) {
      const navMock = { language: tc.lang, languages: [tc.lang] };
      Object.defineProperty(globalThis, 'navigator', {
        value: navMock,
        configurable: true,
        writable: true
      });
      const detected = detectBrowserLanguage();
      expect(detected).toBe(tc.expected);
    }
  });

  it('handles invalid localStorage values and access failures safely', () => {
    const storage = createMemoryStorage();
    (globalThis as any).localStorage = storage;

    // Invalid stored value
    storage.setItem('calctools_lang', 'invalid-lang');
    expect(getSavedLocale()).toBeNull();

    // Valid stored value
    storage.setItem('calctools_lang', 'es');
    expect(getSavedLocale()).toBe('es');

    // Test storage exception / failure (private browsing)
    const errorStorage = {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('QuotaExceededError'); }
    };
    (globalThis as any).localStorage = errorStorage;

    expect(() => getSavedLocale()).not.toThrow();
    expect(getSavedLocale()).toBeNull();
    expect(() => saveLocale('fr')).not.toThrow();
  });

  it('enforces Language Resolution Priority: Explicit URL > Saved Preference > Browser Language > English', () => {
    const storage = createMemoryStorage({ calctools_lang: 'es' });
    (globalThis as any).localStorage = storage;

    const navMock = { language: 'fr-FR', languages: ['fr-FR'] };
    Object.defineProperty(globalThis, 'navigator', {
      value: navMock,
      configurable: true,
      writable: true
    });

    // 1. Explicit valid URL locale wins
    expect(resolveInitialLanguage('/ja/calculator/percentage')).toBe('ja');
    expect(resolveInitialLanguage('/fr/calculators/finance')).toBe('fr');

    // 2. Saved preference wins when URL has no explicit locale
    expect(resolveInitialLanguage('/calculator/percentage')).toBe('es');
    expect(resolveInitialLanguage('/')).toBe('es');

    // 3. Browser language used when no URL locale and no saved preference
    storage.removeItem('calctools_lang');
    const deNavMock = { language: 'de-DE', languages: ['de-DE'] };
    Object.defineProperty(globalThis, 'navigator', {
      value: deNavMock,
      configurable: true,
      writable: true
    });
    expect(resolveInitialLanguage('/calculator/percentage')).toBe('de');

    // 4. English fallback when no URL locale, no saved preference, and unsupported browser language
    const unsuppNavMock = { language: 'xx-XX', languages: ['xx-XX'] };
    Object.defineProperty(globalThis, 'navigator', {
      value: unsuppNavMock,
      configurable: true,
      writable: true
    });
    expect(resolveInitialLanguage('/calculator/percentage')).toBe('en');
  });

  it('generates correct localized URLs while preserving calculator IDs and search parameters', () => {
    const url1 = getLocalizedUrlForLanguage('/calculator/percentage', 'es', '?q=test');
    expect(url1).toBe('/es/calculator/percentage?q=test');

    const url2 = getLocalizedUrlForLanguage('/fr/calculator/mortgage', 'de', '');
    expect(url2).toBe('/de/calculator/mortgage');

    const url3 = getLocalizedUrlForLanguage('/calculators/finance', 'ja', '');
    expect(url3).toBe('/ja/calculators/finance');
  });
});
