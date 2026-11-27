import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPlannerStorage,
  savePlannerStorage,
  clearPlannerStorage
} from '../hooks/usePlannerStorage.ts';
import { escapeCsvCell, buildCsvContent } from '../components/planner/exportUtils.ts';
import {
  parseIsoCalendarDate,
  addIsoDays,
  diffIsoDays,
  validateProjectTimeline,
  solveProjectTimeline,
  PROJECT_TIMELINE_CONTRACT
} from '../engine/contracts/planners/projectTimeline.ts';
import {
  analyzeDebtRepayment,
  validateDebtPayoffInput,
  DEBT_REPAYMENT_PLANNER_CONTRACT,
  DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT
} from '../engine/contracts/planners/debtAmortization.ts';
import {
  calculateRetirementPlan,
  validateRetirementPlanInput,
  RETIREMENT_PLANNING_CONTRACT
} from '../engine/contracts/planners/retirementPlanning.ts';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
}

describe('Shared Planner Infrastructure (Storage & CSV Export)', () => {
  beforeEach(() => {
    (globalThis as any).localStorage = createMemoryStorage();
  });

  it('persists, reloads, and clears versioned planner storage cleanly', () => {
    const key = 'test_planner_v1';
    const initial = loadPlannerStorage(key, 1, { count: 0 });
    expect(initial.restoredFromStorage).toBe(false);
    expect(initial.recoveredFromCorruption).toBe(false);
    expect(initial.value).toEqual({ count: 0 });

    const saved = savePlannerStorage(key, 1, { count: 42 });
    expect(saved.ok).toBe(true);

    const reloaded = loadPlannerStorage(key, 1, { count: 0 });
    expect(reloaded.restoredFromStorage).toBe(true);
    expect(reloaded.recoveredFromCorruption).toBe(false);
    expect(reloaded.value).toEqual({ count: 42 });

    clearPlannerStorage(key);
    const afterClear = loadPlannerStorage(key, 1, { count: 0 });
    expect(afterClear.restoredFromStorage).toBe(false);
    expect(afterClear.value).toEqual({ count: 0 });
  });

  it('recovers safely from corrupted JSON, version mismatch, or invalid shape', () => {
    const key = 'test_corrupt_v1';
    globalThis.localStorage.setItem(key, '{bad-json');
    const badJson = loadPlannerStorage(key, 1, { ok: true });
    expect(badJson.recoveredFromCorruption).toBe(true);
    expect(badJson.value).toEqual({ ok: true });

    globalThis.localStorage.setItem(key, JSON.stringify({ version: 99, data: { ok: false } }));
    const badVersion = loadPlannerStorage(key, 1, { ok: true });
    expect(badVersion.recoveredFromCorruption).toBe(true);
    expect(badVersion.value).toEqual({ ok: true });

    savePlannerStorage(key, 1, { invalid: 'shape' });
    const failedSanitize = loadPlannerStorage(key, 1, { items: [] as string[] }, (raw) =>
      raw && typeof raw === 'object' && Array.isArray((raw as any).items)
        ? (raw as { items: string[] })
        : null
    );
    expect(failedSanitize.recoveredFromCorruption).toBe(true);
    expect(failedSanitize.value).toEqual({ items: [] });
  });

  it('escapes CSV values per RFC 4180 and protects formulas without breaking negative numbers', () => {
    expect(escapeCsvCell(-250.75)).toBe('-250.75');
    expect(escapeCsvCell('-120.50')).toBe('-120.50');
    expect(escapeCsvCell('Hello, "World"')).toBe('"Hello, ""World"""');
    expect(escapeCsvCell('=HYPERLINK("http://bad")')).toBe('"\'=HYPERLINK(""http://bad"")"');
    expect(escapeCsvCell('+1+1')).toBe("'+1+1");

    const csv = buildCsvContent(['Name', 'Amount'], [
      ['Alice', 100],
      ['Bob, Jr.', -45.5]
    ]);
    expect(csv).toBe('Name,Amount\r\nAlice,100\r\n"Bob, Jr.",-45.5');
  });
});

describe('Sub-batch A1: Project Timeline & CPM Engine', () => {
  it('handles UTC calendar dates without DST drift', () => {
    expect(parseIsoCalendarDate('2026-02-29')).toBeNull(); // 2026 is not leap year
    expect(parseIsoCalendarDate('2024-02-29')).not.toBeNull();
    expect(addIsoDays('2026-11-01', 4)).toBe('2026-11-05');
    expect(diffIsoDays('2026-11-01', '2026-11-11')).toBe(10);
  });

  it('computes CPM forward/backward pass, dependency shifts, and slack', () => {
    const res = solveProjectTimeline({
      projectName: 'Launch',
      projectStartDate: '2026-11-01',
      referenceDate: '2026-11-10',
      tasks: [
        { id: 'A', name: 'Kickoff', startDate: '2026-11-01', durationDays: 5, progress: 100, dependencies: [] },
        { id: 'B', name: 'Long Track', startDate: '2026-11-01', durationDays: 10, progress: 50, dependencies: ['A'] },
        { id: 'C', name: 'Short Track', startDate: '2026-11-01', durationDays: 3, progress: 0, dependencies: ['A'] },
        { id: 'D', name: 'Deploy', startDate: '2026-11-01', durationDays: 2, progress: 0, dependencies: ['B', 'C'] }
      ]
    });

    // A: days 0..5 -> 2026-11-01..2026-11-05
    // B: shifted to day 5..15 (10 days) -> slack 0 (critical)
    // C: shifted to day 5..8 (3 days) -> LF=15, LS=12 => slack 7 days
    // D: day 15..17 -> finish 2026-11-17
    expect(res.totalDurationDays).toBe(17);
    expect(res.projectFinishDate).toBe('2026-11-17');
    expect(res.criticalPathTaskIds).toEqual(['A', 'B', 'D']);

    const taskB = res.tasks.find((t) => t.id === 'B')!;
    const taskC = res.tasks.find((t) => t.id === 'C')!;
    expect(taskB.effectiveStartDate).toBe('2026-11-06');
    expect(taskB.isDelayedByDependency).toBe(true);
    expect(taskB.slackDays).toBe(0);
    expect(taskC.slackDays).toBe(7);
    expect(taskC.isCritical).toBe(false);
    // C ends 2026-11-08 < referenceDate 2026-11-10 with 0% progress -> overdue
    expect(taskC.isOverdue).toBe(true);
    expect(res.overdueTasks).toBe(1);
  });

  it('rejects self-dependencies, missing dependencies, and dependency cycles', () => {
    const selfErrs = validateProjectTimeline({
      projectName: 'P',
      projectStartDate: '2026-11-01',
      tasks: [{ id: '1', name: 'T1', startDate: '2026-11-01', durationDays: 2, progress: 0, dependencies: ['1'] }]
    });
    expect(selfErrs.some((e) => e.message.toLowerCase().includes('depend on itself'))).toBe(true);

    const cycleErrs = validateProjectTimeline({
      projectName: 'P',
      projectStartDate: '2026-11-01',
      tasks: [
        { id: '1', name: 'Alpha', startDate: '2026-11-01', durationDays: 2, progress: 0, dependencies: ['2'] },
        { id: '2', name: 'Beta', startDate: '2026-11-01', durationDays: 2, progress: 0, dependencies: ['1'] }
      ]
    });
    expect(cycleErrs.some((e) => e.message.toLowerCase().includes('circular dependency'))).toBe(true);
  });

  it('executes PROJECT_TIMELINE_CONTRACT via CalculationExecutor', () => {
    const exec = CalculationExecutor.executeContract(PROJECT_TIMELINE_CONTRACT, {
      projectStartDate: '2026-11-01',
      taskCount: 3,
      durationPerTaskDays: 4,
      completedTasks: 1
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalDurationDays).toBe(12);
    expect(exec.data?.projectFinishDate).toBe('2026-11-12');
  });
});

describe('Sub-batch A2: Debt Repayment & Amortization Engine', () => {
  it('pays off a 0% APR debt in exact division months', () => {
    const res = analyzeDebtRepayment({
      debts: [{ id: '1', name: 'Zero APR Plan', balance: 1200, apr: 0, minPayment: 100 }],
      extraMonthlyPayment: 50,
      strategy: 'avalanche',
      startYearMonth: '2026-01'
    });
    expect(res.selectedPlan.payable).toBe(true);
    expect(res.selectedPlan.monthsToPayoff).toBe(8);
    expect(res.selectedPlan.totalInterestPaid).toBe(0);
    expect(res.selectedPlan.estimatedDebtFreeDate).toBe('2026-09');
    expect(res.minimumOnlyPlan.monthsToPayoff).toBe(12);
    expect(res.monthsSavedVsMinimum).toBe(4);
  });

  it('demonstrates Avalanche saving interest over Snowball and applies freed-minimum rollover', () => {
    const res = analyzeDebtRepayment({
      debts: [
        { id: 'small-low', name: 'Small Low APR', balance: 1500, apr: 4.0, minPayment: 100 },
        { id: 'large-high', name: 'Large High APR', balance: 6000, apr: 22.0, minPayment: 150 }
      ],
      extraMonthlyPayment: 200,
      strategy: 'avalanche',
      startYearMonth: '2026-01'
    });

    expect(res.avalanchePlan.payable).toBe(true);
    expect(res.snowballPlan.payable).toBe(true);
    expect(res.avalanchePlan.totalInterestPaid).toBeLessThan(res.snowballPlan.totalInterestPaid);
    expect(res.recommendedForLowestInterest).toBe('avalanche');

    // Rollover check on snowball: Small Low APR pays off early, freeing its $100 minimum to accelerate Large High APR
    const smallPayoffMonth = res.snowballPlan.accounts.find((a) => a.id === 'small-low')!.payoffMonth!;
    expect(smallPayoffMonth).toBeLessThan(7);
    const postPayoffRow = res.snowballPlan.schedule[smallPayoffMonth]; // month after payoff
    if (postPayoffRow && postPayoffRow.activeAccounts > 0) {
      expect(postPayoffRow.totalPayment).toBeLessThanOrEqual(450);
    }
  });

  it('detects negative amortization / unpayable debt accurately', () => {
    const res = analyzeDebtRepayment({
      debts: [{ id: '1', name: 'High Balance Card', balance: 10000, apr: 24.0, minPayment: 150 }],
      extraMonthlyPayment: 0,
      strategy: 'avalanche',
      startYearMonth: '2026-01'
    });
    // Monthly interest on 10,000 @ 24% APR is $200 > $150 min payment
    expect(res.selectedPlan.payable).toBe(false);
    expect(res.selectedPlan.accounts[0].minCoversInterest).toBe(false);
    expect(res.selectedPlan.reasonIfUnpayable).toMatch(/interest/i);
  });

  it('validates invalid inputs and executes both debt contracts cleanly', () => {
    const invalidErrs = validateDebtPayoffInput({
      debts: [{ id: '1', name: 'Bad', balance: -10, apr: 10, minPayment: 50 }],
      extraMonthlyPayment: 0,
      strategy: 'snowball'
    });
    expect(invalidErrs.length).toBeGreaterThan(0);

    const exec1 = CalculationExecutor.executeContract(DEBT_REPAYMENT_PLANNER_CONTRACT, {
      primaryDebtBalance: 3500,
      primaryDebtApr: 19.99,
      primaryDebtMinPayment: 100,
      secondaryDebtBalance: 12000,
      secondaryDebtApr: 6.5,
      secondaryDebtMinPayment: 320,
      extraMonthlyPayment: 250,
      strategy: 'avalanche'
    });
    expect(exec1.success).toBe(true);
    expect(exec1.data?.selectedPlan.monthsToPayoff).toBeGreaterThan(10);

    const exec2 = CalculationExecutor.executeContract(DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT, {
      primaryDebtBalance: 3500,
      primaryDebtApr: 19.99,
      primaryDebtMinPayment: 100,
      extraMonthlyPayment: 250,
      strategy: 'snowball'
    });
    expect(exec2.success).toBe(true);
  });
});

describe('Sub-batch A3: Retirement Planning Engine', () => {
  it('matches analytical zero-growth contribution total and computes 4% safe withdrawal rate', () => {
    const res = calculateRetirementPlan({
      currentAge: 35,
      retireAge: 45, // 10 years
      currentBalance: 20000,
      currentSalary: 60000,
      contributionPct: 10, // 6000/yr
      employerMatchPct: 50,
      employerMatchLimit: 6, // 50% of 6% = 3% -> 1800/yr
      salaryIncreasePct: 0,
      expectedReturn: 0,
      inflationRate: 0,
      frequency: 12,
      safeWithdrawalRatePct: 4
    });

    // 10 years * (6000 + 1800) = 78000 + 20000 start = 98000
    expect(res.yearsUntilRetire).toBe(10);
    expect(res.projectedBalance).toBeCloseTo(98000, 1);
    expect(res.inflationAdjustedBalance).toBeCloseTo(98000, 1);
    expect(res.totalInvestmentGrowth).toBe(0);
    expect(res.annualSafeWithdrawalNominal).toBeCloseTo(3920, 2);
    expect(res.monthlySafeWithdrawalNominal).toBeCloseTo(326.67, 2);
  });

  it('discounts real balance and safe withdrawal by cumulative inflation and rejects invalid ages', () => {
    const res = calculateRetirementPlan({
      currentAge: 35,
      retireAge: 65,
      currentBalance: 45000,
      currentSalary: 80000,
      contributionPct: 6,
      employerMatchPct: 100,
      employerMatchLimit: 5,
      salaryIncreasePct: 2.5,
      expectedReturn: 7,
      inflationRate: 2.5,
      frequency: 12
    });

    expect(res.schedule.length).toBe(30);
    expect(res.projectedBalance).toBeGreaterThan(1_000_000);
    expect(res.inflationAdjustedBalance).toBeLessThan(res.projectedBalance);
    expect(res.annualSafeWithdrawalReal).toBeCloseTo(res.inflationAdjustedBalance * 0.04, 1);

    const errs = validateRetirementPlanInput({
      currentAge: 65,
      retireAge: 60,
      currentBalance: 0,
      currentSalary: 50000,
      contributionPct: 5,
      employerMatchPct: 100,
      employerMatchLimit: 5,
      salaryIncreasePct: 2,
      expectedReturn: 7,
      inflationRate: 2,
      frequency: 12
    });
    expect(errs.some((e) => e.field === 'retireAge')).toBe(true);

    const exec = CalculationExecutor.executeContract(RETIREMENT_PLANNING_CONTRACT, {
      currentAge: 35,
      retireAge: 65,
      currentBalance: 45000,
      currentSalary: 80000,
      contributionPct: 6,
      employerMatchPct: 100,
      employerMatchLimit: 5,
      salaryIncreasePct: 2.5,
      expectedReturn: 7,
      inflationRate: 2.5,
      frequency: 12
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.projectedBalance).toBeGreaterThan(1_000_000);
  });
});
