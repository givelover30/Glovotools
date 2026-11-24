import { useState, useEffect } from 'react';
import {
  X,
  Home,
  Calculator,
  Layers,
  Heart,
  Flame,
  BookOpen,
  ArrowRightLeft,
  Wrench,
  Sparkles,
  Calendar,
  ShieldCheck,
  BarChart3,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  Info,
  Scale,
  Mail,
  Grid2X2,
  PanelLeftClose,
  PanelLeftOpen,
  Coins
} from 'lucide-react';
import { AppView, CalculatorId, CalculatorMeta, CategoryId } from '../../types.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { getLocalizedCalculator } from '../../i18n/esTranslations.ts';
import LanguageSelector from './LanguageSelector.tsx';
import CurrencySelector from './CurrencySelector.tsx';

interface SidebarProps {
  /** Mobile drawer open state (< lg) */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  /** Desktop collapsed rail state (lg+) */
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Current navigation state for active highlighting */
  currentView: AppView;
  activeSection: string;
  currentCategoryId?: CategoryId | string | null;
  activeCalculatorId?: CalculatorId | null;
  /** Theme & Data */
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  favoritesCount: number;
  recentCalculators: CalculatorMeta[];
  /** Existing route actions (zero speculative links) */
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateAllCalculators: () => void;
  onNavigatePopular: () => void;
  onNavigateCategoryDetail: (catId: CategoryId | string) => void;
  onNavigateFavorites: () => void;
  onSelectCalculator: (id: CalculatorId) => void;
  onOpenGuidesModal: () => void;
  onNavigateAbout: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
  onNavigateContact: () => void;
}

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  currentView,
  activeSection,
  currentCategoryId,
  activeCalculatorId,
  theme,
  onToggleTheme,
  favoritesCount,
  recentCalculators,
  onNavigateHome,
  onNavigateCategories,
  onNavigateAllCalculators,
  onNavigatePopular,
  onNavigateCategoryDetail,
  onNavigateFavorites,
  onSelectCalculator,
  onOpenGuidesModal,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateContact
}: SidebarProps) {
  const { language, t } = useTranslation();
  const { currency } = useCurrency();
  const [isHubsOpen, setIsHubsOpen] = useState(true);

  // Close mobile drawer on Escape or resize to desktop
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onCloseMobile();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileOpen, onCloseMobile]);

  const primaryItems = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Home,
      isActive: currentView === 'home' && activeSection !== 'popular',
      onClick: () => {
        onNavigateHome();
        onCloseMobile();
      }
    },
    {
      id: 'all-calculators',
      label: t('nav.allTools'),
      icon: Grid2X2,
      isActive: currentView === 'all-calculators',
      onClick: () => {
        onNavigateAllCalculators();
        onCloseMobile();
      }
    },
    {
      id: 'categories',
      label: t('nav.categories'),
      icon: Layers,
      isActive: currentView === 'categories',
      onClick: () => {
        onNavigateCategories();
        onCloseMobile();
      }
    },
    {
      id: 'popular',
      label: t('nav.popularTools'),
      icon: Flame,
      isActive: currentView === 'home' && activeSection === 'popular',
      onClick: () => {
        onNavigatePopular();
        onCloseMobile();
      }
    },
    {
      id: 'favorites',
      label: t('nav.favorites'),
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      isActive: currentView === 'favorites',
      onClick: () => {
        onNavigateFavorites();
        onCloseMobile();
      }
    }
  ];

  const toolboxHubs: { id: string; label: string; icon: any; color: string }[] = [
    { id: 'calculators', label: t('hero.cat.calculators'), icon: Calculator, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'converters', label: t('hero.cat.converters'), icon: ArrowRightLeft, color: 'text-teal-600 dark:text-teal-400' },
    { id: 'checkers', label: t('hero.cat.checkers'), icon: ShieldCheck, color: 'text-green-600 dark:text-green-400' },
    { id: 'generators', label: t('hero.cat.generators'), icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'planners', label: t('hero.cat.planners'), icon: Calendar, color: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'additional-tools', label: t('hero.cat.tools'), icon: Wrench, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'trackers', label: t('hero.cat.trackers'), icon: BarChart3, color: 'text-rose-600 dark:text-rose-400' },
    { id: 'guides', label: t('hero.cat.guides'), icon: BookOpen, color: 'text-amber-600 dark:text-amber-400' }
  ];

  const renderSidebarInner = (compactMode: boolean, isDrawer: boolean) => (
    <div className="h-full flex flex-col justify-between">
      {/* Mobile Drawer Top Header */}
      {isDrawer && (
        <div className="h-14 px-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <img
              src="/assets/aistudio/glovotools_header_logo_exact_size_6f2e1a70.png"
              alt="Glovotools"
              className="block dark:hidden h-7 w-auto object-contain shrink-0 select-none"
            />
            <img
              src="/assets/aistudio/glovotools_dark_mode_transparent_header_FIXED_ded1ad44.png"
              alt="Glovotools"
              className="hidden dark:block h-7 w-auto object-contain shrink-0 select-none"
            />
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={language === 'es' ? 'Cerrar navegación' : 'Close sidebar'}
            className="h-9 w-9 rounded-lg border border-border-main bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrollable Navigation Regions */}
      <nav
        aria-label={isDrawer ? 'Mobile Sidebar Navigation' : 'Sidebar Navigation'}
        className={`flex-1 overflow-y-auto ${compactMode ? 'p-2' : 'p-3'} space-y-5`}
      >
        {/* 1. Primary Workspace Links */}
        <div className="space-y-0.5">
          {!compactMode && (
            <div className="px-2.5 pb-1 text-[11px] font-semibold text-text-tertiary">
              {t('nav.workspace')}
            </div>
          )}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-current={item.isActive ? 'page' : undefined}
                aria-label={item.label}
                title={compactMode ? item.label : undefined}
                className={`w-full ${
                  isDrawer ? 'min-h-[44px]' : 'min-h-[38px]'
                } flex items-center ${
                  compactMode ? 'justify-center px-0' : 'justify-between px-2.5'
                } py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer relative ${
                  item.isActive
                    ? 'bg-surface-selected text-accent font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <span className={`flex items-center ${compactMode ? '' : 'gap-2.5 min-w-0'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      item.isActive ? 'text-accent' : 'text-text-tertiary'
                    }`}
                  />
                  {!compactMode && <span className="truncate">{item.label}</span>}
                </span>
                {!compactMode && item.badge !== undefined && (
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-accent shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>



        {/* 3. Tool Hubs (Collapsible in Expanded Mode, Icon Shortcuts in Collapsed Mode) */}
        <div className="space-y-0.5 pt-3 border-t border-border-subtle">
          {!compactMode ? (
            <button
              type="button"
              onClick={() => setIsHubsOpen((prev) => !prev)}
              aria-expanded={isHubsOpen}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <span>{t('nav.toolHubs')}</span>
              {isHubsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : null}

          {(compactMode || isHubsOpen) && (
            <div className="space-y-0.5 pt-0.5">
              {toolboxHubs.map((hub) => {
                const Icon = hub.icon;
                const isHubActive =
                  hub.id === 'calculators'
                    ? currentView === 'all-calculators'
                    : currentView === 'category-detail' && currentCategoryId === hub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => {
                      if (hub.id === 'calculators') {
                        onNavigateAllCalculators();
                      } else {
                        onNavigateCategoryDetail(hub.id);
                      }
                      onCloseMobile();
                    }}
                    aria-current={isHubActive ? 'page' : undefined}
                    aria-label={hub.label}
                    title={compactMode ? hub.label : undefined}
                    className={`w-full ${
                      isDrawer ? 'min-h-[42px]' : 'min-h-[36px]'
                    } flex items-center ${
                      compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
                    } py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      isHubActive
                        ? 'bg-surface-selected text-accent font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${hub.color} shrink-0`} />
                    {!compactMode && <span className="truncate flex-1 text-left">{hub.label}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Resources & Platform Info */}
        <div className="space-y-0.5 pt-3 border-t border-border-subtle">
          {!compactMode && (
            <div className="px-2.5 pb-1 text-[11px] font-semibold text-text-tertiary">
              {t('nav.resources')}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onOpenGuidesModal();
              onCloseMobile();
            }}
            aria-label={t('nav.guidesArticles')}
            title={compactMode ? t('nav.guidesArticles') : undefined}
            className={`w-full ${
              isDrawer ? 'min-h-[44px]' : 'min-h-[36px]'
            } flex items-center ${
              compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
            } py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer`}
          >
            <BookOpen className="w-4 h-4 text-text-tertiary shrink-0" />
            {!compactMode && (
              <span className="truncate">{t('nav.guidesArticles')}</span>
            )}
          </button>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAbout();
              onCloseMobile();
            }}
            aria-current={currentView === 'about' ? 'page' : undefined}
            aria-label={t('nav.about')}
            title={compactMode ? t('nav.about') : undefined}
            className={`w-full ${
              isDrawer ? 'min-h-[44px]' : 'min-h-[36px]'
            } flex items-center ${
              compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
            } py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              currentView === 'about'
                ? 'bg-surface-selected text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Info className={`w-4 h-4 shrink-0 ${currentView === 'about' ? 'text-accent' : 'text-text-tertiary'}`} />
            {!compactMode && <span className="truncate">{t('nav.about')}</span>}
          </a>
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePrivacy();
              onCloseMobile();
            }}
            aria-current={currentView === 'privacy' ? 'page' : undefined}
            aria-label={t('nav.privacy')}
            title={compactMode ? t('nav.privacy') : undefined}
            className={`w-full ${
              isDrawer ? 'min-h-[44px]' : 'min-h-[36px]'
            } flex items-center ${
              compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
            } py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              currentView === 'privacy'
                ? 'bg-surface-selected text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${currentView === 'privacy' ? 'text-accent' : 'text-text-tertiary'}`} />
            {!compactMode && <span className="truncate">{t('nav.privacy')}</span>}
          </a>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              onNavigateTerms();
              onCloseMobile();
            }}
            aria-current={currentView === 'terms' ? 'page' : undefined}
            aria-label={t('nav.termsOfUse')}
            title={compactMode ? t('nav.termsOfUse') : undefined}
            className={`w-full ${
              isDrawer ? 'min-h-[44px]' : 'min-h-[36px]'
            } flex items-center ${
              compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
            } py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              currentView === 'terms'
                ? 'bg-surface-selected text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Scale className={`w-4 h-4 shrink-0 ${currentView === 'terms' ? 'text-accent' : 'text-text-tertiary'}`} />
            {!compactMode && <span className="truncate">{t('nav.termsOfUse')}</span>}
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigateContact();
              onCloseMobile();
            }}
            aria-current={currentView === 'contact' ? 'page' : undefined}
            aria-label={t('nav.contact')}
            title={compactMode ? t('nav.contact') : undefined}
            className={`w-full ${
              isDrawer ? 'min-h-[44px]' : 'min-h-[36px]'
            } flex items-center ${
              compactMode ? 'justify-center px-0' : 'gap-2.5 px-2.5'
            } py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              currentView === 'contact'
                ? 'bg-surface-selected text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Mail className={`w-4 h-4 shrink-0 ${currentView === 'contact' ? 'text-accent' : 'text-text-tertiary'}`} />
            {!compactMode && <span className="truncate">{t('nav.contact')}</span>}
          </a>
        </div>
      </nav>

      {/* Sidebar Currency Selector Section */}
      <div className="border-t border-border-subtle p-3 shrink-0 bg-surface dark:bg-[#111923]">
        {compactMode ? (
          <div className="flex justify-center">
            <CurrencySelector position="top" compact onlyCode />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-tertiary px-1">
              <Coins className="w-3.5 h-3.5 text-accent" />
              <span>{t('nav.currency')}</span>
            </div>
            <CurrencySelector position="top" onlyCode />
          </div>
        )}
      </div>

      {/* Bottom Utility Footer */}
      <div
        className={`border-t border-border-subtle bg-surface-secondary/50 dark:bg-[#0D141D]/80 shrink-0 ${
          compactMode ? 'p-2 flex flex-col items-center gap-2' : 'p-3 space-y-2'
        }`}
      >
        {compactMode ? (
          <>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="h-9 w-9 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={language === 'es' ? 'Expandir barra lateral' : 'Expand sidebar'}
              title={language === 'es' ? 'Expandir barra lateral' : 'Expand sidebar'}
              className="h-9 w-9 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="h-10 w-10 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <LanguageSelector position="top" />
            </div>
            {!isDrawer && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={language === 'es' ? 'Contraer barra lateral' : 'Collapse sidebar'}
                title={language === 'es' ? 'Contraer barra lateral' : 'Collapse sidebar'}
                className="h-10 w-10 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Collapsible Desktop Left Rail (lg+) */}
      <aside
        id="app-sidebar-desktop"
        aria-label={language === 'es' ? 'Barra lateral de CalcTools' : 'CalcTools Sidebar'}
        className={`hidden lg:block shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-surface dark:bg-[#111923] border-r border-border-main dark:border-[#29384A] transition-[width] duration-200 ease-out ${
          isCollapsed ? 'w-[64px]' : 'w-[244px]'
        }`}
      >
        {renderSidebarInner(isCollapsed, false)}
      </aside>

      {/* Responsive Mobile & Tablet Slide-Over Drawer (< lg) */}
      {isMobileOpen && (
        <div
          id="app-sidebar-drawer"
          className="lg:hidden fixed inset-0 z-[60] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label={language === 'es' ? 'Menú lateral de CalcTools' : 'CalcTools Navigation Drawer'}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 dark:bg-[#070B12]/75 backdrop-blur-[2px] animate-fadeIn"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Opaque Drawer Panel */}
          <div className="relative h-full w-72 max-w-[85vw] bg-surface dark:bg-[#111923] border-r border-border-main dark:border-[#29384A] shadow-2xl animate-slideRight">
            {renderSidebarInner(false, true)}
          </div>
        </div>
      )}
    </>
  );
}
