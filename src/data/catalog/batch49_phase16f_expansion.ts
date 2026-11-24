import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH49_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16f-sub-calc', categoryId: 'engineering', name: 'Phase 16F Spring Rate & Pneumatic Cylinder Calculators', slug: 'phase16f-spring-pneumatic-calculators', description: 'Mechanical spring rate, deflection, and pneumatic cylinder force air consumption calculators', sortOrder: 101 },
  { id: 'p16f-sub-conv', categoryId: 'converter', name: 'Phase 16F Thermal Diffusivity Converters', slug: 'phase16f-thermal-diffusivity-converters', description: 'Thermal diffusivity unit conversion utilities', sortOrder: 101 },
  { id: 'p16f-sub-check', categoryId: 'checkers', name: 'Phase 16F Drawing Revision Consistency Checkers', slug: 'phase16f-drawing-revision-checkers', description: 'Engineering drawing and revision metadata consistency checkers', sortOrder: 101 },
  { id: 'p16f-sub-gen', categoryId: 'generators', name: 'Phase 16F Tolerance Stack-Up Worksheet Generators', slug: 'phase16f-tolerance-stackup-generators', description: 'Tolerance stack-up analysis worksheet and accumulation generators', sortOrder: 101 },
  { id: 'p16f-sub-plan', categoryId: 'planners', name: 'Phase 16F CNC Machining Setup Schedulers', slug: 'phase16f-cnc-machining-schedulers', description: 'CNC machining setup and operation sequence planners', sortOrder: 101 },
  { id: 'p16f-sub-tools', categoryId: 'additional-tools', name: 'Phase 16F Engineering Matrix Operations Utilities', slug: 'phase16f-matrix-operations-utilities', description: 'Engineering matrix operations and linear algebra utilities', sortOrder: 101 },
  { id: 'p16f-sub-track', categoryId: 'trackers', name: 'Phase 16F Industrial Lubrication & Oil Trackers', slug: 'phase16f-lubrication-oil-trackers', description: 'Industrial lubrication activities and oil analysis record trackers', sortOrder: 101 },
  { id: 'p16f-sub-guides', categoryId: 'guides', name: 'Phase 16F Pneumatics, Hydraulics & Fits References', slug: 'phase16f-pneumatics-fits-references', description: 'Industrial pneumatics, hydraulics components and engineering fits & tolerances references', sortOrder: 101 }
];

export const BATCH49_METADATA: CalculatorMeta[] = [
  // 1. Mechanical Spring Rate & Deflection Calculator
  {
    id: 'mechanical-spring-rate-deflection-calculator',
    name: 'Mechanical Spring Rate & Deflection Calculator',
    shortDesc: 'Calculate helical compression spring rate, applied force, deflection, and wire shear stress',
    category: 'engineering',
    subcategoryId: 'p16f-sub-calc',
    tags: ['engineering', 'spring-rate', 'spring-deflection', 'helical-spring', 'mechanical', 'calculators'],
    formula: 'Spring Rate (k) = (G × d⁴) / (8 × D³ × n); Deflection (x) = F / k; Shear Stress (τ) = (8FD / πd³) · K_W',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 2. Pneumatic Cylinder Force & Air Consumption Calculator
  {
    id: 'pneumatic-cylinder-force-air-consumption-calculator',
    name: 'Pneumatic Cylinder Force & Air Consumption Calculator',
    shortDesc: 'Calculate pneumatic cylinder extension and retraction forces and estimate compressed air consumption per cycle',
    category: 'engineering',
    subcategoryId: 'p16f-sub-calc',
    tags: ['engineering', 'pneumatic-cylinder', 'air-consumption', 'actuator-force', 'pneumatics', 'calculators'],
    formula: 'Force (F) = Pressure × Piston Area × Efficiency; Air Consumption = Stroke Volume × (P_atm + P_gauge) / P_atm × Cycles',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 3. Thermal Diffusivity Unit Converter
  {
    id: 'thermal-diffusivity-unit-converter',
    name: 'Thermal Diffusivity Unit Converter',
    shortDesc: 'Convert thermal diffusivity between m²/s, mm²/s, cm²/s, ft²/s, and in²/s with precision control',
    category: 'converter',
    subcategoryId: 'p16f-sub-conv',
    tags: ['converter', 'thermal-diffusivity', 'heat-transfer', 'units', 'engineering', 'thermodynamics'],
    formula: 'Conversion between m²/s, mm²/s, cm²/s, ft²/s, and in²/s thermal diffusivity units',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Engineering Drawing Revision Consistency Checker
  {
    id: 'engineering-drawing-revision-consistency-checker',
    name: 'Engineering Drawing Revision Consistency Checker',
    shortDesc: 'Validate engineering drawing metadata, revision identifiers, dates, and change descriptions for consistency',
    category: 'checkers',
    subcategoryId: 'p16f-sub-check',
    tags: ['checkers', 'drawing-revision', 'consistency-checker', 'blueprint', 'metadata', 'validation'],
    formula: 'Drawing revision ID sequencing, date chronological order, and field completeness checks',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Tolerance Stack-Up Analysis Worksheet Generator
  {
    id: 'tolerance-stack-up-analysis-worksheet-generator',
    name: 'Tolerance Stack-Up Analysis Worksheet Generator',
    shortDesc: 'Generate structured linear tolerance stack-up analysis worksheets calculating worst-case and statistical RSS accumulation',
    category: 'generators',
    subcategoryId: 'p16f-sub-gen',
    tags: ['generators', 'tolerance-stackup', 'stackup-analysis', 'worst-case', 'rss', 'metrology'],
    formula: 'Worst-Case Stack = Σ(Tol_i); Statistical RSS Stack = √(Σ(Tol_i²))',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. CNC Machining Setup & Operation Planner
  {
    id: 'cnc-machining-setup-operation-planner',
    name: 'CNC Machining Setup & Operation Planner',
    shortDesc: 'Organize CNC machining setups, workholding, tooling, operation sequences, and inspection checkpoints',
    category: 'planners',
    subcategoryId: 'p16f-sub-plan',
    tags: ['planners', 'cnc-machining', 'setup-planner', 'milling', 'turning', 'manufacturing'],
    formula: 'CNC operation sequence scheduling and machining step dependencies',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Engineering Matrix Operations Utility
  {
    id: 'engineering-matrix-operations-utility',
    name: 'Engineering Matrix Operations Utility',
    shortDesc: 'Perform matrix addition, subtraction, multiplication, transpose, determinant, and inverse for engineering calculations',
    category: 'additional-tools',
    subcategoryId: 'p16f-sub-tools',
    tags: ['tools', 'matrix-operations', 'linear-algebra', 'determinant', 'inverse', 'math'],
    formula: 'Matrix arithmetic algorithms (addition, multiplication, Gauss-Jordan elimination for inverse/determinant)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Industrial Lubrication & Oil Analysis Tracker
  {
    id: 'industrial-lubrication-oil-analysis-tracker',
    name: 'Industrial Lubrication & Oil Analysis Tracker',
    shortDesc: 'Track industrial lubrication points, lubricant types, oil analysis measurements (viscosity, water, wear metals), and service schedules',
    category: 'trackers',
    subcategoryId: 'p16f-sub-track',
    tags: ['trackers', 'industrial-lubrication', 'oil-analysis', 'maintenance', 'lubricant', 'tracking'],
    formula: 'Lubrication service interval countdown and oil analysis wear trend logging',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Industrial Pneumatics & Hydraulics Components Reference
  {
    id: 'industrial-pneumatics-hydraulics-components-reference',
    name: 'Industrial Pneumatics & Hydraulics Components Reference',
    shortDesc: 'Reference guide covering hydraulic pumps, pneumatic cylinders, directional control valves, regulators, and accumulators',
    category: 'guides',
    subcategoryId: 'p16f-sub-guides',
    tags: ['guides', 'pneumatics', 'hydraulics', 'valves', 'actuators', 'reference'],
    formula: 'Fluid power component taxonomy, operating principles, and safety considerations',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Engineering Fits & Tolerances Reference
  {
    id: 'engineering-fits-tolerances-reference',
    name: 'Engineering Fits & Tolerances Reference',
    shortDesc: 'Reference guide covering clearance, transition, and interference fits, hole-basis and shaft-basis systems, and ISO tolerance zones',
    category: 'guides',
    subcategoryId: 'p16f-sub-guides',
    tags: ['guides', 'engineering-fits', 'tolerances', 'clearance-fit', 'interference-fit', 'reference'],
    formula: 'ISO 286 limit and fit definitions (Hole-basis and Shaft-basis fit classifications)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
