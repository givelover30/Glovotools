import { useState, useEffect, useId } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Check,
  Download,
  Save,
  RotateCcw,
  Pencil,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Morning Meditation (15 mins)', streak: 12, completedToday: true },
  { id: '2', name: 'Read 20 Pages of a Book', streak: 7, completedToday: false },
  { id: '3', name: 'Daily Exercise / Gym Session', streak: 5, completedToday: true },
  { id: '4', name: 'Code for at least 1 hour', streak: 21, completedToday: true }
];

const STORAGE_KEY = 'calctools_habit_tracker';

export default function HabitStreakTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [newHabitName, setNewHabitName] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStreak, setEditStreak] = useState('1');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHabits(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
          };
        }
        return h;
      })
    );
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newHabitName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del hábito.' : 'Please enter a habit name.');
      return;
    }
    setFormError('');
    setHabits((prev) => [
      ...prev,
      { id: Date.now().toString(), name: trimmed, streak: 1, completedToday: true }
    ]);
    setNewHabitName('');
  };

  const removeHabit = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id));

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditStreak(String(habit.streak));
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const nextStreak = Math.max(0, Math.round(Number(editStreak) || 0));
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name: trimmed, streak: nextStreak } : h))
    );
    setEditingId(null);
  };

  const totalStreakSum = habits.reduce((sum, h) => sum + h.streak, 0);
  const completedTodayCount = habits.filter((h) => h.completedToday).length;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(habits, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Hábitos y Rachas' : 'Habit Formation & Streak Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Construye consistencia diaria y mide tus rachas' : 'Build daily consistency and monitor active streaks'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setHabits(INITIAL_HABITS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Total de Rachas' : 'Total Streak Sum'}
          value={`${totalStreakSum} ${isEs ? 'días' : 'days'}`}
          hint={isEs ? 'días acumulados' : 'cumulative streak days'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Completados Hoy' : 'Completed Today'}
          value={`${completedTodayCount} / ${habits.length}`}
          hint={isEs ? 'hábitos diarios' : 'active daily habits'}
        />
      </div>

      {/* Add Habit & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end pb-5 border-b border-border-subtle">
          <div className="flex-1">
            <ToolFieldGroup label={isEs ? 'Agregar Nuevo Hábito' : 'Add New Habit'} htmlFor={`${baseId}-habit`}>
              <UiInput
                id={`${baseId}-habit`}
                type="text"
                placeholder={isEs ? 'Ej. Beber 2.5L de agua' : 'Habit name (e.g. Drink 3L water)'}
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <UiButton type="submit" variant="primary" className="sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>{isEs ? 'Agregar' : 'Add'}</span>
          </UiButton>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Mis Hábitos Activos' : 'Active Habits'}
            </h3>
            <UiStatusLabel tone="accent">
              {completedTodayCount}/{habits.length}
            </UiStatusLabel>
          </div>

          {habits.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin hábitos registrados' : 'No habits tracked yet'}
              description={
                isEs
                  ? 'Agrega un nuevo hábito arriba o restaura la lista inicial.'
                  : 'Add a habit above or restore the starter habit list.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setHabits(INITIAL_HABITS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample habits'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                    habit.completedToday
                      ? 'bg-accent-light/50 border-accent/35'
                      : 'bg-surface-secondary/50 border-border-subtle'
                  }`}
                >
                  {editingId === habit.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nombre del hábito' : 'Edit habit name'}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        aria-label={isEs ? 'Editar racha' : 'Edit streak'}
                        value={editStreak}
                        onChange={(e) => setEditStreak(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(habit.id)}
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
                        <button
                          type="button"
                          onClick={() => toggleHabit(habit.id)}
                          aria-label={
                            isEs
                              ? `Marcar ${habit.name} como ${habit.completedToday ? 'pendiente' : 'completado'}`
                              : `Mark ${habit.name} as ${habit.completedToday ? 'incomplete' : 'completed'}`
                          }
                          aria-pressed={habit.completedToday}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            habit.completedToday
                              ? 'bg-accent text-white shadow-xs'
                              : 'border border-border-main bg-surface text-transparent hover:border-accent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-text-primary block truncate">
                            {habit.name}
                          </span>
                          <span className="text-xs font-mono tabular-nums font-semibold text-accent">
                            {habit.streak} {isEs ? 'días de racha' : 'day streak'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(habit)}
                          aria-label={isEs ? `Editar ${habit.name}` : `Edit ${habit.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHabit(habit.id)}
                          aria-label={isEs ? `Eliminar ${habit.name}` : `Remove ${habit.name}`}
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
