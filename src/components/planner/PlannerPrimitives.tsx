import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  Info,
  RotateCcw,
  ShieldAlert,
  X
} from 'lucide-react';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface PlannerToolbarProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isEs?: boolean;
  hasSavedData?: boolean;
  recoveredFromCorruption?: boolean;
  onDismissCorruptionNotice?: () => void;
  onExportJson?: () => void;
  onExportCsv?: () => void;
  copyText?: string;
  onReset?: () => void;
  onClear?: () => void;
  canClear?: boolean;
  printable?: boolean;
  extraActions?: React.ReactNode;
}

export function PlannerHeaderToolbar({
  icon,
  title,
  subtitle,
  isEs = false,
  hasSavedData = false,
  recoveredFromCorruption = false,
  onDismissCorruptionNotice,
  onExportJson,
  onExportCsv,
  copyText,
  onReset,
  onClear,
  canClear = true,
  printable = true,
  extraActions
}: PlannerToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyText || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-2.5">
      {recoveredFromCorruption && (
        <div
          role="status"
          className="no-print p-3 rounded-xl border border-amber-300 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {isEs
                ? 'Se detectaron datos guardados dañados y se restauraron los valores predeterminados de forma segura.'
                : 'Corrupted saved planner data was detected and safely reset to starter defaults.'}
            </span>
          </div>
          {onDismissCorruptionNotice && (
            <button
              type="button"
              onClick={onDismissCorruptionNotice}
              aria-label={isEs ? 'Cerrar aviso' : 'Dismiss notice'}
              className="p-1 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-900/50 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-text-primary truncate">{title}</h2>
              {hasSavedData && (
                <span className="text-[11px] font-medium text-status-success">
                  {isEs ? '· Guardado localmente' : '· Saved locally'}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary truncate">{subtitle}</p>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          {extraActions}
          {copyText && (
            <UiButton variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
            </UiButton>
          )}
          {onExportCsv && (
            <UiButton variant="secondary" size="sm" onClick={onExportCsv}>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isEs ? 'Exportar CSV' : 'Export CSV'}</span>
            </UiButton>
          )}
          {onExportJson && (
            <UiButton variant="secondary" size="sm" onClick={onExportJson}>
              <Download className="w-3.5 h-3.5" />
              <span>{isEs ? 'Exportar JSON' : 'Export JSON'}</span>
            </UiButton>
          )}
          {printable && <PrintResultButton size="sm" />}
          {onReset && (
            <UiButton variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEs ? 'Restaurar' : 'Reset'}</span>
            </UiButton>
          )}
          {onClear && canClear && (
            <UiButton variant="ghost" size="sm" onClick={onClear}>
              <Eraser className="w-3.5 h-3.5" />
              <span>{isEs ? 'Limpiar' : 'Clear'}</span>
            </UiButton>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlannerDisclaimerProps {
  title: string;
  message: string;
  tone?: 'warning' | 'info';
}

export function PlannerDisclaimer({ title, message, tone = 'warning' }: PlannerDisclaimerProps) {
  const isWarning = tone === 'warning';
  return (
    <div
      role="note"
      className={`print-avoid-break p-3.5 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed ${
        isWarning
          ? 'bg-amber-50/75 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
          : 'bg-surface-secondary/70 border-border-subtle text-text-secondary'
      }`}
    >
      {isWarning ? (
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      )}
      <div>
        <span className="font-semibold text-text-primary">{title}: </span>
        <span>{message}</span>
      </div>
    </div>
  );
}

interface PlannerProgressBarProps {
  label: string;
  percent: number;
  valueLabel?: string;
  tone?: 'accent' | 'success' | 'warning' | 'error';
}

export function PlannerProgressBar({
  label,
  percent,
  valueLabel,
  tone = 'accent'
}: PlannerProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const fillClass =
    tone === 'success'
      ? 'bg-status-success'
      : tone === 'warning'
      ? 'bg-status-warning'
      : tone === 'error'
      ? 'bg-status-error'
      : 'bg-accent';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-text-secondary font-medium truncate">{label}</span>
        <span className="font-mono font-semibold text-text-primary shrink-0">
          {valueLabel ?? `${clamped}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 rounded-full bg-surface-secondary border border-border-subtle overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-200 ${fillClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
