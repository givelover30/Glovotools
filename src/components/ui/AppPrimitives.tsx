import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UiButtonSize = 'sm' | 'md';

interface UiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
}

export function UiButton({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: UiButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'ui-btn-primary'
      : variant === 'ghost'
      ? 'ui-btn-ghost'
      : 'ui-btn-secondary';

  const sizeClass = size === 'sm' ? 'min-h-[34px] px-3 py-1.5 text-xs' : '';

  return (
    <button
      type={type}
      className={`${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

interface UiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function UiInput({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: UiInputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="ui-label block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`ui-input ${error ? 'border-status-error' : ''} ${className}`.trim()}
        {...props}
      />
      {error ? (
        <p className="text-xs text-status-error font-medium">{error}</p>
      ) : hint ? (
        <p className="ui-meta">{hint}</p>
      ) : null}
    </div>
  );
}

interface UiSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export function UiSelect({
  label,
  hint,
  id,
  className = '',
  children,
  ...props
}: UiSelectProps) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="ui-label block">
          {label}
        </label>
      )}
      <select id={selectId} className={`ui-select ${className}`.trim()} {...props}>
        {children}
      </select>
      {hint && <p className="ui-meta">{hint}</p>}
    </div>
  );
}

interface UiCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function UiCheckbox({ label, id, className = '', ...props }: UiCheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer select-none ${className}`.trim()}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="w-4 h-4 rounded border-border-strong accent-[#2563EB] dark:accent-[#3B82F6] cursor-pointer"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export type UiStatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

interface UiStatusLabelProps {
  tone?: UiStatusTone;
  children: React.ReactNode;
  className?: string;
}

export function UiStatusLabel({
  tone = 'neutral',
  children,
  className = ''
}: UiStatusLabelProps) {
  const toneClasses: Record<UiStatusTone, string> = {
    neutral: 'text-text-secondary bg-surface-secondary',
    accent: 'text-accent bg-accent-light',
    success: 'text-status-success bg-status-success-bg',
    warning: 'text-status-warning bg-status-warning-bg',
    error: 'text-status-error bg-status-error-bg'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

interface UiLoadingStateProps {
  rows?: number;
  label?: string;
}

export function UiLoadingState({ rows = 3, label = 'Loading view...' }: UiLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4"
    >
      <span className="sr-only">{label}</span>
      <div className="ui-skeleton h-7 w-56" />
      <div className="ui-skeleton h-4 w-80 max-w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="ui-panel p-5 space-y-3">
            <div className="ui-skeleton h-9 w-9 rounded-lg" />
            <div className="ui-skeleton h-4 w-3/4" />
            <div className="ui-skeleton h-3 w-full" />
            <div className="ui-skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface UiEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function UiEmptyState({ title, description, action, icon }: UiEmptyStateProps) {
  return (
    <div className="ui-empty-state space-y-2.5">
      <div className="mx-auto w-10 h-10 rounded-xl bg-surface border border-border-main flex items-center justify-center text-text-tertiary">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {description && <p className="text-xs text-text-secondary max-w-md mx-auto">{description}</p>}
      {action && <div className="pt-1.5">{action}</div>}
    </div>
  );
}

interface UiErrorStateProps {
  message: string;
  action?: React.ReactNode;
}

export function UiErrorState({ message, action }: UiErrorStateProps) {
  return (
    <div role="alert" className="ui-error-state flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="truncate">{message}</span>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
