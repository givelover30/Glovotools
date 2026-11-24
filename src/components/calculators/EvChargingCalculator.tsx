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
  batteryCapacity: '75',
  currentSoc: '20',
  targetSoc: '80',
  chargerPower: '11',
  electricityRate: '0.15',
  efficiency: '90'
};

export default function EvChargingCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [batteryCapacityStr, setBatteryCapacityStr] = useState<string>(DEFAULTS.batteryCapacity);
  const [currentSocStr, setCurrentSocStr] = useState<string>(DEFAULTS.currentSoc);
  const [targetSocStr, setTargetSocStr] = useState<string>(DEFAULTS.targetSoc);
  const [chargerPowerStr, setChargerPowerStr] = useState<string>(DEFAULTS.chargerPower);
  const [electricityRateStr, setElectricityRateStr] = useState<string>(DEFAULTS.electricityRate);
  const [efficiencyStr, setEfficiencyStr] = useState<string>(DEFAULTS.efficiency);

  const capId = useId();
  const curSocId = useId();
  const tgtSocId = useId();
  const powerId = useId();
  const rateId = useId();
  const effId = useId();

  const handleReset = () => {
    setBatteryCapacityStr(DEFAULTS.batteryCapacity);
    setCurrentSocStr(DEFAULTS.currentSoc);
    setTargetSocStr(DEFAULTS.targetSoc);
    setChargerPowerStr(DEFAULTS.chargerPower);
    setElectricityRateStr(DEFAULTS.electricityRate);
    setEfficiencyStr(DEFAULTS.efficiency);
  };

  const handleClear = () => {
    setBatteryCapacityStr('');
    setCurrentSocStr('');
    setTargetSocStr('');
    setChargerPowerStr('');
    setElectricityRateStr('');
    setEfficiencyStr('');
  };

  const isEmpty =
    batteryCapacityStr.trim() === '' ||
    currentSocStr.trim() === '' ||
    targetSocStr.trim() === '' ||
    chargerPowerStr.trim() === '' ||
    electricityRateStr.trim() === '' ||
    efficiencyStr.trim() === '';

  const batteryCapacity = Number(batteryCapacityStr);
  const currentSoc = Number(currentSocStr);
  const targetSoc = Number(targetSocStr);
  const chargerPower = Number(chargerPowerStr);
  const electricityRate = Number(electricityRateStr);
  const efficiency = Number(efficiencyStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(batteryCapacity) || batteryCapacity <= 0) {
      errors.batteryCapacity = 'Battery capacity must be greater than 0 kWh.';
    }
    if (!Number.isFinite(currentSoc) || currentSoc < 0 || currentSoc > 100) {
      errors.currentSoc = 'Current state of charge must be between 0% and 100%.';
    }
    if (!Number.isFinite(targetSoc) || targetSoc < 0 || targetSoc > 100) {
      errors.targetSoc = 'Target state of charge must be between 0% and 100%.';
    }
    if (!Number.isFinite(chargerPower) || chargerPower <= 0) {
      errors.chargerPower = 'Charger power output must be greater than 0 kW.';
    }
    if (!Number.isFinite(electricityRate) || electricityRate < 0) {
      errors.electricityRate = `Electricity rate must be ${currencyMeta.symbol}0/kWh or greater.`;
    }
    if (!Number.isFinite(efficiency) || efficiency <= 0 || efficiency > 100) {
      errors.efficiency = 'Charging efficiency must be between 1% and 100%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let socDelta = 0;
  let energyRequired = 0;
  let totalCost = 0;
  let chargingTimeHours = 0;

  if (!isEmpty && !hasErrors) {
    socDelta = Math.max(0, targetSoc - currentSoc);
    energyRequired = (batteryCapacity * (socDelta / 100)) / (efficiency / 100);
    totalCost = energyRequired * electricityRate;
    chargingTimeHours = energyRequired / chargerPower;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `EV Charging Summary (${currentSoc}% → ${targetSoc}%) — Estimated Charging Cost: ${formatCurrency(totalCost)} | Energy Required: ${energyRequired.toFixed(1)} kWh | Duration: ${chargingTimeHours.toFixed(2)} hours`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="EV Battery, Charger & Utility Rate"
          subtitle="Estimate wall energy drawn, charging session cost, and time required to reach target SOC."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Battery Capacity"
              htmlFor={capId}
              unit="kWh"
              error={errors.batteryCapacity}
            >
              <input
                id={capId}
                type="number"
                min="0"
                step="any"
                value={batteryCapacityStr}
                onChange={(e) => setBatteryCapacityStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="75"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Current SOC"
              htmlFor={curSocId}
              unit="%"
              error={errors.currentSoc}
            >
              <input
                id={curSocId}
                type="number"
                min="0"
                max="100"
                step="any"
                value={currentSocStr}
                onChange={(e) => setCurrentSocStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="20"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Target SOC"
              htmlFor={tgtSocId}
              unit="%"
              error={errors.targetSoc}
            >
              <input
                id={tgtSocId}
                type="number"
                min="0"
                max="100"
                step="any"
                value={targetSocStr}
                onChange={(e) => setTargetSocStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="80"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label="Charger Power Output"
              htmlFor={powerId}
              unit="kW"
              error={errors.chargerPower}
            >
              <input
                id={powerId}
                type="number"
                min="0"
                step="any"
                value={chargerPowerStr}
                onChange={(e) => setChargerPowerStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="11"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Electricity Rate"
              htmlFor={rateId}
              unit={`${currencyMeta.symbol}/kWh`}
              error={errors.electricityRate}
            >
              <input
                id={rateId}
                type="number"
                min="0"
                step="0.01"
                value={electricityRateStr}
                onChange={(e) => setElectricityRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="0.15"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Charging Efficiency"
              htmlFor={effId}
              unit="%"
              error={errors.efficiency}
            >
              <input
                id={effId}
                type="number"
                min="1"
                max="100"
                step="any"
                value={efficiencyStr}
                onChange={(e) => setEfficiencyStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="90"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="EV Charging Cost & Time Summary"
          state={resultState}
          primaryLabel="Estimated Charging Cost"
          primaryValue={formatCurrency(totalCost)}
          primarySubtext={`${energyRequired.toFixed(1)} kWh drawn (+${socDelta}% SOC) in ${chargingTimeHours.toFixed(2)} hours`}
          statusLabel={`${chargingTimeHours.toFixed(2)} hrs`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter EV charging parameters"
          emptyDescription="Provide battery capacity, starting and target SOC, charger power, rate, and efficiency."
          errorTitle="Invalid EV charging inputs"
          errorMessage={Object.values(errors)[0] || 'Check battery, SOC, charger power, and rate.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Energy Required" value={`${energyRequired.toFixed(1)} kWh`} />
            <ToolMetricTile
              label="Est. Charging Duration"
              value={`${chargingTimeHours.toFixed(2)} hours`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'SOC Added',
                value: `+${socDelta}%`
              },
              {
                label: 'Energy Required (kWh)',
                value: `${energyRequired.toFixed(1)} kWh`
              },
              {
                label: 'Est. Charging Duration',
                value: `${chargingTimeHours.toFixed(2)} hours`
              },
              {
                label: 'Estimated Charging Cost',
                value: formatCurrency(totalCost),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
