import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export type WeddingPaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Paid in Full';

export interface WeddingBudgetCategoryInput {
  id: string;
  name: string;
  targetPct: number;
  estimatedCost: number;
  actualCost: number;
  vendorName?: string;
  paymentStatus: WeddingPaymentStatus;
  notes?: string;
}

export interface WeddingBudgetInput {
  totalBudget: number;
  guestCount: number;
  categories: WeddingBudgetCategoryInput[];
}

export interface ComputedWeddingCategory extends WeddingBudgetCategoryInput {
  targetAmount: number;
  varianceTargetVsActual: number;
  varianceEstimatedVsActual: number;
  isOverTarget: boolean;
  isOverEstimate: boolean;
  shareOfActualPct: number;
}

export interface WeddingBudgetResult {
  totalBudget: number;
  guestCount: number;
  totalAllocatedPct: number;
  allocationGapPct: number;
  totalTargetAmount: number;
  totalEstimated: number;
  totalActual: number;
  remainingVsBudgetActual: number;
  remainingVsBudgetEstimated: number;
  costPerGuestBudget: number;
  costPerGuestEstimated: number;
  costPerGuestActual: number;
  isOverTotalBudget: boolean;
  paidFullCount: number;
  depositCount: number;
  unpaidCount: number;
  overspentCategoryIds: string[];
  categories: ComputedWeddingCategory[];
}

export const DEFAULT_WEDDING_CATEGORIES: WeddingBudgetCategoryInput[] = [
  { id: 'venue', name: 'Venue & Rentals', targetPct: 30, estimatedCost: 9000, actualCost: 8500, vendorName: '', paymentStatus: 'Deposit Paid', notes: '' },
  { id: 'catering', name: 'Catering & Bar', targetPct: 25, estimatedCost: 7500, actualCost: 0, vendorName: '', paymentStatus: 'Unpaid', notes: '' },
  { id: 'photo', name: 'Photography & Video', targetPct: 12, estimatedCost: 3600, actualCost: 1800, vendorName: '', paymentStatus: 'Deposit Paid', notes: '' },
  { id: 'music', name: 'Music & Entertainment', targetPct: 8, estimatedCost: 2400, actualCost: 0, vendorName: '', paymentStatus: 'Unpaid', notes: '' },
  { id: 'floral', name: 'Flowers & Decor', targetPct: 8, estimatedCost: 2400, actualCost: 0, vendorName: '', paymentStatus: 'Unpaid', notes: '' },
  { id: 'attire', name: 'Attire & Beauty', targetPct: 7, estimatedCost: 2100, actualCost: 1450, vendorName: '', paymentStatus: 'Paid in Full', notes: '' },
  { id: 'stationery', name: 'Invitations & Stationery', targetPct: 3, estimatedCost: 900, actualCost: 650, vendorName: '', paymentStatus: 'Paid in Full', notes: '' },
  { id: 'other', name: 'Officiant, Rings & Favors', targetPct: 4, estimatedCost: 1200, actualCost: 0, vendorName: '', paymentStatus: 'Unpaid', notes: '' },
  { id: 'buffer', name: 'Contingency Buffer', targetPct: 3, estimatedCost: 900, actualCost: 0, vendorName: '', paymentStatus: 'Unpaid', notes: '' }
];

export function validateWeddingBudgetInput(input: WeddingBudgetInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Number.isFinite(input.totalBudget) || input.totalBudget < 0) {
    errors.push({
      field: 'totalBudget',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Total wedding budget cannot be negative.',
      invalidValue: input.totalBudget
    });
  }
  if (!Number.isFinite(input.guestCount) || input.guestCount < 1 || !Number.isInteger(input.guestCount)) {
    errors.push({
      field: 'guestCount',
      code: 'INTEGER_REQUIRED',
      message: 'Guest count must be a whole number >= 1.',
      invalidValue: input.guestCount
    });
  }
  if (!Array.isArray(input.categories)) {
    errors.push({
      field: 'categories',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Budget categories array is required.'
    });
    return errors;
  }

  for (const cat of input.categories) {
    if (!cat.name || cat.name.trim() === '') {
      errors.push({
        field: 'categories',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'Every budget category must have a name.'
      });
    }
    if (!Number.isFinite(cat.targetPct) || cat.targetPct < 0 || cat.targetPct > 100) {
      errors.push({
        field: 'targetPct',
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: `Category "${cat.name || cat.id}" allocation % must be between 0% and 100%.`,
        invalidValue: cat.targetPct
      });
    }
    if (!Number.isFinite(cat.estimatedCost) || cat.estimatedCost < 0) {
      errors.push({
        field: 'estimatedCost',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Category "${cat.name || cat.id}" estimated cost cannot be negative.`,
        invalidValue: cat.estimatedCost
      });
    }
    if (!Number.isFinite(cat.actualCost) || cat.actualCost < 0) {
      errors.push({
        field: 'actualCost',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Category "${cat.name || cat.id}" actual spend cannot be negative.`,
        invalidValue: cat.actualCost
      });
    }
  }

  return errors;
}

export function calculateWeddingBudget(input: WeddingBudgetInput): WeddingBudgetResult {
  const errors = validateWeddingBudgetInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const totalAllocatedPct = PrecisionEngine.roundTo(
    input.categories.reduce((acc, c) => acc + c.targetPct, 0),
    2
  );
  const allocationGapPct = PrecisionEngine.roundTo(100 - totalAllocatedPct, 2);
  const totalEstimated = PrecisionEngine.roundFinancial(
    input.categories.reduce((acc, c) => acc + c.estimatedCost, 0)
  );
  const totalActual = PrecisionEngine.roundFinancial(
    input.categories.reduce((acc, c) => acc + c.actualCost, 0)
  );

  const computedCategories: ComputedWeddingCategory[] = input.categories.map((cat) => {
    const targetAmount = PrecisionEngine.roundFinancial(input.totalBudget * (cat.targetPct / 100));
    const varianceTargetVsActual = PrecisionEngine.roundFinancial(targetAmount - cat.actualCost);
    const varianceEstimatedVsActual = PrecisionEngine.roundFinancial(
      cat.estimatedCost - cat.actualCost
    );
    const isOverTarget = cat.actualCost > targetAmount;
    const isOverEstimate = cat.actualCost > cat.estimatedCost;
    const shareOfActualPct =
      totalActual > 0 ? PrecisionEngine.roundTo((cat.actualCost / totalActual) * 100, 1) : 0;

    return {
      ...cat,
      name: cat.name.trim(),
      targetAmount,
      varianceTargetVsActual,
      varianceEstimatedVsActual,
      isOverTarget,
      isOverEstimate,
      shareOfActualPct
    };
  });

  const totalTargetAmount = PrecisionEngine.roundFinancial(
    computedCategories.reduce((acc, c) => acc + c.targetAmount, 0)
  );
  const remainingVsBudgetActual = PrecisionEngine.roundFinancial(input.totalBudget - totalActual);
  const remainingVsBudgetEstimated = PrecisionEngine.roundFinancial(
    input.totalBudget - totalEstimated
  );

  return {
    totalBudget: PrecisionEngine.roundFinancial(input.totalBudget),
    guestCount: input.guestCount,
    totalAllocatedPct,
    allocationGapPct,
    totalTargetAmount,
    totalEstimated,
    totalActual,
    remainingVsBudgetActual,
    remainingVsBudgetEstimated,
    costPerGuestBudget: PrecisionEngine.roundFinancial(input.totalBudget / input.guestCount),
    costPerGuestEstimated: PrecisionEngine.roundFinancial(totalEstimated / input.guestCount),
    costPerGuestActual: PrecisionEngine.roundFinancial(totalActual / input.guestCount),
    isOverTotalBudget: totalActual > input.totalBudget,
    paidFullCount: computedCategories.filter((c) => c.paymentStatus === 'Paid in Full').length,
    depositCount: computedCategories.filter((c) => c.paymentStatus === 'Deposit Paid').length,
    unpaidCount: computedCategories.filter((c) => c.paymentStatus === 'Unpaid').length,
    overspentCategoryIds: computedCategories
      .filter((c) => c.isOverTarget)
      .map((c) => c.id),
    categories: computedCategories
  };
}

export interface WeddingBudgetContractInput {
  totalBudget: number;
  guestCount: number;
  categories?: WeddingBudgetCategoryInput[];
}

function coerceWeddingContractInput(raw: WeddingBudgetContractInput): WeddingBudgetInput {
  const totalBudget = Number(raw.totalBudget ?? 30000);
  if (Array.isArray(raw.categories)) {
    return {
      totalBudget,
      guestCount: Number(raw.guestCount ?? 100),
      categories: raw.categories
    };
  }
  return {
    totalBudget,
    guestCount: Number(raw.guestCount ?? 100),
    categories: DEFAULT_WEDDING_CATEGORIES.map((c) => ({
      ...c,
      estimatedCost: PrecisionEngine.roundFinancial(totalBudget * (c.targetPct / 100)),
      actualCost: 0
    }))
  };
}

export const WEDDING_BUDGET_PLANNER_CONTRACT: CalculationContract<
  WeddingBudgetContractInput,
  WeddingBudgetResult
> = {
  id: 'wedding-budget-planner',
  name: 'Wedding Budget & Expense Allocation Planner',
  category: 'planners',
  subcategoryId: 'p12-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Category Allocation, Variance & Cost-per-Guest Wedding Budgeting',
    formulaExpression:
      'Target_c = TotalBudget * TargetPct_c; Remaining = TotalBudget - sum(Actual_c); CostPerGuest = Total / Guests',
    variables: [
      { symbol: 'TotalBudget', name: 'Total Wedding Budget', unit: '$' },
      { symbol: 'TargetPct_c', name: 'Category Allocation Percentage', unit: '%' },
      { symbol: 'Guests', name: 'Total Guest Count', unit: 'guests' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'totalBudget', label: 'Total Wedding Budget ($)', type: 'currency', required: true, defaultValue: 30000, min: 0 },
      { name: 'guestCount', label: 'Estimated Guest Count', type: 'integer', required: true, defaultValue: 100, min: 1, max: 2000 }
    ]
  },
  validate: (inputs) => validateWeddingBudgetInput(coerceWeddingContractInput(inputs)),
  calculate: (inputs) => calculateWeddingBudget(coerceWeddingContractInput(inputs)),
  formatResult: (res) => ({
    primary: {
      label: 'Remaining Wedding Budget',
      value: ResultFormatter.formatCurrency(res.remainingVsBudgetActual),
      numericValue: res.remainingVsBudgetActual
    },
    secondary: [
      {
        label: 'Budget Cost per Guest',
        value: ResultFormatter.formatCurrency(res.costPerGuestBudget),
        numericValue: res.costPerGuestBudget
      },
      {
        label: 'Total Actual Spend',
        value: ResultFormatter.formatCurrency(res.totalActual),
        numericValue: res.totalActual
      }
    ],
    breakdown: [
      { label: 'Total Wedding Budget', value: ResultFormatter.formatCurrency(res.totalBudget) },
      { label: 'Total Estimated Spend', value: ResultFormatter.formatCurrency(res.totalEstimated) },
      { label: 'Allocation Sum', value: `${res.totalAllocatedPct}%` },
      { label: 'Cost per Guest (Estimated)', value: ResultFormatter.formatCurrency(res.costPerGuestEstimated) }
    ]
  })
};
