import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface PersonalGoalItem {
  id: string;
  category: 'Career & Finance' | 'Health & Fitness' | 'Personal Growth' | 'Relationships' | 'Hobbies';
  goalTitle: string;
  targetDate: string;
  progressPct: number;
  status: 'Not Started' | 'In Progress' | 'Achieved';
}

export interface PersonalGoalInput {
  organizerTitle: string;
  goals: PersonalGoalItem[];
}

export interface PersonalGoalResult {
  organizerTitle: string;
  totalGoalsCount: number;
  achievedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  averageProgressPct: number;
}

export const DEFAULT_PERSONAL_GOALS: PersonalGoalItem[] = [
  { id: '1', category: 'Health & Fitness', goalTitle: 'Run a 10k in Under 50 Minutes', targetDate: '2026-06-30', progressPct: 60, status: 'In Progress' },
  { id: '2', category: 'Career & Finance', goalTitle: 'Save 6 Months Emergency Fund', targetDate: '2026-12-31', progressPct: 85, status: 'In Progress' },
  { id: '3', category: 'Personal Growth', goalTitle: 'Read 24 Books This Year', targetDate: '2026-12-31', progressPct: 100, status: 'Achieved' }
];

export function validatePersonalGoalInput(input: PersonalGoalInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.organizerTitle || input.organizerTitle.trim() === '') {
    errors.push({ field: 'organizerTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Organizer title is required.' });
  }
  input.goals.forEach((g, idx) => {
    if (g.progressPct < 0 || g.progressPct > 100) {
      errors.push({ field: `goals[${idx}].progressPct`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Progress percentage must be between 0 and 100.' });
    }
  });
  return errors;
}

export function calculatePersonalGoal(input: PersonalGoalInput): PersonalGoalResult {
  const goals = input.goals || DEFAULT_PERSONAL_GOALS;
  let achievedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;
  let totalProgress = 0;

  for (const g of goals) {
    const prog = Number(g.progressPct) || 0;
    totalProgress += prog;
    if (g.status === 'Achieved') achievedCount++;
    else if (g.status === 'In Progress') inProgressCount++;
    else notStartedCount++;
  }

  const count = goals.length || 1;
  const averageProgressPct = Math.round(totalProgress / count);

  return {
    organizerTitle: input.organizerTitle || 'Personal Goals',
    totalGoalsCount: goals.length,
    achievedCount,
    inProgressCount,
    notStartedCount,
    averageProgressPct
  };
}

export const PERSONAL_GOAL_ORGANIZER_CONTRACT: CalculationContract<any, any> = {
  id: 'personal-goal-organizer',
  name: 'Personal Goal Organizer',
  category: 'planners',
  validate: validatePersonalGoalInput,
  calculate: calculatePersonalGoal
} as CalculationContract<any, any>;
