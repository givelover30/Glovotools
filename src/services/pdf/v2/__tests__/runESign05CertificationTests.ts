/**
 * GLOVOTOOLS — ESIGN-05: Automated Engine, Lifecycle, Memory, Security,
 * Integrity, Rotation, Localization & 50-Page Stress Certification Suite.
 *
 * Run via: npx tsx src/services/pdf/v2/__tests__/runESign05CertificationTests.ts
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';

import {
  applyESignatureElementsToPdfV2,
  ESIGNATURE_OPERATION_REGISTRY,
  extractPdfMetadataForESign,
  formatESignDate,
  transformVisualRectToPdfSpace,
  validateSignatureImageBytes,
  ESignPlacedElement
} from '../pdfESignatureEngine.ts';
import { pdfLifecycleManager } from '../pdfLifecycle.ts';
import { PDF_TOOL_OPERATION_REGISTRY } from '../pdfRegistry.ts';
import { verifyPdfOutputIntegrity } from '../pdfOutputIntegrity.ts';
import {
  ESIGNATURE_CANONICAL_IDS,
  TOOL_CLASSIFICATION_REGISTRY,
  resolveESignatureClassification
} from '../../../../data/toolClassification.ts';
import { PHASE25_METADATA, PHASE25_SUBCATEGORIES } from '../../../../data/catalog/phase25_pdf_tools_expansion.ts';
import { PDF_TOOL_ICON_MAP } from '../../../../components/common/pdfIconRegistry.ts';
import { ESIGN_TRANSLATIONS, getESignText } from '../../../../i18n/esignTranslations.ts';
import { TRANSLATIONS, getLocalizedSubcategory, Language } from '../../../../i18n/translations.ts';
import { getLocalizedCalculator } from '../../../../i18n/esTranslations.ts';

interface TestResult {
  name: string;
  section: string;
  passed: boolean;
  durationMs: number;
  detail?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(section: string, name: string, fn: () => Promise<void> | void): Promise<void> {
  const t0 = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    results.push({ name, section, passed: true, durationMs });
    console.log(`  [PASS] [${section}] ${name} (${durationMs} ms)`);
  } catch (err: unknown) {
    const durationMs = Math.round((performance.now() - t0) * 100) / 100;
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, section, passed: false, durationMs, error: message });
    console.error(`  [FAIL] [${section}] ${name} (${durationMs} ms): ${message}`);
  }
}

function assertLifecycleZero(context: string): void {
  const activeCount = pdfLifecycleManager.getActiveSessionCount();
  const activeBytes = pdfLifecycleManager.getActiveTotalBytes();
  assert.equal(
    activeCount,
    0,
    `Expected pdfLifecycleManager.getActiveSessionCount() === 0 after ${context}, got ${activeCount}`
  );
  assert.equal(
    activeBytes,
    0,
    `Expected pdfLifecycleManager.getActiveTotalBytes() === 0 after ${context}, got ${activeBytes}`
  );
}

function sha256(bytes: Uint8Array): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length, false);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  const crcInput = out.subarray(4, 8 + data.length);
  view.setUint32(8 + data.length, crc32(crcInput), false);
  return out;
}

/** Generates a real valid RGBA PNG (transparent background with a visible blue diagonal stroke). */
function createValidTestPng(width = 64, height = 24): Uint8Array {
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = 1 + width * 4;
  const raw = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const idx = y * stride + 1 + x * 4;
      const dist = Math.abs(y - (height * 0.5 + Math.sin(x * 0.25) * 6));
      if (dist <= 2.2) {
        raw[idx] = 29;
        raw[idx + 1] = 78;
        raw[idx + 2] = 216;
        raw[idx + 3] = 255;
      } else {
        raw[idx] = 0;
        raw[idx + 1] = 0;
        raw[idx + 2] = 0;
        raw[idx + 3] = 0;
      }
    }
  }
  const compressed = new Uint8Array(zlib.deflateSync(raw));
  const c1 = pngChunk('IHDR', ihdr);
  const c2 = pngChunk('IDAT', compressed);
  const c3 = pngChunk('IEND', new Uint8Array(0));
  const full = new Uint8Array(sig.length + c1.length + c2.length + c3.length);
  let off = 0;
  for (const part of [sig, c1, c2, c3]) {
    full.set(part, off);
    off += part.length;
  }
  return full;
}

/** Minimal valid 1x1 baseline JPEG bytes (verified decodable by pdf-lib & browsers). */
function createValidTestJpeg(): Uint8Array {
  const b64 =
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

async function createMultiPagePdf(
  pageCount: number,
  options?: { rotations?: number[]; cropOffset?: boolean; password?: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([612, 792]);
    const rot = options?.rotations?.[i] ?? 0;
    if (rot !== 0) {
      page.setRotation(degrees(rot));
    }
    if (options?.cropOffset) {
      page.setCropBox(36, 48, 540, 720);
    }
    page.drawText(`Glovotools ESIGN-05 Test Page ${i + 1} of ${pageCount}`, {
      x: 72,
      y: 720,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1)
    });
  }
  if (options?.password) {
    await doc.encrypt({
      userPassword: options.password,
      ownerPassword: `${options.password}-owner`,
      permissions: { printing: 'highResolution', modifying: true }
    });
  }
  return new Uint8Array(await doc.save());
}

async function main() {
  console.log('\n====================================================================');
  console.log('  GLOVOTOOLS ESIGN-05 AUTOMATED CERTIFICATION TEST SUITE');
  console.log('====================================================================\n');

  const validPng = createValidTestPng(96, 32);
  const validJpeg = createValidTestJpeg();
  const pdf3Page = await createMultiPagePdf(3);
  const pdf4Rotated = await createMultiPagePdf(4, { rotations: [0, 90, 180, 270] });
  const pdfCropped = await createMultiPagePdf(1, { cropOffset: true });
  const pdfEncrypted = await createMultiPagePdf(2, { password: 'esign-secret-2026' });

  // =========================================================================
  // SECTION 1: MEMORY MANAGEMENT, LIFECYCLE & SIGNATURE IMAGE VALIDATION
  // =========================================================================
  await runTest('1.2', 'validateSignatureImageBytes accepts valid PNG and JPEG', () => {
    const pngRes = validateSignatureImageBytes(validPng, 'sig.png');
    assert.equal(pngRes.isValid, true);
    assert.equal(pngRes.format, 'png');
    assert.equal(pngRes.width, 96);
    assert.equal(pngRes.height, 32);

    const jpgRes = validateSignatureImageBytes(validJpeg, 'sig.jpg');
    assert.equal(jpgRes.isValid, true);
    assert.equal(jpgRes.format, 'jpeg');
    assert.equal(jpgRes.width, 1);
    assert.equal(jpgRes.height, 1);
    assertLifecycleZero('valid image checks');
  });

  await runTest('1.2', 'validateSignatureImageBytes rejects corrupt/truncated PNG, corrupt JPEG, spoofed extension, empty & unsupported formats with ERR_UNSUPPORTED_IMAGE_FORMAT', () => {
    const badCases: Array<{ label: string; bytes: Uint8Array; name: string }> = [
      { label: 'empty 0-byte image', bytes: new Uint8Array(0), name: 'empty.png' },
      { label: 'corrupt PNG truncated after header', bytes: validPng.slice(0, 20), name: 'trunc.png' },
      { label: 'corrupt PNG missing IEND', bytes: validPng.slice(0, validPng.length - 12), name: 'no_iend.png' },
      {
        label: 'corrupt PNG bad IHDR dimensions (0x0)',
        bytes: (() => {
          const copy = validPng.slice();
          copy[16] = copy[17] = copy[18] = copy[19] = 0;
          return copy;
        })(),
        name: 'zero_dim.png'
      },
      { label: 'corrupt JPEG truncated without EOI', bytes: validJpeg.slice(0, validJpeg.length - 4), name: 'trunc.jpg' },
      { label: 'corrupt JPEG header only', bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), name: 'hdr.jpg' },
      {
        label: 'misleading extension (TXT renamed .png)',
        bytes: new TextEncoder().encode('This is plain text pretending to be a PNG signature.'),
        name: 'fake_signature.png'
      },
      {
        label: 'unsupported GIF image',
        bytes: new TextEncoder().encode('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!'),
        name: 'anim.gif'
      },
      {
        label: 'unsupported SVG markup',
        bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        name: 'xss.svg'
      },
      { label: 'PDF bytes passed as signature image', bytes: pdf3Page.slice(0, 128), name: 'doc.png' }
    ];

    for (const c of badCases) {
      const r = validateSignatureImageBytes(c.bytes, c.name);
      assert.equal(r.isValid, false, `Expected rejection for ${c.label}`);
      assert.equal(
        r.error?.code,
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        `Expected ERR_UNSUPPORTED_IMAGE_FORMAT for ${c.label}, got ${r.error?.code}`
      );
    }
    assertLifecycleZero('invalid image validation checks');
  });

  await runTest('1.1', 'Lifecycle count returns to 0 after invalid/empty/corrupt/aborted/invalid-image/invalid-page PDF operations', async () => {
    const baseElement: ESignPlacedElement = {
      id: 'el-1',
      kind: 'signature',
      pageNumber: 1,
      rect: { u: 0.1, v: 0.7, w: 0.25, h: 0.08 },
      imageBytes: validPng,
      assetKey: 'sig-main'
    };

    // 1. Empty PDF
    const rEmpty = await applyESignatureElementsToPdfV2(
      { fileName: 'empty.pdf', bytes: new Uint8Array(0) },
      { canonicalId: 'sign-pdf', elements: [baseElement] }
    );
    assert.notEqual(rEmpty.status, 'SUCCESS');
    assert.equal(rEmpty.error?.code, 'ERR_EMPTY_FILE');
    assertLifecycleZero('empty PDF');

    // 2. Corrupt PDF
    const rCorrupt = await applyESignatureElementsToPdfV2(
      { fileName: 'corrupt.pdf', bytes: new TextEncoder().encode('%PDF-1.7\ncorrupted-garbage-not-valid-xref') },
      { canonicalId: 'sign-pdf', elements: [baseElement] }
    );
    assert.notEqual(rCorrupt.status, 'SUCCESS');
    assertLifecycleZero('corrupt PDF');

    // 3. Non-PDF disguised as .pdf
    const rFakePdf = await applyESignatureElementsToPdfV2(
      { fileName: 'not_a_pdf.pdf', bytes: new TextEncoder().encode('<html><body>Hello</body></html>') },
      { canonicalId: 'sign-pdf', elements: [baseElement] }
    );
    assert.notEqual(rFakePdf.status, 'SUCCESS');
    assertLifecycleZero('non-PDF disguised as .pdf');

    // 4. Invalid signature image passed to engine
    const rBadImg = await applyESignatureElementsToPdfV2(
      { fileName: 'contract.pdf', bytes: pdf3Page },
      {
        canonicalId: 'sign-pdf',
        elements: [{ ...baseElement, imageBytes: new TextEncoder().encode('not-png'), assetKey: 'bad.png' }]
      }
    );
    assert.notEqual(rBadImg.status, 'SUCCESS');
    assert.equal(rBadImg.error?.code, 'ERR_UNSUPPORTED_IMAGE_FORMAT');
    assertLifecycleZero('invalid signature image in engine');

    // 5. Out-of-bounds target page number
    const rBadPage = await applyESignatureElementsToPdfV2(
      { fileName: 'contract.pdf', bytes: pdf3Page },
      { canonicalId: 'sign-pdf', elements: [{ ...baseElement, pageNumber: 99 }] }
    );
    assert.notEqual(rBadPage.status, 'SUCCESS');
    assert.equal(rBadPage.error?.code, 'ERR_INVALID_PAGE_RANGE');
    assertLifecycleZero('invalid page range');

    // 6. Empty elements array
    const rNoElements = await applyESignatureElementsToPdfV2(
      { fileName: 'contract.pdf', bytes: pdf3Page },
      { canonicalId: 'sign-pdf', elements: [] }
    );
    assert.notEqual(rNoElements.status, 'SUCCESS');
    assertLifecycleZero('empty elements');

    // 7. Cancelled AbortSignal
    const ac = new AbortController();
    ac.abort();
    const rAborted = await applyESignatureElementsToPdfV2(
      { fileName: 'contract.pdf', bytes: pdf3Page },
      { canonicalId: 'sign-pdf', elements: [baseElement], signal: ac.signal }
    );
    assert.notEqual(rAborted.status, 'SUCCESS');
    assert.equal(rAborted.error?.code, 'ERR_OPERATION_ABORTED');
    assertLifecycleZero('cancelled signal');
  });

  // =========================================================================
  // SECTION 2, 3, 4 & 9: MULTI-ELEMENT, MULTI-PAGE, IMMUTABILITY & INTEGRITY
  // =========================================================================
  await runTest('2/3/9', 'All 5 element types (signature, initials, date, text, checkmark) across multi-page PDF with deduplication & input immutability', async () => {
    const inputCopy = pdf3Page.slice();
    const inputHashBefore = sha256(inputCopy);

    const elements: ESignPlacedElement[] = [
      {
        id: 'sig-p1',
        kind: 'signature',
        pageNumber: 1,
        rect: { u: 0.12, v: 0.72, w: 0.28, h: 0.09 },
        imageBytes: validPng,
        assetKey: 'shared-sig-png'
      },
      {
        id: 'sig-p2',
        kind: 'signature',
        pageNumber: 2,
        rect: { u: 0.55, v: 0.72, w: 0.28, h: 0.09 },
        imageBytes: validPng,
        assetKey: 'shared-sig-png'
      },
      {
        id: 'init-p2',
        kind: 'initials',
        pageNumber: 2,
        rect: { u: 0.12, v: 0.5, w: 0.12, h: 0.06 },
        imageBytes: validJpeg,
        assetKey: 'shared-init-jpg'
      },
      {
        id: 'date-p2',
        kind: 'date',
        pageNumber: 2,
        rect: { u: 0.3, v: 0.5, w: 0.2, h: 0.04 },
        text: formatESignDate(new Date('2026-11-24T12:00:00Z'), 'iso'),
        dateFormat: 'iso',
        fontSizePt: 12,
        color: '#0F172A'
      },
      {
        id: 'text-p3',
        kind: 'text',
        pageNumber: 3,
        rect: { u: 0.12, v: 0.35, w: 0.4, h: 0.05 },
        text: 'Approved by QA Certification',
        fontSizePt: 13,
        fontFamily: 'HelveticaBold',
        color: '#1D4ED8'
      },
      {
        id: 'check-p3',
        kind: 'checkmark',
        pageNumber: 3,
        rect: { u: 0.65, v: 0.35, w: 0.04, h: 0.03 },
        color: '#16A34A'
      }
    ];

    const res = await applyESignatureElementsToPdfV2(
      { fileName: 'agreement_3p.pdf', bytes: inputCopy },
      { canonicalId: 'fill-and-sign', elements }
    );
    assertLifecycleZero('multi-element fill-and-sign');

    assert.equal(res.status, 'SUCCESS', `Expected SUCCESS, got ${res.status}: ${res.summary}`);
    assert.ok(res.primaryFile, 'primaryFile must be present');
    assert.equal(res.primaryFile.mimeType, 'application/pdf');
    assert.equal(res.primaryFile.fileName, 'agreement_3p_filled_signed.pdf');
    assert.equal(res.primaryFile.pageCount, 3);
    assert.equal(res.details?.embeddedUniqueImages, 2, 'Shared PNG signature must be deduplicated once');
    assert.deepEqual(res.details?.modifiedPageNumbers, [1, 2, 3]);

    // Original input buffer untouched
    assert.equal(sha256(inputCopy), inputHashBefore, 'Input bytes must never be mutated');

    // Output starts with %PDF- and passes independent PDF.js + pdf-lib verification
    const header = new TextDecoder().decode(res.primaryFile.bytes.slice(0, 5));
    assert.equal(header, '%PDF-');
    const integrity = await verifyPdfOutputIntegrity(res.primaryFile.bytes, {
      expectedPageCount: 3,
      verifyWithPdfJs: true
    });
    assert.equal(integrity.isValid, true, `Output integrity failed: ${integrity.error?.message}`);
    assert.equal(integrity.hasValidMagicHeader, true);
    assert.equal(integrity.hasEofMarker, true);
    assert.equal(integrity.reopenedWithPdfJs, true);
    assert.equal(integrity.verifiedPageCount, 3);

    // Verify page dimensions preserved
    const reopened = await PDFDocument.load(res.primaryFile.bytes);
    for (let i = 0; i < 3; i++) {
      const sz = reopened.getPage(i).getSize();
      assert.equal(Math.round(sz.width), 612);
      assert.equal(Math.round(sz.height), 792);
    }
  });

  // =========================================================================
  // SECTION 9: ROTATION (0°, 90°, 180°, 270°) & CROPBOX ACCURACY
  // =========================================================================
  await runTest('9', 'transformVisualRectToPdfSpace accurately maps 0°, 90°, 180°, 270° rotations and /CropBox offsets', async () => {
    const box = { x: 36, y: 48, width: 540, height: 720 };
    const rect = { u: 0.1, v: 0.2, w: 0.3, h: 0.1 };

    const m0 = transformVisualRectToPdfSpace(rect, box, 0);
    assert.equal(m0.rotateDegrees, 0);
    assert.ok(Math.abs(m0.x - (36 + 0.1 * 540)) < 1e-6);
    assert.ok(Math.abs(m0.y - (48 + (1 - 0.3) * 720)) < 1e-6);
    assert.ok(Math.abs(m0.width - 0.3 * 540) < 1e-6);
    assert.ok(Math.abs(m0.height - 0.1 * 720) < 1e-6);

    const m90 = transformVisualRectToPdfSpace(rect, box, 90);
    assert.equal(m90.rotateDegrees, 90);
    assert.ok(Math.abs(m90.x - (36 + 0.3 * 540)) < 1e-6);
    assert.ok(Math.abs(m90.y - (48 + 0.1 * 720)) < 1e-6);
    assert.ok(Math.abs(m90.width - 0.3 * 720) < 1e-6);
    assert.ok(Math.abs(m90.height - 0.1 * 540) < 1e-6);

    const m180 = transformVisualRectToPdfSpace(rect, box, 180);
    assert.equal(m180.rotateDegrees, 180);
    assert.ok(Math.abs(m180.x - (36 + 0.9 * 540)) < 1e-6);
    assert.ok(Math.abs(m180.y - (48 + 0.3 * 720)) < 1e-6);

    const m270 = transformVisualRectToPdfSpace(rect, box, 270);
    assert.equal(m270.rotateDegrees, -90);
    assert.ok(Math.abs(m270.x - (36 + 0.7 * 540)) < 1e-6);
    assert.ok(Math.abs(m270.y - (48 + 0.9 * 720)) < 1e-6);
    assert.ok(Math.abs(m270.width - 0.3 * 720) < 1e-6);
    assert.ok(Math.abs(m270.height - 0.1 * 540) < 1e-6);

    // Stamp all 4 rotated pages & cropped page and verify output integrity
    const rotElements: ESignPlacedElement[] = [1, 2, 3, 4].map((p) => ({
      id: `rot-sig-${p}`,
      kind: 'signature',
      pageNumber: p,
      rect: { u: 0.15, v: 0.15, w: 0.25, h: 0.1 },
      imageBytes: validPng,
      assetKey: 'rot-sig'
    }));
    const rotRes = await applyESignatureElementsToPdfV2(
      { fileName: 'rotated_4p.pdf', bytes: pdf4Rotated },
      { canonicalId: 'sign-pdf', elements: rotElements }
    );
    assertLifecycleZero('4-page rotated signing');
    assert.equal(rotRes.status, 'SUCCESS');
    assert.equal(rotRes.primaryFile?.pageCount, 4);

    // Verify rotations were preserved on every output page
    const outDoc = await PDFDocument.load(rotRes.primaryFile!.bytes);
    assert.deepEqual(
      [0, 1, 2, 3].map((idx) => outDoc.getPage(idx).getRotation().angle),
      [0, 90, 180, 270]
    );

    // Cropped page signing
    const cropRes = await applyESignatureElementsToPdfV2(
      { fileName: 'cropped_1p.pdf', bytes: pdfCropped },
      {
        canonicalId: 'sign-pdf',
        elements: [
          {
            id: 'crop-sig',
            kind: 'signature',
            pageNumber: 1,
            rect: { u: 0.2, v: 0.7, w: 0.3, h: 0.1 },
            imageBytes: validPng,
            assetKey: 'crop-sig'
          }
        ]
      }
    );
    assertLifecycleZero('cropped PDF signing');
    assert.equal(cropRes.status, 'SUCCESS');
  });

  // =========================================================================
  // SECTION 8: SECURITY & PASSWORD-PROTECTED PDF HANDLING
  // =========================================================================
  await runTest('8', 'Password-protected PDF requires password, rejects wrong password, succeeds with right password, 0 leaked sessions', async () => {
    const el: ESignPlacedElement = {
      id: 'enc-sig',
      kind: 'signature',
      pageNumber: 1,
      rect: { u: 0.2, v: 0.75, w: 0.3, h: 0.08 },
      imageBytes: validPng,
      assetKey: 'enc-sig'
    };

    const rNoPass = await applyESignatureElementsToPdfV2(
      { fileName: 'locked.pdf', bytes: pdfEncrypted },
      { canonicalId: 'sign-pdf', elements: [el] }
    );
    assert.equal(rNoPass.status, 'PASSWORD_REQUIRED');
    assert.equal(rNoPass.error?.code, 'ERR_PASSWORD_REQUIRED');
    assertLifecycleZero('encrypted PDF without password');

    const rWrongPass = await applyESignatureElementsToPdfV2(
      { fileName: 'locked.pdf', bytes: pdfEncrypted, password: 'wrong-password' },
      { canonicalId: 'sign-pdf', elements: [el] }
    );
    assert.equal(rWrongPass.status, 'INCORRECT_PASSWORD');
    assert.equal(rWrongPass.error?.code, 'ERR_INCORRECT_PASSWORD');
    assertLifecycleZero('encrypted PDF with wrong password');

    const rRightPass = await applyESignatureElementsToPdfV2(
      { fileName: 'locked.pdf', bytes: pdfEncrypted, password: 'esign-secret-2026' },
      { canonicalId: 'sign-pdf', elements: [el] }
    );
    assert.equal(rRightPass.status, 'SUCCESS', `Expected SUCCESS with valid password, got ${rRightPass.summary}`);
    assert.equal(rRightPass.primaryFile?.pageCount, 2);
    assertLifecycleZero('encrypted PDF with valid password');
  });

  // =========================================================================
  // SECTION 6 & 10: REGISTRY, CATALOG, ICONS, 9-LANGUAGE LOCALIZATION & ZERO REGRESSIONS
  // =========================================================================
  await runTest('6/10', 'Registry, catalog, icons, classification & 9-language E-Signature translations are complete and preserve existing 53 PDF registry IDs', () => {
    // Existing 53 PDF/DocConverter registry must remain strictly untouched
    assert.equal(Object.keys(PDF_TOOL_OPERATION_REGISTRY).length, 53);

    // All 4 E-Signature canonical IDs registered everywhere required
    assert.deepEqual([...ESIGNATURE_CANONICAL_IDS], [
      'sign-pdf',
      'create-signature',
      'fill-and-sign',
      'add-date-initials'
    ]);

    assert.ok(PHASE25_SUBCATEGORIES.some((s) => s.id === 'p25-sub-esign'));

    for (const id of ESIGNATURE_CANONICAL_IDS) {
      assert.ok(ESIGNATURE_OPERATION_REGISTRY[id], `Missing ESIGNATURE_OPERATION_REGISTRY[${id}]`);
      assert.ok(TOOL_CLASSIFICATION_REGISTRY[id], `Missing TOOL_CLASSIFICATION_REGISTRY[${id}]`);
      assert.ok(resolveESignatureClassification(id), `resolveESignatureClassification(${id}) returned null`);
      assert.ok(PHASE25_METADATA.some((m) => m.id === id), `Missing PHASE25_METADATA entry for ${id}`);
      assert.ok(PDF_TOOL_ICON_MAP[id], `Missing PDF_TOOL_ICON_MAP entry for ${id}`);
    }

    // All 9 languages have 100% E-Signature translation coverage with zero raw keys
    const langs: Language[] = ['en', 'es', 'fr', 'pt', 'de', 'it', 'ja', 'zh', 'pl'];
    const enKeys = Object.keys(ESIGN_TRANSLATIONS.en) as Array<keyof typeof ESIGN_TRANSLATIONS.en>;
    assert.ok(enKeys.length >= 60, `Expected >= 60 E-Signature translation keys, got ${enKeys.length}`);

    for (const lang of langs) {
      const dict = ESIGN_TRANSLATIONS[lang];
      assert.ok(dict, `Missing ESIGN_TRANSLATIONS.${lang}`);
      for (const key of enKeys) {
        const val = getESignText(lang, key);
        assert.ok(val && val.trim().length > 0, `Empty translation for ${lang}.${key}`);
        assert.ok(!val.startsWith('esign.'), `Raw translation key leaked for ${lang}.${key}`);
      }
      // Subcategory localization check across all 9 languages
      const subLocalized = getLocalizedSubcategory(
        { id: 'p25-sub-esign', name: 'PDF E-Signature & Form Filling' },
        lang
      );
      assert.ok(subLocalized.name && !subLocalized.name.includes('subcat.'), `Missing subcat.p25-sub-esign for ${lang}`);
      if (lang !== 'en') {
        assert.notEqual(
          subLocalized.name,
          'PDF E-Signature & Form Filling',
          `Expected non-English translation for subcat.p25-sub-esign in ${lang}`
        );
      }

      // Tool title localization via getLocalizedCalculator
      for (const id of ESIGNATURE_CANONICAL_IDS) {
        const meta = PHASE25_METADATA.find((m) => m.id === id)!;
        const localized = getLocalizedCalculator(meta, lang);
        assert.ok(localized.name && !localized.name.startsWith('esign.'), `Bad localized name for ${id} in ${lang}`);
      }
    }
    assert.ok(TRANSLATIONS.en['subcat.p25-sub-esign']);
  });

  // =========================================================================
  // SECTION 7: 50-PAGE PDF SIGNING PERFORMANCE & REPEATED CYCLE STRESS TEST
  // =========================================================================
  await runTest('7', '50-page PDF multi-element signing & 10x repeated cycle stress test (0 leaked sessions, 0 leaked bytes)', async () => {
    const pdf50 = await createMultiPagePdf(50);
    const elements50: ESignPlacedElement[] = [];
    for (let p = 1; p <= 50; p += 5) {
      elements50.push({
        id: `s50-sig-${p}`,
        kind: 'signature',
        pageNumber: p,
        rect: { u: 0.62, v: 0.84, w: 0.25, h: 0.07 },
        imageBytes: validPng,
        assetKey: 'stress-sig'
      });
      elements50.push({
        id: `s50-date-${p}`,
        kind: 'date',
        pageNumber: p,
        rect: { u: 0.12, v: 0.86, w: 0.2, h: 0.04 },
        text: '2026-11-24',
        fontSizePt: 11
      });
      elements50.push({
        id: `s50-chk-${p}`,
        kind: 'checkmark',
        pageNumber: p,
        rect: { u: 0.45, v: 0.85, w: 0.03, h: 0.025 },
        color: '#16A34A'
      });
    }

    const t0 = performance.now();
    const res50 = await applyESignatureElementsToPdfV2(
      { fileName: 'contract_50pages.pdf', bytes: pdf50 },
      { canonicalId: 'fill-and-sign', elements: elements50 }
    );
    const elapsed50 = Math.round((performance.now() - t0) * 100) / 100;
    assertLifecycleZero('50-page PDF signing');

    assert.equal(res50.status, 'SUCCESS', `50-page signing failed: ${res50.summary}`);
    assert.equal(res50.primaryFile?.pageCount, 50);
    assert.equal(res50.details?.embeddedUniqueImages, 1, 'Repeated signature across 10 pages must embed once');
    console.log(
      `    -> 50-page signing: ${elapsed50} ms, input ${(pdf50.byteLength / 1024).toFixed(1)} KB, output ${(res50.primaryFile!.byteLength / 1024).toFixed(1)} KB`
    );

    // 10 repeated open -> sign -> dispose cycles verifying zero accumulation
    const heapBefore = process.memoryUsage().heapUsed;
    for (let cycle = 1; cycle <= 10; cycle++) {
      const cycleRes = await applyESignatureElementsToPdfV2(
        { fileName: `cycle_${cycle}.pdf`, bytes: pdf3Page },
        {
          canonicalId: 'sign-pdf',
          elements: [
            {
              id: `c-${cycle}`,
              kind: 'signature',
              pageNumber: (cycle % 3) + 1,
              rect: { u: 0.2, v: 0.7, w: 0.25, h: 0.08 },
              imageBytes: validPng,
              assetKey: `cycle-sig-${cycle}`
            }
          ]
        }
      );
      assert.equal(cycleRes.status, 'SUCCESS');
      assertLifecycleZero(`cycle ${cycle}`);
    }
    const heapAfter = process.memoryUsage().heapUsed;
    const heapDeltaMb = ((heapAfter - heapBefore) / (1024 * 1024)).toFixed(2);
    console.log(`    -> 10x cycle heap delta: ${heapDeltaMb} MB, activeSessions: ${pdfLifecycleManager.getActiveSessionCount()}`);
  });

  // =========================================================================
  // SECTION 11: DOCUMENT METADATA EXTRACTION & PRE-EXPORT MODIFICATION
  // =========================================================================
  await runTest('11', 'extractPdfMetadataForESign & applyESignatureElementsToPdfV2 read, update, and clear Title/Author/Subject with 0 leaked sessions', async () => {
    // Create PDF with initial metadata
    const metaDoc = await PDFDocument.create();
    metaDoc.addPage([612, 792]);
    metaDoc.setTitle('Initial Contract Draft');
    metaDoc.setAuthor('Jordan Taylor');
    metaDoc.setSubject('Master Services Agreement');
    const metaBytes = new Uint8Array(await metaDoc.save());

    // 1. Extract metadata cleanly
    const extracted = await extractPdfMetadataForESign({
      fileName: 'draft.pdf',
      bytes: metaBytes
    });
    assertLifecycleZero('metadata extraction');
    assert.equal(extracted.success, true);
    assert.equal(extracted.metadata.title, 'Initial Contract Draft');
    assert.equal(extracted.metadata.author, 'Jordan Taylor');
    assert.equal(extracted.metadata.subject, 'Master Services Agreement');

    // 2. Extraction error path (empty & corrupt bytes) leaves 0 sessions
    const badExtract = await extractPdfMetadataForESign({
      fileName: 'empty.pdf',
      bytes: new Uint8Array(0)
    });
    assert.equal(badExtract.success, false);
    assertLifecycleZero('empty metadata extraction');

    const corruptExtract = await extractPdfMetadataForESign({
      fileName: 'corrupt.pdf',
      bytes: new TextEncoder().encode('%PDF-1.7\ncorrupt-payload')
    });
    assert.equal(corruptExtract.success, false);
    assertLifecycleZero('corrupt metadata extraction');

    // 3. Metadata-only export (0 visual elements) updates /Info fields cleanly
    const metaOnlyRes = await applyESignatureElementsToPdfV2(
      { fileName: 'draft.pdf', bytes: metaBytes },
      {
        canonicalId: 'sign-pdf',
        elements: [],
        metadata: {
          title: 'Final Signed Contract',
          author: 'Alex Morgan',
          subject: 'Executed Agreement 2026'
        }
      }
    );
    assertLifecycleZero('metadata-only update');
    assert.equal(metaOnlyRes.status, 'SUCCESS');
    assert.equal(metaOnlyRes.details?.metadataApplied, true);

    const reopenedMetaOnly = await PDFDocument.load(metaOnlyRes.primaryFile!.bytes);
    assert.equal(reopenedMetaOnly.getTitle(), 'Final Signed Contract');
    assert.equal(reopenedMetaOnly.getAuthor(), 'Alex Morgan');
    assert.equal(reopenedMetaOnly.getSubject(), 'Executed Agreement 2026');

    // 4. Combined signature + metadata clearing (empty string clears field)
    const sigAndClearRes = await applyESignatureElementsToPdfV2(
      { fileName: 'draft.pdf', bytes: metaBytes },
      {
        canonicalId: 'sign-pdf',
        elements: [
          {
            id: 'meta-sig-1',
            kind: 'signature',
            pageNumber: 1,
            rect: { u: 0.2, v: 0.7, w: 0.25, h: 0.08 },
            imageBytes: validPng,
            assetKey: 'meta-sig'
          }
        ],
        metadata: {
          title: 'Signed NDA',
          author: '',
          subject: 'Confidentiality'
        }
      }
    );
    assertLifecycleZero('signature + metadata clearing');
    assert.equal(sigAndClearRes.status, 'SUCCESS');

    const reopenedCleared = await PDFDocument.load(sigAndClearRes.primaryFile!.bytes);
    assert.equal(reopenedCleared.getTitle(), 'Signed NDA');
    assert.equal(reopenedCleared.getAuthor() ?? '', '');
    assert.equal(reopenedCleared.getSubject(), 'Confidentiality');
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log('\n--------------------------------------------------------------------');
  console.log(`  ESIGN-05 ENGINE SUITE SUMMARY: ${passed}/${results.length} PASSED, ${failed} FAILED`);
  console.log('--------------------------------------------------------------------\n');
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
