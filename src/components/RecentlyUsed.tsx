import { Clock, Trash2 } from 'lucide-react';
import { CalculatorMeta, CalculatorId } from '../types.ts';
import { CATEGORIES } from '../data/calculators.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../i18n/esTranslations.ts';

interface RecentlyUsedProps {
  recentCalculators: CalculatorMeta[];
  onSelectCalculator: (id: CalculatorId) => void;
  onClearRecent: () => void;
  favoriteIds?: CalculatorId[];
  onToggleFavorite?: (id: CalculatorId) => void;
}

export default function RecentlyUsed({
  recentCalculators,
  onSelectCalculator,
  onClearRecent,
  favoriteIds = [],
  onToggleFavorite
}: RecentlyUsedProps) {
  const { language, t } = useTranslation();
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  if (recentCalculators.length === 0) return null;

  return (
    <section className="pt-10 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {t('section.recent')}
              </h2>
            </div>
          </div>
        </div>

        <button
          onClick={onClearRecent}
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-rose-500 transition py-1 px-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          title={language === 'es' ? 'Limpiar historial de calculadoras recientes' : 'Clear recent calculators history'}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('btn.clearRecent')}</span>
        </button>
      </div>

      {/* Compact Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recentCalculators.map((rawCalc) => {
          const calc = getLocalizedCalculator(rawCalc, language);
          const rawCat = CATEGORIES.find((c) => c.id === rawCalc.category);
          const catTitle = rawCat ? getLocalizedCategory(rawCat, language).title : undefined;

          return (
            <CompactToolCard
              key={calc.id}
              tool={calc}
              categoryLabel={catTitle}
              isFavorite={favoriteIds.includes(calc.id)}
              onSelect={onSelectCalculator}
              onToggleFavorite={onToggleFavorite}
              compact
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
