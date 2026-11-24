import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH58_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17e-sub-calc', categoryId: 'business-operations', name: 'Phase 17E Profitability & Turnover', slug: 'phase17e-profit-turnover', description: 'Business profitability forecast and employee turnover cost calculators', sortOrder: 130 },
  { id: 'p17e-sub-conv', categoryId: 'converter', name: 'Phase 17E Loan APR & Borrowing Cost', slug: 'phase17e-apr-conv', description: 'Loan APR and total borrowing cost conversion utility', sortOrder: 130 },
  { id: 'p17e-sub-check', categoryId: 'checkers', name: 'Phase 17E Budget Variance', slug: 'phase17e-budget-check', description: 'Business budget variance checker and financial audit utility', sortOrder: 130 },
  { id: 'p17e-sub-gen', categoryId: 'generators', name: 'Phase 17E Customer Credit Application', slug: 'phase17e-credit-app-gen', description: 'Customer credit application form generator', sortOrder: 130 },
  { id: 'p17e-sub-plan', categoryId: 'planners', name: 'Phase 17E Expansion Readiness', slug: 'phase17e-expansion-plan', description: 'Business expansion readiness and strategic growth planner', sortOrder: 130 },
  { id: 'p17e-sub-tools', categoryId: 'additional-tools', name: 'Phase 17E Sales Performance Benchmark', slug: 'phase17e-sales-benchmark-tool', description: 'Sales performance metric benchmark utility', sortOrder: 130 },
  { id: 'p17e-sub-track', categoryId: 'trackers', name: 'Phase 17E License & Permit Renewal', slug: 'phase17e-license-track', description: 'Business license and regulatory permit renewal tracker', sortOrder: 130 },
  { id: 'p17e-sub-guides', categoryId: 'guides', name: 'Phase 17E Recordkeeping & Risk Assessment', slug: 'phase17e-record-risk-guides', description: 'Small business recordkeeping and risk assessment framework references', sortOrder: 130 }
];

export const BATCH58_METADATA: CalculatorMeta[] = [
  {
    id: 'business-profitability-forecast-calculator',
    name: 'Business Profitability Forecast Calculator',
    shortDesc: 'Forecast future business net profit, gross margins, and operating income across projected revenue and expense growth rates',
    category: 'business-operations',
    subcategoryId: 'p17e-sub-calc',
    tags: ['business', 'profitability', 'forecast', 'net-profit', 'margin', 'calculators'],
    formula: 'Forecast Net Profit = Projected Revenue × Projected Margin % - Projected Expenses',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'employee-turnover-cost-calculator',
    name: 'Employee Turnover Cost Calculator',
    shortDesc: 'Calculate the total financial cost of employee turnover including separation costs, recruitment, onboarding, and lost productivity',
    category: 'business-operations',
    subcategoryId: 'p17e-sub-calc',
    tags: ['business', 'employee-turnover', 'hr', 'hiring-cost', 'retention', 'calculators'],
    formula: 'Total Turnover Cost = Number of Departures × Average Cost Per Departure',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'loan-apr-total-borrowing-cost-converter',
    name: 'Loan APR & Total Borrowing Cost Converter',
    shortDesc: 'Convert nominal loan interest rates into true Annual Percentage Rate (APR) including origination fees, closing costs, and total borrowing expenses',
    category: 'converter',
    subcategoryId: 'p17e-sub-conv',
    tags: ['converter', 'loan-apr', 'borrowing-cost', 'interest', 'fees', 'financial'],
    formula: 'True APR = Effective Interest Rate adjusted for Upfront Fees and Loan Term',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'business-budget-variance-checker',
    name: 'Business Budget Variance Checker',
    shortDesc: 'Analyze budget variances by comparing actual revenues and expenditures against planned budget baselines and flagging unfavorable variances',
    category: 'checkers',
    subcategoryId: 'p17e-sub-check',
    tags: ['checkers', 'budget-variance', 'accounting', 'financial-analysis', 'audit', 'validation'],
    formula: 'Variance $ = Actual - Budget; Variance % = (Variance $ / Budget) × 100%',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'customer-credit-application-generator',
    name: 'Customer Credit Application Generator',
    shortDesc: 'Generate professional customer credit application forms with trade references, bank details, credit limits, and terms of sale',
    category: 'generators',
    subcategoryId: 'p17e-sub-gen',
    tags: ['generators', 'credit-application', 'commercial-credit', 'customer', 'business', 'form'],
    formula: 'Structured Commercial Credit Application & Trade Reference Template',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'business-expansion-readiness-planner',
    name: 'Business Expansion Readiness Planner',
    shortDesc: 'Evaluate business readiness for geographic or operational expansion across financial reserves, team capacity, market demand, and infrastructure',
    category: 'planners',
    subcategoryId: 'p17e-sub-plan',
    tags: ['planners', 'business-expansion', 'growth', 'readiness', 'strategic-planning', 'milestones'],
    formula: 'Expansion Readiness Score = Sum(Weighted Pillar Readiness Assessments)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'sales-performance-benchmark-utility',
    name: 'Sales Performance Benchmark Utility',
    shortDesc: 'Benchmark sales team performance metrics including conversion rates, average deal size, sales cycle length, and quota attainment',
    category: 'additional-tools',
    subcategoryId: 'p17e-sub-tools',
    tags: ['tools', 'sales-benchmark', 'performance', 'metrics', 'conversion-rate', 'utility'],
    formula: 'Quota Attainment % = (Actual Sales / Quota Target) × 100%',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-license-permit-renewal-tracker',
    name: 'Business License & Permit Renewal Tracker',
    shortDesc: 'Track business operating licenses, regulatory permits, renewal deadlines, issuing agencies, and fees with local persistence',
    category: 'trackers',
    subcategoryId: 'p17e-sub-track',
    tags: ['trackers', 'business-license', 'permit-renewal', 'compliance', 'deadlines', 'tracking'],
    formula: 'Days Until Renewal = License Expiration Date - Current Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-recordkeeping-reference',
    name: 'Small Business Recordkeeping Reference',
    shortDesc: 'Reference guide covering statutory record retention periods, tax documentation, receipts, payroll records, and financial statements',
    category: 'guides',
    subcategoryId: 'p17e-sub-guides',
    tags: ['guides', 'recordkeeping', 'retention-period', 'tax-records', 'accounting', 'reference'],
    formula: 'Tax & Financial Record Retention Period Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-risk-assessment-framework',
    name: 'Business Risk Assessment Framework',
    shortDesc: 'Reference guide and matrix explaining qualitative risk assessment, probability/impact scoring, and operational risk mitigation strategies',
    category: 'guides',
    subcategoryId: 'p17e-sub-guides',
    tags: ['guides', 'risk-assessment', 'risk-matrix', 'mitigation', 'governance', 'reference'],
    formula: 'Risk Score = Probability (1-5) × Impact Severity (1-5)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
