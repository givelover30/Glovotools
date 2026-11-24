import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';
import { UiCheckbox } from '../ui/AppPrimitives';

const DEFAULTS = {
  includeBoxSizing: true,
  includeBodyReset: true,
  includeMediaReset: true,
  includeFormReset: true,
};

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

export const CssResetGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [includeBoxSizing, setIncludeBoxSizing] = useState<boolean>(DEFAULTS.includeBoxSizing);
  const [includeBodyReset, setIncludeBodyReset] = useState<boolean>(DEFAULTS.includeBodyReset);
  const [includeMediaReset, setIncludeMediaReset] = useState<boolean>(DEFAULTS.includeMediaReset);
  const [includeFormReset, setIncludeFormReset] = useState<boolean>(DEFAULTS.includeFormReset);

  const activeSectionsCount =
    Number(includeBoxSizing) +
    Number(includeBodyReset) +
    Number(includeMediaReset) +
    Number(includeFormReset);

  const cssOutput = useMemo(() => {
    const sections: string[] = [];
    sections.push(`/* Modern CSS Reset */`);

    if (includeBoxSizing) {
      sections.push(`*, *::before, *::after {\n  box-sizing: border-box;\n}`);
    }
    if (includeBodyReset) {
      sections.push(
        `* {\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n}`
      );
    }
    if (includeMediaReset) {
      sections.push(`img, picture, video, canvas, svg {\n  display: block;\n  max-width: 100%;\n}`);
    }
    if (includeFormReset) {
      sections.push(
        `input, button, textarea, select {\n  font: inherit;\n}\n\np, h1, h2, h3, h4, h5, h6 {\n  overflow-wrap: break-word;\n}`
      );
    }

    sections.push(
      `/* Remove animations for people who've turned them off */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}`
    );

    return sections.join('\n\n') + '\n';
  }, [includeBoxSizing, includeBodyReset, includeMediaReset, includeFormReset]);

  const lineCount = useMemo(() => cssOutput.trim().split('\n').length, [cssOutput]);
  const byteSize = useMemo(() => new TextEncoder().encode(cssOutput).length, [cssOutput]);

  const handleReset = () => {
    setIncludeBoxSizing(DEFAULTS.includeBoxSizing);
    setIncludeBodyReset(DEFAULTS.includeBodyReset);
    setIncludeMediaReset(DEFAULTS.includeMediaReset);
    setIncludeFormReset(DEFAULTS.includeFormReset);
  };

  const presets = [
    {
      label: isEs ? 'Completo (Recomendado)' : 'Full Modern (Recommended)',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Mínimo (Solo Box-Sizing)' : 'Minimal (Box-Sizing Only)',
      onSelect: () => {
        setIncludeBoxSizing(true);
        setIncludeBodyReset(false);
        setIncludeMediaReset(false);
        setIncludeFormReset(false);
      },
    },
    {
      label: isEs ? 'Solo Accesibilidad' : 'Reduced Motion Only',
      onSelect: () => {
        setIncludeBoxSizing(false);
        setIncludeBodyReset(false);
        setIncludeMediaReset(false);
        setIncludeFormReset(false);
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Reglas de Reset CSS' : 'CSS Reset Modules'}
      subtitle={
        isEs
          ? 'Activa o desactiva módulos de normalización. Incluye prefers-reduced-motion.'
          : 'Toggle normalization rules. Includes prefers-reduced-motion accessibility safeguards.'
      }
      onReset={handleReset}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
    >
      <ToolPresetBar label={isEs ? 'Perfiles' : 'Profiles'} presets={presets} />

      <div className="space-y-3">
        <UiCheckbox
          id="css-reset-box-sizing"
          checked={includeBoxSizing}
          onChange={(e) => setIncludeBoxSizing(e.target.checked)}
          label={isEs ? 'Incluir box-sizing: border-box' : 'Include box-sizing: border-box'}
        />
        <UiCheckbox
          id="css-reset-body"
          checked={includeBodyReset}
          onChange={(e) => setIncludeBodyReset(e.target.checked)}
          label={
            isEs
              ? 'Eliminar márgenes/rellenos y suavizar fuentes'
              : 'Strip default margins/padding & smooth body font'
          }
        />
        <UiCheckbox
          id="css-reset-media"
          checked={includeMediaReset}
          onChange={(e) => setIncludeMediaReset(e.target.checked)}
          label={
            isEs
              ? 'Imágenes, SVG y vídeo responsivos (max-width: 100%)'
              : 'Responsive images, SVGs & media (max-width: 100%)'
          }
        />
        <UiCheckbox
          id="css-reset-form"
          checked={includeFormReset}
          onChange={(e) => setIncludeFormReset(e.target.checked)}
          label={
            isEs
              ? 'Heredar tipografía en formularios y evitar desbordamiento de texto'
              : 'Inherit form fonts & prevent heading/paragraph overflow'
          }
        />
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => downloadBlob(cssOutput, 'reset.css', 'text/css;charset=utf-8')}
          className="ui-btn-primary inline-flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar reset.css' : 'Download reset.css'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Hoja de Estilos Generada' : 'Generated Stylesheet'}
      state="ready"
      primaryLabel={isEs ? 'Módulos Activos' : 'Active Modules'}
      primaryValue={`${activeSectionsCount + 1} / 5`}
      primaryUnit={isEs ? 'bloques' : 'blocks'}
      primarySubtext={
        isEs
          ? `${lineCount} líneas · ${byteSize} bytes (incluye prefers-reduced-motion)`
          : `${lineCount} lines · ${byteSize} bytes (includes prefers-reduced-motion)`
      }
      statusLabel={isEs ? 'CSS válido' : 'Valid CSS'}
      statusTone="accent"
      copyText={cssOutput}
      copyLabel={isEs ? 'Copiar CSS' : 'Copy CSS'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <ToolMetricTile
            label={isEs ? 'Líneas' : 'Lines'}
            value={String(lineCount)}
            accent
          />
          <ToolMetricTile
            label={isEs ? 'Tamaño' : 'Payload'}
            value={`${byteSize} B`}
            hint={isEs ? 'Sin minificar' : 'Unminified'}
          />
        </div>

        <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[340px] leading-relaxed">
          {cssOutput}
        </pre>
      </div>
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default CssResetGeneratorCalculator;
