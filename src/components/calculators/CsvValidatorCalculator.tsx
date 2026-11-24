import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_CSV = `id,name,role,department
1,Alice,Engineer,R&D
2,Bob,Designer,Product
3,Charlie,Manager,Operations`;

interface CsvParseResult {
  state: 'empty' | 'ready' | 'error';
  headers: string[];
  rows: string[][];
  emptyCellCount: number;
  errors: string[];
}

/**
 * RFC 4180 compliant CSV parser supporting:
 * - Quoted fields containing commas
 * - Escaped double quotes ("")
 * - Empty cells
 * - Embedded newlines inside quoted fields
 * - Detection of unclosed quotes and inconsistent column counts
 */
function parseRfc4180Csv(input: string, isEs: boolean): CsvParseResult {
  if (!input.trim()) {
    return { state: 'empty', headers: [], rows: [], emptyCellCount: 0, errors: [] };
  }

  const records: string[][] = [];
  const errors: string[] = [];

  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let fieldJustClosedQuote = false;
  let fieldStarted = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        fieldJustClosedQuote = true;
        i++;
        continue;
      }
      currentField += ch;
      i++;
      continue;
    }

    if (fieldJustClosedQuote) {
      if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
        fieldJustClosedQuote = false;
        fieldStarted = false;
        i++;
        continue;
      }
      if (ch === '\r' || ch === '\n') {
        currentRow.push(currentField);
        records.push(currentRow);
        currentRow = [];
        currentField = '';
        fieldJustClosedQuote = false;
        fieldStarted = false;
        if (ch === '\r' && input[i + 1] === '\n') {
          i += 2;
        } else {
          i++;
        }
        continue;
      }
      if (ch === ' ' || ch === '\t') {
        i++;
        continue;
      }
      errors.push(
        isEs
          ? `Fila ${records.length + 1}: Caracter inesperado "${ch}" después de una comilla de cierre.`
          : `Row ${records.length + 1}: Unexpected character "${ch}" after closing quote.`
      );
      currentField += ch;
      fieldJustClosedQuote = false;
      i++;
      continue;
    }

    if (ch === '"' && !fieldStarted) {
      inQuotes = true;
      fieldStarted = true;
      i++;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
      fieldStarted = false;
      i++;
      continue;
    }

    if (ch === '\r' || ch === '\n') {
      currentRow.push(currentField);
      records.push(currentRow);
      currentRow = [];
      currentField = '';
      fieldStarted = false;
      if (ch === '\r' && input[i + 1] === '\n') {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    currentField += ch;
    fieldStarted = true;
    i++;
  }

  if (inQuotes) {
    errors.push(
      isEs
        ? `Fila ${records.length + 1}: Campo entre comillas sin cerrar al final del CSV.`
        : `Row ${records.length + 1}: Unclosed quoted field at end of CSV.`
    );
  }

  if (fieldStarted || currentRow.length > 0 || fieldJustClosedQuote) {
    currentRow.push(currentField);
    records.push(currentRow);
  }

  // Drop trailing completely empty line if present
  const nonEmptyRecords = records.filter(
    (row, idx) => !(idx === records.length - 1 && row.length === 1 && row[0] === '')
  );

  if (nonEmptyRecords.length === 0) {
    return { state: 'empty', headers: [], rows: [], emptyCellCount: 0, errors: [] };
  }

  const headers = nonEmptyRecords[0];
  const expectedCols = headers.length;
  let emptyCellCount = 0;

  nonEmptyRecords.forEach((row, idx) => {
    if (row.length !== expectedCols) {
      errors.push(
        isEs
          ? `Fila ${idx + 1}: Se esperaban ${expectedCols} columnas, se encontraron ${row.length}.`
          : `Row ${idx + 1}: Expected ${expectedCols} columns, found ${row.length}.`
      );
    }
    if (idx > 0) {
      row.forEach((cell) => {
        if (cell.trim() === '') emptyCellCount++;
      });
    }
  });

  return {
    state: errors.length === 0 ? 'ready' : 'error',
    headers,
    rows: nonEmptyRecords.slice(1),
    emptyCellCount,
    errors
  };
}

export default function CsvValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_CSV);

  const parsed = useMemo(() => parseRfc4180Csv(input, isEs), [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_CSV);

  const copySummary =
    parsed.state === 'ready'
      ? `Valid CSV | Columns: ${parsed.headers.length} (${parsed.headers.join(', ')}) | Data Rows: ${parsed.rows.length} | Empty Cells: ${parsed.emptyCellCount}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador CSV (RFC 4180)' : 'CSV Validator (RFC 4180)'}
          subtitle={
            isEs
              ? 'Soporta comas entre comillas, comillas escapadas (""), celdas vacías y saltos de línea internos.'
              : 'Supports quoted commas, escaped quotes (""), empty cells, embedded newlines, and column consistency.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Datos CSV' : 'CSV Data'}
            htmlFor="csv-validator-input"
            unit="RFC 4180"
          >
            <textarea
              id="csv-validator-input"
              rows={9}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega tus datos CSV aquí...' : 'Paste your CSV rows here...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'CSV estándar' : 'Standard CSV',
                onSelect: () => setInput(DEFAULT_CSV)
              },
              {
                label: isEs ? 'Comillas y saltos' : 'Quoted & Escaped',
                onSelect: () =>
                  setInput(
                    `id,name,notes,tag\n1,"Smith, Jane","Said ""Hello""\nLine 2",\n2,"Doe, John",,active`
                  )
              },
              {
                label: isEs ? 'Columnas desiguales' : 'Column Mismatch',
                onSelect: () =>
                  setInput(`id,name,role\n1,Alice,Engineer\n2,Bob`)
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Validación y vista previa' : 'Validation & Table Preview'}
          state={parsed.state}
          primaryLabel={isEs ? 'Estado CSV' : 'CSV Status'}
          primaryValue={
            parsed.state === 'ready'
              ? isEs
                ? 'CSV Válido'
                : 'Valid CSV'
              : undefined
          }
          primarySubtext={
            parsed.state === 'ready'
              ? isEs
                ? `${parsed.headers.length} columnas y ${parsed.rows.length} fila(s) de datos consistentes.`
                : `${parsed.headers.length} columns and ${parsed.rows.length} consistent data row(s).`
              : undefined
          }
          statusLabel={parsed.state === 'ready' ? 'RFC 4180' : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa CSV para validar' : 'Enter CSV data to validate'}
          emptyDescription={
            isEs
              ? 'Pega filas separadas por comas a la izquierda para validar la estructura.'
              : 'Paste comma-separated rows on the left to inspect column integrity.'
          }
          errorTitle={
            isEs
              ? `${parsed.errors.length} error(es) de estructura CSV`
              : `${parsed.errors.length} CSV Structure Error(s)`
          }
          errorMessage={parsed.errors.join(' • ')}
        >
          {parsed.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Columnas' : 'Columns'}
                  value={String(parsed.headers.length)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Filas de datos' : 'Data Rows'}
                  value={String(parsed.rows.length)}
                />
                <ToolMetricTile
                  label={isEs ? 'Celdas vacías' : 'Empty Cells'}
                  value={String(parsed.emptyCellCount)}
                />
              </div>

              <div className="overflow-x-auto max-h-64 rounded-xl border border-border-subtle">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-surface-secondary text-text-secondary sticky top-0">
                    <tr>
                      {parsed.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 font-semibold border-b border-border-subtle whitespace-nowrap"
                        >
                          {header || (isEs ? `(Col ${idx + 1})` : `(Col ${idx + 1})`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface">
                    {parsed.rows.slice(0, 12).map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-surface-hover/50">
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-3 py-2 font-mono text-text-primary whitespace-pre-wrap break-words min-w-[80px] max-w-[220px]"
                          >
                            {cell === '' ? (
                              <span className="text-text-tertiary italic">
                                {isEs ? 'vacío' : 'empty'}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
