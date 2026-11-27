import { Language, TRANSLATIONS, LANGUAGES } from './translations.ts';

export const SUPPORTED_LOCALES = LANGUAGES.map(l => l.code) as readonly Language[];

export function isValidLocale(code: string | null | undefined): code is Language {
  return !!code && (SUPPORTED_LOCALES as readonly string[]).includes(code);
}

export function detectBrowserLanguage(): Language | null {
  const nav = (typeof window !== 'undefined' && window.navigator) ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
  if (!nav) return null;
  const langList: string[] = [];
  if (nav.languages && Array.from(nav.languages).length > 0) {
    langList.push(...Array.from(nav.languages));
  }
  if (nav.language) {
    langList.push(nav.language);
  }

  for (const raw of langList) {
    if (!raw) continue;
    const lower = raw.toLowerCase().trim();

    if (lower === 'es' || lower.startsWith('es-')) return 'es';
    if (lower === 'fr' || lower.startsWith('fr-')) return 'fr';
    if (lower === 'de' || lower.startsWith('de-')) return 'de';
    if (lower === 'it' || lower.startsWith('it-')) return 'it';
    if (lower === 'ja' || lower.startsWith('ja-')) return 'ja';
    if (lower === 'zh-cn' || lower === 'zh' || lower.startsWith('zh-cn')) return 'zh-CN';
    if (lower === 'pl' || lower.startsWith('pl-')) return 'pl';
    if (lower === 'pt-br' || lower.startsWith('pt-br')) return 'pt-BR';
    if (lower === 'en' || lower.startsWith('en-')) return 'en';
  }
  return null;
}

export function getSavedLocale(): Language | null {
  const store = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return null;
  try {
    const saved = store.getItem('calctools_lang');
    if (isValidLocale(saved)) {
      return saved;
    }
  } catch {
    // localStorage access failure (e.g. private browsing)
  }
  return null;
}

export function saveLocale(lang: Language): void {
  const store = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return;
  try {
    store.setItem('calctools_lang', lang);
  } catch {
    // localStorage access failure
  }
}

export function resolveInitialLanguage(pathname?: string): Language {
  const currentPath = pathname || ((typeof window !== 'undefined' && window.location) ? window.location.pathname : '');
  
  // 1. Explicit valid locale in URL
  const parts = currentPath.split('/').filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    return parts[0];
  }

  // 2. Saved user language preference when URL has no explicit locale
  const saved = getSavedLocale();
  if (saved) {
    return saved;
  }

  // 3. Browser language preference on first visit
  const browserLang = detectBrowserLanguage();
  if (browserLang) {
    return browserLang;
  }

  // 4. English fallback
  return 'en';
}

export function getLocalizedUrlForLanguage(currentPathname: string, targetLang: Language, searchString: string = ''): string {
  const parts = currentPathname.split('/').filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    parts[0] = targetLang;
  } else {
    parts.unshift(targetLang);
  }
  const newPath = '/' + parts.join('/');
  return newPath + searchString;
}
