import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CategoryMeta, CalculatorMeta } from '../../types.ts';
import { SUBCATEGORIES } from '../../data/calculators.ts';
import {
  getLocalizedCategory,
  getLocalizedCalculator,
  getLocalizedSubcategory
} from '../../i18n/esTranslations.ts';

interface GlobalBreadcrumbsProps {
  currentView: string;
  selectedCategory?: CategoryMeta | null;
  activeCalculator?: CalculatorMeta | null;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateCategory: (catId: any) => void;
  onNavigateSubcategory?: (catId: any, subId: string) => void;
}

export default function GlobalBreadcrumbs({
  currentView,
  selectedCategory,
  activeCalculator,
  onNavigateHome,
  onNavigateCategories,
  onNavigateCategory,
  onNavigateSubcategory
}: GlobalBreadcrumbsProps) {
  const { language, t } = useTranslation();

  if (currentView === 'home') {
    return null;
  }

  const localizedCat = selectedCategory ? getLocalizedCategory(selectedCategory, language) : null;
  const localizedCalc = activeCalculator ? getLocalizedCalculator(activeCalculator, language) : null;

  const rawSubcat = activeCalculator?.subcategoryId
    ? SUBCATEGORIES.find((s) => s.id === activeCalculator.subcategoryId)
    : null;
  const localizedSubcat = rawSubcat ? getLocalizedSubcategory(rawSubcat, language) : null;

  const isCategoriesActive = currentView === 'categories' && !selectedCategory;
  const isCategoryDetailActive =
    currentView === 'category-detail' || (currentView === 'categories' && selectedCategory);
  const isCalculatorActive = currentView === 'calculator';
  const isAllCalculatorsActive = currentView === 'all-calculators';
  const isFavoritesActive = currentView === 'favorites';

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-surface/90 dark:bg-[#0B0E11]/90 backdrop-blur-lg border-b border-border-subtle py-2 px-4 sm:px-6 lg:px-8 text-xs text-text-secondary sticky top-14 z-30 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 hover:text-accent transition-colors cursor-pointer font-medium text-text-secondary shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('breadcrumb.home')}</span>
        </button>

        {isFavoritesActive ? (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span className="font-semibold text-accent shrink-0" aria-current="page">
              {t('nav.favorites')}
            </span>
          </>
        ) : (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <button
              type="button"
              onClick={onNavigateCategories}
              aria-current={isCategoriesActive ? 'page' : undefined}
              className={`transition-colors cursor-pointer font-medium shrink-0 ${
                isCategoriesActive
                  ? 'text-accent font-semibold'
                  : 'hover:text-accent text-text-secondary'
              }`}
            >
              {t('breadcrumb.categories')}
            </button>
          </>
        )}

        {localizedCat && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <button
              type="button"
              onClick={() => onNavigateCategory(selectedCategory?.id)}
              aria-current={
                isCategoryDetailActive && !isCalculatorActive && !localizedSubcat
                  ? 'page'
                  : undefined
              }
              className={`transition-colors cursor-pointer font-medium truncate max-w-[200px] ${
                isCategoryDetailActive && !isCalculatorActive && !localizedSubcat
                  ? 'text-accent font-semibold'
                  : 'hover:text-accent text-text-secondary'
              }`}
            >
              {localizedCat.title}
            </button>
          </>
        )}

        {localizedSubcat && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            {selectedCategory && onNavigateSubcategory ? (
              <button
                type="button"
                onClick={() => onNavigateSubcategory(selectedCategory.id, localizedSubcat.id)}
                className="font-medium text-text-secondary hover:text-accent transition-colors cursor-pointer truncate max-w-[200px]"
              >
                {localizedSubcat.name}
              </button>
            ) : (
              <span className="font-medium text-text-secondary truncate max-w-[200px]">
                {localizedSubcat.name}
              </span>
            )}
          </>
        )}

        {isCalculatorActive && localizedCalc && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span
              className="font-semibold text-accent truncate max-w-[260px]"
              aria-current="page"
            >
              {localizedCalc.name}
            </span>
          </>
        )}

        {isAllCalculatorsActive && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span className="font-semibold text-accent truncate" aria-current="page">
              {language === 'es' ? 'Todas las Calculadoras' : 'All Calculators'}
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
