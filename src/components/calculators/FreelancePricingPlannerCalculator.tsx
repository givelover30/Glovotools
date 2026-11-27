import { useState, useId } from 'react';
import { DollarSign, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  FreelancePricingInput,
  calculateFreelancePricing
} from '../../engine/contracts/planners/freelancePricing.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_freelance_pricing_planner_v1';

export default function FreelancePricingPlannerCalculator() {
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

  const {
    state: inputData,
    setState: setInputData,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<FreelancePricingInput>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: {
      projectName: 'Enterprise Web App Redesign',
      estimatedHours: 120,
      desiredHourlyRate: 95,
      projectExpenses: 750,
      taxReservePct: 25
    }
  });

  const result = calculateFreelancePricing(inputData);

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ inputData, result }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance-pricing-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['Project Name', 'Estimated Hours', 'Hourly Rate', 'Expenses', 'Tax Reserve %', 'Labor Subtotal', 'Total Fee', 'Effective Rate'];
    const rows = [[
      inputData.projectName,
      inputData.estimatedHours,
      inputData.desiredHourlyRate,
      inputData.projectExpenses,
      inputData.taxReservePct,
      result.laborSubtotal,
      result.suggestedTotalProjectFee,
      result.effectiveHourlyRate
    ]];
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance-pricing-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Planificador de Precios y Tarifas Freelance' : 'Freelance Project Pricing & Hourly Rate Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Calcula tarifas por hora, costos de proyectos y reservas de impuestos' : 'Calculate project fees, hourly rates & tax reserves'}
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
          <UiButton
            variant="ghost"
            size="sm"
            onClick={() =>
              setInputData({
                projectName: 'Enterprise Web App Redesign',
                estimatedHours: 120,
                desiredHourlyRate: 95,
                projectExpenses: 750,
                taxReservePct: 25
              })
            }
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Tarifa Total Sugerida' : 'Suggested Total Project Fee'}
          value={fmtMoney(result.suggestedTotalProjectFee)}
          hint={isEs ? `Tarifa efectiva: ${fmtMoney(result.effectiveHourlyRate)}/hr` : `Effective rate: ${fmtMoney(result.effectiveHourlyRate)}/hr`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Subtotal de Mano de Obra' : 'Labor Subtotal'}
          value={fmtMoney(result.laborSubtotal)}
          hint={`${inputData.estimatedHours} ${isEs ? 'horas estimadas' : 'estimated hours'}`}
        />
        <ToolMetricTile
          label={isEs ? 'Reserva de Impuestos' : 'Tax Reserve'}
          value={fmtMoney(result.taxReserveAmount)}
          hint={`${inputData.taxReservePct}% ${isEs ? 'reserva' : 'reserve'}`}
        />
        <ToolMetricTile
          label={isEs ? 'Gastos del Proyecto' : 'Project Expenses'}
          value={fmtMoney(result.projectExpenses)}
          hint={isEs ? 'Directos' : 'Direct costs'}
        />
      </div>

      {/* Input Parameters */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Parámetros del Proyecto y Tarifas' : 'Project & Rate Parameters'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Proyecto' : 'Project Name'}>
            <UiInput
              type="text"
              value={inputData.projectName}
              onChange={(e) => setInputData({ ...inputData, projectName: e.target.value })}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Horas Estimadas' : 'Estimated Hours'}>
            <UiInput
              type="number"
              min={1}
              value={inputData.estimatedHours}
              onChange={(e) => setInputData({ ...inputData, estimatedHours: Math.max(1, Number(e.target.value)) })}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Tarifa por Hora Deseada' : 'Desired Hourly Rate'}>
            <UiInput
              type="number"
              min={1}
              value={inputData.desiredHourlyRate}
              onChange={(e) => setInputData({ ...inputData, desiredHourlyRate: Math.max(1, Number(e.target.value)) })}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Gastos Directos del Proyecto' : 'Direct Project Expenses'}>
            <UiInput
              type="number"
              min={0}
              value={inputData.projectExpenses}
              onChange={(e) => setInputData({ ...inputData, projectExpenses: Math.max(0, Number(e.target.value)) })}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Reserva de Impuestos (%)' : 'Tax Reserve %'}>
            <UiInput
              type="number"
              min={0}
              max={50}
              value={inputData.taxReservePct}
              onChange={(e) => setInputData({ ...inputData, taxReservePct: Math.max(0, Number(e.target.value)) })}
            />
          </ToolFieldGroup>
        </div>
      </div>
    </div>
  );
}
