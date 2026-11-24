import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH51_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16h-sub-calc', categoryId: 'engineering', name: 'Phase 16H Shaft Torsion & Battery Bank', slug: 'phase16h-torsion-battery', description: 'Shaft torsional stress, angle of twist, and battery bank capacity calculators', sortOrder: 103 },
  { id: 'p16h-sub-conv', categoryId: 'converter', name: 'Phase 16H Magnetic Flux Density', slug: 'phase16h-magnetic', description: 'Magnetic flux density unit conversion utilities', sortOrder: 103 },
  { id: 'p16h-sub-check', categoryId: 'checkers', name: 'Phase 16H Electrical Cable Consistency', slug: 'phase16h-cable-check', description: 'Electrical cable schedule consistency validation checkers', sortOrder: 103 },
  { id: 'p16h-sub-gen', categoryId: 'generators', name: 'Phase 16H Electrical Panel Schedule', slug: 'phase16h-panel-sched', description: 'Electrical panel circuit schedule and breaker layout generators', sortOrder: 103 },
  { id: 'p16h-sub-plan', categoryId: 'planners', name: 'Phase 16H Industrial Energy Audit', slug: 'phase16h-energy-audit', description: 'Industrial energy audit activity and opportunity planners', sortOrder: 103 },
  { id: 'p16h-sub-tools', categoryId: 'additional-tools', name: 'Phase 16H Boolean Logic & Truth Table', slug: 'phase16h-boolean-logic', description: 'Boolean expression evaluation and truth table generation utilities', sortOrder: 103 },
  { id: 'p16h-sub-track', categoryId: 'trackers', name: 'Phase 16H Industrial Spare Parts', slug: 'phase16h-spare-parts', description: 'Industrial spare parts inventory stock and reorder trackers', sortOrder: 103 },
  { id: 'p16h-sub-guides', categoryId: 'guides', name: 'Phase 16H Corrosion Protection & Bearings', slug: 'phase16h-corrosion-bearings', description: 'Industrial corrosion protection methods and bearing types selection references', sortOrder: 103 }
];

export const BATCH51_METADATA: CalculatorMeta[] = [
  {
    id: 'shaft-torsional-stress-angle-of-twist-calculator',
    name: 'Shaft Torsional Stress & Angle of Twist Calculator',
    shortDesc: 'Calculate torsional shear stress and angle of twist for solid and hollow shafts under applied torque',
    category: 'engineering',
    subcategoryId: 'p16h-sub-calc',
    tags: ['engineering', 'torsion', 'shear-stress', 'angle-of-twist', 'shaft', 'calculators'],
    formula: 'Shear Stress (τ) = (T × r) / J; Angle of Twist (θ) = (T × L) / (G × J)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'battery-bank-capacity-runtime-calculator',
    name: 'Battery Bank Capacity & Runtime Calculator',
    shortDesc: 'Calculate usable battery bank capacity, estimated runtime, depth of discharge, and DC load requirements',
    category: 'electrical',
    subcategoryId: 'p16h-sub-calc',
    tags: ['electrical', 'battery-bank', 'runtime', 'capacity', 'depth-of-discharge', 'calculators'],
    formula: 'Usable Ah = Total Capacity × (DoD / 100) × Efficiency; Runtime = Usable Ah / Load Amps',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'magnetic-flux-density-converter',
    name: 'Magnetic Flux Density Converter',
    shortDesc: 'Convert magnetic flux density between Tesla (T), Gauss (G), millitesla (mT), and other units',
    category: 'converter',
    subcategoryId: 'p16h-sub-conv',
    tags: ['converter', 'magnetic-flux', 'tesla', 'gauss', 'units', 'electromagnetism'],
    formula: '1 Tesla (T) = 10,000 Gauss (G)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'electrical-cable-schedule-consistency-checker',
    name: 'Electrical Cable Schedule Consistency Checker',
    shortDesc: 'Inspect electrical cable schedule data, validate sizing, length, voltage drop, and check for duplicate identifiers',
    category: 'checkers',
    subcategoryId: 'p16h-sub-check',
    tags: ['checkers', 'cable-schedule', 'electrical', 'voltage-drop', 'validation', 'wiring'],
    formula: 'Cable identifier uniqueness and sizing completeness rule validation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'electrical-panel-circuit-schedule-generator',
    name: 'Electrical Panel Circuit Schedule Generator',
    shortDesc: 'Generate structured electrical panel circuit schedules, breaker ratings, phase assignments, and load summaries',
    category: 'generators',
    subcategoryId: 'p16h-sub-gen',
    tags: ['generators', 'electrical-panel', 'circuit-schedule', 'breaker', 'distribution', 'wiring'],
    formula: 'Circuit schedule table layout with phase load balancing calculations',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'industrial-energy-audit-planner',
    name: 'Industrial Energy Audit Planner',
    shortDesc: 'Organize industrial energy audit activities, measurement locations, efficiency opportunities, and milestones',
    category: 'planners',
    subcategoryId: 'p16h-sub-plan',
    tags: ['planners', 'energy-audit', 'efficiency', 'industrial', 'sustainability', 'planning'],
    formula: 'Energy audit milestone scheduling and opportunity tracking',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'boolean-logic-truth-table-utility',
    name: 'Boolean Logic & Truth Table Utility',
    shortDesc: 'Evaluate Boolean logic expressions, build truth tables, and analyze logical operator combinations (AND, OR, NOT, XOR)',
    category: 'additional-tools',
    subcategoryId: 'p16h-sub-tools',
    tags: ['tools', 'boolean-logic', 'truth-table', 'logic-gates', 'binary', 'math'],
    formula: 'Truth table combinatorial evaluation (2^n rows for n variables)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'industrial-spare-parts-inventory-tracker',
    name: 'Industrial Spare Parts Inventory Tracker',
    shortDesc: 'Track industrial spare parts stock quantities, storage locations, reorder thresholds, and inventory movement history',
    category: 'trackers',
    subcategoryId: 'p16h-sub-track',
    tags: ['trackers', 'spare-parts', 'inventory', 'maintenance', 'stock', 'tracking'],
    formula: 'Reorder threshold alerts (Stock Quantity ≤ Min Threshold)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'industrial-corrosion-protection-methods-reference',
    name: 'Industrial Corrosion Protection Methods Reference',
    shortDesc: 'Reference guide covering corrosion protection methods, coatings, cathodic protection, and material selection',
    category: 'guides',
    subcategoryId: 'p16h-sub-guides',
    tags: ['guides', 'corrosion-protection', 'coatings', 'cathodic-protection', 'materials', 'reference'],
    formula: 'Corrosion prevention mechanism taxonomy (Barriers, Inhibitors, Cathodic protection)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'industrial-bearings-types-selection-reference',
    name: 'Industrial Bearings Types & Selection Reference',
    shortDesc: 'Reference guide covering rolling element bearing types, radial/thrust loads, lubrication, and selection considerations',
    category: 'guides',
    subcategoryId: 'p16h-sub-guides',
    tags: ['guides', 'bearings', 'ball-bearings', 'roller-bearings', 'mechanical', 'reference'],
    formula: 'Bearing load capacity and selection criteria taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
