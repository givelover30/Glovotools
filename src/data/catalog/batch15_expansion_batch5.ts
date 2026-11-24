import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH15_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Environmental & Sustainability
  {
    id: 'carbon-accounting',
    categoryId: 'environmental-sustainability',
    name: 'Carbon Accounting & Emissions',
    slug: 'carbon-accounting',
    description: 'Estimate annual household carbon footprint from electricity, gas, mileage, and flights',
    sortOrder: 1
  },
  {
    id: 'renewable-offset',
    categoryId: 'environmental-sustainability',
    name: 'Renewable Offset & Solar Savings',
    slug: 'renewable-offset',
    description: 'Calculate annual carbon dioxide emissions offset by rooftop solar photovoltaic generation',
    sortOrder: 2
  },

  // Food Service & Hospitality
  {
    id: 'menu-costing',
    categoryId: 'food-service',
    name: 'Menu Costing & Recipe Pricing',
    slug: 'menu-costing',
    description: 'Compute recipe ingredient costs, plate cost, food cost percentage, and menu prices',
    sortOrder: 1
  },
  {
    id: 'restaurant-operations',
    categoryId: 'food-service',
    name: 'Restaurant Operations & Table Turnover',
    slug: 'restaurant-operations',
    description: 'Calculate daily dining capacity, table turnover rate, and maximum guest volume',
    sortOrder: 2
  },

  // Aviation & Transportation
  {
    id: 'flight-navigation',
    categoryId: 'aviation-transport',
    name: 'Flight Navigation & Airspeed',
    slug: 'flight-navigation',
    description: 'Compute aircraft true airspeed, wind correction angles, and ground speed for flight planning',
    sortOrder: 1
  },
  {
    id: 'flight-planning',
    categoryId: 'aviation-transport',
    name: 'Aircraft Fuel Burn & Range Planning',
    slug: 'flight-planning',
    description: 'Calculate aviation fuel consumption, reserve requirements, and maximum flight range',
    sortOrder: 2
  },

  // Cybersecurity & Data Management
  {
    id: 'information-security',
    categoryId: 'cybersecurity-data',
    name: 'Information Security & Passwords',
    slug: 'information-security',
    description: 'Calculate password bit entropy and estimate brute-force cracking resistance time',
    sortOrder: 1
  },
  {
    id: 'cloud-infrastructure',
    categoryId: 'cybersecurity-data',
    name: 'Cloud Infrastructure & Storage Costs',
    slug: 'cloud-infrastructure',
    description: 'Compute cloud data migration transfer times and monthly cloud S3 storage costs',
    sortOrder: 2
  },
  {
    id: 'data-storage',
    categoryId: 'cybersecurity-data',
    name: 'Data Storage & RAID Fault Tolerance',
    slug: 'data-storage',
    description: 'Determine usable storage capacity and drive fault tolerance across RAID levels (0, 1, 5, 6, 10)',
    sortOrder: 3
  },
  {
    id: 'datacenter-efficiency',
    categoryId: 'cybersecurity-data',
    name: 'Data Center Efficiency & PUE',
    slug: 'datacenter-efficiency',
    description: 'Calculate data center Power Usage Effectiveness (PUE) and overhead energy efficiency',
    sortOrder: 4
  }
];

export const BATCH15_METADATA: CalculatorMeta[] = [
  // Environmental & Sustainability
  {
    id: 'carbon-footprint-calc',
    name: 'Carbon Footprint & CO₂ Emission Estimator',
    shortDesc: 'Estimate annual household carbon footprint from electricity usage, gas, mileage, and air travel',
    category: 'environmental-sustainability',
    subcategoryId: 'carbon-accounting',
    tags: ['environmental', 'carbon-footprint', 'co2-emissions', 'sustainability', 'epa'],
    formula: 'Sum of Consumption × EPA Greenhouse Gas Emission Factors',
    isPopular: true,
    iconName: 'Leaf',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'home-carbon-offset-calc',
    name: 'Home Solar Energy & Carbon Offset Calculator',
    shortDesc: 'Calculate annual carbon dioxide emissions offset by installing rooftop solar photovoltaic systems',
    category: 'environmental-sustainability',
    subcategoryId: 'renewable-offset',
    tags: ['environmental', 'carbon-offset', 'solar-energy', 'co2-reduction', 'clean-energy'],
    formula: 'Offset (Tons) = (Solar kWh × Emission Factor) / 2204.62',
    isPopular: false,
    iconName: 'Sun',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Food Service & Hospitality
  {
    id: 'recipe-cost-calc',
    name: 'Restaurant Recipe Cost & Pricing Calculator',
    shortDesc: 'Compute individual recipe ingredient costs, plate cost, food cost percentage, and menu price',
    category: 'food-service',
    subcategoryId: 'menu-costing',
    tags: ['hospitality', 'recipe-cost', 'menu-pricing', 'food-cost-percentage', 'restaurant'],
    formula: 'Menu Price = Total Plate Cost / (Target Food Cost % / 100)',
    isPopular: true,
    iconName: 'Utensils',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'table-turnover-calc',
    name: 'Restaurant Table Turnover & Seating Capacity',
    shortDesc: 'Calculate daily dining capacity, table turnover rate, and maximum guest volume',
    category: 'food-service',
    subcategoryId: 'restaurant-operations',
    tags: ['hospitality', 'table-turnover', 'restaurant-capacity', 'seating', 'dining'],
    formula: 'Capacity = Seats × (Operating Minutes / Meal Duration)',
    isPopular: false,
    iconName: 'Armchair',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },

  // Aviation & Transportation
  {
    id: 'flight-airspeed-calc',
    name: 'Flight Ground Speed & Airspeed Calculator',
    shortDesc: 'Compute aircraft true airspeed, wind correction angles, and ground speed for flight planning',
    category: 'aviation-transport',
    subcategoryId: 'flight-navigation',
    tags: ['aviation', 'ground-speed', 'true-airspeed', 'wind-correction', 'flight-planning'],
    formula: 'Standard Aviation Atmospheric & Vector Navigation Equations',
    isPopular: true,
    iconName: 'Plane',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'flight-fuel-calc',
    name: 'Aircraft Fuel Burn & Flight Range Estimator',
    shortDesc: 'Calculate aviation fuel consumption, reserve fuel requirements, and maximum flight range',
    category: 'aviation-transport',
    subcategoryId: 'flight-planning',
    tags: ['aviation', 'fuel-burn', 'flight-range', 'aircraft-fuel', 'aviation-planning'],
    formula: 'Range = (Usable Fuel / Burn Rate) × Cruising Speed',
    isPopular: false,
    iconName: 'Fuel',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // Cybersecurity & Data Management
  {
    id: 'password-entropy-calc',
    name: 'Password Entropy & Crack Time Estimator',
    shortDesc: 'Calculate password bit entropy and estimate brute-force cracking resistance time',
    category: 'cybersecurity-data',
    subcategoryId: 'information-security',
    tags: ['cybersecurity', 'password-entropy', 'crack-time', 'security', 'brute-force'],
    formula: 'Entropy = Length × log₂(Charset Size)',
    isPopular: true,
    iconName: 'KeyRound',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'cloud-storage-transfer-calc',
    name: 'Cloud Storage Transfer Time & Cost Calculator',
    shortDesc: 'Compute cloud data migration transfer times and monthly cloud S3 storage costs',
    category: 'cybersecurity-data',
    subcategoryId: 'cloud-infrastructure',
    tags: ['cybersecurity', 'cloud-storage', 'data-transfer', 's3-cost', 'migration'],
    formula: 'Transfer Time = Data Size / Bandwidth Speed, Cost = GB × Price',
    isPopular: false,
    iconName: 'Cloud',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'raid-capacity-calc',
    name: 'RAID Storage Capacity & Fault Tolerance',
    shortDesc: 'Determine usable storage capacity and drive fault tolerance across RAID levels (0, 1, 5, 6, 10)',
    category: 'cybersecurity-data',
    subcategoryId: 'data-storage',
    tags: ['cybersecurity', 'raid-capacity', 'fault-tolerance', 'storage-array', 'hard-drives'],
    formula: 'Usable Capacity Formulas per RAID Standard (0, 1, 5, 6, 10)',
    isPopular: true,
    iconName: 'HardDrive',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'pue-calc',
    name: 'Data Center PUE (Power Usage Effectiveness)',
    shortDesc: 'Calculate data center Power Usage Effectiveness (PUE) and overhead energy efficiency',
    category: 'cybersecurity-data',
    subcategoryId: 'datacenter-efficiency',
    tags: ['cybersecurity', 'pue', 'datacenter-efficiency', 'power-usage', 'energy-audit'],
    formula: 'PUE = Total Facility Energy / IT Equipment Energy',
    isPopular: false,
    iconName: 'Server',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  }
];
