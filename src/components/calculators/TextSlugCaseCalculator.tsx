import React, { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';

const DEFAULT_TEXT = 'Hello World! Welcome to CalcTools Generator Suite.';

interface FormatRow {
  id: string;
  label: string;
  value: string;
}

function tokenizeWords(input: string): string[] {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  const cleaned = normalized
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

  if (!cleaned) return [];
  return cleaned.split(/\s+/).map((w) => w.toLowerCase());
}

export const TextSlugCaseCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const words = useMemo(() => tokenizeWords(text), [text]);
  const isEmpty = text.trim().length === 0;

  const formats = useMemo<FormatRow[]>(() => {
    const slug = words.join('-');
    const kebab = words.join('-');
    const snake = words.join('_');
    const camel = words
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join('');
    const pascal = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    const title = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const upper = text.trim().toUpperCase();
    const lower = text.trim().toLowerCase();

    return [
      { id: 'url-slug', label: isEs ? 'URL Slug' : 'URL Slug', value: slug },
      { id: 'kebab', label: 'kebab-case', value: kebab },
      { id: 'snake', label: 'snake_case', value: snake },
      { id: 'camel', label: 'camelCase', value: camel },
      { id: 'pascal', label: 'PascalCase', value: pascal },
      { id: 'title', label: isEs ? 'Title Case' : 'Title Case', value: title },
      { id: 'upper', label: 'UPPERCASE', value: upper },
      { id: 'lower', label: 'lowercase', value: lower },
    ];
  }, [words, text, isEs]);

  const copyAllText = useMemo(
    () => formats.map((f) => `${f.label}: ${f.value}`).join('\n'),
    [formats]
  );

  const handleCopyRow = (id: string, value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  const handleReset = () => {
    setText(DEFAULT_TEXT);
    setCopiedId(null);
  };

  const handleClear = () => {
    setText('');
    setCopiedId(null);
  };

  const presets = [
    {
      label: isEs ? 'Ejemplo Base' : 'Default Sample',
      onSelect: () => setText(DEFAULT_TEXT),
    },
    {
      label: isEs ? 'Acentos Español' : 'Unicode Accents',
      onSelect: () => setText('¡Café & Piñata! Guía Rápida de Diseño — 2026'),
    },
    {
      label: 'camelCaseAPI',
      onSelect: () => setText('getUserProfileByID_v2'),
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Texto de Entrada' : 'Source Text'}
      subtitle={
        isEs
          ? 'Normaliza diacríticos Unicode y convierte a 8 formatos de caso y slug.'
          : 'Normalizes Unicode accents and converts into 8 URL slug and case formats.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Ejemplos' : 'Samples'} presets={presets} />

      <ToolFieldGroup
        label={isEs ? 'Texto a Convertir' : 'Text to Convert'}
        htmlFor="slug-source-text"
        hint={
          isEs
            ? 'Soporta acentos (á, ñ, ü), puntuación y separación camelCase.'
            : 'Handles diacritics (á, ñ, ü), punctuation, and existing camelCase boundaries.'
        }
      >
        <textarea
          id="slug-source-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isEs
              ? 'Escribe o pega una frase o identificador...'
              : 'Type or paste a headline, phrase, or identifier...'
          }
          className="ui-input resize-y text-sm"
        />
      </ToolFieldGroup>

      <div className="grid grid-cols-2 gap-2.5">
        <ToolMetricTile
          label={isEs ? 'Palabras Detectadas' : 'Detected Words'}
          value={String(words.length)}
          accent
        />
        <ToolMetricTile
          label={isEs ? 'Caracteres' : 'Characters'}
          value={String(text.length)}
        />
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Formatos Convertidos' : 'Converted Formats'}
      state={isEmpty ? 'empty' : 'ready'}
      emptyTitle={isEs ? 'Introduce texto para convertir' : 'Enter text to convert'}
      emptyDescription={
        isEs
          ? 'Verás al instante el URL slug y las conversiones de mayúsculas/minúsculas.'
          : 'URL slug and all identifier case styles will appear here instantly.'
      }
      primaryLabel="URL Slug"
      primaryValue={formats[0]?.value || '—'}
      primarySubtext={
        !isEmpty
          ? isEs
            ? `${formats.length} formatos listos · Haz clic en cada fila para copiar`
            : `${formats.length} formats ready · Click any row copy button`
          : undefined
      }
      statusLabel={isEs ? '8 formatos' : '8 formats'}
      statusTone="accent"
      copyText={copyAllText}
      copyLabel={isEs ? 'Copiar Todos' : 'Copy All'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {!isEmpty && (
        <div className="space-y-2">
          {formats.map((row) => {
            const isRowCopied = copiedId === row.id;
            return (
              <div
                key={row.id}
                data-format-id={row.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border-main bg-surface-secondary"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {row.label}
                  </div>
                  <div className="font-mono text-xs text-text-primary break-all mt-0.5">
                    {row.value || '—'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyRow(row.id, row.value)}
                  disabled={!row.value}
                  aria-label={isEs ? `Copiar ${row.label}` : `Copy ${row.label}`}
                  className="ui-btn-secondary shrink-0 px-2.5 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                >
                  {isRowCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent" />
                      {isEs ? 'Copiado' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {isEs ? 'Copiar' : 'Copy'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default TextSlugCaseCalculator;
