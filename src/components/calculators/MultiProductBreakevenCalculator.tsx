import { useId, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

interface ProductRow {
  id: number;
  name: string;
  priceStr: string;
  vcStr: string;
  mixStr: string;
}

const MIN_ROWS = 1;
const MAX_ROWS = 10;
const DEFAULT_FIXED_COSTS = '10000';

function createDefaultRows(): ProductRow[] {
  return [
    { id: 1, name: 'Product A', priceStr: '50', vcStr: '20', mixStr: '65' },
    { id: 2, name: 'Product B', priceStr: '100', vcStr: '40', mixStr: '35' }
  ];
}

export default function MultiProductBreakevenCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [fixedCostsStr, setFixedCostsStr] = useState<string>(DEFAULT_FIXED_COSTS);
  const [rows, setRows] = useState<ProductRow[]>(createDefaultRows);
  const [nextRowId, setNextRowId] = useState<number>(3);

  const fixedId = useId();
  const baseRowId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setFixedCostsStr(DEFAULT_FIXED_COSTS);
    setRows(createDefaultRows());
    setNextRowId(3);
  };

  const handleClear = () => {
    setFixedCostsStr('');
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        priceStr: '',
        vcStr: '',
        mixStr: ''
      }))
    );
  };

  const handleAddProduct = () => {
    if (rows.length >= MAX_ROWS) return;
    const letter = String.fromCharCode(65 + rows.length);
    setRows((prev) => [
      ...prev,
      {
        id: nextRowId,
        name: `Product ${letter}`,
        priceStr: '75',
        vcStr: '30',
        mixStr: '20'
      }
    ]);
    setNextRowId((n) => n + 1);
  };

  const handleRemoveProduct = (id: number) => {
    if (rows.length <= MIN_ROWS) return;
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleRowChange = (id: number, field: keyof Omit<ProductRow, 'id'>, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const isEmpty =
    fixedCostsStr.trim() === '' ||
    rows.some(
      (row) => row.priceStr.trim() === '' || row.vcStr.trim() === '' || row.mixStr.trim() === ''
    );

  const fixedCosts = Number(fixedCostsStr);
  const errors: Record<string, string> = {};
  const rowErrors: Record<number, string> = {};

  if (!isEmpty) {
    if (!Number.isFinite(fixedCosts) || fixedCosts < 0) {
      errors.fixedCosts = `Monthly fixed costs must be ${formatWhole(0)} or greater.`;
    }

    let mixSumCheck = 0;
    for (const row of rows) {
      const price = Number(row.priceStr);
      const vc = Number(row.vcStr);
      const mix = Number(row.mixStr);

      if (!Number.isFinite(price) || price < 0) {
        rowErrors[row.id] = `${row.name || 'Product'}: Price must be ${formatWhole(0)} or greater.`;
      } else if (!Number.isFinite(vc) || vc < 0) {
        rowErrors[row.id] = `${row.name || 'Product'}: Variable cost must be ${formatWhole(0)} or greater.`;
      } else if (!Number.isFinite(mix) || mix < 0) {
        rowErrors[row.id] = `${row.name || 'Product'}: Sales mix must be 0% or greater.`;
      } else {
        mixSumCheck += mix;
      }
    }

    if (Object.keys(rowErrors).length === 0 && mixSumCheck <= 0) {
      errors.mix = 'Combined sales mix across products must be greater than 0%.';
    }
  }

  let totalMix = 0;
  let weightedCm = 0;
  let weightedPrice = 0;
  let weightedVc = 0;
  let weightedCmRatio = 0;
  let breakEvenRevenue = 0;
  let breakEvenUnits = 0;

  const computedRows: Array<{
    id: number;
    name: string;
    cm: number;
    weight: number;
    beUnits: number;
  }> = [];

  const hasInitialErrors = Object.keys(errors).length > 0 || Object.keys(rowErrors).length > 0;

  if (!isEmpty && !hasInitialErrors) {
    const parsed = rows.map((row) => ({
      id: row.id,
      name: row.name.trim() || 'Unnamed Product',
      price: Number(row.priceStr),
      vc: Number(row.vcStr),
      mix: Number(row.mixStr)
    }));

    totalMix = parsed.reduce((acc, p) => acc + p.mix, 0) || 100;

    for (const p of parsed) {
      const weight = p.mix / totalMix;
      const cm = p.price - p.vc;
      weightedCm += cm * weight;
      weightedPrice += p.price * weight;
      weightedVc += p.vc * weight;
    }

    weightedCmRatio = weightedPrice > 0 ? weightedCm / weightedPrice : 0;
    breakEvenRevenue = weightedCmRatio > 0 ? fixedCosts / weightedCmRatio : 0;
    breakEvenUnits = weightedCm > 0 ? fixedCosts / weightedCm : 0;

    if (fixedCosts > 0 && weightedCm <= 0) {
      errors.cm =
        `Weighted contribution margin must be greater than ${formatCurrency(0)}/unit to reach break-even.`;
    } else {
      for (const p of parsed) {
        const weight = p.mix / totalMix;
        computedRows.push({
          id: p.id,
          name: p.name,
          cm: p.price - p.vc,
          weight,
          beUnits: Math.ceil(breakEvenUnits * weight)
        });
      }
    }
  }

  const allErrors = [...Object.values(errors), ...Object.values(rowErrors)];
  const hasErrors = allErrors.length > 0;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = `Multi-Product Break-Even Summary (${rows.length} products) — Weighted Average CM: ${formatCurrency(weightedCm)}/unit | Break-Even Revenue: ${formatWhole(breakEvenRevenue)}/mo | Break-Even Total Units: ${Math.ceil(breakEvenUnits).toLocaleString()} units`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Fixed Costs & Product Sales Mix"
          subtitle="Add, edit, or remove products to calculate weighted contribution margin and multi-product break-even."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup
            label="Monthly Fixed Costs"
            htmlFor={fixedId}
            unit={`${currencyMeta.symbol}/mo`}
            error={errors.fixedCosts}
          >
            <input
              id={fixedId}
              type="number"
              min="0"
              step="any"
              value={fixedCostsStr}
              onChange={(e) => setFixedCostsStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="10000"
            />
          </ToolFieldGroup>

          <div className="pt-2 border-t border-border-subtle space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  Product Mix ({rows.length} / {MAX_ROWS})
                </p>
                <p className="text-[11px] text-text-tertiary">
                  Weights are automatically normalized across active products (min {MIN_ROWS}, max{' '}
                  {MAX_ROWS}).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={rows.length >= MAX_ROWS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {errors.mix && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {errors.mix}
              </p>
            )}
            {errors.cm && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {errors.cm}
              </p>
            )}

            <div className="space-y-3">
              {rows.map((row, idx) => {
                const nameId = `${baseRowId}-name-${row.id}`;
                const priceId = `${baseRowId}-price-${row.id}`;
                const vcId = `${baseRowId}-vc-${row.id}`;
                const mixId = `${baseRowId}-mix-${row.id}`;

                return (
                  <div
                    key={row.id}
                    data-product-row={row.id}
                    className="rounded-xl border border-border-subtle bg-surface-secondary/40 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <label htmlFor={nameId} className="sr-only">
                          Product {idx + 1} Name
                        </label>
                        <input
                          id={nameId}
                          type="text"
                          value={row.name}
                          onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-text-primary border-b border-transparent focus:border-accent focus:outline-none py-0.5"
                          placeholder={`Product ${idx + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(row.id)}
                        disabled={rows.length <= MIN_ROWS}
                        aria-label={`Remove ${row.name || `Product ${idx + 1}`}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-surface-hover disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <ToolFieldGroup label="Price" htmlFor={priceId} unit={currencyMeta.symbol}>
                        <input
                          id={priceId}
                          type="number"
                          min="0"
                          step="any"
                          value={row.priceStr}
                          onChange={(e) => handleRowChange(row.id, 'priceStr', e.target.value)}
                          className="ui-input font-mono tabular-nums"
                          placeholder="50"
                        />
                      </ToolFieldGroup>

                      <ToolFieldGroup label="Variable Cost" htmlFor={vcId} unit={currencyMeta.symbol}>
                        <input
                          id={vcId}
                          type="number"
                          min="0"
                          step="any"
                          value={row.vcStr}
                          onChange={(e) => handleRowChange(row.id, 'vcStr', e.target.value)}
                          className="ui-input font-mono tabular-nums"
                          placeholder="20"
                        />
                      </ToolFieldGroup>

                      <ToolFieldGroup label="Sales Mix" htmlFor={mixId} unit="%">
                        <input
                          id={mixId}
                          type="number"
                          min="0"
                          step="any"
                          value={row.mixStr}
                          onChange={(e) => handleRowChange(row.id, 'mixStr', e.target.value)}
                          className="ui-input font-mono tabular-nums"
                          placeholder="50"
                        />
                      </ToolFieldGroup>
                    </div>

                    {rowErrors[row.id] && (
                      <p
                        role="alert"
                        className="text-xs font-medium text-red-600 dark:text-red-400"
                      >
                        {rowErrors[row.id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Multi-Product Break-Even Summary"
          state={resultState}
          primaryLabel="Break-Even Revenue"
          primaryValue={`${formatWhole(breakEvenRevenue)} /mo`}
          primarySubtext={`${Math.ceil(breakEvenUnits).toLocaleString()} total units at ${formatCurrency(weightedCm)}/unit weighted CM`}
          statusLabel={`${(weightedCmRatio * 100).toFixed(1)}% CM Ratio`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter fixed costs & product mix"
          emptyDescription="Fill in monthly fixed costs plus price, variable cost, and sales mix for each product row."
          errorTitle="Invalid break-even inputs"
          errorMessage={allErrors[0] || 'Check fixed costs and product row values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Weighted Average CM"
              value={`${formatCurrency(weightedCm)} /unit`}
            />
            <ToolMetricTile
              label="Break-Even Total Units"
              value={`${Math.ceil(breakEvenUnits).toLocaleString()} units`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Weighted Average Price',
                value: `${formatCurrency(weightedPrice)} /unit`
              },
              {
                label: 'Weighted Variable Cost',
                value: `${formatCurrency(weightedVc)} /unit`
              },
              {
                label: 'Weighted Average CM',
                value: `${formatCurrency(weightedCm)} /unit`
              },
              {
                label: 'Break-Even Revenue',
                value: `${formatWhole(breakEvenRevenue)} /mo`,
                highlight: true
              },
              {
                label: 'Break-Even Total Units',
                value: `${Math.ceil(breakEvenUnits).toLocaleString()} units`
              },
              ...computedRows.map((p) => ({
                label: `${p.name} (${(p.weight * 100).toFixed(1)}% share · CM ${formatCurrency(p.cm)})`,
                value: `${p.beUnits.toLocaleString()} units`
              }))
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
