import { useState, useId } from 'react';
import { Home, Plus, Trash2, Download, Save, RefreshCw, Eraser, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiSelect, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  ConstructionTaskItem,
  DEFAULT_CONSTRUCTION_TASKS,
  calculateConstruction
} from '../../engine/contracts/planners/constructionCostSchedule.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_construction_cost_schedule_planner_v1';

export default function ConstructionCostSchedulePlannerCalculator() {
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
  const baseId = useId();

  const [projectName, setProjectName] = useState('Commercial Plaza Buildout');
  const [contingencyPct, setContingencyPct] = useState(10);
  const {
    state: tasks,
    setState: setTasks,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<ConstructionTaskItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_CONSTRUCTION_TASKS
  });

  const [newPhase, setNewPhase] = useState('Foundation');
  const [newTaskName, setNewTaskName] = useState('');
  const [newBudgetCost, setNewBudgetCost] = useState(5000);
  const [newActualCost, setNewActualCost] = useState(0);
  const [formError, setFormError] = useState('');

  const result = calculateConstruction({ projectName, contingencyPct, tasks });

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la tarea.' : 'Please enter a task name.');
      return;
    }
    setFormError('');
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        phase: newPhase,
        task: trimmed,
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        budgetCost: Number(newBudgetCost) || 0,
        actualCost: Number(newActualCost) || 0,
        status: 'Not Started'
      }
    ]);
    setNewTaskName('');
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ projectName, contingencyPct, tasks, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Phase', 'Task', 'Start Date', 'End Date', 'Budget Cost', 'Actual Cost', 'Status'];
    const rows = tasks.map((t) => [t.id, t.phase, t.task, t.startDate, t.endDate, t.budgetCost, t.actualCost, t.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Costos y Cronograma de Construcción' : 'Construction Cost & Schedule Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Gestiona fases, tareas, presupuestos y gastos reales' : 'Manage project phases, tasks, budget & actuals'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setTasks(DEFAULT_CONSTRUCTION_TASKS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Costo Estimado Total' : 'Total Estimated Cost'}
          value={fmtMoney(result.totalEstimatedProjectCost)}
          hint={isEs ? `Incluye ${contingencyPct}% contingencia` : `Includes ${contingencyPct}% contingency`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Costo Real Actual' : 'Total Actual Spent'}
          value={fmtMoney(result.totalActualCost)}
          hint={isEs ? 'Gastos registrados' : 'Recorded expenditures'}
        />
        <ToolMetricTile
          label={isEs ? 'Variación de Presupuesto' : 'Budget Variance'}
          value={fmtMoney(result.costVariance)}
          hint={isEs ? 'Actual vs Presupuesto' : 'Actual vs Budget'}
        />
        <ToolMetricTile
          label={isEs ? 'Tareas Completadas' : 'Completed Tasks'}
          value={`${result.completedTasksCount} / ${result.totalTasksCount}`}
          hint={isEs ? 'Hitos finalizados' : 'Milestones finished'}
        />
      </div>

      {/* Settings Panel */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Proyecto' : 'Project Settings'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Proyecto' : 'Project Name'}>
            <UiInput type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Margen de Contingencia (%)' : 'Contingency Allowance (%)'}>
            <UiInput
              type="number"
              min={0}
              max={50}
              value={contingencyPct}
              onChange={(e) => setContingencyPct(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Tarea o Hito de Construcción' : 'Add Construction Task / Milestone'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <ToolFieldGroup label={isEs ? 'Fase' : 'Phase'}>
            <UiInput type="text" value={newPhase} onChange={(e) => setNewPhase(e.target.value)} placeholder="Foundation" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Nombre de Tarea' : 'Task Name'}>
            <UiInput
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Concrete Pouring"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Costo Presupuestado' : 'Budget Cost'}>
            <UiInput
              type="number"
              min={0}
              value={newBudgetCost}
              onChange={(e) => setNewBudgetCost(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Costo Real' : 'Actual Cost'}>
            <UiInput
              type="number"
              min={0}
              value={newActualCost}
              onChange={(e) => setNewActualCost(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Tarea' : 'Add Task'}</span>
          </UiButton>
        </div>
      </form>

      {/* Task List Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Cronograma y Presupuesto de Tareas' : 'Task Schedule & Cost Tracking'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Fase' : 'Phase'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Tarea' : 'Task'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Presupuesto' : 'Budget'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Real' : 'Actual'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{t.phase}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{t.task}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(t.budgetCost)}</td>
                <td className="py-3 px-3 text-right">{fmtMoney(t.actualCost)}</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : t.status === 'In Progress'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeTask(t.id)}
                    className="text-text-secondary hover:text-rose-500 transition-colors p-1"
                    title={isEs ? 'Eliminar tarea' : 'Delete task'}
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
