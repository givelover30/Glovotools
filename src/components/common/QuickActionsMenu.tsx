import { useState, useEffect, useRef } from 'react';
import { Zap, Trash2, Star, ArrowUp, Compass, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CalculatorId } from '../../types.ts';

interface QuickActionsMenuProps {
  onClearRecent: () => void;
  recentCalculatorsCount: number;
  onNavigateAll: () => void;
  onToggleFavorite: (id: CalculatorId) => void;
  favoriteIds: CalculatorId[];
}

export default function QuickActionsMenu({
  onClearRecent,
  recentCalculatorsCount,
  onNavigateAll,
  onToggleFavorite,
  favoriteIds
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFavoriteAllVisible = () => {
    const topPopular = [
      'loan-mortgage',
      'universal-unit-converter',
      'scientific-calc',
      'percentage',
      'bmi',
      'exact-age'
    ] as CalculatorId[];
    topPopular.forEach((id) => {
      if (!favoriteIds.includes(id)) {
        onToggleFavorite(id);
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={menuRef} className="no-print fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div
          role="menu"
          aria-label={language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
          className="mb-3 w-64 rounded-2xl bg-surface dark:bg-surface-elevated border border-border-main shadow-2xl p-2.5 space-y-1.5 animate-fadeIn text-text-primary"
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border-subtle">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={language === 'es' ? 'Cerrar acciones rápidas' : 'Close quick actions'}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {recentCalculatorsCount > 0 && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClearRecent();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  {language === 'es'
                    ? `Borrar Recientes (${recentCalculatorsCount})`
                    : `Clear Recent (${recentCalculatorsCount})`}
                </span>
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                handleFavoriteAllVisible();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span>{language === 'es' ? 'Favorito Populares' : 'Favorite Popular Tools'}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onNavigateAll();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-accent shrink-0" />
              <span>{language === 'es' ? 'Explorar Directorio' : 'Browse Directory'}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                scrollToTop();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-surface-secondary hover:text-accent transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{language === 'es' ? 'Volver Arriba' : 'Scroll to Top'}</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={language === 'es' ? 'Acciones rápidas' : 'Quick Actions'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="w-11 h-11 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white shadow-lg hover:scale-[1.04] active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
      </button>
    </div>
  );
}
