import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH56_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p17c-sub-calc', categoryId: 'business-operations', name: 'Phase 17C Cash Cycle & Compensation', slug: 'phase17c-cycle-comp', description: 'Cash conversion cycle and employee total compensation calculators', sortOrder: 120 },
  { id: 'p17c-sub-conv', categoryId: 'converter', name: 'Phase 17C Currency Cross-Rate', slug: 'phase17c-cross-rate-conv', description: 'Currency cross-rate conversion utility', sortOrder: 120 },
  { id: 'p17c-sub-check', categoryId: 'checkers', name: 'Phase 17C Contract Clause Completeness', slug: 'phase17c-contract-check', description: 'Business contract clause completeness checker', sortOrder: 120 },
  { id: 'p17c-sub-gen', categoryId: 'generators', name: 'Phase 17C Purchase Order', slug: 'phase17c-po-gen', description: 'Purchase order document generator', sortOrder: 120 },
  { id: 'p17c-sub-plan', categoryId: 'planners', name: 'Phase 17C Quarterly Business Review', slug: 'phase17c-qbr-plan', description: 'Quarterly business review planner', sortOrder: 120 },
  { id: 'p17c-sub-tools', categoryId: 'additional-tools', name: 'Phase 17C Financial Sensitivity Analysis', slug: 'phase17c-sensitivity-tool', description: 'Financial scenario sensitivity analysis utility', sortOrder: 120 },
  { id: 'p17c-sub-track', categoryId: 'trackers', name: 'Phase 17C Accounts Payable', slug: 'phase17c-ap-track', description: 'Accounts payable payment and bill tracker', sortOrder: 120 },
  { id: 'p17c-sub-guides', categoryId: 'guides', name: 'Phase 17C Insurance & Working Capital', slug: 'phase17c-insurance-capital-guides', description: 'Business insurance coverage and working capital management references', sortOrder: 120 }
];

export const BATCH56_METADATA: CalculatorMeta[] = [
  {
    id: 'cash-conversion-cycle-calculator',
    name: 'Cash Conversion Cycle Calculator',
    shortDesc: 'Calculate the cash conversion cycle (CCC) in days using Days Sales Outstanding (DSO), Days Inventory Outstanding (DIO), and Days Payable Outstanding (DPO)',
    category: 'business-operations',
    subcategoryId: 'p17c-sub-calc',
    tags: ['business', 'cash-conversion-cycle', 'dso', 'dio', 'dpo', 'working-capital'],
    formula: 'CCC = DIO + DSO - DPO',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'employee-total-compensation-cost-calculator',
    name: 'Employee Total Compensation Cost Calculator',
    shortDesc: 'Calculate total employee compensation cost including base salary, bonuses, benefits, payroll taxes, and overhead expenses',
    category: 'business-operations',
    subcategoryId: 'p17c-sub-calc',
    tags: ['business', 'compensation', 'payroll', 'benefits', 'salary', 'hr'],
    formula: 'Total Comp = Base Salary + Bonuses + Employer Benefits + Payroll Taxes + Overhead',
    isPopular: false,
    iconName: 'DollarSign',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'currency-cross-rate-converter',
    name: 'Currency Cross-Rate Converter',
    shortDesc: 'Compute implied currency cross-rates and convert amounts between two currencies using base exchange rates against a common currency',
    category: 'converter',
    subcategoryId: 'p17c-sub-conv',
    tags: ['converter', 'currency', 'cross-rate', 'exchange-rate', 'forex', 'finance'],
    formula: 'Cross-Rate = Base Currency Rate / Target Currency Rate',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'business-contract-clause-completeness-checker',
    name: 'Business Contract Clause Completeness Checker',
    shortDesc: 'Audit business contracts and agreements for essential clauses including governing law, confidentiality, indemnity, termination, and dispute resolution',
    category: 'checkers',
    subcategoryId: 'p17c-sub-check',
    tags: ['checkers', 'contract', 'legal', 'compliance', 'clause', 'validation'],
    formula: 'Completeness Score = (Present Essential Clauses / Total Required Clauses) × 100%',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'purchase-order-generator',
    name: 'Purchase Order Generator',
    shortDesc: 'Generate structured, professional purchase order documents with vendor details, line items, quantities, pricing, and terms',
    category: 'generators',
    subcategoryId: 'p17c-sub-gen',
    tags: ['generators', 'purchase-order', 'po', 'procurement', 'vendor', 'business'],
    formula: 'PO Total = Sum(Quantity × Unit Price) + Tax + Shipping',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'quarterly-business-review-planner',
    name: 'Quarterly Business Review Planner',
    shortDesc: 'Plan Quarterly Business Review (QBR) agendas, performance metrics, strategic objectives, and stakeholder presentation milestones',
    category: 'planners',
    subcategoryId: 'p17c-sub-plan',
    tags: ['planners', 'qbr', 'quarterly-review', 'business-strategy', 'planning', 'meeting'],
    formula: 'QBR Structure = Executive Summary + Metric Review + Strategic Initiatives + Action Plan',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'financial-scenario-sensitivity-analysis-utility',
    name: 'Financial Scenario Sensitivity Analysis Utility',
    shortDesc: 'Perform sensitivity and scenario analysis on revenue growth, gross margins, and fixed costs to model best-case, base-case, and worst-case outcomes',
    category: 'additional-tools',
    subcategoryId: 'p17c-sub-tools',
    tags: ['tools', 'sensitivity-analysis', 'scenario-planning', 'financial-model', 'forecast', 'utility'],
    formula: 'Scenario Net Income = Projected Revenue × Gross Margin - Fixed Costs',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'accounts-payable-payment-tracker',
    name: 'Accounts Payable Payment Tracker',
    shortDesc: 'Track supplier bills, payment due dates, outstanding payables, early-payment discounts, and payment statuses with local persistence',
    category: 'trackers',
    subcategoryId: 'p17c-sub-track',
    tags: ['trackers', 'accounts-payable', 'bills', 'payments', 'cash-outflow', 'tracking'],
    formula: 'Outstanding AP Balance = Sum(Unpaid Supplier Invoices)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'business-insurance-coverage-reference',
    name: 'Business Insurance Coverage Reference',
    shortDesc: 'Reference guide covering commercial general liability (CGL), professional liability (E&O), workers compensation, and property insurance',
    category: 'guides',
    subcategoryId: 'p17c-sub-guides',
    tags: ['guides', 'business-insurance', 'liability', 'coverage', 'risk', 'reference'],
    formula: 'Commercial Insurance Policy Types & Risk Mitigation Taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'working-capital-management-reference',
    name: 'Working Capital Management Reference',
    shortDesc: 'Reference guide explaining working capital strategies, cash management, liquidity ratios, and inventory optimization best practices',
    category: 'guides',
    subcategoryId: 'p17c-sub-guides',
    tags: ['guides', 'working-capital', 'liquidity', 'cash-management', 'finance', 'reference'],
    formula: 'Working Capital = Current Assets - Current Liabilities',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
