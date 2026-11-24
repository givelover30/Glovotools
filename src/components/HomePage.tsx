import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Star,
  Clock,
  X,
  Layers,
  ShieldCheck,
  Calculator as CalcIcon,
  ArrowRightLeft,
  Wrench,
  Sparkles,
  Calendar,
  CheckCircle,
  Activity,
  Trash2,
  Cpu,
  Briefcase,
  Hash,
  BarChart3,
  Scale,
  Rocket,
  FlaskConical,
  FileText,
  ListFilter
} from 'lucide-react';
import { CalculatorMeta, CalculatorId, CategoryId, CategoryMeta } from '../types.ts';
import { CALCULATORS, CATEGORIES } from '../data/calculators.ts';
import { getPrimaryToolHub, getContextualToolName } from '../data/toolClassification.ts';
import ToolIconBadge from './common/ToolIconBadge.tsx';
import ToolDirectory from './common/ToolDirectory.tsx';
import CalculatorView from './CalculatorView.tsx';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../i18n/esTranslations.ts';
import Hero from './Hero.tsx';
import CompactToolCard from './common/CompactToolCard.tsx';
import HomeCategoryCard from './home/HomeCategoryCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';
import { UiButton, UiEmptyState } from './ui/AppPrimitives.tsx';

interface HomePageProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  searchResults?: CalculatorMeta[];
  onSelectCalculator: (id: CalculatorId) => void;
  onTrackCalculatorUsage?: (id: CalculatorId) => void;
  onSelectCategory: (catId: CategoryId | 'all', subId?: string) => void;
  onBrowseAllTools?: () => void;
  onNavigateFavorites?: () => void;
  favoriteIds: CalculatorId[];
  onToggleFavorite: (id: CalculatorId) => void;
  recentIds?: CalculatorId[];
  recentUsageCounts?: Record<string, number>;
  recentCalculators: CalculatorMeta[];
  onClearRecent: () => void;
  favoriteCalculators: CalculatorMeta[];
  initialInlineToolId?: CalculatorId | null;
  initialSelectedHub?: string | null;
}

type PopularDomainFilter = 'all' | 'financial' | 'math' | 'health' | 'converters' | 'utilities';

type UtilitySuiteCategoryId =
  | 'pdf-tools'
  | 'converter'
  | 'generators'
  | 'checkers'
  | 'document-converters';

const POPULAR_DIVERSE_CATEGORY_ORDER: CategoryId[] = [
  'financial',
  'health-fitness',
  'converter',
  'pdf-tools',
  'geometry',
  'datetime',
  'generators',
  'checkers',
  'basic-math',
  'business',
  'construction',
  'everyday'
];

const UTILITY_SUITE_IDS: UtilitySuiteCategoryId[] = [
  'pdf-tools',
  'converter',
  'generators',
  'checkers',
  'document-converters'
];

function dedupeById(items: CalculatorMeta[]): CalculatorMeta[] {
  const seen = new Set<string>();
  const out: CalculatorMeta[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export default function HomePage({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchResults = [],
  onSelectCalculator,
  onTrackCalculatorUsage,
  onSelectCategory,
  onBrowseAllTools,
  onNavigateFavorites,
  favoriteIds,
  onToggleFavorite,
  recentIds = [],
  recentUsageCounts = {},
  recentCalculators,
  onClearRecent,
  favoriteCalculators,
  initialInlineToolId,
  initialSelectedHub
}: HomePageProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [selectedHub, setSelectedHub] = useState<string | null>(initialSelectedHub || null);
  const [inlineSelectedToolId, setInlineSelectedToolId] = useState<CalculatorId | null>(
    initialInlineToolId || null
  );
  const [popularFilter, setPopularFilter] = useState<PopularDomainFilter>('all');
  const [activeUtilitySuite, setActiveUtilitySuite] = useState<UtilitySuiteCategoryId>('pdf-tools');
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSelectedHub) setSelectedHub(initialSelectedHub);
  }, [initialSelectedHub]);

  useEffect(() => {
    if (initialInlineToolId) {
      setInlineSelectedToolId(initialInlineToolId);
      setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [initialInlineToolId]);

  const handleSelectCalculatorInline = (id: CalculatorId) => {
    setInlineSelectedToolId(id);
    onTrackCalculatorUsage?.(id);
    window.history.pushState({}, '', `/calculator/${id}`);
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleCloseInlineWorkspace = () => {
    setInlineSelectedToolId(null);
    window.history.pushState({}, '', '/');
  };

  const rawPillars = useMemo(
    () => [
      { title: 'Calculators', desc: 'Math, finance, science and more.', icon: CalcIcon, color: '#10B981' },
      { title: 'Converters', desc: 'Units, measurements and currencies.', icon: ArrowRightLeft, color: '#F59E0B' },
      { title: 'Generators', desc: 'Generate passwords, QR codes and content.', icon: Sparkles, color: '#A855F7' },
      { title: 'Planners', desc: 'Plan budgets, meals, travel and schedules.', icon: Calendar, color: '#06B6D4' },
      { title: 'Trackers', desc: 'Track habits, expenses and goals.', icon: Activity, color: '#EC4899' },
      { title: 'Counters', desc: 'Count items, clicks, days and more.', icon: Hash, color: '#3B82F6' },
      { title: 'Analyzers', desc: 'Analyze data, performance and trends.', icon: BarChart3, color: '#6366F1' },
      { title: 'Checkers', desc: 'Check text, URLs, email and more.', icon: CheckCircle, color: '#10B981' },
      { title: 'Validators', desc: 'Validate data, formats and inputs.', icon: ShieldCheck, color: '#059669' },
      { title: 'Estimators', desc: 'Estimate costs, materials and time.', icon: CalcIcon, color: '#D97706' },
      { title: 'Finders', desc: 'Find information, codes and resources.', icon: Search, color: '#2563EB' },
      { title: 'Comparators', desc: 'Compare items, prices and features.', icon: Scale, color: '#7C3AED' },
      { title: 'Optimizers', desc: 'Improve results, efficiency and performance.', icon: Rocket, color: '#EA580C' },
      { title: 'Simulators', desc: 'Simulate scenarios and outcomes.', icon: Cpu, color: '#0284C7' },
      { title: 'Testers', desc: 'Test systems, inputs and configurations.', icon: FlaskConical, color: '#4F46E5' },
      { title: 'Document & PDF', desc: 'Create, convert, merge and edit PDFs.', icon: FileText, color: '#E11D48' },
      { title: 'Editors', desc: 'Edit text, images, code and more.', icon: Wrench, color: '#3B82F6' },
      { title: 'Formatters', desc: 'Format text, data, code and files.', icon: ListFilter, color: '#059669' },
      { title: 'Organizers', desc: 'Organize tasks, files, lists and data.', icon: Layers, color: '#9333EA' },
      { title: 'Business & Management', desc: 'Business tools, operations and planning.', icon: Briefcase, color: '#2563EB' }
    ],
    []
  );

  const activePillar = rawPillars.find((p) => p.title === selectedHub);
  const hubResults = useMemo(() => {
    if (!selectedHub) return [];
    return dedupeById(CALCULATORS.filter((calc) => getPrimaryToolHub(calc) === selectedHub));
  }, [selectedHub]);

  // Lookup map for localized category titles derived from verified CATEGORIES registry
  const categoryTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const rawCat of CATEGORIES) {
      map.set(rawCat.id, getLocalizedCategory(rawCat, language).title);
    }
    return map;
  }, [language]);

  // Verified popular tools directly from CALCULATORS (isPopular === true), deduplicated
  const allPopularTools = useMemo(() => {
    return dedupeById(CALCULATORS.filter((c) => Boolean(c.isPopular)));
  }, []);

  const displayedPopularTools = useMemo(() => {
    if (popularFilter === 'all') {
      const picked: CalculatorMeta[] = [];
      const pickedIds = new Set<string>();
      for (const catId of POPULAR_DIVERSE_CATEGORY_ORDER) {
        const match = allPopularTools.find((t) => t.category === catId && !pickedIds.has(t.id));
        if (match) {
          picked.push(match);
          pickedIds.add(match.id);
        }
        if (picked.length >= 12) break;
      }
      if (picked.length < 12) {
        for (const item of allPopularTools) {
          if (!pickedIds.has(item.id)) {
            picked.push(item);
            pickedIds.add(item.id);
          }
          if (picked.length >= 12) break;
        }
      }
      return picked;
    }

    const domainCategories: Record<Exclude<PopularDomainFilter, 'all'>, CategoryId[]> = {
      financial: ['financial', 'business', 'tax-accounting', 'real-estate', 'banking-savings'],
      math: ['basic-math', 'algebra', 'geometry', 'trigonometry', 'statistics', 'scientific'],
      health: ['health-fitness', 'datetime', 'everyday'],
      converters: ['converter', 'document-converters'],
      utilities: ['pdf-tools', 'generators', 'checkers', 'additional-tools']
    };

    const allowed = new Set<CategoryId>(domainCategories[popularFilter]);
    return allPopularTools.filter((t) => allowed.has(t.category)).slice(0, 8);
  }, [allPopularTools, popularFilter]);

  // Verified active categories sorted by real dynamically computed tool count
  const activeCategories = useMemo(() => {
    return CATEGORIES.filter((c) => c.isActive && c.count > 0);
  }, []);

  const featuredCategories = useMemo<CategoryMeta[]>(() => {
    return [...activeCategories]
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [activeCategories]);

  // Real utility suites derived strictly from verified CATEGORIES + CALCULATORS
  const utilitySuites = useMemo(() => {
    return UTILITY_SUITE_IDS.map((id) => CATEGORIES.find((c) => c.id === id)).filter(
      (c): c is CategoryMeta => Boolean(c && c.count > 0)
    );
  }, []);

  const activeUtilityCategory = useMemo(() => {
    return (
      utilitySuites.find((c) => c.id === activeUtilitySuite) ||
      utilitySuites[0] ||
      null
    );
  }, [utilitySuites, activeUtilitySuite]);

  const activeUtilityTools = useMemo(() => {
    if (!activeUtilityCategory) return [];
    const inCategory = dedupeById(
      CALCULATORS.filter((c) => c.category === activeUtilityCategory.id)
    );
    const popularFirst = [
      ...inCategory.filter((t) => t.isPopular),
      ...inCategory.filter((t) => !t.isPopular)
    ];
    return popularFirst.slice(0, 8);
  }, [activeUtilityCategory]);

  const popularFilterTabs: { id: PopularDomainFilter; label: string }[] = [
    { id: 'all', label: isEs ? 'Todas' : 'All' },
    { id: 'financial', label: isEs ? 'Finanzas' : 'Finance' },
    { id: 'math', label: isEs ? 'Matemáticas' : 'Math & Science' },
    { id: 'health', label: isEs ? 'Salud y Vida' : 'Health & Life' },
    { id: 'converters', label: isEs ? 'Conversores' : 'Converters' },
    { id: 'utilities', label: isEs ? 'PDF y Utilidades' : 'PDF & Utilities' }
  ];

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('calctools:open-search'));
  };

  const handleBrowseAll = () => {
    if (onBrowseAllTools) {
      onBrowseAllTools();
      return;
    }
    onSelectCategory('all');
  };

  const favoriteAddLabel = isEs ? 'Guardar en favoritos' : 'Save to favorites';
  const favoriteRemoveLabel = isEs ? 'Quitar de favoritos' : 'Remove from favorites';

  return (
    <div className="pb-16 bg-background text-text-primary transition-colors duration-200">
      {/* 1. COMPACT UTILITY HERO */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        searchResults={searchResults}
        recentIds={recentIds}
        recentUsageCounts={recentUsageCounts}
        onSelectCalculator={onSelectCalculator}
        onSelectCategory={onSelectCategory}
        onBrowseAllTools={onBrowseAllTools}
      />

      <div className="relative dark:border-t dark:border-[#29384A] pt-8 sm:pt-10">
        {/* Subtle dark-mode blue ambient glow near top of workspace */}
        <div
          aria-hidden="true"
          className="hidden dark:block pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden"
        >
          <div
            className="mx-auto max-w-5xl h-full"
            style={{
              background:
                'radial-gradient(ellipse 68% 85% at 50% 0%, rgba(59, 130, 246, 0.11) 0%, rgba(16, 23, 34, 0) 75%)'
            }}
          />
        </div>
        <div className="relative z-10 space-y-12">
        {inlineSelectedToolId ? (
          /* PRESERVED INLINE CALCULATOR WORKSPACE */
          <div ref={workspaceRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="ui-panel p-5 sm:p-7 transition-all duration-200 animate-hero-fade-in-up space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-3.5 min-w-0">
                  {(() => {
                    const rawC = CALCULATORS.find((c) => c.id === inlineSelectedToolId);
                    if (!rawC) return null;
                    const calc = getLocalizedCalculator(rawC, language);
                    const targetHub = getPrimaryToolHub(rawC);
                    const p = rawPillars.find((item) => item.title === targetHub) || rawPillars[0];
                    const displayName = getContextualToolName(calc.name, p.title);
                    return (
                      <>
                        <ToolIconBadge tool={rawC} size="lg" className="w-11 h-11" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-accent truncate">{p.title}</p>
                          <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight truncate">
                            {displayName}
                          </h2>
                          <p className="text-xs text-text-secondary truncate mt-0.5">{calc.shortDesc}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <UiButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseInlineWorkspace}
                  className="self-start sm:self-auto"
                >
                  <X className="w-4 h-4" />
                  <span>{isEs ? 'Cerrar Herramienta' : 'Close Tool'}</span>
                </UiButton>
              </div>

              <div>
                {(() => {
                  const rawC = CALCULATORS.find((c) => c.id === inlineSelectedToolId);
                  if (!rawC) return null;
                  return (
                    <CalculatorView
                      calculator={rawC}
                      onBack={handleCloseInlineWorkspace}
                      onSelectCalculator={handleSelectCalculatorInline}
                      onNavigateHome={() => {
                        setSelectedHub(null);
                        setInlineSelectedToolId(null);
                        window.history.pushState({}, '', '/');
                      }}
                      onNavigateCategories={() => onSelectCategory('all')}
                      onNavigateCategory={(catId) => onSelectCategory(catId as CategoryId)}
                      onNavigateSubcategory={(catId, subId) => onSelectCategory(catId as CategoryId, subId)}
                      isFavorite={favoriteIds.includes(rawC.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* PRESERVED DYNAMIC TOOL HUB DIRECTORY (WHEN A HUB IS SELECTED) */}
            {selectedHub && activePillar && (
              <ToolDirectory
                hubTitle={activePillar.title}
                hubDescription={activePillar.desc}
                hubIcon={activePillar.icon}
                hubColor={activePillar.color}
                tools={hubResults}
                onSelectCalculator={handleSelectCalculatorInline}
                onClear={() => {
                  setSelectedHub(null);
                  setInlineSelectedToolId(null);
                  window.history.pushState({}, '', '/');
                }}
                favoriteIds={favoriteIds}
                onToggleFavorite={onToggleFavorite}
              />
            )}

            {/* 2. POPULAR TOOLS (Verified isPopular registry entries + interactive domain filter) */}
            <section
              id="popular"
              aria-labelledby="home-popular-heading"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                <div>
                  <h2 id="home-popular-heading" className="ui-section-title text-lg sm:text-xl">
                    {isEs ? 'Herramientas Populares' : 'Popular Tools'}
                  </h2>
                  <p className="ui-supporting mt-0.5">
                    {isEs
                      ? 'Calculadoras y utilidades esenciales listas para usar al instante.'
                      : 'Essential calculators and everyday utilities ready to run immediately.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBrowseAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <span>{isEs ? 'Ver todas las herramientas' : 'Browse all tools'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Interactive Domain Filter Controls */}
              <div
                role="tablist"
                aria-label={isEs ? 'Filtrar herramientas populares por área' : 'Filter popular tools by area'}
                className="flex flex-wrap items-center gap-1.5 mb-5"
              >
                {popularFilterTabs.map((tab) => {
                  const active = popularFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPopularFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-surface-selected text-accent border border-border-selected/50'
                          : 'bg-surface text-text-secondary border border-border-main hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {displayedPopularTools.map((rawTool) => {
                  const localized = getLocalizedCalculator(rawTool, language);
                  return (
                    <CompactToolCard
                      key={rawTool.id}
                      tool={localized}
                      categoryLabel={categoryTitleMap.get(rawTool.category)}
                      isFavorite={favoriteIds.includes(rawTool.id)}
                      onSelect={onSelectCalculator}
                      onToggleFavorite={onToggleFavorite}
                      favoriteAddLabel={favoriteAddLabel}
                      favoriteRemoveLabel={favoriteRemoveLabel}
                      onHoverEnter={handleCardHoverEnter}
                      onHoverLeave={handleCardHoverLeave}
                      isPreviewActive={hoverPreviewState?.tool.id === rawTool.id}
                    />
                  );
                })}
              </div>
            </section>

            {/* 3. YOUR WORKSPACE: RECENTLY USED & FAVORITES */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* RECENTLY USED TOOLS */}
                <section aria-labelledby="home-recent-heading">
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-accent shrink-0" />
                      <h2 id="home-recent-heading" className="ui-section-title truncate">
                        {isEs ? 'Usadas Recientemente' : 'Recently Used'}
                      </h2>
                      <span className="text-xs text-text-tertiary tabular-nums">
                        ({recentCalculators.length})
                      </span>
                    </div>

                    {recentCalculators.length > 0 && (
                      <button
                        type="button"
                        onClick={onClearRecent}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-status-error transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isEs ? 'Limpiar' : 'Clear'}</span>
                      </button>
                    )}
                  </div>

                  {recentCalculators.length === 0 ? (
                    <UiEmptyState
                      icon={<Clock className="w-5 h-5 text-text-tertiary" />}
                      title={isEs ? 'Sin actividad reciente' : 'No recent tools yet'}
                      description={
                        isEs
                          ? 'Las calculadoras y utilidades que abras aparecerán aquí para volver en un clic.'
                          : 'Calculators and utilities you open will appear here so you can jump back in.'
                      }
                      action={
                        <UiButton variant="secondary" size="sm" onClick={handleOpenSearch}>
                          <Search className="w-3.5 h-3.5" />
                          <span>{isEs ? 'Buscar herramienta' : 'Find a tool'}</span>
                        </UiButton>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {recentCalculators.slice(0, 6).map((rawCalc) => {
                        const calc = getLocalizedCalculator(rawCalc, language);
                        return (
                          <CompactToolCard
                            key={rawCalc.id}
                            tool={calc}
                            categoryLabel={categoryTitleMap.get(rawCalc.category)}
                            isFavorite={favoriteIds.includes(rawCalc.id)}
                            onSelect={onSelectCalculator}
                            onToggleFavorite={onToggleFavorite}
                            compact
                            favoriteAddLabel={favoriteAddLabel}
                            favoriteRemoveLabel={favoriteRemoveLabel}
                            onHoverEnter={handleCardHoverEnter}
                            onHoverLeave={handleCardHoverLeave}
                            isPreviewActive={hoverPreviewState?.tool.id === rawCalc.id}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* FAVORITE TOOLS */}
                <section aria-labelledby="home-favorites-heading">
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                      <h2 id="home-favorites-heading" className="ui-section-title truncate">
                        {isEs ? 'Favoritos' : 'Favorites'}
                      </h2>
                      <span className="text-xs text-text-tertiary tabular-nums">
                        ({favoriteCalculators.length})
                      </span>
                    </div>

                    {onNavigateFavorites && (
                      <button
                        type="button"
                        onClick={onNavigateFavorites}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>{isEs ? 'Ver todos' : 'View all'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {favoriteCalculators.length === 0 ? (
                    <UiEmptyState
                      icon={<Star className="w-5 h-5 text-text-tertiary" />}
                      title={isEs ? 'Aún no tienes favoritos' : 'No saved favorites'}
                      description={
                        isEs
                          ? 'Pulsa el icono de estrella en cualquier herramienta para fijarla en tu espacio.'
                          : 'Click the star icon on any tool card to pin it here for quick access.'
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {favoriteCalculators.slice(0, 6).map((rawCalc) => {
                        const calc = getLocalizedCalculator(rawCalc, language);
                        return (
                          <CompactToolCard
                            key={rawCalc.id}
                            tool={calc}
                            categoryLabel={categoryTitleMap.get(rawCalc.category)}
                            isFavorite={true}
                            onSelect={onSelectCalculator}
                            onToggleFavorite={onToggleFavorite}
                            compact
                            favoriteAddLabel={favoriteAddLabel}
                            favoriteRemoveLabel={favoriteRemoveLabel}
                            onHoverEnter={handleCardHoverEnter}
                            onHoverLeave={handleCardHoverLeave}
                            isPreviewActive={hoverPreviewState?.tool.id === rawCalc.id}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* 4. CATEGORY DISCOVERY (Verified CATEGORIES with dynamically derived tool counts) */}
            <section
              aria-labelledby="home-categories-heading"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                <div>
                  <h2 id="home-categories-heading" className="ui-section-title text-lg sm:text-xl">
                    {isEs ? 'Explorar por Categoría' : 'Explore Categories'}
                  </h2>
                  <p className="ui-supporting mt-0.5 tabular-nums">
                    {isEs
                      ? `Mostrando las ${featuredCategories.length} categorías más amplias de ${activeCategories.length} categorías disponibles.`
                      : `Top ${featuredCategories.length} collections by tool count across ${activeCategories.length} available categories.`}
                  </p>
                </div>

                <UiButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectCategory('all')}
                  className="self-start sm:self-auto"
                >
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {isEs
                      ? `Ver las ${activeCategories.length} Categorías`
                      : `View All ${activeCategories.length} Categories`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
                </UiButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {featuredCategories.map((rawCat) => {
                  const localizedCat = getLocalizedCategory(rawCat, language);
                  return (
                    <HomeCategoryCard
                      key={rawCat.id}
                      category={localizedCat}
                      onSelect={(catId) => onSelectCategory(catId)}
                      toolsCountSuffix={isEs ? 'herramientas' : 'tools'}
                    />
                  );
                })}
              </div>
            </section>

            {/* 5. FEATURED UTILITY SUITES (Real verified PDF, Converter, Generator, Checker collections) */}
            {utilitySuites.length > 0 && activeUtilityCategory && (
              <section
                aria-labelledby="home-utilities-heading"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                  <div>
                    <h2 id="home-utilities-heading" className="ui-section-title text-lg sm:text-xl">
                      {isEs ? 'Utilidades, PDF y Conversores' : 'Utilities, PDF & Converters'}
                    </h2>
                    <p className="ui-supporting mt-0.5">
                      {isEs
                        ? 'Más allá de las calculadoras: herramientas directas para documentos, unidades, generación y validación.'
                        : 'Beyond calculators — browser-local tools for PDFs, unit conversion, generation, and validation.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCategory(activeUtilityCategory.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto tabular-nums"
                  >
                    <span>
                      {isEs
                        ? `Ver todo en ${getLocalizedCategory(activeUtilityCategory, language).title} (${activeUtilityCategory.count})`
                        : `Open ${getLocalizedCategory(activeUtilityCategory, language).title} (${activeUtilityCategory.count})`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Utility Suite Switcher */}
                <div
                  role="tablist"
                  aria-label={isEs ? 'Colecciones de utilidades' : 'Utility collections'}
                  className="flex flex-wrap items-center gap-1.5 mb-5"
                >
                  {utilitySuites.map((suite) => {
                    const localizedSuite = getLocalizedCategory(suite, language);
                    const isActive = activeUtilityCategory.id === suite.id;
                    return (
                      <button
                        key={suite.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveUtilitySuite(suite.id as UtilitySuiteCategoryId)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-surface-selected text-accent border border-border-selected/50'
                            : 'bg-surface text-text-secondary border border-border-main hover:bg-surface-hover hover:text-text-primary'
                        }`}
                      >
                        <span>{localizedSuite.title}</span>
                        <span className="text-[11px] font-normal opacity-75 tabular-nums">
                          {suite.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {activeUtilityTools.map((rawTool) => {
                    const localized = getLocalizedCalculator(rawTool, language);
                    return (
                      <CompactToolCard
                        key={rawTool.id}
                        tool={localized}
                        categoryLabel={categoryTitleMap.get(rawTool.category)}
                        isFavorite={favoriteIds.includes(rawTool.id)}
                        onSelect={onSelectCalculator}
                        onToggleFavorite={onToggleFavorite}
                        favoriteAddLabel={favoriteAddLabel}
                        favoriteRemoveLabel={favoriteRemoveLabel}
                        onHoverEnter={handleCardHoverEnter}
                        onHoverLeave={handleCardHoverLeave}
                        isPreviewActive={hoverPreviewState?.tool.id === rawTool.id}
                      />
                    );
                  })}
                </div>
              </section>
            )}

          </>
        )}
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
      </div>
    </div>
  );
}
