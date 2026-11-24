import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH12_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Insurance & Risk
  {
    id: 'life-health-risk',
    categoryId: 'insurance-risk',
    name: 'Life & Health Risk',
    slug: 'life-health-risk',
    description: 'Calculate recommended life insurance coverage needs and income replacement protection',
    sortOrder: 1
  },
  {
    id: 'property-casualty',
    categoryId: 'insurance-risk',
    name: 'Property & Casualty Deductibles',
    slug: 'property-casualty',
    description: 'Compare auto and property insurance deductible cost trade-offs against premium savings',
    sortOrder: 2
  },

  // Automotive
  {
    id: 'vehicle-financing',
    categoryId: 'automotive',
    name: 'Vehicle Financing & Depreciation',
    slug: 'vehicle-financing',
    description: 'Estimate car trade-in resale value, depreciation curves, and loan equity over time',
    sortOrder: 1
  },
  {
    id: 'transport-travel',
    categoryId: 'automotive',
    name: 'Transport & Road Trip Travel',
    slug: 'transport-travel',
    description: 'Compute total road trip fuel expenditure, travel distance costs, and per-traveler splitting',
    sortOrder: 2
  },

  // Education & Student Finance
  {
    id: 'student-loans',
    categoryId: 'education-finance',
    name: 'Student Loans & Repayment',
    slug: 'student-loans',
    description: 'Calculate student loan amortization, total interest, and accelerated principal payoff schedules',
    sortOrder: 1
  },
  {
    id: 'college-savings',
    categoryId: 'education-finance',
    name: 'College Savings & 529 Plans',
    slug: 'college-savings',
    description: 'Project 529 college savings plan growth, compound interest, and higher-education funding',
    sortOrder: 2
  },

  // Salary & Compensation
  {
    id: 'salary-conversion',
    categoryId: 'salary-compensation',
    name: 'Salary & Hourly Wage Conversion',
    slug: 'salary-conversion',
    description: 'Convert hourly wages into annual compensation, monthly pay, and overtime earnings',
    sortOrder: 1
  },
  {
    id: 'paycheck-net-pay',
    categoryId: 'salary-compensation',
    name: 'Paycheck Net Pay & Bonuses',
    slug: 'paycheck-net-pay',
    description: 'Estimate net take-home salary after taxes, FICA deductions, and supplemental bonus withholding',
    sortOrder: 2
  },
  {
    id: 'retirement-growth',
    categoryId: 'salary-compensation',
    name: 'Retirement 401(k) Growth & Match',
    slug: 'retirement-growth',
    description: 'Project long-term 401(k) retirement nest egg accumulation with employer matching contributions',
    sortOrder: 3
  }
];

export const BATCH12_METADATA: CalculatorMeta[] = [
  // Insurance & Risk
  {
    id: 'life-insurance-needs-calc',
    name: 'Life Insurance Needs Calculator',
    shortDesc: 'Calculate recommended term life insurance coverage based on income replacement and debts',
    category: 'insurance-risk',
    subcategoryId: 'life-health-risk',
    tags: ['insurance', 'life-insurance', 'coverage', 'family-protection', 'income-replacement'],
    formula: 'Coverage = (Income × Years) + Debt + Education - Savings',
    isPopular: true,
    iconName: 'ShieldCheck',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'auto-insurance-deductible-calc',
    name: 'Auto Insurance Deductible vs. Premium Calculator',
    shortDesc: 'Compare annual premium savings of higher deductibles against accident out-of-pocket costs',
    category: 'insurance-risk',
    subcategoryId: 'property-casualty',
    tags: ['insurance', 'auto-insurance', 'deductible', 'premium', 'risk-management'],
    formula: 'Net Savings = Premium Savings - (Deductible Diff × Claim Probability)',
    isPopular: false,
    iconName: 'Car',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // Automotive
  {
    id: 'car-depreciation-calc',
    name: 'Car Loan & Trade-In Depreciation Calculator',
    shortDesc: 'Estimate vehicle resale value over time factoring in annual depreciation and loan equity',
    category: 'automotive',
    subcategoryId: 'vehicle-financing',
    tags: ['automotive', 'car-depreciation', 'trade-in', 'car-loan', 'equity'],
    formula: 'Value(t) = Purchase Price × (1 - Rate)ᵗ',
    isPopular: true,
    iconName: 'Car',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'road-trip-cost-calc',
    name: 'Road Trip Fuel & Travel Expense Calculator',
    shortDesc: 'Compute total travel fuel expenditure, toll costs, and per-traveler expense splitting',
    category: 'automotive',
    subcategoryId: 'transport-travel',
    tags: ['automotive', 'road-trip', 'fuel-cost', 'travel', 'gas-calculator'],
    formula: 'Fuel Cost = (Distance / MPG) × Fuel Price',
    isPopular: false,
    iconName: 'Navigation',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },

  // Education & Student Finance
  {
    id: 'student-loan-payoff-calc',
    name: 'Student Loan Payoff & Repayment Calculator',
    shortDesc: 'Calculate student loan amortization, total interest, and accelerated principal payoff',
    category: 'education-finance',
    subcategoryId: 'student-loans',
    tags: ['education', 'student-loan', 'repayment', 'debt-payoff', 'amortization'],
    formula: 'Amortization PMT = P [r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
    isPopular: true,
    iconName: 'GraduationCap',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // Salary & Compensation
  {
    id: 'hourly-to-salary-calc',
    name: 'Hourly to Annual Salary & Overtime Calculator',
    shortDesc: 'Convert hourly wages into annual compensation, monthly pay, and overtime earnings',
    category: 'salary-compensation',
    subcategoryId: 'salary-conversion',
    tags: ['salary', 'hourly-wage', 'overtime', 'annual-pay', 'compensation'],
    formula: 'Annual = (Wage × Regular Hours × Weeks) + (Wage × 1.5 × OT Hours × Weeks)',
    isPopular: true,
    iconName: 'DollarSign',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'net-salary-calc',
    name: 'Take-Home Pay & Net Salary Calculator',
    shortDesc: 'Estimate net take-home salary after federal/state income taxes, FICA, and deductions',
    category: 'salary-compensation',
    subcategoryId: 'paycheck-net-pay',
    tags: ['salary', 'take-home-pay', 'net-pay', 'paycheck', 'taxes'],
    formula: 'Net Pay = Gross - (Gross × Total Tax%) - Deductions',
    isPopular: true,
    iconName: 'Receipt',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'bonus-tax-calc',
    name: 'Bonus & Commission Tax Withholding Calculator',
    shortDesc: 'Calculate supplemental tax withholding on end-of-year bonuses and performance incentives',
    category: 'salary-compensation',
    subcategoryId: 'paycheck-net-pay',
    tags: ['salary', 'bonus-tax', 'commission', 'withholding', 'supplemental-pay'],
    formula: 'Net Bonus = Bonus Amount × (1 - Supplemental Tax Rate)',
    isPopular: false,
    iconName: 'Coins',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'retirement-401k-calc',
    name: 'Retirement 401(k) & Employer Match Calculator',
    shortDesc: 'Project long-term retirement nest egg accumulation with employee and employer contributions',
    category: 'salary-compensation',
    subcategoryId: 'retirement-growth',
    tags: ['salary', 'retirement', '401k', 'employer-match', 'nest-egg', 'investing'],
    formula: 'Nest Egg Growth = Compound Annuity with Dual Contributions',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  }
];
