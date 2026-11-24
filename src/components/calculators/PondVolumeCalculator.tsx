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

type PondShape = 'rectangular' | 'circular' | 'irregular';

const DEFAULTS = {
  shape: 'rectangular' as PondShape,
  length: '12',
  width: '8',
  avgDepth: '2.5',
  shapeMultiplier: '0.67'
};

export default function PondVolumeCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [shape, setShape] = useState<PondShape>(DEFAULTS.shape);
  const [lengthStr, setLengthStr] = useState<string>(DEFAULTS.length);
  const [widthStr, setWidthStr] = useState<string>(DEFAULTS.width);
  const [avgDepthStr, setAvgDepthStr] = useState<string>(DEFAULTS.avgDepth);
  const [shapeMultiplierStr, setShapeMultiplierStr] = useState<string>(DEFAULTS.shapeMultiplier);

  const shapeId = useId();
  const lengthId = useId();
  const widthId = useId();
  const depthId = useId();
  const multiplierId = useId();

  const handleReset = () => {
    setShape(DEFAULTS.shape);
    setLengthStr(DEFAULTS.length);
    setWidthStr(DEFAULTS.width);
    setAvgDepthStr(DEFAULTS.avgDepth);
    setShapeMultiplierStr(DEFAULTS.shapeMultiplier);
  };

  const handleClear = () => {
    setLengthStr('');
    setWidthStr('');
    setAvgDepthStr('');
  };

  const effectiveWidthStr = shape === 'circular' ? lengthStr : widthStr;
  const isEmpty =
    lengthStr.trim() === '' ||
    avgDepthStr.trim() === '' ||
    (shape !== 'circular' && widthStr.trim() === '');

  const length = Number(lengthStr);
  const width = Number(effectiveWidthStr);
  const avgDepth = Number(avgDepthStr);
  const shapeMultiplier = Number(shapeMultiplierStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(length) || length <= 0) {
      errors.length = isEs
        ? shape === 'circular'
          ? 'El diámetro debe ser mayor que 0.'
          : 'El largo debe ser mayor que 0.'
        : shape === 'circular'
        ? 'Diameter must be greater than 0.'
        : 'Length must be greater than 0.';
    }
    if (shape !== 'circular' && (!Number.isFinite(width) || width <= 0)) {
      errors.width = isEs ? 'El ancho debe ser mayor que 0.' : 'Width must be greater than 0.';
    }
    if (!Number.isFinite(avgDepth) || avgDepth <= 0) {
      errors.avgDepth = isEs
        ? 'La profundidad promedio debe ser mayor que 0.'
        : 'Average depth must be greater than 0.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let cubicFeet = 0;
  let gallons = 0;
  let liters = 0;

  if (!isEmpty && !hasErrors) {
    if (shape === 'rectangular') {
      cubicFeet = length * width * avgDepth;
    } else if (shape === 'circular') {
      const radius = length / 2;
      cubicFeet = Math.PI * Math.pow(radius, 2) * avgDepth;
    } else {
      cubicFeet = length * width * avgDepth * shapeMultiplier;
    }

    gallons = cubicFeet * 7.48052;
    liters = gallons * 3.78541;
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';
  const unitFt = isEs ? 'pies' : 'ft';

  const copyText = isEs
    ? `Volumen de estanque — Capacidad total: ${Math.round(gallons).toLocaleString()} gal EE. UU. (${Math.round(liters).toLocaleString()} litros) | Volumen cúbico: ${Math.round(cubicFeet)} pies³`
    : `Pond Volume — Total Water Capacity: ${Math.round(gallons).toLocaleString()} US gal (${Math.round(liters).toLocaleString()} Liters) | Total Cubic Volume: ${Math.round(cubicFeet)} cu ft`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Forma y dimensiones del estanque' : 'Pond Shape & Dimensions'}
          subtitle={
            isEs
              ? 'Estima la capacidad de agua para estanques de jardín, estanques koi y fuentes.'
              : 'Estimate water capacity for garden ponds, koi ponds, and water features.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup label={isEs ? 'Forma del estanque' : 'Pond Shape'} htmlFor={shapeId}>
            <select
              id={shapeId}
              value={shape}
              onChange={(e) => {
                const s = e.target.value as PondShape;
                setShape(s);
                if (s === 'circular') setWidthStr(lengthStr);
              }}
              className="ui-input"
            >
              <option value="rectangular">
                {isEs ? 'Estanque rectangular / cuadrado' : 'Rectangular / Square Pond'}
              </option>
              <option value="circular">
                {isEs ? 'Estanque circular / pila' : 'Circular Pond / Basin'}
              </option>
              <option value="irregular">
                {isEs ? 'Estanque irregular / riñón' : 'Irregular / Kidney Pond'}
              </option>
            </select>
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ToolFieldGroup
              label={
                shape === 'circular'
                  ? isEs
                    ? 'Diámetro'
                    : 'Length / Diameter'
                  : isEs
                  ? 'Largo'
                  : 'Length'
              }
              htmlFor={lengthId}
              unit={unitFt}
              error={errors.length}
            >
              <input
                id={lengthId}
                type="number"
                min="1"
                max="200"
                step="any"
                value={lengthStr}
                onChange={(e) => {
                  const val = e.target.value;
                  setLengthStr(val);
                  if (shape === 'circular') setWidthStr(val);
                }}
                className="ui-input font-mono tabular-nums"
                placeholder="12"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Ancho' : 'Width'}
              htmlFor={widthId}
              unit={unitFt}
              error={errors.width}
            >
              <input
                id={widthId}
                type="number"
                min="1"
                max="200"
                step="any"
                disabled={shape === 'circular'}
                value={effectiveWidthStr}
                onChange={(e) => setWidthStr(e.target.value)}
                className="ui-input font-mono tabular-nums disabled:opacity-50"
                placeholder="8"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Profundidad prom.' : 'Avg Depth'}
              htmlFor={depthId}
              unit={unitFt}
              error={errors.avgDepth}
            >
              <input
                id={depthId}
                type="number"
                min="0.5"
                max="30"
                step="0.5"
                value={avgDepthStr}
                onChange={(e) => setAvgDepthStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="2.5"
              />
            </ToolFieldGroup>
          </div>

          {shape === 'irregular' && (
            <ToolFieldGroup
              label={
                isEs ? 'Multiplicador de forma irregular' : 'Irregular Shape Multiplier'
              }
              htmlFor={multiplierId}
            >
              <select
                id={multiplierId}
                value={shapeMultiplierStr}
                onChange={(e) => setShapeMultiplierStr(e.target.value)}
                className="ui-input"
              >
                <option value="0.85">
                  {isEs ? 'Regular / Ovalado (~0.85)' : 'Regular / Oval (~0.85)'}
                </option>
                <option value="0.67">
                  {isEs ? 'Riñón / Forma libre (~0.67)' : 'Kidney / Freeform (~0.67)'}
                </option>
                <option value="0.5">
                  {isEs ? 'Irregular / Triangular (~0.5)' : 'Irregular / Triangular (~0.5)'}
                </option>
              </select>
            </ToolFieldGroup>
          )}

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary">
            <strong className="text-text-primary">
              {isEs ? 'Estándar de estanques:' : 'Water Feature Standard:'}
            </strong>{' '}
            {isEs
              ? 'Utiliza la conversión estándar de ingeniería de 7.48 galones por pie cúbico de capacidad de agua.'
              : 'Uses standard engineering conversion of 7.48 gallons per cubic foot of water capacity.'}
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Volumen estimado del estanque' : 'Estimated Pond Volume'}
          state={resultState}
          primaryLabel={
            isEs ? 'Capacidad total de agua (Galones)' : 'Total Water Capacity (Gallons)'
          }
          primaryValue={Math.round(gallons).toLocaleString()}
          primaryUnit={isEs ? 'gal EE. UU.' : 'US gal'}
          primarySubtext={`${Math.round(liters).toLocaleString()} ${
            isEs ? 'Litros' : 'Liters'
          } · ${Math.round(cubicFeet)} ${isEs ? 'pies³' : 'cu ft'}`}
          statusLabel={`${Math.round(cubicFeet)} ${isEs ? 'pies³' : 'cu ft'}`}
          statusTone="accent"
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa las dimensiones del estanque' : 'Enter pond dimensions'}
          emptyDescription={
            isEs
              ? 'Indica el largo, ancho y profundidad promedio en pies para calcular galones y litros.'
              : 'Provide length, width, and average depth in feet to estimate pond capacity in gallons and liters.'
          }
          errorTitle={isEs ? 'Dimensiones no válidas' : 'Invalid pond dimensions'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica que todas las dimensiones sean mayores que 0.'
              : 'Ensure all pond dimensions are greater than 0.')
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={
                isEs ? 'Capacidad total (Litros)' : 'Total Water Capacity (Liters)'
              }
              value={`${Math.round(liters).toLocaleString()} ${isEs ? 'Litros' : 'Liters'}`}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Volumen cúbico total' : 'Total Cubic Volume'}
              value={`${Math.round(cubicFeet)} ${isEs ? 'pies³' : 'cu ft'}`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Capacidad total (Galones EE. UU.)' : 'Total Water Capacity (US Gallons)',
                value: `${Math.round(gallons).toLocaleString()} ${isEs ? 'gal EE. UU.' : 'US gal'}`,
                highlight: true
              },
              {
                label: isEs ? 'Capacidad total (Litros)' : 'Total Water Capacity (Liters)',
                value: `${Math.round(liters).toLocaleString()} ${isEs ? 'Litros' : 'Liters'}`
              },
              {
                label: isEs ? 'Volumen cúbico total' : 'Total Cubic Volume',
                value: `${Math.round(cubicFeet)} ${isEs ? 'pies³' : 'cu ft'}`
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
