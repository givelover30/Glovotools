import { useMemo, useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
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

const DEFAULT_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjIwMDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function decodeBase64UrlJson(segment: string): Record<string, unknown> {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error('Segment contains invalid Base64URL characters.');
  }
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const raw = atob(padded);
  const utf8 = decodeURIComponent(
    Array.from(raw)
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const parsed = JSON.parse(utf8);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Decoded JSON segment must be an object.');
  }
  return parsed as Record<string, unknown>;
}

export default function JwtDecoderCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [token, setToken] = useState<string>(DEFAULT_JWT);
  const [copiedPart, setCopiedPart] = useState<'header' | 'payload' | null>(null);

  const decoded = useMemo(() => {
    const clean = token.trim();
    if (!clean) {
      return { state: 'empty' as const };
    }

    const parts = clean.split('.');
    if (parts.length !== 3) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Un JWT requiere exactamente 3 segmentos separados por puntos (header.payload.signature); se encontraron ${parts.length}.`
          : `A JWT must have exactly 3 dot-separated segments (header.payload.signature); found ${parts.length}.`
      };
    }

    const [rawHeader, rawPayload, rawSignature] = parts;
    if (!rawHeader || !rawPayload) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Los segmentos de cabecera (header) y carga útil (payload) no pueden estar vacíos.'
          : 'Header and payload segments cannot be empty.'
      };
    }

    try {
      const header = decodeBase64UrlJson(rawHeader);
      const payload = decodeBase64UrlJson(rawPayload);
      const hasSignature = rawSignature.length > 0;
      const expNum = typeof payload.exp === 'number' ? payload.exp : null;
      const iatNum = typeof payload.iat === 'number' ? payload.iat : null;
      const isExpired = expNum !== null ? Date.now() >= expNum * 1000 : false;
      const alg = typeof header.alg === 'string' ? header.alg : 'unknown';

      return {
        state: 'ready' as const,
        header,
        payload,
        headerJson: JSON.stringify(header, null, 2),
        payloadJson: JSON.stringify(payload, null, 2),
        signatureSegment: rawSignature,
        hasSignature,
        alg,
        expNum,
        iatNum,
        isExpired
      };
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Base64URL or JSON error';
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Error al decodificar Base64URL / JSON: ${detail}`
          : `Failed to decode Base64URL / JSON segment: ${detail}`
      };
    }
  }, [token, isEs]);

  const handleCopyPart = (part: 'header' | 'payload', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPart(part);
    window.setTimeout(() => setCopiedPart(null), 1600);
  };

  const handleClear = () => setToken('');
  const handleReset = () => setToken(DEFAULT_JWT);

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Decodificador JWT (Solo Inspección)' : 'JWT Decoder (Inspection Only)'}
          subtitle={
            isEs
              ? 'Decodifica cabecera y payload Base64URL localmente sin verificar la firma criptográfica.'
              : 'Decodes Base64URL header and payload locally. Does NOT perform cryptographic signature verification.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Token JWT codificado' : 'Encoded JWT String'}
            htmlFor="jwt-decoder-input"
            unit="RFC 7519"
          >
            <textarea
              id="jwt-decoder-input"
              rows={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              spellCheck={false}
              placeholder="header.payload.signature"
              className="ui-input font-mono text-xs leading-relaxed break-all resize-y"
            />
          </ToolFieldGroup>

          <div
            role="note"
            className="rounded-xl border border-status-warning/40 bg-status-warning-bg p-3.5 text-xs text-text-primary flex items-start gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-status-warning">
                {isEs
                  ? 'Firma NO verificada (Solo decodificación)'
                  : 'Signature Not Verified (Decoding Only)'}
              </div>
              <p className="text-text-secondary leading-relaxed">
                {isEs
                  ? 'Esta herramienta solo decodifica Base64URL en el navegador. Un JWT decodificado NO está autenticado ni verificado criptográficamente; valida siempre la firma en el servidor antes de confiar en sus claims.'
                  : 'This tool performs client-side Base64URL decoding only. Decoded claims are NOT cryptographically verified or authentic — always verify signatures server-side before trusting any JWT.'}
              </p>
            </div>
          </div>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'JWT de ejemplo' : 'Sample JWT',
                onSelect: () => setToken(DEFAULT_JWT)
              },
              {
                label: isEs ? 'JWT expirado' : 'Expired Claim',
                onSelect: () =>
                  setToken(
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJFeHBpcmVkIFVzZXIiLCJleHAiOjE1MTYyMzkwMjJ9.dummy_signature'
                  )
              },
              {
                label: isEs ? 'Segmento faltante' : 'Missing Segment',
                onSelect: () => setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0')
              },
              {
                label: isEs ? 'Base64URL inválido' : 'Invalid Base64URL',
                onSelect: () => setToken('%%%bad%%%.eyJzdWIiOiIxIn0.sig')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'JWT Decodificado (Sin Verificar)' : 'Decoded JWT (Unverified)'}
          state={decoded.state}
          primaryLabel={isEs ? 'Estado de inspección' : 'Inspection Status'}
          primaryValue={
            decoded.state === 'ready'
              ? isEs
                ? 'Decodificado (No Verificado)'
                : 'Decoded — Unverified'
              : undefined
          }
          primarySubtext={
            decoded.state === 'ready'
              ? isEs
                ? `Algoritmo declarado: ${decoded.alg}. Firma criptográfica NO comprobada.`
                : `Declared algorithm: ${decoded.alg}. Cryptographic signature has NOT been verified.`
              : undefined
          }
          statusLabel={
            decoded.state === 'ready'
              ? isEs
                ? 'Firma no verificada'
                : 'Signature Not Verified'
              : undefined
          }
          statusTone="warning"
          copyText={decoded.state === 'ready' ? decoded.payloadJson : undefined}
          copyLabel={isEs ? 'Copiar payload' : 'Copy payload'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Pega un JWT para decodificar' : 'Paste a JWT to decode'}
          emptyDescription={
            isEs
              ? 'Ingresa una cadena header.payload.signature a la izquierda para inspeccionar su JSON.'
              : 'Enter a header.payload.signature string on the left to inspect its decoded JSON.'
          }
          errorTitle={isEs ? 'Estructura JWT inválida' : 'Malformed JWT'}
          errorMessage={decoded.state === 'error' ? decoded.errorMessage : undefined}
        >
          {decoded.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Algoritmo (Header)' : 'Declared Alg'}
                  value={decoded.alg}
                />
                <ToolMetricTile
                  label={isEs ? 'Estado de exp' : 'exp Claim'}
                  value={
                    decoded.expNum === null
                      ? isEs
                        ? 'Sin exp'
                        : 'No exp'
                      : decoded.isExpired
                        ? isEs
                          ? 'Expirado'
                          : 'Expired'
                        : isEs
                          ? 'No expirado'
                          : 'Not Expired'
                  }
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Verificación de firma' : 'Signature Verification',
                    value: isEs ? 'NO VERIFICADA' : 'NOT VERIFIED',
                    highlight: true
                  },
                  {
                    label: isEs ? 'Segmento de firma' : 'Signature Segment',
                    value: decoded.hasSignature
                      ? isEs
                        ? `Presente (${decoded.signatureSegment.length} chars)`
                        : `Present (${decoded.signatureSegment.length} chars)`
                      : isEs
                        ? 'Ausente / Vacío'
                        : 'Missing / Empty'
                  },
                  ...(decoded.expNum !== null
                    ? [
                        {
                          label: isEs ? 'Expiración (exp UTC)' : 'Expiration (exp UTC)',
                          value: new Date(decoded.expNum * 1000).toISOString()
                        }
                      ]
                    : []),
                  ...(decoded.iatNum !== null
                    ? [
                        {
                          label: isEs ? 'Emitido (iat UTC)' : 'Issued At (iat UTC)',
                          value: new Date(decoded.iatNum * 1000).toISOString()
                        }
                      ]
                    : [])
                ]}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Cabecera (Header JSON)' : 'Decoded Header (JSON)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPart('header', decoded.headerJson)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-accent hover:bg-accent-light transition-colors cursor-pointer"
                  >
                    {copiedPart === 'header' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedPart === 'header'
                        ? isEs
                          ? 'Copiado'
                          : 'Copied'
                        : isEs
                          ? 'Copiar header'
                          : 'Copy header'}
                    </span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/70 font-mono text-xs text-text-primary overflow-x-auto whitespace-pre">
                  {decoded.headerJson}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Carga útil (Payload JSON)' : 'Decoded Payload (JSON)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPart('payload', decoded.payloadJson)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-accent hover:bg-accent-light transition-colors cursor-pointer"
                  >
                    {copiedPart === 'payload' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedPart === 'payload'
                        ? isEs
                          ? 'Copiado'
                          : 'Copied'
                        : isEs
                          ? 'Copiar payload'
                          : 'Copy payload'}
                    </span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/70 font-mono text-xs text-text-primary overflow-x-auto whitespace-pre">
                  {decoded.payloadJson}
                </pre>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
