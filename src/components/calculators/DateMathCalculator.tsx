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

function getOneYearLaterIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 365);
  return d.toISOString().split('T')[0];
}

function parseIsoDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

export default function DateMathCalculator() {
  const [startDate, setStartDate] = useState<string>(() => getTodayIso());
  const [endDate, setEndDate] = useState<string>(() => getOneYearLaterIso());
  const [baseDate, setBaseDate] = useState<string>(() => getTodayIso());
  const [daysToAddStr, setDaysToAddStr] = useState<string>('30');

  const startDateId = useId();
  const endDateId = useId();
  const baseDateId = useId();
  const daysToAddId = useId();

  const handleReset = () => {
    const today = getTodayIso();
    setStartDate(today);
    setEndDate(getOneYearLaterIso());
    setBaseDate(today);
    setDaysToAddStr('30');
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setBaseDate('');
    setDaysToAddStr('');
  };

  // Date Difference validation & calculation
  const diffEmpty = startDate.trim() === '' || endDate.trim() === '';
  const d1 = parseIsoDate(startDate);
  const d2 = parseIsoDate(endDate);
  const startError = startDate.trim() !== '' && !d1 ? 'Enter a valid start date.' : '';
  const endError = endDate.trim() !== '' && !d2 ? 'Enter a valid end date.' : '';
  const diffError = startError || endError;

  let totalCalendarDays = 0;
  let totalWeeks = 0;
  let remainingDaysAfterWeeks = 0;
  let years = 0;
  let months = 0;
  let days = 0;
  let totalHours = 0;
  let businessDays = 0;
  let weekendDays = 0;

  if (d1 && d2) {
    const start = d1 <= d2 ? d1 : d2;
    const end = d1 <= d2 ? d2 : d1;

    const diffMs = end.getTime() - start.getTime();
    totalCalendarDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    totalWeeks = Math.floor(totalCalendarDays / 7);
    remainingDaysAfterWeeks = totalCalendarDays % 7;
    totalHours = totalCalendarDays * 24;

    years = end.getFullYear() - start.getFullYear();
    months = end.getMonth() - start.getMonth();
    days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonthDate.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Cap loop defensively for extreme multi-century ranges to avoid UI freeze
    if (totalCalendarDays <= 365000) {
      const cur = new Date(start);
      while (cur < end) {
        cur.setDate(cur.getDate() + 1);
        const dayOfWeek = cur.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendDays++;
        } else {
          businessDays++;
        }
      }
    } else {
      businessDays = Math.round((totalCalendarDays * 5) / 7);
      weekendDays = totalCalendarDays - businessDays;
    }
  }

  // Date Addition / Subtraction validation & calculation
  const addEmpty = baseDate.trim() === '' || daysToAddStr.trim() === '';
  const bDate = parseIsoDate(baseDate);
  const daysToAdd = Number(daysToAddStr);
  const baseDateError = baseDate.trim() !== '' && !bDate ? 'Enter a valid anchor date.' : '';
  const daysAddError =
    daysToAddStr.trim() !== '' && (!Number.isFinite(daysToAdd) || Math.abs(daysToAdd) > 365000)
      ? 'Enter a day offset within ±365,000 days.'
      : '';
  const addError = baseDateError || daysAddError;

  let targetCalculatedDate = '';
  if (bDate && !addEmpty && !addError) {
    const resultD = new Date(bDate);
    resultD.setDate(resultD.getDate() + Math.trunc(daysToAdd));
    targetCalculatedDate = resultD.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const anyError = diffError || addError;
  const bothEmpty = diffEmpty && addEmpty;
  const resultState: 'ready' | 'empty' | 'error' = anyError
    ? 'error'
    : bothEmpty
      ? 'empty'
      : 'ready';

  const breakdownHeading = `${years} years, ${months} months, ${days} days`;
  const copyText = [
    !diffEmpty && !diffError
      ? `Date Difference (${startDate} to ${endDate}): ${breakdownHeading} (${totalCalendarDays.toLocaleString()} calendar days, ${businessDays} business days, ${totalHours.toLocaleString()} hrs)`
      : '',
    !addEmpty && !addError && targetCalculatedDate
      ? `Anchor ${baseDate} ${daysToAdd >= 0 ? `+${daysToAdd}` : daysToAdd} days = ${targetCalculatedDate}`
      : ''
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Date Difference & Offset Inputs"
          subtitle="Measure exact elapsed time including business days, or add/subtract calendar days from an anchor date."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-primary">
              Date Difference (Between Two Dates)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Start Date" htmlFor={startDateId} error={startError}>
                <input
                  id={startDateId}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="End Date" htmlFor={endDateId} error={endError}>
                <input
                  id={endDateId}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-3">
            <h3 className="text-xs font-semibold text-text-primary">
              Add / Subtract Days from Date
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Starting Anchor Date" htmlFor={baseDateId} error={baseDateError}>
                <input
                  id={baseDateId}
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>
              <ToolFieldGroup
                label="Days to Add"
                htmlFor={daysToAddId}
                hint="Use negative numbers to subtract"
                error={daysAddError}
              >
                <input
                  id={daysToAddId}
                  type="number"
                  step="1"
                  value={daysToAddStr}
                  onChange={(e) => setDaysToAddStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="30"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Date Calculation Summary"
          state={resultState}
          primaryLabel={!diffEmpty && !diffError ? 'Exact Breakdown (Leap Year Accurate)' : 'Calculated Future / Past Date'}
          primaryValue={!diffEmpty && !diffError ? breakdownHeading : targetCalculatedDate}
          primarySubtext={
            !diffEmpty && !diffError
              ? `${totalCalendarDays.toLocaleString()} calendar days (${businessDays.toLocaleString()} business days, ${weekendDays.toLocaleString()} weekend days)`
              : `${daysToAdd >= 0 ? `+${daysToAdd}` : daysToAdd} calendar days from anchor date`
          }
          copyText={copyText}
          emptyTitle="Select dates to calculate"
          emptyDescription="Choose start and end dates for a duration breakdown, or an anchor date and day offset."
          errorTitle="Invalid date input"
          errorMessage={anyError}
        >
          {!diffEmpty && !diffError && (
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile
                label="Total Calendar Days"
                value={`${totalCalendarDays.toLocaleString()} days`}
                accent
              />
              <ToolMetricTile
                label="Business Days (Mon–Fri)"
                value={`${businessDays.toLocaleString()} days`}
                accent
              />
              <ToolMetricTile
                label="Total Weeks"
                value={`${totalWeeks} wks${remainingDaysAfterWeeks > 0 ? ` + ${remainingDaysAfterWeeks}d` : ''}`}
              />
              <ToolMetricTile
                label="Total Hours"
                value={`${totalHours.toLocaleString()} hrs`}
              />
            </div>
          )}

          {!addEmpty && !addError && targetCalculatedDate && (
            <ToolBreakdownList
              items={[
                { label: 'Calculated Future / Past Date', value: targetCalculatedDate, highlight: true },
                {
                  label: 'Offset Applied',
                  value: `${daysToAdd >= 0 ? `+${daysToAdd}` : daysToAdd} calendar days from ${baseDate}`
                }
              ]}
            />
          )}
        </ToolResultsPanel>
      }
    />
  );
}
