import { useMemo, useState } from 'react';
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

const DEFAULT_YAML = `server:
  host: localhost
  port: 8080
users:
  - name: Admin
    role: superuser`;

interface YamlValidationResult {
  state: 'empty' | 'ready' | 'error';
  errors: string[];
  lineCount: number;
  mappingCount: number;
  listCount: number;
  commentCount: number;
  maxIndentLevel: number;
}

function hasUnclosedQuote(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('"')) {
    let escaped = false;
    for (let i = 1; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        return false;
      }
    }
    return true;
  }
  if (trimmed.startsWith("'")) {
    let i = 1;
    while (i < trimmed.length) {
      if (trimmed[i] === "'") {
        if (trimmed[i + 1] === "'") {
          i += 2;
          continue;
        }
        return false;
      }
      i++;
    }
    return true;
  }
  return false;
}

function validateYamlText(text: string, isEs: boolean): YamlValidationResult {
  if (!text.trim()) {
    return {
      state: 'empty',
      errors: [],
      lineCount: 0,
      mappingCount: 0,
      listCount: 0,
      commentCount: 0,
      maxIndentLevel: 0
    };
  }

  const lines = text.split(/\r?\n/);
  const errors: string[] = [];
  let mappingCount = 0;
  let listCount = 0;
  let commentCount = 0;
  let maxIndentLevel = 0;
  let prevIndent = 0;
  let prevOpenedBlock = false;
  let inBlockScalar = false;
  let blockScalarIndent = -1;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('#')) {
      commentCount++;
      return;
    }
    if (trimmed === '---' || trimmed === '...') {
      prevIndent = 0;
      prevOpenedBlock = false;
      inBlockScalar = false;
      return;
    }

    const leadingWhitespace = rawLine.match(/^[ \t]*/)?.[0] || '';
    if (leadingWhitespace.includes('\t')) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: YAML no permite tabulaciones para sangría; usa espacios.`
          : `Line ${lineNum}: Tabs are not allowed for YAML indentation; use spaces.`
      );
      return;
    }

    const indent = leadingWhitespace.length;

    if (inBlockScalar) {
      if (indent > blockScalarIndent) {
        return;
      }
      inBlockScalar = false;
      blockScalarIndent = -1;
    }

    if (indent % 2 !== 0) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Sangría inconsistente (${indent} espacios; usa múltiplos de 2).`
          : `Line ${lineNum}: Inconsistent indentation (${indent} spaces; expected a multiple of 2).`
      );
    }

    if (indent > prevIndent + 2 && !prevOpenedBlock) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Salto de sangría inesperado de ${prevIndent} a ${indent} espacios.`
          : `Line ${lineNum}: Unexpected indentation jump from ${prevIndent} to ${indent} spaces.`
      );
    }

    if (indent > maxIndentLevel) {
      maxIndentLevel = indent;
    }

    if (trimmed.startsWith('-')) {
      if (trimmed.length > 1 && trimmed[1] !== ' ') {
        errors.push(
          isEs
            ? `Línea ${lineNum}: Los elementos de lista deben incluir un espacio después de "-".`
            : `Line ${lineNum}: Sequence items must have a space after "-".`
        );
        return;
      }
      listCount++;
      const itemRest = trimmed.slice(1).trim();
      if (!itemRest) {
        prevOpenedBlock = true;
        prevIndent = indent;
        return;
      }
      const colonIdx = itemRest.indexOf(':');
      if (colonIdx !== -1) {
        const afterColon = itemRest.slice(colonIdx + 1);
        if (afterColon.length > 0 && !afterColon.startsWith(' ')) {
          errors.push(
            isEs
              ? `Línea ${lineNum}: Falta un espacio después de ":" en el mapeo de lista.`
              : `Line ${lineNum}: Missing space after ":" in list mapping.`
          );
        }
        const val = afterColon.trim();
        if (hasUnclosedQuote(val)) {
          errors.push(
            isEs
              ? `Línea ${lineNum}: Cadena entre comillas sin cerrar.`
              : `Line ${lineNum}: Unclosed quoted string value.`
          );
        }
        mappingCount++;
        prevOpenedBlock = val === '' || val === '|' || val === '>';
        if (val === '|' || val === '>') {
          inBlockScalar = true;
          blockScalarIndent = indent;
        }
      } else {
        if (hasUnclosedQuote(itemRest)) {
          errors.push(
            isEs
              ? `Línea ${lineNum}: Elemento de lista con comillas sin cerrar.`
              : `Line ${lineNum}: Unclosed quoted sequence value.`
          );
        }
        prevOpenedBlock = false;
      }
      prevIndent = indent;
      return;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Falta el separador ":" en el par clave-valor ("${trimmed}").`
          : `Line ${lineNum}: Missing ":" in key-value mapping ("${trimmed}").`
      );
      prevIndent = indent;
      prevOpenedBlock = false;
      return;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const afterColon = trimmed.slice(colonIdx + 1);
    if (!key) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Falta el nombre de la clave antes de ":".`
          : `Line ${lineNum}: Missing key name before ":".`
      );
    }
    if (afterColon.length > 0 && !afterColon.startsWith(' ')) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Se requiere un espacio después de ":".`
          : `Line ${lineNum}: A space is required after ":".`
      );
    }

    const value = afterColon.trim();
    if (hasUnclosedQuote(value)) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Cadena entre comillas sin cerrar.`
          : `Line ${lineNum}: Unclosed quoted string.`
      );
    }

    mappingCount++;
    prevOpenedBlock = value === '' || value === '|' || value === '>';
    if (value === '|' || value === '>') {
      inBlockScalar = true;
      blockScalarIndent = indent;
    }
    prevIndent = indent;
  });

  return {
    state: errors.length === 0 ? 'ready' : 'error',
    errors,
    lineCount: lines.filter((l) => l.trim().length > 0).length,
    mappingCount,
    listCount,
    commentCount,
    maxIndentLevel
  };
}

export default function YamlValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_YAML);

  const result = useMemo(() => validateYamlText(input, isEs), [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_YAML);

  const summaryText =
    result.state === 'ready'
      ? `Valid YAML | Non-empty lines: ${result.lineCount}, Mappings: ${result.mappingCount}, List items: ${result.listCount}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Sintaxis YAML' : 'YAML Syntax Validator'}
          subtitle={
            isEs
              ? 'Verifica sangría de 2 espacios, tabulaciones prohibidas, listas y pares clave-valor.'
              : 'Checks 2-space indentation, forbidden tabs, sequences, quotes, and key-value mappings.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Contenido YAML' : 'YAML Input'}
            htmlFor="yaml-validator-input"
            unit="YAML 1.2"
          >
            <textarea
              id="yaml-validator-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega tu configuración YAML...' : 'Paste your YAML document here...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'YAML válido' : 'Valid Nested YAML',
                onSelect: () => setInput(DEFAULT_YAML)
              },
              {
                label: isEs ? 'Sangría inválida' : 'Bad Indentation',
                onSelect: () =>
                  setInput(`server:\n   host: localhost\n\tport: 8080`)
              },
              {
                label: isEs ? 'Sin separador :' : 'Malformed Mapping',
                onSelect: () =>
                  setInput(`service:\n  name CalcTools\n  version: "2.0`)
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Diagnóstico YAML' : 'YAML Diagnostics'}
          state={result.state}
          primaryLabel={isEs ? 'Estado estructural' : 'Structure Status'}
          primaryValue={
            result.state === 'ready'
              ? isEs
                ? 'YAML Válido'
                : 'Valid YAML'
              : undefined
          }
          primarySubtext={
            result.state === 'ready'
              ? isEs
                ? 'No se detectaron errores de sangría, comillas ni sintaxis en los pares clave-valor.'
                : 'No indentation, quote, or key-value syntax errors detected.'
              : undefined
          }
          statusLabel={result.state === 'ready' ? (isEs ? 'Aprobado' : 'Passed') : undefined}
          statusTone="success"
          copyText={summaryText}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa YAML para validar' : 'Enter YAML to validate'}
          emptyDescription={
            isEs
              ? 'Escribe o pega una configuración YAML en el editor de la izquierda.'
              : 'Type or paste a YAML configuration in the editor on the left.'
          }
          errorTitle={
            isEs
              ? `Se encontraron ${result.errors.length} problema(s) YAML`
              : `Found ${result.errors.length} YAML Issue(s)`
          }
          errorMessage={result.errors.join(' • ')}
        >
          {result.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Líneas activas' : 'Active Lines'}
                  value={String(result.lineCount)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Mapeos' : 'Mappings'}
                  value={String(result.mappingCount)}
                />
                <ToolMetricTile
                  label={isEs ? 'Ítems de lista' : 'List Items'}
                  value={String(result.listCount)}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Nivel máximo de sangría' : 'Max Indentation',
                    value: `${result.maxIndentLevel} ${isEs ? 'espacios' : 'spaces'}`
                  },
                  {
                    label: isEs ? 'Comentarios (#)' : 'Comment Lines (#)',
                    value: String(result.commentCount)
                  }
                ]}
              />
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
