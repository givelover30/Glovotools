import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH37_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15d-sub-calc', categoryId: 'financial', name: 'Phase 15D Overtime & Dimensional Weight Calculators', slug: 'phase15d-overtime-dim-weight', description: 'Overtime pay, shift differential, and chargeable dimensional shipping weight calculators', sortOrder: 65 },
  { id: 'p15d-sub-conv', categoryId: 'converter', name: 'Phase 15D Roman Numeral Converter', slug: 'phase15d-roman-numeral-converter', description: 'Roman numeral and decimal number conversion utility', sortOrder: 65 },
  { id: 'p15d-sub-check', categoryId: 'checkers', name: 'Phase 15D Canonical & Hreflang SEO Checker', slug: 'phase15d-canonical-hreflang-checker', description: 'Canonical URL and hreflang annotation configuration checker', sortOrder: 65 },
  { id: 'p15d-sub-gen', categoryId: 'generators', name: 'Phase 15D CSS Container Query Generator', slug: 'phase15d-container-query-generator', description: 'CSS container query and styles generator', sortOrder: 65 },
  { id: 'p15d-sub-plan', categoryId: 'planners', name: 'Phase 15D Business Cash Flow Forecast Planner', slug: 'phase15d-cashflow-forecast-planner', description: 'Business cash flow forecasting and financial scenario planner', sortOrder: 65 },
  { id: 'p15d-sub-tools', categoryId: 'additional-tools', name: 'Phase 15D NDJSON Validator & Formatter', slug: 'phase15d-ndjson-validator', description: 'JSON Lines (NDJSON) streaming validation and formatting utility', sortOrder: 65 },
  { id: 'p15d-sub-track', categoryId: 'trackers', name: 'Phase 15D Invoice Receivables Tracker', slug: 'phase15d-invoice-receivables-tracker', description: 'Invoice receivables and payment status tracking log', sortOrder: 65 },
  { id: 'p15d-sub-guides', categoryId: 'guides', name: 'Phase 15D Incoterms & Core Web Vitals References', slug: 'phase15d-incoterms-vitals-references', description: 'E-commerce shipping Incoterms and Web Performance Core Web Vitals reference guide', sortOrder: 65 }
];

export const BATCH37_METADATA: CalculatorMeta[] = [
  // 1. Overtime Pay & Shift Differential Calculator
  {
    id: 'overtime-shift-diff-calc',
    name: 'Overtime Pay & Shift Differential Calculator',
    shortDesc: 'Calculate regular wages, overtime pay (1.5x/2x), shift premiums, total gross earnings, and effective hourly compensation',
    category: 'financial',
    subcategoryId: 'p15d-sub-calc',
    tags: ['financial', 'overtime', 'shift-differential', 'payroll', 'wages', 'gross-pay'],
    formula: 'Gross Pay = (Regular Hours × Base Rate) + (Overtime Hours × Base Rate × Overtime Multiplier) + Shift Premium',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Dimensional Weight & Chargeable Shipping Weight Calculator
  {
    id: 'dimensional-weight-shipping-calc',
    name: 'Dimensional Weight & Chargeable Shipping Weight Calculator',
    shortDesc: 'Calculate package dimensional weight from length, width, and height using standard volumetric divisors and compare with actual weight',
    category: 'financial',
    subcategoryId: 'p15d-sub-calc',
    tags: ['financial', 'dimensional-weight', 'shipping', 'freight', 'chargeable-weight', 'logistics'],
    formula: 'Dim Weight = (Length × Width × Height) / DimDivisor; Chargeable = max(Actual Weight, Dim Weight)',
    isPopular: false,
    iconName: 'Building',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Roman Numeral & Decimal Number Converter
  {
    id: 'roman-numeral-converter',
    name: 'Roman Numeral & Decimal Number Converter',
    shortDesc: 'Convert integers between canonical Roman numerals (I, V, X, L, C, D, M) and standard decimal numbers',
    category: 'converter',
    subcategoryId: 'p15d-sub-conv',
    tags: ['converter', 'roman-numeral', 'decimal', 'integer', 'numerals'],
    formula: 'Symbol lookup mapping and subtractive notation parsing (I=1, V=5, X=10, L=50, C=100, D=500, M=1000)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Canonical URL & Hreflang Configuration Checker
  {
    id: 'canonical-hreflang-checker',
    name: 'Canonical URL & Hreflang Configuration Checker',
    shortDesc: 'Inspect HTML snippets for canonical tag presence, hreflang multi-region language annotations, and conflict detection',
    category: 'checkers',
    subcategoryId: 'p15d-sub-check',
    tags: ['checkers', 'canonical', 'hreflang', 'seo', 'internationalization', 'validator'],
    formula: 'DOM tag presence, language code ISO validation, and reciprocal link heuristic checks',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. CSS Container Query Generator
  {
    id: 'css-container-query-generator',
    name: 'CSS Container Query & Container Styles Generator',
    shortDesc: 'Generate responsive CSS container query blocks (@container) with custom container names, types, and breakpoints',
    category: 'generators',
    subcategoryId: 'p15d-sub-gen',
    tags: ['generator', 'css', 'container-queries', 'responsive', 'frontend', 'stylesheet'],
    formula: '@container containerName (min-width: breakpoint) { selector { property: value; } }',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Business Cash Flow Forecast Planner
  {
    id: 'cash-flow-forecast-planner',
    name: 'Business Cash Flow Forecast & Scenario Planner',
    shortDesc: 'Plan monthly cash inflows, operating expenses, and projected ending cash balances with multi-month forecasts',
    category: 'planners',
    subcategoryId: 'p15d-sub-plan',
    tags: ['planner', 'cash-flow', 'forecast', 'budget', 'financial-planning', 'business'],
    formula: 'Ending Cash Balance = Opening Cash + Cash Inflows - Cash Outflows',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. JSON Lines (NDJSON) Validator & Formatter
  {
    id: 'ndjson-validator-formatter',
    name: 'JSON Lines (NDJSON) Validator & Formatter',
    shortDesc: 'Validate, format, and inspect newline-delimited JSON (NDJSON) streams line-by-line with error line numbers',
    category: 'additional-tools',
    subcategoryId: 'p15d-sub-tools',
    tags: ['tools', 'ndjson', 'json-lines', 'validator', 'formatter', 'stream'],
    formula: 'Split input by newline character → JSON.parse() each record independently',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Invoice Receivables & Payment Status Tracker
  {
    id: 'invoice-receivables-tracker',
    name: 'Invoice Receivables & Payment Status Tracker',
    shortDesc: 'Track commercial invoices, customer accounts, issue dates, due dates, partial payments, and overdue balances',
    category: 'trackers',
    subcategoryId: 'p15d-sub-track',
    tags: ['trackers', 'invoice', 'receivables', 'payments', 'accounts-receivable', 'finance'],
    formula: 'Outstanding Balance = Total Invoice Amount - Sum(Payments Received); Overdue if DueDate < Today & Balance > 0',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. E-commerce Shipping Methods & Incoterms Reference
  {
    id: 'incoterms-shipping-reference',
    name: 'E-commerce Shipping Methods & Incoterms Reference',
    shortDesc: 'Reference guide explaining international commercial terms (Incoterms 2020: FOB, CIF, EXW, DDP) and freight methods',
    category: 'guides',
    subcategoryId: 'p15d-sub-guides',
    tags: ['guides', 'shipping', 'incoterms', 'logistics', 'ecommerce', 'reference'],
    formula: 'Incoterms 2020 risk transfer and cost allocation rule definitions',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Web Performance Metrics & Core Web Vitals Reference
  {
    id: 'core-web-vitals-reference',
    name: 'Web Performance & Core Web Vitals Reference Guide',
    shortDesc: 'Reference guide for LCP, INP, CLS, TTFB, and web performance optimization thresholds and measurement methodologies',
    category: 'guides',
    subcategoryId: 'p15d-sub-guides',
    tags: ['guides', 'web-performance', 'core-web-vitals', 'lcp', 'inp', 'cls', 'seo', 'reference'],
    formula: 'Google Core Web Vitals good/needs-improvement/poor threshold standards',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
