import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type FitnessGoal = 'muscle' | 'maintenance' | 'fat';

const DEFAULTS = {
  weightLbs: '180',
  activityLevel: 1.55,
  goal: 'muscle' as FitnessGoal,
  proteinPerLb: '1.0'
};

export default function MacroProteinCalculator() {
  const [weightStr, setWeightStr] = useState<string>(DEFAULTS.weightLbs);
  const [activityLevel, setActivityLevel] = useState<number>(DEFAULTS.activityLevel);
  const [goal, setGoal] = useState<FitnessGoal>(DEFAULTS.goal);
  const [proteinRatioStr, setProteinRatioStr] = useState<string>(DEFAULTS.proteinPerLb);

  const weightId = useId();
  const activityId = useId();
  const proteinRatioId = useId();

  const handleReset = () => {
    setWeightStr(DEFAULTS.weightLbs);
    setActivityLevel(DEFAULTS.activityLevel);
    setGoal(DEFAULTS.goal);
    setProteinRatioStr(DEFAULTS.proteinPerLb);
  };

  const handleClear = () => {
    setWeightStr('');
    setProteinRatioStr('');
  };

  const isEmpty = weightStr.trim() === '' || proteinRatioStr.trim() === '';
  const weightLbs = Number(weightStr);
  const proteinPerLb = Number(proteinRatioStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(weightLbs) || weightLbs <= 0 || weightLbs > 1000) {
      errors.weight = 'Enter a body weight between 1 and 1,000 lbs.';
    }
    if (!Number.isFinite(proteinPerLb) || proteinPerLb <= 0 || proteinPerLb > 3) {
      errors.ratio = 'Enter a protein ratio between 0.1 and 3.0 g/lb.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let dailyProteinGrams = 0;
  let proteinCalories = 0;
  let estimatedTdee = 0;
  let targetCalories = 0;

  if (!isEmpty && !hasErrors) {
    // Exact preserved formulas
    dailyProteinGrams = Math.round(weightLbs * proteinPerLb);
    proteinCalories = dailyProteinGrams * 4;
    const weightKg = weightLbs / 2.20462;
    const estimatedBmr = 10 * weightKg + 6.25 * 175 - 5 * 30 + 5;
    estimatedTdee = Math.round(estimatedBmr * activityLevel);
    targetCalories =
      goal === 'muscle' ? estimatedTdee + 300 : goal === 'fat' ? estimatedTdee - 500 : estimatedTdee;
  }

  const goalLabel =
    goal === 'muscle' ? 'Muscle Gain (Surplus)' : goal === 'fat' ? 'Fat Loss (Deficit)' : 'Maintenance';
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Daily Protein Target: ${dailyProteinGrams} grams (${proteinCalories} kcal/day) | Target Daily Calories (${goalLabel}): ${targetCalories} kcal/day | Estimated TDEE: ${estimatedTdee} kcal/day`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Body Weight, Activity & Protein Target"
          subtitle="Compute daily protein intake in grams and estimated target daily calories."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Body Weight" htmlFor={weightId} unit="Lbs" error={errors.weight}>
              <input
                id={weightId}
                type="number"
                min="1"
                step="any"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="180"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Protein Ratio"
              htmlFor={proteinRatioId}
              unit="g / lb"
              error={errors.ratio}
            >
              <input
                id={proteinRatioId}
                type="number"
                min="0.1"
                step="0.1"
                value={proteinRatioStr}
                onChange={(e) => setProteinRatioStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1.0"
              />
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup label="Activity Multiplier" htmlFor={activityId}>
            <select
              id={activityId}
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="ui-select"
            >
              <option value={1.2}>Sedentary (Little or no exercise)</option>
              <option value={1.375}>Lightly Active (1-3 days/wk)</option>
              <option value={1.55}>Moderately Active (3-5 days/wk)</option>
              <option value={1.725}>Very Active (6-7 days/wk)</option>
            </select>
          </ToolFieldGroup>

          <div className="space-y-1.5">
            <span className="ui-label block">Fitness Goal</span>
            <ToolSegmentedControl
              ariaLabel="Fitness goal"
              value={goal}
              onChange={setGoal}
              options={[
                { value: 'muscle', label: 'Muscle Gain (Surplus)' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'fat', label: 'Fat Loss (Deficit)' }
              ]}
            />
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Macro Nutrient & Protein Target Summary"
          state={resultState}
          primaryLabel="Daily Protein Target"
          primaryValue={`${dailyProteinGrams}`}
          primaryUnit="grams"
          primarySubtext={`${proteinCalories} kcal / day from protein (${targetCalories} kcal target total)`}
          statusLabel={goalLabel}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter body weight and protein ratio"
          emptyDescription="Provide your body weight in pounds and desired grams per pound to calculate daily protein targets."
          errorTitle="Invalid input values"
          errorMessage={Object.values(errors)[0] || 'Check body weight and protein ratio values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Protein Calories" value={`${proteinCalories} kcal`} hint="per day (4 kcal/g)" />
            <ToolMetricTile label="Target Daily Calories" value={`${targetCalories} kcal`} hint="per day" accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Daily Protein Target', value: `${dailyProteinGrams} grams`, highlight: true },
              { label: 'Protein Calories', value: `${proteinCalories} kcal / day` },
              { label: 'Estimated Maintenance (TDEE)', value: `${estimatedTdee} kcal / day` },
              { label: 'Target Daily Calories', value: `${targetCalories} kcal / day` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
