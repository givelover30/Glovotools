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
  userAgent: '*',
  allowPath: '/',
  disallowPath: '/admin/\n/private/',
  crawlDelay: '0',
  sitemapUrl: 'https://calctools.app/sitemap.xml',
};

function stripLineBreaks(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function isValidSitemapUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
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

export const RobotsGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [userAgent, setUserAgent] = useState<string>(DEFAULTS.userAgent);
  const [allowPath, setAllowPath] = useState<string>(DEFAULTS.allowPath);
  const [disallowPath, setDisallowPath] = useState<string>(DEFAULTS.disallowPath);
  const [crawlDelay, setCrawlDelay] = useState<string>(DEFAULTS.crawlDelay);
  const [sitemapUrl, setSitemapUrl] = useState<string>(DEFAULTS.sitemapUrl);

  const parsedDelay = crawlDelay.trim() === '' ? 0 : Number(crawlDelay);
  const isDelayValid =
    crawlDelay.trim() === '' || (Number.isFinite(parsedDelay) && parsedDelay >= 0 && parsedDelay <= 3600);
  const isSitemapValid = isValidSitemapUrl(sitemapUrl);
  const hasError = !isDelayValid || !isSitemapValid;

  const { robotsTxt, directiveCount } = useMemo(() => {
    const lines: string[] = [];
    const safeAgent = stripLineBreaks(userAgent) || '*';
    lines.push(`User-agent: ${safeAgent}`);

    const allowLines = allowPath
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    allowLines.forEach((p) => lines.push(`Allow: ${p}`));

    const disallowLines = disallowPath
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (disallowLines.length > 0) {
      disallowLines.forEach((p) => lines.push(`Disallow: ${p}`));
    } else if (allowLines.length === 0) {
      lines.push('Disallow:');
    }

    if (isDelayValid && parsedDelay > 0) {
      lines.push(`Crawl-delay: ${parsedDelay}`);
    }

    const safeSitemap = stripLineBreaks(sitemapUrl);
    if (safeSitemap && isSitemapValid) {
      lines.push('');
      lines.push(`Sitemap: ${safeSitemap}`);
    }

    const output = lines.join('\n') + '\n';
    const count = lines.filter((l) => l.trim().length > 0).length;
    return { robotsTxt: output, directiveCount: count };
  }, [userAgent, allowPath, disallowPath, parsedDelay, isDelayValid, sitemapUrl, isSitemapValid]);

  const handleReset = () => {
    setUserAgent(DEFAULTS.userAgent);
    setAllowPath(DEFAULTS.allowPath);
    setDisallowPath(DEFAULTS.disallowPath);
    setCrawlDelay(DEFAULTS.crawlDelay);
    setSitemapUrl(DEFAULTS.sitemapUrl);
  };

  const handleClear = () => {
    setUserAgent('*');
    setAllowPath('');
    setDisallowPath('');
    setCrawlDelay('0');
    setSitemapUrl('');
  };

  const presets = [
    {
      label: isEs ? 'Estándar Público' : 'Standard Public',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Bloquear Todo (Staging)' : 'Block All (Staging)',
      onSelect: () => {
        setUserAgent('*');
        setAllowPath('');
        setDisallowPath('/');
        setCrawlDelay('0');
        setSitemapUrl('');
      },
    },
    {
      label: isEs ? 'Solo Googlebot' : 'Googlebot Custom',
      onSelect: () => {
        setUserAgent('Googlebot');
        setAllowPath('/');
        setDisallowPath('/api/\n/tmp/');
        setCrawlDelay('2');
        setSitemapUrl('https://example.com/sitemap.xml');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Reglas de robots.txt' : 'robots.txt Directives'}
      subtitle={
        isEs
          ? 'Define permisos de rastreo, rutas bloqueadas y ubicación del sitemap.'
          : 'Configure crawler access rules, blocked paths, crawl delay, and sitemap URL.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Perfiles' : 'Presets'} presets={presets} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup label="User-agent" htmlFor="robots-agent">
          <select
            id="robots-agent"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="ui-select font-mono"
          >
            <option value="*">* ({isEs ? 'Todos los bots' : 'All bots'})</option>
            <option value="Googlebot">Googlebot</option>
            <option value="Bingbot">Bingbot</option>
            <option value="DuckDuckBot">DuckDuckBot</option>
            <option value="GPTBot">GPTBot</option>
          </select>
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Crawl-delay (segundos)' : 'Crawl-delay (seconds)'}
          htmlFor="robots-delay"
          error={
            !isDelayValid
              ? isEs
                ? 'Introduce un número entre 0 y 3600.'
                : 'Enter a number between 0 and 3600.'
              : undefined
          }
        >
          <input
            id="robots-delay"
            type="number"
            min={0}
            max={3600}
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>
      </div>

      <ToolFieldGroup
        label={isEs ? 'Rutas Permitidas (Allow — una por línea)' : 'Allowed Paths (Allow — one per line)'}
        htmlFor="robots-allow"
      >
        <textarea
          id="robots-allow"
          rows={2}
          value={allowPath}
          onChange={(e) => setAllowPath(e.target.value)}
          placeholder="/"
          className="ui-input font-mono text-sm resize-y"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={
          isEs
            ? 'Rutas Bloqueadas (Disallow — una por línea)'
            : 'Disallowed Paths (Disallow — one per line)'
        }
        htmlFor="robots-disallow"
      >
        <textarea
          id="robots-disallow"
          rows={3}
          value={disallowPath}
          onChange={(e) => setDisallowPath(e.target.value)}
          placeholder={'/admin/\n/private/'}
          className="ui-input font-mono text-sm resize-y"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'URL del Sitemap (opcional)' : 'Sitemap URL (optional)'}
        htmlFor="robots-sitemap"
        error={
          !isSitemapValid
            ? isEs
              ? 'Introduce una URL válida con https:// o http://.'
              : 'Enter a valid URL starting with https:// or http://.'
            : undefined
        }
      >
        <input
          id="robots-sitemap"
          type="url"
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://calctools.app/sitemap.xml"
          className="ui-input font-mono text-sm"
        />
      </ToolFieldGroup>

      <div className="pt-1">
        <button
          type="button"
          disabled={hasError}
          onClick={() => downloadBlob(robotsTxt, 'robots.txt', 'text/plain;charset=utf-8')}
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar robots.txt' : 'Download robots.txt'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Archivo robots.txt Generado' : 'Generated robots.txt'}
      state={hasError ? 'error' : 'ready'}
      errorTitle={isEs ? 'Configuración no válida' : 'Invalid Configuration'}
      errorMessage={
        isEs
          ? 'Corrige el valor de Crawl-delay o la URL del Sitemap para continuar.'
          : 'Fix the Crawl-delay value or Sitemap URL before exporting.'
      }
      primaryLabel={isEs ? 'Directivas Activas' : 'Active Directives'}
      primaryValue={String(directiveCount)}
      primaryUnit={isEs ? 'reglas' : 'rules'}
      primarySubtext={`User-agent: ${stripLineBreaks(userAgent) || '*'}`}
      statusLabel={isEs ? 'RFC 9309 listo' : 'RFC 9309 Ready'}
      statusTone="accent"
      copyText={robotsTxt}
      copyLabel={isEs ? 'Copiar robots.txt' : 'Copy robots.txt'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {!hasError && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label="User-agent"
              value={stripLineBreaks(userAgent) || '*'}
              accent
            />
            <ToolMetricTile
              label="Crawl-delay"
              value={parsedDelay > 0 ? `${parsedDelay}s` : isEs ? 'Ninguno' : 'None'}
            />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[340px] leading-relaxed">
            {robotsTxt}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default RobotsGeneratorCalculator;
