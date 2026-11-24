import { useState, useEffect, useId } from 'react';
import { Utensils, Download, Save, RefreshCw, Eraser } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';

interface DayMeals {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  calories: number;
}

const STORAGE_KEY = 'calctools_meal_planner';

const INITIAL_MEALS: DayMeals[] = [
  { day: 'Monday', breakfast: 'Oatmeal with Berries & Honey', lunch: 'Grilled Chicken Salad', dinner: 'Baked Salmon with Quinoa', snacks: 'Greek Yogurt & Almonds', calories: 1850 },
  { day: 'Tuesday', breakfast: 'Avocado Toast with Eggs', lunch: 'Turkey & Avocado Wrap', dinner: 'Lean Beef Stir-fry with Broccoli', snacks: 'Apple & Peanut Butter', calories: 1920 },
  { day: 'Wednesday', breakfast: 'Greek Yogurt Parfait', lunch: 'Quinoa Buddha Bowl', dinner: 'Baked Chicken Breast & Asparagus', snacks: 'Mixed Nuts', calories: 1780 },
  { day: 'Thursday', breakfast: 'Scrambled Eggs & Spinach', lunch: 'Tuna Salad Sandwich', dinner: 'Shrimp Tacos with Cabbage Slaw', snacks: 'Protein Shake', calories: 1840 },
  { day: 'Friday', breakfast: 'Protein Smoothie & Banana', lunch: 'Leftover Baked Salmon', dinner: 'Margherita Pizza & Side Salad', snacks: 'Dark Chocolate & Berries', calories: 2100 },
  { day: 'Saturday', breakfast: 'Pancakes with Maple Syrup', lunch: 'Turkey Burger with Sweet Potato Fries', dinner: 'Grilled Steak & Roasted Vegetables', snacks: 'Rice Cakes', calories: 2250 },
  { day: 'Sunday', breakfast: 'Omelet with Mushrooms & Cheese', lunch: 'Mediterranean Chickpea Salad', dinner: 'Roast Chicken with Root Veggies', snacks: 'Fruit Bowl', calories: 1900 }
];

const DAY_LABELS_ES: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo'
};

export default function MealPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [meals, setMeals] = useState<DayMeals[]>(INITIAL_MEALS);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMeals(parsed);
      } catch {
        // Ignore malformed localStorage
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleUpdate = (index: number, field: keyof DayMeals, value: string | number) => {
    setMeals((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleClearMeals = () => {
    setMeals((prev) =>
      prev.map((row) => ({
        ...row,
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        calories: 0
      }))
    );
  };

  const totalWeeklyCalories = meals.reduce((sum, d) => sum + (Number(d.calories) || 0), 0);
  const avgDailyCalories = Math.round(totalWeeklyCalories / (meals.length || 1));

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(meals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador Semanal de Comidas' : 'Weekly Meal Planner & Nutrition'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Organiza tus 7 días de comidas y calorías estimadas'
                : 'Organize 7 days of meals and daily calorie targets'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">
              {isEs ? 'Guardado localmente' : 'Saved locally'}
            </UiStatusLabel>
          )}
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={handleClearMeals}>
            <Eraser className="w-3.5 h-3.5" />
            <span>{isEs ? 'Limpiar' : 'Clear'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={() => setMeals(INITIAL_MEALS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset Default'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Promedio Diario de Calorías' : 'Average Daily Calories'}
          value={`${avgDailyCalories.toLocaleString()} kcal`}
          hint={isEs ? 'por día' : 'per day'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Total Semanal' : 'Weekly Calorie Total'}
          value={`${totalWeeklyCalories.toLocaleString()} kcal`}
          hint={isEs ? '7 días planificados' : '7 planned days'}
        />
        <ToolMetricTile
          label={isEs ? 'Días Planificados' : 'Planned Days'}
          value={`${meals.filter((m) => m.breakfast || m.lunch || m.dinner).length} / ${meals.length}`}
          hint={isEs ? 'con al menos una comida' : 'with meals entered'}
        />
      </div>

      {/* Daily Meal Cards */}
      <div className="space-y-4">
        {meals.map((item, idx) => {
          const displayDay = isEs ? DAY_LABELS_ES[item.day] || item.day : item.day;
          const calId = `${baseId}-cal-${idx}`;
          const bId = `${baseId}-b-${idx}`;
          const lId = `${baseId}-l-${idx}`;
          const dId = `${baseId}-d-${idx}`;
          const sId = `${baseId}-s-${idx}`;

          return (
            <section key={item.day} className="ui-panel p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-accent-light text-accent flex items-center justify-center font-mono text-xs">
                    {idx + 1}
                  </span>
                  <span>{displayDay}</span>
                </h3>

                <div className="flex items-center gap-2">
                  <label htmlFor={calId} className="text-xs font-medium text-text-secondary">
                    {isEs ? 'Calorías (kcal):' : 'Calories (kcal):'}
                  </label>
                  <input
                    id={calId}
                    type="number"
                    min={0}
                    value={item.calories}
                    onChange={(e) => handleUpdate(idx, 'calories', Math.max(0, Number(e.target.value)))}
                    className="ui-input w-24 py-1.5 text-xs font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ToolFieldGroup label={isEs ? 'Desayuno' : 'Breakfast'} htmlFor={bId}>
                  <UiInput
                    id={bId}
                    type="text"
                    placeholder={isEs ? 'Desayuno' : 'Breakfast'}
                    value={item.breakfast}
                    onChange={(e) => handleUpdate(idx, 'breakfast', e.target.value)}
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Almuerzo' : 'Lunch'} htmlFor={lId}>
                  <UiInput
                    id={lId}
                    type="text"
                    placeholder={isEs ? 'Almuerzo' : 'Lunch'}
                    value={item.lunch}
                    onChange={(e) => handleUpdate(idx, 'lunch', e.target.value)}
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Cena' : 'Dinner'} htmlFor={dId}>
                  <UiInput
                    id={dId}
                    type="text"
                    placeholder={isEs ? 'Cena' : 'Dinner'}
                    value={item.dinner}
                    onChange={(e) => handleUpdate(idx, 'dinner', e.target.value)}
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Meriendas' : 'Snacks'} htmlFor={sId}>
                  <UiInput
                    id={sId}
                    type="text"
                    placeholder={isEs ? 'Meriendas' : 'Snacks'}
                    value={item.snacks}
                    onChange={(e) => handleUpdate(idx, 'snacks', e.target.value)}
                  />
                </ToolFieldGroup>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
