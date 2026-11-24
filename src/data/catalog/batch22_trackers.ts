import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH22_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'trackers-health',
    categoryId: 'trackers',
    name: 'Health & Wellness Trackers',
    slug: 'health-trackers',
    description: 'Daily water intake, sleep duration, mood wellness, and weight & body metrics trackers',
    sortOrder: 1
  },
  {
    id: 'trackers-fitness',
    categoryId: 'trackers',
    name: 'Fitness & Nutrition Trackers',
    slug: 'fitness-trackers',
    description: 'Workout activity logs, calorie & macro intake trackers, and habit streak builders',
    sortOrder: 2
  },
  {
    id: 'trackers-productivity',
    categoryId: 'trackers',
    name: 'Productivity & Finance Trackers',
    slug: 'productivity-trackers',
    description: 'Expense & savings logs, task & milestone progress, and reading & book progress trackers',
    sortOrder: 3
  }
];

export const BATCH22_METADATA: CalculatorMeta[] = [
  // 1. Water Intake Tracker
  {
    id: 'water-intake-tracker',
    name: 'Daily Water Intake & Hydration Tracker',
    shortDesc: 'Track daily glass/ml water consumption against hydration goals, view historical logs, and monitor streaks with local storage',
    category: 'trackers',
    subcategoryId: 'trackers-health',
    tags: ['trackers', 'water', 'hydration', 'health', 'daily', 'streak'],
    formula: 'Daily Hydration Progress vs Goal (%)',
    isPopular: true,
    iconName: 'Droplets',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 2. Habit Tracker
  {
    id: 'habit-streak-tracker',
    name: 'Habit Formation & Streak Tracker',
    shortDesc: 'Build positive daily habits, maintain streak counters, check off completion logs, and review consistency history',
    category: 'trackers',
    subcategoryId: 'trackers-fitness',
    tags: ['trackers', 'habit', 'streak', 'routine', 'productivity', 'goals'],
    formula: 'Consecutive Streak & Completion Rate (%)',
    isPopular: true,
    iconName: 'Flame',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 3. Expense & Savings Tracker
  {
    id: 'expense-savings-tracker',
    name: 'Expense & Savings Growth Tracker',
    shortDesc: 'Log daily expenses and savings deposits, monitor category spending, and view cumulative financial balance over time',
    category: 'trackers',
    subcategoryId: 'trackers-productivity',
    tags: ['trackers', 'expense', 'savings', 'finance', 'budget', 'money'],
    formula: 'Net Balance = Cumulative Deposits - Cumulative Expenses',
    isPopular: true,
    iconName: 'Wallet',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Workout Tracker
  {
    id: 'workout-fitness-tracker',
    name: 'Workout & Fitness Activity Tracker',
    shortDesc: 'Record exercise sessions, cardio duration, strength sets, reps, calories burned, and training history logs',
    category: 'trackers',
    subcategoryId: 'trackers-fitness',
    tags: ['trackers', 'workout', 'fitness', 'exercise', 'gym', 'cardio'],
    formula: 'Total Active Minutes & Calories Burned Summation',
    isPopular: true,
    iconName: 'Dumbbell',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 5. Sleep Tracker
  {
    id: 'sleep-duration-tracker',
    name: 'Sleep Duration & Quality Tracker',
    shortDesc: 'Log sleep hours, wake times, sleep quality ratings (Poor, Fair, Good, Excellent), and 7-day sleep averages',
    category: 'trackers',
    subcategoryId: 'trackers-health',
    tags: ['trackers', 'sleep', 'rest', 'health', 'wellness', 'duration'],
    formula: 'Weekly Sleep Average & Quality Score',
    isPopular: false,
    iconName: 'Moon',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Calorie & Macro Tracker
  {
    id: 'calorie-macro-tracker',
    name: 'Calorie & Macronutrient Intake Tracker',
    shortDesc: 'Track daily protein, carbohydrates, fats, and total calories consumed against nutritional targets',
    category: 'trackers',
    subcategoryId: 'trackers-fitness',
    tags: ['trackers', 'calories', 'macros', 'protein', 'diet', 'nutrition'],
    formula: 'Macro Summation vs Daily Calorie Target',
    isPopular: false,
    iconName: 'Apple',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  // 7. Weight Tracker
  {
    id: 'weight-body-metrics-tracker',
    name: 'Weight & Body Metrics Tracker',
    shortDesc: 'Log body weight over time, track weight loss or gain progress towards target goal, and review historical trends',
    category: 'trackers',
    subcategoryId: 'trackers-health',
    tags: ['trackers', 'weight', 'body', 'metrics', 'bmi', 'fitness'],
    formula: 'Weight Delta = Current Weight - Starting Weight',
    isPopular: false,
    iconName: 'Scale',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 8. Task Milestone Tracker
  {
    id: 'task-milestone-tracker',
    name: 'Task & Milestone Progress Tracker',
    shortDesc: 'Track project milestones, subtasks completion percentages, deadlines, and deliverables status',
    category: 'trackers',
    subcategoryId: 'trackers-productivity',
    tags: ['trackers', 'milestone', 'tasks', 'project', 'progress', 'goals'],
    formula: 'Milestone Progress % = (Completed / Total) × 100',
    isPopular: false,
    iconName: 'CheckSquare',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 9. Mood Wellness Tracker
  {
    id: 'mood-wellness-tracker',
    name: 'Mood & Mental Wellness Tracker',
    shortDesc: 'Log daily emotional state (Happy, Calm, Neutral, Stressed, Sad), journal notes, and wellness trends',
    category: 'trackers',
    subcategoryId: 'trackers-health',
    tags: ['trackers', 'mood', 'mental', 'wellness', 'journal', 'health'],
    formula: 'Mood Index Score & Emotional Distribution',
    isPopular: false,
    iconName: 'Smile',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 10. Reading Progress Tracker
  {
    id: 'reading-book-tracker',
    name: 'Reading & Book Progress Tracker',
    shortDesc: 'Track books currently reading, pages completed, reading speed, and completion percentage towards reading goals',
    category: 'trackers',
    subcategoryId: 'trackers-productivity',
    tags: ['trackers', 'reading', 'books', 'pages', 'goals', 'library'],
    formula: 'Completion % = (Current Page / Total Pages) × 100',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  }
];
