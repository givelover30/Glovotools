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
  wallLength: '30',
  wallHeight: '3',
  blockWidthInches: '16',
  blockHeightInches: '8',
  wasteFactor: '10'
};

export default function RetainingWallCalculator() {
  const [wallLengthStr, setWallLengthStr] = useState<string>(DEFAULTS.wallLength);
  const [wallHeightStr, setWallHeightStr] = useState<string>(DEFAULTS.wallHeight);
  const [blockWidthInchesStr, setBlockWidthInchesStr] = useState<string>(
    DEFAULTS.blockWidthInches
  );
  const [blockHeightInchesStr, setBlockHeightInchesStr] = useState<string>(
    DEFAULTS.blockHeightInches
  );
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const wallLenId = useId();
  const wallHgtId = useId();
  const blockWidId = useId();
  const blockHgtId = useId();
  const wasteId = useId();

  const handleReset = () => {
    setWallLengthStr(DEFAULTS.wallLength);
    setWallHeightStr(DEFAULTS.wallHeight);
    setBlockWidthInchesStr(DEFAULTS.blockWidthInches);
    setBlockHeightInchesStr(DEFAULTS.blockHeightInches);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setWallLengthStr('');
    setWallHeightStr('');
    setBlockWidthInchesStr('');
    setBlockHeightInchesStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    wallLengthStr.trim() === '' ||
    wallHeightStr.trim() === '' ||
    blockWidthInchesStr.trim() === '' ||
    blockHeightInchesStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const wallLength = Number(wallLengthStr);
  const wallHeight = Number(wallHeightStr);
  const blockWidthInches = Number(blockWidthInchesStr);
  const blockHeightInches = Number(blockHeightInchesStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(wallLength) || wallLength <= 0) {
      errors.wallLength = 'Wall length must be greater than 0 feet.';
    }
    if (!Number.isFinite(wallHeight) || wallHeight <= 0) {
      errors.wallHeight = 'Wall height must be greater than 0 feet.';
    }
    if (!Number.isFinite(blockWidthInches) || blockWidthInches <= 0) {
      errors.blockWidthInches = 'Block width must be greater than 0 inches.';
    }
    if (!Number.isFinite(blockHeightInches) || blockHeightInches <= 0) {
      errors.blockHeightInches = 'Block height must be greater than 0 inches.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let blocksPerRow = 0;
  let totalCourses = 0;
  let rawBlockCount = 0;
  let totalBlocksWithWaste = 0;
  let totalFaceAreaSqFt = 0;

  if (!isEmpty && !hasErrors) {
    const wallLengthInches = wallLength * 12;
    const wallHeightInches = wallHeight * 12;

    blocksPerRow = Math.ceil(wallLengthInches / blockWidthInches);
    totalCourses = Math.ceil(wallHeightInches / blockHeightInches);
    rawBlockCount = blocksPerRow * totalCourses;
    totalBlocksWithWaste = Math.ceil(rawBlockCount * (1 + wasteFactor / 100));
    totalFaceAreaSqFt = wallLength * wallHeight;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Retaining Wall Summary — Total Blocks Required: ${totalBlocksWithWaste} blocks | Wall Face Area: ${totalFaceAreaSqFt.toLocaleString()} sq.ft | Courses: ${totalCourses} courses (${blocksPerRow} blocks/row, ${wasteFactor}% waste)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Wall & Retaining Block Dimensions"
          subtitle="Estimate required retaining wall blocks, courses, and face area with cutting waste."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Wall Length"
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
                placeholder="30"
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
                placeholder="3"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Block Width"
              htmlFor={blockWidId}
              unit="in"
              error={errors.blockWidthInches}
            >
              <input
                id={blockWidId}
                type="number"
                min="0"
                step="any"
                value={blockWidthInchesStr}
                onChange={(e) => setBlockWidthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="16"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Block Height"
              htmlFor={blockHgtId}
              unit="in"
              error={errors.blockHeightInches}
            >
              <input
                id={blockHgtId}
                type="number"
                min="0"
                step="any"
                value={blockHeightInchesStr}
                onChange={(e) => setBlockHeightInchesStr(e.target.value)}
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
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Retaining Wall Estimate Summary"
          state={resultState}
          primaryLabel="Total Blocks Required"
          primaryValue={`${totalBlocksWithWaste} blocks`}
          primarySubtext={`${rawBlockCount} base blocks (${blocksPerRow}/row × ${totalCourses} courses) + ${wasteFactor}% waste`}
          statusLabel={`${totalCourses} Courses`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter wall & block dimensions"
          emptyDescription="Provide wall length, height, block face dimensions, and waste allowance to estimate retaining wall blocks."
          errorTitle="Invalid wall parameters"
          errorMessage={Object.values(errors)[0] || 'Check wall and block dimensions.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Wall Face Area"
              value={`${totalFaceAreaSqFt.toLocaleString()} sq.ft`}
            />
            <ToolMetricTile
              label="Total Courses (Rows)"
              value={`${totalCourses} courses`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Wall Face Area',
                value: `${totalFaceAreaSqFt.toLocaleString()} sq.ft`
              },
              {
                label: 'Blocks per Row',
                value: `${blocksPerRow} blocks`
              },
              {
                label: 'Total Courses (Rows)',
                value: `${totalCourses} courses`
              },
              {
                label: 'Total Blocks Required',
                value: `${totalBlocksWithWaste} blocks`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
