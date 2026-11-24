import React from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { formatPrintTimestamp } from '../../utils/printResult.ts';

interface PrintDocumentHeaderProps {
  calculatorName: string;
  categoryTitle?: string;
  subcategoryName?: string;
  description?: string;
}

/**
 * Print-only branded document header (hidden on screen via .print-only-block).
 * Appears cleanly at the top of every printed calculation result with Glovotools branding,
 * localized calculator title, category context, and live calculation date/time.
 */
export function PrintDocumentHeader({
  calculatorName,
  categoryTitle,
  subcategoryName,
  description
}: PrintDocumentHeaderProps) {
  const { language, t } = useTranslation();
  const initialTimestamp = formatPrintTimestamp(language);
  const categoryLine = [categoryTitle, subcategoryName].filter(Boolean).join(' · ');

  return (
    <div
      className="print-only-block glovo-print-doc-header"
      data-print-doc-header="true"
      data-print-title={calculatorName}
      data-print-category={categoryLine}
      data-print-subtitle={description || ''}
      data-print-generated-label={t('print.generatedOn')}
      data-print-inputs-label={t('print.inputs')}
      data-print-results-label={t('print.results')}
      aria-hidden="true"
    >
      <div className="glovo-print-brand-row">
        <div className="glovo-print-brand">
          <svg
            width="22"
            height="22"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="glovo-print-logo"
          >
            <rect width="28" height="28" rx="7" fill="#159B69" />
            <path
              d="M8.5 9.5H19.5M8.5 14H15.5M8.5 18.5H13.5"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="18.5" cy="17.5" r="2.5" fill="#FFFFFF" />
          </svg>
          <div>
            <div className="glovo-print-brand-name">Glovotools</div>
            {categoryLine && (
              <div className="glovo-print-category">{categoryLine}</div>
            )}
          </div>
        </div>

        <div className="glovo-print-meta">
          <div className="glovo-print-meta-label">{t('print.generatedOn')}</div>
          <div className="glovo-print-meta-value" data-print-timestamp="true">
            {initialTimestamp}
          </div>
        </div>
      </div>

      <div className="glovo-print-title-block">
        <h1 className="glovo-print-title">{calculatorName}</h1>
        {description && <p className="glovo-print-subtitle">{description}</p>}
      </div>
    </div>
  );
}

/**
 * Print-only subtle footer shown at the bottom of printed calculation summaries.
 */
export function PrintDocumentFooter() {
  const { t } = useTranslation();

  return (
    <div
      className="print-only-block glovo-print-doc-footer"
      data-print-doc-footer="true"
      data-print-footer-text={t('print.footer')}
      aria-hidden="true"
    >
      <span>{t('print.footer')}</span>
      <span>glovotools.com</span>
    </div>
  );
}
