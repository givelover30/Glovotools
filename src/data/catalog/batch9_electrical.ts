import { CalculatorMeta } from '../../types.ts';

export const BATCH9_METADATA: CalculatorMeta[] = [
  // ==========================================
  // ELECTRICAL CALCULATORS (16 new, target 18 total with ohms-law & electricity-cost)
  // ==========================================

  // Subcategory: ohms-law-power (4)
  {
    id: 'electric-power-kw-calc',
    name: 'Electrical Power (Watts, Volts & Amps) Calculator',
    shortDesc: 'Solve single-phase electrical power: Watts (P) = Volts (V) × Amperes (I)',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    tags: ['electrical', 'power', 'watts', 'volts', 'amps', 'power-formula'],
    formula: 'P = V × I; I = P / V; V = P / I',
    isPopular: true,
    iconName: 'Zap',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'three-phase-power-calc',
    name: 'Three-Phase Electric Power (kW & kVA) Calculator',
    shortDesc: 'Calculate 3-phase real power (kW), apparent power (kVA), and line current',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    tags: ['electrical', 'three-phase', 'kva', 'line-voltage', 'industrial-power'],
    formula: 'P (kW) = (√3 × V_LL × I × PF) / 1000',
    isPopular: true,
    iconName: 'Activity',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'ac-apparent-reactive-power-calc',
    name: 'AC Power Triangle (Real, Reactive & Apparent) Calculator',
    shortDesc: 'Calculate power factor, real power (kW), reactive power (kVAR), and apparent power (kVA)',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    tags: ['electrical', 'power-factor', 'kvar', 'kva', 'reactive-power', 'power-triangle'],
    formula: 'S = √(P² + Q²); PF = P / S',
    isPopular: false,
    iconName: 'Triangle',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'joules-to-watts-calc',
    name: 'Energy to Power (Joules to Watts) Calculator',
    shortDesc: 'Convert energy consumption in Joules to electrical power in Watts over elapsed seconds',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    tags: ['electrical', 'joules', 'watts', 'energy-power', 'seconds'],
    formula: 'Watts = Joules / Seconds',
    isPopular: false,
    iconName: 'Cpu',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },

  // Subcategory: energy-consumption (4)
  {
    id: 'appliance-daily-kwh-calc',
    name: 'Appliance Daily & Annual Energy Usage Calculator',
    shortDesc: 'Calculate daily kilowatt-hours (kWh) and annual utility electricity cost for any appliance',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    tags: ['electrical', 'kwh', 'appliance-power', 'utility-bill', 'energy-efficiency'],
    formula: 'Daily kWh = (Watts × Hours) / 1000; Annual Cost = kWh × 365 × Rate',
    isPopular: true,
    iconName: 'Tv',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'electric-vehicle-charging-calc',
    name: 'Electric Vehicle (EV) Charging Time & Cost Calculator',
    shortDesc: 'Compute Level 1/2 EV charge duration, battery kWh replenished, and driving cost per mile',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    tags: ['electrical', 'ev-charging', 'electric-vehicle', 'battery-kwh', 'charge-time'],
    formula: 'Charge Hours = (Battery kWh × (Target % - Start %)) / Charger kW',
    isPopular: true,
    iconName: 'BatteryCharging',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'solar-panel-output-calc',
    name: 'Solar Panel Daily Energy Output Calculator',
    shortDesc: 'Estimate daily and monthly solar electricity production (kWh) based on peak sun hours',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    tags: ['electrical', 'solar-power', 'photovoltaic', 'solar-kwh', 'sun-hours'],
    formula: 'Daily kWh = Array kW × Peak Sun Hours × 0.82 efficiency',
    isPopular: true,
    iconName: 'Sun',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'generator-sizing-calc',
    name: 'Standby Generator Wattage Sizing Calculator',
    shortDesc: 'Calculate running and starting surge wattage needs for home emergency standby generators',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    tags: ['electrical', 'generator', 'standby-generator', 'surge-watts', 'emergency-power'],
    formula: 'Total Required kW = (Running Watts + Largest Motor Surge Watts) / 1000',
    isPopular: false,
    iconName: 'Radio',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },

  // Subcategory: wire-sizing-drop (4)
  {
    id: 'voltage-drop-awg-calc',
    name: 'AWG Wire Voltage Drop Calculator',
    shortDesc: 'Determine circuit voltage drop percentage across copper wire runs (NEC 3% branch limit)',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    tags: ['electrical', 'voltage-drop', 'awg', 'wire-size', 'nec-limit', 'copper-wire'],
    formula: 'V_drop = (2 × K × I × L) / Circular Mils',
    isPopular: true,
    iconName: 'Sliders',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'wire-ampacity-calc',
    name: 'NEC Conductor Wire Gauge & Ampacity Calculator',
    shortDesc: 'Determine required copper wire gauge (14, 12, 10, 8, 6 AWG) based on breaker amperage',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    tags: ['electrical', 'ampacity', 'wire-gauge', 'awg', 'circuit-breaker'],
    formula: 'Select standard AWG where rated ampacity >= 125% continuous load',
    isPopular: true,
    iconName: 'Sliders',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'conduit-fill-calc',
    name: 'NEC Conduit Fill Capacity Calculator',
    shortDesc: 'Verify conduit sizing against National Electrical Code maximum 40% area fill limits',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    tags: ['electrical', 'conduit-fill', 'emt', 'pvc', 'nec-code', 'wire-pull'],
    formula: 'Conduit Fill % = (Total Wire Cross-Section / Total Conduit Area) × 100',
    isPopular: false,
    iconName: 'Circle',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'circuit-breaker-calc',
    name: 'Circuit Breaker Sizing (80% Continuous Rule) Calculator',
    shortDesc: 'Size branch circuit breakers according to continuous and non-continuous electrical loads',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    tags: ['electrical', 'circuit-breaker', 'amperage', '80-percent-rule', 'panel-sizing'],
    formula: 'Breaker Amps = (Non-Continuous Load) + (Continuous Load × 1.25)',
    isPopular: true,
    iconName: 'Shield',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },

  // Subcategory: circuits-impedance (4)
  {
    id: 'series-parallel-resistors-calc',
    name: 'Series & Parallel Resistors Calculator',
    shortDesc: 'Calculate equivalent total resistance for series (R1+R2) and parallel circuits (1/(1/R1+1/R2))',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    tags: ['electrical', 'resistors', 'series-resistors', 'parallel-resistors', 'equivalent-resistance'],
    formula: 'Series: R_eq = R1 + R2; Parallel: 1/R_eq = 1/R1 + 1/R2',
    isPopular: true,
    iconName: 'Share2',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'capacitive-reactance-calc',
    name: 'Capacitive Reactance (Xc) Calculator',
    shortDesc: 'Calculate capacitor opposition to AC current flow: Xc = 1 / (2 × π × f × C)',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    tags: ['electrical', 'capacitive-reactance', 'capacitors', 'ac-circuits', 'reactance-ohms'],
    formula: 'Xc = 1 / (2 × π × f × C)',
    isPopular: false,
    iconName: 'Minimize2',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'inductive-reactance-calc',
    name: 'Inductive Reactance (XL) Calculator',
    shortDesc: 'Determine inductor opposition in AC circuits: XL = 2 × π × f × L',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    tags: ['electrical', 'inductive-reactance', 'inductors', 'henries', 'frequency'],
    formula: 'XL = 2 × π × f × L',
    isPopular: false,
    iconName: 'Repeat',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  },
  {
    id: 'led-resistor-calc',
    name: 'LED Series Current Limiting Resistor Calculator',
    shortDesc: 'Calculate exact resistance (Ohms) and resistor wattage rating to protect an LED from burning out',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    tags: ['electrical', 'led-resistor', 'current-limiting', 'diode', 'circuit-design'],
    formula: 'R = (V_supply - V_led) / I_led; Power = I² × R',
    isPopular: true,
    iconName: 'Sun',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  }
];
