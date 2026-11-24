import { useState, useId } from 'react';
import {
  ShieldAlert,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface WarrantyItem {
  id: string;
  item: string;
  purchaseDate: string;
  expiryDate: string;
  category: string;
}

const INITIAL_WARRANTIES: WarrantyItem[] = [
  { id: '1', item: 'Refrigerator (Kitchen)', purchaseDate: '2024-05-15', expiryDate: '2029-05-15', category: 'Appliances' },
  { id: '2', item: 'OLED TV 55"', purchaseDate: '2025-11-20', expiryDate: '2027-11-20', category: 'Electronics' },
  { id: '3', item: 'Power Inverter Generator', purchaseDate: '2026-06-10', expiryDate: '2029-06-10', category: 'Tools' }
];

const CATEGORIES = ['Electronics', 'Appliances', 'Tools', 'Furniture', 'Automotive'];

export default function WarrantyExpirationTrackerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const [warranties, setWarranties] = useState<WarrantyItem[]>(INITIAL_WARRANTIES);
  const [item, setItem] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-01-01');
  const [expiryDate, setExpiryDate] = useState('2028-01-01');
  const [category, setCategory] = useState('Electronics');
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editExpiry, setEditExpiry] = useState('');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = item.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del artículo o equipo.' : 'Please enter an item or equipment name.');
      return;
    }
    setFormError('');
    setWarranties((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        item: trimmed,
        purchaseDate,
        expiryDate,
        category
      }
    ]);
    setItem('');
  };

  const startEdit = (w: WarrantyItem) => {
    setEditingId(w.id);
    setEditItem(w.item);
    setEditExpiry(w.expiryDate);
  };

  const commitEdit = (id: string) => {
    const trimmed = editItem.trim();
    if (!trimmed) return;
    setWarranties((prev) =>
      prev.map((w) => (w.id === id ? { ...w, item: trimmed, expiryDate: editExpiry } : w))
    );
    setEditingId(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const activeCount = warranties.filter((w) => w.expiryDate >= today).length;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(warranties, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'warranties.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Vencimiento de Garantías' : 'Warranty Expiration & Coverage Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Guarda fechas de compra y vencimiento de garantías' : 'Track purchase dates and warranty coverage windows'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Garantías (JSON)' : 'Export Warranties (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setWarranties(INITIAL_WARRANTIES)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Garantías Registradas' : 'Warranties Tracked'}
          value={String(warranties.length)}
          hint={isEs ? 'equipos y bienes' : 'covered items'}
        />
        <ToolMetricTile
          label={isEs ? 'Coberturas Vigentes' : 'Active Warranties'}
          value={String(activeCount)}
          hint={isEs ? 'sin vencer a la fecha' : 'currently valid'}
          accent
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre del Artículo / Equipo' : 'Item / Equipment Name'} htmlFor={`${baseId}-item`}>
              <UiInput
                id={`${baseId}-item`}
                type="text"
                placeholder={isEs ? 'Ej. Sistema HVAC' : 'e.g. HVAC System'}
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiSelect
                id={`${baseId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Compra' : 'Purchase Date'} htmlFor={`${baseId}-pdate`}>
              <UiInput
                id={`${baseId}-pdate`}
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Vencimiento' : 'Expiry Date'} htmlFor={`${baseId}-edate`}>
              <UiInput
                id={`${baseId}-edate`}
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
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

        {warranties.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin garantías registradas' : 'No warranties tracked yet'}
            description={
              isEs
                ? 'Agrega un artículo arriba o restaura las garantías de ejemplo.'
                : 'Add a warranty item above or restore sample warranties.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setWarranties(INITIAL_WARRANTIES)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample warranties'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {warranties.map((w) => {
              const isValid = w.expiryDate >= today;
              return (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === w.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar artículo' : 'Edit item'}
                        value={editItem}
                        onChange={(e) => setEditItem(e.target.value)}
                        className="ui-input flex-1 min-w-[160px] py-1.5 text-xs"
                      />
                      <input
                        type="date"
                        aria-label={isEs ? 'Editar vencimiento' : 'Edit expiry'}
                        value={editExpiry}
                        onChange={(e) => setEditExpiry(e.target.value)}
                        className="ui-input w-36 py-1.5 text-xs font-mono"
                      />
                      <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(w.id)}>
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-text-primary block truncate">{w.item}</span>
                        <div className="text-xs text-text-secondary font-mono">
                          {w.category} • {isEs ? 'Vence:' : 'Expires:'} {w.expiryDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <UiStatusLabel tone={isValid ? 'success' : 'error'}>
                          {isValid ? (isEs ? 'Vigente' : 'Active') : (isEs ? 'Expirada' : 'Expired')}
                        </UiStatusLabel>
                        <button
                          type="button"
                          onClick={() => startEdit(w)}
                          aria-label={isEs ? `Editar ${w.item}` : `Edit ${w.item}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWarranties((prev) => prev.filter((x) => x.id !== w.id))}
                          aria-label={isEs ? `Eliminar ${w.item}` : `Remove ${w.item}`}
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
