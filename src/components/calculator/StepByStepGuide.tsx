import { CheckCircle2, ListOrdered } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface StepByStepGuideProps {
  steps: string[];
}

export default function StepByStepGuide({ steps }: StepByStepGuideProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
          <ListOrdered className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            {t('section.steps')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('msg.methodologySubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border-subtle bg-neutral-50/60 dark:bg-neutral-900/40 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
              {idx + 1}
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pt-0.5">
              {step}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 text-xs text-text-tertiary">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{t('msg.ieeePrecision')}</span>
      </div>
    </section>
  );
}
