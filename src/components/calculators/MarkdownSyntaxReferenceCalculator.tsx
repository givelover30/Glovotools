import { useState, useMemo, useId } from 'react';
import { FileText, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface MarkdownItem {
  title: string;
  syntax: string;
  renderExample: string;
  description: string;
}

const MARKDOWN_ITEMS: MarkdownItem[] = [
  { title: 'Heading 1', syntax: '# Heading 1', renderExample: 'H1 Header', description: 'Creates a top-level main section heading.' },
  { title: 'Heading 2', syntax: '## Heading 2', renderExample: 'H2 Header', description: 'Creates a sub-section heading.' },
  { title: 'Heading 3', syntax: '### Heading 3', renderExample: 'H3 Header', description: 'Creates a smaller sub-sub-section heading.' },
  { title: 'Bold Text', syntax: '**bold text** or __bold text__', renderExample: 'Bold Text', description: 'Emphasizes text with strong importance in bold.' },
  { title: 'Italic Text', syntax: '*italic text* or _italic text_', renderExample: 'Italic Text', description: 'Emphasizes text in italics.' },
  { title: 'Blockquote', syntax: '> Blockquote text', renderExample: 'Quote text...', description: 'Indents quoted text paragraphs or callouts.' },
  { title: 'Ordered List', syntax: '1. First item\n2. Second item', renderExample: '1. First\n2. Second', description: 'Creates a numbered sequence list.' },
  { title: 'Unordered List', syntax: '- Item one\n- Item two', renderExample: '• Item one\n• Item two', description: 'Creates a bulleted point list.' },
  { title: 'Code Span', syntax: '`inline code()`', renderExample: 'inline code()', description: 'Highlights code snippets inline with monospace font.' },
  { title: 'Fenced Code Block', syntax: '```javascript\nconst x = 10;\n```', renderExample: 'const x = 10;', description: 'Multi-line code blocks with optional language syntax highlighting.' },
  { title: 'Hyperlink', syntax: '[Link Text](https://example.com)', renderExample: 'Link Text', description: 'Embeds a clickable hyperlink URL.' },
  { title: 'Image', syntax: '![Alt Text](image.jpg)', renderExample: '[Image: Alt Text]', description: 'Embeds an image with alt text description.' },
  { title: 'Table', syntax: '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |', renderExample: '| Header 1 | Header 2 |', description: 'Formats structured rows and columns into tabular grids.' },
  { title: 'Horizontal Rule', syntax: '--- or ***', renderExample: '―――――――――', description: 'Inserts a dividing horizontal thematic break line.' }
];

export default function MarkdownSyntaxReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return MARKDOWN_ITEMS;
    return MARKDOWN_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.syntax.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query]);

  const handleCopy = (syntax: string, index: number) => {
    navigator.clipboard?.writeText(syntax);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search Bar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <FileText className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar sintaxis Markdown' : 'Search Markdown syntax'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar sintaxis Markdown (ej. bold, table, link)...'
                : 'Search Markdown syntax (e.g. bold, table, code block)...'
            }
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Search className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-xs font-mono tabular-nums text-text-secondary">
            {filtered.length} / {MARKDOWN_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Grid of Markdown Cheatsheet */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin sintaxis coincidente' : 'No matching Markdown rules'}
          description={
            isEs
              ? 'Prueba buscando otro elemento (heading, bold, table, link).'
              : 'Try searching for another rule (heading, bold, table, link).'
          }
          action={
            <UiButton variant="secondary" size="sm" onClick={() => setQuery('')}>
              {isEs ? 'Limpiar filtro' : 'Clear search'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, index) => (
            <div
              key={item.title}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-accent shrink-0" />
                    <h4 className="text-sm font-bold text-text-primary truncate">{item.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.syntax, index)}
                    aria-label={isEs ? `Copiar ${item.title}` : `Copy ${item.title}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-text-secondary">{item.description}</p>
                <div className="bg-surface-secondary border border-border-subtle p-3 rounded-xl font-mono text-xs text-text-primary overflow-x-auto whitespace-pre-wrap">
                  {item.syntax}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
