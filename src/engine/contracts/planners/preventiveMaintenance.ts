import { CalculationContract, CalculationError } from '../../types.ts';

export interface MaintenanceAssetItem {
  id: string;
  assetTag: string;
  assetName: string;
  location: string;
  intervalDays: number;
  lastServiceDate: string;
  estimatedServiceCost: number;
  status: 'Scheduled' | 'Overdue' | 'Completed';
}

export interface PreventiveMaintenanceInput {
  programTitle: string;
  assets: MaintenanceAssetItem[];
}

export interface PreventiveMaintenanceResult {
  programTitle: string;
  totalAssetsCount: number;
  completedAssetsCount: number;
  overdueAssetsCount: number;
  totalEstimatedServiceBudget: number;
}

export const DEFAULT_MAINTENANCE_ASSETS: MaintenanceAssetItem[] = [
  { id: '1', assetTag: 'AST-HVAC-01', assetName: 'Roof Top HVAC Air Handler #1', location: 'Main Building Roof', intervalDays: 90, lastServiceDate: '2025-08-15', estimatedServiceCost: 850, status: 'Scheduled' },
  { id: '2', assetTag: 'AST-GEN-02', assetName: 'Emergency Diesel Generator 150kW', location: 'Utility Basement', intervalDays: 180, lastServiceDate: '2025-04-10', estimatedServiceCost: 1500, status: 'Overdue' },
  { id: '3', assetTag: 'AST-PUMP-03', assetName: 'Fire Suppression Booster Pump', location: 'Pump House', intervalDays: 30, lastServiceDate: '2025-10-01', estimatedServiceCost: 400, status: 'Completed' }
];

export function validateMaintenanceInput(input: PreventiveMaintenanceInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.programTitle || input.programTitle.trim() === '') {
    errors.push({ field: 'programTitle', code: 'REQUIRED_FIELD_MISSING', message: 'Program title is required.' });
  }
  input.assets.forEach((a, idx) => {
    if (a.estimatedServiceCost < 0 || a.intervalDays <= 0) {
      errors.push({ field: `assets[${idx}]`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Interval and cost must be positive.' });
    }
  });
  return errors;
}

export function calculateMaintenance(input: PreventiveMaintenanceInput): PreventiveMaintenanceResult {
  const assets = input.assets || DEFAULT_MAINTENANCE_ASSETS;
  let totalEstimatedServiceBudget = 0;
  let completedAssetsCount = 0;
  let overdueAssetsCount = 0;

  for (const a of assets) {
    totalEstimatedServiceBudget += Number(a.estimatedServiceCost) || 0;
    if (a.status === 'Completed') completedAssetsCount++;
    else if (a.status === 'Overdue') overdueAssetsCount++;
  }

  return {
    programTitle: input.programTitle || 'Preventive Maintenance Program',
    totalAssetsCount: assets.length,
    completedAssetsCount,
    overdueAssetsCount,
    totalEstimatedServiceBudget: Math.round(totalEstimatedServiceBudget * 100) / 100
  };
}

export const PREVENTIVE_MAINTENANCE_CONTRACT: CalculationContract<any, any> = {
  id: 'preventive-maintenance-schedule-planner',
  name: 'Preventive Maintenance Schedule Planner',
  category: 'planners',
  validate: validateMaintenanceInput,
  calculate: calculateMaintenance
} as CalculationContract<any, any>;
