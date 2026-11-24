import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH34_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15a-sub-calc', categoryId: 'financial', name: 'Phase 15A Business & Date Calculators', slug: 'phase15a-business-date', description: 'Break-even contribution margin and business working days calculators', sortOrder: 50 },
  { id: 'p15a-sub-conv', categoryId: 'converter', name: 'Phase 15A Radix & Number Base Converter', slug: 'phase15a-radix-converter', description: 'Number base and radix conversion tool', sortOrder: 50 },
  { id: 'p15a-sub-check', categoryId: 'checkers', name: 'Phase 15A Email DNS Authentication Checker', slug: 'phase15a-email-auth-checker', description: 'SPF, DKIM, and DMARC configuration validator', sortOrder: 50 },
  { id: 'p15a-sub-gen', categoryId: 'generators', name: 'Phase 15A CSS Typography & Code Generators', slug: 'phase15a-css-ts-generators', description: 'Responsive CSS clamp typography and JSON-to-TypeScript interface generators', sortOrder: 50 },
  { id: 'p15a-sub-plan', categoryId: 'planners', name: 'Phase 15A Inventory Stock Planning Tool', slug: 'phase15a-inventory-stock-planner', description: 'Inventory reorder point and stock planning tool', sortOrder: 50 },
  { id: 'p15a-sub-tools', categoryId: 'additional-tools', name: 'Phase 15A TypeScript Interface Generator', slug: 'phase15a-ts-generator', description: 'JSON-to-TypeScript code generation utility', sortOrder: 50 },
  { id: 'p15a-sub-track', categoryId: 'trackers', name: 'Phase 15A Inventory Stock Tracker', slug: 'phase15a-inventory-stock-tracker', description: 'Inventory stock level and movement tracking log', sortOrder: 50 },
  { id: 'p15a-sub-guides', categoryId: 'guides', name: 'Phase 15A Accounting & Networking References', slug: 'phase15a-accounting-networking-refs', description: 'Financial ratios reference and networking ports & protocols guide', sortOrder: 50 }
];

export const BATCH34_METADATA: CalculatorMeta[] = [
  // 1. Break-Even Point & Contribution Margin Calculator
  {
    id: 'break-even-contribution-calc',
    name: 'Break-Even Point & Contribution Margin Calculator',
    shortDesc: 'Calculate unit contribution margin, break-even units, break-even revenue, and target profit analysis with fixed and variable costs',
    category: 'financial',
    subcategoryId: 'p15a-sub-calc',
    tags: ['financial', 'break-even', 'contribution-margin', 'fixed-costs', 'profit', 'business'],
    formula: 'Contribution Margin = Price - Variable Cost; Break-Even Units = Fixed Costs / Contribution Margin',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Business Days & Working Days Calculator
  {
    id: 'business-working-days-calc',
    name: 'Business Days & Working Days Calculator',
    shortDesc: 'Calculate working days between two dates, exclude weekends, and compute business schedule intervals',
    category: 'datetime',
    subcategoryId: 'p15a-sub-calc',
    tags: ['datetime', 'business-days', 'working-days', 'calendar', 'interval', 'schedule'],
    formula: 'Iterate date range counting weekdays (excluding Saturday and Sunday)',
    isPopular: false,
    iconName: 'Calendar',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. Number Base & Radix Converter
  {
    id: 'number-base-radix-converter',
    name: 'Number Base & Radix Converter',
    shortDesc: 'Convert numbers seamlessly between Binary (base 2), Octal (base 8), Decimal (base 10), Hexadecimal (base 16), and custom radix bases (2-36)',
    category: 'converter',
    subcategoryId: 'p15a-sub-conv',
    tags: ['converter', 'number-base', 'radix', 'binary', 'hex', 'decimal', 'octal'],
    formula: 'parseInt(val, fromRadix).toString(toRadix)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. SPF, DKIM & DMARC Configuration Checker
  {
    id: 'email-dns-auth-checker',
    name: 'SPF, DKIM & DMARC Configuration Checker',
    shortDesc: 'Validate email DNS authentication records (SPF syntax, DKIM selectors, DMARC policies) for domain security',
    category: 'checkers',
    subcategoryId: 'p15a-sub-check',
    tags: ['checkers', 'spf', 'dkim', 'dmarc', 'email', 'dns', 'security'],
    formula: 'DNS TXT record syntax and policy tag validation heuristics',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Responsive CSS Typography & Clamp Generator
  {
    id: 'css-clamp-generator',
    name: 'Responsive CSS Typography & Clamp Generator',
    shortDesc: 'Generate fluid responsive CSS clamp() font size expressions from minimum and maximum viewport widths and font sizes',
    category: 'generators',
    subcategoryId: 'p15a-sub-gen',
    tags: ['generator', 'css', 'typography', 'clamp', 'responsive', 'frontend'],
    formula: 'clamp(minSize, minSize + (maxSize - minSize) * ((100vw - minWidth)/(maxWidth - minWidth)), maxSize)',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Inventory Reorder & Stock Planning Tool
  {
    id: 'inventory-reorder-planner',
    name: 'Inventory Reorder Point & Stock Planner',
    shortDesc: 'Calculate optimal reorder point (ROP), safety stock levels, and economic order quantities (EOQ) for supply chain planning',
    category: 'planners',
    subcategoryId: 'p15a-sub-plan',
    tags: ['planner', 'inventory', 'reorder-point', 'safety-stock', 'supply-chain', 'operations'],
    formula: 'Reorder Point = (Daily Usage × Lead Time Days) + Safety Stock',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. JSON-to-TypeScript Interface Generator
  {
    id: 'json-to-ts-generator',
    name: 'JSON-to-TypeScript Interface & Type Generator',
    shortDesc: 'Convert JSON data samples into clean TypeScript interfaces and type definitions automatically',
    category: 'additional-tools',
    subcategoryId: 'p15a-sub-tools',
    tags: ['tools', 'json', 'typescript', 'generator', 'interfaces', 'developer'],
    formula: 'Recursive JSON structure type inference and interface emission',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Inventory Stock Level & Movement Tracker
  {
    id: 'inventory-stock-tracker',
    name: 'Inventory Stock Level & Movement Tracker',
    shortDesc: 'Track incoming shipments, stock dispatches, adjustments, and running inventory balances with local persistence',
    category: 'trackers',
    subcategoryId: 'p15a-sub-track',
    tags: ['trackers', 'inventory', 'stock-levels', 'warehouse', 'movements', 'logistics'],
    formula: 'Current Stock = Initial Stock + Sum(Inbound) - Sum(Outbound) + Adjustments',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Financial Ratios & Accounting Reference
  {
    id: 'financial-ratios-reference',
    name: 'Financial Ratios & Accounting Formulas Reference',
    shortDesc: 'Comprehensive reference for liquidity ratios, profitability metrics, leverage ratios, and efficiency indicators',
    category: 'guides',
    subcategoryId: 'p15a-sub-guides',
    tags: ['guides', 'financial', 'accounting', 'ratios', 'reference', 'business'],
    formula: 'Current Ratio = Current Assets / Current Liabilities; ROE = Net Income / Equity',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Networking Ports & Protocols Reference
  {
    id: 'networking-ports-reference',
    name: 'Networking Ports, Protocols & Services Reference',
    shortDesc: 'Quick reference guide for well-known TCP/UDP ports, protocols (HTTP, HTTPS, SSH, DNS, FTP, SMTP), and service descriptions',
    category: 'guides',
    subcategoryId: 'p15a-sub-guides',
    tags: ['guides', 'networking', 'ports', 'protocols', 'tcp', 'udp', 'reference'],
    formula: 'IANA Port Registry standard lookup guide (0 - 65535)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
