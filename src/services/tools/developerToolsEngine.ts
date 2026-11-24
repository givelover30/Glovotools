// Deterministic execution engine for Batch 1: 31 Authorized ToolsWorkspace Utilities
// Strictly scoped to Batch 1 repairs.

export interface SqlFormatResult {
  isValid: boolean;
  formatted: string;
  minified: string;
  statementCount: number;
  keywordCount: number;
  lineCount: number;
  characterReductionPercent: number;
  error: string | null;
}

const SQL_MAJOR_CLAUSES = [
  'SELECT',
  'FROM',
  'WHERE',
  'INNER JOIN',
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'FULL OUTER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'CROSS JOIN',
  'JOIN',
  'ON',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'RETURNING',
];

const SQL_ALL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
  'IS', 'NULL', 'AS', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
  'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'UNION',
  'ALL', 'DISTINCT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
  'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT',
  'INDEX', 'VIEW', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX', 'COALESCE', 'CAST', 'RETURNING', 'WITH', 'OVER', 'PARTITION'
]);

export function formatSqlQuery(
  rawSql: string,
  options: { indentSpaces?: number; uppercaseKeywords?: boolean; mode?: 'pretty' | 'minify' } = {}
): SqlFormatResult {
  const indentSpaces = options.indentSpaces ?? 2;
  const uppercaseKeywords = options.uppercaseKeywords ?? true;
  const trimmed = rawSql.trim();

  if (!trimmed) {
    return {
      isValid: false,
      formatted: '',
      minified: '',
      statementCount: 0,
      keywordCount: 0,
      lineCount: 0,
      characterReductionPercent: 0,
      error: 'SQL input cannot be empty. Provide at least one SQL statement.'
    };
  }

  // Check balanced single quotes and parentheses
  let inSingleQuote = false;
  let parenDepth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "'" && trimmed[i - 1] !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (!inSingleQuote) {
      if (ch === '(') parenDepth++;
      if (ch === ')') parenDepth--;
      if (parenDepth < 0) {
        return {
          isValid: false,
          formatted: '',
          minified: '',
          statementCount: 0,
          keywordCount: 0,
          lineCount: 0,
          characterReductionPercent: 0,
          error: 'Unbalanced closing parenthesis ")" detected in SQL query.'
        };
      }
    }
  }

  if (inSingleQuote) {
    return {
      isValid: false,
      formatted: '',
      minified: '',
      statementCount: 0,
      keywordCount: 0,
      lineCount: 0,
      characterReductionPercent: 0,
      error: 'Unclosed single-quoted string literal detected in SQL query.'
    };
  }

  if (parenDepth !== 0) {
    return {
      isValid: false,
      formatted: '',
      minified: '',
      statementCount: 0,
      keywordCount: 0,
      lineCount: 0,
      characterReductionPercent: 0,
      error: `Unbalanced parentheses: ${parenDepth} unclosed "(" found.`
    };
  }

  // Normalize whitespace outside quotes
  let normalized = '';
  let quote = false;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (c === "'" && trimmed[i - 1] !== '\\') {
      quote = !quote;
      normalized += c;
    } else if (!quote && /\s/.test(c)) {
      if (!normalized.endsWith(' ')) normalized += ' ';
    } else {
      normalized += c;
    }
  }

  // Count SQL keywords and transform case
  const wordTokens = normalized.split(/(\s+|[,();])/);
  let keywordCount = 0;
  const casedTokens = wordTokens.map((tok) => {
    const upper = tok.toUpperCase();
    if (SQL_ALL_KEYWORDS.has(upper)) {
      keywordCount++;
      return uppercaseKeywords ? upper : upper.toLowerCase();
    }
    return tok;
  });

  const casedSql = casedTokens.join('').replace(/\s+/g, ' ').trim();
  const minified = casedSql
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .trim();

  const indent = ' '.repeat(Math.max(1, indentSpaces));
  let formatted = casedSql;

  // Insert newlines before major clauses
  for (const clause of SQL_MAJOR_CLAUSES) {
    const targetClause = uppercaseKeywords ? clause : clause.toLowerCase();
    const regex = new RegExp(`\\b${clause.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${targetClause}`);
  }

  // Break comma-separated lists and AND/OR conditions onto indented lines
  const subAnd = uppercaseKeywords ? 'AND' : 'and';
  const subOr = uppercaseKeywords ? 'OR' : 'or';
  formatted = formatted
    .replace(/,\s*/g, `,\n${indent}`)
    .replace(/\bAND\b/gi, `\n${indent}${subAnd}`)
    .replace(/\bOR\b/gi, `\n${indent}${subOr}`)
    .replace(/;\s*/g, ';\n\n')
    .trim();

  const lines = formatted.split('\n').map((l) => l.trimEnd()).filter((l, idx, arr) => l.length > 0 || (idx > 0 && arr[idx - 1].length > 0));
  const finalFormatted = lines.join('\n');
  const statements = trimmed.split(';').map((s) => s.trim()).filter(Boolean);
  const reduction = rawSql.length > 0
    ? Math.max(0, Math.round(((rawSql.length - minified.length) / rawSql.length) * 1000) / 10)
    : 0;

  return {
    isValid: true,
    formatted: options.mode === 'minify' ? minified : finalFormatted,
    minified,
    statementCount: Math.max(1, statements.length),
    keywordCount,
    lineCount: lines.length,
    characterReductionPercent: reduction,
    error: null
  };
}

// ---------------------------------------------------------------------------
// 2. Live Markdown Previewer & HTML Exporter (markdown-preview-tool)
// ---------------------------------------------------------------------------
export interface MarkdownCompileResult {
  isValid: boolean;
  html: string;
  fullHtmlDocument: string;
  headingCount: number;
  linkCount: number;
  codeBlockCount: number;
  listCount: number;
  wordCount: number;
  error: string | null;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInlineMarkdown(line: string): { html: string; links: number } {
  let links = 0;
  let out = escapeHtml(line);
  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold + italic
  out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    links++;
    const safeUrl = url.replace(/^javascript:/i, '#');
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  return { html: out, links };
}

export function compileMarkdownToHtml(markdown: string): MarkdownCompileResult {
  if (!markdown || !markdown.trim()) {
    return {
      isValid: false,
      html: '',
      fullHtmlDocument: '',
      headingCount: 0,
      linkCount: 0,
      codeBlockCount: 0,
      listCount: 0,
      wordCount: 0,
      error: 'Markdown input is empty. Enter Markdown text to compile and preview.'
    };
  }

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const htmlBlocks: string[] = [];
  let headingCount = 0;
  let linkCount = 0;
  let codeBlockCount = 0;
  let listCount = 0;

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (listType && listItems.length > 0) {
      htmlBlocks.push(`<${listType}>\n${listItems.map((li) => `  <li>${li}</li>`).join('\n')}\n</${listType}>`);
      listCount++;
    }
    listType = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (rawLine.trim().startsWith('```')) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = rawLine.trim().slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        codeBlockCount++;
        const langAttr = codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : '';
        htmlBlocks.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeBlockLang = '';
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      htmlBlocks.push('<hr />');
      continue;
    }

    // Headings #..######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const inline = formatInlineMarkdown(headingMatch[2]);
      linkCount += inline.links;
      headingCount++;
      htmlBlocks.push(`<h${level}>${inline.html}</h${level}>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteContent = trimmed.replace(/^>\s?/, '');
      const inline = formatInlineMarkdown(quoteContent);
      linkCount += inline.links;
      htmlBlocks.push(`<blockquote>${inline.html}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      const inline = formatInlineMarkdown(ulMatch[1]);
      linkCount += inline.links;
      listItems.push(inline.html);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      const inline = formatInlineMarkdown(olMatch[1]);
      linkCount += inline.links;
      listItems.push(inline.html);
      continue;
    }

    flushList();
    const inline = formatInlineMarkdown(trimmed);
    linkCount += inline.links;
    htmlBlocks.push(`<p>${inline.html}</p>`);
  }

  flushList();
  if (inCodeBlock) {
    codeBlockCount++;
    htmlBlocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }

  const html = htmlBlocks.join('\n');
  const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  const fullHtmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Exported Markdown Document</title>
</head>
<body>
${html}
</body>
</html>`;

  return {
    isValid: true,
    html,
    fullHtmlDocument,
    headingCount,
    linkCount,
    codeBlockCount,
    listCount,
    wordCount,
    error: null
  };
}

// ---------------------------------------------------------------------------
// 3. CSS Color Palette Shade & Tint Generator (color-shade-tint-tool)
// ---------------------------------------------------------------------------
export interface ColorSwatch {
  step: number;
  weightLabel: string;
  type: 'tint' | 'base' | 'shade';
  percentage: number;
  hex: string;
  rgb: string;
  contrastWithWhite: number;
  contrastWithBlack: number;
  recommendedText: 'white' | 'black';
}

export interface ColorShadeTintResult {
  isValid: boolean;
  baseHex: string;
  swatches: ColorSwatch[];
  cssVariables: string;
  tailwindJson: string;
  error: string | null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function relativeLuminance(r: number, g: number, b: number): number {
  const sRGB = [r / 255, g / 255, b / 255].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

export function generateColorShadesAndTints(hexInput: string, steps = 5): ColorShadeTintResult {
  let clean = (hexInput || '').trim();
  if (!clean) {
    return {
      isValid: false,
      baseHex: '',
      swatches: [],
      cssVariables: '',
      tailwindJson: '',
      error: 'HEX color code is required (e.g., #10B981).'
    };
  }
  if (!clean.startsWith('#')) clean = '#' + clean;
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
    return {
      isValid: false,
      baseHex: '',
      swatches: [],
      cssVariables: '',
      tailwindJson: '',
      error: 'Invalid HEX color syntax. Provide a 3-digit (#0F8) or 6-digit (#10B981) hexadecimal color.'
    };
  }

  let r = 0, g = 0, b = 0;
  if (clean.length === 4) {
    r = parseInt(clean[1] + clean[1], 16);
    g = parseInt(clean[2] + clean[2], 16);
    b = parseInt(clean[3] + clean[3], 16);
  } else {
    r = parseInt(clean.slice(1, 3), 16);
    g = parseInt(clean.slice(3, 5), 16);
    b = parseInt(clean.slice(5, 7), 16);
  }

  const safeSteps = Math.max(2, Math.min(10, Math.round(steps)));
  const swatches: ColorSwatch[] = [];

  // Tints: mix towards white (255, 255, 255) from highest tint down to base
  for (let i = safeSteps; i >= 1; i--) {
    const factor = i / (safeSteps + 1); // 0..1 towards white
    const tr = Math.round(r + (255 - r) * factor);
    const tg = Math.round(g + (255 - g) * factor);
    const tb = Math.round(b + (255 - b) * factor);
    const hex = rgbToHex(tr, tg, tb);
    const lum = relativeLuminance(tr, tg, tb);
    const cw = Number(((1.05) / (lum + 0.05)).toFixed(2));
    const cb = Number(((lum + 0.05) / 0.05).toFixed(2));
    const weight = Math.round((1 - factor) * 500);
    swatches.push({
      step: swatches.length + 1,
      weightLabel: `${Math.max(50, Math.round(weight / 50) * 50)}`,
      type: 'tint',
      percentage: Math.round(factor * 100),
      hex,
      rgb: `rgb(${tr}, ${tg}, ${tb})`,
      contrastWithWhite: cw,
      contrastWithBlack: cb,
      recommendedText: cb >= cw ? 'black' : 'white'
    });
  }

  // Base color (500)
  const baseHex = rgbToHex(r, g, b);
  const baseLum = relativeLuminance(r, g, b);
  const baseCw = Number(((1.05) / (baseLum + 0.05)).toFixed(2));
  const baseCb = Number(((baseLum + 0.05) / 0.05).toFixed(2));
  swatches.push({
    step: swatches.length + 1,
    weightLabel: '500',
    type: 'base',
    percentage: 0,
    hex: baseHex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    contrastWithWhite: baseCw,
    contrastWithBlack: baseCb,
    recommendedText: baseCb >= baseCw ? 'black' : 'white'
  });

  // Shades: mix towards black (0, 0, 0)
  for (let i = 1; i <= safeSteps; i++) {
    const factor = i / (safeSteps + 1); // 0..1 towards black
    const sr = Math.round(r * (1 - factor));
    const sg = Math.round(g * (1 - factor));
    const sb = Math.round(b * (1 - factor));
    const hex = rgbToHex(sr, sg, sb);
    const lum = relativeLuminance(sr, sg, sb);
    const cw = Number(((1.05) / (lum + 0.05)).toFixed(2));
    const cb = Number(((lum + 0.05) / 0.05).toFixed(2));
    const weight = 500 + Math.round(factor * 450);
    swatches.push({
      step: swatches.length + 1,
      weightLabel: `${Math.min(950, Math.round(weight / 50) * 50)}`,
      type: 'shade',
      percentage: Math.round(factor * 100),
      hex,
      rgb: `rgb(${sr}, ${sg}, ${sb})`,
      contrastWithWhite: cw,
      contrastWithBlack: cb,
      recommendedText: cb >= cw ? 'black' : 'white'
    });
  }

  const cssLines = [':root {'];
  const twObj: Record<string, string> = {};
  swatches.forEach((s, idx) => {
    const key = `${(idx + 1) * 100 - (idx === 0 ? 50 : 0)}`;
    cssLines.push(`  --color-brand-${s.type}-${s.step}: ${s.hex};`);
    twObj[key] = s.hex;
  });
  cssLines.push('}');

  return {
    isValid: true,
    baseHex,
    swatches,
    cssVariables: cssLines.join('\n'),
    tailwindJson: JSON.stringify({ brand: twObj }, null, 2),
    error: null
  };
}

// ---------------------------------------------------------------------------
// 4. SVG Path Data Inspector & Bounding Box Tool (svg-path-inspector)
// ---------------------------------------------------------------------------
export interface SvgCommandToken {
  index: number;
  command: string;
  name: string;
  isRelative: boolean;
  params: number[];
  endX: number;
  endY: number;
}

export interface SvgPathInspectionResult {
  isValid: boolean;
  commands: SvgCommandToken[];
  commandCount: number;
  subpathCount: number;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    viewBox: string;
  };
  estimatedLength: number;
  error: string | null;
}

const SVG_CMD_NAMES: Record<string, string> = {
  M: 'MoveTo',
  L: 'LineTo',
  H: 'Horizontal LineTo',
  V: 'Vertical LineTo',
  C: 'Cubic Bezier Curve',
  S: 'Smooth Cubic Bezier',
  Q: 'Quadratic Bezier Curve',
  T: 'Smooth Quadratic Bezier',
  A: 'Elliptical Arc',
  Z: 'ClosePath',
};

export function inspectSvgPath(pathData: string): SvgPathInspectionResult {
  const trimmed = (pathData || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      commands: [],
      commandCount: 0,
      subpathCount: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, viewBox: '0 0 100 100' },
      estimatedLength: 0,
      error: 'SVG path string cannot be empty. Provide an SVG d="..." attribute value.'
    };
  }

  // Check for illegal characters outside SVG path grammar
  if (/[^MmLlHhVvCcSsQqTtAaZz0-9.,+\-\sEe]/.test(trimmed)) {
    return {
      isValid: false,
      commands: [],
      commandCount: 0,
      subpathCount: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, viewBox: '0 0 100 100' },
      estimatedLength: 0,
      error: 'Invalid SVG path command character detected. Allowed commands: M, L, H, V, C, S, Q, T, A, Z.'
    };
  }

  const segmentRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  const commands: SvgCommandToken[] = [];
  let match: RegExpExecArray | null;

  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let totalLen = 0;
  let subpathCount = 0;

  const trackPoint = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  while ((match = segmentRegex.exec(trimmed)) !== null) {
    const cmd = match[1];
    const upper = cmd.toUpperCase();
    const isRel = cmd !== upper;
    const rawParams = match[2].trim();
    const nums = rawParams
      ? (rawParams.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) || []).map(Number)
      : [];

    const prevX = curX;
    const prevY = curY;

    if (upper === 'M') {
      if (nums.length < 2) {
        return {
          isValid: false,
          commands: [],
          commandCount: 0,
          subpathCount: 0,
          boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, viewBox: '0 0 100 100' },
          estimatedLength: 0,
          error: `MoveTo (${cmd}) command requires at least 2 coordinate numbers (x, y).`
        };
      }
      curX = isRel ? curX + nums[0] : nums[0];
      curY = isRel ? curY + nums[1] : nums[1];
      startX = curX;
      startY = curY;
      subpathCount++;
      trackPoint(curX, curY);
    } else if (upper === 'L' || upper === 'T') {
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const nx = isRel ? curX + nums[i] : nums[i];
        const ny = isRel ? curY + nums[i + 1] : nums[i + 1];
        totalLen += Math.hypot(nx - curX, ny - curY);
        curX = nx;
        curY = ny;
        trackPoint(curX, curY);
      }
    } else if (upper === 'H') {
      for (let i = 0; i < nums.length; i++) {
        const nx = isRel ? curX + nums[i] : nums[i];
        totalLen += Math.abs(nx - curX);
        curX = nx;
        trackPoint(curX, curY);
      }
    } else if (upper === 'V') {
      for (let i = 0; i < nums.length; i++) {
        const ny = isRel ? curY + nums[i] : nums[i];
        totalLen += Math.abs(ny - curY);
        curY = ny;
        trackPoint(curX, curY);
      }
    } else if (upper === 'C') {
      for (let i = 0; i + 5 < nums.length; i += 6) {
        const x1 = isRel ? curX + nums[i] : nums[i];
        const y1 = isRel ? curY + nums[i + 1] : nums[i + 1];
        const x2 = isRel ? curX + nums[i + 2] : nums[i + 2];
        const y2 = isRel ? curY + nums[i + 3] : nums[i + 3];
        const nx = isRel ? curX + nums[i + 4] : nums[i + 4];
        const ny = isRel ? curY + nums[i + 5] : nums[i + 5];
        trackPoint(x1, y1);
        trackPoint(x2, y2);
        trackPoint(nx, ny);
        totalLen += Math.hypot(nx - curX, ny - curY);
        curX = nx;
        curY = ny;
      }
    } else if (upper === 'S' || upper === 'Q') {
      for (let i = 0; i + 3 < nums.length; i += 4) {
        const cx = isRel ? curX + nums[i] : nums[i];
        const cy = isRel ? curY + nums[i + 1] : nums[i + 1];
        const nx = isRel ? curX + nums[i + 2] : nums[i + 2];
        const ny = isRel ? curY + nums[i + 3] : nums[i + 3];
        trackPoint(cx, cy);
        trackPoint(nx, ny);
        totalLen += Math.hypot(nx - curX, ny - curY);
        curX = nx;
        curY = ny;
      }
    } else if (upper === 'A') {
      for (let i = 0; i + 6 < nums.length; i += 7) {
        const nx = isRel ? curX + nums[i + 5] : nums[i + 5];
        const ny = isRel ? curY + nums[i + 6] : nums[i + 6];
        trackPoint(nx, ny);
        totalLen += Math.hypot(nx - curX, ny - curY);
        curX = nx;
        curY = ny;
      }
    } else if (upper === 'Z') {
      totalLen += Math.hypot(startX - curX, startY - curY);
      curX = startX;
      curY = startY;
      trackPoint(curX, curY);
    } else {
      totalLen += Math.hypot(curX - prevX, curY - prevY);
    }

    commands.push({
      index: commands.length + 1,
      command: cmd,
      name: SVG_CMD_NAMES[upper] || 'Path Segment',
      isRelative: isRel,
      params: nums,
      endX: Number(curX.toFixed(2)),
      endY: Number(curY.toFixed(2)),
    });
  }

  if (commands.length === 0) {
    return {
      isValid: false,
      commands: [],
      commandCount: 0,
      subpathCount: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, viewBox: '0 0 100 100' },
      estimatedLength: 0,
      error: 'No valid SVG path commands found. Path must start with M or m.'
    };
  }

  const bMinX = Number.isFinite(minX) ? Number(minX.toFixed(2)) : 0;
  const bMinY = Number.isFinite(minY) ? Number(minY.toFixed(2)) : 0;
  const bMaxX = Number.isFinite(maxX) ? Number(maxX.toFixed(2)) : 0;
  const bMaxY = Number.isFinite(maxY) ? Number(maxY.toFixed(2)) : 0;
  const width = Number(Math.max(0, bMaxX - bMinX).toFixed(2));
  const height = Number(Math.max(0, bMaxY - bMinY).toFixed(2));
  const pad = Math.max(4, Math.round(Math.max(width, height) * 0.1));

  return {
    isValid: true,
    commands,
    commandCount: commands.length,
    subpathCount: Math.max(1, subpathCount),
    boundingBox: {
      minX: bMinX,
      minY: bMinY,
      maxX: bMaxX,
      maxY: bMaxY,
      width,
      height,
      viewBox: `${bMinX - pad} ${bMinY - pad} ${Math.max(10, width + pad * 2)} ${Math.max(10, height + pad * 2)}`
    },
    estimatedLength: Number(totalLen.toFixed(2)),
    error: null
  };
}

// ---------------------------------------------------------------------------
// 5. Advanced Text Readability & Syllable Analyzer (text-statistics-analyzer)
// ---------------------------------------------------------------------------
export interface TextReadabilityResult {
  isValid: boolean;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexWordCount: number;
  characterCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFogIndex: number;
  colemanLiauIndex: number;
  readingLevelLabel: string;
  error: string | null;
}

export function countWordSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const matches = trimmed.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function analyzeTextReadability(text: string): TextReadabilityResult {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      complexWordCount: 0,
      characterCount: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      gunningFogIndex: 0,
      colemanLiauIndex: 0,
      readingLevelLabel: 'N/A',
      error: 'Input text cannot be empty. Provide at least one complete sentence.'
    };
  }

  const rawWords = trimmed.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9'-]/g, '')).filter(Boolean);
  if (rawWords.length === 0) {
    return {
      isValid: false,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      complexWordCount: 0,
      characterCount: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      gunningFogIndex: 0,
      colemanLiauIndex: 0,
      readingLevelLabel: 'N/A',
      error: 'No readable words found in input text.'
    };
  }

  const wordCount = rawWords.length;
  const sentenceSplit = trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const sentenceCount = Math.max(1, sentenceSplit.length);

  let syllableCount = 0;
  let complexWordCount = 0;
  let alphaChars = 0;

  for (const w of rawWords) {
    const syl = countWordSyllables(w);
    syllableCount += syl;
    if (syl >= 3) complexWordCount++;
    alphaChars += w.replace(/[^a-zA-Z0-9]/g, '').length;
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const readingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWordCount / wordCount));
  const L = (alphaChars / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

  let readingLevelLabel = 'College / Professional';
  if (readingEase >= 80) readingLevelLabel = 'Easy (Grade 5–6)';
  else if (readingEase >= 60) readingLevelLabel = 'Standard (Grade 8–9)';
  else if (readingEase >= 50) readingLevelLabel = 'Fairly Difficult (High School)';
  else if (readingEase < 30) readingLevelLabel = 'Academic / Technical Graduate';

  return {
    isValid: true,
    wordCount,
    sentenceCount,
    syllableCount,
    complexWordCount,
    characterCount: alphaChars,
    avgWordsPerSentence: Number(avgWordsPerSentence.toFixed(2)),
    avgSyllablesPerWord: Number(avgSyllablesPerWord.toFixed(2)),
    fleschKincaidGrade: Number(Math.max(0, fkGrade).toFixed(2)),
    fleschReadingEase: Number(Math.max(0, Math.min(100, readingEase)).toFixed(2)),
    gunningFogIndex: Number(Math.max(0, gunningFog).toFixed(2)),
    colemanLiauIndex: Number(Math.max(0, colemanLiau).toFixed(2)),
    readingLevelLabel,
    error: null
  };
}

// ---------------------------------------------------------------------------
// 6. ASCII Art Text Banner & Font Generator (ascii-banner-generator)
// ---------------------------------------------------------------------------
const ASCII_5X5_FONT: Record<string, string[]> = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  F: ['#####', '#    ', '#### ', '#    ', '#    '],
  G: [' ####', '#    ', '#  ##', '#   #', ' ####'],
  H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  J: ['#####', '   # ', '   # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: [' ### ', '#   #', '# # #', '#  ##', ' ####'],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: [' ####', '#    ', ' ### ', '    #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
  V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
  '0': [' ### ', '#  ##', '# # #', '##  #', ' ### '],
  '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '#####'],
  '2': [' ### ', '#   #', '  ## ', ' #   ', '#####'],
  '3': ['#### ', '    #', ' ### ', '    #', '#### '],
  '4': ['#  # ', '#  # ', '#####', '   # ', '   # '],
  '5': ['#####', '#    ', '#### ', '    #', '#### '],
  '6': [' ### ', '#    ', '#### ', '#   #', ' ### '],
  '7': ['#####', '    #', '   # ', '  #  ', '  #  '],
  '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '],
  '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
  '-': ['     ', '     ', '#####', '     ', '     '],
  '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '],
  ' ': ['   ', '   ', '   ', '   ', '   '],
};

export interface AsciiBannerResult {
  isValid: boolean;
  banner: string;
  width: number;
  height: number;
  renderedCharCount: number;
  error: string | null;
}

export function generateAsciiBanner(
  text: string,
  style: 'block' | 'hash' | 'dots' | ' framed' = 'block'
): AsciiBannerResult {
  const clean = (text || '').trim();
  if (!clean) {
    return {
      isValid: false,
      banner: '',
      width: 0,
      height: 0,
      renderedCharCount: 0,
      error: 'Banner text cannot be empty. Enter up to 24 characters.'
    };
  }

  const clipped = clean.slice(0, 24).toUpperCase();
  const glyphChar = style === 'block' ? '█' : style === 'dots' ? '●' : '#';
  const rows = ['', '', '', '', ''];

  for (const ch of clipped) {
    const glyph = ASCII_5X5_FONT[ch] || ASCII_5X5_FONT['-'];
    for (let r = 0; r < 5; r++) {
      const transformed = glyph[r].replace(/#/g, glyphChar);
      rows[r] += (rows[r].length > 0 ? '  ' : '') + transformed;
    }
  }

  let finalLines = rows;
  if (style === ' framed') {
    const innerWidth = rows[0].length;
    const topBorder = '+' + '-'.repeat(innerWidth + 2) + '+';
    finalLines = [
      topBorder,
      ...rows.map((r) => `| ${r} |`),
      topBorder
    ];
  }

  return {
    isValid: true,
    banner: finalLines.join('\n'),
    width: finalLines[0]?.length || 0,
    height: finalLines.length,
    renderedCharCount: clipped.length,
    error: null
  };
}

// ---------------------------------------------------------------------------
// 7–31. Advanced Web Performance & Technical SEO Suite (25 Tools)
// ---------------------------------------------------------------------------
export interface AdvWebToolField {
  key: string;
  label: string;
  unit?: string;
  type: 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string;
}

export interface AdvWebMetricOutput {
  label: string;
  value: string;
  sublabel?: string;
  status?: 'good' | 'warn' | 'bad' | 'neutral';
}

export interface AdvWebToolExecutionResult {
  isValid: boolean;
  primaryLabel: string;
  primaryValue: string;
  statusBadge: string;
  statusTone: 'good' | 'warn' | 'bad';
  metrics: AdvWebMetricOutput[];
  formulaUsed: string;
  recommendation: string;
  error: string | null;
}

export interface AdvWebToolSpec {
  id: string;
  title: string;
  subtitle: string;
  formula: string;
  fields: AdvWebToolField[];
  compute: (values: Record<string, number | string>) => AdvWebToolExecutionResult;
}

function requireNonNegative(values: Record<string, number | string>, keys: Array<{ key: string; label: string; allowZero?: boolean }>): string | null {
  for (const item of keys) {
    const raw = Number(values[item.key]);
    if (!Number.isFinite(raw)) {
      return `${item.label} must be a valid finite number.`;
    }
    if (item.allowZero === false && raw <= 0) {
      return `${item.label} must be greater than 0.`;
    }
    if (raw < 0) {
      return `${item.label} cannot be negative.`;
    }
  }
  return null;
}

export const ADV_WEB_TOOL_SPECS: Record<string, AdvWebToolSpec> = {
  'adv-web-core-web-vitals-inp-budget': {
    id: 'adv-web-core-web-vitals-inp-budget',
    title: 'Core Web Vitals Interaction to Next Paint (INP) JavaScript Budget',
    subtitle: 'Calculate total INP latency across Input Delay, Processing Duration, and Presentation Delay against Google 200ms threshold',
    formula: 'INP = Input Delay + Processing Duration + Presentation Delay',
    fields: [
      { key: 'inputDelay', label: 'Input Delay (Main-Thread Blocking)', unit: 'ms', type: 'number', min: 0, max: 5000, step: 5, defaultValue: 35 },
      { key: 'processingTime', label: 'Event Handler Processing Duration', unit: 'ms', type: 'number', min: 0, max: 5000, step: 5, defaultValue: 95 },
      { key: 'presentationDelay', label: 'Presentation & Style/Layout Delay', unit: 'ms', type: 'number', min: 0, max: 5000, step: 5, defaultValue: 40 },
      { key: 'targetBudget', label: 'Target CWV Good INP Threshold', unit: 'ms', type: 'number', min: 50, max: 1000, step: 10, defaultValue: 200 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'inputDelay', label: 'Input Delay' },
        { key: 'processingTime', label: 'Processing Duration' },
        { key: 'presentationDelay', label: 'Presentation Delay' },
        { key: 'targetBudget', label: 'Target Budget', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const inputDelay = Number(v.inputDelay);
      const proc = Number(v.processingTime);
      const pres = Number(v.presentationDelay);
      const budget = Number(v.targetBudget);
      const totalInp = inputDelay + proc + pres;
      const remaining = budget - totalInp;
      const tone = totalInp <= 200 ? 'good' : totalInp <= 500 ? 'warn' : 'bad';
      const badge = totalInp <= 200 ? 'GOOD (≤ 200ms)' : totalInp <= 500 ? 'NEEDS IMPROVEMENT (201–500ms)' : 'POOR (> 500ms)';

      return {
        isValid: true,
        primaryLabel: 'Total Interaction to Next Paint (INP)',
        primaryValue: `${totalInp.toFixed(1)} ms`,
        statusBadge: badge,
        statusTone: tone,
        metrics: [
          { label: 'Remaining JS Execution Budget', value: `${remaining >= 0 ? '+' : ''}${remaining.toFixed(1)} ms`, sublabel: `vs ${budget}ms threshold`, status: remaining >= 0 ? 'good' : 'bad' },
          { label: 'Input Delay Share', value: `${totalInp > 0 ? ((inputDelay / totalInp) * 100).toFixed(1) : '0.0'}%`, sublabel: `${inputDelay} ms` },
          { label: 'Event Handler Share', value: `${totalInp > 0 ? ((proc / totalInp) * 100).toFixed(1) : '0.0'}%`, sublabel: `${proc} ms` },
          { label: 'Presentation Delay Share', value: `${totalInp > 0 ? ((pres / totalInp) * 100).toFixed(1) : '0.0'}%`, sublabel: `${pres} ms` },
        ],
        formulaUsed: `INP = ${inputDelay}ms + ${proc}ms + ${pres}ms = ${totalInp.toFixed(1)}ms`,
        recommendation: totalInp <= 200
          ? 'INP meets Google Core Web Vitals Good threshold. Maintain task yielding via scheduler.yield() or requestAnimationFrame.'
          : 'Break up long main-thread tasks (>50ms), defer non-critical third-party scripts, and reduce DOM size to lower presentation delay.',
        error: null
      };
    }
  },

  'adv-web-seo-organic-ranking-cannibalization-model': {
    id: 'adv-web-seo-organic-ranking-cannibalization-model',
    title: 'SEO Keyword Cannibalization & Traffic Loss Impact Estimator',
    subtitle: 'Quantify lost organic clicks and revenue when multiple internal URLs split authority and rank lower than a consolidated canonical page',
    formula: 'Traffic Loss = Baseline Projected Organic Clicks - Split Traffic Across Conflicting URLs',
    fields: [
      { key: 'searchVolume', label: 'Monthly Keyword Search Volume', unit: 'searches', type: 'number', min: 1, max: 10000000, step: 100, defaultValue: 25000 },
      { key: 'consolidatedCtr', label: 'Projected Consolidated Canonical CTR', unit: '%', type: 'number', min: 0.1, max: 100, step: 0.5, defaultValue: 18.5 },
      { key: 'url1Ctr', label: 'Competing URL #1 Actual CTR', unit: '%', type: 'number', min: 0, max: 100, step: 0.5, defaultValue: 6.2 },
      { key: 'url2Ctr', label: 'Competing URL #2 Actual CTR', unit: '%', type: 'number', min: 0, max: 100, step: 0.5, defaultValue: 4.1 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'searchVolume', label: 'Monthly Search Volume', allowZero: false },
        { key: 'consolidatedCtr', label: 'Consolidated CTR', allowZero: false },
        { key: 'url1Ctr', label: 'Competing URL #1 CTR' },
        { key: 'url2Ctr', label: 'Competing URL #2 CTR' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const vol = Number(v.searchVolume);
      const targetCtr = Number(v.consolidatedCtr) / 100;
      const c1 = Number(v.url1Ctr) / 100;
      const c2 = Number(v.url2Ctr) / 100;

      const baselineClicks = Math.round(vol * targetCtr);
      const splitClicks = Math.round(vol * (c1 + c2));
      const trafficLoss = baselineClicks - splitClicks;
      const lossPct = baselineClicks > 0 ? (trafficLoss / baselineClicks) * 100 : 0;

      return {
        isValid: true,
        primaryLabel: 'Monthly Organic Clicks Lost to Cannibalization',
        primaryValue: `${trafficLoss.toLocaleString()} clicks/mo`,
        statusBadge: trafficLoss > 0 ? `${lossPct.toFixed(1)}% TRAFFIC DILUTION` : 'NO CANNIBALIZATION LOSS',
        statusTone: trafficLoss > 500 ? 'bad' : trafficLoss > 0 ? 'warn' : 'good',
        metrics: [
          { label: 'Consolidated Potential Clicks', value: `${baselineClicks.toLocaleString()}/mo`, sublabel: `at ${(targetCtr * 100).toFixed(1)}% CTR` },
          { label: 'Combined Split URLs Clicks', value: `${splitClicks.toLocaleString()}/mo`, sublabel: `at ${((c1 + c2) * 100).toFixed(1)}% combined CTR` },
          { label: 'Annualized Traffic Opportunity Loss', value: `${(trafficLoss * 12).toLocaleString()} clicks/yr` },
          { label: 'Click Recovery Potential', value: `${splitClicks > 0 ? ((baselineClicks / splitClicks - 1) * 100).toFixed(1) : '100.0'}% uplift` },
        ],
        formulaUsed: `Loss = ${baselineClicks} - ${splitClicks} = ${trafficLoss} clicks/mo`,
        recommendation: 'Consolidate competing articles into one authoritative page and implement a 301 permanent redirect from the secondary URL.',
        error: null
      };
    }
  },

  'adv-web-cdn-edge-cache-hit-ratio-bandwidth-savings': {
    id: 'adv-web-cdn-edge-cache-hit-ratio-bandwidth-savings',
    title: 'CDN Edge Cache Hit Ratio & Origin Bandwidth Offload Calculator',
    subtitle: 'Calculate origin egress bandwidth reduction and monthly cloud egress cost savings from CDN edge caching',
    formula: 'Origin Bandwidth Cost = Total Monthly Traffic * (1 - Cache Hit Ratio) * Unit Price',
    fields: [
      { key: 'totalTrafficGb', label: 'Total Monthly Bandwidth Traffic', unit: 'GB', type: 'number', min: 1, max: 10000000, step: 100, defaultValue: 15000 },
      { key: 'cacheHitRatio', label: 'CDN Edge Cache Hit Ratio (CHR)', unit: '%', type: 'number', min: 0, max: 100, step: 0.5, defaultValue: 88 },
      { key: 'originCostPerGb', label: 'Origin Egress Unit Cost', unit: '$/GB', type: 'number', min: 0.001, max: 5, step: 0.01, defaultValue: 0.085 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'totalTrafficGb', label: 'Total Monthly Traffic', allowZero: false },
        { key: 'cacheHitRatio', label: 'Cache Hit Ratio' },
        { key: 'originCostPerGb', label: 'Origin Unit Price', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };
      if (Number(v.cacheHitRatio) > 100) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Cache Hit Ratio cannot exceed 100%.' };
      }

      const totalGb = Number(v.totalTrafficGb);
      const chr = Number(v.cacheHitRatio) / 100;
      const unitPrice = Number(v.originCostPerGb);

      const originTrafficGb = totalGb * (1 - chr);
      const edgeOffloadedGb = totalGb * chr;
      const uncachedCost = totalGb * unitPrice;
      const originCost = originTrafficGb * unitPrice;
      const monthlySavings = uncachedCost - originCost;

      return {
        isValid: true,
        primaryLabel: 'Monthly Origin Egress Cost (After CDN Offload)',
        primaryValue: `$${originCost.toFixed(2)}/mo`,
        statusBadge: `${(chr * 100).toFixed(1)}% EDGE OFFLOAD`,
        statusTone: chr >= 0.85 ? 'good' : chr >= 0.65 ? 'warn' : 'bad',
        metrics: [
          { label: 'Monthly Egress Cost Saved', value: `$${monthlySavings.toFixed(2)}/mo`, sublabel: `vs $${uncachedCost.toFixed(2)} uncached`, status: 'good' },
          { label: 'Annual Egress Cost Savings', value: `$${(monthlySavings * 12).toFixed(2)}/yr` },
          { label: 'Edge Offloaded Bandwidth', value: `${edgeOffloadedGb.toFixed(1)} GB` },
          { label: 'Residual Origin Egress Traffic', value: `${originTrafficGb.toFixed(1)} GB` },
        ],
        formulaUsed: `Origin Cost = ${totalGb} GB × (1 - ${chr.toFixed(3)}) × $${unitPrice}/GB = $${originCost.toFixed(2)}`,
        recommendation: 'Normalize query strings, enable Origin Shield / Tiered Caching, and set immutable Cache-Control headers on versioned assets.',
        error: null
      };
    }
  },

  'adv-web-image-compression-webp-avif-savings': {
    id: 'adv-web-image-compression-webp-avif-savings',
    title: 'Next-Gen Image Compression (WebP/AVIF) File Size & LCP Savings',
    subtitle: 'Calculate hero image payload reduction and Largest Contentful Paint (LCP) download time improvement on mobile/desktop networks',
    formula: 'LCP Improvement = (Original Image Download Time - Compressed Download Time)',
    fields: [
      { key: 'originalKb', label: 'Original JPEG/PNG Image Size', unit: 'KB', type: 'number', min: 1, max: 50000, step: 10, defaultValue: 850 },
      { key: 'compressedKb', label: 'Compressed WebP/AVIF Image Size', unit: 'KB', type: 'number', min: 1, max: 50000, step: 10, defaultValue: 210 },
      { key: 'bandwidthMbps', label: 'Client Effective Network Bandwidth', unit: 'Mbps', type: 'number', min: 0.5, max: 1000, step: 1, defaultValue: 10 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'originalKb', label: 'Original Image Size', allowZero: false },
        { key: 'compressedKb', label: 'Compressed Image Size', allowZero: false },
        { key: 'bandwidthMbps', label: 'Client Bandwidth', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const origKb = Number(v.originalKb);
      const compKb = Number(v.compressedKb);
      const mbps = Number(v.bandwidthMbps);

      const origTimeMs = ((origKb * 8) / (mbps * 1000)) * 1000;
      const compTimeMs = ((compKb * 8) / (mbps * 1000)) * 1000;
      const lcpSavedMs = origTimeMs - compTimeMs;
      const sizeSavedPct = ((origKb - compKb) / origKb) * 100;

      return {
        isValid: true,
        primaryLabel: 'LCP Image Download Time Saved',
        primaryValue: `${lcpSavedMs.toFixed(1)} ms`,
        statusBadge: `${sizeSavedPct.toFixed(1)}% PAYLOAD REDUCTION`,
        statusTone: lcpSavedMs >= 200 ? 'good' : lcpSavedMs > 0 ? 'warn' : 'bad',
        metrics: [
          { label: 'Original Image Fetch Duration', value: `${origTimeMs.toFixed(1)} ms`, sublabel: `${origKb} KB @ ${mbps} Mbps` },
          { label: 'WebP/AVIF Fetch Duration', value: `${compTimeMs.toFixed(1)} ms`, sublabel: `${compKb} KB @ ${mbps} Mbps`, status: 'good' },
          { label: 'Bytes Saved Per Page View', value: `${(origKb - compKb).toFixed(1)} KB` },
          { label: 'Bandwidth Saved per 100k Views', value: `${(((origKb - compKb) * 100000) / (1024 * 1024)).toFixed(2)} GB` },
        ],
        formulaUsed: `LCP Improvement = ${origTimeMs.toFixed(1)}ms - ${compTimeMs.toFixed(1)}ms = ${lcpSavedMs.toFixed(1)}ms`,
        recommendation: 'Serve AVIF/WebP via <picture> with responsive srcset and add fetchpriority="high" to the LCP hero image.',
        error: null
      };
    }
  },

  'adv-web-javascript-bundle-treeshaking-gzipped-size': {
    id: 'adv-web-javascript-bundle-treeshaking-gzipped-size',
    title: 'JavaScript Bundle Size, Tree-Shaking & Gzip/Brotli Compression',
    subtitle: 'Calculate tree-shaken bundle weight, Brotli wire transfer size, and mobile CPU parse/compile blocking latency',
    formula: 'Parse Time (ms) = Uncompressed JS Size (KB) * Mobile CPU Factor (approx 1.5ms/KB)',
    fields: [
      { key: 'rawBundleKb', label: 'Unoptimized Raw JS Bundle Size', unit: 'KB', type: 'number', min: 1, max: 50000, step: 10, defaultValue: 640 },
      { key: 'treeShakeReductionPct', label: 'Tree-Shaking Dead Code Elimination', unit: '%', type: 'number', min: 0, max: 95, step: 1, defaultValue: 28 },
      { key: 'brotliCompressionPct', label: 'Brotli / Gzip Wire Compression Ratio', unit: '%', type: 'number', min: 0, max: 95, step: 1, defaultValue: 72 },
      { key: 'cpuFactorMsPerKb', label: 'Mobile CPU Parse Factor', unit: 'ms/KB', type: 'number', min: 0.1, max: 10, step: 0.1, defaultValue: 1.5 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'rawBundleKb', label: 'Raw JS Bundle Size', allowZero: false },
        { key: 'treeShakeReductionPct', label: 'Tree-Shaking %' },
        { key: 'brotliCompressionPct', label: 'Compression %' },
        { key: 'cpuFactorMsPerKb', label: 'Mobile CPU Factor', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const rawKb = Number(v.rawBundleKb);
      const shakePct = Math.min(99, Number(v.treeShakeReductionPct)) / 100;
      const compPct = Math.min(99, Number(v.brotliCompressionPct)) / 100;
      const cpuFactor = Number(v.cpuFactorMsPerKb);

      const treeShakenKb = rawKb * (1 - shakePct);
      const wireKb = treeShakenKb * (1 - compPct);
      const rawParseMs = rawKb * cpuFactor;
      const optimizedParseMs = treeShakenKb * cpuFactor;

      return {
        isValid: true,
        primaryLabel: 'Mobile JS Parse & Compile Time (After Tree-Shaking)',
        primaryValue: `${optimizedParseMs.toFixed(1)} ms`,
        statusBadge: `WIRE SIZE: ${wireKb.toFixed(1)} KB`,
        statusTone: optimizedParseMs <= 300 ? 'good' : optimizedParseMs <= 600 ? 'warn' : 'bad',
        metrics: [
          { label: 'Uncompressed Tree-Shaken Size', value: `${treeShakenKb.toFixed(1)} KB`, sublabel: `Down from ${rawKb} KB` },
          { label: 'Brotli/Gzip Transfer Size', value: `${wireKb.toFixed(1)} KB`, status: 'good' },
          { label: 'Main-Thread Parse Time Saved', value: `${(rawParseMs - optimizedParseMs).toFixed(1)} ms`, sublabel: `vs ${rawParseMs.toFixed(1)} ms raw` },
          { label: 'Total Wire Payload Reduction', value: `${((1 - wireKb / rawKb) * 100).toFixed(1)}%` },
        ],
        formulaUsed: `Parse Time = ${treeShakenKb.toFixed(1)} KB × ${cpuFactor} ms/KB = ${optimizedParseMs.toFixed(1)} ms`,
        recommendation: 'Note that Gzip/Brotli reduces network transfer time, but the browser still parses the full uncompressed tree-shaken AST.',
        error: null
      };
    }
  },

  'adv-web-structured-data-json-ld-rich-snippet-ctr': {
    id: 'adv-web-structured-data-json-ld-rich-snippet-ctr',
    title: 'Schema.org Structured Data (JSON-LD) Rich Snippet CTR Lift Estimator',
    subtitle: 'Forecast incremental organic clicks from FAQ, Product, Review, and Recipe Schema.org JSON-LD rich results',
    formula: 'Lifted Clicks = Total Impressions * (Enhanced CTR - Standard SERP CTR)',
    fields: [
      { key: 'impressions', label: 'Monthly SERP Impressions', unit: 'impressions', type: 'number', min: 10, max: 100000000, step: 1000, defaultValue: 120000 },
      { key: 'standardCtr', label: 'Baseline Standard Blue-Link CTR', unit: '%', type: 'number', min: 0.1, max: 100, step: 0.1, defaultValue: 3.8 },
      { key: 'enhancedCtr', label: 'Enhanced Rich Snippet CTR', unit: '%', type: 'number', min: 0.1, max: 100, step: 0.1, defaultValue: 5.4 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'impressions', label: 'Monthly Impressions', allowZero: false },
        { key: 'standardCtr', label: 'Standard SERP CTR', allowZero: false },
        { key: 'enhancedCtr', label: 'Enhanced Rich Snippet CTR', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const imp = Number(v.impressions);
      const baseCtr = Number(v.standardCtr) / 100;
      const richCtr = Number(v.enhancedCtr) / 100;
      const baseClicks = Math.round(imp * baseCtr);
      const richClicks = Math.round(imp * richCtr);
      const liftedClicks = richClicks - baseClicks;
      const relativeLiftPct = baseCtr > 0 ? ((richCtr - baseCtr) / baseCtr) * 100 : 0;

      return {
        isValid: true,
        primaryLabel: 'Incremental Monthly Clicks from JSON-LD Rich Results',
        primaryValue: `${liftedClicks >= 0 ? '+' : ''}${liftedClicks.toLocaleString()} clicks/mo`,
        statusBadge: `${relativeLiftPct >= 0 ? '+' : ''}${relativeLiftPct.toFixed(1)}% RELATIVE CTR LIFT`,
        statusTone: liftedClicks > 0 ? 'good' : 'warn',
        metrics: [
          { label: 'Baseline Monthly Clicks', value: `${baseClicks.toLocaleString()}` },
          { label: 'Enhanced Rich Result Clicks', value: `${richClicks.toLocaleString()}`, status: 'good' },
          { label: 'Annual Incremental Organic Visits', value: `${(liftedClicks * 12).toLocaleString()} visits/yr` },
          { label: 'Absolute CTR Delta', value: `${(richCtr * 100 - baseCtr * 100).toFixed(2)} pts` },
        ],
        formulaUsed: `Lifted Clicks = ${imp.toLocaleString()} × (${(richCtr * 100).toFixed(2)}% - ${(baseCtr * 100).toFixed(2)}%) = ${liftedClicks.toLocaleString()}`,
        recommendation: 'Validate JSON-LD schemas against Google Rich Results Test and include aggregateRating, offers, and breadcrumb markup.',
        error: null
      };
    }
  },

  'adv-web-critical-css-inline-render-blocking-elimination': {
    id: 'adv-web-critical-css-inline-render-blocking-elimination',
    title: 'Critical CSS Inlining & Render-Blocking Resource Elimination',
    subtitle: 'Calculate First Contentful Paint (FCP) latency savings by inlining critical above-the-fold CSS within the initial 14KB TCP window',
    formula: 'FCP Time Saved = Network Round-Trips for Stylesheet Fetch + CSS Parsing Time',
    fields: [
      { key: 'blockingCssRtts', label: 'Blocking Stylesheet Network Round-Trips', unit: 'RTTs', type: 'number', min: 1, max: 10, step: 1, defaultValue: 2 },
      { key: 'rttLatencyMs', label: 'Network Round-Trip Time (RTT)', unit: 'ms', type: 'number', min: 5, max: 1000, step: 5, defaultValue: 75 },
      { key: 'fullCssParseMs', label: 'External Stylesheet Transfer & Parse Time', unit: 'ms', type: 'number', min: 5, max: 2000, step: 5, defaultValue: 110 },
      { key: 'inlineCriticalKb', label: 'Inlined Critical CSS Payload Size', unit: 'KB', type: 'number', min: 0.5, max: 100, step: 0.5, defaultValue: 8.5 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'blockingCssRtts', label: 'Network Round-Trips', allowZero: false },
        { key: 'rttLatencyMs', label: 'RTT Latency', allowZero: false },
        { key: 'fullCssParseMs', label: 'CSS Parse Time', allowZero: false },
        { key: 'inlineCriticalKb', label: 'Inlined Critical CSS Size', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const rtts = Number(v.blockingCssRtts);
      const rttMs = Number(v.rttLatencyMs);
      const parseMs = Number(v.fullCssParseMs);
      const inlineKb = Number(v.inlineCriticalKb);

      const fcpSavedMs = rtts * rttMs + parseMs;
      const fitsTcpInitialWindow = inlineKb <= 14;

      return {
        isValid: true,
        primaryLabel: 'Estimated First Contentful Paint (FCP) Time Saved',
        primaryValue: `${fcpSavedMs.toFixed(0)} ms`,
        statusBadge: fitsTcpInitialWindow ? 'FITS 14KB TCP INITIAL WINDOW' : 'EXCEEDS 14KB TCP INITIAL WINDOW',
        statusTone: fitsTcpInitialWindow ? 'good' : 'warn',
        metrics: [
          { label: 'Network RTT Blocking Eliminated', value: `${(rtts * rttMs).toFixed(0)} ms`, sublabel: `${rtts} RTT × ${rttMs} ms` },
          { label: 'Deferred CSS Transfer/Parse Saved', value: `${parseMs.toFixed(0)} ms` },
          { label: 'Inlined Critical CSS Weight', value: `${inlineKb.toFixed(1)} KB`, status: fitsTcpInitialWindow ? 'good' : 'warn' },
          { label: '14KB First-Roundtrip Margin', value: `${(14 - inlineKb).toFixed(1)} KB` },
        ],
        formulaUsed: `FCP Time Saved = (${rtts} × ${rttMs}ms) + ${parseMs}ms = ${fcpSavedMs.toFixed(0)}ms`,
        recommendation: 'Keep inlined critical CSS under 10–12 KB so HTML + Critical CSS fit inside the first 14.6 KB TCP slow-start window.',
        error: null
      };
    }
  },

  'adv-web-dns-prefetch-preconnect-tcp-handshake-latency': {
    id: 'adv-web-dns-prefetch-preconnect-tcp-handshake-latency',
    title: 'DNS Prefetch, Preconnect & Early Hints Latency Savings Calculator',
    subtitle: 'Calculate critical-path connection setup latency eliminated by <link rel="preconnect"> and <link rel="dns-prefetch">',
    formula: 'Time Saved = DNS Lookup (ms) + TCP RTT (ms) + TLS Handshake (ms)',
    fields: [
      { key: 'dnsLookupMs', label: 'DNS Resolution Latency', unit: 'ms', type: 'number', min: 0, max: 1000, step: 5, defaultValue: 45 },
      { key: 'tcpHandshakeMs', label: 'TCP 3-Way Handshake RTT', unit: 'ms', type: 'number', min: 0, max: 1000, step: 5, defaultValue: 65 },
      { key: 'tlsHandshakeMs', label: 'TLS 1.3 / 1.2 Negotiation Time', unit: 'ms', type: 'number', min: 0, max: 1000, step: 5, defaultValue: 85 },
      { key: 'criticalOrigins', label: 'Number of Critical Third-Party Origins', unit: 'origins', type: 'number', min: 1, max: 10, step: 1, defaultValue: 2 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'dnsLookupMs', label: 'DNS Lookup Latency' },
        { key: 'tcpHandshakeMs', label: 'TCP Handshake RTT' },
        { key: 'tlsHandshakeMs', label: 'TLS Negotiation Time' },
        { key: 'criticalOrigins', label: 'Critical Origins', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const dns = Number(v.dnsLookupMs);
      const tcp = Number(v.tcpHandshakeMs);
      const tls = Number(v.tlsHandshakeMs);
      const origins = Number(v.criticalOrigins);
      const perOriginSaved = dns + tcp + tls;

      return {
        isValid: true,
        primaryLabel: 'Latency Saved Per Preconnected Origin',
        primaryValue: `${perOriginSaved.toFixed(0)} ms`,
        statusBadge: origins <= 4 ? 'OPTIMAL PRECONNECT COUNT' : 'HIGH SOCKET CONTENTION (>4)',
        statusTone: origins <= 4 ? 'good' : 'warn',
        metrics: [
          { label: 'rel="preconnect" Savings / Origin', value: `${perOriginSaved.toFixed(0)} ms`, sublabel: 'DNS + TCP + TLS', status: 'good' },
          { label: 'rel="dns-prefetch" Savings / Origin', value: `${dns.toFixed(0)} ms`, sublabel: 'DNS lookup only' },
          { label: 'Cumulative Serial Origin Savings', value: `${(perOriginSaved * origins).toFixed(0)} ms`, sublabel: `across ${origins} origins` },
          { label: 'TLS + TCP Share', value: `${perOriginSaved > 0 ? (((tcp + tls) / perOriginSaved) * 100).toFixed(1) : '0.0'}%` },
        ],
        formulaUsed: `Time Saved = ${dns}ms + ${tcp}ms + ${tls}ms = ${perOriginSaved.toFixed(0)}ms`,
        recommendation: 'Use rel="preconnect" for up to 2–4 critical origins (CDN, web fonts) and rel="dns-prefetch" as a lower-overhead fallback.',
        error: null
      };
    }
  },

  'adv-web-font-display-swap-cls-layout-shift': {
    id: 'adv-web-font-display-swap-cls-layout-shift',
    title: 'Web Font Display Swap (FOUT vs FOIT) Cumulative Layout Shift (CLS)',
    subtitle: 'Calculate Cumulative Layout Shift (CLS) caused by webfont reflow and verify compliance against the 0.10 Core Web Vitals threshold',
    formula: 'CLS Score = Impact Fraction * Distance Fraction (Target < 0.1)',
    fields: [
      { key: 'impactFraction', label: 'Viewport Impact Fraction (0.00 – 1.00)', unit: 'ratio', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.45 },
      { key: 'distanceFraction', label: 'Viewport Distance Fraction (0.00 – 1.00)', unit: 'ratio', type: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.14 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'impactFraction', label: 'Impact Fraction' },
        { key: 'distanceFraction', label: 'Distance Fraction' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };
      const imp = Number(v.impactFraction);
      const dist = Number(v.distanceFraction);
      if (imp > 1 || dist > 1) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Impact Fraction and Distance Fraction must be between 0.00 and 1.00.' };
      }

      const cls = imp * dist;
      const tone = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'warn' : 'bad';
      const badge = cls <= 0.1 ? 'GOOD (CLS ≤ 0.10)' : cls <= 0.25 ? 'NEEDS IMPROVEMENT (0.10–0.25)' : 'POOR (CLS > 0.25)';

      return {
        isValid: true,
        primaryLabel: 'Calculated Font Reflow CLS Score',
        primaryValue: cls.toFixed(4),
        statusBadge: badge,
        statusTone: tone,
        metrics: [
          { label: 'Remaining CWV Good CLS Budget', value: `${(0.1 - cls).toFixed(4)}`, status: cls <= 0.1 ? 'good' : 'bad' },
          { label: 'Viewport Area Shifted', value: `${(imp * 100).toFixed(1)}%` },
          { label: 'Max Element Shift Distance', value: `${(dist * 100).toFixed(1)}% of viewport` },
          { label: 'CWV Threshold Compliance', value: cls <= 0.1 ? 'Pass' : 'Fail' },
        ],
        formulaUsed: `CLS = ${imp} × ${dist} = ${cls.toFixed(4)}`,
        recommendation: 'Pair font-display: swap with CSS size-adjust, ascent-override, and descent-override on fallback @font-face declarations.',
        error: null
      };
    }
  },

  'adv-web-crawl-budget-log-file-analyzer-indexation': {
    id: 'adv-web-crawl-budget-log-file-analyzer-indexation',
    title: 'Search Engine Crawl Budget & Log File Indexation Efficiency',
    subtitle: 'Analyze Googlebot log file crawl efficiency and indexation ratio across discovered URLs',
    formula: 'Indexation Ratio = Indexed Pages / Total Discovered URLs in Log Files * 100%',
    fields: [
      { key: 'indexedPages', label: 'Valid Indexed Canonical Pages', unit: 'URLs', type: 'number', min: 0, max: 100000000, step: 100, defaultValue: 18500 },
      { key: 'discoveredUrls', label: 'Total Discovered URLs in Server Logs', unit: 'URLs', type: 'number', min: 1, max: 100000000, step: 100, defaultValue: 26000 },
      { key: 'dailyBotRequests', label: 'Daily Search Bot Crawl Requests', unit: 'requests/day', type: 'number', min: 1, max: 100000000, step: 100, defaultValue: 45000 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'indexedPages', label: 'Indexed Pages' },
        { key: 'discoveredUrls', label: 'Total Discovered URLs', allowZero: false },
        { key: 'dailyBotRequests', label: 'Daily Bot Requests', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const indexed = Number(v.indexedPages);
      const discovered = Number(v.discoveredUrls);
      const dailyReqs = Number(v.dailyBotRequests);
      if (indexed > discovered) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Indexed Pages cannot exceed Total Discovered URLs.' };
      }

      const ratioPct = (indexed / discovered) * 100;
      const unindexedWaste = discovered - indexed;
      const crawlsPerIndexedPage = indexed > 0 ? dailyReqs / indexed : 0;

      return {
        isValid: true,
        primaryLabel: 'Search Engine Crawl Indexation Efficiency',
        primaryValue: `${ratioPct.toFixed(2)}%`,
        statusBadge: ratioPct >= 80 ? 'HIGH CRAWL EFFICIENCY' : ratioPct >= 50 ? 'MODERATE CRAWL WASTE' : 'SEVERE CRAWL BLOAT',
        statusTone: ratioPct >= 80 ? 'good' : ratioPct >= 50 ? 'warn' : 'bad',
        metrics: [
          { label: 'Unindexed / Crawl-Waste URLs', value: `${unindexedWaste.toLocaleString()} URLs`, status: unindexedWaste === 0 ? 'good' : 'warn' },
          { label: 'Crawl Waste Percentage', value: `${(100 - ratioPct).toFixed(2)}%` },
          { label: 'Daily Bot Hits per Indexed Page', value: `${crawlsPerIndexedPage.toFixed(2)} hits/day` },
          { label: 'Full Catalog Refresh Cycle', value: `${(discovered / dailyReqs).toFixed(2)} days` },
        ],
        formulaUsed: `Indexation Ratio = (${indexed.toLocaleString()} / ${discovered.toLocaleString()}) × 100% = ${ratioPct.toFixed(2)}%`,
        recommendation: 'Block low-value parameter permutations via robots.txt and remove non-canonical/redirecting URLs from XML sitemaps.',
        error: null
      };
    }
  },

  'adv-web-international-hreflang-tag-validation-coverage': {
    id: 'adv-web-international-hreflang-tag-validation-coverage',
    title: 'International SEO Hreflang Tag Reciprocal Return Link Coverage',
    subtitle: 'Measure bilateral reciprocal return tag coverage across international language and regional URL variants',
    formula: 'Coverage % = Valid Reciprocal Hreflang Pairs / Total Language Variants * 100%',
    fields: [
      { key: 'validPairs', label: 'Valid Reciprocal Hreflang Pairs', unit: 'URLs', type: 'number', min: 0, max: 10000000, step: 10, defaultValue: 4650 },
      { key: 'totalVariants', label: 'Total International Language Variant URLs', unit: 'URLs', type: 'number', min: 1, max: 10000000, step: 10, defaultValue: 5000 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'validPairs', label: 'Valid Reciprocal Pairs' },
        { key: 'totalVariants', label: 'Total Language Variants', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const valid = Number(v.validPairs);
      const total = Number(v.totalVariants);
      if (valid > total) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Valid Reciprocal Pairs cannot exceed Total Language Variants.' };
      }

      const coveragePct = (valid / total) * 100;
      const missingReturnTags = total - valid;

      return {
        isValid: true,
        primaryLabel: 'Reciprocal Hreflang Coverage Rate',
        primaryValue: `${coveragePct.toFixed(2)}%`,
        statusBadge: coveragePct >= 98 ? 'COMPLIANT HREFLANG CLUSTER' : coveragePct >= 85 ? 'MISSING RETURN TAGS DETECTED' : 'CRITICAL HREFLANG MISMATCH',
        statusTone: coveragePct >= 98 ? 'good' : coveragePct >= 85 ? 'warn' : 'bad',
        metrics: [
          { label: 'Broken / Missing Return Links', value: `${missingReturnTags.toLocaleString()} URLs`, status: missingReturnTags === 0 ? 'good' : 'bad' },
          { label: 'Reciprocal Pair Error Rate', value: `${(100 - coveragePct).toFixed(2)}%` },
          { label: 'Verified Language Variant URLs', value: `${valid.toLocaleString()} URLs` },
          { label: 'Total Cluster Scope', value: `${total.toLocaleString()} URLs` },
        ],
        formulaUsed: `Coverage % = (${valid.toLocaleString()} / ${total.toLocaleString()}) × 100% = ${coveragePct.toFixed(2)}%`,
        recommendation: 'Every hreflang annotation must include a self-referencing tag, bidirectional return links, and an x-default fallback URL.',
        error: null
      };
    }
  },

  'adv-web-server-side-rendering-ssr-vs-csr-ttfb': {
    id: 'adv-web-server-side-rendering-ssr-vs-csr-ttfb',
    title: 'Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) TTFB',
    subtitle: 'Compare end-to-end First Paint and Time to Interactive across Server-Side Rendering and Client-Side Rendering architectures',
    formula: 'Total First Paint = Server Render Time + Network Transfer + Client Hydration',
    fields: [
      { key: 'serverRenderMs', label: 'SSR Server Compute & DB TTFB', unit: 'ms', type: 'number', min: 5, max: 5000, step: 10, defaultValue: 140 },
      { key: 'networkTransferMs', label: 'HTML Document Network Transfer', unit: 'ms', type: 'number', min: 5, max: 5000, step: 10, defaultValue: 65 },
      { key: 'hydrationMs', label: 'Client JS Bundle & Hydration Time', unit: 'ms', type: 'number', min: 10, max: 10000, step: 20, defaultValue: 320 },
      { key: 'csrApiFetchMs', label: 'CSR Additional Client API Fetch Delay', unit: 'ms', type: 'number', min: 0, max: 10000, step: 20, defaultValue: 280 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'serverRenderMs', label: 'Server Render Time', allowZero: false },
        { key: 'networkTransferMs', label: 'Network Transfer Time', allowZero: false },
        { key: 'hydrationMs', label: 'Client Hydration Time', allowZero: false },
        { key: 'csrApiFetchMs', label: 'CSR Client API Fetch Delay' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const ssrCompute = Number(v.serverRenderMs);
      const net = Number(v.networkTransferMs);
      const hyd = Number(v.hydrationMs);
      const csrApi = Number(v.csrApiFetchMs);

      const ssrFcp = ssrCompute + net;
      const ssrTti = ssrCompute + net + hyd;
      const csrFcp = Math.round(ssrCompute * 0.3) + net + hyd + csrApi;
      const fcpAdvantage = csrFcp - ssrFcp;

      return {
        isValid: true,
        primaryLabel: 'SSR Total Time to Interactive (TTI)',
        primaryValue: `${ssrTti.toFixed(0)} ms`,
        statusBadge: `SSR FIRST PAINT: ${ssrFcp.toFixed(0)} ms`,
        statusTone: ssrTti <= 800 ? 'good' : ssrTti <= 1800 ? 'warn' : 'bad',
        metrics: [
          { label: 'SSR First Contentful Paint', value: `${ssrFcp.toFixed(0)} ms`, sublabel: 'Server TTFB + HTML Transfer', status: 'good' },
          { label: 'CSR Meaningful Content Paint', value: `${csrFcp.toFixed(0)} ms`, sublabel: 'Requires JS + Client API' },
          { label: 'SSR First Paint Advantage', value: `${fcpAdvantage >= 0 ? '+' : ''}${fcpAdvantage.toFixed(0)} ms faster` },
          { label: 'Hydration Blocking Window (TBT)', value: `${hyd.toFixed(0)} ms` },
        ],
        formulaUsed: `Total = ${ssrCompute}ms + ${net}ms + ${hyd}ms = ${ssrTti.toFixed(0)}ms`,
        recommendation: 'Use Streaming SSR (React Suspense / HTTP chunked transfer) and edge caching to reduce Server Render TTFB while preserving instant FCP.',
        error: null
      };
    }
  },

  'adv-web-service-worker-pwa-offline-cache-hit-rate': {
    id: 'adv-web-service-worker-pwa-offline-cache-hit-rate',
    title: 'Progressive Web App (PWA) Service Worker Cache Hit Ratio & Speed',
    subtitle: 'Calculate PWA offline app-shell coverage and repeat-visit latency savings from CacheFirst / StaleWhileRevalidate strategies',
    formula: 'Offline Availability % = Cached Static Assets / Total App Shell Assets * 100%',
    fields: [
      { key: 'cachedAssets', label: 'Precached Service Worker Static Assets', unit: 'assets', type: 'number', min: 0, max: 10000, step: 1, defaultValue: 42 },
      { key: 'totalShellAssets', label: 'Total Critical App Shell Assets', unit: 'assets', type: 'number', min: 1, max: 10000, step: 1, defaultValue: 45 },
      { key: 'networkFetchMs', label: 'Uncached Network Asset Load Time', unit: 'ms', type: 'number', min: 10, max: 10000, step: 10, defaultValue: 420 },
      { key: 'swCacheReadMs', label: 'Local Cache Storage Read Time', unit: 'ms', type: 'number', min: 1, max: 500, step: 1, defaultValue: 18 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'cachedAssets', label: 'Cached Static Assets' },
        { key: 'totalShellAssets', label: 'Total App Shell Assets', allowZero: false },
        { key: 'networkFetchMs', label: 'Network Asset Load Time', allowZero: false },
        { key: 'swCacheReadMs', label: 'Local Cache Read Time', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const cached = Number(v.cachedAssets);
      const total = Number(v.totalShellAssets);
      const netMs = Number(v.networkFetchMs);
      const swMs = Number(v.swCacheReadMs);
      if (cached > total) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Cached Static Assets cannot exceed Total App Shell Assets.' };
      }

      const ratio = cached / total;
      const availabilityPct = ratio * 100;
      const effectiveLatency = ratio * swMs + (1 - ratio) * netMs;
      const timeSaved = netMs - effectiveLatency;

      return {
        isValid: true,
        primaryLabel: 'PWA App Shell Offline Availability',
        primaryValue: `${availabilityPct.toFixed(2)}%`,
        statusBadge: availabilityPct === 100 ? '100% OFFLINE READY' : `${total - cached} UNPRECACHED SHELL ASSETS`,
        statusTone: availabilityPct >= 95 ? 'good' : availabilityPct >= 75 ? 'warn' : 'bad',
        metrics: [
          { label: 'Effective Repeat-Visit Load Time', value: `${effectiveLatency.toFixed(1)} ms`, status: 'good' },
          { label: 'Latency Saved vs Cold Network', value: `${timeSaved.toFixed(1)} ms (${((timeSaved / netMs) * 100).toFixed(1)}%)` },
          { label: 'Precached Shell Assets', value: `${cached} / ${total}` },
          { label: 'Uncached Network Fallback Assets', value: `${total - cached} assets` },
        ],
        formulaUsed: `Offline Availability % = (${cached} / ${total}) × 100% = ${availabilityPct.toFixed(2)}%`,
        recommendation: 'Precache all critical HTML shell, CSS, and entry JS bundles during the Service Worker install event with content-hash revisioning.',
        error: null
      };
    }
  },

  'adv-web-amp-accelerated-mobile-pages-conversion-uplift': {
    id: 'adv-web-amp-accelerated-mobile-pages-conversion-uplift',
    title: 'Accelerated Mobile Pages (AMP) vs Responsive Web Conversion Lift',
    subtitle: 'Calculate mobile revenue uplift from faster mobile landing page speed and reduced mobile bounce rates',
    formula: 'Revenue Lift = Baseline Revenue * (1 - New Bounce Rate / Old Bounce Rate)',
    fields: [
      { key: 'baselineRevenue', label: 'Baseline Monthly Mobile Revenue', unit: '$', type: 'number', min: 1, max: 100000000, step: 500, defaultValue: 85000 },
      { key: 'oldBounceRate', label: 'Previous Mobile Bounce Rate', unit: '%', type: 'number', min: 1, max: 99.9, step: 0.5, defaultValue: 58 },
      { key: 'newBounceRate', label: 'Optimized Mobile Bounce Rate', unit: '%', type: 'number', min: 0.5, max: 99.9, step: 0.5, defaultValue: 42 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'baselineRevenue', label: 'Baseline Revenue', allowZero: false },
        { key: 'oldBounceRate', label: 'Previous Bounce Rate', allowZero: false },
        { key: 'newBounceRate', label: 'Optimized Bounce Rate', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const rev = Number(v.baselineRevenue);
      const oldBr = Number(v.oldBounceRate);
      const newBr = Number(v.newBounceRate);
      if (oldBr >= 100 || newBr >= 100) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Bounce rate percentages must be less than 100%.' };
      }

      const revenueLift = rev * (1 - newBr / oldBr);
      const projectedTotal = rev + revenueLift;
      const bounceReductionPct = ((oldBr - newBr) / oldBr) * 100;

      return {
        isValid: true,
        primaryLabel: 'Projected Monthly Mobile Revenue Lift',
        primaryValue: `${revenueLift >= 0 ? '+' : ''}$${revenueLift.toFixed(2)}/mo`,
        statusBadge: `${bounceReductionPct.toFixed(1)}% BOUNCE RATE REDUCTION`,
        statusTone: revenueLift > 0 ? 'good' : 'warn',
        metrics: [
          { label: 'Projected New Monthly Revenue', value: `$${projectedTotal.toFixed(2)}/mo`, status: 'good' },
          { label: 'Annualized Revenue Uplift', value: `$${(revenueLift * 12).toFixed(2)}/yr` },
          { label: 'Bounce Rate Delta', value: `${(newBr - oldBr).toFixed(1)} percentage pts` },
          { label: 'Engaged Session Retention Lift', value: `${(((100 - newBr) / (100 - oldBr) - 1) * 100).toFixed(1)}%` },
        ],
        formulaUsed: `Revenue Lift = $${rev.toLocaleString()} × (1 - ${newBr}% / ${oldBr}%) = $${revenueLift.toFixed(2)}`,
        recommendation: 'Achieve sub-1.5s mobile LCP on standard responsive pages via Speculation Rules API prerendering without requiring separate AMP URLs.',
        error: null
      };
    }
  },

  'adv-web-backlink-domain-authority-link-equity-flow': {
    id: 'adv-web-backlink-domain-authority-link-equity-flow',
    title: 'Backlink Domain Authority (DA) & PageRank Link Equity Distribution',
    subtitle: 'Compute damped PageRank flow from referring backlinks based on source authority and outbound link dilution',
    formula: 'PageRank PR(A) = (1-d) + d * Sum(PR(T_i) / C(T_i))',
    fields: [
      { key: 'dampingFactor', label: 'PageRank Damping Factor (d)', unit: '0.0–1.0', type: 'number', min: 0.1, max: 0.99, step: 0.01, defaultValue: 0.85 },
      { key: 'sourcePageRank', label: 'Average Referring Page Authority Score', unit: 'PR', type: 'number', min: 0.1, max: 100, step: 0.5, defaultValue: 6.5 },
      { key: 'outboundLinksOnSource', label: 'Outbound Links on Referring Page C(T)', unit: 'links', type: 'number', min: 1, max: 5000, step: 1, defaultValue: 12 },
      { key: 'referringPagesCount', label: 'Number of Referring Backlink Pages', unit: 'pages', type: 'number', min: 1, max: 100000, step: 1, defaultValue: 8 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'dampingFactor', label: 'Damping Factor', allowZero: false },
        { key: 'sourcePageRank', label: 'Source PageRank', allowZero: false },
        { key: 'outboundLinksOnSource', label: 'Outbound Links on Source', allowZero: false },
        { key: 'referringPagesCount', label: 'Referring Pages Count', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const d = Number(v.dampingFactor);
      const prT = Number(v.sourcePageRank);
      const cT = Number(v.outboundLinksOnSource);
      const count = Number(v.referringPagesCount);
      if (d >= 1) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Damping factor d must be strictly less than 1.0 (standard is 0.85).' };
      }

      const rawTransferPerLink = prT / cT;
      const sumTransfer = rawTransferPerLink * count;
      const prA = (1 - d) + d * sumTransfer;

      return {
        isValid: true,
        primaryLabel: 'Target Page Computed PageRank PR(A)',
        primaryValue: prA.toFixed(4),
        statusBadge: `DAMPING d = ${d}`,
        statusTone: prA >= 3 ? 'good' : prA >= 1 ? 'warn' : 'bad',
        metrics: [
          { label: 'Damped Equity per Backlink', value: `${(d * rawTransferPerLink).toFixed(4)}`, sublabel: `d × (${prT} / ${cT})` },
          { label: 'Total Undamped Link Sum', value: sumTransfer.toFixed(4) },
          { label: 'Base Random Surfer Floor (1 - d)', value: (1 - d).toFixed(4) },
          { label: 'Outbound Dilution Ratio', value: `${(100 / cT).toFixed(2)}% per link` },
        ],
        formulaUsed: `PR(A) = (1 - ${d}) + ${d} × (${count} × (${prT} / ${cT})) = ${prA.toFixed(4)}`,
        recommendation: 'Prioritize contextual links from high-authority pages with low outbound link counts and funnel equity internally to money pages.',
        error: null
      };
    }
  },

  'adv-web-http2-http3-multiplexing-head-of-line-blocking': {
    id: 'adv-web-http2-http3-multiplexing-head-of-line-blocking',
    title: 'HTTP/2 TCP vs HTTP/3 QUIC Multiplexing & Packet Loss Latency',
    subtitle: 'Calculate effective transport latency under packet loss and compare TCP Head-of-Line (HoL) blocking against HTTP/3 QUIC',
    formula: 'Effective Latency = RTT * (1 + Packet Loss Rate / (1 - Packet Loss Rate))',
    fields: [
      { key: 'rttMs', label: 'Base Network Round-Trip Time (RTT)', unit: 'ms', type: 'number', min: 1, max: 2000, step: 5, defaultValue: 85 },
      { key: 'packetLossPct', label: 'Network Packet Loss Rate', unit: '%', type: 'number', min: 0, max: 50, step: 0.2, defaultValue: 2.5 },
      { key: 'concurrentStreams', label: 'Multiplexed Concurrent Streams', unit: 'streams', type: 'number', min: 1, max: 200, step: 1, defaultValue: 16 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'rttMs', label: 'Base Network RTT', allowZero: false },
        { key: 'packetLossPct', label: 'Packet Loss Rate' },
        { key: 'concurrentStreams', label: 'Concurrent Streams', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const rtt = Number(v.rttMs);
      const p = Number(v.packetLossPct) / 100;
      const streams = Number(v.concurrentStreams);
      if (p >= 0.99) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Packet loss rate must be below 99%.' };
      }

      const effectiveLatency = rtt * (1 + p / (1 - p));
      // Under HTTP/2 single TCP connection, a lost packet blocks all multiplexed streams
      const h2HolPenaltyMs = (effectiveLatency - rtt) * Math.log2(Math.max(2, streams));
      const h2TotalMs = rtt + h2HolPenaltyMs;
      const quicAdvantageMs = h2TotalMs - effectiveLatency;

      return {
        isValid: true,
        primaryLabel: 'Effective Stream Latency Under Packet Loss',
        primaryValue: `${effectiveLatency.toFixed(2)} ms`,
        statusBadge: `HTTP/3 QUIC SAVES ${quicAdvantageMs.toFixed(1)} ms`,
        statusTone: p <= 0.01 ? 'good' : p <= 0.03 ? 'warn' : 'bad',
        metrics: [
          { label: 'Single-Stream Retransmit Latency', value: `${effectiveLatency.toFixed(2)} ms`, sublabel: `Base ${rtt} ms RTT` },
          { label: 'HTTP/2 TCP Multi-Stream HoL Delay', value: `${h2TotalMs.toFixed(2)} ms`, sublabel: `Across ${streams} streams` },
          { label: 'HTTP/3 QUIC Stream Isolation Gain', value: `${quicAdvantageMs.toFixed(2)} ms`, status: 'good' },
          { label: 'handshake 0-RTT Connection Savings', value: `${rtt.toFixed(0)} ms` },
        ],
        formulaUsed: `Effective Latency = ${rtt}ms × (1 + ${p.toFixed(4)} / (1 - ${p.toFixed(4)})) = ${effectiveLatency.toFixed(2)}ms`,
        recommendation: 'Enable HTTP/3 (QUIC over UDP) with 0-RTT resumption on your CDN to eliminate TCP Head-of-Line blocking on lossy mobile networks.',
        error: null
      };
    }
  },

  'adv-web-paginated-content-seo-rel-next-prev-architecture': {
    id: 'adv-web-paginated-content-seo-rel-next-prev-architecture',
    title: 'Paginated Archive SEO Architecture (Rel-Next/Prev & Infinite Scroll)',
    subtitle: 'Optimize pagination depth, internal link path length, and crawl equity retention across large category archives',
    formula: 'Crawl Depth Score = Total Pages / Internal Link Path Length from Homepage',
    fields: [
      { key: 'totalPages', label: 'Total Paginated Archive Pages', unit: 'pages', type: 'number', min: 1, max: 1000000, step: 10, defaultValue: 240 },
      { key: 'linkPathLength', label: 'Internal Link Path Length (Pagination Window)', unit: 'clicks', type: 'number', min: 1, max: 1000, step: 1, defaultValue: 12 },
      { key: 'itemsPerPage', label: 'Items Displayed Per Archive Page', unit: 'items', type: 'number', min: 1, max: 500, step: 4, defaultValue: 24 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'totalPages', label: 'Total Paginated Pages', allowZero: false },
        { key: 'linkPathLength', label: 'Internal Link Path Length', allowZero: false },
        { key: 'itemsPerPage', label: 'Items Per Page', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const pages = Number(v.totalPages);
      const pathLen = Number(v.linkPathLength);
      const perPage = Number(v.itemsPerPage);

      const crawlDepthScore = pages / pathLen;
      const totalCatalogItems = pages * perPage;
      const deepestEquityRetention = Math.pow(0.85, Math.min(20, crawlDepthScore)) * 100;

      return {
        isValid: true,
        primaryLabel: 'Pagination Crawl Depth Score (Max Clicks to Deepest Page)',
        primaryValue: `${crawlDepthScore.toFixed(2)} hops`,
        statusBadge: crawlDepthScore <= 5 ? 'SHALLOW CRAWL ARCHITECTURE' : crawlDepthScore <= 15 ? 'MODERATE PAGINATION DEPTH' : 'DEEP ARCHIVE DECAY (>15 HOPS)',
        statusTone: crawlDepthScore <= 5 ? 'good' : crawlDepthScore <= 15 ? 'warn' : 'bad',
        metrics: [
          { label: 'Total Catalog Items Covered', value: `${totalCatalogItems.toLocaleString()} items` },
          { label: 'Deepest Page Link Equity Retention', value: `${deepestEquityRetention.toFixed(1)}%`, sublabel: 'at d = 0.85 per hop' },
          { label: 'Optimal Page Size for ≤5 Hops', value: `${Math.ceil(totalCatalogItems / (5 * pathLen))} items/page`, status: 'good' },
          { label: 'Pagination Window Span', value: `${pathLen} numbered links` },
        ],
        formulaUsed: `Crawl Depth Score = ${pages} / ${pathLen} = ${crawlDepthScore.toFixed(2)}`,
        recommendation: 'Use crawlable <a href="?page=N"> links with midpoint jump links (1, 2, 3 ... 10, 20, 50) and subcategories to keep click depth ≤ 4.',
        error: null
      };
    }
  },

  'adv-web-local-seo-gmb-proximity-radius-rank-tracker': {
    id: 'adv-web-local-seo-gmb-proximity-radius-rank-tracker',
    title: 'Local SEO Google Business Profile (GBP) Proximity Ranking Grid',
    subtitle: 'Calculate average local map-pack rank and visibility score across an N×N geographic proximity grid (default 9×9 = 81 nodes)',
    formula: 'Visibility Score = Sum(Ranking Positions in 9x9 Proximity Grid) / Total Grid Points',
    fields: [
      { key: 'top3Count', label: 'Grid Nodes Ranked #1–#3 (Avg Pos 2.0)', unit: 'nodes', type: 'number', min: 0, max: 400, step: 1, defaultValue: 38 },
      { key: 'rank4to10Count', label: 'Grid Nodes Ranked #4–#10 (Avg Pos 7.0)', unit: 'nodes', type: 'number', min: 0, max: 400, step: 1, defaultValue: 27 },
      { key: 'rank11to20Count', label: 'Grid Nodes Ranked #11–#20 (Avg Pos 15.5)', unit: 'nodes', type: 'number', min: 0, max: 400, step: 1, defaultValue: 16 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'top3Count', label: 'Nodes Ranked #1–#3' },
        { key: 'rank4to10Count', label: 'Nodes Ranked #4–#10' },
        { key: 'rank11to20Count', label: 'Nodes Ranked #11–#20' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const n1 = Number(v.top3Count);
      const n2 = Number(v.rank4to10Count);
      const n3 = Number(v.rank11to20Count);
      const totalNodes = n1 + n2 + n3;
      if (totalNodes <= 0) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Total Grid Points must be at least 1.' };
      }

      const sumPositions = n1 * 2.0 + n2 * 7.0 + n3 * 15.5;
      const avgPosition = sumPositions / totalNodes;
      const mapPackSharePct = (n1 / totalNodes) * 100;

      return {
        isValid: true,
        primaryLabel: 'Average Proximity Grid Ranking Position',
        primaryValue: `#${avgPosition.toFixed(2)}`,
        statusBadge: `LOCAL 3-PACK SHARE: ${mapPackSharePct.toFixed(1)}%`,
        statusTone: avgPosition <= 4 ? 'good' : avgPosition <= 9 ? 'warn' : 'bad',
        metrics: [
          { label: 'Total Geo-Grid Nodes Evaluated', value: `${totalNodes} nodes` },
          { label: 'Sum of Grid Ranking Positions', value: `${sumPositions.toFixed(1)}` },
          { label: 'Top-3 Map Pack Dominance', value: `${mapPackSharePct.toFixed(1)}% (${n1} nodes)`, status: 'good' },
          { label: 'Page-1 Local Visibility (#1–#10)', value: `${(((n1 + n2) / totalNodes) * 100).toFixed(1)}%` },
        ],
        formulaUsed: `Average Grid Rank = ${sumPositions.toFixed(1)} / ${totalNodes} = #${avgPosition.toFixed(2)}`,
        recommendation: 'Strengthen hyper-local landing pages, consistent NAP citations, and service-area reviews to expand your 3-Pack radius.',
        error: null
      };
    }
  },

  'adv-web-redirect-chain-latency-loss-link-equity': {
    id: 'adv-web-redirect-chain-latency-loss-link-equity',
    title: 'HTTP Redirect Chain (301/302) Latency & Link Equity Loss (Juice)',
    subtitle: 'Calculate cumulative network RTT latency penalty and PageRank attenuation across multi-hop HTTP redirect chains',
    formula: 'Cumulative Redirect Latency = Hop Count * Average Server RTT (approx 50ms/hop)',
    fields: [
      { key: 'hopCount', label: 'Number of Redirect Hops in Chain', unit: 'hops', type: 'number', min: 1, max: 20, step: 1, defaultValue: 3 },
      { key: 'serverRttMs', label: 'Average Server & Network RTT per Hop', unit: 'ms/hop', type: 'number', min: 5, max: 1000, step: 5, defaultValue: 65 },
      { key: 'retentionPerHopPct', label: 'Authority Retention Factor per Hop', unit: '%', type: 'number', min: 50, max: 100, step: 1, defaultValue: 95 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'hopCount', label: 'Redirect Hop Count', allowZero: false },
        { key: 'serverRttMs', label: 'Average Server RTT', allowZero: false },
        { key: 'retentionPerHopPct', label: 'Authority Retention %', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const hops = Math.round(Number(v.hopCount));
      const rtt = Number(v.serverRttMs);
      const ret = Math.min(100, Number(v.retentionPerHopPct)) / 100;

      const cumulativeLatency = hops * rtt;
      const singleHopSavings = Math.max(0, (hops - 1) * rtt);
      const retainedEquityPct = Math.pow(ret, hops) * 100;
      const googlebotFollows = hops <= 10;

      return {
        isValid: true,
        primaryLabel: 'Cumulative Redirect Chain Latency Penalty',
        primaryValue: `${cumulativeLatency.toFixed(0)} ms`,
        statusBadge: hops === 1 ? 'DIRECT SINGLE-HOP 301' : hops <= 5 ? `${hops}-HOP REDIRECT CHAIN` : 'CRITICAL REDIRECT LOOP RISK',
        statusTone: hops === 1 ? 'good' : hops <= 3 ? 'warn' : 'bad',
        metrics: [
          { label: 'Latency Saved by Flattening to 1 Hop', value: `${singleHopSavings.toFixed(0)} ms`, status: 'good' },
          { label: 'Compounded Link Equity Retained', value: `${retainedEquityPct.toFixed(2)}%` },
          { label: 'Link Authority Attenuation', value: `${(100 - retainedEquityPct).toFixed(2)}% lost` },
          { label: 'Googlebot Max-Hop Compliance (≤10)', value: googlebotFollows ? 'Followed' : 'Dropped (>10 hops)' },
        ],
        formulaUsed: `Cumulative Redirect Latency = ${hops} hops × ${rtt} ms/hop = ${cumulativeLatency.toFixed(0)} ms`,
        recommendation: 'Flatten multi-hop redirect chains (A → B → C → D) into a single direct 301 redirect (A → D) and update internal links to point directly to D.',
        error: null
      };
    }
  },

  'adv-web-content-readability-flesch-kincaid-seo-score': {
    id: 'adv-web-content-readability-flesch-kincaid-seo-score',
    title: 'Content Readability Score (Flesch-Kincaid & Gunning Fog Index)',
    subtitle: 'Compute exact Flesch-Kincaid Grade Level, Flesch Reading Ease, and Gunning Fog Index from word, sentence, and syllable counts',
    formula: 'Flesch Grade = 0.39 * (Total Words / Total Sentences) + 11.8 * (Total Syllables / Total Words) - 15.59',
    fields: [
      { key: 'totalWords', label: 'Total Words in Article', unit: 'words', type: 'number', min: 1, max: 1000000, step: 50, defaultValue: 1500 },
      { key: 'totalSentences', label: 'Total Sentences in Article', unit: 'sentences', type: 'number', min: 1, max: 100000, step: 5, defaultValue: 95 },
      { key: 'totalSyllables', label: 'Total Syllables in Article', unit: 'syllables', type: 'number', min: 1, max: 3000000, step: 100, defaultValue: 2250 },
      { key: 'complexWords', label: 'Complex Words (≥3 Syllables)', unit: 'words', type: 'number', min: 0, max: 1000000, step: 10, defaultValue: 165 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'totalWords', label: 'Total Words', allowZero: false },
        { key: 'totalSentences', label: 'Total Sentences', allowZero: false },
        { key: 'totalSyllables', label: 'Total Syllables', allowZero: false },
        { key: 'complexWords', label: 'Complex Words' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const words = Number(v.totalWords);
      const sentences = Number(v.totalSentences);
      const syllables = Number(v.totalSyllables);
      const complex = Number(v.complexWords);

      const asl = words / sentences;
      const asw = syllables / words;
      const fkGrade = 0.39 * asl + 11.8 * asw - 15.59;
      const readingEase = 206.835 - 1.015 * asl - 84.6 * asw;
      const gunningFog = 0.4 * (asl + 100 * (complex / words));

      return {
        isValid: true,
        primaryLabel: 'Flesch-Kincaid Grade Level',
        primaryValue: `Grade ${Math.max(0, fkGrade).toFixed(2)}`,
        statusBadge: `READING EASE: ${Math.max(0, Math.min(100, readingEase)).toFixed(1)} / 100`,
        statusTone: fkGrade <= 9 ? 'good' : fkGrade <= 13 ? 'warn' : 'bad',
        metrics: [
          { label: 'Gunning Fog Readability Index', value: gunningFog.toFixed(2) },
          { label: 'Flesch Reading Ease Score', value: `${Math.max(0, Math.min(100, readingEase)).toFixed(2)}`, status: readingEase >= 60 ? 'good' : 'warn' },
          { label: 'Average Sentence Length (ASL)', value: `${asl.toFixed(2)} words/sentence` },
          { label: 'Average Syllables per Word (ASW)', value: `${asw.toFixed(2)} syllables/word` },
        ],
        formulaUsed: `Flesch Grade = 0.39 × (${words}/${sentences}) + 11.8 × (${syllables}/${words}) - 15.59 = ${fkGrade.toFixed(2)}`,
        recommendation: 'Aim for a Flesch-Kincaid Grade Level between 7.0 and 9.0 (14–18 words per sentence) for broad web & SERP engagement.',
        error: null
      };
    }
  },

  'adv-web-domain-migration-traffic-drop-recovery-forecaster': {
    id: 'adv-web-domain-migration-traffic-drop-recovery-forecaster',
    title: 'Site Migration & Rebranding Traffic Drop & Recovery Forecaster',
    subtitle: 'Estimate Googlebot re-indexation timeline and organic recovery window following a domain or URL structure migration',
    formula: 'Recovery Duration Weeks = Log2(Total Indexed URLs) * Crawler Visit Frequency Factor',
    fields: [
      { key: 'totalIndexedUrls', label: 'Total Migrated Indexed URLs', unit: 'URLs', type: 'number', min: 2, max: 100000000, step: 500, defaultValue: 50000 },
      { key: 'crawlerFrequencyFactor', label: 'Crawler Visit Frequency Factor (0.2 Fast – 1.5 Slow)', unit: 'factor', type: 'number', min: 0.1, max: 5, step: 0.05, defaultValue: 0.55 },
      { key: 'redirectCoveragePct', label: '1:1 301 Redirect Mapping Coverage', unit: '%', type: 'number', min: 1, max: 100, step: 0.5, defaultValue: 98.5 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'totalIndexedUrls', label: 'Total Indexed URLs', allowZero: false },
        { key: 'crawlerFrequencyFactor', label: 'Crawler Frequency Factor', allowZero: false },
        { key: 'redirectCoveragePct', label: '301 Redirect Coverage %', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const urls = Math.max(2, Number(v.totalIndexedUrls));
      const factor = Number(v.crawlerFrequencyFactor);
      const coverage = Math.min(100, Number(v.redirectCoveragePct));

      const log2Urls = Math.log2(urls);
      const baseWeeks = log2Urls * factor;
      const missingRedirectPenalty = (100 - coverage) * 0.35;
      const totalWeeks = baseWeeks + missingRedirectPenalty;

      return {
        isValid: true,
        primaryLabel: 'Estimated Organic Traffic Recovery Duration',
        primaryValue: `${totalWeeks.toFixed(1)} weeks`,
        statusBadge: `BASE RE-CRAWL: ${baseWeeks.toFixed(1)} WEEKS`,
        statusTone: totalWeeks <= 8 ? 'good' : totalWeeks <= 14 ? 'warn' : 'bad',
        metrics: [
          { label: 'Formula Base Recovery (Log2 × Factor)', value: `${baseWeeks.toFixed(2)} weeks`, sublabel: `log2(${urls}) = ${log2Urls.toFixed(2)}` },
          { label: 'Unmapped Redirect Penalty', value: `+${missingRedirectPenalty.toFixed(2)} weeks`, sublabel: `at ${coverage}% coverage` },
          { label: 'Estimated Recovery in Days', value: `${Math.round(totalWeeks * 7)} days` },
          { label: 'Unmapped At-Risk URLs', value: `${Math.round(urls * (1 - coverage / 100)).toLocaleString()} URLs` },
        ],
        formulaUsed: `Recovery Weeks = log2(${urls}) × ${factor} = ${baseWeeks.toFixed(2)} weeks`,
        recommendation: 'Submit both old and new XML sitemaps in Google Search Console and keep 1:1 301 redirects active for at least 12–18 months.',
        error: null
      };
    }
  },

  'adv-web-meta-title-description-pixel-width-truncation': {
    id: 'adv-web-meta-title-description-pixel-width-truncation',
    title: 'SERP Meta Title & Description Pixel Width Truncation Checker',
    subtitle: 'Calculate exact proportional font pixel width of SEO meta titles (max 600px) and descriptions (max 960px) to prevent Google SERP ellipsis cutoff',
    formula: 'Title Pixel Width = Sum(Character Pixel Widths based on font metrics, max ~600px)',
    fields: [
      { key: 'metaTitle', label: 'Meta Title Tag String', type: 'text', defaultValue: 'CalcTools — 4,400+ High-Precision Engineering, Finance & Science Calculators' },
      { key: 'metaDescription', label: 'Meta Description Tag String', type: 'text', defaultValue: 'Explore 4,400+ deterministic calculators, converters, developer utilities, and PDF tools running 100% locally in your browser with instant verification.' },
      { key: 'maxTitlePx', label: 'Desktop SERP Max Title Pixel Width', unit: 'px', type: 'number', min: 300, max: 1000, step: 10, defaultValue: 600 },
    ],
    compute: (v) => {
      const title = String(v.metaTitle || '').trim();
      const desc = String(v.metaDescription || '').trim();
      const maxPx = Number(v.maxTitlePx) || 600;

      if (!title) {
        return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: 'Meta Title cannot be empty.' };
      }

      const measurePx = (str: string, scale = 1): number => {
        let px = 0;
        for (const ch of str) {
          if ('iIlj1|!.,;:\'"'.includes(ch)) px += 4.5 * scale;
          else if ('mwMW@%—'.includes(ch)) px += 13.5 * scale;
          else if (/[A-Z]/.test(ch)) px += 10.5 * scale;
          else if (/\s/.test(ch)) px += 5.0 * scale;
          else px += 8.5 * scale;
        }
        return Math.round(px);
      };

      const titlePx = measurePx(title, 1.05);
      const descPx = measurePx(desc, 0.78);
      const remainingPx = maxPx - titlePx;
      const isTruncated = titlePx > maxPx;

      return {
        isValid: true,
        primaryLabel: 'Computed Meta Title SERP Pixel Width',
        primaryValue: `${titlePx} px / ${maxPx} px`,
        statusBadge: isTruncated ? `TRUNCATED (+${titlePx - maxPx} px OVER)` : `SAFE (${remainingPx} px REMAINING)`,
        statusTone: isTruncated ? 'bad' : titlePx >= 280 ? 'good' : 'warn',
        metrics: [
          { label: 'Meta Title Character Length', value: `${title.length} chars`, sublabel: 'Recommended: 50–60 chars' },
          { label: 'Meta Description Pixel Width', value: `${descPx} px / 960 px`, status: descPx <= 960 ? 'good' : 'warn' },
          { label: 'Meta Description Character Length', value: `${desc.length} chars`, sublabel: 'Recommended: 140–160 chars' },
          { label: 'SERP Display Status', value: isTruncated ? 'Ellipsis (...) Cutoff' : 'Full Title Visible' },
        ],
        formulaUsed: `Title Pixel Width = Σ(charWidth_i) = ${titlePx} px (Limit: ${maxPx} px)`,
        recommendation: isTruncated
          ? 'Shorten wide characters or redundant modifiers so the title stays under 580–600px on Google desktop SERPs.'
          : 'Title pixel width fits cleanly inside Google desktop and mobile SERP containers without truncation.',
        error: null
      };
    }
  },

  'adv-web-ecommerce-faceted-navigation-crawl-budget-trap': {
    id: 'adv-web-ecommerce-faceted-navigation-crawl-budget-trap',
    title: 'E-Commerce Faceted Navigation Combinatorial URL Crawl Trap',
    subtitle: 'Calculate combinatorial filter URL explosion across product facets and quantify crawl budget exhaustion risk',
    formula: 'Total URL Permutations = Product of (Filter Option Count per Facet Category)',
    fields: [
      { key: 'categoryCount', label: 'Number of Base Product Categories', unit: 'categories', type: 'number', min: 1, max: 10000, step: 5, defaultValue: 40 },
      { key: 'facet1Options', label: 'Facet 1 Options (e.g., Color + None)', unit: 'options', type: 'number', min: 1, max: 200, step: 1, defaultValue: 12 },
      { key: 'facet2Options', label: 'Facet 2 Options (e.g., Size + None)', unit: 'options', type: 'number', min: 1, max: 200, step: 1, defaultValue: 8 },
      { key: 'facet3Options', label: 'Facet 3 Options (e.g., Brand + None)', unit: 'options', type: 'number', min: 1, max: 200, step: 1, defaultValue: 15 },
      { key: 'facet4Options', label: 'Facet 4 Options (e.g., Price Tier + None)', unit: 'options', type: 'number', min: 1, max: 200, step: 1, defaultValue: 6 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'categoryCount', label: 'Base Categories', allowZero: false },
        { key: 'facet1Options', label: 'Facet 1 Options', allowZero: false },
        { key: 'facet2Options', label: 'Facet 2 Options', allowZero: false },
        { key: 'facet3Options', label: 'Facet 3 Options', allowZero: false },
        { key: 'facet4Options', label: 'Facet 4 Options', allowZero: false },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const cats = Number(v.categoryCount);
      const f1 = Number(v.facet1Options);
      const f2 = Number(v.facet2Options);
      const f3 = Number(v.facet3Options);
      const f4 = Number(v.facet4Options);

      const perCategoryPermutations = f1 * f2 * f3 * f4;
      const totalPermutations = cats * perCategoryPermutations;
      const bloatMultiplier = perCategoryPermutations;

      return {
        isValid: true,
        primaryLabel: 'Total Combinatorial Faceted URLs Generated',
        primaryValue: `${totalPermutations.toLocaleString()} URLs`,
        statusBadge: `${bloatMultiplier.toLocaleString()}× CRAWL MULTIPLIER`,
        statusTone: totalPermutations > 100000 ? 'bad' : totalPermutations > 10000 ? 'warn' : 'good',
        metrics: [
          { label: 'Permutations per Category', value: `${perCategoryPermutations.toLocaleString()} URLs/cat` },
          { label: 'Base Canonical Category URLs', value: `${cats.toLocaleString()} URLs`, status: 'good' },
          { label: 'Non-Canonical Filter Bloat URLs', value: `${(totalPermutations - cats).toLocaleString()} URLs` },
          { label: 'Days to Crawl at 10k Reqs/Day', value: `${(totalPermutations / 10000).toFixed(1)} days` },
        ],
        formulaUsed: `Permutations = ${cats} × (${f1} × ${f2} × ${f3} × ${f4}) = ${totalPermutations.toLocaleString()} URLs`,
        recommendation: 'Allow indexation only for high-volume single-facet landing pages; apply canonical tags or robots.txt disallow rules to multi-facet combinations.',
        error: null
      };
    }
  },

  'adv-web-web-vital-lcp-element-discovery-resource-timing': {
    id: 'adv-web-web-vital-lcp-element-discovery-resource-timing',
    title: 'Largest Contentful Paint (LCP) Element Discovery & Resource Timing',
    subtitle: 'Decompose Largest Contentful Paint into Google 4 LCP Sub-Parts (TTFB, Resource Load Delay, Resource Load Duration, Element Render Delay)',
    formula: 'LCP Time = HTML Document TTFB + Subresource Fetch Start + Image Download Time',
    fields: [
      { key: 'ttfbMs', label: '1. HTML Document Time to First Byte (TTFB)', unit: 'ms', type: 'number', min: 10, max: 10000, step: 10, defaultValue: 520 },
      { key: 'loadDelayMs', label: '2. Subresource Discovery / Fetch Start Delay', unit: 'ms', type: 'number', min: 0, max: 10000, step: 10, defaultValue: 280 },
      { key: 'downloadMs', label: '3. LCP Image / Resource Download Time', unit: 'ms', type: 'number', min: 0, max: 10000, step: 10, defaultValue: 740 },
      { key: 'renderDelayMs', label: '4. Element Paint & Render Blocking Delay', unit: 'ms', type: 'number', min: 0, max: 10000, step: 10, defaultValue: 180 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'ttfbMs', label: 'HTML Document TTFB', allowZero: false },
        { key: 'loadDelayMs', label: 'Subresource Fetch Start Delay' },
        { key: 'downloadMs', label: 'Image Download Time' },
        { key: 'renderDelayMs', label: 'Element Render Delay' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const ttfb = Number(v.ttfbMs);
      const delay = Number(v.loadDelayMs);
      const dl = Number(v.downloadMs);
      const render = Number(v.renderDelayMs);
      const totalLcp = ttfb + delay + dl + render;

      const tone = totalLcp <= 2500 ? 'good' : totalLcp <= 4000 ? 'warn' : 'bad';
      const badge = totalLcp <= 2500 ? 'GOOD (LCP ≤ 2500ms)' : totalLcp <= 4000 ? 'NEEDS IMPROVEMENT (2501–4000ms)' : 'POOR (LCP > 4000ms)';

      return {
        isValid: true,
        primaryLabel: 'Total Largest Contentful Paint (LCP) Time',
        primaryValue: `${totalLcp.toFixed(0)} ms (${(totalLcp / 1000).toFixed(2)}s)`,
        statusBadge: badge,
        statusTone: tone,
        metrics: [
          { label: '1. TTFB Share (Target ~40%)', value: `${((ttfb / totalLcp) * 100).toFixed(1)}% (${ttfb} ms)` },
          { label: '2. Discovery Delay (Target <10%)', value: `${((delay / totalLcp) * 100).toFixed(1)}% (${delay} ms)`, status: delay / totalLcp <= 0.12 ? 'good' : 'warn' },
          { label: '3. Resource Load (Target ~40%)', value: `${((dl / totalLcp) * 100).toFixed(1)}% (${dl} ms)` },
          { label: '4. Render Delay (Target <10%)', value: `${((render / totalLcp) * 100).toFixed(1)}% (${render} ms)` },
        ],
        formulaUsed: `LCP = ${ttfb}ms + ${delay}ms + ${dl}ms + ${render}ms = ${totalLcp.toFixed(0)}ms`,
        recommendation: 'Ensure the LCP image URL is present directly in initial SSR HTML (never lazy-loaded) and tagged with fetchpriority="high".',
        error: null
      };
    }
  },

  'adv-web-comprehensive-technical-seo-audit-score': {
    id: 'adv-web-comprehensive-technical-seo-audit-score',
    title: 'Comprehensive Technical SEO Site Audit & Health Scorecard',
    subtitle: 'Compute weighted Technical SEO Health Score (0–100) from critical crawl errors, high-severity broken links, and medium warnings',
    formula: 'Health Score = 100 - Sum(Issue Severity Weight * Error Count / Total Checked URLs)',
    fields: [
      { key: 'totalCheckedUrls', label: 'Total Crawled & Audited URLs', unit: 'URLs', type: 'number', min: 1, max: 10000000, step: 100, defaultValue: 5000 },
      { key: 'criticalErrors', label: 'Critical Errors (5xx, Accidental Noindex, Weight 120)', unit: 'errors', type: 'number', min: 0, max: 1000000, step: 1, defaultValue: 12 },
      { key: 'highErrors', label: 'High-Severity Issues (404s, Canonicals, Weight 45)', unit: 'issues', type: 'number', min: 0, max: 1000000, step: 5, defaultValue: 85 },
      { key: 'mediumWarnings', label: 'Medium Warnings (Meta/Redirect Chains, Weight 12)', unit: 'warnings', type: 'number', min: 0, max: 1000000, step: 10, defaultValue: 310 },
    ],
    compute: (v) => {
      const err = requireNonNegative(v, [
        { key: 'totalCheckedUrls', label: 'Total Checked URLs', allowZero: false },
        { key: 'criticalErrors', label: 'Critical Errors' },
        { key: 'highErrors', label: 'High-Severity Issues' },
        { key: 'mediumWarnings', label: 'Medium Warnings' },
      ]);
      if (err) return { isValid: false, primaryLabel: '', primaryValue: '', statusBadge: '', statusTone: 'bad', metrics: [], formulaUsed: '', recommendation: '', error: err };

      const urls = Number(v.totalCheckedUrls);
      const crit = Number(v.criticalErrors);
      const high = Number(v.highErrors);
      const med = Number(v.mediumWarnings);

      const critPenalty = (120 * crit) / urls;
      const highPenalty = (45 * high) / urls;
      const medPenalty = (12 * med) / urls;
      const totalPenalty = critPenalty + highPenalty + medPenalty;
      const healthScore = Math.max(0, Math.min(100, 100 - totalPenalty));

      const grade = healthScore >= 92 ? 'A+ (Excellent)' : healthScore >= 82 ? 'B (Healthy)' : healthScore >= 70 ? 'C (Needs Remediation)' : 'D/F (Critical Issues)';

      return {
        isValid: true,
        primaryLabel: 'Comprehensive Technical SEO Health Score',
        primaryValue: `${healthScore.toFixed(2)} / 100`,
        statusBadge: `AUDIT GRADE: ${grade}`,
        statusTone: healthScore >= 88 ? 'good' : healthScore >= 72 ? 'warn' : 'bad',
        metrics: [
          { label: 'Critical Error Penalty', value: `-${critPenalty.toFixed(2)} pts`, sublabel: `${crit} critical issues` },
          { label: 'High-Severity Penalty', value: `-${highPenalty.toFixed(2)} pts`, sublabel: `${high} high issues` },
          { label: 'Medium Warning Penalty', value: `-${medPenalty.toFixed(2)} pts`, sublabel: `${med} warnings` },
          { label: 'Total Issue Density', value: `${(((crit + high + med) / urls) * 100).toFixed(1)} issues / 100 URLs` },
        ],
        formulaUsed: `Health Score = 100 - ((120×${crit} + 45×${high} + 12×${med}) / ${urls}) = ${healthScore.toFixed(2)}`,
        recommendation: 'Resolve all Critical 5xx / accidental noindex directives first, then repair broken internal 404 links and canonical mismatches.',
        error: null
      };
    }
  }
};
