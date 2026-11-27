import { useState, useMemo, useId } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  GitBranch
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolMetricTile,
  ToolFieldGroup
} from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerProgressBar,
  PlannerDisclaimer
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  ProjectTaskInput,
  solveProjectTimeline,
  validateProjectTimeline,
  parseIsoCalendarDate
} from '../../engine/contracts/planners/projectTimeline.ts';

interface StoredTimelineState {
  projectName: string;
  projectStartDate: string;
  tasks: ProjectTaskInput[];
}

const DEFAULT_TIMELINE_STATE: StoredTimelineState = {
  projectName: 'Product Release Roadmap',
  projectStartDate: '2026-11-01',
  tasks: [
    {
      id: 't1',
      name: 'Discovery & Requirements Sign-off',
      startDate: '2026-11-01',
      durationDays: 5,
      progress: 100,
      dependencies: []
    },
    {
      id: 't2',
      name: 'System Architecture & UI Design',
      startDate: '2026-11-06',
      durationDays: 8,
      progress: 75,
      dependencies: ['t1']
    },
    {
      id: 't3',
      name: 'Marketing & Launch Content Prep',
      startDate: '2026-11-06',
      durationDays: 10,
      progress: 40,
      dependencies: ['t1']
    },
    {
      id: 't4',
      name: 'Core Engineering & Integration',
      startDate: '2026-11-14',
      durationDays: 14,
      progress: 25,
      dependencies: ['t2']
    },
    {
      id: 't5',
      name: 'QA Verification & Production Rollout',
      startDate: '2026-11-28',
      durationDays: 5,
      progress: 0,
      dependencies: ['t3', 't4']
    }
  ]
};

const EMPTY_TIMELINE_STATE: StoredTimelineState = {
  projectName: 'New Project Timeline',
  projectStartDate: new Date().toISOString().slice(0, 10),
  tasks: []
};

function sanitizeTimelineState(raw: unknown): StoredTimelineState | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<StoredTimelineState>;
  if (typeof obj.projectName !== 'string' || typeof obj.projectStartDate !== 'string') return null;
  if (parseIsoCalendarDate(obj.projectStartDate) === null || !Array.isArray(obj.tasks)) return null;
  const tasks: ProjectTaskInput[] = [];
  for (const item of obj.tasks) {
    if (!item || typeof item !== 'object') return null;
    const t = item as Partial<ProjectTaskInput>;
    if (
      typeof t.id !== 'string' ||
      typeof t.name !== 'string' ||
      typeof t.startDate !== 'string' ||
      parseIsoCalendarDate(t.startDate) === null ||
      typeof t.durationDays !== 'number' ||
      !Number.isFinite(t.durationDays) ||
      typeof t.progress !== 'number' ||
      !Number.isFinite(t.progress)
    ) {
      return null;
    }
    tasks.push({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      durationDays: Math.max(1, Math.round(t.durationDays)),
      progress: Math.max(0, Math.min(100, Math.round(t.progress))),
      dependencies: Array.isArray(t.dependencies)
        ? t.dependencies.filter((d): d is string => typeof d === 'string')
        : []
    });
  }
  return {
    projectName: obj.projectName.trim() || 'Project Timeline',
    projectStartDate: obj.projectStartDate,
    tasks
  };
}

const STATUS_ES: Record<'Not Started' | 'In Progress' | 'Completed', string> = {
  'Not Started': 'Sin iniciar',
  'In Progress': 'En progreso',
  Completed: 'Completada'
};

export default function ProjectTimelinePlannerCalculator() {
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
  } = usePlannerStorage<StoredTimelineState>({
    storageKey: 'calctools_project_timeline_v1',
    version: 1,
    defaultValue: DEFAULT_TIMELINE_STATE,
    sanitize: sanitizeTimelineState
  });

  const [newTaskName, setNewTaskName] = useState('');
  const [newStartDate, setNewStartDate] = useState(state.projectStartDate);
  const [newDuration, setNewDuration] = useState(5);
  const [newDeps, setNewDeps] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editDuration, setEditDuration] = useState(5);
  const [editDeps, setEditDeps] = useState<string[]>([]);
  const [editError, setEditError] = useState('');

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const validationErrors = useMemo(
    () =>
      validateProjectTimeline({
        projectName: state.projectName,
        projectStartDate: state.projectStartDate,
        tasks: state.tasks,
        referenceDate: todayIso
      }),
    [state, todayIso]
  );

  const solved = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return solveProjectTimeline({
        projectName: state.projectName,
        projectStartDate: state.projectStartDate,
        tasks: state.tasks,
        referenceDate: todayIso
      });
    } catch {
      return null;
    }
  }, [state, validationErrors, todayIso]);

  const toggleDep = (list: string[], id: string) =>
    list.includes(id) ? list.filter((d) => d !== id) : [...list, id];

  const handleProjectStartChange = (value: string) => {
    if (parseIsoCalendarDate(value) === null) return;
    setState((prev) => ({ ...prev, projectStartDate: value }));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la tarea.' : 'Please enter a task name.');
      return;
    }
    if (parseIsoCalendarDate(newStartDate) === null) {
      setFormError(isEs ? 'Selecciona una fecha de inicio válida.' : 'Select a valid start date.');
      return;
    }
    const dur = Math.trunc(Number(newDuration));
    if (!Number.isFinite(dur) || dur < 1) {
      setFormError(isEs ? 'La duración debe ser al menos 1 día entero.' : 'Duration must be a whole number >= 1 day.');
      return;
    }

    const candidateTask: ProjectTaskInput = {
      id: `t-${Date.now()}`,
      name: trimmed,
      startDate: newStartDate,
      durationDays: dur,
      progress: 0,
      dependencies: newDeps
    };

    const nextTasks = [...state.tasks, candidateTask];
    const errs = validateProjectTimeline({
      projectName: state.projectName || 'Project',
      projectStartDate: state.projectStartDate,
      tasks: nextTasks,
      referenceDate: todayIso
    });
    if (errs.length > 0) {
      setFormError(errs[0].message);
      return;
    }

    setFormError('');
    setState((prev) => ({ ...prev, tasks: nextTasks }));
    setNewTaskName('');
    setNewDeps([]);
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          dependencies: (t.dependencies ?? []).filter((d) => d !== id)
        }))
    }));
    if (editingId === id) {
      setEditingId(null);
      setEditError('');
    }
  };

  const moveTask = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.tasks.length) return;
    setState((prev) => {
      const next = [...prev.tasks];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, tasks: next };
    });
  };

  const updateTaskProgress = (id: string, progress: number) => {
    const p = Math.max(0, Math.min(100, Math.round(progress)));
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, progress: p } : t))
    }));
  };

  const startEdit = (t: ProjectTaskInput) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditStart(t.startDate);
    setEditDuration(t.durationDays);
    setEditDeps(t.dependencies ?? []);
    setEditError('');
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    const dur = Math.trunc(Number(editDuration));
    if (!trimmed) {
      setEditError(isEs ? 'El nombre no puede estar vacío.' : 'Task name cannot be empty.');
      return;
    }
    if (parseIsoCalendarDate(editStart) === null) {
      setEditError(isEs ? 'Fecha de inicio inválida.' : 'Invalid start date.');
      return;
    }
    if (!Number.isFinite(dur) || dur < 1) {
      setEditError(isEs ? 'La duración debe ser >= 1 día.' : 'Duration must be >= 1 day.');
      return;
    }

    const nextTasks = state.tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            name: trimmed,
            startDate: editStart,
            durationDays: dur,
            dependencies: editDeps.filter((d) => d !== id)
          }
        : t
    );

    const errs = validateProjectTimeline({
      projectName: state.projectName || 'Project',
      projectStartDate: state.projectStartDate,
      tasks: nextTasks,
      referenceDate: todayIso
    });
    if (errs.length > 0) {
      setEditError(errs[0].message);
      return;
    }

    setState((prev) => ({ ...prev, tasks: nextTasks }));
    setEditingId(null);
    setEditError('');
  };

  const handleExportJson = () => {
    downloadJsonFile('project_timeline.json', {
      projectName: state.projectName,
      projectStartDate: state.projectStartDate,
      summary: solved
        ? {
            projectFinishDate: solved.projectFinishDate,
            totalDurationDays: solved.totalDurationDays,
            weightedProgress: solved.weightedProgress,
            criticalPathTaskIds: solved.criticalPathTaskIds
          }
        : null,
      tasks: solved?.tasks ?? state.tasks
    });
  };

  const handleExportCsv = () => {
    const rows = (solved?.tasks ?? []).map((t) => [
      t.id,
      t.name,
      t.effectiveStartDate,
      t.endDate,
      t.durationDays,
      `${t.progress}%`,
      t.status,
      t.dependencies.join(' | '),
      t.slackDays,
      t.isCritical ? 'Yes' : 'No',
      t.isOverdue ? 'Yes' : 'No'
    ]);
    downloadCsvFile(
      'project_timeline.csv',
      [
        'Task ID',
        'Task Name',
        'Start Date',
        'End Date',
        'Duration (Days)',
        'Progress',
        'Status',
        'Dependencies',
        'Slack (Days)',
        'Critical Path',
        'Overdue'
      ],
      rows
    );
  };

  const copySummary = solved
    ? `${solved.projectName} | Start: ${solved.projectEffectiveStartDate} | Finish: ${solved.projectFinishDate} | Duration: ${solved.totalDurationDays} days | Weighted Progress: ${solved.weightedProgress}% | Critical Tasks: ${solved.criticalPathTaskIds.length}`
    : state.projectName;

  const taskNameById = useMemo(() => {
    const m = new Map<string, string>();
    state.tasks.forEach((t) => m.set(t.id, t.name));
    return m;
  }, [state.tasks]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Calendar className="w-4 h-4" />}
        title={isEs ? 'Planificador de Cronograma y Ruta Crítica' : 'Project Timeline & Critical Path Planner'}
        subtitle={
          isEs
            ? 'Programa dependencias, fechas calculadas, holgura CPM y vista Gantt interactiva'
            : 'Schedule task dependencies, CPM critical path slack, overdue alerts & Gantt chart'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary}
        onExportCsv={state.tasks.length > 0 ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_TIMELINE_STATE)}
        canClear={state.tasks.length > 0}
      />

      {/* Project Metadata */}
      <section className="ui-panel p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-7">
          <ToolFieldGroup
            label={isEs ? 'Nombre del Proyecto' : 'Project Name'}
            htmlFor={`${baseId}-project-name`}
          >
            <UiInput
              id={`${baseId}-project-name`}
              type="text"
              value={state.projectName}
              onChange={(e) => setState((prev) => ({ ...prev, projectName: e.target.value }))}
              placeholder={isEs ? 'Ej. Lanzamiento Web Q4' : 'e.g. Q4 Product Launch'}
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-5">
          <ToolFieldGroup
            label={isEs ? 'Fecha de Inicio del Proyecto' : 'Project Start Date'}
            htmlFor={`${baseId}-project-start`}
          >
            <UiInput
              id={`${baseId}-project-start`}
              type="date"
              value={state.projectStartDate}
              onChange={(e) => handleProjectStartChange(e.target.value)}
              className="font-mono"
            />
          </ToolFieldGroup>
        </div>
      </section>

      {validationErrors.length > 0 && (
        <UiErrorState message={validationErrors[0].message} />
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Fecha Estimada de Fin' : 'Estimated Finish Date'}
          value={solved && solved.totalTasks > 0 ? solved.projectFinishDate : '—'}
          hint={
            solved && solved.totalTasks > 0
              ? `${solved.totalDurationDays} ${isEs ? 'días de duración' : 'days total span'}`
              : isEs
              ? 'sin hitos'
              : 'no milestones'
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Progreso Ponderado' : 'Weighted Progress'}
          value={`${solved?.weightedProgress ?? 0}%`}
          hint={`${solved?.completedTasks ?? 0}/${state.tasks.length} ${isEs ? 'completadas' : 'completed'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Ruta Crítica (CPM)' : 'Critical Path Tasks'}
          value={String(solved?.criticalPathTaskIds.length ?? 0)}
          hint={isEs ? 'tareas con 0 días de holgura' : 'tasks with 0d slack'}
        />
        <ToolMetricTile
          label={isEs ? 'Tareas Vencidas' : 'Overdue Tasks'}
          value={String(solved?.overdueTasks ?? 0)}
          hint={isEs ? `referencia: ${todayIso}` : `vs today (${todayIso})`}
        />
      </div>

      {/* Add Task Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4 no-print">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Añadir Nueva Tarea' : 'Add New Project Task'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addTask} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <ToolFieldGroup label={isEs ? 'Nombre de la Tarea' : 'Task Name'} htmlFor={`${baseId}-name`}>
                <UiInput
                  id={`${baseId}-name`}
                  type="text"
                  placeholder={isEs ? 'Ej. Integración de pagos' : 'e.g. Payment Gateway Integration'}
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-3">
              <ToolFieldGroup label={isEs ? 'Inicio Deseado' : 'Target Start Date'} htmlFor={`${baseId}-date`}>
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
                  step={1}
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
          </div>

          {state.tasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-accent" />
                {isEs ? 'Dependencias previas (opcional):' : 'Predecessor Dependencies (optional):'}
              </span>
              <div className="flex flex-wrap gap-2">
                {state.tasks.map((t) => {
                  const selected = newDeps.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewDeps((prev) => toggleDep(prev, t.id))}
                      aria-pressed={selected}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-accent-light border-accent text-accent font-semibold'
                          : 'bg-surface-secondary border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </section>

      {/* Visual Gantt Timeline Chart */}
      {solved && solved.tasks.length > 0 && (
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                {isEs ? 'Vista Gantt de Cronograma' : 'Interactive Gantt Timeline'}
              </h3>
              <p className="text-xs text-text-secondary">
                {solved.projectEffectiveStartDate} → {solved.projectFinishDate} ({solved.totalDurationDays}{' '}
                {isEs ? 'días' : 'days'})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-status-warning inline-block" />
                {isEs ? 'Ruta Crítica' : 'Critical Path'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
                {isEs ? 'Con Holgura' : 'Has Slack'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-status-success inline-block" />
                {isEs ? 'Completada' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px] space-y-2.5">
              {solved.tasks.map((task) => {
                const barBg =
                  task.status === 'Completed'
                    ? 'bg-status-success/85'
                    : task.isCritical
                    ? 'bg-amber-500 dark:bg-amber-500/90'
                    : 'bg-accent/85';
                return (
                  <div key={task.id} className="grid grid-cols-12 gap-3 items-center text-xs">
                    <div className="col-span-4 min-w-0">
                      <div className="font-semibold text-text-primary truncate">{task.name}</div>
                      <div className="text-[11px] font-mono text-text-tertiary">
                        {task.effectiveStartDate} → {task.endDate} ({task.durationDays}d)
                      </div>
                    </div>
                    <div className="col-span-8">
                      <div className="relative h-7 rounded-lg bg-surface-secondary border border-border-subtle overflow-hidden">
                        <div
                          className={`absolute top-1 bottom-1 rounded-md ${barBg} flex items-center px-2 text-[10px] font-mono font-bold text-white shadow-xs`}
                          style={{
                            left: `${Math.max(0, Math.min(98, task.ganttLeftPct))}%`,
                            width: `${Math.max(3, Math.min(100 - task.ganttLeftPct, task.ganttWidthPct))}%`
                          }}
                          title={`${task.name}: ${task.effectiveStartDate} → ${task.endDate} (${task.progress}%)`}
                        >
                          <span className="truncate">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <PlannerProgressBar
            label={isEs ? 'Progreso Ponderado por Duración' : 'Duration-Weighted Completion'}
            percent={solved.weightedProgress}
            tone={solved.weightedProgress === 100 ? 'success' : 'accent'}
          />
        </section>
      )}

      {/* Task Schedule Breakdown & Editing */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle">
          {isEs ? 'Tareas, Dependencias y Holgura CPM' : 'Task Schedule, Dependencies & CPM Slack'}
        </h3>

        {state.tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay tareas en el cronograma' : 'No tasks in the timeline'}
            description={
              isEs
                ? 'Añade un hito arriba o restaura las tareas de ejemplo.'
                : 'Add a project task above or restore the sample roadmap.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample timeline'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {state.tasks.map((task, idx) => {
              const computed = solved?.tasks.find((c) => c.id === task.id);
              const status: 'Not Started' | 'In Progress' | 'Completed' =
                task.progress >= 100 ? 'Completed' : task.progress > 0 ? 'In Progress' : 'Not Started';
              const statusTone =
                status === 'Completed' ? 'success' : status === 'In Progress' ? 'accent' : 'neutral';
              const displayStatus = isEs ? STATUS_ES[status] : status;
              const availablePredecessors = state.tasks.filter((other) => other.id !== task.id);

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
                >
                  {editingId === task.id ? (
                    <div className="space-y-3">
                      {editError && <UiErrorState message={editError} />}
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
                          step={1}
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
                          onClick={() => {
                            setEditingId(null);
                            setEditError('');
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </UiButton>
                      </div>
                      {availablePredecessors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-text-secondary">
                            {isEs ? 'Depende de:' : 'Depends on:'}
                          </span>
                          {availablePredecessors.map((cand) => {
                            const selected = editDeps.includes(cand.id);
                            return (
                              <button
                                key={cand.id}
                                type="button"
                                onClick={() => setEditDeps((prev) => toggleDep(prev, cand.id))}
                                aria-pressed={selected}
                                className={`px-2 py-0.5 rounded-md text-[11px] border cursor-pointer ${
                                  selected
                                    ? 'bg-accent-light border-accent text-accent font-semibold'
                                    : 'bg-surface border-border-subtle text-text-secondary'
                                }`}
                              >
                                {cand.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-text-primary">
                            {task.name}
                          </span>
                          {computed?.isCritical && (
                            <UiStatusLabel tone="warning">
                              {isEs ? 'Ruta Crítica' : 'Critical Path'}
                            </UiStatusLabel>
                          )}
                          {computed?.isOverdue && (
                            <UiStatusLabel tone="error">
                              <AlertTriangle className="w-3 h-3 mr-1 inline" />
                              {isEs ? 'Vencida' : 'Overdue'}
                            </UiStatusLabel>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>
                            {computed ? computed.effectiveStartDate : task.startDate} →{' '}
                            {computed ? computed.endDate : '—'}
                          </span>
                          <span>
                            {task.durationDays} {isEs ? 'días' : 'days'}
                          </span>
                          {computed && (
                            <span>
                              {isEs ? 'Holgura:' : 'Slack:'} {computed.slackDays}d
                            </span>
                          )}
                        </div>
                        {(task.dependencies?.length ?? 0) > 0 && (
                          <div className="text-[11px] text-text-tertiary">
                            {isEs ? 'Depende de:' : 'Predecessors:'}{' '}
                            {(task.dependencies ?? [])
                              .map((d) => taskNameById.get(d) ?? d)
                              .join(', ')}
                            {computed?.isDelayedByDependency && (
                              <span className="ml-1.5 text-status-warning font-medium">
                                ({isEs ? 'ajustado por dependencia' : 'shifted by dependency'})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="no-print flex items-center gap-1.5 shrink-0">
                        <UiStatusLabel tone={statusTone}>{displayStatus}</UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => moveTask(idx, -1)}
                          disabled={idx === 0}
                          aria-label={isEs ? `Subir ${task.name}` : `Move ${task.name} up`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary disabled:opacity-30 hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTask(idx, 1)}
                          disabled={idx === state.tasks.length - 1}
                          aria-label={isEs ? `Bajar ${task.name}` : `Move ${task.name} down`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary disabled:opacity-30 hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
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

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Nota de Programación' : 'Scheduling Note'}
        message={
          isEs
            ? 'Las fechas de inicio y fin se calculan en días calendario con el método de ruta crítica (CPM). Tus cambios se guardan automáticamente en este navegador.'
            : 'Task dates and slack are computed in calendar days using the Critical Path Method (CPM). Changes auto-save locally in your browser.'
        }
      />
    </div>
  );
}
