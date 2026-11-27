import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export type HustlePhase = 'Validation' | 'Build / Offer' | 'Marketing' | 'Launch';

export interface SideHustleMilestone {
  id: string;
  phase: HustlePhase;
  title: string;
  targetDate: string;
  estimatedCost: number;
  completed: boolean;
}

export interface SideHustleExpenseItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'one-time' | 'monthly';
}

export interface SideHustleInput {
  ventureName: string;
  weeklyHoursCommitted: number;
  projectedMonthlyRevenue: number;
  monthlyNetIncomeGoal: number;
  milestones: SideHustleMilestone[];
  expenses: SideHustleExpenseItem[];
}

export interface SideHustleResult {
  ventureName: string;
  weeklyHoursCommitted: number;
  monthlyHoursCommitted: number;
  projectedMonthlyRevenue: number;
  monthlyRecurringExpenses: number;
  projectedMonthlyNetProfit: number;
  goalGapMonthly: number;
  totalStartupCost: number;
  estimatedBreakevenMonths: number | null;
  projectedEffectiveHourlyNet: number;
  totalMilestones: number;
  completedMilestones: number;
  launchReadinessPct: number;
  phaseCounts: Record<HustlePhase, { total: number; completed: number }>;
}

export const DEFAULT_HUSTLE_MILESTONES: SideHustleMilestone[] = [
  { id: 'sh-1', phase: 'Validation', title: 'Interview 10 target customers & validate problem', targetDate: '2026-11-10', estimatedCost: 0, completed: true },
  { id: 'sh-2', phase: 'Build / Offer', title: 'Register domain & build MVP landing page', targetDate: '2026-11-20', estimatedCost: 120, completed: true },
  { id: 'sh-3', phase: 'Marketing', title: 'Launch outreach sequence & 3 case-study posts', targetDate: '2026-12-01', estimatedCost: 180, completed: false },
  { id: 'sh-4', phase: 'Launch', title: 'Onboard first 3 paying pilot clients', targetDate: '2026-12-15', estimatedCost: 100, completed: false }
];

export const DEFAULT_HUSTLE_EXPENSES: SideHustleExpenseItem[] = [
  { id: 'ex-1', name: 'Branding & Domain Setup', amount: 150, frequency: 'one-time' },
  { id: 'ex-2', name: 'Software & Hosting Stack', amount: 65, frequency: 'monthly' },
  { id: 'ex-3', name: 'Marketing & Ad Tests', amount: 150, frequency: 'monthly' }
];

export function validateSideHustleInput(input: SideHustleInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!Number.isFinite(input.weeklyHoursCommitted) || input.weeklyHoursCommitted < 0 || input.weeklyHoursCommitted > 80) {
    errors.push({
      field: 'weeklyHoursCommitted',
      code: 'RANGE_OUT_OF_BOUNDS',
      message: 'Weekly hours committed must be between 0 and 80.',
      invalidValue: input.weeklyHoursCommitted
    });
  }
  if (!Number.isFinite(input.projectedMonthlyRevenue) || input.projectedMonthlyRevenue < 0) {
    errors.push({
      field: 'projectedMonthlyRevenue',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Projected monthly revenue cannot be negative.',
      invalidValue: input.projectedMonthlyRevenue
    });
  }
  if (!Number.isFinite(input.monthlyNetIncomeGoal) || input.monthlyNetIncomeGoal < 0) {
    errors.push({
      field: 'monthlyNetIncomeGoal',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Monthly net income goal cannot be negative.',
      invalidValue: input.monthlyNetIncomeGoal
    });
  }
  for (const m of input.milestones) {
    if (!Number.isFinite(m.estimatedCost) || m.estimatedCost < 0) {
      errors.push({
        field: 'milestones',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Milestone "${m.title}" cost cannot be negative.`,
        invalidValue: m.estimatedCost
      });
    }
  }
  for (const e of input.expenses) {
    if (!Number.isFinite(e.amount) || e.amount < 0) {
      errors.push({
        field: 'expenses',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Expense "${e.name}" amount cannot be negative.`,
        invalidValue: e.amount
      });
    }
  }
  return errors;
}

export function analyzeSideHustlePlan(input: SideHustleInput): SideHustleResult {
  const errors = validateSideHustleInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const oneTimeExpenses = input.expenses
    .filter((e) => e.frequency === 'one-time')
    .reduce((acc, e) => acc + e.amount, 0);
  const milestoneOneTimeCosts = input.milestones.reduce((acc, m) => acc + m.estimatedCost, 0);
  const totalStartupCost = PrecisionEngine.roundFinancial(oneTimeExpenses + milestoneOneTimeCosts);

  const monthlyRecurringExpenses = PrecisionEngine.roundFinancial(
    input.expenses
      .filter((e) => e.frequency === 'monthly')
      .reduce((acc, e) => acc + e.amount, 0)
  );

  const projectedMonthlyNetProfit = PrecisionEngine.roundFinancial(
    input.projectedMonthlyRevenue - monthlyRecurringExpenses
  );
  const goalGapMonthly = PrecisionEngine.roundFinancial(
    projectedMonthlyNetProfit - input.monthlyNetIncomeGoal
  );

  const estimatedBreakevenMonths =
    totalStartupCost === 0
      ? 0
      : projectedMonthlyNetProfit > 0
      ? PrecisionEngine.roundTo(totalStartupCost / projectedMonthlyNetProfit, 1)
      : null;

  const monthlyHoursCommitted = PrecisionEngine.roundTo(input.weeklyHoursCommitted * 4.33, 1);
  const projectedEffectiveHourlyNet =
    monthlyHoursCommitted > 0
      ? PrecisionEngine.roundFinancial(projectedMonthlyNetProfit / monthlyHoursCommitted)
      : 0;

  const totalMilestones = input.milestones.length;
  const completedMilestones = input.milestones.filter((m) => m.completed).length;
  const launchReadinessPct =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const phaseCounts: Record<HustlePhase, { total: number; completed: number }> = {
    Validation: { total: 0, completed: 0 },
    'Build / Offer': { total: 0, completed: 0 },
    Marketing: { total: 0, completed: 0 },
    Launch: { total: 0, completed: 0 }
  };

  for (const m of input.milestones) {
    phaseCounts[m.phase].total++;
    if (m.completed) phaseCounts[m.phase].completed++;
  }

  return {
    ventureName: input.ventureName.trim() || 'Side Hustle Launch Plan',
    weeklyHoursCommitted: input.weeklyHoursCommitted,
    monthlyHoursCommitted,
    projectedMonthlyRevenue: PrecisionEngine.roundFinancial(input.projectedMonthlyRevenue),
    monthlyRecurringExpenses,
    projectedMonthlyNetProfit,
    goalGapMonthly,
    totalStartupCost,
    estimatedBreakevenMonths,
    projectedEffectiveHourlyNet,
    totalMilestones,
    completedMilestones,
    launchReadinessPct,
    phaseCounts
  };
}

export interface SideHustleContractInput {
  ventureName?: string;
  weeklyHoursCommitted: number;
  projectedMonthlyRevenue: number;
  monthlyNetIncomeGoal: number;
  milestones?: SideHustleMilestone[];
  expenses?: SideHustleExpenseItem[];
}

function coerceSideHustleInput(raw: SideHustleContractInput): SideHustleInput {
  return {
    ventureName: raw.ventureName || 'Side Business Venture',
    weeklyHoursCommitted: Number(raw.weeklyHoursCommitted ?? 12),
    projectedMonthlyRevenue: Number(raw.projectedMonthlyRevenue ?? 2200),
    monthlyNetIncomeGoal: Number(raw.monthlyNetIncomeGoal ?? 1500),
    milestones: Array.isArray(raw.milestones) ? raw.milestones : DEFAULT_HUSTLE_MILESTONES,
    expenses: Array.isArray(raw.expenses) ? raw.expenses : DEFAULT_HUSTLE_EXPENSES
  };
}

export const SIDE_HUSTLE_PLANNER_CONTRACT: CalculationContract<
  SideHustleContractInput,
  SideHustleResult
> = {
  id: 'side-hustle-planner',
  name: 'Side Business Milestone & Launch Planner',
  category: 'planners',
  subcategoryId: 'p12-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Side Hustle Startup Budget, Net Profit & Launch Readiness Model',
    formulaExpression:
      'MonthlyNetProfit = ProjectedRevenue - RecurringCosts; BreakevenMonths = StartupCost / MonthlyNetProfit; EffectiveHourly = MonthlyNetProfit / (WeeklyHours * 4.33)',
    variables: [
      { symbol: 'StartupCost', name: 'Total One-Time & Milestone Costs', unit: '$' },
      { symbol: 'MonthlyNetProfit', name: 'Projected Monthly Net Profit', unit: '$/mo' },
      { symbol: 'WeeklyHours', name: 'Weekly Time Commitment', unit: 'hrs/wk' }
    ]
  },
  inputSchema: {
    fields: [
      { name: 'weeklyHoursCommitted', label: 'Weekly Hours Committed', type: 'number', required: true, defaultValue: 12, min: 0, max: 80 },
      { name: 'projectedMonthlyRevenue', label: 'Projected Monthly Revenue ($)', type: 'currency', required: true, defaultValue: 2200, min: 0 },
      { name: 'monthlyNetIncomeGoal', label: 'Monthly Net Income Goal ($)', type: 'currency', required: true, defaultValue: 1500, min: 0 }
    ]
  },
  validate: (inputs) => validateSideHustleInput(coerceSideHustleInput(inputs)),
  calculate: (inputs) => analyzeSideHustlePlan(coerceSideHustleInput(inputs)),
  formatResult: (res) => ({
    primary: {
      label: 'Projected Monthly Net Profit',
      value: ResultFormatter.formatCurrency(res.projectedMonthlyNetProfit),
      numericValue: res.projectedMonthlyNetProfit
    },
    secondary: [
      {
        label: 'Launch Readiness',
        value: `${res.launchReadinessPct}% (${res.completedMilestones}/${res.totalMilestones})`,
        numericValue: res.launchReadinessPct,
        unit: '%'
      },
      {
        label: 'Effective Net Hourly Yield',
        value: `${ResultFormatter.formatCurrency(res.projectedEffectiveHourlyNet)}/hr`,
        numericValue: res.projectedEffectiveHourlyNet
      }
    ],
    breakdown: [
      { label: 'Total Startup Capital Needed', value: ResultFormatter.formatCurrency(res.totalStartupCost) },
      { label: 'Monthly Recurring Overhead', value: ResultFormatter.formatCurrency(res.monthlyRecurringExpenses) },
      {
        label: 'Startup Payback Period',
        value:
          res.estimatedBreakevenMonths !== null
            ? `${res.estimatedBreakevenMonths} months`
            : 'Unprofitable'
      },
      { label: 'Monthly Hours Committed', value: `${res.monthlyHoursCommitted} hrs/mo` }
    ]
  })
};
