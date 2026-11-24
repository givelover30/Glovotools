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
  costBasis: '12000',
  disposalProceeds: '25000',
  transactionFees: '50',
  holdingPeriod: 'short' as 'long' | 'short',
  taxRate: '24'
};

export default function CryptoTaxCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [costBasisStr, setCostBasisStr] = useState<string>(DEFAULTS.costBasis);
  const [disposalProceedsStr, setDisposalProceedsStr] = useState<string>(
    DEFAULTS.disposalProceeds
  );
  const [transactionFeesStr, setTransactionFeesStr] = useState<string>(DEFAULTS.transactionFees);
  const [holdingPeriod, setHoldingPeriod] = useState<'long' | 'short'>(DEFAULTS.holdingPeriod);
  const [taxRateStr, setTaxRateStr] = useState<string>(DEFAULTS.taxRate);

  const basisId = useId();
  const proceedsId = useId();
  const feesId = useId();
  const rateId = useId();

  const handleReset = () => {
    setCostBasisStr(DEFAULTS.costBasis);
    setDisposalProceedsStr(DEFAULTS.disposalProceeds);
    setTransactionFeesStr(DEFAULTS.transactionFees);
    setHoldingPeriod(DEFAULTS.holdingPeriod);
    setTaxRateStr(DEFAULTS.taxRate);
  };

  const handleClear = () => {
    setCostBasisStr('');
    setDisposalProceedsStr('');
    setTransactionFeesStr('');
    setTaxRateStr('');
  };

  const isEmpty =
    costBasisStr.trim() === '' ||
    disposalProceedsStr.trim() === '' ||
    transactionFeesStr.trim() === '' ||
    taxRateStr.trim() === '';

  const costBasis = Number(costBasisStr);
  const disposalProceeds = Number(disposalProceedsStr);
  const transactionFees = Number(transactionFeesStr);
  const taxRate = Number(taxRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(costBasis) || costBasis < 0) {
      errors.costBasis = `Cost basis must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(disposalProceeds) || disposalProceeds < 0) {
      errors.disposalProceeds = `Disposal proceeds must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(transactionFees) || transactionFees < 0) {
      errors.transactionFees = `Exchange & gas fees must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.taxRate = 'Applicable tax rate must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let capitalGain = 0;
  let estimatedTax = 0;
  let netProceeds = 0;

  if (!isEmpty && !hasErrors) {
    capitalGain = Math.max(0, disposalProceeds - costBasis - transactionFees);
    estimatedTax = capitalGain * (taxRate / 100);
    netProceeds = disposalProceeds - transactionFees - estimatedTax;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Crypto Tax Summary (${holdingPeriod === 'short' ? 'Short-Term' : 'Long-Term'} @ ${taxRate}%) — Realized Capital Gain: ${formatWhole(capitalGain)} | Estimated Tax Liability: ${formatWhole(estimatedTax)} | Net Cash Proceeds After Tax: ${formatWhole(netProceeds)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Crypto Disposal & Tax Profile"
          subtitle="Compute realized crypto capital gain, estimated tax liability, and net proceeds."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-2">
            <span className="ui-label block">Holding Period</span>
            <ToolSegmentedControl
              ariaLabel="Holding period"
              value={holdingPeriod}
              onChange={setHoldingPeriod}
              options={[
                { value: 'short', label: 'Short-Term (≤ 1 Year)' },
                { value: 'long', label: 'Long-Term (> 1 Year)' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Cost Basis (Acquisition + Fees)"
              htmlFor={basisId}
              unit={currency}
              error={errors.costBasis}
            >
              <input
                id={basisId}
                type="number"
                min="0"
                step="any"
                value={costBasisStr}
                onChange={(e) => setCostBasisStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Disposal Proceeds (Sale Value)"
              htmlFor={proceedsId}
              unit={currency}
              error={errors.disposalProceeds}
            >
              <input
                id={proceedsId}
                type="number"
                min="0"
                step="any"
                value={disposalProceedsStr}
                onChange={(e) => setDisposalProceedsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25000"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Exchange & Gas Fees"
              htmlFor={feesId}
              unit={currency}
              error={errors.transactionFees}
            >
              <input
                id={feesId}
                type="number"
                min="0"
                step="any"
                value={transactionFeesStr}
                onChange={(e) => setTransactionFeesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Applicable Tax Rate"
              htmlFor={rateId}
              unit="%"
              error={errors.taxRate}
            >
              <input
                id={rateId}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRateStr}
                onChange={(e) => setTaxRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="24"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">IRS Compliance:</strong> Complies with IRS Notice
            2014-21 treating digital assets as property. Consult a tax professional for filing.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Crypto Capital Gain & Tax"
          state={resultState}
          primaryLabel="Estimated Tax Liability"
          primaryValue={formatWhole(estimatedTax)}
          primarySubtext={`${taxRate}% ${holdingPeriod === 'short' ? 'short-term ordinary' : 'long-term capital gains'} rate on ${formatWhole(capitalGain)} realized gain`}
          statusLabel={holdingPeriod === 'short' ? 'Short-Term' : 'Long-Term'}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter crypto transaction details"
          emptyDescription="Provide cost basis, disposal proceeds, exchange fees, and tax rate to estimate tax owed."
          errorTitle="Invalid transaction values"
          errorMessage={Object.values(errors)[0] || 'Check cost basis, proceeds, fees, and tax rate.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Realized Capital Gain"
              value={formatWhole(capitalGain)}
            />
            <ToolMetricTile
              label="Net Cash Proceeds"
              value={formatWhole(netProceeds)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Realized Capital Gain',
                value: formatWhole(capitalGain)
              },
              {
                label: 'Estimated Tax Liability',
                value: formatWhole(estimatedTax)
              },
              {
                label: 'Net Cash Proceeds After Tax',
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
