import { BookOpen, Layers } from 'lucide-react';
import { CalculatorDetail } from '../../data/calculatorDetails.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface FormulaExplanationProps {
  details: CalculatorDetail;
}

export default function FormulaExplanation({ details }: FormulaExplanationProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
          <BookOpen className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            {t('section.formula')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {details.formulaName}
          </p>
        </div>
      </div>

      {/* Primary Mathematical Expression */}
      <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
        <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
          {t('section.mathFormula')}
        </div>
        <div className="text-base sm:text-lg lg:text-xl font-mono font-bold text-text-primary tracking-wide overflow-x-auto py-1">
          {details.formulaLatex}
        </div>
      </div>

      {/* Variables Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
          <Layers className="w-4 h-4 text-emerald-500" />
          <span>{t('section.variables')}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/70 border-b border-border-subtle text-text-secondary font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">{t('table.symbol')}</th>
                <th className="py-2.5 px-3.5">{t('table.parameter')}</th>
                <th className="py-2.5 px-3.5">{t('table.unit')}</th>
                <th className="py-2.5 px-3.5">{t('table.description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {details.variables.map((v, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition">
                  <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {v.symbol}
                  </td>
                  <td className="py-2.5 px-3.5 font-medium text-text-primary whitespace-nowrap">
                    {v.name}
                  </td>
                  <td className="py-2.5 px-3.5 text-text-tertiary whitespace-nowrap">
                    {v.unit || '—'}
                  </td>
                  <td className="py-2.5 px-3.5 text-text-secondary leading-relaxed">
                    {v.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
