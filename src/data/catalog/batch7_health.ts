import { CalculatorMeta } from '../../types';

export const BATCH7_METADATA: CalculatorMeta[] = [
  // ==========================================
  // HEALTH & FITNESS CALCULATORS (23 new, target 25 total with bmi & bmr-tdee)
  // ==========================================

  // Subcategory: body-composition (6)
  {
    id: 'body-fat-navy-calc',
    name: 'US Navy Body Fat Calculator',
    shortDesc: 'Estimate body fat percentage using circumference measurements (neck, waist, hip)',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['fitness', 'body-fat', 'navy-tape-test', 'body-composition', 'lean-mass'],
    formula: 'BF % = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76',
    isPopular: true,
    iconName: 'Activity',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'ideal-body-weight-calc',
    name: 'Ideal Body Weight (IBW) Calculator',
    shortDesc: 'Calculate healthy weight ranges using Devine, Robinson, and Miller clinical formulas',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['health', 'ideal-weight', 'ibw', 'devine-formula', 'healthy-weight'],
    formula: 'Devine Male: 50kg + 2.3kg/inch over 5ft; Female: 45.5kg + 2.3kg/inch',
    isPopular: true,
    iconName: 'Scale',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'lean-body-mass-calc',
    name: 'Lean Body Mass (LBM) Calculator',
    shortDesc: 'Compute fat-free mass using Boer and James validated anthropometric equations',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['fitness', 'lean-body-mass', 'lbm', 'fat-free-mass', 'muscle-mass'],
    formula: 'Boer Male: 0.407W + 0.267H - 19.2; Female: 0.252W + 0.473H - 48.3',
    isPopular: false,
    iconName: 'User',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'waist-to-hip-calc',
    name: 'Waist-to-Hip Ratio (WHR) Calculator',
    shortDesc: 'Evaluate visceral fat distribution and cardiovascular metabolic risk thresholds',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['health', 'waist-to-hip', 'whr', 'body-shape', 'cardiovascular-risk'],
    formula: 'WHR = Waist Circumference / Hip Circumference',
    isPopular: true,
    iconName: 'Maximize2',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'waist-to-height-calc',
    name: 'Waist-to-Height Ratio (WHtR) Calculator',
    shortDesc: 'Assess central adiposity and mortality risk (keep waist under half height)',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['health', 'whtr', 'waist-to-height', 'metabolic-health', 'longevity'],
    formula: 'WHtR = Waist Circumference / Height',
    isPopular: false,
    iconName: 'Sliders',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'body-surface-area-calc',
    name: 'Body Surface Area (BSA) Calculator',
    shortDesc: 'Calculate total human skin surface area using the clinical Mosteller formula: √(H×W/3600)',
    category: 'health-fitness',
    subcategoryId: 'body-composition',
    tags: ['health', 'bsa', 'body-surface-area', 'mosteller', 'clinical-math'],
    formula: 'BSA (m²) = √((Height cm × Weight kg) / 3600)',
    isPopular: false,
    iconName: 'Maximize',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },

  // Subcategory: metabolic-energy (5)
  {
    id: 'calorie-deficit-calc',
    name: 'Calorie Deficit & Weight Loss Date Calculator',
    shortDesc: 'Calculate target daily calorie intake and projected calendar date to achieve target weight',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['fitness', 'calorie-deficit', 'weight-loss', 'diet-planner', 'target-date'],
    formula: 'Deficit = 3,500 kcal per pound of fat; Days = (Pounds to Lose × 3500) / Deficit',
    isPopular: true,
    iconName: 'TrendingDown',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'calories-burned-activity-calc',
    name: 'Exercise Calories Burned (MET) Calculator',
    shortDesc: 'Compute energy expenditure using Metabolic Equivalent of Task (MET) values',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['fitness', 'calories-burned', 'met-calculator', 'workout-calories', 'energy-burn'],
    formula: 'Calories = (MET × 3.5 × Weight kg / 200) × Duration min',
    isPopular: true,
    iconName: 'Flame',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'intermittent-fasting-calc',
    name: 'Intermittent Fasting Schedule Calculator',
    shortDesc: 'Calculate exact eating and fasting windows for 16:8, 18:6, and 20:4 intermittent fasting',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['fitness', 'fasting', 'intermittent-fasting', '16-8-fast', 'eating-window'],
    formula: 'Fast Window = 24 - Feed Window Hours',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'harris-benedict-calc',
    name: 'Harris-Benedict BMR Calculator',
    shortDesc: 'Calculate revised Harris-Benedict basal metabolic rate and daily maintenance calories',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['fitness', 'harris-benedict', 'bmr', 'basal-metabolic-rate', 'metabolism'],
    formula: 'BMR = 88.362 + (13.397 × W) + (4.799 × H) - (5.677 × Age)',
    isPopular: false,
    iconName: 'Zap',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'resting-heart-rate-vo2-calc',
    name: 'Heart Rate Ratio VO2 Max Calculator',
    shortDesc: 'Estimate maximum oxygen uptake from resting heart rate and maximum heart rate',
    category: 'health-fitness',
    subcategoryId: 'metabolic-energy',
    tags: ['fitness', 'vo2-max', 'heart-rate-ratio', 'aerobic-fitness', 'cardio'],
    formula: 'VO2 Max ≈ 15.3 × (HRmax / HRrest)',
    isPopular: false,
    iconName: 'HeartPulse',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },

  // Subcategory: target-heart-rate (6)
  {
    id: 'karvonen-heart-rate-calc',
    name: 'Karvonen Heart Rate Zone Calculator',
    shortDesc: 'Calculate 5 targeted aerobic/anaerobic cardio training zones using Heart Rate Reserve',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', 'karvonen', 'heart-rate-zones', 'cardio-training', 'hrr'],
    formula: 'Target HR = ((HRmax - HRrest) × %Intensity) + HRrest',
    isPopular: true,
    iconName: 'Heart',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'zone-2-cardio-calc',
    name: 'Zone 2 Heart Rate Endurance Calculator',
    shortDesc: 'Calculate precise Zone 2 (60-70% HRmax) range for mitochondrial fat oxidation',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', 'zone-2', 'mitochondrial-health', 'endurance', 'fat-burning'],
    formula: 'Zone 2 = HRmax × 0.60 to 0.70',
    isPopular: true,
    iconName: 'Activity',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'vo2-max-running-calc',
    name: 'Cooper 12-Minute Run VO2 Max Calculator',
    shortDesc: 'Determine VO2 max fitness level from distance covered in a 12-minute running test',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', 'cooper-test', 'vo2-max', 'running', 'aerobic-capacity'],
    formula: 'VO2 Max = (Distance in meters - 504.9) / 44.73',
    isPopular: false,
    iconName: 'Navigation',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'one-rep-max-calc',
    name: 'One-Rep Max (1RM) Calculator',
    shortDesc: 'Calculate maximum single-repetition lift strength using Brzycki, Epley, and Lombardi formulas',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', '1rm', 'one-rep-max', 'strength-training', 'bench-press', 'squat'],
    formula: '1RM = Weight × (1 + Reps / 30) [Epley] or Weight / (1.0278 - 0.0278×Reps) [Brzycki]',
    isPopular: true,
    iconName: 'Award',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'running-pace-calc',
    name: 'Running Pace & Race Time Calculator',
    shortDesc: 'Calculate mile/km splits and predicted finish times for 5K, 10K, Half Marathon, and Marathon',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', 'running-pace', 'marathon-predictor', 'splits', '5k-10k'],
    formula: 'Pace = Time / Distance; Finish = Pace × Race Distance',
    isPopular: true,
    iconName: 'Compass',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'wilks-score-calc',
    name: 'Wilks & DOTS Powerlifting Calculator',
    shortDesc: 'Normalize powerlifting total across different bodyweight classes for men and women',
    category: 'health-fitness',
    subcategoryId: 'target-heart-rate',
    tags: ['fitness', 'wilks', 'dots', 'powerlifting', 'strength-coefficient'],
    formula: 'Score = Total Lifted × Coefficient(Bodyweight)',
    isPopular: false,
    iconName: 'Trophy',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },

  // Subcategory: macronutrients-nutrition (6)
  {
    id: 'macro-protein-calc',
    name: 'Daily Protein Requirement Calculator',
    shortDesc: 'Calculate grams of daily protein tailored to endurance, hypertrophy, or fat loss goals',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'protein', 'macronutrients', 'hypertrophy', 'muscle-synthesis'],
    formula: 'Grams = Bodyweight lbs × Goal Factor (0.8 - 1.2 g/lb)',
    isPopular: true,
    iconName: 'PieChart',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'keto-macro-calc',
    name: 'Ketogenic Diet Macro Calculator',
    shortDesc: 'Calculate exact daily grams of fat, protein, and net carbohydrates for nutritional ketosis',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'keto', 'ketogenic-diet', 'net-carbs', 'macros'],
    formula: '70% Fat, 25% Protein, 5% Net Carbs of Total Calories',
    isPopular: true,
    iconName: 'Percent',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'water-intake-calc',
    name: 'Daily Water Intake & Hydration Calculator',
    shortDesc: 'Calculate daily fluid ounces and liters of water needed based on body weight and exercise',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'water-intake', 'hydration', 'fluid-ounces', 'health'],
    formula: 'Ounces = (Weight lbs × 0.5) + (12 oz per 30 min exercise)',
    isPopular: true,
    iconName: 'Droplet',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'carb-cycling-calc',
    name: 'Carbohydrate Cycling Macro Calculator',
    shortDesc: 'Calculate high-carb workout days vs low-carb rest day macronutrient targets',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'carb-cycling', 'macros', 'fat-loss', 'refeed-days'],
    formula: 'High Day = Maintenance + 15%; Low Day = Maintenance - 20%',
    isPopular: false,
    iconName: 'Repeat',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'bodybuilding-prep-calc',
    name: 'Bodybuilding Contest Prep Macro Calculator',
    shortDesc: 'Determine weekly caloric drop and macro distribution for staged body fat reduction',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'bodybuilding', 'contest-prep', 'peak-week', 'fat-loss'],
    formula: 'Weekly Deficit = (Target Loss lbs × 3500) / 7',
    isPopular: false,
    iconName: 'Layers',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'fiber-intake-calc',
    name: 'Daily Dietary Fiber Calculator',
    shortDesc: 'Calculate recommended grams of soluble and insoluble fiber based on age, gender, and calories',
    category: 'health-fitness',
    subcategoryId: 'macronutrients-nutrition',
    tags: ['nutrition', 'dietary-fiber', 'gut-health', 'soluble-fiber', 'daily-fiber'],
    formula: 'Fiber = (Total Calories / 1000) × 14 grams',
    isPopular: false,
    iconName: 'CheckCircle',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  }
];
