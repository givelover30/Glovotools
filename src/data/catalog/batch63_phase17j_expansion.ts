import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH63_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17j-sub-calc', categoryId: 'business-operations', name: 'Phase 17J Operating Margin & CLV', slug: 'phase17j-operating-margin-clv-calc', description: 'Business operating margin and customer lifetime value calculators', sortOrder: 151 },
  { id: 'p17j-sub-conv', categoryId: 'converter', name: 'Phase 17J Forex Spread Markup', slug: 'phase17j-forex-markup-conv', description: 'Foreign exchange spread and markup converters', sortOrder: 151 },
  { id: 'p17j-sub-check', categoryId: 'checkers', name: 'Phase 17J Financial Statement Cross-Check', slug: 'phase17j-financial-statement-check', description: 'Financial statement balance equilibrium checkers', sortOrder: 151 },
  { id: 'p17j-sub-gen', categoryId: 'generators', name: 'Phase 17J Business Policy Document', slug: 'phase17j-business-policy-gen', description: 'Corporate policy document and compliance outline generators', sortOrder: 151 },
  { id: 'p17j-sub-plan', categoryId: 'planners', name: 'Phase 17J Acquisition Due Diligence', slug: 'phase17j-acquisition-diligence-plan', description: 'Business acquisition and due diligence project planners', sortOrder: 151 },
  { id: 'p17j-sub-tools', categoryId: 'additional-tools', name: 'Phase 17J Sales Pipeline Analytics', slug: 'phase17j-sales-pipeline-tool', description: 'Business sales pipeline and weighted deal analytics utilities', sortOrder: 151 },
  { id: 'p17j-sub-track', categoryId: 'trackers', name: 'Phase 17J Tax Filing Deadline', slug: 'phase17j-tax-filing-track', description: 'Corporate tax filing deadline and return trackers', sortOrder: 151 },
  { id: 'p17j-sub-guides', categoryId: 'guides', name: 'Phase 17J Audit & Global Expansion References', slug: 'phase17j-audit-expansion-guides', description: 'Small business audit preparation and international expansion reference guides', sortOrder: 151 }
];

export const BATCH63_METADATA: CalculatorMeta[] = [
  {
    id: 'business-operating-margin-calculator',
    name: 'Business Operating Margin Calculator',
    shortDesc: 'Calculate operating income (EBIT) and operating margin percentage from revenue and operating expenses',
    category: 'business-operations',
    subcategoryId: 'p17j-sub-calc',
    tags: ['business', 'operating-margin', 'ebit', 'profitability', 'financial', 'calculators'],
    formula: 'Operating Margin % = (Operating Income / Revenue) * 100',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'customer-lifetime-revenue-forecast-calculator',
    name: 'Customer Lifetime Revenue Forecast Calculator',
    shortDesc: 'Forecast customer lifetime value (LTV), average revenue per user, customer lifespan, and gross customer equity',
    category: 'business-operations',
    subcategoryId: 'p17j-sub-calc',
    tags: ['business', 'customer-lifetime-value', 'ltv', 'revenue-forecast', 'marketing', 'calculators'],
    formula: 'LTV = Average Purchase Value * Purchase Frequency * Customer Lifespan',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'forex-spread-markup-converter',
    name: 'Foreign Exchange Spread & Markup Converter',
    shortDesc: 'Convert currency exchange rates incorporating broker spreads, percentage markups, and total transaction fees',
    category: 'converter',
    subcategoryId: 'p17j-sub-conv',
    tags: ['converter', 'forex', 'exchange-rate', 'spread', 'markup', 'utility'],
    formula: 'Effective Rate = Interbank Rate * (1 + Spread % / 100)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'financial-statement-cross-check-checker',
    name: 'Financial Statement Cross-Check Checker',
    shortDesc: 'Verify accounting equation equilibrium (Assets = Liabilities + Equity) across balance sheet statements',
    category: 'checkers',
    subcategoryId: 'p17j-sub-check',
    tags: ['checkers', 'financial-statement', 'balance-sheet', 'accounting', 'assets-liabilities', 'validation'],
    formula: 'Discrepancy = Total Assets - (Total Liabilities + Total Equity)',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-policy-document-generator',
    name: 'Business Policy Document Generator',
    shortDesc: 'Generate comprehensive corporate policy document outlines including code of conduct, remote work rules, and data security',
    category: 'generators',
    subcategoryId: 'p17j-sub-gen',
    tags: ['generators', 'business-policy', 'code-of-conduct', 'compliance', 'corporate', 'generator'],
    formula: 'Structured Corporate Policy Framework & Compliance Outline',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'business-acquisition-due-diligence-planner',
    name: 'Business Acquisition Due Diligence Planner',
    shortDesc: 'Plan mergers and acquisitions (M&A) due diligence workstreams, financial audits, legal reviews, and integration milestones',
    category: 'planners',
    subcategoryId: 'p17j-sub-plan',
    tags: ['planners', 'acquisition', 'due-diligence', 'mergers-acquisitions', 'planning', 'milestones'],
    formula: 'M&A Due Diligence Phase & Workstream Schedule',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'business-sales-pipeline-analytics-utility',
    name: 'Business Sales Pipeline Analytics Utility',
    shortDesc: 'Analyze sales funnel conversion rates, weighted pipeline value, average deal size, and projected quarterly bookings',
    category: 'additional-tools',
    subcategoryId: 'p17j-sub-tools',
    tags: ['tools', 'sales-pipeline', 'pipeline-analytics', 'deal-value', 'sales', 'utility'],
    formula: 'Weighted Pipeline = Sum(Deal Value * Stage Probability %)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-tax-filing-deadline-tracker',
    name: 'Business Tax Filing Deadline Tracker',
    shortDesc: 'Track corporate income tax, quarterly estimated taxes, VAT/GST returns, and employer payroll tax filing deadlines with local persistence',
    category: 'trackers',
    subcategoryId: 'p17j-sub-track',
    tags: ['trackers', 'tax-deadline', 'tax-filing', 'corporate-tax', 'compliance', 'tracking'],
    formula: 'Days Remaining = Target Deadline Date - Current Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-audit-preparation-reference',
    name: 'Small Business Audit Preparation Reference',
    shortDesc: 'Reference guide covering financial statement preparation, tax record retention rules, internal controls, and auditor coordination',
    category: 'guides',
    subcategoryId: 'p17j-sub-guides',
    tags: ['guides', 'audit-preparation', 'internal-controls', 'record-retention', 'accounting', 'reference'],
    formula: 'Audit Readiness & Documentation Checklist Reference',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'international-business-expansion-reference',
    name: 'International Business Expansion Reference',
    shortDesc: 'Reference guide on cross-border tax compliance, transfer pricing rules, foreign entity registration, and cultural localization',
    category: 'guides',
    subcategoryId: 'p17j-sub-guides',
    tags: ['guides', 'international-expansion', 'cross-border', 'transfer-pricing', 'global-business', 'reference'],
    formula: 'Global Market Entry & Cross-Border Compliance Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
