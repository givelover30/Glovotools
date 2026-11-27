import { useState, useMemo, useId } from 'react';
import { LineChart, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolMetricTile,
  ToolFieldGroup,
  ToolSegmentedControl
} from '../calculator/ToolWorkspacePrimitives.tsx';
import {
  UiButton,
  UiInput,
  UiStatusLabel,
  UiEmptyState,
  UiErrorState
} from '../ui/AppPrimitives.tsx';
import { PlannerHeaderToolbar, PlannerDisclaimer } from '../planner/PlannerPrimitives.tsx';
import { downloadCsvFile, downloadJsonFile } from '../planner/exportUtils.ts';
import { usePlannerStorage } from '../../hooks/usePlannerStorage.ts';
import {
  CashFlowDirection,
  CashFlowForecastInput,
  CashFlowFrequency,
  CashFlowLineItem,
  CashFlowScenarioMode,
  DEFAULT_CASH_FLOW_ITEMS,
  analyzeCashFlowForecast,
  validateCashFlowInput
} from '../../engine/contracts/planners/cashFlowForecast.ts';

const DEFAULT_START_YM = (() => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
})();

const DEFAULT_CASH_FLOW_STATE: CashFlowForecastInput = {
  businessName: 'Operating Cash Flow Plan',
  openingCashBalance: 25000,
  horizonMonths: 12,
  startYearMonth: DEFAULT_START_YM,
  scenario: 'base',
  items: DEFAULT_CASH_FLOW_ITEMS
};

const EMPTY_CASH_FLOW_STATE: CashFlowForecastInput = {
  businessName: 'New Cash Flow Forecast',
  openingCashBalance: 10000,
  horizonMonths: 12,
  startYearMonth: DEFAULT_START_YM,
  scenario: 'base',
  items: []
};

function sanitizeCashFlowState(raw: unknown): CashFlowForecastInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<CashFlowForecastInput>;
  if (
    typeof obj.openingCashBalance !== 'number' ||
    typeof obj.horizonMonths !== 'number' ||
    !Array.isArray(obj.items)
  ) {
    return null;
  }
  const items: CashFlowLineItem[] = obj.items
    .filter((i) => i && typeof i === 'object' && typeof i.name === 'string' && typeof i.amount === 'number')
    .map((i) => ({
      id: typeof i.id === 'string' ? i.id : `cf-${Math.random()}`,
      name: i.name,
      direction: i.direction === 'outflow' ? 'outflow' : 'inflow',
      category: typeof i.category === 'string' ? i.category : 'General',
      amount: Math.max(0, i.amount),
      frequency: i.frequency === 'one-time' ? 'one-time' : 'monthly',
      startMonth: typeof i.startMonth === 'number' && i.startMonth >= 1 ? Math.round(i.startMonth) : 1,
      endMonth:
        typeof i.endMonth === 'number' && i.endMonth >= 1 ? Math.round(i.endMonth) : null
    }));

  return {
    businessName: typeof obj.businessName === 'string' ? obj.businessName : 'Cash Flow Forecast',
    openingCashBalance: obj.openingCashBalance,
    horizonMonths: Math.max(1, Math.min(36, Math.round(obj.horizonMonths))),
    startYearMonth:
      typeof obj.startYearMonth === 'string' && /^\d{4}-\d{2}$/.test(obj.startYearMonth)
        ? obj.startYearMonth
        : DEFAULT_START_YM,
    scenario:
      obj.scenario === 'optimistic' || obj.scenario === 'conservative' ? obj.scenario : 'base',
    items
  };
}

export default function CashFlowForecastPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtMoney = (val: number) =>
    formatCurrency(val, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    recoveredFromCorruption,
    dismissCorruptionNotice
  } = usePlannerStorage<CashFlowForecastInput>({
    storageKey: 'calctools_cash_flow_forecast_v1',
    version: 1,
    defaultValue: DEFAULT_CASH_FLOW_STATE,
    sanitize: sanitizeCashFlowState
  });

  const [itemName, setItemName] = useState('');
  const [itemDirection, setItemDirection] = useState<CashFlowDirection>('inflow');
  const [itemCategory, setItemCategory] = useState('Revenue');
  const [itemAmount, setItemAmount] = useState(2500);
  const [itemFreq, setItemFreq] = useState<CashFlowFrequency>('monthly');
  const [itemStartMonth, setItemStartMonth] = useState(1);
  const [formError, setFormError] = useState('');

  const validationErrors = useMemo(() => validateCashFlowInput(state), [state]);
  const forecast = useMemo(() => {
    if (validationErrors.length > 0) return null;
    try {
      return analyzeCashFlowForecast(state);
    } catch {
      return null;
    }
  }, [state, validationErrors]);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemName.trim();
    if (!trimmed) {
      setFormError(isEs ? 'Ingresa el nombre de la partida.' : 'Please enter a line item name.');
      return;
    }
    if (itemAmount < 0 || itemStartMonth < 1) {
      setFormError(isEs ? 'El monto >= 0 y mes de inicio >= 1.' : 'Amount must be >= 0 and start month >= 1.');
      return;
    }
    setFormError('');
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `cf-${Date.now()}`,
          name: trimmed,
          direction: itemDirection,
          category: itemCategory.trim() || 'General',
          amount: Number(itemAmount) || 0,
          frequency: itemFreq,
          startMonth: Math.max(1, Math.round(itemStartMonth)),
          endMonth: itemFreq === 'one-time' ? Math.max(1, Math.round(itemStartMonth)) : null
        }
      ]
    }));
    setItemName('');
  };

  const deleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id)
    }));
  };

  const handleExportCsv = () => {
    if (!forecast) return;
    downloadCsvFile(
      'cash_flow_forecast.csv',
      ['Month #', 'Period', 'Opening Cash', 'Inflows', 'Outflows', 'Net Cash Flow', 'Ending Cash', 'Negative Balance'],
      forecast.selectedScenario.schedule.map((row) => [
        row.month,
        row.dateLabel,
        row.openingCash,
        row.totalInflows,
        row.totalOutflows,
        row.netCashFlow,
        row.endingCash,
        row.isNegativeCash ? 'ALERT' : 'OK'
      ])
    );
  };

  const handleExportJson = () => {
    downloadJsonFile('cash_flow_forecast.json', { inputs: state, forecast });
  };

  const sel = forecast?.selectedScenario;
  const copySummary = sel
    ? `${state.businessName} (${state.horizonMonths} mo, ${state.scenario}) | Opening: ${fmtMoney(state.openingCashBalance)} | Ending Cash: ${fmtMoney(sel.endingCashBalance)} | Net Flow: ${fmtMoney(sel.cumulativeNetCashFlow)} | Lowest Cash: ${fmtMoney(sel.lowestCashBalance)} (${sel.lowestCashMonthLabel})`
    : '';

  return (
    <div className="space-y-5 animate-fadeIn">
      <PlannerHeaderToolbar
        icon={<LineChart className="w-4 h-4" />}
        title={isEs ? 'Planificador de Flujo de Caja y Escenarios' : 'Business Cash Flow Forecast & Scenario Planner'}
        subtitle={
          isEs
            ? 'Proyecta entradas, salidas, saldo final mes a mes y estrés de liquidez bajo 3 escenarios'
            : 'Forecast monthly inflows, outflows, ending cash & stress scenarios over 3–36 months'
        }
        isEs={isEs}
        hasSavedData={hasSavedData}
        recoveredFromCorruption={recoveredFromCorruption}
        onDismissCorruptionNotice={dismissCorruptionNotice}
        copyText={copySummary || undefined}
        onExportCsv={sel && sel.schedule.length > 0 ? handleExportCsv : undefined}
        onExportJson={handleExportJson}
        onReset={resetToDefault}
        onClear={() => clearWithState(EMPTY_CASH_FLOW_STATE)}
        canClear={state.items.length > 0}
      />

      {/* Core Forecast Settings */}
      <section className="ui-panel p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4">
            <ToolFieldGroup label={isEs ? 'Nombre del Plan' : 'Forecast Name'} htmlFor={`${baseId}-bname`}>
              <UiInput
                id={`${baseId}-bname`}
                type="text"
                value={state.businessName}
                onChange={(e) => setState((prev) => ({ ...prev, businessName: e.target.value }))}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup
              label={isEs ? `Caja Inicial (${currencyMeta.symbol})` : `Opening Cash (${currencyMeta.symbol})`}
              htmlFor={`${baseId}-open`}
            >
              <UiInput
                id={`${baseId}-open`}
                type="number"
                value={state.openingCashBalance}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, openingCashBalance: Number(e.target.value) || 0 }))
                }
                className="font-mono font-bold"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Horizonte (meses)' : 'Horizon (Months)'} htmlFor={`${baseId}-hor`}>
              <select
                id={`${baseId}-hor`}
                value={state.horizonMonths}
                onChange={(e) => setState((prev) => ({ ...prev, horizonMonths: Number(e.target.value) }))}
                className="ui-input cursor-pointer font-mono text-xs"
              >
                {[3, 6, 12, 18, 24, 36].map((h) => (
                  <option key={h} value={h}>
                    {h} {isEs ? 'meses' : 'mo'}
                  </option>
                ))}
              </select>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Mes Inicial' : 'Start Month'} htmlFor={`${baseId}-ym`}>
              <UiInput
                id={`${baseId}-ym`}
                type="month"
                value={state.startYearMonth}
                onChange={(e) => {
                  if (/^\d{4}-\d{2}$/.test(e.target.value)) {
                    setState((prev) => ({ ...prev, startYearMonth: e.target.value }));
                  }
                }}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="ui-label block">{isEs ? 'Escenario de Sensibilidad' : 'Scenario Sensitivity Mode'}</span>
          <ToolSegmentedControl
            ariaLabel={isEs ? 'Escenario de flujo de caja' : 'Cash flow scenario'}
            value={state.scenario}
            onChange={(val: CashFlowScenarioMode) => setState((prev) => ({ ...prev, scenario: val }))}
            options={[
              { value: 'base', label: isEs ? 'Base (100%)' : 'Base Case (100%)' },
              { value: 'optimistic', label: isEs ? 'Optimista (+10% In / -5% Out)' : 'Optimistic (+10% In / -5% Out)' },
              { value: 'conservative', label: isEs ? 'Conservador (-15% In / +10% Out)' : 'Conservative (-15% In / +10% Out)' }
            ]}
          />
        </div>
      </section>

      {validationErrors.length > 0 && <UiErrorState message={validationErrors[0].message} />}

      {sel && sel.negativeCashMonths > 0 && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-center gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {isEs
              ? `Alerta de liquidez: el saldo de caja cae por debajo de cero en ${sel.negativeCashMonths} mes(es), con un mínimo de ${fmtMoney(sel.lowestCashBalance)} en ${sel.lowestCashMonthLabel}.`
              : `Liquidity alert: projected cash drops below zero in ${sel.negativeCashMonths} month(s), reaching a low of ${fmtMoney(sel.lowestCashBalance)} in ${sel.lowestCashMonthLabel}.`}
          </span>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolMetricTile
          label={isEs ? 'Caja Final Proyectada' : 'Projected Ending Cash'}
          value={sel ? fmtMoney(sel.endingCashBalance) : '—'}
          hint={`${state.horizonMonths} ${isEs ? 'meses' : 'months'} (${state.scenario})`}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Flujo Neto Acumulado' : 'Cumulative Net Flow'}
          value={sel ? fmtMoney(sel.cumulativeNetCashFlow) : '—'}
          hint={
            sel
              ? `${isEs ? 'Prom:' : 'Avg:'} ${fmtMoney(sel.averageMonthlyBurnOrSurplus)}/${isEs ? 'mes' : 'mo'}`
              : ''
          }
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Punto Mínimo de Caja' : 'Lowest Cash Trough'}
          value={sel ? fmtMoney(sel.lowestCashBalance) : '—'}
          hint={sel ? sel.lowestCashMonthLabel : ''}
        />
        <ToolMetricTile
          label={isEs ? 'Entradas vs. Salidas' : 'Total Inflows vs. Outflows'}
          value={sel ? `${fmtMoney(sel.totalInflows)}` : '—'}
          hint={sel ? `${isEs ? 'Salidas:' : 'Outflows:'} ${fmtMoney(sel.totalOutflows)}` : ''}
        />
      </div>

      {/* Add Inflow / Outflow Line Item */}
      <section className="ui-panel p-5 sm:p-6 space-y-4 no-print">
        <h3 className="text-sm font-bold text-text-primary">
          {isEs ? 'Añadir Entrada o Salida de Efectivo' : 'Add Cash Inflow or Outflow Item'}
        </h3>
        {formError && <UiErrorState message={formError} />}
        <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <ToolFieldGroup label={isEs ? 'Concepto' : 'Description'} htmlFor={`${baseId}-iname`}>
              <UiInput
                id={`${baseId}-iname`}
                type="text"
                placeholder={isEs ? 'Ej. Suscripciones SaaS' : 'e.g. Monthly Retainers'}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Tipo' : 'Type'} htmlFor={`${baseId}-idir`}>
              <select
                id={`${baseId}-idir`}
                value={itemDirection}
                onChange={(e) => setItemDirection(e.target.value as CashFlowDirection)}
                className="ui-input cursor-pointer text-xs"
              >
                <option value="inflow">{isEs ? 'Entrada (+)' : 'Inflow (+)'}</option>
                <option value="outflow">{isEs ? 'Salida (-)' : 'Outflow (-)'}</option>
              </select>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? 'Frecuencia' : 'Frequency'} htmlFor={`${baseId}-ifreq`}>
              <select
                id={`${baseId}-ifreq`}
                value={itemFreq}
                onChange={(e) => setItemFreq(e.target.value as CashFlowFrequency)}
                className="ui-input cursor-pointer text-xs"
              >
                <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                <option value="one-time">{isEs ? 'Único (1 mes)' : 'One-Time'}</option>
              </select>
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <ToolFieldGroup label={isEs ? `Monto (${currencyMeta.symbol})` : `Amount (${currencyMeta.symbol})`} htmlFor={`${baseId}-iamt`}>
              <UiInput
                id={`${baseId}-iamt`}
                type="number"
                min={0}
                value={itemAmount}
                onChange={(e) => setItemAmount(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-1">
            <ToolFieldGroup label={isEs ? 'Mes #' : 'Start M#'} htmlFor={`${baseId}-istart`}>
              <UiInput
                id={`${baseId}-istart`}
                type="number"
                min={1}
                max={state.horizonMonths}
                value={itemStartMonth}
                onChange={(e) => setItemStartMonth(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Añadir' : 'Add'}</span>
            </UiButton>
          </div>
        </form>

        {state.items.length === 0 ? (
          <UiEmptyState
            title={isEs ? 'Sin partidas de flujo de caja' : 'No cash flow items configured'}
            description={isEs ? 'Añade ingresos/gastos arriba o restaura el ejemplo.' : 'Add inflows/outflows above or restore the starter forecast.'}
            action={
              <UiButton variant="secondary" size="sm" onClick={resetToDefault}>
                {isEs ? 'Restaurar ejemplo' : 'Restore sample items'}
              </UiButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-border-subtle bg-surface-secondary/50 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UiStatusLabel tone={item.direction === 'inflow' ? 'success' : 'error'}>
                      {item.direction === 'inflow' ? '+' : '-'}
                    </UiStatusLabel>
                    <span className="text-sm font-semibold text-text-primary truncate">{item.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-text-secondary mt-0.5">
                    {item.frequency === 'one-time'
                      ? `${isEs ? 'Único mes' : 'One-time M'}${item.startMonth}`
                      : `${isEs ? 'Mensual desde M' : 'Monthly from M'}${item.startMonth}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono font-bold text-sm ${
                      item.direction === 'inflow' ? 'text-status-success' : 'text-status-error'
                    }`}
                  >
                    {item.direction === 'inflow' ? '+' : '-'}
                    {fmtMoney(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-status-error hover:bg-status-error-bg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scenario Comparison + Monthly Table */}
      {forecast && sel && (
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary">
            {isEs ? 'Tabla de Proyección Mensual' : 'Month-by-Month Cash Flow Forecast'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              { label: isEs ? 'Base' : 'Base Case', s: forecast.baseScenario },
              { label: isEs ? 'Optimista' : 'Optimistic', s: forecast.optimisticScenario },
              { label: isEs ? 'Conservador' : 'Conservative', s: forecast.conservativeScenario }
            ].map((sc) => (
              <div
                key={sc.label}
                className={`p-3 rounded-xl border ${
                  sc.s.scenario === state.scenario
                    ? 'border-accent bg-accent-light/25'
                    : 'border-border-subtle bg-surface-secondary/50'
                } flex items-center justify-between`}
              >
                <span className="font-semibold text-text-primary">{sc.label}</span>
                <span className="font-mono font-bold text-text-primary">
                  {fmtMoney(sc.s.endingCashBalance)}
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto max-h-80 rounded-xl border border-border-main bg-surface">
            <table className="w-full text-left text-xs font-mono tabular-nums whitespace-nowrap">
              <thead className="bg-surface-secondary text-text-secondary sticky top-0 border-b border-border-main">
                <tr>
                  <th className="p-2.5 font-semibold">#</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Mes' : 'Period'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Caja Inicial' : 'Opening'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Entradas' : 'Inflows'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Salidas' : 'Outflows'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Flujo Neto' : 'Net Flow'}</th>
                  <th className="p-2.5 font-semibold">{isEs ? 'Caja Final' : 'Ending Cash'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {sel.schedule.map((row) => (
                  <tr
                    key={row.month}
                    className={row.isNegativeCash ? 'bg-status-error-bg/40' : 'hover:bg-surface-hover'}
                  >
                    <td className="p-2.5">{row.month}</td>
                    <td className="p-2.5">{row.dateLabel}</td>
                    <td className="p-2.5">{fmtMoney(row.openingCash)}</td>
                    <td className="p-2.5 text-status-success">+{fmtMoney(row.totalInflows)}</td>
                    <td className="p-2.5 text-status-error">-{fmtMoney(row.totalOutflows)}</td>
                    <td
                      className={`p-2.5 font-semibold ${
                        row.netCashFlow >= 0 ? 'text-status-success' : 'text-status-error'
                      }`}
                    >
                      {fmtMoney(row.netCashFlow)}
                    </td>
                    <td
                      className={`p-2.5 font-bold ${
                        row.isNegativeCash ? 'text-status-error' : 'text-text-primary'
                      }`}
                    >
                      {fmtMoney(row.endingCash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <PlannerDisclaimer
        tone="warning"
        title={isEs ? 'Aviso de Proyección Financiera' : 'Financial Projection Disclaimer'}
        message={
          isEs
            ? 'Este pronóstico se basa exclusivamente en las partidas y multiplicadores ingresados y no considera impuestos diferidos ni estacionalidad externa no especificada.'
            : 'Cash flow projections are illustrative models built from your entered assumptions and scenario sensitivities. They do not guarantee future liquidity or financial outcomes.'
        }
      />
    </div>
  );
}
