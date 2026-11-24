import { useState, useMemo, useId } from 'react';
import {
  Heart,
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
import {
  ToolMetricTile,
  ToolSegmentedControl,
  ToolFieldGroup
} from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  UiButton,
  UiInput,
  UiSelect,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface BudgetItem {
  id: string;
  category: string;
  item: string;
  estimatedCost: number;
  actualCost: number;
}

interface Guest {
  id: string;
  name: string;
  partySize: number;
  rsvp: 'Confirmed' | 'Declined' | 'Pending';
  tableNumber: string;
}

const INITIAL_BUDGET: BudgetItem[] = [
  { id: '1', category: 'Venue', item: 'Grand Ballroom Rental', estimatedCost: 5000, actualCost: 4800 },
  { id: '2', category: 'Catering', item: 'Dinner & Open Bar (120 guests)', estimatedCost: 6000, actualCost: 6200 },
  { id: '3', category: 'Photography', item: 'Full Day Photo & Video', estimatedCost: 3000, actualCost: 3000 },
  { id: '4', category: 'Attire', item: 'Wedding Dress & Suit', estimatedCost: 2500, actualCost: 2400 }
];

const INITIAL_GUESTS: Guest[] = [
  { id: '1', name: 'John & Mary Smith', partySize: 2, rsvp: 'Confirmed', tableNumber: 'Table 1' },
  { id: '2', name: 'Robert Johnson', partySize: 1, rsvp: 'Confirmed', tableNumber: 'Table 1' },
  { id: '3', name: 'Emily Davis', partySize: 2, rsvp: 'Pending', tableNumber: 'Unassigned' }
];

const CATEGORIES = ['Venue', 'Catering', 'Photography', 'Attire', 'Flowers', 'Music'];

const CATEGORY_ES: Record<string, string> = {
  Venue: 'Lugar / Salón',
  Catering: 'Banquete y Barra',
  Photography: 'Fotografía y Video',
  Attire: 'Vestimenta',
  Flowers: 'Flores y Decoración',
  Music: 'Música y DJ'
};

const RSVP_ES: Record<Guest['rsvp'], string> = {
  Confirmed: 'Confirmado',
  Declined: 'Declinó',
  Pending: 'Pendiente'
};

export default function WeddingPlanningOrganizerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [activeTab, setActiveTab] = useState<'budget' | 'guests'>('budget');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(INITIAL_BUDGET);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);

  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Venue');
  const [newEstCost, setNewEstCost] = useState(500);
  const [budgetError, setBudgetError] = useState('');

  const [newGuestName, setNewGuestName] = useState('');
  const [newPartySize, setNewPartySize] = useState(1);
  const [guestError, setGuestError] = useState('');

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editEstCost, setEditEstCost] = useState(0);
  const [editActCost, setEditActCost] = useState(0);

  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editPartySize, setEditPartySize] = useState(1);
  const [editRsvp, setEditRsvp] = useState<Guest['rsvp']>('Pending');
  const [editTable, setEditTable] = useState('');

  const addBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setBudgetError(isEs ? 'Ingresa el concepto del gasto.' : 'Please enter an expense item name.');
      return;
    }
    if (!Number.isFinite(newEstCost) || newEstCost < 0) {
      setBudgetError(isEs ? 'El costo no puede ser negativo.' : 'Cost cannot be negative.');
      return;
    }
    setBudgetError('');
    setBudgetItems([
      ...budgetItems,
      {
        id: Date.now().toString(),
        category: newCategory,
        item: trimmed,
        estimatedCost: Number(newEstCost) || 0,
        actualCost: Number(newEstCost) || 0
      }
    ]);
    setNewItemName('');
  };

  const addGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGuestName.trim();
    if (!trimmed) {
      setGuestError(isEs ? 'Ingresa el nombre del invitado o familia.' : 'Please enter a guest or family name.');
      return;
    }
    if (!Number.isFinite(newPartySize) || newPartySize < 1) {
      setGuestError(isEs ? 'La cantidad debe ser al menos 1.' : 'Party size must be at least 1.');
      return;
    }
    setGuestError('');
    setGuests([
      ...guests,
      {
        id: Date.now().toString(),
        name: trimmed,
        partySize: Math.max(1, Number(newPartySize) || 1),
        rsvp: 'Pending',
        tableNumber: 'Unassigned'
      }
    ]);
    setNewGuestName('');
  };

  const startEditBudget = (b: BudgetItem) => {
    setEditingBudgetId(b.id);
    setEditItemName(b.item);
    setEditEstCost(b.estimatedCost);
    setEditActCost(b.actualCost);
  };

  const commitEditBudget = (id: string) => {
    const trimmed = editItemName.trim();
    if (!trimmed || editEstCost < 0 || editActCost < 0) return;
    setBudgetItems(
      budgetItems.map((i) =>
        i.id === id
          ? { ...i, item: trimmed, estimatedCost: Number(editEstCost), actualCost: Number(editActCost) }
          : i
      )
    );
    setEditingBudgetId(null);
  };

  const startEditGuest = (g: Guest) => {
    setEditingGuestId(g.id);
    setEditGuestName(g.name);
    setEditPartySize(g.partySize);
    setEditRsvp(g.rsvp);
    setEditTable(g.tableNumber);
  };

  const commitEditGuest = (id: string) => {
    const trimmed = editGuestName.trim();
    if (!trimmed || editPartySize < 1) return;
    setGuests(
      guests.map((g) =>
        g.id === id
          ? {
              ...g,
              name: trimmed,
              partySize: Math.max(1, Number(editPartySize)),
              rsvp: editRsvp,
              tableNumber: editTable.trim() || 'Unassigned'
            }
          : g
      )
    );
    setEditingGuestId(null);
  };

  const handleReset = () => {
    setBudgetItems(INITIAL_BUDGET);
    setGuests(INITIAL_GUESTS);
    setBudgetError('');
    setGuestError('');
    setEditingBudgetId(null);
    setEditingGuestId(null);
  };

  const budgetSummary = useMemo(() => {
    const estTotal = budgetItems.reduce((acc, i) => acc + i.estimatedCost, 0);
    const actTotal = budgetItems.reduce((acc, i) => acc + i.actualCost, 0);
    return { estTotal, actTotal };
  }, [budgetItems]);

  const guestSummary = useMemo(() => {
    const totalPeople = guests
      .filter((g) => g.rsvp === 'Confirmed')
      .reduce((acc, g) => acc + g.partySize, 0);
    const totalInvited = guests.reduce((acc, g) => acc + g.partySize, 0);
    return { totalPeople, totalInvited };
  }, [guests]);

  const handleExportJson = () => {
    const data = { budget: budgetItems, guests };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding_plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Organizador de Boda y RSVP' : 'Wedding Budget & Guest List Organizer'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Controla proveedores, presupuesto real vs estimado y confirmaciones'
                : 'Coordinate wedding budget lines, actual spend, and guest RSVPs'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Plan (JSON)' : 'Export Wedding Plan (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Costo Real Total' : 'Actual Budget Spend'}
          value={fmtMoney(budgetSummary.actTotal)}
          hint={`${isEs ? 'estimado:' : 'est:'} ${fmtMoney(budgetSummary.estTotal)}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Invitados Confirmados' : 'Confirmed Guests'}
          value={String(guestSummary.totalPeople)}
          hint={`${isEs ? 'de' : 'of'} ${guestSummary.totalInvited} ${isEs ? 'invitados' : 'invited'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Variación del Presupuesto' : 'Budget Variance'}
          value={`${budgetSummary.actTotal - budgetSummary.estTotal >= 0 ? '+' : '-'}${fmtMoney(
            Math.abs(budgetSummary.actTotal - budgetSummary.estTotal)
          )}`}
          hint={
            budgetSummary.actTotal <= budgetSummary.estTotal
              ? isEs
                ? 'dentro del presupuesto'
                : 'under or on budget'
              : isEs
              ? 'por encima de lo estimado'
              : 'above estimate'
          }
        />
      </div>

      {/* Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToolSegmentedControl
          ariaLabel={isEs ? 'Secciones de boda' : 'Wedding organizer sections'}
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'budget', label: isEs ? 'Presupuesto y Gastos' : 'Budget & Expenses' },
            { value: 'guests', label: isEs ? 'Lista de Invitados & RSVP' : 'Guest List & RSVP' }
          ]}
        />
      </div>

      {activeTab === 'budget' ? (
        <section className="ui-panel p-5 sm:p-6 space-y-5">
          {budgetError && <UiErrorState message={budgetError} />}
          <form
            onSubmit={addBudgetItem}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
          >
            <div className="sm:col-span-3">
              <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-bcat`}>
                <UiSelect
                  id={`${baseId}-bcat`}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {isEs ? CATEGORY_ES[c] || c : c}
                    </option>
                  ))}
                </UiSelect>
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-5">
              <ToolFieldGroup label={isEs ? 'Concepto de Gasto' : 'Expense Item'} htmlFor={`${baseId}-bitem`}>
                <UiInput
                  id={`${baseId}-bitem`}
                  type="text"
                  placeholder={isEs ? 'Ej. Pastel de bodas' : 'e.g. Wedding Cake'}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? `Estimado (${currencyMeta.symbol})` : `Estimated (${currencyMeta.symbol})`} htmlFor={`${baseId}-best`}>
                <UiInput
                  id={`${baseId}-best`}
                  type="number"
                  min={0}
                  value={newEstCost}
                  onChange={(e) => setNewEstCost(Number(e.target.value))}
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

          {budgetItems.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin partidas de presupuesto' : 'No wedding budget items yet'}
              description={
                isEs
                  ? 'Agrega un gasto arriba o restaura el presupuesto de ejemplo.'
                  : 'Add an expense above or restore the starter wedding budget.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setBudgetItems(INITIAL_BUDGET)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample budget'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {budgetItems.map((item) => {
                const displayCat = isEs ? CATEGORY_ES[item.category] || item.category : item.category;
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                  >
                    {editingBudgetId === item.id ? (
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <input
                          type="text"
                          aria-label={isEs ? 'Editar concepto' : 'Edit item name'}
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          min={0}
                          aria-label={isEs ? 'Editar costo estimado' : 'Edit estimated cost'}
                          value={editEstCost}
                          onChange={(e) => setEditEstCost(Number(e.target.value))}
                          className="ui-input w-24 py-1.5 text-xs font-mono"
                        />
                        <input
                          type="number"
                          min={0}
                          aria-label={isEs ? 'Editar costo real' : 'Edit actual cost'}
                          value={editActCost}
                          onChange={(e) => setEditActCost(Number(e.target.value))}
                          className="ui-input w-24 py-1.5 text-xs font-mono"
                        />
                        <UiButton
                          variant="primary"
                          size="sm"
                          aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                          onClick={() => commitEditBudget(item.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </UiButton>
                        <UiButton
                          variant="ghost"
                          size="sm"
                          aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                          onClick={() => setEditingBudgetId(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </UiButton>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-text-primary block truncate">
                            {item.item}
                          </span>
                          <div className="text-xs text-text-secondary font-mono">
                            {displayCat} • {isEs ? 'Est:' : 'Est:'} {fmtMoney(item.estimatedCost)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono tabular-nums text-sm font-bold text-text-primary">
                            {fmtMoney(item.actualCost)}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditBudget(item)}
                            aria-label={isEs ? `Editar ${item.item}` : `Edit ${item.item}`}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBudgetItems(budgetItems.filter((i) => i.id !== item.id))}
                            aria-label={isEs ? `Eliminar ${item.item}` : `Remove ${item.item}`}
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
      ) : (
        <section className="ui-panel p-5 sm:p-6 space-y-5">
          {guestError && <UiErrorState message={guestError} />}
          <form
            onSubmit={addGuest}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
          >
            <div className="sm:col-span-7">
              <ToolFieldGroup
                label={isEs ? 'Nombre del Invitado / Familia' : 'Guest / Family Name'}
                htmlFor={`${baseId}-gname`}
              >
                <UiInput
                  id={`${baseId}-gname`}
                  type="text"
                  placeholder={isEs ? 'Ej. Familia Miller' : 'e.g. The Miller Family'}
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-3">
              <ToolFieldGroup
                label={isEs ? 'Cantidad de Personas' : 'Party Size'}
                htmlFor={`${baseId}-gsize`}
              >
                <UiInput
                  id={`${baseId}-gsize`}
                  type="number"
                  min={1}
                  value={newPartySize}
                  onChange={(e) => setNewPartySize(Number(e.target.value))}
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

          {guests.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Lista de invitados vacía' : 'No guests in your list'}
              description={
                isEs
                  ? 'Agrega invitados arriba o restaura la lista inicial.'
                  : 'Add guests above or restore the starter guest list.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setGuests(INITIAL_GUESTS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample guests'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {guests.map((guest) => {
                const rsvpTone =
                  guest.rsvp === 'Confirmed'
                    ? 'success'
                    : guest.rsvp === 'Declined'
                    ? 'error'
                    : 'warning';
                const displayRsvp = isEs ? RSVP_ES[guest.rsvp] : guest.rsvp;

                return (
                  <div
                    key={guest.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                  >
                    {editingGuestId === guest.id ? (
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <input
                          type="text"
                          aria-label={isEs ? 'Editar nombre del invitado' : 'Edit guest name'}
                          value={editGuestName}
                          onChange={(e) => setEditGuestName(e.target.value)}
                          className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          min={1}
                          aria-label={isEs ? 'Editar personas' : 'Edit party size'}
                          value={editPartySize}
                          onChange={(e) => setEditPartySize(Number(e.target.value))}
                          className="ui-input w-20 py-1.5 text-xs font-mono"
                        />
                        <select
                          aria-label={isEs ? 'Editar confirmación' : 'Edit RSVP status'}
                          value={editRsvp}
                          onChange={(e) => setEditRsvp(e.target.value as Guest['rsvp'])}
                          className="ui-select w-32 py-1.5 text-xs"
                        >
                          <option value="Confirmed">{isEs ? 'Confirmado' : 'Confirmed'}</option>
                          <option value="Pending">{isEs ? 'Pendiente' : 'Pending'}</option>
                          <option value="Declined">{isEs ? 'Declinó' : 'Declined'}</option>
                        </select>
                        <input
                          type="text"
                          aria-label={isEs ? 'Editar mesa' : 'Edit table'}
                          value={editTable}
                          onChange={(e) => setEditTable(e.target.value)}
                          className="ui-input w-28 py-1.5 text-xs"
                        />
                        <UiButton
                          variant="primary"
                          size="sm"
                          aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                          onClick={() => commitEditGuest(guest.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </UiButton>
                        <UiButton
                          variant="ghost"
                          size="sm"
                          aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                          onClick={() => setEditingGuestId(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </UiButton>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-text-primary block truncate">
                            {guest.name}
                          </span>
                          <div className="text-xs text-text-secondary">
                            {guest.partySize} {isEs ? 'personas' : 'guests'} • {guest.tableNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <UiStatusLabel tone={rsvpTone}>{displayRsvp}</UiStatusLabel>
                          <button
                            type="button"
                            onClick={() => startEditGuest(guest)}
                            aria-label={isEs ? `Editar ${guest.name}` : `Edit ${guest.name}`}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuests(guests.filter((g) => g.id !== guest.id))}
                            aria-label={isEs ? `Eliminar ${guest.name}` : `Remove ${guest.name}`}
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
      )}
    </div>
  );
}
