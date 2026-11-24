import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH26_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'trackers-expansion-finance',
    categoryId: 'trackers',
    name: 'Financial & Bill Trackers',
    slug: 'financial-bill-trackers',
    description: 'Subscription management, bill due date alerts, and recurring expense tracking',
    sortOrder: 4
  },
  {
    id: 'trackers-expansion-assets',
    categoryId: 'trackers',
    name: 'Asset, Vehicle & Inventory Trackers',
    slug: 'asset-vehicle-trackers',
    description: 'Vehicle maintenance, fuel mileage efficiency, home inventory valuation, and warranty expiration logs',
    sortOrder: 5
  },
  {
    id: 'trackers-expansion-lifestyle',
    categoryId: 'trackers',
    name: 'Lifestyle, Pet & Time Trackers',
    slug: 'lifestyle-pet-time-trackers',
    description: 'Pet care schedules, plant watering logs, screen time monitoring, and personal activity time tracking',
    sortOrder: 6
  }
];

export const BATCH26_METADATA: CalculatorMeta[] = [
  {
    id: 'subscription-tracker',
    name: 'Subscription & Membership Tracker',
    shortDesc: 'Track recurring subscription services, monthly/yearly billing cycles, renewal dates, and aggregate monthly spending',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-finance',
    tags: ['trackers', 'subscription', 'membership', 'bills', 'recurring', 'finance'],
    formula: 'Monthly & Yearly Subscription Cost Aggregation',
    isPopular: true,
    iconName: 'CreditCard',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'bill-due-date-tracker',
    name: 'Bill Due Date & Payment Tracker',
    shortDesc: 'Monitor utility and service bill due dates, payment status checkboxes, and unpaid balances',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-finance',
    tags: ['trackers', 'bills', 'due-date', 'utilities', 'payments', 'debt'],
    formula: 'Unpaid vs Paid Bill Totals Summation',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'vehicle-maintenance-tracker',
    name: 'Vehicle Maintenance & Service Log',
    shortDesc: 'Record car oil changes, tire rotations, brake replacements, mileage milestones, and service expenses',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-assets',
    tags: ['trackers', 'vehicle', 'car', 'maintenance', 'service', 'mileage'],
    formula: 'Total Vehicle Service Cost Summation',
    isPopular: false,
    iconName: 'Car',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'fuel-mileage-tracker',
    name: 'Fuel Consumption & Mileage Efficiency Tracker',
    shortDesc: 'Calculate miles per gallon (MPG) fuel economy across fill-ups, total gallons pumped, and fuel expenses',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-assets',
    tags: ['trackers', 'fuel', 'mileage', 'mpg', 'gas', 'car'],
    formula: 'MPG = Total Miles Traveled / Total Gallons Consumed',
    isPopular: false,
    iconName: 'Fuel',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'home-inventory-tracker',
    name: 'Home Inventory & Valuations Tracker',
    shortDesc: 'Catalog valuable household items by room, quantities, unit values, and total replacement valuations',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-assets',
    tags: ['trackers', 'home', 'inventory', 'valuations', 'assets', 'insurance'],
    formula: 'Total Value = Sum(Item Quantity × Unit Value)',
    isPopular: false,
    iconName: 'Package',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'warranty-expiration-tracker',
    name: 'Warranty & Expiration Date Tracker',
    shortDesc: 'Track manufacturer warranty expiry dates for appliances, electronics, tools, and equipment',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-assets',
    tags: ['trackers', 'warranty', 'expiration', 'appliances', 'electronics', 'support'],
    formula: 'Warranty Coverage Expiry Monitoring',
    isPopular: false,
    iconName: 'ShieldAlert',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'pet-care-tracker',
    name: 'Pet Care & Vaccination Tracker',
    shortDesc: 'Manage pet medical schedules, vaccinations, flea treatments, grooming sessions, and care due dates',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-lifestyle',
    tags: ['trackers', 'pet', 'dog', 'cat', 'vet', 'vaccination'],
    formula: 'Pending Pet Care Task & Vaccination Reminders',
    isPopular: false,
    iconName: 'Heart',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'plant-growth-tracker',
    name: 'Plant Growth & Watering Schedule Tracker',
    shortDesc: 'Track indoor and outdoor houseplants, watering intervals, last watered dates, and health status',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-lifestyle',
    tags: ['trackers', 'plant', 'watering', 'garden', 'houseplants', 'growth'],
    formula: 'Watering Interval Countdown & Health Monitoring',
    isPopular: false,
    iconName: 'Sprout',
    iconColor: '#10B981',
    iconBg: '#ECFDF5'
  },
  {
    id: 'screen-time-tracker',
    name: 'Daily Screen Time & Device Usage Tracker',
    shortDesc: 'Log daily digital screen time across productivity, social media, entertainment, and gaming categories',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-lifestyle',
    tags: ['trackers', 'screen-time', 'digital', 'device', 'hours', 'productivity'],
    formula: 'Daily Category Hours Summation',
    isPopular: false,
    iconName: 'Smartphone',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  },
  {
    id: 'personal-time-tracker',
    name: 'Personal Time & Activity Log',
    shortDesc: 'Log hours spent across work, exercise, learning, and leisure activities with daily time totals',
    category: 'trackers',
    subcategoryId: 'trackers-expansion-lifestyle',
    tags: ['trackers', 'time', 'activity', 'log', 'work', 'learning'],
    formula: 'Total Logged Activity Hours Summation',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  }
];
