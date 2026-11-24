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

export default function PregnancyDueDateCalculator() {
  const [lmpDate, setLmpDate] = useState<string>(() => getTodayIso());
  const [cycleLengthStr, setCycleLengthStr] = useState<string>(DEFAULT_CYCLE_LENGTH);

  const lmpId = useId();
  const cycleId = useId();

  const handleReset = () => {
    setLmpDate(getTodayIso());
    setCycleLengthStr(DEFAULT_CYCLE_LENGTH);
  };

  const handleClear = () => {
    setLmpDate('');
    setCycleLengthStr('');
  };

  const isEmpty = lmpDate.trim() === '' || cycleLengthStr.trim() === '';
  const cycleLength = Number(cycleLengthStr);

  const errors: Record<string, string> = {};
  const lmp = new Date(lmpDate);

  if (!isEmpty) {
    if (Number.isNaN(lmp.getTime())) {
      errors.lmpDate = 'Please enter a valid Last Menstrual Period (LMP) date.';
    }
    if (!Number.isFinite(cycleLength) || cycleLength < 15 || cycleLength > 60) {
      errors.cycleLength = 'Average cycle length must be between 15 and 60 days.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let eddFormatted = '';
  let currentWeeks = 0;
  let currentDays = 0;

  if (!isEmpty && !hasErrors) {
    const edd = new Date(lmp.getTime());
    edd.setDate(edd.getDate() + 280 + (cycleLength - 28));
    eddFormatted = edd.toLocaleDateString();

    const today = new Date();
    const diffTime = today.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    currentWeeks = Math.max(0, Math.floor(diffDays / 7));
    currentDays = Math.max(0, diffDays % 7);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Pregnancy Due Date Estimate — Estimated Due Date (EDD): ${eddFormatted} | Current Gestational Age: ${currentWeeks} weeks, ${currentDays} days | Method: Naegele's Rule (280 Days, ${cycleLength}-day cycle)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Pregnancy Calculation Inputs"
          subtitle="Estimate due date and gestational age using Last Menstrual Period (LMP) and Naegele's Rule."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="First Day of Last Menstrual Period (LMP)"
              htmlFor={lmpId}
              error={errors.lmpDate}
            >
              <input
                id={lmpId}
                type="date"
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
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

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary space-y-1">
            <p>
              <strong className="text-text-primary">Browser-Local Privacy:</strong> All calculations
              occur 100% locally in your browser. No personal health data is collected or
              transmitted.
            </p>
            <p>
              <strong className="text-text-primary">Clinical Disclaimer:</strong> Estimated due
              dates are informational approximations based on Naegele&apos;s Rule (280 days) and are
              not guaranteed delivery dates or a substitute for clinical prenatal care.
            </p>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Pregnancy Due Date Summary"
          state={resultState}
          primaryLabel="Estimated Due Date (EDD)"
          primaryValue={eddFormatted}
          primarySubtext={`Estimated using Naegele's Rule (280 days, adjusted for ${cycleLength}-day cycle)`}
          statusLabel="Informational Estimate"
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter LMP date & cycle length"
          emptyDescription="Select the first day of your last menstrual period and enter your average cycle length to estimate due date."
          errorTitle="Invalid date or cycle length"
          errorMessage={Object.values(errors)[0] || 'Check the LMP date and average cycle length.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Current Gestational Age"
              value={`${currentWeeks} weeks, ${currentDays} days`}
            />
            <ToolMetricTile
              label="Calculation Method"
              value="Naegele's Rule"
              hint="280 Days"
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Estimated Due Date (EDD)',
                value: eddFormatted,
                highlight: true
              },
              {
                label: 'Current Gestational Age',
                value: `${currentWeeks} weeks, ${currentDays} days`
              },
              {
                label: 'Calculation Method',
                value: "Naegele's Rule (280 Days)"
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
