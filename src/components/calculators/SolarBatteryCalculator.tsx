import { useId, useState } from 'react';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULTS = {
  dailyKwh: '30',
  peakSunHours: '4.5',
  systemEfficiency: '80',
  autonomyDays: '1',
  depthOfDischarge: '80'
};

export default function SolarBatteryCalculator() {
  const [dailyKwhStr, setDailyKwhStr] = useState<string>(DEFAULTS.dailyKwh);
  const [peakSunHoursStr, setPeakSunHoursStr] = useState<string>(DEFAULTS.peakSunHours);
  const [systemEfficiencyStr, setSystemEfficiencyStr] = useState<string>(DEFAULTS.systemEfficiency);
  const [autonomyDaysStr, setAutonomyDaysStr] = useState<string>(DEFAULTS.autonomyDays);
  const [depthOfDischargeStr, setDepthOfDischargeStr] = useState<string>(DEFAULTS.depthOfDischarge);

  const kwhId = useId();
  const sunId = useId();
  const effId = useId();
  const autonomyId = useId();
  const dodId = useId();

  const handleReset = () => {
    setDailyKwhStr(DEFAULTS.dailyKwh);
    setPeakSunHoursStr(DEFAULTS.peakSunHours);
    setSystemEfficiencyStr(DEFAULTS.systemEfficiency);
    setAutonomyDaysStr(DEFAULTS.autonomyDays);
    setDepthOfDischargeStr(DEFAULTS.depthOfDischarge);
  };

  const handleClear = () => {
    setDailyKwhStr('');
    setPeakSunHoursStr('');
    setSystemEfficiencyStr('');
    setAutonomyDaysStr('');
    setDepthOfDischargeStr('');
  };

  const isEmpty =
    dailyKwhStr.trim() === '' ||
    peakSunHoursStr.trim() === '' ||
    systemEfficiencyStr.trim() === '' ||
    autonomyDaysStr.trim() === '' ||
    depthOfDischargeStr.trim() === '';

  const dailyKwh = Number(dailyKwhStr);
  const peakSunHours = Number(peakSunHoursStr);
  const systemEfficiency = Number(systemEfficiencyStr);
  const autonomyDays = Number(autonomyDaysStr);
  const depthOfDischarge = Number(depthOfDischargeStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(dailyKwh) || dailyKwh <= 0) {
      errors.dailyKwh = 'Average daily electricity usage must be greater than 0 kWh.';
    }
    if (!Number.isFinite(peakSunHours) || peakSunHours <= 0 || peakSunHours > 24) {
      errors.peakSunHours = 'Average peak sun hours must be between 0.1 and 24 hours/day.';
    }
    if (!Number.isFinite(systemEfficiency) || systemEfficiency <= 0 || systemEfficiency > 100) {
      errors.systemEfficiency = 'System efficiency must be between 1% and 100%.';
    }
    if (!Number.isFinite(autonomyDays) || autonomyDays < 0) {
      errors.autonomyDays = 'Desired days of autonomy must be 0 or greater.';
    }
    if (!Number.isFinite(depthOfDischarge) || depthOfDischarge <= 0 || depthOfDischarge > 100) {
      errors.depthOfDischarge = 'Battery depth of discharge (DoD) must be between 1% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let requiredSolarKw = 0;
  let requiredBatteryKwh = 0;
  let estimatedPanels400w = 0;

  if (!isEmpty && !hasErrors) {
    requiredSolarKw = dailyKwh / peakSunHours / (systemEfficiency / 100);
    requiredBatteryKwh = (dailyKwh * autonomyDays) / (depthOfDischarge / 100);
    estimatedPanels400w = Math.ceil((requiredSolarKw * 1000) / 400);
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Solar & Battery Sizing Summary — Recommended Solar Capacity: ${requiredSolarKw.toFixed(2)} kW | Est. 400W Panels: ${estimatedPanels400w} panels | Required Battery Storage: ${requiredBatteryKwh.toFixed(1)} kWh`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Solar Array & Battery Backup Parameters"
          subtitle="Size your photovoltaic array and backup energy storage using daily consumption and peak sun hours."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Daily Electricity Usage"
              htmlFor={kwhId}
              unit="kWh/day"
              error={errors.dailyKwh}
            >
              <input
                id={kwhId}
                type="number"
                min="0"
                step="any"
                value={dailyKwhStr}
                onChange={(e) => setDailyKwhStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Peak Sun Hours"
              htmlFor={sunId}
              unit="hrs/day"
              error={errors.peakSunHours}
            >
              <input
                id={sunId}
                type="number"
                min="0"
                step="0.1"
                value={peakSunHoursStr}
                onChange={(e) => setPeakSunHoursStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4.5"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="System Efficiency"
              htmlFor={effId}
              unit="%"
              error={errors.systemEfficiency}
            >
              <input
                id={effId}
                type="number"
                min="1"
                max="100"
                step="any"
                value={systemEfficiencyStr}
                onChange={(e) => setSystemEfficiencyStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="80"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Desired Days of Autonomy"
              htmlFor={autonomyId}
              unit="days"
              error={errors.autonomyDays}
            >
              <input
                id={autonomyId}
                type="number"
                min="0"
                step="any"
                value={autonomyDaysStr}
                onChange={(e) => setAutonomyDaysStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Battery Depth of Discharge (DoD)"
              htmlFor={dodId}
              unit="%"
              error={errors.depthOfDischarge}
            >
              <input
                id={dodId}
                type="number"
                min="1"
                max="100"
                step="any"
                value={depthOfDischargeStr}
                onChange={(e) => setDepthOfDischargeStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="80"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">NREL Methodology:</strong> Sizing follows National
            Renewable Energy Laboratory photovoltaic guidelines.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Solar & Battery Sizing Summary"
          state={resultState}
          primaryLabel="Recommended Solar Capacity"
          primaryValue={`${requiredSolarKw.toFixed(2)} kW`}
          primarySubtext={`Approx. ${estimatedPanels400w} panels (400W) with ${requiredBatteryKwh.toFixed(1)} kWh battery bank`}
          statusLabel={`${estimatedPanels400w} Panels`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter energy & sun parameters"
          emptyDescription="Provide daily kWh usage, peak sun hours, system efficiency, autonomy days, and battery DoD."
          errorTitle="Invalid solar sizing inputs"
          errorMessage={Object.values(errors)[0] || 'Check daily load, sun hours, and efficiency.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Est. 400W Solar Panels"
              value={`${estimatedPanels400w} panels`}
            />
            <ToolMetricTile
              label="Required Battery Storage"
              value={`${requiredBatteryKwh.toFixed(1)} kWh`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Recommended Solar Capacity',
                value: `${requiredSolarKw.toFixed(2)} kW`,
                highlight: true
              },
              {
                label: 'Est. 400W Solar Panels',
                value: `${estimatedPanels400w} panels`
              },
              {
                label: 'Required Battery Storage',
                value: `${requiredBatteryKwh.toFixed(1)} kWh`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
