import { CalculationContract, CalculationError } from '../../types.ts';

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  supplierName: string;
  itemName: string;
  quantityOrdered: number;
  unitPrice: number;
  status: 'Draft' | 'Approved' | 'Ordered' | 'Received' | 'Cancelled';
}

export interface ProcurementPurchaseOrderInput {
  procurementPlanName: string;
  orders: PurchaseOrderItem[];
}

export interface ProcurementPurchaseOrderResult {
  procurementPlanName: string;
  totalOrdersCount: number;
  totalOrderValue: number;
  receivedOrdersCount: number;
  pendingOrdersCount: number;
}

export const DEFAULT_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  { id: '1', poNumber: 'PO-2025-101', supplierName: 'Apex Industrial Parts', itemName: 'Hydraulic Seals Kit', quantityOrdered: 50, unitPrice: 34.50, status: 'Ordered' },
  { id: '2', poNumber: 'PO-2025-102', supplierName: 'Metro Steel & Alloy', itemName: 'Cold Rolled Steel Sheets', quantityOrdered: 120, unitPrice: 85.00, status: 'Approved' },
  { id: '3', poNumber: 'PO-2025-103', supplierName: 'Precision Sensors Corp', itemName: 'Optical Proximity Switches', quantityOrdered: 30, unitPrice: 120.00, status: 'Received' }
];

export function validateProcurementInput(input: ProcurementPurchaseOrderInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.procurementPlanName || input.procurementPlanName.trim() === '') {
    errors.push({ field: 'procurementPlanName', code: 'REQUIRED_FIELD_MISSING', message: 'Procurement plan name is required.' });
  }
  input.orders.forEach((o, idx) => {
    if (o.quantityOrdered < 0 || o.unitPrice < 0) {
      errors.push({ field: `orders[${idx}]`, code: 'NON_NEGATIVE_REQUIRED', message: 'Quantity and price cannot be negative.' });
    }
  });
  return errors;
}

export function calculateProcurement(input: ProcurementPurchaseOrderInput): ProcurementPurchaseOrderResult {
  const orders = input.orders || DEFAULT_PURCHASE_ORDERS;
  let totalOrderValue = 0;
  let receivedOrdersCount = 0;
  let pendingOrdersCount = 0;

  for (const o of orders) {
    const qty = Number(o.quantityOrdered) || 0;
    const price = Number(o.unitPrice) || 0;
    totalOrderValue += qty * price;
    if (o.status === 'Received') receivedOrdersCount++;
    else if (o.status === 'Ordered' || o.status === 'Approved') pendingOrdersCount++;
  }

  return {
    procurementPlanName: input.procurementPlanName || 'Q4 Procurement Plan',
    totalOrdersCount: orders.length,
    totalOrderValue: Math.round(totalOrderValue * 100) / 100,
    receivedOrdersCount,
    pendingOrdersCount
  };
}

export const PROCUREMENT_PURCHASE_ORDER_CONTRACT: CalculationContract<any, any> = {
  id: 'procurement-purchase-order-planner',
  name: 'Procurement & Purchase Order Planning Tool',
  category: 'planners',
  validate: validateProcurementInput,
  calculate: calculateProcurement
} as CalculationContract<any, any>;
