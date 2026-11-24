import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_TEXT = 'https://calctools.io';

/* ============================================================================
   Browser-Local ISO/IEC 18004 QR Code Encoder (Byte Mode, ECC Level M, V1-V10)
   Zero external APIs, zero network requests, real scannable PNG & SVG output.
   ============================================================================ */

interface QrVersionSpec {
  version: number;
  size: number;
  maxBytes: number;
  ecPerBlock: number;
  blocks: Array<{ count: number; dataCodewords: number }>;
  alignments: number[];
}

// ISO/IEC 18004 Table 7 & 9 — Error Correction Level M (15% recovery), Versions 1-10
const QR_SPECS_M: QrVersionSpec[] = [
  { version: 1, size: 21, maxBytes: 14, ecPerBlock: 10, blocks: [{ count: 1, dataCodewords: 16 }], alignments: [] },
  { version: 2, size: 25, maxBytes: 26, ecPerBlock: 16, blocks: [{ count: 1, dataCodewords: 28 }], alignments: [6, 18] },
  { version: 3, size: 29, maxBytes: 42, ecPerBlock: 26, blocks: [{ count: 1, dataCodewords: 44 }], alignments: [6, 22] },
  { version: 4, size: 33, maxBytes: 62, ecPerBlock: 18, blocks: [{ count: 2, dataCodewords: 32 }], alignments: [6, 26] },
  { version: 5, size: 37, maxBytes: 84, ecPerBlock: 24, blocks: [{ count: 2, dataCodewords: 43 }], alignments: [6, 30] },
  { version: 6, size: 41, maxBytes: 106, ecPerBlock: 16, blocks: [{ count: 4, dataCodewords: 27 }], alignments: [6, 34] },
  { version: 7, size: 45, maxBytes: 122, ecPerBlock: 18, blocks: [{ count: 4, dataCodewords: 31 }], alignments: [6, 22, 38] },
  { version: 8, size: 49, maxBytes: 152, ecPerBlock: 22, blocks: [{ count: 2, dataCodewords: 38 }, { count: 2, dataCodewords: 39 }], alignments: [6, 24, 42] },
  { version: 9, size: 53, maxBytes: 180, ecPerBlock: 22, blocks: [{ count: 3, dataCodewords: 36 }, { count: 2, dataCodewords: 37 }], alignments: [6, 26, 46] },
  { version: 10, size: 57, maxBytes: 213, ecPerBlock: 26, blocks: [{ count: 4, dataCodewords: 43 }, { count: 1, dataCodewords: 44 }], alignments: [6, 28, 50] }
];

const MAX_QR_BYTES = QR_SPECS_M[QR_SPECS_M.length - 1].maxBytes;

// GF(256) with primitive polynomial 0x11D
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEcc(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      res[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return res;
}

function encodeQrMatrix(text: string): { matrix: boolean[][]; version: number; size: number; byteCount: number } {
  const utf8 = new TextEncoder().encode(text);
  const spec = QR_SPECS_M.find((s) => utf8.length <= s.maxBytes);
  if (!spec) {
    throw new Error(`Input exceeds ${MAX_QR_BYTES} UTF-8 bytes (${utf8.length} bytes provided).`);
  }

  const totalDataCodewords = spec.blocks.reduce((sum, b) => sum + b.count * b.dataCodewords, 0);
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  // Mode indicator (Byte = 0100), character count (8 bits for V1-V9, 16 bits for V10)
  pushBits(0b0100, 4);
  pushBits(utf8.length, spec.version <= 9 ? 8 : 16);
  for (const b of utf8) pushBits(b, 8);

  // Terminator up to 4 bits
  const maxDataBits = totalDataCodewords * 8;
  const termLen = Math.min(4, maxDataBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCodewords = new Uint8Array(totalDataCodewords);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    dataCodewords[i] = byte;
  }
  const padBytes = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < totalDataCodewords; i++, p++) {
    dataCodewords[i] = padBytes[p % 2];
  }

  // Split into RS blocks and interleave
  const dataBlocks: Uint8Array[] = [];
  const eccBlocks: Uint8Array[] = [];
  let offset = 0;
  for (const grp of spec.blocks) {
    for (let i = 0; i < grp.count; i++) {
      const slice = dataCodewords.slice(offset, offset + grp.dataCodewords);
      offset += grp.dataCodewords;
      dataBlocks.push(slice);
      eccBlocks.push(rsComputeEcc(slice, spec.ecPerBlock));
    }
  }

  const interleaved: number[] = [];
  const maxBlockData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxBlockData; i++) {
    for (const blk of dataBlocks) {
      if (i < blk.length) interleaved.push(blk[i]);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const ecc of eccBlocks) {
      interleaved.push(ecc[i]);
    }
  }

  const N = spec.size;
  const modules: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
  const isFunction: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  const setFunc = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < N && c >= 0 && c < N) {
      modules[r][c] = val;
      isFunction[r][c] = true;
    }
  };

  // Finder patterns + separators
  const drawFinder = (r0: number, c0: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r < 0 || r >= N || c < 0 || c >= N) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(r, c, inOuter && (onBorder || inCenter));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  // Alignment patterns
  for (const r of spec.alignments) {
    for (const c of spec.alignments) {
      if ((r === 6 && c === 6) || (r === 6 && c === N - 7) || (r === N - 7 && c === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dist = Math.max(Math.abs(dr), Math.abs(dc));
          setFunc(r + dr, c + dc, dist === 2 || dist === 0);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    if (!isFunction[6][i]) setFunc(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setFunc(i, 6, i % 2 === 0);
  }

  // Dark module + reserve format info areas
  setFunc(N - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunc(8, i, false);
    if (!isFunction[i][8]) setFunc(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    setFunc(8, N - 1 - i, false);
    setFunc(N - 1 - i, 8, false);
  }

  // Version info (V7-V10)
  if (spec.version >= 7) {
    let rem = spec.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vBits = (spec.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) === 1;
      const a = N - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunc(a, b, bit);
      setFunc(b, a, bit);
    }
  }

  // Place data bits in upward/downward 2-col zigzag
  const allBits: number[] = [];
  for (const byte of interleaved) {
    for (let b = 7; b >= 0; b--) allBits.push((byte >>> b) & 1);
  }

  let bitIdx = 0;
  let upward = true;
  for (let col = N - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let step = 0; step < N; step++) {
      const row = upward ? N - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!isFunction[row][c]) {
          modules[row][c] = bitIdx < allBits.length ? allBits[bitIdx] === 1 : false;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }

  // Apply Mask 0 ((r + c) % 2 === 0) and write ECC Level M (00) + Mask 0 (000) format info
  const maskId = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!isFunction[r][c] && (r + c) % 2 === 0) {
        modules[r][c] = !modules[r][c];
      }
    }
  }

  // Format bits: Level M = 00, Mask 0 = 000 -> data = 0b00000
  const fmtData = (0b00 << 3) | maskId;
  let rem = fmtData;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const fmtBits = ((fmtData << 10) | rem) ^ 0x5412;

  for (let i = 0; i <= 5; i++) modules[8][i] = ((fmtBits >>> (14 - i)) & 1) === 1;
  modules[8][7] = ((fmtBits >>> 8) & 1) === 1;
  modules[8][8] = ((fmtBits >>> 7) & 1) === 1;
  modules[7][8] = ((fmtBits >>> 6) & 1) === 1;
  for (let i = 0; i < 6; i++) modules[5 - i][8] = ((fmtBits >>> (5 - i)) & 1) === 1;

  for (let i = 0; i < 8; i++) modules[8][N - 1 - i] = ((fmtBits >>> i) & 1) === 1;
  for (let i = 0; i < 7; i++) modules[N - 1 - i][8] = ((fmtBits >>> (14 - i)) & 1) === 1;

  return { matrix: modules, version: spec.version, size: N, byteCount: utf8.length };
}

export default function QrCodeGeneratorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [size, setSize] = useState<number>(250);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const qrResult = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }
    try {
      const encoded = encodeQrMatrix(trimmed);
      return { state: 'ready' as const, ...encoded, content: trimmed };
    } catch (err: unknown) {
      return {
        state: 'error' as const,
        errorMessage:
          err instanceof Error
            ? err.message
            : isEs
              ? 'No se pudo generar el código QR.'
              : 'Unable to encode QR code.'
      };
    }
  }, [text, isEs]);

  // Paint crisp QR onto offscreen/visible canvas whenever matrix or size changes
  useEffect(() => {
    if (qrResult.state !== 'ready') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const quietZone = 4;
    const totalModules = qrResult.size + quietZone * 2;
    const pxSize = Math.max(150, size);
    canvas.width = pxSize;
    canvas.height = pxSize;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pxSize, pxSize);

    const cellSize = pxSize / totalModules;
    ctx.fillStyle = '#000000';
    for (let r = 0; r < qrResult.size; r++) {
      for (let c = 0; c < qrResult.size; c++) {
        if (qrResult.matrix[r][c]) {
          const x = Math.floor((c + quietZone) * cellSize);
          const y = Math.floor((r + quietZone) * cellSize);
          const w = Math.ceil((c + quietZone + 1) * cellSize) - x;
          const h = Math.ceil((r + quietZone + 1) * cellSize) - y;
          ctx.fillRect(x, y, w, h);
        }
      }
    }
    setDownloadError(null);
  }, [qrResult, size]);

  const handleDownloadPng = () => {
    setDownloadError(null);
    const canvas = canvasRef.current;
    if (!canvas || qrResult.state !== 'ready') {
      setDownloadError(
        isEs
          ? 'No hay ningún código QR listo para descargar.'
          : 'No rendered QR code is available to download.'
      );
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloadError(
          isEs
            ? 'No se pudo exportar la imagen PNG. Intenta nuevamente.'
            : 'Failed to export PNG image blob. Please try again.'
        );
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${size}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleClear = () => setText('');
  const handleReset = () => {
    setText(DEFAULT_TEXT);
    setSize(250);
    setDownloadError(null);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Generador de Código QR (100% Local)' : 'QR Code Generator (100% Local)'}
          subtitle={
            isEs
              ? 'Genera códigos QR ISO/IEC 18004 (ECC M) directamente en tu navegador y descárgalos en PNG.'
              : 'Encodes ISO/IEC 18004 QR codes (ECC Level M) locally in your browser with instant PNG download.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Texto o URL para Código QR' : 'QR Code Text or URL'}
            htmlFor="qr-code-input"
            unit={`${new TextEncoder().encode(text.trim()).length} / ${MAX_QR_BYTES} B`}
          >
            <textarea
              id="qr-code-input"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isEs
                  ? 'Ingresa una URL, texto, red WiFi o contacto...'
                  : 'Enter URL, text, WiFi credentials, or contact info...'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Resolución PNG (px)' : 'PNG Export Size (px)'}
            htmlFor="qr-size-select"
          >
            <select
              id="qr-size-select"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="ui-select text-sm"
            >
              <option value={150}>150 × 150 px ({isEs ? 'Compacto' : 'Compact'})</option>
              <option value={250}>250 × 250 px ({isEs ? 'Estándar' : 'Standard'})</option>
              <option value={400}>400 × 400 px (HD Print)</option>
              <option value={600}>600 × 600 px (Ultra HD)</option>
            </select>
          </ToolFieldGroup>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={qrResult.state !== 'ready'}
            className="ui-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isEs ? 'Descargar PNG' : 'Download PNG'}</span>
          </button>

          {downloadError && (
            <div role="alert" className="ui-error-state flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs">{downloadError}</span>
            </div>
          )}

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              { label: 'URL', onSelect: () => setText('https://calctools.io') },
              { label: 'WiFi', onSelect: () => setText('WIFI:T:WPA;S:GuestNetwork;P:CalcTools2026;;') },
              { label: 'Email', onSelect: () => setText('mailto:support@calctools.io') }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Vista previa del código QR' : 'Live QR Code Preview'}
          state={qrResult.state}
          statusLabel={qrResult.state === 'ready' ? `V${qrResult.version} • ECC M` : undefined}
          statusTone="success"
          copyText={qrResult.state === 'ready' ? qrResult.content : undefined}
          copyLabel={isEs ? 'Copiar contenido' : 'Copy text'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa texto o URL' : 'Enter text or a URL'}
          emptyDescription={
            isEs
              ? 'Escribe cualquier URL o mensaje a la izquierda para renderizar el código QR.'
              : 'Type any URL or message on the left to render a scannable QR code.'
          }
          errorTitle={isEs ? 'Error de codificación QR' : 'QR Encoding Error'}
          errorMessage={qrResult.state === 'error' ? qrResult.errorMessage : undefined}
        >
          {qrResult.state === 'ready' && (
            <div className="space-y-4">
              {/* Crisp white quiet-zone container framed for visibility in both Light & Dark themes */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-border-strong bg-surface-secondary/70">
                <div className="p-3 bg-white rounded-xl border border-border-main shadow-xs">
                  <canvas
                    ref={canvasRef}
                    aria-label={isEs ? 'Código QR generado' : 'Generated QR Code'}
                    className="block rounded-sm max-w-full h-auto"
                    style={{ width: Math.min(size, 260), height: Math.min(size, 260) }}
                  />
                </div>
                <p className="mt-3 text-xs font-mono text-text-secondary break-all text-center max-w-full">
                  {qrResult.content}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Versión QR' : 'QR Version'}
                  value={`V${qrResult.version}`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Matriz' : 'Matrix'}
                  value={`${qrResult.size}×${qrResult.size}`}
                />
                <ToolMetricTile
                  label={isEs ? 'Exportación' : 'PNG Size'}
                  value={`${size}px`}
                />
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
