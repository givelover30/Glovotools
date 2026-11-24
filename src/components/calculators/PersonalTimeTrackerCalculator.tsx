import { useState, useMemo, useId } from 'react';
import {
  Clock,
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
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

type ActivityCategory = 'Work' | 'Exercise' | 'Learning' | 'Leisure';

interface ActivityLog {
  id: string;
  activity: string;
  category: ActivityCategory;
  durationHours: number;
  date: string;
}

const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: '1', activity: 'Software Development & Coding', category: 'Work', durationHours: 7.5, date: '2026-11-11' },
  { id: '2', activity: 'Gym Strength Training', category: 'Exercise', durationHours: 1.5, date: '2026-11-11' },
  { id: '3', activity: 'Reading Architecture Books', category: 'Learning', durationHours: 1.0, date: '2026-11-11' }
];

const CATEGORIES: ActivityCategory[] = ['Work', 'Exercise', 'Learning', 'Leisure'];

export default function PersonalTimeTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Work');
  const [duration, setDuration] = useState('2.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState('');
  const [editDuration, setEditDuration] = useState('1.0');

  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = activityName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la actividad.' : 'Please enter an activity name.');
      return;
    }
    setFormError('');
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        activity: trimmed,
        category,
        durationHours: Math.max(0, Number(duration) || 0),
        date
      }
    ]);
    setActivityName('');
  };

  const startEdit = (act: ActivityLog) => {
    setEditingId(act.id);
    setEditActivity(act.activity);
    setEditDuration(String(act.durationHours));
  };

  const commitEdit = (id: string) => {
    const trimmed = editActivity.trim();
    if (!trimmed) return;
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, activity: trimmed, durationHours: Math.max(0, Number(editDuration) || 0) } : a
      )
    );
    setEditingId(null);
  };

  const totalHours = useMemo(() => activities.reduce((acc, a) => acc + a.durationHours, 0), [activities]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(activities, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personal_time.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Tiempo Personal' : 'Personal Time & Activity Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra bloques de trabajo, estudio, ejercicio y ocio' : 'Log time blocks across work, fitness, learning, and leisure'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Actividades (JSON)' : 'Export Activities (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setActivities(INITIAL_ACTIVITIES)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Horas Totales Registradas' : 'Total Logged Hours'}
          value={`${totalHours.toFixed(1)} hrs`}
          hint={isEs ? `${activities.length} bloques` : `${activities.length} entries`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Actividades Distintas' : 'Logged Activities'}
          value={String(activities.length)}
          hint={isEs ? 'en esta sesión' : 'in active log'}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addActivity} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre de la Actividad' : 'Activity Name'} htmlFor={`${baseId}-act`}>
              <UiInput
                id={`${baseId}-act`}
                type="text"
                placeholder={isEs ? 'Ej. Práctica de diseño de sistemas' : 'e.g. System Design practice'}
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
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
            <ToolFieldGroup label={isEs ? 'Duración (hrs)' : 'Duration (hrs)'} htmlFor={`${baseId}-dur`}>
              <UiInput
                id={`${baseId}-dur`}
                type="number"
                step="0.5"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Fecha' : 'Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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

        {activities.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin actividades registradas' : 'No activities logged yet'}
            description={
              isEs
                ? 'Agrega una actividad arriba o restaura las actividades de ejemplo.'
                : 'Add an activity above or restore sample activities.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setActivities(INITIAL_ACTIVITIES)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample activities'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === act.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar actividad' : 'Edit activity'}
                      value={editActivity}
                      onChange={(e) => setEditActivity(e.target.value)}
                      className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      step="0.5"
                      aria-label={isEs ? 'Editar duración' : 'Edit duration'}
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(act.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">{act.activity}</span>
                      <div className="text-xs text-text-secondary font-mono tabular-nums">
                        {act.category} • {act.durationHours} hrs • {act.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(act)}
                        aria-label={isEs ? `Editar ${act.activity}` : `Edit ${act.activity}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivities((prev) => prev.filter((a) => a.id !== act.id))}
                        aria-label={isEs ? `Eliminar ${act.activity}` : `Remove ${act.activity}`}
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
    </div>
  );
}
