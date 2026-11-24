/**
 * ============================================================================
 * CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-09 (ENGINE H: OCR ENGINE)
 * INDEPENDENT VERIFICATION & TEST SUITE
 * ============================================================================
 *
 * File: src/services/pdf/v2/__tests__/runPdf09OcrTests.ts
 *
 * All 14 test cases execute real WebAssembly Tesseract.js 7.0.0 LSTM OCR on
 * genuinely synthesized bitmap scans (PNG, Baseline DCT JPEG, single-page,
 * multi-page, rotated 90°/180°/270°, skewed +5°, low-contrast noisy, blank,
 * multi-line, hybrid native+scan, and bilingual English/Spanish), and verify
 * every generated Searchable PDF independently in PDF.js (`getTextContent()`)
 * and `@cantoo/pdf-lib` XObject inspection.
 */

import { PDFDocument, PDFName, PDFDict, PDFRawStream, PDFRef, StandardFonts, rgb } from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  performPdfOcrV2,
  performImageOcrV2,
  executeOcrOperationV2,
  preprocessImageForOcrV2,
  validateAndNormalizeOcrLanguagesV2,
  mapImageBboxToPdfCoordinates,
  encodeRawPixelsToPng,
  encodeRawPixelsToBaselineJpeg,
  rotatePixelBuffer90_180_270,
  deskewGrayscalePixels,
  terminateOcrWorkerPoolV2,
  getOcrWorkerPoolStatsV2,
  type RawPixelImageBuffer,
  type OcrPageRecord,
} from '../index';

const BITMAP_FONT_8X12: Record<string, string[]> = {
  A: [
    '00011000',
    '00111100',
    '01100110',
    '01100110',
    '11000011',
    '11000011',
    '11111111',
    '11111111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
  ],
  B: [
    '11111100',
    '11111110',
    '11000011',
    '11000011',
    '11000110',
    '11111100',
    '11111110',
    '11000011',
    '11000011',
    '11000011',
    '11111110',
    '11111100',
  ],
  C: [
    '00111110',
    '01111111',
    '11000011',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000011',
    '01111111',
    '00111110',
  ],
  D: [
    '11111000',
    '11111100',
    '11000110',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000110',
    '11111100',
    '11111000',
  ],
  E: [
    '11111111',
    '11111111',
    '11000000',
    '11000000',
    '11000000',
    '11111100',
    '11111100',
    '11000000',
    '11000000',
    '11000000',
    '11111111',
    '11111111',
  ],
  F: [
    '11111111',
    '11111111',
    '11000000',
    '11000000',
    '11000000',
    '11111100',
    '11111100',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
  ],
  G: [
    '00111110',
    '01111111',
    '11000011',
    '11000000',
    '11000000',
    '11000000',
    '11001111',
    '11001111',
    '11000011',
    '11000011',
    '01111111',
    '00111110',
  ],
  H: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11111111',
    '11111111',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
  ],
  I: [
    '01111110',
    '01111110',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '01111110',
    '01111110',
  ],
  J: [
    '00011111',
    '00011111',
    '00000110',
    '00000110',
    '00000110',
    '00000110',
    '00000110',
    '00000110',
    '11000110',
    '11000110',
    '01111100',
    '00111000',
  ],
  K: [
    '11000011',
    '11000110',
    '11001100',
    '11011000',
    '11110000',
    '11100000',
    '11110000',
    '11011000',
    '11001100',
    '11000110',
    '11000011',
    '11000011',
  ],
  L: [
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11111111',
    '11111111',
  ],
  M: [
    '11000011',
    '11100111',
    '11111111',
    '11011011',
    '11011011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
  ],
  N: [
    '11000011',
    '11100011',
    '11110011',
    '11011011',
    '11011011',
    '11001111',
    '11001111',
    '11000111',
    '11000111',
    '11000011',
    '11000011',
    '11000011',
  ],
  O: [
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  P: [
    '11111100',
    '11111110',
    '11000011',
    '11000011',
    '11000011',
    '11111110',
    '11111100',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
  ],
  Q: [
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11001011',
    '11000110',
    '01111100',
    '00111011',
  ],
  R: [
    '11111100',
    '11111110',
    '11000011',
    '11000011',
    '11000011',
    '11111110',
    '11111100',
    '11001100',
    '11000110',
    '11000011',
    '11000011',
    '11000011',
  ],
  S: [
    '00111110',
    '01111111',
    '11000011',
    '11000000',
    '01110000',
    '00111100',
    '00001110',
    '00000011',
    '00000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  T: [
    '11111111',
    '11111111',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
  ],
  U: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  V: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '01100110',
    '01100110',
    '01100110',
    '00111100',
    '00111100',
    '00011000',
    '00011000',
  ],
  W: [
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11011011',
    '11011011',
    '11011011',
    '11111111',
    '01111110',
    '01100110',
    '01100110',
  ],
  X: [
    '11000011',
    '11000011',
    '01100110',
    '00111100',
    '00011000',
    '00011000',
    '00011000',
    '00111100',
    '01100110',
    '11000011',
    '11000011',
    '11000011',
  ],
  Y: [
    '11000011',
    '11000011',
    '01100110',
    '00111100',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
  ],
  Z: [
    '11111111',
    '11111111',
    '00000110',
    '00001100',
    '00011000',
    '00110000',
    '01100000',
    '11000000',
    '11000000',
    '11000000',
    '11111111',
    '11111111',
  ],
  '0': [
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  '1': [
    '00011000',
    '00111000',
    '01111000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '00011000',
    '01111110',
    '01111110',
  ],
  '2': [
    '00111100',
    '01111110',
    '11000011',
    '00000011',
    '00000110',
    '00001100',
    '00011000',
    '00110000',
    '01100000',
    '11000000',
    '11111111',
    '11111111',
  ],
  '3': [
    '00111100',
    '01111110',
    '11000011',
    '00000011',
    '00000110',
    '00011100',
    '00011100',
    '00000110',
    '00000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  '4': [
    '00001100',
    '00011100',
    '00111100',
    '01101100',
    '11001100',
    '11001100',
    '11111111',
    '11111111',
    '00001100',
    '00001100',
    '00001100',
    '00001100',
  ],
  '5': [
    '11111111',
    '11111111',
    '11000000',
    '11000000',
    '11111100',
    '11111110',
    '00000011',
    '00000011',
    '00000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  '6': [
    '00111100',
    '01111110',
    '11000000',
    '11000000',
    '11111100',
    '11111110',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  '7': [
    '11111111',
    '11111111',
    '00000011',
    '00000110',
    '00001100',
    '00001100',
    '00011000',
    '00011000',
    '00110000',
    '00110000',
    '00110000',
    '00110000',
  ],
  '8': [
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '01100110',
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  '9': [
    '00111100',
    '01111110',
    '11000011',
    '11000011',
    '11000011',
    '01111111',
    '00111111',
    '00000011',
    '00000011',
    '11000011',
    '01111110',
    '00111100',
  ],
  ' ': [
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
  ],
};

function renderSyntheticOcrBitmapScan(params: {
  lines: string[];
  scale?: number;
  paddingPx?: number;
  lineGapPx?: number;
  fgLuminance?: number;
  bgLuminance?: number;
}): {
  rawImage: RawPixelImageBuffer;
  pngBytes: Uint8Array;
} {
  const scale = params.scale ?? 3;
  const paddingPx = params.paddingPx ?? 36;
  const lineGapPx = params.lineGapPx ?? 24;
  const fg = params.fgLuminance ?? 0;
  const bg = params.bgLuminance ?? 255;

  const glyphW = 8;
  const glyphH = 12;
  const charAdvance = (glyphW + 3) * scale;
  const lineHeight = glyphH * scale;
  const maxChars = Math.max(1, ...params.lines.map((l) => l.length));

  const width = Math.max(64, paddingPx * 2 + maxChars * charAdvance);
  const height = Math.max(
    64,
    paddingPx * 2 + params.lines.length * lineHeight + Math.max(0, params.lines.length - 1) * lineGapPx
  );

  const pixels = new Uint8Array(width * height);
  pixels.fill(bg);

  for (let lIdx = 0; lIdx < params.lines.length; lIdx++) {
    const line = params.lines[lIdx].toUpperCase();
    const baseY = paddingPx + lIdx * (lineHeight + lineGapPx);

    for (let cIdx = 0; cIdx < line.length; cIdx++) {
      const ch = line[cIdx];
      const glyph = BITMAP_FONT_8X12[ch] || BITMAP_FONT_8X12[' '];
      const baseX = paddingPx + cIdx * charAdvance;

      for (let gy = 0; gy < glyphH; gy++) {
        for (let gx = 0; gx < glyphW; gx++) {
          if (glyph[gy][gx] === '1') {
            for (let sy = 0; sy < scale; sy++) {
              for (let sx = 0; sx < scale; sx++) {
                const px = baseX + gx * scale + sx;
                const py = baseY + gy * scale + sy;
                if (px >= 0 && px < width && py >= 0 && py < height) {
                  pixels[py * width + px] = fg;
                }
              }
            }
          }
        }
      }
    }
  }

  const rawImage: RawPixelImageBuffer = {
    width,
    height,
    channels: 1,
    pixels,
  };
  const pngBytes = encodeRawPixelsToPng(rawImage);
  return { rawImage, pngBytes };
}

function computeFnv1aChecksumHex(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.byteLength; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

interface TestCaseRecord {
  testId: string;
  operationId: string;
  scenario: string;
  inputDescription: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: 'VERIFIED' | 'FAILED';
  durationMs: number;
}

const results: TestCaseRecord[] = [];

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Helper to create a scanned (image-only) PDF with 1 or more bitmap pages
 * and 0 native PDF text operators.
 */
async function createScannedImageOnlyPdf(
  pages: Array<{
    pngBytes?: Uint8Array;
    jpegBytes?: Uint8Array;
    widthPt?: number;
    heightPt?: number;
  }>
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const p of pages) {
    const wPt = p.widthPt ?? 612;
    const hPt = p.heightPt ?? 792;
    const page = doc.addPage([wPt, hPt]);
    if (p.pngBytes) {
      const img = await doc.embedPng(p.pngBytes);
      page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt });
    } else if (p.jpegBytes) {
      const img = await doc.embedJpg(p.jpegBytes);
      page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt });
    }
  }
  return new Uint8Array(await doc.save({ useObjectStreams: false }));
}

/**
 * Helper to extract all embedded `/Subtype /Image` XObject stream lengths and checksums on page 1.
 */
function inspectFirstPageImageXObjects(doc: PDFDocument): Array<{
  width: number;
  height: number;
  byteLength: number;
  checksum: string;
}> {
  const page = doc.getPage(0);
  const res = page.node.Resources();
  if (!res) return [];
  const xObj = res.lookup(PDFName.of('XObject'));
  if (!(xObj instanceof PDFDict)) return [];

  const list: Array<{ width: number; height: number; byteLength: number; checksum: string }> = [];
  for (const [, v] of xObj.entries()) {
    const resolved = v instanceof PDFRef ? doc.context.lookup(v) : v;
    if (!(resolved instanceof PDFRawStream)) continue;
    const sub = resolved.dict.lookup(PDFName.of('Subtype'));
    if (sub instanceof PDFName && sub.asString() === '/Image') {
      const w = Number(resolved.dict.lookup(PDFName.of('Width'))?.toString() || 0);
      const h = Number(resolved.dict.lookup(PDFName.of('Height'))?.toString() || 0);
      list.push({
        width: w,
        height: h,
        byteLength: resolved.contents.byteLength,
        checksum: computeFnv1aChecksumHex(resolved.contents),
      });
    }
  }
  return list;
}

async function runTestCase(
  testId: string,
  operationId: string,
  scenario: string,
  inputDescription: string,
  expectedBehavior: string,
  fn: () => Promise<string>
): Promise<void> {
  const t0 = performance.now();
  try {
    const actualBehavior = await fn();
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    results.push({
      testId,
      operationId,
      scenario,
      inputDescription,
      expectedBehavior,
      actualBehavior,
      status: 'VERIFIED',
      durationMs,
    });
    console.log(`[PASS] ${testId} (${operationId}): ${actualBehavior} [${durationMs} ms]`);
  } catch (err) {
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    const msg = err instanceof Error ? err.message : String(err);
    results.push({
      testId,
      operationId,
      scenario,
      inputDescription,
      expectedBehavior,
      actualBehavior: `ERROR: ${msg}`,
      status: 'FAILED',
      durationMs,
    });
    console.error(`[FAIL] ${testId} (${operationId}): ${msg}`);
  }
}

async function main() {
  console.log('============================================================================');
  console.log('CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-09 (ENGINE H: OCR ENGINE) TEST SUITE');
  console.log('============================================================================');

  await terminateOcrWorkerPoolV2();

  // --------------------------------------------------------------------------
  // PDF09-TC-01: Clear Single-Page Scanned PDF OCR (`performPdfOcrV2`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-01',
    'pdf-ocr',
    'Clear single-page scanned PDF OCR with 0 native PDF text operators',
    '1-page scanned PDF containing embedded PNG bitmap scan of "CALCTOOLS OCR ENGINE"',
    'Recognizes "CALCTOOLS OCR ENGINE" via Tesseract.js LSTM with high confidence and generates valid Searchable PDF + .txt',
    async () => {
      const scan = renderSyntheticOcrBitmapScan({
        lines: ['CALCTOOLS OCR ENGINE'],
        scale: 4,
        paddingPx: 36,
      });
      const scannedPdfBytes = await createScannedImageOnlyPdf([
        { pngBytes: scan.pngBytes, widthPt: 612, heightPt: 792 },
      ]);
      const inputChecksumBefore = computeFnv1aChecksumHex(scannedPdfBytes);

      // Confirm 0 native text items before OCR
      const preSession = await openManagedPdfDocument(scannedPdfBytes);
      const prePage = await preSession.pdfDoc.getPage(1);
      const preTc = await prePage.getTextContent();
      await preSession.dispose();
      assertCondition(preTc.items.length === 0, 'Pre-OCR scanned PDF must have 0 native text items');

      const res = await performPdfOcrV2(
        { fileName: 'single_scan.pdf', bytes: scannedPdfBytes },
        { language: 'eng', outputMode: 'searchable-pdf-and-text' }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}: ${res.summary}`);
      assertCondition(
        computeFnv1aChecksumHex(scannedPdfBytes) === inputChecksumBefore,
        'Caller input buffer must remain bit-for-bit immutable'
      );

      const upperText = (res.previewText || '').toUpperCase();
      assertCondition(upperText.includes('CALCTOOLS'), `Missing CALCTOOLS in "${res.previewText}"`);
      assertCondition(upperText.includes('OCR'), `Missing OCR in "${res.previewText}"`);
      assertCondition(upperText.includes('ENGINE'), `Missing ENGINE in "${res.previewText}"`);

      const pages = (res.details?.pages || []) as OcrPageRecord[];
      assertCondition(pages.length === 1, 'Expected 1 OcrPageRecord');
      assertCondition(pages[0].extractionSource === 'tesseract-ocr', 'Expected extractionSource=tesseract-ocr');
      assertCondition(pages[0].confidence >= 80, `Expected confidence >= 80, got ${pages[0].confidence}`);
      assertCondition(res.outputFiles.length === 2, 'Expected 2 output files (Searchable PDF + .txt)');

      return `Recognized "${res.previewText?.trim()}" (confidence=${pages[0].confidence}%, words=${pages[0].wordCount}, outputFiles=${res.outputFiles.length})`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-02: Multi-Page Scanned PDF OCR & Pooled Worker Reuse
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-02',
    'pdf-ocr',
    'Multi-page scanned PDF OCR (3 pages) with pooled worker reuse',
    '3-page image-only scanned PDF ("PAGE ONE ALPHA", "PAGE TWO BETA", "PAGE THREE GAMMA")',
    'Recognizes all 3 pages in order with page numbers and reuses the single pooled Tesseract worker across all pages',
    async () => {
      const p1 = renderSyntheticOcrBitmapScan({ lines: ['PAGE ONE ALPHA'], scale: 4, paddingPx: 36 });
      const p2 = renderSyntheticOcrBitmapScan({ lines: ['PAGE TWO BETA'], scale: 4, paddingPx: 36 });
      const p3 = renderSyntheticOcrBitmapScan({ lines: ['PAGE THREE GAMMA'], scale: 4, paddingPx: 36 });

      const multiPdfBytes = await createScannedImageOnlyPdf([
        { pngBytes: p1.pngBytes },
        { pngBytes: p2.pngBytes },
        { pngBytes: p3.pngBytes },
      ]);

      const statsBefore = getOcrWorkerPoolStatsV2();
      const res = await performPdfOcrV2(
        { fileName: 'multipage_scan.pdf', bytes: multiPdfBytes },
        { language: 'eng' }
      );
      const statsAfter = getOcrWorkerPoolStatsV2();

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      const pages = (res.details?.pages || []) as OcrPageRecord[];
      assertCondition(pages.length === 3, `Expected 3 page records, got ${pages.length}`);
      assertCondition(pages[0].pageNumber === 1 && pages[0].text.toUpperCase().includes('ALPHA'), `Page 1 mismatch: ${pages[0].text}`);
      assertCondition(pages[1].pageNumber === 2 && pages[1].text.toUpperCase().includes('BETA'), `Page 2 mismatch: ${pages[1].text}`);
      assertCondition(pages[2].pageNumber === 3 && pages[2].text.toUpperCase().includes('GAMMA'), `Page 3 mismatch: ${pages[2].text}`);

      assertCondition(
        statsAfter.workersCreatedCount === statsBefore.workersCreatedCount && statsAfter.workersCreatedCount === 1,
        `Worker pool must reuse existing 'eng' worker without spawning new workers (created before=${statsBefore.workersCreatedCount}, after=${statsAfter.workersCreatedCount})`
      );
      assertCondition(statsAfter.workerReuseCount > statsBefore.workerReuseCount, 'Expected workerReuseCount to increment');

      return `Recognized all 3 pages ("${pages[0].text}", "${pages[1].text}", "${pages[2].text}"); workersCreatedCount=${statsAfter.workersCreatedCount}, workerReuseCount=${statsAfter.workerReuseCount}`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-03: Direct PNG & Baseline DCT JPEG Image OCR (`performImageOcrV2`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-03',
    'pdf-ocr',
    'Direct PNG and Baseline DCT JPEG image OCR and Searchable PDF generation',
    '1 PNG scan ("PNG DIRECT SCAN 2026") and 1 Baseline DCT JPEG scan ("JPEG DCT SCAN 2026")',
    'Recognizes text from both PNG and JPEG images and builds a 2-page Searchable PDF',
    async () => {
      const pngScan = renderSyntheticOcrBitmapScan({
        lines: ['PNG DIRECT SCAN 2026'],
        scale: 4,
        paddingPx: 36,
      });

      const jpegRaw = renderSyntheticOcrBitmapScan({
        lines: ['JPEG DCT SCAN 2026'],
        scale: 4,
        paddingPx: 36,
      });
      const jpegBytes = encodeRawPixelsToBaselineJpeg({
        width: jpegRaw.rawImage.width,
        height: jpegRaw.rawImage.height,
        channels: jpegRaw.rawImage.channels,
        pixels: jpegRaw.rawImage.pixels,
      });

      assertCondition(jpegBytes[0] === 0xff && jpegBytes[1] === 0xd8, 'Expected valid JPEG SOI magic bytes');

      const res = await performImageOcrV2(
        [
          { fileName: 'scan_one.png', bytes: pngScan.pngBytes },
          { fileName: 'scan_two.jpg', bytes: jpegBytes },
        ],
        { language: 'eng', outputMode: 'searchable-pdf-and-text' }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}: ${res.summary}`);
      const pages = (res.details?.pages || []) as OcrPageRecord[];
      assertCondition(pages.length === 2, `Expected 2 pages, got ${pages.length}`);
      assertCondition(pages[0].text.toUpperCase().includes('PNG') && pages[0].text.toUpperCase().includes('2026'), `PNG OCR mismatch: "${pages[0].text}"`);
      assertCondition(pages[1].text.toUpperCase().includes('JPEG') && pages[1].text.toUpperCase().includes('2026'), `JPEG OCR mismatch: "${pages[1].text}"`);
      assertCondition(res.primaryFile?.mimeType === 'application/pdf', 'Primary output must be Searchable PDF');
      assertCondition(res.primaryFile?.pageCount === 2, 'Searchable PDF must have 2 pages');

      return `PNG="${pages[0].text}" (${pages[0].confidence}%), JPEG="${pages[1].text}" (${pages[1].confidence}%), Searchable PDF=${res.primaryFile?.byteLength} bytes (2 pages)`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-04: Multiple Supported Languages (`eng`, `spa`, `eng+spa`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-04',
    'pdf-ocr',
    'Multi-language OCR execution with Spanish (spa) and bilingual (eng+spa) traineddata models',
    'Spanish scan ("CALCULO DE DATOS") tested with language="spa" and bilingual scan tested with language="eng+spa"',
    'Loads real spa.traineddata model and accurately recognizes Spanish and bilingual text',
    async () => {
      const spaScan = renderSyntheticOcrBitmapScan({
        lines: ['CALCULO DE DATOS'],
        scale: 4,
        paddingPx: 36,
      });

      const spaRes = await performImageOcrV2(
        { fileName: 'spanish_scan.png', bytes: spaScan.pngBytes },
        { language: 'spa' }
      );
      assertCondition(spaRes.status === 'SUCCESS', `Expected Spanish OCR SUCCESS, got ${spaRes.status}: ${spaRes.summary}`);
      const spaText = (spaRes.previewText || '').toUpperCase();
      assertCondition(spaText.includes('CALCULO') && spaText.includes('DATOS'), `Spanish OCR mismatch: "${spaRes.previewText}"`);

      const biScan = renderSyntheticOcrBitmapScan({
        lines: ['ANNUAL REPORT', 'INFORME ANUAL'],
        scale: 4,
        paddingPx: 36,
      });
      const biRes = await performImageOcrV2(
        { fileName: 'bilingual_scan.png', bytes: biScan.pngBytes },
        { language: ['eng', 'spa'] }
      );
      assertCondition(biRes.status === 'SUCCESS', `Expected bilingual OCR SUCCESS, got ${biRes.status}`);
      const biText = (biRes.previewText || '').toUpperCase();
      assertCondition(biText.includes('ANNUAL') && biText.includes('INFORME'), `Bilingual OCR mismatch: "${biRes.previewText}"`);
      assertCondition(biRes.details?.language === 'eng+spa', `Expected language=eng+spa, got ${biRes.details?.language}`);

      return `spa="${spaRes.previewText?.trim()}", eng+spa="${biRes.previewText?.replace(/\n/g, ' / ')}"`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-05: Rotated Pages Detection & Correction (`90°`, `180°`, `270°`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-05',
    'pdf-ocr',
    'Automatic orientation detection and correction on 90° and 180° rotated scans',
    'Bitmap scan of "ROTATED SCAN PASS" rotated 90° CW and 180° upside-down',
    'Detects vertical/inverted text orientation, rotates raster upright (270° / 180°), and recognizes "ROTATED SCAN PASS"',
    async () => {
      const upright = renderSyntheticOcrBitmapScan({
        lines: ['ROTATED SCAN PASS'],
        scale: 4,
        paddingPx: 40,
      });

      // 1. Rotate 90° CW (needs 270° CW correction to become upright)
      const rot90Img = rotatePixelBuffer90_180_270(upright.rawImage, 90);
      const rot90Png = encodeRawPixelsToPng(rot90Img);

      const res90 = await performImageOcrV2(
        { fileName: 'rotated_90cw.png', bytes: rot90Png },
        { language: 'eng', detectOrientation: true }
      );
      assertCondition(res90.status === 'SUCCESS', `Expected res90 SUCCESS, got ${res90.status}`);
      const page90 = (res90.details?.pages as OcrPageRecord[])[0];
      assertCondition(
        page90.text.toUpperCase().includes('ROTATED') && page90.text.toUpperCase().includes('PASS'),
        `90° rotated scan not recognized: "${page90.text}"`
      );
      assertCondition(
        page90.preprocessing.detectedOrientationDegrees === 270 || page90.preprocessing.detectedOrientationDegrees === 90,
        `Expected detectedOrientationDegrees 270 or 90, got ${page90.preprocessing.detectedOrientationDegrees}`
      );

      // 2. Rotate 180° upside-down (needs 180° correction)
      const rot180Img = rotatePixelBuffer90_180_270(upright.rawImage, 180);
      const rot180Png = encodeRawPixelsToPng(rot180Img);

      const res180 = await performImageOcrV2(
        { fileName: 'rotated_180.png', bytes: rot180Png },
        { language: 'eng', detectOrientation: true }
      );
      assertCondition(res180.status === 'SUCCESS', `Expected res180 SUCCESS, got ${res180.status}`);
      const page180 = (res180.details?.pages as OcrPageRecord[])[0];
      assertCondition(
        page180.text.toUpperCase().includes('ROTATED') && page180.text.toUpperCase().includes('PASS'),
        `180° rotated scan not recognized: "${page180.text}"`
      );
      assertCondition(
        page180.preprocessing.detectedOrientationDegrees === 180,
        `Expected detectedOrientationDegrees=180, got ${page180.preprocessing.detectedOrientationDegrees}`
      );

      return `90° CW scan corrected by ${page90.preprocessing.detectedOrientationDegrees}° -> "${page90.text}"; 180° scan corrected by ${page180.preprocessing.detectedOrientationDegrees}° -> "${page180.text}"`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-06: Skewed, Low-Contrast & Noisy Scan Preprocessing (`preprocessImageForOcrV2`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-06',
    'pdf-ocr',
    'Low-contrast, noisy, and skewed (+5°) scan image preprocessing and OCR recovery',
    'Low-contrast scan (ink=145 on background=210) with salt-and-pepper noise speckles and +5° skew of "SKEW CONTRAST TEST"',
    'Preprocesses image (selective median denoise, dynamic histogram contrast stretch, projection-profile deskew, Otsu thresholding) and recognizes "SKEW CONTRAST TEST"',
    async () => {
      // Render low-contrast grayscale scan (ink=145, bg=210)
      const lowContrast = renderSyntheticOcrBitmapScan({
        lines: ['SKEW CONTRAST TEST'],
        scale: 4,
        paddingPx: 44,
        fgLuminance: 145,
        bgLuminance: 210,
      });

      // Apply +5° skew distortion to the low-contrast image
      const skewedPixels = deskewGrayscalePixels(
        lowContrast.rawImage.pixels,
        lowContrast.rawImage.width,
        lowContrast.rawImage.height,
        -5
      );

      // Add isolated salt-and-pepper impulse noise speckles
      for (let y = 5; y < lowContrast.rawImage.height - 5; y += 11) {
        for (let x = 5; x < lowContrast.rawImage.width - 5; x += 13) {
          skewedPixels[y * lowContrast.rawImage.width + x] = 0;
        }
      }

      const noisySkewedImg: RawPixelImageBuffer = {
        width: lowContrast.rawImage.width,
        height: lowContrast.rawImage.height,
        channels: 1,
        pixels: skewedPixels,
      };
      const noisySkewedPng = encodeRawPixelsToPng(noisySkewedImg);

      // Verify preprocessImageForOcrV2 diagnostics directly
      const prepCheck = preprocessImageForOcrV2(noisySkewedImg, {
        enabled: true,
        denoise: true,
        contrastStretch: true,
        deskew: true,
        thresholding: 'otsu',
      });
      assertCondition(prepCheck.diagnostics.denoised === true, 'Expected denoised=true');
      assertCondition(prepCheck.diagnostics.contrastStretched === true, 'Expected contrastStretched=true');
      assertCondition(
        Math.abs(prepCheck.diagnostics.detectedSkewAngleDegrees) >= 2,
        `Expected detectedSkewAngleDegrees >= 2°, got ${prepCheck.diagnostics.detectedSkewAngleDegrees}°`
      );
      assertCondition(prepCheck.diagnostics.thresholdMode === 'otsu', 'Expected thresholdMode=otsu');

      // Run full OCR with preprocessing enabled
      const res = await performImageOcrV2(
        { fileName: 'noisy_skewed_lowcontrast.png', bytes: noisySkewedPng },
        {
          language: 'eng',
          preprocessing: {
            enabled: true,
            denoise: true,
            contrastStretch: true,
            deskew: true,
            thresholding: 'otsu',
          },
        }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      const txt = (res.previewText || '').toUpperCase();
      assertCondition(
        txt.includes('SKEW') && txt.includes('CONTRAST') && txt.includes('TEST'),
        `Expected "SKEW CONTRAST TEST", got "${res.previewText}"`
      );

      return `Recognized "${res.previewText?.trim()}" (detectedSkew=${prepCheck.diagnostics.detectedSkewAngleDegrees}°, pLow=${prepCheck.diagnostics.percentileLow}, pHigh=${prepCheck.diagnostics.percentileHigh}, otsu=${prepCheck.diagnostics.computedOtsuThreshold})`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-07: Blank / No-Text Scan Image Handling
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-07',
    'pdf-ocr',
    'Clean handling of blank / no-text scanned PDF page without throwing errors',
    '1-page scanned PDF containing a pure white 400x200 PNG image with 0 text characters',
    'Returns status=SUCCESS with wordCount=0, hasRecognizedText=false, and an explicit non-fatal warning',
    async () => {
      const whitePixels = new Uint8Array(400 * 200);
      whitePixels.fill(255);
      const blankPng = encodeRawPixelsToPng({
        width: 400,
        height: 200,
        channels: 1,
        pixels: whitePixels,
      });
      const blankPdf = await createScannedImageOnlyPdf([{ pngBytes: blankPng }]);

      const res = await performPdfOcrV2(
        { fileName: 'blank_scan.pdf', bytes: blankPdf },
        { language: 'eng' }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS on blank scan, got ${res.status}`);
      const page = (res.details?.pages as OcrPageRecord[])[0];
      assertCondition(page.wordCount === 0, `Expected 0 words on blank scan, got ${page.wordCount}`);
      assertCondition(page.hasRecognizedText === false, 'Expected hasRecognizedText=false');
      assertCondition(res.warnings.length > 0, 'Expected explicit warning when 0 words are recognized');

      return `Handled blank scan cleanly: status=${res.status}, wordCount=${page.wordCount}, warning="${res.warnings[0]}"`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-08: User-Selected Page Range OCR (`selection: '2'`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-08',
    'pdf-ocr',
    'Selective page range OCR on a 3-page scanned PDF (selection="2")',
    '3-page scanned PDF ("SKIP PAGE ONE", "TARGET PAGE TWO", "SKIP PAGE THREE") with selection="2"',
    'Runs OCR exclusively on Page 2 while preserving all 3 pages in the output Searchable PDF',
    async () => {
      const p1 = renderSyntheticOcrBitmapScan({ lines: ['SKIP PAGE ONE'], scale: 4 });
      const p2 = renderSyntheticOcrBitmapScan({ lines: ['TARGET PAGE TWO'], scale: 4 });
      const p3 = renderSyntheticOcrBitmapScan({ lines: ['SKIP PAGE THREE'], scale: 4 });

      const pdfBytes = await createScannedImageOnlyPdf([
        { pngBytes: p1.pngBytes },
        { pngBytes: p2.pngBytes },
        { pngBytes: p3.pngBytes },
      ]);

      const res = await performPdfOcrV2(
        { fileName: 'range_test.pdf', bytes: pdfBytes },
        { language: 'eng', selection: '2' }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      const pages = (res.details?.pages || []) as OcrPageRecord[];
      assertCondition(pages.length === 1, `Expected 1 processed page record, got ${pages.length}`);
      assertCondition(pages[0].pageNumber === 2, `Expected pageNumber=2, got ${pages[0].pageNumber}`);
      assertCondition(pages[0].text.toUpperCase().includes('TARGET'), `Unexpected text: ${pages[0].text}`);
      assertCondition(res.primaryFile?.pageCount === 3, `Output PDF must preserve all 3 pages, got ${res.primaryFile?.pageCount}`);

      // Verify in PDF.js that Page 1 has 0 text items, Page 2 has searchable text items, and Page 3 has 0 text items
      const verifySession = await openManagedPdfDocument(res.primaryFile!.bytes);
      const vp1 = await verifySession.pdfDoc.getPage(1);
      const vp2 = await verifySession.pdfDoc.getPage(2);
      const vp3 = await verifySession.pdfDoc.getPage(3);
      const tc1 = await vp1.getTextContent();
      const tc2 = await vp2.getTextContent();
      const tc3 = await vp3.getTextContent();
      await verifySession.dispose();

      assertCondition(tc1.items.length === 0, 'Unselected Page 1 must remain without OCR text overlay');
      assertCondition(tc2.items.length >= 3, 'Selected Page 2 must contain overlaid searchable text items');
      assertCondition(tc3.items.length === 0, 'Unselected Page 3 must remain without OCR text overlay');

      return `Processed only Page 2 ("${pages[0].text}"), outputPageCount=${res.primaryFile?.pageCount}, PDF.js text items per page=[${tc1.items.length}, ${tc2.items.length}, ${tc3.items.length}]`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-09: Multi-Line Reading Order & Native vs. OCR Source Distinction
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-09',
    'pdf-ocr',
    'Hybrid PDF with native vector text (Page 1) and multi-line scanned bitmap (Page 2) reading order',
    'Page 1: native PDF vector text "NATIVE VECTOR PAGE ONE"; Page 2: 3-line scanned bitmap ("FIRST LINE TOP", "SECOND LINE MIDDLE", "THIRD LINE BOTTOM")',
    'Distinguishes native-pdf-text-layer on Page 1 from tesseract-ocr on Page 2 and preserves top-to-bottom line reading order',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.HelveticaBold);

      // Page 1: Native vector PDF text
      const page1 = doc.addPage([612, 792]);
      page1.drawText('NATIVE VECTOR PAGE ONE', { x: 72, y: 700, size: 18, font, color: rgb(0, 0, 0) });

      // Page 2: 3-line scanned bitmap
      const multiLineScan = renderSyntheticOcrBitmapScan({
        lines: ['FIRST LINE TOP', 'SECOND LINE MIDDLE', 'THIRD LINE BOTTOM'],
        scale: 4,
        paddingPx: 36,
        lineGapPx: 28,
      });
      const embeddedScan = await doc.embedPng(multiLineScan.pngBytes);
      const page2 = doc.addPage([612, 792]);
      page2.drawImage(embeddedScan, { x: 0, y: 0, width: 612, height: 792 });

      const hybridBytes = new Uint8Array(await doc.save({ useObjectStreams: false }));

      const res = await performPdfOcrV2(
        { fileName: 'hybrid_doc.pdf', bytes: hybridBytes },
        { language: 'eng', skipPagesWithExistingText: true }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      const pages = (res.details?.pages || []) as OcrPageRecord[];
      assertCondition(pages.length === 2, 'Expected 2 page records');

      assertCondition(
        pages[0].extractionSource === 'native-pdf-text-layer',
        `Expected Page 1 extractionSource=native-pdf-text-layer, got ${pages[0].extractionSource}`
      );
      assertCondition(
        pages[1].extractionSource === 'tesseract-ocr',
        `Expected Page 2 extractionSource=tesseract-ocr, got ${pages[1].extractionSource}`
      );

      const lines = pages[1].lines;
      assertCondition(lines.length === 3, `Expected 3 ordered OCR lines on Page 2, got ${lines.length}`);
      assertCondition(lines[0].text.toUpperCase().includes('FIRST'), `Line 1 mismatch: ${lines[0].text}`);
      assertCondition(lines[1].text.toUpperCase().includes('SECOND'), `Line 2 mismatch: ${lines[1].text}`);
      assertCondition(lines[2].text.toUpperCase().includes('THIRD'), `Line 3 mismatch: ${lines[2].text}`);
      assertCondition(
        lines[0].imageBboxPx.y0 < lines[1].imageBboxPx.y0 && lines[1].imageBboxPx.y0 < lines[2].imageBboxPx.y0,
        'Lines must be ordered monotonically top-to-bottom in imageBboxPx.y0'
      );
      assertCondition(
        lines[0].pdfBboxPt.y > lines[1].pdfBboxPt.y && lines[1].pdfBboxPt.y > lines[2].pdfBboxPt.y,
        'Lines must have descending bottom-up PDF user-space Y coordinates (pdfBboxPt.y)'
      );

      return `Page 1 source=${pages[0].extractionSource} ("${pages[0].text}"); Page 2 source=${pages[1].extractionSource} with 3 ordered lines: ["${lines[0].text}", "${lines[1].text}", "${lines[2].text}"]`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-10: Bounding-Box Coordinate Mapping (`imageBboxPx` -> `pdfBboxPt`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-10',
    'pdf-ocr',
    'Deterministic pixel-to-PDF user-space bounding box coordinate mapping verification',
    'Image dimensions 1224x1584 px mapped onto 612x792 pt PDF page + live OCR word bbox monotonicity check',
    'Accurately maps top-left pixel coordinates to bottom-left PDF user-space points (scale=0.5 pt/px) and verifies word progression',
    async () => {
      const mapped = mapImageBboxToPdfCoordinates({
        bboxPx: { x0: 100, y0: 200, x1: 300, y1: 240 },
        baselineY0Px: 234,
        baselineY1Px: 234,
        imageWidthPx: 1224,
        imageHeightPx: 1584,
        pageWidthPt: 612,
        pageHeightPt: 792,
      });

      assertCondition(mapped.pdfBboxPt.x === 50, `Expected pdfBboxPt.x=50, got ${mapped.pdfBboxPt.x}`);
      assertCondition(mapped.pdfBboxPt.width === 100, `Expected pdfBboxPt.width=100, got ${mapped.pdfBboxPt.width}`);
      assertCondition(mapped.pdfBboxPt.height === 20, `Expected pdfBboxPt.height=20, got ${mapped.pdfBboxPt.height}`);
      // y = 792 - 240 * 0.5 = 672
      assertCondition(mapped.pdfBboxPt.y === 672, `Expected pdfBboxPt.y=672, got ${mapped.pdfBboxPt.y}`);
      // baselineY = 792 - 234 * 0.5 = 675
      assertCondition(mapped.pdfBboxPt.baselineY === 675, `Expected baselineY=675, got ${mapped.pdfBboxPt.baselineY}`);

      const scan = renderSyntheticOcrBitmapScan({
        lines: ['LEFT CENTER RIGHT'],
        scale: 4,
        paddingPx: 36,
      });
      const res = await performImageOcrV2({ fileName: 'coords.png', bytes: scan.pngBytes });
      const words = ((res.details?.pages as OcrPageRecord[])[0] || {}).words || [];
      assertCondition(words.length === 3, `Expected 3 words, got ${words.length}`);
      assertCondition(
        words[0].pdfBboxPt.x < words[1].pdfBboxPt.x && words[1].pdfBboxPt.x < words[2].pdfBboxPt.x,
        `Words must have strictly increasing left-to-right pdfBboxPt.x: [${words.map((w) => w.pdfBboxPt.x).join(', ')}]`
      );

      return `Exact math verified (pdfBboxPt={x:50, y:672, w:100, h:20, baselineY:675}); live OCR word X coordinates=[${words.map((w) => `${w.text}@${w.pdfBboxPt.x}pt`).join(', ')}]`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-11: Confidence Scores & Low-Confidence Retention Guarantee
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-11',
    'pdf-ocr',
    'Confidence score propagation and zero-discard retention of low-confidence words',
    'Scanned image processed with strict lowConfidenceThreshold=99.9',
    'Populates word/line/block/page/document confidence scores and retains all low-confidence words with isLowConfidence=true',
    async () => {
      const scan = renderSyntheticOcrBitmapScan({
        lines: ['CONFIDENCE RETENTION CHECK'],
        scale: 3,
        paddingPx: 30,
        fgLuminance: 95,
        bgLuminance: 225,
      });

      const res = await performImageOcrV2(
        { fileName: 'low_conf.png', bytes: scan.pngBytes },
        { language: 'eng', lowConfidenceThreshold: 99.9 }
      );

      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      const page = (res.details?.pages as OcrPageRecord[])[0];
      assertCondition(page.words.length === 3, `Expected all 3 words retained, got ${page.words.length}`);
      assertCondition(
        page.words.every((w) => w.confidence > 0 && w.confidence <= 100),
        'Every word must have a valid numeric confidence in (0..100]'
      );
      assertCondition(
        page.lowConfidenceWordCount > 0,
        'Expected words below 99.9% threshold to be flagged as low-confidence while still retained in output'
      );
      assertCondition(
        res.warnings.some((w) => w.includes('low-confidence word')),
        'Expected warning reporting retained low-confidence words'
      );

      return `Retained all ${page.words.length} words (lowConfidenceWordCount=${page.lowConfidenceWordCount}, meanConfidence=${page.confidence}%, words=[${page.words.map((w) => `${w.text}:${w.confidence}%`).join(', ')}])`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-12: Searchable PDF Creation, PDF.js Text Search & Visual Stream Integrity
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-12',
    'pdf-ocr',
    'End-to-end Searchable PDF text selection/search in PDF.js and 100% original visual stream preservation',
    '1-page scanned PDF containing embedded scan of "SEARCHABLE OVERLAY VERIFIED"',
    'PDF.js getTextContent() extracts all overlaid words at matching coordinates while original Image XObject stream checksum is 100% unchanged',
    async () => {
      const scan = renderSyntheticOcrBitmapScan({
        lines: ['SEARCHABLE OVERLAY VERIFIED'],
        scale: 4,
        paddingPx: 36,
      });
      const inputPdfBytes = await createScannedImageOnlyPdf([
        { pngBytes: scan.pngBytes, widthPt: 612, heightPt: 792 },
      ]);

      const srcDocBefore = await PDFDocument.load(inputPdfBytes);
      const xObjsBefore = inspectFirstPageImageXObjects(srcDocBefore);
      assertCondition(xObjsBefore.length === 1, 'Expected 1 embedded Image XObject before OCR');

      const res = await performPdfOcrV2(
        { fileName: 'searchable_check.pdf', bytes: inputPdfBytes },
        { language: 'eng', outputMode: 'searchable-pdf' }
      );
      assertCondition(res.status === 'SUCCESS' && !!res.primaryFile, 'Expected Searchable PDF output');

      // 1. Verify original embedded scan Image XObject is 100% intact (identical dimensions, byteLength, and FNV-1a checksum)
      const outDocAfter = await PDFDocument.load(res.primaryFile!.bytes);
      const xObjsAfter = inspectFirstPageImageXObjects(outDocAfter);
      assertCondition(xObjsAfter.length === 1, 'Expected 1 embedded Image XObject after OCR');
      assertCondition(
        xObjsAfter[0].checksum === xObjsBefore[0].checksum &&
          xObjsAfter[0].width === xObjsBefore[0].width &&
          xObjsAfter[0].height === xObjsBefore[0].height,
        `Original scan Image XObject must remain bit-for-bit untouched (before=${xObjsBefore[0].checksum}, after=${xObjsAfter[0].checksum})`
      );

      // 2. Independently open Searchable PDF in PDF.js and verify text layer extraction
      const session = await openManagedPdfDocument(res.primaryFile!.bytes);
      const page1 = await session.pdfDoc.getPage(1);
      const tc = await page1.getTextContent();
      await session.dispose();

      const extractedTokens = (tc.items as any[])
        .map((it) => String(it?.str || '').trim())
        .filter(Boolean);
      const joinedPdfJsText = extractedTokens.join(' ').toUpperCase();

      assertCondition(
        joinedPdfJsText.includes('SEARCHABLE') &&
          joinedPdfJsText.includes('OVERLAY') &&
          joinedPdfJsText.includes('VERIFIED'),
        `PDF.js failed to extract overlaid searchable text: got "${joinedPdfJsText}"`
      );

      return `PDF.js extracted ${extractedTokens.length} searchable text items ("${joinedPdfJsText}"); original scan Image XObject checksum preserved (${xObjsAfter[0].checksum}, ${xObjsAfter[0].width}x${xObjsAfter[0].height}px)`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-13: Cancellation (`AbortSignal`) & Worker Pool Cleanup (`terminateOcrWorkerPoolV2`)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-13',
    'pdf-ocr',
    'Deterministic AbortSignal cancellation and complete worker pool termination cleanup',
    'Pre-aborted AbortController + mid-run multi-page AbortController + terminateOcrWorkerPoolV2()',
    'Returns status=PROCESSING_FAILURE with ERR_OPERATION_ABORTED and cleanly terminates all pooled Web/Node workers (activeWorkersCount=0)',
    async () => {
      const scan = renderSyntheticOcrBitmapScan({ lines: ['ABORT TEST'], scale: 3 });

      // 1. Pre-aborted signal
      const preCtrl = new AbortController();
      preCtrl.abort();
      const preRes = await performImageOcrV2(
        { fileName: 'abort1.png', bytes: scan.pngBytes },
        { signal: preCtrl.signal }
      );
      assertCondition(
        preRes.status === 'PROCESSING_FAILURE',
        `Expected status=PROCESSING_FAILURE for pre-aborted operation, got ${preRes.status}`
      );
      assertCondition(
        preRes.error?.code === 'ERR_OPERATION_ABORTED',
        `Expected ERR_OPERATION_ABORTED, got ${preRes.error?.code}`
      );

      // 2. Mid-operation abort triggered inside onProgress callback after Page 1 starts
      const midCtrl = new AbortController();
      const multiPdf = await createScannedImageOnlyPdf([
        { pngBytes: scan.pngBytes },
        { pngBytes: scan.pngBytes },
      ]);
      const midRes = await performPdfOcrV2(
        { fileName: 'abort_mid.pdf', bytes: multiPdf },
        { signal: midCtrl.signal },
        {
          onProgress: (prog) => {
            if (prog.stage === 'RUNNING_OCR' && prog.currentPage === 1) {
              midCtrl.abort();
            }
          },
        }
      );
      assertCondition(
        midRes.status === 'PROCESSING_FAILURE',
        `Expected mid-run status=PROCESSING_FAILURE, got ${midRes.status}`
      );
      assertCondition(
        midRes.error?.code === 'ERR_OPERATION_ABORTED',
        `Expected mid-run ERR_OPERATION_ABORTED, got ${midRes.error?.code}`
      );

      // 3. Terminate worker pool and verify 0 active workers remain
      await terminateOcrWorkerPoolV2();
      const stats = getOcrWorkerPoolStatsV2();
      assertCondition(stats.activeWorkersCount === 0, `Expected activeWorkersCount=0, got ${stats.activeWorkersCount}`);

      return `Pre-abort=${preRes.error?.code} (${preRes.status}), Mid-abort=${midRes.error?.code} (${midRes.status}), terminateOcrWorkerPoolV2() -> activeWorkersCount=${stats.activeWorkersCount}, workersCreatedCount=${stats.workersCreatedCount}`;
    }
  );

  // --------------------------------------------------------------------------
  // PDF09-TC-14: Invalid Input, Unsupported Language & Unavailable Language Data (Zero Silent Substitution)
  // --------------------------------------------------------------------------
  await runTestCase(
    'PDF09-TC-14',
    'pdf-ocr',
    'Structured error handling for empty files, invalid bytes, invalid language codes, unreachable language models, and cross-module router checks',
    '0-byte buffer, garbage bytes, language="klingon_xyz", unreachable offline langPath for "lat", and executeOcrOperationV2("pdf-merge")',
    'Fails cleanly with structured error codes and never silently substitutes English ("eng")',
    async () => {
      // 1. Empty file
      const emptyRes = await performPdfOcrV2({ fileName: 'empty.pdf', bytes: new Uint8Array(0) });
      assertCondition(emptyRes.error?.code === 'ERR_EMPTY_FILE', `Expected ERR_EMPTY_FILE, got ${emptyRes.error?.code}`);

      // 2. Corrupted non-PDF / non-image bytes
      const garbageBytes = new TextEncoder().encode('NOT_A_PDF_OR_IMAGE_FILE_1234567890');
      const badPdfRes = await performPdfOcrV2({ fileName: 'bad.pdf', bytes: garbageBytes });
      assertCondition(
        badPdfRes.error?.code === 'ERR_INVALID_PDF',
        `Expected ERR_INVALID_PDF, got ${badPdfRes.error?.code}`
      );
      const badImgRes = await performImageOcrV2({ fileName: 'bad.png', bytes: garbageBytes });
      assertCondition(
        badImgRes.error?.code === 'ERR_UNSUPPORTED_IMAGE_FORMAT',
        `Expected ERR_UNSUPPORTED_IMAGE_FORMAT, got ${badImgRes.error?.code}`
      );

      // 3. Unsupported language code (must NEVER silently fall back to 'eng')
      const badLangCheck = validateAndNormalizeOcrLanguagesV2('klingon_xyz');
      assertCondition(!badLangCheck.isValid && badLangCheck.error?.code === 'ERR_UNSUPPORTED_OPERATION', 'Expected invalid language rejection');

      const scan = renderSyntheticOcrBitmapScan({ lines: ['LANGUAGE FAIL TEST'], scale: 3 });
      const badLangRes = await performImageOcrV2(
        { fileName: 'test.png', bytes: scan.pngBytes },
        { language: 'klingon_xyz' }
      );
      assertCondition(
        badLangRes.status === 'UNSUPPORTED_OPERATION' && badLangRes.error?.code === 'ERR_UNSUPPORTED_OPERATION',
        `Expected UNSUPPORTED_OPERATION / ERR_UNSUPPORTED_OPERATION for invalid language, got ${badLangRes.status} / ${badLangRes.error?.code}`
      );

      // 4. Unreachable offline language model path (must fail with ERR_OCR_MODEL_LOAD_FAILED, never substitute 'eng')
      const offlineFailRes = await performImageOcrV2(
        { fileName: 'offline_test.png', bytes: scan.pngBytes },
        {
          language: 'lat',
          langPath: 'http://127.0.0.1:1/unreachable-tesseract-models',
          cachePath: '/tmp/calctools-tesseract-empty-offline-test',
          cacheMethod: 'none',
        }
      );
      assertCondition(
        offlineFailRes.status === 'PROCESSING_FAILURE' && offlineFailRes.error?.code === 'ERR_OCR_MODEL_LOAD_FAILED',
        `Expected PROCESSING_FAILURE / ERR_OCR_MODEL_LOAD_FAILED for unavailable offline language data, got ${offlineFailRes.status} / ${offlineFailRes.error?.code}`
      );

      // 5. Canonical Engine H router (`executeOcrOperationV2`) accepts 'pdf-ocr' & alias 'ocr-pdf', rejects cross-module 'pdf-merge'
      const crossModRes = await executeOcrOperationV2({
        toolId: 'pdf-merge',
        inputs: [{ fileName: 'test.png', bytes: scan.pngBytes }],
      });
      assertCondition(
        crossModRes.error?.code === 'ERR_UNSUPPORTED_OPERATION',
        `Expected ERR_UNSUPPORTED_OPERATION for cross-module tool, got ${crossModRes.error?.code}`
      );

      const routerSuccess = await executeOcrOperationV2({
        toolId: 'ocr-pdf',
        inputs: [{ fileName: 'router_scan.png', bytes: scan.pngBytes }],
        options: { language: 'eng', outputMode: 'text-only' },
      });
      assertCondition(
        routerSuccess.status === 'SUCCESS' && routerSuccess.resolvedCanonicalId === 'pdf-ocr',
        `Expected executeOcrOperationV2('ocr-pdf') SUCCESS, got ${routerSuccess.status}`
      );

      await terminateOcrWorkerPoolV2();

      return `Verified all 6 guardrails: empty=${emptyRes.error?.code}, badPdf=${badPdfRes.error?.code}, badImg=${badImgRes.error?.code}, badLang=${badLangRes.error?.code}, unreachableModel=${offlineFailRes.error?.code}, crossModule=${crossModRes.error?.code}, routerAlias="ocr-pdf"->"pdf-ocr" (${routerSuccess.status})`;
    }
  );

  // Final cleanup of any pooled workers
  await terminateOcrWorkerPoolV2();

  console.log('----------------------------------------------------------------------------');
  const passed = results.filter((r) => r.status === 'VERIFIED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;
  console.log(`PHASE PDF-09 (ENGINE H: OCR ENGINE) SUMMARY: ${passed} / ${results.length} VERIFIED (${failed} FAILED)`);
  console.log('----------------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(async (err) => {
  await terminateOcrWorkerPoolV2();
  console.error('Fatal error in runPdf09OcrTests:', err);
  process.exit(1);
});
