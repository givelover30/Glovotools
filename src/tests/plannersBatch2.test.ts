import { describe, it, expect } from 'vitest';
import { CalculationExecutor } from '../engine/CalculationExecutor.ts';
import { calculateConstruction, CONSTRUCTION_COST_SCHEDULE_CONTRACT, DEFAULT_CONSTRUCTION_TASKS } from '../engine/contracts/planners/constructionCostSchedule.ts';
import { calculateElectrical, ELECTRICAL_INSTALL_CONTRACT, DEFAULT_ELECTRICAL_CIRCUITS } from '../engine/contracts/planners/electricalInstall.ts';
import { calculateSolar, SOLAR_INSTALL_CONTRACT, DEFAULT_SOLAR_PANELS } from '../engine/contracts/planners/solarInstall.ts';
import { calculateManufacturing, MANUFACTURING_PRODUCTION_CONTRACT, DEFAULT_PRODUCTION_ORDERS } from '../engine/contracts/planners/manufacturingProduction.ts';
import { calculateMarketing, MARKETING_BUDGET_CONTRACT, DEFAULT_MARKETING_CAMPAIGNS } from '../engine/contracts/planners/marketingBudget.ts';
import { calculatePayroll, EMPLOYEE_PAYROLL_CONTRACT, DEFAULT_EMPLOYEES } from '../engine/contracts/planners/employeePayroll.ts';
import { calculateInventory, INVENTORY_REORDER_CONTRACT, DEFAULT_INVENTORY_ITEMS } from '../engine/contracts/planners/inventoryReorder.ts';
import { calculateFreelancePricing, FREELANCE_PRICING_CONTRACT } from '../engine/contracts/planners/freelancePricing.ts';
import { calculateWorkforce, WORKFORCE_SHIFT_CONTRACT, DEFAULT_SHIFT_ASSIGNMENTS } from '../engine/contracts/planners/workforceShift.ts';
import { calculateProcurement, PROCUREMENT_PURCHASE_ORDER_CONTRACT, DEFAULT_PURCHASE_ORDERS } from '../engine/contracts/planners/procurementPurchaseOrder.ts';
import { calculateMaintenance, PREVENTIVE_MAINTENANCE_CONTRACT, DEFAULT_MAINTENANCE_ASSETS } from '../engine/contracts/planners/preventiveMaintenance.ts';
import { calculateContinuity, BUSINESS_CONTINUITY_CONTRACT, DEFAULT_CONTINUITY_PROCESSES } from '../engine/contracts/planners/businessContinuity.ts';

describe('PLANNER-IMPLEMENTATION-02 Batch 2: 12 P1 Planners', () => {
  it('1. Construction Cost & Schedule Planner calculates total budget, contingency, and variances', () => {
    const res = calculateConstruction({
      projectName: 'Test Plaza',
      contingencyPct: 10,
      tasks: DEFAULT_CONSTRUCTION_TASKS
    });
    expect(res.totalBudgetCost).toBe(45500);
    expect(res.contingencyAmount).toBe(4550);
    expect(res.totalEstimatedProjectCost).toBe(50050);
    expect(res.totalActualCost).toBe(21300);
    expect(res.completedTasksCount).toBe(1);

    const exec = CalculationExecutor.executeContract(CONSTRUCTION_COST_SCHEDULE_CONTRACT, {
      projectName: 'Test Plaza',
      contingencyPct: 10,
      tasks: DEFAULT_CONSTRUCTION_TASKS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEstimatedProjectCost).toBe(50050);
  });

  it('2. Electrical Installation Project Planner calculates total load watts', () => {
    const res = calculateElectrical({
      projectName: 'Test Wiring',
      circuits: DEFAULT_ELECTRICAL_CIRCUITS
    });
    expect(res.totalCircuitsCount).toBe(3);
    expect(res.totalEstimatedWatts).toBe(22900);
    expect(res.inspectedCount).toBe(1);

    const exec = CalculationExecutor.executeContract(ELECTRICAL_INSTALL_CONTRACT, {
      projectName: 'Test Wiring',
      circuits: DEFAULT_ELECTRICAL_CIRCUITS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEstimatedWatts).toBe(22900);
  });

  it('3. Solar PV Installation Project Planner calculates system capacity & yield', () => {
    const res = calculateSolar({
      projectName: 'Solar Roof',
      sunPeakHoursDaily: 5,
      efficiencyRatio: 80,
      panels: DEFAULT_SOLAR_PANELS
    });
    expect(res.totalPanelsCount).toBe(24);
    expect(res.totalSystemCapacityKw).toBe(10.32);
    expect(res.estimatedDailyKwh).toBe(41.3);

    const exec = CalculationExecutor.executeContract(SOLAR_INSTALL_CONTRACT, {
      projectName: 'Solar Roof',
      sunPeakHoursDaily: 5,
      efficiencyRatio: 80,
      panels: DEFAULT_SOLAR_PANELS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalSystemCapacityKw).toBe(10.32);
  });

  it('4. Manufacturing Production & Capacity Planner computes hours required & utilization', () => {
    const res = calculateManufacturing({
      facilityName: 'Plant A',
      availableDailyHours: 40,
      orders: DEFAULT_PRODUCTION_ORDERS
    });
    expect(res.totalTargetUnits).toBe(1900);
    expect(res.totalCompletedUnits).toBe(520);
    expect(res.totalEstimatedHoursRequired).toBe(308.3);

    const exec = CalculationExecutor.executeContract(MANUFACTURING_PRODUCTION_CONTRACT, {
      facilityName: 'Plant A',
      availableDailyHours: 40,
      orders: DEFAULT_PRODUCTION_ORDERS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalTargetUnits).toBe(1900);
  });

  it('5. Small Business Marketing Budget Planner computes actual spent & CPL', () => {
    const res = calculateMarketing({
      planName: 'Q4 Plan',
      totalPoolBudget: 10000,
      campaigns: DEFAULT_MARKETING_CAMPAIGNS
    });
    expect(res.totalAllocatedBudget).toBe(7500);
    expect(res.totalActualSpent).toBe(7550);
    expect(res.totalEstimatedLeads).toBe(300);
    expect(res.averageCostPerLead).toBe(25.17);

    const exec = CalculationExecutor.executeContract(MARKETING_BUDGET_CONTRACT, {
      planName: 'Q4 Plan',
      totalPoolBudget: 10000,
      campaigns: DEFAULT_MARKETING_CAMPAIGNS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEstimatedLeads).toBe(300);
  });

  it('6. Employee Headcount & Payroll Budget Planner computes total employer cost', () => {
    const res = calculatePayroll({
      organizationName: 'Acme',
      employerTaxRatePct: 10,
      employees: DEFAULT_EMPLOYEES
    });
    expect(res.totalHeadcount).toBe(3);
    expect(res.totalBasePayrollAnnual).toBe(345000);
    expect(res.estimatedEmployerTaxesAnnual).toBe(34500);
    expect(res.totalEmployerPayrollCostAnnual).toBe(410000);

    const exec = CalculationExecutor.executeContract(EMPLOYEE_PAYROLL_CONTRACT, {
      organizationName: 'Acme',
      employerTaxRatePct: 10,
      employees: DEFAULT_EMPLOYEES
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEmployerPayrollCostAnnual).toBe(410000);
  });

  it('7. Inventory Reorder Point & Stock Planner calculates reorder points & valuations', () => {
    const res = calculateInventory({
      inventoryName: 'Warehouse',
      items: DEFAULT_INVENTORY_ITEMS
    });
    expect(res.totalSkusCount).toBe(3);
    expect(res.lowStockSkusCount).toBe(1); // SKU-VALVE-02: stock 25 <= reorder point (8*7 + 20 = 76)
    expect(res.totalInventoryValuation).toBe(2075);

    const exec = CalculationExecutor.executeContract(INVENTORY_REORDER_CONTRACT, {
      inventoryName: 'Warehouse',
      items: DEFAULT_INVENTORY_ITEMS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.lowStockSkusCount).toBe(1);
  });

  it('8. Freelance Project Pricing & Hourly Rate Planner calculates project fees', () => {
    const res = calculateFreelancePricing({
      projectName: 'Web Redesign',
      estimatedHours: 100,
      desiredHourlyRate: 90,
      projectExpenses: 500,
      taxReservePct: 20
    });
    expect(res.laborSubtotal).toBe(9000);
    expect(res.taxReserveAmount).toBe(1900);
    expect(res.suggestedTotalProjectFee).toBe(11400);
    expect(res.effectiveHourlyRate).toBe(114);

    const exec = CalculationExecutor.executeContract(FREELANCE_PRICING_CONTRACT, {
      projectName: 'Web Redesign',
      estimatedHours: 100,
      desiredHourlyRate: 90,
      projectExpenses: 500,
      taxReservePct: 20
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.suggestedTotalProjectFee).toBe(11400);
  });

  it('9. Employee Workforce & Shift Scheduling Planner computes scheduled hours & payroll', () => {
    const res = calculateWorkforce({
      scheduleTitle: 'Roster',
      targetWeeklyHoursPerEmployee: 40,
      shifts: DEFAULT_SHIFT_ASSIGNMENTS
    });
    expect(res.totalShiftsCount).toBe(3);
    expect(res.totalScheduledHours).toBe(115);
    expect(res.totalEstimatedPayroll).toBe(3625);

    const exec = CalculationExecutor.executeContract(WORKFORCE_SHIFT_CONTRACT, {
      scheduleTitle: 'Roster',
      targetWeeklyHoursPerEmployee: 40,
      shifts: DEFAULT_SHIFT_ASSIGNMENTS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalScheduledHours).toBe(115);
  });

  it('10. Procurement & Purchase Order Planning Tool calculates total order value', () => {
    const res = calculateProcurement({
      procurementPlanName: 'Supply Plan',
      orders: DEFAULT_PURCHASE_ORDERS
    });
    expect(res.totalOrdersCount).toBe(3);
    expect(res.totalOrderValue).toBe(15525);
    expect(res.receivedOrdersCount).toBe(1);
    expect(res.pendingOrdersCount).toBe(2);

    const exec = CalculationExecutor.executeContract(PROCUREMENT_PURCHASE_ORDER_CONTRACT, {
      procurementPlanName: 'Supply Plan',
      orders: DEFAULT_PURCHASE_ORDERS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalOrderValue).toBe(15525);
  });

  it('11. Preventive Maintenance Schedule Planner calculates service budgets & asset statuses', () => {
    const res = calculateMaintenance({
      programTitle: 'Maintenance 2025',
      assets: DEFAULT_MAINTENANCE_ASSETS
    });
    expect(res.totalAssetsCount).toBe(3);
    expect(res.overdueAssetsCount).toBe(1);
    expect(res.completedAssetsCount).toBe(1);
    expect(res.totalEstimatedServiceBudget).toBe(2750);

    const exec = CalculationExecutor.executeContract(PREVENTIVE_MAINTENANCE_CONTRACT, {
      programTitle: 'Maintenance 2025',
      assets: DEFAULT_MAINTENANCE_ASSETS
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.totalEstimatedServiceBudget).toBe(2750);
  });

  it('12. Business Continuity & Disaster Recovery Planner computes average RTO', () => {
    const res = calculateContinuity({
      planTitle: 'BCP Plan',
      processes: DEFAULT_CONTINUITY_PROCESSES
    });
    expect(res.totalProcessesCount).toBe(3);
    expect(res.testedCount).toBe(1);
    expect(res.averageRtoHours).toBe(11.3);

    const exec = CalculationExecutor.executeContract(BUSINESS_CONTINUITY_CONTRACT, {
      planTitle: 'BCP Plan',
      processes: DEFAULT_CONTINUITY_PROCESSES
    });
    expect(exec.success).toBe(true);
    expect(exec.data?.averageRtoHours).toBe(11.3);
  });
});
