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
import ToolIconBadge from './common/ToolIconBadge.tsx';
import { UiButton } from './ui/AppPrimitives.tsx';
import MatrixHeroBackground from './home/MatrixHeroBackground.tsx';

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
  const { language, t } = useTranslation();
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

    const deduped = new Map<string, RankedTrendingItem & { rankScore: number }>();
    const seenNames = new Set<string>();
    candidates.forEach((calc, idx) => {
      if (deduped.has(calc.id)) return;
      const localized = getLocalizedCalculator(calc, language);
      const nameKey = localized.name.toLowerCase().trim();
      if (seenNames.has(nameKey)) return;
      seenNames.add(nameKey);

      const recentMeta = recentFrequencyMap.get(calc.id);
      const freq = recentMeta?.frequency ?? 0;
      const exactBonus = localized.name.toLowerCase().startsWith(qLower) ? 100 : 0;
      const containsBonus = localized.name.toLowerCase().includes(qLower) ? 40 : 0;
      const frequencyBoost = freq * 15;
      const basePositionScore = Math.max(0, 30 - idx);

      deduped.set(calc.id, {
        calc,
        localized,
        categoryTitle: categoryTitleMap.get(calc.category),
        frequency: freq,
        isRecent: Boolean(recentMeta),
        rankScore: exactBonus + containsBonus + frequencyBoost + basePositionScore
      });
    });

    return Array.from(deduped.values())
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
    if (!isDropdownOpen || activeIndex < 0) return;
    const activeEl = document.getElementById(`hero-suggestion-opt-${activeIndex}`);
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isDropdownOpen]);

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
    const handleOutsideInteraction = (e: Event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('focusin', handleOutsideInteraction);
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('focusin', handleOutsideInteraction);
    };
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
      className="relative z-30 overflow-visible bg-[#DBEAFE] dark:bg-gradient-to-br dark:from-[#101B35] dark:via-[#172B50] dark:to-[#101B35] border-b border-slate-200 dark:border-white/10 transition-colors"
    >
      {/* Colorful Matrix-inspired falling digital rain background */}
      <MatrixHeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            id="home-hero-heading"
            className="text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-[-0.025em] leading-[1.15] text-slate-900 dark:text-white text-balance"
          >
            {t('hero.title')}
          </h1>

          <p className="mt-2.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* Hero Search Input with Real-Time Trending Searches / Suggested Queries Dropdown + Primary & Secondary Actions */}
          <div className="mt-5 flex flex-col items-center justify-center">
            <div ref={searchBoxRef} className="relative w-full sm:w-[340px] md:w-[390px] z-50">
              <div
                className={`h-10 w-full px-3.5 rounded-[10px] border bg-white dark:bg-white/10 dark:backdrop-blur-md flex items-center gap-2.5 transition-colors shadow-sm ${
                  isDropdownOpen
                    ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/35'
                    : 'border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/35'
                }`}
              >
                <Search className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
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
                  placeholder={t('hero.searchPlaceholder')}
                  className="flex-1 min-w-0 bg-transparent text-[13px] text-[#101B35] dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none"
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
                    className="p-1 rounded-md text-slate-400 hover:text-[#101B35] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="hidden sm:inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 leading-none shrink-0"
                  >
                    /
                  </kbd>
                )}
              </div>

              {/* Real-Time Floating Dropdown Anchored Directly Under Hero Search Input */}
              {shouldRenderDropdown && (
                <div
                  data-state={isDropdownVisible ? 'open' : 'closed'}
                  aria-hidden={!isDropdownVisible}
                  className={`absolute left-0 top-[calc(100%+8px)] w-full z-[100] max-h-[320px] flex flex-col overflow-hidden rounded-[14px] border border-[#DCE5EF] dark:border-[#34465B] bg-[#FFFFFF] dark:bg-[#192432] text-[#172B50] dark:text-[#F1F5F9] shadow-[0_16px_40px_rgba(16,27,53,0.14),0_4px_12px_rgba(16,27,53,0.06)] dark:shadow-[0_20px_48px_rgba(4,9,20,0.65),0_4px_14px_rgba(4,9,20,0.4)] transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
                    isDropdownVisible
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-1 pointer-events-none'
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
                  <div className="shrink-0 px-3.5 py-2 border-b border-[#DCE5EF] dark:border-[#34465B] flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#172B50] dark:text-[#F1F5F9]">
                      {trimmedQuery ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span>{t('hero.suggested')}</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span>{t('hero.trending')}</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-500 dark:text-[#91A2B7] tabular-nums">
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

                  {/* Scrollable Option Listbox */}
                  <div
                    id={listboxId}
                    role="listbox"
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1.5 space-y-0.5"
                  >
                    {displayedItems.length === 0 ? (
                      <div className="px-3 py-5 text-center space-y-2">
                        <p className="text-xs font-medium text-[#172B50] dark:text-[#F1F5F9]">
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
                          className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
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
                            className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-[10px] text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-[#DBEAFE] dark:bg-[#202E3E] text-[#172B50] dark:text-[#F1F5F9] ring-1 ring-inset ring-[#2563EB]/40'
                                : 'hover:bg-[#DBEAFE] dark:hover:bg-[#202E3E] text-[#172B50] dark:text-[#F1F5F9]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ToolIconBadge
                                tool={item.calc}
                                size="sm"
                                className={
                                  isActive
                                    ? 'border-[#2563EB]/45'
                                    : ''
                                }
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-semibold text-[#172B50] dark:text-[#F1F5F9] truncate flex items-center gap-1.5">
                                  <span className="truncate">{item.localized.name}</span>
                                  {!trimmedQuery && idx === 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30 shrink-0">
                                      <TrendingUp className="w-3 h-3" />
                                      <span>{isEs ? 'Tendencia' : 'Trending'}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-[#A8B6C8] truncate tabular-nums">
                                  {item.categoryTitle ? `${item.categoryTitle} · ` : ''}
                                  <span className={item.isRecent ? 'text-[#2563EB] font-medium' : ''}>
                                    {usageLabel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <ArrowRight
                              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                isActive
                                  ? 'text-[#2563EB] translate-x-0.5'
                                  : 'text-slate-400 dark:text-[#91A2B7]'
                              }`}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Suggested Queries Derived Dynamically From Frequent recentIds */}
                  {suggestedQueries.length > 0 && (
                    <div className="shrink-0 px-3 py-2 border-t border-[#DCE5EF] dark:border-[#34465B] bg-slate-50/90 dark:bg-[#111923]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#91A2B7]">
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
                            className="text-[#2563EB] font-semibold hover:underline cursor-pointer tabular-nums"
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
                            className="px-2.5 py-1 rounded-lg border border-[#DCE5EF] dark:border-[#34465B] bg-[#FFFFFF] dark:bg-[#192432] hover:border-[#2563EB] hover:bg-[#DBEAFE] dark:hover:bg-[#202E3E] hover:text-[#2563EB] dark:hover:text-[#2563EB] text-xs font-medium text-[#172B50]/85 dark:text-[#C0CDDC] transition-colors cursor-pointer whitespace-nowrap max-w-full truncate shrink-0"
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

            {/* CTA Buttons Row Directly Below Search Bar */}
            <div className="mt-3.5 flex items-center justify-center gap-2.5 w-full sm:w-auto">
              <UiButton
                variant="primary"
                onClick={handleBrowseAll}
                className="h-10 px-3.5 sm:px-4 text-[13px] flex-1 sm:flex-none bg-[#2563EB] hover:bg-[#3B82F6] text-white border-transparent shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.45)] transition-all duration-250 ease-out hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98] group cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
              >
                <LayoutGrid className="w-4 h-4 shrink-0 transition-transform duration-250 ease-out group-hover:scale-110 group-hover:rotate-6" />
                <span>{t('hero.browseAll')}</span>
              </UiButton>

              <UiButton
                variant="secondary"
                onClick={() => onSelectCategory?.('all')}
                className="h-10 px-3.5 sm:px-4 text-[13px] flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-cyan-400 dark:bg-transparent dark:hover:bg-white/10 dark:text-white dark:border-white/25 dark:hover:border-cyan-400 shadow-sm hover:shadow-[0_12px_28px_rgba(6,182,212,0.25)] transition-all duration-250 ease-out hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98] group cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
              >
                <Layers className="w-4 h-4 text-[#0891B2] dark:text-[#22D3EE] shrink-0 transition-transform duration-250 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" />
                <span>{t('nav.categories')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 shrink-0 hidden sm:inline transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
              </UiButton>
            </div>
          </div>
        </div>

        {/* Compact Verified Registry Facts Bar (Preserves real platform metrics cleanly) */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300 tabular-nums text-center">
          <span>{t('statbar.toolCount')}</span>
          <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">·</span>
          <span>{t('statbar.catCount')}</span>
          <span aria-hidden="true" className="text-slate-400 dark:text-slate-500">·</span>
          <span>{t('statbar.langCount')}</span>
          <span aria-hidden="true" className="text-slate-400 dark:text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-600 dark:text-slate-300">
            {t('statbar.privacyBadge')}
          </span>
        </div>
      </div>
    </section>
  );
}
