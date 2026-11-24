import { useState, useEffect, useId } from 'react';
import {
  Apple,
  Plus,
  Trash2,
  Download,
  Save,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface MealLog {
  id: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const INITIAL_MACROS: MealLog[] = [
  { id: '1', meal: 'Oatmeal & Protein Shake', calories: 450, protein: 35, carbs: 55, fat: 8 },
  { id: '2', meal: 'Chicken Rice Bowl with Veggies', calories: 650, protein: 48, carbs: 70, fat: 14 },
  { id: '3', meal: 'Greek Yogurt & Almonds', calories: 300, protein: 22, carbs: 15, fat: 12 }
];

const STORAGE_KEY = 'calctools_macro_tracker';

export default function CalorieMacroTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [meals, setMeals] = useState<MealLog[]>(INITIAL_MACROS);
  const [mealName, setMealName] = useState('');
  const [cals, setCals] = useState('400');
  const [prot, setProt] = useState('30');
  const [carbs, setCarbs] = useState('45');
  const [fat, setFat] = useState('12');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeal, setEditMeal] = useState('');
  const [editCals, setEditCals] = useState('0');
  const [editProt, setEditProt] = useState('0');
  const [editCarbs, setEditCarbs] = useState('0');
  const [editFat, setEditFat] = useState('0');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.targetCalories === 'number') setTargetCalories(parsed.targetCalories);
        if (Array.isArray(parsed.meals)) setMeals(parsed.meals);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ targetCalories, meals }));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mealName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la comida.' : 'Please enter a meal name.');
      return;
    }
    setFormError('');
    setMeals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        meal: trimmed,
        calories: Math.max(0, Number(cals) || 0),
        protein: Math.max(0, Number(prot) || 0),
        carbs: Math.max(0, Number(carbs) || 0),
        fat: Math.max(0, Number(fat) || 0)
      }
    ]);
    setMealName('');
  };

  const removeMeal = (id: string) => setMeals((prev) => prev.filter((m) => m.id !== id));

  const startEdit = (m: MealLog) => {
    setEditingId(m.id);
    setEditMeal(m.meal);
    setEditCals(String(m.calories));
    setEditProt(String(m.protein));
    setEditCarbs(String(m.carbs));
    setEditFat(String(m.fat));
  };

  const commitEdit = (id: string) => {
    const trimmed = editMeal.trim();
    if (!trimmed) return;
    setMeals((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              meal: trimmed,
              calories: Math.max(0, Number(editCals) || 0),
              protein: Math.max(0, Number(editProt) || 0),
              carbs: Math.max(0, Number(editCarbs) || 0),
              fat: Math.max(0, Number(editFat) || 0)
            }
          : m
      )
    );
    setEditingId(null);
  };

  const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const handleDownload = () => {
    const data = { targetCalories, meals, totalCals, totalProtein, totalCarbs, totalFat };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-macro-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Apple className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Calorías y Macronutrientes' : 'Calorie & Macronutrient Intake Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Controla calorías diarias, proteína, carbohidratos y grasas' : 'Monitor daily energy intake and protein, carb, fat balance'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? (isEs ? '¡Guardado!' : 'Saved!') : (isEs ? 'Guardar' : 'Save')}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setTargetCalories(2200);
              setMeals(INITIAL_MACROS);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Calorías Consumidas' : 'Total Calories'}
          value={`${totalCals} / ${targetCalories}`}
          hint="kcal"
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Proteína' : 'Protein'}
          value={`${totalProtein}g`}
          hint={isEs ? 'total diario' : 'daily protein'}
        />
        <ToolMetricTile
          label={isEs ? 'Carbohidratos' : 'Carbs'}
          value={`${totalCarbs}g`}
          hint={isEs ? 'total diario' : 'daily carbs'}
        />
        <ToolMetricTile
          label={isEs ? 'Grasas' : 'Fat'}
          value={`${totalFat}g`}
          hint={isEs ? 'total diario' : 'daily fat'}
        />
      </div>

      {/* Add & Target Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="max-w-xs">
          <ToolFieldGroup
            label={isEs ? 'Meta Diaria de Calorías' : 'Daily Calorie Target'}
            htmlFor={`${baseId}-target`}
            unit="kcal"
          >
            <UiInput
              id={`${baseId}-target`}
              type="number"
              min={100}
              step={50}
              value={targetCalories}
              onChange={(e) => setTargetCalories(Math.max(0, Number(e.target.value) || 0))}
              className="font-mono tabular-nums"
            />
          </ToolFieldGroup>
        </div>

        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addMeal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Comida / Alimento' : 'Meal Name'} htmlFor={`${baseId}-meal`}>
              <UiInput
                id={`${baseId}-meal`}
                type="text"
                placeholder={isEs ? 'Ej. Salmón con arroz' : 'Meal name (e.g. Salmon & Rice)'}
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Calorías' : 'Calories'} htmlFor={`${baseId}-cals`} unit="kcal">
              <UiInput
                id={`${baseId}-cals`}
                type="number"
                min={0}
                value={cals}
                onChange={(e) => setCals(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Proteína' : 'Protein'} htmlFor={`${baseId}-prot`} unit="g">
              <UiInput
                id={`${baseId}-prot`}
                type="number"
                min={0}
                value={prot}
                onChange={(e) => setProt(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <ToolFieldGroup label={isEs ? 'Carb' : 'Carbs'} htmlFor={`${baseId}-carbs`} unit="g">
              <UiInput
                id={`${baseId}-carbs`}
                type="number"
                min={0}
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Grasas' : 'Fat'} htmlFor={`${baseId}-fat`} unit="g">
              <UiInput
                id={`${baseId}-fat`}
                type="number"
                min={0}
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton
              type="submit"
              variant="primary"
              className="w-full"
              aria-label={isEs ? 'Agregar comida' : 'Add Meal'}
            >
              <Plus className="w-4 h-4" />
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Comidas Registradas Hoy' : 'Logged Meals Today'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{meals.length}</span>
          </div>

          {meals.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin comidas registradas' : 'No meals logged yet'}
              description={
                isEs
                  ? 'Agrega una comida arriba o restaura las comidas de ejemplo.'
                  : 'Log a meal above or restore sample meals.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setMeals(INITIAL_MACROS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample meals'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {meals.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === m.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar comida' : 'Edit meal'}
                        value={editMeal}
                        onChange={(e) => setEditMeal(e.target.value)}
                        className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar calorías' : 'Edit calories'}
                        value={editCals}
                        onChange={(e) => setEditCals(e.target.value)}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar proteína' : 'Edit protein'}
                        value={editProt}
                        onChange={(e) => setEditProt(e.target.value)}
                        className="ui-input w-16 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar carbohidratos' : 'Edit carbs'}
                        value={editCarbs}
                        onChange={(e) => setEditCarbs(e.target.value)}
                        className="ui-input w-16 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar grasas' : 'Edit fat'}
                        value={editFat}
                        onChange={(e) => setEditFat(e.target.value)}
                        className="ui-input w-16 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(m.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar' : 'Cancel'}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {m.meal}
                        </span>
                        <span className="text-[11px] text-text-secondary font-mono tabular-nums">
                          P: {m.protein}g • C: {m.carbs}g • F: {m.fat}g
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-accent">
                          {m.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          aria-label={isEs ? `Editar ${m.meal}` : `Edit ${m.meal}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMeal(m.id)}
                          aria-label={isEs ? `Eliminar ${m.meal}` : `Remove ${m.meal}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
