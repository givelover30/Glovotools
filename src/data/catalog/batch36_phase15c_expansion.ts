import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH36_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15c-sub-calc', categoryId: 'financial', name: 'Phase 15C Unit Economics & Rental Calculators', slug: 'phase15c-unit-economics-rental', description: 'CAC/LTV unit economics and rental property cash flow return calculators', sortOrder: 60 },
  { id: 'p15c-sub-conv', categoryId: 'converter', name: 'Phase 15C Geographic Coordinate Converter', slug: 'phase15c-geo-coordinate-converter', description: 'Geographic coordinate format conversion utility', sortOrder: 60 },
  { id: 'p15c-sub-check', categoryId: 'checkers', name: 'Phase 15C robots.txt Directive Checker', slug: 'phase15c-robots-txt-checker', description: 'robots.txt syntax and crawl directive validator', sortOrder: 60 },
  { id: 'p15c-sub-gen', categoryId: 'generators', name: 'Phase 15C SVG Icon Sprite Sheet Generator', slug: 'phase15c-svg-sprite-generator', description: 'SVG icon sprite sheet code generator', sortOrder: 60 },
  { id: 'p15c-sub-plan', categoryId: 'planners', name: 'Phase 15C Freelance Project Pricing Planner', slug: 'phase15c-freelance-pricing-planner', description: 'Freelance project quoting and hourly rate planner', sortOrder: 60 },
  { id: 'p15c-sub-tools', categoryId: 'additional-tools', name: 'Phase 15C URL Query Builder & Parser', slug: 'phase15c-url-query-builder', description: 'URL query string builder and parser utility', sortOrder: 60 },
  { id: 'p15c-sub-track', categoryId: 'trackers', name: 'Phase 15C Content Publishing & Editorial Tracker', slug: 'phase15c-editorial-tracker', description: 'Website content publishing and editorial workflow tracker', sortOrder: 60 },
  { id: 'p15c-sub-guides', categoryId: 'guides', name: 'Phase 15C Cloud Architecture & Algorithm References', slug: 'phase15c-cloud-algorithm-references', description: 'Cloud computing models and data structures algorithm complexity reference', sortOrder: 60 }
];

export const BATCH36_METADATA: CalculatorMeta[] = [
  // 1. Customer Acquisition Cost (CAC), Lifetime Value (LTV) & Payback Calculator
  {
    id: 'cac-ltv-payback-calc',
    name: 'Customer Acquisition Cost (CAC) & LTV Calculator',
    shortDesc: 'Calculate customer acquisition cost, lifetime value, LTV:CAC ratio, and gross-margin-adjusted payback period',
    category: 'financial',
    subcategoryId: 'p15c-sub-calc',
    tags: ['financial', 'cac', 'ltv', 'payback', 'saas', 'unit-economics'],
    formula: 'LTV:CAC Ratio = Customer Lifetime Value / CAC; Payback Period = CAC / (ARPU × Gross Margin)',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Rental Property Cash Flow & Return Calculator
  {
    id: 'rental-property-cashflow-calc',
    name: 'Rental Property Cash Flow & Return Calculator',
    shortDesc: 'Calculate net operating income (NOI), monthly cash flow, capitalization rate (cap rate), and cash-on-cash return',
    category: 'financial',
    subcategoryId: 'p15c-sub-calc',
    tags: ['financial', 'rental-property', 'cash-flow', 'cap-rate', 'real-estate', 'roi'],
    formula: 'NOI = Gross Operating Income - Operating Expenses; Cash-on-Cash = Annual Cash Flow / Total Cash Invested',
    isPopular: false,
    iconName: 'Building',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Geographic Coordinate Format Converter
  {
    id: 'geo-coordinate-converter',
    name: 'Geographic Coordinate Format Converter',
    shortDesc: 'Convert geographic coordinates between Decimal Degrees (DD) and Degrees, Minutes, Seconds (DMS)',
    category: 'converter',
    subcategoryId: 'p15c-sub-conv',
    tags: ['converter', 'geo', 'coordinates', 'latitude', 'longitude', 'dms', 'decimal-degrees'],
    formula: 'Degrees = trunc(DD); Minutes = trunc(frac(DD) * 60); Seconds = frac(frac(DD) * 60) * 60',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. robots.txt Syntax & Crawl Directive Checker
  {
    id: 'robots-txt-syntax-checker',
    name: 'robots.txt Syntax & Crawl Directive Checker',
    shortDesc: 'Validate robots.txt syntax rules, User-agent groups, allow/disallow directives, and sitemap declarations',
    category: 'checkers',
    subcategoryId: 'p15c-sub-check',
    tags: ['checkers', 'robots-txt', 'seo', 'crawlers', 'syntax', 'validator'],
    formula: 'Robot exclusion standard directive pattern validation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. SVG Icon Sprite Sheet Generator
  {
    id: 'svg-sprite-generator',
    name: 'SVG Icon Sprite Sheet & Symbol Generator',
    shortDesc: 'Combine multiple SVG graphic elements into a unified SVG sprite sheet with symbol IDs and reusable symbol references',
    category: 'generators',
    subcategoryId: 'p15c-sub-gen',
    tags: ['generator', 'svg', 'sprite-sheet', 'icons', 'symbols', 'frontend'],
    formula: 'SVG symbol encapsulation and defs aggregation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Freelance Project Pricing & Hourly Rate Planner
  {
    id: 'freelance-pricing-planner',
    name: 'Freelance Project Pricing & Hourly Rate Planner',
    shortDesc: 'Calculate recommended billable hourly rates, project quotes, operating expenses, tax overhead, and profit margins',
    category: 'planners',
    subcategoryId: 'p15c-sub-plan',
    tags: ['planner', 'freelance', 'pricing', 'hourly-rate', 'project-quote', 'business'],
    formula: 'Hourly Rate = (Desired Salary + Business Expenses + Taxes) / Annual Billable Hours',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. URL Query String Builder & Parser
  {
    id: 'url-query-builder-parser',
    name: 'URL Query String Builder & Parameter Parser',
    shortDesc: 'Parse, create, edit, and encode URL query parameters and search strings interactively',
    category: 'additional-tools',
    subcategoryId: 'p15c-sub-tools',
    tags: ['tools', 'url', 'query-string', 'parser', 'builder', 'encoder', 'developer'],
    formula: 'URLSearchParams object parsing and query string encoding',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Website Content Publishing & Editorial Tracker
  {
    id: 'content-editorial-tracker',
    name: 'Website Content Publishing & Editorial Tracker',
    shortDesc: 'Track content ideas, drafting status, assigned editors, target deadlines, and publication dates',
    category: 'trackers',
    subcategoryId: 'p15c-sub-track',
    tags: ['trackers', 'editorial', 'content-calendar', 'publishing', 'blog', 'workflow'],
    formula: 'Editorial milestone status and schedule tracking',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Cloud Computing Models & Architecture Reference
  {
    id: 'cloud-architecture-reference',
    name: 'Cloud Computing Models & Architecture Reference',
    shortDesc: 'Reference guide covering IaaS, PaaS, SaaS, deployment models, serverless architecture, and cloud components',
    category: 'guides',
    subcategoryId: 'p15c-sub-guides',
    tags: ['guides', 'cloud-computing', 'iaas', 'paas', 'saas', 'architecture', 'reference'],
    formula: 'Cloud service model taxonomy and deployment classification',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Data Structures & Algorithm Complexity Reference
  {
    id: 'algorithm-complexity-reference',
    name: 'Data Structures & Algorithm Complexity Reference',
    shortDesc: 'Reference guide for common data structures (arrays, trees, graphs) and Big-O time and space complexity comparisons',
    category: 'guides',
    subcategoryId: 'p15c-sub-guides',
    tags: ['guides', 'algorithms', 'data-structures', 'big-o', 'complexity', 'computer-science'],
    formula: 'Big-O notation growth rate analysis (O(1), O(log n), O(n), O(n log n), O(n²))',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
