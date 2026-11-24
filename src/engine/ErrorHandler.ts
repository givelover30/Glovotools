import { CalculationError, ErrorCode, ExecutionResult } from './types.ts';
import { CalculatorId } from '../types.ts';

export class ErrorHandler {
  /**
   * Create standardized CalculationError
   */
  public static create(code: ErrorCode, message: string, field?: string, invalidValue?: unknown): CalculationError {
    return {
      field,
      code,
      message,
      invalidValue
    };
  }

  public static createError(code: ErrorCode, message: string, field?: string, invalidValue?: unknown): CalculationError {
    return this.create(code, message, field, invalidValue);
  }

  /**
   * Convert an unknown error or exception into a CalculationError
   */
  public static handleExecutionError(err: unknown, field?: string): CalculationError {
    const msg = err instanceof Error ? err.message : String(err);
    return this.create('CALCULATION_EXECUTION_FAILED', `Execution failed: ${msg}`, field);
  }

  /**
   * Format execution failure into standardized ExecutionResult
   */
  public static formatFailure<TResult = unknown>(
    calculatorId: CalculatorId,
    errors: CalculationError[],
    executionTimeMs = 0
  ): ExecutionResult<TResult> {
    return {
      success: false,
      calculatorId,
      errors,
      executionTimeMs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Safely execute a calculation block with try/catch and domain safety.
   * Supports both (fn) and (calculatorId, fn).
   */
  public static safeExecute<TResult>(
    idOrFn: CalculatorId | (() => TResult),
    maybeFn?: () => TResult
  ): { success: boolean; data?: TResult; error?: CalculationError; errors?: CalculationError[] } {
    const fn = typeof idOrFn === 'function' ? idOrFn : maybeFn;
    if (!fn) {
      const err = this.create('CALCULATION_EXECUTION_FAILED', 'No function provided to safeExecute');
      return { success: false, error: err, errors: [err] };
    }

    try {
      const data = fn();
      return { success: true, data };
    } catch (err: unknown) {
      const calcErr = this.handleExecutionError(err);
      return {
        success: false,
        error: calcErr,
        errors: [calcErr]
      };
    }
  }
}
