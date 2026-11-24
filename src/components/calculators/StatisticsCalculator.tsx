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
  dataInput: '12, 15, 18, 22, 25, 25, 29, 34, 40',
  n: '10',
  r: '3'
};

function fact(num: number): number {
  if (num < 0) return 0;
  if (num === 0 || num === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(num, 170); i++) res *= i;
  return res;
}

export default function StatisticsCalculator() {
  const [dataInput, setDataInput] = useState<string>(DEFAULTS.dataInput);
  const [nStr, setNStr] = useState<string>(DEFAULTS.n);
  const [rStr, setRStr] = useState<string>(DEFAULTS.r);

  const dataId = useId();
  const nId = useId();
  const rId = useId();

  const handleReset = () => {
    setDataInput(DEFAULTS.dataInput);
    setNStr(DEFAULTS.n);
    setRStr(DEFAULTS.r);
  };

  const handleClear = () => {
    setDataInput('');
    setNStr('');
    setRStr('');
  };

  // Parse dataset
  const dataTrimmed = dataInput.trim();
  const tokens = dataTrimmed === '' ? [] : dataTrimmed.split(/[\s,]+/).filter(Boolean);
  const numbers = tokens.map((s) => Number(s)).filter((num) => Number.isFinite(num));
  const dataError =
    dataTrimmed !== '' && numbers.length === 0
      ? 'Enter valid numbers separated by commas or spaces.'
      : '';

  const count = numbers.length;
  let mean = 0;
  let median = 0;
  let varianceSample = 0;
  let stdDevSample = 0;
  let stdDevPop = 0;
  let min = 0;
  let max = 0;
  let range = 0;
  let sum = 0;

  if (count > 0) {
    sum = numbers.reduce((acc, curr) => acc + curr, 0);
    mean = sum / count;

    const sorted = [...numbers].sort((a, b) => a - b);
    min = sorted[0];
    max = sorted[sorted.length - 1];
    range = max - min;

    const mid = Math.floor(count / 2);
    median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const sumSquaredDiffs = numbers.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
    varianceSample = count > 1 ? sumSquaredDiffs / (count - 1) : 0;
    stdDevSample = Math.sqrt(varianceSample);
    stdDevPop = Math.sqrt(sumSquaredDiffs / count);
  }

  // Combinatorics validation
  const combEmpty = nStr.trim() === '' || rStr.trim() === '';
  const nVal = Number(nStr);
  const rVal = Number(rStr);
  let nError = '';
  let rError = '';
  if (!combEmpty) {
    if (!Number.isInteger(nVal) || nVal < 0 || nVal > 170) {
      nError = 'Enter a whole number between 0 and 170.';
    }
    if (!Number.isInteger(rVal) || rVal < 0 || rVal > 170) {
      rError = 'Enter a whole number between 0 and 170.';
    } else if (!nError && rVal > nVal) {
      rError = 'Chosen items r cannot exceed total items n.';
    }
  }
  const combValid = !combEmpty && !nError && !rError;
  const nPr = combValid ? fact(nVal) / fact(nVal - rVal) : 0;
  const nCr = combValid ? fact(nVal) / (fact(rVal) * fact(nVal - rVal)) : 0;

  const isEmpty = dataTrimmed === '';
  const resultState: 'ready' | 'empty' | 'error' = dataError ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = `Dataset (N=${count}): Mean = ${mean.toFixed(3)}, Median = ${median.toFixed(3)}, Sample Std Dev = ${stdDevSample.toFixed(3)}, Variance = ${varianceSample.toFixed(3)}, Pop Std Dev = ${stdDevPop.toFixed(3)}, Sum = ${sum.toLocaleString()}, Min/Max = ${min}/${max}${combValid ? ` | ${nVal}P${rVal} = ${nPr.toLocaleString()}, ${nVal}C${rVal} = ${nCr.toLocaleString()}` : ''}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Descriptive Statistics & Combinatorics"
          subtitle="Paste a comma- or space-separated dataset and optionally compute permutations and combinations."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup
            label="Enter numbers (comma or space separated)"
            htmlFor={dataId}
            hint={count > 0 ? `Detected ${count} valid data points` : undefined}
            error={dataError}
          >
            <textarea
              id={dataId}
              rows={3}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              className="ui-input font-mono text-sm min-h-[88px] py-2.5"
              placeholder="e.g. 5, 8, 12, 19, 24"
            />
          </ToolFieldGroup>

          <div className="pt-4 border-t border-border-subtle space-y-4">
            <h3 className="text-xs font-semibold text-text-primary">
              Permutations & Combinations (nPr, nCr)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Total items n" htmlFor={nId} error={nError}>
                <input
                  id={nId}
                  type="number"
                  min="0"
                  max="170"
                  step="1"
                  value={nStr}
                  onChange={(e) => setNStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="10"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Chosen items r" htmlFor={rId} error={rError}>
                <input
                  id={rId}
                  type="number"
                  min="0"
                  max="170"
                  step="1"
                  value={rStr}
                  onChange={(e) => setRStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="3"
                />
              </ToolFieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ToolMetricTile
                label="nPr (Permutations)"
                value={combValid && Number.isFinite(nPr) ? nPr.toLocaleString() : '—'}
              />
              <ToolMetricTile
                label="nCr (Combinations)"
                value={combValid && Number.isFinite(nCr) ? nCr.toLocaleString() : '—'}
              />
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Summary Metrics"
          state={resultState}
          primaryLabel="Mean (Average μ)"
          primaryValue={mean.toFixed(3)}
          primarySubtext={`Median: ${median.toFixed(3)} · Range: ${range} (${min} to ${max})`}
          statusLabel={`N = ${count} data points`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter a numeric dataset"
          emptyDescription="Type or paste numbers separated by commas or spaces to view statistical metrics."
          errorTitle="Invalid dataset"
          errorMessage={dataError}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Mean (Average μ)" value={mean.toFixed(3)} accent />
            <ToolMetricTile label="Median (Middle)" value={median.toFixed(3)} accent />
            <ToolMetricTile label="Sample Std Dev (s)" value={stdDevSample.toFixed(3)} />
            <ToolMetricTile label="Sample Variance (s²)" value={varianceSample.toFixed(3)} />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Population Std Dev (σ)', value: stdDevPop.toFixed(3) },
              { label: 'Sum of Values (Σx)', value: sum.toLocaleString(), highlight: true },
              { label: 'Minimum / Maximum', value: `${min} / ${max} (Range: ${range})` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
