import { useMemo, useState } from 'react';
import { Check, Copy, Download, RefreshCw } from 'lucide-react';
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

/**
 * Cryptographically secure RFC 4122 UUID v4 generator.
 * Uses crypto.randomUUID() when available, falling back strictly to crypto.getRandomValues().
 */
function generateSecureUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant (10xx)
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  throw new Error('Cryptographically secure random generator is unavailable.');
}

export default function UuidGeneratorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generated = useMemo(() => {
    void seed;
    const safeCount = Math.min(50, Math.max(1, Number.isFinite(count) ? Math.floor(count) : 5));
    try {
      const list: string[] = [];
      for (let i = 0; i < safeCount; i++) {
        let id = generateSecureUuidV4();
        if (!hyphens) id = id.replace(/-/g, '');
        if (uppercase) id = id.toUpperCase();
        list.push(id);
      }
      return { state: 'ready' as const, list, count: safeCount };
    } catch (err: unknown) {
      return {
        state: 'error' as const,
        errorMessage: err instanceof Error ? err.message : 'Unable to generate UUIDs'
      };
    }
  }, [count, uppercase, hyphens, seed]);

  const handleCopyOne = (uuid: string, idx: number) => {
    navigator.clipboard?.writeText(uuid);
    setCopiedIdx(idx);
    window.setTimeout(() => setCopiedIdx(null), 1600);
  };

  const handleDownloadJson = () => {
    if (generated.state !== 'ready') return;
    const blob = new Blob([JSON.stringify(generated.list, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uuids-v4-${generated.count}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCount(5);
    setUppercase(false);
    setHyphens(true);
    setSeed((s) => s + 1);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Generador de UUID v4 (RFC 4122)' : 'UUID v4 Generator (RFC 4122)'}
          subtitle={
            isEs
              ? 'Genera identificadores únicos v4 con entropía criptográfica (Web Crypto API).'
              : 'Generates cryptographically secure RFC 4122 version 4 UUIDs via Web Crypto API.'
          }
          onReset={handleReset}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Cantidad a generar' : 'Quantity to Generate'}
            htmlFor="uuid-count-range"
            unit={`${count} UUID${count === 1 ? '' : 's'}`}
          >
            <input
              id="uuid-count-range"
              type="range"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <UiCheckbox
              id="uuid-hyphens"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              label={isEs ? 'Incluir guiones (-)' : 'Include Hyphens (-)'}
            />
            <UiCheckbox
              id="uuid-uppercase"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              label={isEs ? 'Mayúsculas (A–F)' : 'Uppercase Hex (A–F)'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="ui-btn-primary"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isEs ? 'Regenerar UUIDs' : 'Regenerate UUIDs'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={generated.state !== 'ready'}
              className="ui-btn-secondary disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isEs ? 'Descargar JSON' : 'Download JSON'}</span>
            </button>
          </div>

          <ToolPresetBar
            label={isEs ? 'Cantidad:' : 'Quick Count:'}
            presets={[
              { label: '1 UUID', onSelect: () => setCount(1) },
              { label: '5 UUIDs', onSelect: () => setCount(5) },
              { label: '10 UUIDs', onSelect: () => setCount(10) },
              { label: '25 UUIDs', onSelect: () => setCount(25) }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'UUIDs v4 generados' : 'Generated UUIDs v4'}
          state={generated.state}
          primaryLabel={isEs ? 'Primer UUID generado' : 'Primary UUID v4'}
          primaryValue={generated.state === 'ready' ? generated.list[0] : undefined}
          primarySubtext={
            generated.state === 'ready'
              ? isEs
                ? `${generated.count} identificador(es) v4 • ${hyphens ? '36' : '32'} caracteres cada uno.`
                : `${generated.count} RFC 4122 v4 identifier(s) • ${hyphens ? '36' : '32'} characters each.`
              : undefined
          }
          statusLabel="RFC 4122 v4"
          statusTone="success"
          copyText={generated.state === 'ready' ? generated.list.join('\n') : undefined}
          copyLabel={isEs ? 'Copiar todos' : 'Copy all'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          errorTitle={isEs ? 'Error de generación UUID' : 'UUID Generation Error'}
          errorMessage={generated.state === 'error' ? generated.errorMessage : undefined}
        >
          {generated.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Cantidad' : 'Count'}
                  value={String(generated.count)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud' : 'Length'}
                  value={hyphens ? '36 ch' : '32 ch'}
                />
                <ToolMetricTile
                  label={isEs ? 'Versión' : 'Version'}
                  value="v4 CSPRNG"
                />
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 divide-y divide-border-subtle max-h-72 overflow-y-auto font-mono text-xs">
                {generated.list.map((uuid, idx) => (
                  <div
                    key={`${uuid}-${idx}`}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <span className="text-text-tertiary w-6 shrink-0 select-none">{idx + 1}.</span>
                    <span className="flex-1 min-w-0 break-all select-all text-text-primary">
                      {uuid}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOne(uuid, idx)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-text-secondary hover:text-accent hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3 h-3 text-status-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedIdx === idx ? (isEs ? 'OK' : 'Copied') : isEs ? 'Copiar' : 'Copy'}</span>
                    </button>
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
