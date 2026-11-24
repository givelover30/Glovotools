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

interface WeightSpecies {
  id: string;
  name: string;
  nameEs: string;
  divisor: number; // Formula divisor (e.g. 300 for cattle, 400 for pigs)
  source: string;
}

const WEIGHT_SPECIES: WeightSpecies[] = [
  {
    id: 'cattle',
    name: 'Cattle (Beef / Dairy)',
    nameEs: 'Ganado bovino (Carne / Leche)',
    divisor: 300,
    source: "Shaffer's Equation / USDA Extension"
  },
  {
    id: 'pig',
    name: 'Swine (Pigs)',
    nameEs: 'Porcinos (Cerdos)',
    divisor: 400,
    source: 'Swine Zoometric Formula'
  },
  {
    id: 'horse',
    name: 'Horse (Equine)',
    nameEs: 'Caballo (Equino)',
    divisor: 330,
    source: 'Creighton Equine Formula'
  }
];

const DEFAULTS = {
  speciesId: 'cattle',
  heartGirth: '72',
  bodyLength: '60',
  unitSystem: 'imperial' as 'imperial' | 'metric'
};

export default function LivestockWeightEstimator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [speciesId, setSpeciesId] = useState<string>(DEFAULTS.speciesId);
  const [heartGirthStr, setHeartGirthStr] = useState<string>(DEFAULTS.heartGirth);
  const [bodyLengthStr, setBodyLengthStr] = useState<string>(DEFAULTS.bodyLength);
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>(DEFAULTS.unitSystem);

  const speciesSelectId = useId();
  const unitSelectId = useId();
  const girthId = useId();
  const lengthId = useId();

  const handleReset = () => {
    setSpeciesId(DEFAULTS.speciesId);
    setHeartGirthStr(DEFAULTS.heartGirth);
    setBodyLengthStr(DEFAULTS.bodyLength);
    setUnitSystem(DEFAULTS.unitSystem);
  };

  const handleClear = () => {
    setHeartGirthStr('');
    setBodyLengthStr('');
  };

  const species = WEIGHT_SPECIES.find((s) => s.id === speciesId) || WEIGHT_SPECIES[0];
  const speciesName = isEs ? species.nameEs : species.name;

  const isEmpty = heartGirthStr.trim() === '' || bodyLengthStr.trim() === '';
  const heartGirth = Number(heartGirthStr);
  const bodyLength = Number(bodyLengthStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(heartGirth) || heartGirth <= 0) {
      errors.heartGirth = isEs
        ? 'El perímetro torácico debe ser mayor que 0.'
        : 'Heart girth must be greater than 0.';
    }
    if (!Number.isFinite(bodyLength) || bodyLength <= 0) {
      errors.bodyLength = isEs
        ? 'El largo corporal debe ser mayor que 0.'
        : 'Body length must be greater than 0.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let weightLbs = 0;
  let weightKg = 0;

  if (!isEmpty && !hasErrors) {
    const girthInches = unitSystem === 'metric' ? heartGirth / 2.54 : heartGirth;
    const lengthInches = unitSystem === 'metric' ? bodyLength / 2.54 : bodyLength;

    weightLbs = (Math.pow(girthInches, 2) * lengthInches) / species.divisor;
    weightKg = weightLbs / 2.20462;
  }

  const measureUnit = unitSystem === 'metric' ? 'cm' : 'in';
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = isEs
    ? `Peso vivo estimado (${speciesName}) — ${Math.round(weightLbs)} lbs (${Math.round(weightKg)} kg) | Perímetro torácico: ${heartGirth} ${measureUnit}, Largo: ${bodyLength} ${measureUnit}`
    : `Estimated Live Weight (${speciesName}) — ${Math.round(weightLbs)} lbs (${Math.round(weightKg)} kg) | Heart Girth: ${heartGirth} ${measureUnit}, Length: ${bodyLength} ${measureUnit}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Medidas zoométricas del animal' : 'Species & Body Measurements'}
          subtitle={
            isEs
              ? 'Estima el peso corporal vivo mediante el perímetro torácico y el largo del cuerpo.'
              : 'Estimate live body weight using heart girth and body length measurements.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Seleccionar especie' : 'Select Species'}
              htmlFor={speciesSelectId}
            >
              <select
                id={speciesSelectId}
                value={speciesId}
                onChange={(e) => setSpeciesId(e.target.value)}
                className="ui-input"
              >
                {WEIGHT_SPECIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isEs ? s.nameEs : s.name}
                  </option>
                ))}
              </select>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Sistema de unidades' : 'Unit System'}
              htmlFor={unitSelectId}
            >
              <select
                id={unitSelectId}
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as 'imperial' | 'metric')}
                className="ui-input"
              >
                <option value="imperial">
                  {isEs ? 'Imperial (Pulgadas)' : 'Imperial (Inches)'}
                </option>
                <option value="metric">
                  {isEs ? 'Métrico (Centímetros)' : 'Metric (Centimeters)'}
                </option>
              </select>
            </ToolFieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Perímetro torácico' : 'Heart Girth'}
              htmlFor={girthId}
              unit={measureUnit}
              error={errors.heartGirth}
            >
              <input
                id={girthId}
                type="number"
                min="10"
                max="200"
                step="any"
                value={heartGirthStr}
                onChange={(e) => setHeartGirthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="72"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Largo corporal' : 'Body Length'}
              htmlFor={lengthId}
              unit={measureUnit}
              error={errors.bodyLength}
            >
              <input
                id={lengthId}
                type="number"
                min="10"
                max="200"
                step="any"
                value={bodyLengthStr}
                onChange={(e) => setBodyLengthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="60"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Referencia de fórmula:' : 'Formula Reference:'}
            </strong>{' '}
            {species.source}.{' '}
            {isEs
              ? `Fórmula: (Perímetro² × Largo) ÷ ${species.divisor}.`
              : `Formula: (Girth² × Length) ÷ ${species.divisor}.`}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Peso vivo estimado' : 'Estimated Live Weight'}
          state={resultState}
          primaryLabel={isEs ? 'Peso estimado (Libras)' : 'Estimated Weight (Pounds)'}
          primaryValue={`${Math.round(weightLbs)}`}
          primaryUnit="lbs"
          primarySubtext={`${Math.round(weightKg)} kg · ${speciesName}`}
          statusLabel={`÷ ${species.divisor}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa perímetro y largo' : 'Enter girth and length measurements'}
          emptyDescription={
            isEs
              ? 'Indica el perímetro torácico y el largo corporal para estimar el peso vivo en libras y kilogramos.'
              : 'Provide heart girth and body length measurements to estimate live weight in pounds and kilograms.'
          }
          errorTitle={isEs ? 'Medidas no válidas' : 'Invalid measurement inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Asegúrate de que ambas medidas sean mayores que 0.'
              : 'Ensure both heart girth and body length are greater than 0.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Peso estimado (Kilogramos)' : 'Estimated Weight (Kilograms)'}
              value={`${Math.round(weightKg)} kg`}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Divisor de especie' : 'Species Divisor'}
              value={`${species.divisor}`}
              hint={species.source}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Especie' : 'Species',
                value: speciesName
              },
              {
                label: isEs ? 'Peso estimado (Libras)' : 'Estimated Weight (Pounds)',
                value: `${Math.round(weightLbs)} lbs`,
                highlight: true
              },
              {
                label: isEs ? 'Peso estimado (Kilogramos)' : 'Estimated Weight (Kilograms)',
                value: `${Math.round(weightKg)} kg`
              }
            ]}
          />

          <p className="text-xs text-text-tertiary border-t border-border-subtle pt-3">
            {isEs
              ? 'Margen de error esperado: ± 5–10% en comparación con básculas certificadas.'
              : 'Expected error margin: ± 5–10% compared to certified scales.'}
          </p>
        </ToolResultsPanel>
      }
    />
  );
}
