import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';
import type { UiStatusTone } from '../ui/AppPrimitives.tsx';

type UnitSystem = 'metric' | 'imperial';

const DEFAULTS = {
  metric: { heightCm: '175', weightKg: '70' },
  imperial: { heightFt: '5', heightIn: '9', weightLbs: '154' }
};

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [heightCm, setHeightCm] = useState<string>(DEFAULTS.metric.heightCm);
  const [weightKg, setWeightKg] = useState<string>(DEFAULTS.metric.weightKg);
  const [heightFt, setHeightFt] = useState<string>(DEFAULTS.imperial.heightFt);
  const [heightIn, setHeightIn] = useState<string>(DEFAULTS.imperial.heightIn);
  const [weightLbs, setWeightLbs] = useState<string>(DEFAULTS.imperial.weightLbs);

  const heightCmId = useId();
  const weightKgId = useId();
  const heightFtId = useId();
  const heightInId = useId();
  const weightLbsId = useId();

  // Validation & parsing
  const errors: Record<string, string> = {};
  let isEmpty = false;
  let bmi = 0;
  let minIdealWeight = 0;
  let maxIdealWeight = 0;

  if (unit === 'metric') {
    if (heightCm.trim() === '' || weightKg.trim() === '') {
      isEmpty = true;
    } else {
      const hCm = Number(heightCm);
      const wKg = Number(weightKg);
      if (!Number.isFinite(hCm) || hCm <= 0 || hCm > 300) {
        errors.heightCm = 'Enter a height between 1 and 300 cm.';
      }
      if (!Number.isFinite(wKg) || wKg <= 0 || wKg > 500) {
        errors.weightKg = 'Enter a weight between 1 and 500 kg.';
      }
      if (Object.keys(errors).length === 0) {
        const heightM = hCm / 100;
        bmi = wKg / (heightM * heightM);
        minIdealWeight = Number((18.5 * heightM * heightM).toFixed(1));
        maxIdealWeight = Number((24.9 * heightM * heightM).toFixed(1));
      }
    }
  } else {
    if (heightFt.trim() === '' || weightLbs.trim() === '') {
      isEmpty = true;
    } else {
      const hFt = Number(heightFt);
      const hIn = heightIn.trim() === '' ? 0 : Number(heightIn);
      const wLbs = Number(weightLbs);
      if (!Number.isFinite(hFt) || hFt < 1 || hFt > 9) {
        errors.heightFt = 'Enter feet between 1 and 9.';
      }
      if (!Number.isFinite(hIn) || hIn < 0 || hIn >= 12) {
        errors.heightIn = 'Enter inches between 0 and 11.9.';
      }
      if (!Number.isFinite(wLbs) || wLbs <= 0 || wLbs > 1100) {
        errors.weightLbs = 'Enter a weight between 1 and 1,100 lbs.';
      }
      if (Object.keys(errors).length === 0) {
        const totalInches = hFt * 12 + hIn;
        if (totalInches > 0) {
          bmi = (wLbs * 703) / (totalInches * totalInches);
          minIdealWeight = Number(((18.5 * totalInches * totalInches) / 703).toFixed(1));
          maxIdealWeight = Number(((24.9 * totalInches * totalInches) / 703).toFixed(1));
        }
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  const roundedBmi = Number.isFinite(bmi) && bmi > 0 ? Number(bmi.toFixed(1)) : 0;

  // WHO Classification (exact thresholds preserved)
  let category = 'Normal weight';
  let statusTone: UiStatusTone = 'success';
  if (roundedBmi < 18.5) {
    category = 'Underweight';
    statusTone = 'warning';
  } else if (roundedBmi >= 18.5 && roundedBmi < 25) {
    category = 'Normal weight';
    statusTone = 'success';
  } else if (roundedBmi >= 25 && roundedBmi < 30) {
    category = 'Overweight';
    statusTone = 'warning';
  } else {
    category = 'Obese';
    statusTone = 'error';
  }

  // Gauge indicator position (maps BMI 14..40 to 0%..100%)
  const markerPercent = Math.max(0, Math.min(100, ((roundedBmi - 14) / (40 - 14)) * 100));

  const weightUnitLabel = unit === 'metric' ? 'kg' : 'lbs';
  const currentWeightNum = unit === 'metric' ? Number(weightKg) : Number(weightLbs);
  const deltaToHealthy =
    !isEmpty && !hasErrors && Number.isFinite(currentWeightNum)
      ? currentWeightNum < minIdealWeight
        ? `+${(minIdealWeight - currentWeightNum).toFixed(1)} ${weightUnitLabel} to reach 18.5 BMI`
        : currentWeightNum > maxIdealWeight
          ? `-${(currentWeightNum - maxIdealWeight).toFixed(1)} ${weightUnitLabel} to reach 24.9 BMI`
          : 'Within the WHO healthy weight range'
      : '';

  const handleReset = () => {
    setHeightCm(DEFAULTS.metric.heightCm);
    setWeightKg(DEFAULTS.metric.weightKg);
    setHeightFt(DEFAULTS.imperial.heightFt);
    setHeightIn(DEFAULTS.imperial.heightIn);
    setWeightLbs(DEFAULTS.imperial.weightLbs);
  };

  const handleClear = () => {
    if (unit === 'metric') {
      setHeightCm('');
      setWeightKg('');
    } else {
      setHeightFt('');
      setHeightIn('');
      setWeightLbs('');
    }
  };

  const resultState: 'ready' | 'empty' | 'error' = hasErrors
    ? 'error'
    : isEmpty || roundedBmi <= 0
      ? 'empty'
      : 'ready';

  const copySummary = `BMI: ${roundedBmi} kg/m² (${category}) | Healthy weight range: ${minIdealWeight}–${maxIdealWeight} ${weightUnitLabel}`;

  const heightSliderVal = Math.min(220, Math.max(120, Number(heightCm) || 175));
  const weightSliderVal = Math.min(160, Math.max(30, Number(weightKg) || 70));

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Measurements"
          subtitle="Select your preferred unit system and enter height and weight."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="ui-label">Unit system</span>
            <ToolSegmentedControl
              ariaLabel="BMI unit system"
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'metric', label: 'Metric (cm, kg)' },
                { value: 'imperial', label: 'Imperial (ft, in, lbs)' }
              ]}
            />
          </div>

          {unit === 'metric' ? (
            <div className="space-y-4">
              <ToolFieldGroup
                label="Height"
                htmlFor={heightCmId}
                unit="cm"
                error={errors.heightCm}
              >
                <input
                  id={heightCmId}
                  type="number"
                  min={50}
                  max={250}
                  step="any"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  className="ui-input font-mono tabular-nums"
                />
                <input
                  type="range"
                  aria-label="Height slider in centimeters"
                  min={120}
                  max={220}
                  value={heightSliderVal}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full mt-2 accent-accent cursor-pointer"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label="Weight"
                htmlFor={weightKgId}
                unit="kg"
                error={errors.weightKg}
              >
                <input
                  id={weightKgId}
                  type="number"
                  min={20}
                  max={300}
                  step="any"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                  className="ui-input font-mono tabular-nums"
                />
                <input
                  type="range"
                  aria-label="Weight slider in kilograms"
                  min={30}
                  max={160}
                  value={weightSliderVal}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full mt-2 accent-accent cursor-pointer"
                />
              </ToolFieldGroup>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolFieldGroup
                  label="Height (Feet)"
                  htmlFor={heightFtId}
                  unit="ft"
                  error={errors.heightFt}
                >
                  <input
                    id={heightFtId}
                    type="number"
                    min={1}
                    max={9}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="5"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup
                  label="Height (Inches)"
                  htmlFor={heightInId}
                  unit="in"
                  error={errors.heightIn}
                >
                  <input
                    id={heightInId}
                    type="number"
                    min={0}
                    max={11}
                    step="any"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="9"
                    className="ui-input font-mono tabular-nums"
                  />
                </ToolFieldGroup>
              </div>

              <ToolFieldGroup
                label="Weight"
                htmlFor={weightLbsId}
                unit="lbs"
                error={errors.weightLbs}
              >
                <input
                  id={weightLbsId}
                  type="number"
                  min={50}
                  max={600}
                  step="any"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="154"
                  className="ui-input font-mono tabular-nums"
                />
              </ToolFieldGroup>
            </div>
          )}

          <ToolPresetBar
            label="Quick examples:"
            presets={[
              {
                label: '175 cm · 70 kg',
                onSelect: () => {
                  setUnit('metric');
                  setHeightCm('175');
                  setWeightKg('70');
                }
              },
              {
                label: '165 cm · 58 kg',
                onSelect: () => {
                  setUnit('metric');
                  setHeightCm('165');
                  setWeightKg('58');
                }
              },
              {
                label: "5'9\" · 154 lbs",
                onSelect: () => {
                  setUnit('imperial');
                  setHeightFt('5');
                  setHeightIn('9');
                  setWeightLbs('154');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="BMI Result"
          state={resultState}
          primaryLabel="Body Mass Index"
          primaryValue={roundedBmi.toFixed(1)}
          primaryUnit="kg/m²"
          primarySubtext={deltaToHealthy}
          statusLabel={category}
          statusTone={statusTone}
          copyText={copySummary}
          emptyTitle="Enter height and weight"
          emptyDescription="Provide both height and weight on the left to calculate your BMI and healthy weight range."
          errorTitle="Invalid measurement"
          errorMessage={Object.values(errors)[0] || 'Check your measurement values and try again.'}
        >
          {/* Live WHO BMI Spectrum Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-text-tertiary">
              <span>Under (&lt;18.5)</span>
              <span>Normal (18.5–24.9)</span>
              <span>Over (25–29.9)</span>
              <span>Obese (30+)</span>
            </div>
            <div className="relative pt-1 pb-1">
              <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-surface-secondary border border-border-subtle">
                <div className="bg-amber-400/90 w-[17.3%] h-full" />
                <div className="bg-emerald-500 w-[25%] h-full" />
                <div className="bg-orange-400/90 w-[19.2%] h-full" />
                <div className="bg-rose-500 flex-1 h-full" />
              </div>
              <div
                aria-hidden="true"
                style={{ left: `${markerPercent}%` }}
                className="absolute top-0 -translate-x-1/2 w-3.5 h-4.5 rounded-sm bg-text-primary border-2 border-surface shadow-xs transition-all duration-200"
              />
            </div>
          </div>

          {/* Secondary Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label="Healthy Weight Range"
              value={`${minIdealWeight} – ${maxIdealWeight} ${weightUnitLabel}`}
              hint="BMI 18.5 to 24.9"
              accent
            />
            <ToolMetricTile
              label="Reference Standard"
              value="WHO / CDC"
              hint="Adult BMI classification"
            />
          </div>

          <ToolBreakdownList
            items={[
              { label: 'Underweight', value: '< 18.5 kg/m²' },
              { label: 'Normal weight', value: '18.5 – 24.9 kg/m²', highlight: category === 'Normal weight' },
              { label: 'Overweight', value: '25.0 – 29.9 kg/m²', highlight: category === 'Overweight' },
              { label: 'Obese', value: '≥ 30.0 kg/m²', highlight: category === 'Obese' }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
