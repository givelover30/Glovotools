import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH11_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Tax & Accounting
  {
    id: 'income-taxes',
    categoryId: 'tax-accounting',
    name: 'Income & Federal Taxes',
    slug: 'income-taxes',
    description: 'Calculate effective tax rates, income tax brackets, and net take-home pay',
    sortOrder: 1
  },
  {
    id: 'sales-vat',
    categoryId: 'tax-accounting',
    name: 'Sales Tax & VAT',
    slug: 'sales-vat',
    description: 'Compute item sales tax, Value Added Tax (VAT), and pre-tax base pricing',
    sortOrder: 2
  },
  {
    id: 'self-employment-tax',
    categoryId: 'tax-accounting',
    name: 'Self-Employment & FICA',
    slug: 'self-employment-tax',
    description: 'Estimate self-employment tax, Social Security, and Medicare contributions',
    sortOrder: 3
  },

  // Real Estate & Property
  {
    id: 'mortgages-loans',
    categoryId: 'real-estate',
    name: 'Mortgages & Home Loans',
    slug: 'mortgages-loans',
    description: 'Calculate monthly mortgage payments, interest accrual, and amortization schedules',
    sortOrder: 1
  },
  {
    id: 'investment-roi',
    categoryId: 'real-estate',
    name: 'Investment & Rental ROI',
    slug: 'investment-roi',
    description: 'Analyze rental property capitalization rate, cash-on-cash return, and net operating income',
    sortOrder: 2
  },
  {
    id: 'rent-vs-buy',
    categoryId: 'real-estate',
    name: 'Rent vs. Buy Analysis',
    slug: 'rent-vs-buy',
    description: 'Compare long-term financial outcomes of renting versus purchasing real estate',
    sortOrder: 3
  },

  // E-commerce & Retail
  {
    id: 'marketplace-fees',
    categoryId: 'ecommerce',
    name: 'Marketplace & FBA Fees',
    slug: 'marketplace-fees',
    description: 'Estimate Amazon FBA fulfillment fees, referral fees, and net merchant payouts',
    sortOrder: 1
  },
  {
    id: 'pricing-margins',
    categoryId: 'ecommerce',
    name: 'Pricing & Profit Margins',
    slug: 'pricing-margins',
    description: 'Calculate gross profit margins, retail markup percentages, and selling prices',
    sortOrder: 2
  },
  {
    id: 'retail-break-even',
    categoryId: 'ecommerce',
    name: 'Retail Break-Even',
    slug: 'retail-break-even',
    description: 'Determine required unit sales volume to cover fixed overhead and operating expenses',
    sortOrder: 3
  },

  // Energy & Solar
  {
    id: 'solar-systems',
    categoryId: 'energy-solar',
    name: 'Solar Panel Systems',
    slug: 'solar-systems',
    description: 'Calculate photovoltaic solar panel ROI, annual energy generation, and utility bill savings',
    sortOrder: 1
  }
];

export const BATCH11_METADATA: CalculatorMeta[] = [
  // Tax & Accounting
  {
    id: 'income-tax-calc',
    name: 'Income Tax Bracket & Effective Rate Calculator',
    shortDesc: 'Calculate federal income tax liability, marginal bracket, and effective tax rate',
    category: 'tax-accounting',
    subcategoryId: 'income-taxes',
    tags: ['tax', 'income-tax', 'federal-tax', 'effective-rate', 'bracket'],
    formula: 'Tax = Σ (Taxable Income in Bracket × Bracket Rate)',
    isPopular: true,
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'sales-tax-calc',
    name: 'Sales Tax & VAT Calculator',
    shortDesc: 'Compute total purchase price with sales tax or extract pre-tax base amount',
    category: 'tax-accounting',
    subcategoryId: 'sales-vat',
    tags: ['tax', 'sales-tax', 'vat', 'gst', 'purchase-price'],
    formula: 'Total = Price × (1 + Tax Rate / 100)',
    isPopular: true,
    iconName: 'Percent',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'self-employment-tax-calc',
    name: 'Self-Employment & FICA Tax Calculator',
    shortDesc: 'Estimate self-employment tax obligations including Social Security and Medicare',
    category: 'tax-accounting',
    subcategoryId: 'self-employment-tax',
    tags: ['tax', 'self-employment', 'fica', 'social-security', 'freelance'],
    formula: 'SE Tax = Net Earnings × 92.35% × 15.3%',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Real Estate & Property
  {
    id: 'mortgage-payment-calc',
    name: 'Mortgage Payment & Amortization Calculator',
    shortDesc: 'Calculate monthly principal and interest mortgage payments with loan breakdown',
    category: 'real-estate',
    subcategoryId: 'mortgages-loans',
    tags: ['real-estate', 'mortgage', 'loan', 'home-loan', 'amortization'],
    formula: 'PMT = P [r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
    isPopular: true,
    iconName: 'Home',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'rental-roi-calc',
    name: 'Rental Property Cap Rate & ROI Calculator',
    shortDesc: 'Evaluate rental property cash-on-cash return, net operating income, and capitalization rate',
    category: 'real-estate',
    subcategoryId: 'investment-roi',
    tags: ['real-estate', 'rental', 'roi', 'cap-rate', 'cash-flow', 'investment'],
    formula: 'Cap Rate = (Net Operating Income / Property Value) × 100',
    isPopular: true,
    iconName: 'Building',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'rent-vs-buy-calc',
    name: 'Rent vs. Buy Decision Calculator',
    shortDesc: 'Compare net financial outcome of renting versus buying a home over time',
    category: 'real-estate',
    subcategoryId: 'rent-vs-buy',
    tags: ['real-estate', 'rent-vs-buy', 'housing', 'comparison', 'net-worth'],
    formula: 'Net Difference = Home Equity Growth vs. Total Rent Paid & Investment Return',
    isPopular: false,
    iconName: 'Home',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // E-commerce & Retail
  {
    id: 'amazon-fba-fee-calc',
    name: 'Amazon FBA & E-commerce Fee Calculator',
    shortDesc: 'Calculate Amazon FBA fulfillment fees, referral percentages, and net profit per unit',
    category: 'ecommerce',
    subcategoryId: 'marketplace-fees',
    tags: ['ecommerce', 'amazon', 'fba', 'fees', 'fulfillment', 'retail'],
    formula: 'Net Payout = Selling Price - Referral Fee - FBA Fee - Unit Cost',
    isPopular: true,
    iconName: 'ShoppingBag',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'profit-margin-calc',
    name: 'Product Profit Margin & Markup Calculator',
    shortDesc: 'Compute gross profit margin, markup percentage, and profit from cost and revenue',
    category: 'ecommerce',
    subcategoryId: 'pricing-margins',
    tags: ['ecommerce', 'margin', 'markup', 'profit', 'retail', 'pricing'],
    formula: 'Margin% = ((Revenue - Cost) / Revenue) × 100',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'break-even-retail-calc',
    name: 'Retail Break-Even Sales Volume Calculator',
    shortDesc: 'Determine units needed to sell to cover all fixed costs and overhead',
    category: 'ecommerce',
    subcategoryId: 'retail-break-even',
    tags: ['ecommerce', 'break-even', 'retail', 'sales', 'fixed-costs'],
    formula: 'Break-Even Units = Fixed Costs / (Price - Variable Cost per Unit)',
    isPopular: false,
    iconName: 'Target',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },

  // Energy & Solar
  {
    id: 'solar-panel-roi-calc',
    name: 'Solar Panel System ROI & Payback Calculator',
    shortDesc: 'Calculate annual solar energy generation, electric bill savings, and payback period',
    category: 'energy-solar',
    subcategoryId: 'solar-systems',
    tags: ['energy', 'solar', 'photovoltaic', 'roi', 'payback', 'electricity'],
    formula: 'Payback Years = Net System Cost / Annual Electric Bill Savings',
    isPopular: true,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  }
];
