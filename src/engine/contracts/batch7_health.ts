import { CalculationContract, CalculationError } from '../types.ts';
import { FormulaEngine } from '../FormulaEngine.ts';
import { ResultFormatter } from '../ResultFormatter.ts';
import { PrecisionEngine } from '../PrecisionEngine.ts';

export const BATCH7_CONTRACTS: CalculationContract<any, any>[] = [
  // 1. US Navy Body Fat Calculator
  {
    id: 'body-fat-navy-calc',
    name: 'US Navy Body Fat Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'US Navy Circumference Method',
      formulaExpression: 'BF % = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76',
      variables: [{ symbol: 'BF %', name: 'Body Fat Percentage', unit: '%' }]
    },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Biological Sex', type: 'select', required: true, defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]},
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 48, max: 88 },
        { name: 'neckInches', label: 'Neck Circumference (inches)', type: 'number', required: true, defaultValue: 15.5, min: 10, max: 25 },
        { name: 'waistInches', label: 'Waist Circumference (at navel, inches)', type: 'number', required: true, defaultValue: 34, min: 20, max: 60 },
        { name: 'hipInches', label: 'Hip Circumference (females only, inches)', type: 'number', required: false, defaultValue: 38, min: 25, max: 70 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { gender: string; heightInches: number; neckInches: number; waistInches: number; hipInches?: number }) => {
      let bodyFat = 0;
      if (inputs.gender === 'male') {
        bodyFat = 86.010 * Math.log10(Math.max(1, inputs.waistInches - inputs.neckInches)) - 70.041 * Math.log10(inputs.heightInches) + 36.76;
      } else {
        const hip = inputs.hipInches || 38;
        bodyFat = 163.205 * Math.log10(Math.max(1, inputs.waistInches + hip - inputs.neckInches)) - 97.684 * Math.log10(inputs.heightInches) - 78.387;
      }
      bodyFat = Math.max(3, Math.min(60, bodyFat));
      let category = 'Fitness';
      if (bodyFat < 14) category = 'Athletes / Essential Fat';
      else if (bodyFat <= 17) category = 'Fitness Range';
      else if (bodyFat <= 24) category = 'Average / Acceptable';
      else category = 'Above Average / High';
      return { bodyFat, category };
    },
    formatResult: (res: { bodyFat: number; category: string }) => ({
      primary: {
        label: 'Estimated Body Fat',
        value: `${res.bodyFat.toFixed(1)}%`,
        numericValue: res.bodyFat
      },
      secondary: [
        { label: 'Fitness Classification', value: res.category }
      ]
    })
  },

  // 2. Ideal Body Weight (IBW) Calculator
  {
    id: 'ideal-body-weight-calc',
    name: 'Ideal Body Weight (IBW) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'Devine & Robinson Formulas',
      formulaExpression: 'Devine Male: 50kg + 2.3kg/in > 5ft; Female: 45.5kg + 2.3kg/in',
      variables: [{ symbol: 'IBW', name: 'Ideal Weight', unit: 'lbs' }]
    },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Biological Sex', type: 'select', required: true, defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]},
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 60, max: 84 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { gender: string; heightInches: number }) => {
      const inchesOver60 = Math.max(0, inputs.heightInches - 60);
      let devineKg = inputs.gender === 'male' ? 50 + 2.3 * inchesOver60 : 45.5 + 2.3 * inchesOver60;
      let robinsonKg = inputs.gender === 'male' ? 52 + 1.9 * inchesOver60 : 49 + 1.7 * inchesOver60;
      const devineLbs = devineKg * 2.20462;
      const robinsonLbs = robinsonKg * 2.20462;
      return { devineLbs, robinsonLbs, devineKg };
    },
    formatResult: (res: { devineLbs: number; robinsonLbs: number; devineKg: number }) => ({
      primary: {
        label: 'Ideal Weight (Devine Formula)',
        value: `${res.devineLbs.toFixed(1)} lbs (${res.devineKg.toFixed(1)} kg)`,
        numericValue: res.devineLbs
      },
      secondary: [
        { label: 'Robinson Formula', value: `${res.robinsonLbs.toFixed(1)} lbs` }
      ]
    })
  },

  // 3. Lean Body Mass (LBM) Calculator
  {
    id: 'lean-body-mass-calc',
    name: 'Lean Body Mass (LBM) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'Boer Equation',
      formulaExpression: 'Boer Male: 0.407W + 0.267H - 19.2',
      variables: [{ symbol: 'LBM', name: 'Lean Body Mass', unit: 'lbs' }]
    },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Gender', type: 'select', required: true, defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]},
        { name: 'weightLbs', label: 'Current Weight (lbs)', type: 'number', required: true, defaultValue: 180, min: 80, max: 450 },
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 50, max: 85 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { gender: string; weightLbs: number; heightInches: number }) => {
      const wKg = inputs.weightLbs / 2.20462;
      const hCm = inputs.heightInches * 2.54;
      let lbmKg = 0;
      if (inputs.gender === 'male') {
        lbmKg = 0.407 * wKg + 0.267 * hCm - 19.2;
      } else {
        lbmKg = 0.252 * wKg + 0.473 * hCm - 48.3;
      }
      const lbmLbs = lbmKg * 2.20462;
      const fatLbs = Math.max(0, inputs.weightLbs - lbmLbs);
      const fatPct = (fatLbs / inputs.weightLbs) * 100;
      return { lbmLbs, fatLbs, fatPct };
    },
    formatResult: (res: { lbmLbs: number; fatLbs: number; fatPct: number }) => ({
      primary: {
        label: 'Lean Muscle & Skeletal Mass',
        value: `${res.lbmLbs.toFixed(1)} lbs`,
        numericValue: res.lbmLbs
      },
      secondary: [
        { label: 'Body Fat Mass', value: `${res.fatLbs.toFixed(1)} lbs (${res.fatPct.toFixed(1)}%)` }
      ]
    })
  },

  // 4. Waist-to-Hip Ratio (WHR) Calculator
  {
    id: 'waist-to-hip-calc',
    name: 'Waist-to-Hip Ratio (WHR) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'WHO WHR Metric',
      formulaExpression: 'WHR = Waist / Hip',
      variables: [{ symbol: 'WHR', name: 'Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Gender', type: 'select', required: true, defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]},
        { name: 'waist', label: 'Waist Circumference (inches)', type: 'number', required: true, defaultValue: 33, min: 20 },
        { name: 'hip', label: 'Hip Circumference (inches)', type: 'number', required: true, defaultValue: 38, min: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { gender: string; waist: number; hip: number }) => {
      const whr = inputs.waist / inputs.hip;
      let risk = 'Low Health Risk';
      if (inputs.gender === 'male') {
        if (whr > 0.95) risk = 'High Cardiovascular Risk';
        else if (whr > 0.90) risk = 'Moderate Risk';
      } else {
        if (whr > 0.85) risk = 'High Cardiovascular Risk';
        else if (whr > 0.80) risk = 'Moderate Risk';
      }
      return { whr, risk };
    },
    formatResult: (res: { whr: number; risk: string }) => ({
      primary: {
        label: 'Waist-to-Hip Ratio',
        value: `${res.whr.toFixed(2)}`,
        numericValue: res.whr
      },
      secondary: [
        { label: 'Health Risk Profile', value: res.risk }
      ]
    })
  },

  // 5. Waist-to-Height Ratio (WHtR) Calculator
  {
    id: 'waist-to-height-calc',
    name: 'Waist-to-Height Ratio (WHtR) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'Ashwell WHtR Benchmark',
      formulaExpression: 'WHtR = Waist / Height',
      variables: [{ symbol: 'WHtR', name: 'Ratio' }]
    },
    inputSchema: {
      fields: [
        { name: 'waistInches', label: 'Waist Circumference (inches)', type: 'number', required: true, defaultValue: 34, min: 20 },
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { waistInches: number; heightInches: number }) => {
      const whtr = inputs.waistInches / inputs.heightInches;
      let status = 'Healthy (Under 0.50)';
      if (whtr > 0.60) status = 'Very High Risk (Over 0.60)';
      else if (whtr > 0.50) status = 'Increased Risk (Over 0.50)';
      return { whtr, status };
    },
    formatResult: (res: { whtr: number; status: string }) => ({
      primary: {
        label: 'Waist-to-Height Ratio',
        value: `${res.whtr.toFixed(2)}`,
        numericValue: res.whtr
      },
      secondary: [
        { label: 'Metabolic Classification', value: res.status },
        { label: 'Rule of Thumb', value: 'Keep your waist circumference to less than half your height' }
      ]
    })
  },

  // 6. Body Surface Area (BSA) Calculator
  {
    id: 'body-surface-area-calc',
    name: 'Body Surface Area (BSA) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    formulaMeta: {
      formulaName: 'Mosteller BSA Equation',
      formulaExpression: 'BSA (m²) = √((Height cm × Weight kg) / 3600)',
      variables: [{ symbol: 'BSA', name: 'Surface Area', unit: 'm²' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightLbs', label: 'Body Weight (lbs)', type: 'number', required: true, defaultValue: 175, min: 50 },
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 40 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { weightLbs: number; heightInches: number }) => {
      const wKg = inputs.weightLbs / 2.20462;
      const hCm = inputs.heightInches * 2.54;
      const bsa = Math.sqrt((hCm * wKg) / 3600);
      return { bsa, wKg, hCm };
    },
    formatResult: (res: { bsa: number; wKg: number; hCm: number }) => ({
      primary: {
        label: 'Body Surface Area (BSA)',
        value: `${res.bsa.toFixed(2)} m²`,
        numericValue: res.bsa
      },
      secondary: [
        { label: 'Clinical Metric', value: 'Used for precise pharmacological dosing & cardiac index' }
      ]
    })
  },

  // 7. Calorie Deficit & Weight Loss Date Calculator
  {
    id: 'calorie-deficit-calc',
    name: 'Calorie Deficit & Weight Loss Date Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Fat Loss Timeline',
      formulaExpression: 'Days = (Pounds to Lose × 3500) / Daily Deficit',
      variables: [{ symbol: 'Days', name: 'Days to Goal' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentWeight', label: 'Current Weight (lbs)', type: 'number', required: true, defaultValue: 200, min: 90 },
        { name: 'goalWeight', label: 'Goal Weight (lbs)', type: 'number', required: true, defaultValue: 180, min: 80 },
        { name: 'dailyDeficit', label: 'Planned Daily Deficit (calories)', type: 'number', required: true, defaultValue: 500, min: 200, max: 1200 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentWeight: number; goalWeight: number; dailyDeficit: number }) => {
      const lbsToLose = Math.max(0, inputs.currentWeight - inputs.goalWeight);
      const totalCalories = lbsToLose * 3500;
      const days = Math.round(totalCalories / inputs.dailyDeficit);
      const weeks = (days / 7).toFixed(1);
      const weeklyLossLbs = (inputs.dailyDeficit * 7) / 3500;
      return { days, weeks, lbsToLose, weeklyLossLbs };
    },
    formatResult: (res: { days: number; weeks: string; lbsToLose: number; weeklyLossLbs: number }) => ({
      primary: {
        label: 'Estimated Time to Goal',
        value: `${res.days} days (~${res.weeks} weeks)`,
        numericValue: res.days
      },
      secondary: [
        { label: 'Pounds to Lose', value: `${res.lbsToLose} lbs` },
        { label: 'Pace of Loss', value: `${res.weeklyLossLbs.toFixed(1)} lbs / week` }
      ]
    })
  },

  // 8. Exercise Calories Burned (MET) Calculator
  {
    id: 'calories-burned-activity-calc',
    name: 'Exercise Calories Burned (MET) Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Metabolic Equivalent of Task',
      formulaExpression: 'Calories = (MET × 3.5 × Weight kg / 200) × Duration min',
      variables: [{ symbol: 'Calories', name: 'Calories Expended' }]
    },
    inputSchema: {
      fields: [
        { name: 'activity', label: 'Activity Type', type: 'select', required: true, defaultValue: 'running', options: [
          { label: 'Running (6 mph / 10 min mile, MET 9.8)', value: '9.8' },
          { label: 'Walking (Brisk 3.5 mph, MET 3.8)', value: '3.8' },
          { label: 'Cycling (Moderate 12-14 mph, MET 8.0)', value: '8.0' },
          { label: 'Swimming (Freestyle moderate, MET 7.0)', value: '7.0' },
          { label: 'Weight Lifting (Vigorous, MET 6.0)', value: '6.0' },
          { label: 'HIIT / Circuit Training (MET 8.0)', value: '8.0' }
        ]},
        { name: 'weightLbs', label: 'Body Weight (lbs)', type: 'number', required: true, defaultValue: 175, min: 80 },
        { name: 'durationMin', label: 'Workout Duration (minutes)', type: 'number', required: true, defaultValue: 45, min: 5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { activity: string; weightLbs: number; durationMin: number }) => {
      const met = parseFloat(inputs.activity);
      const wKg = inputs.weightLbs / 2.20462;
      const calories = ((met * 3.5 * wKg) / 200) * inputs.durationMin;
      return { calories: Math.round(calories), met, duration: inputs.durationMin };
    },
    formatResult: (res: { calories: number; met: number; duration: number }) => ({
      primary: {
        label: 'Total Calories Burned',
        value: `${res.calories} kcal`,
        numericValue: res.calories
      },
      secondary: [
        { label: 'Burn Rate', value: `${(res.calories / res.duration).toFixed(1)} kcal / min` }
      ]
    })
  },

  // 9. Intermittent Fasting Schedule Calculator
  {
    id: 'intermittent-fasting-calc',
    name: 'Intermittent Fasting Schedule Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Intermittent Fasting Window',
      formulaExpression: 'Fast End = Last Meal Time + Fasting Duration',
      variables: [{ symbol: 'Window', name: 'Feeding & Fasting Span' }]
    },
    inputSchema: {
      fields: [
        { name: 'protocol', label: 'Fasting Protocol', type: 'select', required: true, defaultValue: '16-8', options: [
          { label: '16:8 Protocol (16h Fast / 8h Eating Window)', value: '16' },
          { label: '18:6 Protocol (18h Fast / 6h Eating Window)', value: '18' },
          { label: '20:4 Protocol (Warrior Diet - 20h Fast / 4h Eat)', value: '20' }
        ]},
        { name: 'dinnerHour', label: 'Time of Last Meal (Hour 0-23, e.g. 20 for 8 PM)', type: 'integer', required: true, defaultValue: 20, min: 0, max: 23 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { protocol: string; dinnerHour: number }) => {
      const fastHours = parseInt(inputs.protocol, 10);
      const feedHours = 24 - fastHours;
      const breakFastHour = (inputs.dinnerHour + fastHours) % 24;
      return { fastHours, feedHours, breakFastHour };
    },
    formatResult: (res: { fastHours: number; feedHours: number; breakFastHour: number }) => ({
      primary: {
        label: 'Next Eating Window Starts',
        value: `${res.breakFastHour}:00 (${res.fastHours}h Fast)`,
        numericValue: res.breakFastHour
      },
      secondary: [
        { label: 'Fasting Window', value: `${res.fastHours} hours daily` },
        { label: 'Feeding Window', value: `${res.feedHours} hours daily` }
      ]
    })
  },

  // 10. Harris-Benedict BMR Calculator
  {
    id: 'harris-benedict-calc',
    name: 'Harris-Benedict BMR Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Revised Harris-Benedict Equation',
      formulaExpression: 'BMR = 88.362 + (13.397×W) + (4.799×H) - (5.677×Age)',
      variables: [{ symbol: 'BMR', name: 'Basal Metabolic Rate', unit: 'kcal' }]
    },
    inputSchema: {
      fields: [
        { name: 'gender', label: 'Gender', type: 'select', required: true, defaultValue: 'male', options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ]},
        { name: 'weightLbs', label: 'Weight (lbs)', type: 'number', required: true, defaultValue: 175, min: 80 },
        { name: 'heightInches', label: 'Height (inches)', type: 'number', required: true, defaultValue: 70, min: 48 },
        { name: 'age', label: 'Age (years)', type: 'integer', required: true, defaultValue: 30, min: 15, max: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { gender: string; weightLbs: number; heightInches: number; age: number }) => {
      const wKg = inputs.weightLbs / 2.20462;
      const hCm = inputs.heightInches * 2.54;
      let bmr = 0;
      if (inputs.gender === 'male') {
        bmr = 88.362 + 13.397 * wKg + 4.799 * hCm - 5.677 * inputs.age;
      } else {
        bmr = 447.593 + 9.247 * wKg + 3.098 * hCm - 4.330 * inputs.age;
      }
      const moderateTDEE = bmr * 1.55;
      return { bmr: Math.round(bmr), moderateTDEE: Math.round(moderateTDEE) };
    },
    formatResult: (res: { bmr: number; moderateTDEE: number }) => ({
      primary: {
        label: 'Basal Metabolic Rate (BMR)',
        value: `${res.bmr} kcal / day`,
        numericValue: res.bmr
      },
      secondary: [
        { label: 'Estimated Maintenance (Moderate Activity)', value: `${res.moderateTDEE} kcal / day` }
      ]
    })
  },

  // 11. Heart Rate Ratio VO2 Max Calculator
  {
    id: 'resting-heart-rate-vo2-calc',
    name: 'Heart Rate Ratio VO2 Max Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    formulaMeta: {
      formulaName: 'Uth-Sørensen Equation',
      formulaExpression: 'VO2 Max ≈ 15.3 × (HRmax / HRrest)',
      variables: [{ symbol: 'VO2 Max', name: 'Max Aerobic Capacity', unit: 'ml/kg/min' }]
    },
    inputSchema: {
      fields: [
        { name: 'age', label: 'Age (years)', type: 'integer', required: true, defaultValue: 32, min: 18, max: 90 },
        { name: 'restingHR', label: 'Resting Heart Rate (bpm)', type: 'number', required: true, defaultValue: 62, min: 40, max: 110 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { age: number; restingHR: number }) => {
      const hrMax = 220 - inputs.age;
      const vo2Max = 15.3 * (hrMax / inputs.restingHR);
      let rating = 'Good';
      if (vo2Max > 52) rating = 'Superior / Elite';
      else if (vo2Max > 43) rating = 'Excellent';
      else if (vo2Max > 36) rating = 'Good / Average';
      else rating = 'Below Average';
      return { vo2Max, hrMax, rating };
    },
    formatResult: (res: { vo2Max: number; hrMax: number; rating: string }) => ({
      primary: {
        label: 'Estimated VO2 Max',
        value: `${res.vo2Max.toFixed(1)} ml/kg/min`,
        numericValue: res.vo2Max
      },
      secondary: [
        { label: 'Aerobic Fitness Grade', value: res.rating },
        { label: 'Estimated Max HR', value: `${res.hrMax} bpm` }
      ]
    })
  },

  // 12. Karvonen Heart Rate Zone Calculator
  {
    id: 'karvonen-heart-rate-calc',
    name: 'Karvonen Heart Rate Zone Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'Heart Rate Reserve (HRR) Method',
      formulaExpression: 'Target = ((HRmax - HRrest) × Intensity) + HRrest',
      variables: [{ symbol: 'Target', name: 'Target Heart Rate' }]
    },
    inputSchema: {
      fields: [
        { name: 'age', label: 'Age', type: 'integer', required: true, defaultValue: 30, min: 15, max: 90 },
        { name: 'restingHR', label: 'Resting Heart Rate (bpm)', type: 'number', required: true, defaultValue: 60, min: 40, max: 110 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { age: number; restingHR: number }) => {
      const maxHR = 220 - inputs.age;
      const hrr = maxHR - inputs.restingHR;
      const z1 = Math.round(hrr * 0.55 + inputs.restingHR);
      const z2 = Math.round(hrr * 0.65 + inputs.restingHR);
      const z3 = Math.round(hrr * 0.75 + inputs.restingHR);
      const z4 = Math.round(hrr * 0.85 + inputs.restingHR);
      const z5 = Math.round(hrr * 0.95 + inputs.restingHR);
      return { maxHR, hrr, z1, z2, z3, z4, z5 };
    },
    formatResult: (res: { maxHR: number; hrr: number; z1: number; z2: number; z3: number; z4: number; z5: number }) => ({
      primary: {
        label: 'Zone 2 (Aerobic Base)',
        value: `${res.z1} - ${res.z2} bpm`,
        numericValue: res.z2
      },
      secondary: [
        { label: 'Zone 3 (Tempo / Aerobic)', value: `${res.z2} - ${res.z3} bpm` },
        { label: 'Zone 4 (Threshold)', value: `${res.z3} - ${res.z4} bpm` },
        { label: 'Zone 5 (VO2 Max Anaerobic)', value: `${res.z4} - ${res.z5} bpm` }
      ]
    })
  },

  // 13. Zone 2 Heart Rate Endurance Calculator
  {
    id: 'zone-2-cardio-calc',
    name: 'Zone 2 Heart Rate Endurance Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'Zone 2 Metabolic Window',
      formulaExpression: 'Zone 2 = 60% to 70% of HRmax',
      variables: [{ symbol: 'Zone 2', name: 'Mitochondrial Training Range' }]
    },
    inputSchema: {
      fields: [
        { name: 'age', label: 'Age (years)', type: 'integer', required: true, defaultValue: 35, min: 18, max: 85 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { age: number }) => {
      const hrMax = 208 - 0.7 * inputs.age;
      const low = Math.round(hrMax * 0.60);
      const high = Math.round(hrMax * 0.70);
      return { low, high, hrMax: Math.round(hrMax) };
    },
    formatResult: (res: { low: number; high: number; hrMax: number }) => ({
      primary: {
        label: 'Target Zone 2 Heart Rate',
        value: `${res.low} - ${res.high} bpm`,
        numericValue: (res.low + res.high) / 2
      },
      secondary: [
        { label: 'Max HR (Tanaka Formula)', value: `${res.hrMax} bpm` },
        { label: 'Physiological Goal', value: 'Maximizes fat oxidation & mitochondrial capillary density' }
      ]
    })
  },

  // 14. Cooper 12-Minute Run VO2 Max Calculator
  {
    id: 'vo2-max-running-calc',
    name: 'Cooper 12-Minute Run VO2 Max Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'Cooper Test Formula',
      formulaExpression: 'VO2 Max = (Distance in meters - 504.9) / 44.73',
      variables: [{ symbol: 'VO2 Max', name: 'Aerobic Fitness', unit: 'ml/kg/min' }]
    },
    inputSchema: {
      fields: [
        { name: 'distanceMiles', label: 'Distance Covered in 12 Minutes (miles)', type: 'number', required: true, defaultValue: 1.5, min: 0.5, max: 3.5 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { distanceMiles: number }) => {
      const meters = inputs.distanceMiles * 1609.34;
      const vo2 = (meters - 504.9) / 44.73;
      return { vo2, meters };
    },
    formatResult: (res: { vo2: number; meters: number }) => ({
      primary: {
        label: 'Estimated VO2 Max',
        value: `${res.vo2.toFixed(1)} ml/kg/min`,
        numericValue: res.vo2
      },
      secondary: [
        { label: 'Total Distance', value: `${Math.round(res.meters)} meters` }
      ]
    })
  },

  // 15. One-Rep Max (1RM) Calculator
  {
    id: 'one-rep-max-calc',
    name: 'One-Rep Max (1RM) Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'Epley & Brzycki 1RM Formulas',
      formulaExpression: '1RM = Weight × (1 + Reps / 30)',
      variables: [{ symbol: '1RM', name: 'One-Rep Max Weight', unit: 'lbs' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightLifted', label: 'Weight Lifted (lbs)', type: 'number', required: true, defaultValue: 225, min: 20 },
        { name: 'reps', label: 'Repetitions Completed', type: 'integer', required: true, defaultValue: 5, min: 1, max: 20 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { weightLifted: number; reps: number }) => {
      const epley = inputs.weightLifted * (1 + inputs.reps / 30);
      const brzycki = inputs.weightLifted / (1.0278 - 0.0278 * inputs.reps);
      const avg1RM = Math.round((epley + brzycki) / 2);
      const pct90 = Math.round(avg1RM * 0.90);
      const pct80 = Math.round(avg1RM * 0.80);
      const pct70 = Math.round(avg1RM * 0.70);
      return { avg1RM, pct90, pct80, pct70 };
    },
    formatResult: (res: { avg1RM: number; pct90: number; pct80: number; pct70: number }) => ({
      primary: {
        label: 'Predicted One-Rep Max (1RM)',
        value: `${res.avg1RM} lbs`,
        numericValue: res.avg1RM
      },
      secondary: [
        { label: '90% 1RM (Heavy Triple)', value: `${res.pct90} lbs` },
        { label: '80% 1RM (Hypertrophy ~8 reps)', value: `${res.pct80} lbs` },
        { label: '70% 1RM (Speed / Volume ~12 reps)', value: `${res.pct70} lbs` }
      ]
    })
  },

  // 16. Running Pace & Race Time Calculator
  {
    id: 'running-pace-calc',
    name: 'Running Pace & Race Time Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'Pace & Split Calculations',
      formulaExpression: 'Pace = Time / Distance; Finish Time = Pace × Distance',
      variables: [{ symbol: 'Pace', name: 'Pace per Mile' }]
    },
    inputSchema: {
      fields: [
        { name: 'paceMin', label: 'Pace - Minutes', type: 'integer', required: true, defaultValue: 8, min: 4, max: 20 },
        { name: 'paceSec', label: 'Pace - Seconds', type: 'integer', required: true, defaultValue: 30, min: 0, max: 59 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { paceMin: number; paceSec: number }) => {
      const paceDecimal = inputs.paceMin + inputs.paceSec / 60;
      const time5k = paceDecimal * 3.10686;
      const time10k = paceDecimal * 6.21371;
      const timeHalf = paceDecimal * 13.1093;
      const timeMarathon = paceDecimal * 26.21875;
      const fmtTime = (min: number) => {
        const h = Math.floor(min / 60);
        const m = Math.floor(min % 60);
        const s = Math.round((min % 1) * 60);
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
      };
      return {
        paceStr: `${inputs.paceMin}:${inputs.paceSec.toString().padStart(2, '0')}/mile`,
        fmt5k: fmtTime(time5k),
        fmt10k: fmtTime(time10k),
        fmtHalf: fmtTime(timeHalf),
        fmtMarathon: fmtTime(timeMarathon),
        marathonMinutes: timeMarathon
      };
    },
    formatResult: (res: { paceStr: string; fmt5k: string; fmt10k: string; fmtHalf: string; fmtMarathon: string; marathonMinutes: number }) => ({
      primary: {
        label: 'Marathon Finish Time',
        value: res.fmtMarathon,
        numericValue: res.marathonMinutes
      },
      secondary: [
        { label: '5K Time', value: res.fmt5k },
        { label: '10K Time', value: res.fmt10k },
        { label: 'Half Marathon Time', value: res.fmtHalf }
      ]
    })
  },

  // 17. Wilks & DOTS Powerlifting Calculator
  {
    id: 'wilks-score-calc',
    name: 'Wilks & DOTS Powerlifting Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    formulaMeta: {
      formulaName: 'DOTS Strength Score',
      formulaExpression: 'Score = Total Lifted × DOTS Coefficient',
      variables: [{ symbol: 'Score', name: 'DOTS Points' }]
    },
    inputSchema: {
      fields: [
        { name: 'bodyweightKg', label: 'Lifter Bodyweight (kg)', type: 'number', required: true, defaultValue: 83, min: 40, max: 200 },
        { name: 'totalLiftedKg', label: '3-Lift Total (Squat + Bench + Deadlift in kg)', type: 'number', required: true, defaultValue: 550, min: 100 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { bodyweightKg: number; totalLiftedKg: number }) => {
      // DOTS coefficient approximation for men
      const bw = inputs.bodyweightKg;
      const coeff = 500 / (-0.000001093 * Math.pow(bw, 4) + 0.000739129 * Math.pow(bw, 3) - 0.191876 * Math.pow(bw, 2) + 24.0901 * bw - 307.75);
      const dotsScore = inputs.totalLiftedKg * coeff;
      return { dotsScore: Math.round(dotsScore * 10) / 10, totalKg: inputs.totalLiftedKg };
    },
    formatResult: (res: { dotsScore: number; totalKg: number }) => ({
      primary: {
        label: 'DOTS Powerlifting Score',
        value: `${res.dotsScore} pts`,
        numericValue: res.dotsScore
      },
      secondary: [
        { label: 'Classification', value: res.dotsScore > 450 ? 'National / Elite Class' : res.dotsScore > 375 ? 'Advanced Competitive' : 'Intermediate Lifter' }
      ]
    })
  },

  // 18. Daily Protein Requirement Calculator
  {
    id: 'macro-protein-calc',
    name: 'Daily Protein Requirement Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Protein by Body Weight and Goal',
      formulaExpression: 'Protein Grams = Weight lbs × Goal Factor',
      variables: [{ symbol: 'Protein', name: 'Daily Target Protein', unit: 'g' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightLbs', label: 'Current Body Weight (lbs)', type: 'number', required: true, defaultValue: 175, min: 80 },
        { name: 'goal', label: 'Training Goal', type: 'select', required: true, defaultValue: 'hypertrophy', options: [
          { label: 'Muscle Building & Hypertrophy (1.0 g/lb)', value: '1.0' },
          { label: 'Fat Loss & Muscle Retention (1.1 g/lb)', value: '1.1' },
          { label: 'Endurance Athlete (0.7 g/lb)', value: '0.7' },
          { label: 'Sedentary Maintenance (0.4 g/lb)', value: '0.4' }
        ]}
      ]
    },
    validate: () => [],
    calculate: (inputs: { weightLbs: number; goal: string }) => {
      const factor = parseFloat(inputs.goal);
      const proteinGrams = Math.round(inputs.weightLbs * factor);
      const caloriesFromProtein = proteinGrams * 4;
      return { proteinGrams, caloriesFromProtein, weightLbs: inputs.weightLbs };
    },
    formatResult: (res: { proteinGrams: number; caloriesFromProtein: number; weightLbs: number }) => ({
      primary: {
        label: 'Recommended Daily Protein',
        value: `${res.proteinGrams} grams / day`,
        numericValue: res.proteinGrams
      },
      secondary: [
        { label: 'Calories from Protein', value: `${res.caloriesFromProtein} kcal (4 kcal/g)` },
        { label: 'Per Meal Target', value: `~${Math.round(res.proteinGrams / 4)}g across 4 meals` }
      ]
    })
  },

  // 19. Ketogenic Diet Macro Calculator
  {
    id: 'keto-macro-calc',
    name: 'Ketogenic Diet Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Standard Keto Ratios',
      formulaExpression: 'Fat: 70%, Protein: 25%, Net Carbs: 5%',
      variables: [{ symbol: 'Macros', name: 'Grams per Macro' }]
    },
    inputSchema: {
      fields: [
        { name: 'dailyCalories', label: 'Target Daily Calories (kcal)', type: 'integer', required: true, defaultValue: 2000, min: 1000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { dailyCalories: number }) => {
      const fatCalories = inputs.dailyCalories * 0.70;
      const proteinCalories = inputs.dailyCalories * 0.25;
      const carbCalories = inputs.dailyCalories * 0.05;
      const fatGrams = Math.round(fatCalories / 9);
      const proteinGrams = Math.round(proteinCalories / 4);
      const carbGrams = Math.round(carbCalories / 4);
      return { fatGrams, proteinGrams, carbGrams, calories: inputs.dailyCalories };
    },
    formatResult: (res: { fatGrams: number; proteinGrams: number; carbGrams: number; calories: number }) => ({
      primary: {
        label: 'Ketogenic Fat Target (70%)',
        value: `${res.fatGrams}g Fat / day`,
        numericValue: res.fatGrams
      },
      secondary: [
        { label: 'Protein Target (25%)', value: `${res.proteinGrams}g Protein` },
        { label: 'Net Carb Limit (5%)', value: `${res.carbGrams}g Net Carbs` }
      ]
    })
  },

  // 20. Daily Water Intake & Hydration Calculator
  {
    id: 'water-intake-calc',
    name: 'Daily Water Intake & Hydration Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Hydration Formula',
      formulaExpression: 'Fluid Oz = (Weight lbs × 0.5) + (Exercise min / 30 × 12)',
      variables: [{ symbol: 'Fluid Oz', name: 'Daily Water Target' }]
    },
    inputSchema: {
      fields: [
        { name: 'weightLbs', label: 'Body Weight (lbs)', type: 'number', required: true, defaultValue: 170, min: 70 },
        { name: 'exerciseMin', label: 'Daily Exercise (minutes)', type: 'integer', required: true, defaultValue: 45, min: 0 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { weightLbs: number; exerciseMin: number }) => {
      const baseOz = inputs.weightLbs * 0.5;
      const exerciseOz = (inputs.exerciseMin / 30) * 12;
      const totalOz = Math.round(baseOz + exerciseOz);
      const liters = (totalOz * 0.0295735).toFixed(1);
      const glasses8oz = Math.round(totalOz / 8);
      return { totalOz, liters, glasses8oz };
    },
    formatResult: (res: { totalOz: number; liters: string; glasses8oz: number }) => ({
      primary: {
        label: 'Daily Water Goal',
        value: `${res.totalOz} fluid oz (${res.liters} Liters)`,
        numericValue: res.totalOz
      },
      secondary: [
        { label: 'Standard 8 oz Glasses', value: `~${res.glasses8oz} glasses` }
      ]
    })
  },

  // 21. Carbohydrate Cycling Macro Calculator
  {
    id: 'carb-cycling-calc',
    name: 'Carbohydrate Cycling Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Carb Cycling Calorie Distribution',
      formulaExpression: 'High Day: Maintenance + 15%; Low Day: Maintenance - 20%',
      variables: [{ symbol: 'High/Low', name: 'Calorie & Carb Targets' }]
    },
    inputSchema: {
      fields: [
        { name: 'maintenanceCalories', label: 'Maintenance Calories (kcal)', type: 'integer', required: true, defaultValue: 2400, min: 1200 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { maintenanceCalories: number }) => {
      const highCal = Math.round(inputs.maintenanceCalories * 1.15);
      const lowCal = Math.round(inputs.maintenanceCalories * 0.80);
      const highCarbs = Math.round((highCal * 0.50) / 4);
      const lowCarbs = Math.round((lowCal * 0.20) / 4);
      return { highCal, lowCal, highCarbs, lowCarbs };
    },
    formatResult: (res: { highCal: number; lowCal: number; highCarbs: number; lowCarbs: number }) => ({
      primary: {
        label: 'High-Carb Training Day',
        value: `${res.highCal} kcal (${res.highCarbs}g Carbs)`,
        numericValue: res.highCal
      },
      secondary: [
        { label: 'Low-Carb Rest Day', value: `${res.lowCal} kcal (${res.lowCarbs}g Carbs)` }
      ]
    })
  },

  // 22. Bodybuilding Contest Prep Macro Calculator
  {
    id: 'bodybuilding-prep-calc',
    name: 'Bodybuilding Contest Prep Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Contest Prep Deficit',
      formulaExpression: 'Weekly Deficit = Target Fat Loss × 3500 kcal',
      variables: [{ symbol: 'Deficit', name: 'Calorie Deficit' }]
    },
    inputSchema: {
      fields: [
        { name: 'currentWeight', label: 'Current Weight (lbs)', type: 'number', required: true, defaultValue: 195, min: 100 },
        { name: 'targetStageWeight', label: 'Target Stage Weight (lbs)', type: 'number', required: true, defaultValue: 175, min: 90 },
        { name: 'prepWeeks', label: 'Prep Duration (Weeks)', type: 'integer', required: true, defaultValue: 16, min: 8, max: 32 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { currentWeight: number; targetStageWeight: number; prepWeeks: number }) => {
      const lbsToLose = Math.max(0, inputs.currentWeight - inputs.targetStageWeight);
      const weeklyLoss = lbsToLose / inputs.prepWeeks;
      const dailyDeficit = Math.round((weeklyLoss * 3500) / 7);
      return { lbsToLose, weeklyLoss, dailyDeficit };
    },
    formatResult: (res: { lbsToLose: number; weeklyLoss: number; dailyDeficit: number }) => ({
      primary: {
        label: 'Required Daily Deficit',
        value: `-${res.dailyDeficit} kcal / day`,
        numericValue: res.dailyDeficit
      },
      secondary: [
        { label: 'Pace of Weight Loss', value: `${res.weeklyLoss.toFixed(2)} lbs / week` },
        { label: 'Total Weight to Cut', value: `${res.lbsToLose} lbs` }
      ]
    })
  },

  // 23. Daily Dietary Fiber Calculator
  {
    id: 'fiber-intake-calc',
    name: 'Daily Dietary Fiber Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    formulaMeta: {
      formulaName: 'Dietary Fiber Recommendation',
      formulaExpression: 'Fiber = (Total Calories / 1000) × 14g',
      variables: [{ symbol: 'Fiber', name: 'Grams of Fiber', unit: 'g' }]
    },
    inputSchema: {
      fields: [
        { name: 'dailyCalories', label: 'Daily Calorie Intake (kcal)', type: 'integer', required: true, defaultValue: 2200, min: 1000 }
      ]
    },
    validate: () => [],
    calculate: (inputs: { dailyCalories: number }) => {
      const fiberGrams = Math.round((inputs.dailyCalories / 1000) * 14);
      const solubleGrams = Math.round(fiberGrams * 0.30);
      const insolubleGrams = Math.round(fiberGrams * 0.70);
      return { fiberGrams, solubleGrams, insolubleGrams };
    },
    formatResult: (res: { fiberGrams: number; solubleGrams: number; insolubleGrams: number }) => ({
      primary: {
        label: 'Recommended Dietary Fiber',
        value: `${res.fiberGrams} grams / day`,
        numericValue: res.fiberGrams
      },
      secondary: [
        { label: 'Insoluble Fiber Target (Gut Motility)', value: `~${res.insolubleGrams}g` },
        { label: 'Soluble Fiber Target (Cholesterol & Blood Sugar)', value: `~${res.solubleGrams}g` }
      ]
    })
  }
];
