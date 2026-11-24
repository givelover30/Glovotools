import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import LoanAmortizationChart from './LoanAmortizationChart.tsx';
import {
  ToolAdvancedToggle,
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  loanAmount: '250000',
  interestRate: '6.5',
  loanTermYears: '1',
  downPayment: '0',
  monthlyTaxInsurance: '0'
};

export default function LoanCalculator({ initialTermYears = '1' }: { initialTermYears?: string }) {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const symbol = currencyMeta.symbol;
  const presetPrefix = symbol === currency ? `${symbol} ` : symbol;
  const inputPadClass = symbol.length >= 3 ? 'pl-12' : symbol.length === 2 ? 'pl-10' : 'pl-8';

  const [loanAmount, setLoanAmount] = useState<string>(DEFAULTS.loanAmount);
  const [interestRate, setInterestRate] = useState<string>(DEFAULTS.interestRate);
  const [loanTermYears, setLoanTermYears] = useState<string>(initialTermYears);
  const [downPayment, setDownPayment] = useState<string>(DEFAULTS.downPayment);
  const [monthlyTaxInsurance, setMonthlyTaxInsurance] = useState<string>(
    DEFAULTS.monthlyTaxInsurance
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const loanAmountId = useId();
  const interestRateId = useId();
  const loanTermYearsId = useId();
  const downPaymentId = useId();
  const taxInsuranceId = useId();

  // Validation
  const errors: Record<string, string> = {};
  const isEmpty = loanAmount.trim() === '' || interestRate.trim() === '' || loanTermYears.trim() === '';

  const parsedAmount = Number(loanAmount);
  const parsedRate = Number(interestRate);
  const parsedYears = Number(loanTermYears);
  const parsedDownPayment = downPayment.trim() === '' ? 0 : Number(downPayment);
  const parsedTaxIns = monthlyTaxInsurance.trim() === '' ? 0 : Number(monthlyTaxInsurance);

  if (!isEmpty) {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      errors.loanAmount = `Enter a loan amount greater than ${symbol}0.`;
    }
    if (!Number.isFinite(parsedRate) || parsedRate < 0 || parsedRate > 50) {
      errors.interestRate = 'Enter an annual rate between 0% and 50%.';
    }
    if (!Number.isFinite(parsedYears) || parsedYears <= 0 || parsedYears > 50) {
      errors.loanTermYears = 'Enter a loan term between 1 and 50 years.';
    }
    if (!Number.isFinite(parsedDownPayment) || parsedDownPayment < 0) {
      errors.downPayment = 'Down payment cannot be negative.';
    } else if (Number.isFinite(parsedAmount) && parsedDownPayment >= parsedAmount) {
      errors.downPayment = 'Down payment must be less than the loan amount.';
    }
    if (!Number.isFinite(parsedTaxIns) || parsedTaxIns < 0) {
      errors.monthlyTaxInsurance = 'Tax & insurance cannot be negative.';
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  // Core amortization math (preserved identically when downPayment = 0 & monthlyTaxInsurance = 0)
  const principal = !isEmpty && !hasErrors ? Math.max(0, parsedAmount - parsedDownPayment) : 0;
  const monthlyRate = !isEmpty && !hasErrors && parsedRate > 0 ? parsedRate / 100 / 12 : 0;
  const numberOfPayments = !isEmpty && !hasErrors ? Math.round(parsedYears * 12) : 0;

  let monthlyPayment = 0;
  if (numberOfPayments > 0 && principal > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfPayments;
    } else {
      monthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = Math.max(0, totalPayment - principal);
  const totalMonthlyWithEscrow = monthlyPayment + (Number.isFinite(parsedTaxIns) ? parsedTaxIns : 0);

  const principalSharePct = totalPayment > 0 ? (principal / totalPayment) * 100 : 0;
  const interestSharePct = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  // First 12 months amortization breakdown
  const previewSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }> = [];

  if (!isEmpty && !hasErrors && numberOfPayments > 0 && principal > 0) {
    let currentBalance = principal;
    for (let m = 1; m <= Math.min(12, numberOfPayments); m++) {
      const interestPart = currentBalance * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      currentBalance = Math.max(0, currentBalance - principalPart);
      previewSchedule.push({
        month: m,
        payment: monthlyPayment,
        principal: principalPart,
        interest: interestPart,
        balance: currentBalance
      });
    }
  }

  const fullSchedule = useMemo(() => {
    if (isEmpty || hasErrors || numberOfPayments <= 0 || principal <= 0) return [];
    const schedule = [];
    let currentBalance = principal;
    for (let m = 1; m <= numberOfPayments; m++) {
      const interestPart = currentBalance * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      currentBalance = Math.max(0, currentBalance - principalPart);
      schedule.push({
        month: m,
        balance: currentBalance,
        principal: principalPart,
        interest: interestPart
      });
    }
    return schedule;
  }, [isEmpty, hasErrors, numberOfPayments, principal, monthlyRate, monthlyPayment]);

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount);
    setInterestRate(DEFAULTS.interestRate);
    setLoanTermYears(DEFAULTS.loanTermYears);
    setDownPayment(DEFAULTS.downPayment);
    setMonthlyTaxInsurance(DEFAULTS.monthlyTaxInsurance);
  };

  const handleClear = () => {
    setLoanAmount('');
    setInterestRate('');
    setDownPayment('');
    setMonthlyTaxInsurance('');
  };

  const resultState: 'ready' | 'empty' | 'error' = hasErrors
    ? 'error'
    : isEmpty || principal <= 0
      ? 'empty'
      : 'ready';

  const copySummary = `Monthly Payment (P&I): ${formatCurrency(monthlyPayment)}/mo | Principal: ${formatCurrency(principal)} | Total Interest: ${formatCurrency(totalInterest)} | Total Cost: ${formatCurrency(totalPayment)}`;

  const breakdownItems = [
    { label: 'Principal Financed', value: formatCurrency(principal) },
    { label: 'Total Interest Paid', value: formatCurrency(totalInterest) },
    ...(parsedTaxIns > 0
      ? [
          { label: 'Est. Monthly Tax & Insurance', value: formatCurrency(parsedTaxIns) },
          { label: 'Total Est. Monthly (PITI)', value: formatCurrency(totalMonthlyWithEscrow), highlight: true }
        ]
      : []),
    { label: 'Total Loan Cost', value: formatCurrency(totalPayment), highlight: parsedTaxIns <= 0 }
  ];

  const rateSliderVal = Math.min(15, Math.max(1, Number(interestRate) || 6.5));

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Loan Parameters"
          subtitle="Enter loan amount, annual interest rate, and repayment term."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup
            label="Loan Amount"
            htmlFor={loanAmountId}
            unit={currency}
            error={errors.loanAmount}
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-mono pointer-events-none">
                {symbol}
              </span>
              <input
                id={loanAmountId}
                type="number"
                min={1000}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="250000"
                className={`ui-input ${inputPadClass} font-mono tabular-nums`}
              />
            </div>
            <ToolPresetBar
              label="Presets:"
              presets={[50000, 150000, 250000, 350000, 500000].map((amt) => ({
                label: `${presetPrefix}${amt / 1000}k`,
                onSelect: () => setLoanAmount(String(amt))
              }))}
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label="Annual Interest Rate"
            htmlFor={interestRateId}
            unit="APR %"
            error={errors.interestRate}
          >
            <div className="relative">
              <input
                id={interestRateId}
                type="number"
                step="0.1"
                min={0}
                max={25}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="6.5"
                className="ui-input pr-9 font-mono tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary text-sm font-mono">
                %
              </span>
            </div>
            <input
              type="range"
              aria-label="Annual interest rate slider"
              min={1}
              max={15}
              step={0.25}
              value={rateSliderVal}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full mt-2 accent-accent cursor-pointer"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label="Loan Term"
            htmlFor={loanTermYearsId}
            unit={`${numberOfPayments || 0} payments`}
            error={errors.loanTermYears}
          >
            <select
              id={loanTermYearsId}
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
              className="ui-select"
            >
              <option value="1">1 Year (12 payments)</option>
              <option value="2">2 Years (24 payments)</option>
              <option value="3">3 Years (36 payments)</option>
              <option value="4">4 Years (48 payments)</option>
              <option value="5">5 Years (60 payments)</option>
              <option value="10">10 Years (120 payments)</option>
              <option value="15">15 Years (180 payments)</option>
              <option value="20">20 Years (240 payments)</option>
              <option value="25">25 Years (300 payments)</option>
              <option value="30">30 Years (360 payments)</option>
              <option value="40">40 Years (480 payments)</option>
              <option value="50">50 Years (600 payments)</option>
            </select>
          </ToolFieldGroup>

          <ToolAdvancedToggle
            label="Advanced options (Down payment & escrow)"
            isOpen={showAdvanced}
            onToggle={() => setShowAdvanced((prev) => !prev)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ToolFieldGroup
                label="Down Payment"
                htmlFor={downPaymentId}
                unit={currency}
                hint="Deducted from loan amount"
                error={errors.downPayment}
              >
                <input
                  id={downPaymentId}
                  type="number"
                  min={0}
                  step={1000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0"
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Monthly Tax & Insurance"
                htmlFor={taxInsuranceId}
                unit={`${currency} / mo`}
                hint="Optional escrow estimate"
                error={errors.monthlyTaxInsurance}
              >
                <input
                  id={taxInsuranceId}
                  type="number"
                  min={0}
                  step={25}
                  value={monthlyTaxInsurance}
                  onChange={(e) => setMonthlyTaxInsurance(e.target.value)}
                  placeholder="0"
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>
            </div>
          </ToolAdvancedToggle>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Payment Summary"
          state={resultState}
          primaryLabel="Monthly Payment (P&I)"
          primaryValue={formatCurrency(monthlyPayment)}
          primaryUnit="/ mo"
          primarySubtext={`${numberOfPayments} fixed monthly payments at ${parsedRate}% APR`}
          copyText={copySummary}
          emptyTitle="Enter loan details"
          emptyDescription="Provide a loan amount, interest rate, and term to calculate monthly payments."
          errorTitle="Invalid loan parameter"
          errorMessage={Object.values(errors)[0] || 'Check your loan parameters and try again.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Interest"
              value={formatCurrency(totalInterest)}
              hint={`${interestSharePct.toFixed(0)}% of total cost`}
            />
            <ToolMetricTile
              label="Total Loan Cost"
              value={formatCurrency(totalPayment)}
              hint={`${parsedYears} year total`}
              accent
            />
          </div>

          {/* Principal vs Interest Visual Ratio Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-secondary font-medium tabular-nums">
              <span>Principal: {principalSharePct.toFixed(0)}%</span>
              <span>Interest: {interestSharePct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-surface-secondary border border-border-subtle">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${principalSharePct}%` }}
              />
              <div className="bg-amber-500/90 h-full flex-1 transition-all duration-300" />
            </div>
          </div>

          <ToolBreakdownList items={breakdownItems} />

          {resultState === 'ready' && fullSchedule.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Principal Balance Over Time
              </h4>
              <div className="p-3 rounded-xl border border-border-main bg-surface">
                <LoanAmortizationChart
                  schedule={fullSchedule}
                  principal={principal}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSchedule((prev) => !prev)}
            aria-expanded={showSchedule}
            className="ui-btn-secondary w-full text-xs"
          >
            <span>{showSchedule ? 'Hide Year 1 Amortization Schedule' : 'View Year 1 Amortization Schedule'}</span>
            {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </ToolResultsPanel>
      }
      below={
        showSchedule && resultState === 'ready' ? (
          <section className="ui-panel overflow-hidden animate-fadeIn">
            <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-text-primary">
                First 12 Months Amortization Breakdown
              </h3>
              <span className="text-xs text-text-tertiary font-mono tabular-nums">
                {formatCurrency(monthlyPayment)} / mo
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Payment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums">
                  {previewSchedule.map((row) => (
                    <tr key={row.month}>
                      <td className="font-sans font-medium text-text-primary">Month {row.month}</td>
                      <td>{formatCurrency(row.payment)}</td>
                      <td className="text-accent font-medium">{formatCurrency(row.principal)}</td>
                      <td className="text-text-secondary">{formatCurrency(row.interest)}</td>
                      <td className="font-semibold text-text-primary">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : undefined
      }
    />
  );
}
