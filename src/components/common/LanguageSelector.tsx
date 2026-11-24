import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '../../i18n/translations.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface LanguageSelectorProps {
  position?: 'top' | 'bottom';
  compact?: boolean;
}

export default function LanguageSelector({
  position = 'top',
  compact = false
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const dropdownPositionClasses =
    position === 'bottom'
      ? 'absolute top-full mt-2 right-0 w-48'
      : 'absolute bottom-full mb-2 left-0 right-0 w-full sm:w-56';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-1.5 rounded-lg border border-border-main bg-surface hover:bg-surface-hover hover:border-border-strong text-text-primary transition-colors cursor-pointer text-xs font-medium shrink-0 ${
          compact ? 'h-9 px-2.5' : 'min-h-[40px] px-3 w-full'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0" role="img" aria-label={currentLang.name}>
            {currentLang.flag}
          </span>
          <span className="truncate">
            {compact ? currentLang.code.toUpperCase() : currentLang.nativeName}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-tertiary transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className={`${dropdownPositionClasses} rounded-xl bg-surface dark:bg-surface-elevated border border-border-main shadow-xl py-1.5 z-50 animate-fadeIn max-h-72 overflow-y-auto`}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-text-tertiary border-b border-border-subtle mb-1 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-accent" />
            <span>{t('nav.language')}</span>
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-surface-selected text-accent font-semibold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-base shrink-0" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <span className="truncate">{lang.nativeName}</span>
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
