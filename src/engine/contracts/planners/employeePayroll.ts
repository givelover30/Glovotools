import { CalculationContract, CalculationError } from '../../types.ts';

export interface EmployeePayrollItem {
  id: string;
  department: string;
  employeeName: string;
  jobTitle: string;
  baseSalaryAnnual: number;
  benefitsAllowanceAnnual: number;
}

export interface EmployeePayrollInput {
  organizationName: string;
  employerTaxRatePct: number;
  employees: EmployeePayrollItem[];
}

export interface EmployeePayrollResult {
  organizationName: string;
  totalHeadcount: number;
  totalBasePayrollAnnual: number;
  totalBenefitsAnnual: number;
  estimatedEmployerTaxesAnnual: number;
  totalEmployerPayrollCostAnnual: number;
  averageEmployeeTotalCost: number;
}

export const DEFAULT_EMPLOYEES: EmployeePayrollItem[] = [
  { id: '1', department: 'Engineering', employeeName: 'Alex Mercer', jobTitle: 'Senior Full Stack Lead', baseSalaryAnnual: 145000, benefitsAllowanceAnnual: 12000 },
  { id: '2', department: 'Product', employeeName: 'Sarah Jenkins', jobTitle: 'Product Manager', baseSalaryAnnual: 125000, benefitsAllowanceAnnual: 10500 },
  { id: '3', department: 'Operations', employeeName: 'David Ross', jobTitle: 'Operations Coordinator', baseSalaryAnnual: 75000, benefitsAllowanceAnnual: 8000 }
];

export function validatePayrollInput(input: EmployeePayrollInput): CalculationError[] {
  const errors: CalculationError[] = [];
  if (!input.organizationName || input.organizationName.trim() === '') {
    errors.push({ field: 'organizationName', code: 'REQUIRED_FIELD_MISSING', message: 'Organization name is required.' });
  }
  if (input.employerTaxRatePct < 0 || input.employerTaxRatePct > 50) {
    errors.push({ field: 'employerTaxRatePct', code: 'NON_NEGATIVE_REQUIRED', message: 'Employer tax rate must be between 0 and 50%.' });
  }
  return errors;
}

export function calculatePayroll(input: EmployeePayrollInput): EmployeePayrollResult {
  const employees = input.employees || DEFAULT_EMPLOYEES;
  let totalBasePayrollAnnual = 0;
  let totalBenefitsAnnual = 0;

  for (const emp of employees) {
    totalBasePayrollAnnual += Number(emp.baseSalaryAnnual) || 0;
    totalBenefitsAnnual += Number(emp.benefitsAllowanceAnnual) || 0;
  }

  const taxRate = (Number(input.employerTaxRatePct) || 8.5) / 100;
  const estimatedEmployerTaxesAnnual = totalBasePayrollAnnual * taxRate;
  const totalEmployerPayrollCostAnnual = totalBasePayrollAnnual + totalBenefitsAnnual + estimatedEmployerTaxesAnnual;
  const totalHeadcount = employees.length || 1;
  const averageEmployeeTotalCost = Math.round(totalEmployerPayrollCostAnnual / totalHeadcount);

  return {
    organizationName: input.organizationName || 'My Company',
    totalHeadcount,
    totalBasePayrollAnnual,
    totalBenefitsAnnual,
    estimatedEmployerTaxesAnnual: Math.round(estimatedEmployerTaxesAnnual),
    totalEmployerPayrollCostAnnual: Math.round(totalEmployerPayrollCostAnnual),
    averageEmployeeTotalCost
  };
}

export const EMPLOYEE_PAYROLL_CONTRACT: CalculationContract<any, any> = {
  id: 'employee-payroll-planner',
  name: 'Employee Headcount & Payroll Budget Planner',
  category: 'planners',
  validate: validatePayrollInput,
  calculate: calculatePayroll
} as CalculationContract<any, any>;
