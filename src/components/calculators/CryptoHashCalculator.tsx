import { useEffect, useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_INPUT = 'Hello CalcTools!';

interface HashDigests {
  sha256: string;
  sha512: string;
  sha384: string;
  sha1: string;
  byteLength: number;
}

async function digestHex(algorithm: string, data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data as BufferSource);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function CryptoHashCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_INPUT);
  const [digests, setDigests] = useState<HashDigests | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function compute() {
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        if (active) {
          setErrorMessage(
            isEs
              ? 'Web Crypto API (crypto.subtle) no está disponible en este contexto.'
              : 'Web Crypto API (crypto.subtle) is unavailable in this browser context.'
          );
        }
        return;
      }

      try {
        const bytes = new TextEncoder().encode(input);
        const [sha256, sha512, sha384, sha1] = await Promise.all([
          digestHex('SHA-256', bytes),
          digestHex('SHA-512', bytes),
          digestHex('SHA-384', bytes),
          digestHex('SHA-1', bytes)
        ]);
        if (active) {
          setDigests({ sha256, sha512, sha384, sha1, byteLength: bytes.length });
          setErrorMessage(null);
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Error computing Web Crypto digest.'
          );
        }
      }
    }
    compute();
    return () => {
      active = false;
    };
  }, [input, isEs]);

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_INPUT);

  const hashRows = digests
    ? [
        { key: 'sha256', label: 'SHA-256', bits: '256-bit', value: digests.sha256, note: isEs ? 'Estándar recomendado' : 'Recommended standard' },
        { key: 'sha512', label: 'SHA-512', bits: '512-bit', value: digests.sha512, note: isEs ? 'Alta seguridad' : 'High security' },
        { key: 'sha384', label: 'SHA-384', bits: '384-bit', value: digests.sha384, note: 'SHA-2 family' },
        { key: 'sha1', label: 'SHA-1', bits: '160-bit', value: digests.sha1, note: isEs ? 'Legado (no usar en seguridad)' : 'Legacy (non-cryptographic)' }
      ]
    : [];

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Generador de Hash Criptográfico (Web Crypto)' : 'Cryptographic Hash Generator (Web Crypto)'}
          subtitle={
            isEs
              ? 'Calcula resúmenes SHA-256, SHA-512, SHA-384 y SHA-1 usando crypto.subtle localmente.'
              : 'Computes genuine SHA-256, SHA-512, SHA-384, and SHA-1 digests using browser Web Crypto.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Texto de entrada (UTF-8)' : 'Input Text (UTF-8)'}
            htmlFor="crypto-hash-input"
            unit={`${digests ? digests.byteLength : 0} B`}
          >
            <textarea
              id="crypto-hash-input"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={
                isEs
                  ? 'Escribe texto (incluso cadena vacía) para calcular sus hashes...'
                  : 'Enter text (including empty string) to compute cryptographic hashes...'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Vectores de prueba:' : 'Test Vectors:'}
            presets={[
              { label: 'Default', onSelect: () => setInput(DEFAULT_INPUT) },
              { label: '"abc" (NIST)', onSelect: () => setInput('abc') },
              { label: isEs ? 'Cadena vacía ""' : 'Empty ""', onSelect: () => setInput('') },
              { label: 'Unicode UTF-8', onSelect: () => setInput('¡Hola CalcTools! 東京 🔐') }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resúmenes criptográficos' : 'Cryptographic Digests'}
          state={errorMessage ? 'error' : 'ready'}
          primaryLabel="SHA-256"
          primaryValue={digests ? digests.sha256 : '...'}
          primarySubtext={
            digests
              ? isEs
                ? `Entrada UTF-8 de ${digests.byteLength} bytes (${input.length} caracteres).`
                : `UTF-8 input: ${digests.byteLength} bytes (${input.length} characters).`
              : undefined
          }
          statusLabel="Web Crypto"
          statusTone="success"
          copyText={digests?.sha256}
          copyLabel={isEs ? 'Copiar SHA-256' : 'Copy SHA-256'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          errorTitle={isEs ? 'Error Web Crypto' : 'Web Crypto Error'}
          errorMessage={errorMessage || undefined}
        >
          {digests && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Bytes UTF-8' : 'UTF-8 Bytes'}
                  value={`${digests.byteLength} B`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Algoritmos' : 'Algorithms'}
                  value="4 (SHA-2 / SHA-1)"
                />
              </div>

              <div className="space-y-3">
                {hashRows.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-xs font-bold text-text-primary">{row.label}</span>
                        <span className="text-[11px] font-mono text-text-tertiary">
                          ({row.bits})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(row.value, row.key)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-accent hover:bg-accent-light transition-colors cursor-pointer shrink-0"
                      >
                        {copiedKey === row.key ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedKey === row.key
                            ? isEs
                              ? 'Copiado'
                              : 'Copied'
                            : isEs
                              ? 'Copiar'
                              : 'Copy'}
                        </span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-text-primary break-all select-all leading-relaxed">
                      {row.value}
                    </div>
                    <div className="text-[11px] text-text-tertiary">{row.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
