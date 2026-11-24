import { useState, useEffect, useId } from 'react';
import {
  Wallet,
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
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface FinanceLog {
  id: string;
  date: string;
  type: 'deposit' | 'expense';
  category: string;
  amount: number;
  note: string;
}

const INITIAL_FINANCES: FinanceLog[] = [
  { id: '1', date: '2026-11-01', type: 'deposit', category: 'Salary', amount: 5000, note: 'Monthly Paycheck' },
  { id: '2', date: '2026-11-03', type: 'expense', category: 'Rent', amount: 1500, note: 'November Rent' },
  { id: '3', date: '2026-11-05', type: 'expense', category: 'Groceries', amount: 250, note: 'Supermarket haul' },
  { id: '4', date: '2026-11-10', type: 'deposit', category: 'Savings Deposit', amount: 800, note: 'Monthly savings transfer' }
];

const STORAGE_KEY = 'calctools_expense_savings_tracker';

export default function ExpenseSavingsTrackerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtAuto = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  const [logs, setLogs] = useState<FinanceLog[]>(INITIAL_FINANCES);
  const [type, setType] = useState<'deposit' | 'expense'>('expense');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('100');
  const [note, setNote] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'deposit' | 'expense'>('expense');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('0');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setLogs(parsed);
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 0) {
      setFormError(isEs ? 'Ingresa un monto válido mayor o igual a 0.' : 'Please enter a valid non-negative amount.');
      return;
    }
    setFormError('');
    setLogs((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type,
        category: category.trim() || 'General',
        amount: numericAmount,
        note: note.trim() || category.trim() || 'Transaction'
      },
      ...prev
    ]);
    setAmount('100');
    setNote('');
  };

  const removeLog = (id: string) => setLogs((prev) => prev.filter((l) => l.id !== id));

  const startEdit = (item: FinanceLog) => {
    setEditingId(item.id);
    setEditType(item.type);
    setEditCategory(item.category);
    setEditAmount(String(item.amount));
    setEditNote(item.note);
  };

  const commitEdit = (id: string) => {
    const nextAmount = Math.max(0, Number(editAmount) || 0);
    setLogs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              type: editType,
              category: editCategory.trim() || l.category,
              amount: nextAmount,
              note: editNote.trim() || editCategory.trim() || l.note
            }
          : l
      )
    );
    setEditingId(null);
  };

  const totalDeposits = logs.filter((l) => l.type === 'deposit').reduce((sum, l) => sum + l.amount, 0);
  const totalExpenses = logs.filter((l) => l.type === 'expense').reduce((sum, l) => sum + l.amount, 0);
  const netBalance = totalDeposits - totalExpenses;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-savings-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Rastreador de Gastos y Ahorros' : 'Expense & Savings Growth Tracker'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Controla ingresos, egresos y saldo neto acumulado' : 'Monitor deposits, expenses, and net cash balance'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <UiButton variant="ghost" size="sm" onClick={() => setLogs(INITIAL_FINANCES)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Total Ingresos / Depósitos' : 'Total Deposits'}
          value={fmtAuto(totalDeposits)}
          hint={isEs ? 'entradas registradas' : 'recorded inflows'}
        />
        <ToolMetricTile
          label={isEs ? 'Total Gastos' : 'Total Expenses'}
          value={fmtAuto(totalExpenses)}
          hint={isEs ? 'egresos registrados' : 'recorded outflows'}
        />
        <ToolMetricTile
          label={isEs ? 'Balance Neto' : 'Net Balance'}
          value={fmtAuto(netBalance)}
          hint={isEs ? 'depósitos menos gastos' : 'deposits minus expenses'}
          accent
        />
      </div>

      {/* Add & List Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addLog} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Tipo' : 'Type'} htmlFor={`${baseId}-type`}>
              <UiSelect
                id={`${baseId}-type`}
                value={type}
                onChange={(e) => setType(e.target.value as 'deposit' | 'expense')}
              >
                <option value="expense">{isEs ? 'Gasto' : 'Expense'}</option>
                <option value="deposit">{isEs ? 'Depósito / Ahorro' : 'Deposit / Savings'}</option>
              </UiSelect>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Categoría' : 'Category'} htmlFor={`${baseId}-cat`}>
              <UiInput
                id={`${baseId}-cat`}
                type="text"
                placeholder={isEs ? 'Ej. Comida' : 'Category'}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Monto (${currencyMeta.symbol})` : `Amount (${currencyMeta.symbol})`} htmlFor={`${baseId}-amt`}>
              <UiInput
                id={`${baseId}-amt`}
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Nota (opcional)' : 'Note (optional)'} htmlFor={`${baseId}-note`}>
              <UiInput
                id={`${baseId}-note`}
                type="text"
                placeholder={isEs ? 'Detalle' : 'Note (optional)'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Agregar' : 'Add'}</span>
            </UiButton>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Historial Financiero' : 'Transaction History'}
            </h3>
            <span className="text-xs font-mono text-text-tertiary">{logs.length}</span>
          </div>

          {logs.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin transacciones registradas' : 'No transactions logged yet'}
              description={
                isEs
                  ? 'Agrega un gasto o depósito arriba o restaura los ejemplos iniciales.'
                  : 'Log an expense or deposit above or restore starter entries.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setLogs(INITIAL_FINANCES)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample logs'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === l.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      <select
                        aria-label={isEs ? 'Editar tipo' : 'Edit type'}
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as 'deposit' | 'expense')}
                        className="ui-select w-32 py-1.5 text-xs"
                      >
                        <option value="expense">{isEs ? 'Gasto' : 'Expense'}</option>
                        <option value="deposit">{isEs ? 'Depósito' : 'Deposit'}</option>
                      </select>
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar categoría' : 'Edit category'}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="ui-input w-32 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nota' : 'Edit note'}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
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
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar' : 'Confirm'}
                        onClick={() => commitEdit(l.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar' : 'Cancel'}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs text-text-secondary shrink-0">
                          {l.date}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-text-primary block truncate">
                            {l.note}
                          </span>
                          <span className="text-[11px] text-text-tertiary uppercase tracking-wide">
                            {l.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono tabular-nums text-xs font-bold ${
                            l.type === 'deposit' ? 'text-status-success' : 'text-status-error'
                          }`}
                        >
                          {l.type === 'deposit' ? '+' : '-'}{fmtAuto(l.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(l)}
                          aria-label={isEs ? `Editar ${l.note}` : `Edit ${l.note}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLog(l.id)}
                          aria-label={isEs ? `Eliminar ${l.note}` : `Remove ${l.note}`}
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
        </div>
      </section>
    </div>
  );
}
