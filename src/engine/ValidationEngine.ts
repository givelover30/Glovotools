import { CalculationError, InputSchema } from './types.ts';
import { PrecisionEngine } from './PrecisionEngine.ts';

export class ValidationEngine {
  /**
   * Validate an input value against an individual field requirement
   */
  public static validateRequired(field: string, value: unknown): CalculationError | null {
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      return {
        field,
        code: 'REQUIRED_FIELD_MISSING',
        message: `Field "${field}" is required.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate that an input is a finite real number
   */
  public static validateNumeric(field: string, value: unknown): CalculationError | null {
    if (value === undefined || value === null || value === '') return null; // Let required check handle empty
    if (Array.isArray(value)) {
      const allValid = value.every((item) => PrecisionEngine.isValidNumber(typeof item === 'number' ? item : Number(item)));
      if (!allValid || value.length === 0) {
        return {
          field,
          code: 'INVALID_NUMERIC_VALUE',
          message: `Field "${field}" must contain valid numeric values.`,
          invalidValue: value
        };
      }
      return null;
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (!PrecisionEngine.isValidNumber(num)) {
      return {
        field,
        code: 'INVALID_NUMERIC_VALUE',
        message: `Field "${field}" must be a valid numeric value.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate integer constraint
   */
  public static validateInteger(field: string, value: number): CalculationError | null {
    if (!Number.isInteger(value)) {
      return {
        field,
        code: 'INTEGER_REQUIRED',
        message: `Field "${field}" must be an integer.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate strictly positive (> 0)
   */
  public static validatePositive(field: string, value: number): CalculationError | null {
    if (value <= 0) {
      return {
        field,
        code: 'POSITIVE_NUMBER_REQUIRED',
        message: `Field "${field}" must be strictly greater than 0.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate non-negative (>= 0)
   */
  public static validateNonNegative(field: string, value: number): CalculationError | null {
    if (value < 0) {
      return {
        field,
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Field "${field}" cannot be negative.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate min/max range
   */
  public static validateRange(field: string, value: number, min?: number, max?: number): CalculationError | null {
    if (min !== undefined && value < min) {
      return {
        field,
        code: 'RANGE_OUT_OF_BOUNDS',
        message: `Field "${field}" must be at least ${min}.`,
        invalidValue: value
      };
    }
    if (max !== undefined && value > max) {
      return {
        field,
        code: 'RANGE_OUT_OF_BOUNDS',
        message: `Field "${field}" cannot exceed ${max}.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate percentage (0 to 100)
   */
  public static validatePercentage(field: string, value: number, allowExceed100 = false): CalculationError | null {
    if (value < 0 || (!allowExceed100 && value > 100)) {
      return {
        field,
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: `Field "${field}" must be a valid percentage between 0% and ${allowExceed100 ? 'infinity' : '100%'}.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate divisor is non-zero
   */
  public static validateNonZero(field: string, divisor: number, operation = 'division'): CalculationError | null {
    if (Math.abs(divisor) < 1e-12) {
      return {
        field,
        code: 'DIVISION_BY_ZERO',
        message: `Cannot perform ${operation} with zero in denominator.`,
        invalidValue: divisor
      };
    }
    return null;
  }

  /**
   * Validate mathematical domain (e.g. log(x) requires x > 0)
   */
  public static validateLogDomain(field: string, value: number): CalculationError | null {
    if (value <= 0) {
      return {
        field,
        code: 'MATHEMATICAL_DOMAIN_ERROR',
        message: `Logarithm input for "${field}" must be strictly greater than 0.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate date string / object
   */
  public static validateDate(field: string, value: string | Date): CalculationError | null {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return {
        field,
        code: 'INVALID_DATE',
        message: `Field "${field}" must be a valid calendar date.`,
        invalidValue: value
      };
    }
    return null;
  }

  /**
   * Validate start date <= end date
   */
  public static validateDateOrder(startField: string, startDate: string | Date, endField: string, endDate: string | Date): CalculationError | null {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (d1.getTime() > d2.getTime()) {
      return {
        field: startField,
        code: 'DATE_ORDER_INVALID',
        message: `Start date "${startField}" cannot be after end date "${endField}".`,
        invalidValue: { startDate, endDate }
      };
    }
    return null;
  }

  /**
   * Validate inputs against an entire schema definition
   */
  public static validateSchema(schema: InputSchema, inputs: Record<string, unknown>): CalculationError[] {
    const errors: CalculationError[] = [];

    for (const field of schema.fields) {
      const val = inputs[field.name];

      // 1. Required check
      if (field.required) {
        const reqErr = this.validateRequired(field.name, val);
        if (reqErr) {
          errors.push(reqErr);
          continue;
        }
      }

      // If value is empty and not required, skip further checks
      if (val === undefined || val === null || val === '') continue;

      // 2. Numeric / Type checks
      if (['number', 'integer', 'decimal', 'percentage', 'currency'].includes(field.type)) {
        const numErr = this.validateNumeric(field.name, val);
        if (numErr) {
          errors.push(numErr);
          continue;
        }

        if (Array.isArray(val)) {
          continue; // Array elements already verified
        }

        const numVal = Number(val);

        if (field.type === 'integer') {
          const intErr = this.validateInteger(field.name, numVal);
          if (intErr) errors.push(intErr);
        }

        if (field.type === 'percentage') {
          const pctErr = this.validatePercentage(field.name, numVal, true);
          if (pctErr) errors.push(pctErr);
        }

        // 3. Range check
        const rangeErr = this.validateRange(field.name, numVal, field.min, field.max);
        if (rangeErr) errors.push(rangeErr);
      }

      // 4. Date check
      if (field.type === 'date') {
        const dateErr = this.validateDate(field.name, val as string | Date);
        if (dateErr) errors.push(dateErr);
      }
    }

    return errors;
  }
}
