import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nProvider } from '../i18n/I18nContext.tsx';
import { CurrencyProvider, CurrencyCode, SUPPORTED_CURRENCIES } from '../i18n/CurrencyContext.tsx';
import LoanCalculator from '../components/calculators/LoanCalculator.tsx';
import CompoundInterestCalculator from '../components/calculators/CompoundInterestCalculator.tsx';
import { ResultFormatter } from '../engine/ResultFormatter.ts';

function normalizeHtml(html: string): string {
  return html.replace(/\u00a0/g, ' ');
}

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

describe('LoanCalculator & Calculator CurrencyContext Integration', () => {
  const originalStorage = (globalThis as any).localStorage;

  beforeEach(() => {
    ResultFormatter.setActiveCurrency('USD');
  });

  afterEach(() => {
    if (originalStorage === undefined) {
      delete (globalThis as any).localStorage;
    } else {
      (globalThis as any).localStorage = originalStorage;
    }
  });

  it('renders LoanCalculator with the persisted global currency across USD, EUR, GBP, CAD, DOP, JPY, and PLN without changing calculations', () => {
    const expectations: Array<{
      code: CurrencyCode;
      symbol: string;
      preset50k: string;
      monthlyPayment: string;
      totalInterest: string;
      totalCost: string;
    }> = [
      {
        code: 'USD',
        symbol: '$',
        preset50k: '$50k',
        monthlyPayment: '$1,580.17',
        totalInterest: '$318,861.22',
        totalCost: '$568,861.22'
      },
      {
        code: 'EUR',
        symbol: '€',
        preset50k: '€50k',
        monthlyPayment: '€1,580.17',
        totalInterest: '€318,861.22',
        totalCost: '€568,861.22'
      },
      {
        code: 'GBP',
        symbol: '£',
        preset50k: '£50k',
        monthlyPayment: '£1,580.17',
        totalInterest: '£318,861.22',
        totalCost: '£568,861.22'
      },
      {
        code: 'CAD',
        symbol: '$',
        preset50k: '$50k',
        monthlyPayment: 'CA$1,580.17',
        totalInterest: 'CA$318,861.22',
        totalCost: 'CA$568,861.22'
      },
      {
        code: 'DOP',
        symbol: 'RD$',
        preset50k: 'RD$50k',
        monthlyPayment: 'DOP 1,580.17',
        totalInterest: 'DOP 318,861.22',
        totalCost: 'DOP 568,861.22'
      },
      {
        code: 'JPY',
        symbol: '¥',
        preset50k: '¥50k',
        monthlyPayment: '¥1,580',
        totalInterest: '¥318,861',
        totalCost: '¥568,861'
      },
      {
        code: 'PLN',
        symbol: 'PLN',
        preset50k: 'PLN 50k',
        monthlyPayment: 'PLN 1,580.17',
        totalInterest: 'PLN 318,861.22',
        totalCost: 'PLN 568,861.22'
      }
    ];

    for (const tc of expectations) {
      (globalThis as any).localStorage = createMemoryStorage({
        calctools_currency: tc.code,
        calctools_currency_manual: 'true'
      });

      const html = normalizeHtml(
        renderToStaticMarkup(
          React.createElement(
            I18nProvider,
            null,
            React.createElement(CurrencyProvider, null, React.createElement(LoanCalculator, { initialTermYears: '30' }))
          )
        )
      );

      // Currency indicator beside input label and inside input
      expect(html).toContain(`>${tc.code}<`);
      expect(html).toContain(`>${tc.symbol}<`);
      // Preset button updates to match active currency
      expect(html).toContain(`>${tc.preset50k}<`);
      // Calculated monetary outputs use active currency and keep exact mathematical values
      expect(html).toContain(tc.monthlyPayment);
      expect(html).toContain(tc.totalInterest);
      expect(html).toContain(tc.totalCost);

      // Ensure USD/EUR don't bleed into non-USD/non-EUR renderings
      if (tc.code === 'EUR') {
        expect(html).not.toContain('$50k');
        expect(html).not.toContain('$1,580.17');
        expect(html).not.toContain('>USD<');
      }
      if (tc.code === 'JPY') {
        expect(html).not.toContain('1,580.17');
      }
    }
  });

  it('rejects unsupported XOF/XAF values in localStorage and falls back safely to USD', () => {
    for (const unsupported of ['XOF', 'XAF', 'INVALID']) {
      (globalThis as any).localStorage = createMemoryStorage({
        calctools_currency: unsupported,
        calctools_currency_manual: 'true'
      });

      expect(SUPPORTED_CURRENCIES.some((c) => c.code === unsupported)).toBe(false);

      const html = normalizeHtml(
        renderToStaticMarkup(
          React.createElement(
            I18nProvider,
            null,
            React.createElement(CurrencyProvider, null, React.createElement(LoanCalculator, { initialTermYears: '30' }))
          )
        )
      );

      expect(html).toContain('>USD<');
      expect(html).toContain('$1,580.17');
      expect(html).not.toContain(unsupported);
    }
  });

  it('renders CompoundInterestCalculator with EUR and JPY formatting consistently', () => {
    (globalThis as any).localStorage = createMemoryStorage({
      calctools_currency: 'EUR',
      calctools_currency_manual: 'true'
    });

    const eurHtml = normalizeHtml(
      renderToStaticMarkup(
        React.createElement(
          I18nProvider,
          null,
          React.createElement(CurrencyProvider, null, React.createElement(CompoundInterestCalculator))
        )
      )
    );
    expect(eurHtml).toContain('€');
    expect(eurHtml).not.toContain('>USD<');

    (globalThis as any).localStorage = createMemoryStorage({
      calctools_currency: 'JPY',
      calctools_currency_manual: 'true'
    });

    const jpyHtml = normalizeHtml(
      renderToStaticMarkup(
        React.createElement(
          I18nProvider,
          null,
          React.createElement(CurrencyProvider, null, React.createElement(CompoundInterestCalculator))
        )
      )
    );
    expect(jpyHtml).toContain('¥');
    expect(jpyHtml).not.toContain('>USD<');
  });
});
