import { useState, useEffect, useId } from 'react';
import {
  PartyPopper,
  Plus,
  Trash2,
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
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface ExpenseItem {
  id: string;
  category: string;
  name: string;
  cost: number;
}

const STORAGE_KEY = 'calctools_event_planner';

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: '1', category: 'Venue', name: 'Grand Ballroom Rental', cost: 1200 },
  { id: '2', category: 'Catering', name: 'Dinner Buffet & Open Bar (50 guests)', cost: 2500 },
  { id: '3', category: 'Entertainment', name: 'Live DJ & Sound System', cost: 600 },
  { id: '4', category: 'Decoration', name: 'Floral Centerpieces & Lighting', cost: 450 },
  { id: '5', category: 'Photography', name: 'Professional Event Photographer (4 hrs)', cost: 500 }
];

const CATEGORIES = [
  'Venue',
  'Catering',
  'Entertainment',
  'Decoration',
  'Photography',
  'Invitations & Misc'
];

const CATEGORY_ES: Record<string, string> = {
  Venue: 'Salón / Lugar',
  Catering: 'Banquete y Bebidas',
  Entertainment: 'Música y Entretenimiento',
  Decoration: 'Decoración',
  Photography: 'Fotografía',
  'Invitations & Misc': 'Invitaciones y Varios'
};

export default function EventPartyPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [eventName, setEventName] = useState<string>('Anniversary Gala Celebration');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);

  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Catering');
  const [newCost, setNewCost] = useState('100');
  const [formError, setFormError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState('Catering');
  const [editName, setEditName] = useState('');
  const [editCost, setEditCost] = useState('0');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.eventName === 'string') setEventName(parsed.eventName);
          if (parsed.guestCount !== undefined && Number.isFinite(Number(parsed.guestCount))) {
            setGuestCount(Math.max(1, Number(parsed.guestCount)));
          }
          if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        }
      } catch {
        // Ignore malformed localStorage payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ eventName, guestCount, expenses })
    );
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleReset = () => {
    setEventName('Anniversary Gala Celebration');
    setGuestCount(50);
    setExpenses(INITIAL_EXPENSES);
    setFormError('');
    setEditingId(null);
  };

  const addItem = () => {
    const trimmed = newName.trim();
    const cost = Number(newCost);
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa una descripción del gasto.' : 'Please enter an expense description.');
      return;
    }
    if (!Number.isFinite(cost) || cost < 0) {
      setFormError(isEs ? 'El costo no puede ser negativo.' : 'Cost cannot be negative.');
      return;
    }
    setFormError('');
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        category: newCat,
        name: trimmed,
        cost
      }
    ]);
    setNewName('');
    setNewCost('100');
  };

  const startEdit = (item: ExpenseItem) => {
    setEditingId(item.id);
    setEditCat(item.category);
    setEditName(item.name);
    setEditCost(String(item.cost));
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    const cost = Number(editCost);
    if (!trimmed || !Number.isFinite(cost) || cost < 0) return;
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, category: editCat, name: trimmed, cost } : e))
    );
    setEditingId(null);
  };

  const removeItem = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  const totalCost = expenses.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const safeGuests = Math.max(1, Number(guestCount) || 1);
  const costPerGuest = Math.round(totalCost / safeGuests);

  const handleDownload = () => {
    const data = { eventName, guestCount: safeGuests, expenses, totalCost, costPerGuest };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <PartyPopper className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs
                ? 'Coordinador de Presupuesto para Eventos y Fiestas'
                : 'Event & Party Budget Coordinator'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Controla gastos por categoría y calcula el costo por invitado'
                : 'Track event categories, vendor costs, and cost per guest'}
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
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Event Details + KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ui-panel p-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Evento' : 'Event Name'} htmlFor={`${baseId}-event`}>
            <UiInput
              id={`${baseId}-event`}
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </ToolFieldGroup>
        </div>
        <div className="ui-panel p-4">
          <ToolFieldGroup
            label={isEs ? 'Número de Invitados' : 'Guest Count'}
            htmlFor={`${baseId}-guests`}
          >
            <UiInput
              id={`${baseId}-guests`}
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
              className="font-mono font-bold"
            />
          </ToolFieldGroup>
        </div>
        <ToolMetricTile
          label={isEs ? 'Costo Total / Por Invitado' : 'Total Cost / Per Guest'}
          value={fmtMoney(totalCost)}
          hint={`${fmtMoney(costPerGuest)} ${isEs ? 'por invitado' : 'per guest'}`}
          accent
        />
      </div>

      {/* Add Expense Form */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Gasto del Evento' : 'Add Event Expense'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
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
          <div className="sm:col-span-6">
            <ToolFieldGroup label={isEs ? 'Concepto' : 'Expense description'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. DJ e iluminación' : 'e.g. DJ & Lighting'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Costo (${currencyMeta.symbol})` : `Cost (${currencyMeta.symbol})`} htmlFor={`${baseId}-cost`}>
              <UiInput
                id={`${baseId}-cost`}
                type="number"
                min={0}
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton
              variant="primary"
              onClick={addItem}
              className="w-full"
              aria-label={isEs ? 'Agregar gasto' : 'Add Expense'}
            >
              <Plus className="w-4 h-4" />
              <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </div>
      </section>

      {/* Budget Breakdown */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Desglose de Presupuesto' : 'Budget Breakdown'}
          </h3>
          {expenses.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={() => setExpenses([])}>
              {isEs ? 'Vaciar gastos' : 'Clear expenses'}
            </UiButton>
          )}
        </div>

        {expenses.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay gastos registrados' : 'No event expenses yet'}
            description={
              isEs
                ? 'Agrega partidas arriba o restaura el presupuesto de ejemplo.'
                : 'Add vendor items above or restore the starter event breakdown.'
            }
            action={
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setExpenses(INITIAL_EXPENSES)}
              >
                {isEs ? 'Restaurar ejemplo' : 'Restore sample budget'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {expenses.map((item) => {
              const displayCat = isEs ? CATEGORY_ES[item.category] || item.category : item.category;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === item.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <select
                        aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                        value={editCat}
                        onChange={(e) => setEditCat(e.target.value)}
                        className="ui-select w-36 py-1.5 text-xs"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {isEs ? CATEGORY_ES[c] || c : c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar concepto' : 'Edit description'}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar costo' : 'Edit cost'}
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
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
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-accent font-mono font-semibold uppercase">
                          {displayCat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
                          {fmtMoney(Number(item.cost))}
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
