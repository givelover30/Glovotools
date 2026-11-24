import React, { useMemo, useState } from 'react';
import { Download, Globe } from 'lucide-react';
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
  ogTitle: 'CalcTools — Smart Web Utilities',
  ogDescription:
    'Precision calculators, developer utilities, and instant converters for modern workflows.',
  ogUrl: 'https://calctools.app',
  ogImage: 'https://calctools.app/og-preview.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getDisplayHost(raw: string): string {
  try {
    return new URL(raw.trim()).hostname;
  } catch {
    return 'example.com';
  }
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

export const OpenGraphGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [ogTitle, setOgTitle] = useState<string>(DEFAULTS.ogTitle);
  const [ogDescription, setOgDescription] = useState<string>(DEFAULTS.ogDescription);
  const [ogUrl, setOgUrl] = useState<string>(DEFAULTS.ogUrl);
  const [ogImage, setOgImage] = useState<string>(DEFAULTS.ogImage);
  const [ogType, setOgType] = useState<string>(DEFAULTS.ogType);
  const [twitterCard, setTwitterCard] = useState<string>(DEFAULTS.twitterCard);

  const isUrlValid = isValidHttpUrl(ogUrl);
  const isImageValid = isValidHttpUrl(ogImage);
  const hasValidationError = !isUrlValid || !isImageValid;

  const ogCode = useMemo(() => {
    const lines: string[] = ['<!-- Open Graph / Facebook -->'];
    lines.push(`<meta property="og:type" content="${escapeHtml(ogType)}">`);
    if (ogUrl.trim() && isUrlValid) {
      lines.push(`<meta property="og:url" content="${escapeHtml(ogUrl.trim())}">`);
    }
    if (ogTitle.trim()) {
      lines.push(`<meta property="og:title" content="${escapeHtml(ogTitle.trim())}">`);
    }
    if (ogDescription.trim()) {
      lines.push(`<meta property="og:description" content="${escapeHtml(ogDescription.trim())}">`);
    }
    if (ogImage.trim() && isImageValid) {
      lines.push(`<meta property="og:image" content="${escapeHtml(ogImage.trim())}">`);
    }

    lines.push('', '<!-- Twitter / X -->');
    lines.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard)}">`);
    if (ogUrl.trim() && isUrlValid) {
      lines.push(`<meta name="twitter:url" content="${escapeHtml(ogUrl.trim())}">`);
    }
    if (ogTitle.trim()) {
      lines.push(`<meta name="twitter:title" content="${escapeHtml(ogTitle.trim())}">`);
    }
    if (ogDescription.trim()) {
      lines.push(`<meta name="twitter:description" content="${escapeHtml(ogDescription.trim())}">`);
    }
    if (ogImage.trim() && isImageValid) {
      lines.push(`<meta name="twitter:image" content="${escapeHtml(ogImage.trim())}">`);
    }

    return lines.join('\n');
  }, [ogTitle, ogDescription, ogUrl, ogImage, ogType, twitterCard, isUrlValid, isImageValid]);

  const tagCount = useMemo(
    () => ogCode.split('\n').filter((line) => line.startsWith('<meta')).length,
    [ogCode]
  );

  const handleReset = () => {
    setOgTitle(DEFAULTS.ogTitle);
    setOgDescription(DEFAULTS.ogDescription);
    setOgUrl(DEFAULTS.ogUrl);
    setOgImage(DEFAULTS.ogImage);
    setOgType(DEFAULTS.ogType);
    setTwitterCard(DEFAULTS.twitterCard);
  };

  const handleClear = () => {
    setOgTitle('');
    setOgDescription('');
    setOgUrl('');
    setOgImage('');
  };

  const presets = [
    {
      label: isEs ? 'Web Estándar' : 'Standard Website',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Artículo / Blog' : 'Blog Article',
      onSelect: () => {
        setOgTitle('How to Build Fast Developer Tools');
        setOgDescription('Engineering patterns for zero-latency client-side utilities.');
        setOgUrl('https://example.com/blog/fast-developer-tools');
        setOgImage('https://example.com/images/article-cover.png');
        setOgType('article');
        setTwitterCard('summary_large_image');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Etiquetas Open Graph y X/Twitter' : 'Open Graph & Social Cards'}
      subtitle={
        isEs
          ? 'Genera metadatos escapados para vistas previas en redes sociales.'
          : 'Generate safely escaped metadata for rich social media link previews.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Plantillas' : 'Presets'} presets={presets} />

      <ToolFieldGroup label={isEs ? 'Título (og:title)' : 'Title (og:title)'} htmlFor="og-title">
        <input
          id="og-title"
          type="text"
          value={ogTitle}
          onChange={(e) => setOgTitle(e.target.value)}
          placeholder="My Page Title"
          className="ui-input"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Descripción (og:description)' : 'Description (og:description)'}
        htmlFor="og-description"
      >
        <textarea
          id="og-description"
          rows={3}
          value={ogDescription}
          onChange={(e) => setOgDescription(e.target.value)}
          placeholder={isEs ? 'Descripción breve para compartir...' : 'Short sharing summary...'}
          className="ui-input resize-y"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'URL Canónica (og:url)' : 'Canonical URL (og:url)'}
        htmlFor="og-url"
        error={
          !isUrlValid
            ? isEs
              ? 'Introduce una URL válida con https:// o http://.'
              : 'Enter a valid URL starting with https:// or http://.'
            : undefined
        }
      >
        <input
          id="og-url"
          type="url"
          value={ogUrl}
          onChange={(e) => setOgUrl(e.target.value)}
          placeholder="https://calctools.app"
          className="ui-input font-mono text-sm"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'URL de Imagen (og:image)' : 'Image URL (og:image)'}
        htmlFor="og-image"
        error={
          !isImageValid
            ? isEs
              ? 'Introduce una URL de imagen válida (https://...).'
              : 'Enter a valid image URL (https://...).'
            : undefined
        }
      >
        <input
          id="og-image"
          type="url"
          value={ogImage}
          onChange={(e) => setOgImage(e.target.value)}
          placeholder="https://calctools.app/og-preview.png"
          className="ui-input font-mono text-sm"
        />
      </ToolFieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup label={isEs ? 'Tipo (og:type)' : 'Content Type (og:type)'} htmlFor="og-type">
          <select
            id="og-type"
            value={ogType}
            onChange={(e) => setOgType(e.target.value)}
            className="ui-select"
          >
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="profile">profile</option>
          </select>
        </ToolFieldGroup>

        <ToolFieldGroup label={isEs ? 'Tarjeta X / Twitter' : 'Twitter / X Card'} htmlFor="twitter-card">
          <select
            id="twitter-card"
            value={twitterCard}
            onChange={(e) => setTwitterCard(e.target.value)}
            className="ui-select"
          >
            <option value="summary_large_image">summary_large_image</option>
            <option value="summary">summary</option>
          </select>
        </ToolFieldGroup>
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={hasValidationError}
          onClick={() => downloadBlob(ogCode, 'open-graph.html', 'text/html;charset=utf-8')}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar open-graph.html' : 'Download open-graph.html'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Vista Previa Social y Metadatos' : 'Social Card Preview & Markup'}
      state={hasValidationError ? 'error' : 'ready'}
      errorTitle={isEs ? 'URL no válida' : 'Invalid URL Detected'}
      errorMessage={
        isEs
          ? 'Verifica que og:url y og:image utilicen un formato http:// o https:// válido.'
          : 'Ensure og:url and og:image use a valid http:// or https:// format.'
      }
      primaryLabel={isEs ? 'Etiquetas Sociales' : 'Social Meta Tags'}
      primaryValue={String(tagCount)}
      primaryUnit={isEs ? 'etiquetas' : 'tags'}
      primarySubtext={`og:type="${ogType}" · twitter:card="${twitterCard}"`}
      statusLabel={isEs ? 'OG + X Listo' : 'OG + X Ready'}
      statusTone="accent"
      copyText={ogCode}
      copyLabel={isEs ? 'Copiar Etiquetas' : 'Copy Tags'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {!hasValidationError && (
        <div className="space-y-4">
          {/* Simulated Social Share Card */}
          <div className="rounded-lg border border-border-main bg-surface-secondary overflow-hidden">
            <div className="px-4 py-5 bg-surface border-b border-border-main flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono truncate">
                <Globe className="w-4 h-4 shrink-0 text-accent" />
                <span className="truncate">{getDisplayHost(ogUrl)}</span>
              </div>
              <span className="text-[11px] font-mono text-text-tertiary shrink-0">
                1200 × 630
              </span>
            </div>
            <div className="p-3.5 space-y-1">
              <p className="text-sm font-semibold text-text-primary truncate">
                {ogTitle.trim() || (isEs ? 'Sin título' : 'Untitled Link')}
              </p>
              <p className="text-xs text-text-secondary line-clamp-2">
                {ogDescription.trim() ||
                  (isEs
                    ? 'Añade una descripción para la tarjeta social.'
                    : 'Add a description for the social share card.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label="og:type" value={ogType} accent />
            <ToolMetricTile label="twitter:card" value={twitterCard === 'summary' ? 'summary' : 'large_image'} />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[320px] leading-relaxed">
            {ogCode}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default OpenGraphGeneratorCalculator;
