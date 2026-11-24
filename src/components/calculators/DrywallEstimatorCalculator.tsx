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
  wallLength: '40',
  wallHeight: '8',
  sheetWidth: '4',
  sheetLength: '8',
  wasteFactor: '10'
};

export default function DrywallEstimatorCalculator() {
  const [wallLengthStr, setWallLengthStr] = useState<string>(DEFAULTS.wallLength);
  const [wallHeightStr, setWallHeightStr] = useState<string>(DEFAULTS.wallHeight);
  const [sheetWidthStr, setSheetWidthStr] = useState<string>(DEFAULTS.sheetWidth);
  const [sheetLengthStr, setSheetLengthStr] = useState<string>(DEFAULTS.sheetLength);
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const wallLenId = useId();
  const wallHgtId = useId();
  const sheetWidId = useId();
  const sheetLenId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setWallLengthStr(DEFAULTS.wallLength);
    setWallHeightStr(DEFAULTS.wallHeight);
    setSheetWidthStr(DEFAULTS.sheetWidth);
    setSheetLengthStr(DEFAULTS.sheetLength);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setWallLengthStr('');
    setWallHeightStr('');
    setSheetWidthStr('');
    setSheetLengthStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    wallLengthStr.trim() === '' ||
    wallHeightStr.trim() === '' ||
    sheetWidthStr.trim() === '' ||
    sheetLengthStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const wallLength = Number(wallLengthStr);
  const wallHeight = Number(wallHeightStr);
  const sheetWidth = Number(sheetWidthStr);
  const sheetLength = Number(sheetLengthStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(wallLength) || wallLength <= 0) {
      errors.wallLength = 'Total wall length must be greater than 0 feet.';
    }
    if (!Number.isFinite(wallHeight) || wallHeight <= 0) {
      errors.wallHeight = 'Wall height must be greater than 0 feet.';
    }
    if (!Number.isFinite(sheetWidth) || sheetWidth <= 0) {
      errors.sheetWidth = 'Sheet width must be greater than 0 feet.';
    }
    if (!Number.isFinite(sheetLength) || sheetLength <= 0) {
      errors.sheetLength = 'Sheet length must be greater than 0 feet.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalArea = 0;
  let totalSheets = 0;
  let estimatedJointCompoundKg = 0;
  let estimatedTapeFeet = 0;

  if (!isEmpty && !hasErrors) {
    totalArea = wallLength * wallHeight;
    const sheetArea = sheetWidth * sheetLength;
    const rawSheets = totalArea / sheetArea;
    totalSheets = Math.ceil(rawSheets * (1 + wasteFactor / 100));
    estimatedJointCompoundKg = Math.ceil(totalArea * 0.35 * (1 + wasteFactor / 100));
    estimatedTapeFeet = Math.ceil(wallLength * 2.5 * (1 + wasteFactor / 100));
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Drywall Estimator Summary — Drywall Sheets: ${totalSheets} sheets | Surface Area: ${totalArea.toLocaleString()} sq ft | Joint Compound: ${estimatedJointCompoundKg} lbs | Joint Tape: ${estimatedTapeFeet} ft`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Wall & Drywall Sheet Dimensions"
          subtitle="Calculate gypsum sheets, joint compound, and joint tape with cutting waste."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Total Wall Length / Perimeter"
              htmlFor={wallLenId}
              unit="ft"
              error={errors.wallLength}
            >
              <input
                id={wallLenId}
                type="number"
                min="0"
                step="any"
                value={wallLengthStr}
                onChange={(e) => setWallLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="40"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Wall Height"
              htmlFor={wallHgtId}
              unit="ft"
              error={errors.wallHeight}
            >
              <input
                id={wallHgtId}
                type="number"
                min="0"
                step="any"
                value={wallHeightStr}
                onChange={(e) => setWallHeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Sheet Width"
              htmlFor={sheetWidId}
              unit="ft"
              error={errors.sheetWidth}
            >
              <input
                id={sheetWidId}
                type="number"
                min="0"
                step="any"
                value={sheetWidthStr}
                onChange={(e) => setSheetWidthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Sheet Length"
              htmlFor={sheetLenId}
              unit="ft"
              error={errors.sheetLength}
            >
              <input
                id={sheetLenId}
                type="number"
                min="0"
                step="any"
                value={sheetLengthStr}
                onChange={(e) => setSheetLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
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
            Standard panel size is 4×8 ft (32 sq ft). Joint compound and joint tape estimates scale
            linearly with surface area and perimeter.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Drywall Material Estimator Summary"
          state={resultState}
          primaryLabel="Drywall Sheets (w/ waste)"
          primaryValue={`${totalSheets} sheets`}
          primarySubtext={`For ${totalArea.toLocaleString()} sq ft total wall surface area (+${wasteFactor}% waste)`}
          statusLabel={`${sheetWidth}×${sheetLength} ft Panels`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter wall & sheet dimensions"
          emptyDescription="Provide room perimeter length, wall height, sheet dimensions, and waste allowance to estimate drywall materials."
          errorTitle="Invalid drywall inputs"
          errorMessage={Object.values(errors)[0] || 'Check wall and drywall sheet dimensions.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Joint Compound (Mud)"
              value={`${estimatedJointCompoundKg} lbs`}
            />
            <ToolMetricTile label="Joint Tape Required" value={`${estimatedTapeFeet} ft`} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Surface Area',
                value: `${totalArea.toLocaleString()} sq ft`
              },
              {
                label: 'Drywall Sheets (w/ waste)',
                value: `${totalSheets} sheets`,
                highlight: true
              },
              {
                label: 'Joint Compound (Mud)',
                value: `${estimatedJointCompoundKg} lbs`
              },
              {
                label: 'Joint Tape Required',
                value: `${estimatedTapeFeet} ft`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
