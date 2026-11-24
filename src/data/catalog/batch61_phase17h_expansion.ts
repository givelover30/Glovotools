import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH61_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17h-sub-calc', categoryId: 'business-operations', name: 'Phase 17H Revenue per Employee & Churn Impact', slug: 'phase17h-revenue-churn-calc', description: 'Business revenue per employee and customer churn revenue impact calculators', sortOrder: 145 },
  { id: 'p17h-sub-conv', categoryId: 'converter', name: 'Phase 17H Inventory Cost Flow Method', slug: 'phase17h-inventory-cost-flow-conv', description: 'Inventory cost flow method conversion utility', sortOrder: 145 },
  { id: 'p17h-sub-check', categoryId: 'checkers', name: 'Phase 17H Vendor Invoice Duplicate Detection', slug: 'phase17h-invoice-duplicate-check', description: 'Vendor invoice duplicate detection checker', sortOrder: 145 },
  { id: 'p17h-sub-gen', categoryId: 'generators', name: 'Phase 17H Partnership Agreement Outline', slug: 'phase17h-partnership-agreement-gen', description: 'Business partnership agreement outline generator', sortOrder: 145 },
  { id: 'p17h-sub-plan', categoryId: 'planners', name: 'Phase 17H New Market Entry Strategy', slug: 'phase17h-market-entry-plan', description: 'New market entry strategy and milestone planner', sortOrder: 145 },
  { id: 'p17h-sub-tools', categoryId: 'additional-tools', name: 'Phase 17H KPI Dashboard Data', slug: 'phase17h-kpi-dashboard-tool', description: 'Business KPI dashboard data and runway utility', sortOrder: 145 },
  { id: 'p17h-sub-track', categoryId: 'trackers', name: 'Phase 17H Subscription Renewal', slug: 'phase17h-subscription-track', description: 'Business subscription and software renewal tracker', sortOrder: 145 },
  { id: 'p17h-sub-guides', categoryId: 'guides', name: 'Phase 17H Financial Controls & Trade Payment', slug: 'phase17h-controls-trade-payment-guides', description: 'Small business financial controls and international trade payment methods references', sortOrder: 145 }
];

export const BATCH61_METADATA: CalculatorMeta[] = [
  {
    id: 'business-revenue-per-employee-calculator',
    name: 'Business Revenue per Employee Calculator',
    shortDesc: 'Calculate productivity and labor efficiency by dividing total annual revenue by total headcount (full-time equivalent employees)',
    category: 'business-operations',
    subcategoryId: 'p17h-sub-calc',
    tags: ['business', 'revenue-per-employee', 'productivity', 'labor-efficiency', 'metrics', 'calculators'],
    formula: 'Revenue per Employee = Total Annual Revenue / Total FTE Headcount',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'customer-churn-revenue-impact-calculator',
    name: 'Customer Churn Revenue Impact Calculator',
    shortDesc: 'Calculate the financial impact of customer and MRR churn on annual recurring revenue (ARR) and customer lifetime value',
    category: 'business-operations',
    subcategoryId: 'p17h-sub-calc',
    tags: ['business', 'churn-revenue-impact', 'mrr-churn', 'arr-loss', 'retention', 'calculators'],
    formula: 'Lost Revenue = Average Revenue Per User × Churned Customers',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'inventory-cost-flow-method-converter',
    name: 'Inventory Cost Flow Method Converter',
    shortDesc: 'Compare ending inventory valuations and cost of goods sold (COGS) across FIFO, LIFO, and Weighted Average cost flow assumptions',
    category: 'converter',
    subcategoryId: 'p17h-sub-conv',
    tags: ['converter', 'inventory-cost-flow', 'fifo', 'lifo', 'weighted-average', 'accounting'],
    formula: 'COGS = Beginning Inventory + Purchases - Ending Inventory (FIFO/LIFO/Weighted Average)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'vendor-invoice-duplicate-detection-checker',
    name: 'Vendor Invoice Duplicate Detection Checker',
    shortDesc: 'Scan accounts payable batches for duplicate supplier invoices by comparing invoice numbers, vendor IDs, issue dates, and amounts',
    category: 'checkers',
    subcategoryId: 'p17h-sub-check',
    tags: ['checkers', 'invoice-duplicate', 'accounts-payable', 'fraud-detection', 'audit', 'validation'],
    formula: 'Duplicate Match Criteria = Vendor ID + Invoice Number + Exact Amount',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-partnership-agreement-outline-generator',
    name: 'Business Partnership Agreement Outline Generator',
    shortDesc: 'Generate structured business partnership agreement outlines including capital contributions, profit sharing, management duties, and dissolution terms',
    category: 'generators',
    subcategoryId: 'p17h-sub-gen',
    tags: ['generators', 'partnership-agreement', 'legal', 'business-formation', 'outline', 'business'],
    formula: 'Structured Business Partnership Agreement Template & Governance Clauses',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'new-market-entry-strategy-planner',
    name: 'New Market Entry Strategy Planner',
    shortDesc: 'Plan new geographic or vertical market entry strategies across market research, entry modes, regulatory hurdles, and launch milestones',
    category: 'planners',
    subcategoryId: 'p17h-sub-plan',
    tags: ['planners', 'market-entry', 'expansion', 'strategy', 'planning', 'milestones'],
    formula: 'Market Attractiveness Score & Entry Milestone Roadmap',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'business-kpi-dashboard-data-utility',
    name: 'Business KPI Dashboard Data Utility',
    shortDesc: 'Aggregate and calculate key performance indicator (KPI) summaries including growth rates, margins, burn rate, and runway months',
    category: 'additional-tools',
    subcategoryId: 'p17h-sub-tools',
    tags: ['tools', 'kpi-dashboard', 'business-metrics', 'runway', 'burn-rate', 'utility'],
    formula: 'Runway Months = Cash Reserves / Monthly Net Burn Rate',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-subscription-renewal-tracker',
    name: 'Business Subscription Renewal Tracker',
    shortDesc: 'Track SaaS subscriptions, software licenses, recurring tool costs, renewal dates, and billing intervals with local persistence',
    category: 'trackers',
    subcategoryId: 'p17h-sub-track',
    tags: ['trackers', 'subscription-tracking', 'saas-licenses', 'software-costs', 'tracking', 'expenses'],
    formula: 'Days Until Renewal = Subscription Renewal Date - Current Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-financial-controls-reference',
    name: 'Small Business Financial Controls Reference',
    shortDesc: 'Reference guide covering cash handling controls, bank reconciliation safeguards, credit card policies, and expenditure authorizations',
    category: 'guides',
    subcategoryId: 'p17h-sub-guides',
    tags: ['guides', 'financial-controls', 'cash-handling', 'accounting-safeguards', 'reference'],
    formula: 'Financial Control Procedures & Authorization Matrix Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'international-trade-payment-methods-reference',
    name: 'International Trade Payment Methods Reference',
    shortDesc: 'Reference guide explaining international trade payment methods including cash in advance, documentary collections, letters of credit, and open account',
    category: 'guides',
    subcategoryId: 'p17h-sub-guides',
    tags: ['guides', 'trade-payment', 'letters-of-credit', 'open-account', 'export-finance', 'reference'],
    formula: 'International Trade Settlement Risk & Payment Instrument Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
