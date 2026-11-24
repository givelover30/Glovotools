import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink, Loader2, Printer, X } from 'lucide-react';
import { type PrintPreviewPayload } from '../../utils/printResult.ts';
import { DownloadPdfService } from '../../services/DownloadPdfService.ts';

interface PrintPreviewModalProps {
  payload: PrintPreviewPayload;
  onClose: () => void;
}

/**
 * Clean Print Preview & Save overlay rendered when an embedded sandboxed iframe
 * suppresses native browser window.print() dialogs.
 * Opens the self-contained printable report in a new browser tab with auto-print
 * triggered immediately upon load, or allows downloading a genuine PDF.
 */
export default function PrintPreviewModal({ payload, onClose }: PrintPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lastBlobUrl) {
        URL.revokeObjectURL(lastBlobUrl);
      }
    };
  }, [onClose, lastBlobUrl]);

  const handleOpenPrintWindow = () => {
    setPopupBlocked(false);
    try {
      // Append auto-print script to the standalone HTML document
      const autoPrintHtml = payload.htmlDocument.replace(
        '</body>',
        '<script>window.onload = function() { window.setTimeout(function() { window.print(); }, 400); };</script></body>'
      );
      const blob = new Blob([autoPrintHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setLastBlobUrl(url);

      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setPopupBlocked(true);
      }
    } catch {
      setPopupBlocked(true);
    }
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setDownloadError(null);
    setIsDownloadingPdf(true);
    try {
      await DownloadPdfService.downloadReport(payload.reportData);
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? `PDF generation failed: ${err.message}`
          : 'Could not generate PDF report. Please try again.'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Print preview — ${payload.calculatorName}`}
      className="no-print fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl h-[88vh] flex flex-col rounded-2xl border border-border-main bg-surface shadow-2xl overflow-hidden animate-fadeIn">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-border-subtle bg-surface-secondary/70">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {payload.calculatorName}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {payload.generatedOnLabel}: {payload.timestamp}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenPrintWindow}
              data-print-window-trigger="true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-result-icon bg-result-bg/70 hover:bg-result-bg border border-result-border transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              data-download-pdf-trigger="true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary bg-surface hover:bg-surface-hover border border-border-main transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Printable Sheet'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close print preview"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status / Popup Blocked Fallback Banner */}
        <div className="px-4 sm:px-5 py-2.5 text-xs bg-surface-secondary/60 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
          {downloadError ? (
            <span role="alert" className="text-status-error font-medium">
              {downloadError}
            </span>
          ) : popupBlocked ? (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                Popup blocker prevented opening the print window. Click below to open manually:
              </span>
              {lastBlobUrl && (
                <a
                  href={lastBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Printable Report in New Tab</span>
                </a>
              )}
            </div>
          ) : (
            <span className="text-text-secondary">
              Clicking Print opens the formatted calculation report in a new browser tab with the native print dialog ready.
            </span>
          )}
        </div>

        {/* Crisp White Paper Preview Frame */}
        <div className="flex-1 bg-slate-200/80 dark:bg-slate-900/90 p-3 sm:p-5 overflow-hidden">
          <iframe
            ref={iframeRef}
            title={`Print Preview — ${payload.calculatorName}`}
            srcDoc={payload.htmlDocument}
            className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-md"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
