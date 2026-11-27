import { useId, useMemo } from 'react';
import { Layers, ShieldAlert } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolFieldGroup, ToolMetricTile } from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiButton, UiInput, UiStatusLabel, UiErrorState } from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerDisclaimer,
  PlannerProgressBar
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  RetirementBucketInput,
  calculateRetirementBucketStrategy,
  validateRetirementBucketInput
} from '../../engine/contracts/planners/retirementBucketStrategy.ts';

const DEFAULT_BUCKET_STATE: RetirementBucketInput = {
  totalPortfolioValue: 1000000,
  annualSpendingNeed: 65000,
  guaranteedAnnualIncome: 25000,
  bucket1Pct: 10,
  bucket2Pct: 30,
  bucket3Pct: 60,
  bucket1ReturnPct: 3.5,
  bucket2ReturnPct: 5.0,
  bucket3ReturnPct: 7.5
};

const EMPTY_BUCKET_STATE: RetirementBucketInput = {
  totalPortfolioValue: 0,
  annualSpendingNeed: 0,
  guaranteedAnnualIncome: 0,
  bucket1Pct: 10,
  bucket2Pct: 30,
  bucket3Pct: 60,
  bucket1ReturnPct: 3.0,
  bucket2ReturnPct: 5.0,
  bucket3ReturnPct: 7.0
};

function sanitizeBucketState(raw: unknown): RetirementBucketInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<RetirementBucketInput>;
  const keys: Array<keyof RetirementBucketInput> = [
    'totalPortfolioValue',
    'annualSpendingNeed',
    'guaranteedAnnualIncome',
    'bucket1Pct',
    'bucket2Pct',
    'bucket3Pct',
    'bucket1ReturnPct',
    'bucket2ReturnPct',
    'bucket3ReturnPct'
  ];
  for (const k of keys) {
    if (typeof obj[k] !== 'number' || !Number.isFinite(obj[k])) return null;
  }
  return obj as RetirementBucketInput;
}

export default function RetirementBucketStrategyPlannerCalculator() {
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
  } = usePlannerStorage<RetirementBucketInput>({
    storageKey: 'calctools_retirement_bucket_v1',
    version: 1,
    defaultValue: DEFAULT_BUCKET_STATE,
    sanitize: sanitizeBucketState
  });

  const updateNum = (field: keyof RetirementBucketInput, value: string) => {
    const num = value === '' ? 0 : Number(value);
    setState((prev) => ({ ...prev, [field]: Number.isFinite(num) ? num : 0 }));
  };

  const applyPreset = (b1: number, b2: number, b3: number) => {
    setState((prev) => ({ ...prev, bucket1Pct: b1, bucket2Pct: b2, bucket3Pct: b3 }));
  };

  const errors = useMemo(() => validateRetirementBucketInput(state), [state]);
  const result = useMemo(() => {
    if (errors.length > 0) return null;
    try {
      return calculateRetirementBucketStrategy(state);
    } catch {
      return null;
    }
  }, [state, errors]);

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'retirement_3_bucket_strategy.csv',
      ['Bucket', 'Allocation (%)', 'Amount', 'Illustrative Return (%)', 'Years Spending Covered', 'Purpose'],
      result.buckets.map((b) => [
        b.name,
        b.allocationPct,
        b.amount,
        b.expectedReturnPct,
        b.yearsSpendingCovered !== null ? b.yearsSpendingCovered : 'N/A',
        b.role
      ])
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('retirement_3_bucket_strategy.json', { inputs: state, results: result });
  };

  const copySummary = result
    ? `3-Bucket Plan (${fmtMoney(result.totalPortfolioValue)}) | Net Portfolio Draw: ${fmtMoney(result.netAnnualPortfolioWithdrawal)}/yr (${result.initialWithdrawalRatePct}%) | Cash+Bond Runway: ${result.combinedNearTermYearsCovered ?? 0} yrs | Weighted Illustrative Return: ${result.weightedExpectedReturnPct}%`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Layers className="w-4 h-4" />}
        title={isEs ? 'Planificador de Estrategia de 3 Cubos para el Retiro' : 'Retirement 3-Bucket Withdrawal Strategy Planner'}
        subtitle={
          isEs
            ? 'Segmenta tu portafolio en liquidez (Cubo 1), renta intermedia (Cubo 2) y crecimiento (Cubo 3)'
            : 'Segment assets across Cash Reserve, Intermediate Income & Long-Term Equity Growth buckets'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={result ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_BUCKET_STATE)}
        canClear={state.totalPortfolioValue > 0 || state.annualSpendingNeed > 0}
      />

      {errors.length > 0 && <UiErrorState message={errors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Reserva Líquida + Bonos' : 'Near-Term Runway (B1 + B2)'}
          value={
            result
              ? result.combinedNearTermYearsCovered !== null
                ? `${result.combinedNearTermYearsCovered} ${isEs ? 'años' : 'yrs'}`
                : isEs
                ? 'Sin retiro neto'
                : 'No draw needed'
              : '—'
          }
          hint={
            result?.bucket1YearsCovered !== null && result?.bucket1YearsCovered !== undefined
              ? `${isEs ? 'Efectivo:' : 'Cash:'} ${result.bucket1YearsCovered} ${isEs ? 'años' : 'yrs'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Retiro Anual Neto del Portafolio' : 'Net Portfolio Withdrawal'}
          value={result ? `${fmtMoney(result.netAnnualPortfolioWithdrawal)}/yr` : '—'}
          hint={
            result
              ? `${isEs ? 'Tasa inicial:' : 'Initial draw:'} ${result.initialWithdrawalRatePct}%`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Rendimiento Ponderado Est.' : 'Weighted Illustrative Return'}
          value={result ? `${result.weightedExpectedReturnPct}%` : '—'}
          hint={isEs ? 'promedio ponderado de 3 cubos' : 'blended bucket assumption'}
        />
        <ToolMetricTile
          label={isEs ? 'Cubo 3 Proyectado a 10 Años' : 'Bucket 3 Value (10-Yr Est.)'}
          value={result ? fmtMoney(result.bucket3Projected10YrValue) : '—'}
          hint={isEs ? 'crecimiento hipotético sin retiros' : 'compounded growth illustration'}
        />
      </div>

      {/* Inputs Panel */}
      <section className="ui-panel p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ToolFieldGroup
            label={isEs ? `Valor Total del Portafolio (${currencyMeta.symbol})` : `Total Portfolio Value (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-port`}
          >
            <UiInput
              id={`${baseId}-port`}
              type="number"
              min={0}
              step={10000}
              value={state.totalPortfolioValue}
              onChange={(e) => updateNum('totalPortfolioValue', e.target.value)}
              className="font-mono font-bold"
            />
          </ToolFieldGroup>
          <ToolFieldGroup
            label={isEs ? `Gasto Anual en Retiro (${currencyMeta.symbol})` : `Annual Spending Need (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-spend`}
          >
            <UiInput
              id={`${baseId}-spend`}
              type="number"
              min={0}
              step={1000}
              value={state.annualSpendingNeed}
              onChange={(e) => updateNum('annualSpendingNeed', e.target.value)}
              className="font-mono"
            />
          </ToolFieldGroup>
          <ToolFieldGroup
            label={isEs ? `Ingreso Garantizado / Pensión (${currencyMeta.symbol})` : `Guaranteed Annual Income (${currencyMeta.symbol})`}
            htmlFor={`${baseId}-guar`}
          >
            <UiInput
              id={`${baseId}-guar`}
              type="number"
              min={0}
              step={1000}
              value={state.guaranteedAnnualIncome}
              onChange={(e) => updateNum('guaranteedAnnualIncome', e.target.value)}
              className="font-mono"
            />
          </ToolFieldGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {isEs ? 'Distribución de los 3 Cubos (Debe sumar 100%)' : '3-Bucket Allocation Split (Must total 100%)'}
          </span>
          <div className="no-print flex flex-wrap gap-2">
            <UiButton variant="secondary" size="sm" onClick={() => applyPreset(10, 30, 60)}>
              10 / 30 / 60
            </UiButton>
            <UiButton variant="secondary" size="sm" onClick={() => applyPreset(15, 35, 50)}>
              15 / 35 / 50
            </UiButton>
            <UiButton variant="secondary" size="sm" onClick={() => applyPreset(5, 25, 70)}>
              5 / 25 / 70
            </UiButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              num: 1,
              title: isEs ? 'Cubo 1: Efectivo / Liquidez' : 'Bucket 1: Cash Reserve',
              pctField: 'bucket1Pct' as const,
              retField: 'bucket1ReturnPct' as const,
              computed: result?.buckets[0]
            },
            {
              num: 2,
              title: isEs ? 'Cubo 2: Bonos / Renta Intermedia' : 'Bucket 2: Income & Bonds',
              pctField: 'bucket2Pct' as const,
              retField: 'bucket2ReturnPct' as const,
              computed: result?.buckets[1]
            },
            {
              num: 3,
              title: isEs ? 'Cubo 3: Renta Variable / Crecimiento' : 'Bucket 3: Equity Growth',
              pctField: 'bucket3Pct' as const,
              retField: 'bucket3ReturnPct' as const,
              computed: result?.buckets[2]
            }
          ].map((b) => (
            <div
              key={b.num}
              className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-text-primary">{b.title}</span>
                {b.computed && (
                  <UiStatusLabel tone="accent">{fmtMoney(b.computed.amount)}</UiStatusLabel>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <ToolFieldGroup label={isEs ? 'Asignación (%)' : 'Allocation (%)'}>
                  <UiInput
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={state[b.pctField]}
                    onChange={(e) => updateNum(b.pctField, e.target.value)}
                    className="font-mono font-bold"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Retorno Est. (%)' : 'Est. Return (%)'}>
                  <UiInput
                    type="number"
                    min={0}
                    max={25}
                    step={0.5}
                    value={state[b.retField]}
                    onChange={(e) => updateNum(b.retField, e.target.value)}
                    className="font-mono"
                  />
                </ToolFieldGroup>
              </div>

              {b.computed && (
                <div className="space-y-1.5 pt-1 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>{isEs ? 'Cobertura de gasto:' : 'Spending coverage:'}</span>
                    <span className="font-mono font-semibold text-text-primary">
                      {b.computed.yearsSpendingCovered !== null
                        ? `${b.computed.yearsSpendingCovered} ${isEs ? 'años' : 'yrs'}`
                        : '—'}
                    </span>
                  </div>
                  <PlannerProgressBar
                    label={isEs ? 'Participación' : 'Share'}
                    percent={b.computed.allocationPct}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {result && result.initialWithdrawalRatePct > 5 && (
        <div
          role="note"
          className="p-3.5 rounded-xl bg-amber-50/75 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2.5"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isEs
              ? `Tu tasa inicial de retiro (${result.initialWithdrawalRatePct}%) supera el rango conservador habitual del 4%–5%. Evalúa ajustar gastos o ampliar reservas.`
              : `Initial portfolio withdrawal rate (${result.initialWithdrawalRatePct}%) exceeds typical 4%–5% sustainability benchmarks.`}
          </span>
        </div>
      )}

      <PlannerDisclaimer
        tone="warning"
        title={isEs ? 'Supuestos Ilustrativos' : 'Illustrative Assumptions Disclaimer'}
        message={
          isEs
            ? 'Los cálculos de cobertura y crecimiento usan tasas constantes ingresadas por el usuario con fines educativos y no garantizan rendimientos ni sostenibilidad ante secuencias adversas de mercado.'
            : 'Bucket coverage and growth estimates use hypothetical constant returns for planning illustration only and do not guarantee future portfolio outcomes or market performance.'
        }
      />
    </div>
  );
}
