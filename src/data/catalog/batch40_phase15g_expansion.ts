import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH40_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15g-sub-calc', categoryId: 'financial', name: 'Phase 15G CAGR & Electricity Cost Calculators', slug: 'phase15g-cagr-electricity-calc', description: 'Compound annual growth rate and electricity appliance operating cost calculators', sortOrder: 80 },
  { id: 'p15g-sub-conv', categoryId: 'converter', name: 'Phase 15G Unix Timestamp DateTime Converter', slug: 'phase15g-unix-timestamp-converter', description: 'Unix timestamp and human-readable date-time conversion utility', sortOrder: 80 },
  { id: 'p15g-sub-check', categoryId: 'checkers', name: 'Phase 15G CSV Data Quality & Schema Checker', slug: 'phase15g-csv-data-quality-checker', description: 'CSV data structure, malformed row, and schema validation utility', sortOrder: 80 },
  { id: 'p15g-sub-gen', categoryId: 'generators', name: 'Phase 15G OpenAPI Specification Scaffold Generator', slug: 'phase15g-openapi-scaffold-generator', description: 'OpenAPI 3.x specification scaffold and schema generator', sortOrder: 80 },
  { id: 'p15g-sub-plan', categoryId: 'planners', name: 'Phase 15G Preventive Maintenance Schedule Planner', slug: 'phase15g-preventive-maintenance-planner', description: 'Equipment and machinery preventive maintenance scheduling planner', sortOrder: 80 },
  { id: 'p15g-sub-tools', categoryId: 'additional-tools', name: 'Phase 15G Regular Expression Tester & Explainer', slug: 'phase15g-regex-tester-explainer', description: 'Interactive regular expression pattern tester and explanation utility', sortOrder: 80 },
  { id: 'p15g-sub-track', categoryId: 'trackers', name: 'Phase 15G Warranty & Asset Lifecycle Tracker', slug: 'phase15g-warranty-asset-tracker', description: 'Asset purchase dates, warranty expiration, and lifecycle tracker', sortOrder: 80 },
  { id: 'p15g-sub-guides', categoryId: 'guides', name: 'Phase 15G Software Testing & Cloud Storage References', slug: 'phase15g-testing-cloud-storage-refs', description: 'Software testing QA techniques and cloud storage architecture reference guides', sortOrder: 80 }
];

export const BATCH40_METADATA: CalculatorMeta[] = [
  // 1. CAGR & Compound Investment Growth Calculator
  {
    id: 'cagr-compound-growth-calculator',
    name: 'CAGR & Compound Investment Growth Calculator',
    shortDesc: 'Calculate compound annual growth rate (CAGR), projected final investment values, and periodic growth schedules',
    category: 'financial',
    subcategoryId: 'p15g-sub-calc',
    tags: ['financial', 'cagr', 'compound-growth', 'investment', 'returns', 'projection'],
    formula: 'CAGR = (Final Value / Initial Value)^(1 / Years) - 1',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Electricity Consumption & Appliance Cost Calculator
  {
    id: 'electricity-appliance-cost-calculator',
    name: 'Electricity Consumption & Appliance Cost Calculator',
    shortDesc: 'Calculate appliance kWh energy consumption and estimated operating costs across daily, weekly, and monthly periods',
    category: 'scientific',
    subcategoryId: 'p15g-sub-calc',
    tags: ['scientific', 'electricity', 'energy', 'appliance', 'cost', 'watts', 'kwh'],
    formula: 'kWh = (Watts × HoursUsed) / 1000; Cost = kWh × RatePerkWh',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 3. Unix Timestamp & Date-Time Converter
  {
    id: 'unix-timestamp-datetime-converter',
    name: 'Unix Timestamp & Date-Time Converter',
    shortDesc: 'Convert Unix epoch timestamps (seconds/milliseconds) to ISO 8601 UTC and local date-time strings and vice versa',
    category: 'converter',
    subcategoryId: 'p15g-sub-conv',
    tags: ['converter', 'unix-timestamp', 'epoch', 'date-time', 'utc', 'iso8601'],
    formula: 'Timestamp ms = Date.parse(ISOString); ISOString = new Date(Timestamp).toISOString()',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. CSV Data Quality & Schema Checker
  {
    id: 'csv-data-quality-schema-checker',
    name: 'CSV Data Quality & Schema Checker',
    shortDesc: 'Inspect CSV data for malformed rows, inconsistent column counts, missing values, duplicate records, and header errors',
    category: 'checkers',
    subcategoryId: 'p15g-sub-check',
    tags: ['checkers', 'csv', 'data-quality', 'schema', 'validation', 'dataset'],
    formula: 'Delimited row parsing and column length consistency heuristic audit',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. OpenAPI Specification Scaffold Generator
  {
    id: 'openapi-spec-scaffold-generator',
    name: 'OpenAPI Specification Scaffold Generator',
    shortDesc: 'Generate OpenAPI 3.x API specification scaffolds with configurable title, version, paths, operations, parameters, and schemas',
    category: 'generators',
    subcategoryId: 'p15g-sub-gen',
    tags: ['generator', 'openapi', 'swagger', 'api', 'scaffold', 'json', 'yaml'],
    formula: 'OpenAPI 3.0.3 object schema template construction',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Preventive Maintenance Schedule Planner
  {
    id: 'preventive-maintenance-schedule-planner',
    name: 'Preventive Maintenance Schedule Planner',
    shortDesc: 'Organize equipment assets and preventive maintenance tasks with recurring intervals, priorities, and chronological schedules',
    category: 'planners',
    subcategoryId: 'p15g-sub-plan',
    tags: ['planner', 'preventive-maintenance', 'maintenance', 'schedule', 'equipment', 'operations'],
    formula: 'Next Due Date = Last Maintenance Date + Interval Days',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Regular Expression Tester & Explainer
  {
    id: 'regex-tester-explainer',
    name: 'Regular Expression Tester & Explainer',
    shortDesc: 'Test regular expressions against sample text with flag selections, match highlights, capture groups, and syntax explanations',
    category: 'additional-tools',
    subcategoryId: 'p15g-sub-tools',
    tags: ['tools', 'regex', 'regular-expression', 'tester', 'explainer', 'developer'],
    formula: 'RegExp test and match execution with index tracking and group tokenization',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Warranty & Asset Lifecycle Tracker
  {
    id: 'warranty-asset-lifecycle-tracker',
    name: 'Warranty & Asset Lifecycle Tracker',
    shortDesc: 'Register physical assets and equipment, track purchase dates, warranty coverage periods, expiration alerts, and lifecycle status',
    category: 'trackers',
    subcategoryId: 'p15g-sub-track',
    tags: ['trackers', 'warranty', 'asset-lifecycle', 'equipment', 'tracking', 'inventory'],
    formula: 'Warranty Status = ExpiryDate > Today ? Active : Expired',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Software Testing Methods & QA Techniques Reference
  {
    id: 'software-testing-qa-reference',
    name: 'Software Testing Methods & QA Techniques Reference',
    shortDesc: 'Reference guide for unit, integration, system, regression, black-box/white-box testing, test coverage, and defect lifecycle',
    category: 'guides',
    subcategoryId: 'p15g-sub-guides',
    tags: ['guides', 'software-testing', 'qa', 'unit-test', 'integration-test', 'reference', 'developer'],
    formula: 'ISTQB / Software QA engineering standard definition taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Cloud Storage Concepts & Architecture Reference
  {
    id: 'cloud-storage-architecture-reference',
    name: 'Cloud Storage Concepts & Architecture Reference',
    shortDesc: 'Reference guide covering object storage, block storage, file storage, replication tiers, durability, and lifecycle policies',
    category: 'guides',
    subcategoryId: 'p15g-sub-guides',
    tags: ['guides', 'cloud-storage', 'object-storage', 'block-storage', 'architecture', 'reference', 'devops'],
    formula: 'Cloud storage tiering and durability classification taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
