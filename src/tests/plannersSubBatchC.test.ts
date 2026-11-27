import { describe, it, expect } from 'vitest';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import {
  analyzeSideHustlePlan,
  validateSideHustleInput,
  SIDE_HUSTLE_PLANNER_CONTRACT,
  DEFAULT_HUSTLE_EXPENSES,
  DEFAULT_HUSTLE_MILESTONES
} from '../engine/contracts/planners/sideHustle.ts';
import {
  analyzeCashFlowForecast,
  validateCashFlowInput,
  CASH_FLOW_FORECAST_PLANNER_CONTRACT,
  DEFAULT_CASH_FLOW_ITEMS
} from '../engine/contracts/planners/cashFlowForecast.ts';
import { DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT } from '../engine/contracts/planners/debtAmortization.ts';

describe('Sub-batch C1: Side Hustle Milestone & Launch Planner', () => {
  it('computes startup capital, monthly net profit, payback period, and launch readiness', () => {
    const res = analyzeSideHustlePlan({
      ventureName: 'Consulting',
      weeklyHoursCommitted: 10,
      projectedMonthlyRevenue: 2000,
      monthlyNetIncomeGoal: 1200,
      milestones: [
        { id: '1', phase: 'Validation', title: 'Interviews', targetDate: '2026-11-01', estimatedCost: 100, completed: true },
        { id: '2', phase: 'Launch', title: 'Go live', targetDate: '2026-11-15', estimatedCost: 200, completed: false }
      ],
      expenses: [
        { id: 'e1', name: 'LLC & Domain', amount: 300, frequency: 'one-time' },
        { id: 'e2', name: 'Software', amount: 200, frequency: 'monthly' }
      ]
    });

    // Startup = 100 + 200 + 300 = 600
    // Monthly net = 2000 - 200 = 1800 (>= 1200 goal, gap +600)
    // Payback = 600 / 1800 = 0.3 mo
    expect(res.totalStartupCost).toBe(600);
    expect(res.monthlyRecurringExpenses).toBe(200);
    expect(res.projectedMonthlyNetProfit).toBe(1800);
    expect(res.goalGapMonthly).toBe(600);
    expect(res.estimatedBreakevenMonths).toBeCloseTo(0.3, 1);
    expect(res.launchReadinessPct).toBe(50);
  });

  it('rejects negative revenue/hours > 80 and executes SIDE_HUSTLE_PLANNER_CONTRACT', () => {
    const errs = validateSideHustleInput({
      ventureName: 'Test',
      weeklyHoursCommitted: 100,
      projectedMonthlyRevenue: -5,
      monthlyNetIncomeGoal: 500,
      milestones: DEFAULT_HUSTLE_MILESTONES,
      expenses: DEFAULT_HUSTLE_EXPENSES
    });
    expect(errs.length).toBeGreaterThanOrEqual(2);

    const exec = CalculationExecutor.executeContract(SIDE_HUSTLE_PLANNER_CONTRACT, {
      weeklyHoursCommitted: 12,
      projectedMonthlyRevenue: 2200,
      monthlyNetIncomeGoal: 1500
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalMilestones).toBe(DEFAULT_HUSTLE_MILESTONES.length);
  });
});

describe('Sub-batch C2: Debt Snowball vs Avalanche Comparison Contract', () => {
  it('executes DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT and compares strategies accurately', () => {
    const exec = CalculationExecutor.executeContract(DEBT_SNOWBALL_AVALANCHE_PLANNER_CONTRACT, {
      primaryDebtBalance: 2000,
      primaryDebtApr: 5,
      primaryDebtMinPayment: 80,
      secondaryDebtBalance: 9000,
      secondaryDebtApr: 21,
      secondaryDebtMinPayment: 200,
      extraMonthlyPayment: 220,
      strategy: 'snowball'
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.avalanchePlan.totalInterestPaid).toBeLessThan(
      exec.data?.snowballPlan.totalInterestPaid ?? Infinity
    );
  });
});

describe('Sub-batch C3: Cash Flow Forecast Planner', () => {
  it('rolls forward monthly cash balances, applies one-time items, and detects negative cash', () => {
    const res = analyzeCashFlowForecast({
      businessName: 'Studio',
      openingCashBalance: 5000,
      horizonMonths: 4,
      startYearMonth: '2026-11',
      scenario: 'base',
      items: [
        { id: '1', name: 'Sales', direction: 'inflow', category: 'Rev', amount: 3000, frequency: 'monthly', startMonth: 1, endMonth: null },
        { id: '2', name: 'Ops', direction: 'outflow', category: 'Ops', amount: 4000, frequency: 'monthly', startMonth: 1, endMonth: null },
        { id: '3', name: 'Equipment', direction: 'outflow', category: 'CapEx', amount: 3000, frequency: 'one-time', startMonth: 2, endMonth: 2 }
      ]
    });

    // Month 1: 5000 + 3000 - 4000 = 4000
    // Month 2: 4000 + 3000 - 7000 = 0
    // Month 3: 0 + 3000 - 4000 = -1000
    // Month 4: -1000 + 3000 - 4000 = -2000
    expect(res.selectedScenario.schedule[0].endingCash).toBe(4000);
    expect(res.selectedScenario.schedule[1].endingCash).toBe(0);
    expect(res.selectedScenario.schedule[2].endingCash).toBe(-1000);
    expect(res.selectedScenario.schedule[3].endingCash).toBe(-2000);
    expect(res.selectedScenario.negativeCashMonths).toBe(2);
    expect(res.selectedScenario.lowestCashBalance).toBe(-2000);
    expect(res.selectedScenario.lowestCashMonthLabel).toBe('2027-02');

    // Scenario ordering check: optimistic >= base >= conservative ending cash
    expect(res.optimisticScenario.endingCashBalance).toBeGreaterThan(
      res.baseScenario.endingCashBalance
    );
    expect(res.baseScenario.endingCashBalance).toBeGreaterThan(
      res.conservativeScenario.endingCashBalance
    );
  });

  it('validates horizon bounds and executes CASH_FLOW_FORECAST_PLANNER_CONTRACT', () => {
    const errs = validateCashFlowInput({
      businessName: 'Bad',
      openingCashBalance: 1000,
      horizonMonths: 48,
      startYearMonth: '2026-11',
      scenario: 'base',
      items: DEFAULT_CASH_FLOW_ITEMS
    });
    expect(errs.some((e) => e.field === 'horizonMonths')).toBe(true);

    const exec = CalculationExecutor.executeContract(CASH_FLOW_FORECAST_PLANNER_CONTRACT, {
      openingCashBalance: 25000,
      monthlyRecurringInflow: 14500,
      monthlyRecurringOutflow: 11000,
      horizonMonths: 12,
      scenario: 'base'
    });
    expect(exec.success).toBe(true);
    // 25000 + 12 * (14500 - 11000) = 25000 + 42000 = 67000
    expect(exec.data?.selectedScenario.endingCashBalance).toBe(67000);
  });
});
