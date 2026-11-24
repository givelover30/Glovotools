import { Calculator, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../data/calculators.ts';
import { CategoryId } from '../types.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCategory } from '../i18n/esTranslations.ts';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onOpenAbout: () => void;
  onOpenBlog: () => void;
}

export default function Footer({ onSelectCategory, onOpenAbout, onOpenBlog }: FooterProps) {
  const { language, t } = useTranslation();

  return (
    <footer className="border-t border-border-main bg-surface pt-12 pb-10 transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#16A34A] to-[#0D8A5B] flex items-center justify-center text-white shadow-xs">
                <Calculator className="w-4 h-4 stroke-[2.3]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                Calc<span className="text-accent">Tools</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-text-secondary max-w-sm leading-relaxed">
              {language === 'es'
                ? 'Una colección minimalista y privada de calculadoras en línea fáciles, rápidas y precisas para cálculos cotidianos de finanzas, salud, matemáticas, construcción e ingeniería.'
                : 'A minimalist, privacy-first collection of easy, fast, and accurate online calculators for everyday finance, health, math, construction, and engineering calculations.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-tertiary pt-1">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span>{t('footer.privacyBadge')}</span>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary mb-3.5">
              {t('footer.categories')}
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(c.id)}
                    className="hover:text-text-primary transition-colors cursor-pointer text-left"
                  >
                    {getLocalizedCategory(c, language).title}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="text-accent font-semibold hover:underline cursor-pointer"
                >
                  {language === 'es'
                    ? `Ver las ${CATEGORIES.length} Categorías →`
                    : `View All ${CATEGORIES.length} Categories →`}
                </button>
              </li>
            </ul>
          </div>

          {/* Information Col */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary mb-3.5">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-text-primary transition-colors cursor-pointer"
                >
                  {t('footer.aboutLink')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenBlog}
                  className="hover:text-text-primary transition-colors cursor-pointer"
                >
                  {t('footer.blogLink')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-text-primary transition-colors cursor-pointer"
                >
                  {t('footer.privacyLink')}
                </button>
              </li>
              <li>
                <span className="text-text-tertiary">{t('footer.wcag')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-tertiary gap-3">
          <p>© {new Date().getFullYear()} CalcTools. {t('footer.allClient')}</p>
          <p>{t('footer.builtWith')}</p>
        </div>
      </div>
    </footer>
  );
}
