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

const DEFAULTS = {
  gender: 'male' as 'male' | 'female',
  age: '30',
  heightCm: '178',
  weightKg: '75',
  activity: 1.375
};

export default function BmrCalorieCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>(DEFAULTS.gender);
  const [ageStr, setAgeStr] = useState<string>(DEFAULTS.age);
  const [heightStr, setHeightStr] = useState<string>(DEFAULTS.heightCm);
  const [weightStr, setWeightStr] = useState<string>(DEFAULTS.weightKg);
  const [activity, setActivity] = useState<number>(DEFAULTS.activity);

  const ageId = useId();
  const heightCmId = useId();
  const weightKgId = useId();
  const activitySelectId = useId();

  const handleReset = () => {
    setGender(DEFAULTS.gender);
    setAgeStr(DEFAULTS.age);
    setHeightStr(DEFAULTS.heightCm);
    setWeightStr(DEFAULTS.weightKg);
    setActivity(DEFAULTS.activity);
  };

  const handleClear = () => {
    setAgeStr('');
    setHeightStr('');
    setWeightStr('');
  };

  const isEmpty = ageStr.trim() === '' || heightStr.trim() === '' || weightStr.trim() === '';
  const age = Number(ageStr);
  const heightCm = Number(heightStr);
  const weightKg = Number(weightStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(age) || age < 1 || age > 120) {
      errors.age = 'Enter an age between 1 and 120.';
    }
    if (!Number.isFinite(heightCm) || heightCm <= 0 || heightCm > 300) {
      errors.height = 'Enter a height between 1 and 300 cm.';
    }
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
      errors.weight = 'Enter a weight between 1 and 500 kg.';
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  // Exact Mifflin-St Jeor formula preserved
  let bmr = 0;
  if (!isEmpty && !hasErrors) {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
  }

  const tdee = Math.round(bmr * activity);
  const roundedBmr = Math.round(bmr);
  const mildWeightLoss = Math.round(tdee - 250);
  const weightLoss = Math.round(tdee - 500);
  const weightGain = Math.round(tdee + 400);

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `TDEE (Maintenance): ${tdee.toLocaleString()} kcal/day | BMR: ${roundedBmr} kcal/day | Weight Loss (-500): ${weightLoss} kcal | Mild Loss (-250): ${mildWeightLoss} kcal | Muscle Gain (+400): ${weightGain} kcal`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Personal Profile"
          subtitle="Estimate Basal Metabolic Rate (Mifflin-St Jeor) and daily maintenance calories (TDEE)."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="ui-label">Biological Gender</span>
            <ToolSegmentedControl
              ariaLabel="Biological gender"
              value={gender}
              onChange={setGender}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup label="Age" htmlFor={ageId} unit="yrs" error={errors.age}>
              <input
                id={ageId}
                type="number"
                min="14"
                max="100"
                value={ageStr}
                onChange={(e) => setAgeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Height" htmlFor={heightCmId} unit="cm" error={errors.height}>
              <input
                id={heightCmId}
                type="number"
                min="100"
                max="230"
                value={heightStr}
                onChange={(e) => setHeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="178"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label="Weight" htmlFor={weightKgId} unit="kg" error={errors.weight}>
              <input
                id={weightKgId}
                type="number"
                min="35"
                max="250"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="75"
              />
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup label="Activity Level" htmlFor={activitySelectId}>
            <select
              id={activitySelectId}
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="ui-select"
            >
              <option value={1.2}>Sedentary (Little or no exercise)</option>
              <option value={1.375}>Lightly active (Exercise 1-3 days/week)</option>
              <option value={1.55}>Moderately active (Exercise 3-5 days/week)</option>
              <option value={1.725}>Very active (Hard exercise 6-7 days/week)</option>
              <option value={1.9}>Extra active (Intense training / physical job)</option>
            </select>
          </ToolFieldGroup>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Daily Calorie Targets"
          state={resultState}
          primaryLabel="Maintenance Calories (TDEE)"
          primaryValue={tdee.toLocaleString()}
          primaryUnit="kcal / day"
          primarySubtext={`Basal Metabolic Rate (BMR): ${roundedBmr} kcal (calories burned at rest)`}
          copyText={copyText}
          emptyTitle="Enter profile measurements"
          emptyDescription="Provide age, height, and weight to estimate BMR and daily calorie targets."
          errorTitle="Invalid measurements"
          errorMessage={Object.values(errors)[0] || 'Check age, height, and weight values.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Basal Metabolic Rate (BMR)" value={`${roundedBmr} kcal`} />
            <ToolMetricTile label="Weight Loss (-500)" value={`${weightLoss} kcal`} hint="-0.5 kg/week" accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Weight Loss (-0.5 kg/week · -500 kcal)', value: `${weightLoss} kcal`, highlight: true },
              { label: 'Mild Weight Loss (-0.25 kg/week · -250 kcal)', value: `${mildWeightLoss} kcal` },
              { label: 'Muscle Gain / Surplus (+400 kcal)', value: `${weightGain} kcal` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
