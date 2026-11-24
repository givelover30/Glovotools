import { useEffect, useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

export type EverydayTool = 'tip' | 'discount';

interface EverydayCalculatorProps {
  initialTool?: EverydayTool;
}

const DEFAULTS = {
  billAmount: '85',
  tipPercent: '18',
  numPeople: '3',
  originalPrice: '120',
  discountPercent: '25',
  taxPercent: '8.5'
};

export default function EverydayCalculator({ initialTool = 'tip' }: EverydayCalculatorProps) {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [tool, setTool] = useState<EverydayTool>(initialTool);

  useEffect(() => {
    setTool(initialTool);
  }, [initialTool]);

  // Tip & Split inputs
  const [billStr, setBillStr] = useState<string>(DEFAULTS.billAmount);
  const [tipStr, setTipStr] = useState<string>(DEFAULTS.tipPercent);
  const [peopleStr, setPeopleStr] = useState<string>(DEFAULTS.numPeople);

  // Discount & Tax inputs
  const [priceStr, setPriceStr] = useState<string>(DEFAULTS.originalPrice);
  const [discountStr, setDiscountStr] = useState<string>(DEFAULTS.discountPercent);
  const [taxStr, setTaxStr] = useState<string>(DEFAULTS.taxPercent);

  const billId = useId();
  const tipId = useId();
  const peopleId = useId();
  const priceId = useId();
  const discountId = useId();
  const taxId = useId();

  const handleReset = () => {
    if (tool === 'tip') {
      setBillStr(DEFAULTS.billAmount);
      setTipStr(DEFAULTS.tipPercent);
      setPeopleStr(DEFAULTS.numPeople);
    } else {
      setPriceStr(DEFAULTS.originalPrice);
      setDiscountStr(DEFAULTS.discountPercent);
      setTaxStr(DEFAULTS.taxPercent);
    }
  };

  const handleClear = () => {
    if (tool === 'tip') {
      setBillStr('');
      setTipStr('');
      setPeopleStr('');
    } else {
      setPriceStr('');
      setDiscountStr('');
      setTaxStr('');
    }
  };

  const modeTabs = (
    <ToolSegmentedControl
      ariaLabel="Everyday calculation mode"
      value={tool}
      onChange={setTool}
      options={[
        { value: 'tip', label: 'Tip & Bill Split Calculator' },
        { value: 'discount', label: 'Discount & Sales Tax Calculator' }
      ]}
    />
  );

  if (tool === 'tip') {
    const isEmpty = billStr.trim() === '' || tipStr.trim() === '' || peopleStr.trim() === '';
    const billAmount = Number(billStr);
    const tipPercent = Number(tipStr);
    const numPeople = Number(peopleStr);

    const errors: Record<string, string> = {};
    if (!isEmpty) {
      if (!Number.isFinite(billAmount) || billAmount < 0) errors.bill = 'Check total must be 0 or greater.';
      if (!Number.isFinite(tipPercent) || tipPercent < 0) errors.tip = 'Tip percentage must be 0 or greater.';
      if (!Number.isFinite(numPeople) || numPeople < 1) errors.people = 'Split count must be at least 1 person.';
    }
    const hasErrors = Object.keys(errors).length > 0;

    const tipTotal = !isEmpty && !hasErrors ? billAmount * (tipPercent / 100) : 0;
    const totalWithTip = !isEmpty && !hasErrors ? billAmount + tipTotal : 0;
    const perPersonTotal = !isEmpty && !hasErrors && numPeople > 0 ? totalWithTip / numPeople : 0;
    const perPersonTip = !isEmpty && !hasErrors && numPeople > 0 ? tipTotal / numPeople : 0;

    const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
    const copyText = `Each Person Pays: ${formatCurrency(perPersonTotal)} (includes ${formatCurrency(perPersonTip)} tip) | Subtotal: ${formatCurrency(billAmount)} | Total Tip (${tipPercent}%): +${formatCurrency(tipTotal)} | Total Bill: ${formatCurrency(totalWithTip)}`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Bill Details"
            subtitle="Calculate tip amounts and split restaurant or group checks evenly."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <ToolFieldGroup label="Check Total" htmlFor={billId} unit={currencyMeta.symbol} error={errors.bill}>
              <input
                id={billId}
                type="number"
                min="0"
                step="0.01"
                value={billStr}
                onChange={(e) => setBillStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="85"
              />
            </ToolFieldGroup>

            <div className="space-y-2">
              <ToolFieldGroup label="Tip Percentage" htmlFor={tipId} unit="%" error={errors.tip}>
                <input
                  id={tipId}
                  type="number"
                  min="0"
                  step="1"
                  value={tipStr}
                  onChange={(e) => setTipStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="18"
                />
              </ToolFieldGroup>

              <ToolPresetBar
                label="Tip presets:"
                presets={[10, 15, 18, 20, 25].map((pct) => ({
                  label: `${pct}%`,
                  onSelect: () => setTipStr(String(pct))
                }))}
              />
            </div>

            <ToolFieldGroup label="Split Between" htmlFor={peopleId} unit="People" error={errors.people}>
              <input
                id={peopleId}
                type="number"
                min="1"
                max="50"
                step="1"
                value={peopleStr}
                onChange={(e) => setPeopleStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3"
              />
            </ToolFieldGroup>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Bill Split Summary"
            state={resultState}
            primaryLabel="Each Person Pays"
            primaryValue={formatCurrency(perPersonTotal)}
            primarySubtext={`Includes ${formatCurrency(perPersonTip)} tip per person`}
            copyText={copyText}
            emptyTitle="Enter check details"
            emptyDescription="Provide check total, tip percentage, and number of people to split the bill."
            errorTitle="Invalid bill details"
            errorMessage={Object.values(errors)[0] || 'Check bill amount, tip percentage, and people count.'}
          >
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile label={`Total Tip (${tipPercent}%)`} value={`+${formatCurrency(tipTotal)}`} accent />
              <ToolMetricTile label="Total Bill Amount" value={formatCurrency(totalWithTip)} />
            </div>

            <ToolBreakdownList
              items={[
                { label: 'Subtotal', value: formatCurrency(billAmount) },
                { label: `Total Tip (${tipPercent}%)`, value: `+${formatCurrency(tipTotal)}` },
                { label: 'Total Bill Amount', value: formatCurrency(totalWithTip), highlight: true }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Discount & Sales Tax Calculator
  const isEmpty = priceStr.trim() === '' || discountStr.trim() === '' || taxStr.trim() === '';
  const originalPrice = Number(priceStr);
  const discountPercent = Number(discountStr);
  const taxPercent = Number(taxStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(originalPrice) || originalPrice < 0) errors.price = 'Original price must be 0 or greater.';
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      errors.discount = 'Discount must be between 0% and 100%.';
    }
    if (!Number.isFinite(taxPercent) || taxPercent < 0) errors.tax = 'Sales tax must be 0 or greater.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  const discountAmount = !isEmpty && !hasErrors ? originalPrice * (discountPercent / 100) : 0;
  const priceAfterDiscount = !isEmpty && !hasErrors ? Math.max(0, originalPrice - discountAmount) : 0;
  const taxAmount = !isEmpty && !hasErrors ? priceAfterDiscount * (taxPercent / 100) : 0;
  const finalPrice = !isEmpty && !hasErrors ? priceAfterDiscount + taxAmount : 0;

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Final Price Out the Door: ${formatCurrency(finalPrice)} | You Save (${discountPercent}%): -${formatCurrency(discountAmount)} | Sale Price (pre-tax): ${formatCurrency(priceAfterDiscount)} | Estimated Tax (${taxPercent}%): +${formatCurrency(taxAmount)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Item Pricing & Discounts"
          subtitle="Calculate sale price after discount and final total including sales tax."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{modeTabs}</div>

          <ToolFieldGroup label="Original Price" htmlFor={priceId} unit={currencyMeta.symbol} error={errors.price}>
            <input
              id={priceId}
              type="number"
              min="0"
              step="any"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="120"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Discount" htmlFor={discountId} unit="%" error={errors.discount}>
              <input
                id={discountId}
                type="number"
                min="0"
                max="100"
                step="any"
                value={discountStr}
                onChange={(e) => setDiscountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25"
              />
            </ToolFieldGroup>
            <ToolFieldGroup label="Sales Tax" htmlFor={taxId} unit="%" error={errors.tax}>
              <input
                id={taxId}
                type="number"
                min="0"
                step="any"
                value={taxStr}
                onChange={(e) => setTaxStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8.5"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Price & Tax Summary"
          state={resultState}
          primaryLabel="Final Price Out the Door"
          primaryValue={formatCurrency(finalPrice)}
          primarySubtext={`You save ${formatCurrency(discountAmount)} (${discountPercent}% off)`}
          statusLabel={discountPercent > 0 ? `-${discountPercent}% off` : undefined}
          statusTone="success"
          copyText={copyText}
          emptyTitle="Enter item price and rates"
          emptyDescription="Provide original price, discount percentage, and sales tax rate to compute final total."
          errorTitle="Invalid pricing values"
          errorMessage={Object.values(errors)[0] || 'Check price, discount, and tax inputs.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="You Save" value={`-${formatCurrency(discountAmount)}`} accent />
            <ToolMetricTile label="Sale Price (pre-tax)" value={formatCurrency(priceAfterDiscount)} />
          </div>

          <ToolBreakdownList
            items={[
              { label: `You Save (${discountPercent}%)`, value: `-${formatCurrency(discountAmount)}` },
              { label: 'Sale Price (pre-tax)', value: formatCurrency(priceAfterDiscount) },
              { label: `Estimated Tax (${taxPercent}%)`, value: `+${formatCurrency(taxAmount)}` },
              { label: 'Final Price Out the Door', value: formatCurrency(finalPrice), highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
