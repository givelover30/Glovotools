import { Language } from './translations.ts';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  zh: 'zh-CN',
  pl: 'pl-PL'
};

export function getIntlLocale(language: Language): string {
  return LOCALE_MAP[language] || 'en-US';
}

export function formatLocalizedNumber(value: number, language: Language, options?: Intl.NumberFormatOptions): string {
  if (isNaN(value)) return '0';
  const locale = getIntlLocale(language);
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatLocalizedCurrency(value: number, language: Language, currency = 'USD'): string {
  if (isNaN(value)) return '$0.00';
  const locale = getIntlLocale(language);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatLocalizedDate(date: Date | string, language: Language, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  const locale = getIntlLocale(language);
  const defaultOptions: Intl.DateTimeFormatOptions = options || { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
}
