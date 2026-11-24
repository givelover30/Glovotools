import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH59_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17f-sub-calc', categoryId: 'business-operations', name: 'Phase 17F Customer Concentration & Absenteeism', slug: 'phase17f-concentration-absenteeism', description: 'Customer concentration risk and employee absenteeism cost calculators', sortOrder: 135 },
  { id: 'p17f-sub-conv', categoryId: 'converter', name: 'Phase 17F Invoice Factoring', slug: 'phase17f-factoring-conv', description: 'Invoice factoring fee and advance rate conversion utility', sortOrder: 135 },
  { id: 'p17f-sub-check', categoryId: 'checkers', name: 'Phase 17F Bank Reconciliation', slug: 'phase17f-bank-recon-check', description: 'Bank statement and general ledger reconciliation checker', sortOrder: 135 },
  { id: 'p17f-sub-gen', categoryId: 'generators', name: 'Phase 17F Vendor Onboarding', slug: 'phase17f-vendor-onboarding-gen', description: 'Vendor onboarding checklist document generator', sortOrder: 135 },
  { id: 'p17f-sub-plan', categoryId: 'planners', name: 'Phase 17F Franchise Evaluation', slug: 'phase17f-franchise-plan', description: 'Franchise opportunity evaluation and capital planner', sortOrder: 135 },
  { id: 'p17f-sub-tools', categoryId: 'additional-tools', name: 'Phase 17F Subscription Cohort Analysis', slug: 'phase17f-cohort-tool', description: 'Subscription revenue cohort analysis and retention utility', sortOrder: 135 },
  { id: 'p17f-sub-track', categoryId: 'trackers', name: 'Phase 17F Asset Warranty & Maintenance', slug: 'phase17f-asset-warranty-track', description: 'Business asset warranty and maintenance schedule tracker', sortOrder: 135 },
  { id: 'p17f-sub-guides', categoryId: 'guides', name: 'Phase 17F Trade Finance & Internal Controls', slug: 'phase17f-trade-finance-controls-guides', description: 'Import/export finance terms and small business internal controls references', sortOrder: 135 }
];

export const BATCH59_METADATA: CalculatorMeta[] = [
  {
    id: 'customer-concentration-risk-calculator',
    name: 'Customer Concentration Risk Calculator',
    shortDesc: 'Calculate revenue concentration percentages across top clients and evaluate business risk exposure using Herfindahl-Hirschman Index (HHI)',
    category: 'business-operations',
    subcategoryId: 'p17f-sub-calc',
    tags: ['business', 'customer-concentration', 'risk-management', 'revenue-share', 'calculators'],
    formula: 'Top Client Share % = (Top Client Revenue / Total Revenue) × 100%',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'employee-absenteeism-cost-calculator',
    name: 'Employee Absenteeism Cost Calculator',
    shortDesc: 'Calculate the total financial cost of employee absenteeism including sick leave pay, overtime replacement, and lost productivity',
    category: 'business-operations',
    subcategoryId: 'p17f-sub-calc',
    tags: ['business', 'absenteeism', 'hr', 'payroll', 'productivity', 'calculators'],
    formula: 'Absenteeism Cost = Total Lost Days × Daily Compensation & Overtime Cost',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'invoice-factoring-fee-advance-rate-converter',
    name: 'Invoice Factoring Fee & Advance Rate Converter',
    shortDesc: 'Convert invoice factoring fee structures, advance rates, reserve amounts, and discount charges into annualized effective interest rates',
    category: 'converter',
    subcategoryId: 'p17f-sub-conv',
    tags: ['converter', 'invoice-factoring', 'advance-rate', 'discount-fee', 'financing', 'financial'],
    formula: 'Effective APR = (Factoring Fee / Advance Rate) × (365 / Days to Pay)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'bank-reconciliation-checker',
    name: 'Bank Reconciliation Checker',
    shortDesc: 'Reconcile bank statement balances with general ledger cash accounts by accounting for outstanding checks and deposits in transit',
    category: 'checkers',
    subcategoryId: 'p17f-sub-check',
    tags: ['checkers', 'bank-reconciliation', 'accounting', 'cash-audit', 'ledger', 'validation'],
    formula: 'Adjusted Bank Balance = Bank Statement + Deposits in Transit - Outstanding Checks',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'vendor-onboarding-checklist-generator',
    name: 'Vendor Onboarding Checklist Generator',
    shortDesc: 'Generate comprehensive vendor onboarding checklists including W-9 collection, banking verification, risk assessment, and contract review',
    category: 'generators',
    subcategoryId: 'p17f-sub-gen',
    tags: ['generators', 'vendor-onboarding', 'procurement', 'compliance', 'checklist', 'business'],
    formula: 'Structured Vendor Onboarding & Compliance Verification Protocol',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'franchise-evaluation-planner',
    name: 'Franchise Evaluation Planner',
    shortDesc: 'Plan and evaluate franchise opportunities across initial franchise fees, ongoing royalties, working capital requirements, and projected ROI',
    category: 'planners',
    subcategoryId: 'p17f-sub-plan',
    tags: ['planners', 'franchise', 'business-evaluation', 'roi', 'royalties', 'planning'],
    formula: 'Total Initial Investment = Franchise Fee + Setup Costs + Working Capital',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'subscription-revenue-cohort-analysis-utility',
    name: 'Subscription Revenue Cohort Analysis Utility',
    shortDesc: 'Analyze subscription SaaS customer cohort retention rates, monthly recurring revenue (MRR) retention, and customer churn over time',
    category: 'additional-tools',
    subcategoryId: 'p17f-sub-tools',
    tags: ['tools', 'cohort-analysis', 'subscription', 'saas', 'mrr-retention', 'utility'],
    formula: 'Cohort Retention % = (Active Customers at Month N / Initial Cohort Size) × 100%',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-asset-warranty-maintenance-tracker',
    name: 'Business Asset Warranty & Maintenance Tracker',
    shortDesc: 'Track enterprise physical asset warranties, scheduled maintenance intervals, depreciation status, and service logs with local persistence',
    category: 'trackers',
    subcategoryId: 'p17f-sub-track',
    tags: ['trackers', 'asset-tracking', 'warranty', 'maintenance', 'equipment', 'tracking'],
    formula: 'Days Until Warranty Expiration = Warranty End Date - Current Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'import-export-finance-terms-reference',
    name: 'Import & Export Finance Terms Reference',
    shortDesc: 'Reference guide covering international trade finance instruments including letters of credit (LC), documentary collections, and Incoterms',
    category: 'guides',
    subcategoryId: 'p17f-sub-guides',
    tags: ['guides', 'trade-finance', 'import-export', 'letters-of-credit', 'incoterms', 'reference'],
    formula: 'International Trade Finance & Incoterms Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'small-business-internal-controls-reference',
    name: 'Small Business Internal Controls Reference',
    shortDesc: 'Reference guide explaining segregation of duties, dual authorization, petty cash controls, and fraud prevention best practices',
    category: 'guides',
    subcategoryId: 'p17f-sub-guides',
    tags: ['guides', 'internal-controls', 'fraud-prevention', 'segregation-of-duties', 'accounting', 'reference'],
    formula: 'COSO Internal Control Principles & Accounting Safeguard Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
