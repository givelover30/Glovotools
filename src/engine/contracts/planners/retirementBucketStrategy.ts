import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export interface RetirementBucketInput {
  totalPortfolioValue: number;
  annualSpendingNeed: number;
  guaranteedAnnualIncome: number;
  bucket1Pct: number; // Cash / short-term
  bucket2Pct: number; // Bonds / intermediate income
  bucket3Pct: number; // Equities / long-term growth
  bucket1ReturnPct: number;
  bucket2ReturnPct: number;
  bucket3ReturnPct: number;
}

export interface BucketSummaryItem {
  bucketNumber: 1 | 2 | 3;
  name: string;
  role: string;
  allocationPct: number;
  amount: number;
  expectedReturnPct: number;
  projectedAnnualIncomeOrGrowth: number;
  yearsSpendingCovered: number | null;
}

export interface RetirementBucketResult {
  totalPortfolioValue: number;
  annualSpendingNeed: number;
  guaranteedAnnualIncome: number;
  netAnnualPortfolioWithdrawal: number;
  initialWithdrawalRatePct: number;
  allocationSumPct: number;
  weightedExpectedReturnPct: number;
  bucket1YearsCovered: number | null;
  bucket2YearsCovered: number | null;
  combinedNearTermYearsCovered: number | null;
  bucket3Projected10YrValue: number;
  buckets: BucketSummaryItem[];
}

export function validateRetirementBucketInput(input: RetirementBucketInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.totalPortfolioValue) || input.totalPortfolioValue < 0) {
    errors.push({
      field: 'totalPortfolioValue',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Total retirement portfolio value cannot be negative.',
      invalidValue: input.totalPortfolioValue
    });
  }
  if (!Number.isFinite(input.annualSpendingNeed) || input.annualSpendingNeed < 0) {
    errors.push({
      field: 'annualSpendingNeed',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Annual spending need cannot be negative.',
      invalidValue: input.annualSpendingNeed
    });
  }
  if (!Number.isFinite(input.guaranteedAnnualIncome) || input.guaranteedAnnualIncome < 0) {
    errors.push({
      field: 'guaranteedAnnualIncome',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Guaranteed annual income cannot be negative.',
      invalidValue: input.guaranteedAnnualIncome
    });
  }
  for (const [field, val] of [
    ['bucket1Pct', input.bucket1Pct],
    ['bucket2Pct', input.bucket2Pct],
    ['bucket3Pct', input.bucket3Pct]
  ] as const) {
    if (!Number.isFinite(val) || val < 0 || val > 100) {
      errors.push({
        field,
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: 'Each bucket allocation must be between 0% and 100%.',
        invalidValue: val
      });
    }
  }
  const sum = input.bucket1Pct + input.bucket2Pct + input.bucket3Pct;
  if (Number.isFinite(sum) && Math.abs(sum - 100) > 0.01) {
    errors.push({
      field: 'bucket1Pct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: `Bucket allocations must total 100% (currently ${PrecisionEngine.roundTo(sum, 2)}%).`,
      invalidValue: sum
    });
  }
  for (const [field, val] of [
    ['bucket1ReturnPct', input.bucket1ReturnPct],
    ['bucket2ReturnPct', input.bucket2ReturnPct],
    ['bucket3ReturnPct', input.bucket3ReturnPct]
  ] as const) {
    if (!Number.isFinite(val) || val < 0 || val > 25) {
      errors.push({
        field,
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: 'Illustrative expected return rates must be between 0% and 25%.',
        invalidValue: val
      });
    }
  }

  return errors;
}

export function calculateRetirementBucketStrategy(
  input: RetirementBucketInput
): RetirementBucketResult {
  const errors = validateRetirementBucketInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const netAnnualPortfolioWithdrawal = PrecisionEngine.roundFinancial(
    Math.max(0, input.annualSpendingNeed - input.guaranteedAnnualIncome)
  );
  const initialWithdrawalRatePct =
    input.totalPortfolioValue > 0
      ? PrecisionEngine.roundTo((netAnnualPortfolioWithdrawal / input.totalPortfolioValue) * 100, 2)
      : 0;

  const b1Amount = PrecisionEngine.roundFinancial(
    input.totalPortfolioValue * (input.bucket1Pct / 100)
  );
  const b2Amount = PrecisionEngine.roundFinancial(
    input.totalPortfolioValue * (input.bucket2Pct / 100)
  );
  const b3Amount = PrecisionEngine.roundFinancial(
    input.totalPortfolioValue * (input.bucket3Pct / 100)
  );

  const bucket1YearsCovered =
    netAnnualPortfolioWithdrawal > 0
      ? PrecisionEngine.roundTo(b1Amount / netAnnualPortfolioWithdrawal, 2)
      : null;
  const bucket2YearsCovered =
    netAnnualPortfolioWithdrawal > 0
      ? PrecisionEngine.roundTo(b2Amount / netAnnualPortfolioWithdrawal, 2)
      : null;
  const combinedNearTermYearsCovered =
    netAnnualPortfolioWithdrawal > 0
      ? PrecisionEngine.roundTo((b1Amount + b2Amount) / netAnnualPortfolioWithdrawal, 2)
      : null;

  const weightedExpectedReturnPct = PrecisionEngine.roundTo(
    (input.bucket1Pct * input.bucket1ReturnPct +
      input.bucket2Pct * input.bucket2ReturnPct +
      input.bucket3Pct * input.bucket3ReturnPct) /
      100,
    2
  );

  const bucket3Projected10YrValue = PrecisionEngine.roundFinancial(
    b3Amount * Math.pow(1 + input.bucket3ReturnPct / 100, 10)
  );

  const buckets: BucketSummaryItem[] = [
    {
      bucketNumber: 1,
      name: 'Bucket 1 — Short-Term Cash Reserve',
      role: 'Immediate 1–2+ years of withdrawals protected from market volatility',
      allocationPct: input.bucket1Pct,
      amount: b1Amount,
      expectedReturnPct: input.bucket1ReturnPct,
      projectedAnnualIncomeOrGrowth: PrecisionEngine.roundFinancial(
        b1Amount * (input.bucket1ReturnPct / 100)
      ),
      yearsSpendingCovered: bucket1YearsCovered
    },
    {
      bucketNumber: 2,
      name: 'Bucket 2 — Intermediate Income & Bonds',
      role: 'Medium-term stability to refill Bucket 1 during equity downturns',
      allocationPct: input.bucket2Pct,
      amount: b2Amount,
      expectedReturnPct: input.bucket2ReturnPct,
      projectedAnnualIncomeOrGrowth: PrecisionEngine.roundFinancial(
        b2Amount * (input.bucket2ReturnPct / 100)
      ),
      yearsSpendingCovered: bucket2YearsCovered
    },
    {
      bucketNumber: 3,
      name: 'Bucket 3 — Long-Term Equity Growth',
      role: 'Long-horizon compounding to outpace inflation over retirement',
      allocationPct: input.bucket3Pct,
      amount: b3Amount,
      expectedReturnPct: input.bucket3ReturnPct,
      projectedAnnualIncomeOrGrowth: PrecisionEngine.roundFinancial(
        b3Amount * (input.bucket3ReturnPct / 100)
      ),
      yearsSpendingCovered:
        netAnnualPortfolioWithdrawal > 0
          ? PrecisionEngine.roundTo(b3Amount / netAnnualPortfolioWithdrawal, 2)
          : null
    }
  ];

  return {
    totalPortfolioValue: PrecisionEngine.roundFinancial(input.totalPortfolioValue),
    annualSpendingNeed: PrecisionEngine.roundFinancial(input.annualSpendingNeed),
    guaranteedAnnualIncome: PrecisionEngine.roundFinancial(input.guaranteedAnnualIncome),
    netAnnualPortfolioWithdrawal,
    initialWithdrawalRatePct,
    allocationSumPct: PrecisionEngine.roundTo(
      input.bucket1Pct + input.bucket2Pct + input.bucket3Pct,
      2
    ),
    weightedExpectedReturnPct,
    bucket1YearsCovered,
    bucket2YearsCovered,
    combinedNearTermYearsCovered,
    bucket3Projected10YrValue,
    buckets
  };
}

export const RETIREMENT_BUCKET_STRATEGY_CONTRACT: CalculationContract<
  RetirementBucketInput,
  RetirementBucketResult
> = {
  id: 'retirement-bucket-strategy-planner',
  name: 'Retirement 3-Bucket Withdrawal Strategy Planner',
  category: 'planners',
  subcategoryId: 'retirement',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Three-Bucket Asset Segmentation & Runway Coverage Model',
    formulaExpression:
      'NetNeed = max(0, Spending - GuaranteedIncome); Bucket_k = Portfolio * Pct_k; NearTermRunway = (Bucket1 + Bucket2) / NetNeed',
    variables: [
      { symbol: 'Portfolio', name: 'Total Retirement Portfolio', unit: '$' },
      { symbol: 'NetNeed', name: 'Annual Portfolio Withdrawal Need', unit: '$/yr' },
      { symbol: 'NearTermRunway', name: 'Cash + Bond Spending Coverage', unit: 'years' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'totalPortfolioValue', label: 'Total Portfolio Value ($)', type: 'currency', required: true, defaultValue: 1000000, min: 0 },
      { name: 'annualSpendingNeed', label: 'Annual Retirement Spending ($)', type: 'currency', required: true, defaultValue: 65000, min: 0 },
      { name: 'guaranteedAnnualIncome', label: 'Guaranteed Annual Income ($)', type: 'currency', required: true, defaultValue: 25000, min: 0 },
      { name: 'bucket1Pct', label: 'Bucket 1 Cash (%)', type: 'percentage', required: true, defaultValue: 10, min: 0, max: 100 },
      { name: 'bucket2Pct', label: 'Bucket 2 Bonds (%)', type: 'percentage', required: true, defaultValue: 30, min: 0, max: 100 },
      { name: 'bucket3Pct', label: 'Bucket 3 Equities (%)', type: 'percentage', required: true, defaultValue: 60, min: 0, max: 100 },
      { name: 'bucket1ReturnPct', label: 'Bucket 1 Return (%)', type: 'percentage', required: true, defaultValue: 3.5, min: 0, max: 25 },
      { name: 'bucket2ReturnPct', label: 'Bucket 2 Return (%)', type: 'percentage', required: true, defaultValue: 5.0, min: 0, max: 25 },
      { name: 'bucket3ReturnPct', label: 'Bucket 3 Return (%)', type: 'percentage', required: true, defaultValue: 7.5, min: 0, max: 25 }
    ]
  },
  validate: (inputs) => validateRetirementBucketInput(inputs),
  calculate: (inputs) => calculateRetirementBucketStrategy(inputs),
  formatResult: (res) => ({
    primary: {
      label: 'Near-Term Runway (Cash + Bonds)',
      value:
        res.combinedNearTermYearsCovered !== null
          ? `${res.combinedNearTermYearsCovered} years`
          : 'No portfolio draw',
      numericValue: res.combinedNearTermYearsCovered ?? 0,
      unit: 'years'
    },
    secondary: [
      {
        label: 'Net Annual Portfolio Withdrawal',
        value: ResultFormatter.formatCurrency(res.netAnnualPortfolioWithdrawal),
        numericValue: res.netAnnualPortfolioWithdrawal
      },
      {
        label: 'Initial Withdrawal Rate',
        value: `${res.initialWithdrawalRatePct}%`,
        numericValue: res.initialWithdrawalRatePct,
        unit: '%'
      }
    ],
    breakdown: [
      { label: 'Bucket 1 (Cash)', value: ResultFormatter.formatCurrency(res.buckets[0].amount) },
      { label: 'Bucket 2 (Income/Bonds)', value: ResultFormatter.formatCurrency(res.buckets[1].amount) },
      { label: 'Bucket 3 (Growth Equities)', value: ResultFormatter.formatCurrency(res.buckets[2].amount) },
      { label: 'Weighted Illustrative Return', value: `${res.weightedExpectedReturnPct}%` }
    ]
  })
};
