import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH53_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16j-sub-calc', categoryId: 'engineering', name: 'Phase 16J Welding Heat Input & Motor Starting', slug: 'phase16j-welding-motor', description: 'Welding heat input and electric motor starting current calculators', sortOrder: 105 },
  { id: 'p16j-sub-conv', categoryId: 'converter', name: 'Phase 16J Illuminance & Luminance', slug: 'phase16j-lighting-conv', description: 'Illuminance and luminance unit conversion utilities', sortOrder: 105 },
  { id: 'p16j-sub-check', categoryId: 'checkers', name: 'Phase 16J PLC I/O Address Mapping', slug: 'phase16j-plc-check', description: 'PLC I/O address mapping and configuration consistency checkers', sortOrder: 105 },
  { id: 'p16j-sub-gen', categoryId: 'generators', name: 'Phase 16J Electrical Wiring Diagrams', slug: 'phase16j-wiring-gen', description: 'Electrical wiring diagram SVG generators', sortOrder: 105 },
  { id: 'p16j-sub-plan', categoryId: 'planners', name: 'Phase 16J Calibration Workload', slug: 'phase16j-calib-plan', description: 'Calibration laboratory workload and capacity planners', sortOrder: 105 },
  { id: 'p16j-sub-tools', categoryId: 'additional-tools', name: 'Phase 16J Complex Number & Phasor', slug: 'phase16j-phasor-calc', description: 'Complex number arithmetic and phasor calculation utilities', sortOrder: 105 },
  { id: 'p16j-sub-track', categoryId: 'trackers', name: 'Phase 16J Weld Inspection & Defect Log', slug: 'phase16j-weld-track', description: 'Weld inspection records and defect log trackers', sortOrder: 105 },
  { id: 'p16j-sub-guides', categoryId: 'guides', name: 'Phase 16J Electric Motors & PLC Architecture', slug: 'phase16j-motor-plc-guides', description: 'Industrial electric motor types and PLC architecture references', sortOrder: 105 }
];

export const BATCH53_METADATA: CalculatorMeta[] = [
  {
    id: 'welding-heat-input-calculator',
    name: 'Welding Heat Input Calculator',
    shortDesc: 'Calculate welding arc heat input from voltage, current, travel speed, and process thermal efficiency',
    category: 'engineering',
    subcategoryId: 'p16j-sub-calc',
    tags: ['engineering', 'welding', 'heat-input', 'arc-welding', 'metallurgy', 'calculators'],
    formula: 'Heat Input (H) = (η × V × I) / (S × 1000)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'electric-motor-starting-current-calculator',
    name: 'Electric Motor Starting Current Calculator',
    shortDesc: 'Estimate electric motor starting (inrush) current across direct-on-line and reduced-voltage starting methods',
    category: 'electrical',
    subcategoryId: 'p16j-sub-calc',
    tags: ['electrical', 'electric-motor', 'starting-current', 'inrush', 'power', 'calculators'],
    formula: 'Starting Current = Full Load Amps (FLA) × Starting Current Multiplier (LRA Ratio)',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'illuminance-luminance-unit-converter',
    name: 'Illuminance & Luminance Unit Converter',
    shortDesc: 'Convert illuminance between Lux (lx) and foot-candles (fc), and luminance between candela per square meter and related units',
    category: 'converter',
    subcategoryId: 'p16j-sub-conv',
    tags: ['converter', 'illuminance', 'luminance', 'lux', 'foot-candles', 'lighting'],
    formula: '1 Foot-candle (fc) = 10.764 Lux (lx)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'plc-io-address-mapping-checker',
    name: 'PLC I/O Address Mapping Checker',
    shortDesc: 'Validate PLC I/O address allocations, check for duplicate rack/slot/channel assignments, and verify data type formats',
    category: 'checkers',
    subcategoryId: 'p16j-sub-check',
    tags: ['checkers', 'plc', 'io-address', 'automation', 'mapping', 'validation'],
    formula: 'PLC I/O address uniqueness and rack/slot assignment range validation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'electrical-wiring-diagram-svg-generator',
    name: 'Electrical Wiring Diagram SVG Generator',
    shortDesc: 'Generate editable electrical wiring diagrams in SVG format with power sources, switches, loads, and connections',
    category: 'generators',
    subcategoryId: 'p16j-sub-gen',
    tags: ['generators', 'wiring-diagram', 'electrical', 'svg', 'schematic', 'circuit'],
    formula: 'SVG schematic component and connection line interpolation',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'calibration-laboratory-workload-planner',
    name: 'Calibration Laboratory Workload Planner',
    shortDesc: 'Schedule calibration laboratory instrument workloads, technician assignments, due dates, and test bench capacity',
    category: 'planners',
    subcategoryId: 'p16j-sub-plan',
    tags: ['planners', 'calibration-laboratory', 'workload', 'metrology', 'schedule', 'planning'],
    formula: 'Calibration bench utilization = Scheduled Instruments / Available Capacity × 100%',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'complex-number-phasor-calculator',
    name: 'Complex Number & Phasor Calculator',
    shortDesc: 'Perform complex number arithmetic in rectangular and polar forms, calculate magnitude, phase angle, and phasor conversions',
    category: 'additional-tools',
    subcategoryId: 'p16j-sub-tools',
    tags: ['tools', 'complex-number', 'phasor', 'polar-rectangular', 'ac-circuit', 'math'],
    formula: 'Magnitude (r) = √(x² + y²); Phase Angle (θ) = atan2(y, x)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'weld-inspection-defect-log-tracker',
    name: 'Weld Inspection & Defect Log Tracker',
    shortDesc: 'Track weld inspection dates, weld identification numbers, NDT methods, defect types, results, and corrective actions',
    category: 'trackers',
    subcategoryId: 'p16j-sub-track',
    tags: ['trackers', 'weld-inspection', 'defect-log', 'quality', 'welding', 'tracking'],
    formula: 'Weld pass/fail status tracking and defect classification records',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'industrial-electric-motor-selection-reference',
    name: 'Industrial Electric Motor Types & Selection Reference',
    shortDesc: 'Reference guide covering AC induction, synchronous, DC, and servo motor types, operating characteristics, and selection',
    category: 'guides',
    subcategoryId: 'p16j-sub-guides',
    tags: ['guides', 'electric-motor', 'ac-motor', 'dc-motor', 'industrial', 'reference'],
    formula: 'Electric motor torque-speed characteristics and selection taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'plc-architecture-industrial-io-reference',
    name: 'PLC Architecture & Industrial I/O Reference',
    shortDesc: 'Reference guide covering Programmable Logic Controller (PLC) CPU architecture, power supply, discrete/analog I/O, and networking',
    category: 'guides',
    subcategoryId: 'p16j-sub-guides',
    tags: ['guides', 'plc-architecture', 'industrial-io', 'automation', 'controller', 'reference'],
    formula: 'PLC hardware architecture and communication protocol taxonomy',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
