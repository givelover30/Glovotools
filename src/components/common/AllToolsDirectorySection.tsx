import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  RotateCcw,
  Calculator as CalcIcon,
  ArrowRightLeft,
  Sparkles,
  Calendar,
  Activity,
  Hash,
  BarChart3,
  CheckCircle,
  ShieldCheck,
  Scale,
  Rocket,
  Cpu,
  FlaskConical,
  FileText,
  Wrench,
  ListFilter,
  Layers,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../../types.ts';
import { CALCULATORS, CATEGORIES } from '../../data/calculators.ts';
import { TOOL_HUBS, getPrimaryToolHub, getContextualToolName } from '../../data/toolClassification.ts';
import CompactToolCard from './CompactToolCard.tsx';
import ToolHoverPreviewModal from '../home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from '../home/useToolHoverPreview.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';
import StatBar from '../StatBar.tsx';

interface AllToolsDirectoryProps {
  onSelectCalculator: (id: CalculatorId) => void;
  favoriteIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  selectedHub: string | null;
  onSelectHub: (hub: string | null) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const HUB_ICONS: Record<string, { icon: any; color: string }> = {
  'Calculators': { icon: CalcIcon, color: '#10B981' },
  'Converters': { icon: ArrowRightLeft, color: '#F59E0B' },
  'Generators': { icon: Sparkles, color: '#A855F7' },
  'Planners': { icon: Calendar, color: '#06B6D4' },
  'Trackers': { icon: Activity, color: '#EC4899' },
  'Counters': { icon: Hash, color: '#3B82F6' },
  'Analyzers': { icon: BarChart3, color: '#6366F1' },
  'Checkers': { icon: CheckCircle, color: '#10B981' },
  'Validators': { icon: ShieldCheck, color: '#059669' },
  'Estimators': { icon: CalcIcon, color: '#D97706' },
  'Finders': { icon: Search, color: '#2563EB' },
  'Comparators': { icon: Scale, color: '#7C3AED' },
  'Optimizers': { icon: Rocket, color: '#EA580C' },
  'Simulators': { icon: Cpu, color: '#0284C7' },
  'Testers': { icon: FlaskConical, color: '#4F46E5' },
  'Document & PDF': { icon: FileText, color: '#E11D48' },
  'Editors': { icon: Wrench, color: '#3B82F6' },
  'Formatters': { icon: ListFilter, color: '#059669' },
  'Organizers': { icon: Layers, color: '#9333EA' },
  'Business & Management': { icon: Briefcase, color: '#2563EB' },
};

export default function AllToolsDirectorySection({
  onSelectCalculator,
  favoriteIds,
  onToggleFavorite,
  selectedHub,
  onSelectHub
}: AllToolsDirectoryProps) {
  const { language } = useTranslation();
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pageSize = 24;
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  // Calculate tool counts for each hub
  const hubCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CALCULATORS.forEach(calc => {
      const hub = getPrimaryToolHub(calc);
      counts[hub] = (counts[hub] || 0) + 1;
    });
    return counts;
  }, []);

  // Available categories for filtering
  const availableCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    CALCULATORS.forEach(calc => {
      const cat = calc.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({ cat, count }));
  }, []);

  // Filter tools by directory search, selected letter, selected category, and selectedHub (deduplicated by ID)
  const filteredTools = useMemo(() => {
    const seenIds = new Set<string>();
    return CALCULATORS.filter(rawCalc => {
      if (!rawCalc?.id || seenIds.has(rawCalc.id)) return false;
      const localized = getLocalizedCalculator(rawCalc, language);
      const matchesSearch = directorySearch === '' ||
        localized.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        localized.shortDesc.toLowerCase().includes(directorySearch.toLowerCase());

      const matchesLetter = !selectedLetter || localized.name.charAt(0).toUpperCase() === selectedLetter;
      const matchesCategory = selectedCategory === 'all' || rawCalc.category === selectedCategory;
      const matchesHub = !selectedHub || getPrimaryToolHub(rawCalc) === selectedHub;

      if (matchesSearch && matchesLetter && matchesCategory && matchesHub) {
        seenIds.add(rawCalc.id);
        return true;
      }
      return false;
    });
  }, [directorySearch, selectedLetter, selectedCategory, selectedHub, language]);

  // Available letters for A-Z bar based on current filters
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    CALCULATORS.forEach(rawCalc => {
      const localized = getLocalizedCalculator(rawCalc, language);
      const matchesSearch = directorySearch === '' ||
        localized.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        localized.shortDesc.toLowerCase().includes(directorySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || rawCalc.category === selectedCategory;
      const matchesHub = !selectedHub || getPrimaryToolHub(rawCalc) === selectedHub;
      if (matchesSearch && matchesCategory && matchesHub) {
        letters.add(localized.name.charAt(0).toUpperCase());
      }
    });
    return letters;
  }, [directorySearch, selectedCategory, selectedHub, language]);

  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1;
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTools.slice(start, start + pageSize);
  }, [filteredTools, currentPage, pageSize]);

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
      acc[key] = groups[key].sort((a, b) => {
        const la = getLocalizedCalculator(a, language).name;
        const lb = getLocalizedCalculator(b, language).name;
        return la.localeCompare(lb);
      });
      return acc;
    }, {} as Record<string, CalculatorMeta[]>);
  }, [paginatedTools, language]);

  const handleClearFilters = () => {
    setDirectorySearch('');
    setSelectedLetter(null);
    setSelectedCategory('all');
    onSelectHub(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = directorySearch !== '' || selectedLetter !== null || selectedCategory !== 'all' || selectedHub !== null;

  return (
    <section id="all-tools-directory" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* 1. TOP DIRECTORY HEADER */}
      <div className="bg-white dark:bg-[#082017] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-emerald-950">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {language === 'es' ? 'Todas las Herramientas' : 'All Tools'}
              </h2>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {CALCULATORS.length} {language === 'es' ? 'registradas' : 'registered'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1.5">
              {language === 'es' 
                ? 'Explore todas las calculadoras, convertidores y herramientas prácticas organizadas alfabéticamente.' 
                : 'Browse all calculators, converters and practical tools alphabetically.'}
            </p>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleClearFilters}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                !hasActiveFilters
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{language === 'es' ? 'Todas' : 'All Tools'}</span>
              <span className="text-[10px] opacity-80">({filteredTools.length})</span>
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{language === 'es' ? 'Todas las Categorías' : 'All Categories'}</option>
              {availableCategories.map(({ cat, count }) => {
                const catMeta = CATEGORIES.find(c => c.id === cat);
                const catName = catMeta ? getLocalizedCategory(catMeta, language).title : cat;
                return (
                  <option key={cat} value={cat}>
                    {catName} ({count})
                  </option>
                );
              })}
            </select>

            {selectedHub && (
              <button
                onClick={() => onSelectHub(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Hub: {selectedHub}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {selectedLetter && (
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Letter: {selectedLetter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Restablecer filtros' : 'Reset filters'}</span>
            </button>
          )}
        </div>
      </div>

      {/* STAT BAR */}
      <StatBar />

      {/* 2. SECOND ROW: HORIZONTAL A-Z INDEX */}
      <div className="bg-white dark:bg-[#082017] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-1.5 w-full">
          <button
            onClick={() => { setSelectedLetter(null); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition shrink-0 cursor-pointer ${
              selectedLetter === null
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-gray-700'
            }`}
          >
            ALL
          </button>
          {ALPHABET.map(letter => {
            const hasTools = availableLetters.has(letter);
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                disabled={!hasTools}
                onClick={() => { setSelectedLetter(letter); setCurrentPage(1); }}
                className={`flex-1 h-9 flex items-center justify-center rounded-xl text-sm font-mono font-bold transition ${
                  hasTools ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : hasTools
                    ? 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
                    : 'bg-slate-50 dark:bg-gray-900/40 text-slate-300 dark:text-neutral-600 cursor-not-allowed opacity-40'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(prev => !prev)}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{mobileSidebarOpen ? (language === 'es' ? 'Ocultar Explorar Categoría' : 'Hide Explore Category') : (language === 'es' ? 'Mostrar Explorar Categoría' : 'Show Explore Category')}</span>
          {mobileSidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. MAIN CONTENT: SHARED TWO-COLUMN FIXED-HEIGHT VIEWPORT */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] gap-4 items-stretch"
        style={{ 
          height: 'calc(100vh - 220px)', 
          minHeight: '500px', 
          maxHeight: '850px',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT SIDEBAR: EXPLORE CATEGORY */}
        <aside className={`lg:block ${mobileSidebarOpen ? 'block' : 'hidden'} h-full min-h-0`}>
          <div className="bg-white dark:bg-[#082017] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-sm h-full flex flex-col min-h-0 box-sizing-border">
            <h3 className="text-sm font-black text-slate-900 dark:text-white px-2 pb-3 mb-2 border-b border-slate-100 dark:border-emerald-950 uppercase tracking-wider shrink-0">
              {language === 'es' ? 'Explorar Categoría' : 'Explore Category'}
            </h3>

            <div className="space-y-1 flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
              <button
                onClick={() => { onSelectHub(null); setCurrentPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between group ${
                  selectedHub === null
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CalcIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{language === 'es' ? 'Todos los Hubs' : 'All Hubs'}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-400 shrink-0">
                  {CALCULATORS.length}
                </span>
              </button>

              {TOOL_HUBS.map(hubTitle => {
                const count = hubCounts[hubTitle] || 0;
                const isSelected = selectedHub === hubTitle;
                const hubInfo = HUB_ICONS[hubTitle] || { icon: CalcIcon, color: '#10B981' };
                const Icon = hubInfo.icon;

                return (
                  <button
                    key={hubTitle}
                    onClick={() => { onSelectHub(isSelected ? null : hubTitle); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${hubInfo.color}15`, color: hubInfo.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{hubTitle}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-400 shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: ALPHABETICAL TOOL RESULTS CONTAINER (INDEPENDENTLY SCROLLABLE) */}
        <main className="bg-white dark:bg-[#082017] border border-slate-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-sm h-full flex flex-col min-h-0 box-sizing-border overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2 scrollbar-thin">
            {filteredTools.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-base font-semibold text-slate-700 dark:text-neutral-300">
                  {language === 'es' ? 'No se encontraron herramientas que coincidan con su búsqueda.' : 'No tools found matching your criteria.'}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {language === 'es' ? 'Ver todas las herramientas' : 'View all tools'}
                </button>
              </div>
            ) : (
              Object.entries(paginatedGrouped).map(([letter, groupTools]) => (
                <div key={letter} className="space-y-3">
                  {/* Letter Heading Badge */}
                  <div className="px-3.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black tracking-wider uppercase inline-block shadow-xs">
                    {letter}
                  </div>

                  {/* Compact two-column card grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {groupTools.map(rawTool => {
                      const tool = getLocalizedCalculator(rawTool, language);
                      const hubTitle = getPrimaryToolHub(rawTool);
                      const displayName = getContextualToolName(tool.name, hubTitle);
                      const rawCat = CATEGORIES.find(c => c.id === rawTool.category);
                      const cat = rawCat ? getLocalizedCategory(rawCat, language) : null;
                      const isFav = favoriteIds.includes(rawTool.id as CalculatorId);

                      return (
                        <CompactToolCard
                          key={tool.id}
                          tool={tool}
                          title={displayName}
                          categoryLabel={cat?.title}
                          isFavorite={isFav}
                          onSelect={onSelectCalculator}
                          onToggleFavorite={onToggleFavorite}
                          favoriteAddLabel={language === 'es' ? 'Añadir a favoritos' : 'Add favorite'}
                          favoriteRemoveLabel={language === 'es' ? 'Quitar de favoritos' : 'Remove favorite'}
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
              <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    currentPage === 1
                      ? 'bg-slate-100 dark:bg-gray-900 text-slate-400 cursor-not-allowed border-slate-200 dark:border-gray-800'
                      : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-white hover:bg-slate-50 border-slate-200 dark:border-gray-700 cursor-pointer'
                  }`}
                >
                  {language === 'es' ? 'Anterior' : 'Previous'}
                </button>
                <span className="text-xs font-semibold text-slate-600 dark:text-neutral-400 px-2">
                  {language === 'es' ? `Página ${currentPage} de ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    currentPage === totalPages
                      ? 'bg-slate-100 dark:bg-gray-900 text-slate-400 cursor-not-allowed border-slate-200 dark:border-gray-800'
                      : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-white hover:bg-slate-50 border-slate-200 dark:border-gray-700 cursor-pointer'
                  }`}
                >
                  {language === 'es' ? 'Siguiente' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </main>
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
