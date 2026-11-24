import { useState, useMemo, useId } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Download,
  ShieldAlert,
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
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

const INITIAL_DEBTS: DebtItem[] = [
  { id: '1', name: 'Credit Card A', balance: 3500, interestRate: 19.99, minPayment: 100 },
  { id: '2', name: 'Car Loan', balance: 12000, interestRate: 6.5, minPayment: 320 },
  { id: '3', name: 'Student Loan', balance: 18500, interestRate: 4.8, minPayment: 210 }
];

export default function DebtRepaymentPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtAuto = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);
  const [extraPayment, setExtraPayment] = useState<number>(250);
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState(2000);
  const [newRate, setNewRate] = useState(15.0);
  const [newMin, setNewMin] = useState(75);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState(0);
  const [editRate, setEditRate] = useState(0);
  const [editMin, setEditMin] = useState(0);

  const addDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la deuda.' : 'Please enter a debt name.');
      return;
    }
    if (newBalance < 0 || newRate < 0 || newMin < 0) {
      setFormError(
        isEs
          ? 'El saldo, APR y pago mínimo no pueden ser negativos.'
          : 'Balance, APR, and minimum payment cannot be negative.'
      );
      return;
    }
    setFormError('');
    setDebts([
      ...debts,
      {
        id: Date.now().toString(),
        name: trimmed,
        balance: Number(newBalance) || 0,
        interestRate: Number(newRate) || 0,
        minPayment: Number(newMin) || 0
      }
    ]);
    setNewName('');
  };

  const startEdit = (d: DebtItem) => {
    setEditingId(d.id);
    setEditName(d.name);
    setEditBalance(d.balance);
    setEditRate(d.interestRate);
    setEditMin(d.minPayment);
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed || editBalance < 0 || editRate < 0 || editMin < 0) return;
    setDebts(
      debts.map((d) =>
        d.id === id
          ? {
              ...d,
              name: trimmed,
              balance: Number(editBalance),
              interestRate: Number(editRate),
              minPayment: Number(editMin)
            }
          : d
      )
    );
    setEditingId(null);
  };

  const totals = useMemo(() => {
    const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);
    const totalMin = debts.reduce((acc, d) => acc + d.minPayment, 0);
    const monthlyBudget = totalMin + Math.max(0, Number(extraPayment) || 0);
    return { totalBalance, totalMin, monthlyBudget };
  }, [debts, extraPayment]);

  const sortedDebts = useMemo(() => {
    const list = [...debts];
    if (strategy === 'avalanche') {
      list.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      list.sort((a, b) => a.balance - b.balance);
    }
    return list;
  }, [debts, strategy]);

  const handleExportJson = () => {
    const data = { strategy, extraPayment, debts: sortedDebts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'debt_repayment_plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const strategyLabel =
    strategy === 'avalanche'
      ? isEs
        ? 'Avalancha'
        : 'Avalanche'
      : isEs
      ? 'Bola de Nieve'
      : 'Snowball';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Financial Disclaimer */}
      <div
        role="note"
        className="p-4 rounded-xl bg-status-warning-bg border border-border-main text-status-warning text-xs flex items-start gap-3"
      >
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">
            {isEs ? 'Aviso Financiero:' : 'Financial Disclaimer:'}
          </span>{' '}
          {isEs
            ? 'Los cálculos de amortización de deudas son estimaciones basadas en tasas constantes. Los resultados reales pueden variar según los cargos de interés diarios y términos de los prestamistas.'
            : 'Debt amortization calculations are estimates based on constant interest rates. Actual results may vary based on compounding frequency and lender terms.'}
        </div>
      </div>

      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Pago de Deudas' : 'Debt Repayment Strategy Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs
                ? 'Prioriza tus cuentas con el método Avalancha o Bola de Nieve'
                : 'Prioritize balances with Debt Avalanche or Debt Snowball ordering'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
            <Download className="w-3.5 h-3.5" />
            <span>{isEs ? 'Exportar Plan de Deuda (JSON)' : 'Export Debt Plan (JSON)'}</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setDebts(INITIAL_DEBTS)}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ToolMetricTile
          label={isEs ? 'Deuda Total Pendiente' : 'Total Outstanding Debt'}
          value={fmtAuto(totals.totalBalance)}
          hint={`${debts.length} ${isEs ? 'cuentas' : 'accounts'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Pagos Mínimos Mensuales' : 'Total Monthly Minimums'}
          value={fmtAuto(totals.totalMin)}
          hint={isEs ? 'compromiso base' : 'required monthly'}
        />
        <ToolMetricTile
          label={isEs ? 'Pago Mensual Total' : 'Total Monthly Payment'}
          value={fmtAuto(totals.monthlyBudget)}
          hint={`${isEs ? 'incluye' : 'includes'} ${fmtAuto(Math.max(0, Number(extraPayment) || 0))} ${isEs ? 'extra' : 'extra'}`}
        />
      </div>

      {/* Strategy + Debts Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-7 space-y-1.5">
            <span className="ui-label block">
              {isEs ? 'Estrategia de Pago' : 'Repayment Strategy'}
            </span>
            <ToolSegmentedControl
              ariaLabel={isEs ? 'Estrategia de pago' : 'Repayment strategy'}
              value={strategy}
              onChange={setStrategy}
              options={[
                {
                  value: 'avalanche',
                  label: isEs ? 'Avalancha (Mayor APR)' : 'Avalanche (Highest APR)'
                },
                {
                  value: 'snowball',
                  label: isEs ? 'Bola de Nieve (Menor Saldo)' : 'Snowball (Lowest Balance)'
                }
              ]}
            />
          </div>
          <div className="sm:col-span-5">
            <ToolFieldGroup
              label={isEs ? `Pago Extra Mensual (${currencyMeta.symbol})` : `Extra Monthly Payment (${currencyMeta.symbol})`}
              htmlFor={`${baseId}-extra`}
            >
              <UiInput
                id={`${baseId}-extra`}
                type="number"
                min={0}
                value={extraPayment}
                onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                className="font-mono font-bold"
              />
            </ToolFieldGroup>
          </div>
        </div>

        {formError && <UiErrorState message={formError} />}

        <form
          onSubmit={addDebt}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
        >
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre de la Deuda' : 'Debt Name'} htmlFor={`${baseId}-name`}>
              <UiInput
                id={`${baseId}-name`}
                type="text"
                placeholder={isEs ? 'Ej. Tarjeta B' : 'e.g. Credit Card B'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Saldo (${currencyMeta.symbol})` : `Balance (${currencyMeta.symbol})`} htmlFor={`${baseId}-bal`}>
              <UiInput
                id={`${baseId}-bal`}
                type="number"
                min={0}
                value={newBalance}
                onChange={(e) => setNewBalance(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Tasa (APR %)' : 'APR (%)'} htmlFor={`${baseId}-apr`}>
              <UiInput
                id={`${baseId}-apr`}
                type="number"
                min={0}
                step="0.1"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Mínimo (${currencyMeta.symbol})` : `Min Pay (${currencyMeta.symbol})`} htmlFor={`${baseId}-min`}>
              <UiInput
                id={`${baseId}-min`}
                type="number"
                min={0}
                value={newMin}
                onChange={(e) => setNewMin(Number(e.target.value))}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {isEs ? `Orden de Prioridad (${strategyLabel})` : `Priority Order (${strategyLabel})`}
            </h3>
            {debts.length > 0 && (
              <UiButton variant="ghost" size="sm" onClick={() => setDebts([])}>
                {isEs ? 'Vaciar deudas' : 'Clear all'}
              </UiButton>
            )}
          </div>

          {sortedDebts.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'No hay deudas registradas' : 'No debts in repayment plan'}
              description={
                isEs
                  ? 'Agrega una deuda arriba o restaura las cuentas de ejemplo.'
                  : 'Add an account above or restore the starter debt list.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={() => setDebts(INITIAL_DEBTS)}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample debts'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {sortedDebts.map((debt, index) => (
                <div
                  key={debt.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  {editingId === debt.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="text"
                        aria-label={isEs ? 'Editar nombre' : 'Edit debt name'}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ui-input flex-1 min-w-[130px] py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar saldo' : 'Edit balance'}
                        value={editBalance}
                        onChange={(e) => setEditBalance(Number(e.target.value))}
                        className="ui-input w-24 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        aria-label={isEs ? 'Editar APR' : 'Edit APR'}
                        value={editRate}
                        onChange={(e) => setEditRate(Number(e.target.value))}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        aria-label={isEs ? 'Editar mínimo' : 'Edit min payment'}
                        value={editMin}
                        onChange={(e) => setEditMin(Number(e.target.value))}
                        className="ui-input w-20 py-1.5 text-xs font-mono"
                      />
                      <UiButton
                        variant="primary"
                        size="sm"
                        aria-label={isEs ? 'Confirmar edición' : 'Confirm edit'}
                        onClick={() => commitEdit(debt.id)}
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
                        <span className="w-6 h-6 rounded-full bg-accent-light text-accent font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-text-primary block truncate">
                            {debt.name}
                          </span>
                          <div className="text-xs text-text-secondary font-mono">
                            APR: {debt.interestRate}% • {isEs ? 'Mín:' : 'Min:'} {fmtAuto(debt.minPayment)}/
                            {isEs ? 'mes' : 'mo'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {index === 0 && (
                          <UiStatusLabel tone="accent">
                            {isEs ? 'Objetivo #1' : 'Focus #1'}
                          </UiStatusLabel>
                        )}
                        <span className="font-mono tabular-nums text-sm font-bold text-status-error">
                          {fmtAuto(debt.balance)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(debt)}
                          aria-label={isEs ? `Editar ${debt.name}` : `Edit ${debt.name}`}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDebts(debts.filter((d) => d.id !== debt.id))}
                          aria-label={isEs ? `Eliminar ${debt.name}` : `Remove ${debt.name}`}
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
