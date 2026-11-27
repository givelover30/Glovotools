import { CalculationContract, CalculationError } from '../../types.ts';

export interface ConstructionTaskItem {
  id: string;
  phase: string;
  task: string;
  startDate: string;
  endDate: string;
  budgetCost: number;
  actualCost: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface ConstructionCostScheduleInput {
  projectName: string;
  contingencyPct: number;
  tasks: ConstructionTaskItem[];
}

export interface ConstructionCostScheduleResult {
  projectName: string;
  totalBudgetCost: number;
  contingencyAmount: number;
  totalEstimatedProjectCost: number;
  totalActualCost: number;
  costVariance: number;
  completedTasksCount: number;
  delayedTasksCount: number;
  totalTasksCount: number;
}

export const DEFAULT_CONSTRUCTION_TASKS: ConstructionTaskItem[] = [
  { id: '1', phase: 'Pre-Construction', task: 'Site Survey & Permitting', startDate: '2025-06-01', endDate: '2025-06-15', budgetCost: 3500, actualCost: 3800, status: 'Completed' },
  { id: '2', phase: 'Foundation', task: 'Excavation & Pouring Concrete Slab', startDate: '2025-06-16', endDate: '2025-07-05', budgetCost: 18000, actualCost: 17500, status: 'In Progress' },
  { id: '3', phase: 'Framing', task: 'Structural Framing & Roof Trusses', startDate: '2025-07-06', endDate: '2025-07-30', budgetCost: 24000, actualCost: 0, status: 'Not Started' }
];

export function validateConstructionInput(input: ConstructionCostScheduleInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({ field: 'projectName', code: 'REQUIRED_FIELD_MISSING', message: 'Project name is required.' });
  }
  if (input.contingencyPct < 0 || input.contingencyPct > 50) {
    errors.push({ field: 'contingencyPct', code: 'NON_NEGATIVE_REQUIRED', message: 'Contingency percentage must be between 0 and 50.' });
  }
  input.tasks.forEach((t, idx) => {
    if (t.budgetCost < 0 || t.actualCost < 0) {
      errors.push({ field: `tasks[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'Costs cannot be negative.' });
    }
  });
  return errors;
}

export function calculateConstruction(input: ConstructionCostScheduleInput): ConstructionCostScheduleResult {
  const tasks = input.tasks || DEFAULT_CONSTRUCTION_TASKS;
  let totalBudgetCost = 0;
  let totalActualCost = 0;
  let completedTasksCount = 0;
  let delayedTasksCount = 0;

  for (const t of tasks) {
    totalBudgetCost += Number(t.budgetCost) || 0;
    totalActualCost += Number(t.actualCost) || 0;
    if (t.status === 'Completed') completedTasksCount++;
    else if (t.status === 'Delayed') delayedTasksCount++;
  }

  const contingencyAmount = (totalBudgetCost * (Number(input.contingencyPct) || 10)) / 100;
  const totalEstimatedProjectCost = totalBudgetCost + contingencyAmount;
  const costVariance = totalActualCost - totalBudgetCost;

  return {
    projectName: input.projectName || 'Construction Project',
    totalBudgetCost,
    contingencyAmount,
    totalEstimatedProjectCost,
    totalActualCost,
    costVariance,
    completedTasksCount,
    delayedTasksCount,
    totalTasksCount: tasks.length
  };
}

export const CONSTRUCTION_COST_SCHEDULE_CONTRACT: CalculationContract<any, any> = {
  id: 'construction-cost-schedule-planner',
  name: 'Construction Project Cost & Schedule Planner',
  category: 'planners',
  validate: validateConstructionInput,
  calculate: calculateConstruction
} as CalculationContract<any, any>;
