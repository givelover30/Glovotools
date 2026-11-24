import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH48_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16e-sub-calc', categoryId: 'engineering', name: 'Phase 16E Gear Train & DC Cable Loss Calculators', slug: 'phase16e-gear-dc-calculators', description: 'Gear train ratio, output speed, and DC cable voltage drop power loss calculators', sortOrder: 100 },
  { id: 'p16e-sub-conv', categoryId: 'converter', name: 'Phase 16E Specific Heat Capacity Converters', slug: 'phase16e-specific-heat-converters', description: 'Specific heat capacity unit conversion utilities', sortOrder: 100 },
  { id: 'p16e-sub-check', categoryId: 'checkers', name: 'Phase 16E Mechanical Fastener Consistency Checkers', slug: 'phase16e-fastener-consistency-checkers', description: 'Mechanical fastener specification consistency and standards checkers', sortOrder: 100 },
  { id: 'p16e-sub-gen', categoryId: 'generators', name: 'Phase 16E Mechanical Fastener Sheet Generators', slug: 'phase16e-fastener-sheet-generators', description: 'Mechanical fastener specification sheet and documentation generators', sortOrder: 100 },
  { id: 'p16e-sub-plan', categoryId: 'planners', name: 'Phase 16E Engineering Prototype Build Planners', slug: 'phase16e-prototype-build-planners', description: 'Engineering prototype build tasks, materials, and validation planners', sortOrder: 100 },
  { id: 'p16e-sub-tools', categoryId: 'additional-tools', name: 'Phase 16E Engineering Curve Fit & Regression Utilities', slug: 'phase16e-curve-fit-regression-utilities', description: 'Engineering curve fitting and linear regression analysis utilities', sortOrder: 100 },
  { id: 'p16e-sub-track', categoryId: 'trackers', name: 'Phase 16E Tooling & Fixture Usage Trackers', slug: 'phase16e-tooling-fixture-trackers', description: 'Industrial tooling, jigs, fixtures, and production accessory service trackers', sortOrder: 100 },
  { id: 'p16e-sub-guides', categoryId: 'guides', name: 'Phase 16E Fasteners & Industrial Sensors References', slug: 'phase16e-fasteners-sensors-references', description: 'Industrial fasteners grades standards and industrial sensors instrumentation references', sortOrder: 100 }
];

export const BATCH48_METADATA: CalculatorMeta[] = [
  // 1. Gear Train Ratio & Output Speed Calculator
  {
    id: 'gear-train-ratio-output-speed-calculator',
    name: 'Gear Train Ratio & Output Speed Calculator',
    shortDesc: 'Calculate gear ratios, output rotational speeds, and rotation direction for simple and compound gear trains',
    category: 'engineering',
    subcategoryId: 'p16e-sub-calc',
    tags: ['engineering', 'gear-train', 'gear-ratio', 'output-speed', 'mechanical', 'calculators'],
    formula: 'Gear Ratio (i) = N_driven / N_driver = T_driven / T_driver; Output RPM = Input RPM / Ratio',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 2. DC Cable Voltage Drop & Power Loss Calculator
  {
    id: 'dc-cable-voltage-drop-power-loss-calculator',
    name: 'DC Cable Voltage Drop & Power Loss Calculator',
    shortDesc: 'Calculate direct current (DC) cable voltage drop, percentage voltage drop, and resistive power loss for copper and aluminum conductors',
    category: 'engineering',
    subcategoryId: 'p16e-sub-calc',
    tags: ['engineering', 'dc-cable', 'voltage-drop', 'power-loss', 'electrical', 'calculators'],
    formula: 'Voltage Drop (V_drop) = (2 × L × I × ρ) / A; Power Loss = I² × R_cable',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 3. Specific Heat Capacity Unit Converter
  {
    id: 'specific-heat-capacity-unit-converter',
    name: 'Specific Heat Capacity Unit Converter',
    shortDesc: 'Convert specific heat capacity between J/(kg·K), J/(kg·°C), kJ/(kg·K), cal/(g·°C), and Btu/(lb·°F)',
    category: 'converter',
    subcategoryId: 'p16e-sub-conv',
    tags: ['converter', 'specific-heat', 'heat-capacity', 'thermodynamics', 'units', 'engineering'],
    formula: 'Conversion factors across SI, metric, and imperial thermal capacity units',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Mechanical Fastener Specification Consistency Checker
  {
    id: 'mechanical-fastener-specification-consistency-checker',
    name: 'Mechanical Fastener Specification Consistency Checker',
    shortDesc: 'Check internal consistency, thread pitch, diameter, material grade, and standard compliance for mechanical fastener specifications',
    category: 'checkers',
    subcategoryId: 'p16e-sub-check',
    tags: ['checkers', 'fastener-specification', 'mechanical', 'consistency', 'bolts', 'validation'],
    formula: 'Fastener dimension and property class standards validation rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Mechanical Fastener Specification Sheet Generator
  {
    id: 'mechanical-fastener-specification-sheet-generator',
    name: 'Mechanical Fastener Specification Sheet Generator',
    shortDesc: 'Generate structured technical specification sheets and documentation for mechanical fasteners, threads, grades, and finishes',
    category: 'generators',
    subcategoryId: 'p16e-sub-gen',
    tags: ['generators', 'fastener-specification-sheet', 'mechanical', 'documentation', 'specification', 'pdf-export'],
    formula: 'Structured technical documentation layout for fastener specifications',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Engineering Prototype Build & Validation Planner
  {
    id: 'engineering-prototype-build-validation-planner',
    name: 'Engineering Prototype Build & Validation Planner',
    shortDesc: 'Plan engineering prototype development, component sourcing, build tasks, dependencies, validation tests, and acceptance criteria',
    category: 'planners',
    subcategoryId: 'p16e-sub-plan',
    tags: ['planners', 'prototype-build', 'validation-planner', 'engineering', 'project', 'planning'],
    formula: 'Prototype development milestone schedule and validation task dependency tracking',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Engineering Curve Fit & Regression Utility
  {
    id: 'engineering-curve-fit-regression-utility',
    name: 'Engineering Curve Fit & Regression Utility',
    shortDesc: 'Perform linear regression analysis, calculate slope, intercept, coefficient of determination (R²), and residual errors for engineering datasets',
    category: 'additional-tools',
    subcategoryId: 'p16e-sub-tools',
    tags: ['tools', 'curve-fit', 'linear-regression', 'r-squared', 'residuals', 'data-analysis'],
    formula: 'Least squares linear regression: y = mx + b with R² coefficient of determination',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Tooling & Fixture Usage and Service Tracker
  {
    id: 'tooling-fixture-usage-service-tracker',
    name: 'Tooling & Fixture Usage and Service Tracker',
    shortDesc: 'Track industrial tooling, jigs, fixtures, operational cycle counts, condition, and service maintenance history',
    category: 'trackers',
    subcategoryId: 'p16e-sub-track',
    tags: ['trackers', 'tooling-fixture', 'service-tracker', 'manufacturing', 'maintenance', 'tracking'],
    formula: 'Operating cycle count tracking and scheduled tooling service intervals',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Industrial Fasteners, Grades & Standards Reference
  {
    id: 'industrial-fasteners-grades-standards-reference',
    name: 'Industrial Fasteners, Grades & Standards Reference',
    shortDesc: 'Reference guide covering bolts, screws, nuts, washers, thread types, metric/imperial systems, and property classes',
    category: 'guides',
    subcategoryId: 'p16e-sub-guides',
    tags: ['guides', 'industrial-fasteners', 'grades-standards', 'metric-imperial', 'hardware', 'reference'],
    formula: 'Fastener standard classification taxonomy (ISO, DIN, ASME/ANSI property classes)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Industrial Sensors & Instrumentation Reference
  {
    id: 'industrial-sensors-instrumentation-reference',
    name: 'Industrial Sensors & Instrumentation Reference',
    shortDesc: 'Reference guide for temperature sensors, pressure transmitters, flow meters, level sensors, load cells, and 4-20mA/0-10V signals',
    category: 'guides',
    subcategoryId: 'p16e-sub-guides',
    tags: ['guides', 'industrial-sensors', 'instrumentation', '4-20ma', 'transmitters', 'reference'],
    formula: 'Industrial instrumentation signal standards (4-20 mA current loop, 0-10 V voltage signals)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
