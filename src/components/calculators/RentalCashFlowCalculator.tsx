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
  monthlyRent: '2200',
  vacancyRate: '5',
  monthlyOperatingExpenses: '600',
  monthlyMortgage: '1100',
  propertyPrice: '280000',
  totalInvestedCash: '60000'
};

export default function RentalCashFlowCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [monthlyRentStr, setMonthlyRentStr] = useState<string>(DEFAULTS.monthlyRent);
  const [vacancyRateStr, setVacancyRateStr] = useState<string>(DEFAULTS.vacancyRate);
  const [monthlyOperatingExpensesStr, setMonthlyOperatingExpensesStr] = useState<string>(
    DEFAULTS.monthlyOperatingExpenses
  );
  const [monthlyMortgageStr, setMonthlyMortgageStr] = useState<string>(DEFAULTS.monthlyMortgage);
  const [propertyPriceStr, setPropertyPriceStr] = useState<string>(DEFAULTS.propertyPrice);
  const [totalInvestedCashStr, setTotalInvestedCashStr] = useState<string>(
    DEFAULTS.totalInvestedCash
  );

  const rentId = useId();
  const vacId = useId();
  const opexId = useId();
  const mortId = useId();
  const priceId = useId();
  const cashId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatSignedCurrency = (val: number) => {
    const rounded = Math.round(val);
    return rounded < 0 ? `-${formatWhole(Math.abs(rounded))}` : formatWhole(rounded);
  };

  const handleReset = () => {
    setMonthlyRentStr(DEFAULTS.monthlyRent);
    setVacancyRateStr(DEFAULTS.vacancyRate);
    setMonthlyOperatingExpensesStr(DEFAULTS.monthlyOperatingExpenses);
    setMonthlyMortgageStr(DEFAULTS.monthlyMortgage);
    setPropertyPriceStr(DEFAULTS.propertyPrice);
    setTotalInvestedCashStr(DEFAULTS.totalInvestedCash);
  };

  const handleClear = () => {
    setMonthlyRentStr('');
    setVacancyRateStr('');
    setMonthlyOperatingExpensesStr('');
    setMonthlyMortgageStr('');
    setPropertyPriceStr('');
    setTotalInvestedCashStr('');
  };

  const isEmpty =
    monthlyRentStr.trim() === '' ||
    vacancyRateStr.trim() === '' ||
    monthlyOperatingExpensesStr.trim() === '' ||
    monthlyMortgageStr.trim() === '' ||
    propertyPriceStr.trim() === '' ||
    totalInvestedCashStr.trim() === '';

  const monthlyRent = Number(monthlyRentStr);
  const vacancyRate = Number(vacancyRateStr);
  const monthlyOperatingExpenses = Number(monthlyOperatingExpensesStr);
  const monthlyMortgage = Number(monthlyMortgageStr);
  const propertyPrice = Number(propertyPriceStr);
  const totalInvestedCash = Number(totalInvestedCashStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(monthlyRent) || monthlyRent < 0) {
      errors.monthlyRent = `Monthly rental income must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(vacancyRate) || vacancyRate < 0 || vacancyRate > 100) {
      errors.vacancyRate = 'Vacancy allowance must be between 0% and 100%.';
    }
    if (!Number.isFinite(monthlyOperatingExpenses) || monthlyOperatingExpenses < 0) {
      errors.monthlyOperatingExpenses = `Monthly operating expenses must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(monthlyMortgage) || monthlyMortgage < 0) {
      errors.monthlyMortgage = `Monthly mortgage P&I must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(propertyPrice) || propertyPrice <= 0) {
      errors.propertyPrice = `Property purchase price must be greater than ${formatWhole(0)}.`;
    }
    if (!Number.isFinite(totalInvestedCash) || totalInvestedCash <= 0) {
      errors.totalInvestedCash = `Total invested cash must be greater than ${formatWhole(0)}.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let effectiveGrossIncome = 0;
  let netOperatingIncome = 0;
  let annualCashFlow = 0;
  let monthlyCashFlow = 0;
  let capRate = 0;
  let cashOnCashReturn = 0;

  if (!isEmpty && !hasErrors) {
    const annualGrossRent = monthlyRent * 12;
    const vacancyLoss = annualGrossRent * (vacancyRate / 100);
    effectiveGrossIncome = annualGrossRent - vacancyLoss;
    const annualOperatingExpenses = monthlyOperatingExpenses * 12;
    netOperatingIncome = effectiveGrossIncome - annualOperatingExpenses;
    const annualDebtService = monthlyMortgage * 12;
    annualCashFlow = netOperatingIncome - annualDebtService;
    monthlyCashFlow = annualCashFlow / 12;
    capRate = (netOperatingIncome / propertyPrice) * 100;
    cashOnCashReturn = (annualCashFlow / totalInvestedCash) * 100;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Rental Property Summary — Monthly Cash Flow: ${formatSignedCurrency(monthlyCashFlow)}/mo | NOI: ${formatWhole(netOperatingIncome)}/yr | Cap Rate: ${capRate.toFixed(2)}% | Cash-on-Cash Return: ${cashOnCashReturn.toFixed(2)}%`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Rental Income, Expenses & Valuation"
          subtitle="Evaluate rental property net operating income (NOI), cap rate, and cash-on-cash return."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Monthly Rental Income"
              htmlFor={rentId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyRent}
            >
              <input
                id={rentId}
                type="number"
                min="0"
                step="any"
                value={monthlyRentStr}
                onChange={(e) => setMonthlyRentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2200"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Vacancy Allowance"
              htmlFor={vacId}
              unit="%"
              error={errors.vacancyRate}
            >
              <input
                id={vacId}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={vacancyRateStr}
                onChange={(e) => setVacancyRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Operating Expenses"
              htmlFor={opexId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyOperatingExpenses}
            >
              <input
                id={opexId}
                type="number"
                min="0"
                step="any"
                value={monthlyOperatingExpensesStr}
                onChange={(e) => setMonthlyOperatingExpensesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="600"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Mortgage P&I"
              htmlFor={mortId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyMortgage}
            >
              <input
                id={mortId}
                type="number"
                min="0"
                step="any"
                value={monthlyMortgageStr}
                onChange={(e) => setMonthlyMortgageStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1100"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Property Purchase Price"
              htmlFor={priceId}
              unit={currencyMeta.symbol}
              error={errors.propertyPrice}
            >
              <input
                id={priceId}
                type="number"
                min="0"
                step="any"
                value={propertyPriceStr}
                onChange={(e) => setPropertyPriceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="280000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Total Invested Cash"
              htmlFor={cashId}
              unit={currencyMeta.symbol}
              hint="Down payment + closing + repairs"
              error={errors.totalInvestedCash}
            >
              <input
                id={cashId}
                type="number"
                min="0"
                step="any"
                value={totalInvestedCashStr}
                onChange={(e) => setTotalInvestedCashStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="60000"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Financial Distinction:</strong> Net Operating
            Income (NOI) excludes debt service. Cash flow is calculated after deducting mortgage
            payments.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Rental Return & Cash Flow"
          state={resultState}
          primaryLabel="Monthly Cash Flow"
          primaryValue={formatSignedCurrency(monthlyCashFlow)}
          primaryUnit="/mo"
          primarySubtext={`${formatSignedCurrency(annualCashFlow)}/yr after mortgage debt service · ${cashOnCashReturn.toFixed(2)}% Cash-on-Cash`}
          statusLabel={monthlyCashFlow >= 0 ? 'Positive Cash Flow' : 'Negative Cash Flow'}
          statusTone={monthlyCashFlow >= 0 ? 'success' : 'error'}
          copyText={copyText}
          emptyTitle="Enter rental property figures"
          emptyDescription="Provide rent, vacancy, operating expenses, mortgage, purchase price, and invested cash."
          errorTitle="Invalid property inputs"
          errorMessage={Object.values(errors)[0] || 'Check rental income, expenses, purchase price, and cash invested.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Cap Rate" value={`${capRate.toFixed(2)}%`} />
            <ToolMetricTile
              label="Cash-on-Cash Return"
              value={`${cashOnCashReturn.toFixed(2)}%`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Effective Gross Income',
                value: `${formatWhole(effectiveGrossIncome)}/yr`
              },
              {
                label: 'Net Operating Income (NOI)',
                value: `${formatWhole(netOperatingIncome)}/yr`
              },
              {
                label: 'Capitalization Rate (Cap Rate)',
                value: `${capRate.toFixed(2)}%`
              },
              {
                label: 'Cash-on-Cash Return',
                value: `${cashOnCashReturn.toFixed(2)}%`
              },
              {
                label: 'Monthly Cash Flow',
                value: `${formatSignedCurrency(monthlyCashFlow)}/mo`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
