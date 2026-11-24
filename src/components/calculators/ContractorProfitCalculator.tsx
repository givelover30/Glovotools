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
  materialCost: '4500',
  laborCost: '3500',
  equipmentCost: '800',
  markupPercent: '25'
};

export default function ContractorProfitCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [materialCostStr, setMaterialCostStr] = useState<string>(DEFAULTS.materialCost);
  const [laborCostStr, setLaborCostStr] = useState<string>(DEFAULTS.laborCost);
  const [equipmentCostStr, setEquipmentCostStr] = useState<string>(DEFAULTS.equipmentCost);
  const [markupPercentStr, setMarkupPercentStr] = useState<string>(DEFAULTS.markupPercent);

  const materialId = useId();
  const laborId = useId();
  const equipmentId = useId();
  const markupId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setMaterialCostStr(DEFAULTS.materialCost);
    setLaborCostStr(DEFAULTS.laborCost);
    setEquipmentCostStr(DEFAULTS.equipmentCost);
    setMarkupPercentStr(DEFAULTS.markupPercent);
  };

  const handleClear = () => {
    setMaterialCostStr('');
    setLaborCostStr('');
    setEquipmentCostStr('');
    setMarkupPercentStr('');
  };

  const isEmpty =
    materialCostStr.trim() === '' ||
    laborCostStr.trim() === '' ||
    equipmentCostStr.trim() === '' ||
    markupPercentStr.trim() === '';

  const materialCost = Number(materialCostStr);
  const laborCost = Number(laborCostStr);
  const equipmentCost = Number(equipmentCostStr);
  const markupPercent = Number(markupPercentStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(materialCost) || materialCost < 0) {
      errors.materialCost = `Material costs must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(laborCost) || laborCost < 0) {
      errors.laborCost = `Labor costs must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(equipmentCost) || equipmentCost < 0) {
      errors.equipmentCost = `Equipment and subcontractor costs must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(markupPercent) || markupPercent < 0) {
      errors.markupPercent = 'Desired markup percentage must be 0% or greater.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalCost = 0;
  let grossProfit = 0;
  let sellingPrice = 0;
  let grossMarginPercent = 0;

  if (!isEmpty && !hasErrors) {
    totalCost = materialCost + laborCost + equipmentCost;
    const markupMultiplier = markupPercent / 100;
    grossProfit = totalCost * markupMultiplier;
    sellingPrice = totalCost + grossProfit;
    grossMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Contractor Pricing Summary — Selling Price: ${formatWhole(sellingPrice)} | Total Cost: ${formatWhole(totalCost)} | Gross Profit: ${formatWhole(grossProfit)} | Gross Margin: ${grossMarginPercent.toFixed(2)}% (${markupPercent}% markup)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Direct Project Costs & Markup"
          subtitle="Enter material, labor, and equipment costs along with your target markup percentage."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Material Costs"
              htmlFor={materialId}
              unit={currencyMeta.symbol}
              error={errors.materialCost}
            >
              <input
                id={materialId}
                type="number"
                min="0"
                step="any"
                value={materialCostStr}
                onChange={(e) => setMaterialCostStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4500"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Labor Costs"
              htmlFor={laborId}
              unit={currencyMeta.symbol}
              error={errors.laborCost}
            >
              <input
                id={laborId}
                type="number"
                min="0"
                step="any"
                value={laborCostStr}
                onChange={(e) => setLaborCostStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3500"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Equipment & Subcontractor Costs"
              htmlFor={equipmentId}
              unit={currencyMeta.symbol}
              error={errors.equipmentCost}
            >
              <input
                id={equipmentId}
                type="number"
                min="0"
                step="any"
                value={equipmentCostStr}
                onChange={(e) => setEquipmentCostStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="800"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Desired Markup Percentage"
              htmlFor={markupId}
              unit="%"
              error={errors.markupPercent}
            >
              <input
                id={markupId}
                type="number"
                min="0"
                step="0.1"
                value={markupPercentStr}
                onChange={(e) => setMarkupPercentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Margin vs Markup:</strong> Markup is added to cost
            to reach price (Cost × (1 + Markup)), whereas Gross Margin is profit divided by selling
            price.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Contractor Pricing & Profit Summary"
          state={resultState}
          primaryLabel="Total Selling Price"
          primaryValue={formatWhole(sellingPrice)}
          primarySubtext={`${markupPercent}% markup yields ${grossMarginPercent.toFixed(2)}% gross margin`}
          statusLabel={`${grossMarginPercent.toFixed(2)}% Margin`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter project costs"
          emptyDescription="Provide material, labor, equipment costs, and desired markup percentage to calculate bid price and profit margin."
          errorTitle="Invalid project pricing inputs"
          errorMessage={Object.values(errors)[0] || 'Check project costs and markup percentage.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Project Cost"
              value={formatWhole(totalCost)}
            />
            <ToolMetricTile
              label="Gross Profit"
              value={formatWhole(grossProfit)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Project Cost',
                value: formatWhole(totalCost)
              },
              {
                label: 'Gross Profit',
                value: formatWhole(grossProfit)
              },
              {
                label: 'Gross Margin %',
                value: `${grossMarginPercent.toFixed(2)}%`
              },
              {
                label: 'Total Selling Price',
                value: formatWhole(sellingPrice),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
