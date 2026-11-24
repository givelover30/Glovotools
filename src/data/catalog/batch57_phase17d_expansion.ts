import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH57_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17d-sub-calc', categoryId: 'financial', name: 'Phase 17D Loan Amortization & CAC Payback', slug: 'phase17d-loan-cac', description: 'Business loan amortization and customer acquisition payback calculators', sortOrder: 125 },
  { id: 'p17d-sub-conv', categoryId: 'converter', name: 'Phase 17D Annualized Return', slug: 'phase17d-return-conv', description: 'Annualized return and holding period conversion utility', sortOrder: 125 },
  { id: 'p17d-sub-check', categoryId: 'checkers', name: 'Phase 17D Financial Document Consistency', slug: 'phase17d-financial-consistency-check', description: 'Financial statement cross-document consistency checker', sortOrder: 125 },
  { id: 'p17d-sub-gen', categoryId: 'generators', name: 'Phase 17D Business Credit Policy', slug: 'phase17d-credit-policy-gen', description: 'Business credit policy document generator', sortOrder: 125 },
  { id: 'p17d-sub-plan', categoryId: 'planners', name: 'Phase 17D Business Continuity', slug: 'phase17d-continuity-plan', description: 'Business continuity and disaster recovery planning tool', sortOrder: 125 },
  { id: 'p17d-sub-tools', categoryId: 'additional-tools', name: 'Phase 17D Revenue Forecast Scenario', slug: 'phase17d-revenue-forecast-tool', description: 'Revenue forecast scenario modeling utility', sortOrder: 125 },
  { id: 'p17d-sub-track', categoryId: 'trackers', name: 'Phase 17D Contract Renewal', slug: 'phase17d-contract-renewal-track', description: 'Business contract renewal and expiration tracker', sortOrder: 125 },
  { id: 'p17d-sub-guides', categoryId: 'guides', name: 'Phase 17D Financing Options & Governance', slug: 'phase17d-financing-governance-guides', description: 'Small business financing options and corporate governance references', sortOrder: 125 }
];

export const BATCH57_METADATA: CalculatorMeta[] = [
  {
    id: 'business-loan-payment-amortization-calculator',
    name: 'Business Loan Payment & Amortization Calculator',
    shortDesc: 'Calculate monthly commercial loan payments, total interest over loan life, and amortization schedules with principal/interest breakdowns',
    category: 'financial',
    subcategoryId: 'p17d-sub-calc',
    tags: ['financial', 'business-loan', 'amortization', 'loan-payment', 'interest', 'calculators'],
    formula: 'M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'customer-acquisition-payback-period-calculator',
    name: 'Customer Acquisition Payback Period Calculator',
    shortDesc: 'Calculate the months required to recover Customer Acquisition Cost (CAC) using average monthly gross margin per customer',
    category: 'business-operations',
    subcategoryId: 'p17d-sub-calc',
    tags: ['business', 'cac', 'payback-period', 'customer-acquisition', 'saas', 'calculators'],
    formula: 'Payback Months = CAC / (ARPU × Gross Margin %)',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'annualized-return-holding-period-converter',
    name: 'Annualized Return & Holding Period Converter',
    shortDesc: 'Convert between cumulative holding period investment returns and annualized compound annual growth rate (CAGR) percentages',
    category: 'converter',
    subcategoryId: 'p17d-sub-conv',
    tags: ['converter', 'annualized-return', 'cagr', 'holding-period', 'investment', 'finance'],
    formula: 'CAGR = (Ending Value / Beginning Value)^(1 / Years) - 1',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'financial-document-consistency-checker',
    name: 'Financial Document Consistency Checker',
    shortDesc: 'Audit financial statements for cross-document consistency between income statements, balance sheets, and cash flow statements',
    category: 'checkers',
    subcategoryId: 'p17d-sub-check',
    tags: ['checkers', 'financial-audit', 'consistency', 'balance-sheet', 'income-statement', 'accounting'],
    formula: 'Balance Sheet Equality: Assets = Liabilities + Equity',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-credit-policy-generator',
    name: 'Business Credit Policy Generator',
    shortDesc: 'Generate structured commercial credit application policies, credit limits, payment terms, and credit review procedures',
    category: 'generators',
    subcategoryId: 'p17d-sub-gen',
    tags: ['generators', 'credit-policy', 'commercial-credit', 'business', 'terms', 'generator'],
    formula: 'Structured Commercial Credit Policy Document & Review Framework',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'business-continuity-planning-tool',
    name: 'Business Continuity Planning Tool',
    shortDesc: 'Plan business continuity and disaster recovery strategies, risk assessments, critical operational dependencies, and recovery time objectives (RTO)',
    category: 'planners',
    subcategoryId: 'p17d-sub-plan',
    tags: ['planners', 'business-continuity', 'disaster-recovery', 'risk-assessment', 'rto', 'planning'],
    formula: 'Continuity Risk Assessment & Recovery Time Objective Schedule',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'revenue-forecast-scenario-utility',
    name: 'Revenue Forecast Scenario Utility',
    shortDesc: 'Model multi-year revenue growth projections across conservative, moderate, and aggressive scenario growth rates',
    category: 'additional-tools',
    subcategoryId: 'p17d-sub-tools',
    tags: ['tools', 'revenue-forecast', 'scenario-modeling', 'growth', 'projection', 'utility'],
    formula: 'Future Revenue = Current Revenue × (1 + Growth Rate)^Years',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-contract-renewal-tracker',
    name: 'Business Contract Renewal Tracker',
    shortDesc: 'Track enterprise vendor and customer contract renewal dates, notice periods, contract values, and status with local persistence',
    category: 'trackers',
    subcategoryId: 'p17d-sub-track',
    tags: ['trackers', 'contract-renewal', 'vendor-management', 'agreements', 'tracking', 'expiration'],
    formula: 'Days Until Renewal = Contract Renewal Date - Current Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-financing-options-reference',
    name: 'Small Business Financing Options Reference',
    shortDesc: 'Reference guide covering SBA loans, business lines of credit, equipment financing, angel investing, and venture capital',
    category: 'guides',
    subcategoryId: 'p17d-sub-guides',
    tags: ['guides', 'small-business-financing', 'sba-loans', 'capital', 'funding', 'reference'],
    formula: 'Business Funding Vehicle & Capital Structure Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'corporate-governance-compliance-reference',
    name: 'Corporate Governance & Compliance Reference',
    shortDesc: 'Reference guide covering board of directors duties, shareholder resolutions, annual filings, and regulatory compliance standards',
    category: 'guides',
    subcategoryId: 'p17d-sub-guides',
    tags: ['guides', 'corporate-governance', 'compliance', 'board-of-directors', 'legal', 'reference'],
    formula: 'Corporate Governance, Regulatory Filings & Compliance Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
