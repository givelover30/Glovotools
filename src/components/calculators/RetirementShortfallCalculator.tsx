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
  currentAge: '30',
  retirementAge: '65',
  currentSavings: '50000',
  monthlySavings: '600',
  targetNestEgg: '1200000',
  expectedReturn: '7'
};

export default function RetirementShortfallCalculator() {
  const { currency, currencyMeta, formatCurrency } = useCurrency();
  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const [currentAgeStr, setCurrentAgeStr] = useState<string>(DEFAULTS.currentAge);
  const [retirementAgeStr, setRetirementAgeStr] = useState<string>(DEFAULTS.retirementAge);
  const [currentSavingsStr, setCurrentSavingsStr] = useState<string>(DEFAULTS.currentSavings);
  const [monthlySavingsStr, setMonthlySavingsStr] = useState<string>(DEFAULTS.monthlySavings);
  const [targetNestEggStr, setTargetNestEggStr] = useState<string>(DEFAULTS.targetNestEgg);
  const [expectedReturnStr, setExpectedReturnStr] = useState<string>(DEFAULTS.expectedReturn);

  const curAgeId = useId();
  const retAgeId = useId();
  const curSavId = useId();
  const moSavId = useId();
  const targetId = useId();
  const retRateId = useId();

  const handleReset = () => {
    setCurrentAgeStr(DEFAULTS.currentAge);
    setRetirementAgeStr(DEFAULTS.retirementAge);
    setCurrentSavingsStr(DEFAULTS.currentSavings);
    setMonthlySavingsStr(DEFAULTS.monthlySavings);
    setTargetNestEggStr(DEFAULTS.targetNestEgg);
    setExpectedReturnStr(DEFAULTS.expectedReturn);
  };

  const handleClear = () => {
    setCurrentAgeStr('');
    setRetirementAgeStr('');
    setCurrentSavingsStr('');
    setMonthlySavingsStr('');
    setTargetNestEggStr('');
    setExpectedReturnStr('');
  };

  const isEmpty =
    currentAgeStr.trim() === '' ||
    retirementAgeStr.trim() === '' ||
    currentSavingsStr.trim() === '' ||
    monthlySavingsStr.trim() === '' ||
    targetNestEggStr.trim() === '' ||
    expectedReturnStr.trim() === '';

  const currentAge = Number(currentAgeStr);
  const retirementAge = Number(retirementAgeStr);
  const currentSavings = Number(currentSavingsStr);
  const monthlySavings = Number(monthlySavingsStr);
  const targetNestEgg = Number(targetNestEggStr);
  const expectedReturn = Number(expectedReturnStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(currentAge) || currentAge < 0 || currentAge > 120) {
      errors.currentAge = 'Current age must be between 0 and 120.';
    }
    if (!Number.isFinite(retirementAge) || retirementAge < 0 || retirementAge > 120) {
      errors.retirementAge = 'Retirement age must be between 0 and 120.';
    } else if (Number.isFinite(currentAge) && retirementAge < currentAge) {
      errors.retirementAge = 'Retirement age must be greater than or equal to current age.';
    }
    if (!Number.isFinite(currentSavings) || currentSavings < 0) {
      errors.currentSavings = `Current savings must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(monthlySavings) || monthlySavings < 0) {
      errors.monthlySavings = `Monthly savings addition must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(targetNestEgg) || targetNestEgg < 0) {
      errors.targetNestEgg = `Target nest egg must be ${currencyMeta.symbol}0 or greater.`;
    }
    if (!Number.isFinite(expectedReturn) || expectedReturn < 0 || expectedReturn > 50) {
      errors.expectedReturn = 'Expected return must be between 0% and 50%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let yearsToRetire = 0;
  let projectedNestEgg = 0;
  let shortfall = 0;
  let surplus = 0;

  if (!isEmpty && !hasErrors) {
    yearsToRetire = Math.max(0, retirementAge - currentAge);
    const months = yearsToRetire * 12;
    const r = expectedReturn / 100 / 12;

    const principalFuture = currentSavings * Math.pow(1 + r, months);
    const contribFuture =
      r === 0 ? monthlySavings * months : monthlySavings * ((Math.pow(1 + r, months) - 1) / r);
    projectedNestEgg = principalFuture + contribFuture;
    shortfall = Math.max(0, targetNestEgg - projectedNestEgg);
    surplus = Math.max(0, projectedNestEgg - targetNestEgg);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Retirement Gap Analysis (${yearsToRetire} yrs) — Projected Nest Egg: ${formatWhole(projectedNestEgg)} | Target: ${formatWhole(targetNestEgg)} | Savings Shortfall / Gap: ${formatWhole(shortfall)}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Retirement Parameters"
          subtitle="Project your future retirement nest egg and identify any funding gap."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Current Age" htmlFor={curAgeId} unit="yrs" error={errors.currentAge}>
              <input
                id={curAgeId}
                type="number"
                min="0"
                step="1"
                value={currentAgeStr}
                onChange={(e) => setCurrentAgeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Retirement Age"
              htmlFor={retAgeId}
              unit="yrs"
              error={errors.retirementAge}
            >
              <input
                id={retAgeId}
                type="number"
                min="0"
                step="1"
                value={retirementAgeStr}
                onChange={(e) => setRetirementAgeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="65"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Current Savings"
              htmlFor={curSavId}
              unit={currency}
              error={errors.currentSavings}
            >
              <input
                id={curSavId}
                type="number"
                min="0"
                step="any"
                value={currentSavingsStr}
                onChange={(e) => setCurrentSavingsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="50000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Monthly Savings Addition"
              htmlFor={moSavId}
              unit={`${currency}/mo`}
              error={errors.monthlySavings}
            >
              <input
                id={moSavId}
                type="number"
                min="0"
                step="any"
                value={monthlySavingsStr}
                onChange={(e) => setMonthlySavingsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="600"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Target Retirement Nest Egg"
              htmlFor={targetId}
              unit={currency}
              error={errors.targetNestEgg}
            >
              <input
                id={targetId}
                type="number"
                min="0"
                step="any"
                value={targetNestEggStr}
                onChange={(e) => setTargetNestEggStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1200000"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Expected Annual Return"
              htmlFor={retRateId}
              unit="%"
              error={errors.expectedReturn}
            >
              <input
                id={retRateId}
                type="number"
                min="0"
                step="0.1"
                value={expectedReturnStr}
                onChange={(e) => setExpectedReturnStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="7.0"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Gap Analysis"
          state={resultState}
          primaryLabel="Savings Shortfall / Gap"
          primaryValue={formatWhole(shortfall)}
          primarySubtext={
            shortfall === 0
              ? `On track with ${formatWhole(surplus)} projected surplus over ${yearsToRetire} years`
              : `Projected shortfall after ${yearsToRetire} years of saving at ${expectedReturn}%`
          }
          statusLabel={shortfall === 0 ? 'On Track' : 'Funding Gap'}
          statusTone={shortfall === 0 ? 'success' : 'error'}
          copyText={copyText}
          emptyTitle="Enter retirement parameters"
          emptyDescription="Provide ages, savings, target nest egg, and expected return to evaluate your retirement gap."
          errorTitle="Invalid retirement inputs"
          errorMessage={Object.values(errors)[0] || 'Check ages, savings, target, and expected return.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Projected Nest Egg"
              value={formatWhole(projectedNestEgg)}
              accent={shortfall === 0}
            />
            <ToolMetricTile
              label="Target Nest Egg"
              value={formatWhole(targetNestEgg)}
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Years Until Retirement', value: `${yearsToRetire} years` },
              {
                label: 'Projected Nest Egg',
                value: formatWhole(projectedNestEgg)
              },
              {
                label: 'Target Nest Egg',
                value: formatWhole(targetNestEgg)
              },
              {
                label: 'Savings Shortfall / Gap',
                value: formatWhole(shortfall),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
