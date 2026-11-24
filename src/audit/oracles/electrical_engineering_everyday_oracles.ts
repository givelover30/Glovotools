import { OracleDefinition } from '../types.ts';

/**
 * Independent Mathematical Oracles for:
 * - Electrical Calculators (18)
 * - Engineering Calculators (20)
 * - Everyday Calculators (14)
 * Total: 52 Oracles
 *
 * All formulas and reference values are derived independently
 * from first principles and physics equations without importing production engines.
 */
export const ELECTRICAL_ENGINEERING_EVERYDAY_ORACLES: Record<string, OracleDefinition> = {
  // ==========================================
  // ELECTRICAL CALCULATORS (18)
  // ==========================================

  // 1. Ohm's Law & Power Calculator
  'ohms-law': {
    id: 'ohms-law',
    name: "Ohm's Law & Power Calculator",
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    governingFormula: 'V = I * R, P = V * I = I^2 * R = V^2 / R',
    independentDerivation: 'From definition of electric potential, current and resistance in DC circuits.',
    independentCalculate: (inputs) => {
      const v = Number(inputs.voltage || 0);
      const i = Number(inputs.current || 0);
      return v * i;
    },
    testCases: [
      { name: 'Standard 120V 12.5A Circuit', inputs: { voltage: 120, current: 12.5 }, expectedPrimary: 1500, tolerance: 0.01 },
      { name: 'Low Voltage 12V 2A', inputs: { voltage: 12, current: 2 }, expectedPrimary: 24, tolerance: 0.01 },
      { name: 'High Voltage Industrial 480V 50A', inputs: { voltage: 480, current: 50 }, expectedPrimary: 24000, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 2. Electricity Appliance Cost Calculator
  'electricity-cost': {
    id: 'electricity-cost',
    name: 'Electricity Appliance Cost Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    governingFormula: 'Cost = (Watts * Hours * Days / 1000) * Rate',
    independentDerivation: 'Energy in kWh = (W * h * 30) / 1000. Total Cost = kWh * $/kWh.',
    independentCalculate: (inputs) => {
      const w = Number(inputs.watts);
      const h = Number(inputs.hoursPerDay);
      const rate = Number(inputs.ratePerKwh);
      const kwhTotal = ((w * h) / 1000) * 30;
      return kwhTotal * rate;
    },
    testCases: [
      { name: 'Standard 1200W Heater 8 hrs/day @ $0.15/kWh', inputs: { watts: 1200, hoursPerDay: 8, ratePerKwh: 0.15 }, expectedPrimary: 43.20, tolerance: 0.05 },
      { name: 'Low Power LED 10W 24 hrs @ $0.20/kWh', inputs: { watts: 10, hoursPerDay: 24, ratePerKwh: 0.20 }, expectedPrimary: 1.44, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 3. Electrical Power (Watts, Volts & Amps) Calculator
  'electric-power-kw-calc': {
    id: 'electric-power-kw-calc',
    name: 'Electrical Power (Watts, Volts & Amps) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    governingFormula: 'P = V * I, kW = P / 1000',
    independentDerivation: 'Power in single-phase DC or unity-PF AC is current times voltage.',
    independentCalculate: (inputs) => {
      return Number(inputs.voltage) * Number(inputs.currentAmps);
    },
    testCases: [
      { name: 'Standard 120V 12A', inputs: { voltage: 120, currentAmps: 12 }, expectedPrimary: 1440, tolerance: 0.01 },
      { name: 'High Amp 240V 50A EV circuit', inputs: { voltage: 240, currentAmps: 50 }, expectedPrimary: 12000, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 4. Three-Phase Electric Power Calculator
  'three-phase-power-calc': {
    id: 'three-phase-power-calc',
    name: 'Three-Phase Electric Power (kW & kVA) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    governingFormula: 'kW = (sqrt(3) * V_LL * I * PF) / 1000',
    independentDerivation: 'Three-phase balanced load active power with line-to-line voltage.',
    independentCalculate: (inputs) => {
      const v = Number(inputs.lineVoltage);
      const i = Number(inputs.currentAmps);
      const pf = Number(inputs.powerFactor);
      return (Math.sqrt(3) * v * i * pf) / 1000;
    },
    testCases: [
      { name: '480V 50A at 0.85 PF', inputs: { lineVoltage: 480, currentAmps: 50, powerFactor: 0.85 }, expectedPrimary: 35.33, tolerance: 0.1 },
      { name: '208V 100A Unity PF', inputs: { lineVoltage: 208, currentAmps: 100, powerFactor: 1.0 }, expectedPrimary: 36.03, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 5. AC Power Triangle Calculator
  'ac-apparent-reactive-power-calc': {
    id: 'ac-apparent-reactive-power-calc',
    name: 'AC Power Triangle (Real, Reactive & Apparent) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    governingFormula: 'S = P / PF',
    independentDerivation: 'Complex AC apparent power S = P / PF.',
    independentCalculate: (inputs) => {
      return Number(inputs.realPowerKW) / Number(inputs.powerFactor);
    },
    testCases: [
      { name: '80kW at 0.80 PF', inputs: { realPowerKW: 80, powerFactor: 0.80 }, expectedPrimary: 100, tolerance: 0.01 },
      { name: 'Unity PF (PF=1.0, S=P)', inputs: { realPowerKW: 50, powerFactor: 1.0 }, expectedPrimary: 50, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 6. Energy to Power (Joules to Watts) Calculator
  'joules-to-watts-calc': {
    id: 'joules-to-watts-calc',
    name: 'Energy to Power (Joules to Watts) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    governingFormula: 'Watts = Joules / Seconds',
    independentDerivation: '1 Watt = 1 Joule per second.',
    independentCalculate: (inputs) => {
      return Number(inputs.energyJoules) / Number(inputs.timeSeconds);
    },
    testCases: [
      { name: '360,000 J over 3600 s (1 hr)', inputs: { energyJoules: 360000, timeSeconds: 3600 }, expectedPrimary: 100, tolerance: 0.01 },
      { name: '1 Joule in 1 ms', inputs: { energyJoules: 1, timeSeconds: 0.001 }, expectedPrimary: 1000, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 7. Appliance Daily & Annual Energy Usage Calculator
  'appliance-daily-kwh-calc': {
    id: 'appliance-daily-kwh-calc',
    name: 'Appliance Daily & Annual Energy Usage Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    governingFormula: 'Annual Cost = ((Watts * Hours) / 1000) * 365 * Rate',
    independentDerivation: 'Annual operating cost based on 365 days.',
    independentCalculate: (inputs) => {
      const dailyKwh = (Number(inputs.applianceWatts) * Number(inputs.hoursPerDay)) / 1000;
      return dailyKwh * 365 * Number(inputs.electricityRate);
    },
    testCases: [
      { name: '1500W Space Heater 4 hrs/day @ $0.16/kWh', inputs: { applianceWatts: 1500, hoursPerDay: 4, electricityRate: 0.16 }, expectedPrimary: 350.40, tolerance: 0.1 },
      { name: 'Always On 100W Router 24 hrs @ $0.12/kWh', inputs: { applianceWatts: 100, hoursPerDay: 24, electricityRate: 0.12 }, expectedPrimary: 105.12, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 8. Electric Vehicle (EV) Charging Time & Cost Calculator
  'electric-vehicle-charging-calc': {
    id: 'electric-vehicle-charging-calc',
    name: 'Electric Vehicle (EV) Charging Time & Cost Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    governingFormula: 'Time = Needed kWh / (Charger kW * 0.90)',
    independentDerivation: 'Energy needed to charge battery buffer with 90% AC-to-DC onboard charging efficiency.',
    independentCalculate: (inputs) => {
      const cap = Number(inputs.batteryCapacity);
      const start = Number(inputs.startPct);
      const target = Number(inputs.targetPct);
      const kw = Number(inputs.chargerKW);
      const neededKwh = cap * ((target - start) / 100);
      return neededKwh / (kw * 0.90);
    },
    testCases: [
      { name: '75 kWh battery 20% to 80% on 9.6 kW charger', inputs: { batteryCapacity: 75, startPct: 20, targetPct: 80, chargerKW: 9.6, kwhCost: 0.15 }, expectedPrimary: 5.208, tolerance: 0.05 },
      { name: 'Small top-off 50 kWh 70% to 80% on 11 kW charger', inputs: { batteryCapacity: 50, startPct: 70, targetPct: 80, chargerKW: 11, kwhCost: 0.20 }, expectedPrimary: 0.505, tolerance: 0.05, isBoundary: true }
    ]
  },

  // 9. Solar Panel Daily Energy Output Calculator
  'solar-panel-output-calc': {
    id: 'solar-panel-output-calc',
    name: 'Solar Panel Daily Energy Output Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    governingFormula: 'Daily kWh = kW * SunHours * 0.82 derate',
    independentDerivation: 'PV system output taking into account inverter and temperature derate of 82%.',
    independentCalculate: (inputs) => {
      return Number(inputs.systemSizeKW) * Number(inputs.sunHours) * 0.82;
    },
    testCases: [
      { name: '8.5 kW system with 4.8 sun hours', inputs: { systemSizeKW: 8.5, sunHours: 4.8, utilityRate: 0.18 }, expectedPrimary: 33.456, tolerance: 0.1 },
      { name: 'Small 3 kW balcony system with 3.5 sun hours', inputs: { systemSizeKW: 3.0, sunHours: 3.5, utilityRate: 0.25 }, expectedPrimary: 8.61, tolerance: 0.05, isBoundary: true }
    ]
  },

  // 10. Standby Generator Wattage Sizing Calculator
  'generator-sizing-calc': {
    id: 'generator-sizing-calc',
    name: 'Standby Generator Wattage Sizing Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    governingFormula: 'Gen kW = ceil(((Running Watts + Largest Motor Surge) * 1.20) / 1000)',
    independentDerivation: 'National Electrical Code continuous capacity plus 20% safety margin.',
    independentCalculate: (inputs) => {
      const peak = Number(inputs.runningWatts) + Number(inputs.largestSurgeWatts);
      return Math.ceil((peak * 1.20) / 1000);
    },
    testCases: [
      { name: '6500W running + 4000W surge', inputs: { runningWatts: 6500, largestSurgeWatts: 4000 }, expectedPrimary: 13, tolerance: 0.01 },
      { name: 'Small emergency essentials 2000W + 1500W surge', inputs: { runningWatts: 2000, largestSurgeWatts: 1500 }, expectedPrimary: 5, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 11. AWG Wire Voltage Drop Calculator
  'voltage-drop-awg-calc': {
    id: 'voltage-drop-awg-calc',
    name: 'AWG Wire Voltage Drop Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    governingFormula: 'V_dropPct = ((2 * 12.9 * I * L) / CMIL / V) * 100',
    independentDerivation: 'Two-wire single phase DC/AC resistance formula per NEC Table 8.',
    independentCalculate: (inputs) => {
      const v = Number(inputs.voltage);
      const i = Number(inputs.currentAmps);
      const l = Number(inputs.oneWayDistanceFt);
      const cmil = Number(inputs.wireGauge);
      const vDrop = (2 * 12.9 * i * l) / cmil;
      return (vDrop / v) * 100;
    },
    testCases: [
      { name: '120V 16A 100ft on 12 AWG (6530 cmil)', inputs: { voltage: 120, currentAmps: 16, oneWayDistanceFt: 100, wireGauge: '6530' }, expectedPrimary: 5.27, tolerance: 0.1 },
      { name: '240V 40A 50ft on 8 AWG (16510 cmil)', inputs: { voltage: 240, currentAmps: 40, oneWayDistanceFt: 50, wireGauge: '16510' }, expectedPrimary: 1.30, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 12. NEC Conductor Wire Gauge & Ampacity Calculator
  'wire-ampacity-calc': {
    id: 'wire-ampacity-calc',
    name: 'NEC Conductor Wire Gauge & Ampacity Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    governingFormula: 'NEC Table 310.16 minimum wire sizing for branch circuits',
    independentDerivation: 'Ampacity rating verification.',
    independentCalculate: (inputs) => {
      return Number(inputs.breakerAmps);
    },
    testCases: [
      { name: '20A Standard Receptacle Circuit', inputs: { breakerAmps: '20' }, expectedPrimary: 20, tolerance: 0.01 },
      { name: '50A Range Circuit', inputs: { breakerAmps: '50' }, expectedPrimary: 50, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 13. NEC Conduit Fill Capacity Calculator
  'conduit-fill-calc': {
    id: 'conduit-fill-calc',
    name: 'NEC Conduit Fill Capacity Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    governingFormula: 'Fill % = (Total Wire Area / Conduit Area) * 100',
    independentDerivation: 'NEC Chapter 9 Table 1 40% maximum fill rule for 3 or more conductors.',
    independentCalculate: (inputs) => {
      const conduitArea = Number(inputs.conduitTradeSize);
      const wireArea = 0.0133;
      const totalArea = Number(inputs.numWires) * wireArea;
      return (totalArea / conduitArea) * 100;
    },
    testCases: [
      { name: '6 wires in 3/4" EMT (0.533 sq in)', inputs: { numWires: 6, conduitTradeSize: '0.533' }, expectedPrimary: 14.97, tolerance: 0.2 },
      { name: '16 wires in 1/2" EMT (0.304 sq in)', inputs: { numWires: 16, conduitTradeSize: '0.304' }, expectedPrimary: 70.0, tolerance: 1.0, isBoundary: true }
    ]
  },

  // 14. Circuit Breaker Sizing Calculator
  'circuit-breaker-calc': {
    id: 'circuit-breaker-calc',
    name: 'Circuit Breaker Sizing (80% Continuous Rule) Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    governingFormula: 'Required Amps = NonContinuous + Continuous * 1.25',
    independentDerivation: 'NEC continuous load 125% rule rounded up to standard breaker size.',
    independentCalculate: (inputs) => {
      const cont = Number(inputs.continuousLoadAmps);
      const nonCont = Number(inputs.intermittentAmps);
      const minAmps = nonCont + cont * 1.25;
      const standard = [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
      return standard.find(s => s >= minAmps) || 100;
    },
    testCases: [
      { name: '12A continuous + 4A intermittent', inputs: { continuousLoadAmps: 12, intermittentAmps: 4 }, expectedPrimary: 20, tolerance: 0.01 },
      { name: '24A continuous load only', inputs: { continuousLoadAmps: 24, intermittentAmps: 0 }, expectedPrimary: 30, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 15. Series & Parallel Resistors Calculator
  'series-parallel-resistors-calc': {
    id: 'series-parallel-resistors-calc',
    name: 'Series & Parallel Resistors Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    governingFormula: 'Parallel: (R1 * R2) / (R1 + R2)',
    independentDerivation: 'Equivalent parallel DC resistance laws.',
    independentCalculate: (inputs) => {
      const r1 = Number(inputs.r1);
      const r2 = Number(inputs.r2);
      return (r1 * r2) / (r1 + r2);
    },
    testCases: [
      { name: 'Two 100 Ohm Resistors', inputs: { r1: 100, r2: 100 }, expectedPrimary: 50, tolerance: 0.01 },
      { name: '10 Ohm and 1000 Ohm Resistors', inputs: { r1: 10, r2: 1000 }, expectedPrimary: 9.90, tolerance: 0.05, isBoundary: true }
    ]
  },

  // 16. Capacitive Reactance (Xc) Calculator
  'capacitive-reactance-calc': {
    id: 'capacitive-reactance-calc',
    name: 'Capacitive Reactance (Xc) Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    governingFormula: 'Xc = 1 / (2 * pi * f * C)',
    independentDerivation: 'AC impedance of an ideal capacitor in ohms.',
    independentCalculate: (inputs) => {
      const f = Number(inputs.frequencyHz);
      const c = Number(inputs.capacitanceMicroFarad) * 1e-6;
      return 1 / (2 * Math.PI * f * c);
    },
    testCases: [
      { name: '47 uF at 60 Hz', inputs: { frequencyHz: 60, capacitanceMicroFarad: 47 }, expectedPrimary: 56.44, tolerance: 0.1 },
      { name: '10 uF at 1000 Hz audio tone', inputs: { frequencyHz: 1000, capacitanceMicroFarad: 10 }, expectedPrimary: 15.92, tolerance: 0.05, isBoundary: true }
    ]
  },

  // 17. Inductive Reactance (XL) Calculator
  'inductive-reactance-calc': {
    id: 'inductive-reactance-calc',
    name: 'Inductive Reactance (XL) Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    governingFormula: 'XL = 2 * pi * f * L',
    independentDerivation: 'AC impedance of an ideal inductor in ohms.',
    independentCalculate: (inputs) => {
      const f = Number(inputs.frequencyHz);
      const l = Number(inputs.inductanceMilliHenry) * 1e-3;
      return 2 * Math.PI * f * l;
    },
    testCases: [
      { name: '150 mH at 60 Hz', inputs: { frequencyHz: 60, inductanceMilliHenry: 150 }, expectedPrimary: 56.55, tolerance: 0.1 },
      { name: '10 mH at 10 kHz RF frequency', inputs: { frequencyHz: 10000, inductanceMilliHenry: 10 }, expectedPrimary: 628.32, tolerance: 0.5, isBoundary: true }
    ]
  },

  // 18. LED Series Current Limiting Resistor Calculator
  'led-resistor-calc': {
    id: 'led-resistor-calc',
    name: 'LED Series Current Limiting Resistor Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    governingFormula: 'R = (V_supply - V_led) / I_led',
    independentDerivation: 'Kirchhoff Voltage Law loop with series current limiting resistor.',
    independentCalculate: (inputs) => {
      const vs = Number(inputs.vSupply);
      const vf = Number(inputs.vLed);
      const iAmps = Number(inputs.iLedMilliAmps) / 1000;
      return Math.round(Math.max(0, vs - vf) / iAmps);
    },
    testCases: [
      { name: '9V battery, 2.1V red LED, 20 mA', inputs: { vSupply: 9.0, vLed: 2.1, iLedMilliAmps: 20 }, expectedPrimary: 345, tolerance: 1.0 },
      { name: '5V USB, 3.2V white LED, 20 mA', inputs: { vSupply: 5.0, vLed: 3.2, iLedMilliAmps: 20 }, expectedPrimary: 90, tolerance: 1.0, isBoundary: true }
    ]
  },

  // ==========================================
  // ENGINEERING CALCULATORS (20)
  // ==========================================

  // 19. Hydraulic Cylinder Force Calculator
  'hydraulic-force': {
    id: 'hydraulic-force',
    name: 'Hydraulic Cylinder Force Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'Force = (Pressure * pi * (d/2)^2) / 2000 tons',
    independentDerivation: "Pascal's principle applied to circular hydraulic pistons.",
    independentCalculate: (inputs) => {
      const p = Number(inputs.pressurePsi);
      const d = Number(inputs.boreDiameterInches);
      const area = Math.PI * Math.pow(d / 2, 2);
      return (p * area) / 2000;
    },
    testCases: [
      { name: '2500 PSI with 3-inch bore', inputs: { pressurePsi: 2500, boreDiameterInches: 3.0 }, expectedPrimary: 8.84, tolerance: 0.05 },
      { name: 'Heavy industrial 5000 PSI with 5-inch bore', inputs: { pressurePsi: 5000, boreDiameterInches: 5.0 }, expectedPrimary: 49.09, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 20. Kinetic & Potential Energy Calculator
  'kinetic-energy': {
    id: 'kinetic-energy',
    name: 'Kinetic & Potential Energy Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'KE = (0.5 * m * v^2) / 1000 kJ',
    independentDerivation: 'Work-energy theorem for translational kinetic motion.',
    independentCalculate: (inputs) => {
      const m = Number(inputs.massKg);
      const v = Number(inputs.velocityMps);
      return (0.5 * m * v * v) / 1000;
    },
    testCases: [
      { name: '1500 kg car at 20 m/s (~45 mph)', inputs: { massKg: 1500, velocityMps: 20 }, expectedPrimary: 300, tolerance: 0.01 },
      { name: 'High speed projectile 0.05 kg at 800 m/s', inputs: { massKg: 0.05, velocityMps: 800 }, expectedPrimary: 16, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 21. Reynolds Number Fluid Flow Calculator
  'reynolds-number-calc': {
    id: 'reynolds-number-calc',
    name: 'Reynolds Number Fluid Flow Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'Re = (rho * v * D) / mu',
    independentDerivation: 'Ratio of inertial forces to viscous forces in internal circular pipe flow.',
    independentCalculate: (inputs) => {
      const v = Number(inputs.velocity);
      const d = Number(inputs.pipeDiameterMeters);
      const rho = Number(inputs.fluidDensity);
      const mu = Number(inputs.dynamicViscosity);
      return Math.round((rho * v * d) / mu);
    },
    testCases: [
      { name: 'Water at 2 m/s through 0.05m pipe', inputs: { velocity: 2.0, pipeDiameterMeters: 0.05, fluidDensity: 1000, dynamicViscosity: 0.001 }, expectedPrimary: 100000, tolerance: 1.0 },
      { name: 'Laminar oil flow at 0.1 m/s through 0.01m tube', inputs: { velocity: 0.1, pipeDiameterMeters: 0.01, fluidDensity: 900, dynamicViscosity: 0.1 }, expectedPrimary: 9, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 22. Pipe Flow Rate & Velocity Calculator
  'pipe-flow-velocity-calc': {
    id: 'pipe-flow-velocity-calc',
    name: 'Pipe Flow Rate & Velocity Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'GPM = (pi * (d/24)^2 * v) * 448.831',
    independentDerivation: 'Continuity equation for incompressible volumetric flow rate.',
    independentCalculate: (inputs) => {
      const dIn = Number(inputs.diameterInches);
      const v = Number(inputs.velocityFtSec);
      const rFt = dIn / 24;
      const cuFtSec = Math.PI * rFt * rFt * v;
      return cuFtSec * 448.831;
    },
    testCases: [
      { name: '2-inch pipe at 5 ft/s velocity', inputs: { diameterInches: 2.0, velocityFtSec: 5.0 }, expectedPrimary: 48.96, tolerance: 0.5 },
      { name: '4-inch main at 8 ft/s', inputs: { diameterInches: 4.0, velocityFtSec: 8.0 }, expectedPrimary: 313.34, tolerance: 2.0, isBoundary: true }
    ]
  },

  // 23. Bernoulli Dynamic Pressure Calculator
  'bernoulli-pressure-calc': {
    id: 'bernoulli-pressure-calc',
    name: 'Bernoulli Dynamic Pressure & Velocity Head Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'P_dyn = 0.5 * rho * v^2',
    independentDerivation: 'Kinetic energy per unit volume in inviscid fluid mechanics.',
    independentCalculate: (inputs) => {
      return 0.5 * Number(inputs.densityKgM3) * Math.pow(Number(inputs.velocityMps), 2);
    },
    testCases: [
      { name: 'Air at 15 m/s (rho=1.225)', inputs: { velocityMps: 15, densityKgM3: 1.225 }, expectedPrimary: 137.8, tolerance: 0.5 },
      { name: 'Water at 10 m/s (rho=1000)', inputs: { velocityMps: 10, densityKgM3: 1000 }, expectedPrimary: 50000, tolerance: 10.0, isBoundary: true }
    ]
  },

  // 24. Hydraulic Pump Power (HP) Calculator
  'hydraulic-pump-hp-calc': {
    id: 'hydraulic-pump-hp-calc',
    name: 'Hydraulic Pump Power (HP) Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'Brake HP = (PSI * GPM) / (1714 * Efficiency)',
    independentDerivation: 'Imperial mechanical hydraulic horsepower conversion.',
    independentCalculate: (inputs) => {
      const psi = Number(inputs.pressurePSI);
      const gpm = Number(inputs.flowGPM);
      const eff = Number(inputs.efficiencyPct) / 100;
      return (psi * gpm) / (1714 * eff);
    },
    testCases: [
      { name: '3000 PSI at 15 GPM with 85% efficiency', inputs: { pressurePSI: 3000, flowGPM: 15, efficiencyPct: 85 }, expectedPrimary: 30.9, tolerance: 0.2 },
      { name: '1000 PSI at 5 GPM with 90% efficiency', inputs: { pressurePSI: 1000, flowGPM: 5, efficiencyPct: 90 }, expectedPrimary: 3.24, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 25. Poiseuille Pipe Flow Resistance Calculator
  'poiseuille-flow-calc': {
    id: 'poiseuille-flow-calc',
    name: 'Poiseuille Pipe Flow Resistance Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    governingFormula: 'Delta P (kPa) = ((8 * mu * L * Q) / (pi * r^4)) / 1000',
    independentDerivation: 'Laminar viscous friction pressure loss in cylindrical conduits.',
    independentCalculate: (inputs) => {
      const l = Number(inputs.lengthMeters);
      const r = Number(inputs.radiusMm) * 1e-3;
      const mu = Number(inputs.viscosityMpa) * 1e-3;
      const q = (Number(inputs.flowLpm) * 1e-3) / 60;
      const deltaP = (8 * mu * l * q) / (Math.PI * Math.pow(r, 4));
      return deltaP / 1000;
    },
    testCases: [
      { name: '25m pipe, 5mm radius, 1 mPa.s, 10 LPM', inputs: { lengthMeters: 25, radiusMm: 5, viscosityMpa: 1.0, flowLpm: 10 }, expectedPrimary: 16.98, tolerance: 0.2 },
      { name: 'Small capillary tube 1m, 1mm radius, 10 mPa.s oil', inputs: { lengthMeters: 1, radiusMm: 1, viscosityMpa: 10, flowLpm: 0.1 }, expectedPrimary: 42.44, tolerance: 1.0, isBoundary: true }
    ]
  },

  // 26. Torque, Horsepower & RPM Calculator
  'torque-hp-rpm-calc': {
    id: 'torque-hp-rpm-calc',
    name: 'Torque, Horsepower & RPM Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'HP = (Torque lb-ft * RPM) / 5252',
    independentDerivation: 'Rotational mechanical power relationship.',
    independentCalculate: (inputs) => {
      return (Number(inputs.torqueLbFt) * Number(inputs.rpm)) / 5252;
    },
    testCases: [
      { name: '350 lb-ft at 5000 RPM', inputs: { torqueLbFt: 350, rpm: 5000 }, expectedPrimary: 333.2, tolerance: 0.5 },
      { name: '5252 RPM crossover point (HP == Torque)', inputs: { torqueLbFt: 200, rpm: 5252 }, expectedPrimary: 200, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 27. Centripetal Force & Acceleration Calculator
  'centrifugal-force-calc': {
    id: 'centrifugal-force-calc',
    name: 'Centripetal Force & Acceleration Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'Fc = (m * v^2) / r',
    independentDerivation: 'Kinematics of uniform circular motion.',
    independentCalculate: (inputs) => {
      const m = Number(inputs.massKg);
      const v = Number(inputs.velocityMps);
      const r = Number(inputs.radiusMeters);
      return (m * v * v) / r;
    },
    testCases: [
      { name: '1200 kg car at 25 m/s on 50m radius curve', inputs: { massKg: 1200, velocityMps: 25, radiusMeters: 50 }, expectedPrimary: 15000, tolerance: 10 },
      { name: 'Gentle highway curve 200m radius at 30 m/s', inputs: { massKg: 1500, velocityMps: 30, radiusMeters: 200 }, expectedPrimary: 6750, tolerance: 5, isBoundary: true }
    ]
  },

  // 28. Hooke's Law Spring Force Calculator
  'mechanical-spring-calc': {
    id: 'mechanical-spring-calc',
    name: "Hooke's Law Spring Force & Energy Calculator",
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'F = k * x',
    independentDerivation: 'Linear elasticity in helical coil springs.',
    independentCalculate: (inputs) => {
      return Number(inputs.springRateK) * Number(inputs.displacementMeters);
    },
    testCases: [
      { name: 'k = 500 N/m with 0.08m displacement', inputs: { springRateK: 500, displacementMeters: 0.08 }, expectedPrimary: 40, tolerance: 0.01 },
      { name: 'Stiff die spring k=50,000 N/m with 0.01m compression', inputs: { springRateK: 50000, displacementMeters: 0.01 }, expectedPrimary: 500, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 29. Gear Ratio & Mechanical Advantage Calculator
  'gear-ratio-calc': {
    id: 'gear-ratio-calc',
    name: 'Gear Ratio & Mechanical Advantage Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'Ratio = DrivenTeeth / DriverTeeth',
    independentDerivation: 'Meshed gear kinematics with conservation of rotational power.',
    independentCalculate: (inputs) => {
      return Number(inputs.drivenTeeth) / Number(inputs.driverTeeth);
    },
    testCases: [
      { name: '14T driver to 42T driven at 1800 RPM', inputs: { driverTeeth: 14, drivenTeeth: 42, inputRPM: 1800 }, expectedPrimary: 3.0, tolerance: 0.01 },
      { name: 'Overdrive 40T driver to 20T driven', inputs: { driverTeeth: 40, drivenTeeth: 20, inputRPM: 1000 }, expectedPrimary: 0.5, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 30. Simple Pendulum Oscillation Period Calculator
  'pendulum-period-calc': {
    id: 'pendulum-period-calc',
    name: 'Simple Pendulum Oscillation Period Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    governingFormula: 'T = 2 * pi * sqrt(L / g)',
    independentDerivation: 'Small angle approximation harmonic oscillator formula.',
    independentCalculate: (inputs) => {
      return 2 * Math.PI * Math.sqrt(Number(inputs.lengthMeters) / Number(inputs.gravity));
    },
    testCases: [
      { name: '1-meter pendulum under standard Earth gravity (9.80665)', inputs: { lengthMeters: 1.0, gravity: 9.80665 }, expectedPrimary: 2.006, tolerance: 0.01 },
      { name: '0.248m pendulum (approx 1-second period)', inputs: { lengthMeters: 0.248, gravity: 9.80665 }, expectedPrimary: 0.999, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 31. Beam Bending Stress (Flexure) Calculator
  'beam-bending-stress-calc': {
    id: 'beam-bending-stress-calc',
    name: 'Beam Bending Stress (Flexure) Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    governingFormula: 'sigma = (M * y) / I',
    independentDerivation: 'Euler-Bernoulli linear elastic beam flexure formula.',
    independentCalculate: (inputs) => {
      return (Number(inputs.bendingMomentLbIn) * Number(inputs.distanceYInches)) / Number(inputs.momentOfInertiaI);
    },
    testCases: [
      { name: 'M = 45,000 lb-in, y = 3.5 in, I = 42.5 in^4', inputs: { bendingMomentLbIn: 45000, distanceYInches: 3.5, momentOfInertiaI: 42.5 }, expectedPrimary: 3706, tolerance: 2.0 },
      { name: 'Deep girder M = 500,000 lb-in, y = 10 in, I = 1200 in^4', inputs: { bendingMomentLbIn: 500000, distanceYInches: 10, momentOfInertiaI: 1200 }, expectedPrimary: 4167, tolerance: 5.0, isBoundary: true }
    ]
  },

  // 32. Cantilever Beam Deflection Calculator
  'cantilever-deflection-calc': {
    id: 'cantilever-deflection-calc',
    name: 'Cantilever Beam Deflection Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    governingFormula: 'delta = (P * L^3) / (3 * E * I)',
    independentDerivation: 'Tip deflection under concentrated end load for fixed cantilever.',
    independentCalculate: (inputs) => {
      const p = Number(inputs.pointLoadLbs);
      const l = Number(inputs.lengthInches);
      const e = Number(inputs.elasticModulusPSI);
      const i = Number(inputs.momentOfInertia);
      return (p * Math.pow(l, 3)) / (3 * e * i);
    },
    testCases: [
      { name: '1000 lbs tip load, 72-inch span, E=29M PSI, I=25 in^4', inputs: { pointLoadLbs: 1000, lengthInches: 72, elasticModulusPSI: 29000000, momentOfInertia: 25 }, expectedPrimary: 0.172, tolerance: 0.01 },
      { name: 'Heavy load 5000 lbs on short 36-inch stub', inputs: { pointLoadLbs: 5000, lengthInches: 36, elasticModulusPSI: 29000000, momentOfInertia: 50 }, expectedPrimary: 0.0536, tolerance: 0.005, isBoundary: true }
    ]
  },

  // 33. Euler Critical Column Buckling Calculator
  'euler-column-buckling-calc': {
    id: 'euler-column-buckling-calc',
    name: 'Euler Critical Column Buckling Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    governingFormula: 'P_cr = (pi^2 * E * I) / (K * L)^2',
    independentDerivation: 'Euler elastic column buckling threshold under axial compression.',
    independentCalculate: (inputs) => {
      const l = Number(inputs.lengthInches);
      const e = Number(inputs.elasticModulus);
      const i = Number(inputs.momentOfInertia);
      const k = Number(inputs.endConditionK);
      const effL = k * l;
      return (Math.PI * Math.PI * e * i) / (effL * effL);
    },
    testCases: [
      { name: '120-inch pinned-pinned (K=1) steel column, I=12 in^4', inputs: { lengthInches: 120, elasticModulus: 29000000, momentOfInertia: 12.0, endConditionK: 1.0 }, expectedPrimary: 238515, tolerance: 500 },
      { name: 'Fixed-fixed column (K=0.5, 4x capacity)', inputs: { lengthInches: 120, elasticModulus: 29000000, momentOfInertia: 12.0, endConditionK: 0.5 }, expectedPrimary: 954060, tolerance: 2000, isBoundary: true }
    ]
  },

  // 34. Area Moment of Inertia Calculator
  'moment-of-inertia-calc': {
    id: 'moment-of-inertia-calc',
    name: 'Area Moment of Inertia Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    governingFormula: 'Ix = (b * h^3) / 12',
    independentDerivation: 'Second moment of area for rectangular cross sections.',
    independentCalculate: (inputs) => {
      return (Number(inputs.widthInches) * Math.pow(Number(inputs.heightInches), 3)) / 12;
    },
    testCases: [
      { name: 'Nominal 4x8 beam (3.5" x 7.25")', inputs: { widthInches: 3.5, heightInches: 7.25 }, expectedPrimary: 111.14, tolerance: 0.1 },
      { name: 'Square 6" x 6" column (Ix == Iy)', inputs: { widthInches: 6.0, heightInches: 6.0 }, expectedPrimary: 108, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 35. Sensible Heat Transfer (Q = mcΔT) Calculator
  'heat-transfer-q-calc': {
    id: 'heat-transfer-q-calc',
    name: 'Sensible Heat Transfer (Q = mcΔT) Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    governingFormula: 'Q (kJ) = (m * c * (T_final - T_initial)) / 1000',
    independentDerivation: 'Sensible enthalpy change equation in kilojoules.',
    independentCalculate: (inputs) => {
      const dt = Number(inputs.finalTempC) - Number(inputs.initialTempC);
      return (Number(inputs.massKg) * Number(inputs.specificHeat) * dt) / 1000;
    },
    testCases: [
      { name: '10 kg water heated from 20C to 80C (c=4184)', inputs: { massKg: 10, specificHeat: 4184, initialTempC: 20, finalTempC: 80 }, expectedPrimary: 2510, tolerance: 5 },
      { name: 'Cooling 5 kg steel by 50C (c=490)', inputs: { massKg: 5, specificHeat: 490, initialTempC: 75, finalTempC: 25 }, expectedPrimary: -122.5, tolerance: 1.0, isBoundary: true }
    ]
  },

  // 36. Linear Thermal Expansion Calculator
  'thermal-expansion-calc': {
    id: 'thermal-expansion-calc',
    name: 'Linear Thermal Expansion Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    governingFormula: 'Delta L (mm) = alpha * L * Delta T * 1000',
    independentDerivation: 'First-order thermal expansion of solid isotropic materials in millimeters.',
    independentCalculate: (inputs) => {
      const alpha = Number(inputs.material);
      const l = Number(inputs.initialLengthMeters);
      const dt = Number(inputs.deltaTempC);
      return alpha * l * dt * 1000;
    },
    testCases: [
      { name: '50m steel bridge span heated by 40C (alpha = 12e-6)', inputs: { initialLengthMeters: 50, deltaTempC: 40, material: '0.000012' }, expectedPrimary: 24.0, tolerance: 0.1 },
      { name: '100m aluminum pipeline under 50C Delta T', inputs: { initialLengthMeters: 100, deltaTempC: 50, material: '0.000023' }, expectedPrimary: 115.0, tolerance: 0.5, isBoundary: true }
    ]
  },

  // 37. Ideal Gas Law (PV = nRT) Solver
  'ideal-gas-law-calc': {
    id: 'ideal-gas-law-calc',
    name: 'Ideal Gas Law (PV = nRT) Solver',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    governingFormula: 'P (kPa) = ((n * 8.31446 * (tempC + 273.15)) / (V_L * 1e-3)) / 1000',
    independentDerivation: 'Classical ideal gas equation of state in kilopascals.',
    independentCalculate: (inputs) => {
      const n = Number(inputs.moles);
      const vM3 = Number(inputs.volumeLiters) * 1e-3;
      const tK = Number(inputs.tempCelsius) + 273.15;
      const r = 8.31446;
      return ((n * r * tK) / vM3) / 1000;
    },
    testCases: [
      { name: '2.5 moles in 10L cylinder at 25C', inputs: { moles: 2.5, volumeLiters: 10, tempCelsius: 25 }, expectedPrimary: 619.7, tolerance: 2.0 },
      { name: '1 mole in 22.414L at 0C (STP)', inputs: { moles: 1.0, volumeLiters: 22.414, tempCelsius: 0 }, expectedPrimary: 101.3, tolerance: 0.5, isBoundary: true }
    ]
  },

  // 38. Carnot Heat Engine Maximum Efficiency Calculator
  'carnot-efficiency-calc': {
    id: 'carnot-efficiency-calc',
    name: 'Carnot Heat Engine Maximum Efficiency Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    governingFormula: 'eta = (1 - (Tc_K / Th_K)) * 100',
    independentDerivation: 'Second law of thermodynamics maximum theoretical reversible thermal efficiency.',
    independentCalculate: (inputs) => {
      const thK = Number(inputs.hotReservoirC) + 273.15;
      const tcK = Number(inputs.coldReservoirC) + 273.15;
      return (1 - tcK / thK) * 100;
    },
    testCases: [
      { name: 'Hot 500C (773.15K) and Cold 25C (298.15K)', inputs: { hotReservoirC: 500, coldReservoirC: 25 }, expectedPrimary: 61.4, tolerance: 0.2 },
      { name: 'Steam turbine 350C and condenser 35C', inputs: { hotReservoirC: 350, coldReservoirC: 35 }, expectedPrimary: 50.55, tolerance: 0.2, isBoundary: true }
    ]
  },

  // ==========================================
  // EVERYDAY CALCULATORS (14)
  // ==========================================

  // 39. Tip & Bill Split Calculator
  'tip-split': {
    id: 'tip-split',
    name: 'Tip & Bill Split Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    governingFormula: 'Per Person = (Bill * (1 + Tip% / 100)) / Guests',
    independentDerivation: 'Uniform group split with gratuity.',
    independentCalculate: (inputs) => {
      const bill = Number(inputs.billAmount);
      const tipPct = Number(inputs.tipPercent);
      const guests = Math.max(1, Number(inputs.guests || 1));
      const total = bill + bill * (tipPct / 100);
      return Math.round((total / guests) * 100) / 100;
    },
    testCases: [
      { name: '$84 bill with 20% tip split between 3 guests', inputs: { billAmount: 84.0, tipPercent: 20, guests: 3 }, expectedPrimary: 33.60, tolerance: 0.05 },
      { name: 'Solo dining $25 with 15% tip', inputs: { billAmount: 25.0, tipPercent: 15, guests: 1 }, expectedPrimary: 28.75, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 40. Discount & Sales Tax Calculator
  'discount-tax': {
    id: 'discount-tax',
    name: 'Discount & Sales Tax Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    governingFormula: 'Final = Original * (1 - D%) * (1 + Tax%)',
    independentDerivation: 'Standard retail promotion followed by post-discount sales tax application.',
    independentCalculate: (inputs) => {
      const orig = Number(inputs.originalPrice);
      const discPct = Number(inputs.discountPercent);
      const taxPct = Number(inputs.taxPercent);
      const discounted = orig * (1 - discPct / 100);
      return Math.round((discounted * (1 + taxPct / 100)) * 100) / 100;
    },
    testCases: [
      { name: '$80 retail with 25% discount and 8.25% sales tax', inputs: { originalPrice: 80.0, discountPercent: 25, taxPercent: 8.25 }, expectedPrimary: 64.95, tolerance: 0.05 },
      { name: 'Zero discount full tax on $100', inputs: { originalPrice: 100, discountPercent: 0, taxPercent: 7.0 }, expectedPrimary: 107.0, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 41. Group Restaurant Bill & Tax Split Calculator
  'group-split-bill-calc': {
    id: 'group-split-bill-calc',
    name: 'Group Restaurant Bill & Tax Split Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    governingFormula: 'Per Person = [Subtotal * (1 + Tax% + Tip%)] / Guests',
    independentDerivation: 'Group dining equal distribution model.',
    independentCalculate: (inputs) => {
      const subtotal = Number(inputs.foodSubtotal);
      const taxRate = Number(inputs.taxRatePct) / 100;
      const tipRate = Number(inputs.tipRatePct) / 100;
      const guests = Number(inputs.numberOfGuests);
      return (subtotal + subtotal * taxRate + subtotal * tipRate) / guests;
    },
    testCases: [
      { name: '$180 subtotal, 8.5% tax, 20% tip for 4 guests', inputs: { foodSubtotal: 180, taxRatePct: 8.5, tipRatePct: 20, numberOfGuests: 4 }, expectedPrimary: 57.825, tolerance: 0.05 },
      { name: 'Large banquet $1000 for 10 people', inputs: { foodSubtotal: 1000, taxRatePct: 10, tipRatePct: 18, numberOfGuests: 10 }, expectedPrimary: 128.0, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 42. Food Delivery Driver Tip Calculator
  'food-delivery-tip-calc': {
    id: 'food-delivery-tip-calc',
    name: 'Food Delivery Driver Tip Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    governingFormula: 'Tip = max(4.00, 15% Subtotal + (Miles > 2 * $1.50) + Weather)',
    independentDerivation: 'Gig-economy mileage buffer plus baseline tipping guideline.',
    independentCalculate: (inputs) => {
      const subtotal = Number(inputs.orderSubtotal);
      const miles = Number(inputs.drivingDistanceMiles);
      const cond = inputs.weatherCondition;
      const basePct = subtotal * 0.15;
      const dist = Math.max(0, miles - 2) * 1.50;
      let weather = 0;
      if (cond === 'rain') weather = 2;
      if (cond === 'severe') weather = 4;
      return Math.max(4.00, basePct + dist + weather);
    },
    testCases: [
      { name: '$35 order, 4.5 miles, fair weather', inputs: { orderSubtotal: 35, drivingDistanceMiles: 4.5, weatherCondition: 'standard' }, expectedPrimary: 9.0, tolerance: 0.05 },
      { name: 'Small $10 order nearby in snow (hits minimum)', inputs: { orderSubtotal: 10, drivingDistanceMiles: 1.0, weatherCondition: 'severe' }, expectedPrimary: 5.50, tolerance: 0.05, isBoundary: true }
    ]
  },

  // 43. Bar Tab & Per-Drink Gratuity Calculator
  'bar-tab-drink-calc': {
    id: 'bar-tab-drink-calc',
    name: 'Bar Tab & Per-Drink Gratuity Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    governingFormula: 'Tip = max(Drinks * $2.00, Tab * 20%)',
    independentDerivation: 'Standard industry maximum of $2/drink rule vs percentage rule.',
    independentCalculate: (inputs) => {
      const drinks = Number(inputs.drinksCount);
      const tab = Number(inputs.barSubtotal);
      return Math.max(drinks * 2.00, tab * 0.20);
    },
    testCases: [
      { name: '6 drinks on $65 tab ($13 vs $12 -> $13)', inputs: { drinksCount: 6, barSubtotal: 65 }, expectedPrimary: 13.0, tolerance: 0.01 },
      { name: '10 cheap $3 draft beers ($30 tab -> $20 per drink tip dominates)', inputs: { drinksCount: 10, barSubtotal: 30 }, expectedPrimary: 20.0, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 44. Stackable Double Discount Calculator
  'double-discount-calc': {
    id: 'double-discount-calc',
    name: 'Stackable Double Discount & Markdown Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    governingFormula: 'P_final = Original * (1 - D1%) * (1 - D2%)',
    independentDerivation: 'Sequential compounded percentage reductions.',
    independentCalculate: (inputs) => {
      const orig = Number(inputs.originalPrice);
      const d1 = Number(inputs.firstDiscountPct) / 100;
      const d2 = Number(inputs.secondDiscountPct) / 100;
      return orig * (1 - d1) * (1 - d2);
    },
    testCases: [
      { name: '$120 original, 40% clearance + 20% coupon', inputs: { originalPrice: 120, firstDiscountPct: 40, secondDiscountPct: 20 }, expectedPrimary: 57.60, tolerance: 0.05 },
      { name: '50% off + 50% off (yields 25% final price, NOT free)', inputs: { originalPrice: 100, firstDiscountPct: 50, secondDiscountPct: 50 }, expectedPrimary: 25.0, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 45. Grocery Unit Price Comparison Calculator
  'unit-price-comparison-calc': {
    id: 'unit-price-comparison-calc',
    name: 'Grocery Unit Price & Best Value Comparison',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    governingFormula: 'Unit Price = Price / Quantity; Winner = min(Unit1, Unit2)',
    independentDerivation: 'Normalized cost comparison per unit weight or count.',
    independentCalculate: (inputs) => {
      const u1 = Number(inputs.item1Price) / Number(inputs.item1Ounces);
      const u2 = Number(inputs.item2Price) / Number(inputs.item2Ounces);
      return Math.min(u1, u2);
    },
    testCases: [
      { name: 'Item A: $4.99 for 16 oz vs Item B: $7.49 for 28 oz', inputs: { item1Price: 4.99, item1Ounces: 16, item2Price: 7.49, item2Ounces: 28 }, expectedPrimary: 0.2675, tolerance: 0.01 },
      { name: 'Identical unit cost', inputs: { item1Price: 5.0, item1Ounces: 10, item2Price: 10.0, item2Ounces: 20 }, expectedPrimary: 0.50, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 46. Credit Card Cash Back & Rebate Calculator
  'cash-back-rebate-calc': {
    id: 'cash-back-rebate-calc',
    name: 'Credit Card Cash Back & Rebate Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    governingFormula: 'Annual Reward = Monthly Spend * 12 * (Reward Rate% / 100)',
    independentDerivation: 'Linear reward accrual on credit expenditures.',
    independentCalculate: (inputs) => {
      return Number(inputs.monthlySpend) * 12 * (Number(inputs.rewardRatePct) / 100);
    },
    testCases: [
      { name: '$2500 monthly spend at 2% cash back', inputs: { monthlySpend: 2500, rewardRatePct: 2.0 }, expectedPrimary: 600, tolerance: 0.01 },
      { name: 'High spend $10,000 at 5% bonus category', inputs: { monthlySpend: 10000, rewardRatePct: 5.0 }, expectedPrimary: 6000, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 47. Road Trip Gas Cost & Passenger Split Calculator
  'road-trip-fuel-calc': {
    id: 'road-trip-fuel-calc',
    name: 'Road Trip Gas Cost & Passenger Split Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    governingFormula: 'Per Person = ((Miles / MPG) * GasPrice) / Travelers',
    independentDerivation: 'Fuel consumption over journey distance divided among passengers.',
    independentCalculate: (inputs) => {
      const gallons = Number(inputs.roundTripMiles) / Number(inputs.vehicleMPG);
      const total = gallons * Number(inputs.gasPricePerGallon);
      return total / Number(inputs.passengers);
    },
    testCases: [
      { name: '650 miles at 28 MPG, $3.65/gal, split between 3 passengers', inputs: { roundTripMiles: 650, vehicleMPG: 28, gasPricePerGallon: 3.65, passengers: 3 }, expectedPrimary: 28.24, tolerance: 0.1 },
      { name: 'Solo road trip 1200 miles in 40 MPG hybrid at $4.00/gal', inputs: { roundTripMiles: 1200, vehicleMPG: 40, gasPricePerGallon: 4.00, passengers: 1 }, expectedPrimary: 120.0, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 48. Fuel Economy & Cost per Mile Calculator
  'mpg-cost-per-mile-calc': {
    id: 'mpg-cost-per-mile-calc',
    name: 'Fuel Economy & Cost per Mile Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    governingFormula: 'Cost per Mile = Gas Price / MPG',
    independentDerivation: 'Direct operating fuel cost metric.',
    independentCalculate: (inputs) => {
      return Number(inputs.gasPrice) / Number(inputs.mpg);
    },
    testCases: [
      { name: '25 MPG vehicle at $3.50/gal', inputs: { mpg: 25, gasPrice: 3.50, annualMiles: 12000 }, expectedPrimary: 0.14, tolerance: 0.01 },
      { name: '10 MPG heavy truck at $4.50/gal', inputs: { mpg: 10, gasPrice: 4.50, annualMiles: 15000 }, expectedPrimary: 0.45, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 49. EV vs Gas Car Annual Fuel Savings Calculator
  'ev-vs-gas-savings-calc': {
    id: 'ev-vs-gas-savings-calc',
    name: 'EV vs Gas Car Annual Fuel Savings Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    governingFormula: 'Gas Cost - EV Cost',
    independentDerivation: 'Comparison of liquid fuel vs 30 kWh/100mi average electric consumption.',
    independentCalculate: (inputs) => {
      const miles = Number(inputs.annualMiles);
      const gasCost = (miles / Number(inputs.gasCarMPG)) * Number(inputs.gasPrice);
      const evCost = miles * 0.30 * Number(inputs.electricityRate);
      return gasCost - evCost;
    },
    testCases: [
      { name: '13,500 miles, 27 MPG gas car at $3.75/gal vs EV at $0.15/kWh', inputs: { annualMiles: 13500, gasCarMPG: 27, gasPrice: 3.75, electricityRate: 0.15 }, expectedPrimary: 1267.50, tolerance: 1.0 },
      { name: 'High gas price $5.50 and cheap off-peak electric $0.10', inputs: { annualMiles: 15000, gasCarMPG: 25, gasPrice: 5.50, electricityRate: 0.10 }, expectedPrimary: 2850.0, tolerance: 2.0, isBoundary: true }
    ]
  },

  // 50. Recipe Serving Scaling & Multiplier Calculator
  'recipe-multiplier-calc': {
    id: 'recipe-multiplier-calc',
    name: 'Recipe Serving Scaling & Multiplier Calculator',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    governingFormula: 'Multiplier = Target Servings / Original Servings',
    independentDerivation: 'Linear proportion culinary scaling rule.',
    independentCalculate: (inputs) => {
      return Number(inputs.targetServings) / Number(inputs.originalServings);
    },
    testCases: [
      { name: 'Scale from 4 servings to 10 servings', inputs: { originalServings: 4, targetServings: 10, sampleIngredientQty: 2.0 }, expectedPrimary: 2.5, tolerance: 0.01 },
      { name: 'Scale down from 12 servings to 3 servings', inputs: { originalServings: 12, targetServings: 3, sampleIngredientQty: 4.0 }, expectedPrimary: 0.25, tolerance: 0.01, isBoundary: true }
    ]
  },

  // 51. Baker's Percentage & Bread Hydration Calculator
  'bakers-percentage-calc': {
    id: 'bakers-percentage-calc',
    name: "Baker's Percentage & Bread Hydration Calculator",
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    governingFormula: 'Water = Flour * Hydration%',
    independentDerivation: 'Standard artisan bakery baker percentages where flour weight is always 100%.',
    independentCalculate: (inputs) => {
      return Number(inputs.flourGrams) * (Number(inputs.hydrationPct) / 100);
    },
    testCases: [
      { name: '500g flour at 72% hydration', inputs: { flourGrams: 500, hydrationPct: 72, saltPct: 2.0 }, expectedPrimary: 360, tolerance: 0.1 },
      { name: '1000g flour at 80% high hydration ciabatta', inputs: { flourGrams: 1000, hydrationPct: 80, saltPct: 2.2 }, expectedPrimary: 800, tolerance: 0.1, isBoundary: true }
    ]
  },

  // 52. Roast Cooking Time per Pound Calculator
  'cooking-time-per-pound-calc': {
    id: 'cooking-time-per-pound-calc',
    name: 'Roast Cooking Time per Pound Calculator',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    governingFormula: 'Total Minutes = Weight (lbs) * MinutesPerPound',
    independentDerivation: 'Roasting timeline based on USDA culinary weight guidelines.',
    independentCalculate: (inputs) => {
      return Number(inputs.weightLbs) * Number(inputs.meatType);
    },
    testCases: [
      { name: '14 lb turkey at 15 min/lb', inputs: { meatType: '15', weightLbs: 14 }, expectedPrimary: 210, tolerance: 0.01 },
      { name: '6 lb prime rib roast at 18 min/lb', inputs: { meatType: '18', weightLbs: 6 }, expectedPrimary: 108, tolerance: 0.01, isBoundary: true }
    ]
  }
};
