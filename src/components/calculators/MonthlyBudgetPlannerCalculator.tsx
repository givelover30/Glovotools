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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
}

const STORAGE_KEY = 'calctools_monthly_budget';

const DEFAULT_INCOMES: BudgetItem[] = [
  { id: '1', name: 'Salary / Wages', amount: 4500 },
  { id: '2', name: 'Freelance / Side Gig', amount: 800 }
];

const DEFAULT_EXPENSES: BudgetItem[] = [
  { id: '1', name: 'Rent / Mortgage', amount: 1500 },
  { id: '2', name: 'Groceries & Food', amount: 600 },
  { id: '3', name: 'Utilities & Internet', amount: 250 },
  { id: '4', name: 'Transportation / Gas', amount: 300 },
  { id: '5', name: 'Entertainment', amount: 200 }
];

const DEFAULT_SAVINGS_TARGET = 1000;

export default function MonthlyBudgetPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtAuto = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  const [incomes, setIncomes] = useState<BudgetItem[]>(DEFAULT_INCOMES);
  const [expenses, setExpenses] = useState<BudgetItem[]>(DEFAULT_EXPENSES);
  const [savingsTarget, setSavingsTarget] = useState<number>(DEFAULT_SAVINGS_TARGET);

  const [newIncName, setNewIncName] = useState('');
  const [newIncAmount, setNewIncAmount] = useState('');
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  const [incError, setIncError] = useState('');
  const [expError, setExpError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editIncName, setEditIncName] = useState('');
  const [editIncAmount, setEditIncAmount] = useState('');

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpName, setEditExpName] = useState('');
  const [editExpAmount, setEditExpAmount] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
          if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
          if (parsed.savingsTarget !== undefined && Number.isFinite(Number(parsed.savingsTarget))) {
            setSavingsTarget(Number(parsed.savingsTarget));
          }
        }
      } catch {
        // Ignore malformed saved JSON
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ incomes, expenses, savingsTarget })
    );
    setSavedStatus(true);
    window.setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleReset = () => {
    setIncomes(DEFAULT_INCOMES);
    setExpenses(DEFAULT_EXPENSES);
    setSavingsTarget(DEFAULT_SAVINGS_TARGET);
    setIncError('');
    setExpError('');
    setEditingIncomeId(null);
    setEditingExpenseId(null);
  };

  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netBalance = totalIncome - (totalExpenses + (Number(savingsTarget) || 0));

  const addIncome = () => {
    const trimmed = newIncName.trim();
    const num = Number(newIncAmount);
    if (!trimmed) {
      setIncError(isEs ? 'Ingresa el nombre del ingreso.' : 'Please enter an income source name.');
      return;
    }
    if (!Number.isFinite(num) || num <= 0) {
      setIncError(isEs ? 'Ingresa un monto positivo.' : 'Please enter a positive amount.');
      return;
    }
    setIncError('');
    setIncomes([...incomes, { id: Date.now().toString(), name: trimmed, amount: num }]);
    setNewIncName('');
    setNewIncAmount('');
  };

  const addExpense = () => {
    const trimmed = newExpName.trim();
    const num = Number(newExpAmount);
    if (!trimmed) {
      setExpError(isEs ? 'Ingresa el nombre del gasto.' : 'Please enter an expense name.');
      return;
    }
    if (!Number.isFinite(num) || num <= 0) {
      setExpError(isEs ? 'Ingresa un monto positivo.' : 'Please enter a positive amount.');
      return;
    }
    setExpError('');
    setExpenses([...expenses, { id: Date.now().toString(), name: trimmed, amount: num }]);
    setNewExpName('');
    setNewExpAmount('');
  };

  const startEditIncome = (item: BudgetItem) => {
    setEditingIncomeId(item.id);
    setEditIncName(item.name);
    setEditIncAmount(String(item.amount));
  };

  const commitEditIncome = (id: string) => {
    const trimmed = editIncName.trim();
    const num = Number(editIncAmount);
    if (!trimmed || !Number.isFinite(num) || num < 0) return;
    setIncomes(incomes.map((i) => (i.id === id ? { ...i, name: trimmed, amount: num } : i)));
    setEditingIncomeId(null);
  };

  const startEditExpense = (item: BudgetItem) => {
    setEditingExpenseId(item.id);
    setEditExpName(item.name);
    setEditExpAmount(String(item.amount));
  };

  const commitEditExpense = (id: string) => {
    const trimmed = editExpName.trim();
    const num = Number(editExpAmount);
    if (!trimmed || !Number.isFinite(num) || num < 0) return;
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, name: trimmed, amount: num } : e)));
    setEditingExpenseId(null);
  };

  const removeIncome = (id: string) => setIncomes(incomes.filter((i) => i.id !== id));
  const removeExpense = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  const handleDownload = () => {
    const data = { incomes, expenses, savingsTarget, totalIncome, totalExpenses, netBalance };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-budget-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savingsInvalid = !Number.isFinite(savingsTarget) || savingsTarget < 0;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Unified Planner Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Presupuesto Mensual' : 'Monthly Budget & Cash Flow'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Controla ingresos, gastos fijos y meta de ahorro mensual'
                : 'Track income streams, monthly expenses, and savings target'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">
              {isEs ? 'Guardado en navegador' : 'Saved locally'}
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
          <UiButton variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Ingresos Totales' : 'Total Income'}
          value={fmtAuto(totalIncome)}
          hint={`${incomes.length} ${isEs ? 'fuentes' : 'streams'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Gastos Totales' : 'Total Expenses'}
          value={fmtAuto(totalExpenses)}
          hint={`${expenses.length} ${isEs ? 'partidas' : 'items'}`}
        />
        <div className="rounded-xl border border-border-subtle bg-surface-secondary/70 dark:bg-surface-elevated/60 p-3.5 space-y-1.5">
          <label htmlFor={`${baseId}-savings`} className="block text-xs text-text-secondary">
            {isEs ? `Meta de Ahorro (${currencyMeta.symbol})` : `Savings Target (${currencyMeta.symbol})`}
          </label>
          <UiInput
            id={`${baseId}-savings`}
            type="number"
            min={0}
            value={Number.isNaN(savingsTarget) ? '' : savingsTarget}
            onChange={(e) => setSavingsTarget(Math.max(0, Number(e.target.value)))}
            className="font-mono font-bold h-9 py-1 text-sm"
            error={savingsInvalid ? (isEs ? 'Monto inválido' : 'Invalid amount') : undefined}
          />
        </div>
        <ToolMetricTile
          label={isEs ? 'Balance Neto' : 'Net Cash Flow'}
          value={fmtAuto(netBalance)}
          hint={
            netBalance >= 0
              ? isEs
                ? 'Superávit mensual'
                : 'Monthly surplus'
              : isEs
              ? 'Déficit mensual'
              : 'Monthly deficit'
          }
          accent={netBalance >= 0}
        />
      </div>

      {netBalance < 0 && (
        <UiErrorState
          message={
            isEs
              ? 'Tus gastos y meta de ahorro superan tus ingresos actuales.'
              : 'Your expenses and savings target exceed your current monthly income.'
          }
        />
      )}

      {/* Incomes & Expenses Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Income Streams */}
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Fuentes de Ingresos' : 'Income Streams'}
            </h3>
            <UiStatusLabel tone="success">{fmtAuto(totalIncome)}</UiStatusLabel>
          </div>

          {incomes.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin ingresos registrados' : 'No income streams yet'}
              description={
                isEs
                  ? 'Agrega un salario o ingreso adicional abajo para calcular tu flujo neto.'
                  : 'Add a salary or side income below to calculate your net cash flow.'
              }
            />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {incomes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingIncomeId === item.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nombre de ingreso' : 'Edit income name'}
                        value={editIncName}
                        onChange={(e) => setEditIncName(e.target.value)}
                        className="ui-input flex-1 min-w-[120px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar monto de ingreso' : 'Edit income amount'}
                        value={editIncAmount}
                        onChange={(e) => setEditIncAmount(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEditIncome(item.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                        onClick={() => setEditingIncomeId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-text-primary truncate min-w-0">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-status-success">
                          {fmtAuto(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditIncome(item)}
                          aria-label={isEs ? `Editar ${item.name}` : `Edit ${item.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeIncome(item.id)}
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

          <div className="pt-3 border-t border-border-subtle space-y-2.5">
            {incError && <UiErrorState message={incError} />}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6">
                <ToolFieldGroup
                  label={isEs ? 'Nombre del ingreso' : 'Income name'}
                  htmlFor={`${baseId}-inc-name`}
                >
                  <UiInput
                    id={`${baseId}-inc-name`}
                    type="text"
                    placeholder={isEs ? 'Ej. Salario o bono' : 'e.g. Salary or bonus'}
                    value={newIncName}
                    onChange={(e) => setNewIncName(e.target.value)}
                  />
                </ToolFieldGroup>
              </div>
              <div className="sm:col-span-4">
                <ToolFieldGroup
                  label={isEs ? `Monto (${currencyMeta.symbol})` : `Amount (${currencyMeta.symbol})`}
                  htmlFor={`${baseId}-inc-amount`}
                >
                  <UiInput
                    id={`${baseId}-inc-amount`}
                    type="number"
                    min={0}
                    placeholder="1000"
                    value={newIncAmount}
                    onChange={(e) => setNewIncAmount(e.target.value)}
                    className="font-mono"
                  />
                </ToolFieldGroup>
              </div>
              <div className="sm:col-span-2">
                <UiButton
                  variant="primary"
                  onClick={addIncome}
                  aria-label={isEs ? 'Agregar ingreso' : 'Add Income'}
                  className="w-full"
                >
                  <Plus className="w-4 h-4" />
                  <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
                </UiButton>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Expenses */}
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Gastos Mensuales' : 'Monthly Expenses'}
            </h3>
            <UiStatusLabel tone="warning">{fmtAuto(totalExpenses)}</UiStatusLabel>
          </div>

          {expenses.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'Sin gastos registrados' : 'No monthly expenses yet'}
              description={
                isEs
                  ? 'Agrega alquiler, comida o servicios abajo para completar tu presupuesto.'
                  : 'Add rent, groceries, or utilities below to complete your budget.'
              }
            />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {expenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingExpenseId === item.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nombre de gasto' : 'Edit expense name'}
                        value={editExpName}
                        onChange={(e) => setEditExpName(e.target.value)}
                        className="ui-input flex-1 min-w-[120px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar monto de gasto' : 'Edit expense amount'}
                        value={editExpAmount}
                        onChange={(e) => setEditExpAmount(e.target.value)}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEditExpense(item.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </UiButton>
                      <UiButton
                        variant="ghost"
                        size="sm"
                        aria-label={isEs ? 'Cancelar edición' : 'Cancel edit'}
                        onClick={() => setEditingExpenseId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </UiButton>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-text-primary truncate min-w-0">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-status-error">
                          {fmtAuto(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditExpense(item)}
                          aria-label={isEs ? `Editar ${item.name}` : `Edit ${item.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExpense(item.id)}
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

          <div className="pt-3 border-t border-border-subtle space-y-2.5">
            {expError && <UiErrorState message={expError} />}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6">
                <ToolFieldGroup
                  label={isEs ? 'Nombre del gasto' : 'Expense name'}
                  htmlFor={`${baseId}-exp-name`}
                >
                  <UiInput
                    id={`${baseId}-exp-name`}
                    type="text"
                    placeholder={isEs ? 'Ej. Renta o transporte' : 'e.g. Rent or transit'}
                    value={newExpName}
                    onChange={(e) => setNewExpName(e.target.value)}
                  />
                </ToolFieldGroup>
              </div>
              <div className="sm:col-span-4">
                <ToolFieldGroup
                  label={isEs ? `Monto (${currencyMeta.symbol})` : `Amount (${currencyMeta.symbol})`}
                  htmlFor={`${baseId}-exp-amount`}
                >
                  <UiInput
                    id={`${baseId}-exp-amount`}
                    type="number"
                    min={0}
                    placeholder="250"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="font-mono"
                  />
                </ToolFieldGroup>
              </div>
              <div className="sm:col-span-2">
                <UiButton
                  variant="primary"
                  onClick={addExpense}
                  aria-label={isEs ? 'Agregar gasto' : 'Add Expense'}
                  className="w-full"
                >
                  <Plus className="w-4 h-4" />
                  <span className="sm:sr-only">{isEs ? 'Agregar' : 'Add'}</span>
                </UiButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
