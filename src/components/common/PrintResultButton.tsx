import React, { useCallback, useState } from 'react';
import { Printer } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  triggerResultPrint,
  type PrintPreviewPayload
} from '../../utils/printResult.ts';
import PrintPreviewModal from './PrintPreviewModal.tsx';
import ToastNotification from './ToastNotification.tsx';

export interface PrintResultButtonProps {
  /** Override localized label (defaults to t('btn.print')) */
  label?: string;
  /** 'workspace' prints inputs + results + tables/charts; 'result-only' omits upload dropzones */
  scope?: 'workspace' | 'result-only';
  /** Optional custom print document title */
  documentTitle?: string;
  /** Visual variant matching existing Glovotools action buttons */
  variant?: 'result' | 'secondary';
  /** Compact sizing for dense toolbars */
  size?: 'xs' | 'sm';
  /** Disable when no valid result is available */
  disabled?: boolean;
  /** Optional callback executed immediately prior to printing */
  onBeforePrint?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable Print Result action button for Glovotools calculators and tools.
 * Resolves the clicked calculator's result workspace directly, invokes
 * browser-native isolated printing synchronously on user click, and displays
 * a brief ToastNotification confirming the print process has been initiated.
 */
export default function PrintResultButton({
  label,
  scope = 'workspace',
  documentTitle,
  variant = 'result',
  size = 'xs',
  disabled = false,
  onBeforePrint,
  className = ''
}: PrintResultButtonProps) {
  const { language, t } = useTranslation();
  const [sandboxPayload, setSandboxPayload] = useState<PrintPreviewPayload | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const buttonLabel = label || t('btn.print');

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handlePrint = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onBeforePrint?.();
    const result = triggerResultPrint({
      triggerElement: event.currentTarget,
      scope,
      language,
      documentTitle,
      onSandboxBlocked: (payload) => setSandboxPayload(payload)
    });

    if (result.status === 'printed' || result.status === 'fallback-main') {
      setToastKey((prev) => prev + 1);
      setToastOpen(true);
    }
  };

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs gap-1.5 rounded-lg'
      : 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg';

  const variantClass =
    variant === 'secondary'
      ? 'text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border-main'
      : 'text-result-icon bg-result-bg/60 hover:bg-result-bg border border-result-border';

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        disabled={disabled}
        aria-label={buttonLabel}
        title={buttonLabel}
        data-print-trigger="true"
        className={`no-print inline-flex items-center justify-center font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`.trim()}
      >
        <Printer className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>

      <ToastNotification
        open={toastOpen}
        message={t('print.toastTriggered')}
        onClose={handleCloseToast}
        closeLabel={t('btn.close')}
        triggerKey={toastKey}
      />

      {sandboxPayload && (
        <PrintPreviewModal
          payload={sandboxPayload}
          onClose={() => setSandboxPayload(null)}
        />
      )}
    </>
  );
}
