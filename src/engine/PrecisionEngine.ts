export class PrecisionEngine {
  private static readonly DEFAULT_EPSILON = 1e-10;

  /**
   * Eliminates floating point binary artifacts (e.g., 0.1 + 0.2 = 0.30000000000000004 -> 0.3)
   */
  public static clean(value: number): number {
    if (!Number.isFinite(value)) return value;
    // Round to 12 decimal places to clear binary representation noise without losing precision
    return Number(Math.round(Number(value + 'e+12')) + 'e-12');
  }

  /**
   * Round to a specified decimal places using exponential notation to avoid midpoint rounding errors
   */
  public static roundTo(value: number, decimals = 2): number {
    if (!Number.isFinite(value)) return value;
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Financial currency rounding (half up to 2 decimal places)
   */
  public static roundFinancial(value: number): number {
    return this.roundTo(value, 2);
  }

  /**
   * Format or round to specific significant figures
   */
  public static toSignificantFigures(value: number, sigFigs = 4): number {
    if (!Number.isFinite(value) || value === 0) return 0;
    return Number(value.toPrecision(sigFigs));
  }

  /**
   * Determine whether two floating-point numbers are equal within a specified epsilon
   */
  public static approxEqual(a: number, b: number, epsilon = this.DEFAULT_EPSILON): boolean {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
    return Math.abs(a - b) <= epsilon;
  }

  /**
   * Safe division with zero detection and optional fallback
   */
  public static safeDivide(numerator: number, denominator: number, fallback = 0): number {
    if (Math.abs(denominator) < this.DEFAULT_EPSILON) {
      return fallback;
    }
    return this.clean(numerator / denominator);
  }

  /**
   * Safe clamp between minimum and maximum bounds
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Check if a number is valid (finite real number)
   */
  public static isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
  }
}
