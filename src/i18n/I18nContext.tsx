import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, LANGUAGES } from './translations.ts';
import { getIntlLocale } from './formatters.ts';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('calctools_lang') as Language;
      if (saved && TRANSLATIONS[saved] && LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('calctools_lang', language);
    } catch {}
    document.documentElement.lang = getIntlLocale(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (TRANSLATIONS[lang] && LANGUAGES.some(l => l.code === lang)) {
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key]) {
      return dict[key];
    }
    const fallback = TRANSLATIONS.en[key];
    if (fallback) {
      return fallback;
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
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
