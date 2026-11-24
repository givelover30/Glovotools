import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH31_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13d-sub-plan', categoryId: 'planners', name: 'Advanced Engineering, Production & Business Planners', slug: 'advanced-engineering-business-planners', description: 'Construction project, electrical installation, solar installation, manufacturing production, marketing budget, and employee payroll planners', sortOrder: 30 }
];

export const BATCH31_METADATA: CalculatorMeta[] = [
  // 1. Construction Project Cost & Schedule Planner
  {
    id: 'construction-cost-schedule-planner',
    name: 'Construction Project Cost & Schedule Planner',
    shortDesc: 'Plan construction work breakdown structures, project phases, labor, materials, equipment costs, contingency buffers, and timeline schedules',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'construction', 'cost-estimation', 'schedule', 'budget', 'project-management'],
    formula: 'Total Cost = (Labor + Materials + Equipment) × (1 + Contingency%); Schedule = Sum of Phase Durations',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 2. Electrical Installation Project Planner
  {
    id: 'electrical-install-planner',
    name: 'Electrical Installation Project Planner',
    shortDesc: 'Organize electrical installation tasks, wiring runs, panel upgrades, labor hours, material procurement, and milestone schedules',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'electrical', 'installation', 'project-management', 'budget', 'milestones'],
    formula: 'Estimated Budget = (Material Costs + Labor Hours × Hourly Rate) + Permitting & Inspection Fees',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 3. Solar Installation Project Planner
  {
    id: 'solar-install-planner',
    name: 'Solar PV Installation Project Planner',
    shortDesc: 'Plan solar panel installation workflows, site assessment, mounting hardware, inverter procurement, labor milestones, and project budgets',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'solar', 'pv', 'installation', 'renewable', 'project-planning'],
    formula: 'Total Project Cost = Panel Count × UnitCost + Inverter + Racking + Labor + Permitting',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Manufacturing Production Planner
  {
    id: 'manufacturing-production-planner',
    name: 'Manufacturing Production & Capacity Planner',
    shortDesc: 'Plan production batches, work center capacity, machine processing times, material requirements, and delivery schedules',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'manufacturing', 'production', 'capacity', 'work-center', 'operations'],
    formula: 'Total Production Time = (Batch Quantity × UnitCycleTime) / Efficiency; Capacity Utilization = Required / Available',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 5. Small Business Marketing Budget Planner
  {
    id: 'marketing-budget-planner',
    name: 'Small Business Marketing Budget & Campaign Planner',
    shortDesc: 'Allocate marketing budgets across digital channels (PPC, Social, Email, Content), track campaign spending, and forecast ROI',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'marketing', 'budget', 'advertising', 'campaigns', 'business'],
    formula: 'Remaining Budget = Total Budget - Sum(Channel Allocations); Projected ROI = (Expected Revenue / Budget) × 100',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 6. Employee Payroll Planning Tool
  {
    id: 'employee-payroll-planner',
    name: 'Employee Headcount & Payroll Budget Planner',
    shortDesc: 'Plan employee staffing levels, base pay rates, scheduled hours, overtime assumptions, and employer tax/benefit cost overheads',
    category: 'planners',
    subcategoryId: 'p13d-sub-plan',
    tags: ['planner', 'payroll', 'employee', 'headcount', 'budget', 'compensation', 'hr'],
    formula: 'Total Employer Cost = Base Salary + Overtime Pay + (Base Salary × Employer Tax & Benefits Rate)',
    isPopular: false,
    iconName: 'CalendarDays',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  }
];
