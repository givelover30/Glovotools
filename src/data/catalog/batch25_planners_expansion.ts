import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH25_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'planners-expansion-projects',
    categoryId: 'planners',
    name: 'Advanced Project & Event Planners',
    slug: 'advanced-project-planners',
    description: 'Project timelines, wedding organization, home renovation, and business launch planners',
    sortOrder: 4
  },
  {
    id: 'planners-expansion-finance',
    categoryId: 'planners',
    name: 'Advanced Financial & Wealth Planners',
    slug: 'advanced-financial-planners',
    description: 'Debt repayment schedules, emergency fund targets, and retirement nest egg planners',
    sortOrder: 5
  },
  {
    id: 'planners-expansion-lifestyle',
    categoryId: 'planners',
    name: 'Advanced Lifestyle & Goal Organizers',
    slug: 'advanced-lifestyle-planners',
    description: 'Social media content calendars, garden planting schedules, and personal goal trackers',
    sortOrder: 6
  }
];

export const BATCH25_METADATA: CalculatorMeta[] = [
  {
    id: 'project-timeline-planner',
    name: 'Project Timeline & Gantt Planner',
    shortDesc: 'Plan project milestones, tasks, start dates, and duration progress with interactive Gantt tracking',
    category: 'planners',
    subcategoryId: 'planners-expansion-projects',
    tags: ['planners', 'project', 'timeline', 'gantt', 'tasks', 'management'],
    formula: 'Task Progress & Timeline Duration Scheduling',
    isPopular: true,
    iconName: 'Calendar',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'wedding-planning-organizer',
    name: 'Wedding Planning & Budget Organizer',
    shortDesc: 'Coordinate wedding expenses, vendor budgets, guest lists, and RSVP tracking in one place',
    category: 'planners',
    subcategoryId: 'planners-expansion-projects',
    tags: ['planners', 'wedding', 'party', 'budget', 'guests', 'rsvp'],
    formula: 'Sum(Actual vs Estimated Vendor Costs)',
    isPopular: true,
    iconName: 'Heart',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'home-renovation-planner',
    name: 'Home Renovation & Remodeling Planner',
    shortDesc: 'Track room-by-room renovation budgets, material costs, and home improvement milestones',
    category: 'planners',
    subcategoryId: 'planners-expansion-projects',
    tags: ['planners', 'home', 'renovation', 'remodel', 'budget', 'house'],
    formula: 'Room Budget vs Actual Renovation Expense',
    isPopular: false,
    iconName: 'Home',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'debt-repayment-planner',
    name: 'Debt Repayment & Amortization Planner',
    shortDesc: 'Plan debt payoff using Avalanche or Snowball strategies with extra monthly payments and interest estimates',
    category: 'planners',
    subcategoryId: 'planners-expansion-finance',
    tags: ['planners', 'debt', 'repayment', 'avalanche', 'snowball', 'loans'],
    formula: 'Amortization & Interest Principal Reduction',
    isPopular: true,
    iconName: 'CreditCard',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'emergency-fund-planner',
    name: 'Emergency Fund Target Planner',
    shortDesc: 'Calculate required emergency cash reserves based on monthly essential expenses and target months coverage',
    category: 'planners',
    subcategoryId: 'planners-expansion-finance',
    tags: ['planners', 'emergency', 'fund', 'savings', 'safety', 'finance'],
    formula: 'Target Fund = Monthly Expenses × Target Months',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'retirement-planning-calculator',
    name: 'Retirement Nest Egg & Growth Planner',
    shortDesc: 'Project long-term retirement savings growth with compound interest returns and 4% safe withdrawal rules',
    category: 'planners',
    subcategoryId: 'planners-expansion-finance',
    tags: ['planners', 'retirement', 'nest-egg', 'investing', 'compound', 'wealth'],
    formula: 'Future Value Compounding & Safe Withdrawal',
    isPopular: true,
    iconName: 'Landmark',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'social-media-content-calendar',
    name: 'Social Media Content Calendar',
    shortDesc: 'Schedule and organize posts across LinkedIn, Twitter/X, Instagram, YouTube, and TikTok',
    category: 'planners',
    subcategoryId: 'planners-expansion-lifestyle',
    tags: ['planners', 'social-media', 'calendar', 'content', 'marketing', 'posts'],
    formula: 'Publish Date Scheduling & Platform Distribution',
    isPopular: false,
    iconName: 'Share2',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'business-launch-planner',
    name: 'Startup & Business Launch Planner',
    shortDesc: 'Organize startup tasks across legal, branding, product development, and marketing with capital cost estimates',
    category: 'planners',
    subcategoryId: 'planners-expansion-projects',
    tags: ['planners', 'business', 'startup', 'launch', 'entrepreneur', 'costs'],
    formula: 'Sum(Startup Capital & Task Checklist Completion)',
    isPopular: false,
    iconName: 'Briefcase',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'garden-planting-planner',
    name: 'Garden & Planting Season Schedule',
    shortDesc: 'Plan vegetable, herb, and flower gardens with seasonal planting calendars and quantity tracking',
    category: 'planners',
    subcategoryId: 'planners-expansion-lifestyle',
    tags: ['planners', 'garden', 'plants', 'vegetables', 'planting', 'harvest'],
    formula: 'Seasonal Crop Allocation & Yield Tracking',
    isPopular: false,
    iconName: 'Sprout',
    iconColor: '#10B981',
    iconBg: '#ECFDF5'
  },
  {
    id: 'personal-goal-organizer',
    name: 'Personal Goal & Life Planning Organizer',
    shortDesc: 'Set and track career, health, finance, and personal life goals with milestone progress bars',
    category: 'planners',
    subcategoryId: 'planners-expansion-lifestyle',
    tags: ['planners', 'goals', 'life', 'organizer', 'productivity', 'habits'],
    formula: 'Goal Milestone Progress & Target Date Tracking',
    isPopular: true,
    iconName: 'Target',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  }
];
