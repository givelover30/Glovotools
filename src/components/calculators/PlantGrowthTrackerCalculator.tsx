import { useState, useId } from 'react';
import {
  Sprout,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface PlantLog {
  id: string;
  plantName: string;
  lastWatered: string;
  wateringIntervalDays: number;
  status: 'Healthy' | 'Needs Water' | 'Blooming';
}

const INITIAL_PLANTS: PlantLog[] = [
  { id: '1', plantName: 'Monstera Deliciosa', lastWatered: '2026-11-10', wateringIntervalDays: 7, status: 'Healthy' },
  { id: '2', plantName: 'Fiddle Leaf Fig', lastWatered: '2026-11-05', wateringIntervalDays: 10, status: 'Healthy' },
  { id: '3', plantName: 'Peace Lily', lastWatered: '2026-11-11', wateringIntervalDays: 5, status: 'Needs Water' }
];

const STATUSES: PlantLog['status'][] = ['Healthy', 'Needs Water', 'Blooming'];

export default function PlantGrowthTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [plants, setPlants] = useState<PlantLog[]>(INITIAL_PLANTS);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('7');
  const [lastWatered, setLastWatered] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editInterval, setEditInterval] = useState('7');
  const [editStatus, setEditStatus] = useState<PlantLog['status']>('Healthy');

  const addPlant = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la planta.' : 'Please enter a plant name.');
      return;
    }
    setFormError('');
    setPlants((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        plantName: trimmed,
        lastWatered,
        wateringIntervalDays: Math.max(1, Number(interval) || 7),
        status: 'Healthy'
      }
    ]);
    setName('');
  };

  const startEdit = (p: PlantLog) => {
    setEditingId(p.id);
    setEditName(p.plantName);
    setEditInterval(String(p.wateringIntervalDays));
    setEditStatus(p.status);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setPlants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              plantName: trimmed,
              wateringIntervalDays: Math.max(1, Number(editInterval) || 7),
              status: editStatus
            }
          : p
      )
    );
    setEditingId(null);
  };

  const needsWaterCount = plants.filter((p) => p.status === 'Needs Water').length;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(plants, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plant_growth.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Crecimiento y Riego de Plantas' : 'Plant Growth & Watering Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Monitorea frecuencia de riego y salud botánica' : 'Monitor watering intervals and plant health status'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Plantas (JSON)' : 'Export Plants (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setPlants(INITIAL_PLANTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Plantas Monitoreadas' : 'Monitored Plants'}
          value={String(plants.length)}
          hint={isEs ? 'colección activa' : 'tracked specimens'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Requieren Riego' : 'Needs Water'}
          value={String(needsWaterCount)}
          hint={isEs ? 'atención prioritaria' : 'hydration alert'}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addPlant} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Nombre de la Planta' : 'Plant Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Lengua de suegra' : 'e.g. Snake Plant'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Intervalo Riego (días)' : 'Watering Interval (days)'} htmlFor={`${baseId}-int`}>
              <UiInput
                id={`${baseId}-int`}
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Último Riego' : 'Last Watered'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={lastWatered}
                onChange={(e) => setLastWatered(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton type="submit" variant="primary" className="w-full" aria-label={isEs ? 'Añadir planta' : 'Add plant'}>
              <Plus className="w-4 h-4" />
            </UiButton>
          </div>
        </form>

        {plants.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin plantas registradas' : 'No plants tracked yet'}
            description={
              isEs
                ? 'Agrega una planta arriba o restaura el jardín de ejemplo.'
                : 'Add a plant above or restore sample plants.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setPlants(INITIAL_PLANTS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample plants'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {plants.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === p.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar planta' : 'Edit plant'}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      min={1}
                      aria-label={isEs ? 'Editar intervalo' : 'Edit interval'}
                      value={editInterval}
                      onChange={(e) => setEditInterval(e.target.value)}
                      className="ui-input w-20 py-1.5 text-xs font-mono"
                    />
                    <select
                      aria-label={isEs ? 'Editar estado' : 'Edit status'}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as PlantLog['status'])}
                      className="ui-select w-36 py-1.5 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(p.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">{p.plantName}</span>
                      <div className="text-xs text-text-secondary font-mono">
                        {isEs
                          ? `Regar cada ${p.wateringIntervalDays} días • Último: ${p.lastWatered}`
                          : `Water every ${p.wateringIntervalDays} days • Last: ${p.lastWatered}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <UiStatusLabel tone={p.status === 'Needs Water' ? 'warning' : 'success'}>
                        {p.status}
                      </UiStatusLabel>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        aria-label={isEs ? `Editar ${p.plantName}` : `Edit ${p.plantName}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlants((prev) => prev.filter((x) => x.id !== p.id))}
                        aria-label={isEs ? `Eliminar ${p.plantName}` : `Remove ${p.plantName}`}
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
