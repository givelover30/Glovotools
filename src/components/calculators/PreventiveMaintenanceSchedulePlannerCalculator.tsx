import { useState, useId } from 'react';
import { Wrench, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  MaintenanceAssetItem,
  DEFAULT_MAINTENANCE_ASSETS,
  calculateMaintenance
} from '../../engine/contracts/planners/preventiveMaintenance.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_preventive_maintenance_schedule_planner_v1';

export default function PreventiveMaintenanceSchedulePlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const { formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';

  const [programTitle, setProgramTitle] = useState('Facility Preventive Maintenance 2025');
  const {
    state: assets,
    setState: setAssets,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<MaintenanceAssetItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_MAINTENANCE_ASSETS
  });

  const [newTag, setNewTag] = useState('AST-PUMP-04');
  const [newAssetName, setNewAssetName] = useState('');
  const [newLocation, setNewLocation] = useState('Basement');
  const [newInterval, setNewInterval] = useState(90);
  const [newCost, setNewCost] = useState(500);
  const [formError, setFormError] = useState('');

  const result = calculateMaintenance({ programTitle, assets });

  const addAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAssetName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del activo.' : 'Please enter asset name.');
      return;
    }
    setFormError('');
    setAssets([
      ...assets,
      {
        id: Date.now().toString(),
        assetTag: newTag,
        assetName: trimmed,
        location: newLocation,
        intervalDays: Number(newInterval) || 90,
        lastServiceDate: '2025-06-01',
        estimatedServiceCost: Number(newCost) || 500,
        status: 'Scheduled'
      }
    ]);
    setNewAssetName('');
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter((a: MaintenanceAssetItem) => a.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ programTitle, assets, result }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Asset Tag', 'Asset Name', 'Location', 'Interval (Days)', 'Last Service', 'Service Cost', 'Status'];
    const rows = assets.map((a) => [a.id, a.assetTag, a.assetName, a.location, a.intervalDays, a.lastServiceDate, a.estimatedServiceCost, a.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Cronograma de Mantenimiento Preventivo' : 'Preventive Maintenance Schedule Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Programa mantenimientos de equipos, intervalos y presupuestos' : 'Schedule equipment maintenance, service intervals & budgets'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">{isEs ? 'Guardado localmente' : 'Saved locally'}</UiStatusLabel>
          )}
          <UiButton variant="primary" size="sm" onClick={saveState}>
            <Save className="w-3.5 h-3.5" />
            <span>{isEs ? 'Guardar' : 'Save'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownloadJson}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownloadCsv}>
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setAssets(DEFAULT_MAINTENANCE_ASSETS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Presupuesto de Servicio' : 'Total Service Budget'}
          value={fmtMoney(result.totalEstimatedServiceBudget)}
          hint={`${result.totalAssetsCount} ${isEs ? 'activos registrados' : 'registered assets'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Activos Vencidos' : 'Overdue Assets'}
          value={result.overdueAssetsCount.toString()}
          hint={isEs ? 'Requieren atención' : 'Require service'}
        />
        <ToolMetricTile
          label={isEs ? 'Mantenimientos Completados' : 'Completed Maintenance'}
          value={result.completedAssetsCount.toString()}
          hint={isEs ? 'Servicios al día' : 'Up to date'}
        />
        <ToolMetricTile
          label={isEs ? 'Total de Activos' : 'Total Assets'}
          value={result.totalAssetsCount.toString()}
          hint={isEs ? 'Inventario' : 'Inventory'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Programa' : 'Program Settings'}
        </h3>
        <ToolFieldGroup label={isEs ? 'Título del Programa de Mantenimiento' : 'Maintenance Program Title'}>
          <UiInput type="text" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} />
        </ToolFieldGroup>
      </div>

      {/* Add Asset Form */}
      <form onSubmit={addAsset} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Registrar Activo o Equipo' : 'Register Asset / Equipment'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label="Tag / ID">
            <UiInput type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="AST-01" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Nombre del Activo' : 'Asset Name'}>
            <UiInput type="text" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} placeholder="Chiller Unit" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Ubicación' : 'Location'}>
            <UiInput type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Roof" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Intervalo (Días)' : 'Interval (Days)'}>
            <UiInput
              type="number"
              min={1}
              value={newInterval}
              onChange={(e) => setNewInterval(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Costo Estimado ($)' : 'Est. Service Cost ($)'}>
            <UiInput
              type="number"
              min={0}
              value={newCost}
              onChange={(e) => setNewCost(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Registrar Activo' : 'Register Asset'}</span>
          </UiButton>
        </div>
      </form>

      {/* Assets Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Inventario de Activos y Calendario Preventivo' : 'Asset Inventory & Preventive Schedule'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">Tag</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Activo' : 'Asset Name'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Ubicación' : 'Location'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Intervalo' : 'Interval'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Costo Servicio' : 'Service Cost'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {assets.map((a: MaintenanceAssetItem) => (
              <tr key={a.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-bold text-text-primary">{a.assetTag}</td>
                <td className="py-3 px-3 font-sans font-medium text-text-secondary">{a.assetName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{a.location}</td>
                <td className="py-3 px-3 text-right">{a.intervalDays} days</td>
                <td className="py-3 px-3 text-right">{fmtMoney(a.estimatedServiceCost)}</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : a.status === 'Overdue'
                        ? 'bg-rose-500/10 text-rose-600 animate-pulse'
                        : 'bg-blue-500/10 text-blue-600'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeAsset(a.id)}
                    className="text-text-secondary hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
