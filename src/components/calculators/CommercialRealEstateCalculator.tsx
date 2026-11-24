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
  purchasePrice: '1000000',
  downPaymentPct: '25',
  annualRent: '120000',
  vacancyPct: '5',
  operatingExpensesPct: '35',
  annualDebtService: '55000',
  holdingPeriod: '5',
  exitCapRate: '6.5'
};

export default function CommercialRealEstateCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [purchasePriceStr, setPurchasePriceStr] = useState<string>(DEFAULTS.purchasePrice);
  const [downPaymentPctStr, setDownPaymentPctStr] = useState<string>(DEFAULTS.downPaymentPct);
  const [annualRentStr, setAnnualRentStr] = useState<string>(DEFAULTS.annualRent);
  const [vacancyPctStr, setVacancyPctStr] = useState<string>(DEFAULTS.vacancyPct);
  const [operatingExpensesPctStr, setOperatingExpensesPctStr] = useState<string>(
    DEFAULTS.operatingExpensesPct
  );
  const [annualDebtServiceStr, setAnnualDebtServiceStr] = useState<string>(
    DEFAULTS.annualDebtService
  );
  const [holdingPeriodStr, setHoldingPeriodStr] = useState<string>(DEFAULTS.holdingPeriod);
  const [exitCapRateStr, setExitCapRateStr] = useState<string>(DEFAULTS.exitCapRate);

  const priceId = useId();
  const downId = useId();
  const debtId = useId();
  const rentId = useId();
  const vacId = useId();
  const opexId = useId();
  const holdId = useId();
  const capId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatSignedCurrency = (val: number) => {
    const rounded = Math.round(val);
    return rounded < 0 ? `-${formatWhole(Math.abs(rounded))}` : formatWhole(rounded);
  };

  const handleReset = () => {
    setPurchasePriceStr(DEFAULTS.purchasePrice);
    setDownPaymentPctStr(DEFAULTS.downPaymentPct);
    setAnnualRentStr(DEFAULTS.annualRent);
    setVacancyPctStr(DEFAULTS.vacancyPct);
    setOperatingExpensesPctStr(DEFAULTS.operatingExpensesPct);
    setAnnualDebtServiceStr(DEFAULTS.annualDebtService);
    setHoldingPeriodStr(DEFAULTS.holdingPeriod);
    setExitCapRateStr(DEFAULTS.exitCapRate);
  };

  const handleClear = () => {
    setPurchasePriceStr('');
    setDownPaymentPctStr('');
    setAnnualRentStr('');
    setVacancyPctStr('');
    setOperatingExpensesPctStr('');
    setAnnualDebtServiceStr('');
    setHoldingPeriodStr('');
    setExitCapRateStr('');
  };

  const isEmpty =
    purchasePriceStr.trim() === '' ||
    downPaymentPctStr.trim() === '' ||
    annualRentStr.trim() === '' ||
    vacancyPctStr.trim() === '' ||
    operatingExpensesPctStr.trim() === '' ||
    annualDebtServiceStr.trim() === '' ||
    holdingPeriodStr.trim() === '' ||
    exitCapRateStr.trim() === '';

  const purchasePrice = Number(purchasePriceStr);
  const downPaymentPct = Number(downPaymentPctStr);
  const annualRent = Number(annualRentStr);
  const vacancyPct = Number(vacancyPctStr);
  const operatingExpensesPct = Number(operatingExpensesPctStr);
  const annualDebtService = Number(annualDebtServiceStr);
  const holdingPeriod = Number(holdingPeriodStr);
  const exitCapRate = Number(exitCapRateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      errors.purchasePrice = `Purchase price must be greater than ${formatWhole(0)}.`;
    }
    if (!Number.isFinite(downPaymentPct) || downPaymentPct <= 0 || downPaymentPct > 100) {
      errors.downPaymentPct = 'Down payment / equity must be between 1% and 100%.';
    }
    if (!Number.isFinite(annualRent) || annualRent < 0) {
      errors.annualRent = `Gross annual rent must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(vacancyPct) || vacancyPct < 0 || vacancyPct > 100) {
      errors.vacancyPct = 'Vacancy rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(operatingExpensesPct) || operatingExpensesPct < 0 || operatingExpensesPct > 100) {
      errors.operatingExpensesPct = 'OpEx ratio must be between 0% and 100%.';
    }
    if (!Number.isFinite(annualDebtService) || annualDebtService < 0) {
      errors.annualDebtService = `Annual debt service must be ${formatWhole(0)} or greater.`;
    }
    if (!Number.isFinite(holdingPeriod) || holdingPeriod <= 0 || holdingPeriod > 100) {
      errors.holdingPeriod = 'Holding period must be between 1 and 100 years.';
    }
    if (!Number.isFinite(exitCapRate) || exitCapRate <= 0 || exitCapRate > 50) {
      errors.exitCapRate = 'Exit cap rate must be between 0.1% and 50%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let initialEquity = 0;
  let noi = 0;
  let annualCashFlow = 0;
  let cashOnCash = 0;
  let exitValue = 0;
  let equityMultiple = 0;

  if (!isEmpty && !hasErrors) {
    initialEquity = purchasePrice * (downPaymentPct / 100);
    const effectiveGrossIncome = annualRent * (1 - vacancyPct / 100);
    const operatingExpenses = effectiveGrossIncome * (operatingExpensesPct / 100);
    noi = effectiveGrossIncome - operatingExpenses;
    annualCashFlow = noi - annualDebtService;
    cashOnCash = initialEquity > 0 ? (annualCashFlow / initialEquity) * 100 : 0;

    exitValue = exitCapRate > 0 ? noi / (exitCapRate / 100) : purchasePrice;
    const totalCashFlows = annualCashFlow * holdingPeriod;
    const totalReturn =
      totalCashFlows + (exitValue - (purchasePrice - purchasePrice * (1 - downPaymentPct / 100)));
    equityMultiple = initialEquity > 0 ? (totalReturn + initialEquity) / initialEquity : 0;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `CRE Investment Summary — NOI: ${formatWhole(noi)}/yr | Annual Cash Flow: ${formatSignedCurrency(annualCashFlow)}/yr | Cash-on-Cash: ${cashOnCash.toFixed(2)}% | Equity Multiple: ${equityMultiple.toFixed(2)}x`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Acquisition, Income & Exit Assumptions"
          subtitle="Underwrite commercial real estate NOI, cash-on-cash yield, and projected equity multiple."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary">Acquisition & Financing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Purchase Price"
                htmlFor={priceId}
                unit={currencyMeta.symbol}
                error={errors.purchasePrice}
              >
                <input
                  id={priceId}
                  type="number"
                  min="0"
                  step="any"
                  value={purchasePriceStr}
                  onChange={(e) => setPurchasePriceStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="1000000"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Down Payment / Equity"
                htmlFor={downId}
                unit="%"
                error={errors.downPaymentPct}
              >
                <input
                  id={downId}
                  type="number"
                  min="1"
                  max="100"
                  step="any"
                  value={downPaymentPctStr}
                  onChange={(e) => setDownPaymentPctStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="25"
                />
              </ToolFieldGroup>
            </div>

            <ToolFieldGroup
              label="Annual Debt Service / Mortgage"
              htmlFor={debtId}
              unit={`${currencyMeta.symbol}/yr`}
              error={errors.annualDebtService}
            >
              <input
                id={debtId}
                type="number"
                min="0"
                step="any"
                value={annualDebtServiceStr}
                onChange={(e) => setAnnualDebtServiceStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="55000"
              />
            </ToolFieldGroup>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary">Income, Expenses & Exit</h3>
            <ToolFieldGroup
              label="Gross Annual Rental Income"
              htmlFor={rentId}
              unit={`${currencyMeta.symbol}/yr`}
              error={errors.annualRent}
            >
              <input
                id={rentId}
                type="number"
                min="0"
                step="any"
                value={annualRentStr}
                onChange={(e) => setAnnualRentStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="120000"
              />
            </ToolFieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label="Vacancy Rate"
                htmlFor={vacId}
                unit="%"
                error={errors.vacancyPct}
              >
                <input
                  id={vacId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={vacancyPctStr}
                  onChange={(e) => setVacancyPctStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="OpEx Ratio"
                htmlFor={opexId}
                unit="%"
                error={errors.operatingExpensesPct}
              >
                <input
                  id={opexId}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={operatingExpensesPctStr}
                  onChange={(e) => setOperatingExpensesPctStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="35"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Holding Period"
                htmlFor={holdId}
                unit="years"
                error={errors.holdingPeriod}
              >
                <input
                  id={holdId}
                  type="number"
                  min="1"
                  step="1"
                  value={holdingPeriodStr}
                  onChange={(e) => setHoldingPeriodStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="5"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Exit Cap Rate"
                htmlFor={capId}
                unit="%"
                error={errors.exitCapRate}
              >
                <input
                  id={capId}
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={exitCapRateStr}
                  onChange={(e) => setExitCapRateStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="6.5"
                />
              </ToolFieldGroup>
            </div>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="CRE Investment Summary"
          state={resultState}
          primaryLabel="Cash-on-Cash Return"
          primaryValue={`${cashOnCash.toFixed(2)}%`}
          primarySubtext={`${formatSignedCurrency(annualCashFlow)}/yr cash flow on ${formatWhole(initialEquity)} equity · ${equityMultiple.toFixed(2)}x Equity Multiple`}
          statusLabel={`${equityMultiple.toFixed(2)}x EM`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter CRE underwriting assumptions"
          emptyDescription="Provide acquisition price, equity %, gross rent, vacancy, OpEx, debt service, hold period, and exit cap."
          errorTitle="Invalid CRE parameters"
          errorMessage={Object.values(errors)[0] || 'Check acquisition price, percentages, debt service, and exit cap.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Net Operating Income (NOI)"
              value={`${formatWhole(noi)} /yr`}
            />
            <ToolMetricTile
              label="Equity Multiple"
              value={`${equityMultiple.toFixed(2)}x`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Initial Equity Required',
                value: formatWhole(initialEquity)
              },
              {
                label: 'Net Operating Income (NOI)',
                value: `${formatWhole(noi)} /yr`
              },
              {
                label: 'Annual Cash Flow',
                value: `${formatSignedCurrency(annualCashFlow)} /yr`
              },
              {
                label: 'Projected Exit Valuation',
                value: formatWhole(exitValue)
              },
              {
                label: 'Cash-on-Cash Return',
                value: `${cashOnCash.toFixed(2)}%`
              },
              {
                label: 'Equity Multiple',
                value: `${equityMultiple.toFixed(2)}x`,
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
