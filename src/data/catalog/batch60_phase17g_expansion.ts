import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH60_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17g-sub-calc', categoryId: 'business-operations', name: 'Phase 17G Retention & Debt Service', slug: 'phase17g-retention-dscr', description: 'Customer retention rate and debt service coverage ratio calculators', sortOrder: 140 },
  { id: 'p17g-sub-conv', categoryId: 'converter', name: 'Phase 17G Gross-to-Net Revenue', slug: 'phase17g-gross-net-conv', description: 'Gross-to-net revenue conversion utility', sortOrder: 140 },
  { id: 'p17g-sub-check', categoryId: 'checkers', name: 'Phase 17G Payroll Register Validation', slug: 'phase17g-payroll-check', description: 'Payroll register and tax withholding validation checker', sortOrder: 140 },
  { id: 'p17g-sub-gen', categoryId: 'generators', name: 'Phase 17G Meeting Minutes', slug: 'phase17g-meeting-minutes-gen', description: 'Corporate business meeting minutes document generator', sortOrder: 140 },
  { id: 'p17g-sub-plan', categoryId: 'planners', name: 'Phase 17G Business Succession', slug: 'phase17g-succession-plan', description: 'Business succession and ownership transition planner', sortOrder: 140 },
  { id: 'p17g-sub-tools', categoryId: 'additional-tools', name: 'Phase 17G Multi-Channel Sales Attribution', slug: 'phase17g-attribution-tool', description: 'Multi-channel sales and marketing attribution utility', sortOrder: 140 },
  { id: 'p17g-sub-track', categoryId: 'trackers', name: 'Phase 17G Equipment Depreciation', slug: 'phase17g-depreciation-track', description: 'Business equipment depreciation and fixed asset tracker', sortOrder: 140 },
  { id: 'p17g-sub-guides', categoryId: 'guides', name: 'Phase 17G Data Privacy & Financial Reporting', slug: 'phase17g-privacy-reporting-guides', description: 'Small business data privacy and corporate financial reporting references', sortOrder: 140 }
];

export const BATCH60_METADATA: CalculatorMeta[] = [
  {
    id: 'customer-retention-rate-calculator',
    name: 'Customer Retention Rate Calculator',
    shortDesc: 'Calculate customer retention rate (CRR) and customer churn rate over a given period using starting, ending, and newly acquired customer counts',
    category: 'business-operations',
    subcategoryId: 'p17g-sub-calc',
    tags: ['business', 'customer-retention', 'crr', 'churn-rate', 'saas', 'calculators'],
    formula: 'Retention Rate % = ((End Customers - New Customers) / Start Customers) × 100%',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'business-debt-service-coverage-calculator',
    name: 'Business Debt Service Coverage Calculator',
    shortDesc: 'Calculate Debt Service Coverage Ratio (DSCR) using net operating income and total debt service obligations for commercial loan qualification',
    category: 'financial',
    subcategoryId: 'p17g-sub-calc',
    tags: ['business', 'dscr', 'debt-service', 'commercial-loan', 'financing', 'calculators'],
    formula: 'DSCR = Net Operating Income / Total Debt Service',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'gross-to-net-revenue-converter',
    name: 'Gross-to-Net Revenue Converter',
    shortDesc: 'Convert gross revenue into net revenue by accounting for discounts, returns, allowances, and channel commissions',
    category: 'converter',
    subcategoryId: 'p17g-sub-conv',
    tags: ['converter', 'gross-to-net', 'revenue', 'discounts', 'allowances', 'accounting'],
    formula: 'Net Revenue = Gross Revenue - Discounts - Returns - Allowances',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'payroll-register-validation-checker',
    name: 'Payroll Register Validation Checker',
    shortDesc: 'Validate payroll register totals, gross pay calculations, tax withholding arithmetic, deductions, and net pay distributions',
    category: 'checkers',
    subcategoryId: 'p17g-sub-check',
    tags: ['checkers', 'payroll-register', 'validation', 'tax-withholding', 'audit', 'hr'],
    formula: 'Net Pay = Gross Pay - Federal/State Taxes - FICA - Deductions',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-meeting-minutes-generator',
    name: 'Business Meeting Minutes Generator',
    shortDesc: 'Generate structured corporate meeting minutes with attendees, agenda items, discussion notes, resolutions passed, and action item assignments',
    category: 'generators',
    subcategoryId: 'p17g-sub-gen',
    tags: ['generators', 'meeting-minutes', 'corporate-governance', 'agenda', 'action-items', 'business'],
    formula: 'Structured Corporate Meeting Minutes Template & Resolution Record',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'business-succession-planning-tool',
    name: 'Business Succession Planning Tool',
    shortDesc: 'Plan business succession, leadership transition timelines, ownership transfer methods, and valuation contingencies',
    category: 'planners',
    subcategoryId: 'p17g-sub-plan',
    tags: ['planners', 'succession-planning', 'leadership-transition', 'ownership', 'strategic-planning', 'milestones'],
    formula: 'Succession Timeline & Milestone Transition Schedule',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'multi-channel-sales-attribution-utility',
    name: 'Multi-Channel Sales Attribution Utility',
    shortDesc: 'Calculate revenue and conversion credit allocation across marketing channels using first-touch, last-touch, linear, and time-decay attribution models',
    category: 'additional-tools',
    subcategoryId: 'p17g-sub-tools',
    tags: ['tools', 'sales-attribution', 'marketing', 'channel-roi', 'conversion', 'utility'],
    formula: 'Channel Credit Allocation = Attribution Weight × Conversion Revenue',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-equipment-depreciation-tracker',
    name: 'Business Equipment Depreciation Tracker',
    shortDesc: 'Track business machinery and equipment depreciation over time using straight-line and declining balance methods with local persistence',
    category: 'trackers',
    subcategoryId: 'p17g-sub-track',
    tags: ['trackers', 'equipment-depreciation', 'fixed-assets', 'accounting', 'tracking', 'tax'],
    formula: 'Annual Depreciation = (Cost - Salvage Value) / Useful Life',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-data-privacy-reference',
    name: 'Small Business Data Privacy Reference',
    shortDesc: 'Reference guide covering customer data privacy regulations including GDPR, CCPA, data security best practices, and breach response',
    category: 'guides',
    subcategoryId: 'p17g-sub-guides',
    tags: ['guides', 'data-privacy', 'gdpr', 'ccpa', 'cybersecurity', 'reference'],
    formula: 'Data Privacy Compliance & Security Safeguard Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'corporate-financial-reporting-reference',
    name: 'Corporate Financial Reporting Reference',
    shortDesc: 'Reference guide explaining GAAP/IFRS reporting standards, balance sheet classifications, income statements, and disclosures',
    category: 'guides',
    subcategoryId: 'p17g-sub-guides',
    tags: ['guides', 'financial-reporting', 'gaap', 'ifrs', 'accounting-standards', 'reference'],
    formula: 'Corporate Financial Statement Disclosure & Reporting Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
