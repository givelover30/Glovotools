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
  ToolSegmentedControl,
} from '../calculator/ToolWorkspacePrimitives';

type FaviconShape = 'rounded' | 'circle' | 'square';

const DEFAULTS = {
  emoji: '⚡',
  bgColor: '#059669',
  textColor: '#FFFFFF',
  shape: 'rounded' as FaviconShape,
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

export const FaviconGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [emoji, setEmoji] = useState<string>(DEFAULTS.emoji);
  const [bgColor, setBgColor] = useState<string>(DEFAULTS.bgColor);
  const [textColor, setTextColor] = useState<string>(DEFAULTS.textColor);
  const [shape, setShape] = useState<FaviconShape>(DEFAULTS.shape);

  const normalizedBg = bgColor.trim().toUpperCase();
  const normalizedText = textColor.trim().toUpperCase();
  const isBgValid = HEX_REGEX.test(normalizedBg);
  const isTextValid = HEX_REGEX.test(normalizedText);
  const isValid = isBgValid && isTextValid;

  const rxValue = shape === 'circle' ? 50 : shape === 'rounded' ? 22 : 0;

  const svgCode = useMemo(() => {
    if (!isValid) return '';
    const safeGlyph = escapeXml(emoji);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${rxValue}" fill="${normalizedBg}" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="56" font-family="system-ui, -apple-system, sans-serif" font-weight="700" fill="${normalizedText}">${safeGlyph}</text>
</svg>`;
  }, [emoji, rxValue, normalizedBg, normalizedText, isValid]);

  const htmlLinkSnippet = useMemo(() => {
    if (!svgCode) return '';
    const encoded = encodeURIComponent(svgCode.replace(/\s+/g, ' ').trim());
    return `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encoded}">`;
  }, [svgCode]);

  const handleReset = () => {
    setEmoji(DEFAULTS.emoji);
    setBgColor(DEFAULTS.bgColor);
    setTextColor(DEFAULTS.textColor);
    setShape(DEFAULTS.shape);
  };

  const handleClear = () => {
    setEmoji('');
  };

  const presets = [
    {
      label: '⚡ Calc',
      onSelect: () => {
        setEmoji('⚡');
        setBgColor('#059669');
        setTextColor('#FFFFFF');
        setShape('rounded');
      },
    },
    {
      label: 'CT Monogram',
      onSelect: () => {
        setEmoji('CT');
        setBgColor('#0F172A');
        setTextColor('#10B981');
        setShape('circle');
      },
    },
    {
      label: '🚀 Launch',
      onSelect: () => {
        setEmoji('🚀');
        setBgColor('#4F46E5');
        setTextColor('#FFFFFF');
        setShape('rounded');
      },
    },
    {
      label: '</> Code',
      onSelect: () => {
        setEmoji('</>');
        setBgColor('#1E293B');
        setTextColor('#38BDF8');
        setShape('square');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Diseño de Favicon SVG' : 'SVG Favicon Design'}
      subtitle={
        isEs
          ? 'Crea un icono SVG vectorial nítido con escapado XML seguro.'
          : 'Generate a crisp vector SVG favicon with safe XML escaping.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Ejemplos rápidos' : 'Quick presets'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'Emoji o Texto (máx. 4 caracteres)' : 'Emoji or Text (max 4 chars)'}
        htmlFor="favicon-glyph"
        hint={
          isEs
            ? 'Caracteres especiales como <, >, & se escapan automáticamente para XML válido.'
            : 'Special characters like <, >, & are automatically XML-escaped.'
        }
      >
        <input
          id="favicon-glyph"
          type="text"
          maxLength={4}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="⚡"
          className="ui-input text-lg font-semibold"
        />
      </ToolFieldGroup>

      <ToolFieldGroup label={isEs ? 'Forma del Contenedor' : 'Container Shape'}>
        <ToolSegmentedControl<FaviconShape>
          ariaLabel={isEs ? 'Forma del favicon' : 'Favicon shape'}
          value={shape}
          onChange={setShape}
          options={[
            { value: 'rounded', label: isEs ? 'Redondeado' : 'Rounded' },
            { value: 'circle', label: isEs ? 'Círculo' : 'Circle' },
            { value: 'square', label: isEs ? 'Cuadrado' : 'Square' },
          ]}
        />
      </ToolFieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup
          label={isEs ? 'Color de Fondo' : 'Background Color'}
          htmlFor="favicon-bg"
          error={!isBgValid ? (isEs ? 'HEX inválido' : 'Invalid HEX') : undefined}
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={isEs ? 'Selector de color de fondo' : 'Background color picker'}
              value={isBgValid ? normalizedBg : DEFAULTS.bgColor}
              onChange={(e) => setBgColor(e.target.value.toUpperCase())}
              className="h-10 w-11 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
            />
            <input
              id="favicon-bg"
              type="text"
              maxLength={7}
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value.toUpperCase())}
              className="ui-input font-mono uppercase"
            />
          </div>
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Color de Texto' : 'Text / Glyph Color'}
          htmlFor="favicon-fg"
          error={!isTextValid ? (isEs ? 'HEX inválido' : 'Invalid HEX') : undefined}
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label={isEs ? 'Selector de color de texto' : 'Text color picker'}
              value={isTextValid ? normalizedText : DEFAULTS.textColor}
              onChange={(e) => setTextColor(e.target.value.toUpperCase())}
              className="h-10 w-11 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
            />
            <input
              id="favicon-fg"
              type="text"
              maxLength={7}
              value={textColor}
              onChange={(e) => setTextColor(e.target.value.toUpperCase())}
              className="ui-input font-mono uppercase"
            />
          </div>
        </ToolFieldGroup>
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!isValid}
          onClick={() =>
            downloadBlob(svgCode, 'favicon.svg', 'image/svg+xml;charset=utf-8')
          }
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar favicon.svg' : 'Download favicon.svg'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Vista Previa y Código SVG' : 'Live Preview & SVG Markup'}
      state={isValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Color HEX no válido' : 'Invalid HEX Color'}
      errorMessage={
        isEs
          ? 'Introduce códigos HEX válidos de 6 dígitos para fondo y texto.'
          : 'Enter valid 6-digit HEX codes for background and text colors.'
      }
      primaryLabel={isEs ? 'Formato Vectorial' : 'Vector Format'}
      primaryValue="100 × 100"
      primaryUnit="SVG"
      primarySubtext={
        isEs
          ? `Forma: ${shape} · Radio: ${rxValue}px · ${new TextEncoder().encode(svgCode).length} B`
          : `Shape: ${shape} · Radius: ${rxValue}px · ${new TextEncoder().encode(svgCode).length} B`
      }
      statusLabel={isEs ? 'XML Válido' : 'Valid XML'}
      statusTone="accent"
      copyText={svgCode}
      copyLabel={isEs ? 'Copiar SVG' : 'Copy SVG'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValid && (
        <div className="space-y-4">
          {/* Framed Multi-Size Preview */}
          <div className="rounded-lg border border-border-main bg-surface-secondary p-5 flex flex-wrap items-end justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-border-main shadow-sm">
                <svg
                  data-testid="favicon-svg-preview"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-20 h-20 block"
                >
                  <rect width="100" height="100" rx={rxValue} fill={normalizedBg} />
                  <text
                    x="50%"
                    y="54%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="56"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="700"
                    fill={normalizedText}
                  >
                    {emoji}
                  </text>
                </svg>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary">80 × 80</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-border-main">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-8 h-8 block"
                >
                  <rect width="100" height="100" rx={rxValue} fill={normalizedBg} />
                  <text
                    x="50%"
                    y="54%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="56"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="700"
                    fill={normalizedText}
                  >
                    {emoji}
                  </text>
                </svg>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary">32 × 32</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-border-main">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-4 h-4 block"
                >
                  <rect width="100" height="100" rx={rxValue} fill={normalizedBg} />
                  <text
                    x="50%"
                    y="54%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="56"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight="700"
                    fill={normalizedText}
                  >
                    {emoji}
                  </text>
                </svg>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary">16 × 16</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label={isEs ? 'Fondo' : 'Background'} value={normalizedBg} accent />
            <ToolMetricTile label={isEs ? 'Texto' : 'Foreground'} value={normalizedText} />
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
              {isEs ? 'Código SVG' : 'SVG Markup'}
            </span>
            <pre className="p-3 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto whitespace-pre-wrap break-all">
              {svgCode}
            </pre>
          </div>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
              {isEs ? 'Etiqueta HTML (Data URI)' : 'HTML Head Tag (Data URI)'}
            </span>
            <pre className="p-3 rounded-lg border border-border-main bg-surface-secondary font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
              {htmlLinkSnippet}
            </pre>
          </div>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default FaviconGeneratorCalculator;
