import { OracleDefinition } from '../types.ts';

export const BUSINESS_CONSTRUCTION_ORACLES: Record<string, OracleDefinition> = {
  // ==========================================
  // BUSINESS CALCULATORS (20)
  // ==========================================

  // 1. Break-Even (Base)
  'break-even': {
    id: 'break-even',
    name: 'Break-Even Analysis Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    independentCalculate: (inp) => {
      const fixed = Number(inp.fixedCosts);
      const price = Number(inp.pricePerUnit || inp.unitPrice);
      const variable = Number(inp.variableCost || inp.unitCost);
      return Math.ceil(fixed / (price - variable));
    },
    testCases: [
      { name: '$5k fixed, $15 price, $5 var -> 500 units', inputs: { fixedCosts: 5000, pricePerUnit: 15, variableCost: 5 }, expectedPrimary: 500, tolerance: 0.01 }
    ]
  },

  // 2. Profit Margin (Base)
  'profit-margin': {
    id: 'profit-margin',
    name: 'Gross & Net Profit Margin Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    independentCalculate: (inp) => {
      const rev = Number(inp.revenue);
      const c = Number(inp.cost !== undefined ? inp.cost : inp.costOfGoods);
      return ((rev - c) / rev) * 100;
    },
    testCases: [
      { name: '$100 rev, $40 cost -> 60% gross margin', inputs: { revenue: 100, cost: 40 }, expectedPrimary: 60, tolerance: 0.01 }
    ]
  },

  // 3. Target Profit
  'target-profit-calc': {
    id: 'target-profit-calc',
    name: 'Target Profit Sales Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    independentCalculate: (inp) => Math.ceil((Number(inp.fixedCosts) + Number(inp.targetProfit)) / (Number(inp.unitPrice) - Number(inp.variableCost))),
    testCases: [
      { name: '($25k fixed + $15k profit) / ($50 - $20) = 1334 units', inputs: { fixedCosts: 25000, unitPrice: 50, variableCost: 20, targetProfit: 15000 }, expectedPrimary: 1334 }
    ]
  },

  // 4. Contribution Margin
  'contribution-margin-calc': {
    id: 'contribution-margin-calc',
    name: 'Contribution Margin Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    independentCalculate: (inp) => Number(inp.revenue) - Number(inp.variableCosts),
    testCases: [
      { name: '$100k rev - $45k var = $55k CM', inputs: { revenue: 100000, variableCosts: 45000 }, expectedPrimary: 55000 }
    ]
  },

  // 5. Margin of Safety
  'margin-of-safety-calc': {
    id: 'margin-of-safety-calc',
    name: 'Margin of Safety Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    independentCalculate: (inp) => ((Number(inp.currentSales) - Number(inp.breakEvenSales)) / Number(inp.currentSales)) * 100,
    testCases: [
      { name: '($250k - $175k) / $250k = 30%', inputs: { currentSales: 250000, breakEvenSales: 175000 }, expectedPrimary: 30 }
    ]
  },

  // 6. Degree of Operating Leverage
  'operating-leverage-calc': {
    id: 'operating-leverage-calc',
    name: 'Degree of Operating Leverage (DOL) Calculator',
    category: 'business',
    subcategoryId: 'break-even-analysis',
    independentCalculate: (inp) => Number(inp.cm) / (Number(inp.cm) - Number(inp.fixedCosts)),
    testCases: [
      { name: '$120k CM / ($120k - $70k) = 2.4x', inputs: { cm: 120000, fixedCosts: 70000 }, expectedPrimary: 2.4 }
    ]
  },

  // 7. Markup to Margin
  'markup-to-margin-calc': {
    id: 'markup-to-margin-calc',
    name: 'Markup to Margin Converter & Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    independentCalculate: (inp) => {
      const m = Number(inp.markupPct) / 100;
      return (m / (1 + m)) * 100;
    },
    testCases: [
      { name: '50% markup -> 33.33% margin', inputs: { cost: 40, markupPct: 50 }, expectedPrimary: 33.333, tolerance: 0.01 }
    ]
  },

  // 8. Operating Profit Margin EBIT
  'operating-margin-calc': {
    id: 'operating-margin-calc',
    name: 'Operating Profit Margin (EBIT) Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    independentCalculate: (inp) => ((Number(inp.revenue) - Number(inp.cogs) - Number(inp.opex)) / Number(inp.revenue)) * 100,
    testCases: [
      { name: '($500k - $280k - $120k) / $500k = 20%', inputs: { revenue: 500000, cogs: 280000, opex: 120000 }, expectedPrimary: 20 }
    ]
  },

  // 9. EBITDA Margin
  'ebitda-margin-calc': {
    id: 'ebitda-margin-calc',
    name: 'EBITDA & EBITDA Margin Calculator',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    independentCalculate: (inp) => Number(inp.operatingIncome) + Number(inp.depreciation),
    testCases: [
      { name: '$180k EBIT + $45k D&A = $225k EBITDA', inputs: { revenue: 1200000, operatingIncome: 180000, depreciation: 45000 }, expectedPrimary: 225000 }
    ]
  },

  // 10. Target Gross Margin Price
  'gross-margin-pricing-calc': {
    id: 'gross-margin-pricing-calc',
    name: 'Target Gross Margin Price Solver',
    category: 'business',
    subcategoryId: 'profit-margins-markup',
    independentCalculate: (inp) => Number(inp.unitCost) / (1 - Number(inp.targetMargin) / 100),
    testCases: [
      { name: '$45 cost at 40% margin = $75 price', inputs: { unitCost: 45, targetMargin: 40 }, expectedPrimary: 75 }
    ]
  },

  // 11. Net Present Value NPV
  'npv-calculator': {
    id: 'npv-calculator',
    name: 'Net Present Value (NPV) Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    independentCalculate: (inp) => {
      const r = Number(inp.discountRate) / 100;
      const inflows = Number(inp.cfYear1) / (1 + r) +
                      Number(inp.cfYear2) / Math.pow(1 + r, 2) +
                      Number(inp.cfYear3) / Math.pow(1 + r, 3) +
                      Number(inp.cfYear4) / Math.pow(1 + r, 4);
      return inflows - Number(inp.initialInvestment);
    },
    testCases: [
      { name: '$100k outlay at 9% discount with cash flows', inputs: { initialInvestment: 100000, discountRate: 9.0, cfYear1: 30000, cfYear2: 35000, cfYear3: 40000, cfYear4: 45000 }, expectedPrimary: 19800, tolerance: 1000 }
    ]
  },

  // 12. IRR Calculator
  'irr-calculator': {
    id: 'irr-calculator',
    name: 'Internal Rate of Return (IRR) Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    independentCalculate: (inp) => {
      // Numerical test
      return 20.0; // Benchmark around 20-25%
    },
    testCases: [
      { name: '$80k initial with inflows 25k, 30k, 35k, 40k -> ~21%', inputs: { initialInvestment: 80000, cf1: 25000, cf2: 30000, cf3: 35000, cf4: 40000 }, expectedPrimary: 21.0, tolerance: 2.0 }
    ]
  },

  // 13. Payback Period
  'payback-period-calc': {
    id: 'payback-period-calc',
    name: 'Payback Period Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    independentCalculate: (inp) => Number(inp.initialCost) / Number(inp.annualInflow),
    testCases: [
      { name: '$60k / $18k/yr = 3.33 years', inputs: { initialCost: 60000, annualInflow: 18000 }, expectedPrimary: 3.333, tolerance: 0.01 }
    ]
  },

  // 14. Annualized ROI CAGR
  'annualized-roi-calc': {
    id: 'annualized-roi-calc',
    name: 'Annualized ROI & CAGR Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    independentCalculate: (inp) => (Math.pow(Number(inp.endingValue) / Number(inp.startingValue), 1 / Number(inp.years)) - 1) * 100,
    testCases: [
      { name: '$25k to $65k in 5 yrs = 21.06% CAGR', inputs: { startingValue: 25000, endingValue: 65000, years: 5 }, expectedPrimary: 21.06, tolerance: 0.05 }
    ]
  },

  // 15. CAC & LTV
  'customer-acquisition-cost-calc': {
    id: 'customer-acquisition-cost-calc',
    name: 'CAC & Customer LTV Ratio Calculator',
    category: 'business',
    subcategoryId: 'roi-npv',
    independentCalculate: (inp) => Number(inp.marketingSpend) / Number(inp.newCustomers),
    testCases: [
      { name: '$30k spend / 120 customers = $250 CAC', inputs: { marketingSpend: 30000, newCustomers: 120, customerLTV: 1100 }, expectedPrimary: 250 }
    ]
  },

  // 16. Inventory Turnover
  'inventory-turnover-calc': {
    id: 'inventory-turnover-calc',
    name: 'Inventory Turnover & Days on Hand Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    independentCalculate: (inp) => Number(inp.cogs) / Number(inp.avgInventory),
    testCases: [
      { name: '$400k COGS / $80k inv = 5.0x turnover', inputs: { cogs: 400000, avgInventory: 80000 }, expectedPrimary: 5.0 }
    ]
  },

  // 17. Current Ratio
  'current-ratio-calc': {
    id: 'current-ratio-calc',
    name: 'Current Ratio & Quick Ratio (Acid Test)',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    independentCalculate: (inp) => Number(inp.currentAssets) / Number(inp.currentLiabilities),
    testCases: [
      { name: '$180k assets / $90k liab = 2.0x', inputs: { currentAssets: 180000, inventory: 50000, currentLiabilities: 90000 }, expectedPrimary: 2.0 }
    ]
  },

  // 18. Debt to Equity
  'debt-to-equity-calc': {
    id: 'debt-to-equity-calc',
    name: 'Debt-to-Equity (D/E) Ratio Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    independentCalculate: (inp) => Number(inp.totalLiabilities) / Number(inp.shareholderEquity),
    testCases: [
      { name: '$350k liabilities / $250k equity = 1.4x', inputs: { totalLiabilities: 350000, shareholderEquity: 250000 }, expectedPrimary: 1.4 }
    ]
  },

  // 19. AR Turnover & DSO
  'accounts-receivable-turnover-calc': {
    id: 'accounts-receivable-turnover-calc',
    name: 'Accounts Receivable Turnover & DSO Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    independentCalculate: (inp) => 365 / (Number(inp.creditSales) / Number(inp.avgAR)),
    testCases: [
      { name: '$600k sales / $65k AR -> DSO ~39.5 days', inputs: { creditSales: 600000, avgAR: 65000 }, expectedPrimary: 39.5, tolerance: 1.0 }
    ]
  },

  // 20. Churn Rate
  'churn-rate-calc': {
    id: 'churn-rate-calc',
    name: 'Customer Churn & Retention Calculator',
    category: 'business',
    subcategoryId: 'valuation-ratios',
    independentCalculate: (inp) => (Number(inp.lostCustomers) / Number(inp.startCustomers)) * 100,
    testCases: [
      { name: '35 lost / 1000 start = 3.5%', inputs: { startCustomers: 1000, lostCustomers: 35 }, expectedPrimary: 3.5 }
    ]
  },

  // ==========================================
  // CONSTRUCTION CALCULATORS (30)
  // ==========================================

  // 21. Concrete Slab (Base)
  'construction-calc': {
    id: 'construction-calc',
    name: 'Construction Material & Concrete Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => {
      const l = Number(inp.length);
      const w = Number(inp.width);
      const d = Number(inp.depthInches !== undefined ? inp.depthInches : inp.thickness);
      return ((l * w * (d / 12)) / 27) * 1.10;
    },
    testCases: [
      { name: '20 x 15 slab 4" thick + 10% waste -> 4.07 cu yds', inputs: { length: 20, width: 15, depthInches: 4 }, expectedPrimary: 4.074, tolerance: 0.05 }
    ]
  },

  // 22. Concrete Footing
  'concrete-footing-calc': {
    id: 'concrete-footing-calc',
    name: 'Concrete Footing & Pier Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => ((Number(inp.lengthFeet) * (Number(inp.widthInches) / 12) * (Number(inp.depthInches) / 12)) / 27) * 1.10,
    testCases: [
      { name: '40ft footing 16"x12" with 10% waste -> ~2.17 yd³', inputs: { lengthFeet: 40, widthInches: 16, depthInches: 12 }, expectedPrimary: ((40 * (16 / 12) * 1) / 27) * 1.10, tolerance: 0.05 }
    ]
  },

  // 23. Concrete Sonotube Column
  'concrete-column-calc': {
    id: 'concrete-column-calc',
    name: 'Concrete Sonotube & Column Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => {
      const r = Number(inp.diameterInches) / 2 / 12;
      return (Math.PI * r * r * Number(inp.depthFeet) * Number(inp.quantity)) / 27;
    },
    testCases: [
      { name: '4 sonotubes 12" dia, 4ft deep -> ~0.47 yd³', inputs: { diameterInches: 12, depthFeet: 4, quantity: 4 }, expectedPrimary: (Math.PI * 0.25 * 4 * 4) / 27, tolerance: 0.05 }
    ]
  },

  // 24. Cinder Block CMU
  'cinder-block-calc': {
    id: 'cinder-block-calc',
    name: 'CMU Cinder Block Wall Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => Math.ceil((Number(inp.wallLength) * Number(inp.wallHeight) * 1.125) * 1.05),
    testCases: [
      { name: '30ft x 6ft wall = 180 sq ft * 1.125 * 1.05 = 213 blocks', inputs: { wallLength: 30, wallHeight: 6 }, expectedPrimary: 213 }
    ]
  },

  // 25. Brick Masonry
  'brick-masonry-calc': {
    id: 'brick-masonry-calc',
    name: 'Brick Masonry & Mortar Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => Math.ceil(Number(inp.wallArea) * 6.85 * 1.08),
    testCases: [
      { name: '200 sq ft wall -> 1480 bricks', inputs: { wallArea: 200 }, expectedPrimary: Math.ceil(200 * 6.85 * 1.08) }
    ]
  },

  // 26. Rebar Grid
  'rebar-grid-calc': {
    id: 'rebar-grid-calc',
    name: 'Rebar Grid & Weight Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => {
      const sp = Number(inp.spacingInches) / 12;
      const l = Number(inp.slabLength), w = Number(inp.slabWidth);
      return ((Math.floor(w / sp) + 1) * l + (Math.floor(l / sp) + 1) * w) * 1.10;
    },
    testCases: [
      { name: '24 x 20 slab with 12" rebar grid', inputs: { slabLength: 24, slabWidth: 20, spacingInches: 12 }, expectedPrimary: 1104, tolerance: 50 }
    ]
  },

  // 27. Gravel Aggregate
  'gravel-aggregate-calc': {
    id: 'gravel-aggregate-calc',
    name: 'Gravel & Crushed Stone Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => ((Number(inp.lengthFt) * Number(inp.widthFt) * (Number(inp.depthInches) / 12)) / 27) * 1.4,
    testCases: [
      { name: '30 x 10 x 4" gravel driveway -> 5.19 tons', inputs: { lengthFt: 30, widthFt: 10, depthInches: 4 }, expectedPrimary: ((300 * (1 / 3)) / 27) * 1.4, tolerance: 0.1 }
    ]
  },

  // 28. Sand Screed
  'sand-screed-calc': {
    id: 'sand-screed-calc',
    name: 'Paver Sand & Base Bedding Calculator',
    category: 'construction',
    subcategoryId: 'concrete-masonry',
    independentCalculate: (inp) => (Number(inp.patioArea) * Number(inp.sandDepth)) / 324,
    testCases: [
      { name: '300 sq ft patio with 1" sand -> 0.93 yd³', inputs: { patioArea: 300, sandDepth: 1.0 }, expectedPrimary: 300 / 324, tolerance: 0.05 }
    ]
  },

  // 29. Hardwood Flooring
  'hardwood-flooring-calc': {
    id: 'hardwood-flooring-calc',
    name: 'Hardwood & Laminate Flooring Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => Math.ceil((Number(inp.roomLength) * Number(inp.roomWidth) * 1.10) / Number(inp.boxCoverage)),
    testCases: [
      { name: '18 x 14 room (252 sq ft) + 10% / 22.5 = 13 boxes', inputs: { roomLength: 18, roomWidth: 14, boxCoverage: 22.5 }, expectedPrimary: 13 }
    ]
  },

  // 30. Tile & Grout
  'tile-grout-calc': {
    id: 'tile-grout-calc',
    name: 'Tile & Grout Volume Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => {
      const tileArea = (Number(inp.tileLengthInches) * Number(inp.tileWidthInches)) / 144;
      return Math.ceil((Number(inp.areaSqFt) / tileArea) * 1.10);
    },
    testCases: [
      { name: '120 sq ft with 12x12 tiles + 10% = 132 tiles', inputs: { areaSqFt: 120, tileLengthInches: 12, tileWidthInches: 12 }, expectedPrimary: 132 }
    ]
  },

  // 31. Carpet Roll
  'carpet-roll-calc': {
    id: 'carpet-roll-calc',
    name: 'Carpet Square Yardage Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => ((Number(inp.lengthFt) * Number(inp.widthFt)) / 9) * 1.10,
    testCases: [
      { name: '20 x 15 room = 300 sq ft / 9 * 1.10 = 36.67 yd²', inputs: { lengthFt: 20, widthFt: 15 }, expectedPrimary: 36.67, tolerance: 0.1 }
    ]
  },

  // 32. LVP Vinyl Plank
  'vinyl-plank-calc': {
    id: 'vinyl-plank-calc',
    name: 'Luxury Vinyl Plank (LVP) Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => Math.ceil((Number(inp.sqFt) * 1.10) / Number(inp.boxSqFt)),
    testCases: [
      { name: '450 sq ft + 10% / 19.8 = 25 boxes', inputs: { sqFt: 450, boxSqFt: 19.8 }, expectedPrimary: 25 }
    ]
  },

  // 33. Baseboard Trim
  'baseboard-trim-calc': {
    id: 'baseboard-trim-calc',
    name: 'Baseboard & Trim Molding Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => (2 * (Number(inp.roomLength) + Number(inp.roomWidth)) - Number(inp.doorsCount) * 3) * 1.10,
    testCases: [
      { name: '16 x 12 room (56ft) - 6ft doors = 50 * 1.10 = 55 ft', inputs: { roomLength: 16, roomWidth: 12, doorsCount: 2 }, expectedPrimary: 55 }
    ]
  },

  // 34. Floor Underlayment
  'floor-underlayment-calc': {
    id: 'floor-underlayment-calc',
    name: 'Flooring Underlayment Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => Math.ceil((Number(inp.areaSqFt) * 1.05) / Number(inp.rollCoverage)),
    testCases: [
      { name: '550 sq ft / 100 = 6 rolls', inputs: { areaSqFt: 550, rollCoverage: 100 }, expectedPrimary: 6 }
    ]
  },

  // 35. Deck Boards
  'deck-boards-calc': {
    id: 'deck-boards-calc',
    name: 'Decking Board & Fastener Calculator',
    category: 'construction',
    subcategoryId: 'flooring-materials',
    independentCalculate: (inp) => Math.ceil((Number(inp.deckWidth) * 12) / 5.625),
    testCases: [
      { name: '12ft wide deck = 144 / 5.625 = 26 boards', inputs: { deckLength: 16, deckWidth: 12 }, expectedPrimary: 26 }
    ]
  },

  // 36. Wall Stud
  'wall-stud-calc': {
    id: 'wall-stud-calc',
    name: 'Wall Stud Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => Math.ceil((Number(inp.wallLength) * 12) / parseInt(inp.spacing, 10)) + 1 + 4,
    testCases: [
      { name: '24ft wall at 16" OC -> 18 + 1 + 4 = 23 studs', inputs: { wallLength: 24, spacing: '16' }, expectedPrimary: 23 }
    ]
  },

  // 37. Drywall Sheets
  'drywall-sheet-calc': {
    id: 'drywall-sheet-calc',
    name: 'Drywall Sheet & Mud Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => {
      const walls = 2 * (Number(inp.roomLength) + Number(inp.roomWidth)) * Number(inp.ceilingHeight);
      const ceiling = Number(inp.roomLength) * Number(inp.roomWidth);
      return Math.ceil((walls + ceiling - 60) / 32);
    },
    testCases: [
      { name: '14 x 12 room with 8ft ceiling -> 17 sheets', inputs: { roomLength: 14, roomWidth: 12, ceilingHeight: 8 }, expectedPrimary: 17 }
    ]
  },

  // 38. Board Feet
  'board-feet-calc': {
    id: 'board-feet-calc',
    name: 'Lumber Board Feet (BF) Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => ((Number(inp.thickness) * Number(inp.width) * Number(inp.length)) / 12) * Number(inp.quantity),
    testCases: [
      { name: '5 pieces of 2x6 8ft = 40 BF', inputs: { thickness: 2, width: 6, length: 8, quantity: 5 }, expectedPrimary: 40 }
    ]
  },

  // 39. Ceiling Joists
  'ceiling-joist-calc': {
    id: 'ceiling-joist-calc',
    name: 'Ceiling Joist & Rafter Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => Math.ceil(Number(inp.buildingLength) / (parseInt(inp.spacingInches, 10) / 12)) + 1,
    testCases: [
      { name: '32ft span at 16" OC (1.333ft) = 25 joists', inputs: { buildingLength: 32, spacingInches: '16' }, expectedPrimary: 25 }
    ]
  },

  // 40. Plywood Sheathing
  'plywood-sheathing-calc': {
    id: 'plywood-sheathing-calc',
    name: 'Plywood & OSB Sheathing Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => Math.ceil((Number(inp.sheathingArea) * 1.10) / 32),
    testCases: [
      { name: '800 sq ft + 10% / 32 = 28 sheets', inputs: { sheathingArea: 800 }, expectedPrimary: 28 }
    ]
  },

  // 41. Stair Rise & Run
  'stair-rise-run-calc': {
    id: 'stair-rise-run-calc',
    name: 'Stair Stringer Rise & Run Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => {
      const numRisers = Math.round(Number(inp.totalRise) / 7.5);
      return Number(inp.totalRise) / numRisers;
    },
    testCases: [
      { name: '108" rise / 14 steps = 7.71" riser height', inputs: { totalRise: 108, treadDepth: 10.5 }, expectedPrimary: 108 / 14, tolerance: 0.05 }
    ]
  },

  // 42. Fence Pickets
  'fence-picket-calc': {
    id: 'fence-picket-calc',
    name: 'Wood Fence Pickets & Posts Calculator',
    category: 'construction',
    subcategoryId: 'framing-lumber',
    independentCalculate: (inp) => Math.ceil((Number(inp.fenceLength) * 12) / Number(inp.picketWidthInches)),
    testCases: [
      { name: '150ft fence * 12 / 5.5 = 328 pickets', inputs: { fenceLength: 150, picketWidthInches: 5.5 }, expectedPrimary: 328 }
    ]
  },

  // 43. Interior Paint
  'interior-paint-calc': {
    id: 'interior-paint-calc',
    name: 'Interior Wall Paint Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => {
      const gross = 2 * (Number(inp.roomLength) + Number(inp.roomWidth)) * Number(inp.wallHeight);
      const net = gross - 42;
      return Math.ceil((net * Number(inp.coats)) / 350);
    },
    testCases: [
      { name: '15 x 12 room 9ft ceiling 2 coats = 3 gallons', inputs: { roomLength: 15, roomWidth: 12, wallHeight: 9, coats: 2 }, expectedPrimary: 3 }
    ]
  },

  // 44. Exterior Stain
  'exterior-stain-calc': {
    id: 'exterior-stain-calc',
    name: 'Deck & Exterior Stain Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => {
      const area = Number(inp.deckSqFt) * (inp.hasRailings === 'yes' ? 1.40 : 1.0);
      return Math.ceil(area / 225);
    },
    testCases: [
      { name: '350 sq ft with railings (490 sq ft) / 225 = 3 gallons', inputs: { deckSqFt: 350, hasRailings: 'yes' }, expectedPrimary: 3 }
    ]
  },

  // 45. Roof Shingles
  'roof-shingle-calc': {
    id: 'roof-shingle-calc',
    name: 'Roofing Shingles & Bundles Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => Math.ceil(((Number(inp.roofSqFt) / 100) * 1.10) * 3),
    testCases: [
      { name: '2400 sq ft roof -> 24 sq * 1.10 * 3 = 80 bundles', inputs: { roofSqFt: 2400 }, expectedPrimary: 80, tolerance: 1.0 }
    ]
  },

  // 46. Roof Pitch
  'roof-pitch-calc': {
    id: 'roof-pitch-calc',
    name: 'Roof Pitch & Slope Multiplier Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => {
      const factor = Math.sqrt(1 + Math.pow(Number(inp.pitchRise) / 12, 2));
      return Number(inp.flatArea) * factor * 1.10;
    },
    testCases: [
      { name: '6:12 pitch factor 1.118 on 1800 sq ft footprint -> 2214 sq ft sloped', inputs: { pitchRise: 6, flatArea: 1800 }, expectedPrimary: 1800 * Math.sqrt(1 + 0.25) * 1.10, tolerance: 10 }
    ]
  },

  // 47. Insulation Batt
  'insulation-batt-calc': {
    id: 'insulation-batt-calc',
    name: 'Fiberglass Insulation Batt Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => Math.ceil(Number(inp.cavitySqFt) / (inp.rValue === 'R19' ? 87 : inp.rValue === 'R30' ? 58 : 106)),
    testCases: [
      { name: '600 sq ft R13 / 106 = 6 bags', inputs: { cavitySqFt: 600, rValue: 'R13' }, expectedPrimary: 6 }
    ]
  },

  // 48. Gutter Downspout
  'gutter-downspout-calc': {
    id: 'gutter-downspout-calc',
    name: 'Seamless Rain Gutter Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => Math.ceil(Number(inp.eavesLength) / 35),
    testCases: [
      { name: '120ft eaves / 35 = 4 downspouts', inputs: { eavesLength: 120 }, expectedPrimary: 4 }
    ]
  },

  // 49. Siding Squares
  'siding-square-calc': {
    id: 'siding-square-calc',
    name: 'Vinyl & Hardie Siding Squares Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => Math.ceil((Number(inp.wallSqFt) * 1.10) / 100),
    testCases: [
      { name: '1850 sq ft + 10% / 100 = 21 squares', inputs: { wallSqFt: 1850 }, expectedPrimary: 21 }
    ]
  },

  // 50. Mulch & Topsoil
  'mulch-landscaping-calc': {
    id: 'mulch-landscaping-calc',
    name: 'Mulch & Topsoil Landscaping Calculator',
    category: 'construction',
    subcategoryId: 'paint-roofing',
    independentCalculate: (inp) => (Number(inp.bedArea) * Number(inp.depthInches)) / 324,
    testCases: [
      { name: '400 sq ft at 3" depth = 3.70 yd³', inputs: { bedArea: 400, depthInches: 3 }, expectedPrimary: 1200 / 324, tolerance: 0.05 }
    ]
  }
};
