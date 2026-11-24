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

const DEFAULT_TOML = `title = "TOML Example"

[owner]
name = "Tom Preston-Werner"

[database]
enabled = true
ports = [ 8000, 8001, 8002 ]`;

interface TomlValidationResult {
  state: 'empty' | 'ready' | 'error';
  errors: string[];
  sections: string[];
  keyCount: number;
  commentCount: number;
}

function stripInlineComment(value: string): string {
  let inDouble = false;
  let inSingle = false;
  let escaped = false;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inDouble) {
      escaped = true;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '#' && !inDouble && !inSingle) {
      return value.slice(0, i).trim();
    }
  }
  return value.trim();
}

function validateTomlValue(val: string, lineNum: number, isEs: boolean): string | null {
  if (!val) {
    return isEs
      ? `Línea ${lineNum}: Falta el valor después de "=".`
      : `Line ${lineNum}: Missing value after "=".`;
  }

  if (val.startsWith('"')) {
    let closed = false;
    let escaped = false;
    for (let i = 1; i < val.length; i++) {
      const ch = val[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        closed = i === val.length - 1;
        break;
      }
    }
    if (!closed) {
      return isEs
        ? `Línea ${lineNum}: Cadena entre comillas dobles sin cerrar o mal formada.`
        : `Line ${lineNum}: Unclosed or malformed double-quoted string.`;
    }
    return null;
  }

  if (val.startsWith("'")) {
    const endIdx = val.indexOf("'", 1);
    if (endIdx === -1 || endIdx !== val.length - 1) {
      return isEs
        ? `Línea ${lineNum}: Cadena literal entre comillas simples sin cerrar.`
        : `Line ${lineNum}: Unclosed single-quoted literal string.`;
    }
    return null;
  }

  if (val.startsWith('[')) {
    if (!val.endsWith(']')) {
      return isEs
        ? `Línea ${lineNum}: Arreglo sin cerrar (falta "]").`
        : `Line ${lineNum}: Unclosed array (missing "]").`;
    }
    return null;
  }

  if (val.startsWith('{')) {
    if (!val.endsWith('}')) {
      return isEs
        ? `Línea ${lineNum}: Tabla en línea sin cerrar (falta "}").`
        : `Line ${lineNum}: Unclosed inline table (missing "}").`;
    }
    return null;
  }

  // Boolean, number, or ISO date/time
  const isBool = val === 'true' || val === 'false';
  const isNum = /^[+-]?(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?|inf|nan)$/.test(val);
  const isDate = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(val);

  if (!isBool && !isNum && !isDate) {
    return isEs
      ? `Línea ${lineNum}: Valor TOML inválido ("${val}"); las cadenas deben ir entre comillas.`
      : `Line ${lineNum}: Invalid TOML value ("${val}"); strings must be quoted.`;
  }

  return null;
}

function validateTomlText(text: string, isEs: boolean): TomlValidationResult {
  if (!text.trim()) {
    return { state: 'empty', errors: [], sections: [], keyCount: 0, commentCount: 0 };
  }

  const lines = text.split(/\r?\n/);
  const errors: string[] = [];
  const sections: string[] = [];
  let keyCount = 0;
  let commentCount = 0;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('#')) {
      commentCount++;
      return;
    }

    if (trimmed.startsWith('[')) {
      const cleanedHeader = stripInlineComment(trimmed);
      const isArrayTable = cleanedHeader.startsWith('[[') && cleanedHeader.endsWith(']]');
      const isStdTable = !cleanedHeader.startsWith('[[') && cleanedHeader.endsWith(']');
      if (!isArrayTable && !isStdTable) {
        errors.push(
          isEs
            ? `Línea ${lineNum}: Encabezado de tabla sin cerrar.`
            : `Line ${lineNum}: Unclosed table header.`
        );
        return;
      }
      const sectionName = isArrayTable
        ? cleanedHeader.slice(2, -2).trim()
        : cleanedHeader.slice(1, -1).trim();
      if (!sectionName || !/^[A-Za-z0-9_."'-]+$/.test(sectionName)) {
        errors.push(
          isEs
            ? `Línea ${lineNum}: Nombre de sección inválido ("${sectionName}").`
            : `Line ${lineNum}: Invalid section name ("${sectionName}").`
        );
        return;
      }
      sections.push(sectionName);
      return;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Se esperaba una asignación "clave = valor".`
          : `Line ${lineNum}: Expected a "key = value" assignment.`
      );
      return;
    }

    const key = trimmed.slice(0, eqIdx).trim();
    const rawVal = trimmed.slice(eqIdx + 1).trim();

    if (!key) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Falta la clave antes del signo "=".`
          : `Line ${lineNum}: Missing key name before "=".`
      );
      return;
    }

    if (!/^(?:[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*|"[^"]+"|'[^']+')$/.test(key)) {
      errors.push(
        isEs
          ? `Línea ${lineNum}: Clave inválida ("${key}").`
          : `Line ${lineNum}: Invalid bare or quoted key ("${key}").`
      );
      return;
    }

    const valWithoutComment = stripInlineComment(rawVal);
    const valError = validateTomlValue(valWithoutComment, lineNum, isEs);
    if (valError) {
      errors.push(valError);
      return;
    }

    keyCount++;
  });

  return {
    state: errors.length === 0 ? 'ready' : 'error',
    errors,
    sections,
    keyCount,
    commentCount
  };
}

export default function TomlValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_TOML);

  const result = useMemo(() => validateTomlText(input, isEs), [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_TOML);

  const copySummary =
    result.state === 'ready'
      ? `Valid TOML | Sections: ${result.sections.length} (${result.sections.join(', ') || 'root'}) | Keys: ${result.keyCount}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Configuración TOML' : 'TOML Config Validator'}
          subtitle={
            isEs
              ? 'Comprueba encabezados de tablas [section], asignaciones clave = valor y comillas TOML.'
              : 'Checks [table] headers, key = value assignments, arrays, booleans, numbers, and quoted strings.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Documento TOML' : 'TOML Input'}
            htmlFor="toml-validator-input"
            unit="TOML v1.0"
          >
            <textarea
              id="toml-validator-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega tu archivo TOML aquí...' : 'Paste your TOML config here...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'TOML válido' : 'Valid TOML',
                onSelect: () => setInput(DEFAULT_TOML)
              },
              {
                label: isEs ? 'Asignación inválida' : 'Invalid Assignment',
                onSelect: () => setInput(`[server]\nhost localhost\n= 8080`)
              },
              {
                label: isEs ? 'Cadena sin cerrar' : 'Malformed String',
                onSelect: () => setInput(`title = "Unclosed TOML string\n[broken`)
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado TOML' : 'TOML Validation Result'}
          state={result.state}
          primaryLabel={isEs ? 'Estado de configuración' : 'Config Status'}
          primaryValue={
            result.state === 'ready'
              ? isEs
                ? 'TOML Válido'
                : 'Valid TOML'
              : undefined
          }
          primarySubtext={
            result.state === 'ready'
              ? isEs
                ? `Se validaron ${result.keyCount} clave(s) y ${result.sections.length} tabla(s).`
                : `Validated ${result.keyCount} key(s) across ${result.sections.length} table section(s).`
              : undefined
          }
          statusLabel={result.state === 'ready' ? (isEs ? 'Válido' : 'Valid') : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa TOML para validar' : 'Enter TOML to validate'}
          emptyDescription={
            isEs
              ? 'Pega contenido tipo Cargo.toml o pyproject.toml a la izquierda.'
              : 'Paste TOML content such as Cargo.toml or pyproject.toml on the left.'
          }
          errorTitle={
            isEs
              ? `${result.errors.length} error(es) de sintaxis TOML`
              : `${result.errors.length} TOML Syntax Error(s)`
          }
          errorMessage={result.errors.join(' • ')}
        >
          {result.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Claves' : 'Key-Value Pairs'}
                  value={String(result.keyCount)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Tablas / Secciones' : 'Table Sections'}
                  value={String(result.sections.length)}
                />
                <ToolMetricTile
                  label={isEs ? 'Comentarios' : 'Comments'}
                  value={String(result.commentCount)}
                />
              </div>

              {result.sections.length > 0 && (
                <ToolBreakdownList
                  items={result.sections.map((sec, index) => ({
                    label: `${isEs ? 'Sección' : 'Section'} #${index + 1}`,
                    value: `[${sec}]`,
                    highlight: index === 0
                  }))}
                />
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
