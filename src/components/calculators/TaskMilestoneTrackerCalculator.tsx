import { useState, useEffect, useId } from 'react';
import {
  CheckSquare,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface MilestoneTask {
  id: string;
  project: string;
  task: string;
  completed: boolean;
}

const INITIAL_TASKS: MilestoneTask[] = [
  { id: '1', project: 'Website Redesign', task: 'Design UI wireframes in Figma', completed: true },
  { id: '2', project: 'Website Redesign', task: 'Implement React frontend components', completed: true },
  { id: '3', project: 'Website Redesign', task: 'Perform cross-browser QA testing', completed: false },
  { id: '4', project: 'Mobile App', task: 'Setup authentication and backend API proxy', completed: false }
];

const STORAGE_KEY = 'calctools_task_milestone_tracker';

export default function TaskMilestoneTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<MilestoneTask[]>(INITIAL_TASKS);
  const [project, setProject] = useState('Website Redesign');
  const [taskName, setTaskName] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProject, setEditProject] = useState('');
  const [editTask, setEditTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = taskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa una descripción del hito o tarea.' : 'Please enter a milestone task.');
      return;
    }
    setFormError('');
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), project: project.trim() || 'General', task: trimmed, completed: false }
    ]);
    setTaskName('');
  };

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (t: MilestoneTask) => {
    setEditingId(t.id);
    setEditProject(t.project);
    setEditTask(t.task);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, project: editProject.trim() || t.project, task: trimmed } : t
      )
    );
    setEditingId(null);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-milestone-tracker-${Date.now()}.json`;
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
              {isEs ? 'Rastreador de Tareas y Hitos' : 'Task & Milestone Progress Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Organiza entregables por proyecto y mide el avance' : 'Organize deliverables by project and measure completion'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Progreso de Hitos' : 'Milestone Completion'}
          value={`${progressPercent}%`}
          hint={isEs ? 'avance total' : 'overall completion'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Completadas' : 'Completed'}
          value={String(completedCount)}
          hint={isEs ? 'hitos finalizados' : 'finished milestones'}
        />
        <ToolMetricTile
          label={isEs ? 'Pendientes' : 'Remaining'}
          value={String(tasks.length - completedCount)}
          hint={isEs ? 'por completar' : 'open deliverables'}
        />
      </div>

      {/* Progress Bar */}
      <div className="ui-panel p-5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-secondary">
            {isEs
              ? `${completedCount} de ${tasks.length} hitos completados`
              : `${completedCount} of ${tasks.length} milestones completed`}
          </span>
          <UiStatusLabel tone={progressPercent === 100 ? 'success' : 'accent'}>
            {progressPercent}%
          </UiStatusLabel>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-secondary border border-border-subtle overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Proyecto' : 'Project Name'} htmlFor={`${baseId}-proj`}>
              <UiInput
                id={`${baseId}-proj`}
                type="text"
                placeholder={isEs ? 'Nombre del proyecto' : 'Project Name'}
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-6">
            <ToolFieldGroup label={isEs ? 'Entregable / Tarea' : 'Task Deliverable'} htmlFor={`${baseId}-task`}>
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={isEs ? 'Descripción de la tarea o hito' : 'Task deliverable description'}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Agregar' : 'Add Task'}</span>
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Lista de Hitos' : 'Milestones Checklist'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{tasks.length}</span>
          </div>

          {tasks.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin hitos registrados' : 'No milestone tasks yet'}
              description={
                isEs
                  ? 'Agrega una tarea arriba o restaura el checklist de ejemplo.'
                  : 'Add a task above or restore starter milestones.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setTasks(INITIAL_TASKS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample tasks'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    t.completed
                      ? 'bg-surface-secondary/35 border-border-subtle opacity-80'
                      : 'bg-surface-secondary/60 border-border-subtle'
                  }`}
                >
                  {editingId === t.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar proyecto' : 'Edit project'}
                        value={editProject}
                        onChange={(e) => setEditProject(e.target.value)}
                        className="ui-input w-40 py-1.5 text-xs"
                      />
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
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(t.id)}
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
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                          aria-label={t.task}
                          className="w-4 h-4 accent-[#159B69] dark:accent-[#10B981] rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              t.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {t.task}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-accent uppercase">
                            {t.project}
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
