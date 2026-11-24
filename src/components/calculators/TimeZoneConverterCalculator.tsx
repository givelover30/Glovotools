import { useMemo, useState } from 'react';
import { ArrowRightLeft, Clock } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const IANA_TIME_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Zurich',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland'
];

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    const parts = formatter.formatToParts(date);
    const map: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = Number(part.value);
      }
    }
    const asUtc = Date.UTC(
      map.year,
      (map.month || 1) - 1,
      map.day || 1,
      map.hour === 24 ? 0 : map.hour || 0,
      map.minute || 0,
      map.second || 0
    );
    const utcTruncated = Math.floor(date.getTime() / 1000) * 1000;
    return Math.round((asUtc - utcTruncated) / 60000);
  } catch {
    return 0;
  }
}

function formatOffsetMinutes(diffMins: number): string {
  const absMins = Math.abs(diffMins);
  const hours = Math.floor(absMins / 60);
  const mins = absMins % 60;
  const sign = diffMins >= 0 ? '+' : '-';
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getFormattedOffset(timeZone: string, date = new Date()): string {
  return formatOffsetMinutes(getTimeZoneOffsetMinutes(timeZone, date));
}

function zonedWallTimeToUtcDate(dateStr: string, timeStr: string, timeZone: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr.trim());
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const second = timeMatch[3] ? Number(timeMatch[3]) : 0;

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    return null;
  }

  // Validate real calendar date (reject e.g. 2026-02-30)
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    Number.isNaN(check.getTime()) ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  // Two-pass offset adjustment accurately resolves DST transitions in sourceTz
  const wallAsUtcMs = check.getTime();
  const offset1 = getTimeZoneOffsetMinutes(timeZone, new Date(wallAsUtcMs));
  const candidate1 = new Date(wallAsUtcMs - offset1 * 60000);
  const offset2 = getTimeZoneOffsetMinutes(timeZone, candidate1);
  return new Date(wallAsUtcMs - offset2 * 60000);
}

function getDateKeyInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function getZoneClockParts(date: Date, timeZone: string): { dateStr: string; timeStr: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  const hour = map.hour === '24' ? '00' : map.hour || '00';
  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    timeStr: `${hour}:${map.minute || '00'}`
  };
}

function resolveInitialSourceTz(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected && IANA_TIME_ZONES.includes(detected)) return detected;
  } catch {
    // Fallback below
  }
  return 'UTC';
}

export default function TimeZoneConverterCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const locale = isEs ? 'es-ES' : 'en-US';

  const initialSourceTz = useMemo(() => resolveInitialSourceTz(), []);
  const initialClock = useMemo(() => getZoneClockParts(new Date(), initialSourceTz), [initialSourceTz]);

  const [sourceTz, setSourceTz] = useState<string>(initialSourceTz);
  const [targetTz, setTargetTz] = useState<string>('Europe/London');
  const [inputDate, setInputDate] = useState<string>(initialClock.dateStr);
  const [inputTime, setInputTime] = useState<string>(initialClock.timeStr);

  const timeZoneOptions = useMemo(() => {
    const refDate = new Date();
    return IANA_TIME_ZONES.map((tz) => {
      const offset = getFormattedOffset(tz, refDate);
      return {
        id: tz,
        label: `${tz} (${offset})`,
        offset
      };
    });
  }, []);

  const conversion = useMemo(() => {
    if (!inputDate.trim() || !inputTime.trim()) {
      return { state: 'empty' as const };
    }

    const utcInstant = zonedWallTimeToUtcDate(inputDate, inputTime, sourceTz);
    if (!utcInstant || Number.isNaN(utcInstant.getTime())) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Ingresa una fecha (AAAA-MM-DD) y hora (HH:MM) válidas.'
          : 'Enter a valid date (YYYY-MM-DD) and time (HH:MM).'
      };
    }

    const fullFormatter = (tz: string) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        dateStyle: 'full',
        timeStyle: 'medium'
      }).format(utcInstant);

    const timeOnlyFormatter = (tz: string) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(utcInstant);

    const sourceOffsetMins = getTimeZoneOffsetMinutes(sourceTz, utcInstant);
    const targetOffsetMins = getTimeZoneOffsetMinutes(targetTz, utcInstant);
    const deltaMins = targetOffsetMins - sourceOffsetMins;
    const deltaSign = deltaMins >= 0 ? '+' : '-';
    const deltaAbs = Math.abs(deltaMins);
    const deltaHours = Math.floor(deltaAbs / 60);
    const deltaRemMins = deltaAbs % 60;
    const deltaFormatted =
      deltaRemMins === 0
        ? `${deltaSign}${deltaHours}h`
        : `${deltaSign}${deltaHours}h ${String(deltaRemMins).padStart(2, '0')}m`;

    const srcDateKey = getDateKeyInZone(utcInstant, sourceTz);
    const tgtDateKey = getDateKeyInZone(utcInstant, targetTz);
    const srcDayMs = Date.parse(`${srcDateKey}T00:00:00Z`);
    const tgtDayMs = Date.parse(`${tgtDateKey}T00:00:00Z`);
    const dayShift = Math.round((tgtDayMs - srcDayMs) / 86400000);

    const dayBoundaryLabel =
      dayShift === 0
        ? isEs
          ? 'Mismo día'
          : 'Same day'
        : dayShift > 0
          ? isEs
            ? `Día siguiente (+${dayShift}d)`
            : `Next day (+${dayShift}d)`
          : isEs
            ? `Día anterior (${dayShift}d)`
            : `Previous day (${dayShift}d)`;

    const sourceFormatted = fullFormatter(sourceTz);
    const targetFormatted = fullFormatter(targetTz);
    const targetClock = timeOnlyFormatter(targetTz);
    const sourceClock = timeOnlyFormatter(sourceTz);
    const sourceOffsetLabel = formatOffsetMinutes(sourceOffsetMins);
    const targetOffsetLabel = formatOffsetMinutes(targetOffsetMins);

    return {
      state: 'ready' as const,
      sourceFormatted,
      targetFormatted,
      sourceClock,
      targetClock,
      sourceOffsetLabel,
      targetOffsetLabel,
      deltaFormatted,
      dayShift,
      dayBoundaryLabel,
      isoUtc: utcInstant.toISOString(),
      copyText: `${targetTz} (${targetOffsetLabel}): ${targetFormatted} | ${sourceTz} (${sourceOffsetLabel}): ${sourceFormatted}`
    };
  }, [inputDate, inputTime, sourceTz, targetTz, locale, isEs]);

  const handleSwap = () => {
    setSourceTz(targetTz);
    setTargetTz(sourceTz);
  };

  const handleSetNow = () => {
    const parts = getZoneClockParts(new Date(), sourceTz);
    setInputDate(parts.dateStr);
    setInputTime(parts.timeStr);
  };

  const handleClear = () => {
    setInputDate('');
    setInputTime('');
  };

  const handleReset = () => {
    const resetTz = resolveInitialSourceTz();
    const parts = getZoneClockParts(new Date(), resetTz);
    setSourceTz(resetTz);
    setTargetTz('Europe/London');
    setInputDate(parts.dateStr);
    setInputTime(parts.timeStr);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Zonas horarias y fecha' : 'Time Zones & Date'}
          subtitle={
            isEs
              ? 'Convierte fechas y horas con precisión entre zonas IANA incluyendo horario de verano (DST).'
              : 'Convert dates and times accurately across IANA zones with automatic DST handling.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Zona horaria de origen' : 'Source Time Zone'}
              htmlFor="tz-source-select"
              unit={
                conversion.state === 'ready'
                  ? conversion.sourceOffsetLabel
                  : getFormattedOffset(sourceTz)
              }
            >
              <select
                id="tz-source-select"
                value={sourceTz}
                onChange={(e) => setSourceTz(e.target.value)}
                className="ui-select"
              >
                {timeZoneOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Zona horaria de destino' : 'Target Time Zone'}
              htmlFor="tz-target-select"
              unit={
                conversion.state === 'ready'
                  ? conversion.targetOffsetLabel
                  : getFormattedOffset(targetTz)
              }
            >
              <select
                id="tz-target-select"
                value={targetTz}
                onChange={(e) => setTargetTz(e.target.value)}
                className="ui-select"
              >
                {timeZoneOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Fecha en zona de origen' : 'Date in Source Zone'}
              htmlFor="tz-input-date"
            >
              <input
                id="tz-input-date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="ui-input font-mono tabular-nums"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Hora en zona de origen' : 'Time in Source Zone'}
              htmlFor="tz-input-time"
            >
              <input
                id="tz-input-time"
                type="time"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="ui-input font-mono tabular-nums"
              />
            </ToolFieldGroup>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSwap}
              className="ui-btn-secondary flex-1 min-w-[140px]"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isEs ? 'Intercambiar zonas' : 'Swap Zones'}</span>
            </button>
            <button
              type="button"
              onClick={handleSetNow}
              className="ui-btn-primary flex-1 min-w-[140px]"
            >
              <Clock className="w-4 h-4" />
              <span>{isEs ? 'Hora actual' : 'Current Time'}</span>
            </button>
          </div>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'NYC → Londres (Invierno)' : 'NYC → London (Winter)',
                onSelect: () => {
                  setSourceTz('America/New_York');
                  setTargetTz('Europe/London');
                  setInputDate('2026-01-15');
                  setInputTime('12:00');
                }
              },
              {
                label: isEs ? 'NYC → Londres (DST Verano)' : 'NYC → London (Summer DST)',
                onSelect: () => {
                  setSourceTz('America/New_York');
                  setTargetTz('Europe/London');
                  setInputDate('2026-07-15');
                  setInputTime('12:00');
                }
              },
              {
                label: isEs ? 'UTC → Tokio (Cambio de día)' : 'UTC → Tokyo (Date Rollover)',
                onSelect: () => {
                  setSourceTz('UTC');
                  setTargetTz('Asia/Tokyo');
                  setInputDate('2026-06-10');
                  setInputTime('22:30');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Hora convertida' : 'Converted Time'}
          state={conversion.state}
          emptyTitle={isEs ? 'Ingresa una fecha y hora' : 'Enter a date and time'}
          emptyDescription={
            isEs
              ? 'Selecciona la zona de origen, zona de destino, fecha y hora para ver la conversión exacta.'
              : 'Select source zone, target zone, date, and time to view the exact conversion.'
          }
          errorTitle={isEs ? 'Fecha u hora inválida' : 'Invalid date or time'}
          errorMessage={conversion.state === 'error' ? conversion.errorMessage : undefined}
          primaryLabel={conversion.state === 'ready' ? `${targetTz} (${conversion.targetOffsetLabel})` : undefined}
          primaryValue={conversion.state === 'ready' ? conversion.targetClock : undefined}
          primarySubtext={conversion.state === 'ready' ? conversion.targetFormatted : undefined}
          statusLabel={conversion.state === 'ready' ? conversion.dayBoundaryLabel : undefined}
          statusTone={
            conversion.state === 'ready'
              ? conversion.dayShift === 0
                ? 'accent'
                : 'warning'
              : 'accent'
          }
          copyText={conversion.state === 'ready' ? conversion.copyText : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {conversion.state === 'ready' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolMetricTile
                  label={`${sourceTz} (${conversion.sourceOffsetLabel})`}
                  value={conversion.sourceClock}
                  hint={conversion.sourceFormatted}
                />
                <ToolMetricTile
                  label={isEs ? 'Diferencia horaria' : 'Time Difference'}
                  value={conversion.deltaFormatted}
                  hint={`${conversion.sourceOffsetLabel} → ${conversion.targetOffsetLabel}`}
                  accent
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Origen completo' : 'Source Date & Time',
                    value: conversion.sourceFormatted
                  },
                  {
                    label: isEs ? 'Destino completo' : 'Target Date & Time',
                    value: conversion.targetFormatted,
                    highlight: true
                  },
                  {
                    label: isEs ? 'Instante UTC (ISO 8601)' : 'UTC Instant (ISO 8601)',
                    value: conversion.isoUtc
                  },
                  {
                    label: isEs ? 'Estándar' : 'Standard',
                    value: isEs ? 'IANA TZDB (DST automático)' : 'IANA TZDB (DST aware)'
                  }
                ]}
              />
            </>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
