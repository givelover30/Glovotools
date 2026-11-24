import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Copy, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type EpochUnitMode = 'auto' | 'seconds' | 'milliseconds';

const INITIAL_NOW_SECONDS = Math.floor(Date.now() / 1000);
const INITIAL_DATE_LOCAL = new Date().toISOString().slice(0, 16);

export default function EpochTimestampCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [now, setNow] = useState<number>(INITIAL_NOW_SECONDS);
  const [unitMode, setUnitMode] = useState<EpochUnitMode>('auto');
  const [inputEpoch, setInputEpoch] = useState<string>(String(INITIAL_NOW_SECONDS));
  const [inputDate, setInputDate] = useState<string>(INITIAL_DATE_LOCAL);
  const [copiedKey, setCopiedKey] = useState<'date-sec' | 'date-ms' | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const epochConversion = useMemo(() => {
    const trimmed = inputEpoch.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }
    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Ingresa un número entero válido de marca de tiempo Unix (positivo, cero o negativo).'
          : 'Enter a valid numeric Unix timestamp (positive, zero, or negative).'
      };
    }

    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return {
        state: 'error' as const,
        errorMessage: isEs ? 'Marca de tiempo fuera de rango.' : 'Timestamp is out of range.'
      };
    }

    const detectedUnit: 'seconds' | 'milliseconds' =
      unitMode === 'auto'
        ? Math.abs(numeric) >= 1e11
          ? 'milliseconds'
          : 'seconds'
        : unitMode;

    const ms = detectedUnit === 'milliseconds' ? numeric : numeric * 1000;
    const dateObj = new Date(ms);

    if (Number.isNaN(dateObj.getTime())) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'La marca de tiempo excede el rango de fechas válido (JavaScript Date).'
          : 'Timestamp exceeds valid calendar date range.'
      };
    }

    const secondsVal = Math.trunc(ms / 1000);
    const msVal = Math.trunc(ms);
    const utcString = dateObj.toUTCString();
    const isoString = dateObj.toISOString();
    const localString = new Intl.DateTimeFormat(isEs ? 'es-ES' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(dateObj);

    return {
      state: 'ready' as const,
      detectedUnit,
      utcString,
      isoString,
      localString,
      secondsVal,
      msVal,
      isPreEpoch: msVal < 0
    };
  }, [inputEpoch, unitMode, isEs]);

  const dateToEpoch = useMemo(() => {
    if (!inputDate.trim()) return { valid: false as const, empty: true as const };
    const parsedMs = new Date(inputDate).getTime();
    if (Number.isNaN(parsedMs)) return { valid: false as const, empty: false as const };
    return {
      valid: true as const,
      seconds: Math.floor(parsedMs / 1000),
      milliseconds: parsedMs
    };
  }, [inputDate]);

  const handleCopySmall = (value: string, key: 'date-sec' | 'date-ms') => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleClear = () => {
    setInputEpoch('');
    setInputDate('');
  };

  const handleReset = () => {
    const freshNow = Math.floor(Date.now() / 1000);
    setUnitMode('auto');
    setInputEpoch(String(freshNow));
    setInputDate(new Date(freshNow * 1000).toISOString().slice(0, 16));
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Entradas Epoch y Fecha' : 'Epoch & Date Inputs'}
          subtitle={
            isEs
              ? 'Convierte marcas de tiempo Unix en segundos, milisegundos o valores negativos previos a 1970.'
              : 'Convert Unix timestamps in seconds, milliseconds, or negative pre-1970 values.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          {/* Live Ticker Strip */}
          <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-text-secondary">
                  {isEs ? 'Unix Epoch actual (segundos)' : 'Current Unix Epoch (seconds)'}
                </div>
                <div className="text-base font-mono font-bold tabular-nums text-text-primary">
                  {now}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputEpoch(unitMode === 'milliseconds' ? String(now * 1000) : String(now));
                setInputDate(new Date(now * 1000).toISOString().slice(0, 16));
              }}
              className="ui-btn-primary py-1.5 px-3 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEs ? 'Usar actual' : 'Use Current'}</span>
            </button>
          </div>

          <ToolFieldGroup
            label={isEs ? 'Unidad de marca de tiempo' : 'Timestamp Precision'}
          >
            <ToolSegmentedControl
              ariaLabel={isEs ? 'Unidad de entrada Epoch' : 'Epoch input unit'}
              value={unitMode}
              onChange={(next) => setUnitMode(next)}
              options={[
                { value: 'auto', label: isEs ? 'Auto' : 'Auto' },
                { value: 'seconds', label: isEs ? 'Segundos (s)' : 'Seconds (s)' },
                { value: 'milliseconds', label: isEs ? 'Milisegundos (ms)' : 'Milliseconds (ms)' }
              ]}
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Epoch → Fecha' : 'Epoch Timestamp → Date'}
            htmlFor="epoch-timestamp-input"
            unit={
              unitMode === 'auto'
                ? 's / ms'
                : unitMode === 'seconds'
                  ? 'seconds'
                  : 'ms'
            }
            hint={
              isEs
                ? 'Acepta segundos (10 dígitos), milisegundos (13 dígitos) y negativos (antes de 1970).'
                : 'Accepts seconds (10-digit), milliseconds (13-digit), and negative pre-1970 timestamps.'
            }
          >
            <input
              id="epoch-timestamp-input"
              type="text"
              inputMode="numeric"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="1700000000"
              className="ui-input font-mono tabular-nums"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: '1700000000 (s)',
                onSelect: () => {
                  setUnitMode('seconds');
                  setInputEpoch('1700000000');
                }
              },
              {
                label: '1700000000000 (ms)',
                onSelect: () => {
                  setUnitMode('auto');
                  setInputEpoch('1700000000000');
                }
              },
              {
                label: isEs ? 'Pre-1970 (-86400)' : 'Pre-1970 (-86400)',
                onSelect: () => {
                  setUnitMode('seconds');
                  setInputEpoch('-86400');
                }
              },
              {
                label: 'Unix 0 (1970)',
                onSelect: () => {
                  setUnitMode('seconds');
                  setInputEpoch('0');
                }
              }
            ]}
          />

          <div className="pt-3 border-t border-border-subtle space-y-3">
            <ToolFieldGroup
              label={isEs ? 'Fecha y hora → Epoch' : 'Date & Time → Epoch Timestamp'}
              htmlFor="epoch-date-input"
            >
              <input
                id="epoch-date-input"
                type="datetime-local"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="ui-input font-mono tabular-nums"
              />
            </ToolFieldGroup>

            {dateToEpoch.valid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-text-secondary">
                    <span>{isEs ? 'Unix (segundos)' : 'Unix (seconds)'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySmall(String(dateToEpoch.seconds), 'date-sec')}
                      className="inline-flex items-center gap-1 text-accent font-semibold cursor-pointer"
                    >
                      {copiedKey === 'date-sec' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedKey === 'date-sec'
                          ? isEs
                            ? 'Copiado'
                            : 'Copied'
                          : isEs
                            ? 'Copiar'
                            : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div
                    data-testid="date-to-epoch-seconds"
                    className="font-mono text-sm font-bold tabular-nums text-accent"
                  >
                    {dateToEpoch.seconds}
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-text-secondary">
                    <span>{isEs ? 'Unix (milisegundos)' : 'Unix (milliseconds)'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySmall(String(dateToEpoch.milliseconds), 'date-ms')}
                      className="inline-flex items-center gap-1 text-accent font-semibold cursor-pointer"
                    >
                      {copiedKey === 'date-ms' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedKey === 'date-ms'
                          ? isEs
                            ? 'Copiado'
                            : 'Copied'
                          : isEs
                            ? 'Copiar'
                            : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div
                    data-testid="date-to-epoch-ms"
                    className="font-mono text-sm font-bold tabular-nums text-text-primary"
                  >
                    {dateToEpoch.milliseconds}
                  </div>
                </div>
              </div>
            ) : !dateToEpoch.empty ? (
              <p role="alert" className="text-xs text-status-error font-medium">
                {isEs ? 'Fecha inválida.' : 'Invalid date.'}
              </p>
            ) : null}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Fecha convertida (Epoch → Fecha)' : 'Converted Date (Epoch → Date)'}
          state={epochConversion.state}
          emptyTitle={isEs ? 'Ingresa una marca de tiempo' : 'Enter an epoch timestamp'}
          emptyDescription={
            isEs
              ? 'Escribe un valor en segundos o milisegundos (incluso negativo) para ver la fecha UTC e ISO.'
              : 'Enter a Unix timestamp in seconds or milliseconds (including negative values) to view UTC and ISO dates.'
          }
          errorTitle={isEs ? 'Marca de tiempo inválida' : 'Invalid timestamp'}
          errorMessage={
            epochConversion.state === 'error' ? epochConversion.errorMessage : undefined
          }
          primaryLabel={isEs ? 'Fecha UTC (RFC 2822)' : 'Human Readable (UTC)'}
          primaryValue={epochConversion.state === 'ready' ? epochConversion.utcString : undefined}
          primarySubtext={
            epochConversion.state === 'ready'
              ? `ISO 8601: ${epochConversion.isoString}`
              : undefined
          }
          statusLabel={
            epochConversion.state === 'ready'
              ? epochConversion.detectedUnit === 'milliseconds'
                ? isEs
                  ? 'Milisegundos'
                  : 'Milliseconds'
                : epochConversion.isPreEpoch
                  ? isEs
                    ? 'Previo a 1970'
                    : 'Pre-1970'
                  : isEs
                    ? 'Segundos'
                    : 'Seconds'
              : undefined
          }
          statusTone={
            epochConversion.state === 'ready' && epochConversion.isPreEpoch ? 'warning' : 'accent'
          }
          copyText={epochConversion.state === 'ready' ? epochConversion.utcString : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {epochConversion.state === 'ready' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Segundos (s)' : 'Seconds (s)'}
                  value={String(epochConversion.secondsVal)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Milisegundos (ms)' : 'Milliseconds (ms)'}
                  value={String(epochConversion.msVal)}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: 'UTC',
                    value: epochConversion.utcString,
                    highlight: true
                  },
                  {
                    label: 'ISO 8601',
                    value: epochConversion.isoString
                  },
                  {
                    label: isEs ? 'Hora local del navegador' : 'Browser Local Time',
                    value: epochConversion.localString
                  },
                  {
                    label: isEs ? 'Unidad interpretada' : 'Interpreted Unit',
                    value:
                      epochConversion.detectedUnit === 'milliseconds'
                        ? isEs
                          ? 'Milisegundos (ms)'
                          : 'Milliseconds (ms)'
                        : isEs
                          ? 'Segundos (s)'
                          : 'Seconds (s)'
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
