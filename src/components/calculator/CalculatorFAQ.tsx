import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorFAQProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function CalculatorFAQ({ faqs }: CalculatorFAQProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);
  const { t } = useTranslation();

  const toggle = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-border-subtle">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#16A34A] dark:text-[#22C55E]">
          <HelpCircle className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
            {t('section.faq')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('msg.faqSubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="rounded-xl border border-border-subtle bg-neutral-50/60 dark:bg-neutral-900/40 overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition"
              >
                <span className="text-xs sm:text-sm font-bold text-text-primary">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-subtle/60 animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
