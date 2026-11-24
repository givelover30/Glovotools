import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH13_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Banking & Savings
  {
    id: 'deposit-accounts',
    categoryId: 'banking-savings',
    name: 'Deposit Accounts & CDs',
    slug: 'deposit-accounts',
    description: 'Calculate Certificate of Deposit (CD) maturity values and earned interest',
    sortOrder: 1
  },
  {
    id: 'savings-accumulation',
    categoryId: 'banking-savings',
    name: 'Savings Accumulation & Growth',
    slug: 'savings-accumulation',
    description: 'Project long-term savings growth from initial lump sums and recurring monthly deposits',
    sortOrder: 2
  },

  // Business Operations
  {
    id: 'saas-unit-economics',
    categoryId: 'business-operations',
    name: 'SaaS & Unit Economics',
    slug: 'saas-unit-economics',
    description: 'Evaluate customer lifetime value (LTV), acquisition cost (CAC), and payback period',
    sortOrder: 1
  },
  {
    id: 'human-resources',
    categoryId: 'business-operations',
    name: 'Human Resources & Retention',
    slug: 'human-resources',
    description: 'Calculate annual workforce turnover rates and estimated employee replacement hiring costs',
    sortOrder: 2
  },

  // Logistics & Shipping
  {
    id: 'freight-parcel',
    categoryId: 'logistics-shipping',
    name: 'Freight & Parcel Shipping',
    slug: 'freight-parcel',
    description: 'Compute billable dimensional weight, carrier freight rates, and fuel surcharges',
    sortOrder: 1
  },

  // Manufacturing & Inventory
  {
    id: 'inventory-management',
    categoryId: 'manufacturing-inventory',
    name: 'Inventory Management & EOQ',
    slug: 'inventory-management',
    description: 'Calculate Economic Order Quantity, safety stock reorder points, and inventory turnover ratios',
    sortOrder: 1
  },
  {
    id: 'plant-operations',
    categoryId: 'manufacturing-inventory',
    name: 'Plant Operations & OEE',
    slug: 'plant-operations',
    description: 'Measure manufacturing productivity via Overall Equipment Effectiveness (OEE) and availability',
    sortOrder: 2
  }
];

export const BATCH13_METADATA: CalculatorMeta[] = [
  // Banking & Savings
  {
    id: 'cd-interest-calc',
    name: 'Certificate of Deposit (CD) Calculator',
    shortDesc: 'Calculate total maturity value and earned interest for fixed-term Certificates of Deposit',
    category: 'banking-savings',
    subcategoryId: 'deposit-accounts',
    tags: ['banking', 'cd', 'certificate-of-deposit', 'deposit', 'interest', 'maturity'],
    formula: 'Maturity Value = Principal × (1 + APY / n)^(n × t)',
    isPopular: true,
    iconName: 'Landmark',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'compound-savings-calc',
    name: 'Compound Savings & Regular Deposit Calculator',
    shortDesc: 'Project long-term savings growth from initial lump sums and recurring monthly deposits',
    category: 'banking-savings',
    subcategoryId: 'savings-accumulation',
    tags: ['banking', 'savings', 'compound-interest', 'deposits', 'nest-egg', 'growth'],
    formula: 'Future Value = Principal Compounding + Ordinary Annuity Contribution',
    isPopular: true,
    iconName: 'PiggyBank',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },

  // Business Operations
  {
    id: 'ltv-cac-calc',
    name: 'Customer Lifetime Value (LTV) & CAC Calculator',
    shortDesc: 'Evaluate customer profitability by comparing lifetime value against customer acquisition cost',
    category: 'business-operations',
    subcategoryId: 'saas-unit-economics',
    tags: ['business', 'ltv', 'cac', 'saas', 'unit-economics', 'customer-value'],
    formula: 'LTV = (ARPU × Gross Margin) / Churn Rate, Ratio = LTV / CAC',
    isPopular: true,
    iconName: 'TrendingUp',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'turnover-rate-calc',
    name: 'Employee Turnover Rate & Cost Calculator',
    shortDesc: 'Calculate annual workforce turnover percentages and estimated employee replacement costs',
    category: 'business-operations',
    subcategoryId: 'human-resources',
    tags: ['business', 'hr', 'turnover-rate', 'retention', 'hiring-cost', 'employees'],
    formula: 'Turnover Rate = (Departures / Average Employees) × 100',
    isPopular: false,
    iconName: 'Users',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },

  // Logistics & Shipping
  {
    id: 'dimensional-weight-calc',
    name: 'Dimensional Weight & Billable Shipping Calculator',
    shortDesc: 'Compute carrier billable weight by comparing actual weight against volumetric dimensional weight',
    category: 'logistics-shipping',
    subcategoryId: 'freight-parcel',
    tags: ['logistics', 'shipping', 'dimensional-weight', 'billable-weight', 'freight', 'parcel'],
    formula: 'Dim Weight = (Length × Width × Height) / Divisor',
    isPopular: true,
    iconName: 'Box',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'freight-cost-calc',
    name: 'Shipping Zone & Freight Cost Estimator',
    shortDesc: 'Estimate base freight shipping rates based on weight, distance zone, and fuel surcharges',
    category: 'logistics-shipping',
    subcategoryId: 'freight-parcel',
    tags: ['logistics', 'freight-cost', 'shipping-zone', 'carrier-rate', 'fuel-surcharge'],
    formula: 'Cost = (Weight × Zone Rate) × (1 + Fuel Surcharge %)',
    isPopular: false,
    iconName: 'Truck',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },

  // Manufacturing & Inventory
  {
    id: 'eoq-calc',
    name: 'Economic Order Quantity (EOQ) Calculator',
    shortDesc: 'Determine optimal inventory order quantity that minimizes holding and ordering costs',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    tags: ['manufacturing', 'eoq', 'inventory', 'order-quantity', 'supply-chain'],
    formula: 'EOQ = √((2 × Demand × Ordering Cost) / Holding Cost)',
    isPopular: true,
    iconName: 'Layers',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'oee-calc',
    name: 'Manufacturing OEE (Overall Equipment Effectiveness)',
    shortDesc: 'Measure manufacturing productivity by evaluating Availability, Performance, and Quality',
    category: 'manufacturing-inventory',
    subcategoryId: 'plant-operations',
    tags: ['manufacturing', 'oee', 'equipment-effectiveness', 'availability', 'performance', 'quality'],
    formula: 'OEE = Availability × Performance × Quality',
    isPopular: true,
    iconName: 'Cpu',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'safety-stock-calc',
    name: 'Safety Stock & Reorder Point Calculator',
    shortDesc: 'Calculate safety stock buffer requirements and inventory reorder trigger points',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    tags: ['manufacturing', 'safety-stock', 'reorder-point', 'inventory', 'stockout'],
    formula: 'Reorder Point = (Avg Demand × Lead Time) + Safety Stock',
    isPopular: false,
    iconName: 'ShieldAlert',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'inventory-turnover-calc',
    name: 'Inventory Turnover & DSI Calculator',
    shortDesc: 'Measure inventory management efficiency, turnover ratio, and days sales of inventory',
    category: 'manufacturing-inventory',
    subcategoryId: 'inventory-management',
    tags: ['manufacturing', 'inventory-turnover', 'dsi', 'cogs', 'supply-chain'],
    formula: 'Turnover = COGS / Average Inventory, DSI = 365 / Turnover',
    isPopular: false,
    iconName: 'RefreshCw',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  }
];
