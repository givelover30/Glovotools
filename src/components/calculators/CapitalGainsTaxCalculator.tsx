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
  purchasePrice: '50000',
  salePrice: '85000',
  holdingPeriod: 'long' as 'long' | 'short',
  annualIncome: '75000',
  filingStatus: 'single' as 'single' | 'married'
};

export default function CapitalGainsTaxCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [purchasePriceStr, setPurchasePriceStr] = useState<string>(DEFAULTS.purchasePrice);
  const [salePriceStr, setSalePriceStr] = useState<string>(DEFAULTS.salePrice);
  const [holdingPeriod, setHoldingPeriod] = useState<'long' | 'short'>(DEFAULTS.holdingPeriod);
  const [annualIncomeStr, setAnnualIncomeStr] = useState<string>(DEFAULTS.annualIncome);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>(DEFAULTS.filingStatus);

  const purchaseId = useId();
  const saleId = useId();
  const incomeId = useId();

  const handleReset = () => {
    setPurchasePriceStr(DEFAULTS.purchasePrice);
    setSalePriceStr(DEFAULTS.salePrice);
    setHoldingPeriod(DEFAULTS.holdingPeriod);
    setAnnualIncomeStr(DEFAULTS.annualIncome);
    setFilingStatus(DEFAULTS.filingStatus);
  };

  const handleClear = () => {
    setPurchasePriceStr('');
    setSalePriceStr('');
    setAnnualIncomeStr('');
  };

  const isEmpty =
    purchasePriceStr.trim() === '' ||
    salePriceStr.trim() === '' ||
    annualIncomeStr.trim() === '';

  const purchasePrice = Number(purchasePriceStr);
  const salePrice = Number(salePriceStr);
  const annualIncome = Number(annualIncomeStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      errors.purchasePrice = `Purchase price must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      errors.salePrice = `Sale price must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(annualIncome) || annualIncome < 0) {
      errors.annualIncome = `Annual taxable income must be ${currencyMeta.symbol}0 or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let capitalGain = 0;
  let estimatedTaxRate = 0;
  let estimatedTax = 0;
  let netProceeds = 0;
  let netProfit = 0;

  if (!isEmpty && !hasErrors) {
    capitalGain = Math.max(0, salePrice - purchasePrice);

    if (holdingPeriod === 'short') {
      if (annualIncome <= 11600) estimatedTaxRate = 10;
      else if (annualIncome <= 47150) estimatedTaxRate = 12;
      else if (annualIncome <= 100525) estimatedTaxRate = 22;
      else if (annualIncome <= 191950) estimatedTaxRate = 24;
      else if (annualIncome <= 243725) estimatedTaxRate = 32;
      else if (annualIncome <= 609350) estimatedTaxRate = 35;
      else estimatedTaxRate = 37;
    } else {
      if (filingStatus === 'single') {
        if (annualIncome <= 47025) estimatedTaxRate = 0;
        else if (annualIncome <= 518900) estimatedTaxRate = 15;
        else estimatedTaxRate = 20;
      } else {
        if (annualIncome <= 94050) estimatedTaxRate = 0;
        else if (annualIncome <= 583750) estimatedTaxRate = 15;
        else estimatedTaxRate = 20;
      }
    }

    estimatedTax = capitalGain * (estimatedTaxRate / 100);
    netProceeds = salePrice - estimatedTax;
    netProfit = capitalGain - estimatedTax;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Capital Gains Tax (${estimatedTaxRate}% ${holdingPeriod === 'long' ? 'Long-Term' : 'Short-Term'}) — Gross Gain: ${formatWhole(capitalGain)} | Estimated Tax: ${formatWhole(estimatedTax)} | Net Profit: ${formatWhole(netProfit)} | Net Proceeds: ${formatWhole(netProceeds)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Asset Sale & Tax Profile"
          subtitle="Estimate US federal capital gains tax based on holding period, filing status, and income."
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
                { value: 'long', label: 'Long-Term (> 1 Year)' },
                { value: 'short', label: 'Short-Term (≤ 1 Year)' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Purchase Price / Cost Basis"
              htmlFor={purchaseId}
              unit={currency}
              error={errors.purchasePrice}
            >
              <input
                id={purchaseId}
                type="number"
                min="0"
                step="any"
                value={purchasePriceStr}
                onChange={(e) => setPurchasePriceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Sale Price"
              htmlFor={saleId}
              unit={currency}
              error={errors.salePrice}
            >
              <input
                id={saleId}
                type="number"
                min="0"
                step="any"
                value={salePriceStr}
                onChange={(e) => setSalePriceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="85000"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-4">
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

            <ToolFieldGroup
              label="Annual Taxable Income"
              htmlFor={incomeId}
              unit={currency}
              error={errors.annualIncome}
            >
              <input
                id={incomeId}
                type="number"
                min="0"
                step="any"
                value={annualIncomeStr}
                onChange={(e) => setAnnualIncomeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="75000"
              />
            </ToolFieldGroup>

            {resultState === 'ready' && (
              <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
                <strong className="text-text-primary">Estimated Tax Bracket:</strong>{' '}
                {estimatedTaxRate}% ({holdingPeriod === 'long' ? 'Long-Term' : 'Short-Term Ordinary Income'})
              </div>
            )}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Capital Gains Tax Summary"
          state={resultState}
          primaryLabel="Estimated Tax Liability"
          primaryValue={formatWhole(estimatedTax)}
          primarySubtext={`${estimatedTaxRate}% bracket applied to ${formatWhole(capitalGain)} realized gain`}
          statusLabel={`${estimatedTaxRate}% ${holdingPeriod === 'long' ? 'Long-Term' : 'Short-Term'}`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter asset sale parameters"
          emptyDescription="Provide cost basis, sale price, and taxable income to estimate federal capital gains tax."
          errorTitle="Invalid tax parameters"
          errorMessage={Object.values(errors)[0] || 'Check purchase price, sale price, and annual income.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Net Profit After Tax"
              value={formatWhole(netProfit)}
              accent
            />
            <ToolMetricTile
              label="Net Sale Proceeds"
              value={formatWhole(netProceeds)}
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Gross Capital Gain', value: formatWhole(capitalGain) },
              { label: 'Applicable Tax Rate', value: `${estimatedTaxRate}%` },
              {
                label: 'Estimated Tax Liability',
                value: formatWhole(estimatedTax)
              },
              {
                label: 'Net Profit After Tax',
                value: formatWhole(netProfit)
              },
              {
                label: 'Net Total Sale Proceeds',
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
