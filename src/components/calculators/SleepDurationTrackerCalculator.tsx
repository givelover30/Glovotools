import { useState, useEffect, useId } from 'react';
import {
  Moon,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface SleepLog {
  id: string;
  date: string;
  hours: number;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

const INITIAL_SLEEP: SleepLog[] = [
  { id: '1', date: '2026-11-10', hours: 7.5, quality: 'Good' },
  { id: '2', date: '2026-11-11', hours: 8.0, quality: 'Excellent' },
  { id: '3', date: '2026-11-12', hours: 6.5, quality: 'Fair' }
];

const QUALITIES: SleepLog['quality'][] = ['Excellent', 'Good', 'Fair', 'Poor'];
const STORAGE_KEY = 'calctools_sleep_tracker';

export default function SleepDurationTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(INITIAL_SLEEP);
  const [hours, setHours] = useState('7.5');
  const [quality, setQuality] = useState<SleepLog['quality']>('Good');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState('7.5');
  const [editQuality, setEditQuality] = useState<SleepLog['quality']>('Good');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSleepLogs(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sleepLogs));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = Number(hours);
    if (isNaN(hrs) || hrs < 0 || hrs > 24) {
      setFormError(isEs ? 'Ingresa horas válidas entre 0 y 24.' : 'Please enter valid hours between 0 and 24.');
      return;
    }
    setFormError('');
    setSleepLogs((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        hours: hrs,
        quality
      },
      ...prev
    ]);
    setHours('7.5');
  };

  const removeLog = (id: string) => setSleepLogs((prev) => prev.filter((s) => s.id !== id));

  const startEdit = (log: SleepLog) => {
    setEditingId(log.id);
    setEditHours(String(log.hours));
    setEditQuality(log.quality);
  };

  const commitEdit = (id: string) => {
    const hrs = Math.min(24, Math.max(0, Number(editHours) || 0));
    setSleepLogs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hours: hrs, quality: editQuality } : s))
    );
    setEditingId(null);
  };

  const avgHours =
    sleepLogs.length > 0
      ? (sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length).toFixed(1)
      : '0.0';

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(sleepLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Moon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Sueño y Descanso' : 'Sleep Duration & Quality Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Controla duración nocturna y calidad de descanso' : 'Log nightly sleep hours and track recovery quality'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setSleepLogs(INITIAL_SLEEP)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Promedio de Horas de Sueño' : 'Average Sleep Duration'}
          value={`${avgHours} hrs`}
          hint={isEs ? 'promedio por noche' : 'per night average'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Noches Registradas' : 'Nights Logged'}
          value={String(sleepLogs.length)}
          hint={
            sleepLogs.length > 0
              ? `${isEs ? 'Última:' : 'Latest:'} ${sleepLogs[0].quality}`
              : isEs
                ? 'sin registros'
                : 'no logs'
          }
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addLog} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pb-5 border-b border-border-subtle">
          <div>
            <ToolFieldGroup label={isEs ? 'Horas Dormidas' : 'Hours Slept'} htmlFor={`${baseId}-hrs`} unit="hrs">
              <UiInput
                id={`${baseId}-hrs`}
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div>
            <ToolFieldGroup label={isEs ? 'Calidad del Sueño' : 'Quality Rating'} htmlFor={`${baseId}-qual`}>
              <UiSelect
                id={`${baseId}-qual`}
                value={quality}
                onChange={(e) => setQuality(e.target.value as SleepLog['quality'])}
              >
                {QUALITIES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div>
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Registrar' : 'Log Sleep'}</span>
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Historial de Sueño' : 'Sleep History Log'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{sleepLogs.length}</span>
          </div>

          {sleepLogs.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin registros de sueño' : 'No sleep logs yet'}
              description={
                isEs
                  ? 'Registra una noche de descanso arriba o restaura los ejemplos.'
                  : 'Log a night of sleep above or restore sample entries.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setSleepLogs(INITIAL_SLEEP)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample logs'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {sleepLogs.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === s.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={24}
                        aria-label={isEs ? 'Editar horas' : 'Edit hours'}
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <select
                        aria-label={isEs ? 'Editar calidad' : 'Edit quality'}
                        value={editQuality}
                        onChange={(e) => setEditQuality(e.target.value as SleepLog['quality'])}
                        className="ui-select w-36 py-1.5 text-xs"
                      >
                        {QUALITIES.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(s.id)}
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
                        <span className="font-mono tabular-nums text-xs text-text-secondary shrink-0">
                          {s.date}
                        </span>
                        <span className="text-xs font-bold font-mono tabular-nums text-text-primary">
                          {s.hours} {isEs ? 'horas' : 'hours'}
                        </span>
                        <UiStatusLabel
                          tone={s.quality === 'Excellent' || s.quality === 'Good' ? 'success' : s.quality === 'Fair' ? 'warning' : 'error'}
                        >
                          {s.quality}
                        </UiStatusLabel>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          aria-label={isEs ? `Editar registro ${s.date}` : `Edit entry ${s.date}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLog(s.id)}
                          aria-label={isEs ? `Eliminar registro ${s.date}` : `Remove entry ${s.date}`}
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
