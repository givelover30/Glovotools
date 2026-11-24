import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

const DEFAULT_BIRTH_DATE = '1998-05-15';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>(DEFAULT_BIRTH_DATE);
  const [targetDate, setTargetDate] = useState<string>(() => getTodayIso());

  const birthDateId = useId();
  const targetDateId = useId();

  const bDate = parseIsoDate(birthDate);
  const tDate = parseIsoDate(targetDate);

  const isEmpty = birthDate.trim() === '' || targetDate.trim() === '';
  let dateError = '';

  if (!isEmpty) {
    if (!bDate) {
      dateError = 'Enter a valid date of birth.';
    } else if (!tDate) {
      dateError = 'Enter a valid target date.';
    } else if (tDate < bDate) {
      dateError = 'Target date must be on or after the date of birth.';
    }
  }

  let years = 0;
  let months = 0;
  let days = 0;
  let totalMonths = 0;
  let totalDays = 0;
  let totalWeeks = 0;
  let totalHours = 0;
  let nextBirthdayDays = 0;
  let zodiac = '';
  let bornWeekday = '';

  if (bDate && tDate && tDate >= bDate) {
    const diffTime = tDate.getTime() - bDate.getTime();
    totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    totalWeeks = Math.floor(totalDays / 7);
    totalHours = totalDays * 24;

    let y = tDate.getFullYear() - bDate.getFullYear();
    let m = tDate.getMonth() - bDate.getMonth();
    let d = tDate.getDate() - bDate.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonthLastDay = new Date(tDate.getFullYear(), tDate.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    years = Math.max(0, y);
    months = Math.max(0, m);
    days = Math.max(0, d);
    totalMonths = years * 12 + months;

    const currentYear = tDate.getFullYear();
    let nextBday = new Date(currentYear, bDate.getMonth(), bDate.getDate());
    if (nextBday < tDate) {
      nextBday = new Date(currentYear + 1, bDate.getMonth(), bDate.getDate());
    }
    const bdayDiff = nextBday.getTime() - tDate.getTime();
    nextBirthdayDays = Math.ceil(bdayDiff / (1000 * 60 * 60 * 24));

    const bMonth = bDate.getMonth() + 1;
    const bDay = bDate.getDate();
    if ((bMonth === 3 && bDay >= 21) || (bMonth === 4 && bDay <= 19)) zodiac = 'Aries';
    else if ((bMonth === 4 && bDay >= 20) || (bMonth === 5 && bDay <= 20)) zodiac = 'Taurus';
    else if ((bMonth === 5 && bDay >= 21) || (bMonth === 6 && bDay <= 20)) zodiac = 'Gemini';
    else if ((bMonth === 6 && bDay >= 21) || (bMonth === 7 && bDay <= 22)) zodiac = 'Cancer';
    else if ((bMonth === 7 && bDay >= 23) || (bMonth === 8 && bDay <= 22)) zodiac = 'Leo';
    else if ((bMonth === 8 && bDay >= 23) || (bMonth === 9 && bDay <= 22)) zodiac = 'Virgo';
    else if ((bMonth === 9 && bDay >= 23) || (bMonth === 10 && bDay <= 22)) zodiac = 'Libra';
    else if ((bMonth === 10 && bDay >= 23) || (bMonth === 11 && bDay <= 21)) zodiac = 'Scorpio';
    else if ((bMonth === 11 && bDay >= 22) || (bMonth === 12 && bDay <= 21)) zodiac = 'Sagittarius';
    else if ((bMonth === 12 && bDay >= 22) || (bMonth === 1 && bDay <= 19)) zodiac = 'Capricorn';
    else if ((bMonth === 1 && bDay >= 20) || (bMonth === 2 && bDay <= 18)) zodiac = 'Aquarius';
    else zodiac = 'Pisces';

    bornWeekday = bDate.toLocaleDateString('en-US', { weekday: 'long' });
  }

  const handleReset = () => {
    setBirthDate(DEFAULT_BIRTH_DATE);
    setTargetDate(getTodayIso());
  };

  const handleClear = () => {
    setBirthDate('');
    setTargetDate('');
  };

  const resultState: 'ready' | 'empty' | 'error' = dateError
    ? 'error'
    : isEmpty
      ? 'empty'
      : 'ready';

  const copySummary = `Exact Age: ${years} years, ${months} months, ${days} days (${totalDays.toLocaleString()} total days) | Next birthday: ${nextBirthdayDays === 0 ? 'Today' : `in ${nextBirthdayDays} days`} | Zodiac: ${zodiac}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Date Information"
          subtitle="Select a date of birth and optional reference date."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup
            label="Date of Birth"
            htmlFor={birthDateId}
            error={dateError && !bDate ? dateError : undefined}
          >
            <input
              id={birthDateId}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="ui-input font-mono tabular-nums"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label="Age at Date of"
            htmlFor={targetDateId}
            hint="Defaults to today's date"
            error={dateError && Boolean(bDate) ? dateError : undefined}
          >
            <div className="flex items-center gap-2">
              <input
                id={targetDateId}
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="ui-input font-mono tabular-nums flex-1"
              />
              <button
                type="button"
                onClick={() => setTargetDate(getTodayIso())}
                className="ui-btn-secondary shrink-0 text-xs px-3 py-2"
              >
                Today
              </button>
            </div>
          </ToolFieldGroup>

          <ToolPresetBar
            label="Quick dates:"
            presets={[
              {
                label: 'May 15, 1998',
                onSelect: () => {
                  setBirthDate('1998-05-15');
                  setTargetDate(getTodayIso());
                }
              },
              {
                label: 'Jan 1, 2000',
                onSelect: () => {
                  setBirthDate('2000-01-01');
                  setTargetDate(getTodayIso());
                }
              },
              {
                label: 'Jul 4, 1985',
                onSelect: () => {
                  setBirthDate('1985-07-04');
                  setTargetDate(getTodayIso());
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Exact Age Summary"
          state={resultState}
          primaryLabel="Chronological Age"
          primaryValue={`${years}`}
          primaryUnit={`years, ${months} months, ${days} days`}
          primarySubtext={bornWeekday ? `Born on a ${bornWeekday}` : undefined}
          statusLabel={zodiac || undefined}
          statusTone="accent"
          copyText={copySummary}
          emptyTitle="Select a date of birth"
          emptyDescription="Choose both a birth date and a target date to compute exact chronological age."
          errorTitle="Invalid date range"
          errorMessage={dateError || 'Please verify both dates.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Next Birthday"
              value={nextBirthdayDays === 0 ? 'Today' : `In ${nextBirthdayDays} days`}
              accent={nextBirthdayDays === 0}
            />
            <ToolMetricTile
              label="Astrological Sign"
              value={zodiac || '—'}
              hint={bornWeekday ? `Born on ${bornWeekday}` : undefined}
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Total Months', value: `${totalMonths.toLocaleString()} months` },
              { label: 'Total Weeks', value: `${totalWeeks.toLocaleString()} weeks` },
              { label: 'Total Days', value: `${totalDays.toLocaleString()} days`, highlight: true },
              { label: 'Total Hours Lived', value: `~${totalHours.toLocaleString()} hours` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
