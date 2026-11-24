import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH54_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17a-sub-calc', categoryId: 'business-operations', name: 'Phase 17A CLV & Inventory Holding', slug: 'phase17a-clv-inventory', description: 'Customer lifetime value and inventory holding cost calculators', sortOrder: 110 },
  { id: 'p17a-sub-conv', categoryId: 'converter', name: 'Phase 17A Profit Margin & Markup', slug: 'phase17a-margin-markup-conv', description: 'Profit margin and markup percentage conversion utility', sortOrder: 110 },
  { id: 'p17a-sub-check', categoryId: 'checkers', name: 'Phase 17A Business Invoice Validation', slug: 'phase17a-invoice-check', description: 'Business invoice field and tax arithmetic validation checker', sortOrder: 110 },
  { id: 'p17a-sub-gen', categoryId: 'generators', name: 'Phase 17A Professional Business Proposal', slug: 'phase17a-proposal-gen', description: 'Professional business proposal document generator', sortOrder: 110 },
  { id: 'p17a-sub-plan', categoryId: 'planners', name: 'Phase 17A Small Business Startup Launch', slug: 'phase17a-startup-plan', description: 'Small business startup launch and budget planner', sortOrder: 110 },
  { id: 'p17a-sub-tools', categoryId: 'additional-tools', name: 'Phase 17A Financial Ratio Analysis', slug: 'phase17a-financial-ratio-tool', description: 'Financial ratio analysis and liquidity utility', sortOrder: 110 },
  { id: 'p17a-sub-track', categoryId: 'trackers', name: 'Phase 17A Business Expense & Spending', slug: 'phase17a-expense-track', description: 'Business operational expense and spending tracker', sortOrder: 110 },
  { id: 'p17a-sub-guides', categoryId: 'guides', name: 'Phase 17A Legal Structures & E-commerce Models', slug: 'phase17a-legal-ecommerce-guides', description: 'Business legal structures and e-commerce business models references', sortOrder: 110 }
];

export const BATCH54_METADATA: CalculatorMeta[] = [
  {
    id: 'customer-lifetime-value-calculator',
    name: 'Customer Lifetime Value Calculator',
    shortDesc: 'Calculate customer lifetime value (LTV) using average revenue per user, gross margin, customer retention rate, and acquisition cost',
    category: 'business-operations',
    subcategoryId: 'p17a-sub-calc',
    tags: ['business', 'clv', 'customer-lifetime-value', 'saas', 'retention', 'revenue'],
    formula: 'LTV = (ARPU × Gross Margin) / Churn Rate',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'inventory-holding-cost-calculator',
    name: 'Inventory Holding Cost Calculator',
    shortDesc: 'Calculate annual inventory holding and carrying costs including storage, insurance, capital opportunity cost, and handling',
    category: 'manufacturing-inventory',
    subcategoryId: 'p17a-sub-calc',
    tags: ['business', 'inventory', 'holding-cost', 'carrying-cost', 'supply-chain', 'warehouse'],
    formula: 'Holding Cost = Average Inventory Value × Carrying Cost Percentage',
    isPopular: false,
    iconName: 'Layers',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'profit-margin-markup-converter',
    name: 'Profit Margin & Markup Converter',
    shortDesc: 'Convert seamlessly between gross profit margin percentages and cost markup percentages with selling price calculations',
    category: 'converter',
    subcategoryId: 'p17a-sub-conv',
    tags: ['converter', 'profit-margin', 'markup', 'pricing', 'retail', 'business'],
    formula: 'Margin % = (Markup / (100 + Markup)) × 100',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'business-invoice-validation-checker',
    name: 'Business Invoice Validation Checker',
    shortDesc: 'Validate commercial invoice line items, tax arithmetic, subtotal calculations, due dates, and mandatory vendor details',
    category: 'checkers',
    subcategoryId: 'p17a-sub-check',
    tags: ['checkers', 'invoice', 'validation', 'billing', 'tax', 'accounting'],
    formula: 'Invoice Total = Subtotal + Applicable Taxes - Discounts',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'professional-business-proposal-generator',
    name: 'Professional Business Proposal Generator',
    shortDesc: 'Generate structured professional business proposals with executive summary, scope of work, deliverables, pricing, and terms',
    category: 'generators',
    subcategoryId: 'p17a-sub-gen',
    tags: ['generators', 'business-proposal', 'proposal', 'commercial', 'project', 'client'],
    formula: 'Structured Business Proposal Template & Scope Breakdown',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'small-business-startup-launch-planner',
    name: 'Small Business Startup Launch Planner',
    shortDesc: 'Organize small business startup launch tasks, initial capital budget, milestones, licenses, and operational responsibilities',
    category: 'planners',
    subcategoryId: 'p17a-sub-plan',
    tags: ['planners', 'startup', 'business-plan', 'launch', 'budget', 'milestones'],
    formula: 'Startup Capital Requirement = Setup Costs + Working Capital Reserves',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'financial-ratio-analysis-utility',
    name: 'Financial Ratio Analysis Utility',
    shortDesc: 'Analyze company liquidity, profitability, leverage, and operational efficiency ratios from entered balance sheet and income statement data',
    category: 'additional-tools',
    subcategoryId: 'p17a-sub-tools',
    tags: ['tools', 'financial-ratios', 'liquidity', 'profitability', 'leverage', 'analysis'],
    formula: 'Current Ratio = Current Assets / Current Liabilities',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'business-expense-spending-tracker',
    name: 'Business Expense & Spending Tracker',
    shortDesc: 'Record, categorize, filter, and summarize business operational expenses with local browser persistence and category breakdown',
    category: 'trackers',
    subcategoryId: 'p17a-sub-track',
    tags: ['trackers', 'business-expenses', 'spending', 'budget', 'accounting', 'tracking'],
    formula: 'Total Expenses = Sum(Categorized Operational Expenses)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'business-legal-structure-reference',
    name: 'Business Legal Structure Reference',
    shortDesc: 'Comprehensive reference guide comparing sole proprietorships, partnerships, LLCs, and corporations with liability and tax caveats',
    category: 'guides',
    subcategoryId: 'p17a-sub-guides',
    tags: ['guides', 'business-structure', 'llc', 'corporation', 'sole-proprietorship', 'legal'],
    formula: 'Legal Entity Liability & Tax Classification Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'ecommerce-business-models-reference',
    name: 'E-commerce Business Models Reference',
    shortDesc: 'Reference guide explaining B2C, B2B, C2C, D2C, online marketplaces, subscription boxes, and dropshipping business models',
    category: 'guides',
    subcategoryId: 'p17a-sub-guides',
    tags: ['guides', 'ecommerce', 'business-models', 'dropshipping', 'subscription', 'b2c-b2b'],
    formula: 'E-commerce Operational Model & Revenue Stream Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
