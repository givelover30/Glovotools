import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { CalculatorId } from '../../types.ts';
import { CALCULATORS, CATEGORIES } from '../../data/calculators.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';
import ToolIconBadge from './ToolIconBadge.tsx';
import Fuse from 'fuse.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectCalculator
}: GlobalSearchModalProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const uniqueCalculators = useMemo(() => {
    const seen = new Set<string>();
    return CALCULATORS.filter((c) => {
      if (!c?.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, []);

  // Fuse search instance
  const fuse = useMemo(() => {
    return new Fuse(uniqueCalculators, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'shortDesc', weight: 0.3 },
        { name: 'tags', weight: 0.1 },
        { name: 'category', weight: 0.05 }
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [uniqueCalculators]);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Default to popular/featured tools if query is empty
      return uniqueCalculators.filter(c => c.isPopular).slice(0, 8);
    }
    return fuse.search(q).map(r => r.item).slice(0, 10);
  }, [query, fuse, uniqueCalculators]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-scroll selected option into view when navigating via arrow keys
  useEffect(() => {
    if (resultsContainerRef.current) {
      const selectedEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        onSelectCalculator(searchResults[selectedIndex].id as CalculatorId);
        onClose();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEs ? 'Búsqueda global rápida' : 'Global Quick Search'}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/50 dark:bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-surface dark:bg-surface-elevated border border-border-main shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-3 shrink-0">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={true}
            aria-autocomplete="list"
            aria-controls="global-search-results-list"
            aria-activedescendant={searchResults.length > 0 ? `global-search-option-${selectedIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isEs
                ? 'Buscar cualquier calculadora, conversor o herramienta (ej. hipoteca, IMC, PDF)...'
                : 'Search any calculator, converter or tool (e.g., mortgage, BMI, PDF)...'
            }
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-tertiary focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar búsqueda' : 'Close search'}
            className="p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div ref={resultsContainerRef} id="global-search-results-list" role="listbox" className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider flex items-center justify-between">
            <span>
              {!query.trim()
                ? isEs ? 'Herramientas populares sugeridas' : 'Popular suggested tools'
                : isEs ? `Resultados (${searchResults.length})` : `Results (${searchResults.length})`}
            </span>
            <span className="font-mono text-[10px] normal-case tracking-normal">
              {isEs ? 'Usa ↑↓ para navegar, Enter para abrir' : 'Use ↑↓ to navigate, Enter to select'}
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-text-primary">
                {isEs ? `No se encontraron resultados para "${query}"` : `No tools found matching "${query}"`}
              </p>
              <p className="text-[11px] text-text-secondary">
                {isEs ? 'Pruebe con otra palabra clave o término matemático.' : 'Try a different keyword or formula term.'}
              </p>
            </div>
          ) : (
            searchResults.map((rawCalc, idx) => {
              const calc = getLocalizedCalculator(rawCalc, language);
              const rawCat = CATEGORIES.find((c) => c.id === rawCalc.category);
              const cat = rawCat ? getLocalizedCategory(rawCat, language) : null;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={rawCalc.id}
                  id={`global-search-option-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={idx}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectCalculator(rawCalc.id as CalculatorId);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-surface-selected text-text-primary border border-border-selected/60 shadow-2xs'
                      : 'hover:bg-surface-hover text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ToolIconBadge tool={rawCalc} size="lg" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                        <span>{calc.name}</span>
                        {cat && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary border border-border-subtle">
                            {cat.title}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {calc.shortDesc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-accent translate-x-0.5' : 'text-text-tertiary'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut hint */}
        <div className="px-4 py-2.5 border-t border-border-subtle bg-surface-secondary/40 flex items-center justify-between text-[11px] text-text-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{isEs ? 'Navegación ultrarrápida en CalcTools' : 'Lightning-fast tool navigation'}</span>
          </span>
          <span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border-main text-text-secondary">
            Esc
          </span>
        </div>
      </div>
    </div>
  );
}
