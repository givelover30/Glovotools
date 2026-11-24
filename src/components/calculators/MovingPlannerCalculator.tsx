import { useState, useEffect, useId } from 'react';
import {
  Truck,
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
  UiSelect,
  UiCheckbox,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface MovingTask {
  id: string;
  week: string;
  task: string;
  done: boolean;
}

const STORAGE_KEY = 'calctools_moving_planner';

const INITIAL_MOVING_TASKS: MovingTask[] = [
  { id: '1', week: '8 Weeks Out', task: 'Get moving cost estimates and choose a moving company', done: true },
  { id: '2', week: '6 Weeks Out', task: 'Start decluttering and selling unwanted items', done: false },
  { id: '3', week: '4 Weeks Out', task: 'Begin packing non-essential rooms and label boxes', done: false },
  { id: '4', week: '3 Weeks Out', task: 'Notify utility companies (water, electricity, internet) of move date', done: false },
  { id: '5', week: '2 Weeks Out', task: 'Confirm arrangements with movers and finalize address change', done: false },
  { id: '6', week: '1 Week Out', task: 'Pack essential open-first box and clean old home', done: false },
  { id: '7', week: 'Moving Day', task: 'Do final walkthrough, check meters, and hand over keys', done: false }
];

const WEEK_OPTIONS = [
  '8 Weeks Out',
  '6 Weeks Out',
  '4 Weeks Out',
  '3 Weeks Out',
  '2 Weeks Out',
  '1 Week Out',
  'Moving Day'
];

const WEEK_ES: Record<string, string> = {
  '8 Weeks Out': '8 Semanas Antes',
  '6 Weeks Out': '6 Semanas Antes',
  '4 Weeks Out': '4 Semanas Antes',
  '3 Weeks Out': '3 Semanas Antes',
  '2 Weeks Out': '2 Semanas Antes',
  '1 Week Out': '1 Semana Antes',
  'Moving Day': 'Día de la Mudanza'
};

export default function MovingPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<MovingTask[]>(INITIAL_MOVING_TASKS);
  const [newTask, setNewTask] = useState('');
  const [newWeek, setNewWeek] = useState('2 Weeks Out');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeek, setEditWeek] = useState('2 Weeks Out');
  const [editTask, setEditTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch {
        // Ignore invalid localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Describe la tarea de mudanza.' : 'Please enter a moving task description.');
      return;
    }
    setFormError('');
    setTasks([...tasks, { id: Date.now().toString(), week: newWeek, task: trimmed, done: false }]);
    setNewTask('');
  };

  const startEdit = (item: MovingTask) => {
    setEditingId(item.id);
    setEditWeek(item.week);
    setEditTask(item.task);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed) return;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, week: editWeek, task: trimmed } : t)));
    setEditingId(null);
  };

  const removeTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moving-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador y Lista de Mudanza' : 'House Moving Checklist & Timeline'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Organiza tus tareas por semanas antes del día de la mudanza'
                : 'Track relocation tasks from 8 weeks out through moving day'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_MOVING_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Progreso de Mudanza' : 'Relocation Progress'}
          value={`${progressPercent}%`}
          hint={`${completedCount} ${isEs ? 'de' : 'of'} ${tasks.length} ${isEs ? 'tareas' : 'tasks'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Completadas' : 'Completed'}
          value={String(completedCount)}
          hint={isEs ? 'tareas finalizadas' : 'finished chores'}
        />
        <ToolMetricTile
          label={isEs ? 'Pendientes' : 'Remaining'}
          value={String(tasks.length - completedCount)}
          hint={isEs ? 'por completar' : 'left to do'}
        />
      </div>

      <div className="ui-panel p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
          <span>{isEs ? 'Avance de la lista de verificación' : 'Checklist Completion'}</span>
          <span className="font-mono text-accent">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-secondary overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Tarea de Mudanza' : 'Add Moving Task'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Etapa / Semana' : 'Milestone'} htmlFor={`${baseId}-week`}>
              <UiSelect
                id={`${baseId}-week`}
                value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
              >
                {WEEK_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {isEs ? WEEK_ES[w] || w : w}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-7">
            <ToolFieldGroup
              label={isEs ? 'Descripción de la tarea' : 'Task description'}
              htmlFor={`${baseId}-task`}
            >
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={
                  isEs ? 'Ej. Empacar vajilla frágil' : 'e.g. Pack fragile kitchen items'
                }
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton variant="primary" onClick={addTask} className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Agregar' : 'Add Task'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Task List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Lista de Tareas' : 'Checklist Timeline'}
          </h3>
          {tasks.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setTasks([])}>
              {isEs ? 'Vaciar lista' : 'Clear list'}
            </UiButton>
          )}
        </div>

        {tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay tareas de mudanza' : 'No moving tasks yet'}
            description={
              isEs
                ? 'Agrega una nueva tarea arriba o restaura el cronograma base.'
                : 'Add a moving task above or restore the starter checklist.'
            }
            action={
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setTasks(INITIAL_MOVING_TASKS)}
              >
                {isEs ? 'Restaurar ejemplo' : 'Restore sample tasks'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => {
              const displayWeek = isEs ? WEEK_ES[t.week] || t.week : t.week;
              return (
                <div
                  key={t.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    t.done
                      ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                      : 'bg-surface border-border-main'
                  }`}
                >
                  {editingId === t.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <select
                        aria-label={isEs ? 'Editar etapa' : 'Edit milestone'}
                        value={editWeek}
                        onChange={(e) => setEditWeek(e.target.value)}
                        className="ui-select w-40 py-1.5 text-xs"
                      >
                        {WEEK_OPTIONS.map((w) => (
                          <option key={w} value={w}>
                            {isEs ? WEEK_ES[w] || w : w}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar tarea' : 'Edit task'}
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(t.id)}
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
                    <>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <UiCheckbox
                          label=""
                          aria-label={isEs ? `Marcar ${t.task}` : `Toggle ${t.task}`}
                          checked={t.done}
                          onChange={() => toggleTask(t.id)}
                        />
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              t.done ? 'line-through text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {t.task}
                          </span>
                          <span className="text-[11px] text-accent font-mono font-semibold">
                            {displayWeek}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(t)}
                          aria-label={isEs ? `Editar ${t.task}` : `Edit ${t.task}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTask(t.id)}
                          aria-label={isEs ? `Eliminar ${t.task}` : `Remove ${t.task}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
