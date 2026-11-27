import { useState, useMemo, useId } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolMetricTile,
  ToolSegmentedControl,
  ToolFieldGroup
} from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerDisclaimer
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  DebtAccountInput,
  DebtStrategy,
  analyzeDebtRepayment,
  validateDebtPayoffInput
} from '../../engine/contracts/planners/debtAmortization.ts';

interface StoredDebtPlanState {
  debts: DebtAccountInput[];
  extraMonthlyPayment: number;
  strategy: DebtStrategy;
  startYearMonth: string;
}

const DEFAULT_START_MONTH = (() => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
})();

const DEFAULT_DEBT_STATE: StoredDebtPlanState = {
  debts: [
    { id: 'd1', name: 'Credit Card A', balance: 3500, apr: 19.99, minPayment: 100 },
    { id: 'd2', name: 'Car Loan', balance: 12000, apr: 6.5, minPayment: 320 },
    { id: 'd3', name: 'Student Loan', balance: 18500, apr: 4.8, minPayment: 210 }
  ],
  extraMonthlyPayment: 250,
  strategy: 'avalanche',
  startYearMonth: DEFAULT_START_MONTH
};

const EMPTY_DEBT_STATE: StoredDebtPlanState = {
  debts: [],
  extraMonthlyPayment: 0,
  strategy: 'avalanche',
  startYearMonth: DEFAULT_START_MONTH
};

function sanitizeDebtState(raw: unknown): StoredDebtPlanState | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<StoredDebtPlanState>;
  if (!Array.isArray(obj.debts)) return null;
  const debts: DebtAccountInput[] = [];
  for (const item of obj.debts) {
    if (!item || typeof item !== 'object') return null;
    const d = item as Partial<DebtAccountInput> & { interestRate?: number };
    const aprVal = typeof d.apr === 'number' ? d.apr : typeof d.interestRate === 'number' ? d.interestRate : null;
    if (
      typeof d.id !== 'string' ||
      typeof d.name !== 'string' ||
      typeof d.balance !== 'number' ||
      aprVal === null ||
      typeof d.minPayment !== 'number'
    ) {
      return null;
    }
    debts.push({
      id: d.id,
      name: d.name,
      balance: Math.max(0, d.balance),
      apr: Math.max(0, Math.min(100, aprVal)),
      minPayment: Math.max(0, d.minPayment)
    });
  }
  return {
    debts,
    extraMonthlyPayment:
      typeof obj.extraMonthlyPayment === 'number' && Number.isFinite(obj.extraMonthlyPayment)
        ? Math.max(0, obj.extraMonthlyPayment)
        : 0,
    strategy: obj.strategy === 'snowball' ? 'snowball' : 'avalanche',
    startYearMonth:
      typeof obj.startYearMonth === 'string' && /^\d{4}-\d{2}$/.test(obj.startYearMonth)
        ? obj.startYearMonth
        : DEFAULT_START_MONTH
  };
}

export interface DebtRepaymentPlannerCalculatorProps {
  mode?: 'planner' | 'comparison';
}

export default function DebtRepaymentPlannerCalculator({
  mode = 'planner'
}: DebtRepaymentPlannerCalculatorProps) {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtMoney = (val: number) =>
    formatCurrency(val, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const storageKey =
    mode === 'comparison'
      ? 'calctools_debt_snowball_avalanche_v1'
      : 'calctools_debt_repayment_v1';

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<StoredDebtPlanState>({
    storageKey,
    version: 1,
    defaultValue: DEFAULT_DEBT_STATE,
    sanitize: sanitizeDebtState
  });

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
  const [editError, setEditError] = useState('');

  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const analysis = useMemo(() => {
    if (state.debts.length === 0) return null;
    const errs = validateDebtPayoffInput({
      debts: state.debts,
      extraMonthlyPayment: state.extraMonthlyPayment,
      strategy: state.strategy,
      startYearMonth: state.startYearMonth
    });
    if (errs.length > 0) return null;
    try {
      return analyzeDebtRepayment({
        debts: state.debts,
        extraMonthlyPayment: state.extraMonthlyPayment,
        strategy: state.strategy,
        startYearMonth: state.startYearMonth
      });
    } catch {
      return null;
    }
  }, [state]);

  const addDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la deuda.' : 'Please enter a debt name.');
      return;
    }
    if (!Number.isFinite(newBalance) || newBalance < 0 || !Number.isFinite(newRate) || newRate < 0 || newRate > 100 || !Number.isFinite(newMin) || newMin < 0) {
      setFormError(
        isEs
          ? 'Saldo y pago mínimo deben ser >= 0, y APR entre 0% y 100%.'
          : 'Balance and minimum payment must be >= 0, and APR between 0% and 100%.'
      );
      return;
    }
    setFormError('');
    setState((prev) => ({
      ...prev,
      debts: [
        ...prev.debts,
        {
          id: `d-${Date.now()}`,
          name: trimmed,
          balance: Number(newBalance) || 0,
          apr: Number(newRate) || 0,
          minPayment: Number(newMin) || 0
        }
      ]
    }));
    setNewName('');
  };

  const startEdit = (d: DebtAccountInput) => {
    setEditingId(d.id);
    setEditName(d.name);
    setEditBalance(d.balance);
    setEditRate(d.apr);
    setEditMin(d.minPayment);
    setEditError('');
  };

  const commitEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError(isEs ? 'El nombre es obligatorio.' : 'Debt name is required.');
      return;
    }
    if (editBalance < 0 || editRate < 0 || editRate > 100 || editMin < 0) {
      setEditError(
        isEs
          ? 'Verifica que saldo >= 0, mínimo >= 0 y APR entre 0% y 100%.'
          : 'Ensure balance >= 0, min payment >= 0, and APR is 0–100%.'
      );
      return;
    }
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id
          ? {
              ...d,
              name: trimmed,
              balance: Number(editBalance),
              apr: Number(editRate),
              minPayment: Number(editMin)
            }
          : d
      )
    }));
    setEditingId(null);
    setEditError('');
  };

  const prioritizedAccounts = useMemo(() => {
    if (analysis) {
      return [...analysis.selectedPlan.accounts].sort((a, b) => a.priorityRank - b.priorityRank);
    }
    return [];
  }, [analysis]);

  const scheduleRows = useMemo(() => {
    if (!analysis) return [];
    const rows = analysis.selectedPlan.schedule;
    return showFullSchedule ? rows : rows.slice(0, 24);
  }, [analysis, showFullSchedule]);

  const chartMilestones = useMemo(() => {
    if (!analysis || analysis.selectedPlan.schedule.length === 0) return [];
    const rows = analysis.selectedPlan.schedule;
    const step = Math.max(1, Math.ceil(rows.length / 12));
    const sampled = rows.filter((_, i) => i % step === 0 || i === rows.length - 1);
    const maxBal = Math.max(1, analysis.totalStartingDebt);
    return sampled.map((row) => ({
      ...row,
      pct: Math.max(2, Math.round((row.endingBalance / maxBal) * 100))
    }));
  }, [analysis]);

  const handleExportJson = () => {
    downloadJsonFile(
      mode === 'comparison' ? 'debt_snowball_vs_avalanche.json' : 'debt_repayment_plan.json',
      {
        inputs: state,
        summary: analysis
          ? {
              strategy: analysis.strategy,
              avalanche: {
                payable: analysis.avalanchePlan.payable,
                monthsToPayoff: analysis.avalanchePlan.monthsToPayoff,
                debtFreeDate: analysis.avalanchePlan.estimatedDebtFreeDate,
                totalInterestPaid: analysis.avalanchePlan.totalInterestPaid
              },
              snowball: {
                payable: analysis.snowballPlan.payable,
                monthsToPayoff: analysis.snowballPlan.monthsToPayoff,
                debtFreeDate: analysis.snowballPlan.estimatedDebtFreeDate,
                totalInterestPaid: analysis.snowballPlan.totalInterestPaid
              },
              minimumOnly: {
                payable: analysis.minimumOnlyPlan.payable,
                monthsToPayoff: analysis.minimumOnlyPlan.monthsToPayoff,
                totalInterestPaid: analysis.minimumOnlyPlan.totalInterestPaid
              }
            }
          : null,
        schedule: analysis?.selectedPlan.schedule ?? []
      }
    );
  };

  const handleExportCsv = () => {
    if (!analysis) return;
    downloadCsvFile(
      mode === 'comparison' ? 'debt_snowball_avalanche_schedule.csv' : 'debt_amortization_schedule.csv',
      [
        'Month',
        'Date',
        'Starting Balance',
        'Total Interest',
        'Principal Paid',
        'Total Payment',
        'Ending Balance',
        'Active Accounts',
        'Paid Off This Month'
      ],
      analysis.selectedPlan.schedule.map((row) => [
        row.month,
        row.dateLabel,
        row.startingBalance,
        row.totalInterest,
        row.totalPrincipal,
        row.totalPayment,
        row.endingBalance,
        row.activeAccounts,
        row.paidOffNames.join(' | ')
      ])
    );
  };

  const selectedPlan = analysis?.selectedPlan;
  const strategyLabel =
    state.strategy === 'avalanche'
      ? isEs
        ? 'Avalancha'
        : 'Avalanche'
      : isEs
      ? 'Bola de Nieve'
      : 'Snowball';

  const copySummary = analysis && selectedPlan
    ? `${strategyLabel} Plan | Debt: ${fmtMoney(analysis.totalStartingDebt)} | Monthly: ${fmtMoney(analysis.totalMonthlyPayment)} | Payoff: ${selectedPlan.payable ? `${selectedPlan.monthsToPayoff} months (${selectedPlan.estimatedDebtFreeDate})` : 'Unpayable'} | Total Interest: ${fmtMoney(selectedPlan.totalInterestPaid)}`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerDisclaimer
        tone="warning"
        title={isEs ? 'Aviso Financiero' : 'Financial Disclaimer'}
        message={
          isEs
            ? 'Los cálculos de amortización son estimaciones educativas con capitalización mensual y tasas constantes. Los saldos reales pueden variar según cargos diarios o términos de cada prestamista.'
            : 'Debt amortization figures are educational estimates assuming monthly compounding and fixed APRs. Actual payoff timing depends on lender billing cycles and fees.'
        }
      />

      <PlannerHeaderToolbar
        icon={<CreditCard className="w-4 h-4" />}
        title={
          mode === 'comparison'
            ? isEs
              ? 'Comparador Bola de Nieve vs. Avalancha'
              : 'Debt Snowball vs. Avalanche Payoff Planner'
            : isEs
            ? 'Planificador y Amortización de Deudas'
            : 'Debt Repayment & Amortization Planner'
        }
        subtitle={
          isEs
            ? 'Simulación mensual real con intereses, rollover de pagos y comparación de estrategias'
            : 'Month-by-month amortization with rollover allocation & strategy comparison'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={analysis && selectedPlan && selectedPlan.schedule.length > 0 ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_DEBT_STATE)}
        canClear={state.debts.length > 0}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Deuda Total Pendiente' : 'Total Starting Debt'}
          value={fmtMoney(analysis?.totalStartingDebt ?? 0)}
          hint={`${state.debts.length} ${isEs ? 'cuentas' : 'accounts'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Meses Hasta Liquidar' : 'Months to Debt-Free'}
          value={
            selectedPlan
              ? selectedPlan.payable
                ? `${selectedPlan.monthsToPayoff} ${isEs ? 'meses' : 'mo'}`
                : isEs
                ? 'Insuficiente'
                : 'Unpayable'
              : '—'
          }
          hint={
            selectedPlan?.payable
              ? `${isEs ? 'Fecha est.:' : 'Target:'} ${selectedPlan.estimatedDebtFreeDate}`
              : isEs
              ? 'Aumenta el pago mensual'
              : 'Increase monthly payment'
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Interés Total Estimado' : 'Total Interest Paid'}
          value={selectedPlan ? fmtMoney(selectedPlan.totalInterestPaid) : '—'}
          hint={
            analysis?.interestSavedVsMinimum !== null && analysis?.interestSavedVsMinimum !== undefined
              ? `${isEs ? 'Ahorro vs mínimos:' : 'Saved vs mins:'} ${fmtMoney(analysis.interestSavedVsMinimum)}`
              : isEs
              ? 'Pagos mínimos no liquidan deuda'
              : 'Minimums alone stall'
          }
        />
        <ToolMetricTile
          label={isEs ? 'Pago Mensual Total' : 'Total Monthly Payment'}
          value={fmtMoney(analysis?.totalMonthlyPayment ?? 0)}
          hint={`${isEs ? 'Mínimos' : 'Mins'} ${fmtMoney(analysis?.totalMinimumPayments ?? 0)} + ${fmtMoney(state.extraMonthlyPayment)}`}
        />
      </div>

      {/* Unpayable / Negative Amortization Warning */}
      {analysis && !selectedPlan?.payable && (
        <UiErrorState
          message={
            selectedPlan?.reasonIfUnpayable ||
            (isEs
              ? 'El presupuesto mensual actual no logra liquidar la deuda dentro de 50 años.'
              : 'Current monthly payment cannot pay off all balances within the 600-month simulation limit.')
          }
        />
      )}

      {/* Strategy Side-by-Side Comparison */}
      {analysis && (
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">
                {isEs ? 'Comparación: Avalancha vs. Bola de Nieve vs. Solo Mínimos' : 'Strategy Comparison: Avalanche vs. Snowball vs. Minimums Only'}
              </h3>
            </div>
            <UiStatusLabel tone="accent">
              {isEs
                ? `Menor interés: ${analysis.recommendedForLowestInterest === 'avalanche' ? 'Avalancha' : 'Bola de Nieve'}`
                : `Lowest Interest: ${analysis.recommendedForLowestInterest === 'avalanche' ? 'Avalanche' : 'Snowball'}`}
            </UiStatusLabel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                key: 'avalanche',
                title: isEs ? 'Avalancha (Mayor APR)' : 'Avalanche (Highest APR)',
                plan: analysis.avalanchePlan,
                active: state.strategy === 'avalanche'
              },
              {
                key: 'snowball',
                title: isEs ? 'Bola de Nieve (Menor Saldo)' : 'Snowball (Lowest Balance)',
                plan: analysis.snowballPlan,
                active: state.strategy === 'snowball'
              },
              {
                key: 'minimum-only',
                title: isEs ? 'Solo Pagos Mínimos ($0 Extra)' : 'Minimum Payments Only',
                plan: analysis.minimumOnlyPlan,
                active: false
              }
            ].map((card) => (
              <div
                key={card.key}
                className={`p-4 rounded-xl border space-y-2 ${
                  card.active
                    ? 'border-accent bg-accent-light/25'
                    : 'border-border-subtle bg-surface-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">{card.title}</span>
                  {card.active && (
                    <UiStatusLabel tone="accent">{isEs ? 'Activo' : 'Active'}</UiStatusLabel>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isEs ? 'Plazo:' : 'Payoff Time:'}</span>
                    <span className="font-mono font-bold text-text-primary">
                      {card.plan.payable
                        ? `${card.plan.monthsToPayoff} ${isEs ? 'meses' : 'months'}`
                        : isEs
                        ? 'No liquida'
                        : 'Unpayable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isEs ? 'Fecha:' : 'Debt-Free Date:'}</span>
                    <span className="font-mono text-text-primary">{card.plan.estimatedDebtFreeDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isEs ? 'Interés Total:' : 'Total Interest:'}</span>
                    <span className="font-mono font-semibold text-status-error">
                      {card.plan.payable ? fmtMoney(card.plan.totalInterestPaid) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{isEs ? 'Total Pagado:' : 'Total Paid:'}</span>
                    <span className="font-mono text-text-primary">
                      {card.plan.payable ? fmtMoney(card.plan.totalAmountPaid) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategy Controls + Debt Accounts */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pb-5 border-b border-border-subtle">
          <div className="sm:col-span-6 space-y-1.5">
            <span className="ui-label block">
              {isEs ? 'Estrategia Activa' : 'Active Repayment Strategy'}
            </span>
            <ToolSegmentedControl
              ariaLabel={isEs ? 'Estrategia de pago' : 'Repayment strategy'}
              value={state.strategy}
              onChange={(val) => setState((prev) => ({ ...prev, strategy: val }))}
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
          <div className="sm:col-span-3">
            <ToolFieldGroup
              label={isEs ? `Pago Extra Mensual (${currencyMeta.symbol})` : `Extra Monthly (${currencyMeta.symbol})`}
              htmlFor={`${baseId}-extra`}
            >
              <UiInput
                id={`${baseId}-extra`}
                type="number"
                min={0}
                value={state.extraMonthlyPayment}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    extraMonthlyPayment: Math.max(0, Number(e.target.value) || 0)
                  }))
                }
                className="font-mono font-bold"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup
              label={isEs ? 'Mes de Inicio' : 'Start Month'}
              htmlFor={`${baseId}-start-month`}
            >
              <UiInput
                id={`${baseId}-start-month`}
                type="month"
                value={state.startYearMonth}
                onChange={(e) => {
                  if (/^\d{4}-\d{2}$/.test(e.target.value)) {
                    setState((prev) => ({ ...prev, startYearMonth: e.target.value }));
                  }
                }}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
        </div>

        {formError && <UiErrorState message={formError} />}

        <form
          onSubmit={addDebt}
          className="no-print grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pb-5 border-b border-border-subtle"
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
            <ToolFieldGroup label="APR (%)" htmlFor={`${baseId}-apr`}>
              <UiInput
                id={`${baseId}-apr`}
                type="number"
                min={0}
                max={100}
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
              {isEs ? `Orden de Prioridad (${strategyLabel})` : `Priority Queue (${strategyLabel})`}
            </h3>
          </div>

          {state.debts.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'No hay deudas registradas' : 'No debts in repayment plan'}
              description={
                isEs
                  ? 'Agrega una deuda arriba o restaura las cuentas de ejemplo.'
                  : 'Add an account above or restore the starter debt list.'
              }
              action={
                <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore sample debts'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {(prioritizedAccounts.length > 0
                ? prioritizedAccounts
                : state.debts.map((d, i) => ({
                    id: d.id,
                    name: d.name,
                    startingBalance: d.balance,
                    apr: d.apr,
                    minPayment: d.minPayment,
                    firstMonthInterest: 0,
                    minCoversInterest: true,
                    payoffMonth: null as number | null,
                    totalInterestPaid: 0,
                    totalPaid: 0,
                    priorityRank: i + 1
                  }))
              ).map((acc, index) => {
                const rawDebt = state.debts.find((d) => d.id === acc.id);
                return (
                  <div
                    key={acc.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/50"
                  >
                    {editingId === acc.id ? (
                      <div className="flex-1 space-y-2">
                        {editError && <UiErrorState message={editError} />}
                        <div className="flex flex-wrap items-center gap-2">
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
                            max={100}
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
                            onClick={() => commitEdit(acc.id)}
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
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-accent-light text-accent font-bold font-mono text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-sm text-text-primary truncate">
                                {acc.name}
                              </span>
                              {!acc.minCoversInterest && (
                                <UiStatusLabel tone="warning">
                                  <AlertTriangle className="w-3 h-3 mr-1 inline" />
                                  {isEs ? 'Mínimo < Interés' : 'Min < Interest'}
                                </UiStatusLabel>
                              )}
                            </div>
                            <div className="text-xs text-text-secondary font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>APR: {acc.apr}%</span>
                              <span>
                                {isEs ? 'Mín:' : 'Min:'} {fmtMoney(acc.minPayment)}/{isEs ? 'mes' : 'mo'}
                              </span>
                              {acc.payoffMonth !== null && (
                                <span>
                                  {isEs ? 'Liquidado mes' : 'Paid off mo'} #{acc.payoffMonth}
                                </span>
                              )}
                              <span>
                                {isEs ? 'Interés:' : 'Interest:'} {fmtMoney(acc.totalInterestPaid)}
                              </span>
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
                            {fmtMoney(acc.startingBalance)}
                          </span>
                          {rawDebt && (
                            <button
                              type="button"
                              onClick={() => startEdit(rawDebt)}
                              aria-label={isEs ? `Editar ${acc.name}` : `Edit ${acc.name}`}
                              className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                debts: prev.debts.filter((d) => d.id !== acc.id)
                              }))
                            }
                            aria-label={isEs ? `Eliminar ${acc.name}` : `Remove ${acc.name}`}
                            className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg transition-colors cursor-pointer"
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
        </div>
      </section>

      {/* Balance Payoff Trajectory Bars */}
      {chartMilestones.length > 0 && (
        <section className="ui-panel p-5 sm:p-6 space-y-3">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Trayectoria de Reducción de Saldo' : 'Balance Reduction Trajectory'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {chartMilestones.map((m) => (
              <div
                key={m.month}
                className="p-2.5 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-1.5"
              >
                <div className="text-[11px] font-mono text-text-secondary">
                  M{m.month} · {m.dateLabel}
                </div>
                <div className="h-10 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-accent/80 transition-all"
                    style={{ height: `${m.pct}%` }}
                  />
                </div>
                <div className="text-xs font-mono font-bold text-text-primary truncate">
                  {fmtMoney(m.endingBalance)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Amortization Schedule */}
      {analysis && analysis.selectedPlan.schedule.length > 0 && (
        <section className="ui-panel p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                {isEs ? 'Tabla de Amortización Mensual' : 'Monthly Amortization Schedule'}
              </h3>
              <p className="text-xs text-text-secondary">
                {analysis.selectedPlan.schedule.length} {isEs ? 'meses simulados' : 'simulated months'}
              </p>
            </div>
            {analysis.selectedPlan.schedule.length > 24 && (
              <UiButton
                variant="secondary"
                size="sm"
                onClick={() => setShowFullSchedule((prev) => !prev)}
              >
                {showFullSchedule ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Mostrar primeros 24 meses' : 'Show First 24 Months'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>
                      {isEs
                        ? `Ver todos (${analysis.selectedPlan.schedule.length})`
                        : `Show All (${analysis.selectedPlan.schedule.length} months)`}
                    </span>
                  </>
                )}
              </UiButton>
            )}
          </div>

          <div className="overflow-x-auto max-h-80 rounded-xl border border-border-main bg-surface">
            <table className="w-full text-left text-xs font-mono tabular-nums whitespace-nowrap">
              <thead className="bg-surface-secondary text-text-secondary sticky top-0 border-b border-border-main">
                <tr>
                  <th className="p-2.5 font-semibold">#</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Mes' : 'Month'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Saldo Inicial' : 'Start Balance'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Interés' : 'Interest'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Capital' : 'Principal'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Pago Total' : 'Payment'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Saldo Final' : 'End Balance'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Hito' : 'Paid Off'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {scheduleRows.map((row) => (
                  <tr key={row.month} className="hover:bg-surface-hover">
                    <td className="p-2.5">{row.month}</td>
                    <td className="p-2.5">{row.dateLabel}</td>
                    <td className="p-2.5">{fmtMoney(row.startingBalance)}</td>
                    <td className="p-2.5 text-status-error">{fmtMoney(row.totalInterest)}</td>
                    <td className="p-2.5 text-status-success">{fmtMoney(row.totalPrincipal)}</td>
                    <td className="p-2.5 font-semibold">{fmtMoney(row.totalPayment)}</td>
                    <td className="p-2.5 font-bold">{fmtMoney(row.endingBalance)}</td>
                    <td className="p-2.5 text-accent">
                      {row.paidOffNames.length > 0 ? row.paidOffNames.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
