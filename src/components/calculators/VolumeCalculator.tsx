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

type Shape3D = 'cylinder' | 'sphere' | 'cone' | 'prism';

const DEFAULTS = {
  radius: '4',
  height: '10',
  pLength: '8',
  pWidth: '5',
  pHeight: '6'
};

export default function VolumeCalculator() {
  const [shape, setShape] = useState<Shape3D>('cylinder');

  const [radiusStr, setRadiusStr] = useState<string>(DEFAULTS.radius);
  const [heightStr, setHeightStr] = useState<string>(DEFAULTS.height);
  const [pLengthStr, setPLengthStr] = useState<string>(DEFAULTS.pLength);
  const [pWidthStr, setPWidthStr] = useState<string>(DEFAULTS.pWidth);
  const [pHeightStr, setPHeightStr] = useState<string>(DEFAULTS.pHeight);

  const radiusId = useId();
  const heightId = useId();
  const pLengthId = useId();
  const pWidthId = useId();
  const pHeightId = useId();

  const handleReset = () => {
    if (shape === 'prism') {
      setPLengthStr(DEFAULTS.pLength);
      setPWidthStr(DEFAULTS.pWidth);
      setPHeightStr(DEFAULTS.pHeight);
    } else {
      setRadiusStr(DEFAULTS.radius);
      setHeightStr(DEFAULTS.height);
    }
  };

  const handleClear = () => {
    if (shape === 'prism') {
      setPLengthStr('');
      setPWidthStr('');
      setPHeightStr('');
    } else if (shape === 'sphere') {
      setRadiusStr('');
    } else {
      setRadiusStr('');
      setHeightStr('');
    }
  };

  const errors: Record<string, string> = {};
  let isEmpty = false;
  let volume = 0;
  let surfaceArea = 0;
  let formulaStr = '';

  const checkPos = (valStr: string, key: string, label: string): number => {
    const num = Number(valStr);
    if (!Number.isFinite(num) || num <= 0) {
      errors[key] = `${label} must be greater than 0.`;
      return 0;
    }
    return num;
  };

  if (shape === 'cylinder') {
    formulaStr = 'Volume V = π × r² × h, Surface Area A = 2πrh + 2πr²';
    if (radiusStr.trim() === '' || heightStr.trim() === '') {
      isEmpty = true;
    } else {
      const r = checkPos(radiusStr, 'radius', 'Radius');
      const h = checkPos(heightStr, 'height', 'Height');
      if (Object.keys(errors).length === 0) {
        volume = Math.PI * Math.pow(r, 2) * h;
        surfaceArea = 2 * Math.PI * r * h + 2 * Math.PI * Math.pow(r, 2);
      }
    }
  } else if (shape === 'sphere') {
    formulaStr = 'Volume V = (4/3) × π × r³, Surface Area A = 4πr²';
    if (radiusStr.trim() === '') {
      isEmpty = true;
    } else {
      const r = checkPos(radiusStr, 'radius', 'Radius');
      if (Object.keys(errors).length === 0) {
        volume = (4 / 3) * Math.PI * Math.pow(r, 3);
        surfaceArea = 4 * Math.PI * Math.pow(r, 2);
      }
    }
  } else if (shape === 'cone') {
    formulaStr = 'Volume V = (1/3) × π × r² × h, Surface Area A = πr(r + √(r² + h²))';
    if (radiusStr.trim() === '' || heightStr.trim() === '') {
      isEmpty = true;
    } else {
      const r = checkPos(radiusStr, 'radius', 'Radius');
      const h = checkPos(heightStr, 'height', 'Height');
      if (Object.keys(errors).length === 0) {
        volume = (1 / 3) * Math.PI * Math.pow(r, 2) * h;
        const slant = Math.sqrt(r * r + h * h);
        surfaceArea = Math.PI * r * (r + slant);
      }
    }
  } else {
    formulaStr = 'Volume V = l × w × h, Surface Area A = 2(lw + lh + wh)';
    if (pLengthStr.trim() === '' || pWidthStr.trim() === '' || pHeightStr.trim() === '') {
      isEmpty = true;
    } else {
      const l = checkPos(pLengthStr, 'pLength', 'Length');
      const w = checkPos(pWidthStr, 'pWidth', 'Width');
      const h = checkPos(pHeightStr, 'pHeight', 'Height');
      if (Object.keys(errors).length === 0) {
        volume = l * w * h;
        surfaceArea = 2 * (l * w + l * h + w * h);
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `${shape[0].toUpperCase() + shape.slice(1)} — Volume: ${volume.toFixed(2)} cubic units | Surface Area: ${surfaceArea.toFixed(2)} square units`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Dimensions"
          subtitle="Select a 3D solid and enter positive dimensions to compute volume and surface area."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolSegmentedControl
            ariaLabel="3D solid selector"
            value={shape}
            onChange={setShape}
            options={[
              { value: 'cylinder', label: 'Cylinder' },
              { value: 'sphere', label: 'Sphere' },
              { value: 'cone', label: 'Cone' },
              { value: 'prism', label: 'Rectangular Prism' }
            ]}
          />

          {shape !== 'prism' ? (
            <div className={`grid grid-cols-1 ${shape !== 'sphere' ? 'sm:grid-cols-2' : ''} gap-4`}>
              <ToolFieldGroup label="Radius r" htmlFor={radiusId} error={errors.radius}>
                <input
                  id={radiusId}
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={radiusStr}
                  onChange={(e) => setRadiusStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="4"
                />
              </ToolFieldGroup>

              {shape !== 'sphere' && (
                <ToolFieldGroup label="Height h" htmlFor={heightId} error={errors.height}>
                  <input
                    id={heightId}
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={heightStr}
                    onChange={(e) => setHeightStr(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="10"
                  />
                </ToolFieldGroup>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ToolFieldGroup label="Length l" htmlFor={pLengthId} error={errors.pLength}>
                <input
                  id={pLengthId}
                  type="number"
                  min="0.1"
                  step="any"
                  value={pLengthStr}
                  onChange={(e) => setPLengthStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="8"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Width w" htmlFor={pWidthId} error={errors.pWidth}>
                <input
                  id={pWidthId}
                  type="number"
                  min="0.1"
                  step="any"
                  value={pWidthStr}
                  onChange={(e) => setPWidthStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Height h" htmlFor={pHeightId} error={errors.pHeight}>
                <input
                  id={pHeightId}
                  type="number"
                  min="0.1"
                  step="any"
                  value={pHeightStr}
                  onChange={(e) => setPHeightStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6"
                />
              </ToolFieldGroup>
            </div>
          )}

          <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs font-mono text-text-secondary">
            {formulaStr}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="3D Calculations"
          state={resultState}
          primaryLabel="Volume (V)"
          primaryValue={volume.toFixed(2)}
          primaryUnit="cubic units"
          primarySubtext={`Surface Area (A): ${surfaceArea.toFixed(2)} square units`}
          copyText={copyText}
          emptyTitle="Enter solid dimensions"
          emptyDescription="Provide positive dimensions to compute volume and total surface area."
          errorTitle="Invalid dimensions"
          errorMessage={Object.values(errors)[0] || 'Dimensions must be greater than zero.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Volume (V)" value={volume.toFixed(2)} hint="cubic units" accent />
            <ToolMetricTile label="Surface Area (A)" value={surfaceArea.toFixed(2)} hint="square units" />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Volume (V)', value: `${volume.toFixed(2)} cubic units`, highlight: true },
              { label: 'Surface Area (A)', value: `${surfaceArea.toFixed(2)} square units` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
