import { useEffect, useState } from 'react';
import { dataUrlToPngBytes } from '../../../components/common/SignatureCanvas.tsx';
import { releaseCanvasMemory, revokeObjectUrlSafely } from '../pdfRuntime.ts';
import { validateSignatureImageBytes } from '../v2/pdfESignatureEngine.ts';
import { createPdfProcessingError } from '../v2/pdfErrors.ts';
import type { PdfProcessingError } from '../v2/pdfTypes.ts';

export type SessionSignatureKind = 'signature' | 'initials';
export type SessionSignatureSource = 'draw' | 'type' | 'upload';

export interface SessionSignatureAsset {
  id: string;
  kind: SessionSignatureKind;
  source: SessionSignatureSource;
  dataUrl: string;
  pngBytes: Uint8Array;
  width: number;
  height: number;
  aspectRatio: number;
  createdAt: number;
}

export interface SessionSignatureState {
  signature: SessionSignatureAsset | null;
  initials: SessionSignatureAsset | null;
}

export interface TypedSignatureFontPreset {
  id: string;
  label: string;
  cssFamily: string;
  fontStyle: 'italic' | 'normal';
  fontWeight: '400' | '600' | '700';
}

export const TYPED_SIGNATURE_FONTS: readonly TypedSignatureFontPreset[] = [
  {
    id: 'cursive-classic',
    label: 'Classic Script',
    cssFamily: '"Brush Script MT", "Segoe Script", "Apple Chancery", "Snell Roundhand", cursive',
    fontStyle: 'italic',
    fontWeight: '400'
  },
  {
    id: 'serif-executive',
    label: 'Executive Serif',
    cssFamily: 'Georgia, "Times New Roman", serif',
    fontStyle: 'italic',
    fontWeight: '600'
  },
  {
    id: 'handwritten-clean',
    label: 'Modern Hand',
    cssFamily: '"Lucida Handwriting", "Comic Sans MS", "Bradley Hand", cursive',
    fontStyle: 'normal',
    fontWeight: '400'
  },
  {
    id: 'editorial-sans',
    label: 'Clean Editorial',
    cssFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontStyle: 'italic',
    fontWeight: '600'
  }
];

/**
 * In-memory-only (RAM) session store for created signatures and initials.
 * Never persists to localStorage, sessionStorage, IndexedDB, or external servers.
 * Wipes binary byte buffers when replaced or cleared.
 */
let sessionState: SessionSignatureState = {
  signature: null,
  initials: null
};

const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function wipeAssetBytes(asset: SessionSignatureAsset | null): void {
  if (asset?.pngBytes instanceof Uint8Array) {
    asset.pngBytes.fill(0);
  }
}

export function getSessionSignatures(): SessionSignatureState {
  return sessionState;
}

export function setSessionSignatureAsset(
  kind: SessionSignatureKind,
  asset: Omit<SessionSignatureAsset, 'id' | 'kind' | 'createdAt'>
): SessionSignatureAsset {
  const prev = sessionState[kind];
  wipeAssetBytes(prev);

  // Store an isolated copy so external mutations cannot corrupt session state
  const isolatedBytes = new Uint8Array(asset.pngBytes.byteLength);
  isolatedBytes.set(asset.pngBytes);

  const nextAsset: SessionSignatureAsset = {
    id: `esign-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    source: asset.source,
    dataUrl: asset.dataUrl,
    pngBytes: isolatedBytes,
    width: asset.width,
    height: asset.height,
    aspectRatio: asset.aspectRatio || (asset.height > 0 ? asset.width / asset.height : 2.5),
    createdAt: Date.now()
  };

  sessionState = {
    ...sessionState,
    [kind]: nextAsset
  };
  emitChange();
  return nextAsset;
}

export function clearSessionSignatureKind(kind: SessionSignatureKind): void {
  wipeAssetBytes(sessionState[kind]);
  sessionState = {
    ...sessionState,
    [kind]: null
  };
  emitChange();
}

export function clearAllSessionSignatures(): void {
  wipeAssetBytes(sessionState.signature);
  wipeAssetBytes(sessionState.initials);
  sessionState = {
    signature: null,
    initials: null
  };
  emitChange();
}

export function subscribeSessionSignatures(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSessionSignatures(): SessionSignatureState {
  const [state, setState] = useState<SessionSignatureState>(() => getSessionSignatures());
  useEffect(() => {
    const sync = () => setState(getSessionSignatures());
    return subscribeSessionSignatures(sync);
  }, []);
  return state;
}

/**
 * Renders a typed signature or initials string to a crisp, tightly-trimmed transparent PNG
 * so the visual style is preserved identically when embedded into PDFs.
 */
export function renderTypedSignatureToPng(params: {
  text: string;
  fontPresetId?: string;
  color?: string;
  fontSizePx?: number;
}): {
  dataUrl: string;
  pngBytes: Uint8Array;
  width: number;
  height: number;
  aspectRatio: number;
} | null {
  const trimmed = params.text.trim();
  if (!trimmed || typeof document === 'undefined') return null;

  const preset =
    TYPED_SIGNATURE_FONTS.find((f) => f.id === params.fontPresetId) || TYPED_SIGNATURE_FONTS[0];
  const color = params.color || '#111827';
  const baseFontPx = Math.max(36, Math.min(180, params.fontSizePx || 96));
  const fontSpec = `${preset.fontStyle} ${preset.fontWeight} ${baseFontPx}px ${preset.cssFamily}`;

  const canvas = document.createElement('canvas');
  try {
    const measureCtx = canvas.getContext('2d');
    if (!measureCtx) return null;

    measureCtx.font = fontSpec;
    const metrics = measureCtx.measureText(trimmed);
    const padX = Math.ceil(baseFontPx * 0.45);
    const padY = Math.ceil(baseFontPx * 0.35);

    const ascent =
      metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxAscent > 0
        ? metrics.actualBoundingBoxAscent
        : baseFontPx * 0.85;
    const descent =
      metrics.actualBoundingBoxDescent && metrics.actualBoundingBoxDescent > 0
        ? metrics.actualBoundingBoxDescent
        : baseFontPx * 0.3;

    const textWidth = Math.max(24, Math.ceil(metrics.width));
    const pixelWidth = Math.min(2400, Math.ceil(textWidth + padX * 2));
    const pixelHeight = Math.min(800, Math.ceil(ascent + descent + padY * 2));

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    ctx.font = fontSpec;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(trimmed, padX, padY + ascent);

    const dataUrl = canvas.toDataURL('image/png');
    const pngBytes = dataUrlToPngBytes(dataUrl);

    return {
      dataUrl,
      pngBytes,
      width: pixelWidth,
      height: pixelHeight,
      aspectRatio: pixelWidth / pixelHeight
    };
  } finally {
    releaseCanvasMemory(canvas);
  }
}

/**
 * Validates and normalizes an uploaded PNG or JPEG signature image into a clean PNG asset.
 * Enforces strict magic-byte & structural validation (`ERR_UNSUPPORTED_IMAGE_FORMAT`),
 * optionally removes white backgrounds, caps oversized images to 1600px width, and cleans up
 * temporary Object URLs and canvases deterministically.
 */
export async function processUploadedSignatureImage(
  file: File,
  options: { removeWhiteBackground?: boolean } = {}
): Promise<
  | {
      ok: true;
      dataUrl: string;
      pngBytes: Uint8Array;
      width: number;
      height: number;
      aspectRatio: number;
    }
  | {
      ok: false;
      error: PdfProcessingError;
    }
> {
  if (!file) {
    return {
      ok: false,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        'No signature image file was selected.'
      )
    };
  }

  let rawBytes: Uint8Array;
  try {
    rawBytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return {
      ok: false,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        'Failed to read signature image file.'
      )
    };
  }

  // 1. Strict binary PNG/JPEG validation
  const validation = validateSignatureImageBytes(rawBytes, file.name);
  if (!validation.isValid || !validation.format) {
    rawBytes.fill(0);
    return {
      ok: false,
      error:
        validation.error ||
        createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          'Signature image must be a valid PNG or JPEG file.'
        )
    };
  }

  const mime = validation.format === 'png' ? 'image/png' : 'image/jpeg';
  const blob = new Blob([rawBytes.slice().buffer], { type: mime });
  const objectUrl = URL.createObjectURL(blob);
  let canvas: HTMLCanvasElement | null = null;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      el.src = objectUrl;
    });

    if (!img.naturalWidth || !img.naturalHeight) {
      return {
        ok: false,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          'Uploaded signature image has invalid dimensions or is corrupted.'
        )
      };
    }

    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const targetW = Math.max(16, Math.round(img.naturalWidth * scale));
    const targetH = Math.max(16, Math.round(img.naturalHeight * scale));

    canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        ok: false,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          'Canvas rendering context is unavailable.'
        )
      };
    }

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    if (options.removeWhiteBackground) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum >= 235) {
          data[i + 3] = 0;
        } else if (lum >= 200) {
          // Smooth edge anti-aliasing feather
          const factor = (235 - lum) / 35;
          data[i + 3] = Math.round(data[i + 3] * factor);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const pngBytes = dataUrlToPngBytes(dataUrl);

    return {
      ok: true,
      dataUrl,
      pngBytes,
      width: targetW,
      height: targetH,
      aspectRatio: targetW / targetH
    };
  } catch {
    return {
      ok: false,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        `Corrupt or unreadable ${validation.format.toUpperCase()} signature image.`
      )
    };
  } finally {
    rawBytes.fill(0);
    releaseCanvasMemory(canvas);
    revokeObjectUrlSafely(objectUrl);
  }
}
