import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowRight,
  Layers,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  X,
  CornerDownLeft
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { CalculatorId, CalculatorMeta, CategoryId } from '../types.ts';
import { CALCULATORS, CATEGORIES, getUniqueRegisteredToolCount } from '../data/calculators.ts';
import { LANGUAGES } from '../i18n/translations.ts';
import { getLocalizedCalculator, getLocalizedCategory } from '../i18n/esTranslations.ts';
import { fuzzyMatch } from '../utils/fuzzySearch.ts';
import CalculatorIcon from './common/CalculatorIcon.tsx';
import { UiButton } from './ui/AppPrimitives.tsx';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  searchResults?: CalculatorMeta[];
  recentIds?: CalculatorId[];
  recentUsageCounts?: Record<string, number>;
  onSelectCalculator?: (id: CalculatorId) => void;
  onSelectCategory?: (catId: CategoryId | 'all', subId?: string) => void;
  onBrowseAllTools?: () => void;
}

interface RankedTrendingItem {
  calc: CalculatorMeta;
  localized: CalculatorMeta;
  categoryTitle?: string;
  frequency: number;
  isRecent: boolean;
}

const FALLBACK_POPULAR_IDS: CalculatorId[] = [
  'loan-mortgage',
  'bmi',
  'percentage',
  'universal-unit-converter',
  'compound-interest'
];

export default function Hero({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchResults = [],
  recentIds = [],
  recentUsageCounts = {},
  onSelectCalculator,
  onSelectCategory,
  onBrowseAllTools
}: HeroProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldRenderDropdown, setShouldRenderDropdown] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const metrics = useMemo(() => {
    const toolsCount = getUniqueRegisteredToolCount();
    const categoriesCount = CATEGORIES.filter((c) => c.isActive && c.count > 0).length;
    const languagesCount = LANGUAGES.length;
    return { toolsCount, categoriesCount, languagesCount };
  }, []);

  // Build lookup map of calculator & category metadata
  const calculatorMap = useMemo(() => {
    const map = new Map<CalculatorId, CalculatorMeta>();
    for (const calc of CALCULATORS) {
      if (!map.has(calc.id)) map.set(calc.id, calc);
    }
    return map;
  }, []);

  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const rawCat of CATEGORIES) {
      map.set(rawCat.id, getLocalizedCategory(rawCat, language).title);
    }
    return map;
  }, [language]);

  // Rank trending calculators in real time by usage frequency within recentIds
  const recentFrequencyMap = useMemo(() => {
    const recentOrder = new Map<CalculatorId, number>();
    const recentOccurrences = new Map<CalculatorId, number>();
    recentIds.forEach((id, idx) => {
      if (!recentOrder.has(id)) recentOrder.set(id, idx);
      recentOccurrences.set(id, (recentOccurrences.get(id) || 0) + 1);
    });

    const freqMap = new Map<CalculatorId, { frequency: number; order: number }>();
    for (const [id, order] of recentOrder.entries()) {
      const storedCount = recentUsageCounts[id] ?? 0;
      const occurrences = recentOccurrences.get(id) ?? 1;
      freqMap.set(id, {
        frequency: Math.max(storedCount, occurrences, 1),
        order
      });
    }
    return freqMap;
  }, [recentIds, recentUsageCounts]);

  const trendingItems = useMemo<RankedTrendingItem[]>(() => {
    if (recentFrequencyMap.size > 0) {
      const ranked: (RankedTrendingItem & { order: number })[] = [];
      for (const [id, meta] of recentFrequencyMap.entries()) {
        const calc = calculatorMap.get(id);
        if (!calc) continue;
        ranked.push({
          calc,
          localized: getLocalizedCalculator(calc, language),
          categoryTitle: categoryTitleMap.get(calc.category),
          frequency: meta.frequency,
          isRecent: true,
          order: meta.order
        });
      }
      ranked.sort((a, b) => b.frequency - a.frequency || a.order - b.order);
      return ranked.slice(0, 5).map(({ order: _order, ...rest }) => rest);
    }

    const fallback: RankedTrendingItem[] = [];
    for (const id of FALLBACK_POPULAR_IDS) {
      const calc = calculatorMap.get(id);
      if (!calc) continue;
      fallback.push({
        calc,
        localized: getLocalizedCalculator(calc, language),
        categoryTitle: categoryTitleMap.get(calc.category),
        frequency: 0,
        isRecent: false
      });
    }
    return fallback;
  }, [recentFrequencyMap, calculatorMap, categoryTitleMap, language]);

  // Dynamic Suggested Queries derived from top frequent recentIds calculators
  const suggestedQueries = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const queries: string[] = [];

    for (const item of trendingItems) {
      const candidate = item.localized.name
        .replace(/\b(Calculator|Converter|Generator|Validator|Checker|Tool)\b/gi, '')
        .replace(/\b(Calculadora de|Calculadora|Conversor de|Conversor|Generador de)\b/gi, '')
        .trim();
      const label = candidate.length >= 2 && candidate.length <= 26 ? candidate : item.localized.name;
      const key = label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        queries.push(label);
      }
      if (queries.length >= 4) break;
    }

    return queries;
  }, [trendingItems]);

  // Real-time filtered suggestions when searchQuery is non-empty (boosting frequent recentIds matches)
  const liveMatches = useMemo<RankedTrendingItem[]>(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const qLower = q.toLowerCase();

    const candidates: CalculatorMeta[] = [...searchResults];
    const seenIds = new Set<string>(candidates.map((c) => c.id));

    if (candidates.length < 18) {
      for (const calc of CALCULATORS) {
        if (seenIds.has(calc.id)) continue;
        const localized = getLocalizedCalculator(calc, language);
        const matchesDirect =
          localized.name.toLowerCase().includes(qLower) ||
          localized.shortDesc.toLowerCase().includes(qLower) ||
          fuzzyMatch(localized.name, qLower);
        if (matchesDirect) {
          candidates.push(calc);
          seenIds.add(calc.id);
          if (candidates.length >= 24) break;
        }
      }
    }

    const dedupedByName = new Map<string, RankedTrendingItem & { rankScore: number }>();
    candidates.forEach((calc, idx) => {
      const localized = getLocalizedCalculator(calc, language);
      const nameKey = localized.name.toLowerCase().trim();
      if (dedupedByName.has(nameKey)) return;

      const recentMeta = recentFrequencyMap.get(calc.id);
      const freq = recentMeta?.frequency ?? 0;
      const exactBonus = localized.name.toLowerCase().startsWith(qLower) ? 100 : 0;
      const containsBonus = localized.name.toLowerCase().includes(qLower) ? 40 : 0;
      const frequencyBoost = freq * 15;
      const basePositionScore = Math.max(0, 30 - idx);

      dedupedByName.set(nameKey, {
        calc,
        localized,
        categoryTitle: categoryTitleMap.get(calc.category),
        frequency: freq,
        isRecent: Boolean(recentMeta),
        rankScore: exactBonus + containsBonus + frequencyBoost + basePositionScore
      });
    });

    return Array.from(dedupedByName.values())
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, 6)
      .map(({ rankScore: _score, ...item }) => item);
  }, [searchQuery, searchResults, language, recentFrequencyMap, categoryTitleMap]);

  const trimmedQuery = searchQuery.trim();
  const displayedItems = trimmedQuery ? liveMatches : trendingItems;

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery, isDropdownOpen]);

  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (isDropdownOpen) {
      setShouldRenderDropdown(true);
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          setIsDropdownVisible(true);
        });
      });
    } else {
      setIsDropdownVisible(false);
      closeTimerRef.current = window.setTimeout(() => {
        setShouldRenderDropdown(false);
        closeTimerRef.current = null;
      }, 180);
    }

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown);
  }, [isDropdownOpen]);

  const handleSelectTool = useCallback(
    (id: CalculatorId) => {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
      onSelectCalculator?.(id);
    },
    [onSelectCalculator]
  );

  const handleApplySuggestedQuery = useCallback(
    (query: string) => {
      onSearchChange(query);
      setIsDropdownOpen(true);
      setActiveIndex(-1);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [onSearchChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        return;
      }
      if (displayedItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % displayedItems.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (displayedItems.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? displayedItems.length - 1 : prev - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && displayedItems[activeIndex]) {
        handleSelectTool(displayedItems[activeIndex].calc.id);
      } else if (trimmedQuery) {
        setIsDropdownOpen(false);
        onSearchSubmit();
      } else if (displayedItems.length > 0) {
        handleSelectTool(displayedItems[0].calc.id);
      }
    }
  };

  const handleBrowseAll = () => {
    if (onBrowseAllTools) {
      onBrowseAllTools();
      return;
    }
    onSelectCategory?.('all');
  };

  const listboxId = 'hero-trending-listbox';

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-visible bg-gradient-to-b from-[#EFFBF5] via-[#F7F9FB] to-[#F7F9FB] dark:from-[#0E1815] dark:via-[#0B0E11] dark:to-[#0B0E11] border-b border-border-subtle transition-colors"
    >
      {/* Animated Ambient Background (Utily.ai inspired, Calctools Emerald ID) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full blur-3xl bg-emerald-300/20 dark:bg-emerald-500/10 animate-orb-1" />
        <div className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full blur-3xl bg-teal-300/20 dark:bg-teal-600/10 animate-orb-2" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl bg-emerald-200/25 dark:bg-emerald-900/15 animate-orb-3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-accent tracking-tight mb-2">
            {isEs
              ? 'CALCTOOLS · Plataforma integral de calculadoras y utilidades'
              : 'CALCTOOLS · Practical calculators & online utilities'}
          </p>

          <h1
            id="home-hero-heading"
            className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.025em] leading-[1.15] text-text-primary text-balance"
          >
            {isEs
              ? 'Todas las herramientas prácticas que necesitas, listas en un solo lugar.'
              : 'Every practical calculator and utility, ready in one workspace.'}
          </h1>

          <p className="mt-2.5 text-sm sm:text-[15px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
            {isEs
              ? 'Calcula, convierte, genera, valida y procesa archivos PDF al instante desde tu navegador — gratis y sin registro.'
              : 'Calculate, convert, generate, validate, and process PDFs directly in your browser — fast, accurate, and free.'}
          </p>

          {/* Hero Search Input with Real-Time Trending Searches / Suggested Queries Dropdown + Primary & Secondary Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <div ref={searchBoxRef} className="relative w-full sm:w-[340px] md:w-[390px] z-50">
              <div
                className={`h-10 w-full px-3.5 rounded-[10px] border bg-surface flex items-center gap-2.5 transition-colors shadow-xs ${
                  isDropdownOpen
                    ? 'border-accent ring-2 ring-accent/15'
                    : 'border-border-main hover:border-border-strong'
                }`}
              >
                <Search className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  data-no-focus-ring="true"
                  role="combobox"
                  aria-label={isEs ? 'Buscar calculadoras y utilidades' : 'Search calculators and utilities'}
                  aria-expanded={isDropdownOpen}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeIndex >= 0 ? `hero-suggestion-opt-${activeIndex}` : undefined
                  }
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onClick={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isEs
                      ? 'Buscar calculadoras, PDF, conversores...'
                      : 'Search calculators, converters, PDF...'
                  }
                  className="flex-1 min-w-0 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      setIsDropdownOpen(true);
                      inputRef.current?.focus();
                    }}
                    aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
                    className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="hidden sm:inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded border border-border-main bg-surface-secondary text-text-tertiary leading-none shrink-0"
                  >
                    /
                  </kbd>
                )}
              </div>

              {/* Real-Time Dropdown Under Hero Search Input */}
              {shouldRenderDropdown && (
                <div
                  data-state={isDropdownVisible ? 'open' : 'closed'}
                  aria-hidden={!isDropdownVisible}
                  className={`absolute left-0 right-0 top-full mt-2 z-[100] rounded-2xl border border-border-main bg-surface dark:bg-surface-elevated shadow-2xl overflow-hidden transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
                    isDropdownVisible
                      ? 'opacity-100 translate-y-0 pointer-events-auto animate-fadeIn animate-slideUp'
                      : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                  role="region"
                  aria-label={
                    trimmedQuery
                      ? isEs
                        ? 'Consultas sugeridas'
                        : 'Suggested Queries'
                      : isEs
                      ? 'Búsquedas en tendencia'
                      : 'Trending Searches'
                  }
                >
                  {/* Section Heading */}
                  <div className="px-3.5 py-2.5 border-b border-border-subtle flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                      {trimmedQuery ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{isEs ? 'Consultas Sugeridas' : 'Suggested Queries'}</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{isEs ? 'Búsquedas en Tendencia' : 'Trending Searches'}</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-text-tertiary tabular-nums">
                      {trimmedQuery
                        ? isEs
                          ? `${displayedItems.length} sugerencias`
                          : `${displayedItems.length} matches`
                        : recentFrequencyMap.size > 0
                        ? isEs
                          ? 'Por frecuencia de uso'
                          : 'Ranked by usage'
                        : isEs
                        ? 'Populares'
                        : 'Popular picks'}
                    </span>
                  </div>

                  {/* Option Listbox */}
                  <div
                    id={listboxId}
                    role="listbox"
                    className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5"
                  >
                    {displayedItems.length === 0 ? (
                      <div className="px-3 py-5 text-center space-y-2">
                        <p className="text-xs font-medium text-text-primary">
                          {isEs
                            ? `Sin coincidencias directas para "${trimmedQuery}"`
                            : `No direct matches for "${trimmedQuery}"`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onSearchChange('');
                            inputRef.current?.focus();
                          }}
                          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                        >
                          {isEs ? 'Ver búsquedas en tendencia' : 'Show trending searches'}
                        </button>
                      </div>
                    ) : (
                      displayedItems.map((item, idx) => {
                        const isActive = idx === activeIndex;
                        const usageLabel =
                          item.isRecent && item.frequency > 0
                            ? isEs
                              ? `${item.frequency} ${item.frequency === 1 ? 'uso' : 'usos'}`
                              : `${item.frequency} ${item.frequency === 1 ? 'use' : 'uses'}`
                            : isEs
                            ? 'Popular'
                            : 'Popular';

                        return (
                          <button
                            key={item.calc.id}
                            id={`hero-suggestion-opt-${idx}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => handleSelectTool(item.calc.id)}
                            className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-surface-selected text-text-primary'
                                : 'hover:bg-surface-hover text-text-primary'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-border-subtle"
                                style={{
                                  backgroundColor: `color-mix(in srgb, ${item.calc.iconColor || '#159B69'} 14%, transparent)`,
                                  color: item.calc.iconColor || '#159B69'
                                }}
                              >
                                <CalculatorIcon
                                  name={item.calc.iconName}
                                  className="w-4 h-4 stroke-[2.1] dark:brightness-125"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-semibold text-text-primary truncate flex items-center gap-1.5">
                                  <span className="truncate">{item.localized.name}</span>
                                  {!trimmedQuery && idx === 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-accent/15 text-accent border border-accent/30 shrink-0">
                                      <TrendingUp className="w-3 h-3" />
                                      <span>{isEs ? 'Tendencia' : 'Trending'}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-text-secondary truncate tabular-nums">
                                  {item.categoryTitle ? `${item.categoryTitle} · ` : ''}
                                  <span className={item.isRecent ? 'text-accent font-medium' : ''}>
                                    {usageLabel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <ArrowRight
                              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                isActive ? 'text-accent translate-x-0.5' : 'text-text-tertiary'
                              }`}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Suggested Queries Derived Dynamically From Frequent recentIds */}
                  {suggestedQueries.length > 0 && (
                    <div className="px-3 py-2.5 border-t border-border-subtle bg-surface-secondary/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                        <span className="font-medium">
                          {isEs ? 'Consultas sugeridas' : 'Suggested queries'}
                        </span>
                        {trimmedQuery && searchResults.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onSearchSubmit();
                            }}
                            className="text-accent font-semibold hover:underline cursor-pointer tabular-nums"
                          >
                            {isEs
                              ? `Ver los ${searchResults.length} resultados →`
                              : `View all ${searchResults.length} results →`}
                          </button>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1">
                            <CornerDownLeft className="w-3 h-3" />
                            <span>{isEs ? 'Abrir' : 'Open'}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {suggestedQueries.map((query) => (
                          <button
                            key={query}
                            type="button"
                            onClick={() => handleApplySuggestedQuery(query)}
                            className="px-2.5 py-1 rounded-lg border border-border-main bg-surface hover:border-accent hover:text-accent text-xs font-medium text-text-secondary transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <UiButton
                variant="primary"
                onClick={handleBrowseAll}
                className="h-10 px-3.5 sm:px-4 text-[13px] flex-1 sm:flex-none"
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>{isEs ? 'Explorar Herramientas' : 'Browse All Tools'}</span>
              </UiButton>

              <UiButton
                variant="secondary"
                onClick={() => onSelectCategory?.('all')}
                className="h-10 px-3.5 sm:px-4 text-[13px] flex-1 sm:flex-none"
              >
                <Layers className="w-4 h-4 text-accent shrink-0" />
                <span>{isEs ? 'Categorías' : 'Categories'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-text-tertiary shrink-0 hidden sm:inline" />
              </UiButton>
            </div>
          </div>
        </div>

        {/* Compact Verified Registry Facts Bar (Preserves real platform metrics cleanly) */}
        <div className="mt-6 pt-4 border-t border-border-subtle flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-text-secondary tabular-nums text-center">
          <span>
            <strong className="font-semibold text-text-primary">
              {metrics.toolsCount.toLocaleString()}+
            </strong>{' '}
            {isEs ? 'herramientas verificadas' : 'verified tools'}
          </span>
          <span aria-hidden="true" className="text-border-strong">·</span>
          <span>
            <strong className="font-semibold text-text-primary">
              {metrics.categoriesCount}
            </strong>{' '}
            {isEs ? 'categorías' : 'categories'}
          </span>
          <span aria-hidden="true" className="text-border-strong">·</span>
          <span>
            <strong className="font-semibold text-text-primary">
              {metrics.languagesCount}
            </strong>{' '}
            {isEs ? 'idiomas' : 'languages'}
          </span>
          <span aria-hidden="true" className="text-border-strong hidden sm:inline">·</span>
          <span className="text-text-tertiary">
            {isEs ? '100% en tu navegador · Sin registro' : 'Browser-local & private · No sign-up'}
          </span>
        </div>
      </div>
    </section>
  );
}
