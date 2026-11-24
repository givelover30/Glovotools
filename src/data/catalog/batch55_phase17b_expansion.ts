import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH55_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17b-sub-calc', categoryId: 'business-operations', name: 'Phase 17B Valuation & ROAS', slug: 'phase17b-valuation-roas', description: 'Small business valuation and e-commerce break-even ROAS calculators', sortOrder: 115 },
  { id: 'p17b-sub-conv', categoryId: 'converter', name: 'Phase 17B Interest Rates', slug: 'phase17b-interest-conv', description: 'Nominal and effective interest rate conversion utility', sortOrder: 115 },
  { id: 'p17b-sub-check', categoryId: 'checkers', name: 'Phase 17B PO & Invoice Matching', slug: 'phase17b-po-invoice-check', description: 'Purchase order and supplier invoice matching checker', sortOrder: 115 },
  { id: 'p17b-sub-gen', categoryId: 'generators', name: 'Phase 17B Cash Flow Statement', slug: 'phase17b-cashflow-gen', description: 'Operating, investing, and financing cash flow statement generator', sortOrder: 115 },
  { id: 'p17b-sub-plan', categoryId: 'planners', name: 'Phase 17B Pricing Strategy', slug: 'phase17b-pricing-plan', description: 'Business pricing strategy and margin planner', sortOrder: 115 },
  { id: 'p17b-sub-tools', categoryId: 'additional-tools', name: 'Phase 17B Payment Processing Fees', slug: 'phase17b-processing-fee-tool', description: 'Merchant payment processing fee comparison utility', sortOrder: 115 },
  { id: 'p17b-sub-track', categoryId: 'trackers', name: 'Phase 17B Accounts Receivable', slug: 'phase17b-ar-track', description: 'Accounts receivable collection and invoice tracking', sortOrder: 115 },
  { id: 'p17b-sub-guides', categoryId: 'guides', name: 'Phase 17B Tax Deductions & Payment Terms', slug: 'phase17b-tax-payment-guides', description: 'Small business tax deductions and payment terms references', sortOrder: 115 }
];

export const BATCH55_METADATA: CalculatorMeta[] = [
  {
    id: 'small-business-valuation-calculator',
    name: 'Small Business Valuation Calculator',
    shortDesc: 'Estimate business enterprise and equity value using entered earnings (SDE / EBITDA) and industry valuation multiples',
    category: 'business-operations',
    subcategoryId: 'p17b-sub-calc',
    tags: ['business', 'valuation', 'sde', 'ebitda', 'multiples', 'calculators'],
    formula: 'Enterprise Value = Earnings (SDE or EBITDA) × Valuation Multiple',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'ecommerce-break-even-roas-calculator',
    name: 'Ecommerce Break-Even ROAS Calculator',
    shortDesc: 'Calculate the minimum advertising Return on Ad Spend (ROAS) required to cover product cost, variable fees, and ad spend',
    category: 'ecommerce',
    subcategoryId: 'p17b-sub-calc',
    tags: ['ecommerce', 'roas', 'break-even', 'advertising', 'marketing', 'calculators'],
    formula: 'Break-Even ROAS = 1 / Gross Profit Margin %',
    isPopular: false,
    iconName: 'ShoppingBag',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'nominal-effective-interest-rate-converter',
    name: 'Nominal & Effective Interest Rate Converter',
    shortDesc: 'Convert between nominal annual interest rates and effective annual rates (EAR) based on compounding frequency',
    category: 'converter',
    subcategoryId: 'p17b-sub-conv',
    tags: ['converter', 'interest-rate', 'nominal', 'effective', 'compounding', 'financial'],
    formula: 'EAR = (1 + Nominal / n)^n - 1',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'purchase-order-invoice-matching-checker',
    name: 'Purchase Order & Invoice Matching Checker',
    shortDesc: 'Compare quantities, unit prices, item codes, and totals between purchase orders and supplier invoices to flag discrepancies',
    category: 'checkers',
    subcategoryId: 'p17b-sub-check',
    tags: ['checkers', 'purchase-order', 'invoice-matching', 'accounting', 'auditing', 'validation'],
    formula: 'Discrepancy Check = PO Quantity/Price vs Invoice Quantity/Price',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'cash-flow-statement-generator',
    name: 'Cash Flow Statement Generator',
    shortDesc: 'Generate structured operating, investing, and financing cash flow statements from supplied cash inflows and outflows',
    category: 'generators',
    subcategoryId: 'p17b-sub-gen',
    tags: ['generators', 'cash-flow', 'financial-statement', 'accounting', 'operating', 'financing'],
    formula: 'Net Change in Cash = Operating CF + Investing CF + Financing CF',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'business-pricing-strategy-planner',
    name: 'Business Pricing Strategy Planner',
    shortDesc: 'Model cost-plus, competitor-informed, and value-based pricing strategies to establish optimal product pricing and margins',
    category: 'planners',
    subcategoryId: 'p17b-sub-plan',
    tags: ['planners', 'pricing-strategy', 'cost-plus', 'value-based', 'business', 'planning'],
    formula: 'Selling Price = Unit Cost / (1 - Target Margin %)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'payment-processing-fee-comparison-utility',
    name: 'Payment Processing Fee Comparison Utility',
    shortDesc: 'Compare effective processing fees, fixed charges, and net payout amounts across multiple merchant payment processors',
    category: 'additional-tools',
    subcategoryId: 'p17b-sub-tools',
    tags: ['tools', 'payment-processing', 'merchant-fees', 'stripe', 'paypal', 'utility'],
    formula: 'Processing Fee = (Volume × Percentage Fee) + (Transaction Count × Fixed Fee)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'accounts-receivable-collection-tracker',
    name: 'Accounts Receivable Collection Tracker',
    shortDesc: 'Track customer invoices, due dates, outstanding balances, payments received, and overdue collection status with local persistence',
    category: 'trackers',
    subcategoryId: 'p17b-sub-track',
    tags: ['trackers', 'accounts-receivable', 'invoices', 'collections', 'aging', 'tracking'],
    formula: 'Overdue Days = Current Date - Invoice Due Date',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'small-business-tax-deductions-reference',
    name: 'Small Business Tax Deductions Reference',
    shortDesc: 'Reference guide explaining common deductible small business expenses, home office deductions, and vehicle mileage rules',
    category: 'guides',
    subcategoryId: 'p17b-sub-guides',
    tags: ['guides', 'tax-deductions', 'small-business', 'irs', 'accounting', 'reference'],
    formula: 'Deductible Expense Taxonomy & IRS Compliance Rules',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-payment-terms-collections-reference',
    name: 'Business Payment Terms & Collections Reference',
    shortDesc: 'Reference guide covering standard B2B payment terms (Net 30/60), late fees, credit checks, and debt collection procedures',
    category: 'guides',
    subcategoryId: 'p17b-sub-guides',
    tags: ['guides', 'payment-terms', 'net-30', 'collections', 'credit', 'reference'],
    formula: 'B2B Credit Terms & Collection Workflow Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
