import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_URL = 'https://calctools.io/calculators?ref=home';

export default function UrlValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [urlStr, setUrlStr] = useState<string>(DEFAULT_URL);

  const analysis = useMemo(() => {
    const clean = urlStr.trim();
    if (!clean) {
      return { state: 'empty' as const };
    }
    try {
      const parsed = new URL(clean);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      if (isHttp && !parsed.hostname) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? 'La URL HTTP/HTTPS debe incluir un nombre de host válido.'
            : 'HTTP/HTTPS URL must include a valid hostname.'
        };
      }
      const queryEntries = Array.from(parsed.searchParams.entries());
      return {
        state: 'ready' as const,
        parsed,
        isHttp,
        isHttps: parsed.protocol === 'https:',
        queryEntries
      };
    } catch {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'URL inválida. Asegúrate de incluir el protocolo (por ejemplo, https://example.com).'
          : 'Invalid URL syntax. Make sure to include a valid scheme such as https://example.com.'
      };
    }
  }, [urlStr, isEs]);

  const handleClear = () => setUrlStr('');
  const handleReset = () => setUrlStr(DEFAULT_URL);

  const copySummary =
    analysis.state === 'ready'
      ? `Valid URL: ${analysis.parsed.href} | Protocol: ${analysis.parsed.protocol} | Host: ${analysis.parsed.hostname} | Path: ${analysis.parsed.pathname}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador y Analizador de URL' : 'URL Validator & Parser'}
          subtitle={
            isEs
              ? 'Analiza protocolo, host, puerto, ruta, parámetros de consulta y fragmento.'
              : 'Parses protocol, hostname, port, pathname, query parameters, and hash fragments.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'URL completa' : 'URL String'}
            htmlFor="url-validator-input"
            unit="WHATWG URL"
          >
            <input
              id="url-validator-input"
              type="text"
              value={urlStr}
              onChange={(e) => setUrlStr(e.target.value)}
              placeholder="https://example.com/path?query=1"
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: 'HTTPS URL',
                onSelect: () => setUrlStr(DEFAULT_URL)
              },
              {
                label: isEs ? 'Con puerto y hash' : 'Port & Query',
                onSelect: () =>
                  setUrlStr('https://api.example.com:8443/v2/tools?sort=asc&limit=25#top')
              },
              {
                label: isEs ? 'URL inválida' : 'Invalid URL',
                onSelect: () => setUrlStr('not-a-valid-url://bad host')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Componentes de la URL' : 'Parsed URL Components'}
          state={analysis.state}
          primaryLabel={isEs ? 'Estado de la URL' : 'URL Status'}
          primaryValue={
            analysis.state === 'ready'
              ? isEs
                ? 'URL Válida'
                : 'Valid URL'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready' ? analysis.parsed.origin : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.isHttps
                ? 'HTTPS'
                : analysis.parsed.protocol.replace(':', '').toUpperCase()
              : undefined
          }
          statusTone={
            analysis.state === 'ready' && analysis.isHttps ? 'success' : 'accent'
          }
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar análisis' : 'Copy breakdown'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa una URL para analizar' : 'Enter a URL to inspect'}
          emptyDescription={
            isEs
              ? 'Escribe una URL completa incluyendo el protocolo (https://...) a la izquierda.'
              : 'Enter a full URL including protocol (https://...) on the left.'
          }
          errorTitle={isEs ? 'URL mal formada' : 'Malformed URL'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Protocolo' : 'Protocol'}
                  value={analysis.parsed.protocol}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Host' : 'Hostname'}
                  value={analysis.parsed.hostname || '(none)'}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Puerto' : 'Port',
                    value:
                      analysis.parsed.port ||
                      (analysis.parsed.protocol === 'https:'
                        ? '443 (default)'
                        : analysis.parsed.protocol === 'http:'
                          ? '80 (default)'
                          : '—')
                  },
                  {
                    label: isEs ? 'Ruta (Pathname)' : 'Pathname',
                    value: analysis.parsed.pathname || '/'
                  },
                  {
                    label: isEs ? 'Consulta (Search)' : 'Query String',
                    value: analysis.parsed.search || (isEs ? 'Ninguna' : 'None')
                  },
                  {
                    label: isEs ? 'Fragmento (Hash)' : 'Hash Fragment',
                    value: analysis.parsed.hash || (isEs ? 'Ninguno' : 'None')
                  }
                ]}
              />

              {analysis.queryEntries.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Parámetros de consulta' : 'Query Parameters'}
                  </div>
                  <ToolBreakdownList
                    items={analysis.queryEntries.map(([k, v]) => ({
                      label: k,
                      value: v || '(empty)'
                    }))}
                  />
                </div>
              )}

              {analysis.isHttp && (
                <a
                  href={analysis.parsed.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-btn-secondary w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isEs ? 'Abrir enlace externo' : 'Open Safe Link'}</span>
                </a>
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
