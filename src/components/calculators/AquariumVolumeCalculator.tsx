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

type TankShape = 'rectangular' | 'cylindrical';
type UnitSystem = 'inches' | 'cm';

const DEFAULTS = {
  shape: 'rectangular' as TankShape,
  unitSystem: 'inches' as UnitSystem,
  length: '36',
  width: '18',
  height: '20',
  diameter: '24',
  displacementPercent: '10'
};

export default function AquariumVolumeCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [shape, setShape] = useState<TankShape>(DEFAULTS.shape);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULTS.unitSystem);
  const [lengthStr, setLengthStr] = useState<string>(DEFAULTS.length);
  const [widthStr, setWidthStr] = useState<string>(DEFAULTS.width);
  const [heightStr, setHeightStr] = useState<string>(DEFAULTS.height);
  const [diameterStr, setDiameterStr] = useState<string>(DEFAULTS.diameter);
  const [displacementStr, setDisplacementStr] = useState<string>(DEFAULTS.displacementPercent);

  const shapeId = useId();
  const unitId = useId();
  const lengthId = useId();
  const widthId = useId();
  const heightId = useId();
  const diameterId = useId();
  const displacementId = useId();

  const handleReset = () => {
    setShape(DEFAULTS.shape);
    setUnitSystem(DEFAULTS.unitSystem);
    setLengthStr(DEFAULTS.length);
    setWidthStr(DEFAULTS.width);
    setHeightStr(DEFAULTS.height);
    setDiameterStr(DEFAULTS.diameter);
    setDisplacementStr(DEFAULTS.displacementPercent);
  };

  const handleClear = () => {
    setLengthStr('');
    setWidthStr('');
    setHeightStr('');
    setDiameterStr('');
    setDisplacementStr('');
  };

  const isEmpty =
    shape === 'rectangular'
      ? lengthStr.trim() === '' ||
        widthStr.trim() === '' ||
        heightStr.trim() === '' ||
        displacementStr.trim() === ''
      : diameterStr.trim() === '' || heightStr.trim() === '' || displacementStr.trim() === '';

  const length = Number(lengthStr);
  const width = Number(widthStr);
  const height = Number(heightStr);
  const diameter = Number(diameterStr);
  const displacementPercent = Number(displacementStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (shape === 'rectangular') {
      if (!Number.isFinite(length) || length <= 0) {
        errors.length = isEs
          ? 'El largo debe ser mayor que 0.'
          : 'Length must be greater than 0.';
      }
      if (!Number.isFinite(width) || width <= 0) {
        errors.width = isEs
          ? 'El ancho debe ser mayor que 0.'
          : 'Width must be greater than 0.';
      }
    } else {
      if (!Number.isFinite(diameter) || diameter <= 0) {
        errors.diameter = isEs
          ? 'El diámetro debe ser mayor que 0.'
          : 'Diameter must be greater than 0.';
      }
    }
    if (!Number.isFinite(height) || height <= 0) {
      errors.height = isEs ? 'La altura debe ser mayor que 0.' : 'Height must be greater than 0.';
    }
    if (!Number.isFinite(displacementPercent) || displacementPercent < 0 || displacementPercent > 50) {
      errors.displacement = isEs
        ? 'El desplazamiento debe estar entre 0% y 50%.'
        : 'Displacement must be between 0% and 50%.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let grossGallons = 0;
  let grossLiters = 0;
  let netGallons = 0;
  let netLiters = 0;

  if (!isEmpty && !hasErrors) {
    let grossVolume = 0;
    if (shape === 'rectangular') {
      grossVolume = length * width * height;
    } else {
      const radius = diameter / 2;
      grossVolume = Math.PI * Math.pow(radius, 2) * height;
    }

    if (unitSystem === 'inches') {
      grossGallons = grossVolume / 231;
      grossLiters = grossGallons * 3.78541;
    } else {
      grossLiters = grossVolume / 1000;
      grossGallons = grossLiters / 3.78541;
    }

    netGallons = grossGallons * (1 - displacementPercent / 100);
    netLiters = grossLiters * (1 - displacementPercent / 100);
  }

  const unitAbbr = unitSystem === 'inches' ? (isEs ? 'pulg' : 'inches') : 'cm';
  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const copyText = isEs
    ? `Volumen de acuario — Volumen neto útil: ${Math.round(netGallons)} gal EE. UU. (${Math.round(netLiters)} litros) | Capacidad bruta: ${Math.round(grossGallons)} gal / ${Math.round(grossLiters)} L | Desplazamiento: ${displacementPercent}%`
    : `Aquarium Volume — Net Usable Water: ${Math.round(netGallons)} US gal (${Math.round(netLiters)} Liters) | Gross Capacity: ${Math.round(grossGallons)} US gal / ${Math.round(grossLiters)} L | Displacement: ${displacementPercent}%`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Dimensiones del acuario' : 'Tank Dimensions & Displacement'}
          subtitle={
            isEs
              ? 'Calcula el volumen bruto y neto útil de agua para acuarios rectangulares y cilíndricos.'
              : 'Calculate gross and net usable water volume for rectangular and cylindrical aquariums.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup label={isEs ? 'Forma del acuario' : 'Tank Shape'} htmlFor={shapeId}>
              <select
                id={shapeId}
                value={shape}
                onChange={(e) => setShape(e.target.value as TankShape)}
                className="ui-input"
              >
                <option value="rectangular">
                  {isEs ? 'Acuario rectangular' : 'Rectangular Tank'}
                </option>
                <option value="cylindrical">
                  {isEs ? 'Cilíndrico / Columna' : 'Cylindrical / Column'}
                </option>
              </select>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Sistema de unidades' : 'Unit System'}
              htmlFor={unitId}
            >
              <select
                id={unitId}
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
                className="ui-input"
              >
                <option value="inches">
                  {isEs ? 'Pulgadas (Imperial)' : 'Inches (Imperial)'}
                </option>
                <option value="cm">
                  {isEs ? 'Centímetros (Métrico)' : 'Centimeters (Metric)'}
                </option>
              </select>
            </ToolFieldGroup>
          </div>

          {shape === 'rectangular' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ToolFieldGroup
                label={isEs ? 'Largo' : 'Length'}
                htmlFor={lengthId}
                unit={unitAbbr}
                error={errors.length}
              >
                <input
                  id={lengthId}
                  type="number"
                  min="2"
                  max="300"
                  step="any"
                  value={lengthStr}
                  onChange={(e) => setLengthStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="36"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={isEs ? 'Ancho' : 'Width'}
                htmlFor={widthId}
                unit={unitAbbr}
                error={errors.width}
              >
                <input
                  id={widthId}
                  type="number"
                  min="2"
                  max="200"
                  step="any"
                  value={widthStr}
                  onChange={(e) => setWidthStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="18"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={isEs ? 'Altura' : 'Height'}
                htmlFor={heightId}
                unit={unitAbbr}
                error={errors.height}
              >
                <input
                  id={heightId}
                  type="number"
                  min="2"
                  max="200"
                  step="any"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="20"
                />
              </ToolFieldGroup>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ToolFieldGroup
                label={isEs ? 'Diámetro' : 'Diameter'}
                htmlFor={diameterId}
                unit={unitAbbr}
                error={errors.diameter}
              >
                <input
                  id={diameterId}
                  type="number"
                  min="2"
                  max="200"
                  step="any"
                  value={diameterStr}
                  onChange={(e) => setDiameterStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="24"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={isEs ? 'Altura' : 'Height'}
                htmlFor={heightId}
                unit={unitAbbr}
                error={errors.height}
              >
                <input
                  id={heightId}
                  type="number"
                  min="2"
                  max="200"
                  step="any"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value)}
                  className="ui-input font-mono tabular-nums"
                  placeholder="20"
                />
              </ToolFieldGroup>
            </div>
          )}

          <ToolFieldGroup
            label={
              isEs
                ? 'Desplazamiento por sustrato y decoración'
                : 'Substrate & Decor Displacement'
            }
            htmlFor={displacementId}
            unit="%"
            error={errors.displacement}
          >
            <input
              id={displacementId}
              type="number"
              min="0"
              max="50"
              step="any"
              value={displacementStr}
              onChange={(e) => setDisplacementStr(e.target.value)}
              className="ui-input font-mono tabular-nums"
              placeholder="10"
            />
          </ToolFieldGroup>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Nota de ingeniería:' : 'Engineering Note:'}
            </strong>{' '}
            {isEs
              ? 'Calcula el volumen interno considerando el desplazamiento por grava, rocas, troncos y decoración.'
              : 'Calculates internal volume based on glass/acrylic thickness adjustments and substrate displacement.'}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultados de volumen' : 'Volume Calculation Results'}
          state={resultState}
          primaryLabel={isEs ? 'Volumen neto útil de agua' : 'Net Usable Water Volume'}
          primaryValue={`${Math.round(netGallons)}`}
          primaryUnit={isEs ? 'gal EE. UU.' : 'US gal'}
          primarySubtext={`${Math.round(netLiters)} ${isEs ? 'Litros' : 'Liters'}`}
          statusLabel={`${displacementPercent}% ${isEs ? 'despl.' : 'disp.'}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa las dimensiones del acuario' : 'Enter aquarium dimensions'}
          emptyDescription={
            isEs
              ? 'Indica las medidas y el porcentaje de desplazamiento para calcular la capacidad neta y bruta.'
              : 'Provide tank dimensions and substrate displacement percentage to calculate gross and net water volume.'
          }
          errorTitle={isEs ? 'Dimensiones no válidas' : 'Invalid aquarium inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica que las dimensiones sean positivas y el desplazamiento esté entre 0% y 50%.'
              : 'Ensure dimensions are positive and displacement is between 0% and 50%.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Capacidad bruta' : 'Gross Capacity'}
              value={`${Math.round(grossGallons)} ${isEs ? 'gal' : 'US gal'} / ${Math.round(grossLiters)} L`}
            />
            <ToolMetricTile
              label={isEs ? 'Volumen neto (Litros)' : 'Net Volume (Liters)'}
              value={`${Math.round(netLiters)} ${isEs ? 'Litros' : 'Liters'}`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Capacidad bruta (Galones EE. UU.)' : 'Gross Capacity (US Gallons)',
                value: `${Math.round(grossGallons)} ${isEs ? 'gal EE. UU.' : 'US gal'}`
              },
              {
                label: isEs ? 'Capacidad bruta (Litros)' : 'Gross Capacity (Liters)',
                value: `${Math.round(grossLiters)} L`
              },
              {
                label: isEs ? 'Volumen neto útil' : 'Net Usable Water Volume',
                value: `${Math.round(netGallons)} ${isEs ? 'gal EE. UU.' : 'US gal'} (${Math.round(netLiters)} L)`,
                highlight: true
              }
            ]}
          />

          <p className="text-xs text-text-tertiary border-t border-border-subtle pt-3">
            {isEs
              ? `Contempla un ${displacementPercent}% de desplazamiento por grava, rocas y troncos.`
              : `Accounts for ${displacementPercent}% displacement due to gravel, rocks, and driftwood.`}
          </p>
        </ToolResultsPanel>
      }
    />
  );
}
