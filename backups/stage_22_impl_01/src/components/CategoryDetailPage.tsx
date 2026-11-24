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

  const rawCategory = getCategoryById(categoryId) || CATEGORIES[0];
  const category = getLocalizedCategory(rawCategory, language);
  const subcategories = getSubcategoriesForCategory(rawCategory.id).map((s) => getLocalizedSubcategory(s, language));
  const allCategoryCalculators = getCalculatorsByCategory(rawCategory.id).map((c) => getLocalizedCalculator(c, language));

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
      <section className="relative overflow-hidden bg-[#050505] text-white border-b border-border-main pt-8 pb-14">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <nav className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onBackToHome}
                className="hover:text-white transition cursor-pointer"
              >
                {t('breadcrumb.home')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              <button
                onClick={onBackToCategories}
                className="hover:text-white transition cursor-pointer"
              >
                {t('breadcrumb.categories')}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              <button
                onClick={() => onSelectSubcategory(null)}
                className={`transition cursor-pointer ${
                  activeSubcat ? 'hover:text-white' : 'text-emerald-400 font-semibold'
                }`}
              >
                {category.title}
              </button>
              {activeSubcat && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-emerald-400 font-semibold">
                    {activeSubcat.name}
                  </span>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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
              <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-semibold mb-1">
                <span>{language === 'es' ? `Categoría #${rawCategory.sortOrder} de 14` : `Category #${category.sortOrder} of 14`}</span>
                <span>•</span>
                <span className="font-mono">/calculators/{category.slug}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {activeSubcat ? `${category.title} — ${activeSubcat.name}` : category.title}
              </h1>
              <p className="text-sm text-neutral-300 mt-1 max-w-3xl leading-relaxed">
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
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-300 border border-white/10'
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
                    className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 hover:bg-emerald-500/30 border border-white/15 text-neutral-200 hover:text-white transition shrink-0 mr-1.5 cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1 min-w-0 overflow-hidden">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#050505] to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#050505] to-transparent z-10" />

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
                                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-white/10 hover:bg-white/20 text-neutral-300 border border-white/10'
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
                                className="p-0.5 rounded text-neutral-300 hover:text-amber-400 transition cursor-pointer"
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
                    className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 hover:bg-emerald-500/30 border border-white/15 text-neutral-200 hover:text-white transition shrink-0 ml-1.5 cursor-pointer z-10"
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
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'es' ? `Buscar dentro de ${category.title}...` : `Search within ${category.title}...`}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 text-white placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularInCat.map((calc, idx) => {
                const themes = [
                  { bg: 'bg-[#E8F7EF] dark:bg-emerald-950/30', border: 'border-[#C3EBD4] dark:border-emerald-800/50' },
                  { bg: 'bg-[#EAF2FF] dark:bg-blue-950/30', border: 'border-[#C7DCFF] dark:border-blue-800/50' },
                  { bg: 'bg-[#F3ECFF] dark:bg-violet-950/30', border: 'border-[#E2D2FF] dark:border-violet-800/50' },
                  { bg: 'bg-[#FFF3E5] dark:bg-amber-950/30', border: 'border-[#FFE2BC] dark:border-amber-800/50' },
                  { bg: 'bg-[#FFF0F1] dark:bg-rose-950/30', border: 'border-[#FFD5D8] dark:border-rose-800/50' }
                ];
                const theme = themes[idx % themes.length];

                return (
                  <div
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`ui-card ui-card-interactive p-5 sm:p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border ${theme.border} ${theme.bg} shadow-xs transition-all duration-150`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border-subtle shadow-2xs"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${calc.iconColor || '#159B69'} 14%, transparent)`,
                              color: calc.iconColor || '#159B69'
                            }}
                          >
                            <CalculatorIcon name={calc.iconName} className="w-5 h-5 stroke-[2.1] dark:brightness-125" />
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                          {language === 'es' ? 'Popular' : 'Popular'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
                        {calc.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                        {calc.shortDesc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-text-tertiary font-medium">{language === 'es' ? 'Cálculo verificado' : 'Verified calculation'}</span>
                      <span className="font-semibold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {language === 'es' ? 'Abrir Herramienta' : 'Open Tool'} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
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
                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
              >
                {language === 'es' ? 'Restablecer Filtros' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCalculators.map((calc) => {
                const subcat = subcategories.find((s) => s.id === calc.subcategoryId);
                const isFav = favoriteIds.includes(calc.id);

                return (
                  <div
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className="text-left p-5 rounded-2xl border border-border-main bg-white dark:bg-[#151922] hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Top Bar: Icon + Subcategory Pill + Favorite button */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: calc.iconBg }}
                        >
                          <CalculatorIcon name={calc.iconName} className="w-5 h-5 stroke-[2.2]" style={{ color: calc.iconColor }} />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onToggleFavorite && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(calc.id);
                              }}
                              title={isFav ? (language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites') : (language === 'es' ? 'Agregar a favoritos' : 'Add to favorites')}
                              className="p-1 rounded-md text-neutral-300 dark:text-neutral-600 hover:text-amber-500 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFav
                                    ? 'fill-amber-400 stroke-amber-500 text-amber-500'
                                    : 'stroke-current'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition break-words [overflow-wrap:anywhere] leading-snug">
                        {calc.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 break-words [overflow-wrap:anywhere] leading-relaxed">
                        {calc.shortDesc}
                      </p>

                      {/* Formula preview */}
                      <div className="mt-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-100 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate">
                        <span className="text-neutral-400 select-none mr-1.5">{t('label.formula')}</span>
                        {calc.formula}
                      </div>

                      {/* Tags */}
                      {calc.tags && calc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {calc.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Bottom CTA */}
                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-text-tertiary flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{language === 'es' ? 'Cliente local' : 'Client-side'}</span>
                      </span>
                      <span className="text-[#16A34A] dark:text-[#22C55E] font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{t('btn.calculate')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedCalculators.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onSelectCalculator(r.id)}
                  className="p-4 rounded-xl border border-border-main bg-white dark:bg-[#151922] hover:border-neutral-300 dark:hover:border-neutral-700 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-text-secondary">
                      {r.category}
                    </span>
                    <h4 className="text-sm font-semibold text-text-primary mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {r.name}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 break-words [overflow-wrap:anywhere]">
                      {r.shortDesc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{language === 'es' ? 'Abrir herramienta' : 'Open tool'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
