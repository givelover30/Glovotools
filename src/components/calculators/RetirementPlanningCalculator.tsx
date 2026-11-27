import { useId, useMemo } from 'react';
import { FileSpreadsheet, Download, PiggyBank } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';
import { PlannerDisclaimer } from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  calculateRetirementPlan,
  validateRetirementPlanInput
} from '../../engine/contracts/planners/retirementPlanning.ts';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface StoredRetirementForm {
  currentAge: string;
  retireAge: string;
  currentBalance: string;
  currentSalary: string;
  contributionPct: string;
  employerMatchPct: string;
  employerMatchLimit: string;
  salaryIncreasePct: string;
  expectedReturn: string;
  inflationRate: string;
  frequency: number;
  safeWithdrawalRatePct: string;
}

const DEFAULTS: StoredRetirementForm = {
  currentAge: '35',
  retireAge: '65',
  currentBalance: '45000',
  currentSalary: '80000',
  contributionPct: '6',
  employerMatchPct: '100',
  employerMatchLimit: '5',
  salaryIncreasePct: '2.5',
  expectedReturn: '7',
  inflationRate: '2.5',
  frequency: 12,
  safeWithdrawalRatePct: '4'
};

const EMPTY_FORM: StoredRetirementForm = {
  currentAge: '',
  retireAge: '',
  currentBalance: '',
  currentSalary: '',
  contributionPct: '',
  employerMatchPct: '',
  employerMatchLimit: '',
  salaryIncreasePct: '',
  expectedReturn: '',
  inflationRate: '',
  frequency: 12,
  safeWithdrawalRatePct: '4'
};

function sanitizeRetirementForm(raw: unknown): StoredRetirementForm | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<StoredRetirementForm>;
  if (
    typeof obj.currentAge !== 'string' ||
    typeof obj.retireAge !== 'string' ||
    typeof obj.currentBalance !== 'string' ||
    typeof obj.currentSalary !== 'string'
  ) {
    return null;
  }
  return {
    ...DEFAULTS,
    ...obj,
    frequency: [1, 12, 24, 26].includes(Number(obj.frequency)) ? Number(obj.frequency) : 12,
    safeWithdrawalRatePct:
      typeof obj.safeWithdrawalRatePct === 'string' ? obj.safeWithdrawalRatePct : '4'
  };
}

export interface RetirementPlanningCalculatorProps {
  mode?: 'planner' | '401k';
}

export default function RetirementPlanningCalculator({
  mode = 'planner'
}: RetirementPlanningCalculatorProps) {
  const { currency, formatCurrency: fmtCurrency } = useCurrency();
  const { language } = useTranslation();
  const isEs = language === 'es';
  const is401k = mode === '401k';

  const storageKey = is401k
    ? 'calctools_401k_planner_v1'
    : 'calctools_retirement_planner_v1';

  const {
    state: form,
    setState: setForm,
    resetToDefault,
    clearWithState
  } = usePlannerStorage<StoredRetirementForm>({
    storageKey,
    version: 1,
    defaultValue: DEFAULTS,
    sanitize: sanitizeRetirementForm
  });

  const ageId = useId();
  const retireAgeId = useId();
  const balanceId = useId();
  const salaryId = useId();
  const contribId = useId();
  const matchPctId = useId();
  const matchLimitId = useId();
  const salaryIncId = useId();
  const returnId = useId();
  const inflationId = useId();
  const freqId = useId();
  const swrId = useId();

  const updateField = <K extends keyof StoredRetirementForm>(
    key: K,
    value: StoredRetirementForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isEmpty =
    form.currentAge.trim() === '' ||
    form.retireAge.trim() === '' ||
    form.currentBalance.trim() === '' ||
    form.currentSalary.trim() === '' ||
    form.contributionPct.trim() === '' ||
    form.employerMatchPct.trim() === '' ||
    form.employerMatchLimit.trim() === '' ||
    form.salaryIncreasePct.trim() === '' ||
    form.expectedReturn.trim() === '' ||
    form.inflationRate.trim() === '' ||
    form.safeWithdrawalRatePct.trim() === '';

  const parsedInput = useMemo(
    () => ({
      currentAge: Number(form.currentAge),
      retireAge: Number(form.retireAge),
      currentBalance: Number(form.currentBalance),
      currentSalary: Number(form.currentSalary),
      contributionPct: Number(form.contributionPct),
      employerMatchPct: Number(form.employerMatchPct),
      employerMatchLimit: Number(form.employerMatchLimit),
      salaryIncreasePct: Number(form.salaryIncreasePct),
      expectedReturn: Number(form.expectedReturn),
      inflationRate: Number(form.inflationRate),
      frequency: form.frequency,
      safeWithdrawalRatePct: Number(form.safeWithdrawalRatePct)
    }),
    [form]
  );

  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    if (isEmpty) return map;
    const validationErrors = validateRetirementPlanInput(parsedInput);
    for (const err of validationErrors) {
      if (err.field) {
        map[err.field] = err.message;
      }
    }
    return map;
  }, [isEmpty, parsedInput]);

  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(() => {
    if (isEmpty || hasErrors) return null;
    try {
      return calculateRetirementPlan(parsedInput);
    } catch {
      return null;
    }
  }, [isEmpty, hasErrors, parsedInput]);

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const yearsUntilRetire = Math.max(0, parsedInput.retireAge - parsedInput.currentAge || 0);

  const copyText = result
    ? `${is401k ? '401(k)' : isEs ? 'Retiro' : 'Retirement'}: ${fmtCurrency(result.projectedBalance)} | ${
        isEs ? 'Valor Real' : 'Inflation-Adjusted'
      }: ${fmtCurrency(result.inflationAdjustedBalance)} | ${result.safeWithdrawalRatePct}% SWR: ${fmtCurrency(
        result.annualSafeWithdrawalNominal
      )}/yr (${fmtCurrency(result.monthlySafeWithdrawalNominal)}/mo)`
    : '';

  const handleDownloadCsv = () => {
    if (!result) return;
    downloadCsvFile(
      is401k ? '401k_retirement_projection.csv' : 'retirement_plan_projection.csv',
      [
        'Year',
        'Age',
        'Annual Income',
        'Personal Contribution',
        'Employer Match',
        'Total Contribution',
        'Investment Growth',
        'Ending Balance (Nominal)',
        'Ending Balance (Inflation-Adjusted)'
      ],
      result.schedule.map((row) => [
        row.year,
        row.age,
        row.salary,
        row.employeeContrib,
        row.employerMatch,
        row.totalContrib,
        row.investmentGrowth,
        row.endingBalance,
        row.inflationAdjustedEndingBalance
      ])
    );
  };

  const handleDownloadJson = () => {
    if (!result) return;
    downloadJsonFile(
      is401k ? '401k_retirement_projection.json' : 'retirement_plan_projection.json',
      { inputs: parsedInput, results: result }
    );
  };

  const titleText = is401k
    ? '401(k) Retirement Calculator'
    : isEs
    ? 'Planificador de Ahorro para el Retiro'
    : 'Retirement Savings & Growth Planner';

  const subtitleText = is401k
    ? 'Project future retirement savings with clean minimalist precision.'
    : isEs
    ? 'Proyecta tu fondo de retiro, impacto de inflación y regla estimada de retiro del 4%.'
    : 'Project your long-term nest egg, inflation-adjusted purchasing power & safe withdrawal estimate.';

  const balanceLabel = is401k
    ? 'Current 401(k) Balance'
    : isEs
    ? 'Ahorro Actual de Retiro'
    : 'Current Retirement Savings';

  return (
    <div className="space-y-4">
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title={titleText}
            subtitle={subtitleText}
            onReset={resetToDefault}
            onClear={() => clearWithState(EMPTY_FORM)}
          >
            {/* A. Retirement Profile */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'A. Perfil de Retiro' : 'A. Retirement Profile'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup
                  label={isEs ? 'Edad Actual' : 'Current Age'}
                  htmlFor={ageId}
                  unit={isEs ? 'Años' : 'Years'}
                  error={errors.currentAge}
                >
                  <input
                    id={ageId}
                    type="number"
                    min="16"
                    max="90"
                    value={form.currentAge}
                    onChange={(e) => updateField('currentAge', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="35"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Edad de Retiro' : 'Retirement Age'}
                  htmlFor={retireAgeId}
                  unit={isEs ? 'Años' : 'Years'}
                  error={errors.retireAge}
                >
                  <input
                    id={retireAgeId}
                    type="number"
                    min="18"
                    max="100"
                    value={form.retireAge}
                    onChange={(e) => updateField('retireAge', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="65"
                  />
                </ToolFieldGroup>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-secondary/60 border border-border-subtle flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  {isEs ? 'Años Hasta el Retiro:' : 'Years Until Retirement:'}
                </span>
                <span className="font-bold font-mono tabular-nums text-accent">
                  {yearsUntilRetire} {isEs ? 'Años' : 'Years'}
                </span>
              </div>
            </div>

            {/* B. Financial Information */}
            <div className="space-y-3 pt-2 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'B. Capital e Ingresos' : 'B. Financial Information'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup
                  label={balanceLabel}
                  htmlFor={balanceId}
                  unit={currency}
                  error={errors.currentBalance}
                >
                  <input
                    id={balanceId}
                    type="number"
                    min="0"
                    step="1000"
                    value={form.currentBalance}
                    onChange={(e) => updateField('currentBalance', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="45000"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={is401k ? 'Current Annual Salary' : isEs ? 'Ingreso Anual Actual' : 'Current Annual Income'}
                  htmlFor={salaryId}
                  unit={currency}
                  error={errors.currentSalary}
                >
                  <input
                    id={salaryId}
                    type="number"
                    min="0"
                    step="1000"
                    value={form.currentSalary}
                    onChange={(e) => updateField('currentSalary', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="80000"
                  />
                </ToolFieldGroup>
              </div>
            </div>

            {/* C. Contribution Settings */}
            <div className="space-y-3 pt-2 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'C. Aportes y Contribución' : 'C. Contribution Settings'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <ToolFieldGroup
                  label={is401k ? 'Employee Contrib.' : isEs ? 'Aporte Propio' : 'Personal Contrib.'}
                  htmlFor={contribId}
                  unit="%"
                  error={errors.contributionPct}
                >
                  <input
                    id={contribId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.contributionPct}
                    onChange={(e) => updateField('contributionPct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="6"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Igualación Empleador' : 'Match Rate'}
                  htmlFor={matchPctId}
                  unit="%"
                  error={errors.employerMatchPct}
                >
                  <input
                    id={matchPctId}
                    type="number"
                    min="0"
                    max="500"
                    step="10"
                    value={form.employerMatchPct}
                    onChange={(e) => updateField('employerMatchPct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="100"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Tope Igualación' : 'Match Limit'}
                  htmlFor={matchLimitId}
                  unit="%"
                  error={errors.employerMatchLimit}
                >
                  <input
                    id={matchLimitId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.employerMatchLimit}
                    onChange={(e) => updateField('employerMatchLimit', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="5"
                  />
                </ToolFieldGroup>
              </div>
            </div>

            {/* D. Investment Assumptions */}
            <div className="space-y-3 pt-2 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {isEs ? 'D. Supuestos de Crecimiento' : 'D. Investment Assumptions'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ToolFieldGroup
                  label={isEs ? 'Rendimiento Esperado' : 'Expected Return'}
                  htmlFor={returnId}
                  unit="%"
                  error={errors.expectedReturn}
                >
                  <input
                    id={returnId}
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={form.expectedReturn}
                    onChange={(e) => updateField('expectedReturn', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="7"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Aumento Salarial' : 'Income Growth'}
                  htmlFor={salaryIncId}
                  unit="%"
                  error={errors.salaryIncreasePct}
                >
                  <input
                    id={salaryIncId}
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={form.salaryIncreasePct}
                    onChange={(e) => updateField('salaryIncreasePct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="2.5"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Inflación Anual' : 'Inflation Rate'}
                  htmlFor={inflationId}
                  unit="%"
                  error={errors.inflationRate}
                >
                  <input
                    id={inflationId}
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.inflationRate}
                    onChange={(e) => updateField('inflationRate', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="2.5"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label={isEs ? 'Tasa de Retiro Segura' : 'Safe Withdrawal Rate'}
                  htmlFor={swrId}
                  unit="%"
                  error={errors.safeWithdrawalRatePct}
                >
                  <input
                    id={swrId}
                    type="number"
                    min="0.5"
                    max="15"
                    step="0.25"
                    value={form.safeWithdrawalRatePct}
                    onChange={(e) => updateField('safeWithdrawalRatePct', e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="4"
                  />
                </ToolFieldGroup>
              </div>

              <div className="pt-1">
                <ToolFieldGroup
                  label={isEs ? 'Frecuencia de Aporte' : 'Contribution Frequency'}
                  htmlFor={freqId}
                >
                  <select
                    id={freqId}
                    value={form.frequency}
                    onChange={(e) => updateField('frequency', Number(e.target.value))}
                    className="ui-input cursor-pointer text-xs"
                  >
                    <option value={12}>{isEs ? 'Mensual (12x / año)' : 'Monthly (12x / yr)'}</option>
                    <option value={26}>{isEs ? 'Quincenal / 2 sem (26x / año)' : 'Bi-weekly (26x / yr)'}</option>
                    <option value={24}>{isEs ? 'Bimensual (24x / año)' : 'Semi-monthly (24x / yr)'}</option>
                    <option value={1}>{isEs ? 'Anual (1x / año)' : 'Annual (1x / yr)'}</option>
                  </select>
                </ToolFieldGroup>
              </div>
            </div>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title={isEs ? 'Proyecciones de Retiro' : 'Retirement Projections'}
            state={resultState}
            emptyTitle={
              is401k
                ? 'Enter 401(k) details to calculate'
                : isEs
                ? 'Ingresa tus datos para proyectar el retiro'
                : 'Enter retirement parameters to project'
            }
            emptyDescription={
              isEs
                ? 'Especifica tu perfil y supuestos a la izquierda para calcular el fondo proyectado.'
                : 'Specify your financial parameters on the left to compute nest egg and safe withdrawal projections.'
            }
            copyText={copyText}
          >
            {result && (
              <div className="space-y-4 min-w-0 w-full box-border">
                {/* A. Main Projection */}
                <div className="rounded-2xl border border-result-border bg-result-bg p-5 sm:p-6 space-y-1 min-w-0 w-full box-border shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-result-icon block">
                    {isEs ? 'Fondo Proyectado al Retiro' : 'Projected Retirement Balance'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-result-text tracking-tight break-all py-1">
                    {fmtCurrency(result.projectedBalance)}
                  </div>
                  <p className="text-xs text-result-text-secondary leading-relaxed">
                    {isEs
                      ? `Valor estimado a los ${parsedInput.retireAge} años tras ${result.yearsUntilRetire} años de interés compuesto.`
                      : `Expected portfolio value at age ${parsedInput.retireAge} after ${result.yearsUntilRetire} years of compounding.`}
                  </p>
                </div>

                {/* Safe Withdrawal Rule Callout */}
                <div className="rounded-xl border border-accent/30 bg-accent-light/25 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <PiggyBank className="w-4 h-4 text-accent" />
                      {isEs
                        ? `Ingreso Anual/Mensual Estimado (Regla del ${result.safeWithdrawalRatePct}%)`
                        : `Estimated Retirement Income (${result.safeWithdrawalRatePct}% Withdrawal Rule)`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-surface p-3 border border-border-subtle">
                      <span className="text-text-secondary block">
                        {isEs ? 'Retiro Nominal Estimado' : 'Nominal Withdrawal Est.'}
                      </span>
                      <span className="text-base font-bold font-mono text-text-primary block mt-0.5">
                        {fmtCurrency(result.annualSafeWithdrawalNominal)} / {isEs ? 'año' : 'yr'}
                      </span>
                      <span className="text-[11px] font-mono text-accent">
                        {fmtCurrency(result.monthlySafeWithdrawalNominal)} / {isEs ? 'mes' : 'mo'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-surface p-3 border border-border-subtle">
                      <span className="text-text-secondary block">
                        {isEs ? 'En Poder Adquisitivo de Hoy' : "In Today's Purchasing Power"}
                      </span>
                      <span className="text-base font-bold font-mono text-text-primary block mt-0.5">
                        {fmtCurrency(result.annualSafeWithdrawalReal)} / {isEs ? 'año' : 'yr'}
                      </span>
                      <span className="text-[11px] font-mono text-accent">
                        {fmtCurrency(result.monthlySafeWithdrawalReal)} / {isEs ? 'mes' : 'mo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* B. Secondary Financial Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 w-full">
                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                    <span className="text-[11px] font-semibold text-text-secondary block break-words">
                      {isEs ? 'Valor Ajustado por Inflación' : 'Inflation-Adjusted Value'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                      {fmtCurrency(result.inflationAdjustedBalance)}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5 block">
                      {isEs ? 'Poder adquisitivo actual' : "Today's purchasing power"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                    <span className="text-[11px] font-semibold text-text-secondary block break-words">
                      {is401k ? 'Employee Contributions' : isEs ? 'Aportes Personales' : 'Personal Contributions'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                      {fmtCurrency(result.totalEmployeeContrib)}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5 block">
                      {fmtCurrency(result.monthlyEmployeeContribution)} / {isEs ? 'mes' : 'mo'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                    <span className="text-[11px] font-semibold text-text-secondary block break-words">
                      {isEs ? 'Aporte del Empleador' : 'Employer Match'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-text-primary mt-1 block break-all">
                      {fmtCurrency(result.totalEmployerContrib)}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5 block">
                      {fmtCurrency(result.monthlyEmployerContribution)} / {isEs ? 'mes' : 'mo'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 min-w-0 w-full box-border">
                    <span className="text-[11px] font-semibold text-text-secondary block break-words">
                      {isEs ? 'Crecimiento por Inversión' : 'Investment Growth'}
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-status-success mt-1 block break-all">
                      +{fmtCurrency(result.totalInvestmentGrowth)}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5 block">
                      {isEs ? 'Rendimiento compuesto' : 'Compound returns'}
                    </span>
                  </div>
                </div>

                {/* C. Detailed Breakdown */}
                <div className="pt-2">
                  <ToolBreakdownList
                    items={[
                      {
                        label: is401k ? 'Starting 401(k) Balance' : isEs ? 'Saldo Inicial' : 'Starting Savings Balance',
                        value: fmtCurrency(parsedInput.currentBalance)
                      },
                      {
                        label: is401k ? 'Total Employee Contributions' : isEs ? 'Total Aportes Personales' : 'Total Personal Contributions',
                        value: fmtCurrency(result.totalEmployeeContrib)
                      },
                      {
                        label: isEs ? 'Total Aportes Empleador' : 'Total Employer Match Contributions',
                        value: fmtCurrency(result.totalEmployerContrib)
                      },
                      {
                        label: isEs ? 'Capital Total Invertido' : 'Total Principal Invested',
                        value: fmtCurrency(parsedInput.currentBalance + result.totalContributions)
                      },
                      {
                        label: isEs ? 'Rendimiento Compuesto Total' : 'Total Compound Investment Growth',
                        value: fmtCurrency(result.totalInvestmentGrowth),
                        highlight: true
                      },
                      {
                        label: isEs ? 'Saldo Final Proyectado' : 'Gross Projected Balance',
                        value: fmtCurrency(result.projectedBalance),
                        highlight: true
                      },
                      {
                        label: isEs ? 'Ingreso Final Estimado' : 'Final Annual Income',
                        value: fmtCurrency(result.finalSalary)
                      }
                    ]}
                  />
                </div>

                <div className="no-print flex flex-wrap items-center gap-2 pt-2">
                  <UiButton variant="secondary" size="sm" onClick={handleDownloadCsv}>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Descargar CSV' : 'Download CSV Schedule'}</span>
                  </UiButton>
                  <UiButton variant="secondary" size="sm" onClick={handleDownloadJson}>
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Exportar JSON' : 'Export JSON'}</span>
                  </UiButton>
                </div>

                {/* D. Projection Schedule Table */}
                {result.schedule.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border-subtle min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        {isEs ? 'Proyección Anual' : 'Annual Projection Schedule'}
                      </h4>
                      <span className="text-xs text-text-secondary font-mono">
                        {result.schedule.length} {isEs ? 'Años' : 'Years'}
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-72 rounded-xl border border-border-main bg-surface min-w-0">
                      <table className="w-full text-left text-xs font-mono tabular-nums whitespace-nowrap">
                        <thead className="bg-surface-secondary text-text-secondary sticky top-0 border-b border-border-main">
                          <tr>
                            <th className="p-2.5 font-semibold">{isEs ? 'Año' : 'Yr'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Edad' : 'Age'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Ingreso' : 'Income'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Tú' : 'You'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Empleador' : 'Match'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Crecim.' : 'Growth'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Saldo' : 'Balance'}</th>
                            <th className="p-2.5 font-semibold">{isEs ? 'Valor Real' : 'Real Bal.'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-text-primary">
                          {result.schedule.map((row) => (
                            <tr key={row.year} className="hover:bg-surface-hover">
                              <td className="p-2.5">{row.year}</td>
                              <td className="p-2.5">{row.age}</td>
                              <td className="p-2.5">{fmtCurrency(row.salary)}</td>
                              <td className="p-2.5 text-accent">+{fmtCurrency(row.employeeContrib)}</td>
                              <td className="p-2.5 text-status-success">+{fmtCurrency(row.employerMatch)}</td>
                              <td className="p-2.5 text-status-success">+{fmtCurrency(row.investmentGrowth)}</td>
                              <td className="p-2.5 font-bold">{fmtCurrency(row.endingBalance)}</td>
                              <td className="p-2.5 text-text-secondary">
                                {fmtCurrency(row.inflationAdjustedEndingBalance)}
                              </td>
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
            ? 'Estas proyecciones utilizan tasas constantes de rendimiento e inflación y una regla estimada de retiro. No constituyen asesoramiento financiero ni garantía de rentabilidad futura.'
            : 'Projections assume constant annual returns, inflation, and a hypothetical safe withdrawal rate for planning purposes only. They do not guarantee future investment performance.'
        }
      />
    </div>
  );
}
