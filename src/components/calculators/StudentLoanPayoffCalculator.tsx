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
  loanBalance: '35000',
  interestRate: '5.8',
  standardPayment: '380',
  extraPayment: '150'
};

export default function StudentLoanPayoffCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [loanBalanceStr, setLoanBalanceStr] = useState<string>(DEFAULTS.loanBalance);
  const [interestRateStr, setInterestRateStr] = useState<string>(DEFAULTS.interestRate);
  const [standardPaymentStr, setStandardPaymentStr] = useState<string>(DEFAULTS.standardPayment);
  const [extraPaymentStr, setExtraPaymentStr] = useState<string>(DEFAULTS.extraPayment);

  const balId = useId();
  const rateId = useId();
  const stdId = useId();
  const extraId = useId();

  const handleReset = () => {
    setLoanBalanceStr(DEFAULTS.loanBalance);
    setInterestRateStr(DEFAULTS.interestRate);
    setStandardPaymentStr(DEFAULTS.standardPayment);
    setExtraPaymentStr(DEFAULTS.extraPayment);
  };

  const handleClear = () => {
    setLoanBalanceStr('');
    setInterestRateStr('');
    setStandardPaymentStr('');
    setExtraPaymentStr('');
  };

  const isEmpty =
    loanBalanceStr.trim() === '' ||
    interestRateStr.trim() === '' ||
    standardPaymentStr.trim() === '' ||
    extraPaymentStr.trim() === '';

  const loanBalance = Number(loanBalanceStr);
  const interestRate = Number(interestRateStr);
  const standardPayment = Number(standardPaymentStr);
  const extraPayment = Number(extraPaymentStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(loanBalance) || loanBalance <= 0) {
      errors.loanBalance = `Current loan balance must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 50) {
      errors.interestRate = 'Annual interest rate must be between 0% and 50%.';
    }
    if (!Number.isFinite(standardPayment) || standardPayment <= 0) {
      errors.standardPayment = `Standard monthly payment must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(extraPayment) || extraPayment < 0) {
      errors.extraPayment = `Extra monthly payment must be ${currencyMeta.symbol}0 or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let monthsStandard = 0;
  let totalInterestStandard = 0;
  let monthsAccel = 0;
  let totalInterestAccel = 0;
  let monthsSaved = 0;
  let interestSaved = 0;

  if (!isEmpty && !hasErrors) {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonthlyPayment = standardPayment + extraPayment;

    let balStandard = loanBalance;
    while (balStandard > 0 && monthsStandard < 600) {
      const interest = balStandard * monthlyRate;
      totalInterestStandard += interest;
      balStandard = balStandard + interest - standardPayment;
      monthsStandard++;
      if (balStandard < 0) balStandard = 0;
    }

    let balAccel = loanBalance;
    while (balAccel > 0 && monthsAccel < 600) {
      const interest = balAccel * monthlyRate;
      totalInterestAccel += interest;
      balAccel = balAccel + interest - totalMonthlyPayment;
      monthsAccel++;
      if (balAccel < 0) balAccel = 0;
    }

    monthsSaved = Math.max(0, monthsStandard - monthsAccel);
    interestSaved = Math.max(0, totalInterestStandard - totalInterestAccel);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Student Loan Payoff — Standard: ${(monthsStandard / 12).toFixed(1)} years (${monthsStandard} mo) | Accelerated: ${(monthsAccel / 12).toFixed(1)} years (${monthsAccel} mo) | Time Saved: ${(monthsSaved / 12).toFixed(1)} years | Lifetime Interest Saved: ${formatWhole(interestSaved)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Loan Details & Payment Strategy"
          subtitle="Compare standard repayment against extra monthly principal payments to quantify time and interest saved."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Current Loan Balance"
              htmlFor={balId}
              unit={currency}
              error={errors.loanBalance}
            >
              <input
                id={balId}
                type="number"
                min="0"
                step="any"
                value={loanBalanceStr}
                onChange={(e) => setLoanBalanceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="35000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Annual Interest Rate"
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
                placeholder="5.8"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Standard Monthly Payment"
              htmlFor={stdId}
              unit={`${currency}/mo`}
              error={errors.standardPayment}
            >
              <input
                id={stdId}
                type="number"
                min="0"
                step="any"
                value={standardPaymentStr}
                onChange={(e) => setStandardPaymentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="380"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Extra Principal Payment per Month"
              htmlFor={extraId}
              unit={`${currency}/mo`}
              error={errors.extraPayment}
            >
              <input
                id={extraId}
                type="number"
                min="0"
                step="any"
                value={extraPaymentStr}
                onChange={(e) => setExtraPaymentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="150"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Payoff Acceleration:</strong> Extra contributions
            are applied directly to principal reduction, substantially lowering lifetime interest
            charges.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Student Loan Payoff & Savings"
          state={resultState}
          primaryLabel="Lifetime Interest Saved"
          primaryValue={formatWhole(interestSaved)}
          primarySubtext={`Pay off ${(monthsSaved / 12).toFixed(1)} years sooner (${monthsAccel} mo vs. ${monthsStandard} mo standard)`}
          statusLabel={`${(monthsSaved / 12).toFixed(1)} yrs Saved`}
          statusTone="success"
          copyText={copyText}
          emptyTitle="Enter student loan details"
          emptyDescription="Provide loan balance, interest rate, standard payment, and extra payment to compute payoff savings."
          errorTitle="Invalid loan inputs"
          errorMessage={Object.values(errors)[0] || 'Check loan balance, interest rate, and monthly payments.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Accelerated Payoff"
              value={`${(monthsAccel / 12).toFixed(1)} yrs`}
              hint={`${monthsAccel} months`}
              accent
            />
            <ToolMetricTile
              label="Standard Payoff"
              value={`${(monthsStandard / 12).toFixed(1)} yrs`}
              hint={`${monthsStandard} months`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Standard Payoff Duration',
                value: `${(monthsStandard / 12).toFixed(1)} years (${monthsStandard} mo)`
              },
              {
                label: 'Accelerated Payoff Duration',
                value: `${(monthsAccel / 12).toFixed(1)} years (${monthsAccel} mo)`
              },
              {
                label: 'Time Saved',
                value: `${(monthsSaved / 12).toFixed(1)} years`
              },
              {
                label: 'Lifetime Interest Saved',
                value: formatWhole(interestSaved),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
