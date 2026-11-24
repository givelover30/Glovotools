import { useMemo, useState } from 'react';
import { Braces, Minimize2, Sparkles } from 'lucide-react';
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

const DEFAULT_JSON = `{
  "name": "CalcTools",
  "version": "1.0.0",
  "features": ["validators", "converters", "math"]
}`;

function computeJsonStats(value: unknown, depth = 1): { nodes: number; maxDepth: number } {
  if (value === null || typeof value !== 'object') {
    return { nodes: 1, maxDepth: depth };
  }
  const entries = Array.isArray(value) ? value : Object.values(value);
  if (entries.length === 0) {
    return { nodes: 1, maxDepth: depth };
  }
  let nodes = 1;
  let maxDepth = depth;
  for (const child of entries) {
    const childStats = computeJsonStats(child, depth + 1);
    nodes += childStats.nodes;
    if (childStats.maxDepth > maxDepth) {
      maxDepth = childStats.maxDepth;
    }
  }
  return { nodes, maxDepth };
}

export default function JsonValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_JSON);

  const validation = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }
    try {
      const parsed = JSON.parse(trimmed);
      const formatted = JSON.stringify(parsed, null, 2);
      const minified = JSON.stringify(parsed);
      const isArray = Array.isArray(parsed);
      const isObject = parsed !== null && typeof parsed === 'object' && !isArray;
      const rootType = isArray
        ? 'Array'
        : isObject
          ? 'Object'
          : parsed === null
            ? 'Null'
            : typeof parsed;
      const topLevelCount = isArray
        ? parsed.length
        : isObject
          ? Object.keys(parsed).length
          : 1;
      const stats = computeJsonStats(parsed);
      const byteSize = new TextEncoder().encode(trimmed).length;
      const isEmptyContainer = (isArray || isObject) && topLevelCount === 0;

      return {
        state: 'ready' as const,
        parsed,
        formatted,
        minified,
        rootType,
        topLevelCount,
        nodes: stats.nodes,
        maxDepth: stats.maxDepth,
        byteSize,
        isEmptyContainer
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON syntax';
      return {
        state: 'error' as const,
        errorMessage: message
      };
    }
  }, [input]);

  const handleFormat = () => {
    if (validation.state === 'ready') {
      setInput(validation.formatted);
    }
  };

  const handleMinify = () => {
    if (validation.state === 'ready') {
      setInput(validation.minified);
    }
  };

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_JSON);

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador y Formateador JSON' : 'JSON Validator & Formatter'}
          subtitle={
            isEs
              ? 'Valida sintaxis JSON (RFC 8259), formatea con sangría o minifica al instante.'
              : 'Validate RFC 8259 JSON syntax, prettify with 2-space indentation, or minify.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Documento JSON' : 'JSON Input'}
            htmlFor="json-validator-input"
            unit="RFC 8259"
          >
            <textarea
              id="json-validator-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={
                isEs ? 'Pega tu JSON aquí...' : 'Paste your JSON document here...'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleFormat}
              disabled={validation.state !== 'ready'}
              className="ui-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEs ? 'Formatear JSON' : 'Format / Prettify'}</span>
            </button>
            <button
              type="button"
              onClick={handleMinify}
              disabled={validation.state !== 'ready'}
              className="ui-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{isEs ? 'Minificar JSON' : 'Minify JSON'}</span>
            </button>
          </div>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Objeto anidado' : 'Nested Object',
                onSelect: () => setInput(DEFAULT_JSON)
              },
              {
                label: isEs ? 'Arreglo JSON' : 'JSON Array',
                onSelect: () =>
                  setInput(
                    JSON.stringify(
                      [
                        { id: 1, tool: 'JSON Validator', active: true },
                        { id: 2, tool: 'CSV Validator', active: true }
                      ],
                      null,
                      2
                    )
                  )
              },
              {
                label: isEs ? 'Objeto vacío {}' : 'Empty Object {}',
                onSelect: () => setInput('{}')
              },
              {
                label: isEs ? 'JSON inválido' : 'Malformed JSON',
                onSelect: () => setInput('{\n  "name": "CalcTools",\n  "broken": [1, 2, ]\n}')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado de validación' : 'Validation Result'}
          state={validation.state}
          primaryLabel={isEs ? 'Estado JSON' : 'JSON Status'}
          primaryValue={
            validation.state === 'ready'
              ? isEs
                ? 'JSON Válido'
                : 'Valid JSON'
              : undefined
          }
          primarySubtext={
            validation.state === 'ready'
              ? validation.isEmptyContainer
                ? isEs
                  ? `Contenedor raíz ${validation.rootType} válido sin elementos.`
                  : `Valid empty root ${validation.rootType} container.`
                : isEs
                  ? `Estructura ${validation.rootType} válida con ${validation.topLevelCount} elemento(s) de nivel superior.`
                  : `Valid ${validation.rootType} structure with ${validation.topLevelCount} top-level item(s).`
              : undefined
          }
          statusLabel={
            validation.state === 'ready'
              ? validation.rootType
              : undefined
          }
          statusTone="success"
          copyText={validation.state === 'ready' ? validation.formatted : undefined}
          copyLabel={isEs ? 'Copiar formateado' : 'Copy formatted'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa JSON para validar' : 'Enter JSON to validate'}
          emptyDescription={
            isEs
              ? 'Pega cualquier objeto, arreglo o valor JSON a la izquierda para comprobar su sintaxis.'
              : 'Paste any JSON object, array, or value on the left to inspect its syntax.'
          }
          errorTitle={isEs ? 'Error de sintaxis JSON' : 'Invalid JSON Syntax'}
          errorMessage={validation.state === 'error' ? validation.errorMessage : undefined}
        >
          {validation.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Tipo raíz' : 'Root Type'}
                  value={validation.rootType}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Claves / Ítems' : 'Top-Level Items'}
                  value={String(validation.topLevelCount)}
                />
                <ToolMetricTile
                  label={isEs ? 'Profundidad máx.' : 'Max Depth'}
                  value={String(validation.maxDepth)}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Total de nodos' : 'Total Parsed Nodes',
                    value: String(validation.nodes)
                  },
                  {
                    label: isEs ? 'Tamaño UTF-8' : 'UTF-8 Byte Size',
                    value: `${validation.byteSize} B`
                  },
                  {
                    label: isEs ? 'Longitud minificada' : 'Minified Length',
                    value: `${validation.minified.length} chars`
                  }
                ]}
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Braces className="w-3.5 h-3.5 text-accent" />
                  <span>{isEs ? 'Vista previa formateada' : 'Formatted Preview'}</span>
                </div>
                <pre className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/70 font-mono text-xs text-text-primary overflow-x-auto max-h-60 whitespace-pre">
                  {validation.formatted}
                </pre>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
