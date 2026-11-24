import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type SubTool = 'flooring' | 'paint' | 'concrete';

const DEFAULTS = {
  flooring: { length: '15', width: '12', wastePercent: '10', boxCoverage: '20' },
  paint: { perimeter: '40', height: '9', coats: '2', deduction: '40' },
  concrete: { length: '20', width: '10', thickness: '4' }
};

export default function ConstructionCalculator() {
  const [tool, setTool] = useState<SubTool>('flooring');

  // Flooring state
  const [floorLength, setFloorLength] = useState<string>(DEFAULTS.flooring.length);
  const [floorWidth, setFloorWidth] = useState<string>(DEFAULTS.flooring.width);
  const [wastePercent, setWastePercent] = useState<string>(DEFAULTS.flooring.wastePercent);
  const [boxCoverage, setBoxCoverage] = useState<string>(DEFAULTS.flooring.boxCoverage);

  // Paint state
  const [paintLength, setPaintLength] = useState<string>(DEFAULTS.paint.perimeter);
  const [paintHeight, setPaintHeight] = useState<string>(DEFAULTS.paint.height);
  const [paintCoats, setPaintCoats] = useState<string>(DEFAULTS.paint.coats);
  const [doorsWindowsArea, setDoorsWindowsArea] = useState<string>(DEFAULTS.paint.deduction);

  // Concrete state
  const [concLength, setConcLength] = useState<string>(DEFAULTS.concrete.length);
  const [concWidth, setConcWidth] = useState<string>(DEFAULTS.concrete.width);
  const [concThickness, setConcThickness] = useState<string>(DEFAULTS.concrete.thickness);

  const floorLengthId = useId();
  const floorWidthId = useId();
  const wastePercentId = useId();
  const boxCoverageId = useId();
  const paintLengthId = useId();
  const paintHeightId = useId();
  const paintCoatsId = useId();
  const doorsWindowsAreaId = useId();
  const concLengthId = useId();
  const concWidthId = useId();
  const concThicknessId = useId();

  // Reset & Clear for active sub-tool
  const handleReset = () => {
    if (tool === 'flooring') {
      setFloorLength(DEFAULTS.flooring.length);
      setFloorWidth(DEFAULTS.flooring.width);
      setWastePercent(DEFAULTS.flooring.wastePercent);
      setBoxCoverage(DEFAULTS.flooring.boxCoverage);
    } else if (tool === 'paint') {
      setPaintLength(DEFAULTS.paint.perimeter);
      setPaintHeight(DEFAULTS.paint.height);
      setPaintCoats(DEFAULTS.paint.coats);
      setDoorsWindowsArea(DEFAULTS.paint.deduction);
    } else {
      setConcLength(DEFAULTS.concrete.length);
      setConcWidth(DEFAULTS.concrete.width);
      setConcThickness(DEFAULTS.concrete.thickness);
    }
  };

  const handleClear = () => {
    if (tool === 'flooring') {
      setFloorLength('');
      setFloorWidth('');
      setWastePercent('');
      setBoxCoverage('');
    } else if (tool === 'paint') {
      setPaintLength('');
      setPaintHeight('');
      setPaintCoats('');
      setDoorsWindowsArea('');
    } else {
      setConcLength('');
      setConcWidth('');
      setConcThickness('');
    }
  };

  // Validate and calculate active sub-tool (exact formulas preserved)
  const errors: Record<string, string> = {};
  let isEmpty = false;

  // Flooring metrics
  const fLen = Number(floorLength);
  const fWid = Number(floorWidth);
  const fWaste = wastePercent.trim() === '' ? 0 : Number(wastePercent);
  const fBox = Number(boxCoverage);
  let rawFloorArea = 0;
  let wasteArea = 0;
  let totalFloorAreaNeeded = 0;
  let boxesNeeded = 0;

  // Paint metrics
  const pLen = Number(paintLength);
  const pHgt = Number(paintHeight);
  const pCoats = Number(paintCoats);
  const pDeduct = doorsWindowsArea.trim() === '' ? 0 : Number(doorsWindowsArea);
  let rawWallArea = 0;
  let totalPaintArea = 0;
  let gallonsNeeded = 0;

  // Concrete metrics
  const cLen = Number(concLength);
  const cWid = Number(concWidth);
  const cThk = Number(concThickness);
  let cubicFeet = 0;
  let cubicYards = 0;
  let cubicMeters = 0;
  let bags80lb = 0;

  if (tool === 'flooring') {
    if (floorLength.trim() === '' || floorWidth.trim() === '' || boxCoverage.trim() === '') {
      isEmpty = true;
    } else {
      if (!Number.isFinite(fLen) || fLen <= 0) errors.floorLength = 'Length must be greater than 0.';
      if (!Number.isFinite(fWid) || fWid <= 0) errors.floorWidth = 'Width must be greater than 0.';
      if (!Number.isFinite(fWaste) || fWaste < 0 || fWaste > 100)
        errors.wastePercent = 'Waste allowance must be between 0% and 100%.';
      if (!Number.isFinite(fBox) || fBox <= 0)
        errors.boxCoverage = 'Box coverage must be greater than 0 sq ft.';
      if (Object.keys(errors).length === 0) {
        rawFloorArea = fLen * fWid;
        wasteArea = rawFloorArea * (fWaste / 100);
        totalFloorAreaNeeded = rawFloorArea + wasteArea;
        boxesNeeded = Math.ceil(totalFloorAreaNeeded / fBox);
      }
    }
  } else if (tool === 'paint') {
    if (paintLength.trim() === '' || paintHeight.trim() === '' || paintCoats.trim() === '') {
      isEmpty = true;
    } else {
      if (!Number.isFinite(pLen) || pLen <= 0)
        errors.paintLength = 'Wall perimeter must be greater than 0.';
      if (!Number.isFinite(pHgt) || pHgt <= 0)
        errors.paintHeight = 'Ceiling height must be greater than 0.';
      if (!Number.isFinite(pCoats) || pCoats < 1 || pCoats > 10)
        errors.paintCoats = 'Enter between 1 and 10 coats.';
      if (!Number.isFinite(pDeduct) || pDeduct < 0)
        errors.doorsWindowsArea = 'Deduction area cannot be negative.';
      if (Object.keys(errors).length === 0) {
        rawWallArea = Math.max(0, pLen * pHgt - pDeduct);
        totalPaintArea = rawWallArea * pCoats;
        gallonsNeeded = Math.ceil(totalPaintArea / 350);
      }
    }
  } else {
    if (concLength.trim() === '' || concWidth.trim() === '' || concThickness.trim() === '') {
      isEmpty = true;
    } else {
      if (!Number.isFinite(cLen) || cLen <= 0) errors.concLength = 'Length must be greater than 0.';
      if (!Number.isFinite(cWid) || cWid <= 0) errors.concWidth = 'Width must be greater than 0.';
      if (!Number.isFinite(cThk) || cThk <= 0 || cThk > 120)
        errors.concThickness = 'Thickness must be between 1 and 120 inches.';
      if (Object.keys(errors).length === 0) {
        const concThicknessFeet = cThk / 12;
        cubicFeet = cLen * cWid * concThicknessFeet;
        cubicYards = cubicFeet / 27;
        cubicMeters = cubicFeet * 0.0283168;
        bags80lb = Math.ceil(cubicYards * 45);
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors
    ? 'error'
    : isEmpty
      ? 'empty'
      : 'ready';

  return (
    <div className="space-y-4">
      {/* Sub-tool Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToolSegmentedControl
          ariaLabel="Construction estimator mode"
          value={tool}
          onChange={setTool}
          options={[
            { value: 'flooring', label: 'Tile & Flooring' },
            { value: 'paint', label: 'Paint Coverage' },
            { value: 'concrete', label: 'Concrete Slab' }
          ]}
        />
      </div>

      {tool === 'flooring' && (
        <ToolSplitWorkspace
          inputs={
            <ToolInputPanel
              title="Room Measurements"
              subtitle="Estimate total flooring boxes including cutting waste."
              onReset={handleReset}
              onClear={handleClear}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup
                  label="Room Length"
                  htmlFor={floorLengthId}
                  unit="ft"
                  error={errors.floorLength}
                >
                  <input
                    id={floorLengthId}
                    type="number"
                    min={0}
                    step="any"
                    value={floorLength}
                    onChange={(e) => setFloorLength(e.target.value)}
                    placeholder="15"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Room Width"
                  htmlFor={floorWidthId}
                  unit="ft"
                  error={errors.floorWidth}
                >
                  <input
                    id={floorWidthId}
                    type="number"
                    min={0}
                    step="any"
                    value={floorWidth}
                    onChange={(e) => setFloorWidth(e.target.value)}
                    placeholder="12"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup
                  label="Waste Allowance"
                  htmlFor={wastePercentId}
                  unit="%"
                  hint="10% standard for straight lay; 15% diagonal"
                  error={errors.wastePercent}
                >
                  <input
                    id={wastePercentId}
                    type="number"
                    min={0}
                    max={100}
                    value={wastePercent}
                    onChange={(e) => setWastePercent(e.target.value)}
                    placeholder="10"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Box Coverage"
                  htmlFor={boxCoverageId}
                  unit="sq ft / box"
                  hint="Check carton label for coverage"
                  error={errors.boxCoverage}
                >
                  <input
                    id={boxCoverageId}
                    type="number"
                    min={1}
                    step="any"
                    value={boxCoverage}
                    onChange={(e) => setBoxCoverage(e.target.value)}
                    placeholder="20"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>

              <ToolPresetBar
                label="Room presets:"
                presets={[
                  {
                    label: '15×12 Bedroom',
                    onSelect: () => {
                      setFloorLength('15');
                      setFloorWidth('12');
                      setWastePercent('10');
                      setBoxCoverage('20');
                    }
                  },
                  {
                    label: '20×16 Living Room',
                    onSelect: () => {
                      setFloorLength('20');
                      setFloorWidth('16');
                      setWastePercent('10');
                      setBoxCoverage('20');
                    }
                  },
                  {
                    label: '10×8 Bath (15% waste)',
                    onSelect: () => {
                      setFloorLength('10');
                      setFloorWidth('8');
                      setWastePercent('15');
                      setBoxCoverage('15');
                    }
                  }
                ]}
              />
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title="Flooring Estimate"
              state={resultState}
              primaryLabel="Boxes to Purchase"
              primaryValue={String(boxesNeeded)}
              primaryUnit="boxes"
              primarySubtext={`Covers ${totalFloorAreaNeeded.toFixed(1)} sq ft including ${fWaste}% waste`}
              copyText={`Flooring Estimate: ${boxesNeeded} boxes (${totalFloorAreaNeeded.toFixed(1)} sq ft total, ${rawFloorArea.toFixed(1)} sq ft room + ${fWaste}% waste)`}
              emptyTitle="Enter room dimensions"
              emptyDescription="Provide length, width, and box coverage to estimate material boxes."
              errorMessage={Object.values(errors)[0]}
            >
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile label="Raw Room Area" value={`${rawFloorArea.toFixed(1)} sq ft`} />
                <ToolMetricTile
                  label="Total Material"
                  value={`${totalFloorAreaNeeded.toFixed(1)} sq ft`}
                  accent
                />
              </div>
              <ToolBreakdownList
                items={[
                  { label: 'Raw Room Area', value: `${rawFloorArea} sq ft` },
                  { label: `Waste Buffer (${fWaste}%)`, value: `+${wasteArea.toFixed(1)} sq ft` },
                  { label: 'Total Material Needed', value: `${totalFloorAreaNeeded.toFixed(1)} sq ft`, highlight: true }
                ]}
              />
            </ToolResultsPanel>
          }
        />
      )}

      {tool === 'paint' && (
        <ToolSplitWorkspace
          inputs={
            <ToolInputPanel
              title="Wall Dimensions"
              subtitle="Calculate paint gallons assuming ~350 sq ft coverage per gallon."
              onReset={handleReset}
              onClear={handleClear}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup
                  label="Total Wall Perimeter"
                  htmlFor={paintLengthId}
                  unit="ft"
                  error={errors.paintLength}
                >
                  <input
                    id={paintLengthId}
                    type="number"
                    min={1}
                    step="any"
                    value={paintLength}
                    onChange={(e) => setPaintLength(e.target.value)}
                    placeholder="40"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Ceiling Height"
                  htmlFor={paintHeightId}
                  unit="ft"
                  error={errors.paintHeight}
                >
                  <input
                    id={paintHeightId}
                    type="number"
                    min={1}
                    step="any"
                    value={paintHeight}
                    onChange={(e) => setPaintHeight(e.target.value)}
                    placeholder="9"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup
                  label="Number of Coats"
                  htmlFor={paintCoatsId}
                  unit="coats"
                  error={errors.paintCoats}
                >
                  <input
                    id={paintCoatsId}
                    type="number"
                    min={1}
                    max={10}
                    value={paintCoats}
                    onChange={(e) => setPaintCoats(e.target.value)}
                    placeholder="2"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Deduct Windows & Doors"
                  htmlFor={doorsWindowsAreaId}
                  unit="sq ft"
                  hint="~20 sq ft per door, ~15 sq ft per window"
                  error={errors.doorsWindowsArea}
                >
                  <input
                    id={doorsWindowsAreaId}
                    type="number"
                    min={0}
                    step="any"
                    value={doorsWindowsArea}
                    onChange={(e) => setDoorsWindowsArea(e.target.value)}
                    placeholder="40"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title="Paint Required"
              state={resultState}
              primaryLabel="Gallon Cans"
              primaryValue={String(gallonsNeeded)}
              primaryUnit="gallons"
              primarySubtext="Estimated at 350 sq ft coverage per gallon"
              copyText={`Paint Required: ${gallonsNeeded} gallons (${totalPaintArea} sq ft total across ${pCoats} coats)`}
              emptyTitle="Enter wall dimensions"
              emptyDescription="Provide room perimeter, ceiling height, and coat count to estimate paint."
              errorMessage={Object.values(errors)[0]}
            >
              <ToolBreakdownList
                items={[
                  { label: 'Net Wall Surface', value: `${rawWallArea} sq ft` },
                  { label: `Total Coverage (${pCoats} coats)`, value: `${totalPaintArea} sq ft`, highlight: true },
                  { label: 'Coverage Rate Used', value: '350 sq ft / gal' }
                ]}
              />
            </ToolResultsPanel>
          }
        />
      )}

      {tool === 'concrete' && (
        <ToolSplitWorkspace
          inputs={
            <ToolInputPanel
              title="Slab Dimensions"
              subtitle="Estimate ready-mix volume in cubic yards, cubic meters, and 80 lb bags."
              onReset={handleReset}
              onClear={handleClear}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup
                  label="Slab Length"
                  htmlFor={concLengthId}
                  unit="ft"
                  error={errors.concLength}
                >
                  <input
                    id={concLengthId}
                    type="number"
                    min={1}
                    step="any"
                    value={concLength}
                    onChange={(e) => setConcLength(e.target.value)}
                    placeholder="20"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Slab Width"
                  htmlFor={concWidthId}
                  unit="ft"
                  error={errors.concWidth}
                >
                  <input
                    id={concWidthId}
                    type="number"
                    min={1}
                    step="any"
                    value={concWidth}
                    onChange={(e) => setConcWidth(e.target.value)}
                    placeholder="10"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>

              <ToolFieldGroup
                label="Slab Thickness"
                htmlFor={concThicknessId}
                unit="inches"
                hint="4 in typical patio/sidewalk; 6 in driveway"
                error={errors.concThickness}
              >
                <input
                  id={concThicknessId}
                  type="number"
                  min={1}
                  max={36}
                  step="any"
                  value={concThickness}
                  onChange={(e) => setConcThickness(e.target.value)}
                  placeholder="4"
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>

              <ToolPresetBar
                label="Common slabs:"
                presets={[
                  {
                    label: '20×10 ft · 4 in Patio',
                    onSelect: () => {
                      setConcLength('20');
                      setConcWidth('10');
                      setConcThickness('4');
                    }
                  },
                  {
                    label: '24×24 ft · 6 in Garage',
                    onSelect: () => {
                      setConcLength('24');
                      setConcWidth('24');
                      setConcThickness('6');
                    }
                  },
                  {
                    label: '12×10 ft · 4 in Shed Pad',
                    onSelect: () => {
                      setConcLength('12');
                      setConcWidth('10');
                      setConcThickness('4');
                    }
                  }
                ]}
              />
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title="Concrete Volume"
              state={resultState}
              primaryLabel="Ready-Mix Volume"
              primaryValue={cubicYards.toFixed(2)}
              primaryUnit="yd³"
              primarySubtext={`Equivalent to ${cubicFeet.toFixed(1)} ft³ (${cubicMeters.toFixed(2)} m³)`}
              copyText={`Concrete Volume: ${cubicYards.toFixed(2)} yd³ (${cubicMeters.toFixed(2)} m³) | ~${bags80lb} pre-mixed 80 lb bags`}
              emptyTitle="Enter slab dimensions"
              emptyDescription="Provide length, width, and thickness to calculate concrete volume."
              errorMessage={Object.values(errors)[0]}
            >
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile label="Cubic Meters" value={`${cubicMeters.toFixed(2)} m³`} />
                <ToolMetricTile
                  label="80 lb Bags Needed"
                  value={`~${bags80lb} bags`}
                  hint="~45 bags per yd³"
                  accent
                />
              </div>
              <ToolBreakdownList
                items={[
                  { label: 'Slab Footprint', value: `${(cLen * cWid).toFixed(1)} sq ft` },
                  { label: 'Cubic Feet', value: `${cubicFeet.toFixed(1)} ft³` },
                  { label: 'Cubic Meters', value: `${cubicMeters.toFixed(2)} m³` },
                  { label: 'Pre-mixed 80 lb Bags', value: `~${bags80lb} bags`, highlight: true }
                ]}
              />
            </ToolResultsPanel>
          }
        />
      )}
    </div>
  );
}
