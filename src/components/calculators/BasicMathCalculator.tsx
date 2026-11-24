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

type Mode = 'percentage-of' | 'percentage-change' | 'fraction';
type FractionOp = '+' | '-' | '×' | '÷';

const DEFAULTS = {
  percentX: '15',
  totalY: '200',
  valFrom: '80',
  valTo: '100',
  num1: '3',
  den1: '4',
  num2: '2',
  den2: '5',
  op: '+' as FractionOp
};

function gcd(a: number, b: number): number {
  const absA = Math.abs(Math.trunc(a));
  const absB = Math.abs(Math.trunc(b));
  return absB === 0 ? absA : gcd(absB, absA % absB);
}

export default function BasicMathCalculator() {
  const [mode, setMode] = useState<Mode>('percentage-of');

  // Percentage of
  const [percentX, setPercentX] = useState<string>(DEFAULTS.percentX);
  const [totalY, setTotalY] = useState<string>(DEFAULTS.totalY);

  // Percentage change
  const [valFrom, setValFrom] = useState<string>(DEFAULTS.valFrom);
  const [valTo, setValTo] = useState<string>(DEFAULTS.valTo);

  // Fraction arithmetic
  const [num1, setNum1] = useState<string>(DEFAULTS.num1);
  const [den1, setDen1] = useState<string>(DEFAULTS.den1);
  const [num2, setNum2] = useState<string>(DEFAULTS.num2);
  const [den2, setDen2] = useState<string>(DEFAULTS.den2);
  const [op, setOp] = useState<FractionOp>(DEFAULTS.op);

  const percentXId = useId();
  const totalYId = useId();
  const valFromId = useId();
  const valToId = useId();
  const num1Id = useId();
  const den1Id = useId();
  const opId = useId();
  const num2Id = useId();
  const den2Id = useId();

  const handleReset = () => {
    if (mode === 'percentage-of') {
      setPercentX(DEFAULTS.percentX);
      setTotalY(DEFAULTS.totalY);
    } else if (mode === 'percentage-change') {
      setValFrom(DEFAULTS.valFrom);
      setValTo(DEFAULTS.valTo);
    } else {
      setNum1(DEFAULTS.num1);
      setDen1(DEFAULTS.den1);
      setNum2(DEFAULTS.num2);
      setDen2(DEFAULTS.den2);
      setOp(DEFAULTS.op);
    }
  };

  const handleClear = () => {
    if (mode === 'percentage-of') {
      setPercentX('');
      setTotalY('');
    } else if (mode === 'percentage-change') {
      setValFrom('');
      setValTo('');
    } else {
      setNum1('');
      setDen1('');
      setNum2('');
      setDen2('');
    }
  };

  // Mode 1: Percentage of Number
  const pX = Number(percentX);
  const tY = Number(totalY);
  const pctOfEmpty = percentX.trim() === '' || totalY.trim() === '';
  const pctOfError =
    !pctOfEmpty && (!Number.isFinite(pX) || !Number.isFinite(tY))
      ? 'Enter valid numeric values for both percentage and total.'
      : '';
  const resultPercentOf = !pctOfEmpty && !pctOfError ? (pX / 100) * tY : 0;

  // Mode 2: Percentage Increase / Decrease
  const vFrom = Number(valFrom);
  const vTo = Number(valTo);
  const pctChgEmpty = valFrom.trim() === '' || valTo.trim() === '';
  let pctChgFromError = '';
  let pctChgToError = '';
  if (!pctChgEmpty) {
    if (!Number.isFinite(vFrom)) pctChgFromError = 'Enter a valid original value.';
    else if (vFrom === 0) pctChgFromError = 'Original value cannot be 0 (division by zero).';
    if (!Number.isFinite(vTo)) pctChgToError = 'Enter a valid new value.';
  }
  const pctChgError = pctChgFromError || pctChgToError;
  const diff = !pctChgEmpty && !pctChgError ? vTo - vFrom : 0;
  const percentChange = !pctChgEmpty && !pctChgError && vFrom !== 0 ? (diff / Math.abs(vFrom)) * 100 : 0;

  // Mode 3: Fraction Arithmetic
  const n1 = Number(num1);
  const d1 = Number(den1);
  const n2 = Number(num2);
  const d2 = Number(den2);
  const fracEmpty =
    num1.trim() === '' || den1.trim() === '' || num2.trim() === '' || den2.trim() === '';

  let den1Error = '';
  let den2Error = '';
  let num2Error = '';
  let fracGeneralError = '';

  if (!fracEmpty) {
    if (!Number.isFinite(n1) || !Number.isFinite(d1) || !Number.isFinite(n2) || !Number.isFinite(d2)) {
      fracGeneralError = 'Enter valid numeric values for all fraction fields.';
    } else {
      if (d1 === 0) den1Error = 'Denominator 1 cannot be 0.';
      if (d2 === 0) den2Error = 'Denominator 2 cannot be 0.';
      if (op === '÷' && n2 === 0) num2Error = 'Cannot divide by a fraction with numerator 0.';
    }
  }
  const fracError = fracGeneralError || den1Error || den2Error || num2Error;

  let fracResNum = 0;
  let fracResDen = 1;
  if (!fracEmpty && !fracError) {
    if (op === '+') {
      fracResNum = n1 * d2 + n2 * d1;
      fracResDen = d1 * d2;
    } else if (op === '-') {
      fracResNum = n1 * d2 - n2 * d1;
      fracResDen = d1 * d2;
    } else if (op === '×') {
      fracResNum = n1 * n2;
      fracResDen = d1 * d2;
    } else if (op === '÷') {
      fracResNum = n1 * d2;
      fracResDen = d1 * n2;
    }
  }

  const isIntegerFrac = Number.isInteger(fracResNum) && Number.isInteger(fracResDen);
  const commonDiv = isIntegerFrac ? gcd(fracResNum, fracResDen) : 1;
  const simplifiedNum = fracResNum / (commonDiv || 1);
  const simplifiedDen = fracResDen / (commonDiv || 1);
  const decimalVal = fracResDen !== 0 ? fracResNum / fracResDen : 0;

  const modeTabs = (
    <ToolSegmentedControl
      ariaLabel="Calculation mode"
      value={mode}
      onChange={setMode}
      options={[
        { value: 'percentage-of', label: 'Percentage of Number' },
        { value: 'percentage-change', label: 'Percentage Increase / Decrease' },
        { value: 'fraction', label: 'Fraction Arithmetic' }
      ]}
    />
  );

  if (mode === 'percentage-of') {
    const resultState: 'ready' | 'empty' | 'error' = pctOfError
      ? 'error'
      : pctOfEmpty
        ? 'empty'
        : 'ready';
    const formattedMain = String(Number(resultPercentOf.toFixed(4)));
    const copyText = `${pX}% of ${tY} = ${formattedMain} (${resultPercentOf.toFixed(2)})`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Input Values"
            subtitle="Compute any percentage of a base number."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Percentage"
                htmlFor={percentXId}
                unit="%"
                error={!pctOfEmpty && !Number.isFinite(pX) ? 'Enter a valid number.' : undefined}
              >
                <input
                  id={percentXId}
                  type="number"
                  step="any"
                  value={percentX}
                  onChange={(e) => setPercentX(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="15"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Of Total"
                htmlFor={totalYId}
                error={!pctOfEmpty && !Number.isFinite(tY) ? 'Enter a valid number.' : undefined}
              >
                <input
                  id={totalYId}
                  type="number"
                  step="any"
                  value={totalY}
                  onChange={(e) => setTotalY(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="200"
                />
              </ToolFieldGroup>
            </div>

            <p className="text-xs font-mono text-text-tertiary pt-1">
              Formula: Result = (P / 100) × Total = ({percentX || 'P'} / 100) × {totalY || 'Total'}
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Calculated Result"
            state={resultState}
            primaryLabel="Result"
            primaryValue={formattedMain}
            primarySubtext={`${pX}% of ${tY} is exactly ${resultPercentOf.toFixed(2)}`}
            copyText={copyText}
            emptyTitle="Enter percentage and total"
            emptyDescription="Provide both values on the left to calculate the result."
            errorTitle="Invalid input"
            errorMessage={pctOfError}
          >
            <ToolBreakdownList
              items={[
                { label: 'Percentage (P)', value: `${pX}%` },
                { label: 'Base Total', value: `${tY}` },
                { label: 'Exact (2 decimals)', value: resultPercentOf.toFixed(2), highlight: true }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  if (mode === 'percentage-change') {
    const resultState: 'ready' | 'empty' | 'error' = pctChgError
      ? 'error'
      : pctChgEmpty
        ? 'empty'
        : 'ready';
    const sign = percentChange >= 0 ? '+' : '';
    const formattedPct = `${sign}${percentChange.toFixed(2)}%`;
    const copyText = `Percent Change from ${vFrom} to ${vTo}: ${formattedPct} (Difference: ${diff >= 0 ? `+${diff}` : diff})`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Initial & Final Values"
            subtitle="Measure percentage increase or decrease between two values."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Original Value" htmlFor={valFromId} error={pctChgFromError}>
                <input
                  id={valFromId}
                  type="number"
                  step="any"
                  value={valFrom}
                  onChange={(e) => setValFrom(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="80"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label="New Value" htmlFor={valToId} error={pctChgToError}>
                <input
                  id={valToId}
                  type="number"
                  step="any"
                  value={valTo}
                  onChange={(e) => setValTo(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="100"
                />
              </ToolFieldGroup>
            </div>

            <p className="text-xs font-mono text-text-tertiary pt-1">
              Formula: ((New - Old) / |Old|) × 100 = (({valTo || 'New'} - {valFrom || 'Old'}) /{' '}
              {!pctChgEmpty && Number.isFinite(vFrom) ? Math.abs(vFrom) : '|Old|'}) × 100
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Percent Change"
            state={resultState}
            primaryLabel="Percentage Change"
            primaryValue={formattedPct}
            statusLabel={percentChange >= 0 ? 'Increase' : 'Decrease'}
            statusTone={percentChange >= 0 ? 'success' : 'error'}
            copyText={copyText}
            emptyTitle="Enter original and new values"
            emptyDescription="Fill in both values to compute the percentage increase or decrease."
            errorTitle="Cannot compute change"
            errorMessage={pctChgError}
          >
            <ToolBreakdownList
              items={[
                { label: 'Absolute Difference', value: diff >= 0 ? `+${diff}` : `${diff}`, highlight: true },
                { label: 'Direction', value: percentChange >= 0 ? 'Increase' : 'Decrease' }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Fraction Arithmetic mode
  const resultState: 'ready' | 'empty' | 'error' = fracError
    ? 'error'
    : fracEmpty
      ? 'empty'
      : 'ready';
  const copyText = `${n1}/${d1} ${op} ${n2}/${d2} = ${simplifiedNum}/${simplifiedDen} (≈ ${decimalVal.toFixed(4)})`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Fraction Equation"
          subtitle="Add, subtract, multiply, or divide two fractions with automatic simplification."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{modeTabs}</div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5 space-y-2.5 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40">
              <span className="text-xs font-semibold text-text-secondary block">First Fraction</span>
              <ToolFieldGroup label="Numerator 1" htmlFor={num1Id}>
                <input
                  id={num1Id}
                  type="number"
                  step="any"
                  value={num1}
                  onChange={(e) => setNum1(e.target.value)}
                  className="ui-input font-mono tabular-nums text-center"
                  placeholder="3"
                />
              </ToolFieldGroup>
              <div className="h-px bg-border-main w-full" aria-hidden="true" />
              <ToolFieldGroup label="Denominator 1" htmlFor={den1Id} error={den1Error}>
                <input
                  id={den1Id}
                  type="number"
                  step="any"
                  value={den1}
                  onChange={(e) => setDen1(e.target.value)}
                  className="ui-input font-mono tabular-nums text-center"
                  placeholder="4"
                />
              </ToolFieldGroup>
            </div>

            <div className="sm:col-span-2">
              <ToolFieldGroup label="Operator" htmlFor={opId}>
                <select
                  id={opId}
                  value={op}
                  onChange={(e) => setOp(e.target.value as FractionOp)}
                  className="ui-select font-mono font-bold text-center"
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                  <option value="×">×</option>
                  <option value="÷">÷</option>
                </select>
              </ToolFieldGroup>
            </div>

            <div className="sm:col-span-5 space-y-2.5 p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40">
              <span className="text-xs font-semibold text-text-secondary block">Second Fraction</span>
              <ToolFieldGroup label="Numerator 2" htmlFor={num2Id} error={num2Error}>
                <input
                  id={num2Id}
                  type="number"
                  step="any"
                  value={num2}
                  onChange={(e) => setNum2(e.target.value)}
                  className="ui-input font-mono tabular-nums text-center"
                  placeholder="2"
                />
              </ToolFieldGroup>
              <div className="h-px bg-border-main w-full" aria-hidden="true" />
              <ToolFieldGroup label="Denominator 2" htmlFor={den2Id} error={den2Error}>
                <input
                  id={den2Id}
                  type="number"
                  step="any"
                  value={den2}
                  onChange={(e) => setDen2(e.target.value)}
                  className="ui-input font-mono tabular-nums text-center"
                  placeholder="5"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Fraction Result"
          state={resultState}
          primaryLabel="Simplified Fraction"
          primaryValue={`${simplifiedNum} / ${simplifiedDen}`}
          primarySubtext={`Decimal approximation: ≈ ${decimalVal.toFixed(4)}`}
          copyText={copyText}
          emptyTitle="Enter both fractions"
          emptyDescription="Fill in both numerators and denominators to evaluate the fraction equation."
          errorTitle="Invalid fraction"
          errorMessage={fracError}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Decimal Value" value={decimalVal.toFixed(4)} accent />
            <ToolMetricTile label="Simplification Factor" value={`÷ ${commonDiv || 1}`} />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Raw Result', value: `${fracResNum}/${fracResDen}` },
              { label: 'Simplified Form', value: `${simplifiedNum}/${simplifiedDen}`, highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
