import { useState, useId } from 'react';
import { Factory, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  ProductionOrder,
  DEFAULT_PRODUCTION_ORDERS,
  calculateManufacturing
} from '../../engine/contracts/planners/manufacturingProduction.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_manufacturing_production_planner_v1';

export default function ManufacturingProductionPlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const isEs = language === 'es';

  const [facilityName, setFacilityName] = useState('Apex Precision Machining');
  const [availableDailyHours, setAvailableDailyHours] = useState(40);
  const {
    state: orders,
    setState: setOrders,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<ProductionOrder[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_PRODUCTION_ORDERS
  });

  const [newProduct, setNewProduct] = useState('');
  const [newTarget, setNewTarget] = useState(300);
  const [newCompleted, setNewCompleted] = useState(0);
  const [newCycleTime, setNewCycleTime] = useState(12);
  const [newWorkCenter, setNewWorkCenter] = useState('CNC Cell 1');
  const [formError, setFormError] = useState('');

  const result = calculateManufacturing({ facilityName, availableDailyHours, orders });

  const addOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProduct.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del producto.' : 'Please enter product name.');
      return;
    }
    setFormError('');
    setOrders([
      ...orders,
      {
        id: Date.now().toString(),
        productName: trimmed,
        targetQuantity: Number(newTarget) || 300,
        completedQuantity: Number(newCompleted) || 0,
        cycleTimeMinutesPerUnit: Number(newCycleTime) || 12,
        workCenter: newWorkCenter,
        status: 'Queued'
      }
    ]);
    setNewProduct('');
  };

  const removeOrder = (id: string) => {
    setOrders(orders.filter((o: ProductionOrder) => o.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ facilityName, availableDailyHours, orders, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manufacturing-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Product', 'Target Qty', 'Completed Qty', 'Cycle Time (min)', 'Work Center', 'Status'];
    const rows = orders.map((o: ProductionOrder) => [o.id, o.productName, o.targetQuantity, o.completedQuantity, o.cycleTimeMinutesPerUnit, o.workCenter, o.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manufacturing-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Factory className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Producción y Capacidad' : 'Manufacturing Production & Capacity Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Planifica órdenes de producción, tiempos de ciclo y utilización' : 'Plan production orders, cycle times & capacity utilization'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setOrders(DEFAULT_PRODUCTION_ORDERS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Utilización de Capacidad' : 'Capacity Utilization'}
          value={`${result.capacityUtilizationPct}%`}
          hint={isEs ? `Horas req: ${result.totalEstimatedHoursRequired}h` : `Req hours: ${result.totalEstimatedHoursRequired}h`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Unidades Totales Objetivo' : 'Total Target Units'}
          value={result.totalTargetUnits.toLocaleString()}
          hint={isEs ? 'Plan de producción' : 'Production schedule'}
        />
        <ToolMetricTile
          label={isEs ? 'Unidades Completadas' : 'Completed Units'}
          value={result.totalCompletedUnits.toLocaleString()}
          hint={isEs ? 'Fabricadas' : 'Produced'}
        />
        <ToolMetricTile
          label={isEs ? 'Órdenes Activas' : 'Active Orders'}
          value={result.totalOrdersCount.toString()}
          hint={isEs ? 'Lotes en curso' : 'Batches in progress'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración de la Planta' : 'Facility Configuration'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre de la Planta' : 'Facility Name'}>
            <UiInput type="text" value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Horas Diarias Disponibles (Por Maquina)' : 'Available Daily Hours (Per Machine)'}>
            <UiInput
              type="number"
              min={1}
              max={24}
              value={availableDailyHours}
              onChange={(e) => setAvailableDailyHours(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Order Form */}
      <form onSubmit={addOrder} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Orden de Producción' : 'Add Production Order'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Producto' : 'Product Name'}>
            <UiInput
              type="text"
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              placeholder="Hydraulic Valve"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Cantidad Objetivo' : 'Target Qty'}>
            <UiInput
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Completadas' : 'Completed'}>
            <UiInput
              type="number"
              value={newCompleted}
              onChange={(e) => setNewCompleted(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Ciclo (min/unidad)' : 'Cycle (min/unit)'}>
            <UiInput
              type="number"
              value={newCycleTime}
              onChange={(e) => setNewCycleTime(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Centro de Trabajo' : 'Work Center'}>
            <UiInput
              type="text"
              value={newWorkCenter}
              onChange={(e) => setNewWorkCenter(e.target.value)}
              placeholder="CNC Cell A"
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Orden' : 'Add Order'}</span>
          </UiButton>
        </div>
      </form>

      {/* Orders Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Órdenes de Producción Activas' : 'Active Production Orders'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Producto' : 'Product'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Centro' : 'Work Center'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Objetivo' : 'Target'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Completado' : 'Completed'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Ciclo (min)' : 'Cycle (min)'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {orders.map((o: ProductionOrder) => (
              <tr key={o.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{o.productName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{o.workCenter}</td>
                <td className="py-3 px-3 text-right">{o.targetQuantity.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">{o.completedQuantity.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">{o.cycleTimeMinutesPerUnit} min</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : o.status === 'In Production'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeOrder(o.id)}
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
