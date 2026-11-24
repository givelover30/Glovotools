import { useEffect, useId, useState } from 'react';
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

export type BizTool = 'breakeven' | 'margin';

interface BusinessCalculatorProps {
  initialTool?: BizTool;
}

const DEFAULTS = {
  fixedCosts: '15000',
  unitPrice: '50',
  unitVariableCost: '20',
  cost: '40',
  revenue: '100'
};

export default function BusinessCalculator({ initialTool = 'breakeven' }: BusinessCalculatorProps) {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [tool, setTool] = useState<BizTool>(initialTool);

  useEffect(() => {
    setTool(initialTool);
  }, [initialTool]);

  const fmtAuto = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  // Break-even inputs
  const [fixedCostsStr, setFixedCostsStr] = useState<string>(DEFAULTS.fixedCosts);
  const [unitPriceStr, setUnitPriceStr] = useState<string>(DEFAULTS.unitPrice);
  const [unitVarCostStr, setUnitVarCostStr] = useState<string>(DEFAULTS.unitVariableCost);

  // Margin & Markup inputs
  const [costStr, setCostStr] = useState<string>(DEFAULTS.cost);
  const [revenueStr, setRevenueStr] = useState<string>(DEFAULTS.revenue);

  const fixedId = useId();
  const priceId = useId();
  const varCostId = useId();
  const costId = useId();
  const revenueId = useId();

  const handleReset = () => {
    if (tool === 'breakeven') {
      setFixedCostsStr(DEFAULTS.fixedCosts);
      setUnitPriceStr(DEFAULTS.unitPrice);
      setUnitVarCostStr(DEFAULTS.unitVariableCost);
    } else {
      setCostStr(DEFAULTS.cost);
      setRevenueStr(DEFAULTS.revenue);
    }
  };

  const handleClear = () => {
    if (tool === 'breakeven') {
      setFixedCostsStr('');
      setUnitPriceStr('');
      setUnitVarCostStr('');
    } else {
      setCostStr('');
      setRevenueStr('');
    }
  };

  const modeTabs = (
    <ToolSegmentedControl
      ariaLabel="Business calculation mode"
      value={tool}
      onChange={setTool}
      options={[
        { value: 'breakeven', label: 'Break-Even Analysis' },
        { value: 'margin', label: 'Profit Margin & Markup %' }
      ]}
    />
  );

  if (tool === 'breakeven') {
    const isEmpty =
      fixedCostsStr.trim() === '' || unitPriceStr.trim() === '' || unitVarCostStr.trim() === '';
    const fixedCosts = Number(fixedCostsStr);
    const unitPrice = Number(unitPriceStr);
    const unitVariableCost = Number(unitVarCostStr);

    const errors: Record<string, string> = {};
    if (!isEmpty) {
      if (!Number.isFinite(fixedCosts) || fixedCosts < 0) {
        errors.fixed = 'Fixed costs must be 0 or greater.';
      }
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        errors.price = 'Sale price per unit must be greater than 0.';
      }
      if (!Number.isFinite(unitVariableCost) || unitVariableCost < 0) {
        errors.varCost = 'Variable cost per unit must be 0 or greater.';
      } else if (!errors.price && unitVariableCost >= unitPrice) {
        errors.varCost = 'Variable cost must be lower than sale price to achieve break-even.';
      }
    }

    const hasErrors = Object.keys(errors).length > 0;
    const contributionMarginPerUnit = !isEmpty && !hasErrors ? unitPrice - unitVariableCost : 0;
    const breakEvenUnits =
      !isEmpty && !hasErrors && contributionMarginPerUnit > 0
        ? Math.ceil(fixedCosts / contributionMarginPerUnit)
        : 0;
    const breakEvenRevenue = breakEvenUnits * unitPrice;
    const contributionMarginRatio =
      !isEmpty && !hasErrors && unitPrice > 0 ? (contributionMarginPerUnit / unitPrice) * 100 : 0;

    const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
    const copyText = `Break-Even Sales Required: ${breakEvenUnits.toLocaleString()} units (${fmtAuto(breakEvenRevenue)} gross revenue) | Unit Contribution Margin: ${formatCurrency(contributionMarginPerUnit)} (${contributionMarginRatio.toFixed(1)}%)`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Costs & Pricing"
            subtitle="Determine the minimum sales volume and revenue needed to cover fixed and variable costs."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <ToolFieldGroup label="Total Fixed Costs" htmlFor={fixedId} unit={`${currencyMeta.symbol} / month`} error={errors.fixed}>
              <input
                id={fixedId}
                type="number"
                min="0"
                step="any"
                value={fixedCostsStr}
                onChange={(e) => setFixedCostsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15000"
              />
            </ToolFieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Sale Price per Unit" htmlFor={priceId} unit={currencyMeta.symbol} error={errors.price}>
                <input
                  id={priceId}
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPriceStr}
                  onChange={(e) => setUnitPriceStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="50"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Variable Cost per Unit" htmlFor={varCostId} unit={currencyMeta.symbol} error={errors.varCost}>
                <input
                  id={varCostId}
                  type="number"
                  min="0"
                  step="any"
                  value={unitVarCostStr}
                  onChange={(e) => setUnitVarCostStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="20"
                />
              </ToolFieldGroup>
            </div>

            <p className="text-xs font-mono text-text-tertiary">
              Break-Even Formula: Fixed Costs / (Price - Variable Cost)
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Break-Even Analysis"
            state={resultState}
            primaryLabel="Break-Even Sales Required"
            primaryValue={breakEvenUnits.toLocaleString()}
            primaryUnit="units"
            primarySubtext={`Equal to ${fmtAuto(breakEvenRevenue)} in gross revenue to break even`}
            copyText={copyText}
            emptyTitle="Enter cost and pricing details"
            emptyDescription="Fill in fixed costs, unit sale price, and unit variable cost to calculate break-even volume."
            errorTitle="Cannot reach break-even"
            errorMessage={Object.values(errors)[0] || 'Sale price must exceed variable cost.'}
          >
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile label="Break-Even Revenue" value={fmtAuto(breakEvenRevenue)} accent />
              <ToolMetricTile label="Contribution Margin" value={formatCurrency(contributionMarginPerUnit)} />
            </div>

            <ToolBreakdownList
              items={[
                { label: 'Unit Contribution Margin', value: formatCurrency(contributionMarginPerUnit) },
                { label: 'Contribution Margin Ratio', value: `${contributionMarginRatio.toFixed(1)}%`, highlight: true }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Profit Margin & Markup %
  const isEmpty = costStr.trim() === '' || revenueStr.trim() === '';
  const cost = Number(costStr);
  const revenue = Number(revenueStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(cost) || cost < 0) errors.cost = 'Item cost must be 0 or greater.';
    if (!Number.isFinite(revenue) || revenue <= 0) errors.revenue = 'Selling revenue must be greater than 0.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  const grossProfit = !isEmpty && !hasErrors ? revenue - cost : 0;
  const profitMarginPercent = !isEmpty && !hasErrors && revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const markupPercent = !isEmpty && !hasErrors && cost > 0 ? (grossProfit / cost) * 100 : 0;

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Profit Margin: ${profitMarginPercent.toFixed(1)}% | Markup: ${markupPercent.toFixed(1)}% | Gross Profit: ${formatCurrency(grossProfit)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Cost & Revenue"
          subtitle="Calculate gross profit margin, markup percentage, and monetary profit."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{modeTabs}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Item Cost" htmlFor={costId} unit={currencyMeta.symbol} error={errors.cost}>
              <input
                id={costId}
                type="number"
                min="0"
                step="any"
                value={costStr}
                onChange={(e) => setCostStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="40"
              />
            </ToolFieldGroup>
            <ToolFieldGroup label="Selling Revenue" htmlFor={revenueId} unit={currencyMeta.symbol} error={errors.revenue}>
              <input
                id={revenueId}
                type="number"
                min="0"
                step="any"
                value={revenueStr}
                onChange={(e) => setRevenueStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="100"
              />
            </ToolFieldGroup>
          </div>

          <p className="text-xs font-mono text-text-tertiary">
            Profit Margin = ((Revenue - Cost) / Revenue) × 100, Markup = ((Revenue - Cost) / Cost) × 100
          </p>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Margin & Markup Summary"
          state={resultState}
          primaryLabel="Profit Margin"
          primaryValue={`${profitMarginPercent.toFixed(1)}%`}
          primarySubtext={`Gross Profit: ${formatCurrency(grossProfit)}`}
          statusLabel={grossProfit >= 0 ? 'Profitable' : 'Loss'}
          statusTone={grossProfit >= 0 ? 'success' : 'error'}
          copyText={copyText}
          emptyTitle="Enter cost and selling revenue"
          emptyDescription="Provide item cost and selling price to compute margin and markup percentages."
          errorTitle="Invalid pricing inputs"
          errorMessage={Object.values(errors)[0] || 'Check cost and revenue values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Profit Margin" value={`${profitMarginPercent.toFixed(1)}%`} accent />
            <ToolMetricTile label="Markup %" value={`${markupPercent.toFixed(1)}%`} />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Gross Profit', value: formatCurrency(grossProfit), highlight: true },
              { label: 'Item Cost', value: formatCurrency(cost) },
              { label: 'Selling Revenue', value: formatCurrency(revenue) }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
