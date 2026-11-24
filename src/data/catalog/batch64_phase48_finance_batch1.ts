import { CalculatorMeta } from '../../types';

export const BATCH64_FINANCE_BATCH1_METADATA: CalculatorMeta[] = [
  {
    id: 'advanced-mortgage-refinance-calc',
    name: 'Advanced Mortgage Refinance Comparison Calculator',
    shortDesc: 'Compare current mortgage vs refinance terms, closing costs, break-even point, and lifetime interest savings',
    category: 'financial',
    subcategoryId: 'loans',
    tags: ['financial', 'mortgage', 'refinance', 'loan-comparison', 'break-even'],
    formula: 'Monthly Savings = Current Payment - New Payment; Break-Even Months = Closing Costs / Monthly Savings',
    isPopular: true,
    iconName: 'Coins',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'global-vat-sales-tax-calc',
    name: 'Global VAT & Sales Tax Calculator',
    shortDesc: 'Calculate value-added tax (VAT), sales tax, inclusive and exclusive pricing across international tax rates',
    category: 'financial',
    subcategoryId: 'tax',
    tags: ['financial', 'vat', 'sales-tax', 'tax-calculator', 'inclusive-price'],
    formula: 'Gross Price = Net Price × (1 + TaxRate/100); VAT Amount = Gross Price - Net Price',
    isPopular: true,
    iconName: 'Calculator',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'compound-interest-monthly-simulator',
    name: 'Compound Interest with Monthly Additions Simulator',
    shortDesc: 'Simulate long-term wealth accumulation with initial principal, recurring monthly contributions, and compounding frequency',
    category: 'financial',
    subcategoryId: 'investing',
    tags: ['financial', 'compound-interest', 'wealth', 'savings', 'investing'],
    formula: 'A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'retirement-shortfall-gap-calc',
    name: 'Retirement Shortfall & Gap Calculator',
    shortDesc: 'Calculate projected retirement savings versus target retirement income to identify and bridge future savings gaps',
    category: 'financial',
    subcategoryId: 'retirement',
    tags: ['financial', 'retirement', 'shortfall', 'savings-gap', 'pension'],
    formula: 'Shortfall = Target Nest Egg - Projected Nest Egg at Retirement',
    isPopular: true,
    iconName: 'ShieldCheck',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'cash-flow-burn-rate-calc',
    name: 'Cash Flow & Burn Rate Calculator',
    shortDesc: 'Calculate startup or business monthly cash burn rate, net cash flow, and runway months until zero cash',
    category: 'financial',
    subcategoryId: 'business',
    tags: ['financial', 'cash-flow', 'burn-rate', 'runway', 'startup', 'business'],
    formula: 'Net Cash Flow = Cash In - Cash Out; Runway Months = Current Cash Balance / Monthly Burn Rate',
    isPopular: true,
    iconName: 'Activity',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  }
];
