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
  title: 'My Awesome Web Page',
  lang: 'en',
  description: 'A modern, responsive web page built with HTML5.',
  author: 'Web Developer',
  includeCss: true,
  includeJs: true,
  includeViewport: true,
};

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

export const HtmlBoilerplateGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [title, setTitle] = useState<string>(DEFAULTS.title);
  const [lang, setLang] = useState<string>(DEFAULTS.lang);
  const [description, setDescription] = useState<string>(DEFAULTS.description);
  const [author, setAuthor] = useState<string>(DEFAULTS.author);
  const [includeCss, setIncludeCss] = useState<boolean>(DEFAULTS.includeCss);
  const [includeJs, setIncludeJs] = useState<boolean>(DEFAULTS.includeJs);
  const [includeViewport, setIncludeViewport] = useState<boolean>(DEFAULTS.includeViewport);

  const htmlCode = useMemo(() => {
    const safeLang = escapeHtml((lang.trim() || 'en').replace(/[^a-zA-Z0-9-]/g, ''));
    const safeTitle = escapeHtml(title.trim() || 'Untitled Document');
    const safeDescription = escapeHtml(description.trim());
    const safeAuthor = escapeHtml(author.trim());

    const headLines: string[] = ['  <meta charset="UTF-8">'];
    if (includeViewport) {
      headLines.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }
    headLines.push(`  <title>${safeTitle}</title>`);
    if (safeDescription) {
      headLines.push(`  <meta name="description" content="${safeDescription}">`);
    }
    if (safeAuthor) {
      headLines.push(`  <meta name="author" content="${safeAuthor}">`);
    }
    if (includeCss) {
      headLines.push('  <link rel="stylesheet" href="styles.css">');
    }

    const bodyLines: string[] = [
      '  <main>',
      `    <h1>${safeTitle}</h1>`,
      safeDescription ? `    <p>${safeDescription}</p>` : '    <p>Start building here.</p>',
      '  </main>',
    ];
    if (includeJs) {
      bodyLines.push('  <script src="script.js" defer></script>');
    }

    return [
      '<!DOCTYPE html>',
      `<html lang="${safeLang}">`,
      '<head>',
      ...headLines,
      '</head>',
      '<body>',
      ...bodyLines,
      '</body>',
      '</html>',
    ].join('\n');
  }, [title, lang, description, author, includeCss, includeJs, includeViewport]);

  const lineCount = useMemo(() => htmlCode.split('\n').length, [htmlCode]);
  const byteSize = useMemo(() => new TextEncoder().encode(htmlCode).length, [htmlCode]);

  const handleReset = () => {
    setTitle(DEFAULTS.title);
    setLang(DEFAULTS.lang);
    setDescription(DEFAULTS.description);
    setAuthor(DEFAULTS.author);
    setIncludeCss(DEFAULTS.includeCss);
    setIncludeJs(DEFAULTS.includeJs);
    setIncludeViewport(DEFAULTS.includeViewport);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setAuthor('');
  };

  const presets = [
    {
      label: isEs ? 'Estándar HTML5' : 'Standard HTML5',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Landing en Español' : 'Spanish Landing',
      onSelect: () => {
        setTitle('Mi Aplicación Web');
        setLang('es');
        setDescription('Sitio web moderno y adaptable creado con HTML5 semántico.');
        setAuthor('Equipo de Ingeniería');
        setIncludeCss(true);
        setIncludeJs(true);
        setIncludeViewport(true);
      },
    },
    {
      label: isEs ? 'Mínimo Sin Scripts' : 'Minimal Static',
      onSelect: () => {
        setTitle('Static Page');
        setLang('en');
        setDescription('');
        setAuthor('');
        setIncludeCss(false);
        setIncludeJs(false);
        setIncludeViewport(true);
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Estructura del Documento HTML5' : 'HTML5 Document Settings'}
      subtitle={
        isEs
          ? 'Configura metadatos, idioma y enlaces de recursos con escapado HTML seguro.'
          : 'Configure metadata, language, and asset links with safe HTML escaping.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Plantillas' : 'Templates'} presets={presets} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <ToolFieldGroup
            label={isEs ? 'Título del Documento' : 'Document Title'}
            htmlFor="html-bp-title"
          >
            <input
              id="html-bp-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEs ? 'Mi Página Web' : 'My Awesome Web Page'}
              className="ui-input"
            />
          </ToolFieldGroup>
        </div>

        <ToolFieldGroup
          label={isEs ? 'Idioma (lang)' : 'Language (lang)'}
          htmlFor="html-bp-lang"
        >
          <input
            id="html-bp-lang"
            type="text"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            placeholder="en"
            maxLength={12}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>
      </div>

      <ToolFieldGroup
        label={isEs ? 'Meta Descripción' : 'Meta Description'}
        htmlFor="html-bp-desc"
      >
        <input
          id="html-bp-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isEs ? 'Descripción breve de la página...' : 'Short page summary...'}
          className="ui-input"
        />
      </ToolFieldGroup>

      <ToolFieldGroup
        label={isEs ? 'Autor' : 'Author'}
        htmlFor="html-bp-author"
      >
        <input
          id="html-bp-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={isEs ? 'Nombre del autor' : 'Author name'}
          className="ui-input"
        />
      </ToolFieldGroup>

      <div className="space-y-2.5 pt-1">
        <UiCheckbox
          id="html-bp-viewport"
          checked={includeViewport}
          onChange={(e) => setIncludeViewport(e.target.checked)}
          label={
            isEs
              ? 'Incluir meta viewport adaptable'
              : 'Include responsive viewport meta tag'
          }
        />
        <UiCheckbox
          id="html-bp-css"
          checked={includeCss}
          onChange={(e) => setIncludeCss(e.target.checked)}
          label={
            isEs
              ? 'Enlazar hoja de estilos (styles.css)'
              : 'Link external stylesheet (styles.css)'
          }
        />
        <UiCheckbox
          id="html-bp-js"
          checked={includeJs}
          onChange={(e) => setIncludeJs(e.target.checked)}
          label={
            isEs
              ? 'Incluir script con defer (script.js)'
              : 'Include deferred script tag (script.js)'
          }
        />
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => downloadBlob(htmlCode, 'index.html', 'text/html;charset=utf-8')}
          className="ui-btn-primary inline-flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar index.html' : 'Download index.html'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Código HTML5 Generado' : 'Generated HTML5 Boilerplate'}
      state="ready"
      primaryLabel={isEs ? 'Estándar' : 'Standard'}
      primaryValue="HTML5"
      primaryUnit={`lang="${(lang.trim() || 'en').replace(/[^a-zA-Z0-9-]/g, '')}"`}
      primarySubtext={
        isEs
          ? `${lineCount} líneas · ${byteSize} bytes · Etiquetas escapadas y balanceadas`
          : `${lineCount} lines · ${byteSize} bytes · Escaped & balanced tags`
      }
      statusLabel={isEs ? 'HTML válido' : 'Valid HTML5'}
      statusTone="accent"
      copyText={htmlCode}
      copyLabel={isEs ? 'Copiar HTML' : 'Copy HTML'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <ToolMetricTile label={isEs ? 'Líneas' : 'Lines'} value={String(lineCount)} accent />
          <ToolMetricTile label={isEs ? 'Tamaño' : 'Size'} value={`${byteSize} B`} />
        </div>

        <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[360px] leading-relaxed">
          {htmlCode}
        </pre>
      </div>
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default HtmlBoilerplateGeneratorCalculator;
