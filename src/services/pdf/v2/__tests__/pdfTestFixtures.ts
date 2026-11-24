import { PDFDocument, StandardFonts, rgb } from '@cantoo/pdf-lib';

/**
 * Generates a real, multi-page PDF document with distinct page text, dimensions, and metadata.
 */
export async function createValidMultiPagePdfFixture(params: {
  pageTexts?: string[];
  title?: string;
  author?: string;
  subject?: string;
} = {}): Promise<Uint8Array> {
  const pageTexts = params.pageTexts ?? [
    'CALCTOOLS_PDF03_FIXTURE_PAGE_1',
    'CALCTOOLS_PDF03_FIXTURE_PAGE_2',
    'CALCTOOLS_PDF03_FIXTURE_PAGE_3',
  ];

  const doc = await PDFDocument.create();
  doc.setTitle(params.title ?? 'CalcTools PDF-03 Core Verification Fixture');
  doc.setAuthor(params.author ?? 'CalcTools QA');
  doc.setSubject(params.subject ?? 'Phase PDF-03 Foundation Test');
  doc.setCreator('CalcTools PDF Engine V2 Test Suite');
  doc.setProducer('CalcTools @cantoo/pdf-lib');

  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pageTexts.length; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(pageTexts[i], {
      x: 72,
      y: 700,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  return await doc.save();
}

/**
 * Generates a real AES-256 password-protected PDF document using @cantoo/pdf-lib native doc.encrypt().
 */
export async function createPasswordProtectedPdfFixture(params: {
  userPassword: string;
  ownerPassword?: string;
  pageText?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle('Encrypted PDF-03 Fixture');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595.28, 841.89]);
  page.drawText(params.pageText ?? 'SECRET_ENCRYPTED_CONTENT_2026', {
    x: 72,
    y: 720,
    size: 14,
    font,
  });

  doc.encrypt({
    userPassword: params.userPassword,
    ownerPassword: params.ownerPassword ?? `${params.userPassword}_owner`,
    algorithm: 'AES-256',
    permissions: {
      printing: 'highResolution',
      copying: false,
      modifying: false,
    },
  });

  return await doc.save({ useObjectStreams: false });
}

/**
 * Generates an empty 0-byte buffer.
 */
export function createEmptyBufferFixture(): Uint8Array {
  return new Uint8Array(0);
}

/**
 * Generates random non-PDF binary bytes with invalid magic bytes.
 */
export function createInvalidMagicBytesFixture(): Uint8Array {
  const bytes = new Uint8Array(256);
  for (let i = 0; i < bytes.byteLength; i++) {
    bytes[i] = (i * 37 + 19) & 0xff;
  }
  // Ensure it does not accidentally start with known signatures
  bytes[0] = 0x13;
  bytes[1] = 0x37;
  bytes[2] = 0xc0;
  bytes[3] = 0xde;
  return bytes;
}

/**
 * Generates a valid PNG header buffer disguised as a .pdf upload.
 */
export function createPngDisguisedAsPdfFixture(): Uint8Array {
  const bytes = new Uint8Array(128);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  return bytes;
}

/**
 * Generates a malformed PDF that starts with '%PDF-1.7' and ends with '%%EOF',
 * but has a completely corrupted cross-reference table and invalid object streams.
 */
export function createMalformedPdfWithBrokenStructureFixture(): Uint8Array {
  const corruptedText = [
    '%PDF-1.7',
    '1 0 obj',
    '<< /Type /Catalog /Pages 999 0 R /Broken <<< >>',
    'stream',
    'CORRUPTED_UNTERMINATED_OBJECT_GRAPH_DATA_XXXX',
    'xref',
    '0 500',
    '9999999999 65535 f ',
    'trailer',
    '<< /Size -50 /Root 999 0 R >>',
    'startxref',
    '987654321',
    '%%EOF',
  ].join('\n');
  return new TextEncoder().encode(corruptedText);
}

/**
 * Generates a truncated PDF that starts with '%PDF-1.7' but is missing its trailer and '%%EOF'.
 */
export async function createTruncatedPdfMissingEofFixture(): Promise<Uint8Array> {
  const valid = await createValidMultiPagePdfFixture({ pageTexts: ['TRUNCATED_TEST'] });
  // Cut off the last 40% of the file so trailer and %%EOF are completely missing
  return valid.slice(0, Math.floor(valid.byteLength * 0.6));
}
