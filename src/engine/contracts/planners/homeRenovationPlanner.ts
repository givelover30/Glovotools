import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface RenoItem {
  id: string;
  room: string;
  task: string;
  budget: number;
  spent: number;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface HomeRenovationInput {
  projectName: string;
  items: RenoItem[];
}

export interface HomeRenovationResult {
  projectName: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  plannedTasksCount: number;
  totalTasksCount: number;
}

export const DEFAULT_RENO_ITEMS: RenoItem[] = [
  { id: '1', room: 'Kitchen', task: 'Cabinet Refacing & Countertops', budget: 4500, spent: 4200, status: 'In Progress' },
  { id: '2', room: 'Bathroom', task: 'New Tile Flooring & Vanity', budget: 2500, spent: 2650, status: 'Completed' },
  { id: '3', room: 'Living Room', task: 'Hardwood Floor Sanding & Paint', budget: 3000, spent: 0, status: 'Planned' }
];

export function validateHomeRenovationInput(input: HomeRenovationInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({ field: 'projectName', code: 'REQUIRED_FIELD_MISSING', message: 'Project name is required.' });
  }
  input.items.forEach((item, idx) => {
    if (item.budget < 0 || item.spent < 0) {
      errors.push({ field: `items[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'Budget and spent amounts cannot be negative.' });
    }
  });
  return errors;
}

export function calculateHomeRenovation(input: HomeRenovationInput): HomeRenovationResult {
  const items = input.items || DEFAULT_RENO_ITEMS;
  let totalBudget = 0;
  let totalSpent = 0;
  let completedTasksCount = 0;
  let inProgressTasksCount = 0;
  let plannedTasksCount = 0;

  for (const item of items) {
    totalBudget += Number(item.budget) || 0;
    totalSpent += Number(item.spent) || 0;
    if (item.status === 'Completed') completedTasksCount++;
    else if (item.status === 'In Progress') inProgressTasksCount++;
    else plannedTasksCount++;
  }

  const remainingBudget = totalBudget - totalSpent;

  return {
    projectName: input.projectName || 'Home Renovation Project',
    totalBudget,
    totalSpent,
    remainingBudget,
    completedTasksCount,
    inProgressTasksCount,
    plannedTasksCount,
    totalTasksCount: items.length
  };
}

export const HOME_RENOVATION_PLANNER_CONTRACT: CalculationContract<any, any> = {
  id: 'home-renovation-planner',
  name: 'Home Renovation Planner',
  category: 'planners',
  validate: validateHomeRenovationInput,
  calculate: calculateHomeRenovation
} as CalculationContract<any, any>;
