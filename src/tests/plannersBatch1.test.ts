import { describe, it, expect } from 'vitest';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import { calculateMealPlanner, MEAL_PLANNER_CONTRACT, DEFAULT_MEAL_PLANNER_DAYS } from '../engine/contracts/planners/mealPlanner.ts';
import { calculateWeddingPlanning, WEDDING_PLANNING_ORGANIZER_CONTRACT, DEFAULT_WEDDING_BUDGET, DEFAULT_WEDDING_GUESTS } from '../engine/contracts/planners/weddingPlanningOrganizer.ts';
import { calculateHomeRenovation, HOME_RENOVATION_PLANNER_CONTRACT, DEFAULT_RENO_ITEMS } from '../engine/contracts/planners/homeRenovationPlanner.ts';
import { calculateSocialMedia, SOCIAL_MEDIA_CONTENT_CALENDAR_CONTRACT, DEFAULT_SOCIAL_POSTS } from '../engine/contracts/planners/socialMediaContentCalendar.ts';
import { calculateBusinessLaunch, BUSINESS_LAUNCH_PLANNER_CONTRACT, DEFAULT_LAUNCH_MILESTONES } from '../engine/contracts/planners/businessLaunchPlanner.ts';
import { calculateGardenPlanting, GARDEN_PLANTING_PLANNER_CONTRACT, DEFAULT_GARDEN_CROPS } from '../engine/contracts/planners/gardenPlantingPlanner.ts';
import { calculatePersonalGoal, PERSONAL_GOAL_ORGANIZER_CONTRACT, DEFAULT_PERSONAL_GOALS } from '../engine/contracts/planners/personalGoalOrganizer.ts';

describe('PLANNER-IMPLEMENTATION-02 Batch 1: 7 P1 Upgraded Planners', () => {
  it('1. Meal Planner calculates weekly and average daily calories correctly', () => {
    const res = calculateMealPlanner({
      planTitle: 'Test Diet',
      days: DEFAULT_MEAL_PLANNER_DAYS
    });
    expect(res.daysCount).toBe(7);
    expect(res.totalWeeklyCalories).toBe(13640);
    expect(res.averageDailyCalories).toBe(1949);

    const exec = CalculationExecutor.executeContract(MEAL_PLANNER_CONTRACT, {
      planTitle: 'Test Diet',
      days: DEFAULT_MEAL_PLANNER_DAYS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.averageDailyCalories).toBe(1949);
  });

  it('2. Wedding Planning Organizer computes budgets, variances, and guest RSVPs correctly', () => {
    const res = calculateWeddingPlanning({
      weddingTitle: 'Alice & Bob Wedding',
      budgetItems: DEFAULT_WEDDING_BUDGET,
      guests: DEFAULT_WEDDING_GUESTS
    });
    expect(res.totalEstimatedBudget).toBe(16500);
    expect(res.totalActualCost).toBe(16400);
    expect(res.budgetVariance).toBe(-100);
    expect(res.totalGuests).toBe(5);
    expect(res.confirmedGuests).toBe(3);
    expect(res.pendingGuests).toBe(2);

    const exec = CalculationExecutor.executeContract(WEDDING_PLANNING_ORGANIZER_CONTRACT, {
      weddingTitle: 'Alice & Bob Wedding',
      budgetItems: DEFAULT_WEDDING_BUDGET,
      guests: DEFAULT_WEDDING_GUESTS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalGuests).toBe(5);
  });

  it('3. Home Renovation Planner computes totals, remaining budget, and status counts', () => {
    const res = calculateHomeRenovation({
      projectName: 'Full Reno',
      items: DEFAULT_RENO_ITEMS
    });
    expect(res.totalBudget).toBe(10000);
    expect(res.totalSpent).toBe(6850);
    expect(res.remainingBudget).toBe(3150);
    expect(res.completedTasksCount).toBe(1);
    expect(res.inProgressTasksCount).toBe(1);
    expect(res.plannedTasksCount).toBe(1);

    const exec = CalculationExecutor.executeContract(HOME_RENOVATION_PLANNER_CONTRACT, {
      projectName: 'Full Reno',
      items: DEFAULT_RENO_ITEMS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.remainingBudget).toBe(3150);
  });

  it('4. Social Media Content Calendar aggregates statuses and platforms', () => {
    const res = calculateSocialMedia({
      calendarName: 'Q4 Socials',
      posts: DEFAULT_SOCIAL_POSTS
    });
    expect(res.totalPosts).toBe(3);
    expect(res.scheduledCount).toBe(1);
    expect(res.draftingCount).toBe(1);
    expect(res.ideaCount).toBe(1);
    expect(res.platformBreakdown['Instagram']).toBe(1);

    const exec = CalculationExecutor.executeContract(SOCIAL_MEDIA_CONTENT_CALENDAR_CONTRACT, {
      calendarName: 'Q4 Socials',
      posts: DEFAULT_SOCIAL_POSTS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalPosts).toBe(3);
  });

  it('5. Business Launch Planner computes milestone budgets and status counts', () => {
    const res = calculateBusinessLaunch({
      businessName: 'SaaS App',
      milestones: DEFAULT_LAUNCH_MILESTONES
    });
    expect(res.totalEstimatedCost).toBe(1200);
    expect(res.completedTasksCount).toBe(1);
    expect(res.inProgressTasksCount).toBe(1);
    expect(res.pendingTasksCount).toBe(2);

    const exec = CalculationExecutor.executeContract(BUSINESS_LAUNCH_PLANNER_CONTRACT, {
      businessName: 'SaaS App',
      milestones: DEFAULT_LAUNCH_MILESTONES
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEstimatedCost).toBe(1200);
  });

  it('6. Garden Planting Planner computes crop quantities and category breakdown', () => {
    const res = calculateGardenPlanting({
      gardenName: 'Backyard Patch',
      crops: DEFAULT_GARDEN_CROPS
    });
    expect(res.totalCropsCount).toBe(4);
    expect(res.totalPlantCount).toBe(52);
    expect(res.categoryBreakdown['Vegetables']).toBe(48);
    expect(res.categoryBreakdown['Herbs']).toBe(4);

    const exec = CalculationExecutor.executeContract(GARDEN_PLANTING_PLANNER_CONTRACT, {
      gardenName: 'Backyard Patch',
      crops: DEFAULT_GARDEN_CROPS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalPlantCount).toBe(52);
  });

  it('7. Personal Goal Organizer calculates goal status counts and average progress', () => {
    const res = calculatePersonalGoal({
      organizerTitle: '2026 Goals',
      goals: DEFAULT_PERSONAL_GOALS
    });
    expect(res.totalGoalsCount).toBe(3);
    expect(res.achievedCount).toBe(1);
    expect(res.inProgressCount).toBe(2);
    expect(res.averageProgressPct).toBe(82);

    const exec = CalculationExecutor.executeContract(PERSONAL_GOAL_ORGANIZER_CONTRACT, {
      organizerTitle: '2026 Goals',
      goals: DEFAULT_PERSONAL_GOALS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.averageProgressPct).toBe(82);
  });
});
