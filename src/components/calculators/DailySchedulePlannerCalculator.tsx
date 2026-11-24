import { useState, useEffect, useId } from 'react';
import {
  CalendarClock,
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

interface TimeBlock {
  id: string;
  time: string;
  activity: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

const STORAGE_KEY = 'calctools_daily_schedule';

const INITIAL_SCHEDULE: TimeBlock[] = [
  { id: '1', time: '08:00 AM', activity: 'Morning Exercise & Breakfast', priority: 'Medium', completed: true },
  { id: '2', time: '09:30 AM', activity: 'Deep Work: Project Architecture & Coding', priority: 'High', completed: true },
  { id: '3', time: '12:30 PM', activity: 'Lunch & Relax', priority: 'Low', completed: false },
  { id: '4', time: '02:00 PM', activity: 'Team Sync & Code Reviews', priority: 'High', completed: false },
  { id: '5', time: '05:00 PM', activity: 'Email & Client Follow-ups', priority: 'Medium', completed: false },
  { id: '6', time: '07:00 PM', activity: 'Dinner & Family Time', priority: 'Low', completed: false }
];

const PRIORITY_ES: Record<'High' | 'Medium' | 'Low', string> = {
  High: 'Alta',
  Medium: 'Media',
  Low: 'Baja'
};

export default function DailySchedulePlannerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [schedule, setSchedule] = useState<TimeBlock[]>(INITIAL_SCHEDULE);
  const [newTime, setNewTime] = useState('06:00 PM');
  const [newActivity, setNewActivity] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSchedule(parsed);
      } catch {
        // Ignore invalid localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const toggleComplete = (id: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const addBlock = () => {
    const trimmed = newActivity.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa la descripción de la actividad.' : 'Please enter an activity description.');
      return;
    }
    setFormError('');
    setSchedule([
      ...schedule,
      {
        id: Date.now().toString(),
        time: newTime.trim() || '12:00 PM',
        activity: trimmed,
        priority: newPriority,
        completed: false
      }
    ]);
    setNewActivity('');
  };

  const startEdit = (block: TimeBlock) => {
    setEditingId(block.id);
    setEditTime(block.time);
    setEditActivity(block.activity);
    setEditPriority(block.priority);
  };

  const commitEdit = (id: string) => {
    const trimmed = editActivity.trim();
    if (!trimmed) return;
    setSchedule(
      schedule.map((s) =>
        s.id === id
          ? { ...s, time: editTime.trim() || s.time, activity: trimmed, priority: editPriority }
          : s
      )
    );
    setEditingId(null);
  };

  const removeBlock = (id: string) => setSchedule(schedule.filter((s) => s.id !== id));

  const completedCount = schedule.filter((s) => s.completed).length;
  const progressPercent = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-schedule-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Horario Diario' : 'Daily Schedule & Time Block Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Estructura tu jornada por bloques de tiempo y prioridad'
                : 'Structure your day with focused time blocks and priority tags'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setSchedule(INITIAL_SCHEDULE)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Progreso Diario' : 'Daily Completion'}
          value={`${progressPercent}%`}
          hint={`${completedCount} ${isEs ? 'de' : 'of'} ${schedule.length} ${isEs ? 'bloques' : 'blocks'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Prioridad Alta' : 'High Priority'}
          value={String(schedule.filter((s) => s.priority === 'High').length)}
          hint={isEs ? 'bloques críticos' : 'focus blocks'}
        />
        <ToolMetricTile
          label={isEs ? 'Pendientes Hoy' : 'Remaining Blocks'}
          value={String(schedule.length - completedCount)}
          hint={isEs ? 'por completar' : 'remaining today'}
        />
      </div>

      <div className="ui-panel p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
          <span>{isEs ? 'Avance de la jornada' : 'Schedule Progress'}</span>
          <span className="font-mono text-accent">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-secondary overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Block Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Bloque de Tiempo' : 'Add Time Block'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Hora' : 'Time'} htmlFor={`${baseId}-time`}>
              <UiInput
                id={`${baseId}-time`}
                type="text"
                placeholder="10:00 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Actividad' : 'Activity'} htmlFor={`${baseId}-activity`}>
              <UiInput
                id={`${baseId}-activity`}
                type="text"
                placeholder={isEs ? 'Descripción de la actividad' : 'Activity description'}
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Prioridad' : 'Priority'} htmlFor={`${baseId}-priority`}>
              <UiSelect
                id={`${baseId}-priority`}
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              >
                <option value="High">{isEs ? 'Alta' : 'High'}</option>
                <option value="Medium">{isEs ? 'Media' : 'Medium'}</option>
                <option value="Low">{isEs ? 'Baja' : 'Low'}</option>
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton
              variant="primary"
              onClick={addBlock}
              className="w-full"
              aria-label={isEs ? 'Agregar bloque' : 'Add Block'}
            >
              <Plus className="w-4 h-4" />
              <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Cronograma del Día' : 'Daily Agenda'}
          </h3>
          {schedule.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setSchedule([])}>
              {isEs ? 'Vaciar agenda' : 'Clear agenda'}
            </UiButton>
          )}
        </div>

        {schedule.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay bloques programados' : 'No time blocks scheduled'}
            description={
              isEs
                ? 'Agrega un bloque arriba o restaura la agenda de ejemplo.'
                : 'Add a time block above or restore the starter daily schedule.'
            }
            action={
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setSchedule(INITIAL_SCHEDULE)}
              >
                {isEs ? 'Restaurar ejemplo' : 'Restore sample agenda'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {schedule.map((block) => {
              const priorityTone =
                block.priority === 'High'
                  ? 'error'
                  : block.priority === 'Medium'
                  ? 'warning'
                  : 'neutral';
              const displayPriority = isEs ? PRIORITY_ES[block.priority] : block.priority;

              return (
                <div
                  key={block.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    block.completed
                      ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                      : 'bg-surface border-border-main'
                  }`}
                >
                  {editingId === block.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar hora' : 'Edit time'}
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar actividad' : 'Edit activity'}
                        value={editActivity}
                        onChange={(e) => setEditActivity(e.target.value)}
                        className="ui-input flex-1 min-w-[150px] py-1.5 text-xs"
                      />
                      <select
                        aria-label={isEs ? 'Editar prioridad' : 'Edit priority'}
                        value={editPriority}
                        onChange={(e) =>
                          setEditPriority(e.target.value as 'High' | 'Medium' | 'Low')
                        }
                        className="ui-select w-28 py-1.5 text-xs"
                      >
                        <option value="High">{isEs ? 'Alta' : 'High'}</option>
                        <option value="Medium">{isEs ? 'Media' : 'Medium'}</option>
                        <option value="Low">{isEs ? 'Baja' : 'Low'}</option>
                      </select>
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(block.id)}
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
                          aria-label={isEs ? `Marcar ${block.activity}` : `Toggle ${block.activity}`}
                          checked={block.completed}
                          onChange={() => toggleComplete(block.id)}
                        />
                        <span className="font-mono text-xs font-bold text-accent w-20 shrink-0">
                          {block.time}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-semibold truncate ${
                              block.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {block.activity}
                          </span>
                          <UiStatusLabel tone={priorityTone}>{displayPriority}</UiStatusLabel>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(block)}
                          aria-label={isEs ? `Editar ${block.activity}` : `Edit ${block.activity}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          aria-label={isEs ? `Eliminar ${block.activity}` : `Remove ${block.activity}`}
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
