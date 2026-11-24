import { useState, useMemo, useId } from 'react';
import {
  FileText,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

const INITIAL_BILLS: Bill[] = [
  { id: '1', name: 'Electric Utility', amount: 124.5, dueDate: '2026-11-18', paid: false },
  { id: '2', name: 'High-Speed Internet', amount: 79.99, dueDate: '2026-11-22', paid: true },
  { id: '3', name: 'Car Insurance', amount: 145.0, dueDate: '2026-11-28', paid: false }
];

export default function BillDueDateTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('50');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('0');
  const [editDate, setEditDate] = useState('');

  const addBill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la factura.' : 'Please enter a bill name.');
      return;
    }
    setFormError('');
    setBills((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: trimmed,
        amount: Math.max(0, Number(amount) || 0),
        dueDate,
        paid: false
      }
    ]);
    setName('');
  };

  const startEdit = (bill: Bill) => {
    setEditingId(bill.id);
    setEditName(bill.name);
    setEditAmount(String(bill.amount));
    setEditDate(bill.dueDate);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setBills((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, name: trimmed, amount: Math.max(0, Number(editAmount) || 0), dueDate: editDate }
          : b
      )
    );
    setEditingId(null);
  };

  const summary = useMemo(() => {
    const totalUnpaid = bills.filter((b) => !b.paid).reduce((acc, b) => acc + b.amount, 0);
    const totalPaid = bills.filter((b) => b.paid).reduce((acc, b) => acc + b.amount, 0);
    return { totalUnpaid, totalPaid };
  }, [bills]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(bills, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bills.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Vencimiento de Facturas' : 'Bill Due Date & Payment Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Organiza recibos por vencer y marca los ya pagados' : 'Track upcoming bills, due dates, and paid balances'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Facturas (JSON)' : 'Export Bills (JSON)'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={() => setBills(INITIAL_BILLS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ToolMetricTile
          label={isEs ? 'Facturas Pendientes' : 'Total Unpaid Bills'}
          value={formatCurrency(summary.totalUnpaid)}
          hint={isEs ? 'saldo por pagar' : 'remaining balance'}
        />
        <ToolMetricTile
          label={isEs ? 'Facturas Pagadas' : 'Total Paid Bills'}
          value={formatCurrency(summary.totalPaid)}
          hint={isEs ? 'liquidadas' : 'settled total'}
          accent
        />
      </div>

      {/* Form & List */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addBill} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-5">
            <ToolFieldGroup label={isEs ? 'Nombre de la Factura' : 'Bill Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Servicio de agua' : 'e.g. Water Utility'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? `Monto (${currencyMeta.symbol})` : `Amount (${currencyMeta.symbol})`} htmlFor={`${baseId}-amt`}>
              <UiInput
                id={`${baseId}-amt`}
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Fecha de Vencimiento' : 'Due Date'} htmlFor={`${baseId}-date`}>
              <UiInput
                id={`${baseId}-date`}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <UiButton type="submit" variant="primary" className="w-full" aria-label={isEs ? 'Añadir factura' : 'Add bill'}>
              <Plus className="w-4 h-4" />
            </UiButton>
          </div>
        </form>

        {bills.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin facturas registradas' : 'No bills tracked'}
            description={
              isEs
                ? 'Agrega una factura arriba o restaura los recibos de ejemplo.'
                : 'Add a bill above or restore sample bills.'
            }
            action={
              <UiButton variant="secondary" size="sm" onClick={() => setBills(INITIAL_BILLS)}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample bills'}
              </UiButton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
              >
                {editingId === bill.id ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input
                      type="text"
                      aria-label={isEs ? 'Editar factura' : 'Edit bill'}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="ui-input flex-1 min-w-[140px] py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      aria-label={isEs ? 'Editar monto' : 'Edit amount'}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="ui-input w-24 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="date"
                      aria-label={isEs ? 'Editar vencimiento' : 'Edit due date'}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="ui-input w-36 py-1.5 text-xs font-mono"
                    />
                    <UiButton variant="primary" size="sm" aria-label={isEs ? 'Confirmar' : 'Confirm'} onClick={() => commitEdit(bill.id)}>
                      <Check className="w-3.5 h-3.5" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" aria-label={isEs ? 'Cancelar' : 'Cancel'} onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" />
                    </UiButton>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={bill.paid}
                        onChange={(e) =>
                          setBills((prev) =>
                            prev.map((b) => (b.id === bill.id ? { ...b, paid: e.target.checked } : b))
                          )
                        }
                        aria-label={bill.name}
                        className="w-4 h-4 accent-[#159B69] dark:accent-[#10B981] rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <span
                          className={`font-semibold text-sm block truncate ${
                            bill.paid ? 'line-through text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {bill.name}
                        </span>
                        <div className="text-xs text-text-secondary font-mono">
                          {isEs ? 'Vence:' : 'Due:'} {bill.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <UiStatusLabel tone={bill.paid ? 'success' : 'warning'}>
                        {bill.paid ? (isEs ? 'Pagada' : 'Paid') : (isEs ? 'Pendiente' : 'Due')}
                      </UiStatusLabel>
                      <span className="font-mono tabular-nums text-sm font-bold text-text-primary">
                        {formatCurrency(bill.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(bill)}
                        aria-label={isEs ? `Editar ${bill.name}` : `Edit ${bill.name}`}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBills((prev) => prev.filter((b) => b.id !== bill.id))}
                        aria-label={isEs ? `Eliminar ${bill.name}` : `Remove ${bill.name}`}
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
