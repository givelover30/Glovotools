import { useState, useMemo, useId } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Download,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface GoalItem {
  id: string;
  category: 'Career' | 'Health' | 'Finance' | 'Personal';
  title: string;
  targetDate: string;
  progress: number;
}

const INITIAL_GOALS: GoalItem[] = [
  { id: '1', category: 'Career', title: 'Complete Advanced TypeScript & React Certification', targetDate: '2026-12-31', progress: 65 },
  { id: '2', category: 'Health', title: 'Run a 10k Marathon under 50 minutes', targetDate: '2026-09-30', progress: 40 },
  { id: '3', category: 'Finance', title: 'Build $20k Investment Portfolio', targetDate: '2026-12-31', progress: 80 }
];

const CATEGORIES: GoalItem['category'][] = ['Career', 'Health', 'Finance', 'Personal'];

const CATEGORY_EN: Record<GoalItem['category'], string> = {
  Career: 'Career & Growth',
  Health: 'Health & Fitness',
  Finance: 'Finance & Wealth',
  Personal: 'Personal & Lifestyle'
};

const CATEGORY_ES: Record<GoalItem['category'], string> = {
  Career: 'Carrera y Crecimiento',
  Health: 'Salud y Bienestar',
  Finance: 'Finanzas y Ahorro',
  Personal: 'Personal y Estilo de Vida'
};

export default function PersonalGoalOrganizerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('Career');
  const [newDate, setNewDate] = useState('2026-12-31');
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<GoalItem['category']>('Career');
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el título de tu meta.' : 'Please enter a goal title.');
      return;
    }
    setFormError('');
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        category: newCategory,
        title: trimmed,
        targetDate: newDate,
        progress: 0
      }
    ]);
    setNewTitle('');
  };

  const startEdit = (g: GoalItem) => {
    setEditingId(g.id);
    setEditCategory(g.category);
    setEditTitle(g.title);
    setEditDate(g.targetDate);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, category: editCategory, title: trimmed, targetDate: editDate } : g
      )
    );
    setEditingId(null);
  };

  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((acc, g) => acc + g.progress, 0);
    return Math.round(total / goals.length);
  }, [goals]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(goals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personal_goals.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Organizador de Metas Personales' : 'Personal Goal & Milestone Organizer'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Define objetivos por área de vida y actualiza tu progreso'
                : 'Define personal objectives across life areas and track milestone progress'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Metas (JSON)' : 'Export Goals (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setGoals(INITIAL_GOALS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Metas Totales Activas' : 'Total Active Goals'}
          value={String(goals.length)}
          hint={isEs ? 'objetivos definidos' : 'tracked goals'}
        />
        <ToolMetricTile
          label={isEs ? 'Progreso Promedio de Metas' : 'Average Goal Progress'}
          value={`${avgProgress}%`}
          hint={isEs ? 'avance acumulado' : 'overall completion'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Metas Completadas' : 'Goals Completed'}
          value={String(goals.filter((g) => g.progress === 100).length)}
          hint={isEs ? 'al 100%' : 'at 100%'}
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form
          onSubmit={addGoal}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as GoalItem['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {isEs ? CATEGORY_ES[c] : CATEGORY_EN[c]}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Título de la Meta' : 'Goal Title'} htmlFor={`${baseId}-title`}>
              <UiInput
                id={`${baseId}-title`}
                type="text"
                placeholder={isEs ? 'Ej. Leer 24 libros este año' : 'e.g. Read 24 books this year'}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Fecha Objetivo' : 'Target Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Añadir' : 'Add'}</span>
            </UiButton>
          </div>
        </form>

        {goals.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay metas registradas' : 'No personal goals yet'}
            description={
              isEs
                ? 'Agrega una meta personal arriba o restaura las metas iniciales.'
                : 'Add a personal goal above or restore the starter goal list.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setGoals(INITIAL_GOALS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample goals'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const displayCat = isEs
                ? CATEGORY_ES[goal.category] || goal.category
                : CATEGORY_EN[goal.category] || goal.category;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
                >
                  {editingId === goal.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as GoalItem['category'])}
                        className="ui-select w-40 py-1.5 text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {isEs ? CATEGORY_ES[c] : CATEGORY_EN[c]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar meta' : 'Edit goal title'}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="date"
                        aria-label={isEs ? 'Editar fecha objetivo' : 'Edit target date'}
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="ui-input w-36 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(goal.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-text-primary block truncate">
                          {goal.title}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {displayCat} • {isEs ? 'Meta:' : 'Target:'} {goal.targetDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <UiStatusLabel tone={goal.progress === 100 ? 'success' : 'accent'}>
                          {goal.progress}%
                        </UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(goal)}
                          aria-label={isEs ? `Editar ${goal.title}` : `Edit ${goal.title}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGoals(goals.filter((g) => g.id !== goal.id))}
                          aria-label={isEs ? `Eliminar ${goal.title}` : `Remove ${goal.title}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <label htmlFor={`${baseId}-prog-${goal.id}`}>
                        {isEs ? 'Progreso' : 'Progress'}
                      </label>
                      <span className="font-mono font-semibold text-accent">{goal.progress}%</span>
                    </div>
                    <input
                      id={`${baseId}-prog-${goal.id}`}
                      type="range"
                      min={0}
                      max={100}
                      value={goal.progress}
                      onChange={(e) =>
                        setGoals(
                          goals.map((g) =>
                            g.id === goal.id ? { ...g, progress: Number(e.target.value) } : g
                          )
                        )
                      }
                      className="w-full accent-[#159B69] dark:accent-[#10B981] cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
