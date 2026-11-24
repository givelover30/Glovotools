import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH16_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Legal & Compliance
  {
    id: 'contract-law',
    categoryId: 'legal-compliance',
    name: 'Contract Law & NDA Damages',
    slug: 'contract-law',
    description: 'Estimate trade secret misappropriation damages and enforceable liquidated damages under contract law',
    sortOrder: 1
  },
  {
    id: 'data-privacy',
    categoryId: 'legal-compliance',
    name: 'Data Privacy & GDPR Compliance',
    slug: 'data-privacy',
    description: 'Calculate operational costs and labor requirements for GDPR/CCPA Data Subject Access Requests (DSAR)',
    sortOrder: 2
  },

  // Real Estate Development
  {
    id: 'commercial-re',
    categoryId: 'real-estate-dev',
    name: 'Commercial Real Estate & Cap Rate',
    slug: 'commercial-re',
    description: 'Compute Net Operating Income (NOI), Capitalization Rate (Cap Rate), and property valuation',
    sortOrder: 1
  },
  {
    id: 'property-dev',
    categoryId: 'real-estate-dev',
    name: 'Property Development & Land Residual',
    slug: 'property-dev',
    description: 'Calculate maximum land acquisition residual value based on Gross Development Value and construction costs',
    sortOrder: 2
  },

  // Retail & Supply Chain
  {
    id: 'retail-inventory',
    categoryId: 'retail-supply-chain',
    name: 'Retail Open-to-Buy Planning',
    slug: 'retail-inventory',
    description: 'Calculate merchandise Open-to-Buy budget to optimize stock levels and prevent overbuying',
    sortOrder: 1
  },
  {
    id: 'inventory-risk',
    categoryId: 'retail-supply-chain',
    name: 'Stockout Cost & Lost Sales',
    slug: 'inventory-risk',
    description: 'Quantify financial loss, lost profit, and customer goodwill impact resulting from stockout events',
    sortOrder: 2
  },

  // Sports & Athletics
  {
    id: 'endurance-running',
    categoryId: 'sports-athletics',
    name: 'Endurance Running & Race Prediction',
    slug: 'endurance-running',
    description: 'Predict finish times for running distances using Peter Riegel’s endurance mathematical formula',
    sortOrder: 1
  },
  {
    id: 'cycling-power',
    categoryId: 'sports-athletics',
    name: 'Cycling FTP & Training Zones',
    slug: 'cycling-power',
    description: 'Calculate Functional Threshold Power (FTP) and establish Coggan 7-zone power training ranges',
    sortOrder: 2
  },
  {
    id: 'swimming',
    categoryId: 'sports-athletics',
    name: 'Swimming Pace & Critical Swim Speed',
    slug: 'swimming',
    description: 'Compute Critical Swim Speed (CSS) and threshold pace per 100 meters/yards from time trials',
    sortOrder: 3
  },
  {
    id: 'baseball-stats',
    categoryId: 'sports-athletics',
    name: 'Baseball Sabermetrics & Offensive Stats',
    slug: 'baseball-stats',
    description: 'Calculate Batting Average (BA), On-Base Percentage (OBP), Slugging Percentage (SLG), and OPS',
    sortOrder: 4
  }
];

export const BATCH16_METADATA: CalculatorMeta[] = [
  // 1. NDA Breach Damage & Liquidated Damages
  {
    id: 'nda-damages-calc',
    name: 'NDA Breach Damage & Liquidated Damages Estimator',
    shortDesc: 'Estimate trade secret misappropriation damages and enforceable liquidated damages under contract law',
    category: 'legal-compliance',
    subcategoryId: 'contract-law',
    tags: ['legal', 'nda', 'breach-damages', 'liquidated-damages', 'contract-law'],
    formula: 'Damages = Misappropriation Value + Lost Revenue + Legal Fees (capped at Contract Limit)',
    isPopular: true,
    iconName: 'Scale',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 2. GDPR Data Subject Access Request Cost
  {
    id: 'dsar-cost-calc',
    name: 'GDPR DSAR Compliance & Operational Cost Calculator',
    shortDesc: 'Calculate operational labor and compliance costs associated with fulfilling GDPR/CCPA Data Subject Access Requests',
    category: 'legal-compliance',
    subcategoryId: 'data-privacy',
    tags: ['legal', 'gdpr', 'dsar', 'data-privacy', 'compliance-cost'],
    formula: 'Total Cost = (Annual DSARs × Hours per Request × Hourly Wage) + Annual Tooling',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. Commercial Real Estate Cap Rate & NOI
  {
    id: 'cre-cap-rate-calc',
    name: 'Commercial Real Estate Cap Rate & NOI Calculator',
    shortDesc: 'Compute Net Operating Income (NOI), Capitalization Rate (Cap Rate), and property valuation',
    category: 'real-estate-dev',
    subcategoryId: 'commercial-re',
    tags: ['real-estate', 'cap-rate', 'noi', 'commercial-property', 'valuation'],
    formula: 'Cap Rate (%) = (Net Operating Income / Purchase Price) × 100',
    isPopular: true,
    iconName: 'Building',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Land Residual Value
  {
    id: 'land-residual-calc',
    name: 'Real Estate Land Residual Value Calculator',
    shortDesc: 'Determine maximum land acquisition residual value based on Gross Development Value and construction costs',
    category: 'real-estate-dev',
    subcategoryId: 'property-dev',
    tags: ['real-estate', 'land-residual', 'property-development', 'gdv', 'acquisition'],
    formula: 'Land Residual = GDV - Construction Costs - Financing Costs - Developer Profit',
    isPopular: false,
    iconName: 'Landmark',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 5. Retail Open-to-Buy Plan
  {
    id: 'open-to-buy-calc',
    name: 'Retail Open-to-Buy (OTB) Plan Calculator',
    shortDesc: 'Calculate merchandise Open-to-Buy budget to optimize inventory levels and prevent overbuying',
    category: 'retail-supply-chain',
    subcategoryId: 'retail-inventory',
    tags: ['retail', 'open-to-buy', 'otb', 'inventory-planning', 'supply-chain'],
    formula: 'OTB = (Planned EOM Inventory + Projected Sales + Markdowns) - (On-Hand + On-Order)',
    isPopular: true,
    iconName: 'Store',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 6. Stockout Cost & Lost Sales
  {
    id: 'stockout-cost-calc',
    name: 'Stockout Cost & Lost Sales Financial Calculator',
    shortDesc: 'Quantify financial loss, lost profit, and customer goodwill impact resulting from stockout events',
    category: 'retail-supply-chain',
    subcategoryId: 'inventory-risk',
    tags: ['retail', 'stockout-cost', 'lost-sales', 'inventory-risk', 'supply-chain'],
    formula: 'Lost Profit = Lost Units × (Retail Price - COGS)',
    isPopular: false,
    iconName: 'AlertTriangle',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 7. Running Race Time Predictor
  {
    id: 'running-race-predictor-calc',
    name: 'Running Race Time Predictor (Riegel Formula)',
    shortDesc: 'Predict finish times for running distances using Peter Riegel’s endurance mathematical formula',
    category: 'sports-athletics',
    subcategoryId: 'endurance-running',
    tags: ['sports', 'running', 'race-predictor', 'riegel-formula', 'endurance'],
    formula: 'T₂ = T₁ × (D₂ / D₁)^1.06',
    isPopular: true,
    iconName: 'Activity',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2'
  },
  // 8. Cycling FTP & Training Zones
  {
    id: 'cycling-ftp-calc',
    name: 'Cycling FTP & Coggan Training Zones Calculator',
    shortDesc: 'Calculate Functional Threshold Power (FTP) and establish Coggan 7-zone power training ranges',
    category: 'sports-athletics',
    subcategoryId: 'cycling-power',
    tags: ['sports', 'cycling', 'ftp', 'coggan-zones', 'power-meter'],
    formula: 'FTP = 20-Min Average Power × 0.95',
    isPopular: false,
    iconName: 'Bike',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2'
  },
  // 9. Swimming Pace & Critical Swim Speed
  {
    id: 'swimming-pace-calc',
    name: 'Swimming Pace & Critical Swim Speed (CSS) Calculator',
    shortDesc: 'Compute Critical Swim Speed (CSS) and threshold pace per 100 meters/yards from time trials',
    category: 'sports-athletics',
    subcategoryId: 'swimming',
    tags: ['sports', 'swimming', 'critical-swim-speed', 'css', 'swim-pace'],
    formula: 'CSS (m/s) = (400 - 200) / (Time 400m - Time 200m)',
    isPopular: false,
    iconName: 'Waves',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2'
  },
  // 10. Baseball Batting Average & OBP
  {
    id: 'baseball-batting-stats-calc',
    name: 'Baseball Sabermetrics: Batting Average & OBP Calculator',
    shortDesc: 'Calculate Batting Average (BA), On-Base Percentage (OBP), Slugging Percentage (SLG), and OPS',
    category: 'sports-athletics',
    subcategoryId: 'baseball-stats',
    tags: ['sports', 'baseball', 'sabermetrics', 'batting-average', 'obp', 'ops'],
    formula: 'OBP = (Hits + Walks + HBP) / (At-Bats + Walks + HBP + Sacrifice Flies)',
    isPopular: false,
    iconName: 'Trophy',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2'
  }
];
