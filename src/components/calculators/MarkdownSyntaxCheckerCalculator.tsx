import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_MARKDOWN = `# Welcome to Markdown

This is a **bold** statement and *italic* text.

- List item 1
- List item 2

Check out [CalcTools](https://calctools.io).`;

interface MarkdownCheckResult {
  state: 'empty' | 'ready';
  headings: number;
  links: number;
  lists: number;
  words: number;
  warnings: string[];
}

function checkMarkdown(text: string, isEs: boolean): MarkdownCheckResult {
  if (!text.trim()) {
    return { state: 'empty', headings: 0, links: 0, lists: 0, words: 0, warnings: [] };
  }

  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);

  let inFence = false;
  let fenceStartLine = 0;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (!inFence) {
        inFence = true;
        fenceStartLine = idx + 1;
      } else {
        inFence = false;
      }
      return;
    }

    if (inFence) return;

    // Strip inline code spans before checking emphasis markers
    const withoutCode = line.replace(/`[^`]*`/g, '');
    const backticksLeft = (withoutCode.match(/`/g) || []).length;
    if (backticksLeft > 0) {
      warnings.push(
        isEs
          ? `Línea ${idx + 1}: Comilla invertida (\`) sin cerrar.`
          : `Line ${idx + 1}: Unclosed inline code backtick (\`).`
      );
    }

    // Check unbalanced * outside list bullets (leading "* ")
    const strippedBullet = withoutCode.replace(/^\s*\*\s+/, '');
    const starMatches = strippedBullet.match(/\*/g) || [];
    if (starMatches.length % 2 !== 0) {
      warnings.push(
        isEs
          ? `Línea ${idx + 1}: Posibles marcadores de negrita/cursiva (*) desbalanceados.`
          : `Line ${idx + 1}: Potential unbalanced bold/italic (*) markers.`
      );
    }

    // Check malformed links like [label](url without closing )
    if (/\[[^\]]+\]\([^)\s]*$/.test(withoutCode) || /\[[^\]]+\]\(\s*\)/.test(withoutCode)) {
      warnings.push(
        isEs
          ? `Línea ${idx + 1}: Sintaxis de enlace Markdown incompleta o vacía.`
          : `Line ${idx + 1}: Incomplete or empty Markdown link syntax.`
      );
    }
  });

  if (inFence) {
    warnings.push(
      isEs
        ? `Bloque de código con triple comilla invertida (\`\`\`) iniciado en línea ${fenceStartLine} sin cerrar.`
        : `Unclosed fenced code block (\`\`\`) opened on line ${fenceStartLine}.`
    );
  }

  const headings = (text.match(/^#{1,6}\s+.+/gm) || []).length;
  const links = (text.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const lists = (text.match(/^\s*(?:[-*+]|\d+\.)\s+/gm) || []).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return {
    state: 'ready',
    headings,
    links,
    lists,
    words,
    warnings
  };
}

export default function MarkdownSyntaxCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_MARKDOWN);

  const result = useMemo(() => checkMarkdown(input, isEs), [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_MARKDOWN);

  const copySummary =
    result.state === 'ready'
      ? `Markdown Check | Words: ${result.words}, Headings: ${result.headings}, Links: ${result.links}, Lists: ${result.lists}, Warnings: ${result.warnings.length}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Verificador de Sintaxis Markdown' : 'Markdown Syntax Checker'}
          subtitle={
            isEs
              ? 'Detecta énfasis sin cerrar, bloques de código abiertos y enlaces incompletos.'
              : 'Checks emphasis balance, fenced code blocks, links, headings, and document stats.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Contenido Markdown' : 'Markdown Source'}
            htmlFor="markdown-checker-input"
            unit="CommonMark"
          >
            <textarea
              id="markdown-checker-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={
                isEs ? 'Escribe o pega Markdown aquí...' : 'Write or paste Markdown text here...'
              }
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Markdown limpio' : 'Clean Markdown',
                onSelect: () => setInput(DEFAULT_MARKDOWN)
              },
              {
                label: isEs ? 'Énfasis desbalanceado' : 'Unbalanced Syntax',
                onSelect: () =>
                  setInput(
                    '# Draft\n\nThis has **unclosed bold and *mismatch.\n\nSee [Broken Link](https://example.com\n\n```js\nconst x = 1;'
                  )
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resumen de revisión' : 'Syntax Review'}
          state={result.state}
          primaryLabel={isEs ? 'Estado Markdown' : 'Markdown Status'}
          primaryValue={
            result.state === 'ready'
              ? result.warnings.length === 0
                ? isEs
                  ? 'Sintaxis Limpia'
                  : 'Clean Syntax'
                : isEs
                  ? `${result.warnings.length} Advertencia(s)`
                  : `${result.warnings.length} Warning(s)`
              : undefined
          }
          primarySubtext={
            result.state === 'ready'
              ? result.warnings.length === 0
                ? isEs
                  ? 'No se encontraron marcadores sin cerrar ni enlaces rotos.'
                  : 'No unbalanced emphasis markers, unclosed code fences, or broken links found.'
                : isEs
                  ? 'Revisa las advertencias de sintaxis listadas abajo.'
                  : 'Review the formatting warnings listed below.'
              : undefined
          }
          statusLabel={
            result.state === 'ready'
              ? result.warnings.length === 0
                ? isEs
                  ? 'Sin alertas'
                  : 'Clean'
                : isEs
                  ? 'Revisar'
                  : 'Attention'
              : undefined
          }
          statusTone={result.warnings.length === 0 ? 'success' : 'warning'}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa Markdown para revisar' : 'Enter Markdown to check'}
          emptyDescription={
            isEs
              ? 'Escribe encabezados, listas o enlaces en el panel izquierdo.'
              : 'Write headings, lists, or links in the editor on the left.'
          }
        >
          {result.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Palabras' : 'Words'}
                  value={String(result.words)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Encabezados' : 'Headings'}
                  value={String(result.headings)}
                />
                <ToolMetricTile
                  label={isEs ? 'Enlaces' : 'Links'}
                  value={String(result.links)}
                />
                <ToolMetricTile
                  label={isEs ? 'Listas' : 'List Items'}
                  value={String(result.lists)}
                />
              </div>

              {result.warnings.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-3.5 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-status-warning">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{isEs ? 'Advertencias de sintaxis' : 'Syntax Warnings'}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-text-primary list-disc pl-5">
                    {result.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
