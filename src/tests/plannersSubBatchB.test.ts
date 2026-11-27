import { describe, it, expect } from 'vitest';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import {
  calculateFreelanceRate,
  validateFreelanceRateInput,
  FREELANCE_RATE_PLANNER_CONTRACT
} from '../engine/contracts/planners/freelanceRate.ts';
import {
  calculateWeddingBudget,
  validateWeddingBudgetInput,
  WEDDING_BUDGET_PLANNER_CONTRACT,
  DEFAULT_WEDDING_CATEGORIES
} from '../engine/contracts/planners/weddingBudget.ts';
import {
  analyzeFitnessWorkoutPlan,
  buildSplitPresetDays,
  validateFitnessWorkoutInput,
  FITNESS_WORKOUT_PLANNER_CONTRACT
} from '../engine/contracts/planners/fitnessWorkout.ts';
import {
  analyzeMealPrepPlan,
  validateMealPrepInput,
  MEAL_PREP_PLANNER_CONTRACT,
  DEFAULT_WEEKLY_MEALS
} from '../engine/contracts/planners/mealPrep.ts';

describe('Sub-batch B1: Freelance Rate Planner', () => {
  it('computes non-double-counted accounting revenue & billable hourly rate accurately', () => {
    // Income 65000 + Expenses 10000 = 75000
    // Tax 25% + Profit 0% => Required Revenue = 75000 / 0.75 = 100000
    // Hours = 50 weeks * 5 days * 8 hrs * 50% util = 1000 billable hrs
    // Rate = 100000 / 1000 = 100/hr
    const res = calculateFreelanceRate({
      desiredAnnualIncome: 65000,
      annualExpenses: 10000,
      taxReservePct: 25,
      profitMarginPct: 0,
      workingWeeksPerYear: 50,
      daysPerWeek: 5,
      hoursPerDay: 8,
      billableUtilizationPct: 50
    });

    expect(res.requiredAnnualRevenue).toBe(100000);
    expect(res.taxReserveAmount).toBe(25000);
    expect(res.annualBillableHours).toBe(1000);
    expect(res.targetHourlyRate).toBe(100);
    expect(res.targetBillableDayRate).toBe(800);
    expect(res.taxReserveAmount + res.profitBufferAmount + res.annualExpenses + res.desiredAnnualIncome).toBe(
      res.requiredAnnualRevenue
    );
  });

  it('rejects combined tax + profit >= 95% and executes contract', () => {
    const errs = validateFreelanceRateInput({
      desiredAnnualIncome: 50000,
      annualExpenses: 5000,
      taxReservePct: 60,
      profitMarginPct: 40,
      workingWeeksPerYear: 48,
      daysPerWeek: 5,
      hoursPerDay: 8,
      billableUtilizationPct: 60
    });
    expect(errs.length).toBeGreaterThan(0);

    const exec = CalculationExecutor.executeContract(FREELANCE_RATE_PLANNER_CONTRACT, {
      desiredAnnualIncome: 75000,
      annualExpenses: 9600,
      taxReservePct: 25,
      profitMarginPct: 10,
      workingWeeksPerYear: 48,
      daysPerWeek: 5,
      hoursPerDay: 8,
      billableUtilizationPct: 65
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.targetHourlyRate).toBeGreaterThan(80);
  });
});

describe('Sub-batch B2: Wedding Budget Planner', () => {
  it('computes category allocations, variances, overspending flags, and cost per guest', () => {
    const res = calculateWeddingBudget({
      totalBudget: 40000,
      guestCount: 100,
      categories: [
        { id: 'c1', name: 'Venue', targetPct: 40, estimatedCost: 16000, actualCost: 17500, paymentStatus: 'Paid in Full' },
        { id: 'c2', name: 'Catering', targetPct: 30, estimatedCost: 12000, actualCost: 10000, paymentStatus: 'Deposit Paid' },
        { id: 'c3', name: 'Photo', targetPct: 20, estimatedCost: 8000, actualCost: 0, paymentStatus: 'Unpaid' }
      ]
    });

    expect(res.totalAllocatedPct).toBe(90);
    expect(res.allocationGapPct).toBe(10);
    expect(res.totalActual).toBe(27500);
    expect(res.remainingVsBudgetActual).toBe(12500);
    expect(res.costPerGuestBudget).toBe(400);
    expect(res.costPerGuestActual).toBe(275);
    expect(res.overspentCategoryIds).toEqual(['c1']);
    expect(res.paidFullCount).toBe(1);
    expect(res.depositCount).toBe(1);
    expect(res.unpaidCount).toBe(1);
  });

  it('rejects zero guest count and executes WEDDING_BUDGET_PLANNER_CONTRACT', () => {
    const errs = validateWeddingBudgetInput({
      totalBudget: 20000,
      guestCount: 0,
      categories: DEFAULT_WEDDING_CATEGORIES
    });
    expect(errs.some((e) => e.field === 'guestCount')).toBe(true);

    const exec = CalculationExecutor.executeContract(WEDDING_BUDGET_PLANNER_CONTRACT, {
      totalBudget: 30000,
      guestCount: 120
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.costPerGuestBudget).toBe(250);
  });
});

describe('Sub-batch B3: Fitness Workout Planner', () => {
  it('computes weekly split days, training volume, muscle distribution, and completion %', () => {
    const days = buildSplitPresetDays('ppl');
    // Mark first 2 exercises completed
    days[0].exercises[0].completed = true;
    days[0].exercises[1].completed = true;

    const res = analyzeFitnessWorkoutPlan({
      planName: 'Test PPL',
      split: 'ppl',
      weightUnit: 'kg',
      days
    });

    expect(res.trainingDays).toBe(5);
    expect(res.restDays).toBe(2);
    expect(res.totalWeeklySets).toBeGreaterThan(30);
    expect(res.setsPerMuscleGroup['Chest']).toBe(7); // 4 + 3
    expect(res.completedExercises).toBe(2);
    expect(res.completionPct).toBeGreaterThan(0);
  });

  it('validates exercise sets and executes FITNESS_WORKOUT_PLANNER_CONTRACT', () => {
    const days = buildSplitPresetDays('full-body');
    days[0].exercises[0].sets = 0;
    const errs = validateFitnessWorkoutInput({
      planName: 'Bad',
      split: 'full-body',
      weightUnit: 'kg',
      days
    });
    expect(errs.some((e) => e.field === 'sets')).toBe(true);

    const exec = CalculationExecutor.executeContract(FITNESS_WORKOUT_PLANNER_CONTRACT, {
      split: 'upper-lower',
      weightUnit: 'lb'
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.trainingDays).toBe(4);
    expect(exec.data?.restDays).toBe(3);
  });
});

describe('Sub-batch B4: Meal Prep & Grocery Planner', () => {
  it('aggregates duplicate ingredients with case/whitespace normalization and sums only entered calories', () => {
    const res = analyzeMealPrepPlan({
      planName: 'Test Prep',
      meals: [
        {
          id: 'm1',
          dayKey: 'mon',
          slot: 'lunch',
          title: 'Bowl 1',
          servings: 1,
          caloriesPerServing: 500,
          ingredients: [
            { id: 'i1', name: '  Chicken Breast ', quantity: 180, unit: 'G', aisle: 'Meat' },
            { id: 'i2', name: 'Rice', quantity: 100, unit: 'g', aisle: 'Pantry' }
          ]
        },
        {
          id: 'm2',
          dayKey: 'tue',
          slot: 'dinner',
          title: 'Bowl 2',
          servings: 2,
          caloriesPerServing: null, // omitted deliberately
          ingredients: [
            { id: 'i3', name: 'chicken breast', quantity: 220, unit: 'g', aisle: 'Meat' }
          ]
        }
      ],
      checkedGroceryKeys: ['chicken breast::g']
    });

    const chicken = res.aggregatedGroceries.find((g) => g.key === 'chicken breast::g')!;
    expect(chicken.quantity).toBe(400);
    expect(chicken.sourceMeals).toEqual(['Bowl 1', 'Bowl 2']);
    expect(chicken.checked).toBe(true);
    expect(res.uniqueIngredientCount).toBe(2);
    expect(res.mealsWithCaloriesEntered).toBe(1);
    expect(res.weeklyEnteredCalories).toBe(500);
  });

  it('returns null calories when none entered and executes MEAL_PREP_PLANNER_CONTRACT', () => {
    const res = analyzeMealPrepPlan({
      planName: 'No Calories',
      meals: [
        {
          id: 'm1',
          dayKey: 'mon',
          slot: 'breakfast',
          title: 'Toast',
          servings: 1,
          caloriesPerServing: null,
          ingredients: [{ id: 'i1', name: 'Bread', quantity: 2, unit: 'slices' }]
        }
      ]
    });
    expect(res.weeklyEnteredCalories).toBeNull();
    expect(res.dailyAverageEnteredCalories).toBeNull();

    const badErrs = validateMealPrepInput({
      planName: 'Bad',
      meals: [{ id: '1', dayKey: 'mon', slot: 'lunch', title: 'X', servings: 0, ingredients: [] }]
    });
    expect(badErrs.some((e) => e.field === 'servings')).toBe(true);

    const exec = CalculationExecutor.executeContract(MEAL_PREP_PLANNER_CONTRACT, {
      planName: 'Starter Prep',
      meals: DEFAULT_WEEKLY_MEALS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalPlannedMeals).toBe(DEFAULT_WEEKLY_MEALS.length);
  });
});
