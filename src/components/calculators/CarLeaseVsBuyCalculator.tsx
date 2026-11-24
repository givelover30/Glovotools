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
  msrp: '38000',
  downPayment: '3000',
  loanTermMonths: '60',
  loanApr: '6.5',
  leaseTermMonths: '36',
  monthlyLease: '420',
  leaseDueAtSigning: '2500',
  residualValue: '22000'
};

export default function CarLeaseVsBuyCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [msrpStr, setMsrpStr] = useState<string>(DEFAULTS.msrp);
  const [downPaymentStr, setDownPaymentStr] = useState<string>(DEFAULTS.downPayment);
  const [loanTermMonthsStr, setLoanTermMonthsStr] = useState<string>(DEFAULTS.loanTermMonths);
  const [loanAprStr, setLoanAprStr] = useState<string>(DEFAULTS.loanApr);

  const [leaseTermMonthsStr, setLeaseTermMonthsStr] = useState<string>(DEFAULTS.leaseTermMonths);
  const [monthlyLeaseStr, setMonthlyLeaseStr] = useState<string>(DEFAULTS.monthlyLease);
  const [leaseDueAtSigningStr, setLeaseDueAtSigningStr] = useState<string>(
    DEFAULTS.leaseDueAtSigning
  );
  const [residualValueStr, setResidualValueStr] = useState<string>(DEFAULTS.residualValue);

  const msrpId = useId();
  const downId = useId();
  const loanTermId = useId();
  const aprId = useId();
  const leaseTermId = useId();
  const leaseMoId = useId();
  const dueId = useId();
  const residualId = useId();

  const handleReset = () => {
    setMsrpStr(DEFAULTS.msrp);
    setDownPaymentStr(DEFAULTS.downPayment);
    setLoanTermMonthsStr(DEFAULTS.loanTermMonths);
    setLoanAprStr(DEFAULTS.loanApr);
    setLeaseTermMonthsStr(DEFAULTS.leaseTermMonths);
    setMonthlyLeaseStr(DEFAULTS.monthlyLease);
    setLeaseDueAtSigningStr(DEFAULTS.leaseDueAtSigning);
    setResidualValueStr(DEFAULTS.residualValue);
  };

  const handleClear = () => {
    setMsrpStr('');
    setDownPaymentStr('');
    setLoanTermMonthsStr('');
    setLoanAprStr('');
    setLeaseTermMonthsStr('');
    setMonthlyLeaseStr('');
    setLeaseDueAtSigningStr('');
    setResidualValueStr('');
  };

  const isEmpty =
    msrpStr.trim() === '' ||
    downPaymentStr.trim() === '' ||
    loanTermMonthsStr.trim() === '' ||
    loanAprStr.trim() === '' ||
    leaseTermMonthsStr.trim() === '' ||
    monthlyLeaseStr.trim() === '' ||
    leaseDueAtSigningStr.trim() === '' ||
    residualValueStr.trim() === '';

  const msrp = Number(msrpStr);
  const downPayment = Number(downPaymentStr);
  const loanTermMonths = Number(loanTermMonthsStr);
  const loanApr = Number(loanAprStr);
  const leaseTermMonths = Number(leaseTermMonthsStr);
  const monthlyLease = Number(monthlyLeaseStr);
  const leaseDueAtSigning = Number(leaseDueAtSigningStr);
  const residualValue = Number(residualValueStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(msrp) || msrp <= 0) {
      errors.msrp = `Vehicle purchase price (MSRP) must be greater than ${currencyMeta.symbol}0.`;
    }
    if (!Number.isFinite(downPayment) || downPayment < 0) {
      errors.downPayment = `Down payment must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(loanTermMonths) || loanTermMonths <= 0) {
      errors.loanTermMonths = 'Loan term must be greater than 0 months.';
    }
    if (!Number.isFinite(loanApr) || loanApr < 0 || loanApr > 100) {
      errors.loanApr = 'Loan APR must be between 0% and 100%.';
    }
    if (!Number.isFinite(leaseTermMonths) || leaseTermMonths <= 0) {
      errors.leaseTermMonths = 'Lease term must be greater than 0 months.';
    }
    if (!Number.isFinite(monthlyLease) || monthlyLease < 0) {
      errors.monthlyLease = `Monthly lease payment must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(leaseDueAtSigning) || leaseDueAtSigning < 0) {
      errors.leaseDueAtSigning = `Due at signing must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(residualValue) || residualValue < 0) {
      errors.residualValue = `Residual value must be ${currencyMeta.symbol}0 or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let loanMonthlyPayment = 0;
  let totalBuyCost = 0;
  let totalLeaseCost = 0;

  if (!isEmpty && !hasErrors) {
    const loanPrincipal = msrp - downPayment;
    const monthlyRate = loanApr / 100 / 12;
    loanMonthlyPayment =
      monthlyRate === 0
        ? loanPrincipal / loanTermMonths
        : (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
          (Math.pow(1 + monthlyRate, loanTermMonths) - 1);

    totalBuyCost = downPayment + loanMonthlyPayment * loanTermMonths;
    totalLeaseCost = leaseDueAtSigning + monthlyLease * leaseTermMonths;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Car Lease vs. Buy Comparison — Monthly Loan Payment: ${formatWhole(loanMonthlyPayment)}/mo | Total Cost to Buy (${loanTermMonths}mo): ${formatWhole(totalBuyCost)} | Total Cost to Lease (${leaseTermMonths}mo): ${formatWhole(totalLeaseCost)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Vehicle Financing & Lease Terms"
          subtitle="Compare auto loan financing outlays against lease payments and upfront signing costs."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-secondary">Buying Financing Options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Vehicle Purchase Price (MSRP)"
                htmlFor={msrpId}
                unit={currency}
                error={errors.msrp}
              >
                <input
                  id={msrpId}
                  type="number"
                  min="0"
                  step="any"
                  value={msrpStr}
                  onChange={(e) => setMsrpStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="38000"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Down Payment"
                htmlFor={downId}
                unit={currency}
                error={errors.downPayment}
              >
                <input
                  id={downId}
                  type="number"
                  min="0"
                  step="any"
                  value={downPaymentStr}
                  onChange={(e) => setDownPaymentStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="3000"
                />
              </ToolFieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Loan Term"
                htmlFor={loanTermId}
                unit="months"
                error={errors.loanTermMonths}
              >
                <input
                  id={loanTermId}
                  type="number"
                  min="1"
                  step="1"
                  value={loanTermMonthsStr}
                  onChange={(e) => setLoanTermMonthsStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="60"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="Loan APR" htmlFor={aprId} unit="%" error={errors.loanApr}>
                <input
                  id={aprId}
                  type="number"
                  min="0"
                  step="0.1"
                  value={loanAprStr}
                  onChange={(e) => setLoanAprStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6.5"
                />
              </ToolFieldGroup>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle space-y-3">
            <p className="text-xs font-semibold text-text-secondary">Lease Options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Lease Term"
                htmlFor={leaseTermId}
                unit="months"
                error={errors.leaseTermMonths}
              >
                <input
                  id={leaseTermId}
                  type="number"
                  min="1"
                  step="1"
                  value={leaseTermMonthsStr}
                  onChange={(e) => setLeaseTermMonthsStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="36"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Monthly Lease Payment"
                htmlFor={leaseMoId}
                unit={`${currency}/mo`}
                error={errors.monthlyLease}
              >
                <input
                  id={leaseMoId}
                  type="number"
                  min="0"
                  step="any"
                  value={monthlyLeaseStr}
                  onChange={(e) => setMonthlyLeaseStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="420"
                />
              </ToolFieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Due at Signing"
                htmlFor={dueId}
                unit={currency}
                error={errors.leaseDueAtSigning}
              >
                <input
                  id={dueId}
                  type="number"
                  min="0"
                  step="any"
                  value={leaseDueAtSigningStr}
                  onChange={(e) => setLeaseDueAtSigningStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="2500"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Residual Value at End"
                htmlFor={residualId}
                unit={currency}
                error={errors.residualValue}
              >
                <input
                  id={residualId}
                  type="number"
                  min="0"
                  step="any"
                  value={residualValueStr}
                  onChange={(e) => setResidualValueStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="22000"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Lease vs. Buy Cost Comparison"
          state={resultState}
          primaryLabel="Monthly Loan Payment"
          primaryValue={`${formatWhole(loanMonthlyPayment)}/mo`}
          primarySubtext={`Buy (${loanTermMonths}mo): ${formatWhole(totalBuyCost)} vs. Lease (${leaseTermMonths}mo): ${formatWhole(totalLeaseCost)}`}
          statusLabel={`Lease ${formatWhole(monthlyLease)}/mo`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter buy & lease terms"
          emptyDescription="Provide vehicle MSRP, loan financing details, and lease payment terms to compare total costs."
          errorTitle="Invalid vehicle financing inputs"
          errorMessage={Object.values(errors)[0] || 'Check loan and lease parameters.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label={`Total Cost to Buy (${loanTermMonths}mo)`}
              value={formatWhole(totalBuyCost)}
            />
            <ToolMetricTile
              label={`Total Cost to Lease (${leaseTermMonths}mo)`}
              value={formatWhole(totalLeaseCost)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Monthly Loan Payment',
                value: `${formatWhole(loanMonthlyPayment)}/mo`,
                highlight: true
              },
              {
                label: `Total Cost to Buy (${loanTermMonths}mo)`,
                value: formatWhole(totalBuyCost)
              },
              {
                label: `Total Cost to Lease (${leaseTermMonths}mo)`,
                value: formatWhole(totalLeaseCost)
              },
              {
                label: 'Lease-End Residual Buyout',
                value: formatWhole(residualValue)
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
