import { useState, useEffect } from 'react';
import { History, Trash2, ChevronDown, Check, Clock, ArrowRight } from 'lucide-react';
import { CalculationHistoryItem, CalculationHistoryService } from '../../services/CalculationHistoryService.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CalculatorId } from '../../types.ts';

interface CalculationHistoryWidgetProps {
  onSelectCalculator?: (id: CalculatorId) => void;
}

export default function CalculationHistoryWidget({ onSelectCalculator }: CalculationHistoryWidgetProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = () => {
    setHistory(CalculationHistoryService.getHistory());
  };

  useEffect(() => {
    loadHistory();
    // Listen for custom calculation event or poll localStorage / storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'calctools_calculation_history') {
        loadHistory();
      }
    };
    window.addEventListener('storage', handleStorage);
    // Custom window event for instant updates within session
    const handleCustomUpdate = () => loadHistory();
    window.addEventListener('calctools:history-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('calctools:history-updated', handleCustomUpdate);
    };
  }, []);

  if (history.length === 0) {
    return null;
  }

  const handleClear = () => {
    CalculationHistoryService.clearHistory();
    setHistory([]);
    window.dispatchEvent(new Event('calctools:history-updated'));
  };

  const handleCopy = (item: CalculationHistoryItem) => {
    const text = `${item.calculatorName}\n${item.primaryResult.label}: ${item.primaryResult.value}\n(${new Date(item.timestamp).toLocaleString()})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="ui-panel p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-primary hover:text-accent transition-colors cursor-pointer"
          aria-expanded={isOpen}
        >
          <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <span>{isEs ? 'Últimos 5 Cálculos de la Sesión' : 'Recent Session Calculations (Last 5)'}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-secondary text-text-tertiary">
            {history.length}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title={isEs ? 'Borrar historial' : 'Clear history'}
            className="text-xs text-text-tertiary hover:text-status-error flex items-center gap-1 transition-colors cursor-pointer p-1"
          >
            <Trash2Name className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEs ? 'Limpiar' : 'Clear'}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-2.5 pt-2 border-t border-border-subtle animate-fadeIn">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={item.id}
                className="kpi-hover-elastic p-3 rounded-xl border border-border-subtle bg-surface-secondary/50 hover:bg-surface-secondary transition-colors text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectCalculator?.(item.calculatorId as CalculatorId)}
                      className="font-semibold text-text-primary hover:text-accent transition-colors text-left cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{item.calculatorName}</span>
                      <ArrowRight className="w-3 h-3 text-text-tertiary" />
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{timeFormatted}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-accent text-sm">
                      {item.primaryResult.value}
                    </div>
                    <div className="text-[11px] text-text-secondary truncate max-w-[180px]">
                      {item.primaryResult.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-text-secondary hover:text-text-primary flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? (isEs ? 'Ocultar entradas' : 'Hide inputs') : (isEs ? 'Ver entradas' : 'View inputs')}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="text-accent hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{isEs ? '¡Copiado!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <span>{isEs ? 'Copiar resultado' : 'Copy result'}</span>
                    )}
                  </button>
                </div>

                {isExpanded && item.inputs && Object.keys(item.inputs).length > 0 && (
                  <div className="pt-2 border-t border-border-subtle space-y-1 font-mono text-[11px] text-text-secondary">
                    <div className="font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                      {isEs ? 'Parámetros de entrada:' : 'Input Parameters:'}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 bg-surface p-2 rounded-lg border border-border-subtle">
                      {Object.entries(item.inputs).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-text-tertiary">{k}:</span> <span className="text-text-primary font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Trash2Name(props: any) {
  return <Trash2 {...props} />;
}
