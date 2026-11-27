import { CalculationContract, CalculationError } from '../../types.ts';

export interface MarketingCampaignItem {
  id: string;
  channel: 'Paid Search (PPC)' | 'Social Media Ads' | 'Content Marketing' | 'Email Outreach' | 'Events / Sponsorship';
  campaignName: string;
  allocatedBudget: number;
  actualSpent: number;
  estimatedLeads: number;
}

export interface MarketingBudgetInput {
  planName: string;
  totalPoolBudget: number;
  campaigns: MarketingCampaignItem[];
}

export interface MarketingBudgetResult {
  planName: string;
  totalPoolBudget: number;
  totalAllocatedBudget: number;
  totalActualSpent: number;
  budgetVariance: number;
  totalEstimatedLeads: number;
  averageCostPerLead: number;
}

export const DEFAULT_MARKETING_CAMPAIGNS: MarketingCampaignItem[] = [
  { id: '1', channel: 'Paid Search (PPC)', campaignName: 'Google Ads Q4 Intent Keywords', allocatedBudget: 3500, actualSpent: 3400, estimatedLeads: 120 },
  { id: '2', channel: 'Social Media Ads', campaignName: 'Meta Retargeting Video Campaign', allocatedBudget: 2500, actualSpent: 2650, estimatedLeads: 85 },
  { id: '3', channel: 'Content Marketing', campaignName: 'SEO Whitepaper & Lead Magnet', allocatedBudget: 1500, actualSpent: 1500, estimatedLeads: 95 }
];

export function validateMarketingInput(input: MarketingBudgetInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.planName || input.planName.trim() === '') {
    errors.push({ field: 'planName', code: 'REQUIRED_FIELD_MISSING', message: 'Plan name is required.' });
  }
  if (input.totalPoolBudget < 0) {
    errors.push({ field: 'totalPoolBudget', code: 'NON_NEGATIVE_REQUIRED', message: 'Total pool budget cannot be negative.' });
  }
  return errors;
}

export function calculateMarketing(input: MarketingBudgetInput): MarketingBudgetResult {
  const campaigns = input.campaigns || DEFAULT_MARKETING_CAMPAIGNS;
  let totalAllocatedBudget = 0;
  let totalActualSpent = 0;
  let totalEstimatedLeads = 0;

  for (const c of campaigns) {
    totalAllocatedBudget += Number(c.allocatedBudget) || 0;
    totalActualSpent += Number(c.actualSpent) || 0;
    totalEstimatedLeads += Number(c.estimatedLeads) || 0;
  }

  const budgetVariance = totalActualSpent - totalAllocatedBudget;
  const averageCostPerLead = totalEstimatedLeads > 0 ? Math.round((totalActualSpent / totalEstimatedLeads) * 100) / 100 : 0;

  return {
    planName: input.planName || 'Marketing Plan',
    totalPoolBudget: Number(input.totalPoolBudget) || 10000,
    totalAllocatedBudget,
    totalActualSpent,
    budgetVariance,
    totalEstimatedLeads,
    averageCostPerLead
  };
}

export const MARKETING_BUDGET_CONTRACT: CalculationContract<any, any> = {
  id: 'marketing-budget-planner',
  name: 'Small Business Marketing Budget & Campaign Planner',
  category: 'planners',
  validate: validateMarketingInput,
  calculate: calculateMarketing
} as CalculationContract<any, any>;
