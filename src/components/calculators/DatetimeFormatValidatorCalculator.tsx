import { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
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

const DEFAULT_DATETIME = '2024-02-29T12:00:00.000Z';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  const table = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return table[month - 1] ?? 0;
}

/**
 * Strictly validates ISO-8601 date/time strings so invalid calendar dates like
 * 2025-02-29 or 2026-04-31 do NOT silently roll over in JavaScript Date.
 */
function parseAndValidateDateTime(raw: string, isEs: boolean) {
  const clean = raw.trim();
  if (!clean) {
    return { state: 'empty' as const };
  }

  const isoMatch =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(
      clean
    );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const hour = isoMatch[4] !== undefined ? Number(isoMatch[4]) : 0;
    const minute = isoMatch[5] !== undefined ? Number(isoMatch[5]) : 0;
    const second = isoMatch[6] !== undefined ? Number(isoMatch[6]) : 0;
    const tz = isoMatch[8];

    if (month < 1 || month > 12) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Mes inválido (${String(month).padStart(2, '0')}); debe estar entre 01 y 12.`
          : `Invalid month (${String(month).padStart(2, '0')}); must be between 01 and 12.`
      };
    }

    const maxDay = daysInMonth(year, month);
    if (day < 1 || day > maxDay) {
      const leapNote =
        month === 2 && day === 29
          ? isEs
            ? ` El año ${year} no es bisiesto.`
            : ` Year ${year} is not a leap year.`
          : '';
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Día inválido (${day}) para ${year}-${String(month).padStart(2, '0')} (máximo ${maxDay}).${leapNote}`
          : `Invalid calendar day (${day}) for ${year}-${String(month).padStart(2, '0')} (max ${maxDay}).${leapNote}`
      };
    }

    if (hour > 23 || minute > 59 || second > 59) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Componente de hora fuera de rango (horas 00–23, minutos/segundos 00–59).'
          : 'Time component out of range (hours 00–23, minutes/seconds 00–59).'
      };
    }

    if (tz && tz !== 'Z') {
      const tzDigits = tz.replace(':', '');
      const tzH = Number(tzDigits.slice(1, 3));
      const tzM = Number(tzDigits.slice(3, 5));
      if (tzH > 23 || tzM > 59) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? `Desplazamiento de zona horaria inválido (${tz}).`
            : `Invalid timezone offset (${tz}).`
        };
      }
    }

    const parsed = new Date(clean.includes(' ') ? clean.replace(' ', 'T') : clean);
    if (Number.isNaN(parsed.getTime())) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'No se pudo interpretar la cadena ISO 8601.'
          : 'Unable to parse ISO 8601 date/time string.'
      };
    }

    return {
      state: 'ready' as const,
      date: parsed,
      detectedFormat: isoMatch[4] !== undefined ? 'ISO 8601 DateTime' : 'ISO 8601 Date',
      leapYear: isLeapYear(year)
    };
  }

  // Fallback to RFC 2822 / standard browser-recognized date formats
  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) {
    return {
      state: 'error' as const,
      errorMessage: isEs
        ? 'Formato de fecha/hora no reconocido. Usa ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) o RFC 2822.'
        : 'Unrecognized date/time format. Use ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) or RFC 2822.'
    };
  }

  return {
    state: 'ready' as const,
    date: parsed,
    detectedFormat: 'RFC 2822 / Standard',
    leapYear: isLeapYear(parsed.getUTCFullYear())
  };
}

export default function DatetimeFormatValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_DATETIME);

  const result = useMemo(() => parseAndValidateDateTime(input, isEs), [input, isEs]);

  const handleSetNow = () => setInput(new Date().toISOString());
  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_DATETIME);

  const copySummary =
    result.state === 'ready'
      ? `ISO: ${result.date.toISOString()} | UTC: ${result.date.toUTCString()} | Unix (ms): ${result.date.getTime()}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Fecha y Hora (ISO 8601 / RFC 2822)' : 'Date & Time Format Validator'}
          subtitle={
            isEs
              ? 'Valida fechas ISO 8601 y RFC 2822 con verificación estricta de años bisiestos y calendario.'
              : 'Validates ISO 8601 & RFC 2822 strings with strict calendar and leap-year boundary checks.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Cadena de fecha / hora' : 'Date / Time String'}
            htmlFor="datetime-validator-input"
            unit="ISO 8601"
          >
            <input
              id="datetime-validator-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="2024-02-29T12:00:00.000Z"
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <button type="button" onClick={handleSetNow} className="ui-btn-secondary w-full">
            <Clock className="w-4 h-4" />
            <span>{isEs ? 'Usar hora actual (UTC ISO)' : 'Use Current UTC Timestamp'}</span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Bisiesto válido (2024-02-29)' : 'Leap Year (2024-02-29)',
                onSelect: () => setInput('2024-02-29T12:00:00.000Z')
              },
              {
                label: isEs ? 'No bisiesto (2025-02-29)' : 'Non-Leap (2025-02-29)',
                onSelect: () => setInput('2025-02-29T12:00:00Z')
              },
              {
                label: 'RFC 2822',
                onSelect: () => setInput('Thu, 29 Feb 2024 12:00:00 GMT')
              },
              {
                label: isEs ? 'Fecha inválida' : 'Invalid Date',
                onSelect: () => setInput('2026-13-45T99:00:00Z')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Marcas de tiempo normalizadas' : 'Normalized Timestamps'}
          state={result.state}
          primaryLabel={isEs ? 'Estado de fecha' : 'Date/Time Status'}
          primaryValue={
            result.state === 'ready'
              ? isEs
                ? 'Fecha Válida'
                : 'Valid DateTime'
              : undefined
          }
          primarySubtext={
            result.state === 'ready' ? result.date.toISOString() : undefined
          }
          statusLabel={result.state === 'ready' ? result.detectedFormat : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar ISO/Unix' : 'Copy timestamps'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa una fecha u hora' : 'Enter a date/time string'}
          emptyDescription={
            isEs
              ? 'Escribe una cadena ISO 8601 o RFC 2822 a la izquierda para validarla.'
              : 'Enter an ISO 8601 or RFC 2822 date string on the left to validate.'
          }
          errorTitle={isEs ? 'Fecha u hora inválida' : 'Invalid Date / Time'}
          errorMessage={result.state === 'error' ? result.errorMessage : undefined}
        >
          {result.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Unix (segundos)' : 'Unix (Seconds)'}
                  value={String(Math.floor(result.date.getTime() / 1000))}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Año bisiesto' : 'Leap Year'}
                  value={result.leapYear ? (isEs ? 'Sí' : 'Yes') : 'No'}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: 'ISO 8601 (UTC)',
                    value: result.date.toISOString(),
                    highlight: true
                  },
                  {
                    label: 'UTC (RFC 2822)',
                    value: result.date.toUTCString()
                  },
                  {
                    label: isEs ? 'Hora local' : 'Local String',
                    value: result.date.toLocaleString()
                  },
                  {
                    label: 'Unix (ms)',
                    value: String(result.date.getTime())
                  }
                ]}
              />
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
