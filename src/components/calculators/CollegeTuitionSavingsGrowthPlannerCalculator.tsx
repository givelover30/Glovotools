import { useId, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';
import { PlannerDisclaimer, PlannerProgressBar } from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  CollegeTuitionInput,
  calculateCollegeTuitionPlan,
  validateCollegeTuitionInput
} from '../../engine/contracts/planners/collegeTuitionSavings.ts';

interface StoredCollegeForm {
  currentAnnualTuition: string;
  programYears: string;
  yearsUntilEnrollment: string;
  tuitionInflationPct: string;
  currentSavings: string;
  monthlyContribution: string;
  expectedAnnualReturnPct: string;
}

const DEFAULTS: StoredCollegeForm = {
  currentAnnualTuition: '24000',
  programYears: '4',
  yearsUntilEnrollment: '10',
  tuitionInflationPct: '5',
  currentSavings: '12000',
  monthlyContribution: '450',
  expectedAnnualReturnPct: '6.5'
};

const EMPTY_FORM: StoredCollegeForm = {
  currentAnnualTuition: '',
  programYears: '4',
  yearsUntilEnrollment: '',
  tuitionInflationPct: '5',
  currentSavings: '',
  monthlyContribution: '',
  expectedAnnualReturnPct: '6.5'
};

function sanitizeCollegeForm(raw: unknown): StoredCollegeForm | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<StoredCollegeForm>;
  if (
    typeof obj.currentAnnualTuition !== 'string' ||
    typeof obj.yearsUntilEnrollment !== 'string' ||
    typeof obj.currentSavings !== 'string' ||
    typeof obj.monthlyContribution !== 'string'
  ) {
    return null;
  }
  return { ...DEFAULTS, ...obj };
}

export default function CollegeTuitionSavingsGrowthPlannerCalculator() {
  const { currency, formatCurrency: fmtCurrency } = useCurrency();
  const { language } = useTranslation();
  const isEs = language === 'es';
  const baseId = useId();

  const {
    state: form,
    setState: setForm,
    resetToDefault,
    clearWithState
  } = usePlannerStorage<StoredCollegeForm>({
    storageKey: 'calctools_college_tuition_planner_v1',
    version: 1,
    defaultValue: DEFAULTS,
    sanitize: sanitizeCollegeForm
  });

  const updateField = (field: keyof StoredCollegeForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isEmpty =
    form.currentAnnualTuition.trim() === '' ||
    form.programYears.trim() === '' ||
    form.yearsUntilEnrollment.trim() === '' ||
    form.tuitionInflationPct.trim() === '' ||
    form.currentSavings.trim() === '' ||
    form.monthlyContribution.trim() === '' ||
    form.expectedAnnualReturnPct.trim() === '';

  const parsedInput: CollegeTuitionInput = useMemo(
    () => ({
      currentAnnualTuition: Number(form.currentAnnualTuition),
      programYears: Number(form.programYears),
      yearsUntilEnrollment: Number(form.yearsUntilEnrollment),
      tuitionInflationPct: Number(form.tuitionInflationPct),
      currentSavings: Number(form.currentSavings),
      monthlyContribution: Number(form.monthlyContribution),
      expectedAnnualReturnPct: Number(form.expectedAnnualReturnPct)
    }),
    [form]
  );

  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (isEmpty) return map;
    for (const err of validateCollegeTuitionInput(parsedInput)) {
      if (err.field) map[err.field] = err.message;
    }
    return map;
  }, [isEmpty, parsedInput]);

  const hasErrors = Object.keys(errorMap).length > 0;

  const result = useMemo(() => {
    if (isEmpty || hasErrors) return null;
    try {
      return calculateCollegeTuitionPlan(parsedInput);
    } catch {
      return null;
    }
  }, [isEmpty, hasErrors, parsedInput]);

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = result
    ? `Projected Education Savings: ${fmtCurrency(result.projectedSavingsAtEnrollment)} | Future Tuition (${result.programYears} yrs): ${fmtCurrency(result.totalProjectedTuitionCost)} | Coverage: ${result.fundingCoveragePct}% | Required Monthly: ${fmtCurrency(result.requiredMonthlyContributionToFund)}`
    : '';

  const handleDownloadCsv = () => {
    if (!result) return;
    downloadCsvFile(
      'college_tuition_savings_plan.csv',
      ['Year', 'Starting Balance', 'Annual Contributions', 'Investment Growth', 'Ending Balance'],
      result.schedule.map((row) => [
        row.year,
        row.startingBalance,
        row.annualContribution,
        row.investmentGrowth,
        row.endingBalance
      ])
    );
  };

  const handleDownloadJson = () => {
    if (!result) return;
    downloadJsonFile('college_tuition_savings_plan.json', {
      inputs: parsedInput,
      results: result
    });
  };

  return (
    <div className="space-y-4">
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title={isEs ? 'Planificador de Ahorro y Matrícula Universitaria' : 'College Tuition & 529 Savings Growth Planner'}
            subtitle={
              isEs
                ? 'Proyecta el costo futuro de matrícula con inflación y el aporte mensual requerido para cubrirlo.'
                : 'Project inflation-adjusted university costs, savings compounding & target monthly contributions.'
            }
            onReset={resetToDefault}
            onClear={() => clearWithState(EMPTY_FORM)}
          >
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'A. Costos de Matrícula y Horizonte' : 'A. Tuition Cost & Timeline'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup
                  label={isEs ? 'Matrícula Anual Actual' : 'Current Annual Tuition'}
                  htmlFor={`${baseId}-tuit`}
                  unit={currency}
                  error={errorMap.currentAnnualTuition}
                >
                  <input
                    id={`${baseId}-tuit`}
                    type="number"
                    min="0"
                    step="500"
                    value={form.currentAnnualTuition}
                    onChange={(e) => updateField('currentAnnualTuition', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup
                  label={isEs ? 'Inflación de Matrícula' : 'Tuition Inflation'}
                  htmlFor={`${baseId}-inf`}
                  unit="%/yr"
                  error={errorMap.tuitionInflationPct}
                >
                  <input
                    id={`${baseId}-inf`}
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={form.tuitionInflationPct}
                    onChange={(e) => updateField('tuitionInflationPct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup
                  label={isEs ? 'Años Hasta el Ingreso' : 'Years Until Enrollment'}
                  htmlFor={`${baseId}-yrs`}
                  unit={isEs ? 'Años' : 'Years'}
                  error={errorMap.yearsUntilEnrollment}
                >
                  <input
                    id={`${baseId}-yrs`}
                    type="number"
                    min="0"
                    max="25"
                    step="1"
                    value={form.yearsUntilEnrollment}
                    onChange={(e) => updateField('yearsUntilEnrollment', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup
                  label={isEs ? 'Duración del Programa' : 'Program Length'}
                  htmlFor={`${baseId}-prog`}
                  unit={isEs ? 'Años' : 'Years'}
                  error={errorMap.programYears}
                >
                  <input
                    id={`${baseId}-prog`}
                    type="number"
                    min="1"
                    max="8"
                    step="1"
                    value={form.programYears}
                    onChange={(e) => updateField('programYears', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'B. Plan de Ahorro Educativo' : 'B. Education Savings Plan'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup
                  label={isEs ? 'Ahorro Actual' : 'Current Savings'}
                  htmlFor={`${baseId}-sav`}
                  unit={currency}
                  error={errorMap.currentSavings}
                >
                  <input
                    id={`${baseId}-sav`}
                    type="number"
                    min="0"
                    step="500"
                    value={form.currentSavings}
                    onChange={(e) => updateField('currentSavings', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup
                  label={isEs ? 'Aporte Mensual' : 'Monthly Contribution'}
                  htmlFor={`${baseId}-mo`}
                  unit={currency}
                  error={errorMap.monthlyContribution}
                >
                  <input
                    id={`${baseId}-mo`}
                    type="number"
                    min="0"
                    step="25"
                    value={form.monthlyContribution}
                    onChange={(e) => updateField('monthlyContribution', e.target.value)}
                    className="ui-input font-mono tabular-nums font-bold"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup
                  label={isEs ? 'Rendimiento Anual Est.' : 'Expected Annual Return'}
                  htmlFor={`${baseId}-ret`}
                  unit="%"
                  error={errorMap.expectedAnnualReturnPct}
                >
                  <input
                    id={`${baseId}-ret`}
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.expectedAnnualReturnPct}
                    onChange={(e) => updateField('expectedAnnualReturnPct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>
            </div>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title={isEs ? 'Proyección de Ahorro y Matrícula' : 'Tuition & Savings Projections'}
            state={resultState}
            emptyTitle={isEs ? 'Ingresa datos de matrícula y ahorro' : 'Enter tuition and savings inputs'}
            emptyDescription={
              isEs
                ? 'Completa los campos a la izquierda para calcular la meta mensual y brecha de financiamiento.'
                : 'Specify tuition, inflation, and monthly savings on the left to calculate funding coverage.'
            }
            copyText={copyText}
          >
            {result && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-result-border bg-result-bg p-5 sm:p-6 space-y-1 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-result-icon flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {isEs ? 'Ahorro Proyectado al Ingreso' : 'Projected Savings at Enrollment'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-result-text py-1">
                    {fmtCurrency(result.projectedSavingsAtEnrollment)}
                  </div>
                  <p className="text-xs text-result-text-secondary">
                    {isEs
                      ? `Cubre el ${result.fundingCoveragePct}% del costo total estimado de ${result.programYears} años (${fmtCurrency(result.totalProjectedTuitionCost)}).`
                      : `Covers ${result.fundingCoveragePct}% of projected ${result.programYears}-year tuition cost (${fmtCurrency(result.totalProjectedTuitionCost)}).`}
                  </p>
                </div>

                <PlannerProgressBar
                  label={isEs ? 'Cobertura de Matrícula Proyectada' : 'Projected Tuition Funding Coverage'}
                  percent={Math.min(100, result.fundingCoveragePct)}
                  valueLabel={`${result.fundingCoveragePct}%`}
                  tone={result.fundingCoveragePct >= 100 ? 'success' : 'accent'}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5">
                    <span className="text-[11px] font-semibold text-text-secondary block">
                      {isEs ? 'Costo Total Futuro (Con Inflación)' : 'Total Projected Tuition'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block">
                      {fmtCurrency(result.totalProjectedTuitionCost)}
                    </span>
                    <span className="text-[10px] text-text-tertiary block">
                      {isEs ? 'Año 1 al ingreso:' : 'Year 1 tuition:'} {fmtCurrency(result.firstYearTuitionAtEnrollment)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5">
                    <span className="text-[11px] font-semibold text-text-secondary block">
                      {isEs ? 'Aporte Mensual Requerido (100%)' : 'Required Monthly to Fully Fund'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-accent mt-1 block">
                      {fmtCurrency(result.requiredMonthlyContributionToFund)} / {isEs ? 'mes' : 'mo'}
                    </span>
                    <span className="text-[10px] text-text-tertiary block">
                      {result.additionalMonthlyContributionNeeded > 0
                        ? `${isEs ? 'Adicional:' : 'Need +'}${fmtCurrency(result.additionalMonthlyContributionNeeded)}/mo`
                        : isEs
                        ? 'Meta actual suficiente'
                        : 'Current plan meets target'}
                    </span>
                  </div>
                </div>

                <ToolBreakdownList
                  items={[
                    { label: isEs ? 'Aportes Totales (Capital + Cuotas)' : 'Total Principal Contributed', value: fmtCurrency(result.totalPrincipalContributed) },
                    { label: isEs ? 'Rendimiento Compuesto Estimado' : 'Estimated Compound Growth', value: fmtCurrency(result.totalInvestmentGrowth), highlight: true },
                    {
                      label:
                        result.fundingSurplusOrGap >= 0
                          ? isEs
                            ? 'Excedente Proyectado'
                            : 'Projected Surplus'
                          : isEs
                          ? 'Brecha / Déficit Proyectado'
                          : 'Projected Funding Gap',
                      value: fmtCurrency(result.fundingSurplusOrGap),
                      highlight: true
                    }
                  ]}
                />

                <div className="no-print flex flex-wrap items-center gap-2">
                  <UiButton variant="secondary" size="sm" onClick={handleDownloadCsv}>
                    {isEs ? 'Descargar CSV' : 'Download CSV Schedule'}
                  </UiButton>
                  <UiButton variant="secondary" size="sm" onClick={handleDownloadJson}>
                    {isEs ? 'Exportar JSON' : 'Export JSON'}
                  </UiButton>
                </div>

                {result.schedule.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border-subtle">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      {isEs ? 'Crecimiento Anual hasta el Ingreso' : 'Annual Savings Growth Schedule'}
                    </h4>
                    <div className="overflow-x-auto max-h-64 rounded-xl border border-border-main bg-surface">
                      <table className="w-full text-left text-xs font-mono tabular-nums whitespace-nowrap">
                        <thead className="bg-surface-secondary text-text-secondary sticky top-0 border-b border-border-main">
                          <tr>
                            <th className="p-2.5 font-semibold">{isEs ? 'Año' : 'Yr'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Inicio' : 'Start'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Aportes' : 'Contribs'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Crecim.' : 'Growth'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Saldo Final' : 'End Balance'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-text-primary">
                          {result.schedule.map((row) => (
                            <tr key={row.year} className="hover:bg-surface-hover">
                              <td className="p-2.5">{row.year}</td>
                              <td className="p-2.5">{fmtCurrency(row.startingBalance)}</td>
                              <td className="p-2.5 text-accent">+{fmtCurrency(row.annualContribution)}</td>
                              <td className="p-2.5 text-status-success">+{fmtCurrency(row.investmentGrowth)}</td>
                              <td className="p-2.5 font-bold">{fmtCurrency(row.endingBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ToolResultsPanel>
        }
      />

      <PlannerDisclaimer
        tone="warning"
        title={isEs ? 'Supuestos Ilustrativos' : 'Illustrative Projection Disclaimer'}
        message={
          isEs
            ? 'Los cálculos suponen inflación constante de matrícula y rentabilidad uniforme sin garantías ni modelado tributario específico por jurisdicción.'
            : 'Projections assume constant tuition inflation and investment returns for educational planning only and do not model jurisdiction-specific tax rules or guarantee returns.'
        }
      />
    </div>
  );
}
