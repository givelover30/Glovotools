import { useState, useEffect } from 'react';
import { 
  ChevronRight,
  ArrowRight,
  Star
} from 'lucide-react';
import { CATEGORIES } from '../data/calculators.ts';
import { CategoryId } from '../types.ts';
import CalculatorIcon from './common/CalculatorIcon.tsx';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCategory } from '../i18n/esTranslations.ts';

interface CategoryGridProps {
  onSelectCategory: (catId: CategoryId) => void;
  selectedCategory: CategoryId | null;
  favoriteCategoryIds?: CategoryId[];
  onToggleFavoriteCat?: (catId: CategoryId) => void;
}

export default function CategoryGrid({ onSelectCategory, selectedCategory, favoriteCategoryIds: propFavs, onToggleFavoriteCat: propToggle }: CategoryGridProps) {
  const { language, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [localFavs, setLocalFavs] = useState<CategoryId[]>(() => {
    try {
      const saved = localStorage.getItem('calctools_favorite_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeFavs = propFavs || localFavs;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleFavorite = (catId: CategoryId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (propToggle) {
      propToggle(catId);
    } else {
      const updated = localFavs.includes(catId)
        ? localFavs.filter(id => id !== catId)
        : [...localFavs, catId];
      setLocalFavs(updated);
      try {
        localStorage.setItem('calctools_favorite_categories', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <section id="categories" className="pt-16 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-0.5 w-6 h-6 p-0.5 text-[#16A34A] dark:text-[#22C55E]">
            <div className="w-2.5 h-2.5 rounded-xs border-2 border-current" />
            <div className="w-2.5 h-2.5 rounded-xs border-2 border-current" />
            <div className="w-2.5 h-2.5 rounded-xs border-2 border-current" />
            <div className="w-2.5 h-2.5 rounded-xs border-2 border-current" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-text-primary">
              {t('section.categories')}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {language === 'es'
                ? `${CATEGORIES.length} categorías especializadas con fórmulas verificadas`
                : `${CATEGORIES.length} dedicated calculator categories with verified formulas`}
            </p>
          </div>
        </div>

        {/* Explore All Categories Button */}
        <button
          onClick={() => onSelectCategory('all')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#16A34A] dark:border-[#22C55E] bg-white dark:bg-[#151922] text-[#16A34A] dark:text-[#22C55E] text-xs sm:text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition shadow-2xs cursor-pointer group"
        >
          <span>{language === 'es' ? `Explorar las ${CATEGORIES.length} Categorías` : `Explore All ${CATEGORIES.length} Categories`}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4-Column Desktop Grid (2-col tablet, 1-col mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border-main bg-white dark:bg-[#151922] flex items-center justify-between shadow-xs animate-pulse h-[82px]"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))
        ) : (
          CATEGORIES.map((rawCat) => {
            const cat = getLocalizedCategory(rawCat, language);
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCategory(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCategory(cat.id);
                  }
                }}
                className={`text-left p-4 rounded-2xl border border-border-main bg-white dark:bg-[#151922] hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-300 flex items-center justify-between group cursor-pointer relative overflow-hidden shadow-xs ${
                  isSelected ? 'ring-2 ring-[#22C55E] border-[#22C55E]' : ''
                }`}
              >
                {/* Ambient Hover Glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none blur-xl" style={{ backgroundColor: rawCat.iconColor }} />

                {/* Left: Modern Icon Thumbnail + Text */}
                <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1 relative z-10">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform relative border border-black/5 dark:border-white/10"
                    style={{ backgroundColor: rawCat.iconBg }}
                  >
                    <CalculatorIcon name={rawCat.iconName} className="w-6 h-6 stroke-[2.2]" style={{ color: rawCat.iconColor }} />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151922] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-[15px] font-bold text-text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-text-secondary truncate mt-0.5 font-normal">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Chevron */}
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <div className="text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
