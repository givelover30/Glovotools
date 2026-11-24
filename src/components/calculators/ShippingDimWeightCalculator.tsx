import { useId, useState } from 'react';
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
  length: '20',
  width: '15',
  height: '10',
  actualWeight: '12',
  divisor: '139'
};

type DivisorPreset = '139' | '166' | '5000';

const DIVISOR_PRESETS: Array<{ value: DivisorPreset; label: string }> = [
  { value: '139', label: '139 (US Domestic)' },
  { value: '166', label: '166 (Retail / Alt)' },
  { value: '5000', label: '5000 (Metric)' }
];

export default function ShippingDimWeightCalculator() {
  const [lengthStr, setLengthStr] = useState<string>(DEFAULTS.length);
  const [widthStr, setWidthStr] = useState<string>(DEFAULTS.width);
  const [heightStr, setHeightStr] = useState<string>(DEFAULTS.height);
  const [actualWeightStr, setActualWeightStr] = useState<string>(DEFAULTS.actualWeight);
  const [divisorStr, setDivisorStr] = useState<DivisorPreset>(DEFAULTS.divisor as DivisorPreset);

  const lenId = useId();
  const widId = useId();
  const hgtId = useId();
  const weightId = useId();
  const divisorId = useId();

  const handleReset = () => {
    setLengthStr(DEFAULTS.length);
    setWidthStr(DEFAULTS.width);
    setHeightStr(DEFAULTS.height);
    setActualWeightStr(DEFAULTS.actualWeight);
    setDivisorStr(DEFAULTS.divisor as DivisorPreset);
  };

  const handleClear = () => {
    setLengthStr('');
    setWidthStr('');
    setHeightStr('');
    setActualWeightStr('');
  };

  const isEmpty =
    lengthStr.trim() === '' ||
    widthStr.trim() === '' ||
    heightStr.trim() === '' ||
    actualWeightStr.trim() === '';

  const length = Number(lengthStr);
  const width = Number(widthStr);
  const height = Number(heightStr);
  const actualWeight = Number(actualWeightStr);
  const divisor = Number(divisorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(length) || length <= 0) {
      errors.length = 'Package length must be greater than 0.';
    }
    if (!Number.isFinite(width) || width <= 0) {
      errors.width = 'Package width must be greater than 0.';
    }
    if (!Number.isFinite(height) || height <= 0) {
      errors.height = 'Package height must be greater than 0.';
    }
    if (!Number.isFinite(actualWeight) || actualWeight < 0) {
      errors.actualWeight = 'Actual physical weight must be 0 or greater.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let volumeCubicInches = 0;
  let dimensionalWeight = 0;
  let billableWeight = 0;
  let billableWeightCeil = 0;

  if (!isEmpty && !hasErrors) {
    volumeCubicInches = length * width * height;
    dimensionalWeight = divisor > 0 ? volumeCubicInches / divisor : 0;
    billableWeight = Math.max(actualWeight, dimensionalWeight);
    billableWeightCeil = Math.ceil(billableWeight);
  }

  const isDimBilled = dimensionalWeight > actualWeight;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Dimensional Weight Summary (Divisor ${divisor}) — Billable Shipping Weight: ${billableWeightCeil} lbs | Dimensional Weight: ${dimensionalWeight.toFixed(2)} lbs | Volumetric Volume: ${volumeCubicInches.toLocaleString()} cu in`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Package Dimensions, Weight & Divisor"
          subtitle="Compare actual scale weight against carrier dimensional weight to determine billable weight."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup label="Length" htmlFor={lenId} unit="in" error={errors.length}>
              <input
                id={lenId}
                type="number"
                min="0"
                step="any"
                value={lengthStr}
                onChange={(e) => setLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="20"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Width" htmlFor={widId} unit="in" error={errors.width}>
              <input
                id={widId}
                type="number"
                min="0"
                step="any"
                value={widthStr}
                onChange={(e) => setWidthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Height" htmlFor={hgtId} unit="in" error={errors.height}>
              <input
                id={hgtId}
                type="number"
                min="0"
                step="any"
                value={heightStr}
                onChange={(e) => setHeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Actual Physical Weight"
              htmlFor={weightId}
              unit="lbs"
              error={errors.actualWeight}
            >
              <input
                id={weightId}
                type="number"
                min="0"
                step="0.1"
                value={actualWeightStr}
                onChange={(e) => setActualWeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Dimensional Divisor" htmlFor={divisorId}>
              <select
                id={divisorId}
                value={divisorStr}
                onChange={(e) => setDivisorStr(e.target.value as DivisorPreset)}
                className="ui-input"
              >
                <option value="139">139 (US Domestic Standard)</option>
                <option value="166">166 (Retail / Alternative)</option>
                <option value="5000">5000 (Metric cm³ / kg)</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-text-secondary">
              Carrier Divisor Presets
            </span>
            <ToolSegmentedControl
              options={DIVISOR_PRESETS}
              value={divisorStr}
              onChange={setDivisorStr}
              ariaLabel="Carrier dimensional weight divisor presets"
            />
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Dimensional Weight Summary"
          state={resultState}
          primaryLabel="Billable Shipping Weight"
          primaryValue={`${billableWeightCeil} lbs`}
          primarySubtext={
            isDimBilled
              ? `Billed by DIM weight (${dimensionalWeight.toFixed(2)} lbs > ${actualWeight} lbs actual)`
              : `Billed by actual weight (${actualWeight} lbs ≥ ${dimensionalWeight.toFixed(2)} lbs DIM)`
          }
          statusLabel={isDimBilled ? 'DIM Weight Billed' : 'Actual Weight Billed'}
          statusTone={isDimBilled ? 'warning' : 'accent'}
          copyText={copyText}
          emptyTitle="Enter package dimensions & weight"
          emptyDescription="Provide box length, width, height, and physical weight to compute dimensional and billable shipping weight."
          errorTitle="Invalid package parameters"
          errorMessage={Object.values(errors)[0] || 'Check package dimensions and actual weight.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Volumetric Volume"
              value={`${volumeCubicInches.toLocaleString()} cu in`}
            />
            <ToolMetricTile
              label="Dimensional Weight"
              value={`${dimensionalWeight.toFixed(2)} lbs`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Volumetric Volume',
                value: `${volumeCubicInches.toLocaleString()} cu in`
              },
              {
                label: 'Active Divisor',
                value: `${divisor}`
              },
              {
                label: 'Dimensional Weight',
                value: `${dimensionalWeight.toFixed(2)} lbs`
              },
              {
                label: 'Actual Physical Weight',
                value: `${actualWeight} lbs`
              },
              {
                label: 'Billable Shipping Weight',
                value: `${billableWeightCeil} lbs`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
