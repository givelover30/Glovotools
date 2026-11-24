import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  curbLength: '100',
  curbHeightInches: '18',
  curbWidthInches: '6',
  gutterWidthInches: '12',
  wasteFactor: '8'
};

export default function ConcreteCurbCalculator() {
  const [curbLengthStr, setCurbLengthStr] = useState<string>(DEFAULTS.curbLength);
  const [curbHeightInchesStr, setCurbHeightInchesStr] = useState<string>(DEFAULTS.curbHeightInches);
  const [curbWidthInchesStr, setCurbWidthInchesStr] = useState<string>(DEFAULTS.curbWidthInches);
  const [gutterWidthInchesStr, setGutterWidthInchesStr] = useState<string>(
    DEFAULTS.gutterWidthInches
  );
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const lengthId = useId();
  const heightId = useId();
  const widthId = useId();
  const gutterId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setCurbLengthStr(DEFAULTS.curbLength);
    setCurbHeightInchesStr(DEFAULTS.curbHeightInches);
    setCurbWidthInchesStr(DEFAULTS.curbWidthInches);
    setGutterWidthInchesStr(DEFAULTS.gutterWidthInches);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setCurbLengthStr('');
    setCurbHeightInchesStr('');
    setCurbWidthInchesStr('');
    setGutterWidthInchesStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    curbLengthStr.trim() === '' ||
    curbHeightInchesStr.trim() === '' ||
    curbWidthInchesStr.trim() === '' ||
    gutterWidthInchesStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const curbLength = Number(curbLengthStr);
  const curbHeightInches = Number(curbHeightInchesStr);
  const curbWidthInches = Number(curbWidthInchesStr);
  const gutterWidthInches = Number(gutterWidthInchesStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(curbLength) || curbLength <= 0) {
      errors.curbLength = 'Total curb length must be greater than 0 feet.';
    }
    if (!Number.isFinite(curbHeightInches) || curbHeightInches <= 0) {
      errors.curbHeightInches = 'Curb height must be greater than 0 inches.';
    }
    if (!Number.isFinite(curbWidthInches) || curbWidthInches <= 0) {
      errors.curbWidthInches = 'Curb width must be greater than 0 inches.';
    }
    if (!Number.isFinite(gutterWidthInches) || gutterWidthInches < 0) {
      errors.gutterWidthInches = 'Gutter pan width must be 0 inches or greater.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalCubicFeet = 0;
  let adjustedCubicFeet = 0;
  let totalCubicYards = 0;
  let bags80lb = 0;

  if (!isEmpty && !hasErrors) {
    // Simplified curb & gutter profile: Curb (width x height) + Gutter (gutter width x 6 in thickness)
    const curbAreaSqIn = curbWidthInches * curbHeightInches + gutterWidthInches * 6;
    const totalCubicInches = curbAreaSqIn * (curbLength * 12);
    totalCubicFeet = totalCubicInches / 1728;
    const totalCubicYardsRaw = totalCubicFeet / 27;
    totalCubicYards = Number((totalCubicYardsRaw * (1 + wasteFactor / 100)).toFixed(2));
    adjustedCubicFeet = totalCubicFeet * (1 + wasteFactor / 100);
    bags80lb = Math.ceil(totalCubicFeet * 1.5 * (1 + wasteFactor / 100)); // ~0.6 cu ft per 80lb bag
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Concrete Curb & Gutter Summary — Volume: ${totalCubicYards} cu yards | Cubic Feet: ${adjustedCubicFeet.toFixed(1)} cu ft | 80 lb Premix Bags: ${bags80lb} bags`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Curb & Gutter Profile Dimensions"
          subtitle="Specify total run length, curb section height/width, gutter pan width, and waste factor."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Total Curb Length"
              htmlFor={lengthId}
              unit="ft"
              error={errors.curbLength}
            >
              <input
                id={lengthId}
                type="number"
                min="0"
                step="any"
                value={curbLengthStr}
                onChange={(e) => setCurbLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="100"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Curb Height"
              htmlFor={heightId}
              unit="in"
              error={errors.curbHeightInches}
            >
              <input
                id={heightId}
                type="number"
                min="0"
                step="any"
                value={curbHeightInchesStr}
                onChange={(e) => setCurbHeightInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="18"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Curb Width"
              htmlFor={widthId}
              unit="in"
              error={errors.curbWidthInches}
            >
              <input
                id={widthId}
                type="number"
                min="0"
                step="any"
                value={curbWidthInchesStr}
                onChange={(e) => setCurbWidthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="6"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Gutter Pan Width"
              htmlFor={gutterId}
              unit="in"
              error={errors.gutterWidthInches}
            >
              <input
                id={gutterId}
                type="number"
                min="0"
                step="any"
                value={gutterWidthInchesStr}
                onChange={(e) => setGutterWidthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Waste Allowance"
              htmlFor={wasteId}
              unit="%"
              error={errors.wasteFactor}
            >
              <input
                id={wasteId}
                type="number"
                min="0"
                step="any"
                value={wasteFactorStr}
                onChange={(e) => setWasteFactorStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Concrete Curb & Gutter Summary"
          state={resultState}
          primaryLabel="Total Concrete Volume"
          primaryValue={`${totalCubicYards} cu yards`}
          primarySubtext={`Includes ${wasteFactor}% waste allowance across ${curbLength} ft curb run`}
          statusLabel={`${bags80lb} Bags (80 lb)`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter curb dimensions"
          emptyDescription="Provide curb length, height, width, gutter pan width, and waste percentage to calculate ready-mix volume."
          errorTitle="Invalid curb dimensions"
          errorMessage={Object.values(errors)[0] || 'Check curb dimensions and waste allowance.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Cubic Feet" value={`${adjustedCubicFeet.toFixed(1)} cu ft`} />
            <ToolMetricTile label="80 lb Premix Bags" value={`${bags80lb} bags`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Concrete Volume',
                value: `${totalCubicYards} cu yards`,
                highlight: true
              },
              {
                label: 'Adjusted Cubic Feet',
                value: `${adjustedCubicFeet.toFixed(1)} cu ft`
              },
              {
                label: '80 lb Premix Bags',
                value: `${bags80lb} bags`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
