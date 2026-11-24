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
  principal: '10000',
  monthlyContribution: '500',
  annualRate: '7',
  years: '20'
};

export default function CompoundInterestMonthlyCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [principalStr, setPrincipalStr] = useState<string>(DEFAULTS.principal);
  const [monthlyContributionStr, setMonthlyContributionStr] = useState<string>(
    DEFAULTS.monthlyContribution
  );
  const [annualRateStr, setAnnualRateStr] = useState<string>(DEFAULTS.annualRate);
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);

  const principalId = useId();
  const contribId = useId();
  const rateId = useId();
  const yearsId = useId();

  const handleReset = () => {
    setPrincipalStr(DEFAULTS.principal);
    setMonthlyContributionStr(DEFAULTS.monthlyContribution);
    setAnnualRateStr(DEFAULTS.annualRate);
    setYearsStr(DEFAULTS.years);
  };

  const handleClear = () => {
    setPrincipalStr('');
    setMonthlyContributionStr('');
    setAnnualRateStr('');
    setYearsStr('');
  };

  const isEmpty =
    principalStr.trim() === '' ||
    monthlyContributionStr.trim() === '' ||
    annualRateStr.trim() === '' ||
    yearsStr.trim() === '';

  const principal = Number(principalStr);
  const monthlyContribution = Number(monthlyContributionStr);
  const annualRate = Number(annualRateStr);
  const years = Number(yearsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(principal) || principal < 0) {
      errors.principal = `Initial principal must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      errors.monthlyContribution = `Monthly contribution must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100) {
      errors.annualRate = 'Annual interest rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(years) || years < 0 || years > 100) {
      errors.years = 'Time horizon must be between 0 and 100 years.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  const compoundFreq = 12; // monthly
  let totalFutureValue = 0;
  let totalContributions = 0;
  let totalInterestEarned = 0;

  if (!isEmpty && !hasErrors) {
    const r = annualRate / 100;
    const n = compoundFreq;
    const t = years;
    const nt = n * t;
    const ratePerPeriod = r / n;

    const principalFuture = principal * Math.pow(1 + ratePerPeriod, nt);
    const contributionFuture =
      ratePerPeriod === 0
        ? monthlyContribution * nt
        : monthlyContribution * ((Math.pow(1 + ratePerPeriod, nt) - 1) / ratePerPeriod);

    totalFutureValue = principalFuture + contributionFuture;
    totalContributions = principal + monthlyContribution * 12 * t;
    totalInterestEarned = totalFutureValue - totalContributions;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Future Value: ${formatWhole(totalFutureValue)} | Total Contributions: ${formatWhole(totalContributions)} | Total Interest Earned: ${formatWhole(totalInterestEarned)} (${annualRate}% p.a. compounded monthly over ${years} yrs)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Investment Parameters"
          subtitle="Simulate monthly compounding growth with recurring monthly additions."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Initial Principal"
              htmlFor={principalId}
              unit={currency}
              error={errors.principal}
            >
              <input
                id={principalId}
                type="number"
                min="0"
                step="any"
                value={principalStr}
                onChange={(e) => setPrincipalStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Contribution"
              htmlFor={contribId}
              unit={`${currency}/mo`}
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
              label="Annual Interest Rate"
              htmlFor={rateId}
              unit="%"
              error={errors.annualRate}
            >
              <input
                id={rateId}
                type="number"
                min="0"
                step="0.1"
                value={annualRateStr}
                onChange={(e) => setAnnualRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="7.0"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Time Horizon"
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
                placeholder="20"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Wealth Projection"
          state={resultState}
          primaryLabel="Future Value"
          primaryValue={formatWhole(totalFutureValue)}
          primarySubtext={`Compounded monthly at ${annualRate}% over ${years} years`}
          statusLabel="Monthly Compounding"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter investment inputs"
          emptyDescription="Provide principal, monthly addition, annual rate, and horizon to project future compounded wealth."
          errorTitle="Invalid investment inputs"
          errorMessage={Object.values(errors)[0] || 'Check principal, contribution, rate, and years.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Contributions"
              value={formatWhole(totalContributions)}
            />
            <ToolMetricTile
              label="Total Interest Earned"
              value={formatWhole(totalInterestEarned)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Initial Principal', value: formatWhole(principal) },
              {
                label: 'Total Contributions',
                value: formatWhole(totalContributions)
              },
              {
                label: 'Total Interest Earned',
                value: formatWhole(totalInterestEarned)
              },
              {
                label: 'Future Value',
                value: formatWhole(totalFutureValue),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
