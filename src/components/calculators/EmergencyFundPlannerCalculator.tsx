import { useState, useMemo, useId } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { useCurrency } from '../../i18n/CurrencyContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolFieldGroup,
  ToolPresetBar,
  ToolResultsPanel,
  ToolMetricTile,
  ToolBreakdownList
} from '../calculator/ToolWorkspacePrimitives.tsx';
import { UiButton, UiInput, UiSelect } from '../ui/AppPrimitives.tsx';

export default function EmergencyFundPlannerCalculator() {
  const { language } = useTranslation();
  const { currencyMeta, formatCurrency } = useCurrency();
  const isEs = language === 'es';
  const baseId = useId();

  const fmtAuto = (val: number) =>
    formatCurrency(
      val,
      Number.isInteger(val) ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : undefined
    );

  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(3500);
  const [targetMonths, setTargetMonths] = useState<number>(6);
  const [currentSavings, setCurrentSavings] = useState<number>(8000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);

  const expensesInvalid = !Number.isFinite(monthlyExpenses) || monthlyExpenses < 0;
  const savingsInvalid = !Number.isFinite(currentSavings) || currentSavings < 0;
  const contribInvalid = !Number.isFinite(monthlyContribution) || monthlyContribution < 0;
  const hasError = expensesInvalid || savingsInvalid || contribInvalid;

  const targetFund = Math.max(0, monthlyExpenses) * targetMonths;
  const remainingNeeded = Math.max(0, targetFund - Math.max(0, currentSavings));

  const monthsToGoal = useMemo(() => {
    if (remainingNeeded === 0) return 0;
    if (monthlyContribution <= 0) return Infinity;
    return Math.ceil(remainingNeeded / monthlyContribution);
  }, [remainingNeeded, monthlyContribution]);

  const progressPercent =
    targetFund > 0 ? Math.min(100, Math.round((Math.max(0, currentSavings) / targetFund) * 100)) : 0;

  const handleReset = () => {
    setMonthlyExpenses(3500);
    setTargetMonths(6);
    setCurrentSavings(8000);
    setMonthlyContribution(500);
  };

  const handleClear = () => {
    setMonthlyExpenses(0);
    setCurrentSavings(0);
    setMonthlyContribution(0);
  };

  const handleExportJson = () => {
    const data = {
      monthlyExpenses,
      targetMonths,
      targetFund,
      currentSavings,
      monthlyContribution,
      monthsToGoal: monthsToGoal === Infinity ? null : monthsToGoal
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emergency_fund_plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const timeDisplay =
    monthsToGoal === Infinity
      ? 'N/A'
      : `${monthsToGoal} ${isEs ? 'meses' : 'months'}`;

  const copySummary = isEs
    ? `Fondo Objetivo: ${fmtAuto(targetFund)} | Ahorro Actual: ${fmtAuto(currentSavings)} | Restante: ${fmtAuto(remainingNeeded)} | Tiempo Estimado: ${timeDisplay}`
    : `Target Fund: ${fmtAuto(targetFund)} | Current Savings: ${fmtAuto(currentSavings)} | Remaining: ${fmtAuto(remainingNeeded)} | Time to Goal: ${timeDisplay}`;

  const resultState = hasError ? 'error' : targetFund === 0 ? 'empty' : 'ready';

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Parámetros del Fondo de Emergencia' : 'Emergency Fund Parameters'}
          subtitle={
            isEs
              ? 'Calcula tu colchón financiero objetivo y tiempo de acumulación'
              : 'Calculate your target cash reserve and timeline to reach full coverage'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restaurar' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolPresetBar
            label={isEs ? 'Cobertura:' : 'Presets:'}
            presets={[
              { label: isEs ? '3 meses' : '3 mo', onSelect: () => setTargetMonths(3) },
              { label: isEs ? '6 meses' : '6 mo', onSelect: () => setTargetMonths(6) },
              { label: isEs ? '9 meses' : '9 mo', onSelect: () => setTargetMonths(9) },
              { label: isEs ? '12 meses' : '12 mo', onSelect: () => setTargetMonths(12) }
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Gastos Mensuales Esenciales' : 'Monthly Essential Expenses'}
              htmlFor={`${baseId}-expenses`}
              unit={currencyMeta.symbol}
              error={
                expensesInvalid
                  ? isEs
                    ? 'Ingresa un gasto mensual válido (>= 0).'
                    : 'Enter a valid monthly expense (>= 0).'
                  : undefined
              }
            >
              <UiInput
                id={`${baseId}-expenses`}
                type="number"
                min={0}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Meses de Cobertura Objetivo' : 'Target Months Coverage'}
              htmlFor={`${baseId}-months`}
            >
              <UiSelect
                id={`${baseId}-months`}
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
              >
                <option value={3}>
                  {isEs ? '3 Meses (Mínimo)' : '3 Months (Minimum)'}
                </option>
                <option value={6}>
                  {isEs ? '6 Meses (Recomendado)' : '6 Months (Recommended)'}
                </option>
                <option value={9}>
                  {isEs ? '9 Meses (Conservador)' : '9 Months (Conservative)'}
                </option>
                <option value={12}>
                  {isEs ? '12 Meses (Máxima Seguridad)' : '12 Months (Maximum Security)'}
                </option>
              </UiSelect>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Ahorros Actuales Acumulados' : 'Current Accumulated Savings'}
              htmlFor={`${baseId}-savings`}
              unit={currencyMeta.symbol}
              error={
                savingsInvalid
                  ? isEs
                    ? 'Los ahorros no pueden ser negativos.'
                    : 'Savings cannot be negative.'
                  : undefined
              }
            >
              <UiInput
                id={`${baseId}-savings`}
                type="number"
                min={0}
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Aporte Mensual Destinado' : 'Monthly Contribution'}
              htmlFor={`${baseId}-contrib`}
              unit={currencyMeta.symbol}
              error={
                contribInvalid
                  ? isEs
                    ? 'El aporte mensual no puede ser negativo.'
                    : 'Monthly contribution cannot be negative.'
                  : undefined
              }
            >
              <UiInput
                id={`${baseId}-contrib`}
                type="number"
                min={0}
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="font-mono"
              />
            </ToolFieldGroup>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Plan de Fondo de Emergencia' : 'Emergency Fund Summary'}
          primaryLabel={isEs ? 'Meta de Fondo de Emergencia' : 'Emergency Fund Target'}
          primaryValue={fmtAuto(targetFund)}
          primaryUnit={isEs ? `${targetMonths} meses` : `${targetMonths} months`}
          primarySubtext={
            remainingNeeded === 0
              ? isEs
                ? 'Meta alcanzada con tus ahorros actuales.'
                : 'Goal reached with your current savings.'
              : isEs
              ? `Faltan ${fmtAuto(remainingNeeded)} por acumular.`
              : `${fmtAuto(remainingNeeded)} remaining to reach full coverage.`
          }
          statusLabel={`${progressPercent}%`}
          statusTone={progressPercent >= 100 ? 'success' : 'accent'}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          state={resultState}
          emptyTitle={isEs ? 'Ingresa tus gastos mensuales' : 'Enter your monthly expenses'}
          emptyDescription={
            isEs
              ? 'Define gastos esenciales mayores a cero para calcular la meta.'
              : 'Set monthly essential expenses above zero to calculate your reserve target.'
          }
          errorTitle={isEs ? 'Revisa los montos' : 'Check input values'}
          errorMessage={
            isEs
              ? 'Todos los valores monetarios deben ser mayores o iguales a cero.'
              : 'All monetary amounts must be zero or greater.'
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Ahorros Actuales' : 'Current Savings'}
              value={fmtAuto(currentSavings)}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Tiempo para la Meta' : 'Time to Reach Goal'}
              value={timeDisplay}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-text-secondary">
              <span>{isEs ? 'Progreso hacia la Meta' : 'Progress to Goal'}</span>
              <span className="font-mono text-accent">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-secondary overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Gastos mensuales' : 'Monthly expenses',
                value: fmtAuto(monthlyExpenses)
              },
              {
                label: isEs ? 'Capital faltante' : 'Remaining needed',
                value: fmtAuto(remainingNeeded),
                highlight: remainingNeeded > 0
              },
              {
                label: isEs ? 'Aporte mensual' : 'Monthly contribution',
                value: fmtAuto(monthlyContribution)
              }
            ]}
          />

          <div className="flex justify-end pt-1">
            <UiButton variant="secondary" size="sm" onClick={handleExportJson}>
              <Download className="w-3.5 h-3.5" />
              <span>{isEs ? 'Exportar Plan (JSON)' : 'Export Emergency Fund Plan (JSON)'}</span>
            </UiButton>
          </div>
        </ToolResultsPanel>
      }
    />
  );
}
