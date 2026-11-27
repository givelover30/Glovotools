import { useState, useId } from 'react';
import { Calendar, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  ShiftAssignmentItem,
  DEFAULT_SHIFT_ASSIGNMENTS,
  calculateWorkforce
} from '../../engine/contracts/planners/workforceShift.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_workforce_shift_planner_v1';

export default function WorkforceShiftPlannerCalculator() {
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

  const [scheduleTitle, setScheduleTitle] = useState('December Operations Roster');
  const [targetWeeklyHoursPerEmployee, setTargetWeeklyHoursPerEmployee] = useState(40);
  const {
    state: shifts,
    setState: setShifts,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<ShiftAssignmentItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_SHIFT_ASSIGNMENTS
  });

  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Logistics');
  const [newShiftName, setNewShiftName] = useState<ShiftAssignmentItem['shiftName']>('Morning (07:00 - 15:30)');
  const [newHours, setNewHours] = useState(40);
  const [newRate, setNewRate] = useState(30);
  const [formError, setFormError] = useState('');

  const result = calculateWorkforce({ scheduleTitle, targetWeeklyHoursPerEmployee, shifts });

  const addShift = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmployeeName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del empleado.' : 'Please enter employee name.');
      return;
    }
    setFormError('');
    setShifts([
      ...shifts,
      {
        id: Date.now().toString(),
        employeeName: trimmed,
        department: newDepartment,
        shiftName: newShiftName,
        scheduledHours: Number(newHours) || 40,
        hourlyRate: Number(newRate) || 30
      }
    ]);
    setNewEmployeeName('');
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter((s: ShiftAssignmentItem) => s.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ scheduleTitle, targetWeeklyHoursPerEmployee, shifts, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Employee Name', 'Department', 'Shift Name', 'Scheduled Hours', 'Hourly Rate', 'Estimated Cost'];
    const rows = shifts.map((s: ShiftAssignmentItem) => [s.id, s.employeeName, s.department, s.shiftName, s.scheduledHours, s.hourlyRate, s.scheduledHours * s.hourlyRate]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Turnos y Fuerza Laboral' : 'Employee Workforce & Shift Scheduling Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Gestiona turnos de personal, horas programadas y costos de nómina' : 'Manage staff shifts, scheduled hours & labor payroll costs'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setShifts(DEFAULT_SHIFT_ASSIGNMENTS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Nómina Estimada de Turnos' : 'Estimated Shift Payroll'}
          value={fmtMoney(result.totalEstimatedPayroll)}
          hint={`${result.totalScheduledHours} ${isEs ? 'horas totales programadas' : 'total scheduled hours'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Horas Totales Programadas' : 'Total Scheduled Hours'}
          value={`${result.totalScheduledHours} hrs`}
          hint={isEs ? 'Carga semanal' : 'Weekly workload'}
        />
        <ToolMetricTile
          label={isEs ? 'Total de Turnos' : 'Total Shifts'}
          value={result.totalShiftsCount.toString()}
          hint={isEs ? 'Asignaciones' : 'Assignments'}
        />
        <ToolMetricTile
          label={isEs ? 'Promedio Horas por Turno' : 'Avg Hours Per Shift'}
          value={`${result.averageHoursPerShift} hrs`}
          hint={isEs ? 'Por empleado' : 'Per employee'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Cuadro de Turnos' : 'Schedule Settings'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolFieldGroup label={isEs ? 'Título del Cuadro' : 'Schedule Title'}>
            <UiInput type="text" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Horas Objetivo Semanales' : 'Target Weekly Hours'}>
            <UiInput
              type="number"
              min={1}
              value={targetWeeklyHoursPerEmployee}
              onChange={(e) => setTargetWeeklyHoursPerEmployee(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Shift Form */}
      <form onSubmit={addShift} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Asignar Turno a Empleado' : 'Assign Employee Shift'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Nombre del Empleado' : 'Employee Name'}>
            <UiInput
              type="text"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              placeholder="John Doe"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Departamento' : 'Department'}>
            <UiInput
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Logistics"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Turno' : 'Shift Name'}>
            <select
              value={newShiftName}
              onChange={(e) => setNewShiftName(e.target.value as any)}
              className="ui-select w-full"
            >
              <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
              <option value="Evening (15:00 - 23:30)">Evening (15:00 - 23:30)</option>
              <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
              <option value="Weekend Day">Weekend Day</option>
            </select>
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Horas Programadas' : 'Scheduled Hours'}>
            <UiInput
              type="number"
              min={1}
              value={newHours}
              onChange={(e) => setNewHours(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Tarifa por Hora ($)' : 'Hourly Rate ($)'}>
            <UiInput
              type="number"
              min={1}
              value={newRate}
              onChange={(e) => setNewRate(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Turno' : 'Add Shift'}</span>
          </UiButton>
        </div>
      </form>

      {/* Shifts Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Asignaciones de Turnos y Costos' : 'Shift Assignments & Payroll'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Empleado' : 'Employee Name'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Departamento' : 'Department'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Turno' : 'Shift'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Horas' : 'Hours'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Tarifa/hr' : 'Rate/hr'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Costo' : 'Estimated Cost'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {shifts.map((s: ShiftAssignmentItem) => (
              <tr key={s.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{s.employeeName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{s.department}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{s.shiftName}</td>
                <td className="py-3 px-3 text-right">{s.scheduledHours} hrs</td>
                <td className="py-3 px-3 text-right">{fmtMoney(s.hourlyRate)}</td>
                <td className="py-3 px-3 text-right font-bold text-accent">{fmtMoney(s.scheduledHours * s.hourlyRate)}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeShift(s.id)}
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
