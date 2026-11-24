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
  ToolSegmentedControl,
} from '../calculator/ToolWorkspacePrimitives';

type MockDatasetType = 'users' | 'products' | 'tasks';

const DEFAULTS = {
  recordCount: 5,
  dataType: 'users' as MockDatasetType,
};

const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah', 'Liam', 'Sofia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Chen', 'Patel'];
const ROLES = ['admin', 'editor', 'viewer', 'developer', 'analyst'];
const PRODUCT_ADJS = ['Pro', 'Ultra', 'Compact', 'Smart', 'Studio', 'Aero', 'Pulse', 'Core'];
const PRODUCT_NOUNS = ['Monitor', 'Keyboard', 'Dock', 'Headset', 'Lamp', 'Camera', 'Router', 'Drive'];
const PRODUCT_CATS = ['Electronics', 'Workspace', 'Audio', 'Accessories', 'Networking'];
const TASK_VERBS = ['Audit', 'Refactor', 'Deploy', 'Benchmark', 'Review', 'Optimize', 'Document', 'Verify'];
const TASK_OBJECTS = ['API schema', 'checkout flow', 'auth tokens', 'CSV parser', 'cache layer', 'UI primitives'];
const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];

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

export const JsonMockGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [recordCountInput, setRecordCountInput] = useState<string>(String(DEFAULTS.recordCount));
  const [dataType, setDataType] = useState<MockDatasetType>(DEFAULTS.dataType);
  const [seed, setSeed] = useState<number>(101);

  const parsedCount = Number(recordCountInput);
  const isCountValid =
    recordCountInput.trim() !== '' &&
    Number.isInteger(parsedCount) &&
    parsedCount >= 1 &&
    parsedCount <= 50;

  const { jsonString, recordsCount, byteSize } = useMemo(() => {
    if (!isCountValid) {
      return { jsonString: '', recordsCount: 0, byteSize: 0 };
    }
    const rng = mulberry32(seed + (dataType === 'users' ? 11 : dataType === 'products' ? 29 : 53));
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

    const items = Array.from({ length: parsedCount }, (_, idx) => {
      const id = idx + 1;
      if (dataType === 'users') {
        const first = pick(FIRST_NAMES);
        const last = pick(LAST_NAMES);
        const handle = `${first.toLowerCase()}.${last.toLowerCase()}${id}`;
        return {
          id,
          name: `${first} ${last}`,
          email: `${handle}@example.com`,
          role: pick(ROLES),
          active: rng() > 0.2,
          createdAt: `2025-${String((idx % 12) + 1).padStart(2, '0')}-${String(((idx * 3) % 28) + 1).padStart(2, '0')}T09:00:00Z`,
        };
      }
      if (dataType === 'products') {
        const name = `${pick(PRODUCT_ADJS)} ${pick(PRODUCT_NOUNS)} ${100 + id * 10}`;
        return {
          id,
          sku: `SKU-${String(1000 + id * 7)}`,
          name,
          category: pick(PRODUCT_CATS),
          price: Number((19.99 + rng() * 280).toFixed(2)),
          inStock: rng() > 0.15,
          rating: Number((3.6 + rng() * 1.4).toFixed(1)),
        };
      }
      return {
        id,
        title: `${pick(TASK_VERBS)} ${pick(TASK_OBJECTS)}`,
        status: pick(TASK_STATUSES),
        priority: pick(TASK_PRIORITIES),
        assignee: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        estimatedHours: Math.floor(rng() * 8) + 1,
      };
    });

    const formatted = JSON.stringify(items, null, 2);
    return {
      jsonString: formatted,
      recordsCount: items.length,
      byteSize: new TextEncoder().encode(formatted).length,
    };
  }, [parsedCount, isCountValid, dataType, seed]);

  const handleRegenerate = () => {
    setSeed((prev) => prev + 17);
  };

  const handleReset = () => {
    setRecordCountInput(String(DEFAULTS.recordCount));
    setDataType(DEFAULTS.dataType);
    setSeed(101);
  };

  const presets = [
    {
      label: isEs ? '5 Usuarios' : '5 Users',
      onSelect: () => {
        setDataType('users');
        setRecordCountInput('5');
      },
    },
    {
      label: isEs ? '10 Productos' : '10 Products',
      onSelect: () => {
        setDataType('products');
        setRecordCountInput('10');
      },
    },
    {
      label: isEs ? '15 Tareas' : '15 Tasks',
      onSelect: () => {
        setDataType('tasks');
        setRecordCountInput('15');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Esquema JSON de Prueba' : 'Mock JSON Schema'}
      subtitle={
        isEs
          ? 'Genera colecciones JSON válidas para pruebas de API y prototipos.'
          : 'Generate valid structured JSON payloads for API testing and prototyping.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Conjuntos rápidos' : 'Quick presets'} presets={presets} />

      <ToolFieldGroup label={isEs ? 'Tipo de Esquema' : 'Dataset Schema'}>
        <ToolSegmentedControl<MockDatasetType>
          ariaLabel={isEs ? 'Tipo de datos JSON' : 'JSON dataset schema'}
          value={dataType}
          onChange={setDataType}
          options={[
            { value: 'users', label: isEs ? 'Usuarios' : 'Users' },
            { value: 'products', label: isEs ? 'Productos' : 'Products' },
            { value: 'tasks', label: isEs ? 'Tareas' : 'Tasks' },
          ]}
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Número de Registros (1–50)' : 'Record Count (1–50)'}
        htmlFor="json-mock-count"
        error={
          !isCountValid
            ? isEs
              ? 'Introduce un número entero entre 1 y 50.'
              : 'Enter a whole number between 1 and 50.'
            : undefined
        }
      >
        <input
          id="json-mock-count"
          type="number"
          min={1}
          max={50}
          value={recordCountInput}
          onChange={(e) => setRecordCountInput(e.target.value)}
          className="ui-input font-mono"
        />
      </ToolFieldGroup>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={!isCountValid}
          onClick={handleRegenerate}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {isEs ? 'Regenerar Datos' : 'Regenerate Data'}
        </button>
        <button
          type="button"
          disabled={!isCountValid}
          onClick={() =>
            downloadBlob(jsonString, `mock_${dataType}.json`, 'application/json;charset=utf-8')
          }
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar JSON' : 'Download JSON'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Carga JSON Generada' : 'Generated JSON Payload'}
      state={isCountValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Cantidad no válida' : 'Invalid Record Count'}
      errorMessage={
        isEs
          ? 'Indica entre 1 y 50 registros para generar un arreglo JSON válido.'
          : 'Specify between 1 and 50 records to generate a valid JSON array.'
      }
      primaryLabel={isEs ? 'Registros Generados' : 'Generated Records'}
      primaryValue={String(recordsCount)}
      primaryUnit={dataType}
      primarySubtext={
        isEs
          ? `RFC 8259 válido · ${byteSize.toLocaleString()} bytes`
          : `Valid RFC 8259 JSON · ${byteSize.toLocaleString()} bytes`
      }
      statusLabel={isEs ? 'JSON Válido' : 'Valid JSON'}
      statusTone="accent"
      copyText={jsonString}
      copyLabel={isEs ? 'Copiar JSON' : 'Copy JSON'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isCountValid && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label={isEs ? 'Registros' : 'Records'} value={String(recordsCount)} accent />
            <ToolMetricTile label={isEs ? 'Tamaño' : 'Size'} value={`${byteSize} B`} />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[380px] leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default JsonMockGeneratorCalculator;
