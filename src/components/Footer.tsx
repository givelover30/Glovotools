import { ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../data/calculators.ts';
import { CategoryId } from '../types.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import { getLocalizedCategory } from '../i18n/esTranslations.ts';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onNavigateAbout: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
  onNavigateContact: () => void;
  onOpenBlog: () => void;
}

export default function Footer({
  onSelectCategory,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateContact,
  onOpenBlog
}: FooterProps) {
  const { language, t } = useTranslation();

  return (
    <footer className="border-t border-border-main bg-surface dark:bg-[#111923] pt-12 pb-10 transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center">
              <img
                src="/assets/aistudio/glovotools_header_logo_exact_size_6f2e1a70.png"
                alt="Glovotools"
                className="block dark:hidden h-8 w-auto object-contain shrink-0 select-none"
              />
              <img
                src="/assets/aistudio/glovotools_dark_mode_transparent_header_FIXED_ded1ad44.png"
                alt="Glovotools"
                className="hidden dark:block h-8 w-auto object-contain shrink-0 select-none"
              />
            </div>
            <p className="text-xs sm:text-[13px] text-text-secondary max-w-sm leading-relaxed">
              {t('footer.tagline')}
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
                  {t('footer.viewAllCategories')}
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
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateAbout();
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer inline-block"
                >
                  {t('footer.aboutLink')}
                </a>
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
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePrivacy();
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer inline-block"
                >
                  {t('footer.privacyLink')}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateTerms();
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer inline-block"
                >
                  {t('nav.termsOfUse')}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateContact();
                  }}
                  className="hover:text-text-primary transition-colors cursor-pointer inline-block"
                >
                  {t('nav.contact')}
                </a>
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
