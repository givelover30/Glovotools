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
  currentBalance: '250000',
  currentRate: '6.5',
  currentRemainingYears: '25',
  newRate: '5.5',
  newTermYears: '30',
  closingCosts: '4000'
};

export default function AdvancedRefinanceCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatSignedCurrency = (val: number) => {
    const rounded = Math.round(val);
    return rounded < 0 ? `-${formatWhole(Math.abs(rounded))}` : formatWhole(rounded);
  };
  const [currentBalanceStr, setCurrentBalanceStr] = useState<string>(DEFAULTS.currentBalance);
  const [currentRateStr, setCurrentRateStr] = useState<string>(DEFAULTS.currentRate);
  const [currentRemainingYearsStr, setCurrentRemainingYearsStr] = useState<string>(
    DEFAULTS.currentRemainingYears
  );
  const [newRateStr, setNewRateStr] = useState<string>(DEFAULTS.newRate);
  const [newTermYearsStr, setNewTermYearsStr] = useState<string>(DEFAULTS.newTermYears);
  const [closingCostsStr, setClosingCostsStr] = useState<string>(DEFAULTS.closingCosts);

  const curBalId = useId();
  const curRateId = useId();
  const curTermId = useId();
  const newRateId = useId();
  const newTermId = useId();
  const closingId = useId();

  const handleReset = () => {
    setCurrentBalanceStr(DEFAULTS.currentBalance);
    setCurrentRateStr(DEFAULTS.currentRate);
    setCurrentRemainingYearsStr(DEFAULTS.currentRemainingYears);
    setNewRateStr(DEFAULTS.newRate);
    setNewTermYearsStr(DEFAULTS.newTermYears);
    setClosingCostsStr(DEFAULTS.closingCosts);
  };

  const handleClear = () => {
    setCurrentBalanceStr('');
    setCurrentRateStr('');
    setCurrentRemainingYearsStr('');
    setNewRateStr('');
    setNewTermYearsStr('');
    setClosingCostsStr('');
  };

  const isEmpty =
    currentBalanceStr.trim() === '' ||
    currentRateStr.trim() === '' ||
    currentRemainingYearsStr.trim() === '' ||
    newRateStr.trim() === '' ||
    newTermYearsStr.trim() === '' ||
    closingCostsStr.trim() === '';

  const currentBalance = Number(currentBalanceStr);
  const currentRate = Number(currentRateStr);
  const currentRemainingYears = Number(currentRemainingYearsStr);
  const newRate = Number(newRateStr);
  const newTermYears = Number(newTermYearsStr);
  const closingCosts = Number(closingCostsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(currentBalance) || currentBalance <= 0) {
      errors.currentBalance = `Remaining balance must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(currentRate) || currentRate < 0 || currentRate > 50) {
      errors.currentRate = 'Current rate must be between 0% and 50%.';
    }
    if (!Number.isFinite(currentRemainingYears) || currentRemainingYears <= 0 || currentRemainingYears > 50) {
      errors.currentRemainingYears = 'Remaining term must be between 1 and 50 years.';
    }
    if (!Number.isFinite(newRate) || newRate < 0 || newRate > 50) {
      errors.newRate = 'New rate must be between 0% and 50%.';
    }
    if (!Number.isFinite(newTermYears) || newTermYears <= 0 || newTermYears > 50) {
      errors.newTermYears = 'New loan term must be between 1 and 50 years.';
    }
    if (!Number.isFinite(closingCosts) || closingCosts < 0) {
      errors.closingCosts = `Closing costs must be ${currencyMeta.symbol}0 or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let curPayment = 0;
  let newPayment = 0;
  let monthlySavings = 0;
  let breakEvenMonths = 0;
  let curTotalPaid = 0;
  let newTotalPaid = 0;
  let lifetimeSavings = 0;

  if (!isEmpty && !hasErrors) {
    const curMonthlyRate = currentRate / 100 / 12;
    const curMonths = currentRemainingYears * 12;
    curPayment =
      curMonthlyRate === 0
        ? currentBalance / curMonths
        : (currentBalance * curMonthlyRate * Math.pow(1 + curMonthlyRate, curMonths)) /
          (Math.pow(1 + curMonthlyRate, curMonths) - 1);

    const newMonthlyRate = newRate / 100 / 12;
    const newMonths = newTermYears * 12;
    newPayment =
      newMonthlyRate === 0
        ? currentBalance / newMonths
        : (currentBalance * newMonthlyRate * Math.pow(1 + newMonthlyRate, newMonths)) /
          (Math.pow(1 + newMonthlyRate, newMonths) - 1);

    monthlySavings = curPayment - newPayment;
    breakEvenMonths = monthlySavings > 0 ? closingCosts / monthlySavings : 0;

    curTotalPaid = curPayment * curMonths;
    newTotalPaid = newPayment * newMonths + closingCosts;
    lifetimeSavings = curTotalPaid - newTotalPaid;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const breakEvenDisplay = breakEvenMonths > 0 ? `${breakEvenMonths.toFixed(1)} months` : 'N/A';

  const copyText = `Refinance Summary — Current Payment: ${formatWhole(curPayment)}/mo | New Payment: ${formatWhole(newPayment)}/mo | Monthly Change: ${formatSignedCurrency(monthlySavings)}/mo | Break-Even: ${breakEvenDisplay} | Lifetime Savings: ${formatSignedCurrency(lifetimeSavings)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Mortgage & Refinance Terms"
          subtitle="Compare your existing mortgage payment and lifetime cost against a new refinance offer."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary">Current Mortgage Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Remaining Loan Balance"
                htmlFor={curBalId}
                unit={currency}
                error={errors.currentBalance}
              >
                <input
                  id={curBalId}
                  type="number"
                  min="0"
                  step="any"
                  value={currentBalanceStr}
                  onChange={(e) => setCurrentBalanceStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="250000"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Current Interest Rate"
                htmlFor={curRateId}
                unit="%"
                error={errors.currentRate}
              >
                <input
                  id={curRateId}
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentRateStr}
                  onChange={(e) => setCurrentRateStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6.5"
                />
              </ToolFieldGroup>
            </div>

            <ToolFieldGroup
              label="Remaining Term"
              htmlFor={curTermId}
              unit="years"
              error={errors.currentRemainingYears}
            >
              <input
                id={curTermId}
                type="number"
                min="1"
                step="1"
                value={currentRemainingYearsStr}
                onChange={(e) => setCurrentRemainingYearsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary">New Refinance Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="New Interest Rate"
                htmlFor={newRateId}
                unit="%"
                error={errors.newRate}
              >
                <input
                  id={newRateId}
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRateStr}
                  onChange={(e) => setNewRateStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5.5"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="New Loan Term"
                htmlFor={newTermId}
                unit="years"
                error={errors.newTermYears}
              >
                <input
                  id={newTermId}
                  type="number"
                  min="1"
                  step="1"
                  value={newTermYearsStr}
                  onChange={(e) => setNewTermYearsStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="30"
                />
              </ToolFieldGroup>
            </div>

            <ToolFieldGroup
              label="Closing Costs"
              htmlFor={closingId}
              unit={currency}
              error={errors.closingCosts}
            >
              <input
                id={closingId}
                type="number"
                min="0"
                step="any"
                value={closingCostsStr}
                onChange={(e) => setClosingCostsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4000"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Refinance Analysis & Savings"
          state={resultState}
          primaryLabel="New Monthly Payment"
          primaryValue={formatWhole(newPayment)}
          primaryUnit="/mo"
          primarySubtext={
            monthlySavings > 0
              ? `Saves ${formatWhole(monthlySavings)}/mo vs. current ${formatWhole(curPayment)}/mo`
              : monthlySavings < 0
                ? `Increases payment by ${formatWhole(Math.abs(monthlySavings))}/mo vs. current`
                : 'Matches current monthly payment'
          }
          statusLabel={lifetimeSavings >= 0 ? 'Net Lifetime Savings' : 'Higher Lifetime Cost'}
          statusTone={lifetimeSavings >= 0 ? 'success' : 'warning'}
          copyText={copyText}
          emptyTitle="Enter mortgage terms to compare"
          emptyDescription="Provide your current loan details and refinance offer terms to calculate monthly savings and break-even timing."
          errorTitle="Invalid mortgage terms"
          errorMessage={Object.values(errors)[0] || 'Check loan balance, rates, terms, and closing costs.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Current Monthly Payment"
              value={formatWhole(curPayment)}
            />
            <ToolMetricTile label="Break-Even Point" value={breakEvenDisplay} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Current Monthly Payment',
                value: `${formatWhole(curPayment)}/mo`
              },
              {
                label: 'New Monthly Payment',
                value: `${formatWhole(newPayment)}/mo`
              },
              {
                label: 'Monthly Cash Flow Difference',
                value: `${formatSignedCurrency(monthlySavings)}/mo`
              },
              {
                label: 'Break-Even Point',
                value: breakEvenDisplay
              },
              {
                label: 'Lifetime Interest Savings',
                value: formatSignedCurrency(lifetimeSavings),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
