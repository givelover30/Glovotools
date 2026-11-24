import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH9_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Electrical Power (Watts, Volts & Amps) Calculator
  {
    id: 'electric-power-kw-calc',
    name: 'Electrical Power (Watts, Volts & Amps) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    formulaMeta: {
      formulaName: 'Single-Phase Electric Power',
      formulaExpression: 'P (Watts) = V (Volts) × I (Amperes)',
      variables: [{ symbol: 'P', name: 'Power', unit: 'W' }]
    },
    inputSchema: {
      fields: [
        { name: 'voltage', label: 'Voltage (V)', type: 'number', required: true, defaultValue: 120, min: 1 },
        { name: 'currentAmps', label: 'Current (Amperes)', type: 'number', required: true, defaultValue: 12, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { voltage: number; currentAmps: number }) => {
      const watts = inputs.voltage * inputs.currentAmps;
      const kilowatts = watts / 1000;
      const horsepower = watts / 745.7;
      return { watts, kilowatts, horsepower };
    },
    formatResult: (res: { watts: number; kilowatts: number; horsepower: number }) => ({
      primary: {
        label: 'Electrical Power',
        value: `${Math.round(res.watts)} Watts (${res.kilowatts.toFixed(2)} kW)`,
        numericValue: res.watts
      },
      secondary: [
        { label: 'Mechanical Equivalent', value: `${res.horsepower.toFixed(2)} HP` }
      ]
    })
  },

  // 2. Three-Phase Electric Power Calculator
  {
    id: 'three-phase-power-calc',
    name: 'Three-Phase Electric Power (kW & kVA) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    formulaMeta: {
      formulaName: '3-Phase AC Power',
      formulaExpression: 'kW = (√3 × V_LL × I × PF) / 1000',
      variables: [{ symbol: 'kW', name: 'Real 3-Phase Power' }]
    },
    inputSchema: {
      fields: [
        { name: 'lineVoltage', label: 'Line-to-Line Voltage (V, e.g. 480V or 208V)', type: 'number', required: true, defaultValue: 480, min: 100 },
        { name: 'currentAmps', label: 'Line Current (Amperes)', type: 'number', required: true, defaultValue: 50, min: 1 },
        { name: 'powerFactor', label: 'Power Factor (0.7 - 1.0)', type: 'number', required: true, defaultValue: 0.85, min: 0.5, max: 1.0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { lineVoltage: number; currentAmps: number; powerFactor: number }) => {
      const kva = (Math.sqrt(3) * inputs.lineVoltage * inputs.currentAmps) / 1000;
      const kw = kva * inputs.powerFactor;
      return { kva, kw, pf: inputs.powerFactor };
    },
    formatResult: (res: { kva: number; kw: number; pf: number }) => ({
      primary: {
        label: 'Three-Phase Real Power',
        value: `${res.kw.toFixed(2)} kW`,
        numericValue: res.kw
      },
      secondary: [
        { label: 'Apparent Power', value: `${res.kva.toFixed(2)} kVA` },
        { label: 'Operating Power Factor', value: `${res.pf}` }
      ]
    })
  },

  // 3. AC Power Triangle Calculator
  {
    id: 'ac-apparent-reactive-power-calc',
    name: 'AC Power Triangle (Real, Reactive & Apparent) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    formulaMeta: {
      formulaName: 'Power Triangle Geometry',
      formulaExpression: 'S = √(P² + Q²); PF = P / S',
      variables: [{ symbol: 'S', name: 'Apparent Power', unit: 'kVA' }]
    },
    inputSchema: {
      fields: [
        { name: 'realPowerKW', label: 'Real Power (kW)', type: 'number', required: true, defaultValue: 80, min: 1 },
        { name: 'powerFactor', label: 'Power Factor (PF)', type: 'number', required: true, defaultValue: 0.80, min: 0.3, max: 1.0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { realPowerKW: number; powerFactor: number }) => {
      const apparentKVA = inputs.realPowerKW / inputs.powerFactor;
      const reactiveKVAR = Math.sqrt(Math.max(0, Math.pow(apparentKVA, 2) - Math.pow(inputs.realPowerKW, 2)));
      return { apparentKVA, reactiveKVAR, realKW: inputs.realPowerKW };
    },
    formatResult: (res: { apparentKVA: number; reactiveKVAR: number; realKW: number }) => ({
      primary: {
        label: 'Apparent Power (S)',
        value: `${res.apparentKVA.toFixed(2)} kVA`,
        numericValue: res.apparentKVA
      },
      secondary: [
        { label: 'Reactive Power (Q)', value: `${res.reactiveKVAR.toFixed(2)} kVAR` },
        { label: 'Real Working Power (P)', value: `${res.realKW} kW` }
      ]
    })
  },

  // 4. Energy to Power (Joules to Watts) Calculator
  {
    id: 'joules-to-watts-calc',
    name: 'Energy to Power (Joules to Watts) Calculator',
    category: 'electrical',
    subcategoryId: 'ohms-law-power',
    formulaMeta: {
      formulaName: 'Joules to Watts',
      formulaExpression: 'Watts = Joules / Seconds',
      variables: [{ symbol: 'Watts', name: 'Power' }]
    },
    inputSchema: {
      fields: [
        { name: 'energyJoules', label: 'Energy Consumed (Joules)', type: 'number', required: true, defaultValue: 360000, min: 1 },
        { name: 'timeSeconds', label: 'Time Elapsed (Seconds)', type: 'number', required: true, defaultValue: 3600, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { energyJoules: number; timeSeconds: number }) => {
      const watts = inputs.energyJoules / inputs.timeSeconds;
      const kwh = inputs.energyJoules / 3600000;
      return { watts, kwh };
    },
    formatResult: (res: { watts: number; kwh: number }) => ({
      primary: {
        label: 'Average Continuous Power',
        value: `${res.watts.toFixed(2)} Watts`,
        numericValue: res.watts
      },
      secondary: [
        { label: 'Kilowatt-Hour Equivalent', value: `${res.kwh.toFixed(4)} kWh` }
      ]
    })
  },

  // 5. Appliance Daily & Annual Energy Usage Calculator
  {
    id: 'appliance-daily-kwh-calc',
    name: 'Appliance Daily & Annual Energy Usage Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    formulaMeta: {
      formulaName: 'Appliance kWh and Cost',
      formulaExpression: 'kWh = (Watts × Hours) / 1000; Cost = kWh × Rate',
      variables: [{ symbol: 'Cost', name: 'Annual Electricity Cost' }]
    },
    inputSchema: {
      fields: [
        { name: 'applianceWatts', label: 'Appliance Power Rating (Watts)', type: 'number', required: true, defaultValue: 1500, min: 1 },
        { name: 'hoursPerDay', label: 'Usage Hours per Day', type: 'number', required: true, defaultValue: 4, min: 0.1, max: 24 },
        { name: 'electricityRate', label: 'Utility Cost per kWh ($)', type: 'number', required: true, defaultValue: 0.16, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { applianceWatts: number; hoursPerDay: number; electricityRate: number }) => {
      const dailyKwh = (inputs.applianceWatts * inputs.hoursPerDay) / 1000;
      const monthlyKwh = dailyKwh * 30.42;
      const annualKwh = dailyKwh * 365;
      const monthlyCost = monthlyKwh * inputs.electricityRate;
      const annualCost = annualKwh * inputs.electricityRate;
      return { dailyKwh, monthlyCost, annualCost };
    },
    formatResult: (res: { dailyKwh: number; monthlyCost: number; annualCost: number }) => ({
      primary: {
        label: 'Annual Operating Cost',
        value: ResultFormatter.formatCurrency(res.annualCost),
        numericValue: res.annualCost
      },
      secondary: [
        { label: 'Monthly Cost', value: ResultFormatter.formatCurrency(res.monthlyCost) },
        { label: 'Daily Energy Consumption', value: `${res.dailyKwh.toFixed(2)} kWh / day` }
      ]
    })
  },

  // 6. Electric Vehicle (EV) Charging Time & Cost Calculator
  {
    id: 'electric-vehicle-charging-calc',
    name: 'Electric Vehicle (EV) Charging Time & Cost Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    formulaMeta: {
      formulaName: 'EV Charge Duration',
      formulaExpression: 'Time = Needed kWh / (Charger kW × 0.90 efficiency)',
      variables: [{ symbol: 'Time', name: 'Charge Hours' }]
    },
    inputSchema: {
      fields: [
        { name: 'batteryCapacity', label: 'Total Battery Capacity (kWh, e.g. 75 kWh)', type: 'number', required: true, defaultValue: 75, min: 10 },
        { name: 'startPct', label: 'Current Battery Level (%)', type: 'percentage', required: true, defaultValue: 20, min: 0, max: 99 },
        { name: 'targetPct', label: 'Target Battery Level (%)', type: 'percentage', required: true, defaultValue: 80, min: 1, max: 100 },
        { name: 'chargerKW', label: 'Charger Power (kW, Level 2 = 9.6 kW)', type: 'number', required: true, defaultValue: 9.6, min: 1 },
        { name: 'kwhCost', label: 'Electricity Cost ($/kWh)', type: 'number', required: true, defaultValue: 0.15, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { batteryCapacity: number; startPct: number; targetPct: number; chargerKW: number; kwhCost: number }) => {
      const addedPct = Math.max(0, inputs.targetPct - inputs.startPct);
      const neededKwh = inputs.batteryCapacity * (addedPct / 100);
      const chargeHours = neededKwh / (inputs.chargerKW * 0.90);
      const chargeCost = neededKwh * inputs.kwhCost;
      const hours = Math.floor(chargeHours);
      const minutes = Math.round((chargeHours % 1) * 60);
      return { chargeHours, hours, minutes, chargeCost, neededKwh };
    },
    formatResult: (res: { chargeHours: number; hours: number; minutes: number; chargeCost: number; neededKwh: number }) => ({
      primary: {
        label: 'Charging Time to Target',
        value: `${res.hours} hrs ${res.minutes} mins`,
        numericValue: res.chargeHours
      },
      secondary: [
        { label: 'Energy Replenished', value: `${res.neededKwh.toFixed(1)} kWh` },
        { label: 'Session Charging Cost', value: ResultFormatter.formatCurrency(res.chargeCost) }
      ]
    })
  },

  // 7. Solar Panel Daily Energy Output Calculator
  {
    id: 'solar-panel-output-calc',
    name: 'Solar Panel Daily Energy Output Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    formulaMeta: {
      formulaName: 'Solar PV Yield',
      formulaExpression: 'Daily kWh = Array kW × Peak Sun Hours × 0.82',
      variables: [{ symbol: 'kWh', name: 'Daily Generation' }]
    },
    inputSchema: {
      fields: [
        { name: 'systemSizeKW', label: 'Solar Array Capacity (kW DC, e.g. 8.5 kW)', type: 'number', required: true, defaultValue: 8.5, min: 1 },
        { name: 'sunHours', label: 'Average Peak Sun Hours per Day', type: 'number', required: true, defaultValue: 4.8, min: 1, max: 9 },
        { name: 'utilityRate', label: 'Utility Avoided Cost ($/kWh)', type: 'number', required: true, defaultValue: 0.18, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { systemSizeKW: number; sunHours: number; utilityRate: number }) => {
      const dailyKwh = inputs.systemSizeKW * inputs.sunHours * 0.82;
      const annualKwh = dailyKwh * 365;
      const annualSavings = annualKwh * inputs.utilityRate;
      return { dailyKwh, annualKwh, annualSavings };
    },
    formatResult: (res: { dailyKwh: number; annualKwh: number; annualSavings: number }) => ({
      primary: {
        label: 'Daily Clean Energy Generated',
        value: `${res.dailyKwh.toFixed(1)} kWh / day`,
        numericValue: res.dailyKwh
      },
      secondary: [
        { label: 'Annual Generation', value: `${Math.round(res.annualKwh)} kWh / yr` },
        { label: 'Estimated Annual Utility Savings', value: ResultFormatter.formatCurrency(res.annualSavings) }
      ]
    })
  },

  // 8. Standby Generator Wattage Sizing Calculator
  {
    id: 'generator-sizing-calc',
    name: 'Standby Generator Wattage Sizing Calculator',
    category: 'electrical',
    subcategoryId: 'energy-consumption',
    formulaMeta: {
      formulaName: 'Generator Capacity',
      formulaExpression: 'Sized kW = (Running Watts + Largest Motor Surge) / 1000 × 1.20',
      variables: [{ symbol: 'kW', name: 'Recommended Generator' }]
    },
    inputSchema: {
      fields: [
        { name: 'runningWatts', label: 'Combined Continuous Running Watts', type: 'integer', required: true, defaultValue: 6500, min: 500 },
        { name: 'largestSurgeWatts', label: 'Highest Motor Surge (e.g. AC / Well Pump)', type: 'integer', required: true, defaultValue: 4000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { runningWatts: number; largestSurgeWatts: number }) => {
      const peakWatts = inputs.runningWatts + inputs.largestSurgeWatts;
      const recommendedKW = Math.ceil((peakWatts * 1.20) / 1000);
      return { peakWatts, recommendedKW, runningWatts: inputs.runningWatts };
    },
    formatResult: (res: { peakWatts: number; recommendedKW: number; runningWatts: number }) => ({
      primary: {
        label: 'Recommended Standby Generator',
        value: `${res.recommendedKW} kW`,
        numericValue: res.recommendedKW
      },
      secondary: [
        { label: 'Peak Starting Demand', value: `${ResultFormatter.formatInteger(res.peakWatts)} Watts` },
        { label: 'Running Base Load', value: `${ResultFormatter.formatInteger(res.runningWatts)} Watts` }
      ]
    })
  },

  // 9. AWG Wire Voltage Drop Calculator
  {
    id: 'voltage-drop-awg-calc',
    name: 'AWG Wire Voltage Drop Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    formulaMeta: {
      formulaName: 'Single-Phase Voltage Drop',
      formulaExpression: 'V_drop = (2 × K × I × L) / Circular Mils (K=12.9 for copper)',
      variables: [{ symbol: 'V_drop', name: 'Voltage Drop', unit: 'V' }]
    },
    inputSchema: {
      fields: [
        { name: 'voltage', label: 'Nominal Circuit Voltage (V)', type: 'number', required: true, defaultValue: 120, min: 12 },
        { name: 'currentAmps', label: 'Circuit Load (Amperes)', type: 'number', required: true, defaultValue: 16, min: 1 },
        { name: 'oneWayDistanceFt', label: 'One-Way Conductor Length (ft)', type: 'number', required: true, defaultValue: 100, min: 5 },
        { name: 'wireGauge', label: 'Copper Wire Gauge', type: 'select', required: true, defaultValue: '12', options: [
          { label: '14 AWG (4,110 circular mils)', value: '4110' },
          { label: '12 AWG (6,530 circular mils)', value: '6530' },
          { label: '10 AWG (10,380 circular mils)', value: '10380' },
          { label: '8 AWG (16,510 circular mils)', value: '16510' },
          { label: '6 AWG (26,240 circular mils)', value: '26240' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { voltage: number; currentAmps: number; oneWayDistanceFt: number; wireGauge: string }) => {
      const cmil = parseInt(inputs.wireGauge, 10);
      const vDrop = (2 * 12.9 * inputs.currentAmps * inputs.oneWayDistanceFt) / cmil;
      const vDropPct = (vDrop / inputs.voltage) * 100;
      const endVoltage = inputs.voltage - vDrop;
      const necStatus = vDropPct <= 3.0 ? 'Acceptable (NEC <= 3%)' : 'Exceeds NEC 3% Limit (Upsize Wire)';
      return { vDrop, vDropPct, endVoltage, necStatus };
    },
    formatResult: (res: { vDrop: number; vDropPct: number; endVoltage: number; necStatus: string }) => ({
      primary: {
        label: 'Voltage Drop Percentage',
        value: `${res.vDropPct.toFixed(2)}%`,
        numericValue: res.vDropPct
      },
      secondary: [
        { label: 'Drop in Volts', value: `${res.vDrop.toFixed(2)} Volts` },
        { label: 'Voltage at End of Line', value: `${res.endVoltage.toFixed(1)} Volts` },
        { label: 'NEC Compliance', value: res.necStatus }
      ]
    })
  },

  // 10. NEC Conductor Wire Gauge & Ampacity Calculator
  {
    id: 'wire-ampacity-calc',
    name: 'NEC Conductor Wire Gauge & Ampacity Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    formulaMeta: {
      formulaName: 'NEC Table 310.16 Ampacity',
      formulaExpression: '14 AWG = 15A, 12 AWG = 20A, 10 AWG = 30A, 8 AWG = 40A, 6 AWG = 55A',
      variables: [{ symbol: 'Gauge', name: 'Recommended Wire' }]
    },
    inputSchema: {
      fields: [
        { name: 'breakerAmps', label: 'Circuit Breaker Rating (Amperes)', type: 'select', required: true, defaultValue: '20', options: [
          { label: '15 Amp Breaker', value: '15' },
          { label: '20 Amp Breaker', value: '20' },
          { label: '30 Amp Breaker', value: '30' },
          { label: '40 Amp Breaker', value: '40' },
          { label: '50 Amp Breaker', value: '50' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { breakerAmps: string }) => {
      const amps = parseInt(inputs.breakerAmps, 10);
      let awg = '14 AWG';
      let maxContinuous = 12;
      if (amps === 20) { awg = '12 AWG'; maxContinuous = 16; }
      else if (amps === 30) { awg = '10 AWG'; maxContinuous = 24; }
      else if (amps === 40) { awg = '8 AWG'; maxContinuous = 32; }
      else if (amps === 50) { awg = '6 AWG'; maxContinuous = 40; }
      return { awg, maxContinuous, amps };
    },
    formatResult: (res: { awg: string; maxContinuous: number; amps: number }) => ({
      primary: {
        label: 'Minimum Copper Wire Gauge',
        value: res.awg,
        numericValue: res.amps
      },
      secondary: [
        { label: '80% Max Continuous Load', value: `${res.maxContinuous} Amperes` }
      ]
    })
  },

  // 11. NEC Conduit Fill Capacity Calculator
  {
    id: 'conduit-fill-calc',
    name: 'NEC Conduit Fill Capacity Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    formulaMeta: {
      formulaName: '40% Conduit Fill Rule',
      formulaExpression: 'Fill % = (Total Wire Area / Conduit Area) × 100',
      variables: [{ symbol: 'Fill %', name: 'Conduit Space Utilization' }]
    },
    inputSchema: {
      fields: [
        { name: 'numWires', label: 'Number of THHN Wires in Conduit', type: 'integer', required: true, defaultValue: 6, min: 1, max: 20 },
        { name: 'conduitTradeSize', label: 'EMT Conduit Trade Size', type: 'select', required: true, defaultValue: '0.75', options: [
          { label: '1/2" EMT (Total Area 0.304 sq in)', value: '0.304' },
          { label: '3/4" EMT (Total Area 0.533 sq in)', value: '0.533' },
          { label: '1" EMT (Total Area 0.864 sq in)', value: '0.864' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { numWires: number; conduitTradeSize: string }) => {
      const conduitArea = parseFloat(inputs.conduitTradeSize);
      const wireArea12AWG = 0.0133;
      const totalWireArea = inputs.numWires * wireArea12AWG;
      const fillPct = (totalWireArea / conduitArea) * 100;
      const isCompliant = fillPct <= 40.0;
      return { fillPct, isCompliant, maxAllowedPct: 40.0 };
    },
    formatResult: (res: { fillPct: number; isCompliant: boolean; maxAllowedPct: number }) => ({
      primary: {
        label: 'Calculated Conduit Fill',
        value: `${res.fillPct.toFixed(1)}%`,
        numericValue: res.fillPct
      },
      secondary: [
        { label: 'NEC Code Status', value: res.isCompliant ? 'Compliant (Under 40% Max)' : 'Overfilled - Upsize Conduit' }
      ]
    })
  },

  // 12. Circuit Breaker Sizing Calculator
  {
    id: 'circuit-breaker-calc',
    name: 'Circuit Breaker Sizing (80% Continuous Rule) Calculator',
    category: 'electrical',
    subcategoryId: 'wire-sizing-drop',
    formulaMeta: {
      formulaName: 'NEC Breaker Rating Rule',
      formulaExpression: 'Rating = NonContinuous + (Continuous × 1.25)',
      variables: [{ symbol: 'Rating', name: 'Required Breaker Amps' }]
    },
    inputSchema: {
      fields: [
        { name: 'continuousLoadAmps', label: 'Continuous Load (>3 hrs, Amps)', type: 'number', required: true, defaultValue: 12, min: 0 },
        { name: 'intermittentAmps', label: 'Non-Continuous Load (Amps)', type: 'number', required: true, defaultValue: 4, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { continuousLoadAmps: number; intermittentAmps: number }) => {
      const minAmps = inputs.intermittentAmps + inputs.continuousLoadAmps * 1.25;
      const standardSizes = [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
      const selectedSize = standardSizes.find(s => s >= minAmps) || 100;
      return { minAmps, selectedSize };
    },
    formatResult: (res: { minAmps: number; selectedSize: number }) => ({
      primary: {
        label: 'Required Circuit Breaker',
        value: `${res.selectedSize} Amp Breaker`,
        numericValue: res.selectedSize
      },
      secondary: [
        { label: 'Exact Calculated Requirement', value: `${res.minAmps.toFixed(2)} Amperes (includes 125% factor)` }
      ]
    })
  },

  // 13. Series & Parallel Resistors Calculator
  {
    id: 'series-parallel-resistors-calc',
    name: 'Series & Parallel Resistors Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    formulaMeta: {
      formulaName: 'Equivalent Resistance',
      formulaExpression: 'Series: R1 + R2; Parallel: (R1 × R2) / (R1 + R2)',
      variables: [{ symbol: 'R_eq', name: 'Equivalent Resistance', unit: 'Ω' }]
    },
    inputSchema: {
      fields: [
        { name: 'r1', label: 'Resistor 1 (Ohms Ω)', type: 'number', required: true, defaultValue: 100, min: 0.1 },
        { name: 'r2', label: 'Resistor 2 (Ohms Ω)', type: 'number', required: true, defaultValue: 100, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { r1: number; r2: number }) => {
      const series = inputs.r1 + inputs.r2;
      const parallel = (inputs.r1 * inputs.r2) / (inputs.r1 + inputs.r2);
      return { series, parallel };
    },
    formatResult: (res: { series: number; parallel: number }) => ({
      primary: {
        label: 'Parallel Equivalent Resistance',
        value: `${res.parallel.toFixed(2)} Ω`,
        numericValue: res.parallel
      },
      secondary: [
        { label: 'Series Equivalent Resistance', value: `${res.series.toFixed(2)} Ω` }
      ]
    })
  },

  // 14. Capacitive Reactance (Xc) Calculator
  {
    id: 'capacitive-reactance-calc',
    name: 'Capacitive Reactance (Xc) Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    formulaMeta: {
      formulaName: 'Capacitive Reactance Formula',
      formulaExpression: 'Xc = 1 / (2 × π × f × C)',
      variables: [{ symbol: 'Xc', name: 'Capacitive Reactance', unit: 'Ω' }]
    },
    inputSchema: {
      fields: [
        { name: 'frequencyHz', label: 'AC Frequency (Hz, standard 60 Hz)', type: 'number', required: true, defaultValue: 60, min: 1 },
        { name: 'capacitanceMicroFarad', label: 'Capacitance (µF, Microfarads)', type: 'number', required: true, defaultValue: 47, min: 0.001 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { frequencyHz: number; capacitanceMicroFarad: number }) => {
      const cFarads = inputs.capacitanceMicroFarad * 1e-6;
      const xc = 1 / (2 * Math.PI * inputs.frequencyHz * cFarads);
      return { xc, freq: inputs.frequencyHz };
    },
    formatResult: (res: { xc: number; freq: number }) => ({
      primary: {
        label: 'Capacitive Reactance (Xc)',
        value: `${res.xc.toFixed(2)} Ω`,
        numericValue: res.xc
      },
      secondary: [
        { label: 'Frequency Tested', value: `${res.freq} Hz` }
      ]
    })
  },

  // 15. Inductive Reactance (XL) Calculator
  {
    id: 'inductive-reactance-calc',
    name: 'Inductive Reactance (XL) Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    formulaMeta: {
      formulaName: 'Inductive Reactance Formula',
      formulaExpression: 'XL = 2 × π × f × L',
      variables: [{ symbol: 'XL', name: 'Inductive Reactance', unit: 'Ω' }]
    },
    inputSchema: {
      fields: [
        { name: 'frequencyHz', label: 'AC Frequency (Hz)', type: 'number', required: true, defaultValue: 60, min: 1 },
        { name: 'inductanceMilliHenry', label: 'Inductance (mH, Millihenries)', type: 'number', required: true, defaultValue: 150, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { frequencyHz: number; inductanceMilliHenry: number }) => {
      const lHenries = inputs.inductanceMilliHenry * 1e-3;
      const xl = 2 * Math.PI * inputs.frequencyHz * lHenries;
      return { xl };
    },
    formatResult: (res: { xl: number }) => ({
      primary: {
        label: 'Inductive Reactance (XL)',
        value: `${res.xl.toFixed(2)} Ω`,
        numericValue: res.xl
      },
      secondary: [
        { label: 'Opposition', value: 'Impedance increases linearly with AC frequency' }
      ]
    })
  },

  // 16. LED Series Current Limiting Resistor Calculator
  {
    id: 'led-resistor-calc',
    name: 'LED Series Current Limiting Resistor Calculator',
    category: 'electrical',
    subcategoryId: 'circuits-impedance',
    formulaMeta: {
      formulaName: 'LED Dropping Resistor',
      formulaExpression: 'R = (V_supply - V_led) / I_led; Power = I² × R',
      variables: [{ symbol: 'R', name: 'Resistance', unit: 'Ω' }]
    },
    inputSchema: {
      fields: [
        { name: 'vSupply', label: 'Source Voltage (V, e.g. 5V, 9V, 12V)', type: 'number', required: true, defaultValue: 9.0, min: 1.5 },
        { name: 'vLed', label: 'LED Forward Voltage Drop (V, typically 2.0V red, 3.2V blue/white)', type: 'number', required: true, defaultValue: 2.1, min: 1.0 },
        { name: 'iLedMilliAmps', label: 'LED Forward Current (mA, typically 20 mA)', type: 'number', required: true, defaultValue: 20, min: 1, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { vSupply: number; vLed: number; iLedMilliAmps: number }) => {
      const vDrop = Math.max(0, inputs.vSupply - inputs.vLed);
      const iAmps = inputs.iLedMilliAmps / 1000;
      const rOhms = vDrop / iAmps;
      const powerWatts = Math.pow(iAmps, 2) * rOhms;
      return { rOhms: Math.round(rOhms), powerWatts, vDrop };
    },
    formatResult: (res: { rOhms: number; powerWatts: number; vDrop: number }) => ({
      primary: {
        label: 'Required Resistor Value',
        value: `${res.rOhms} Ω`,
        numericValue: res.rOhms
      },
      secondary: [
        { label: 'Minimum Resistor Rating', value: `${(res.powerWatts * 1000).toFixed(0)} mW (Use 1/4W resistor)` },
        { label: 'Voltage Dropped Across Resistor', value: `${res.vDrop.toFixed(2)} Volts` }
      ]
    })
  }
];
