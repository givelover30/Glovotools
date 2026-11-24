import { useState, useId } from 'react';
import {
  Car,
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
import {
  UiButton,
  UiInput,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface MaintenanceRecord {
  id: string;
  service: string;
  mileage: number;
  cost: number;
  date: string;
}

const INITIAL_RECORDS: MaintenanceRecord[] = [
  { id: '1', service: 'Synthetic Oil Change & Filter', mileage: 45000, cost: 75.0, date: '2026-08-10' },
  { id: '2', service: 'Tire Rotation & Balance', mileage: 48000, cost: 45.0, date: '2026-09-15' },
  { id: '3', service: 'Brake Pads Replacement (Front)', mileage: 52000, cost: 220.0, date: '2026-10-20' }
];

export default function VehicleMaintenanceTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const [records, setRecords] = useState<MaintenanceRecord[]>(INITIAL_RECORDS);
  const [service, setService] = useState('');
  const [mileage, setMileage] = useState('55000');
  const [cost, setCost] = useState('85.00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editService, setEditService] = useState('');
  const [editMileage, setEditMileage] = useState('0');
  const [editCost, setEditCost] = useState('0');

  const addRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = service.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa la descripción del servicio.' : 'Please enter a service description.');
      return;
    }
    setFormError('');
    setRecords((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        service: trimmed,
        mileage: Math.max(0, Number(mileage) || 0),
        cost: Math.max(0, Number(cost) || 0),
        date
      }
    ]);
    setService('');
  };

  const startEdit = (rec: MaintenanceRecord) => {
    setEditingId(rec.id);
    setEditService(rec.service);
    setEditMileage(String(rec.mileage));
    setEditCost(String(rec.cost));
  };

  const commitEdit = (id: string) => {
    const trimmed = editService.trim();
    if (!trimmed) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              service: trimmed,
              mileage: Math.max(0, Number(editMileage) || 0),
              cost: Math.max(0, Number(editCost) || 0)
            }
          : r
      )
    );
    setEditingId(null);
  };

  const totalSpent = records.reduce((acc, r) => acc + r.cost, 0);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vehicle_maintenance.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Historial de Mantenimiento Vehicular' : 'Vehicle Maintenance & Service Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Registra cambios de aceite, frenos, kilometraje y costos' : 'Track oil changes, service intervals, mileage, and upkeep spend'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Mantenimiento (JSON)' : 'Export Maintenance (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setRecords(INITIAL_RECORDS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Servicios Registrados' : 'Service Records'}
          value={String(records.length)}
          hint={isEs ? 'mantenimientos anotados' : 'logged services'}
        />
        <ToolMetricTile
          label={isEs ? 'Gasto Total en Mantenimiento' : 'Total Maintenance Spent'}
          value={formatCurrency(totalSpent)}
          hint={isEs ? 'acumulado vehicular' : 'cumulative upkeep'}
          accent
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addRecord} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Descripción del Servicio' : 'Service Description'} htmlFor={`${baseId}-srv`}>
              <UiInput
                id={`${baseId}-srv`}
                type="text"
                placeholder={isEs ? 'Ej. Cambio de bujías' : 'e.g. Spark Plug Replacement'}
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Kilometraje / Mi' : 'Mileage'} htmlFor={`${baseId}-mi`}>
              <UiInput
                id={`${baseId}-mi`}
                type="number"
                min={0}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Costo (${currencyMeta.symbol})` : `Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                step="0.01"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
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

        {records.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin servicios registrados' : 'No service records yet'}
            description={
              isEs
                ? 'Agrega un mantenimiento arriba o restaura los registros de ejemplo.'
                : 'Add a maintenance log above or restore sample records.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setRecords(INITIAL_RECORDS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample records'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === rec.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar servicio' : 'Edit service'}
                      value={editService}
                      onChange={(e) => setEditService(e.target.value)}
                      className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      aria-label={isEs ? 'Editar kilometraje' : 'Edit mileage'}
                      value={editMileage}
                      onChange={(e) => setEditMileage(e.target.value)}
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
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(rec.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">{rec.service}</span>
                      <div className="text-xs text-text-secondary font-mono tabular-nums">
                        {rec.mileage.toLocaleString()} mi • {rec.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-text-primary">
                        {formatCurrency(rec.cost)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(rec)}
                        aria-label={isEs ? `Editar ${rec.service}` : `Edit ${rec.service}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecords((prev) => prev.filter((r) => r.id !== rec.id))}
                        aria-label={isEs ? `Eliminar ${rec.service}` : `Remove ${rec.service}`}
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
