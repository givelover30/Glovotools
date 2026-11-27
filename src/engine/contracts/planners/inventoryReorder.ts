import { CalculationContract, CalculationError } from '../../types.ts';

export interface InventorySkuItem {
  id: string;
  skuCode: string;
  itemName: string;
  currentStock: number;
  averageDailyDemand: number;
  leadTimeDays: number;
  safetyStock: number;
  unitCost: number;
}

export interface InventoryReorderInput {
  inventoryName: string;
  items: InventorySkuItem[];
}

export interface ComputedSkuItem extends InventorySkuItem {
  reorderPoint: number;
  needsReorder: boolean;
  recommendedOrderQuantity: number;
  inventoryValuation: number;
}

export interface InventoryReorderResult {
  inventoryName: string;
  totalSkusCount: number;
  lowStockSkusCount: number;
  totalInventoryValuation: number;
  items: ComputedSkuItem[];
}

export const DEFAULT_INVENTORY_ITEMS: InventorySkuItem[] = [
  { id: '1', skuCode: 'SKU-WIDGET-01', itemName: 'Industrial Steel Fastener M8', currentStock: 140, averageDailyDemand: 15, leadTimeDays: 5, safetyStock: 30, unitCost: 2.50 },
  { id: '2', skuCode: 'SKU-VALVE-02', itemName: 'Brass Check Valve 3/4"', currentStock: 25, averageDailyDemand: 8, leadTimeDays: 7, safetyStock: 20, unitCost: 45.00 },
  { id: '3', skuCode: 'SKU-GASKET-03', itemName: 'High Temperature Silicone Gasket', currentStock: 500, averageDailyDemand: 25, leadTimeDays: 4, safetyStock: 100, unitCost: 1.20 }
];

export function validateInventoryInput(input: InventoryReorderInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.inventoryName || input.inventoryName.trim() === '') {
    errors.push({ field: 'inventoryName', code: 'REQUIRED_FIELD_MISSING', message: 'Inventory name is required.' });
  }
  input.items.forEach((item, idx) => {
    if (item.currentStock < 0 || item.unitCost < 0) {
      errors.push({ field: `items[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'Stock and cost cannot be negative.' });
    }
  });
  return errors;
}

export function calculateInventory(input: InventoryReorderInput): InventoryReorderResult {
  const items = input.items || DEFAULT_INVENTORY_ITEMS;
  let lowStockSkusCount = 0;
  let totalInventoryValuation = 0;

  const computedItems: ComputedSkuItem[] = items.map((item) => {
    const demand = Number(item.averageDailyDemand) || 0;
    const leadTime = Number(item.leadTimeDays) || 0;
    const safety = Number(item.safetyStock) || 0;
    const stock = Number(item.currentStock) || 0;
    const cost = Number(item.unitCost) || 0;

    const reorderPoint = (demand * leadTime) + safety;
    const needsReorder = stock <= reorderPoint;
    if (needsReorder) lowStockSkusCount++;

    const recommendedOrderQuantity = Math.max(0, (reorderPoint * 2) - stock);
    const valuation = stock * cost;
    totalInventoryValuation += valuation;

    return {
      ...item,
      reorderPoint,
      needsReorder,
      recommendedOrderQuantity,
      inventoryValuation: Math.round(valuation * 100) / 100
    };
  });

  return {
    inventoryName: input.inventoryName || 'Warehouse Inventory',
    totalSkusCount: items.length,
    lowStockSkusCount,
    totalInventoryValuation: Math.round(totalInventoryValuation * 100) / 100,
    items: computedItems
  };
}

export const INVENTORY_REORDER_CONTRACT: CalculationContract<any, any> = {
  id: 'inventory-reorder-planner',
  name: 'Inventory Reorder Point & Stock Planner',
  category: 'planners',
  validate: validateInventoryInput,
  calculate: calculateInventory
} as CalculationContract<any, any>;
