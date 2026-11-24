import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Eraser,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { UiStatusLabel, UiStatusTone } from '../ui/AppPrimitives.tsx';

/* ============================================================================
   CALCTOOLS 2.0 — PHASE 4 UNIVERSAL TOOL WORKSPACE PRIMITIVES
   Utily-inspired compact surfaces · Single-elevation depth · Light + Dark tokens
   ============================================================================ */

interface ToolSplitWorkspaceProps {
  inputs: React.ReactNode;
  results: React.ReactNode;
  below?: React.ReactNode;
  ratio?: '6-6' | '7-5';
}

export function ToolSplitWorkspace({
  inputs,
  results,
  below,
  ratio = '7-5'
}: ToolSplitWorkspaceProps) {
  const leftSpan = ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-7';
  const rightSpan = ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-5';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className={`${leftSpan} min-w-0`}>{inputs}</div>
        <div className={`${rightSpan} min-w-0`}>{results}</div>
      </div>
      {below && <div>{below}</div>}
    </div>
  );
}

interface ToolInputPanelProps {
  title: string;
  subtitle?: string;
  onReset?: () => void;
  onClear?: () => void;
  resetLabel?: string;
  clearLabel?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function ToolInputPanel({
  title,
  subtitle,
  onReset,
  onClear,
  resetLabel = 'Reset',
  clearLabel = 'Clear',
  headerExtra,
  children
}: ToolInputPanelProps) {
  return (
    <section className="ui-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerExtra}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer whitespace-nowrap"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{clearLabel}</span>
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetLabel}</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface ToolFieldGroupProps {
  label: string;
  htmlFor?: string;
  unit?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function ToolFieldGroup({
  label,
  htmlFor,
  unit,
  hint,
  error,
  required,
  children
}: ToolFieldGroupProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="ui-label block">
          {label}
          {required && <span className="text-status-error ml-0.5">*</span>}
        </label>
        {unit && (
          <span className="text-[11px] font-mono text-text-tertiary shrink-0">{unit}</span>
        )}
      </div>

      {children}

      {error ? (
        <p role="alert" className="text-xs text-status-error font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-xs text-text-tertiary leading-normal">{hint}</p>
      ) : null}
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface ToolSegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function ToolSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = ''
}: ToolSegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-[10px] bg-surface-secondary border border-border-subtle ${className}`.trim()}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-surface text-accent shadow-xs border border-border-main/80'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface ToolPresetBarProps {
  label?: string;
  presets: Array<{ label: string; onSelect: () => void }>;
}

export function ToolPresetBar({ label = 'Examples:', presets }: ToolPresetBarProps) {
  if (presets.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-xs font-medium text-text-tertiary mr-1">{label}</span>
      {presets.map((preset, idx) => (
        <button
          key={idx}
          type="button"
          onClick={preset.onSelect}
          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border-main bg-surface-secondary/60 hover:bg-surface-hover hover:border-accent/60 text-text-secondary hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

interface ToolAdvancedToggleProps {
  label?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ToolAdvancedToggle({
  label = 'Advanced options',
  isOpen,
  onToggle,
  children
}: ToolAdvancedToggleProps) {
  return (
    <div className="pt-2 border-t border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
          <span>{label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
        />
      </button>

      {isOpen && <div className="pt-3 space-y-4 animate-fadeIn">{children}</div>}
    </div>
  );
}

interface ToolResultsPanelProps {
  title?: string;
  primaryLabel?: string;
  primaryValue?: string;
  primaryUnit?: string;
  primarySubtext?: string;
  statusLabel?: string;
  statusTone?: UiStatusTone;
  copyText?: string;
  copyLabel?: string;
  copiedLabel?: string;
  state?: 'ready' | 'empty' | 'error';
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorMessage?: string;
  children?: React.ReactNode;
}

export function ToolResultsPanel({
  title = 'Result',
  primaryLabel,
  primaryValue,
  primaryUnit,
  primarySubtext,
  statusLabel,
  statusTone = 'accent',
  copyText,
  copyLabel = 'Copy result',
  copiedLabel = 'Copied',
  state = 'ready',
  emptyTitle = 'Enter values to calculate',
  emptyDescription = 'Adjust any input on the left to view live formatted results here.',
  errorTitle = 'Check your inputs',
  errorMessage = 'Please enter valid values to complete the calculation.',
  children
}: ToolResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copyText || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      aria-live="polite"
      className="ui-panel p-5 sm:p-6 space-y-5 lg:sticky lg:top-28"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        {state === 'ready' && copyText && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-result-icon hover:bg-result-bg border border-border-subtle transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
        )}
      </div>

      {state === 'error' ? (
        <div role="alert" className="ui-error-state flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-xs">{errorTitle}</div>
            <p className="text-xs opacity-90 font-normal">{errorMessage}</p>
          </div>
        </div>
      ) : state === 'empty' ? (
        <div className="ui-empty-state space-y-1.5">
          <p className="text-sm font-semibold text-text-primary">{emptyTitle}</p>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {primaryValue !== undefined && (
            <div className="rounded-xl border border-result-border bg-result-bg p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {primaryLabel && (
                  <span className="text-xs font-semibold text-result-text-secondary">
                    {primaryLabel}
                  </span>
                )}
                {statusLabel && (
                  <UiStatusLabel
                    tone={statusTone === 'accent' ? 'success' : statusTone}
                    className={
                      statusTone === 'accent' || statusTone === 'success'
                        ? '!bg-result-badge-bg !text-result-text'
                        : ''
                    }
                  >
                    {statusLabel}
                  </UiStatusLabel>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-result-text break-words [overflow-wrap:anywhere]">
                  {primaryValue}
                </span>
                {primaryUnit && (
                  <span className="text-sm font-medium text-result-text-secondary">{primaryUnit}</span>
                )}
              </div>

              {primarySubtext && (
                <p className="text-xs text-result-text-secondary leading-relaxed">{primarySubtext}</p>
              )}
            </div>
          )}

          {children}
        </div>
      )}
    </section>
  );
}

interface ToolMetricTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export function ToolMetricTile({ label, value, hint, accent = false }: ToolMetricTileProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-secondary/70 dark:bg-surface-elevated/60 p-3.5 min-w-0">
      <span className="block text-xs text-text-secondary truncate">{label}</span>
      <span
        className={`mt-1 block text-base font-bold font-mono tabular-nums break-words [overflow-wrap:anywhere] ${
          accent ? 'text-result-icon' : 'text-text-primary'
        }`}
      >
        {value}
      </span>
      {hint && <span className="mt-0.5 block text-[11px] text-text-tertiary truncate">{hint}</span>}
    </div>
  );
}

interface ToolBreakdownListProps {
  items: Array<{ label: string; value: string; highlight?: boolean }>;
}

export function ToolBreakdownList({ items }: ToolBreakdownListProps) {
  return (
    <div className="divide-y divide-border-subtle border-t border-border-subtle text-xs">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3 py-2.5">
          <span className={item.highlight ? 'font-semibold text-text-primary' : 'text-text-secondary'}>
            {item.label}
          </span>
          <span
            className={`font-mono tabular-nums text-right ${
              item.highlight ? 'font-bold text-result-icon' : 'font-semibold text-text-primary'
            }`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
