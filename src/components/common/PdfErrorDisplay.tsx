import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  FileWarning,
  Lightbulb,
  Lock,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import type { Language } from '../../i18n/translations.ts';
import {
  normalizePdfDisplayError,
  type PdfErrorCategory,
  type PdfErrorInput,
} from './PdfErrorAlert.tsx';

export interface PdfErrorDisplayProps {
  /** Error message string, Error instance, or structured PdfProcessingError payload. */
  errorMessage: PdfErrorInput | null | undefined;
  /** Optional retry callback invoked when the user clicks the Retry button. */
  onRetry?: () => void;
  /** Optional callback to dismiss the error banner. */
  onDismiss?: () => void;
  /** Optional callback to clear inputs and upload another file. */
  onReset?: () => void;
  /** Optional override heading shown when no specific code title applies. */
  title?: string;
  /** Optional localized button label for the retry action. */
  retryLabel?: string;
  /** UI language for localized headings, hints, and action labels. */
  language?: Language;
  /** Compact inline layout (e.g. inside thumbnail preview slots). */
  compact?: boolean;
  /** Additional CSS classes appended after `ui-error-state`. */
  className?: string;
}

function renderErrorIcon(category: PdfErrorCategory) {
  const cls = 'w-4 h-4 shrink-0 mt-0.5';
  switch (category) {
    case 'password':
      return <Lock className={cls} aria-hidden="true" />;
    case 'invalid-file':
      return <FileWarning className={cls} aria-hidden="true" />;
    case 'memory':
    case 'ocr':
    case 'integrity':
      return <AlertTriangle className={cls} aria-hidden="true" />;
    default:
      return <AlertCircle className={cls} aria-hidden="true" />;
  }
}

export function PdfErrorDisplay({
  errorMessage,
  onRetry,
  onDismiss,
  onReset,
  title,
  retryLabel,
  language = 'en',
  compact = false,
  className = '',
}: PdfErrorDisplayProps) {
  const normalized = normalizePdfDisplayError(errorMessage, language, title);
  if (!normalized) return null;

  const isEs = language === 'es';
  const resolvedRetryLabel = retryLabel || (isEs ? 'Reintentar' : 'Try Again');

  return (
    <div
      role="alert"
      data-pdf-error-code={normalized.code || normalized.category}
      className={`ui-error-state ${compact ? 'p-3' : ''} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {renderErrorIcon(normalized.category)}
          <div className="space-y-1 min-w-0">
            <div className="font-semibold text-xs leading-snug">
              {normalized.title}
            </div>
            <p className="text-xs font-normal leading-relaxed opacity-95 break-words">
              {normalized.message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={isEs ? 'Cerrar mensaje de error' : 'Dismiss error message'}
            className="p-1 rounded-md opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {normalized.hint && !compact && (
        <div className="mt-2.5 pt-2 border-t border-current/15 flex items-start gap-2 text-[11px] font-normal opacity-95">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{normalized.hint}</span>
        </div>
      )}

      {!compact && (onRetry || onReset) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-current/25 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{resolvedRetryLabel}</span>
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-current/20 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEs ? 'Probar otro archivo' : 'Upload Another File'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PdfErrorDisplay;
