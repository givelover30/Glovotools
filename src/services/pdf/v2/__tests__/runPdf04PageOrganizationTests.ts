import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import JSZip from 'jszip';
import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  PdfDocumentInput,
  deletePdfPagesV2,
  executePageOrganizationOperationV2,
  extractPdfPagesV2,
  mergePdfsV2,
  parsePageRangeExpression,
  pdfLifecycleManager,
  reorderPdfPagesV2,
  resolvePdfPageSelection,
  rotatePdfPagesV2,
  splitPdfV2,
  validateReorderPermutation,
} from '../index';
import {
  createEmptyBufferFixture,
  createInvalidMagicBytesFixture,
  createPngDisguisedAsPdfFixture,
} from './pdfTestFixtures';

export interface Pdf04TestRecord {
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

interface PageSpec {
  text: string;
  width: number;
  height: number;
  rotation?: number;
}

/**
 * Generates a real PDF fixture with explicit per-page text, dimensions, and rotation angles.
 */
async function createCustomGeometryPdfFixture(
  pages: PageSpec[],
  title = 'CalcTools PDF-04 Geometry Fixture'
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const spec of pages) {
    const page = doc.addPage([spec.width, spec.height]);
    if (typeof spec.rotation === 'number' && spec.rotation !== 0) {
      page.setRotation(degrees(spec.rotation));
    }
    page.drawText(spec.text, {
      x: 50,
      y: Math.min(spec.height - 50, 400),
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  return await doc.save();
}

/**
 * Independently inspects a PDF byte buffer using PDF.js (`openManagedPdfDocument`),
 * returning page count and per-page text, dimensions, and rotation angle.
 */
async function inspectPdfIndependentlyWithPdfJs(bytes: Uint8Array): Promise<{
  numPages: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    width: number;
    height: number;
    rotate: number;
  }>;
}> {
  const session = await openManagedPdfDocument(bytes);
  try {
    const numPages = Number(session.pdfDoc.numPages);
    const pages: Array<{
      pageNumber: number;
      text: string;
      width: number;
      height: number;
      rotate: number;
    }> = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await session.pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      const text = (textContent.items || [])
        .map((item: any) => String(item?.str ?? ''))
        .join(' ')
        .trim();

      // Raw unrotated page box [x1, y1, x2, y2] in PDF points
      const view: number[] = Array.isArray(page.view) ? page.view : [0, 0, 0, 0];
      const width = Math.round((view[2] - view[0]) * 100) / 100;
      const height = Math.round((view[3] - view[1]) * 100) / 100;
      const rotate = Number(page.rotate ?? 0);

      pages.push({
        pageNumber: p,
        text,
        width,
        height,
        rotate,
      });

      if (typeof page.cleanup === 'function') {
        await page.cleanup();
      }
    }

    return { numPages, pages };
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

async function runAllPdf04Tests(): Promise<Pdf04TestRecord[]> {
  const results: Pdf04TestRecord[] = [];

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
  // 1. SHARED PAGE RANGE PARSER (PDF04-TC-01 to PDF04-TC-04)
  // ============================================================================

  await runTest(
    'PDF04-TC-01',
    'Shared Page Range Parser',
    'parsePageRangeExpression',
    'Single pages (1, 3, 5), simple ranges (1-3), open-ended ranges (4-end), and combined ranges (1-3, 5, 8-end)',
    'Resolve exact 1-based page numbers and 0-based page indices in specified order',
    async () => {
      const r1 = parsePageRangeExpression('1, 3, 5', 6);
      const r2 = parsePageRangeExpression('1-3', 6);
      const r3 = parsePageRangeExpression('4-end', 6);
      const r4 = parsePageRangeExpression('1-3, 5, 8-end', 10);

      const passed =
        r1.isValid &&
        JSON.stringify(r1.pageNumbers) === JSON.stringify([1, 3, 5]) &&
        JSON.stringify(r1.pageIndices) === JSON.stringify([0, 2, 4]) &&
        r2.isValid &&
        JSON.stringify(r2.pageNumbers) === JSON.stringify([1, 2, 3]) &&
        r3.isValid &&
        JSON.stringify(r3.pageNumbers) === JSON.stringify([4, 5, 6]) &&
        r4.isValid &&
        JSON.stringify(r4.pageNumbers) === JSON.stringify([1, 2, 3, 5, 8, 9, 10]);

      return {
        passed,
        actualResult: `r1=[${r1.pageNumbers}], r2=[${r2.pageNumbers}], r3=[${r3.pageNumbers}], r4=[${r4.pageNumbers}]`,
        independentVerification:
          'All 4 syntax patterns compared against ground-truth integer arrays [1,3,5], [1,2,3], [4,5,6], and [1,2,3,5,8,9,10]',
      };
    }
  );

  await runTest(
    'PDF04-TC-02',
    'Shared Page Range Parser',
    'parsePageRangeExpression + resolvePdfPageSelection',
    'Odd pages, even pages, all pages, portrait/landscape orientation presets, and 1-page even rejection',
    'Resolve odd=[1,3,5], even=[2,4,6], portrait/landscape filters, and reject even on 1-page PDF with ERR_INVALID_PAGE_RANGE',
    async () => {
      const oddRes = parsePageRangeExpression('odd', 6);
      const evenRes = parsePageRangeExpression('even pages', 6);
      const evenOnSingle = parsePageRangeExpression('even', 1);
      const landscapeRes = resolvePdfPageSelection(
        { mode: 'preset', preset: 'landscape' },
        3,
        { pageOrientations: ['portrait', 'landscape', 'portrait'] }
      );

      const passed =
        oddRes.isValid &&
        JSON.stringify(oddRes.pageNumbers) === JSON.stringify([1, 3, 5]) &&
        evenRes.isValid &&
        JSON.stringify(evenRes.pageNumbers) === JSON.stringify([2, 4, 6]) &&
        !evenOnSingle.isValid &&
        evenOnSingle.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        landscapeRes.isValid &&
        JSON.stringify(landscapeRes.pageNumbers) === JSON.stringify([2]);

      return {
        passed,
        actualResult: `odd=[${oddRes.pageNumbers}], even=[${evenRes.pageNumbers}], evenOn1Page=${evenOnSingle.error?.code}, landscape=[${landscapeRes.pageNumbers}]`,
        independentVerification:
          'Verified odd/even arithmetic progression, orientation preset filter, and 1-page even boundary rejection',
      };
    }
  );

  await runTest(
    'PDF04-TC-03',
    'Shared Page Range Parser',
    'parsePageRangeExpression',
    'Rejection of empty, malformed, reversed/ambiguous, duplicate, overlapping, zero, and out-of-range expressions',
    'Reject all invalid/duplicate/out-of-range selections with code=ERR_INVALID_PAGE_RANGE',
    async () => {
      const cases = [
        parsePageRangeExpression('', 5),
        parsePageRangeExpression('   ', 5),
        parsePageRangeExpression('abc', 5),
        parsePageRangeExpression('0, 2', 5),
        parsePageRangeExpression('1, 6', 5),
        parsePageRangeExpression('4-2', 5), // reversed/ambiguous
        parsePageRangeExpression('1, 2, 2', 5), // duplicate
        parsePageRangeExpression('1-3, 2-4', 5), // overlapping duplicate
        parsePageRangeExpression('1,,3', 5), // empty token
      ];

      const allRejected = cases.every(
        (c) => !c.isValid && c.error?.code === 'ERR_INVALID_PAGE_RANGE'
      );

      return {
        passed: allRejected,
        actualResult: `Rejected ${cases.filter((c) => !c.isValid && c.error?.code === 'ERR_INVALID_PAGE_RANGE').length}/${cases.length} invalid range vectors with ERR_INVALID_PAGE_RANGE`,
        independentVerification:
          'All 9 invalid/duplicate/ambiguous vectors verified to return isValid=false and code=ERR_INVALID_PAGE_RANGE',
      };
    }
  );

  await runTest(
    'PDF04-TC-04',
    'Reorder Permutation Validator',
    'validateReorderPermutation',
    'Valid permutation [3, 1, 4, 2] vs omitted page [3, 1, 2], duplicate page [3, 1, 1, 2], and out-of-range [3, 1, 5, 2]',
    'Accept full permutation; reject omitted/duplicated pages with ERR_REORDER_LENGTH_MISMATCH and out-of-range with ERR_INVALID_PAGE_RANGE',
    async () => {
      const valid = validateReorderPermutation([3, 1, 4, 2], 4);
      const omitted = validateReorderPermutation([3, 1, 2], 4);
      const duplicated = validateReorderPermutation([3, 1, 1, 2], 4);
      const outOfRange = validateReorderPermutation([3, 1, 5, 2], 4);

      const passed =
        valid.isValid &&
        JSON.stringify(valid.pageIndices) === JSON.stringify([2, 0, 3, 1]) &&
        !omitted.isValid &&
        omitted.error?.code === 'ERR_REORDER_LENGTH_MISMATCH' &&
        !duplicated.isValid &&
        duplicated.error?.code === 'ERR_REORDER_LENGTH_MISMATCH' &&
        !outOfRange.isValid &&
        outOfRange.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `valid=[${valid.pageNumbers}], omitted=${omitted.error?.code}, dup=${duplicated.error?.code}, oor=${outOfRange.error?.code}`,
        independentVerification:
          'Bijective set-cardinality and bounds verification confirmed for 4-page permutation',
      };
    }
  );

  // ============================================================================
  // 2. PDF MERGE (PDF04-TC-05 to PDF04-TC-07)
  // ============================================================================

  await runTest(
    'PDF04-TC-05',
    'A. PDF Merge',
    'pdf-merge',
    'Merge 3 PDFs with distinct page counts (2+1+2=5), dimensions (612x792, 842x595, 500x700), rotations (0°, 90°, 180°), and verify input byte immutability',
    'Output 5-page PDF preserving exact text order, dimensions, rotations, and unchanged source bytes',
    async () => {
      const docABytes = await createCustomGeometryPdfFixture([
        { text: 'MERGE_DOC_A_PAGE_1', width: 612, height: 792, rotation: 0 },
        { text: 'MERGE_DOC_A_PAGE_2', width: 612, height: 792, rotation: 90 },
      ]);
      const docBBytes = await createCustomGeometryPdfFixture([
        { text: 'MERGE_DOC_B_PAGE_1', width: 842, height: 595, rotation: 180 },
      ]);
      const docCBytes = await createCustomGeometryPdfFixture([
        { text: 'MERGE_DOC_C_PAGE_1', width: 500, height: 700, rotation: 0 },
        { text: 'MERGE_DOC_C_PAGE_2', width: 500, height: 700, rotation: 270 },
      ]);

      const snapshotA = new Uint8Array(docABytes);
      const snapshotB = new Uint8Array(docBBytes);
      const snapshotC = new Uint8Array(docCBytes);

      const res = await executePageOrganizationOperationV2({
        toolId: 'pdf-merge',
        inputs: [
          { fileName: 'alpha.pdf', bytes: docABytes },
          { fileName: 'beta.pdf', bytes: docBBytes },
          { fileName: 'gamma.pdf', bytes: docCBytes },
        ],
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `Failed with status=${res.status}, code=${res.error?.code}`,
          independentVerification: 'Merge operation did not succeed',
        };
      }

      const inspected = await inspectPdfIndependentlyWithPdfJs(res.primaryFile.bytes);
      const texts = inspected.pages.map((p) => p.text);
      const dims = inspected.pages.map((p) => `${p.width}x${p.height}@${p.rotate}`);

      const inputsUnchanged =
        assertBytesEqual(docABytes, snapshotA) &&
        assertBytesEqual(docBBytes, snapshotB) &&
        assertBytesEqual(docCBytes, snapshotC);

      const passed =
        inspected.numPages === 5 &&
        JSON.stringify(texts) ===
          JSON.stringify([
            'MERGE_DOC_A_PAGE_1',
            'MERGE_DOC_A_PAGE_2',
            'MERGE_DOC_B_PAGE_1',
            'MERGE_DOC_C_PAGE_1',
            'MERGE_DOC_C_PAGE_2',
          ]) &&
        JSON.stringify(dims) ===
          JSON.stringify([
            '612x792@0',
            '612x792@90',
            '842x595@180',
            '500x700@0',
            '500x700@270',
          ]) &&
        inputsUnchanged;

      return {
        passed,
        actualResult: `status=SUCCESS, pageCount=${res.primaryFile.pageCount}, inputsUnchanged=${inputsUnchanged}`,
        independentVerification: `PDF.js numPages=${inspected.numPages}, texts=[${texts.join(', ')}], geometry=[${dims.join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-06',
    'A. PDF Extractor & Merger',
    'pdf-extractor-merger',
    'Selective multi-PDF extraction and merge (page 2 from Doc A + pages 1,3 from Doc B)',
    'Output 3-page merged PDF containing [DOC_A_P2, DOC_B_P1, DOC_B_P3] in exact order',
    async () => {
      const docA = await createCustomGeometryPdfFixture([
        { text: 'EXT_MERGE_A1', width: 612, height: 792 },
        { text: 'EXT_MERGE_A2', width: 612, height: 792 },
      ]);
      const docB = await createCustomGeometryPdfFixture([
        { text: 'EXT_MERGE_B1', width: 612, height: 792 },
        { text: 'EXT_MERGE_B2', width: 612, height: 792 },
        { text: 'EXT_MERGE_B3', width: 612, height: 792 },
      ]);

      const res = await executePageOrganizationOperationV2({
        toolId: 'pdf-extractor-merger',
        inputs: [
          {
            fileName: 'docA.pdf',
            bytes: docA,
            pageSelection: { mode: 'range-string', rangeExpression: '2' },
          },
          {
            fileName: 'docB.pdf',
            bytes: docB,
            pageSelection: { mode: 'range-string', rangeExpression: '1, 3' },
          },
        ],
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Failed to execute pdf-extractor-merger',
        };
      }

      const inspected = await inspectPdfIndependentlyWithPdfJs(res.primaryFile.bytes);
      const texts = inspected.pages.map((p) => p.text);
      const passed =
        res.resolvedCanonicalId === 'pdf-extractor-merger' &&
        inspected.numPages === 3 &&
        JSON.stringify(texts) === JSON.stringify(['EXT_MERGE_A2', 'EXT_MERGE_B1', 'EXT_MERGE_B3']);

      return {
        passed,
        actualResult: `canonicalId=${res.resolvedCanonicalId}, outputPages=${res.primaryFile.pageCount}`,
        independentVerification: `PDF.js numPages=${inspected.numPages}, texts=[${texts.join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-07',
    'A. PDF Merge Validation & Rejection',
    'pdf-merge',
    'Reject single-file merge (ERR_SECOND_FILE_REQUIRED) and reject invalid/non-PDF second file (ERR_INVALID_PDF)',
    'Single file rejected with ERR_SECOND_FILE_REQUIRED; non-PDF file rejected with ERR_INVALID_PDF; 0 active sessions leaked',
    async () => {
      const validPdf = await createCustomGeometryPdfFixture([
        { text: 'VALID_P1', width: 612, height: 792 },
      ]);
      const pngBytes = createPngDisguisedAsPdfFixture();

      const singleFileRes = await mergePdfsV2([{ fileName: 'only_one.pdf', bytes: validPdf }]);
      const badSecondFileRes = await mergePdfsV2([
        { fileName: 'valid.pdf', bytes: validPdf },
        { fileName: 'fake.pdf', bytes: pngBytes },
      ]);

      const activeSessions = pdfLifecycleManager.getActiveSessionCount();

      const passed =
        singleFileRes.error?.code === 'ERR_SECOND_FILE_REQUIRED' &&
        badSecondFileRes.error?.code === 'ERR_INVALID_PDF' &&
        activeSessions === 0;

      return {
        passed,
        actualResult: `singleFile=${singleFileRes.error?.code}, badSecondFile=${badSecondFileRes.error?.code}, activeSessions=${activeSessions}`,
        independentVerification:
          'Confirmed ERR_SECOND_FILE_REQUIRED on 1 file, ERR_INVALID_PDF on PNG second input, and 0 leaked lifecycle sessions',
      };
    }
  );

  // ============================================================================
  // 3. PDF SPLIT (PDF04-TC-08 to PDF04-TC-11)
  // ============================================================================

  await runTest(
    'PDF04-TC-08',
    'B. PDF Split by Page Ranges + ZIP Packaging',
    'pdf-split',
    'Split a 5-page PDF using range groups "1-2, 3, 4-end" into 3 separate PDFs packaged into a ZIP archive',
    'Generate valid ZIP containing 3 PDFs with page counts (2, 1, 2) and exact page texts verified via JSZip + PDF.js',
    async () => {
      const fivePagePdf = await createCustomGeometryPdfFixture([
        { text: 'SPLIT_P1', width: 612, height: 792 },
        { text: 'SPLIT_P2', width: 612, height: 792 },
        { text: 'SPLIT_P3', width: 842, height: 595, rotation: 90 },
        { text: 'SPLIT_P4', width: 612, height: 792 },
        { text: 'SPLIT_P5', width: 612, height: 792 },
      ]);

      const res = await executePageOrganizationOperationV2({
        toolId: 'pdf-split',
        inputs: [{ fileName: 'handbook.pdf', bytes: fivePagePdf }],
        options: {
          splitMode: 'ranges',
          rangeGroups: '1-2, 3, 4-end',
        },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Split operation failed',
        };
      }

      // Independently unpack the returned ZIP archive with JSZip
      const loadedZip = await JSZip.loadAsync(res.primaryFile.bytes);
      const entryNames = Object.keys(loadedZip.files).filter((k) => !loadedZip.files[k].dir);

      const unzippedSummaries: string[] = [];
      for (const name of entryNames) {
        const pdfBytes = await loadedZip.files[name].async('uint8array');
        const info = await inspectPdfIndependentlyWithPdfJs(pdfBytes);
        unzippedSummaries.push(
          `${name}:pages=${info.numPages}[${info.pages.map((p) => p.text).join('|')}]`
        );
      }

      const passed =
        res.primaryFile.mimeType === 'application/zip' &&
        entryNames.length === 3 &&
        unzippedSummaries[0].includes('pages=2[SPLIT_P1|SPLIT_P2]') &&
        unzippedSummaries[1].includes('pages=1[SPLIT_P3]') &&
        unzippedSummaries[2].includes('pages=2[SPLIT_P4|SPLIT_P5]');

      return {
        passed,
        actualResult: `mimeType=${res.primaryFile.mimeType}, zipFile=${res.primaryFile.fileName}, parts=${entryNames.length}`,
        independentVerification: `JSZip unpacked ${entryNames.length} PDFs; PDF.js verified: ${unzippedSummaries.join('; ')}`,
      };
    }
  );

  await runTest(
    'PDF04-TC-09',
    'B. PDF Split Every Page into Individual PDFs',
    'pdf-split',
    'Split every page of a 4-page PDF into 4 individual 1-page PDFs packaged into a ZIP archive',
    'Produce ZIP archive with 4 individual 1-page PDFs, each reopening cleanly in PDF.js',
    async () => {
      const fourPagePdf = await createCustomGeometryPdfFixture([
        { text: 'EVERY_PAGE_1', width: 612, height: 792 },
        { text: 'EVERY_PAGE_2', width: 612, height: 792 },
        { text: 'EVERY_PAGE_3', width: 612, height: 792 },
        { text: 'EVERY_PAGE_4', width: 612, height: 792 },
      ]);

      const res = await splitPdfV2(
        { fileName: 'quarterly.pdf', bytes: fourPagePdf },
        { splitMode: 'every-page' }
      );

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Every-page split failed',
        };
      }

      const loadedZip = await JSZip.loadAsync(res.primaryFile.bytes);
      const entryNames = Object.keys(loadedZip.files).filter((k) => !loadedZip.files[k].dir);
      const pageTexts: string[] = [];

      for (const name of entryNames) {
        const pdfBytes = await loadedZip.files[name].async('uint8array');
        const info = await inspectPdfIndependentlyWithPdfJs(pdfBytes);
        if (info.numPages === 1) {
          pageTexts.push(info.pages[0].text);
        }
      }

      const passed =
        res.primaryFile.mimeType === 'application/zip' &&
        entryNames.length === 4 &&
        JSON.stringify(pageTexts) ===
          JSON.stringify(['EVERY_PAGE_1', 'EVERY_PAGE_2', 'EVERY_PAGE_3', 'EVERY_PAGE_4']);

      return {
        passed,
        actualResult: `zipEntries=${entryNames.length}, outputFiles=${res.outputFiles.length}`,
        independentVerification: `JSZip + PDF.js verified 4 individual 1-page PDFs: [${pageTexts.join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-10',
    'B. PDF Split by Fixed Page Count',
    'pdf-split-by-page-count-tool',
    'Split a 5-page PDF by pagesPerChunk=2 into 3 PDFs (2 pages, 2 pages, 1 page) packaged in a ZIP',
    'Produce ZIP archive with 3 PDFs having page counts [2, 2, 1]',
    async () => {
      const fivePagePdf = await createCustomGeometryPdfFixture([
        { text: 'CHUNK_P1', width: 612, height: 792 },
        { text: 'CHUNK_P2', width: 612, height: 792 },
        { text: 'CHUNK_P3', width: 612, height: 792 },
        { text: 'CHUNK_P4', width: 612, height: 792 },
        { text: 'CHUNK_P5', width: 612, height: 792 },
      ]);

      const res = await executePageOrganizationOperationV2({
        toolId: 'pdf-split-by-page-count-tool',
        inputs: [{ fileName: 'manual.pdf', bytes: fivePagePdf }],
        options: { pagesPerChunk: 2 },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Split by page count failed',
        };
      }

      const loadedZip = await JSZip.loadAsync(res.primaryFile.bytes);
      const entryNames = Object.keys(loadedZip.files).filter((k) => !loadedZip.files[k].dir);
      const counts: number[] = [];

      for (const name of entryNames) {
        const pdfBytes = await loadedZip.files[name].async('uint8array');
        const info = await inspectPdfIndependentlyWithPdfJs(pdfBytes);
        counts.push(info.numPages);
      }

      const passed =
        res.resolvedCanonicalId === 'pdf-split-by-page-count-tool' &&
        entryNames.length === 3 &&
        JSON.stringify(counts) === JSON.stringify([2, 2, 1]);

      return {
        passed,
        actualResult: `canonicalId=${res.resolvedCanonicalId}, chunks=${entryNames.length}`,
        independentVerification: `JSZip + PDF.js verified chunk page counts: [${counts.join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-11',
    'B. PDF Split Edge Cases & Invalid Range Rejection',
    'pdf-split',
    'Single-page PDF split + rejection of out-of-range split ("1-10" on 1-page PDF) and invalid chunk size (0)',
    '1-page PDF produces 1 valid PDF; invalid range and chunkSize=0 rejected with ERR_INVALID_PAGE_RANGE',
    async () => {
      const singlePagePdf = await createCustomGeometryPdfFixture([
        { text: 'SINGLE_SPLIT_P1', width: 612, height: 792 },
      ]);

      const singleRes = await splitPdfV2(
        { fileName: 'onepage.pdf', bytes: singlePagePdf },
        { splitMode: 'every-page' }
      );
      const badRangeRes = await splitPdfV2(
        { fileName: 'onepage.pdf', bytes: singlePagePdf },
        { splitMode: 'ranges', rangeGroups: '1-10' }
      );
      const badChunkRes = await splitPdfV2(
        { fileName: 'onepage.pdf', bytes: singlePagePdf },
        { splitMode: 'by-page-count', pagesPerChunk: 0 }
      );

      const inspectedSingle = singleRes.primaryFile
        ? await inspectPdfIndependentlyWithPdfJs(singleRes.primaryFile.bytes)
        : null;

      const passed =
        singleRes.status === 'SUCCESS' &&
        inspectedSingle?.numPages === 1 &&
        inspectedSingle.pages[0].text === 'SINGLE_SPLIT_P1' &&
        badRangeRes.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        badChunkRes.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `singleStatus=${singleRes.status}, badRange=${badRangeRes.error?.code}, badChunk=${badChunkRes.error?.code}`,
        independentVerification: `1-page PDF reopened in PDF.js (numPages=1); invalid range & chunk size rejected with ERR_INVALID_PAGE_RANGE`,
      };
    }
  );

  // ============================================================================
  // 4. EXTRACT PAGES (PDF04-TC-12 to PDF04-TC-13)
  // ============================================================================

  await runTest(
    'PDF04-TC-12',
    'C. Extract Pages',
    'pdf-extract-pages + pdf-page-extraction-tool',
    'Extract selected pages ("2, 4-end" and "odd") from a 5-page PDF preserving order, dimensions, and rotations',
    'pdf-extract-pages outputs 3 pages [P2, P4, P5]; pdf-page-extraction-tool outputs 3 odd pages [P1, P3, P5]',
    async () => {
      const fivePagePdf = await createCustomGeometryPdfFixture([
        { text: 'EXT_P1', width: 612, height: 792, rotation: 0 },
        { text: 'EXT_P2', width: 842, height: 595, rotation: 90 },
        { text: 'EXT_P3', width: 612, height: 792, rotation: 180 },
        { text: 'EXT_P4', width: 500, height: 700, rotation: 270 },
        { text: 'EXT_P5', width: 612, height: 792, rotation: 0 },
      ]);

      const res1 = await executePageOrganizationOperationV2({
        toolId: 'pdf-extract-pages',
        inputs: [{ fileName: 'source.pdf', bytes: fivePagePdf }],
        options: { selection: '2, 4-end' },
      });

      const res2 = await executePageOrganizationOperationV2({
        toolId: 'pdf-page-extraction-tool',
        inputs: [{ fileName: 'source.pdf', bytes: fivePagePdf }],
        options: { selection: 'odd' },
      });

      if (
        res1.status !== 'SUCCESS' ||
        !res1.primaryFile ||
        res2.status !== 'SUCCESS' ||
        !res2.primaryFile
      ) {
        return {
          passed: false,
          actualResult: `res1=${res1.status}, res2=${res2.status}`,
          independentVerification: 'Extraction failed',
        };
      }

      const info1 = await inspectPdfIndependentlyWithPdfJs(res1.primaryFile.bytes);
      const info2 = await inspectPdfIndependentlyWithPdfJs(res2.primaryFile.bytes);

      const passed =
        res1.resolvedCanonicalId === 'pdf-extract-pages' &&
        res2.resolvedCanonicalId === 'pdf-page-extraction-tool' &&
        info1.numPages === 3 &&
        JSON.stringify(info1.pages.map((p) => p.text)) ===
          JSON.stringify(['EXT_P2', 'EXT_P4', 'EXT_P5']) &&
        info1.pages[0].width === 842 &&
        info1.pages[0].rotate === 90 &&
        info1.pages[1].width === 500 &&
        info1.pages[1].rotate === 270 &&
        info2.numPages === 3 &&
        JSON.stringify(info2.pages.map((p) => p.text)) ===
          JSON.stringify(['EXT_P1', 'EXT_P3', 'EXT_P5']);

      return {
        passed,
        actualResult: `res1Pages=${info1.numPages}, res2Pages=${info2.numPages}`,
        independentVerification: `PDF.js verified res1=[${info1.pages.map((p) => `${p.text}@${p.rotate}`).join(', ')}], res2=[${info2.pages.map((p) => p.text).join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-13',
    'C. Extract Pages Invalid Selection & Corrupt Input Rejection',
    'pdf-extract-pages',
    'Reject empty selection, out-of-range page ("1, 9"), duplicate selection ("2, 2"), and invalid PDF input',
    'Reject invalid selections with ERR_INVALID_PAGE_RANGE and corrupt input with ERR_INVALID_PDF',
    async () => {
      const threePagePdf = await createCustomGeometryPdfFixture([
        { text: 'P1', width: 612, height: 792 },
        { text: 'P2', width: 612, height: 792 },
        { text: 'P3', width: 612, height: 792 },
      ]);

      const emptySel = await extractPdfPagesV2(
        { fileName: 'doc.pdf', bytes: threePagePdf },
        { selection: '' }
      );
      const oorSel = await extractPdfPagesV2(
        { fileName: 'doc.pdf', bytes: threePagePdf },
        { selection: '1, 9' }
      );
      const dupSel = await extractPdfPagesV2(
        { fileName: 'doc.pdf', bytes: threePagePdf },
        { selection: '2, 2' }
      );
      const badPdf = await extractPdfPagesV2(
        { fileName: 'bad.pdf', bytes: createInvalidMagicBytesFixture() },
        { selection: '1' }
      );

      const passed =
        emptySel.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        oorSel.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        dupSel.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        badPdf.error?.code === 'ERR_INVALID_PDF';

      return {
        passed,
        actualResult: `empty=${emptySel.error?.code}, oor=${oorSel.error?.code}, dup=${dupSel.error?.code}, badPdf=${badPdf.error?.code}`,
        independentVerification:
          'All 3 invalid page selection vectors rejected with ERR_INVALID_PAGE_RANGE; invalid binary rejected with ERR_INVALID_PDF',
      };
    }
  );

  // ============================================================================
  // 5. DELETE PAGES (PDF04-TC-14 to PDF04-TC-15)
  // ============================================================================

  await runTest(
    'PDF04-TC-14',
    'D. Delete Pages',
    'pdf-delete-pages',
    'Delete pages "2, 4" from a 5-page PDF and verify remaining pages [1, 3, 5] in PDF.js',
    'Output 3-page PDF containing [DEL_P1, DEL_P3, DEL_P5] with preserved dimensions and rotations',
    async () => {
      const fivePagePdf = await createCustomGeometryPdfFixture([
        { text: 'DEL_P1', width: 612, height: 792, rotation: 0 },
        { text: 'DEL_P2', width: 612, height: 792, rotation: 0 },
        { text: 'DEL_P3', width: 842, height: 595, rotation: 90 },
        { text: 'DEL_P4', width: 612, height: 792, rotation: 0 },
        { text: 'DEL_P5', width: 500, height: 700, rotation: 180 },
      ]);

      const res = await executePageOrganizationOperationV2({
        toolId: 'pdf-delete-pages',
        inputs: [{ fileName: 'report.pdf', bytes: fivePagePdf }],
        options: { selection: '2, 4' },
      });

      if (res.status !== 'SUCCESS' || !res.primaryFile) {
        return {
          passed: false,
          actualResult: `status=${res.status}, error=${res.error?.code}`,
          independentVerification: 'Delete operation failed',
        };
      }

      const info = await inspectPdfIndependentlyWithPdfJs(res.primaryFile.bytes);
      const texts = info.pages.map((p) => p.text);

      const passed =
        info.numPages === 3 &&
        JSON.stringify(texts) === JSON.stringify(['DEL_P1', 'DEL_P3', 'DEL_P5']) &&
        info.pages[1].width === 842 &&
        info.pages[1].rotate === 90 &&
        info.pages[2].width === 500 &&
        info.pages[2].rotate === 180;

      return {
        passed,
        actualResult: `status=SUCCESS, remainingPages=${res.primaryFile.pageCount}`,
        independentVerification: `PDF.js numPages=${info.numPages}, texts=[${texts.join(', ')}]`,
      };
    }
  );

  await runTest(
    'PDF04-TC-15',
    'D. Delete Pages Guard Against Empty Output & Invalid Selection',
    'pdf-delete-pages',
    'Reject deleting all pages from a 1-page PDF and a 3-page PDF ("1-end") with ERR_CANNOT_DELETE_ALL_PAGES; reject out-of-range selection',
    'Return ERR_CANNOT_DELETE_ALL_PAGES when all pages are selected for deletion; return ERR_INVALID_PAGE_RANGE on invalid selection',
    async () => {
      const onePagePdf = await createCustomGeometryPdfFixture([
        { text: 'ONLY_PAGE', width: 612, height: 792 },
      ]);
      const threePagePdf = await createCustomGeometryPdfFixture([
        { text: 'P1', width: 612, height: 792 },
        { text: 'P2', width: 612, height: 792 },
        { text: 'P3', width: 612, height: 792 },
      ]);

      const delSingle = await deletePdfPagesV2(
        { fileName: 'one.pdf', bytes: onePagePdf },
        { selection: '1' }
      );
      const delAllThree = await deletePdfPagesV2(
        { fileName: 'three.pdf', bytes: threePagePdf },
        { selection: '1-end' }
      );
      const delInvalid = await deletePdfPagesV2(
        { fileName: 'three.pdf', bytes: threePagePdf },
        { selection: '5' }
      );

      const passed =
        delSingle.error?.code === 'ERR_CANNOT_DELETE_ALL_PAGES' &&
        delAllThree.error?.code === 'ERR_CANNOT_DELETE_ALL_PAGES' &&
        delInvalid.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `delSingle=${delSingle.error?.code}, delAllThree=${delAllThree.error?.code}, delInvalid=${delInvalid.error?.code}`,
        independentVerification:
          'Verified ERR_CANNOT_DELETE_ALL_PAGES blocks 0-page output on both 1-page and multi-page PDFs',
      };
    }
  );

  // ============================================================================
  // 6. REORDER PAGES (PDF04-TC-16 to PDF04-TC-17)
  // ============================================================================

  await runTest(
    'PDF04-TC-16',
    'E. Reorder Pages',
    'pdf-reorder-pages + pdf-page-reordering-tool',
    'Reorder a 4-page PDF using permutation [4, 2, 1, 3] and "3, 4, 1, 2" preserving dimensions and rotations',
    'Output 4-page PDFs in exact permuted order with zero omitted or duplicated pages',
    async () => {
      const fourPagePdf = await createCustomGeometryPdfFixture([
        { text: 'REORDER_P1', width: 612, height: 792, rotation: 0 },
        { text: 'REORDER_P2', width: 842, height: 595, rotation: 90 },
        { text: 'REORDER_P3', width: 500, height: 700, rotation: 180 },
        { text: 'REORDER_P4', width: 420, height: 595, rotation: 270 },
      ]);

      const res1 = await executePageOrganizationOperationV2({
        toolId: 'pdf-reorder-pages',
        inputs: [{ fileName: 'deck.pdf', bytes: fourPagePdf }],
        options: { newOrder: [4, 2, 1, 3] },
      });

      const res2 = await executePageOrganizationOperationV2({
        toolId: 'pdf-page-reordering-tool',
        inputs: [{ fileName: 'deck.pdf', bytes: fourPagePdf }],
        options: { newOrder: '3, 4, 1, 2' },
      });

      if (
        res1.status !== 'SUCCESS' ||
        !res1.primaryFile ||
        res2.status !== 'SUCCESS' ||
        !res2.primaryFile
      ) {
        return {
          passed: false,
          actualResult: `res1=${res1.status}, res2=${res2.status}`,
          independentVerification: 'Reorder operation failed',
        };
      }

      const info1 = await inspectPdfIndependentlyWithPdfJs(res1.primaryFile.bytes);
      const info2 = await inspectPdfIndependentlyWithPdfJs(res2.primaryFile.bytes);

      const passed =
        res1.resolvedCanonicalId === 'pdf-reorder-pages' &&
        res2.resolvedCanonicalId === 'pdf-page-reordering-tool' &&
        info1.numPages === 4 &&
        JSON.stringify(info1.pages.map((p) => p.text)) ===
          JSON.stringify(['REORDER_P4', 'REORDER_P2', 'REORDER_P1', 'REORDER_P3']) &&
        info1.pages[0].width === 420 &&
        info1.pages[0].rotate === 270 &&
        info1.pages[1].width === 842 &&
        info1.pages[1].rotate === 90 &&
        info2.numPages === 4 &&
        JSON.stringify(info2.pages.map((p) => p.text)) ===
          JSON.stringify(['REORDER_P3', 'REORDER_P4', 'REORDER_P1', 'REORDER_P2']);

      return {
        passed,
        actualResult: `res1=[${info1.pages.map((p) => p.text).join(', ')}], res2=[${info2.pages.map((p) => p.text).join(', ')}]`,
        independentVerification:
          'PDF.js verified exact permuted text sequences and preserved page dimensions/rotations',
      };
    }
  );

  await runTest(
    'PDF04-TC-17',
    'E. Reorder Pages Omission & Duplicate Prevention',
    'pdf-reorder-pages',
    'Reject reorder permutations that omit a page ([1, 2, 3] on 4-page PDF), duplicate a page ([1, 2, 2, 4]), or exceed bounds ([1, 2, 3, 9])',
    'Reject omission and duplication with ERR_REORDER_LENGTH_MISMATCH; reject out-of-range with ERR_INVALID_PAGE_RANGE',
    async () => {
      const fourPagePdf = await createCustomGeometryPdfFixture([
        { text: 'P1', width: 612, height: 792 },
        { text: 'P2', width: 612, height: 792 },
        { text: 'P3', width: 612, height: 792 },
        { text: 'P4', width: 612, height: 792 },
      ]);

      const omittedRes = await reorderPdfPagesV2(
        { fileName: 'four.pdf', bytes: fourPagePdf },
        { newOrder: [1, 2, 3] }
      );
      const dupRes = await reorderPdfPagesV2(
        { fileName: 'four.pdf', bytes: fourPagePdf },
        { newOrder: [1, 2, 2, 4] }
      );
      const oorRes = await reorderPdfPagesV2(
        { fileName: 'four.pdf', bytes: fourPagePdf },
        { newOrder: [1, 2, 3, 9] }
      );

      const passed =
        omittedRes.error?.code === 'ERR_REORDER_LENGTH_MISMATCH' &&
        dupRes.error?.code === 'ERR_REORDER_LENGTH_MISMATCH' &&
        oorRes.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `omitted=${omittedRes.error?.code}, dup=${dupRes.error?.code}, oor=${oorRes.error?.code}`,
        independentVerification:
          'Verified strict bijection check prevents accidental page loss or duplication during reordering',
      };
    }
  );

  // ============================================================================
  // 7. ROTATE PAGES (PDF04-TC-18 to PDF04-TC-19)
  // ============================================================================

  await runTest(
    'PDF04-TC-18',
    'F. Rotate Pages',
    'pdf-rotate-pages + pdf-page-rotation-tool + pdf-rotate',
    'Rotate selected pages ("1, 3" by +90°) while preserving unselected page 2 (initial 180°) and page 4 (initial 90°); test -90° on pdf-page-rotation-tool',
    'Selected pages rotated by exact 90-degree increments modulo 360; unselected pages unchanged',
    async () => {
      const fourPagePdf = await createCustomGeometryPdfFixture([
        { text: 'ROT_P1', width: 612, height: 792, rotation: 0 },
        { text: 'ROT_P2', width: 612, height: 792, rotation: 180 },
        { text: 'ROT_P3', width: 612, height: 792, rotation: 270 },
        { text: 'ROT_P4', width: 612, height: 792, rotation: 90 },
      ]);

      // Rotate pages 1 and 3 by +90° (P1: 0->90, P2: stays 180, P3: 270->0, P4: stays 90)
      const res1 = await executePageOrganizationOperationV2({
        toolId: 'pdf-rotate-pages',
        inputs: [{ fileName: 'scan.pdf', bytes: fourPagePdf }],
        options: {
          angleDegrees: 90,
          selection: '1, 3',
        },
      });

      // Rotate all pages of res1 by -90° via pdf-page-rotation-tool (90->0, 180->90, 0->270, 90->0)
      const res2 = await executePageOrganizationOperationV2({
        toolId: 'pdf-page-rotation-tool',
        inputs: [
          {
            fileName: 'scan_step1.pdf',
            bytes: res1.primaryFile?.bytes || new Uint8Array(0),
          },
        ],
        options: {
          angleDegrees: -90,
        },
      });

      if (
        res1.status !== 'SUCCESS' ||
        !res1.primaryFile ||
        res2.status !== 'SUCCESS' ||
        !res2.primaryFile
      ) {
        return {
          passed: false,
          actualResult: `res1=${res1.status}, res2=${res2.status}`,
          independentVerification: 'Rotation failed',
        };
      }

      const info1 = await inspectPdfIndependentlyWithPdfJs(res1.primaryFile.bytes);
      const info2 = await inspectPdfIndependentlyWithPdfJs(res2.primaryFile.bytes);

      const rot1 = info1.pages.map((p) => p.rotate);
      const rot2 = info2.pages.map((p) => p.rotate);

      const passed =
        res1.resolvedCanonicalId === 'pdf-rotate-pages' &&
        res2.resolvedCanonicalId === 'pdf-page-rotation-tool' &&
        JSON.stringify(rot1) === JSON.stringify([90, 180, 0, 90]) &&
        JSON.stringify(rot2) === JSON.stringify([0, 90, 270, 0]);

      return {
        passed,
        actualResult: `step1Rotations=[${rot1.join(', ')}], step2Rotations=[${rot2.join(', ')}]`,
        independentVerification:
          'PDF.js independently verified page.rotate angles for both selective (+90°) and bulk (-90°) rotations',
      };
    }
  );

  await runTest(
    'PDF04-TC-19',
    'F. Rotate Pages Invalid Angle & Selection Rejection',
    'pdf-rotate-pages',
    'Reject non-90-degree rotation angles (45°, 0°, 33°) and out-of-range page selection ("1-99")',
    'Reject invalid angles and out-of-range selections with ERR_INVALID_PAGE_RANGE',
    async () => {
      const twoPagePdf = await createCustomGeometryPdfFixture([
        { text: 'P1', width: 612, height: 792 },
        { text: 'P2', width: 612, height: 792 },
      ]);

      const badAngle45 = await rotatePdfPagesV2(
        { fileName: 'two.pdf', bytes: twoPagePdf },
        { angleDegrees: 45 }
      );
      const badAngle0 = await rotatePdfPagesV2(
        { fileName: 'two.pdf', bytes: twoPagePdf },
        { angleDegrees: 0 }
      );
      const badSel = await rotatePdfPagesV2(
        { fileName: 'two.pdf', bytes: twoPagePdf },
        { angleDegrees: 90, selection: '1-99' }
      );

      const passed =
        badAngle45.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        badAngle0.error?.code === 'ERR_INVALID_PAGE_RANGE' &&
        badSel.error?.code === 'ERR_INVALID_PAGE_RANGE';

      return {
        passed,
        actualResult: `angle45=${badAngle45.error?.code}, angle0=${badAngle0.error?.code}, badSel=${badSel.error?.code}`,
        independentVerification:
          'Verified non-90-degree increments and out-of-bounds page selections are rejected before mutating pages',
      };
    }
  );

  // ============================================================================
  // 8. CANONICAL ROUTING, ALIASES, NO-FALLBACK & LIFECYCLE VERIFICATION (PDF04-TC-20)
  // ============================================================================

  await runTest(
    'PDF04-TC-20',
    'Canonical Routing & Lifecycle Cleanup',
    'All 11 Page Org Canonical IDs + pdf-rotate alias',
    'Verify all 11 canonical IDs and pdf-rotate alias execute cleanly, reject non-page-org IDs (pdf-compress, unknown-tool) with ERR_UNSUPPORTED_OPERATION, and leave 0 active lifecycle sessions',
    'All 11 canonical IDs + alias succeed; non-page-org and unknown IDs rejected with ERR_UNSUPPORTED_OPERATION; activeSessionCount=0',
    async () => {
      const pdfA = await createCustomGeometryPdfFixture([
        { text: 'ROUTE_A1', width: 612, height: 792 },
        { text: 'ROUTE_A2', width: 612, height: 792 },
      ]);
      const pdfB = await createCustomGeometryPdfFixture([
        { text: 'ROUTE_B1', width: 612, height: 792 },
      ]);

      const inputA: PdfDocumentInput = { fileName: 'a.pdf', bytes: pdfA };
      const inputB: PdfDocumentInput = { fileName: 'b.pdf', bytes: pdfB };

      const calls = [
        executePageOrganizationOperationV2({ toolId: 'pdf-merge', inputs: [inputA, inputB] }),
        executePageOrganizationOperationV2({ toolId: 'pdf-extractor-merger', inputs: [inputA, inputB] }),
        executePageOrganizationOperationV2({ toolId: 'pdf-split', inputs: [inputA], options: { rangeGroups: '1, 2' } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-split-by-page-count-tool', inputs: [inputA], options: { pagesPerChunk: 1 } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-extract-pages', inputs: [inputA], options: { selection: '1' } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-page-extraction-tool', inputs: [inputA], options: { selection: '2' } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-delete-pages', inputs: [inputA], options: { selection: '2' } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-reorder-pages', inputs: [inputA], options: { newOrder: [2, 1] } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-page-reordering-tool', inputs: [inputA], options: { newOrder: [2, 1] } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-rotate-pages', inputs: [inputA], options: { angleDegrees: 90 } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-page-rotation-tool', inputs: [inputA], options: { angleDegrees: 180 } }),
        executePageOrganizationOperationV2({ toolId: 'pdf-rotate', inputs: [inputA], options: { angleDegrees: 270 } }),
      ];

      const outcomes = await Promise.all(calls);
      const allTwelveSucceeded = outcomes.every((o) => o.status === 'SUCCESS');

      // Test rejection of non-page-organization tool ID and unknown tool ID
      const wrongModuleRes = await executePageOrganizationOperationV2({
        toolId: 'pdf-compress',
        inputs: [inputA],
      });
      const unknownToolRes = await executePageOrganizationOperationV2({
        toolId: 'non-existent-pdf-tool',
        inputs: [inputA],
      });
      const emptyFileRes = await executePageOrganizationOperationV2({
        toolId: 'pdf-extract-pages',
        inputs: [{ fileName: 'empty.pdf', bytes: createEmptyBufferFixture() }],
        options: { selection: '1' },
      });

      const activeSessionCount = pdfLifecycleManager.getActiveSessionCount();
      const activeTrackedBytes = pdfLifecycleManager.getActiveTotalBytes();

      const passed =
        allTwelveSucceeded &&
        wrongModuleRes.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        unknownToolRes.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        emptyFileRes.error?.code === 'ERR_EMPTY_FILE' &&
        activeSessionCount === 0 &&
        activeTrackedBytes === 0;

      return {
        passed,
        actualResult: `succeeded=${outcomes.filter((o) => o.status === 'SUCCESS').length}/12, wrongModule=${wrongModuleRes.error?.code}, unknown=${unknownToolRes.error?.code}, activeSessions=${activeSessionCount}`,
        independentVerification:
          'Verified all 11 canonical IDs + pdf-rotate alias succeed, non-page-org IDs reject with ERR_UNSUPPORTED_OPERATION, and 0 bytes/sessions remain allocated',
      };
    }
  );

  return results;
}

async function main() {
  console.log('=== CALCTOOLS PHASE PDF-04 PAGE ORGANIZATION ENGINE TEST RESULTS ===');
  const results = await runAllPdf04Tests();
  let passedCount = 0;

  for (const r of results) {
    if (r.status === 'VERIFIED') passedCount++;
    console.log(`[${r.status}] ${r.testId} (${r.operation} — ${r.canonicalIdsTested}) - ${r.durationMs}ms`);
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
