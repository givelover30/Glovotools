import { useState, useId } from 'react';
import { Package, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  InventorySkuItem,
  ComputedSkuItem,
  DEFAULT_INVENTORY_ITEMS,
  calculateInventory
} from '../../engine/contracts/planners/inventoryReorder.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_inventory_reorder_planner_v1';

export default function InventoryReorderPlannerCalculator() {
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

  const [inventoryName, setInventoryName] = useState('Main Distribution Warehouse');
  const {
    state: items,
    setState: setItems,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<InventorySkuItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_INVENTORY_ITEMS
  });

  const [newSku, setNewSku] = useState('SKU-NEW-01');
  const [newItemName, setNewItemName] = useState('');
  const [newStock, setNewStock] = useState(150);
  const [newDemand, setNewDemand] = useState(12);
  const [newLeadTime, setNewLeadTime] = useState(5);
  const [newSafety, setNewSafety] = useState(25);
  const [newCost, setNewCost] = useState(10.0);
  const [formError, setFormError] = useState('');

  const result = calculateInventory({ inventoryName, items });

  const addSku = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del artículo.' : 'Please enter item name.');
      return;
    }
    setFormError('');
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        skuCode: newSku,
        itemName: trimmed,
        currentStock: Number(newStock) || 150,
        averageDailyDemand: Number(newDemand) || 12,
        leadTimeDays: Number(newLeadTime) || 5,
        safetyStock: Number(newSafety) || 25,
        unitCost: Number(newCost) || 10.0
      }
    ]);
    setNewItemName('');
  };

  const removeSku = (id: string) => {
    setItems(items.filter((i: InventorySkuItem) => i.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ inventoryName, items, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'SKU', 'Item Name', 'Current Stock', 'Daily Demand', 'Lead Time', 'Safety Stock', 'Unit Cost', 'Reorder Point', 'Needs Reorder'];
    const rows = result.items.map((i) => [
      i.id,
      i.skuCode,
      i.itemName,
      i.currentStock,
      i.averageDailyDemand,
      i.leadTimeDays,
      i.safetyStock,
      i.unitCost,
      i.reorderPoint,
      i.needsReorder ? 'YES' : 'NO'
    ]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Punto de Reorden de Inventario y Planificador de Stock' : 'Inventory Reorder Point & Stock Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Calcula puntos de reorden, stock de seguridad y valoración' : 'Calculate reorder points, safety stock & inventory valuation'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setItems(DEFAULT_INVENTORY_ITEMS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Valoración Total de Inventario' : 'Total Inventory Valuation'}
          value={fmtMoney(result.totalInventoryValuation)}
          hint={isEs ? `${result.totalSkusCount} SKUs gestionados` : `${result.totalSkusCount} active SKUs`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'SKUs con Alerta de Stock' : 'Low Stock Alerts'}
          value={result.lowStockSkusCount.toString()}
          hint={isEs ? 'Requieren reorden urgente' : 'Require reordering'}
        />
        <ToolMetricTile
          label={isEs ? 'SKUs Totales' : 'Total SKUs'}
          value={result.totalSkusCount.toString()}
          hint={isEs ? 'Artículos en catálogo' : 'Tracked items'}
        />
        <ToolMetricTile
          label={isEs ? 'Nombre de Inventario' : 'Inventory Facility'}
          value={result.inventoryName}
          hint={isEs ? 'Ubicación principal' : 'Primary facility'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Almacén' : 'Warehouse Settings'}
        </h3>
        <ToolFieldGroup label={isEs ? 'Nombre de la Ubicación / Almacén' : 'Warehouse / Facility Name'}>
          <UiInput type="text" value={inventoryName} onChange={(e) => setInventoryName(e.target.value)} />
        </ToolFieldGroup>
      </div>

      {/* Add Sku Form */}
      <form onSubmit={addSku} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar SKU / Artículo de Inventario' : 'Add Inventory SKU / Item'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <ToolFieldGroup label="SKU">
            <UiInput type="text" value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="SKU-001" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Artículo' : 'Item Name'}>
            <UiInput
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Steel Bracket"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Stock Actual' : 'Current Stock'}>
            <UiInput
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Demanda Diaria' : 'Daily Demand'}>
            <UiInput
              type="number"
              min={0}
              value={newDemand}
              onChange={(e) => setNewDemand(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Plazo Entrega (Días)' : 'Lead Time (Days)'}>
            <UiInput
              type="number"
              min={0}
              value={newLeadTime}
              onChange={(e) => setNewLeadTime(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Stock Seguridad' : 'Safety Stock'}>
            <UiInput
              type="number"
              min={0}
              value={newSafety}
              onChange={(e) => setNewSafety(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Costo Unitario' : 'Unit Cost'}>
            <UiInput
              type="number"
              min={0}
              step={0.01}
              value={newCost}
              onChange={(e) => setNewCost(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar SKU' : 'Add SKU'}</span>
          </UiButton>
        </div>
      </form>

      {/* Inventory Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Análisis de Reorden y Niveles de Stock' : 'Reorder Point Analysis & Stock Levels'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">SKU</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Artículo' : 'Item Name'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Stock' : 'Stock'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Punto Reorden' : 'Reorder Point'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Cant. Sugerida' : 'Recommended Qty'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Valoración' : 'Valuation'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {result.items.map((i: ComputedSkuItem) => (
              <tr key={i.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-bold text-text-primary">{i.skuCode}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{i.itemName}</td>
                <td className="py-3 px-3 text-right">{i.currentStock.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">{i.reorderPoint}</td>
                <td className="py-3 px-3 text-right font-bold text-accent">{i.recommendedOrderQuantity}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(i.inventoryValuation)}</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      i.needsReorder
                        ? 'bg-rose-500/10 text-rose-600 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}
                  >
                    {i.needsReorder ? (isEs ? 'REORDENAR' : 'REORDER') : (isEs ? 'ÓPTIMO' : 'OPTIMAL')}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeSku(i.id)}
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
