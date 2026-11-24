import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH13_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Certificate of Deposit (CD) Calculator
  {
    id: 'cd-interest-calc',
    name: 'Certificate of Deposit (CD) Calculator',
    category: 'banking-savings',
    subcategoryId: 'deposit-accounts',
    formulaMeta: {
      formulaName: 'Compound CD Maturity Formula',
      formulaExpression: 'Maturity Value = Principal × (1 + APY / n)^(n × t)',
      variables: [
        { symbol: 'P', name: 'Principal Deposit ($)', unit: '$' },
        { symbol: 'APY', name: 'Annual Percentage Yield (%)', unit: '%' },
        { symbol: 't', name: 'Term in Years' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Initial Deposit Principal ($)', type: 'currency', required: true, defaultValue: 10000, min: 100 },
        { name: 'apy', label: 'Annual Percentage Yield (APY %)', type: 'percentage', required: true, defaultValue: 4.85, min: 0.01, max: 25 },
        { name: 'termMonths', label: 'CD Term (Months)', type: 'integer', required: true, defaultValue: 12, min: 1, max: 120 },
        { name: 'compoundingFrequency', label: 'Compounding (1=Annual, 4=Quarterly, 12=Monthly, 365=Daily)', type: 'integer', required: true, defaultValue: 12, min: 1, max: 365 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { principal: number; apy: number; termMonths: number; compoundingFrequency: number }) => {
      const p = inputs.principal;
      const r = inputs.apy / 100;
      const n = inputs.compoundingFrequency;
      const t = inputs.termMonths / 12;

      let maturityValue = 0;
      if (n === 0 || r === 0) {
        maturityValue = p;
      } else {
        maturityValue = p * Math.pow(1 + (r / n), n * t);
      }
      const interestEarned = Math.max(0, maturityValue - p);
      return { maturityValue, interestEarned, principal: p };
    },
    formatResult: (res: { maturityValue: number; interestEarned: number; principal: number }) => ({
      primary: {
        label: 'CD Maturity Value',
        value: ResultFormatter.formatCurrency(res.maturityValue),
        numericValue: res.maturityValue
      },
      secondary: [
        { label: 'Total Interest Earned', value: ResultFormatter.formatCurrency(res.interestEarned) },
        { label: 'Initial Principal Deposit', value: ResultFormatter.formatCurrency(res.principal) }
      ]
    })
  },

  // 2. Compound Savings & Regular Deposit Calculator
  {
    id: 'compound-savings-calc',
    name: 'Compound Savings & Regular Deposit Calculator',
    category: 'banking-savings',
    subcategoryId: 'savings-accumulation',
    formulaMeta: {
      formulaName: 'Savings Accumulation Formula',
      formulaExpression: 'Future Value = Principal Compounding + Ordinary Annuity Contribution',
      variables: [
        { symbol: 'P', name: 'Initial Principal ($)', unit: '$' },
        { symbol: 'PMT', name: 'Monthly Deposit ($)', unit: '$' },
        { symbol: 'r', name: 'Annual Interest Rate (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'initialPrincipal', label: 'Initial Savings Balance ($)', type: 'currency', required: true, defaultValue: 5000, min: 0 },
        { name: 'monthlyDeposit', label: 'Recurring Monthly Deposit ($)', type: 'currency', required: true, defaultValue: 500, min: 0 },
        { name: 'years', label: 'Savings Timeline (Years)', type: 'integer', required: true, defaultValue: 10, min: 1, max: 50 },
        { name: 'annualInterestRate', label: 'Expected Annual Interest Rate (%)', type: 'percentage', required: true, defaultValue: 5.5, min: 0, max: 25 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialPrincipal: number; monthlyDeposit: number; years: number; annualInterestRate: number }) => {
      const p = inputs.initialPrincipal;
      const pmt = inputs.monthlyDeposit;
      const r = inputs.annualInterestRate / 100 / 12;
      const n = inputs.years * 12;

      let futureValue = 0;
      if (r === 0) {
        futureValue = p + (pmt * n);
      } else {
        futureValue = (p * Math.pow(1 + r, n)) + (pmt * ((Math.pow(1 + r, n) - 1) / r));
      }

      const totalContributions = p + (pmt * n);
      const totalInterest = Math.max(0, futureValue - totalContributions);

      return { futureValue, totalContributions, totalInterest };
    },
    formatResult: (res: { futureValue: number; totalContributions: number; totalInterest: number }) => ({
      primary: {
        label: 'Projected Savings Future Value',
        value: ResultFormatter.formatCurrency(res.futureValue),
        numericValue: res.futureValue
      },
      secondary: [
        { label: 'Total Contributions', value: ResultFormatter.formatCurrency(res.totalContributions) },
        { label: 'Total Interest Earned', value: ResultFormatter.formatCurrency(res.totalInterest) }
      ]
    })
  },

  // 3. Customer Lifetime Value (LTV) & CAC Calculator
  {
    id: 'ltv-cac-calc',
    name: 'Customer Lifetime Value (LTV) & CAC Calculator',
    category: 'business-operations',
    subcategoryId: 'saas-unit-economics',
    formulaMeta: {
      formulaName: 'SaaS Unit Economics Formula',
      formulaExpression: 'LTV = (ARPU × Gross Margin) / Churn Rate, Ratio = LTV / CAC',
      variables: [
        { symbol: 'ARPU', name: 'Average Revenue per User ($)', unit: '$' },
        { symbol: 'GM', name: 'Gross Margin (%)', unit: '%' },
        { symbol: 'Churn', name: 'Monthly Churn Rate (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'arpu', label: 'Average Monthly Revenue per User (ARPU $)', type: 'currency', required: true, defaultValue: 120, min: 1 },
        { name: 'grossMarginPercent', label: 'Gross Margin (%)', type: 'percentage', required: true, defaultValue: 80, min: 1, max: 100 },
        { name: 'monthlyChurnPercent', label: 'Monthly Customer Churn Rate (%)', type: 'percentage', required: true, defaultValue: 2.5, min: 0.01, max: 100 },
        { name: 'cac', label: 'Customer Acquisition Cost (CAC $)', type: 'currency', required: true, defaultValue: 350, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { arpu: number; grossMarginPercent: number; monthlyChurnPercent: number; cac: number }) => {
      const gm = inputs.grossMarginPercent / 100;
      const churn = inputs.monthlyChurnPercent / 100;
      const monthlyCustomerValue = inputs.arpu * gm;
      const ltv = churn > 0 ? monthlyCustomerValue / churn : 0;
      const ltvCacRatio = inputs.cac > 0 ? ltv / inputs.cac : 0;
      const paybackMonths = monthlyCustomerValue > 0 ? inputs.cac / monthlyCustomerValue : 0;
      return { ltv, ltvCacRatio, paybackMonths, monthlyCustomerValue };
    },
    formatResult: (res: { ltv: number; ltvCacRatio: number; paybackMonths: number; monthlyCustomerValue: number }) => ({
      primary: {
        label: 'Customer Lifetime Value (LTV)',
        value: ResultFormatter.formatCurrency(res.ltv),
        numericValue: res.ltv
      },
      secondary: [
        { label: 'LTV:CAC Ratio', value: `${res.ltvCacRatio.toFixed(2)}:1` },
        { label: 'CAC Payback Period', value: `${res.paybackMonths.toFixed(1)} months` },
        { label: 'Monthly Net Value per Customer', value: ResultFormatter.formatCurrency(res.monthlyCustomerValue) }
      ]
    })
  },

  // 4. Employee Turnover Rate & Cost Calculator
  {
    id: 'turnover-rate-calc',
    name: 'Employee Turnover Rate & Cost Calculator',
    category: 'business-operations',
    subcategoryId: 'human-resources',
    formulaMeta: {
      formulaName: 'Workforce Turnover & Replacement Cost Formula',
      formulaExpression: 'Turnover Rate = (Departures / Average Employees) × 100',
      variables: [
        { symbol: 'D', name: 'Number of Departures' },
        { symbol: 'E', name: 'Average Employees' },
        { symbol: 'C', name: 'Cost per Replacement ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'departures', label: 'Number of Employee Departures', type: 'integer', required: true, defaultValue: 18, min: 0 },
        { name: 'averageEmployees', label: 'Average Total Employees', type: 'integer', required: true, defaultValue: 120, min: 1 },
        { name: 'replacementCostPerEmployee', label: 'Estimated Replacement Cost per Hire ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { departures: number; averageEmployees: number; replacementCostPerEmployee: number }) => {
      const turnoverRate = inputs.averageEmployees > 0 ? (inputs.departures / inputs.averageEmployees) * 100 : 0;
      const totalReplacementCost = inputs.departures * inputs.replacementCostPerEmployee;
      return { turnoverRate, totalReplacementCost, departures: inputs.departures };
    },
    formatResult: (res: { turnoverRate: number; totalReplacementCost: number; departures: number }) => ({
      primary: {
        label: 'Annual Workforce Turnover Rate',
        value: `${res.turnoverRate.toFixed(2)}%`,
        numericValue: res.turnoverRate
      },
      secondary: [
        { label: 'Total Estimated Replacement Cost', value: ResultFormatter.formatCurrency(res.totalReplacementCost) },
        { label: 'Total Employee Departures', value: `${res.departures} employees` }
      ]
    })
  },

  // 5. Dimensional Weight & Billable Shipping Calculator
  {
    id: 'dimensional-weight-calc',
    name: 'Dimensional Weight & Billable Shipping Calculator',
    category: 'logistics-shipping',
    subcategoryId: 'freight-parcel',
    formulaMeta: {
      formulaName: 'Volumetric Dimensional Weight Formula',
      formulaExpression: 'Dim Weight = (Length × Width × Height) / Dimensional Divisor',
      variables: [
        { symbol: 'L', name: 'Length (in)', unit: 'in' },
        { symbol: 'W', name: 'Width (in)', unit: 'in' },
        { symbol: 'H', name: 'Height (in)', unit: 'in' },
        { symbol: 'Div', name: 'Dimensional Divisor' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'length', label: 'Package Length (Inches)', type: 'number', required: true, defaultValue: 18, min: 0.1 },
        { name: 'width', label: 'Package Width (Inches)', type: 'number', required: true, defaultValue: 12, min: 0.1 },
        { name: 'height', label: 'Package Height (Inches)', type: 'number', required: true, defaultValue: 10, min: 0.1 },
        { name: 'actualWeight', label: 'Actual Scale Weight (Pounds)', type: 'number', required: true, defaultValue: 8.5, min: 0.1 },
        { name: 'dimDivisor', label: 'Dimensional Divisor (139 for Domestic US)', type: 'integer', required: true, defaultValue: 139, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { length: number; width: number; height: number; actualWeight: number; dimDivisor: number }) => {
      const volumeCubicInches = inputs.length * inputs.width * inputs.height;
      const dimensionalWeight = inputs.dimDivisor > 0 ? volumeCubicInches / inputs.dimDivisor : 0;
      const billableWeight = Math.max(inputs.actualWeight, dimensionalWeight);
      return { volumeCubicInches, dimensionalWeight, billableWeight, actualWeight: inputs.actualWeight };
    },
    formatResult: (res: { volumeCubicInches: number; dimensionalWeight: number; billableWeight: number; actualWeight: number }) => ({
      primary: {
        label: 'Billable Shipping Weight',
        value: `${res.billableWeight.toFixed(2)} lbs`,
        numericValue: res.billableWeight
      },
      secondary: [
        { label: 'Volumetric Dimensional Weight', value: `${res.dimensionalWeight.toFixed(2)} lbs` },
        { label: 'Actual Scale Weight', value: `${res.actualWeight} lbs` },
        { label: 'Package Volume', value: `${res.volumeCubicInches.toLocaleString()} in³` }
      ]
    })
  },

  // 6. Shipping Zone & Freight Cost Estimator
  {
    id: 'freight-cost-calc',
    name: 'Shipping Zone & Freight Cost Estimator',
    category: 'logistics-shipping',
    subcategoryId: 'freight-parcel',
    formulaMeta: {
      formulaName: 'Carrier Freight Rate Formula',
      formulaExpression: 'Cost = (Weight × Zone Rate) × (1 + Fuel Surcharge %)',
      variables: [
        { symbol: 'W', name: 'Billable Weight (lbs)', unit: 'lbs' },
        { symbol: 'ZR', name: 'Zone Rate ($/lb)', unit: '$' },
        { symbol: 'FS', name: 'Fuel Surcharge (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'billableWeight', label: 'Billable Package Weight (Pounds)', type: 'number', required: true, defaultValue: 15, min: 0.1 },
        { name: 'baseRatePerLb', label: 'Base Rate per Pound ($)', type: 'currency', required: true, defaultValue: 0.85, min: 0.01 },
        { name: 'shippingZone', label: 'Shipping Zone (1 to 8)', type: 'integer', required: true, defaultValue: 4, min: 1, max: 8 },
        { name: 'fuelSurchargePercent', label: 'Carrier Fuel Surcharge (%)', type: 'percentage', required: true, defaultValue: 14.5, min: 0, max: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { billableWeight: number; baseRatePerLb: number; shippingZone: number; fuelSurchargePercent: number }) => {
      // Zone multiplier (Zone 1 = 1.0x, Zone 8 = 2.4x)
      const zoneMultiplier = 1.0 + ((inputs.shippingZone - 1) * 0.2);
      const adjustedRatePerLb = inputs.baseRatePerLb * zoneMultiplier;
      const baseFreightCharge = inputs.billableWeight * adjustedRatePerLb;
      const fuelSurchargeAmount = baseFreightCharge * (inputs.fuelSurchargePercent / 100);
      const totalEstimatedCost = baseFreightCharge + fuelSurchargeAmount;
      return { adjustedRatePerLb, baseFreightCharge, fuelSurchargeAmount, totalEstimatedCost };
    },
    formatResult: (res: { adjustedRatePerLb: number; baseFreightCharge: number; fuelSurchargeAmount: number; totalEstimatedCost: number }) => ({
      primary: {
        label: 'Total Estimated Freight Cost',
        value: ResultFormatter.formatCurrency(res.totalEstimatedCost),
        numericValue: res.totalEstimatedCost
      },
      secondary: [
        { label: 'Base Freight Charge', value: ResultFormatter.formatCurrency(res.baseFreightCharge) },
        { label: 'Fuel Surcharge Amount', value: ResultFormatter.formatCurrency(res.fuelSurchargeAmount) },
        { label: 'Zone-Adjusted Rate per lb', value: ResultFormatter.formatCurrency(res.adjustedRatePerLb) }
      ]
    })
  },

  // 7. Economic Order Quantity (EOQ) Calculator
  {
    id: 'eoq-calc',
    name: 'Economic Order Quantity (EOQ) Calculator',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    formulaMeta: {
      formulaName: 'Wilson EOQ Formula',
      formulaExpression: 'EOQ = √((2 × Demand × Ordering Cost) / Holding Cost)',
      variables: [
        { symbol: 'D', name: 'Annual Demand (Units)' },
        { symbol: 'S', name: 'Ordering Cost per Order ($)', unit: '$' },
        { symbol: 'H', name: 'Holding Cost per Unit ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'annualDemand', label: 'Annual Demand (Units)', type: 'integer', required: true, defaultValue: 12000, min: 1 },
        { name: 'orderingCost', label: 'Cost per Order / Setup Cost ($)', type: 'currency', required: true, defaultValue: 75, min: 0 },
        { name: 'holdingCostPerUnit', label: 'Annual Holding Cost per Unit ($)', type: 'currency', required: true, defaultValue: 4.50, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualDemand: number; orderingCost: number; holdingCostPerUnit: number }) => {
      const d = inputs.annualDemand;
      const s = inputs.orderingCost;
      const h = inputs.holdingCostPerUnit;

      const eoq = h > 0 ? Math.sqrt((2 * d * s) / h) : 0;
      const optimalOrdersPerYear = eoq > 0 ? d / eoq : 0;
      const totalAnnualOrderingCost = optimalOrdersPerYear * s;
      const totalAnnualHoldingCost = (eoq / 2) * h;
      const totalInventoryCost = totalAnnualOrderingCost + totalAnnualHoldingCost;

      const roundedEoq = Math.round(eoq);

      return { roundedEoq, optimalOrdersPerYear, totalAnnualOrderingCost, totalAnnualHoldingCost, totalInventoryCost };
    },
    formatResult: (res: { roundedEoq: number; optimalOrdersPerYear: number; totalAnnualOrderingCost: number; totalAnnualHoldingCost: number; totalInventoryCost: number }) => ({
      primary: {
        label: 'Optimal Economic Order Quantity',
        value: `${res.roundedEoq.toLocaleString()} units`,
        numericValue: res.roundedEoq
      },
      secondary: [
        { label: 'Total Annual Inventory Cost', value: ResultFormatter.formatCurrency(res.totalInventoryCost) },
        { label: 'Optimal Orders per Year', value: `${res.optimalOrdersPerYear.toFixed(1)} orders` },
        { label: 'Annual Holding Cost', value: ResultFormatter.formatCurrency(res.totalAnnualHoldingCost) }
      ]
    })
  },

  // 8. Manufacturing OEE Calculator
  {
    id: 'oee-calc',
    name: 'Manufacturing OEE Calculator',
    category: 'manufacturing-inventory',
    subcategoryId: 'plant-operations',
    formulaMeta: {
      formulaName: 'Overall Equipment Effectiveness Formula',
      formulaExpression: 'OEE = Availability × Performance × Quality',
      variables: [
        { symbol: 'A', name: 'Availability (%)', unit: '%' },
        { symbol: 'P', name: 'Performance (%)', unit: '%' },
        { symbol: 'Q', name: 'Quality (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'plannedProductionTimeMinutes', label: 'Planned Production Time (Minutes)', type: 'number', required: true, defaultValue: 480, min: 1 },
        { name: 'operatingTimeMinutes', label: 'Actual Operating Time (Minutes)', type: 'number', required: true, defaultValue: 420, min: 1 },
        { name: 'totalPiecesProduced', label: 'Total Pieces Produced', type: 'integer', required: true, defaultValue: 1500, min: 1 },
        { name: 'defectivePieces', label: 'Defective Pieces / Scrap', type: 'integer', required: true, defaultValue: 45, min: 0 },
        { name: 'idealCycleTimeSeconds', label: 'Ideal Cycle Time per Piece (Seconds)', type: 'number', required: true, defaultValue: 15, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { plannedProductionTimeMinutes: number; operatingTimeMinutes: number; totalPiecesProduced: number; defectivePieces: number; idealCycleTimeSeconds: number }) => {
      const planned = inputs.plannedProductionTimeMinutes;
      const operating = Math.min(planned, inputs.operatingTimeMinutes);
      const availability = planned > 0 ? (operating / planned) * 100 : 0;

      const operatingSeconds = operating * 60;
      const totalPieces = inputs.totalPiecesProduced;
      const idealTimeTotalSeconds = totalPieces * inputs.idealCycleTimeSeconds;
      const performance = operatingSeconds > 0 ? Math.min(100, (idealTimeTotalSeconds / operatingSeconds) * 100) : 0;

      const goodPieces = Math.max(0, totalPieces - inputs.defectivePieces);
      const quality = totalPieces > 0 ? (goodPieces / totalPieces) * 100 : 0;

      const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

      return { oee, availability, performance, quality, goodPieces };
    },
    formatResult: (res: { oee: number; availability: number; performance: number; quality: number; goodPieces: number }) => ({
      primary: {
        label: 'Overall Equipment Effectiveness (OEE)',
        value: `${res.oee.toFixed(2)}%`,
        numericValue: res.oee
      },
      secondary: [
        { label: 'Availability', value: `${res.availability.toFixed(2)}%` },
        { label: 'Performance', value: `${res.performance.toFixed(2)}%` },
        { label: 'Quality', value: `${res.quality.toFixed(2)}%` },
        { label: 'Good Quality Pieces', value: `${res.goodPieces.toLocaleString()} units` }
      ]
    })
  },

  // 9. Safety Stock & Reorder Point Calculator
  {
    id: 'safety-stock-calc',
    name: 'Safety Stock & Reorder Point Calculator',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    formulaMeta: {
      formulaName: 'Inventory Reorder Point Formula',
      formulaExpression: 'Reorder Point = (Avg Daily Demand × Lead Time) + Safety Stock',
      variables: [
        { symbol: 'DD', name: 'Average Daily Demand' },
        { symbol: 'LT', name: 'Lead Time (Days)' },
        { symbol: 'SS', name: 'Safety Stock Buffer' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'avgDailyDemand', label: 'Average Daily Demand (Units)', type: 'number', required: true, defaultValue: 85, min: 0.1 },
        { name: 'avgLeadTimeDays', label: 'Average Supplier Lead Time (Days)', type: 'number', required: true, defaultValue: 10, min: 1 },
        { name: 'maxDailyDemand', label: 'Maximum Daily Demand (Units)', type: 'number', required: true, defaultValue: 120, min: 0.1 },
        { name: 'maxLeadTimeDays', label: 'Maximum Supplier Lead Time (Days)', type: 'number', required: true, defaultValue: 14, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { avgDailyDemand: number; avgLeadTimeDays: number; maxDailyDemand: number; maxLeadTimeDays: number }) => {
      const safetyStock = (inputs.maxDailyDemand * inputs.maxLeadTimeDays) - (inputs.avgDailyDemand * inputs.avgLeadTimeDays);
      const roundedSafetyStock = Math.max(0, Math.ceil(safetyStock));
      const expectedDemandDuringLeadTime = inputs.avgDailyDemand * inputs.avgLeadTimeDays;
      const reorderPoint = Math.round(expectedDemandDuringLeadTime + roundedSafetyStock);
      return { roundedSafetyStock, reorderPoint, expectedDemandDuringLeadTime };
    },
    formatResult: (res: { roundedSafetyStock: number; reorderPoint: number; expectedDemandDuringLeadTime: number }) => ({
      primary: {
        label: 'Inventory Reorder Point',
        value: `${res.reorderPoint.toLocaleString()} units`,
        numericValue: res.reorderPoint
      },
      secondary: [
        { label: 'Safety Stock Buffer', value: `${res.roundedSafetyStock.toLocaleString()} units` },
        { label: 'Lead Time Expected Demand', value: `${res.expectedDemandDuringLeadTime.toFixed(1)} units` }
      ]
    })
  },

  // 10. Inventory Turnover Ratio & DSI Calculator
  {
    id: 'inventory-turnover-calc',
    name: 'Inventory Turnover & DSI Calculator',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    formulaMeta: {
      formulaName: 'Inventory Efficiency Ratios',
      formulaExpression: 'Turnover = COGS / Average Inventory, DSI = 365 / Turnover',
      variables: [
        { symbol: 'COGS', name: 'Cost of Goods Sold ($)', unit: '$' },
        { symbol: 'AI', name: 'Average Inventory Value ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'cogs', label: 'Cost of Goods Sold (COGS $)', type: 'currency', required: true, defaultValue: 1450000, min: 1 },
        { name: 'averageInventory', label: 'Average Inventory Value ($)', type: 'currency', required: true, defaultValue: 290000, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cogs: number; averageInventory: number }) => {
      const turnoverRatio = inputs.averageInventory > 0 ? inputs.cogs / inputs.averageInventory : 0;
      const daysSalesOfInventory = turnoverRatio > 0 ? 365 / turnoverRatio : 0;
      return { turnoverRatio, daysSalesOfInventory };
    },
    formatResult: (res: { turnoverRatio: number; daysSalesOfInventory: number }) => ({
      primary: {
        label: 'Inventory Turnover Ratio',
        value: `${res.turnoverRatio.toFixed(2)}x`,
        numericValue: res.turnoverRatio
      },
      secondary: [
        { label: 'Days Sales of Inventory (DSI)', value: `${res.daysSalesOfInventory.toFixed(1)} days` }
      ]
    })
  }
];
