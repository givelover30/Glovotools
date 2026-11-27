import { CalculationContract, CalculationError } from '../../types.ts';
import { PrecisionEngine } from '../../PrecisionEngine.ts';

export interface PlantCropItem {
  id: string;
  cropName: string;
  category: 'Vegetables' | 'Herbs' | 'Fruits' | 'Flowers';
  plantingMethod: 'Direct Sow' | 'Transplant' | 'Indoor Seedlings';
  frostTiming: 'Early Spring' | 'After Last Frost' | 'Late Summer';
  spacingInches: number;
  quantity: number;
}

export interface GardenPlantingInput {
  gardenName: string;
  crops: PlantCropItem[];
}

export interface GardenPlantingResult {
  gardenName: string;
  totalCropsCount: number;
  totalPlantCount: number;
  categoryBreakdown: Record<string, number>;
}

export const DEFAULT_GARDEN_CROPS: PlantCropItem[] = [
  { id: '1', cropName: 'Tomatoes (Roma & Cherry)', category: 'Vegetables', plantingMethod: 'Transplant', frostTiming: 'After Last Frost', spacingInches: 24, quantity: 6 },
  { id: '2', cropName: 'Basil (Genovese)', category: 'Herbs', plantingMethod: 'Transplant', frostTiming: 'After Last Frost', spacingInches: 10, quantity: 4 },
  { id: '3', cropName: 'Carrots (Nantes)', category: 'Vegetables', plantingMethod: 'Direct Sow', frostTiming: 'Early Spring', spacingInches: 3, quantity: 30 },
  { id: '4', cropName: 'Lettuce (Buttercrunch)', category: 'Vegetables', plantingMethod: 'Direct Sow', frostTiming: 'Early Spring', spacingInches: 8, quantity: 12 }
];

export function validateGardenPlantingInput(input: GardenPlantingInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.gardenName || input.gardenName.trim() === '') {
    errors.push({ field: 'gardenName', code: 'REQUIRED_FIELD_MISSING', message: 'Garden name is required.' });
  }
  input.crops.forEach((c, idx) => {
    if (c.quantity < 1) {
      errors.push({ field: `crops[${idx}].quantity`, code: 'POSITIVE_NUMBER_REQUIRED', message: 'Quantity must be at least 1.' });
    }
    if (c.spacingInches < 0) {
      errors.push({ field: `crops[${idx}].spacingInches`, code: 'NON_NEGATIVE_REQUIRED', message: 'Spacing cannot be negative.' });
    }
  });
  return errors;
}

export function calculateGardenPlanting(input: GardenPlantingInput): GardenPlantingResult {
  const crops = input.crops || DEFAULT_GARDEN_CROPS;
  let totalPlantCount = 0;
  const categoryBreakdown: Record<string, number> = {};

  for (const c of crops) {
    const qty = Number(c.quantity) || 0;
    totalPlantCount += qty;
    const cat = c.category || 'Vegetables';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + qty;
  }

  return {
    gardenName: input.gardenName || 'My Backyard Garden',
    totalCropsCount: crops.length,
    totalPlantCount,
    categoryBreakdown
  };
}

export const GARDEN_PLANTING_PLANNER_CONTRACT: CalculationContract<any, any> = {
  id: 'garden-planting-planner',
  name: 'Garden Planting Planner',
  category: 'planners',
  validate: validateGardenPlantingInput,
  calculate: calculateGardenPlanting
} as CalculationContract<any, any>;
