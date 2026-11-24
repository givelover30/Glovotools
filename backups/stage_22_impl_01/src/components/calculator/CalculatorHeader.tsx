import React from 'react';
import { CalculatorMeta, CategoryMeta, SubcategoryMeta } from '../../types.ts';
import CalculatorIcon from '../common/CalculatorIcon.tsx';
import { ToolPageVariant } from './toolPageVariant.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorHeaderProps {
  calculator: CalculatorMeta;
  category?: CategoryMeta;
  subcategory?: SubcategoryMeta;
  variant?: ToolPageVariant;
  actions?: React.ReactNode;
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
}

export default function CalculatorHeader({
  calculator,
  category,
  subcategory,
  variant = 'calculator',
  actions,
  onNavigateCategory,
  onNavigateSubcategory
}: CalculatorHeaderProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const accentColor = calculator.iconColor || '#159B69';

  const variantLabel =
    variant === 'document-utility'
      ? isEs
        ? 'Procesamiento local en navegador'
        : 'Browser-local file utility'
      : variant === 'converter'
      ? isEs
        ? 'Conversor instantáneo'
        : 'Instant unit converter'
      : variant === 'workspace'
      ? isEs
        ? 'Utilidad interactiva'
        : 'Interactive utility'
      : isEs
      ? 'Cálculo instantáneo'
      : 'Live calculator';

  return (
    <header className="border-b border-border-subtle bg-gradient-to-b from-[#F1FBF6] via-[#F7F9FB] to-[#F7F9FB] dark:from-[#0E1815] dark:via-[#0B0E11] dark:to-[#0B0E11]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Left: Icon + Title + Concise Description + Unboxed Metadata */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border border-border-subtle/80 mt-0.5"
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 13%, transparent)`,
                color: accentColor
              }}
            >
              <CalculatorIcon
                name={calculator.iconName}
                className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.1] dark:brightness-125"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Clean unboxed category / subcategory metadata (zero static pills) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
                {category && (
                  onNavigateCategory ? (
                    <button
                      type="button"
                      onClick={() => onNavigateCategory(category.slug)}
                      className="font-semibold text-accent hover:underline cursor-pointer"
                    >
                      {category.title}
                    </button>
                  ) : (
                    <span className="font-semibold text-accent">{category.title}</span>
                  )
                )}

                {category && subcategory && (
                  <>
                    <span aria-hidden="true" className="text-border-strong">·</span>
                    {onNavigateSubcategory ? (
                      <button
                        type="button"
                        onClick={() => onNavigateSubcategory(category.slug, subcategory.slug)}
                        className="hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {subcategory.name}
                      </button>
                    ) : (
                      <span>{subcategory.name}</span>
                    )}
                  </>
                )}

                <span aria-hidden="true" className="hidden sm:inline text-border-strong">·</span>
                <span className="hidden sm:inline text-text-tertiary">{variantLabel}</span>
              </div>

              <h1 className="ui-page-title break-words">{calculator.name}</h1>

              <p className="ui-body max-w-2xl">{calculator.shortDesc}</p>
            </div>
          </div>

          {/* Right: Favorite, Copy Link, Share Actions */}
          {actions && <div className="shrink-0 lg:pt-1">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
