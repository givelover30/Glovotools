import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH20_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'planners-financial',
    categoryId: 'planners',
    name: 'Financial & Shopping Planners',
    slug: 'financial-planners',
    description: 'Monthly budget planners, grocery shopping lists, and expense estimators',
    sortOrder: 1
  },
  {
    id: 'planners-lifestyle',
    categoryId: 'planners',
    name: 'Lifestyle & Routine Planners',
    slug: 'lifestyle-planners',
    description: 'Meal planners, daily schedules, weekly task planners, and study schedules',
    sortOrder: 2
  },
  {
    id: 'planners-projects',
    categoryId: 'planners',
    name: 'Projects, Travel & Events Planners',
    slug: 'project-planners',
    description: 'Travel itineraries, moving checklists, event & party coordinators, and home maintenance planners',
    sortOrder: 3
  }
];

export const BATCH20_METADATA: CalculatorMeta[] = [
  // 1. Monthly Budget Planner
  {
    id: 'monthly-budget-planner',
    name: 'Monthly Budget & Expense Planner',
    shortDesc: 'Plan monthly income, allocate savings, track fixed and variable expenses, and monitor net cash flow with real-time calculations',
    category: 'planners',
    subcategoryId: 'planners-financial',
    tags: ['planners', 'budget', 'finance', 'expenses', 'savings', 'money'],
    formula: 'Net Balance = Total Income - (Savings + Expenses)',
    isPopular: true,
    iconName: 'Wallet',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 2. Meal Planner
  {
    id: 'meal-planner',
    name: 'Weekly Meal Planner & Nutrition Schedule',
    shortDesc: 'Organize breakfast, lunch, dinner, and snacks across all 7 days of the week with calorie tracking and shopping list generation',
    category: 'planners',
    subcategoryId: 'planners-lifestyle',
    tags: ['planners', 'meal', 'diet', 'nutrition', 'food', 'weekly'],
    formula: 'Weekly Meal Matrix & Calorie Summation',
    isPopular: true,
    iconName: 'Utensils',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 3. Grocery Shopping Planner
  {
    id: 'grocery-shopping-planner',
    name: 'Grocery Shopping List & Cost Estimator',
    shortDesc: 'Build categorized grocery shopping lists, estimate total cart costs, check off items in real-time, and save lists to local storage',
    category: 'planners',
    subcategoryId: 'planners-financial',
    tags: ['planners', 'grocery', 'shopping', 'supermarket', 'budget', 'list'],
    formula: 'Estimated Total = Sum(Item Quantity × Unit Price)',
    isPopular: true,
    iconName: 'ShoppingCart',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  // 4. Travel Itinerary Planner
  {
    id: 'travel-itinerary-planner',
    name: 'Travel Itinerary & Trip Planner',
    shortDesc: 'Plan multi-day trips, destinations, activities, flight details, and estimated expenses with day-by-day scheduling',
    category: 'planners',
    subcategoryId: 'planners-projects',
    tags: ['planners', 'travel', 'trip', 'itinerary', 'vacation', 'holiday'],
    formula: 'Total Trip Cost = Sum(Transport + Lodging + Activities)',
    isPopular: false,
    iconName: 'Plane',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 5. Moving Planner
  {
    id: 'moving-planner',
    name: 'House Moving Checklist & Timeline Planner',
    shortDesc: 'Coordinate house relocations with chronological countdown checklists (8 weeks out to moving day) and room inventory',
    category: 'planners',
    subcategoryId: 'planners-projects',
    tags: ['planners', 'moving', 'relocation', 'checklist', 'house', 'boxes'],
    formula: 'Completion % = (Completed Tasks / Total Tasks) × 100',
    isPopular: false,
    iconName: 'Truck',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Daily Schedule Planner
  {
    id: 'daily-schedule-planner',
    name: 'Daily Hourly Schedule & Time Tracker',
    shortDesc: 'Plan your day hour by hour from morning to night, assign priorities, manage time blocks, and track completed tasks',
    category: 'planners',
    subcategoryId: 'planners-lifestyle',
    tags: ['planners', 'schedule', 'daily', 'time', 'routine', 'productivity'],
    formula: 'Time Block Allocation & Productivity Tracking',
    isPopular: true,
    iconName: 'CalendarClock',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 7. Weekly Task Planner
  {
    id: 'weekly-task-planner',
    name: 'Weekly Task & Productivity Planner',
    shortDesc: 'Organize tasks across Monday through Sunday with priority levels, status checkboxes, and weekly completion metrics',
    category: 'planners',
    subcategoryId: 'planners-lifestyle',
    tags: ['planners', 'weekly', 'tasks', 'todo', 'productivity', 'organizer'],
    formula: 'Weekly Completion Rate = (Done Tasks / Total Tasks) × 100',
    isPopular: false,
    iconName: 'CheckSquare',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 8. Event & Party Planner
  {
    id: 'event-party-planner',
    name: 'Event & Party Budget Coordinator',
    shortDesc: 'Plan birthday parties, weddings, or corporate events with guest lists, venue costs, catering estimates, and budget tracking',
    category: 'planners',
    subcategoryId: 'planners-projects',
    tags: ['planners', 'party', 'event', 'wedding', 'budget', 'guests'],
    formula: 'Total Event Cost = Venue + Catering + Entertainment + Misc',
    isPopular: false,
    iconName: 'PartyPopper',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 9. Home Maintenance Planner
  {
    id: 'home-maintenance-planner',
    name: 'Home Maintenance & Repair Schedule',
    shortDesc: 'Keep track of monthly, seasonal, and annual home upkeep chores (HVAC filters, gutter cleaning, smoke detectors, lawn care)',
    category: 'planners',
    subcategoryId: 'planners-projects',
    tags: ['planners', 'home', 'maintenance', 'repair', 'chores', 'housekeeping'],
    formula: 'Upkeep Schedule Tracking & Status Monitored',
    isPopular: false,
    iconName: 'Home',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 10. Study Schedule Planner
  {
    id: 'study-schedule-planner',
    name: 'Study Schedule & Exam Prep Planner',
    shortDesc: 'Plan study sessions, subject allocations, exam countdowns, and academic assignment milestones for students',
    category: 'planners',
    subcategoryId: 'planners-lifestyle',
    tags: ['planners', 'study', 'student', 'exam', 'school', 'university'],
    formula: 'Total Study Hours = Sum(Session Durations per Subject)',
    isPopular: false,
    iconName: 'GraduationCap',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  }
];
