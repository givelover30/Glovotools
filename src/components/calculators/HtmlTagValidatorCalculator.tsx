import { useMemo, useState } from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_HTML = `<div class="container">
  <h1>Hello World</h1>
  <p>This is a valid <strong>HTML</strong> snippet.</p>
  <img src="test.jpg" alt="test" />
</div>`;

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

interface HtmlValidationResult {
  state: 'empty' | 'ready' | 'error';
  errors: string[];
  tagCount: number;
  voidTagCount: number;
  maxDepth: number;
}

function validateAttributes(attrString: string, tagName: string, isEs: boolean): string | null {
  const trimmed = attrString.trim();
  if (!trimmed) return null;

  let i = 0;
  while (i < trimmed.length) {
    while (i < trimmed.length && /\s/.test(trimmed[i])) i++;
    if (i >= trimmed.length) break;

    if (trimmed[i] === '=') {
      return isEs
        ? `Atributo mal formado en <${tagName}>: "=" sin nombre de atributo.`
        : `Malformed attribute in <${tagName}>: unexpected "=" without attribute name.`;
    }

    const nameStart = i;
    while (i < trimmed.length && !/[\s=/>"'<]/.test(trimmed[i])) i++;
    const attrName = trimmed.slice(nameStart, i);

    if (!attrName || !/^[A-Za-z_:@][A-Za-z0-9_.:@-]*$/.test(attrName)) {
      return isEs
        ? `Nombre de atributo inválido en <${tagName}> ("${attrName || trimmed[i]}").`
        : `Invalid attribute name in <${tagName}> ("${attrName || trimmed[i]}").`;
    }

    while (i < trimmed.length && /\s/.test(trimmed[i])) i++;
    if (i < trimmed.length && trimmed[i] === '=') {
      i++;
      while (i < trimmed.length && /\s/.test(trimmed[i])) i++;
      if (i >= trimmed.length) {
        return isEs
          ? `Falta el valor del atributo "${attrName}" en <${tagName}>.`
          : `Missing value for attribute "${attrName}" in <${tagName}>.`;
      }
      const quote = trimmed[i];
      if (quote === '"' || quote === "'") {
        i++;
        const closeIdx = trimmed.indexOf(quote, i);
        if (closeIdx === -1) {
          return isEs
            ? `Comilla sin cerrar en el atributo "${attrName}" de <${tagName}>.`
            : `Unclosed quote in attribute "${attrName}" of <${tagName}>.`;
        }
        i = closeIdx + 1;
        if (i < trimmed.length && !/\s/.test(trimmed[i])) {
          return isEs
            ? `Falta espacio después del valor de "${attrName}" en <${tagName}>.`
            : `Missing whitespace after "${attrName}" value in <${tagName}>.`;
        }
      } else {
        const valStart = i;
        while (i < trimmed.length && !/\s/.test(trimmed[i])) {
          if (trimmed[i] === '"' || trimmed[i] === "'" || trimmed[i] === '<' || trimmed[i] === '=') {
            return isEs
              ? `Valor de atributo sin comillas mal formado para "${attrName}" en <${tagName}>.`
              : `Malformed unquoted attribute value for "${attrName}" in <${tagName}>.`;
          }
          i++;
        }
        if (i === valStart) {
          return isEs
            ? `Valor vacío para el atributo "${attrName}" en <${tagName}>.`
            : `Empty value for attribute "${attrName}" in <${tagName}>.`;
        }
      }
    }
  }

  return null;
}

function validateHtmlSnippet(html: string, isEs: boolean): HtmlValidationResult {
  if (!html.trim()) {
    return { state: 'empty', errors: [], tagCount: 0, voidTagCount: 0, maxDepth: 0 };
  }

  // Strip HTML comments before tag inspection
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  const errors: string[] = [];
  const stack: string[] = [];
  let tagCount = 0;
  let voidTagCount = 0;
  let maxDepth = 0;

  let i = 0;
  while (i < cleaned.length) {
    const openIdx = cleaned.indexOf('<', i);
    if (openIdx === -1) break;

    // Scan to closing '>' while respecting quotes so '>' inside attributes or unclosed quotes are caught
    let j = openIdx + 1;
    let inQuote: '"' | "'" | null = null;
    let foundClose = false;
    while (j < cleaned.length) {
      const ch = cleaned[j];
      if (inQuote) {
        if (ch === inQuote) inQuote = null;
      } else {
        if (ch === '"' || ch === "'") {
          inQuote = ch;
        } else if (ch === '<') {
          errors.push(
            isEs
              ? `Etiqueta sin cerrar cerca de "${cleaned.slice(openIdx, Math.min(j, openIdx + 24))}".`
              : `Unclosed tag or stray "<" near "${cleaned.slice(openIdx, Math.min(j, openIdx + 24))}".`
          );
          break;
        } else if (ch === '>') {
          foundClose = true;
          break;
        }
      }
      j++;
    }

    if (!foundClose) {
      if (inQuote) {
        errors.push(
          isEs
            ? `Atributo con comilla sin cerrar (${inQuote}) en etiqueta iniciada en posición ${openIdx + 1}.`
            : `Unclosed attribute quote (${inQuote}) in tag starting at character ${openIdx + 1}.`
        );
      } else if (j >= cleaned.length) {
        errors.push(
          isEs
            ? `Etiqueta sin cerrar ">" iniciada en posición ${openIdx + 1}.`
            : `Unclosed tag missing ">" starting at character ${openIdx + 1}.`
        );
      }
      i = j > openIdx ? j : openIdx + 1;
      continue;
    }

    const rawTag = cleaned.slice(openIdx + 1, j).trim();
    i = j + 1;

    if (!rawTag || rawTag.startsWith('!')) {
      continue;
    }

    const isClosing = rawTag.startsWith('/');
    const isSelfClosing = !isClosing && rawTag.endsWith('/');
    const body = (isClosing ? rawTag.slice(1) : isSelfClosing ? rawTag.slice(0, -1) : rawTag).trim();

    const nameMatch = body.match(/^([A-Za-z][A-Za-z0-9:-]*)/);
    if (!nameMatch) {
      errors.push(
        isEs
          ? `Nombre de etiqueta inválido: "<${rawTag}>".`
          : `Invalid tag name in "<${rawTag}>".`
      );
      continue;
    }

    const tagName = nameMatch[1].toLowerCase();
    const restAttrs = body.slice(nameMatch[1].length);

    if (isClosing) {
      if (restAttrs.trim()) {
        errors.push(
          isEs
            ? `La etiqueta de cierre </${tagName}> no debe contener atributos.`
            : `Closing tag </${tagName}> must not contain attributes.`
        );
      }
      if (stack.length === 0) {
        errors.push(
          isEs
            ? `Etiqueta de cierre inesperada </${tagName}> sin etiqueta de apertura.`
            : `Unexpected closing tag </${tagName}> with no matching opening tag.`
        );
      } else {
        const last = stack.pop()!;
        if (last !== tagName) {
          errors.push(
            isEs
              ? `Etiqueta no coincidente: se esperaba </${last}> pero se encontró </${tagName}>.`
              : `Mismatched closing tag: expected </${last}> but found </${tagName}>.`
          );
        }
      }
      continue;
    }

    const attrError = validateAttributes(restAttrs, tagName, isEs);
    if (attrError) {
      errors.push(attrError);
    }

    tagCount++;
    if (isSelfClosing || VOID_TAGS.has(tagName)) {
      voidTagCount++;
    } else {
      stack.push(tagName);
      if (stack.length > maxDepth) {
        maxDepth = stack.length;
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push(
      isEs
        ? `Etiqueta de apertura sin cerrar: <${unclosed}>.`
        : `Unclosed opening tag: <${unclosed}>.`
    );
  }

  return {
    state: errors.length === 0 ? 'ready' : 'error',
    errors,
    tagCount,
    voidTagCount,
    maxDepth
  };
}

export default function HtmlTagValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [input, setInput] = useState<string>(DEFAULT_HTML);

  const result = useMemo(() => validateHtmlSnippet(input, isEs), [input, isEs]);

  const handleClear = () => setInput('');
  const handleReset = () => setInput(DEFAULT_HTML);

  const copySummary =
    result.state === 'ready'
      ? `Valid HTML Tags | Total tags: ${result.tagCount} | Self-closing/Void: ${result.voidTagCount} | Max nesting depth: ${result.maxDepth}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Etiquetas HTML' : 'HTML Tag Validator'}
          subtitle={
            isEs
              ? 'Verifica anidamiento de etiquetas, elementos vacíos y sintaxis de atributos HTML.'
              : 'Checks balanced tag nesting, void elements, and attribute syntax.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Fragmento HTML' : 'HTML Snippet'}
            htmlFor="html-tag-validator-input"
            unit="HTML5"
          >
            <textarea
              id="html-tag-validator-input"
              rows={9}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder={isEs ? 'Pega tu código HTML aquí...' : 'Paste your HTML markup here...'}
              className="ui-input font-mono text-xs leading-relaxed resize-y"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'HTML válido' : 'Valid Nesting',
                onSelect: () => setInput(DEFAULT_HTML)
              },
              {
                label: isEs ? 'Etiqueta sin cerrar' : 'Unclosed Tag',
                onSelect: () => setInput('<section>\n  <p>Missing closing paragraph\n</section>')
              },
              {
                label: isEs ? 'Atributo inválido' : 'Malformed Attribute',
                onSelect: () => setInput('<div class="broken><p =bad>Hello</p></div>')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Diagnóstico HTML' : 'HTML Diagnostics'}
          state={result.state}
          primaryLabel={isEs ? 'Estado del marcado' : 'Markup Status'}
          primaryValue={
            result.state === 'ready'
              ? isEs
                ? 'Etiquetas Balanceadas'
                : 'All Tags Balanced'
              : undefined
          }
          primarySubtext={
            result.state === 'ready'
              ? isEs
                ? `Se validaron ${result.tagCount} etiqueta(s) con una profundidad máxima de ${result.maxDepth}.`
                : `Validated ${result.tagCount} tag(s) with a maximum nesting depth of ${result.maxDepth}.`
              : undefined
          }
          statusLabel={result.state === 'ready' ? 'HTML5' : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa HTML para validar' : 'Enter HTML to validate'}
          emptyDescription={
            isEs
              ? 'Escribe o pega etiquetas HTML en el editor para comprobar su balance.'
              : 'Type or paste HTML markup on the left to inspect tag balance and attributes.'
          }
          errorTitle={
            isEs
              ? `${result.errors.length} error(es) de HTML detectado(s)`
              : `${result.errors.length} HTML Error(s) Detected`
          }
          errorMessage={result.errors.join(' • ')}
        >
          {result.state === 'ready' && (
            <div className="grid grid-cols-3 gap-2.5">
              <ToolMetricTile
                label={isEs ? 'Etiquetas' : 'Tags'}
                value={String(result.tagCount)}
                accent
              />
              <ToolMetricTile
                label={isEs ? 'Vacías / Autocierre' : 'Void / Self-Close'}
                value={String(result.voidTagCount)}
              />
              <ToolMetricTile
                label={isEs ? 'Profundidad' : 'Max Depth'}
                value={String(result.maxDepth)}
              />
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
