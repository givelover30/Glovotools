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
  run: '12',
  rise: '6',
  buildingSpan: '24',
  overhang: '1.5'
};

export default function RoofPitchCalculator() {
  const [riseStr, setRiseStr] = useState<string>(DEFAULTS.rise);
  const [runStr, setRunStr] = useState<string>(DEFAULTS.run);
  const [buildingSpanStr, setBuildingSpanStr] = useState<string>(DEFAULTS.buildingSpan);
  const [overhangStr, setOverhangStr] = useState<string>(DEFAULTS.overhang);

  const riseId = useId();
  const runId = useId();
  const spanId = useId();
  const overhangId = useId();

  const handleReset = () => {
    setRiseStr(DEFAULTS.rise);
    setRunStr(DEFAULTS.run);
    setBuildingSpanStr(DEFAULTS.buildingSpan);
    setOverhangStr(DEFAULTS.overhang);
  };

  const handleClear = () => {
    setRiseStr('');
    setRunStr('');
    setBuildingSpanStr('');
    setOverhangStr('');
  };

  const isEmpty =
    riseStr.trim() === '' ||
    runStr.trim() === '' ||
    buildingSpanStr.trim() === '' ||
    overhangStr.trim() === '';

  const rise = Number(riseStr);
  const run = Number(runStr);
  const buildingSpan = Number(buildingSpanStr);
  const overhang = Number(overhangStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(rise) || rise < 0) {
      errors.rise = 'Rise must be 0 inches or greater.';
    }
    if (!Number.isFinite(run) || run <= 0) {
      errors.run = 'Standard run must be greater than 0 inches.';
    }
    if (!Number.isFinite(buildingSpan) || buildingSpan <= 0) {
      errors.buildingSpan = 'Total building span must be greater than 0 feet.';
    }
    if (!Number.isFinite(overhang) || overhang < 0) {
      errors.overhang = 'Roof overhang must be 0 feet or greater.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let pitchAngle = 0;
  let totalRunFt = 0;
  let rafterLengthFt = 0;

  if (!isEmpty && !hasErrors) {
    pitchAngle = Math.atan(rise / run) * (180 / Math.PI);
    const halfSpan = buildingSpan / 2;
    totalRunFt = halfSpan + overhang;
    rafterLengthFt = Math.sqrt(
      Math.pow(totalRunFt, 2) + Math.pow(totalRunFt * (rise / run), 2)
    );
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Roof Pitch Summary — Pitch Ratio: ${rise} / ${run} | Pitch Angle: ${pitchAngle.toFixed(2)}° | Calculated Rafter Length: ${rafterLengthFt.toFixed(2)} ft (Total Run: ${totalRunFt.toFixed(2)} ft)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Roof Pitch & Building Span"
          subtitle="Compute roof slope angle and theoretical rafter length including eave overhang."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={`Rise (per ${runStr || '12'}" Run)`}
              htmlFor={riseId}
              unit="in"
              error={errors.rise}
            >
              <input
                id={riseId}
                type="number"
                min="0"
                step="any"
                value={riseStr}
                onChange={(e) => setRiseStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="6"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Standard Run" htmlFor={runId} unit="in" error={errors.run}>
              <input
                id={runId}
                type="number"
                min="0"
                step="any"
                value={runStr}
                onChange={(e) => setRunStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Total Building Span"
              htmlFor={spanId}
              unit="ft"
              error={errors.buildingSpan}
            >
              <input
                id={spanId}
                type="number"
                min="0"
                step="any"
                value={buildingSpanStr}
                onChange={(e) => setBuildingSpanStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="24"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Roof Overhang"
              htmlFor={overhangId}
              unit="ft"
              error={errors.overhang}
            >
              <input
                id={overhangId}
                type="number"
                min="0"
                step="0.1"
                value={overhangStr}
                onChange={(e) => setOverhangStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1.5"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Construction Note:</strong> Theoretical rafter
            length excludes bird&apos;s mouth cut allowances and ridge board deductions.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Roof Pitch & Rafter Length Summary"
          state={resultState}
          primaryLabel="Calculated Rafter Length"
          primaryValue={`${rafterLengthFt.toFixed(2)} ft`}
          primarySubtext={`Pitch ${rise} / ${run} (${pitchAngle.toFixed(2)}°) across ${totalRunFt.toFixed(2)} ft total run`}
          statusLabel={`${rise} / ${run} Pitch`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter pitch & span"
          emptyDescription="Provide rise, run, total building span, and eave overhang to compute roof pitch angle and rafter length."
          errorTitle="Invalid roof geometry"
          errorMessage={Object.values(errors)[0] || 'Check rise, run, building span, and overhang.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Roof Pitch Ratio" value={`${rise} / ${run}`} />
            <ToolMetricTile label="Roof Pitch Angle" value={`${pitchAngle.toFixed(2)}°`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Roof Pitch Ratio',
                value: `${rise} / ${run}`
              },
              {
                label: 'Roof Pitch Angle',
                value: `${pitchAngle.toFixed(2)}°`
              },
              {
                label: 'Total Horizontal Run (Half-Span + Overhang)',
                value: `${totalRunFt.toFixed(2)} ft`
              },
              {
                label: 'Calculated Rafter Length',
                value: `${rafterLengthFt.toFixed(2)} ft`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
