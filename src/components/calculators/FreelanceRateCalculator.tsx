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
  desiredNetIncome: '75000',
  businessExpenses: '10000',
  billableHoursPerWeek: '30',
  billableWeeksPerYear: '48',
  selfEmploymentTaxRate: '15.3'
};

export default function FreelanceRateCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [desiredNetIncomeStr, setDesiredNetIncomeStr] = useState<string>(DEFAULTS.desiredNetIncome);
  const [businessExpensesStr, setBusinessExpensesStr] = useState<string>(DEFAULTS.businessExpenses);
  const [billableHoursPerWeekStr, setBillableHoursPerWeekStr] = useState<string>(
    DEFAULTS.billableHoursPerWeek
  );
  const [billableWeeksPerYearStr, setBillableWeeksPerYearStr] = useState<string>(
    DEFAULTS.billableWeeksPerYear
  );
  const [selfEmploymentTaxRateStr, setSelfEmploymentTaxRateStr] = useState<string>(
    DEFAULTS.selfEmploymentTaxRate
  );

  const netId = useId();
  const expId = useId();
  const taxId = useId();
  const hrsId = useId();
  const wksId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setDesiredNetIncomeStr(DEFAULTS.desiredNetIncome);
    setBusinessExpensesStr(DEFAULTS.businessExpenses);
    setBillableHoursPerWeekStr(DEFAULTS.billableHoursPerWeek);
    setBillableWeeksPerYearStr(DEFAULTS.billableWeeksPerYear);
    setSelfEmploymentTaxRateStr(DEFAULTS.selfEmploymentTaxRate);
  };

  const handleClear = () => {
    setDesiredNetIncomeStr('');
    setBusinessExpensesStr('');
    setBillableHoursPerWeekStr('');
    setBillableWeeksPerYearStr('');
    setSelfEmploymentTaxRateStr('');
  };

  const isEmpty =
    desiredNetIncomeStr.trim() === '' ||
    businessExpensesStr.trim() === '' ||
    billableHoursPerWeekStr.trim() === '' ||
    billableWeeksPerYearStr.trim() === '' ||
    selfEmploymentTaxRateStr.trim() === '';

  const desiredNetIncome = Number(desiredNetIncomeStr);
  const businessExpenses = Number(businessExpensesStr);
  const billableHoursPerWeek = Number(billableHoursPerWeekStr);
  const billableWeeksPerYear = Number(billableWeeksPerYearStr);
  const selfEmploymentTaxRate = Number(selfEmploymentTaxRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(desiredNetIncome) || desiredNetIncome < 0) {
      errors.desiredNetIncome = `Desired annual net income must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(businessExpenses) || businessExpenses < 0) {
      errors.businessExpenses = `Annual business expenses must be ${formatWhole(0)} or greater.`;
    }
    if (
      !Number.isFinite(selfEmploymentTaxRate) ||
      selfEmploymentTaxRate < 0 ||
      selfEmploymentTaxRate >= 100
    ) {
      errors.selfEmploymentTaxRate = 'Self-employment tax rate must be between 0% and 99.9%.';
    }
    if (!Number.isFinite(billableHoursPerWeek) || billableHoursPerWeek <= 0 || billableHoursPerWeek > 168) {
      errors.billableHoursPerWeek = 'Billable hours per week must be between 0.1 and 168.';
    }
    if (!Number.isFinite(billableWeeksPerYear) || billableWeeksPerYear <= 0 || billableWeeksPerYear > 52) {
      errors.billableWeeksPerYear = 'Billable weeks per year must be between 1 and 52.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalGrossRevenueNeeded = 0;
  let totalAnnualBillableHours = 0;
  let targetHourlyRate = 0;
  let estimatedSeTax = 0;

  if (!isEmpty && !hasErrors) {
    totalGrossRevenueNeeded =
      (desiredNetIncome + businessExpenses) / (1 - selfEmploymentTaxRate / 100);
    totalAnnualBillableHours = billableHoursPerWeek * billableWeeksPerYear;
    targetHourlyRate =
      totalAnnualBillableHours > 0 ? totalGrossRevenueNeeded / totalAnnualBillableHours : 0;
    estimatedSeTax = totalGrossRevenueNeeded * (selfEmploymentTaxRate / 100);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Freelance Hourly Rate Summary — Target Billable Rate: ${formatCurrency(targetHourlyRate)}/hr | Gross Revenue Needed: ${formatWhole(totalGrossRevenueNeeded)}/yr | Estimated SE Tax: ${formatWhole(estimatedSeTax)}/yr (${totalAnnualBillableHours.toLocaleString()} billable hrs/yr)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Income Goal, Expenses & Billable Capacity"
          subtitle="Back-calculate your minimum billable hourly rate from net income, overhead, and self-employment tax."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Desired Annual Net Income"
              htmlFor={netId}
              unit={`${currencyMeta.symbol}/yr`}
              error={errors.desiredNetIncome}
            >
              <input
                id={netId}
                type="number"
                min="0"
                step="any"
                value={desiredNetIncomeStr}
                onChange={(e) => setDesiredNetIncomeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="75000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Annual Business Expenses"
              htmlFor={expId}
              unit={`${currencyMeta.symbol}/yr`}
              error={errors.businessExpenses}
            >
              <input
                id={expId}
                type="number"
                min="0"
                step="any"
                value={businessExpensesStr}
                onChange={(e) => setBusinessExpensesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10000"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Self-Employment Tax Rate"
              htmlFor={taxId}
              unit="%"
              error={errors.selfEmploymentTaxRate}
            >
              <input
                id={taxId}
                type="number"
                min="0"
                max="99.9"
                step="0.1"
                value={selfEmploymentTaxRateStr}
                onChange={(e) => setSelfEmploymentTaxRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15.3"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Billable Hours / Week"
              htmlFor={hrsId}
              unit="hrs"
              error={errors.billableHoursPerWeek}
            >
              <input
                id={hrsId}
                type="number"
                min="0"
                max="168"
                step="any"
                value={billableHoursPerWeekStr}
                onChange={(e) => setBillableHoursPerWeekStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Billable Weeks / Year"
              htmlFor={wksId}
              unit="wks"
              error={errors.billableWeeksPerYear}
            >
              <input
                id={wksId}
                type="number"
                min="1"
                max="52"
                step="1"
                value={billableWeeksPerYearStr}
                onChange={(e) => setBillableWeeksPerYearStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="48"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Freelance Hourly Rate Summary"
          state={resultState}
          primaryLabel="Target Billable Hourly Rate"
          primaryValue={`${formatCurrency(targetHourlyRate)} /hr`}
          primarySubtext={`Based on ${totalAnnualBillableHours.toLocaleString()} billable hours/yr (${billableHoursPerWeek} hrs × ${billableWeeksPerYear} wks)`}
          statusLabel={`${formatWhole(totalGrossRevenueNeeded)}/yr`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter income & billable schedule"
          emptyDescription="Provide desired net income, annual expenses, SE tax rate, and billable hours/weeks to compute your target hourly rate."
          errorTitle="Invalid freelance rate inputs"
          errorMessage={Object.values(errors)[0] || 'Check income, tax rate, and billable schedule.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Gross Revenue Needed"
              value={`${formatWhole(totalGrossRevenueNeeded)} /yr`}
            />
            <ToolMetricTile
              label="Estimated SE Tax"
              value={`${formatWhole(estimatedSeTax)} /yr`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Gross Revenue Needed',
                value: `${formatWhole(totalGrossRevenueNeeded)} /yr`
              },
              {
                label: 'Estimated SE Tax',
                value: `${formatWhole(estimatedSeTax)} /yr`
              },
              {
                label: 'Annual Billable Hours',
                value: `${totalAnnualBillableHours.toLocaleString()} hrs/yr`
              },
              {
                label: 'Target Billable Hourly Rate',
                value: `${formatCurrency(targetHourlyRate)} /hr`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
