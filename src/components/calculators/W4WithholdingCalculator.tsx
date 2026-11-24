import { useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  payFrequency: '26' as '12' | '24' | '26' | '52',
  grossPayPerPeriod: '3200',
  filingStatus: 'single' as 'single' | 'married',
  dependentsAmount: '2000',
  extraWithholding: '50'
};

export default function W4WithholdingCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [payFrequency, setPayFrequency] = useState<'12' | '24' | '26' | '52'>(
    DEFAULTS.payFrequency
  );
  const [grossPayStr, setGrossPayStr] = useState<string>(DEFAULTS.grossPayPerPeriod);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>(DEFAULTS.filingStatus);
  const [dependentsAmountStr, setDependentsAmountStr] = useState<string>(
    DEFAULTS.dependentsAmount
  );
  const [extraWithholdingStr, setExtraWithholdingStr] = useState<string>(
    DEFAULTS.extraWithholding
  );

  const grossId = useId();
  const freqId = useId();
  const depId = useId();
  const extraId = useId();

  const handleReset = () => {
    setPayFrequency(DEFAULTS.payFrequency);
    setGrossPayStr(DEFAULTS.grossPayPerPeriod);
    setFilingStatus(DEFAULTS.filingStatus);
    setDependentsAmountStr(DEFAULTS.dependentsAmount);
    setExtraWithholdingStr(DEFAULTS.extraWithholding);
  };

  const handleClear = () => {
    setGrossPayStr('');
    setDependentsAmountStr('');
    setExtraWithholdingStr('');
  };

  const isEmpty =
    grossPayStr.trim() === '' ||
    dependentsAmountStr.trim() === '' ||
    extraWithholdingStr.trim() === '';

  const grossPayPerPeriod = Number(grossPayStr);
  const dependentsAmount = Number(dependentsAmountStr);
  const extraWithholding = Number(extraWithholdingStr);
  const payFrequencyNum = Number(payFrequency);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(grossPayPerPeriod) || grossPayPerPeriod < 0) {
      errors.grossPay = `Gross pay per period must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(dependentsAmount) || dependentsAmount < 0) {
      errors.dependentsAmount = `Dependent credits must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(extraWithholding) || extraWithholding < 0) {
      errors.extraWithholding = `Extra withholding must be ${currencyMeta.symbol}0 or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let annualGross = 0;
  let taxableIncome = 0;
  let annualTax = 0;
  let withholdingPerPeriod = 0;
  let netPayPerPeriod = 0;

  if (!isEmpty && !hasErrors) {
    annualGross = grossPayPerPeriod * payFrequencyNum;
    const standardDeduction = filingStatus === 'married' ? 29200 : 14600;
    taxableIncome = Math.max(0, annualGross - standardDeduction - dependentsAmount);

    if (taxableIncome <= 11600) {
      annualTax = taxableIncome * 0.1;
    } else if (taxableIncome <= 47150) {
      annualTax = 1160 + (taxableIncome - 11600) * 0.12;
    } else if (taxableIncome <= 100525) {
      annualTax = 5426 + (taxableIncome - 47150) * 0.22;
    } else {
      annualTax = 17188.5 + (taxableIncome - 100525) * 0.24;
    }

    withholdingPerPeriod = annualTax / payFrequencyNum + extraWithholding;
    netPayPerPeriod = grossPayPerPeriod - withholdingPerPeriod;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `W-4 Paycheck Withholding (${payFrequencyNum}/yr, ${filingStatus === 'married' ? 'Married' : 'Single'}) — Gross Pay: ${formatWhole(grossPayPerPeriod)} | Est. Federal Withholding: -${formatWhole(withholdingPerPeriod)} | Est. Net Pay (Before FICA): ${formatWhole(netPayPerPeriod)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Paycheck & W-4 Filing Inputs"
          subtitle="Estimate federal paycheck tax withholding using standard deductions and progressive brackets."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-2">
            <span className="ui-label block">Filing Status</span>
            <ToolSegmentedControl
              ariaLabel="Filing status"
              value={filingStatus}
              onChange={setFilingStatus}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married Filing Jointly' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Gross Pay Per Pay Period"
              htmlFor={grossId}
              unit={currency}
              error={errors.grossPay}
            >
              <input
                id={grossId}
                type="number"
                min="0"
                step="any"
                value={grossPayStr}
                onChange={(e) => setGrossPayStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3200"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Pay Frequency" htmlFor={freqId} unit="paychecks/yr">
              <select
                id={freqId}
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value as '12' | '24' | '26' | '52')}
                className="ui-select"
              >
                <option value="12">Monthly (12)</option>
                <option value="24">Semi-Monthly (24)</option>
                <option value="26">Bi-Weekly (26)</option>
                <option value="52">Weekly (52)</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Dependent Credits Total"
              htmlFor={depId}
              unit={currency}
              error={errors.dependentsAmount}
            >
              <input
                id={depId}
                type="number"
                min="0"
                step="any"
                value={dependentsAmountStr}
                onChange={(e) => setDependentsAmountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Extra Withholding per Paycheck"
              htmlFor={extraId}
              unit={currency}
              error={errors.extraWithholding}
            >
              <input
                id={extraId}
                type="number"
                min="0"
                step="any"
                value={extraWithholdingStr}
                onChange={(e) => setExtraWithholdingStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">IRS Form W-4 Guidance:</strong> Estimates federal
            income tax withholding per pay period using current standard deductions and brackets.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Paycheck Withholding Summary"
          state={resultState}
          primaryLabel="Estimated Net Pay (Before FICA)"
          primaryValue={formatWhole(netPayPerPeriod)}
          primaryUnit="/period"
          primarySubtext={`After -${formatWhole(withholdingPerPeriod)} federal withholding on ${formatWhole(grossPayPerPeriod)} gross`}
          statusLabel={`${payFrequencyNum} Paychecks/yr`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter paycheck details"
          emptyDescription="Provide gross pay per period, dependent credits, and extra withholding to estimate federal tax."
          errorTitle="Invalid paycheck inputs"
          errorMessage={Object.values(errors)[0] || `Gross pay, credits, and extra withholding must be ${currencyMeta.symbol}0 or greater.`}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Gross Pay per Period"
              value={formatWhole(grossPayPerPeriod)}
            />
            <ToolMetricTile
              label="Est. Federal Withholding"
              value={`-${formatWhole(withholdingPerPeriod)}`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Estimated Annual Gross',
                value: formatWhole(annualGross)
              },
              {
                label: 'Estimated Taxable Income',
                value: formatWhole(taxableIncome)
              },
              {
                label: 'Gross Pay per Period',
                value: formatWhole(grossPayPerPeriod)
              },
              {
                label: 'Estimated Federal Withholding',
                value: `-${formatWhole(withholdingPerPeriod)}`
              },
              {
                label: 'Estimated Net Pay (Before FICA)',
                value: formatWhole(netPayPerPeriod),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
