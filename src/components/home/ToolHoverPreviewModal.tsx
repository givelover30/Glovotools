import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, Star, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../../types.ts';
import ToolIconBadge from '../common/ToolIconBadge.tsx';
import { CalculationRegistry } from '../../engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../../engine/CalculationExecutor.ts';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface ToolHoverPreviewModalProps {
  tool: CalculatorMeta;
  categoryLabel?: string;
  anchorRect: DOMRect;
  isFavorite: boolean;
  onClose: () => void;
  onSelect: (id: CalculatorId) => void;
  onToggleFavorite: (id: CalculatorId) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ToolHoverPreviewModal({
  tool,
  categoryLabel,
  anchorRect,
  isFavorite,
  onClose,
  onSelect,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave
}: ToolHoverPreviewModalProps) {
  const { currency, formatCurrency } = useCurrency();
  const { language } = useTranslation();
  const isEs = language === 'es';

  const contract = useMemo(() => CalculationRegistry.get(tool.id), [tool.id]);

  // Initial input state from contract inputSchema using field.name as key
  const initialInputs = useMemo(() => {
    const inputs: Record<string, any> = {};
    if (contract?.inputSchema?.fields) {
      for (const field of contract.inputSchema.fields) {
        inputs[field.name] = field.defaultValue ?? (field.type === 'number' || field.type === 'currency' || field.type === 'percentage' || field.type === 'integer' || field.type === 'decimal' ? 0 : '');
      }
    }
    return inputs;
  }, [contract]);

  const [inputValues, setInputValues] = useState<Record<string, any>>(initialInputs);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Execute calculation live on input changes
  const executionResult = useMemo(() => {
    if (!contract || contract.isSyntheticFallback) {
      return null;
    }
    try {
      return CalculationExecutor.execute(tool.id, inputValues);
    } catch {
      return null;
    }
  }, [contract, tool.id, inputValues]);

  const handleInputChange = (name: string, value: any) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setInputValues(initialInputs);
  };

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute smart viewport positioning
  const [modalStyles, setModalStyles] = useState<React.CSSProperties>({
    top: 0,
    left: 0,
    opacity: 0
  });

  useEffect(() => {
    if (!modalRef.current) return;
    const modalEl = modalRef.current;
    const modalRect = modalEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const width = modalRect.width || 360;
    const height = modalRect.height || 320;

    // Prefer positioning to the right of the card, or left if not enough space
    let left = anchorRect.right + 12;
    if (left + width > vw - 16) {
      left = anchorRect.left - width - 12;
    }
    if (left < 16) {
      left = Math.max(16, (vw - width) / 2);
    }

    // Align vertically with card top, clamping to viewport
    let top = anchorRect.top;
    if (top + height > vh - 16) {
      top = Math.max(16, vh - height - 16);
    }

    setModalStyles({
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      opacity: 1,
      transition: 'opacity 150ms ease, transform 150ms ease'
    });
  }, [anchorRect, inputValues]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fieldsToDisplay = contract?.inputSchema?.fields?.slice(0, 3) || [];
  
  const formattedPrimary = executionResult?.success && executionResult.formatted?.primary
    ? executionResult.formatted.primary.value
    : null;

  const primaryResultEntry = executionResult?.success && executionResult.data && !formattedPrimary
    ? Object.entries(executionResult.data).find(([k]) => !k.toLowerCase().includes('schedule') && !k.toLowerCase().includes('breakdown') && !k.toLowerCase().includes('steps'))
    : null;

  const displayOutputText = formattedPrimary || (primaryResultEntry ? String(primaryResultEntry[1]) : (isEs ? 'Calculando...' : 'Ready'));

  const content = (
    <div
      ref={modalRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="dialog"
      aria-label={tool.name}
      className="fixed z-50 w-[360px] max-w-[calc(100vw-32px)] bg-surface dark:bg-surface-elevated border border-border-main rounded-2xl shadow-2xl p-4 text-text-primary animate-fadeIn select-text"
      style={modalStyles}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2.5 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5 min-w-0">
          <ToolIconBadge tool={tool} size="sm" />
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-text-primary truncate">{tool.name}</h4>
            <div className="text-[11px] text-text-tertiary truncate">
              {categoryLabel || tool.category}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(tool.id)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isFavorite ? 'text-amber-500 hover:bg-amber-500/10' : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body / Inputs */}
      <div className="py-3 space-y-3">
        {contract && !contract.isSyntheticFallback && fieldsToDisplay.length > 0 ? (
          <>
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>{isEs ? 'Entradas Rápidas' : 'Quick Inputs'}</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-text-tertiary hover:text-accent flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isEs ? 'Restablecer' : 'Reset'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {fieldsToDisplay.map((field) => {
                const val = inputValues[field.name] ?? field.defaultValue ?? '';
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-[11px] font-medium text-text-secondary truncate">
                      {field.label || field.name}
                      {field.unit ? ` (${field.unit})` : ''}
                    </label>
                    {field.type === 'select' && field.options ? (
                      <select
                        value={val}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-surface-secondary border border-border-main text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                      >
                        {field.options.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent border-border-main cursor-pointer"
                        />
                        <span className="text-xs text-text-primary">{field.label || field.name}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type === 'integer' || field.type === 'decimal' || field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const parsed = field.type === 'integer' ? parseInt(raw, 10) : field.type === 'decimal' || field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? parseFloat(raw) : raw;
                          handleInputChange(field.name, Number.isNaN(parsed) ? raw : parsed);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg bg-surface-secondary border border-border-main text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Result Strip */}
            <div
              className={`${executionResult?.success ? 'kpi-hover-pulse' : 'kpi-hover-bounce'} mt-3 p-3 rounded-xl bg-result-bg border border-result-border flex items-center justify-between`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-semibold text-result-icon uppercase tracking-wider">
                  {isEs ? 'Resultado en Vivo' : 'Live Output'}
                </div>
                <div className="text-sm font-bold font-mono tabular-nums text-result-text truncate mt-0.5">
                  {displayOutputText}
                </div>
              </div>

              {executionResult?.success && (
                <button
                  type="button"
                  onClick={() => handleCopyResult(displayOutputText)}
                  aria-label="Copy result"
                  className="w-8 h-8 rounded-lg bg-surface border border-result-border flex items-center justify-center text-result-icon hover:bg-surface-hover shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-result-icon" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-4 text-center space-y-2">
            <p className="text-xs text-text-secondary leading-relaxed">
              {tool.shortDesc}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>{isEs ? 'Herramienta Interactiva' : 'Interactive Utility'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-tertiary truncate">
          {isEs ? 'Haz clic para abrir completo' : 'Click to open full view'}
        </span>
        <button
          type="button"
          onClick={() => {
            onClose();
            onSelect(tool.id);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <span>{isEs ? 'Abrir Herramienta' : 'Open Tool'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
