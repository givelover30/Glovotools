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

type CodecMode = 'encode' | 'decode';

const DEFAULT_TEXT = 'Hello CalcTools Base64!';

function encodeUtf8Base64(text: string): string {
  return btoa(
    encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function decodeUtf8Base64(b64: string): string {
  const normalized = b64.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Input contains invalid Base64 characters or padding.');
  }
  const decodedBytes = atob(normalized);
  return decodeURIComponent(
    Array.from(decodedBytes)
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export default function Base64CodecCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [mode, setMode] = useState<CodecMode>('encode');
  const [input, setInput] = useState<string>(DEFAULT_TEXT);

  const result = useMemo(() => {
    if (!input) {
      return { state: 'empty' as const };
    }
    try {
      const value = mode === 'encode' ? encodeUtf8Base64(input) : decodeUtf8Base64(input);
      const inputBytes = new TextEncoder().encode(input).length;
      const outputBytes = new TextEncoder().encode(value).length;
      return {
        state: 'ready' as const,
        value,
        inputBytes,
        outputBytes
      };
    } catch (err: any) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Entrada Base64 inválida (${err?.message || 'verifica el formato'})`
          : `Invalid Base64 input (${err?.message || 'check formatting'})`
      };
    }
  }, [input, mode, isEs]);

  const handleSwapMode = () => {
    const nextMode: CodecMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    if (result.state === 'ready' && result.value) {
      setInput(result.value);
    }
  };

  const handleClear = () => setInput('');
  const handleReset = () => {
    setMode('encode');
    setInput(DEFAULT_TEXT);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={
            mode === 'encode'
              ? isEs
                ? 'Codificador Base64 (UTF-8)'
                : 'Base64 Encoder (UTF-8)'
              : isEs
                ? 'Decodificador Base64 (UTF-8)'
                : 'Base64 Decoder (UTF-8)'
          }
          subtitle={
            isEs
              ? 'Codifica y decodifica cadenas UTF-8, acentos y emojis de forma segura en el navegador.'
              : 'Safely encode and decode UTF-8 text, accented characters, and emojis locally.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolSegmentedControl
            ariaLabel={isEs ? 'Modo Base64' : 'Base64 mode'}
            value={mode}
            onChange={(next) => setMode(next)}
            options={[
              { value: 'encode', label: isEs ? 'Codificar' : 'Encode' },
              { value: 'decode', label: isEs ? 'Decodificar' : 'Decode' }
            ]}
          />

          <ToolFieldGroup
            label={
              mode === 'encode'
                ? isEs
                  ? 'Texto plano de entrada'
                  : 'Plain Text Input'
                : isEs
                  ? 'Cadena Base64 de entrada'
                  : 'Base64 Encoded Input'
            }
            htmlFor="base64-codec-input"
            unit="UTF-8"
          >
            <textarea
              id="base64-codec-input"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? isEs
                    ? 'Escribe texto para codificar...'
                    : 'Enter text to encode...'
                  : isEs
                    ? 'Pega una cadena Base64 para decodificar...'
                    : 'Enter Base64 string to decode...'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <button
            type="button"
            onClick={handleSwapMode}
            className="ui-btn-secondary w-full"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>
              {mode === 'encode'
                ? isEs
                  ? 'Cambiar a Decodificar (usar salida)'
                  : 'Switch to Decode (use output)'
                : isEs
                  ? 'Cambiar a Codificar (usar salida)'
                  : 'Switch to Encode (use output)'}
            </span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Texto básico' : 'Default Text',
                onSelect: () => {
                  setMode('encode');
                  setInput(DEFAULT_TEXT);
                }
              },
              {
                label: 'Unicode / UTF-8',
                onSelect: () => {
                  setMode('encode');
                  setInput('¡Hola CalcTools! 東京 🚀');
                }
              },
              {
                label: isEs ? 'Ejemplo Base64' : 'Sample Base64',
                onSelect: () => {
                  setMode('decode');
                  setInput('SGVsbG8gQ2FsY1Rvb2xzIEJhc2U2NCE=');
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
                ? 'Resultado Base64'
                : 'Encoded Base64 Output'
              : isEs
                ? 'Texto decodificado'
                : 'Decoded Text Output'
          }
          state={result.state}
          emptyTitle={isEs ? 'Ingresa contenido para procesar' : 'Enter content to process'}
          emptyDescription={
            isEs
              ? 'Escribe texto o una cadena Base64 a la izquierda para ver el resultado al instante.'
              : 'Enter plain text or a Base64 string on the left to view live results.'
          }
          errorTitle={isEs ? 'Error de decodificación Base64' : 'Base64 decoding error'}
          errorMessage={result.state === 'error' ? result.errorMessage : undefined}
          copyText={result.state === 'ready' ? result.value : undefined}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
        >
          {result.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Bytes de entrada' : 'Input Bytes'}
                  value={`${result.inputBytes} B`}
                />
                <ToolMetricTile
                  label={isEs ? 'Bytes de salida' : 'Output Bytes'}
                  value={`${result.outputBytes} B`}
                  accent
                />
              </div>

              <ToolFieldGroup
                label={
                  mode === 'encode'
                    ? isEs
                      ? 'Salida Base64'
                      : 'Base64 Output'
                    : isEs
                      ? 'Salida UTF-8'
                      : 'UTF-8 Output'
                }
                htmlFor="base64-codec-output"
              >
                <textarea
                  id="base64-codec-output"
                  rows={6}
                  readOnly
                  value={result.value}
                  className="ui-input font-mono text-xs leading-relaxed break-all resize-y bg-surface-secondary/60"
                />
              </ToolFieldGroup>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
