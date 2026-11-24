import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH42_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15i-sub-calc', categoryId: 'financial', name: 'Phase 15I Price Elasticity & Demand Economics', slug: 'phase15i-price-elasticity-economics', description: 'Price elasticity of demand and revenue impact calculators', sortOrder: 90 },
  { id: 'p15i-sub-calc2', categoryId: 'basic-math', name: 'Phase 15I Water Consumption & Utility Tariffs', slug: 'phase15i-water-consumption-utilities', description: 'Water consumption volume and utility cost estimation calculators', sortOrder: 90 },
  { id: 'p15i-sub-conv', categoryId: 'converter', name: 'Phase 15I JSON & XML Data Structure Converters', slug: 'phase15i-json-xml-converters', description: 'Bidirectional JSON and XML structure conversion utilities', sortOrder: 90 },
  { id: 'p15i-sub-check', categoryId: 'checkers', name: 'Phase 15I SSL/TLS Certificate Metadata Checkers', slug: 'phase15i-ssl-tls-metadata-checkers', description: 'SSL/TLS certificate metadata and configuration validation checkers', sortOrder: 90 },
  { id: 'p15i-sub-gen', categoryId: 'generators', name: 'Phase 15I Gitignore & Development File Generators', slug: 'phase15i-gitignore-file-generators', description: 'Repository .gitignore exclusion rules and configuration generators', sortOrder: 90 },
  { id: 'p15i-sub-plan', categoryId: 'planners', name: 'Phase 15I Event Budget & Expense Planners', slug: 'phase15i-event-budget-expense-planners', description: 'Event budgeting, attendance costing, and expense planning tools', sortOrder: 90 },
  { id: 'p15i-sub-tools', categoryId: 'additional-tools', name: 'Phase 15I JWT Decoders & Token Inspectors', slug: 'phase15i-jwt-decoders-inspectors', description: 'JWT local decoding and claims inspection utilities', sortOrder: 90 },
  { id: 'p15i-sub-track', categoryId: 'trackers', name: 'Phase 15I Vehicle Mileage & Maintenance Trackers', slug: 'phase15i-vehicle-mileage-maintenance-trackers', description: 'Vehicle odometer mileage logging and maintenance tracking utilities', sortOrder: 90 },
  { id: 'p15i-sub-guides', categoryId: 'guides', name: 'Phase 15I DNS Resolution & Database Indexing References', slug: 'phase15i-dns-database-references', description: 'DNS record specifications and database query indexing reference guides', sortOrder: 90 }
];

export const BATCH42_METADATA: CalculatorMeta[] = [
  // 1. Price Elasticity & Revenue Impact Calculator
  {
    id: 'price-elasticity-revenue-calculator',
    name: 'Price Elasticity & Revenue Impact Calculator',
    shortDesc: 'Calculate price elasticity of demand using percentage-change and midpoint methods with revenue impact projections',
    category: 'financial',
    subcategoryId: 'p15i-sub-calc',
    tags: ['financial', 'price-elasticity', 'demand', 'revenue', 'economics', 'pricing'],
    formula: 'Elasticity (Ed) = (% Change in Quantity) / (% Change in Price); Arc Midpoint Formula used for precise arc elasticity',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Water Consumption & Utility Cost Calculator
  {
    id: 'water-consumption-cost-calculator',
    name: 'Water Consumption & Utility Cost Calculator',
    shortDesc: 'Calculate water consumption volume across liters, gallons, and cubic meters with tiered utility cost projections',
    category: 'basic-math',
    subcategoryId: 'p15i-sub-calc2',
    tags: ['basic-math', 'water-consumption', 'utility-cost', 'gallons', 'liters', 'utilities'],
    formula: 'Volume = Flow Rate × Duration × Frequency; Cost = Volume × Tariff Rate + Fixed Fees',
    isPopular: false,
    iconName: 'Percent',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. JSON/XML Data Structure Converter
  {
    id: 'json-xml-structure-converter',
    name: 'JSON/XML Data Structure Converter',
    shortDesc: 'Convert structured JSON data to XML and XML documents to valid JSON with nesting, attributes, and formatting support',
    category: 'converter',
    subcategoryId: 'p15i-sub-conv',
    tags: ['converter', 'json', 'xml', 'data-structure', 'parser', 'serialization'],
    formula: 'DOM tree parsing and recursive object-to-element serialization mapping rules',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. SSL/TLS Configuration & Certificate Metadata Checker
  {
    id: 'ssl-tls-certificate-metadata-checker',
    name: 'SSL/TLS Configuration & Certificate Metadata Checker',
    shortDesc: 'Inspect SSL/TLS certificate metadata, expiration dates, subject/issuer attributes, and protocol security compliance',
    category: 'checkers',
    subcategoryId: 'p15i-sub-check',
    tags: ['checkers', 'ssl-tls', 'certificate', 'security', 'metadata', 'protocols'],
    formula: 'Certificate validity date checks (NotBefore, NotAfter) and cipher suite security rule verification',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Gitignore File Generator
  {
    id: 'gitignore-file-generator',
    name: 'Gitignore File Generator',
    shortDesc: 'Generate customized .gitignore repository exclusion files for programming languages, frameworks, IDEs, and OS environments',
    category: 'generators',
    subcategoryId: 'p15i-sub-gen',
    tags: ['generators', 'gitignore', 'git', 'repository', 'exclusion', 'devops'],
    formula: 'Template rule aggregation and deduplication across standard development environments',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Event Budget & Expense Planning Tool
  {
    id: 'event-budget-expense-planner',
    name: 'Event Budget & Expense Planning Tool',
    shortDesc: 'Plan event budgets, attendance costs, venue rentals, catering expenses, and track budget variances and overruns',
    category: 'planners',
    subcategoryId: 'p15i-sub-plan',
    tags: ['planners', 'event-budget', 'expense-planner', 'budgeting', 'finance', 'event'],
    formula: 'Total Cost = Sum(Fixed Expenses) + (Per-Attendee Cost × Attendance); Variance = Budget - Actual',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. JWT Decoder & Claims Inspector
  {
    id: 'jwt-decoder-claims-inspector',
    name: 'JWT Decoder & Claims Inspector',
    shortDesc: 'Decode JSON Web Tokens (JWT) locally in the browser, inspect header and payload claims, and check expiration dates',
    category: 'additional-tools',
    subcategoryId: 'p15i-sub-tools',
    tags: ['tools', 'jwt-decoder', 'claims', 'json-web-token', 'security', 'inspector'],
    formula: 'Base64URL decoding of header and payload segments with JSON parsing and Unix timestamp formatting',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Vehicle Mileage & Maintenance Tracker
  {
    id: 'vehicle-mileage-maintenance-tracker',
    name: 'Vehicle Mileage & Maintenance Tracker',
    shortDesc: 'Track vehicle odometer readings, fuel logs, service intervals, maintenance costs, and upcoming service alerts',
    category: 'trackers',
    subcategoryId: 'p15i-sub-track',
    tags: ['trackers', 'vehicle-mileage', 'maintenance', 'odometer', 'service', 'tracker'],
    formula: 'Remaining Distance = Next Service Mileage - Current Odometer; Cumulative Cost = Sum(Service Costs)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. DNS Records & Domain Resolution Reference
  {
    id: 'dns-records-domain-reference',
    name: 'DNS Records & Domain Resolution Reference',
    shortDesc: 'Reference guide covering A, AAAA, CNAME, MX, TXT, NS records, TTL settings, propagation, and DNS troubleshooting',
    category: 'guides',
    subcategoryId: 'p15i-sub-guides',
    tags: ['guides', 'dns-records', 'domain-resolution', 'networking', 'dns', 'reference'],
    formula: 'RFC 1034 / RFC 1035 DNS resource record specifications and resolution taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Database Indexing & Query Optimization Reference
  {
    id: 'database-indexing-query-optimization-reference',
    name: 'Database Indexing & Query Optimization Reference',
    shortDesc: 'Reference guide for B-Tree indexes, composite indexes, query execution plans, selectivity, and SQL performance tuning',
    category: 'guides',
    subcategoryId: 'p15i-sub-guides',
    tags: ['guides', 'database-indexing', 'query-optimization', 'sql', 'performance', 'reference'],
    formula: 'Database execution plan cost estimation and index selectivity formulas',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
