import { useEffect, useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

export type TrigFocus = 'pythagorean' | 'trig';

interface TrigCalculatorProps {
  initialFocus?: TrigFocus;
}

const DEFAULTS = {
  angleUnit: 'deg' as 'deg' | 'rad',
  angle: '45',
  sideA: '3',
  sideB: '4'
};

export default function TrigCalculator({ initialFocus = 'pythagorean' }: TrigCalculatorProps) {
  const [focus, setFocus] = useState<TrigFocus>(initialFocus);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>(DEFAULTS.angleUnit);
  const [angleStr, setAngleStr] = useState<string>(DEFAULTS.angle);
  const [sideAStr, setSideAStr] = useState<string>(DEFAULTS.sideA);
  const [sideBStr, setSideBStr] = useState<string>(DEFAULTS.sideB);

  useEffect(() => {
    setFocus(initialFocus);
  }, [initialFocus]);

  const angleId = useId();
  const sideAId = useId();
  const sideBId = useId();

  const handleReset = () => {
    setAngleUnit(DEFAULTS.angleUnit);
    setAngleStr(DEFAULTS.angle);
    setSideAStr(DEFAULTS.sideA);
    setSideBStr(DEFAULTS.sideB);
  };

  const handleClear = () => {
    setAngleStr('');
    setSideAStr('');
    setSideBStr('');
  };

  // Validate angle
  const angleEmpty = angleStr.trim() === '';
  const angle = Number(angleStr);
  const angleError = !angleEmpty && !Number.isFinite(angle) ? 'Enter a valid angle.' : '';

  const rad = !angleEmpty && !angleError ? (angleUnit === 'deg' ? (angle * Math.PI) / 180 : angle) : 0;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = Math.abs(cosVal) > 1e-10 ? Math.tan(rad) : Infinity;
  const cscVal = Math.abs(sinVal) > 1e-10 ? 1 / sinVal : Infinity;
  const secVal = Math.abs(cosVal) > 1e-10 ? 1 / cosVal : Infinity;
  const cotVal = Math.abs(sinVal) > 1e-10 && Math.abs(cosVal) > 1e-10 ? 1 / Math.tan(rad) : Infinity;

  // Validate right triangle sides
  const triEmpty = sideAStr.trim() === '' || sideBStr.trim() === '';
  const sideA = Number(sideAStr);
  const sideB = Number(sideBStr);
  let sideAError = '';
  let sideBError = '';
  if (!triEmpty) {
    if (!Number.isFinite(sideA) || sideA <= 0) sideAError = 'Side a must be greater than 0.';
    if (!Number.isFinite(sideB) || sideB <= 0) sideBError = 'Side b must be greater than 0.';
  }
  const triError = sideAError || sideBError;

  const hyp = !triEmpty && !triError ? Math.sqrt(sideA * sideA + sideB * sideB) : 0;
  const angleAlphaDeg = !triEmpty && !triError ? (Math.atan2(sideB, sideA) * 180) / Math.PI : 0;
  const angleBetaDeg = !triEmpty && !triError ? 90 - angleAlphaDeg : 0;
  const triArea = !triEmpty && !triError ? 0.5 * sideA * sideB : 0;

  const trigFunctions = [
    { name: 'sin(θ)', val: sinVal },
    { name: 'cos(θ)', val: cosVal },
    { name: 'tan(θ)', val: tanVal },
    { name: 'csc(θ)', val: cscVal },
    { name: 'sec(θ)', val: secVal },
    { name: 'cot(θ)', val: cotVal }
  ];

  const formatTrig = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(5))) : 'Undefined');

  const bothEmpty = angleEmpty && triEmpty;
  const activeError = focus === 'trig' ? angleError : triError;
  const activeEmpty = focus === 'trig' ? angleEmpty : triEmpty;
  const resultState: 'ready' | 'empty' | 'error' = activeError
    ? 'error'
    : bothEmpty || activeEmpty
      ? 'empty'
      : 'ready';

  const copyText =
    focus === 'trig'
      ? `Angle θ = ${angle}${angleUnit === 'deg' ? '°' : ' rad'} | sin=${formatTrig(sinVal)}, cos=${formatTrig(cosVal)}, tan=${formatTrig(tanVal)}, csc=${formatTrig(cscVal)}, sec=${formatTrig(secVal)}, cot=${formatTrig(cotVal)}`
      : `Right Triangle (a=${sideA}, b=${sideB}): Hypotenuse c = ${hyp.toFixed(3)}, α = ${angleAlphaDeg.toFixed(2)}°, β = ${angleBetaDeg.toFixed(2)}°, Area = ${triArea.toFixed(2)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Trigonometry & Right Triangle Inputs"
          subtitle="Evaluate all six trigonometric functions and solve right triangles simultaneously."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ToolSegmentedControl
              ariaLabel="Primary result focus"
              value={focus}
              onChange={setFocus}
              options={[
                { value: 'pythagorean', label: 'Right Triangle (Pythagorean)' },
                { value: 'trig', label: 'Trig Functions' }
              ]}
            />
          </div>

          {/* Section 1: Angle & Trig Functions */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-text-primary">Trigonometric Function Values</h3>
              <ToolSegmentedControl
                ariaLabel="Angle unit"
                value={angleUnit}
                onChange={setAngleUnit}
                options={[
                  { value: 'deg', label: 'Degrees (°)' },
                  { value: 'rad', label: 'Radians (rad)' }
                ]}
              />
            </div>

            <ToolFieldGroup
              label="Angle θ"
              htmlFor={angleId}
              unit={angleUnit === 'deg' ? 'degrees' : 'radians'}
              error={angleError}
            >
              <input
                id={angleId}
                type="number"
                step="any"
                value={angleStr}
                onChange={(e) => setAngleStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="45"
              />
            </ToolFieldGroup>
          </div>

          {/* Section 2: Right Triangle Sides */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <h3 className="text-xs font-semibold text-text-primary">Right Triangle Solver (Pythagorean)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Side a (Leg)" htmlFor={sideAId} error={sideAError}>
                <input
                  id={sideAId}
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={sideAStr}
                  onChange={(e) => setSideAStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="3"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Side b (Leg)" htmlFor={sideBId} error={sideBError}>
                <input
                  id={sideBId}
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={sideBStr}
                  onChange={(e) => setSideBStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="4"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={focus === 'trig' ? 'Trigonometric Ratios & Triangle' : 'Right Triangle & Trig Summary'}
          state={resultState}
          primaryLabel={focus === 'trig' ? `sin(${angle}${angleUnit === 'deg' ? '°' : ' rad'})` : 'Hypotenuse c (√(a² + b²))'}
          primaryValue={focus === 'trig' ? formatTrig(sinVal) : hyp.toFixed(3)}
          primarySubtext={
            focus === 'trig'
              ? `cos(θ) = ${formatTrig(cosVal)} · tan(θ) = ${formatTrig(tanVal)}`
              : `α = ${angleAlphaDeg.toFixed(2)}° · β = ${angleBetaDeg.toFixed(2)}° · Area = ${triArea.toFixed(2)}`
          }
          copyText={copyText}
          emptyTitle="Enter angle or triangle legs"
          emptyDescription="Provide an angle θ and/or legs a and b to compute trigonometric ratios and right-triangle geometry."
          errorTitle="Invalid input"
          errorMessage={activeError}
        >
          {!angleEmpty && !angleError && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-text-secondary">All Six Trig Functions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {trigFunctions.map((fn) => (
                  <ToolMetricTile key={fn.name} label={fn.name} value={formatTrig(fn.val)} />
                ))}
              </div>
            </div>
          )}

          {!triEmpty && !triError && (
            <ToolBreakdownList
              items={[
                { label: 'Hypotenuse c (√(a² + b²))', value: hyp.toFixed(3), highlight: true },
                { label: 'Angle α opposite side a', value: `${angleAlphaDeg.toFixed(2)}°` },
                { label: 'Angle β opposite side b', value: `${angleBetaDeg.toFixed(2)}°` },
                { label: 'Triangle Area', value: triArea.toFixed(2) }
              ]}
            />
          )}
        </ToolResultsPanel>
      }
    />
  );
}
