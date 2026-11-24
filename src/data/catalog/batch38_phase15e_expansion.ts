import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH38_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15e-sub-calc', categoryId: 'financial', name: 'Phase 15E Inventory Turnover & LTV Calculators', slug: 'phase15e-inventory-ltv-calc', description: 'Inventory turnover, DIO, loan-to-value, and debt-to-value financial calculators', sortOrder: 70 },
  { id: 'p15e-sub-conv', categoryId: 'converter', name: 'Phase 15E Color Format Converter', slug: 'phase15e-color-format-converter', description: 'Color format and color space conversion utility', sortOrder: 70 },
  { id: 'p15e-sub-check', categoryId: 'checkers', name: 'Phase 15E Meta Tags & Social Preview Checker', slug: 'phase15e-meta-tags-checker', description: 'Webpage meta tags and social media preview validator', sortOrder: 70 },
  { id: 'p15e-sub-gen', categoryId: 'generators', name: 'Phase 15E Professional Meeting Minutes Generator', slug: 'phase15e-meeting-minutes-generator', description: 'Professional meeting minutes document generator', sortOrder: 70 },
  { id: 'p15e-sub-plan', categoryId: 'planners', name: 'Phase 15E Workforce & Shift Scheduling Planner', slug: 'phase15e-workforce-shift-planner', description: 'Employee workforce and shift scheduling operations planner', sortOrder: 70 },
  { id: 'p15e-sub-tools', categoryId: 'additional-tools', name: 'Phase 15E SQL Query Parameterizer & Formatter', slug: 'phase15e-sql-parameterizer', description: 'SQL query formatting and parameter placeholder utility', sortOrder: 70 },
  { id: 'p15e-sub-track', categoryId: 'trackers', name: 'Phase 15E Website Uptime & Incident Tracker', slug: 'phase15e-uptime-incident-tracker', description: 'Website uptime observations and incident log tracker', sortOrder: 70 },
  { id: 'p15e-sub-guides', categoryId: 'guides', name: 'Phase 15E Database Normalization & PM References', slug: 'phase15e-db-normalization-pm-refs', description: 'Database normalization design and project management methodologies reference', sortOrder: 70 }
];

export const BATCH38_METADATA: CalculatorMeta[] = [
  // 1. Inventory Turnover & Days Inventory Outstanding Calculator
  {
    id: 'inventory-turnover-dio-calc',
    name: 'Inventory Turnover & Days Inventory Outstanding (DIO)',
    shortDesc: 'Calculate inventory turnover ratio, average inventory value, cost of goods sold (COGS), and days inventory outstanding',
    category: 'financial',
    subcategoryId: 'p15e-sub-calc',
    tags: ['financial', 'inventory-turnover', 'dio', 'supply-chain', 'accounting', 'metrics'],
    formula: 'Turnover = COGS / Average Inventory; DIO = 365 / Inventory Turnover',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Loan-to-Value (LTV) & Debt-to-Value Calculator
  {
    id: 'ltv-dtv-calculator',
    name: 'Loan-to-Value (LTV) & Debt-to-Value (DTV) Calculator',
    shortDesc: 'Calculate loan-to-value, combined loan-to-value (CLTV), and debt-to-value financial ratios against asset appraisal values',
    category: 'financial',
    subcategoryId: 'p15e-sub-calc',
    tags: ['financial', 'ltv', 'loan-to-value', 'cltv', 'debt-to-value', 'real-estate', 'loans'],
    formula: 'LTV = (Total Loan Amount / Appraised Asset Value) × 100',
    isPopular: false,
    iconName: 'Building',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Color Format & Color Space Converter
  {
    id: 'color-space-format-converter',
    name: 'Color Format & Color Space Converter',
    shortDesc: 'Convert color values seamlessly between HEX, RGB, RGBA, HSL, and HSLA color space notations',
    category: 'converter',
    subcategoryId: 'p15e-sub-conv',
    tags: ['converter', 'color', 'hex', 'rgb', 'hsl', 'rgba', 'hsla', 'design'],
    formula: 'Mathematical color coordinate translation between cylindrical and Cartesian color models',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Webpage Meta Tags & Social Preview Checker
  {
    id: 'meta-tags-social-checker',
    name: 'Webpage Meta Tags & Social Preview Checker',
    shortDesc: 'Inspect HTML snippets for title, meta description, canonical tags, Open Graph, and Twitter card social preview metadata',
    category: 'checkers',
    subcategoryId: 'p15e-sub-check',
    tags: ['checkers', 'meta-tags', 'open-graph', 'seo', 'social-preview', 'validator'],
    formula: 'DOM tag attribute extraction and length limit heuristic audits',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Professional Meeting Minutes Generator
  {
    id: 'meeting-minutes-generator',
    name: 'Professional Meeting Minutes Generator',
    shortDesc: 'Generate structured professional meeting minutes including attendees, agenda topics, discussion summaries, and action items',
    category: 'generators',
    subcategoryId: 'p15e-sub-gen',
    tags: ['generator', 'meeting-minutes', 'agenda', 'action-items', 'professional', 'markdown'],
    formula: 'Structured meeting record template composition',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Employee Workforce & Shift Scheduling Planner
  {
    id: 'workforce-shift-planner',
    name: 'Employee Workforce & Shift Scheduling Planner',
    shortDesc: 'Organize staff shifts, weekly employee availability, operating hours, and coverage staffing requirements',
    category: 'planners',
    subcategoryId: 'p15e-sub-plan',
    tags: ['planner', 'workforce', 'shift-scheduling', 'staffing', 'operations', 'hr'],
    formula: 'Shift coverage matrix and staff hours allocation scheduling',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. SQL Query Parameterizer & Formatter
  {
    id: 'sql-parameterizer-formatter',
    name: 'SQL Query Parameterizer & Formatter',
    shortDesc: 'Format SQL statements and replace literal values with bind parameter placeholders (? or $1, $2)',
    category: 'additional-tools',
    subcategoryId: 'p15e-sub-tools',
    tags: ['tools', 'sql', 'parameterizer', 'formatter', 'database', 'developer'],
    formula: 'SQL token replacement and keyword indentation formatting',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Website Uptime & Incident Log Tracker
  {
    id: 'website-uptime-incident-tracker',
    name: 'Website Uptime & Incident Log Tracker',
    shortDesc: 'Record manual uptime observations, downtime incidents, severity ratings, and calculate availability percentage',
    category: 'trackers',
    subcategoryId: 'p15e-sub-track',
    tags: ['trackers', 'uptime', 'incident', 'downtime', 'availability', 'monitoring'],
    formula: 'Availability % = ((Total Observation Hours - Downtime Hours) / Total Observation Hours) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Database Normalization & SQL Design Reference
  {
    id: 'database-normalization-reference',
    name: 'Database Normalization & SQL Design Reference',
    shortDesc: 'Reference guide explaining 1NF, 2NF, 3NF, BCNF, functional dependencies, primary keys, and relational schema design',
    category: 'guides',
    subcategoryId: 'p15e-sub-guides',
    tags: ['guides', 'database', 'normalization', 'sql', 'design', 'schema', 'reference'],
    formula: 'Database normal form dependency rules (1NF, 2NF, 3NF)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Project Management Methodologies & Frameworks Reference
  {
    id: 'project-management-methodologies-reference',
    name: 'Project Management Methodologies & Frameworks Reference',
    shortDesc: 'Reference guide comparing Agile, Scrum, Kanban, Waterfall, Lean, and hybrid project management frameworks',
    category: 'guides',
    subcategoryId: 'p15e-sub-guides',
    tags: ['guides', 'project-management', 'agile', 'scrum', 'kanban', 'waterfall', 'reference'],
    formula: 'Methodology lifecycle workflow and governance definitions',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
