import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface LaunchMilestone {
  id: string;
  phase: 'Legal & Setup' | 'Product / MVP' | 'Marketing' | 'Launch Day';
  task: string;
  dueDate: string;
  estimatedCost: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface BusinessLaunchInput {
  businessName: string;
  milestones: LaunchMilestone[];
}

export interface BusinessLaunchResult {
  businessName: string;
  totalEstimatedCost: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  pendingTasksCount: number;
  totalTasksCount: number;
}

export const DEFAULT_LAUNCH_MILESTONES: LaunchMilestone[] = [
  { id: '1', phase: 'Legal & Setup', task: 'LLC Formation & EIN Registration', dueDate: '2025-12-01', estimatedCost: 500, status: 'Completed' },
  { id: '2', phase: 'Product / MVP', task: 'Finalize Core Service Offering & Pricing', dueDate: '2025-12-10', estimatedCost: 200, status: 'In Progress' },
  { id: '3', phase: 'Marketing', task: 'Build Landing Page & Social Channels', dueDate: '2025-12-20', estimatedCost: 350, status: 'Pending' },
  { id: '4', phase: 'Launch Day', task: 'Public Beta Announcement & Outreach', dueDate: '2026-01-05', estimatedCost: 150, status: 'Pending' }
];

export function validateBusinessLaunchInput(input: BusinessLaunchInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.businessName || input.businessName.trim() === '') {
    errors.push({ field: 'businessName', code: 'REQUIRED_FIELD_MISSING', message: 'Business name is required.' });
  }
  input.milestones.forEach((m, idx) => {
    if (m.estimatedCost < 0) {
      errors.push({ field: `milestones[${idx}].estimatedCost`, code: 'NON_NEGATIVE_REQUIRED', message: 'Estimated cost cannot be negative.' });
    }
  });
  return errors;
}

export function calculateBusinessLaunch(input: BusinessLaunchInput): BusinessLaunchResult {
  const milestones = input.milestones || DEFAULT_LAUNCH_MILESTONES;
  let totalEstimatedCost = 0;
  let completedTasksCount = 0;
  let inProgressTasksCount = 0;
  let pendingTasksCount = 0;

  for (const m of milestones) {
    totalEstimatedCost += Number(m.estimatedCost) || 0;
    if (m.status === 'Completed') completedTasksCount++;
    else if (m.status === 'In Progress') inProgressTasksCount++;
    else pendingTasksCount++;
  }

  return {
    businessName: input.businessName || 'New Venture',
    totalEstimatedCost,
    completedTasksCount,
    inProgressTasksCount,
    pendingTasksCount,
    totalTasksCount: milestones.length
  };
}

export const BUSINESS_LAUNCH_PLANNER_CONTRACT: CalculationContract<any, any> = {
  id: 'business-launch-planner',
  name: 'Business Launch Planner',
  category: 'planners',
  validate: validateBusinessLaunchInput,
  calculate: calculateBusinessLaunch
} as CalculationContract<any, any>;
