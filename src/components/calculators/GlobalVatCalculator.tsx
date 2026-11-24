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
  amount: '100',
  taxRate: '20',
  isInclusive: false
};

export default function GlobalVatCalculator() {
  const { currency, formatCurrency } = useCurrency();
  const [amountStr, setAmountStr] = useState<string>(DEFAULTS.amount);
  const [taxRateStr, setTaxRateStr] = useState<string>(DEFAULTS.taxRate);
  const [isInclusive, setIsInclusive] = useState<boolean>(DEFAULTS.isInclusive);

  const amountId = useId();
  const taxRateId = useId();
  const inclusiveId = useId();

  const handleReset = () => {
    setAmountStr(DEFAULTS.amount);
    setTaxRateStr(DEFAULTS.taxRate);
    setIsInclusive(DEFAULTS.isInclusive);
  };

  const handleClear = () => {
    setAmountStr('');
    setTaxRateStr('');
  };

  const isEmpty = amountStr.trim() === '' || taxRateStr.trim() === '';
  const amount = Number(amountStr);
  const taxRate = Number(taxRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(amount) || amount < 0) {
      errors.amount = 'Amount must be 0 or greater.';
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1000) {
      errors.taxRate = 'VAT / Sales Tax rate must be between 0% and 1,000%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let netAmount = 0;
  let taxAmount = 0;
  let grossAmount = 0;

  if (!isEmpty && !hasErrors) {
    if (isInclusive) {
      grossAmount = amount;
      netAmount = amount / (1 + taxRate / 100);
      taxAmount = grossAmount - netAmount;
    } else {
      netAmount = amount;
      taxAmount = netAmount * (taxRate / 100);
      grossAmount = netAmount + taxAmount;
    }
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Gross Total (Incl. Tax): ${formatCurrency(grossAmount)} | Net Amount (Excl. Tax): ${formatCurrency(netAmount)} | Tax Amount (${taxRate}%): ${formatCurrency(taxAmount)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Tax Calculation Parameters"
          subtitle="Add VAT/sales tax to a net price or extract tax from a tax-inclusive gross total."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Amount" htmlFor={amountId} unit={currency} error={errors.amount}>
              <input
                id={amountId}
                type="number"
                min="0"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="100"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="VAT / Sales Tax Rate" htmlFor={taxRateId} unit="%" error={errors.taxRate}>
              <input
                id={taxRateId}
                type="number"
                min="0"
                step="0.1"
                value={taxRateStr}
                onChange={(e) => setTaxRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="20"
              />
            </ToolFieldGroup>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id={inclusiveId}
              checked={isInclusive}
              onChange={(e) => setIsInclusive(e.target.checked)}
              className="w-4 h-4 rounded border-border-main accent-accent cursor-pointer"
            />
            <label
              htmlFor={inclusiveId}
              className="text-xs font-medium text-text-secondary select-none cursor-pointer"
            >
              Amount is Tax Inclusive (Gross)
            </label>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Tax Breakdown"
          state={resultState}
          primaryLabel="Gross Total (Incl. Tax)"
          primaryValue={formatCurrency(grossAmount)}
          primarySubtext={
            isInclusive
              ? `Extracted ${taxRate}% tax from inclusive amount`
              : `Added ${taxRate}% tax to net amount`
          }
          statusLabel={isInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter amount and tax rate"
          emptyDescription="Provide an amount and VAT/sales tax percentage to calculate net, tax, and gross totals."
          errorTitle="Invalid tax parameters"
          errorMessage={Object.values(errors)[0] || 'Check amount and VAT rate values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Net Amount (Excl. Tax)" value={formatCurrency(netAmount)} />
            <ToolMetricTile label={`Tax Amount (${taxRate}%)`} value={formatCurrency(taxAmount)} accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Net Amount (Excl. Tax)', value: formatCurrency(netAmount) },
              { label: `Tax Amount (${taxRate}%)`, value: formatCurrency(taxAmount) },
              { label: 'Gross Total (Incl. Tax)', value: formatCurrency(grossAmount), highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
