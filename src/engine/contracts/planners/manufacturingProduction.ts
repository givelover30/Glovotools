import { CalculationContract, CalculationError } from '../../types.ts';

export interface ProductionOrder {
  id: string;
  productName: string;
  targetQuantity: number;
  completedQuantity: number;
  cycleTimeMinutesPerUnit: number;
  workCenter: string;
  status: 'Queued' | 'In Production' | 'Completed';
}

export interface ManufacturingProductionInput {
  facilityName: string;
  availableDailyHours: number;
  orders: ProductionOrder[];
}

export interface ManufacturingProductionResult {
  facilityName: string;
  totalOrdersCount: number;
  totalTargetUnits: number;
  totalCompletedUnits: number;
  totalEstimatedHoursRequired: number;
  capacityUtilizationPct: number;
}

export const DEFAULT_PRODUCTION_ORDERS: ProductionOrder[] = [
  { id: '1', productName: 'Precision CNC Valve Assembly', targetQuantity: 500, completedQuantity: 320, cycleTimeMinutesPerUnit: 15, workCenter: 'CNC Cell A', status: 'In Production' },
  { id: '2', productName: 'Hydraulic Piston Housing', targetQuantity: 200, completedQuantity: 200, cycleTimeMinutesPerUnit: 25, workCenter: 'Milling Line B', status: 'Completed' },
  { id: '3', productName: 'Stainless Steel Bracket Set', targetQuantity: 1200, completedQuantity: 0, cycleTimeMinutesPerUnit: 5, workCenter: 'Stamping Press C', status: 'Queued' }
];

export function validateManufacturingInput(input: ManufacturingProductionInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.facilityName || input.facilityName.trim() === '') {
    errors.push({ field: 'facilityName', code: 'REQUIRED_FIELD_MISSING', message: 'Facility name is required.' });
  }
  if (input.availableDailyHours <= 0) {
    errors.push({ field: 'availableDailyHours', code: 'POSITIVE_NUMBER_REQUIRED', message: 'Available daily hours must be positive.' });
  }
  return errors;
}

export function calculateManufacturing(input: ManufacturingProductionInput): ManufacturingProductionResult {
  const orders = input.orders || DEFAULT_PRODUCTION_ORDERS;
  let totalTargetUnits = 0;
  let totalCompletedUnits = 0;
  let totalMinutesRequired = 0;

  for (const o of orders) {
    const target = Number(o.targetQuantity) || 0;
    const completed = Number(o.completedQuantity) || 0;
    const cycle = Number(o.cycleTimeMinutesPerUnit) || 0;
    totalTargetUnits += target;
    totalCompletedUnits += completed;
    totalMinutesRequired += target * cycle;
  }

  const totalEstimatedHoursRequired = totalMinutesRequired / 60;
  const availableHours = (Number(input.availableDailyHours) || 8) * 5; // Weekly capacity estimate
  const capacityUtilizationPct = availableHours > 0 ? Math.min(200, Math.round((totalEstimatedHoursRequired / availableHours) * 100)) : 0;

  return {
    facilityName: input.facilityName || 'Manufacturing Plant',
    totalOrdersCount: orders.length,
    totalTargetUnits,
    totalCompletedUnits,
    totalEstimatedHoursRequired: Math.round(totalEstimatedHoursRequired * 10) / 10,
    capacityUtilizationPct
  };
}

export const MANUFACTURING_PRODUCTION_CONTRACT: CalculationContract<any, any> = {
  id: 'manufacturing-production-planner',
  name: 'Manufacturing Production & Capacity Planner',
  category: 'planners',
  validate: validateManufacturingInput,
  calculate: calculateManufacturing
} as CalculationContract<any, any>;
