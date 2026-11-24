import { useState, useMemo, useId } from 'react';
import {
  Smartphone,
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

type ScreenCategory = 'Productivity' | 'Social Media' | 'Entertainment' | 'Gaming';

interface ScreenLog {
  id: string;
  category: ScreenCategory;
  hours: number;
  date: string;
}

const INITIAL_LOGS: ScreenLog[] = [
  { id: '1', category: 'Productivity', hours: 5.5, date: '2026-11-10' },
  { id: '2', category: 'Social Media', hours: 1.8, date: '2026-11-10' },
  { id: '3', category: 'Entertainment', hours: 2.0, date: '2026-11-10' }
];

const CATEGORIES: ScreenCategory[] = ['Productivity', 'Social Media', 'Entertainment', 'Gaming'];

export default function ScreenTimeTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [logs, setLogs] = useState<ScreenLog[]>(INITIAL_LOGS);
  const [category, setCategory] = useState<ScreenCategory>('Productivity');
  const [hours, setHours] = useState('2.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState<ScreenCategory>('Productivity');
  const [editHours, setEditHours] = useState('2.0');

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    const numHours = Number(hours);
    if (isNaN(numHours) || numHours < 0) {
      setFormError(isEs ? 'Ingresa una cantidad válida de horas.' : 'Please enter valid non-negative hours.');
      return;
    }
    setFormError('');
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        category,
        hours: numHours,
        date
      }
    ]);
  };

  const startEdit = (log: ScreenLog) => {
    setEditingId(log.id);
    setEditCat(log.category);
    setEditHours(String(log.hours));
  };

  const commitEdit = (id: string) => {
    const hrs = Math.max(0, Number(editHours) || 0);
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, category: editCat, hours: hrs } : l))
    );
    setEditingId(null);
  };

  const totalHours = useMemo(() => logs.reduce((acc, l) => acc + l.hours, 0), [logs]);
  const productiveHours = useMemo(
    () => logs.filter((l) => l.category === 'Productivity').reduce((acc, l) => acc + l.hours, 0),
    [logs]
  );

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'screen_time.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Tiempo en Pantalla' : 'Digital Screen Time & Usage Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Separa uso productivo de entretenimiento y redes' : 'Audit productive device hours vs leisure and social usage'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Tiempo de Pantalla (JSON)' : 'Export Screen Time (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setLogs(INITIAL_LOGS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Tiempo de Pantalla Total' : 'Total Screen Time'}
          value={`${totalHours.toFixed(1)} hrs`}
          hint={isEs ? `${logs.length} sesiones` : `${logs.length} sessions`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Uso Productivo' : 'Productive Screen Time'}
          value={`${productiveHours.toFixed(1)} hrs`}
          hint={
            totalHours > 0
              ? `${Math.round((productiveHours / totalHours) * 100)}% ${isEs ? 'del total' : 'of total'}`
              : '0%'
          }
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addLog} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value as ScreenCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Horas' : 'Hours'} htmlFor={`${baseId}-hrs`}>
              <UiInput
                id={`${baseId}-hrs`}
                type="number"
                step="0.25"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
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
              <span>{isEs ? 'Registrar' : 'Log'}</span>
            </UiButton>
          </div>
        </form>

        {logs.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin registros de uso' : 'No screen time logs yet'}
            description={
              isEs
                ? 'Registra horas arriba o restaura las sesiones de ejemplo.'
                : 'Log screen hours above or restore sample sessions.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setLogs(INITIAL_LOGS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample logs'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === log.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <select
                      aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                      value={editCat}
                      onChange={(e) => setEditCat(e.target.value as ScreenCategory)}
                      className="ui-select w-40 py-1.5 text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.25"
                      aria-label={isEs ? 'Editar horas' : 'Edit hours'}
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(log.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-semibold text-sm text-text-primary block">{log.category}</span>
                      <div className="text-xs text-text-secondary font-mono tabular-nums">
                        {log.hours} {isEs ? 'horas' : 'hours'} • {log.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(log)}
                        aria-label={isEs ? `Editar ${log.category}` : `Edit ${log.category}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogs((prev) => prev.filter((l) => l.id !== log.id))}
                        aria-label={isEs ? `Eliminar ${log.category}` : `Remove ${log.category}`}
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
