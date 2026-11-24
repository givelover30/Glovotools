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
  principal: '10000',
  annualRate: '7',
  years: '10',
  compoundFreq: 12,
  monthlyContribution: '200'
};

export default function CompoundInterestCalculator() {
  const { currency, formatCurrency: fmtCurrency } = useCurrency();
  const [principalStr, setPrincipalStr] = useState<string>(DEFAULTS.principal);
  const [annualRateStr, setAnnualRateStr] = useState<string>(DEFAULTS.annualRate);
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);
  const [compoundFreq, setCompoundFreq] = useState<number>(DEFAULTS.compoundFreq);
  const [monthlyStr, setMonthlyStr] = useState<string>(DEFAULTS.monthlyContribution);

  const principalId = useId();
  const rateId = useId();
  const yearsId = useId();
  const monthlyId = useId();
  const freqId = useId();

  const handleReset = () => {
    setPrincipalStr(DEFAULTS.principal);
    setAnnualRateStr(DEFAULTS.annualRate);
    setYearsStr(DEFAULTS.years);
    setCompoundFreq(DEFAULTS.compoundFreq);
    setMonthlyStr(DEFAULTS.monthlyContribution);
  };

  const handleClear = () => {
    setPrincipalStr('');
    setAnnualRateStr('');
    setYearsStr('');
    setMonthlyStr('');
  };

  const isEmpty =
    principalStr.trim() === '' ||
    annualRateStr.trim() === '' ||
    yearsStr.trim() === '' ||
    monthlyStr.trim() === '';

  const errors: Record<string, string> = {};
  const principal = Number(principalStr);
  const annualRate = Number(annualRateStr);
  const years = Number(yearsStr);
  const monthlyContribution = Number(monthlyStr);

  if (!isEmpty) {
    if (!Number.isFinite(principal) || principal < 0) {
      errors.principal = 'Initial principal must be 0 or greater.';
    }
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100) {
      errors.annualRate = 'Annual interest rate must be between 0% and 100%.';
    }
    if (!Number.isFinite(years) || years < 1 || years > 100) {
      errors.years = 'Investment horizon must be between 1 and 100 years.';
    }
    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      errors.monthly = 'Monthly addition must be 0 or greater.';
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  let finalBalance = 0;
  let totalPrincipalDeposited = 0;
  let totalInterestEarned = 0;
  let growthMultiplier = 0;

  if (!isEmpty && !hasErrors) {
    // Exact preserved formula:
    // A = P(1 + r/n)^(nt) + PMT * [ ((1 + r/12)^(12t) - 1) / (r/12) ]
    const r = annualRate / 100;
    const n = compoundFreq;
    const t = years;

    const baseGrowth = principal * Math.pow(1 + r / n, n * t);
    const ratePerPeriod = r / 12;
    const totalMonths = t * 12;

    const contributionGrowth =
      ratePerPeriod > 0
        ? monthlyContribution * ((Math.pow(1 + ratePerPeriod, totalMonths) - 1) / ratePerPeriod)
        : monthlyContribution * totalMonths;

    finalBalance = baseGrowth + contributionGrowth;
    totalPrincipalDeposited = principal + monthlyContribution * totalMonths;
    totalInterestEarned = Math.max(0, finalBalance - totalPrincipalDeposited);
    growthMultiplier = totalPrincipalDeposited > 0 ? finalBalance / totalPrincipalDeposited : 0;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Future Total Balance: ${fmtCurrency(finalBalance)} | Total Principal Invested: ${fmtCurrency(totalPrincipalDeposited)} | Compound Interest Earned: +${fmtCurrency(totalInterestEarned)} | Growth Multiplier: ${growthMultiplier.toFixed(2)}x`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Investment Variables"
          subtitle="Project future portfolio value with recurring monthly contributions and compounding."
          onReset={handleReset}
          onClear={handleClear}
        >
          <ToolFieldGroup label="Initial Principal" htmlFor={principalId} unit={currency} error={errors.principal}>
            <input
              id={principalId}
              type="number"
              min="0"
              step="500"
              value={principalStr}
              onChange={(e) => setPrincipalStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="10000"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Annual Interest Rate" htmlFor={rateId} unit="%" error={errors.annualRate}>
              <input
                id={rateId}
                type="number"
                min="0"
                step="0.25"
                value={annualRateStr}
                onChange={(e) => setAnnualRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="7"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Investment Horizon" htmlFor={yearsId} unit="Years" error={errors.years}>
              <input
                id={yearsId}
                type="number"
                min="1"
                max="100"
                value={yearsStr}
                onChange={(e) => setYearsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="10"
              />
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup label="Monthly Addition" htmlFor={monthlyId} unit={`${currency} / mo`} error={errors.monthly}>
            <input
              id={monthlyId}
              type="number"
              min="0"
              step="50"
              value={monthlyStr}
              onChange={(e) => setMonthlyStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="200"
            />
          </ToolFieldGroup>

          <ToolFieldGroup label="Compounding Frequency" htmlFor={freqId}>
            <select
              id={freqId}
              value={compoundFreq}
              onChange={(e) => setCompoundFreq(Number(e.target.value))}
              className="ui-select"
            >
              <option value={365}>Daily (365 times/year)</option>
              <option value={12}>Monthly (12 times/year)</option>
              <option value={4}>Quarterly (4 times/year)</option>
              <option value={1}>Annually (1 time/year)</option>
            </select>
          </ToolFieldGroup>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Projected Growth"
          state={resultState}
          primaryLabel="Future Total Balance"
          primaryValue={fmtCurrency(finalBalance)}
          primarySubtext={`After ${years} years at ${annualRate}% annual rate`}
          statusLabel={`${growthMultiplier.toFixed(2)}x growth`}
          statusTone="success"
          copyText={copyText}
          emptyTitle="Enter investment variables"
          emptyDescription="Provide principal, interest rate, time horizon, and monthly addition to project compound growth."
          errorTitle="Invalid investment inputs"
          errorMessage={Object.values(errors)[0] || 'Check your investment inputs.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Total Principal Invested" value={fmtCurrency(totalPrincipalDeposited)} />
            <ToolMetricTile label="Compound Interest Earned" value={`+${fmtCurrency(totalInterestEarned)}`} accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Total Principal Invested', value: fmtCurrency(totalPrincipalDeposited) },
              { label: 'Compound Interest Earned', value: `+${fmtCurrency(totalInterestEarned)}`, highlight: true },
              { label: 'Interest Growth Multiplier', value: `${growthMultiplier.toFixed(2)}x` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
