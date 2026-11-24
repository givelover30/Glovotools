import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

function getTodayIso(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_CYCLE_LENGTH = '28';

export default function OvulationTrackerCalculator() {
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(() => getTodayIso());
  const [cycleLengthStr, setCycleLengthStr] = useState<string>(DEFAULT_CYCLE_LENGTH);

  const lmpId = useId();
  const cycleId = useId();

  const handleReset = () => {
    setLastPeriodDate(getTodayIso());
    setCycleLengthStr(DEFAULT_CYCLE_LENGTH);
  };

  const handleClear = () => {
    setLastPeriodDate('');
    setCycleLengthStr('');
  };

  const isEmpty = lastPeriodDate.trim() === '' || cycleLengthStr.trim() === '';
  const cycleLength = Number(cycleLengthStr);

  const errors: Record<string, string> = {};
  const lmp = new Date(lastPeriodDate);

  if (!isEmpty) {
    if (Number.isNaN(lmp.getTime())) {
      errors.lastPeriodDate = 'Please enter a valid first day of last period date.';
    }
    if (!Number.isFinite(cycleLength) || cycleLength < 15 || cycleLength > 60) {
      errors.cycleLength = 'Average cycle length must be between 15 and 60 days.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let ovulationFormatted = '';
  let fertileWindowFormatted = '';
  let nextPeriodFormatted = '';

  if (!isEmpty && !hasErrors) {
    const nextPeriod = new Date(lmp.getTime());
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    const ovulationDate = new Date(nextPeriod.getTime());
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    const fertileStart = new Date(ovulationDate.getTime());
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDate.getTime());
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    ovulationFormatted = ovulationDate.toLocaleDateString();
    fertileWindowFormatted = `${fertileStart.toLocaleDateString()} – ${fertileEnd.toLocaleDateString()}`;
    nextPeriodFormatted = nextPeriod.toLocaleDateString();
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Ovulation & Fertile Window Estimate (${cycleLength}-day cycle) — Estimated Ovulation Date: ${ovulationFormatted} | Estimated Fertile Window: ${fertileWindowFormatted} | Next Expected Period: ${nextPeriodFormatted}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Cycle Parameters"
          subtitle="Estimate ovulation date, fertile window, and next expected period from your last period date."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="First Day of Last Period"
              htmlFor={lmpId}
              error={errors.lastPeriodDate}
            >
              <input
                id={lmpId}
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="ui-input font-mono tabular-nums"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Average Cycle Length"
              htmlFor={cycleId}
              unit="days"
              error={errors.cycleLength}
            >
              <input
                id={cycleId}
                type="number"
                min="15"
                max="60"
                step="1"
                value={cycleLengthStr}
                onChange={(e) => setCycleLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="28"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Local Estimation:</strong> Calendar predictions
            are estimates for informational purposes only. Do not rely on calendar methods as
            guaranteed contraception. All calculations run locally in your browser.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Ovulation & Fertile Window Summary"
          state={resultState}
          primaryLabel="Estimated Ovulation Date"
          primaryValue={ovulationFormatted}
          primarySubtext={`Fertile window estimate: ${fertileWindowFormatted}`}
          statusLabel={`${cycleLength}-Day Cycle`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter last period & cycle length"
          emptyDescription="Select the first day of your last period and enter your average cycle length to estimate ovulation dates."
          errorTitle="Invalid cycle inputs"
          errorMessage={Object.values(errors)[0] || 'Check the period date and average cycle length.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Estimated Fertile Window" value={fertileWindowFormatted} />
            <ToolMetricTile label="Next Expected Period" value={nextPeriodFormatted} accent />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Estimated Ovulation Date',
                value: ovulationFormatted,
                highlight: true
              },
              {
                label: 'Estimated Fertile Window',
                value: fertileWindowFormatted
              },
              {
                label: 'Next Expected Period',
                value: nextPeriodFormatted
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
