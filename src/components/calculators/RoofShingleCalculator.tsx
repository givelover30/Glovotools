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
  footprintArea: '1500',
  pitchMultiplier: '1.118',
  wasteFactor: '10'
};

const BUNDLE_COVERAGE_SQ_FT = 33.33; // 3 bundles per square (100 sq ft)

export default function RoofShingleCalculator() {
  const [footprintAreaStr, setFootprintAreaStr] = useState<string>(DEFAULTS.footprintArea);
  const [pitchMultiplierStr, setPitchMultiplierStr] = useState<string>(DEFAULTS.pitchMultiplier);
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const areaId = useId();
  const pitchId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setFootprintAreaStr(DEFAULTS.footprintArea);
    setPitchMultiplierStr(DEFAULTS.pitchMultiplier);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setFootprintAreaStr('');
    setWasteFactorStr('');
  };

  const isEmpty = footprintAreaStr.trim() === '' || wasteFactorStr.trim() === '';

  const footprintArea = Number(footprintAreaStr);
  const pitchMultiplier = Number(pitchMultiplierStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(footprintArea) || footprintArea <= 0) {
      errors.footprintArea = 'Roof footprint area must be greater than 0 sq ft.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let slopedArea = 0;
  let grossArea = 0;
  let totalBundles = 0;
  let totalSquares = 0;
  let underlaymentRolls = 0;

  if (!isEmpty && !hasErrors) {
    slopedArea = footprintArea * pitchMultiplier;
    grossArea = slopedArea * (1 + wasteFactor / 100);
    totalBundles = Math.ceil(grossArea / BUNDLE_COVERAGE_SQ_FT);
    totalSquares = Number((grossArea / 100).toFixed(1));
    underlaymentRolls = Math.ceil(grossArea / 400); // ~400 sq ft per roll
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Roof Shingle Summary — Shingle Bundles: ${totalBundles} bundles (${totalSquares} sq) | Sloped Roof Area: ${Math.round(slopedArea).toLocaleString()} sq ft | Underlayment Rolls: ${underlaymentRolls} rolls`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Roof Footprint, Pitch & Waste"
          subtitle="Estimate architectural shingle bundles, roofing squares, and underlayment rolls."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Roof Footprint Area"
              htmlFor={areaId}
              unit="sq ft"
              error={errors.footprintArea}
            >
              <input
                id={areaId}
                type="number"
                min="0"
                step="any"
                value={footprintAreaStr}
                onChange={(e) => setFootprintAreaStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1500"
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

          <ToolFieldGroup label="Roof Pitch Multiplier" htmlFor={pitchId}>
            <select
              id={pitchId}
              value={pitchMultiplierStr}
              onChange={(e) => setPitchMultiplierStr(e.target.value)}
              className="ui-input"
            >
              <option value="1.054">Low Pitch (4/12)</option>
              <option value="1.118">Standard Pitch (6/12)</option>
              <option value="1.202">Steep Pitch (8/12)</option>
              <option value="1.302">Very Steep Pitch (10/12)</option>
            </select>
          </ToolFieldGroup>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            Standard architectural shingles require 3 bundles per square (100 sq ft). Valleys, hips,
            and starter strips account for cutting waste.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Roof Shingle & Underlayment Summary"
          state={resultState}
          primaryLabel="Shingle Bundles Required"
          primaryValue={`${totalBundles} bundles`}
          primarySubtext={`${totalSquares} roofing squares (${Math.round(grossArea).toLocaleString()} sq ft gross w/ ${wasteFactor}% waste)`}
          statusLabel={`${totalSquares} sq`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter roof footprint"
          emptyDescription="Provide roof footprint area, select roof pitch multiplier, and enter waste allowance to calculate bundles and underlayment."
          errorTitle="Invalid roof shingle inputs"
          errorMessage={Object.values(errors)[0] || 'Check footprint area and waste allowance.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Sloped Roof Area"
              value={`${Math.round(slopedArea).toLocaleString()} sq ft`}
            />
            <ToolMetricTile label="Underlayment Rolls" value={`${underlaymentRolls} rolls`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Sloped Roof Area',
                value: `${Math.round(slopedArea).toLocaleString()} sq ft`
              },
              {
                label: 'Gross Area (with Waste)',
                value: `${Math.round(grossArea).toLocaleString()} sq ft`
              },
              {
                label: 'Shingle Bundles Required',
                value: `${totalBundles} bundles (${totalSquares} sq)`,
                highlight: true
              },
              {
                label: 'Underlayment Rolls (~400 sq ft/roll)',
                value: `${underlaymentRolls} rolls`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
