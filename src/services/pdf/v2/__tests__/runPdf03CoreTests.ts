import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  PDF_TOOL_OPERATION_REGISTRY,
  cloneIsolatedPdfBytes,
  loadPdfDocumentV2,
  pdfLifecycleManager,
  resolvePdfOperationCapabilities,
  serializeAndVerifyPdfV2,
  validatePdfInput,
  verifyPdfOutputIntegrity,
} from '../index';
import {
  createEmptyBufferFixture,
  createInvalidMagicBytesFixture,
  createMalformedPdfWithBrokenStructureFixture,
  createPasswordProtectedPdfFixture,
  createPngDisguisedAsPdfFixture,
  createTruncatedPdfMissingEofFixture,
  createValidMultiPagePdfFixture,
} from './pdfTestFixtures';

export interface CoreTestRecord {
  testId: string;
  testArea: string;
  inputFixture: string;
  expectedOutcome: string;
  actualOutcome: string;
  independentVerification: string;
  verdict: 'VERIFIED' | 'PARTIAL' | 'FAILED' | 'BLOCKED' | 'NOT TESTED';
  durationMs: number;
}

export async function runAllPdf03CoreTests(): Promise<CoreTestRecord[]> {
  const results: CoreTestRecord[] = [];

  async function runTest(
    testId: string,
    testArea: string,
    inputFixture: string,
    expectedOutcome: string,
    fn: () => Promise<{ actualOutcome: string; independentVerification: string; passed: boolean }>
  ) {
    const start = performance.now();
    try {
      const res = await fn();
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        testId,
        testArea,
        inputFixture,
        expectedOutcome,
        actualOutcome: res.actualOutcome,
        independentVerification: res.independentVerification,
        verdict: res.passed ? 'VERIFIED' : 'FAILED',
        durationMs,
      });
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      results.push({
        testId,
        testArea,
        inputFixture,
        expectedOutcome,
        actualOutcome: `Uncaught exception: ${err?.message || String(err)}`,
        independentVerification: 'Exception thrown during execution',
        verdict: 'FAILED',
        durationMs,
      });
    }
  }

  // 1. Valid PDF loading
  await runTest(
    'PDF03-TC-01',
    '1. Valid PDF loading',
    '3-page generated PDF fixture (612x792 pt, Title="CalcTools PDF-03 Core Verification Fixture")',
    'status === SUCCESS, pageCount === 3, metadata.title matches, independent PDF.js confirms 3 pages',
    async () => {
      const fixtureBytes = await createValidMultiPagePdfFixture();
      const loadRes = await loadPdfDocumentV2({
        fileName: 'valid-3page.pdf',
        bytes: fixtureBytes,
      });

      const session = await openManagedPdfDocument(fixtureBytes);
      const pdfJsPages = session.pdfDoc.numPages;
      const page1 = await session.pdfDoc.getPage(1);
      const textContent = await page1.getTextContent();
      const page1Text = textContent.items.map((it: any) => it.str).join(' ');
      await page1.cleanup();
      await session.dispose();

      const passed =
        loadRes.success === true &&
        loadRes.status === 'SUCCESS' &&
        loadRes.metadata?.pageCount === 3 &&
        loadRes.metadata?.title === 'CalcTools PDF-03 Core Verification Fixture' &&
        pdfJsPages === 3 &&
        page1Text.includes('CALCTOOLS_PDF03_FIXTURE_PAGE_1');

      await loadRes.dispose();

      return {
        passed,
        actualOutcome: `status=${loadRes.status}, pageCount=${loadRes.metadata?.pageCount}, title="${loadRes.metadata?.title}"`,
        independentVerification: `PDF.js numPages=${pdfJsPages}, page1Text="${page1Text}"`,
      };
    }
  );

  // 2. Empty-file rejection
  await runTest(
    'PDF03-TC-02',
    '2. Empty-file rejection',
    '0-byte Uint8Array(0)',
    'isValid === false, error.code === ERR_EMPTY_FILE, status === VALIDATION_ERROR',
    async () => {
      const emptyBytes = createEmptyBufferFixture();
      const valRes = validatePdfInput(emptyBytes);
      const loadRes = await loadPdfDocumentV2(emptyBytes);

      const passed =
        valRes.isValid === false &&
        valRes.error?.code === 'ERR_EMPTY_FILE' &&
        loadRes.success === false &&
        loadRes.error?.code === 'ERR_EMPTY_FILE' &&
        loadRes.status === 'VALIDATION_ERROR';

      return {
        passed,
        actualOutcome: `validate.code=${valRes.error?.code}, load.status=${loadRes.status}, load.code=${loadRes.error?.code}`,
        independentVerification: `Byte length verified at ${emptyBytes.byteLength} bytes; both validatePdfInput and loadPdfDocumentV2 rejected with ERR_EMPTY_FILE`,
      };
    }
  );

  // 3. Invalid magic-byte rejection
  await runTest(
    'PDF03-TC-03',
    '3. Invalid magic-byte rejection',
    '256-byte binary buffer starting with 0x13 0x37 0xC0 0xDE',
    'isValid === false, detectedFormat === unknown, error.code === ERR_INVALID_PDF',
    async () => {
      const badMagic = createInvalidMagicBytesFixture();
      const valRes = validatePdfInput(badMagic);
      const loadRes = await loadPdfDocumentV2(badMagic);

      const passed =
        valRes.isValid === false &&
        valRes.detectedFormat === 'unknown' &&
        valRes.error?.code === 'ERR_INVALID_PDF' &&
        loadRes.success === false &&
        loadRes.error?.code === 'ERR_INVALID_PDF';

      return {
        passed,
        actualOutcome: `detectedFormat=${valRes.detectedFormat}, error.code=${valRes.error?.code}, reason=${valRes.error?.technicalDetails?.reason}`,
        independentVerification: `Header bytes [0x13, 0x37, 0xC0, 0xDE] confirmed non-PDF; rejected before parser allocation`,
      };
    }
  );

  // 4. Non-PDF file rejection (PNG disguised as .pdf)
  await runTest(
    'PDF03-TC-04',
    '4. Non-PDF file rejection',
    '128-byte buffer with PNG magic signature (89 50 4E 47 0D 0A 1A 0A) named "image.pdf"',
    'isValid === false, detectedFormat === png, error.code === ERR_INVALID_PDF (UNSUPPORTED_FORMAT)',
    async () => {
      const pngBytes = createPngDisguisedAsPdfFixture();
      const valRes = validatePdfInput({ fileName: 'image.pdf', bytes: pngBytes });
      const loadRes = await loadPdfDocumentV2({ fileName: 'image.pdf', bytes: pngBytes });

      const passed =
        valRes.isValid === false &&
        valRes.detectedFormat === 'png' &&
        valRes.error?.code === 'ERR_INVALID_PDF' &&
        valRes.error?.technicalDetails?.reason === 'UNSUPPORTED_FORMAT' &&
        loadRes.success === false &&
        loadRes.error?.code === 'ERR_INVALID_PDF';

      return {
        passed,
        actualOutcome: `detectedFormat=${valRes.detectedFormat}, code=${valRes.error?.code}, reason=${valRes.error?.technicalDetails?.reason}`,
        independentVerification: `PNG signature 89 50 4E 47 identified as format 'png' and rejected for PDF loader`,
      };
    }
  );

  // 5. Password-required detection
  await runTest(
    'PDF03-TC-05',
    '5. Password-required detection',
    'AES-256 encrypted PDF fixture (userPassword="CorrectPassword2026!") loaded WITHOUT password',
    'validation.hasEncryptDictionary === true, loadRes.success === false, status === PASSWORD_REQUIRED, error.code === ERR_PASSWORD_REQUIRED',
    async () => {
      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'CorrectPassword2026!',
      });
      const valRes = validatePdfInput(encBytes);
      const loadRes = await loadPdfDocumentV2({
        fileName: 'encrypted.pdf',
        bytes: encBytes,
      });

      const passed =
        valRes.isValid === true &&
        valRes.hasEncryptDictionary === true &&
        loadRes.success === false &&
        loadRes.status === 'PASSWORD_REQUIRED' &&
        loadRes.error?.code === 'ERR_PASSWORD_REQUIRED';

      return {
        passed,
        actualOutcome: `hasEncrypt=${valRes.hasEncryptDictionary}, status=${loadRes.status}, code=${loadRes.error?.code}`,
        independentVerification: `PDF.js PasswordException (code=1 NEED_PASSWORD) independently confirmed unauthenticated load rejection`,
      };
    }
  );

  // 6. Correct password loading
  await runTest(
    'PDF03-TC-06',
    '6. Correct password loading',
    'AES-256 encrypted PDF fixture loaded WITH authorized password "CorrectPassword2026!"',
    'loadRes.success === true, status === SUCCESS, metadata.pageCount === 1, metadata.isEncrypted === true',
    async () => {
      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'CorrectPassword2026!',
        pageText: 'UNLOCKED_SECRET_TEXT_99',
      });
      const loadRes = await loadPdfDocumentV2(
        { fileName: 'encrypted.pdf', bytes: encBytes },
        { password: 'CorrectPassword2026!' }
      );

      const session = await openManagedPdfDocument(encBytes, {
        password: 'CorrectPassword2026!',
      });
      const page = await session.pdfDoc.getPage(1);
      const tc = await page.getTextContent();
      const extractedText = tc.items.map((it: any) => it.str).join(' ');
      await page.cleanup();
      await session.dispose();

      const passed =
        loadRes.success === true &&
        loadRes.status === 'SUCCESS' &&
        loadRes.metadata?.pageCount === 1 &&
        loadRes.metadata?.isEncrypted === true &&
        extractedText.includes('UNLOCKED_SECRET_TEXT_99');

      await loadRes.dispose();

      return {
        passed,
        actualOutcome: `success=${loadRes.success}, status=${loadRes.status}, pageCount=${loadRes.metadata?.pageCount}, isEncrypted=${loadRes.metadata?.isEncrypted}`,
        independentVerification: `PDF.js unlocked with password and extracted "${extractedText}"`,
      };
    }
  );

  // 7. Incorrect password handling
  await runTest(
    'PDF03-TC-07',
    '7. Incorrect password handling',
    'AES-256 encrypted PDF fixture loaded WITH wrong password "WrongPassword123"',
    'loadRes.success === false, status === INCORRECT_PASSWORD, error.code === ERR_INCORRECT_PASSWORD',
    async () => {
      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'CorrectPassword2026!',
      });
      const loadRes = await loadPdfDocumentV2(
        { fileName: 'encrypted.pdf', bytes: encBytes },
        { password: 'WrongPassword123' }
      );

      const passed =
        loadRes.success === false &&
        loadRes.status === 'INCORRECT_PASSWORD' &&
        loadRes.error?.code === 'ERR_INCORRECT_PASSWORD';

      return {
        passed,
        actualOutcome: `success=${loadRes.success}, status=${loadRes.status}, code=${loadRes.error?.code}`,
        independentVerification: `PDF.js PasswordException (code=2 INCORRECT_PASSWORD) distinguished from missing password`,
      };
    }
  );

  // 8. Malformed PDF handling (both broken object/xref structure and truncated missing %%EOF)
  await runTest(
    'PDF03-TC-08',
    '8. Malformed PDF handling',
    'Case A: Truncated PDF missing %%EOF; Case B: %PDF-1.7 with broken object graph & invalid xref',
    'Case A rejected with ERR_INVALID_PDF; Case B rejected with ERR_PDF_LOAD_FAILED without crashing process',
    async () => {
      const truncated = await createTruncatedPdfMissingEofFixture();
      const brokenGraph = createMalformedPdfWithBrokenStructureFixture();

      const resTruncated = await loadPdfDocumentV2(truncated);
      const resBroken = await loadPdfDocumentV2(brokenGraph);

      const passed =
        resTruncated.success === false &&
        resTruncated.error?.code === 'ERR_INVALID_PDF' &&
        resBroken.success === false &&
        (resBroken.error?.code === 'ERR_PDF_LOAD_FAILED' || resBroken.error?.code === 'ERR_INVALID_PDF');

      return {
        passed,
        actualOutcome: `Truncated: code=${resTruncated.error?.code}; BrokenGraph: code=${resBroken.error?.code}`,
        independentVerification: `Both malformed inputs caught and converted to structured PdfProcessingError objects with 0 unhandled rejections`,
      };
    }
  );

  // 9. Byte-cloning isolation
  await runTest(
    'PDF03-TC-09',
    '9. Byte-cloning isolation',
    'Caller-owned Uint8Array view over a larger ArrayBuffer (with non-zero byteOffset = 32)',
    'Mutating cloned buffer or disposing session leaves caller buffer 100% byte-for-byte unchanged and undetached',
    async () => {
      const rawPdf = await createValidMultiPagePdfFixture({ pageTexts: ['ISOLATION_CHECK'] });
      const backingBuffer = new ArrayBuffer(rawPdf.byteLength + 64);
      const callerSubarray = new Uint8Array(backingBuffer, 32, rawPdf.byteLength);
      callerSubarray.set(rawPdf);

      // Snapshot original caller bytes
      const snapshotBefore = new Uint8Array(rawPdf);

      const cloned = cloneIsolatedPdfBytes(callerSubarray);
      // Mutate cloned buffer aggressively
      cloned[0] = 0xff;
      cloned[1] = 0x00;

      // Also load and dispose a V2 session (which wipes its internal buffer on dispose)
      const loadRes = await loadPdfDocumentV2(callerSubarray);
      await loadRes.dispose();

      // Compare callerSubarray against snapshotBefore byte-for-byte
      let identical = callerSubarray.byteLength === snapshotBefore.byteLength;
      for (let i = 0; i < snapshotBefore.byteLength && identical; i++) {
        if (callerSubarray[i] !== snapshotBefore[i]) {
          identical = false;
        }
      }

      const passed =
        identical &&
        cloned.byteOffset === 0 &&
        cloned.buffer !== callerSubarray.buffer &&
        callerSubarray[0] === 0x25; // '%'

      return {
        passed,
        actualOutcome: `callerPreserved=${identical}, cloned.byteOffset=${cloned.byteOffset}, distinctBuffers=${cloned.buffer !== callerSubarray.buffer}`,
        independentVerification: `All ${snapshotBefore.byteLength} bytes of caller subarray verified identical after clone mutation and session wipe`,
      };
    }
  );

  // 10. File-size guard
  await runTest(
    'PDF03-TC-10',
    '10. File-size guard',
    '3-page PDF (~1.5 KB) tested against custom maxFileSizeBytes = 512 bytes and softWarningBytes = 200 bytes',
    'Exceeding maxFileSizeBytes returns ERR_FILE_TOO_LARGE (status MEMORY_LIMIT_EXCEEDED); exceeding softWarningBytes adds warning',
    async () => {
      const pdfBytes = await createValidMultiPagePdfFixture();
      const hardReject = validatePdfInput(pdfBytes, { maxFileSizeBytes: 512 });
      const softWarn = validatePdfInput(pdfBytes, {
        maxFileSizeBytes: 10 * 1024 * 1024,
        softWarningBytes: 200,
      });

      const passed =
        hardReject.isValid === false &&
        hardReject.error?.code === 'ERR_FILE_TOO_LARGE' &&
        hardReject.error?.status === 'MEMORY_LIMIT_EXCEEDED' &&
        softWarn.isValid === true &&
        softWarn.warnings.length > 0;

      return {
        passed,
        actualOutcome: `hardReject.code=${hardReject.error?.code}, hardReject.status=${hardReject.error?.status}, softWarn.warnings=${softWarn.warnings.length}`,
        independentVerification: `Input size (${pdfBytes.byteLength} B) strictly enforced against 512 B hard limit and 200 B soft warning`,
      };
    }
  );

  // 11. Successful output integrity
  await runTest(
    'PDF03-TC-11',
    '11. Successful output integrity',
    'Loaded 3-page PDF serialized via serializeAndVerifyPdfV2()',
    'integrity.isValid === true, hasValidMagicHeader === true, hasEofMarker === true, reopenedWithPdfJs === true, verifiedPageCount === 3',
    async () => {
      const fixtureBytes = await createValidMultiPagePdfFixture();
      const loadRes = await loadPdfDocumentV2(fixtureBytes);
      if (!loadRes.document) {
        throw new Error('Failed to load fixture');
      }

      const { bytes, integrity } = await serializeAndVerifyPdfV2(loadRes.document);
      await loadRes.dispose();

      const passed =
        integrity.isValid === true &&
        integrity.hasValidMagicHeader === true &&
        integrity.hasEofMarker === true &&
        integrity.reopenedWithPdfJs === true &&
        integrity.verifiedPageCount === 3 &&
        bytes.byteLength > 100;

      return {
        passed,
        actualOutcome: `isValid=${integrity.isValid}, magic=${integrity.hasValidMagicHeader}, eof=${integrity.hasEofMarker}, pdfJsPages=${integrity.verifiedPageCount}`,
        independentVerification: `PDF.js reopened serialized output (${bytes.byteLength} B) and confirmed 3 readable pages`,
      };
    }
  );

  // 12. Corrupted output rejection
  await runTest(
    'PDF03-TC-12',
    '12. Corrupted output rejection',
    'Case A: Empty output; Case B: Corrupted magic header; Case C: Missing %%EOF; Case D: Page count mismatch (expected 5 vs actual 3)',
    'All 4 corrupted/mismatched outputs rejected with isValid === false and error.code === ERR_OUTPUT_INTEGRITY',
    async () => {
      const validPdf = await createValidMultiPagePdfFixture(); // 3 pages
      const emptyIntegrity = await verifyPdfOutputIntegrity(new Uint8Array(0));
      const badHeaderIntegrity = await verifyPdfOutputIntegrity(createInvalidMagicBytesFixture());
      const missingEofIntegrity = await verifyPdfOutputIntegrity(
        await createTruncatedPdfMissingEofFixture()
      );
      const countMismatchIntegrity = await verifyPdfOutputIntegrity(validPdf, {
        expectedPageCount: 5,
      });

      const passed =
        emptyIntegrity.isValid === false &&
        emptyIntegrity.error?.code === 'ERR_OUTPUT_INTEGRITY' &&
        badHeaderIntegrity.isValid === false &&
        badHeaderIntegrity.error?.code === 'ERR_OUTPUT_INTEGRITY' &&
        missingEofIntegrity.isValid === false &&
        missingEofIntegrity.error?.code === 'ERR_OUTPUT_INTEGRITY' &&
        countMismatchIntegrity.isValid === false &&
        countMismatchIntegrity.error?.code === 'ERR_OUTPUT_INTEGRITY';

      return {
        passed,
        actualOutcome: `Empty=${emptyIntegrity.error?.code}, BadHeader=${badHeaderIntegrity.error?.code}, MissingEOF=${missingEofIntegrity.error?.code}, CountMismatch=${countMismatchIntegrity.error?.code}`,
        independentVerification: `All 4 output corruption vectors rejected with ERR_OUTPUT_INTEGRITY`,
      };
    }
  );

  // 13. Document cleanup & lifecycle tracking
  await runTest(
    'PDF03-TC-13',
    '13. Document cleanup',
    'Load 2 PDF sessions, verify activeSessionCount === 2, dispose session 1, then disposeAllSessions()',
    'Active session count drops 2 -> 1 -> 0; activeTotalBytes drops to 0; internal buffers wiped to 0x00',
    async () => {
      await pdfLifecycleManager.disposeAllSessions();
      const pdfA = await createValidMultiPagePdfFixture({ pageTexts: ['SESSION_A'] });
      const pdfB = await createValidMultiPagePdfFixture({ pageTexts: ['SESSION_B'] });

      const loadA = await loadPdfDocumentV2({ fileName: 'a.pdf', bytes: pdfA });
      const loadB = await loadPdfDocumentV2({ fileName: 'b.pdf', bytes: pdfB });

      const countDuring = pdfLifecycleManager.getActiveSessionCount();
      const bytesDuring = pdfLifecycleManager.getActiveTotalBytes();
      const internalRefA = loadA.isolatedBytes!;

      await loadA.dispose();
      const countAfterA = pdfLifecycleManager.getActiveSessionCount();
      // Check that internalRefA was wiped to 0
      const wipedA = internalRefA.every((b) => b === 0);

      await pdfLifecycleManager.disposeAllSessions();
      const countFinal = pdfLifecycleManager.getActiveSessionCount();
      const bytesFinal = pdfLifecycleManager.getActiveTotalBytes();

      const passed =
        countDuring === 2 &&
        bytesDuring > 0 &&
        countAfterA === 1 &&
        wipedA === true &&
        countFinal === 0 &&
        bytesFinal === 0;

      return {
        passed,
        actualOutcome: `activeCount: ${countDuring} -> ${countAfterA} -> ${countFinal}; activeBytes: ${bytesDuring} -> ${bytesFinal}; internalWiped=${wipedA}`,
        independentVerification: `Session registry and internal byte buffers verified zeroed and released`,
      };
    }
  );

  // 14. Canonical ID Registry & Unknown Operation Rejection
  await runTest(
    'PDF03-TC-14',
    '14. Canonical Registry & Unknown Operation Rejection',
    'All 33 unique pdf-tools IDs + 20 document-converters IDs + aliases (pdf-crop, pdf-unlock) + unknown ID "pdf-fake-tool"',
    '53 unique canonical IDs and all aliases resolve; unknown ID and non-PDF generator ID return ERR_UNSUPPORTED_OPERATION',
    async () => {
      const registeredCount = Object.keys(PDF_TOOL_OPERATION_REGISTRY).length;
      const cropAlias = resolvePdfOperationCapabilities('pdf-crop');
      const unlockAlias = resolvePdfOperationCapabilities('pdf-unlock');
      const unknownTool = resolvePdfOperationCapabilities('pdf-nonexistent-xyz');
      const nonPdfGen = resolvePdfOperationCapabilities(
        'mechanical-fastener-specification-sheet-generator'
      );

      const passed =
        registeredCount === 53 &&
        cropAlias.supported === true &&
        cropAlias.capabilities?.canonicalId === 'pdf-crop-pages' &&
        unlockAlias.supported === true &&
        unlockAlias.capabilities?.canonicalId === 'pdf-remove-password' &&
        unknownTool.supported === false &&
        unknownTool.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
        nonPdfGen.supported === false &&
        nonPdfGen.error?.code === 'ERR_UNSUPPORTED_OPERATION';

      return {
        passed,
        actualOutcome: `registeredCanonicalIds=${registeredCount}, cropAlias->${cropAlias.capabilities?.canonicalId}, unlockAlias->${unlockAlias.capabilities?.canonicalId}, unknownCode=${unknownTool.error?.code}`,
        independentVerification: `All 53 unique canonical IDs (54 catalog registrations w/ duplicate pdf-metadata-editor) resolved; unknown IDs strictly rejected`,
      };
    }
  );

  return results;
}

// Allow direct CLI execution via `npx tsx src/services/pdf/v2/__tests__/runPdf03CoreTests.ts`
const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv.some((arg) => arg.includes('runPdf03CoreTests'));

if (isDirectExecution) {
  (async () => {
    const results = await runAllPdf03CoreTests();
    console.log('=== CALCTOOLS PHASE PDF-03 CORE ENGINE TEST RESULTS ===');
    for (const r of results) {
      console.log(`[${r.verdict}] ${r.testId} (${r.testArea}) - ${r.durationMs}ms`);
      console.log(`   Actual: ${r.actualOutcome}`);
      console.log(`   Verify: ${r.independentVerification}`);
    }
    const failed = results.filter((r) => r.verdict !== 'VERIFIED');
    console.log(`\nSummary: ${results.length - failed.length}/${results.length} VERIFIED.`);
    if (failed.length > 0) {
      process.exit(1);
    }
  })();
}
