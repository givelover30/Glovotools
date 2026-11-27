import { CalculationContract, CalculationError } from '../../types.ts';

export interface ContinuityProcessItem {
  id: string;
  processName: string;
  department: string;
  recoveryTimeObjectiveHours: number;
  recoveryPointObjectiveHours: number;
  criticalityLevel: 'Mission Critical' | 'High' | 'Medium' | 'Low';
  status: 'Assessed' | 'Plan Documented' | 'Tested';
}

export interface BusinessContinuityInput {
  planTitle: string;
  processes: ContinuityProcessItem[];
}

export interface BusinessContinuityResult {
  planTitle: string;
  totalProcessesCount: number;
  testedCount: number;
  documentedCount: number;
  averageRtoHours: number;
}

export const DEFAULT_CONTINUITY_PROCESSES: ContinuityProcessItem[] = [
  { id: '1', processName: 'Customer Payment Gateway & Checkout', department: 'Fintech Operations', recoveryTimeObjectiveHours: 2, recoveryPointObjectiveHours: 1, criticalityLevel: 'Mission Critical', status: 'Tested' },
  { id: '2', processName: 'Core ERP Inventory Sync', department: 'Supply Chain', recoveryTimeObjectiveHours: 8, recoveryPointObjectiveHours: 4, criticalityLevel: 'High', status: 'Plan Documented' },
  { id: '3', processName: 'Customer Support Ticketing System', department: 'Support', recoveryTimeObjectiveHours: 24, recoveryPointObjectiveHours: 12, criticalityLevel: 'Medium', status: 'Assessed' }
];

export function validateContinuityInput(input: BusinessContinuityInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.planTitle || input.planTitle.trim() === '') {
    errors.push({ field: 'planTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Plan title is required.' });
  }
  input.processes.forEach((p, idx) => {
    if (p.recoveryTimeObjectiveHours < 0 || p.recoveryPointObjectiveHours < 0) {
      errors.push({ field: `processes[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'RTO and RPO cannot be negative.' });
    }
  });
  return errors;
}

export function calculateContinuity(input: BusinessContinuityInput): BusinessContinuityResult {
  const processes = input.processes || DEFAULT_CONTINUITY_PROCESSES;
  let totalRto = 0;
  let testedCount = 0;
  let documentedCount = 0;

  for (const p of processes) {
    const rto = Number(p.recoveryTimeObjectiveHours) || 0;
    totalRto += rto;
    if (p.status === 'Tested') testedCount++;
    else if (p.status === 'Plan Documented') documentedCount++;
  }

  const count = processes.length || 1;
  const averageRtoHours = Math.round((totalRto / count) * 10) / 10;

  return {
    planTitle: input.planTitle || 'Business Continuity Plan',
    totalProcessesCount: processes.length,
    testedCount,
    documentedCount,
    averageRtoHours
  };
}

export const BUSINESS_CONTINUITY_CONTRACT: CalculationContract<any, any> = {
  id: 'business-continuity-disaster-recovery-planner',
  name: 'Business Continuity & Disaster Recovery Planner',
  category: 'planners',
  validate: validateContinuityInput,
  calculate: calculateContinuity
} as CalculationContract<any, any>;
