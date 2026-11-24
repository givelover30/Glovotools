import { useState } from 'react';
import {
  BookOpen,
  ListOrdered,
  HelpCircle,
  ChevronDown,
  Layers,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { CalculatorDetail } from '../../data/calculatorDetails.ts';
import { ToolPageVariant } from './toolPageVariant.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface AdditionalInformationSectionProps {
  details: CalculatorDetail;
  variant?: ToolPageVariant;
}

export default function AdditionalInformationSection({
  details,
  variant = 'calculator'
}: AdditionalInformationSectionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const { language, t } = useTranslation();
  const isEs = language === 'es';
  const isDocUtility = variant === 'document-utility';

  if (!details) return null;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const primaryRows = [
    {
      id: 'how-it-works',
      title: isEs ? 'Cómo funciona y ejemplo práctico' : 'How it works & worked example',
      subtitle:
        details.methodology?.[0] ||
        (isEs
          ? 'Pasos de cálculo y ejemplo ilustrativo'
          : 'Step-by-step workflow and illustrative example'),
      icon: ListOrdered,
      content: (
        <div className="space-y-5">
          {details.methodology && details.methodology.length > 0 && (
            <ol className="space-y-2.5">
              {details.methodology.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-surface-secondary/50"
                >
                  <span className="w-6 h-6 rounded-md bg-accent-light text-accent font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          )}

          {details.workedExample && (
            <div className="space-y-3.5 pt-4 border-t border-border-subtle">
              <div className="text-xs font-bold text-accent">
                {details.workedExample.title ||
                  (isEs ? 'Ejemplo práctico' : 'Worked example')}
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                <strong className="font-semibold text-text-primary mr-1">
                  {t('label.scenario')}
                </strong>
                {details.workedExample.scenario}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(details.workedExample.inputs).map(([key, val], idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border-subtle bg-surface-secondary/60 flex flex-col justify-between min-w-0"
                  >
                    <span className="text-[11px] text-text-tertiary truncate font-medium">
                      {key}
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-text-primary mt-0.5 truncate">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-result-bg border border-result-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-result-text-secondary">
                  {t('label.finalResult')}
                </span>
                <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-result-text">
                  {details.workedExample.result}
                </span>
              </div>
            </div>
          )}

          {!isDocUtility && (
            <div className="flex items-center gap-2 pt-1 text-xs text-text-tertiary">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{t('msg.ieeePrecision')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'formula',
      title: isDocUtility
        ? isEs
          ? 'Especificaciones de procesamiento y límites'
          : 'Processing details & limitations'
        : t('section.formula') || 'Formula & Methodology',
      subtitle:
        details.formulaName ||
        (isDocUtility
          ? isEs
            ? 'Arquitectura de procesamiento en navegador'
            : 'Browser-local document processing architecture'
          : isEs
          ? 'Modelo matemático y variables'
          : 'Mathematical model and variable definitions'),
      icon: isDocUtility ? FileText : BookOpen,
      content: (
        <div className="space-y-5">
          {details.formulaLatex && (
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-1.5">
              <div className="text-xs font-semibold text-text-secondary">
                {isDocUtility
                  ? isEs
                    ? 'Motor de procesamiento'
                    : 'Processing pipeline'
                  : t('section.mathFormula')}
              </div>
              <div className="text-sm sm:text-base font-mono font-semibold text-text-primary overflow-x-auto py-0.5">
                {details.formulaLatex}
              </div>
            </div>
          )}

          {details.variables && details.variables.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span>{t('section.variables')}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border-main">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>{t('table.symbol')}</th>
                      <th>{t('table.parameter')}</th>
                      <th>{t('table.unit')}</th>
                      <th>{t('table.description')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.variables.map((v, idx) => (
                      <tr key={idx}>
                        <td className="font-mono font-bold text-accent whitespace-nowrap">
                          {v.symbol}
                        </td>
                        <td className="font-medium text-text-primary whitespace-nowrap">
                          {v.name}
                        </td>
                        <td className="text-text-tertiary whitespace-nowrap">
                          {v.unit || '—'}
                        </td>
                        <td className="text-text-secondary leading-relaxed">
                          {v.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {details.assumptions && details.assumptions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-text-secondary">
                {t('section.mathAssumptions')}
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                {details.assumptions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details.limitations && details.limitations.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-text-secondary">
                {t('section.limitations')}
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                {details.limitations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-status-warning font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'faq',
      title: t('section.faq') || 'Frequently Asked Questions',
      subtitle: `${details.faqs?.length || 0} ${isEs ? 'preguntas frecuentes' : 'common questions'}`,
      icon: HelpCircle,
      content:
        details.faqs && details.faqs.length > 0 ? (
          <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden">
            {details.faqs.map((faq, idx) => {
              const isFaqOpen = openFaqs.includes(idx);
              return (
                <div key={idx} className="bg-surface">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-hover transition-colors"
                    aria-expanded={isFaqOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-text-primary">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-150 ${
                        isFaqOpen ? 'rotate-180 text-accent' : ''
                      }`}
                    />
                  </button>
                  {isFaqOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null
    }
  ];

  return (
    <section aria-labelledby="tool-guide-heading" className="space-y-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="tool-guide-heading" className="ui-section-title">
          {isEs ? 'Guía, metodología y preguntas frecuentes' : 'Guide, methodology & FAQs'}
        </h2>
      </div>

      <div className="divide-y divide-border-subtle rounded-2xl border border-border-main bg-surface overflow-hidden">
        {primaryRows.map((sec) => {
          if (!sec.content) return null;
          const isOpen = !!openSections[sec.id];
          const IconComponent = sec.icon;

          return (
            <div key={sec.id}>
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                aria-expanded={isOpen}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-hover/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
                    <IconComponent className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight truncate">
                      {sec.title}
                    </h3>
                    {sec.subtitle && (
                      <p className="text-xs text-text-tertiary truncate mt-0.5">
                        {sec.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-150 ${
                    isOpen ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-border-subtle bg-surface animate-fadeIn">
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
