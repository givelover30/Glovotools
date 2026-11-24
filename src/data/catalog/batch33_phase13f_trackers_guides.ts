import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH33_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13f-sub-track', categoryId: 'trackers', name: 'Advanced Engineering, Business & Operational Trackers', slug: 'advanced-operational-trackers', description: 'Construction expense, equipment maintenance, business revenue/profit, employee attendance, solar energy production, and project labor cost trackers', sortOrder: 40 },
  { id: 'p13f-sub-guides', categoryId: 'guides', name: 'Advanced Engineering Formula & Standards References', slug: 'advanced-engineering-references', description: 'Electrical formulas, civil engineering formulas, construction material properties, welding symbols, mechanical design, solar components, and machining parameters references', sortOrder: 40 }
];

export const BATCH33_METADATA: CalculatorMeta[] = [
  // --- TRACKERS (6) ---
  {
    id: 'construction-expense-tracker',
    name: 'Construction Project Expense & Budget Tracker',
    shortDesc: 'Track project budgets versus actual expenditures across labor, materials, equipment, and contingencies with variance summaries',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'construction', 'expenses', 'budget', 'costs', 'variance'],
    formula: 'Budget Variance = Budgeted Amount - Actual Spent; Spent % = (Actual / Budget) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'equipment-maintenance-tracker',
    name: 'Equipment Usage & Preventive Maintenance Tracker',
    shortDesc: 'Track operating hours, service intervals, maintenance logs, repair costs, and upcoming service schedules for heavy equipment',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'equipment', 'maintenance', 'service-log', 'hours', 'repairs'],
    formula: 'Remaining Operating Hours = ServiceIntervalHours - CurrentHoursSinceLastService',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'business-revenue-profit-tracker',
    name: 'Business Revenue, Operating Expense & Profit Tracker',
    shortDesc: 'Record incoming revenues, operational overhead, cost of goods sold (COGS), and compute net profit margins over time',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'business', 'revenue', 'profit', 'expenses', 'margins'],
    formula: 'Gross Profit = Revenue - COGS; Net Profit = Gross Profit - Operating Expenses; Margin % = (Net / Revenue) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'employee-attendance-tracker',
    name: 'Employee Attendance & Working Hours Tracker',
    shortDesc: 'Log employee daily attendance, regular hours, overtime, absences, and lateness with cumulative monthly summaries',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'employee', 'attendance', 'hours', 'overtime', 'hr', 'timecard'],
    formula: 'Total Paid Hours = Regular Hours + Overtime Hours; Attendance Rate % = (Present Days / Total Workdays) × 100',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'solar-energy-tracker',
    name: 'Solar PV Energy Production & Yield Tracker',
    shortDesc: 'Record daily and monthly kilowatt-hour (kWh) solar electricity production, system performance ratios, and savings',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'solar', 'energy', 'production', 'yield', 'kwh', 'renewable'],
    formula: 'Performance Ratio (PR) = Actual Energy / (Installed Capacity × SunHours); Monthly Total = Sum(Daily kWh)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'project-labor-cost-tracker',
    name: 'Project Hours & Labor Cost Tracker',
    shortDesc: 'Track team task allocations, logged hours, hourly labor rates, and accumulated labor costs grouped by project and task',
    category: 'trackers',
    subcategoryId: 'p13f-sub-track',
    tags: ['trackers', 'project', 'labor-cost', 'hours', 'billing', 'productivity'],
    formula: 'Labor Cost = Logged Hours × Hourly Rate; Total Project Labor = Sum(Task Labor Costs)',
    isPopular: false,
    iconName: 'BarChart3',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },

  // --- GUIDES & REFERENCES (7) ---
  {
    id: 'electrical-formula-reference',
    name: 'Electrical Engineering Formula & Constants Reference',
    shortDesc: 'Comprehensive reference for Ohm’s law, AC power triangles, transformer ratios, impedance, and reactive power formulas',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'electrical', 'engineering', 'formulas', 'reference', 'ohms-law'],
    formula: 'V = I × R; P = V × I × cos(θ); X_L = 2πfL; X_C = 1 / (2πfC)',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'civil-formula-reference',
    name: 'Civil Engineering Mechanics & Geotech Formula Reference',
    shortDesc: 'Quick reference guide for civil engineering mechanics, beam deflection equations, soil pressure, and flow dynamics',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'civil-engineering', 'mechanics', 'formulas', 'beams', 'reference'],
    formula: 'Max Deflection (Simply Supported) = 5WL² / (384EI); Rankine Pressure = Ka γ z',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'construction-material-properties-reference',
    name: 'Construction Material Properties & Densities Reference',
    shortDesc: 'Reference guide for construction material densities, compressive strengths, thermal conductivity, and typical weights',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'construction', 'materials', 'density', 'strength', 'reference'],
    formula: 'Concrete Density ≈ 150 lb/ft³ (2400 kg/m³); Steel Yield Strength ≈ 36-50 ksi',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'welding-symbols-reference',
    name: 'Welding Symbols, Joint Types & Standards Reference',
    shortDesc: 'Reference guide for AWS welding symbols, fillet/groove weld designations, reference lines, and tail notes',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'welding', 'symbols', 'aws', 'standards', 'reference', 'fabrication'],
    formula: 'AWS A2.4 standard welding symbol nomenclature and dimensioning',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'mechanical-design-reference',
    name: 'Mechanical Engineering Design & Machine Elements Reference',
    shortDesc: 'Reference guide for mechanical gears, belts, bearings, shafts, stress concentration factors, and fastener torque limits',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'mechanical', 'engineering', 'design', 'gears', 'torque', 'reference'],
    formula: 'Torque = Force × Radius; Gear Ratio N1/N2 = T2/T1 = W1/W2',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'solar-components-reference',
    name: 'Solar PV Components & System Architecture Reference',
    shortDesc: 'Comprehensive reference guide covering photovoltaic cell technologies, MPPT inverters, battery chemistries, and BOS components',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'solar', 'pv', 'inverters', 'batteries', 'reference', 'renewable'],
    formula: 'STC Conditions: 1000 W/m², 25°C cell temperature, AM 1.5 spectrum',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'machining-parameters-reference',
    name: 'Manufacturing Machining Parameters & Tooling Reference',
    shortDesc: 'Reference guide for surface footage (SFM), spindle speed (RPM), chip load per tooth, cutting forces, and tool life formulas',
    category: 'guides',
    subcategoryId: 'p13f-sub-guides',
    tags: ['guides', 'machining', 'manufacturing', 'cutting-speed', 'feed-rate', 'reference'],
    formula: 'RPM = (SFM × 3.82) / Diameter; MRR = Width × Depth × FeedRate',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
