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

export type AlgTool = 'quadratic' | 'linear';

interface AlgebraCalculatorProps {
  initialTool?: AlgTool;
}

const DEFAULTS = {
  a: '1',
  b: '-5',
  c: '6',
  x1: '1',
  y1: '2',
  x2: '4',
  y2: '8'
};

export default function AlgebraCalculator({ initialTool = 'quadratic' }: AlgebraCalculatorProps) {
  const [tool, setTool] = useState<AlgTool>(initialTool);

  useEffect(() => {
    setTool(initialTool);
  }, [initialTool]);

  // Quadratic ax^2 + bx + c = 0
  const [aStr, setAStr] = useState<string>(DEFAULTS.a);
  const [bStr, setBStr] = useState<string>(DEFAULTS.b);
  const [cStr, setCStr] = useState<string>(DEFAULTS.c);

  // Linear y = mx + b
  const [x1Str, setX1Str] = useState<string>(DEFAULTS.x1);
  const [y1Str, setY1Str] = useState<string>(DEFAULTS.y1);
  const [x2Str, setX2Str] = useState<string>(DEFAULTS.x2);
  const [y2Str, setY2Str] = useState<string>(DEFAULTS.y2);

  const aId = useId();
  const bId = useId();
  const cId = useId();
  const x1Id = useId();
  const y1Id = useId();
  const x2Id = useId();
  const y2Id = useId();

  const handleReset = () => {
    if (tool === 'quadratic') {
      setAStr(DEFAULTS.a);
      setBStr(DEFAULTS.b);
      setCStr(DEFAULTS.c);
    } else {
      setX1Str(DEFAULTS.x1);
      setY1Str(DEFAULTS.y1);
      setX2Str(DEFAULTS.x2);
      setY2Str(DEFAULTS.y2);
    }
  };

  const handleClear = () => {
    if (tool === 'quadratic') {
      setAStr('');
      setBStr('');
      setCStr('');
    } else {
      setX1Str('');
      setY1Str('');
      setX2Str('');
      setY2Str('');
    }
  };

  const toolTabs = (
    <ToolSegmentedControl
      ariaLabel="Algebra solver mode"
      value={tool}
      onChange={setTool}
      options={[
        { value: 'quadratic', label: 'Quadratic Equation (ax² + bx + c = 0)' },
        { value: 'linear', label: 'Slope & Linear (y = mx + b)' }
      ]}
    />
  );

  if (tool === 'quadratic') {
    const quadEmpty = aStr.trim() === '' || bStr.trim() === '' || cStr.trim() === '';
    const a = Number(aStr);
    const b = Number(bStr);
    const c = Number(cStr);

    let aError = '';
    let bError = '';
    let cError = '';
    if (!quadEmpty) {
      if (!Number.isFinite(a)) aError = 'Enter a valid number.';
      else if (a === 0) aError = 'Coefficient a cannot be 0 for a quadratic equation.';
      if (!Number.isFinite(b)) bError = 'Enter a valid number.';
      if (!Number.isFinite(c)) cError = 'Enter a valid number.';
    }
    const quadError = aError || bError || cError;

    const discriminant = !quadEmpty && !quadError ? b * b - 4 * a * c : 0;
    let root1: number | string = 'N/A';
    let root2: number | string = 'N/A';
    let vertexX = 0;
    let vertexY = 0;

    if (!quadEmpty && !quadError && a !== 0) {
      vertexX = -b / (2 * a);
      vertexY = a * vertexX * vertexX + b * vertexX + c;

      if (discriminant > 0) {
        root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      } else if (discriminant === 0) {
        root1 = -b / (2 * a);
        root2 = root1;
      } else {
        const real = (-b / (2 * a)).toFixed(2);
        const imag = (Math.sqrt(Math.abs(discriminant)) / (2 * a)).toFixed(2);
        root1 = `${real} + ${imag}i`;
        root2 = `${real} - ${imag}i`;
      }
    }

    const r1Display = typeof root1 === 'number' ? root1.toFixed(3) : root1;
    const r2Display = typeof root2 === 'number' ? root2.toFixed(3) : root2;
    const rootType =
      discriminant > 0
        ? 'Two real roots'
        : discriminant === 0
          ? 'One double root'
          : 'Complex roots';
    const resultState: 'ready' | 'empty' | 'error' = quadError
      ? 'error'
      : quadEmpty
        ? 'empty'
        : 'ready';
    const copyText = `Quadratic (${a}x² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0): x₁ = ${r1Display}, x₂ = ${r2Display}, Δ = ${discriminant}, Vertex = (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Coefficients"
            subtitle="Enter quadratic coefficients a, b, and c to find roots, discriminant, and vertex."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{toolTabs}</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ToolFieldGroup label="a (x²)" htmlFor={aId} error={aError}>
                <input
                  id={aId}
                  type="number"
                  step="any"
                  value={aStr}
                  onChange={(e) => setAStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="1"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="b (x)" htmlFor={bId} error={bError}>
                <input
                  id={bId}
                  type="number"
                  step="any"
                  value={bStr}
                  onChange={(e) => setBStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="-5"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="c (constant)" htmlFor={cId} error={cError}>
                <input
                  id={cId}
                  type="number"
                  step="any"
                  value={cStr}
                  onChange={(e) => setCStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6"
                />
              </ToolFieldGroup>
            </div>

            {!quadEmpty && !quadError && (
              <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle font-mono text-xs text-text-primary">
                Equation:{' '}
                <strong>
                  {a}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x{' '}
                  {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0
                </strong>
              </div>
            )}

            <p className="text-xs font-mono text-text-tertiary">
              Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Roots & Parabola Vertex"
            state={resultState}
            primaryLabel="Solutions (x₁, x₂)"
            primaryValue={`${r1Display}, ${r2Display}`}
            statusLabel={rootType}
            statusTone={discriminant >= 0 ? 'success' : 'warning'}
            copyText={copyText}
            emptyTitle="Enter coefficients a, b, and c"
            emptyDescription="Provide all three coefficients to solve the quadratic equation."
            errorTitle="Invalid quadratic equation"
            errorMessage={quadError}
          >
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile label="Root x₁" value={r1Display} accent />
              <ToolMetricTile label="Root x₂" value={r2Display} accent />
            </div>

            <ToolBreakdownList
              items={[
                { label: 'Discriminant (Δ = b² - 4ac)', value: `${discriminant} (${rootType})`, highlight: true },
                { label: 'Parabola Vertex (h, k)', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Linear y = mx + b
  const linEmpty =
    x1Str.trim() === '' || y1Str.trim() === '' || x2Str.trim() === '' || y2Str.trim() === '';
  const x1 = Number(x1Str);
  const y1 = Number(y1Str);
  const x2 = Number(x2Str);
  const y2 = Number(y2Str);

  let linError = '';
  let x2Error = '';
  if (!linEmpty) {
    if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
      linError = 'Enter valid numeric coordinates for both points.';
    } else if (x2 === x1) {
      x2Error = 'x₂ must differ from x₁ (vertical line has undefined slope).';
      linError = x2Error;
    }
  }

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const slope = !linEmpty && !linError && deltaX !== 0 ? deltaY / deltaX : 0;
  const interceptB = !linEmpty && !linError ? y1 - slope * x1 : 0;
  const distance = !linEmpty && !linError ? Math.sqrt(deltaX * deltaX + deltaY * deltaY) : 0;

  const eqStr = `y = ${slope.toFixed(2)}x ${interceptB >= 0 ? `+ ${interceptB.toFixed(2)}` : `- ${Math.abs(interceptB).toFixed(2)}`}`;
  const resultState: 'ready' | 'empty' | 'error' = linError
    ? 'error'
    : linEmpty
      ? 'empty'
      : 'ready';
  const copyText = `Line through (${x1}, ${y1}) & (${x2}, ${y2}): ${eqStr} | Slope m = ${slope.toFixed(4)} | Y-Intercept b = ${interceptB.toFixed(4)} | Distance d = ${distance.toFixed(4)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Two Coordinate Points"
          subtitle="Compute slope, y-intercept, slope-intercept equation, and Euclidean distance."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{toolTabs}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40">
              <span className="text-xs font-semibold text-text-secondary block">Point 1 (x₁, y₁)</span>
              <div className="grid grid-cols-2 gap-3">
                <ToolFieldGroup label="x₁" htmlFor={x1Id}>
                  <input
                    id={x1Id}
                    type="number"
                    step="any"
                    value={x1Str}
                    onChange={(e) => setX1Str(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="1"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label="y₁" htmlFor={y1Id}>
                  <input
                    id={y1Id}
                    type="number"
                    step="any"
                    value={y1Str}
                    onChange={(e) => setY1Str(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="2"
                  />
                </ToolFieldGroup>
              </div>
            </div>

            <div className="space-y-3 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40">
              <span className="text-xs font-semibold text-text-secondary block">Point 2 (x₂, y₂)</span>
              <div className="grid grid-cols-2 gap-3">
                <ToolFieldGroup label="x₂" htmlFor={x2Id} error={x2Error}>
                  <input
                    id={x2Id}
                    type="number"
                    step="any"
                    value={x2Str}
                    onChange={(e) => setX2Str(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="4"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label="y₂" htmlFor={y2Id}>
                  <input
                    id={y2Id}
                    type="number"
                    step="any"
                    value={y2Str}
                    onChange={(e) => setY2Str(e.target.value)}
                    className="ui-input font-mono tabular-nums"
                    placeholder="8"
                  />
                </ToolFieldGroup>
              </div>
            </div>
          </div>

          <p className="text-xs font-mono text-text-tertiary">
            Slope: m = (y₂ - y₁) / (x₂ - x₁), Y-intercept: b = y₁ - m·x₁
          </p>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Line Properties"
          state={resultState}
          primaryLabel="Slope-Intercept Equation"
          primaryValue={eqStr}
          copyText={copyText}
          emptyTitle="Enter two coordinate points"
          emptyDescription="Provide coordinates for Point 1 and Point 2 to compute the line equation."
          errorTitle="Undefined slope"
          errorMessage={linError}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Slope m" value={slope.toFixed(4)} accent />
            <ToolMetricTile label="Y-Intercept b" value={interceptB.toFixed(4)} />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Slope m', value: slope.toFixed(4) },
              { label: 'Y-Intercept b', value: interceptB.toFixed(4) },
              { label: 'Euclidean Distance d', value: distance.toFixed(4), highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
