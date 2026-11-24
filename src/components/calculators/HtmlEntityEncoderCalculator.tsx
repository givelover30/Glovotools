import { useMemo, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
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

type EntityMode = 'encode' | 'decode';

const DEFAULT_HTML = '<div class="card">Hello & welcome to "CalcTools"!</div>';

function encodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeHtmlEntities(raw: string): string {
  const parser = new DOMParser();
  const dom = parser.parseFromString(raw, 'text/html');
  return dom.body.textContent || '';
}

export default function HtmlEntityEncoderCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [mode, setMode] = useState<EntityMode>('encode');
  const [input, setInput] = useState<string>(DEFAULT_HTML);

  const conversion = useMemo(() => {
    if (!input) {
      return { state: 'empty' as const };
    }
    const output = mode === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input);
    const entityCount =
      mode === 'encode'
        ? (output.match(/&(?:amp|lt|gt|quot|#039);/g) || []).length
        : (input.match(/&(?:#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]+);/g) || []).length;

    return {
      state: 'ready' as const,
      output,
      entityCount
    };
  }, [input, mode]);

  const handleSwap = () => {
    const nextMode: EntityMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    if (conversion.state === 'ready') {
      setInput(conversion.output);
    }
  };

  const handleClear = () => setInput('');
  const handleReset = () => {
    setMode('encode');
    setInput(DEFAULT_HTML);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Entrada HTML / Texto' : 'HTML / Text Input'}
          subtitle={
            isEs
              ? 'Escapa caracteres especiales de HTML o decodifica entidades nombradas y numéricas.'
              : 'Escape reserved HTML characters or decode named and numeric HTML entities.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolSegmentedControl
            ariaLabel={isEs ? 'Modo de entidades HTML' : 'HTML entity mode'}
            value={mode}
            onChange={(next) => setMode(next)}
            options={[
              { value: 'encode', label: isEs ? 'Codificar entidades' : 'Encode Entities' },
              { value: 'decode', label: isEs ? 'Decodificar entidades' : 'Decode Entities' }
            ]}
          />

          <ToolFieldGroup
            label={
              mode === 'encode'
                ? isEs
                  ? 'HTML o texto sin escapar'
                  : 'Raw HTML / Text'
                : isEs
                  ? 'Cadena con entidades HTML'
                  : 'HTML Entity String'
            }
            htmlFor="html-entity-input"
            unit="HTML5"
          >
            <textarea
              id="html-entity-input"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? '<div class="card">Hello & welcome</div>'
                  : '&lt;div&gt;&copy; 2026 &amp; &#169; &#x2713;&lt;/div&gt;'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <button type="button" onClick={handleSwap} className="ui-btn-secondary w-full">
            <ArrowRightLeft className="w-4 h-4" />
            <span>
              {mode === 'encode'
                ? isEs
                  ? 'Invertir a Decodificar (usar salida)'
                  : 'Swap to Decode (use output)'
                : isEs
                  ? 'Invertir a Codificar (usar salida)'
                  : 'Swap to Encode (use output)'}
            </span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'HTML básico' : 'Default HTML',
                onSelect: () => {
                  setMode('encode');
                  setInput(DEFAULT_HTML);
                }
              },
              {
                label: isEs ? 'Entidades con nombre' : 'Named Entities',
                onSelect: () => {
                  setMode('decode');
                  setInput('&copy; 2026 CalcTools &mdash; 5 &lt; 10 &amp; &quot;ready&quot;');
                }
              },
              {
                label: isEs ? 'Entidades numéricas / hex' : 'Numeric & Hex',
                onSelect: () => {
                  setMode('decode');
                  setInput('&#169; &#8364; &#x2713; &#x1F680; &#039;ok&#039;');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={
            mode === 'encode'
              ? isEs
                ? 'Entidades HTML codificadas'
                : 'Encoded HTML Entities'
              : isEs
                ? 'Texto decodificado'
                : 'Decoded Text Output'
          }
          state={conversion.state}
          emptyTitle={isEs ? 'Ingresa texto o entidades HTML' : 'Enter HTML or entity text'}
          emptyDescription={
            isEs
              ? 'Escribe HTML a la izquierda para escapar etiquetas o decodificar entidades nombradas y numéricas.'
              : 'Enter HTML on the left to escape tags or decode named and numeric entities.'
          }
          copyText={conversion.state === 'ready' ? conversion.output : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {conversion.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Entidades procesadas' : 'Entities Processed'}
                  value={String(conversion.entityCount)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud de salida' : 'Output Length'}
                  value={`${conversion.output.length} ${isEs ? 'car.' : 'chars'}`}
                />
              </div>

              <ToolFieldGroup
                label={isEs ? 'Resultado' : 'Result Output'}
                htmlFor="html-entity-output"
              >
                <textarea
                  id="html-entity-output"
                  rows={6}
                  readOnly
                  value={conversion.output}
                  className="ui-input font-mono text-xs leading-relaxed resize-y bg-surface-secondary/60"
                />
              </ToolFieldGroup>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
