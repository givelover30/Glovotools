import { useState, useMemo, useId } from 'react';
import { Rocket, Plus, Trash2, CheckSquare, Square, Clock, DollarSign } from 'lucide-react';
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
import {
  PlannerHeaderToolbar,
  PlannerProgressBar,
  PlannerDisclaimer
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  DEFAULT_HUSTLE_EXPENSES,
  DEFAULT_HUSTLE_MILESTONES,
  HustlePhase,
  SideHustleExpenseItem,
  SideHustleInput,
  SideHustleMilestone,
  analyzeSideHustlePlan,
  validateSideHustleInput
} from '../../engine/contracts/planners/sideHustle.ts';

const DEFAULT_SIDE_HUSTLE_STATE: SideHustleInput = {
  ventureName: 'B2B Niche Consulting & Templates',
  weeklyHoursCommitted: 12,
  projectedMonthlyRevenue: 2200,
  monthlyNetIncomeGoal: 1500,
  milestones: DEFAULT_HUSTLE_MILESTONES,
  expenses: DEFAULT_HUSTLE_EXPENSES
};

const EMPTY_SIDE_HUSTLE_STATE: SideHustleInput = {
  ventureName: 'New Side Hustle Plan',
  weeklyHoursCommitted: 10,
  projectedMonthlyRevenue: 0,
  monthlyNetIncomeGoal: 1000,
  milestones: [],
  expenses: []
};

const PHASES: HustlePhase[] = ['Validation', 'Build / Offer', 'Marketing', 'Launch'];

function sanitizeSideHustleState(raw: unknown): SideHustleInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<SideHustleInput>;
  if (
    typeof obj.ventureName !== 'string' ||
    typeof obj.weeklyHoursCommitted !== 'number' ||
    typeof obj.projectedMonthlyRevenue !== 'number' ||
    typeof obj.monthlyNetIncomeGoal !== 'number' ||
    !Array.isArray(obj.milestones) ||
    !Array.isArray(obj.expenses)
  ) {
    return null;
  }
  const milestones: SideHustleMilestone[] = obj.milestones
    .filter((m) => m && typeof m === 'object' && typeof m.title === 'string')
    .map((m) => ({
      id: typeof m.id === 'string' ? m.id : `sh-${Math.random()}`,
      phase: PHASES.includes(m.phase as HustlePhase) ? (m.phase as HustlePhase) : 'Validation',
      title: m.title,
      targetDate: typeof m.targetDate === 'string' ? m.targetDate : '2026-12-01',
      estimatedCost: typeof m.estimatedCost === 'number' && m.estimatedCost >= 0 ? m.estimatedCost : 0,
      completed: Boolean(m.completed)
    }));
  const expenses: SideHustleExpenseItem[] = obj.expenses
    .filter((e) => e && typeof e === 'object' && typeof e.name === 'string')
    .map((e) => ({
      id: typeof e.id === 'string' ? e.id : `ex-${Math.random()}`,
      name: e.name,
      amount: typeof e.amount === 'number' && e.amount >= 0 ? e.amount : 0,
      frequency: e.frequency === 'one-time' ? 'one-time' : 'monthly'
    }));
  return {
    ventureName: obj.ventureName,
    weeklyHoursCommitted: Math.max(0, Math.min(80, obj.weeklyHoursCommitted)),
    projectedMonthlyRevenue: Math.max(0, obj.projectedMonthlyRevenue),
    monthlyNetIncomeGoal: Math.max(0, obj.monthlyNetIncomeGoal),
    milestones,
    expenses
  };
}

export default function SideHustlePlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtMoney = (val: number) =>
    formatCurrency(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<SideHustleInput>({
    storageKey: 'calctools_side_hustle_planner_v1',
    version: 1,
    defaultValue: DEFAULT_SIDE_HUSTLE_STATE,
    sanitize: sanitizeSideHustleState
  });

  const [mPhase, setMPhase] = useState<HustlePhase>('Validation');
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('2026-12-01');
  const [mCost, setMCost] = useState(0);
  const [mError, setMError] = useState('');

  const [eName, setEName] = useState('');
  const [eAmount, setEAmount] = useState(50);
  const [eFreq, setEFreq] = useState<'one-time' | 'monthly'>('monthly');
  const [eError, setEError] = useState('');

  const validationErrors = useMemo(() => validateSideHustleInput(state), [state]);
  const analysis = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return analyzeSideHustlePlan(state);
    } catch {
      return null;
    }
  }, [state, validationErrors]);

  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mTitle.trim();
    if (!trimmed) {
      setMError(isEs ? 'Ingresa el título del hito.' : 'Please enter a milestone title.');
      return;
    }
    if (mCost < 0) {
      setMError(isEs ? 'El costo no puede ser negativo.' : 'Cost cannot be negative.');
      return;
    }
    setMError('');
    setState((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: `sh-${Date.now()}`,
          phase: mPhase,
          title: trimmed,
          targetDate: mDate || '2026-12-01',
          estimatedCost: Number(mCost) || 0,
          completed: false
        }
      ]
    }));
    setMTitle('');
    setMCost(0);
  };

  const toggleMilestone = (id: string) => {
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    }));
  };

  const deleteMilestone = (id: string) => {
    setState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id)
    }));
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = eName.trim();
    if (!trimmed) {
      setEError(isEs ? 'Ingresa el nombre del gasto.' : 'Please enter an expense name.');
      return;
    }
    if (eAmount < 0) {
      setEError(isEs ? 'El monto no puede ser negativo.' : 'Amount cannot be negative.');
      return;
    }
    setEError('');
    setState((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        {
          id: `ex-${Date.now()}`,
          name: trimmed,
          amount: Number(eAmount) || 0,
          frequency: eFreq
        }
      ]
    }));
    setEName('');
  };

  const deleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((ex) => ex.id !== id)
    }));
  };

  const handleExportCsv = () => {
    downloadCsvFile(
      'side_hustle_launch_plan.csv',
      ['Type', 'Phase / Frequency', 'Item', 'Target Date', 'Amount', 'Status'],
      [
        ...state.milestones.map((m) => [
          'Milestone',
          m.phase,
          m.title,
          m.targetDate,
          m.estimatedCost,
          m.completed ? 'Done' : 'Pending'
        ]),
        ...state.expenses.map((ex) => [
          'Expense',
          ex.frequency,
          ex.name,
          '—',
          ex.amount,
          'Budgeted'
        ])
      ]
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('side_hustle_launch_plan.json', { inputs: state, summary: analysis });
  };

  const copySummary = analysis
    ? `${analysis.ventureName} | Net Profit Est.: ${fmtMoney(analysis.projectedMonthlyNetProfit)}/mo | Startup Capital: ${fmtMoney(analysis.totalStartupCost)} | Readiness: ${analysis.launchReadinessPct}% (${analysis.completedMilestones}/${analysis.totalMilestones}) | Weekly Time: ${analysis.weeklyHoursCommitted}h`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Rocket className="w-4 h-4" />}
        title={isEs ? 'Planificador de Lanzamiento Side Hustle' : 'Side Business Milestone & Launch Planner'}
        subtitle={
          isEs
            ? 'Organiza fases de lanzamiento, costos iniciales/recurrentes, horas semanales y meta de ingreso neto'
            : 'Plan launch phases, startup & recurring costs, weekly time budget & net income goals'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_SIDE_HUSTLE_STATE)}
        canClear={state.milestones.length > 0 || state.expenses.length > 0}
      />

      {/* Core Venture Targets */}
      <section className="ui-panel p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
        <div className="sm:col-span-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Proyecto' : 'Side Business Name'} htmlFor={`${baseId}-vname`}>
            <UiInput
              id={`${baseId}-vname`}
              type="text"
              value={state.ventureName}
              onChange={(e) => setState((prev) => ({ ...prev, ventureName: e.target.value }))}
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-3">
          <ToolFieldGroup
            label={isEs ? `Ingreso Mensual Est. (${currencyMeta.symbol})` : `Projected Revenue / Mo (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-rev`}
          >
            <UiInput
              id={`${baseId}-rev`}
              type="number"
              min={0}
              value={state.projectedMonthlyRevenue}
              onChange={(e) =>
                setState((prev) => ({ ...prev, projectedMonthlyRevenue: Math.max(0, Number(e.target.value) || 0) }))
              }
              className="font-mono font-bold"
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-3">
          <ToolFieldGroup
            label={isEs ? `Meta Neta Mensual (${currencyMeta.symbol})` : `Net Income Goal / Mo (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-goal`}
          >
            <UiInput
              id={`${baseId}-goal`}
              type="number"
              min={0}
              value={state.monthlyNetIncomeGoal}
              onChange={(e) =>
                setState((prev) => ({ ...prev, monthlyNetIncomeGoal: Math.max(0, Number(e.target.value) || 0) }))
              }
              className="font-mono"
            />
          </ToolFieldGroup>
        </div>
        <div className="sm:col-span-2">
          <ToolFieldGroup label={isEs ? 'Horas / Semana' : 'Hours / Week'} htmlFor={`${baseId}-hrs`}>
            <UiInput
              id={`${baseId}-hrs`}
              type="number"
              min={0}
              max={80}
              value={state.weeklyHoursCommitted}
              onChange={(e) =>
                setState((prev) => ({ ...prev, weeklyHoursCommitted: Math.max(0, Math.min(80, Number(e.target.value) || 0)) }))
              }
              className="font-mono"
            />
          </ToolFieldGroup>
        </div>
      </section>

      {validationErrors.length > 0 && <UiErrorState message={validationErrors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Beneficio Neto Mensual Est.' : 'Projected Monthly Net'}
          value={analysis ? fmtMoney(analysis.projectedMonthlyNetProfit) : '—'}
          hint={
            analysis
              ? analysis.goalGapMonthly >= 0
                ? `+${fmtMoney(analysis.goalGapMonthly)} ${isEs ? 'sobre meta' : 'vs goal'}`
                : `${fmtMoney(analysis.goalGapMonthly)} ${isEs ? 'bajo meta' : 'vs goal'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Capital Inicial Necesario' : 'Total Startup Budget'}
          value={analysis ? fmtMoney(analysis.totalStartupCost) : '—'}
          hint={
            analysis?.estimatedBreakevenMonths !== null && analysis?.estimatedBreakevenMonths !== undefined
              ? `${isEs ? 'Recuperación:' : 'Payback:'} ${analysis.estimatedBreakevenMonths} ${isEs ? 'meses' : 'mo'}`
              : isEs
              ? 'Ajusta ingresos vs gastos'
              : 'Increase net profit to pay back'
          }
        />
        <ToolMetricTile
          label={isEs ? 'Avance de Lanzamiento' : 'Launch Readiness'}
          value={analysis ? `${analysis.launchReadinessPct}%` : '0%'}
          hint={
            analysis
              ? `${analysis.completedMilestones}/${analysis.totalMilestones} ${isEs ? 'hitos' : 'milestones'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Rendimiento Neto por Hora' : 'Effective Hourly Yield'}
          value={analysis ? `${fmtMoney(analysis.projectedEffectiveHourlyNet)}/hr` : '—'}
          hint={analysis ? `${analysis.monthlyHoursCommitted} h/${isEs ? 'mes' : 'mo'}` : ''}
        />
      </div>

      {/* Phase Readiness Bar */}
      {analysis && (
        <section className="ui-panel p-4 sm:p-5 space-y-3">
          <PlannerProgressBar
            label={isEs ? 'Progreso Global de Fases de Lanzamiento' : 'Overall Launch Phase Completion'}
            percent={analysis.launchReadinessPct}
            valueLabel={`${analysis.completedMilestones} / ${analysis.totalMilestones}`}
            tone={analysis.launchReadinessPct === 100 ? 'success' : 'accent'}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PHASES.map((ph) => {
              const c = analysis.phaseCounts[ph];
              return (
                <div
                  key={ph}
                  className="p-2.5 rounded-lg border border-border-subtle bg-surface-secondary/50 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-text-primary">{ph}</span>
                  <span className="font-mono text-accent">
                    {c.completed}/{c.total}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Milestones & Expenses Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Milestones */}
        <section className="lg:col-span-7 ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              {isEs ? 'Hitos por Fase' : 'Launch Phases & Milestones'}
            </h3>
          </div>

          {mError && <UiErrorState message={mError} />}
          <form onSubmit={addMilestone} className="no-print grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-3">
              <ToolFieldGroup label={isEs ? 'Fase' : 'Phase'} htmlFor={`${baseId}-mphase`}>
                <select
                  id={`${baseId}-mphase`}
                  value={mPhase}
                  onChange={(e) => setMPhase(e.target.value as HustlePhase)}
                  className="ui-input cursor-pointer text-xs"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-4">
              <ToolFieldGroup label={isEs ? 'Hito / Tarea' : 'Milestone'} htmlFor={`${baseId}-mtitle`}>
                <UiInput
                  id={`${baseId}-mtitle`}
                  type="text"
                  placeholder={isEs ? 'Ej. Primer cliente piloto' : 'e.g. Sign first 3 beta clients'}
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-2">
              <ToolFieldGroup label={isEs ? 'Fecha' : 'Target Date'} htmlFor={`${baseId}-mdate`}>
                <UiInput
                  id={`${baseId}-mdate`}
                  type="date"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  className="font-mono text-xs"
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-1">
              <ToolFieldGroup label={currencyMeta.symbol} htmlFor={`${baseId}-mcost`}>
                <UiInput
                  id={`${baseId}-mcost`}
                  type="number"
                  min={0}
                  value={mCost}
                  onChange={(e) => setMCost(Number(e.target.value))}
                  className="font-mono text-xs"
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

          {state.milestones.length === 0 ? (
            <UiEmptyState
              title={isEs ? 'No hay hitos registrados' : 'No launch milestones yet'}
              description={isEs ? 'Agrega un hito arriba o restaura la plantilla.' : 'Add a milestone above or restore starter phases.'}
              action={
                <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                  {isEs ? 'Restaurar ejemplo' : 'Restore starter plan'}
                </UiButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {state.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-border-subtle bg-surface-secondary/50 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleMilestone(m.id)}
                      aria-label={`Toggle ${m.title}`}
                      className="mt-0.5 cursor-pointer shrink-0"
                    >
                      {m.completed ? (
                        <CheckSquare className="w-4 h-4 text-status-success" />
                      ) : (
                        <Square className="w-4 h-4 text-text-tertiary" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <UiStatusLabel tone="accent">{m.phase}</UiStatusLabel>
                        <span
                          className={`text-sm font-semibold ${
                            m.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-text-secondary mt-0.5">
                        {m.targetDate} {m.estimatedCost > 0 ? `· ${fmtMoney(m.estimatedCost)}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMilestone(m.id)}
                    aria-label={`Delete ${m.title}`}
                    className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Budgeted Expenses */}
        <section className="lg:col-span-5 ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-accent" />
              {isEs ? 'Costos Iniciales y Recurrentes' : 'Startup & Monthly Expenses'}
            </h3>
          </div>

          {eError && <UiErrorState message={eError} />}
          <form onSubmit={addExpense} className="no-print space-y-2.5">
            <UiInput
              type="text"
              placeholder={isEs ? 'Concepto (ej. Software, Anuncios)' : 'Expense (e.g. SaaS Tools, Ads)'}
              value={eName}
              onChange={(e) => setEName(e.target.value)}
            />
            <div className="grid grid-cols-12 gap-2">
              <UiInput
                type="number"
                min={0}
                value={eAmount}
                onChange={(e) => setEAmount(Number(e.target.value))}
                className="col-span-5 font-mono"
              />
              <select
                value={eFreq}
                onChange={(e) => setEFreq(e.target.value === 'one-time' ? 'one-time' : 'monthly')}
                className="ui-input col-span-4 text-xs cursor-pointer"
              >
                <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                <option value="one-time">{isEs ? 'Único' : 'One-Time'}</option>
              </select>
              <UiButton type="submit" variant="primary" className="col-span-3">
                <Plus className="w-4 h-4" />
              </UiButton>
            </div>
          </form>

          <div className="space-y-2">
            {state.expenses.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl border border-border-subtle bg-surface-secondary/50 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{ex.name}</div>
                  <div className="text-[11px] text-text-secondary">
                    {ex.frequency === 'one-time'
                      ? isEs
                        ? 'Costo inicial único'
                        : 'One-time startup cost'
                      : isEs
                      ? 'Gasto operativo mensual'
                      : 'Recurring monthly cost'}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-sm text-text-primary">
                    {fmtMoney(ex.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExpense(ex.id)}
                    aria-label={`Delete ${ex.name}`}
                    className="no-print p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Supuestos de Proyección' : 'Launch Projection Note'}
        message={
          isEs
            ? 'Los cálculos reflejan tus estimaciones de ingresos, gastos y horas semanales; los costos marcados en hitos se suman al presupuesto de arranque único.'
            : 'Profitability and payback metrics reflect your entered estimates; milestone costs are summed into total startup capital alongside one-time expenses.'
        }
      />
    </div>
  );
}
