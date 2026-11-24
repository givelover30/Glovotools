import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers,
  Loader2,
  Trash2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getESignText } from '../../i18n/esignTranslations.ts';
import {
  cleanupPdfPage,
  clonePdfBytes,
  destroyPdfDocument,
  ensurePdfJsWorker,
  pdfjsLib,
  releaseCanvasMemory
} from '../../services/pdf/pdfRuntime.ts';
import {
  formatESignDate,
  type ESignDateFormatId,
  type ESignNormalizedRect,
  type ESignPlacedElement
} from '../../services/pdf/v2/pdfESignatureEngine.ts';
import type { PdfErrorInput } from '../common/PdfErrorAlert.tsx';
import PdfErrorDisplay from '../common/PdfErrorDisplay.tsx';

export interface InteractivePdfElement extends ESignPlacedElement {
  /** In-memory preview data URL for image elements ('signature' | 'initials') */
  previewDataUrl?: string;
}

export interface InteractivePdfCanvasViewerProps {
  /** Uploaded PDF file bytes (isolated) */
  pdfBytes: Uint8Array | null;
  /** File identity key to trigger reload when document changes */
  fileKey: string;
  /** Optional password for encrypted PDFs */
  password?: string;
  /** Active 1-based page number */
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageCountLoaded: (count: number) => void;
  onPasswordRequired?: () => void;
  onLoadError?: (err: PdfErrorInput) => void;
  /** Placed elements across all pages */
  elements: InteractivePdfElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onCommitElementRect: (id: string, nextRect: ESignNormalizedRect) => void;
  onUpdateElementProps: (id: string, patch: Partial<InteractivePdfElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onApplyElementToAllPages: (id: string) => void;
}

const MAX_RENDER_PIXELS = 4_200_000;

function clampRect(rect: ESignNormalizedRect): ESignNormalizedRect {
  const w = Math.max(0.03, Math.min(0.95, rect.w));
  const h = Math.max(0.025, Math.min(0.85, rect.h));
  const u = Math.max(0, Math.min(1 - w, rect.u));
  const v = Math.max(0, Math.min(1 - h, rect.v));
  return { u, v, w, h };
}

export default function InteractivePdfCanvasViewer({
  pdfBytes,
  fileKey,
  password,
  currentPage,
  onPageChange,
  onPageCountLoaded,
  onPasswordRequired,
  onLoadError,
  elements,
  selectedElementId,
  onSelectElement,
  onCommitElementRect,
  onUpdateElementProps,
  onDeleteElement,
  onDuplicateElement,
  onApplyElementToAllPages
}: InteractivePdfCanvasViewerProps) {
  const { language } = useTranslation();
  const tr = (key: Parameters<typeof getESignText>[1], vars?: Record<string, string | number>) =>
    getESignText(language, key, vars);

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [renderingPage, setRenderingPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [docError, setDocError] = useState<PdfErrorInput | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({
    width: 612,
    height: 792
  });

  // Ephemeral live drag/resize preview rect before pointer-up commits to undo history
  const [draftTransform, setDraftTransform] = useState<{
    id: string;
    rect: ESignNormalizedRect;
  } | null>(null);

  const pdfDocRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const activeRenderTaskRef = useRef<any>(null);
  const activePageRef = useRef<any>(null);
  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const viewportBoxRef = useRef<HTMLDivElement | null>(null);

  const interactionRef = useRef<{
    mode: 'drag' | 'resize';
    elementId: string;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startRect: ESignNormalizedRect;
    keepAspect: boolean;
    aspectRatio: number;
    latestRect: ESignNormalizedRect;
  } | null>(null);

  // Cancel any in-flight PDF.js render task safely
  const cancelActiveRender = useCallback(async () => {
    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel();
      } catch {
        // Ignore cancellation race
      }
      activeRenderTaskRef.current = null;
    }
    if (activePageRef.current) {
      await cleanupPdfPage(activePageRef.current);
      activePageRef.current = null;
    }
  }, []);

  // Load PDF document when bytes / password change; destroy cleanly on change or unmount
  useEffect(() => {
    let cancelled = false;

    const cleanupCurrentDoc = async () => {
      await cancelActiveRender();
      releaseCanvasMemory(pageCanvasRef.current);
      if (pdfDocRef.current || loadingTaskRef.current) {
        await destroyPdfDocument(pdfDocRef.current, loadingTaskRef.current);
        pdfDocRef.current = null;
        loadingTaskRef.current = null;
      }
    };

    if (!pdfBytes || pdfBytes.byteLength === 0) {
      setTotalPages(0);
      setDocError(null);
      setLoadingDoc(false);
      void cleanupCurrentDoc();
      return;
    }

    setLoadingDoc(true);
    setDocError(null);

    (async () => {
      await cleanupCurrentDoc();
      if (cancelled) return;

      try {
        ensurePdfJsWorker();
        const safeCopy = clonePdfBytes(pdfBytes);
        const task = pdfjsLib.getDocument({
          data: safeCopy,
          password: password || undefined,
          verbosity: 0
        });
        loadingTaskRef.current = task;
        const pdfDoc = await task.promise;

        if (cancelled) {
          await destroyPdfDocument(pdfDoc, task);
          return;
        }

        pdfDocRef.current = pdfDoc;
        const count = Number(pdfDoc.numPages) || 0;
        setTotalPages(count);
        onPageCountLoaded(count);
        setLoadingDoc(false);
      } catch (err: any) {
        if (cancelled) return;
        setLoadingDoc(false);
        setTotalPages(0);
        const rawMsg = String(err?.message || '').toLowerCase();
        const isPasswordErr =
          err?.name === 'PasswordException' ||
          rawMsg.includes('password') ||
          rawMsg.includes('encrypted');

        if (isPasswordErr) {
          onPasswordRequired?.();
          setDocError({
            code: 'ERR_PASSWORD_REQUIRED',
            message: tr('esign.error.passwordRequired')
          });
        } else {
          const loadErr: PdfErrorInput = {
            code: 'ERR_INVALID_PDF',
            message: tr('esign.error.invalidPdf')
          };
          setDocError(loadErr);
          onLoadError?.(loadErr);
        }
      }
    })();

    return () => {
      cancelled = true;
      void cleanupCurrentDoc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileKey, password]);

  // Render the active page whenever page number, zoom, or document changes
  useEffect(() => {
    const pdfDoc = pdfDocRef.current;
    const canvas = pageCanvasRef.current;
    if (!pdfDoc || !canvas || totalPages === 0) return;

    const safePage = Math.max(1, Math.min(totalPages, currentPage));
    let cancelled = false;
    setRenderingPage(true);

    (async () => {
      await cancelActiveRender();
      if (cancelled) return;

      try {
        const page = await pdfDoc.getPage(safePage);
        if (cancelled) {
          await cleanupPdfPage(page);
          return;
        }
        activePageRef.current = page;

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = viewportBoxRef.current
          ? Math.max(260, viewportBoxRef.current.clientWidth - 24)
          : 640;
        const fitScale = Math.min(1.35, containerWidth / Math.max(1, baseViewport.width));
        const cssScale = Math.max(0.35, Math.min(2.4, fitScale * zoom));

        const cssViewport = page.getViewport({ scale: cssScale });
        const dpr =
          typeof window !== 'undefined' ? Math.max(1, Math.min(2, window.devicePixelRatio || 1)) : 1;

        let renderScale = cssScale * dpr;
        const estPixels = baseViewport.width * renderScale * baseViewport.height * renderScale;
        if (estPixels > MAX_RENDER_PIXELS) {
          renderScale *= Math.sqrt(MAX_RENDER_PIXELS / estPixels);
        }

        const renderViewport = page.getViewport({ scale: renderScale });
        const targetW = Math.max(1, Math.floor(renderViewport.width));
        const targetH = Math.max(1, Math.floor(renderViewport.height));

        canvas.width = targetW;
        canvas.height = targetH;
        setStageSize({
          width: Math.max(1, Math.round(cssViewport.width)),
          height: Math.max(1, Math.round(cssViewport.height))
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, targetW, targetH);
        const renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport: renderViewport
        });
        activeRenderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!cancelled) {
          activeRenderTaskRef.current = null;
          setRenderingPage(false);
        }
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException' || cancelled) {
          return;
        }
        setRenderingPage(false);
      }
    })();

    return () => {
      cancelled = true;
      void cancelActiveRender();
    };
  }, [currentPage, totalPages, zoom, loadingDoc, cancelActiveRender]);

  // Keyboard support for selected element (Delete / Arrow nudge)
  useEffect(() => {
    if (!selectedElementId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      const selected = elements.find((el) => el.id === selectedElementId);
      if (!selected) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selected.id);
        return;
      }

      const step = e.shiftKey ? 0.02 : 0.005;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onCommitElementRect(selected.id, clampRect({ ...selected.rect, u: selected.rect.u - step }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onCommitElementRect(selected.id, clampRect({ ...selected.rect, u: selected.rect.u + step }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onCommitElementRect(selected.id, clampRect({ ...selected.rect, v: selected.rect.v - step }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onCommitElementRect(selected.id, clampRect({ ...selected.rect, v: selected.rect.v + step }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, onCommitElementRect, onDeleteElement, selectedElementId]);

  const detachWindowPointerListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      detachWindowPointerListenersRef.current?.();
      detachWindowPointerListenersRef.current = null;
    };
  }, []);

  const applyPointerMove = useCallback((clientX: number, clientY: number) => {
    const active = interactionRef.current;
    if (!active) return;

    const stageEl = stageContainerRef.current;
    if (!stageEl) return;
    const bounds = stageEl.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;

    const du = (clientX - active.startClientX) / bounds.width;
    const dv = (clientY - active.startClientY) / bounds.height;

    let nextRect: ESignNormalizedRect;
    if (active.mode === 'drag') {
      nextRect = clampRect({
        ...active.startRect,
        u: active.startRect.u + du,
        v: active.startRect.v + dv
      });
    } else {
      const targetW = Math.max(0.04, Math.min(1 - active.startRect.u, active.startRect.w + du));
      let targetH = Math.max(0.03, Math.min(1 - active.startRect.v, active.startRect.h + dv));

      if (active.keepAspect && active.aspectRatio > 0) {
        const pxW = targetW * bounds.width;
        const pxH = pxW / active.aspectRatio;
        targetH = Math.max(0.03, Math.min(1 - active.startRect.v, pxH / bounds.height));
      }

      nextRect = clampRect({
        u: active.startRect.u,
        v: active.startRect.v,
        w: targetW,
        h: targetH
      });
    }

    active.latestRect = nextRect;
    setDraftTransform({ id: active.elementId, rect: nextRect });
  }, []);

  const commitActiveInteraction = useCallback(() => {
    detachWindowPointerListenersRef.current?.();
    detachWindowPointerListenersRef.current = null;

    const active = interactionRef.current;
    if (!active) return;

    interactionRef.current = null;
    setDraftTransform(null);

    const moved =
      Math.abs(active.latestRect.u - active.startRect.u) > 0.0005 ||
      Math.abs(active.latestRect.v - active.startRect.v) > 0.0005 ||
      Math.abs(active.latestRect.w - active.startRect.w) > 0.0005 ||
      Math.abs(active.latestRect.h - active.startRect.h) > 0.0005;

    if (moved) {
      onCommitElementRect(active.elementId, active.latestRect);
    }
  }, [onCommitElementRect]);

  const startPointerInteraction = (
    e: React.PointerEvent<HTMLElement>,
    el: InteractivePdfElement,
    mode: 'drag' | 'resize'
  ) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    onSelectElement(el.id);

    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic capture failures
    }

    const stageBounds = stageContainerRef.current?.getBoundingClientRect();
    const refW = stageBounds?.width || stageSize.width || 1;
    const refH = stageBounds?.height || stageSize.height || 1;
    const aspectRatio = (el.rect.w * refW) / Math.max(1, el.rect.h * refH);

    interactionRef.current = {
      mode,
      elementId: el.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRect: { ...el.rect },
      keepAspect: el.kind === 'signature' || el.kind === 'initials' || el.kind === 'checkmark',
      aspectRatio,
      latestRect: { ...el.rect }
    };

    detachWindowPointerListenersRef.current?.();

    const onWinMove = (ev: PointerEvent) => {
      if (!interactionRef.current || ev.pointerId !== interactionRef.current.pointerId) return;
      ev.preventDefault();
      applyPointerMove(ev.clientX, ev.clientY);
    };
    const onWinUp = (ev: PointerEvent) => {
      if (!interactionRef.current || ev.pointerId !== interactionRef.current.pointerId) return;
      try {
        if (targetEl.hasPointerCapture(ev.pointerId)) {
          targetEl.releasePointerCapture(ev.pointerId);
        }
      } catch {
        // Ignore capture release errors
      }
      commitActiveInteraction();
    };

    window.addEventListener('pointermove', onWinMove, { passive: false });
    window.addEventListener('pointerup', onWinUp);
    window.addEventListener('pointercancel', onWinUp);

    detachWindowPointerListenersRef.current = () => {
      window.removeEventListener('pointermove', onWinMove);
      window.removeEventListener('pointerup', onWinUp);
      window.removeEventListener('pointercancel', onWinUp);
    };
  };

  const handlePointerMoveInteraction = (e: React.PointerEvent<HTMLElement>) => {
    const active = interactionRef.current;
    if (!active || active.pointerId !== e.pointerId) return;
    e.preventDefault();
    applyPointerMove(e.clientX, e.clientY);
  };

  const finishPointerInteraction = (e: React.PointerEvent<HTMLElement>) => {
    const active = interactionRef.current;
    if (!active || active.pointerId !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore capture errors
    }

    commitActiveInteraction();
  };

  const pageElements = elements.filter((el) => el.pageNumber === currentPage);
  const selectedElement = pageElements.find((el) => el.id === selectedElementId) || null;

  // Compute badge counts per page for the page rail
  const elementCountByPage = new Map<number, number>();
  for (const el of elements) {
    elementCountByPage.set(el.pageNumber, (elementCountByPage.get(el.pageNumber) || 0) + 1);
  }

  if (loadingDoc) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-10 flex flex-col items-center justify-center gap-2 text-xs text-text-secondary">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <span>{tr('esign.status.loadingPdf')}</span>
      </div>
    );
  }

  if (docError) {
    return <PdfErrorDisplay compact errorMessage={docError} language={language} />;
  }

  if (!pdfBytes || totalPages === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="esign-pdf-viewer">
      {/* Top Page Navigation & Zoom Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-secondary/60 px-3 py-2">
        {/* Page controls */}
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            data-testid="esign-prev-page-btn"
            aria-label={tr('esign.action.prevPage')}
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            data-testid="esign-page-indicator"
            className="px-2 text-xs font-mono font-semibold text-text-primary tabular-nums"
          >
            {tr('esign.status.pageOf', { current: currentPage, total: totalPages })}
          </span>

          <button
            type="button"
            data-testid="esign-next-page-btn"
            aria-label={tr('esign.action.nextPage')}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick page jumper for multi-page docs */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] sm:max-w-[360px] py-0.5">
            {Array.from({ length: Math.min(totalPages, 60) }, (_, i) => i + 1).map((pageNum) => {
              const count = elementCountByPage.get(pageNum) || 0;
              const active = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  data-testid={`esign-page-pill-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative px-2 py-1 rounded-md text-[11px] font-mono font-semibold shrink-0 transition-colors cursor-pointer border ${
                    active
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface text-text-secondary border-border-subtle hover:text-text-primary hover:border-accent/60'
                  }`}
                >
                  {pageNum}
                  {count > 0 && (
                    <span
                      className={`ml-1 inline-flex items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                        active ? 'bg-white/25 text-white' : 'bg-result-bg text-result-text'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Zoom controls */}
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            aria-label={tr('esign.action.zoomOut')}
            disabled={zoom <= 0.6}
            onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-semibold text-text-secondary w-11 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label={tr('esign.action.zoomIn')}
            disabled={zoom >= 1.9}
            onClick={() => setZoom((z) => Math.min(1.9, Math.round((z + 0.15) * 100) / 100))}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Element Property Bar */}
      {selectedElement && (
        <div
          data-testid="esign-selected-element-bar"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent-light/50 dark:bg-surface-selected/60 px-3 py-2 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-semibold text-text-primary capitalize">
              {tr(
                selectedElement.kind === 'signature'
                  ? 'esign.element.signature'
                  : selectedElement.kind === 'initials'
                    ? 'esign.element.initials'
                    : selectedElement.kind === 'date'
                      ? 'esign.element.date'
                      : selectedElement.kind === 'checkmark'
                        ? 'esign.element.checkmark'
                        : 'esign.element.text'
              )}
            </span>

            {selectedElement.kind === 'text' && (
              <input
                type="text"
                data-testid="esign-selected-text-input"
                value={selectedElement.text || ''}
                onChange={(e) =>
                  onUpdateElementProps(selectedElement.id, { text: e.target.value })
                }
                placeholder={tr('esign.element.textPlaceholder')}
                className="ui-input py-1 px-2 text-xs w-44"
              />
            )}

            {selectedElement.kind === 'date' && (
              <select
                data-testid="esign-selected-date-format"
                value={selectedElement.dateFormat || 'iso'}
                onChange={(e) => {
                  const fmt = e.target.value as ESignDateFormatId;
                  onUpdateElementProps(selectedElement.id, {
                    dateFormat: fmt,
                    text: formatESignDate(new Date(), fmt)
                  });
                }}
                className="ui-select py-1 px-2 text-xs w-36"
              >
                <option value="iso">{formatESignDate(new Date(), 'iso')}</option>
                <option value="us">{formatESignDate(new Date(), 'us')}</option>
                <option value="eu">{formatESignDate(new Date(), 'eu')}</option>
                <option value="long">{formatESignDate(new Date(), 'long')}</option>
              </select>
            )}
          </div>

          <div className="inline-flex flex-wrap items-center gap-1.5">
            {totalPages > 1 && (
              <button
                type="button"
                data-testid="esign-apply-all-pages-btn"
                onClick={() => onApplyElementToAllPages(selectedElement.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
              >
                <Layers className="w-3 h-3 text-accent" aria-hidden="true" />
                <span>{tr('esign.action.applyAllPages')}</span>
              </button>
            )}
            <button
              type="button"
              data-testid="esign-duplicate-element-btn"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle cursor-pointer"
            >
              <Copy className="w-3 h-3" aria-hidden="true" />
              <span>{tr('esign.action.duplicateElement')}</span>
            </button>
            <button
              type="button"
              data-testid="esign-delete-element-btn"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-status-error-bg text-status-error border border-border-subtle cursor-pointer"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              <span>{tr('esign.action.deleteElement')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Page Viewport Container (scroll-safe on touch; only elements block touch scroll) */}
      <div
        ref={viewportBoxRef}
        onClick={() => onSelectElement(null)}
        className="relative w-full overflow-auto rounded-xl border border-border-subtle bg-neutral-200/70 dark:bg-neutral-900/80 p-3 flex justify-center min-h-[420px] max-h-[72vh]"
      >
        <div
          ref={stageContainerRef}
          data-testid="esign-page-stage"
          className="relative bg-white shadow-md shrink-0 select-none"
          style={{
            width: `${stageSize.width}px`,
            height: `${stageSize.height}px`
          }}
        >
          {/* Active PDF Page Canvas */}
          <canvas
            ref={pageCanvasRef}
            data-testid="esign-pdf-page-canvas"
            className="block w-full h-full pointer-events-none"
          />

          {renderingPage && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          )}

          {/* Interactive Draggable & Resizable Overlay Elements */}
          {pageElements.map((el) => {
            const liveRect = draftTransform?.id === el.id ? draftTransform.rect : el.rect;
            const isSelected = el.id === selectedElementId;

            return (
              <div
                key={el.id}
                data-testid={`esign-overlay-${el.kind}`}
                data-element-id={el.id}
                data-element-kind={el.kind}
                data-rect-u={liveRect.u.toFixed(4)}
                data-rect-v={liveRect.v.toFixed(4)}
                data-rect-w={liveRect.w.toFixed(4)}
                data-rect-h={liveRect.h.toFixed(4)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }}
                onPointerDown={(e) => startPointerInteraction(e, el, 'drag')}
                onPointerMove={handlePointerMoveInteraction}
                onPointerUp={finishPointerInteraction}
                onPointerCancel={finishPointerInteraction}
                style={{
                  left: `${liveRect.u * 100}%`,
                  top: `${liveRect.v * 100}%`,
                  width: `${liveRect.w * 100}%`,
                  height: `${liveRect.h * 100}%`
                }}
                className={`absolute touch-none cursor-move rounded-md flex items-center justify-center transition-shadow ${
                  isSelected
                    ? 'border-2 border-accent bg-accent/5 ring-2 ring-accent/25 z-20'
                    : 'border border-dashed border-accent/60 hover:border-accent bg-transparent z-10'
                }`}
              >
                {(el.kind === 'signature' || el.kind === 'initials') && el.previewDataUrl ? (
                  <img
                    src={el.previewDataUrl}
                    alt={el.kind}
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                ) : el.kind === 'checkmark' ? (
                  <Check
                    className="w-full h-full p-0.5 pointer-events-none"
                    style={{ color: el.color || '#111827' }}
                    strokeWidth={3}
                  />
                ) : (
                  <span
                    className="w-full h-full flex items-center px-1.5 font-sans font-medium truncate pointer-events-none leading-none"
                    style={{
                      color: el.color || '#111827',
                      fontSize: `${Math.max(10, Math.round(liveRect.h * stageSize.height * 0.56))}px`
                    }}
                  >
                    {el.text || tr('esign.element.textPlaceholder')}
                  </span>
                )}

                {/* Touch-friendly SE Resize Handle */}
                {isSelected && (
                  <button
                    type="button"
                    aria-label="Resize element"
                    data-testid={`esign-resize-handle-${el.id}`}
                    onPointerDown={(e) => startPointerInteraction(e, el, 'resize')}
                    onPointerMove={handlePointerMoveInteraction}
                    onPointerUp={finishPointerInteraction}
                    onPointerCancel={finishPointerInteraction}
                    className="absolute -right-2.5 -bottom-2.5 w-6 h-6 rounded-full bg-accent text-white border-2 border-white shadow-sm flex items-center justify-center cursor-nwse-resize touch-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
