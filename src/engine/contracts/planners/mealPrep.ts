import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MealIngredientInput {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  aisle?: string;
}

export interface PlannedMealItem {
  id: string;
  dayKey: DayKey;
  slot: MealSlot;
  title: string;
  servings: number;
  caloriesPerServing?: number | null; // Strictly optional user-entered value
  ingredients: MealIngredientInput[];
}

export interface GroceryExtraItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  aisle: string;
  checked: boolean;
}

export interface AggregatedGroceryItem {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  aisle: string;
  sourceMeals: string[];
  checked: boolean;
}

export interface MealPrepPlanInput {
  planName: string;
  meals: PlannedMealItem[];
  checkedGroceryKeys?: string[];
  extraGroceries?: GroceryExtraItem[];
}

export interface MealPrepPlanResult {
  planName: string;
  totalPlannedMeals: number;
  daysCovered: number;
  mealsWithCaloriesEntered: number;
  weeklyEnteredCalories: number | null;
  dailyAverageEnteredCalories: number | null;
  uniqueIngredientCount: number;
  checkedGroceryCount: number;
  aggregatedGroceries: AggregatedGroceryItem[];
  dayMealCounts: Record<DayKey, number>;
}

export const WEEK_DAYS: Array<{ key: DayKey; labelEn: string; labelEs: string }> = [
  { key: 'mon', labelEn: 'Monday', labelEs: 'Lunes' },
  { key: 'tue', labelEn: 'Tuesday', labelEs: 'Martes' },
  { key: 'wed', labelEn: 'Wednesday', labelEs: 'Miércoles' },
  { key: 'thu', labelEn: 'Thursday', labelEs: 'Jueves' },
  { key: 'fri', labelEn: 'Friday', labelEs: 'Viernes' },
  { key: 'sat', labelEn: 'Saturday', labelEs: 'Sábado' },
  { key: 'sun', labelEn: 'Sunday', labelEs: 'Domingo' }
];

export const MEAL_SLOTS: Array<{ key: MealSlot; labelEn: string; labelEs: string }> = [
  { key: 'breakfast', labelEn: 'Breakfast', labelEs: 'Desayuno' },
  { key: 'lunch', labelEn: 'Lunch', labelEs: 'Almuerzo' },
  { key: 'dinner', labelEn: 'Dinner', labelEs: 'Cena' },
  { key: 'snacks', labelEn: 'Snacks', labelEs: 'Meriendas' }
];

export const DEFAULT_WEEKLY_MEALS: PlannedMealItem[] = [
  {
    id: 'm-1',
    dayKey: 'mon',
    slot: 'breakfast',
    title: 'Greek Yogurt Berry Bowl',
    servings: 1,
    caloriesPerServing: 360,
    ingredients: [
      { id: 'ing-1', name: 'Greek Yogurt', quantity: 200, unit: 'g', aisle: 'Dairy' },
      { id: 'ing-2', name: 'Rolled Oats', quantity: 40, unit: 'g', aisle: 'Pantry' },
      { id: 'ing-3', name: 'Blueberries', quantity: 80, unit: 'g', aisle: 'Produce' }
    ]
  },
  {
    id: 'm-2',
    dayKey: 'mon',
    slot: 'lunch',
    title: 'Grilled Chicken Rice Bowl',
    servings: 1,
    caloriesPerServing: 540,
    ingredients: [
      { id: 'ing-4', name: 'Chicken Breast', quantity: 180, unit: 'g', aisle: 'Meat & Poultry' },
      { id: 'ing-5', name: 'Brown Rice', quantity: 150, unit: 'g', aisle: 'Pantry' },
      { id: 'ing-6', name: 'Broccoli Florets', quantity: 120, unit: 'g', aisle: 'Produce' }
    ]
  },
  {
    id: 'm-3',
    dayKey: 'tue',
    slot: 'breakfast',
    title: 'Greek Yogurt Berry Bowl',
    servings: 1,
    caloriesPerServing: 360,
    ingredients: [
      { id: 'ing-7', name: 'Greek Yogurt', quantity: 200, unit: 'g', aisle: 'Dairy' },
      { id: 'ing-8', name: 'Rolled Oats', quantity: 40, unit: 'g', aisle: 'Pantry' },
      { id: 'ing-9', name: 'Blueberries', quantity: 80, unit: 'g', aisle: 'Produce' }
    ]
  },
  {
    id: 'm-4',
    dayKey: 'wed',
    slot: 'dinner',
    title: 'Baked Salmon & Roasted Vegetables',
    servings: 1,
    caloriesPerServing: 610,
    ingredients: [
      { id: 'ing-10', name: 'Salmon Fillet', quantity: 180, unit: 'g', aisle: 'Seafood' },
      { id: 'ing-11', name: 'Broccoli Florets', quantity: 150, unit: 'g', aisle: 'Produce' },
      { id: 'ing-12', name: 'Olive Oil', quantity: 1, unit: 'tbsp', aisle: 'Pantry' }
    ]
  },
  {
    id: 'm-5',
    dayKey: 'thu',
    slot: 'lunch',
    title: 'Chicken & Rice Meal Prep',
    servings: 1,
    caloriesPerServing: 540,
    ingredients: [
      { id: 'ing-13', name: 'Chicken Breast', quantity: 180, unit: 'g', aisle: 'Meat & Poultry' },
      { id: 'ing-14', name: 'Brown Rice', quantity: 150, unit: 'g', aisle: 'Pantry' }
    ]
  }
];

function normalizeKeyPart(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function validateMealPrepInput(input: MealPrepPlanInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!Array.isArray(input.meals)) {
    errors.push({
      field: 'meals',
      code: 'REQUIRED_FIELD_MISSING',
      message: 'Meals list is required.'
    });
    return errors;
  }

  for (const meal of input.meals) {
    if (!meal.title || meal.title.trim() === '') {
      errors.push({
        field: 'meals',
        code: 'REQUIRED_FIELD_MISSING',
        message: 'Every planned meal must have a title.'
      });
    }
    if (!Number.isFinite(meal.servings) || meal.servings <= 0) {
      errors.push({
        field: 'servings',
        code: 'POSITIVE_NUMBER_REQUIRED',
        message: `Meal "${meal.title || meal.id}" servings must be > 0.`,
        invalidValue: meal.servings
      });
    }
    if (
      meal.caloriesPerServing !== undefined &&
      meal.caloriesPerServing !== null &&
      (!Number.isFinite(meal.caloriesPerServing) || meal.caloriesPerServing < 0)
    ) {
      errors.push({
        field: 'caloriesPerServing',
        code: 'NON_NEGATIVE_REQUIRED',
        message: `Meal "${meal.title || meal.id}" calories cannot be negative.`,
        invalidValue: meal.caloriesPerServing
      });
    }
    for (const ing of meal.ingredients) {
      if (!ing.name || ing.name.trim() === '') {
        errors.push({
          field: 'ingredients',
          code: 'REQUIRED_FIELD_MISSING',
          message: `Meal "${meal.title}" has an ingredient without a name.`
        });
      }
      if (!Number.isFinite(ing.quantity) || ing.quantity <= 0) {
        errors.push({
          field: 'ingredients',
          code: 'POSITIVE_NUMBER_REQUIRED',
          message: `Ingredient "${ing.name || ing.id}" quantity must be > 0.`,
          invalidValue: ing.quantity
        });
      }
    }
  }
  return errors;
}

export function analyzeMealPrepPlan(input: MealPrepPlanInput): MealPrepPlanResult {
  const errors = validateMealPrepInput(input);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const checkedSet = new Set(input.checkedGroceryKeys ?? []);
  const groceryMap = new Map<string, AggregatedGroceryItem>();

  const dayMealCounts: Record<DayKey, number> = {
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0
  };

  let mealsWithCaloriesEntered = 0;
  let totalEnteredCalories = 0;

  for (const meal of input.meals) {
    dayMealCounts[meal.dayKey] = (dayMealCounts[meal.dayKey] ?? 0) + 1;
    if (typeof meal.caloriesPerServing === 'number' && Number.isFinite(meal.caloriesPerServing)) {
      mealsWithCaloriesEntered++;
      totalEnteredCalories += meal.caloriesPerServing * meal.servings;
    }

    for (const ing of meal.ingredients) {
      const normName = normalizeKeyPart(ing.name);
      const normUnit = normalizeKeyPart(ing.unit || 'item');
      const aggKey = `${normName}::${normUnit}`;

      const existing = groceryMap.get(aggKey);
      if (existing) {
        existing.quantity = PrecisionEngine.roundTo(existing.quantity + ing.quantity, 2);
        if (!existing.sourceMeals.includes(meal.title.trim())) {
          existing.sourceMeals.push(meal.title.trim());
        }
      } else {
        groceryMap.set(aggKey, {
          key: aggKey,
          name: ing.name.trim(),
          quantity: PrecisionEngine.roundTo(ing.quantity, 2),
          unit: ing.unit.trim() || 'item',
          aisle: ing.aisle?.trim() || 'Other',
          sourceMeals: [meal.title.trim()],
          checked: checkedSet.has(aggKey)
        });
      }
    }
  }

  const aggregatedGroceries = Array.from(groceryMap.values()).sort((a, b) => {
    if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
    return a.name.localeCompare(b.name);
  });

  const daysCovered = Object.values(dayMealCounts).filter((c) => c > 0).length;
  const weeklyEnteredCalories =
    mealsWithCaloriesEntered > 0 ? Math.round(totalEnteredCalories) : null;
  const dailyAverageEnteredCalories =
    weeklyEnteredCalories !== null && daysCovered > 0
      ? Math.round(weeklyEnteredCalories / daysCovered)
      : null;

  const extraChecked = (input.extraGroceries ?? []).filter((e) => e.checked).length;

  return {
    planName: input.planName.trim() || 'Weekly Meal Prep Plan',
    totalPlannedMeals: input.meals.length,
    daysCovered,
    mealsWithCaloriesEntered,
    weeklyEnteredCalories,
    dailyAverageEnteredCalories,
    uniqueIngredientCount: aggregatedGroceries.length + (input.extraGroceries?.length ?? 0),
    checkedGroceryCount: aggregatedGroceries.filter((g) => g.checked).length + extraChecked,
    aggregatedGroceries,
    dayMealCounts
  };
}

export interface MealPrepContractInput {
  planName?: string;
  meals?: PlannedMealItem[];
}

export const MEAL_PREP_PLANNER_CONTRACT: CalculationContract<
  MealPrepContractInput,
  MealPrepPlanResult
> = {
  id: 'meal-prep-planner',
  name: 'Weekly Meal Prep & Grocery Schedule Planner',
  category: 'planners',
  subcategoryId: 'p12-plan',
  isSyntheticFallback: false,
  implementationTier: 'explicit-tested',
  formulaMeta: {
    formulaName: 'Weekly Meal Matrix & Normalized Ingredient Consolidation',
    formulaExpression:
      'ConsolidatedQty(item, unit) = sum_{meals} Qty(item, unit); WeeklyCalories = sum(UserCalories * Servings)',
    variables: [
      { symbol: 'Meals', name: 'Planned Weekly Meals', unit: 'meals' },
      { symbol: 'ConsolidatedQty', name: 'Aggregated Grocery Quantity', unit: 'unit' }
    ]
  },
  inputSchema: {
    fields: [
      {
        name: 'planName',
        label: 'Weekly Meal Plan Name',
        type: 'string',
        required: false,
        defaultValue: 'Balanced Weekly Meal Prep'
      }
    ]
  },
  validate: (inputs) =>
    validateMealPrepInput({
      planName: inputs.planName || 'Weekly Meal Prep',
      meals: Array.isArray(inputs.meals) ? inputs.meals : DEFAULT_WEEKLY_MEALS
    }),
  calculate: (inputs) =>
    analyzeMealPrepPlan({
      planName: inputs.planName || 'Weekly Meal Prep',
      meals: Array.isArray(inputs.meals) ? inputs.meals : DEFAULT_WEEKLY_MEALS
    }),
  formatResult: (res) => ({
    primary: {
      label: 'Consolidated Grocery Items',
      value: `${res.uniqueIngredientCount} items`,
      numericValue: res.uniqueIngredientCount,
      unit: 'items'
    },
    secondary: [
      {
        label: 'Planned Meals',
        value: `${res.totalPlannedMeals} meals (${res.daysCovered} days)`,
        numericValue: res.totalPlannedMeals
      },
      {
        label: 'Logged Weekly Calories',
        value:
          res.weeklyEnteredCalories !== null
            ? `${res.weeklyEnteredCalories} kcal`
            : 'Not entered',
        numericValue: res.weeklyEnteredCalories ?? 0
      }
    ],
    breakdown: res.aggregatedGroceries.slice(0, 8).map((item) => ({
      label: item.name,
      value: `${item.quantity} ${item.unit}`
    }))
  })
};
