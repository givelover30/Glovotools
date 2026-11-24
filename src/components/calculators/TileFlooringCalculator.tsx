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
  roomLength: '15',
  roomWidth: '12',
  tileLengthInches: '12',
  tileWidthInches: '12',
  boxCoverageSqFt: '15',
  wasteFactor: '10'
};

export default function TileFlooringCalculator() {
  const [roomLengthStr, setRoomLengthStr] = useState<string>(DEFAULTS.roomLength);
  const [roomWidthStr, setRoomWidthStr] = useState<string>(DEFAULTS.roomWidth);
  const [tileLengthInchesStr, setTileLengthInchesStr] = useState<string>(DEFAULTS.tileLengthInches);
  const [tileWidthInchesStr, setTileWidthInchesStr] = useState<string>(DEFAULTS.tileWidthInches);
  const [boxCoverageSqFtStr, setBoxCoverageSqFtStr] = useState<string>(DEFAULTS.boxCoverageSqFt);
  const [wasteFactorStr, setWasteFactorStr] = useState<string>(DEFAULTS.wasteFactor);

  const roomLenId = useId();
  const roomWidId = useId();
  const wasteId = useId();
  const tileLenId = useId();
  const tileWidId = useId();
  const boxCovId = useId();

  const handleReset = () => {
    setRoomLengthStr(DEFAULTS.roomLength);
    setRoomWidthStr(DEFAULTS.roomWidth);
    setTileLengthInchesStr(DEFAULTS.tileLengthInches);
    setTileWidthInchesStr(DEFAULTS.tileWidthInches);
    setBoxCoverageSqFtStr(DEFAULTS.boxCoverageSqFt);
    setWasteFactorStr(DEFAULTS.wasteFactor);
  };

  const handleClear = () => {
    setRoomLengthStr('');
    setRoomWidthStr('');
    setTileLengthInchesStr('');
    setTileWidthInchesStr('');
    setBoxCoverageSqFtStr('');
    setWasteFactorStr('');
  };

  const isEmpty =
    roomLengthStr.trim() === '' ||
    roomWidthStr.trim() === '' ||
    tileLengthInchesStr.trim() === '' ||
    tileWidthInchesStr.trim() === '' ||
    boxCoverageSqFtStr.trim() === '' ||
    wasteFactorStr.trim() === '';

  const roomLength = Number(roomLengthStr);
  const roomWidth = Number(roomWidthStr);
  const tileLengthInches = Number(tileLengthInchesStr);
  const tileWidthInches = Number(tileWidthInchesStr);
  const boxCoverageSqFt = Number(boxCoverageSqFtStr);
  const wasteFactor = Number(wasteFactorStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(roomLength) || roomLength <= 0) {
      errors.roomLength = 'Room length must be greater than 0 feet.';
    }
    if (!Number.isFinite(roomWidth) || roomWidth <= 0) {
      errors.roomWidth = 'Room width must be greater than 0 feet.';
    }
    if (!Number.isFinite(tileLengthInches) || tileLengthInches <= 0) {
      errors.tileLengthInches = 'Tile length must be greater than 0 inches.';
    }
    if (!Number.isFinite(tileWidthInches) || tileWidthInches <= 0) {
      errors.tileWidthInches = 'Tile width must be greater than 0 inches.';
    }
    if (!Number.isFinite(boxCoverageSqFt) || boxCoverageSqFt <= 0) {
      errors.boxCoverageSqFt = 'Box coverage must be greater than 0 sq ft/box.';
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 100) {
      errors.wasteFactor = 'Waste allowance must be between 0% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let netAreaSqFt = 0;
  let grossAreaSqFt = 0;
  let totalTilesNeeded = 0;
  let totalBoxesNeeded = 0;

  if (!isEmpty && !hasErrors) {
    netAreaSqFt = roomLength * roomWidth;
    grossAreaSqFt = netAreaSqFt * (1 + wasteFactor / 100);
    const tileAreaSqFt = (tileLengthInches * tileWidthInches) / 144;
    totalTilesNeeded = tileAreaSqFt > 0 ? Math.ceil(grossAreaSqFt / tileAreaSqFt) : 0;
    totalBoxesNeeded = boxCoverageSqFt > 0 ? Math.ceil(grossAreaSqFt / boxCoverageSqFt) : 0;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Tile & Flooring Summary — Total Boxes Required: ${totalBoxesNeeded} boxes | Total Tiles Needed: ${totalTilesNeeded} tiles | Net Floor Area: ${netAreaSqFt.toLocaleString()} sq ft (+${wasteFactor}% waste)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Room, Tile & Box Specifications"
          subtitle="Estimate required tile counts and carton quantities including cutting waste."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Room Length"
              htmlFor={roomLenId}
              unit="ft"
              error={errors.roomLength}
            >
              <input
                id={roomLenId}
                type="number"
                min="0"
                step="any"
                value={roomLengthStr}
                onChange={(e) => setRoomLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Room Width"
              htmlFor={roomWidId}
              unit="ft"
              error={errors.roomWidth}
            >
              <input
                id={roomWidId}
                type="number"
                min="0"
                step="any"
                value={roomWidthStr}
                onChange={(e) => setRoomWidthStr(e.target.value)}
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
                placeholder="10"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Tile Length"
              htmlFor={tileLenId}
              unit="in"
              error={errors.tileLengthInches}
            >
              <input
                id={tileLenId}
                type="number"
                min="0"
                step="any"
                value={tileLengthInchesStr}
                onChange={(e) => setTileLengthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Tile Width"
              htmlFor={tileWidId}
              unit="in"
              error={errors.tileWidthInches}
            >
              <input
                id={tileWidId}
                type="number"
                min="0"
                step="any"
                value={tileWidthInchesStr}
                onChange={(e) => setTileWidthInchesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Box Coverage"
              htmlFor={boxCovId}
              unit="sq ft/box"
              error={errors.boxCoverageSqFt}
            >
              <input
                id={boxCovId}
                type="number"
                min="0"
                step="any"
                value={boxCoverageSqFtStr}
                onChange={(e) => setBoxCoverageSqFtStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Tile & Flooring Estimator Summary"
          state={resultState}
          primaryLabel="Total Tiles Needed (w/ waste)"
          primaryValue={`${totalTilesNeeded} tiles`}
          primarySubtext={`${totalBoxesNeeded} boxes required for ${grossAreaSqFt.toFixed(1)} sq ft gross area (+${wasteFactor}% waste)`}
          statusLabel={`${totalBoxesNeeded} Boxes`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter room & tile dimensions"
          emptyDescription="Provide room dimensions, tile size, box coverage, and waste allowance to calculate tiles and cartons."
          errorTitle="Invalid flooring inputs"
          errorMessage={Object.values(errors)[0] || 'Check room, tile, and box coverage inputs.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Net Floor Area" value={`${netAreaSqFt.toLocaleString()} sq ft`} />
            <ToolMetricTile
              label="Total Boxes Required"
              value={`${totalBoxesNeeded} boxes`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Net Floor Area',
                value: `${netAreaSqFt.toLocaleString()} sq ft`
              },
              {
                label: 'Gross Coverage (with Waste)',
                value: `${grossAreaSqFt.toFixed(1)} sq ft`
              },
              {
                label: 'Total Tiles Needed (w/ waste)',
                value: `${totalTilesNeeded} tiles`,
                highlight: true
              },
              {
                label: 'Total Boxes Required',
                value: `${totalBoxesNeeded} boxes`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
