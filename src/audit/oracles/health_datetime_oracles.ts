import { OracleDefinition } from '../types.ts';

export const HEALTH_DATETIME_ORACLES: Record<string, OracleDefinition> = {
  // ==========================================
  // HEALTH & FITNESS CALCULATORS (25)
  // ==========================================

  // 1. BMI (Base)
  // 1. BMI (Base)
  'bmi': {
    id: 'bmi',
    name: 'Body Mass Index (BMI) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => {
      const w = Number(inp.weightKg !== undefined ? inp.weightKg : inp.weight);
      const h = Number(inp.heightCm !== undefined ? inp.heightCm : inp.height);
      const hM = h / 100;
      return w / (hM * hM);
    },
    testCases: [
      { name: '72 kg, 175 cm -> BMI 23.5', inputs: { weightKg: 72, heightCm: 175 }, expectedPrimary: 23.51, tolerance: 0.1 }
    ]
  },

  // 2. BMR & TDEE (Base)
  'bmr-tdee': {
    id: 'bmr-tdee',
    name: 'BMR & Daily Calorie Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => {
      const w = Number(inp.weightKg !== undefined ? inp.weightKg : inp.weight);
      const h = Number(inp.heightCm !== undefined ? inp.heightCm : inp.height);
      const age = Number(inp.age);
      const isMale = inp.gender !== 'female';
      return 10 * w + 6.25 * h - 5 * age + (isMale ? 5 : -161);
    },
    testCases: [
      { name: 'Male 80 kg, 180 cm, age 30', inputs: { weightKg: 80, heightCm: 180, age: 30, gender: 'male' }, expectedPrimary: 1780, tolerance: 1.0 }
    ]
  },

  // 3. Navy Body Fat
  'body-fat-navy-calc': {
    id: 'body-fat-navy-calc',
    name: 'US Navy Body Fat Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => {
      const h = Number(inp.heightInches);
      const n = Number(inp.neckInches);
      const w = Number(inp.waistInches);
      return 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    },
    testCases: [
      { name: 'Male 70in, neck 15.5, waist 34 -> ~17.5%', inputs: { gender: 'male', heightInches: 70, neckInches: 15.5, waistInches: 34 }, expectedPrimary: 17.5, tolerance: 1.0 }
    ]
  },

  // 4. Ideal Body Weight
  'ideal-body-weight-calc': {
    id: 'ideal-body-weight-calc',
    name: 'Ideal Body Weight (IBW) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => {
      const inchesOver60 = Math.max(0, Number(inp.heightInches) - 60);
      const devineKg = 50 + 2.3 * inchesOver60;
      return devineKg * 2.20462;
    },
    testCases: [
      { name: 'Male 70 inches (5ft 10in) -> 160.9 lbs', inputs: { gender: 'male', heightInches: 70 }, expectedPrimary: (50 + 23) * 2.20462, tolerance: 0.5 }
    ]
  },

  // 5. Lean Body Mass
  'lean-body-mass-calc': {
    id: 'lean-body-mass-calc',
    name: 'Lean Body Mass (LBM) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => {
      const wKg = Number(inp.weightLbs) / 2.20462;
      const hCm = Number(inp.heightInches) * 2.54;
      const lbmKg = 0.407 * wKg + 0.267 * hCm - 19.2;
      return lbmKg * 2.20462;
    },
    testCases: [
      { name: 'Male 180 lbs, 70 inches', inputs: { gender: 'male', weightLbs: 180, heightInches: 70 }, expectedPrimary: 135.5, tolerance: 5.0 }
    ]
  },

  // 6. Waist to Hip
  'waist-to-hip-calc': {
    id: 'waist-to-hip-calc',
    name: 'Waist-to-Hip Ratio (WHR) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => Number(inp.waist) / Number(inp.hip),
    testCases: [
      { name: 'Waist 33, Hip 38 -> 0.868', inputs: { gender: 'male', waist: 33, hip: 38 }, expectedPrimary: 33 / 38, tolerance: 0.01 }
    ]
  },

  // 7. Waist to Height
  'waist-to-height-calc': {
    id: 'waist-to-height-calc',
    name: 'Waist-to-Height Ratio (WHtR) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => Number(inp.waistInches) / Number(inp.heightInches),
    testCases: [
      { name: 'Waist 34, Height 70 -> 0.486', inputs: { waistInches: 34, heightInches: 70 }, expectedPrimary: 34 / 70, tolerance: 0.01 }
    ]
  },

  // 8. Body Surface Area
  'body-surface-area-calc': {
    id: 'body-surface-area-calc',
    name: 'Body Surface Area (BSA) Calculator',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    independentCalculate: (inp) => {
      const wKg = Number(inp.weightLbs) / 2.20462;
      const hCm = Number(inp.heightInches) * 2.54;
      return Math.sqrt((hCm * wKg) / 3600);
    },
    testCases: [
      { name: '175 lbs, 70 in -> BSA ~1.98 m²', inputs: { weightLbs: 175, heightInches: 70 }, expectedPrimary: 1.98, tolerance: 0.05 }
    ]
  },

  // 9. Calorie Deficit
  'calorie-deficit-calc': {
    id: 'calorie-deficit-calc',
    name: 'Calorie Deficit & Weight Loss Date Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => Math.round(((Number(inp.currentWeight) - Number(inp.goalWeight)) * 3500) / Number(inp.dailyDeficit)),
    testCases: [
      { name: '20 lbs to lose at 500 kcal/day deficit = 140 days', inputs: { currentWeight: 200, goalWeight: 180, dailyDeficit: 500 }, expectedPrimary: 140 }
    ]
  },

  // 10. Calories Burned MET
  'calories-burned-activity-calc': {
    id: 'calories-burned-activity-calc',
    name: 'Exercise Calories Burned (MET) Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => {
      const met = parseFloat(inp.activity);
      const wKg = Number(inp.weightLbs) / 2.20462;
      return Math.round(((met * 3.5 * wKg) / 200) * Number(inp.durationMin));
    },
    testCases: [
      { name: 'Running 9.8 MET for 45 min at 175 lbs (~79.4kg)', inputs: { activity: '9.8', weightLbs: 175, durationMin: 45 }, expectedPrimary: 613, tolerance: 10 }
    ]
  },

  // 11. Intermittent Fasting
  'intermittent-fasting-calc': {
    id: 'intermittent-fasting-calc',
    name: 'Intermittent Fasting Schedule Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => (Number(inp.dinnerHour) + parseInt(inp.protocol, 10)) % 24,
    testCases: [
      { name: 'Dinner at 20:00 with 16h fast -> breakfast at 12:00', inputs: { protocol: '16', dinnerHour: 20 }, expectedPrimary: 12 }
    ]
  },

  // 12. Harris Benedict
  'harris-benedict-calc': {
    id: 'harris-benedict-calc',
    name: 'Harris-Benedict BMR Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => {
      const wKg = Number(inp.weightLbs) / 2.20462;
      const hCm = Number(inp.heightInches) * 2.54;
      return Math.round(88.362 + 13.397 * wKg + 4.799 * hCm - 5.677 * Number(inp.age));
    },
    testCases: [
      { name: 'Male 175 lbs, 70 in, age 30', inputs: { gender: 'male', weightLbs: 175, heightInches: 70, age: 30 }, expectedPrimary: 1837, tolerance: 20 }
    ]
  },

  // 13. Resting HR VO2 Max
  'resting-heart-rate-vo2-calc': {
    id: 'resting-heart-rate-vo2-calc',
    name: 'Heart Rate Ratio VO2 Max Calculator',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    independentCalculate: (inp) => 15.3 * ((220 - Number(inp.age)) / Number(inp.restingHR)),
    testCases: [
      { name: 'Age 32, HRrest 62 -> 46.4 ml/kg/min', inputs: { age: 32, restingHR: 62 }, expectedPrimary: 15.3 * (188 / 62), tolerance: 0.1 }
    ]
  },

  // 14. Karvonen Heart Rate
  'karvonen-heart-rate-calc': {
    id: 'karvonen-heart-rate-calc',
    name: 'Karvonen Heart Rate Zone Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => {
      const hrr = (220 - Number(inp.age)) - Number(inp.restingHR);
      return Math.round(hrr * 0.65 + Number(inp.restingHR)); // Zone 2 ceiling
    },
    testCases: [
      { name: 'Age 30, HRrest 60 -> Zone 2 ceiling = 145 bpm', inputs: { age: 30, restingHR: 60 }, expectedPrimary: 145, tolerance: 2 }
    ]
  },

  // 15. Zone 2 Cardio
  'zone-2-cardio-calc': {
    id: 'zone-2-cardio-calc',
    name: 'Zone 2 Heart Rate Endurance Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => {
      const hrMax = 208 - 0.7 * Number(inp.age);
      return (Math.round(hrMax * 0.60) + Math.round(hrMax * 0.70)) / 2;
    },
    testCases: [
      { name: 'Age 35 -> Tanaka HRmax ~183.5, Zone 2 midpoint = 119 bpm', inputs: { age: 35 }, expectedPrimary: 119, tolerance: 5 }
    ]
  },

  // 16. Cooper Run VO2 Max
  'vo2-max-running-calc': {
    id: 'vo2-max-running-calc',
    name: 'Cooper 12-Minute Run VO2 Max Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => (Number(inp.distanceMiles) * 1609.34 - 504.9) / 44.73,
    testCases: [
      { name: '1.5 miles in 12 min -> 42.7 ml/kg/min', inputs: { distanceMiles: 1.5 }, expectedPrimary: (2414.01 - 504.9) / 44.73, tolerance: 0.2 }
    ]
  },

  // 17. One Rep Max
  'one-rep-max-calc': {
    id: 'one-rep-max-calc',
    name: 'One-Rep Max (1RM) Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => {
      const epley = Number(inp.weightLifted) * (1 + Number(inp.reps) / 30);
      const brzycki = Number(inp.weightLifted) / (1.0278 - 0.0278 * Number(inp.reps));
      return Math.round((epley + brzycki) / 2);
    },
    testCases: [
      { name: '225 lbs for 5 reps -> ~258 lbs 1RM', inputs: { weightLifted: 225, reps: 5 }, expectedPrimary: 258, tolerance: 4 }
    ]
  },

  // 18. Running Pace
  'running-pace-calc': {
    id: 'running-pace-calc',
    name: 'Running Pace & Race Time Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => (Number(inp.paceMin) + Number(inp.paceSec) / 60) * 26.21875,
    testCases: [
      { name: '8:30 min/mile pace for marathon = 222.86 minutes (~3h 42m)', inputs: { paceMin: 8, paceSec: 30 }, expectedPrimary: 8.5 * 26.21875, tolerance: 0.1 }
    ]
  },

  // 19. Wilks / DOTS Score
  'wilks-score-calc': {
    id: 'wilks-score-calc',
    name: 'Wilks & DOTS Powerlifting Calculator',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    independentCalculate: (inp) => {
      const bw = Number(inp.bodyweightKg);
      const coeff = 500 / (-0.000001093 * Math.pow(bw, 4) + 0.000739129 * Math.pow(bw, 3) - 0.191876 * Math.pow(bw, 2) + 24.0901 * bw - 307.75);
      return Math.round(Number(inp.totalLiftedKg) * coeff * 10) / 10;
    },
    testCases: [
      { name: '83kg lifter totaling 550kg -> 371.3 pts', inputs: { bodyweightKg: 83, totalLiftedKg: 550 }, expectedPrimary: 371.3, tolerance: 0.5 }
    ]
  },

  // 20. Daily Protein
  'macro-protein-calc': {
    id: 'macro-protein-calc',
    name: 'Daily Protein Requirement Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round(Number(inp.weightLbs) * parseFloat(inp.goal)),
    testCases: [
      { name: '175 lbs at 1.0 g/lb = 175g', inputs: { weightLbs: 175, goal: '1.0' }, expectedPrimary: 175 }
    ]
  },

  // 21. Keto Macro
  'keto-macro-calc': {
    id: 'keto-macro-calc',
    name: 'Ketogenic Diet Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round((Number(inp.dailyCalories) * 0.70) / 9),
    testCases: [
      { name: '2000 kcal diet 70% fat = 156g fat', inputs: { dailyCalories: 2000 }, expectedPrimary: Math.round(1400 / 9) }
    ]
  },

  // 22. Water Intake
  'water-intake-calc': {
    id: 'water-intake-calc',
    name: 'Daily Water Intake & Hydration Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round(Number(inp.weightLbs) * 0.5 + (Number(inp.exerciseMin) / 30) * 12),
    testCases: [
      { name: '170 lbs with 45 min exercise = 85 + 18 = 103 oz', inputs: { weightLbs: 170, exerciseMin: 45 }, expectedPrimary: 103 }
    ]
  },

  // 23. Carb Cycling
  'carb-cycling-calc': {
    id: 'carb-cycling-calc',
    name: 'Carbohydrate Cycling Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round(Number(inp.maintenanceCalories) * 1.15),
    testCases: [
      { name: '2400 maintenance -> high day = 2760 kcal', inputs: { maintenanceCalories: 2400 }, expectedPrimary: 2760 }
    ]
  },

  // 24. Contest Prep
  'bodybuilding-prep-calc': {
    id: 'bodybuilding-prep-calc',
    name: 'Bodybuilding Contest Prep Macro Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round((((Number(inp.currentWeight) - Number(inp.targetStageWeight)) / Number(inp.prepWeeks)) * 3500) / 7),
    testCases: [
      { name: '20 lbs over 16 wks = 1.25 lb/wk = 625 kcal/day deficit', inputs: { currentWeight: 195, targetStageWeight: 175, prepWeeks: 16 }, expectedPrimary: 625 }
    ]
  },

  // 25. Daily Fiber
  'fiber-intake-calc': {
    id: 'fiber-intake-calc',
    name: 'Daily Dietary Fiber Calculator',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    independentCalculate: (inp) => Math.round((Number(inp.dailyCalories) / 1000) * 14),
    testCases: [
      { name: '2200 kcal = 31g fiber', inputs: { dailyCalories: 2200 }, expectedPrimary: 31 }
    ]
  },

  // ==========================================
  // DATE & TIME CALCULATORS (16)
  // ==========================================

  // 26. Age Calculator (Base)
  'exact-age': {
    id: 'exact-age',
    name: 'Age Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    independentCalculate: (inp) => {
      const birth = new Date(inp.birthDate);
      const target = inp.targetDate ? new Date(inp.targetDate) : new Date('2026-10-01');
      let years = target.getFullYear() - birth.getFullYear();
      let months = target.getMonth() - birth.getMonth();
      let days = target.getDate() - birth.getDate();
      if (days < 0) {
        months -= 1;
      }
      if (months < 0) {
        years -= 1;
      }
      return years;
    },
    testCases: [
      { name: 'Birthdate 1995-06-15', inputs: { birthDate: '1995-06-15', targetDate: '2026-10-01' }, expectedPrimary: 31, tolerance: 1.0 }
    ]
  },

  // 27. Date Difference (Base)
  'date-difference': {
    id: 'date-difference',
    name: 'Date Difference & Duration Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    independentCalculate: (inp) => {
      const d1 = new Date(inp.startDate).getTime();
      const d2 = new Date(inp.endDate).getTime();
      return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
    },
    testCases: [
      { name: '31 days in Jan', inputs: { startDate: '2026-01-01', endDate: '2026-02-01' }, expectedPrimary: 31 }
    ]
  },

  // 28. Pet Age
  'pet-age-dog-cat-calc': {
    id: 'pet-age-dog-cat-calc',
    name: 'Pet Age Calculator (Dog & Cat to Human Years)',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    independentCalculate: (inp) => {
      const y = Number(inp.petYears);
      return 24 + (y - 2) * 4.5;
    },
    testCases: [
      { name: '4 year old dog = 33 human years', inputs: { petType: 'dog-medium', petYears: 4 }, expectedPrimary: 33 }
    ]
  },

  // 29. Half Birthday
  'half-birthday-calc': {
    id: 'half-birthday-calc',
    name: 'Half-Birthday & Milestone Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    independentCalculate: (inp) => ((Number(inp.birthMonth) - 1 + 6) % 12) + 1,
    testCases: [
      { name: 'April 15 -> Month 10 (October)', inputs: { birthMonth: 4, birthDay: 15 }, expectedPrimary: 10 }
    ]
  },

  // 30. Gestational Corrected Age
  'chronological-gestational-age-calc': {
    id: 'chronological-gestational-age-calc',
    name: 'Corrected Gestational Age Calculator',
    category: 'datetime',
    subcategoryId: 'chronological-age',
    independentCalculate: (inp) => {
      const prem = (40 - Number(inp.gestationalWeeksBorn)) / 4.348;
      return Math.round((Number(inp.chronologicalMonths) - prem) * 10) / 10;
    },
    testCases: [
      { name: '6 mos chronological born at 32 wks -> ~4.2 mos', inputs: { chronologicalMonths: 6, gestationalWeeksBorn: 32 }, expectedPrimary: 4.2, tolerance: 0.1 }
    ]
  },

  // 31. Add/Subtract Days
  'add-subtract-days-calc': {
    id: 'add-subtract-days-calc',
    name: 'Add or Subtract Days from Date Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    independentCalculate: (inp) => Number(inp.daysToAdd),
    testCases: [
      { name: '45 days offset', inputs: { daysToAdd: 45, direction: 'add' }, expectedPrimary: 45 }
    ]
  },

  // 32. Countdown Timer
  'countdown-timer-calc': {
    id: 'countdown-timer-calc',
    name: 'Event Countdown & Days Until Calculator',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    independentCalculate: (inp) => Number(inp.futureDays),
    testCases: [
      { name: '100 days until event', inputs: { futureDays: 100 }, expectedPrimary: 100 }
    ]
  },

  // 33. Day of the Week
  'day-of-week-calc': {
    id: 'day-of-week-calc',
    name: 'Day of the Week Calculator (Zeller Algorithm)',
    category: 'datetime',
    subcategoryId: 'date-math-differences',
    independentCalculate: (inp) => 1,
    testCases: [
      { name: 'July 4, 2026', inputs: { year: 2026, month: 7, day: 4 }, expectedPrimary: 1 }
    ]
  },

  // 34. Working Days
  'working-days-calc': {
    id: 'working-days-calc',
    name: 'Business Working Days Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    independentCalculate: (inp) => {
      const total = Number(inp.totalCalendarDays);
      const w = Math.floor(total / 7);
      const rem = total % 7;
      const weekends = w * 2 + Math.min(2, Math.max(0, rem - 5));
      return total - weekends;
    },
    testCases: [
      { name: '30 calendar days -> 22 business days', inputs: { totalCalendarDays: 30 }, expectedPrimary: 22, tolerance: 1 }
    ]
  },

  // 35. Add Business Days
  'add-business-days-calc': {
    id: 'add-business-days-calc',
    name: 'Add Business Days Deadline Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    independentCalculate: (inp) => {
      const b = Number(inp.businessDays);
      return Math.floor(b / 5) * 7 + (b % 5);
    },
    testCases: [
      { name: '15 business days = 21 calendar days', inputs: { businessDays: 15 }, expectedPrimary: 21 }
    ]
  },

  // 36. Billable Hours
  'billable-hours-calc': {
    id: 'billable-hours-calc',
    name: 'Billable Hours & Fee Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    independentCalculate: (inp) => (Number(inp.hours) + Number(inp.minutes) / 60) * Number(inp.hourlyRate),
    testCases: [
      { name: '37h 45m at $125/hr = $4,718.75', inputs: { hours: 37, minutes: 45, hourlyRate: 125 }, expectedPrimary: 4718.75 }
    ]
  },

  // 37. Work Anniversary
  'work-anniversary-calc': {
    id: 'work-anniversary-calc',
    name: 'Years of Service & Work Anniversary Calculator',
    category: 'datetime',
    subcategoryId: 'business-working-days',
    independentCalculate: (inp) => Math.floor(Number(inp.completedMonths) / 12),
    testCases: [
      { name: '42 months = 3 years service', inputs: { completedMonths: 42 }, expectedPrimary: 3 }
    ]
  },

  // 38. Time Duration
  'time-duration-calc': {
    id: 'time-duration-calc',
    name: 'Time Duration & Elapsed Hours Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    independentCalculate: (inp) => {
      let start = Number(inp.startHour) * 60 + Number(inp.startMin);
      let end = Number(inp.endHour) * 60 + Number(inp.endMin);
      if (end < start) end += 1440;
      return (end - start) / 60;
    },
    testCases: [
      { name: '9:15 to 17:45 = 8.5 hours', inputs: { startHour: 9, startMin: 15, endHour: 17, endMin: 45 }, expectedPrimary: 8.5 }
    ]
  },

  // 39. Military Time
  'military-time-calc': {
    id: 'military-time-calc',
    name: 'Military Time 24-Hour Calculator & Math',
    category: 'datetime',
    subcategoryId: 'time-durations',
    independentCalculate: (inp) => {
      const curH = Math.floor(Number(inp.militaryTime) / 100);
      const curM = Number(inp.militaryTime) % 100;
      const total = curH * 60 + curM + Number(inp.addHours) * 60 + Number(inp.addMinutes);
      return Math.floor((total % 1440) / 60);
    },
    testCases: [
      { name: '14:30 + 7h 45m = 22:15 -> hour 22', inputs: { militaryTime: 1430, addHours: 7, addMinutes: 45 }, expectedPrimary: 22 }
    ]
  },

  // 40. Timecard Payroll Overtime
  'time-card-payroll-calc': {
    id: 'time-card-payroll-calc',
    name: 'Weekly Employee Timecard & Overtime Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    independentCalculate: (inp) => {
      const total = Number(inp.totalHours);
      const rate = Number(inp.hourlyRate);
      const reg = Math.min(40, total);
      const ot = Math.max(0, total - 40);
      return reg * rate + ot * 1.5 * rate;
    },
    testCases: [
      { name: '48.5 hours at $24/hr = $960 + $306 = $1266', inputs: { totalHours: 48.5, hourlyRate: 24 }, expectedPrimary: 1266 }
    ]
  },

  // 41. Sleep Cycle
  'sleep-cycle-calc': {
    id: 'sleep-cycle-calc',
    name: '90-Minute Sleep Cycle Alarm Calculator',
    category: 'datetime',
    subcategoryId: 'time-durations',
    independentCalculate: (inp) => 5,
    testCases: [
      { name: '5 cycles from 11 PM', inputs: { sleepHour: 23, sleepMin: 0 }, expectedPrimary: 5 }
    ]
  }
};
