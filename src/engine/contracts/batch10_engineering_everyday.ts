import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH10_CONTRACTS: CalculationContract<any, any>[] = [
  // ==========================================
  // ENGINEERING CONTRACTS (18)
  // ==========================================

  // 1. Reynolds Number Fluid Flow Calculator
  {
    id: 'reynolds-number-calc',
    name: 'Reynolds Number Fluid Flow Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: 'Reynolds Number',
      formulaExpression: 'Re = (ρ × v × D) / μ',
      variables: [{ symbol: 'Re', name: 'Dimensionless Reynolds Number' }]
    },
    inputSchema: {
      fields: [
        { name: 'velocity', label: 'Flow Velocity (m/s)', type: 'number', required: true, defaultValue: 2.0, min: 0.01 },
        { name: 'pipeDiameterMeters', label: 'Internal Pipe Diameter (meters)', type: 'number', required: true, defaultValue: 0.05, min: 0.001 },
        { name: 'fluidDensity', label: 'Fluid Density (kg/m³, water ~1000)', type: 'number', required: true, defaultValue: 1000, min: 1 },
        { name: 'dynamicViscosity', label: 'Dynamic Viscosity (Pa·s, water ~0.001)', type: 'number', required: true, defaultValue: 0.001, min: 0.00001 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { velocity: number; pipeDiameterMeters: number; fluidDensity: number; dynamicViscosity: number }) => {
      const re = (inputs.fluidDensity * inputs.velocity * inputs.pipeDiameterMeters) / inputs.dynamicViscosity;
      let regime = 'Laminar Flow (Re < 2300)';
      if (re > 4000) regime = 'Turbulent Flow (Re > 4000)';
      else if (re >= 2300) regime = 'Transitional Flow (2300 <= Re <= 4000)';
      return { re: Math.round(re), regime };
    },
    formatResult: (res: { re: number; regime: string }) => ({
      primary: {
        label: 'Reynolds Number (Re)',
        value: `${ResultFormatter.formatInteger(res.re)}`,
        numericValue: res.re
      },
      secondary: [
        { label: 'Flow Regime', value: res.regime }
      ]
    })
  },

  // 2. Pipe Flow Rate & Velocity Calculator
  {
    id: 'pipe-flow-velocity-calc',
    name: 'Pipe Flow Rate & Velocity Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: 'Pipe Volumetric Flow',
      formulaExpression: 'Q = A × v = (π × D² / 4) × v',
      variables: [{ symbol: 'Q', name: 'Flow Rate' }]
    },
    inputSchema: {
      fields: [
        { name: 'diameterInches', label: 'Inside Pipe Diameter (inches)', type: 'number', required: true, defaultValue: 2.0, min: 0.25 },
        { name: 'velocityFtSec', label: 'Fluid Velocity (feet/sec)', type: 'number', required: true, defaultValue: 5.0, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { diameterInches: number; velocityFtSec: number }) => {
      const radiusFt = inputs.diameterInches / 2 / 12;
      const areaSqFt = Math.PI * radiusFt * radiusFt;
      const cuFtSec = areaSqFt * inputs.velocityFtSec;
      const gpm = cuFtSec * 448.831;
      return { gpm, cuFtSec, areaSqFt };
    },
    formatResult: (res: { gpm: number; cuFtSec: number; areaSqFt: number }) => ({
      primary: {
        label: 'Volumetric Flow Rate',
        value: `${res.gpm.toFixed(1)} GPM (Gallons/Min)`,
        numericValue: res.gpm
      },
      secondary: [
        { label: 'Cubic Feet per Second (CFS)', value: `${res.cuFtSec.toFixed(3)} ft³/s` },
        { label: 'Pipe Cross-Sectional Area', value: `${(res.areaSqFt * 144).toFixed(2)} sq in` }
      ]
    })
  },

  // 3. Bernoulli Dynamic Pressure Calculator
  {
    id: 'bernoulli-pressure-calc',
    name: 'Bernoulli Dynamic Pressure & Velocity Head Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: 'Bernoulli Dynamic Pressure',
      formulaExpression: 'P_dyn = 0.5 × ρ × v²',
      variables: [{ symbol: 'P_dyn', name: 'Dynamic Pressure', unit: 'Pa' }]
    },
    inputSchema: {
      fields: [
        { name: 'velocityMps', label: 'Fluid Velocity (m/s)', type: 'number', required: true, defaultValue: 15, min: 0.1 },
        { name: 'densityKgM3', label: 'Fluid Density (kg/m³, air ~1.225, water ~1000)', type: 'number', required: true, defaultValue: 1.225, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { velocityMps: number; densityKgM3: number }) => {
      const dynamicPressurePascals = 0.5 * inputs.densityKgM3 * Math.pow(inputs.velocityMps, 2);
      const psi = dynamicPressurePascals * 0.000145038;
      return { dynamicPressurePascals, psi };
    },
    formatResult: (res: { dynamicPressurePascals: number; psi: number }) => ({
      primary: {
        label: 'Dynamic Fluid Pressure',
        value: `${res.dynamicPressurePascals.toFixed(1)} Pascals`,
        numericValue: res.dynamicPressurePascals
      },
      secondary: [
        { label: 'Equivalent in PSI', value: `${res.psi.toFixed(4)} PSI` }
      ]
    })
  },

  // 4. Hydraulic Pump Power (HP) Calculator
  {
    id: 'hydraulic-pump-hp-calc',
    name: 'Hydraulic Pump Power (HP) Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: 'Hydraulic Horsepower',
      formulaExpression: 'HP = (PSI × GPM) / (1714 × Efficiency)',
      variables: [{ symbol: 'HP', name: 'Shaft Input Horsepower' }]
    },
    inputSchema: {
      fields: [
        { name: 'pressurePSI', label: 'Operating Pressure (PSI)', type: 'number', required: true, defaultValue: 3000, min: 100 },
        { name: 'flowGPM', label: 'Flow Rate (GPM)', type: 'number', required: true, defaultValue: 15, min: 1 },
        { name: 'efficiencyPct', label: 'Pump Mechanical Efficiency (%)', type: 'percentage', required: true, defaultValue: 85, min: 50, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { pressurePSI: number; flowGPM: number; efficiencyPct: number }) => {
      const eff = inputs.efficiencyPct / 100;
      const fluidHP = (inputs.pressurePSI * inputs.flowGPM) / 1714;
      const brakeHP = fluidHP / eff;
      const electricKW = brakeHP * 0.7457;
      return { brakeHP, fluidHP, electricKW };
    },
    formatResult: (res: { brakeHP: number; fluidHP: number; electricKW: number }) => ({
      primary: {
        label: 'Required Drive Motor Power',
        value: `${res.brakeHP.toFixed(1)} HP`,
        numericValue: res.brakeHP
      },
      secondary: [
        { label: 'Fluid Output Power', value: `${res.fluidHP.toFixed(1)} Fluid HP` },
        { label: 'Electrical Equivalent', value: `${res.electricKW.toFixed(1)} kW` }
      ]
    })
  },

  // 5. Poiseuille Pipe Flow Resistance Calculator
  {
    id: 'poiseuille-flow-calc',
    name: 'Poiseuille Pipe Flow Resistance Calculator',
    category: 'engineering',
    subcategoryId: 'hydraulics-fluid',
    formulaMeta: {
      formulaName: 'Hagen-Poiseuille Equation',
      formulaExpression: 'ΔP = (8 × μ × L × Q) / (π × r⁴)',
      variables: [{ symbol: 'ΔP', name: 'Pressure Loss', unit: 'kPa' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthMeters', label: 'Pipe Length (meters)', type: 'number', required: true, defaultValue: 25, min: 1 },
        { name: 'radiusMm', label: 'Internal Tube Radius (mm)', type: 'number', required: true, defaultValue: 5, min: 0.5 },
        { name: 'viscosityMpa', label: 'Dynamic Viscosity (mPa·s, water ~1.0, oil ~100)', type: 'number', required: true, defaultValue: 1.0, min: 0.1 },
        { name: 'flowLpm', label: 'Flow Rate (Liters/minute)', type: 'number', required: true, defaultValue: 10, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthMeters: number; radiusMm: number; viscosityMpa: number; flowLpm: number }) => {
      const r = inputs.radiusMm * 1e-3;
      const mu = inputs.viscosityMpa * 1e-3;
      const Q = (inputs.flowLpm * 1e-3) / 60;
      const deltaP = (8 * mu * inputs.lengthMeters * Q) / (Math.PI * Math.pow(r, 4));
      const kpa = deltaP / 1000;
      return { kpa, deltaP };
    },
    formatResult: (res: { kpa: number; deltaP: number }) => ({
      primary: {
        label: 'Viscous Pressure Drop',
        value: `${res.kpa.toFixed(2)} kPa`,
        numericValue: res.kpa
      },
      secondary: [
        { label: 'Absolute Loss', value: `${Math.round(res.deltaP)} N/m² (Pascals)` }
      ]
    })
  },

  // 6. Torque, Horsepower & RPM Calculator
  {
    id: 'torque-hp-rpm-calc',
    name: 'Torque, Horsepower & RPM Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: 'Rotational Mechanical Power',
      formulaExpression: 'HP = (Torque lb-ft × RPM) / 5252',
      variables: [{ symbol: 'HP', name: 'Horsepower' }]
    },
    inputSchema: {
      fields: [
        { name: 'torqueLbFt', label: 'Torque (lb-ft)', type: 'number', required: true, defaultValue: 350, min: 1 },
        { name: 'rpm', label: 'Rotational Speed (RPM)', type: 'number', required: true, defaultValue: 5000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { torqueLbFt: number; rpm: number }) => {
      const hp = (inputs.torqueLbFt * inputs.rpm) / 5252;
      const torqueNm = inputs.torqueLbFt * 1.35582;
      const powerKW = hp * 0.7457;
      return { hp, torqueNm, powerKW };
    },
    formatResult: (res: { hp: number; torqueNm: number; powerKW: number }) => ({
      primary: {
        label: 'Mechanical Horsepower',
        value: `${res.hp.toFixed(1)} HP`,
        numericValue: res.hp
      },
      secondary: [
        { label: 'Torque in Metric', value: `${res.torqueNm.toFixed(1)} N·m` },
        { label: 'Power in Kilowatts', value: `${res.powerKW.toFixed(1)} kW` }
      ]
    })
  },

  // 7. Centripetal Force & Acceleration Calculator
  {
    id: 'centrifugal-force-calc',
    name: 'Centripetal Force & Acceleration Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: 'Centripetal Dynamics',
      formulaExpression: 'Fc = (m × v²) / r; a = v² / r',
      variables: [{ symbol: 'Fc', name: 'Centripetal Force', unit: 'N' }]
    },
    inputSchema: {
      fields: [
        { name: 'massKg', label: 'Object Mass (kg)', type: 'number', required: true, defaultValue: 1200, min: 0.1 },
        { name: 'velocityMps', label: 'Linear Velocity (m/s)', type: 'number', required: true, defaultValue: 25, min: 0.1 },
        { name: 'radiusMeters', label: 'Turn Radius (meters)', type: 'number', required: true, defaultValue: 50, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { massKg: number; velocityMps: number; radiusMeters: number }) => {
      const accel = Math.pow(inputs.velocityMps, 2) / inputs.radiusMeters;
      const forceN = inputs.massKg * accel;
      const gForce = accel / 9.80665;
      return { forceN, accel, gForce };
    },
    formatResult: (res: { forceN: number; accel: number; gForce: number }) => ({
      primary: {
        label: 'Centripetal Force Required',
        value: `${ResultFormatter.formatInteger(Math.round(res.forceN))} Newtons`,
        numericValue: res.forceN
      },
      secondary: [
        { label: 'Lateral Acceleration', value: `${res.accel.toFixed(1)} m/s²` },
        { label: 'Centrifugal Load', value: `${res.gForce.toFixed(2)} Gs` }
      ]
    })
  },

  // 8. Hooke's Law Spring Force Calculator
  {
    id: 'mechanical-spring-calc',
    name: "Hooke's Law Spring Force & Energy Calculator",
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: "Hooke's Law",
      formulaExpression: 'F = k × x; PE = 0.5 × k × x²',
      variables: [{ symbol: 'F', name: 'Restoring Force', unit: 'N' }]
    },
    inputSchema: {
      fields: [
        { name: 'springRateK', label: 'Spring Rate k (N/m)', type: 'number', required: true, defaultValue: 500, min: 1 },
        { name: 'displacementMeters', label: 'Displacement / Compression x (meters)', type: 'number', required: true, defaultValue: 0.08, min: 0.001 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { springRateK: number; displacementMeters: number }) => {
      const forceN = inputs.springRateK * inputs.displacementMeters;
      const energyJoules = 0.5 * inputs.springRateK * Math.pow(inputs.displacementMeters, 2);
      const forceLbs = forceN * 0.224809;
      return { forceN, energyJoules, forceLbs };
    },
    formatResult: (res: { forceN: number; energyJoules: number; forceLbs: number }) => ({
      primary: {
        label: 'Spring Restoring Force',
        value: `${res.forceN.toFixed(1)} N (${res.forceLbs.toFixed(1)} lbf)`,
        numericValue: res.forceN
      },
      secondary: [
        { label: 'Stored Elastic Potential Energy', value: `${res.energyJoules.toFixed(2)} Joules` }
      ]
    })
  },

  // 9. Gear Ratio & Mechanical Advantage Calculator
  {
    id: 'gear-ratio-calc',
    name: 'Gear Ratio & Mechanical Advantage Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: 'Gear Train Ratio',
      formulaExpression: 'Ratio = N_driven / N_driver; Output Speed = Input RPM / Ratio',
      variables: [{ symbol: 'Ratio', name: 'Speed/Torque Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'driverTeeth', label: 'Driver Gear (Input Teeth)', type: 'integer', required: true, defaultValue: 14, min: 5 },
        { name: 'drivenTeeth', label: 'Driven Gear (Output Teeth)', type: 'integer', required: true, defaultValue: 42, min: 5 },
        { name: 'inputRPM', label: 'Input Motor Speed (RPM)', type: 'number', required: true, defaultValue: 1800, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { driverTeeth: number; drivenTeeth: number; inputRPM: number }) => {
      const gearRatio = inputs.drivenTeeth / inputs.driverTeeth;
      const outputRPM = inputs.inputRPM / gearRatio;
      const torqueMultiplier = gearRatio;
      return { gearRatio, outputRPM, torqueMultiplier };
    },
    formatResult: (res: { gearRatio: number; outputRPM: number; torqueMultiplier: number }) => ({
      primary: {
        label: 'Gear Ratio',
        value: `${res.gearRatio.toFixed(2)} : 1 (Torque Multiplier ${res.torqueMultiplier.toFixed(2)}x)`,
        numericValue: res.gearRatio
      },
      secondary: [
        { label: 'Output Rotational Speed', value: `${Math.round(res.outputRPM)} RPM` }
      ]
    })
  },

  // 10. Simple Pendulum Oscillation Period Calculator
  {
    id: 'pendulum-period-calc',
    name: 'Simple Pendulum Oscillation Period Calculator',
    category: 'engineering',
    subcategoryId: 'mechanics-energy',
    formulaMeta: {
      formulaName: 'Harmonic Pendulum Period',
      formulaExpression: 'T = 2 × π × √(L / g)',
      variables: [{ symbol: 'T', name: 'Oscillation Period', unit: 's' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthMeters', label: 'Pendulum String Length (meters)', type: 'number', required: true, defaultValue: 1.0, min: 0.05 },
        { name: 'gravity', label: 'Gravitational Acceleration g (m/s²)', type: 'number', required: true, defaultValue: 9.80665, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthMeters: number; gravity: number }) => {
      const periodSec = 2 * Math.PI * Math.sqrt(inputs.lengthMeters / inputs.gravity);
      const frequencyHz = 1 / periodSec;
      return { periodSec, frequencyHz };
    },
    formatResult: (res: { periodSec: number; frequencyHz: number }) => ({
      primary: {
        label: 'Pendulum Period (T)',
        value: `${res.periodSec.toFixed(3)} seconds`,
        numericValue: res.periodSec
      },
      secondary: [
        { label: 'Harmonic Frequency', value: `${res.frequencyHz.toFixed(3)} Hz (cycles/sec)` }
      ]
    })
  },

  // 11. Beam Bending Stress (Flexure) Calculator
  {
    id: 'beam-bending-stress-calc',
    name: 'Beam Bending Stress (Flexure) Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    formulaMeta: {
      formulaName: 'Flexure Formula',
      formulaExpression: 'σ = (M × y) / I',
      variables: [{ symbol: 'σ', name: 'Bending Stress', unit: 'PSI' }]
    },
    inputSchema: {
      fields: [
        { name: 'bendingMomentLbIn', label: 'Bending Moment M (lb-in)', type: 'number', required: true, defaultValue: 45000, min: 100 },
        { name: 'distanceYInches', label: 'Distance from Neutral Axis y (inches)', type: 'number', required: true, defaultValue: 3.5, min: 0.1 },
        { name: 'momentOfInertiaI', label: 'Moment of Inertia I (in⁴)', type: 'number', required: true, defaultValue: 42.5, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { bendingMomentLbIn: number; distanceYInches: number; momentOfInertiaI: number }) => {
      const stressPSI = (inputs.bendingMomentLbIn * inputs.distanceYInches) / inputs.momentOfInertiaI;
      const stressMPa = stressPSI * 0.00689476;
      return { stressPSI, stressMPa };
    },
    formatResult: (res: { stressPSI: number; stressMPa: number }) => ({
      primary: {
        label: 'Peak Flexural Bending Stress',
        value: `${ResultFormatter.formatInteger(Math.round(res.stressPSI))} PSI`,
        numericValue: res.stressPSI
      },
      secondary: [
        { label: 'Metric Equivalent', value: `${res.stressMPa.toFixed(1)} MPa` }
      ]
    })
  },

  // 12. Cantilever Beam Deflection Calculator
  {
    id: 'cantilever-deflection-calc',
    name: 'Cantilever Beam Deflection Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    formulaMeta: {
      formulaName: 'Tip Load Deflection',
      formulaExpression: 'δ_max = (P × L³) / (3 × E × I)',
      variables: [{ symbol: 'δ', name: 'Tip Deflection', unit: 'inches' }]
    },
    inputSchema: {
      fields: [
        { name: 'pointLoadLbs', label: 'End Point Load P (lbs)', type: 'number', required: true, defaultValue: 1000, min: 10 },
        { name: 'lengthInches', label: 'Beam Span L (inches)', type: 'number', required: true, defaultValue: 72, min: 12 },
        { name: 'elasticModulusPSI', label: 'Modulus of Elasticity E (PSI, Steel ~29,000,000)', type: 'number', required: true, defaultValue: 29000000, min: 100000 },
        { name: 'momentOfInertia', label: 'Moment of Inertia I (in⁴)', type: 'number', required: true, defaultValue: 25, min: 0.5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { pointLoadLbs: number; lengthInches: number; elasticModulusPSI: number; momentOfInertia: number }) => {
      const deflectionInches = (inputs.pointLoadLbs * Math.pow(inputs.lengthInches, 3)) / (3 * inputs.elasticModulusPSI * inputs.momentOfInertia);
      const spanRatio = inputs.lengthInches / deflectionInches;
      return { deflectionInches, spanRatio };
    },
    formatResult: (res: { deflectionInches: number; spanRatio: number }) => ({
      primary: {
        label: 'Maximum End Deflection',
        value: `${res.deflectionInches.toFixed(3)} inches`,
        numericValue: res.deflectionInches
      },
      secondary: [
        { label: 'Deflection Ratio', value: `L / ${Math.round(res.spanRatio)}` }
      ]
    })
  },

  // 13. Euler Critical Column Buckling Calculator
  {
    id: 'euler-column-buckling-calc',
    name: 'Euler Critical Column Buckling Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    formulaMeta: {
      formulaName: 'Euler Buckling Formula',
      formulaExpression: 'P_cr = (π² × E × I) / (K × L)²',
      variables: [{ symbol: 'P_cr', name: 'Critical Buckling Load', unit: 'lbs' }]
    },
    inputSchema: {
      fields: [
        { name: 'lengthInches', label: 'Column Unsupported Height (inches)', type: 'number', required: true, defaultValue: 120, min: 12 },
        { name: 'elasticModulus', label: 'Modulus of Elasticity E (PSI, Steel 29M)', type: 'number', required: true, defaultValue: 29000000, min: 100000 },
        { name: 'momentOfInertia', label: 'Weak-Axis Moment of Inertia I (in⁴)', type: 'number', required: true, defaultValue: 12.0, min: 0.1 },
        { name: 'endConditionK', label: 'End Fixity Factor K (Pinned-Pinned = 1.0, Fixed-Fixed = 0.5)', type: 'number', required: true, defaultValue: 1.0, min: 0.5, max: 2.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lengthInches: number; elasticModulus: number; momentOfInertia: number; endConditionK: number }) => {
      const effectiveLength = inputs.endConditionK * inputs.lengthInches;
      const criticalLoadLbs = (Math.PI * Math.PI * inputs.elasticModulus * inputs.momentOfInertia) / Math.pow(effectiveLength, 2);
      const criticalKips = criticalLoadLbs / 1000;
      return { criticalLoadLbs, criticalKips };
    },
    formatResult: (res: { criticalLoadLbs: number; criticalKips: number }) => ({
      primary: {
        label: 'Critical Buckling Capacity',
        value: `${ResultFormatter.formatInteger(Math.round(res.criticalLoadLbs))} lbs (${res.criticalKips.toFixed(1)} kips)`,
        numericValue: res.criticalLoadLbs
      },
      secondary: [
        { label: 'Mode of Failure', value: 'Column will buckle elastically above this compressive threshold' }
      ]
    })
  },

  // 14. Area Moment of Inertia Calculator
  {
    id: 'moment-of-inertia-calc',
    name: 'Area Moment of Inertia Calculator',
    category: 'engineering',
    subcategoryId: 'structural-beam',
    formulaMeta: {
      formulaName: 'Second Moment of Area',
      formulaExpression: 'Rectangle: I = (b × h³) / 12; Section Modulus: S = (b × h²) / 6',
      variables: [{ symbol: 'I', name: 'Moment of Inertia', unit: 'in⁴' }]
    },
    inputSchema: {
      fields: [
        { name: 'widthInches', label: 'Beam Width b (inches)', type: 'number', required: true, defaultValue: 3.5, min: 0.5 },
        { name: 'heightInches', label: 'Beam Depth / Height h (inches)', type: 'number', required: true, defaultValue: 7.25, min: 0.5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { widthInches: number; heightInches: number }) => {
      const ix = (inputs.widthInches * Math.pow(inputs.heightInches, 3)) / 12;
      const iy = (inputs.heightInches * Math.pow(inputs.widthInches, 3)) / 12;
      const sx = (inputs.widthInches * Math.pow(inputs.heightInches, 2)) / 6;
      return { ix, iy, sx };
    },
    formatResult: (res: { ix: number; iy: number; sx: number }) => ({
      primary: {
        label: 'Strong-Axis Moment of Inertia (Ix)',
        value: `${res.ix.toFixed(2)} in⁴`,
        numericValue: res.ix
      },
      secondary: [
        { label: 'Weak-Axis Moment of Inertia (Iy)', value: `${res.iy.toFixed(2)} in⁴` },
        { label: 'Elastic Section Modulus (Sx)', value: `${res.sx.toFixed(2)} in³` }
      ]
    })
  },

  // 15. Sensible Heat Transfer (Q = mcΔT) Calculator
  {
    id: 'heat-transfer-q-calc',
    name: 'Sensible Heat Transfer (Q = mcΔT) Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    formulaMeta: {
      formulaName: 'Specific Heat Formula',
      formulaExpression: 'Q = m × c × (T_final - T_initial)',
      variables: [{ symbol: 'Q', name: 'Thermal Energy', unit: 'Joules' }]
    },
    inputSchema: {
      fields: [
        { name: 'massKg', label: 'Material Mass (kg)', type: 'number', required: true, defaultValue: 10, min: 0.01 },
        { name: 'specificHeat', label: 'Specific Heat Capacity c (J/kg·°C, water ~4184, steel ~490)', type: 'number', required: true, defaultValue: 4184, min: 10 },
        { name: 'initialTempC', label: 'Initial Temperature (°C)', type: 'number', required: true, defaultValue: 20 },
        { name: 'finalTempC', label: 'Final Target Temperature (°C)', type: 'number', required: true, defaultValue: 80 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { massKg: number; specificHeat: number; initialTempC: number; finalTempC: number }) => {
      const deltaT = inputs.finalTempC - inputs.initialTempC;
      const energyJoules = inputs.massKg * inputs.specificHeat * deltaT;
      const energyKJ = energyJoules / 1000;
      const btu = energyJoules * 0.000947817;
      return { energyJoules, energyKJ, btu, deltaT };
    },
    formatResult: (res: { energyJoules: number; energyKJ: number; btu: number; deltaT: number }) => ({
      primary: {
        label: 'Thermal Energy Required (Q)',
        value: `${ResultFormatter.formatInteger(Math.round(res.energyKJ))} kJ`,
        numericValue: res.energyKJ
      },
      secondary: [
        { label: 'British Thermal Units (BTU)', value: `${Math.round(res.btu)} BTU` },
        { label: 'Temperature Rise (ΔT)', value: `${res.deltaT.toFixed(1)} °C` }
      ]
    })
  },

  // 16. Linear Thermal Expansion Calculator
  {
    id: 'thermal-expansion-calc',
    name: 'Linear Thermal Expansion Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    formulaMeta: {
      formulaName: 'Linear Thermal Expansion',
      formulaExpression: 'ΔL = α × L × ΔT',
      variables: [{ symbol: 'ΔL', name: 'Thermal Elongation' }]
    },
    inputSchema: {
      fields: [
        { name: 'initialLengthMeters', label: 'Initial Length (meters)', type: 'number', required: true, defaultValue: 50, min: 0.5 },
        { name: 'deltaTempC', label: 'Temperature Change ΔT (°C)', type: 'number', required: true, defaultValue: 40, min: 1 },
        { name: 'material', label: 'Material Type', type: 'select', required: true, defaultValue: 'steel', options: [
          { label: 'Structural Steel (α = 12 × 10⁻⁶ /°C)', value: '0.000012' },
          { label: 'Aluminum (α = 23 × 10⁻⁶ /°C)', value: '0.000023' },
          { label: 'Copper (α = 17 × 10⁻⁶ /°C)', value: '0.000017' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { initialLengthMeters: number; deltaTempC: number; material: string }) => {
      const alpha = parseFloat(inputs.material);
      const deltaLMeters = alpha * inputs.initialLengthMeters * inputs.deltaTempC;
      const deltaLMm = deltaLMeters * 1000;
      const deltaLInches = deltaLMm / 25.4;
      return { deltaLMm, deltaLInches };
    },
    formatResult: (res: { deltaLMm: number; deltaLInches: number }) => ({
      primary: {
        label: 'Thermal Expansion Elongation',
        value: `${res.deltaLMm.toFixed(2)} mm (${res.deltaLInches.toFixed(3)} inches)`,
        numericValue: res.deltaLMm
      },
      secondary: [
        { label: 'Engineering Recommendation', value: 'Install expansion loops or bellows joints exceeding this expansion' }
      ]
    })
  },

  // 17. Ideal Gas Law (PV = nRT) Solver
  {
    id: 'ideal-gas-law-calc',
    name: 'Ideal Gas Law (PV = nRT) Solver',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    formulaMeta: {
      formulaName: 'Ideal Gas Equation',
      formulaExpression: 'P = (n × R × T) / V (R = 8.314 J/mol·K)',
      variables: [{ symbol: 'P', name: 'Absolute Pressure', unit: 'kPa' }]
    },
    inputSchema: {
      fields: [
        { name: 'moles', label: 'Amount of Gas n (moles)', type: 'number', required: true, defaultValue: 2.5, min: 0.01 },
        { name: 'volumeLiters', label: 'Vessel Volume V (Liters)', type: 'number', required: true, defaultValue: 10, min: 0.1 },
        { name: 'tempCelsius', label: 'Gas Temperature (°C)', type: 'number', required: true, defaultValue: 25 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { moles: number; volumeLiters: number; tempCelsius: number }) => {
      const tempK = inputs.tempCelsius + 273.15;
      const volumeM3 = inputs.volumeLiters * 1e-3;
      const R = 8.31446;
      const pressurePascals = (inputs.moles * R * tempK) / volumeM3;
      const kpa = pressurePascals / 1000;
      const psi = kpa * 0.145038;
      const atm = kpa / 101.325;
      return { kpa, psi, atm, tempK };
    },
    formatResult: (res: { kpa: number; psi: number; atm: number; tempK: number }) => ({
      primary: {
        label: 'Resulting Absolute Pressure',
        value: `${res.kpa.toFixed(1)} kPa (${res.atm.toFixed(2)} atm)`,
        numericValue: res.kpa
      },
      secondary: [
        { label: 'Pressure in PSI', value: `${res.psi.toFixed(1)} PSI` },
        { label: 'Temperature in Kelvin', value: `${res.tempK.toFixed(2)} K` }
      ]
    })
  },

  // 18. Carnot Heat Engine Maximum Efficiency Calculator
  {
    id: 'carnot-efficiency-calc',
    name: 'Carnot Heat Engine Maximum Efficiency Calculator',
    category: 'engineering',
    subcategoryId: 'thermodynamics',
    formulaMeta: {
      formulaName: 'Carnot Efficiency',
      formulaExpression: 'η = 1 - (T_cold / T_hot) [in Kelvin]',
      variables: [{ symbol: 'η', name: 'Theoretical Maximum Efficiency', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'hotReservoirC', label: 'Hot Reservoir Temperature (°C)', type: 'number', required: true, defaultValue: 500, min: 0 },
        { name: 'coldReservoirC', label: 'Cold Sink Temperature (°C)', type: 'number', required: true, defaultValue: 25, min: -273 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { hotReservoirC: number; coldReservoirC: number }) => {
      const thK = inputs.hotReservoirC + 273.15;
      const tcK = inputs.coldReservoirC + 273.15;
      const carnotEfficiency = (1 - tcK / thK) * 100;
      return { carnotEfficiency, thK, tcK };
    },
    formatResult: (res: { carnotEfficiency: number; thK: number; tcK: number }) => ({
      primary: {
        label: 'Carnot Thermal Efficiency Limit',
        value: `${res.carnotEfficiency.toFixed(1)}%`,
        numericValue: res.carnotEfficiency
      },
      secondary: [
        { label: 'Hot Reservoir (Kelvin)', value: `${res.thK.toFixed(1)} K` },
        { label: 'Cold Sink (Kelvin)', value: `${res.tcK.toFixed(1)} K` }
      ]
    })
  },

  // ==========================================
  // EVERYDAY CONTRACTS (12)
  // ==========================================

  // 19. Group Restaurant Bill & Tax Split Calculator
  {
    id: 'group-split-bill-calc',
    name: 'Group Restaurant Bill & Tax Split Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    formulaMeta: {
      formulaName: 'Group Dining Cost Split',
      formulaExpression: 'Per Person = [Subtotal × (1 + Tax% + Tip%)] / Guests',
      variables: [{ symbol: 'Per Person', name: 'Individual Share', unit: '$' }]
    },
    inputSchema: {
      fields: [
        { name: 'foodSubtotal', label: 'Food & Drinks Subtotal ($)', type: 'currency', required: true, defaultValue: 180, min: 1 },
        { name: 'taxRatePct', label: 'Sales Tax Rate (%)', type: 'percentage', required: true, defaultValue: 8.5, min: 0 },
        { name: 'tipRatePct', label: 'Tip Percentage (%)', type: 'percentage', required: true, defaultValue: 20, min: 0 },
        { name: 'numberOfGuests', label: 'Number of Guests', type: 'integer', required: true, defaultValue: 4, min: 1, max: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { foodSubtotal: number; taxRatePct: number; tipRatePct: number; numberOfGuests: number }) => {
      const taxAmount = inputs.foodSubtotal * (inputs.taxRatePct / 100);
      const tipAmount = inputs.foodSubtotal * (inputs.tipRatePct / 100);
      const grandTotal = inputs.foodSubtotal + taxAmount + tipAmount;
      const perPerson = grandTotal / inputs.numberOfGuests;
      return { perPerson, grandTotal, taxAmount, tipAmount, guests: inputs.numberOfGuests };
    },
    formatResult: (res: { perPerson: number; grandTotal: number; taxAmount: number; tipAmount: number; guests: number }) => ({
      primary: {
        label: 'Cost per Person',
        value: ResultFormatter.formatCurrency(res.perPerson),
        numericValue: res.perPerson
      },
      secondary: [
        { label: 'Grand Total with Tax & Tip', value: ResultFormatter.formatCurrency(res.grandTotal) },
        { label: 'Total Tip', value: ResultFormatter.formatCurrency(res.tipAmount) },
        { label: 'Party Size', value: `${res.guests} people` }
      ]
    })
  },

  // 20. Food Delivery Driver Tip Calculator
  {
    id: 'food-delivery-tip-calc',
    name: 'Food Delivery Driver Tip Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    formulaMeta: {
      formulaName: 'Delivery Courier Tip Formula',
      formulaExpression: 'Tip = Base + ($1.50 × Miles) + Weather Buffer',
      variables: [{ symbol: 'Tip', name: 'Recommended Gratuity' }]
    },
    inputSchema: {
      fields: [
        { name: 'orderSubtotal', label: 'Food Order Subtotal ($)', type: 'currency', required: true, defaultValue: 35, min: 5 },
        { name: 'drivingDistanceMiles', label: 'Delivery Distance from Restaurant (miles)', type: 'number', required: true, defaultValue: 4.5, min: 0.5 },
        { name: 'weatherCondition', label: 'Weather / Stairs Conditions', type: 'select', required: true, defaultValue: 'standard', options: [
          { label: 'Standard Fair Weather', value: 'standard' },
          { label: 'Rain / Heavy Traffic (+$2)', value: 'rain' },
          { label: 'Snow / Ice / 3rd Floor Stairs (+$4)', value: 'severe' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { orderSubtotal: number; drivingDistanceMiles: number; weatherCondition: string }) => {
      const basePct = inputs.orderSubtotal * 0.15;
      const distanceAdd = Math.max(0, inputs.drivingDistanceMiles - 2) * 1.50;
      let weatherAdd = 0;
      if (inputs.weatherCondition === 'rain') weatherAdd = 2;
      if (inputs.weatherCondition === 'severe') weatherAdd = 4;
      const recommendedTip = Math.max(4.00, basePct + distanceAdd + weatherAdd);
      return { recommendedTip, totalPaid: inputs.orderSubtotal + recommendedTip };
    },
    formatResult: (res: { recommendedTip: number; totalPaid: number }) => ({
      primary: {
        label: 'Recommended Driver Tip',
        value: ResultFormatter.formatCurrency(res.recommendedTip),
        numericValue: res.recommendedTip
      },
      secondary: [
        { label: 'Total Order with Tip', value: ResultFormatter.formatCurrency(res.totalPaid) },
        { label: 'Fair Compensation', value: 'Ensures driver covers gas and vehicle mileage expenses' }
      ]
    })
  },

  // 21. Bar Tab & Per-Drink Gratuity Calculator
  {
    id: 'bar-tab-drink-calc',
    name: 'Bar Tab & Per-Drink Gratuity Calculator',
    category: 'everyday',
    subcategoryId: 'dining-tipping',
    formulaMeta: {
      formulaName: 'Bar Gratuity Benchmark',
      formulaExpression: 'Tip = $1-$2 per beer/wine or 20% on craft cocktails',
      variables: [{ symbol: 'Tip', name: 'Bar Tip' }]
    },
    inputSchema: {
      fields: [
        { name: 'drinksCount', label: 'Total Drinks Ordered', type: 'integer', required: true, defaultValue: 6, min: 1 },
        { name: 'barSubtotal', label: 'Total Bar Tab ($)', type: 'currency', required: true, defaultValue: 65, min: 5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { drinksCount: number; barSubtotal: number }) => {
      const perDrinkTip = inputs.drinksCount * 2.00;
      const pct20Tip = inputs.barSubtotal * 0.20;
      const recommendedTip = Math.max(perDrinkTip, pct20Tip);
      const totalCost = inputs.barSubtotal + recommendedTip;
      return { recommendedTip, totalCost, perDrinkTip, pct20Tip };
    },
    formatResult: (res: { recommendedTip: number; totalCost: number; perDrinkTip: number; pct20Tip: number }) => ({
      primary: {
        label: 'Recommended Bartender Tip',
        value: ResultFormatter.formatCurrency(res.recommendedTip),
        numericValue: res.recommendedTip
      },
      secondary: [
        { label: 'Total Out-of-Pocket Tab', value: ResultFormatter.formatCurrency(res.totalCost) },
        { label: '$2/drink vs 20% Rule', value: `$${res.perDrinkTip.toFixed(2)} vs $${res.pct20Tip.toFixed(2)}` }
      ]
    })
  },

  // 22. Stackable Double Discount Calculator
  {
    id: 'double-discount-calc',
    name: 'Stackable Double Discount & Markdown Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    formulaMeta: {
      formulaName: 'Compound Markdown',
      formulaExpression: 'Final = Original × (1 - D1) × (1 - D2)',
      variables: [{ symbol: 'Final', name: 'Sale Price' }]
    },
    inputSchema: {
      fields: [
        { name: 'originalPrice', label: 'Original Retail Price ($)', type: 'currency', required: true, defaultValue: 120, min: 1 },
        { name: 'firstDiscountPct', label: 'First Discount (e.g. 40% Clearance)', type: 'percentage', required: true, defaultValue: 40, min: 0, max: 90 },
        { name: 'secondDiscountPct', label: 'Stacked Coupon (e.g. 20% Promo)', type: 'percentage', required: true, defaultValue: 20, min: 0, max: 90 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { originalPrice: number; firstDiscountPct: number; secondDiscountPct: number }) => {
      const priceAfterFirst = inputs.originalPrice * (1 - inputs.firstDiscountPct / 100);
      const finalPrice = priceAfterFirst * (1 - inputs.secondDiscountPct / 100);
      const totalSaved = inputs.originalPrice - finalPrice;
      const effectiveDiscountPct = (totalSaved / inputs.originalPrice) * 100;
      return { finalPrice, totalSaved, effectiveDiscountPct, priceAfterFirst };
    },
    formatResult: (res: { finalPrice: number; totalSaved: number; effectiveDiscountPct: number; priceAfterFirst: number }) => ({
      primary: {
        label: 'Final Out-of-Pocket Price',
        value: ResultFormatter.formatCurrency(res.finalPrice),
        numericValue: res.finalPrice
      },
      secondary: [
        { label: 'Total Dollars Saved', value: ResultFormatter.formatCurrency(res.totalSaved) },
        { label: 'Combined Effective Discount', value: `${res.effectiveDiscountPct.toFixed(1)}% off original` }
      ]
    })
  },

  // 23. Grocery Unit Price Comparison Calculator
  {
    id: 'unit-price-comparison-calc',
    name: 'Grocery Unit Price & Best Value Comparison',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    formulaMeta: {
      formulaName: 'Unit Price Comparison',
      formulaExpression: 'Unit Price = Cost / Quantity',
      variables: [{ symbol: 'Best', name: 'Lowest Cost per Unit' }]
    },
    inputSchema: {
      fields: [
        { name: 'item1Price', label: 'Item A Price ($)', type: 'currency', required: true, defaultValue: 4.99, min: 0.1 },
        { name: 'item1Ounces', label: 'Item A Quantity (oz / units)', type: 'number', required: true, defaultValue: 16, min: 0.1 },
        { name: 'item2Price', label: 'Item B Price ($)', type: 'currency', required: true, defaultValue: 7.49, min: 0.1 },
        { name: 'item2Ounces', label: 'Item B Quantity (oz / units)', type: 'number', required: true, defaultValue: 28, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { item1Price: number; item1Ounces: number; item2Price: number; item2Ounces: number }) => {
      const unit1 = inputs.item1Price / inputs.item1Ounces;
      const unit2 = inputs.item2Price / inputs.item2Ounces;
      const savingsPct = Math.abs(unit1 - unit2) / Math.max(unit1, unit2) * 100;
      const winner = unit1 < unit2 ? 'Item A is cheaper' : 'Item B is cheaper';
      return { unit1, unit2, savingsPct, winner };
    },
    formatResult: (res: { unit1: number; unit2: number; savingsPct: number; winner: string }) => ({
      primary: {
        label: 'Best Value Decision',
        value: `${res.winner} (${res.savingsPct.toFixed(1)}% savings)`,
        numericValue: res.unit1 < res.unit2 ? res.unit1 : res.unit2
      },
      secondary: [
        { label: 'Item A Unit Cost', value: `$${res.unit1.toFixed(3)} / unit` },
        { label: 'Item B Unit Cost', value: `$${res.unit2.toFixed(3)} / unit` }
      ]
    })
  },

  // 24. Credit Card Cash Back & Rebate Calculator
  {
    id: 'cash-back-rebate-calc',
    name: 'Credit Card Cash Back & Rebate Calculator',
    category: 'everyday',
    subcategoryId: 'shopping-discounts',
    formulaMeta: {
      formulaName: 'Rewards Cash Back',
      formulaExpression: 'Cash Back = Spend × (Reward % / 100)',
      variables: [{ symbol: 'Cash', name: 'Annual Cash Back Earned' }]
    },
    inputSchema: {
      fields: [
        { name: 'monthlySpend', label: 'Monthly Card Spending ($)', type: 'currency', required: true, defaultValue: 2500, min: 50 },
        { name: 'rewardRatePct', label: 'Average Cash Back Reward (%)', type: 'percentage', required: true, defaultValue: 2.0, min: 0.5, max: 10 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { monthlySpend: number; rewardRatePct: number }) => {
      const monthlyReward = inputs.monthlySpend * (inputs.rewardRatePct / 100);
      const annualReward = monthlyReward * 12;
      return { monthlyReward, annualReward, spend: inputs.monthlySpend * 12 };
    },
    formatResult: (res: { monthlyReward: number; annualReward: number; spend: number }) => ({
      primary: {
        label: 'Annual Cash Back Earned',
        value: ResultFormatter.formatCurrency(res.annualReward),
        numericValue: res.annualReward
      },
      secondary: [
        { label: 'Monthly Cash Back', value: ResultFormatter.formatCurrency(res.monthlyReward) },
        { label: 'Total Annual Spending', value: ResultFormatter.formatCurrency(res.spend) }
      ]
    })
  },

  // 25. Road Trip Gas Cost & Passenger Split Calculator
  {
    id: 'road-trip-fuel-calc',
    name: 'Road Trip Gas Cost & Passenger Split Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    formulaMeta: {
      formulaName: 'Road Trip Fuel Expense',
      formulaExpression: 'Cost = (Miles / MPG) × Gas Price; Per Person = Cost / Travelers',
      variables: [{ symbol: 'Cost', name: 'Trip Gas Total' }]
    },
    inputSchema: {
      fields: [
        { name: 'roundTripMiles', label: 'Total Round-Trip Distance (miles)', type: 'number', required: true, defaultValue: 650, min: 10 },
        { name: 'vehicleMPG', label: 'Vehicle Fuel Economy (MPG)', type: 'number', required: true, defaultValue: 28, min: 5 },
        { name: 'gasPricePerGallon', label: 'Average Gas Price ($/gal)', type: 'currency', required: true, defaultValue: 3.65, min: 1.0 },
        { name: 'passengers', label: 'Number of Travelers Sharing Cost', type: 'integer', required: true, defaultValue: 3, min: 1, max: 15 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { roundTripMiles: number; vehicleMPG: number; gasPricePerGallon: number; passengers: number }) => {
      const gallonsNeeded = inputs.roundTripMiles / inputs.vehicleMPG;
      const totalGasCost = gallonsNeeded * inputs.gasPricePerGallon;
      const perPassenger = totalGasCost / inputs.passengers;
      return { totalGasCost, perPassenger, gallonsNeeded };
    },
    formatResult: (res: { totalGasCost: number; perPassenger: number; gallonsNeeded: number }) => ({
      primary: {
        label: 'Cost per Passenger',
        value: ResultFormatter.formatCurrency(res.perPassenger),
        numericValue: res.perPassenger
      },
      secondary: [
        { label: 'Total Trip Fuel Cost', value: ResultFormatter.formatCurrency(res.totalGasCost) },
        { label: 'Gallons Consumed', value: `${res.gallonsNeeded.toFixed(1)} gallons` }
      ]
    })
  },

  // 26. Fuel Economy & Cost per Mile Calculator
  {
    id: 'mpg-cost-per-mile-calc',
    name: 'Fuel Economy & Cost per Mile Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    formulaMeta: {
      formulaName: 'Cost per Mile Formula',
      formulaExpression: 'Cost per Mile = Gas Price / Vehicle MPG',
      variables: [{ symbol: 'CPM', name: 'Cost per Mile', unit: '$/mi' }]
    },
    inputSchema: {
      fields: [
        { name: 'mpg', label: 'Vehicle Combined MPG', type: 'number', required: true, defaultValue: 25, min: 5 },
        { name: 'gasPrice', label: 'Gas Price ($/gallon)', type: 'currency', required: true, defaultValue: 3.50, min: 1.0 },
        { name: 'annualMiles', label: 'Annual Miles Driven', type: 'number', required: true, defaultValue: 12000, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { mpg: number; gasPrice: number; annualMiles: number }) => {
      const costPerMile = inputs.gasPrice / inputs.mpg;
      const annualFuelCost = costPerMile * inputs.annualMiles;
      const costFor100Miles = costPerMile * 100;
      return { costPerMile, annualFuelCost, costFor100Miles };
    },
    formatResult: (res: { costPerMile: number; annualFuelCost: number; costFor100Miles: number }) => ({
      primary: {
        label: 'Fuel Cost per Mile',
        value: `$${res.costPerMile.toFixed(2)} / mile`,
        numericValue: res.costPerMile
      },
      secondary: [
        { label: 'Annual Fuel Spending', value: ResultFormatter.formatCurrency(res.annualFuelCost) },
        { label: 'Cost to Drive 100 Miles', value: ResultFormatter.formatCurrency(res.costFor100Miles) }
      ]
    })
  },

  // 27. EV vs Gas Car Annual Fuel Savings Calculator
  {
    id: 'ev-vs-gas-savings-calc',
    name: 'EV vs Gas Car Annual Fuel Savings Calculator',
    category: 'everyday',
    subcategoryId: 'automotive-fuel',
    formulaMeta: {
      formulaName: 'EV vs Gasoline Savings',
      formulaExpression: 'Savings = Gas Car Fuel Cost - EV Charging Cost',
      variables: [{ symbol: 'Savings', name: 'Annual Fuel Savings' }]
    },
    inputSchema: {
      fields: [
        { name: 'annualMiles', label: 'Annual Driving Distance (miles)', type: 'number', required: true, defaultValue: 13500, min: 1000 },
        { name: 'gasCarMPG', label: 'Gas Car MPG', type: 'number', required: true, defaultValue: 27, min: 10 },
        { name: 'gasPrice', label: 'Gasoline Price ($/gallon)', type: 'currency', required: true, defaultValue: 3.75, min: 1.5 },
        { name: 'electricityRate', label: 'Home Electricity Rate ($/kWh)', type: 'number', required: true, defaultValue: 0.15, min: 0.05 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualMiles: number; gasCarMPG: number; gasPrice: number; electricityRate: number }) => {
      const annualGasCost = (inputs.annualMiles / inputs.gasCarMPG) * inputs.gasPrice;
      const evKwhNeeded = inputs.annualMiles * 0.30;
      const annualEVCost = evKwhNeeded * inputs.electricityRate;
      const annualSavings = annualGasCost - annualEVCost;
      const monthlySavings = annualSavings / 12;
      return { annualSavings, monthlySavings, annualGasCost, annualEVCost };
    },
    formatResult: (res: { annualSavings: number; monthlySavings: number; annualGasCost: number; annualEVCost: number }) => ({
      primary: {
        label: 'Annual Fuel Savings with EV',
        value: ResultFormatter.formatCurrency(res.annualSavings),
        numericValue: res.annualSavings
      },
      secondary: [
        { label: 'Monthly Fuel Savings', value: ResultFormatter.formatCurrency(res.monthlySavings) },
        { label: 'Gasoline Cost vs EV Electric Cost', value: `${ResultFormatter.formatCurrency(res.annualGasCost)} vs ${ResultFormatter.formatCurrency(res.annualEVCost)}` }
      ]
    })
  },

  // 28. Recipe Serving Scaling & Multiplier Calculator
  {
    id: 'recipe-multiplier-calc',
    name: 'Recipe Serving Scaling & Multiplier Calculator',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    formulaMeta: {
      formulaName: 'Recipe Yield Scaling Factor',
      formulaExpression: 'Multiplier = Desired Servings / Original Servings',
      variables: [{ symbol: 'Multiplier', name: 'Scaling Factor' }]
    },
    inputSchema: {
      fields: [
        { name: 'originalServings', label: 'Original Recipe Servings', type: 'number', required: true, defaultValue: 4, min: 1 },
        { name: 'targetServings', label: 'Desired Servings Needed', type: 'number', required: true, defaultValue: 10, min: 1 },
        { name: 'sampleIngredientQty', label: 'Example Ingredient Amount (e.g. 2 cups flour)', type: 'number', required: true, defaultValue: 2.0, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { originalServings: number; targetServings: number; sampleIngredientQty: number }) => {
      const multiplier = inputs.targetServings / inputs.originalServings;
      const scaledIngredient = inputs.sampleIngredientQty * multiplier;
      return { multiplier, scaledIngredient };
    },
    formatResult: (res: { multiplier: number; scaledIngredient: number }) => ({
      primary: {
        label: 'Recipe Scaling Multiplier',
        value: `${res.multiplier.toFixed(2)}x`,
        numericValue: res.multiplier
      },
      secondary: [
        { label: 'Scaled Sample Ingredient', value: `${res.scaledIngredient.toFixed(2)} (scaled from ${res.scaledIngredient / res.multiplier})` }
      ]
    })
  },

  // 29. Baker's Percentage & Bread Hydration Calculator
  {
    id: 'bakers-percentage-calc',
    name: "Baker's Percentage & Bread Hydration Calculator",
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    formulaMeta: {
      formulaName: "Baker's Hydration Ratios",
      formulaExpression: 'Hydration % = (Water Weight / Flour Weight) × 100 (Flour = 100%)',
      variables: [{ symbol: 'Hydration %', name: 'Water Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'flourGrams', label: 'Total Flour Weight (grams)', type: 'number', required: true, defaultValue: 500, min: 100 },
        { name: 'hydrationPct', label: 'Target Hydration Percentage (%)', type: 'percentage', required: true, defaultValue: 72, min: 50, max: 95 },
        { name: 'saltPct', label: 'Salt Percentage (%)', type: 'percentage', required: true, defaultValue: 2.0, min: 1, max: 3 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { flourGrams: number; hydrationPct: number; saltPct: number }) => {
      const waterGrams = inputs.flourGrams * (inputs.hydrationPct / 100);
      const saltGrams = inputs.flourGrams * (inputs.saltPct / 100);
      const totalDoughGrams = inputs.flourGrams + waterGrams + saltGrams;
      return { waterGrams, saltGrams, totalDoughGrams, flourGrams: inputs.flourGrams };
    },
    formatResult: (res: { waterGrams: number; saltGrams: number; totalDoughGrams: number; flourGrams: number }) => ({
      primary: {
        label: 'Water Needed for Hydration',
        value: `${Math.round(res.waterGrams)} grams`,
        numericValue: res.waterGrams
      },
      secondary: [
        { label: 'Salt Needed', value: `${res.saltGrams.toFixed(1)} grams` },
        { label: 'Total Dough Weight', value: `${Math.round(res.totalDoughGrams)} grams` }
      ]
    })
  },

  // 30. Roast Cooking Time per Pound Calculator
  {
    id: 'cooking-time-per-pound-calc',
    name: 'Roast Cooking Time per Pound Calculator',
    category: 'everyday',
    subcategoryId: 'cooking-baking-ratios',
    formulaMeta: {
      formulaName: 'Oven Roasting Timeline',
      formulaExpression: 'Cook Time = (Weight lbs × Minutes per lb) + Resting Buffer',
      variables: [{ symbol: 'Time', name: 'Oven Duration' }]
    },
    inputSchema: {
      fields: [
        { name: 'meatType', label: 'Meat & Cut Type', type: 'select', required: true, defaultValue: 'turkey-whole', options: [
          { label: 'Whole Turkey (325°F, 15 min/lb)', value: '15' },
          { label: 'Prime Rib / Beef Roast (325°F Med-Rare, 18 min/lb)', value: '18' },
          { label: 'Pork Loin Roast (350°F, 22 min/lb)', value: '22' },
          { label: 'Whole Chicken (375°F, 20 min/lb)', value: '20' }
        ]},
        { name: 'weightLbs', label: 'Meat Weight (lbs)', type: 'number', required: true, defaultValue: 14, min: 1, max: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { meatType: string; weightLbs: number }) => {
      const minPerLb = parseFloat(inputs.meatType);
      const totalCookingMinutes = inputs.weightLbs * minPerLb;
      const hours = Math.floor(totalCookingMinutes / 60);
      const minutes = Math.round(totalCookingMinutes % 60);
      const restingBuffer = 20;
      return { totalCookingMinutes, hours, minutes, restingBuffer };
    },
    formatResult: (res: { totalCookingMinutes: number; hours: number; minutes: number; restingBuffer: number }) => ({
      primary: {
        label: 'Total Oven Roasting Time',
        value: `${res.hours} hrs ${res.minutes} mins`,
        numericValue: res.totalCookingMinutes
      },
      secondary: [
        { label: 'Recommended Resting Time', value: `${res.restingBuffer} minutes tented in foil` },
        { label: 'Safety Note', value: 'Verify doneness with meat thermometer in thickest part' }
      ]
    })
  }
];
