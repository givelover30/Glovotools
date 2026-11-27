import { useState, useId } from 'react';
import { Zap, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  ElectricalCircuitItem,
  DEFAULT_ELECTRICAL_CIRCUITS,
  calculateElectrical
} from '../../engine/contracts/planners/electricalInstall.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_electrical_install_planner_v1';

export default function ElectricalInstallPlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const isEs = language === 'es';

  const [projectName, setProjectName] = useState('Commercial Wiring Upgrade');
  const {
    state: circuits,
    setState: setCircuits,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<ElectricalCircuitItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_ELECTRICAL_CIRCUITS
  });

  const [newCircuitName, setNewCircuitName] = useState('');
  const [newVoltage, setNewVoltage] = useState(120);
  const [newAmperage, setNewAmperage] = useState(20);
  const [newWatts, setNewWatts] = useState(1800);
  const [formError, setFormError] = useState('');

  const result = calculateElectrical({ projectName, circuits });

  const addCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCircuitName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre del circuito.' : 'Please enter circuit name.');
      return;
    }
    setFormError('');
    setCircuits([
      ...circuits,
      {
        id: Date.now().toString(),
        circuitName: trimmed,
        voltage: Number(newVoltage) || 120,
        amperage: Number(newAmperage) || 20,
        estimatedLoadWatts: Number(newWatts) || 1800,
        cableType: '12/2 Romex',
        status: 'Planned'
      }
    ]);
    setNewCircuitName('');
  };

  const removeCircuit = (id: string) => {
    setCircuits(circuits.filter((c) => c.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ projectName, circuits, result }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Circuit Name', 'Voltage (V)', 'Amperage (A)', 'Load (W)', 'Cable Type', 'Status'];
    const rows = circuits.map((c) => [c.id, c.circuitName, c.voltage, c.amperage, c.estimatedLoadWatts, c.cableType, c.status]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Instalación Eléctrica' : 'Electrical Installation Project Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Calcula cargas de circuitos y verifica estado de instalación' : 'Calculate circuit loads and track installation status'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setCircuits(DEFAULT_ELECTRICAL_CIRCUITS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Carga Total Estimada' : 'Total Estimated Load'}
          value={`${result.totalEstimatedWatts.toLocaleString()} W`}
          hint={isEs ? 'Potencia combinada' : 'Combined power draw'}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Circuitos Totales' : 'Total Circuits'}
          value={result.totalCircuitsCount.toString()}
          hint={isEs ? 'Rutas configuradas' : 'Configured runs'}
        />
        <ToolMetricTile
          label={isEs ? 'Inspeccionados' : 'Inspected'}
          value={result.inspectedCount.toString()}
          hint={isEs ? 'Aprobados por perito' : 'Approved by inspector'}
        />
        <ToolMetricTile
          label={isEs ? 'Instalados' : 'Installed'}
          value={result.installedCount.toString()}
          hint={isEs ? 'Cableado tendido' : 'Wiring pulled'}
        />
      </div>

      {/* Add Circuit Form */}
      <form onSubmit={addCircuit} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Circuito o Zona' : 'Add Electrical Circuit / Zone'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <ToolFieldGroup label={isEs ? 'Nombre de Circuito' : 'Circuit Name'}>
            <UiInput
              type="text"
              value={newCircuitName}
              onChange={(e) => setNewCircuitName(e.target.value)}
              placeholder="Kitchen Receptacles"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Voltaje (V)' : 'Voltage (V)'}>
            <UiInput
              type="number"
              value={newVoltage}
              onChange={(e) => setNewVoltage(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Amperaje (A)' : 'Amperage (A)'}>
            <UiInput
              type="number"
              value={newAmperage}
              onChange={(e) => setNewAmperage(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Carga (Watts)' : 'Load (Watts)'}>
            <UiInput
              type="number"
              value={newWatts}
              onChange={(e) => setNewWatts(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Circuito' : 'Add Circuit'}</span>
          </UiButton>
        </div>
      </form>

      {/* Circuit Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Inventario de Circuitos Eléctricos' : 'Electrical Circuit Inventory'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Circuito' : 'Circuit'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Voltaje' : 'Voltage'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Amperaje' : 'Amperage'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Carga (W)' : 'Load (W)'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Cable' : 'Cable Type'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Estado' : 'Status'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {circuits.map((c) => (
              <tr key={c.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{c.circuitName}</td>
                <td className="py-3 px-3 text-right">{c.voltage} V</td>
                <td className="py-3 px-3 text-right">{c.amperage} A</td>
                <td className="py-3 px-3 text-right">{c.estimatedLoadWatts.toLocaleString()} W</td>
                <td className="py-3 px-3 font-sans text-text-secondary">{c.cableType}</td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Inspected'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : c.status === 'Installed'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removeCircuit(c.id)}
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
