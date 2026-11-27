import { useState, useId } from 'react';
import { Users, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  EmployeePayrollItem,
  DEFAULT_EMPLOYEES,
  calculatePayroll
} from '../../engine/contracts/planners/employeePayroll.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_employee_payroll_planner_v1';

export default function EmployeePayrollPlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const { formatCurrency } = useCurrency();
  const fmtMoney = (val: number) =>
    formatCurrency(val, Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined);
  const isEs = language === 'es';

  const [organizationName, setOrganizationName] = useState('Acme Enterprise Corp');
  const [employerTaxRatePct, setEmployerTaxRatePct] = useState(8.5);
  const {
    state: employees,
    setState: setEmployees,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<EmployeePayrollItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_EMPLOYEES
  });

  const [newDept, setNewDept] = useState('Engineering');
  const [newEmpName, setNewEmpName] = useState('');
  const [newTitle, setNewTitle] = useState('Software Engineer');
  const [newSalary, setNewSalary] = useState(110000);
  const [newBenefits, setNewBenefits] = useState(10000);
  const [formError, setFormError] = useState('');

  const result = calculatePayroll({ organizationName, employerTaxRatePct, employees });

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmpName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del empleado.' : 'Please enter employee name.');
      return;
    }
    setFormError('');
    setEmployees([
      ...employees,
      {
        id: Date.now().toString(),
        department: newDept,
        employeeName: trimmed,
        jobTitle: newTitle,
        baseSalaryAnnual: Number(newSalary) || 100000,
        benefitsAllowanceAnnual: Number(newBenefits) || 10000
      }
    ]);
    setNewEmpName('');
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((emp: EmployeePayrollItem) => emp.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ organizationName, employerTaxRatePct, employees, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Department', 'Employee Name', 'Job Title', 'Base Salary', 'Benefits', 'Total Cost'];
    const rows = employees.map((emp: EmployeePayrollItem) => [
      emp.id,
      emp.department,
      emp.employeeName,
      emp.jobTitle,
      emp.baseSalaryAnnual,
      emp.benefitsAllowanceAnnual,
      emp.baseSalaryAnnual + emp.benefitsAllowanceAnnual
    ]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Nómina y Personal' : 'Employee Headcount & Payroll Budget Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Gestiona salarios, beneficios e impuestos patronales anuales' : 'Manage headcounts, annual salaries, benefits & employer taxes'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedStatus && (
            <UiStatusLabel tone="success">{isEs ? 'Guardado localmente' : 'Saved locally'}</UiStatusLabel>
          )}
          <UiButton variant="primary" size="sm" onClick={saveState}>
            <Save className="w-3.5 h-3.5" />
            <span>{isEs ? 'Guardar' : 'Save'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownloadJson}>
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={handleDownloadCsv}>
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </UiButton>
          <PrintResultButton size="sm" />
          <UiButton variant="ghost" size="sm" onClick={() => setEmployees(DEFAULT_EMPLOYEES)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Costo Total de Nómina' : 'Total Employer Payroll Cost'}
          value={fmtMoney(result.totalEmployerPayrollCostAnnual)}
          hint={isEs ? `Incluye ${employerTaxRatePct}% impuestos` : `Includes ${employerTaxRatePct}% employer taxes`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Plantilla Total' : 'Total Headcount'}
          value={result.totalHeadcount.toString()}
          hint={isEs ? 'Empleados activos' : 'Active personnel'}
        />
        <ToolMetricTile
          label={isEs ? 'Costo Promedio por Empleado' : 'Avg Cost Per Employee'}
          value={fmtMoney(result.averageEmployeeTotalCost)}
          hint={isEs ? 'Compensación completa' : 'Total compensation'}
        />
        <ToolMetricTile
          label={isEs ? 'Impuestos Patronales Est.' : 'Est. Employer Taxes'}
          value={fmtMoney(result.estimatedEmployerTaxesAnnual)}
          hint={isEs ? `Tasa: ${employerTaxRatePct}%` : `Rate: ${employerTaxRatePct}%`}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración Fiscal y de Organización' : 'Organization & Tax Configuration'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre de la Organización' : 'Organization Name'}>
            <UiInput type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Tasa de Impuestos Patronales (%)' : 'Employer Tax Rate (%)'}>
            <UiInput
              type="number"
              step={0.1}
              min={0}
              max={50}
              value={employerTaxRatePct}
              onChange={(e) => setEmployerTaxRatePct(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Employee Form */}
      <form onSubmit={addEmployee} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Empleado o Puesto' : 'Add Employee / Position'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Departamento' : 'Department'}>
            <UiInput
              type="text"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Engineering"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Nombre del Empleado' : 'Employee Name'}>
            <UiInput
              type="text"
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              placeholder="Jane Doe"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Puesto' : 'Job Title'}>
            <UiInput
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Senior Engineer"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Salario Base Anual' : 'Base Salary'}>
            <UiInput
              type="number"
              min={0}
              value={newSalary}
              onChange={(e) => setNewSalary(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Beneficios Anuales' : 'Benefits'}>
            <UiInput
              type="number"
              min={0}
              value={newBenefits}
              onChange={(e) => setNewBenefits(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Empleado' : 'Add Employee'}</span>
          </UiButton>
        </div>
      </form>

      {/* Employees Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Roster de Personal y Compensación' : 'Personnel Roster & Compensation'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Empleado' : 'Employee Name'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Departamento' : 'Department'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Puesto' : 'Job Title'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Salario Base' : 'Base Salary'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Beneficios' : 'Benefits'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {employees.map((emp: EmployeePayrollItem) => (
              <tr key={emp.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{emp.employeeName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{emp.department}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{emp.jobTitle}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(emp.baseSalaryAnnual)}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(emp.benefitsAllowanceAnnual)}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeEmployee(emp.id)}
                    className="text-text-secondary hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
