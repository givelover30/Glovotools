import React, { useMemo, useState } from 'react';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';

type HarmonyMode = 'analogous' | 'triad' | 'complementary' | 'monochromatic';

const DEFAULT_BASE_COLOR = '#6366F1';
const DEFAULT_HARMONY: HarmonyMode = 'analogous';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  const clampedL = Math.max(0, Math.min(100, l)) / 100;
  const a = (Math.max(0, Math.min(100, s)) * Math.min(clampedL, 1 - clampedL)) / 100;
  const f = (n: number) => {
    const k = (n + normalizedH / 30) % 12;
    const color = clampedL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToRgbString(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function getRelativeLuminance(hex: string): number {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
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

export const ColorPaletteCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [baseColor, setBaseColor] = useState<string>(DEFAULT_BASE_COLOR);
  const [harmony, setHarmony] = useState<HarmonyMode>(DEFAULT_HARMONY);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const normalizedHex = baseColor.trim().toUpperCase();
  const isValidHex = HEX_REGEX.test(normalizedHex);

  const palette = useMemo(() => {
    if (!isValidHex) return [];
    const [h, s, l] = hexToHsl(normalizedHex);

    if (harmony === 'analogous') {
      return [
        hslToHex(h - 30, s, l),
        hslToHex(h - 15, s, l),
        normalizedHex,
        hslToHex(h + 15, s, l),
        hslToHex(h + 30, s, l),
      ];
    }
    if (harmony === 'triad') {
      return [
        normalizedHex,
        hslToHex(h + 120, s, l),
        hslToHex(h + 240, s, l),
        hslToHex(h + 120, s, Math.min(90, l + 15)),
        hslToHex(h + 240, s, Math.max(10, l - 15)),
      ];
    }
    if (harmony === 'complementary') {
      return [
        hslToHex(h, s, Math.max(15, l - 20)),
        normalizedHex,
        hslToHex(h, s, Math.min(85, l + 20)),
        hslToHex(h + 180, s, l),
        hslToHex(h + 180, s, Math.min(85, l + 20)),
      ];
    }
    return [
      hslToHex(h, s, Math.max(10, l - 30)),
      hslToHex(h, s, Math.max(20, l - 15)),
      normalizedHex,
      hslToHex(h, s, Math.min(85, l + 15)),
      hslToHex(h, s, Math.min(95, l + 30)),
    ];
  }, [normalizedHex, harmony, isValidHex]);

  const cssVariablesOutput = useMemo(() => {
    if (!palette.length) return '';
    return `:root {\n${palette.map((c, idx) => `  --color-${idx + 1}: ${c};`).join('\n')}\n}`;
  }, [palette]);

  const jsonOutput = useMemo(() => {
    if (!palette.length) return '';
    return JSON.stringify(
      {
        baseColor: normalizedHex,
        harmony,
        swatches: palette.map((hex, index) => {
          const [h, s, l] = hexToHsl(hex);
          return {
            token: `--color-${index + 1}`,
            hex,
            rgb: hexToRgbString(hex),
            hsl: `hsl(${h}, ${s}%, ${l}%)`,
          };
        }),
      },
      null,
      2
    );
  }, [palette, normalizedHex, harmony]);

  const copyValue = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1500);
  };

  const handleRandomize = () => {
    const buf = new Uint8Array(3);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(buf);
    } else {
      buf[0] = Math.floor(Math.random() * 256);
      buf[1] = Math.floor(Math.random() * 256);
      buf[2] = Math.floor(Math.random() * 256);
    }
    const randomHex =
      '#' +
      Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
    setBaseColor(randomHex);
  };

  const handleReset = () => {
    setBaseColor(DEFAULT_BASE_COLOR);
    setHarmony(DEFAULT_HARMONY);
    setCopiedKey(null);
  };

  const baseHsl = isValidHex ? hexToHsl(normalizedHex) : null;

  const harmonyLabels: Record<HarmonyMode, string> = {
    analogous: isEs ? 'Análoga (30°)' : 'Analogous (30°)',
    triad: isEs ? 'Tríada (120°)' : 'Triadic (120°)',
    complementary: isEs ? 'Complementaria (180°)' : 'Complementary (180°)',
    monochromatic: isEs ? 'Monocromática' : 'Monochromatic',
  };

  const presets = [
    {
      label: isEs ? 'Índigo Análogo' : 'Indigo Analogous',
      onSelect: () => {
        setBaseColor('#6366F1');
        setHarmony('analogous');
      },
    },
    {
      label: isEs ? 'Esmeralda Tríada' : 'Emerald Triad',
      onSelect: () => {
        setBaseColor('#059669');
        setHarmony('triad');
      },
    },
    {
      label: isEs ? 'Coral Complementario' : 'Coral Complementary',
      onSelect: () => {
        setBaseColor('#E11D48');
        setHarmony('complementary');
      },
    },
    {
      label: isEs ? 'Ámbar Monocromático' : 'Amber Monochrome',
      onSelect: () => {
        setBaseColor('#D97706');
        setHarmony('monochromatic');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Configuración de Paleta' : 'Palette Configuration'}
      subtitle={
        isEs
          ? 'Selecciona un color base HEX y una regla de armonía HSL.'
          : 'Choose a base HEX color and an HSL color harmony rule.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar
        label={isEs ? 'Paletas rápidas' : 'Quick palettes'}
        presets={presets}
      />

      <ToolFieldGroup
        label={isEs ? 'Color Base (HEX)' : 'Base Color (HEX)'}
        htmlFor="palette-base-hex"
        error={
          !isValidHex
            ? isEs
              ? 'Introduce un código HEX válido de 6 dígitos (ej. #6366F1).'
              : 'Enter a valid 6-digit HEX color (e.g. #6366F1).'
            : undefined
        }
      >
        <div className="flex items-center gap-2.5">
          <input
            type="color"
            aria-label={isEs ? 'Selector visual de color base' : 'Base color picker'}
            value={isValidHex ? normalizedHex : DEFAULT_BASE_COLOR}
            onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
            className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
          />
          <input
            id="palette-base-hex"
            type="text"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
            maxLength={7}
            placeholder="#6366F1"
            className="ui-input font-mono uppercase"
          />
        </div>
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Regla de Armonía' : 'Harmony Rule'}
        htmlFor="palette-harmony"
      >
        <select
          id="palette-harmony"
          value={harmony}
          onChange={(e) => setHarmony(e.target.value as HarmonyMode)}
          className="ui-select"
        >
          <option value="analogous">{harmonyLabels.analogous}</option>
          <option value="triad">{harmonyLabels.triad}</option>
          <option value="complementary">{harmonyLabels.complementary}</option>
          <option value="monochromatic">{harmonyLabels.monochromatic}</option>
        </select>
      </ToolFieldGroup>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={handleRandomize}
          className="ui-btn-primary inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          {isEs ? 'Color Aleatorio' : 'Randomize Base'}
        </button>
        <button
          type="button"
          disabled={!isValidHex}
          onClick={() => downloadBlob(cssVariablesOutput, 'palette.css', 'text/css;charset=utf-8')}
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar CSS' : 'Download CSS'}
        </button>
        <button
          type="button"
          disabled={!isValidHex}
          onClick={() => downloadBlob(jsonOutput, 'palette.json', 'application/json;charset=utf-8')}
          className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar JSON' : 'Download JSON'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Paleta Generada' : 'Generated Palette'}
      state={isValidHex ? 'ready' : 'error'}
      errorTitle={isEs ? 'Color HEX no válido' : 'Invalid HEX Color'}
      errorMessage={
        isEs
          ? 'Introduce un color hexadecimal con el formato #RRGGBB para calcular la paleta.'
          : 'Enter a hexadecimal color formatted as #RRGGBB to generate the palette.'
      }
      primaryLabel={isEs ? 'Color Base y Armonía' : 'Base Color & Harmony'}
      primaryValue={isValidHex ? normalizedHex : '—'}
      primaryUnit={harmonyLabels[harmony]}
      primarySubtext={
        baseHsl
          ? `HSL(${baseHsl[0]}°, ${baseHsl[1]}%, ${baseHsl[2]}%) · ${hexToRgbString(normalizedHex)}`
          : undefined
      }
      statusLabel={isValidHex ? (isEs ? '5 muestras listas' : '5 swatches ready') : undefined}
      statusTone="accent"
      copyText={cssVariablesOutput}
      copyLabel={isEs ? 'Copiar CSS' : 'Copy CSS'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValidHex && (
        <div className="space-y-4">
          {/* Framed Swatch Strip */}
          <div className="rounded-lg border border-border-main bg-surface-secondary p-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {palette.map((hex, index) => {
                const isLight = getRelativeLuminance(hex) > 0.45;
                const key = `swatch-${index}`;
                const isCopied = copiedKey === key;
                return (
                  <button
                    key={`${hex}-${index}`}
                    type="button"
                    onClick={() => copyValue(hex, key)}
                    className="group flex flex-col justify-between rounded-md border border-black/15 dark:border-white/15 p-3 min-h-[112px] text-left transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{ backgroundColor: hex }}
                    aria-label={isEs ? `Copiar ${hex}` : `Copy ${hex}`}
                  >
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        isLight ? 'text-slate-900/80' : 'text-white/85'
                      }`}
                    >
                      --color-{index + 1}
                    </span>
                    <div className="flex items-center justify-between gap-1 pt-4">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isLight ? 'text-slate-950' : 'text-white'
                        }`}
                      >
                        {isCopied ? (isEs ? 'Copiado' : 'Copied') : hex}
                      </span>
                      {isCopied ? (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isLight ? 'text-slate-950' : 'text-white'
                          }`}
                        />
                      ) : (
                        <Copy
                          className={`w-3.5 h-3.5 shrink-0 opacity-75 group-hover:opacity-100 ${
                            isLight ? 'text-slate-950' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? 'Muestras' : 'Swatches'}
              value={String(palette.length)}
              hint={isEs ? 'Haz clic para copiar HEX' : 'Click any swatch to copy HEX'}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Espacio de Color' : 'Color Space'}
              value="HSL / RGB"
              hint={baseHsl ? `H ${baseHsl[0]}° · S ${baseHsl[1]}% · L ${baseHsl[2]}%` : ''}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {isEs ? 'Variables CSS (:root)' : 'CSS Custom Properties (:root)'}
              </span>
              <button
                type="button"
                onClick={() => copyValue(cssVariablesOutput, 'css-vars')}
                className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === 'css-vars' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isEs ? 'Copiado' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {isEs ? 'Copiar variables' : 'Copy variables'}
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto">
              {cssVariablesOutput}
            </pre>
          </div>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default ColorPaletteCalculator;
