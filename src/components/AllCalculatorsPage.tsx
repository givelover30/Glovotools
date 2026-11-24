import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  LayoutGrid,
  RotateCcw,
  Search,
  Star
} from 'lucide-react';
import {
  CALCULATORS,
  CATEGORIES,
  SUBCATEGORIES,
  getUniqueRegisteredToolCount
} from '../data/calculators.ts';
import { CalculatorId, CalculatorMeta, CategoryId } from '../types.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import {
  getLocalizedCalculator,
  getLocalizedCategory,
  getLocalizedSubcategory
} from '../i18n/esTranslations.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';
import DirectorySearchBar from './directory/DirectorySearchBar.tsx';
import DirectoryCategoryBrowser from './directory/DirectoryCategoryBrowser.tsx';
import { UiButton, UiEmptyState } from './ui/AppPrimitives.tsx';

interface AllCalculatorsPageProps {
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectCategory?: (catId: CategoryId) => void;
  onNavigateCategories?: () => void;
  searchCatalog?: (query: string) => CalculatorMeta[];
  favoriteIds: CalculatorId[];
  recentIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
}

type DiscoveryScope = 'all' | 'popular' | 'favorites' | 'recent';
type SortOption = 'relevance' | 'most-used' | 'popular' | 'name-asc' | 'name-desc' | 'category';

interface IndexedCatalogEntry {
  calc: CalculatorMeta;
  catalogIndex: number;
}

interface LocalizedIndexedEntry extends IndexedCatalogEntry {
  localized: CalculatorMeta;
  nameLower: string;
  rawNameLower: string;
  descLower: string;
  formulaLower: string;
  tagsLower: string[];
  firstChar: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ITEMS_PER_PAGE = 24;

// Pre-indexed reference preserving all 4,400 raw catalog entries without mutating or deduplicating records
const INDEXED_CATALOG: IndexedCatalogEntry[] = CALCULATORS.map((calc, catalogIndex) => ({
  calc,
  catalogIndex
}));

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

function formatAuxiliaryCategoryLabel(rawId: string): string {
  return rawId
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

export default function AllCalculatorsPage({
  onSelectCalculator,
  onSelectCategory,
  onNavigateCategories,
  searchCatalog,
  favoriteIds,
  recentIds,
  onToggleFavorite
}: AllCalculatorsPageProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [scope, setScope] = useState<DiscoveryScope>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('most-used');
  const [currentPage, setCurrentPage] = useState(1);
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  // Debounce fuzzy Fuse.js augmentation so typing stays instant
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 140);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const uniqueActiveToolCount = useMemo(() => getUniqueRegisteredToolCount(), []);
  const popularCount = useMemo(
    () => CALCULATORS.filter((c) => Boolean(c.isPopular)).length,
    []
  );

  // Lookup maps for O(1) category & subcategory metadata resolution
  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of CATEGORIES) {
      map.set(cat.id, getLocalizedCategory(cat, language).title);
    }
    return map;
  }, [language]);

  const subcategoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const sub of SUBCATEGORIES) {
      map.set(sub.id, getLocalizedSubcategory(sub, language).name);
    }
    return map;
  }, [language]);

  const usageCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('calctools_recent_usage_counts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            for (const [k, v] of Object.entries(parsed)) {
              if (typeof v === 'number' && Number.isFinite(v)) {
                map.set(k, v);
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return map;
  }, []);

  // Pre-compute localized search fields once per language (preserves all 4,400 entries)
  const localizedCatalog = useMemo<LocalizedIndexedEntry[]>(() => {
    return INDEXED_CATALOG.map((entry) => {
      const localized = getLocalizedCalculator(entry.calc, language);
      const trimmedName = localized.name.trim();
      return {
        ...entry,
        localized,
        nameLower: localized.name.toLowerCase(),
        rawNameLower: entry.calc.name.toLowerCase(),
        descLower: localized.shortDesc.toLowerCase(),
        formulaLower: entry.calc.formula ? entry.calc.formula.toLowerCase() : '',
        tagsLower: entry.calc.tags ? entry.calc.tags.map((t) => t.toLowerCase()) : [],
        firstChar: trimmedName.charAt(0).toUpperCase()
      };
    });
  }, [language]);

  // Auxiliary category slugs present in raw CALCULATORS outside the 49 main CATEGORIES
  const auxiliaryCategories = useMemo(() => {
    const mainIds = new Set<string>(CATEGORIES.map((c) => c.id));
    const counts = new Map<string, number>();
    for (const calc of CALCULATORS) {
      if (!mainIds.has(calc.category)) {
        counts.set(calc.category, (counts.get(calc.category) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, label: formatAuxiliaryCategoryLabel(id), count }));
  }, []);

  // Subcategories available for currently selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return SUBCATEGORIES.filter((s) => s.categoryId === selectedCategory)
      .map((s) => getLocalizedSubcategory(s, language))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedCategory, language]);

  // Stage 1: Instant (<2ms) exact, prefix, substring, token, tag, and formula matching
  const directMatchedEntries = useMemo<LocalizedIndexedEntry[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return localizedCatalog;

    const tokens = q.split(/\s+/).filter(Boolean);
    const matched: { entry: LocalizedIndexedEntry; score: number }[] = [];

    for (const entry of localizedCatalog) {
      if (entry.nameLower === q || entry.rawNameLower === q) {
        matched.push({ entry, score: 0 });
      } else if (entry.nameLower.startsWith(q) || entry.rawNameLower.startsWith(q)) {
        matched.push({ entry, score: 10 });
      } else if (entry.nameLower.includes(q) || entry.rawNameLower.includes(q)) {
        matched.push({ entry, score: 20 });
      } else if (entry.tagsLower.some((t) => t.includes(q))) {
        matched.push({ entry, score: 30 });
      } else if (entry.descLower.includes(q) || entry.formulaLower.includes(q)) {
        matched.push({ entry, score: 40 });
      } else if (
        tokens.length > 1 &&
        tokens.every(
          (tok) =>
            entry.nameLower.includes(tok) ||
            entry.rawNameLower.includes(tok) ||
            entry.descLower.includes(tok) ||
            entry.tagsLower.some((t) => t.includes(tok))
        )
      ) {
        matched.push({ entry, score: 45 });
      }
    }

    matched.sort((a, b) => a.score - b.score || a.entry.catalogIndex - b.entry.catalogIndex);
    return matched.map((m) => m.entry);
  }, [searchQuery, localizedCatalog]);

  // Stage 2: Existing Fuse.js engine (shared instance from App.tsx) for typo-tolerant fuzzy fallback
  const fuseFallbackTools = useMemo<CalculatorMeta[]>(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2 || directMatchedEntries.length >= 12 || !searchCatalog) {
      return [];
    }
    return searchCatalog(q).slice(0, 60);
  }, [debouncedQuery, directMatchedEntries.length, searchCatalog]);

  // Combined search results (instant direct matches + Fuse.js typo-tolerant fallback)
  const searchMatchedEntries = useMemo<LocalizedIndexedEntry[]>(() => {
    const q = searchQuery.trim();
    if (!q) return localizedCatalog;
    if (fuseFallbackTools.length === 0 || debouncedQuery.trim() !== q) {
      return directMatchedEntries;
    }

    const seenCatalogIndexes = new Set<number>(directMatchedEntries.map((e) => e.catalogIndex));
    const fuseRank = new Map<string, number>();
    fuseFallbackTools.forEach((item, idx) => {
      if (!fuseRank.has(item.id)) fuseRank.set(item.id, idx);
    });

    const fuzzyAdditions: { entry: LocalizedIndexedEntry; rank: number }[] = [];
    for (const entry of localizedCatalog) {
      if (seenCatalogIndexes.has(entry.catalogIndex)) continue;
      const r = fuseRank.get(entry.calc.id);
      if (r !== undefined) {
        fuzzyAdditions.push({ entry, rank: r });
      }
    }
    fuzzyAdditions.sort((a, b) => a.rank - b.rank || a.entry.catalogIndex - b.entry.catalogIndex);
    return [...directMatchedEntries, ...fuzzyAdditions.map((f) => f.entry)];
  }, [searchQuery, debouncedQuery, localizedCatalog, directMatchedEntries, fuseFallbackTools]);

  // Suggestions fed to DirectorySearchBar (already ranked, instant)
  const suggestionTools = useMemo<CalculatorMeta[]>(() => {
    if (!searchQuery.trim()) return [];
    return searchMatchedEntries.map((e) => e.calc);
  }, [searchQuery, searchMatchedEntries]);

  // Base list after applying search + discovery scope + category + subcategory (before A-Z letter filter)
  const baseFilteredEntries = useMemo<LocalizedIndexedEntry[]>(() => {
    let entries = searchMatchedEntries;

    // Discovery scope filter
    if (scope === 'popular') {
      entries = entries.filter(({ calc }) => Boolean(calc.isPopular));
    } else if (scope === 'favorites') {
      const favSet = new Set(favoriteIds);
      entries = entries.filter(({ calc }) => favSet.has(calc.id));
    } else if (scope === 'recent') {
      const recentOrder = new Map<string, number>();
      recentIds.forEach((id, idx) => recentOrder.set(id, idx));
      entries = entries
        .filter(({ calc }) => recentOrder.has(calc.id))
        .sort(
          (a, b) =>
            (recentOrder.get(a.calc.id) ?? 999) - (recentOrder.get(b.calc.id) ?? 999)
        );
    }

    // Category & subcategory filter
    if (selectedCategory !== 'all') {
      entries = entries.filter(({ calc }) => calc.category === selectedCategory);
      if (selectedSubcategory !== 'all') {
        entries = entries.filter(({ calc }) => calc.subcategoryId === selectedSubcategory);
      }
    }

    return entries;
  }, [
    searchMatchedEntries,
    scope,
    selectedCategory,
    selectedSubcategory,
    favoriteIds,
    recentIds
  ]);

  // Available A-Z letters derived from current filtered dataset
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const entry of baseFilteredEntries) {
      if (/[A-Z]/.test(entry.firstChar)) {
        letters.add(entry.firstChar);
      }
    }
    return letters;
  }, [baseFilteredEntries]);

  // Apply alphabetical letter filter and active sort order
  const finalEntries = useMemo(() => {
    let entries = baseFilteredEntries;
    if (selectedLetter) {
      entries = entries.filter((entry) => entry.firstChar === selectedLetter);
    }

    // Preserve search relevance order when searching unless user picked an explicit sort
    if (searchQuery.trim() && sortOption === 'relevance') {
      return entries;
    }
    if (scope === 'recent' && !searchQuery.trim() && sortOption === 'popular') {
      return entries;
    }

    const sorted = [...entries];
    sorted.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.localized.name.localeCompare(b.localized.name);
        case 'name-desc':
          return b.localized.name.localeCompare(a.localized.name);
        case 'category': {
          const catA = categoryTitleMap.get(a.calc.category) || a.calc.category;
          const catB = categoryTitleMap.get(b.calc.category) || b.calc.category;
          return catA.localeCompare(catB) || a.localized.name.localeCompare(b.localized.name);
        }
        case 'most-used': {
          const usageA = usageCountsMap.get(a.calc.id) || (a.calc.isPopular ? 10 : 0);
          const usageB = usageCountsMap.get(b.calc.id) || (b.calc.isPopular ? 10 : 0);
          return usageB - usageA || a.catalogIndex - b.catalogIndex;
        }
        case 'popular':
          return (
            (b.calc.isPopular ? 1 : 0) - (a.calc.isPopular ? 1 : 0) ||
            a.catalogIndex - b.catalogIndex
          );
        case 'relevance':
        default:
          return a.catalogIndex - b.catalogIndex;
      }
    });
    return sorted;
  }, [baseFilteredEntries, selectedLetter, sortOption, searchQuery, scope, categoryTitleMap]);

  // Keep page within valid bounds when filters narrow results
  const totalPages = Math.max(1, Math.ceil(finalEntries.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return finalEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [finalEntries, currentPage]);

  const startIndex = finalEntries.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, finalEntries.length);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    scope !== 'all' ||
    selectedCategory !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedLetter !== null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setScope('all');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedLetter(null);
    setSortOption('popular');
    setCurrentPage(1);
  };

  const handleQueryChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && sortOption === 'popular') {
      setSortOption('relevance');
    } else if (!q.trim() && sortOption === 'relevance') {
      setSortOption('popular');
    }
    setCurrentPage(1);
  };

  const handleOpenGlobalSearch = () => {
    window.dispatchEvent(new CustomEvent('calctools:open-search'));
  };

  const scopeTabs: { id: DiscoveryScope; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'all', label: isEs ? 'Todas' : 'All Tools', count: CALCULATORS.length, icon: LayoutGrid },
    { id: 'popular', label: isEs ? 'Populares' : 'Popular', count: popularCount, icon: Flame },
    { id: 'favorites', label: isEs ? 'Favoritos' : 'Favorites', count: favoriteIds.length, icon: Star },
    { id: 'recent', label: isEs ? 'Recientes' : 'Recently Used', count: recentIds.length, icon: Clock }
  ];

  const suggestedKeywords = isEs
    ? ['hipoteca', 'bmi', 'porcentaje', 'pdf', 'conversor']
    : ['mortgage', 'bmi', 'percentage', 'pdf', 'converter'];

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const favoriteAddLabel = isEs ? 'Guardar en favoritos' : 'Save to favorites';
  const favoriteRemoveLabel = isEs ? 'Quitar de favoritos' : 'Remove from favorites';

  return (
    <div className="bg-background text-text-primary pb-16 transition-colors duration-200">
      {/* 1. COMPACT DIRECTORY HEADER */}
      <section
        aria-labelledby="directory-page-heading"
        className="border-b border-border-subtle bg-[#FFFFFF] dark:bg-gradient-to-b dark:from-[#0E1815] dark:via-[#0B0E11] dark:to-[#0B0E11]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 space-y-3 text-center">
          <div className="max-w-3xl mx-auto space-y-1.5">
            <h1 id="directory-page-heading" className="ui-page-title">
              {isEs ? 'Explorar Todas las Herramientas' : 'Explore All Tools'}
            </h1>
            <p className="ui-body max-w-2xl mx-auto">
              {isEs
                ? 'Busca, filtra y abre calculadoras, conversores, generadores, validadores y utilidades PDF en un solo catálogo.'
                : 'Search, filter, and launch calculators, converters, generators, validators, and PDF utilities from one directory.'}
            </p>
          </div>

          {/* Transparent dynamically derived count metadata */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-text-secondary tabular-nums pt-1">
            <span>
              <strong className="font-semibold text-text-primary">
                {uniqueActiveToolCount.toLocaleString()}
              </strong>{' '}
              {isEs ? 'herramientas únicas activas' : 'unique active-category tools'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-border-strong">·</span>
            <span>
              <strong className="font-semibold text-text-primary">
                {CALCULATORS.length.toLocaleString()}
              </strong>{' '}
              {isEs ? 'registros totales indexados' : 'total indexed catalog entries'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-border-strong">·</span>
            <span>
              <strong className="font-semibold text-text-primary">
                {CATEGORIES.length}
              </strong>{' '}
              {isEs ? 'categorías' : 'categories'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-border-strong">·</span>
            <span>
              <strong className="font-semibold text-text-primary">
                {SUBCATEGORIES.length}
              </strong>{' '}
              {isEs ? 'subcategorías' : 'subcategories'}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. COMPACT SEARCH, DISCOVERY FILTERS & SORT BAR */}
        <section aria-label={isEs ? 'Búsqueda y filtros del directorio' : 'Directory search and filters'} className="space-y-3.5">
          {/* Primary Search + Sort + Category Row */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
            <DirectorySearchBar
              query={searchQuery}
              onQueryChange={handleQueryChange}
              language={language}
              toolSuggestions={suggestionTools}
              categories={CATEGORIES}
              categoryTitleMap={categoryTitleMap}
              onSelectCalculator={onSelectCalculator}
              onSelectCategoryRoute={onSelectCategory}
              placeholder={
                isEs
                  ? 'Buscar por nombre, palabra clave o fórmula (ej. hipoteca, bmi, pdf)...'
                  : 'Search by name, keyword, or formula (e.g., mortgage, bmi, pdf)...'
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex items-center gap-2.5 shrink-0">
              {/* Category Select (All 49 Categories + Auxiliary) */}
              <select
                aria-label={isEs ? 'Filtrar por categoría' : 'Filter by category'}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                  setCurrentPage(1);
                }}
                className="ui-select h-10 xl:w-52 text-xs font-medium"
              >
                <option value="all">
                  {isEs ? `Todas las categorías (${CATEGORIES.length})` : `All categories (${CATEGORIES.length})`}
                </option>
                <optgroup label={isEs ? 'Categorías principales (49)' : 'Core categories (49)'}>
                  {[...CATEGORIES]
                    .sort((a, b) =>
                      getLocalizedCategory(a, language).title.localeCompare(
                        getLocalizedCategory(b, language).title
                      )
                    )
                    .map((cat) => {
                      const localized = getLocalizedCategory(cat, language);
                      return (
                        <option key={cat.id} value={cat.id}>
                          {localized.title} ({cat.count})
                        </option>
                      );
                    })}
                </optgroup>
                {auxiliaryCategories.length > 0 && (
                  <optgroup label={isEs ? 'Colecciones adicionales' : 'Additional collections'}>
                    {auxiliaryCategories.map((aux) => (
                      <option key={aux.id} value={aux.id}>
                        {aux.label} ({aux.count})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Subcategory Select (Shown dynamically when category has subcategories) */}
              {selectedCategory !== 'all' && availableSubcategories.length > 0 && (
                <select
                  aria-label={isEs ? 'Filtrar por subcategoría' : 'Filter by subcategory'}
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="ui-select h-10 xl:w-48 text-xs font-medium"
                >
                  <option value="all">
                    {isEs
                      ? `Todas las subcategorías (${availableSubcategories.length})`
                      : `All subcategories (${availableSubcategories.length})`}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.count})
                    </option>
                  ))}
                </select>
              )}

              {/* Sort Select */}
              <select
                aria-label={isEs ? 'Ordenar herramientas' : 'Sort tools'}
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="ui-select h-10 xl:w-44 text-xs font-medium"
              >
                {searchQuery.trim() && (
                  <option value="relevance">
                    {isEs ? 'Más relevantes' : 'Best match'}
                  </option>
                )}
                <option value="most-used">{isEs ? 'Más usados' : 'Most Used'}</option>
                <option value="name-asc">{isEs ? 'Nombre (A–Z)' : 'Name (A–Z)'}</option>
                <option value="category">{isEs ? 'Categoría' : 'Category'}</option>
                <option value="popular">{isEs ? 'Más populares' : 'Most popular'}</option>
              </select>
            </div>
          </div>

          {/* Scope Tabs + Reset Action */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div
              role="tablist"
              aria-label={isEs ? 'Filtros de descubrimiento' : 'Discovery filters'}
              className="flex flex-wrap items-center gap-1.5"
            >
              {scopeTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = scope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setScope(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-surface-selected text-accent border border-border-selected/50'
                        : 'bg-surface text-text-secondary border border-border-main hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    <span className="text-[11px] font-normal opacity-75 tabular-nums">
                      {tab.count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-status-error hover:bg-surface-hover transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEs ? 'Restablecer filtros' : 'Reset filters'}</span>
              </button>
            )}
          </div>

          {/* Responsive A–Z Alphabetical Navigation (Grid on Mobile, Compact Row on Desktop) */}
          <nav
            aria-label={isEs ? 'Índice alfabético A–Z' : 'Alphabetical A–Z index'}
            className="grid grid-cols-6 min-[360px]:grid-cols-7 sm:grid-cols-10 gap-1.5 lg:flex lg:items-center lg:gap-1 lg:overflow-x-auto lg:pb-1 lg:scrollbar-none"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedLetter(null);
                setCurrentPage(1);
              }}
              aria-pressed={selectedLetter === null}
              className={`col-span-2 lg:col-span-1 h-9 lg:h-8 w-full lg:w-auto lg:px-2.5 rounded-md text-xs font-semibold flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                selectedLetter === null
                  ? 'bg-surface-selected text-accent border border-border-selected/50'
                  : 'bg-surface text-text-secondary border border-border-main hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {isEs ? 'Todas' : 'All'}
            </button>
            {ALPHABET.map((letter) => {
              const enabled = availableLetters.has(letter);
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!enabled}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedLetter(isSelected ? null : letter);
                    setCurrentPage(1);
                  }}
                  className={`w-full h-9 lg:w-8 lg:h-8 rounded-md text-xs font-mono font-semibold flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-surface-selected text-accent border border-border-selected/50 cursor-pointer'
                      : enabled
                      ? 'bg-surface text-text-primary border border-border-subtle hover:border-border-strong hover:bg-surface-hover cursor-pointer'
                      : 'bg-surface-secondary/50 text-text-tertiary/45 border border-transparent cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </nav>
        </section>

        {/* 3. RESULTS COUNT & TOOL GRID */}
        <section aria-labelledby="directory-results-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-subtle">
            <h2 id="directory-results-heading" className="text-xs font-semibold text-text-secondary tabular-nums">
              {finalEntries.length === 0
                ? isEs
                  ? '0 herramientas encontradas'
                  : '0 matching tools'
                : isEs
                ? `Mostrando ${startIndex.toLocaleString()}–${endIndex.toLocaleString()} de ${finalEntries.length.toLocaleString()} herramientas`
                : `Showing ${startIndex.toLocaleString()}–${endIndex.toLocaleString()} of ${finalEntries.length.toLocaleString()} tools`}
            </h2>

            {selectedCategory !== 'all' && onSelectCategory && CATEGORIES.some((c) => c.id === selectedCategory) && (
              <button
                type="button"
                onClick={() => onSelectCategory(selectedCategory as CategoryId)}
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer"
              >
                {isEs
                  ? `Abrir página de ${categoryTitleMap.get(selectedCategory) || selectedCategory} →`
                  : `Open ${categoryTitleMap.get(selectedCategory) || selectedCategory} page →`}
              </button>
            )}
          </div>

          {paginatedEntries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {paginatedEntries.map(({ calc: rawCalc, localized, catalogIndex }, index) => {
                  const categoryLabel =
                    categoryTitleMap.get(rawCalc.category) ||
                    formatAuxiliaryCategoryLabel(rawCalc.category);
                  const subcategoryLabel = subcategoryNameMap.get(rawCalc.subcategoryId);

                  return (
                    <CompactToolCard
                      key={`${rawCalc.id}::${catalogIndex}`}
                      tool={localized}
                      categoryLabel={categoryLabel}
                      subcategoryLabel={subcategoryLabel}
                      isFavorite={favoriteIds.includes(rawCalc.id)}
                      onSelect={onSelectCalculator}
                      onToggleFavorite={onToggleFavorite}
                      favoriteAddLabel={favoriteAddLabel}
                      favoriteRemoveLabel={favoriteRemoveLabel}
                      onHoverEnter={handleCardHoverEnter}
                      onHoverLeave={handleCardHoverLeave}
                      isPreviewActive={hoverPreviewState?.tool.id === rawCalc.id}
                      className="animate-slideUp"
                      style={{ animationDelay: `${Math.min(index * 25, 300)}ms` }}
                    />
                  );
                })}
              </div>

              {/* Clean Numbered Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label={isEs ? 'Paginación del directorio' : 'Directory pagination'}
                  className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle"
                >
                  <p className="text-xs text-text-tertiary tabular-nums">
                    {isEs
                      ? `Página ${currentPage} de ${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-label={isEs ? 'Página anterior' : 'Previous page'}
                      className="h-9 px-3 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-xs font-semibold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isEs ? 'Anterior' : 'Prev'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {pageNumbers.map((item, idx) =>
                        item === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1.5 text-xs text-text-tertiary select-none"
                            aria-hidden="true"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            aria-current={item === currentPage ? 'page' : undefined}
                            onClick={() => {
                              setCurrentPage(item);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`h-9 min-w-[36px] px-2.5 rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                              item === currentPage
                                ? 'bg-surface-selected text-accent border border-border-selected/60'
                                : 'bg-surface text-text-secondary border border-border-main hover:bg-surface-hover hover:text-text-primary'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      aria-label={isEs ? 'Página siguiente' : 'Next page'}
                      className="h-9 px-3 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-xs font-semibold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="hidden sm:inline">{isEs ? 'Siguiente' : 'Next'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <UiEmptyState
              icon={
                scope === 'favorites' ? (
                  <Star className="w-5 h-5 text-text-tertiary" />
                ) : scope === 'recent' ? (
                  <Clock className="w-5 h-5 text-text-tertiary" />
                ) : (
                  <Search className="w-5 h-5 text-text-tertiary" />
                )
              }
              title={
                searchQuery.trim()
                  ? isEs
                    ? `No hay herramientas para "${searchQuery.trim()}"`
                    : `No tools matched "${searchQuery.trim()}"`
                  : scope === 'favorites'
                  ? isEs
                    ? 'Aún no tienes herramientas favoritas'
                    : 'No favorite tools saved yet'
                  : scope === 'recent'
                  ? isEs
                    ? 'No hay herramientas usadas recientemente'
                    : 'No recently used tools'
                  : isEs
                  ? 'No se encontraron herramientas con estos filtros'
                  : 'No tools match your current filters'
              }
              description={
                searchQuery.trim()
                  ? isEs
                    ? 'Prueba con una búsqueda diferente o elige una sugerencia popular:'
                    : 'Try another search term, clear active filters, or pick a quick suggestion below:'
                  : scope === 'favorites'
                  ? isEs
                    ? 'Pulsa el icono de estrella en cualquier tarjeta para guardarla aquí.'
                    : 'Click the star icon on any tool card to pin it to your favorites.'
                  : isEs
                  ? 'Restablece los filtros activos para explorar todo el catálogo.'
                  : 'Reset active filters to browse the full catalog.'
              }
              action={
                <div className="space-y-3">
                  {searchQuery.trim() && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {suggestedKeywords.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleQueryChange(kw)}
                          className="px-2.5 py-1 rounded-lg border border-border-main bg-surface hover:border-accent text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  )}
                  <div>
                    <UiButton variant="secondary" size="sm" onClick={handleResetFilters}>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isEs ? 'Restablecer filtros' : 'Reset all filters'}</span>
                    </UiButton>
                  </div>
                </div>
              }
            />
          )}
        </section>

        {/* 4. COMPACT 49-CATEGORY BROWSER (Links directly to existing /calculators/:slug routes) */}
        {onSelectCategory && (
          <div className="pt-4 border-t border-border-subtle">
            <DirectoryCategoryBrowser
              categories={CATEGORIES}
              language={language}
              onSelectCategoryRoute={onSelectCategory}
              onNavigateAllCategories={onNavigateCategories}
            />
          </div>
        )}
        {hoverPreviewState && (
          <ToolHoverPreviewModal
            tool={hoverPreviewState.tool}
            categoryLabel={hoverPreviewState.categoryLabel}
            anchorRect={hoverPreviewState.anchorRect}
            isFavorite={favoriteIds.includes(hoverPreviewState.tool.id)}
            onClose={closePreview}
            onSelect={onSelectCalculator}
            onToggleFavorite={onToggleFavorite}
            onMouseEnter={handleModalMouseEnter}
            onMouseLeave={handleModalMouseLeave}
          />
        )}
      </div>
    </div>
  );
}
