import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, FileText, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { type PdfErrorInput } from './PdfErrorAlert.tsx';
import PdfErrorDisplay from './PdfErrorDisplay.tsx';
import {
  pdfjsLib,
  ensurePdfJsWorker,
  clonePdfBytes,
  cleanupPdfPage,
  destroyPdfDocument,
  releaseCanvasMemory,
} from '../../services/pdf/pdfRuntime.ts';

interface PdfThumbnailPreviewProps {
  file: File | null;
  selectedPageIndices?: number[];
  onTogglePageSelection?: (pageIndex: number) => void;
  multiSelect?: boolean;
}

interface ThumbnailPageItem {
  pageNumber: number;
  dataUrl?: string;
  width: number;
  height: number;
  rendered: boolean;
  rendering?: boolean;
}

export default function PdfThumbnailPreview({
  file,
  selectedPageIndices = [],
  onTogglePageSelection,
  multiSelect: _multiSelect = true
}: PdfThumbnailPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<ThumbnailPageItem[]>([]);
  const [error, setError] = useState<PdfErrorInput | null>(null);
  const { language } = useTranslation();

  const pdfDocRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const renderingPagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
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

        const initialSlots: ThumbnailPageItem[] = Array.from({ length: numPages }, (_, idx) => ({
          pageNumber: idx + 1,
          dataUrl: undefined,
          width: 180,
          height: 240,
          rendered: false,
          rendering: false,
        }));

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
                    'Page thumbnails are unavailable until this password-protected PDF is unlocked. Enter the password below and continue processing.',
                  messageEs:
                    'Las vistas previas de página no están disponibles hasta desbloquear este PDF protegido con contraseña. Ingresa la contraseña abajo para continuar.',
                }
              : {
                  code: 'ERR_PDF_LOAD_FAILED',
                  message:
                    'Could not load page thumbnails for this PDF. You can still inspect or repair the file using the tool options below.',
                  messageEs:
                    'No se pudieron cargar las vistas previas de página para este PDF. Aún puedes inspeccionar o reparar el archivo con las opciones de abajo.',
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
      const viewport = page.getViewport({ scale: 0.3 });
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const context = canvas.getContext('2d');

      if (context) {
        const renderTask = page.render({ canvasContext: context, canvas, viewport });
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

  if (!file) return null;

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border-subtle bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center gap-3 text-xs text-text-secondary">
        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
        <span>{language === 'es' ? 'Cargando documento PDF...' : 'Loading PDF document...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <PdfErrorDisplay
        compact
        errorMessage={error}
        language={language}
      />
    );
  }

  const renderedCount = pages.filter((p) => p.rendered).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span>
            {language === 'es' ? 'Vista Previa de Páginas' : 'Document Page Thumbnails'} ({pages.length})
          </span>
          {renderedCount < pages.length && (
            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-text-tertiary normal-case">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              <span>
                {renderedCount}/{pages.length} loaded
              </span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-text-tertiary">
          {language === 'es' ? 'Haga clic para seleccionar páginas' : 'Click to select pages'}
          {selectedPageIndices.length > 0 ? ` (${selectedPageIndices.length})` : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[260px] overflow-y-auto p-2 rounded-xl border border-border-subtle bg-neutral-50/50 dark:bg-neutral-900/40">
        {pages.map((p) => {
          const pageIndex = p.pageNumber - 1;
          const isSelected = selectedPageIndices.includes(pageIndex);

          return (
            <ThumbnailCard
              key={p.pageNumber}
              pageItem={p}
              isSelected={isSelected}
              onToggle={onTogglePageSelection}
              onVisible={renderThumbnailPage}
            />
          );
        })}
      </div>
    </div>
  );
}

function ThumbnailCard({
  pageItem,
  isSelected,
  onToggle,
  onVisible,
}: {
  pageItem: ThumbnailPageItem;
  isSelected: boolean;
  onToggle?: (pageIndex: number) => void;
  onVisible: (pageNum: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
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
    <div
      ref={cardRef}
      onClick={() => onToggle && onToggle(pageIndex)}
      className={`relative group rounded-xl border p-2 flex flex-col items-center gap-1.5 transition cursor-pointer bg-white dark:bg-neutral-900 ${
        isSelected
          ? 'border-red-600 ring-2 ring-red-500/20 shadow-xs'
          : 'border-border-subtle hover:border-red-300 dark:hover:border-red-700'
      }`}
    >
      <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center relative">
        {pageItem.dataUrl ? (
          <img src={pageItem.dataUrl} alt={`Page ${pageItem.pageNumber}`} className="object-contain w-full h-full shadow-2xs" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-text-tertiary">
            <FileText className="w-6 h-6" />
            {pageItem.rendering && <Loader2 className="w-3 h-3 animate-spin text-red-600" />}
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        )}
      </div>
      <span className="text-[11px] font-mono font-bold text-text-primary">
        {pageItem.pageNumber}
      </span>
    </div>
  );
}
