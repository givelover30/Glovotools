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
  initialInvestment: '10000',
  monthlyContribution: '500',
  dividendYield: '3.5',
  stockAppreciation: '6',
  years: '15'
};

export default function DripCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [initialInvestmentStr, setInitialInvestmentStr] = useState<string>(
    DEFAULTS.initialInvestment
  );
  const [monthlyContributionStr, setMonthlyContributionStr] = useState<string>(
    DEFAULTS.monthlyContribution
  );
  const [dividendYieldStr, setDividendYieldStr] = useState<string>(DEFAULTS.dividendYield);
  const [stockAppreciationStr, setStockAppreciationStr] = useState<string>(
    DEFAULTS.stockAppreciation
  );
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);

  const initId = useId();
  const contribId = useId();
  const yearsId = useId();
  const yieldId = useId();
  const apprId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setInitialInvestmentStr(DEFAULTS.initialInvestment);
    setMonthlyContributionStr(DEFAULTS.monthlyContribution);
    setDividendYieldStr(DEFAULTS.dividendYield);
    setStockAppreciationStr(DEFAULTS.stockAppreciation);
    setYearsStr(DEFAULTS.years);
  };

  const handleClear = () => {
    setInitialInvestmentStr('');
    setMonthlyContributionStr('');
    setDividendYieldStr('');
    setStockAppreciationStr('');
    setYearsStr('');
  };

  const isEmpty =
    initialInvestmentStr.trim() === '' ||
    monthlyContributionStr.trim() === '' ||
    dividendYieldStr.trim() === '' ||
    stockAppreciationStr.trim() === '' ||
    yearsStr.trim() === '';

  const initialInvestment = Number(initialInvestmentStr);
  const monthlyContribution = Number(monthlyContributionStr);
  const dividendYield = Number(dividendYieldStr);
  const stockAppreciation = Number(stockAppreciationStr);
  const years = Number(yearsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(initialInvestment) || initialInvestment < 0) {
      errors.initialInvestment = `Initial portfolio value must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      errors.monthlyContribution = `Monthly contribution must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(dividendYield) || dividendYield < 0 || dividendYield > 100) {
      errors.dividendYield = 'Annual dividend yield must be between 0% and 100%.';
    }
    if (!Number.isFinite(stockAppreciation) || stockAppreciation < -50 || stockAppreciation > 100) {
      errors.stockAppreciation = 'Stock appreciation must be between -50% and 100%.';
    }
    if (!Number.isFinite(years) || years < 0 || years > 100) {
      errors.years = 'Investment horizon must be between 0 and 100 years.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let futureValue = 0;
  let totalDeposited = 0;
  let totalDividendsEarned = 0;
  let totalGain = 0;

  if (!isEmpty && !hasErrors) {
    const totalReturnRate = (dividendYield + stockAppreciation) / 100;
    const monthlyRate = totalReturnRate / 12;
    const totalMonths = years * 12;

    futureValue = initialInvestment;
    totalDeposited = initialInvestment;
    totalDividendsEarned = 0;

    for (let m = 0; m < totalMonths; m++) {
      const monthlyDiv = futureValue * (dividendYield / 100 / 12);
      totalDividendsEarned += monthlyDiv;
      futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
      totalDeposited += monthlyContribution;
    }

    totalGain = futureValue - totalDeposited;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const totalAnnualReturnDisplay = (dividendYield + stockAppreciation).toFixed(1);
  const copyText = `DRIP Projection (${years} yrs @ ${totalAnnualReturnDisplay}%) — Ending Value: ${formatWhole(futureValue)} | Deposited: ${formatWhole(totalDeposited)} | Dividends Reinvested: ${formatWhole(totalDividendsEarned)} | Total Growth: ${formatWhole(totalGain)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Portfolio & Yield Parameters"
          subtitle="Model automatic dividend reinvestment (DRIP) compounded monthly with price appreciation."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Initial Portfolio Value"
              htmlFor={initId}
              unit={currencyMeta.symbol}
              error={errors.initialInvestment}
            >
              <input
                id={initId}
                type="number"
                min="0"
                step="any"
                value={initialInvestmentStr}
                onChange={(e) => setInitialInvestmentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Contribution"
              htmlFor={contribId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyContribution}
            >
              <input
                id={contribId}
                type="number"
                min="0"
                step="any"
                value={monthlyContributionStr}
                onChange={(e) => setMonthlyContributionStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="500"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Annual Dividend Yield"
              htmlFor={yieldId}
              unit="%"
              error={errors.dividendYield}
            >
              <input
                id={yieldId}
                type="number"
                min="0"
                step="0.1"
                value={dividendYieldStr}
                onChange={(e) => setDividendYieldStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3.5"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Stock Price Appreciation"
              htmlFor={apprId}
              unit="%"
              error={errors.stockAppreciation}
            >
              <input
                id={apprId}
                type="number"
                step="0.1"
                value={stockAppreciationStr}
                onChange={(e) => setStockAppreciationStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="6.0"
              />
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup
            label="Investment Horizon"
            htmlFor={yearsId}
            unit="years"
            error={errors.years}
          >
            <input
              id={yearsId}
              type="number"
              min="0"
              step="1"
              value={yearsStr}
              onChange={(e) => setYearsStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="15"
            />
          </ToolFieldGroup>

          {resultState === 'ready' && (
            <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
              <strong className="text-text-primary">Total Annual Return:</strong>{' '}
              {totalAnnualReturnDisplay}% compounded monthly with automatic DRIP.
            </div>
          )}
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="DRIP Portfolio Projection"
          state={resultState}
          primaryLabel="Ending Portfolio Value"
          primaryValue={formatWhole(futureValue)}
          primarySubtext={`${totalAnnualReturnDisplay}% combined annual return over ${years} years`}
          statusLabel="DRIP Enabled"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter DRIP parameters"
          emptyDescription="Provide starting balance, contributions, dividend yield, appreciation, and horizon to project portfolio growth."
          errorTitle="Invalid portfolio inputs"
          errorMessage={Object.values(errors)[0] || 'Check portfolio balance, yields, and horizon.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Dividends Reinvested"
              value={formatWhole(totalDividendsEarned)}
              accent
            />
            <ToolMetricTile
              label="Total Portfolio Growth"
              value={formatWhole(totalGain)}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Principal Deposited',
                value: formatWhole(totalDeposited)
              },
              {
                label: 'Estimated Dividends Reinvested',
                value: formatWhole(totalDividendsEarned)
              },
              {
                label: 'Total Portfolio Growth',
                value: formatWhole(totalGain)
              },
              {
                label: 'Ending Portfolio Value',
                value: formatWhole(futureValue),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
