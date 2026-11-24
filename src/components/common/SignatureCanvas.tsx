import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { PenTool, RotateCcw, Trash2 } from 'lucide-react';
import { releaseCanvasMemory } from '../../services/pdf/pdfRuntime.ts';

export interface SignaturePoint {
  /** Normalized horizontal coordinate in [0, 1] relative to the signing pad width */
  x: number;
  /** Normalized vertical coordinate in [0, 1] relative to the signing pad height */
  y: number;
}

export interface SignatureStroke {
  points: SignaturePoint[];
  color: string;
  /** Logical stroke width in CSS pixels at reference canvas width */
  lineWidth: number;
}

export interface SignatureExportOptions {
  /** Tightly crop transparent whitespace around drawn strokes (default: true) */
  trimWhitespace?: boolean;
  /** Padding in CSS pixels around trimmed ink bounds (default: 12) */
  paddingPx?: number;
  /** Resolution multiplier for crisp PDF embedding (default: 3) */
  exportScale?: number;
  /** Optional solid background color; omit or pass null for transparent PNG (default: null) */
  backgroundColor?: string | null;
}

export interface SignaturePngExportResult {
  /** Standard `data:image/png;base64,...` URL */
  dataUrl: string;
  /** Decoded standalone PNG byte buffer ready for `@cantoo/pdf-lib` `embedPng()` */
  pngBytes: Uint8Array;
  /** Exported pixel width */
  width: number;
  /** Exported pixel height */
  height: number;
  /** Width / height ratio for aspect-locked placement on PDF pages */
  aspectRatio: number;
}

export interface SignatureCanvasHandle {
  /** Clears all strokes from the canvas */
  clear: () => void;
  /** Removes the most recent stroke */
  undo: () => void;
  /** Returns true when no strokes have been drawn */
  isEmpty: () => boolean;
  /** Converts the current canvas signature into a PNG data URL (or null if empty) */
  toPngDataUrl: (options?: SignatureExportOptions) => string | null;
  /** Exports both PNG data URL and standalone Uint8Array bytes for PDF embedding */
  exportPng: (options?: SignatureExportOptions) => SignaturePngExportResult | null;
}

export interface SignatureCanvasProps {
  /** Called whenever strokes change with the latest transparent PNG data URL (or null when cleared) */
  onChange?: (pngDataUrl: string | null) => void;
  /** Optional controlled ink color (hex) */
  strokeColor?: string;
  /** Optional controlled pen width in CSS px */
  strokeWidth?: number;
  /** Canvas height in CSS pixels (default: 200) */
  height?: number;
  /** Placeholder prompt displayed until the user begins drawing */
  placeholder?: string;
  /** Show built-in ink color, stroke width, undo, and clear controls (default: true) */
  showControls?: boolean;
  /** Trim surrounding transparent whitespace when generating PNG data URLs (default: true) */
  trimOnExport?: boolean;
  /** Disable drawing and controls */
  disabled?: boolean;
  /** Optional accessible label for the drawing canvas */
  ariaLabel?: string;
  /** Optional clear button label */
  clearLabel?: string;
  /** Optional undo button label */
  undoLabel?: string;
  /** Additional container class names */
  className?: string;
}

export const SIGNATURE_INK_PRESETS = [
  { id: 'black', label: 'Ink Black', hex: '#111827' },
  { id: 'navy', label: 'Navy Blue', hex: '#1E3A8A' },
  { id: 'blue', label: 'Royal Blue', hex: '#1D4ED8' },
  { id: 'slate', label: 'Charcoal', hex: '#334155' }
] as const;

export const SIGNATURE_WIDTH_PRESETS = [
  { id: 'fine', label: 'Fine', width: 2 },
  { id: 'medium', label: 'Medium', width: 3 },
  { id: 'bold', label: 'Bold', width: 4.5 }
] as const;

/**
 * Decodes a `data:image/png;base64,...` URL into a standalone `Uint8Array`
 * suitable for `@cantoo/pdf-lib` `PDFDocument.embedPng()`.
 */
export function dataUrlToPngBytes(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(',');
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Renders a list of normalized strokes onto a 2D canvas context using smooth
 * quadratic Bézier midpoint interpolation.
 */
function paintStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: readonly SignatureStroke[],
  logicalWidth: number,
  logicalHeight: number,
  scaleX: number,
  scaleY: number,
  offsetX = 0,
  offsetY = 0
): void {
  const strokeScale = (scaleX + scaleY) / 2;

  for (const stroke of strokes) {
    const pts = stroke.points;
    if (pts.length === 0) continue;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = Math.max(1, stroke.lineWidth * strokeScale);

    if (pts.length === 1) {
      const px = (pts[0].x * logicalWidth - offsetX) * scaleX;
      const py = (pts[0].y * logicalHeight - offsetY) * scaleY;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, (stroke.lineWidth * strokeScale) / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    ctx.beginPath();
    const x0 = (pts[0].x * logicalWidth - offsetX) * scaleX;
    const y0 = (pts[0].y * logicalHeight - offsetY) * scaleY;
    ctx.moveTo(x0, y0);

    if (pts.length === 2) {
      const x1 = (pts[1].x * logicalWidth - offsetX) * scaleX;
      const y1 = (pts[1].y * logicalHeight - offsetY) * scaleY;
      ctx.lineTo(x1, y1);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const currX = (pts[i].x * logicalWidth - offsetX) * scaleX;
        const currY = (pts[i].y * logicalHeight - offsetY) * scaleY;
        const nextX = (pts[i + 1].x * logicalWidth - offsetX) * scaleX;
        const nextY = (pts[i + 1].y * logicalHeight - offsetY) * scaleY;
        const midX = (currX + nextX) / 2;
        const midY = (currY + nextY) / 2;
        ctx.quadraticCurveTo(currX, currY, midX, midY);
      }
      const last = pts[pts.length - 1];
      const lastX = (last.x * logicalWidth - offsetX) * scaleX;
      const lastY = (last.y * logicalHeight - offsetY) * scaleY;
      ctx.lineTo(lastX, lastY);
    }

    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Reusable interactive SignatureCanvas component supporting mouse, touch, and stylus
 * input via Pointer Events, with clear/undo controls and crisp transparent PNG export
 * ready for embedding in PDF documents.
 */
const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  function SignatureCanvas(
    {
      onChange,
      strokeColor,
      strokeWidth,
      height = 200,
      placeholder = 'Draw your signature here using mouse or touch',
      showControls = true,
      trimOnExport = true,
      disabled = false,
      ariaLabel = 'Signature drawing canvas',
      clearLabel = 'Clear',
      undoLabel = 'Undo',
      className = ''
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<SignatureStroke[]>([]);
    const activeStrokeRef = useRef<SignatureStroke | null>(null);
    const activePointerIdRef = useRef<number | null>(null);
    const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 520, height });

    const [internalColor, setInternalColor] = useState<string>(
      strokeColor || SIGNATURE_INK_PRESETS[0].hex
    );
    const [internalWidth, setInternalWidth] = useState<number>(
      strokeWidth || SIGNATURE_WIDTH_PRESETS[1].width
    );
    const [strokeCount, setStrokeCount] = useState<number>(0);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    const activeColor = strokeColor ?? internalColor;
    const activeWidth = strokeWidth ?? internalWidth;

    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? Math.max(1, Math.min(3, window.devicePixelRatio || 1)) : 1;
      const { width: logicalWidth, height: logicalHeight } = canvasSizeRef.current;
      const targetWidth = Math.max(1, Math.round(logicalWidth * dpr));
      const targetHeight = Math.max(1, Math.round(logicalHeight * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      const allStrokes = activeStrokeRef.current
        ? [...strokesRef.current, activeStrokeRef.current]
        : strokesRef.current;

      paintStrokes(ctx, allStrokes, logicalWidth, logicalHeight, dpr, dpr);
    }, []);

    // Keep backing canvas crisp and responsive to container width changes
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateDimensions = () => {
        const rect = container.getBoundingClientRect();
        const nextWidth = Math.max(200, Math.round(rect.width || 520));
        canvasSizeRef.current = { width: nextWidth, height };
        redrawCanvas();
      };

      updateDimensions();

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(updateDimensions);
        observer.observe(container);
      }

      return () => {
        if (observer) observer.disconnect();
      };
    }, [height, redrawCanvas]);

    // Release canvas backing store memory on unmount
    useEffect(() => {
      return () => {
        releaseCanvasMemory(canvasRef.current);
      };
    }, []);

    const exportPngInternal = useCallback(
      (options: SignatureExportOptions = {}): SignaturePngExportResult | null => {
        const strokes = strokesRef.current;
        if (strokes.length === 0) {
          return null;
        }

        const trim = options.trimWhitespace ?? trimOnExport;
        const paddingPx = Math.max(0, options.paddingPx ?? 12);
        const exportScale = Math.max(1, Math.min(4, options.exportScale ?? 3));
        const bgColor = options.backgroundColor ?? null;

        const { width: logicalWidth, height: logicalHeight } = canvasSizeRef.current;

        let minX = 0;
        let minY = 0;
        let cropWidth = logicalWidth;
        let cropHeight = logicalHeight;

        if (trim) {
          let x0 = Infinity;
          let y0 = Infinity;
          let x1 = -Infinity;
          let y1 = -Infinity;

          for (const stroke of strokes) {
            const halfWidth = stroke.lineWidth / 2;
            for (const pt of stroke.points) {
              const px = pt.x * logicalWidth;
              const py = pt.y * logicalHeight;
              if (px - halfWidth < x0) x0 = px - halfWidth;
              if (py - halfWidth < y0) y0 = py - halfWidth;
              if (px + halfWidth > x1) x1 = px + halfWidth;
              if (py + halfWidth > y1) y1 = py + halfWidth;
            }
          }

          if (Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(x1) && Number.isFinite(y1)) {
            minX = Math.max(0, Math.floor(x0 - paddingPx));
            minY = Math.max(0, Math.floor(y0 - paddingPx));
            const maxX = Math.min(logicalWidth, Math.ceil(x1 + paddingPx));
            const maxY = Math.min(logicalHeight, Math.ceil(y1 + paddingPx));
            cropWidth = Math.max(16, maxX - minX);
            cropHeight = Math.max(16, maxY - minY);
          }
        }

        const pixelWidth = Math.max(16, Math.round(cropWidth * exportScale));
        const pixelHeight = Math.max(16, Math.round(cropHeight * exportScale));

        const offscreen = document.createElement('canvas');
        offscreen.width = pixelWidth;
        offscreen.height = pixelHeight;

        try {
          const ctx = offscreen.getContext('2d');
          if (!ctx) return null;

          if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, pixelWidth, pixelHeight);
          } else {
            ctx.clearRect(0, 0, pixelWidth, pixelHeight);
          }

          paintStrokes(
            ctx,
            strokes,
            logicalWidth,
            logicalHeight,
            exportScale,
            exportScale,
            minX,
            minY
          );

          const dataUrl = offscreen.toDataURL('image/png');
          const pngBytes = dataUrlToPngBytes(dataUrl);

          return {
            dataUrl,
            pngBytes,
            width: pixelWidth,
            height: pixelHeight,
            aspectRatio: pixelWidth / pixelHeight
          };
        } finally {
          releaseCanvasMemory(offscreen);
        }
      },
      [trimOnExport]
    );

    const toPngDataUrl = useCallback(
      (options?: SignatureExportOptions): string | null => {
        const exported = exportPngInternal(options);
        return exported ? exported.dataUrl : null;
      },
      [exportPngInternal]
    );

    const notifyChange = useCallback(() => {
      if (!onChange) return;
      if (strokesRef.current.length === 0) {
        onChange(null);
      } else {
        onChange(toPngDataUrl());
      }
    }, [onChange, toPngDataUrl]);

    const handleClear = useCallback(() => {
      strokesRef.current = [];
      activeStrokeRef.current = null;
      activePointerIdRef.current = null;
      setIsDrawing(false);
      setStrokeCount(0);
      redrawCanvas();
      notifyChange();
    }, [notifyChange, redrawCanvas]);

    const handleUndo = useCallback(() => {
      if (strokesRef.current.length === 0) return;
      strokesRef.current = strokesRef.current.slice(0, -1);
      setStrokeCount(strokesRef.current.length);
      redrawCanvas();
      notifyChange();
    }, [notifyChange, redrawCanvas]);

    useImperativeHandle(
      ref,
      () => ({
        clear: handleClear,
        undo: handleUndo,
        isEmpty: () => strokesRef.current.length === 0,
        toPngDataUrl,
        exportPng: exportPngInternal
      }),
      [exportPngInternal, handleClear, handleUndo, toPngDataUrl]
    );

    const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): SignaturePoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: clamp01((e.clientX - rect.left) / rect.width),
        y: clamp01((e.clientY - rect.top) / rect.height)
      };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (activePointerIdRef.current !== null) return;

      const pt = getNormalizedPoint(e);
      if (!pt) return;

      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable in synthetic test environments
      }

      activePointerIdRef.current = e.pointerId;
      activeStrokeRef.current = {
        points: [pt],
        color: activeColor,
        lineWidth: activeWidth
      };
      setIsDrawing(true);
      redrawCanvas();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      if (activePointerIdRef.current !== e.pointerId || !activeStrokeRef.current) return;

      const pt = getNormalizedPoint(e);
      if (!pt) return;

      e.preventDefault();
      const pts = activeStrokeRef.current.points;
      const prev = pts[pts.length - 1];
      const dx = (pt.x - prev.x) * canvasSizeRef.current.width;
      const dy = (pt.y - prev.y) * canvasSizeRef.current.height;
      // Skip sub-pixel jitter to keep curves smooth and lightweight
      if (dx * dx + dy * dy < 1.5) return;

      pts.push(pt);
      redrawCanvas();
    };

    const finishActiveStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== e.pointerId || !activeStrokeRef.current) return;

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore capture release errors
      }

      const completed = activeStrokeRef.current;
      activeStrokeRef.current = null;
      activePointerIdRef.current = null;
      setIsDrawing(false);

      if (completed.points.length > 0) {
        strokesRef.current = [...strokesRef.current, completed];
        setStrokeCount(strokesRef.current.length);
        redrawCanvas();
        notifyChange();
      }
    };

    const hasInk = strokeCount > 0 || isDrawing;

    return (
      <div className={`space-y-3 ${className}`}>
        {showControls && (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Ink color & pen thickness selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {!strokeColor && (
                <div
                  role="radiogroup"
                  aria-label="Signature ink color"
                  className="inline-flex items-center gap-1.5"
                >
                  {SIGNATURE_INK_PRESETS.map((preset) => {
                    const selected = activeColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={preset.label}
                        title={preset.label}
                        disabled={disabled}
                        onClick={() => setInternalColor(preset.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          selected
                            ? 'scale-110 border-accent ring-2 ring-accent/30'
                            : 'border-border-main hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    );
                  })}
                </div>
              )}

              {!strokeWidth && (
                <div
                  role="group"
                  aria-label="Pen stroke thickness"
                  className="inline-flex items-center rounded-lg border border-border-subtle bg-surface-secondary/70 p-0.5"
                >
                  {SIGNATURE_WIDTH_PRESETS.map((preset) => {
                    const selected = activeWidth === preset.width;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => setInternalWidth(preset.width)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                          selected
                            ? 'bg-surface text-text-primary shadow-2xs border border-border-subtle'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Undo & Clear controls */}
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={disabled || strokeCount === 0}
                onClick={handleUndo}
                data-testid="signature-canvas-undo"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{undoLabel}</span>
              </button>
              <button
                type="button"
                disabled={disabled || strokeCount === 0}
                onClick={handleClear}
                data-testid="signature-canvas-clear"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-status-error hover:bg-status-error-bg border border-border-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{clearLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* Signing Pad Surface */}
        <div
          ref={containerRef}
          className={`relative w-full rounded-xl border-2 border-dashed bg-white overflow-hidden select-none transition-colors ${
            disabled
              ? 'border-border-subtle opacity-60 cursor-not-allowed'
              : isDrawing
                ? 'border-accent ring-2 ring-accent/15'
                : 'border-border-main hover:border-accent/60'
          }`}
          style={{ height: `${height}px` }}
        >
          {/* Non-exported visual signing baseline guide */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 bottom-8 flex items-end gap-2 border-b border-neutral-300/90 pb-1"
          >
            <span className="text-sm font-serif italic text-neutral-400 leading-none">×</span>
          </div>

          {/* Empty state prompt */}
          {!hasInk && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center"
            >
              <PenTool className="w-5 h-5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500">{placeholder}</span>
            </div>
          )}

          {/* Interactive transparent drawing canvas */}
          <canvas
            ref={canvasRef}
            aria-label={ariaLabel}
            data-testid="signature-canvas-surface"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishActiveStroke}
            onPointerCancel={finishActiveStroke}
            className={`relative z-10 block w-full h-full touch-none ${
              disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
            }`}
          />
        </div>
      </div>
    );
  }
);

export default SignatureCanvas;
