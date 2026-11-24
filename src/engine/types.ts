import { CalculatorId, CategoryId } from '../types.ts';

export type ErrorCode = 
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_NUMERIC_VALUE'
  | 'NON_NEGATIVE_REQUIRED'
  | 'POSITIVE_NUMBER_REQUIRED'
  | 'INTEGER_REQUIRED'
  | 'RANGE_OUT_OF_BOUNDS'
  | 'PERCENTAGE_OUT_OF_BOUNDS'
  | 'INVALID_DATE'
  | 'DATE_ORDER_INVALID'
  | 'DIVISION_BY_ZERO'
  | 'MATHEMATICAL_DOMAIN_ERROR'
  | 'NUMERICAL_OVERFLOW'
  | 'UNSUPPORTED_OPERATION'
  | 'CALCULATION_EXECUTION_FAILED';

export interface CalculationError {
  field?: string;
  code: ErrorCode;
  message: string;
  invalidValue?: unknown;
}

export type InputFieldType = 
  | 'number'
  | 'integer'
  | 'decimal'
  | 'percentage'
  | 'currency'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'string'
  | 'text';

export interface InputFieldSchema {
  name: string;
  label: string;
  type: InputFieldType;
  required: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  description?: string;
}

export interface InputSchema {
  fields: InputFieldSchema[];
}

export interface FormattedResult {
  primary: {
    label: string;
    value: string;
    numericValue: number | string;
    unit?: string;
  };
  secondary?: Array<{
    label: string;
    value: string;
    numericValue?: number | string;
    unit?: string;
  }>;
  breakdown?: Array<{
    label: string;
    value: string;
    detail?: string;
  }>;
  summaryText?: string;
}

export interface ExecutionResult<TResult = unknown> {
  success: boolean;
  calculatorId: CalculatorId;
  data?: TResult;
  formatted?: FormattedResult;
  errors?: CalculationError[];
  executionTimeMs: number;
  timestamp: string;
}

export type ToolImplementationTier =
  | 'explicit-tested'
  | 'explicit-untested'
  | 'workspace'
  | 'static-guide'
  | 'generic-fallback';

export interface CalculationContract<TInput = Record<string, unknown>, TResult = Record<string, unknown>> {
  id: CalculatorId;
  name: string;
  category: CategoryId;
  subcategoryId: string;
  inputSchema: InputSchema;
  validate: (inputs: TInput) => CalculationError[];
  calculate: (inputs: TInput) => TResult;
  formatResult: (result: TResult, inputs: TInput) => FormattedResult;
  formulaMeta: {
    formulaName: string;
    formulaExpression: string;
    variables: Array<{ symbol: string; name: string; unit?: string }>;
  };
  isSyntheticFallback?: boolean;
  implementationTier?: ToolImplementationTier;
}
