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
  hourlyRate: '25',
  regularHours: '40',
  overtimeHours: '8',
  doubleTimeHours: '2',
  otMultiplier: '1.5',
  dtMultiplier: '2'
};

export default function OvertimePayCalculator() {
  const { currencyMeta, formatCurrency } = useCurrency();
  const [hourlyRateStr, setHourlyRateStr] = useState<string>(DEFAULTS.hourlyRate);
  const [regularHoursStr, setRegularHoursStr] = useState<string>(DEFAULTS.regularHours);
  const [overtimeHoursStr, setOvertimeHoursStr] = useState<string>(DEFAULTS.overtimeHours);
  const [doubleTimeHoursStr, setDoubleTimeHoursStr] = useState<string>(DEFAULTS.doubleTimeHours);
  const [otMultiplierStr, setOtMultiplierStr] = useState<string>(DEFAULTS.otMultiplier);
  const [dtMultiplierStr, setDtMultiplierStr] = useState<string>(DEFAULTS.dtMultiplier);

  const rateId = useId();
  const regId = useId();
  const otId = useId();
  const dtId = useId();
  const otMultId = useId();
  const dtMultId = useId();

  const formatWhole = (val: number) =>
    formatCurrency(Math.round(val), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleReset = () => {
    setHourlyRateStr(DEFAULTS.hourlyRate);
    setRegularHoursStr(DEFAULTS.regularHours);
    setOvertimeHoursStr(DEFAULTS.overtimeHours);
    setDoubleTimeHoursStr(DEFAULTS.doubleTimeHours);
    setOtMultiplierStr(DEFAULTS.otMultiplier);
    setDtMultiplierStr(DEFAULTS.dtMultiplier);
  };

  const handleClear = () => {
    setHourlyRateStr('');
    setRegularHoursStr('');
    setOvertimeHoursStr('');
    setDoubleTimeHoursStr('');
    setOtMultiplierStr('');
    setDtMultiplierStr('');
  };

  const isEmpty =
    hourlyRateStr.trim() === '' ||
    regularHoursStr.trim() === '' ||
    overtimeHoursStr.trim() === '' ||
    doubleTimeHoursStr.trim() === '' ||
    otMultiplierStr.trim() === '' ||
    dtMultiplierStr.trim() === '';

  const hourlyRate = Number(hourlyRateStr);
  const regularHours = Number(regularHoursStr);
  const overtimeHours = Number(overtimeHoursStr);
  const doubleTimeHours = Number(doubleTimeHoursStr);
  const otMultiplier = Number(otMultiplierStr);
  const dtMultiplier = Number(dtMultiplierStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      errors.hourlyRate = `Regular hourly rate must be ${formatCurrency(0)} or greater.`;
    }
    if (!Number.isFinite(regularHours) || regularHours < 0) {
      errors.regularHours = 'Regular hours worked must be 0 or greater.';
    }
    if (!Number.isFinite(overtimeHours) || overtimeHours < 0) {
      errors.overtimeHours = 'Overtime hours must be 0 or greater.';
    }
    if (!Number.isFinite(doubleTimeHours) || doubleTimeHours < 0) {
      errors.doubleTimeHours = 'Double-time hours must be 0 or greater.';
    }
    if (!Number.isFinite(otMultiplier) || otMultiplier <= 0) {
      errors.otMultiplier = 'Overtime multiplier must be greater than 0.';
    }
    if (!Number.isFinite(dtMultiplier) || dtMultiplier <= 0) {
      errors.dtMultiplier = 'Double-time multiplier must be greater than 0.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let regularEarnings = 0;
  let overtimeEarnings = 0;
  let doubleTimeEarnings = 0;
  let totalGrossEarnings = 0;
  let totalHours = 0;
  let effectiveHourlyRate = 0;

  if (!isEmpty && !hasErrors) {
    regularEarnings = regularHours * hourlyRate;
    overtimeEarnings = overtimeHours * hourlyRate * otMultiplier;
    doubleTimeEarnings = doubleTimeHours * hourlyRate * dtMultiplier;
    totalGrossEarnings = regularEarnings + overtimeEarnings + doubleTimeEarnings;
    totalHours = regularHours + overtimeHours + doubleTimeHours;
    effectiveHourlyRate = totalHours > 0 ? totalGrossEarnings / totalHours : hourlyRate;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const copyText = `Overtime Pay Summary (${totalHours} hrs) — Total Gross Weekly Pay: ${formatWhole(totalGrossEarnings)} | Regular: ${formatWhole(regularEarnings)} | OT & DT Pay: ${formatWhole(overtimeEarnings + doubleTimeEarnings)} | Effective Blended Rate: ${formatCurrency(effectiveHourlyRate)}/hr`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title="Hourly Rate, Hours & Multipliers"
          subtitle="Calculate gross weekly earnings across regular, overtime, and double-time shifts."
          onReset={handleReset}
          onClear={handleClear}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Regular Hourly Rate"
              htmlFor={rateId}
              unit={`${currencyMeta.symbol}/hr`}
              error={errors.hourlyRate}
            >
              <input
                id={rateId}
                type="number"
                min="0"
                step="any"
                value={hourlyRateStr}
                onChange={(e) => setHourlyRateStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="25"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Regular Hours Worked"
              htmlFor={regId}
              unit="hrs"
              error={errors.regularHours}
            >
              <input
                id={regId}
                type="number"
                min="0"
                step="any"
                value={regularHoursStr}
                onChange={(e) => setRegularHoursStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="40"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Overtime Hours (OT)"
              htmlFor={otId}
              unit="hrs"
              error={errors.overtimeHours}
            >
              <input
                id={otId}
                type="number"
                min="0"
                step="any"
                value={overtimeHoursStr}
                onChange={(e) => setOvertimeHoursStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="8"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Double-Time Hours (DT)"
              htmlFor={dtId}
              unit="hrs"
              error={errors.doubleTimeHours}
            >
              <input
                id={dtId}
                type="number"
                min="0"
                step="any"
                value={doubleTimeHoursStr}
                onChange={(e) => setDoubleTimeHoursStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2"
              />
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label="Overtime Multiplier"
              htmlFor={otMultId}
              unit="x"
              error={errors.otMultiplier}
            >
              <input
                id={otMultId}
                type="number"
                min="0"
                step="0.1"
                value={otMultiplierStr}
                onChange={(e) => setOtMultiplierStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="1.5"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label="Double-Time Multiplier"
              htmlFor={dtMultId}
              unit="x"
              error={errors.dtMultiplier}
            >
              <input
                id={dtMultId}
                type="number"
                min="0"
                step="0.1"
                value={dtMultiplierStr}
                onChange={(e) => setDtMultiplierStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2.0"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">Payroll Policy:</strong> Configurable multipliers
            support federal FLSA guidelines, state rules, or collective bargaining agreements.
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title="Gross Earnings & Pay Summary"
          state={resultState}
          primaryLabel="Total Gross Weekly Pay"
          primaryValue={formatWhole(totalGrossEarnings)}
          primarySubtext={`${totalHours} total hours at ${formatCurrency(effectiveHourlyRate)}/hr effective blended rate`}
          statusLabel={`${formatCurrency(effectiveHourlyRate)}/hr`}
          statusTone="accent"
          copyText={copyText}
          emptyTitle="Enter pay rate & hours"
          emptyDescription="Provide hourly rate, regular/overtime/double-time hours, and multipliers to compute gross pay."
          errorTitle="Invalid payroll inputs"
          errorMessage={Object.values(errors)[0] || 'Check hourly rate, hours, and multipliers.'}
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label="Regular Earnings"
              value={formatWhole(regularEarnings)}
            />
            <ToolMetricTile
              label="Overtime & Double-Time Pay"
              value={formatWhole(overtimeEarnings + doubleTimeEarnings)}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: 'Regular Earnings',
                value: formatWhole(regularEarnings)
              },
              {
                label: 'Overtime & Double-Time Pay',
                value: formatWhole(overtimeEarnings + doubleTimeEarnings)
              },
              {
                label: 'Effective Blended Hourly Rate',
                value: `${formatCurrency(effectiveHourlyRate)}/hr`
              },
              {
                label: 'Total Gross Weekly Pay',
                value: formatWhole(totalGrossEarnings),
                highlight: true
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
