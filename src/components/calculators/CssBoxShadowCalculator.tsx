import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';
import { UiCheckbox } from '../ui/AppPrimitives';

const DEFAULTS = {
  xOffset: 0,
  yOffset: 10,
  blur: 25,
  spread: -3,
  color: '#000000',
  opacity: 0.15,
  inset: false,
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

function hexToRgba(hex: string, alpha: number): string {
  const safeHex = HEX_REGEX.test(hex) ? hex : '#000000';
  const r = parseInt(safeHex.slice(1, 3), 16);
  const g = parseInt(safeHex.slice(3, 5), 16);
  const b = parseInt(safeHex.slice(5, 7), 16);
  const clampedAlpha = Math.max(0, Math.min(1, Number(alpha.toFixed(2))));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

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

export const CssBoxShadowCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [xOffset, setXOffset] = useState<number>(DEFAULTS.xOffset);
  const [yOffset, setYOffset] = useState<number>(DEFAULTS.yOffset);
  const [blur, setBlur] = useState<number>(DEFAULTS.blur);
  const [spread, setSpread] = useState<number>(DEFAULTS.spread);
  const [color, setColor] = useState<string>(DEFAULTS.color);
  const [opacity, setOpacity] = useState<number>(DEFAULTS.opacity);
  const [inset, setInset] = useState<boolean>(DEFAULTS.inset);

  const normalizedColor = color.trim().toUpperCase();
  const isValidHex = HEX_REGEX.test(normalizedColor);

  const shadowValue = useMemo(() => {
    const rgba = hexToRgba(normalizedColor, opacity);
    return `${inset ? 'inset ' : ''}${xOffset}px ${yOffset}px ${blur}px ${spread}px ${rgba}`;
  }, [xOffset, yOffset, blur, spread, normalizedColor, opacity, inset]);

  const cssCode = `box-shadow: ${shadowValue};`;
  const downloadableCss = `.shadow-box {\n  ${cssCode}\n}\n`;

  const handleReset = () => {
    setXOffset(DEFAULTS.xOffset);
    setYOffset(DEFAULTS.yOffset);
    setBlur(DEFAULTS.blur);
    setSpread(DEFAULTS.spread);
    setColor(DEFAULTS.color);
    setOpacity(DEFAULTS.opacity);
    setInset(DEFAULTS.inset);
  };

  const presets = [
    {
      label: isEs ? 'Tarjeta Suave' : 'Soft Card',
      onSelect: () => {
        setXOffset(0);
        setYOffset(10);
        setBlur(25);
        setSpread(-3);
        setColor('#000000');
        setOpacity(0.15);
        setInset(false);
      },
    },
    {
      label: isEs ? 'Elevación Profunda' : 'Deep Elevation',
      onSelect: () => {
        setXOffset(0);
        setYOffset(24);
        setBlur(48);
        setSpread(-12);
        setColor('#0F172A');
        setOpacity(0.32);
        setInset(false);
      },
    },
    {
      label: isEs ? 'Sombra Interior' : 'Inset Well',
      onSelect: () => {
        setXOffset(0);
        setYOffset(4);
        setBlur(14);
        setSpread(0);
        setColor('#000000');
        setOpacity(0.2);
        setInset(true);
      },
    },
    {
      label: isEs ? 'Resplandor Esmeralda' : 'Emerald Glow',
      onSelect: () => {
        setXOffset(0);
        setYOffset(8);
        setBlur(28);
        setSpread(-2);
        setColor('#059669');
        setOpacity(0.35);
        setInset(false);
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Parámetros de Sombra' : 'Shadow Parameters'}
      subtitle={
        isEs
          ? 'Ajusta desplazamiento, desenfoque, expansión y opacidad en tiempo real.'
          : 'Tune offset, blur, spread, color, and opacity in real time.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Ajustes rápidos' : 'Quick presets'} presets={presets} />

      <div className="space-y-3.5">
        <ToolFieldGroup
          label={isEs ? 'Desplazamiento Horizontal (X)' : 'Horizontal Offset (X)'}
          htmlFor="shadow-x"
          unit={`${xOffset}px`}
        >
          <input
            id="shadow-x"
            type="range"
            min={-50}
            max={50}
            value={xOffset}
            onChange={(e) => setXOffset(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Desplazamiento Vertical (Y)' : 'Vertical Offset (Y)'}
          htmlFor="shadow-y"
          unit={`${yOffset}px`}
        >
          <input
            id="shadow-y"
            type="range"
            min={-50}
            max={50}
            value={yOffset}
            onChange={(e) => setYOffset(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Radio de Desenfoque' : 'Blur Radius'}
          htmlFor="shadow-blur"
          unit={`${blur}px`}
        >
          <input
            id="shadow-blur"
            type="range"
            min={0}
            max={100}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Radio de Expansión' : 'Spread Radius'}
          htmlFor="shadow-spread"
          unit={`${spread}px`}
        >
          <input
            id="shadow-spread"
            type="range"
            min={-50}
            max={50}
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Opacidad' : 'Opacity'}
          htmlFor="shadow-opacity"
          unit={`${Math.round(opacity * 100)}%`}
        >
          <input
            id="shadow-opacity"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Color de Sombra (HEX)' : 'Shadow Color (HEX)'}
          htmlFor="shadow-color-hex"
          error={
            !isValidHex
              ? isEs
                ? 'Introduce un HEX válido de 6 dígitos (ej. #000000).'
                : 'Enter a valid 6-digit HEX color (e.g. #000000).'
              : undefined
          }
        >
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              aria-label={isEs ? 'Selector de color de sombra' : 'Shadow color picker'}
              value={isValidHex ? normalizedColor : '#000000'}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
            />
            <input
              id="shadow-color-hex"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              maxLength={7}
              className="ui-input font-mono uppercase"
            />
          </div>
        </ToolFieldGroup>

        <UiCheckbox
          id="shadow-inset"
          checked={inset}
          onChange={(e) => setInset(e.target.checked)}
          label={isEs ? 'Sombra interior (inset)' : 'Inset shadow (inner shadow)'}
        />
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!isValidHex}
          onClick={() => downloadBlob(downloadableCss, 'box-shadow.css', 'text/css;charset=utf-8')}
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
      state={isValidHex ? 'ready' : 'error'}
      errorTitle={isEs ? 'Color HEX no válido' : 'Invalid HEX Color'}
      errorMessage={
        isEs
          ? 'Corrige el color de sombra a formato #RRGGBB para generar el CSS.'
          : 'Fix the shadow color to #RRGGBB format to generate valid CSS.'
      }
      primaryLabel={isEs ? 'Propiedad CSS' : 'CSS Property'}
      primaryValue={`${xOffset}px ${yOffset}px ${blur}px ${spread}px`}
      primaryUnit={inset ? 'inset' : 'outset'}
      primarySubtext={hexToRgba(normalizedColor, opacity)}
      statusLabel={inset ? (isEs ? 'Interior' : 'Inset') : isEs ? 'Exterior' : 'Drop Shadow'}
      statusTone="accent"
      copyText={cssCode}
      copyLabel={isEs ? 'Copiar CSS' : 'Copy CSS'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValidHex && (
        <div className="space-y-4">
          {/* High-contrast light preview stage so dark shadows remain clearly visible in Dark theme */}
          <div className="rounded-lg border border-border-main bg-slate-100 dark:bg-slate-200 p-8 flex items-center justify-center min-h-[210px]">
            <div
              data-testid="box-shadow-preview"
              className="w-40 h-40 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center px-3 transition-shadow duration-150"
              style={{ boxShadow: shadowValue }}
            >
              <span className="text-xs font-semibold text-slate-800">
                {isEs ? 'Vista Previa' : 'Preview Card'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                {inset ? 'inset' : 'outset'} · {Math.round(opacity * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? 'Desplazamiento' : 'Offset (X / Y)'}
              value={`${xOffset}px / ${yOffset}px`}
            />
            <ToolMetricTile
              label={isEs ? 'Desenfoque / Expansión' : 'Blur / Spread'}
              value={`${blur}px / ${spread}px`}
              accent
            />
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
              {isEs ? 'Código CSS Generado' : 'Generated CSS Rule'}
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

export default CssBoxShadowCalculator;
