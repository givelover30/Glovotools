import { useId, useState } from 'react';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  housing: '1800',
  utilities: '300',
  groceries: '600',
  transportation: '400',
  insurance: '250',
  otherEssentials: '350',
  targetMonths: '6' as '3' | '6' | '9' | '12',
  currentSavings: '5000'
};

export default function EmergencyFundExpenseCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [housingStr, setHousingStr] = useState<string>(DEFAULTS.housing);
  const [utilitiesStr, setUtilitiesStr] = useState<string>(DEFAULTS.utilities);
  const [groceriesStr, setGroceriesStr] = useState<string>(DEFAULTS.groceries);
  const [transportationStr, setTransportationStr] = useState<string>(DEFAULTS.transportation);
  const [insuranceStr, setInsuranceStr] = useState<string>(DEFAULTS.insurance);
  const [otherEssentialsStr, setOtherEssentialsStr] = useState<string>(DEFAULTS.otherEssentials);
  const [targetMonths, setTargetMonths] = useState<'3' | '6' | '9' | '12'>(DEFAULTS.targetMonths);
  const [currentSavingsStr, setCurrentSavingsStr] = useState<string>(DEFAULTS.currentSavings);

  const housingId = useId();
  const utilitiesId = useId();
  const groceriesId = useId();
  const transportId = useId();
  const insuranceId = useId();
  const otherId = useId();
  const currentId = useId();

  const fmt = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  const handleReset = () => {
    setHousingStr(DEFAULTS.housing);
    setUtilitiesStr(DEFAULTS.utilities);
    setGroceriesStr(DEFAULTS.groceries);
    setTransportationStr(DEFAULTS.transportation);
    setInsuranceStr(DEFAULTS.insurance);
    setOtherEssentialsStr(DEFAULTS.otherEssentials);
    setTargetMonths(DEFAULTS.targetMonths);
    setCurrentSavingsStr(DEFAULTS.currentSavings);
  };

  const handleClear = () => {
    setHousingStr('');
    setUtilitiesStr('');
    setGroceriesStr('');
    setTransportationStr('');
    setInsuranceStr('');
    setOtherEssentialsStr('');
    setCurrentSavingsStr('');
  };

  const isEmpty =
    housingStr.trim() === '' ||
    utilitiesStr.trim() === '' ||
    groceriesStr.trim() === '' ||
    transportationStr.trim() === '' ||
    insuranceStr.trim() === '' ||
    otherEssentialsStr.trim() === '' ||
    currentSavingsStr.trim() === '';

  const housing = Number(housingStr);
  const utilities = Number(utilitiesStr);
  const groceries = Number(groceriesStr);
  const transportation = Number(transportationStr);
  const insurance = Number(insuranceStr);
  const otherEssentials = Number(otherEssentialsStr);
  const currentSavings = Number(currentSavingsStr);
  const targetMonthsNum = Number(targetMonths);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(housing) || housing < 0) errors.housing = `Housing must be ${fmt(0)} or greater.`;
    if (!Number.isFinite(utilities) || utilities < 0) errors.utilities = `Utilities must be ${fmt(0)} or greater.`;
    if (!Number.isFinite(groceries) || groceries < 0) errors.groceries = `Groceries must be ${fmt(0)} or greater.`;
    if (!Number.isFinite(transportation) || transportation < 0) {
      errors.transportation = `Transportation must be ${fmt(0)} or greater.`;
    }
    if (!Number.isFinite(insurance) || insurance < 0) errors.insurance = `Insurance must be ${fmt(0)} or greater.`;
    if (!Number.isFinite(otherEssentials) || otherEssentials < 0) {
      errors.otherEssentials = `Other essentials must be ${fmt(0)} or greater.`;
    }
    if (!Number.isFinite(currentSavings) || currentSavings < 0) {
      errors.currentSavings = `Current emergency savings must be ${fmt(0)} or greater.`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalMonthlyExpenses = 0;
  let targetEmergencyFund = 0;
  let fundingGap = 0;
  let fundingPercentage = 0;

  if (!isEmpty && !hasErrors) {
    totalMonthlyExpenses =
      housing + utilities + groceries + transportation + insurance + otherEssentials;
    targetEmergencyFund = totalMonthlyExpenses * targetMonthsNum;
    fundingGap = Math.max(0, targetEmergencyFund - currentSavings);
    fundingPercentage =
      targetEmergencyFund > 0 ? Math.min(100, (currentSavings / targetEmergencyFund) * 100) : 100;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Emergency Fund (${targetMonthsNum} months target) — Monthly Essentials: ${fmt(totalMonthlyExpenses)} | Target Fund: ${fmt(targetEmergencyFund)} | Current Savings: ${fmt(currentSavings)} | Remaining Gap: ${fmt(fundingGap)} (${fundingPercentage.toFixed(1)}% funded)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Essential Monthly Expenses & Cushion"
          subtitle="Itemize core living costs to calculate your multi-month emergency reserve target."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Housing" htmlFor={housingId} unit={`${currencyMeta.symbol}/mo`} error={errors.housing}>
              <input
                id={housingId}
                type="number"
                min="0"
                step="any"
                value={housingStr}
                onChange={(e) => setHousingStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1800"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Utilities"
              htmlFor={utilitiesId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.utilities}
            >
              <input
                id={utilitiesId}
                type="number"
                min="0"
                step="any"
                value={utilitiesStr}
                onChange={(e) => setUtilitiesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="300"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Groceries"
              htmlFor={groceriesId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.groceries}
            >
              <input
                id={groceriesId}
                type="number"
                min="0"
                step="any"
                value={groceriesStr}
                onChange={(e) => setGroceriesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="600"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Transportation"
              htmlFor={transportId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.transportation}
            >
              <input
                id={transportId}
                type="number"
                min="0"
                step="any"
                value={transportationStr}
                onChange={(e) => setTransportationStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="400"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Insurance"
              htmlFor={insuranceId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.insurance}
            >
              <input
                id={insuranceId}
                type="number"
                min="0"
                step="any"
                value={insuranceStr}
                onChange={(e) => setInsuranceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="250"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Other Essentials"
              htmlFor={otherId}
              unit={`${currencyMeta.symbol}/mo`}
              error={errors.otherEssentials}
            >
              <input
                id={otherId}
                type="number"
                min="0"
                step="any"
                value={otherEssentialsStr}
                onChange={(e) => setOtherEssentialsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="350"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-4">
            <div className="space-y-2">
              <span className="ui-label block">Target Months of Expenses</span>
              <ToolSegmentedControl
                ariaLabel="Target months of expenses"
                value={targetMonths}
                onChange={setTargetMonths}
                options={[
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '9', label: '9 Months' },
                  { value: '12', label: '12 Months' }
                ]}
              />
            </div>

            <ToolFieldGroup
              label="Current Emergency Savings"
              htmlFor={currentId}
              unit={currencyMeta.symbol}
              error={errors.currentSavings}
            >
              <input
                id={currentId}
                type="number"
                min="0"
                step="any"
                value={currentSavingsStr}
                onChange={(e) => setCurrentSavingsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="5000"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Emergency Fund Analysis"
          state={resultState}
          primaryLabel="Target Emergency Fund"
          primaryValue={fmt(targetEmergencyFund)}
          primarySubtext={`${fundingPercentage.toFixed(1)}% funded (${targetMonthsNum} months of ${fmt(totalMonthlyExpenses)}/mo essentials)`}
          statusLabel={fundingGap === 0 ? 'Fully Funded' : `${fundingPercentage.toFixed(1)}% Funded`}
          statusTone={fundingGap === 0 ? 'success' : 'accent'}
          copyText={copyText}
          emptyTitle="Enter monthly essential expenses"
          emptyDescription="Provide your essential monthly living costs and current savings to calculate your emergency fund target."
          errorTitle="Invalid expense values"
          errorMessage={Object.values(errors)[0] || `All expense and savings amounts must be ${fmt(0)} or greater.`}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Total Monthly Essentials"
              value={fmt(totalMonthlyExpenses)}
            />
            <ToolMetricTile
              label="Remaining Funding Gap"
              value={fmt(fundingGap)}
              accent={fundingGap === 0}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Total Monthly Essentials',
                value: `${fmt(totalMonthlyExpenses)}/mo`
              },
              {
                label: `Target Emergency Fund (${targetMonthsNum} mo)`,
                value: fmt(targetEmergencyFund)
              },
              {
                label: 'Current Savings',
                value: fmt(currentSavings)
              },
              {
                label: 'Remaining Funding Gap',
                value: fmt(fundingGap),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
