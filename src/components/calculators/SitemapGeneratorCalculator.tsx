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

const DEFAULT_PATHS = [
  '',
  '/calculators',
  '/categories',
  '/converter',
  '/tools',
  '/generators',
  '/planners',
  '/checkers',
  '/trackers',
  '/guides',
  '/blog',
  '/about',
];

const DEFAULTS = {
  baseUrl: 'https://calctools.app',
  changefreq: 'weekly',
  priority: '0.8',
  pathsText: DEFAULT_PATHS.join('\n'),
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseBaseUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return trimmed.replace(/\/+$/, '');
  } catch {
    return null;
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

export const SitemapGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [baseUrl, setBaseUrl] = useState<string>(DEFAULTS.baseUrl);
  const [changefreq, setChangefreq] = useState<string>(DEFAULTS.changefreq);
  const [priority, setPriority] = useState<string>(DEFAULTS.priority);
  const [pathsText, setPathsText] = useState<string>(DEFAULTS.pathsText);

  const normalizedBase = parseBaseUrl(baseUrl);
  const isBaseUrlValid = normalizedBase !== null;

  const { sitemapXml, urlCount } = useMemo(() => {
    if (!normalizedBase) {
      return { sitemapXml: '', urlCount: 0 };
    }
    const today = new Date().toISOString().split('T')[0];

    const rawLines = pathsText.split(/\r?\n/);
    const normalizedPaths: string[] = [];
    const seen = new Set<string>();

    rawLines.forEach((raw) => {
      const trimmed = raw.trim();
      if (trimmed === '' && rawLines.length === 1) return;
      const pathPart = trimmed === '' || trimmed === '/' ? '' : trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      const fullUrl = pathPart ? `${normalizedBase}${pathPart}` : `${normalizedBase}/`;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        normalizedPaths.push(fullUrl);
      }
    });

    if (normalizedPaths.length === 0) {
      normalizedPaths.push(`${normalizedBase}/`);
    }

    const entries = normalizedPaths.map((fullUrl, idx) => {
      const entryPriority = idx === 0 && fullUrl === `${normalizedBase}/` ? '1.0' : priority;
      return `  <url>\n    <loc>${escapeXml(fullUrl)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${escapeXml(changefreq)}</changefreq>\n    <priority>${escapeXml(entryPriority)}</priority>\n  </url>`;
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      '</urlset>',
      '',
    ].join('\n');

    return { sitemapXml: xml, urlCount: normalizedPaths.length };
  }, [normalizedBase, pathsText, changefreq, priority]);

  const handleReset = () => {
    setBaseUrl(DEFAULTS.baseUrl);
    setChangefreq(DEFAULTS.changefreq);
    setPriority(DEFAULTS.priority);
    setPathsText(DEFAULTS.pathsText);
  };

  const handleClear = () => {
    setBaseUrl('');
    setPathsText('');
  };

  const presets = [
    {
      label: isEs ? 'Sitio Completo (12 URLs)' : 'Full Site (12 URLs)',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Blog + Docs (5 URLs)' : 'Blog & Docs (5 URLs)',
      onSelect: () => {
        setBaseUrl('https://docs.example.com');
        setChangefreq('daily');
        setPriority('0.9');
        setPathsText(['/', '/docs', '/guides', '/changelog', '/contact'].join('\n'));
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Configuración de sitemap.xml' : 'sitemap.xml Configuration'}
      subtitle={
        isEs
          ? 'Genera un mapa XML 0.9 válido con URLs escapadas y normalizadas.'
          : 'Generate a valid Sitemaps 0.9 XML document with normalized, XML-escaped URLs.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Plantillas' : 'Presets'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'URL Base del Sitio' : 'Base Site URL'}
        htmlFor="sitemap-base-url"
        error={
          !isBaseUrlValid
            ? isEs
              ? 'Introduce una URL base válida que comience con https:// o http://.'
              : 'Enter a valid base URL starting with https:// or http://.'
            : undefined
        }
      >
        <input
          id="sitemap-base-url"
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://calctools.app"
          className="ui-input font-mono text-sm"
        />
      </ToolFieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup
          label={isEs ? 'Frecuencia (changefreq)' : 'Change Frequency'}
          htmlFor="sitemap-freq"
        >
          <select
            id="sitemap-freq"
            value={changefreq}
            onChange={(e) => setChangefreq(e.target.value)}
            className="ui-select"
          >
            <option value="always">always</option>
            <option value="hourly">hourly</option>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
            <option value="never">never</option>
          </select>
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Prioridad por Defecto' : 'Default Priority'}
          htmlFor="sitemap-priority"
        >
          <select
            id="sitemap-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="ui-select font-mono"
          >
            <option value="1.0">1.0</option>
            <option value="0.9">0.9</option>
            <option value="0.8">0.8</option>
            <option value="0.7">0.7</option>
            <option value="0.5">0.5</option>
            <option value="0.3">0.3</option>
          </select>
        </ToolFieldGroup>
      </div>

      <ToolFieldGroup
        label={isEs ? 'Rutas (una por línea)' : 'URL Paths (one per line)'}
        htmlFor="sitemap-paths"
        hint={
          isEs
            ? 'Las líneas vacías o "/" representan la página de inicio.'
            : 'An empty line or "/" represents the homepage root.'
        }
      >
        <textarea
          id="sitemap-paths"
          rows={6}
          value={pathsText}
          onChange={(e) => setPathsText(e.target.value)}
          placeholder={'/\n/calculators\n/about'}
          className="ui-input font-mono text-xs resize-y"
        />
      </ToolFieldGroup>

      <div className="pt-1">
        <button
          type="button"
          disabled={!isBaseUrlValid}
          onClick={() =>
            downloadBlob(sitemapXml, 'sitemap.xml', 'application/xml;charset=utf-8')
          }
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar sitemap.xml' : 'Download sitemap.xml'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Documento sitemap.xml' : 'Generated sitemap.xml'}
      state={isBaseUrlValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'URL Base no válida' : 'Invalid Base URL'}
      errorMessage={
        isEs
          ? 'Introduce un dominio válido con http:// o https:// para construir el sitemap.'
          : 'Provide a valid http:// or https:// base URL to build the XML sitemap.'
      }
      primaryLabel={isEs ? 'URLs Indexables' : 'Indexable URLs'}
      primaryValue={String(urlCount)}
      primaryUnit={isEs ? 'entradas' : 'entries'}
      primarySubtext={
        normalizedBase
          ? `${normalizedBase} · changefreq=${changefreq} · priority=${priority}`
          : undefined
      }
      statusLabel={isEs ? 'XML 0.9 Válido' : 'Valid XML 0.9'}
      statusTone="accent"
      copyText={sitemapXml}
      copyLabel={isEs ? 'Copiar XML' : 'Copy XML'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isBaseUrlValid && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile label={isEs ? 'Total URLs' : 'Total URLs'} value={String(urlCount)} accent />
            <ToolMetricTile
              label={isEs ? 'Tamaño' : 'Payload'}
              value={`${new TextEncoder().encode(sitemapXml).length} B`}
            />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[360px] leading-relaxed">
            {sitemapXml}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default SitemapGeneratorCalculator;
