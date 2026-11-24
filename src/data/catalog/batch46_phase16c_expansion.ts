import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH46_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p16c-sub-calc', categoryId: 'engineering', name: 'Phase 16C Pipe Flow & Heat Exchanger Calculators', slug: 'phase16c-pipe-heat-calculators', description: 'Pipe flow pressure drop, head loss, and heat exchanger effectiveness calculators', sortOrder: 98 },
  { id: 'p16c-sub-conv', categoryId: 'converter', name: 'Phase 16C Viscosity Converters', slug: 'phase16c-viscosity-converters', description: 'Dynamic and kinematic viscosity unit conversion utilities', sortOrder: 98 },
  { id: 'p16c-sub-check', categoryId: 'checkers', name: 'Phase 16C PCB BOM & Component Reference Checkers', slug: 'phase16c-pcb-bom-checkers', description: 'PCB Bill of Materials reference designator and duplicate check validators', sortOrder: 98 },
  { id: 'p16c-sub-gen', categoryId: 'generators', name: 'Phase 16C P&ID SVG Diagram Generators', slug: 'phase16c-pid-svg-generators', description: 'Piping and Instrumentation Diagram (P&ID) SVG layout generators', sortOrder: 98 },
  { id: 'p16c-sub-plan', categoryId: 'planners', name: 'Phase 16C Machine Shop Production Schedulers', slug: 'phase16c-machine-shop-schedulers', description: 'Machine shop production jobs, operations, and scheduling planners', sortOrder: 98 },
  { id: 'p16c-sub-tools', categoryId: 'additional-tools', name: 'Phase 16C Engineering Formula Rearrangement Utilities', slug: 'phase16c-formula-rearrangement-utilities', description: 'Engineering formula variable solving and rearrangement utilities', sortOrder: 98 },
  { id: 'p16c-sub-track', categoryId: 'trackers', name: 'Phase 16C Laboratory Chemical Inventory Trackers', slug: 'phase16c-chemical-inventory-trackers', description: 'Laboratory chemical inventory quantities, storage, and expiration trackers', sortOrder: 98 },
  { id: 'p16c-sub-guides', categoryId: 'guides', name: 'Phase 16C Welding & Control Systems References', slug: 'phase16c-welding-control-references', description: 'Welding processes joint design and control systems PID fundamentals references', sortOrder: 98 }
];

export const BATCH46_METADATA: CalculatorMeta[] = [
  // 1. Pipe Flow Pressure Drop & Head Loss Calculator
  {
    id: 'pipe-flow-pressure-drop-head-loss-calculator',
    name: 'Pipe Flow Pressure Drop & Head Loss Calculator',
    shortDesc: 'Calculate pipe flow pressure drop and hydraulic head loss using Darcy-Weisbach equations and friction factors',
    category: 'engineering',
    subcategoryId: 'p16c-sub-calc',
    tags: ['engineering', 'pipe-flow', 'pressure-drop', 'head-loss', 'darcy-weisbach', 'hydraulics'],
    formula: 'ΔP = f × (L/D) × (ρv²/2); Head Loss (h_f) = f × (L/D) × (v²/2g)',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 2. Heat Exchanger Effectiveness & Thermal Performance Calculator
  {
    id: 'heat-exchanger-effectiveness-calculator',
    name: 'Heat Exchanger Effectiveness & Thermal Performance Calculator',
    shortDesc: 'Calculate heat transfer rate and heat exchanger effectiveness using the NTU method for parallel and counterflow configurations',
    category: 'engineering',
    subcategoryId: 'p16c-sub-calc',
    tags: ['engineering', 'heat-exchanger', 'thermal-performance', 'effectiveness-ntu', 'thermodynamics'],
    formula: 'Effectiveness (ε) = Q / Q_max = C_h(T_hi - T_ho) / (C_min(T_hi - T_ci))',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 3. Dynamic & Kinematic Viscosity Converter
  {
    id: 'dynamic-kinematic-viscosity-converter',
    name: 'Dynamic & Kinematic Viscosity Converter',
    shortDesc: 'Convert dynamic viscosity (Pa·s, cP, Poise) and kinematic viscosity (m²/s, cSt, Stokes) with fluid density scaling',
    category: 'converter',
    subcategoryId: 'p16c-sub-conv',
    tags: ['converter', 'viscosity', 'dynamic-viscosity', 'kinematic-viscosity', 'fluid-mechanics', 'units'],
    formula: 'Kinematic Viscosity (ν) = Dynamic Viscosity (μ) / Density (ρ)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. PCB Bill of Materials & Component Reference Checker
  {
    id: 'pcb-bom-component-reference-checker',
    name: 'PCB Bill of Materials & Component Reference Checker',
    shortDesc: 'Inspect PCB Bill of Materials (BOM) CSV data, validate reference designators (R, C, U, D), and detect duplicates or missing fields',
    category: 'checkers',
    subcategoryId: 'p16c-sub-check',
    tags: ['checkers', 'pcb-bom', 'bill-of-materials', 'component-reference', 'electronics', 'validation'],
    formula: 'Reference designator prefix matching (R, C, L, U, Q, D) and duplicate detection',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. P&ID SVG Diagram Generator
  {
    id: 'pid-svg-diagram-generator',
    name: 'P&ID SVG Diagram Generator',
    shortDesc: 'Generate Piping and Instrumentation Diagram (P&ID) SVG layouts with pumps, tanks, valves, and flow lines',
    category: 'generators',
    subcategoryId: 'p16c-sub-gen',
    tags: ['generators', 'pid-generator', 'piping-instrumentation', 'svg', 'schematic', 'engineering'],
    formula: 'SVG symbol layout interpolation for process equipment and instrumentation tags',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Machine Shop Production & Job Scheduling Planner
  {
    id: 'machine-shop-production-scheduling-planner',
    name: 'Machine Shop Production & Job Scheduling Planner',
    shortDesc: 'Schedule machine shop production jobs, work centers, estimated run durations, and track machine utilization timelines',
    category: 'planners',
    subcategoryId: 'p16c-sub-plan',
    tags: ['planners', 'machine-shop', 'production-scheduling', 'job-shop', 'manufacturing', 'planning'],
    formula: 'Operation schedule timeline allocation and machine workload utilization %',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 7. Engineering Formula Rearrangement Utility
  {
    id: 'engineering-formula-rearrangement-utility',
    name: 'Engineering Formula Rearrangement Utility',
    shortDesc: 'Rearrange engineering formulas across mechanics, electrical, and thermodynamics to solve for any selected target variable',
    category: 'additional-tools',
    subcategoryId: 'p16c-sub-tools',
    tags: ['tools', 'formula-rearrangement', 'engineering-equations', 'solver', 'algebra', 'math'],
    formula: 'Algebraic equation variable isolation and numeric substitution solvers',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Laboratory Chemical Inventory & Expiration Tracker
  {
    id: 'laboratory-chemical-inventory-expiration-tracker',
    name: 'Laboratory Chemical Inventory & Expiration Tracker',
    shortDesc: 'Track laboratory chemical inventory items, quantities, storage locations, expiration dates, and safety document references',
    category: 'trackers',
    subcategoryId: 'p16c-sub-track',
    tags: ['trackers', 'chemical-inventory', 'expiration-tracker', 'laboratory', 'safety', 'tracking'],
    formula: 'Expiration Countdown = Expiry Date - Current Date; Low stock threshold alerts',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 9. Welding Processes & Joint Design Reference
  {
    id: 'welding-processes-joint-design-reference',
    name: 'Welding Processes & Joint Design Reference',
    shortDesc: 'Reference guide covering SMAW, GMAW, GTAW, FCAW welding processes, joint types, edge preparation, and terminology',
    category: 'guides',
    subcategoryId: 'p16c-sub-guides',
    tags: ['guides', 'welding-processes', 'joint-design', 'smaw-gmaw', 'manufacturing', 'reference'],
    formula: 'Welding process parameter taxonomy and joint configuration classification',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 10. Control Systems & PID Fundamentals Reference
  {
    id: 'control-systems-pid-reference',
    name: 'Control Systems & PID Fundamentals Reference',
    shortDesc: 'Reference guide covering open/closed loop control, feedback, proportional, integral, derivative actions, and PID tuning concepts',
    category: 'guides',
    subcategoryId: 'p16c-sub-guides',
    tags: ['guides', 'control-systems', 'pid-controller', 'automation', 'feedback-loop', 'reference'],
    formula: 'PID Control Output u(t) = K_p e(t) + K_i ∫e(t)dt + K_d (de/dt)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
