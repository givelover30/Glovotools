import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH11_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Income Tax Bracket & Effective Rate Calculator
  {
    id: 'income-tax-calc',
    name: 'Income Tax Bracket & Effective Rate Calculator',
    category: 'tax-accounting',
    subcategoryId: 'income-taxes',
    formulaMeta: {
      formulaName: 'Progressive Tax Bracket Calculation',
      formulaExpression: 'Total Tax = Σ (Income in Bracket × Rate)',
      variables: [
        { symbol: 'I', name: 'Taxable Income ($)', unit: '$' },
        { symbol: 'R', name: 'Bracket Rate (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'grossIncome', label: 'Annual Gross Income ($)', type: 'currency', required: true, defaultValue: 75000, min: 0 },
        { name: 'standardDeduction', label: 'Deductions & Exemptions ($)', type: 'currency', required: true, defaultValue: 14600, min: 0 },
        { name: 'filingStatus', label: 'Filing Status (1=Single, 2=Married)', type: 'integer', required: true, defaultValue: 1, min: 1, max: 2 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossIncome: number; standardDeduction: number; filingStatus: number }) => {
      const taxableIncome = Math.max(0, inputs.grossIncome - inputs.standardDeduction);
      // Simplified progressive brackets for single (status 1) vs married (status 2)
      const brackets = inputs.filingStatus === 2 
        ? [
            { limit: 23200, rate: 0.10 },
            { limit: 94300, rate: 0.12 },
            { limit: 201050, rate: 0.22 },
            { limit: 383900, rate: 0.24 },
            { limit: 487450, rate: 0.32 },
            { limit: 731200, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
          ]
        : [
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
          ];

      let totalTax = 0;
      let previousLimit = 0;
      let marginalRate = 10;

      for (const b of brackets) {
        if (taxableIncome > previousLimit) {
          const taxableInThisBracket = Math.min(taxableIncome, b.limit) - previousLimit;
          totalTax += taxableInThisBracket * b.rate;
          marginalRate = b.rate * 100;
          previousLimit = b.limit;
        } else {
          break;
        }
      }

      const effectiveRate = inputs.grossIncome > 0 ? (totalTax / inputs.grossIncome) * 100 : 0;
      const netTakeHome = inputs.grossIncome - totalTax;

      return { taxableIncome, totalTax, effectiveRate, marginalRate, netTakeHome };
    },
    formatResult: (res: { taxableIncome: number; totalTax: number; effectiveRate: number; marginalRate: number; netTakeHome: number }) => ({
      primary: {
        label: 'Total Estimated Income Tax',
        value: ResultFormatter.formatCurrency(res.totalTax),
        numericValue: res.totalTax
      },
      secondary: [
        { label: 'Effective Tax Rate', value: `${res.effectiveRate.toFixed(2)}%` },
        { label: 'Marginal Tax Bracket', value: `${res.marginalRate}%` },
        { label: 'Taxable Income', value: ResultFormatter.formatCurrency(res.taxableIncome) },
        { label: 'Net Take-Home Pay', value: ResultFormatter.formatCurrency(res.netTakeHome) }
      ]
    })
  },

  // 2. Sales Tax & VAT Calculator
  {
    id: 'sales-tax-calc',
    name: 'Sales Tax & VAT Calculator',
    category: 'tax-accounting',
    subcategoryId: 'sales-vat',
    formulaMeta: {
      formulaName: 'Sales Tax & Total Purchase Calculation',
      formulaExpression: 'Total = Price × (1 + Rate / 100)',
      variables: [
        { symbol: 'P', name: 'Base Price ($)', unit: '$' },
        { symbol: 'T', name: 'Tax Rate (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'basePrice', label: 'Pre-Tax Base Price ($)', type: 'currency', required: true, defaultValue: 150, min: 0 },
        { name: 'taxRate', label: 'Sales Tax / VAT Rate (%)', type: 'percentage', required: true, defaultValue: 8.25, min: 0, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { basePrice: number; taxRate: number }) => {
      const taxAmount = inputs.basePrice * (inputs.taxRate / 100);
      const totalPrice = inputs.basePrice + taxAmount;
      return { basePrice: inputs.basePrice, taxAmount, totalPrice, taxRate: inputs.taxRate };
    },
    formatResult: (res: { basePrice: number; taxAmount: number; totalPrice: number; taxRate: number }) => ({
      primary: {
        label: 'Total Price (Incl. Tax)',
        value: ResultFormatter.formatCurrency(res.totalPrice),
        numericValue: res.totalPrice
      },
      secondary: [
        { label: 'Sales Tax Amount', value: ResultFormatter.formatCurrency(res.taxAmount) },
        { label: 'Tax Rate Applied', value: `${res.taxRate}%` },
        { label: 'Base Price', value: ResultFormatter.formatCurrency(res.basePrice) }
      ]
    })
  },

  // 3. Self-Employment & FICA Tax Calculator
  {
    id: 'self-employment-tax-calc',
    name: 'Self-Employment & FICA Tax Calculator',
    category: 'tax-accounting',
    subcategoryId: 'self-employment-tax',
    formulaMeta: {
      formulaName: 'Self-Employment Contribution Formula',
      formulaExpression: 'SE Tax = Net Earnings × 92.35% × 15.3%',
      variables: [
        { symbol: 'N', name: 'Net Self-Employment Earnings ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'netEarnings', label: 'Net Business Earnings ($)', type: 'currency', required: true, defaultValue: 90000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { netEarnings: number }) => {
      const taxableSE = inputs.netEarnings * 0.9235;
      // 15.3% total SE tax (12.4% Social Security up to cap + 2.9% Medicare)
      const seTax = taxableSE * 0.153;
      const deductibleHalf = seTax / 2;
      return { netEarnings: inputs.netEarnings, taxableSE, seTax, deductibleHalf };
    },
    formatResult: (res: { netEarnings: number; taxableSE: number; seTax: number; deductibleHalf: number }) => ({
      primary: {
        label: 'Total Self-Employment Tax',
        value: ResultFormatter.formatCurrency(res.seTax),
        numericValue: res.seTax
      },
      secondary: [
        { label: 'Deductible Half for Income Tax', value: ResultFormatter.formatCurrency(res.deductibleHalf) },
        { label: 'Net Earnings Subject to SE Tax', value: ResultFormatter.formatCurrency(res.taxableSE) }
      ]
    })
  },

  // 4. Mortgage Payment & Amortization Calculator
  {
    id: 'mortgage-payment-calc',
    name: 'Mortgage Payment & Amortization Calculator',
    category: 'real-estate',
    subcategoryId: 'mortgages-loans',
    formulaMeta: {
      formulaName: 'Mortgage Amortization Formula',
      formulaExpression: 'PMT = P [r(1+r)ⁿ] / [(1+r)ⁿ - 1]',
      variables: [
        { symbol: 'P', name: 'Principal Loan Amount ($)', unit: '$' },
        { symbol: 'r', name: 'Monthly Interest Rate' },
        { symbol: 'n', name: 'Total Months' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'homePrice', label: 'Home Purchase Price ($)', type: 'currency', required: true, defaultValue: 400000, min: 10000 },
        { name: 'downPayment', label: 'Down Payment ($)', type: 'currency', required: true, defaultValue: 80000, min: 0 },
        { name: 'annualInterestRate', label: 'Interest Rate (%)', type: 'percentage', required: true, defaultValue: 6.5, min: 0.1, max: 25 },
        { name: 'loanTermYears', label: 'Loan Term (Years)', type: 'integer', required: true, defaultValue: 30, min: 5, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { homePrice: number; downPayment: number; annualInterestRate: number; loanTermYears: number }) => {
      const loanAmount = Math.max(0, inputs.homePrice - inputs.downPayment);
      const monthlyRate = inputs.annualInterestRate / 100 / 12;
      const n = inputs.loanTermYears * 12;
      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / n;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      }
      const totalPayments = monthlyPayment * n;
      const totalInterest = totalPayments - loanAmount;
      return { loanAmount, monthlyPayment, totalPayments, totalInterest };
    },
    formatResult: (res: { loanAmount: number; monthlyPayment: number; totalPayments: number; totalInterest: number }) => ({
      primary: {
        label: 'Monthly Mortgage Payment',
        value: ResultFormatter.formatCurrency(res.monthlyPayment),
        numericValue: res.monthlyPayment
      },
      secondary: [
        { label: 'Principal Loan Amount', value: ResultFormatter.formatCurrency(res.loanAmount) },
        { label: 'Total Interest Paid', value: ResultFormatter.formatCurrency(res.totalInterest) },
        { label: 'Total Cost over Term', value: ResultFormatter.formatCurrency(res.totalPayments) }
      ]
    })
  },

  // 5. Rental Property Cap Rate & ROI Calculator
  {
    id: 'rental-roi-calc',
    name: 'Rental Property Cap Rate & ROI Calculator',
    category: 'real-estate',
    subcategoryId: 'investment-roi',
    formulaMeta: {
      formulaName: 'Capitalization Rate & Cash Flow',
      formulaExpression: 'Cap Rate = (Net Operating Income / Purchase Price) × 100',
      variables: [
        { symbol: 'NOI', name: 'Net Operating Income ($)', unit: '$' },
        { symbol: 'P', name: 'Property Value ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'Property Purchase Price ($)', type: 'currency', required: true, defaultValue: 300000, min: 10000 },
        { name: 'monthlyRent', label: 'Gross Monthly Rent ($)', type: 'currency', required: true, defaultValue: 2800, min: 0 },
        { name: 'monthlyExpenses', label: 'Monthly Operating Expenses ($)', type: 'currency', required: true, defaultValue: 900, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { purchasePrice: number; monthlyRent: number; monthlyExpenses: number }) => {
      const annualGrossRent = inputs.monthlyRent * 12;
      const annualExpenses = inputs.monthlyExpenses * 12;
      const netOperatingIncome = annualGrossRent - annualExpenses;
      const capRate = inputs.purchasePrice > 0 ? (netOperatingIncome / inputs.purchasePrice) * 100 : 0;
      return { annualGrossRent, annualExpenses, netOperatingIncome, capRate };
    },
    formatResult: (res: { annualGrossRent: number; annualExpenses: number; netOperatingIncome: number; capRate: number }) => ({
      primary: {
        label: 'Capitalization Rate (Cap Rate)',
        value: `${res.capRate.toFixed(2)}%`,
        numericValue: res.capRate
      },
      secondary: [
        { label: 'Net Operating Income (NOI)', value: ResultFormatter.formatCurrency(res.netOperatingIncome) },
        { label: 'Annual Gross Rent', value: ResultFormatter.formatCurrency(res.annualGrossRent) },
        { label: 'Annual Operating Expenses', value: ResultFormatter.formatCurrency(res.annualExpenses) }
      ]
    })
  },

  // 6. Rent vs. Buy Decision Calculator
  {
    id: 'rent-vs-buy-calc',
    name: 'Rent vs. Buy Decision Calculator',
    category: 'real-estate',
    subcategoryId: 'rent-vs-buy',
    formulaMeta: {
      formulaName: 'Housing Financial Comparison',
      formulaExpression: 'Equity Gain vs Net Rent Expense',
      variables: [
        { symbol: 'R', name: 'Monthly Rent ($)', unit: '$' },
        { symbol: 'M', name: 'Monthly Mortgage ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'monthlyRent', label: 'Current Monthly Rent ($)', type: 'currency', required: true, defaultValue: 2200, min: 0 },
        { name: 'monthlyMortgage', label: 'Estimated Monthly Mortgage ($)', type: 'currency', required: true, defaultValue: 2600, min: 0 },
        { name: 'yearsStaying', label: 'Expected Years in Home', type: 'integer', required: true, defaultValue: 7, min: 1, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { monthlyRent: number; monthlyMortgage: number; yearsStaying: number }) => {
      const totalRentPaid = inputs.monthlyRent * 12 * inputs.yearsStaying;
      const totalMortgagePaid = inputs.monthlyMortgage * 12 * inputs.yearsStaying;
      // Estimated equity accumulation over years (approx 45% of mortgage payments build equity)
      const estimatedEquity = totalMortgagePaid * 0.48;
      const netBuyingCost = totalMortgagePaid - estimatedEquity;
      const financialDifference = totalRentPaid - netBuyingCost;
      return { totalRentPaid, totalMortgagePaid, estimatedEquity, financialDifference };
    },
    formatResult: (res: { totalRentPaid: number; totalMortgagePaid: number; estimatedEquity: number; financialDifference: number }) => ({
      primary: {
        label: 'Estimated Buying Equity Advantage',
        value: ResultFormatter.formatCurrency(res.financialDifference),
        numericValue: res.financialDifference
      },
      secondary: [
        { label: 'Total Rent Paid over Term', value: ResultFormatter.formatCurrency(res.totalRentPaid) },
        { label: 'Estimated Home Equity Built', value: ResultFormatter.formatCurrency(res.estimatedEquity) },
        { label: 'Total Mortgage Payments', value: ResultFormatter.formatCurrency(res.totalMortgagePaid) }
      ]
    })
  },

  // 7. Amazon FBA & E-commerce Fee Calculator
  {
    id: 'amazon-fba-fee-calc',
    name: 'Amazon FBA & E-commerce Fee Calculator',
    category: 'ecommerce',
    subcategoryId: 'marketplace-fees',
    formulaMeta: {
      formulaName: 'FBA Net Payout Formula',
      formulaExpression: 'Net = Price - Referral - FBA Fulfillment - Unit Cost',
      variables: [
        { symbol: 'SP', name: 'Selling Price ($)', unit: '$' },
        { symbol: 'C', name: 'Product Cost ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'sellingPrice', label: 'Listing Selling Price ($)', type: 'currency', required: true, defaultValue: 39.99, min: 1 },
        { name: 'itemCost', label: 'Item Manufacturing/Procurement Cost ($)', type: 'currency', required: true, defaultValue: 8.50, min: 0 },
        { name: 'fbaFulfillmentFee', label: 'FBA Fulfillment Fee ($)', type: 'currency', required: true, defaultValue: 5.50, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { sellingPrice: number; itemCost: number; fbaFulfillmentFee: number }) => {
      const referralFee = inputs.sellingPrice * 0.15; // standard 15% referral fee
      const netProfit = inputs.sellingPrice - referralFee - inputs.fbaFulfillmentFee - inputs.itemCost;
      const margin = inputs.sellingPrice > 0 ? (netProfit / inputs.sellingPrice) * 100 : 0;
      return { referralFee, netProfit, margin };
    },
    formatResult: (res: { referralFee: number; netProfit: number; margin: number }) => ({
      primary: {
        label: 'Net Profit per Unit',
        value: ResultFormatter.formatCurrency(res.netProfit),
        numericValue: res.netProfit
      },
      secondary: [
        { label: 'Profit Margin', value: `${res.margin.toFixed(2)}%` },
        { label: 'Amazon Referral Fee (15%)', value: ResultFormatter.formatCurrency(res.referralFee) }
      ]
    })
  },

  // 8. Product Profit Margin & Markup Calculator
  {
    id: 'profit-margin-calc',
    name: 'Product Profit Margin & Markup Calculator',
    category: 'ecommerce',
    subcategoryId: 'pricing-margins',
    formulaMeta: {
      formulaName: 'Margin & Markup Equations',
      formulaExpression: 'Margin% = ((Revenue - Cost) / Revenue) × 100',
      variables: [
        { symbol: 'Rev', name: 'Revenue / Selling Price ($)', unit: '$' },
        { symbol: 'Cost', name: 'Item Cost ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Product Cost ($)', type: 'currency', required: true, defaultValue: 20, min: 0.01 },
        { name: 'revenue', label: 'Selling Price / Revenue ($)', type: 'currency', required: true, defaultValue: 50, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cost: number; revenue: number }) => {
      const profit = inputs.revenue - inputs.cost;
      const margin = inputs.revenue > 0 ? (profit / inputs.revenue) * 100 : 0;
      const markup = inputs.cost > 0 ? (profit / inputs.cost) * 100 : 0;
      return { profit, margin, markup };
    },
    formatResult: (res: { profit: number; margin: number; markup: number }) => ({
      primary: {
        label: 'Gross Profit Margin',
        value: `${res.margin.toFixed(2)}%`,
        numericValue: res.margin
      },
      secondary: [
        { label: 'Gross Profit per Unit', value: ResultFormatter.formatCurrency(res.profit) },
        { label: 'Markup Percentage', value: `${res.markup.toFixed(2)}%` }
      ]
    })
  },

  // 9. Retail Break-Even Sales Volume Calculator
  {
    id: 'break-even-retail-calc',
    name: 'Retail Break-Even Sales Volume Calculator',
    category: 'ecommerce',
    subcategoryId: 'retail-break-even',
    formulaMeta: {
      formulaName: 'Break-Even Units Formula',
      formulaExpression: 'Units = Fixed Costs / (Price - Variable Cost)',
      variables: [
        { symbol: 'FC', name: 'Fixed Overhead Costs ($)', unit: '$' },
        { symbol: 'P', name: 'Price per Unit ($)', unit: '$' },
        { symbol: 'VC', name: 'Variable Cost per Unit ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'fixedCosts', label: 'Monthly Fixed Costs ($)', type: 'currency', required: true, defaultValue: 12000, min: 0 },
        { name: 'pricePerUnit', label: 'Selling Price per Unit ($)', type: 'currency', required: true, defaultValue: 75, min: 0.01 },
        { name: 'variableCostPerUnit', label: 'Variable Cost per Unit ($)', type: 'currency', required: true, defaultValue: 25, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { fixedCosts: number; pricePerUnit: number; variableCostPerUnit: number }) => {
      const contributionMarginPerUnit = inputs.pricePerUnit - inputs.variableCostPerUnit;
      if (contributionMarginPerUnit <= 0) {
        return { breakEvenUnits: 0, breakEvenRevenue: 0, contributionMarginPerUnit };
      }
      const breakEvenUnits = Math.ceil(inputs.fixedCosts / contributionMarginPerUnit);
      const breakEvenRevenue = breakEvenUnits * inputs.pricePerUnit;
      return { breakEvenUnits, breakEvenRevenue, contributionMarginPerUnit };
    },
    formatResult: (res: { breakEvenUnits: number; breakEvenRevenue: number; contributionMarginPerUnit: number }) => ({
      primary: {
        label: 'Break-Even Sales Units',
        value: `${res.breakEvenUnits.toLocaleString()} units`,
        numericValue: res.breakEvenUnits
      },
      secondary: [
        { label: 'Break-Even Revenue', value: ResultFormatter.formatCurrency(res.breakEvenRevenue) },
        { label: 'Contribution Margin per Unit', value: ResultFormatter.formatCurrency(res.contributionMarginPerUnit) }
      ]
    })
  },

  // 10. Solar Panel System ROI & Payback Calculator
  {
    id: 'solar-panel-roi-calc',
    name: 'Solar Panel System ROI & Payback Calculator',
    category: 'energy-solar',
    subcategoryId: 'solar-systems',
    formulaMeta: {
      formulaName: 'Solar Payback & Savings Formula',
      formulaExpression: 'Payback Years = Net Cost / Annual Savings',
      variables: [
        { symbol: 'Cost', name: 'Net System Cost after Tax Credit ($)', unit: '$' },
        { symbol: 'Save', name: 'Annual Electric Bill Savings ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'grossSystemCost', label: 'Gross Solar System Cost ($)', type: 'currency', required: true, defaultValue: 22000, min: 1000 },
        { name: 'taxCreditPercentage', label: 'Federal / State Tax Credit (%)', type: 'percentage', required: true, defaultValue: 30, min: 0, max: 100 },
        { name: 'annualElectricSavings', label: 'Annual Electricity Bill Savings ($)', type: 'currency', required: true, defaultValue: 2100, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossSystemCost: number; taxCreditPercentage: number; annualElectricSavings: number }) => {
      const taxCreditAmount = inputs.grossSystemCost * (inputs.taxCreditPercentage / 100);
      const netSystemCost = Math.max(0, inputs.grossSystemCost - taxCreditAmount);
      const paybackYears = inputs.annualElectricSavings > 0 ? netSystemCost / inputs.annualElectricSavings : 0;
      const twentyYearSavings = (inputs.annualElectricSavings * 20) - netSystemCost;
      return { netSystemCost, taxCreditAmount, paybackYears, twentyYearSavings };
    },
    formatResult: (res: { netSystemCost: number; taxCreditAmount: number; paybackYears: number; twentyYearSavings: number }) => ({
      primary: {
        label: 'Solar Payback Period',
        value: `${res.paybackYears.toFixed(1)} years`,
        numericValue: res.paybackYears
      },
      secondary: [
        { label: 'Net System Cost (After Tax Credit)', value: ResultFormatter.formatCurrency(res.netSystemCost) },
        { label: 'Tax Credit Savings', value: ResultFormatter.formatCurrency(res.taxCreditAmount) },
        { label: 'Estimated 20-Year Net Savings', value: ResultFormatter.formatCurrency(res.twentyYearSavings) }
      ]
    })
  }
];
