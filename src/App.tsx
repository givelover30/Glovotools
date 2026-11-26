import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import StatBar from './components/StatBar.tsx';
import RecentlyUsed from './components/RecentlyUsed.tsx';
import Favorites from './components/Favorites.tsx';
import CategoryGrid from './components/CategoryGrid.tsx';
import PopularCalculators from './components/PopularCalculators.tsx';
import HomePage from './components/HomePage.tsx';
import CompactToolCard from './components/common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './components/home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './components/home/useToolHoverPreview.ts';
import ReadingProgressBar from './components/common/ReadingProgressBar.tsx';
import GlobalSearchModal from './components/common/GlobalSearchModal.tsx';
const CalculatorView = lazy(() => import('./components/CalculatorView.tsx'));
const CategoriesPage = lazy(() => import('./components/CategoriesPage.tsx'));
const CategoryDetailPage = lazy(() => import('./components/CategoryDetailPage.tsx'));
const AllCalculatorsPage = lazy(() => import('./components/AllCalculatorsPage.tsx'));
const BlogModal = lazy(() => import('./components/BlogModal.tsx'));
const PrivacyPage = lazy(() => import('./components/pages/PrivacyPage.tsx'));
const TermsPage = lazy(() => import('./components/pages/TermsPage.tsx'));
const ContactPage = lazy(() => import('./components/pages/ContactPage.tsx'));
const AboutPage = lazy(() => import('./components/pages/AboutPage.tsx'));
const NotFoundView = lazy(() => import('./components/pages/NotFoundView.tsx'));
import Footer from './components/Footer.tsx';
import BackToTop from './components/common/BackToTop.tsx';
import QuickActionsMenu from './components/common/QuickActionsMenu.tsx';
import GlobalBreadcrumbs from './components/common/GlobalBreadcrumbs.tsx';
import Sidebar from './components/common/Sidebar.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import AppShell from './components/layout/AppShell.tsx';
import { UiLoadingState } from './components/ui/AppPrimitives.tsx';
import { getPrimaryToolHub } from './data/toolClassification.ts';
import { FavoritesService } from './services/FavoritesService.ts';
import { 
  CALCULATORS, 
  CATEGORIES, 
  SUBCATEGORIES,
  getCategoryBySlug,
  getCategoryById,
  getSubcategoryBySlug,
  getSubcategoryById,
  getUniqueRegisteredToolCount
} from './data/calculators.ts';
import { CalculatorId, CategoryId, AppView } from './types.ts';
import Fuse from 'fuse.js';
import { fuzzyMatch } from './utils/fuzzySearch.ts';
import { intentSearch } from './utils/intentSearch.ts';
import { X, LayoutGrid, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from './i18n/I18nContext.tsx';
import { getLocalizedCategory, getLocalizedSubcategory, getLocalizedCalculator } from './i18n/esTranslations.ts';

export function parseUrlPath(pathname: string): {
  view: AppView;
  categoryId: CategoryId | null;
  subcategoryId: string | null;
  calculatorId: CalculatorId | null;
} {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return { view: 'home', categoryId: null, subcategoryId: null, calculatorId: null };
  }
  if (parts.length === 1) {
    if (parts[0] === 'privacy') {
      return { view: 'privacy', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    if (parts[0] === 'terms') {
      return { view: 'terms', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    if (parts[0] === 'contact') {
      return { view: 'contact', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    if (parts[0] === 'about') {
      return { view: 'about', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    if (parts[0] === 'favorites') {
      return { view: 'favorites', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    if (parts[0] === 'all-calculators') {
      return { view: 'all-calculators', categoryId: null, subcategoryId: null, calculatorId: null };
    }
  }
  // /calculators or /categories
  if (parts[0] === 'calculators' || parts[0] === 'categories') {
    if (parts.length === 1) {
      return { view: 'categories', categoryId: null, subcategoryId: null, calculatorId: null };
    }
    const catSlug = parts[1];
    const cat = getCategoryBySlug(catSlug);
    if (cat) {
      if (parts.length === 2) {
        return {
          view: 'category-detail',
          categoryId: cat.id,
          subcategoryId: null,
          calculatorId: null
        };
      }
      if (parts.length === 3) {
        const subcatSlug = parts[2];
        const subcat = getSubcategoryBySlug(cat.slug, subcatSlug);
        if (subcat) {
          return {
            view: 'category-detail',
            categoryId: cat.id,
            subcategoryId: subcat.id,
            calculatorId: null
          };
        }
      }
    }
    return { view: 'not-found', categoryId: null, subcategoryId: null, calculatorId: null };
  }
  // /calculator/:calculatorId
  if (parts[0] === 'calculator' && parts.length === 2 && parts[1]) {
    const calcId = parts[1] as CalculatorId;
    if (CALCULATORS.some((c) => c.id === calcId)) {
      return { view: 'calculator', categoryId: null, subcategoryId: null, calculatorId: calcId };
    }
  }
  return { view: 'not-found', categoryId: null, subcategoryId: null, calculatorId: null };
}

export default function App() {
  const { language, t } = useTranslation();

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calctools_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('calctools_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // View & Routing state
  const initialRoute = typeof window !== 'undefined' ? parseUrlPath(window.location.pathname) : {
    view: 'home' as AppView,
    categoryId: null,
    subcategoryId: null,
    calculatorId: null
  };

  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [currentCategoryId, setCurrentCategoryId] = useState<CategoryId | string | null>(initialRoute.categoryId);
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState<string | null>(initialRoute.subcategoryId);
  const [activeCalculatorId, setActiveCalculatorId] = useState<CalculatorId | null>(initialRoute.calculatorId);

  // Search & Navigation state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllSearchResults, setShowAllSearchResults] = useState<boolean>(false);
  const [searchPage, setSearchPage] = useState<number>(1);

  useEffect(() => {
    setShowAllSearchResults(false);
    setSearchPage(1);
  }, [searchQuery]);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [notFoundPath, setNotFoundPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : ''
  );
  const [isBlogOpen, setIsBlogOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Global search keyboard shortcut (Cmd/Ctrl + /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calctools_sidebar_collapsed');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      return window.innerWidth >= 1024 && window.innerWidth < 1280;
    }
    return false;
  });

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('calctools_sidebar_collapsed', String(next));
      }
      return next;
    });
  }, []);

  // Helper to push SEO-friendly URLs to browser history
  const updateUrl = useCallback((path: string) => {
    if (typeof window !== 'undefined' && (window.location.pathname + window.location.search) !== path) {
      window.history.pushState({}, '', path);
    }
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlPath(window.location.pathname);
      setCurrentView(parsed.view);
      setCurrentCategoryId(parsed.categoryId);
      setCurrentSubcategoryId(parsed.subcategoryId);
      setActiveCalculatorId(parsed.calculatorId);
      setNotFoundPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    console.log(`[CALCTOOLS REGISTRY AUDIT] Registered Categories: ${CATEGORIES.length}, Subcategories: ${SUBCATEGORIES.length}, Calculators: ${CALCULATORS.length}`);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO metadata update for all 300 calculators, categories, and directories
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://calctools.app';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = `${origin}${pathname}`;

    let title = 'CalcTools – Free Online Calculators for Math, Finance & Science';
    let description = 'Explore 300+ free online calculators for mathematics, finance, business, construction, health, and engineering with step-by-step solutions.';

    if (currentView === 'calculator' && activeCalculatorId) {
      const calc = CALCULATORS.find(c => c.id === activeCalculatorId);
      const cat = calc ? CATEGORIES.find(cat => cat.id === calc.category) : null;
      if (calc) {
        const catTitle = cat ? cat.title : 'Calculators';
        title = `${calc.name} – ${catTitle} | CalcTools`;
        description = `${calc.shortDesc} Free online ${calc.name.toLowerCase()} with instant results and step-by-step formula breakdown on CalcTools.`;
      }
    } else if (currentView === 'category-detail' && currentCategoryId) {
      const cat = CATEGORIES.find(c => c.id === currentCategoryId);
      if (cat) {
        title = `${cat.title} – Free Online Tools | CalcTools`;
        description = `${cat.description} Browse all free ${cat.title.toLowerCase()} on CalcTools.`;
      }
    } else if (currentView === 'categories' || currentView === 'all-calculators') {
      const uniqueActiveTools = getUniqueRegisteredToolCount();
      title =
        currentView === 'all-calculators'
          ? `Explore All Tools – ${uniqueActiveTools.toLocaleString()}+ Free Calculators & Utilities | CalcTools`
          : `All Categories Directory – ${CATEGORIES.length} Tool Categories | CalcTools`;
      description = `Browse ${uniqueActiveTools.toLocaleString()}+ free online calculators, converters, generators, and PDF utilities across ${CATEGORIES.length} categories on CalcTools.`;
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'CalcTools' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ];

    for (const tag of ogTags) {
      const selector = tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (tag.property) el.setAttribute('property', tag.property);
        if (tag.name) el.setAttribute('name', tag.name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', tag.content);
    }

    // Dynamic Schema.org JSON-LD Structured Data
    document.querySelectorAll('script[type="application/ld+json"][data-seo-schema]').forEach(el => el.remove());

    const schemas: any[] = [];
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'CalcTools',
      'url': origin,
      'description': 'Explore 300+ free online calculators across 14 categories.'
    });

    if (currentView === 'calculator' && activeCalculatorId) {
      const calc = CALCULATORS.find(c => c.id === activeCalculatorId);
      const cat = calc ? CATEGORIES.find(cat => cat.id === calc.category) : null;
      if (calc) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': calc.name,
          'applicationCategory': 'CalculatorApplication',
          'operatingSystem': 'All',
          'url': canonicalUrl,
          'description': calc.shortDesc,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          }
        });

        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': cat ? cat.title : 'Categories',
              'item': `${origin}/calculators${cat ? '/' + cat.slug : ''}`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': calc.name,
              'item': canonicalUrl
            }
          ]
        });
      }
    }

    for (const schemaObj of schemas) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', 'true');
      script.text = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    }
  }, [currentView, currentCategoryId, activeCalculatorId]);

  // Navigation handlers
  const navigateToHome = useCallback(() => {
    setCurrentView('home');
    setActiveCalculatorId(null);
    setCurrentCategoryId(null);
    setCurrentSubcategoryId(null);
    setActiveSection('home');
    updateUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const navigateToCategories = useCallback(() => {
    setCurrentView('categories');
    setActiveCalculatorId(null);
    setCurrentCategoryId(null);
    setCurrentSubcategoryId(null);
    setActiveSection('categories');
    updateUrl('/calculators');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calctools:categories-reset'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const navigateToAllCalculators = useCallback(() => {
    setCurrentView('all-calculators');
    setActiveCalculatorId(null);
    setCurrentCategoryId(null);
    setCurrentSubcategoryId(null);
    setActiveSection('all-calculators');
    updateUrl('/all-calculators');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const navigateToFavorites = useCallback(() => {
    setCurrentView('favorites');
    setActiveCalculatorId(null);
    setCurrentCategoryId(null);
    setCurrentSubcategoryId(null);
    setActiveSection('favorites');
    updateUrl('/favorites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const navigateToCategoryDetail = useCallback((catId: CategoryId | string, subcatId?: string | null) => {
    const cat = getCategoryById(catId);
    setCurrentView('category-detail');
    setCurrentCategoryId(catId);
    setCurrentSubcategoryId(subcatId || null);
    setActiveCalculatorId(null);
    setActiveSection('categories');

    if (subcatId) {
      const subcat = getSubcategoryById(subcatId);
      updateUrl(`/calculators/${cat?.slug || catId}/${subcat?.slug || subcatId}`);
    } else {
      updateUrl(`/calculators/${cat?.slug || catId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const navigateToStaticRoute = useCallback(
    (view: 'privacy' | 'terms' | 'contact' | 'about', path: string) => {
      setCurrentView(view);
      setActiveCalculatorId(null);
      setCurrentCategoryId(null);
      setCurrentSubcategoryId(null);
      setActiveSection(view);
      updateUrl(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateUrl]
  );

  const navigateToPrivacy = useCallback(
    () => navigateToStaticRoute('privacy', '/privacy'),
    [navigateToStaticRoute]
  );
  const navigateToTerms = useCallback(
    () => navigateToStaticRoute('terms', '/terms'),
    [navigateToStaticRoute]
  );
  const navigateToContact = useCallback(
    () => navigateToStaticRoute('contact', '/contact'),
    [navigateToStaticRoute]
  );
  const navigateToAbout = useCallback(
    () => navigateToStaticRoute('about', '/about'),
    [navigateToStaticRoute]
  );

  // Recently Used state (tracks last 10 unique calculators interacted with)
  const [recentIds, setRecentIds] = useState<CalculatorId[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calctools_recent_calculators');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((id) => CALCULATORS.some((c) => c.id === id));
            if (valid.length > 0) return valid.slice(0, 10);
          }
        } catch {
          // fallback to defaults
        }
      }
    }
    return ['bmi', 'loan-mortgage', 'area-shapes'];
  });

  // Usage frequency counts for recentIds (used to rank Trending Searches in real time)
  const [recentUsageCounts, setRecentUsageCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (typeof window !== 'undefined') {
      const savedCounts = localStorage.getItem('calctools_recent_usage_counts');
      if (savedCounts) {
        try {
          const parsed = JSON.parse(savedCounts);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            for (const [k, v] of Object.entries(parsed)) {
              if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
                initial[k] = v;
              }
            }
          }
        } catch {
          // ignore malformed storage
        }
      }
    }
    for (const id of recentIds) {
      if (!initial[id]) initial[id] = 1;
    }
    return initial;
  });

  const recordRecentUsage = useCallback((id: CalculatorId) => {
    setRecentIds((prev) => {
      const updated = [id, ...prev.filter((item) => item !== id)].slice(0, 10);
      localStorage.setItem('calctools_recent_calculators', JSON.stringify(updated));
      return updated;
    });
    setRecentUsageCounts((prev) => {
      const updated = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem('calctools_recent_usage_counts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recentCalculators = useMemo(() => {
    return recentIds
      .map((id) => CALCULATORS.find((c) => c.id === id))
      .filter((c): c is typeof CALCULATORS[number] => Boolean(c));
  }, [recentIds]);

  const handleClearRecent = () => {
    setRecentIds([]);
    setRecentUsageCounts({});
    localStorage.removeItem('calctools_recent_calculators');
    localStorage.removeItem('calctools_recent_usage_counts');
  };

  // Global Favorites state via FavoritesService
  const [globalFavorites, setGlobalFavorites] = useState(() => FavoritesService.getFavorites());

  const favoriteIds = globalFavorites.calculators;

  const favoriteCalculators = useMemo(() => {
    return globalFavorites.calculators
      .map((id) => CALCULATORS.find((c) => c.id === id))
      .filter((c): c is typeof CALCULATORS[number] => Boolean(c));
  }, [globalFavorites.calculators]);

  const favoriteCategories = useMemo(() => {
    return globalFavorites.categories
      .map((id) => CATEGORIES.find((cat) => cat.id === id))
      .filter((cat): cat is typeof CATEGORIES[number] => Boolean(cat));
  }, [globalFavorites.categories]);

  const favoriteSubcategories = useMemo(() => {
    return globalFavorites.subcategories
      .map((subId) => {
        const sub = SUBCATEGORIES.find((s) => s.id === subId);
        const cat = sub ? CATEGORIES.find((c) => c.id === sub.categoryId) : null;
        if (sub && cat) return { subcategory: sub, category: cat };
        return null;
      })
      .filter((item): item is { subcategory: typeof SUBCATEGORIES[number]; category: typeof CATEGORIES[number] } => Boolean(item));
  }, [globalFavorites.subcategories]);

  const handleToggleFavorite = (id: CalculatorId) => {
    const updated = FavoritesService.toggleCalculator(id);
    setGlobalFavorites(updated);
  };

  const handleToggleFavoriteCat = (id: CategoryId) => {
    const updated = FavoritesService.toggleCategory(id);
    setGlobalFavorites(updated);
  };

  const handleToggleFavoriteSubcat = (id: string) => {
    const updated = FavoritesService.toggleSubcategory(id);
    setGlobalFavorites(updated);
  };

  const handleClearAllFavorites = () => {
    const updated = FavoritesService.clearAll();
    setGlobalFavorites(updated);
  };

  const {
    hoverPreviewState: searchHoverPreviewState,
    handleCardHoverEnter: handleSearchCardHoverEnter,
    handleCardHoverLeave: handleSearchCardHoverLeave,
    handleModalMouseEnter: handleSearchModalMouseEnter,
    handleModalMouseLeave: handleSearchModalMouseLeave,
    closePreview: closeSearchPreview
  } = useToolHoverPreview();

  const navigateToCalculator = useCallback((id: CalculatorId) => {
    setActiveCalculatorId(id);
    setCurrentView('calculator');
    updateUrl(`/calculator/${id}`);
    recordRecentUsage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl, recordRecentUsage]);

  // Robust fuzzy matching search filter using Fuse.js (deduplicated by canonical ID)
  const fuse = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueCalculators = CALCULATORS.filter((calc) => {
      if (!calc?.id || seenIds.has(calc.id)) return false;
      seenIds.add(calc.id);
      return true;
    });
    return new Fuse(uniqueCalculators, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'shortDesc', weight: 0.25 },
        { name: 'formula', weight: 0.1 },
        { name: 'tags', weight: 0.1 },
        { name: 'category', weight: 0.025 },
        { name: 'subcategoryId', weight: 0.025 }
      ],
      includeScore: true,
      threshold: 0.4, // Robust typo tolerance
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, []);

  const searchCatalog = useCallback(
    (query: string) => {
      return intentSearch(query, CALCULATORS);
    },
    []
  );

  const searchResults = useMemo(() => {
    return searchCatalog(searchQuery);
  }, [searchQuery, searchCatalog]);

  const activeCalculator = useMemo(() => {
    if (!activeCalculatorId) return null;
    return CALCULATORS.find((c) => c.id === activeCalculatorId) || null;
  }, [activeCalculatorId]);

  const handleOpenSection = (section: any) => {
    setActiveSection(section);
    if (section === 'about') {
      navigateToAbout();
      return;
    }
    if (section === 'blog') {
      setIsBlogOpen(true);
      return;
    }
    if (section === 'categories') {
      navigateToCategories();
      return;
    }
    if (section === 'converter') {
      navigateToCategoryDetail('converter');
      return;
    }
    if (section === 'tools') {
      navigateToCategoryDetail('tools');
      return;
    }
    if (section === 'all-calculators') {
      navigateToAllCalculators();
      return;
    }
    if (section === 'home' || section === 'calculators') {
      navigateToHome();
      return;
    }
    if (section === 'generators') {
      navigateToCategoryDetail('generators' as any);
      return;
    }
    if (section === 'planners') {
      navigateToCategoryDetail('planners' as any);
      return;
    }
    if (section === 'checkers') {
      navigateToCategoryDetail('checkers' as any);
      return;
    }
    if (section === 'favorites') {
      navigateToFavorites();
      return;
    }
    if (section === 'popular') {
      if (currentView !== 'home') {
        navigateToHome();
        setTimeout(() => {
          const el = document.getElementById('popular');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('popular');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCategoryGridSelect = (catId: CategoryId) => {
    if (catId === 'all') {
      navigateToCategories();
    } else {
      navigateToCategoryDetail(catId);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setTimeout(() => {
        const el = document.getElementById('filtered-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const resolvedActiveSection =
    currentView === 'favorites'
      ? 'favorites'
      : currentView === 'all-calculators'
      ? 'all-calculators'
      : currentView === 'categories' || currentView === 'category-detail'
      ? 'categories'
      : currentView === 'calculator' ||
        currentView === 'privacy' ||
        currentView === 'terms' ||
        currentView === 'contact' ||
        currentView === 'about' ||
        currentView === 'not-found'
      ? ''
      : currentView === 'home' && activeSection === 'popular'
      ? 'popular'
      : currentView === 'home'
      ? 'home'
      : activeSection;

  const navigateToPopular = useCallback(() => {
    handleOpenSection('popular');
  }, [currentView, navigateToHome]);

  return (
    <>
      <AppShell
        skipLabel={language === 'es' ? 'Ir al contenido principal' : 'Skip to main content'}
        readingProgress={currentView === 'calculator' ? <ReadingProgressBar /> : null}
        header={
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onSelectCalculator={navigateToCalculator}
            onSelectCategory={handleCategoryGridSelect}
            searchResults={searchResults}
            recentCalculators={recentCalculators}
            onOpenSection={handleOpenSection}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={handleToggleSidebarCollapse}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
            activeSection={resolvedActiveSection}
          />
        }
        sidebar={
          <Sidebar
            isMobileOpen={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
            currentView={currentView}
            activeSection={resolvedActiveSection}
            currentCategoryId={currentCategoryId}
            activeCalculatorId={activeCalculatorId}
            theme={theme}
            onToggleTheme={toggleTheme}
            favoritesCount={favoriteIds.length}
            recentCalculators={recentCalculators}
            onNavigateHome={navigateToHome}
            onNavigateCategories={navigateToCategories}
            onNavigateAllCalculators={navigateToAllCalculators}
            onNavigatePopular={navigateToPopular}
            onNavigateCategoryDetail={navigateToCategoryDetail}
            onNavigateFavorites={navigateToFavorites}
            onSelectCalculator={navigateToCalculator}
            onOpenGuidesModal={() => setIsBlogOpen(true)}
            onNavigateAbout={navigateToAbout}
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateTerms={navigateToTerms}
            onNavigateContact={navigateToContact}
          />
        }
        breadcrumbs={
          <GlobalBreadcrumbs
            currentView={currentView}
            selectedCategory={
              currentCategoryId
                ? getCategoryById(currentCategoryId)
                : activeCalculator
                ? getCategoryById(activeCalculator.category)
                : null
            }
            activeCalculator={activeCalculator}
            onNavigateHome={navigateToHome}
            onNavigateCategories={navigateToCategories}
            onNavigateCategory={(catId) => {
              if (catId) navigateToCategoryDetail(catId);
              else navigateToCategories();
            }}
            onNavigateSubcategory={(catId, subId) => {
              if (catId) navigateToCategoryDetail(catId, subId);
            }}
          />
        }
        footer={
          <Footer
            onSelectCategory={(catId) => {
              if (catId === 'all') {
                navigateToCategories();
              } else {
                navigateToCategoryDetail(catId);
              }
            }}
            onNavigateAbout={navigateToAbout}
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateTerms={navigateToTerms}
            onNavigateContact={navigateToContact}
            onOpenBlog={() => setIsBlogOpen(true)}
          />
        }
      >
        <ErrorBoundary
          scope="app"
          resetKey={`${currentView}:${currentCategoryId ?? ''}:${currentSubcategoryId ?? ''}:${activeCalculatorId ?? ''}:${notFoundPath}`}
          onNavigateHome={navigateToHome}
          onNavigateAllTools={navigateToAllCalculators}
          language={language}
        >
        <Suspense fallback={<UiLoadingState rows={3} label={language === 'es' ? 'Cargando vista...' : 'Loading view...'} />}>
          {/* VIEW 1: Active Calculator View (Inline Workspace on Homepage) */}
          {currentView === 'calculator' && activeCalculator ? (
            <CalculatorView
              calculator={activeCalculator}
              onBack={navigateToHome}
              onSelectCalculator={navigateToCalculator}
              onNavigateHome={navigateToHome}
              onNavigateAllTools={navigateToAllCalculators}
              onNavigateCategories={navigateToCategories}
              onNavigateCategory={(catId) => navigateToCategoryDetail(catId)}
              onNavigateSubcategory={(catId, subId) => navigateToCategoryDetail(catId, subId)}
              isFavorite={globalFavorites.calculators.includes(activeCalculator.id)}
              onToggleFavorite={handleToggleFavorite}
              favoriteIds={favoriteIds}
            />
          ) : currentView === 'categories' ? (
          /* VIEW 2: Dedicated Categories Page */
          <CategoriesPage
            onSelectCategory={(catId, subcatId) => navigateToCategoryDetail(catId, subcatId)}
            onSelectCalculator={navigateToCalculator}
            onBackToHome={navigateToHome}
            favoriteCategoryIds={globalFavorites.categories}
            onToggleFavoriteCat={handleToggleFavoriteCat}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : currentView === 'favorites' ? (
          <Favorites
            globalFavorites={globalFavorites}
            favoriteCalculators={favoriteCalculators}
            favoriteCategories={favoriteCategories}
            favoriteSubcategories={favoriteSubcategories}
            onSelectCalculator={navigateToCalculator}
            onSelectCategory={(catId) => navigateToCategoryDetail(catId)}
            onSelectSubcategory={(catId, subId) => navigateToCategoryDetail(catId, subId)}
            onToggleFavoriteCalc={handleToggleFavorite}
            onToggleFavoriteCat={handleToggleFavoriteCat}
            onToggleFavoriteSubcat={handleToggleFavoriteSubcat}
            onClearAll={handleClearAllFavorites}
            onUpdateFavorites={(favs) => {
              FavoritesService.saveFavorites(favs);
              setGlobalFavorites(favs);
            }}
          />
        ) : currentView === 'all-calculators' ? (
          <AllCalculatorsPage
            onSelectCalculator={navigateToCalculator}
            onSelectCategory={(catId) => navigateToCategoryDetail(catId)}
            onNavigateCategories={navigateToCategories}
            searchCatalog={searchCatalog}
            favoriteIds={favoriteIds}
            recentIds={recentIds}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : currentView === 'category-detail' && currentCategoryId ? (
          /* VIEW 3: Dedicated Category Detail Page */
          <CategoryDetailPage
            categoryId={currentCategoryId}
            activeSubcategoryId={currentSubcategoryId}
            onSelectSubcategory={(subcatId) => {
              setCurrentSubcategoryId(subcatId);
              const cat = getCategoryById(currentCategoryId);
              if (subcatId) {
                const subcat = getSubcategoryById(subcatId);
                updateUrl(`/calculators/${cat?.slug || currentCategoryId}/${subcat?.slug || subcatId}`);
              } else {
                updateUrl(`/calculators/${cat?.slug || currentCategoryId}`);
              }
            }}
            onSelectCalculator={navigateToCalculator}
            onBackToCategories={navigateToCategories}
            onBackToHome={navigateToHome}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : currentView === 'privacy' ? (
          <PrivacyPage
            onNavigateHome={navigateToHome}
            onNavigateTerms={navigateToTerms}
            onNavigateContact={navigateToContact}
          />
        ) : currentView === 'terms' ? (
          <TermsPage
            onNavigateHome={navigateToHome}
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateContact={navigateToContact}
          />
        ) : currentView === 'contact' ? (
          <ContactPage
            onNavigateHome={navigateToHome}
            onNavigateAbout={navigateToAbout}
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateTerms={navigateToTerms}
          />
        ) : currentView === 'about' ? (
          <AboutPage
            onNavigateHome={navigateToHome}
            onNavigateAllCalculators={navigateToAllCalculators}
            onNavigateCategories={navigateToCategories}
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateTerms={navigateToTerms}
          />
        ) : currentView === 'not-found' ? (
          <NotFoundView
            requestedPath={notFoundPath}
            onNavigateHome={navigateToHome}
            onNavigateAllCalculators={navigateToAllCalculators}
            onNavigateCategories={navigateToCategories}
          />
        ) : (
          /* VIEW 4: Main Landing Page Redesigned to Match Reference */
          <>
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              searchResults={searchResults}
              recentIds={recentIds}
              recentUsageCounts={recentUsageCounts}
              onSelectCalculator={navigateToCalculator}
              onSelectCategory={handleCategoryGridSelect}
              onBrowseAllTools={navigateToAllCalculators}
            />

            {/* Dynamic Filtered/Directory Section (shown when user searches in Hero) */}
            {searchQuery.trim() !== '' && (
              <section id="filtered-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border-subtle mt-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                      {language === 'es' ? `Resultados de búsqueda para "${searchQuery}"` : `Search results for "${searchQuery}"`}
                    </h2>
                    <p className="text-xs text-text-secondary mt-1 tabular-nums">
                      {language === 'es'
                        ? `Se encontraron ${searchResults.length} herramienta${searchResults.length === 1 ? '' : 's'}`
                        : `Found ${searchResults.length} tool${searchResults.length === 1 ? '' : 's'} matching your query`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-main bg-surface text-text-secondary hover:text-text-primary hover:border-slate-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'Limpiar Búsqueda' : 'Clear Search'}</span>
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-12 text-center ui-card p-6 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {language === 'es' ? 'No se encontraron calculadoras' : 'No calculators matched your search'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {language === 'es'
                          ? 'Pruebe con palabras clave como "hipoteca", "porcentaje", "imc", o "concreto"'
                          : 'Try keywords like "mortgage", "percentage", "bmi", or "concrete"'}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                      <span className="text-text-secondary">
                        {language === 'es' ? '¿No encuentra lo que necesita?' : "Can't find what you need?"}
                      </span>
                      <button
                        type="button"
                        onClick={navigateToAllCalculators}
                        className="font-semibold text-accent hover:underline cursor-pointer"
                      >
                        {language === 'es' ? 'Ver todas las herramientas' : 'Browse All Tools'}
                      </button>
                      <span className="text-text-tertiary">·</span>
                      <button
                        type="button"
                        onClick={navigateToContact}
                        className="font-semibold text-accent hover:underline cursor-pointer"
                      >
                        {language === 'es' ? 'Solicitar herramienta / Contactar' : 'Request tool / Contact us'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {searchResults.slice((searchPage - 1) * 12, searchPage * 12).map((rawC) => {
                        const c = getLocalizedCalculator(rawC, language);
                        const isFav = favoriteIds.includes(c.id);
                        const rawCat = CATEGORIES.find((catItem) => catItem.id === c.category);
                        const cat = rawCat ? getLocalizedCategory(rawCat, language) : null;
                        const rawSubcat = SUBCATEGORIES.find((s) => s.id === c.subcategoryId);
                        const subcat = rawSubcat ? getLocalizedSubcategory(rawSubcat, language) : null;

                        return (
                          <CompactToolCard
                            key={c.id}
                            tool={c}
                            categoryLabel={cat?.title || c.category}
                            subcategoryLabel={subcat?.name}
                            isFavorite={isFav}
                            onSelect={navigateToCalculator}
                            onToggleFavorite={handleToggleFavorite}
                            favoriteAddLabel={language === 'es' ? 'Agregar a favoritos' : 'Save to favorites'}
                            favoriteRemoveLabel={language === 'es' ? 'Eliminar de favoritos' : 'Remove from favorites'}
                            onHoverEnter={handleSearchCardHoverEnter}
                            onHoverLeave={handleSearchCardHoverLeave}
                            isPreviewActive={searchHoverPreviewState?.tool.id === c.id}
                          />
                        );
                      })}
                    </div>

                    {Math.ceil(searchResults.length / 12) > 1 && (
                      <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-text-secondary tabular-nums">
                          {language === 'es'
                            ? `Mostrando página ${searchPage} de ${Math.ceil(searchResults.length / 12)} (${searchResults.length} resultados totales)`
                            : `Showing page ${searchPage} of ${Math.ceil(searchResults.length / 12)} (${searchResults.length} total results)`}
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchPage((p) => Math.max(1, p - 1));
                              const el = document.getElementById('filtered-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            disabled={searchPage === 1}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border-main bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>{language === 'es' ? 'Anterior' : 'Previous'}</span>
                          </button>

                          <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: Math.ceil(searchResults.length / 12) }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setSearchPage(p);
                                  const el = document.getElementById('filtered-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-8 h-8 text-xs font-semibold rounded-xl border transition-colors cursor-pointer tabular-nums flex items-center justify-center ${
                                  searchPage === p
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-border-main bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSearchPage((p) => Math.min(Math.ceil(searchResults.length / 12), p + 1));
                              const el = document.getElementById('filtered-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            disabled={searchPage === Math.ceil(searchResults.length / 12)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border-main bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>{language === 'es' ? 'Siguiente' : 'Next'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            <HomePage
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              searchResults={searchResults}
              onSelectCalculator={navigateToCalculator}
              onTrackCalculatorUsage={recordRecentUsage}
              onSelectCategory={handleCategoryGridSelect}
              onBrowseAllTools={navigateToAllCalculators}
              onNavigateFavorites={navigateToFavorites}
              onNavigateContact={navigateToContact}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              recentIds={recentIds}
              recentUsageCounts={recentUsageCounts}
              recentCalculators={recentCalculators}
              onClearRecent={handleClearRecent}
              favoriteCalculators={favoriteCalculators}
            />
          </>
        )}
        </Suspense>
        </ErrorBoundary>
      </AppShell>

      {/* Modals for Resources */}
      <Suspense fallback={null}>
        <BlogModal
          isOpen={isBlogOpen}
          onClose={() => setIsBlogOpen(false)}
          onSelectCalculator={navigateToCalculator}
        />
      </Suspense>

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectCalculator={navigateToCalculator}
      />

      {/* Floating Quick Actions Menu */}
      <QuickActionsMenu
        onClearRecent={handleClearRecent}
        recentCalculatorsCount={recentCalculators.length}
        onNavigateAll={navigateToAllCalculators}
        onToggleFavorite={handleToggleFavorite}
        favoriteIds={favoriteIds}
      />

      {/* Floating Action Button: Back To Top */}
      <BackToTop />
    </>
  );
}

