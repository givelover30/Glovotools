import { useState, useId } from 'react';
import { ShieldCheck, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  ContinuityProcessItem,
  DEFAULT_CONTINUITY_PROCESSES,
  calculateContinuity
} from '../../engine/contracts/planners/businessContinuity.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_business_continuity_disaster_recovery_planner_v1';

export default function BusinessContinuityDisasterRecoveryPlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const isEs = language === 'es';

  const [planTitle, setPlanTitle] = useState('Enterprise Disaster Recovery & BCP 2025');
  const {
    state: processes,
    setState: setProcesses,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<ContinuityProcessItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_CONTINUITY_PROCESSES
  });

  const [newProcessName, setNewProcessName] = useState('');
  const [newDepartment, setNewDepartment] = useState('IT Infrastructure');
  const [newRto, setNewRto] = useState(4);
  const [newRpo, setNewRpo] = useState(2);
  const [newCriticality, setNewCriticality] = useState<ContinuityProcessItem['criticalityLevel']>('High');
  const [formError, setFormError] = useState('');

  const result = calculateContinuity({ planTitle, processes });

  const addProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProcessName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del proceso.' : 'Please enter process name.');
      return;
    }
    setFormError('');
    setProcesses([
      ...processes,
      {
        id: Date.now().toString(),
        processName: trimmed,
        department: newDepartment,
        recoveryTimeObjectiveHours: Number(newRto) || 4,
        recoveryPointObjectiveHours: Number(newRpo) || 2,
        criticalityLevel: newCriticality,
        status: 'Assessed'
      }
    ]);
    setNewProcessName('');
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ planTitle, processes, result }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `continuity-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Process Name', 'Department', 'RTO (hrs)', 'RPO (hrs)', 'Criticality', 'Status'];
    const rows = processes.map((p) => [p.id, p.processName, p.department, p.recoveryTimeObjectiveHours, p.recoveryPointObjectiveHours, p.criticalityLevel, p.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `continuity-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Continuidad de Negocio y Recuperación' : 'Business Continuity & Disaster Recovery Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Evalúa objetivos de tiempo y punto de recuperación (RTO / RPO)' : 'Assess RTO and RPO recovery objectives for critical processes'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setProcesses(DEFAULT_CONTINUITY_PROCESSES)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'RTO Promedio' : 'Average RTO'}
          value={`${result.averageRtoHours} hrs`}
          hint={isEs ? 'Tiempo objetivo de recuperación' : 'Recovery Time Objective'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Procesos Probados' : 'Tested Processes'}
          value={result.testedCount.toString()}
          hint={isEs ? 'Simulacros validados' : 'Validated drills'}
        />
        <ToolMetricTile
          label={isEs ? 'Planes Documentados' : 'Documented Plans'}
          value={result.documentedCount.toString()}
          hint={isEs ? 'Procedimientos listos' : 'Procedures ready'}
        />
        <ToolMetricTile
          label={isEs ? 'Procesos Críticos Totales' : 'Total Critical Processes'}
          value={result.totalProcessesCount.toString()}
          hint={isEs ? 'Registrados' : 'Tracked'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Plan BCP' : 'BCP Plan Settings'}
        </h3>
        <ToolFieldGroup label={isEs ? 'Título del Plan de Continuidad' : 'Continuity Plan Title'}>
          <UiInput type="text" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} />
        </ToolFieldGroup>
      </div>

      {/* Add Process Form */}
      <form onSubmit={addProcess} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Proceso Crítico o Sistema' : 'Add Critical Process / System'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Proceso' : 'Process Name'}>
            <UiInput type="text" value={newProcessName} onChange={(e) => setNewProcessName(e.target.value)} placeholder="Billing API" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Departamento' : 'Department'}>
            <UiInput type="text" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} placeholder="Fintech" />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'RTO (Horas)' : 'RTO (Hours)'}>
            <UiInput
              type="number"
              min={0}
              value={newRto}
              onChange={(e) => setNewRto(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'RPO (Horas)' : 'RPO (Hours)'}>
            <UiInput
              type="number"
              min={0}
              value={newRpo}
              onChange={(e) => setNewRpo(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Criticidad' : 'Criticality'}>
            <select
              value={newCriticality}
              onChange={(e) => setNewCriticality(e.target.value as any)}
              className="ui-select w-full"
            >
              <option value="Mission Critical">Mission Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Proceso' : 'Add Process'}</span>
          </UiButton>
        </div>
      </form>

      {/* Processes Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Análisis de Impacto y Objetivos de Recuperación' : 'Business Impact Analysis & Recovery Objectives'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Proceso' : 'Process Name'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Departamento' : 'Department'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">RTO (hrs)</th>
              <th className="py-2.5 px-3 font-semibold text-right">RPO (hrs)</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Criticidad' : 'Criticality'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {processes.map((p) => (
              <tr key={p.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{p.processName}</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{p.department}</td>
                <td className="py-3 px-3 text-right font-bold text-accent">{p.recoveryTimeObjectiveHours} hrs</td>
                <td className="py-3 px-3 text-right">{p.recoveryPointObjectiveHours} hrs</td>
                <td className="py-3 px-3 font-sans">
                  <span className="font-semibold text-text-primary">{p.criticalityLevel}</span>
                </td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Tested'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : p.status === 'Plan Documented'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeProcess(p.id)}
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
