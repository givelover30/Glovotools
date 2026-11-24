import { PrecisionEngine } from './PrecisionEngine.ts';
import { UnitHandler } from './UnitHandler.ts';

export class ResultFormatter {
  /**
   * Format a numerical value as standard localized decimal
   */
  public static formatDecimal(value: number, decimals = 2): string {
    if (!PrecisionEngine.isValidNumber(value)) return 'N/A';
    const cleaned = PrecisionEngine.clean(value);
    // If value is extremely large or small, route to scientific notation
    if (Math.abs(cleaned) >= 1e12 || (Math.abs(cleaned) > 0 && Math.abs(cleaned) < 1e-6)) {
      return this.formatScientific(cleaned, decimals);
    }
    return cleaned.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }

  private static activeCurrency: string = 'USD';

  public static setActiveCurrency(code: string) {
    this.activeCurrency = code;
  }

  public static getActiveCurrency(): string {
    return this.activeCurrency;
  }

  /**
   * Format as active currency using Intl.NumberFormat
   */
  public static formatCurrency(
    value: number,
    currency?: string,
    options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
  ): string {
    const code = currency || this.activeCurrency || 'USD';
    if (!PrecisionEngine.isValidNumber(value)) {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          ...options
        }).format(0);
      } catch {
        return '$0.00';
      }
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        ...options
      }).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
  }

  /**
   * Format as percentage (%)
   */
  public static formatPercentage(value: number, decimals = 2, appendSymbol = true): string {
    if (!PrecisionEngine.isValidNumber(value)) return '0%';
    const formatted = this.formatDecimal(value, decimals);
    return appendSymbol ? `${formatted}%` : formatted;
  }

  /**
   * Format as scientific notation (e.g., 1.25e+8)
   */
  public static formatScientific(value: number, decimals = 4): string {
    if (!PrecisionEngine.isValidNumber(value)) return '0';
    return value.toExponential(decimals);
  }

  /**
   * Format with measurement unit label
   */
  public static formatWithUnit(value: number, unit: string, decimals = 2): string {
    const symbol = UnitHandler.getDisplaySymbol(unit);
    const formattedNum = this.formatDecimal(value, decimals);
    return `${formattedNum} ${symbol}`;
  }

  /**
   * Format integer count
   */
  public static formatInteger(value: number): string {
    if (!PrecisionEngine.isValidNumber(value)) return '0';
    return Math.round(value).toLocaleString('en-US');
  }
}
