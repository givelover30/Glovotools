import { ArrowRight, Flame } from 'lucide-react';
import { CALCULATORS, CATEGORIES, SUBCATEGORIES } from '../data/calculators.ts';
import { CalculatorId } from '../types.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory, getLocalizedSubcategory } from '../i18n/esTranslations.ts';

interface PopularCalculatorsProps {
  onSelectCalculator: (calcId: CalculatorId) => void;
  onViewAll: () => void;
  favoriteIds?: CalculatorId[];
  onToggleFavorite?: (calcId: CalculatorId) => void;
}

export default function PopularCalculators({
  onSelectCalculator,
  onViewAll,
  favoriteIds = [],
  onToggleFavorite,
}: PopularCalculatorsProps) {
  const { language, t } = useTranslation();
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  const seenPopularIds = new Set<string>();
  const popularList = CALCULATORS.filter((c) => {
    if (!c.isPopular || seenPopularIds.has(c.id)) return false;
    seenPopularIds.add(c.id);
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section id="popular" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
          <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-text-primary">
            {t('section.popular')}
          </h2>
        </div>

        {/* View All Button */}
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2563EB] dark:border-[#3B82F6] bg-white dark:bg-[#151922] text-[#2563EB] dark:text-[#3B82F6] text-xs sm:text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition shadow-xs cursor-pointer group"
        >
          <span>{t('btn.viewAll')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Responsive Grid using CompactToolCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {popularList.map((rawCalc) => {
          const calc = getLocalizedCalculator(rawCalc, language);
          const rawCat = CATEGORIES.find((c) => c.id === rawCalc.category);
          const cat = rawCat ? getLocalizedCategory(rawCat, language) : null;
          const rawSubcat = SUBCATEGORIES.find((s) => s.id === rawCalc.subcategoryId);
          const subcat = rawSubcat ? getLocalizedSubcategory(rawSubcat, language) : null;

          return (
            <CompactToolCard
              key={calc.id}
              tool={calc}
              categoryLabel={cat?.title}
              subcategoryLabel={subcat?.name}
              isFavorite={favoriteIds.includes(calc.id)}
              onSelect={onSelectCalculator}
              onToggleFavorite={onToggleFavorite}
              favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
              favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
              onHoverEnter={handleCardHoverEnter}
              onHoverLeave={handleCardHoverLeave}
              isPreviewActive={hoverPreviewState?.tool.id === calc.id}
            />
          );
        })}
      </div>

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
    </section>
  );
}
