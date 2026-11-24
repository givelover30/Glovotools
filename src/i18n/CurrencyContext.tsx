import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from './I18nContext.tsx';
import { ResultFormatter } from '../engine/ResultFormatter.ts';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'NZD'
  | 'DOP'
  | 'MXN'
  | 'COP'
  | 'ARS'
  | 'CLP'
  | 'PEN'
  | 'BRL'
  | 'CHF'
  | 'PLN'
  | 'JPY'
  | 'CNY'
  | 'HKD';

export interface CurrencyMeta {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'PLN', flag: '🇵🇱' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', flag: '🇭🇰' },
];

export const LANGUAGE_DEFAULT_CURRENCIES: Record<string, CurrencyCode> = {
  en: 'USD',
  es: 'USD',
  fr: 'EUR',
  pt: 'BRL',
  de: 'EUR',
  it: 'EUR',
  ja: 'JPY',
  zh: 'CNY',
  pl: 'PLN',
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyMeta: CurrencyMeta;
  setCurrency: (code: CurrencyCode, isManual?: boolean) => void;
  formatCurrency: (
    value: number,
    options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
  ) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { language } = useTranslation();

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('calctools_currency') as CurrencyCode;
      if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
        ResultFormatter.setActiveCurrency(saved);
        return saved;
      }
    } catch {}
    ResultFormatter.setActiveCurrency('USD');
    return 'USD';
  });

  const [isManualSelection, setIsManualSelection] = useState<boolean>(() => {
    try {
      return localStorage.getItem('calctools_currency_manual') === 'true';
    } catch {
      return false;
    }
  });

  // Ensure ResultFormatter is always synced synchronously during render and via effect
  ResultFormatter.setActiveCurrency(currency);

  useEffect(() => {
    ResultFormatter.setActiveCurrency(currency);
  }, [currency]);

  // Handle language-based defaults when language changes and user has not manually overridden
  useEffect(() => {
    if (!isManualSelection) {
      const defaultCurr = LANGUAGE_DEFAULT_CURRENCIES[language] || 'USD';
      setCurrencyState(defaultCurr);
      ResultFormatter.setActiveCurrency(defaultCurr);
      try {
        localStorage.setItem('calctools_currency', defaultCurr);
      } catch {}
    }
  }, [language, isManualSelection]);

  const setCurrency = (code: CurrencyCode, isManual = true) => {
    // Validate that code is in SUPPORTED_CURRENCIES (reject XOF, XAF, or invalid codes)
    if (!SUPPORTED_CURRENCIES.some((c) => c.code === code)) {
      return;
    }
    setCurrencyState(code);
    if (isManual) {
      setIsManualSelection(true);
      try {
        localStorage.setItem('calctools_currency_manual', 'true');
      } catch {}
    }
    try {
      localStorage.setItem('calctools_currency', code);
    } catch {}
    ResultFormatter.setActiveCurrency(code);
  };

  const currencyMeta =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const formatCurrency = (
    value: number,
    options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
  ): string => {
    return ResultFormatter.formatCurrency(value, currency, options);
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencyMeta, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
