import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export interface RetirementPlanInput {
  currentAge: number;
  retireAge: number;
  currentBalance: number;
  currentSalary: number;
  contributionPct: number;
  employerMatchPct: number;
  employerMatchLimit: number;
  salaryIncreasePct: number;
  expectedReturn: number;
  inflationRate: number;
  frequency: number; // 12, 26, 24, 1
  safeWithdrawalRatePct?: number; // default 4.0
}

export interface RetirementScheduleRow {
  year: number;
  age: number;
  salary: number;
  employeeContrib: number;
  employerMatch: number;
  totalContrib: number;
  investmentGrowth: number;
  endingBalance: number;
  inflationAdjustedEndingBalance: number;
}

export interface RetirementPlanResult {
  yearsUntilRetire: number;
  projectedBalance: number;
  inflationAdjustedBalance: number;
  totalEmployeeContrib: number;
  totalEmployerContrib: number;
  totalContributions: number;
  totalInvestmentGrowth: number;
  finalSalary: number;
  monthlyEmployeeContribution: number;
  monthlyEmployerContribution: number;
  safeWithdrawalRatePct: number;
  annualSafeWithdrawalNominal: number;
  monthlySafeWithdrawalNominal: number;
  annualSafeWithdrawalReal: number;
  monthlySafeWithdrawalReal: number;
  schedule: RetirementScheduleRow[];
}

const ALLOWED_FREQUENCIES = new Set([1, 12, 24, 26]);

export function validateRetirementPlanInput(input: RetirementPlanInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.currentAge) || input.currentAge < 16 || input.currentAge > 90) {
    errors.push({
      field: 'currentAge',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Current age must be between 16 and 90.',
      invalidValue: input.currentAge
    });
  }
  if (
    !Number.isFinite(input.retireAge) ||
    input.retireAge <= input.currentAge ||
    input.retireAge > 100
  ) {
    errors.push({
      field: 'retireAge',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Retirement age must be greater than current age and up to 100.',
      invalidValue: input.retireAge
    });
  }
  if (!Number.isFinite(input.currentBalance) || input.currentBalance < 0) {
    errors.push({
      field: 'currentBalance',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Current retirement balance cannot be negative.',
      invalidValue: input.currentBalance
    });
  }
  if (!Number.isFinite(input.currentSalary) || input.currentSalary < 0) {
    errors.push({
      field: 'currentSalary',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Current annual income cannot be negative.',
      invalidValue: input.currentSalary
    });
  }
  if (!Number.isFinite(input.contributionPct) || input.contributionPct < 0 || input.contributionPct > 100) {
    errors.push({
      field: 'contributionPct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Contribution rate must be between 0% and 100%.',
      invalidValue: input.contributionPct
    });
  }
  if (!Number.isFinite(input.employerMatchPct) || input.employerMatchPct < 0 || input.employerMatchPct > 500) {
    errors.push({
      field: 'employerMatchPct',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Employer match rate must be between 0% and 500%.',
      invalidValue: input.employerMatchPct
    });
  }
  if (
    !Number.isFinite(input.employerMatchLimit) ||
    input.employerMatchLimit < 0 ||
    input.employerMatchLimit > 100
  ) {
    errors.push({
      field: 'employerMatchLimit',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Employer match limit must be between 0% and 100%.',
      invalidValue: input.employerMatchLimit
    });
  }
  if (
    !Number.isFinite(input.salaryIncreasePct) ||
    input.salaryIncreasePct < 0 ||
    input.salaryIncreasePct > 25
  ) {
    errors.push({
      field: 'salaryIncreasePct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Annual income growth must be between 0% and 25%.',
      invalidValue: input.salaryIncreasePct
    });
  }
  if (!Number.isFinite(input.expectedReturn) || input.expectedReturn < 0 || input.expectedReturn > 30) {
    errors.push({
      field: 'expectedReturn',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Expected annual return must be between 0% and 30%.',
      invalidValue: input.expectedReturn
    });
  }
  if (!Number.isFinite(input.inflationRate) || input.inflationRate < 0 || input.inflationRate > 20) {
    errors.push({
      field: 'inflationRate',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Inflation rate must be between 0% and 20%.',
      invalidValue: input.inflationRate
    });
  }
  if (!ALLOWED_FREQUENCIES.has(Number(input.frequency))) {
    errors.push({
      field: 'frequency',
      code: 'UNSUPPORTED_OPERATION',
      message: 'Contribution frequency must be 1, 12, 24, or 26 periods per year.',
      invalidValue: input.frequency
    });
  }
  const swr = input.safeWithdrawalRatePct ?? 4;
  if (!Number.isFinite(swr) || swr <= 0 || swr > 15) {
    errors.push({
      field: 'safeWithdrawalRatePct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Withdrawal rate must be greater than 0% and at most 15%.',
      invalidValue: swr
    });
  }

  return errors;
}

export function calculateRetirementPlan(input: RetirementPlanInput): RetirementPlanResult {
  const errors = validateRetirementPlanInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const yearsUntilRetire = Math.max(0, input.retireAge - input.currentAge);
  const periodsPerYear = input.frequency;
  const rAnnual = input.expectedReturn / 100;
  const rPeriod = rAnnual / periodsPerYear;
  const inflationAnnual = input.inflationRate / 100;
  const safeWithdrawalRatePct = input.safeWithdrawalRatePct ?? 4;

  let balance = input.currentBalance;
  let salary = input.currentSalary;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;
  const periods = yearsUntilRetire * periodsPerYear;
  const schedule: RetirementScheduleRow[] = [];

  let yearEmployeeContrib = 0;
  let yearEmployerContrib = 0;
  let yearInvestmentGrowth = 0;

  for (let p = 1; p <= periods; p++) {
    const currentYearNum = Math.floor((p - 1) / periodsPerYear) + 1;
    const isNewYearStart = (p - 1) % periodsPerYear === 0;

    if (isNewYearStart && currentYearNum > 1) {
      salary = salary * (1 + input.salaryIncreasePct / 100);
    }

    const periodSalary = salary / periodsPerYear;
    const empContrib = periodSalary * (input.contributionPct / 100);
    const effectiveMatchPct = Math.min(input.contributionPct, input.employerMatchLimit) / 100;
    const employerContrib = periodSalary * effectiveMatchPct * (input.employerMatchPct / 100);

    const periodContribution = empContrib + employerContrib;
    const periodGrowth = (balance + periodContribution) * rPeriod;
    balance = balance + periodContribution + periodGrowth;

    totalEmployeeContrib += empContrib;
    totalEmployerContrib += employerContrib;
    yearEmployeeContrib += empContrib;
    yearEmployerContrib += employerContrib;
    yearInvestmentGrowth += periodGrowth;

    if (p % periodsPerYear === 0 || p === periods) {
      const yearNum = Math.ceil(p / periodsPerYear);
      const totalContribYear = yearEmployeeContrib + yearEmployerContrib;
      const inflationFactor = Math.pow(1 + inflationAnnual, yearNum);
      schedule.push({
        year: yearNum,
        age: input.currentAge + yearNum,
        salary: Math.round(salary),
        employeeContrib: Math.round(yearEmployeeContrib),
        employerMatch: Math.round(yearEmployerContrib),
        totalContrib: Math.round(totalContribYear),
        investmentGrowth: Math.round(yearInvestmentGrowth),
        endingBalance: Math.round(balance),
        inflationAdjustedEndingBalance: Math.round(balance / inflationFactor)
      });

      yearEmployeeContrib = 0;
      yearEmployerContrib = 0;
      yearInvestmentGrowth = 0;
    }
  }

  const projectedBalance = PrecisionEngine.roundFinancial(balance);
  const totalContributions = PrecisionEngine.roundFinancial(
    totalEmployeeContrib + totalEmployerContrib
  );
  const totalInvestmentGrowth = PrecisionEngine.roundFinancial(
    Math.max(0, projectedBalance - input.currentBalance - totalContributions)
  );
  const inflationAdjustedBalance = PrecisionEngine.roundFinancial(
    projectedBalance / Math.pow(1 + inflationAnnual, yearsUntilRetire)
  );

  const monthlyEmployeeContribution = PrecisionEngine.roundFinancial(
    (input.currentSalary * (input.contributionPct / 100)) / 12
  );
  const effectiveMatchMonthly = Math.min(input.contributionPct, input.employerMatchLimit) / 100;
  const monthlyEmployerContribution = PrecisionEngine.roundFinancial(
    (input.currentSalary / 12) * effectiveMatchMonthly * (input.employerMatchPct / 100)
  );

  const swrFactor = safeWithdrawalRatePct / 100;
  const annualSafeWithdrawalNominal = PrecisionEngine.roundFinancial(projectedBalance * swrFactor);
  const monthlySafeWithdrawalNominal = PrecisionEngine.roundFinancial(
    annualSafeWithdrawalNominal / 12
  );
  const annualSafeWithdrawalReal = PrecisionEngine.roundFinancial(
    inflationAdjustedBalance * swrFactor
  );
  const monthlySafeWithdrawalReal = PrecisionEngine.roundFinancial(annualSafeWithdrawalReal / 12);

  return {
    yearsUntilRetire,
    projectedBalance,
    inflationAdjustedBalance,
    totalEmployeeContrib: PrecisionEngine.roundFinancial(totalEmployeeContrib),
    totalEmployerContrib: PrecisionEngine.roundFinancial(totalEmployerContrib),
    totalContributions,
    totalInvestmentGrowth,
    finalSalary: PrecisionEngine.roundFinancial(salary),
    monthlyEmployeeContribution,
    monthlyEmployerContribution,
    safeWithdrawalRatePct,
    annualSafeWithdrawalNominal,
    monthlySafeWithdrawalNominal,
    annualSafeWithdrawalReal,
    monthlySafeWithdrawalReal,
    schedule
  };
}

export const RETIREMENT_PLANNING_CONTRACT: CalculationContract<
  RetirementPlanInput,
  RetirementPlanResult
> = {
  id: 'retirement-planning-calculator',
  name: 'Retirement Nest Egg & Growth Planner',
  category: 'planners',
  subcategoryId: 'planners-expansion-finance',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Multi-Period Compounding & 4% Safe Withdrawal Estimate',
    formulaExpression:
      'B_p = (B_{p-1} + C_p)(1 + r/m); SWR_annual = B_final * 0.04; Real = Value / (1 + i)^Y',
    variables: [
      { symbol: 'B_final', name: 'Projected Retirement Balance', unit: '$' },
      { symbol: 'SWR_annual', name: 'Illustrative Annual Withdrawal (4%)', unit: '$/yr' },
      { symbol: 'i', name: 'Expected Annual Inflation Rate', unit: '%' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'currentAge', label: 'Current Age', type: 'integer', required: true, defaultValue: 35, min: 16, max: 90 },
      { name: 'retireAge', label: 'Retirement Age', type: 'integer', required: true, defaultValue: 65, min: 18, max: 100 },
      { name: 'currentBalance', label: 'Current Retirement Savings ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 },
      { name: 'currentSalary', label: 'Current Annual Income ($)', type: 'currency', required: true, defaultValue: 80000, min: 0 },
      { name: 'contributionPct', label: 'Personal Contribution (%)', type: 'percentage', required: true, defaultValue: 6, min: 0, max: 100 },
      { name: 'employerMatchPct', label: 'Employer Match Rate (%)', type: 'percentage', required: true, defaultValue: 100, min: 0, max: 500 },
      { name: 'employerMatchLimit', label: 'Employer Match Limit (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 100 },
      { name: 'salaryIncreasePct', label: 'Annual Income Growth (%)', type: 'percentage', required: true, defaultValue: 2.5, min: 0, max: 25 },
      { name: 'expectedReturn', label: 'Expected Annual Return (%)', type: 'percentage', required: true, defaultValue: 7, min: 0, max: 30 },
      { name: 'inflationRate', label: 'Annual Inflation Rate (%)', type: 'percentage', required: true, defaultValue: 2.5, min: 0, max: 20 },
      {
        name: 'frequency',
        label: 'Contribution Frequency',
        type: 'select',
        required: true,
        defaultValue: 12,
        options: [
          { label: 'Monthly (12x / yr)', value: 12 },
          { label: 'Bi-weekly (26x / yr)', value: 26 },
          { label: 'Semi-monthly (24x / yr)', value: 24 },
          { label: 'Annual (1x / yr)', value: 1 }
        ]
      }
    ]
  },
  validate: (inputs) => validateRetirementPlanInput(inputs),
  calculate: (inputs) => calculateRetirementPlan(inputs),
  formatResult: (res) => ({
    primary: {
      label: 'Projected Retirement Balance',
      value: ResultFormatter.formatCurrency(res.projectedBalance),
      numericValue: res.projectedBalance
    },
    secondary: [
      {
        label: 'Annual Safe Withdrawal (4% Est.)',
        value: ResultFormatter.formatCurrency(res.annualSafeWithdrawalNominal),
        numericValue: res.annualSafeWithdrawalNominal
      },
      {
        label: 'Monthly Safe Withdrawal (4% Est.)',
        value: ResultFormatter.formatCurrency(res.monthlySafeWithdrawalNominal),
        numericValue: res.monthlySafeWithdrawalNominal
      }
    ],
    breakdown: [
      { label: 'Inflation-Adjusted Nest Egg', value: ResultFormatter.formatCurrency(res.inflationAdjustedBalance) },
      { label: 'Inflation-Adjusted Annual Withdrawal (4%)', value: ResultFormatter.formatCurrency(res.annualSafeWithdrawalReal) },
      { label: 'Inflation-Adjusted Monthly Withdrawal (4%)', value: ResultFormatter.formatCurrency(res.monthlySafeWithdrawalReal) },
      { label: 'Total Personal Contributions', value: ResultFormatter.formatCurrency(res.totalEmployeeContrib) },
      { label: 'Total Employer Contributions', value: ResultFormatter.formatCurrency(res.totalEmployerContrib) },
      { label: 'Compound Investment Growth', value: ResultFormatter.formatCurrency(res.totalInvestmentGrowth) }
    ]
  })
};
