import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import {
  ConversionOptions,
  ConversionOutput,
  DocumentConverterId,
  PreviewImageItem,
  ProgressCallback,
  StructuredBlock,
} from './types.ts';
import { extractPdfContent, renderPdfPagesToImages } from './pdfExtractor.ts';
import { renderBlocksToPdf } from './pdfRenderer.ts';
import {
  htmlToStructuredBlocks,
  parseDocxToHtmlAndBlocks,
  parseOdpSlides,
  parseOdtContent,
  parsePptxSlides,
  parseRtfToBlocks,
  parseSpreadsheetBytes,
} from './officeParsers.ts';

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '') || 'document';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsvCell(value: string, delimiter: string): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function rowsToCsv(rows: string[][], delimiter: string): string {
  return rows
    .map((row) => row.map((cell) => escapeCsvCell(String(cell ?? ''), delimiter)).join(delimiter))
    .join('\r\n');
}

function hasMagicBytes(bytes: Uint8Array, asciiPrefix: string): boolean {
  if (bytes.length < asciiPrefix.length) return false;
  for (let i = 0; i < asciiPrefix.length; i++) {
    if (bytes[i] !== asciiPrefix.charCodeAt(i)) return false;
  }
  return true;
}

function assertValidInput(
  toolId: DocumentConverterId,
  fileName: string,
  bytes: Uint8Array
): void {
  if (!bytes || bytes.length === 0) {
    throw new Error('The uploaded file is empty (0 bytes). Please upload a valid non-empty document.');
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (toolId.startsWith('pdf-to-')) {
    const headerSlice = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(bytes.length, 1024)));
    if (!headerSlice.includes('%PDF-')) {
      throw new Error(`Invalid PDF file "${fileName}". Missing %PDF- signature header.`);
    }
  } else if (
    toolId === 'word-to-pdf-converter' ||
    toolId === 'docx-to-html-converter'
  ) {
    if (!hasMagicBytes(bytes, 'PK') && ext !== 'docx') {
      throw new Error(`Invalid Word (.docx) file "${fileName}". Expected a valid DOCX archive.`);
    }
    if (!hasMagicBytes(bytes, 'PK')) {
      throw new Error(`Invalid DOCX archive "${fileName}". Legacy binary .doc files are not supported; please upload .docx.`);
    }
  } else if (
    toolId === 'excel-to-pdf-converter' ||
    toolId === 'xlsx-to-csv-converter' ||
    toolId === 'xlsx-to-json-converter'
  ) {
    if (!['xlsx', 'xls', 'ods', 'csv'].includes(ext) && !hasMagicBytes(bytes, 'PK')) {
      throw new Error(`Unsupported spreadsheet file "${fileName}". Please upload .xlsx, .xls, or .ods.`);
    }
  } else if (
    toolId === 'powerpoint-to-pdf-converter' ||
    toolId === 'pptx-to-images-converter'
  ) {
    if (!hasMagicBytes(bytes, 'PK')) {
      throw new Error(`Invalid PowerPoint (.pptx) archive "${fileName}". Legacy .ppt binary files are not supported; please upload .pptx.`);
    }
  } else if (
    toolId === 'odt-to-pdf-converter' ||
    toolId === 'ods-to-pdf-converter' ||
    toolId === 'odp-to-pdf-converter'
  ) {
    if (!hasMagicBytes(bytes, 'PK')) {
      throw new Error(`Invalid OpenDocument file "${fileName}". Expected a valid ODF ZIP container.`);
    }
  } else if (toolId === 'rtf-to-pdf-converter') {
    const head = new TextDecoder('latin1').decode(bytes.slice(0, 64)).trimStart();
    if (!head.startsWith('{\\rtf')) {
      throw new Error(`Invalid RTF document "${fileName}". Missing {\\rtf header.`);
    }
  }
}

export async function inspectSpreadsheetSheets(bytes: Uint8Array, isCsv = false): Promise<string[]> {
  try {
    const parsed = parseSpreadsheetBytes(bytes, isCsv);
    return parsed.sheetNames;
  } catch {
    return [];
  }
}

export async function convertDocument(
  toolId: DocumentConverterId,
  fileName: string,
  bytes: Uint8Array,
  options: ConversionOptions = {},
  onProgress?: ProgressCallback
): Promise<ConversionOutput> {
  const startTime = Date.now();
  onProgress?.(5, 'Validating input document...');
  assertValidInput(toolId, fileName, bytes);

  const baseName = stripExtension(fileName);
  const warnings: string[] = [];
  const limitations: string[] = [];

  switch (toolId) {
    // =========================================================================
    // GROUP 1 — PDF TO OFFICE
    // =========================================================================
    case 'pdf-to-word-docx': {
      const extracted = await extractPdfContent(bytes, {
        enableOcrFallback: options.enableOcrFallback,
        ocrLanguage: options.ocrLanguage,
        onProgress,
      });

      onProgress?.(70, 'Building Word (.docx) document structure...');
      const children: Array<Paragraph | Table> = [];
      let totalWords = 0;

      for (let pIdx = 0; pIdx < extracted.pages.length; pIdx++) {
        const page = extracted.pages[pIdx];
        if (pIdx > 0) {
          children.push(new Paragraph({ text: '', pageBreakBefore: true }));
        }
        if (page.blocks.length === 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[Page ${page.pageNumber}: No selectable text detected${options.enableOcrFallback ? ' after OCR' : ' — enable OCR fallback for scanned pages'}]`,
                  italics: true,
                }),
              ],
            })
          );
          continue;
        }

        for (const block of page.blocks) {
          if (block.type === 'heading') {
            totalWords += block.text.split(/\s+/).length;
            children.push(
              new Paragraph({
                text: block.text,
                heading: block.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 120 },
              })
            );
          } else if (block.type === 'list-item') {
            totalWords += block.text.split(/\s+/).length;
            children.push(
              new Paragraph({
                text: block.text,
                bullet: { level: 0 },
              })
            );
          } else if (block.type === 'table') {
            const tableRows = block.rows.map(
              (r, rIdx) =>
                new TableRow({
                  tableHeader: rIdx === 0 && Boolean(block.hasHeader),
                  children: r.map((cell) => {
                    totalWords += cell.split(/\s+/).filter(Boolean).length;
                    return new TableCell({
                      width: { size: Math.floor(9000 / Math.max(1, r.length)), type: WidthType.DXA },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: cell, bold: rIdx === 0 && Boolean(block.hasHeader) })],
                        }),
                      ],
                    });
                  }),
                })
            );
            children.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
            );
          } else if (block.type === 'paragraph') {
            totalWords += block.text.split(/\s+/).length;
            children.push(
              new Paragraph({
                text: block.text,
                spacing: { after: 120 },
              })
            );
          }
        }
      }

      if (extracted.usedOcr) {
        warnings.push('One or more scanned pages were processed with browser-local Tesseract OCR.');
      }
      if (totalWords === 0) {
        warnings.push('No selectable text was found in this PDF. Enable "OCR Fallback for Scanned PDFs" to recognize image text.');
      }
      limitations.push(
        'PDF-to-DOCX reconstructs headings, paragraphs, lists, and detected tables in reading order; absolute vector drawings and overlapping floating frames are not preserved.'
      );

      const doc = new Document({
        creator: 'CalcTools Document Suite',
        title: extracted.metadata.title || baseName,
        sections: [{ children }],
      });

      onProgress?.(90, 'Packaging DOCX archive...');
      const docBuffer = await Packer.toArrayBuffer(doc);
      const outBytes = new Uint8Array(docBuffer);
      const previewText = extracted.pages
        .map((p) => `--- Page ${p.pageNumber} ---\n${p.rawText}`)
        .join('\n\n');

      return {
        fileName: `${baseName}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        bytes: outBytes,
        previewText,
        summary: `Converted ${extracted.pageCount} PDF page(s) (~${totalWords} words) into a Word (.docx) document.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount: extracted.pageCount,
          usedOcr: extracted.usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pdf-to-excel-xlsx': {
      const extracted = await extractPdfContent(bytes, {
        enableOcrFallback: options.enableOcrFallback,
        ocrLanguage: options.ocrLanguage,
        onProgress,
      });

      onProgress?.(75, 'Constructing multi-cell Excel worksheets...');
      const wb = XLSX.utils.book_new();
      const combinedRows: string[][] = [];
      let totalRows = 0;

      for (const page of extracted.pages) {
        const sheetRows = page.tableRows.length > 0 ? page.tableRows : [['(No selectable text on page)']];
        totalRows += sheetRows.length;
        const ws = XLSX.utils.aoa_to_sheet(sheetRows);
        // Set readable column widths
        const maxCols = Math.max(1, ...sheetRows.map((r) => r.length));
        ws['!cols'] = Array.from({ length: maxCols }, (_, colIdx) => {
          const maxLen = Math.min(48, Math.max(10, ...sheetRows.map((r) => String(r[colIdx] || '').length + 2)));
          return { wch: maxLen };
        });
        XLSX.utils.book_append_sheet(wb, ws, `Page_${page.pageNumber}`);
        for (const r of sheetRows) {
          combinedRows.push([`Page ${page.pageNumber}`, ...r]);
        }
      }

      if (extracted.pages.length > 1) {
        const allWs = XLSX.utils.aoa_to_sheet([['Source Page', 'Column 1', 'Column 2', 'Column 3', 'Column 4'], ...combinedRows]);
        XLSX.utils.book_append_sheet(wb, allWs, 'All_Pages_Combined');
      }

      if (extracted.usedOcr) {
        warnings.push('Scanned PDF pages were parsed via OCR before column clustering.');
      }
      limitations.push(
        'Spreadsheet cells are reconstructed using PDF X/Y coordinate clustering. Complex merged cells or rotated tables may require minor manual adjustment.'
      );

      const outArr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
      const outBytes = new Uint8Array(outArr);

      return {
        fileName: `${baseName}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        bytes: outBytes,
        previewTable: extracted.pages[0]?.tableRows.slice(0, 25),
        summary: `Extracted ${totalRows} structured rows across ${extracted.pageCount} worksheet(s) into Excel (.xlsx).`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount: extracted.pageCount,
          sheetCount: wb.SheetNames.length,
          rowCount: totalRows,
          usedOcr: extracted.usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pdf-to-powerpoint-pptx': {
      const mode = options.pptxMode || 'editable';
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = baseName;
      pptx.author = 'CalcTools Document Suite';

      let pageCount = 0;
      let usedOcr = false;
      let previewText = '';

      if (mode === 'images' && typeof document !== 'undefined') {
        const rendered = await renderPdfPagesToImages(bytes, 'png', 1.6, 0.92, onProgress);
        pageCount = rendered.length;
        for (const pageImg of rendered) {
          const slide = pptx.addSlide();
          const b64 = pageImg.dataUrl;
          slide.addImage({
            data: b64,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            sizing: { type: 'contain', w: 10, h: 5.625 },
          });
        }
        limitations.push(
          'Slide Image Mode inserts each PDF page as a high-resolution PNG image onto a PowerPoint slide to preserve exact visual layout (slide text is not directly editable).'
        );
        previewText = `Generated ${pageCount} visual slide(s) as embedded high-resolution PDF page images.`;
      } else {
        if (mode === 'images') {
          warnings.push('Canvas rendering unavailable in headless environment; fell back to editable text/table slide reconstruction.');
        }
        const extracted = await extractPdfContent(bytes, {
          enableOcrFallback: options.enableOcrFallback,
          ocrLanguage: options.ocrLanguage,
          onProgress,
        });
        pageCount = extracted.pageCount;
        usedOcr = extracted.usedOcr;

        for (const page of extracted.pages) {
          const slide = pptx.addSlide();
          const headingBlock = page.blocks.find((b) => b.type === 'heading');
          const slideTitle =
            headingBlock && 'text' in headingBlock
              ? headingBlock.text
              : `${baseName} — Page ${page.pageNumber}`;

          slide.addText(slideTitle, {
            x: 0.5,
            y: 0.35,
            w: 9.0,
            h: 0.65,
            fontSize: 22,
            bold: true,
            color: '1E293B',
          });

          let currentY = 1.15;
          const bodyParagraphs: string[] = [];

          for (const block of page.blocks) {
            if (block === headingBlock) continue;
            if (block.type === 'table' && currentY < 4.5) {
              const tableData = block.rows.slice(0, 10).map((r, rIdx) =>
                r.map((cell) => ({
                  text: cell,
                  options: rIdx === 0 ? { bold: true, fill: { color: 'E2E8F0' } } : undefined,
                }))
              );
              slide.addTable(tableData as any, {
                x: 0.5,
                y: currentY,
                w: 9.0,
                fontSize: 11,
                border: { pt: 0.5, color: 'CBD5E1' },
              });
              currentY += Math.min(2.8, block.rows.length * 0.35 + 0.3);
            } else if ('text' in block && block.text) {
              bodyParagraphs.push(block.text);
            }
          }

          if (bodyParagraphs.length > 0 && currentY < 5.2) {
            slide.addText(
              bodyParagraphs.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
              {
                x: 0.5,
                y: currentY,
                w: 9.0,
                h: Math.max(1.0, 5.2 - currentY),
                fontSize: 13,
                color: '334155',
                valign: 'top',
              }
            );
          }
        }
        limitations.push(
          'Editable Reconstruction Mode converts PDF headings, text blocks, and tables into native editable PowerPoint elements; complex vector artwork is omitted.'
        );
        previewText = extracted.pages
          .map((p) => `Slide ${p.pageNumber}:\n${p.rawText}`)
          .join('\n\n');
      }

      onProgress?.(90, 'Writing PPTX presentation package...');
      const outData = await pptx.write({ outputType: 'uint8array' });
      const outBytes = outData instanceof Uint8Array ? outData : new Uint8Array(outData as ArrayBuffer);

      return {
        fileName: `${baseName}.pptx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        bytes: outBytes,
        previewText,
        summary: `Created ${pageCount}-slide PowerPoint (.pptx) presentation using ${mode === 'images' ? 'Slide Image' : 'Editable Reconstruction'} mode.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount,
          slideCount: pageCount,
          usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pdf-to-csv-converter': {
      const delimiter = options.csvDelimiter || ',';
      const extracted = await extractPdfContent(bytes, {
        enableOcrFallback: options.enableOcrFallback,
        ocrLanguage: options.ocrLanguage,
        onProgress,
      });

      const allRows: string[][] = [];
      for (const page of extracted.pages) {
        if (extracted.pages.length > 1) {
          allRows.push([`# Page ${page.pageNumber}`]);
        }
        for (const r of page.tableRows) {
          allRows.push(r);
        }
      }

      if (allRows.length === 0) {
        warnings.push('No selectable tabular text found. Enable OCR fallback if this PDF is scanned.');
      }
      limitations.push(
        'PDF-to-CSV splits columns based on horizontal coordinate gaps detected across text elements.'
      );

      const csvBody = '\uFEFF' + rowsToCsv(allRows, delimiter);
      const outBytes = new TextEncoder().encode(csvBody);

      return {
        fileName: `${baseName}.csv`,
        mimeType: 'text/csv;charset=utf-8',
        bytes: outBytes,
        previewText: csvBody.replace(/^\uFEFF/, ''),
        previewTable: allRows.slice(0, 25),
        summary: `Extracted ${allRows.length} CSV row(s) across ${extracted.pageCount} PDF page(s).`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount: extracted.pageCount,
          rowCount: allRows.length,
          usedOcr: extracted.usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    // =========================================================================
    // GROUP 2 — OFFICE TO PDF
    // =========================================================================
    case 'word-to-pdf-converter': {
      onProgress?.(20, 'Parsing DOCX structure with Mammoth...');
      const parsed = await parseDocxToHtmlAndBlocks(bytes);
      warnings.push(...parsed.warnings);
      if (parsed.blocks.length === 0) {
        throw new Error('Could not extract readable text or tables from this DOCX document.');
      }
      limitations.push(
        'Converts DOCX headings, paragraphs, lists, and tables to paginated PDF; embedded floating SmartArt/headers/footers may not render identically to desktop Word.'
      );
      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(parsed.blocks, options, baseName, onProgress);

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewHtml: parsed.html,
        summary: `Converted Word (.docx) document into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'excel-to-pdf-converter': {
      onProgress?.(20, 'Reading Excel workbook sheets...');
      const parsed = parseSpreadsheetBytes(bytes, false);
      const targetSheets =
        options.selectedSheet && options.selectedSheet !== '__ALL__' && parsed.sheets[options.selectedSheet]
          ? [options.selectedSheet]
          : parsed.sheetNames;

      if (targetSheets.length === 0) {
        throw new Error('No worksheets found inside the uploaded spreadsheet.');
      }

      const blocks: StructuredBlock[] = [];
      let totalRows = 0;

      targetSheets.forEach((sheetName, idx) => {
        if (idx > 0) blocks.push({ type: 'page-break' });
        blocks.push({ type: 'heading', level: 1, text: `Worksheet: ${sheetName}` });
        const rows = parsed.sheets[sheetName] || [];
        totalRows += rows.length;
        if (rows.length > 0) {
          blocks.push({ type: 'table', rows, hasHeader: true });
        } else {
          blocks.push({ type: 'paragraph', text: '(Empty worksheet)' });
        }
      });

      limitations.push(
        'Renders worksheet cell values and tabular gridlines cleanly across pages; Excel charts, conditional formatting colors, and macros are omitted.'
      );

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        { ...options, orientation: options.orientation || 'landscape' },
        baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewTable: parsed.sheets[targetSheets[0]]?.slice(0, 20),
        summary: `Converted ${targetSheets.length} worksheet(s) (${totalRows} rows) into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          sheetCount: targetSheets.length,
          rowCount: totalRows,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'powerpoint-to-pdf-converter': {
      onProgress?.(20, 'Extracting PowerPoint (.pptx) slides and notes...');
      const { slides } = await parsePptxSlides(bytes);
      const blocks: StructuredBlock[] = slides.map((s) => ({
        type: 'slide',
        slideNumber: s.slideNumber,
        title: s.title,
        bodyItems: s.bodyItems,
        tables: s.tables,
        notes: s.notes,
      }));

      limitations.push(
        'Extracts slide titles, bullet lists, tables, and speaker notes onto structured PDF slide pages; complex animations, SmartArt, and master-slide backgrounds are simplified.'
      );

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        { ...options, orientation: options.orientation || 'landscape' },
        baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewText: slides.map((s) => `Slide ${s.slideNumber}: ${s.title}\n${s.bodyItems.join('\n')}`).join('\n\n'),
        summary: `Converted ${slides.length} PowerPoint slide(s) into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          slideCount: slides.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'txt-to-pdf-converter': {
      onProgress?.(20, 'Decoding UTF-8 text content...');
      const text = new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
      if (!text.trim()) {
        throw new Error('The uploaded TXT file contains no readable text.');
      }
      const blocks: StructuredBlock[] = text.split(/\r?\n\r?\n/).map((chunk) => ({
        type: 'paragraph',
        text: chunk.trim(),
      }));

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(blocks, options, baseName, onProgress);

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewText: text.slice(0, 5000),
        summary: `Converted plain text (${text.length.toLocaleString()} characters) into a ${pageCount}-page PDF.`,
        warnings,
        limitations: [],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    // =========================================================================
    // GROUP 3 — TEXT & WEB TO PDF
    // =========================================================================
    case 'html-to-pdf-converter': {
      onProgress?.(20, 'Parsing HTML document structure...');
      const htmlText = new TextDecoder('utf-8').decode(bytes);
      const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(htmlText);
      const blocks = htmlToStructuredBlocks(htmlText);
      if (blocks.length === 0) {
        throw new Error('No renderable HTML content found in the uploaded file.');
      }
      limitations.push(
        'Renders semantic HTML headings, paragraphs, lists, code blocks, and tables; external stylesheets, JavaScript execution, and remote images are not fetched.'
      );
      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        options,
        titleMatch?.[1]?.trim() || baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewHtml: htmlText,
        summary: `Converted HTML document (${blocks.length} semantic blocks) into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'csv-to-pdf-converter': {
      onProgress?.(20, 'Parsing CSV rows and columns...');
      const parsed = parseSpreadsheetBytes(bytes, true);
      const firstSheet = parsed.sheetNames[0];
      const rows = (firstSheet && parsed.sheets[firstSheet]) || [];
      if (rows.length === 0) {
        throw new Error('The uploaded CSV file contains no valid data rows.');
      }

      const blocks: StructuredBlock[] = [
        { type: 'heading', level: 1, text: baseName },
        { type: 'table', rows, hasHeader: true },
      ];

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        { ...options, orientation: options.orientation || (rows[0]?.length > 5 ? 'landscape' : 'portrait') },
        baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewTable: rows.slice(0, 25),
        summary: `Converted ${rows.length} CSV row(s) into a ${pageCount}-page formatted table PDF.`,
        warnings,
        limitations: [],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          rowCount: rows.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'rtf-to-pdf-converter': {
      onProgress?.(20, 'Tokenizing RTF control words and text...');
      const rtfText = new TextDecoder('latin1').decode(bytes);
      const blocks = parseRtfToBlocks(rtfText);
      if (blocks.length === 0) {
        throw new Error('Could not extract readable text from this RTF document.');
      }
      limitations.push(
        'Preserves RTF paragraphs, Unicode/hex escapes, and basic headings; embedded binary WMF/EMF images and complex RTF stylesheets are omitted.'
      );
      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(blocks, options, baseName, onProgress);

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewText: blocks.map((b) => ('text' in b ? b.text : '')).filter(Boolean).join('\n\n'),
        summary: `Converted RTF document (${blocks.length} blocks) into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'odt-to-pdf-converter': {
      onProgress?.(20, 'Extracting OpenDocument Text (ODT) content.xml...');
      const blocks = await parseOdtContent(bytes);
      if (blocks.length === 0) {
        throw new Error('No paragraphs, headings, or tables found inside ODT content.xml.');
      }
      limitations.push(
        'Preserves ODT headings, paragraphs, and tables; custom OpenDocument page styles and embedded OLE frames are simplified.'
      );
      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(blocks, options, baseName, onProgress);

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewText: blocks.map((b) => ('text' in b ? b.text : '')).filter(Boolean).join('\n\n'),
        summary: `Converted OpenDocument Text (.odt) into a ${pageCount}-page PDF.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    // =========================================================================
    // GROUP 4 — OFFICE FORMAT CONVERTERS
    // =========================================================================
    case 'ods-to-pdf-converter': {
      onProgress?.(20, 'Parsing OpenDocument Spreadsheet (.ods)...');
      const parsed = parseSpreadsheetBytes(bytes, false);
      const targetSheets =
        options.selectedSheet && options.selectedSheet !== '__ALL__' && parsed.sheets[options.selectedSheet]
          ? [options.selectedSheet]
          : parsed.sheetNames;

      if (targetSheets.length === 0) {
        throw new Error('No sheets found inside ODS spreadsheet.');
      }

      const blocks: StructuredBlock[] = [];
      let totalRows = 0;

      targetSheets.forEach((sheetName, idx) => {
        if (idx > 0) blocks.push({ type: 'page-break' });
        blocks.push({ type: 'heading', level: 1, text: `Sheet: ${sheetName}` });
        const rows = parsed.sheets[sheetName] || [];
        totalRows += rows.length;
        blocks.push(rows.length > 0 ? { type: 'table', rows, hasHeader: true } : { type: 'paragraph', text: '(Empty sheet)' });
      });

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        { ...options, orientation: options.orientation || 'landscape' },
        baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewTable: parsed.sheets[targetSheets[0]]?.slice(0, 20),
        summary: `Converted ${targetSheets.length} ODS worksheet(s) (${totalRows} rows) into a ${pageCount}-page PDF.`,
        warnings,
        limitations: ['ODS charts and conditional formatting colors are omitted; cell values and grids are preserved.'],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          sheetCount: targetSheets.length,
          rowCount: totalRows,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'odp-to-pdf-converter': {
      onProgress?.(20, 'Parsing OpenDocument Presentation (.odp)...');
      const slides = await parseOdpSlides(bytes);
      const blocks: StructuredBlock[] = slides.map((s) => ({
        type: 'slide',
        slideNumber: s.slideNumber,
        title: s.title,
        bodyItems: s.bodyItems,
        tables: s.tables,
        notes: s.notes,
      }));

      const { bytes: pdfBytes, pageCount } = await renderBlocksToPdf(
        blocks,
        { ...options, orientation: options.orientation || 'landscape' },
        baseName,
        onProgress
      );

      return {
        fileName: `${baseName}.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        previewText: slides.map((s) => `Slide ${s.slideNumber}: ${s.title}\n${s.bodyItems.join('\n')}`).join('\n\n'),
        summary: `Converted ${slides.length} ODP slide(s) into a ${pageCount}-page PDF.`,
        warnings,
        limitations: ['Extracts ODP slide titles, text frames, tables, and notes; master slide graphics and transitions are simplified.'],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: pdfBytes.length,
          pageCount,
          slideCount: slides.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'docx-to-html-converter': {
      onProgress?.(25, 'Converting DOCX to semantic HTML5...');
      const parsed = await parseDocxToHtmlAndBlocks(bytes);
      warnings.push(...parsed.warnings);

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(baseName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 820px; margin: 2.5rem auto; padding: 0 1.25rem; line-height: 1.65; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    table { border-collapse: collapse; width: 100%; margin: 1.25rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${parsed.html}
</body>
</html>`;

      const outBytes = new TextEncoder().encode(fullHtml);
      return {
        fileName: `${baseName}.html`,
        mimeType: 'text/html;charset=utf-8',
        bytes: outBytes,
        previewHtml: parsed.html,
        previewText: fullHtml,
        summary: `Converted Word (.docx) document into clean semantic HTML5 (${(outBytes.length / 1024).toFixed(1)} KB).`,
        warnings,
        limitations: [],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'xlsx-to-csv-converter': {
      onProgress?.(25, 'Reading Excel workbook for CSV export...');
      const delimiter = options.csvDelimiter || ',';
      const parsed = parseSpreadsheetBytes(bytes, false);
      if (parsed.sheetNames.length === 0) {
        throw new Error('No worksheets found inside spreadsheet.');
      }

      const wantAllZip = options.selectedSheet === '__ALL__' && parsed.sheetNames.length > 1;

      if (wantAllZip) {
        const zip = new JSZip();
        let totalRows = 0;
        for (const sheetName of parsed.sheetNames) {
          const rows = parsed.sheets[sheetName] || [];
          totalRows += rows.length;
          const csv = '\uFEFF' + rowsToCsv(rows, delimiter);
          const safeSheet = sheetName.replace(/[^a-zA-Z0-9_\- ]/g, '_');
          zip.file(`${baseName}_${safeSheet}.csv`, csv);
        }
        const zipBytes = await zip.generateAsync({ type: 'uint8array' });
        const firstCsv = rowsToCsv(parsed.sheets[parsed.sheetNames[0]] || [], delimiter);
        return {
          fileName: `${baseName}_csv_sheets.zip`,
          mimeType: 'application/zip',
          bytes: zipBytes,
          previewText: firstCsv,
          previewTable: parsed.sheets[parsed.sheetNames[0]]?.slice(0, 25),
          summary: `Exported all ${parsed.sheetNames.length} worksheets (${totalRows} total rows) into a ZIP archive of CSV files.`,
          warnings,
          limitations: [],
          stats: {
            inputSizeBytes: bytes.length,
            outputSizeBytes: zipBytes.length,
            sheetCount: parsed.sheetNames.length,
            rowCount: totalRows,
            conversionTimeMs: Date.now() - startTime,
          },
        };
      }

      const sheetName =
        options.selectedSheet && parsed.sheets[options.selectedSheet]
          ? options.selectedSheet
          : parsed.sheetNames[0];
      const rows = parsed.sheets[sheetName] || [];
      const csvString = '\uFEFF' + rowsToCsv(rows, delimiter);
      const outBytes = new TextEncoder().encode(csvString);

      return {
        fileName: `${baseName}_${sheetName.replace(/[^a-zA-Z0-9_\-]/g, '_')}.csv`,
        mimeType: 'text/csv;charset=utf-8',
        bytes: outBytes,
        previewText: csvString.replace(/^\uFEFF/, ''),
        previewTable: rows.slice(0, 25),
        summary: `Exported worksheet "${sheetName}" (${rows.length} rows) to CSV.`,
        warnings: parsed.sheetNames.length > 1 ? [`Workbook contains ${parsed.sheetNames.length} sheets; exported "${sheetName}". Choose "All Sheets (ZIP)" to export every sheet.`] : [],
        limitations: [],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          sheetCount: parsed.sheetNames.length,
          rowCount: rows.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    // =========================================================================
    // GROUP 5 — ADVANCED DOCUMENT CONVERTERS
    // =========================================================================
    case 'xlsx-to-json-converter': {
      onProgress?.(25, 'Converting Excel workbook sheets to JSON...');
      const parsed = parseSpreadsheetBytes(bytes, false);
      if (parsed.sheetNames.length === 0) {
        throw new Error('No worksheets found inside Excel file.');
      }

      const targetAll = !options.selectedSheet || options.selectedSheet === '__ALL__';
      let jsonPayload: unknown;
      let totalRows = 0;

      if (targetAll) {
        if (parsed.sheetNames.length === 1) {
          const single = parsed.jsonSheets[parsed.sheetNames[0]] || [];
          jsonPayload = single;
          totalRows = single.length;
        } else {
          jsonPayload = parsed.jsonSheets;
          for (const s of parsed.sheetNames) {
            totalRows += (parsed.jsonSheets[s] || []).length;
          }
        }
      } else {
        const chosen = parsed.jsonSheets[options.selectedSheet!] || [];
        jsonPayload = chosen;
        totalRows = chosen.length;
      }

      const jsonString = options.jsonPretty === false
        ? JSON.stringify(jsonPayload)
        : JSON.stringify(jsonPayload, null, 2);
      const outBytes = new TextEncoder().encode(jsonString);

      return {
        fileName: `${baseName}.json`,
        mimeType: 'application/json;charset=utf-8',
        bytes: outBytes,
        previewText: jsonString.slice(0, 12000),
        summary: `Converted ${targetAll ? parsed.sheetNames.length : 1} worksheet(s) (${totalRows} data records) to JSON.`,
        warnings,
        limitations: [],
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          sheetCount: parsed.sheetNames.length,
          rowCount: totalRows,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pptx-to-images-converter': {
      if (typeof document === 'undefined') {
        throw new Error('Rendering PowerPoint slides to PNG/JPEG images requires a browser HTML5 Canvas environment.');
      }
      onProgress?.(20, 'Parsing PPTX slide deck...');
      const { slides, slideWidthPx, slideHeightPx } = await parsePptxSlides(bytes);
      const fmt = options.imageFormat || 'png';
      const mime = fmt === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = fmt === 'jpeg' ? 'jpg' : 'png';
      const quality = options.imageQuality ?? 0.92;

      const previewImages: PreviewImageItem[] = [];
      const zip = new JSZip();
      let singleImageBytes: Uint8Array | null = null;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        onProgress?.(25 + Math.round(((i + 1) / slides.length) * 65), `Rendering slide ${i + 1} of ${slides.length} to ${fmt.toUpperCase()}...`);

        const canvas = document.createElement('canvas');
        canvas.width = slideWidthPx;
        canvas.height = slideHeightPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Clean slide canvas background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Top accent bar
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, canvas.width, 12);

        // Title
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(slide.title, 64, 92, canvas.width - 128);

        // Divider line
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(64, 118);
        ctx.lineTo(canvas.width - 64, 118);
        ctx.stroke();

        // Body bullet items
        let curY = 172;
        ctx.fillStyle = '#334155';
        ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const maxTextWidth = slide.images.length > 0 ? canvas.width * 0.56 : canvas.width - 140;

        for (const item of slide.bodyItems) {
          if (curY > canvas.height - 90) break;
          const words = (`•  ${item}`).split(/\s+/);
          let line = '';
          for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            if (ctx.measureText(test).width > maxTextWidth && line) {
              ctx.fillText(line, 72, curY);
              curY += 34;
              line = `   ${w}`;
            } else {
              line = test;
            }
          }
          if (line && curY <= canvas.height - 80) {
            ctx.fillText(line, 72, curY);
            curY += 42;
          }
        }

        // Draw first embedded slide image on right panel if present
        if (slide.images.length > 0) {
          try {
            const imgMeta = slide.images[0];
            const imgBlob = new Blob([imgMeta.bytes.slice()], { type: imgMeta.mime });
            const objUrl = URL.createObjectURL(imgBlob);
            try {
              const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = reject;
                el.src = objUrl;
              });
              const boxX = canvas.width * 0.62;
              const boxY = 155;
              const boxW = canvas.width * 0.33;
              const boxH = canvas.height - 230;
              const ratio = Math.min(boxW / imgEl.width, boxH / imgEl.height);
              const drawW = imgEl.width * ratio;
              const drawH = imgEl.height * ratio;
              ctx.drawImage(imgEl, boxX, boxY, drawW, drawH);
            } finally {
              URL.revokeObjectURL(objUrl);
            }
          } catch {
            // Skip undecodable embedded media
          }
        }

        // Slide footer
        ctx.fillStyle = '#94A3B8';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Slide ${slide.slideNumber} / ${slides.length}`, canvas.width - 160, canvas.height - 32);

        const dataUrl = canvas.toDataURL(mime, quality);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
        const imgBytes = blob ? new Uint8Array(await blob.arrayBuffer()) : new Uint8Array();
        const slideFileName = `slide_${String(slide.slideNumber).padStart(2, '0')}.${ext}`;
        zip.file(slideFileName, imgBytes);
        if (i === 0) singleImageBytes = imgBytes;
        previewImages.push({
          name: slideFileName,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        });
      }

      const isSingle = slides.length === 1 && singleImageBytes;
      const outBytes = isSingle ? singleImageBytes! : await zip.generateAsync({ type: 'uint8array' });

      limitations.push(
        'Browser-local PPTX slide renderer renders slide titles, bullet lists, and embedded slide images onto HTML5 Canvas; PowerPoint transitions, animations, and custom theme vector shapes are simplified.'
      );

      return {
        fileName: isSingle ? `${baseName}_slide_01.${ext}` : `${baseName}_slides_${ext}.zip`,
        mimeType: isSingle ? mime : 'application/zip',
        bytes: outBytes,
        previewImages,
        summary: `Rendered ${slides.length} PowerPoint slide(s) to ${fmt.toUpperCase()} (${slideWidthPx}×${slideHeightPx}px).`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          slideCount: slides.length,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pdf-to-html-converter': {
      const extracted = await extractPdfContent(bytes, {
        enableOcrFallback: options.enableOcrFallback,
        ocrLanguage: options.ocrLanguage,
        onProgress,
      });

      onProgress?.(80, 'Generating semantic HTML5 document...');
      const sectionsHtml = extracted.pages
        .map((page) => {
          const innerBlocks = page.blocks
            .map((b) => {
              if (b.type === 'heading') {
                return `<h${b.level}>${escapeHtml(b.text)}</h${b.level}>`;
              }
              if (b.type === 'list-item') {
                return `<ul><li>${escapeHtml(b.text)}</li></ul>`;
              }
              if (b.type === 'table') {
                const trs = b.rows
                  .map(
                    (row, rIdx) =>
                      `<tr>${row
                        .map((cell) =>
                          rIdx === 0 && b.hasHeader
                            ? `<th>${escapeHtml(cell)}</th>`
                            : `<td>${escapeHtml(cell)}</td>`
                        )
                        .join('')}</tr>`
                  )
                  .join('\n');
                return `<table>\n${trs}\n</table>`;
              }
              if (b.type === 'paragraph') {
                return `<p>${escapeHtml(b.text)}</p>`;
              }
              return '';
            })
            .filter(Boolean)
            .join('\n  ');

          return `<section class="pdf-page" data-page="${page.pageNumber}">\n  <div class="page-label">Page ${page.pageNumber}</div>\n  ${innerBlocks || '<p><em>(No selectable text on this page)</em></p>'}\n</section>`;
        })
        .join('\n\n');

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(extracted.metadata.title || baseName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; background: #f8fafc; }
    .pdf-page { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.75rem; margin-bottom: 1.5rem; }
    .page-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 0.75rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.45rem 0.7rem; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;

      const outBytes = new TextEncoder().encode(fullHtml);
      if (extracted.usedOcr) {
        warnings.push('OCR text recognition was used for scanned page(s).');
      }
      limitations.push(
        'Converts PDF headings, paragraphs, lists, and tables into clean HTML page sections; absolute CSS coordinate positioning and embedded vector graphics are not reproduced.'
      );

      return {
        fileName: `${baseName}.html`,
        mimeType: 'text/html;charset=utf-8',
        bytes: outBytes,
        previewHtml: sectionsHtml,
        previewText: fullHtml,
        summary: `Converted ${extracted.pageCount} PDF page(s) into structured HTML5.`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount: extracted.pageCount,
          usedOcr: extracted.usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    case 'pdf-to-markdown-converter': {
      const extracted = await extractPdfContent(bytes, {
        enableOcrFallback: options.enableOcrFallback,
        ocrLanguage: options.ocrLanguage,
        onProgress,
      });

      onProgress?.(80, 'Formatting Markdown headings, lists, and tables...');
      const mdPages = extracted.pages.map((page) => {
        const lines: string[] = [];
        if (extracted.pages.length > 1) {
          lines.push(`<!-- Page ${page.pageNumber} -->`);
        }
        for (const b of page.blocks) {
          if (b.type === 'heading') {
            lines.push(`${'#'.repeat(b.level)} ${b.text}`);
            lines.push('');
          } else if (b.type === 'list-item') {
            lines.push(`${b.ordered ? '1.' : '-'} ${b.text}`);
          } else if (b.type === 'table') {
            if (b.rows.length > 0) {
              const cols = b.rows[0].length;
              const sanitizeCell = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
              lines.push(`| ${b.rows[0].map(sanitizeCell).join(' | ')} |`);
              lines.push(`| ${Array.from({ length: cols }, () => '---').join(' | ')} |`);
              for (let r = 1; r < b.rows.length; r++) {
                lines.push(`| ${b.rows[r].map(sanitizeCell).join(' | ')} |`);
              }
              lines.push('');
            }
          } else if (b.type === 'paragraph') {
            lines.push(b.text);
            lines.push('');
          }
        }
        return lines.join('\n').trim();
      });

      const markdown = mdPages.filter(Boolean).join('\n\n---\n\n') + '\n';
      const outBytes = new TextEncoder().encode(markdown);

      if (extracted.usedOcr) {
        warnings.push('OCR text recognition was used for scanned page(s).');
      }
      limitations.push(
        'Heading levels and GFM tables are inferred from PDF font sizes and column spacing; vector graphics and footnotes are converted as plain text where selectable.'
      );

      return {
        fileName: `${baseName}.md`,
        mimeType: 'text/markdown;charset=utf-8',
        bytes: outBytes,
        previewText: markdown,
        summary: `Converted ${extracted.pageCount} PDF page(s) into GitHub-Flavored Markdown (.md).`,
        warnings,
        limitations,
        stats: {
          inputSizeBytes: bytes.length,
          outputSizeBytes: outBytes.length,
          pageCount: extracted.pageCount,
          usedOcr: extracted.usedOcr,
          conversionTimeMs: Date.now() - startTime,
        },
      };
    }

    default:
      throw new Error(`Unsupported document conversion tool: ${toolId}`);
  }
}
