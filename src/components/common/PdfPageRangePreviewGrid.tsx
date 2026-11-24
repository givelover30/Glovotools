import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowLeftRight,
  Check,
  CheckSquare,
  FileText,
  Grid2x2,
  Layers,
  Loader2,
  MousePointerClick,
  Scissors,
  Sparkles,
  Square,
  Trash2,
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  cleanupPdfPage,
  clonePdfBytes,
  destroyPdfDocument,
  ensurePdfJsWorker,
  pdfjsLib,
  releaseCanvasMemory,
} from '../../services/pdf/pdfRuntime.ts';
import {
  formatPageNumbersAsExpression,
  parsePageRangeExpression,
} from '../../services/pdf/v2/pdfPageRangeParser.ts';
import { type PdfErrorInput } from './PdfErrorAlert.tsx';
import PdfErrorDisplay from './PdfErrorDisplay.tsx';

export interface PdfPageRangePreviewGridProps {
  file: File | null;
  pageRangeText: string;
  selectedPageIndices: number[];
  processing?: boolean;
  onPageSelectionChange: (nextIndices: number[], nextRangeText: string) => void;
  onExtractSelected?: () => void;
}

interface ThumbnailPageItem {
  pageNumber: number;
  dataUrl?: string;
  width: number;
  height: number;
  rendered: boolean;
  rendering?: boolean;
}

export default function PdfPageRangePreviewGrid({
  file,
  pageRangeText,
  selectedPageIndices,
  processing = false,
  onPageSelectionChange,
  onExtractSelected,
}: PdfPageRangePreviewGridProps) {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<ThumbnailPageItem[]>([]);
  const [error, setError] = useState<PdfErrorInput | null>(null);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<'multi' | 'single'>('multi');
  const { language } = useTranslation();
  const isEs = language === 'es';

  const pdfDocRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const renderingPagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setAnchorIndex(null);
    if (!file) {
      setPages([]);
      setLoading(false);
      setError(null);
      if (pdfDocRef.current) {
        void destroyPdfDocument(pdfDocRef.current, loadingTaskRef.current);
        pdfDocRef.current = null;
        loadingTaskRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);
    renderingPagesRef.current.clear();

    if (pdfDocRef.current) {
      void destroyPdfDocument(pdfDocRef.current, loadingTaskRef.current);
      pdfDocRef.current = null;
      loadingTaskRef.current = null;
    }

    (async () => {
      try {
        ensurePdfJsWorker();
        const rawBuffer = await file.arrayBuffer();
        if (isCancelled) return;

        const safeData = clonePdfBytes(rawBuffer);
        loadingTaskRef.current = pdfjsLib.getDocument({ data: safeData, verbosity: 0 });
        const pdfDoc = await loadingTaskRef.current.promise;

        if (isCancelled) {
          await destroyPdfDocument(pdfDoc, loadingTaskRef.current);
          return;
        }

        pdfDocRef.current = pdfDoc;
        const numPages: number = pdfDoc.numPages;

        const initialSlots: ThumbnailPageItem[] = Array.from(
          { length: numPages },
          (_, idx) => ({
            pageNumber: idx + 1,
            dataUrl: undefined,
            width: 180,
            height: 240,
            rendered: false,
            rendering: false,
          })
        );

        setPages(initialSlots);
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          const rawMsg = String(err?.message || '').toLowerCase();
          const isPasswordProtected =
            err?.name === 'PasswordException' ||
            rawMsg.includes('password') ||
            rawMsg.includes('encrypted');

          setError(
            isPasswordProtected
              ? {
                  code: 'ERR_PASSWORD_REQUIRED',
                  message:
                    'Page thumbnails are unavailable until this password-protected PDF is unlocked.',
                  messageEs:
                    'Las vistas previas de página no están disponibles hasta desbloquear este PDF protegido con contraseña.',
                }
              : {
                  code: 'ERR_PDF_LOAD_FAILED',
                  message:
                    'Could not load page thumbnails for this PDF. You can still enter a page range below or inspect the file.',
                  messageEs:
                    'No se pudieron cargar las vistas previas de página para este PDF. Aún puedes ingresar un rango abajo o inspeccionar el archivo.',
                }
          );
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (pdfDocRef.current) {
        void destroyPdfDocument(pdfDocRef.current, loadingTaskRef.current);
        pdfDocRef.current = null;
        loadingTaskRef.current = null;
      }
    };
  }, [file]);

  const renderThumbnailPage = useCallback(async (pageNum: number) => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc || renderingPagesRef.current.has(pageNum)) return;

    renderingPagesRef.current.add(pageNum);
    setPages((prev) =>
      prev.map((item) => (item.pageNumber === pageNum ? { ...item, rendering: true } : item))
    );

    let page: any = null;
    let canvas: HTMLCanvasElement | null = null;
    try {
      page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.28 });
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const context = canvas.getContext('2d');

      if (context) {
        const renderTask = page.render({
          canvasContext: context,
          canvas,
          viewport,
        });
        await renderTask.promise;

        const dataUrl = canvas.toDataURL('image/png');
        setPages((prev) =>
          prev.map((item) =>
            item.pageNumber === pageNum
              ? {
                  ...item,
                  dataUrl,
                  width: viewport.width,
                  height: viewport.height,
                  rendered: true,
                  rendering: false,
                }
              : item
          )
        );
      }
    } catch {
      setPages((prev) =>
        prev.map((item) => (item.pageNumber === pageNum ? { ...item, rendering: false } : item))
      );
    } finally {
      releaseCanvasMemory(canvas);
      await cleanupPdfPage(page);
      renderingPagesRef.current.delete(pageNum);
    }
  }, []);

  const totalPages = pages.length;
  const trimmedRange = pageRangeText.trim();

  // Live two-way range evaluation using the exact V2 page range parser
  const rangeAnalysis = useMemo(() => {
    if (totalPages === 0) {
      return {
        activeIndices: selectedPageIndices,
        validationError: null as string | null,
        summaryText: '',
      };
    }

    if (trimmedRange.length > 0) {
      const parsed = parsePageRangeExpression(trimmedRange, totalPages);
      if (parsed.isValid) {
        return {
          activeIndices: parsed.pageIndices,
          validationError: null,
          summaryText: parsed.normalizedExpression,
        };
      }

      const isMidTyping = /[-,]\s*$/.test(trimmedRange);
      return {
        activeIndices: [],
        validationError: isMidTyping
          ? null
          : (isEs ? parsed.error?.messageEs : parsed.error?.message) ||
            (isEs
              ? `Ingresa páginas entre 1 y ${totalPages} (ej. 1-3, 5).`
              : `Enter pages between 1 and ${totalPages} (e.g. 1-3, 5).`),
        summaryText: '',
      };
    }

    const validThumbIndices = selectedPageIndices.filter(
      (idx) => idx >= 0 && idx < totalPages
    );
    return {
      activeIndices: validThumbIndices,
      validationError: null,
      summaryText: formatPageNumbersAsExpression(
        validThumbIndices.map((idx) => idx + 1)
      ),
    };
  }, [trimmedRange, totalPages, selectedPageIndices, isEs]);

  const orderByIndex = useMemo(() => {
    const map = new Map<number, number>();
    rangeAnalysis.activeIndices.forEach((pageIdx, orderIdx) => {
      if (!map.has(pageIdx)) {
        map.set(pageIdx, orderIdx + 1);
      }
    });
    return map;
  }, [rangeAnalysis.activeIndices]);

  const commitSortedIndices = (indices: number[]) => {
    const uniqueSorted = Array.from(
      new Set(indices.filter((idx) => idx >= 0 && idx < totalPages))
    ).sort((a, b) => a - b);
    const expr = formatPageNumbersAsExpression(uniqueSorted.map((i) => i + 1));
    onPageSelectionChange(uniqueSorted, expr);
  };

  const handlePageClick = (
    pageIndex: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event.shiftKey && anchorIndex !== null) {
      const start = Math.min(anchorIndex, pageIndex);
      const end = Math.max(anchorIndex, pageIndex);
      const next = new Set(rangeAnalysis.activeIndices);
      for (let idx = start; idx <= end; idx++) {
        next.add(idx);
      }
      commitSortedIndices(Array.from(next));
      setAnchorIndex(pageIndex);
      return;
    }

    if (selectionMode === 'single') {
      const onlyThisSelected =
        rangeAnalysis.activeIndices.length === 1 &&
        rangeAnalysis.activeIndices[0] === pageIndex;
      if (onlyThisSelected) {
        onPageSelectionChange([], '');
      } else {
        commitSortedIndices([pageIndex]);
      }
      setAnchorIndex(pageIndex);
      return;
    }

    const currentSet = new Set(rangeAnalysis.activeIndices);
    if (currentSet.has(pageIndex)) {
      currentSet.delete(pageIndex);
    } else {
      currentSet.add(pageIndex);
    }
    commitSortedIndices(Array.from(currentSet));
    setAnchorIndex(pageIndex);
  };

  const handleSelectPreset = (
    preset: 'all' | 'odd' | 'even' | 'invert' | 'clear'
  ) => {
    setAnchorIndex(null);
    if (preset === 'clear') {
      onPageSelectionChange([], '');
      return;
    }
    if (preset === 'all') {
      commitSortedIndices(Array.from({ length: totalPages }, (_, i) => i));
      return;
    }
    if (preset === 'odd') {
      const odd: number[] = [];
      for (let i = 0; i < totalPages; i += 2) odd.push(i);
      commitSortedIndices(odd);
      return;
    }
    if (preset === 'even') {
      const even: number[] = [];
      for (let i = 1; i < totalPages; i += 2) even.push(i);
      commitSortedIndices(even);
      return;
    }
    if (preset === 'invert') {
      const selectedSet = new Set(rangeAnalysis.activeIndices);
      const inverted: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (!selectedSet.has(i)) inverted.push(i);
      }
      commitSortedIndices(inverted);
    }
  };

  if (!file) return null;

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border-subtle bg-surface-secondary/50 flex items-center justify-center gap-3 text-xs text-text-secondary">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        <span>
          {isEs
            ? 'Cargando documento PDF...'
            : 'Loading PDF document...'}
        </span>
      </div>
    );
  }

  if (error) {
    return <PdfErrorDisplay compact errorMessage={error} language={language} />;
  }

  const renderedCount = pages.filter((p) => p.rendered).length;
  const selectedCount = rangeAnalysis.activeIndices.length;

  return (
    <section
      aria-label={isEs ? 'Vista previa de rango de páginas' : 'Page Range Preview'}
      data-testid="page-range-preview-grid"
      className="rounded-xl border border-border-subtle bg-surface-secondary/40 p-3.5 sm:p-4 space-y-3"
    >
      {/* Header & Selection Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Grid2x2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            {isEs ? 'Vista Previa de Rango de Páginas' : 'Page Range Preview'}
          </h3>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface border border-border-subtle text-text-secondary">
            {totalPages} {isEs ? (totalPages === 1 ? 'página' : 'páginas') : totalPages === 1 ? 'page' : 'pages'}
          </span>
          {renderedCount < totalPages && (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
              <Loader2 className="w-3 h-3 animate-spin text-accent" />
              <span>
                {renderedCount}/{totalPages} loaded
              </span>
            </span>
          )}
        </div>

        <span
          data-testid="page-range-selected-count"
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
            selectedCount > 0
              ? 'bg-accent-light dark:bg-surface-selected text-accent border-accent/30'
              : 'bg-surface border-border-subtle text-text-tertiary'
          }`}
        >
          {isEs
            ? `${selectedCount} de ${totalPages} seleccionadas`
            : `${selectedCount} of ${totalPages} selected`}
        </span>
      </div>

      {/* Mode Switcher & Quick Range Preset Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label={isEs ? 'Modo de selección' : 'Selection mode'}
            className="inline-flex items-center rounded-lg border border-border-subtle bg-surface p-0.5 mr-1"
          >
            <button
              type="button"
              data-testid="multi-select-mode-button"
              aria-pressed={selectionMode === 'multi'}
              onClick={() => setSelectionMode('multi')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                selectionMode === 'multi'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>{isEs ? 'Selección múltiple' : 'Multi-Select'}</span>
            </button>
            <button
              type="button"
              data-testid="single-select-mode-button"
              aria-pressed={selectionMode === 'single'}
              onClick={() => setSelectionMode('single')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectionMode === 'single'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <MousePointerClick className="w-3 h-3" />
              <span>{isEs ? 'Página única' : 'Single Page'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPreset('all')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle transition-colors cursor-pointer"
          >
            <Layers className="w-3 h-3 text-accent" />
            <span>{isEs ? 'Todas' : 'All'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('odd')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isEs ? 'Impares' : 'Odd'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('even')}
            disabled={totalPages < 2}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span>{isEs ? 'Pares' : 'Even'}</span>
          </button>
          <button
            type="button"
            data-testid="preset-invert-btn"
            onClick={() => handleSelectPreset('invert')}
            disabled={totalPages < 2}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>{isEs ? 'Invertir' : 'Invert'}</span>
          </button>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => handleSelectPreset('clear')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover text-status-error border border-border-subtle transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{isEs ? 'Limpiar' : 'Clear'}</span>
            </button>
          )}
        </div>

        <span className="text-[11px] text-text-tertiary">
          {selectionMode === 'multi'
            ? isEs
              ? 'Clic para marcar/desmarcar varias · Shift+Clic para rango'
              : 'Click to toggle multiple · Shift+Click for range'
            : isEs
              ? 'Clic para elegir 1 página · Shift+Clic para rango'
              : 'Click to pick 1 page · Shift+Click for range'}
        </span>
      </div>

      {/* Miniature Thumbnails Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto p-1">
        {pages.map((p) => {
          const pageIndex = p.pageNumber - 1;
          const extractOrder = orderByIndex.get(pageIndex);
          const isSelected = extractOrder !== undefined;

          return (
            <GridThumbnailCard
              key={p.pageNumber}
              pageItem={p}
              isSelected={isSelected}
              extractOrder={extractOrder}
              selectionMode={selectionMode}
              onPageClick={handlePageClick}
              onVisible={renderThumbnailPage}
              isEs={isEs}
            />
          );
        })}
      </div>

      {/* Live Extraction Preview Footer / Range Validation Feedback + Batch Extract CTA */}
      {rangeAnalysis.validationError ? (
        <div
          role="status"
          data-testid="page-range-validation-hint"
          className="text-[11px] font-medium text-status-error bg-status-error-bg border border-status-error/30 rounded-lg px-2.5 py-1.5"
        >
          {rangeAnalysis.validationError}
        </div>
      ) : (
        <div
          data-testid="page-range-preview-summary"
          className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-text-secondary bg-surface rounded-lg border border-border-subtle px-3 py-2"
        >
          <span className="min-w-0">
            {selectedCount > 0 ? (
              isEs ? (
                <>
                  Se extraerán <strong className="text-text-primary">{selectedCount}</strong>{' '}
                  {selectedCount === 1 ? 'página' : 'páginas'}:{' '}
                  <span className="font-mono font-semibold text-accent">
                    {rangeAnalysis.summaryText}
                  </span>
                </>
              ) : (
                <>
                  Ready to extract <strong className="text-text-primary">{selectedCount}</strong>{' '}
                  {selectedCount === 1 ? 'page' : 'pages'}:{' '}
                  <span className="font-mono font-semibold text-accent">
                    {rangeAnalysis.summaryText}
                  </span>
                </>
              )
            ) : isEs ? (
              'Marca una o más miniaturas o escribe un rango abajo para extraer.'
            ) : (
              'Toggle one or more thumbnails above or type a range below to extract.'
            )}
          </span>

          {onExtractSelected && (
            <button
              type="button"
              data-testid="extract-selected-btn"
              disabled={processing || selectedCount === 0}
              onClick={onExtractSelected}
              className="ui-btn-primary px-3 py-1.5 text-xs shrink-0 disabled:opacity-45 disabled:pointer-events-none"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEs ? 'Extrayendo...' : 'Extracting...'}</span>
                </>
              ) : (
                <>
                  <Scissors className="w-3.5 h-3.5" />
                  <span>
                    {isEs ? 'Extraer seleccionadas' : 'Extract Selected'}
                    {selectedCount > 0 ? ` (${selectedCount})` : ''}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function GridThumbnailCard({
  pageItem,
  isSelected,
  extractOrder,
  selectionMode,
  onPageClick,
  onVisible,
  isEs,
}: {
  pageItem: ThumbnailPageItem;
  isSelected: boolean;
  extractOrder: number | undefined;
  selectionMode: 'multi' | 'single';
  onPageClick: (pageIndex: number, e: React.MouseEvent<HTMLButtonElement>) => void;
  onVisible: (pageNum: number) => void;
  isEs: boolean;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const pageIndex = pageItem.pageNumber - 1;

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(pageItem.pageNumber);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [pageItem.pageNumber, onVisible]);

  return (
    <button
      ref={cardRef}
      type="button"
      aria-pressed={isSelected}
      aria-label={
        isEs
          ? `Página ${pageItem.pageNumber}${isSelected ? ' (seleccionada)' : ''}`
          : `Page ${pageItem.pageNumber}${isSelected ? ' (selected)' : ''}`
      }
      data-page-number={pageItem.pageNumber}
      data-selected={isSelected ? 'true' : 'false'}
      onClick={(e) => onPageClick(pageIndex, e)}
      className={`group relative rounded-xl border p-2 flex flex-col items-center gap-1.5 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isSelected
          ? 'bg-accent-light/50 dark:bg-surface-selected border-accent ring-2 ring-accent/25 shadow-xs opacity-100'
          : 'bg-surface border-border-subtle hover:border-accent/60 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="w-full aspect-[3/4] bg-surface-secondary rounded-lg overflow-hidden flex items-center justify-center relative border border-border-subtle/70">
        {pageItem.dataUrl ? (
          <img
            src={pageItem.dataUrl}
            alt={isEs ? `Miniatura página ${pageItem.pageNumber}` : `Page ${pageItem.pageNumber} thumbnail`}
            className="object-contain w-full h-full bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-text-tertiary">
            <FileText className="w-5 h-5" />
            {pageItem.rendering && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
          </div>
        )}

        {isSelected ? (
          <div className="absolute inset-0 bg-accent/15 flex items-start justify-between p-1.5 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded bg-accent text-white font-mono text-[10px] font-bold leading-none shadow-xs">
              #{extractOrder}
            </span>
            <span className="w-5 h-5 rounded-md bg-accent text-white flex items-center justify-center shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
        ) : (
          selectionMode === 'multi' && (
            <div className="absolute top-1.5 right-1.5 pointer-events-none">
              <span className="w-5 h-5 rounded-md bg-surface/90 border border-border-main text-text-tertiary group-hover:border-accent group-hover:text-accent flex items-center justify-center shadow-2xs transition-colors">
                <Square className="w-3 h-3" />
              </span>
            </div>
          )
        )}
      </div>

      <div className="w-full flex items-center justify-between px-0.5">
        <span className="text-[11px] font-mono font-bold text-text-primary">
          {isEs ? `Pág. ${pageItem.pageNumber}` : `Pg ${pageItem.pageNumber}`}
        </span>
        {isSelected && (
          <span className="text-[10px] font-semibold text-accent">
            {isEs ? 'Extraer' : 'Extract'}
          </span>
        )}
      </div>
    </button>
  );
}
