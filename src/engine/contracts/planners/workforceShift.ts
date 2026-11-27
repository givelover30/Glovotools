import { CalculationContract, CalculationError } from '../../types.ts';

export interface ShiftAssignmentItem {
  id: string;
  employeeName: string;
  department: string;
  shiftName: 'Morning (07:00 - 15:30)' | 'Evening (15:00 - 23:30)' | 'Night (23:00 - 07:30)' | 'Weekend Day';
  scheduledHours: number;
  hourlyRate: number;
}

export interface WorkforceShiftInput {
  scheduleTitle: string;
  targetWeeklyHoursPerEmployee: number;
  shifts: ShiftAssignmentItem[];
}

export interface WorkforceShiftResult {
  scheduleTitle: string;
  totalShiftsCount: number;
  totalScheduledHours: number;
  totalEstimatedPayroll: number;
  averageHoursPerShift: number;
}

export const DEFAULT_SHIFT_ASSIGNMENTS: ShiftAssignmentItem[] = [
  { id: '1', employeeName: 'Maria Garcia', department: 'Customer Support', shiftName: 'Morning (07:00 - 15:30)', scheduledHours: 40, hourlyRate: 28 },
  { id: '2', employeeName: 'Kevin Chen', department: 'Logistics', shiftName: 'Evening (15:00 - 23:30)', scheduledHours: 40, hourlyRate: 32 },
  { id: '3', employeeName: 'Rachel Adams', department: 'Quality Assurance', shiftName: 'Night (23:00 - 07:30)', scheduledHours: 35, hourlyRate: 35 }
];

export function validateWorkforceInput(input: WorkforceShiftInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.scheduleTitle || input.scheduleTitle.trim() === '') {
    errors.push({ field: 'scheduleTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Schedule title is required.' });
  }
  input.shifts.forEach((s, idx) => {
    if (s.scheduledHours <= 0 || s.hourlyRate <= 0) {
      errors.push({ field: `shifts[${idx}]`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Hours and pay rate must be positive.' });
    }
  });
  return errors;
}

export function calculateWorkforce(input: WorkforceShiftInput): WorkforceShiftResult {
  const shifts = input.shifts || DEFAULT_SHIFT_ASSIGNMENTS;
  let totalScheduledHours = 0;
  let totalEstimatedPayroll = 0;

  for (const s of shifts) {
    const hrs = Number(s.scheduledHours) || 0;
    const rate = Number(s.hourlyRate) || 0;
    totalScheduledHours += hrs;
    totalEstimatedPayroll += hrs * rate;
  }

  const totalShiftsCount = shifts.length;
  const averageHoursPerShift = totalShiftsCount > 0 ? Math.round((totalScheduledHours / totalShiftsCount) * 10) / 10 : 0;

  return {
    scheduleTitle: input.scheduleTitle || 'Weekly Roster',
    totalShiftsCount,
    totalScheduledHours,
    totalEstimatedPayroll: Math.round(totalEstimatedPayroll * 100) / 100,
    averageHoursPerShift
  };
}

export const WORKFORCE_SHIFT_CONTRACT: CalculationContract<any, any> = {
  id: 'workforce-shift-planner',
  name: 'Employee Workforce & Shift Scheduling Planner',
  category: 'planners',
  validate: validateWorkforceInput,
  calculate: calculateWorkforce
} as CalculationContract<any, any>;
