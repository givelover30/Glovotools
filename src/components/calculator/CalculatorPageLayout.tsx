import React, { useEffect, useMemo, useState } from 'react';
import { CalculatorMeta, CalculatorId } from '../../types.ts';
import {
  CATEGORIES,
  SUBCATEGORIES,
  CALCULATORS
} from '../../data/calculators.ts';
import { getCalculatorDetail } from '../../data/calculatorDetails.ts';
import CalculatorHeader from './CalculatorHeader.tsx';
import CalculatorActions from './CalculatorActions.tsx';
import CalculatorChart from './CalculatorChart.tsx';
import AdditionalInformationSection from './AdditionalInformationSection.tsx';
import RelatedCalculators from './RelatedCalculators.tsx';
import CalculatorRating from './CalculatorRating.tsx';
import CalculationHistoryWidget from './CalculationHistoryWidget.tsx';
import {
  isNativePhase4Workspace,
  resolveToolPageVariant
} from './toolPageVariant.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  getLocalizedCalculator,
  getLocalizedCategory,
  getLocalizedSubcategory,
  getLocalizedCalculatorDetail
} from '../../i18n/esTranslations.ts';
import {
  PrintDocumentFooter,
  PrintDocumentHeader
} from '../common/PrintDocumentChrome.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';

interface CalculatorPageLayoutProps {
  calculator: CalculatorMeta;
  children: React.ReactNode;
  onBack: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onNavigateHome?: () => void;
  onNavigateCategories?: () => void;
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateSubcategory?: (categorySlug: string, subcategorySlug: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: CalculatorId) => void;
  favoriteIds?: CalculatorId[];
  bareWorkspace?: boolean;
}

export default function CalculatorPageLayout({
  calculator,
  children,
  onBack,
  onSelectCalculator,
  onNavigateCategory,
  onNavigateSubcategory,
  isFavorite = false,
  onToggleFavorite,
  favoriteIds = [],
  bareWorkspace
}: CalculatorPageLayoutProps) {
  const [resetCounter, setResetCounter] = useState(0);
  const { language, t } = useTranslation();

  const localizedCalc = getLocalizedCalculator(calculator, language);
  const variant = useMemo(() => resolveToolPageVariant(calculator), [calculator]);
  const isNativeWorkspace = useMemo(
    () => (bareWorkspace !== undefined ? bareWorkspace : isNativePhase4Workspace(calculator)),
    [bareWorkspace, calculator]
  );

  // Synchronize SEO Document Title
  useEffect(() => {
    const prevTitle = document.title;
    const suffix =
      variant === 'document-utility'
        ? language === 'es'
          ? 'Herramienta PDF Online Gratis'
          : 'Free Online PDF Tool'
        : variant === 'converter'
        ? language === 'es'
          ? 'Conversor Online Gratis'
          : 'Free Online Converter'
        : language === 'es'
        ? 'Calculadora Online Gratis'
        : 'Free Online Calculator';
    document.title = `${localizedCalc.name} — ${suffix} | CalcTools`;
    return () => {
      document.title = prevTitle;
    };
  }, [localizedCalc.name, language, variant]);

  // Lookup associated category and subcategory
  const rawCategory = CATEGORIES.find((c) => c.id === calculator.category);
  const rawSubcategory = SUBCATEGORIES.find((s) => s.id === calculator.subcategoryId);

  const category = rawCategory ? getLocalizedCategory(rawCategory, language) : undefined;
  const subcategory = rawSubcategory
    ? getLocalizedSubcategory(rawSubcategory, language)
    : undefined;

  // Lookup verified details & localize
  const rawDetails = getCalculatorDetail(calculator.id);
  const details = getLocalizedCalculatorDetail(rawDetails, calculator, language);

  // Lookup related tools in the same subcategory first, then same category (deduplicated by ID)
  const related = useMemo(() => {
    const seen = new Set<string>([calculator.id]);
    const list: CalculatorMeta[] = [];

    const sameSub = CALCULATORS.filter(
      (c) =>
        c.category === calculator.category &&
        c.subcategoryId === calculator.subcategoryId &&
        c.id !== calculator.id
    );
    const sameCat = CALCULATORS.filter(
      (c) => c.category === calculator.category && c.id !== calculator.id
    );

    for (const item of [...sameSub, ...sameCat]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      list.push(getLocalizedCalculator(item, language));
      if (list.length >= 4) break;
    }
    return list;
  }, [calculator.id, calculator.category, calculator.subcategoryId, language]);

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
  };

  return (
    <article
      data-tool-variant={variant}
      data-tool-id={calculator.id}
      className="bg-background text-text-primary pb-14 animate-fadeIn transition-colors duration-200"
    >
      {/* 1. Compact Utily-Inspired Tool Header (Breadcrumbs handled once cleanly by GlobalBreadcrumbs) */}
      <div className="no-print">
        <CalculatorHeader
          calculator={localizedCalc}
          category={category}
          subcategory={subcategory}
          variant={variant}
          onNavigateCategory={onNavigateCategory || (() => onBack())}
          onNavigateSubcategory={onNavigateSubcategory}
          actions={
            <CalculatorActions
              calculatorId={calculator.id}
              calculatorName={localizedCalc.name}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite || (() => {})}
              onReset={handleReset}
              showReset={!isNativeWorkspace}
            />
          }
        />
      </div>

      {/* 2. Main Tool Viewport */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Primary Interactive Workspace — immediately focal above the fold & print target */}
        <div data-print-workspace="true">
          <PrintDocumentHeader
            calculatorName={localizedCalc.name}
            categoryTitle={category?.title}
            subcategoryName={subcategory?.name}
            description={localizedCalc.shortDesc}
          />

          {isNativeWorkspace ? (
            <div key={resetCounter} className="space-y-5">
              {children}
            </div>
          ) : (
            <section className="ui-panel p-5 sm:p-6 space-y-5">
              <div className="no-print flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                <h2 className="text-sm font-bold text-text-primary tracking-tight">
                  {variant === 'document-utility'
                    ? language === 'es'
                      ? 'Espacio de trabajo del documento'
                      : 'Document workspace'
                    : t('section.interactiveWorkspace')}
                </h2>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-accent">
                    {variant === 'document-utility'
                      ? language === 'es'
                        ? 'Local en navegador'
                        : 'Browser-local'
                      : t('section.liveResults')}
                  </span>
                  <PrintResultButton documentTitle={localizedCalc.name} />
                </div>
              </div>

              <div key={resetCounter}>{children}</div>

              <CalculatorChart calculatorId={calculator.id} />
            </section>
          )}

          <PrintDocumentFooter />
        </div>

        {/* Non-result supplementary sections excluded from printed calculation results */}
        <div className="no-print space-y-8">
          {/* 3. How It Works, Formula/Methodology, Worked Example & FAQs */}
          <AdditionalInformationSection details={details} variant={variant} />

          {/* 4. Compact Accuracy & Usability Rating (Below Workspace) */}
          <CalculatorRating calculatorId={calculator.id} />

          {/* 4b. Recent Session Calculations History Widget (Last 5) */}
          <CalculationHistoryWidget onSelectCalculator={onSelectCalculator} />

          {/* 5. Related Tools (Reusing unified HomeToolCard) */}
          {related.length > 0 && (
            <RelatedCalculators
              related={related}
              categoryTitle={category?.title}
              favoriteIds={favoriteIds}
              onSelectCalculator={onSelectCalculator}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </div>
      </div>
    </article>
  );
}
