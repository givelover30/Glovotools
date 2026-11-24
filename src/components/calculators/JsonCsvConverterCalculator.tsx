import { useMemo, useState } from 'react';
import { ArrowRightLeft, Repeat } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type ConversionMode = 'json-to-csv' | 'csv-to-json';

const DEFAULT_JSON =
  '[\n  {"name": "Alice", "age": 30, "city": "New York"},\n  {"name": "Bob", "age": 25, "city": "London"}\n]';

const DEFAULT_CSV = 'name,age,city\n"Alice","30","New York"\n"Bob","25","London"';

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function convertJsonToCsv(raw: string, isEs: boolean): { output: string; rows: number; cols: number } {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(
      isEs
        ? 'La entrada debe ser un arreglo JSON no vacío de objetos.'
        : 'Input must be a non-empty JSON array of objects.'
    );
  }
  if (typeof parsed[0] !== 'object' || parsed[0] === null || Array.isArray(parsed[0])) {
    throw new Error(
      isEs
        ? 'Cada elemento del arreglo JSON debe ser un objeto.'
        : 'Each item in the JSON array must be an object.'
    );
  }

  const keySet = new Set<string>();
  for (const row of parsed) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const k of Object.keys(row)) keySet.add(k);
    }
  }
  const keys = Array.from(keySet);
  const escapeCell = (val: unknown) => {
    const str = val !== undefined && val !== null ? String(val) : '';
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = keys
    .map((k) => (/[",\r\n]/.test(k) ? `"${k.replace(/"/g, '""')}"` : k))
    .join(',');

  const csvRows = [
    headerLine,
    ...parsed.map((row: Record<string, unknown>) => keys.map((key) => escapeCell(row[key])).join(','))
  ];

  return {
    output: csvRows.join('\n'),
    rows: parsed.length,
    cols: keys.length
  };
}

function convertCsvToJson(raw: string, isEs: boolean): { output: string; rows: number; cols: number } {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error(
      isEs
        ? 'El CSV debe contener una fila de encabezados y al menos una fila de datos.'
        : 'CSV must contain a header row and at least one data row.'
    );
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const result = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] !== undefined ? values[i] : '';
    });
    return obj;
  });

  return {
    output: JSON.stringify(result, null, 2),
    rows: result.length,
    cols: headers.length
  };
}

export default function JsonCsvConverterCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [mode, setMode] = useState<ConversionMode>('json-to-csv');
  const [input, setInput] = useState<string>(DEFAULT_JSON);

  const conversion = useMemo(() => {
    if (!input.trim()) {
      return { state: 'empty' as const };
    }
    try {
      const res =
        mode === 'json-to-csv'
          ? convertJsonToCsv(input, isEs)
          : convertCsvToJson(input, isEs);
      return {
        state: 'ready' as const,
        ...res
      };
    } catch (err: any) {
      return {
        state: 'error' as const,
        errorMessage:
          err?.message || (isEs ? 'Error al convertir los datos.' : 'Data conversion failed.')
      };
    }
  }, [input, mode, isEs]);

  const handleModeChange = (nextMode: ConversionMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (conversion.state === 'ready' && conversion.output) {
      setInput(conversion.output);
    } else {
      setInput(nextMode === 'json-to-csv' ? DEFAULT_JSON : DEFAULT_CSV);
    }
  };

  const handleSwapRoundTrip = () => {
    if (conversion.state !== 'ready') return;
    const nextMode: ConversionMode = mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv';
    setMode(nextMode);
    setInput(conversion.output);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleReset = () => {
    setMode('json-to-csv');
    setInput(DEFAULT_JSON);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Datos de entrada' : 'Input Data'}
          subtitle={
            isEs
              ? 'Convierte arreglos JSON a CSV con escape RFC 4180 y viceversa al instante.'
              : 'Convert JSON arrays to RFC 4180 escaped CSV and back instantaneously.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolSegmentedControl
            ariaLabel={isEs ? 'Dirección de conversión' : 'Conversion direction'}
            value={mode}
            onChange={handleModeChange}
            options={[
              { value: 'json-to-csv', label: 'JSON → CSV' },
              { value: 'csv-to-json', label: 'CSV → JSON' }
            ]}
          />

          <ToolFieldGroup
            label={
              mode === 'json-to-csv'
                ? isEs
                  ? 'Arreglo JSON de entrada'
                  : 'Input JSON Array'
                : isEs
                  ? 'Datos CSV de entrada'
                  : 'Input CSV Data'
            }
            htmlFor="json-csv-input"
            hint={
              mode === 'json-to-csv'
                ? isEs
                  ? 'Admite comas internas, comillas escapadas y campos vacíos.'
                  : 'Supports embedded commas, escaped quotes, and empty fields.'
                : isEs
                  ? 'La primera fila define los nombres de las propiedades JSON.'
                  : 'First row defines the JSON property keys.'
            }
          >
            <textarea
              id="json-csv-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'json-to-csv'
                  ? '[{"name": "Alice", "age": 30}]'
                  : 'name,age\n"Alice","30"'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={conversion.state !== 'ready'}
              onClick={handleSwapRoundTrip}
              className="ui-btn-secondary flex-1 min-w-[160px]"
            >
              <Repeat className="w-4 h-4" />
              <span>
                {isEs ? 'Invertir y usar salida' : 'Swap Output to Input'}
              </span>
            </button>
          </div>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Ejemplo básico' : 'Default Dataset',
                onSelect: () => {
                  setMode('json-to-csv');
                  setInput(DEFAULT_JSON);
                }
              },
              {
                label: isEs ? 'Comas y comillas' : 'Commas & Quotes',
                onSelect: () => {
                  setMode('json-to-csv');
                  setInput(
                    JSON.stringify(
                      [
                        { name: 'Smith, Jane', note: 'Said "Hello, world"', city: 'Austin, TX' },
                        { name: 'Doe, John', note: '', city: 'Madrid' }
                      ],
                      null,
                      2
                    )
                  );
                }
              },
              {
                label: isEs ? 'CSV con campos vacíos' : 'CSV Empty Fields',
                onSelect: () => {
                  setMode('csv-to-json');
                  setInput('id,name,email,notes\n1,"Alice","","VIP, tier ""A"""\n2,"Bob","bob@example.com",""');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={
            mode === 'json-to-csv'
              ? isEs
                ? 'CSV generado'
                : 'Generated CSV'
              : isEs
                ? 'JSON generado'
                : 'Generated JSON'
          }
          state={conversion.state}
          emptyTitle={isEs ? 'Ingresa datos para convertir' : 'Enter data to convert'}
          emptyDescription={
            isEs
              ? 'Pega un arreglo JSON o una tabla CSV a la izquierda para obtener el resultado.'
              : 'Paste a JSON array or CSV dataset on the left to view the converted output.'
          }
          errorTitle={isEs ? 'Error de formato' : 'Format error'}
          errorMessage={conversion.state === 'error' ? conversion.errorMessage : undefined}
          copyText={conversion.state === 'ready' ? conversion.output : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {conversion.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Filas' : 'Rows'}
                  value={String(conversion.rows)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Columnas' : 'Columns'}
                  value={String(conversion.cols)}
                />
              </div>

              <ToolFieldGroup
                label={
                  mode === 'json-to-csv'
                    ? isEs
                      ? 'Salida CSV'
                      : 'CSV Output'
                    : isEs
                      ? 'Salida JSON'
                      : 'JSON Output'
                }
                htmlFor="json-csv-output"
                unit={mode === 'json-to-csv' ? 'RFC 4180' : 'JSON'}
              >
                <textarea
                  id="json-csv-output"
                  rows={10}
                  readOnly
                  value={conversion.output}
                  className="ui-input font-mono text-xs leading-relaxed resize-y bg-surface-secondary/60"
                />
              </ToolFieldGroup>

              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="inline-flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
                  <span>{mode === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}</span>
                </span>
                <span className="font-mono tabular-nums">
                  {conversion.output.length} {isEs ? 'caracteres' : 'chars'}
                </span>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
