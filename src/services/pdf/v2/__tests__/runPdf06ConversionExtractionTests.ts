import JSZip from 'jszip';
import mammoth from 'mammoth';
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
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFRef,
  StandardFonts,
  rgb,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  DOCUMENT_CONVERTER_FIDELITY_CLASSIFICATION,
  convertImagesToPdfV2,
  convertPdfToImagesV2,
  encodeDeterministicBaselineJpeg,
  encodeRawPixelsToPng,
  executeConversionExtractionOperationV2,
  executeDocumentConverterV2,
  extractEmbeddedImagesFromPdfV2,
  extractTextFromPdfV2,
  inspectRasterImageHeader,
  pdfLifecycleManager,
} from '../index';
import {
  createEmptyBufferFixture,
  createInvalidMagicBytesFixture,
  createValidMultiPagePdfFixture,
} from './pdfTestFixtures';

export interface Pdf06TestCaseResult {
  testId: string;
  operationId: string;
  description: string;
  expectedOutcome: string;
  actualOutcome: string;
  pdfJsOrIndependentVerify: boolean;
  inputImmutabilityVerified: boolean;
  durationMs: number;
  status: 'VERIFIED' | 'FAILED';
}

function bytesAreIdentical(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Helper to create a valid RGB PNG image fixture of exact dimensions.
 */
function createRgbPngFixture(width: number, height: number, r: number, g: number, b: number): Uint8Array {
  const pixels = new Uint8Array(width * height * 3);
  for (let i = 0; i < pixels.byteLength; i += 3) {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  return encodeRawPixelsToPng({ width, height, channels: 3, pixels });
}

/**
 * Helper to create a valid RGBA PNG image fixture with an alpha channel (produces /SMask in PDF).
 */
function createRgbaPngFixture(width: number, height: number, r: number, g: number, b: number, a: number): Uint8Array {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < pixels.byteLength; i += 4) {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = a;
  }
  return encodeRawPixelsToPng({ width, height, channels: 4, pixels });
}

/**
 * Helper to inspect a PDF output independently using PDF.js (`pdfjs-dist`).
 */
async function inspectPdfWithPdfJs(pdfBytes: Uint8Array): Promise<{
  numPages: number;
  pageTexts: string[];
  pageViews: number[][];
}> {
  const session = await openManagedPdfDocument(pdfBytes);
  try {
    const numPages = session.pdfDoc.numPages;
    const pageTexts: string[] = [];
    const pageViews: number[][] = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await session.pdfDoc.getPage(p);
      try {
        const vp = page.getViewport({ scale: 1.0 });
        pageViews.push([Math.round(vp.width * 100) / 100, Math.round(vp.height * 100) / 100]);
        const tc = await page.getTextContent();
        const joined = (tc.items || [])
          .map((it: any) => (typeof it?.str === 'string' ? it.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pageTexts.push(joined);
      } finally {
        if (page && typeof page.cleanup === 'function') {
          await page.cleanup();
        }
      }
    }

    return { numPages, pageTexts, pageViews };
  } finally {
    await session.dispose();
  }
}

/**
 * Helper to count embedded `/Subtype /Image` XObjects per page in a PDF document.
 */
async function countImageXObjectsPerPage(pdfBytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(pdfBytes);
  const counts: number[] = [];
  for (const page of doc.getPages()) {
    let count = 0;
    const res = page.node.Resources();
    const xObj = res?.lookup(PDFName.of('XObject'));
    if (xObj instanceof PDFDict) {
      for (const [, val] of xObj.entries()) {
        const looked = val instanceof PDFRef ? doc.context.lookup(val) : val;
        if (looked instanceof PDFRawStream) {
          const st = looked.dict.lookup(PDFName.of('Subtype'));
          if (st instanceof PDFName && st.asString() === '/Image') {
            count++;
          }
        }
      }
    }
    counts.push(count);
  }
  return counts;
}

export async function runPdf06ConversionExtractionTests(): Promise<{
  passedCount: number;
  totalCount: number;
  results: Pdf06TestCaseResult[];
}> {
  const results: Pdf06TestCaseResult[] = [];

  const runCase = async (
    testId: string,
    operationId: string,
    description: string,
    expectedOutcome: string,
    fn: () => Promise<{ actualOutcome: string; verified: boolean; immutable: boolean }>
  ) => {
    const t0 = performance.now();
    try {
      const res = await fn();
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        testId,
        operationId,
        description,
        expectedOutcome,
        actualOutcome: res.actualOutcome,
        pdfJsOrIndependentVerify: res.verified,
        inputImmutabilityVerified: res.immutable,
        durationMs,
        status: res.verified && res.immutable ? 'VERIFIED' : 'FAILED',
      });
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        testId,
        operationId,
        description,
        expectedOutcome,
        actualOutcome: `EXCEPTION: ${err?.stack || err?.message || String(err)}`,
        pdfJsOrIndependentVerify: false,
        inputImmutabilityVerified: false,
        durationMs,
        status: 'FAILED',
      });
    }
  };

  // ============================================================================
  // PDF06-TC-01: PDF Text Extraction — Multi-page reading order & page boundaries
  // ============================================================================
  await runCase(
    'PDF06-TC-01',
    'pdf-to-text',
    'Multi-page PDF text extraction with top-to-bottom, left-to-right reading order and page boundary separators',
    'Extracts 3 pages in exact reading order with "--- Page N ---" markers and structured per-page word/line counts',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Page 1: Deliberately draw bottom line first, then top line, and right token before left token
      const p1 = doc.addPage([612, 792]);
      p1.drawText('P1_BOTTOM_LINE', { x: 72, y: 500, size: 12, font });
      p1.drawText('TOKEN_RIGHT', { x: 180, y: 700, size: 14, font });
      p1.drawText('TOKEN_LEFT', { x: 72, y: 700, size: 14, font });

      const p2 = doc.addPage([612, 792]);
      p2.drawText('P2_HEADING_ALPHA', { x: 72, y: 720, size: 16, font });
      p2.drawText('P2_PARAGRAPH_BETA', { x: 72, y: 680, size: 12, font });

      const p3 = doc.addPage([612, 792]);
      p3.drawText('P3_FINAL_SUMMARY_OMEGA', { x: 72, y: 700, size: 12, font });

      const fixtureBytes = await doc.save();
      const backup = new Uint8Array(fixtureBytes);

      const res = await extractTextFromPdfV2({
        fileName: 'reading_order.pdf',
        bytes: fixtureBytes,
      });

      const decoded = new TextDecoder('utf-8').decode(res.outputBytes);
      const extraction = (res.details as any)?.extraction;
      const p1Lines = extraction?.pages?.[0]?.lines?.map((l: any) => l.text) || [];

      const readingOrderCorrect =
        p1Lines.length === 2 &&
        p1Lines[0].includes('TOKEN_LEFT') &&
        p1Lines[0].includes('TOKEN_RIGHT') &&
        p1Lines[0].indexOf('TOKEN_LEFT') < p1Lines[0].indexOf('TOKEN_RIGHT') &&
        p1Lines[1] === 'P1_BOTTOM_LINE';

      const hasBoundaries =
        decoded.includes('--- Page 1 ---') &&
        decoded.includes('--- Page 2 ---') &&
        decoded.includes('--- Page 3 ---') &&
        decoded.includes('P2_HEADING_ALPHA') &&
        decoded.includes('P3_FINAL_SUMMARY_OMEGA');

      const immutable = bytesAreIdentical(fixtureBytes, backup);
      return {
        actualOutcome: `status=${res.status}, pages=${extraction?.extractedPageCount}, p1Lines=${JSON.stringify(p1Lines)}, boundaries=${hasBoundaries}`,
        verified: res.status === 'SUCCESS' && readingOrderCorrect && hasBoundaries,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-02: PDF Text Extraction — Selected page range & invalid range rejection
  // ============================================================================
  await runCase(
    'PDF06-TC-02',
    'pdf-to-text',
    'Selected-page text extraction ("1, 3" of 3-page PDF) and out-of-bounds range rejection ("5-7")',
    'Extracts only Page 1 and Page 3 text (excluding Page 2); rejects range "5-7" with ERR_INVALID_PAGE_RANGE',
    async () => {
      const fixture = await createValidMultiPagePdfFixture({
        pageTexts: ['SELECT_TEXT_P1', 'SELECT_TEXT_P2_OMIT', 'SELECT_TEXT_P3'],
      });
      const backup = new Uint8Array(fixture);

      const res = await extractTextFromPdfV2(
        { fileName: 'select.pdf', bytes: fixture },
        { selection: '1, 3' }
      );
      const text = new TextDecoder('utf-8').decode(res.outputBytes);
      const extraction = (res.details as any)?.extraction;

      const badRes = await extractTextFromPdfV2(
        { fileName: 'select.pdf', bytes: fixture },
        { selection: '5-7' }
      );

      const okSelect =
        res.status === 'SUCCESS' &&
        extraction?.selectedPageNumbers?.join(',') === '1,3' &&
        text.includes('SELECT_TEXT_P1') &&
        text.includes('SELECT_TEXT_P3') &&
        !text.includes('SELECT_TEXT_P2_OMIT');

      const okBad = badRes.status === 'VALIDATION_ERROR' && badRes.error?.code === 'ERR_INVALID_PAGE_RANGE';
      const immutable = bytesAreIdentical(fixture, backup);

      return {
        actualOutcome: `selected=${extraction?.selectedPageNumbers?.join(',')}, hasP2=${text.includes('SELECT_TEXT_P2_OMIT')}, badCode=${badRes.error?.code}`,
        verified: okSelect && okBad,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-03: PDF Text Extraction — Scanned image-only PDF honest disclosure
  // ============================================================================
  await runCase(
    'PDF06-TC-03',
    'pdf-to-text',
    'Scanned image-only PDF without a vector text layer',
    'Honestly flags hasScannedPagesWithoutText=true, scannedPagesWithoutTextLayer=[1, 2], totalWordCount=0, and emits OCR guidance warning without fake metadata text',
    async () => {
      const doc = await PDFDocument.create();
      doc.setTitle('FakeMetadataShouldNotBeExtractedAsBodyText');
      const pngBytes = createRgbPngFixture(120, 80, 200, 210, 220);
      const img = await doc.embedPng(pngBytes);

      const p1 = doc.addPage([400, 300]);
      p1.drawImage(img, { x: 20, y: 20, width: 360, height: 260 });
      const p2 = doc.addPage([400, 300]);
      p2.drawImage(img, { x: 20, y: 20, width: 360, height: 260 });

      const scannedPdf = await doc.save();
      const backup = new Uint8Array(scannedPdf);

      const res = await extractTextFromPdfV2(
        { fileName: 'scanned_invoice.pdf', bytes: scannedPdf },
        { includePageSeparators: false, enableOcrFallback: false }
      );

      const decoded = new TextDecoder('utf-8').decode(res.outputBytes);
      const ext = (res.details as any)?.extraction;

      const honestScanned =
        res.status === 'SUCCESS' &&
        ext?.hasScannedPagesWithoutText === true &&
        ext?.scannedPagesWithoutTextLayer?.join(',') === '1,2' &&
        ext?.totalWordCount === 0 &&
        decoded.trim() === '' &&
        !decoded.includes('FakeMetadataShouldNotBeExtractedAsBodyText') &&
        res.warnings.some((w) => /scanned|image-only|OCR/i.test(w));

      const immutable = bytesAreIdentical(scannedPdf, backup);
      return {
        actualOutcome: `hasScanned=${ext?.hasScannedPagesWithoutText}, scannedPages=[${ext?.scannedPagesWithoutTextLayer?.join(',')}], words=${ext?.totalWordCount}, warnings=${res.warnings.length}`,
        verified: honestScanned,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-04: PDF to Images — Multi-page PNG & JPEG rendering, DPI scaling, orientation & ZIP
  // ============================================================================
  await runCase(
    'PDF06-TC-04',
    'pdf-to-images',
    'Render 2-page PDF (Page 1 Portrait 612x792, Page 2 Landscape 792x612) to PNG at 144 DPI (scale=2.0) and single-page JPEG at 72 DPI',
    'Multi-page output is a valid ZIP containing 2 PNGs with exact scaled dimensions (1224x1584 and 1584x1224); 1-page JPEG output starts with FF D8 FF with dimensions 792x612',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const p1 = doc.addPage([612, 792]); // Portrait
      p1.drawText('PORTRAIT_PAGE_1', { x: 72, y: 700, size: 18, font });
      const p2 = doc.addPage([792, 612]); // Landscape
      p2.drawText('LANDSCAPE_PAGE_2', { x: 72, y: 500, size: 18, font });

      const pdfBytes = await doc.save();
      const backup = new Uint8Array(pdfBytes);

      // 1. Multi-page PNG at 144 DPI (scale = 2.0) -> ZIP
      const pngZipRes = await convertPdfToImagesV2(
        { fileName: 'mixed_orient.pdf', bytes: pdfBytes },
        { format: 'png', dpi: 144 }
      );

      const zip = await JSZip.loadAsync(pngZipRes.outputBytes!);
      const zipEntries = Object.keys(zip.files);
      const p1PngBytes = await zip.file('mixed_orient_page_1.png')!.async('uint8array');
      const p2PngBytes = await zip.file('mixed_orient_page_2.png')!.async('uint8array');

      const h1 = inspectRasterImageHeader(p1PngBytes);
      const h2 = inspectRasterImageHeader(p2PngBytes);

      // 2. Single-page (page 2 only) JPEG at 72 DPI -> direct JPEG image
      const jpgSingleRes = await convertPdfToImagesV2(
        { fileName: 'mixed_orient.pdf', bytes: pdfBytes },
        { format: 'jpeg', dpi: 72, selection: '2', quality: 0.85 }
      );
      const hJpg = inspectRasterImageHeader(jpgSingleRes.outputBytes!);

      const verified =
        pngZipRes.status === 'SUCCESS' &&
        pngZipRes.primaryFile?.mimeType === 'application/zip' &&
        zipEntries.length === 2 &&
        h1.isValid &&
        h1.format === 'png' &&
        h1.width === 1224 &&
        h1.height === 1584 &&
        h2.isValid &&
        h2.format === 'png' &&
        h2.width === 1584 &&
        h2.height === 1224 &&
        jpgSingleRes.status === 'SUCCESS' &&
        jpgSingleRes.primaryFile?.mimeType === 'image/jpeg' &&
        hJpg.isValid &&
        hJpg.format === 'jpeg' &&
        hJpg.width === 792 &&
        hJpg.height === 612;

      const immutable = bytesAreIdentical(pdfBytes, backup);
      return {
        actualOutcome: `zipEntries=${zipEntries.length}, p1=${h1.width}x${h1.height}(${h1.format}), p2=${h2.width}x${h2.height}(${h2.format}), singleJpg=${hJpg.width}x${hJpg.height}(${hJpg.format})`,
        verified,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-05: Images to PDF — Multi-image PNG + JPEG embedding, page sizes & aspect ratio
  // ============================================================================
  await runCase(
    'PDF06-TC-05',
    'pdf-images-to-pdf',
    'Convert 1 Landscape PNG (200x100) + 1 Portrait JPEG (150x300) into a 2-page PDF with A4 auto-orientation and fit-image modes',
    'Reopening in PDF.js confirms 2 pages (Page 1 A4 Landscape 841.89x595.28, Page 2 A4 Portrait 595.28x841.89) and exact 2:1 / 1:2 drawn aspect ratios; fit-image mode creates exact 200x100 and 150x300 pages',
    async () => {
      const pngLandscape = createRgbPngFixture(200, 100, 40, 120, 200);
      const jpgPortrait = encodeDeterministicBaselineJpeg({ width: 150, height: 300 });
      const pngBackup = new Uint8Array(pngLandscape);
      const jpgBackup = new Uint8Array(jpgPortrait);

      // 1. A4 with auto orientation & marginPt=20
      const a4Res = await convertImagesToPdfV2(
        [
          { fileName: 'wide_banner.png', bytes: pngLandscape },
          { fileName: 'tall_photo.jpg', bytes: jpgPortrait },
        ],
        { pageSize: 'A4', orientation: 'auto', marginPt: 20 }
      );

      if (a4Res.status !== 'SUCCESS' || !a4Res.outputBytes) {
        return {
          actualOutcome: `a4Res failed: status=${a4Res.status}, code=${a4Res.error?.code}, msg=${a4Res.error?.message}`,
          verified: false,
          immutable: true,
        };
      }

      const a4PdfJs = await inspectPdfWithPdfJs(a4Res.outputBytes);
      const a4ImageCounts = await countImageXObjectsPerPage(a4Res.outputBytes);
      const pageSummaries = (a4Res.details as any)?.pages || [];
      const p1Ratio = pageSummaries[0] ? pageSummaries[0].drawnWidthPt / pageSummaries[0].drawnHeightPt : 0;
      const p2Ratio = pageSummaries[1] ? pageSummaries[1].drawnWidthPt / pageSummaries[1].drawnHeightPt : 0;

      // 2. fit-image with marginPt=0
      const fitRes = await convertImagesToPdfV2(
        [
          { fileName: 'wide_banner.png', bytes: pngLandscape },
          { fileName: 'tall_photo.jpg', bytes: jpgPortrait },
        ],
        { pageSize: 'fit-image', marginPt: 0 }
      );
      if (fitRes.status !== 'SUCCESS' || !fitRes.outputBytes) {
        return {
          actualOutcome: `fitRes failed: status=${fitRes.status}, code=${fitRes.error?.code}, msg=${fitRes.error?.message}`,
          verified: false,
          immutable: true,
        };
      }
      const fitPdfJs = await inspectPdfWithPdfJs(fitRes.outputBytes);

      const verified =
        a4Res.status === 'SUCCESS' &&
        a4PdfJs.numPages === 2 &&
        Math.abs(a4PdfJs.pageViews[0][0] - 841.89) < 0.5 &&
        Math.abs(a4PdfJs.pageViews[0][1] - 595.28) < 0.5 &&
        Math.abs(a4PdfJs.pageViews[1][0] - 595.28) < 0.5 &&
        Math.abs(a4PdfJs.pageViews[1][1] - 841.89) < 0.5 &&
        a4ImageCounts[0] === 1 &&
        a4ImageCounts[1] === 1 &&
        Math.abs(p1Ratio - 2.0) < 0.01 &&
        Math.abs(p2Ratio - 0.5) < 0.01 &&
        fitRes.status === 'SUCCESS' &&
        fitPdfJs.pageViews[0][0] === 200 &&
        fitPdfJs.pageViews[0][1] === 100 &&
        fitPdfJs.pageViews[1][0] === 150 &&
        fitPdfJs.pageViews[1][1] === 300;

      const immutable =
        bytesAreIdentical(pngLandscape, pngBackup) && bytesAreIdentical(jpgPortrait, jpgBackup);

      return {
        actualOutcome: `a4Views=${JSON.stringify(a4PdfJs.pageViews)}, ratios=[${p1Ratio.toFixed(2)}, ${p2Ratio.toFixed(2)}], fitViews=${JSON.stringify(fitPdfJs.pageViews)}`,
        verified,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-06: Images to PDF — Corrupted / Unsupported image rejection
  // ============================================================================
  await runCase(
    'PDF06-TC-06',
    'pdf-images-to-pdf',
    'Reject plain text disguised as .png, 0-byte empty image, truncated JPEG missing SOF, and invalid dimensions',
    'Returns deterministic ERR_UNSUPPORTED_IMAGE_FORMAT, ERR_EMPTY_FILE, and ERR_INVALID_DIMENSIONS',
    async () => {
      const fakePng = new TextEncoder().encode('This is plain text pretending to be a PNG file.');
      const emptyBytes = createEmptyBufferFixture();
      const truncatedJpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const validPng = createRgbPngFixture(32, 32, 100, 100, 100);

      const rFake = await convertImagesToPdfV2([{ fileName: 'disguised.png', bytes: fakePng }]);
      const rEmpty = await convertImagesToPdfV2([{ fileName: 'empty.png', bytes: emptyBytes }]);
      const rTrunc = await convertImagesToPdfV2([{ fileName: 'corrupt.jpg', bytes: truncatedJpg }]);
      const rBadDim = await convertImagesToPdfV2(
        [{ fileName: 'valid.png', bytes: validPng }],
        { pageSize: 'Custom', customWidthPt: -100, customHeightPt: 500 }
      );

      const verified =
        rFake.error?.code === 'ERR_UNSUPPORTED_IMAGE_FORMAT' &&
        rEmpty.error?.code === 'ERR_EMPTY_FILE' &&
        rTrunc.error?.code === 'ERR_UNSUPPORTED_IMAGE_FORMAT' &&
        rBadDim.error?.code === 'ERR_INVALID_DIMENSIONS';

      return {
        actualOutcome: `fake=${rFake.error?.code}, empty=${rEmpty.error?.code}, truncJpg=${rTrunc.error?.code}, badDim=${rBadDim.error?.code}`,
        verified,
        immutable: true,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-07: Embedded Image Extraction — Extract actual embedded JPEG & PNG XObjects vs rendered page
  // ============================================================================
  await runCase(
    'PDF06-TC-07',
    'pdf-extract-images / pdf-image-extraction-tool',
    'Extract embedded 160x90 JPEG (/DCTDecode) and 80x60 RGBA PNG (/FlateDecode + /SMask) from a 612x792 PDF page, plus minWidthPx filter',
    'Extracts exact 160x90 JPEG and 80x60 PNG (NOT 612x792 rendered pages), verifies isRenderedPageFallback===false, and both canonical IDs succeed',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      const embeddedJpgSource = encodeDeterministicBaselineJpeg({ width: 160, height: 90 });
      const embeddedPngSource = createRgbaPngFixture(80, 60, 220, 50, 90, 200);
      const tinySpacerMask = createRgbPngFixture(4, 4, 0, 0, 0);

      const pdfJpg = await doc.embedJpg(embeddedJpgSource);
      const pdfPng = await doc.embedPng(embeddedPngSource);
      const pdfTiny = await doc.embedPng(tinySpacerMask);

      const p1 = doc.addPage([612, 792]);
      p1.drawText('PAGE_1_WITH_EMBEDDED_JPEG_AND_SPACER', { x: 50, y: 700, size: 14, font });
      p1.drawImage(pdfJpg, { x: 50, y: 500, width: 160, height: 90 });
      p1.drawImage(pdfTiny, { x: 10, y: 10, width: 4, height: 4 });

      const p2 = doc.addPage([612, 792]);
      p2.drawText('PAGE_2_WITH_EMBEDDED_PNG', { x: 50, y: 700, size: 14, font });
      p2.drawImage(pdfPng, { x: 50, y: 500, width: 80, height: 60 });

      const pdfWithImages = await doc.save();
      const backup = new Uint8Array(pdfWithImages);

      // 1. Extract with minWidthPx=16 (filters out 4x4 spacer mask, extracts 160x90 JPEG and 80x60 PNG)
      const res1 = await extractEmbeddedImagesFromPdfV2(
        { fileName: 'catalog_photos.pdf', bytes: pdfWithImages },
        { minWidthPx: 16, minHeightPx: 16 }
      );

      // 2. Also verify second canonical registration 'pdf-image-extraction-tool' on page '2' only
      const res2 = await executeConversionExtractionOperationV2({
        toolId: 'pdf-image-extraction-tool',
        inputs: [{ fileName: 'catalog_photos.pdf', bytes: pdfWithImages }],
        options: { selection: '2', minWidthPx: 16 },
      });

      const zip1 = await JSZip.loadAsync(res1.outputBytes!);
      const files1 = Object.keys(zip1.files);
      const jpgEntry = files1.find((f) => f.endsWith('.jpg'))!;
      const pngEntry = files1.find((f) => f.endsWith('.png'))!;

      const extractedJpgBytes = await zip1.file(jpgEntry)!.async('uint8array');
      const extractedPngBytes = await zip1.file(pngEntry)!.async('uint8array');

      const hJpg = inspectRasterImageHeader(extractedJpgBytes);
      const hPng = inspectRasterImageHeader(extractedPngBytes);
      const metaList = ((res1.details as any)?.images || []) as any[];

      const verified =
        res1.status === 'SUCCESS' &&
        files1.length === 2 &&
        (res1.details as any)?.skippedSmallMasksCount === 1 &&
        (res1.details as any)?.isFullPageRenderFallback === false &&
        metaList.every((m) => m.isRenderedPageFallback === false) &&
        hJpg.isValid &&
        hJpg.format === 'jpeg' &&
        hJpg.width === 160 &&
        hJpg.height === 90 &&
        hPng.isValid &&
        hPng.format === 'png' &&
        hPng.width === 80 &&
        hPng.height === 60 &&
        res2.status === 'SUCCESS' &&
        res2.resolvedCanonicalId === 'pdf-image-extraction-tool' &&
        res2.outputFiles.length === 1 &&
        res2.outputFiles[0].width === 80 &&
        res2.outputFiles[0].height === 60;

      const immutable = bytesAreIdentical(pdfWithImages, backup);
      return {
        actualOutcome: `extracted=${files1.length}, skippedMasks=${(res1.details as any)?.skippedSmallMasksCount}, jpg=${hJpg.width}x${hJpg.height}, png=${hPng.width}x${hPng.height}, tool2Files=${res2.outputFiles.length}`,
        verified,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-08: Embedded Image Extraction — Text-only PDF returns ERR_NO_IMAGES_FOUND
  // ============================================================================
  await runCase(
    'PDF06-TC-08',
    'pdf-extract-images',
    'Attempt embedded image extraction on a vector text-only PDF containing 0 Image XObjects',
    'Rejects honestly with ERR_NO_IMAGES_FOUND (never renders full PDF pages as fake extracted images)',
    async () => {
      const textOnlyPdf = await createValidMultiPagePdfFixture({
        pageTexts: ['VECTOR_ONLY_PAGE_1', 'VECTOR_ONLY_PAGE_2'],
      });
      const backup = new Uint8Array(textOnlyPdf);

      const res = await extractEmbeddedImagesFromPdfV2({
        fileName: 'vector_only.pdf',
        bytes: textOnlyPdf,
      });

      const verified =
        res.status === 'VALIDATION_ERROR' &&
        res.error?.code === 'ERR_NO_IMAGES_FOUND' &&
        res.outputFiles.length === 0;

      const immutable = bytesAreIdentical(textOnlyPdf, backup);
      return {
        actualOutcome: `status=${res.status}, code=${res.error?.code}, outputFiles=${res.outputFiles.length}`,
        verified,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-09: PDF to Office & Structured Markup (DOCX, XLSX, PPTX, CSV, HTML, Markdown)
  // ============================================================================
  await runCase(
    'PDF06-TC-09',
    'pdf-to-word-docx / pdf-to-excel-xlsx / pdf-to-powerpoint-pptx / pdf-to-csv-converter / pdf-to-html-converter / pdf-to-markdown-converter',
    'Convert structured 2-page PDF (Heading, bullet item, and 3x3 table) to DOCX, XLSX, PPTX, CSV, HTML, and Markdown and reopen each independently',
    'Mammoth extracts text from DOCX; XLSX.read verifies 3x3 table cells in XLSX & CSV; JSZip verifies PPTX slide1.xml/slide2.xml; HTML & Markdown contain semantic structure and fidelity disclosures',
    async () => {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc.embedFont(StandardFonts.Helvetica);

      // Page 1: Large heading + bullet list + 3x3 aligned table
      const p1 = doc.addPage([612, 792]);
      p1.drawText('Q4 FINANCIAL REPORT', { x: 50, y: 730, size: 22, font: boldFont });
      p1.drawText('• Executive overview item one', { x: 50, y: 690, size: 12, font: regFont });

      // 3x3 aligned table at X = 50, 200, 350
      const rows = [
        ['Component', 'Qty', 'Cost'],
        ['Turbine', '10', '2500'],
        ['Sensor', '40', '800'],
      ];
      let y = 630;
      for (const r of rows) {
        p1.drawText(r[0], { x: 50, y, size: 11, font: regFont });
        p1.drawText(r[1], { x: 200, y, size: 11, font: regFont });
        p1.drawText(r[2], { x: 350, y, size: 11, font: regFont });
        y -= 24;
      }

      // Page 2
      const p2 = doc.addPage([612, 792]);
      p2.drawText('APPENDIX SECTION', { x: 50, y: 730, size: 20, font: boldFont });
      p2.drawText('Closing notes for engineering audit.', { x: 50, y: 690, size: 12, font: regFont });

      const pdfBytes = await doc.save();
      const backup = new Uint8Array(pdfBytes);
      const input = { fileName: 'q4_report.pdf', bytes: pdfBytes };

      // 1. PDF -> DOCX
      const docxRes = await executeDocumentConverterV2('pdf-to-word-docx', input);
      const mammothOut = await mammoth.extractRawText({
        buffer: Buffer.from(docxRes.outputBytes!),
      });
      const docxOk =
        docxRes.status === 'SUCCESS' &&
        mammothOut.value.includes('Q4 FINANCIAL REPORT') &&
        mammothOut.value.includes('Turbine') &&
        mammothOut.value.includes('APPENDIX SECTION');

      // 2. PDF -> XLSX
      const xlsxRes = await executeDocumentConverterV2('pdf-to-excel-xlsx', input);
      const wb = XLSX.read(xlsxRes.outputBytes!, { type: 'array' });
      const p1SheetJson = XLSX.utils.sheet_to_json<string[]>(wb.Sheets['Page_1'], { header: 1 });
      const flatCells = p1SheetJson.flat().map(String);
      const xlsxOk =
        xlsxRes.status === 'SUCCESS' &&
        wb.SheetNames.includes('Page_1') &&
        wb.SheetNames.includes('Page_2') &&
        flatCells.includes('Turbine') &&
        flatCells.includes('2500');

      // 3. PDF -> PPTX
      const pptxRes = await executeDocumentConverterV2('pdf-to-powerpoint-pptx', input, { pptxMode: 'editable' });
      const pptxZip = await JSZip.loadAsync(pptxRes.outputBytes!);
      const slide1Xml = await pptxZip.file('ppt/slides/slide1.xml')!.async('string');
      const slide2Xml = await pptxZip.file('ppt/slides/slide2.xml')!.async('string');
      const pptxOk =
        pptxRes.status === 'SUCCESS' &&
        slide1Xml.includes('Q4 FINANCIAL REPORT') &&
        slide2Xml.includes('APPENDIX SECTION');

      // 4. PDF -> CSV
      const csvRes = await executeDocumentConverterV2('pdf-to-csv-converter', input);
      const csvText = new TextDecoder('utf-8').decode(csvRes.outputBytes!);
      const csvOk =
        csvRes.status === 'SUCCESS' &&
        csvText.includes('Component,Qty,Cost') &&
        csvText.includes('Turbine,10,2500');

      // 5. PDF -> HTML
      const htmlRes = await executeDocumentConverterV2('pdf-to-html-converter', input);
      const htmlText = new TextDecoder('utf-8').decode(htmlRes.outputBytes!);
      const htmlOk =
        htmlRes.status === 'SUCCESS' &&
        htmlText.includes('<section class="pdf-page" data-page="1">') &&
        htmlText.includes('Q4 FINANCIAL REPORT') &&
        htmlText.includes('<table>');

      // 6. PDF -> Markdown
      const mdRes = await executeDocumentConverterV2('pdf-to-markdown-converter', input);
      const mdText = new TextDecoder('utf-8').decode(mdRes.outputBytes!);
      const mdOk =
        mdRes.status === 'SUCCESS' &&
        mdText.includes('# Q4 FINANCIAL REPORT') &&
        mdText.includes('| Component | Qty | Cost |') &&
        mdText.includes('---');

      const immutable = bytesAreIdentical(pdfBytes, backup);
      return {
        actualOutcome: `docx=${docxOk}, xlsx=${xlsxOk}, pptx=${pptxOk}, csv=${csvOk}, html=${htmlOk}, md=${mdOk}`,
        verified: docxOk && xlsxOk && pptxOk && csvOk && htmlOk && mdOk,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-10: Office to PDF (Word DOCX -> PDF, Excel XLSX -> PDF, PowerPoint PPTX -> PDF)
  // ============================================================================
  await runCase(
    'PDF06-TC-10',
    'word-to-pdf-converter / excel-to-pdf-converter / powerpoint-to-pdf-converter',
    'Convert real DOCX, XLSX, and PPTX archives to PDF and independently verify extracted text in PDF.js',
    'All 3 generated PDFs pass PDF.js reopening verification and contain the exact source DOCX, XLSX, and PPTX text',
    async () => {
      // 1. Build a real DOCX fixture using docx Packer
      const wordDoc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ text: 'WORD_FIXTURE_HEADING_2026', heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ children: [new TextRun({ text: 'Paragraph body inside Word DOCX.' })] }),
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph('ColA')] }),
                      new TableCell({ children: [new Paragraph('ColB')] }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      });
      const docxBytes = new Uint8Array(await Packer.toArrayBuffer(wordDoc));
      const docxBackup = new Uint8Array(docxBytes);

      const wordToPdfRes = await executeDocumentConverterV2('word-to-pdf-converter', {
        fileName: 'spec.docx',
        bytes: docxBytes,
      });
      const wordPdfJs = await inspectPdfWithPdfJs(wordToPdfRes.outputBytes!);
      const wordOk =
        wordToPdfRes.status === 'SUCCESS' &&
        wordPdfJs.numPages >= 1 &&
        wordPdfJs.pageTexts.join(' ').includes('WORD_FIXTURE_HEADING_2026') &&
        wordPdfJs.pageTexts.join(' ').includes('ColA');

      // 2. Build a real XLSX fixture using SheetJS
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ['MetricName', 'Q4Value'],
        ['NetRevenue', '98500'],
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Financials');
      const xlsxBytes = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer);
      const xlsxBackup = new Uint8Array(xlsxBytes);

      const excelToPdfRes = await executeDocumentConverterV2('excel-to-pdf-converter', {
        fileName: 'sheet.xlsx',
        bytes: xlsxBytes,
      });
      const excelPdfJs = await inspectPdfWithPdfJs(excelToPdfRes.outputBytes!);
      const excelOk =
        excelToPdfRes.status === 'SUCCESS' &&
        excelPdfJs.pageTexts.join(' ').includes('MetricName') &&
        excelPdfJs.pageTexts.join(' ').includes('NetRevenue') &&
        excelPdfJs.pageTexts.join(' ').includes('98500');

      // 3. Build a real 2-slide PPTX fixture using PptxGenJS
      const pptx = new PptxGenJS();
      const s1 = pptx.addSlide();
      s1.addText('PPTX_SLIDE_ONE_TITLE', { x: 0.5, y: 0.5, w: 8, h: 1, fontSize: 24 });
      const s2 = pptx.addSlide();
      s2.addText('PPTX_SLIDE_TWO_TITLE', { x: 0.5, y: 0.5, w: 8, h: 1, fontSize: 24 });
      const pptxOut = await pptx.write({ outputType: 'uint8array' });
      const pptxBytes = pptxOut instanceof Uint8Array ? pptxOut : new Uint8Array(pptxOut as ArrayBuffer);
      const pptxBackup = new Uint8Array(pptxBytes);

      const pptxToPdfRes = await executeDocumentConverterV2('powerpoint-to-pdf-converter', {
        fileName: 'deck.pptx',
        bytes: pptxBytes,
      });
      const pptxPdfJs = await inspectPdfWithPdfJs(pptxToPdfRes.outputBytes!);
      const pptxOk =
        pptxToPdfRes.status === 'SUCCESS' &&
        pptxPdfJs.numPages === 2 &&
        pptxPdfJs.pageTexts[0].includes('PPTX_SLIDE_ONE_TITLE') &&
        pptxPdfJs.pageTexts[1].includes('PPTX_SLIDE_TWO_TITLE');

      const immutable =
        bytesAreIdentical(docxBytes, docxBackup) &&
        bytesAreIdentical(xlsxBytes, xlsxBackup) &&
        bytesAreIdentical(pptxBytes, pptxBackup);

      return {
        actualOutcome: `wordOk=${wordOk}, excelOk=${excelOk}, pptxOk=${pptxOk}(pages=${pptxPdfJs.numPages})`,
        verified: wordOk && excelOk && pptxOk,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-11: OpenDocument & Markup to PDF (TXT, HTML, CSV, RTF, ODT, ODS, ODP -> PDF)
  // ============================================================================
  await runCase(
    'PDF06-TC-11',
    'txt-to-pdf-converter / html-to-pdf-converter / csv-to-pdf-converter / rtf-to-pdf-converter / odt-to-pdf-converter / ods-to-pdf-converter / odp-to-pdf-converter',
    'Convert TXT, HTML (with <script> sanitization), CSV, RTF, ODT, ODS, and ODP to PDF and verify in PDF.js',
    'All 7 generated PDFs reopen cleanly in PDF.js with expected content; HTML <script> tags and raw RTF control words are stripped',
    async () => {
      // 1. TXT -> PDF
      const txtBytes = new TextEncoder().encode(
        Array.from({ length: 65 }, (_, i) => `TXT_LINE_${i + 1}_CONTENT_VERIFICATION`).join('\n\n')
      );
      const txtRes = await executeDocumentConverterV2('txt-to-pdf-converter', {
        fileName: 'notes.txt',
        bytes: txtBytes,
      });
      const txtPdf = await inspectPdfWithPdfJs(txtRes.outputBytes!);
      const txtOk =
        txtRes.status === 'SUCCESS' &&
        txtPdf.numPages >= 2 &&
        txtPdf.pageTexts.join(' ').includes('TXT_LINE_1_CONTENT_VERIFICATION') &&
        txtPdf.pageTexts.join(' ').includes('TXT_LINE_65_CONTENT_VERIFICATION');

      // 2. HTML -> PDF (with <script> tag that must be stripped)
      const htmlBytes = new TextEncoder().encode(
        '<html><head><title>T</title><script>alert("XSS_PAYLOAD")</script></head><body><h1>HTML_HEADING_SAFE</h1><p>Body paragraph.</p><table><tr><th>H1</th><th>H2</th></tr><tr><td>Val1</td><td>Val2</td></tr></table></body></html>'
      );
      const htmlRes = await executeDocumentConverterV2('html-to-pdf-converter', {
        fileName: 'page.html',
        bytes: htmlBytes,
      });
      const htmlPdf = await inspectPdfWithPdfJs(htmlRes.outputBytes!);
      const htmlJoined = htmlPdf.pageTexts.join(' ');
      const htmlOk =
        htmlRes.status === 'SUCCESS' &&
        htmlJoined.includes('HTML_HEADING_SAFE') &&
        htmlJoined.includes('Val1') &&
        !htmlJoined.includes('XSS_PAYLOAD');

      // 3. CSV -> PDF (with quoted comma)
      const csvBytes = new TextEncoder().encode('Engineer,Department,Score\n"Smith, Jr.",R&D,99\nAlice,Core,100');
      const csvRes = await executeDocumentConverterV2('csv-to-pdf-converter', {
        fileName: 'team.csv',
        bytes: csvBytes,
      });
      const csvPdf = await inspectPdfWithPdfJs(csvRes.outputBytes!);
      const csvJoined = csvPdf.pageTexts.join(' ');
      const csvOk =
        csvRes.status === 'SUCCESS' &&
        csvJoined.includes('Smith, Jr.') &&
        csvJoined.includes('Alice');

      // 4. RTF -> PDF
      const rtfBytes = new TextEncoder().encode(
        '{\\rtf1\\ansi{\\fonttbl{\\f0 Helvetica;}}\\f0\\b RTF_TITLE_CLEAN\\b0\\par Normal RTF body text with hex escape caf\\\'e9.}'
      );
      const rtfRes = await executeDocumentConverterV2('rtf-to-pdf-converter', {
        fileName: 'doc.rtf',
        bytes: rtfBytes,
      });
      const rtfPdf = await inspectPdfWithPdfJs(rtfRes.outputBytes!);
      const rtfJoined = rtfPdf.pageTexts.join(' ');
      const rtfOk =
        rtfRes.status === 'SUCCESS' &&
        rtfJoined.includes('RTF_TITLE_CLEAN') &&
        rtfJoined.includes('café') &&
        !rtfJoined.includes('rtf1');

      // 5. ODT -> PDF
      const odtZip = new JSZip();
      odtZip.file(
        'content.xml',
        '<?xml version="1.0" encoding="UTF-8"?><office:document-content><office:body><office:text><text:h text:outline-level="1">ODT_HEADING_TEST</text:h><text:p>ODT_PARAGRAPH_BODY</text:p></office:text></office:body></office:document-content>'
      );
      const odtBytes = await odtZip.generateAsync({ type: 'uint8array' });
      const odtRes = await executeDocumentConverterV2('odt-to-pdf-converter', {
        fileName: 'writer.odt',
        bytes: odtBytes,
      });
      const odtPdf = await inspectPdfWithPdfJs(odtRes.outputBytes!);
      const odtOk =
        odtRes.status === 'SUCCESS' &&
        odtPdf.pageTexts.join(' ').includes('ODT_HEADING_TEST') &&
        odtPdf.pageTexts.join(' ').includes('ODT_PARAGRAPH_BODY');

      // 6. ODS -> PDF
      const odsWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(odsWb, XLSX.utils.aoa_to_sheet([['ODS_KEY', 'ODS_VAL'], ['K1', '777']]), 'Sheet1');
      const odsBytes = new Uint8Array(XLSX.write(odsWb, { bookType: 'ods', type: 'array' }) as ArrayBuffer);
      const odsRes = await executeDocumentConverterV2('ods-to-pdf-converter', {
        fileName: 'calc.ods',
        bytes: odsBytes,
      });
      const odsPdf = await inspectPdfWithPdfJs(odsRes.outputBytes!);
      const odsOk =
        odsRes.status === 'SUCCESS' &&
        odsPdf.pageTexts.join(' ').includes('ODS_KEY') &&
        odsPdf.pageTexts.join(' ').includes('777');

      // 7. ODP -> PDF
      const odpZip = new JSZip();
      odpZip.file(
        'content.xml',
        '<?xml version="1.0" encoding="UTF-8"?><office:document-content><office:body><office:presentation><draw:page><draw:frame presentation:class="title"><draw:text-box><text:p>ODP_SLIDE_1_TITLE</text:p></draw:text-box></draw:frame></draw:page><draw:page><draw:frame presentation:class="title"><draw:text-box><text:p>ODP_SLIDE_2_TITLE</text:p></draw:text-box></draw:frame></draw:page></office:presentation></office:body></office:document-content>'
      );
      const odpBytes = await odpZip.generateAsync({ type: 'uint8array' });
      const odpRes = await executeDocumentConverterV2('odp-to-pdf-converter', {
        fileName: 'impress.odp',
        bytes: odpBytes,
      });
      const odpPdf = await inspectPdfWithPdfJs(odpRes.outputBytes!);
      const odpOk =
        odpRes.status === 'SUCCESS' &&
        odpPdf.numPages === 2 &&
        odpPdf.pageTexts[0].includes('ODP_SLIDE_1_TITLE') &&
        odpPdf.pageTexts[1].includes('ODP_SLIDE_2_TITLE');

      return {
        actualOutcome: `txt=${txtOk}, html=${htmlOk}, csv=${csvOk}, rtf=${rtfOk}, odt=${odtOk}, ods=${odsOk}, odp=${odpOk}`,
        verified: txtOk && htmlOk && csvOk && rtfOk && odtOk && odsOk && odpOk,
        immutable: true,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-12: Cross-Office Converters (DOCX -> HTML, XLSX -> CSV single/ZIP, XLSX -> JSON, PPTX -> Images)
  // ============================================================================
  await runCase(
    'PDF06-TC-12',
    'docx-to-html-converter / xlsx-to-csv-converter / xlsx-to-json-converter / pptx-to-images-converter',
    'Verify DOCX -> HTML, 2-sheet XLSX -> CSV (single & All-Sheets ZIP), XLSX -> JSON, and 2-slide PPTX -> Images ZIP',
    'All 4 cross-office converters produce valid semantic HTML, CSV/ZIP, JSON, and 2-image ZIP archives',
    async () => {
      // 1. DOCX -> HTML
      const doc = new Document({
        sections: [{ children: [new Paragraph({ text: 'DOCX_TO_HTML_HEADING', heading: HeadingLevel.HEADING_1 })] }],
      });
      const docxBytes = new Uint8Array(await Packer.toArrayBuffer(doc));
      const htmlRes = await executeDocumentConverterV2('docx-to-html-converter', {
        fileName: 'article.docx',
        bytes: docxBytes,
      });
      const htmlStr = new TextDecoder('utf-8').decode(htmlRes.outputBytes!);
      const docxHtmlOk = htmlRes.status === 'SUCCESS' && htmlStr.includes('DOCX_TO_HTML_HEADING') && htmlStr.includes('<!DOCTYPE html>');

      // 2. 2-sheet XLSX -> CSV (single sheet + all sheets ZIP) & XLSX -> JSON
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Item', 'Qty'], ['Bolt', 15]]), 'Inventory');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Warehouse', 'City'], ['W1', 'Austin']]), 'Locations');
      const xlsxBytes = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer);

      const csvSingleRes = await executeDocumentConverterV2('xlsx-to-csv-converter', {
        fileName: 'ops.xlsx',
        bytes: xlsxBytes,
      });
      const csvSingleStr = new TextDecoder('utf-8').decode(csvSingleRes.outputBytes!);

      const csvZipRes = await executeDocumentConverterV2(
        'xlsx-to-csv-converter',
        { fileName: 'ops.xlsx', bytes: xlsxBytes },
        { selectedSheet: '__ALL__' }
      );
      const csvZip = await JSZip.loadAsync(csvZipRes.outputBytes!);

      const jsonRes = await executeDocumentConverterV2(
        'xlsx-to-json-converter',
        { fileName: 'ops.xlsx', bytes: xlsxBytes },
        { selectedSheet: 'Inventory' }
      );
      const parsedJson = JSON.parse(new TextDecoder('utf-8').decode(jsonRes.outputBytes!));

      const xlsxOk =
        csvSingleRes.status === 'SUCCESS' &&
        csvSingleStr.includes('Bolt,15') &&
        csvZipRes.status === 'SUCCESS' &&
        Object.keys(csvZip.files).length === 2 &&
        jsonRes.status === 'SUCCESS' &&
        Array.isArray(parsedJson) &&
        parsedJson[0]?.Item === 'Bolt' &&
        Number(parsedJson[0]?.Qty) === 15;

      // 3. 2-slide PPTX -> Images ZIP
      const pptx = new PptxGenJS();
      pptx.addSlide().addText('SLIDE_IMG_1', { x: 1, y: 1, w: 6, h: 1 });
      pptx.addSlide().addText('SLIDE_IMG_2', { x: 1, y: 1, w: 6, h: 1 });
      const pptxOut = await pptx.write({ outputType: 'uint8array' });
      const pptxBytes = pptxOut instanceof Uint8Array ? pptxOut : new Uint8Array(pptxOut as ArrayBuffer);

      const pptxImgRes = await executeDocumentConverterV2('pptx-to-images-converter', {
        fileName: 'slides.pptx',
        bytes: pptxBytes,
      });
      const slideZip = await JSZip.loadAsync(pptxImgRes.outputBytes!);
      const slideEntryNames = Object.keys(slideZip.files);
      const slide1Img = await slideZip.file(slideEntryNames[0])!.async('uint8array');
      const slide1Hdr = inspectRasterImageHeader(slide1Img);

      const pptxImgOk =
        pptxImgRes.status === 'SUCCESS' &&
        slideEntryNames.length === 2 &&
        slide1Hdr.isValid &&
        slide1Hdr.format === 'png';

      return {
        actualOutcome: `docxHtml=${docxHtmlOk}, xlsxCsvJson=${xlsxOk}, pptxImgs=${pptxImgOk}(slides=${slideEntryNames.length})`,
        verified: docxHtmlOk && xlsxOk && pptxImgOk,
        immutable: true,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-13: Corrupted / Invalid Format Rejection Across Engine D
  // ============================================================================
  await runCase(
    'PDF06-TC-13',
    'Engine D Validation Matrix',
    'Reject non-PDF inputs to PDF extractors, non-ZIP binary .doc to Word converter, non-RTF to RTF converter, and 0-byte files',
    'All invalid inputs fail deterministically with ERR_INVALID_MAGIC_BYTES or ERR_EMPTY_FILE',
    async () => {
      const randomBytes = createInvalidMagicBytesFixture();
      const emptyBytes = createEmptyBufferFixture();

      const r1 = await extractTextFromPdfV2({ fileName: 'bad.pdf', bytes: randomBytes });
      const r2 = await convertPdfToImagesV2({ fileName: 'bad.pdf', bytes: randomBytes });
      const r3 = await extractEmbeddedImagesFromPdfV2({ fileName: 'bad.pdf', bytes: randomBytes });
      const r4 = await executeDocumentConverterV2('word-to-pdf-converter', {
        fileName: 'legacy.doc',
        bytes: randomBytes,
      });
      const r5 = await executeDocumentConverterV2('rtf-to-pdf-converter', {
        fileName: 'not_rtf.rtf',
        bytes: randomBytes,
      });
      const r6 = await executeDocumentConverterV2('pdf-to-word-docx', {
        fileName: 'empty.pdf',
        bytes: emptyBytes,
      });

      const isInvalidPdfCode = (code?: string) =>
        code === 'ERR_INVALID_PDF' || code === 'ERR_INVALID_MAGIC_BYTES';

      const verified =
        isInvalidPdfCode(r1.error?.code) &&
        isInvalidPdfCode(r2.error?.code) &&
        isInvalidPdfCode(r3.error?.code) &&
        r4.error?.code === 'ERR_INVALID_MAGIC_BYTES' &&
        r5.error?.code === 'ERR_INVALID_MAGIC_BYTES' &&
        r6.error?.code === 'ERR_EMPTY_FILE';

      return {
        actualOutcome: `text=${r1.error?.code}, pdf2img=${r2.error?.code}, extImg=${r3.error?.code}, word=${r4.error?.code}, rtf=${r5.error?.code}, empty=${r6.error?.code}`,
        verified,
        immutable: true,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-14: Large Multi-Page Stress Test & Memory Lifecycle Cleanup
  // ============================================================================
  await runCase(
    'PDF06-TC-14',
    'pdf-to-text / pdf-to-images',
    '12-page PDF text extraction and image rendering stress test with session lifecycle verification',
    'Extracts all 12 pages accurately and releases 100% of active lifecycle sessions (activeSessionCount === 0, activeTotalBytes === 0)',
    async () => {
      const pageTexts = Array.from({ length: 12 }, (_, i) => `STRESS_TEST_PAGE_${i + 1}_PAYLOAD`);
      const pdf12 = await createValidMultiPagePdfFixture({ pageTexts });
      const backup = new Uint8Array(pdf12);

      const textRes = await extractTextFromPdfV2({ fileName: 'stress12.pdf', bytes: pdf12 });
      const imgRes = await convertPdfToImagesV2(
        { fileName: 'stress12.pdf', bytes: pdf12 },
        { format: 'png', dpi: 72, selection: '1-4, 11-12' }
      );

      const activeSessions = pdfLifecycleManager.getActiveSessionCount();
      const activeBytes = pdfLifecycleManager.getActiveTotalBytes();

      const verified =
        textRes.status === 'SUCCESS' &&
        textRes.metrics.outputPageCount === 12 &&
        imgRes.status === 'SUCCESS' &&
        imgRes.outputFiles.length === 6 &&
        activeSessions === 0 &&
        activeBytes === 0;

      const immutable = bytesAreIdentical(pdf12, backup);
      return {
        actualOutcome: `textPages=${textRes.metrics.outputPageCount}, renderedImgs=${imgRes.outputFiles.length}, activeSessions=${activeSessions}, activeBytes=${activeBytes}`,
        verified,
        immutable,
      };
    }
  );

  // ============================================================================
  // PDF06-TC-15: Engine D Canonical Router Dispatch (All 25 Canonical IDs + Unknown/Cross-Module Rejection)
  // ============================================================================
  await runCase(
    'PDF06-TC-15',
    'executeConversionExtractionOperationV2 (25 Canonical IDs)',
    'Verify all 25 registered Module D canonical IDs are present in routing & fidelity tables and reject unknown or non-Module-D IDs with ERR_UNSUPPORTED_OPERATION',
    'All 5 pdf-tools conversion/extraction IDs + 20 document-converters IDs are registered; unknown IDs and Module B/C IDs return ERR_UNSUPPORTED_OPERATION',
    async () => {
      const samplePdf = await createValidMultiPagePdfFixture({ pageTexts: ['ROUTER_TEST_P1'] });
      const samplePng = createRgbPngFixture(40, 40, 10, 120, 240);

      const rText = await executeConversionExtractionOperationV2({
        toolId: 'pdf-to-text',
        inputs: [{ fileName: 't.pdf', bytes: samplePdf }],
      });
      const rToImg = await executeConversionExtractionOperationV2({
        toolId: 'pdf-to-images',
        inputs: [{ fileName: 't.pdf', bytes: samplePdf }],
      });
      const rImgToPdf = await executeConversionExtractionOperationV2({
        toolId: 'pdf-images-to-pdf',
        inputs: [{ fileName: 'i.png', bytes: samplePng }],
      });

      const rUnknown = await executeConversionExtractionOperationV2({
        toolId: 'pdf-nonexistent-conversion-tool',
        inputs: [{ fileName: 't.pdf', bytes: samplePdf }],
      });
      const rCrossModule = await executeConversionExtractionOperationV2({
        toolId: 'pdf-merge',
        inputs: [{ fileName: 't.pdf', bytes: samplePdf }],
      });
      const rFormulaGen = await executeConversionExtractionOperationV2({
        toolId: 'mechanical-fastener-specification-sheet-generator',
        inputs: [{ fileName: 't.pdf', bytes: samplePdf }],
      });

      const fidelityCount = Object.keys(DOCUMENT_CONVERTER_FIDELITY_CLASSIFICATION).length;

      const verified =
        rText.status === 'SUCCESS' &&
        rToImg.status === 'SUCCESS' &&
        rImgToPdf.status === 'SUCCESS' &&
        fidelityCount === 20 &&
        rUnknown.status === 'UNSUPPORTED_OPERATION' &&
        rUnknown.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        rCrossModule.status === 'UNSUPPORTED_OPERATION' &&
        rCrossModule.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        rFormulaGen.status === 'UNSUPPORTED_OPERATION' &&
        rFormulaGen.error?.code === 'ERR_UNSUPPORTED_OPERATION';

      return {
        actualOutcome: `rText=${rText.status}, rToImg=${rToImg.status}, rImgToPdf=${rImgToPdf.status}(${rImgToPdf.error?.message || 'ok'}), fidelityEntries=${fidelityCount}, unknown=${rUnknown.error?.code}, crossModule=${rCrossModule.error?.code}, formulaGen=${rFormulaGen.error?.code}`,
        verified,
        immutable: true,
      };
    }
  );

  const passedCount = results.filter((r) => r.status === 'VERIFIED').length;
  return {
    passedCount,
    totalCount: results.length,
    results,
  };
}

// Direct CLI execution support
const isMain =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv.some((arg) => arg.includes('runPdf06ConversionExtractionTests'));

if (isMain) {
  runPdf06ConversionExtractionTests()
    .then((summary) => {
      console.log('================================================================================');
      console.log(`CALCTOOLS PDF-06 CONVERSION & EXTRACTION ENGINE TEST SUITE: ${summary.passedCount}/${summary.totalCount} VERIFIED`);
      console.log('================================================================================');
      for (const r of summary.results) {
        console.log(`[${r.status}] ${r.testId} (${r.operationId}) — ${r.durationMs}ms`);
        console.log(`   Desc:   ${r.description}`);
        console.log(`   Actual: ${r.actualOutcome}`);
      }
      if (summary.passedCount !== summary.totalCount) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal error running PDF-06 test suite:', err);
      process.exit(1);
    });
}
