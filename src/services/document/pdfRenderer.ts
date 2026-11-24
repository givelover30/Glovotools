import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from '@cantoo/pdf-lib';
import { ConversionOptions, MarginPreset, PageSizePreset, ProgressCallback, StructuredBlock } from './types.ts';

const PAGE_DIMENSIONS: Record<PageSizePreset, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

const MARGIN_POINTS: Record<MarginPreset, number> = {
  narrow: 36,
  normal: 54,
  wide: 72,
};

const UNICODE_TRANSLITERATION: Record<string, string> = {
  'ł': 'l', 'Ł': 'L',
  'ą': 'a', 'Ą': 'A',
  'ć': 'c', 'Ć': 'C',
  'ę': 'e', 'Ę': 'E',
  'ń': 'n', 'Ń': 'N',
  'ś': 's', 'Ś': 'S',
  'ź': 'z', 'Ź': 'Z',
  'ż': 'z', 'Ż': 'Z',
  'ß': 'ss', '€': 'EUR',
  '→': '->', '←': '<-', '↔': '<->',
  '•': '*', '–': '-', '—': '-',
  '“': '"', '”': '"', '‘': "'", '’': "'",
  '…': '...', '°': ' deg', '±': '+/-',
  '×': 'x', '÷': '/', '≤': '<=', '≥': '>=', '≠': '!='
};

function toWinAnsiSafe(text: string, font: PDFFont): string {
  try {
    font.encodeText(text);
    return text;
  } catch {
    let out = '';
    for (const ch of text) {
      if (UNICODE_TRANSLITERATION[ch]) {
        out += UNICODE_TRANSLITERATION[ch];
        continue;
      }
      try {
        font.encodeText(ch);
        out += ch;
      } catch {
        // Strip combining marks (accents) and try ASCII fallback
        const stripped = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        try {
          if (stripped) {
            font.encodeText(stripped);
            out += stripped;
          } else {
            out += '?';
          }
        } catch {
          out += '?';
        }
      }
    }
    return out;
  }
}

function canEncodeDirect(text: string, font: PDFFont): boolean {
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

async function renderUnicodeLineToPng(
  text: string,
  fontSize: number,
  bold: boolean,
  colorHex: string,
  maxWidthPt: number
): Promise<{ bytes: Uint8Array; widthPt: number; heightPt: number } | null> {
  if (typeof document === 'undefined') return null;
  const scale = 2.5;
  const canvas = document.createElement('canvas');
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fontSpec = `${bold ? 'bold ' : ''}${fontSize * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif`;
    ctx.font = fontSpec;
    const measured = ctx.measureText(text);
    const wPx = Math.min(Math.ceil(maxWidthPt * scale), Math.max(16, Math.ceil(measured.width + 8)));
    const hPx = Math.max(16, Math.ceil(fontSize * 1.45 * scale));

    canvas.width = wPx;
    canvas.height = hPx;
    const ctx2 = canvas.getContext('2d');
    if (!ctx2) return null;
    ctx2.font = fontSpec;
    ctx2.fillStyle = colorHex;
    ctx2.textBaseline = 'middle';
    ctx2.fillText(text, 0, hPx / 2, wPx);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return {
      bytes,
      widthPt: wPx / scale,
      heightPt: hPx / scale,
    };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

function wrapTextLines(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const safeMeasure = (s: string): number => {
    try {
      return font.widthOfTextAtSize(toWinAnsiSafe(s, font), fontSize);
    } catch {
      return s.length * fontSize * 0.52;
    }
  };

  const paragraphs = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const allLines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      allLines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (safeMeasure(candidate) <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          allLines.push(currentLine);
          currentLine = '';
        }
        // Handle ultra-long unbreakable words
        if (safeMeasure(word) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (safeMeasure(chunk + ch) > maxWidth && chunk) {
              allLines.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          currentLine = chunk;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

export async function renderBlocksToPdf(
  blocks: StructuredBlock[],
  options: ConversionOptions = {},
  docTitle?: string,
  onProgress?: ProgressCallback
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const pageSizePreset = options.pageSize || 'A4';
  const orientation = options.orientation || 'portrait';
  const marginPreset = options.margins || 'normal';
  const baseFontSize = options.fontSize || 10.5;

  const [rawW, rawH] = PAGE_DIMENSIONS[pageSizePreset] || PAGE_DIMENSIONS.A4;
  const pageWidth = orientation === 'landscape' ? rawH : rawW;
  const pageHeight = orientation === 'landscape' ? rawW : rawH;
  const margin = MARGIN_POINTS[marginPreset] ?? MARGIN_POINTS.normal;
  const contentWidth = Math.max(120, pageWidth - margin * 2);

  const pdfDoc = await PDFDocument.create();
  if (docTitle) pdfDoc.setTitle(docTitle);
  pdfDoc.setCreator('CalcTools Document Conversion Engine');

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  let page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  const newPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    cursorY = pageHeight - margin;
  };

  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight < margin) {
      newPage();
    }
  };

  const drawTextSmart = async (
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color = rgb(0.12, 0.14, 0.18),
    colorHex = '#1F242E',
    maxWidth = contentWidth
  ) => {
    if (!text) return;
    if (canEncodeDirect(text, font)) {
      page.drawText(text, { x, y, size, font, color });
      return;
    }
    // Browser Unicode raster fallback so non-WinAnsi characters render crisply
    const png = await renderUnicodeLineToPng(text, size, font === boldFont, colorHex, maxWidth);
    if (png) {
      const img = await pdfDoc.embedPng(png.bytes);
      page.drawImage(img, {
        x,
        y: y - size * 0.2,
        width: png.widthPt,
        height: png.heightPt,
      });
    } else {
      page.drawText(toWinAnsiSafe(text, font), { x, y, size, font, color });
    }
  };

  const totalBlocks = Math.max(1, blocks.length);

  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block = blocks[bIdx];
    if (bIdx % 10 === 0) {
      onProgress?.(55 + Math.round((bIdx / totalBlocks) * 35), `Rendering PDF layout (${bIdx + 1}/${totalBlocks})...`);
    }

    if (block.type === 'page-break') {
      newPage();
      continue;
    }

    if (block.type === 'heading') {
      const size = block.level === 1 ? baseFontSize + 7 : block.level === 2 ? baseFontSize + 4 : baseFontSize + 2;
      const lineHeight = size * 1.38;
      const lines = wrapTextLines(block.text, contentWidth, boldFont, size);
      cursorY -= block.level === 1 ? 8 : 5;
      ensureSpace(lines.length * lineHeight + 6);
      for (const line of lines) {
        await drawTextSmart(
          line,
          margin,
          cursorY - size,
          size,
          boldFont,
          rgb(0.06, 0.09, 0.16),
          '#0F172A'
        );
        cursorY -= lineHeight;
      }
      if (block.level === 1) {
        page.drawLine({
          start: { x: margin, y: cursorY + 2 },
          end: { x: pageWidth - margin, y: cursorY + 2 },
          thickness: 0.75,
          color: rgb(0.82, 0.85, 0.89),
        });
        cursorY -= 6;
      } else {
        cursorY -= 3;
      }
      continue;
    }

    if (block.type === 'paragraph') {
      const font = block.bold ? boldFont : regularFont;
      const size = baseFontSize;
      const lineHeight = size * 1.45;
      const lines = wrapTextLines(block.text, contentWidth, font, size);
      for (const line of lines) {
        ensureSpace(lineHeight);
        if (line.length > 0) {
          await drawTextSmart(line, margin, cursorY - size, size, font);
        }
        cursorY -= lineHeight;
      }
      cursorY -= 4;
      continue;
    }

    if (block.type === 'list-item') {
      const size = baseFontSize;
      const lineHeight = size * 1.42;
      const prefix = block.ordered && block.index ? `${block.index}. ` : '• ';
      const indent = 14;
      const lines = wrapTextLines(block.text, contentWidth - indent, regularFont, size);
      for (let li = 0; li < lines.length; li++) {
        ensureSpace(lineHeight);
        if (li === 0) {
          await drawTextSmart(prefix, margin, cursorY - size, size, boldFont);
        }
        await drawTextSmart(lines[li], margin + indent, cursorY - size, size, regularFont, rgb(0.12, 0.14, 0.18), '#1F242E', contentWidth - indent);
        cursorY -= lineHeight;
      }
      cursorY -= 2;
      continue;
    }

    if (block.type === 'code') {
      const size = Math.max(8, baseFontSize - 1.5);
      const lineHeight = size * 1.38;
      const lines = wrapTextLines(block.text, contentWidth - 16, monoFont, size);
      for (const line of lines) {
        ensureSpace(lineHeight + 4);
        page.drawRectangle({
          x: margin,
          y: cursorY - lineHeight,
          width: contentWidth,
          height: lineHeight,
          color: rgb(0.95, 0.96, 0.97),
        });
        await drawTextSmart(line, margin + 8, cursorY - size - 1, size, monoFont, rgb(0.15, 0.18, 0.25), '#262E40', contentWidth - 16);
        cursorY -= lineHeight;
      }
      cursorY -= 6;
      continue;
    }

    if (block.type === 'table') {
      const rows = block.rows;
      if (!rows || rows.length === 0) continue;
      const numCols = Math.max(1, ...rows.map((r) => r.length));
      const colWidth = contentWidth / numCols;
      const cellPadX = 5;
      const cellPadY = 4;
      const cellFontSize = Math.max(7.5, Math.min(9.5, baseFontSize - 1, colWidth > 45 ? 9 : 7.5));
      const lineHeight = cellFontSize * 1.3;

      const drawTableRow = async (row: string[], isHeader: boolean) => {
        const wrappedCells = new Array<string[]>(numCols);
        let maxLines = 1;
        for (let c = 0; c < numCols; c++) {
          const val = String(row[c] ?? '');
          const font = isHeader ? boldFont : regularFont;
          const lines = wrapTextLines(val, Math.max(20, colWidth - cellPadX * 2), font, cellFontSize);
          wrappedCells[c] = lines.length ? lines : [''];
          if (wrappedCells[c].length > maxLines) maxLines = wrappedCells[c].length;
        }
        const rowHeight = maxLines * lineHeight + cellPadY * 2;
        if (cursorY - rowHeight < margin) {
          newPage();
          if (!isHeader && block.hasHeader && rows.length > 0) {
            await drawTableRow(rows[0], true);
          }
        }

        // Row background & borders
        for (let c = 0; c < numCols; c++) {
          const cellX = margin + c * colWidth;
          page.drawRectangle({
            x: cellX,
            y: cursorY - rowHeight,
            width: colWidth,
            height: rowHeight,
            color: isHeader ? rgb(0.93, 0.95, 0.98) : rgb(1, 1, 1),
            borderColor: rgb(0.8, 0.84, 0.89),
            borderWidth: 0.6,
          });

          const cellLines = wrappedCells[c];
          const font = isHeader ? boldFont : regularFont;
          for (let lIdx = 0; lIdx < cellLines.length; lIdx++) {
            const textY = cursorY - cellPadY - cellFontSize - lIdx * lineHeight;
            await drawTextSmart(
              cellLines[lIdx],
              cellX + cellPadX,
              textY,
              cellFontSize,
              font,
              isHeader ? rgb(0.06, 0.1, 0.2) : rgb(0.15, 0.18, 0.24),
              isHeader ? '#0F1A33' : '#262E3D',
              colWidth - cellPadX * 2
            );
          }
        }
        cursorY -= rowHeight;
      };

      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        await drawTableRow(rows[rIdx], Boolean(block.hasHeader && rIdx === 0));
      }
      cursorY -= 8;
      continue;
    }

    if (block.type === 'slide') {
      // If not at top of a fresh page, start a new page for each slide (except first empty page)
      if (bIdx > 0 || cursorY < pageHeight - margin - 10) {
        newPage();
      }

      // Slide header bar
      const headerHeight = 46;
      page.drawRectangle({
        x: margin,
        y: cursorY - headerHeight,
        width: contentWidth,
        height: headerHeight,
        color: rgb(0.96, 0.97, 0.99),
        borderColor: rgb(0.84, 0.87, 0.92),
        borderWidth: 0.8,
      });
      await drawTextSmart(
        `Slide ${block.slideNumber}: ${block.title || 'Untitled Slide'}`,
        margin + 12,
        cursorY - 29,
        baseFontSize + 5,
        boldFont,
        rgb(0.07, 0.11, 0.22),
        '#121C38',
        contentWidth - 24
      );
      cursorY -= headerHeight + 16;

      for (const item of block.bodyItems) {
        const size = baseFontSize + 0.5;
        const lineHeight = size * 1.45;
        const lines = wrapTextLines(item, contentWidth - 18, regularFont, size);
        for (let li = 0; li < lines.length; li++) {
          ensureSpace(lineHeight);
          if (li === 0) {
            await drawTextSmart('•', margin + 2, cursorY - size, size, boldFont);
          }
          await drawTextSmart(lines[li], margin + 16, cursorY - size, size, regularFont, rgb(0.12, 0.15, 0.2), '#1F2633', contentWidth - 18);
          cursorY -= lineHeight;
        }
        cursorY -= 4;
      }

      if (block.tables && block.tables.length > 0) {
        for (const tbl of block.tables) {
          const subBlocks: StructuredBlock[] = [{ type: 'table', rows: tbl, hasHeader: true }];
          // Inline simple table render using recursive paragraph/table logic
          for (const row of tbl) {
            const rowText = row.join(' | ');
            const lines = wrapTextLines(rowText, contentWidth - 12, regularFont, baseFontSize - 1);
            for (const l of lines) {
              ensureSpace(baseFontSize * 1.4);
              await drawTextSmart(l, margin + 6, cursorY - baseFontSize, baseFontSize - 1, regularFont);
              cursorY -= baseFontSize * 1.4;
            }
          }
          void subBlocks;
        }
      }

      if (block.notes && block.notes.trim()) {
        cursorY -= 10;
        ensureSpace(32);
        await drawTextSmart('Speaker Notes:', margin, cursorY - baseFontSize, baseFontSize - 1, boldFont, rgb(0.35, 0.4, 0.48), '#59667A');
        cursorY -= baseFontSize * 1.4;
        const noteLines = wrapTextLines(block.notes.trim(), contentWidth, regularFont, baseFontSize - 1);
        for (const nl of noteLines) {
          ensureSpace(baseFontSize * 1.35);
          await drawTextSmart(nl, margin, cursorY - baseFontSize, baseFontSize - 1, regularFont, rgb(0.35, 0.4, 0.48), '#59667A');
          cursorY -= baseFontSize * 1.35;
        }
      }
    }
  }

  // Optional footer page numbers
  const pages = pdfDoc.getPages();
  if (options.includePageHeaders !== false && pages.length > 1) {
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const { width } = p.getSize();
      p.drawText(`Page ${i + 1} of ${pages.length}`, {
        x: width - margin - 65,
        y: Math.max(16, margin - 24),
        size: 8.5,
        font: regularFont,
        color: rgb(0.45, 0.5, 0.58),
      });
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return { bytes: pdfBytes, pageCount: pdfDoc.getPageCount() };
}
