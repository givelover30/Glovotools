import { useState, useMemo, useId } from 'react';
import {
  Home,
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
import {
  UiButton,
  UiInput,
  UiSelect,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface RenoItem {
  id: string;
  room: string;
  task: string;
  budget: number;
  spent: number;
  status: 'Planned' | 'In Progress' | 'Completed';
}

const INITIAL_ITEMS: RenoItem[] = [
  { id: '1', room: 'Kitchen', task: 'Cabinet Refacing & Countertops', budget: 4500, spent: 4200, status: 'In Progress' },
  { id: '2', room: 'Bathroom', task: 'New Tile Flooring & Vanity', budget: 2500, spent: 2650, status: 'Completed' },
  { id: '3', room: 'Living Room', task: 'Hardwood Floor Sanding & Paint', budget: 3000, spent: 0, status: 'Planned' }
];

const ROOMS = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Exterior', 'Basement'];

const ROOM_ES: Record<string, string> = {
  Kitchen: 'Cocina',
  Bathroom: 'Baño',
  'Living Room': 'Sala de Estar',
  Bedroom: 'Dormitorio',
  Exterior: 'Exterior / Techo',
  Basement: 'Sótano'
};

const STATUS_ES: Record<RenoItem['status'], string> = {
  Planned: 'Planeado',
  'In Progress': 'En progreso',
  Completed: 'Completado'
};

export default function HomeRenovationPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';
  const baseId = useId();

  const [items, setItems] = useState<RenoItem[]>(INITIAL_ITEMS);
  const [newRoom, setNewRoom] = useState('Kitchen');
  const [newTask, setNewTask] = useState('');
  const [newBudget, setNewBudget] = useState(1000);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editBudget, setEditBudget] = useState(0);
  const [editSpent, setEditSpent] = useState(0);
  const [editStatus, setEditStatus] = useState<RenoItem['status']>('Planned');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa una tarea de renovación.' : 'Please enter a renovation task.');
      return;
    }
    if (!Number.isFinite(newBudget) || newBudget < 0) {
      setFormError(isEs ? 'El presupuesto no puede ser negativo.' : 'Budget cannot be negative.');
      return;
    }
    setFormError('');
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        room: newRoom,
        task: trimmed,
        budget: Number(newBudget) || 0,
        spent: 0,
        status: 'Planned'
      }
    ]);
    setNewTask('');
  };

  const startEdit = (item: RenoItem) => {
    setEditingId(item.id);
    setEditTask(item.task);
    setEditBudget(item.budget);
    setEditSpent(item.spent);
    setEditStatus(item.status);
  };

  const commitEdit = (id: string) => {
    const trimmed = editTask.trim();
    if (!trimmed || editBudget < 0 || editSpent < 0) return;
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              task: trimmed,
              budget: Number(editBudget),
              spent: Number(editSpent),
              status: editStatus
            }
          : i
      )
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    const totalBudget = items.reduce((acc, i) => acc + i.budget, 0);
    const totalSpent = items.reduce((acc, i) => acc + i.spent, 0);
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
  }, [items]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'home_renovation.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Renovación del Hogar' : 'Home Renovation Budget & Scope Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Controla obras por habitación, presupuesto asignado y gasto real'
                : 'Track remodeling tasks by room, allocated budget, and actual spend'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Renovación (JSON)' : 'Export Renovation Plan (JSON)'}</span>
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
          label={isEs ? 'Presupuesto Total de Renovación' : 'Total Renovation Budget'}
          value={fmtMoney(summary.totalBudget)}
          hint={`${items.length} ${isEs ? 'proyectos' : 'projects'}`}
        />
        <ToolMetricTile
          label={isEs ? 'Gastos Acumulados' : 'Total Spent'}
          value={fmtMoney(summary.totalSpent)}
          hint={isEs ? 'ejecutado hasta hoy' : 'spent to date'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Saldo Disponible' : 'Remaining Budget'}
          value={fmtMoney(summary.remaining)}
          hint={
            summary.remaining >= 0
              ? isEs
                ? 'margen restante'
                : 'remaining headroom'
              : isEs
              ? 'sobrepresupuesto'
              : 'over budget'
          }
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form
          onSubmit={addItem}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Área / Habitación' : 'Room / Area'} htmlFor={`${baseId}-room`}>
              <UiSelect
                id={`${baseId}-room`}
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {isEs ? ROOM_ES[r] || r : r}
                  </option>
                ))}
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Proyecto o Tarea' : 'Renovation Task'} htmlFor={`${baseId}-task`}>
              <UiInput
                id={`${baseId}-task`}
                type="text"
                placeholder={isEs ? 'Ej. Instalar ventanas nuevas' : 'e.g. Install new windows'}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Presupuesto (${currencyMeta.symbol})` : `Budget (${currencyMeta.symbol})`} htmlFor={`${baseId}-budget`}>
              <UiInput
                id={`${baseId}-budget`}
                type="number"
                min={0}
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
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

        {items.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'No hay proyectos de renovación' : 'No renovation items yet'}
            description={
              isEs
                ? 'Agrega una habitación arriba o restaura el plan inicial.'
                : 'Add a renovation task above or restore the starter remodel plan.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setItems(INITIAL_ITEMS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample plan'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const displayRoom = isEs ? ROOM_ES[item.room] || item.room : item.room;
              const displayStatus = isEs ? STATUS_ES[item.status] : item.status;
              const statusTone =
                item.status === 'Completed'
                  ? 'success'
                  : item.status === 'In Progress'
                  ? 'accent'
                  : 'neutral';

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === item.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar tarea' : 'Edit task'}
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar presupuesto' : 'Edit budget'}
                        value={editBudget}
                        onChange={(e) => setEditBudget(Number(e.target.value))}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar gasto' : 'Edit spent'}
                        value={editSpent}
                        onChange={(e) => setEditSpent(Number(e.target.value))}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <select
                        aria-label={isEs ? 'Editar estado' : 'Edit status'}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as RenoItem['status'])}
                        className="ui-select w-32 py-1.5 text-xs"
                      >
                        <option value="Planned">{isEs ? 'Planeado' : 'Planned'}</option>
                        <option value="In Progress">{isEs ? 'En progreso' : 'In Progress'}</option>
                        <option value="Completed">{isEs ? 'Completado' : 'Completed'}</option>
                      </select>
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
                        <span className="font-semibold text-sm text-text-primary block truncate">
                          {item.task}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {displayRoom} • {isEs ? 'Est:' : 'Est:'} {fmtMoney(item.budget)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <UiStatusLabel tone={statusTone}>{displayStatus}</UiStatusLabel>
                        <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
                          {isEs ? 'Gastado:' : 'Spent:'} {fmtMoney(item.spent)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          aria-label={isEs ? `Editar ${item.task}` : `Edit ${item.task}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                          aria-label={isEs ? `Eliminar ${item.task}` : `Remove ${item.task}`}
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
