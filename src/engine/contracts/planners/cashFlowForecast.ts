import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';
import { addMonthsToYearMonth } from './debtAmortization.ts';

export type CashFlowDirection = 'inflow' | 'outflow';
export type CashFlowFrequency = 'monthly' | 'one-time';
export type CashFlowScenarioMode = 'base' | 'optimistic' | 'conservative';

export interface CashFlowLineItem {
  id: string;
  name: string;
  direction: CashFlowDirection;
  category: string;
  amount: number;
  frequency: CashFlowFrequency;
  startMonth: number; // 1-indexed relative to forecast
  endMonth?: number | null; // inclusive, null means through horizon
}

export interface CashFlowForecastInput {
  businessName: string;
  openingCashBalance: number;
  horizonMonths: number;
  startYearMonth: string; // YYYY-MM
  scenario: CashFlowScenarioMode;
  items: CashFlowLineItem[];
}

export interface CashFlowMonthRow {
  month: number;
  dateLabel: string;
  openingCash: number;
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  endingCash: number;
  isNegativeCash: boolean;
}

export interface CashFlowScenarioSummary {
  scenario: CashFlowScenarioMode;
  endingCashBalance: number;
  totalInflows: number;
  totalOutflows: number;
  cumulativeNetCashFlow: number;
  lowestCashBalance: number;
  lowestCashMonthLabel: string;
  negativeCashMonths: number;
  averageMonthlyBurnOrSurplus: number;
  schedule: CashFlowMonthRow[];
}

export interface CashFlowForecastResult {
  businessName: string;
  openingCashBalance: number;
  horizonMonths: number;
  selectedScenario: CashFlowScenarioSummary;
  baseScenario: CashFlowScenarioSummary;
  optimisticScenario: CashFlowScenarioSummary;
  conservativeScenario: CashFlowScenarioSummary;
}

export const DEFAULT_CASH_FLOW_ITEMS: CashFlowLineItem[] = [
  { id: 'cf-1', name: 'Core Client Retainers / Sales', direction: 'inflow', category: 'Revenue', amount: 14500, frequency: 'monthly', startMonth: 1, endMonth: null },
  { id: 'cf-2', name: 'Q2 Seasonal Project Milestone', direction: 'inflow', category: 'Project Fee', amount: 6500, frequency: 'one-time', startMonth: 3, endMonth: 3 },
  { id: 'cf-3', name: 'Payroll & Contractors', direction: 'outflow', category: 'Team', amount: 8200, frequency: 'monthly', startMonth: 1, endMonth: null },
  { id: 'cf-4', name: 'Rent, Software & Utilities', direction: 'outflow', category: 'Operating', amount: 2800, frequency: 'monthly', startMonth: 1, endMonth: null },
  { id: 'cf-5', name: 'Marketing & Equipment Upgrade', direction: 'outflow', category: 'Growth', amount: 4500, frequency: 'one-time', startMonth: 2, endMonth: 2 }
];

const YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

function getScenarioFactors(mode: CashFlowScenarioMode): { inflowMult: number; outflowMult: number } {
  if (mode === 'optimistic') return { inflowMult: 1.1, outflowMult: 0.95 };
  if (mode === 'conservative') return { inflowMult: 0.85, outflowMult: 1.1 };
  return { inflowMult: 1.0, outflowMult: 1.0 };
}

export function validateCashFlowInput(input: CashFlowForecastInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.openingCashBalance)) {
    errors.push({
      field: 'openingCashBalance',
      code: 'INVALID_NUMERIC_VALUE',
      message: 'Opening cash balance must be a valid number.',
      invalidValue: input.openingCashBalance
    });
  }
  if (
    !Number.isFinite(input.horizonMonths) ||
    !Number.isInteger(input.horizonMonths) ||
    input.horizonMonths < 1 ||
    input.horizonMonths > 36
  ) {
    errors.push({
      field: 'horizonMonths',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Forecast horizon must be a whole number between 1 and 36 months.',
      invalidValue: input.horizonMonths
    });
  }
  if (!YEAR_MONTH_REGEX.test(input.startYearMonth)) {
    errors.push({
      field: 'startYearMonth',
      code: 'INVALID_DATE',
      message: 'Start month must be formatted as YYYY-MM.',
      invalidValue: input.startYearMonth
    });
  }

  for (const item of input.items) {
    if (!item.name || item.name.trim() === '') {
      errors.push({
        field: 'items',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'Every cash flow line item must have a name.'
      });
    }
    if (!Number.isFinite(item.amount) || item.amount < 0) {
      errors.push({
        field: 'items',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Line item "${item.name || item.id}" amount cannot be negative.`,
        invalidValue: item.amount
      });
    }
    if (!Number.isFinite(item.startMonth) || item.startMonth < 1) {
      errors.push({
        field: 'items',
        code: 'RANGE_OUT_OF_BOUNDS',
        message: `Line item "${item.name || item.id}" start month must be >= 1.`,
        invalidValue: item.startMonth
      });
    }
  }

  return errors;
}

export function simulateCashFlowScenario(
  input: CashFlowForecastInput,
  mode: CashFlowScenarioMode
): CashFlowScenarioSummary {
  const { inflowMult, outflowMult } = getScenarioFactors(mode);
  const schedule: CashFlowMonthRow[] = [];

  let runningCash = input.openingCashBalance;
  let totalInflowsAll = 0;
  let totalOutflowsAll = 0;
  let lowestCash = input.openingCashBalance;
  let lowestLabel = input.startYearMonth;
  let negativeCashMonths = 0;

  for (let m = 1; m <= input.horizonMonths; m++) {
    const openingCash = PrecisionEngine.roundFinancial(runningCash);
    let monthInflows = 0;
    let monthOutflows = 0;

    for (const item of input.items) {
      const applies =
        item.frequency === 'one-time'
          ? m === item.startMonth
          : m >= item.startMonth && (item.endMonth == null || m <= item.endMonth);

      if (!applies) continue;

      if (item.direction === 'inflow') {
        monthInflows += item.amount * inflowMult;
      } else {
        monthOutflows += item.amount * outflowMult;
      }
    }

    monthInflows = PrecisionEngine.roundFinancial(monthInflows);
    monthOutflows = PrecisionEngine.roundFinancial(monthOutflows);
    const netCashFlow = PrecisionEngine.roundFinancial(monthInflows - monthOutflows);
    const endingCash = PrecisionEngine.roundFinancial(openingCash + netCashFlow);
    const dateLabel = addMonthsToYearMonth(input.startYearMonth, m - 1);

    if (endingCash < lowestCash) {
      lowestCash = endingCash;
      lowestLabel = dateLabel;
    }
    if (endingCash < 0) {
      negativeCashMonths++;
    }

    totalInflowsAll += monthInflows;
    totalOutflowsAll += monthOutflows;
    runningCash = endingCash;

    schedule.push({
      month: m,
      dateLabel,
      openingCash,
      totalInflows: monthInflows,
      totalOutflows: monthOutflows,
      netCashFlow,
      endingCash,
      isNegativeCash: endingCash < 0
    });
  }

  const cumulativeNetCashFlow = PrecisionEngine.roundFinancial(
    totalInflowsAll - totalOutflowsAll
  );

  return {
    scenario: mode,
    endingCashBalance: PrecisionEngine.roundFinancial(runningCash),
    totalInflows: PrecisionEngine.roundFinancial(totalInflowsAll),
    totalOutflows: PrecisionEngine.roundFinancial(totalOutflowsAll),
    cumulativeNetCashFlow,
    lowestCashBalance: PrecisionEngine.roundFinancial(lowestCash),
    lowestCashMonthLabel: lowestLabel,
    negativeCashMonths,
    averageMonthlyBurnOrSurplus: PrecisionEngine.roundFinancial(
      cumulativeNetCashFlow / Math.max(1, input.horizonMonths)
    ),
    schedule
  };
}

export function analyzeCashFlowForecast(input: CashFlowForecastInput): CashFlowForecastResult {
  const errors = validateCashFlowInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const baseScenario = simulateCashFlowScenario(input, 'base');
  const optimisticScenario = simulateCashFlowScenario(input, 'optimistic');
  const conservativeScenario = simulateCashFlowScenario(input, 'conservative');

  const selectedScenario =
    input.scenario === 'optimistic'
      ? optimisticScenario
      : input.scenario === 'conservative'
      ? conservativeScenario
      : baseScenario;

  return {
    businessName: input.businessName.trim() || 'Business Cash Flow Forecast',
    openingCashBalance: PrecisionEngine.roundFinancial(input.openingCashBalance),
    horizonMonths: input.horizonMonths,
    selectedScenario,
    baseScenario,
    optimisticScenario,
    conservativeScenario
  };
}

export interface CashFlowContractInput {
  businessName?: string;
  openingCashBalance: number;
  monthlyRecurringInflow?: number;
  monthlyRecurringOutflow?: number;
  horizonMonths: number;
  startYearMonth?: string;
  scenario?: CashFlowScenarioMode;
  items?: CashFlowLineItem[];
}

function coerceCashFlowContractInput(raw: CashFlowContractInput): CashFlowForecastInput {
  const items: CashFlowLineItem[] = Array.isArray(raw.items)
    ? raw.items
    : [
        {
          id: 'in-1',
          name: 'Monthly Revenue',
          direction: 'inflow',
          category: 'Revenue',
          amount: Number(raw.monthlyRecurringInflow ?? 14500),
          frequency: 'monthly',
          startMonth: 1,
          endMonth: null
        },
        {
          id: 'out-1',
          name: 'Monthly Operating Costs',
          direction: 'outflow',
          category: 'Operating',
          amount: Number(raw.monthlyRecurringOutflow ?? 11000),
          frequency: 'monthly',
          startMonth: 1,
          endMonth: null
        }
      ];

  return {
    businessName: raw.businessName || 'Business Cash Flow Forecast',
    openingCashBalance: Number(raw.openingCashBalance ?? 25000),
    horizonMonths: Number(raw.horizonMonths ?? 12),
    startYearMonth: raw.startYearMonth || '2026-11',
    scenario: raw.scenario || 'base',
    items
  };
}

export const CASH_FLOW_FORECAST_PLANNER_CONTRACT: CalculationContract<
  CashFlowContractInput,
  CashFlowForecastResult
> = {
  id: 'cash-flow-forecast-planner',
  name: 'Business Cash Flow Forecast & Scenario Planner',
  category: 'planners',
  subcategoryId: 'p15d-sub-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Multi-Month Opening + Inflow - Outflow Cash Roll-Forward with Scenarios',
    formulaExpression:
      'EndingCash_m = OpeningCash_m + Inflows_m - Outflows_m; OpeningCash_{m+1} = EndingCash_m',
    variables: [
      { symbol: 'OpeningCash_m', name: 'Cash Balance Entering Month m', unit: '$' },
      { symbol: 'Inflows_m', name: 'Monthly Scenario-Adjusted Inflows', unit: '$' },
      { symbol: 'Outflows_m', name: 'Monthly Scenario-Adjusted Outflows', unit: '$' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'openingCashBalance', label: 'Opening Cash Balance ($)', type: 'currency', required: true, defaultValue: 25000 },
      { name: 'monthlyRecurringInflow', label: 'Monthly Inflows ($)', type: 'currency', required: true, defaultValue: 14500, min: 0 },
      { name: 'monthlyRecurringOutflow', label: 'Monthly Outflows ($)', type: 'currency', required: true, defaultValue: 11000, min: 0 },
      { name: 'horizonMonths', label: 'Forecast Horizon (Months)', type: 'integer', required: true, defaultValue: 12, min: 1, max: 36 },
      {
        name: 'scenario',
        label: 'Scenario',
        type: 'select',
        required: false,
        defaultValue: 'base',
        options: [
          { label: 'Base Case (100% / 100%)', value: 'base' },
          { label: 'Optimistic (+10% In / -5% Out)', value: 'optimistic' },
          { label: 'Conservative (-15% In / +10% Out)', value: 'conservative' }
        ]
      }
    ]
  },
  validate: (inputs) => validateCashFlowInput(coerceCashFlowContractInput(inputs)),
  calculate: (inputs) => analyzeCashFlowForecast(coerceCashFlowContractInput(inputs)),
  formatResult: (res) => ({
    primary: {
      label: `Projected Ending Cash (${res.horizonMonths} mo)`,
      value: ResultFormatter.formatCurrency(res.selectedScenario.endingCashBalance),
      numericValue: res.selectedScenario.endingCashBalance
    },
    secondary: [
      {
        label: 'Cumulative Net Cash Flow',
        value: ResultFormatter.formatCurrency(res.selectedScenario.cumulativeNetCashFlow),
        numericValue: res.selectedScenario.cumulativeNetCashFlow
      },
      {
        label: 'Lowest Cash Trough',
        value: `${ResultFormatter.formatCurrency(res.selectedScenario.lowestCashBalance)} (${res.selectedScenario.lowestCashMonthLabel})`,
        numericValue: res.selectedScenario.lowestCashBalance
      }
    ],
    breakdown: [
      { label: 'Opening Cash', value: ResultFormatter.formatCurrency(res.openingCashBalance) },
      { label: 'Total Projected Inflows', value: ResultFormatter.formatCurrency(res.selectedScenario.totalInflows) },
      { label: 'Total Projected Outflows', value: ResultFormatter.formatCurrency(res.selectedScenario.totalOutflows) },
      { label: 'Negative Cash Months', value: String(res.selectedScenario.negativeCashMonths) },
      { label: 'Conservative Ending Cash', value: ResultFormatter.formatCurrency(res.conservativeScenario.endingCashBalance) }
    ]
  })
};
