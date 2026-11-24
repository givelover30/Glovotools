import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH52_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16i-sub-calc', categoryId: 'engineering', name: 'Phase 16I Belt Drive & RC/RL Circuit', slug: 'phase16i-belt-rcrl', description: 'Belt drive speed, length, and RC/RL circuit time constant calculators', sortOrder: 104 },
  { id: 'p16i-sub-conv', categoryId: 'converter', name: 'Phase 16I Electric Charge', slug: 'phase16i-charge-conv', description: 'Electric charge unit conversion utilities', sortOrder: 104 },
  { id: 'p16i-sub-check', categoryId: 'checkers', name: 'Phase 16I Data Acquisition Configuration', slug: 'phase16i-daq-check', description: 'Industrial data acquisition configuration validation checkers', sortOrder: 104 },
  { id: 'p16i-sub-gen', categoryId: 'generators', name: 'Phase 16I Laboratory Test Procedure', slug: 'phase16i-test-proc-gen', description: 'Structured laboratory test procedure generators', sortOrder: 104 },
  { id: 'p16i-sub-plan', categoryId: 'planners', name: 'Phase 16I Production Line Balancing', slug: 'phase16i-line-balance', description: 'Production line balancing and workstation planners', sortOrder: 104 },
  { id: 'p16i-sub-tools', categoryId: 'additional-tools', name: 'Phase 16I Numerical Differentiation & Integration', slug: 'phase16i-num-calc', description: 'Numerical differentiation and integration utilities', sortOrder: 104 },
  { id: 'p16i-sub-track', categoryId: 'trackers', name: 'Phase 16I Industrial Energy Consumption', slug: 'phase16i-energy-track', description: 'Industrial energy consumption and historical trend trackers', sortOrder: 104 },
  { id: 'p16i-sub-guides', categoryId: 'guides', name: 'Phase 16I Grounding & Thermal Insulation', slug: 'phase16i-ground-insul', description: 'Industrial electrical grounding, bonding, and thermal insulation references', sortOrder: 104 }
];

export const BATCH52_METADATA: CalculatorMeta[] = [
  {
    id: 'belt-drive-speed-length-calculator',
    name: 'Belt Drive Speed & Length Calculator',
    shortDesc: 'Calculate belt speed, pulley RPM ratios, center distance, and required belt length for drive systems',
    category: 'engineering',
    subcategoryId: 'p16i-sub-calc',
    tags: ['engineering', 'belt-drive', 'pulley-ratio', 'belt-length', 'mechanical', 'calculators'],
    formula: 'Belt Speed (v) = (π × D × RPM) / 60; Length (L) = 2C + 1.57(D₁ + D₂) + (D₂ - D₁)² / (4C)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'rc-rl-circuit-time-constant-calculator',
    name: 'RC/RL Circuit Time Constant Calculator',
    shortDesc: 'Calculate time constants (τ = RC or L/R), transient charging/discharging voltage, and current curves for RC and RL circuits',
    category: 'engineering',
    subcategoryId: 'p16i-sub-calc',
    tags: ['electrical', 'rc-circuit', 'rl-circuit', 'time-constant', 'transient', 'calculators'],
    formula: 'RC Time Constant (τ) = R × C; RL Time Constant (τ) = L / R',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'electric-charge-unit-converter',
    name: 'Electric Charge Unit Converter',
    shortDesc: 'Convert electric charge between Coulombs (C), Ampere-hours (Ah), milliampere-hours (mAh), and elementary charges',
    category: 'converter',
    subcategoryId: 'p16i-sub-conv',
    tags: ['converter', 'electric-charge', 'coulombs', 'ampere-hours', 'units', 'electricity'],
    formula: '1 Ampere-hour (Ah) = 3,600 Coulombs (C)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'industrial-data-acquisition-configuration-checker',
    name: 'Industrial Data Acquisition Configuration Checker',
    shortDesc: 'Validate industrial DAQ channel configurations, sensor types, measurement ranges, sampling rates, and missing fields',
    category: 'checkers',
    subcategoryId: 'p16i-sub-check',
    tags: ['checkers', 'daq', 'data-acquisition', 'sensors', 'instrumentation', 'validation'],
    formula: 'DAQ channel parameter completeness and sampling rate range rule verification',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'laboratory-test-procedure-generator',
    name: 'Laboratory Test Procedure Generator',
    shortDesc: 'Generate structured laboratory test procedures with objectives, equipment, step sequences, safety notes, and acceptance criteria',
    category: 'generators',
    subcategoryId: 'p16i-sub-gen',
    tags: ['generators', 'test-procedure', 'laboratory', 'documentation', 'protocol', 'qa'],
    formula: 'Structured laboratory testing procedure document template formatting',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'production-line-balancing-planner',
    name: 'Production Line Balancing Planner',
    shortDesc: 'Organize workstations, task durations, cycle time targets, precedence constraints, and workload distribution',
    category: 'planners',
    subcategoryId: 'p16i-sub-plan',
    tags: ['planners', 'line-balancing', 'workstations', 'assembly-line', 'manufacturing', 'planning'],
    formula: 'Line Efficiency = Sum(Task Times) / (Workstations × Cycle Time) × 100%',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'numerical-differentiation-integration-utility',
    name: 'Numerical Differentiation & Integration Utility',
    shortDesc: 'Perform numerical differentiation using finite differences and numerical integration using the trapezoidal rule',
    category: 'additional-tools',
    subcategoryId: 'p16i-sub-tools',
    tags: ['tools', 'numerical-differentiation', 'trapezoidal-integration', 'calculus', 'math', 'utility'],
    formula: 'Trapezoidal Rule: ∫f(x)dx ≈ (Δx/2) * [y₀ + 2(y₁ + y₂ + ... + yₙ₋₁) + yₙ]',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'industrial-energy-consumption-tracker',
    name: 'Industrial Energy Consumption Tracker',
    shortDesc: 'Track industrial energy consumption readings, equipment identifiers, dates, kWh usage, and historical cost trends',
    category: 'trackers',
    subcategoryId: 'p16i-sub-track',
    tags: ['trackers', 'energy-consumption', 'kwh', 'utility', 'sustainability', 'tracking'],
    formula: 'Total Energy Cost = kWh Consumption × Tariff Rate',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'industrial-electrical-grounding-bonding-reference',
    name: 'Industrial Electrical Grounding & Bonding Reference',
    shortDesc: 'Reference guide covering electrical grounding, bonding, conductors, electrodes, system components, and safety',
    category: 'guides',
    subcategoryId: 'p16i-sub-guides',
    tags: ['guides', 'electrical-grounding', 'bonding', 'safety', 'nec', 'reference'],
    formula: 'Grounding and bonding system architecture and safety taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'industrial-thermal-insulation-materials-reference',
    name: 'Industrial Thermal Insulation Materials Reference',
    shortDesc: 'Reference guide comparing industrial insulation materials, thermal conductivity, temperature limits, and selection criteria',
    category: 'guides',
    subcategoryId: 'p16i-sub-guides',
    tags: ['guides', 'thermal-insulation', 'heat-loss', 'materials', 'energy-efficiency', 'reference'],
    formula: 'Thermal resistance (R-value) and thermal conductivity (k-value) material comparison',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
