import { CalculatorMeta } from '../../types';

export const BATCH5_METADATA: CalculatorMeta[] = [
  // ==========================================
  // BUSINESS CALCULATORS (18 new, target 20 total with breakeven & profit-margin)
  // ==========================================

  // Subcategory: break-even-analysis (4)
  {
    id: 'target-profit-calc',
    name: 'Target Profit Sales Calculator',
    shortDesc: 'Calculate required sales unit volume and revenue to achieve a target dollar profit',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    tags: ['business', 'target-profit', 'sales-volume', 'cost-volume-profit', 'break-even'],
    formula: 'Required Units = (Fixed Costs + Target Profit) / (Price - Variable Cost)',
    isPopular: true,
    iconName: 'Target',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'contribution-margin-calc',
    name: 'Contribution Margin Calculator',
    shortDesc: 'Calculate dollar contribution margin and contribution margin ratio percentage',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    tags: ['business', 'contribution-margin', 'cm-ratio', 'unit-economics', 'profitability'],
    formula: 'CM = Price - Variable Cost; CM Ratio = (CM / Price) × 100',
    isPopular: true,
    iconName: 'Percent',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'margin-of-safety-calc',
    name: 'Margin of Safety Calculator',
    shortDesc: 'Determine how much sales can drop before a business incurs operating losses',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    tags: ['business', 'margin-of-safety', 'risk-management', 'break-even', 'buffer'],
    formula: 'MOS % = [(Actual Sales - Break-Even Sales) / Actual Sales] × 100',
    isPopular: false,
    iconName: 'ShieldAlert',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'operating-leverage-calc',
    name: 'Degree of Operating Leverage (DOL) Calculator',
    shortDesc: 'Measure percentage change in operating income resulting from a percentage change in sales',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    tags: ['business', 'operating-leverage', 'dol', 'fixed-cost-leverage', 'ebit'],
    formula: 'DOL = Total Contribution Margin / Operating Income (EBIT)',
    isPopular: false,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },

  // Subcategory: profit-margins-markup (4)
  {
    id: 'markup-to-margin-calc',
    name: 'Markup to Margin Converter & Calculator',
    shortDesc: 'Convert cost markup percentage to gross profit margin and solve selling price',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    tags: ['business', 'markup', 'margin', 'pricing-strategy', 'retail-math'],
    formula: 'Margin = Markup / (1 + Markup); Markup = Margin / (1 - Margin)',
    isPopular: true,
    iconName: 'ArrowRightLeft',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'operating-margin-calc',
    name: 'Operating Profit Margin (EBIT) Calculator',
    shortDesc: 'Calculate operating margin percentage after deducting operating expenses from gross profit',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    tags: ['business', 'operating-margin', 'ebit', 'operating-income', 'profitability'],
    formula: 'Operating Margin % = (Operating Income / Net Revenue) × 100',
    isPopular: false,
    iconName: 'BarChart2',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'ebitda-margin-calc',
    name: 'EBITDA & EBITDA Margin Calculator',
    shortDesc: 'Calculate EBITDA cash earnings and operating profitability percentage',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    tags: ['business', 'ebitda', 'ebitda-margin', 'valuation', 'cash-flow'],
    formula: 'EBITDA = Net Income + Interest + Taxes + D&A; Margin % = (EBITDA / Revenue) × 100',
    isPopular: true,
    iconName: 'Layers',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'gross-margin-pricing-calc',
    name: 'Target Gross Margin Price Solver',
    shortDesc: 'Calculate the exact retail sales price needed to hit your target gross margin %',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    tags: ['business', 'pricing', 'target-margin', 'cogs', 'retail-pricing'],
    formula: 'Price = Cost of Goods Sold / (1 - Target Margin)',
    isPopular: true,
    iconName: 'Tag',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },

  // Subcategory: roi-npv (5)
  {
    id: 'npv-calculator',
    name: 'Net Present Value (NPV) Calculator',
    shortDesc: 'Evaluate capital project profitability by discounting expected multi-year cash flows',
    category: 'business',
    subcategoryId: 'roi-npv',
    tags: ['business', 'npv', 'net-present-value', 'capital-budgeting', 'dcf'],
    formula: 'NPV = Σ [CF_t / (1 + r)^t] - Initial Investment',
    isPopular: true,
    iconName: 'DollarSign',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'irr-calculator',
    name: 'Internal Rate of Return (IRR) Calculator',
    shortDesc: 'Determine the annualized discount rate where net present value equals zero',
    category: 'business',
    subcategoryId: 'roi-npv',
    tags: ['business', 'irr', 'internal-rate-of-return', 'hurdle-rate', 'investments'],
    formula: '0 = Σ [CF_t / (1 + IRR)^t] - Initial Outlay',
    isPopular: true,
    iconName: 'Award',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'payback-period-calc',
    name: 'Payback Period Calculator',
    shortDesc: 'Determine exact time in years and months to recover initial business investment',
    category: 'business',
    subcategoryId: 'roi-npv',
    tags: ['business', 'payback-period', 'capital-recovery', 'break-even-time'],
    formula: 'Payback Period = Initial Investment / Annual Cash Inflow',
    isPopular: false,
    iconName: 'Clock',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'annualized-roi-calc',
    name: 'Annualized ROI & CAGR Calculator',
    shortDesc: 'Calculate Compound Annual Growth Rate (CAGR) and annualized return on investment',
    category: 'business',
    subcategoryId: 'roi-npv',
    tags: ['business', 'cagr', 'annualized-roi', 'compound-growth', 'investment-performance'],
    formula: 'CAGR = (Ending Value / Starting Value)^(1/Years) - 1',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'customer-acquisition-cost-calc',
    name: 'CAC & Customer LTV Ratio Calculator',
    shortDesc: 'Calculate Customer Acquisition Cost (CAC) and LTV:CAC business viability ratio',
    category: 'business',
    subcategoryId: 'roi-npv',
    tags: ['business', 'cac', 'ltv', 'saas-metrics', 'unit-economics', 'marketing-roi'],
    formula: 'CAC = Sales & Marketing Spend / Customers Acquired; Ratio = LTV / CAC',
    isPopular: true,
    iconName: 'Users',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },

  // Subcategory: valuation-ratios (5)
  {
    id: 'current-ratio-calc',
    name: 'Current Ratio & Quick Ratio (Acid Test)',
    shortDesc: 'Assess short-term liquidity and ability to cover near-term obligations',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    tags: ['business', 'current-ratio', 'quick-ratio', 'liquidity', 'working-capital'],
    formula: 'Current = Current Assets / Current Liabilities; Quick = (Assets - Inv) / Liab',
    isPopular: false,
    iconName: 'Activity',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'debt-to-equity-calc',
    name: 'Debt-to-Equity (D/E) Ratio Calculator',
    shortDesc: 'Quantify financial leverage by comparing total liabilities to shareholder equity',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    tags: ['business', 'debt-to-equity', 'financial-leverage', 'solvency', 'balance-sheet'],
    formula: 'D/E = Total Liabilities / Total Shareholders Equity',
    isPopular: false,
    iconName: 'Scale',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'accounts-receivable-turnover-calc',
    name: 'Accounts Receivable Turnover & DSO Calculator',
    shortDesc: 'Measure how effectively your business collects cash from credit customers',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    tags: ['business', 'ar-turnover', 'dso', 'days-sales-outstanding', 'cash-collection'],
    formula: 'AR Turnover = Net Credit Sales / Avg AR; DSO = 365 / Turnover',
    isPopular: false,
    iconName: 'CheckCircle',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'churn-rate-calc',
    name: 'Customer Churn & Retention Calculator',
    shortDesc: 'Calculate periodic churn rate percentage, retention rate, and average customer lifespan',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    tags: ['business', 'churn-rate', 'retention-rate', 'saas', 'subscription-metrics'],
    formula: 'Churn % = (Lost Customers / Start Customers) × 100; Lifespan = 1 / Churn',
    isPopular: true,
    iconName: 'RefreshCw',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  }
];
