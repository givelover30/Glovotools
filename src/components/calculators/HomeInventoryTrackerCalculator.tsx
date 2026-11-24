import { useState, useMemo, useId } from 'react';
import {
  Package,
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
  UiSelect,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface InventoryItem {
  id: string;
  name: string;
  room: string;
  quantity: number;
  estimatedValue: number;
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'MacBook Pro 16"', room: 'Office', quantity: 1, estimatedValue: 2499.0 },
  { id: '2', name: 'Sony Bravia 65" TV', room: 'Living Room', quantity: 1, estimatedValue: 1200.0 },
  { id: '3', name: 'Espresso Machine', room: 'Kitchen', quantity: 1, estimatedValue: 650.0 }
];

const ROOMS = ['Living Room', 'Kitchen', 'Office', 'Bedroom', 'Garage'];

export default function HomeInventoryTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('Living Room');
  const [quantity, setQuantity] = useState('1');
  const [value, setValue] = useState('200');
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('1');
  const [editValue, setEditValue] = useState('0');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del artículo.' : 'Please enter an item name.');
      return;
    }
    setFormError('');
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: trimmed,
        room,
        quantity: Math.max(1, Number(quantity) || 1),
        estimatedValue: Math.max(0, Number(value) || 0)
      }
    ]);
    setName('');
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(String(item.quantity));
    setEditValue(String(item.estimatedValue));
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              name: trimmed,
              quantity: Math.max(1, Number(editQty) || 1),
              estimatedValue: Math.max(0, Number(editValue) || 0)
            }
          : i
      )
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalValue = items.reduce((acc, i) => acc + i.estimatedValue * i.quantity, 0);
    return { totalItems, totalValue };
  }, [items]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'home_inventory.json';
    link.click();
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
              {isEs ? 'Inventario del Hogar y Bienes' : 'Home Inventory & Asset Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Cataloga pertenencias por habitación y estima su valor total' : 'Catalog household belongings by room and estimate coverage value'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Inventario (JSON)' : 'Export Inventory (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setItems(INITIAL_ITEMS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Valor Total Estimado' : 'Total Estimated Value'}
          value={fmtMoney(summary.totalValue)}
          hint={isEs ? 'cobertura del hogar' : 'replacement estimate'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Total Artículos Registrados' : 'Total Items Registered'}
          value={String(summary.totalItems)}
          hint={isEs ? `${items.length} líneas` : `${items.length} entries`}
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre del Artículo' : 'Item Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Guitarra acústica' : 'e.g. Acoustic Guitar'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Habitación' : 'Room'} htmlFor={`${baseId}-room`}>
              <UiSelect
                id={`${baseId}-room`}
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <ToolFieldGroup label={isEs ? 'Cant.' : 'Qty'} htmlFor={`${baseId}-qty`}>
              <UiInput
                id={`${baseId}-qty`}
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Valor Unitario (${currencyMeta.symbol})` : `Unit Value (${currencyMeta.symbol})`} htmlFor={`${baseId}-val`}>
              <UiInput
                id={`${baseId}-val`}
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="font-mono tabular-nums"
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

        {items.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Inventario vacío' : 'No inventory items yet'}
            description={
              isEs
                ? 'Agrega un artículo arriba o restaura los ejemplos iniciales.'
                : 'Add an item above or restore sample inventory items.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setItems(INITIAL_ITEMS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample items'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === item.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar artículo' : 'Edit item'}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      min={1}
                      aria-label={isEs ? 'Editar cantidad' : 'Edit quantity'}
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="ui-input w-20 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      aria-label={isEs ? 'Editar valor' : 'Edit value'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(item.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-text-primary block truncate">{item.name}</span>
                      <div className="text-xs text-text-secondary">
                        {item.room} • {isEs ? 'Cant:' : 'Qty:'} {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-text-primary">
                        {fmtMoney(item.estimatedValue * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={isEs ? `Editar ${item.name}` : `Edit ${item.name}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        aria-label={isEs ? `Eliminar ${item.name}` : `Remove ${item.name}`}
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
