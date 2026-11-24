import { ChevronRight } from 'lucide-react';
import { CategoryMeta, SubcategoryMeta } from '../../types.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorBreadcrumbsProps {
  category?: CategoryMeta;
  subcategory?: SubcategoryMeta;
  calculatorName: string;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateCategory: (slug: string) => void;
  onNavigateSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
}

export default function CalculatorBreadcrumbs({
  category,
  subcategory,
  calculatorName,
  onNavigateHome,
  onNavigateCategories,
  onNavigateCategory,
  onNavigateSubcategory
}: CalculatorBreadcrumbsProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-tertiary flex-wrap">
      <button
        onClick={onNavigateHome}
        className="hover:text-text-primary transition cursor-pointer"
      >
        {t('breadcrumb.home')}
      </button>

      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />

      <button
        onClick={onNavigateCategories}
        className="hover:text-text-primary transition cursor-pointer"
      >
        {t('breadcrumb.categories')}
      </button>

      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
          <button
            onClick={() => onNavigateCategory(category.slug)}
            className="hover:text-text-primary transition cursor-pointer"
          >
            {category.title}
          </button>
        </>
      )}

      {category && subcategory && onNavigateSubcategory && (
        <>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
          <button
            onClick={() => onNavigateSubcategory(category.slug, subcategory.slug)}
            className="hover:text-text-primary transition cursor-pointer"
          >
            {subcategory.name}
          </button>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
      <span className="font-semibold text-text-primary truncate max-w-[200px] sm:max-w-none">
        {calculatorName}
      </span>
    </nav>
  );
}
