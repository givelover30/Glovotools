import React, { useState, useMemo, useRef } from 'react';
import { X, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../../types.ts';
import CompactToolCard from './CompactToolCard.tsx';
import ToolHoverPreviewModal from '../home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from '../home/useToolHoverPreview.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CATEGORIES } from '../../data/calculators.ts';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';
import { getContextualToolName } from '../../data/toolClassification.ts';

interface ToolDirectoryProps {
  hubTitle: string;
  hubDescription: string;
  hubIcon: React.ElementType;
  hubColor: string;
  tools: CalculatorMeta[];
  onSelectCalculator: (id: CalculatorId) => void;
  onClear: () => void;
  favoriteIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  initialLetter?: string | null;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ToolDirectory({
  hubTitle,
  hubDescription,
  hubIcon: HubIcon,
  hubColor,
  tools,
  onSelectCalculator,
  onClear,
  favoriteIds,
  onToggleFavorite,
  initialLetter = null
}: ToolDirectoryProps) {
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(initialLetter);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const FUNCTIONAL_HUB_SLUGS = new Set([
    'calculators', 'converters', 'generators', 'planners', 'trackers', 'counters',
    'analyzers', 'checkers', 'validators', 'estimators', 'finders', 'comparators',
    'optimizers', 'simulators', 'testers', 'document-pdf', 'editors', 'formatters',
    'organizers', 'business-management', 'tools', 'document-converters'
  ]);

  // Extract available genuine subject categories from tools
  const availableCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach(tool => {
      const cat = tool.category || 'other';
      if (!FUNCTIONAL_HUB_SLUGS.has(cat.toLowerCase())) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([cat, count]) => ({ cat, count }));
  }, [tools]);

  // Filter tools by search, category, and letter (deduplicated by ID)
  const filteredTools = useMemo(() => {
    const seenIds = new Set<string>();
    return tools.filter(tool => {
      if (!tool?.id || seenIds.has(tool.id)) return false;
      const localized = getLocalizedCalculator(tool, language);
      const matchesSearch = searchQuery === '' || 
        localized.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        localized.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;

      const firstLetter = localized.name.charAt(0).toUpperCase();
      const matchesLetter = !selectedLetter || firstLetter === selectedLetter;

      if (matchesSearch && matchesCat && matchesLetter) {
        seenIds.add(tool.id);
        return true;
      }
      return false;
    });
  }, [tools, searchQuery, selectedCategory, selectedLetter, language]);

  // Available letters for A-Z sidebar (only letters that have matching tools in current category/search)
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    tools.forEach(tool => {
      const localized = getLocalizedCalculator(tool, language);
      const matchesSearch = searchQuery === '' || 
        localized.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        localized.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
      if (matchesSearch && matchesCat) {
        letters.add(localized.name.charAt(0).toUpperCase());
      }
    });
    return letters;
  }, [tools, searchQuery, selectedCategory, language]);

  // Group filtered tools by first letter
  const groupedTools = useMemo(() => {
    const groups: Record<string, CalculatorMeta[]> = {};
    filteredTools.forEach(tool => {
      const localized = getLocalizedCalculator(tool, language);
      const letter = localized.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tool);
    });
    // Sort keys alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key].sort((a, b) => {
        const la = getLocalizedCalculator(a, language).name;
        const lb = getLocalizedCalculator(b, language).name;
        return la.localeCompare(lb);
      });
      return acc;
    }, {} as Record<string, CalculatorMeta[]>);
  }, [filteredTools, language]);

  // Flatten for pagination or paginate by group
  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1;
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTools.slice(start, start + pageSize);
  }, [filteredTools, currentPage, pageSize]);

  // Group paginated tools
  const paginatedGrouped = useMemo(() => {
    const groups: Record<string, CalculatorMeta[]> = {};
    paginatedTools.forEach(tool => {
      const localized = getLocalizedCalculator(tool, language);
      const letter = localized.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tool);
    });
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, CalculatorMeta[]>);
  }, [paginatedTools, language]);

  return (
    <section key={selectedCategory} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#082017] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-md transition-all duration-300 animate-hero-fade-in-up">
      {/* 1. DIRECTORY HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-emerald-950">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: `${hubColor}15`, color: hubColor }}
          >
            <HubIcon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{hubTitle}</h2>

            </div>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
              {hubDescription}
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="px-4 py-2 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer inline-flex items-center gap-2 self-start md:self-auto"
        >
          <X className="w-4 h-4" />
          <span>{language === 'es' ? 'Cerrar Directorio' : 'Close Directory'}</span>
        </button>
      </div>

      {/* 2. SEARCH & SUBJECT CATEGORY FILTERS */}
      <div className="py-6 space-y-4 border-b border-slate-100 dark:border-emerald-950">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Subject Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            >
              {language === 'es' ? 'Todas' : 'All Tools'}
            </button>
            {availableCategories.map(({ cat, count }) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 capitalize cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Search input within hub */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'es' ? `Buscar en ${hubTitle.toLowerCase()}...` : `Search ${hubTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT: A-Z SIDEBAR + ALPHABETICAL DIRECTORY ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* A-Z Alphabetical Sidebar (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 p-3 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-emerald-900/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">A–Z Index</span>
            <div className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedLetter(null); setCurrentPage(1); }}
                className={`shrink-0 lg:w-full h-8 px-4 lg:px-0 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                  selectedLetter === null
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
                }`}
              >
                All
              </button>
              {ALPHABET.map(letter => {
                const hasTools = availableLetters.has(letter);
                const isSelected = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    disabled={!hasTools}
                    onClick={() => { setSelectedLetter(letter); setCurrentPage(1); }}
                    className={`shrink-0 w-[68px] lg:w-full h-7 flex items-center justify-center rounded-xl text-base font-bold font-mono transition-all duration-200 ${hasTools ? 'hover:scale-105 active:scale-95' : ''} cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : hasTools
                        ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
                        : 'bg-slate-100/50 dark:bg-gray-900/40 text-slate-400 dark:text-neutral-600 cursor-not-allowed border border-slate-200/50 dark:border-gray-800 opacity-60'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Directory Entries List */}
        <div key={`${selectedCategory}-${selectedLetter}-${currentPage}-${searchQuery}`} className="lg:col-span-10 space-y-6 animate-hero-fade-in-up">
          {filteredTools.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-neutral-400 text-sm">
              {language === 'es' ? 'No se encontraron herramientas que coincidan con los filtros.' : 'No tools found matching your filters.'}
            </div>
          ) : (
            Object.entries(paginatedGrouped).map(([letter, groupTools]) => (
              <div key={letter} className="space-y-3">
                {/* Letter Header */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black tracking-wider uppercase inline-block shadow-2xs">
                  {letter}
                </div>

                {/* Compact Tool Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {groupTools.map(rawTool => {
                    const tool = getLocalizedCalculator(rawTool, language);
                    const displayName = getContextualToolName(tool.name, hubTitle);
                    const rawCat = CATEGORIES.find(c => c.id === rawTool.category);
                    const localizedCat = rawCat ? getLocalizedCategory(rawCat, language).title : (tool.category ? tool.category.replace(/-/g, ' ') : hubTitle);
                    const isFav = favoriteIds.includes(tool.id as CalculatorId);
                    return (
                      <CompactToolCard
                        key={tool.id}
                        tool={tool}
                        title={displayName}
                        categoryLabel={localizedCat}
                        isFavorite={isFav}
                        onSelect={onSelectCalculator}
                        onToggleFavorite={onToggleFavorite}
                        favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                        favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                        onHoverEnter={handleCardHoverEnter}
                        onHoverLeave={handleCardHoverLeave}
                        isPreviewActive={hoverPreviewState?.tool.id === tool.id}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-emerald-950">
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                Page {currentPage} of {totalPages} ({filteredTools.length} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </section>
  );
}
