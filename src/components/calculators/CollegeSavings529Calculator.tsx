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
  currentSavings: '5000',
  monthlyContribution: '300',
  years: '12',
  annualReturn: '6.5'
};

export default function CollegeSavings529Calculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [currentSavingsStr, setCurrentSavingsStr] = useState<string>(DEFAULTS.currentSavings);
  const [monthlyContributionStr, setMonthlyContributionStr] = useState<string>(
    DEFAULTS.monthlyContribution
  );
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);
  const [annualReturnStr, setAnnualReturnStr] = useState<string>(DEFAULTS.annualReturn);

  const curSavId = useId();
  const contribId = useId();
  const yearsId = useId();
  const returnId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setCurrentSavingsStr(DEFAULTS.currentSavings);
    setMonthlyContributionStr(DEFAULTS.monthlyContribution);
    setYearsStr(DEFAULTS.years);
    setAnnualReturnStr(DEFAULTS.annualReturn);
  };

  const handleClear = () => {
    setCurrentSavingsStr('');
    setMonthlyContributionStr('');
    setYearsStr('');
    setAnnualReturnStr('');
  };

  const isEmpty =
    currentSavingsStr.trim() === '' ||
    monthlyContributionStr.trim() === '' ||
    yearsStr.trim() === '' ||
    annualReturnStr.trim() === '';

  const currentSavings = Number(currentSavingsStr);
  const monthlyContribution = Number(monthlyContributionStr);
  const years = Number(yearsStr);
  const annualReturn = Number(annualReturnStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(currentSavings) || currentSavings < 0) {
      errors.currentSavings = `Current college savings must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      errors.monthlyContribution = `Monthly contribution must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(years) || years < 0 || years > 50) {
      errors.years = 'Years until enrollment must be between 0 and 50.';
    }
    if (!Number.isFinite(annualReturn) || annualReturn < 0 || annualReturn > 50) {
      errors.annualReturn = 'Expected annual return must be between 0% and 50%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let balance = 0;
  let totalContributed = 0;
  let interestEarned = 0;

  if (!isEmpty && !hasErrors) {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;

    balance = currentSavings;
    totalContributed = currentSavings;

    for (let m = 0; m < totalMonths; m++) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      totalContributed += monthlyContribution;
    }

    interestEarned = balance - totalContributed;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `529 College Savings (${years} yrs @ ${annualReturn}% p.a.) — Total College Fund: ${formatWhole(balance)} | Total Contributed: ${formatWhole(totalContributed)} | Tax-Free Earnings: ${formatWhole(interestEarned)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="529 Savings & Growth Inputs"
          subtitle="Project tax-advantaged 529 college savings growth through enrollment."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Current College Savings"
              htmlFor={curSavId}
              unit={currencyMeta.symbol}
              error={errors.currentSavings}
            >
              <input
                id={curSavId}
                type="number"
                min="0"
                step="any"
                value={currentSavingsStr}
                onChange={(e) => setCurrentSavingsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5000"
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
                placeholder="300"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Years Until College Enrollment"
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
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Expected Annual Return"
              htmlFor={returnId}
              unit="%"
              error={errors.annualReturn}
            >
              <input
                id={returnId}
                type="number"
                min="0"
                step="0.1"
                value={annualReturnStr}
                onChange={(e) => setAnnualReturnStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="6.5"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Tax-Free Growth:</strong> Earnings in a 529 plan
            grow federal and state tax-free when used for qualified higher education expenses.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="529 College Savings Projection"
          state={resultState}
          primaryLabel="Total College Fund"
          primaryValue={formatWhole(balance)}
          primarySubtext={`Projected balance after ${years} years at ${annualReturn}% p.a.`}
          statusLabel="Tax-Free Growth"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter 529 savings details"
          emptyDescription="Provide current balance, monthly additions, enrollment horizon, and return rate to project your 529 fund."
          errorTitle="Invalid 529 parameters"
          errorMessage={Object.values(errors)[0] || 'Check savings, contribution, years, and return rate.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Contributed"
              value={formatWhole(totalContributed)}
            />
            <ToolMetricTile
              label="Tax-Free Earnings"
              value={formatWhole(interestEarned)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Contributed',
                value: formatWhole(totalContributed)
              },
              {
                label: 'Tax-Free Earnings',
                value: formatWhole(interestEarned)
              },
              {
                label: 'Annual Growth Yield',
                value: `${annualReturn}% p.a.`
              },
              {
                label: 'Total College Fund',
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
