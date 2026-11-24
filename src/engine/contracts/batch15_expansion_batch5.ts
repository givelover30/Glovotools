import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH15_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Carbon Footprint & CO₂ Emission Estimator
  {
    id: 'carbon-footprint-calc',
    name: 'Carbon Footprint & CO₂ Emission Estimator',
    category: 'environmental-sustainability',
    subcategoryId: 'carbon-accounting',
    formulaMeta: {
      formulaName: 'Household Carbon Emissions Formula',
      formulaExpression: 'Total CO₂ = (Electricity × EF_Elec) + (Gas × EF_Gas) + (Miles × EF_Car) + (Hours × EF_Flight)',
      variables: [
        { symbol: 'Elec', name: 'Annual Electricity (kWh)', unit: 'kWh' },
        { symbol: 'Gas', name: 'Natural Gas (Therms)', unit: 'therms' },
        { symbol: 'Miles', name: 'Vehicle Miles', unit: 'mi' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'annualElectricityKwh', label: 'Annual Electricity Consumption (kWh)', type: 'number', required: true, defaultValue: 10500, min: 0 },
        { name: 'annualNaturalGasTherms', label: 'Annual Natural Gas Consumption (Therms)', type: 'number', required: true, defaultValue: 650, min: 0 },
        { name: 'annualVehicleMiles', label: 'Annual Vehicle Miles Driven', type: 'number', required: true, defaultValue: 12000, min: 0 },
        { name: 'annualFlightHours', label: 'Annual Air Travel (Flight Hours)', type: 'number', required: true, defaultValue: 10, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualElectricityKwh: number; annualNaturalGasTherms: number; annualVehicleMiles: number; annualFlightHours: number }) => {
      // EPA Greenhouse Gas Emission Factors (approximate metric tons CO2 per unit)
      // Electricity: ~0.000417 metric tons CO2 / kWh
      // Natural Gas: ~0.005302 metric tons CO2 / therm
      // Vehicle: ~0.000378 metric tons CO2 / mile
      // Flight: ~0.090000 metric tons CO2 / flight hour
      const elecTons = inputs.annualElectricityKwh * 0.000417;
      const gasTons = inputs.annualNaturalGasTherms * 0.005302;
      const carTons = inputs.annualVehicleMiles * 0.000378;
      const flightTons = inputs.annualFlightHours * 0.090000;

      const totalCo2MetricTons = elecTons + gasTons + carTons + flightTons;

      return { totalCo2MetricTons, elecTons, gasTons, carTons, flightTons };
    },
    formatResult: (res: { totalCo2MetricTons: number; elecTons: number; gasTons: number; carTons: number; flightTons: number }) => ({
      primary: {
        label: 'Total Annual CO₂ Emissions',
        value: `${res.totalCo2MetricTons.toFixed(2)} Metric Tons`,
        numericValue: res.totalCo2MetricTons
      },
      secondary: [
        { label: 'Electricity Emissions', value: `${res.elecTons.toFixed(2)} Tons` },
        { label: 'Natural Gas Emissions', value: `${res.gasTons.toFixed(2)} Tons` },
        { label: 'Vehicle Driving Emissions', value: `${res.carTons.toFixed(2)} Tons` },
        { label: 'Air Travel Emissions', value: `${res.flightTons.toFixed(2)} Tons` }
      ]
    })
  },

  // 2. Home Solar Energy & Carbon Offset Calculator
  {
    id: 'home-carbon-offset-calc',
    name: 'Home Solar Energy & Carbon Offset Calculator',
    category: 'environmental-sustainability',
    subcategoryId: 'renewable-offset',
    formulaMeta: {
      formulaName: 'Solar CO₂ Offset Formula',
      formulaExpression: 'Offset (Tons) = (Solar Generation kWh × Grid Emission Factor) / 2204.62',
      variables: [
        { symbol: 'Solar', name: 'Annual Solar kWh', unit: 'kWh' },
        { symbol: 'EF', name: 'Grid Emission Factor (lbs CO₂/kWh)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'annualSolarGenerationKwh', label: 'Annual Solar Generation (kWh)', type: 'number', required: true, defaultValue: 9500, min: 100 },
        { name: 'gridEmissionFactorLbsPerKwh', label: 'Regional Grid Emission Factor (lbs CO₂ / kWh)', type: 'number', required: true, defaultValue: 0.85, min: 0.01, max: 3.0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { annualSolarGenerationKwh: number; gridEmissionFactorLbsPerKwh: number }) => {
      const totalLbsCo2Offset = inputs.annualSolarGenerationKwh * inputs.gridEmissionFactorLbsPerKwh;
      const metricTonsOffset = totalLbsCo2Offset / 2204.62;
      const equivalentTreesPlanted = Math.round(metricTonsOffset * 16.5); // ~16.5 mature trees sequester 1 metric ton CO2/yr
      return { metricTonsOffset, totalLbsCo2Offset, equivalentTreesPlanted };
    },
    formatResult: (res: { metricTonsOffset: number; totalLbsCo2Offset: number; equivalentTreesPlanted: number }) => ({
      primary: {
        label: 'Annual CO₂ Offset',
        value: `${res.metricTonsOffset.toFixed(2)} Metric Tons`,
        numericValue: res.metricTonsOffset
      },
      secondary: [
        { label: 'Total Pounds CO₂ Offset', value: `${res.totalLbsCo2Offset.toLocaleString()} lbs` },
        { label: 'Equivalent Mature Trees Planted', value: `${res.equivalentTreesPlanted.toLocaleString()} trees` }
      ]
    })
  },

  // 3. Restaurant Recipe Cost & Pricing Calculator
  {
    id: 'recipe-cost-calc',
    name: 'Restaurant Recipe Cost & Pricing Calculator',
    category: 'food-service',
    subcategoryId: 'menu-costing',
    formulaMeta: {
      formulaName: 'Menu Item Pricing Formula',
      formulaExpression: 'Menu Price = Total Plate Cost / (Target Food Cost % / 100)',
      variables: [
        { symbol: 'Cost', name: 'Total Plate Cost ($)', unit: '$' },
        { symbol: 'FC', name: 'Target Food Cost (%)', unit: '%' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'totalPlateCost', label: 'Total Recipe / Ingredient Plate Cost ($)', type: 'currency', required: true, defaultValue: 4.25, min: 0.01 },
        { name: 'targetFoodCostPercent', label: 'Target Food Cost Percentage (%)', type: 'percentage', required: true, defaultValue: 28, min: 5, max: 90 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalPlateCost: number; targetFoodCostPercent: number }) => {
      const fc = inputs.targetFoodCostPercent / 100;
      const recommendedMenuPrice = fc > 0 ? inputs.totalPlateCost / fc : 0;
      const grossProfitPerDish = recommendedMenuPrice - inputs.totalPlateCost;
      const actualFoodCostPercent = recommendedMenuPrice > 0 ? (inputs.totalPlateCost / recommendedMenuPrice) * 100 : 0;
      return { recommendedMenuPrice, grossProfitPerDish, actualFoodCostPercent, totalPlateCost: inputs.totalPlateCost };
    },
    formatResult: (res: { recommendedMenuPrice: number; grossProfitPerDish: number; actualFoodCostPercent: number; totalPlateCost: number }) => ({
      primary: {
        label: 'Recommended Menu Price',
        value: ResultFormatter.formatCurrency(res.recommendedMenuPrice),
        numericValue: res.recommendedMenuPrice
      },
      secondary: [
        { label: 'Gross Profit per Dish', value: ResultFormatter.formatCurrency(res.grossProfitPerDish) },
        { label: 'Actual Food Cost Percentage', value: `${res.actualFoodCostPercent.toFixed(1)}%` },
        { label: 'Total Plate Cost', value: ResultFormatter.formatCurrency(res.totalPlateCost) }
      ]
    })
  },

  // 4. Restaurant Table Turnover & Seating Capacity
  {
    id: 'table-turnover-calc',
    name: 'Restaurant Table Turnover & Seating Capacity',
    category: 'food-service',
    subcategoryId: 'restaurant-operations',
    formulaMeta: {
      formulaName: 'Dining Capacity & Turnover Formula',
      formulaExpression: 'Capacity = Seats × (Operating Minutes / Average Meal Duration)',
      variables: [
        { symbol: 'Seats', name: 'Dining Seats' },
        { symbol: 'Hours', name: 'Operating Hours' },
        { symbol: 'Dur', name: 'Meal Duration (Mins)', unit: 'min' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'diningSeats', label: 'Total Restaurant Dining Seats', type: 'integer', required: true, defaultValue: 80, min: 1 },
        { name: 'operatingHours', label: 'Daily Operating Hours', type: 'number', required: true, defaultValue: 6, min: 0.5, max: 24 },
        { name: 'averageMealDurationMinutes', label: 'Average Meal Duration (Minutes)', type: 'integer', required: true, defaultValue: 65, min: 10, max: 300 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { diningSeats: number; operatingHours: number; averageMealDurationMinutes: number }) => {
      const operatingMinutes = inputs.operatingHours * 60;
      const turnsPerDay = inputs.averageMealDurationMinutes > 0 ? operatingMinutes / inputs.averageMealDurationMinutes : 0;
      const maxDailyGuests = Math.round(inputs.diningSeats * turnsPerDay);
      return { turnsPerDay, maxDailyGuests, diningSeats: inputs.diningSeats };
    },
    formatResult: (res: { turnsPerDay: number; maxDailyGuests: number; diningSeats: number }) => ({
      primary: {
        label: 'Max Daily Guest Capacity',
        value: `${res.maxDailyGuests.toLocaleString()} guests`,
        numericValue: res.maxDailyGuests
      },
      secondary: [
        { label: 'Table Turnover Rate (Turns/Day)', value: `${res.turnsPerDay.toFixed(2)} turns` },
        { label: 'Total Dining Seats', value: `${res.diningSeats} seats` }
      ]
    })
  },

  // 5. Flight Ground Speed & Airspeed Calculator
  {
    id: 'flight-airspeed-calc',
    name: 'Flight Ground Speed & Airspeed Calculator',
    category: 'aviation-transport',
    subcategoryId: 'flight-navigation',
    formulaMeta: {
      formulaName: 'Flight Navigation Vector Airspeed Formula',
      formulaExpression: 'Ground Speed = True Airspeed ± Headwind / Tailwind Component',
      variables: [
        { symbol: 'TAS', name: 'True Airspeed (Knots)', unit: 'kts' },
        { symbol: 'Wind', name: 'Wind Component (Knots)', unit: 'kts' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'trueAirspeedKnots', label: 'True Airspeed TAS (Knots)', type: 'number', required: true, defaultValue: 145, min: 1 },
        { name: 'windComponentKnots', label: 'Wind Component (+Tailwind, -Headwind in Knots)', type: 'number', required: true, defaultValue: -20, min: -150, max: 150 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { trueAirspeedKnots: number; windComponentKnots: number }) => {
      const tas = inputs.trueAirspeedKnots;
      const wind = inputs.windComponentKnots;
      const groundSpeed = Math.max(0, tas + wind);
      return { groundSpeed, tas, wind };
    },
    formatResult: (res: { groundSpeed: number; tas: number; wind: number }) => ({
      primary: {
        label: 'Aircraft Ground Speed (GS)',
        value: `${res.groundSpeed.toFixed(1)} knots`,
        numericValue: res.groundSpeed
      },
      secondary: [
        { label: 'True Airspeed (TAS)', value: `${res.tas} knots` },
        { label: 'Wind Effect Component', value: `${res.wind > 0 ? '+' : ''}${res.wind} kts` }
      ]
    })
  },

  // 6. Aircraft Fuel Burn & Flight Range Estimator
  {
    id: 'flight-fuel-calc',
    name: 'Aircraft Fuel Burn & Flight Range Estimator',
    category: 'aviation-transport',
    subcategoryId: 'flight-planning',
    formulaMeta: {
      formulaName: 'Aviation Fuel Range Formula',
      formulaExpression: 'Max Range = (Usable Fuel / Burn Rate) × Cruising Speed',
      variables: [
        { symbol: 'Fuel', name: 'Usable Fuel (Gal)', unit: 'gal' },
        { symbol: 'Burn', name: 'Fuel Burn Rate (Gal/hr)', unit: 'gph' },
        { symbol: 'Speed', name: 'Cruising Speed (Knots)', unit: 'kts' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'usableFuelGallons', label: 'Usable Fuel Capacity (Gallons)', type: 'number', required: true, defaultValue: 56, min: 1 },
        { name: 'fuelBurnRateGph', label: 'Fuel Burn Rate (Gallons per Hour GPH)', type: 'number', required: true, defaultValue: 9.5, min: 0.1 },
        { name: 'cruisingSpeedKnots', label: 'Cruising Speed (Knots TAS)', type: 'number', required: true, defaultValue: 135, min: 1 },
        { name: 'reserveMinutes', label: 'Required Fuel Reserve (Minutes)', type: 'number', required: true, defaultValue: 45, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { usableFuelGallons: number; fuelBurnRateGph: number; cruisingSpeedKnots: number; reserveMinutes: number }) => {
      const fuel = inputs.usableFuelGallons;
      const burn = inputs.fuelBurnRateGph;
      const speed = inputs.cruisingSpeedKnots;
      const reserveHours = inputs.reserveMinutes / 60;

      const totalFlightHours = burn > 0 ? fuel / burn : 0;
      const usableFlightHours = Math.max(0, totalFlightHours - reserveHours);
      const maximumRangeNm = usableFlightHours * speed;

      return { totalFlightHours, usableFlightHours, maximumRangeNm };
    },
    formatResult: (res: { totalFlightHours: number; usableFlightHours: number; maximumRangeNm: number }) => ({
      primary: {
        label: 'Maximum Flight Range',
        value: `${res.maximumRangeNm.toFixed(1)} Nautical Miles`,
        numericValue: res.maximumRangeNm
      },
      secondary: [
        { label: 'Usable Flight Time (w/ Reserve)', value: `${res.usableFlightHours.toFixed(2)} hours` },
        { label: 'Total Endurance', value: `${res.totalFlightHours.toFixed(2)} hours` }
      ]
    })
  },

  // 7. Password Entropy & Crack Time Estimator
  {
    id: 'password-entropy-calc',
    name: 'Password Entropy & Crack Time Estimator',
    category: 'cybersecurity-data',
    subcategoryId: 'information-security',
    formulaMeta: {
      formulaName: 'Password Bit Entropy Formula',
      formulaExpression: 'Entropy (Bits) = Length × log₂(Charset Size)',
      variables: [
        { symbol: 'L', name: 'Password Length' },
        { symbol: 'CS', name: 'Character Set Size' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'passwordLength', label: 'Password Character Length', type: 'integer', required: true, defaultValue: 14, min: 1, max: 128 },
        { name: 'hasLowercase', label: 'Include Lowercase (a-z)', type: 'checkbox', required: false, defaultValue: true },
        { name: 'hasUppercase', label: 'Include Uppercase (A-Z)', type: 'checkbox', required: false, defaultValue: true },
        { name: 'hasNumbers', label: 'Include Numbers (0-9)', type: 'checkbox', required: false, defaultValue: true },
        { name: 'hasSymbols', label: 'Include Symbols (!@#$)', type: 'checkbox', required: false, defaultValue: true }
      ]
    },
    validate: () => [],
    calculate: (inputs: { passwordLength: number; hasLowercase: boolean; hasUppercase: boolean; hasNumbers: boolean; hasSymbols: boolean }) => {
      let charsetSize = 0;
      if (inputs.hasLowercase) charsetSize += 26;
      if (inputs.hasUppercase) charsetSize += 26;
      if (inputs.hasNumbers) charsetSize += 10;
      if (inputs.hasSymbols) charsetSize += 32;

      if (charsetSize === 0) charsetSize = 26; // fallback

      const entropyBits = inputs.passwordLength * Math.log2(charsetSize);
      // Brute-force guesses per second: e.g. 10 billion guesses/sec
      const guessesPerSecond = 10000000000;
      const totalPossibleCombinations = Math.pow(charsetSize, inputs.passwordLength);
      const averageSecondsToCrack = totalPossibleCombinations / (guessesPerSecond * 2);

      let crackTimeString = 'Instantly';
      if (averageSecondsToCrack > 31536000000) {
        crackTimeString = 'Centuries+';
      } else if (averageSecondsToCrack > 31536000) {
        crackTimeString = `${(averageSecondsToCrack / 31536000).toFixed(1)} Years`;
      } else if (averageSecondsToCrack > 86400) {
        crackTimeString = `${(averageSecondsToCrack / 86400).toFixed(1)} Days`;
      } else if (averageSecondsToCrack > 60) {
        crackTimeString = `${(averageSecondsToCrack / 60).toFixed(1)} Minutes`;
      } else {
        crackTimeString = `${averageSecondsToCrack.toFixed(1)} Seconds`;
      }

      return { entropyBits, crackTimeString, charsetSize };
    },
    formatResult: (res: { entropyBits: number; crackTimeString: string; charsetSize: number }) => ({
      primary: {
        label: 'Password Bit Entropy',
        value: `${res.entropyBits.toFixed(1)} bits`,
        numericValue: res.entropyBits
      },
      secondary: [
        { label: 'Estimated Brute-Force Crack Time', value: res.crackTimeString },
        { label: 'Character Set Size (Charset)', value: `${res.charsetSize} characters` }
      ]
    })
  },

  // 8. Cloud Storage Transfer Time & Cost Calculator
  {
    id: 'cloud-storage-transfer-calc',
    name: 'Cloud Storage Transfer Time & Cost Calculator',
    category: 'cybersecurity-data',
    subcategoryId: 'cloud-infrastructure',
    formulaMeta: {
      formulaName: 'Cloud Migration & Storage Cost Formula',
      formulaExpression: 'Transfer Time = Data Size / Bandwidth, Monthly Cost = Terabytes × Price/TB',
      variables: [
        { symbol: 'Size', name: 'Data Volume (TB)', unit: 'TB' },
        { symbol: 'Speed', name: 'Bandwidth (Mbps)', unit: 'Mbps' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'dataVolumeTerabytes', label: 'Total Data Volume (Terabytes TB)', type: 'number', required: true, defaultValue: 25, min: 0.1 },
        { name: 'uploadBandwidthMbps', label: 'Upload Bandwidth Speed (Mbps)', type: 'number', required: true, defaultValue: 500, min: 1 },
        { name: 'storageCostPerGb', label: 'Monthly Storage Cost per GB ($)', type: 'currency', required: true, defaultValue: 0.023, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { dataVolumeTerabytes: number; uploadBandwidthMbps: number; storageCostPerGb: number }) => {
      const dataGigabytes = inputs.dataVolumeTerabytes * 1024;
      const dataMegabits = dataGigabytes * 1024 * 8;
      const speed = inputs.uploadBandwidthMbps;
      const totalSeconds = speed > 0 ? dataMegabits / speed : 0;
      
      const hours = totalSeconds / 3600;
      const days = hours / 24;

      const monthlyStorageCost = dataGigabytes * inputs.storageCostPerGb;

      return { totalSeconds, hours, days, monthlyStorageCost };
    },
    formatResult: (res: { totalSeconds: number; hours: number; days: number; monthlyStorageCost: number }) => ({
      primary: {
        label: 'Estimated Migration Transfer Time',
        value: res.days >= 1 ? `${res.days.toFixed(1)} days` : `${res.hours.toFixed(1)} hours`,
        numericValue: res.days
      },
      secondary: [
        { label: 'Monthly Cloud Storage Cost', value: ResultFormatter.formatCurrency(res.monthlyStorageCost) },
        { label: 'Total Transfer Duration in Hours', value: `${res.hours.toFixed(1)} hours` }
      ]
    })
  },

  // 9. RAID Storage Capacity & Fault Tolerance Calculator
  {
    id: 'raid-capacity-calc',
    name: 'RAID Storage Capacity & Fault Tolerance',
    category: 'cybersecurity-data',
    subcategoryId: 'data-storage',
    formulaMeta: {
      formulaName: 'RAID Array Capacity Formulas',
      formulaExpression: 'Usable Capacity per RAID Level Standard (0, 1, 5, 6, 10)',
      variables: [
        { symbol: 'Drives', name: 'Number of Drives' },
        { symbol: 'Cap', name: 'Drive Capacity (TB)', unit: 'TB' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'driveCount', label: 'Number of Hard Drives / SSDs', type: 'integer', required: true, defaultValue: 6, min: 2, max: 64 },
        { name: 'driveCapacityTb', label: 'Individual Drive Capacity (Terabytes TB)', type: 'number', required: true, defaultValue: 4, min: 0.1 },
        { name: 'raidLevel', label: 'RAID Level (0, 1, 5, 6, 10)', type: 'select', required: true, defaultValue: 5, options: [
          { label: 'RAID 0 (Striping - No Redundancy)', value: 0 },
          { label: 'RAID 1 (Mirroring)', value: 1 },
          { label: 'RAID 5 (Distributed Parity)', value: 5 },
          { label: 'RAID 6 (Dual Parity)', value: 6 },
          { label: 'RAID 10 (Striped & Mirrored)', value: 10 }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { driveCount: number; driveCapacityTb: number; raidLevel: number }) => {
      const n = inputs.driveCount;
      const c = inputs.driveCapacityTb;
      const level = inputs.raidLevel;

      let usableCapacityTb = 0;
      let faultTolerance = 'None';

      if (level === 0) {
        usableCapacityTb = n * c;
        faultTolerance = '0 drives (No failure survivability)';
      } else if (level === 1) {
        usableCapacityTb = (n / 2) * c;
        faultTolerance = '1 to N/2 drives (Depends on mirrored pairs)';
      } else if (level === 5) {
        usableCapacityTb = (n - 1) * c;
        faultTolerance = '1 drive failure';
      } else if (level === 6) {
        usableCapacityTb = (n - 2) * c;
        faultTolerance = '2 simultaneous drive failures';
      } else if (level === 10) {
        usableCapacityTb = (n / 2) * c;
        faultTolerance = '1 drive per mirrored pair';
      }

      const totalRawCapacityTb = n * c;

      return { usableCapacityTb, totalRawCapacityTb, faultTolerance };
    },
    formatResult: (res: { usableCapacityTb: number; totalRawCapacityTb: number; faultTolerance: string }) => ({
      primary: {
        label: 'Usable Storage Capacity',
        value: `${res.usableCapacityTb.toFixed(1)} TB`,
        numericValue: res.usableCapacityTb
      },
      secondary: [
        { label: 'Drive Fault Tolerance', value: res.faultTolerance },
        { label: 'Total Raw Array Capacity', value: `${res.totalRawCapacityTb.toFixed(1)} TB` }
      ]
    })
  },

  // 10. Data Center PUE Calculator
  {
    id: 'pue-calc',
    name: 'Data Center PUE Calculator',
    category: 'cybersecurity-data',
    subcategoryId: 'datacenter-efficiency',
    formulaMeta: {
      formulaName: 'Power Usage Effectiveness Formula',
      formulaExpression: 'PUE = Total Facility Energy / IT Equipment Energy',
      variables: [
        { symbol: 'Facility', name: 'Total Facility Power (kW)', unit: 'kW' },
        { symbol: 'IT', name: 'IT Equipment Power (kW)', unit: 'kW' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'totalFacilityPowerKw', label: 'Total Facility Power Consumption (kW)', type: 'number', required: true, defaultValue: 1250, min: 1 },
        { name: 'itEquipmentPowerKw', label: 'IT Equipment Power Consumption (kW)', type: 'number', required: true, defaultValue: 1000, min: 1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalFacilityPowerKw: number; itEquipmentPowerKw: number }) => {
      const facility = inputs.totalFacilityPowerKw;
      const it = inputs.itEquipmentPowerKw;
      const pue = it > 0 ? facility / it : 0;
      const overheadPercentage = pue > 0 ? ((pue - 1) / pue) * 100 : 0;
      return { pue, overheadPercentage };
    },
    formatResult: (res: { pue: number; overheadPercentage: number }) => ({
      primary: {
        label: 'Data Center PUE Ratio',
        value: res.pue.toFixed(2),
        numericValue: res.pue
      },
      secondary: [
        { label: 'Facility Overhead Energy', value: `${res.overheadPercentage.toFixed(1)}%` },
        { label: 'Efficiency Rating', value: res.pue <= 1.2 ? 'World Class' : res.pue <= 1.5 ? 'Efficient' : 'Standard / Needs Optimization' }
      ]
    })
  }
];
