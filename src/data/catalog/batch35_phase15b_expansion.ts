import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH35_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p15b-sub-calc', categoryId: 'basic-math', name: 'Phase 15B Grade & Sales Tax Calculators', slug: 'phase15b-grade-tax-calculators', description: 'Weighted average grade and sales tax inclusive price calculators', sortOrder: 55 },
  { id: 'p15b-sub-conv', categoryId: 'converter', name: 'Phase 15B Time Zone UTC Converter', slug: 'phase15b-timezone-converter', description: 'Time zone offset and UTC conversion utility', sortOrder: 55 },
  { id: 'p15b-sub-check', categoryId: 'checkers', name: 'Phase 15B HTML Accessibility Structure Checker', slug: 'phase15b-accessibility-checker', description: 'HTML semantic structure and accessibility checker', sortOrder: 55 },
  { id: 'p15b-sub-gen', categoryId: 'generators', name: 'Phase 15B Business Proposal Generator', slug: 'phase15b-proposal-generator', description: 'Professional business proposal document generator', sortOrder: 55 },
  { id: 'p15b-sub-plan', categoryId: 'planners', name: 'Phase 15B Debt Snowball & Avalanche Planner', slug: 'phase15b-debt-planner', description: 'Personal debt payoff strategy and repayment planner', sortOrder: 55 },
  { id: 'p15b-sub-tools', categoryId: 'additional-tools', name: 'Phase 15B Markdown Converter & Text Processor', slug: 'phase15b-markdown-text-tools', description: 'Markdown-to-HTML converter and text case formatting processor', sortOrder: 55 },
  { id: 'p15b-sub-track', categoryId: 'trackers', name: 'Phase 15B Subscription Renewal Tracker', slug: 'phase15b-subscription-tracker', description: 'Subscription renewal dates and recurring cost tracker', sortOrder: 55 },
  { id: 'p15b-sub-guides', categoryId: 'guides', name: 'Phase 15B Business Document & Invoice Terms Reference', slug: 'phase15b-invoice-terms-ref', description: 'Commercial document and invoice terminology reference guide', sortOrder: 55 }
];

export const BATCH35_METADATA: CalculatorMeta[] = [
  // 1. Weighted Average & Grade Calculator
  {
    id: 'weighted-average-grade-calc',
    name: 'Weighted Average & Grade Calculator',
    shortDesc: 'Calculate weighted term grades, category weights, contribution scores, and required final exam points',
    category: 'basic-math',
    subcategoryId: 'p15b-sub-calc',
    tags: ['math', 'weighted-average', 'grades', 'school', 'gpa', 'calculator'],
    formula: 'Weighted Average = Sum(Score × Weight) / Sum(Weights)',
    isPopular: false,
    iconName: 'Percent',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 2. Sales Tax & Tax-Inclusive Price Calculator
  {
    id: 'sales-tax-inclusive-calc',
    name: 'Sales Tax & Tax-Inclusive Price Calculator',
    shortDesc: 'Compute pre-tax list price, sales tax amounts, and tax-inclusive final totals with customizable tax rates',
    category: 'financial',
    subcategoryId: 'p15b-sub-calc',
    tags: ['financial', 'sales-tax', 'inclusive-price', 'tax', 'shopping', 'pricing'],
    formula: 'Total = Price × (1 + TaxRate/100); PreTax = Total / (1 + TaxRate/100)',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. Time Zone Offset & UTC Converter
  {
    id: 'timezone-offset-converter',
    name: 'Time Zone Offset & UTC Converter',
    shortDesc: 'Convert timestamps between Coordinated Universal Time (UTC) and world time zone offsets',
    category: 'converter',
    subcategoryId: 'p15b-sub-conv',
    tags: ['converter', 'timezone', 'utc', 'offset', 'world-time', 'datetime'],
    formula: 'UTC Time + Timezone Offset Hours = Local Target Time',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. HTML Accessibility Structure Checker
  {
    id: 'html-accessibility-structure-checker',
    name: 'HTML Accessibility & Semantic Structure Checker',
    shortDesc: 'Inspect HTML snippets for WCAG semantic landmarks, heading hierarchy skips, missing alt attributes, and form labels',
    category: 'checkers',
    subcategoryId: 'p15b-sub-check',
    tags: ['checkers', 'accessibility', 'html', 'wcag', 'semantic', 'audit'],
    formula: 'DOM tag and attribute heuristic structural validation rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Professional Business Proposal Generator
  {
    id: 'business-proposal-generator',
    name: 'Professional Business Proposal Generator',
    shortDesc: 'Generate structured commercial proposal documents including executive summary, scope, deliverables, timeline, and pricing',
    category: 'generators',
    subcategoryId: 'p15b-sub-gen',
    tags: ['generator', 'business-proposal', 'commercial', 'contract', 'markdown'],
    formula: 'Structured business proposal template composition',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Personal Debt Snowball & Avalanche Planner
  {
    id: 'debt-snowball-avalanche-planner',
    name: 'Personal Debt Snowball & Avalanche Payoff Planner',
    shortDesc: 'Compare debt repayment strategies (Snowball vs. Avalanche), estimating payoff timelines and total interest paid',
    category: 'planners',
    subcategoryId: 'p15b-sub-plan',
    tags: ['planner', 'debt', 'snowball', 'avalanche', 'repayment', 'finance'],
    formula: 'Monthly amortization schedule with prioritized extra principal allocation',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Markdown-to-HTML Converter
  {
    id: 'markdown-to-html-converter',
    name: 'Markdown-to-HTML Converter & Sanitizer',
    shortDesc: 'Convert Markdown text into clean, safe HTML markup with live preview and syntax escaping',
    category: 'additional-tools',
    subcategoryId: 'p15b-sub-tools',
    tags: ['tools', 'markdown', 'html', 'converter', 'parser', 'developer'],
    formula: 'Markdown syntax tokenization to HTML string rendering',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Text Case & Formatting Batch Processor
  {
    id: 'text-formatting-processor',
    name: 'Text Case & Formatting Batch Processor',
    shortDesc: 'Apply batch text transformations (casing, whitespace stripping, line sorting, prefix/suffix insertion) locally',
    category: 'additional-tools',
    subcategoryId: 'p15b-sub-tools',
    tags: ['tools', 'text', 'formatting', 'casing', 'batch-processor', 'utility'],
    formula: 'String transformation operations and regex normalization',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 9. Subscription Renewal & Cost Tracker
  {
    id: 'subscription-cost-tracker',
    name: 'Subscription Renewal & Recurring Cost Tracker',
    shortDesc: 'Track SaaS subscriptions, billing cycles, renewal dates, and aggregate monthly and annual expenditures',
    category: 'trackers',
    subcategoryId: 'p15b-sub-track',
    tags: ['trackers', 'subscription', 'renewal', 'recurring-cost', 'expenses', 'budget'],
    formula: 'Annual Cost = Monthly Cost × 12; Monthly Cost = Annual Cost / 12',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 10. Common Business Document & Invoice Terms Reference
  {
    id: 'business-invoice-terms-reference',
    name: 'Commercial Document & Invoice Terms Reference',
    shortDesc: 'Reference guide explaining commercial invoice terms (Net 30, FOB, EOM, Pro Forma, Retainer, PO numbers)',
    category: 'guides',
    subcategoryId: 'p15b-sub-guides',
    tags: ['guides', 'business', 'invoice', 'commercial-terms', 'accounting', 'reference'],
    formula: 'Standard commercial terminology and Incoterms glossary definitions',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
