/**
 * ============================================================================
 * PERMANENTLY PROTECTED COMPONENT: ProtectedAllToolsDirectory.tsx
 * ============================================================================
 * CRITICAL PRODUCT REQUIREMENT:
 * This component is designated as a PERMANENTLY PROTECTED / LOCKED COMPONENT.
 * It must never disappear, be deleted, hidden, replaced, redesigned, or 
 * unintentionally modified during unrelated landing page or homepage updates.
 * 
 * Includes:
 * 1. Horizontal A-Z Index (All, A-Z, active highlighting, filtering)
 * 2. Left Explore Category Sidebar (20 tool hubs, icons, dynamic count badges, independent scroll)
 * 3. Right All Tools Directory (Alphabetical tool groupings, icons, badges, favorite toggles, green arrow direct navigation, pagination, independent scroll, equal outer height)
 * 4. Intelligent Directory Search with Autocomplete Dropdown & Best Match
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { 
  Search, 
  ArrowRight, 
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
import ToolIconBadge from '../common/ToolIconBadge.tsx';
import CompactToolCard from '../common/CompactToolCard.tsx';
import ToolHoverPreviewModal from '../home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from '../home/useToolHoverPreview.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';

interface ProtectedAllToolsDirectoryProps {
  onSelectCalculator: (id: CalculatorId) => void;
  favoriteIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  selectedHub: string | null;
  onSelectHub: (hub: string | null) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LETTER_COLORS: Record<string, { bg: string; text: string }> = {
  'A': { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800' },
  'B': { bg: 'bg-purple-100 dark:bg-purple-950/80', text: 'text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800' },
  'C': { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800' },
  'D': { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800' },
  'E': { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800' },
  'F': { bg: 'bg-teal-100 dark:bg-teal-950/80', text: 'text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800' },
  'G': { bg: 'bg-yellow-100 dark:bg-yellow-950/80', text: 'text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800' },
  'H': { bg: 'bg-indigo-100 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800' },
  'I': { bg: 'bg-cyan-100 dark:bg-cyan-950/80', text: 'text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800' },
  'J': { bg: 'bg-violet-100 dark:bg-violet-950/80', text: 'text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-800' },
  'K': { bg: 'bg-lime-100 dark:bg-lime-950/80', text: 'text-lime-800 dark:text-lime-200 border-lime-300 dark:border-lime-800' },
  'L': { bg: 'bg-orange-100 dark:bg-orange-950/80', text: 'text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800' },
  'M': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/80', text: 'text-fuchsia-800 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-800' },
  'N': { bg: 'bg-sky-100 dark:bg-sky-950/80', text: 'text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-800' },
  'O': { bg: 'bg-blue-200 dark:bg-blue-900/80', text: 'text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-700' },
  'P': { bg: 'bg-pink-100 dark:bg-pink-950/80', text: 'text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-800' },
  'Q': { bg: 'bg-amber-200 dark:bg-amber-900/80', text: 'text-amber-900 dark:text-amber-100 border-amber-400 dark:border-amber-700' },
  'R': { bg: 'bg-red-100 dark:bg-red-950/80', text: 'text-red-800 dark:text-red-200 border-red-300 dark:border-red-800' },
  'S': { bg: 'bg-green-100 dark:bg-green-950/80', text: 'text-green-800 dark:text-green-200 border-green-300 dark:border-green-800' },
  'T': { bg: 'bg-blue-200 dark:bg-blue-900/80', text: 'text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-700' },
  'U': { bg: 'bg-purple-200 dark:bg-purple-900/80', text: 'text-purple-900 dark:text-purple-100 border-purple-400 dark:border-purple-700' },
  'V': { bg: 'bg-teal-200 dark:bg-teal-900/80', text: 'text-teal-900 dark:text-teal-100 border-teal-400 dark:border-teal-700' },
  'W': { bg: 'bg-indigo-200 dark:bg-indigo-900/80', text: 'text-indigo-900 dark:text-indigo-100 border-indigo-400 dark:border-indigo-700' },
  'X': { bg: 'bg-orange-200 dark:bg-orange-900/80', text: 'text-orange-900 dark:text-orange-100 border-orange-400 dark:border-orange-700' },
  'Y': { bg: 'bg-yellow-200 dark:bg-yellow-900/80', text: 'text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-700' },
  'Z': { bg: 'bg-rose-200 dark:bg-rose-900/80', text: 'text-rose-900 dark:text-rose-100 border-rose-400 dark:border-rose-700' },
};

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

export default function ProtectedAllToolsDirectory({
  onSelectCalculator,
  favoriteIds,
  onToggleFavorite,
  selectedHub,
  onSelectHub
}: ProtectedAllToolsDirectoryProps) {
  const { language } = useTranslation();
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pageSize = 24;
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  // Handle click outside search autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueCalculators = useMemo(() => {
    const seen = new Set<string>();
    return CALCULATORS.filter((c) => {
      if (!c?.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, []);

  // Fuse.js search instance for intelligent autocomplete
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

  // Autocomplete search results
  const searchResults = useMemo(() => {
    if (!directorySearch.trim()) return [];
    const results = fuse.search(directorySearch.trim());
    return results.map(r => r.item);
  }, [directorySearch, fuse]);

  const bestMatch = searchResults[0] || null;
  const relatedTools = searchResults.slice(1, 5);

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

  // Filter tools by directory search, selected letter, selected category, and selectedHub
  const filteredTools = useMemo(() => {
    return uniqueCalculators.filter(rawCalc => {
      const localized = getLocalizedCalculator(rawCalc, language);
      const matchesSearch = directorySearch === '' ||
        localized.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        localized.shortDesc.toLowerCase().includes(directorySearch.toLowerCase());

      const matchesLetter = !selectedLetter || localized.name.charAt(0).toUpperCase() === selectedLetter;
      const matchesCategory = selectedCategory === 'all' || rawCalc.category === selectedCategory;
      const matchesHub = !selectedHub || getPrimaryToolHub(rawCalc) === selectedHub;

      return matchesSearch && matchesLetter && matchesCategory && matchesHub;
    });
  }, [uniqueCalculators, directorySearch, selectedLetter, selectedCategory, selectedHub, language]);

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
      <div className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-950">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {language === 'es' ? 'Todas las Herramientas' : 'All Tools'}
              </h2>

            </div>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1.5">
              {language === 'es' 
                ? 'Explore todas las calculadoras, convertidores y herramientas prácticas organizadas alfabéticamente.' 
                : 'Browse all calculators, converters and practical tools alphabetically.'}
            </p>
          </div>

          {/* Intelligent Search Input with Autocomplete Overlay */}
          <div ref={searchRef} className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar en el directorio...' : 'Search directory...'}
              value={directorySearch}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => { setDirectorySearch(e.target.value); setCurrentPage(1); setIsSearchFocused(true); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-900/60 bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
            {directorySearch && (
              <button 
                onClick={() => setDirectorySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Intelligent Autocomplete Dropdown Overlay */}
            {isSearchFocused && directorySearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-[#101722] border border-slate-200 dark:border-blue-900/60 rounded-2xl shadow-2xl p-4 space-y-4 max-h-[440px] overflow-y-auto">
                {/* Best Match */}
                {bestMatch && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {language === 'es' ? 'Mejor Coincidencia' : 'Best Match'}
                    </span>
                    <div
                      onClick={() => {
                        onSelectCalculator(bestMatch.id as CalculatorId);
                        setIsSearchFocused(false);
                      }}
                      className="p-3 rounded-xl border border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 transition cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ToolIconBadge tool={bestMatch} size="compact" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{bestMatch.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">{bestMatch.shortDesc}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    </div>
                  </div>
                )}

                {/* Related Tools */}
                {relatedTools.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {language === 'es' ? 'Herramientas Relacionadas' : 'Related Tools'}
                    </span>
                    <div className="space-y-1.5">
                      {relatedTools.map((tool) => {
                        const localized = getLocalizedCalculator(tool, language);
                        return (
                          <div
                            key={tool.id}
                            onClick={() => {
                              onSelectCalculator(tool.id as CalculatorId);
                              setIsSearchFocused(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ToolIconBadge tool={tool} size="xs" />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">{localized.name}</h5>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View All Results Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-blue-950 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {language === 'es' ? 'Resultados de búsqueda' : 'Search results'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {language === 'es' ? 'Ver todos los resultados' : 'View all results'} →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleClearFilters}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                !hasActiveFilters
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{language === 'es' ? 'Todas' : 'All Tools'}</span>

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
                    {catName}
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
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1.5 cursor-pointer"
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

      {/* 2. SECOND ROW: HORIZONTAL A-Z INDEX */}
      <div className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => { setSelectedLetter(null); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedLetter === null
                ? 'bg-blue-600 text-white shadow-xs'
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
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                  hasTools ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''
                } ${
                  isSelected
                    ? `${LETTER_COLORS[letter]?.bg || 'bg-blue-600'} ${LETTER_COLORS[letter]?.text || 'text-white'} border shadow-xs`
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
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
          boxSizing: 'border-box',
          alignItems: 'stretch'
        }}
      >
        {/* LEFT SIDEBAR: EXPLORE CATEGORY */}
        <aside className={`lg:block ${mobileSidebarOpen ? 'block' : 'hidden'} h-full min-h-0`}>
          <div className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm h-full flex flex-col min-h-0 box-sizing-border">
            <h3 className="text-sm font-black text-slate-900 dark:text-white px-2 pb-3 mb-2 border-b border-slate-100 dark:border-blue-950 uppercase tracking-wider shrink-0">
              {language === 'es' ? 'Explorar Categoría' : 'Explore Category'}
            </h3>

            <div className="space-y-1 flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
              <button
                onClick={() => { onSelectHub(null); setCurrentPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between group ${
                  selectedHub === null
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                    : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CalcIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{language === 'es' ? 'Todos los Hubs' : 'All Hubs'}</span>
                </div>

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
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
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

                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: ALPHABETICAL TOOL RESULTS CONTAINER (INDEPENDENTLY SCROLLABLE) */}
        <main className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 shadow-sm h-full flex flex-col min-h-0 box-sizing-border overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2 scrollbar-thin">
            {filteredTools.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-base font-semibold text-slate-700 dark:text-neutral-300">
                  {language === 'es' ? 'No se encontraron herramientas que coincidan con su búsqueda.' : 'No tools found matching your criteria.'}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {language === 'es' ? 'Ver todas las herramientas' : 'View all tools'}
                </button>
              </div>
            ) : (
              Object.entries(paginatedGrouped).map(([letter, groupTools]) => (
                <div key={letter} className="space-y-3">
                  {/* Letter Heading Badge */}
                  <div className="px-3.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-black tracking-wider uppercase inline-block shadow-xs">
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
