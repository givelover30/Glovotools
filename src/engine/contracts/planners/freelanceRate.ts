import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export interface FreelanceRateInput {
  desiredAnnualIncome: number;
  annualExpenses: number;
  taxReservePct: number;
  profitMarginPct: number;
  workingWeeksPerYear: number;
  daysPerWeek: number;
  hoursPerDay: number;
  billableUtilizationPct: number;
}

export interface FreelanceRateResult {
  desiredAnnualIncome: number;
  annualExpenses: number;
  taxReservePct: number;
  taxReserveAmount: number;
  profitMarginPct: number;
  profitBufferAmount: number;
  requiredAnnualRevenue: number;
  totalWorkingDaysPerYear: number;
  totalWorkingHoursPerYear: number;
  annualBillableHours: number;
  nonBillableHours: number;
  targetHourlyRate: number;
  targetBillableDayRate: number;
  targetWorkingDayRate: number;
  targetWeeklyRevenue: number;
  targetMonthlyRevenue: number;
  effectiveHourlyTakeHome: number;
}

export function validateFreelanceRateInput(input: FreelanceRateInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.desiredAnnualIncome) || input.desiredAnnualIncome < 0) {
    errors.push({
      field: 'desiredAnnualIncome',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Desired annual net income cannot be negative.',
      invalidValue: input.desiredAnnualIncome
    });
  }
  if (!Number.isFinite(input.annualExpenses) || input.annualExpenses < 0) {
    errors.push({
      field: 'annualExpenses',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Annual business expenses cannot be negative.',
      invalidValue: input.annualExpenses
    });
  }
  if (!Number.isFinite(input.taxReservePct) || input.taxReservePct < 0 || input.taxReservePct > 70) {
    errors.push({
      field: 'taxReservePct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Tax reserve percentage must be between 0% and 70%.',
      invalidValue: input.taxReservePct
    });
  }
  if (!Number.isFinite(input.profitMarginPct) || input.profitMarginPct < 0 || input.profitMarginPct > 60) {
    errors.push({
      field: 'profitMarginPct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Profit reserve percentage must be between 0% and 60%.',
      invalidValue: input.profitMarginPct
    });
  }
  if (
    Number.isFinite(input.taxReservePct) &&
    Number.isFinite(input.profitMarginPct) &&
    input.taxReservePct + input.profitMarginPct >= 95
  ) {
    errors.push({
      field: 'taxReservePct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Combined tax reserve and profit reserve percentages must remain below 95%.',
      invalidValue: input.taxReservePct + input.profitMarginPct
    });
  }
  if (
    !Number.isFinite(input.workingWeeksPerYear) ||
    input.workingWeeksPerYear < 1 ||
    input.workingWeeksPerYear > 52
  ) {
    errors.push({
      field: 'workingWeeksPerYear',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Working weeks per year must be between 1 and 52.',
      invalidValue: input.workingWeeksPerYear
    });
  }
  if (!Number.isFinite(input.daysPerWeek) || input.daysPerWeek < 1 || input.daysPerWeek > 7) {
    errors.push({
      field: 'daysPerWeek',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Working days per week must be between 1 and 7.',
      invalidValue: input.daysPerWeek
    });
  }
  if (!Number.isFinite(input.hoursPerDay) || input.hoursPerDay <= 0 || input.hoursPerDay > 16) {
    errors.push({
      field: 'hoursPerDay',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Hours per working day must be greater than 0 and up to 16.',
      invalidValue: input.hoursPerDay
    });
  }
  if (
    !Number.isFinite(input.billableUtilizationPct) ||
    input.billableUtilizationPct < 5 ||
    input.billableUtilizationPct > 100
  ) {
    errors.push({
      field: 'billableUtilizationPct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Billable utilization must be between 5% and 100%.',
      invalidValue: input.billableUtilizationPct
    });
  }

  return errors;
}

export function calculateFreelanceRate(input: FreelanceRateInput): FreelanceRateResult {
  const errors = validateFreelanceRateInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const reserveFraction = (input.taxReservePct + input.profitMarginPct) / 100;
  const operatingPlusDesired = input.desiredAnnualIncome + input.annualExpenses;
  const requiredAnnualRevenue = PrecisionEngine.roundFinancial(
    operatingPlusDesired / (1 - reserveFraction)
  );

  const taxReserveAmount = PrecisionEngine.roundFinancial(
    requiredAnnualRevenue * (input.taxReservePct / 100)
  );
  const profitBufferAmount = PrecisionEngine.roundFinancial(
    requiredAnnualRevenue * (input.profitMarginPct / 100)
  );

  const totalWorkingDaysPerYear = PrecisionEngine.roundTo(
    input.workingWeeksPerYear * input.daysPerWeek,
    2
  );
  const totalWorkingHoursPerYear = PrecisionEngine.roundTo(
    totalWorkingDaysPerYear * input.hoursPerDay,
    2
  );
  const annualBillableHours = PrecisionEngine.roundTo(
    totalWorkingHoursPerYear * (input.billableUtilizationPct / 100),
    2
  );
  const nonBillableHours = PrecisionEngine.roundTo(
    Math.max(0, totalWorkingHoursPerYear - annualBillableHours),
    2
  );

  const targetHourlyRate = PrecisionEngine.roundFinancial(
    annualBillableHours > 0 ? requiredAnnualRevenue / annualBillableHours : 0
  );
  const targetBillableDayRate = PrecisionEngine.roundFinancial(targetHourlyRate * input.hoursPerDay);
  const targetWorkingDayRate = PrecisionEngine.roundFinancial(
    totalWorkingDaysPerYear > 0 ? requiredAnnualRevenue / totalWorkingDaysPerYear : 0
  );
  const targetWeeklyRevenue = PrecisionEngine.roundFinancial(
    requiredAnnualRevenue / input.workingWeeksPerYear
  );
  const targetMonthlyRevenue = PrecisionEngine.roundFinancial(requiredAnnualRevenue / 12);
  const effectiveHourlyTakeHome = PrecisionEngine.roundFinancial(
    totalWorkingHoursPerYear > 0 ? input.desiredAnnualIncome / totalWorkingHoursPerYear : 0
  );

  return {
    desiredAnnualIncome: PrecisionEngine.roundFinancial(input.desiredAnnualIncome),
    annualExpenses: PrecisionEngine.roundFinancial(input.annualExpenses),
    taxReservePct: input.taxReservePct,
    taxReserveAmount,
    profitMarginPct: input.profitMarginPct,
    profitBufferAmount,
    requiredAnnualRevenue,
    totalWorkingDaysPerYear,
    totalWorkingHoursPerYear,
    annualBillableHours,
    nonBillableHours,
    targetHourlyRate,
    targetBillableDayRate,
    targetWorkingDayRate,
    targetWeeklyRevenue,
    targetMonthlyRevenue,
    effectiveHourlyTakeHome
  };
}

export const FREELANCE_RATE_PLANNER_CONTRACT: CalculationContract<
  FreelanceRateInput,
  FreelanceRateResult
> = {
  id: 'freelance-rate-planner',
  name: 'Freelancer Hourly Rate & Billable Hours Planner',
  category: 'planners',
  subcategoryId: 'p12-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Billable Rate Target with Tax Reserve, Overhead & Utilization',
    formulaExpression:
      'RequiredRevenue = (Income + Expenses) / (1 - TaxPct - ProfitPct); HourlyRate = RequiredRevenue / (Weeks * Days * Hours * UtilizationPct)',
    variables: [
      { symbol: 'Income', name: 'Desired Annual Compensation', unit: '$' },
      { symbol: 'Expenses', name: 'Annual Business Overhead', unit: '$' },
      { symbol: 'UtilizationPct', name: 'Billable Time Utilization', unit: '%' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'desiredAnnualIncome', label: 'Desired Annual Compensation ($)', type: 'currency', required: true, defaultValue: 75000, min: 0 },
      { name: 'annualExpenses', label: 'Annual Business Expenses ($)', type: 'currency', required: true, defaultValue: 9600, min: 0 },
      { name: 'taxReservePct', label: 'Tax Reserve Target (%)', type: 'percentage', required: true, defaultValue: 25, min: 0, max: 70 },
      { name: 'profitMarginPct', label: 'Profit / Contingency Buffer (%)', type: 'percentage', required: true, defaultValue: 10, min: 0, max: 60 },
      { name: 'workingWeeksPerYear', label: 'Working Weeks / Year', type: 'number', required: true, defaultValue: 48, min: 1, max: 52 },
      { name: 'daysPerWeek', label: 'Working Days / Week', type: 'number', required: true, defaultValue: 5, min: 1, max: 7 },
      { name: 'hoursPerDay', label: 'Hours / Working Day', type: 'number', required: true, defaultValue: 8, min: 1, max: 16 },
      { name: 'billableUtilizationPct', label: 'Billable Utilization (%)', type: 'percentage', required: true, defaultValue: 65, min: 5, max: 100 }
    ]
  },
  validate: (inputs) => validateFreelanceRateInput(inputs),
  calculate: (inputs) => calculateFreelanceRate(inputs),
  formatResult: (res) => ({
    primary: {
      label: 'Target Billable Hourly Rate',
      value: ResultFormatter.formatCurrency(res.targetHourlyRate),
      numericValue: res.targetHourlyRate,
      unit: '/hr'
    },
    secondary: [
      {
        label: 'Required Annual Revenue',
        value: ResultFormatter.formatCurrency(res.requiredAnnualRevenue),
        numericValue: res.requiredAnnualRevenue
      },
      {
        label: 'Target Billable Day Rate',
        value: ResultFormatter.formatCurrency(res.targetBillableDayRate),
        numericValue: res.targetBillableDayRate
      }
    ],
    breakdown: [
      { label: 'Monthly Revenue Target', value: ResultFormatter.formatCurrency(res.targetMonthlyRevenue) },
      { label: 'Weekly Revenue Target', value: ResultFormatter.formatCurrency(res.targetWeeklyRevenue) },
      { label: 'Annual Billable Hours', value: `${res.annualBillableHours} hrs` },
      { label: 'Tax Reserve Set-Aside', value: ResultFormatter.formatCurrency(res.taxReserveAmount) },
      { label: 'Profit / Buffer Reserve', value: ResultFormatter.formatCurrency(res.profitBufferAmount) }
    ]
  })
};
