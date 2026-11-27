import { useState, useId } from 'react';
import { Megaphone, Plus, Trash2, Download, Save, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import { ToolMetricTile, ToolFieldGroup } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import { UiButton, UiInput, UiStatusLabel } from '../ui/AppPrimitives.tsx';
import {
  MarketingCampaignItem,
  DEFAULT_MARKETING_CAMPAIGNS,
  calculateMarketing
} from '../../engine/contracts/planners/marketingBudget.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import { buildCsvContent } from '../planner/exportUtils.ts';

const STORAGE_KEY = 'calctools_marketing_budget_planner_v1';

export default function MarketingBudgetPlannerCalculator() {
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

  const [planName, setPlanName] = useState('Q4 Growth & Acquisition Plan');
  const [totalPoolBudget, setTotalPoolBudget] = useState(10000);
  const {
    state: campaigns,
    setState: setCampaigns,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<MarketingCampaignItem[]>({
    storageKey: STORAGE_KEY,
    version: 1,
    defaultValue: DEFAULT_MARKETING_CAMPAIGNS
  });

  const [newChannel, setNewChannel] = useState<MarketingCampaignItem['channel']>('Paid Search (PPC)');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newAllocated, setNewAllocated] = useState(2000);
  const [newSpent, setNewSpent] = useState(1800);
  const [newLeads, setNewLeads] = useState(50);
  const [formError, setFormError] = useState('');

  const result = calculateMarketing({ planName, totalPoolBudget, campaigns });

  const addCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCampaignName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la campaña.' : 'Please enter campaign name.');
      return;
    }
    setFormError('');
    setCampaigns([
      ...campaigns,
      {
        id: Date.now().toString(),
        channel: newChannel,
        campaignName: trimmed,
        allocatedBudget: Number(newAllocated) || 2000,
        actualSpent: Number(newSpent) || 1800,
        estimatedLeads: Number(newLeads) || 50
      }
    ]);
    setNewCampaignName('');
  };

  const removeCampaign = (id: string) => {
    setCampaigns(campaigns.filter((c: MarketingCampaignItem) => c.id !== id));
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ planName, totalPoolBudget, campaigns, result }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-planner-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Channel', 'Campaign Name', 'Allocated', 'Actual Spent', 'Estimated Leads'];
    const rows = campaigns.map((c: MarketingCampaignItem) => [c.id, c.channel, c.campaignName, c.allocatedBudget, c.actualSpent, c.estimatedLeads]);
    const csv = buildCsvContent(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-text-primary truncate">
              {isEs ? 'Presupuesto de Marketing y Planificador de Campañas' : 'Small Business Marketing Budget & Campaign Planner'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {isEs ? 'Asigna presupuestos por canal y evalúa costo por cliente potencial' : 'Allocate marketing budgets by channel & evaluate cost per lead'}
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
          <UiButton variant="ghost" size="sm" onClick={() => setCampaigns(DEFAULT_MARKETING_CAMPAIGNS)}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEs ? 'Restaurar' : 'Reset'}</span>
          </UiButton>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Gasto Real Total' : 'Total Actual Spent'}
          value={fmtMoney(result.totalActualSpent)}
          hint={isEs ? `Presupuesto total: ${fmtMoney(result.totalPoolBudget)}` : `Pool budget: ${fmtMoney(result.totalPoolBudget)}`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Leads Estimados' : 'Estimated Leads'}
          value={result.totalEstimatedLeads.toLocaleString()}
          hint={isEs ? 'Clientes potenciales' : 'Generated prospects'}
        />
        <ToolMetricTile
          label={isEs ? 'Costo Promedio por Lead' : 'Average Cost Per Lead'}
          value={fmtMoney(result.averageCostPerLead)}
          hint={isEs ? 'CPA por lead' : 'CPL efficiency'}
        />
        <ToolMetricTile
          label={isEs ? 'Variación de Presupuesto' : 'Budget Variance'}
          value={fmtMoney(result.budgetVariance)}
          hint={isEs ? 'Real vs Asignado' : 'Actual vs Allocated'}
        />
      </div>

      {/* Settings */}
      <div className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Configuración del Plan de Marketing' : 'Marketing Plan Settings'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolFieldGroup label={isEs ? 'Nombre del Plan' : 'Plan Name'}>
            <UiInput type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Presupuesto Total Disponible' : 'Total Pool Budget'}>
            <UiInput
              type="number"
              min={0}
              value={totalPoolBudget}
              onChange={(e) => setTotalPoolBudget(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
      </div>

      {/* Add Campaign Form */}
      <form onSubmit={addCampaign} className="ui-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Agregar Campaña o Canal' : 'Add Campaign / Channel'}
        </h3>
        {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <ToolFieldGroup label={isEs ? 'Canal' : 'Channel'}>
            <select
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value as any)}
              className="ui-select w-full"
            >
              <option value="Paid Search (PPC)">Paid Search (PPC)</option>
              <option value="Social Media Ads">Social Media Ads</option>
              <option value="Content Marketing">Content Marketing</option>
              <option value="Email Outreach">Email Outreach</option>
              <option value="Events / Sponsorship">Events / Sponsorship</option>
            </select>
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Nombre de Campaña' : 'Campaign Name'}>
            <UiInput
              type="text"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="Summer Promo"
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Presupuesto Asignado' : 'Allocated'}>
            <UiInput
              type="number"
              min={0}
              value={newAllocated}
              onChange={(e) => setNewAllocated(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Gasto Real' : 'Actual Spent'}>
            <UiInput
              type="number"
              min={0}
              value={newSpent}
              onChange={(e) => setNewSpent(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
          <ToolFieldGroup label={isEs ? 'Leads Estimados' : 'Est. Leads'}>
            <UiInput
              type="number"
              min={0}
              value={newLeads}
              onChange={(e) => setNewLeads(Math.max(0, Number(e.target.value)))}
            />
          </ToolFieldGroup>
        </div>
        <div className="flex justify-end">
          <UiButton variant="primary" size="sm" type="submit">
            <Plus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Agregar Campaña' : 'Add Campaign'}</span>
          </UiButton>
        </div>
      </form>

      {/* Campaigns Table */}
      <div className="ui-panel p-5 space-y-4 overflow-x-auto">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Desglose de Campañas y Canales' : 'Campaign & Channel Breakdown'}
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Canal' : 'Channel'}</th>
              <th className="py-2.5 px-3 font-semibold">{isEs ? 'Campaña' : 'Campaign Name'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Asignado' : 'Allocated'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Gastado' : 'Actual Spent'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Leads' : 'Leads'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Costo/Lead' : 'Cost/Lead'}</th>
              <th className="py-2.5 px-3 font-semibold text-right">{isEs ? 'Acciones' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {campaigns.map((c: MarketingCampaignItem) => {
              const cpl = c.estimatedLeads > 0 ? c.actualSpent / c.estimatedLeads : 0;
              return (
                <tr key={c.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="py-3 px-3 font-sans font-medium text-text-primary">{c.channel}</td>
                  <td className="py-3 px-3 font-sans text-text-secondary">{c.campaignName}</td>
                  <td className="py-3 px-3 text-right">{fmtMoney(c.allocatedBudget)}</td>
                  <td className="py-3 px-3 text-right">{fmtMoney(c.actualSpent)}</td>
                  <td className="py-3 px-3 text-right">{c.estimatedLeads.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-accent font-bold">{fmtMoney(cpl)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => removeCampaign(c.id)}
                      className="text-text-secondary hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
