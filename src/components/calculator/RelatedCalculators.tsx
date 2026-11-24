import { Layers } from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../../types.ts';
import { CATEGORIES, SUBCATEGORIES } from '../../data/calculators.ts';
import { getLocalizedCategory, getLocalizedSubcategory } from '../../i18n/esTranslations.ts';
import CompactToolCard from '../common/CompactToolCard.tsx';
import ToolHoverPreviewModal from '../home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from '../home/useToolHoverPreview.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface RelatedCalculatorsProps {
  related: CalculatorMeta[];
  categoryTitle?: string;
  favoriteIds?: CalculatorId[];
  onSelectCalculator: (id: CalculatorId) => void;
  onToggleFavorite?: (id: CalculatorId) => void;
}

export default function RelatedCalculators({
  related,
  categoryTitle,
  favoriteIds = [],
  onSelectCalculator,
  onToggleFavorite
}: RelatedCalculatorsProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  if (!related || related.length === 0) return null;

  const heading = isEs
    ? `Herramientas relacionadas en ${categoryTitle || 'esta categoría'}`
    : `Related tools in ${categoryTitle || 'this category'}`;

  return (
    <section aria-labelledby="related-tools-heading" className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-accent shrink-0" />
        <h2 id="related-tools-heading" className="ui-section-title">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {related.map((calc) => {
          const rawCat = CATEGORIES.find((c) => c.id === calc.category);
          const rawSub = SUBCATEGORIES.find((s) => s.id === calc.subcategoryId);
          const catLabel = rawCat ? getLocalizedCategory(rawCat, language).title : categoryTitle;
          const subLabel = rawSub ? getLocalizedSubcategory(rawSub, language).name : undefined;

          return (
            <CompactToolCard
              key={calc.id}
              tool={calc}
              categoryLabel={catLabel}
              subcategoryLabel={subLabel}
              isFavorite={favoriteIds.includes(calc.id)}
              onSelect={onSelectCalculator}
              onToggleFavorite={onToggleFavorite || (() => {})}
              favoriteAddLabel={isEs ? 'Guardar en favoritos' : 'Save to favorites'}
              favoriteRemoveLabel={isEs ? 'Quitar de favoritos' : 'Remove from favorites'}
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
