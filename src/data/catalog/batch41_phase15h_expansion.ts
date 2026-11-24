import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH41_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15h-sub-calc', categoryId: 'financial', name: 'Phase 15H Fuel Economy & Commission Calculators', slug: 'phase15h-fuel-commission-calc', description: 'Fuel economy trip cost and sales commission tiered compensation calculators', sortOrder: 85 },
  { id: 'p15h-sub-conv', categoryId: 'converter', name: 'Phase 15H Number-to-Words Text Converter', slug: 'phase15h-number-to-words-converter', description: 'Numeric values to written words and currency representation converter', sortOrder: 85 },
  { id: 'p15h-sub-check', categoryId: 'checkers', name: 'Phase 15H JSON Schema Validation Checker', slug: 'phase15h-json-schema-checker', description: 'JSON Schema validation and structure checker', sortOrder: 85 },
  { id: 'p15h-sub-gen', categoryId: 'generators', name: 'Phase 15H Docker Compose Config Generator', slug: 'phase15h-docker-compose-generator', description: 'Docker Compose configuration YAML file generator', sortOrder: 85 },
  { id: 'p15h-sub-plan', categoryId: 'planners', name: 'Phase 15H Personal Study Schedule Planner', slug: 'phase15h-study-schedule-planner', description: 'Personal learning goals and study schedule planner', sortOrder: 85 },
  { id: 'p15h-sub-tools', categoryId: 'additional-tools', name: 'Phase 15H HTTP Request Builder & cURL Generator', slug: 'phase15h-http-request-curl-generator', description: 'HTTP request builder and cURL command generator utility', sortOrder: 85 },
  { id: 'p15h-sub-track', categoryId: 'trackers', name: 'Phase 15H Employee Training & Certification Tracker', slug: 'phase15h-training-certification-tracker', description: 'Employee training activities and certification expiration tracker', sortOrder: 85 },
  { id: 'p15h-sub-guides', categoryId: 'guides', name: 'Phase 15H HTTP Status Codes & Backup Recovery References', slug: 'phase15h-http-status-backup-references', description: 'HTTP status codes semantics and data backup recovery strategy reference guides', sortOrder: 85 }
];

export const BATCH41_METADATA: CalculatorMeta[] = [
  // 1. Fuel Economy & Trip Fuel Cost Calculator
  {
    id: 'fuel-economy-trip-cost-calculator',
    name: 'Fuel Economy & Trip Fuel Cost Calculator',
    shortDesc: 'Calculate total trip fuel required and estimated fuel cost across MPG, L/100km, and km/L units with multi-vehicle comparisons',
    category: 'financial',
    subcategoryId: 'p15h-sub-calc',
    tags: ['financial', 'fuel-economy', 'trip-cost', 'mpg', 'l100km', 'travel'],
    formula: 'Fuel Required = Distance / FuelEconomy; Trip Cost = Fuel Required × Fuel Price',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Sales Commission & Tiered Compensation Calculator
  {
    id: 'sales-commission-tiered-calculator',
    name: 'Sales Commission & Tiered Compensation Calculator',
    shortDesc: 'Calculate sales commissions across flat rates, progressive tiers, thresholds, base salaries, and performance bonuses',
    category: 'financial',
    subcategoryId: 'p15h-sub-calc',
    tags: ['financial', 'sales-commission', 'tiered-compensation', 'payroll', 'bonus', 'sales'],
    formula: 'Commission = Sum(Tier Sales × Tier Rate) + Base Salary + Bonus',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Number-to-Words & Numeric Text Converter
  {
    id: 'number-to-words-converter',
    name: 'Number-to-Words & Numeric Text Converter',
    shortDesc: 'Convert numeric integers and decimals into written English and localized number words with scale formatting',
    category: 'converter',
    subcategoryId: 'p15h-sub-conv',
    tags: ['converter', 'number-to-words', 'numeric-text', 'cardinal', 'ordinal', 'formatter'],
    formula: 'Integer number scaling (billions, millions, thousands, hundreds) and decimal place fractional conversion',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. JSON Schema Validation & Structure Checker
  {
    id: 'json-schema-validation-checker',
    name: 'JSON Schema Validation & Structure Checker',
    shortDesc: 'Validate JSON payloads against documented JSON Schema drafts checking required properties, types, enums, and constraints',
    category: 'checkers',
    subcategoryId: 'p15h-sub-check',
    tags: ['checkers', 'json-schema', 'validator', 'json', 'data-integrity', 'api'],
    formula: 'JSON Schema Draft 7/2020-12 type and constraint rule evaluation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Docker Compose Configuration Generator
  {
    id: 'docker-compose-config-generator',
    name: 'Docker Compose Configuration Generator',
    shortDesc: 'Generate multi-container Docker Compose YAML configurations with services, build contexts, ports, volumes, and environment secrets',
    category: 'generators',
    subcategoryId: 'p15h-sub-gen',
    tags: ['generator', 'docker-compose', 'yaml', 'containers', 'devops', 'configuration'],
    formula: 'Docker Compose specification version 3.8 multi-service YAML interpolation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Personal Learning & Study Schedule Planner
  {
    id: 'personal-study-schedule-planner',
    name: 'Personal Learning & Study Schedule Planner',
    shortDesc: 'Define learning goals, study durations, target completion deadlines, and generate structured weekly study session calendars',
    category: 'planners',
    subcategoryId: 'p15h-sub-plan',
    tags: ['planner', 'study-schedule', 'learning', 'education', 'goals', 'calendar'],
    formula: 'Required Study Hours per Week = Total Goal Hours / Available Weeks',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. HTTP Request Builder & cURL Generator
  {
    id: 'http-request-curl-generator',
    name: 'HTTP Request Builder & cURL Generator',
    shortDesc: 'Build HTTP requests (GET, POST, PUT, DELETE, PATCH) with custom headers, query params, JSON bodies, and generate shell cURL commands',
    category: 'additional-tools',
    subcategoryId: 'p15h-sub-tools',
    tags: ['tools', 'http-request', 'curl', 'api-client', 'builder', 'developer'],
    formula: 'URL parameter joining, header serialization, and shell command escaping',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Employee Training & Certification Tracker
  {
    id: 'employee-training-certification-tracker',
    name: 'Employee Training & Certification Tracker',
    shortDesc: 'Track employee training courses, completion dates, certification validity periods, expiration alerts, and renewal intervals',
    category: 'trackers',
    subcategoryId: 'p15h-sub-track',
    tags: ['trackers', 'employee-training', 'certification', 'compliance', 'hr', 'tracking'],
    formula: 'Certification Status = ExpiryDate > Today ? Active : Expired',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. HTTP Status Codes & Response Semantics Reference
  {
    id: 'http-status-codes-reference',
    name: 'HTTP Status Codes & Response Semantics Reference',
    shortDesc: 'Comprehensive reference guide for HTTP status code classes (1xx, 2xx, 3xx, 4xx, 5xx), meanings, and API use cases',
    category: 'guides',
    subcategoryId: 'p15h-sub-guides',
    tags: ['guides', 'http-status-codes', 'api', 'web', 'semantics', 'reference'],
    formula: 'RFC 7231 / RFC 9110 HTTP status classification taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Data Backup Strategies & Recovery Reference
  {
    id: 'data-backup-recovery-reference',
    name: 'Data Backup Strategies & Recovery Reference',
    shortDesc: 'Reference guide covering full, incremental, and differential backups, RPO/RTO metrics, and the 3-2-1 backup principle',
    category: 'guides',
    subcategoryId: 'p15h-sub-guides',
    tags: ['guides', 'data-backup', 'disaster-recovery', 'rpo-rto', '3-2-1-rule', 'reference'],
    formula: 'Disaster recovery metrics (RPO/RTO) and backup architecture taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
