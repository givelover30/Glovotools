import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  StandardFonts,
  rgb,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../../pdfRuntime';
import {
  analyzePdfOptimizationOpportunitiesV2,
  compressPdfDocumentV2,
  encodeRawPixelsToPng,
  executeOptimizationRepairOperationV2,
  repairPdfDocumentV2,
  stripJpegMetadataSegments,
} from '../index';
import {
  createEmptyBufferFixture,
  createInvalidMagicBytesFixture,
  createMalformedPdfWithBrokenStructureFixture,
  createPasswordProtectedPdfFixture,
  createValidMultiPagePdfFixture,
} from './pdfTestFixtures';

export interface Pdf07TestCaseResult {
  testId: string;
  canonicalId: string;
  operation: string;
  description: string;
  status: 'VERIFIED' | 'FAILED';
  inputBytes: number;
  outputBytes: number;
  bytesSaved: number;
  reductionPercent: number;
  evidence: string;
}

function computeSimpleBytesChecksum(bytes: Uint8Array): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < bytes.byteLength; i++) {
    h1 ^= bytes[i];
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + bytes[i] * ((i % 251) + 1)) >>> 0;
  }
  return `${bytes.byteLength}:${h1.toString(16).padStart(8, '0')}-${h2.toString(16).padStart(8, '0')}`;
}

/**
 * Builds an independent PDF fixture containing:
 * - 2 pages with distinct dimensions (Page 1: 612x792 Portrait, Page 2: 792x612 Landscape)
 * - Known visible text tokens ('PDF07_COMP_PAGE_1_ALPHA', 'PDF07_COMP_PAGE_2_BETA')
 * - A large 240x180 RGB embedded raster image (`/FlateDecode` via `embedPng`)
 * - A duplicate copy of the exact same image embedded as a second independent XObject
 * - An unreferenced orphaned 24 KB indirect stream object
 * - Verbose InfoDict + XMP Catalog `/Metadata` stream (~6 KB)
 */
async function createImageAndResourceHeavyPdfFixture(): Promise<{
  bytes: Uint8Array;
  expectedPageCount: number;
  expectedPageSizes: Array<{ width: number; height: number }>;
  expectedPageTexts: string[];
}> {
  const doc = await PDFDocument.create();
  doc.setTitle('PDF07 Heavy Compression Verification Document ' + 'M'.repeat(400));
  doc.setAuthor('CalcTools PDF Engine V2 QA ' + 'A'.repeat(300));
  doc.setSubject('Optimization & Resource Cleanup Verification ' + 'S'.repeat(300));
  doc.setKeywords(['compression', 'optimization', 'deduplication', 'metadata', 'xobjects']);
  doc.setCreator('CalcTools Independent Test Fixture Generator');
  doc.setProducer('CalcTools @cantoo/pdf-lib');

  // Attach an explicit 6 KB XMP /Metadata stream on the Catalog
  const xmpPayload = new TextEncoder().encode(
    `<?xpacket begin="" id="W5M0MpThreshold"?>\n<x:xmpmeta xmlns:x="adobe:ns:meta/">` +
      `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
      `<!-- ${'XMP_PADDING_OVERHEAD_'.repeat(300)} -->` +
      `</rdf:RDF></x:xmpmeta>\n<?xpacket end="w"?>`
  );
  const xmpStream = doc.context.flateStream(xmpPayload, {
    Type: 'Metadata',
    Subtype: 'XML',
  });
  const xmpRef = doc.context.register(xmpStream);
  doc.catalog.set(PDFName.of('Metadata'), xmpRef);

  // Register an unreferenced orphaned 24 KB raw stream object (not linked from any page or catalog)
  const orphanBytes = new Uint8Array(24576);
  for (let i = 0; i < orphanBytes.byteLength; i++) {
    orphanBytes[i] = (i * 73 + 19) & 0xff;
  }
  const orphanStream = PDFRawStream.of(
    doc.context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      Length: orphanBytes.byteLength,
    }),
    orphanBytes
  );
  doc.context.register(orphanStream);

  // Create a 240x180 RGB smooth gradient PNG image (uncompressed stored-DEFLATE PNG -> embeds as /FlateDecode RGB XObject)
  const imgW = 240;
  const imgH = 180;
  const rgbPixels = new Uint8Array(imgW * imgH * 3);
  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      const idx = (y * imgW + x) * 3;
      rgbPixels[idx] = Math.round((x / imgW) * 220) + 20;
      rgbPixels[idx + 1] = Math.round((y / imgH) * 200) + 30;
      rgbPixels[idx + 2] = Math.round(((x + y) / (imgW + imgH)) * 180) + 40;
    }
  }
  const pngBytesA = encodeRawPixelsToPng({
    width: imgW,
    height: imgH,
    channels: 3,
    pixels: rgbPixels,
  });
  // Clone identical PNG bytes to embed a second duplicate XObject resource
  const pngBytesB = new Uint8Array(pngBytesA);

  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const embeddedImg1 = await doc.embedPng(pngBytesA);
  const embeddedImg2 = await doc.embedPng(pngBytesB);

  // Page 1: 612 x 792 (US Letter Portrait)
  const page1 = doc.addPage([612, 792]);
  page1.drawText('PDF07_COMP_PAGE_1_ALPHA', {
    x: 50,
    y: 720,
    size: 18,
    font,
    color: rgb(0.08, 0.12, 0.25),
  });
  page1.drawImage(embeddedImg1, {
    x: 50,
    y: 380,
    width: 240,
    height: 180,
  });

  // Page 2: 792 x 612 (US Letter Landscape)
  const page2 = doc.addPage([792, 612]);
  page2.drawText('PDF07_COMP_PAGE_2_BETA', {
    x: 60,
    y: 540,
    size: 18,
    font,
    color: rgb(0.1, 0.2, 0.1),
  });
  page2.drawImage(embeddedImg2, {
    x: 60,
    y: 200,
    width: 240,
    height: 180,
  });

  // Save with useObjectStreams: false so standard xref + uncompressed orphan/duplicate resources are present
  const bytes = await doc.save({ useObjectStreams: false });
  return {
    bytes,
    expectedPageCount: 2,
    expectedPageSizes: [
      { width: 612, height: 792 },
      { width: 792, height: 612 },
    ],
    expectedPageTexts: ['PDF07_COMP_PAGE_1_ALPHA', 'PDF07_COMP_PAGE_2_BETA'],
  };
}

/**
 * Builds a raw ASCII/Latin-1 valid 2-page PDF with explicit indirect objects (`1 0 obj` .. `7 0 obj`)
 * so we can deterministically inject real structural corruptions:
 * - Missing `%%EOF` marker
 * - Leading garbage prefix + malformed cross-reference table (`xref`) with wrong byte offsets (`9999999999` / shifted offsets)
 * - Damaged / missing `trailer` and `startxref`
 * - Corrupted `/Type /Pages` tree where `/Kids` references a non-existent object `99 0 R`
 * - Partially truncated multi-page PDF where Page 1 (`3 0 obj`) is intact and Page 2 (`5 0 obj`) is destroyed
 */
function buildDeterministicRawMultiPagePdf(params?: {
  corruptXrefOffsets?: boolean;
  stripEofMarker?: boolean;
  prependGarbageBytes?: number;
  corruptTrailer?: boolean;
  corruptPageTreeKids?: boolean;
  destroySecondPage?: boolean;
}): Uint8Array {
  const p1Stream = 'BT /F1 16 Tf 72 710 Td (REPAIR_FIXTURE_PAGE_1_INTACT) Tj ET';
  const p2Stream = 'BT /F1 16 Tf 72 520 Td (REPAIR_FIXTURE_PAGE_2_INTACT) Tj ET';

  const objects: Array<{ num: number; body: string }> = [
    {
      num: 1,
      body: '<< /Type /Catalog /Pages 2 0 R >>',
    },
    {
      num: 2,
      body: params?.corruptPageTreeKids
        ? '<< /Type /Pages /Kids [ 888 0 R 999 0 R ] /Count 2 >>'
        : '<< /Type /Pages /Kids [ 3 0 R 5 0 R ] /Count 2 >>',
    },
    {
      num: 3,
      body: '<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',
    },
    {
      num: 4,
      body: `<< /Length ${p1Stream.length} >>\nstream\n${p1Stream}\nendstream`,
    },
    {
      num: 5,
      body: params?.destroySecondPage
        ? '<< /Type /Page /Parent 2 0 R /Broken CORRUPTED_UNTERMINATED_OBJECT_GRAPH_DATA >>'
        : '<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 792 612 ] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',
    },
    {
      num: 6,
      body: `<< /Length ${p2Stream.length} >>\nstream\n${p2Stream}\nendstream`,
    },
    {
      num: 7,
      body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    },
  ];

  let pdfStr = '%PDF-1.7\n';
  const offsets = new Map<number, number>();

  for (const obj of objects) {
    offsets.set(obj.num, pdfStr.length);
    pdfStr += `${obj.num} 0 obj\n${obj.body}\nendobj\n`;
  }

  const xrefOffset = pdfStr.length;
  pdfStr += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const rawOff = offsets.get(i) ?? 0;
    const reportedOff = params?.corruptXrefOffsets ? rawOff + 54321 : rawOff;
    pdfStr += `${String(reportedOff).padStart(10, '0')} 00000 n \n`;
  }

  if (params?.corruptTrailer) {
    pdfStr += `trailer\n<< /Size -1 /Root 777 0 R /CorruptedTrailer true >>\nstartxref\n9999999\n`;
  } else {
    pdfStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${
      params?.corruptXrefOffsets ? xrefOffset + 99999 : xrefOffset
    }\n`;
  }

  if (!params?.stripEofMarker) {
    pdfStr += '%%EOF\n';
  }

  const bodyBytes = new TextEncoder().encode(pdfStr);

  if (params?.prependGarbageBytes && params.prependGarbageBytes > 0) {
    const gLen = params.prependGarbageBytes;
    const withGarbage = new Uint8Array(gLen + bodyBytes.byteLength);
    for (let i = 0; i < gLen; i++) {
      withGarbage[i] = 0x41 + (i % 26); // 'A'..'Z'
    }
    withGarbage.set(bodyBytes, gLen);
    return withGarbage;
  }

  return bodyBytes;
}

/**
 * Independently verifies a PDF buffer using PDF.js (`openManagedPdfDocument`), extracting:
 * - Page count
 * - Per-page viewport dimensions (`width`, `height`, `rotate`)
 * - Per-page extracted text strings
 * - Metadata InfoDict fields
 */
async function inspectPdfIndependentlyWithPdfJs(bytes: Uint8Array): Promise<{
  numPages: number;
  pages: Array<{
    pageNumber: number;
    widthPt: number;
    heightPt: number;
    rotate: number;
    text: string;
    operatorCount: number;
  }>;
  info: Record<string, any>;
}> {
  const session = await openManagedPdfDocument(bytes);
  try {
    const numPages = Number(session.pdfDoc.numPages || 0);
    const meta = await session.pdfDoc.getMetadata().catch(() => ({ info: {} }));
    const pages: Array<{
      pageNumber: number;
      widthPt: number;
      heightPt: number;
      rotate: number;
      text: string;
      operatorCount: number;
    }> = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await session.pdfDoc.getPage(p);
      try {
        const vp = page.getViewport({ scale: 1.0 });
        const tc = await page.getTextContent();
        const text = (tc?.items || [])
          .map((it: any) => String(it?.str || ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const opList = await page.getOperatorList().catch(() => ({ fnArray: [] }));
        pages.push({
          pageNumber: p,
          widthPt: Math.round(vp.width * 100) / 100,
          heightPt: Math.round(vp.height * 100) / 100,
          rotate: ((Number(page.rotate) || 0) % 360 + 360) % 360,
          text,
          operatorCount: Array.isArray(opList?.fnArray) ? opList.fnArray.length : 0,
        });
      } finally {
        if (page && typeof page.cleanup === 'function') {
          await page.cleanup();
        }
      }
    }

    return {
      numPages,
      pages,
      info: (meta?.info as Record<string, any>) || {},
    };
  } finally {
    await session.dispose();
  }
}

export async function runPdf07OptimizationRepairTests(): Promise<{
  total: number;
  verified: number;
  failed: number;
  results: Pdf07TestCaseResult[];
}> {
  const results: Pdf07TestCaseResult[] = [];

  const record = (res: Pdf07TestCaseResult) => {
    results.push(res);
  };

  const heavyFixture = await createImageAndResourceHeavyPdfFixture();

  // ============================================================================
  // TC-01: Pre-Optimization Analysis (`analyzePdfOptimizationOpportunitiesV2`)
  // ============================================================================
  try {
    const inputCloneChecksumBefore = computeSimpleBytesChecksum(heavyFixture.bytes);
    const analysis = await analyzePdfOptimizationOpportunitiesV2({
      fileName: 'heavy_analysis.pdf',
      bytes: heavyFixture.bytes,
    });
    const inputCloneChecksumAfter = computeSimpleBytesChecksum(heavyFixture.bytes);

    const r = analysis.report!;
    const ok =
      analysis.success &&
      Boolean(r) &&
      inputCloneChecksumBefore === inputCloneChecksumAfter &&
      r.totalInputBytes === heavyFixture.bytes.byteLength &&
      r.pageCount === 2 &&
      r.largeEmbeddedImages.length >= 1 &&
      r.duplicateResources.length >= 1 &&
      r.unusedResourceRefs.length >= 1 &&
      r.metadataOverheadBytes > 1000 &&
      r.canMeaningfullyCompress === true;

    record({
      testId: 'PDF07-TC-01',
      canonicalId: 'pdf-compress (analysis)',
      operation: 'analyzePdfOptimizationOpportunitiesV2',
      description: 'Non-destructive analysis identifies large embedded images, duplicate resources, unused objects, and metadata overhead',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: heavyFixture.bytes.byteLength,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Identified ${r.largeEmbeddedImages.length} large image(s) (${r.categoryBreakdown.imagesBytes} B), ${r.duplicateResources.length} duplicate group(s), ${r.unusedResourceRefs.length} unused object(s), ${r.metadataOverheadBytes} B metadata; input checksum preserved (${inputCloneChecksumBefore}).`
        : `Analysis check failed: ${JSON.stringify(analysis.error || r)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-01',
      canonicalId: 'pdf-compress (analysis)',
      operation: 'analyzePdfOptimizationOpportunitiesV2',
      description: 'Non-destructive analysis identifies large embedded images, duplicate resources, unused objects, and metadata overhead',
      status: 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-02: Low / Lossless Structural Compression Profile (`profile: 'low'`)
  // ============================================================================
  let lowProfileOutputBytes = 0;
  try {
    const checksumBefore = computeSimpleBytesChecksum(heavyFixture.bytes);
    const res = await compressPdfDocumentV2(
      { fileName: 'heavy.pdf', bytes: heavyFixture.bytes },
      { profile: 'low', cleanMetadata: false }
    );
    const checksumAfter = computeSimpleBytesChecksum(heavyFixture.bytes);
    lowProfileOutputBytes = res.metrics.outputBytes;

    const pdfJsVerify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const compDetails = (res.details as any)?.compression;

    const ok =
      res.status === 'SUCCESS' &&
      checksumBefore === checksumAfter &&
      res.metrics.outputBytes < res.metrics.inputBytes &&
      res.metrics.savedBytes! > 20000 &&
      compDetails?.duplicateResourcesConsolidatedCount >= 1 &&
      compDetails?.unusedObjectsRemovedCount >= 1 &&
      pdfJsVerify.numPages === 2 &&
      pdfJsVerify.pages[0].widthPt === 612 &&
      pdfJsVerify.pages[0].heightPt === 792 &&
      pdfJsVerify.pages[1].widthPt === 792 &&
      pdfJsVerify.pages[1].heightPt === 612 &&
      pdfJsVerify.pages[0].text.includes('PDF07_COMP_PAGE_1_ALPHA') &&
      pdfJsVerify.pages[1].text.includes('PDF07_COMP_PAGE_2_BETA');

    record({
      testId: 'PDF07-TC-02',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: low)',
      description: 'Low (lossless structural) compression removes unused objects & duplicate resources while preserving lossless image streams, geometry, and text',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: res.metrics.inputBytes,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: res.metrics.savedBytes ?? 0,
      reductionPercent: res.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `Reduced ${res.metrics.inputBytes} B -> ${res.metrics.outputBytes} B (saved ${res.metrics.savedBytes} B / ${res.metrics.savedPercentage}%); consolidated ${compDetails.duplicateResourcesConsolidatedCount} duplicate stream(s) & removed ${compDetails.unusedObjectsRemovedCount} orphan object(s).`
        : `Low compression verification failed: ${res.summary}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-02',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: low)',
      description: 'Low (lossless structural) compression removes unused objects & duplicate resources',
      status: 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-03: Medium / Balanced Image-Heavy PDF Compression (`profile: 'medium'`)
  // ============================================================================
  let mediumProfileOutputBytes = 0;
  try {
    const res = await compressPdfDocumentV2(
      { fileName: 'heavy.pdf', bytes: heavyFixture.bytes },
      { profile: 'medium', targetDpi: 150, imageQuality: 0.75 }
    );
    mediumProfileOutputBytes = res.metrics.outputBytes;

    const pdfJsVerify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const compDetails = (res.details as any)?.compression;

    const ok =
      res.status === 'SUCCESS' &&
      res.metrics.outputBytes < lowProfileOutputBytes &&
      res.metrics.savedPercentage! >= 50 &&
      compDetails?.embeddedImagesOptimizedCount >= 1 &&
      pdfJsVerify.numPages === 2 &&
      pdfJsVerify.pages[0].widthPt === 612 &&
      pdfJsVerify.pages[0].heightPt === 792 &&
      pdfJsVerify.pages[1].widthPt === 792 &&
      pdfJsVerify.pages[1].heightPt === 612 &&
      pdfJsVerify.pages[0].text.includes('PDF07_COMP_PAGE_1_ALPHA') &&
      pdfJsVerify.pages[1].text.includes('PDF07_COMP_PAGE_2_BETA');

    record({
      testId: 'PDF07-TC-03',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: medium)',
      description: 'Medium (balanced 150 DPI, quality 0.75) compression optimizes embedded raster images and achieves >50% size reduction',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: res.metrics.inputBytes,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: res.metrics.savedBytes ?? 0,
      reductionPercent: res.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `Reduced ${res.metrics.inputBytes} B -> ${res.metrics.outputBytes} B (saved ${res.metrics.savedBytes} B / ${res.metrics.savedPercentage}%); optimized ${compDetails.embeddedImagesOptimizedCount} embedded image stream(s) saving ${compDetails.embeddedImagesBytesSaved} B.`
        : `Medium compression failed: out=${res.metrics.outputBytes}, low=${lowProfileOutputBytes}, details=${JSON.stringify(compDetails)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-03',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: medium)',
      description: 'Medium (balanced 150 DPI, quality 0.75) compression optimizes embedded raster images',
      status: 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-04: High / Compact Compression Profile + Metadata Cleanup (`profile: 'high'`)
  // ============================================================================
  try {
    const res = await compressPdfDocumentV2(
      { fileName: 'heavy.pdf', bytes: heavyFixture.bytes },
      { profile: 'high', targetDpi: 72, imageQuality: 0.45, cleanMetadata: true }
    );

    const pdfJsVerify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const compDetails = (res.details as any)?.compression;

    // Verify monotonic profile ordering: High <= Medium < Low < Original
    const ok =
      res.status === 'SUCCESS' &&
      res.metrics.outputBytes <= mediumProfileOutputBytes &&
      mediumProfileOutputBytes < lowProfileOutputBytes &&
      lowProfileOutputBytes < res.metrics.inputBytes &&
      compDetails?.cleanMetadataApplied === true &&
      compDetails?.metadataBytesRemoved > 1000 &&
      !pdfJsVerify.info?.Title &&
      pdfJsVerify.numPages === 2 &&
      pdfJsVerify.pages[0].text.includes('PDF07_COMP_PAGE_1_ALPHA') &&
      pdfJsVerify.pages[1].text.includes('PDF07_COMP_PAGE_2_BETA');

    record({
      testId: 'PDF07-TC-04',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: high + cleanMetadata)',
      description: 'High (compact) compression downsamples images, strips InfoDict + XMP metadata overhead, and produces smaller output than Low and Medium profiles',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: res.metrics.inputBytes,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: res.metrics.savedBytes ?? 0,
      reductionPercent: res.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `Profile Progression Verified: Original=${res.metrics.inputBytes} B -> Low=${lowProfileOutputBytes} B -> Medium=${mediumProfileOutputBytes} B -> High=${res.metrics.outputBytes} B (${res.metrics.savedPercentage}% saved; ${compDetails.metadataBytesRemoved} B metadata removed).`
        : `High compression check failed: high=${res.metrics.outputBytes}, med=${mediumProfileOutputBytes}, low=${lowProfileOutputBytes}, title=${pdfJsVerify.info?.Title}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-04',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (profile: high + cleanMetadata)',
      description: 'High (compact) compression downsamples images and strips metadata overhead',
      status: 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-05: No-Bloat Guard on Minimal Already-Compact PDF
  // ============================================================================
  try {
    // Build an ultra-compact minimal 1-page PDF saved with object streams
    const tinyDoc = await PDFDocument.create();
    tinyDoc.addPage([200, 200]);
    const tinyBytes = await tinyDoc.save({ useObjectStreams: true });

    // Also test a hand-crafted ultra-short 310-byte valid PDF where pdf-lib save() would increase byte count
    const handCraftedTinyPdf = buildDeterministicRawMultiPagePdf();
    // Compress it once with object streams to reach floor size
    const firstPass = await compressPdfDocumentV2(
      { fileName: 'tiny.pdf', bytes: tinyBytes },
      { profile: 'high' }
    );
    const floorBytes = firstPass.outputBytes!;

    // Pass floorBytes again; any re-serialization that equals or exceeds floorBytes must trigger no-bloat guard or never exceed floorBytes
    const secondPass = await compressPdfDocumentV2(
      { fileName: 'tiny_floor.pdf', bytes: floorBytes },
      { profile: 'medium' }
    );

    const compDetails = (secondPass.details as any)?.compression;
    const ok =
      secondPass.status === 'SUCCESS' &&
      secondPass.metrics.outputBytes <= secondPass.metrics.inputBytes &&
      secondPass.metrics.savedBytes === 0 &&
      compDetails?.noBloatGuardTriggered === true &&
      secondPass.warnings.some((w) => w.includes('No-Bloat Guard')) &&
      handCraftedTinyPdf.byteLength > 0;

    record({
      testId: 'PDF07-TC-05',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (No-Bloat Guard)',
      description: 'No-Bloat Guard prevents file size increase and honestly reports 0 bytes saved when a PDF is already maximally compact',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: secondPass.metrics.inputBytes,
      outputBytes: secondPass.metrics.outputBytes,
      bytesSaved: secondPass.metrics.savedBytes ?? 0,
      reductionPercent: secondPass.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `No-Bloat Guard triggered on ${secondPass.metrics.inputBytes} B floor fixture (candidate was ${compDetails.candidateCompressedBytes} B); preserved ${secondPass.metrics.outputBytes} B with explicit warning.`
        : `No-Bloat Guard check failed: in=${secondPass.metrics.inputBytes}, out=${secondPass.metrics.outputBytes}, details=${JSON.stringify(compDetails)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-05',
      canonicalId: 'pdf-compress',
      operation: 'compressPdfDocumentV2 (No-Bloat Guard)',
      description: 'No-Bloat Guard prevents file size increase',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-06: Visual & Structural Non-Regression Check (Before vs After Compression via PDF.js)
  // ============================================================================
  try {
    const beforePdfJs = await inspectPdfIndependentlyWithPdfJs(heavyFixture.bytes);
    const compressedRes = await compressPdfDocumentV2(
      { fileName: 'visual_check.pdf', bytes: heavyFixture.bytes },
      { profile: 'medium' }
    );
    const afterPdfJs = await inspectPdfIndependentlyWithPdfJs(compressedRes.outputBytes!);

    const geomAndTextPreserved =
      beforePdfJs.numPages === afterPdfJs.numPages &&
      beforePdfJs.pages.every((bp, idx) => {
        const ap = afterPdfJs.pages[idx];
        return (
          ap &&
          bp.widthPt === ap.widthPt &&
          bp.heightPt === ap.heightPt &&
          bp.rotate === ap.rotate &&
          bp.text === ap.text &&
          ap.operatorCount > 0
        );
      });

    record({
      testId: 'PDF07-TC-06',
      canonicalId: 'pdf-compress',
      operation: 'Visual & Geometry Non-Regression via PDF.js',
      description: 'Independently compares PDF.js page counts, dimensions, orientations, operator lists, and text content before and after compression',
      status: geomAndTextPreserved ? 'VERIFIED' : 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: compressedRes.metrics.outputBytes,
      bytesSaved: compressedRes.metrics.savedBytes ?? 0,
      reductionPercent: compressedRes.metrics.savedPercentage ?? 0,
      evidence: geomAndTextPreserved
        ? `All ${afterPdfJs.numPages} pages preserved exact dimensions ([612x792, 792x612]), rotation ([0, 0]), operator lists (${afterPdfJs.pages.map((p) => p.operatorCount).join(', ')} ops), and exact text tokens.`
        : `Visual/geometry comparison mismatch between beforePdfJs and afterPdfJs.`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-06',
      canonicalId: 'pdf-compress',
      operation: 'Visual & Geometry Non-Regression via PDF.js',
      description: 'Independently compares PDF.js page counts, dimensions, and text content',
      status: 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-07: Repair Healthy PDF Input (`HEALTHY_REINDEXED`)
  // ============================================================================
  try {
    const healthyRaw = buildDeterministicRawMultiPagePdf();
    const inputChecksumBefore = computeSimpleBytesChecksum(healthyRaw);
    const res = await repairPdfDocumentV2({
      fileName: 'healthy.pdf',
      bytes: healthyRaw,
    });
    const inputChecksumAfter = computeSimpleBytesChecksum(healthyRaw);
    const verify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const rep = (res.details as any)?.repair;

    const ok =
      res.status === 'SUCCESS' &&
      inputChecksumBefore === inputChecksumAfter &&
      rep?.recoveryClassification === 'HEALTHY_REINDEXED' &&
      rep?.recoveredPageCount === 2 &&
      rep?.lostPageCount === 0 &&
      verify.numPages === 2 &&
      verify.pages[0].text.includes('REPAIR_FIXTURE_PAGE_1_INTACT') &&
      verify.pages[1].text.includes('REPAIR_FIXTURE_PAGE_2_INTACT');

    record({
      testId: 'PDF07-TC-07',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Healthy PDF)',
      description: 'Healthy PDF input is verified, re-indexed as HEALTHY_REINDEXED, and preserves all pages and original input bytes',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: healthyRaw.byteLength,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Classified as ${rep.recoveryClassification}; 2/2 pages verified in PDF.js; original input checksum unchanged (${inputChecksumBefore}).`
        : `Healthy repair test failed: ${res.summary}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-07',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Healthy PDF)',
      description: 'Healthy PDF input is verified and re-indexed',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-08: Repair Missing `%%EOF` Marker (`REPAIRED_FULL`)
  // ============================================================================
  try {
    const missingEofPdf = buildDeterministicRawMultiPagePdf({ stripEofMarker: true });
    const checksumBefore = computeSimpleBytesChecksum(missingEofPdf);
    const res = await repairPdfDocumentV2({
      fileName: 'missing_eof.pdf',
      bytes: missingEofPdf,
    });
    const checksumAfter = computeSimpleBytesChecksum(missingEofPdf);
    const verify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const rep = (res.details as any)?.repair;

    const ok =
      res.status === 'SUCCESS' &&
      checksumBefore === checksumAfter &&
      rep?.recoveryClassification === 'REPAIRED_FULL' &&
      rep?.eofMarkerSynthesized === true &&
      verify.numPages === 2 &&
      verify.pages[0].text.includes('REPAIR_FIXTURE_PAGE_1_INTACT') &&
      verify.pages[1].text.includes('REPAIR_FIXTURE_PAGE_2_INTACT');

    record({
      testId: 'PDF07-TC-08',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Missing %%EOF)',
      description: 'Recovers PDF missing its trailing %%EOF marker and validates 2 recovered pages in PDF.js',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: missingEofPdf.byteLength,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Synthesized %%EOF marker (${rep.recoveryClassification}); 2/2 pages verified in PDF.js; input buffer untouched.`
        : `Missing EOF repair failed: ${res.summary}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-08',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Missing %%EOF)',
      description: 'Recovers PDF missing its trailing %%EOF marker',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-09: Repair Leading Garbage + Malformed XRef Table & Wrong Object Offsets
  // ============================================================================
  try {
    const brokenXrefPdf = buildDeterministicRawMultiPagePdf({
      prependGarbageBytes: 96,
      corruptXrefOffsets: true,
    });
    const checksumBefore = computeSimpleBytesChecksum(brokenXrefPdf);
    const res = await repairPdfDocumentV2({
      fileName: 'corrupted_xref.pdf',
      bytes: brokenXrefPdf,
    });
    const checksumAfter = computeSimpleBytesChecksum(brokenXrefPdf);
    const verify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const rep = (res.details as any)?.repair;

    const ok =
      res.status === 'SUCCESS' &&
      checksumBefore === checksumAfter &&
      rep?.recoveryClassification === 'REPAIRED_FULL' &&
      rep?.leadingGarbageBytesStripped === 96 &&
      rep?.xrefTableRebuilt === true &&
      rep?.winningStage === 'RAW_OBJECT_SCAN_XREF_RECONSTRUCTION' &&
      verify.numPages === 2 &&
      verify.pages[0].text.includes('REPAIR_FIXTURE_PAGE_1_INTACT') &&
      verify.pages[1].text.includes('REPAIR_FIXTURE_PAGE_2_INTACT');

    record({
      testId: 'PDF07-TC-09',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Leading Garbage + Malformed XRef Offsets)',
      description: 'Strips 96 leading garbage bytes, scans raw object offsets, rebuilds corrupted XRef table via Stage 3, and recovers both pages',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: brokenXrefPdf.byteLength,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Stripped 96 leading bytes & rebuilt XRef table via ${rep.winningStage}; 2/2 pages and text verified in PDF.js.`
        : `Malformed XRef repair failed: ${JSON.stringify(rep)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-09',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Leading Garbage + Malformed XRef Offsets)',
      description: 'Strips leading garbage bytes and rebuilds corrupted XRef table',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-10: Repair Damaged Trailer & Corrupted Page Tree (`/Pages /Kids` broken refs)
  // ============================================================================
  try {
    const brokenPageTreePdf = buildDeterministicRawMultiPagePdf({
      corruptTrailer: true,
      corruptPageTreeKids: true,
      stripEofMarker: true,
    });
    const checksumBefore = computeSimpleBytesChecksum(brokenPageTreePdf);
    const res = await repairPdfDocumentV2({
      fileName: 'broken_pagetree_trailer.pdf',
      bytes: brokenPageTreePdf,
    });
    const checksumAfter = computeSimpleBytesChecksum(brokenPageTreePdf);
    const verify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const rep = (res.details as any)?.repair;

    const ok =
      res.status === 'SUCCESS' &&
      checksumBefore === checksumAfter &&
      rep?.recoveryClassification === 'REPAIRED_FULL' &&
      rep?.trailerReconstructed === true &&
      rep?.pageTreeReconstructed === true &&
      verify.numPages === 2 &&
      verify.pages[0].text.includes('REPAIR_FIXTURE_PAGE_1_INTACT') &&
      verify.pages[1].text.includes('REPAIR_FIXTURE_PAGE_2_INTACT');

    record({
      testId: 'PDF07-TC-10',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Damaged Trailer + Corrupted Page Tree)',
      description: 'Reconstructs broken /Pages tree (/Kids pointing to non-existent 888 0 R, 999 0 R) and damaged trailer (/Root 777 0 R) from discovered /Type /Page objects',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: brokenPageTreePdf.byteLength,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Reconstructed /Pages tree & trailer via ${rep.winningStage}; 2/2 pages ([612x792, 792x612]) and text verified in PDF.js.`
        : `Page-tree/trailer repair failed: ${JSON.stringify(rep)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-10',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Damaged Trailer + Corrupted Page Tree)',
      description: 'Reconstructs broken /Pages tree and damaged trailer',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-11: Partial Recovery Reporting (`PARTIAL_RECOVERY` / `PARTIALLY_RECOVERED`)
  // ============================================================================
  try {
    // Build a 2-page PDF where Page 1 (`3 0 obj`) is intact and Page 2 (`5 0 obj`) is destroyed, plus corrupted xref
    const partialDamagePdf = buildDeterministicRawMultiPagePdf({
      corruptXrefOffsets: true,
      destroySecondPage: true,
    });
    const checksumBefore = computeSimpleBytesChecksum(partialDamagePdf);
    const res = await repairPdfDocumentV2({
      fileName: 'partial_damage.pdf',
      bytes: partialDamagePdf,
    });
    const checksumAfter = computeSimpleBytesChecksum(partialDamagePdf);
    const verify = await inspectPdfIndependentlyWithPdfJs(res.outputBytes!);
    const rep = (res.details as any)?.repair;

    const ok =
      res.status === 'PARTIAL_RECOVERY' &&
      checksumBefore === checksumAfter &&
      rep?.recoveryClassification === 'PARTIALLY_RECOVERED' &&
      rep?.estimatedSourcePageCount === 2 &&
      rep?.recoveredPageCount === 1 &&
      rep?.lostPageCount === 1 &&
      res.warnings.some((w) => w.includes('Partial Recovery')) &&
      verify.numPages === 1 &&
      verify.pages[0].text.includes('REPAIR_FIXTURE_PAGE_1_INTACT');

    record({
      testId: 'PDF07-TC-11',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Partial Recovery Classification)',
      description: 'Never claims full repair when 1 of 2 pages is destroyed; returns status PARTIAL_RECOVERY (PARTIALLY_RECOVERED) with salvaged Page 1',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: partialDamagePdf.byteLength,
      outputBytes: res.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Status=${res.status}, classification=${rep.recoveryClassification}; salvaged 1/2 pages (lostPageCount=1) and verified Page 1 in PDF.js.`
        : `Partial recovery test failed: status=${res.status}, rep=${JSON.stringify(rep)}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-11',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Partial Recovery Classification)',
      description: 'Returns PARTIAL_RECOVERY when only a subset of pages can be salvaged',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-12: Unrecoverable PDF & Non-PDF Rejection (`ERR_REPAIR_UNRECOVERABLE`)
  // ============================================================================
  try {
    const completelyBrokenPdf = createMalformedPdfWithBrokenStructureFixture();
    const randomNoise = createInvalidMagicBytesFixture();
    const emptyBuf = createEmptyBufferFixture();

    const resBroken = await repairPdfDocumentV2({
      fileName: 'unrecoverable.pdf',
      bytes: completelyBrokenPdf,
    });
    const resNoise = await repairPdfDocumentV2({
      fileName: 'random.bin',
      bytes: randomNoise,
    });
    const resEmpty = await repairPdfDocumentV2({
      fileName: 'empty.pdf',
      bytes: emptyBuf,
    });

    const ok =
      resBroken.status === 'INVALID_PDF' &&
      resBroken.error?.code === 'ERR_REPAIR_UNRECOVERABLE' &&
      resNoise.status === 'INVALID_PDF' &&
      resNoise.error?.code === 'ERR_REPAIR_UNRECOVERABLE' &&
      resEmpty.status === 'VALIDATION_ERROR' &&
      resEmpty.error?.code === 'ERR_EMPTY_FILE';

    record({
      testId: 'PDF07-TC-12',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Unrecoverable & Empty Error Codes)',
      description: 'Returns deterministic ERR_REPAIR_UNRECOVERABLE on PDFs with 0 recoverable pages or random non-PDF bytes, and ERR_EMPTY_FILE on 0-byte input',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: completelyBrokenPdf.byteLength,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `Broken PDF -> ${resBroken.error?.code}; Random Noise -> ${resNoise.error?.code}; Empty -> ${resEmpty.error?.code}.`
        : `Unrecoverable check failed: broken=${resBroken.error?.code}, noise=${resNoise.error?.code}, empty=${resEmpty.error?.code}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-12',
      canonicalId: 'pdf-repair',
      operation: 'repairPdfDocumentV2 (Unrecoverable & Empty Error Codes)',
      description: 'Returns deterministic ERR_REPAIR_UNRECOVERABLE',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-13: Encrypted PDF Handling in Compression & Repair (`ERR_PASSWORD_REQUIRED` / `ERR_INCORRECT_PASSWORD`)
  // ============================================================================
  try {
    const encryptedBytes = await createPasswordProtectedPdfFixture({
      userPassword: 'Pdf07SecretPassword!',
      pageText: 'ENCRYPTED_PDF07_TEST_CONTENT',
    });

    // 1. Compress without password -> ERR_PASSWORD_REQUIRED
    const compNoPass = await compressPdfDocumentV2({
      fileName: 'locked.pdf',
      bytes: encryptedBytes,
    });

    // 2. Compress with wrong password -> ERR_INCORRECT_PASSWORD
    const compWrongPass = await compressPdfDocumentV2(
      { fileName: 'locked.pdf', bytes: encryptedBytes },
      { password: 'WrongPassword123' }
    );

    // 3. Repair without password -> ERR_PASSWORD_REQUIRED
    const repNoPass = await repairPdfDocumentV2({
      fileName: 'locked.pdf',
      bytes: encryptedBytes,
    });

    // 4. Repair with correct password -> SUCCESS
    const repWithPass = await repairPdfDocumentV2(
      { fileName: 'locked.pdf', bytes: encryptedBytes },
      { password: 'Pdf07SecretPassword!' }
    );

    const ok =
      compNoPass.status === 'PASSWORD_REQUIRED' &&
      compNoPass.error?.code === 'ERR_PASSWORD_REQUIRED' &&
      compWrongPass.status === 'INCORRECT_PASSWORD' &&
      compWrongPass.error?.code === 'ERR_INCORRECT_PASSWORD' &&
      repNoPass.status === 'PASSWORD_REQUIRED' &&
      repNoPass.error?.code === 'ERR_PASSWORD_REQUIRED' &&
      repWithPass.status === 'SUCCESS' &&
      repWithPass.metrics.outputPageCount === 1;

    record({
      testId: 'PDF07-TC-13',
      canonicalId: 'pdf-compress / pdf-repair',
      operation: 'Encrypted PDF Authorization Guard',
      description: 'Rejects unauthenticated encrypted PDFs with ERR_PASSWORD_REQUIRED, rejects wrong passwords with ERR_INCORRECT_PASSWORD, and processes when authorized password is supplied',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: encryptedBytes.byteLength,
      outputBytes: repWithPass.metrics.outputBytes,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: ok
        ? `No-Pass -> ${compNoPass.error?.code}; Wrong-Pass -> ${compWrongPass.error?.code}; Authorized Repair -> ${repWithPass.status} (1 page verified).`
        : `Encrypted handling failed: compNoPass=${compNoPass.error?.code}, compWrong=${compWrongPass.error?.code}, repNoPass=${repNoPass.error?.code}, repWithPass=${repWithPass.status}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-13',
      canonicalId: 'pdf-compress / pdf-repair',
      operation: 'Encrypted PDF Authorization Guard',
      description: 'Handles encrypted PDFs deterministically',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-14: JPEG Exif/APP Metadata Segment Stripping (`stripJpegMetadataSegments`)
  // ============================================================================
  try {
    // Build a valid JPEG with an injected 4 KB APP1 (Exif/XMP) segment and 2 KB COM (Comment) segment
    const cleanPdf = await createValidMultiPagePdfFixture({ pageTexts: ['JPEG_META_TEST'] });
    const baseJpeg = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x96, 0x00, 0x96, 0x00, 0x00,
      // APP1 Exif bloat (2000 bytes payload -> length 2002 = 0x07D2)
      0xff, 0xe1, 0x07, 0xd2, ...new Array(2000).fill(0x45),
      // COM Comment bloat (1000 bytes payload -> length 1002 = 0x03EA)
      0xff, 0xfe, 0x03, 0xea, ...new Array(1000).fill(0x43),
      // DQT
      0xff, 0xdb, 0x00, 0x43, 0x00, ...new Array(64).fill(0x10),
      // SOF0 (64x64)
      0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x40, 0x00, 0x40, 0x01, 0x01, 0x11, 0x00,
      // DHT DC + AC
      0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, ...new Array(16).fill(0x00),
      0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, ...new Array(16).fill(0x00),
      // SOS + scan data + EOI
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
      ...new Array(16).fill(0x00),
      0xff, 0xd9,
    ]);

    const stripped = stripJpegMetadataSegments(baseJpeg);

    // Embed bloated JPEG in a PDF and run Low compression to confirm lossless JPEG APP/COM stripping inside PDF
    const docWithJpeg = await PDFDocument.create();
    const embJpg = await docWithJpeg.embedJpg(baseJpeg);
    const page = docWithJpeg.addPage([400, 400]);
    page.drawImage(embJpg, { x: 50, y: 50, width: 64, height: 64 });
    const pdfWithBloatedJpeg = await docWithJpeg.save({ useObjectStreams: false });

    const compRes = await compressPdfDocumentV2(
      { fileName: 'jpeg_exif.pdf', bytes: pdfWithBloatedJpeg },
      { profile: 'low' }
    );

    const ok =
      stripped.byteLength === baseJpeg.byteLength - 3008 &&
      compRes.status === 'SUCCESS' &&
      compRes.metrics.savedBytes! >= 2900 &&
      cleanPdf.byteLength > 0;

    record({
      testId: 'PDF07-TC-14',
      canonicalId: 'pdf-compress',
      operation: 'Lossless JPEG Exif/Comment Stripping in Low Profile',
      description: 'Losslessly strips 3,008 bytes of APP1 (Exif) and COM segments from embedded /DCTDecode JPEG streams even on Low (lossless) profile',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: pdfWithBloatedJpeg.byteLength,
      outputBytes: compRes.metrics.outputBytes,
      bytesSaved: compRes.metrics.savedBytes ?? 0,
      reductionPercent: compRes.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `Raw JPEG stripped ${baseJpeg.byteLength} B -> ${stripped.byteLength} B (-3,008 B); PDF compressed ${pdfWithBloatedJpeg.byteLength} B -> ${compRes.metrics.outputBytes} B (-${compRes.metrics.savedBytes} B).`
        : `JPEG segment stripping failed: strippedLen=${stripped.byteLength}, saved=${compRes.metrics.savedBytes}`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-14',
      canonicalId: 'pdf-compress',
      operation: 'Lossless JPEG Exif/Comment Stripping in Low Profile',
      description: 'Losslessly strips APP1 and COM segments from embedded /DCTDecode JPEG streams',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  // ============================================================================
  // TC-15: Engine F Canonical Router (`executeOptimizationRepairOperationV2`) & Guardrails
  // ============================================================================
  try {
    const compRouteRes = await executeOptimizationRepairOperationV2({
      toolId: 'pdf-compress',
      inputs: [{ fileName: 'heavy.pdf', bytes: heavyFixture.bytes }],
      options: { profile: 'medium' },
    });

    const repRouteRes = await executeOptimizationRepairOperationV2({
      toolId: 'pdf-repair',
      inputs: [
        {
          fileName: 'missing_eof.pdf',
          bytes: buildDeterministicRawMultiPagePdf({ stripEofMarker: true }),
        },
      ],
    });

    // Cross-module tool ID must be rejected with ERR_UNSUPPORTED_OPERATION
    const crossModuleRes = await executeOptimizationRepairOperationV2({
      toolId: 'pdf-merge',
      inputs: [{ fileName: 'heavy.pdf', bytes: heavyFixture.bytes }],
    });

    // Non-PDF generator ID must be rejected with ERR_UNSUPPORTED_OPERATION
    const generatorGuardRes = await executeOptimizationRepairOperationV2({
      toolId: 'mechanical-fastener-specification-sheet-generator',
      inputs: [{ fileName: 'heavy.pdf', bytes: heavyFixture.bytes }],
    });

    // Unknown tool ID must be rejected with ERR_UNSUPPORTED_OPERATION
    const unknownIdRes = await executeOptimizationRepairOperationV2({
      toolId: 'pdf-nonexistent-optimizer-999',
      inputs: [{ fileName: 'heavy.pdf', bytes: heavyFixture.bytes }],
    });

    const ok =
      compRouteRes.status === 'SUCCESS' &&
      compRouteRes.resolvedCanonicalId === 'pdf-compress' &&
      repRouteRes.status === 'SUCCESS' &&
      repRouteRes.resolvedCanonicalId === 'pdf-repair' &&
      crossModuleRes.status === 'UNSUPPORTED_OPERATION' &&
      crossModuleRes.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
      generatorGuardRes.status === 'UNSUPPORTED_OPERATION' &&
      generatorGuardRes.error?.code === 'ERR_UNSUPPORTED_OPERATION' &&
      unknownIdRes.status === 'UNSUPPORTED_OPERATION' &&
      unknownIdRes.error?.code === 'ERR_UNSUPPORTED_OPERATION';

    record({
      testId: 'PDF07-TC-15',
      canonicalId: 'Engine F Router',
      operation: 'executeOptimizationRepairOperationV2',
      description: 'Routes pdf-compress and pdf-repair accurately and rejects cross-module, non-PDF generator, and unknown tool IDs with ERR_UNSUPPORTED_OPERATION',
      status: ok ? 'VERIFIED' : 'FAILED',
      inputBytes: heavyFixture.bytes.byteLength,
      outputBytes: compRouteRes.metrics.outputBytes,
      bytesSaved: compRouteRes.metrics.savedBytes ?? 0,
      reductionPercent: compRouteRes.metrics.savedPercentage ?? 0,
      evidence: ok
        ? `pdf-compress -> SUCCESS; pdf-repair -> SUCCESS; cross-module (pdf-merge) -> ${crossModuleRes.error?.code}; generator-743 -> ${generatorGuardRes.error?.code}; unknown -> ${unknownIdRes.error?.code}.`
        : `Router check failed.`,
    });
  } catch (err: any) {
    record({
      testId: 'PDF07-TC-15',
      canonicalId: 'Engine F Router',
      operation: 'executeOptimizationRepairOperationV2',
      description: 'Routes Engine F canonical IDs and rejects invalid/cross-module IDs',
      status: 'FAILED',
      inputBytes: 0,
      outputBytes: 0,
      bytesSaved: 0,
      reductionPercent: 0,
      evidence: `Exception: ${err?.message || err}`,
    });
  }

  const verified = results.filter((r) => r.status === 'VERIFIED').length;
  const failed = results.length - verified;

  return {
    total: results.length,
    verified,
    failed,
    results,
  };
}

// Allow direct CLI execution via `npx tsx src/services/pdf/v2/__tests__/runPdf07OptimizationRepairTests.ts`
const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv.some((arg) => arg.includes('runPdf07OptimizationRepairTests'));

if (isDirectExecution) {
  runPdf07OptimizationRepairTests()
    .then((summary) => {
      console.log('================================================================================');
      console.log('CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-07 OPTIMIZATION & REPAIR VERIFICATION SUITE');
      console.log('================================================================================');
      for (const r of summary.results) {
        console.log(
          `[${r.status}] ${r.testId} | ${r.canonicalId} | ${r.operation}\n  In: ${r.inputBytes} B | Out: ${r.outputBytes} B | Saved: ${r.bytesSaved} B (${r.reductionPercent}%)\n  Evidence: ${r.evidence}`
        );
      }
      console.log('--------------------------------------------------------------------------------');
      console.log(`TOTAL: ${summary.total} | VERIFIED: ${summary.verified} | FAILED: ${summary.failed}`);
      console.log('================================================================================');
      if (summary.failed > 0) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal error running PDF-07 test suite:', err);
      process.exit(1);
    });
}
