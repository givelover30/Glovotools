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
  areaLength: '50',
  areaWidth: '20',
  thicknessInches: '3',
  densityLbsPerCuFt: '145',
  wasteFactor: '10'
};

export default function AsphaltPavingCalculator() {
  const [areaLengthStr, setAreaLengthStr] = useState<string>(DEFAULTS.areaLength);
  const [areaWidthStr, setAreaWidthStr] = useState<string>(DEFAULTS.areaWidth);
  const [thicknessInchesStr, setThicknessInchesStr] = useState<string>(DEFAULTS.thicknessInches);
  const [densityLbsPerCuFtStr, setDensityLbsPerCuFtStr] = useState<string>(
    DEFAULTS.densityLbsPerCuFt
  );
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const lengthId = useId();
  const widthId = useId();
  const thicknessId = useId();
  const densityId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setAreaLengthStr(DEFAULTS.areaLength);
    setAreaWidthStr(DEFAULTS.areaWidth);
    setThicknessInchesStr(DEFAULTS.thicknessInches);
    setDensityLbsPerCuFtStr(DEFAULTS.densityLbsPerCuFt);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setAreaLengthStr('');
    setAreaWidthStr('');
    setThicknessInchesStr('');
    setDensityLbsPerCuFtStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    areaLengthStr.trim() === '' ||
    areaWidthStr.trim() === '' ||
    thicknessInchesStr.trim() === '' ||
    densityLbsPerCuFtStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const areaLength = Number(areaLengthStr);
  const areaWidth = Number(areaWidthStr);
  const thicknessInches = Number(thicknessInchesStr);
  const densityLbsPerCuFt = Number(densityLbsPerCuFtStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(areaLength) || areaLength <= 0) {
      errors.areaLength = 'Length must be greater than 0 feet.';
    }
    if (!Number.isFinite(areaWidth) || areaWidth <= 0) {
      errors.areaWidth = 'Width must be greater than 0 feet.';
    }
    if (!Number.isFinite(thicknessInches) || thicknessInches <= 0) {
      errors.thicknessInches = 'Thickness must be greater than 0 inches.';
    }
    if (!Number.isFinite(densityLbsPerCuFt) || densityLbsPerCuFt <= 0) {
      errors.densityLbsPerCuFt = 'Asphalt density must be greater than 0 lbs/cu.ft.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let squareFeet = 0;
  let cubicFeet = 0;
  let totalLbs = 0;
  let adjustedLbs = 0;
  let tons = 0;

  if (!isEmpty && !hasErrors) {
    squareFeet = areaLength * areaWidth;
    const thicknessFeet = thicknessInches / 12;
    cubicFeet = squareFeet * thicknessFeet;
    totalLbs = cubicFeet * densityLbsPerCuFt;
    adjustedLbs = totalLbs * (1 + wasteFactor / 100);
    tons = adjustedLbs / 2000;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Asphalt Paving Summary — Estimated Tonnage: ${tons.toFixed(2)} tons | Surface Area: ${squareFeet.toLocaleString()} sq.ft | Volume: ${cubicFeet.toFixed(1)} cu.ft (${wasteFactor}% waste @ ${densityLbsPerCuFt} lbs/cu.ft)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Paving Area, Density & Waste"
          subtitle="Enter surface dimensions, compacted depth, asphalt mix density, and waste allowance."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Length" htmlFor={lengthId} unit="ft" error={errors.areaLength}>
              <input
                id={lengthId}
                type="number"
                min="0"
                step="any"
                value={areaLengthStr}
                onChange={(e) => setAreaLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Width" htmlFor={widthId} unit="ft" error={errors.areaWidth}>
              <input
                id={widthId}
                type="number"
                min="0"
                step="any"
                value={areaWidthStr}
                onChange={(e) => setAreaWidthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="20"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Thickness"
              htmlFor={thicknessId}
              unit="in"
              error={errors.thicknessInches}
            >
              <input
                id={thicknessId}
                type="number"
                min="0"
                step="0.5"
                value={thicknessInchesStr}
                onChange={(e) => setThicknessInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Asphalt Density"
              htmlFor={densityId}
              unit="lbs/ft³"
              error={errors.densityLbsPerCuFt}
            >
              <input
                id={densityId}
                type="number"
                min="0"
                step="any"
                value={densityLbsPerCuFtStr}
                onChange={(e) => setDensityLbsPerCuFtStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="145"
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
                placeholder="10"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Construction Note:</strong> Standard hot mix
            asphalt density is approximately 145 lbs per cubic foot (approx. 2.32 tons per cubic
            yard).
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Asphalt Paving & Tonnage Summary"
          state={resultState}
          primaryLabel="Estimated Asphalt Tonnage"
          primaryValue={`${tons.toFixed(2)} tons`}
          primarySubtext={`Includes ${wasteFactor}% waste allowance (${Math.round(adjustedLbs).toLocaleString()} lbs total)`}
          statusLabel={`${thicknessInches}" Compacted`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter paving dimensions"
          emptyDescription="Provide length, width, compacted thickness, mix density, and waste percentage to estimate asphalt tonnage."
          errorTitle="Invalid paving inputs"
          errorMessage={Object.values(errors)[0] || 'Check paving dimensions, density, and waste.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Surface Area"
              value={`${squareFeet.toLocaleString()} sq.ft`}
            />
            <ToolMetricTile label="Total Volume" value={`${cubicFeet.toFixed(1)} cu.ft`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Surface Area',
                value: `${squareFeet.toLocaleString()} sq.ft`
              },
              {
                label: 'Total Volume',
                value: `${cubicFeet.toFixed(1)} cu.ft`
              },
              {
                label: 'Raw Asphalt Weight',
                value: `${Math.round(totalLbs).toLocaleString()} lbs`
              },
              {
                label: 'Estimated Asphalt Tonnage',
                value: `${tons.toFixed(2)} tons`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
