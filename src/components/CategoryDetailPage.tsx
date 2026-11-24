import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Percent,
  Binary,
  Shapes,
  Triangle,
  BarChart3,
  Atom,
  Coins,
  Briefcase,
  Hammer,
  HeartPulse,
  Calendar,
  Zap,
  Wrench,
  Receipt,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Star,
  ArrowLeft,
  Share2,
  Check,
  CheckCircle2
} from 'lucide-react';
import { 
  getCategoryById, 
  getSubcategoriesForCategory, 
  getCalculatorsByCategory,
  CATEGORIES,
  CALCULATORS
} from '../data/calculators.ts';
import { CategoryId, CalculatorId } from '../types.ts';
import CalculatorIcon from './common/CalculatorIcon.tsx';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCategory, getLocalizedSubcategory, getLocalizedCalculator } from '../i18n/esTranslations.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';

interface CategoryDetailPageProps {
  categoryId: CategoryId | string;
  activeSubcategoryId?: string | null;
  onSelectSubcategory: (subcatId: string | null) => void;
  onSelectCalculator: (calculatorId: CalculatorId) => void;
  onBackToCategories: () => void;
  onBackToHome: () => void;
  favoriteIds?: CalculatorId[];
  onToggleFavorite?: (calcId: CalculatorId) => void;
  favoriteSubcategoryIds?: string[];
  onToggleFavoriteSubcategory?: (subId: string) => void;
}

export default function CategoryDetailPage({
  categoryId,
  activeSubcategoryId,
  onSelectSubcategory,
  onSelectCalculator,
  onBackToCategories,
  onBackToHome,
  favoriteIds = [],
  onToggleFavorite,
  favoriteSubcategoryIds = [],
  onToggleFavoriteSubcategory
}: CategoryDetailPageProps) {
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  const rawCategory = getCategoryById(categoryId) || CATEGORIES[0];
  const category = getLocalizedCategory(rawCategory, language);
  const subcategories = getSubcategoriesForCategory(rawCategory.id).map((s) => getLocalizedSubcategory(s, language));
  const allCategoryCalculators = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof getLocalizedCalculator>>();
    for (const raw of getCalculatorsByCategory(rawCategory.id)) {
      const localized = getLocalizedCalculator(raw, language);
      const existing = byId.get(localized.id);
      if (!existing || (!existing.isPopular && localized.isPopular)) {
        byId.set(localized.id, localized);
      }
    }
    return Array.from(byId.values());
  }, [rawCategory.id, language]);

  // Active subcategory meta if selected
  const activeSubcat = subcategories.find((s) => s.id === activeSubcategoryId);

  // Horizontal sliding subcategory pills state & animation
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const floatPosRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const manualPauseTimerRef = useRef<number | null>(null);

  const slidingSubcategories = useMemo(() => {
    if (subcategories.length === 0) return [];
    const repeatPerHalf = Math.max(1, Math.ceil(10 / subcategories.length));
    const half = Array.from({ length: repeatPerHalf }, () => subcategories).flat();
    return [...half, ...half];
  }, [subcategories]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el || subcategories.length === 0) return;

    floatPosRef.current = 0;
    el.scrollLeft = 0;

    let rafId = 0;
    let lastTime = performance.now();
    const speedPxPerSec = 38;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPausedRef.current && el.scrollWidth > el.clientWidth) {
        const halfWidth = el.scrollWidth / 2;
        floatPosRef.current += speedPxPerSec * dt;
        if (floatPosRef.current >= halfWidth) {
          floatPosRef.current -= halfWidth;
        }
        el.scrollLeft = floatPosRef.current;
      } else {
        floatPosRef.current = el.scrollLeft;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (manualPauseTimerRef.current) {
        window.clearTimeout(manualPauseTimerRef.current);
      }
    };
  }, [categoryId, subcategories.length, language]);

  const handleSlideBy = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;

    isPausedRef.current = true;
    if (manualPauseTimerRef.current) {
      window.clearTimeout(manualPauseTimerRef.current);
    }

    const halfWidth = el.scrollWidth / 2;
    const step = 240;

    if (direction === 'left' && el.scrollLeft < step && halfWidth > 0) {
      el.scrollLeft += halfWidth;
      floatPosRef.current = el.scrollLeft;
    } else if (direction === 'right' && halfWidth > 0 && el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
      floatPosRef.current = el.scrollLeft;
    }

    el.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth'
    });

    manualPauseTimerRef.current = window.setTimeout(() => {
      if (sliderRef.current) {
        floatPosRef.current = sliderRef.current.scrollLeft;
      }
      isPausedRef.current = false;
    }, 1400);
  };

  // Filter calculators by subcategory and search query
  const filteredCalculators = useMemo(() => {
    let list = allCategoryCalculators;
    if (activeSubcategoryId) {
      list = list.filter((c) => c.subcategoryId === activeSubcategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortDesc.toLowerCase().includes(q) ||
          c.formula.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [allCategoryCalculators, activeSubcategoryId, searchQuery]);

  // Popular calculators in this category
  const popularInCat = allCategoryCalculators.filter((c) => c.isPopular);

  // Related calculators from other categories
  const relatedCalculators = useMemo(() => {
    return CALCULATORS.filter((c) => c.category !== rawCategory.id).slice(0, 3).map((c) => getLocalizedCalculator(c, language));
  }, [rawCategory.id, language]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 animate-fadeIn">
      {/* Category Header Hero */}
      <section className="relative overflow-hidden bg-[#FFFFFF] dark:bg-[#050505] text-text-primary dark:text-white border-b border-border-main pt-8 pb-14">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary dark:text-neutral-400">
            <nav className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onBackToHome}
                className="hover:text-text-primary dark:hover:text-white transition cursor-pointer"
              >
                {t('breadcrumb.home')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary dark:text-neutral-500" />
              <button
                onClick={onBackToCategories}
                className="hover:text-text-primary dark:hover:text-white transition cursor-pointer"
              >
                {t('breadcrumb.categories')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary dark:text-neutral-500" />
              <button
                onClick={() => onSelectSubcategory(null)}
                className={`transition cursor-pointer ${
                  activeSubcat ? 'hover:text-text-primary dark:hover:text-white' : 'text-blue-600 dark:text-blue-400 font-semibold'
                }`}
              >
                {category.title}
              </button>
              {activeSubcat && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary dark:text-neutral-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {activeSubcat.name}
                  </span>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main dark:border-white/20 bg-surface-secondary dark:bg-white/10 hover:bg-surface-hover dark:hover:bg-white/20 text-text-primary dark:text-white text-xs transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t('msg.linkCopied')}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'Compartir Categoría' : 'Share Category'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Title Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ backgroundColor: category.iconBg }}
            >
              <CalculatorIcon name={category.iconName} className="w-7 h-7 stroke-[2.2]" style={{ color: category.iconColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                <span>{language === 'es' ? `Categoría #${rawCategory.sortOrder} de 14` : `Category #${category.sortOrder} of 14`}</span>
                <span>•</span>
                <span className="font-mono">/calculators/{category.slug}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary dark:text-white">
                {activeSubcat ? `${category.title} — ${activeSubcat.name}` : category.title}
              </h1>
              <p className="text-sm text-text-secondary dark:text-neutral-300 mt-1 max-w-3xl leading-relaxed">
                {activeSubcat ? activeSubcat.description : category.description}
              </p>
            </div>


          </div>

          {/* Subcategory Pills Navigation (Sliding Track) */}
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectSubcategory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  !activeSubcategoryId
                    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-surface-secondary dark:bg-white/10 hover:bg-surface-hover dark:hover:bg-white/20 text-text-secondary dark:text-neutral-300 border border-border-main dark:border-white/10'
                }`}
              >
                <span>{language === 'es' ? 'Todas las Subcategorías' : 'All Subcategories'}</span>
              </button>

              {subcategories.length > 0 && (
                <div
                  className="relative flex-1 min-w-0 flex items-center group"
                  onMouseEnter={() => {
                    isPausedRef.current = true;
                  }}
                  onMouseLeave={() => {
                    if (sliderRef.current) {
                      floatPosRef.current = sliderRef.current.scrollLeft;
                    }
                    isPausedRef.current = false;
                  }}
                  onTouchStart={() => {
                    isPausedRef.current = true;
                  }}
                  onTouchEnd={() => {
                    if (manualPauseTimerRef.current) {
                      window.clearTimeout(manualPauseTimerRef.current);
                    }
                    manualPauseTimerRef.current = window.setTimeout(() => {
                      if (sliderRef.current) {
                        floatPosRef.current = sliderRef.current.scrollLeft;
                      }
                      isPausedRef.current = false;
                    }, 1200);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSlideBy('left')}
                    aria-label={language === 'es' ? 'Deslizar subcategorías a la izquierda' : 'Slide subcategories left'}
                    className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-surface-secondary dark:bg-white/10 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 border border-border-main dark:border-white/15 text-text-secondary dark:text-neutral-200 hover:text-text-primary dark:hover:text-white transition shrink-0 mr-1.5 cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1 min-w-0 overflow-hidden">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#FFFFFF] dark:from-[#050505] to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#FFFFFF] dark:from-[#050505] to-transparent z-10" />

                    <div
                      ref={sliderRef}
                      className="flex items-center gap-2 overflow-x-auto py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {slidingSubcategories.map((subcat, idx) => {
                        const isActive = activeSubcategoryId === subcat.id;
                        const subId = `${categoryId}:${subcat.id}`;
                        const isSubFav = favoriteSubcategoryIds?.includes(subId);
                        const isPrimaryCopy = idx < subcategories.length;
                        return (
                          <div
                            key={`${subcat.id}-${idx}`}
                            role="button"
                            tabIndex={isPrimaryCopy ? 0 : -1}
                            aria-hidden={!isPrimaryCopy}
                            onClick={() => onSelectSubcategory(subcat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectSubcategory(subcat.id);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer flex items-center gap-2 ${
                              isActive
                                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-surface-secondary dark:bg-white/10 hover:bg-surface-hover dark:hover:bg-white/20 text-text-secondary dark:text-neutral-300 border border-border-main dark:border-white/10'
                            }`}
                          >
                            <span>{subcat.name}</span>
                            {onToggleFavoriteSubcategory && (
                              <button
                                type="button"
                                tabIndex={isPrimaryCopy ? 0 : -1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavoriteSubcategory(subId);
                                }}
                                title={isSubFav ? (language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites') : (language === 'es' ? 'Agregar a favoritos' : 'Add to favorites')}
                                className="p-0.5 rounded text-text-tertiary dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition cursor-pointer"
                              >
                                <Star className={`w-3.5 h-3.5 ${isSubFav ? 'fill-amber-400 text-amber-400' : 'stroke-current'}`} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSlideBy('right')}
                    aria-label={language === 'es' ? 'Deslizar subcategorías a la derecha' : 'Slide subcategories right'}
                    className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-surface-secondary dark:bg-white/10 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 border border-border-main dark:border-white/15 text-text-secondary dark:text-neutral-200 hover:text-text-primary dark:hover:text-white transition shrink-0 ml-1.5 cursor-pointer z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search within this Category */}
          <div className="pt-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'es' ? `Buscar dentro de ${category.title}...` : `Search within ${category.title}...`}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface dark:bg-white/5 border border-border-main dark:border-white/20 text-text-primary dark:text-white placeholder:text-text-tertiary dark:placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary dark:text-neutral-400 hover:text-text-primary dark:hover:text-white cursor-pointer"
                >
                  {language === 'es' ? 'Limpiar' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Back Button */}
        <div>
          <button
            onClick={onBackToCategories}
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition py-1.5 px-3 rounded-lg border border-border-main hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'es' ? 'Volver a Todas las Categorías' : 'Back to All Categories'}</span>
          </button>
        </div>

        {/* Popular Calculators in Category (if any) */}
        {popularInCat.length > 0 && !activeSubcategoryId && !searchQuery && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                {language === 'es' ? `Destacadas y Populares en ${category.title}` : `Featured & Popular in ${category.title}`}
              </h2>
            </div>

            <div
              className={
                rawCategory.id === 'pdf-tools'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-4'
              }
            >
              {popularInCat.map((calc) => (
                <CompactToolCard
                  key={calc.id}
                  tool={calc}
                  categoryLabel={category.title}
                  isFavorite={favoriteIds.includes(calc.id)}
                  onSelect={onSelectCalculator}
                  onToggleFavorite={onToggleFavorite || (() => {})}
                  favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                  favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                  onHoverEnter={handleCardHoverEnter}
                  onHoverLeave={handleCardHoverLeave}
                  isPreviewActive={hoverPreviewState?.tool.id === calc.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Complete Listing of Calculators in this Category / Subcategory */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              {activeSubcat
                ? `${activeSubcat.name}`
                : (language === 'es' ? `Todas las Calculadoras de ${category.title}` : `All ${category.title}`)}
            </h2>
            <span className="text-xs text-text-tertiary font-mono">
              {filteredCalculators.length} {filteredCalculators.length === 1 ? (language === 'es' ? 'resultado' : 'result') : (language === 'es' ? 'resultados' : 'results')}
            </span>
          </div>

          {filteredCalculators.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#151922] border border-border-main rounded-2xl space-y-3">
              <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-semibold text-text-primary">{language === 'es' ? 'No se encontraron calculadoras' : 'No calculators found'}</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {language === 'es'
                  ? `No hay calculadoras que coincidan con "${searchQuery}". Limpie la búsqueda o elija otra subcategoría.`
                  : `No calculators match the current filter "${searchQuery}". Clear search or pick another subcategory.`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSelectSubcategory(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                {language === 'es' ? 'Restablecer Filtros' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredCalculators.map((calc) => {
                const subcat = subcategories.find((s) => s.id === calc.subcategoryId);

                return (
                  <CompactToolCard
                    key={calc.id}
                    tool={calc}
                    categoryLabel={category.title}
                    subcategoryLabel={subcat?.name}
                    isFavorite={favoriteIds.includes(calc.id)}
                    onSelect={onSelectCalculator}
                    onToggleFavorite={onToggleFavorite || (() => {})}
                    favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                    favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                    onHoverEnter={handleCardHoverEnter}
                    onHoverLeave={handleCardHoverLeave}
                    isPreviewActive={hoverPreviewState?.tool.id === calc.id}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Related Calculators from Other Categories */}
        {relatedCalculators.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border-main">
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              {language === 'es' ? 'Calculadoras Relacionadas en CALCTOOLS' : 'Related Calculators Across CALCTOOLS'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {relatedCalculators.map((r) => {
                const rawRelCat = CATEGORIES.find((c) => c.id === r.category);
                const relCatTitle = rawRelCat ? getLocalizedCategory(rawRelCat, language).title : r.category;
                return (
                  <CompactToolCard
                    key={r.id}
                    tool={r}
                    categoryLabel={relCatTitle}
                    isFavorite={favoriteIds.includes(r.id)}
                    onSelect={onSelectCalculator}
                    onToggleFavorite={onToggleFavorite || (() => {})}
                    favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                    favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                    onHoverEnter={handleCardHoverEnter}
                    onHoverLeave={handleCardHoverLeave}
                    isPreviewActive={hoverPreviewState?.tool.id === r.id}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {hoverPreviewState && (
        <ToolHoverPreviewModal
          tool={hoverPreviewState.tool}
          categoryLabel={hoverPreviewState.categoryLabel}
          anchorRect={hoverPreviewState.anchorRect}
          isFavorite={favoriteIds.includes(hoverPreviewState.tool.id)}
          onClose={closePreview}
          onSelect={onSelectCalculator}
          onToggleFavorite={onToggleFavorite || (() => {})}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        />
      )}
    </div>
  );
}
