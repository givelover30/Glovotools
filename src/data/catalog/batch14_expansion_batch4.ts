import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH14_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  // Agriculture & Farming
  {
    id: 'crop-management',
    categoryId: 'agriculture-farming',
    name: 'Crop Yield & Harvest Management',
    slug: 'crop-management',
    description: 'Estimate total agricultural crop harvest output and gross market value',
    sortOrder: 1
  },
  {
    id: 'soil-nutrients',
    categoryId: 'agriculture-farming',
    name: 'Soil Nutrients & Fertilizer N-P-K',
    slug: 'soil-nutrients',
    description: 'Calculate required fertilizer weight to meet nitrogen, phosphorus, and potassium targets',
    sortOrder: 2
  },

  // Healthcare Operations
  {
    id: 'clinic-management',
    categoryId: 'healthcare-operations',
    name: 'Clinic Patient Throughput & Wait Times',
    slug: 'clinic-management',
    description: 'Model outpatient clinic queue wait times and provider capacity utilization',
    sortOrder: 1
  },
  {
    id: 'clinical-admin',
    categoryId: 'healthcare-operations',
    name: 'Clinical Administration & IV Drips',
    slug: 'clinical-admin',
    description: 'Calculate intravenous fluid infusion drop rates (gtt/min) and hourly volume delivery',
    sortOrder: 2
  },

  // Telecommunications & Internet
  {
    id: 'network-performance',
    categoryId: 'telecom-internet',
    name: 'Network Performance & Bandwidth',
    slug: 'network-performance',
    description: 'Calculate file download transfer times and theoretical maximum TCP network throughput',
    sortOrder: 1
  },

  // Personal Productivity & Planning
  {
    id: 'time-management',
    categoryId: 'personal-productivity',
    name: 'Time Management & Pomodoro Planning',
    slug: 'time-management',
    description: 'Plan focused work blocks, break intervals, and total task execution timelines',
    sortOrder: 1
  },
  {
    id: 'personal-wellness',
    categoryId: 'personal-productivity',
    name: 'Personal Wellness & Hydration',
    slug: 'personal-wellness',
    description: 'Calculate recommended daily water intake based on body weight and exercise activity',
    sortOrder: 2
  },
  {
    id: 'personal-finance',
    categoryId: 'personal-productivity',
    name: 'Personal Finance & Net Worth',
    slug: 'personal-finance',
    description: 'Compute total personal net worth by tallying liquid assets, investments, and debts',
    sortOrder: 3
  },
  {
    id: 'goal-tracking',
    categoryId: 'personal-productivity',
    name: 'Goal Tracking & Habit Streaks',
    slug: 'goal-tracking',
    description: 'Evaluate habit consistency success rates and projected annual goal completion',
    sortOrder: 4
  }
];

export const BATCH14_METADATA: CalculatorMeta[] = [
  // Agriculture & Farming
  {
    id: 'crop-yield-calc',
    name: 'Crop Yield & Harvest Estimator',
    shortDesc: 'Estimate total agricultural crop harvest output and gross market value from acreage',
    category: 'agriculture-farming',
    subcategoryId: 'crop-management',
    tags: ['agriculture', 'farming', 'crop-yield', 'harvest', 'bushels', 'acreage'],
    formula: 'Total Harvest = Acres × Yield/Acre, Value = Harvest × Price',
    isPopular: true,
    iconName: 'Sprout',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'fertilizer-npk-calc',
    name: 'Fertilizer N-P-K Application Calculator',
    shortDesc: 'Calculate required fertilizer weight to meet nitrogen, phosphorus, and potassium soil targets',
    category: 'agriculture-farming',
    subcategoryId: 'soil-nutrients',
    tags: ['agriculture', 'fertilizer', 'npk', 'soil-nutrients', 'nitrogen', 'phosphorus'],
    formula: 'Fertilizer Weight = (Target Need / Grade %) × Acres',
    isPopular: false,
    iconName: 'Salad',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },

  // Healthcare Operations
  {
    id: 'patient-wait-calc',
    name: 'Patient Wait Time & Facility Throughput',
    shortDesc: 'Model outpatient clinic queue wait times and provider capacity utilization',
    category: 'healthcare-operations',
    subcategoryId: 'clinic-management',
    tags: ['healthcare', 'patient-wait-time', 'clinic', 'throughput', 'queue-theory'],
    formula: 'Erlang-C Multi-Server Queue Approximation',
    isPopular: true,
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'iv-drip-calc',
    name: 'Medical IV Drip Rate & Infusion Calculator',
    shortDesc: 'Calculate intravenous fluid infusion drop rates in gtt/min and hourly volume delivery',
    category: 'healthcare-operations',
    subcategoryId: 'clinical-admin',
    tags: ['healthcare', 'iv-drip', 'infusion', 'nursing', 'pharmacology', 'gtt-min'],
    formula: 'Flow Rate (gtt/min) = (Volume in mL × Drop Factor) / Time in Minutes',
    isPopular: true,
    iconName: 'Syringe',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },

  // Telecommunications & Internet
  {
    id: 'download-time-calc',
    name: 'Data Download Transfer Time Calculator',
    shortDesc: 'Compute exact file download transfer duration across various internet connection speeds',
    category: 'telecom-internet',
    subcategoryId: 'network-performance',
    tags: ['telecom', 'download-time', 'bandwidth', 'internet-speed', 'file-transfer'],
    formula: 'Time (Seconds) = (File Size in Megabits) / Speed in Mbps',
    isPopular: true,
    iconName: 'Download',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'network-latency-calc',
    name: 'Network Latency & TCP Throughput Estimator',
    shortDesc: 'Estimate maximum theoretical TCP network throughput based on latency and window size',
    category: 'telecom-internet',
    subcategoryId: 'network-performance',
    tags: ['telecom', 'network-latency', 'tcp-throughput', 'bandwidth-delay', 'rtt'],
    formula: 'Max Throughput = TCP Window Size / Round Trip Time (RTT)',
    isPopular: false,
    iconName: 'Wifi',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // Personal Productivity & Planning
  {
    id: 'pomodoro-planner-calc',
    name: 'Time Management & Pomodoro Planner',
    shortDesc: 'Plan focused work blocks, break intervals, and total task execution timelines',
    category: 'personal-productivity',
    subcategoryId: 'time-management',
    tags: ['productivity', 'pomodoro', 'time-management', 'focus', 'task-planning'],
    formula: 'Sessions = Total Work Minutes / Session Length',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  },
  {
    id: 'hydration-calc',
    name: 'Daily Water Intake & Hydration Calculator',
    shortDesc: 'Recommend optimal daily water intake based on body weight, climate, and exercise duration',
    category: 'personal-productivity',
    subcategoryId: 'personal-wellness',
    tags: ['productivity', 'hydration', 'water-intake', 'wellness', 'health'],
    formula: 'Water (oz) = (Weight × 0.5) + (Exercise Minutes × 12)',
    isPopular: false,
    iconName: 'Droplets',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  },
  {
    id: 'net-worth-calc',
    name: 'Personal Net Worth & Asset Growth Planner',
    shortDesc: 'Compute total personal net worth by tallying liquid assets, investments, real estate, and debts',
    category: 'personal-productivity',
    subcategoryId: 'personal-finance',
    tags: ['productivity', 'net-worth', 'personal-finance', 'assets', 'liabilities'],
    formula: 'Net Worth = Total Assets - Total Liabilities',
    isPopular: true,
    iconName: 'Wallet',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  },
  {
    id: 'habit-streak-calc',
    name: 'Habit Streak Success & Goal Probability',
    shortDesc: 'Evaluate habit consistency success rates and projected annual goal completion',
    category: 'personal-productivity',
    subcategoryId: 'goal-tracking',
    tags: ['productivity', 'habit-tracker', 'streak', 'goals', 'consistency'],
    formula: 'Success Rate = (Successful Days / Days Tracked) × 100',
    isPopular: false,
    iconName: 'CheckCircle2',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  }
];
