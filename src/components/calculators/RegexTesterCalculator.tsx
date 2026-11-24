import React, { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_PATTERN = '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b';
const DEFAULT_FLAGS = 'g';
const DEFAULT_TEXT = 'Contact us at support@calctools.io or admin@example.com for more info.';

interface RegexMatchItem {
  value: string;
  index: number;
  end: number;
  groups: string[];
}

export default function RegexTesterCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [pattern, setPattern] = useState<string>(DEFAULT_PATTERN);
  const [flags, setFlags] = useState<string>(DEFAULT_FLAGS);
  const [testText, setTestText] = useState<string>(DEFAULT_TEXT);

  const analysis = useMemo(() => {
    if (!pattern) {
      return { state: 'empty' as const };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: RegexMatchItem[] = [];

      if (flags.includes('g') || flags.includes('y')) {
        let match: RegExpExecArray | null;
        let safety = 0;
        while ((match = regex.exec(testText)) !== null && safety < 500) {
          matches.push({
            value: match[0],
            index: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1).map((g) => g ?? '')
          });
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          safety++;
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1).map((g) => g ?? '')
          });
        }
      }

      return {
        state: 'ready' as const,
        matches,
        source: regex.source,
        appliedFlags: regex.flags
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid Regular Expression';
      return {
        state: 'error' as const,
        errorMessage: message
      };
    }
  }, [pattern, flags, testText]);

  const highlightedPreview = useMemo(() => {
    if (analysis.state !== 'ready' || !testText) return null;
    if (analysis.matches.length === 0) {
      return <span className="text-text-secondary">{testText}</span>;
    }

    const segments: React.ReactNode[] = [];
    let cursor = 0;

    analysis.matches.forEach((m, idx) => {
      if (m.index < cursor) return;
      if (m.index > cursor) {
        segments.push(
          <span key={`t-${idx}`}>{testText.slice(cursor, m.index)}</span>
        );
      }
      if (m.end > m.index) {
        segments.push(
          <mark
            key={`m-${idx}`}
            className="rounded px-0.5 bg-accent/25 text-text-primary font-semibold border border-accent/40"
          >
            {testText.slice(m.index, m.end)}
          </mark>
        );
      }
      cursor = m.end;
    });

    if (cursor < testText.length) {
      segments.push(<span key="tail">{testText.slice(cursor)}</span>);
    }

    return segments;
  }, [analysis, testText]);

  const handleToggleFlag = (flagChar: string) => {
    setFlags((prev) =>
      prev.includes(flagChar) ? prev.replace(flagChar, '') : `${prev}${flagChar}`
    );
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
  };

  const handleReset = () => {
    setPattern(DEFAULT_PATTERN);
    setFlags(DEFAULT_FLAGS);
    setTestText(DEFAULT_TEXT);
  };

  const copySummary =
    analysis.state === 'ready'
      ? `Regex: /${analysis.source}/${analysis.appliedFlags} | Matches (${analysis.matches.length}): ${analysis.matches.map((m) => m.value).join(', ') || 'None'}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Probador de Expresiones Regulares (Regex)' : 'Regular Expression Tester'}
          subtitle={
            isEs
              ? 'Prueba patrones ECMAScript en vivo con resaltado de coincidencias, grupos y banderas.'
              : 'Test JavaScript/ECMAScript regex patterns live with highlighted matches, indices, and flags.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-9">
              <ToolFieldGroup
                label={isEs ? 'Patrón Regex' : 'Regex Pattern'}
                htmlFor="regex-pattern-input"
              >
                <input
                  id="regex-pattern-input"
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  spellCheck={false}
                  placeholder="[a-z0-9]+"
                  className="ui-input font-mono text-sm"
                />
              </ToolFieldGroup>
            </div>
            <div className="sm:col-span-3">
              <ToolFieldGroup
                label={isEs ? 'Banderas' : 'Flags'}
                htmlFor="regex-flags-input"
              >
                <input
                  id="regex-flags-input"
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  spellCheck={false}
                  placeholder="gim"
                  className="ui-input font-mono text-sm"
                />
              </ToolFieldGroup>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['g', 'i', 'm', 's', 'u'] as const).map((flagChar) => {
              const active = flags.includes(flagChar);
              return (
                <button
                  key={flagChar}
                  type="button"
                  onClick={() => handleToggleFlag(flagChar)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-accent-light border-accent/60 text-accent'
                      : 'bg-surface-secondary/60 border-border-main text-text-secondary hover:text-text-primary'
                  }`}
                >
                  /{flagChar}
                </button>
              );
            })}
          </div>

          <ToolFieldGroup
            label={isEs ? 'Cadena de prueba' : 'Test String'}
            htmlFor="regex-test-string-input"
          >
            <textarea
              id="regex-test-string-input"
              rows={5}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Texto sobre el cual probar...' : 'Enter text to match against...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Correos (g)' : 'Emails (g)',
                onSelect: handleReset
              },
              {
                label: isEs ? 'Fechas YYYY-MM-DD' : 'Dates YYYY-MM-DD',
                onSelect: () => {
                  setPattern('(\\d{4})-(\\d{2})-(\\d{2})');
                  setFlags('g');
                  setTestText('Release dates: 2024-02-29 and 2026-11-20.');
                }
              },
              {
                label: isEs ? 'Regex inválido' : 'Malformed Regex',
                onSelect: () => {
                  setPattern('([unclosed');
                  setFlags('g');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Coincidencias encontradas' : 'Match Results'}
          state={analysis.state}
          primaryLabel={isEs ? 'Total de coincidencias' : 'Matches Found'}
          primaryValue={
            analysis.state === 'ready'
              ? String(analysis.matches.length)
              : undefined
          }
          primaryUnit={
            analysis.state === 'ready'
              ? analysis.matches.length === 1
                ? isEs
                  ? 'coincidencia'
                  : 'match'
                : isEs
                  ? 'coincidencias'
                  : 'matches'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? `/${analysis.source}/${analysis.appliedFlags}`
              : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.matches.length > 0
                ? isEs
                  ? 'Coincide'
                  : 'Matched'
                : isEs
                  ? 'Sin coincidencias'
                  : 'No Match'
              : undefined
          }
          statusTone={
            analysis.state === 'ready' && analysis.matches.length > 0
              ? 'success'
              : 'neutral'
          }
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar coincidencias' : 'Copy matches'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un patrón Regex' : 'Enter a Regex pattern'}
          emptyDescription={
            isEs
              ? 'Escribe una expresión regular a la izquierda para resaltarla en la cadena de prueba.'
              : 'Type a regular expression on the left to highlight matches in real time.'
          }
          errorTitle={isEs ? 'Expresión regular inválida' : 'Invalid Regular Expression'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Coincidencias' : 'Matches'}
                  value={String(analysis.matches.length)}
                  accent={analysis.matches.length > 0}
                />
                <ToolMetricTile
                  label={isEs ? 'Banderas activas' : 'Active Flags'}
                  value={analysis.appliedFlags || (isEs ? 'ninguna' : 'none')}
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-text-secondary">
                  {isEs ? 'Vista resaltada' : 'Highlighted Preview'}
                </div>
                <div className="rounded-xl border border-border-subtle bg-surface-secondary/60 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
                  {highlightedPreview || (
                    <span className="text-text-tertiary italic">
                      {isEs ? '(cadena de prueba vacía)' : '(empty test string)'}
                    </span>
                  )}
                </div>
              </div>

              {analysis.matches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Lista de coincidencias' : 'Captured Matches'}
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {analysis.matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-secondary/50 px-3 py-2 text-xs font-mono"
                      >
                        <span className="text-accent font-semibold break-all">
                          #{idx + 1}: &quot;{m.value}&quot;
                        </span>
                        <span className="text-text-tertiary shrink-0">
                          [{m.index}..{m.end}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
