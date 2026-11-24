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
  currentSavings: '15000',
  essentialExpenses: '3000',
  emergencyIncome: '500',
  oneTimeCosts: '500'
};

export default function EmergencyRunwayCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [currentSavingsStr, setCurrentSavingsStr] = useState<string>(DEFAULTS.currentSavings);
  const [essentialExpensesStr, setEssentialExpensesStr] = useState<string>(
    DEFAULTS.essentialExpenses
  );
  const [emergencyIncomeStr, setEmergencyIncomeStr] = useState<string>(DEFAULTS.emergencyIncome);
  const [oneTimeCostsStr, setOneTimeCostsStr] = useState<string>(DEFAULTS.oneTimeCosts);

  const savingsId = useId();
  const oneTimeId = useId();
  const expensesId = useId();
  const incomeId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setCurrentSavingsStr(DEFAULTS.currentSavings);
    setEssentialExpensesStr(DEFAULTS.essentialExpenses);
    setEmergencyIncomeStr(DEFAULTS.emergencyIncome);
    setOneTimeCostsStr(DEFAULTS.oneTimeCosts);
  };

  const handleClear = () => {
    setCurrentSavingsStr('');
    setEssentialExpensesStr('');
    setEmergencyIncomeStr('');
    setOneTimeCostsStr('');
  };

  const isEmpty =
    currentSavingsStr.trim() === '' ||
    essentialExpensesStr.trim() === '' ||
    emergencyIncomeStr.trim() === '' ||
    oneTimeCostsStr.trim() === '';

  const currentSavings = Number(currentSavingsStr);
  const essentialExpenses = Number(essentialExpensesStr);
  const emergencyIncome = Number(emergencyIncomeStr);
  const oneTimeCosts = Number(oneTimeCostsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(currentSavings) || currentSavings < 0) {
      errors.currentSavings = `Current emergency savings must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(oneTimeCosts) || oneTimeCosts < 0) {
      errors.oneTimeCosts = `One-time emergency costs must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(essentialExpenses) || essentialExpenses < 0) {
      errors.essentialExpenses = `Essential monthly expenses must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(emergencyIncome) || emergencyIncome < 0) {
      errors.emergencyIncome = `Emergency income must be ${formatWhole(0)} or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let netMonthlyBurn = 1;
  let availableSavings = 0;
  let runwayMonths = 0;

  if (!isEmpty && !hasErrors) {
    netMonthlyBurn = Math.max(1, essentialExpenses - emergencyIncome);
    availableSavings = Math.max(0, currentSavings - oneTimeCosts);
    runwayMonths = availableSavings / netMonthlyBurn;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Emergency Savings Runway: ${runwayMonths.toFixed(1)} Months | Available Emergency Funds: ${formatWhole(availableSavings)} | Net Monthly Burn Rate: ${formatWhole(netMonthlyBurn)}/mo`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Cash Reserves & Monthly Burn"
          subtitle="Estimate how many months your liquid savings will cover essential expenses during an emergency."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Current Emergency Savings"
              htmlFor={savingsId}
              unit={currencyMeta.symbol}
              error={errors.currentSavings}
            >
              <input
                id={savingsId}
                type="number"
                min="0"
                step="any"
                value={currentSavingsStr}
                onChange={(e) => setCurrentSavingsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="15000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="One-Time Emergency Costs"
              htmlFor={oneTimeId}
              unit={currencyMeta.symbol}
              error={errors.oneTimeCosts}
            >
              <input
                id={oneTimeId}
                type="number"
                min="0"
                step="any"
                value={oneTimeCostsStr}
                onChange={(e) => setOneTimeCostsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="500"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Essential Monthly Expenses"
              htmlFor={expensesId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.essentialExpenses}
            >
              <input
                id={expensesId}
                type="number"
                min="0"
                step="any"
                value={essentialExpensesStr}
                onChange={(e) => setEssentialExpensesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Emergency Income / Unemployment"
              htmlFor={incomeId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.emergencyIncome}
            >
              <input
                id={incomeId}
                type="number"
                min="0"
                step="any"
                value={emergencyIncomeStr}
                onChange={(e) => setEmergencyIncomeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="500"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Emergency Savings Runway"
          state={resultState}
          primaryLabel="Savings Runway"
          primaryValue={`${runwayMonths.toFixed(1)} Months`}
          primarySubtext={`${formatWhole(availableSavings)} available reserves at ${formatWhole(netMonthlyBurn)}/mo net burn`}
          statusLabel={runwayMonths >= 6 ? '6+ Month Cushion' : runwayMonths >= 3 ? '3–6 Month Cushion' : 'Below 3 Months'}
          statusTone={runwayMonths >= 6 ? 'success' : runwayMonths >= 3 ? 'accent' : 'warning'}
          copyText={copyText}
          emptyTitle="Enter reserve and expense figures"
          emptyDescription="Provide emergency savings, one-time costs, monthly essentials, and interim income to calculate runway."
          errorTitle="Invalid runway inputs"
          errorMessage={Object.values(errors)[0] || `All savings, expense, and income inputs must be ${formatWhole(0)} or greater.`}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Available Emergency Funds"
              value={formatWhole(availableSavings)}
              accent
            />
            <ToolMetricTile
              label="Net Monthly Burn Rate"
              value={`${formatWhole(netMonthlyBurn)} /mo`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Available Emergency Funds',
                value: formatWhole(availableSavings)
              },
              {
                label: 'Net Monthly Burn Rate',
                value: `${formatWhole(netMonthlyBurn)} /mo`
              },
              {
                label: 'Savings Runway',
                value: `${runwayMonths.toFixed(1)} Months`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
