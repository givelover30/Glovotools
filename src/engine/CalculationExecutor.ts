import { CalculatorId } from '../types.ts';
import { ExecutionResult, CalculationContract, CalculationError } from './types.ts';
import { CalculationRegistry } from './CalculationRegistry.ts';
import { ValidationEngine } from './ValidationEngine.ts';
import { ErrorHandler } from './ErrorHandler.ts';

export class CalculationExecutor {
  /**
   * Executes a calculation for a registered calculator ID with provided inputs.
   */
  public static execute<TInput = Record<string, unknown>, TResult = Record<string, unknown>>(
    calculatorId: CalculatorId | string,
    rawInputs: Record<string, unknown>
  ): ExecutionResult<TResult> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const timestamp = new Date().toISOString();

    const contract = CalculationRegistry.get<TInput, TResult>(calculatorId);
    if (!contract) {
      const err = ErrorHandler.create(
        'CALCULATION_EXECUTION_FAILED',
        `Calculator with ID "${calculatorId}" is not registered in the calculation engine.`
      );
      return {
        success: false,
        calculatorId: calculatorId as CalculatorId,
        errors: [err],
        executionTimeMs: 0,
        timestamp
      };
    }

    return this.executeContract(contract, rawInputs, startTime, timestamp);
  }

  /**
   * Executes a contract directly.
   */
  public static executeContract<TInput = Record<string, unknown>, TResult = Record<string, unknown>>(
    contract: CalculationContract<TInput, TResult>,
    rawInputs: Record<string, unknown>,
    startTimeOverride?: number,
    timestampOverride?: string
  ): ExecutionResult<TResult> {
    const startTime = startTimeOverride ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const timestamp = timestampOverride ?? new Date().toISOString();

    // 0. Centralized NaN & Infinity Interception
    const nanInfErrors: CalculationError[] = [];
    for (const [key, val] of Object.entries(rawInputs)) {
      if (typeof val === 'number' && (!Number.isFinite(val) || Number.isNaN(val))) {
        nanInfErrors.push({
          field: key,
          code: 'INVALID_NUMERIC_VALUE',
          message: `Field "${key}" cannot be NaN or Infinity.`,
          invalidValue: val
        });
      }
    }
    if (nanInfErrors.length > 0) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        success: false,
        calculatorId: contract.id,
        errors: nanInfErrors,
        executionTimeMs: Math.round((endTime - startTime) * 1000) / 1000,
        timestamp
      };
    }

    // 1. Schema Validation
    const schemaErrors: CalculationError[] = contract.inputSchema
      ? ValidationEngine.validateSchema(contract.inputSchema, rawInputs)
      : [];

    // 2. Custom Contract Validation (if schema passed)
    let domainErrors: CalculationError[] = [];
    if (schemaErrors.length === 0 && contract.validate) {
      try {
        const res = contract.validate(rawInputs as unknown as TInput);
        if (Array.isArray(res)) {
          domainErrors = res;
        } else if (res && typeof res === 'object' && 'errors' in res && Array.isArray((res as any).errors)) {
          domainErrors = (res as any).errors;
        } else if (res === false) {
          domainErrors = [{ code: 'CALCULATION_EXECUTION_FAILED', message: 'Validation failed' }];
        }
      } catch (valErr) {
        domainErrors = [ErrorHandler.handleExecutionError(valErr)];
      }
    }

    const allErrors = [...schemaErrors, ...domainErrors];
    if (allErrors.length > 0) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        success: false,
        calculatorId: contract.id,
        errors: allErrors,
        executionTimeMs: Math.round((endTime - startTime) * 1000) / 1000,
        timestamp
      };
    }

    // 3. Execution & Formatting within Safe Wrapper
    try {
      const calculatedData = contract.calculate(rawInputs as unknown as TInput);
      const formatted = contract.formatResult
        ? contract.formatResult(calculatedData, rawInputs as unknown as TInput)
        : undefined;

      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        success: true,
        calculatorId: contract.id,
        data: calculatedData,
        formatted,
        executionTimeMs: Math.round((endTime - startTime) * 1000) / 1000,
        timestamp
      };
    } catch (execErr) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const calcError = ErrorHandler.handleExecutionError(execErr);
      return {
        success: false,
        calculatorId: contract.id,
        errors: [calcError],
        executionTimeMs: Math.round((endTime - startTime) * 1000) / 1000,
        timestamp
      };
    }
  }

  /**
   * Executes batch calculations for test suites or parameter sweeps.
   */
  public static executeBatch<TInput = Record<string, unknown>, TResult = Record<string, unknown>>(
    calculatorId: CalculatorId | string,
    inputsList: Record<string, unknown>[]
  ): ExecutionResult<TResult>[] {
    return inputsList.map((inputs) => this.execute<TInput, TResult>(calculatorId, inputs));
  }
}
