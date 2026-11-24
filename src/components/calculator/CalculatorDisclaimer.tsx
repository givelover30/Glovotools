import { AlertCircle, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { CalculatorDetail } from '../../data/calculatorDetails.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorDisclaimerProps {
  details: CalculatorDetail;
}

export default function CalculatorDisclaimer({ details }: CalculatorDisclaimerProps) {
  const { t } = useTranslation();

  const getBadge = () => {
    switch (details.disclaimerType) {
      case 'financial':
        return {
          icon: Info,
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          title: t('disclaimer.financial')
        };
      case 'health':
        return {
          icon: ShieldAlert,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          title: t('disclaimer.health')
        };
      case 'construction':
        return {
          icon: AlertCircle,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          title: t('disclaimer.construction')
        };
      case 'engineering':
        return {
          icon: AlertCircle,
          color: 'text-cyan-600 dark:text-cyan-400',
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
          title: t('disclaimer.engineering')
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-neutral-50 dark:bg-neutral-900/60 border-border-subtle',
          title: t('disclaimer.standard')
        };
    }
  };

  const badge = getBadge();
  const Icon = badge.icon;

  return (
    <section className="space-y-4">
      {/* Primary Domain Advisory Banner */}
      <div className={`p-5 rounded-2xl border ${badge.bg} flex items-start gap-3.5 shadow-2xs`}>
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${badge.color}`} />
        <div className="space-y-1">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${badge.color}`}>
            {badge.title}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {details.disclaimerText}
          </p>
        </div>
      </div>

      {/* Assumptions & Limitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assumptions */}
        <div className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('section.mathAssumptions')}
          </h4>
          <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
            {details.assumptions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        <div className="bg-white dark:bg-[#151922] border border-border-main rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {t('section.limitations')}
          </h4>
          <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
            {details.limitations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
