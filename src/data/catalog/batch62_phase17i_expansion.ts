import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH62_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17i-sub-calc', categoryId: 'business-operations', name: 'Phase 17I Break-Even Sales & Healthcare Benefit', slug: 'phase17i-breakeven-healthcare-calc', description: 'Business break-even sales volume and employee healthcare benefit cost calculators', sortOrder: 150 },
  { id: 'p17i-sub-conv', categoryId: 'converter', name: 'Phase 17I Currency Denomination', slug: 'phase17i-denomination-conv', description: 'Currency denomination and cash till breakdown converter', sortOrder: 150 },
  { id: 'p17i-sub-check', categoryId: 'checkers', name: 'Phase 17I General Ledger Account Balance', slug: 'phase17i-ledger-balance-check', description: 'General ledger trial balance equilibrium checker', sortOrder: 150 },
  { id: 'p17i-sub-gen', categoryId: 'generators', name: 'Phase 17I Non-Disclosure Agreement', slug: 'phase17i-nda-gen', description: 'Business non-disclosure agreement outline generator', sortOrder: 150 },
  { id: 'p17i-sub-plan', categoryId: 'planners', name: 'Phase 17I Product Launch Marketing', slug: 'phase17i-product-launch-plan', description: 'Product launch marketing strategy and milestone planner', sortOrder: 150 },
  { id: 'p17i-sub-tools', categoryId: 'additional-tools', name: 'Phase 17I E-commerce Funnel Conversion', slug: 'phase17i-funnel-conversion-tool', description: 'E-commerce funnel conversion rate utility', sortOrder: 150 },
  { id: 'p17i-sub-track', categoryId: 'trackers', name: 'Phase 17I Vehicle Fleet Maintenance', slug: 'phase17i-fleet-maintenance-track', description: 'Business vehicle fleet maintenance and mileage tracker', sortOrder: 150 },
  { id: 'p17i-sub-guides', categoryId: 'guides', name: 'Phase 17I Cybersecurity & CSR References', slug: 'phase17i-cybersecurity-csr-guides', description: 'Small business cybersecurity best practices and corporate social responsibility references', sortOrder: 150 }
];

export const BATCH62_METADATA: CalculatorMeta[] = [
  {
    id: 'business-break-even-sales-volume-calculator',
    name: 'Business Break-Even Sales Volume Calculator',
    shortDesc: 'Calculate unit sales volume and revenue required to cover fixed operating costs based on contribution margin per unit',
    category: 'business-operations',
    subcategoryId: 'p17i-sub-calc',
    tags: ['business', 'break-even', 'sales-volume', 'fixed-costs', 'contribution-margin', 'calculators'],
    formula: 'Break-Even Units = Fixed Costs / (Price per Unit - Variable Cost per Unit)',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'employee-healthcare-benefit-cost-calculator',
    name: 'Employee Healthcare Benefit Cost Calculator',
    shortDesc: 'Calculate employer and employee healthcare benefit premium contributions, total health plan costs, and per-employee expenses',
    category: 'business-operations',
    subcategoryId: 'p17i-sub-calc',
    tags: ['business', 'healthcare-benefit', 'employee-benefits', 'insurance', 'payroll', 'calculators'],
    formula: 'Employer Health Cost = Total Premium × Employer Contribution % × Headcount',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'currency-denomination-breakdown-converter',
    name: 'Currency Denomination & Breakdown Converter',
    shortDesc: 'Calculate optimal cash till drawer denominations and currency note/coin breakdowns for retail float management',
    category: 'converter',
    subcategoryId: 'p17i-sub-conv',
    tags: ['converter', 'currency-denomination', 'cash-till', 'cash-breakdown', 'retail', 'utility'],
    formula: 'Note Count = Math.floor(Remaining Amount / Denomination Value)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'general-ledger-account-balance-verification-checker',
    name: 'General Ledger Account Balance Verification Checker',
    shortDesc: 'Verify trial balance equilibrium by checking that total general ledger debit balances equal total credit balances',
    category: 'checkers',
    subcategoryId: 'p17i-sub-check',
    tags: ['checkers', 'general-ledger', 'trial-balance', 'debit-credit', 'accounting', 'validation'],
    formula: 'Trial Balance Difference = Sum(Debits) - Sum(Credits)',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-nda-outline-generator',
    name: 'Business Non-Disclosure Agreement (NDA) Outline Generator',
    shortDesc: 'Generate structured non-disclosure agreement outlines including definition of confidential information, permitted use, and term duration',
    category: 'generators',
    subcategoryId: 'p17i-sub-gen',
    tags: ['generators', 'nda', 'non-disclosure', 'legal', 'confidentiality', 'business'],
    formula: 'Structured Non-Disclosure Agreement Template & Restrictive Covenants',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'product-launch-marketing-strategy-planner',
    name: 'Product Launch Marketing Strategy Planner',
    shortDesc: 'Plan product launch marketing phases, pre-launch teaser campaigns, go-to-market channels, promotional budgets, and milestone dates',
    category: 'planners',
    subcategoryId: 'p17i-sub-plan',
    tags: ['planners', 'product-launch', 'marketing-strategy', 'go-to-market', 'planning', 'milestones'],
    formula: 'Launch Phase Timeline & Go-to-Market Milestone Schedule',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'ecommerce-funnel-conversion-rate-utility',
    name: 'E-commerce Funnel Conversion Rate Utility',
    shortDesc: 'Analyze e-commerce conversion funnel drop-off rates across visitors, product views, cart additions, checkouts, and completed purchases',
    category: 'additional-tools',
    subcategoryId: 'p17i-sub-tools',
    tags: ['tools', 'ecommerce-funnel', 'conversion-rate', 'checkout-dropoff', 'analytics', 'utility'],
    formula: 'Conversion Rate % = (Completed Purchases / Total Visitors) × 100%',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-vehicle-fleet-maintenance-tracker',
    name: 'Business Vehicle Fleet Maintenance Tracker',
    shortDesc: 'Track corporate vehicle mileage, scheduled oil changes, tire rotations, insurance renewals, and maintenance costs with local persistence',
    category: 'trackers',
    subcategoryId: 'p17i-sub-track',
    tags: ['trackers', 'fleet-maintenance', 'vehicle-tracking', 'mileage', 'automotive', 'tracking'],
    formula: 'Next Service Due Mileage = Last Service Mileage + Service Interval',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-cybersecurity-best-practices-reference',
    name: 'Small Business Cybersecurity Best Practices Reference',
    shortDesc: 'Reference guide covering multi-factor authentication (MFA), password policies, endpoint security, phishing awareness, and data backups',
    category: 'guides',
    subcategoryId: 'p17i-sub-guides',
    tags: ['guides', 'cybersecurity', 'mfa', 'endpoint-security', 'data-protection', 'reference'],
    formula: 'Small Business Security Controls & Threat Mitigation Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'corporate-social-responsibility-reference',
    name: 'Corporate Social Responsibility (CSR) Reference',
    shortDesc: 'Reference guide explaining ESG (Environmental, Social, Governance) reporting frameworks, sustainability initiatives, and ethical supply chains',
    category: 'guides',
    subcategoryId: 'p17i-sub-guides',
    tags: ['guides', 'csr', 'esg', 'sustainability', 'governance', 'reference'],
    formula: 'ESG Framework & Corporate Social Responsibility Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
