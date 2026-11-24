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
  annualContribution: '4150',
  marginalTaxRate: '24',
  investmentReturn: '7',
  years: '20'
};

export default function HsaGrowthCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [annualContributionStr, setAnnualContributionStr] = useState<string>(
    DEFAULTS.annualContribution
  );
  const [marginalTaxRateStr, setMarginalTaxRateStr] = useState<string>(DEFAULTS.marginalTaxRate);
  const [investmentReturnStr, setInvestmentReturnStr] = useState<string>(DEFAULTS.investmentReturn);
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);

  const contribId = useId();
  const taxId = useId();
  const returnId = useId();
  const yearsId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setAnnualContributionStr(DEFAULTS.annualContribution);
    setMarginalTaxRateStr(DEFAULTS.marginalTaxRate);
    setInvestmentReturnStr(DEFAULTS.investmentReturn);
    setYearsStr(DEFAULTS.years);
  };

  const handleClear = () => {
    setAnnualContributionStr('');
    setMarginalTaxRateStr('');
    setInvestmentReturnStr('');
    setYearsStr('');
  };

  const isEmpty =
    annualContributionStr.trim() === '' ||
    marginalTaxRateStr.trim() === '' ||
    investmentReturnStr.trim() === '' ||
    yearsStr.trim() === '';

  const annualContribution = Number(annualContributionStr);
  const marginalTaxRate = Number(marginalTaxRateStr);
  const investmentReturn = Number(investmentReturnStr);
  const years = Number(yearsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(annualContribution) || annualContribution < 0) {
      errors.annualContribution = `Annual HSA contribution must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(marginalTaxRate) || marginalTaxRate < 0 || marginalTaxRate > 100) {
      errors.marginalTaxRate = 'Marginal tax rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(investmentReturn) || investmentReturn < 0 || investmentReturn > 100) {
      errors.investmentReturn = 'Expected annual return must be between 0% and 100%.';
    }
    if (!Number.isFinite(years) || years < 0 || years > 100) {
      errors.years = 'Investment horizon must be between 0 and 100 years.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let balance = 0;
  let totalContributed = 0;
  let totalTaxSavings = 0;
  let investmentEarnings = 0;

  if (!isEmpty && !hasErrors) {
    const annualTaxSavings = annualContribution * (marginalTaxRate / 100);
    const monthlyRate = investmentReturn / 100 / 12;
    const totalMonths = years * 12;
    const monthlyContribution = annualContribution / 12;

    for (let m = 0; m < totalMonths; m++) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      totalContributed += monthlyContribution;
    }

    totalTaxSavings = annualTaxSavings * years;
    investmentEarnings = balance - totalContributed;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `HSA Growth (${years} yrs @ ${investmentReturn}%) — Total HSA Balance: ${formatWhole(balance)} | Total Tax Savings: ${formatWhole(totalTaxSavings)} | Contributed: ${formatWhole(totalContributed)} | Earnings: ${formatWhole(investmentEarnings)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="HSA Contribution & Growth"
          subtitle="Estimate long-term Health Savings Account balance and cumulative income tax savings."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Annual HSA Contribution"
              htmlFor={contribId}
              unit={`${currencyMeta.symbol}/yr`}
              error={errors.annualContribution}
            >
              <input
                id={contribId}
                type="number"
                min="0"
                step="any"
                value={annualContributionStr}
                onChange={(e) => setAnnualContributionStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4150"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Marginal Tax Rate"
              htmlFor={taxId}
              unit="%"
              error={errors.marginalTaxRate}
            >
              <input
                id={taxId}
                type="number"
                min="0"
                step="0.1"
                value={marginalTaxRateStr}
                onChange={(e) => setMarginalTaxRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="24"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Expected Annual Return"
              htmlFor={returnId}
              unit="%"
              error={errors.investmentReturn}
            >
              <input
                id={returnId}
                type="number"
                min="0"
                step="0.1"
                value={investmentReturnStr}
                onChange={(e) => setInvestmentReturnStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="7.0"
              />
            </ToolFieldGroup>

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
                placeholder="20"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Triple Tax Advantage:</strong> Contributions are
            100% tax-deductible, grow tax-free, and withdrawals for qualified medical expenses are
            tax-free.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="HSA Growth & Tax Savings"
          state={resultState}
          primaryLabel="Total HSA Balance"
          primaryValue={formatWhole(balance)}
          primarySubtext={`Plus ${formatWhole(totalTaxSavings)} cumulative upfront tax savings over ${years} years`}
          statusLabel="Triple Tax-Free"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter HSA parameters"
          emptyDescription="Provide annual contribution, marginal tax rate, return rate, and horizon to project HSA growth."
          errorTitle="Invalid HSA inputs"
          errorMessage={Object.values(errors)[0] || 'Check contribution, tax rate, return, and years.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Tax Savings"
              value={formatWhole(totalTaxSavings)}
              accent
            />
            <ToolMetricTile
              label="Investment Earnings"
              value={formatWhole(investmentEarnings)}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Tax Savings',
                value: formatWhole(totalTaxSavings)
              },
              {
                label: 'Total Principal Contributed',
                value: formatWhole(totalContributed)
              },
              {
                label: 'Investment Earnings',
                value: formatWhole(investmentEarnings)
              },
              {
                label: 'Total HSA Balance',
                value: formatWhole(balance),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
