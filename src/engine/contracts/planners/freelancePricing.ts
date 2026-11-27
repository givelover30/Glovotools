import { CalculationContract, CalculationError } from '../../types.ts';

export interface FreelancePricingInput {
  projectName: string;
  estimatedHours: number;
  desiredHourlyRate: number;
  projectExpenses: number;
  taxReservePct: number;
}

export interface FreelancePricingResult {
  projectName: string;
  estimatedHours: number;
  desiredHourlyRate: number;
  projectExpenses: number;
  laborSubtotal: number;
  taxReserveAmount: number;
  suggestedTotalProjectFee: number;
  effectiveHourlyRate: number;
}

export function validateFreelancePricingInput(input: FreelancePricingInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.projectName || input.projectName.trim() === '') {
    errors.push({ field: 'projectName', code: 'REQUIRED_FIELD_MISSING', message: 'Project name is required.' });
  }
  if (input.estimatedHours <= 0 || input.desiredHourlyRate <= 0) {
    errors.push({ field: 'estimatedHours', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Hours and rate must be positive.' });
  }
  return errors;
}

export function calculateFreelancePricing(input: FreelancePricingInput): FreelancePricingResult {
  const hours = Number(input.estimatedHours) || 40;
  const rate = Number(input.desiredHourlyRate) || 85;
  const expenses = Number(input.projectExpenses) || 500;
  const taxPct = (Number(input.taxReservePct) || 25) / 100;

  const laborSubtotal = hours * rate;
  const grossBeforeTax = laborSubtotal + expenses;
  const taxReserveAmount = grossBeforeTax * taxPct;
  const suggestedTotalProjectFee = grossBeforeTax + taxReserveAmount;
  const effectiveHourlyRate = hours > 0 ? Math.round((suggestedTotalProjectFee / hours) * 100) / 100 : 0;

  return {
    projectName: input.projectName || 'Client Project',
    estimatedHours: hours,
    desiredHourlyRate: rate,
    projectExpenses: expenses,
    laborSubtotal,
    taxReserveAmount: Math.round(taxReserveAmount),
    suggestedTotalProjectFee: Math.round(suggestedTotalProjectFee),
    effectiveHourlyRate
  };
}

export const FREELANCE_PRICING_CONTRACT: CalculationContract<any, any> = {
  id: 'freelance-pricing-planner',
  name: 'Freelance Project Pricing & Hourly Rate Planner',
  category: 'planners',
  validate: validateFreelancePricingInput,
  calculate: calculateFreelancePricing
} as CalculationContract<any, any>;
