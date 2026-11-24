import { useState, useEffect, useId } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface WorkoutLog {
  id: string;
  date: string;
  exercise: string;
  category: string;
  durationMins: number;
  caloriesBurned: number;
}

const INITIAL_WORKOUTS: WorkoutLog[] = [
  { id: '1', date: '2026-11-10', exercise: 'Upper Body Strength (Bench & Rows)', category: 'Strength', durationMins: 60, caloriesBurned: 420 },
  { id: '2', date: '2026-11-11', exercise: 'HIIT Cardio & Core Conditioning', category: 'Cardio', durationMins: 45, caloriesBurned: 510 },
  { id: '3', date: '2026-11-12', exercise: 'Long Distance Jogging', category: 'Running', durationMins: 50, caloriesBurned: 580 }
];

const CATEGORIES = ['Strength', 'Cardio', 'Running', 'Yoga / Mobility', 'HIIT'];
const STORAGE_KEY = 'calctools_workout_tracker';

export default function WorkoutFitnessTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [workouts, setWorkouts] = useState<WorkoutLog[]>(INITIAL_WORKOUTS);
  const [exercise, setExercise] = useState('');
  const [category, setCategory] = useState('Strength');
  const [duration, setDuration] = useState('45');
  const [calories, setCalories] = useState('350');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editExercise, setEditExercise] = useState('');
  const [editDuration, setEditDuration] = useState('30');
  const [editCalories, setEditCalories] = useState('200');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setWorkouts(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = exercise.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del ejercicio.' : 'Please enter an exercise name.');
      return;
    }
    setFormError('');
    setWorkouts((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        exercise: trimmed,
        category,
        durationMins: Math.max(1, Number(duration) || 30),
        caloriesBurned: Math.max(0, Number(calories) || 200)
      },
      ...prev
    ]);
    setExercise('');
  };

  const removeWorkout = (id: string) => setWorkouts((prev) => prev.filter((w) => w.id !== id));

  const startEdit = (w: WorkoutLog) => {
    setEditingId(w.id);
    setEditExercise(w.exercise);
    setEditDuration(String(w.durationMins));
    setEditCalories(String(w.caloriesBurned));
  };

  const commitEdit = (id: string) => {
    const trimmed = editExercise.trim();
    if (!trimmed) return;
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              exercise: trimmed,
              durationMins: Math.max(1, Number(editDuration) || 30),
              caloriesBurned: Math.max(0, Number(editCalories) || 0)
            }
          : w
      )
    );
    setEditingId(null);
  };

  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMins, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(workouts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Entrenamientos y Fitness' : 'Workout & Fitness Activity Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra tus sesiones, minutos activos y calorías' : 'Log training sessions, active duration, and calories burned'}
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
          <UiButton variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
            <span>{isEs ? 'Imprimir' : 'Print'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setWorkouts(INITIAL_WORKOUTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Minutos Activos Totales' : 'Total Active Minutes'}
          value={`${totalMinutes} mins`}
          hint={isEs ? 'tiempo de ejercicio' : 'cumulative training time'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Calorías Totales Quemadas' : 'Total Calories Burned'}
          value={`${totalCalories} kcal`}
          hint={isEs ? `${workouts.length} sesiones` : `${workouts.length} sessions`}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addWorkout} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Ejercicio / Sesión' : 'Exercise'} htmlFor={`${baseId}-ex`}>
              <UiInput
                id={`${baseId}-ex`}
                type="text"
                placeholder={isEs ? 'Ej. Press banca y sentadilla' : 'Exercise (e.g. Bench Press)'}
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Minutos' : 'Mins'} htmlFor={`${baseId}-dur`}>
              <UiInput
                id={`${baseId}-dur`}
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Calorías' : 'Calories'} htmlFor={`${baseId}-cal`}>
              <UiInput
                id={`${baseId}-cal`}
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton
              type="submit"
              variant="primary"
              className="w-full"
              aria-label={isEs ? 'Agregar entrenamiento' : 'Add Workout'}
            >
              <Plus className="w-4 h-4" />
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Historial de Entrenamientos' : 'Workout History'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{workouts.length}</span>
          </div>

          {workouts.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin entrenamientos registrados' : 'No workouts logged yet'}
              description={
                isEs
                  ? 'Registra una sesión arriba o restaura el historial inicial.'
                  : 'Log a workout session above or restore sample sessions.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setWorkouts(INITIAL_WORKOUTS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample workouts'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === w.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar ejercicio' : 'Edit exercise'}
                        value={editExercise}
                        onChange={(e) => setEditExercise(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar minutos' : 'Edit minutes'}
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar calorías' : 'Edit calories'}
                        value={editCalories}
                        onChange={(e) => setEditCalories(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(w.id)}
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
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs text-text-secondary shrink-0">
                          {w.date}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-text-primary block truncate">
                            {w.exercise}
                          </span>
                          <span className="text-[11px] font-mono text-accent uppercase">
                            {w.category} • {w.durationMins} mins
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
                          {w.caloriesBurned} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(w)}
                          aria-label={isEs ? `Editar ${w.exercise}` : `Edit ${w.exercise}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWorkout(w.id)}
                          aria-label={isEs ? `Eliminar ${w.exercise}` : `Remove ${w.exercise}`}
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
