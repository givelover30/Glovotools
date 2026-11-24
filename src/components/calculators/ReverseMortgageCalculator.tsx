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
  borrowerAge: '70',
  homeValue: '400000',
  mortgageBalance: '50000',
  interestRate: '5.5'
};

export default function ReverseMortgageCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [borrowerAgeStr, setBorrowerAgeStr] = useState<string>(DEFAULTS.borrowerAge);
  const [homeValueStr, setHomeValueStr] = useState<string>(DEFAULTS.homeValue);
  const [mortgageBalanceStr, setMortgageBalanceStr] = useState<string>(DEFAULTS.mortgageBalance);
  const [interestRateStr, setInterestRateStr] = useState<string>(DEFAULTS.interestRate);

  const ageId = useId();
  const valueId = useId();
  const balId = useId();
  const rateId = useId();

  const handleReset = () => {
    setBorrowerAgeStr(DEFAULTS.borrowerAge);
    setHomeValueStr(DEFAULTS.homeValue);
    setMortgageBalanceStr(DEFAULTS.mortgageBalance);
    setInterestRateStr(DEFAULTS.interestRate);
  };

  const handleClear = () => {
    setBorrowerAgeStr('');
    setHomeValueStr('');
    setMortgageBalanceStr('');
    setInterestRateStr('');
  };

  const isEmpty =
    borrowerAgeStr.trim() === '' ||
    homeValueStr.trim() === '' ||
    mortgageBalanceStr.trim() === '' ||
    interestRateStr.trim() === '';

  const borrowerAge = Number(borrowerAgeStr);
  const homeValue = Number(homeValueStr);
  const mortgageBalance = Number(mortgageBalanceStr);
  const interestRate = Number(interestRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(borrowerAge) || borrowerAge < 62 || borrowerAge > 120) {
      errors.borrowerAge = 'Youngest borrower must be at least 62 years old for HECM eligibility.';
    }
    if (!Number.isFinite(homeValue) || homeValue <= 0) {
      errors.homeValue = `Home appraised value must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(mortgageBalance) || mortgageBalance < 0) {
      errors.mortgageBalance = `Existing mortgage balance must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 30) {
      errors.interestRate = 'Expected interest rate must be between 0% and 30%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let ageFactor = 0;
  let principalLimit = 0;
  let netProceeds = 0;

  if (!isEmpty && !hasErrors) {
    const eligibleAge = Math.max(62, borrowerAge);
    ageFactor = Math.min(0.75, 0.4 + (eligibleAge - 62) * 0.008);
    principalLimit = homeValue * ageFactor;
    netProceeds = Math.max(0, principalLimit - mortgageBalance);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Reverse Mortgage (HECM, Age ${borrowerAge}) — Principal Limit: ${formatWhole(principalLimit)} (${(ageFactor * 100).toFixed(1)}% PLF) | Existing Payoff: -${formatWhole(mortgageBalance)} | Net Available Cash Proceeds: ${formatWhole(netProceeds)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Borrower & Property Details"
          subtitle="Estimate HECM reverse mortgage principal limit and net cash proceeds after existing payoff."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Youngest Borrower Age (Min 62)"
              htmlFor={ageId}
              unit="yrs"
              error={errors.borrowerAge}
            >
              <input
                id={ageId}
                type="number"
                min="62"
                step="1"
                value={borrowerAgeStr}
                onChange={(e) => setBorrowerAgeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="70"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Home Appraised Value"
              htmlFor={valueId}
              unit={currency}
              error={errors.homeValue}
            >
              <input
                id={valueId}
                type="number"
                min="0"
                step="any"
                value={homeValueStr}
                onChange={(e) => setHomeValueStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="400000"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Existing Mortgage Balance to Pay Off"
              htmlFor={balId}
              unit={currency}
              error={errors.mortgageBalance}
            >
              <input
                id={balId}
                type="number"
                min="0"
                step="any"
                value={mortgageBalanceStr}
                onChange={(e) => setMortgageBalanceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Expected Interest Rate"
              htmlFor={rateId}
              unit="%"
              error={errors.interestRate}
            >
              <input
                id={rateId}
                type="number"
                min="0"
                step="0.1"
                value={interestRateStr}
                onChange={(e) => setInterestRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5.5"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">HECM Guidelines:</strong> Estimates HECM (Home
            Equity Conversion Mortgage) principal limit based on HUD actuarial factors. Does not
            constitute an official lender quote.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Reverse Mortgage Proceeds"
          state={resultState}
          primaryLabel="Net Available Cash Proceeds"
          primaryValue={formatWhole(netProceeds)}
          primarySubtext={`Principal limit factor ${(ageFactor * 100).toFixed(1)}% at age ${borrowerAge} (${interestRate}% assumed rate)`}
          statusLabel="HECM Estimate"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter property and borrower details"
          emptyDescription="Provide youngest borrower age (62+), home value, existing mortgage balance, and expected rate."
          errorTitle="Invalid HECM parameters"
          errorMessage={Object.values(errors)[0] || 'Check borrower age (62+), home value, balance, and rate.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Principal Limit (Max Claim)"
              value={formatWhole(principalLimit)}
            />
            <ToolMetricTile
              label="Existing Mortgage Payoff"
              value={`-${formatWhole(mortgageBalance)}`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Principal Limit Factor',
                value: `${(ageFactor * 100).toFixed(1)}%`
              },
              {
                label: 'Principal Limit (Max Claim)',
                value: formatWhole(principalLimit)
              },
              {
                label: 'Existing Mortgage Payoff',
                value: `-${formatWhole(mortgageBalance)}`
              },
              {
                label: 'Net Available Cash Proceeds',
                value: formatWhole(netProceeds),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
