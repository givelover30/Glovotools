import { useState, useEffect, useId } from 'react';
import {
  Home,
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
  UiCheckbox,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface MaintenanceTask {
  id: string;
  frequency: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  task: string;
  lastDone: string;
  nextDue: string;
  done: boolean;
}

const STORAGE_KEY = 'calctools_home_maintenance';

const INITIAL_MAINTENANCE: MaintenanceTask[] = [
  { id: '1', frequency: 'Monthly', task: 'Replace HVAC / Furnace Air Filters', lastDone: '2026-10-01', nextDue: '2026-11-01', done: true },
  { id: '2', frequency: 'Monthly', task: 'Test smoke and carbon monoxide detectors', lastDone: '2026-10-15', nextDue: '2026-11-15', done: false },
  { id: '3', frequency: 'Quarterly', task: 'Test sump pump and check plumbing drains', lastDone: '2026-08-01', nextDue: '2026-11-01', done: false },
  { id: '4', frequency: 'Bi-Annual', task: 'Clean gutters and downspouts', lastDone: '2026-05-10', nextDue: '2026-11-10', done: false },
  { id: '5', frequency: 'Annual', task: 'Service HVAC heating and cooling systems', lastDone: '2025-11-20', nextDue: '2026-11-20', done: false }
];

const FREQ_OPTIONS: Array<'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual'> = [
  'Monthly',
  'Quarterly',
  'Bi-Annual',
  'Annual'
];

const FREQ_ES: Record<'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual', string> = {
  Monthly: 'Mensual',
  Quarterly: 'Trimestral',
  'Bi-Annual': 'Semestral',
  Annual: 'Anual'
};

export default function HomeMaintenancePlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE);
  const [newTask, setNewTask] = useState('');
  const [newFreq, setNewFreq] = useState<'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual'>('Monthly');
  const [newDue, setNewDue] = useState('2026-12-01');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFreq, setEditFreq] = useState<'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual'>('Monthly');
  const [editTask, setEditTask] = useState('');
  const [editDue, setEditDue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch {
        // Ignore malformed localStorage payload
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
      setFormError(
        isEs ? 'Ingresa una tarea de mantenimiento.' : 'Please enter a maintenance chore description.'
      );
      return;
    }
    setFormError('');
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        frequency: newFreq,
        task: trimmed,
        lastDone: new Date().toISOString().split('T')[0],
        nextDue: newDue || '2026-12-01',
        done: false
      }
    ]);
    setNewTask('');
  };

  const startEdit = (t: MaintenanceTask) => {
    setEditingId(t.id);
    setEditFreq(t.frequency);
    setEditTask(t.task);
    setEditDue(t.nextDue);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed) return;
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, frequency: editFreq, task: trimmed, nextDue: editDue || t.nextDue }
          : t
      )
    );
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
    a.download = `home-maintenance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Calendario de Mantenimiento del Hogar' : 'Home Maintenance & Repair Schedule'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Programa revisiones preventivas mensuales, trimestrales y anuales'
                : 'Schedule preventive home upkeep across monthly, quarterly, and annual intervals'}
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
          <UiButton variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" />
            <span>{isEs ? 'Imprimir' : 'Print'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(INITIAL_MAINTENANCE)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Estado de Mantenimiento' : 'Upkeep Completion'}
          value={`${progressPercent}%`}
          hint={`${completedCount} ${isEs ? 'de' : 'of'} ${tasks.length} ${isEs ? 'tareas' : 'chores'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Completadas' : 'Completed'}
          value={String(completedCount)}
          hint={isEs ? 'revisiones al día' : 'upkeep completed'}
        />
        <ToolMetricTile
          label={isEs ? 'Pendientes' : 'Remaining'}
          value={String(tasks.length - completedCount)}
          hint={isEs ? 'por atender' : 'due next'}
        />
      </div>

      {/* Add Task Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Tarea de Mantenimiento' : 'Add Maintenance Task'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Frecuencia' : 'Frequency'} htmlFor={`${baseId}-freq`}>
              <UiSelect
                id={`${baseId}-freq`}
                value={newFreq}
                onChange={(e) =>
                  setNewFreq(e.target.value as 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual')
                }
              >
                {FREQ_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {isEs ? FREQ_ES[f] : f}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Tarea' : 'Chore description'} htmlFor={`${baseId}-task`}>
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={isEs ? 'Ej. Limpiar ducto de secadora' : 'e.g. Clean dryer vent'}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Próxima fecha' : 'Next due'} htmlFor={`${baseId}-due`}>
              <UiInput
                id={`${baseId}-due`}
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="font-mono"
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

      {/* Maintenance List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Lista de Mantenimiento' : 'Chores Checklist'}
          </h3>
          {tasks.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setTasks([])}>
              {isEs ? 'Vaciar lista' : 'Clear list'}
            </UiButton>
          )}
        </div>

        {tasks.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin tareas de mantenimiento' : 'No maintenance tasks yet'}
            description={
              isEs
                ? 'Agrega una revisión preventiva arriba o restaura las tareas sugeridas.'
                : 'Add a maintenance chore above or restore the starter schedule.'
            }
            action={
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setTasks(INITIAL_MAINTENANCE)}
              >
                {isEs ? 'Restaurar ejemplo' : 'Restore sample tasks'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => {
              const displayFreq = isEs ? FREQ_ES[t.frequency] || t.frequency : t.frequency;
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
                        aria-label={isEs ? 'Editar frecuencia' : 'Edit frequency'}
                        value={editFreq}
                        onChange={(e) =>
                          setEditFreq(
                            e.target.value as 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual'
                          )
                        }
                        className="ui-select w-32 py-1.5 text-xs"
                      >
                        {FREQ_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {isEs ? FREQ_ES[f] : f}
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
                      <input
                        type="date"
                        aria-label={isEs ? 'Editar fecha' : 'Edit due date'}
                        value={editDue}
                        onChange={(e) => setEditDue(e.target.value)}
                        className="ui-input w-36 py-1.5 text-xs font-mono"
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
                            {displayFreq} • {isEs ? 'Vence:' : 'Due:'} {t.nextDue}
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
