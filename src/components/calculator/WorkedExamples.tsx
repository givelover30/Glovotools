import { Lightbulb, ArrowRight, Check } from 'lucide-react';
import { CalculatorDetail } from '../../data/calculatorDetails.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface WorkedExamplesProps {
  example: CalculatorDetail['workedExample'];
}

export default function WorkedExamples({ example }: WorkedExamplesProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
          <Lightbulb className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            {t('section.examples')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {example.title}
          </p>
        </div>
      </div>

      {/* Scenario Overview */}
      <div className="text-xs sm:text-sm text-text-secondary leading-relaxed p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-border-subtle">
        <span className="font-semibold text-text-primary mr-1">{t('label.scenario')}</span>
        {example.scenario}
      </div>

      {/* Sample Inputs Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('label.sampleInputs')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Object.entries(example.inputs).map(([key, val], idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-border-subtle bg-white dark:bg-neutral-900 flex flex-col justify-between"
            >
              <span className="text-[11px] text-text-tertiary truncate font-medium">{key}</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step by step solving */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('label.executionSteps')}
        </div>
        <div className="space-y-2">
          {example.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-border-subtle text-xs font-mono text-text-secondary flex items-start gap-2.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Final Result */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t('label.verifiedSolution')}</span>
        </div>
        <div className="text-xs sm:text-sm font-bold font-mono text-emerald-700 dark:text-emerald-200 text-right">
          {example.result}
        </div>
      </div>
    </section>
  );
}
