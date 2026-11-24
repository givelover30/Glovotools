import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastNotificationProps {
  /** Whether the toast is currently visible */
  open: boolean;
  /** Notification message text */
  message: string;
  /** Callback invoked when the toast auto-dismisses or is closed by the user */
  onClose: () => void;
  /** Auto-dismiss duration in milliseconds (defaults to 2800ms) */
  durationMs?: number;
  /** Accessible label for the dismiss button */
  closeLabel?: string;
  /** Optional trigger counter to restart the timer on repeated clicks */
  triggerKey?: number;
  /** Optional data attribute for testing/targeting */
  dataAttr?: string;
}

/**
 * Lightweight, accessible portal toast notification excluded from printed output (.no-print).
 */
export default function ToastNotification({
  open,
  message,
  onClose,
  durationMs = 2800,
  closeLabel = 'Close',
  triggerKey = 0,
  dataAttr = 'true'
}: ToastNotificationProps) {
  useEffect(() => {
    if (!open || durationMs <= 0) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onClose, triggerKey]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      data-print-toast={dataAttr}
      className="no-print fixed bottom-5 right-5 z-[110] flex items-center gap-2.5 pl-3.5 pr-2.5 py-2.5 rounded-xl border border-result-border bg-surface dark:bg-surface-elevated text-text-primary shadow-lg animate-slideUp"
    >
      <CheckCircle2 className="w-4 h-4 text-result-icon shrink-0" aria-hidden="true" />
      <span className="text-xs font-semibold whitespace-nowrap">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="ml-0.5 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>,
    document.body
  );
}
