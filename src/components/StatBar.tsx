import { Calculator, Layers, Zap, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext.tsx';

export default function StatBar() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Calculator,
      title: t('statbar.comprehensiveTitle'),
      subtitle: t('statbar.comprehensiveSub')
    },
    {
      icon: Layers,
      title: t('statbar.organizedTitle'),
      subtitle: t('statbar.organizedSub')
    },
    {
      icon: Zap,
      title: t('statbar.freeTitle'),
      subtitle: t('statbar.freeSub')
    },
    {
      icon: ShieldCheck,
      title: t('statbar.privacyTitle'),
      subtitle: t('statbar.privacySub')
    }
  ];

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="ui-card rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-center">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 min-w-0 ${
                  idx < stats.length - 1
                    ? 'xl:border-r xl:border-border-subtle xl:pr-6'
                    : ''
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center shrink-0 text-accent">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold tracking-tight text-text-primary truncate">
                    {stat.title}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5 truncate">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
