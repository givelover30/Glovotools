import { useMemo, useId } from 'react';
import { Receipt, CalendarClock } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolFieldGroup, ToolMetricTile } from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiInput, UiStatusLabel, UiErrorState } from '../ui/AppPrimitives.tsx';
import {
  PlannerHeaderToolbar,
  PlannerDisclaimer,
  PlannerProgressBar
} from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  DEFAULT_TAX_INSTALLMENTS,
  FreelanceQuarterlyTaxInput,
  QuarterlyTaxInstallmentInput,
  calculateFreelanceQuarterlyTax,
  validateFreelanceQuarterlyTaxInput
} from '../../engine/contracts/planners/freelanceQuarterlyTax.ts';

const DEFAULT_TAX_STATE: FreelanceQuarterlyTaxInput = {
  estimatedAnnualGrossRevenue: 95000,
  estimatedAnnualBusinessExpenses: 15000,
  taxReserveRatePct: 28,
  priorYearTaxSafeHarbor: 20000,
  installments: DEFAULT_TAX_INSTALLMENTS
};

const EMPTY_TAX_STATE: FreelanceQuarterlyTaxInput = {
  estimatedAnnualGrossRevenue: 0,
  estimatedAnnualBusinessExpenses: 0,
  taxReserveRatePct: 25,
  priorYearTaxSafeHarbor: 0,
  installments: DEFAULT_TAX_INSTALLMENTS.map((q) => ({ ...q, amountPaid: 0 }))
};

function sanitizeTaxState(raw: unknown): FreelanceQuarterlyTaxInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<FreelanceQuarterlyTaxInput>;
  if (
    typeof obj.estimatedAnnualGrossRevenue !== 'number' ||
    typeof obj.estimatedAnnualBusinessExpenses !== 'number' ||
    typeof obj.taxReserveRatePct !== 'number' ||
    !Array.isArray(obj.installments) ||
    obj.installments.length !== 4
  ) {
    return null;
  }
  const installments: QuarterlyTaxInstallmentInput[] = obj.installments.map((q, idx) => ({
    id: (['q1', 'q2', 'q3', 'q4'][idx] as QuarterlyTaxInstallmentInput['id']) || 'q1',
    label: typeof q.label === 'string' ? q.label : DEFAULT_TAX_INSTALLMENTS[idx].label,
    dueDate: typeof q.dueDate === 'string' ? q.dueDate : DEFAULT_TAX_INSTALLMENTS[idx].dueDate,
    weightPct: typeof q.weightPct === 'number' && Number.isFinite(q.weightPct) ? Math.max(0, q.weightPct) : 25,
    amountPaid: typeof q.amountPaid === 'number' && Number.isFinite(q.amountPaid) ? Math.max(0, q.amountPaid) : 0,
    notes: typeof q.notes === 'string' ? q.notes : ''
  }));
  return {
    estimatedAnnualGrossRevenue: Math.max(0, obj.estimatedAnnualGrossRevenue),
    estimatedAnnualBusinessExpenses: Math.max(0, obj.estimatedAnnualBusinessExpenses),
    taxReserveRatePct: Math.max(0, Math.min(70, obj.taxReserveRatePct)),
    priorYearTaxSafeHarbor:
      typeof obj.priorYearTaxSafeHarbor === 'number' && Number.isFinite(obj.priorYearTaxSafeHarbor)
        ? Math.max(0, obj.priorYearTaxSafeHarbor)
        : 0,
    installments
  };
}

export default function FreelanceQuarterlyTaxPaymentPlannerCalculator() {
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
  } = usePlannerStorage<FreelanceQuarterlyTaxInput>({
    storageKey: 'calctools_freelance_quarterly_tax_v1',
    version: 1,
    defaultValue: DEFAULT_TAX_STATE,
    sanitize: sanitizeTaxState
  });

  const errors = useMemo(() => validateFreelanceQuarterlyTaxInput(state), [state]);
  const result = useMemo(() => {
    if (errors.length > 0) return null;
    try {
      return calculateFreelanceQuarterlyTax(state);
    } catch {
      return null;
    }
  }, [state, errors]);

  const updateInstallment = (
    id: QuarterlyTaxInstallmentInput['id'],
    patch: Partial<QuarterlyTaxInstallmentInput>
  ) => {
    setState((prev) => ({
      ...prev,
      installments: prev.installments.map((q) => (q.id === id ? { ...q, ...patch } : q))
    }));
  };

  const handleExportCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'freelance_quarterly_tax_schedule.csv',
      ['Quarter', 'Due Date', 'Weight (%)', 'Scheduled Payment', 'Amount Paid', 'Remaining Due', 'Status', 'Notes'],
      result.installments.map((q) => [
        q.label,
        q.dueDate,
        q.weightPct,
        q.scheduledAmount,
        q.amountPaid,
        q.remainingDue,
        q.status,
        q.notes ?? ''
      ])
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('freelance_quarterly_tax_schedule.json', { inputs: state, results: result });
  };

  const copySummary = result
    ? `Estimated Net Profit: ${fmtMoney(result.estimatedAnnualNetProfit)} | Configured Reserve (${result.taxReserveRatePct}%): ${fmtMoney(result.estimatedAnnualTaxReserve)} | Monthly Set-Aside: ${fmtMoney(result.recommendedMonthlySetAside)} | Paid: ${fmtMoney(result.totalPaidToDate)} | Remaining: ${fmtMoney(result.totalRemainingDue)}`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerDisclaimer
        tone="warning"
        title={isEs ? 'Aviso Fiscal / Tributario' : 'Tax Planning Disclaimer'}
        message={
          isEs
            ? 'Este planificador usa la tasa de reserva configurable que tú definas (no aplica tablas fiscales locales ni deducciones automáticas). Consulta a un contador o asesor fiscal autorizado para tus obligaciones exactas.'
            : 'This planner applies your configured reserve percentage and does not compute statutory federal, state, or local tax brackets. Consult a qualified accountant or tax advisor for filing compliance.'
        }
      />

      <PlannerHeaderToolbar
        icon={<Receipt className="w-4 h-4" />}
        title={isEs ? 'Planificador de Pagos Trimestrales de Impuestos' : 'Freelancer Quarterly Estimated Tax Payment Planner'}
        subtitle={
          isEs
            ? 'Calcula reservas trimestrales sobre utilidad neta estimada y registra pagos Q1–Q4 con fechas editables'
            : 'Schedule configurable Q1–Q4 estimated tax reserves, monthly set-aside & payment tracking'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={result ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_TAX_STATE)}
        canClear={state.estimatedAnnualGrossRevenue > 0 || state.installments.some((q) => q.amountPaid > 0)}
      />

      {/* Profit & Configurable Rate Inputs */}
      <section className="ui-panel p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <ToolFieldGroup
          label={isEs ? `Ingresos Brutos Anuales (${currencyMeta.symbol})` : `Annual Gross Revenue (${currencyMeta.symbol})`}
          htmlFor={`${baseId}-gross`}
        >
          <UiInput
            id={`${baseId}-gross`}
            type="number"
            min={0}
            step={1000}
            value={state.estimatedAnnualGrossRevenue}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                estimatedAnnualGrossRevenue: Math.max(0, Number(e.target.value) || 0)
              }))
            }
            className="font-mono font-bold"
          />
        </ToolFieldGroup>
        <ToolFieldGroup
          label={isEs ? `Gastos Deducibles Est. (${currencyMeta.symbol})` : `Business Expenses (${currencyMeta.symbol})`}
          htmlFor={`${baseId}-exp`}
        >
          <UiInput
            id={`${baseId}-exp`}
            type="number"
            min={0}
            step={500}
            value={state.estimatedAnnualBusinessExpenses}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                estimatedAnnualBusinessExpenses: Math.max(0, Number(e.target.value) || 0)
              }))
            }
            className="font-mono"
          />
        </ToolFieldGroup>
        <ToolFieldGroup
          label={isEs ? 'Tasa de Reserva Fiscal (%)' : 'Configured Tax Reserve (%)'}
          htmlFor={`${baseId}-rate`}
          hint={isEs ? 'Ajustable según tu tramo' : 'Adjust to your effective rate'}
        >
          <UiInput
            id={`${baseId}-rate`}
            type="number"
            min={0}
            max={70}
            step={0.5}
            value={state.taxReserveRatePct}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                taxReserveRatePct: Math.max(0, Math.min(70, Number(e.target.value) || 0))
              }))
            }
            className="font-mono font-bold"
          />
        </ToolFieldGroup>
        <ToolFieldGroup
          label={isEs ? `Referencia Año Anterior (${currencyMeta.symbol})` : `Prior-Year Tax Ref. (${currencyMeta.symbol})`}
          htmlFor={`${baseId}-safe`}
          hint={isEs ? 'opcional / referencia' : 'optional safe-harbor check'}
        >
          <UiInput
            id={`${baseId}-safe`}
            type="number"
            min={0}
            step={500}
            value={state.priorYearTaxSafeHarbor}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                priorYearTaxSafeHarbor: Math.max(0, Number(e.target.value) || 0)
              }))
            }
            className="font-mono"
          />
        </ToolFieldGroup>
      </section>

      {errors.length > 0 && <UiErrorState message={errors[0].message} />}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Utilidad Neta Estimada' : 'Estimated Net Profit'}
          value={result ? fmtMoney(result.estimatedAnnualNetProfit) : '—'}
          hint={isEs ? 'ingresos - gastos' : 'gross minus expenses'}
        />
        <ToolMetricTile
          label={isEs ? 'Reserva Fiscal Anual' : 'Annual Tax Reserve'}
          value={result ? fmtMoney(result.estimatedAnnualTaxReserve) : '—'}
          hint={
            result
              ? `${fmtMoney(result.recommendedMonthlySetAside)} / ${isEs ? 'mes apartado' : 'mo set-aside'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Pagado a la Fecha' : 'Total Paid to Date'}
          value={result ? fmtMoney(result.totalPaidToDate) : '—'}
          hint={result ? `${result.completionPct}% ${isEs ? 'cubierto' : 'funded'}` : ''}
        />
        <ToolMetricTile
          label={isEs ? 'Saldo Pendiente Restante' : 'Remaining Balance Due'}
          value={result ? fmtMoney(result.totalRemainingDue) : '—'}
          hint={
            result?.nextDueQuarter
              ? `${isEs ? 'Próximo:' : 'Next:'} ${result.nextDueQuarter.id.toUpperCase()} (${result.nextDueQuarter.dueDate})`
              : isEs
              ? 'Trimestres cubiertos'
              : 'All quarters covered'
          }
          accent
        />
      </div>

      {result && (
        <section className="ui-panel p-4 sm:p-5">
          <PlannerProgressBar
            label={isEs ? 'Avance de Pagos Estimados del Año' : 'Annual Estimated Tax Payment Progress'}
            percent={result.completionPct}
            valueLabel={`${fmtMoney(result.totalPaidToDate)} / ${fmtMoney(result.estimatedAnnualTaxReserve)}`}
            tone={result.completionPct >= 100 ? 'success' : 'accent'}
          />
        </section>
      )}

      {/* Quarterly Schedule Cards */}
      <section className="ui-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-accent" />
            {isEs ? 'Calendario de Cuotas Trimestrales (Q1–Q4)' : 'Quarterly Installment Schedule (Q1–Q4)'}
          </h3>
          <span className="text-xs text-text-secondary">
            {isEs ? 'Fechas y pesos editables (suma 100%)' : 'Editable due dates & weights (total 100%)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.installments.map((q) => {
            const comp = result?.installments.find((c) => c.id === q.id);
            const tone =
              comp?.status === 'Paid' ? 'success' : comp?.status === 'Partial' ? 'warning' : 'neutral';
            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-border-subtle bg-surface-secondary/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-text-primary">{q.label}</span>
                  {comp && <UiStatusLabel tone={tone}>{comp.status}</UiStatusLabel>}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <ToolFieldGroup label={isEs ? 'Fecha Límite' : 'Due Date'}>
                    <UiInput
                      type="date"
                      value={q.dueDate}
                      onChange={(e) => updateInstallment(q.id, { dueDate: e.target.value })}
                      className="font-mono text-xs"
                    />
                  </ToolFieldGroup>
                  <ToolFieldGroup label={isEs ? 'Peso (%)' : 'Weight (%)'}>
                    <UiInput
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={q.weightPct}
                      onChange={(e) =>
                        updateInstallment(q.id, {
                          weightPct: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        })
                      }
                      className="font-mono text-xs"
                    />
                  </ToolFieldGroup>
                  <ToolFieldGroup label={isEs ? `Pagado (${currencyMeta.symbol})` : `Paid (${currencyMeta.symbol})`}>
                    <UiInput
                      type="number"
                      min={0}
                      step={100}
                      value={q.amountPaid}
                      onChange={(e) =>
                        updateInstallment(q.id, {
                          amountPaid: Math.max(0, Number(e.target.value) || 0)
                        })
                      }
                      className="font-mono font-bold text-xs"
                    />
                  </ToolFieldGroup>
                </div>

                {comp && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
                    <span className="text-text-secondary">
                      {isEs ? 'Objetivo:' : 'Scheduled:'}{' '}
                      <strong className="font-mono text-text-primary">{fmtMoney(comp.scheduledAmount)}</strong>
                    </span>
                    <span className="text-text-secondary">
                      {isEs ? 'Pendiente:' : 'Remaining:'}{' '}
                      <strong className="font-mono text-accent">{fmtMoney(comp.remainingDue)}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
