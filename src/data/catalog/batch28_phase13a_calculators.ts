import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH28_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13-sub-const', categoryId: 'construction', name: 'Advanced Construction & Structural Calculators', slug: 'advanced-construction', description: 'Concrete slabs, stairs, retaining wall lateral earth pressure, and column loads', sortOrder: 15 },
  { id: 'p13-sub-elec', categoryId: 'scientific', name: 'Electrical Power & Renewable Engineering Calculators', slug: 'electrical-power-engineering', description: 'Voltage drop, three-phase power, transformer sizing, and solar photovoltaic arrays', sortOrder: 15 },
  { id: 'p13-sub-mech', categoryId: 'converter', name: 'Mechanical & Fluid Flow Engineering Calculators', slug: 'mechanical-fluid-flow', description: 'Pipe friction flow rate, CNC feed rates, and machining cycle times', sortOrder: 15 },
  { id: 'p13-sub-fin', categoryId: 'financial', name: 'Advanced Business Profit & Margin Calculators', slug: 'advanced-business-profit', description: 'Comprehensive gross profit margin, markup percentage, and cost analysis', sortOrder: 15 }
];

export const BATCH28_METADATA: CalculatorMeta[] = [
  // 1. Concrete Slab Volume & Reinforcement Calculator
  {
    id: 'p13-concrete-slab-calc',
    name: 'Concrete Slab Volume & Rebar Grid Calculator',
    shortDesc: 'Calculate concrete volume in cubic yards, yards³, bags (60lb/80lb), and required rebar grid weight and count',
    category: 'construction',
    subcategoryId: 'p13-sub-const',
    tags: ['construction', 'concrete', 'slab', 'rebar', 'reinforcement', 'volume'],
    formula: 'Volume = Length × Width × Depth / 27 (yd³); Rebar = perimeter & grid spacing estimation',
    isPopular: false,
    iconName: 'Hammer',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 2. Staircase Geometry Calculator
  {
    id: 'p13-staircase-geometry-calc',
    name: 'Staircase Rise, Run & Headroom Geometry Calculator',
    shortDesc: 'Compute optimal riser height, tread depth, total run, stringer length, and code compliance ratios',
    category: 'construction',
    subcategoryId: 'p13-sub-const',
    tags: ['construction', 'stairs', 'rise', 'run', 'stringer', 'geometry'],
    formula: '2(Riser) + Run = 24.5 to 25.5 inches; Stringer = √(TotalRise² + TotalRun²)',
    isPopular: false,
    iconName: 'ChevronUp',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 3. Retaining Wall Pressure Calculator
  {
    id: 'p13-retaining-wall-calc',
    name: 'Retaining Wall Lateral Earth Pressure Calculator',
    shortDesc: 'Calculate active lateral soil pressure, total thrust force, and overturning moment using Rankine earth pressure theory',
    category: 'construction',
    subcategoryId: 'p13-sub-const',
    tags: ['construction', 'civil-engineering', 'retaining-wall', 'earth-pressure', 'rankine'],
    formula: 'Ka = tan²(45° - φ/2); Pressure = Ka × SoilDensity × Height; Thrust = 0.5 × Pressure × Height',
    isPopular: false,
    iconName: 'Shield',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 4. Electrical Voltage Drop Calculator
  {
    id: 'p13-voltage-drop-calc',
    name: 'Electrical Circuit Voltage Drop & Conductor Calculator',
    shortDesc: 'Calculate copper/aluminum wire voltage drop, percentage drop, and compliance with NEC 3% / 5% limits',
    category: 'scientific',
    subcategoryId: 'p13-sub-elec',
    tags: ['electrical', 'voltage-drop', 'nec', 'wire-size', 'conductor', 'engineering'],
    formula: 'VD = (2 × K × I × L) / CM (Single Phase); VD = (√3 × K × I × L) / CM (Three Phase)',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 5. Three-Phase Power Calculator
  {
    id: 'p13-three-phase-calc',
    name: 'Three-Phase Electrical Power & Current Calculator',
    shortDesc: 'Compute active power (kW), apparent power (kVA), reactive power (kVAR), and line current for 3-phase circuits',
    category: 'scientific',
    subcategoryId: 'p13-sub-elec',
    tags: ['electrical', 'three-phase', 'power', 'kva', 'kw', 'kvar', 'current'],
    formula: 'P = √3 × V_line × I_line × PF / 1000 (kW)',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 6. Transformer Sizing Calculator
  {
    id: 'p13-transformer-sizing-calc',
    name: 'Electrical Transformer KVA Sizing Calculator',
    shortDesc: 'Determine recommended transformer kVA capacity incorporating continuous load, motor starting surges, and future growth headroom',
    category: 'scientific',
    subcategoryId: 'p13-sub-elec',
    tags: ['electrical', 'transformer', 'kva-sizing', 'power', 'substation', 'industrial'],
    formula: 'kVA = (Total Connected kW / Power Factor) × Diversity Factor × Growth Factor',
    isPopular: false,
    iconName: 'Cpu',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 7. Solar Panel Array Sizing Calculator
  {
    id: 'p13-solar-array-calc',
    name: 'Solar Photovoltaic (PV) Array & Inverter Sizing Calculator',
    shortDesc: 'Calculate required solar panel count, total array peak wattage, daily kWh generation, and inverter capacity',
    category: 'scientific',
    subcategoryId: 'p13-sub-elec',
    tags: ['solar', 'photovoltaic', 'pv', 'renewable', 'inverter', 'array', 'energy'],
    formula: 'Daily Energy = PanelWatts × SunHours × Efficiency × PanelCount / 1000',
    isPopular: false,
    iconName: 'Sun',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  // 8. Pipe Flow Rate & Friction Calculator
  {
    id: 'p13-pipe-flow-calc',
    name: 'Pipe Flow Rate, Velocity & Friction Head Loss Calculator',
    shortDesc: 'Calculate internal pipe flow velocity, volumetric flow rate, Reynolds number, and Darcy-Weisbach head loss',
    category: 'converter',
    subcategoryId: 'p13-sub-mech',
    tags: ['mechanical', 'fluid', 'pipe-flow', 'velocity', 'darcy-weisbach', 'reynolds'],
    formula: 'Velocity = Q / Area; HeadLoss = f × (L/D) × (V² / 2g)',
    isPopular: false,
    iconName: 'Activity',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 9. Structural Column Load Calculator
  {
    id: 'p13-column-load-calc',
    name: 'Structural Column Axial Compression & Slenderness Calculator',
    shortDesc: 'Calculate tributary floor area, dead/live axial loads, slenderness ratio ($KL/r$), and allowable buckling stress',
    category: 'construction',
    subcategoryId: 'p13-sub-const',
    tags: ['construction', 'structural', 'column', 'axial-load', 'buckling', 'slenderness'],
    formula: 'Axial Load = TributaryArea × (DeadLoad + LiveLoad); Slenderness = (K × L) / r',
    isPopular: false,
    iconName: 'Columns',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 10. CNC Feed Rate & Spindle Speed Calculator
  {
    id: 'p13-cnc-feed-calc',
    name: 'CNC Milling Feed Rate & Spindle Speed (RPM) Calculator',
    shortDesc: 'Calculate optimal spindle speed (RPM) and feed rate (IPM/mm/min) based on cutting speed (SFM/m/min) and chip load',
    category: 'converter',
    subcategoryId: 'p13-sub-mech',
    tags: ['manufacturing', 'cnc', 'spindle-speed', 'feed-rate', 'milling', 'machining'],
    formula: 'RPM = (SFM × 3.82) / ToolDiameter; Feed = RPM × Flutes × ChipLoad',
    isPopular: false,
    iconName: 'Cog',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 11. Manufacturing Machining Time Calculator
  {
    id: 'p13-machining-time-calc',
    name: 'Manufacturing Machining Cycle Time & Material Removal Calculator',
    shortDesc: 'Compute total milling or turning machining cycle time, cutting path length, and material removal rate (MRR)',
    category: 'converter',
    subcategoryId: 'p13-sub-mech',
    tags: ['manufacturing', 'machining-time', 'cycle-time', 'mrr', 'milling', 'production'],
    formula: 'Time (min) = (PartLength + ToolOverTravel) / FeedRate; MRR = Width × Depth × Feed',
    isPopular: false,
    iconName: 'Clock',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 12. Business Profit Margin & Markup Calculator
  {
    id: 'p13-profit-margin-calc',
    name: 'Advanced Business Profit Margin, Markup & Cost Calculator',
    shortDesc: 'Calculate selling price, gross profit dollar amount, profit margin percentage, and markup percentage given cost and revenue',
    category: 'financial',
    subcategoryId: 'p13-sub-fin',
    tags: ['financial', 'business', 'profit-margin', 'markup', 'cost', 'revenue', 'pricing'],
    formula: 'Margin % = ((Revenue - Cost) / Revenue) × 100; Markup % = ((Revenue - Cost) / Cost) × 100',
    isPopular: false,
    iconName: 'DollarSign',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  }
];
