import { useState, useMemo, useId } from 'react';
import {
  Fuel,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface FuelLog {
  id: string;
  gallons: number;
  totalCost: number;
  odometer: number;
  date: string;
}

const INITIAL_LOGS: FuelLog[] = [
  { id: '1', gallons: 12.5, totalCost: 48.75, odometer: 45200, date: '2026-10-10' },
  { id: '2', gallons: 13.2, totalCost: 51.48, odometer: 45550, date: '2026-10-24' },
  { id: '3', gallons: 11.8, totalCost: 45.42, odometer: 45880, date: '2026-11-06' }
];

export default function FuelMileageTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const [logs, setLogs] = useState<FuelLog[]>(INITIAL_LOGS);
  const [gallons, setGallons] = useState('12.0');
  const [totalCost, setTotalCost] = useState('45.00');
  const [odometerVal, setOdometerVal] = useState('46200');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGallons, setEditGallons] = useState('12');
  const [editCost, setEditCost] = useState('45');
  const [editOdo, setEditOdo] = useState('46000');

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    const g = Number(gallons);
    const c = Number(totalCost);
    const odo = Number(odometerVal);
    if (isNaN(g) || g <= 0 || isNaN(odo) || odo < 0) {
      setFormError(isEs ? 'Ingresa galones válidos y odómetro.' : 'Please enter valid gallons and odometer.');
      return;
    }
    setFormError('');
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        gallons: g,
        totalCost: isNaN(c) ? 0 : Math.max(0, c),
        odometer: odo,
        date
      }
    ]);
  };

  const startEdit = (log: FuelLog) => {
    setEditingId(log.id);
    setEditGallons(String(log.gallons));
    setEditCost(String(log.totalCost));
    setEditOdo(String(log.odometer));
  };

  const commitEdit = (id: string) => {
    const g = Math.max(0.1, Number(editGallons) || 1);
    const c = Math.max(0, Number(editCost) || 0);
    const odo = Math.max(0, Number(editOdo) || 0);
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, gallons: g, totalCost: c, odometer: odo } : l))
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    if (logs.length === 0) return { totalGallons: 0, totalSpent: 0, avgMpg: 0 };
    const totalGallons = logs.reduce((acc, l) => acc + l.gallons, 0);
    const totalSpent = logs.reduce((acc, l) => acc + l.totalCost, 0);
    if (logs.length < 2) {
      return { totalGallons, totalSpent, avgMpg: 0 };
    }
    const minOdo = Math.min(...logs.map((l) => l.odometer));
    const maxOdo = Math.max(...logs.map((l) => l.odometer));
    const totalMiles = Math.max(0, maxOdo - minOdo);
    const avgMpg = totalGallons > 0 ? totalMiles / totalGallons : 0;
    return {
      totalGallons,
      totalSpent,
      avgMpg: Number(avgMpg.toFixed(1))
    };
  }, [logs]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fuel_logs.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Fuel className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Combustible y Millaje' : 'Fuel & Mileage Efficiency Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Calcula rendimiento MPG promedio y gasto de gasolina' : 'Track fill-ups, odometer deltas, and average MPG'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Combustible (JSON)' : 'Export Fuel Logs (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setLogs(INITIAL_LOGS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Rendimiento Promedio (MPG)' : 'Average Fuel Efficiency'}
          value={`${summary.avgMpg} MPG`}
          hint={logs.length < 2 ? (isEs ? 'requiere ≥ 2 cargas' : 'needs ≥ 2 fill-ups') : (isEs ? 'rango odómetro' : 'odometer span')}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Gasto Total en Combustible' : 'Total Fuel Spent'}
          value={formatCurrency(summary.totalSpent)}
          hint={isEs ? `${logs.length} cargas` : `${logs.length} fill-ups`}
        />
        <ToolMetricTile
          label={isEs ? 'Galones Totales' : 'Total Gallons Pumped'}
          value={`${summary.totalGallons.toFixed(1)} gal`}
          hint={isEs ? 'volumen acumulado' : 'total volume'}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addLog} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Galones' : 'Gallons'} htmlFor={`${baseId}-gal`}>
              <UiInput
                id={`${baseId}-gal`}
                type="number"
                step="0.1"
                min={0.1}
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? `Costo Total (${currencyMeta.symbol})` : `Total Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                step="0.01"
                min={0}
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Odómetro (Millas)' : 'Odometer (Miles)'} htmlFor={`${baseId}-odo`}>
              <UiInput
                id={`${baseId}-odo`}
                type="number"
                min={0}
                value={odometerVal}
                onChange={(e) => setOdometerVal(e.target.value)}
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
              <span>{isEs ? 'Registrar' : 'Log'}</span>
            </UiButton>
          </div>
        </form>

        {logs.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin registros de combustible' : 'No fuel logs recorded'}
            description={
              isEs
                ? 'Registra una carga arriba o restaura el historial de ejemplo.'
                : 'Log a fill-up above or restore starter fuel logs.'
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
                    <input
                      type="number"
                      step="0.1"
                      aria-label={isEs ? 'Editar galones' : 'Edit gallons'}
                      value={editGallons}
                      onChange={(e) => setEditGallons(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      step="0.01"
                      aria-label={isEs ? 'Editar costo' : 'Edit cost'}
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      aria-label={isEs ? 'Editar odómetro' : 'Edit odometer'}
                      value={editOdo}
                      onChange={(e) => setEditOdo(e.target.value)}
                      className="ui-input w-28 py-1.5 text-xs font-mono"
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
                      <span className="font-semibold text-sm font-mono tabular-nums text-text-primary">
                        {log.gallons} gal • {formatCurrency(log.totalCost)}
                      </span>
                      <div className="text-xs text-text-secondary font-mono tabular-nums">
                        {isEs ? 'Odómetro:' : 'Odometer:'} {log.odometer.toLocaleString()} mi • {log.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(log)}
                        aria-label={isEs ? `Editar carga ${log.date}` : `Edit log ${log.date}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogs((prev) => prev.filter((l) => l.id !== log.id))}
                        aria-label={isEs ? `Eliminar carga ${log.date}` : `Remove log ${log.date}`}
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
