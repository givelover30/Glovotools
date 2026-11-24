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

type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'trapezoid';

const DEFAULTS = {
  unit: 'm',
  rectLength: '10',
  rectWidth: '6',
  circleRadius: '5',
  triBase: '8',
  triHeight: '6',
  trapBaseA: '10',
  trapBaseB: '6',
  trapHeight: '5'
};

export default function AreaCalculator() {
  const [shape, setShape] = useState<ShapeType>('rectangle');
  const [unit, setUnit] = useState<string>(DEFAULTS.unit);

  const unitSelectId = useId();
  const rectLengthId = useId();
  const rectWidthId = useId();
  const circleRadiusId = useId();
  const triangleBaseId = useId();
  const triangleHeightId = useId();
  const trapBaseAId = useId();
  const trapBaseBId = useId();
  const trapHeightId = useId();

  const [rectLength, setRectLength] = useState<string>(DEFAULTS.rectLength);
  const [rectWidth, setRectWidth] = useState<string>(DEFAULTS.rectWidth);
  const [circleRadius, setCircleRadius] = useState<string>(DEFAULTS.circleRadius);
  const [triBase, setTriBase] = useState<string>(DEFAULTS.triBase);
  const [triHeight, setTriHeight] = useState<string>(DEFAULTS.triHeight);
  const [trapBaseA, setTrapBaseA] = useState<string>(DEFAULTS.trapBaseA);
  const [trapBaseB, setTrapBaseB] = useState<string>(DEFAULTS.trapBaseB);
  const [trapHeight, setTrapHeight] = useState<string>(DEFAULTS.trapHeight);

  const handleReset = () => {
    setUnit(DEFAULTS.unit);
    if (shape === 'rectangle') {
      setRectLength(DEFAULTS.rectLength);
      setRectWidth(DEFAULTS.rectWidth);
    } else if (shape === 'circle') {
      setCircleRadius(DEFAULTS.circleRadius);
    } else if (shape === 'triangle') {
      setTriBase(DEFAULTS.triBase);
      setTriHeight(DEFAULTS.triHeight);
    } else {
      setTrapBaseA(DEFAULTS.trapBaseA);
      setTrapBaseB(DEFAULTS.trapBaseB);
      setTrapHeight(DEFAULTS.trapHeight);
    }
  };

  const handleClear = () => {
    if (shape === 'rectangle') {
      setRectLength('');
      setRectWidth('');
    } else if (shape === 'circle') {
      setCircleRadius('');
    } else if (shape === 'triangle') {
      setTriBase('');
      setTriHeight('');
    } else {
      setTrapBaseA('');
      setTrapBaseB('');
      setTrapHeight('');
    }
  };

  const errors: Record<string, string> = {};
  let isEmpty = false;
  let area = 0;
  let perimeter = 0;
  let formula = '';

  const checkNonNeg = (valStr: string, key: string, label: string): number => {
    const num = Number(valStr);
    if (!Number.isFinite(num) || num < 0) {
      errors[key] = `${label} must be 0 or greater.`;
      return 0;
    }
    return num;
  };

  if (shape === 'rectangle') {
    if (rectLength.trim() === '' || rectWidth.trim() === '') {
      isEmpty = true;
    } else {
      const l = checkNonNeg(rectLength, 'rectLength', 'Length');
      const w = checkNonNeg(rectWidth, 'rectWidth', 'Width');
      if (Object.keys(errors).length === 0) {
        area = l * w;
        perimeter = 2 * (l + w);
        formula = `Area = Length × Width = ${l} × ${w} = ${area.toFixed(2)}`;
      }
    }
  } else if (shape === 'circle') {
    if (circleRadius.trim() === '') {
      isEmpty = true;
    } else {
      const r = checkNonNeg(circleRadius, 'circleRadius', 'Radius');
      if (Object.keys(errors).length === 0) {
        area = Math.PI * Math.pow(r, 2);
        perimeter = 2 * Math.PI * r;
        formula = `Area = π × r² = 3.14159 × ${r}² = ${area.toFixed(2)}`;
      }
    }
  } else if (shape === 'triangle') {
    if (triBase.trim() === '' || triHeight.trim() === '') {
      isEmpty = true;
    } else {
      const b = checkNonNeg(triBase, 'triBase', 'Base');
      const h = checkNonNeg(triHeight, 'triHeight', 'Height');
      if (Object.keys(errors).length === 0) {
        area = 0.5 * b * h;
        perimeter = 0;
        formula = `Area = ½ × Base × Height = 0.5 × ${b} × ${h} = ${area.toFixed(2)}`;
      }
    }
  } else if (shape === 'trapezoid') {
    if (trapBaseA.trim() === '' || trapBaseB.trim() === '' || trapHeight.trim() === '') {
      isEmpty = true;
    } else {
      const a = checkNonNeg(trapBaseA, 'trapBaseA', 'Base A');
      const b = checkNonNeg(trapBaseB, 'trapBaseB', 'Base B');
      const h = checkNonNeg(trapHeight, 'trapHeight', 'Height');
      if (Object.keys(errors).length === 0) {
        area = 0.5 * (a + b) * h;
        formula = `Area = ½ × (a + b) × h = 0.5 × (${a} + ${b}) × ${h} = ${area.toFixed(2)}`;
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const sqMeters =
    unit === 'm'
      ? area.toFixed(2)
      : (
          area *
          (unit === 'ft'
            ? 0.092903
            : unit === 'cm'
              ? 0.0001
              : unit === 'in'
                ? 0.00064516
                : 0.836127)
        ).toFixed(3);
  const sqFeet =
    unit === 'ft'
      ? area.toFixed(2)
      : (
          area *
          (unit === 'm'
            ? 10.7639
            : unit === 'cm'
              ? 0.00107639
              : unit === 'in'
                ? 0.00694444
                : 9)
        ).toFixed(2);

  const copyText = `${shape[0].toUpperCase() + shape.slice(1)} Area: ${area.toFixed(2)} ${unit}²${perimeter > 0 ? ` | Perimeter: ${perimeter.toFixed(2)} ${unit}` : ''} | ${sqMeters} m² / ${sqFeet} ft²`;
  const rNumeric = Number(circleRadius);

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Dimensions"
          subtitle="Choose a 2D shape, unit, and enter dimensions to calculate area and perimeter."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ToolSegmentedControl
              ariaLabel="2D shape selector"
              value={shape}
              onChange={setShape}
              options={[
                { value: 'rectangle', label: 'Rectangle' },
                { value: 'circle', label: 'Circle' },
                { value: 'triangle', label: 'Triangle' },
                { value: 'trapezoid', label: 'Trapezoid' }
              ]}
            />

            <div className="flex items-center gap-2">
              <label htmlFor={unitSelectId} className="ui-label">
                Unit
              </label>
              <select
                id={unitSelectId}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="ui-select py-1.5 text-xs w-auto"
              >
                <option value="m">Meters (m)</option>
                <option value="ft">Feet (ft)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="in">Inches (in)</option>
                <option value="yd">Yards (yd)</option>
              </select>
            </div>
          </div>

          {shape === 'rectangle' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Length" htmlFor={rectLengthId} unit={unit} error={errors.rectLength}>
                <input
                  id={rectLengthId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={rectLength}
                  onChange={(e) => setRectLength(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="10"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Width" htmlFor={rectWidthId} unit={unit} error={errors.rectWidth}>
                <input
                  id={rectWidthId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={rectWidth}
                  onChange={(e) => setRectWidth(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6"
                />
              </ToolFieldGroup>
            </div>
          )}

          {shape === 'circle' && (
            <ToolFieldGroup
              label="Radius r"
              htmlFor={circleRadiusId}
              unit={unit}
              hint={
                circleRadius.trim() !== '' && Number.isFinite(rNumeric) && rNumeric >= 0
                  ? `Diameter = ${(rNumeric * 2).toFixed(2)} ${unit}`
                  : undefined
              }
              error={errors.circleRadius}
            >
              <input
                id={circleRadiusId}
                type="number"
                min="0"
                step="0.5"
                value={circleRadius}
                onChange={(e) => setCircleRadius(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5"
              />
            </ToolFieldGroup>
          )}

          {shape === 'triangle' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Base b" htmlFor={triangleBaseId} unit={unit} error={errors.triBase}>
                <input
                  id={triangleBaseId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={triBase}
                  onChange={(e) => setTriBase(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="8"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Height h" htmlFor={triangleHeightId} unit={unit} error={errors.triHeight}>
                <input
                  id={triangleHeightId}
                  type="number"
                  min="0"
                  step="0.5"
                  value={triHeight}
                  onChange={(e) => setTriHeight(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6"
                />
              </ToolFieldGroup>
            </div>
          )}

          {shape === 'trapezoid' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolFieldGroup label="Base A" htmlFor={trapBaseAId} unit={unit} error={errors.trapBaseA}>
                  <input
                    id={trapBaseAId}
                    type="number"
                    min="0"
                    step="any"
                    value={trapBaseA}
                    onChange={(e) => setTrapBaseA(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="10"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label="Base B" htmlFor={trapBaseBId} unit={unit} error={errors.trapBaseB}>
                  <input
                    id={trapBaseBId}
                    type="number"
                    min="0"
                    step="any"
                    value={trapBaseB}
                    onChange={(e) => setTrapBaseB(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="6"
                  />
                </ToolFieldGroup>
              </div>
              <ToolFieldGroup label="Height h" htmlFor={trapHeightId} unit={unit} error={errors.trapHeight}>
                <input
                  id={trapHeightId}
                  type="number"
                  min="0"
                  step="any"
                  value={trapHeight}
                  onChange={(e) => setTrapHeight(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5"
                />
              </ToolFieldGroup>
            </div>
          )}
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Calculated Area"
          state={resultState}
          primaryLabel="Area"
          primaryValue={area.toFixed(2)}
          primaryUnit={`${unit}²`}
          primarySubtext={
            perimeter > 0
              ? `Perimeter / Circumference: ${perimeter.toFixed(2)} ${unit}`
              : undefined
          }
          copyText={copyText}
          emptyTitle="Enter shape dimensions"
          emptyDescription="Provide non-negative dimensions to calculate area and unit conversions."
          errorTitle="Invalid dimensions"
          errorMessage={Object.values(errors)[0] || 'Dimensions must be zero or greater.'}
        >
          <div className="rounded-xl bg-surface-secondary/70 border border-border-subtle p-3.5 space-y-1">
            <span className="text-xs font-semibold text-text-secondary block">Step-by-step formula</span>
            <p className="text-xs font-mono text-text-primary break-words">{formula}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Square Meters" value={`${sqMeters} m²`} />
            <ToolMetricTile label="Square Feet" value={`${sqFeet} ft²`} />
          </div>

          {perimeter > 0 && (
            <ToolBreakdownList
              items={[
                { label: shape === 'circle' ? 'Circumference' : 'Perimeter', value: `${perimeter.toFixed(2)} ${unit}`, highlight: true }
              ]}
            />
          )}
        </ToolResultsPanel>
      }
    />
  );
}
