import {
  Sun,
  Moon,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { CalculatorId, CalculatorMeta, CategoryId } from '../types.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import LanguageSelector from './common/LanguageSelector.tsx';
import CurrencySelector from './common/CurrencySelector.tsx';

export type NavSectionId =
  | 'home'
  | 'all-calculators'
  | 'calculators'
  | 'categories'
  | 'converter'
  | 'tools'
  | 'generators'
  | 'planners'
  | 'checkers'
  | 'trackers'
  | 'guides'
  | 'popular'
  | 'favorites'
  | 'blog'
  | 'about';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSection: (section: NavSectionId) => void;
  activeSection: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: () => void;
  onSelectCalculator?: (calcId: CalculatorId) => void;
  onSelectCategory?: (catId: CategoryId | 'all') => void;
  searchResults?: CalculatorMeta[];
  recentCalculators?: CalculatorMeta[];
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  isMobileDrawerOpen?: boolean;
  onToggleMobileDrawer?: () => void;
}

export default function Header({
  theme,
  onToggleTheme,
  onOpenSection,
  activeSection,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onSelectCalculator,
  onSelectCategory,
  searchResults = [],
  recentCalculators = [],
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  isMobileDrawerOpen = false,
  onToggleMobileDrawer
}: HeaderProps) {
  const { language, t } = useTranslation();

  // Compact single-line top navigation mapped strictly to existing working routes
  const navItems: { id: NavSectionId; label: string }[] = [
    { id: 'home', label: t('nav.home') },
    { id: 'all-calculators', label: t('nav.allTools') },
    { id: 'categories', label: t('nav.categories') },
    { id: 'popular', label: t('nav.popular') },
    { id: 'favorites', label: t('nav.favorites') }
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-[#F5F6F8] dark:bg-[#111923]/92 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#29384A] text-text-primary transition-colors">
      <div className="w-full h-full px-2 sm:px-4 lg:px-6 relative flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-6">
        {/* Zone 1: Sidebar Controls + CALCTOOLS Brand Mark */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          {/* Mobile / Tablet Drawer Trigger (< lg) */}
          {onToggleMobileDrawer && (
            <button
              type="button"
              onClick={onToggleMobileDrawer}
              aria-label={
                isMobileDrawerOpen
                  ? language === 'es'
                    ? 'Cerrar menú de navegación'
                    : 'Close navigation sidebar'
                  : language === 'es'
                  ? 'Abrir menú de navegación'
                  : 'Open navigation sidebar'
              }
              aria-expanded={isMobileDrawerOpen}
              aria-controls="app-sidebar-drawer"
              className="lg:hidden h-8 w-8 sm:h-10 sm:w-10 rounded-lg border border-border-main bg-surface hover:bg-surface-hover flex items-center justify-center text-text-primary transition-colors cursor-pointer shrink-0"
            >
              {isMobileDrawerOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}

          {/* Desktop Collapsible Sidebar Rail Toggle (lg+) */}
          {onToggleSidebarCollapse && (
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              aria-label={
                isSidebarCollapsed
                  ? language === 'es'
                    ? 'Expandir barra lateral'
                    : 'Expand sidebar'
                  : language === 'es'
                  ? 'Contraer barra lateral'
                  : 'Collapse sidebar'
              }
              aria-expanded={!isSidebarCollapsed}
              aria-controls="app-sidebar-desktop"
              title={
                isSidebarCollapsed
                  ? language === 'es'
                    ? 'Expandir barra lateral'
                    : 'Expand sidebar'
                  : language === 'es'
                  ? 'Contraer barra lateral'
                  : 'Collapse sidebar'
              }
              className="hidden lg:inline-flex h-9 w-9 rounded-lg border border-transparent hover:border-border-main hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors items-center justify-center cursor-pointer shrink-0"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" />
              )}
            </button>
          )}

          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onOpenSection('home')}
            aria-label="Glovotools Home"
            className="flex items-center text-left group shrink-0 cursor-pointer rounded-lg py-1 pr-1 min-w-0"
          >
            <img
              src="/assets/aistudio/glovotools_header_logo_exact_size_6f2e1a70.png"
              alt="Glovotools"
              className="block dark:hidden h-7 sm:h-8 w-auto object-contain shrink-0 select-none group-hover:scale-[1.02] transition-transform duration-150"
            />
            <img
              src="/assets/aistudio/glovotools_dark_mode_transparent_header_FIXED_ded1ad44.png"
              alt="Glovotools"
              className="hidden dark:block h-7 sm:h-8 w-auto object-contain shrink-0 select-none group-hover:scale-[1.02] transition-transform duration-150"
            />
          </button>
        </div>

        {/* Zone 2: Clean Single-Line Primary Navigation (Desktop lg+) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center justify-center gap-6 absolute left-1/2 -translate-x-1/2"
        >
          {navItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (item.id === 'home' && activeSection === 'home');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Currency, Language & Theme Switch */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <CurrencySelector position="bottom" compact />
            <LanguageSelector position="bottom" compact />
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark'
                ? language === 'es'
                  ? 'Cambiar a modo claro'
                  : 'Switch to light mode'
                : language === 'es'
                ? 'Cambiar a modo oscuro'
                : 'Switch to dark mode'
            }
            title={
              theme === 'dark'
                ? language === 'es'
                  ? 'Modo claro'
                  : 'Light mode'
                : language === 'es'
                ? 'Modo oscuro'
                : 'Dark mode'
            }
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-border-main bg-surface hover:bg-surface-hover hover:border-border-strong flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
