import { CalculationContract } from '../types.ts';
import { ResultFormatter } from '../ResultFormatter.ts';

export const BATCH14_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. Crop Yield & Harvest Estimator
  {
    id: 'crop-yield-calc',
    name: 'Crop Yield & Harvest Estimator',
    category: 'agriculture-farming',
    subcategoryId: 'crop-management',
    formulaMeta: {
      formulaName: 'Agricultural Harvest Valuation Formula',
      formulaExpression: 'Total Harvest = Planted Acres × Expected Yield per Acre',
      variables: [
        { symbol: 'Acres', name: 'Planted Acres' },
        { symbol: 'Yield', name: 'Yield per Acre' },
        { symbol: 'Price', name: 'Market Price per Unit ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'plantedAcres', label: 'Planted Acres', type: 'number', required: true, defaultValue: 250, min: 1 },
        { name: 'yieldPerAcre', label: 'Expected Yield per Acre (Bushels / Tons)', type: 'number', required: true, defaultValue: 175, min: 0.1 },
        { name: 'marketPricePerUnit', label: 'Market Price per Bushel / Ton ($)', type: 'currency', required: true, defaultValue: 4.85, min: 0.01 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { plantedAcres: number; yieldPerAcre: number; marketPricePerUnit: number }) => {
      const totalHarvestOutput = inputs.plantedAcres * inputs.yieldPerAcre;
      const grossHarvestValue = totalHarvestOutput * inputs.marketPricePerUnit;
      const revenuePerAcre = inputs.plantedAcres > 0 ? grossHarvestValue / inputs.plantedAcres : 0;
      return { totalHarvestOutput, grossHarvestValue, revenuePerAcre };
    },
    formatResult: (res: { totalHarvestOutput: number; grossHarvestValue: number; revenuePerAcre: number }) => ({
      primary: {
        label: 'Estimated Gross Harvest Value',
        value: ResultFormatter.formatCurrency(res.grossHarvestValue),
        numericValue: res.grossHarvestValue
      },
      secondary: [
        { label: 'Total Harvest Output', value: `${res.totalHarvestOutput.toLocaleString()} units` },
        { label: 'Revenue per Acre', value: ResultFormatter.formatCurrency(res.revenuePerAcre) }
      ]
    })
  },

  // 2. Fertilizer N-P-K Application Calculator
  {
    id: 'fertilizer-npk-calc',
    name: 'Fertilizer N-P-K Application Calculator',
    category: 'agriculture-farming',
    subcategoryId: 'soil-nutrients',
    formulaMeta: {
      formulaName: 'Nutrient Application Weight Formula',
      formulaExpression: 'Fertilizer Weight = (Target Nutrient Need / Nutrient Grade %) × Acres',
      variables: [
        { symbol: 'Need', name: 'Target Need (lbs/acre)', unit: 'lbs' },
        { symbol: 'Grade', name: 'Fertilizer Grade (%)', unit: '%' },
        { symbol: 'Acres', name: 'Total Acres' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'targetNutrientPoundsPerAcre', label: 'Target Nutrient Need (lbs per acre)', type: 'number', required: true, defaultValue: 120, min: 1 },
        { name: 'fertilizerGradePercent', label: 'Fertilizer Grade Nutrient Percentage (%)', type: 'percentage', required: true, defaultValue: 46, min: 1, max: 100 },
        { name: 'totalAcres', label: 'Total Application Acres', type: 'number', required: true, defaultValue: 150, min: 1 },
        { name: 'costPerBag', label: 'Cost per 50 lb Fertilizer Bag ($)', type: 'currency', required: true, defaultValue: 28.50, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { targetNutrientPoundsPerAcre: number; fertilizerGradePercent: number; totalAcres: number; costPerBag: number }) => {
      const grade = inputs.fertilizerGradePercent / 100;
      const poundsFertilizerPerAcre = grade > 0 ? inputs.targetNutrientPoundsPerAcre / grade : 0;
      const totalPoundsNeeded = poundsFertilizerPerAcre * inputs.totalAcres;
      const totalBagsNeeded = Math.ceil(totalPoundsNeeded / 50); // standard 50 lb bags
      const totalFertilizerCost = totalBagsNeeded * inputs.costPerBag;
      return { poundsFertilizerPerAcre, totalPoundsNeeded, totalBagsNeeded, totalFertilizerCost };
    },
    formatResult: (res: { poundsFertilizerPerAcre: number; totalPoundsNeeded: number; totalBagsNeeded: number; totalFertilizerCost: number }) => ({
      primary: {
        label: 'Total Fertilizer Weight Needed',
        value: `${res.totalPoundsNeeded.toLocaleString()} lbs`,
        numericValue: res.totalPoundsNeeded
      },
      secondary: [
        { label: 'Total 50 lb Bags Required', value: `${res.totalBagsNeeded.toLocaleString()} bags` },
        { label: 'Total Fertilizer Cost', value: ResultFormatter.formatCurrency(res.totalFertilizerCost) },
        { label: 'Application Rate per Acre', value: `${res.poundsFertilizerPerAcre.toFixed(1)} lbs/acre` }
      ]
    })
  },

  // 3. Patient Wait Time & Facility Throughput
  {
    id: 'patient-wait-calc',
    name: 'Patient Wait Time & Facility Throughput',
    category: 'healthcare-operations',
    subcategoryId: 'clinic-management',
    formulaMeta: {
      formulaName: 'Multi-Server Clinic Queue Estimation Model',
      formulaExpression: 'Wait Time = (Probability in Queue × Service Time) / (Providers × (1 - Utilization))',
      variables: [
        { symbol: 'Arrival', name: 'Patient Arrival Rate (/hr)' },
        { symbol: 'Service', name: 'Provider Service Rate (/hr)' },
        { symbol: 'Servers', name: 'Active Providers' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'patientArrivalRatePerHour', label: 'Patient Arrival Rate (Patients / Hour)', type: 'number', required: true, defaultValue: 18, min: 1 },
        { name: 'providerServiceRatePerHour', label: 'Provider Service Rate (Patients / Hour / Provider)', type: 'number', required: true, defaultValue: 5, min: 0.1 },
        { name: 'activeProviders', label: 'Number of Active Providers / Stations', type: 'integer', required: true, defaultValue: 4, min: 1, max: 50 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { patientArrivalRatePerHour: number; providerServiceRatePerHour: number; activeProviders: number }) => {
      const lambda = inputs.patientArrivalRatePerHour;
      const mu = inputs.providerServiceRatePerHour;
      const c = inputs.activeProviders;

      const utilization = lambda / (c * mu);
      const safeUtilization = Math.min(0.98, Math.max(0.01, utilization));
      
      // Erlang-C approximation for average wait time in queue (hours)
      const serviceTimeHours = 1 / mu;
      const waitTimeHours = (safeUtilization / (c * (1 - safeUtilization))) * serviceTimeHours * 0.75; // empirical clinic smoothing factor
      const waitTimeMinutes = Math.max(0, waitTimeHours * 60);
      const totalVisitTimeMinutes = waitTimeMinutes + (serviceTimeHours * 60);

      return { waitTimeMinutes, totalVisitTimeMinutes, utilization: safeUtilization * 100 };
    },
    formatResult: (res: { waitTimeMinutes: number; totalVisitTimeMinutes: number; utilization: number }) => ({
      primary: {
        label: 'Average Patient Wait Time',
        value: `${res.waitTimeMinutes.toFixed(1)} minutes`,
        numericValue: res.waitTimeMinutes
      },
      secondary: [
        { label: 'Total Estimated Visit Duration', value: `${res.totalVisitTimeMinutes.toFixed(1)} minutes` },
        { label: 'Facility Provider Utilization', value: `${res.utilization.toFixed(1)}%` }
      ]
    })
  },

  // 4. Medical IV Drip Rate & Infusion Calculator
  {
    id: 'iv-drip-calc',
    name: 'Medical IV Drip Rate & Infusion Calculator',
    category: 'healthcare-operations',
    subcategoryId: 'clinical-admin',
    formulaMeta: {
      formulaName: 'Intravenous Infusion Flow Rate Formula',
      formulaExpression: 'Flow Rate (gtt/min) = (Volume in mL × Drop Factor) / Time in Minutes',
      variables: [
        { symbol: 'Vol', name: 'Total Volume (mL)', unit: 'mL' },
        { symbol: 'DF', name: 'Drop Factor (gtt/mL)' },
        { symbol: 'Time', name: 'Infusion Time (Hours)', unit: 'hr' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'totalVolumeMl', label: 'Total Fluid Volume (mL)', type: 'number', required: true, defaultValue: 1000, min: 1, description: 'Educational arithmetic only; actual IV administration must follow clinician orders and institutional protocols.' },
        { name: 'infusionTimeHours', label: 'Prescribed Infusion Time (Hours)', type: 'number', required: true, defaultValue: 8, min: 0.1, max: 72 },
        { name: 'dropFactorGttPerMl', label: 'IV Tubing Drop Factor (gtt/mL e.g. 10, 15, 20, 60)', type: 'integer', required: true, defaultValue: 15, min: 1, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { totalVolumeMl: number; infusionTimeHours: number; dropFactorGttPerMl: number }) => {
      const timeMinutes = inputs.infusionTimeHours * 60;
      const hourlyMlRate = inputs.infusionTimeHours > 0 ? inputs.totalVolumeMl / inputs.infusionTimeHours : 0;
      const flowRateGttPerMin = timeMinutes > 0 ? (inputs.totalVolumeMl * inputs.dropFactorGttPerMl) / timeMinutes : 0;
      const roundedGtt = Math.round(flowRateGttPerMin);
      return { hourlyMlRate, flowRateGttPerMin, roundedGtt };
    },
    formatResult: (res: { hourlyMlRate: number; flowRateGttPerMin: number; roundedGtt: number }) => ({
      primary: {
        label: 'IV Infusion Flow Rate',
        value: `${res.roundedGtt} gtt/min`,
        numericValue: res.flowRateGttPerMin
      },
      secondary: [
        { label: 'Exact Flow Rate', value: `${res.flowRateGttPerMin.toFixed(2)} drops/min` },
        { label: 'Hourly Volume Rate', value: `${res.hourlyMlRate.toFixed(1)} mL/hr` }
      ]
    })
  },

  // 5. Data Download Transfer Time Calculator
  {
    id: 'download-time-calc',
    name: 'Data Download Transfer Time Calculator',
    category: 'telecom-internet',
    subcategoryId: 'network-performance',
    formulaMeta: {
      formulaName: 'File Transfer Duration Formula',
      formulaExpression: 'Time (Seconds) = (File Size in Megabits) / Connection Speed (Mbps)',
      variables: [
        { symbol: 'Size', name: 'File Size (MB/GB)', unit: 'MB' },
        { symbol: 'Speed', name: 'Connection Speed (Mbps)', unit: 'Mbps' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'fileSizeValue', label: 'File Size Value', type: 'number', required: true, defaultValue: 45, min: 0.01 },
        { name: 'fileSizeUnit', label: 'File Size Unit (1=MB, 1024=GB)', type: 'select', required: true, defaultValue: 1024, options: [{ label: 'Megabytes (MB)', value: 1 }, { label: 'Gigabytes (GB)', value: 1024 }] },
        { name: 'connectionSpeedMbps', label: 'Internet Connection Speed (Mbps)', type: 'number', required: true, defaultValue: 350, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { fileSizeValue: number; fileSizeUnit: number; connectionSpeedMbps: number }) => {
      const sizeMb = inputs.fileSizeValue * inputs.fileSizeUnit;
      const sizeMegabits = sizeMb * 8; // 8 bits per byte
      const speed = inputs.connectionSpeedMbps;
      const totalSeconds = speed > 0 ? sizeMegabits / speed : 0;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      return { totalSeconds, hours, minutes, seconds };
    },
    formatResult: (res: { totalSeconds: number; hours: number; minutes: number; seconds: number }) => ({
      primary: {
        label: 'Estimated Download Time',
        value: res.hours > 0 ? `${res.hours}h ${res.minutes}m ${res.seconds}s` : res.minutes > 0 ? `${res.minutes}m ${res.seconds}s` : `${res.seconds} seconds`,
        numericValue: res.totalSeconds
      },
      secondary: [
        { label: 'Total Duration in Seconds', value: `${res.totalSeconds.toFixed(1)} seconds` }
      ]
    })
  },

  // 6. Network Latency & TCP Throughput Estimator
  {
    id: 'network-latency-calc',
    name: 'Network Latency & TCP Throughput Estimator',
    category: 'telecom-internet',
    subcategoryId: 'network-performance',
    formulaMeta: {
      formulaName: 'Bandwidth-Delay Product (BDP) Formula',
      formulaExpression: 'Max Throughput = TCP Window Size / Round Trip Time (RTT)',
      variables: [
        { symbol: 'Window', name: 'TCP Window Size (KB)', unit: 'KB' },
        { symbol: 'RTT', name: 'Round Trip Time (ms)', unit: 'ms' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'tcpWindowSizeKb', label: 'TCP Window Size (Kilobytes KB)', type: 'number', required: true, defaultValue: 64, min: 1 },
        { name: 'roundTripTimeMs', label: 'Round Trip Latency RTT (Milliseconds ms)', type: 'number', required: true, defaultValue: 45, min: 0.1 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { tcpWindowSizeKb: number; roundTripTimeMs: number }) => {
      // Window in bits = KB * 1024 * 8
      const windowBits = inputs.tcpWindowSizeKb * 1024 * 8;
      const rttSeconds = inputs.roundTripTimeMs / 1000;
      const maxThroughputBps = rttSeconds > 0 ? windowBits / rttSeconds : 0;
      const maxThroughputMbps = maxThroughputBps / 1000000;
      return { maxThroughputMbps };
    },
    formatResult: (res: { maxThroughputMbps: number }) => ({
      primary: {
        label: 'Max Theoretical TCP Throughput',
        value: `${res.maxThroughputMbps.toFixed(2)} Mbps`,
        numericValue: res.maxThroughputMbps
      },
      secondary: [
        { label: 'Throughput in Kilobytes/sec', value: `${(res.maxThroughputMbps * 125).toFixed(1)} KB/s` }
      ]
    })
  },

  // 7. Time Management & Pomodoro Planner
  {
    id: 'pomodoro-planner-calc',
    name: 'Time Management & Pomodoro Planner',
    category: 'personal-productivity',
    subcategoryId: 'time-management',
    formulaMeta: {
      formulaName: 'Pomodoro Task Scheduling Formula',
      formulaExpression: 'Sessions = Total Work Minutes / Focus Session Duration',
      variables: [
        { symbol: 'Hours', name: 'Task Estimated Hours' },
        { symbol: 'Focus', name: 'Focus Session (Minutes)' },
        { symbol: 'Break', name: 'Break Duration (Minutes)' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'taskEstimatedHours', label: 'Total Task Estimated Hours', type: 'number', required: true, defaultValue: 8, min: 0.25 },
        { name: 'focusSessionMinutes', label: 'Focus Session Duration (Minutes)', type: 'integer', required: true, defaultValue: 25, min: 5, max: 120 },
        { name: 'shortBreakMinutes', label: 'Short Break Duration (Minutes)', type: 'integer', required: true, defaultValue: 5, min: 1, max: 30 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { taskEstimatedHours: number; focusSessionMinutes: number; shortBreakMinutes: number }) => {
      const totalWorkMinutes = inputs.taskEstimatedHours * 60;
      const sessionLength = inputs.focusSessionMinutes;
      const pomodoroCount = sessionLength > 0 ? Math.ceil(totalWorkMinutes / sessionLength) : 0;
      const totalFocusTimeHours = totalWorkMinutes / 60;
      const totalBreakTimeHours = (pomodoroCount * inputs.shortBreakMinutes) / 60;
      const totalTimelineHours = totalFocusTimeHours + totalBreakTimeHours;

      return { pomodoroCount, totalFocusTimeHours, totalBreakTimeHours, totalTimelineHours };
    },
    formatResult: (res: { pomodoroCount: number; totalFocusTimeHours: number; totalBreakTimeHours: number; totalTimelineHours: number }) => ({
      primary: {
        label: 'Total Pomodoro Sessions Needed',
        value: `${res.pomodoroCount} sessions`,
        numericValue: res.pomodoroCount
      },
      secondary: [
        { label: 'Total Timeline Duration', value: `${res.totalTimelineHours.toFixed(1)} hours` },
        { label: 'Total Focus Work Time', value: `${res.totalFocusTimeHours.toFixed(1)} hours` },
        { label: 'Total Break Rest Time', value: `${res.totalBreakTimeHours.toFixed(1)} hours` }
      ]
    })
  },

  // 8. Daily Water Intake & Hydration Calculator
  {
    id: 'hydration-calc',
    name: 'Daily Water Intake & Hydration Calculator',
    category: 'personal-productivity',
    subcategoryId: 'personal-wellness',
    formulaMeta: {
      formulaName: 'Hydration & Water Requirement Formula',
      formulaExpression: 'Water (oz) = (Body Weight × 0.5) + (Exercise Minutes × 12)',
      variables: [
        { symbol: 'Wt', name: 'Body Weight (lbs)', unit: 'lbs' },
        { symbol: 'Ex', name: 'Exercise (Minutes)', unit: 'min' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'bodyWeightLbs', label: 'Body Weight (Pounds lbs)', type: 'number', required: true, defaultValue: 165, min: 50, description: 'General wellness estimate only; not an individualized medical prescription.' },
        { name: 'dailyExerciseMinutes', label: 'Daily Exercise / Workout Duration (Minutes)', type: 'number', required: true, defaultValue: 45, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { bodyWeightLbs: number; dailyExerciseMinutes: number }) => {
      const baseWaterOz = inputs.bodyWeightLbs * 0.5;
      const exerciseWaterOz = (inputs.dailyExerciseMinutes / 30) * 12; // 12 oz per 30 mins exercise
      const totalWaterOz = baseWaterOz + exerciseWaterOz;
      const totalWaterLitres = totalWaterOz * 0.0295735; // fluid oz to liters
      const standardGlasses = totalWaterOz / 8; // 8 oz glasses

      return { totalWaterOz, totalWaterLitres, standardGlasses };
    },
    formatResult: (res: { totalWaterOz: number; totalWaterLitres: number; standardGlasses: number }) => ({
      primary: {
        label: 'Recommended Daily Water Intake',
        value: `${res.totalWaterOz.toFixed(1)} fl oz`,
        numericValue: res.totalWaterOz
      },
      secondary: [
        { label: 'Equivalent in Liters', value: `${res.totalWaterLitres.toFixed(2)} Liters` },
        { label: 'Standard 8 oz Glasses', value: `${res.standardGlasses.toFixed(1)} glasses` }
      ]
    })
  },

  // 9. Personal Net Worth & Asset Growth Planner
  {
    id: 'net-worth-calc',
    name: 'Personal Net Worth & Asset Growth Planner',
    category: 'personal-productivity',
    subcategoryId: 'personal-finance',
    formulaMeta: {
      formulaName: 'Personal Balance Sheet Net Worth Formula',
      formulaExpression: 'Net Worth = Total Assets - Total Liabilities',
      variables: [
        { symbol: 'Assets', name: 'Total Liquid & Fixed Assets ($)', unit: '$' },
        { symbol: 'Liab', name: 'Total Debts & Liabilities ($)', unit: '$' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'cashAndSavings', label: 'Cash & Checking Savings ($)', type: 'currency', required: true, defaultValue: 25000, min: 0 },
        { name: 'investmentsRetirement', label: 'Investments & Retirement Accounts ($)', type: 'currency', required: true, defaultValue: 110000, min: 0 },
        { name: 'realEstateEquity', label: 'Real Estate & Property Value ($)', type: 'currency', required: true, defaultValue: 350000, min: 0 },
        { name: 'totalLiabilities', label: 'Total Debts (Mortgage, Loans, Credit Cards) ($)', type: 'currency', required: true, defaultValue: 280000, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { cashAndSavings: number; investmentsRetirement: number; realEstateEquity: number; totalLiabilities: number }) => {
      const totalAssets = inputs.cashAndSavings + inputs.investmentsRetirement + inputs.realEstateEquity;
      const netWorth = totalAssets - inputs.totalLiabilities;
      const debtToAssetRatio = totalAssets > 0 ? (inputs.totalLiabilities / totalAssets) * 100 : 0;
      return { totalAssets, netWorth, debtToAssetRatio, totalLiabilities: inputs.totalLiabilities };
    },
    formatResult: (res: { totalAssets: number; netWorth: number; debtToAssetRatio: number; totalLiabilities: number }) => ({
      primary: {
        label: 'Total Personal Net Worth',
        value: ResultFormatter.formatCurrency(res.netWorth),
        numericValue: res.netWorth
      },
      secondary: [
        { label: 'Total Assets', value: ResultFormatter.formatCurrency(res.totalAssets) },
        { label: 'Total Liabilities & Debt', value: ResultFormatter.formatCurrency(res.totalLiabilities) },
        { label: 'Debt-to-Asset Ratio', value: `${res.debtToAssetRatio.toFixed(1)}%` }
      ]
    })
  },

  // 10. Habit Streak Success & Goal Probability
  {
    id: 'habit-streak-calc',
    name: 'Habit Streak Success & Goal Probability',
    category: 'personal-productivity',
    subcategoryId: 'goal-tracking',
    formulaMeta: {
      formulaName: 'Habit Consistency Success Rate Formula',
      formulaExpression: 'Success Rate = (Successful Days Completed / Days Tracked) × 100',
      variables: [
        { symbol: 'Done', name: 'Successful Days' },
        { symbol: 'Tracked', name: 'Total Days Tracked' }
      ]
    },
    inputSchema: {
      fields: [
        { name: 'daysTracked', label: 'Total Days Tracked', type: 'integer', required: true, defaultValue: 60, min: 1 },
        { name: 'successfulDays', label: 'Successful Days Completed', type: 'integer', required: true, defaultValue: 51, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { daysTracked: number; successfulDays: number }) => {
      const tracked = inputs.daysTracked;
      const success = Math.min(tracked, inputs.successfulDays);
      const successRate = tracked > 0 ? (success / tracked) * 100 : 0;
      const projectedAnnualCompletions = (successRate / 100) * 365;

      return { successRate, projectedAnnualCompletions, success };
    },
    formatResult: (res: { successRate: number; projectedAnnualCompletions: number; success: number }) => ({
      primary: {
        label: 'Habit Success Rate',
        value: `${res.successRate.toFixed(2)}%`,
        numericValue: res.successRate
      },
      secondary: [
        { label: 'Projected Annual Completions', value: `${res.projectedAnnualCompletions.toFixed(0)} days/year` },
        { label: 'Successful Days Completed', value: `${res.success} days` }
      ]
    })
  }
];
