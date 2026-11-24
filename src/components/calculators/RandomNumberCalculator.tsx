import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiCheckbox } from '../ui/AppPrimitives.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

function secureRandomFloat(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
}

export default function RandomNumberCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [min, setMin] = useState<string>('1');
  const [max, setMax] = useState<string>('100');
  const [count, setCount] = useState<string>('10');
  const [isDecimal, setIsDecimal] = useState<boolean>(false);
  const [unique, setUnique] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(0);

  const generated = useMemo(() => {
    void seed;
    if (min.trim() === '' || max.trim() === '' || count.trim() === '') {
      return { state: 'empty' as const };
    }

    const minNum = Number(min);
    const maxNum = Number(max);
    const countNum = Number(count);

    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || !Number.isFinite(countNum)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Ingresa valores numéricos válidos para mínimo, máximo y cantidad.'
          : 'Enter valid numeric values for minimum, maximum, and quantity.'
      };
    }

    if (minNum > maxNum) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `El mínimo (${minNum}) no puede ser mayor que el máximo (${maxNum}).`
          : `Minimum (${minNum}) cannot be greater than maximum (${maxNum}).`
      };
    }

    const safeCount = Math.floor(countNum);
    if (safeCount < 1 || safeCount > 100) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'La cantidad debe estar entre 1 y 100.'
          : 'Quantity must be between 1 and 100.'
      };
    }

    if (!isDecimal) {
      const intMin = Math.ceil(minNum);
      const intMax = Math.floor(maxNum);
      if (intMin > intMax) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? 'No existe ningún entero en el rango especificado. Activa decimales o amplía el rango.'
            : 'No integers exist in this range. Enable decimals or widen the range.'
        };
      }
      const possibleIntegers = intMax - intMin + 1;
      if (unique && safeCount > possibleIntegers) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? `No es posible generar ${safeCount} enteros únicos en un rango de solo ${possibleIntegers} valores.`
            : `Cannot generate ${safeCount} unique integers from a range containing only ${possibleIntegers} values.`
        };
      }

      const list: number[] = [];
      if (unique && possibleIntegers <= 10000) {
        // Exact Fisher-Yates partial shuffle for guaranteed unique integers
        const pool = Array.from({ length: possibleIntegers }, (_, idx) => intMin + idx);
        for (let i = 0; i < safeCount; i++) {
          const j = i + Math.floor(secureRandomFloat() * (pool.length - i));
          const tmp = pool[i];
          pool[i] = pool[j];
          pool[j] = tmp;
          list.push(pool[i]);
        }
      } else {
        const seen = new Set<number>();
        let attempts = 0;
        while (list.length < safeCount && attempts < safeCount * 50) {
          attempts++;
          const val = Math.floor(secureRandomFloat() * (intMax - intMin + 1)) + intMin;
          if (unique && seen.has(val)) continue;
          seen.add(val);
          list.push(val);
        }
      }

      const sum = list.reduce((acc, v) => acc + v, 0);
      return {
        state: 'ready' as const,
        numbers: list,
        minVal: Math.min(...list),
        maxVal: Math.max(...list),
        avgVal: (sum / list.length).toFixed(2)
      };
    }

    // Decimal mode (4-decimal precision matching original behavior)
    if (unique && minNum === maxNum && safeCount > 1) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'No es posible generar múltiples valores únicos cuando mínimo y máximo son iguales.'
          : 'Cannot generate multiple unique numbers when minimum and maximum are equal.'
      };
    }

    const list: number[] = [];
    const seen = new Set<number>();
    let attempts = 0;
    while (list.length < safeCount && attempts < safeCount * 50) {
      attempts++;
      const raw = secureRandomFloat() * (maxNum - minNum) + minNum;
      const val = Number(raw.toFixed(4));
      if (unique && seen.has(val)) continue;
      seen.add(val);
      list.push(val);
    }

    const sum = list.reduce((acc, v) => acc + v, 0);
    return {
      state: 'ready' as const,
      numbers: list,
      minVal: Math.min(...list),
      maxVal: Math.max(...list),
      avgVal: (sum / list.length).toFixed(4)
    };
  }, [min, max, count, isDecimal, unique, seed, isEs]);

  const handleClear = () => {
    setMin('');
    setMax('');
    setCount('');
  };

  const handleReset = () => {
    setMin('1');
    setMax('100');
    setCount('10');
    setIsDecimal(false);
    setUnique(false);
    setSeed((s) => s + 1);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Generador de Números Aleatorios' : 'Random Number Generator'}
          subtitle={
            isEs
              ? 'Genera enteros o decimales (4 cifras) con opción de unicidad sin duplicados.'
              : 'Generates inclusive integers or 4-decimal floats with optional duplicate-free uniqueness.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ToolFieldGroup
              label={isEs ? 'Mínimo (Min)' : 'Minimum'}
              htmlFor="rng-min-input"
            >
              <input
                id="rng-min-input"
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="ui-input font-mono text-sm"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Máximo (Max)' : 'Maximum'}
              htmlFor="rng-max-input"
            >
              <input
                id="rng-max-input"
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="ui-input font-mono text-sm"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Cantidad' : 'Quantity'}
              htmlFor="rng-count-input"
              unit="1–100"
            >
              <input
                id="rng-count-input"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="ui-input font-mono text-sm"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <UiCheckbox
              id="rng-decimal"
              checked={isDecimal}
              onChange={(e) => setIsDecimal(e.target.checked)}
              label={isEs ? 'Permitir decimales (4 cifras)' : 'Allow Decimals (4 dp)'}
            />
            <UiCheckbox
              id="rng-unique"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              label={isEs ? 'Solo números únicos' : 'Unique Numbers Only'}
            />
          </div>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="ui-btn-primary w-full"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEs ? 'Generar nuevos números' : 'Roll Again'}</span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Presets:'}
            presets={[
              {
                label: '1–100 (×10)',
                onSelect: () => {
                  setMin('1');
                  setMax('100');
                  setCount('10');
                  setIsDecimal(false);
                  setUnique(false);
                }
              },
              {
                label: isEs ? 'Dado (1–6)' : 'Dice (1–6)',
                onSelect: () => {
                  setMin('1');
                  setMax('6');
                  setCount('2');
                  setIsDecimal(false);
                  setUnique(false);
                }
              },
              {
                label: isEs ? 'Lotería (6 únicos)' : 'Lottery (6 Unique)',
                onSelect: () => {
                  setMin('1');
                  setMax('49');
                  setCount('6');
                  setIsDecimal(false);
                  setUnique(true);
                }
              },
              {
                label: '0.0–1.0 Float',
                onSelect: () => {
                  setMin('0');
                  setMax('1');
                  setCount('5');
                  setIsDecimal(true);
                  setUnique(false);
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Números generados' : 'Generated Numbers'}
          state={generated.state}
          primaryLabel={isEs ? 'Lista generada' : 'Generated Sequence'}
          primaryValue={
            generated.state === 'ready'
              ? generated.numbers.length === 1
                ? String(generated.numbers[0])
                : `${generated.numbers.length} ${isEs ? 'valores' : 'values'}`
              : undefined
          }
          primarySubtext={
            generated.state === 'ready'
              ? isEs
                ? `Rango [${min}, ${max}] • ${isDecimal ? 'Decimales' : 'Enteros'}${unique ? ' • Únicos' : ''}`
                : `Range [${min}, ${max}] • ${isDecimal ? 'Decimals (4 dp)' : 'Integers'}${unique ? ' • Unique' : ''}`
              : undefined
          }
          statusLabel={
            generated.state === 'ready'
              ? isDecimal
                ? 'Float'
                : 'Integer'
              : undefined
          }
          statusTone="accent"
          copyText={
            generated.state === 'ready' ? generated.numbers.join(', ') : undefined
          }
          copyLabel={isEs ? 'Copiar lista' : 'Copy numbers'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa el rango y cantidad' : 'Enter range and quantity'}
          emptyDescription={
            isEs
              ? 'Define mínimo, máximo y cantidad a la izquierda para generar números.'
              : 'Set minimum, maximum, and count on the left to generate random numbers.'
          }
          errorTitle={isEs ? 'Rango o parámetros inválidos' : 'Invalid Range or Parameters'}
          errorMessage={generated.state === 'error' ? generated.errorMessage : undefined}
        >
          {generated.state === 'ready' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border-subtle bg-surface-secondary/60">
                {generated.numbers.map((num, idx) => (
                  <span
                    key={`${num}-${idx}`}
                    className="px-3 py-1.5 rounded-lg border border-border-main bg-surface font-mono text-sm font-bold text-text-primary tabular-nums"
                  >
                    {num}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile label="Min" value={String(generated.minVal)} />
                <ToolMetricTile label="Max" value={String(generated.maxVal)} />
                <ToolMetricTile
                  label={isEs ? 'Promedio' : 'Mean'}
                  value={generated.avgVal}
                  accent
                />
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
