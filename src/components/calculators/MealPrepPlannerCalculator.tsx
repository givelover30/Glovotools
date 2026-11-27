import { useState, useMemo, useId } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ShoppingBasket
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';
import { PlannerHeaderToolbar, PlannerDisclaimer } from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  DEFAULT_WEEKLY_MEALS,
  DayKey,
  MEAL_SLOTS,
  MealIngredientInput,
  MealPrepPlanInput,
  MealSlot,
  PlannedMealItem,
  WEEK_DAYS,
  analyzeMealPrepPlan,
  validateMealPrepInput
} from '../../engine/contracts/planners/mealPrep.ts';

const DEFAULT_MEAL_STATE: MealPrepPlanInput = {
  planName: 'Balanced Weekly Meal Prep',
  meals: DEFAULT_WEEKLY_MEALS,
  checkedGroceryKeys: [],
  extraGroceries: []
};

const EMPTY_MEAL_STATE: MealPrepPlanInput = {
  planName: 'Weekly Meal Plan',
  meals: [],
  checkedGroceryKeys: [],
  extraGroceries: []
};

function sanitizeMealState(raw: unknown): MealPrepPlanInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<MealPrepPlanInput>;
  if (!Array.isArray(obj.meals)) return null;
  const meals: PlannedMealItem[] = [];
  for (const m of obj.meals) {
    if (!m || typeof m !== 'object' || typeof m.id !== 'string' || typeof m.title !== 'string') {
      return null;
    }
    const ingredients: MealIngredientInput[] = Array.isArray(m.ingredients)
      ? m.ingredients
          .filter(
            (i) =>
              i &&
              typeof i === 'object' &&
              typeof i.name === 'string' &&
              typeof i.quantity === 'number' &&
              i.quantity > 0
          )
          .map((i) => ({
            id: typeof i.id === 'string' ? i.id : `ing-${Math.random()}`,
            name: i.name,
            quantity: i.quantity,
            unit: typeof i.unit === 'string' ? i.unit : 'item',
            aisle: typeof i.aisle === 'string' ? i.aisle : 'Other'
          }))
      : [];
    meals.push({
      id: m.id,
      dayKey: (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(m.dayKey as string)
        ? m.dayKey
        : 'mon') as DayKey,
      slot: (['breakfast', 'lunch', 'dinner', 'snacks'].includes(m.slot as string)
        ? m.slot
        : 'lunch') as MealSlot,
      title: m.title,
      servings: typeof m.servings === 'number' && m.servings > 0 ? m.servings : 1,
      caloriesPerServing:
        typeof m.caloriesPerServing === 'number' && Number.isFinite(m.caloriesPerServing) && m.caloriesPerServing >= 0
          ? m.caloriesPerServing
          : null,
      ingredients
    });
  }
  return {
    planName: typeof obj.planName === 'string' ? obj.planName : 'Weekly Meal Prep',
    meals,
    checkedGroceryKeys: Array.isArray(obj.checkedGroceryKeys)
      ? obj.checkedGroceryKeys.filter((k): k is string => typeof k === 'string')
      : [],
    extraGroceries: Array.isArray(obj.extraGroceries) ? obj.extraGroceries : []
  };
}

export default function MealPrepPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<MealPrepPlanInput>({
    storageKey: 'calctools_meal_prep_planner_v1',
    version: 1,
    defaultValue: DEFAULT_MEAL_STATE,
    sanitize: sanitizeMealState
  });

  const [selectedDay, setSelectedDay] = useState<DayKey>('mon');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');
  const [mealTitle, setMealTitle] = useState('');
  const [servings, setServings] = useState(1);
  const [caloriesStr, setCaloriesStr] = useState('');
  const [draftIngredients, setDraftIngredients] = useState<MealIngredientInput[]>([
    { id: 'draft-1', name: '', quantity: 100, unit: 'g', aisle: 'Produce' }
  ]);
  const [formError, setFormError] = useState('');

  const validationErrors = useMemo(() => validateMealPrepInput(state), [state]);
  const analysis = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return analyzeMealPrepPlan(state);
    } catch {
      return null;
    }
  }, [state, validationErrors]);

  const addDraftIngredientRow = () => {
    setDraftIngredients((prev) => [
      ...prev,
      { id: `draft-${Date.now()}-${prev.length}`, name: '', quantity: 1, unit: 'item', aisle: 'Pantry' }
    ]);
  };

  const updateDraftIngredient = (id: string, patch: Partial<MealIngredientInput>) => {
    setDraftIngredients((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const removeDraftIngredient = (id: string) => {
    setDraftIngredients((prev) => prev.filter((row) => row.id !== id));
  };

  const addMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mealTitle.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del plato o receta.' : 'Please enter a meal or recipe name.');
      return;
    }
    if (!Number.isFinite(servings) || servings <= 0) {
      setFormError(isEs ? 'Las porciones deben ser > 0.' : 'Servings must be > 0.');
      return;
    }
    const calNum = caloriesStr.trim() === '' ? null : Number(caloriesStr);
    if (calNum !== null && (!Number.isFinite(calNum) || calNum < 0)) {
      setFormError(isEs ? 'Las calorías deben ser >= 0.' : 'Calories cannot be negative.');
      return;
    }

    const validIngredients = draftIngredients
      .filter((i) => i.name.trim() !== '')
      .map((i, idx) => ({
        id: `ing-${Date.now()}-${idx}`,
        name: i.name.trim(),
        quantity: Math.max(0.01, Number(i.quantity) || 1),
        unit: i.unit.trim() || 'item',
        aisle: i.aisle?.trim() || 'Other'
      }));

    setFormError('');
    setState((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          id: `meal-${Date.now()}`,
          dayKey: selectedDay,
          slot: selectedSlot,
          title: trimmed,
          servings: Number(servings) || 1,
          caloriesPerServing: calNum,
          ingredients: validIngredients
        }
      ]
    }));
    setMealTitle('');
    setCaloriesStr('');
    setDraftIngredients([{ id: `draft-${Date.now()}`, name: '', quantity: 100, unit: 'g', aisle: 'Produce' }]);
  };

  const deleteMeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id)
    }));
  };

  const toggleGroceryChecked = (key: string) => {
    setState((prev) => {
      const current = new Set(prev.checkedGroceryKeys ?? []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, checkedGroceryKeys: Array.from(current) };
    });
  };

  const handleExportGroceryCsv = () => {
    if (!analysis) return;
    downloadCsvFile(
      'weekly_grocery_list.csv',
      ['Ingredient', 'Total Quantity', 'Unit', 'Aisle', 'Used In Meals', 'Purchased'],
      analysis.aggregatedGroceries.map((g) => [
        g.name,
        g.quantity,
        g.unit,
        g.aisle,
        g.sourceMeals.join(' | '),
        g.checked ? 'Yes' : 'No'
      ])
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('weekly_meal_prep_plan.json', {
      plan: state,
      aggregatedGroceries: analysis?.aggregatedGroceries ?? []
    });
  };

  const copySummary = analysis
    ? `${analysis.planName} | ${analysis.totalPlannedMeals} meals across ${analysis.daysCovered} days | ${analysis.uniqueIngredientCount} consolidated grocery items`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<UtensilsCrossed className="w-4 h-4" />}
        title={isEs ? 'Planificador Semanal de Comidas y Lista de Compras' : 'Weekly Meal Prep & Grocery Schedule Planner'}
        subtitle={
          isEs
            ? 'Programa comidas de lunes a domingo y consolida ingredientes repetidos automáticamente'
            : 'Plan Mon–Sun meals & automatically consolidate duplicate ingredients into a grocery list'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={analysis && analysis.aggregatedGroceries.length > 0 ? handleExportGroceryCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_MEAL_STATE)}
        canClear={state.meals.length > 0}
      />

      {validationErrors.length > 0 && <UiErrorState message={validationErrors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Comidas Planificadas' : 'Planned Meals'}
          value={String(analysis?.totalPlannedMeals ?? 0)}
          hint={`${analysis?.daysCovered ?? 0}/7 ${isEs ? 'días cubiertos' : 'days covered'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Artículos de Supermercado' : 'Aggregated Grocery Items'}
          value={String(analysis?.uniqueIngredientCount ?? 0)}
          hint={`${analysis?.checkedGroceryCount ?? 0} ${isEs ? 'marcados' : 'checked off'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Calorías Semanales (Ingresadas)' : 'Weekly Entered Calories'}
          value={
            analysis?.weeklyEnteredCalories !== null && analysis?.weeklyEnteredCalories !== undefined
              ? `${analysis.weeklyEnteredCalories.toLocaleString()} kcal`
              : '—'
          }
          hint={
            analysis?.mealsWithCaloriesEntered
              ? `${analysis.mealsWithCaloriesEntered} ${isEs ? 'platos con kcal' : 'meals logged'}`
              : isEs
              ? 'Opcional por plato'
              : 'Optional per-meal entry'
          }
        />
        <ToolMetricTile
          label={isEs ? 'Promedio Diario Ingresado' : 'Daily Avg (Entered Days)'}
          value={
            analysis?.dailyAverageEnteredCalories !== null && analysis?.dailyAverageEnteredCalories !== undefined
              ? `${analysis.dailyAverageEnteredCalories.toLocaleString()} kcal`
              : '—'
          }
          hint={isEs ? 'solo platos con valor ingresado' : 'sum of entered meal calories'}
        />
      </div>

      {/* Add Meal + Ingredients Builder */}
      <section className="ui-panel p-5 sm:p-6 space-y-4 no-print">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Añadir Comida e Ingredientes' : 'Add Meal & Ingredients'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addMeal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? 'Día' : 'Day'} htmlFor={`${baseId}-day`}>
                <select
                  id={`${baseId}-day`}
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayKey)}
                  className="ui-input cursor-pointer text-xs"
                >
                  {WEEK_DAYS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {isEs ? d.labelEs : d.labelEn}
                    </option>
                  ))}
                </select>
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? 'Turno' : 'Slot'} htmlFor={`${baseId}-slot`}>
                <select
                  id={`${baseId}-slot`}
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                  className="ui-input cursor-pointer text-xs"
                >
                  {MEAL_SLOTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {isEs ? s.labelEs : s.labelEn}
                    </option>
                  ))}
                </select>
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-4">
              <ToolFieldGroup label={isEs ? 'Nombre del Plato' : 'Meal / Dish Name'} htmlFor={`${baseId}-title`}>
                <UiInput
                  id={`${baseId}-title`}
                  type="text"
                  placeholder={isEs ? 'Ej. Pollo con Arroz y Brócoli' : 'e.g. Chicken & Broccoli Bowl'}
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? 'Porciones' : 'Servings'} htmlFor={`${baseId}-serv`}>
                <UiInput
                  id={`${baseId}-serv`}
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="font-mono"
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? 'kcal (opc.)' : 'kcal / serv (opt)'} htmlFor={`${baseId}-kcal`}>
                <UiInput
                  id={`${baseId}-kcal`}
                  type="number"
                  min={0}
                  placeholder="—"
                  value={caloriesStr}
                  onChange={(e) => setCaloriesStr(e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
            </div>
          </div>

          {/* Structured Ingredients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {isEs ? 'Ingredientes del Plato' : 'Recipe Ingredients (auto-aggregated into Grocery List)'}
              </span>
              <UiButton type="button" variant="ghost" size="sm" onClick={addDraftIngredientRow}>
                <Plus className="w-3.5 h-3.5" />
                <span>{isEs ? 'Otro Ingrediente' : 'Add Ingredient Row'}</span>
              </UiButton>
            </div>
            <div className="space-y-2">
              {draftIngredients.map((ing) => (
                <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder={isEs ? 'Ingrediente (ej. Pechuga)' : 'Ingredient (e.g. Chicken Breast)'}
                    value={ing.name}
                    onChange={(e) => updateDraftIngredient(ing.id, { name: e.target.value })}
                    className="ui-input col-span-5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0.1}
                    step={0.5}
                    aria-label="Quantity"
                    value={ing.quantity}
                    onChange={(e) => updateDraftIngredient(ing.id, { quantity: Number(e.target.value) })}
                    className="ui-input col-span-2 py-1.5 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="g / cup / oz"
                    value={ing.unit}
                    onChange={(e) => updateDraftIngredient(ing.id, { unit: e.target.value })}
                    className="ui-input col-span-2 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={isEs ? 'Pasillo' : 'Aisle'}
                    value={ing.aisle ?? ''}
                    onChange={(e) => updateDraftIngredient(ing.id, { aisle: e.target.value })}
                    className="ui-input col-span-2 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftIngredient(ing.id)}
                    aria-label="Remove ingredient row"
                    className="col-span-1 p-1.5 text-text-tertiary hover:text-status-error cursor-pointer justify-self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <UiButton type="submit" variant="primary">
            <Plus className="w-4 h-4" />
            <span>{isEs ? 'Agregar Comida al Plan' : 'Add Meal to Weekly Schedule'}</span>
          </UiButton>
        </form>
      </section>

      {/* Two-column Schedule + Aggregated Grocery List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weekly Meal Schedule */}
        <section className="lg:col-span-7 ui-panel p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle">
            {isEs ? 'Calendario Semanal (Lunes a Domingo)' : 'Weekly Meal Schedule (Mon – Sun)'}
          </h3>

          {state.meals.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Aún no hay comidas programadas' : 'No meals scheduled yet'}
              description={
                isEs
                  ? 'Agrega comidas arriba o restaura el menú semanal de ejemplo.'
                  : 'Add meals above or restore the starter weekly meal prep plan.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample plan'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {WEEK_DAYS.map((day) => {
                const dayMeals = state.meals.filter((m) => m.dayKey === day.key);
                if (dayMeals.length === 0) return null;
                return (
                  <div
                    key={day.key}
                    className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-2.5"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-accent">
                      {isEs ? day.labelEs : day.labelEn}
                    </div>
                    <div className="space-y-2">
                      {dayMeals.map((meal) => {
                        const slotObj = MEAL_SLOTS.find((s) => s.key === meal.slot);
                        return (
                          <div
                            key={meal.id}
                            className="p-3 rounded-lg bg-surface border border-border-subtle flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <UiStatusLabel tone="neutral">
                                  {slotObj ? (isEs ? slotObj.labelEs : slotObj.labelEn) : meal.slot}
                                </UiStatusLabel>
                                <span className="font-semibold text-sm text-text-primary">
                                  {meal.title}
                                </span>
                                {typeof meal.caloriesPerServing === 'number' && (
                                  <span className="text-[11px] font-mono text-text-secondary">
                                    {meal.caloriesPerServing} kcal
                                  </span>
                                )}
                              </div>
                              {meal.ingredients.length > 0 && (
                                <div className="text-xs text-text-secondary">
                                  {meal.ingredients
                                    .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
                                    .join(' · ')}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteMeal(meal.id)}
                              aria-label={`Delete ${meal.title}`}
                              className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Consolidated Grocery List */}
        <section className="lg:col-span-5 ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">
                {isEs ? 'Lista Consolidada de Compras' : 'Aggregated Grocery List'}
              </h3>
            </div>
            <span className="text-xs font-mono text-text-secondary">
              {analysis?.checkedGroceryCount ?? 0}/{analysis?.aggregatedGroceries.length ?? 0}
            </span>
          </div>

          {!analysis || analysis.aggregatedGroceries.length === 0 ? (
            <p className="text-xs text-text-secondary py-6 text-center">
              {isEs
                ? 'Agrega ingredientes a tus comidas para generar la lista consolidada.'
                : 'Add ingredients to your meals to generate a combined grocery list.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {analysis.aggregatedGroceries.map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-xl border border-border-subtle bg-surface-secondary/50 flex items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleGroceryChecked(item.key)}
                      aria-label={`Toggle ${item.name}`}
                      className="mt-0.5 cursor-pointer shrink-0"
                    >
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-status-success" />
                      ) : (
                        <Square className="w-4 h-4 text-text-tertiary" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          item.checked ? 'line-through text-text-tertiary' : 'text-text-primary'
                        }`}
                      >
                        {item.name}
                      </div>
                      <div className="text-[11px] text-text-secondary truncate">
                        {item.aisle} · {item.sourceMeals.join(', ')}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-accent shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Nota Nutricional' : 'Nutrition & Calorie Entry Note'}
        message={
          isEs
            ? 'Los totales calóricos solo suman los valores que ingreses manualmente por plato; nunca estimamos ni inventamos datos nutricionales faltantes.'
            : 'Calorie totals strictly sum user-entered kcal values per serving; missing meal nutrition is never fabricated.'
        }
      />
    </div>
  );
}
