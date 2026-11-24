import React, { useMemo, useState } from 'react';
import { Download, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
  ToolSegmentedControl,
} from '../calculator/ToolWorkspacePrimitives';

type GradientType = 'linear' | 'radial';

const DEFAULTS = {
  gradientType: 'linear' as GradientType,
  angle: 90,
  color1: '#3B82F6',
  color2: '#8B5CF6',
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const CssGradientGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [gradientType, setGradientType] = useState<GradientType>(DEFAULTS.gradientType);
  const [angle, setAngle] = useState<number>(DEFAULTS.angle);
  const [color1, setColor1] = useState<string>(DEFAULTS.color1);
  const [color2, setColor2] = useState<string>(DEFAULTS.color2);

  const hex1 = color1.trim().toUpperCase();
  const hex2 = color2.trim().toUpperCase();
  const isHex1Valid = HEX_REGEX.test(hex1);
  const isHex2Valid = HEX_REGEX.test(hex2);
  const isValid = isHex1Valid && isHex2Valid;

  const gradientCss = useMemo(() => {
    if (!isValid) return '';
    return gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${hex1}, ${hex2})`
      : `radial-gradient(circle, ${hex1}, ${hex2})`;
  }, [gradientType, angle, hex1, hex2, isValid]);

  const cssCode = gradientCss ? `background: ${gradientCss};` : '';
  const downloadableCss = cssCode ? `.gradient-surface {\n  ${cssCode}\n}\n` : '';

  const handleReset = () => {
    setGradientType(DEFAULTS.gradientType);
    setAngle(DEFAULTS.angle);
    setColor1(DEFAULTS.color1);
    setColor2(DEFAULTS.color2);
  };

  const handleSwapColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  const presets = [
    {
      label: isEs ? 'Océano' : 'Ocean',
      onSelect: () => {
        setGradientType('linear');
        setAngle(90);
        setColor1('#3B82F6');
        setColor2('#8B5CF6');
      },
    },
    {
      label: isEs ? 'Esmeralda' : 'Emerald',
      onSelect: () => {
        setGradientType('linear');
        setAngle(135);
        setColor1('#059669');
        setColor2('#0EA5E9');
      },
    },
    {
      label: isEs ? 'Atardecer' : 'Sunset',
      onSelect: () => {
        setGradientType('linear');
        setAngle(45);
        setColor1('#F97316');
        setColor2('#EC4899');
      },
    },
    {
      label: isEs ? 'Radial Aurora' : 'Radial Aurora',
      onSelect: () => {
        setGradientType('radial');
        setColor1('#10B981');
        setColor2('#0F172A');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Configuración del Degradado' : 'Gradient Controls'}
      subtitle={
        isEs
          ? 'Define tipo, ángulo y paradas de color para generar CSS limpio.'
          : 'Configure gradient type, angle, and color stops for clean CSS.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Degradados rápidos' : 'Quick presets'} presets={presets} />

      <ToolFieldGroup label={isEs ? 'Tipo de Degradado' : 'Gradient Type'}>
        <ToolSegmentedControl<GradientType>
          ariaLabel={isEs ? 'Tipo de degradado CSS' : 'CSS gradient type'}
          value={gradientType}
          onChange={setGradientType}
          options={[
            { value: 'linear', label: isEs ? 'Lineal' : 'Linear' },
            { value: 'radial', label: isEs ? 'Radial' : 'Radial' },
          ]}
        />
      </ToolFieldGroup>

      {gradientType === 'linear' && (
        <ToolFieldGroup
          label={isEs ? 'Ángulo de Dirección' : 'Direction Angle'}
          htmlFor="gradient-angle"
          unit={`${angle}°`}
        >
          <input
            id="gradient-angle"
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup
          label={isEs ? 'Color 1 (Inicio)' : 'Color 1 (Start)'}
          htmlFor="gradient-color-1"
          error={
            !isHex1Valid
              ? isEs
                ? 'HEX inválido (#RRGGBB)'
                : 'Invalid HEX (#RRGGBB)'
              : undefined
          }
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={isEs ? 'Selector color 1' : 'Color 1 picker'}
              value={isHex1Valid ? hex1 : DEFAULTS.color1}
              onChange={(e) => setColor1(e.target.value.toUpperCase())}
              className="h-10 w-11 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
            />
            <input
              id="gradient-color-1"
              type="text"
              value={color1}
              onChange={(e) => setColor1(e.target.value.toUpperCase())}
              maxLength={7}
              className="ui-input font-mono uppercase"
            />
          </div>
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Color 2 (Fin)' : 'Color 2 (End)'}
          htmlFor="gradient-color-2"
          error={
            !isHex2Valid
              ? isEs
                ? 'HEX inválido (#RRGGBB)'
                : 'Invalid HEX (#RRGGBB)'
              : undefined
          }
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={isEs ? 'Selector color 2' : 'Color 2 picker'}
              value={isHex2Valid ? hex2 : DEFAULTS.color2}
              onChange={(e) => setColor2(e.target.value.toUpperCase())}
              className="h-10 w-11 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
            />
            <input
              id="gradient-color-2"
              type="text"
              value={color2}
              onChange={(e) => setColor2(e.target.value.toUpperCase())}
              maxLength={7}
              className="ui-input font-mono uppercase"
            />
          </div>
        </ToolFieldGroup>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={handleSwapColors}
          className="ui-btn-secondary inline-flex items-center gap-1.5"
        >
          <ArrowLeftRight className="w-4 h-4" />
          {isEs ? 'Invertir Colores' : 'Swap Colors'}
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => downloadBlob(downloadableCss, 'gradient.css', 'text/css;charset=utf-8')}
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar CSS' : 'Download CSS'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Vista Previa y Código CSS' : 'Live Preview & CSS Code'}
      state={isValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Colores HEX no válidos' : 'Invalid HEX Colors'}
      errorMessage={
        isEs
          ? 'Ambos colores deben tener formato hexadecimal #RRGGBB.'
          : 'Both color stops must be valid 6-digit #RRGGBB hex codes.'
      }
      primaryLabel={isEs ? 'Tipo y Paradas' : 'Type & Color Stops'}
      primaryValue={gradientType === 'linear' ? `${angle}°` : 'Circle'}
      primaryUnit={gradientType === 'linear' ? 'linear-gradient' : 'radial-gradient'}
      primarySubtext={isValid ? `${hex1} → ${hex2}` : undefined}
      statusLabel={isEs ? 'Listo para CSS' : 'CSS Ready'}
      statusTone="accent"
      copyText={cssCode}
      copyLabel={isEs ? 'Copiar CSS' : 'Copy CSS'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValid && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border-main bg-surface-secondary p-2.5">
            <div
              data-testid="gradient-preview"
              className="w-full h-44 rounded-md border border-black/10 dark:border-white/15"
              style={{ background: gradientCss }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? 'Color Inicio' : 'Start Stop'}
              value={hex1}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Color Fin' : 'End Stop'}
              value={hex2}
            />
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
              {isEs ? 'Regla CSS Generada' : 'Generated CSS Rule'}
            </span>
            <pre className="p-3 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto whitespace-pre-wrap break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default CssGradientGeneratorCalculator;
