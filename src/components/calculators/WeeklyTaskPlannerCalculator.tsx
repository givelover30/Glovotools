import { useState, useEffect, useId } from 'react';
import {
  CheckSquare,
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

interface WeeklyTask {
  id: string;
  day: string;
  task: string;
  done: boolean;
}

const STORAGE_KEY = 'calctools_weekly_tasks';

const INITIAL_TASKS: WeeklyTask[] = [
  { id: '1', day: 'Monday', task: 'Review weekly sprint goals and backlog', done: true },
  { id: '2', day: 'Tuesday', task: 'Finalize quarterly marketing report', done: false },
  { id: '3', day: 'Wednesday', task: 'Client presentation & product walkthrough', done: false },
  { id: '4', day: 'Thursday', task: 'Team 1-on-1 performance catch-ups', done: false },
  { id: '5', day: 'Friday', task: 'Code freeze and deployment sign-off', done: false }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_ES: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo'
};

export default function WeeklyTaskPlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<WeeklyTask[]>(INITIAL_TASKS);
  const [newTask, setNewTask] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDay, setEditDay] = useState('Monday');
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
      setFormError(isEs ? 'Ingresa la descripción de la tarea.' : 'Please enter a task description.');
      return;
    }
    setFormError('');
    setTasks([...tasks, { id: Date.now().toString(), day: newDay, task: trimmed, done: false }]);
    setNewTask('');
  };

  const startEdit = (item: WeeklyTask) => {
    setEditingId(item.id);
    setEditDay(item.day);
    setEditTask(item.task);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed) return;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, day: editDay, task: trimmed } : t)));
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
    a.download = `weekly-tasks-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador Semanal de Tareas' : 'Weekly Task & Productivity Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Distribuye tus entregables clave de lunes a domingo'
                : 'Distribute key weekly tasks and track daily completion'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Progreso Semanal' : 'Weekly Completion Rate'}
          value={`${progressPercent}%`}
          hint={`${completedCount} ${isEs ? 'de' : 'of'} ${tasks.length} ${isEs ? 'tareas' : 'tasks'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Completadas' : 'Completed'}
          value={String(completedCount)}
          hint={isEs ? 'entregables listos' : 'tasks finished'}
        />
        <ToolMetricTile
          label={isEs ? 'Pendientes' : 'Remaining'}
          value={String(tasks.length - completedCount)}
          hint={isEs ? 'tareas por hacer' : 'left this week'}
        />
      </div>

      {/* Add Task Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Tarea Semanal' : 'Add Weekly Task'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Día' : 'Day'} htmlFor={`${baseId}-day`}>
              <UiSelect
                id={`${baseId}-day`}
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {isEs ? DAY_ES[d] : d}
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
                placeholder={isEs ? 'Ej. Preparar reporte semanal' : 'Task description'}
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

      {/* Tasks Grouped By Day */}
      {tasks.length === 0 ? (
        <section className="ui-panel p-6">
          <UiEmptyState
            title={isEs ? 'Sin tareas semanales' : 'No weekly tasks scheduled'}
            description={
              isEs
                ? 'Agrega una tarea para cualquier día o restaura el plan inicial.'
                : 'Add a task for any day above or restore the starter weekly tasks.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample tasks'}
              </UiButton>
            }
          />
        </section>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <UiButton variant="ghost" size="sm" onClick={() => setTasks([])}>
              {isEs ? 'Vaciar todas las tareas' : 'Clear all tasks'}
            </UiButton>
          </div>
          {DAYS.map((dayName) => {
            const dayTasks = tasks.filter((t) => t.day === dayName);
            const doneDay = dayTasks.filter((t) => t.done).length;
            return (
              <section key={dayName} className="ui-panel p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-subtle">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    {isEs ? DAY_ES[dayName] : dayName}
                  </h3>
                  <UiStatusLabel tone={doneDay === dayTasks.length && dayTasks.length > 0 ? 'success' : 'neutral'}>
                    {doneDay}/{dayTasks.length} {isEs ? 'completadas' : 'done'}
                  </UiStatusLabel>
                </div>

                {dayTasks.length === 0 ? (
                  <p className="text-xs text-text-secondary py-1">
                    {isEs ? 'Sin tareas para este día.' : 'No tasks scheduled for this day.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                          t.done
                            ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                            : 'bg-surface border-border-main'
                        }`}
                      >
                        {editingId === t.id ? (
                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            <select
                              aria-label={isEs ? 'Editar día' : 'Edit day'}
                              value={editDay}
                              onChange={(e) => setEditDay(e.target.value)}
                              className="ui-select w-32 py-1.5 text-xs"
                            >
                              {DAYS.map((d) => (
                                <option key={d} value={d}>
                                  {isEs ? DAY_ES[d] : d}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              aria-label={isEs ? 'Editar tarea' : 'Edit task'}
                              value={editTask}
                              onChange={(e) => setEditTask(e.target.value)}
                              className="ui-input flex-1 min-w-[150px] py-1.5 text-xs"
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
                              <span
                                className={`text-xs font-semibold truncate ${
                                  t.done ? 'line-through text-text-secondary' : 'text-text-primary'
                                }`}
                              >
                                {t.task}
                              </span>
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
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
