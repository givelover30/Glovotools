import { CalculatorMeta } from '../../types';

export const BATCH65_FINANCE_BATCH2_METADATA: CalculatorMeta[] = [
  {
    id: 'capital-gains-tax-estimator',
    name: 'Capital Gains Tax Estimator',
    shortDesc: 'Estimate short-term and long-term capital gains tax liability on asset and stock sales',
    category: 'financial',
    subcategoryId: 'tax',
    tags: ['financial', 'capital-gains', 'tax', 'investing', 'stocks', 'real-estate'],
    formula: 'Capital Gain = Sale Price - Purchase Basis; Tax = Gain × Tax Rate',
    isPopular: true,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'dividend-reinvestment-drip-calc',
    name: 'Dividend Reinvestment (DRIP) Calculator',
    shortDesc: 'Simulate stock portfolio growth over time with automatic dividend reinvestment and yield compounding',
    category: 'financial',
    subcategoryId: 'investing',
    tags: ['financial', 'drip', 'dividends', 'reinvestment', 'portfolio', 'stocks'],
    formula: 'Shares(t) = Shares(t-1) + (Dividends / StockPrice); Value = Shares × StockPrice',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'hsa-growth-tax-savings-calc',
    name: 'Health Savings Account (HSA) Growth & Tax Savings Calculator',
    shortDesc: 'Calculate triple tax advantages, annual tax deductions, and long-term investment growth of an HSA',
    category: 'financial',
    subcategoryId: 'tax',
    tags: ['financial', 'hsa', 'health-savings', 'tax-savings', 'healthcare', 'investing'],
    formula: 'Annual Tax Savings = Contribution × Marginal Tax Rate; Growth = Compounded Principal',
    isPopular: true,
    iconName: 'ShieldCheck',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'college-savings-529-calc',
    name: '529 College Savings Growth & Contribution Calculator',
    shortDesc: 'Project 529 college savings plan growth, tax-free earnings, and required monthly contributions for tuition',
    category: 'financial',
    subcategoryId: 'investing',
    tags: ['financial', '529', 'college-savings', 'education', 'tuition', 'investing'],
    formula: 'A = P(1 + r/n)^(nt) + PMT × Future Value of Annuity formula',
    isPopular: true,
    iconName: 'GraduationCap',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'emergency-fund-expense-calc',
    name: 'Emergency Fund Multi-Month Expense Calculator',
    shortDesc: 'Calculate target emergency savings cushion based on essential monthly living expenses and target months',
    category: 'financial',
    subcategoryId: 'budgeting',
    tags: ['financial', 'emergency-fund', 'savings', 'expenses', 'budgeting', 'safety-net'],
    formula: 'Target Emergency Fund = Sum of Essential Monthly Expenses × Target Months (3-6+)',
    isPopular: true,
    iconName: 'Lock',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  }
];
