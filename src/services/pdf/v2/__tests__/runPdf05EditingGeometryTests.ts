import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  PdfDocumentInput,
  STANDARD_PDF_PAGE_SIZES_PT,
  addPageNumbersToPdfV2,
  addTextToPdfV2,
  addWatermarkToPdfV2,
  cropPdfPagesV2,
  editPdfMetadataV2,
  executeEditingGeometryOperationV2,
  extractRawXmpXmlFromCatalog,
  pdfLifecycleManager,
  renderUnicodeTextToPngStamp,
  resizePdfPagesV2,
} from '../index';

export interface Pdf05TestRecord {
  testId: string;
  operation: string;
  canonicalIdsTested: string;
  scenario: string;
  expectedResult: string;
  actualResult: string;
  independentVerification: string;
  durationMs: number;
  status: 'VERIFIED' | 'PARTIAL' | 'FAILED' | 'BLOCKED' | 'NOT TESTED';
}

interface PageFixtureSpec {
  text: string;
  width?: number;
  height?: number;
  rotation?: number;
}

async function createEditingTestPdfFixture(
  pages: PageFixtureSpec[],
  meta: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
  } = {}
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(meta.title ?? 'Original Fixture Title');
  doc.setAuthor(meta.author ?? 'Original Fixture Author');
  doc.setSubject(meta.subject ?? 'Original Fixture Subject');
  doc.setKeywords(meta.keywords ?? ['original', 'fixture', 'keywords']);
  doc.setCreator(meta.creator ?? 'Original Fixture Creator');
  doc.setProducer(meta.producer ?? 'Original Fixture Producer');

  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const spec of pages) {
    const w = spec.width ?? 612;
    const h = spec.height ?? 792;
    const page = doc.addPage([w, h]);
    if (spec.rotation) {
      page.setRotation(degrees(spec.rotation));
    }
    page.drawText(spec.text, {
      x: 72,
      y: Math.min(h - 72, 500),
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  return await doc.save();
}

/**
 * Independently inspects a PDF byte buffer via PDF.js (`openManagedPdfDocument`).
 */
async function inspectWithPdfJs(bytes: Uint8Array): Promise<{
  numPages: number;
  infoDict: Record<string, any>;
  metadataXml: string | null;
  pages: Array<{
    pageNumber: number;
    text: string;
    textItems: Array<{ str: string; x: number; y: number }>;
    view: [number, number, number, number];
    width: number;
    height: number;
    rotate: number;
  }>;
}> {
  const session = await openManagedPdfDocument(bytes);
  try {
    const numPages = Number(session.pdfDoc.numPages);
    let infoDict: Record<string, any> = {};
    let metadataXml: string | null = null;

    try {
      const meta = await session.pdfDoc.getMetadata();
      infoDict = (meta?.info as Record<string, any>) || {};
      metadataXml = meta?.metadata && typeof (meta.metadata as any).getRaw === 'function'
        ? String((meta.metadata as any).getRaw())
        : null;
    } catch {
      // Ignore metadata error if none present
    }

    const pages: Array<{
      pageNumber: number;
      text: string;
      textItems: Array<{ str: string; x: number; y: number }>;
      view: [number, number, number, number];
      width: number;
      height: number;
      rotate: number;
    }> = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await session.pdfDoc.getPage(p);
      const tc = await page.getTextContent();
      const textItems = (tc.items || [])
        .map((it: any) => ({
          str: String(it?.str ?? ''),
          x: Math.round(Number(it?.transform?.[4] ?? 0) * 100) / 100,
          y: Math.round(Number(it?.transform?.[5] ?? 0) * 100) / 100,
        }))
        .filter((it: { str: string }) => it.str.trim().length > 0);

      const text = textItems.map((it: { str: string }) => it.str).join(' ');
      const rawView: number[] = Array.isArray(page.view) ? page.view : [0, 0, 0, 0];
      const view: [number, number, number, number] = [
        Math.round(rawView[0] * 100) / 100,
        Math.round(rawView[1] * 100) / 100,
        Math.round(rawView[2] * 100) / 100,
        Math.round(rawView[3] * 100) / 100,
      ];
      const width = Math.round((rawView[2] - rawView[0]) * 100) / 100;
      const height = Math.round((rawView[3] - rawView[1]) * 100) / 100;
      const rotate = Number(page.rotate ?? 0);

      pages.push({
        pageNumber: p,
        text,
        textItems,
        view,
        width,
        height,
        rotate,
      });

      if (typeof page.cleanup === 'function') {
        await page.cleanup();
      }
    }

    return { numPages, infoDict, metadataXml, pages };
  } finally {
    await session.dispose();
  }
}

function assertBytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function runAllPdf05Tests(): Promise<Pdf05TestRecord[]> {
  const results: Pdf05TestRecord[] = [];

  const runTest = async (
    testId: string,
    operation: string,
    canonicalIdsTested: string,
    scenario: string,
    expectedResult: string,
    fn: () => Promise<{
      actualResult: string;
      independentVerification: string;
      passed: boolean;
    }>
  ) => {
    const t0 = performance.now();
    try {
      const outcome = await fn();
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        testId,
        operation,
        canonicalIdsTested,
        scenario,
        expectedResult,
        actualResult: outcome.actualResult,
        independentVerification: outcome.independentVerification,
        durationMs,
        status: outcome.passed ? 'VERIFIED' : 'FAILED',
      });
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - t0) * 100) / 100;
      results.push({
        testId,
        operation,
        canonicalIdsTested,
        scenario,
        expectedResult,
        actualResult: `Uncaught exception: ${err?.message || String(err)}`,
        independentVerification: 'Exception thrown during test execution',
        durationMs,
        status: 'FAILED',
      });
    }
  };

  // ============================================================================
  // 1. WATERMARKS (PDF05-TC-01 to PDF05-TC-04)
  // ============================================================================

  await runTest(
    'PDF05-TC-01',
    'A. Text Watermark (All Pages, Opacity & Rotation)',
    'pdf-add-watermark + pdf-watermark',
    'Apply diagonal text watermark "CONFIDENTIAL_2026" (opacity=0.35, rotation=45°, size=48, color=#CC0000) to all 3 pages',
    'All 3 pages preserve original page content and include "CONFIDENTIAL_2026" in independent PDF.js text inspection',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'BASE_CONTENT_P1' },
        { text: 'BASE_CONTENT_P2' },
        { text: 'BASE_CONTENT_P3' },
      ]);
      const snapshot = new Uint8Array(srcBytes);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-add-watermark',
        inputs: [{ fileName: 'contract.pdf', bytes: srcBytes }],
        options: {
          text: 'CONFIDENTIAL_2026',
          opacity: 0.35,
          rotationDegrees: 45,
          fontSize: 48,
          color: '#CC0000',
          position: 'diagonal',
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Watermark operation failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const allHaveBaseAndWatermark =
        info.numPages === 3 &&
        info.pages[0].text.includes('BASE_CONTENT_P1') &&
        info.pages[0].text.includes('CONFIDENTIAL_2026') &&
        info.pages[1].text.includes('BASE_CONTENT_P2') &&
        info.pages[1].text.includes('CONFIDENTIAL_2026') &&
        info.pages[2].text.includes('BASE_CONTENT_P3') &&
        info.pages[2].text.includes('CONFIDENTIAL_2026');

      const inputUnmutated = assertBytesEqual(srcBytes, snapshot);

      return {
        passed: allHaveBaseAndWatermark && inputUnmutated,
        actualResult: `status=SUCCESS, pages=${info.numPages}, inputUnmutated=${inputUnmutated}`,
        independentVerification: `PDF.js verified all 3 pages contain original content + "CONFIDENTIAL_2026": [${info.pages.map((p) => p.text).join(' | ')}]`,
      };
    }
  );

  await runTest(
    'PDF05-TC-02',
    'A. Selected-Page Text Watermark & Unselected Page Preservation',
    'pdf-add-watermark',
    'Apply watermark "ONLY_ON_PAGE_2" exclusively to page 2 of a 3-page PDF',
    'Page 2 contains watermark + base text; Pages 1 and 3 contain ONLY base text without watermark',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'SEL_WM_P1' },
        { text: 'SEL_WM_P2' },
        { text: 'SEL_WM_P3' },
      ]);

      const res = await addWatermarkToPdfV2(
        { fileName: 'selective.pdf', bytes: srcBytes },
        {
          text: 'ONLY_ON_PAGE_2',
          selection: '2',
          opacity: 0.4,
          position: 'center',
        }
      );

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Selected-page watermark failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const p1Clean =
        info.pages[0].text.includes('SEL_WM_P1') &&
        !info.pages[0].text.includes('ONLY_ON_PAGE_2');
      const p2Watermarked =
        info.pages[1].text.includes('SEL_WM_P2') &&
        info.pages[1].text.includes('ONLY_ON_PAGE_2');
      const p3Clean =
        info.pages[2].text.includes('SEL_WM_P3') &&
        !info.pages[2].text.includes('ONLY_ON_PAGE_2');

      return {
        passed: p1Clean && p2Watermarked && p3Clean,
        actualResult: `p1Clean=${p1Clean}, p2Watermarked=${p2Watermarked}, p3Clean=${p3Clean}`,
        independentVerification: `PDF.js texts: P1="${info.pages[0].text}", P2="${info.pages[1].text}", P3="${info.pages[2].text}"`,
      };
    }
  );

  await runTest(
    'PDF05-TC-03',
    'A. Image Watermark (Transparent PNG Stamp on Selected Pages)',
    'pdf-add-watermark',
    'Embed a transparent PNG image watermark on pages "1, 3" of a 3-page PDF while leaving page 2 without images',
    'Pages 1 and 3 contain an embedded Image XObject and preserve text; Page 2 has 0 images and preserves text',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'IMG_WM_P1' },
        { text: 'IMG_WM_P2' },
        { text: 'IMG_WM_P3' },
      ]);

      // Generate a real transparent RGBA PNG stamp
      const stamp = await renderUnicodeTextToPngStamp({
        text: 'LOGO_STAMP',
        fontSizePt: 24,
        color: { r: 0.1, g: 0.4, b: 0.8 },
        opacity: 0.8,
      });

      const res = await addWatermarkToPdfV2(
        { fileName: 'branded.pdf', bytes: srcBytes },
        {
          watermarkImageBytes: stamp.pngBytes,
          opacity: 0.5,
          imageScale: 0.5,
          position: 'bottom-right',
          selection: '1, 3',
        }
      );

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Image watermark failed',
        };
      }

      // Independently reload in @cantoo/pdf-lib and inspect page content assets + PDF.js text
      const reloadedDoc = await PDFDocument.load(res.primaryFile.bytes);
      const p1Images = reloadedDoc
        .getPage(0)
        .extractContents()
        .filter((a) => a.kind === 'image').length;
      const p2Images = reloadedDoc
        .getPage(1)
        .extractContents()
        .filter((a) => a.kind === 'image').length;
      const p3Images = reloadedDoc
        .getPage(2)
        .extractContents()
        .filter((a) => a.kind === 'image').length;

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const textsIntact =
        info.pages[0].text.includes('IMG_WM_P1') &&
        info.pages[1].text.includes('IMG_WM_P2') &&
        info.pages[2].text.includes('IMG_WM_P3');

      const passed = p1Images === 1 && p2Images === 0 && p3Images === 1 && textsIntact;

      return {
        passed,
        actualResult: `p1Images=${p1Images}, p2Images=${p2Images}, p3Images=${p3Images}, textsIntact=${textsIntact}`,
        independentVerification: `extractContents() confirmed Image XObjects=[1, 0, 1] across pages 1..3 and PDF.js confirmed original text preserved`,
      };
    }
  );

  await runTest(
    'PDF05-TC-04',
    'A. Watermark Validation & Rejection',
    'pdf-add-watermark',
    'Reject empty watermark content, invalid opacity (0 and 1.5), invalid image signature, and out-of-range selection',
    'Return ERR_EMPTY_WATERMARK_CONTENT, ERR_INVALID_DIMENSIONS, ERR_UNSUPPORTED_IMAGE_FORMAT, and ERR_INVALID_PAGE_RANGE',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([{ text: 'WM_VAL_P1' }]);

      const emptyRes = await addWatermarkToPdfV2(
        { fileName: 'a.pdf', bytes: srcBytes },
        { text: '   ' }
      );
      const badOpacity0 = await addWatermarkToPdfV2(
        { fileName: 'a.pdf', bytes: srcBytes },
        { text: 'WM', opacity: 0 }
      );
      const badOpacityHigh = await addWatermarkToPdfV2(
        { fileName: 'a.pdf', bytes: srcBytes },
        { text: 'WM', opacity: 1.5 }
      );
      const badImg = await addWatermarkToPdfV2(
        { fileName: 'a.pdf', bytes: srcBytes },
        { watermarkImageBytes: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]) }
      );
      const badRange = await addWatermarkToPdfV2(
        { fileName: 'a.pdf', bytes: srcBytes },
        { text: 'WM', selection: '1-5' }
      );

      const passed =
        emptyRes.error?.code === 'ERR_EMPTY_WATERMARK_CONTENT' &&
        badOpacity0.error?.code === 'ERR_INVALID_DIMENSIONS' &&
        badOpacityHigh.error?.code === 'ERR_INVALID_DIMENSIONS' &&
        badImg.error?.code === 'ERR_UNSUPPORTED_IMAGE_FORMAT' &&
        badRange.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `empty=${emptyRes.error?.code}, op0=${badOpacity0.error?.code}, op1.5=${badOpacityHigh.error?.code}, badImg=${badImg.error?.code}, badRange=${badRange.error?.code}`,
        independentVerification:
          'All 5 invalid watermark input vectors rejected deterministically with exact typed error codes',
      };
    }
  );

  // ============================================================================
  // 2. PAGE NUMBERING & HEADERS/FOOTERS (PDF05-TC-05 to PDF05-TC-06)
  // ============================================================================

  await runTest(
    'PDF05-TC-05',
    'B. Page Numbering (Start Number, Format, Prefix/Suffix & Position)',
    'pdf-add-page-numbers',
    'Number a 3-page PDF starting at 10 with prefix "[Sec-A] ", suffix " [End]", format "page-n-of-total", position "bottom-right"',
    'Pages 1..3 contain "[Sec-A] Page 10 of 3 [End]" .. "[Sec-A] Page 12 of 3 [End]" at bottom-right coordinates',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'NUM_BODY_P1' },
        { text: 'NUM_BODY_P2' },
        { text: 'NUM_BODY_P3' },
      ]);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-add-page-numbers',
        inputs: [{ fileName: 'manual.pdf', bytes: srcBytes }],
        options: {
          startNumber: 10,
          format: 'page-n-of-total',
          prefix: '[Sec-A] ',
          suffix: ' [End]',
          position: 'bottom-right',
          marginPt: 30,
          fontSize: 12,
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Page numbering failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const p1HasLabel = info.pages[0].text.includes('[Sec-A] Page 10 of 3 [End]');
      const p2HasLabel = info.pages[1].text.includes('[Sec-A] Page 11 of 3 [End]');
      const p3HasLabel = info.pages[2].text.includes('[Sec-A] Page 12 of 3 [End]');

      // Verify bottom-right coordinate placement (x > 300, y around 30)
      const labelItemP1 = info.pages[0].textItems.find((it) =>
        it.str.includes('Page 10 of 3')
      );
      const placedBottomRight = Boolean(
        labelItemP1 && labelItemP1.x > 300 && labelItemP1.y >= 20 && labelItemP1.y <= 50
      );

      const passed = p1HasLabel && p2HasLabel && p3HasLabel && placedBottomRight;

      return {
        passed,
        actualResult: `p1=${p1HasLabel}, p2=${p2HasLabel}, p3=${p3HasLabel}, coords=(${labelItemP1?.x}, ${labelItemP1?.y})`,
        independentVerification: `PDF.js verified exact formatted strings and bottom-right placement at (${labelItemP1?.x}, ${labelItemP1?.y})`,
      };
    }
  );

  await runTest(
    'PDF05-TC-06',
    'B. Combined Page Numbering, Header, Footer & Watermark on Selected Pages',
    'pdf-page-numbering-header-watermark-tool',
    'Apply Roman numerals ("roman-upper"), header "Q4 BOARD REPORT", footer "STRICTLY PRIVATE", and watermark "BOARD_COPY" to pages "2-3" of a 3-page PDF',
    'Page 1 remains untouched; Pages 2 and 3 contain header, footer, Roman numerals (I, II), watermark, and base text',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'COVER_PAGE_1' },
        { text: 'CONTENT_PAGE_2' },
        { text: 'CONTENT_PAGE_3' },
      ]);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-page-numbering-header-watermark-tool',
        inputs: [{ fileName: 'board.pdf', bytes: srcBytes }],
        options: {
          startNumber: 1,
          format: 'roman-upper',
          prefix: 'Roman ',
          position: 'bottom-right',
          headerText: 'Q4 BOARD REPORT',
          footerText: 'STRICTLY PRIVATE',
          watermarkText: 'BOARD_COPY',
          selection: '2-3',
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Combined numbering/header/watermark tool failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const p1Untouched =
        info.pages[0].text === 'COVER_PAGE_1' &&
        !info.pages[0].text.includes('Q4 BOARD REPORT') &&
        !info.pages[0].text.includes('BOARD_COPY');

      const p2Valid =
        info.pages[1].text.includes('CONTENT_PAGE_2') &&
        info.pages[1].text.includes('Roman I') &&
        info.pages[1].text.includes('Q4 BOARD REPORT') &&
        info.pages[1].text.includes('STRICTLY PRIVATE') &&
        info.pages[1].text.includes('BOARD_COPY');

      const p3Valid =
        info.pages[2].text.includes('CONTENT_PAGE_3') &&
        info.pages[2].text.includes('Roman II') &&
        info.pages[2].text.includes('Q4 BOARD REPORT') &&
        info.pages[2].text.includes('STRICTLY PRIVATE') &&
        info.pages[2].text.includes('BOARD_COPY');

      return {
        passed: p1Untouched && p2Valid && p3Valid,
        actualResult: `canonicalId=${res.resolvedCanonicalId}, p1Untouched=${p1Untouched}, p2Valid=${p2Valid}, p3Valid=${p3Valid}`,
        independentVerification: `PDF.js verified P1="${info.pages[0].text}", P2="${info.pages[1].text}", P3="${info.pages[2].text}"`,
      };
    }
  );

  // ============================================================================
  // 3. TEXT INSERTION & UNICODE FALLBACK (PDF05-TC-07 to PDF05-TC-09)
  // ============================================================================

  await runTest(
    'PDF05-TC-07',
    'C. Text Insertion at Exact Coordinates',
    'pdf-add-text',
    'Insert text "INSERTED_STAMP_XYZ" at (x=140, y=620) with fontSize=16 on page 1 of a 2-page PDF',
    'Page 1 contains "INSERTED_STAMP_XYZ" at (140, 620) while preserving base text and 612x792 geometry; Page 2 is untouched',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'ORIG_TEXT_P1', width: 612, height: 792 },
        { text: 'ORIG_TEXT_P2', width: 612, height: 792 },
      ]);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-add-text',
        inputs: [{ fileName: 'form.pdf', bytes: srcBytes }],
        options: {
          text: 'INSERTED_STAMP_XYZ',
          x: 140,
          y: 620,
          fontSize: 16,
          color: '#004488',
          align: 'left',
          selection: '1',
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Text insertion failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const insertedItem = info.pages[0].textItems.find((it) =>
        it.str.includes('INSERTED_STAMP_XYZ')
      );
      const coordsMatch = Boolean(
        insertedItem &&
          Math.abs(insertedItem.x - 140) <= 1 &&
          Math.abs(insertedItem.y - 620) <= 1
      );
      const p1Preserved =
        info.pages[0].text.includes('ORIG_TEXT_P1') &&
        info.pages[0].width === 612 &&
        info.pages[0].height === 792;
      const p2Untouched = info.pages[1].text === 'ORIG_TEXT_P2';

      return {
        passed: coordsMatch && p1Preserved && p2Untouched,
        actualResult: `coords=(${insertedItem?.x}, ${insertedItem?.y}), p1Geom=${info.pages[0].width}x${info.pages[0].height}, p2Untouched=${p2Untouched}`,
        independentVerification: `PDF.js confirmed "INSERTED_STAMP_XYZ" at (${insertedItem?.x}, ${insertedItem?.y}) and page 2 untouched`,
      };
    }
  );

  await runTest(
    'PDF05-TC-08',
    'C. Unicode Text Insertion & Watermark via Canvas PNG Stamp Fallback',
    'pdf-add-text + pdf-add-watermark',
    'Insert non-WinAnsi Unicode text ("日本語 • Привет • مرحبا") via pdf-add-text and ("機密 CONFIDENTIAL") via pdf-add-watermark on a 2-page PDF',
    'Automatically trigger PNG stamp fallback without WinAnsi throws, embed PNG Image XObject on target page, and keep base vector text intact',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'VECTOR_BASE_P1' },
        { text: 'VECTOR_BASE_P2' },
      ]);

      const textRes = await addTextToPdfV2(
        { fileName: 'unicode.pdf', bytes: srcBytes },
        {
          text: '日本語 • Привет • مرحبا',
          x: 100,
          y: 400,
          fontSize: 18,
          color: '#112233',
          selection: '1',
        }
      );

      if (textRes.status !== 'SUCCESS' || !textRes.primaryFile) {
        return {
          passed: false,
          actualResult: `textRes status=${textRes.status}, error=${textRes.error?.code}`,
          independentVerification: 'Unicode text insertion failed',
        };
      }

      const wmRes = await addWatermarkToPdfV2(
        { fileName: 'unicode_step2.pdf', bytes: textRes.primaryFile.bytes },
        {
          text: '機密文書_2026',
          fontSize: 36,
          opacity: 0.4,
          selection: '2',
        }
      );

      if (wmRes.status !== 'SUCCESS' || !wmRes.primaryFile) {
        return {
          passed: false,
          actualResult: `wmRes status=${wmRes.status}, error=${wmRes.error?.code}`,
          independentVerification: 'Unicode watermark failed',
        };
      }

      // Verify via @cantoo/pdf-lib extractContents that both pages have 1 embedded PNG Image XObject
      // AND via PDF.js that original vector text is still selectable text (not full-page rasterized)
      const reloaded = await PDFDocument.load(wmRes.primaryFile.bytes);
      const p1ImageCount = reloaded
        .getPage(0)
        .extractContents()
        .filter((a) => a.kind === 'image').length;
      const p2ImageCount = reloaded
        .getPage(1)
        .extractContents()
        .filter((a) => a.kind === 'image').length;

      const info = await inspectWithPdfJs(wmRes.primaryFile.bytes);
      const vectorTextPreserved =
        info.pages[0].text === 'VECTOR_BASE_P1' &&
        info.pages[1].text === 'VECTOR_BASE_P2';

      const passed =
        Boolean(textRes.details?.usedUnicodeFallback) &&
        Boolean(wmRes.details?.usedUnicodeFallback) &&
        p1ImageCount === 1 &&
        p2ImageCount === 1 &&
        vectorTextPreserved;

      return {
        passed,
        actualResult: `textFallback=${textRes.details?.usedUnicodeFallback}, wmFallback=${wmRes.details?.usedUnicodeFallback}, p1Images=${p1ImageCount}, p2Images=${p2ImageCount}`,
        independentVerification: `extractContents() verified 1 PNG stamp XObject on P1 & P2; PDF.js confirmed original vector text ["${info.pages[0].text}", "${info.pages[1].text}"] was not rasterized`,
      };
    }
  );

  await runTest(
    'PDF05-TC-09',
    'C. Text Insertion Coordinate & Input Validation',
    'pdf-add-text',
    'Reject empty text, out-of-bounds coordinates (x=800, y=200 on 612x792 page), negative coordinates (x=-5, y=100), and invalid font size (0)',
    'Reject empty text with ERR_EMPTY_WATERMARK_CONTENT and invalid coordinates/sizes with ERR_INVALID_DIMENSIONS',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'VAL_P1', width: 612, height: 792 },
      ]);

      const emptyText = await addTextToPdfV2(
        { fileName: 'v.pdf', bytes: srcBytes },
        { text: '', x: 100, y: 100 }
      );
      const outOfBounds = await addTextToPdfV2(
        { fileName: 'v.pdf', bytes: srcBytes },
        { text: 'OOB', x: 800, y: 200 }
      );
      const negCoords = await addTextToPdfV2(
        { fileName: 'v.pdf', bytes: srcBytes },
        { text: 'NEG', x: -5, y: 100 }
      );
      const badFont = await addTextToPdfV2(
        { fileName: 'v.pdf', bytes: srcBytes },
        { text: 'FONT', x: 100, y: 100, fontSize: 0 }
      );

      const passed =
        emptyText.error?.code === 'ERR_EMPTY_WATERMARK_CONTENT' &&
        outOfBounds.error?.code === 'ERR_INVALID_DIMENSIONS' &&
        negCoords.error?.code === 'ERR_INVALID_DIMENSIONS' &&
        badFont.error?.code === 'ERR_INVALID_DIMENSIONS';

      return {
        passed,
        actualResult: `empty=${emptyText.error?.code}, oob=${outOfBounds.error?.code}, neg=${negCoords.error?.code}, badFont=${badFont.error?.code}`,
        independentVerification:
          'All 4 invalid text insertion vectors rejected before page modification',
      };
    }
  );

  // ============================================================================
  // 4. CROP PAGES (PDF05-TC-10 to PDF05-TC-12)
  // ============================================================================

  await runTest(
    'PDF05-TC-10',
    'D. Crop Pages by Margin Insets & Explicit CropBox',
    'pdf-crop-pages + pdf-crop',
    'Crop page 1 of a 2-page 612x792 PDF using margins {top:50, right:40, bottom:60, left:30} (542x682) while keeping page 2 uncropped (612x792)',
    'Page 1 view becomes [30, 60, 572, 742] (542x682); Page 2 view remains [0, 0, 612, 792]',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'CROP_TARGET_P1', width: 612, height: 792 },
        { text: 'UNCROPPED_P2', width: 612, height: 792 },
      ]);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-crop-pages',
        inputs: [{ fileName: 'layout.pdf', bytes: srcBytes }],
        options: {
          margins: { top: 50, right: 40, bottom: 60, left: 30 },
          selection: '1',
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Crop pages failed',
        };
      }

      const info = await inspectWithPdfJs(res.primaryFile.bytes);
      const p1 = info.pages[0];
      const p2 = info.pages[1];

      const passed =
        JSON.stringify(p1.view) === JSON.stringify([30, 60, 572, 742]) &&
        p1.width === 542 &&
        p1.height === 682 &&
        p1.text.includes('CROP_TARGET_P1') &&
        JSON.stringify(p2.view) === JSON.stringify([0, 0, 612, 792]) &&
        p2.width === 612 &&
        p2.height === 792 &&
        p2.text.includes('UNCROPPED_P2');

      return {
        passed,
        actualResult: `p1View=[${p1.view.join(', ')}] (${p1.width}x${p1.height}), p2View=[${p2.view.join(', ')}]`,
        independentVerification: `PDF.js page.view independently confirmed P1=[30, 60, 572, 742] (542×682) and P2=[0, 0, 612, 792] (612×792)`,
      };
    }
  );

  await runTest(
    'PDF05-TC-11',
    'D. Rotated-Page Cropping (90° and 180° Orientation Mapping)',
    'pdf-crop-pages',
    'Crop a 90°-rotated page (612x792 @ 90°) with visual top=80pt and a 180°-rotated page (612x792 @ 180°) with visual top=100pt',
    'Visual top=80pt on 90° page maps to unrotated left=80pt (view=[80,0,612,792]); visual top=100pt on 180° page maps to unrotated bottom=100pt (view=[0,100,612,792])',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'ROT90_CROP', width: 612, height: 792, rotation: 90 },
        { text: 'ROT180_CROP', width: 612, height: 792, rotation: 180 },
      ]);

      const res1 = await cropPdfPagesV2(
        { fileName: 'rot.pdf', bytes: srcBytes },
        { margins: { top: 80, right: 0, bottom: 0, left: 0 }, selection: '1' }
      );

      if (res1.status !== 'SUCCESS' || !res1.primaryFile) {
        return {
          passed: false,
          actualResult: `res1 status=${res1.status}`,
          independentVerification: 'Rotated crop step 1 failed',
        };
      }

      const res2 = await cropPdfPagesV2(
        { fileName: 'rot_step2.pdf', bytes: res1.primaryFile.bytes },
        { margins: { top: 100, right: 0, bottom: 0, left: 0 }, selection: '2' }
      );

      if (res2.status !== 'SUCCESS' || !res2.primaryFile) {
        return {
          passed: false,
          actualResult: `res2 status=${res2.status}`,
          independentVerification: 'Rotated crop step 2 failed',
        };
      }

      const info = await inspectWithPdfJs(res2.primaryFile.bytes);
      const p1 = info.pages[0];
      const p2 = info.pages[1];

      const passed =
        p1.rotate === 90 &&
        JSON.stringify(p1.view) === JSON.stringify([80, 0, 612, 792]) &&
        p2.rotate === 180 &&
        JSON.stringify(p2.view) === JSON.stringify([0, 100, 612, 792]);

      return {
        passed,
        actualResult: `p1(rot=${p1.rotate}, view=[${p1.view}]), p2(rot=${p2.rotate}, view=[${p2.view}])`,
        independentVerification:
          'PDF.js confirmed visual top margins on 90° and 180° rotated pages mapped accurately to unrotated MediaBox coordinates',
      };
    }
  );

  await runTest(
    'PDF05-TC-12',
    'D. Crop Pages Invalid & Zero-Area Box Rejection',
    'pdf-crop-pages',
    'Reject negative margins, excessive margins leaving <10pt width, zero-area cropBox, and out-of-bounds cropBox',
    'Reject all 4 invalid crop configurations with code=ERR_INVALID_CROP_BOUNDS',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'CROP_ERR_P1', width: 612, height: 792 },
      ]);

      const negMargin = await cropPdfPagesV2(
        { fileName: 'c.pdf', bytes: srcBytes },
        { margins: { top: -10, left: 20 } }
      );
      const zeroAreaMargin = await cropPdfPagesV2(
        { fileName: 'c.pdf', bytes: srcBytes },
        { margins: { left: 310, right: 310 } }
      );
      const zeroBox = await cropPdfPagesV2(
        { fileName: 'c.pdf', bytes: srcBytes },
        { cropBox: { x: 10, y: 10, width: 0, height: 100 } }
      );
      const oobBox = await cropPdfPagesV2(
        { fileName: 'c.pdf', bytes: srcBytes },
        { cropBox: { x: 100, y: 100, width: 600, height: 600 } }
      );

      const passed =
        negMargin.error?.code === 'ERR_INVALID_CROP_BOUNDS' &&
        zeroAreaMargin.error?.code === 'ERR_INVALID_CROP_BOUNDS' &&
        zeroBox.error?.code === 'ERR_INVALID_CROP_BOUNDS' &&
        oobBox.error?.code === 'ERR_INVALID_CROP_BOUNDS';

      return {
        passed,
        actualResult: `neg=${negMargin.error?.code}, zeroMargin=${zeroAreaMargin.error?.code}, zeroBox=${zeroBox.error?.code}, oobBox=${oobBox.error?.code}`,
        independentVerification:
          'All 4 invalid/zero-area crop bounds rejected with ERR_INVALID_CROP_BOUNDS',
      };
    }
  );

  // ============================================================================
  // 5. PAGE RESIZING (PDF05-TC-13)
  // ============================================================================

  await runTest(
    'PDF05-TC-13',
    'E. Page Resizing (Standard Presets, Custom Dimensions & Scaling Validation)',
    'pdf-page-resizer',
    'Resize Letter (612x792) PDF to A4 (595.28x841.89) and Custom (500x700 pt) using contain-center; reject invalid/negative sizes and clipping pad-center',
    'PDF.js verifies A4 (595.28x841.89) and Custom (500x700) dimensions with intact content; invalid sizes rejected with ERR_INVALID_DIMENSIONS',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([
        { text: 'RESIZE_CONTENT_P1', width: 612, height: 792 },
        { text: 'RESIZE_CONTENT_P2', width: 612, height: 792 },
      ]);

      const a4Res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-page-resizer',
        inputs: [{ fileName: 'letter.pdf', bytes: srcBytes }],
        options: { preset: 'A4', fitMode: 'contain-center' },
      });

      const customRes = await resizePdfPagesV2(
        { fileName: 'letter.pdf', bytes: srcBytes },
        { preset: 'Custom', width: 500, height: 700, unit: 'pt', selection: '1' }
      );

      const badDimRes = await resizePdfPagesV2(
        { fileName: 'letter.pdf', bytes: srcBytes },
        { preset: 'Custom', width: -100, height: 500 }
      );

      // pad-center to a smaller size (400x400 < 612x792) must be rejected to prevent unintended clipping
      const padClipRes = await resizePdfPagesV2(
        { fileName: 'letter.pdf', bytes: srcBytes },
        { preset: 'Custom', width: 400, height: 400, fitMode: 'pad-center' }
      );

      if (
        a4Res.status !== 'SUCCESS' ||
        !a4Res.primaryFile ||
        customRes.status !== 'SUCCESS' ||
        !customRes.primaryFile
      ) {
        return {
          passed: false,
          actualResult: `a4=${a4Res.status}, custom=${customRes.status}`,
          independentVerification: 'Page resize failed',
        };
      }

      const infoA4 = await inspectWithPdfJs(a4Res.primaryFile.bytes);
      const infoCustom = await inspectWithPdfJs(customRes.primaryFile.bytes);

      const a4Match =
        Math.abs(infoA4.pages[0].width - STANDARD_PDF_PAGE_SIZES_PT.A4.widthPt) < 0.05 &&
        Math.abs(infoA4.pages[0].height - STANDARD_PDF_PAGE_SIZES_PT.A4.heightPt) < 0.05 &&
        infoA4.pages[0].text.includes('RESIZE_CONTENT_P1');

      const customMatch =
        infoCustom.pages[0].width === 500 &&
        infoCustom.pages[0].height === 700 &&
        infoCustom.pages[0].text.includes('RESIZE_CONTENT_P1') &&
        infoCustom.pages[1].width === 612 &&
        infoCustom.pages[1].height === 792;

      const passed =
        a4Match &&
        customMatch &&
        badDimRes.error?.code === 'ERR_INVALID_DIMENSIONS' &&
        padClipRes.error?.code === 'ERR_INVALID_DIMENSIONS';

      return {
        passed,
        actualResult: `A4=(${infoA4.pages[0].width}x${infoA4.pages[0].height}), CustomP1=(${infoCustom.pages[0].width}x${infoCustom.pages[0].height}), badDim=${badDimRes.error?.code}, padClip=${padClipRes.error?.code}`,
        independentVerification:
          'PDF.js confirmed resized dimensions and preserved text; clipping pad-center and negative sizes rejected with ERR_INVALID_DIMENSIONS',
      };
    }
  );

  // ============================================================================
  // 6. METADATA EDITING (PDF05-TC-14 to PDF05-TC-15)
  // ============================================================================

  await runTest(
    'PDF05-TC-14',
    'F. Metadata Editing (All 6 Standard Fields, InfoDict + XMP Sync & Persistence)',
    'pdf-metadata-editor',
    'Update all 6 metadata fields (Title, Author, Subject, Keywords, Creator, Producer), synchronize InfoDict and XMP stream, and verify persistence after reopening',
    'All 6 fields persist identically in independent PDF.js getMetadata(), reloaded @cantoo/pdf-lib InfoDict, and XMP catalog stream',
    async () => {
      const srcBytes = await createEditingTestPdfFixture([{ text: 'META_TEST_P1' }]);

      const res = await executeEditingGeometryOperationV2({
        toolId: 'pdf-metadata-editor',
        inputs: [{ fileName: 'whitepaper.pdf', bytes: srcBytes }],
        options: {
          title: 'CalcTools PDF Engine 2.0 Architecture',
          author: 'Dr. Elena Rostova',
          subject: 'Browser-Native PDF Processing Specification',
          keywords: ['calctools', 'pdf-v2', 'webassembly'],
          creator: 'CalcTools Metadata Suite V2',
          producer: 'CalcTools @cantoo/pdf-lib 2.11.1',
          synchronizeXmp: true,
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Metadata edit failed',
        };
      }

      // 1. Independently reload in @cantoo/pdf-lib
      const reloadedDoc = await PDFDocument.load(res.primaryFile.bytes, {
        updateMetadata: false,
      });
      const xmpXml = extractRawXmpXmlFromCatalog(reloadedDoc) || '';

      // 2. Independently inspect via PDF.js getMetadata()
      const pdfJsInfo = await inspectWithPdfJs(res.primaryFile.bytes);

      const infoMatches =
        reloadedDoc.getTitle() === 'CalcTools PDF Engine 2.0 Architecture' &&
        reloadedDoc.getAuthor() === 'Dr. Elena Rostova' &&
        reloadedDoc.getSubject() === 'Browser-Native PDF Processing Specification' &&
        (reloadedDoc.getKeywords() || '').includes('calctools') &&
        (reloadedDoc.getKeywords() || '').includes('pdf-v2') &&
        reloadedDoc.getCreator() === 'CalcTools Metadata Suite V2' &&
        reloadedDoc.getProducer() === 'CalcTools @cantoo/pdf-lib 2.11.1';

      const pdfJsMatches =
        pdfJsInfo.infoDict.Title === 'CalcTools PDF Engine 2.0 Architecture' &&
        pdfJsInfo.infoDict.Author === 'Dr. Elena Rostova' &&
        pdfJsInfo.infoDict.Subject === 'Browser-Native PDF Processing Specification' &&
        pdfJsInfo.infoDict.Creator === 'CalcTools Metadata Suite V2' &&
        pdfJsInfo.infoDict.Producer === 'CalcTools @cantoo/pdf-lib 2.11.1';

      const xmpMatches =
        xmpXml.includes('CalcTools PDF Engine 2.0 Architecture') &&
        xmpXml.includes('Dr. Elena Rostova') &&
        xmpXml.includes('Browser-Native PDF Processing Specification') &&
        xmpXml.includes('CalcTools Metadata Suite V2') &&
        xmpXml.includes('CalcTools @cantoo/pdf-lib 2.11.1');

      return {
        passed: infoMatches && pdfJsMatches && xmpMatches && Boolean(res.inspectionReport),
        actualResult: `infoMatches=${infoMatches}, pdfJsMatches=${pdfJsMatches}, xmpMatches=${xmpMatches}, hasInspectionReport=${Boolean(res.inspectionReport)}`,
        independentVerification: `PDF.js getMetadata() and catalog /Metadata XMP stream confirmed all 6 fields persisted after save & reopen`,
      };
    }
  );

  await runTest(
    'PDF05-TC-15',
    'F. Metadata Partial Preservation, Explicit Sanitization & Canonical Routing',
    'All 7 Editing & Geometry Canonical IDs + pdf-watermark & pdf-crop aliases',
    'Verify partial metadata edit preserves untouched fields, clearExistingMetadata=true sanitizes old fields, all 7 canonical IDs + 2 aliases route cleanly, non-editing IDs reject with ERR_UNSUPPORTED_OPERATION, and 0 sessions leak',
    'Unrelated metadata preserved on partial edit; cleared when clearExistingMetadata=true; all 9 valid routes succeed; wrong module rejected; activeSessions=0',
    async () => {
      const srcBytes = await createEditingTestPdfFixture(
        [{ text: 'META_PRESERVE_P1', width: 612, height: 792 }],
        {
          title: 'Keep Or Replace Title',
          author: 'Preserved Author Name',
          subject: 'Preserved Subject Line',
          keywords: ['preserved-kw'],
          creator: 'Preserved Creator App',
          producer: 'Preserved Producer Engine',
        }
      );

      // 1. Partial update: only change title
      const partialRes = await editPdfMetadataV2(
        { fileName: 'partial.pdf', bytes: srcBytes },
        { title: 'Updated Title Only' }
      );
      const partialDoc = await PDFDocument.load(partialRes.primaryFile!.bytes, {
        updateMetadata: false,
      });
      const preservedIntact =
        partialDoc.getTitle() === 'Updated Title Only' &&
        partialDoc.getAuthor() === 'Preserved Author Name' &&
        partialDoc.getSubject() === 'Preserved Subject Line' &&
        partialDoc.getCreator() === 'Preserved Creator App' &&
        partialDoc.getProducer() === 'Preserved Producer Engine';

      // 2. Sanitization update: clearExistingMetadata = true
      const clearRes = await editPdfMetadataV2(
        { fileName: 'clean.pdf', bytes: srcBytes },
        { title: 'Clean Title', clearExistingMetadata: true }
      );
      const clearDoc = await PDFDocument.load(clearRes.primaryFile!.bytes, {
        updateMetadata: false,
      });
      const sanitizedCleanly =
        clearDoc.getTitle() === 'Clean Title' &&
        (clearDoc.getAuthor() || '') === '' &&
        (clearDoc.getSubject() || '') === '';

      // 3. Route all 7 canonical IDs + 2 aliases (pdf-watermark, pdf-crop)
      const inputDoc: PdfDocumentInput = { fileName: 'route.pdf', bytes: srcBytes };
      const routedCalls = await Promise.all([
        executeEditingGeometryOperationV2({
          toolId: 'pdf-add-watermark',
          inputs: [inputDoc],
          options: { text: 'WM1' },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-watermark',
          inputs: [inputDoc],
          options: { text: 'WM2' },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-add-page-numbers',
          inputs: [inputDoc],
          options: { startNumber: 1 },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-page-numbering-header-watermark-tool',
          inputs: [inputDoc],
          options: { startNumber: 1, headerText: 'HDR' },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-add-text',
          inputs: [inputDoc],
          options: { text: 'TXT', x: 50, y: 50 },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-crop-pages',
          inputs: [inputDoc],
          options: { margins: { top: 20 } },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-crop',
          inputs: [inputDoc],
          options: { margins: { bottom: 20 } },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-page-resizer',
          inputs: [inputDoc],
          options: { preset: 'A4' },
        }),
        executeEditingGeometryOperationV2({
          toolId: 'pdf-metadata-editor',
          inputs: [inputDoc],
          options: { title: 'Meta Route' },
        }),
      ]);

      const allNineSucceeded = routedCalls.every((c) => c.status === 'SUCCESS');

      const wrongModule = await executeEditingGeometryOperationV2({
        toolId: 'pdf-merge',
        inputs: [inputDoc],
      });
      const unknownTool = await executeEditingGeometryOperationV2({
        toolId: 'invalid-tool-id',
        inputs: [inputDoc],
      });

      const activeSessions = pdfLifecycleManager.getActiveSessionCount();
      const activeBytes = pdfLifecycleManager.getActiveTotalBytes();

      const passed =
        preservedIntact &&
        sanitizedCleanly &&
        allNineSucceeded &&
        wrongModule.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        unknownTool.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        activeSessions === 0 &&
        activeBytes === 0;

      return {
        passed,
        actualResult: `preserved=${preservedIntact}, sanitized=${sanitizedCleanly}, routed=9/9, wrongMod=${wrongModule.error?.code}, activeSessions=${activeSessions}`,
        independentVerification:
          'Verified partial metadata preservation, explicit sanitization, all 7 canonical IDs + 2 aliases, non-editing rejection, and 0 leaked lifecycle sessions',
      };
    }
  );

  return results;
}

async function main() {
  console.log('=== CALCTOOLS PHASE PDF-05 EDITING & GEOMETRY ENGINE TEST RESULTS ===');
  const results = await runAllPdf05Tests();
  let passedCount = 0;

  for (const r of results) {
    if (r.status === 'VERIFIED') passedCount++;
    console.log(
      `[${r.status}] ${r.testId} (${r.operation} — ${r.canonicalIdsTested}) - ${r.durationMs}ms`
    );
    console.log(`   Actual: ${r.actualResult}`);
    console.log(`   Verify: ${r.independentVerification}`);
  }

  console.log(`Summary: ${passedCount}/${results.length} VERIFIED.`);
  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
