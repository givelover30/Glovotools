import { describe, it, expect } from 'vitest';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import { CalculationRegistry } from '../engine/CalculationRegistry.ts';
import {
  CUSTOM_UI_TOOL_IDS,
  TESTED_PASSING_TOOL_IDS,
  getToolStatusInfo
} from '../engine/toolStatus.ts';
import { PHASE4_NATIVE_WORKSPACE_IDS } from '../components/calculator/toolPageVariant.ts';
import { CALCULATORS } from '../data/calculators.ts';
import {
  calculateRetirementBucketStrategy,
  validateRetirementBucketInput,
  RETIREMENT_BUCKET_STRATEGY_CONTRACT
} from '../engine/contracts/planners/retirementBucketStrategy.ts';
import {
  calculateFreelanceQuarterlyTax,
  validateFreelanceQuarterlyTaxInput,
  FREELANCE_QUARTERLY_TAX_CONTRACT,
  DEFAULT_TAX_INSTALLMENTS
} from '../engine/contracts/planners/freelanceQuarterlyTax.ts';
import {
  calculateCollegeTuitionPlan,
  validateCollegeTuitionInput,
  COLLEGE_TUITION_SAVINGS_PLANNER_CONTRACT
} from '../engine/contracts/planners/collegeTuitionSavings.ts';

describe('Sub-batch D1: Retirement 3-Bucket Withdrawal Strategy Planner', () => {
  it('computes net portfolio draw, bucket dollar splits, runway years, and weighted return', () => {
    const res = calculateRetirementBucketStrategy({
      totalPortfolioValue: 1_000_000,
      annualSpendingNeed: 65_000,
      guaranteedAnnualIncome: 25_000,
      bucket1Pct: 10,
      bucket2Pct: 30,
      bucket3Pct: 60,
      bucket1ReturnPct: 3.5,
      bucket2ReturnPct: 5.0,
      bucket3ReturnPct: 7.5
    });

    // Net annual withdrawal = 65000 - 25000 = 40000 -> 4.0% initial draw
    // B1 = 100000 (2.5 yrs), B2 = 300000 (7.5 yrs), B1+B2 = 400000 (10.0 yrs)
    // Weighted return = 0.1*3.5 + 0.3*5.0 + 0.6*7.5 = 0.35 + 1.5 + 4.5 = 6.35%
    expect(res.netAnnualPortfolioWithdrawal).toBe(40_000);
    expect(res.initialWithdrawalRatePct).toBe(4);
    expect(res.buckets[0].amount).toBe(100_000);
    expect(res.buckets[1].amount).toBe(300_000);
    expect(res.buckets[2].amount).toBe(600_000);
    expect(res.bucket1YearsCovered).toBe(2.5);
    expect(res.bucket2YearsCovered).toBe(7.5);
    expect(res.combinedNearTermYearsCovered).toBe(10);
    expect(res.weightedExpectedReturnPct).toBe(6.35);
    expect(res.bucket3Projected10YrValue).toBeCloseTo(600_000 * Math.pow(1.075, 10), 2);
  });

  it('rejects allocations not summing to 100% and executes contract via CalculationExecutor', () => {
    const errs = validateRetirementBucketInput({
      totalPortfolioValue: 500_000,
      annualSpendingNeed: 40_000,
      guaranteedAnnualIncome: 10_000,
      bucket1Pct: 10,
      bucket2Pct: 30,
      bucket3Pct: 50, // sum = 90
      bucket1ReturnPct: 3,
      bucket2ReturnPct: 5,
      bucket3ReturnPct: 7
    });
    expect(errs.some((e) => e.message.includes('total 100%'))).toBe(true);

    const exec = CalculationExecutor.executeContract(RETIREMENT_BUCKET_STRATEGY_CONTRACT, {
      totalPortfolioValue: 800_000,
      annualSpendingNeed: 50_000,
      guaranteedAnnualIncome: 20_000,
      bucket1Pct: 15,
      bucket2Pct: 35,
      bucket3Pct: 50,
      bucket1ReturnPct: 4,
      bucket2ReturnPct: 5,
      bucket3ReturnPct: 8
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.netAnnualPortfolioWithdrawal).toBe(30_000);
    // (15% + 35%) * 800k = 400k / 30k = 13.33 years
    expect(exec.data?.combinedNearTermYearsCovered).toBe(13.33);
  });
});

describe('Sub-batch D2: Freelancer Quarterly Estimated Tax Payment Planner', () => {
  it('computes net profit, configurable tax reserve, monthly set-aside, and quarterly status', () => {
    const res = calculateFreelanceQuarterlyTax({
      estimatedAnnualGrossRevenue: 100_000,
      estimatedAnnualBusinessExpenses: 20_000,
      taxReserveRatePct: 30,
      priorYearTaxSafeHarbor: 22_000,
      installments: [
        { id: 'q1', label: 'Q1', dueDate: '2026-04-15', weightPct: 25, amountPaid: 6000 },
        { id: 'q2', label: 'Q2', dueDate: '2026-06-15', weightPct: 25, amountPaid: 2000 },
        { id: 'q3', label: 'Q3', dueDate: '2026-09-15', weightPct: 25, amountPaid: 0 },
        { id: 'q4', label: 'Q4', dueDate: '2027-01-15', weightPct: 25, amountPaid: 0 }
      ]
    });

    // Net profit = 80000; 30% reserve = 24000; monthly = 2000; 6000 per quarter
    expect(res.estimatedAnnualNetProfit).toBe(80_000);
    expect(res.estimatedAnnualTaxReserve).toBe(24_000);
    expect(res.recommendedMonthlySetAside).toBe(2_000);
    expect(res.totalPaidToDate).toBe(8_000);
    expect(res.totalRemainingDue).toBe(16_000);
    expect(res.installments[0].status).toBe('Paid');
    expect(res.installments[1].status).toBe('Partial');
    expect(res.installments[1].remainingDue).toBe(4_000);
    expect(res.installments[2].status).toBe('Due');
    expect(res.nextDueQuarter?.id).toBe('q2');
  });

  it('rejects weights != 100% and executes FREELANCE_QUARTERLY_TAX_CONTRACT', () => {
    const badWeights = DEFAULT_TAX_INSTALLMENTS.map((q) => ({ ...q, weightPct: 20 }));
    const errs = validateFreelanceQuarterlyTaxInput({
      estimatedAnnualGrossRevenue: 90_000,
      estimatedAnnualBusinessExpenses: 10_000,
      taxReserveRatePct: 25,
      priorYearTaxSafeHarbor: 18_000,
      installments: badWeights
    });
    expect(errs.some((e) => e.message.includes('total 100%'))).toBe(true);

    const exec = CalculationExecutor.executeContract(FREELANCE_QUARTERLY_TAX_CONTRACT, {
      estimatedAnnualGrossRevenue: 95_000,
      estimatedAnnualBusinessExpenses: 15_000,
      taxReserveRatePct: 28,
      priorYearTaxSafeHarbor: 20_000
    });
    expect(exec.success).toBe(true);
    // (95000 - 15000) * 0.28 = 22400
    expect(exec.data?.estimatedAnnualTaxReserve).toBe(22_400);
  });
});

describe('Sub-batch D3: College Tuition & 529 Savings Growth Planner', () => {
  it('models multi-year tuition inflation and solves required monthly contribution accurately', () => {
    const baseInput = {
      currentAnnualTuition: 24_000,
      programYears: 4,
      yearsUntilEnrollment: 10,
      tuitionInflationPct: 5,
      currentSavings: 12_000,
      monthlyContribution: 450,
      expectedAnnualReturnPct: 6.5
    };
    const res = calculateCollegeTuitionPlan(baseInput);

    expect(res.schedule.length).toBe(10);
    expect(res.tuitionYearsBreakdown.length).toBe(4);
    expect(res.firstYearTuitionAtEnrollment).toBeCloseTo(24_000 * Math.pow(1.05, 10), 2);
    expect(res.totalProjectedTuitionCost).toBeGreaterThan(165_000);

    // Self-consistency check: feeding solved requiredMonthlyContributionToFund back into engine must hit ~100% coverage
    const fundedRes = calculateCollegeTuitionPlan({
      ...baseInput,
      monthlyContribution: res.requiredMonthlyContributionToFund
    });
    expect(Math.abs(fundedRes.fundingSurplusOrGap)).toBeLessThan(2);
    expect(fundedRes.fundingCoveragePct).toBeCloseTo(100, 0);
  });

  it('handles 0% return and 0 years until enrollment cleanly and executes contract', () => {
    const zeroReturn = calculateCollegeTuitionPlan({
      currentAnnualTuition: 10_000,
      programYears: 4,
      yearsUntilEnrollment: 5,
      tuitionInflationPct: 0,
      currentSavings: 16_000,
      monthlyContribution: 400,
      expectedAnnualReturnPct: 0
    });
    // Total tuition = 40000; 16000 + 60 * 400 = 40000 => exact 100% funded
    expect(zeroReturn.totalProjectedTuitionCost).toBe(40_000);
    expect(zeroReturn.projectedSavingsAtEnrollment).toBe(40_000);
    expect(zeroReturn.requiredMonthlyContributionToFund).toBe(400);
    expect(zeroReturn.fundingSurplusOrGap).toBe(0);

    const errs = validateCollegeTuitionInput({
      currentAnnualTuition: 20_000,
      programYears: 10, // invalid (>8)
      yearsUntilEnrollment: 5,
      tuitionInflationPct: 4,
      currentSavings: 0,
      monthlyContribution: 200,
      expectedAnnualReturnPct: 6
    });
    expect(errs.some((e) => e.field === 'programYears')).toBe(true);

    const exec = CalculationExecutor.executeContract(COLLEGE_TUITION_SAVINGS_PLANNER_CONTRACT, {
      currentAnnualTuition: 24_000,
      programYears: 4,
      yearsUntilEnrollment: 10,
      tuitionInflationPct: 5,
      currentSavings: 12_000,
      monthlyContribution: 450,
      expectedAnnualReturnPct: 6.5
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.schedule.length).toBe(10);
  });
});

describe('PLANNER-IMPLEMENTATION-01 Scope & Registry Parity', () => {
  const IMPLEMENTED_P0_IDS = [
    'project-timeline-planner',
    'debt-repayment-planner',
    'retirement-planning-calculator',
    'freelance-rate-planner',
    'wedding-budget-planner',
    'fitness-workout-planner',
    'meal-prep-planner',
    'side-hustle-planner',
    'debt-snowball-avalanche-planner',
    'cash-flow-forecast-planner',
    'retirement-bucket-strategy-planner',
    'freelance-quarterly-tax-payment-planner',
    'college-tuition-savings-growth-planner'
  ] as const;

  it('registers all 13 implemented P0 planners with non-synthetic contracts and explicit-tested status', () => {
    for (const id of IMPLEMENTED_P0_IDS) {
      const meta = CALCULATORS.find((c) => c.id === id);
      expect(meta, `Missing catalog entry for ${id}`).toBeDefined();
      expect(meta?.category).toBe('planners');

      const contract = CalculationRegistry.get(id);
      expect(contract, `Missing contract for ${id}`).toBeDefined();
      expect(contract?.isSyntheticFallback).toBe(false);
      expect(contract?.category).toBe('planners');

      expect(CUSTOM_UI_TOOL_IDS.has(id), `${id} missing from CUSTOM_UI_TOOL_IDS`).toBe(true);
      expect(TESTED_PASSING_TOOL_IDS.has(id), `${id} missing from TESTED_PASSING_TOOL_IDS`).toBe(true);
      expect(PHASE4_NATIVE_WORKSPACE_IDS.has(id), `${id} missing from PHASE4_NATIVE_WORKSPACE_IDS`).toBe(true);

      const status = getToolStatusInfo({ id, category: 'planners' });
      expect(status.tier).toBe('explicit-tested');
      expect(status.isSyntheticFallback).toBe(false);
    }
  });

  it('keeps blocked freelance-client-project-organizer untouched as generic-fallback due to duplicate ID collision', () => {
    const matches = CALCULATORS.filter((c) => c.id === 'freelance-client-project-organizer');
    expect(matches.length).toBe(2);
    expect(CUSTOM_UI_TOOL_IDS.has('freelance-client-project-organizer')).toBe(false);
    expect(TESTED_PASSING_TOOL_IDS.has('freelance-client-project-organizer')).toBe(false);
    expect(PHASE4_NATIVE_WORKSPACE_IDS.has('freelance-client-project-organizer')).toBe(false);
    const status = getToolStatusInfo({ id: 'freelance-client-project-organizer', category: 'planners' });
    expect(status.tier).toBe('generic-fallback');
  });

  it('preserves isolated financial/business calculators without overwriting contracts or UI status', () => {
    for (const id of ['401k-savings-calc', 'freelance-rate-calc', 'college-savings-529-calc']) {
      const meta = CALCULATORS.find((c) => c.id === id);
      expect(meta).toBeDefined();
      expect(meta?.category).not.toBe('planners');
      const status = getToolStatusInfo({ id, category: meta!.category });
      expect(status.isSyntheticFallback).toBe(false);
    }

    for (const id of ['401k-savings-calc', 'college-savings-529-calc']) {
      const contract = CalculationRegistry.get(id);
      expect(contract).toBeDefined();
      expect(contract?.isSyntheticFallback).not.toBe(true);
      expect(contract?.category).not.toBe('planners');
    }
  });
});
