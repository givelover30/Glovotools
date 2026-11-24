import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_TEXT1 = `CalcTools is fast.
It supports math and finance.
All tools run locally.`;

const DEFAULT_TEXT2 = `CalcTools is super fast.
It supports math, finance, and dev tools.
All tools run locally.`;

type DiffType = 'equal' | 'modified' | 'added' | 'removed';

interface DiffRow {
  lineNum: number;
  type: DiffType;
  left: string | undefined;
  right: string | undefined;
}

export default function TextDiffCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [text1, setText1] = useState<string>(DEFAULT_TEXT1);
  const [text2, setText2] = useState<string>(DEFAULT_TEXT2);

  const analysis = useMemo(() => {
    if (!text1 && !text2) {
      return { state: 'empty' as const };
    }

    const lines1 = text1 ? text1.split(/\r?\n/) : [];
    const lines2 = text2 ? text2.split(/\r?\n/) : [];
    const maxLen = Math.max(lines1.length, lines2.length);
    const rows: DiffRow[] = [];

    let added = 0;
    let removed = 0;
    let modified = 0;
    let equal = 0;

    for (let i = 0; i < maxLen; i++) {
      const left = lines1[i];
      const right = lines2[i];

      if (left === right) {
        rows.push({ lineNum: i + 1, type: 'equal', left, right });
        equal++;
      } else if (left !== undefined && right !== undefined) {
        rows.push({ lineNum: i + 1, type: 'modified', left, right });
        modified++;
      } else if (left === undefined) {
        rows.push({ lineNum: i + 1, type: 'added', left, right });
        added++;
      } else {
        rows.push({ lineNum: i + 1, type: 'removed', left, right });
        removed++;
      }
    }

    const totalChanges = added + removed + modified;

    const unifiedText = rows
      .map((r) => {
        if (r.type === 'equal') return `  ${r.left ?? ''}`;
        if (r.type === 'added') return `+ ${r.right ?? ''}`;
        if (r.type === 'removed') return `- ${r.left ?? ''}`;
        return `- ${r.left ?? ''}\n+ ${r.right ?? ''}`;
      })
      .join('\n');

    return {
      state: 'ready' as const,
      rows,
      added,
      removed,
      modified,
      equal,
      totalChanges,
      unifiedText
    };
  }, [text1, text2]);

  const handleSwap = () => {
    setText1(text2);
    setText2(text1);
  };

  const handleClear = () => {
    setText1('');
    setText2('');
  };

  const handleReset = () => {
    setText1(DEFAULT_TEXT1);
    setText2(DEFAULT_TEXT2);
  };

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Comparador de Diferencias de Texto' : 'Text Diff Checker'}
          subtitle={
            isEs
              ? 'Compara dos bloques de texto línea por línea resaltando adiciones, eliminaciones y cambios.'
              : 'Compares two text blocks line by line, highlighting additions, removals, and modifications.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Texto original (A)' : 'Original Text (A)'}
            htmlFor="text-diff-left-input"
          >
            <textarea
              id="text-diff-left-input"
              rows={5}
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega el texto original...' : 'Paste original text...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolFieldGroup
            label={isEs ? 'Texto modificado (B)' : 'Modified Text (B)'}
            htmlFor="text-diff-right-input"
          >
            <textarea
              id="text-diff-right-input"
              rows={5}
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega el texto modificado...' : 'Paste modified text...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <button type="button" onClick={handleSwap} className="ui-btn-secondary w-full">
            <ArrowLeftRight className="w-4 h-4" />
            <span>{isEs ? 'Intercambiar A y B' : 'Swap Original & Modified'}</span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Con modificaciones' : 'Modified Lines',
                onSelect: handleReset
              },
              {
                label: isEs ? 'Textos idénticos' : 'Identical Texts',
                onSelect: () => {
                  setText1('Line 1\nLine 2\nLine 3');
                  setText2('Line 1\nLine 2\nLine 3');
                }
              },
              {
                label: isEs ? 'Añadidos / Eliminados' : 'Added & Removed',
                onSelect: () => {
                  setText1('Alpha\nBeta\nGamma\nDelta');
                  setText2('Alpha\nBeta');
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Comparación línea por línea' : 'Line-by-Line Diff'}
          state={analysis.state}
          primaryLabel={isEs ? 'Resumen de cambios' : 'Diff Summary'}
          primaryValue={
            analysis.state === 'ready'
              ? analysis.totalChanges === 0
                ? isEs
                  ? 'Textos Idénticos'
                  : 'Identical Texts'
                : `${analysis.totalChanges} ${isEs ? 'Diferencia(s)' : 'Line Difference(s)'}`
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? isEs
                ? `+${analysis.added} añadidas • -${analysis.removed} eliminadas • ~${analysis.modified} modificadas • ${analysis.equal} iguales`
                : `+${analysis.added} added • -${analysis.removed} removed • ~${analysis.modified} modified • ${analysis.equal} unchanged`
              : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.totalChanges === 0
                ? isEs
                  ? 'Idénticos'
                  : 'Identical'
                : isEs
                  ? 'Cambios'
                  : 'Changed'
              : undefined
          }
          statusTone={
            analysis.state === 'ready' && analysis.totalChanges === 0
              ? 'success'
              : 'accent'
          }
          copyText={analysis.state === 'ready' ? analysis.unifiedText : undefined}
          copyLabel={isEs ? 'Copiar diff' : 'Copy diff'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa textos para comparar' : 'Enter texts to compare'}
          emptyDescription={
            isEs
              ? 'Escribe o pega texto en los campos Original y Modificado a la izquierda.'
              : 'Paste text into Original and Modified fields on the left to inspect differences.'
          }
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ToolMetricTile
                  label={isEs ? 'Añadidas' : 'Added'}
                  value={`+${analysis.added}`}
                  accent={analysis.added > 0}
                />
                <ToolMetricTile
                  label={isEs ? 'Eliminadas' : 'Removed'}
                  value={`-${analysis.removed}`}
                />
                <ToolMetricTile
                  label={isEs ? 'Modificadas' : 'Modified'}
                  value={`~${analysis.modified}`}
                />
                <ToolMetricTile
                  label={isEs ? 'Sin cambios' : 'Equal'}
                  value={String(analysis.equal)}
                />
              </div>

              <div className="rounded-xl border border-border-subtle overflow-hidden divide-y divide-border-subtle font-mono text-xs">
                {analysis.rows.map((row) => {
                  if (row.type === 'equal') {
                    return (
                      <div
                        key={row.lineNum}
                        className="flex items-start gap-2.5 px-3 py-2 bg-surface text-text-secondary"
                      >
                        <span className="w-6 shrink-0 text-right text-text-tertiary select-none">
                          {row.lineNum}
                        </span>
                        <span className="w-3 shrink-0 text-text-tertiary select-none">&nbsp;</span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {row.left}
                        </span>
                      </div>
                    );
                  }

                  if (row.type === 'added') {
                    return (
                      <div
                        key={row.lineNum}
                        className="flex items-start gap-2.5 px-3 py-2 bg-status-success-bg text-text-primary"
                      >
                        <span className="w-6 shrink-0 text-right text-status-success select-none">
                          {row.lineNum}
                        </span>
                        <span className="w-3 shrink-0 font-bold text-status-success select-none">
                          +
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {row.right}
                        </span>
                      </div>
                    );
                  }

                  if (row.type === 'removed') {
                    return (
                      <div
                        key={row.lineNum}
                        className="flex items-start gap-2.5 px-3 py-2 bg-status-error-bg text-text-primary"
                      >
                        <span className="w-6 shrink-0 text-right text-status-error select-none">
                          {row.lineNum}
                        </span>
                        <span className="w-3 shrink-0 font-bold text-status-error select-none">
                          -
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {row.left}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={row.lineNum} className="divide-y divide-border-subtle/60">
                      <div className="flex items-start gap-2.5 px-3 py-2 bg-status-error-bg text-text-primary">
                        <span className="w-6 shrink-0 text-right text-status-error select-none">
                          {row.lineNum}
                        </span>
                        <span className="w-3 shrink-0 font-bold text-status-error select-none">
                          -
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {row.left}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 px-3 py-2 bg-status-success-bg text-text-primary">
                        <span className="w-6 shrink-0 text-right text-status-success select-none">
                          {row.lineNum}
                        </span>
                        <span className="w-3 shrink-0 font-bold text-status-success select-none">
                          +
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {row.right}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
