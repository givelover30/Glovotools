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

const DEFAULTS = {
  title: 'CalcTools - Professional Web Utilities',
  description:
    'Fast, accurate calculators, converters, and developer tools built for everyday productivity.',
  keywords: 'calculators, converters, web utilities, developer tools',
  author: 'CalcTools Team',
  robots: 'index, follow',
  themeColor: '#059669',
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

export const MetaTagsGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [title, setTitle] = useState<string>(DEFAULTS.title);
  const [description, setDescription] = useState<string>(DEFAULTS.description);
  const [keywords, setKeywords] = useState<string>(DEFAULTS.keywords);
  const [author, setAuthor] = useState<string>(DEFAULTS.author);
  const [robots, setRobots] = useState<string>(DEFAULTS.robots);
  const [themeColor, setThemeColor] = useState<string>(DEFAULTS.themeColor);

  const normalizedThemeColor = themeColor.trim().toUpperCase();
  const isThemeColorEmpty = normalizedThemeColor.length === 0;
  const isThemeColorValid = isThemeColorEmpty || HEX_REGEX.test(normalizedThemeColor);

  const metaCode = useMemo(() => {
    const lines: string[] = [
      '<!-- Primary Meta Tags -->',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    ];

    if (title.trim()) {
      const safeTitle = escapeHtml(title.trim());
      lines.push(`<title>${safeTitle}</title>`);
      lines.push(`<meta name="title" content="${safeTitle}">`);
    }
    if (description.trim()) {
      lines.push(`<meta name="description" content="${escapeHtml(description.trim())}">`);
    }
    if (keywords.trim()) {
      lines.push(`<meta name="keywords" content="${escapeHtml(keywords.trim())}">`);
    }
    if (author.trim()) {
      lines.push(`<meta name="author" content="${escapeHtml(author.trim())}">`);
    }
    if (robots.trim()) {
      lines.push(`<meta name="robots" content="${escapeHtml(robots.trim())}">`);
    }
    if (!isThemeColorEmpty && HEX_REGEX.test(normalizedThemeColor)) {
      lines.push(`<meta name="theme-color" content="${normalizedThemeColor}">`);
    }

    return lines.join('\n');
  }, [title, description, keywords, author, robots, normalizedThemeColor, isThemeColorEmpty]);

  const titleLen = title.trim().length;
  const descLen = description.trim().length;
  const tagCount = useMemo(
    () => metaCode.split('\n').filter((line) => line.startsWith('<meta') || line.startsWith('<title')).length,
    [metaCode]
  );

  const handleReset = () => {
    setTitle(DEFAULTS.title);
    setDescription(DEFAULTS.description);
    setKeywords(DEFAULTS.keywords);
    setAuthor(DEFAULTS.author);
    setRobots(DEFAULTS.robots);
    setThemeColor(DEFAULTS.themeColor);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setKeywords('');
    setAuthor('');
    setThemeColor('');
  };

  const presets = [
    {
      label: isEs ? 'SEO Estándar' : 'Standard SEO',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Página Privada (Noindex)' : 'Private Page (Noindex)',
      onSelect: () => {
        setTitle('Internal Admin Dashboard');
        setDescription('Restricted internal operations portal.');
        setKeywords('');
        setAuthor('Operations Team');
        setRobots('noindex, nofollow');
        setThemeColor('#0F172A');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Metadatos SEO' : 'SEO Meta Configuration'}
      subtitle={
        isEs
          ? 'Define título, descripción, directivas de rastreo y theme-color.'
          : 'Configure page title, description, crawler directives, and theme-color.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Perfiles' : 'Profiles'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'Título de Página' : 'Page Title'}
        htmlFor="meta-title"
        unit={`${titleLen} / 60`}
        hint={
          titleLen > 60
            ? isEs
              ? 'Recomendado ≤ 60 caracteres para resultados de búsqueda.'
              : 'Recommended ≤ 60 characters for search snippets.'
            : undefined
        }
      >
        <input
          id="meta-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isEs ? 'Título SEO de la página' : 'SEO page title'}
          className="ui-input"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Descripción Meta' : 'Meta Description'}
        htmlFor="meta-description"
        unit={`${descLen} / 160`}
        hint={
          descLen > 160
            ? isEs
              ? 'Recomendado ≤ 160 caracteres para evitar recortes.'
              : 'Recommended ≤ 160 characters to avoid snippet truncation.'
            : undefined
        }
      >
        <textarea
          id="meta-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isEs ? 'Resumen claro del contenido...' : 'Concise summary of the page...'}
          className="ui-input resize-y"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Palabras Clave (opcional)' : 'Keywords (optional)'}
        htmlFor="meta-keywords"
      >
        <input
          id="meta-keywords"
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
          className="ui-input"
        />
      </ToolFieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup label={isEs ? 'Autor' : 'Author'} htmlFor="meta-author">
          <input
            id="meta-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={isEs ? 'Nombre o equipo' : 'Name or team'}
            className="ui-input"
          />
        </ToolFieldGroup>

        <ToolFieldGroup label={isEs ? 'Directiva Robots' : 'Robots Directive'} htmlFor="meta-robots">
          <select
            id="meta-robots"
            value={robots}
            onChange={(e) => setRobots(e.target.value)}
            className="ui-select"
          >
            <option value="index, follow">index, follow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </ToolFieldGroup>
      </div>

      <ToolFieldGroup
        label={isEs ? 'Color de Tema (theme-color)' : 'Browser Theme Color (theme-color)'}
        htmlFor="meta-theme-color"
        error={
          !isThemeColorValid
            ? isEs
              ? 'Introduce un HEX de 6 dígitos (ej. #059669) o déjalo vacío.'
              : 'Enter a 6-digit HEX color (e.g. #059669) or leave blank.'
            : undefined
        }
      >
        <div className="flex items-center gap-2.5">
          <input
            type="color"
            aria-label={isEs ? 'Selector de color de tema' : 'Theme color picker'}
            value={HEX_REGEX.test(normalizedThemeColor) ? normalizedThemeColor : DEFAULTS.themeColor}
            onChange={(e) => setThemeColor(e.target.value.toUpperCase())}
            className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
          />
          <input
            id="meta-theme-color"
            type="text"
            maxLength={7}
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value.toUpperCase())}
            placeholder="#059669"
            className="ui-input font-mono uppercase"
          />
        </div>
      </ToolFieldGroup>

      <div className="pt-1">
        <button
          type="button"
          disabled={!isThemeColorValid}
          onClick={() => downloadBlob(metaCode, 'meta-tags.html', 'text/html;charset=utf-8')}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar meta-tags.html' : 'Download meta-tags.html'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Etiquetas Meta Generadas' : 'Generated Meta Tags'}
      state={isThemeColorValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Color theme-color no válido' : 'Invalid Theme Color'}
      errorMessage={
        isEs
          ? 'Usa un código hexadecimal #RRGGBB válido o deja el campo vacío.'
          : 'Use a valid #RRGGBB hex code or clear the theme-color field.'
      }
      primaryLabel={isEs ? 'Etiquetas Generadas' : 'Generated Tags'}
      primaryValue={String(tagCount)}
      primaryUnit={isEs ? 'etiquetas' : 'tags'}
      primarySubtext={
        isEs
          ? `Título: ${titleLen} car. · Descripción: ${descLen} car.`
          : `Title: ${titleLen} chars · Description: ${descLen} chars`
      }
      statusLabel={
        titleLen <= 60 && descLen <= 160
          ? isEs
            ? 'Longitud SEO óptima'
            : 'Optimal SEO Length'
          : isEs
            ? 'Revisar longitud'
            : 'Check Length'
      }
      statusTone={titleLen <= 60 && descLen <= 160 ? 'accent' : 'warning'}
      copyText={metaCode}
      copyLabel={isEs ? 'Copiar HTML' : 'Copy HTML'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isThemeColorValid && (
        <div className="space-y-4">
          {/* SERP Snippet Preview */}
          <div className="rounded-lg border border-border-main bg-surface-secondary p-3.5 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              {isEs ? 'Vista Previa en Buscador' : 'Search Result Preview'}
            </span>
            <p className="text-sm font-semibold text-accent truncate">
              {title.trim() || (isEs ? 'Sin título' : 'Untitled Page')}
            </p>
            <p className="text-xs text-text-secondary line-clamp-2">
              {description.trim() ||
                (isEs ? 'Añade una meta descripción para verla aquí.' : 'Add a meta description to preview it here.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? 'Longitud Título' : 'Title Length'}
              value={`${titleLen} ch`}
              hint={titleLen <= 60 ? '≤ 60 OK' : '> 60'}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Longitud Descripción' : 'Description Length'}
              value={`${descLen} ch`}
              hint={descLen <= 160 ? '≤ 160 OK' : '> 160'}
            />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[320px] leading-relaxed">
            {metaCode}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default MetaTagsGeneratorCalculator;
