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
  homeValue: '450000',
  mortgageBalance: '280000',
  maxCltv: '85',
  drawAmount: '50000',
  interestRate: '7.5'
};

export default function HelocCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [homeValueStr, setHomeValueStr] = useState<string>(DEFAULTS.homeValue);
  const [mortgageBalanceStr, setMortgageBalanceStr] = useState<string>(DEFAULTS.mortgageBalance);
  const [maxCltvStr, setMaxCltvStr] = useState<string>(DEFAULTS.maxCltv);
  const [drawAmountStr, setDrawAmountStr] = useState<string>(DEFAULTS.drawAmount);
  const [interestRateStr, setInterestRateStr] = useState<string>(DEFAULTS.interestRate);

  const homeId = useId();
  const mortgageId = useId();
  const cltvId = useId();
  const drawId = useId();
  const rateId = useId();

  const handleReset = () => {
    setHomeValueStr(DEFAULTS.homeValue);
    setMortgageBalanceStr(DEFAULTS.mortgageBalance);
    setMaxCltvStr(DEFAULTS.maxCltv);
    setDrawAmountStr(DEFAULTS.drawAmount);
    setInterestRateStr(DEFAULTS.interestRate);
  };

  const handleClear = () => {
    setHomeValueStr('');
    setMortgageBalanceStr('');
    setMaxCltvStr('');
    setDrawAmountStr('');
    setInterestRateStr('');
  };

  const isEmpty =
    homeValueStr.trim() === '' ||
    mortgageBalanceStr.trim() === '' ||
    maxCltvStr.trim() === '' ||
    drawAmountStr.trim() === '' ||
    interestRateStr.trim() === '';

  const homeValue = Number(homeValueStr);
  const mortgageBalance = Number(mortgageBalanceStr);
  const maxCltv = Number(maxCltvStr);
  const drawAmount = Number(drawAmountStr);
  const interestRate = Number(interestRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(homeValue) || homeValue <= 0) {
      errors.homeValue = `Home appraised value must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(mortgageBalance) || mortgageBalance < 0) {
      errors.mortgageBalance = `Current mortgage balance must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(maxCltv) || maxCltv <= 0 || maxCltv > 100) {
      errors.maxCltv = 'Max CLTV must be between 1% and 100%.';
    }
    if (!Number.isFinite(drawAmount) || drawAmount < 0) {
      errors.drawAmount = `Planned draw amount must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 50) {
      errors.interestRate = 'Variable interest rate must be between 0% and 50%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let maxBorrowingLimit = 0;
  let availableEquity = 0;
  let monthlyInterestPayment = 0;

  if (!isEmpty && !hasErrors) {
    maxBorrowingLimit = homeValue * (maxCltv / 100);
    availableEquity = Math.max(0, maxBorrowingLimit - mortgageBalance);
    monthlyInterestPayment = drawAmount * (interestRate / 100 / 12);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `HELOC Summary — Available Equity Line: ${formatWhole(availableEquity)} | Max Borrowing Limit (${maxCltv}% CLTV): ${formatWhole(maxBorrowingLimit)} | Est. Monthly Interest Payment (on ${formatWhole(drawAmount)} @ ${interestRate}%): ${formatWhole(monthlyInterestPayment)}/mo`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Property Equity & HELOC Draw"
          subtitle="Calculate available home equity credit line capacity and interest-only draw payments."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Home Appraised Value"
              htmlFor={homeId}
              unit={currency}
              error={errors.homeValue}
            >
              <input
                id={homeId}
                type="number"
                min="0"
                step="any"
                value={homeValueStr}
                onChange={(e) => setHomeValueStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="450000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Current Mortgage Balance"
              htmlFor={mortgageId}
              unit={currency}
              error={errors.mortgageBalance}
            >
              <input
                id={mortgageId}
                type="number"
                min="0"
                step="any"
                value={mortgageBalanceStr}
                onChange={(e) => setMortgageBalanceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="280000"
              />
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup
            label="Max Combined Loan-to-Value (CLTV)"
            htmlFor={cltvId}
            unit="%"
            error={errors.maxCltv}
          >
            <input
              id={cltvId}
              type="number"
              min="1"
              max="100"
              step="1"
              value={maxCltvStr}
              onChange={(e) => setMaxCltvStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="85"
            />
          </ToolFieldGroup>

          <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Planned Credit Line Draw"
              htmlFor={drawId}
              unit={currency}
              error={errors.drawAmount}
            >
              <input
                id={drawId}
                type="number"
                min="0"
                step="any"
                value={drawAmountStr}
                onChange={(e) => setDrawAmountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Variable Interest Rate"
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
                placeholder="7.5"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">HELOC Structure:</strong> Assumes interest-only
            payments during the initial draw period.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="HELOC Capacity & Payment"
          state={resultState}
          primaryLabel="Available Equity Line"
          primaryValue={formatWhole(availableEquity)}
          primarySubtext={`At ${maxCltv}% max CLTV with ${formatWhole(monthlyInterestPayment)}/mo interest-only draw payment`}
          statusLabel={drawAmount <= availableEquity ? 'Within Equity Limit' : 'Exceeds Limit'}
          statusTone={drawAmount <= availableEquity ? 'success' : 'warning'}
          copyText={copyText}
          emptyTitle="Enter home equity details"
          emptyDescription="Provide home value, mortgage balance, CLTV limit, planned draw, and rate to calculate HELOC capacity."
          errorTitle="Invalid HELOC parameters"
          errorMessage={Object.values(errors)[0] || 'Check home value, mortgage balance, CLTV, draw, and rate.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Maximum Borrowing Limit"
              value={formatWhole(maxBorrowingLimit)}
            />
            <ToolMetricTile
              label="Est. Monthly Interest"
              value={formatWhole(monthlyInterestPayment)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Maximum Borrowing Limit',
                value: formatWhole(maxBorrowingLimit)
              },
              {
                label: 'Current Mortgage Balance',
                value: formatWhole(mortgageBalance)
              },
              {
                label: 'Available Equity Line',
                value: formatWhole(availableEquity)
              },
              {
                label: 'Est. Monthly Interest Payment',
                value: `${formatWhole(monthlyInterestPayment)}/mo`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
