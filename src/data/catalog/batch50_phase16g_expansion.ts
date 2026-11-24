import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH50_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16g-sub-calc', categoryId: 'engineering', name: 'Phase 16G Column Buckling & Transformer', slug: 'phase16g-col-trans', description: 'Euler column buckling and transformer turns ratio calculators', sortOrder: 102 },
  { id: 'p16g-sub-conv', categoryId: 'converter', name: 'Phase 16G Thermal Resistance', slug: 'phase16g-therm-res', description: 'Thermal resistance unit conversion utilities', sortOrder: 102 },
  { id: 'p16g-sub-check', categoryId: 'checkers', name: 'Phase 16G FMEA Risk', slug: 'phase16g-fmea', description: 'Engineering FMEA risk assessment checkers', sortOrder: 102 },
  { id: 'p16g-sub-gen', categoryId: 'generators', name: 'Phase 16G Pneumatic Diagrams', slug: 'phase16g-pneum-diag', description: 'Pneumatic circuit symbol diagram generators', sortOrder: 102 },
  { id: 'p16g-sub-plan', categoryId: 'planners', name: 'Phase 16G Failure Investigation', slug: 'phase16g-fail-inv', description: 'Engineering failure investigation planners', sortOrder: 102 },
  { id: 'p16g-sub-tools', categoryId: 'additional-tools', name: 'Phase 16G Fourier Signal', slug: 'phase16g-fourier', description: 'Fourier series and signal decomposition utilities', sortOrder: 102 },
  { id: 'p16g-sub-track', categoryId: 'trackers', name: 'Phase 16G Machine Condition', slug: 'phase16g-mach-cond', description: 'Industrial machine condition monitoring trackers', sortOrder: 102 },
  { id: 'p16g-sub-guides', categoryId: 'guides', name: 'Phase 16G Heat Treatment & Surface', slug: 'phase16g-heat-surf', description: 'Industrial heat treatment and surface finish references', sortOrder: 102 }
];

export const BATCH50_METADATA: CalculatorMeta[] = [
  {
    id: 'euler-column-buckling-critical-load-calculator',
    name: 'Euler Column Buckling & Critical Load Calculator',
    shortDesc: 'Calculate Euler critical buckling load and critical stress for slender columns',
    category: 'engineering',
    subcategoryId: 'p16g-sub-calc',
    tags: ['engineering', 'euler-buckling', 'critical-load', 'column', 'structural'],
    formula: 'P_cr = (π²EI) / (KL)²',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'transformer-turns-ratio-secondary-voltage-calculator',
    name: 'Transformer Turns Ratio & Secondary Voltage Calculator',
    shortDesc: 'Calculate transformer turns ratio, secondary voltage, and current relationships',
    category: 'electrical',
    subcategoryId: 'p16g-sub-calc',
    tags: ['electrical', 'transformer', 'turns-ratio', 'voltage', 'power'],
    formula: 'a = N₁ / N₂ = V₁ / V₂',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'thermal-resistance-unit-converter',
    name: 'Thermal Resistance Unit Converter',
    shortDesc: 'Convert thermal resistance between K/W, °C/W, and imperial units',
    category: 'converter',
    subcategoryId: 'p16g-sub-conv',
    tags: ['converter', 'thermal-resistance', 'heat-transfer', 'units'],
    formula: 'K/W and °C/W conversions',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'engineering-fmea-risk-assessment-checker',
    name: 'Engineering FMEA Risk Assessment Checker',
    shortDesc: 'Validate FMEA records, check rating ranges, and compute Risk Priority Numbers (RPN)',
    category: 'checkers',
    subcategoryId: 'p16g-sub-check',
    tags: ['checkers', 'fmea', 'risk-assessment', 'rpn', 'quality'],
    formula: 'RPN = Severity × Occurrence × Detection',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'pneumatic-circuit-symbol-diagram-generator',
    name: 'Pneumatic Circuit Symbol Diagram Generator',
    shortDesc: 'Generate simplified pneumatic circuit diagrams and SVG symbol layouts',
    category: 'generators',
    subcategoryId: 'p16g-sub-gen',
    tags: ['generators', 'pneumatic-circuit', 'diagram', 'svg', 'schematic'],
    formula: 'SVG symbol layout interpolation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'engineering-failure-investigation-planner',
    name: 'Engineering Failure Investigation Planner',
    shortDesc: 'Organize engineering failure investigations, evidence collection, and corrective actions',
    category: 'planners',
    subcategoryId: 'p16g-sub-plan',
    tags: ['planners', 'failure-investigation', 'root-cause', 'incident'],
    formula: 'Investigation milestone scheduling',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'fourier-series-signal-decomposition-utility',
    name: 'Fourier Series & Signal Decomposition Utility',
    shortDesc: 'Perform discrete Fourier analysis, compute frequency components, and inspect spectra',
    category: 'additional-tools',
    subcategoryId: 'p16g-sub-tools',
    tags: ['tools', 'fourier-series', 'signal-decomposition', 'fft', 'spectrum'],
    formula: 'Discrete Fourier Transform (DFT)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'industrial-machine-condition-monitoring-tracker',
    name: 'Industrial Machine Condition Monitoring Tracker',
    shortDesc: 'Track machine condition observations, vibration readings, and temperature history',
    category: 'trackers',
    subcategoryId: 'p16g-sub-track',
    tags: ['trackers', 'condition-monitoring', 'vibration', 'temperature', 'maintenance'],
    formula: 'Vibration/temperature measurement logging',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'industrial-heat-treatment-processes-reference',
    name: 'Industrial Heat Treatment Processes Reference',
    shortDesc: 'Reference guide covering annealing, hardening, tempering, and quenching',
    category: 'guides',
    subcategoryId: 'p16g-sub-guides',
    tags: ['guides', 'heat-treatment', 'annealing', 'hardening', 'metallurgy'],
    formula: 'Heat treatment process stage taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'engineering-surface-finish-roughness-reference',
    name: 'Engineering Surface Finish & Roughness Reference',
    shortDesc: 'Reference guide for surface texture parameters (Ra, Rz) and measurement',
    category: 'guides',
    subcategoryId: 'p16g-sub-guides',
    tags: ['guides', 'surface-finish', 'roughness', 'ra-rz', 'metrology'],
    formula: 'Ra arithmetic average height, Rz maximum height',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
