import React, { useMemo, useState } from 'react';
import { AlertTriangle, FileUp } from 'lucide-react';
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

const DEFAULT_HEX = '89 50 4E 47 0D 0A 1A 0A';

interface SignatureSpec {
  prefix: string;
  mime: string;
  type: string;
  extensions: string[];
}

const SIGNATURES: SignatureSpec[] = [
  { prefix: '89504E47', mime: 'image/png', type: 'PNG Image', extensions: ['png'] },
  { prefix: 'FFD8FF', mime: 'image/jpeg', type: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
  { prefix: '25504446', mime: 'application/pdf', type: 'PDF Document', extensions: ['pdf'] },
  {
    prefix: '504B0304',
    mime: 'application/zip',
    type: 'ZIP / Office Document (DOCX/XLSX/PPTX)',
    extensions: ['zip', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'jar']
  },
  { prefix: '47494638', mime: 'image/gif', type: 'GIF Image', extensions: ['gif'] },
  { prefix: '1F8B08', mime: 'application/gzip', type: 'GZIP Archive', extensions: ['gz', 'gzip'] },
  { prefix: '52494646', mime: 'image/webp', type: 'RIFF Container (WebP / WAV / AVI)', extensions: ['webp', 'wav', 'avi'] }
];

export default function MimeSignatureCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [hex, setHex] = useState<string>(DEFAULT_HEX);
  const [expectedExt, setExpectedExt] = useState<string>('png');
  const [loadedFileName, setLoadedFileName] = useState<string>('');

  const analysis = useMemo(() => {
    const trimmed = hex.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }

    if (/[^0-9a-fA-F\s:-]/.test(trimmed)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'La firma debe contener solo dígitos hexadecimales (0–9, A–F) y espacios.'
          : 'Magic byte header must contain hexadecimal digits (0–9, A–F) and spaces only.'
      };
    }

    const clean = trimmed.replace(/[\s:-]/g, '').toUpperCase();
    if (clean.length < 4 || clean.length % 2 !== 0) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Ingresa al menos 2 bytes completos (número par de caracteres hexadecimales).'
          : 'Enter at least 2 complete bytes (an even number of hexadecimal characters).'
      };
    }

    const matched = SIGNATURES.find((sig) => clean.startsWith(sig.prefix)) || null;
    const normalizedExt = expectedExt.trim().replace(/^\./, '').toLowerCase();

    const extensionMismatch =
      Boolean(normalizedExt) &&
      Boolean(matched) &&
      !matched!.extensions.includes(normalizedExt);

    const formattedBytes = clean.match(/.{1,2}/g)?.join(' ') || clean;

    return {
      state: 'ready' as const,
      clean,
      formattedBytes,
      byteCount: clean.length / 2,
      matched,
      normalizedExt,
      extensionMismatch
    };
  }, [hex, expectedExt, isEs]);

  const handleFileInspect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const slice = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(slice);
    const hexString = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    setHex(hexString);
    setLoadedFileName(file.name);
    const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
    setExpectedExt(ext);
    e.target.value = '';
  };

  const handleClear = () => {
    setHex('');
    setExpectedExt('');
    setLoadedFileName('');
  };

  const handleReset = () => {
    setHex(DEFAULT_HEX);
    setExpectedExt('png');
    setLoadedFileName('');
  };

  const copySummary =
    analysis.state === 'ready'
      ? `Bytes: ${analysis.formattedBytes} | Detected: ${analysis.matched ? `${analysis.matched.type} (${analysis.matched.mime})` : 'Unknown Signature'}${analysis.extensionMismatch ? ` | MISMATCH with .${analysis.normalizedExt}` : ''}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Verificador de Firma MIME / Magic Bytes' : 'MIME Type & Magic Bytes Inspector'}
          subtitle={
            isEs
              ? 'Identifica el tipo real de archivo mediante sus bytes iniciales y detecta discrepancias de extensión.'
              : 'Identifies true file formats from leading magic bytes and detects spoofed or mismatched extensions.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Bytes iniciales en hexadecimal' : 'Leading Magic Bytes (Hex)'}
            htmlFor="mime-hex-input"
            unit="HEX"
          >
            <input
              id="mime-hex-input"
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="89 50 4E 47 0D 0A 1A 0A"
              className="ui-input font-mono text-sm uppercase"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Extensión esperada (opcional)' : 'Expected File Extension (Optional)'}
            htmlFor="mime-ext-input"
            hint={
              isEs
                ? 'Opcional: compara la extensión declarada (ej. png, pdf, jpg) con los bytes reales.'
                : 'Optional: cross-check a declared extension (e.g. png, pdf, jpg) against actual magic bytes.'
            }
          >
            <input
              id="mime-ext-input"
              type="text"
              value={expectedExt}
              onChange={(e) => setExpectedExt(e.target.value)}
              placeholder="png, pdf, jpg, zip..."
              className="ui-input font-mono text-sm lowercase"
            />
          </ToolFieldGroup>

          <div className="space-y-1.5">
            <label
              htmlFor="mime-file-input"
              className="ui-btn-secondary w-full justify-center cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>
                {loadedFileName
                  ? `${isEs ? 'Archivo:' : 'Inspected:'} ${loadedFileName}`
                  : isEs
                    ? 'Inspeccionar bytes de un archivo local'
                    : 'Inspect Local File Header (First 16 Bytes)'}
              </span>
            </label>
            <input
              id="mime-file-input"
              type="file"
              onChange={handleFileInspect}
              className="sr-only"
            />
          </div>

          <ToolPresetBar
            label={isEs ? 'Firmas:' : 'Signatures:'}
            presets={[
              {
                label: 'PNG (Match)',
                onSelect: () => {
                  setHex('89 50 4E 47 0D 0A 1A 0A');
                  setExpectedExt('png');
                  setLoadedFileName('');
                }
              },
              {
                label: 'PDF (%PDF)',
                onSelect: () => {
                  setHex('25 50 44 46 2D 31 2E 37');
                  setExpectedExt('pdf');
                  setLoadedFileName('');
                }
              },
              {
                label: 'JPEG (FF D8)',
                onSelect: () => {
                  setHex('FF D8 FF E0 00 10 4A 46');
                  setExpectedExt('jpg');
                  setLoadedFileName('');
                }
              },
              {
                label: isEs ? 'Discrepancia (.png vs PDF)' : 'Mismatch (.png vs PDF)',
                onSelect: () => {
                  setHex('25 50 44 46 2D 31 2E 34');
                  setExpectedExt('png');
                  setLoadedFileName('');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Diagnóstico de firma' : 'Signature Analysis'}
          state={analysis.state}
          primaryLabel={isEs ? 'Formato detectado' : 'Detected Format'}
          primaryValue={
            analysis.state === 'ready'
              ? analysis.matched
                ? analysis.matched.type
                : isEs
                  ? 'Firma desconocida'
                  : 'Unknown Signature'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? analysis.matched
                ? `MIME: ${analysis.matched.mime}`
                : isEs
                  ? 'No coincide con ninguna firma estándar de imagen, PDF o archivo comprimido.'
                  : 'Does not match common PNG, JPEG, PDF, GIF, ZIP, GZIP, or RIFF magic bytes.'
              : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.extensionMismatch
                ? isEs
                  ? 'Discrepancia'
                  : 'Mismatch'
                : analysis.matched
                  ? isEs
                    ? 'Coincide'
                    : 'Matched'
                  : isEs
                    ? 'Desconocido'
                    : 'Unknown'
              : undefined
          }
          statusTone={
            analysis.state === 'ready'
              ? analysis.extensionMismatch
                ? 'error'
                : analysis.matched
                  ? 'success'
                  : 'warning'
              : 'neutral'
          }
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar firma' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa bytes hexadecimales' : 'Enter hex magic bytes'}
          emptyDescription={
            isEs
              ? 'Escribe los primeros bytes de un archivo o selecciona un archivo local.'
              : 'Enter leading file bytes in hex or load a local file header on the left.'
          }
          errorTitle={isEs ? 'Firma hexadecimal inválida' : 'Invalid Hex Signature'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              {analysis.extensionMismatch && (
                <div
                  role="alert"
                  className="ui-error-state flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-xs">
                      {isEs ? 'Discrepancia de extensión detectada' : 'Extension vs. Signature Mismatch'}
                    </div>
                    <p className="text-xs opacity-90">
                      {isEs
                        ? `La extensión declarada (.${analysis.normalizedExt}) no coincide con los bytes reales (${analysis.matched?.type}).`
                        : `Declared extension (.${analysis.normalizedExt}) does not match actual magic bytes (${analysis.matched?.type}).`}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Tipo MIME' : 'MIME Type'}
                  value={analysis.matched ? analysis.matched.mime : 'application/octet-stream'}
                  accent={Boolean(analysis.matched) && !analysis.extensionMismatch}
                />
                <ToolMetricTile
                  label={isEs ? 'Bytes analizados' : 'Bytes Inspected'}
                  value={`${analysis.byteCount} B`}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Cabecera hex' : 'Normalized Header',
                    value: analysis.formattedBytes
                  },
                  {
                    label: isEs ? 'Extensiones válidas' : 'Valid Extensions',
                    value: analysis.matched
                      ? analysis.matched.extensions.map((ext) => `.${ext}`).join(', ')
                      : '—'
                  },
                  ...(analysis.normalizedExt
                    ? [
                        {
                          label: isEs ? 'Extensión declarada' : 'Declared Extension',
                          value: `.${analysis.normalizedExt}`,
                          highlight: !analysis.extensionMismatch
                        }
                      ]
                    : [])
                ]}
              />
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
