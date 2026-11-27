import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';
import { ResultFormatter } from '../../ResultFormatter.ts';

export type DebtStrategy = 'avalanche' | 'snowball';

export interface DebtAccountInput {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface DebtPayoffPlanInput {
  debts: DebtAccountInput[];
  extraMonthlyPayment: number;
  strategy: DebtStrategy;
  startYearMonth?: string; // YYYY-MM
}

export interface DebtScheduleMonthRow {
  month: number;
  dateLabel: string;
  startingBalance: number;
  totalInterest: number;
  totalPrincipal: number;
  totalPayment: number;
  endingBalance: number;
  activeAccounts: number;
  paidOffNames: string[];
  accountBalances: Record<string, number>;
}

export interface DebtAccountAnalysis {
  id: string;
  name: string;
  startingBalance: number;
  apr: number;
  minPayment: number;
  firstMonthInterest: number;
  minCoversInterest: boolean;
  payoffMonth: number | null;
  totalInterestPaid: number;
  totalPaid: number;
  priorityRank: number;
}

export interface DebtStrategySummary {
  strategy: DebtStrategy | 'minimum-only';
  payable: boolean;
  reasonIfUnpayable?: string;
  monthsToPayoff: number;
  estimatedDebtFreeDate: string;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalAmountPaid: number;
  monthlyBudget: number;
  rolloverPeakMonthly: number;
  schedule: DebtScheduleMonthRow[];
  accounts: DebtAccountAnalysis[];
}

export interface DebtRepaymentAnalysisResult {
  strategy: DebtStrategy;
  totalStartingDebt: number;
  totalMinimumPayments: number;
  extraMonthlyPayment: number;
  totalMonthlyPayment: number;
  selectedPlan: DebtStrategySummary;
  avalanchePlan: DebtStrategySummary;
  snowballPlan: DebtStrategySummary;
  minimumOnlyPlan: DebtStrategySummary;
  interestSavedVsMinimum: number | null;
  monthsSavedVsMinimum: number | null;
  interestSavedVsAlternative: number;
  recommendedForLowestInterest: DebtStrategy;
}

export const MAX_AMORTIZATION_MONTHS = 600;
const YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/;

function getDefaultStartYearMonth(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function addMonthsToYearMonth(startYearMonth: string, offsetMonths: number): string {
  const [yStr, mStr] = startYearMonth.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  const totalMonths = y * 12 + (m - 1) + offsetMonths;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
}

function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

function fromCents(cents: number): number {
  return PrecisionEngine.roundFinancial(cents / 100);
}

export function validateDebtPayoffInput(input: DebtPayoffPlanInput): CalculationError[] {
  const errors: CalculationError[] = [];

  if (!Array.isArray(input.debts) || input.debts.length === 0) {
    errors.push({
      field: 'debts',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'At least one debt account is required.'
    });
    return errors;
  }

  if (
    !Number.isFinite(input.extraMonthlyPayment) ||
    input.extraMonthlyPayment < 0
  ) {
    errors.push({
      field: 'extraMonthlyPayment',
      code: 'NON_NEGATIVE_REQUIRED',
      message: 'Extra monthly payment cannot be negative.',
      invalidValue: input.extraMonthlyPayment
    });
  }

  if (input.startYearMonth !== undefined) {
    if (!YEAR_MONTH_REGEX.test(input.startYearMonth)) {
      errors.push({
        field: 'startYearMonth',
        code: 'INVALID_DATE',
        message: 'Start month must be formatted as YYYY-MM.',
        invalidValue: input.startYearMonth
      });
    } else {
      const m = Number(input.startYearMonth.split('-')[1]);
      if (m < 1 || m > 12) {
        errors.push({
          field: 'startYearMonth',
          code: 'INVALID_DATE',
          message: 'Start month must use a valid calendar month (01-12).',
          invalidValue: input.startYearMonth
        });
      }
    }
  }

  for (const d of input.debts) {
    if (!d.name || d.name.trim() === '') {
      errors.push({
        field: 'debts',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'Every debt account must have a name.'
      });
    }
    if (!Number.isFinite(d.balance) || d.balance < 0) {
      errors.push({
        field: 'balance',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Debt "${d.name || d.id}" balance cannot be negative.`,
        invalidValue: d.balance
      });
    }
    if (!Number.isFinite(d.apr) || d.apr < 0 || d.apr > 100) {
      errors.push({
        field: 'apr',
        code: 'PERCENTAGE_OUT_OF_BOUNDS',
        message: `Debt "${d.name || d.id}" APR must be between 0% and 100%.`,
        invalidValue: d.apr
      });
    }
    if (!Number.isFinite(d.minPayment) || d.minPayment < 0) {
      errors.push({
        field: 'minPayment',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Debt "${d.name || d.id}" minimum payment cannot be negative.`,
        invalidValue: d.minPayment
      });
    }
  }

  return errors;
}

function sortPriorityIds<T extends { id: string; balanceCents: number; apr: number; index: number }>(
  items: T[],
  strategy: DebtStrategy | 'minimum-only'
): T[] {
  const copy = [...items];
  if (strategy === 'avalanche') {
    copy.sort((a, b) => {
      if (b.apr !== a.apr) return b.apr - a.apr;
      if (a.balanceCents !== b.balanceCents) return a.balanceCents - b.balanceCents;
      return a.index - b.index;
    });
  } else if (strategy === 'snowball') {
    copy.sort((a, b) => {
      if (a.balanceCents !== b.balanceCents) return a.balanceCents - b.balanceCents;
      if (b.apr !== a.apr) return b.apr - a.apr;
      return a.index - b.index;
    });
  }
  return copy;
}

export function simulateDebtStrategy(
  debts: DebtAccountInput[],
  extraMonthlyPayment: number,
  strategy: DebtStrategy | 'minimum-only',
  startYearMonth: string
): DebtStrategySummary {
  const accountsState = debts.map((d, index) => {
    const balanceCents = toCents(d.balance);
    const minPaymentCents = toCents(d.minPayment);
    const firstMonthInterestCents =
      balanceCents > 0 && d.apr > 0
        ? Math.round(balanceCents * (d.apr / 100 / 12))
        : 0;
    return {
      id: d.id,
      name: d.name.trim(),
      index,
      startingBalanceCents: balanceCents,
      balanceCents,
      apr: d.apr,
      minPaymentCents,
      firstMonthInterestCents,
      minCoversInterest:
        balanceCents === 0 ||
        d.apr === 0 ||
        minPaymentCents > firstMonthInterestCents,
      payoffMonth: balanceCents === 0 ? 0 : (null as number | null),
      totalInterestCents: 0,
      totalPaidCents: 0
    };
  });

  const prioritySortedStatic = sortPriorityIds(accountsState, strategy);
  const priorityRankMap = new Map<string, number>();
  prioritySortedStatic.forEach((item, idx) => priorityRankMap.set(item.id, idx + 1));

  const totalInitialDebtCents = accountsState.reduce((acc, a) => acc + a.startingBalanceCents, 0);
  const totalActiveMinsCents = accountsState
    .filter((a) => a.startingBalanceCents > 0)
    .reduce((acc, a) => acc + a.minPaymentCents, 0);
  const extraCents = strategy === 'minimum-only' ? 0 : toCents(extraMonthlyPayment);
  const monthlyBudgetCents =
    strategy === 'minimum-only'
      ? totalActiveMinsCents
      : totalActiveMinsCents + extraCents;

  if (totalInitialDebtCents === 0) {
    return {
      strategy,
      payable: true,
      monthsToPayoff: 0,
      estimatedDebtFreeDate: startYearMonth,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalAmountPaid: 0,
      monthlyBudget: fromCents(monthlyBudgetCents),
      rolloverPeakMonthly: 0,
      schedule: [],
      accounts: accountsState.map((a) => ({
        id: a.id,
        name: a.name,
        startingBalance: 0,
        apr: a.apr,
        minPayment: fromCents(a.minPaymentCents),
        firstMonthInterest: 0,
        minCoversInterest: true,
        payoffMonth: 0,
        totalInterestPaid: 0,
        totalPaid: 0,
        priorityRank: priorityRankMap.get(a.id) ?? 1
      }))
    };
  }

  // Zero payment check
  if (monthlyBudgetCents <= 0) {
    return {
      strategy,
      payable: false,
      reasonIfUnpayable: 'Total monthly payment must be greater than zero to reduce positive balances.',
      monthsToPayoff: 0,
      estimatedDebtFreeDate: 'N/A',
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalAmountPaid: 0,
      monthlyBudget: 0,
      rolloverPeakMonthly: 0,
      schedule: [],
      accounts: accountsState.map((a) => ({
        id: a.id,
        name: a.name,
        startingBalance: fromCents(a.startingBalanceCents),
        apr: a.apr,
        minPayment: fromCents(a.minPaymentCents),
        firstMonthInterest: fromCents(a.firstMonthInterestCents),
        minCoversInterest: a.minCoversInterest,
        payoffMonth: null,
        totalInterestPaid: 0,
        totalPaid: 0,
        priorityRank: priorityRankMap.get(a.id) ?? 1
      }))
    };
  }

  const schedule: DebtScheduleMonthRow[] = [];
  let totalInterestAllCents = 0;
  let totalPrincipalAllCents = 0;
  let totalPaidAllCents = 0;
  let rolloverPeakCents = extraCents;
  let month = 0;

  while (month < MAX_AMORTIZATION_MONTHS) {
    const activeAccounts = accountsState.filter((a) => a.balanceCents > 0);
    if (activeAccounts.length === 0) break;

    month++;
    const startingBalanceCents = activeAccounts.reduce((acc, a) => acc + a.balanceCents, 0);

    // 1. Accrue monthly interest on each active account
    const monthInterestMap = new Map<string, number>();
    let monthInterestCents = 0;
    for (const acc of activeAccounts) {
      const interestCents =
        acc.apr > 0 ? Math.round(acc.balanceCents * (acc.apr / 100 / 12)) : 0;
      monthInterestMap.set(acc.id, interestCents);
      monthInterestCents += interestCents;
    }

    // 2. Determine available budget for this month
    const activeMinimumSum = activeAccounts.reduce((acc, a) => acc + a.minPaymentCents, 0);
    const freedMinimums = Math.max(0, totalActiveMinsCents - activeMinimumSum);
    if (strategy !== 'minimum-only') {
      const potentialRollover = extraCents + freedMinimums;
      if (potentialRollover > rolloverPeakCents) rolloverPeakCents = potentialRollover;
    }

    const totalDueNow = startingBalanceCents + monthInterestCents;
    const targetMonthBudget =
      strategy === 'minimum-only'
        ? activeMinimumSum
        : monthlyBudgetCents;

    // Detect negative amortization / stalled payoff when total monthly budget cannot exceed accrued interest
    if (targetMonthBudget <= monthInterestCents && totalDueNow > targetMonthBudget) {
      const failingNames = activeAccounts
        .filter((a) => a.minPaymentCents <= (monthInterestMap.get(a.id) ?? 0))
        .map((a) => a.name);
      return {
        strategy,
        payable: false,
        reasonIfUnpayable:
          failingNames.length > 0
            ? `Monthly payment does not cover accruing interest for: ${failingNames.join(', ')}.`
            : 'Monthly payment budget does not exceed accruing monthly interest.',
        monthsToPayoff: month,
        estimatedDebtFreeDate: 'N/A',
        totalInterestPaid: fromCents(totalInterestAllCents),
        totalPrincipalPaid: fromCents(totalPrincipalAllCents),
        totalAmountPaid: fromCents(totalPaidAllCents),
        monthlyBudget: fromCents(monthlyBudgetCents),
        rolloverPeakMonthly: fromCents(rolloverPeakCents),
        schedule,
        accounts: accountsState.map((a) => ({
          id: a.id,
          name: a.name,
          startingBalance: fromCents(a.startingBalanceCents),
          apr: a.apr,
          minPayment: fromCents(a.minPaymentCents),
          firstMonthInterest: fromCents(a.firstMonthInterestCents),
          minCoversInterest: a.minCoversInterest,
          payoffMonth: a.payoffMonth,
          totalInterestPaid: fromCents(a.totalInterestCents),
          totalPaid: fromCents(a.totalPaidCents),
          priorityRank: priorityRankMap.get(a.id) ?? 1
        }))
      };
    }

    // In minimum-only mode, check each account individually for negative amortization
    if (strategy === 'minimum-only') {
      const stalledAccounts = activeAccounts.filter((a) => {
        const interestCents = monthInterestMap.get(a.id) ?? 0;
        const due = a.balanceCents + interestCents;
        return due > a.minPaymentCents && a.minPaymentCents <= interestCents;
      });
      if (stalledAccounts.length > 0) {
        return {
          strategy,
          payable: false,
          reasonIfUnpayable: `Minimum payment alone does not cover monthly interest for: ${stalledAccounts
            .map((a) => a.name)
            .join(', ')}.`,
          monthsToPayoff: month,
          estimatedDebtFreeDate: 'N/A',
          totalInterestPaid: fromCents(totalInterestAllCents),
          totalPrincipalPaid: fromCents(totalPrincipalAllCents),
          totalAmountPaid: fromCents(totalPaidAllCents),
          monthlyBudget: fromCents(monthlyBudgetCents),
          rolloverPeakMonthly: 0,
          schedule,
          accounts: accountsState.map((a) => ({
            id: a.id,
            name: a.name,
            startingBalance: fromCents(a.startingBalanceCents),
            apr: a.apr,
            minPayment: fromCents(a.minPaymentCents),
            firstMonthInterest: fromCents(a.firstMonthInterestCents),
            minCoversInterest: a.minCoversInterest,
            payoffMonth: a.payoffMonth,
            totalInterestPaid: fromCents(a.totalInterestCents),
            totalPaid: fromCents(a.totalPaidCents),
            priorityRank: priorityRankMap.get(a.id) ?? 1
          }))
        };
      }
    }

    // 3. Allocate minimum payments first
    const paymentAllocation = new Map<string, number>();
    let totalAllocatedThisMonth = 0;

    for (const acc of activeAccounts) {
      const due = acc.balanceCents + (monthInterestMap.get(acc.id) ?? 0);
      const minPay = Math.min(due, acc.minPaymentCents);
      paymentAllocation.set(acc.id, minPay);
      totalAllocatedThisMonth += minPay;
    }

    // 4. Allocate extra + rolled-over payments down priority queue (unless minimum-only)
    if (strategy !== 'minimum-only') {
      let remainingExtraPool = Math.max(0, monthlyBudgetCents - totalAllocatedThisMonth);
      const prioritizedActive = sortPriorityIds(activeAccounts, strategy);
      for (const acc of prioritizedActive) {
        if (remainingExtraPool <= 0) break;
        const due = acc.balanceCents + (monthInterestMap.get(acc.id) ?? 0);
        const alreadyPaid = paymentAllocation.get(acc.id) ?? 0;
        const room = Math.max(0, due - alreadyPaid);
        if (room > 0) {
          const addPay = Math.min(room, remainingExtraPool);
          paymentAllocation.set(acc.id, alreadyPaid + addPay);
          remainingExtraPool -= addPay;
          totalAllocatedThisMonth += addPay;
        }
      }
    }

    // 5. Apply interest & payments and capture payoff events
    let monthPrincipalCents = 0;
    const paidOffNames: string[] = [];
    const accountBalances: Record<string, number> = {};

    for (const acc of accountsState) {
      if (acc.balanceCents <= 0) {
        accountBalances[acc.id] = 0;
        continue;
      }
      const interestCents = monthInterestMap.get(acc.id) ?? 0;
      const paidCents = paymentAllocation.get(acc.id) ?? 0;
      const newBalanceCents = Math.max(0, acc.balanceCents + interestCents - paidCents);
      const principalReductionCents = acc.balanceCents - newBalanceCents;

      acc.balanceCents = newBalanceCents;
      acc.totalInterestCents += interestCents;
      acc.totalPaidCents += paidCents;
      monthPrincipalCents += principalReductionCents;

      if (newBalanceCents === 0 && acc.payoffMonth === null) {
        acc.payoffMonth = month;
        paidOffNames.push(acc.name);
      }
      accountBalances[acc.id] = fromCents(newBalanceCents);
    }

    totalInterestAllCents += monthInterestCents;
    totalPrincipalAllCents += monthPrincipalCents;
    totalPaidAllCents += totalAllocatedThisMonth;

    const endingBalanceCents = accountsState.reduce((acc, a) => acc + a.balanceCents, 0);

    schedule.push({
      month,
      dateLabel: addMonthsToYearMonth(startYearMonth, month),
      startingBalance: fromCents(startingBalanceCents),
      totalInterest: fromCents(monthInterestCents),
      totalPrincipal: fromCents(monthPrincipalCents),
      totalPayment: fromCents(totalAllocatedThisMonth),
      endingBalance: fromCents(endingBalanceCents),
      activeAccounts: accountsState.filter((a) => a.balanceCents > 0).length,
      paidOffNames,
      accountBalances
    });
  }

  const stillHasBalance = accountsState.some((a) => a.balanceCents > 0);
  if (stillHasBalance) {
    return {
      strategy,
      payable: false,
      reasonIfUnpayable: `Debt payoff could not complete within ${MAX_AMORTIZATION_MONTHS} months (50 years). Increase your monthly payment.`,
      monthsToPayoff: month,
      estimatedDebtFreeDate: 'N/A',
      totalInterestPaid: fromCents(totalInterestAllCents),
      totalPrincipalPaid: fromCents(totalPrincipalAllCents),
      totalAmountPaid: fromCents(totalPaidAllCents),
      monthlyBudget: fromCents(monthlyBudgetCents),
      rolloverPeakMonthly: fromCents(rolloverPeakCents),
      schedule,
      accounts: accountsState.map((a) => ({
        id: a.id,
        name: a.name,
        startingBalance: fromCents(a.startingBalanceCents),
        apr: a.apr,
        minPayment: fromCents(a.minPaymentCents),
        firstMonthInterest: fromCents(a.firstMonthInterestCents),
        minCoversInterest: a.minCoversInterest,
        payoffMonth: a.payoffMonth,
        totalInterestPaid: fromCents(a.totalInterestCents),
        totalPaid: fromCents(a.totalPaidCents),
        priorityRank: priorityRankMap.get(a.id) ?? 1
      }))
    };
  }

  return {
    strategy,
    payable: true,
    monthsToPayoff: month,
    estimatedDebtFreeDate: addMonthsToYearMonth(startYearMonth, month),
    totalInterestPaid: fromCents(totalInterestAllCents),
    totalPrincipalPaid: fromCents(totalPrincipalAllCents),
    totalAmountPaid: fromCents(totalPaidAllCents),
    monthlyBudget: fromCents(monthlyBudgetCents),
    rolloverPeakMonthly: fromCents(rolloverPeakCents),
    schedule,
    accounts: accountsState.map((a) => ({
      id: a.id,
      name: a.name,
      startingBalance: fromCents(a.startingBalanceCents),
      apr: a.apr,
      minPayment: fromCents(a.minPaymentCents),
      firstMonthInterest: fromCents(a.firstMonthInterestCents),
      minCoversInterest: a.minCoversInterest,
      payoffMonth: a.payoffMonth,
      totalInterestPaid: fromCents(a.totalInterestCents),
      totalPaid: fromCents(a.totalPaidCents),
      priorityRank: priorityRankMap.get(a.id) ?? 1
    }))
  };
}

export function analyzeDebtRepayment(input: DebtPayoffPlanInput): DebtRepaymentAnalysisResult {
  const errors = validateDebtPayoffInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const startYearMonth = input.startYearMonth ?? getDefaultStartYearMonth();
  const avalanchePlan = simulateDebtStrategy(
    input.debts,
    input.extraMonthlyPayment,
    'avalanche',
    startYearMonth
  );
  const snowballPlan = simulateDebtStrategy(
    input.debts,
    input.extraMonthlyPayment,
    'snowball',
    startYearMonth
  );
  const minimumOnlyPlan = simulateDebtStrategy(
    input.debts,
    0,
    'minimum-only',
    startYearMonth
  );

  const selectedPlan = input.strategy === 'avalanche' ? avalanchePlan : snowballPlan;
  const alternativePlan = input.strategy === 'avalanche' ? snowballPlan : avalanchePlan;

  const totalStartingDebt = PrecisionEngine.roundFinancial(
    input.debts.reduce((acc, d) => acc + d.balance, 0)
  );
  const totalMinimumPayments = PrecisionEngine.roundFinancial(
    input.debts.filter((d) => d.balance > 0).reduce((acc, d) => acc + d.minPayment, 0)
  );
  const extraMonthlyPayment = PrecisionEngine.roundFinancial(input.extraMonthlyPayment);
  const totalMonthlyPayment = PrecisionEngine.roundFinancial(
    totalMinimumPayments + extraMonthlyPayment
  );

  const interestSavedVsMinimum =
    selectedPlan.payable && minimumOnlyPlan.payable
      ? PrecisionEngine.roundFinancial(
          Math.max(0, minimumOnlyPlan.totalInterestPaid - selectedPlan.totalInterestPaid)
        )
      : null;

  const monthsSavedVsMinimum =
    selectedPlan.payable && minimumOnlyPlan.payable
      ? Math.max(0, minimumOnlyPlan.monthsToPayoff - selectedPlan.monthsToPayoff)
      : null;

  const interestSavedVsAlternative =
    selectedPlan.payable && alternativePlan.payable
      ? PrecisionEngine.roundFinancial(
          alternativePlan.totalInterestPaid - selectedPlan.totalInterestPaid
        )
      : 0;

  const recommendedForLowestInterest: DebtStrategy =
    avalanchePlan.payable &&
    (!snowballPlan.payable || avalanchePlan.totalInterestPaid <= snowballPlan.totalInterestPaid)
      ? 'avalanche'
      : 'snowball';

  return {
    strategy: input.strategy,
    totalStartingDebt,
    totalMinimumPayments,
    extraMonthlyPayment,
    totalMonthlyPayment,
    selectedPlan,
    avalanchePlan,
    snowballPlan,
    minimumOnlyPlan,
    interestSavedVsMinimum,
    monthsSavedVsMinimum,
    interestSavedVsAlternative,
    recommendedForLowestInterest
  };
}

export interface DebtContractScalarInput {
  debts?: DebtAccountInput[];
  primaryDebtBalance?: number;
  primaryDebtApr?: number;
  primaryDebtMinPayment?: number;
  secondaryDebtBalance?: number;
  secondaryDebtApr?: number;
  secondaryDebtMinPayment?: number;
  extraMonthlyPayment: number;
  strategy: DebtStrategy;
  startYearMonth?: string;
}

function coerceDebtContractInput(raw: DebtContractScalarInput): DebtPayoffPlanInput {
  if (Array.isArray(raw.debts)) {
    return {
      debts: raw.debts,
      extraMonthlyPayment: Number(raw.extraMonthlyPayment ?? 0),
      strategy: raw.strategy || 'avalanche',
      startYearMonth: raw.startYearMonth
    };
  }
  const debts: DebtAccountInput[] = [
    {
      id: 'debt-1',
      name: 'Debt 1',
      balance: Number(raw.primaryDebtBalance ?? 3500),
      apr: Number(raw.primaryDebtApr ?? 19.99),
      minPayment: Number(raw.primaryDebtMinPayment ?? 100)
    }
  ];
  if (raw.secondaryDebtBalance !== undefined && Number(raw.secondaryDebtBalance) >= 0) {
    debts.push({
      id: 'debt-2',
      name: 'Debt 2',
      balance: Number(raw.secondaryDebtBalance),
      apr: Number(raw.secondaryDebtApr ?? 6.5),
      minPayment: Number(raw.secondaryDebtMinPayment ?? 320)
    });
  }
  return {
    debts,
    extraMonthlyPayment: Number(raw.extraMonthlyPayment ?? 0),
    strategy: raw.strategy || 'avalanche',
    startYearMonth: raw.startYearMonth
  };
}

function createDebtPlannerContract(
  id: 'debt-repayment-planner' | 'debt-snowball-avalanche-planner',
  name: string,
  subcategoryId: string
): CalculationContract<DebtContractScalarInput, DebtRepaymentAnalysisResult> {
  return {
    id,
    name,
    category: 'planners',
    subcategoryId,
    isSyntheticFallback: false,
    implementationTier: 'explicit-tested',
    formulaMeta: {
      formulaName: 'Monthly Debt Amortization with Avalanche/Snowball Rollover',
      formulaExpression:
        'I_m = round(B_{m-1} * APR / 12); B_m = max(0, B_{m-1} + I_m - P_m) with freed minimum rollover',
      variables: [
        { symbol: 'B_m', name: 'Remaining Balance at Month m', unit: '$' },
        { symbol: 'I_m', name: 'Monthly Interest Accrued', unit: '$' },
        { symbol: 'P_m', name: 'Allocated Monthly Payment', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        {
          name: 'primaryDebtBalance',
          label: 'Primary Debt Balance ($)',
          type: 'currency',
          required: true,
          defaultValue: 3500,
          min: 0
        },
        {
          name: 'primaryDebtApr',
          label: 'Primary Debt APR (%)',
          type: 'percentage',
          required: true,
          defaultValue: 19.99,
          min: 0,
          max: 100
        },
        {
          name: 'primaryDebtMinPayment',
          label: 'Primary Minimum Payment ($)',
          type: 'currency',
          required: true,
          defaultValue: 100,
          min: 0
        },
        {
          name: 'secondaryDebtBalance',
          label: 'Secondary Debt Balance ($)',
          type: 'currency',
          required: false,
          defaultValue: 12000,
          min: 0
        },
        {
          name: 'secondaryDebtApr',
          label: 'Secondary Debt APR (%)',
          type: 'percentage',
          required: false,
          defaultValue: 6.5,
          min: 0,
          max: 100
        },
        {
          name: 'secondaryDebtMinPayment',
          label: 'Secondary Minimum Payment ($)',
          type: 'currency',
          required: false,
          defaultValue: 320,
          min: 0
        },
        {
          name: 'extraMonthlyPayment',
          label: 'Extra Monthly Payment ($)',
          type: 'currency',
          required: true,
          defaultValue: 250,
          min: 0
        },
        {
          name: 'strategy',
          label: 'Repayment Strategy',
          type: 'select',
          required: true,
          defaultValue: 'avalanche',
          options: [
            { label: 'Avalanche (Highest APR)', value: 'avalanche' },
            { label: 'Snowball (Lowest Balance)', value: 'snowball' }
          ]
        }
      ]
    },
    validate: (inputs) => {
      const normalized = coerceDebtContractInput(inputs);
      const baseErrors = validateDebtPayoffInput(normalized);
      if (baseErrors.length > 0) return baseErrors;
      const analysis = analyzeDebtRepayment(normalized);
      if (!analysis.selectedPlan.payable) {
        return [
          {
            field: 'extraMonthlyPayment',
            code: 'MATHEMATICAL_DOMAIN_ERROR',
            message:
              analysis.selectedPlan.reasonIfUnpayable ||
              'Debt plan cannot reach payoff within the 600-month simulation limit.'
          }
        ];
      }
      return [];
    },
    calculate: (inputs) => analyzeDebtRepayment(coerceDebtContractInput(inputs)),
    formatResult: (res) => ({
      primary: {
        label: 'Months to Debt-Free',
        value: res.selectedPlan.payable
          ? `${res.selectedPlan.monthsToPayoff} months`
          : 'Unpayable',
        numericValue: res.selectedPlan.monthsToPayoff,
        unit: 'months'
      },
      secondary: [
        {
          label: 'Total Interest Paid',
          value: ResultFormatter.formatCurrency(res.selectedPlan.totalInterestPaid),
          numericValue: res.selectedPlan.totalInterestPaid
        },
        {
          label: 'Estimated Debt-Free Date',
          value: res.selectedPlan.estimatedDebtFreeDate,
          numericValue: res.selectedPlan.monthsToPayoff
        }
      ],
      breakdown: [
        { label: 'Total Starting Debt', value: ResultFormatter.formatCurrency(res.totalStartingDebt) },
        { label: 'Total Amount Paid', value: ResultFormatter.formatCurrency(res.selectedPlan.totalAmountPaid) },
        {
          label: 'Interest Saved vs. Minimums',
          value:
            res.interestSavedVsMinimum !== null
              ? ResultFormatter.formatCurrency(res.interestSavedVsMinimum)
              : 'Minimums unpayable'
        },
        {
          label: 'Avalanche vs Snowball Interest Diff',
          value: ResultFormatter.formatCurrency(
            Math.abs(res.avalanchePlan.totalInterestPaid - res.snowballPlan.totalInterestPaid)
          )
        }
      ]
    })
  };
}

export const DEBT_REPAYMENT_PLANNER_CONTRACT = createDebtPlannerContract(
  'debt-repayment-planner',
  'Debt Repayment & Amortization Planner',
  'planners-expansion-finance'
);

export const DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT = createDebtPlannerContract(
  'debt-snowball-avalanche-planner',
  'Personal Debt Snowball & Avalanche Payoff Planner',
  'p15b-sub-plan'
);
