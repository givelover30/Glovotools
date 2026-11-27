import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, LANGUAGES } from './translations.ts';
import { getIntlLocale } from './formatters.ts';
import { interpolate, getMissingTranslationKeys } from './catalogLocalization.ts';
import { resolveInitialLanguage, saveLocale, getLocalizedUrlForLanguage, isValidLocale } from './languageUtils.ts';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getMissingKeys: () => string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function formatMissingTranslationFallback(key: string): string {
  if (/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(key)) {
    const lastSegment = key.split('.').pop() || key;
    const spaced = lastSegment
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .trim();
    return spaced.replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  return key;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const initial = resolveInitialLanguage();
    saveLocale(initial);
    return initial;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '') {
        const resolved = resolveInitialLanguage(currentPath);
        if (resolved !== 'en') {
          const targetUrl = `/${resolved}`;
          window.history.replaceState({}, '', targetUrl);
          setLanguageState(resolved);
          saveLocale(resolved);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = getIntlLocale(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (isValidLocale(lang)) {
      setLanguageState(lang);
      saveLocale(lang);
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const search = window.location.search;
        const newUrl = getLocalizedUrlForLanguage(currentPath, lang, search);
        if (currentPath + search !== newUrl) {
          window.history.pushState({}, '', newUrl);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let template = dict[key];
    if (!template) {
      template = TRANSLATIONS.en[key];
    }
    if (!template) {
      return formatMissingTranslationFallback(key);
    }
    return interpolate(template, params);
  };

  const getMissingKeys = () => {
    return getMissingTranslationKeys(language);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getMissingKeys }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
