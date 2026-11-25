import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Activity,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Briefcase,
  Calculator as CalcIcon,
  Calendar,
  CheckCircle,
  ChevronRight,
  Cpu,
  FileText,
  FlaskConical,
  Hash,
  Layers,
  ListFilter,
  Rocket,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X
} from 'lucide-react';
import {
  CATEGORIES,
  SUBCATEGORIES,
  CALCULATORS
} from '../data/calculators.ts';
import {
  TOOL_HUBS,
  ToolHubTitle,
  getPrimaryToolHub,
  getHubSubjectCategoryAssociations,
  HubSubjectCategoryAssociation
} from '../data/toolClassification.ts';
import { CategoryId, CalculatorId, CalculatorMeta, CategoryMeta } from '../types.ts';
import CalculatorIcon from './common/CalculatorIcon.tsx';
import { FavoritesService } from '../services/FavoritesService.ts';
import { useTranslation } from '../i18n/I18nContext.tsx';
import {
  getLocalizedCategory,
  getLocalizedSubcategory,
  getLocalizedCalculator
} from '../i18n/esTranslations.ts';
import CompactToolCard from './common/CompactToolCard.tsx';
import ToolHoverPreviewModal from './home/ToolHoverPreviewModal.tsx';
import { useToolHoverPreview } from './home/useToolHoverPreview.ts';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: CategoryId, subcategoryId?: string) => void;
  onSelectCalculator: (calculatorId: CalculatorId) => void;
  onBackToHome: () => void;
  favoriteCategoryIds?: CategoryId[];
  onToggleFavoriteCat?: (catId: CategoryId) => void;
  favoriteIds?: CalculatorId[];
  onToggleFavorite?: (calcId: CalculatorId) => void;
}

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'count-desc';

function getToolHubSlug(hubTitle: ToolHubTitle): string {
  return hubTitle
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readHubParamFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get('hub');
  return param ? param.trim() : null;
}

interface HubVisualConfig {
  icon: React.ElementType;
  color: string;
  surfaceClass: string;
  borderClass: string;
  descEn: string;
  descEs: string;
  labelEs: string;
}

const HUB_VISUAL_CONFIG: Record<ToolHubTitle, HubVisualConfig> = {
  'Calculators': {
    icon: CalcIcon,
    color: '#10B981',
    surfaceClass: 'bg-[#F0FBF6] dark:bg-emerald-950/25',
    borderClass: 'border-[#CFEFE0] dark:border-emerald-800/45',
    descEn: 'Core mathematical, financial, engineering, construction, health, and scientific calculation tools.',
    descEs: 'Herramientas matemáticas, financieras, de ingeniería, construcción, salud y ciencia.',
    labelEs: 'Calculadoras'
  },
  'Converters': {
    icon: ArrowRightLeft,
    color: '#D97706',
    surfaceClass: 'bg-[#FFF8EE] dark:bg-amber-950/20',
    borderClass: 'border-[#F7DFBE] dark:border-amber-800/40',
    descEn: 'Convert measurement units, currencies, time zones, codecs, and technical data formats.',
    descEs: 'Convierte unidades de medida, monedas, zonas horarias, códigos y formatos de datos.',
    labelEs: 'Conversores'
  },
  'Generators': {
    icon: Sparkles,
    color: '#9333EA',
    surfaceClass: 'bg-[#F7F1FF] dark:bg-violet-950/25',
    borderClass: 'border-[#E3D3FF] dark:border-violet-800/45',
    descEn: 'Generate secure passwords, QR codes, UUIDs, CSS styles, SEO tags, and mock datasets.',
    descEs: 'Genera contraseñas seguras, códigos QR, UUIDs, estilos CSS, etiquetas SEO y datos de prueba.',
    labelEs: 'Generadores'
  },
  'Planners': {
    icon: Calendar,
    color: '#0891B2',
    surfaceClass: 'bg-[#EFFAFF] dark:bg-cyan-950/25',
    borderClass: 'border-[#C9ECF8] dark:border-cyan-800/45',
    descEn: 'Plan monthly budgets, meals, travel itineraries, projects, renovations, and schedules.',
    descEs: 'Planifica presupuestos, comidas, itinerarios de viaje, proyectos, renovaciones y horarios.',
    labelEs: 'Planificadores'
  },
  'Trackers': {
    icon: Activity,
    color: '#DB2777',
    surfaceClass: 'bg-[#FFF1F5] dark:bg-rose-950/25',
    borderClass: 'border-[#FAD2DF] dark:border-rose-800/45',
    descEn: 'Track daily habits, sleep, workouts, water intake, expenses, bills, and maintenance logs.',
    descEs: 'Registra hábitos diarios, sueño, entrenamientos, hidratación, gastos, facturas y mantenimiento.',
    labelEs: 'Rastreadores'
  },
  'Counters': {
    icon: Hash,
    color: '#2563EB',
    surfaceClass: 'bg-[#EFF5FF] dark:bg-blue-950/25',
    borderClass: 'border-[#CFE0FF] dark:border-blue-800/45',
    descEn: 'Count financial milestones, days, words, items, metrics, and recurring quantities.',
    descEs: 'Cuenta hitos financieros, días, palabras, elementos, métricas y cantidades recurrentes.',
    labelEs: 'Contadores'
  },
  'Analyzers': {
    icon: BarChart3,
    color: '#4F46E5',
    surfaceClass: 'bg-[#F2F3FF] dark:bg-indigo-950/25',
    borderClass: 'border-[#D8DCFF] dark:border-indigo-800/45',
    descEn: 'Analyze business margins, financial performance, statistics, and operational trends.',
    descEs: 'Analiza márgenes comerciales, rendimiento financiero, estadísticas y tendencias operativas.',
    labelEs: 'Analizadores'
  },
  'Checkers': {
    icon: CheckCircle,
    color: '#059669',
    surfaceClass: 'bg-[#F0FBF6] dark:bg-emerald-950/25',
    borderClass: 'border-[#CFEFE0] dark:border-emerald-800/45',
    descEn: 'Check text diffs, syntax rules, password strength, contrast ratios, and SEO compliance.',
    descEs: 'Verifica diferencias de texto, sintaxis, seguridad de contraseñas, contraste y SEO.',
    labelEs: 'Verificadores'
  },
  'Validators': {
    icon: ShieldCheck,
    color: '#047857',
    surfaceClass: 'bg-[#EEFBF5] dark:bg-teal-950/25',
    borderClass: 'border-[#C9ECD9] dark:border-teal-800/45',
    descEn: 'Validate JSON, YAML, TOML, CSV, IBAN, ISBN, email, URLs, IP subnets, and card numbers.',
    descEs: 'Valida JSON, YAML, TOML, CSV, IBAN, ISBN, correos, URLs, subredes IP y tarjetas.',
    labelEs: 'Validadores'
  },
  'Estimators': {
    icon: CalcIcon,
    color: '#D97706',
    surfaceClass: 'bg-[#FFF8EE] dark:bg-amber-950/20',
    borderClass: 'border-[#F7DFBE] dark:border-amber-800/40',
    descEn: 'Estimate construction materials, taxes, labor costs, project sizing, and resource needs.',
    descEs: 'Estima materiales de construcción, impuestos, costos laborales y recursos de proyectos.',
    labelEs: 'Estimadores'
  },
  'Finders': {
    icon: Search,
    color: '#2563EB',
    surfaceClass: 'bg-[#EFF5FF] dark:bg-blue-950/25',
    borderClass: 'border-[#CFE0FF] dark:border-blue-800/45',
    descEn: 'Look up reference parameters, rates, dates, conversion factors, and quick utility values.',
    descEs: 'Encuentra parámetros de referencia, tasas, fechas, factores de conversión y valores clave.',
    labelEs: 'Buscadores'
  },
  'Comparators': {
    icon: Scale,
    color: '#7C3AED',
    surfaceClass: 'bg-[#F7F1FF] dark:bg-violet-950/25',
    borderClass: 'border-[#E3D3FF] dark:border-violet-800/45',
    descEn: 'Compare financial options, lease vs. buy scenarios, vehicles, and side-by-side metrics.',
    descEs: 'Compara opciones financieras, arrendamiento vs. compra, vehículos y métricas lado a lado.',
    labelEs: 'Comparadores'
  },
  'Optimizers': {
    icon: Rocket,
    color: '#EA580C',
    surfaceClass: 'bg-[#FFF5EE] dark:bg-orange-950/20',
    borderClass: 'border-[#FADBC7] dark:border-orange-800/40',
    descEn: 'Optimize business pricing, material yield, energy efficiency, and financial outcomes.',
    descEs: 'Optimiza precios comerciales, rendimiento de materiales, energía y resultados financieros.',
    labelEs: 'Optimizadores'
  },
  'Simulators': {
    icon: Cpu,
    color: '#0284C7',
    surfaceClass: 'bg-[#EFF8FF] dark:bg-sky-950/25',
    borderClass: 'border-[#CBE6FA] dark:border-sky-800/45',
    descEn: 'Simulate compound growth, mortgage payoffs, energy systems, and multi-year scenarios.',
    descEs: 'Simula crecimiento compuesto, pagos de hipoteca, sistemas de energía y escenarios futuros.',
    labelEs: 'Simuladores'
  },
  'Testers': {
    icon: FlaskConical,
    color: '#4F46E5',
    surfaceClass: 'bg-[#F2F3FF] dark:bg-indigo-950/25',
    borderClass: 'border-[#D8DCFF] dark:border-indigo-800/45',
    descEn: 'Test regular expressions, statistical hypotheses, technical inputs, and format rules.',
    descEs: 'Prueba expresiones regulares, hipótesis estadísticas, entradas técnicas y reglas de formato.',
    labelEs: 'Probadores'
  },
  'Document & PDF': {
    icon: FileText,
    color: '#E11D48',
    surfaceClass: 'bg-[#FFF1F3] dark:bg-rose-950/25',
    borderClass: 'border-[#FAD3DA] dark:border-rose-800/45',
    descEn: 'Merge, split, compress, rotate, watermark, and convert PDF and office documents locally.',
    descEs: 'Une, divide, comprime, rota, marca con agua y convierte documentos PDF en tu navegador.',
    labelEs: 'Documentos y PDF'
  },
  'Editors': {
    icon: Wrench,
    color: '#2563EB',
    surfaceClass: 'bg-[#EFF5FF] dark:bg-blue-950/25',
    borderClass: 'border-[#CFE0FF] dark:border-blue-800/45',
    descEn: 'Edit financial inputs, text snippets, structured records, and practical utility data.',
    descEs: 'Edita datos financieros, fragmentos de texto, registros estructurados y utilidades.',
    labelEs: 'Editores'
  },
  'Formatters': {
    icon: ListFilter,
    color: '#059669',
    surfaceClass: 'bg-[#F0FBF6] dark:bg-emerald-950/25',
    borderClass: 'border-[#CFEFE0] dark:border-emerald-800/45',
    descEn: 'Format code, structured text, numbers, technical notations, and document layouts cleanly.',
    descEs: 'Formatea código, texto estructurado, números, notaciones técnicas y diseños limpios.',
    labelEs: 'Formateadores'
  },
  'Organizers': {
    icon: Layers,
    color: '#9333EA',
    surfaceClass: 'bg-[#F7F1FF] dark:bg-violet-950/25',
    borderClass: 'border-[#E3D3FF] dark:border-violet-800/45',
    descEn: 'Organize personal goals, business workflows, home inventory, and recurring checklists.',
    descEs: 'Organiza metas personales, flujos de trabajo, inventarios del hogar y listas de control.',
    labelEs: 'Organizadores'
  },
  'Business & Management': {
    icon: Briefcase,
    color: '#1D4ED8',
    surfaceClass: 'bg-[#EFF5FF] dark:bg-blue-950/25',
    borderClass: 'border-[#CFE0FF] dark:border-blue-800/45',
    descEn: 'Loans, mortgages, taxes, cash flow, ROI, break-even analysis, and corporate operations.',
    descEs: 'Préstamos, hipotecas, impuestos, flujo de caja, ROI, punto de equilibrio y gestión empresarial.',
    labelEs: 'Negocios y Gestión'
  },
  'Guides & References': {
    icon: BookOpen,
    color: '#2563EB',
    surfaceClass: 'bg-[#EFF6FF] dark:bg-blue-950/25',
    borderClass: 'border-[#DBEAFE] dark:border-blue-800/45',
    descEn: 'Comprehensive reference guides, periodic tables, math formulas, status codes, and cheat sheets.',
    descEs: 'Guías de referencia completas, tabla periódica, fórmulas matemáticas, códigos de estado y hojas de trucos.',
    labelEs: 'Guías y Referencias'
  }
};

interface HubDirectoryRecord {
  title: ToolHubTitle;
  config: HubVisualConfig;
  uniqueTools: CalculatorMeta[];
  uniqueCount: number;
  rawCount: number;
  coreCategories: HubSubjectCategoryAssociation[];
}

export default function CategoriesPage({
  onSelectCategory,
  onSelectCalculator,
  onBackToHome,
  favoriteCategoryIds: propFavs,
  onToggleFavoriteCat: propToggle,
  favoriteIds: propFavoriteIds,
  onToggleFavorite: propToggleFavoriteCalc
}: CategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [requestedHubParam, setRequestedHubParam] = useState<string | null>(() => readHubParamFromUrl());
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [hubCurrentPage, setHubCurrentPage] = useState(1);
  const { language, t } = useTranslation();
  const isEs = language === 'es';
  const topRef = useRef<HTMLDivElement>(null);
  const {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  } = useToolHoverPreview();

  useEffect(() => {
    const syncFromUrl = () => {
      setRequestedHubParam(readHubParamFromUrl());
      setHubSearchQuery('');
      setHubCurrentPage(1);
    };
    const handleResetHub = () => {
      setRequestedHubParam(null);
      setHubSearchQuery('');
      setHubCurrentPage(1);
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('calctools:categories-reset', handleResetHub);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('calctools:categories-reset', handleResetHub);
    };
  }, []);

  const [localFavs, setLocalFavs] = useState<CategoryId[]>(() => {
    try {
      const saved = localStorage.getItem('calctools_favorite_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localToolFavs, setLocalToolFavs] = useState<CalculatorId[]>(() =>
    FavoritesService.getFavorites().calculators
  );

  const activeFavs = propFavs || localFavs;
  const activeToolFavs = propFavoriteIds || localToolFavs;

  const handleToggleFavorite = (catId: CategoryId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (propToggle) {
      propToggle(catId);
    } else {
      const updated = localFavs.includes(catId)
        ? localFavs.filter((id) => id !== catId)
        : [...localFavs, catId];
      setLocalFavs(updated);
      try {
        localStorage.setItem('calctools_favorite_categories', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleToggleToolFavorite = (calcId: CalculatorId) => {
    if (propToggleFavoriteCalc) {
      propToggleFavoriteCalc(calcId);
    } else {
      const updated = FavoritesService.toggleCalculator(calcId);
      setLocalToolFavs(updated.calculators);
    }
  };

  // Build verified Tool Hubs directory strictly from existing TOOL_HUBS + CALCULATORS + getPrimaryToolHub(calc)
  // Deduplicates by unique tool ID (first occurrence) so sum of unique counts across all 20 hubs === 4,375
  // Derives verified subject-category associations via getHubSubjectCategoryAssociations without modifying hub assignments
  const { hubRecords, totalUniqueTools } = useMemo(() => {
    const uniqueToolsMap = new Map<ToolHubTitle, CalculatorMeta[]>();
    const rawCountsMap = new Map<ToolHubTitle, number>();

    for (const hub of TOOL_HUBS) {
      uniqueToolsMap.set(hub, []);
      rawCountsMap.set(hub, 0);
    }

    const seenUniqueIds = new Set<string>();

    for (const calc of CALCULATORS) {
      const hub = getPrimaryToolHub(calc);
      rawCountsMap.set(hub, (rawCountsMap.get(hub) || 0) + 1);

      if (!seenUniqueIds.has(calc.id)) {
        seenUniqueIds.add(calc.id);
        uniqueToolsMap.get(hub)?.push(calc);
      }
    }

    const records: HubDirectoryRecord[] = TOOL_HUBS.map((title) => {
      const uniqueTools = uniqueToolsMap.get(title) || [];
      const coreCategories = getHubSubjectCategoryAssociations(title, CALCULATORS, CATEGORIES);

      return {
        title,
        config: HUB_VISUAL_CONFIG[title],
        uniqueTools,
        uniqueCount: uniqueTools.length,
        rawCount: rawCountsMap.get(title) || 0,
        coreCategories
      };
    });

    return {
      hubRecords: records,
      totalUniqueTools: seenUniqueIds.size
    };
  }, []);

  // Filter Tool Hubs by search query (matches hub name, localized label, description, or mapped subject categories)
  const filteredHubs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hubRecords;

    return hubRecords.filter((hub) => {
      const desc = isEs ? hub.config.descEs : hub.config.descEn;
      const localizedTitle = isEs ? hub.config.labelEs : hub.title;
      const categoryMatch = hub.coreCategories.some(({ category }) => {
        const locCat = getLocalizedCategory(category, language);
        return (
          locCat.title.toLowerCase().includes(q) ||
          category.title.toLowerCase().includes(q) ||
          category.id.toLowerCase().includes(q)
        );
      });

      return (
        hub.title.toLowerCase().includes(q) ||
        localizedTitle.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        categoryMatch
      );
    });
  }, [hubRecords, searchQuery, isEs, language]);

  // Filter and sort all 49 existing Subject Categories (100% preserved behavior)
  const filteredAndSortedCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const list = CATEGORIES.map((c) => getLocalizedCategory(c, language)).filter((cat) => {
      if (!q) return true;
      const subcats = SUBCATEGORIES.filter((s) => s.categoryId === cat.id);
      const subcatMatch = subcats.some(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
      const catCalcs = CALCULATORS.filter((c) => c.category === cat.id);
      const calcMatch = catCalcs.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortDesc.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(q)))
      );

      return (
        cat.title.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        subcatMatch ||
        calcMatch
      );
    });

    switch (sortOption) {
      case 'name-asc':
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return [...list].sort((a, b) => b.title.localeCompare(a.title));
      case 'count-desc':
        return [...list].sort((a, b) => b.count - a.count);
      default:
        return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }, [searchQuery, sortOption, language]);

  const activeHubRecord = useMemo(() => {
    if (!requestedHubParam) return null;
    const normalized = requestedHubParam.trim().toLowerCase();
    return (
      hubRecords.find(
        (h) =>
          h.title === requestedHubParam ||
          h.title.toLowerCase() === normalized ||
          getToolHubSlug(h.title) === normalized
      ) || null
    );
  }, [requestedHubParam, hubRecords]);

  // All hooks MUST run unconditionally at the top level before any conditional return
  const filteredHubTools = useMemo(() => {
    if (!activeHubRecord) return [];
    const q = hubSearchQuery.toLowerCase().trim();
    if (!q) return activeHubRecord.uniqueTools;
    return activeHubRecord.uniqueTools.filter((tool) => {
      const loc = getLocalizedCalculator(tool, language);
      const cat = CATEGORIES.find((c) => c.id === tool.category);
      const locCat = cat ? getLocalizedCategory(cat, language) : null;
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.shortDesc.toLowerCase().includes(q) ||
        tool.id.toLowerCase().includes(q) ||
        (locCat && locCat.title.toLowerCase().includes(q)) ||
        (tool.tags && tool.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    });
  }, [activeHubRecord, hubSearchQuery, language]);

  const hubPageSize = 24;
  const totalHubPages = Math.ceil(filteredHubTools.length / hubPageSize) || 1;

  const paginatedHubTools = useMemo(() => {
    const start = (hubCurrentPage - 1) * hubPageSize;
    return filteredHubTools.slice(start, start + hubPageSize);
  }, [filteredHubTools, hubCurrentPage, hubPageSize]);

  const handleOpenHub = (hubTitle: ToolHubTitle) => {
    const slug = getToolHubSlug(hubTitle);
    setRequestedHubParam(slug);
    setHubSearchQuery('');
    setHubCurrentPage(1);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/categories') ? '/categories' : '/calculators';
      const targetUrl = `${basePath}?hub=${encodeURIComponent(slug)}`;
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseHub = () => {
    setRequestedHubParam(null);
    setHubSearchQuery('');
    setHubCurrentPage(1);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/categories') ? '/categories' : '/calculators';
      if (window.location.pathname + window.location.search !== basePath) {
        window.history.pushState({}, '', basePath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Explicit Error State when an invalid / unresolvable hub identifier is requested
  if (requestedHubParam && !activeHubRecord) {
    return (
      <div ref={topRef} className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="rounded-2xl border border-border-main bg-surface p-8 sm:p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              {isEs ? 'Centro de Herramientas No Encontrado' : 'Tool Hub Not Found'}
            </h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              {isEs
                ? `No se pudo resolver el identificador de centro "${requestedHubParam}". Selecciona uno de los 20 centros en el directorio.`
                : `We could not resolve the requested tool hub identifier "${requestedHubParam}". Choose one of the 20 hubs from the directory.`}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCloseHub}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {isEs ? 'Volver al Directorio de Centros de Herramientas' : 'Back to Tool Hubs Directory'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Active Hub View (Clean Tool Card Grid with search, pagination, subject categories, and SaaS cards)
  if (activeHubRecord) {
    const activeLabel = isEs ? activeHubRecord.config.labelEs : activeHubRecord.title;
    const activeDesc = isEs ? activeHubRecord.config.descEs : activeHubRecord.config.descEn;
    const HubIcon = activeHubRecord.config.icon;

    return (
      <div ref={topRef} className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-subtle">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <button
              type="button"
              onClick={handleCloseHub}
              className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {isEs ? 'Volver al Directorio de Centros de Herramientas' : 'Back to Tool Hubs Directory'}
              </span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="font-semibold text-text-primary">{activeLabel}</span>
          </div>

          <div className="text-xs font-mono tabular-nums text-text-tertiary">
            <strong className="text-text-primary">{activeHubRecord.uniqueCount.toLocaleString()}</strong>{' '}
            {isEs ? 'herramientas únicas' : 'unique tools'}
          </div>
        </div>

        {/* Hub Header Card */}
        <div className="rounded-2xl border border-border-main bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 shadow-sm"
              style={{
                backgroundColor: `color-mix(in srgb, ${activeHubRecord.config.color} 15%, transparent)`,
                color: activeHubRecord.config.color
              }}
            >
              <HubIcon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2] dark:brightness-125" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                {activeLabel}
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                {activeDesc}
              </p>
            </div>
          </div>

          {/* Compact Search within Hub */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search
              className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label={isEs ? `Buscar en ${activeLabel}` : `Search within ${activeLabel}`}
              placeholder={
                isEs
                  ? `Buscar en ${activeLabel.toLowerCase()}...`
                  : `Search ${activeLabel.toLowerCase()}...`
              }
              value={hubSearchQuery}
              onChange={(e) => {
                setHubSearchQuery(e.target.value);
                setHubCurrentPage(1);
              }}
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-surface-secondary border border-border-main text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent shadow-2xs transition-colors"
            />
            {hubSearchQuery && (
              <button
                type="button"
                onClick={() => setHubSearchQuery('')}
                aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Relevant Subject Categories Quick Access for this Hub */}
        {activeHubRecord.coreCategories.length > 0 && (
          <div className="rounded-2xl border border-border-main bg-surface p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold text-text-primary">
                {isEs
                  ? `Categorías temáticas relacionadas en ${activeLabel}`
                  : `Related Subject Categories in ${activeLabel}`}
              </h2>
              <span className="text-xs text-text-tertiary tabular-nums">
                {activeHubRecord.coreCategories.length}{' '}
                {isEs ? 'categorías' : 'categories'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeHubRecord.coreCategories.map(({ category, count }) => {
                const localizedCat = getLocalizedCategory(category, language);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main bg-surface-secondary/70 hover:bg-surface-hover hover:border-accent/60 text-xs font-medium text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{localizedCat.title}</span>
                    <span className="font-mono tabular-nums text-[11px] text-text-tertiary">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-text-secondary px-1">
          <div>
            {isEs ? 'Mostrando' : 'Showing'}{' '}
            <strong className="text-text-primary font-mono tabular-nums">
              {filteredHubTools.length}
            </strong>{' '}
            {filteredHubTools.length === 1 ? (isEs ? 'herramienta' : 'tool') : (isEs ? 'herramientas' : 'tools')}
            {hubSearchQuery && (
              <span>
                {' '}{isEs ? `para "${hubSearchQuery}"` : `matching "${hubSearchQuery}"`}
              </span>
            )}
          </div>
          {hubSearchQuery && (
            <button
              type="button"
              onClick={() => setHubSearchQuery('')}
              className="font-semibold text-accent hover:underline cursor-pointer"
            >
              {isEs ? 'Limpiar filtro' : 'Clear filter'}
            </button>
          )}
        </div>

        {/* Tool Cards Grid */}
        {filteredHubTools.length === 0 ? (
          <div className="rounded-2xl border border-border-main bg-surface p-12 text-center space-y-3">
            {activeHubRecord.uniqueTools.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-text-primary">
                  {isEs
                    ? `No hay herramientas registradas actualmente en ${activeLabel}`
                    : `No tools are currently assigned to ${activeLabel}`}
                </p>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Vuelve al Directorio de Centros de Herramientas para explorar otros centros activos.'
                    : 'Return to the Tool Hubs Directory to explore other active hubs.'}
                </p>
                <button
                  type="button"
                  onClick={handleCloseHub}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-main bg-surface-secondary hover:bg-surface-hover text-xs font-semibold text-text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Volver al Directorio' : 'Back to Tool Hubs Directory'}</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary">
                  {isEs
                    ? `No se encontraron herramientas en ${activeLabel} para "${hubSearchQuery}"`
                    : `No tools matched "${hubSearchQuery}" in ${activeLabel}`}
                </p>
                <p className="text-xs text-text-secondary">
                  {isEs ? 'Intenta con otro término de búsqueda.' : 'Try another search term.'}
                </p>
                <button
                  type="button"
                  onClick={() => setHubSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-main bg-surface-secondary hover:bg-surface-hover text-xs font-semibold text-text-primary transition-colors cursor-pointer"
                >
                  {isEs ? 'Limpiar búsqueda' : 'Clear search'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {paginatedHubTools.map((rawTool) => {
              const tool = getLocalizedCalculator(rawTool, language);
              const cat = CATEGORIES.find((c) => c.id === rawTool.category);
              const localizedCat = cat ? getLocalizedCategory(cat, language) : null;

              return (
                <CompactToolCard
                  key={rawTool.id}
                  tool={tool}
                  categoryLabel={localizedCat?.title || activeLabel}
                  isFavorite={activeToolFavs.includes(rawTool.id)}
                  onSelect={onSelectCalculator}
                  onToggleFavorite={handleToggleToolFavorite}
                  favoriteAddLabel={isEs ? 'Agregar a favoritos' : 'Save to favorites'}
                  favoriteRemoveLabel={isEs ? 'Quitar de favoritos' : 'Remove from favorites'}
                  onHoverEnter={handleCardHoverEnter}
                  onHoverLeave={handleCardHoverLeave}
                  isPreviewActive={hoverPreviewState?.tool.id === rawTool.id}
                />
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalHubPages > 1 && (
          <nav aria-label="Hub tools pagination" className="flex items-center justify-between pt-6 border-t border-border-subtle">
            <div className="text-xs text-text-secondary tabular-nums">
              {isEs ? 'Página' : 'Page'} <strong className="text-text-primary">{hubCurrentPage}</strong> {isEs ? 'de' : 'of'} <strong className="text-text-primary">{totalHubPages}</strong> ({filteredHubTools.length} {isEs ? 'herramientas' : 'tools'})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setHubCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={hubCurrentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-border-main bg-surface text-xs font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isEs ? 'Anterior' : 'Previous'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHubCurrentPage((p) => Math.min(totalHubPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={hubCurrentPage === totalHubPages}
                className="px-3.5 py-2 rounded-xl border border-border-main bg-surface text-xs font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isEs ? 'Siguiente' : 'Next'}
              </button>
            </div>
          </nav>
        )}
        {hoverPreviewState && (
          <ToolHoverPreviewModal
            tool={hoverPreviewState.tool}
            categoryLabel={hoverPreviewState.categoryLabel}
            anchorRect={hoverPreviewState.anchorRect}
            isFavorite={activeToolFavs.includes(hoverPreviewState.tool.id)}
            onClose={closePreview}
            onSelect={onSelectCalculator}
            onToggleFavorite={handleToggleToolFavorite}
            onMouseEnter={handleModalMouseEnter}
            onMouseLeave={handleModalMouseLeave}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={topRef} className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
      {/* TOP HEADER: Tool Hubs Categories Directory */}
      <header className="space-y-5 pb-6 border-b border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? 'Volver al Inicio' : (t('btn.back') || 'Back to Home')}</span>
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary text-balance">
              {isEs ? 'Directorio de Centros de Herramientas y Categorías' : 'Tool Hubs Categories Directory'}
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              {isEs
                ? 'Explora todos los centros de herramientas de CALCTOOLS y descubre calculadoras, conversores, verificadores, generadores, planificadores y otras utilidades prácticas en un solo lugar.'
                : 'Explore all CALCTOOLS tool hubs and discover calculators, converters, checkers, generators, planners, and other practical utilities in one place.'}
            </p>

            {/* Clean unboxed summary metadata */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-text-secondary tabular-nums">
              <span>
                <strong className="font-semibold text-text-primary">{TOOL_HUBS.length}</strong>{' '}
                {isEs ? 'centros de herramientas' : 'tool hubs'}
              </span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>
                <strong className="font-semibold text-text-primary">
                  {totalUniqueTools.toLocaleString()}
                </strong>{' '}
                {isEs ? 'herramientas únicas' : 'unique tools'}
              </span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>
                <strong className="font-semibold text-text-primary">{CATEGORIES.length}</strong>{' '}
                {isEs ? 'categorías temáticas' : 'subject categories'}
              </span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>
                <strong className="font-semibold text-text-primary">{SUBCATEGORIES.length}</strong>{' '}
                {isEs ? 'subcategorías' : 'subcategories'}
              </span>
            </div>
          </div>

          {/* Search & Quick Section Jump Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="relative min-w-[260px] sm:w-80">
              <Search
                className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                aria-label={isEs ? 'Buscar centros de herramientas y categorías' : 'Search tool hubs and categories'}
                placeholder={
                  isEs
                    ? 'Buscar centros, categorías o herramientas...'
                    : 'Search tool hubs, categories, or tools...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface border border-border-main text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-secondary border border-border-subtle self-start sm:self-auto">
              <button
                type="button"
                onClick={() => scrollToSection('tool-hubs-directory')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary bg-surface border border-border-main/80 shadow-2xs hover:text-accent transition-colors cursor-pointer whitespace-nowrap"
              >
                {isEs ? `Centros (${filteredHubs.length})` : `Tool Hubs (${filteredHubs.length})`}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('subject-categories-directory')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                {isEs
                  ? `Categorías (${filteredAndSortedCategories.length})`
                  : `Categories (${filteredAndSortedCategories.length})`}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================
          SECTION 1 — TOOL HUBS DIRECTORY (20 Verified Tool Hubs)
         ======================================================================== */}
      <section
        id="tool-hubs-directory"
        aria-labelledby="tool-hubs-heading"
        className="space-y-5 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <h2 id="tool-hubs-heading" className="text-xl font-bold tracking-tight text-text-primary">
              {isEs ? 'Directorio de Centros de Herramientas' : 'Tool Hubs Directory'}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              {isEs
                ? 'Explora los 20 centros especializados por tipo de herramienta, con conteos únicos y acceso directo a sus categorías temáticas.'
                : 'Browse all 20 specialized hubs organized by tool type, with unique tool counts and direct access to related subject categories.'}
            </p>
          </div>
          <div className="text-xs text-text-tertiary font-mono tabular-nums shrink-0">
            {filteredHubs.length} / {TOOL_HUBS.length} {isEs ? 'centros' : 'hubs'}
            {' · '}
            {filteredHubs
              .reduce((sum, hub) => sum + hub.uniqueCount, 0)
              .toLocaleString()}{' '}
            {isEs ? 'herramientas' : 'tools'}
          </div>
        </div>

        {filteredHubs.length === 0 ? (
          <div className="rounded-2xl border border-border-main bg-surface p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-text-primary">
              {isEs
                ? `No se encontraron centros de herramientas para "${searchQuery}"`
                : `No tool hubs matched "${searchQuery}"`}
            </p>
            <p className="text-xs text-text-secondary">
              {isEs
                ? 'Intenta con otro término o revisa las categorías temáticas a continuación.'
                : 'Try another keyword or check matching subject categories below.'}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-main bg-surface-secondary hover:bg-surface-hover text-xs font-semibold text-text-primary transition-colors cursor-pointer"
            >
              {isEs ? 'Limpiar búsqueda' : 'Clear search'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHubs.map((hub) => {
              const HubIcon = hub.config.icon;
              const hubLabel = isEs ? hub.config.labelEs : hub.title;
              const hubDesc = isEs ? hub.config.descEs : hub.config.descEn;
              const topCategories = hub.coreCategories.slice(0, 3);
              const extraCategoryCount = Math.max(0, hub.coreCategories.length - topCategories.length);

              return (
                <div
                  key={hub.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenHub(hub.title)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenHub(hub.title);
                    }
                  }}
                  aria-label={`${hubLabel} — ${hub.uniqueCount.toLocaleString()} ${isEs ? 'herramientas' : 'tools'}`}
                  className={`rounded-2xl border ${hub.config.borderClass} ${hub.config.surfaceClass} p-5 flex flex-col justify-between gap-4 hover:border-accent hover:shadow-md transition-all duration-150 cursor-pointer group`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Hub Icon + Exact Unique Tool Count */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 shadow-2xs group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${hub.config.color} 15%, transparent)`,
                          color: hub.config.color
                        }}
                      >
                        <HubIcon className="w-5 h-5 stroke-[2.1] dark:brightness-125" />
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono tabular-nums text-text-primary leading-tight">
                          {hub.uniqueCount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {hub.uniqueCount === 1
                            ? (isEs ? 'herramienta' : 'tool')
                            : (isEs ? 'herramientas' : 'tools')}
                        </div>
                      </div>
                    </div>

                    {/* Hub Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors leading-snug">
                        {hubLabel}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {hubDesc}
                      </p>
                    </div>

                    {/* Relevant Subject Categories */}
                    {topCategories.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="text-[11px] font-medium text-text-tertiary">
                          {isEs ? 'Categorías principales' : 'Key categories'}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-text-secondary leading-snug">
                          {topCategories.map(({ category }, idx) => {
                            const localizedCat = getLocalizedCategory(category, language);
                            return (
                              <React.Fragment key={category.id}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectCategory(category.id);
                                  }}
                                  className="hover:text-accent hover:underline transition-colors text-left cursor-pointer truncate max-w-[180px]"
                                  title={localizedCat.title}
                                >
                                  {localizedCat.title}
                                </button>
                                {(idx < topCategories.length - 1 || extraCategoryCount > 0) && (
                                  <span aria-hidden="true" className="text-text-tertiary">·</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                          {extraCategoryCount > 0 && (
                            <span className="text-text-tertiary font-mono tabular-nums">
                              +{extraCategoryCount} {isEs ? 'más' : 'more'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Coverage + Emerald Explore Hub Action */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 text-xs">
                    <span className="text-text-tertiary tabular-nums">
                      {hub.coreCategories.length}{' '}
                      {hub.coreCategories.length === 1
                        ? (isEs ? 'categoría' : 'category')
                        : (isEs ? 'categorías' : 'categories')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenHub(hub.title);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5 transition-transform whitespace-nowrap cursor-pointer"
                    >
                      <span>{isEs ? 'Explorar Centro' : 'Explore Hub'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
