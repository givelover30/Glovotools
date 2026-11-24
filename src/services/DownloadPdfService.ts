import type { Language } from '../i18n/translations.ts';

export interface PdfReportInputRow {
  label: string;
  value: string;
}

export interface PdfReportPrimaryCard {
  label?: string;
  value: string;
  unit?: string;
  statusBadge?: string;
  subtext?: string;
}

export interface PdfReportMetricCard {
  label: string;
  value: string;
  hint?: string;
}

export interface PdfReportBreakdownItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface PdfReportChartItem {
  title?: string;
  /** Direct PNG data URL (e.g. from <canvas>) */
  pngDataUrl?: string;
  /** Serialized SVG markup rasterized to 2x HiDPI PNG before embedding */
  svgMarkup?: string;
  width: number;
  height: number;
}

export interface PdfReportTable {
  title?: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
}

export interface PdfReportNote {
  title?: string;
  text: string;
  mono?: boolean;
}

export interface PrintableReportData {
  calculatorName: string;
  categoryLine: string;
  subtitle: string;
  generatedOnLabel: string;
  timestamp: string;
  inputsHeading: string;
  resultsHeading: string;
  footerText: string;
  language: Language;
  inputs: PdfReportInputRow[];
  primaryCard?: PdfReportPrimaryCard;
  metrics: PdfReportMetricCard[];
  breakdowns: PdfReportBreakdownItem[];
  charts: PdfReportChartItem[];
  tables: PdfReportTable[];
  notes: PdfReportNote[];
  /** Fallback text blocks if a specialized tool renders unstructured output */
  fallbackParagraphs: string[];
}

export interface DownloadPdfResult {
  filename: string;
  byteLength: number;
  mimeType: 'application/pdf';
}

const UNICODE_REPLACEMENTS: Record<string, string> = {
  '\u2013': '-',
  '\u2014': '-',
  '\u2212': '-',
  '\u00D7': 'x',
  '\u00F7': '/',
  '\u2022': '-',
  '\u00B7': ' | ',
  '\u2026': '...',
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u00A0': ' ',
  '\u2009': ' ',
  '\u202F': ' ',
  '\u2264': '<=',
  '\u2265': '>=',
  '\u2260': '!=',
  '\u2248': '~=',
  '\u2192': '->',
  '\u2190': '<-',
  '\u2194': '<->',
  '\u2713': '[OK]',
  '\u2714': '[OK]',
  '\u221E': 'inf',
  '\u221A': 'sqrt',
  '\u03C0': 'pi',
  '\u03C1': 'rho',
  '\u03BC': 'u',
  '\u0394': 'Delta',
  '\u03A3': 'Sum',
  '\u03B8': 'theta',
  '\u03A9': 'Ohm',
  '\u20B9': 'INR ',
  '\u20A9': 'KRW ',
  '\u20BD': 'RUB ',
  '\u20BA': 'TRY ',
  '\u20B1': 'PHP ',
  '\u0E3F': 'THB ',
  '\u20AB': 'VND ',
  '\u00B2': '^2',
  '\u00B3': '^3',
  '\u2070': '^0',
  '\u00B9': '^1'
};

function sanitizePdfText(raw: string): string {
  if (!raw) return '';
  let out = raw.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
  for (const [key, replacement] of Object.entries(UNICODE_REPLACEMENTS)) {
    if (out.includes(key)) {
      out = out.split(key).join(replacement);
    }
  }
  let safe = '';
  for (let i = 0; i < out.length; i++) {
    const code = out.charCodeAt(i);
    if (
      code === 10 ||
      (code >= 32 && code <= 126) ||
      (code >= 160 && code <= 255) ||
      code === 0x20ac
    ) {
      safe += out[i];
    } else if (code >= 0x0100) {
      const decomposed = out[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (decomposed === 'ł') safe += 'l';
      else if (decomposed === 'Ł') safe += 'L';
      else if (decomposed && decomposed.charCodeAt(0) >= 32 && decomposed.charCodeAt(0) <= 126) {
        safe += decomposed[0];
      }
    }
  }
  return safe.replace(/[ ]{2,}/g, ' ').trim();
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array | null {
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = dataUrl.slice(commaIdx + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function rasterizeSvgToPngBytes(
  svgMarkup: string,
  width: number,
  height: number
): Promise<Uint8Array | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const targetW = Math.max(240, Math.min(900, Math.round(width || 540)));
  const targetH = Math.max(120, Math.min(540, Math.round(height || 240)));
  const scale = 2;

  let preparedSvg = svgMarkup.trim();
  if (!preparedSvg.includes('xmlns=')) {
    preparedSvg = preparedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  preparedSvg = preparedSvg.replace(/currentColor/g, '#334155');

  return new Promise((resolve) => {
    const svgBlob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    const finish = (result: Uint8Array | null) => {
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timeout = window.setTimeout(() => finish(null), 2500);

    img.onload = () => {
      window.clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetW * scale;
        canvas.height = targetH * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        finish(dataUrlToUint8Array(canvas.toDataURL('image/png')));
      } catch {
        finish(null);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timeout);
      finish(null);
    };

    img.src = url;
  });
}

function wrapTextLines(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  fontSize: number,
  maxWidth: number
): string[] {
  const clean = sanitizePdfText(text);
  if (!clean) return [];

  const paragraphs = clean.split('\n');
  const result: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      result.push('');
      continue;
    }

    const words = trimmed.split(/\s+/);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
      } else {
        if (current) result.push(current);
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
              chunk += ch;
            } else {
              if (chunk) result.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        } else {
          current = word;
        }
      }
    }
    if (current) result.push(current);
  }

  return result;
}

function isMostlyNumericColumn(rows: string[][], colIdx: number): boolean {
  let numericHits = 0;
  let total = 0;
  const sampleLimit = Math.min(rows.length, 12);
  for (let i = 0; i < sampleLimit; i++) {
    const cell = (rows[i]?.[colIdx] || '').trim();
    if (!cell) continue;
    total++;
    if (/^[\s$€£¥₹+\-.,0-9%()/]+$/.test(cell)) {
      numericHits++;
    }
  }
  return total > 0 && numericHits / total >= 0.7;
}

/**
 * Glovotools DownloadPdfService
 *
 * Captures the live calculator result state and renders a genuine, multi-page PDF
 * document using the installed `pdf-lib` dependency with Glovotools branding,
 * structured inputs, green result highlights, KPI tiles, breakdowns, HiDPI charts,
 * complete amortization schedules / tables with repeated headers, and Page X of Y footers.
 */
export const DownloadPdfService = {
  /**
   * Builds a clean, standardized PDF filename:
   * Glovotools_Loan_Mortgage_Calculator_2026-11-24.pdf
   */
  buildFileName(calculatorName: string, date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStamp = `${year}-${month}-${day}`;

    const cleanName = calculatorName
      .replace(/&/g, ' ')
      .replace(/[^a-zA-Z0-9\s]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_')
      .slice(0, 64);

    return `Glovotools_${cleanName || 'Calculation_Report'}_${dateStamp}.pdf`;
  },

  /**
   * Renders a multi-page PDF binary (Uint8Array) using `pdf-lib`.
   */
  async generatePdfBytes(data: PrintableReportData): Promise<Uint8Array> {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`${sanitizePdfText(data.calculatorName)} - Glovotools`);
    pdfDoc.setAuthor('Glovotools');
    pdfDoc.setCreator('Glovotools DownloadPdfService');
    pdfDoc.setProducer('Glovotools (pdf-lib)');
    pdfDoc.setSubject(sanitizePdfText(data.categoryLine || 'Calculation Report'));
    pdfDoc.setCreationDate(new Date());

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontMonoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

    const COLORS = {
      white: rgb(1, 1, 1),
      inkPrimary: rgb(0.059, 0.09, 0.165),
      inkSecondary: rgb(0.2, 0.255, 0.333),
      inkMuted: rgb(0.392, 0.455, 0.545),
      borderMain: rgb(0.796, 0.835, 0.882),
      borderSubtle: rgb(0.886, 0.91, 0.941),
      borderStrong: rgb(0.58, 0.639, 0.722),
      surfaceSubtle: rgb(0.973, 0.98, 0.988),
      tableHeaderBg: rgb(0.945, 0.961, 0.976),
      brandGreen: rgb(0.082, 0.608, 0.412),
      resultBg: rgb(0.941, 0.992, 0.957),
      resultBorder: rgb(0.525, 0.937, 0.675),
      resultText: rgb(0.024, 0.306, 0.231),
      resultSubtext: rgb(0.024, 0.373, 0.275),
      resultAccent: rgb(0.016, 0.471, 0.341),
      resultBadgeBg: rgb(0.863, 0.988, 0.906)
    };

    const PAGE_W = 612;
    const PAGE_H = 792;
    const MARGIN_X = 44;
    const MARGIN_TOP = 46;
    const MARGIN_BOTTOM = 54;
    const CONTENT_W = PAGE_W - MARGIN_X * 2;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let cursorY = PAGE_H - MARGIN_TOP;

    const startNewPage = () => {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      cursorY = PAGE_H - MARGIN_TOP;
    };

    const ensureSpace = (neededHeight: number) => {
      if (cursorY - neededHeight < MARGIN_BOTTOM) {
        startNewPage();
      }
    };

    const drawSafeText = (
      text: string,
      x: number,
      y: number,
      opts: {
        font?: typeof fontRegular;
        size?: number;
        color?: ReturnType<typeof rgb>;
      } = {}
    ) => {
      const clean = sanitizePdfText(text);
      if (!clean) return;
      page.drawText(clean, {
        x,
        y,
        font: opts.font ?? fontRegular,
        size: opts.size ?? 10,
        color: opts.color ?? COLORS.inkPrimary
      });
    };

    const drawRightText = (
      text: string,
      rightX: number,
      y: number,
      opts: {
        font?: typeof fontRegular;
        size?: number;
        color?: ReturnType<typeof rgb>;
      } = {}
    ) => {
      const clean = sanitizePdfText(text);
      if (!clean) return;
      const f = opts.font ?? fontRegular;
      const s = opts.size ?? 10;
      const w = f.widthOfTextAtSize(clean, s);
      page.drawText(clean, {
        x: Math.max(MARGIN_X, rightX - w),
        y,
        font: f,
        size: s,
        color: opts.color ?? COLORS.inkPrimary
      });
    };

    // 1. Branded Glovotools Header
    const logoSize = 24;
    const logoY = cursorY - logoSize + 4;

    page.drawRectangle({
      x: MARGIN_X,
      y: logoY,
      width: logoSize,
      height: logoSize,
      color: COLORS.brandGreen
    });
    page.drawLine({
      start: { x: MARGIN_X + 6, y: logoY + 16.5 },
      end: { x: MARGIN_X + 18, y: logoY + 16.5 },
      thickness: 2,
      color: COLORS.white
    });
    page.drawLine({
      start: { x: MARGIN_X + 6, y: logoY + 12 },
      end: { x: MARGIN_X + 14, y: logoY + 12 },
      thickness: 2,
      color: COLORS.white
    });
    page.drawLine({
      start: { x: MARGIN_X + 6, y: logoY + 7.5 },
      end: { x: MARGIN_X + 11.5, y: logoY + 7.5 },
      thickness: 2,
      color: COLORS.white
    });
    page.drawCircle({
      x: MARGIN_X + 16.5,
      y: logoY + 8,
      size: 2.2,
      color: COLORS.white
    });

    drawSafeText('Glovotools', MARGIN_X + logoSize + 9, cursorY - 9, {
      font: fontBold,
      size: 14,
      color: COLORS.inkPrimary
    });
    if (data.categoryLine) {
      drawSafeText(data.categoryLine, MARGIN_X + logoSize + 9, cursorY - 21, {
        font: fontRegular,
        size: 8.5,
        color: COLORS.inkMuted
      });
    }

    drawRightText(
      sanitizePdfText(data.generatedOnLabel || 'Calculated on').toUpperCase(),
      PAGE_W - MARGIN_X,
      cursorY - 8,
      { font: fontBold, size: 7.5, color: COLORS.inkMuted }
    );
    drawRightText(data.timestamp, PAGE_W - MARGIN_X, cursorY - 20, {
      font: fontBold,
      size: 9,
      color: COLORS.inkPrimary
    });

    cursorY -= 38;

    const titleLines = wrapTextLines(data.calculatorName, fontBold, 16.5, CONTENT_W);
    for (const line of titleLines) {
      drawSafeText(line, MARGIN_X, cursorY, {
        font: fontBold,
        size: 16.5,
        color: COLORS.inkPrimary
      });
      cursorY -= 20;
    }

    if (data.subtitle) {
      const subLines = wrapTextLines(data.subtitle, fontRegular, 9, CONTENT_W);
      for (const line of subLines) {
        drawSafeText(line, MARGIN_X, cursorY + 3, {
          font: fontRegular,
          size: 9,
          color: COLORS.inkMuted
        });
        cursorY -= 12.5;
      }
    }

    cursorY -= 4;
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY },
      end: { x: PAGE_W - MARGIN_X, y: cursorY },
      thickness: 1.5,
      color: COLORS.inkPrimary
    });
    cursorY -= 16;

    // 2. Input Values Summary Card
    if (data.inputs.length > 0) {
      const rowPairs = Math.ceil(data.inputs.length / 2);
      const rowH = 19;
      const boxPadY = 12;
      const headerH = 18;
      const boxH = boxPadY * 2 + headerH + rowPairs * rowH;

      ensureSpace(boxH + 10);

      const boxTop = cursorY;
      const boxBottom = boxTop - boxH;

      page.drawRectangle({
        x: MARGIN_X,
        y: boxBottom,
        width: CONTENT_W,
        height: boxH,
        color: COLORS.surfaceSubtle,
        borderColor: COLORS.borderMain,
        borderWidth: 0.85
      });

      const innerX = MARGIN_X + 12;
      const innerW = CONTENT_W - 24;
      let innerY = boxTop - boxPadY - 9;

      drawSafeText(
        sanitizePdfText(data.inputsHeading || 'Input Values').toUpperCase(),
        innerX,
        innerY,
        { font: fontBold, size: 8.5, color: COLORS.inkSecondary }
      );
      innerY -= 6;
      page.drawLine({
        start: { x: innerX, y: innerY },
        end: { x: innerX + innerW, y: innerY },
        thickness: 0.6,
        color: COLORS.borderSubtle
      });
      innerY -= 14;

      const colGap = 20;
      const colW = (innerW - colGap) / 2;

      for (let i = 0; i < data.inputs.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cellX = innerX + col * (colW + colGap);
        const cellY = innerY - row * rowH;
        const item = data.inputs[i];

        const cleanVal = sanitizePdfText(item.value);
        const valW = Math.min(colW * 0.55, fontMonoBold.widthOfTextAtSize(cleanVal, 8.8));
        const maxLabelW = Math.max(40, colW - valW - 10);

        let cleanLbl = sanitizePdfText(item.label);
        while (cleanLbl.length > 3 && fontRegular.widthOfTextAtSize(cleanLbl, 8.8) > maxLabelW) {
          cleanLbl = cleanLbl.slice(0, -2) + '...';
        }

        drawSafeText(cleanLbl, cellX, cellY, {
          font: fontRegular,
          size: 8.8,
          color: COLORS.inkSecondary
        });

        let truncVal = cleanVal;
        while (truncVal.length > 3 && fontMonoBold.widthOfTextAtSize(truncVal, 8.8) > colW * 0.58) {
          truncVal = truncVal.slice(0, -2) + '...';
        }
        drawRightText(truncVal, cellX + colW, cellY, {
          font: fontMonoBold,
          size: 8.8,
          color: COLORS.inkPrimary
        });

        page.drawLine({
          start: { x: cellX, y: cellY - 5 },
          end: { x: cellX + colW, y: cellY - 5 },
          thickness: 0.4,
          color: COLORS.borderSubtle
        });
      }

      cursorY = boxBottom - 14;
    }

    // 3. Main Calculation Result Card (Green Accent)
    if (data.primaryCard && data.primaryCard.value) {
      const pc = data.primaryCard;
      const valueText = sanitizePdfText(pc.unit ? `${pc.value} ${pc.unit}` : pc.value);
      const valFontSize = fontMonoBold.widthOfTextAtSize(valueText, 21) > CONTENT_W - 32 ? 15.5 : 21;
      const valueLines = wrapTextLines(valueText, fontMonoBold, valFontSize, CONTENT_W - 28);
      const subLines = pc.subtext
        ? wrapTextLines(pc.subtext, fontRegular, 8.8, CONTENT_W - 28)
        : [];

      const cardH =
        26 +
        (pc.label || pc.statusBadge ? 14 : 0) +
        valueLines.length * (valFontSize + 5) +
        subLines.length * 12 +
        (subLines.length > 0 ? 4 : 0);

      ensureSpace(cardH + 10);

      const cardTop = cursorY;
      const cardBottom = cardTop - cardH;

      page.drawRectangle({
        x: MARGIN_X,
        y: cardBottom,
        width: CONTENT_W,
        height: cardH,
        color: COLORS.resultBg,
        borderColor: COLORS.resultBorder,
        borderWidth: 1.25
      });

      let yPos = cardTop - 16;
      if (pc.label) {
        drawSafeText(pc.label, MARGIN_X + 14, yPos, {
          font: fontBold,
          size: 9,
          color: COLORS.resultSubtext
        });
      }

      if (pc.statusBadge) {
        const badgeText = sanitizePdfText(pc.statusBadge);
        const badgeW = fontBold.widthOfTextAtSize(badgeText, 8) + 14;
        const badgeX = PAGE_W - MARGIN_X - 14 - badgeW;
        page.drawRectangle({
          x: badgeX,
          y: yPos - 4,
          width: badgeW,
          height: 15,
          color: COLORS.resultBadgeBg,
          borderColor: COLORS.resultBorder,
          borderWidth: 0.6
        });
        drawSafeText(badgeText, badgeX + 7, yPos, {
          font: fontBold,
          size: 8,
          color: COLORS.resultText
        });
      }

      yPos -= pc.label || pc.statusBadge ? 24 : 10;

      for (const vLine of valueLines) {
        drawSafeText(vLine, MARGIN_X + 14, yPos, {
          font: fontMonoBold,
          size: valFontSize,
          color: COLORS.resultText
        });
        yPos -= valFontSize + 4;
      }

      if (subLines.length > 0) {
        yPos -= 2;
        for (const sLine of subLines) {
          drawSafeText(sLine, MARGIN_X + 14, yPos, {
            font: fontRegular,
            size: 8.8,
            color: COLORS.resultSubtext
          });
          yPos -= 12;
        }
      }

      cursorY = cardBottom - 14;
    }

    // 4. Secondary KPI Metric Cards Grid
    if (data.metrics.length > 0) {
      const cols = data.metrics.length >= 6 ? 3 : 2;
      const gap = 10;
      const tileW = (CONTENT_W - gap * (cols - 1)) / cols;
      const rowsCount = Math.ceil(data.metrics.length / cols);

      for (let r = 0; r < rowsCount; r++) {
        const rowTiles = data.metrics.slice(r * cols, r * cols + cols);
        const hasHint = rowTiles.some((t) => Boolean(t.hint));
        const tileH = hasHint ? 54 : 44;

        ensureSpace(tileH + 8);
        const rowTop = cursorY;
        const rowBottom = rowTop - tileH;

        rowTiles.forEach((tile, c) => {
          const x = MARGIN_X + c * (tileW + gap);
          page.drawRectangle({
            x,
            y: rowBottom,
            width: tileW,
            height: tileH,
            color: COLORS.surfaceSubtle,
            borderColor: COLORS.borderSubtle,
            borderWidth: 0.8
          });

          let lbl = sanitizePdfText(tile.label);
          while (lbl.length > 3 && fontRegular.widthOfTextAtSize(lbl, 8) > tileW - 18) {
            lbl = lbl.slice(0, -2) + '...';
          }
          drawSafeText(lbl, x + 9, rowTop - 13, {
            font: fontRegular,
            size: 8,
            color: COLORS.inkMuted
          });

          let val = sanitizePdfText(tile.value);
          const valSize = fontMonoBold.widthOfTextAtSize(val, 11.5) > tileW - 18 ? 9.5 : 11.5;
          while (val.length > 3 && fontMonoBold.widthOfTextAtSize(val, valSize) > tileW - 18) {
            val = val.slice(0, -2) + '...';
          }
          drawSafeText(val, x + 9, rowTop - 29, {
            font: fontMonoBold,
            size: valSize,
            color: COLORS.inkPrimary
          });

          if (tile.hint) {
            let hint = sanitizePdfText(tile.hint);
            while (hint.length > 3 && fontRegular.widthOfTextAtSize(hint, 7.5) > tileW - 18) {
              hint = hint.slice(0, -2) + '...';
            }
            drawSafeText(hint, x + 9, rowTop - 43, {
              font: fontRegular,
              size: 7.5,
              color: COLORS.inkMuted
            });
          }
        });

        cursorY = rowBottom - 8;
      }

      cursorY -= 6;
    }

    // 5. Calculation Breakdown Rows
    if (data.breakdowns.length > 0) {
      ensureSpace(32);
      drawSafeText('CALCULATION BREAKDOWN', MARGIN_X, cursorY, {
        font: fontBold,
        size: 8.5,
        color: COLORS.inkSecondary
      });
      cursorY -= 6;
      page.drawLine({
        start: { x: MARGIN_X, y: cursorY },
        end: { x: PAGE_W - MARGIN_X, y: cursorY },
        thickness: 0.9,
        color: COLORS.borderMain
      });
      cursorY -= 14;

      for (const item of data.breakdowns) {
        ensureSpace(20);
        const isHighlight = Boolean(item.highlight);
        drawSafeText(item.label, MARGIN_X + 2, cursorY, {
          font: isHighlight ? fontBold : fontRegular,
          size: 9.2,
          color: isHighlight ? COLORS.inkPrimary : COLORS.inkSecondary
        });
        drawRightText(item.value, PAGE_W - MARGIN_X - 2, cursorY, {
          font: fontMonoBold,
          size: 9.2,
          color: isHighlight ? COLORS.resultAccent : COLORS.inkPrimary
        });

        cursorY -= 6;
        page.drawLine({
          start: { x: MARGIN_X, y: cursorY },
          end: { x: PAGE_W - MARGIN_X, y: cursorY },
          thickness: isHighlight ? 0.8 : 0.45,
          color: isHighlight ? COLORS.borderMain : COLORS.borderSubtle
        });
        cursorY -= 13;
      }

      cursorY -= 6;
    }

    // 6. Embedded Charts & Graphs (2x HiDPI PNG)
    for (const chart of data.charts) {
      let pngBytes: Uint8Array | null = null;
      if (chart.pngDataUrl) {
        pngBytes = dataUrlToUint8Array(chart.pngDataUrl);
      } else if (chart.svgMarkup) {
        pngBytes = await rasterizeSvgToPngBytes(chart.svgMarkup, chart.width, chart.height);
      }
      if (!pngBytes) continue;

      try {
        const embedded = await pdfDoc.embedPng(pngBytes);
        const maxImgW = CONTENT_W - 20;
        const maxImgH = 220;
        const ratio = Math.min(maxImgW / embedded.width, maxImgH / embedded.height, 1);
        const drawW = embedded.width * ratio;
        const drawH = embedded.height * ratio;
        const blockH = drawH + (chart.title ? 30 : 18);

        ensureSpace(blockH + 10);

        if (chart.title) {
          drawSafeText(sanitizePdfText(chart.title).toUpperCase(), MARGIN_X, cursorY, {
            font: fontBold,
            size: 8.5,
            color: COLORS.inkSecondary
          });
          cursorY -= 12;
        }

        const frameTop = cursorY;
        const frameH = drawH + 16;
        const frameBottom = frameTop - frameH;

        page.drawRectangle({
          x: MARGIN_X,
          y: frameBottom,
          width: CONTENT_W,
          height: frameH,
          color: COLORS.white,
          borderColor: COLORS.borderMain,
          borderWidth: 0.75
        });

        page.drawImage(embedded, {
          x: MARGIN_X + (CONTENT_W - drawW) / 2,
          y: frameBottom + 8,
          width: drawW,
          height: drawH
        });

        cursorY = frameBottom - 14;
      } catch {
        // Ignore malformed image bytes without aborting PDF generation
      }
    }

    // 7. Complete Amortization Schedules & Data Tables (Multi-page + Repeating Headers)
    for (const table of data.tables) {
      if (table.headers.length === 0 && table.rows.length === 0) continue;

      const colCount = Math.max(
        table.headers.length,
        table.rows.reduce((max, r) => Math.max(max, r.length), 0)
      );
      if (colCount === 0) continue;

      const weights: number[] = Array(colCount).fill(1);
      const sampleRows = table.rows.slice(0, 20);
      for (let c = 0; c < colCount; c++) {
        const hdrW = fontBold.widthOfTextAtSize(sanitizePdfText(table.headers[c] || ''), 8.2);
        let maxCellW = hdrW;
        for (const row of sampleRows) {
          const cw = fontMono.widthOfTextAtSize(sanitizePdfText(row[c] || ''), 8);
          if (cw > maxCellW) maxCellW = cw;
        }
        weights[c] = Math.max(46, Math.min(220, maxCellW + 16));
      }
      const weightSum = weights.reduce((a, b) => a + b, 0);
      const colWidths = weights.map((w) => (w / weightSum) * CONTENT_W);
      const numericCols = Array.from({ length: colCount }, (_, c) =>
        isMostlyNumericColumn(table.rows, c)
      );

      const headerRowH = 21;
      const dataRowH = 17.5;

      ensureSpace((table.title ? 20 : 0) + headerRowH + dataRowH * 2);

      if (table.title) {
        drawSafeText(table.title, MARGIN_X, cursorY, {
          font: fontBold,
          size: 10.5,
          color: COLORS.inkPrimary
        });
        if (table.subtitle) {
          drawRightText(table.subtitle, PAGE_W - MARGIN_X, cursorY, {
            font: fontMono,
            size: 8.2,
            color: COLORS.inkMuted
          });
        }
        cursorY -= 14;
      }

      const drawTableHeader = () => {
        const top = cursorY;
        const bottom = top - headerRowH;
        page.drawRectangle({
          x: MARGIN_X,
          y: bottom,
          width: CONTENT_W,
          height: headerRowH,
          color: COLORS.tableHeaderBg,
          borderColor: COLORS.borderMain,
          borderWidth: 0.6
        });
        page.drawLine({
          start: { x: MARGIN_X, y: bottom },
          end: { x: PAGE_W - MARGIN_X, y: bottom },
          thickness: 1.1,
          color: COLORS.borderStrong
        });

        let x = MARGIN_X;
        for (let c = 0; c < colCount; c++) {
          const w = colWidths[c];
          let text = sanitizePdfText(table.headers[c] || '');
          while (text.length > 2 && fontBold.widthOfTextAtSize(text, 8) > w - 10) {
            text = text.slice(0, -2) + '..';
          }
          if (numericCols[c] && c > 0) {
            drawRightText(text, x + w - 6, bottom + 6.5, {
              font: fontBold,
              size: 8,
              color: COLORS.inkPrimary
            });
          } else {
            drawSafeText(text, x + 6, bottom + 6.5, {
              font: fontBold,
              size: 8,
              color: COLORS.inkPrimary
            });
          }
          x += w;
        }

        cursorY = bottom;
      };

      drawTableHeader();

      for (let rIdx = 0; rIdx < table.rows.length; rIdx++) {
        if (cursorY - dataRowH < MARGIN_BOTTOM) {
          startNewPage();
          if (table.title) {
            drawSafeText(`${sanitizePdfText(table.title)} (continued)`, MARGIN_X, cursorY, {
              font: fontBold,
              size: 9.2,
              color: COLORS.inkSecondary
            });
            cursorY -= 13;
          }
          drawTableHeader();
        }

        const rowTop = cursorY;
        const rowBottom = rowTop - dataRowH;

        if (rIdx % 2 === 1) {
          page.drawRectangle({
            x: MARGIN_X,
            y: rowBottom,
            width: CONTENT_W,
            height: dataRowH,
            color: COLORS.surfaceSubtle
          });
        }

        page.drawLine({
          start: { x: MARGIN_X, y: rowBottom },
          end: { x: PAGE_W - MARGIN_X, y: rowBottom },
          thickness: 0.45,
          color: COLORS.borderSubtle
        });

        const row = table.rows[rIdx];
        let x = MARGIN_X;
        for (let c = 0; c < colCount; c++) {
          const w = colWidths[c];
          const useMono = numericCols[c] && c > 0;
          const cellFont = useMono ? fontMono : fontRegular;
          let text = sanitizePdfText(row[c] || '');
          while (text.length > 2 && cellFont.widthOfTextAtSize(text, 7.9) > w - 10) {
            text = text.slice(0, -2) + '..';
          }

          if (useMono) {
            drawRightText(text, x + w - 6, rowBottom + 5.2, {
              font: cellFont,
              size: 7.9,
              color: c === colCount - 1 ? COLORS.inkPrimary : COLORS.inkSecondary
            });
          } else {
            drawSafeText(text, x + 6, rowBottom + 5.2, {
              font: c === 0 ? fontBold : cellFont,
              size: 7.9,
              color: COLORS.inkPrimary
            });
          }
          x += w;
        }

        cursorY = rowBottom;
      }

      cursorY -= 16;
    }

    // 8. Notes, Formulas & Reference Blocks
    for (const note of data.notes) {
      const f = note.mono ? fontMono : fontRegular;
      const fSize = note.mono ? 8.5 : 8.8;
      const lines = wrapTextLines(note.text, f, fSize, CONTENT_W - 22);
      if (lines.length === 0) continue;

      if (note.title) {
        ensureSpace(34);
        drawSafeText(sanitizePdfText(note.title).toUpperCase(), MARGIN_X, cursorY, {
          font: fontBold,
          size: 8.2,
          color: COLORS.inkSecondary
        });
        cursorY -= 11;
      }

      let lineIdx = 0;
      while (lineIdx < lines.length) {
        const availLines = Math.max(1, Math.floor((cursorY - MARGIN_BOTTOM - 16) / 12.5));
        const chunk = lines.slice(lineIdx, lineIdx + availLines);
        const blockH = chunk.length * 12.5 + 14;

        if (cursorY - blockH < MARGIN_BOTTOM) {
          startNewPage();
          continue;
        }

        const top = cursorY;
        const bottom = top - blockH;

        page.drawRectangle({
          x: MARGIN_X,
          y: bottom,
          width: CONTENT_W,
          height: blockH,
          color: COLORS.surfaceSubtle,
          borderColor: COLORS.borderSubtle,
          borderWidth: 0.7
        });

        let y = top - 14;
        for (const ln of chunk) {
          drawSafeText(ln, MARGIN_X + 10, y, {
            font: f,
            size: fSize,
            color: note.mono ? COLORS.resultAccent : COLORS.inkSecondary
          });
          y -= 12.5;
        }

        cursorY = bottom - 10;
        lineIdx += chunk.length;
      }
    }

    // 9. Fallback Paragraphs for Unstructured Specialized Tools
    if (
      !data.primaryCard &&
      data.metrics.length === 0 &&
      data.tables.length === 0 &&
      data.fallbackParagraphs.length > 0
    ) {
      for (const para of data.fallbackParagraphs) {
        const lines = wrapTextLines(para, fontRegular, 9.5, CONTENT_W);
        for (const line of lines) {
          ensureSpace(15);
          drawSafeText(line, MARGIN_X, cursorY, {
            font: fontRegular,
            size: 9.5,
            color: COLORS.inkPrimary
          });
          cursorY -= 13.5;
        }
        cursorY -= 4;
      }
    }

    // 10. Running Branded Footer + Page Numbers Across All Pages
    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;
    const footerLeft = sanitizePdfText(
      `${data.footerText || 'Generated with Glovotools'} | glovotools.com`
    );

    allPages.forEach((p, idx) => {
      const footerLineY = 34;
      p.drawLine({
        start: { x: MARGIN_X, y: footerLineY },
        end: { x: PAGE_W - MARGIN_X, y: footerLineY },
        thickness: 0.6,
        color: COLORS.borderMain
      });

      p.drawText(footerLeft, {
        x: MARGIN_X,
        y: 21,
        font: fontRegular,
        size: 7.8,
        color: COLORS.inkMuted
      });

      const pageLabel = `Page ${idx + 1} of ${totalPages}`;
      const pageLabelW = fontBold.widthOfTextAtSize(pageLabel, 7.8);
      p.drawText(pageLabel, {
        x: PAGE_W - MARGIN_X - pageLabelW,
        y: 21,
        font: fontBold,
        size: 7.8,
        color: COLORS.inkSecondary
      });
    });

    return pdfDoc.save();
  },

  /**
   * Generates a valid `application/pdf` Blob and standardized filename.
   */
  async createPdfBlob(data: PrintableReportData): Promise<{
    blob: Blob;
    filename: string;
    byteLength: number;
  }> {
    const pdfBytes = await DownloadPdfService.generatePdfBytes(data);
    const filename = DownloadPdfService.buildFileName(data.calculatorName);
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    return { blob, filename, byteLength: pdfBytes.byteLength };
  },

  /**
   * Generates and downloads a genuine `.pdf` report directly to the user's device,
   * revoking the temporary object URL after the download is initiated.
   */
  async downloadReport(data: PrintableReportData): Promise<DownloadPdfResult> {
    const { blob, filename, byteLength } = await DownloadPdfService.createPdfBlob(data);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 5000);
    }

    return {
      filename,
      byteLength,
      mimeType: 'application/pdf'
    };
  },

  /**
   * Captures the live calculator result state directly from the active workspace DOM
   * and immediately downloads the multi-page PDF report.
   */
  async downloadFromWorkspace(
    workspace?: HTMLElement | null,
    options: {
      scope?: 'workspace' | 'result-only';
      language?: Language;
      documentTitle?: string;
    } = {}
  ): Promise<DownloadPdfResult> {
    if (typeof document === 'undefined') {
      throw new Error('DownloadPdfService requires a browser DOM environment.');
    }

    const targetWorkspace =
      workspace ||
      document.querySelector<HTMLElement>('[data-print-workspace="true"]');

    if (!targetWorkspace) {
      throw new Error('No active calculator result workspace found.');
    }

    const { buildPrintablePayload } = await import('../utils/printResult.ts');
    const payload = buildPrintablePayload(targetWorkspace, {
      scope: options.scope ?? 'workspace',
      language: options.language ?? 'en',
      documentTitle: options.documentTitle
    });

    return DownloadPdfService.downloadReport(payload.reportData);
  }
};
