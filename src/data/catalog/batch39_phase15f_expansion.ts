import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH39_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15f-sub-calc', categoryId: 'financial', name: 'Phase 15F NPV, IRR & Depreciation Calculators', slug: 'phase15f-npv-irr-depreciation', description: 'Net present value, internal rate of return, and asset depreciation financial calculators', sortOrder: 75 },
  { id: 'p15f-sub-conv', categoryId: 'converter', name: 'Phase 15F Unicode Text Encoding Inspector', slug: 'phase15f-unicode-inspector', description: 'Unicode code points and character encoding inspection utility', sortOrder: 75 },
  { id: 'p15f-sub-check', categoryId: 'checkers', name: 'Phase 15F XML Sitemap Structure Checker', slug: 'phase15f-xml-sitemap-checker', description: 'XML sitemap structure and URL entry validator', sortOrder: 75 },
  { id: 'p15f-sub-gen', categoryId: 'generators', name: 'Phase 15F Kubernetes YAML Manifest Generator', slug: 'phase15f-k8s-manifest-generator', description: 'Kubernetes YAML deployment and service manifest generator', sortOrder: 75 },
  { id: 'p15f-sub-plan', categoryId: 'planners', name: 'Phase 15F Procurement & Purchase Order Planner', slug: 'phase15f-procurement-po-planner', description: 'Procurement requirements and purchase order planning tool', sortOrder: 75 },
  { id: 'p15f-sub-tools', categoryId: 'additional-tools', name: 'Phase 15F Cron Expression Validator', slug: 'phase15f-cron-expression-validator', description: 'Cron expression validation, explanation, and schedule utility', sortOrder: 75 },
  { id: 'p15f-sub-track', categoryId: 'trackers', name: 'Phase 15F Vendor Performance Tracker', slug: 'phase15f-vendor-performance-tracker', description: 'Vendor delivery events, quality, and performance tracker', sortOrder: 75 },
  { id: 'p15f-sub-guides', categoryId: 'guides', name: 'Phase 15F API Auth & Statistical Distributions Reference', slug: 'phase15f-api-auth-stats-reference', description: 'API authentication/OAuth reference and statistical distributions probability guide', sortOrder: 75 }
];

export const BATCH39_METADATA: CalculatorMeta[] = [
  // 1. Net Present Value (NPV) & Internal Rate of Return (IRR) Calculator
  {
    id: 'npv-irr-calculator',
    name: 'Net Present Value (NPV) & Internal Rate of Return (IRR)',
    shortDesc: 'Calculate net present value from cash flows and discount rates, alongside internal rate of return (IRR)',
    category: 'financial',
    subcategoryId: 'p15f-sub-calc',
    tags: ['financial', 'npv', 'irr', 'discounted-cash-flow', 'investment', 'capital-budgeting'],
    formula: 'NPV = Sum(CF_t / (1 + r)^t) - Initial Investment; IRR = Rate where NPV = 0',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Straight-Line & Declining Balance Depreciation Calculator
  {
    id: 'asset-depreciation-calculator',
    name: 'Straight-Line & Declining Balance Depreciation Calculator',
    shortDesc: 'Calculate asset depreciation schedules using straight-line and declining balance methods with salvage value limits',
    category: 'financial',
    subcategoryId: 'p15f-sub-calc',
    tags: ['financial', 'depreciation', 'straight-line', 'declining-balance', 'assets', 'accounting'],
    formula: 'Straight-Line = (Cost - Salvage) / Useful Life; Declining = Book Value × Depreciation Rate',
    isPopular: false,
    iconName: 'Building',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Unicode Text Encoding Inspector & Converter
  {
    id: 'unicode-encoding-inspector',
    name: 'Unicode Text Encoding Inspector & Converter',
    shortDesc: 'Inspect Unicode code points, UTF-8/UTF-16/UTF-32 byte representations, surrogate pairs, and character properties',
    category: 'converter',
    subcategoryId: 'p15f-sub-conv',
    tags: ['converter', 'unicode', 'utf-8', 'utf-16', 'code-points', 'encoding', 'inspector'],
    formula: 'String.prototype.codePointAt() and TextEncoder byte buffer mapping',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. XML Sitemap Structure & URL Entry Checker
  {
    id: 'xml-sitemap-structure-checker',
    name: 'XML Sitemap Structure & URL Entry Checker',
    shortDesc: 'Validate XML sitemap well-formedness, urlset/sitemapindex structures, URL syntax, and date formatting',
    category: 'checkers',
    subcategoryId: 'p15f-sub-check',
    tags: ['checkers', 'xml-sitemap', 'seo', 'sitemap', 'validator', 'xml'],
    formula: 'DOMParser XML schema validation and URL/date parsing rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Kubernetes YAML Manifest Generator
  {
    id: 'kubernetes-yaml-manifest-generator',
    name: 'Kubernetes YAML Manifest Generator',
    shortDesc: 'Generate Kubernetes manifest templates for Deployments, Services, ConfigMaps, Secrets, and Ingress with safe defaults',
    category: 'generators',
    subcategoryId: 'p15f-sub-gen',
    tags: ['generator', 'kubernetes', 'k8s', 'yaml', 'manifest', 'devops', 'deployment'],
    formula: 'Kubernetes API version spec v1 template interpolation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Procurement & Purchase Order Planning Tool
  {
    id: 'procurement-purchase-order-planner',
    name: 'Procurement & Purchase Order Planning Tool',
    shortDesc: 'Organize purchase requisitions, supplier details, item quantities, unit prices, delivery dates, and PO statuses',
    category: 'planners',
    subcategoryId: 'p15f-sub-plan',
    tags: ['planner', 'procurement', 'purchase-order', 'po', 'supply-chain', 'purchasing'],
    formula: 'Line Item Total = Quantity × Unit Price; Order Total = Sum(Line Item Totals)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Cron Expression Validator & Explainer
  {
    id: 'cron-expression-validator',
    name: 'Cron Expression Validator & Explainer',
    shortDesc: 'Parse, validate, and explain cron expressions (minute, hour, day, month, weekday) with upcoming execution schedules',
    category: 'additional-tools',
    subcategoryId: 'p15f-sub-tools',
    tags: ['tools', 'cron', 'scheduler', 'validator', 'explainer', 'devops'],
    formula: '5-field / 6-field cron token parsing and schedule recurrence calculation',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Vendor Performance & Supplier Delivery Tracker
  {
    id: 'vendor-performance-delivery-tracker',
    name: 'Vendor Performance & Supplier Delivery Tracker',
    shortDesc: 'Record supplier delivery events, expected versus actual dates, quality defect rates, and reliability KPIs',
    category: 'trackers',
    subcategoryId: 'p15f-sub-track',
    tags: ['trackers', 'vendor', 'supplier', 'performance', 'delivery', 'logistics', 'kpi'],
    formula: 'On-Time Delivery Rate % = (On-Time Deliveries / Total Deliveries) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. API Authentication Methods & OAuth Reference
  {
    id: 'api-authentication-oauth-reference',
    name: 'API Authentication Methods & OAuth Reference',
    shortDesc: 'Reference guide explaining API keys, Basic auth, Bearer tokens, OAuth 2.0 authorization flows, and OIDC',
    category: 'guides',
    subcategoryId: 'p15f-sub-guides',
    tags: ['guides', 'api-auth', 'oauth2', 'bearer-token', 'security', 'reference', 'developer'],
    formula: 'RFC 6749 OAuth 2.0 grant types and authentication protocol taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Statistical Distributions & Probability Reference
  {
    id: 'statistical-distributions-probability-reference',
    name: 'Statistical Distributions & Probability Reference',
    shortDesc: 'Reference guide for discrete and continuous statistical distributions (Normal, Binomial, Poisson, Exponential) with PMF/PDF formulas',
    category: 'guides',
    subcategoryId: 'p15f-sub-guides',
    tags: ['guides', 'statistics', 'probability', 'distributions', 'normal-distribution', 'reference'],
    formula: 'Probability Density Function (PDF) and Expected Value / Variance formulas',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
