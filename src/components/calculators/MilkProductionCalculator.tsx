import { useId, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

interface DairySpecies {
  id: string;
  name: string;
  nameEs: string;
  defaultDailyYield: number; // lbs/day
  unit: string;
}

const DAIRY_SPECIES: DairySpecies[] = [
  { id: 'dairy-cow', name: 'Dairy Cow (Bovine)', nameEs: 'Vaca lechera (Bovino)', defaultDailyYield: 65, unit: 'lbs' },
  { id: 'dairy-goat', name: 'Dairy Goat (Caprine)', nameEs: 'Cabra lechera (Caprino)', defaultDailyYield: 6, unit: 'lbs' },
  { id: 'dairy-sheep', name: 'Dairy Sheep (Ovine)', nameEs: 'Oveja lechera (Ovino)', defaultDailyYield: 4.5, unit: 'lbs' }
];

type MilkUnit = 'lbs' | 'kg' | 'gal' | 'liters';

const DEFAULTS = {
  speciesId: 'dairy-cow',
  animalCount: '20',
  dailyYieldPerAnimal: '65',
  unitSystem: 'lbs' as MilkUnit
};

export default function MilkProductionCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [speciesId, setSpeciesId] = useState<string>(DEFAULTS.speciesId);
  const [animalCountStr, setAnimalCountStr] = useState<string>(DEFAULTS.animalCount);
  const [dailyYieldStr, setDailyYieldStr] = useState<string>(DEFAULTS.dailyYieldPerAnimal);
  const [unitSystem, setUnitSystem] = useState<MilkUnit>(DEFAULTS.unitSystem);

  const speciesSelectId = useId();
  const countId = useId();
  const unitId = useId();
  const yieldId = useId();

  const handleReset = () => {
    setSpeciesId(DEFAULTS.speciesId);
    setAnimalCountStr(DEFAULTS.animalCount);
    setDailyYieldStr(DEFAULTS.dailyYieldPerAnimal);
    setUnitSystem(DEFAULTS.unitSystem);
  };

  const handleClear = () => {
    setAnimalCountStr('');
    setDailyYieldStr('');
  };

  const species = DAIRY_SPECIES.find((s) => s.id === speciesId) || DAIRY_SPECIES[0];
  const speciesName = isEs ? species.nameEs : species.name;

  const isEmpty = animalCountStr.trim() === '' || dailyYieldStr.trim() === '';
  const animalCount = Number(animalCountStr);
  const dailyYieldPerAnimal = Number(dailyYieldStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(animalCount) || animalCount < 1) {
      errors.animalCount = isEs
        ? 'La cantidad de animales en ordeño debe ser al menos 1.'
        : 'Milking animal count must be at least 1.';
    }
    if (!Number.isFinite(dailyYieldPerAnimal) || dailyYieldPerAnimal <= 0) {
      errors.dailyYield = isEs
        ? 'La producción diaria por animal debe ser mayor que 0.'
        : 'Average daily yield per animal must be greater than 0.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let herdDaily = 0;
  let herdWeekly = 0;
  let herdMonthly = 0;
  let lactation305 = 0;

  if (!isEmpty && !hasErrors) {
    let yieldInLbs = dailyYieldPerAnimal;
    if (unitSystem === 'kg') yieldInLbs = dailyYieldPerAnimal * 2.20462;
    if (unitSystem === 'gal') yieldInLbs = dailyYieldPerAnimal * 8.62; // milk gallon ~8.62 lbs
    if (unitSystem === 'liters') yieldInLbs = (dailyYieldPerAnimal * 2.20462) / 1;

    const totalHerdDailyLbs = yieldInLbs * animalCount;
    const totalHerdWeeklyLbs = totalHerdDailyLbs * 7;
    const totalHerdMonthlyLbs = totalHerdDailyLbs * 30.44;
    const standard305LactationLbs = yieldInLbs * 305;

    const formatOutput = (lbs: number) => {
      if (unitSystem === 'kg') return Math.round(lbs / 2.20462);
      if (unitSystem === 'gal') return Math.round(lbs / 8.62);
      if (unitSystem === 'liters') return Math.round(lbs / 2.20462);
      return Math.round(lbs);
    };

    herdDaily = formatOutput(totalHerdDailyLbs);
    herdWeekly = formatOutput(totalHerdWeeklyLbs);
    herdMonthly = formatOutput(totalHerdMonthlyLbs);
    lactation305 = formatOutput(standard305LactationLbs);
  }

  const unitLabel = unitSystem === 'liters' && isEs ? 'litros' : unitSystem;
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = isEs
    ? `Producción lechera (${speciesName}) — Total mensual del hato: ${herdMonthly} ${unitLabel}/mes | Diario del hato: ${herdDaily} ${unitLabel}/día | Semanal: ${herdWeekly} ${unitLabel} | Lactancia 305 días por animal: ${lactation305} ${unitLabel}`
    : `Milk Production (${speciesName}) — Total Herd Monthly Yield: ${herdMonthly} ${unitSystem} / mo | Herd Daily: ${herdDaily} ${unitSystem} / day | Weekly Herd: ${herdWeekly} ${unitSystem} | 305-Day Lactation/Animal: ${lactation305} ${unitSystem}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Parámetros de ordeño del hato' : 'Dairy Herd Parameters'}
          subtitle={
            isEs
              ? 'Calcula resúmenes diarios, semanales, mensuales y de lactancia estándar de 305 días.'
              : 'Calculate daily, weekly, monthly, and lactation yield summaries.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup
            label={isEs ? 'Especie lechera' : 'Dairy Species'}
            htmlFor={speciesSelectId}
          >
            <select
              id={speciesSelectId}
              value={speciesId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSpeciesId(nextId);
                const sp = DAIRY_SPECIES.find((s) => s.id === nextId);
                if (sp) setDailyYieldStr(String(sp.defaultDailyYield));
              }}
              className="ui-input"
            >
              {DAIRY_SPECIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {isEs ? s.nameEs : s.name}
                </option>
              ))}
            </select>
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Animales en ordeño' : 'Milking Animal Count'}
              htmlFor={countId}
              unit={isEs ? 'cab.' : 'head'}
              error={errors.animalCount}
            >
              <input
                id={countId}
                type="number"
                min="1"
                max="10000"
                step="1"
                value={animalCountStr}
                onChange={(e) => setAnimalCountStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="20"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Sistema de unidades' : 'Unit System'}
              htmlFor={unitId}
            >
              <select
                id={unitId}
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as MilkUnit)}
                className="ui-input"
              >
                <option value="lbs">{isEs ? 'Libras (lbs)' : 'Pounds (lbs)'}</option>
                <option value="kg">{isEs ? 'Kilogramos (kg)' : 'Kilograms (kg)'}</option>
                <option value="gal">{isEs ? 'Galones (EE. UU.)' : 'Gallons (US)'}</option>
                <option value="liters">{isEs ? 'Litros (L)' : 'Liters (L)'}</option>
              </select>
            </ToolFieldGroup>
          </div>

          <ToolFieldGroup
            label={
              isEs
                ? 'Producción diaria promedio por animal'
                : 'Average Daily Yield Per Animal'
            }
            htmlFor={yieldId}
            unit={unitLabel}
            error={errors.dailyYield}
          >
            <input
              id={yieldId}
              type="number"
              min="1"
              max="250"
              step="any"
              value={dailyYieldStr}
              onChange={(e) => setDailyYieldStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="65"
            />
          </ToolFieldGroup>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Nota de producción:' : 'Production Note:'}
            </strong>{' '}
            {isEs
              ? 'Basado en estándares de extensión lechera. Incluye proyección de lactancia estándar de 305 días.'
              : 'Dairy extension standards for lactation yields. 305-day standard lactation projection included.'}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resumen de rendimiento lechero' : 'Lactation Yield Summary'}
          state={resultState}
          primaryLabel={isEs ? 'Producción mensual total del hato' : 'Total Herd Monthly Yield'}
          primaryValue={`${herdMonthly}`}
          primaryUnit={`${unitLabel} / ${isEs ? 'mes' : 'mo'}`}
          primarySubtext={
            isEs
              ? `${speciesName} · ${animalCount} animales en ordeño`
              : `${speciesName} · ${animalCount} milking animals`
          }
          statusLabel={isEs ? 'Lactancia 305 d' : '305-Day Est.'}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa hato y producción diaria' : 'Enter milking count and daily yield'}
          emptyDescription={
            isEs
              ? 'Indica el número de animales y la producción diaria promedio para proyectar el rendimiento.'
              : 'Provide milking animal count and average daily yield per animal to calculate production totals.'
          }
          errorTitle={isEs ? 'Valores no válidos' : 'Invalid milk production inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica que la cantidad de animales sea al menos 1 y la producción sea mayor que 0.'
              : 'Ensure milking animal count is at least 1 and daily yield is greater than 0.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Producción diaria del hato' : 'Total Herd Daily Yield'}
              value={`${herdDaily} ${unitLabel} / ${isEs ? 'día' : 'day'}`}
            />
            <ToolMetricTile
              label={
                isEs
                  ? 'Lactancia 305 días (por animal)'
                  : 'Per Animal 305-Day Lactation Est.'
              }
              value={`${lactation305} ${unitLabel}`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Total diario del hato' : 'Total Herd Daily Yield',
                value: `${herdDaily} ${unitLabel} / ${isEs ? 'día' : 'day'}`
              },
              {
                label: isEs ? 'Total semanal del hato' : 'Weekly Herd Total',
                value: `${herdWeekly} ${unitLabel}`
              },
              {
                label: isEs ? 'Total mensual del hato (30.44 d)' : 'Total Herd Monthly Yield',
                value: `${herdMonthly} ${unitLabel} / ${isEs ? 'mes' : 'mo'}`,
                highlight: true
              },
              {
                label: isEs
                  ? 'Proyección 305 días por animal'
                  : 'Per Animal 305-Day Lactation Est.',
                value: `${lactation305} ${unitLabel}`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
