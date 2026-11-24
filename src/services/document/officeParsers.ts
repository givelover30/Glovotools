import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { StructuredBlock } from './types.ts';

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    });
}

function stripTags(html: string): string {
  return decodeXmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+/g, ' ').trim();
}

export function htmlToStructuredBlocks(rawHtml: string): StructuredBlock[] {
  const cleaned = rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

  const blocks: StructuredBlock[] = [];
  const tokenRegex = /<(h[1-6]|p|li|pre|blockquote|table)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let orderedCounter = 1;

  while ((match = tokenRegex.exec(cleaned)) !== null) {
    // Capture any loose plain text between top-level tags
    if (match.index > lastIndex) {
      const loose = stripTags(cleaned.slice(lastIndex, match.index));
      if (loose) {
        blocks.push({ type: 'paragraph', text: loose });
      }
    }
    lastIndex = tokenRegex.lastIndex;

    const tag = match[1].toLowerCase();
    const inner = match[2];

    if (tag.startsWith('h')) {
      const lvlNum = Number(tag.slice(1));
      const level = (lvlNum <= 1 ? 1 : lvlNum === 2 ? 2 : 3) as 1 | 2 | 3;
      const text = stripTags(inner);
      if (text) blocks.push({ type: 'heading', level, text });
      orderedCounter = 1;
    } else if (tag === 'p' || tag === 'blockquote') {
      const text = stripTags(inner);
      if (text) blocks.push({ type: 'paragraph', text });
      orderedCounter = 1;
    } else if (tag === 'li') {
      const text = stripTags(inner);
      if (text) {
        blocks.push({ type: 'list-item', text, ordered: false, index: orderedCounter++ });
      }
    } else if (tag === 'pre') {
      const text = decodeXmlEntities(inner.replace(/<[^>]+>/g, '')).trim();
      if (text) blocks.push({ type: 'code', text });
      orderedCounter = 1;
    } else if (tag === 'table') {
      const rows: string[][] = [];
      const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch: RegExpExecArray | null;
      while ((rowMatch = rowRegex.exec(inner)) !== null) {
        const rowCells: string[] = [];
        const cellRegex = /<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi;
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          rowCells.push(stripTags(cellMatch[2]));
        }
        if (rowCells.length > 0) rows.push(rowCells);
      }
      if (rows.length > 0) {
        blocks.push({ type: 'table', rows, hasHeader: /<th\b/i.test(inner) });
      }
      orderedCounter = 1;
    }
  }

  if (lastIndex < cleaned.length) {
    const trailing = stripTags(cleaned.slice(lastIndex));
    if (trailing) {
      for (const line of trailing.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  }

  if (blocks.length === 0) {
    const plain = stripTags(cleaned);
    if (plain) {
      for (const line of plain.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
  }

  return blocks;
}

export async function parseDocxToHtmlAndBlocks(bytes: Uint8Array): Promise<{
  html: string;
  blocks: StructuredBlock[];
  warnings: string[];
}> {
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const result = await mammoth.convertToHtml({
    arrayBuffer: arrayBuffer as ArrayBuffer,
    buffer: bytes as any,
  } as any);
  const html = result.value || '';
  const blocks = htmlToStructuredBlocks(html);
  const warnings = (result.messages || []).map((m) => m.message).filter(Boolean);
  return { html, blocks, warnings };
}

export interface ParsedSpreadsheet {
  sheetNames: string[];
  sheets: Record<string, string[][]>;
  jsonSheets: Record<string, Record<string, unknown>[]>;
}

export function parseSpreadsheetBytes(bytes: Uint8Array, isCsv = false): ParsedSpreadsheet {
  let workbook: XLSX.WorkBook;
  if (isCsv) {
    const text = new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
    workbook = XLSX.read(text, { type: 'string' });
  } else {
    workbook = XLSX.read(bytes, { type: 'array' });
  }

  const sheetNames = workbook.SheetNames || [];
  const sheets: Record<string, string[][]> = {};
  const jsonSheets: Record<string, Record<string, unknown>[]> = {};

  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' });
    sheets[name] = aoa.map((row) =>
      Array.isArray(row) ? row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))) : []
    );
    jsonSheets[name] = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  }

  return { sheetNames, sheets, jsonSheets };
}

export interface ParsedSlide {
  slideNumber: number;
  title: string;
  bodyItems: string[];
  tables: string[][][];
  notes?: string;
  images: Array<{ name: string; bytes: Uint8Array; mime: string }>;
}

function extractXmlTextRuns(xmlFragment: string): string[] {
  const paragraphs: string[] = [];
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pRegex.exec(xmlFragment)) !== null) {
    const tRegex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/gi;
    let tMatch: RegExpExecArray | null;
    let line = '';
    while ((tMatch = tRegex.exec(pMatch[1])) !== null) {
      line += decodeXmlEntities(tMatch[1]);
    }
    if (line.trim()) {
      paragraphs.push(line.trim());
    }
  }
  return paragraphs;
}

export async function parsePptxSlides(bytes: Uint8Array): Promise<{
  slides: ParsedSlide[];
  slideWidthPx: number;
  slideHeightPx: number;
}> {
  const zip = await JSZip.loadAsync(bytes);

  // Determine slide dimensions from ppt/presentation.xml (default 16:9 1280x720)
  let slideWidthPx = 1280;
  let slideHeightPx = 720;
  const presXmlFile = zip.file('ppt/presentation.xml');
  if (presXmlFile) {
    const presXml = await presXmlFile.async('string');
    const szMatch = /<p:sldSz\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/i.exec(presXml);
    if (szMatch) {
      const cx = Number(szMatch[1]);
      const cy = Number(szMatch[2]);
      if (cx > 0 && cy > 0) {
        slideWidthPx = 1280;
        slideHeightPx = Math.round((cy / cx) * 1280);
      }
    }
  }

  // Gather slide XML paths sorted numerically
  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return na - nb;
    });

  if (slidePaths.length === 0) {
    throw new Error('No slides found inside PPTX archive (missing ppt/slides/slide*.xml).');
  }

  const slides: ParsedSlide[] = [];

  for (let idx = 0; idx < slidePaths.length; idx++) {
    const slidePath = slidePaths[idx];
    const slideNum = parseInt(slidePath.match(/slide(\d+)\.xml/i)?.[1] || String(idx + 1), 10);
    const xml = await zip.file(slidePath)!.async('string');

    let title = '';
    const bodyItems: string[] = [];
    const tables: string[][][] = [];

    // Extract shapes <p:sp>
    const spRegex = /<p:sp\b[^>]*>([\s\S]*?)<\/p:sp>/gi;
    let spMatch: RegExpExecArray | null;
    while ((spMatch = spRegex.exec(xml)) !== null) {
      const spXml = spMatch[1];
      const isTitle = /type="(?:title|ctrTitle)"/i.test(spXml);
      const runs = extractXmlTextRuns(spXml);
      if (runs.length === 0) continue;
      if (isTitle && !title) {
        title = runs.join(' ');
      } else {
        bodyItems.push(...runs);
      }
    }

    // Fallback if no explicit title placeholder
    if (!title && bodyItems.length > 0) {
      title = bodyItems.shift()!;
    }

    // Extract tables <a:tbl>
    const tblRegex = /<a:tbl\b[^>]*>([\s\S]*?)<\/a:tbl>/gi;
    let tblMatch: RegExpExecArray | null;
    while ((tblMatch = tblRegex.exec(xml)) !== null) {
      const rows: string[][] = [];
      const trRegex = /<a:tr\b[^>]*>([\s\S]*?)<\/a:tr>/gi;
      let trMatch: RegExpExecArray | null;
      while ((trMatch = trRegex.exec(tblMatch[1])) !== null) {
        const rowCells: string[] = [];
        const tcRegex = /<a:tc\b[^>]*>([\s\S]*?)<\/a:tc>/gi;
        let tcMatch: RegExpExecArray | null;
        while ((tcMatch = tcRegex.exec(trMatch[1])) !== null) {
          rowCells.push(extractXmlTextRuns(tcMatch[1]).join(' '));
        }
        if (rowCells.length > 0) rows.push(rowCells);
      }
      if (rows.length > 0) tables.push(rows);
    }

    // Check speaker notes
    let notes = '';
    const notesPath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    const notesFile = zip.file(notesPath);
    if (notesFile) {
      const notesXml = await notesFile.async('string');
      notes = extractXmlTextRuns(notesXml).join(' ');
    }

    // Check slide relationships for embedded images
    const images: Array<{ name: string; bytes: Uint8Array; mime: string }> = [];
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsFile = zip.file(relsPath);
    if (relsFile) {
      const relsXml = await relsFile.async('string');
      const targetRegex = /Target="([^"]*\/media\/[^"]+)"/gi;
      let tMatch: RegExpExecArray | null;
      while ((tMatch = targetRegex.exec(relsXml)) !== null) {
        const rawTarget = tMatch[1].replace(/^\.\.\//, 'ppt/');
        const mediaPath = rawTarget.startsWith('ppt/') ? rawTarget : `ppt/${rawTarget}`;
        const mediaFile = zip.file(mediaPath);
        if (mediaFile) {
          const imgBytes = await mediaFile.async('uint8array');
          const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png';
          const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
          images.push({ name: mediaPath.split('/').pop() || 'image', bytes: imgBytes, mime });
        }
      }
    }

    slides.push({
      slideNumber: idx + 1,
      title: title || `Slide ${idx + 1}`,
      bodyItems,
      tables,
      notes: notes || undefined,
      images,
    });
  }

  return { slides, slideWidthPx, slideHeightPx };
}

function extractOdfInlineText(xml: string): string {
  return decodeXmlEntities(
    xml
      .replace(/<text:line-break\s*\/?>/gi, '\n')
      .replace(/<text:tab\s*\/?>/gi, '  ')
      .replace(/<text:s\b[^>]*\/>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  ).replace(/[ \t]+/g, ' ').trim();
}

export async function parseOdtContent(bytes: Uint8Array): Promise<StructuredBlock[]> {
  const zip = await JSZip.loadAsync(bytes);
  const contentFile = zip.file('content.xml');
  if (!contentFile) {
    throw new Error('Invalid ODT file: missing content.xml inside OpenDocument archive.');
  }
  const xml = await contentFile.async('string');
  const blocks: StructuredBlock[] = [];

  const blockRegex = /<(text:h|text:p|table:table)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xml)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const inner = match[3];

    if (tag === 'text:h') {
      const lvlMatch = /text:outline-level="(\d+)"/i.exec(attrs);
      const lvlNum = lvlMatch ? Number(lvlMatch[1]) : 1;
      const level = (lvlNum <= 1 ? 1 : lvlNum === 2 ? 2 : 3) as 1 | 2 | 3;
      const text = extractOdfInlineText(inner);
      if (text) blocks.push({ type: 'heading', level, text });
    } else if (tag === 'text:p') {
      const text = extractOdfInlineText(inner);
      if (text) blocks.push({ type: 'paragraph', text });
    } else if (tag === 'table:table') {
      const rows: string[][] = [];
      const rowRegex = /<table:table-row\b[^>]*>([\s\S]*?)<\/table:table-row>/gi;
      let rMatch: RegExpExecArray | null;
      while ((rMatch = rowRegex.exec(inner)) !== null) {
        const rowCells: string[] = [];
        const cellRegex = /<table:table-cell\b[^>]*>([\s\S]*?)<\/table:table-cell>/gi;
        let cMatch: RegExpExecArray | null;
        while ((cMatch = cellRegex.exec(rMatch[1])) !== null) {
          rowCells.push(extractOdfInlineText(cMatch[1]));
        }
        if (rowCells.length > 0) rows.push(rowCells);
      }
      if (rows.length > 0) {
        blocks.push({ type: 'table', rows, hasHeader: true });
      }
    }
  }

  return blocks;
}

export async function parseOdpSlides(bytes: Uint8Array): Promise<ParsedSlide[]> {
  const zip = await JSZip.loadAsync(bytes);
  const contentFile = zip.file('content.xml');
  if (!contentFile) {
    throw new Error('Invalid ODP file: missing content.xml inside OpenDocument presentation archive.');
  }
  const xml = await contentFile.async('string');
  const slides: ParsedSlide[] = [];

  const pageRegex = /<draw:page\b[^>]*>([\s\S]*?)<\/draw:page>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pageRegex.exec(xml)) !== null) {
    idx++;
    const pageXml = match[1];
    // Separate presentation notes if embedded inside <presentation:notes>
    const notesMatch = /<presentation:notes\b[^>]*>([\s\S]*?)<\/presentation:notes>/i.exec(pageXml);
    const notesText = notesMatch ? extractOdfInlineText(notesMatch[1]) : undefined;
    const bodyXml = pageXml.replace(/<presentation:notes\b[^>]*>[\s\S]*?<\/presentation:notes>/gi, '');

    let title = '';
    const bodyItems: string[] = [];
    const tables: string[][][] = [];

    const frameRegex = /<draw:frame\b([^>]*)>([\s\S]*?)<\/draw:frame>/gi;
    let fMatch: RegExpExecArray | null;
    while ((fMatch = frameRegex.exec(bodyXml)) !== null) {
      const attrs = fMatch[1];
      const inner = fMatch[2];
      const isTitle = /presentation:class="(?:title|subtitle)"/i.test(attrs) && !title;

      // Check table inside frame
      const tblMatch = /<table:table\b[^>]*>([\s\S]*?)<\/table:table>/i.exec(inner);
      if (tblMatch) {
        const rows: string[][] = [];
        const rRegex = /<table:table-row\b[^>]*>([\s\S]*?)<\/table:table-row>/gi;
        let rm: RegExpExecArray | null;
        while ((rm = rRegex.exec(tblMatch[1])) !== null) {
          const cells: string[] = [];
          const cRegex = /<table:table-cell\b[^>]*>([\s\S]*?)<\/table:table-cell>/gi;
          let cm: RegExpExecArray | null;
          while ((cm = cRegex.exec(rm[1])) !== null) {
            cells.push(extractOdfInlineText(cm[1]));
          }
          if (cells.length) rows.push(cells);
        }
        if (rows.length) tables.push(rows);
        continue;
      }

      const pRegex = /<(?:text:p|text:h)\b[^>]*>([\s\S]*?)<\/(?:text:p|text:h)>/gi;
      let pm: RegExpExecArray | null;
      const texts: string[] = [];
      while ((pm = pRegex.exec(inner)) !== null) {
        const t = extractOdfInlineText(pm[1]);
        if (t) texts.push(t);
      }
      if (texts.length > 0) {
        if (isTitle) {
          title = texts.join(' ');
        } else {
          bodyItems.push(...texts);
        }
      }
    }

    if (!title && bodyItems.length > 0) {
      title = bodyItems.shift()!;
    }

    slides.push({
      slideNumber: idx,
      title: title || `Slide ${idx}`,
      bodyItems,
      tables,
      notes: notesText || undefined,
      images: [],
    });
  }

  if (slides.length === 0) {
    throw new Error('No presentation slides (<draw:page>) found in ODP document.');
  }

  return slides;
}

export function parseRtfToBlocks(rtfInput: string): StructuredBlock[] {
  const destinationsToSkip = new Set([
    'fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'object',
    'header', 'footer', 'headerl', 'headerr', 'headerf',
    'footerl', 'footerr', 'footerf', 'fldinst', 'xmlopen', 'latentstyles',
    'datastore', 'themedata', 'colorschememapping', 'rsidtbl', 'listtable', 'listoverridetable'
  ]);

  interface RtfGroupState {
    uc: number;
    skipGroup: boolean;
    bold: boolean;
  }

  const stack: RtfGroupState[] = [];
  let current: RtfGroupState = { uc: 1, skipGroup: false, bold: false };
  let output = '';
  let i = 0;
  let skipChars = 0;

  while (i < rtfInput.length) {
    const ch = rtfInput[i];

    if (ch === '{') {
      stack.push({ ...current });
      i++;
      continue;
    }

    if (ch === '}') {
      const prev = stack.pop();
      if (prev) current = prev;
      i++;
      continue;
    }

    if (ch === '\\') {
      i++;
      if (i >= rtfInput.length) break;
      const next = rtfInput[i];

      // Ignorable destination marker \*
      if (next === '*') {
        current.skipGroup = true;
        i++;
        continue;
      }

      // Escaped literal characters \{ \} \\
      if (next === '\\' || next === '{' || next === '}') {
        if (!current.skipGroup) output += next;
        i++;
        continue;
      }

      // Line/non-breaking special escapes
      if (next === '~') {
        if (!current.skipGroup) output += ' ';
        i++;
        continue;
      }
      if (next === '_' || next === '-') {
        if (!current.skipGroup) output += '-';
        i++;
        continue;
      }

      // Hex escape \'hh
      if (next === "'") {
        const hex = rtfInput.slice(i + 1, i + 3);
        const code = parseInt(hex, 16);
        if (!current.skipGroup && Number.isFinite(code)) {
          output += String.fromCharCode(code);
        }
        i += 3;
        continue;
      }

      // Control word: letters followed by optional signed integer + optional single space delimiter
      const cwMatch = /^([a-zA-Z]+)(-?\d+)? ?/.exec(rtfInput.slice(i));
      if (cwMatch) {
        const word = cwMatch[1];
        const param = cwMatch[2] !== undefined ? parseInt(cwMatch[2], 10) : null;
        i += cwMatch[0].length;

        if (destinationsToSkip.has(word)) {
          current.skipGroup = true;
          continue;
        }
        if (current.skipGroup) continue;

        if (word === 'uc' && param !== null) {
          current.uc = Math.max(0, param);
        } else if (word === 'u' && param !== null) {
          const codePoint = param < 0 ? 65536 + param : param;
          output += String.fromCharCode(codePoint);
          skipChars = current.uc;
        } else if (word === 'par' || word === 'line') {
          output += '\n';
        } else if (word === 'tab') {
          output += '\t';
        } else if (word === 'emdash') {
          output += '—';
        } else if (word === 'endash') {
          output += '–';
        } else if (word === 'lquote' || word === 'rquote') {
          output += "'";
        } else if (word === 'ldblquote' || word === 'rdblquote') {
          output += '"';
        } else if (word === 'bullet') {
          output += '• ';
        } else if (word === 'b') {
          current.bold = param !== 0;
        }
        continue;
      }

      i++;
      continue;
    }

    if (ch === '\r' || ch === '\n') {
      i++;
      continue;
    }

    if (!current.skipGroup) {
      if (skipChars > 0) {
        skipChars--;
      } else {
        output += ch;
      }
    }
    i++;
  }

  const lines = output.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const blocks: StructuredBlock[] = lines.map((line, idx) => {
    if (idx === 0 && line.length < 90 && !line.endsWith('.')) {
      return { type: 'heading', level: 1, text: line };
    }
    if (line.startsWith('• ')) {
      return { type: 'list-item', text: line.slice(2).trim(), ordered: false };
    }
    return { type: 'paragraph', text: line };
  });

  return blocks;
}
