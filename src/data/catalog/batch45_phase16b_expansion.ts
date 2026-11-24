import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH45_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16b-sub-calc', categoryId: 'engineering', name: 'Phase 16B Beam Deflection & Thermal Expansion Calculators', slug: 'phase16b-beam-thermal-calculators', description: 'Beam bending stress, deflection, and thermal material expansion calculators', sortOrder: 97 },
  { id: 'p16b-sub-conv', categoryId: 'converter', name: 'Phase 16B Torque & Rotational Speed Converters', slug: 'phase16b-torque-speed-converters', description: 'Torque and rotational speed unit conversion utilities', sortOrder: 97 },
  { id: 'p16b-sub-check', categoryId: 'checkers', name: 'Phase 16B Resistor Color Code & Tolerance Checkers', slug: 'phase16b-resistor-code-checkers', description: 'Electronic component resistor color code band decoding and tolerance checkers', sortOrder: 97 },
  { id: 'p16b-sub-gen', categoryId: 'generators', name: 'Phase 16B Parametric Mechanical Part Generators', slug: 'phase16b-parametric-part-generators', description: 'Parametric mechanical component dimension and SVG drawing generators', sortOrder: 97 },
  { id: 'p16b-sub-plan', categoryId: 'planners', name: 'Phase 16B Engineering Design Review Planners', slug: 'phase16b-design-review-planners', description: 'Engineering design review projects, requirements, and verification planners', sortOrder: 97 },
  { id: 'p16b-sub-tools', categoryId: 'additional-tools', name: 'Phase 16B Engineering Dimensional Analysis Utilities', slug: 'phase16b-dimensional-analysis-utilities', description: 'Physical dimension inspection and unit consistency checking utilities', sortOrder: 97 },
  { id: 'p16b-sub-track', categoryId: 'trackers', name: 'Phase 16B Laboratory Sample & Specimen Trackers', slug: 'phase16b-sample-specimen-trackers', description: 'Laboratory sample unique identifiers, storage, and handling trackers', sortOrder: 97 },
  { id: 'p16b-sub-guides', categoryId: 'guides', name: 'Phase 16B Electrical Circuits & Fluid Mechanics References', slug: 'phase16b-circuits-fluid-references', description: 'Electrical circuit components symbols and fluid mechanics equation reference guides', sortOrder: 97 }
];

export const BATCH45_METADATA: CalculatorMeta[] = [
  // 1. Beam Deflection & Bending Stress Calculator
  {
    id: 'beam-deflection-bending-stress-calculator',
    name: 'Beam Deflection & Bending Stress Calculator',
    shortDesc: 'Calculate maximum bending moment, bending stress, and deflection for simply supported and cantilever beams under point and distributed loads',
    category: 'engineering',
    subcategoryId: 'p16b-sub-calc',
    tags: ['engineering', 'beam-deflection', 'bending-stress', 'mechanics', 'structural', 'calculators'],
    formula: 'Max Deflection (Cantilever Point Load) = PL³ / (3EI); Max Bending Stress = (M × c) / I',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 2. Thermal Expansion & Material Growth Calculator
  {
    id: 'thermal-expansion-material-growth-calculator',
    name: 'Thermal Expansion & Material Growth Calculator',
    shortDesc: 'Calculate linear thermal expansion, dimensional growth, and final length across configurable temperature changes and material coefficients',
    category: 'engineering',
    subcategoryId: 'p16b-sub-calc',
    tags: ['engineering', 'thermal-expansion', 'material-growth', 'temperature', 'physics', 'calculators'],
    formula: 'ΔL = L₀ × α × ΔT; Final Length = L₀ + ΔL',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 3. Torque & Rotational Speed Unit Converter
  {
    id: 'torque-rotational-speed-converter',
    name: 'Torque & Rotational Speed Unit Converter',
    shortDesc: 'Convert torque between N·m, lbf·ft, lbf·in, rotational speed between RPM and rad/s, and compute mechanical power',
    category: 'converter',
    subcategoryId: 'p16b-sub-conv',
    tags: ['converter', 'torque', 'rotational-speed', 'rpm', 'power', 'mechanical'],
    formula: 'Power (Watts) = Torque (N·m) × Angular Velocity (rad/s)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. Electrical Resistor Color Code & Tolerance Checker
  {
    id: 'resistor-color-code-tolerance-checker',
    name: 'Electrical Resistor Color Code & Tolerance Checker',
    shortDesc: 'Decode 4-band, 5-band, and 6-band electrical resistor color codes into resistance values, tolerance percentages, and temperature coefficients',
    category: 'checkers',
    subcategoryId: 'p16b-sub-check',
    tags: ['checkers', 'resistor-color-code', 'electronics', 'tolerance', 'resistance', 'components'],
    formula: 'Resistance = (Digit₁ Digit₂ [Digit₃]) × 10^(Multiplier) ± Tolerance %',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Parametric Mechanical Part Dimension Generator
  {
    id: 'parametric-mechanical-part-dimension-generator',
    name: 'Parametric Mechanical Part Dimension Generator',
    shortDesc: 'Generate parametric dimensions and technical SVG previews for simple mechanical components (shafts, plates, cylinders, blocks)',
    category: 'generators',
    subcategoryId: 'p16b-sub-gen',
    tags: ['generators', 'parametric-part', 'mechanical', 'dimensions', 'svg', 'cad'],
    formula: 'Parametric coordinate mapping and technical dimension line generation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Engineering Design Review & Verification Planner
  {
    id: 'engineering-design-review-planner',
    name: 'Engineering Design Review & Verification Planner',
    shortDesc: 'Create engineering design review projects, record design requirements, verification criteria, issues, and approval statuses',
    category: 'planners',
    subcategoryId: 'p16b-sub-plan',
    tags: ['planners', 'design-review', 'verification', 'engineering', 'project-management', 'planning'],
    formula: 'Requirement verification tracking matrix (Pass / Fail / Pending / N/A)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Engineering Unit Dimensional Analysis Utility
  {
    id: 'engineering-dimensional-analysis-utility',
    name: 'Engineering Unit Dimensional Analysis Utility',
    shortDesc: 'Inspect fundamental dimensions (mass, length, time, temperature, current) and verify dimensional consistency in equations',
    category: 'additional-tools',
    subcategoryId: 'p16b-sub-tools',
    tags: ['tools', 'dimensional-analysis', 'units', 'physics', 'consistency', 'engineering'],
    formula: 'Dimensional vector analysis [M^a L^b T^c Θ^d I^e]',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Laboratory Sample & Specimen Tracking Tool
  {
    id: 'laboratory-sample-specimen-tracker',
    name: 'Laboratory Sample & Specimen Tracking Tool',
    shortDesc: 'Track laboratory samples with unique IDs, types, collection dates, storage locations, status history, and handling notes',
    category: 'trackers',
    subcategoryId: 'p16b-sub-track',
    tags: ['trackers', 'sample-tracker', 'specimen', 'laboratory', 'tracking', 'research'],
    formula: 'Sample lifecycle tracking (Collected -> Processing -> Stored -> Tested -> Archived)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Electrical Circuit Components & Symbols Reference
  {
    id: 'electrical-circuit-components-symbols-reference',
    name: 'Electrical Circuit Components & Symbols Reference',
    shortDesc: 'Reference guide for electrical and electronic schematic symbols, component functions, resistors, capacitors, transistors, and sources',
    category: 'guides',
    subcategoryId: 'p16b-sub-guides',
    tags: ['guides', 'electrical-components', 'schematic-symbols', 'electronics', 'circuit', 'reference'],
    formula: 'ANSI/IEEE and IEC electrical schematic symbol standard definitions',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Fluid Mechanics Equations & Applications Reference
  {
    id: 'fluid-mechanics-equations-applications-reference',
    name: 'Fluid Mechanics Equations & Applications Reference',
    shortDesc: 'Reference guide covering continuity equation, Bernoulli principle, hydrostatic pressure, flow rate, and real fluid boundary conditions',
    category: 'guides',
    subcategoryId: 'p16b-sub-guides',
    tags: ['guides', 'fluid-mechanics', 'bernoulli', 'continuity-equation', 'hydraulics', 'reference'],
    formula: 'Bernoulli Equation: P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
