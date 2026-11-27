import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export interface CollegeTuitionInput {
  currentAnnualTuition: number;
  programYears: number;
  yearsUntilEnrollment: number;
  tuitionInflationPct: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedAnnualReturnPct: number;
}

export interface CollegeSavingsYearRow {
  year: number;
  startingBalance: number;
  annualContribution: number;
  investmentGrowth: number;
  endingBalance: number;
}

export interface CollegeTuitionResult {
  yearsUntilEnrollment: number;
  programYears: number;
  firstYearTuitionAtEnrollment: number;
  totalProjectedTuitionCost: number;
  projectedSavingsAtEnrollment: number;
  totalPrincipalContributed: number;
  totalInvestmentGrowth: number;
  fundingSurplusOrGap: number;
  fundingCoveragePct: number;
  requiredMonthlyContributionToFund: number;
  additionalMonthlyContributionNeeded: number;
  schedule: CollegeSavingsYearRow[];
  tuitionYearsBreakdown: Array<{
    enrollmentYearNumber: number;
    projectedAnnualTuition: number;
  }>;
}

export function validateCollegeTuitionInput(input: CollegeTuitionInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.currentAnnualTuition) || input.currentAnnualTuition < 0) {
    errors.push({
      field: 'currentAnnualTuition',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Current annual tuition cannot be negative.',
      invalidValue: input.currentAnnualTuition
    });
  }
  if (
    !Number.isFinite(input.programYears) ||
    !Number.isInteger(input.programYears) ||
    input.programYears < 1 ||
    input.programYears > 8
  ) {
    errors.push({
      field: 'programYears',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Program length must be a whole number between 1 and 8 years.',
      invalidValue: input.programYears
    });
  }
  if (
    !Number.isFinite(input.yearsUntilEnrollment) ||
    !Number.isInteger(input.yearsUntilEnrollment) ||
    input.yearsUntilEnrollment < 0 ||
    input.yearsUntilEnrollment > 25
  ) {
    errors.push({
      field: 'yearsUntilEnrollment',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Years until enrollment must be a whole number between 0 and 25.',
      invalidValue: input.yearsUntilEnrollment
    });
  }
  if (
    !Number.isFinite(input.tuitionInflationPct) ||
    input.tuitionInflationPct < 0 ||
    input.tuitionInflationPct > 15
  ) {
    errors.push({
      field: 'tuitionInflationPct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Tuition inflation rate must be between 0% and 15%.',
      invalidValue: input.tuitionInflationPct
    });
  }
  if (!Number.isFinite(input.currentSavings) || input.currentSavings < 0) {
    errors.push({
      field: 'currentSavings',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Current savings balance cannot be negative.',
      invalidValue: input.currentSavings
    });
  }
  if (!Number.isFinite(input.monthlyContribution) || input.monthlyContribution < 0) {
    errors.push({
      field: 'monthlyContribution',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Monthly contribution cannot be negative.',
      invalidValue: input.monthlyContribution
    });
  }
  if (
    !Number.isFinite(input.expectedAnnualReturnPct) ||
    input.expectedAnnualReturnPct < 0 ||
    input.expectedAnnualReturnPct > 20
  ) {
    errors.push({
      field: 'expectedAnnualReturnPct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Expected annual return must be between 0% and 20%.',
      invalidValue: input.expectedAnnualReturnPct
    });
  }

  return errors;
}

export function calculateCollegeTuitionPlan(input: CollegeTuitionInput): CollegeTuitionResult {
  const errors = validateCollegeTuitionInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const infRate = input.tuitionInflationPct / 100;
  const rMonthly = input.expectedAnnualReturnPct / 100 / 12;

  const tuitionYearsBreakdown: Array<{
    enrollmentYearNumber: number;
    projectedAnnualTuition: number;
  }> = [];

  let totalProjectedTuitionRaw = 0;
  for (let k = 0; k < input.programYears; k++) {
    const tuitionYr =
      input.currentAnnualTuition * Math.pow(1 + infRate, input.yearsUntilEnrollment + k);
    totalProjectedTuitionRaw += tuitionYr;
    tuitionYearsBreakdown.push({
      enrollmentYearNumber: k + 1,
      projectedAnnualTuition: PrecisionEngine.roundFinancial(tuitionYr)
    });
  }

  const totalProjectedTuitionCost = PrecisionEngine.roundFinancial(totalProjectedTuitionRaw);
  const firstYearTuitionAtEnrollment =
    tuitionYearsBreakdown[0]?.projectedAnnualTuition ?? input.currentAnnualTuition;

  const schedule: CollegeSavingsYearRow[] = [];
  let balance = input.currentSavings;
  let totalContributed = 0;

  for (let y = 1; y <= input.yearsUntilEnrollment; y++) {
    const startYearBalance = balance;
    let yearContrib = 0;
    let yearGrowth = 0;

    for (let m = 1; m <= 12; m++) {
      const growth = (balance + input.monthlyContribution) * rMonthly;
      balance = balance + input.monthlyContribution + growth;
      yearContrib += input.monthlyContribution;
      yearGrowth += growth;
      totalContributed += input.monthlyContribution;
    }

    schedule.push({
      year: y,
      startingBalance: PrecisionEngine.roundFinancial(startYearBalance),
      annualContribution: PrecisionEngine.roundFinancial(yearContrib),
      investmentGrowth: PrecisionEngine.roundFinancial(yearGrowth),
      endingBalance: PrecisionEngine.roundFinancial(balance)
    });
  }

  const projectedSavingsAtEnrollment = PrecisionEngine.roundFinancial(balance);
  const totalPrincipalContributed = PrecisionEngine.roundFinancial(
    input.currentSavings + totalContributed
  );
  const totalInvestmentGrowth = PrecisionEngine.roundFinancial(
    Math.max(0, projectedSavingsAtEnrollment - totalPrincipalContributed)
  );
  const fundingSurplusOrGap = PrecisionEngine.roundFinancial(
    projectedSavingsAtEnrollment - totalProjectedTuitionCost
  );
  const fundingCoveragePct =
    totalProjectedTuitionCost > 0
      ? PrecisionEngine.roundTo((projectedSavingsAtEnrollment / totalProjectedTuitionCost) * 100, 1)
      : 100;

  // Solve required monthly contribution (same contribution timing: end-of-period deposit compounding each month)
  let requiredMonthlyContributionToFund = 0;
  const totalMonths = input.yearsUntilEnrollment * 12;
  if (totalMonths > 0) {
    if (rMonthly === 0) {
      const remaining = Math.max(0, totalProjectedTuitionCost - input.currentSavings);
      requiredMonthlyContributionToFund = PrecisionEngine.roundFinancial(remaining / totalMonths);
    } else {
      const growthFactor = Math.pow(1 + rMonthly, totalMonths);
      const fvCurrentSavings = input.currentSavings * growthFactor;
      const shortfallAtEnrollment = Math.max(0, totalProjectedTuitionCost - fvCurrentSavings);
      // Matches per-month accumulation: balance = (balance + pmt) * (1 + rMonthly)
      const annuityDueFactor = ((growthFactor - 1) / rMonthly) * (1 + rMonthly);
      requiredMonthlyContributionToFund = PrecisionEngine.roundFinancial(
        annuityDueFactor > 0 ? shortfallAtEnrollment / annuityDueFactor : 0
      );
    }
  }

  const additionalMonthlyContributionNeeded = PrecisionEngine.roundFinancial(
    Math.max(0, requiredMonthlyContributionToFund - input.monthlyContribution)
  );

  return {
    yearsUntilEnrollment: input.yearsUntilEnrollment,
    programYears: input.programYears,
    firstYearTuitionAtEnrollment,
    totalProjectedTuitionCost,
    projectedSavingsAtEnrollment,
    totalPrincipalContributed,
    totalInvestmentGrowth,
    fundingSurplusOrGap,
    fundingCoveragePct,
    requiredMonthlyContributionToFund,
    additionalMonthlyContributionNeeded,
    schedule,
    tuitionYearsBreakdown
  };
}

export const COLLEGE_TUITION_SAVINGS_PLANNER_CONTRACT: CalculationContract<
  CollegeTuitionInput,
  CollegeTuitionResult
> = {
  id: 'college-tuition-savings-growth-planner',
  name: 'College 529 Savings Plan Growth & Tuition Planner',
  category: 'planners',
  subcategoryId: 'education',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Inflation-Adjusted Multi-Year Tuition & Monthly Compounding Savings Gap',
    formulaExpression:
      'TotalTuition = sum_{k=0}^{N-1} T_0 * (1 + inf)^{Y+k}; RequiredMonthly = max(0, TotalTuition - S_0*(1+r/12)^M) / AnnuityDueFactor',
    variables: [
      { symbol: 'T_0', name: 'Current Annual Tuition', unit: '$/yr' },
      { symbol: 'inf', name: 'Annual Tuition Inflation', unit: '%' },
      { symbol: 'Y', name: 'Years Until Enrollment', unit: 'years' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'currentAnnualTuition', label: 'Current Annual Tuition ($)', type: 'currency', required: true, defaultValue: 24000, min: 0 },
      { name: 'programYears', label: 'Program Length (Years)', type: 'integer', required: true, defaultValue: 4, min: 1, max: 8 },
      { name: 'yearsUntilEnrollment', label: 'Years Until Enrollment', type: 'integer', required: true, defaultValue: 10, min: 0, max: 25 },
      { name: 'tuitionInflationPct', label: 'Tuition Inflation Rate (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 15 },
      { name: 'currentSavings', label: 'Current Education Savings ($)', type: 'currency', required: true, defaultValue: 12000, min: 0 },
      { name: 'monthlyContribution', label: 'Planned Monthly Contribution ($)', type: 'currency', required: true, defaultValue: 350, min: 0 },
      { name: 'expectedAnnualReturnPct', label: 'Expected Annual Return (%)', type: 'percentage', required: true, defaultValue: 6.5, min: 0, max: 20 }
    ]
  },
  validate: (inputs) => validateCollegeTuitionInput(inputs),
  calculate: (inputs) => calculateCollegeTuitionPlan(inputs),
  formatResult: (res) => ({
    primary: {
      label: 'Projected Education Savings',
      value: ResultFormatter.formatCurrency(res.projectedSavingsAtEnrollment),
      numericValue: res.projectedSavingsAtEnrollment
    },
    secondary: [
      {
        label: 'Total Projected Tuition Cost',
        value: ResultFormatter.formatCurrency(res.totalProjectedTuitionCost),
        numericValue: res.totalProjectedTuitionCost
      },
      {
        label: 'Required Monthly Contribution',
        value: ResultFormatter.formatCurrency(res.requiredMonthlyContributionToFund),
        numericValue: res.requiredMonthlyContributionToFund
      }
    ],
    breakdown: [
      { label: 'Year 1 Tuition at Enrollment', value: ResultFormatter.formatCurrency(res.firstYearTuitionAtEnrollment) },
      { label: 'Funding Coverage', value: `${res.fundingCoveragePct}%` },
      { label: 'Projected Surplus / (Gap)', value: ResultFormatter.formatCurrency(res.fundingSurplusOrGap) },
      { label: 'Compound Investment Growth', value: ResultFormatter.formatCurrency(res.totalInvestmentGrowth) }
    ]
  })
};
