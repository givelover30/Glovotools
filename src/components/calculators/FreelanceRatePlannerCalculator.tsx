import { useId, useMemo } from 'react';
import { Briefcase, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolMetricTile,
  ToolBreakdownList
} from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiInput, UiErrorState } from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerDisclaimer,
  PlannerProgressBar
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  FreelanceRateInput,
  calculateFreelanceRate,
  validateFreelanceRateInput
} from '../../engine/contracts/planners/freelanceRate.ts';

const DEFAULT_RATE_STATE: FreelanceRateInput = {
  desiredAnnualIncome: 75000,
  annualExpenses: 9600,
  taxReservePct: 25,
  profitMarginPct: 10,
  workingWeeksPerYear: 48,
  daysPerWeek: 5,
  hoursPerDay: 8,
  billableUtilizationPct: 65
};

const EMPTY_RATE_STATE: FreelanceRateInput = {
  desiredAnnualIncome: 0,
  annualExpenses: 0,
  taxReservePct: 20,
  profitMarginPct: 0,
  workingWeeksPerYear: 48,
  daysPerWeek: 5,
  hoursPerDay: 8,
  billableUtilizationPct: 60
};

function sanitizeRateState(raw: unknown): FreelanceRateInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<FreelanceRateInput>;
  const keys: Array<keyof FreelanceRateInput> = [
    'desiredAnnualIncome',
    'annualExpenses',
    'taxReservePct',
    'profitMarginPct',
    'workingWeeksPerYear',
    'daysPerWeek',
    'hoursPerDay',
    'billableUtilizationPct'
  ];
  for (const k of keys) {
    if (typeof obj[k] !== 'number' || !Number.isFinite(obj[k])) return null;
  }
  return obj as FreelanceRateInput;
}

export default function FreelanceRatePlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtMoney = (val: number) =>
    formatCurrency(val, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<FreelanceRateInput>({
    storageKey: 'calctools_freelance_rate_planner_v1',
    version: 1,
    defaultValue: DEFAULT_RATE_STATE,
    sanitize: sanitizeRateState
  });

  const updateNum = (field: keyof FreelanceRateInput, value: string) => {
    const num = value === '' ? 0 : Number(value);
    setState((prev) => ({ ...prev, [field]: Number.isFinite(num) ? num : 0 }));
  };

  const errors = useMemo(() => validateFreelanceRateInput(state), [state]);
  const errorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const err of errors) {
      if (err.field) m[err.field] = err.message;
    }
    return m;
  }, [errors]);

  const result = useMemo(() => {
    if (errors.length > 0) return null;
    try {
      return calculateFreelanceRate(state);
    } catch {
      return null;
    }
  }, [state, errors]);

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'freelance_rate_plan.csv',
      ['Metric', 'Value', 'Unit'],
      [
        ['Desired Annual Compensation', result.desiredAnnualIncome, currencyMeta.code],
        ['Annual Business Overhead', result.annualExpenses, currencyMeta.code],
        ['Tax Reserve (%)', result.taxReservePct, '%'],
        ['Tax Reserve Amount', result.taxReserveAmount, currencyMeta.code],
        ['Profit / Buffer (%)', result.profitMarginPct, '%'],
        ['Profit / Buffer Amount', result.profitBufferAmount, currencyMeta.code],
        ['Required Annual Gross Revenue', result.requiredAnnualRevenue, currencyMeta.code],
        ['Total Working Days / Year', result.totalWorkingDaysPerYear, 'days'],
        ['Annual Billable Hours', result.annualBillableHours, 'hours'],
        ['Non-Billable Admin Hours', result.nonBillableHours, 'hours'],
        ['Target Hourly Billable Rate', result.targetHourlyRate, `${currencyMeta.code}/hr`],
        ['Target Billable Day Rate', result.targetBillableDayRate, `${currencyMeta.code}/day`],
        ['Target Weekly Revenue', result.targetWeeklyRevenue, `${currencyMeta.code}/wk`],
        ['Target Monthly Revenue', result.targetMonthlyRevenue, `${currencyMeta.code}/mo`]
      ]
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('freelance_rate_plan.json', { inputs: state, results: result });
  };

  const copySummary = result
    ? `Target Freelance Rate: ${fmtMoney(result.targetHourlyRate)}/hr (${fmtMoney(result.targetBillableDayRate)}/day) | Annual Revenue Target: ${fmtMoney(result.requiredAnnualRevenue)} | Billable Hours: ${result.annualBillableHours} hrs/yr (${state.billableUtilizationPct}% utilization)`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<Briefcase className="w-4 h-4" />}
        title={isEs ? 'Planificador de Tarifa Freelance y Horas Facturables' : 'Freelancer Hourly Rate & Billable Hours Planner'}
        subtitle={
          isEs
            ? 'Calcula tarifas por hora, día y meta anual considerando gastos, impuestos, margen y tiempo no facturable'
            : 'Plan hourly/daily rates from target income, overhead, tax reserve, buffer & billable utilization'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={result ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_RATE_STATE)}
        canClear={state.desiredAnnualIncome > 0 || state.annualExpenses > 0}
      />

      {errors.length > 0 && <UiErrorState message={errors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Tarifa Horaria Objetivo' : 'Target Billable Rate'}
          value={result ? `${fmtMoney(result.targetHourlyRate)}/hr` : '—'}
          hint={isEs ? 'por hora facturable' : 'per billable hour'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Tarifa Diaria (Día Completo)' : 'Target Day Rate'}
          value={result ? fmtMoney(result.targetBillableDayRate) : '—'}
          hint={`${state.hoursPerDay}h × ${isEs ? 'tarifa horaria' : 'hourly rate'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Facturación Anual Requerida' : 'Required Annual Revenue'}
          value={result ? fmtMoney(result.requiredAnnualRevenue) : '—'}
          hint={result ? `${fmtMoney(result.targetMonthlyRevenue)} / ${isEs ? 'mes' : 'mo'}` : ''}
        />
        <ToolMetricTile
          label={isEs ? 'Horas Facturables / Año' : 'Annual Billable Hours'}
          value={result ? `${result.annualBillableHours} h` : '—'}
          hint={
            result
              ? `${result.nonBillableHours}h ${isEs ? 'no facturables' : 'admin/non-billable'}`
              : ''
          }
        />
      </div>

      {/* Two-Column Inputs + Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 ui-panel p-5 sm:p-6 space-y-5">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-accent" />
              {isEs ? 'A. Metas Financieras y Reservas' : 'A. Income, Expenses & Reserves'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <ToolFieldGroup
                label={isEs ? `Ingreso Neto Anual Deseado (${currencyMeta.symbol})` : `Desired Annual Income (${currencyMeta.symbol})`}
                htmlFor={`${baseId}-inc`}
                error={errorMap.desiredAnnualIncome}
              >
                <UiInput
                  id={`${baseId}-inc`}
                  type="number"
                  min={0}
                  step={500}
                  value={state.desiredAnnualIncome}
                  onChange={(e) => updateNum('desiredAnnualIncome', e.target.value)}
                  className="font-mono font-bold"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? `Gastos Anuales de Operación (${currencyMeta.symbol})` : `Annual Business Expenses (${currencyMeta.symbol})`}
                htmlFor={`${baseId}-exp`}
                error={errorMap.annualExpenses}
              >
                <UiInput
                  id={`${baseId}-exp`}
                  type="number"
                  min={0}
                  step={200}
                  value={state.annualExpenses}
                  onChange={(e) => updateNum('annualExpenses', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? 'Reserva para Impuestos (%)' : 'Tax Reserve Target (%)'}
                htmlFor={`${baseId}-tax`}
                error={errorMap.taxReservePct}
              >
                <UiInput
                  id={`${baseId}-tax`}
                  type="number"
                  min={0}
                  max={70}
                  step={1}
                  value={state.taxReservePct}
                  onChange={(e) => updateNum('taxReservePct', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? 'Margen de Beneficio / Colchón (%)' : 'Profit / Contingency Buffer (%)'}
                htmlFor={`${baseId}-prof`}
                error={errorMap.profitMarginPct}
              >
                <UiInput
                  id={`${baseId}-prof`}
                  type="number"
                  min={0}
                  max={60}
                  step={1}
                  value={state.profitMarginPct}
                  onChange={(e) => updateNum('profitMarginPct', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              {isEs ? 'B. Capacidad y Utilización Facturable' : 'B. Working Capacity & Billable Utilization'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <ToolFieldGroup
                label={isEs ? 'Semanas Trabajadas / Año' : 'Working Weeks / Year'}
                htmlFor={`${baseId}-weeks`}
                error={errorMap.workingWeeksPerYear}
                hint={isEs ? '52 menos vacaciones/feriados' : '52 minus holidays & PTO'}
              >
                <UiInput
                  id={`${baseId}-weeks`}
                  type="number"
                  min={1}
                  max={52}
                  value={state.workingWeeksPerYear}
                  onChange={(e) => updateNum('workingWeeksPerYear', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? 'Días por Semana' : 'Working Days / Week'}
                htmlFor={`${baseId}-days`}
                error={errorMap.daysPerWeek}
              >
                <UiInput
                  id={`${baseId}-days`}
                  type="number"
                  min={1}
                  max={7}
                  value={state.daysPerWeek}
                  onChange={(e) => updateNum('daysPerWeek', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? 'Horas por Día Laboral' : 'Hours / Working Day'}
                htmlFor={`${baseId}-hours`}
                error={errorMap.hoursPerDay}
              >
                <UiInput
                  id={`${baseId}-hours`}
                  type="number"
                  min={1}
                  max={16}
                  step={0.5}
                  value={state.hoursPerDay}
                  onChange={(e) => updateNum('hoursPerDay', e.target.value)}
                  className="font-mono"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label={isEs ? 'Utilización Facturable (%)' : 'Billable Utilization (%)'}
                htmlFor={`${baseId}-util`}
                error={errorMap.billableUtilizationPct}
                hint={isEs ? 'Típico: 60%–75%' : 'Typical solo range: 60%–75%'}
              >
                <UiInput
                  id={`${baseId}-util`}
                  type="number"
                  min={5}
                  max={100}
                  step={5}
                  value={state.billableUtilizationPct}
                  onChange={(e) => updateNum('billableUtilizationPct', e.target.value)}
                  className="font-mono font-bold"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text-primary">
              {isEs ? 'Desglose de Facturación y Capacidad' : 'Revenue & Capacity Breakdown'}
            </h3>
          </div>

          {result && (
            <>
              <ToolBreakdownList
                items={[
                  { label: isEs ? 'Meta de Ingreso Neto' : 'Target Owner Income', value: fmtMoney(result.desiredAnnualIncome), highlight: true },
                  { label: isEs ? 'Gastos de Operación' : 'Annual Overhead', value: fmtMoney(result.annualExpenses) },
                  { label: isEs ? `Reserva Fiscal (${result.taxReservePct}%)` : `Tax Reserve (${result.taxReservePct}%)`, value: fmtMoney(result.taxReserveAmount) },
                  { label: isEs ? `Margen / Colchón (${result.profitMarginPct}%)` : `Profit Buffer (${result.profitMarginPct}%)`, value: fmtMoney(result.profitBufferAmount) },
                  { label: isEs ? 'Facturación Bruta Anual' : 'Required Annual Revenue', value: fmtMoney(result.requiredAnnualRevenue), highlight: true },
                  { label: isEs ? 'Meta Mensual' : 'Monthly Revenue Target', value: fmtMoney(result.targetMonthlyRevenue) },
                  { label: isEs ? 'Meta Semanal' : 'Weekly Revenue Target', value: fmtMoney(result.targetWeeklyRevenue) },
                  { label: isEs ? 'Horas Laborales Totales' : 'Total Annual Hours', value: `${result.totalWorkingHoursPerYear} h` },
                  { label: isEs ? 'Horas Facturables' : 'Billable Hours / Yr', value: `${result.annualBillableHours} h` },
                  { label: isEs ? 'Compensación Neta / Hora Trabajada' : 'Effective Net Pay / Work Hour', value: `${fmtMoney(result.effectiveHourlyTakeHome)}/hr` }
                ]}
              />

              <div className="pt-2 space-y-2.5">
                <PlannerProgressBar
                  label={isEs ? 'Tiempo Facturable vs. Administrativo' : 'Billable vs. Non-Billable Split'}
                  percent={state.billableUtilizationPct}
                  valueLabel={`${result.annualBillableHours}h / ${result.totalWorkingHoursPerYear}h (${state.billableUtilizationPct}%)`}
                  tone="accent"
                />
              </div>
            </>
          )}
        </section>
      </div>

      <PlannerDisclaimer
        tone="info"
        title={isEs ? 'Fórmula Sin Doble Conteo' : 'Accounting Identity Note'}
        message={
          isEs
            ? 'Los porcentajes de impuestos y margen de reserva se aplican sobre los ingresos brutos requeridos para que Ingreso Neto + Gastos + Reserva Fiscal + Margen sumen exactamente el 100% de la facturación objetivo. Ajusta el % de impuestos según tu jurisdicción.'
            : 'Tax reserve and profit buffer percentages are solved over gross revenue so Owner Income + Overhead + Tax Reserve + Profit Buffer sum cleanly to 100% of required revenue. Consult a tax professional for local rates.'
        }
      />
    </div>
  );
}
