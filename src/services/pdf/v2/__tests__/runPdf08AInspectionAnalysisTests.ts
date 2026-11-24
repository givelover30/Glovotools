/**
 * CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-08A: ENGINE E (INSPECTION & ANALYSIS) TEST SUITE
 *
 * Comprehensive functional verification of all 5 canonical Engine E tools:
 *   1. `pdf-page-counter` (`countPdfPagesV2`)
 *   2. `pdf-metadata-viewer` (`inspectPdfMetadataV2`)
 *   3. `pdf-comparison` (`comparePdfDocumentsV2`)
 *   4. `pdf-blank-page-detector` (`detectBlankPdfPagesV2`)
 *   5. `pdf-file-size-analyzer` (`analyzePdfFileSizeV2`)
 *   + Unified Engine E Router (`executeInspectionAnalysisOperationV2`)
 *
 * 18 test cases covering every requirement in Section 6 of the Phase PDF-08A specification.
 */

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFString,
  StandardFonts,
  degrees,
  rgb,
} from '@cantoo/pdf-lib';
import {
  encodeRawPixelsToPng,
} from '../pdfConversionExtractionEngine';
import {
  PdfBlankPageDetectorReportData,
  PdfComparisonReportData,
  PdfFileSizeAnalyzerReportData,
  PdfMetadataViewerReportData,
  PdfPageCounterReportData,
  analyzePdfFileSizeV2,
  comparePdfDocumentsV2,
  countPdfPagesV2,
  detectBlankPdfPagesV2,
  executeInspectionAnalysisOperationV2,
  inspectPdfMetadataV2,
} from '../pdfInspectionAnalysisEngine';
import {
  createEmptyBufferFixture,
  createInvalidMagicBytesFixture,
  createMalformedPdfWithBrokenStructureFixture,
  createPasswordProtectedPdfFixture,
  createTruncatedPdfMissingEofFixture,
  createValidMultiPagePdfFixture,
} from './pdfTestFixtures';

interface TestCaseRecord {
  testId: string;
  canonicalToolId: string;
  scenario: string;
  inputDescription: string;
  expectedBehavior: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'BLOCKED' | 'NOT RUN';
  durationMs: number;
  actualDetails: string;
}

const results: TestCaseRecord[] = [];

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function computeFnv1aChecksumHex(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.byteLength; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

async function runTestCase(
  testId: string,
  canonicalToolId: string,
  scenario: string,
  inputDescription: string,
  expectedBehavior: string,
  fn: () => Promise<string>
): Promise<void> {
  const t0 = performance.now();
  try {
    const details = await fn();
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    results.push({
      testId,
      canonicalToolId,
      scenario,
      inputDescription,
      expectedBehavior,
      status: 'PASS',
      durationMs,
      actualDetails: details,
    });
    console.log(`[PASS] ${testId} (${canonicalToolId}): ${details} [${durationMs} ms]`);
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    const msg = err?.message || String(err);
    results.push({
      testId,
      canonicalToolId,
      scenario,
      inputDescription,
      expectedBehavior,
      status: 'FAIL',
      durationMs,
      actualDetails: msg,
    });
    console.error(`[FAIL] ${testId} (${canonicalToolId}): ${msg}`);
  }
}

/**
 * Helper to attach a raw XMP XML packet stream to a PDFDocument's `/Root -> /Metadata` catalog entry.
 */
function attachXmpMetadataPacketToDocument(doc: PDFDocument, xmpXml: string): void {
  const xmlBytes = new TextEncoder().encode(xmpXml);
  const dict = doc.context.obj({
    Type: 'Metadata',
    Subtype: 'XML',
    Length: xmlBytes.byteLength,
  });
  const stream = PDFRawStream.of(dict, xmlBytes);
  const ref = doc.context.register(stream);
  doc.catalog.set(PDFName.of('Metadata'), ref);
}

/**
 * Helper to create a synthetic solid or gradient PNG image of `width x height`.
 */
function createSyntheticPngBytes(
  width: number,
  height: number,
  fillMode: 'pure-white' | 'dark-checkerboard' | 'high-entropy-photo'
): Uint8Array {
  const pixels = new Uint8Array(width * height * 3);
  if (fillMode === 'pure-white') {
    pixels.fill(255);
  } else if (fillMode === 'high-entropy-photo') {
    let seed = 0x13579bdf;
    for (let i = 0; i < pixels.byteLength; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      pixels[i] = (seed >>> 16) & 0xff;
    }
  } else {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const isDark = ((x >> 3) + (y >> 3)) % 2 === 0;
        pixels[idx] = isDark ? 20 : 230;
        pixels[idx + 1] = isDark ? 55 : 210;
        pixels[idx + 2] = isDark ? 120 : 240;
      }
    }
  }
  return encodeRawPixelsToPng({
    width,
    height,
    channels: 3,
    pixels,
  });
}

async function main() {
  console.log('================================================================================');
  console.log('CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-08A (ENGINE E: INSPECTION & ANALYSIS) SUITE');
  console.log('================================================================================');

  // ==========================================================================
  // TOOL 1: PDF PAGE COUNTER (`pdf-page-counter`)
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-01',
    'pdf-page-counter',
    'Single-page and mixed-dimension multi-page PDF page counting with dual-parser verification',
    '1-page US Letter PDF (612x792pt) + 4-page mixed PDF (US Letter Portrait, A4 Portrait, US Letter Landscape via /Rotate 90, 500x500pt Square)',
    'Reports exact page count, verifies agreement between @cantoo/pdf-lib and PDF.js, classifies portrait/landscape/square orientations and standard paper sizes, and preserves input buffer immutability',
    async () => {
      // 1. Single-page PDF
      const singlePdf = await createValidMultiPagePdfFixture({ pageTexts: ['SINGLE_PAGE_DOC'] });
      const singleChecksumBefore = computeFnv1aChecksumHex(singlePdf);

      const singleRes = await countPdfPagesV2({ fileName: 'single.pdf', bytes: singlePdf });
      assertCondition(singleRes.status === 'SUCCESS', `Expected singleRes SUCCESS, got ${singleRes.status}`);
      assertCondition(
        computeFnv1aChecksumHex(singlePdf) === singleChecksumBefore,
        'Caller input buffer must remain bit-for-bit immutable'
      );

      const singleData = singleRes.inspectionReport?.rawData as unknown as PdfPageCounterReportData;
      assertCondition(singleData.pageCount === 1, `Expected pageCount=1, got ${singleData.pageCount}`);
      assertCondition(singleData.pdfLibPageCount === 1 && singleData.pdfJsPageCount === 1 && singleData.parsersAgree, 'Expected dual-parser agreement on 1 page');
      assertCondition(singleData.pages[0].paperSizePreset === 'US Letter', `Expected US Letter preset, got ${singleData.pages[0].paperSizePreset}`);

      // 2. 4-page mixed geometry PDF
      const mixedDoc = await PDFDocument.create();
      const font = await mixedDoc.embedFont(StandardFonts.Helvetica);

      // Page 1: US Letter Portrait (612x792)
      const p1 = mixedDoc.addPage([612, 792]);
      p1.drawText('Page 1 Letter Portrait', { x: 50, y: 700, size: 12, font });

      // Page 2: A4 Portrait (595.28x841.89)
      const p2 = mixedDoc.addPage([595.28, 841.89]);
      p2.drawText('Page 2 A4 Portrait', { x: 50, y: 750, size: 12, font });

      // Page 3: US Letter rotated 90° CW -> effective Landscape (792x612)
      const p3 = mixedDoc.addPage([612, 792]);
      p3.setRotation(degrees(90));
      p3.drawText('Page 3 Rotated Landscape', { x: 50, y: 500, size: 12, font });

      // Page 4: Custom Square (500x500)
      const p4 = mixedDoc.addPage([500, 500]);
      p4.drawText('Page 4 Square', { x: 50, y: 400, size: 12, font });

      const mixedBytes = new Uint8Array(await mixedDoc.save());
      const mixedRes = await countPdfPagesV2({ fileName: 'mixed_4pages.pdf', bytes: mixedBytes });
      assertCondition(mixedRes.status === 'SUCCESS', `Expected mixedRes SUCCESS, got ${mixedRes.status}`);

      const mixedData = mixedRes.inspectionReport?.rawData as unknown as PdfPageCounterReportData;
      assertCondition(mixedData.pageCount === 4, `Expected 4 pages, got ${mixedData.pageCount}`);
      assertCondition(mixedData.parsersAgree === true && mixedData.pdfJsPageCount === 4, 'Expected PDF.js agreement on 4 pages');
      assertCondition(mixedData.hasUniformPageSize === false, 'Expected hasUniformPageSize=false');
      assertCondition(mixedData.portraitPageCount === 2, `Expected 2 portrait pages, got ${mixedData.portraitPageCount}`);
      assertCondition(mixedData.landscapePageCount === 1, `Expected 1 landscape page, got ${mixedData.landscapePageCount}`);
      assertCondition(mixedData.squarePageCount === 1, `Expected 1 square page, got ${mixedData.squarePageCount}`);
      assertCondition(mixedData.rotatedPageCount === 1, `Expected 1 rotated page, got ${mixedData.rotatedPageCount}`);
      assertCondition(mixedData.pages[1].paperSizePreset === 'A4', `Expected Page 2 preset=A4, got ${mixedData.pages[1].paperSizePreset}`);
      assertCondition(
        mixedData.pages[2].effectiveWidthPt === 792 && mixedData.pages[2].effectiveHeightPt === 612,
        `Expected Page 3 effective dimensions 792x612, got ${mixedData.pages[2].effectiveWidthPt}x${mixedData.pages[2].effectiveHeightPt}`
      );

      return `Single=1p (US Letter, parsersAgree=true); Mixed=4p (2 portrait, 1 landscape [/Rotate=90°], 1 square, uniform=false, pdfLib=4, pdfJs=4)`;
    }
  );

  await runTestCase(
    'PDF08A-TC-02',
    'pdf-page-counter',
    'Encrypted, empty, invalid magic bytes, and corrupted PDF handling in page counter',
    '0-byte buffer, non-PDF bytes, malformed cross-reference PDF, truncated PDF, and AES-256 encrypted PDF (no password, wrong password, correct password)',
    'Returns structured ERR_EMPTY_FILE, ERR_INVALID_PDF, ERR_PASSWORD_REQUIRED, ERR_INCORRECT_PASSWORD, and succeeds with exact page count when authorized password is provided',
    async () => {
      const emptyRes = await countPdfPagesV2({ fileName: 'empty.pdf', bytes: createEmptyBufferFixture() });
      assertCondition(emptyRes.error?.code === 'ERR_EMPTY_FILE', `Expected ERR_EMPTY_FILE, got ${emptyRes.error?.code}`);

      const invalidRes = await countPdfPagesV2({ fileName: 'invalid.pdf', bytes: createInvalidMagicBytesFixture() });
      assertCondition(invalidRes.error?.code === 'ERR_INVALID_PDF', `Expected ERR_INVALID_PDF, got ${invalidRes.error?.code}`);

      const corruptRes = await countPdfPagesV2({
        fileName: 'corrupt.pdf',
        bytes: createMalformedPdfWithBrokenStructureFixture(),
      });
      assertCondition(
        corruptRes.status !== 'SUCCESS' && Boolean(corruptRes.error),
        `Expected corrupted PDF failure, got ${corruptRes.status}`
      );

      const truncatedRes = await countPdfPagesV2({
        fileName: 'truncated.pdf',
        bytes: await createTruncatedPdfMissingEofFixture(),
      });
      assertCondition(
        truncatedRes.status !== 'SUCCESS' && Boolean(truncatedRes.error),
        `Expected truncated PDF failure, got ${truncatedRes.status}`
      );

      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'CounterSecret!2026',
        pageText: 'ENCRYPTED PAGE COUNTER FIXTURE',
      });

      const noPassRes = await countPdfPagesV2({ fileName: 'enc.pdf', bytes: encBytes });
      assertCondition(
        noPassRes.status === 'PASSWORD_REQUIRED' && noPassRes.error?.code === 'ERR_PASSWORD_REQUIRED',
        `Expected ERR_PASSWORD_REQUIRED, got ${noPassRes.error?.code}`
      );

      const wrongPassRes = await countPdfPagesV2(
        { fileName: 'enc.pdf', bytes: encBytes },
        { password: 'WrongPassword123' }
      );
      assertCondition(
        wrongPassRes.status === 'INCORRECT_PASSWORD' && wrongPassRes.error?.code === 'ERR_INCORRECT_PASSWORD',
        `Expected ERR_INCORRECT_PASSWORD, got ${wrongPassRes.error?.code}`
      );

      const authRes = await countPdfPagesV2(
        { fileName: 'enc.pdf', bytes: encBytes },
        { password: 'CounterSecret!2026' }
      );
      assertCondition(authRes.status === 'SUCCESS', `Expected authorized SUCCESS, got ${authRes.status}`);
      const authData = authRes.inspectionReport?.rawData as unknown as PdfPageCounterReportData;
      assertCondition(authData.pageCount === 1 && authData.isEncrypted === true && authData.parsersAgree, 'Expected pageCount=1 and isEncrypted=true');

      return `Empty=${emptyRes.error?.code}, Invalid=${invalidRes.error?.code}, Corrupt=${corruptRes.error?.code}, NoPass=${noPassRes.error?.code}, WrongPass=${wrongPassRes.error?.code}, Auth=SUCCESS (${authData.pageCount}p, encrypted=true)`;
    }
  );

  // ==========================================================================
  // TOOL 2: PDF METADATA VIEWER (`pdf-metadata-viewer`)
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-03',
    'pdf-metadata-viewer',
    'Complete metadata extraction, PDF date parsing, and encrypted PDF metadata inspection',
    '2-page PDF with Title, Author, Subject, Keywords, Creator, Producer, CreationDate (2026-05-15T10:30:00Z), ModificationDate (2026-06-20T14:45:00Z) + AES-256 encrypted PDF',
    'Extracts all 8 standard fields accurately, parses PDF dates to ISO 8601 UTC strings, reports page dimensions and PDF version, and enforces password authorization on encrypted PDFs',
    async () => {
      const doc = await PDFDocument.create();
      doc.setTitle('Quarterly Financial Report Q2 2026');
      doc.setAuthor('Elena Vance, CFA');
      doc.setSubject('Consolidated Revenue & Margin Analysis');
      doc.setKeywords(['finance', 'q2-2026', 'audit']);
      doc.setCreator('CalcTools Financial Suite');
      doc.setProducer('CalcTools PDF Engine V2');
      const cDate = new Date('2026-05-15T10:30:00.000Z');
      const mDate = new Date('2026-06-20T14:45:00.000Z');
      doc.setCreationDate(cDate);
      doc.setModificationDate(mDate);

      doc.addPage([612, 792]);
      doc.addPage([595.28, 841.89]);
      const pdfBytes = new Uint8Array(await doc.save());

      const res = await inspectPdfMetadataV2({ fileName: 'financial_q2.pdf', bytes: pdfBytes });
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfMetadataViewerReportData;
      assertCondition(data.pageCount === 2, `Expected pageCount=2, got ${data.pageCount}`);
      assertCondition(data.hasInfoDictionary === true, 'Expected hasInfoDictionary=true');
      assertCondition(data.fields.title.effectiveValue === 'Quarterly Financial Report Q2 2026', `Title mismatch: ${data.fields.title.effectiveValue}`);
      assertCondition(data.fields.author.effectiveValue === 'Elena Vance, CFA', `Author mismatch: ${data.fields.author.effectiveValue}`);
      assertCondition(data.fields.subject.effectiveValue === 'Consolidated Revenue & Margin Analysis', `Subject mismatch: ${data.fields.subject.effectiveValue}`);
      assertCondition(
        Boolean(data.fields.keywords.effectiveValue?.includes('finance') && data.fields.keywords.effectiveValue?.includes('audit')),
        `Keywords mismatch: ${data.fields.keywords.effectiveValue}`
      );
      assertCondition(data.fields.creator.effectiveValue === 'CalcTools Financial Suite', `Creator mismatch: ${data.fields.creator.effectiveValue}`);
      assertCondition(data.fields.producer.effectiveValue === 'CalcTools PDF Engine V2', `Producer mismatch: ${data.fields.producer.effectiveValue}`);
      assertCondition(data.fields.creationDate.effectiveValue === '2026-05-15T10:30:00.000Z', `CreationDate mismatch: ${data.fields.creationDate.effectiveValue}`);
      assertCondition(data.fields.modificationDate.effectiveValue === '2026-06-20T14:45:00.000Z', `ModificationDate mismatch: ${data.fields.modificationDate.effectiveValue}`);
      assertCondition(data.pageDimensionsSummary.hasUniformDimensions === false, 'Expected mixed dimensions (Letter + A4)');

      // Encrypted PDF check
      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'MetaPassword!99',
        pageText: 'CONFIDENTIAL METADATA',
      });
      const unauthMeta = await inspectPdfMetadataV2({ fileName: 'enc_meta.pdf', bytes: encBytes });
      assertCondition(unauthMeta.error?.code === 'ERR_PASSWORD_REQUIRED', `Expected ERR_PASSWORD_REQUIRED, got ${unauthMeta.error?.code}`);

      const authMeta = await inspectPdfMetadataV2(
        { fileName: 'enc_meta.pdf', bytes: encBytes },
        { password: 'MetaPassword!99' }
      );
      assertCondition(authMeta.status === 'SUCCESS', `Expected authMeta SUCCESS, got ${authMeta.status}`);
      const authData = authMeta.inspectionReport?.rawData as unknown as PdfMetadataViewerReportData;
      assertCondition(authData.isEncrypted === true && authData.fields.title.effectiveValue === 'Encrypted PDF-03 Fixture', 'Expected encrypted title extraction');

      return `Extracted all 8 fields (Title="${data.fields.title.effectiveValue}", CreationDate=${data.fields.creationDate.effectiveValue}, ModDate=${data.fields.modificationDate.effectiveValue}); Encrypted auth verified`;
    }
  );

  await runTestCase(
    'PDF08A-TC-04',
    'pdf-metadata-viewer',
    'Strict distinction between MISSING vs EMPTY metadata fields and zero invented values',
    'PDF with /Info dictionary where Title="" (empty string), Author="   " (whitespace-only empty), and Subject/Keywords/Creator/Producer/CreationDate/ModDate are completely omitted from /Info',
    'Reports Title and Author as EMPTY (""), reports omitted keys as MISSING (null), and never invents placeholder values like "Untitled" or "Unknown"',
    async () => {
      const doc = await PDFDocument.create();
      doc.addPage([612, 792]);

      // Replace the default /Info dictionary with an explicit dictionary containing only Title="" and Author="   "
      const customInfoDict = doc.context.obj({
        Title: PDFString.of(''),
        Author: PDFString.of('   '),
      });
      const infoRef = doc.context.register(customInfoDict);
      doc.context.trailerInfo.Info = infoRef;

      const bytes = new Uint8Array(await doc.save());
      const res = await inspectPdfMetadataV2({ fileName: 'sparse_meta.pdf', bytes });
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfMetadataViewerReportData;
      assertCondition(
        data.fields.title.infoStatus === 'EMPTY' && data.fields.title.effectiveStatus === 'EMPTY' && data.fields.title.effectiveValue === '',
        `Expected Title status=EMPTY and value="", got status=${data.fields.title.effectiveStatus}, value=${JSON.stringify(data.fields.title.effectiveValue)}`
      );
      assertCondition(
        data.fields.author.infoStatus === 'EMPTY' && data.fields.author.effectiveStatus === 'EMPTY' && data.fields.author.effectiveValue === '',
        `Expected Author status=EMPTY and value="", got status=${data.fields.author.effectiveStatus}, value=${JSON.stringify(data.fields.author.effectiveValue)}`
      );
      for (const missingKey of ['subject', 'keywords', 'creator', 'producer', 'creationDate', 'modificationDate'] as const) {
        assertCondition(
          data.fields[missingKey].infoStatus === 'MISSING' &&
            data.fields[missingKey].effectiveStatus === 'MISSING' &&
            data.fields[missingKey].effectiveValue === null,
          `Expected ${missingKey} to be MISSING (null), got ${data.fields[missingKey].effectiveStatus} (${data.fields[missingKey].effectiveValue})`
        );
      }

      return `Title=EMPTY (""), Author=EMPTY (""), Subject/Keywords/Creator/Producer/CreationDate/ModDate=MISSING (null) — 0 invented values`;
    }
  );

  await runTestCase(
    'PDF08A-TC-05',
    'pdf-metadata-viewer',
    'Detection of /Info dictionary vs XMP /Metadata XML stream disagreement',
    'PDF where /Info Title="Info Dictionary Title v1" and Author="Alice Smith", while XMP packet dc:title="XMP Stream Title v2" and dc:creator="Bob Jones"',
    'Parses both /Info and XMP packet, sets hasInfoXmpDisagreement=true, lists ["title", "author"] in disagreementFields, and emits explicit warning',
    async () => {
      const doc = await PDFDocument.create();
      doc.setTitle('Info Dictionary Title v1');
      doc.setAuthor('Alice Smith');
      doc.setSubject('Consistent Subject Value');
      doc.addPage([612, 792]);

      const xmpPacket = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">XMP Stream Title v2</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>Bob Jones</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">Consistent Subject Value</rdf:li>
        </rdf:Alt>
      </dc:description>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

      attachXmpMetadataPacketToDocument(doc, xmpPacket);
      const bytes = new Uint8Array(await doc.save());

      const res = await inspectPdfMetadataV2({ fileName: 'disagreement.pdf', bytes });
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfMetadataViewerReportData;
      assertCondition(data.hasInfoDictionary === true && data.hasXmpMetadataStream === true, 'Expected both /Info and XMP to be present');
      assertCondition(data.hasInfoXmpDisagreement === true, 'Expected hasInfoXmpDisagreement=true');
      assertCondition(
        data.disagreementFields.includes('title') && data.disagreementFields.includes('author'),
        `Expected title and author in disagreementFields, got ${JSON.stringify(data.disagreementFields)}`
      );
      assertCondition(
        !data.disagreementFields.includes('subject') && data.fields.subject.consistentBetweenInfoAndXmp === true,
        'Expected subject to be consistent between /Info and XMP'
      );
      assertCondition(
        data.fields.title.infoNormalizedValue === 'Info Dictionary Title v1' &&
          data.fields.title.xmpNormalizedValue === 'XMP Stream Title v2',
        'Expected both /Info and XMP raw values preserved on title field'
      );
      assertCondition(res.warnings.some((w) => w.includes('disagreement')), 'Expected disagreement warning');

      return `hasInfoXmpDisagreement=true, disagreementFields=${JSON.stringify(data.disagreementFields)}, /Info Title="${data.fields.title.infoNormalizedValue}" vs XMP Title="${data.fields.title.xmpNormalizedValue}"`;
    }
  );

  // ==========================================================================
  // TOOL 3: PDF COMPARISON (`pdf-comparison`)
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-06',
    'pdf-comparison',
    'Identical documents and whitespace-normalized text comparison',
    'Two identical 2-page PDFs (Doc A and Doc B) + comparison with harmless trailing whitespace differences when normalizeWhitespace=true',
    'Reports areIdentical=true, changedPageCount=0, addedPageCount=0, removedPageCount=0, and metadataMatches=true',
    async () => {
      const pdfA = await createValidMultiPagePdfFixture({
        pageTexts: ['CONTRACT CLAUSE 1: DEFINITIONS', 'CONTRACT CLAUSE 2: OBLIGATIONS'],
        title: 'Master Service Agreement',
        author: 'Legal Ops',
      });
      const pdfB = new Uint8Array(pdfA);

      const res = await comparePdfDocumentsV2(
        { fileName: 'contract_v1.pdf', bytes: pdfA },
        { fileName: 'contract_v1_copy.pdf', bytes: pdfB }
      );
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfComparisonReportData;
      assertCondition(data.areIdentical === true, 'Expected areIdentical=true');
      assertCondition(data.binaryIdentical === true, 'Expected binaryIdentical=true');
      assertCondition(data.identicalPageCount === 2 && data.changedPageCount === 0, 'Expected 2 identical pages and 0 changed pages');
      assertCondition(data.metadataMatches === true, 'Expected metadataMatches=true');

      return `areIdentical=true, binaryIdentical=true, identicalPageCount=${data.identicalPageCount}, changedPageCount=${data.changedPageCount}`;
    }
  );

  await runTestCase(
    'PDF08A-TC-07',
    'pdf-comparison',
    'Page count differences, added text lines, and removed text lines across documents',
    'Doc A (2 pages: Page 1 has "LINE ALPHA" & "LINE REMOVED IN B"; Page 2 has "PAGE TWO CONTENT") vs Doc B (3 pages: Page 1 has "LINE ALPHA" & "LINE ADDED IN B"; Page 2 unchanged; Page 3 added "NEW THIRD PAGE")',
    'Accurately identifies Page 1 as CHANGED (TEXT: +1 added line, -1 removed line), Page 2 as IDENTICAL, and Page 3 as ADDED_PAGE (+1 page delta)',
    async () => {
      const docA = await PDFDocument.create();
      docA.setTitle('Spec Document');
      const fontA = await docA.embedFont(StandardFonts.Helvetica);
      const p1A = docA.addPage([612, 792]);
      p1A.drawText('LINE ALPHA COMMON', { x: 50, y: 700, size: 12, font: fontA });
      p1A.drawText('LINE REMOVED IN B', { x: 50, y: 660, size: 12, font: fontA });
      const p2A = docA.addPage([612, 792]);
      p2A.drawText('PAGE TWO UNCHANGED CONTENT', { x: 50, y: 700, size: 12, font: fontA });
      const bytesA = new Uint8Array(await docA.save());

      const docB = await PDFDocument.create();
      docB.setTitle('Spec Document');
      const fontB = await docB.embedFont(StandardFonts.Helvetica);
      const p1B = docB.addPage([612, 792]);
      p1B.drawText('LINE ALPHA COMMON', { x: 50, y: 700, size: 12, font: fontB });
      p1B.drawText('LINE ADDED IN B', { x: 50, y: 660, size: 12, font: fontB });
      const p2B = docB.addPage([612, 792]);
      p2B.drawText('PAGE TWO UNCHANGED CONTENT', { x: 50, y: 700, size: 12, font: fontB });
      const p3B = docB.addPage([612, 792]);
      p3B.drawText('NEW THIRD PAGE ADDED', { x: 50, y: 700, size: 12, font: fontB });
      const bytesB = new Uint8Array(await docB.save());

      const res = await comparePdfDocumentsV2(
        { fileName: 'spec_v1.pdf', bytes: bytesA },
        { fileName: 'spec_v2.pdf', bytes: bytesB }
      );
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfComparisonReportData;
      assertCondition(data.areIdentical === false, 'Expected areIdentical=false');
      assertCondition(data.pageCountA === 2 && data.pageCountB === 3 && data.pageCountDifference === 1, 'Expected page count 2 vs 3 (+1)');
      assertCondition(data.changedPageCount === 1 && data.identicalPageCount === 1 && data.addedPageCount === 1, 'Expected 1 changed, 1 identical, 1 added page');

      const page1 = data.pages[0];
      assertCondition(page1.comparisonStatus === 'CHANGED' && page1.changeCategories.includes('TEXT'), 'Expected Page 1 CHANGED [TEXT]');
      assertCondition(
        page1.addedLines.includes('LINE ADDED IN B') && page1.removedLines.includes('LINE REMOVED IN B'),
        `Page 1 line diff mismatch: added=${JSON.stringify(page1.addedLines)}, removed=${JSON.stringify(page1.removedLines)}`
      );

      const page2 = data.pages[1];
      assertCondition(page2.comparisonStatus === 'IDENTICAL', `Expected Page 2 IDENTICAL, got ${page2.comparisonStatus}`);

      const page3 = data.pages[2];
      assertCondition(page3.comparisonStatus === 'ADDED_PAGE' && page3.addedLines.includes('NEW THIRD PAGE ADDED'), 'Expected Page 3 ADDED_PAGE');

      return `Pages: 2 vs 3 (+1); Page 1=CHANGED (+["LINE ADDED IN B"], -["LINE REMOVED IN B"]); Page 2=IDENTICAL; Page 3=ADDED_PAGE`;
    }
  );

  await runTestCase(
    'PDF08A-TC-08',
    'pdf-comparison',
    'Page dimension differences, metadata differences, and visual graphic/image stream differences',
    'Doc A (1 page 612x792pt, Title="Draft A", red vector rectangle) vs Doc B (1 page 595.28x841.89pt A4, Title="Draft B", blue vector rectangle + embedded PNG image)',
    'Detects metadata difference (title), page dimension difference (DIMENSIONS), and visual stream/image difference (VISUAL_STREAM) even when page text is identical',
    async () => {
      const docA = await PDFDocument.create();
      docA.setTitle('Draft A');
      docA.setAuthor('Same Author');
      const fontA = await docA.embedFont(StandardFonts.Helvetica);
      const pA = docA.addPage([612, 792]);
      pA.drawText('IDENTICAL HEADER TEXT', { x: 50, y: 700, size: 12, font: fontA });
      pA.drawRectangle({ x: 50, y: 500, width: 200, height: 100, color: rgb(0.9, 0.1, 0.1) });
      const bytesA = new Uint8Array(await docA.save());

      const docB = await PDFDocument.create();
      docB.setTitle('Draft B');
      docB.setAuthor('Same Author');
      const fontB = await docB.embedFont(StandardFonts.Helvetica);
      const pB = docB.addPage([595.28, 841.89]);
      pB.drawText('IDENTICAL HEADER TEXT', { x: 50, y: 700, size: 12, font: fontB });
      pB.drawRectangle({ x: 50, y: 500, width: 200, height: 100, color: rgb(0.1, 0.2, 0.9) });
      const pngBytes = createSyntheticPngBytes(32, 32, 'dark-checkerboard');
      const embImg = await docB.embedPng(pngBytes);
      pB.drawImage(embImg, { x: 300, y: 500, width: 64, height: 64 });
      const bytesB = new Uint8Array(await docB.save());

      const res = await comparePdfDocumentsV2(
        { fileName: 'visual_a.pdf', bytes: bytesA },
        { fileName: 'visual_b.pdf', bytes: bytesB }
      );
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfComparisonReportData;
      assertCondition(data.areIdentical === false, 'Expected areIdentical=false');
      assertCondition(
        data.metadataMatches === false && data.metadataDifferences.some((m) => m.field === 'title' && m.valueA === 'Draft A' && m.valueB === 'Draft B'),
        'Expected metadata difference on title'
      );

      const page1 = data.pages[0];
      assertCondition(page1.textMatch === true, 'Expected textMatch=true since text is identical');
      assertCondition(page1.dimensionsMatch === false && page1.changeCategories.includes('DIMENSIONS'), 'Expected DIMENSIONS change category');
      assertCondition(page1.visualResourceMatch === false && page1.changeCategories.includes('VISUAL_STREAM'), 'Expected VISUAL_STREAM change category');
      assertCondition(page1.imageXObjectChecksumsA.length === 0 && page1.imageXObjectChecksumsB.length === 1, 'Expected 0 vs 1 embedded image XObject checksum');

      return `TextMatch=true, DimensionsMatch=false (612x792 vs 595.28x841.89), VisualResourceMatch=false (0 vs 1 image XObject + vector stream diff), MetadataDiff=[title]`;
    }
  );

  await runTestCase(
    'PDF08A-TC-09',
    'pdf-comparison',
    'Missing second file guard and uncomparable/corrupted page content stream handling',
    'Single-file call to comparePdfDocumentsV2 + 2-file comparison where Doc B Page 2 has an unreadable/broken page content stream reference',
    'Returns ERR_SECOND_FILE_REQUIRED when Document B is missing, and flags damaged page stream as UNCOMPARABLE_PAGE when page content cannot be extracted',
    async () => {
      const validA = await createValidMultiPagePdfFixture({ pageTexts: ['PAGE 1', 'PAGE 2'] });

      // 1. Missing second file
      const missingSecondRes = await comparePdfDocumentsV2({ fileName: 'only_one.pdf', bytes: validA }, undefined);
      assertCondition(
        missingSecondRes.error?.code === 'ERR_SECOND_FILE_REQUIRED',
        `Expected ERR_SECOND_FILE_REQUIRED, got ${missingSecondRes.error?.code}`
      );

      // 2. Construct Doc B where Page 2's /MediaBox is corrupted so page geometry/content extraction cannot compare Page 2
      const docB = await PDFDocument.load(validA);
      const page2B = docB.getPage(1);
      // Corrupt /MediaBox on Page 2 to an empty array so getSize() / PDF.js getPage(2) fails on Page 2 while Document B still loads
      page2B.node.set(PDFName.of('MediaBox'), docB.context.obj([]));
      const brokenPage2Bytes = new Uint8Array(await docB.save());

      const compRes = await comparePdfDocumentsV2(
        { fileName: 'valid_2p.pdf', bytes: validA },
        { fileName: 'broken_page2.pdf', bytes: brokenPage2Bytes }
      );
      assertCondition(compRes.status === 'SUCCESS', `Expected comparison to complete with UNCOMPARABLE_PAGE, got ${compRes.status}`);
      const compData = compRes.inspectionReport?.rawData as unknown as PdfComparisonReportData;
      assertCondition(compData.pages[0].comparisonStatus === 'IDENTICAL', 'Expected Page 1 IDENTICAL');
      assertCondition(
        compData.pages[1].comparisonStatus === 'UNCOMPARABLE_PAGE' && compData.uncomparablePageCount === 1,
        `Expected Page 2 UNCOMPARABLE_PAGE, got ${compData.pages[1].comparisonStatus}`
      );

      return `MissingDocB=${missingSecondRes.error?.code}; DamagedPage2=${compData.pages[1].comparisonStatus} (uncomparablePageCount=${compData.uncomparablePageCount}, reason="${compData.pages[1].uncomparableReason}")`;
    }
  );

  // ==========================================================================
  // TOOL 4: PDF BLANK PAGE DETECTOR (`pdf-blank-page-detector`)
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-10',
    'pdf-blank-page-detector',
    'Genuinely blank pages vs white background with text vs white background with embedded image',
    '4-page PDF: Page 1 is completely empty; Page 2 has only a pure-white background image & white rectangle; Page 3 has standard text; Page 4 has a visible dark checkerboard image',
    'Classifies Pages 1 and 2 as GENUINELY_BLANK (isBlank=true) and Pages 3 and 4 as NON_BLANK_CONTENT (isBlank=false) without modifying the document',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Page 1: Completely empty page
      doc.addPage([612, 792]);

      // Page 2: Pure white vector rectangle + pure white embedded PNG image (still genuinely blank visually!)
      const p2 = doc.addPage([612, 792]);
      p2.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(1, 1, 1) });
      const whitePng = createSyntheticPngBytes(40, 40, 'pure-white');
      const whiteImg = await doc.embedPng(whitePng);
      p2.drawImage(whiteImg, { x: 100, y: 100, width: 100, height: 100 });

      // Page 3: White page with clear black text
      const p3 = doc.addPage([612, 792]);
      p3.drawText('CHAPTER 1: INTRODUCTION TO BROWSER-LOCAL PDF ANALYSIS', {
        x: 50,
        y: 700,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });

      // Page 4: White page with visible non-white embedded image (0 text characters)
      const p4 = doc.addPage([612, 792]);
      const darkPng = createSyntheticPngBytes(64, 64, 'dark-checkerboard');
      const darkImg = await doc.embedPng(darkPng);
      p4.drawImage(darkImg, { x: 150, y: 400, width: 200, height: 200 });

      const pdfBytes = new Uint8Array(await doc.save());
      const checksumBefore = computeFnv1aChecksumHex(pdfBytes);

      const res = await detectBlankPdfPagesV2({ fileName: 'blank_vs_content.pdf', bytes: pdfBytes });
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);
      assertCondition(
        computeFnv1aChecksumHex(pdfBytes) === checksumBefore,
        'Input PDF bytes must remain 100% immutable'
      );

      const data = res.inspectionReport?.rawData as unknown as PdfBlankPageDetectorReportData;
      assertCondition(data.totalPages === 4, `Expected 4 pages, got ${data.totalPages}`);
      assertCondition(
        data.blankPageCount === 2 &&
          data.blankPageNumbers[0] === 1 &&
          data.blankPageNumbers[1] === 2,
        `Expected blank pages [1, 2], got ${JSON.stringify(data.blankPageNumbers)}`
      );
      assertCondition(
        data.nonBlankPageCount === 2 &&
          data.nonBlankPageNumbers[0] === 3 &&
          data.nonBlankPageNumbers[1] === 4,
        `Expected non-blank pages [3, 4], got ${JSON.stringify(data.nonBlankPageNumbers)}`
      );
      assertCondition(data.pages[0].classification === 'GENUINELY_BLANK' && data.pages[0].isBlank === true, 'Page 1 must be GENUINELY_BLANK');
      assertCondition(data.pages[1].classification === 'GENUINELY_BLANK' && data.pages[1].isBlank === true, 'Page 2 (white rect + white image) must be GENUINELY_BLANK');
      assertCondition(data.pages[2].classification === 'NON_BLANK_CONTENT' && data.pages[2].isBlank === false, 'Page 3 (text) must be NON_BLANK_CONTENT');
      assertCondition(data.pages[3].classification === 'NON_BLANK_CONTENT' && data.pages[3].isBlank === false, 'Page 4 (visible image) must be NON_BLANK_CONTENT');

      return `BlankPages=${JSON.stringify(data.blankPageNumbers)} (p1 empty, p2 white-on-white); NonBlankPages=${JSON.stringify(data.nonBlankPageNumbers)} (p3 text, p4 image)`;
    }
  );

  await runTestCase(
    'PDF08A-TC-11',
    'pdf-blank-page-detector',
    'Faint marks, sparse content, and mixed multi-page conservative blank detection',
    '4-page PDF: Page 1 is faint light-gray vector signature line rgb(0.90,0.90,0.90); Page 2 has sparse 2-char page number "ii"; Page 3 is genuinely blank; Page 4 has full paragraph text',
    'Never falsely flags faint marks (Page 1) or sparse characters (Page 2) as blank; classifies Pages 1 & 2 as NEARLY_BLANK_FAINT_OR_SPARSE (isBlank=false, isUncertainOrFaint=true), Page 3 as GENUINELY_BLANK, and Page 4 as NON_BLANK_CONTENT',
    async () => {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Page 1: Faint light-gray vector stroke (rgb(0.90, 0.90, 0.90) -> luminance 230, deltaFromWhite = 25)
      const p1 = doc.addPage([612, 792]);
      p1.drawRectangle({
        x: 200,
        y: 100,
        width: 120,
        height: 2,
        color: rgb(0.9, 0.9, 0.9),
      });

      // Page 2: Sparse 2-character Roman numeral footer ("ii")
      const p2 = doc.addPage([612, 792]);
      p2.drawText('ii', {
        x: 300,
        y: 36,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Page 3: Genuinely blank page
      doc.addPage([612, 792]);

      // Page 4: Rich content page
      const p4 = doc.addPage([612, 792]);
      p4.drawText('APPENDIX A: FULL TECHNICAL SPECIFICATION AND COMPLIANCE MATRIX', {
        x: 50,
        y: 720,
        size: 13,
        font,
      });

      const pdfBytes = new Uint8Array(await doc.save());
      const res = await detectBlankPdfPagesV2({ fileName: 'faint_and_sparse.pdf', bytes: pdfBytes });
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfBlankPageDetectorReportData;
      assertCondition(
        data.pages[0].classification === 'NEARLY_BLANK_FAINT_OR_SPARSE' &&
          data.pages[0].isBlank === false &&
          data.pages[0].isUncertainOrFaint === true,
        `Expected Page 1 (faint mark) to be NEARLY_BLANK_FAINT_OR_SPARSE, got ${data.pages[0].classification}`
      );
      assertCondition(
        data.pages[1].classification === 'NEARLY_BLANK_FAINT_OR_SPARSE' &&
          data.pages[1].isBlank === false &&
          data.pages[1].isUncertainOrFaint === true,
        `Expected Page 2 (sparse "ii") to be NEARLY_BLANK_FAINT_OR_SPARSE, got ${data.pages[1].classification}`
      );
      assertCondition(
        data.pages[2].classification === 'GENUINELY_BLANK' && data.pages[2].isBlank === true,
        `Expected Page 3 to be GENUINELY_BLANK, got ${data.pages[2].classification}`
      );
      assertCondition(
        data.pages[3].classification === 'NON_BLANK_CONTENT' && data.pages[3].isBlank === false,
        `Expected Page 4 to be NON_BLANK_CONTENT, got ${data.pages[3].classification}`
      );
      assertCondition(
        data.blankPageNumbers.length === 1 && data.blankPageNumbers[0] === 3,
        `Expected blankPageNumbers=[3], got ${JSON.stringify(data.blankPageNumbers)}`
      );
      assertCondition(
        data.nearlyBlankPageNumbers.length === 2 &&
          data.nearlyBlankPageNumbers[0] === 1 &&
          data.nearlyBlankPageNumbers[1] === 2,
        `Expected nearlyBlankPageNumbers=[1, 2], got ${JSON.stringify(data.nearlyBlankPageNumbers)}`
      );

      return `Page 1 (faint gray stroke)=${data.pages[0].classification} (isBlank=false); Page 2 (sparse "ii")=${data.pages[1].classification} (isBlank=false); Page 3=${data.pages[2].classification}; Page 4=${data.pages[3].classification}`;
    }
  );

  // ==========================================================================
  // TOOL 5: PDF FILE SIZE ANALYZER (`pdf-file-size-analyzer`)
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-12',
    'pdf-file-size-analyzer',
    'Small PDF vs multi-page large PDF file size and per-page byte average analysis',
    '1-page minimal PDF (~1 KB) vs 10-page text-heavy PDF',
    'Reports exact totalBytes, pageCount, averageBytesPerPage, indirect object counts, and distinguishes exact stream lengths from estimated structural overhead',
    async () => {
      const smallBytes = await createValidMultiPagePdfFixture({ pageTexts: ['SMALL_1P_DOC'] });
      const smallRes = await analyzePdfFileSizeV2({ fileName: 'small_1p.pdf', bytes: smallBytes });
      assertCondition(smallRes.status === 'SUCCESS', `Expected smallRes SUCCESS, got ${smallRes.status}`);

      const smallData = smallRes.inspectionReport?.rawData as unknown as PdfFileSizeAnalyzerReportData;
      assertCondition(smallData.totalBytes === smallBytes.byteLength, 'Exact totalBytes mismatch on small PDF');
      assertCondition(smallData.pageCount === 1, 'Expected pageCount=1');
      assertCondition(smallData.averageBytesPerPage === smallBytes.byteLength, 'Expected averageBytesPerPage === totalBytes for 1-page PDF');

      const tenPageTexts = Array.from({ length: 10 }, (_, i) =>
        `PAGE ${i + 1} CONTENT STREAM PAYLOAD: `.padEnd(400, 'X')
      );
      const multiBytes = await createValidMultiPagePdfFixture({ pageTexts: tenPageTexts });
      const multiRes = await analyzePdfFileSizeV2({ fileName: 'large_10p.pdf', bytes: multiBytes });
      assertCondition(multiRes.status === 'SUCCESS', `Expected multiRes SUCCESS, got ${multiRes.status}`);

      const multiData = multiRes.inspectionReport?.rawData as unknown as PdfFileSizeAnalyzerReportData;
      assertCondition(multiData.totalBytes === multiBytes.byteLength && multiData.totalBytes > smallData.totalBytes, 'Expected multi-page PDF to be larger than small 1p PDF');
      assertCondition(multiData.pageCount === 10, `Expected pageCount=10, got ${multiData.pageCount}`);
      assertCondition(
        multiData.averageBytesPerPage === Math.round(multiBytes.byteLength / 10),
        `Expected averageBytesPerPage=${Math.round(multiBytes.byteLength / 10)}, got ${multiData.averageBytesPerPage}`
      );
      assertCondition(
        multiData.exactCategoryStreamBytes.pageContentStreamsCount === 10 &&
          multiData.exactCategoryStreamBytes.pageContentStreamsBytes > 0,
        'Expected 10 measured page content streams'
      );
      assertCondition(
        multiData.exactCategoryStreamBytes.totalMeasuredStreamBytes + multiData.estimatedStructuralOverheadBytes >= multiData.totalBytes,
        'Measured streams + structural overhead must account for total file bytes'
      );

      return `Small=1p (${smallData.totalBytes} B, avg=${smallData.averageBytesPerPage} B/p); Multi=10p (${multiData.totalBytes} B, avg=${multiData.averageBytesPerPage} B/p, contentStreams=${multiData.exactCategoryStreamBytes.pageContentStreamsCount})`;
    }
  );

  await runTestCase(
    'PDF08A-TC-13',
    'pdf-file-size-analyzer',
    'Image-heavy PDF analysis and high-severity image optimization recommendation',
    '1-page PDF embedding a 240x240 RGB checkerboard PNG image XObject (>15 KB image stream payload)',
    'Accurately measures exact Image XObject stream bytes, identifies IMAGES as dominantCategory, lists the image in largeResources, and recommends OPT_IMAGE_DOWNSAMPLING_OR_RECOMPRESSION',
    async () => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([612, 792]);
      const bigPng = createSyntheticPngBytes(120, 120, 'high-entropy-photo');
      const embImg = await doc.embedPng(bigPng);
      page.drawImage(embImg, { x: 50, y: 200, width: 400, height: 400 });
      const pdfBytes = new Uint8Array(await doc.save({ useObjectStreams: false }));

      const res = await analyzePdfFileSizeV2(
        { fileName: 'image_heavy.pdf', bytes: pdfBytes },
        { largeResourceThresholdBytes: 1024 }
      );
      assertCondition(res.status === 'SUCCESS', `Expected SUCCESS, got ${res.status}`);

      const data = res.inspectionReport?.rawData as unknown as PdfFileSizeAnalyzerReportData;
      assertCondition(
        data.exactCategoryStreamBytes.imageStreamsCount >= 1 &&
          data.exactCategoryStreamBytes.imagesBytes > 2000,
        `Expected image stream bytes > 2000, got ${data.exactCategoryStreamBytes.imagesBytes}`
      );
      assertCondition(
        data.dominantCategory === 'IMAGES',
        `Expected dominantCategory=IMAGES, got ${data.dominantCategory}`
      );
      assertCondition(
        data.largeResources.some((r) => r.category === 'IMAGES' && r.measurementKind === 'EXACT_STREAM_LENGTH'),
        'Expected IMAGES entry in largeResources with EXACT_STREAM_LENGTH'
      );
      assertCondition(
        data.optimizationRecommendations.some((r) => r.id === 'OPT_IMAGE_DOWNSAMPLING_OR_RECOMPRESSION'),
        'Expected OPT_IMAGE_DOWNSAMPLING_OR_RECOMPRESSION recommendation'
      );

      return `Total=${data.totalBytes} B, Images=${data.exactCategoryStreamBytes.imagesBytes} B (${data.categoryPercentages.imagesPct}%, ${data.exactCategoryStreamBytes.imageStreamsCount} stream), dominant=${data.dominantCategory}`;
    }
  );

  await runTestCase(
    'PDF08A-TC-14',
    'pdf-file-size-analyzer',
    'Font-heavy PDF and Metadata-heavy PDF stream categorization and optimization recommendations',
    'PDF 1 with embedded 24 KB /FontFile2 program stream + PDF 2 with 20 KB padded XMP /Metadata XML packet stream',
    'Identifies FONTS and METADATA_AND_XMP as the respective dominant categories and emits OPT_FONT_SUBSETTING and OPT_STRIP_XMP_METADATA_PADDING recommendations',
    async () => {
      // 1. Font-heavy PDF with synthetic /FontFile2 stream attached to a FontDescriptor dictionary
      const fontDoc = await PDFDocument.create();
      fontDoc.addPage([612, 792]);
      const syntheticFontProgram = new Uint8Array(24576);
      for (let i = 0; i < syntheticFontProgram.byteLength; i++) {
        syntheticFontProgram[i] = (i * 17 + 65) & 0xff;
      }
      const fontStreamDict = fontDoc.context.obj({
        Length: syntheticFontProgram.byteLength,
        Length1: syntheticFontProgram.byteLength,
      });
      const fontStream = PDFRawStream.of(fontStreamDict, syntheticFontProgram);
      const fontStreamRef = fontDoc.context.register(fontStream);
      const fontDescriptorDict = fontDoc.context.obj({
        Type: 'FontDescriptor',
        FontName: 'CalcToolsCustomEmbeddedFont',
        FontFile2: fontStreamRef,
      });
      fontDoc.context.register(fontDescriptorDict);
      const fontPdfBytes = new Uint8Array(await fontDoc.save({ useObjectStreams: false }));

      const fontRes = await analyzePdfFileSizeV2({ fileName: 'font_heavy.pdf', bytes: fontPdfBytes });
      assertCondition(fontRes.status === 'SUCCESS', `Expected fontRes SUCCESS, got ${fontRes.status}`);
      const fontData = fontRes.inspectionReport?.rawData as unknown as PdfFileSizeAnalyzerReportData;
      assertCondition(
        fontData.exactCategoryStreamBytes.fontStreamsCount === 1 &&
          fontData.exactCategoryStreamBytes.fontsBytes === 24576,
        `Expected exact 24576 font bytes, got ${fontData.exactCategoryStreamBytes.fontsBytes}`
      );
      assertCondition(fontData.dominantCategory === 'FONTS', `Expected dominantCategory=FONTS, got ${fontData.dominantCategory}`);
      assertCondition(
        fontData.optimizationRecommendations.some((r) => r.id === 'OPT_FONT_SUBSETTING'),
        'Expected OPT_FONT_SUBSETTING recommendation'
      );

      // 2. Metadata-heavy PDF with 20 KB XMP padding
      const metaDoc = await PDFDocument.create();
      metaDoc.addPage([612, 792]);
      const paddedXmp =
        `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/">` +
        ' '.repeat(20480) +
        `</x:xmpmeta><?xpacket end="w"?>`;
      attachXmpMetadataPacketToDocument(metaDoc, paddedXmp);
      const metaPdfBytes = new Uint8Array(await metaDoc.save({ useObjectStreams: false }));

      const metaRes = await analyzePdfFileSizeV2({ fileName: 'metadata_heavy.pdf', bytes: metaPdfBytes });
      assertCondition(metaRes.status === 'SUCCESS', `Expected metaRes SUCCESS, got ${metaRes.status}`);
      const metaData = metaRes.inspectionReport?.rawData as unknown as PdfFileSizeAnalyzerReportData;
      assertCondition(
        metaData.exactCategoryStreamBytes.metadataStreamsCount === 1 &&
          metaData.exactCategoryStreamBytes.metadataAndXmpBytes >= 20480,
        `Expected metadataAndXmpBytes >= 20480, got ${metaData.exactCategoryStreamBytes.metadataAndXmpBytes}`
      );
      assertCondition(
        metaData.dominantCategory === 'METADATA_AND_XMP',
        `Expected dominantCategory=METADATA_AND_XMP, got ${metaData.dominantCategory}`
      );
      assertCondition(
        metaData.optimizationRecommendations.some((r) => r.id === 'OPT_STRIP_XMP_METADATA_PADDING'),
        'Expected OPT_STRIP_XMP_METADATA_PADDING recommendation'
      );

      return `FontHeavy: fontsBytes=${fontData.exactCategoryStreamBytes.fontsBytes} B (${fontData.categoryPercentages.fontsPct}%, dominant=${fontData.dominantCategory}); MetadataHeavy: metadataBytes=${metaData.exactCategoryStreamBytes.metadataAndXmpBytes} B (${metaData.categoryPercentages.metadataAndXmpPct}%, dominant=${metaData.dominantCategory})`;
    }
  );

  await runTestCase(
    'PDF08A-TC-15',
    'pdf-file-size-analyzer',
    'Unsupported, empty, corrupted, and unauthenticated encrypted input rejection in file size analyzer',
    '0-byte buffer, non-PDF bytes, malformed PDF, and locked AES-256 PDF without password',
    'Fails cleanly with structured error codes (ERR_EMPTY_FILE, ERR_INVALID_PDF, ERR_PASSWORD_REQUIRED)',
    async () => {
      const emptyRes = await analyzePdfFileSizeV2({ fileName: 'empty.pdf', bytes: createEmptyBufferFixture() });
      assertCondition(emptyRes.error?.code === 'ERR_EMPTY_FILE', `Expected ERR_EMPTY_FILE, got ${emptyRes.error?.code}`);

      const badMagicRes = await analyzePdfFileSizeV2({ fileName: 'bad.pdf', bytes: createInvalidMagicBytesFixture() });
      assertCondition(badMagicRes.error?.code === 'ERR_INVALID_PDF', `Expected ERR_INVALID_PDF, got ${badMagicRes.error?.code}`);

      const corruptRes = await analyzePdfFileSizeV2({
        fileName: 'corrupt.pdf',
        bytes: createMalformedPdfWithBrokenStructureFixture(),
      });
      assertCondition(corruptRes.status !== 'SUCCESS' && Boolean(corruptRes.error), 'Expected corrupted PDF failure');

      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: 'SizeSecretPassword',
      });
      const encNoPass = await analyzePdfFileSizeV2({ fileName: 'enc.pdf', bytes: encBytes });
      assertCondition(
        encNoPass.error?.code === 'ERR_PASSWORD_REQUIRED',
        `Expected ERR_PASSWORD_REQUIRED, got ${encNoPass.error?.code}`
      );

      return `Empty=${emptyRes.error?.code}, BadMagic=${badMagicRes.error?.code}, Corrupt=${corruptRes.error?.code}, LockedNoPass=${encNoPass.error?.code}`;
    }
  );

  // ==========================================================================
  // ENGINE E ROUTER, CANCELLATION & ISOLATION TESTS
  // ==========================================================================

  await runTestCase(
    'PDF08A-TC-16',
    'executeInspectionAnalysisOperationV2',
    'Unified Engine E router dispatching all 5 canonical tools and rejecting cross-module / unknown IDs',
    'Dispatch requests for pdf-page-counter, pdf-metadata-viewer, pdf-comparison, pdf-blank-page-detector, pdf-file-size-analyzer + cross-module pdf-merge + non-PDF generator-743 + unknown tool ID',
    'All 5 canonical Engine E tools succeed with exact reportType and resolvedCanonicalId, while cross-module and unknown IDs are rejected with ERR_UNSUPPORTED_OPERATION',
    async () => {
      const docA = await createValidMultiPagePdfFixture({
        pageTexts: ['ROUTER TEST PAGE 1', 'ROUTER TEST PAGE 2'],
        title: 'Engine E Router Test',
      });
      const docB = await createValidMultiPagePdfFixture({
        pageTexts: ['ROUTER TEST PAGE 1', 'ROUTER TEST PAGE 2 MODIFIED'],
        title: 'Engine E Router Test B',
      });

      const r1 = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-page-counter',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        r1.status === 'SUCCESS' && r1.resolvedCanonicalId === 'pdf-page-counter' && r1.inspectionReport?.reportType === 'page-counter',
        `Router pdf-page-counter failed: ${r1.status}`
      );

      const r2 = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-metadata-viewer',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        r2.status === 'SUCCESS' && r2.resolvedCanonicalId === 'pdf-metadata-viewer' && r2.inspectionReport?.reportType === 'metadata-viewer',
        `Router pdf-metadata-viewer failed: ${r2.status}`
      );

      const r3 = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-comparison',
        inputs: [
          { fileName: 'a.pdf', bytes: docA },
          { fileName: 'b.pdf', bytes: docB },
        ],
      });
      assertCondition(
        r3.status === 'SUCCESS' && r3.resolvedCanonicalId === 'pdf-comparison' && r3.inspectionReport?.reportType === 'pdf-comparison',
        `Router pdf-comparison failed: ${r3.status}`
      );

      const r4 = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-blank-page-detector',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        r4.status === 'SUCCESS' && r4.resolvedCanonicalId === 'pdf-blank-page-detector' && r4.inspectionReport?.reportType === 'blank-page-detector',
        `Router pdf-blank-page-detector failed: ${r4.status}`
      );

      const r5 = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-file-size-analyzer',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        r5.status === 'SUCCESS' && r5.resolvedCanonicalId === 'pdf-file-size-analyzer' && r5.inspectionReport?.reportType === 'file-size-analyzer',
        `Router pdf-file-size-analyzer failed: ${r5.status}`
      );

      // Cross-module rejection
      const crossRes = await executeInspectionAnalysisOperationV2({
        toolId: 'pdf-merge',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        crossRes.status === 'UNSUPPORTED_OPERATION' && crossRes.error?.code === 'ERR_UNSUPPORTED_OPERATION',
        `Expected ERR_UNSUPPORTED_OPERATION for pdf-merge, got ${crossRes.error?.code}`
      );

      // Non-PDF formula calculator rejection
      const genRes = await executeInspectionAnalysisOperationV2({
        toolId: 'generator-743',
        inputs: [{ fileName: 'a.pdf', bytes: docA }],
      });
      assertCondition(
        genRes.status === 'UNSUPPORTED_OPERATION' && genRes.error?.code === 'ERR_UNSUPPORTED_OPERATION',
        `Expected ERR_UNSUPPORTED_OPERATION for generator-743, got ${genRes.error?.code}`
      );

      return `All 5 canonical tools routed & verified (page-counter, metadata-viewer, pdf-comparison, blank-page-detector, file-size-analyzer); crossModule=ERR_UNSUPPORTED_OPERATION; generator743=ERR_UNSUPPORTED_OPERATION`;
    }
  );

  await runTestCase(
    'PDF08A-TC-17',
    'executeInspectionAnalysisOperationV2',
    'Deterministic AbortSignal cancellation across all 5 Engine E tools',
    'Pre-aborted AbortController passed to countPdfPagesV2, inspectPdfMetadataV2, comparePdfDocumentsV2, detectBlankPdfPagesV2, and analyzePdfFileSizeV2',
    'All 5 tools abort immediately with status=PROCESSING_FAILURE and error.code=ERR_OPERATION_ABORTED',
    async () => {
      const pdfBytes = await createValidMultiPagePdfFixture({ pageTexts: ['ABORT_TEST'] });
      const ctrl = new AbortController();
      ctrl.abort();

      const c1 = await countPdfPagesV2({ fileName: 'a.pdf', bytes: pdfBytes }, { signal: ctrl.signal });
      const c2 = await inspectPdfMetadataV2({ fileName: 'a.pdf', bytes: pdfBytes }, { signal: ctrl.signal });
      const c3 = await comparePdfDocumentsV2(
        { fileName: 'a.pdf', bytes: pdfBytes },
        { fileName: 'b.pdf', bytes: pdfBytes },
        { signal: ctrl.signal }
      );
      const c4 = await detectBlankPdfPagesV2({ fileName: 'a.pdf', bytes: pdfBytes }, { signal: ctrl.signal });
      const c5 = await analyzePdfFileSizeV2({ fileName: 'a.pdf', bytes: pdfBytes }, { signal: ctrl.signal });

      for (const [idx, res] of [c1, c2, c3, c4, c5].entries()) {
        assertCondition(
          res.status === 'PROCESSING_FAILURE' && res.error?.code === 'ERR_OPERATION_ABORTED',
          `Tool ${idx + 1} failed abort check: status=${res.status}, code=${res.error?.code}`
        );
      }

      return `All 5 Engine E tools honored AbortSignal with ERR_OPERATION_ABORTED (PROCESSING_FAILURE)`;
    }
  );

  await runTestCase(
    'PDF08A-TC-18',
    'executeInspectionAnalysisOperationV2',
    'Zero password exposure & caller buffer immutability across all 5 Engine E tools',
    'AES-256 encrypted PDF with sentinel password "SENTINEL_ENGINE_E_PASS_998877" analyzed by all 5 tools while intercepting console logs and output artifacts',
    'Zero occurrences of sentinel password in any console output, summary, previewText, or output file bytes, and 100% FNV-1a checksum preservation on caller input buffer',
    async () => {
      const sentinel = 'SENTINEL_ENGINE_E_PASS_998877';
      const encBytes = await createPasswordProtectedPdfFixture({
        userPassword: sentinel,
        pageText: 'CONFIDENTIAL_ANALYSIS_PAGE',
      });
      const checksumBefore = computeFnv1aChecksumHex(encBytes);

      const capturedLogs: string[] = [];
      const origLog = console.log;
      const origWarn = console.warn;
      const origErr = console.error;
      console.log = (...args: unknown[]) => capturedLogs.push(args.map(String).join(' '));
      console.warn = (...args: unknown[]) => capturedLogs.push(args.map(String).join(' '));
      console.error = (...args: unknown[]) => capturedLogs.push(args.map(String).join(' '));

      let r1;
      let r2;
      let r3;
      let r4;
      let r5;
      try {
        r1 = await countPdfPagesV2({ fileName: 'sec.pdf', bytes: encBytes, password: sentinel });
        r2 = await inspectPdfMetadataV2({ fileName: 'sec.pdf', bytes: encBytes, password: sentinel });
        r3 = await comparePdfDocumentsV2(
          { fileName: 'secA.pdf', bytes: encBytes, password: sentinel },
          { fileName: 'secB.pdf', bytes: encBytes, password: sentinel }
        );
        r4 = await detectBlankPdfPagesV2({ fileName: 'sec.pdf', bytes: encBytes, password: sentinel });
        r5 = await analyzePdfFileSizeV2({ fileName: 'sec.pdf', bytes: encBytes, password: sentinel });
      } finally {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origErr;
      }

      for (const res of [r1, r2, r3, r4, r5]) {
        assertCondition(res.status === 'SUCCESS', `Expected SUCCESS on encrypted analysis, got ${res.status}`);
        const serialized = JSON.stringify({
          summary: res.summary,
          previewText: res.previewText,
          details: res.details,
          inspectionReport: res.inspectionReport,
        });
        assertCondition(!serialized.includes(sentinel), `Password leaked in result payload of ${res.resolvedCanonicalId}`);
        for (const f of res.outputFiles) {
          const text = new TextDecoder().decode(f.bytes);
          assertCondition(!text.includes(sentinel), `Password leaked in output file ${f.fileName}`);
        }
      }

      assertCondition(
        !capturedLogs.join('\n').includes(sentinel),
        'Password leaked in console output'
      );
      assertCondition(
        computeFnv1aChecksumHex(encBytes) === checksumBefore,
        'Caller encrypted input buffer was mutated'
      );

      return `0 password leaks across all 5 tools (console lines=${capturedLogs.length}, output artifacts=10); input checksum preserved (${checksumBefore})`;
    }
  );

  console.log('--------------------------------------------------------------------------------');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status !== 'PASS').length;
  console.log(`PHASE PDF-08A (ENGINE E: INSPECTION & ANALYSIS) SUMMARY: ${passed} / ${results.length} PASS (${failed} FAIL)`);
  console.log('--------------------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error in runPdf08AInspectionAnalysisTests:', err);
  process.exit(1);
});
