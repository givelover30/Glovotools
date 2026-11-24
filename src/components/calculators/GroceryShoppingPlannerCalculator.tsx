import { useState, useEffect, useId } from 'react';
import {
  ShoppingCart,
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
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiCheckbox,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  price: number;
  checked: boolean;
}

const STORAGE_KEY = 'calctools_grocery_list';

const INITIAL_ITEMS: GroceryItem[] = [
  { id: '1', name: 'Almond Milk', category: 'Dairy & Eggs', qty: 2, price: 3.99, checked: true },
  { id: '2', name: 'Organic Eggs (Dozen)', category: 'Dairy & Eggs', qty: 1, price: 5.49, checked: false },
  { id: '3', name: 'Chicken Breast (2 lbs)', category: 'Meat & Seafood', qty: 1, price: 9.99, checked: false },
  { id: '4', name: 'Avocados (Bag)', category: 'Produce', qty: 1, price: 4.99, checked: true },
  { id: '5', name: 'Sourdough Bread', category: 'Bakery', qty: 1, price: 4.50, checked: false },
  { id: '6', name: 'Greek Yogurt', category: 'Dairy & Eggs', qty: 2, price: 4.29, checked: false }
];

const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry & Snacks',
  'Beverages'
];

const CATEGORY_ES: Record<string, string> = {
  Produce: 'Frutas y Verduras',
  'Dairy & Eggs': 'Lácteos y Huevos',
  'Meat & Seafood': 'Carnes y Mariscos',
  Bakery: 'Panadería',
  'Pantry & Snacks': 'Despensa y Snacks',
  Beverages: 'Bebidas'
};

export default function GroceryShoppingPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const [items, setItems] = useState<GroceryItem[]>(INITIAL_ITEMS);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Produce');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('2.99');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('1');
  const [editPrice, setEditPrice] = useState('0');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        // Ignore invalid localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addItem = () => {
    const trimmed = newName.trim();
    const qty = Number(newQty);
    const price = Number(newPrice);
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del artículo.' : 'Please enter an item name.');
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      setFormError(isEs ? 'Cantidad y precio deben ser válidos.' : 'Quantity and price must be valid numbers.');
      return;
    }
    setFormError('');
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: trimmed,
        category: newCat,
        qty,
        price,
        checked: false
      }
    ]);
    setNewName('');
    setNewQty('1');
    setNewPrice('2.99');
  };

  const toggleCheck = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const startEdit = (item: GroceryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(String(item.qty));
    setEditPrice(String(item.price));
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    const qty = Number(editQty);
    const price = Number(editPrice);
    if (!trimmed || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) return;
    setItems(items.map((i) => (i.id === id ? { ...i, name: trimmed, qty, price } : i)));
    setEditingId(null);
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalEstimatedCost = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const checkedItems = items.filter((i) => i.checked);
  const checkedCost = checkedItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${Date.now()}.json`;
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
              {isEs
                ? 'Planificador de Compras de Supermercado'
                : 'Grocery Shopping List & Cost Estimator'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Calcula el presupuesto de tu carrito antes de llegar a caja'
                : 'Track grocery quantities, categories, and estimated cart cost'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">
              {isEs ? 'Guardado localmente' : 'Saved locally'}
            </UiStatusLabel>
          )}
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
          <UiButton variant="ghost" size="sm" onClick={() => setItems(INITIAL_ITEMS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Costo Total Estimado' : 'Total Estimated Cost'}
          value={formatCurrency(totalEstimatedCost)}
          hint={`${items.length} ${isEs ? 'artículos' : 'items'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'En Carrito' : 'In Cart'}
          value={formatCurrency(checkedCost)}
          hint={`${checkedItems.length}/${items.length} ${isEs ? 'marcados' : 'checked'}`}
        />
        <ToolMetricTile
          label={isEs ? 'Restante por Recoger' : 'Remaining'}
          value={formatCurrency(Math.max(0, totalEstimatedCost - checkedCost))}
          hint={`${items.length - checkedItems.length} ${isEs ? 'pendientes' : 'left'}`}
        />
      </div>

      {/* Add Item Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Artículo al Supermercado' : 'Add Grocery Item'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Artículo' : 'Item name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Manzanas orgánicas' : 'e.g. Organic Apples'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {isEs ? CATEGORY_ES[c] || c : c}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Cantidad' : 'Qty'} htmlFor={`${baseId}-qty`}>
              <UiInput
                id={`${baseId}-qty`}
                type="number"
                min={1}
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Precio (${currencyMeta.symbol})` : `Price (${currencyMeta.symbol})`} htmlFor={`${baseId}-price`}>
              <UiInput
                id={`${baseId}-price`}
                type="number"
                min={0}
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton variant="primary" onClick={addItem} className="w-full" aria-label={isEs ? 'Agregar' : 'Add'}>
              <Plus className="w-4 h-4" />
              <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Shopping List */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Lista de Compras' : 'Shopping List'}
          </h3>
          {items.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setItems([])}>
              {isEs ? 'Vaciar lista' : 'Clear list'}
            </UiButton>
          )}
        </div>

        {items.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Tu lista está vacía' : 'Your grocery list is empty'}
            description={
              isEs
                ? 'Agrega artículos arriba o restaura la lista de ejemplo.'
                : 'Add grocery items above or restore the sample list.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setItems(INITIAL_ITEMS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample list'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const displayCat = isEs ? CATEGORY_ES[item.category] || item.category : item.category;
              return (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                    item.checked
                      ? 'bg-surface-secondary/40 border-border-subtle opacity-75'
                      : 'bg-surface border-border-main'
                  }`}
                >
                  {editingId === item.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar artículo' : 'Edit item name'}
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
                        min={0}
                        step="0.01"
                        aria-label={isEs ? 'Editar precio' : 'Edit price'}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(item.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <UiCheckbox
                          label=""
                          aria-label={isEs ? `Marcar ${item.name}` : `Check ${item.name}`}
                          checked={item.checked}
                          onChange={() => toggleCheck(item.id)}
                        />
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              item.checked ? 'line-through text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] text-text-secondary font-mono">
                            {displayCat} • {isEs ? 'Cant:' : 'Qty:'} {item.qty} × {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-accent">
                          {formatCurrency(item.qty * item.price)}
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
                          onClick={() => removeItem(item.id)}
                          aria-label={isEs ? `Eliminar ${item.name}` : `Remove ${item.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
