import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolBreakdownList,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';

const DEFAULT_CRON = '*/5 * * * *';

interface FieldSpec {
  key: 'minute' | 'hour' | 'dom' | 'month' | 'dow';
  labelEn: string;
  labelEs: string;
  min: number;
  max: number;
}

const FIELD_SPECS: FieldSpec[] = [
  { key: 'minute', labelEn: 'Minute', labelEs: 'Minuto', min: 0, max: 59 },
  { key: 'hour', labelEn: 'Hour', labelEs: 'Hora', min: 0, max: 23 },
  { key: 'dom', labelEn: 'Day (Month)', labelEs: 'Día (Mes)', min: 1, max: 31 },
  { key: 'month', labelEn: 'Month', labelEs: 'Mes', min: 1, max: 12 },
  { key: 'dow', labelEn: 'Day (Week)', labelEs: 'Día (Sem.)', min: 0, max: 7 },
];

const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAY_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MONTH_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_ES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

interface FieldParseResult {
  valid: boolean;
  values: Set<number>;
  error?: string;
}

function parseCronField(field: string, spec: FieldSpec, isEs: boolean): FieldParseResult {
  const values = new Set<number>();
  const label = isEs ? spec.labelEs : spec.labelEn;

  if (!field || field.trim() === '') {
    return {
      valid: false,
      values,
      error: isEs ? `${label}: campo vacío.` : `${label}: empty field.`,
    };
  }

  const parts = field.split(',');
  for (const part of parts) {
    if (!part) {
      return {
        valid: false,
        values,
        error: isEs ? `${label}: coma sobrante en "${field}".` : `${label}: trailing comma in "${field}".`,
      };
    }

    const slashParts = part.split('/');
    if (slashParts.length > 2) {
      return {
        valid: false,
        values,
        error: isEs ? `${label}: sintaxis de paso inválida "${part}".` : `${label}: invalid step syntax "${part}".`,
      };
    }

    const base = slashParts[0];
    let step = 1;
    if (slashParts.length === 2) {
      if (!/^\d+$/.test(slashParts[1])) {
        return {
          valid: false,
          values,
          error: isEs ? `${label}: paso no numérico en "${part}".` : `${label}: non-numeric step in "${part}".`,
        };
      }
      step = Number(slashParts[1]);
      if (step < 1) {
        return {
          valid: false,
          values,
          error: isEs ? `${label}: el paso debe ser ≥ 1.` : `${label}: step must be ≥ 1.`,
        };
      }
    }

    let rangeStart = spec.min;
    let rangeEnd = spec.max;

    if (base === '*') {
      rangeStart = spec.min;
      rangeEnd = spec.max;
    } else if (base.includes('-')) {
      const bounds = base.split('-');
      if (bounds.length !== 2 || !/^\d+$/.test(bounds[0]) || !/^\d+$/.test(bounds[1])) {
        return {
          valid: false,
          values,
          error: isEs ? `${label}: rango inválido "${base}".` : `${label}: invalid range "${base}".`,
        };
      }
      rangeStart = Number(bounds[0]);
      rangeEnd = Number(bounds[1]);
      if (rangeStart < spec.min || rangeEnd > spec.max || rangeStart > rangeEnd) {
        return {
          valid: false,
          values,
          error: isEs
            ? `${label}: rango fuera de límites (${spec.min}–${spec.max}).`
            : `${label}: range out of bounds (${spec.min}–${spec.max}).`,
        };
      }
    } else if (/^\d+$/.test(base)) {
      const single = Number(base);
      if (single < spec.min || single > spec.max) {
        return {
          valid: false,
          values,
          error: isEs
            ? `${label}: valor ${single} fuera de rango (${spec.min}–${spec.max}).`
            : `${label}: value ${single} out of range (${spec.min}–${spec.max}).`,
        };
      }
      rangeStart = single;
      rangeEnd = slashParts.length === 2 ? spec.max : single;
    } else {
      return {
        valid: false,
        values,
        error: isEs ? `${label}: token no reconocido "${part}".` : `${label}: unrecognized token "${part}".`,
      };
    }

    for (let v = rangeStart; v <= rangeEnd; v += step) {
      values.add(spec.key === 'dow' && v === 7 ? 0 : v);
    }
  }

  return { valid: true, values };
}

function describeField(raw: string, spec: FieldSpec, isEs: boolean): string {
  if (raw === '*') return isEs ? 'cada valor' : 'every value';
  if (raw.startsWith('*/')) {
    const step = raw.slice(2);
    return isEs ? `cada ${step}` : `every ${step}`;
  }
  if (spec.key === 'dow' && /^\d+$/.test(raw)) {
    const idx = Number(raw);
    return isEs ? WEEKDAY_ES[idx] ?? raw : WEEKDAY_EN[idx] ?? raw;
  }
  if (spec.key === 'month' && /^\d+$/.test(raw)) {
    const idx = Number(raw);
    return isEs ? MONTH_ES[idx] ?? raw : MONTH_EN[idx] ?? raw;
  }
  return raw;
}

function buildHumanSummary(parts: string[], isEs: boolean): string {
  const [min, hr, dom, mon, dow] = parts;

  if (min === '*' && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    return isEs ? 'Cada minuto.' : 'Runs every minute.';
  }
  if (min.startsWith('*/') && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    const n = min.slice(2);
    return isEs ? `Cada ${n} minutos.` : `Runs every ${n} minutes.`;
  }
  if (/^\d+$/.test(min) && hr === '*' && dom === '*' && mon === '*' && dow === '*') {
    return isEs
      ? `Cada hora en el minuto :${min.padStart(2, '0')}.`
      : `Runs every hour at minute :${min.padStart(2, '0')}.`;
  }
  if (/^\d+$/.test(min) && /^\d+$/.test(hr)) {
    const timeStr = `${hr.padStart(2, '0')}:${min.padStart(2, '0')}`;
    if (dom === '*' && mon === '*' && dow === '*') {
      return isEs ? `Todos los días a las ${timeStr}.` : `Runs every day at ${timeStr}.`;
    }
    if (dom === '*' && mon === '*' && dow === '1-5') {
      return isEs
        ? `De lunes a viernes a las ${timeStr}.`
        : `Runs Monday through Friday at ${timeStr}.`;
    }
    if (dom === '*' && mon === '*' && /^\d+$/.test(dow)) {
      const dayName = isEs ? WEEKDAY_ES[Number(dow)] : WEEKDAY_EN[Number(dow)];
      return isEs
        ? `Cada ${dayName} a las ${timeStr}.`
        : `Runs every ${dayName} at ${timeStr}.`;
    }
    if (/^\d+$/.test(dom) && mon === '*' && dow === '*') {
      return isEs
        ? `El día ${dom} de cada mes a las ${timeStr}.`
        : `Runs on day ${dom} of every month at ${timeStr}.`;
    }
  }

  return isEs
    ? `Minuto (${min}), Hora (${hr}), Día del mes (${dom}), Mes (${mon}), Día de semana (${dow}).`
    : `Minute (${min}), Hour (${hr}), Day of month (${dom}), Month (${mon}), Day of week (${dow}).`;
}

function computeNextRuns(parsed: FieldParseResult[], count = 5): string[] {
  const [minSet, hrSet, domSet, monSet, dowSet] = parsed.map((p) => p.values);
  const results: string[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 60 * 24 * 60; // up to 60 days ahead
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const m = cursor.getMonth() + 1;
    const d = cursor.getDate();
    const w = cursor.getDay();
    const h = cursor.getHours();
    const min = cursor.getMinutes();

    if (monSet.has(m) && domSet.has(d) && dowSet.has(w) && hrSet.has(h) && minSet.has(min)) {
      const y = cursor.getFullYear();
      const pad = (n: number) => String(n).padStart(2, '0');
      results.push(`${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}`);
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

export const CronExpressionCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [cron, setCron] = useState<string>(DEFAULT_CRON);

  const analysis = useMemo(() => {
    const trimmed = cron.trim();
    if (!trimmed) {
      return {
        state: 'empty' as const,
        parts: ['', '', '', '', ''],
        errors: [] as string[],
        summary: '',
        nextRuns: [] as string[],
      };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length !== 5) {
      return {
        state: 'error' as const,
        parts: [...parts, '', '', '', '', ''].slice(0, 5),
        errors: [
          isEs
            ? `Se requieren exactamente 5 campos separados por espacios (encontrados: ${parts.length}).`
            : `Exactly 5 space-separated fields are required (found: ${parts.length}).`,
        ],
        summary: '',
        nextRuns: [] as string[],
      };
    }

    const parsedFields = parts.map((p, idx) => parseCronField(p, FIELD_SPECS[idx], isEs));
    const errors = parsedFields.filter((f) => !f.valid && f.error).map((f) => f.error as string);

    if (errors.length > 0) {
      return {
        state: 'error' as const,
        parts,
        errors,
        summary: '',
        nextRuns: [] as string[],
      };
    }

    return {
      state: 'ready' as const,
      parts,
      errors: [] as string[],
      summary: buildHumanSummary(parts, isEs),
      nextRuns: computeNextRuns(parsedFields, 5),
    };
  }, [cron, isEs]);

  const handleFieldChange = (index: number, value: string) => {
    const current = cron.trim() ? cron.trim().split(/\s+/) : ['*', '*', '*', '*', '*'];
    while (current.length < 5) current.push('*');
    const next = current.slice(0, 5);
    next[index] = value.replace(/\s+/g, '') || '*';
    setCron(next.join(' '));
  };

  const handleReset = () => setCron(DEFAULT_CRON);
  const handleClear = () => setCron('');

  const presets = [
    { label: isEs ? 'Cada 5 min' : 'Every 5 min', onSelect: () => setCron('*/5 * * * *') },
    { label: isEs ? 'Cada hora' : 'Hourly', onSelect: () => setCron('0 * * * *') },
    { label: isEs ? 'Diario 00:00' : 'Daily Midnight', onSelect: () => setCron('0 0 * * *') },
    { label: isEs ? 'L–V 09:00' : 'Weekdays 9 AM', onSelect: () => setCron('0 9 * * 1-5') },
    { label: isEs ? 'Mensual día 1' : 'Monthly 1st', onSelect: () => setCron('0 0 1 * *') },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Expresión Cron (5 campos)' : '5-Field Cron Expression'}
      subtitle={
        isEs
          ? 'Valida rangos POSIX (minuto, hora, día del mes, mes, día de semana) y calcula próximas ejecuciones.'
          : 'Validates POSIX 5-field ranges (minute, hour, day-of-month, month, day-of-week) and previews schedules.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Horarios comunes' : 'Common schedules'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'Expresión Completa' : 'Full Cron Expression'}
        htmlFor="cron-full-input"
        error={analysis.state === 'error' ? analysis.errors[0] : undefined}
        hint={
          isEs
            ? 'Soporta *, listas (1,15), rangos (1-5) y pasos (*/5, 0-30/10).'
            : 'Supports *, lists (1,15), ranges (1-5), and steps (*/5, 0-30/10).'
        }
      >
        <input
          id="cron-full-input"
          type="text"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="*/5 * * * *"
          className="ui-input font-mono text-base tracking-wider"
        />
      </ToolFieldGroup>

      {/* Responsive 2-col on mobile, 5-col on sm+ */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
          {isEs ? 'Edición por Campo' : 'Field-by-Field Editor'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {FIELD_SPECS.map((spec, idx) => (
            <div key={spec.key} className="space-y-1">
              <label
                htmlFor={`cron-field-${spec.key}`}
                className="block text-[11px] font-medium text-text-secondary truncate"
              >
                {isEs ? spec.labelEs : spec.labelEn}
              </label>
              <input
                id={`cron-field-${spec.key}`}
                type="text"
                value={analysis.parts[idx] ?? ''}
                onChange={(e) => handleFieldChange(idx, e.target.value)}
                className="ui-input font-mono text-center text-sm px-2"
              />
              <span className="block text-[10px] font-mono text-text-tertiary text-center">
                {spec.min}–{spec.max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Interpretación de Cron' : 'Cron Schedule Breakdown'}
      state={analysis.state}
      emptyTitle={isEs ? 'Introduce una expresión cron' : 'Enter a cron expression'}
      emptyDescription={
        isEs
          ? 'Usa 5 campos estándar como "*/5 * * * *" o elige un ajuste rápido.'
          : 'Provide a standard 5-field expression like "*/5 * * * *" or choose a preset.'
      }
      errorTitle={isEs ? 'Expresión Cron Inválida' : 'Invalid Cron Expression'}
      errorMessage={analysis.errors.join(' ')}
      primaryLabel={isEs ? 'Programación' : 'Schedule Summary'}
      primaryValue={analysis.state === 'ready' ? cron.trim() : '—'}
      primarySubtext={analysis.summary}
      statusLabel={analysis.state === 'ready' ? (isEs ? 'Sintaxis Válida' : 'Valid Cron') : undefined}
      statusTone="accent"
      copyText={analysis.state === 'ready' ? cron.trim() : ''}
      copyLabel={isEs ? 'Copiar Cron' : 'Copy Cron'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {analysis.state === 'ready' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border-main bg-surface-secondary p-3.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1">
              {isEs ? 'Lectura Humana' : 'Human-Readable Explanation'}
            </span>
            <p className="text-sm font-medium text-text-primary">{analysis.summary}</p>
          </div>

          <ToolBreakdownList
            items={FIELD_SPECS.map((spec, idx) => ({
              label: `${isEs ? spec.labelEs : spec.labelEn} (${spec.min}–${spec.max})`,
              value: `${analysis.parts[idx]}  ·  ${describeField(analysis.parts[idx], spec, isEs)}`,
              highlight: analysis.parts[idx] !== '*',
            }))}
          />

          {analysis.nextRuns.length > 0 && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
                {isEs ? 'Próximas 5 Ejecuciones (hora local)' : 'Next 5 Scheduled Runs (local time)'}
              </span>
              <div className="rounded-lg border border-border-main bg-surface-secondary divide-y divide-border-subtle">
                {analysis.nextRuns.map((run, idx) => (
                  <div
                    key={run}
                    className="px-3 py-2 flex items-center justify-between text-xs font-mono text-text-primary"
                  >
                    <span className="text-text-tertiary">#{idx + 1}</span>
                    <span>{run}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default CronExpressionCalculator;
