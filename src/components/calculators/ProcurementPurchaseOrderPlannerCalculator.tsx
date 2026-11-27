import { useState, useId } from 'react';
import { ShoppingCart, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  PurchaseOrderItem,
  DEFAULT_PURCHASE_ORDERS,
  calculateProcurement
} from '../../engine/contracts/planners/procurementPurchaseOrder.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_procurement_purchase_order_planner_v1';

export default function ProcurementPurchaseOrderPlannerCalculator() {
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

  const [procurementPlanName, setProcurementPlanName] = useState('Q4 Manufacturing Supply Requisitions');
  const {
    state: orders,
    setState: setOrders,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<PurchaseOrderItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_PURCHASE_ORDERS
  });

  const [newPoNumber, setNewPoNumber] = useState('PO-2025-104');
  const [newSupplier, setNewSupplier] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newQty, setNewQty] = useState(100);
  const [newPrice, setNewPrice] = useState(25.0);
  const [formError, setFormError] = useState('');

  const result = calculateProcurement({ procurementPlanName, orders });

  const addOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSupplier = newSupplier.trim();
    const trimmedItem = newItemName.trim();
    if (!trimmedSupplier || !trimmedItem) {
      setFormError(isEs ? 'Ingresa el proveedor y el artículo.' : 'Please enter supplier and item name.');
      return;
    }
    setFormError('');
    setOrders([
      ...orders,
      {
        id: Date.now().toString(),
        poNumber: newPoNumber,
        supplierName: trimmedSupplier,
        itemName: trimmedItem,
        quantityOrdered: Number(newQty) || 100,
        unitPrice: Number(newPrice) || 25.0,
        status: 'Draft'
      }
    ]);
    setNewSupplier('');
    setNewItemName('');
  };

  const removeOrder = (id: string) => {
    setOrders(orders.filter((o: PurchaseOrderItem) => o.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ procurementPlanName, orders, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `procurement-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'PO Number', 'Supplier', 'Item Name', 'Quantity', 'Unit Price', 'Total', 'Status'];
    const rows = orders.map((o: PurchaseOrderItem) => [o.id, o.poNumber, o.supplierName, o.itemName, o.quantityOrdered, o.unitPrice, o.quantityOrdered * o.unitPrice, o.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `procurement-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Herramienta de Planificación de Adquisiciones y Órdenes de Compra' : 'Procurement & Purchase Order Planning Tool'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Crea y gestiona requisiciones, órdenes de compra y proveedores' : 'Create & track purchase requisitions, orders & suppliers'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setOrders(DEFAULT_PURCHASE_ORDERS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Valor Total de Órdenes' : 'Total Order Value'}
          value={fmtMoney(result.totalOrderValue)}
          hint={`${result.totalOrdersCount} ${isEs ? 'órdenes totales' : 'total POs'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Órdenes Pendientes' : 'Pending Orders'}
          value={result.pendingOrdersCount.toString()}
          hint={isEs ? 'En proceso / ordenadas' : 'In process / ordered'}
        />
        <ToolMetricTile
          label={isEs ? 'Órdenes Recibidas' : 'Received Orders'}
          value={result.receivedOrdersCount.toString()}
          hint={isEs ? 'Entregas completadas' : 'Completed deliveries'}
        />
        <ToolMetricTile
          label={isEs ? 'Plan de Adquisiciones' : 'Procurement Plan'}
          value={result.procurementPlanName}
          hint={isEs ? 'Activo' : 'Active'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Plan de Adquisiciones' : 'Procurement Plan Settings'}
        </h3>
        <ToolFieldGroup label={isEs ? 'Nombre del Plan de Adquisiciones' : 'Procurement Plan Name'}>
          <UiInput type="text" value={procurementPlanName} onChange={(e) => setProcurementPlanName(e.target.value)} />
        </ToolFieldGroup>
      </div>

      {/* Add PO Form */}
      <form onSubmit={addOrder} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Crear Requisición / Orden de Compra' : 'Create Purchase Requisition / PO'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Núm. PO' : 'PO Number'}>
            <UiInput type="text" value={newPoNumber} onChange={(e) => setNewPoNumber(e.target.value)} placeholder="PO-104" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Proveedor' : 'Supplier Name'}>
            <UiInput type="text" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} placeholder="Apex Parts" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Artículo' : 'Item Name'}>
            <UiInput type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Steel Rods" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Cantidad' : 'Quantity'}>
            <UiInput
              type="number"
              min={1}
              value={newQty}
              onChange={(e) => setNewQty(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Precio Unitario ($)' : 'Unit Price ($)'}>
            <UiInput
              type="number"
              min={0}
              step={0.01}
              value={newPrice}
              onChange={(e) => setNewPrice(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Crear Orden' : 'Create Order'}</span>
          </UiButton>
        </div>
      </form>

      {/* PO Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Órdenes de Compra y Estado' : 'Purchase Orders & Status'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">PO #</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Proveedor' : 'Supplier'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Artículo' : 'Item Name'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Cantidad' : 'Qty'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Precio U.' : 'Unit Price'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Total' : 'Total Value'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {orders.map((o: PurchaseOrderItem) => (
              <tr key={o.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-bold text-text-primary">{o.poNumber}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{o.supplierName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{o.itemName}</td>
                <td className="py-3 px-3 text-right">{o.quantityOrdered.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(o.unitPrice)}</td>
                <td className="py-3 px-3 text-right font-bold text-accent">{fmtMoney(o.quantityOrdered * o.unitPrice)}</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'Received'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : o.status === 'Ordered'
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
