import { useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  cashBalance: '150000',
  monthlyRevenue: '25000',
  monthlyExpenses: '40000'
};

export default function CashFlowBurnRateCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [cashBalanceStr, setCashBalanceStr] = useState<string>(DEFAULTS.cashBalance);
  const [monthlyRevenueStr, setMonthlyRevenueStr] = useState<string>(DEFAULTS.monthlyRevenue);
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState<string>(DEFAULTS.monthlyExpenses);

  const cashId = useId();
  const revId = useId();
  const expId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setCashBalanceStr(DEFAULTS.cashBalance);
    setMonthlyRevenueStr(DEFAULTS.monthlyRevenue);
    setMonthlyExpensesStr(DEFAULTS.monthlyExpenses);
  };

  const handleClear = () => {
    setCashBalanceStr('');
    setMonthlyRevenueStr('');
    setMonthlyExpensesStr('');
  };

  const isEmpty =
    cashBalanceStr.trim() === '' ||
    monthlyRevenueStr.trim() === '' ||
    monthlyExpensesStr.trim() === '';

  const cashBalance = Number(cashBalanceStr);
  const monthlyRevenue = Number(monthlyRevenueStr);
  const monthlyExpenses = Number(monthlyExpensesStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(cashBalance) || cashBalance < 0) {
      errors.cashBalance = `Cash balance must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(monthlyRevenue) || monthlyRevenue < 0) {
      errors.monthlyRevenue = `Monthly revenue must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(monthlyExpenses) || monthlyExpenses < 0) {
      errors.monthlyExpenses = `Monthly expenses must be ${formatWhole(0)} or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let netCashFlow = 0;
  let monthlyBurn = 0;
  let runwayMonths = 0;

  if (!isEmpty && !hasErrors) {
    netCashFlow = monthlyRevenue - monthlyExpenses;
    monthlyBurn = Math.max(0, monthlyExpenses - monthlyRevenue);
    runwayMonths = monthlyBurn > 0 ? cashBalance / monthlyBurn : netCashFlow >= 0 ? 999 : 0;
  }

  const netCashFlowDisplay =
    netCashFlow >= 0
      ? `+${formatWhole(netCashFlow)}`
      : `-${formatWhole(Math.abs(netCashFlow))}`;
  const runwayDisplay =
    runwayMonths >= 999 ? 'Infinite (Profitable)' : `${runwayMonths.toFixed(1)} months`;

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Burn Rate & Runway — Estimated Runway: ${runwayDisplay} | Net Cash Flow: ${netCashFlowDisplay}/mo | Net Monthly Burn: ${formatWhole(monthlyBurn)}/mo`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Financial Inputs"
          subtitle="Measure net monthly cash burn and estimate remaining operating runway."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup
            label="Current Cash Balance"
            htmlFor={cashId}
            unit={currencyMeta.symbol}
            error={errors.cashBalance}
          >
            <input
              id={cashId}
              type="number"
              min="0"
              step="any"
              value={cashBalanceStr}
              onChange={(e) => setCashBalanceStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="150000"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Monthly Cash Inflow (Revenue)"
              htmlFor={revId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyRevenue}
            >
              <input
                id={revId}
                type="number"
                min="0"
                step="any"
                value={monthlyRevenueStr}
                onChange={(e) => setMonthlyRevenueStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Cash Outflow (Expenses)"
              htmlFor={expId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.monthlyExpenses}
            >
              <input
                id={expId}
                type="number"
                min="0"
                step="any"
                value={monthlyExpensesStr}
                onChange={(e) => setMonthlyExpensesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="40000"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Burn Rate & Runway"
          state={resultState}
          primaryLabel="Estimated Runway"
          primaryValue={runwayDisplay}
          primarySubtext={
            runwayMonths >= 999
              ? 'Monthly inflows meet or exceed outflows'
              : `Based on ${formatWhole(cashBalance)} cash and ${formatWhole(monthlyBurn)}/mo net burn`
          }
          statusLabel={runwayMonths >= 999 ? 'Cash-Flow Positive' : runwayMonths >= 12 ? 'Healthy Runway' : 'Active Burn'}
          statusTone={runwayMonths >= 999 || runwayMonths >= 12 ? 'success' : 'warning'}
          copyText={copyText}
          emptyTitle="Enter cash flow figures"
          emptyDescription="Provide cash reserves, monthly revenue, and monthly expenses to compute burn rate and runway."
          errorTitle="Invalid cash flow inputs"
          errorMessage={Object.values(errors)[0] || `Cash balance, revenue, and expenses must be ${formatWhole(0)} or greater.`}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Net Cash Flow" value={netCashFlowDisplay} />
            <ToolMetricTile
              label="Net Monthly Burn"
              value={formatWhole(monthlyBurn)}
              accent={monthlyBurn === 0}
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Current Cash Balance', value: formatWhole(cashBalance) },
              { label: 'Net Cash Flow', value: `${netCashFlowDisplay}/mo` },
              { label: 'Net Monthly Burn', value: `${formatWhole(monthlyBurn)}/mo` },
              { label: 'Estimated Runway', value: runwayDisplay, highlight: true }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
