import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH44_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16a-sub-calc', categoryId: 'electrical', name: 'Phase 16A Three-Phase Power & Fluid Flow Calculators', slug: 'phase16a-electrical-fluid-calculators', description: 'Three-phase electrical power and Reynolds number fluid flow calculators', sortOrder: 96 },
  { id: 'p16a-sub-conv', categoryId: 'converter', name: 'Phase 16A Engineering Notation & SI Converters', slug: 'phase16a-engineering-notation-converters', description: 'Engineering notation and SI prefix scale conversion utilities', sortOrder: 96 },
  { id: 'p16a-sub-check', categoryId: 'checkers', name: 'Phase 16A G-Code Syntax & Structure Checkers', slug: 'phase16a-gcode-syntax-checkers', description: 'CNC G-code syntax inspection and command structure checkers', sortOrder: 96 },
  { id: 'p16a-sub-gen', categoryId: 'generators', name: 'Phase 16A Technical SVG Diagram Generators', slug: 'phase16a-technical-svg-generators', description: 'Technical SVG schematic and geometric diagram generators', sortOrder: 96 },
  { id: 'p16a-sub-plan', categoryId: 'planners', name: 'Phase 16A Laboratory Experiment & Test Planners', slug: 'phase16a-lab-experiment-planners', description: 'Laboratory experiment objectives, variables, and test planning tools', sortOrder: 96 },
  { id: 'p16a-sub-tools', categoryId: 'additional-tools', name: 'Phase 16A Significant Figures & Precision Utilities', slug: 'phase16a-significant-figures-utilities', description: 'Significant figures determination and measurement precision utilities', sortOrder: 96 },
  { id: 'p16a-sub-track', categoryId: 'trackers', name: 'Phase 16A Equipment Calibration & Inspection Trackers', slug: 'phase16a-equipment-calibration-trackers', description: 'Laboratory and manufacturing equipment calibration schedule trackers', sortOrder: 96 },
  { id: 'p16a-sub-guides', categoryId: 'guides', name: 'Phase 16A Materials Science & GD&T References', slug: 'phase16a-materials-gdt-references', description: 'Engineering materials properties and geometric dimensioning & tolerancing references', sortOrder: 96 }
];

export const BATCH44_METADATA: CalculatorMeta[] = [
  // 1. Three-Phase Electrical Power Calculator
  {
    id: 'three-phase-electrical-power-calculator',
    name: 'Three-Phase Electrical Power Calculator',
    shortDesc: 'Calculate real power (kW), apparent power (kVA), and reactive power (kVAR) for balanced three-phase systems',
    category: 'electrical',
    subcategoryId: 'p16a-sub-calc',
    tags: ['electrical', 'three-phase', 'power', 'voltage', 'current', 'power-factor', 'engineering'],
    formula: 'Real Power (kW) = √3 × V_line × I_line × Power Factor / 1000',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 2. Reynolds Number & Fluid Flow Regime Calculator
  {
    id: 'reynolds-number-flow-regime-calculator',
    name: 'Reynolds Number & Fluid Flow Regime Calculator',
    shortDesc: 'Calculate Reynolds number for internal and external pipe/plate flows and classify laminar, transitional, or turbulent regimes',
    category: 'engineering',
    subcategoryId: 'p16a-sub-calc',
    tags: ['engineering', 'fluid-mechanics', 'reynolds-number', 'flow-regime', 'laminar', 'turbulent', 'physics'],
    formula: 'Re = (ρ × v × D) / μ = (v × D) / ν',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 3. Engineering Notation & SI Prefix Converter
  {
    id: 'engineering-notation-si-prefix-converter',
    name: 'Engineering Notation & SI Prefix Converter',
    shortDesc: 'Convert numeric values between standard decimal, scientific notation, engineering notation (exponents in multiples of 3), and SI prefixes',
    category: 'converter',
    subcategoryId: 'p16a-sub-conv',
    tags: ['converter', 'engineering-notation', 'si-prefix', 'scientific-notation', 'math', 'units'],
    formula: 'Mantissa × 10^(3n) with SI prefixes (pico to tera)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. G-Code Syntax & Command Structure Checker
  {
    id: 'gcode-syntax-command-checker',
    name: 'G-Code Syntax & Command Structure Checker',
    shortDesc: 'Inspect CNC G-code program syntax, validate command structures (G/M codes), coordinates, and detect malformed lines',
    category: 'checkers',
    subcategoryId: 'p16a-sub-check',
    tags: ['checkers', 'gcode', 'cnc', 'syntax-checker', 'machining', 'manufacturing'],
    formula: 'Regular expression parsing of CNC command blocks (G, M, X, Y, Z, F, S codes)',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Technical SVG Diagram Generator
  {
    id: 'technical-svg-diagram-generator',
    name: 'Technical SVG Diagram Generator',
    shortDesc: 'Generate structured technical SVG diagrams, schematic boxes, arrows, dimension lines, and process blocks',
    category: 'generators',
    subcategoryId: 'p16a-sub-gen',
    tags: ['generators', 'technical-svg', 'diagram', 'schematic', 'svg-generator', 'graphics'],
    formula: 'SVG XML element interpolation with coordinate grid and geometry mapping',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Laboratory Experiment & Test Planning Tool
  {
    id: 'laboratory-experiment-test-planner',
    name: 'Laboratory Experiment & Test Planning Tool',
    shortDesc: 'Plan scientific experiments, define hypotheses, variables, controls, equipment, procedures, and safety protocols',
    category: 'planners',
    subcategoryId: 'p16a-sub-plan',
    tags: ['planners', 'laboratory', 'experiment', 'test-planner', 'science', 'research'],
    formula: 'Structured research protocol definition (Independent/Dependent variables, controls, steps, safety)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Significant Figures & Measurement Precision Utility
  {
    id: 'significant-figures-precision-utility',
    name: 'Significant Figures & Measurement Precision Utility',
    shortDesc: 'Count significant figures, apply rounding rules, and compute arithmetic precision for addition, subtraction, multiplication, and division',
    category: 'additional-tools',
    subcategoryId: 'p16a-sub-tools',
    tags: ['tools', 'significant-figures', 'precision', 'measurement', 'rounding', 'math'],
    formula: 'Significant figure counting rules and arithmetic propagation rules',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Equipment Calibration & Inspection Tracker
  {
    id: 'equipment-calibration-inspection-tracker',
    name: 'Equipment Calibration & Inspection Tracker',
    shortDesc: 'Track measuring instruments, calibration dates, inspection intervals, due dates, and calibration certificate references',
    category: 'trackers',
    subcategoryId: 'p16a-sub-track',
    tags: ['trackers', 'equipment-calibration', 'inspection', 'maintenance', 'qa', 'instruments'],
    formula: 'Days Until Due = Calibration Due Date - Current Date; Overdue status detection',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Engineering Materials Properties Reference
  {
    id: 'engineering-materials-properties-reference',
    name: 'Engineering Materials Properties Reference',
    shortDesc: 'Reference guide for density, tensile strength, yield strength, elasticity, hardness, and thermal properties across material families',
    category: 'guides',
    subcategoryId: 'p16a-sub-guides',
    tags: ['guides', 'materials-science', 'mechanical-properties', 'metals', 'polymers', 'reference'],
    formula: 'Material property definitions and standard engineering metric/imperial units',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Geometric Dimensioning & Tolerancing (GD&T) Reference
  {
    id: 'geometric-dimensioning-tolerancing-reference',
    name: 'Geometric Dimensioning & Tolerancing (GD&T) Reference',
    shortDesc: 'Reference guide covering ASME Y14.5 datums, feature control frames, form, orientation, location, and runout tolerances',
    category: 'guides',
    subcategoryId: 'p16a-sub-guides',
    tags: ['guides', 'gdt', 'geometric-tolerancing', 'engineering-drawing', 'asme', 'reference'],
    formula: 'ASME Y14.5 geometric characteristic symbols and feature control frame taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
