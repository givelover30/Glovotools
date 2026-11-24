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

interface LifeStage {
  id: string;
  name: string;
  nameEs: string;
  factor: number;
}

const DOG_STAGES: LifeStage[] = [
  { id: 'adult-neutered', name: 'Adult Neutered / Spayed', nameEs: 'Adulto esterilizado / castrado', factor: 1.6 },
  { id: 'adult-intact', name: 'Adult Intact', nameEs: 'Adulto entero', factor: 1.8 },
  { id: 'inactive', name: 'Inactive / Obese Prone', nameEs: 'Inactivo / Tendencia a sobrepeso', factor: 1.2 },
  { id: 'weight-loss', name: 'Weight Loss Target', nameEs: 'Objetivo de pérdida de peso', factor: 1.0 },
  { id: 'active', name: 'Active / Working', nameEs: 'Activo / De trabajo', factor: 2.0 },
  { id: 'puppy-4m', name: 'Puppy (0 - 4 months)', nameEs: 'Cachorro (0 - 4 meses)', factor: 3.0 },
  { id: 'puppy-adult', name: 'Puppy (4 months - Adult)', nameEs: 'Cachorro (4 meses - Adulto)', factor: 2.0 },
  { id: 'pregnant', name: 'Pregnant (Last 3 weeks)', nameEs: 'Gestante (Últimas 3 semanas)', factor: 3.0 },
  { id: 'lactating', name: 'Lactating (Peak)', nameEs: 'Lactancia (Pico)', factor: 4.0 }
];

const CAT_STAGES: LifeStage[] = [
  { id: 'adult-neutered', name: 'Adult Neutered / Spayed', nameEs: 'Adulto esterilizado / castrado', factor: 1.2 },
  { id: 'adult-intact', name: 'Adult Intact', nameEs: 'Adulto entero', factor: 1.4 },
  { id: 'inactive', name: 'Inactive / Senior', nameEs: 'Inactivo / Sénior', factor: 1.0 },
  { id: 'weight-loss', name: 'Weight Loss Target', nameEs: 'Objetivo de pérdida de peso', factor: 0.8 },
  { id: 'active', name: 'Active Adult', nameEs: 'Adulto activo', factor: 1.6 },
  { id: 'kitten', name: 'Kitten', nameEs: 'Gatito', factor: 2.5 },
  { id: 'pregnant', name: 'Pregnant', nameEs: 'Gestante', factor: 2.0 },
  { id: 'lactating', name: 'Lactating', nameEs: 'Lactancia', factor: 4.0 }
];

const DEFAULTS = {
  species: 'dog' as 'dog' | 'cat',
  weight: '30',
  weightUnit: 'lbs' as 'lbs' | 'kg',
  stageId: 'adult-neutered',
  foodCalories: '350',
  calorieUnit: 'cup' as 'cup' | 'kg'
};

export default function PetEnergyFoodCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [species, setSpecies] = useState<'dog' | 'cat'>(DEFAULTS.species);
  const [weightStr, setWeightStr] = useState<string>(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(DEFAULTS.weightUnit);
  const [stageId, setStageId] = useState<string>(DEFAULTS.stageId);
  const [foodCaloriesStr, setFoodCaloriesStr] = useState<string>(DEFAULTS.foodCalories);
  const [calorieUnit, setCalorieUnit] = useState<'cup' | 'kg'>(DEFAULTS.calorieUnit);

  const speciesId = useId();
  const stageSelectId = useId();
  const weightId = useId();
  const weightUnitId = useId();
  const caloriesId = useId();
  const calorieUnitId = useId();

  const handleReset = () => {
    setSpecies(DEFAULTS.species);
    setWeightStr(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setStageId(DEFAULTS.stageId);
    setFoodCaloriesStr(DEFAULTS.foodCalories);
    setCalorieUnit(DEFAULTS.calorieUnit);
  };

  const handleClear = () => {
    setWeightStr('');
    setFoodCaloriesStr('');
  };

  const stages = species === 'dog' ? DOG_STAGES : CAT_STAGES;
  const currentStage = stages.find((s) => s.id === stageId) || stages[0];
  const currentStageName = isEs ? currentStage.nameEs : currentStage.name;

  const isEmpty = weightStr.trim() === '' || foodCaloriesStr.trim() === '';
  const weight = Number(weightStr);
  const foodCalories = Number(foodCaloriesStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(weight) || weight <= 0) {
      errors.weight = isEs
        ? 'El peso corporal debe ser mayor que 0.'
        : 'Body weight must be greater than 0.';
    }
    if (!Number.isFinite(foodCalories) || foodCalories <= 0) {
      errors.foodCalories = isEs
        ? 'La densidad calórica del alimento debe ser mayor que 0.'
        : 'Food calorie density must be greater than 0.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let rer = 0;
  let der = 0;
  let dailyFoodUnits = 0;

  if (!isEmpty && !hasErrors) {
    const weightKg = weightUnit === 'lbs' ? weight / 2.20462 : weight;
    rer = 70 * Math.pow(Math.max(0.1, weightKg), 0.75);
    der = rer * currentStage.factor;
    dailyFoodUnits = foodCalories > 0 ? der / foodCalories : 0;
  }

  const dailyFoodDisplay =
    dailyFoodUnits > 0
      ? calorieUnit === 'cup'
        ? `${dailyFoodUnits.toFixed(1)} ${isEs ? 'tazas / día' : 'cups / day'}`
        : `${Math.round(dailyFoodUnits * 1000)} ${isEs ? 'g / día' : 'g / day'}`
      : '0';

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const speciesLabel =
    species === 'dog'
      ? isEs
        ? 'Perro (Canino)'
        : 'Dog (Canine)'
      : isEs
      ? 'Gato (Felino)'
      : 'Cat (Feline)';

  const copyText = isEs
    ? `Energía y alimento (${speciesLabel}) — DER: ${Math.round(der)} kcal/día | RER: ${Math.round(rer)} kcal/día | Porción diaria estimada: ${dailyFoodDisplay} (${currentStageName}, ${currentStage.factor}x)`
    : `Pet Energy & Food (${speciesLabel}) — DER: ${Math.round(der)} kcal / day | RER: ${Math.round(rer)} kcal / day | Estimated Daily Food: ${dailyFoodDisplay} (${currentStageName}, ${currentStage.factor}x)`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Perfil de mascota y alimento' : 'Pet Profile & Food Density'}
          subtitle={
            isEs
              ? 'Calcula el RER, el DER y la porción diaria estimada de alimento para perros y gatos.'
              : 'Calculate RER, DER, and estimated daily food portions for dogs and cats.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label={isEs ? 'Especie' : 'Species'} htmlFor={speciesId}>
              <select
                id={speciesId}
                value={species}
                onChange={(e) => {
                  const sp = e.target.value as 'dog' | 'cat';
                  setSpecies(sp);
                  setStageId(sp === 'dog' ? DOG_STAGES[0].id : CAT_STAGES[0].id);
                }}
                className="ui-input"
              >
                <option value="dog">{isEs ? 'Perro (Canino)' : 'Dog (Canine)'}</option>
                <option value="cat">{isEs ? 'Gato (Felino)' : 'Cat (Feline)'}</option>
              </select>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Etapa vital / Actividad' : 'Life Stage / Activity'}
              htmlFor={stageSelectId}
            >
              <select
                id={stageSelectId}
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="ui-input"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isEs ? s.nameEs : s.name} ({s.factor}x)
                  </option>
                ))}
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Peso corporal' : 'Body Weight'}
              htmlFor={weightId}
              unit={weightUnit}
              error={errors.weight}
            >
              <input
                id={weightId}
                type="number"
                min="0.5"
                max="300"
                step="0.5"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="30"
              />
            </ToolFieldGroup>

            <ToolFieldGroup label={isEs ? 'Unidad' : 'Unit'} htmlFor={weightUnitId}>
              <select
                id={weightUnitId}
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'lbs' | 'kg')}
                className="ui-input"
              >
                <option value="lbs">{isEs ? 'Libras (lbs)' : 'Pounds (lbs)'}</option>
                <option value="kg">{isEs ? 'Kilogramos (kg)' : 'Kilograms (kg)'}</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Densidad calórica del alimento' : 'Food Calorie Density'}
              htmlFor={caloriesId}
              unit={calorieUnit === 'cup' ? (isEs ? 'kcal/taza' : 'kcal/cup') : 'kcal/kg'}
              error={errors.foodCalories}
            >
              <input
                id={caloriesId}
                type="number"
                min="50"
                max="6000"
                step="any"
                value={foodCaloriesStr}
                onChange={(e) => setFoodCaloriesStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="350"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Unidad de densidad' : 'Density Unit'}
              htmlFor={calorieUnitId}
            >
              <select
                id={calorieUnitId}
                value={calorieUnit}
                onChange={(e) => setCalorieUnit(e.target.value as 'cup' | 'kg')}
                className="ui-input"
              >
                <option value="cup">{isEs ? 'kcal / taza' : 'kcal / cup'}</option>
                <option value="kg">kcal / kg</option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Nota de fórmula veterinaria:' : 'Veterinary Formula Note:'}
            </strong>{' '}
            {isEs
              ? 'Basado en el Requerimiento Energético en Reposo estándar (RER = 70 × kg^0.75) del Merck Veterinary Manual / guías WSAVA.'
              : 'Based on standard Resting Energy Requirement (RER = 70 × kg^0.75) from Merck Veterinary Manual / WSAVA guidelines.'}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Estimación de energía y alimento' : 'Energy & Food Estimation'}
          state={resultState}
          primaryLabel={
            isEs ? 'Requerimiento Energético Diario (DER)' : 'Daily Energy Requirement (DER)'
          }
          primaryValue={`${Math.round(der)}`}
          primaryUnit={isEs ? 'kcal / día' : 'kcal / day'}
          primarySubtext={`${speciesLabel} · ${currentStageName} (${currentStage.factor}x RER)`}
          statusLabel={`${currentStage.factor}x RER`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa peso y calorías del alimento' : 'Enter weight and food calories'}
          emptyDescription={
            isEs
              ? 'Indica el peso de tu mascota y la densidad calórica del alimento para calcular RER, DER y ración diaria.'
              : 'Provide your pet body weight and food calorie density to calculate RER, DER, and daily portions.'
          }
          errorTitle={isEs ? 'Datos no válidos' : 'Invalid energy & food inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Asegúrate de que el peso corporal y las calorías sean mayores que 0.'
              : 'Ensure body weight and food calorie density are greater than 0.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={
                isEs
                  ? 'Energía en reposo (RER)'
                  : 'Resting Energy Requirement (RER)'
              }
              value={`${Math.round(rer)} ${isEs ? 'kcal / día' : 'kcal / day'}`}
            />
            <ToolMetricTile
              label={isEs ? 'Porción diaria estimada' : 'Estimated Daily Food Portion'}
              value={dailyFoodDisplay}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs
                  ? 'Requerimiento Energético en Reposo (RER)'
                  : 'Resting Energy Requirement (RER)',
                value: `${Math.round(rer)} ${isEs ? 'kcal / día' : 'kcal / day'}`
              },
              {
                label: isEs
                  ? 'Requerimiento Energético Diario (DER)'
                  : 'Daily Energy Requirement (DER)',
                value: `${Math.round(der)} ${isEs ? 'kcal / día' : 'kcal / day'}`,
                highlight: true
              },
              {
                label: isEs ? 'Porción diaria estimada' : 'Estimated Daily Food Portion',
                value: dailyFoodDisplay
              },
              {
                label: isEs ? 'Factor de etapa vital' : 'Life Stage Multiplier',
                value: `${currentStage.factor}x (${currentStageName})`
              }
            ]}
          />

          <p className="text-xs text-text-tertiary border-t border-border-subtle pt-3">
            {isEs
              ? 'Las estimaciones sirven como referencia. Ajusta las porciones según la condición corporal (BCS) y consejo veterinario.'
              : 'Estimates serve as a guideline. Adjust portions based on body condition score (BCS) and veterinary advice.'}
          </p>
        </ToolResultsPanel>
      }
    />
  );
}
