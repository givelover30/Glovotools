import { useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  baseWage: '30',
  ficaRate: '7.65',
  futaSutaRate: '4',
  workersCompRate: '6.5',
  benefitsHourly: '5',
  productiveHoursRatio: '85'
};

export default function LaborBurdenCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [baseWageStr, setBaseWageStr] = useState<string>(DEFAULTS.baseWage);
  const [ficaRateStr, setFicaRateStr] = useState<string>(DEFAULTS.ficaRate);
  const [futaSutaRateStr, setFutaSutaRateStr] = useState<string>(DEFAULTS.futaSutaRate);
  const [workersCompRateStr, setWorkersCompRateStr] = useState<string>(DEFAULTS.workersCompRate);
  const [benefitsHourlyStr, setBenefitsHourlyStr] = useState<string>(DEFAULTS.benefitsHourly);
  const [productiveHoursRatioStr, setProductiveHoursRatioStr] = useState<string>(
    DEFAULTS.productiveHoursRatio
  );

  const wageId = useId();
  const benefitsId = useId();
  const prodId = useId();
  const ficaId = useId();
  const futaId = useId();
  const wcId = useId();

  const handleReset = () => {
    setBaseWageStr(DEFAULTS.baseWage);
    setFicaRateStr(DEFAULTS.ficaRate);
    setFutaSutaRateStr(DEFAULTS.futaSutaRate);
    setWorkersCompRateStr(DEFAULTS.workersCompRate);
    setBenefitsHourlyStr(DEFAULTS.benefitsHourly);
    setProductiveHoursRatioStr(DEFAULTS.productiveHoursRatio);
  };

  const handleClear = () => {
    setBaseWageStr('');
    setFicaRateStr('');
    setFutaSutaRateStr('');
    setWorkersCompRateStr('');
    setBenefitsHourlyStr('');
    setProductiveHoursRatioStr('');
  };

  const isEmpty =
    baseWageStr.trim() === '' ||
    ficaRateStr.trim() === '' ||
    futaSutaRateStr.trim() === '' ||
    workersCompRateStr.trim() === '' ||
    benefitsHourlyStr.trim() === '' ||
    productiveHoursRatioStr.trim() === '';

  const baseWage = Number(baseWageStr);
  const ficaRate = Number(ficaRateStr);
  const futaSutaRate = Number(futaSutaRateStr);
  const workersCompRate = Number(workersCompRateStr);
  const benefitsHourly = Number(benefitsHourlyStr);
  const productiveHoursRatio = Number(productiveHoursRatioStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(baseWage) || baseWage <= 0) {
      errors.baseWage = `Base hourly wage must be greater than ${formatCurrency(0)}.`;
    }
    if (!Number.isFinite(benefitsHourly) || benefitsHourly < 0) {
      errors.benefitsHourly = `Health and benefits must be ${formatCurrency(0)}/hr or greater.`;
    }
    if (
      !Number.isFinite(productiveHoursRatio) ||
      productiveHoursRatio <= 0 ||
      productiveHoursRatio > 100
    ) {
      errors.productiveHoursRatio = 'Productive time ratio must be between 1% and 100%.';
    }
    if (!Number.isFinite(ficaRate) || ficaRate < 0 || ficaRate > 100) {
      errors.ficaRate = 'FICA rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(futaSutaRate) || futaSutaRate < 0 || futaSutaRate > 100) {
      errors.futaSutaRate = 'FUTA/SUTA rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(workersCompRate) || workersCompRate < 0 || workersCompRate > 100) {
      errors.workersCompRate = 'Workers comp rate must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let payrollTaxAmount = 0;
  let totalBurdenHourly = 0;
  let burdenedRate = 0;
  let laborBurdenPct = 0;
  let effectiveProductiveRate = 0;

  if (!isEmpty && !hasErrors) {
    payrollTaxAmount = baseWage * ((ficaRate + futaSutaRate + workersCompRate) / 100);
    totalBurdenHourly = payrollTaxAmount + benefitsHourly;
    burdenedRate = baseWage + totalBurdenHourly;
    laborBurdenPct = baseWage > 0 ? (totalBurdenHourly / baseWage) * 100 : 0;
    effectiveProductiveRate =
      productiveHoursRatio > 0 ? burdenedRate / (productiveHoursRatio / 100) : burdenedRate;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Labor Burden Summary — Fully Burdened Rate: ${formatCurrency(burdenedRate)}/hr | Effective Productive Cost: ${formatCurrency(effectiveProductiveRate)}/hr | Total Burden: ${formatCurrency(totalBurdenHourly)}/hr (${laborBurdenPct.toFixed(1)}%)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Wage, Payroll Taxes & Benefits"
          subtitle="Calculate true employer labor cost per paid hour and per productive billable hour."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Base Hourly Wage"
              htmlFor={wageId}
              unit={`${currencyMeta.symbol}/hr`}
              error={errors.baseWage}
            >
              <input
                id={wageId}
                type="number"
                min="0"
                step="0.5"
                value={baseWageStr}
                onChange={(e) => setBaseWageStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Health & Benefits"
              htmlFor={benefitsId}
              unit={`${currencyMeta.symbol}/hr`}
              error={errors.benefitsHourly}
            >
              <input
                id={benefitsId}
                type="number"
                min="0"
                step="0.25"
                value={benefitsHourlyStr}
                onChange={(e) => setBenefitsHourlyStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5.00"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Productive Time Ratio"
              htmlFor={prodId}
              unit="%"
              error={errors.productiveHoursRatio}
            >
              <input
                id={prodId}
                type="number"
                min="1"
                max="100"
                step="any"
                value={productiveHoursRatioStr}
                onChange={(e) => setProductiveHoursRatioStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="85"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup label="FICA" htmlFor={ficaId} unit="%" error={errors.ficaRate}>
              <input
                id={ficaId}
                type="number"
                min="0"
                step="0.05"
                value={ficaRateStr}
                onChange={(e) => setFicaRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="7.65"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="FUTA / SUTA"
              htmlFor={futaId}
              unit="%"
              error={errors.futaSutaRate}
            >
              <input
                id={futaId}
                type="number"
                min="0"
                step="0.1"
                value={futaSutaRateStr}
                onChange={(e) => setFutaSutaRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4.0"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Workers Comp"
              htmlFor={wcId}
              unit="%"
              error={errors.workersCompRate}
            >
              <input
                id={wcId}
                type="number"
                min="0"
                step="0.1"
                value={workersCompRateStr}
                onChange={(e) => setWorkersCompRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="6.5"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            Labor burden includes statutory employer payroll taxes, workers compensation insurance
            premiums, and non-wage fringe benefits.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Labor Burden & Fully Burdened Rate Summary"
          state={resultState}
          primaryLabel="Fully Burdened Hourly Rate"
          primaryValue={`${formatCurrency(burdenedRate)} /hr`}
          primarySubtext={`Effective productive cost: ${formatCurrency(effectiveProductiveRate)} /hr at ${productiveHoursRatio}% utilization`}
          statusLabel={`${laborBurdenPct.toFixed(1)}% Burden`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter wage & tax rates"
          emptyDescription="Provide base wage, payroll tax rates, hourly benefits, and productive time ratio to calculate fully burdened labor cost."
          errorTitle="Invalid labor burden inputs"
          errorMessage={Object.values(errors)[0] || 'Check wage, benefits, tax rates, and utilization.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Burden per Hour"
              value={`${formatCurrency(totalBurdenHourly)} /hr`}
            />
            <ToolMetricTile
              label="Effective Productive Cost"
              value={`${formatCurrency(effectiveProductiveRate)} /hr`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Base Hourly Wage',
                value: `${formatCurrency(baseWage)} /hr`
              },
              {
                label: 'Employer Payroll Taxes & WC',
                value: `${formatCurrency(payrollTaxAmount)} /hr`
              },
              {
                label: 'Total Burden per Hour',
                value: `${formatCurrency(totalBurdenHourly)} /hr (${laborBurdenPct.toFixed(1)}%)`
              },
              {
                label: 'Fully Burdened Hourly Rate',
                value: `${formatCurrency(burdenedRate)} /hr`
              },
              {
                label: 'Effective Productive Cost',
                value: `${formatCurrency(effectiveProductiveRate)} /hr`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
