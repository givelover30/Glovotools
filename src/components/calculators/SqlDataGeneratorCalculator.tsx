import React, { useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';

const DEFAULTS = {
  tableName: 'users',
  rowCount: 5,
};

const SQL_IDENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const SAMPLE_NAMES = [
  "Alice O'Connor",
  'Bob Martinez',
  'Charlie Kim',
  'Diana Patel',
  'Evan Brooks',
  'Fiona Chen',
  'George Alvarez',
  'Hannah Silva',
  'Ian Rossi',
  'Julia Novak',
];

const SAMPLE_CITIES = [
  'New York',
  'Austin',
  'Madrid',
  'London',
  'Toronto',
  'Berlin',
  'Tokyo',
  'Sydney',
];

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const SqlDataGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [tableName, setTableName] = useState<string>(DEFAULTS.tableName);
  const [rowCountInput, setRowCountInput] = useState<string>(String(DEFAULTS.rowCount));
  const [seed, setSeed] = useState<number>(202);

  const trimmedTable = tableName.trim();
  const isTableValid = SQL_IDENT_REGEX.test(trimmedTable);

  const parsedRows = Number(rowCountInput);
  const isRowsValid =
    rowCountInput.trim() !== '' &&
    Number.isInteger(parsedRows) &&
    parsedRows >= 1 &&
    parsedRows <= 50;

  const isValid = isTableValid && isRowsValid;

  const { sqlOutput, byteSize } = useMemo(() => {
    if (!isValid) return { sqlOutput: '', byteSize: 0 };

    const rng = mulberry32(seed);
    const lines: string[] = [
      `CREATE TABLE IF NOT EXISTS ${trimmedTable} (`,
      '  id INT PRIMARY KEY,',
      '  full_name VARCHAR(100) NOT NULL,',
      '  email VARCHAR(120) NOT NULL,',
      '  city VARCHAR(80) NOT NULL,',
      '  balance DECIMAL(10, 2) NOT NULL,',
      '  is_active BOOLEAN NOT NULL',
      ');',
      '',
      `INSERT INTO ${trimmedTable} (id, full_name, email, city, balance, is_active) VALUES`,
    ];

    const valueRows = Array.from({ length: parsedRows }, (_, i) => {
      const id = i + 1;
      const rawName = SAMPLE_NAMES[(i + Math.floor(rng() * SAMPLE_NAMES.length)) % SAMPLE_NAMES.length];
      const safeName = escapeSqlString(rawName);
      const emailSlug = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '');
      const email = escapeSqlString(`${emailSlug}.${id}@example.com`);
      const city = escapeSqlString(SAMPLE_CITIES[Math.floor(rng() * SAMPLE_CITIES.length)]);
      const balance = (25 + rng() * 975).toFixed(2);
      const active = rng() > 0.2 ? 'TRUE' : 'FALSE';
      const suffix = i === parsedRows - 1 ? ';' : ',';
      return `  (${id}, '${safeName}', '${email}', '${city}', ${balance}, ${active})${suffix}`;
    });

    const fullSql = [...lines, ...valueRows, ''].join('\n');
    return {
      sqlOutput: fullSql,
      byteSize: new TextEncoder().encode(fullSql).length,
    };
  }, [isValid, trimmedTable, parsedRows, seed]);

  const handleReset = () => {
    setTableName(DEFAULTS.tableName);
    setRowCountInput(String(DEFAULTS.rowCount));
    setSeed(202);
  };

  const presets = [
    {
      label: 'users (5)',
      onSelect: () => {
        setTableName('users');
        setRowCountInput('5');
      },
    },
    {
      label: 'customers (15)',
      onSelect: () => {
        setTableName('customers');
        setRowCountInput('15');
      },
    },
    {
      label: 'staging_accounts (25)',
      onSelect: () => {
        setTableName('staging_accounts');
        setRowCountInput('25');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Parámetros de Semilla SQL' : 'SQL Seed Configuration'}
      subtitle={
        isEs
          ? 'Genera DDL CREATE TABLE e INSERT INTO seguros con escape de comillas SQL.'
          : 'Generate ANSI SQL CREATE TABLE and INSERT INTO statements with proper quote escaping.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Tablas rápidas' : 'Quick presets'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'Nombre de Tabla (identificador SQL)' : 'Table Name (SQL identifier)'}
        htmlFor="sql-table-name"
        error={
          !isTableValid
            ? isEs
              ? 'Usa solo letras, números y guion bajo, comenzando por letra o "_".'
              : 'Use letters, numbers, and underscores only, starting with a letter or "_".'
            : undefined
        }
      >
        <input
          id="sql-table-name"
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="users"
          className="ui-input font-mono"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Número de Filas (1–50)' : 'Row Count (1–50)'}
        htmlFor="sql-row-count"
        error={
          !isRowsValid
            ? isEs
              ? 'Introduce un número entero entre 1 y 50.'
              : 'Enter a whole number between 1 and 50.'
            : undefined
        }
      >
        <input
          id="sql-row-count"
          type="number"
          min={1}
          max={50}
          value={rowCountInput}
          onChange={(e) => setRowCountInput(e.target.value)}
          className="ui-input font-mono"
        />
      </ToolFieldGroup>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={!isValid}
          onClick={() => setSeed((prev) => prev + 23)}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {isEs ? 'Regenerar Filas' : 'Regenerate Rows'}
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() =>
            downloadBlob(sqlOutput, `${trimmedTable}_seed.sql`, 'application/sql;charset=utf-8')
          }
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar .sql' : 'Download .sql'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Script SQL Generado' : 'Generated SQL Script'}
      state={isValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Parámetros SQL no válidos' : 'Invalid SQL Parameters'}
      errorMessage={
        isEs
          ? 'Introduce un nombre de tabla SQL válido y entre 1 y 50 filas.'
          : 'Provide a valid SQL table identifier and a row count between 1 and 50.'
      }
      primaryLabel={isEs ? 'Tabla y Filas' : 'Table & Rows'}
      primaryValue={isValid ? `${parsedRows} rows` : '—'}
      primaryUnit={isValid ? trimmedTable : undefined}
      primarySubtext={
        isValid
          ? isEs
            ? `CREATE TABLE + INSERT INTO · ${byteSize} bytes`
            : `CREATE TABLE + INSERT INTO · ${byteSize} bytes`
          : undefined
      }
      statusLabel={isEs ? 'SQL ANSI listo' : 'ANSI SQL Ready'}
      statusTone="accent"
      copyText={sqlOutput}
      copyLabel={isEs ? 'Copiar SQL' : 'Copy SQL'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValid && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label={isEs ? 'Tabla' : 'Table'} value={trimmedTable} accent />
            <ToolMetricTile label={isEs ? 'Filas INSERT' : 'INSERT Rows'} value={String(parsedRows)} />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[380px] leading-relaxed">
            {sqlOutput}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default SqlDataGeneratorCalculator;
