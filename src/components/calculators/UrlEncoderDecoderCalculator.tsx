import { useMemo, useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_URL = 'https://example.com/search?q=hello world & query=test#anchor';

export default function UrlEncoderDecoderCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_URL);
  const [copiedField, setCopiedField] = useState<'enc' | 'dec' | null>(null);

  const computed = useMemo(() => {
    if (!input) {
      return { state: 'empty' as const };
    }

    let encoded = '';
    let encodeError: string | null = null;
    try {
      encoded = encodeURIComponent(input);
    } catch {
      encodeError = isEs
        ? 'No se pudo codificar la cadena (secuencia Unicode inválida).'
        : 'Unable to percent-encode string (invalid surrogate sequence).';
    }

    let decoded = '';
    let decodeError: string | null = null;
    try {
      decoded = decodeURIComponent(input);
    } catch {
      decodeError = isEs
        ? 'Secuencia de escape porcentual inválida (ej. %E0%A4%A o %ZZ).'
        : 'Invalid percent-encoding sequence (e.g. malformed % sequence).';
    }

    return {
      state: encodeError && decodeError ? ('error' as const) : ('ready' as const),
      encoded,
      encodeError,
      decoded,
      decodeError
    };
  }, [input, isEs]);

  const handleCopyField = (text: string, field: 'enc' | 'dec') => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1800);
  };

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_URL);

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Cadena o URL de entrada' : 'Input String or URL'}
          subtitle={
            isEs
              ? 'Codifica y decodifica componentes de URL con soporte completo para caracteres reservados y UTF-8.'
              : 'Percent-encode and decode URL components with full reserved character and UTF-8 support.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Texto o URL' : 'String / URL'}
            htmlFor="url-codec-input"
            unit="RFC 3986"
          >
            <textarea
              id="url-codec-input"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/search?q=hello world"
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Consulta básica' : 'Default Query URL',
                onSelect: () => setInput(DEFAULT_URL)
              },
              {
                label: isEs ? 'Caracteres reservados' : 'Reserved Characters',
                onSelect: () => setInput('a=1&b=2/3?x=foo+bar#top')
              },
              {
                label: 'Unicode / UTF-8',
                onSelect: () => setInput('https://example.com/café?ciudad=São Paulo&tag=東京')
              },
              {
                label: isEs ? 'URL ya codificada' : 'Encoded Sample',
                onSelect: () =>
                  setInput('https%3A%2F%2Fexample.com%2Fcaf%C3%A9%3Fq%3Dhello%20world')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultados URL' : 'URL Outputs'}
          state={computed.state}
          emptyTitle={isEs ? 'Ingresa una URL o texto' : 'Enter a URL or text'}
          emptyDescription={
            isEs
              ? 'Escribe o pega cualquier URL a la izquierda para obtener las versiones codificada y decodificada.'
              : 'Type or paste any URL on the left to view both percent-encoded and decoded results.'
          }
          errorTitle={isEs ? 'Error de procesamiento URL' : 'URL processing error'}
          errorMessage={
            computed.state === 'error'
              ? computed.encodeError || computed.decodeError || undefined
              : undefined
          }
          copyText={computed.state === 'ready' && computed.encoded ? computed.encoded : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {computed.state === 'ready' && (
            <div className="space-y-4">
              {/* Percent-Encoded Output */}
              <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Codificado (Percent-Encoded)' : 'Encoded (Percent-Encoded)'}
                  </span>
                  {computed.encoded && (
                    <button
                      type="button"
                      onClick={() => handleCopyField(computed.encoded, 'enc')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-accent hover:bg-accent-light border border-border-subtle transition-colors cursor-pointer"
                    >
                      {copiedField === 'enc' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedField === 'enc'
                          ? isEs
                            ? 'Copiado'
                            : 'Copied'
                          : isEs
                            ? 'Copiar'
                            : 'Copy'}
                      </span>
                    </button>
                  )}
                </div>
                {computed.encodeError ? (
                  <div role="alert" className="ui-error-state flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{computed.encodeError}</span>
                  </div>
                ) : (
                  <pre
                    data-testid="url-encoded-output"
                    className="font-mono text-xs text-text-primary break-all whitespace-pre-wrap leading-relaxed"
                  >
                    {computed.encoded}
                  </pre>
                )}
              </div>

              {/* Decoded Output */}
              <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Decodificado' : 'Decoded'}
                  </span>
                  {!computed.decodeError && computed.decoded && (
                    <button
                      type="button"
                      onClick={() => handleCopyField(computed.decoded, 'dec')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-accent hover:bg-accent-light border border-border-subtle transition-colors cursor-pointer"
                    >
                      {copiedField === 'dec' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedField === 'dec'
                          ? isEs
                            ? 'Copiado'
                            : 'Copied'
                          : isEs
                            ? 'Copiar'
                            : 'Copy'}
                      </span>
                    </button>
                  )}
                </div>
                {computed.decodeError ? (
                  <div role="alert" className="ui-error-state flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{computed.decodeError}</span>
                  </div>
                ) : (
                  <pre
                    data-testid="url-decoded-output"
                    className="font-mono text-xs text-text-primary break-all whitespace-pre-wrap leading-relaxed"
                  >
                    {computed.decoded}
                  </pre>
                )}
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
