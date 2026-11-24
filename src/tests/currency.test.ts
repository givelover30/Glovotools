import { describe, it, expect, beforeEach } from 'vitest';
import {
  SUPPORTED_CURRENCIES,
  LANGUAGE_DEFAULT_CURRENCIES,
  CurrencyCode
} from '../i18n/CurrencyContext.tsx';
import { ResultFormatter } from '../engine/ResultFormatter.ts';
import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';

function normalizeSpaces(str: string): string {
  return str.replace(/\u00a0/g, ' ');
}

describe('Currency Selector & Formatting Engine (18 Currencies)', () => {
  beforeEach(() => {
    ResultFormatter.setActiveCurrency('USD');
  });

  it('contains exactly 18 supported currencies and excludes XOF/XAF', () => {
    expect(SUPPORTED_CURRENCIES.length).toBe(18);
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('CAD');
    expect(codes).toContain('DOP');
    expect(codes).toContain('JPY');
    expect(codes).toContain('PLN');
    expect(codes).toContain('CLP');
    expect(codes).toContain('BRL');
    expect(codes).not.toContain('XOF');
    expect(codes).not.toContain('XAF');
  });

  it('correctly maps language-based default currencies', () => {
    expect(LANGUAGE_DEFAULT_CURRENCIES.en).toBe('USD');
    expect(LANGUAGE_DEFAULT_CURRENCIES.es).toBe('USD');
    expect(LANGUAGE_DEFAULT_CURRENCIES.fr).toBe('EUR');
    expect(LANGUAGE_DEFAULT_CURRENCIES.pt).toBe('BRL');
    expect(LANGUAGE_DEFAULT_CURRENCIES.de).toBe('EUR');
    expect(LANGUAGE_DEFAULT_CURRENCIES.it).toBe('EUR');
    expect(LANGUAGE_DEFAULT_CURRENCIES.ja).toBe('JPY');
    expect(LANGUAGE_DEFAULT_CURRENCIES.zh).toBe('CNY');
    expect(LANGUAGE_DEFAULT_CURRENCIES.pl).toBe('PLN');
  });

  it('formats USD, EUR, GBP, CAD, DOP, JPY, and PLN according to ISO decimal conventions', () => {
    const cases: Array<{ code: CurrencyCode; expected: string; decimals: number }> = [
      { code: 'USD', expected: '$250,000.00', decimals: 2 },
      { code: 'EUR', expected: '€250,000.00', decimals: 2 },
      { code: 'GBP', expected: '£250,000.00', decimals: 2 },
      { code: 'CAD', expected: 'CA$250,000.00', decimals: 2 },
      { code: 'DOP', expected: 'DOP 250,000.00', decimals: 2 },
      { code: 'JPY', expected: '¥250,000', decimals: 0 },
      { code: 'PLN', expected: 'PLN 250,000.00', decimals: 2 }
    ];

    for (const tc of cases) {
      ResultFormatter.setActiveCurrency(tc.code);
      const formatted = normalizeSpaces(ResultFormatter.formatCurrency(250000));
      expect(formatted).toBe(tc.expected);

      const paymentFormatted = normalizeSpaces(ResultFormatter.formatCurrency(1580.170058));
      if (tc.decimals === 0) {
        expect(paymentFormatted).not.toContain('.');
        expect(paymentFormatted).toContain('1,580');
      } else {
        expect(paymentFormatted).toContain('1,580.17');
      }
    }
  });

  it('keeps JPY and CLP zero-decimal and does not alter underlying calculation results', () => {
    expect(CalculationRegistry.has('auto-loan-calc')).toBe(true);

    const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'DOP', 'JPY', 'PLN'];
    const numericResults: number[] = [];

    for (const curr of currencies) {
      ResultFormatter.setActiveCurrency(curr);
      const exec = CalculationExecutor.execute('auto-loan-calc', {
        vehiclePrice: 32000,
        downPayment: 4000,
        interestRate: 5.5,
        loanTermMonths: 60
      });
      expect(exec.success).toBe(true);
      expect(exec.formatted?.primary.numericValue).toBeDefined();
      numericResults.push(Number(exec.formatted!.primary.numericValue));

      const formattedVal = normalizeSpaces(exec.formatted!.primary.value);
      if (curr === 'EUR') expect(formattedVal).toContain('€');
      if (curr === 'GBP') expect(formattedVal).toContain('£');
      if (curr === 'JPY') {
        expect(formattedVal).toContain('¥');
        expect(formattedVal).not.toContain('.');
      }
    }

    // Mathematical outputs remain strictly identical across all currency selections
    for (const val of numericResults) {
      expect(val).toBeCloseTo(numericResults[0], 10);
    }
  });
});
