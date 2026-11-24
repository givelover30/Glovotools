import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH5_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Target Profit Sales Calculator
  {
    id: 'target-profit-calc',
    name: 'Target Profit Sales Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    formulaMeta: {
      formulaName: 'Target Profit Sales Volume',
      formulaExpression: 'Units = (Fixed Costs + Target Profit) / (Price - Variable Cost)',
      variables: [{ symbol: 'Units', name: 'Required Units to Sell' }]
    },
    inputSchema: {
      fields: [
        { name: 'fixedCosts', label: 'Total Fixed Costs ($)', type: 'currency', required: true, defaultValue: 25000, min: 0 },
        { name: 'unitPrice', label: 'Unit Selling Price ($)', type: 'currency', required: true, defaultValue: 50, min: 0.1 },
        { name: 'variableCost', label: 'Variable Cost per Unit ($)', type: 'currency', required: true, defaultValue: 20, min: 0 },
        { name: 'targetProfit', label: 'Desired Target Profit ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { fixedCosts: number; unitPrice: number; variableCost: number; targetProfit: number }) => {
      const cmPerUnit = inputs.unitPrice - inputs.variableCost;
      const requiredUnits = cmPerUnit > 0 ? (inputs.fixedCosts + inputs.targetProfit) / cmPerUnit : 0;
      const requiredRevenue = requiredUnits * inputs.unitPrice;
      const breakEvenUnits = cmPerUnit > 0 ? inputs.fixedCosts / cmPerUnit : 0;
      return { requiredUnits: Math.ceil(requiredUnits), requiredRevenue, breakEvenUnits: Math.ceil(breakEvenUnits), cmPerUnit };
    },
    formatResult: (res: { requiredUnits: number; requiredRevenue: number; breakEvenUnits: number; cmPerUnit: number }) => ({
      primary: {
        label: 'Required Sales Volume',
        value: `${ResultFormatter.formatInteger(res.requiredUnits)} units`,
        numericValue: res.requiredUnits
      },
      secondary: [
        { label: 'Required Gross Revenue', value: ResultFormatter.formatCurrency(res.requiredRevenue) },
        { label: 'Break-Even Units (Zero Profit)', value: `${ResultFormatter.formatInteger(res.breakEvenUnits)} units` },
        { label: 'Unit Contribution Margin', value: ResultFormatter.formatCurrency(res.cmPerUnit) }
      ]
    })
  },

  // 2. Contribution Margin Calculator
  {
    id: 'contribution-margin-calc',
    name: 'Contribution Margin Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    formulaMeta: {
      formulaName: 'Contribution Margin Formula',
      formulaExpression: 'CM = Revenue - Variable Costs; Ratio % = (CM / Revenue) × 100',
      variables: [{ symbol: 'CM', name: 'Contribution Margin' }]
    },
    inputSchema: {
      fields: [
        { name: 'revenue', label: 'Total Sales Revenue ($)', type: 'currency', required: true, defaultValue: 100000, min: 100 },
        { name: 'variableCosts', label: 'Total Variable Costs ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { revenue: number; variableCosts: number }) => {
      const cm = inputs.revenue - inputs.variableCosts;
      const cmRatio = (cm / inputs.revenue) * 100;
      return { cm, cmRatio, revenue: inputs.revenue };
    },
    formatResult: (res: { cm: number; cmRatio: number; revenue: number }) => ({
      primary: {
        label: 'Contribution Margin ($)',
        value: ResultFormatter.formatCurrency(res.cm),
        numericValue: res.cm
      },
      secondary: [
        { label: 'Contribution Margin Ratio', value: `${res.cmRatio.toFixed(1)}%` },
        { label: 'Total Revenue Analyzed', value: ResultFormatter.formatCurrency(res.revenue) }
      ]
    })
  },

  // 3. Margin of Safety Calculator
  {
    id: 'margin-of-safety-calc',
    name: 'Margin of Safety Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    formulaMeta: {
      formulaName: 'Margin of Safety (MOS)',
      formulaExpression: 'MOS % = [(Actual Sales - Break-Even Sales) / Actual Sales] × 100',
      variables: [{ symbol: 'MOS %', name: 'Safety Cushion Percentage' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentSales', label: 'Current / Budgeted Sales ($)', type: 'currency', required: true, defaultValue: 250000, min: 1000 },
        { name: 'breakEvenSales', label: 'Break-Even Sales Revenue ($)', type: 'currency', required: true, defaultValue: 175000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentSales: number; breakEvenSales: number }) => {
      const mosDollar = Math.max(0, inputs.currentSales - inputs.breakEvenSales);
      const mosPct = (mosDollar / inputs.currentSales) * 100;
      return { mosDollar, mosPct };
    },
    formatResult: (res: { mosDollar: number; mosPct: number }) => ({
      primary: {
        label: 'Margin of Safety (%)',
        value: `${res.mosPct.toFixed(1)}%`,
        numericValue: res.mosPct
      },
      secondary: [
        { label: 'Safety Cushion ($)', value: ResultFormatter.formatCurrency(res.mosDollar) },
        { label: 'Interpretation', value: `Sales can fall by ${res.mosPct.toFixed(1)}% before incurring losses` }
      ]
    })
  },

  // 4. Degree of Operating Leverage Calculator
  {
    id: 'operating-leverage-calc',
    name: 'Degree of Operating Leverage (DOL) Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    formulaMeta: {
      formulaName: 'Operating Leverage Factor',
      formulaExpression: 'DOL = Contribution Margin / Operating Income',
      variables: [{ symbol: 'DOL', name: 'Degree of Operating Leverage' }]
    },
    inputSchema: {
      fields: [
        { name: 'cm', label: 'Total Contribution Margin ($)', type: 'currency', required: true, defaultValue: 120000, min: 1000 },
        { name: 'fixedCosts', label: 'Total Fixed Costs ($)', type: 'currency', required: true, defaultValue: 70000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cm: number; fixedCosts: number }) => {
      const ebit = inputs.cm - inputs.fixedCosts;
      const dol = ebit > 0 ? inputs.cm / ebit : 0;
      return { dol, ebit, cm: inputs.cm };
    },
    formatResult: (res: { dol: number; ebit: number; cm: number }) => ({
      primary: {
        label: 'Degree of Operating Leverage',
        value: `${res.dol.toFixed(2)}x`,
        numericValue: res.dol
      },
      secondary: [
        { label: 'Operating Income (EBIT)', value: ResultFormatter.formatCurrency(res.ebit) },
        { label: 'Sensitivity', value: `A 10% increase in sales boosts EBIT by ${(res.dol * 10).toFixed(1)}%` }
      ]
    })
  },

  // 5. Markup to Margin Calculator
  {
    id: 'markup-to-margin-calc',
    name: 'Markup to Margin Converter & Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    formulaMeta: {
      formulaName: 'Markup and Margin Interconversion',
      formulaExpression: 'Margin % = Markup / (1 + Markup); Price = Cost × (1 + Markup)',
      variables: [{ symbol: 'Margin', name: 'Gross Margin %' }]
    },
    inputSchema: {
      fields: [
        { name: 'cost', label: 'Item Unit Cost ($)', type: 'currency', required: true, defaultValue: 40, min: 0.1 },
        { name: 'markupPct', label: 'Markup Percentage (%)', type: 'percentage', required: true, defaultValue: 50, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cost: number; markupPct: number }) => {
      const markupRatio = inputs.markupPct / 100;
      const price = inputs.cost * (1 + markupRatio);
      const grossProfit = price - inputs.cost;
      const marginPct = (grossProfit / price) * 100;
      return { price, grossProfit, marginPct, markupPct: inputs.markupPct };
    },
    formatResult: (res: { price: number; grossProfit: number; marginPct: number; markupPct: number }) => ({
      primary: {
        label: 'Equivalent Gross Margin',
        value: `${res.marginPct.toFixed(1)}%`,
        numericValue: res.marginPct
      },
      secondary: [
        { label: 'Retail Selling Price', value: ResultFormatter.formatCurrency(res.price) },
        { label: 'Profit per Unit', value: ResultFormatter.formatCurrency(res.grossProfit) },
        { label: 'Original Markup', value: `${res.markupPct}%` }
      ]
    })
  },

  // 6. Operating Profit Margin (EBIT) Calculator
  {
    id: 'operating-margin-calc',
    name: 'Operating Profit Margin (EBIT) Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    formulaMeta: {
      formulaName: 'Operating Margin Formula',
      formulaExpression: 'Operating Margin % = (Operating Income / Net Revenue) × 100',
      variables: [{ symbol: 'Margin', name: 'Operating Margin', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'revenue', label: 'Total Net Revenue ($)', type: 'currency', required: true, defaultValue: 500000, min: 1000 },
        { name: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', type: 'currency', required: true, defaultValue: 280000, min: 0 },
        { name: 'opex', label: 'Operating Expenses (SG&A, R&D) ($)', type: 'currency', required: true, defaultValue: 120000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { revenue: number; cogs: number; opex: number }) => {
      const grossProfit = inputs.revenue - inputs.cogs;
      const operatingIncome = grossProfit - inputs.opex;
      const operatingMargin = (operatingIncome / inputs.revenue) * 100;
      return { operatingMargin, operatingIncome, grossProfit };
    },
    formatResult: (res: { operatingMargin: number; operatingIncome: number; grossProfit: number }) => ({
      primary: {
        label: 'Operating Profit Margin',
        value: `${res.operatingMargin.toFixed(1)}%`,
        numericValue: res.operatingMargin
      },
      secondary: [
        { label: 'Operating Income (EBIT)', value: ResultFormatter.formatCurrency(res.operatingIncome) },
        { label: 'Gross Profit', value: ResultFormatter.formatCurrency(res.grossProfit) }
      ]
    })
  },

  // 7. EBITDA & EBITDA Margin Calculator
  {
    id: 'ebitda-margin-calc',
    name: 'EBITDA & EBITDA Margin Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    formulaMeta: {
      formulaName: 'EBITDA Calculation',
      formulaExpression: 'EBITDA = EBIT + Depreciation + Amortization',
      variables: [{ symbol: 'EBITDA', name: 'Cash Operating Earnings' }]
    },
    inputSchema: {
      fields: [
        { name: 'revenue', label: 'Total Revenue ($)', type: 'currency', required: true, defaultValue: 1200000, min: 1000 },
        { name: 'operatingIncome', label: 'Operating Income (EBIT) ($)', type: 'currency', required: true, defaultValue: 180000, min: 0 },
        { name: 'depreciation', label: 'Depreciation & Amortization ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { revenue: number; operatingIncome: number; depreciation: number }) => {
      const ebitda = inputs.operatingIncome + inputs.depreciation;
      const ebitdaMargin = (ebitda / inputs.revenue) * 100;
      return { ebitda, ebitdaMargin, revenue: inputs.revenue };
    },
    formatResult: (res: { ebitda: number; ebitdaMargin: number; revenue: number }) => ({
      primary: {
        label: 'EBITDA Cash Earnings',
        value: ResultFormatter.formatCurrency(res.ebitda),
        numericValue: res.ebitda
      },
      secondary: [
        { label: 'EBITDA Margin', value: `${res.ebitdaMargin.toFixed(1)}%` },
        { label: 'Total Net Revenue', value: ResultFormatter.formatCurrency(res.revenue) }
      ]
    })
  },

  // 8. Target Gross Margin Price Solver
  {
    id: 'gross-margin-pricing-calc',
    name: 'Target Gross Margin Price Solver',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    formulaMeta: {
      formulaName: 'Target Margin Pricing Formula',
      formulaExpression: 'Price = Cost / (1 - Target Margin)',
      variables: [{ symbol: 'Price', name: 'Required Retail Price' }]
    },
    inputSchema: {
      fields: [
        { name: 'unitCost', label: 'Unit Product Cost (COGS) ($)', type: 'currency', required: true, defaultValue: 45, min: 0.1 },
        { name: 'targetMargin', label: 'Desired Gross Margin (%)', type: 'percentage', required: true, defaultValue: 40, min: 1, max: 95 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { unitCost: number; targetMargin: number }) => {
      const marginRatio = inputs.targetMargin / 100;
      const price = inputs.unitCost / (1 - marginRatio);
      const grossProfit = price - inputs.unitCost;
      const markupNeeded = (grossProfit / inputs.unitCost) * 100;
      return { price, grossProfit, markupNeeded };
    },
    formatResult: (res: { price: number; grossProfit: number; markupNeeded: number }) => ({
      primary: {
        label: 'Target Selling Price',
        value: ResultFormatter.formatCurrency(res.price),
        numericValue: res.price
      },
      secondary: [
        { label: 'Dollar Profit per Unit', value: ResultFormatter.formatCurrency(res.grossProfit) },
        { label: 'Equivalent Markup Required', value: `${res.markupNeeded.toFixed(1)}%` }
      ]
    })
  },

  // 9. Net Present Value (NPV) Calculator
  {
    id: 'npv-calculator',
    name: 'Net Present Value (NPV) Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    formulaMeta: {
      formulaName: 'Discounted Cash Flow NPV',
      formulaExpression: 'NPV = Σ [CF_t / (1 + r)^t] - Initial Outlay',
      variables: [{ symbol: 'NPV', name: 'Net Present Value', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialInvestment', label: 'Initial Outlay ($)', type: 'currency', required: true, defaultValue: 100000, min: 1000 },
        { name: 'discountRate', label: 'Discount Rate / Cost of Capital (%)', type: 'percentage', required: true, defaultValue: 9.0, min: 0.1 },
        { name: 'cfYear1', label: 'Year 1 Cash Flow ($)', type: 'currency', required: true, defaultValue: 30000 },
        { name: 'cfYear2', label: 'Year 2 Cash Flow ($)', type: 'currency', required: true, defaultValue: 35000 },
        { name: 'cfYear3', label: 'Year 3 Cash Flow ($)', type: 'currency', required: true, defaultValue: 40000 },
        { name: 'cfYear4', label: 'Year 4 Cash Flow ($)', type: 'currency', required: true, defaultValue: 45000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialInvestment: number; discountRate: number; cfYear1: number; cfYear2: number; cfYear3: number; cfYear4: number }) => {
      const r = inputs.discountRate / 100;
      const pv1 = inputs.cfYear1 / Math.pow(1 + r, 1);
      const pv2 = inputs.cfYear2 / Math.pow(1 + r, 2);
      const pv3 = inputs.cfYear3 / Math.pow(1 + r, 3);
      const pv4 = inputs.cfYear4 / Math.pow(1 + r, 4);
      const totalPV = pv1 + pv2 + pv3 + pv4;
      const npv = totalPV - inputs.initialInvestment;
      const isViable = npv >= 0;
      return { npv, totalPV, isViable };
    },
    formatResult: (res: { npv: number; totalPV: number; isViable: boolean }) => ({
      primary: {
        label: 'Net Present Value (NPV)',
        value: ResultFormatter.formatCurrency(res.npv),
        numericValue: res.npv
      },
      secondary: [
        { label: 'Present Value of Cash Inflows', value: ResultFormatter.formatCurrency(res.totalPV) },
        { label: 'Decision', value: res.isViable ? 'Accept Project (NPV >= 0)' : 'Reject Project (NPV < 0)' }
      ]
    })
  },

  // 10. Internal Rate of Return (IRR) Calculator
  {
    id: 'irr-calculator',
    name: 'Internal Rate of Return (IRR) Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    formulaMeta: {
      formulaName: 'IRR Solver',
      formulaExpression: 'NPV(IRR) = 0',
      variables: [{ symbol: 'IRR', name: 'Internal Rate of Return', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialInvestment', label: 'Initial Outlay ($)', type: 'currency', required: true, defaultValue: 80000, min: 1000 },
        { name: 'cf1', label: 'Year 1 Inflow ($)', type: 'currency', required: true, defaultValue: 25000 },
        { name: 'cf2', label: 'Year 2 Inflow ($)', type: 'currency', required: true, defaultValue: 30000 },
        { name: 'cf3', label: 'Year 3 Inflow ($)', type: 'currency', required: true, defaultValue: 35000 },
        { name: 'cf4', label: 'Year 4 Inflow ($)', type: 'currency', required: true, defaultValue: 40000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialInvestment: number; cf1: number; cf2: number; cf3: number; cf4: number }) => {
      // Secant / bisection method to approximate IRR
      let low = 0.0;
      let high = 1.0;
      for (let iter = 0; iter < 40; iter++) {
        const mid = (low + high) / 2;
        const npv = inputs.cf1 / (1 + mid) + inputs.cf2 / Math.pow(1 + mid, 2) + inputs.cf3 / Math.pow(1 + mid, 3) + inputs.cf4 / Math.pow(1 + mid, 4) - inputs.initialInvestment;
        if (npv > 0) low = mid;
        else high = mid;
      }
      const irrPct = ((low + high) / 2) * 100;
      return { irrPct };
    },
    formatResult: (res: { irrPct: number }) => ({
      primary: {
        label: 'Internal Rate of Return (IRR)',
        value: `${res.irrPct.toFixed(2)}%`,
        numericValue: res.irrPct
      },
      secondary: [
        { label: 'Assessment', value: res.irrPct > 10 ? 'Strong investment return' : 'Moderate hurdle clearance' }
      ]
    })
  },

  // 11. Payback Period Calculator
  {
    id: 'payback-period-calc',
    name: 'Payback Period Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    formulaMeta: {
      formulaName: 'Capital Payback Period',
      formulaExpression: 'Payback = Initial Outlay / Annual Cash Flow',
      variables: [{ symbol: 'Years', name: 'Recovery Time' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialCost', label: 'Initial Project Investment ($)', type: 'currency', required: true, defaultValue: 60000, min: 100 },
        { name: 'annualInflow', label: 'Consistent Annual Net Cash Flow ($)', type: 'currency', required: true, defaultValue: 18000, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialCost: number; annualInflow: number }) => {
      const paybackYears = inputs.initialCost / inputs.annualInflow;
      const months = Math.round((paybackYears % 1) * 12);
      const fullYears = Math.floor(paybackYears);
      return { paybackYears, fullYears, months };
    },
    formatResult: (res: { paybackYears: number; fullYears: number; months: number }) => ({
      primary: {
        label: 'Capital Payback Period',
        value: `${res.fullYears} yrs ${res.months} mos`,
        numericValue: res.paybackYears
      },
      secondary: [
        { label: 'Decimal Years', value: `${res.paybackYears.toFixed(2)} years` }
      ]
    })
  },

  // 12. Annualized ROI & CAGR Calculator
  {
    id: 'annualized-roi-calc',
    name: 'Annualized ROI & CAGR Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    formulaMeta: {
      formulaName: 'Compound Annual Growth Rate',
      formulaExpression: 'CAGR = (End / Start)^(1/Years) - 1',
      variables: [{ symbol: 'CAGR', name: 'Annualized Rate', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'startingValue', label: 'Starting Investment ($)', type: 'currency', required: true, defaultValue: 25000, min: 1 },
        { name: 'endingValue', label: 'Ending Portfolio Value ($)', type: 'currency', required: true, defaultValue: 65000, min: 1 },
        { name: 'years', label: 'Holding Period (Years)', type: 'number', required: true, defaultValue: 5, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { startingValue: number; endingValue: number; years: number }) => {
      const totalROI = ((inputs.endingValue - inputs.startingValue) / inputs.startingValue) * 100;
      const cagr = (Math.pow(inputs.endingValue / inputs.startingValue, 1 / inputs.years) - 1) * 100;
      const absoluteProfit = inputs.endingValue - inputs.startingValue;
      return { totalROI, cagr, absoluteProfit };
    },
    formatResult: (res: { totalROI: number; cagr: number; absoluteProfit: number }) => ({
      primary: {
        label: 'Compound Annual Return (CAGR)',
        value: `${res.cagr.toFixed(2)}% / yr`,
        numericValue: res.cagr
      },
      secondary: [
        { label: 'Total Cumulative ROI', value: `${res.totalROI.toFixed(1)}%` },
        { label: 'Total Dollar Gain', value: ResultFormatter.formatCurrency(res.absoluteProfit) }
      ]
    })
  },

  // 13. Customer Acquisition Cost (CAC) & LTV Calculator
  {
    id: 'customer-acquisition-cost-calc',
    name: 'CAC & Customer LTV Ratio Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    formulaMeta: {
      formulaName: 'Unit Economics LTV:CAC',
      formulaExpression: 'CAC = Spend / Customers; LTV:CAC = LTV / CAC',
      variables: [{ symbol: 'Ratio', name: 'LTV to CAC Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'marketingSpend', label: 'Marketing & Sales Spend ($)', type: 'currency', required: true, defaultValue: 30000, min: 100 },
        { name: 'newCustomers', label: 'New Customers Acquired', type: 'integer', required: true, defaultValue: 120, min: 1 },
        { name: 'customerLTV', label: 'Estimated Customer Lifetime Value ($)', type: 'currency', required: true, defaultValue: 1100, min: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { marketingSpend: number; newCustomers: number; customerLTV: number }) => {
      const cac = inputs.marketingSpend / inputs.newCustomers;
      const ltvCacRatio = inputs.customerLTV / cac;
      let health = 'Excellent (> 3.0x)';
      if (ltvCacRatio < 1.0) health = 'Critical (Losing Money on Acquisition)';
      else if (ltvCacRatio < 3.0) health = 'Marginal (Under 3x Benchmark)';
      return { cac, ltvCacRatio, health };
    },
    formatResult: (res: { cac: number; ltvCacRatio: number; health: string }) => ({
      primary: {
        label: 'Customer Acquisition Cost (CAC)',
        value: ResultFormatter.formatCurrency(res.cac),
        numericValue: res.cac
      },
      secondary: [
        { label: 'LTV : CAC Ratio', value: `${res.ltvCacRatio.toFixed(2)}x` },
        { label: 'Unit Economics Status', value: res.health }
      ]
    })
  },

  // 15. Current Ratio & Quick Ratio (Acid Test)
  {
    id: 'current-ratio-calc',
    name: 'Current Ratio & Quick Ratio (Acid Test)',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    formulaMeta: {
      formulaName: 'Working Capital Ratios',
      formulaExpression: 'Current = Assets / Liab; Quick = (Assets - Inventory) / Liab',
      variables: [{ symbol: 'Current', name: 'Current Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentAssets', label: 'Current Assets ($)', type: 'currency', required: true, defaultValue: 180000, min: 100 },
        { name: 'inventory', label: 'Inventory Value ($)', type: 'currency', required: true, defaultValue: 50000, min: 0 },
        { name: 'currentLiabilities', label: 'Current Liabilities ($)', type: 'currency', required: true, defaultValue: 90000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentAssets: number; inventory: number; currentLiabilities: number }) => {
      const currentRatio = inputs.currentAssets / inputs.currentLiabilities;
      const quickRatio = (inputs.currentAssets - inputs.inventory) / inputs.currentLiabilities;
      const workingCapital = inputs.currentAssets - inputs.currentLiabilities;
      return { currentRatio, quickRatio, workingCapital };
    },
    formatResult: (res: { currentRatio: number; quickRatio: number; workingCapital: number }) => ({
      primary: {
        label: 'Current Ratio',
        value: `${res.currentRatio.toFixed(2)}x`,
        numericValue: res.currentRatio
      },
      secondary: [
        { label: 'Quick Ratio (Acid Test)', value: `${res.quickRatio.toFixed(2)}x` },
        { label: 'Net Working Capital', value: ResultFormatter.formatCurrency(res.workingCapital) }
      ]
    })
  },

  // 16. Debt-to-Equity (D/E) Ratio Calculator
  {
    id: 'debt-to-equity-calc',
    name: 'Debt-to-Equity (D/E) Ratio Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    formulaMeta: {
      formulaName: 'Financial Leverage Ratio',
      formulaExpression: 'D/E = Total Liabilities / Total Shareholders Equity',
      variables: [{ symbol: 'D/E', name: 'Debt to Equity Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'totalLiabilities', label: 'Total Liabilities ($)', type: 'currency', required: true, defaultValue: 350000, min: 0 },
        { name: 'shareholderEquity', label: 'Total Shareholder Equity ($)', type: 'currency', required: true, defaultValue: 250000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalLiabilities: number; shareholderEquity: number }) => {
      const deRatio = inputs.totalLiabilities / inputs.shareholderEquity;
      let status = 'Moderate Leverage';
      if (deRatio > 2.0) status = 'High Financial Risk';
      else if (deRatio < 1.0) status = 'Conservative Balance Sheet';
      return { deRatio, status };
    },
    formatResult: (res: { deRatio: number; status: string }) => ({
      primary: {
        label: 'Debt-to-Equity Ratio',
        value: `${res.deRatio.toFixed(2)}`,
        numericValue: res.deRatio
      },
      secondary: [
        { label: 'Leverage Profile', value: res.status }
      ]
    })
  },

  // 17. Accounts Receivable Turnover & DSO Calculator
  {
    id: 'accounts-receivable-turnover-calc',
    name: 'Accounts Receivable Turnover & DSO Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    formulaMeta: {
      formulaName: 'Receivables Collection Velocity',
      formulaExpression: 'Turnover = Credit Sales / Avg AR; DSO = 365 / Turnover',
      variables: [{ symbol: 'DSO', name: 'Days Sales Outstanding' }]
    },
    inputSchema: {
      fields: [
        { name: 'creditSales', label: 'Net Annual Credit Sales ($)', type: 'currency', required: true, defaultValue: 600000, min: 1000 },
        { name: 'avgAR', label: 'Average Accounts Receivable ($)', type: 'currency', required: true, defaultValue: 65000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { creditSales: number; avgAR: number }) => {
      const turnover = inputs.creditSales / inputs.avgAR;
      const dso = 365 / turnover;
      return { turnover, dso };
    },
    formatResult: (res: { turnover: number; dso: number }) => ({
      primary: {
        label: 'Days Sales Outstanding (DSO)',
        value: `${Math.round(res.dso)} days`,
        numericValue: res.dso
      },
      secondary: [
        { label: 'AR Turnover Ratio', value: `${res.turnover.toFixed(2)} times / yr` }
      ]
    })
  },

  // 18. Customer Churn & Retention Calculator
  {
    id: 'churn-rate-calc',
    name: 'Customer Churn & Retention Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    formulaMeta: {
      formulaName: 'Churn & Lifespan Formula',
      formulaExpression: 'Churn % = (Lost / Start) × 100; Lifespan = 1 / Churn',
      variables: [{ symbol: 'Churn %', name: 'Churn Rate' }]
    },
    inputSchema: {
      fields: [
        { name: 'startCustomers', label: 'Subscribers at Start of Month', type: 'integer', required: true, defaultValue: 1000, min: 10 },
        { name: 'lostCustomers', label: 'Subscribers Churned During Month', type: 'integer', required: true, defaultValue: 35, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { startCustomers: number; lostCustomers: number }) => {
      const churnRate = (inputs.lostCustomers / inputs.startCustomers) * 100;
      const retentionRate = 100 - churnRate;
      const avgLifespanMonths = churnRate > 0 ? 100 / churnRate : 0;
      return { churnRate, retentionRate, avgLifespanMonths };
    },
    formatResult: (res: { churnRate: number; retentionRate: number; avgLifespanMonths: number }) => ({
      primary: {
        label: 'Monthly Churn Rate',
        value: `${res.churnRate.toFixed(2)}%`,
        numericValue: res.churnRate
      },
      secondary: [
        { label: 'Monthly Retention Rate', value: `${res.retentionRate.toFixed(2)}%` },
        { label: 'Average Customer Lifespan', value: `${res.avgLifespanMonths.toFixed(1)} months` }
      ]
    })
  }
];
