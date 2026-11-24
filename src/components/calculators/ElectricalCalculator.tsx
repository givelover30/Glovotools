import { useEffect, useId, useState } from 'react';
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

export type ElecTool = 'ohms' | 'cost';

interface ElectricalCalculatorProps {
  initialTool?: ElecTool;
}

const DEFAULTS = {
  voltage: '120',
  current: '10',
  watts: '1500',
  hoursPerDay: '4',
  kwhRate: '0.15'
};

export default function ElectricalCalculator({ initialTool = 'ohms' }: ElectricalCalculatorProps) {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [tool, setTool] = useState<ElecTool>(initialTool);

  useEffect(() => {
    setTool(initialTool);
  }, [initialTool]);

  const [voltageStr, setVoltageStr] = useState<string>(DEFAULTS.voltage);
  const [currentStr, setCurrentStr] = useState<string>(DEFAULTS.current);
  const [wattsStr, setWattsStr] = useState<string>(DEFAULTS.watts);
  const [hoursStr, setHoursStr] = useState<string>(DEFAULTS.hoursPerDay);
  const [rateStr, setRateStr] = useState<string>(DEFAULTS.kwhRate);

  const voltageId = useId();
  const currentId = useId();
  const wattsId = useId();
  const hoursId = useId();
  const rateId = useId();

  const handleReset = () => {
    if (tool === 'ohms') {
      setVoltageStr(DEFAULTS.voltage);
      setCurrentStr(DEFAULTS.current);
    } else {
      setWattsStr(DEFAULTS.watts);
      setHoursStr(DEFAULTS.hoursPerDay);
      setRateStr(DEFAULTS.kwhRate);
    }
  };

  const handleClear = () => {
    if (tool === 'ohms') {
      setVoltageStr('');
      setCurrentStr('');
    } else {
      setWattsStr('');
      setHoursStr('');
      setRateStr('');
    }
  };

  const modeTabs = (
    <ToolSegmentedControl
      ariaLabel="Electrical calculation mode"
      value={tool}
      onChange={setTool}
      options={[
        { value: 'ohms', label: "Ohm's Law & Power (V = I × R)" },
        { value: 'cost', label: 'Electricity Running Cost' }
      ]}
    />
  );

  if (tool === 'ohms') {
    const isEmpty = voltageStr.trim() === '' || currentStr.trim() === '';
    const voltage = Number(voltageStr);
    const current = Number(currentStr);

    const errors: Record<string, string> = {};
    if (!isEmpty) {
      if (!Number.isFinite(voltage)) errors.voltage = 'Enter a valid voltage value.';
      if (!Number.isFinite(current)) errors.current = 'Enter a valid current value.';
      else if (current === 0) errors.current = 'Current I cannot be 0 when solving for Resistance (R = V / I).';
    }
    const hasErrors = Object.keys(errors).length > 0;

    const resistance = !isEmpty && !hasErrors && current !== 0 ? voltage / current : 0;
    const power = !isEmpty && !hasErrors ? voltage * current : 0;

    const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
    const copyText = `Ohm's Law (V=${voltage}V, I=${current}A): Resistance R = ${resistance.toFixed(2)} Ω | Power P = ${power.toFixed(1)} W (${(power / 1000).toFixed(3)} kW, ${(power / 745.7).toFixed(2)} hp)`;

    return (
      <ToolSplitWorkspace
        inputs={
          <ToolInputPanel
            title="Electrical Inputs"
            subtitle="Calculate circuit resistance, electrical power, kilowatts, and equivalent horsepower."
            onReset={handleReset}
            onClear={handleClear}
          >
            <div className="overflow-x-auto pb-1">{modeTabs}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup label="Voltage V" htmlFor={voltageId} unit="Volts" error={errors.voltage}>
                <input
                  id={voltageId}
                  type="number"
                  step="any"
                  value={voltageStr}
                  onChange={(e) => setVoltageStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="120"
                />
              </ToolFieldGroup>
              <ToolFieldGroup label="Current I" htmlFor={currentId} unit="Amperes" error={errors.current}>
                <input
                  id={currentId}
                  type="number"
                  step="any"
                  value={currentStr}
                  onChange={(e) => setCurrentStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="10"
                />
              </ToolFieldGroup>
            </div>

            <p className="text-xs font-mono text-text-tertiary">
              Ohm&apos;s Law: R = V / I, Electrical Power: P = V × I = I² × R
            </p>
          </ToolInputPanel>
        }
        results={
          <ToolResultsPanel
            title="Ohm's Law & Power Summary"
            state={resultState}
            primaryLabel="Resistance (R)"
            primaryValue={resistance.toFixed(2)}
            primaryUnit="Ω"
            primarySubtext={`Electrical Power: ${power.toFixed(1)} W`}
            copyText={copyText}
            emptyTitle="Enter voltage and current"
            emptyDescription="Provide voltage (V) and current (A) to solve for resistance and power."
            errorTitle="Invalid circuit input"
            errorMessage={Object.values(errors)[0] || 'Check voltage and current values.'}
          >
            <div className="grid grid-cols-2 gap-3">
              <ToolMetricTile label="Resistance (R)" value={`${resistance.toFixed(2)} Ω`} accent />
              <ToolMetricTile label="Power (P)" value={`${power.toFixed(1)} W`} accent />
            </div>

            <ToolBreakdownList
              items={[
                { label: 'Kilowatts (kW)', value: `${(power / 1000).toFixed(3)} kW`, highlight: true },
                { label: 'Equivalent Horsepower (hp)', value: `${(power / 745.7).toFixed(2)} hp` }
              ]}
            />
          </ToolResultsPanel>
        }
      />
    );
  }

  // Electricity Running Cost
  const isEmpty = wattsStr.trim() === '' || hoursStr.trim() === '' || rateStr.trim() === '';
  const watts = Number(wattsStr);
  const hoursPerDay = Number(hoursStr);
  const kwhRate = Number(rateStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(watts) || watts <= 0) errors.watts = 'Power rating must be greater than 0 watts.';
    if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) {
      errors.hours = 'Hours per day must be between 0.1 and 24.';
    }
    if (!Number.isFinite(kwhRate) || kwhRate < 0) errors.rate = 'Utility rate must be 0 or greater.';
  }
  const hasErrors = Object.keys(errors).length > 0;

  const dailyKwh = !isEmpty && !hasErrors ? (watts * hoursPerDay) / 1000 : 0;
  const monthlyKwh = dailyKwh * 30.42;
  const yearlyKwh = dailyKwh * 365;

  const dailyCost = dailyKwh * kwhRate;
  const monthlyCost = monthlyKwh * kwhRate;
  const yearlyCost = yearlyKwh * kwhRate;

  const isZeroDecimal = currencyMeta.code === 'JPY' || currencyMeta.code === 'CLP';
  const formatDailyCost = (val: number) =>
    formatCurrency(
      val,
      isZeroDecimal
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : { minimumFractionDigits: 3, maximumFractionDigits: 3 }
    );

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Electricity Cost (${watts}W, ${hoursPerDay} hrs/day @ ${currencyMeta.symbol}${kwhRate}/kWh): Monthly ${formatCurrency(monthlyCost)} (${monthlyKwh.toFixed(1)} kWh) | Daily ${formatDailyCost(dailyCost)} (${dailyKwh.toFixed(2)} kWh) | Annual ${formatCurrency(yearlyCost)} (${yearlyKwh.toFixed(0)} kWh)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Appliance & Utility Rates"
          subtitle="Estimate daily, monthly, and annual electricity consumption and operating cost."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="overflow-x-auto pb-1">{modeTabs}</div>

          <ToolFieldGroup label="Device Power Rating" htmlFor={wattsId} unit="Watts" error={errors.watts}>
            <input
              id={wattsId}
              type="number"
              min="1"
              step="any"
              value={wattsStr}
              onChange={(e) => setWattsStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="1500"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label="Hours Used per Day" htmlFor={hoursId} unit="hrs / day" error={errors.hours}>
              <input
                id={hoursId}
                type="number"
                min="0.1"
                max="24"
                step="0.5"
                value={hoursStr}
                onChange={(e) => setHoursStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="4"
              />
            </ToolFieldGroup>
            <ToolFieldGroup label="Cost per kWh" htmlFor={rateId} unit={`${currencyMeta.symbol} / kWh`} error={errors.rate}>
              <input
                id={rateId}
                type="number"
                min="0"
                step="0.01"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="0.15"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Electricity Costs"
          state={resultState}
          primaryLabel="Estimated Monthly Cost"
          primaryValue={formatCurrency(monthlyCost)}
          primaryUnit="/ month"
          primarySubtext={`Uses ${monthlyKwh.toFixed(1)} kWh per average month (30.42 days)`}
          copyText={copyText}
          emptyTitle="Enter appliance and rate details"
          emptyDescription="Provide wattage, daily runtime hours, and kWh utility rate to estimate electricity costs."
          errorTitle="Invalid usage inputs"
          errorMessage={Object.values(errors)[0] || 'Check power, hours, and rate inputs.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile label="Daily Cost" value={formatDailyCost(dailyCost)} hint={`${dailyKwh.toFixed(2)} kWh/day`} />
            <ToolMetricTile label="Annual Cost" value={formatCurrency(yearlyCost)} hint={`${yearlyKwh.toFixed(0)} kWh/yr`} accent />
          </div>

          <ToolBreakdownList
            items={[
              { label: `Daily Cost (${dailyKwh.toFixed(2)} kWh)`, value: formatDailyCost(dailyCost) },
              { label: `Monthly Cost (${monthlyKwh.toFixed(1)} kWh)`, value: `${formatCurrency(monthlyCost)} / mo`, highlight: true },
              { label: `Annual Cost (${yearlyKwh.toFixed(0)} kWh)`, value: `${formatCurrency(yearlyCost)} / yr` }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
