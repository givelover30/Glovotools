import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH16_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. NDA Breach Damage & Liquidated Damages
  {
    id: 'nda-damages-calc',
    name: 'NDA Breach Damage & Liquidated Damages Estimator',
    category: 'legal-compliance',
    subcategoryId: 'contract-law',
    formulaMeta: {
      formulaName: 'NDA Breach Financial Impact Formula',
      formulaExpression: 'Total Damages = Misappropriation Value + Lost Revenue + Legal Fees (Enforceable Cap)',
      variables: [
        { symbol: 'Val', name: 'Misappropriation Commercial Value ($)', unit: '$' },
        { symbol: 'Rev', name: 'Direct Revenue Lost ($)', unit: '$' },
        { symbol: 'Cap', name: 'Liquidated Damages Cap ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'misappropriationValue', label: 'Estimated Misappropriated Trade Secret Value ($)', type: 'currency', required: true, defaultValue: 150000, min: 0 },
        { name: 'lostRevenue', label: 'Direct Business Revenue Lost ($)', type: 'currency', required: true, defaultValue: 45000, min: 0 },
        { name: 'legalFees', label: 'Estimated Enforcement & Legal Fees ($)', type: 'currency', required: true, defaultValue: 25000, min: 0 },
        { name: 'liquidatedDamagesCap', label: 'Contractual Liquidated Damages Limit ($)', type: 'currency', required: true, defaultValue: 250000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { misappropriationValue: number; lostRevenue: number; legalFees: number; liquidatedDamagesCap: number }) => {
      const totalEstimatedDamages = inputs.misappropriationValue + inputs.lostRevenue + inputs.legalFees;
      const enforceableLiquidatedDamages = inputs.liquidatedDamagesCap > 0 ? Math.min(totalEstimatedDamages, inputs.liquidatedDamagesCap) : totalEstimatedDamages;
      return { totalEstimatedDamages, enforceableLiquidatedDamages, misappropriationValue: inputs.misappropriationValue };
    },
    formatResult: (res: { totalEstimatedDamages: number; enforceableLiquidatedDamages: number; misappropriationValue: number }) => ({
      primary: {
        label: 'Total Estimated Breach Damages',
        value: ResultFormatter.formatCurrency(res.totalEstimatedDamages),
        numericValue: res.totalEstimatedDamages
      },
      secondary: [
        { label: 'Enforceable Liquidated Cap Benchmark', value: ResultFormatter.formatCurrency(res.enforceableLiquidatedDamages) },
        { label: 'Trade Secret Misappropriation Base', value: ResultFormatter.formatCurrency(res.misappropriationValue) },
        { label: 'Disclaimer', value: 'Estimates only; enforceability depends on jurisdiction & contract facts.' }
      ]
    })
  },

  // 2. GDPR Data Subject Access Request Cost
  {
    id: 'dsar-cost-calc',
    name: 'GDPR DSAR Compliance & Operational Cost Calculator',
    category: 'legal-compliance',
    subcategoryId: 'data-privacy',
    formulaMeta: {
      formulaName: 'DSAR Operational Cost Formula',
      formulaExpression: 'Total Cost = (Annual Requests × Hours per Request × Hourly Wage) + Annual Tooling',
      variables: [
        { symbol: 'DSARs', name: 'Annual DSAR Count' },
        { symbol: 'Hrs', name: 'Hours per Request', unit: 'hrs' },
        { symbol: 'Rate', name: 'Staff Hourly Wage ($/hr)', unit: '$/hr' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'annualDsars', label: 'Expected Annual Data Subject Access Requests (DSARs)', type: 'integer', required: true, defaultValue: 500, min: 1 },
        { name: 'hoursPerRequest', label: 'Average Staff Hours Required per DSAR', type: 'number', required: true, defaultValue: 4.5, min: 0.1 },
        { name: 'staffHourlyRate', label: 'Compliance Staff Hourly Cost ($/hr)', type: 'currency', required: true, defaultValue: 45, min: 1 },
        { name: 'softwareToolingCost', label: 'Annual DSAR Privacy Software Licensing ($/yr)', type: 'currency', required: true, defaultValue: 12000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualDsars: number; hoursPerRequest: number; staffHourlyRate: number; softwareToolingCost: number }) => {
      const annualLaborCost = inputs.annualDsars * inputs.hoursPerRequest * inputs.staffHourlyRate;
      const totalAnnualCost = annualLaborCost + inputs.softwareToolingCost;
      const costPerRequest = inputs.annualDsars > 0 ? totalAnnualCost / inputs.annualDsars : 0;
      return { totalAnnualCost, annualLaborCost, costPerRequest };
    },
    formatResult: (res: { totalAnnualCost: number; annualLaborCost: number; costPerRequest: number }) => ({
      primary: {
        label: 'Total Annual DSAR Compliance Cost',
        value: ResultFormatter.formatCurrency(res.totalAnnualCost),
        numericValue: res.totalAnnualCost
      },
      secondary: [
        { label: 'Cost per Individual DSAR Request', value: ResultFormatter.formatCurrency(res.costPerRequest) },
        { label: 'Annual Staff Labor Expenditure', value: ResultFormatter.formatCurrency(res.annualLaborCost) }
      ]
    })
  },

  // 3. Commercial Real Estate Cap Rate & NOI
  {
    id: 'cre-cap-rate-calc',
    name: 'Commercial Real Estate Cap Rate & NOI Calculator',
    category: 'real-estate-dev',
    subcategoryId: 'commercial-re',
    formulaMeta: {
      formulaName: 'Cap Rate & NOI Valuation Formula',
      formulaExpression: 'Cap Rate (%) = (Net Operating Income / Purchase Price) × 100',
      variables: [
        { symbol: 'Rent', name: 'Potential Gross Rent ($/yr)', unit: '$' },
        { symbol: 'Vac', name: 'Vacancy Rate (%)', unit: '%' },
        { symbol: 'OpEx', name: 'Operating Expenses ($/yr)', unit: '$' },
        { symbol: 'Price', name: 'Property Purchase Price ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'grossPotentialRent', label: 'Potential Gross Rent (Annual $)', type: 'currency', required: true, defaultValue: 200000, min: 0 },
        { name: 'vacancyRatePercent', label: 'Vacancy & Collection Loss Rate (%)', type: 'percentage', required: true, defaultValue: 5, min: 0, max: 50 },
        { name: 'operatingExpenses', label: 'Total Operating Expenses (Annual $)', type: 'currency', required: true, defaultValue: 65000, min: 0 },
        { name: 'purchasePrice', label: 'Property Purchase Price / Valuation ($)', type: 'currency', required: true, defaultValue: 1800000, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossPotentialRent: number; vacancyRatePercent: number; operatingExpenses: number; purchasePrice: number }) => {
      const vacancyLoss = inputs.grossPotentialRent * (inputs.vacancyRatePercent / 100);
      const effectiveGrossIncome = inputs.grossPotentialRent - vacancyLoss;
      const netOperatingIncome = effectiveGrossIncome - inputs.operatingExpenses;
      const capitalizationRate = inputs.purchasePrice > 0 ? (netOperatingIncome / inputs.purchasePrice) * 100 : 0;
      const grossIncomeMultiplier = effectiveGrossIncome > 0 ? inputs.purchasePrice / effectiveGrossIncome : 0;

      return { netOperatingIncome, effectiveGrossIncome, capitalizationRate, grossIncomeMultiplier };
    },
    formatResult: (res: { netOperatingIncome: number; effectiveGrossIncome: number; capitalizationRate: number; grossIncomeMultiplier: number }) => ({
      primary: {
        label: 'Capitalization Rate (Cap Rate)',
        value: `${res.capitalizationRate.toFixed(2)}%`,
        numericValue: res.capitalizationRate
      },
      secondary: [
        { label: 'Net Operating Income (NOI)', value: ResultFormatter.formatCurrency(res.netOperatingIncome) },
        { label: 'Effective Gross Income (EGI)', value: ResultFormatter.formatCurrency(res.effectiveGrossIncome) },
        { label: 'Gross Income Multiplier (GIM)', value: `${res.grossIncomeMultiplier.toFixed(2)}x` }
      ]
    })
  },

  // 4. Land Residual Value
  {
    id: 'land-residual-calc',
    name: 'Real Estate Land Residual Value Calculator',
    category: 'real-estate-dev',
    subcategoryId: 'property-dev',
    formulaMeta: {
      formulaName: 'Land Residual Development Formula',
      formulaExpression: 'Land Value = GDV - Construction Costs - Financing Costs - Developer Profit',
      variables: [
        { symbol: 'GDV', name: 'Gross Development Value ($)', unit: '$' },
        { symbol: 'Cost', name: 'Construction Costs ($)', unit: '$' },
        { symbol: 'Profit', name: 'Developer Profit Margin (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'grossDevelopmentValue', label: 'Project Gross Development Value (GDV $)', type: 'currency', required: true, defaultValue: 5000000, min: 1 },
        { name: 'constructionCosts', label: 'Hard & Soft Construction Costs ($)', type: 'currency', required: true, defaultValue: 3200000, min: 0 },
        { name: 'financingCosts', label: 'Financing, Legal & Transaction Costs ($)', type: 'currency', required: true, defaultValue: 300000, min: 0 },
        { name: 'developerProfitMarginPercent', label: 'Target Developer Profit Margin (%)', type: 'percentage', required: true, defaultValue: 20, min: 0, max: 60 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { grossDevelopmentValue: number; constructionCosts: number; financingCosts: number; developerProfitMarginPercent: number }) => {
      const totalDevelopmentCosts = inputs.constructionCosts + inputs.financingCosts;
      const targetDeveloperProfit = inputs.grossDevelopmentValue * (inputs.developerProfitMarginPercent / 100);
      const landResidualValue = Math.max(0, inputs.grossDevelopmentValue - totalDevelopmentCosts - targetDeveloperProfit);
      return { landResidualValue, totalDevelopmentCosts, targetDeveloperProfit };
    },
    formatResult: (res: { landResidualValue: number; totalDevelopmentCosts: number; targetDeveloperProfit: number }) => ({
      primary: {
        label: 'Maximum Land Residual Value',
        value: ResultFormatter.formatCurrency(res.landResidualValue),
        numericValue: res.landResidualValue
      },
      secondary: [
        { label: 'Target Developer Profit', value: ResultFormatter.formatCurrency(res.targetDeveloperProfit) },
        { label: 'Total Construction & Financing Costs', value: ResultFormatter.formatCurrency(res.totalDevelopmentCosts) }
      ]
    })
  },

  // 5. Retail Open-to-Buy Plan
  {
    id: 'open-to-buy-calc',
    name: 'Retail Open-to-Buy (OTB) Plan Calculator',
    category: 'retail-supply-chain',
    subcategoryId: 'retail-inventory',
    formulaMeta: {
      formulaName: 'Retail Open-to-Buy Formula',
      formulaExpression: 'OTB = (Planned EOM Inventory + Projected Sales + Markdowns) - (On-Hand + On-Order)',
      variables: [
        { symbol: 'EOM', name: 'Planned EOM Inventory ($)', unit: '$' },
        { symbol: 'Sales', name: 'Projected Sales ($)', unit: '$' },
        { symbol: 'OnHand', name: 'Existing On-Hand ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'plannedEomInventory', label: 'Planned End-of-Month (EOM) Inventory ($)', type: 'currency', required: true, defaultValue: 50000, min: 0 },
        { name: 'projectedSales', label: 'Projected Sales for Month ($)', type: 'currency', required: true, defaultValue: 30000, min: 0 },
        { name: 'plannedMarkdowns', label: 'Planned Markdowns & Shrinkage ($)', type: 'currency', required: true, defaultValue: 2000, min: 0 },
        { name: 'inventoryOnHand', label: 'Current Inventory On-Hand ($)', type: 'currency', required: true, defaultValue: 40000, min: 0 },
        { name: 'inventoryOnOrder', label: 'On-Order Inventory Arriving This Month ($)', type: 'currency', required: true, defaultValue: 15000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { plannedEomInventory: number; projectedSales: number; plannedMarkdowns: number; inventoryOnHand: number; inventoryOnOrder: number }) => {
      const totalMerchandiseNeeded = inputs.plannedEomInventory + inputs.projectedSales + inputs.plannedMarkdowns;
      const totalInventoryAvailable = inputs.inventoryOnHand + inputs.inventoryOnOrder;
      const openToBuyBudget = totalMerchandiseNeeded - totalInventoryAvailable;
      return { openToBuyBudget, totalMerchandiseNeeded, totalInventoryAvailable };
    },
    formatResult: (res: { openToBuyBudget: number; totalMerchandiseNeeded: number; totalInventoryAvailable: number }) => ({
      primary: {
        label: 'Open-to-Buy (OTB) Budget',
        value: ResultFormatter.formatCurrency(res.openToBuyBudget),
        numericValue: res.openToBuyBudget
      },
      secondary: [
        { label: 'Total Merchandise Needed', value: ResultFormatter.formatCurrency(res.totalMerchandiseNeeded) },
        { label: 'Total Available Inventory', value: ResultFormatter.formatCurrency(res.totalInventoryAvailable) }
      ]
    })
  },

  // 6. Stockout Cost & Lost Sales
  {
    id: 'stockout-cost-calc',
    name: 'Stockout Cost & Lost Sales Financial Calculator',
    category: 'retail-supply-chain',
    subcategoryId: 'inventory-risk',
    formulaMeta: {
      formulaName: 'Stockout Financial Impact Formula',
      formulaExpression: 'Lost Profit = Daily Unit Sales × Days × (Retail Price - COGS)',
      variables: [
        { symbol: 'Daily', name: 'Daily Unit Sales' },
        { symbol: 'Days', name: 'Stockout Duration (Days)', unit: 'days' },
        { symbol: 'Price', name: 'Retail Price ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'dailyUnitSales', label: 'Average Daily Unit Sales During Normal Stock', type: 'number', required: true, defaultValue: 25, min: 0.1 },
        { name: 'stockoutDays', label: 'Stockout Duration (Number of Days)', type: 'integer', required: true, defaultValue: 6, min: 1 },
        { name: 'retailPricePerUnit', label: 'Retail Selling Price per Unit ($)', type: 'currency', required: true, defaultValue: 40, min: 0.01 },
        { name: 'cogsPerUnit', label: 'Cost of Goods Sold (COGS) per Unit ($)', type: 'currency', required: true, defaultValue: 16, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { dailyUnitSales: number; stockoutDays: number; retailPricePerUnit: number; cogsPerUnit: number }) => {
      const lostUnits = inputs.dailyUnitSales * inputs.stockoutDays;
      const lostRevenue = lostUnits * inputs.retailPricePerUnit;
      const lostGrossProfit = lostUnits * (inputs.retailPricePerUnit - inputs.cogsPerUnit);
      return { lostGrossProfit, lostRevenue, lostUnits };
    },
    formatResult: (res: { lostGrossProfit: number; lostRevenue: number; lostUnits: number }) => ({
      primary: {
        label: 'Total Lost Gross Profit',
        value: ResultFormatter.formatCurrency(res.lostGrossProfit),
        numericValue: res.lostGrossProfit
      },
      secondary: [
        { label: 'Total Lost Top-Line Revenue', value: ResultFormatter.formatCurrency(res.lostRevenue) },
        { label: 'Total Unfulfilled Units Lost', value: `${Math.round(res.lostUnits).toLocaleString()} units` }
      ]
    })
  },

  // 7. Running Race Time Predictor
  {
    id: 'running-race-predictor-calc',
    name: 'Running Race Time Predictor (Riegel Formula)',
    category: 'sports-athletics',
    subcategoryId: 'endurance-running',
    formulaMeta: {
      formulaName: 'Riegel Endurance Race Prediction Formula',
      formulaExpression: 'T₂ = T₁ × (D₂ / D₁)^1.06',
      variables: [
        { symbol: 'T1', name: 'Recent Race Time (Seconds)' },
        { symbol: 'D1', name: 'Recent Race Distance (km/mi)' },
        { symbol: 'D2', name: 'Target Race Distance (km/mi)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'recentDistanceKm', label: 'Recent Race Distance (Kilometers)', type: 'number', required: true, defaultValue: 5, min: 0.1 },
        { name: 'recentTimeMinutes', label: 'Recent Race Finish Time (Minutes)', type: 'number', required: true, defaultValue: 20, min: 0.5 },
        { name: 'targetDistanceKm', label: 'Target Race Distance (Kilometers)', type: 'number', required: true, defaultValue: 42.195, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { recentDistanceKm: number; recentTimeMinutes: number; targetDistanceKm: number }) => {
      const recentSeconds = inputs.recentTimeMinutes * 60;
      const predictedSeconds = recentSeconds * Math.pow(inputs.targetDistanceKm / inputs.recentDistanceKm, 1.06);
      const predictedMinutes = predictedSeconds / 60;
      const hours = Math.floor(predictedMinutes / 60);
      const mins = Math.floor(predictedMinutes % 60);
      const secs = Math.round((predictedMinutes % 1) * 60);

      const timeString = hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
      const paceMinPerKm = inputs.targetDistanceKm > 0 ? predictedMinutes / inputs.targetDistanceKm : 0;

      return { predictedMinutes, timeString, paceMinPerKm };
    },
    formatResult: (res: { predictedMinutes: number; timeString: string; paceMinPerKm: number }) => ({
      primary: {
        label: 'Predicted Finish Time',
        value: res.timeString,
        numericValue: res.predictedMinutes
      },
      secondary: [
        { label: 'Predicted Average Pace', value: `${Math.floor(res.paceMinPerKm)}:${Math.round((res.paceMinPerKm % 1) * 60).toString().padStart(2, '0')} /km` },
        { label: 'Formula Basis', value: "Peter Riegel's Endurance Power Law (1.06 exponent)" }
      ]
    })
  },

  // 8. Cycling FTP & Training Zones
  {
    id: 'cycling-ftp-calc',
    name: 'Cycling FTP & Coggan Training Zones Calculator',
    category: 'sports-athletics',
    subcategoryId: 'cycling-power',
    formulaMeta: {
      formulaName: 'Cycling FTP & Training Zones Formula',
      formulaExpression: 'FTP = 20-Min Average Power × 0.95',
      variables: [
        { symbol: 'P20', name: '20-Min Test Power (Watts)', unit: 'W' },
        { symbol: 'Wt', name: 'Rider Body Weight (kg)', unit: 'kg' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'twentyMinPowerWatts', label: '20-Minute Time Trial Average Power (Watts)', type: 'number', required: true, defaultValue: 280, min: 50 },
        { name: 'riderWeightKg', label: 'Rider Body Weight (Kilograms KG)', type: 'number', required: true, defaultValue: 70, min: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { twentyMinPowerWatts: number; riderWeightKg: number }) => {
      const ftp = inputs.twentyMinPowerWatts * 0.95;
      const wattsPerKg = inputs.riderWeightKg > 0 ? ftp / inputs.riderWeightKg : 0;

      return { ftp, wattsPerKg };
    },
    formatResult: (res: { ftp: number; wattsPerKg: number }) => ({
      primary: {
        label: 'Estimated Functional Threshold Power (FTP)',
        value: `${Math.round(res.ftp)} Watts`,
        numericValue: res.ftp
      },
      secondary: [
        { label: 'Power-to-Weight Ratio', value: `${res.wattsPerKg.toFixed(2)} W/kg` },
        { label: 'Zone 2 Endurance Power Range', value: `${Math.round(res.ftp * 0.56)} - ${Math.round(res.ftp * 0.75)} W` }
      ]
    })
  },

  // 9. Swimming Pace & Critical Swim Speed
  {
    id: 'swimming-pace-calc',
    name: 'Swimming Pace & Critical Swim Speed (CSS) Calculator',
    category: 'sports-athletics',
    subcategoryId: 'swimming',
    formulaMeta: {
      formulaName: 'Critical Swim Speed Formula',
      formulaExpression: 'CSS (m/s) = (400m - 200m) / (Time 400m - Time 200m)',
      variables: [
        { symbol: 'T400', name: '400m Time (Seconds)', unit: 's' },
        { symbol: 'T200', name: '200m Time (Seconds)', unit: 's' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'time400mSeconds', label: '400m Time Trial Total Seconds (e.g. 320 for 5:20)', type: 'number', required: true, defaultValue: 320, min: 60 },
        { name: 'time200mSeconds', label: '200m Time Trial Total Seconds (e.g. 150 for 2:30)', type: 'number', required: true, defaultValue: 150, min: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { time400mSeconds: number; time200mSeconds: number }) => {
      const distanceDelta = 400 - 200; // 200 meters
      const timeDelta = inputs.time400mSeconds - inputs.time200mSeconds;
      const cssMetersPerSecond = timeDelta > 0 ? distanceDelta / timeDelta : 0;
      const pacePer100mSeconds = cssMetersPerSecond > 0 ? 100 / cssMetersPerSecond : 0;

      const paceMins = Math.floor(pacePer100mSeconds / 60);
      const paceSecs = Math.round(pacePer100mSeconds % 60);
      const paceString = `${paceMins}:${paceSecs.toString().padStart(2, '0')} / 100m`;

      return { cssMetersPerSecond, paceString, pacePer100mSeconds };
    },
    formatResult: (res: { cssMetersPerSecond: number; paceString: string; pacePer100mSeconds: number }) => ({
      primary: {
        label: 'Threshold Pace per 100m',
        value: res.paceString,
        numericValue: res.pacePer100mSeconds
      },
      secondary: [
        { label: 'Critical Swim Speed (CSS)', value: `${res.cssMetersPerSecond.toFixed(2)} m/s` },
        { label: 'Testing Protocol Basis', value: 'Standard 400m / 200m Time Trial Diff Method' }
      ]
    })
  },

  // 10. Baseball Batting Average & OBP
  {
    id: 'baseball-batting-stats-calc',
    name: 'Baseball Sabermetrics: Batting Average & OBP Calculator',
    category: 'sports-athletics',
    subcategoryId: 'baseball-stats',
    formulaMeta: {
      formulaName: 'Baseball Offensive Sabermetrics Formulas',
      formulaExpression: 'OBP = (Hits + Walks + HBP) / (At-Bats + Walks + HBP + SF), SLG = Total Bases / At-Bats',
      variables: [
        { symbol: 'AB', name: 'At-Bats' },
        { symbol: 'H', name: 'Hits' },
        { symbol: 'BB', name: 'Walks' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'atBats', label: 'At-Bats (AB)', type: 'integer', required: true, defaultValue: 400, min: 1 },
        { name: 'hits', label: 'Hits (H)', type: 'integer', required: true, defaultValue: 120, min: 0 },
        { name: 'walks', label: 'Walks (BB)', type: 'integer', required: true, defaultValue: 50, min: 0 },
        { name: 'hitByPitch', label: 'Hit By Pitch (HBP)', type: 'integer', required: true, defaultValue: 10, min: 0 },
        { name: 'sacrificeFlies', label: 'Sacrifice Flies (SF)', type: 'integer', required: true, defaultValue: 5, min: 0 },
        { name: 'totalBases', label: 'Total Bases (TB: Singles + 2×Doubles + 3×Triples + 4×HR)', type: 'integer', required: true, defaultValue: 200, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { atBats: number; hits: number; walks: number; hitByPitch: number; sacrificeFlies: number; totalBases: number }) => {
      const ab = inputs.atBats;
      const h = inputs.hits;
      const bb = inputs.walks;
      const hbp = inputs.hitByPitch;
      const sf = inputs.sacrificeFlies;
      const tb = inputs.totalBases;

      const battingAverage = ab > 0 ? h / ab : 0;
      const obpDenominator = ab + bb + hbp + sf;
      const onBasePercentage = obpDenominator > 0 ? (h + bb + hbp) / obpDenominator : 0;
      const sluggingPercentage = ab > 0 ? tb / ab : 0;
      const ops = onBasePercentage + sluggingPercentage;

      return { battingAverage, onBasePercentage, sluggingPercentage, ops };
    },
    formatResult: (res: { battingAverage: number; onBasePercentage: number; sluggingPercentage: number; ops: number }) => ({
      primary: {
        label: 'On-Base Plus Slugging (OPS)',
        value: res.ops.toFixed(3),
        numericValue: res.ops
      },
      secondary: [
        { label: 'Batting Average (BA)', value: res.battingAverage.toFixed(3) },
        { label: 'On-Base Percentage (OBP)', value: res.onBasePercentage.toFixed(3) },
        { label: 'Slugging Percentage (SLG)', value: res.sluggingPercentage.toFixed(3) }
      ]
    })
  }
];
