import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface MealPlanDayItem {
  id: string;
  dayName: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  calories: number;
}

export interface MealPlannerInput {
  planTitle: string;
  days: MealPlanDayItem[];
}

export interface MealPlannerResult {
  planTitle: string;
  totalWeeklyCalories: number;
  averageDailyCalories: number;
  daysCount: number;
  mealsSummary: Array<{ dayName: string; calories: number }>;
}

export const DEFAULT_MEAL_PLANNER_DAYS: MealPlanDayItem[] = [
  { id: '1', dayName: 'Monday', breakfast: 'Oatmeal with Berries & Honey', lunch: 'Grilled Chicken Salad', dinner: 'Baked Salmon with Quinoa', snacks: 'Greek Yogurt & Almonds', calories: 1850 },
  { id: '2', dayName: 'Tuesday', breakfast: 'Avocado Toast with Eggs', lunch: 'Turkey & Avocado Wrap', dinner: 'Lean Beef Stir-fry with Broccoli', snacks: 'Apple & Peanut Butter', calories: 1920 },
  { id: '3', dayName: 'Wednesday', breakfast: 'Greek Yogurt Parfait', lunch: 'Quinoa Buddha Bowl', dinner: 'Baked Chicken Breast & Asparagus', snacks: 'Mixed Nuts', calories: 1780 },
  { id: '4', dayName: 'Thursday', breakfast: 'Scrambled Eggs & Spinach', lunch: 'Tuna Salad Sandwich', dinner: 'Shrimp Tacos with Cabbage Slaw', snacks: 'Protein Shake', calories: 1840 },
  { id: '5', dayName: 'Friday', breakfast: 'Protein Smoothie & Banana', lunch: 'Leftover Baked Salmon', dinner: 'Margherita Pizza & Side Salad', snacks: 'Dark Chocolate & Berries', calories: 2100 },
  { id: '6', dayName: 'Saturday', breakfast: 'Pancakes with Maple Syrup', lunch: 'Turkey Burger with Sweet Potato Fries', dinner: 'Grilled Steak & Roasted Vegetables', snacks: 'Rice Cakes', calories: 2250 },
  { id: '7', dayName: 'Sunday', breakfast: 'Omelet with Mushrooms & Cheese', lunch: 'Mediterranean Chickpea Salad', dinner: 'Roast Chicken with Root Veggies', snacks: 'Fruit Bowl', calories: 1900 }
];

export function validateMealPlannerInput(input: MealPlannerInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.planTitle || input.planTitle.trim() === '') {
    errors.push({ field: 'planTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Plan title is required.' });
  }
  if (!input.days || input.days.length === 0) {
    errors.push({ field: 'days', code: 'REQUIRED_FIELD_MISSING', message: 'At least one day of meals must be provided.' });
  } else {
    input.days.forEach((d, idx) => {
      if (d.calories < 0) {
        errors.push({ field: `days[${idx}].calories`, code: 'NON_NEGATIVE_REQUIRED', message: 'Calories cannot be negative.' });
      }
    });
  }
  return errors;
}

export function calculateMealPlanner(input: MealPlannerInput): MealPlannerResult {
  const days = input.days || DEFAULT_MEAL_PLANNER_DAYS;
  const totalWeeklyCalories = days.reduce((sum, d) => sum + (Number(d.calories) || 0), 0);
  const daysCount = days.length || 1;
  const averageDailyCalories = Math.round(totalWeeklyCalories / daysCount);

  return {
    planTitle: input.planTitle || 'Weekly Meal Plan',
    totalWeeklyCalories,
    averageDailyCalories,
    daysCount,
    mealsSummary: days.map(d => ({ dayName: d.dayName, calories: Number(d.calories) || 0 }))
  };
}

export const MEAL_PLANNER_CONTRACT: CalculationContract<any, any> = {
  id: 'meal-planner',
  name: 'Meal Planner & Nutrition',
  category: 'planners',
  validate: validateMealPlannerInput,
  calculate: calculateMealPlanner
} as CalculationContract<any, any>;
