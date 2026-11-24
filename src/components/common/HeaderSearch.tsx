import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ArrowRight, CornerDownLeft, Clock, Flame, FolderOpen } from 'lucide-react';
import { CalculatorId, CalculatorMeta, CategoryId } from '../../types.ts';
import { CALCULATORS, CATEGORIES } from '../../data/calculators.ts';
import { getAllCategories } from '../../data/categories/categoryDiscovery.ts';
import { fuzzyMatch } from '../../utils/fuzzySearch.ts';
import ToolIconBadge from './ToolIconBadge.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';

interface HeaderSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectCategory?: (catId: CategoryId | 'all') => void;
  onSearchSubmit?: () => void;
  searchResults?: CalculatorMeta[];
  recentCalculators?: CalculatorMeta[];
}

type SuggestionItem =
  | { type: 'category'; id: string; name: string; color: string; count?: number }
  | { type: 'tool'; tool: CalculatorMeta; categoryTitle?: string };

const POPULAR_QUICK_IDS: CalculatorId[] = [
  'loan-mortgage',
  'percentage',
  'bmi',
  'universal-unit-converter',
  'compound-interest',
  'scientific-calc'
];

export default function HeaderSearch({
  searchQuery,
  onSearchChange,
  onSelectCalculator,
  onSelectCategory,
  onSearchSubmit,
  searchResults = [],
  recentCalculators = []
}: HeaderSearchProps) {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(-1);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const closeSearch = useCallback((returnFocus = false) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (returnFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }, []);

  // Global keyboard shortcut (Cmd/Ctrl+K or "/" when not typing in an input) and custom trigger event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeSearch(true);
        } else {
          openSearch();
        }
        return;
      }

      if (
        e.key === '/' &&
        !isOpen &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        openSearch();
      }
    };

    const handleCustomOpen = () => {
      openSearch();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('calctools:open-search', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('calctools:open-search', handleCustomOpen);
    };
  }, [isOpen, openSearch, closeSearch]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, closeSearch]);

  // Matching categories for live query
  const matchingCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const scored = getAllCategories()
      .map((cat) => {
        const name = cat.name.toLowerCase();
        let score = 0;
        if (name === q) score = 100;
        else if (name.startsWith(q)) score = 80;
        else if (name.includes(q)) score = 50;
        else if (fuzzyMatch(cat.name, q)) score = 20;
        return { cat, score };
      })
      .filter((item) => item.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((item) => item.cat);
  }, [searchQuery]);

  // Matching tools using App's Fuse.js results with localized fallback (deduplicated)
  const matchingTools = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const source =
      searchResults.length > 0
        ? searchResults
        : CALCULATORS.filter(
            (c) =>
              c.name.toLowerCase().includes(q.toLowerCase()) ||
              c.shortDesc.toLowerCase().includes(q.toLowerCase()) ||
              fuzzyMatch(c.name, q.toLowerCase())
          );

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const unique: CalculatorMeta[] = [];
    for (const item of source) {
      const nameKey = item.name.toLowerCase().trim();
      if (!seenIds.has(item.id) && !seenNames.has(nameKey)) {
        seenIds.add(item.id);
        seenNames.add(nameKey);
        unique.push(item);
        if (unique.length >= 6) break;
      }
    }
    return unique;
  }, [searchQuery, searchResults]);

  // Quick tools shown when search is open with empty query
  const quickTools = useMemo(() => {
    const base = recentCalculators.length > 0
      ? recentCalculators
      : POPULAR_QUICK_IDS.map((id) => CALCULATORS.find((c) => c.id === id)).filter(
          (c): c is CalculatorMeta => Boolean(c)
        );
    const seenIds = new Set<string>();
    return base.filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    }).slice(0, 5);
  }, [recentCalculators]);

  // Flatten suggestions for keyboard arrow navigation
  const flatItems = useMemo<SuggestionItem[]>(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return quickTools.map((tool) => {
        const rawCat = CATEGORIES.find((c) => c.id === tool.category);
        return {
          type: 'tool',
          tool,
          categoryTitle: rawCat ? getLocalizedCategory(rawCat, language).title : undefined
        };
      });
    }

    const items: SuggestionItem[] = [];
    matchingCategories.forEach((cat) => {
      items.push({ type: 'category', id: cat.id, name: cat.name, color: cat.color });
    });
    matchingTools.forEach((tool) => {
      const rawCat = CATEGORIES.find((c) => c.id === tool.category);
      items.push({
        type: 'tool',
        tool,
        categoryTitle: rawCat ? getLocalizedCategory(rawCat, language).title : undefined
      });
    });
    return items;
  }, [searchQuery, quickTools, matchingCategories, matchingTools, language]);

  // Reset active highlight when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery]);

  const handleSelectItem = useCallback(
    (item: SuggestionItem) => {
      if (item.type === 'category') {
        onSelectCategory?.(item.id as CategoryId);
      } else {
        onSelectCalculator(item.tool.id as CalculatorId);
      }
      closeSearch(false);
    },
    [onSelectCalculator, onSelectCategory, closeSearch]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % flatItems.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        handleSelectItem(flatItems[activeIndex]);
      } else if (searchQuery.trim() && flatItems.length > 0 && flatItems[0].type === 'tool') {
        handleSelectItem(flatItems[0]);
      } else if (searchQuery.trim()) {
        onSearchSubmit?.();
        closeSearch(false);
      }
    }
  };

  const trimmedQuery = searchQuery.trim();
  const hasMatches = flatItems.length > 0;
  const listboxId = 'header-search-suggestions';

  const quickKeywords = language === 'es'
    ? ['hipoteca', 'porcentaje', 'imc', 'pdf']
    : ['mortgage', 'percentage', 'bmi', 'pdf'];

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Compact Expandable Global Search Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeSearch(true) : openSearch())}
        aria-label={language === 'es' ? 'Buscar herramientas' : 'Search tools'}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        title={language === 'es' ? 'Buscar herramientas (/ o ⌘K)' : 'Search tools (/ or ⌘K)'}
        className={`h-9 w-9 md:w-52 lg:w-60 md:px-3 rounded-lg border transition-colors duration-150 flex items-center justify-center md:justify-between gap-2 cursor-pointer shrink-0 ${
          isOpen
            ? 'border-accent bg-surface-selected text-accent'
            : 'border-border-main bg-surface-secondary/70 hover:bg-surface-hover hover:border-border-strong text-text-secondary hover:text-text-primary'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline text-xs font-medium text-text-tertiary truncate">
            {language === 'es' ? 'Buscar herramientas...' : 'Search tools...'}
          </span>
        </span>
        <kbd className="hidden md:inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border border-border-main bg-surface text-text-tertiary leading-none shrink-0">
          /
        </kbd>
      </button>

      {/* Expanded Spotlight-Style Global Search Popover */}
      {isOpen && (
        <>
          {/* Subtle backdrop for focus */}
          <div
            className="fixed inset-0 top-14 bg-slate-950/25 dark:bg-black/55 backdrop-blur-[2px] z-40"
            onClick={() => closeSearch(false)}
            aria-hidden="true"
          />

          <div
            className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[64px] sm:top-full sm:mt-2 sm:w-[440px] md:w-[490px] z-50 rounded-2xl border border-border-main bg-surface dark:bg-surface-elevated shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.72)] overflow-hidden animate-fadeIn"
            role="dialog"
            aria-label={language === 'es' ? 'Búsqueda rápida' : 'Quick Search'}
          >
            {/* Input Row */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border-subtle bg-surface transition-colors focus-within:border-accent/60">
              <Search className="w-4 h-4 text-accent shrink-0" />
              <input
                ref={inputRef}
                type="text"
                data-no-focus-ring="true"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0 ? `header-search-opt-${activeIndex}` : undefined
                }
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  language === 'es'
                    ? 'Buscar calculadoras, convertidores, PDF...'
                    : 'Search calculators, converters, PDF tools...'
                }
                className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    inputRef.current?.focus();
                  }}
                  aria-label={language === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
                  className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => closeSearch(true)}
                aria-label={language === 'es' ? 'Cerrar búsqueda' : 'Close search'}
                className="px-1.5 py-0.5 text-[11px] font-mono rounded border border-border-main bg-surface-secondary text-text-tertiary hover:text-text-primary transition cursor-pointer shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Suggestions Listbox */}
            <div
              id={listboxId}
              role="listbox"
              className="max-h-[62vh] sm:max-h-[420px] overflow-y-auto p-2 space-y-2"
            >
              {!trimmedQuery ? (
                <div>
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-medium text-text-tertiary">
                    <span className="flex items-center gap-1.5">
                      {recentCalculators.length > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{language === 'es' ? 'Usadas recientemente' : 'Recently used'}</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{language === 'es' ? 'Herramientas populares' : 'Popular tools'}</span>
                        </>
                      )}
                    </span>
                    <span className="tabular-nums">{CALCULATORS.length.toLocaleString()}+ tools</span>
                  </div>

                  <div className="space-y-0.5">
                    {flatItems.map((item, idx) => {
                      if (item.type !== 'tool') return null;
                      const localized = getLocalizedCalculator(item.tool, language);
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={item.tool.id}
                          id={`header-search-opt-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => handleSelectItem(item)}
                          className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100'
                              : 'hover:bg-surface-secondary text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ToolIconBadge tool={item.tool} size="sm" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                                {localized.name}
                              </div>
                              <div className="text-[11px] text-text-secondary truncate">
                                {item.categoryTitle ? `${item.categoryTitle} · ` : ''}
                                {localized.shortDesc}
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                              isActive
                                ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5'
                                : 'text-text-tertiary'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : !hasMatches ? (
                <div className="py-8 px-4 text-center space-y-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {language === 'es'
                      ? `Sin resultados para "${trimmedQuery}"`
                      : `No results for "${trimmedQuery}"`}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {language === 'es'
                      ? 'Prueba con una búsqueda rápida:'
                      : 'Try one of these quick searches:'}
                  </p>
                  <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
                    {quickKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          onSearchChange(kw);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg border border-border-main bg-surface-secondary hover:border-emerald-500 text-xs font-medium text-text-secondary hover:text-text-primary transition cursor-pointer"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Matching Categories */}
                  {matchingCategories.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[11px] font-medium text-text-tertiary flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'es' ? 'Categorías' : 'Categories'}</span>
                      </div>
                      <div className="space-y-0.5">
                        {matchingCategories.map((cat, cIdx) => {
                          const isActive = cIdx === activeIndex;
                          return (
                            <button
                              key={cat.id}
                              id={`header-search-opt-${cIdx}`}
                              role="option"
                              aria-selected={isActive}
                              type="button"
                              onMouseEnter={() => setActiveIndex(cIdx)}
                              onClick={() =>
                                handleSelectItem({
                                  type: 'category',
                                  id: cat.id,
                                  name: cat.name,
                                  color: cat.color
                                })
                              }
                              className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60'
                                  : 'hover:bg-surface-secondary'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                                {cat.name}
                              </span>
                              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                {language === 'es' ? 'Categoría' : 'Category'} →
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Tools */}
                  {matchingTools.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[11px] font-medium text-text-tertiary flex items-center justify-between">
                        <span>{language === 'es' ? 'Herramientas' : 'Tools'}</span>
                        <span className="tabular-nums">
                          {searchResults.length > 0 ? searchResults.length : matchingTools.length}{' '}
                          {language === 'es' ? 'coincidencias' : 'matches'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {matchingTools.map((tool, tIdx) => {
                          const flatIdx = matchingCategories.length + tIdx;
                          const isActive = flatIdx === activeIndex;
                          const localized = getLocalizedCalculator(tool, language);
                          const rawCat = CATEGORIES.find((c) => c.id === tool.category);
                          const catTitle = rawCat
                            ? getLocalizedCategory(rawCat, language).title
                            : undefined;

                          return (
                            <button
                              key={tool.id}
                              id={`header-search-opt-${flatIdx}`}
                              role="option"
                              aria-selected={isActive}
                              type="button"
                              onMouseEnter={() => setActiveIndex(flatIdx)}
                              onClick={() =>
                                handleSelectItem({ type: 'tool', tool, categoryTitle: catTitle })
                              }
                              className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60'
                                  : 'hover:bg-surface-secondary'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ToolIconBadge tool={tool} size="sm" />
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                                    {localized.name}
                                  </div>
                                  <div className="text-[11px] text-text-secondary truncate">
                                    {catTitle ? `${catTitle} · ` : ''}
                                    {localized.shortDesc}
                                  </div>
                                </div>
                              </div>
                              <ArrowRight
                                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                  isActive
                                    ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5'
                                    : 'text-text-tertiary'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Subtle Keyboard Hint Footer */}
            <div className="px-3.5 py-2 border-t border-border-subtle bg-surface-secondary/60 flex items-center justify-between text-[11px] text-text-tertiary">
              <div className="hidden sm:flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border-main bg-surface font-mono text-[10px]">↑↓</kbd>
                  <span>{language === 'es' ? 'Navegar' : 'Navigate'}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" />
                  <span>{language === 'es' ? 'Abrir' : 'Open'}</span>
                </span>
              </div>
              {trimmedQuery && searchResults.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchSubmit?.();
                    closeSearch(false);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer ml-auto"
                >
                  {language === 'es'
                    ? `Ver todos (${searchResults.length}) →`
                    : `View all (${searchResults.length}) →`}
                </button>
              ) : (
                <span className="ml-auto">
                  {language === 'es' ? '100% en tu navegador' : 'Instant browser search'}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
