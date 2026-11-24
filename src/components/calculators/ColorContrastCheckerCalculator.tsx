import { useMemo, useState } from 'react';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_FG = '#00C58A';
const DEFAULT_BG = '#03120B';

function normalizeHex(hex: string): string | null {
  const clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean}`.toUpperCase();
  }
  return null;
}

function getRelativeLuminance(fullHex: string): number {
  const r = parseInt(fullHex.slice(1, 3), 16) / 255;
  const g = parseInt(fullHex.slice(3, 5), 16) / 255;
  const b = parseInt(fullHex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export default function ColorContrastCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [fg, setFg] = useState<string>(DEFAULT_FG);
  const [bg, setBg] = useState<string>(DEFAULT_BG);

  const analysis = useMemo(() => {
    if (!fg.trim() && !bg.trim()) {
      return { state: 'empty' as const };
    }

    const normFg = normalizeHex(fg);
    const normBg = normalizeHex(bg);

    if (!normFg || !normBg) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Ingresa códigos hexadecimales válidos (#RGB o #RRGGBB) para texto y fondo.'
          : 'Enter valid hexadecimal color codes (#RGB or #RRGGBB) for both foreground and background.'
      };
    }

    const l1 = getRelativeLuminance(normFg);
    const l2 = getRelativeLuminance(normBg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3.0;
    const aaaNormal = ratio >= 7.0;
    const aaaLarge = ratio >= 4.5;

    const grade = aaaNormal ? 'AAA' : aaNormal ? 'AA' : aaLarge ? 'AA Large' : 'Fail';
    const statusTone: 'success' | 'warning' | 'error' = aaNormal
      ? 'success'
      : aaLarge
        ? 'warning'
        : 'error';

    return {
      state: 'ready' as const,
      normFg,
      normBg,
      ratio,
      ratioStr: `${ratio.toFixed(2)}:1`,
      aaNormal,
      aaLarge,
      aaaNormal,
      aaaLarge,
      grade,
      statusTone
    };
  }, [fg, bg, isEs]);

  const handleSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  const handleClear = () => {
    setFg('');
    setBg('');
  };

  const handleReset = () => {
    setFg(DEFAULT_FG);
    setBg(DEFAULT_BG);
  };

  const copySummary =
    analysis.state === 'ready'
      ? `WCAG Contrast Ratio: ${analysis.ratioStr} | Foreground: ${analysis.normFg} | Background: ${analysis.normBg} | AA Normal: ${analysis.aaNormal ? 'PASS' : 'FAIL'} | AAA Normal: ${analysis.aaaNormal ? 'PASS' : 'FAIL'}`
      : undefined;

  const pickerFg = normalizeHex(fg) || '#000000';
  const pickerBg = normalizeHex(bg) || '#FFFFFF';

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Verificador de Contraste WCAG 2.1' : 'WCAG 2.1 Color Contrast Checker'}
          subtitle={
            isEs
              ? 'Calcula la relación de contraste de luminancia relativa y verifica cumplimiento AA y AAA.'
              : 'Computes relative luminance contrast ratio and checks WCAG 2.1 AA / AAA readability thresholds.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Color de texto (primer plano)' : 'Foreground (Text Color)'}
              htmlFor="contrast-fg-input"
              unit="HEX"
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={isEs ? 'Selector de color de texto' : 'Foreground color picker'}
                  value={pickerFg}
                  onChange={(e) => setFg(e.target.value.toUpperCase())}
                  className="h-10 w-12 shrink-0 rounded-lg border-2 border-border-strong bg-surface p-0.5 cursor-pointer"
                />
                <input
                  id="contrast-fg-input"
                  type="text"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  placeholder="#00C58A"
                  className="ui-input font-mono text-sm uppercase"
                />
              </div>
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Color de fondo' : 'Background Color'}
              htmlFor="contrast-bg-input"
              unit="HEX"
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={isEs ? 'Selector de color de fondo' : 'Background color picker'}
                  value={pickerBg}
                  onChange={(e) => setBg(e.target.value.toUpperCase())}
                  className="h-10 w-12 shrink-0 rounded-lg border-2 border-border-strong bg-surface p-0.5 cursor-pointer"
                />
                <input
                  id="contrast-bg-input"
                  type="text"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  placeholder="#03120B"
                  className="ui-input font-mono text-sm uppercase"
                />
              </div>
            </ToolFieldGroup>
          </div>

          <button type="button" onClick={handleSwap} className="ui-btn-secondary w-full">
            <ArrowLeftRight className="w-4 h-4" />
            <span>{isEs ? 'Intercambiar colores' : 'Swap Foreground & Background'}</span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: 'AAA (21:1)',
                onSelect: () => {
                  setFg('#000000');
                  setBg('#FFFFFF');
                }
              },
              {
                label: 'CalcTools Brand',
                onSelect: () => {
                  setFg(DEFAULT_FG);
                  setBg(DEFAULT_BG);
                }
              },
              {
                label: 'AA Only (~4.6:1)',
                onSelect: () => {
                  setFg('#767676');
                  setBg('#FFFFFF');
                }
              },
              {
                label: isEs ? 'Fallo (<3:1)' : 'Fail Pair (<3:1)',
                onSelect: () => {
                  setFg('#9CA3AF');
                  setBg('#FFFFFF');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Evaluación WCAG' : 'WCAG Contrast Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Relación de contraste' : 'Contrast Ratio'}
          primaryValue={analysis.state === 'ready' ? analysis.ratioStr : undefined}
          primarySubtext={
            analysis.state === 'ready'
              ? isEs
                ? `Primer plano ${analysis.normFg} sobre fondo ${analysis.normBg}.`
                : `Foreground ${analysis.normFg} on background ${analysis.normBg}.`
              : undefined
          }
          statusLabel={analysis.state === 'ready' ? analysis.grade : undefined}
          statusTone={analysis.state === 'ready' ? analysis.statusTone : 'neutral'}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar relación' : 'Copy ratio'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa dos colores HEX' : 'Enter two HEX colors'}
          emptyDescription={
            isEs
              ? 'Elige o escribe colores de texto y fondo para evaluar el contraste WCAG.'
              : 'Pick or type foreground and background hex colors on the left.'
          }
          errorTitle={isEs ? 'Código HEX inválido' : 'Invalid HEX Color'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              {/* Live preview surface with explicit high-contrast outer frame for both Light & Dark themes */}
              <div className="rounded-xl p-1.5 border border-border-strong bg-surface-secondary">
                <div
                  className="rounded-lg p-5 border border-border-main/60 space-y-1.5 transition-colors"
                  style={{ backgroundColor: analysis.normBg, color: analysis.normFg }}
                >
                  <div className="text-lg font-bold tracking-tight">
                    {isEs ? 'Vista previa de texto grande (18pt+)' : 'Large Text Preview (18pt+ Bold)'}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {isEs
                      ? 'El rápido zorro marrón salta sobre el perro perezoso. 0123456789'
                      : 'The quick brown fox jumps over the lazy dog. 0123456789'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    label: isEs ? 'AA Normal (≥4.5:1)' : 'AA Normal (≥4.5:1)',
                    pass: analysis.aaNormal
                  },
                  {
                    label: isEs ? 'AA Grande (≥3.0:1)' : 'AA Large (≥3.0:1)',
                    pass: analysis.aaLarge
                  },
                  {
                    label: isEs ? 'AAA Normal (≥7.0:1)' : 'AAA Normal (≥7.0:1)',
                    pass: analysis.aaaNormal
                  },
                  {
                    label: isEs ? 'AAA Grande (≥4.5:1)' : 'AAA Large (≥4.5:1)',
                    pass: analysis.aaaLarge
                  }
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs ${
                      rule.pass
                        ? 'border-status-success/30 bg-status-success-bg text-text-primary'
                        : 'border-status-error/30 bg-status-error-bg text-text-primary'
                    }`}
                  >
                    <span className="font-medium truncate">{rule.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold shrink-0 ${
                        rule.pass ? 'text-status-success' : 'text-status-error'
                      }`}
                    >
                      {rule.pass ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>{rule.pass ? 'PASS' : 'FAIL'}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Primer plano' : 'Foreground'}
                  value={analysis.normFg}
                />
                <ToolMetricTile
                  label={isEs ? 'Fondo' : 'Background'}
                  value={analysis.normBg}
                />
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
