import { useState, useMemo, useId } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Pencil,
  Check,
  X
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

interface Task {
  id: string;
  name: string;
  startDate: string;
  durationDays: number;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

const INITIAL_TASKS: Task[] = [
  { id: '1', name: 'Project Kickoff & Discovery', startDate: '2026-11-01', durationDays: 5, progress: 100, status: 'Completed' },
  { id: '2', name: 'Architecture & UI Wireframing', startDate: '2026-11-06', durationDays: 10, progress: 75, status: 'In Progress' },
  { id: '3', name: 'Frontend Component Implementation', startDate: '2026-11-16', durationDays: 14, progress: 30, status: 'In Progress' },
  { id: '4', name: 'Integration & API Testing', startDate: '2026-12-01', durationDays: 7, progress: 0, status: 'Not Started' },
  { id: '5', name: 'Final QA & Production Deployment', startDate: '2026-12-08', durationDays: 4, progress: 0, status: 'Not Started' }
];

const STATUS_ES: Record<Task['status'], string> = {
  'Not Started': 'Sin iniciar',
  'In Progress': 'En progreso',
  Completed: 'Completada'
};

export default function ProjectTimelinePlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTaskName, setNewTaskName] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDuration, setNewDuration] = useState(5);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editDuration, setEditDuration] = useState(5);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la tarea.' : 'Please enter a task name.');
      return;
    }
    if (!Number.isFinite(newDuration) || newDuration < 1) {
      setFormError(isEs ? 'La duración debe ser al menos 1 día.' : 'Duration must be at least 1 day.');
      return;
    }
    setFormError('');
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        name: trimmed,
        startDate: newStartDate,
        durationDays: Math.max(1, Number(newDuration) || 1),
        progress: 0,
        status: 'Not Started'
      }
    ]);
    setNewTaskName('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const p = Math.max(0, Math.min(100, progress));
          const status: Task['status'] =
            p === 100 ? 'Completed' : p > 0 ? 'In Progress' : 'Not Started';
          return { ...t, progress: p, status };
        }
        return t;
      })
    );
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditStart(t.startDate);
    setEditDuration(t.durationDays);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed || !Number.isFinite(editDuration) || editDuration < 1) return;
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, name: trimmed, startDate: editStart, durationDays: Math.max(1, editDuration) }
          : t
      )
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return { completed: 0, avgProgress: 0 };
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const totalProg = tasks.reduce((acc, t) => acc + t.progress, 0);
    return {
      completed,
      avgProgress: Math.round(totalProg / total)
    };
  }, [tasks]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project_timeline.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Cronograma y Tareas del Proyecto' : 'Project Tasks & Milestones'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Ajusta avances de hitos y sigue el progreso global del proyecto'
                : 'Adjust milestone completion percentages and track overall schedule progress'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar JSON' : 'Export JSON'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
          {tasks.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setTasks([])}>
              <span>{isEs ? 'Limpiar' : 'Clear All'}</span>
            </UiButton>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Tareas Totales' : 'Total Tasks'}
          value={String(tasks.length)}
          hint={isEs ? 'hitos activos' : 'project milestones'}
        />
        <ToolMetricTile
          label={isEs ? 'Tareas Completadas' : 'Completed Tasks'}
          value={`${summary.completed} / ${tasks.length}`}
          hint={isEs ? 'finalizadas' : 'milestones done'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Progreso General' : 'Overall Progress'}
          value={`${summary.avgProgress}%`}
          hint={isEs ? 'avance promedio' : 'average completion'}
          accent
        />
      </div>

      {/* Add Task Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Añadir Nueva Tarea al Proyecto' : 'Add New Project Task'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Nombre de la Tarea' : 'Task Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Desarrollo de API Backend' : 'e.g. Backend API development'}
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Fecha de Inicio' : 'Start Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Duración (días)' : 'Duration (days)'} htmlFor={`${baseId}-dur`}>
              <UiInput
                id={`${baseId}-dur`}
                type="number"
                min={1}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
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
      </section>

      {/* Tasks List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle">
          {isEs ? 'Cronograma y Tareas' : 'Project Tasks & Milestones'}
        </h3>

        {tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay tareas en el cronograma' : 'No tasks in the timeline'}
            description={
              isEs
                ? 'Añade un hito arriba o restaura las tareas de ejemplo.'
                : 'Add a project task above or restore the sample timeline.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample timeline'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const statusTone =
                task.status === 'Completed'
                  ? 'success'
                  : task.status === 'In Progress'
                  ? 'accent'
                  : 'neutral';
              const displayStatus = isEs ? STATUS_ES[task.status] : task.status;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
                >
                  {editingId === task.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nombre de tarea' : 'Edit task name'}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="date"
                        aria-label={isEs ? 'Editar fecha de inicio' : 'Edit start date'}
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="ui-input w-36 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        aria-label={isEs ? 'Editar duración' : 'Edit duration'}
                        value={editDuration}
                        onChange={(e) => setEditDuration(Number(e.target.value))}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(task.id)}
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-text-primary block truncate">
                          {task.name}
                        </span>
                        <div className="text-xs text-text-secondary font-mono mt-0.5">
                          {isEs ? 'Inicio:' : 'Start:'} {task.startDate} • {task.durationDays}{' '}
                          {isEs ? 'días' : 'days'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <UiStatusLabel tone={statusTone}>{displayStatus}</UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          aria-label={isEs ? `Editar ${task.name}` : `Edit ${task.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          aria-label={isEs ? `Eliminar ${task.name}` : `Delete ${task.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <label htmlFor={`${baseId}-prog-${task.id}`}>
                        {isEs ? 'Progreso' : 'Progress'}
                      </label>
                      <span className="font-mono font-semibold text-accent">{task.progress}%</span>
                    </div>
                    <input
                      id={`${baseId}-prog-${task.id}`}
                      type="range"
                      min={0}
                      max={100}
                      value={task.progress}
                      onChange={(e) => updateTaskProgress(task.id, Number(e.target.value))}
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
