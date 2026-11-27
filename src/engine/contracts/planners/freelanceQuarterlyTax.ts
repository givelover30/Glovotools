import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export interface QuarterlyTaxInstallmentInput {
  id: 'q1' | 'q2' | 'q3' | 'q4';
  label: string;
  dueDate: string;
  weightPct: number;
  amountPaid: number;
  notes?: string;
}

export interface FreelanceQuarterlyTaxInput {
  estimatedAnnualGrossRevenue: number;
  estimatedAnnualBusinessExpenses: number;
  taxReserveRatePct: number; // User-configurable effective tax reserve rate
  priorYearTaxSafeHarbor: number;
  installments: QuarterlyTaxInstallmentInput[];
}

export interface ComputedTaxInstallment extends QuarterlyTaxInstallmentInput {
  scheduledAmount: number;
  remainingDue: number;
  status: 'Paid' | 'Partial' | 'Due';
}

export interface FreelanceQuarterlyTaxResult {
  estimatedAnnualGrossRevenue: number;
  estimatedAnnualBusinessExpenses: number;
  estimatedAnnualNetProfit: number;
  taxReserveRatePct: number;
  estimatedAnnualTaxReserve: number;
  recommendedMonthlySetAside: number;
  priorYearTaxSafeHarbor: number;
  weightSumPct: number;
  totalPaidToDate: number;
  totalRemainingDue: number;
  completionPct: number;
  nextDueQuarter: ComputedTaxInstallment | null;
  installments: ComputedTaxInstallment[];
}

export const DEFAULT_TAX_INSTALLMENTS: QuarterlyTaxInstallmentInput[] = [
  { id: 'q1', label: 'Q1 Installment (Jan–Mar)', dueDate: '2026-04-15', weightPct: 25, amountPaid: 5600, notes: '' },
  { id: 'q2', label: 'Q2 Installment (Apr–May)', dueDate: '2026-06-15', weightPct: 25, amountPaid: 5600, notes: '' },
  { id: 'q3', label: 'Q3 Installment (Jun–Aug)', dueDate: '2026-09-15', weightPct: 25, amountPaid: 0, notes: '' },
  { id: 'q4', label: 'Q4 Installment (Sep–Dec)', dueDate: '2027-01-15', weightPct: 25, amountPaid: 0, notes: '' }
];

export function validateFreelanceQuarterlyTaxInput(
  input: FreelanceQuarterlyTaxInput
): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.estimatedAnnualGrossRevenue) || input.estimatedAnnualGrossRevenue < 0) {
    errors.push({
      field: 'estimatedAnnualGrossRevenue',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Estimated annual gross revenue cannot be negative.',
      invalidValue: input.estimatedAnnualGrossRevenue
    });
  }
  if (
    !Number.isFinite(input.estimatedAnnualBusinessExpenses) ||
    input.estimatedAnnualBusinessExpenses < 0
  ) {
    errors.push({
      field: 'estimatedAnnualBusinessExpenses',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Estimated annual business expenses cannot be negative.',
      invalidValue: input.estimatedAnnualBusinessExpenses
    });
  }
  if (
    !Number.isFinite(input.taxReserveRatePct) ||
    input.taxReserveRatePct < 0 ||
    input.taxReserveRatePct > 70
  ) {
    errors.push({
      field: 'taxReserveRatePct',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: 'Configurable tax reserve rate must be between 0% and 70%.',
      invalidValue: input.taxReserveRatePct
    });
  }
  if (!Number.isFinite(input.priorYearTaxSafeHarbor) || input.priorYearTaxSafeHarbor < 0) {
    errors.push({
      field: 'priorYearTaxSafeHarbor',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Prior-year safe harbor reference cannot be negative.',
      invalidValue: input.priorYearTaxSafeHarbor
    });
  }
  if (!Array.isArray(input.installments) || input.installments.length !== 4) {
    errors.push({
      field: 'installments',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Exactly 4 quarterly installments are required.'
    });
    return errors;
  }

  let weightSum = 0;
  for (const inst of input.installments) {
    if (!Number.isFinite(inst.weightPct) || inst.weightPct < 0 || inst.weightPct > 100) {
      errors.push({
        field: 'installments',
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: `${inst.label} share % must be between 0% and 100%.`,
        invalidValue: inst.weightPct
      });
    }
    if (!Number.isFinite(inst.amountPaid) || inst.amountPaid < 0) {
      errors.push({
        field: 'installments',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `${inst.label} paid amount cannot be negative.`,
        invalidValue: inst.amountPaid
      });
    }
    weightSum += inst.weightPct;
  }

  if (Number.isFinite(weightSum) && Math.abs(weightSum - 100) > 0.01) {
    errors.push({
      field: 'installments',
      code: 'PERCENTAGE_OUT_OF_BOUNDS',
      message: `Quarterly installment weights must total 100% (currently ${PrecisionEngine.roundTo(weightSum, 2)}%).`,
      invalidValue: weightSum
    });
  }

  return errors;
}

export function calculateFreelanceQuarterlyTax(
  input: FreelanceQuarterlyTaxInput
): FreelanceQuarterlyTaxResult {
  const errors = validateFreelanceQuarterlyTaxInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const estimatedAnnualNetProfit = PrecisionEngine.roundFinancial(
    Math.max(0, input.estimatedAnnualGrossRevenue - input.estimatedAnnualBusinessExpenses)
  );
  const estimatedAnnualTaxReserve = PrecisionEngine.roundFinancial(
    estimatedAnnualNetProfit * (input.taxReserveRatePct / 100)
  );
  const recommendedMonthlySetAside = PrecisionEngine.roundFinancial(
    estimatedAnnualTaxReserve / 12
  );

  const installments: ComputedTaxInstallment[] = input.installments.map((inst) => {
    const scheduledAmount = PrecisionEngine.roundFinancial(
      estimatedAnnualTaxReserve * (inst.weightPct / 100)
    );
    const remainingDue = PrecisionEngine.roundFinancial(
      Math.max(0, scheduledAmount - inst.amountPaid)
    );
    const status: ComputedTaxInstallment['status'] =
      remainingDue <= 0.01 ? 'Paid' : inst.amountPaid > 0 ? 'Partial' : 'Due';
    return {
      ...inst,
      scheduledAmount,
      remainingDue,
      status
    };
  });

  const totalPaidToDate = PrecisionEngine.roundFinancial(
    installments.reduce((acc, q) => acc + q.amountPaid, 0)
  );
  const totalRemainingDue = PrecisionEngine.roundFinancial(
    Math.max(0, estimatedAnnualTaxReserve - totalPaidToDate)
  );
  const completionPct =
    estimatedAnnualTaxReserve > 0
      ? Math.min(100, Math.round((totalPaidToDate / estimatedAnnualTaxReserve) * 100))
      : 100;
  const nextDueQuarter = installments.find((q) => q.remainingDue > 0.01) ?? null;

  return {
    estimatedAnnualGrossRevenue: PrecisionEngine.roundFinancial(input.estimatedAnnualGrossRevenue),
    estimatedAnnualBusinessExpenses: PrecisionEngine.roundFinancial(
      input.estimatedAnnualBusinessExpenses
    ),
    estimatedAnnualNetProfit,
    taxReserveRatePct: input.taxReserveRatePct,
    estimatedAnnualTaxReserve,
    recommendedMonthlySetAside,
    priorYearTaxSafeHarbor: PrecisionEngine.roundFinancial(input.priorYearTaxSafeHarbor),
    weightSumPct: PrecisionEngine.roundTo(
      input.installments.reduce((acc, i) => acc + i.weightPct, 0),
      2
    ),
    totalPaidToDate,
    totalRemainingDue,
    completionPct,
    nextDueQuarter,
    installments
  };
}

export interface QuarterlyTaxContractInput {
  estimatedAnnualGrossRevenue: number;
  estimatedAnnualBusinessExpenses: number;
  taxReserveRatePct: number;
  priorYearTaxSafeHarbor?: number;
  installments?: QuarterlyTaxInstallmentInput[];
}

function coerceTaxInput(raw: QuarterlyTaxContractInput): FreelanceQuarterlyTaxInput {
  return {
    estimatedAnnualGrossRevenue: Number(raw.estimatedAnnualGrossRevenue ?? 95000),
    estimatedAnnualBusinessExpenses: Number(raw.estimatedAnnualBusinessExpenses ?? 15000),
    taxReserveRatePct: Number(raw.taxReserveRatePct ?? 28),
    priorYearTaxSafeHarbor: Number(raw.priorYearTaxSafeHarbor ?? 20000),
    installments: Array.isArray(raw.installments)
      ? raw.installments
      : DEFAULT_TAX_INSTALLMENTS
  };
}

export const FREELANCE_QUARTERLY_TAX_CONTRACT: CalculationContract<
  QuarterlyTaxContractInput,
  FreelanceQuarterlyTaxResult
> = {
  id: 'freelance-quarterly-tax-payment-planner',
  name: 'Freelancer Quarterly Estimated Tax Payment Planner',
  category: 'planners',
  subcategoryId: 'taxes',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Configurable Effective Tax Reserve & Quarterly Installment Schedule',
    formulaExpression:
      'NetProfit = max(0, Gross - Expenses); AnnualReserve = NetProfit * ReserveRatePct; Q_k = AnnualReserve * Weight_k',
    variables: [
      { symbol: 'NetProfit', name: 'Estimated Annual Net Profit', unit: '$' },
      { symbol: 'ReserveRatePct', name: 'User-Configured Effective Tax Reserve %', unit: '%' },
      { symbol: 'Q_k', name: 'Quarterly Payment Target', unit: '$/qtr' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'estimatedAnnualGrossRevenue', label: 'Estimated Annual Gross Revenue ($)', type: 'currency', required: true, defaultValue: 95000, min: 0 },
      { name: 'estimatedAnnualBusinessExpenses', label: 'Estimated Annual Business Expenses ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 },
      { name: 'taxReserveRatePct', label: 'Configured Tax Reserve Rate (%)', type: 'percentage', required: true, defaultValue: 28, min: 0, max: 70 },
      { name: 'priorYearTaxSafeHarbor', label: 'Prior-Year Tax Reference ($)', type: 'currency', required: false, defaultValue: 20000, min: 0 }
    ]
  },
  validate: (inputs) => validateFreelanceQuarterlyTaxInput(coerceTaxInput(inputs)),
  calculate: (inputs) => calculateFreelanceQuarterlyTax(coerceTaxInput(inputs)),
  formatResult: (res) => ({
    primary: {
      label: 'Estimated Annual Tax Reserve',
      value: ResultFormatter.formatCurrency(res.estimatedAnnualTaxReserve),
      numericValue: res.estimatedAnnualTaxReserve
    },
    secondary: [
      {
        label: 'Remaining Quarterly Balance',
        value: ResultFormatter.formatCurrency(res.totalRemainingDue),
        numericValue: res.totalRemainingDue
      },
      {
        label: 'Recommended Monthly Set-Aside',
        value: ResultFormatter.formatCurrency(res.recommendedMonthlySetAside),
        numericValue: res.recommendedMonthlySetAside
      }
    ],
    breakdown: [
      { label: 'Estimated Net Profit', value: ResultFormatter.formatCurrency(res.estimatedAnnualNetProfit) },
      { label: 'Total Paid to Date', value: ResultFormatter.formatCurrency(res.totalPaidToDate) },
      ...res.installments.map((q) => ({
        label: `${q.id.toUpperCase()} (${q.dueDate})`,
        value: `${ResultFormatter.formatCurrency(q.scheduledAmount)} (${q.status})`
      }))
    ]
  })
};
