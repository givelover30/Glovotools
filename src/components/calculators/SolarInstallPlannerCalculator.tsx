import { useState, useId } from 'react';
import { Sun, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  SolarPanelGroup,
  DEFAULT_SOLAR_PANELS,
  calculateSolar
} from '../../engine/contracts/planners/solarInstall.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_solar_install_planner_v1';

export default function SolarInstallPlannerCalculator() {
  const [savedStatus, setSavedStatus] = useState(false);
  const saveState = () => {
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const { language } = useTranslation();
  const isEs = language === 'es';

  const [projectName, setProjectName] = useState('Commercial Roof Solar PV');
  const [sunPeakHoursDaily, setSunPeakHoursDaily] = useState(4.8);
  const [efficiencyRatio, setEfficiencyRatio] = useState(82);
  const {
    state: panels,
    setState: setPanels,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<SolarPanelGroup[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_SOLAR_PANELS
  });

  const [newModel, setNewModel] = useState('Monocrystalline 450W');
  const [newWattage, setNewWattage] = useState(450);
  const [newQty, setNewQty] = useState(30);
  const [formError, setFormError] = useState('');

  const result = calculateSolar({ projectName, sunPeakHoursDaily, efficiencyRatio, panels });

  const addPanelGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newModel.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el modelo del panel.' : 'Please enter panel model.');
      return;
    }
    setFormError('');
    setPanels([
      ...panels,
      {
        id: Date.now().toString(),
        panelModel: trimmed,
        wattagePerPanel: Number(newWattage) || 450,
        quantity: Number(newQty) || 30,
        tiltAngleDegrees: 20
      }
    ]);
    setNewModel('');
  };

  const removePanelGroup = (id: string) => {
    setPanels(panels.filter((p: SolarPanelGroup) => p.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ projectName, sunPeakHoursDaily, efficiencyRatio, panels, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Panel Model', 'Wattage (W)', 'Quantity', 'Tilt Angle', 'Total kW'];
    const rows = panels.map((p: SolarPanelGroup) => [p.id, p.panelModel, p.wattagePerPanel, p.quantity, p.tiltAngleDegrees, (p.wattagePerPanel * p.quantity) / 1000]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Instalación Solar PV' : 'Solar PV Installation Project Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Calcula capacidad de sistema y estimaciones de energía solar' : 'Calculate system capacity & estimated solar energy yield'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setPanels(DEFAULT_SOLAR_PANELS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Capacidad del Sistema' : 'System Capacity'}
          value={`${result.totalSystemCapacityKw.toFixed(2)} kW`}
          hint={`${result.totalPanelsCount} ${isEs ? 'paneles solares' : 'solar panels'}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Producción Diaria Estimada' : 'Estimated Daily Yield'}
          value={`${result.estimatedDailyKwh.toLocaleString()} kWh`}
          hint={isEs ? 'Promedio diario' : 'Daily average'}
        />
        <ToolMetricTile
          label={isEs ? 'Producción Anual Estimada' : 'Estimated Annual Yield'}
          value={`${result.estimatedAnnualKwh.toLocaleString()} kWh`}
          hint={isEs ? 'Rendimiento anual' : 'Annual generation'}
        />
        <ToolMetricTile
          label={isEs ? 'Horas Sol Pico' : 'Sun Peak Hours'}
          value={`${sunPeakHoursDaily} h/day`}
          hint={isEs ? 'Promedio del sitio' : 'Site insolation'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Parámetros del Sitio Solar' : 'Solar Site Parameters'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Proyecto' : 'Project Name'}>
            <UiInput type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Horas Sol Pico Diarias' : 'Daily Sun Peak Hours'}>
            <UiInput
              type="number"
              step={0.1}
              min={1}
              max={12}
              value={sunPeakHoursDaily}
              onChange={(e) => setSunPeakHoursDaily(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Eficiencia del Sistema (%)' : 'System Efficiency (%)'}>
            <UiInput
              type="number"
              min={50}
              max={99}
              value={efficiencyRatio}
              onChange={(e) => setEfficiencyRatio(Math.max(50, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Panels */}
      <form onSubmit={addPanelGroup} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Módulos Solares' : 'Add Solar Panel Array'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ToolFieldGroup label={isEs ? 'Modelo del Panel' : 'Panel Model'}>
            <UiInput
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Bifacial 500W"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Potencia (Watts)' : 'Wattage (Watts)'}>
            <UiInput
              type="number"
              value={newWattage}
              onChange={(e) => setNewWattage(Math.max(100, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Cantidad de Paneles' : 'Quantity'}>
            <UiInput
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(Math.max(1, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Arreglo' : 'Add Array'}</span>
          </UiButton>
        </div>
      </form>

      {/* Panel List Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Inventario de Arreglos Solares' : 'Solar Array Inventory'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Modelo' : 'Panel Model'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Potencia (W)' : 'Wattage (W)'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Cantidad' : 'Quantity'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Capacidad (kW)' : 'Capacity (kW)'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {panels.map((p: SolarPanelGroup) => (
              <tr key={p.id} className="hover:bg-bg-subtle transition-colors">
                <td className="py-3 px-3 font-sans font-medium text-text-primary">{p.panelModel}</td>
                <td className="py-3 px-3 text-right">{p.wattagePerPanel} W</td>
                <td className="py-3 px-3 text-right">{p.quantity}</td>
                <td className="py-3 px-3 text-right font-bold text-accent">{((p.wattagePerPanel * p.quantity) / 1000).toFixed(2)} kW</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => removePanelGroup(p.id)}
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
