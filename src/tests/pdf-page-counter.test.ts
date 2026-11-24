import { PDFDocument, PDFName, PDFRawStream, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  PdfPageCounterReportData,
  countPdfPagesV2,
} from '../services/pdf/v2/pdfInspectionAnalysisEngine';
import {
  buildNormalizedV2RequestFromWorkspaceParams,
  executePdfWorkspaceOperationV2,
} from '../services/pdf/v2/pdfWorkspaceIntegration';

function attachXmpPacket(doc: PDFDocument, xmpXml: string): void {
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

async function createSinglePagePdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText('Single page counter fixture', { x: 48, y: 720, size: 16, font, color: rgb(0, 0, 0) });
  return doc.save({ updateFieldAppearances: false });
}

async function createMixedGeometryWithMetadataPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle('Quarterly Engineering Dossier');
  doc.setAuthor('Ada Lovelace');
  doc.setSubject('Mixed Paper Sizes & Rotations');
  doc.setKeywords(['geometry', 'rotation', 'inspection']);
  doc.setCreator('CalcTools Fixture Builder');
  doc.setProducer('CalcTools PDF Engine Test');
  doc.setCreationDate(new Date('2025-03-15T10:20:30Z'));
  doc.setModificationDate(new Date('2025-06-01T14:05:00Z'));

  const specs = [
    { label: 'MIX_P1_LETTER_0', w: 612, h: 792, rot: 0 },
    { label: 'MIX_P2_A4_90', w: 595.28, h: 841.89, rot: 90 },
    { label: 'MIX_P3_LEGAL_180', w: 612, h: 1008, rot: 180 },
    { label: 'MIX_P4_SQUARE_270', w: 400, h: 400, rot: 270 },
  ];

  for (const s of specs) {
    const p = doc.addPage([s.w, s.h]);
    p.setRotation(degrees(s.rot));
    p.drawText(s.label, { x: 40, y: 200, size: 18, font, color: rgb(0, 0, 0) });
  }

  return doc.save({ updateFieldAppearances: false });
}

async function createNoMetadataPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([612, 792]);
  p1.drawText('No metadata page 1', { x: 50, y: 700, size: 14, font });
  const p2 = doc.addPage([612, 792]);
  p2.drawText('No metadata page 2', { x: 50, y: 700, size: 14, font });

  // Clear /Producer and /Creator defaults that pdf-lib sets on TrailerInfo
  const infoRef = doc.context.trailerInfo.Info;
  if (infoRef) {
    delete doc.context.trailerInfo.Info;
  }

  return doc.save({ updateFieldAppearances: false });
}

async function createLargePdfBytes(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  doc.setTitle(`Large ${pageCount}-Page Benchmark`);
  doc.setAuthor('Benchmark Suite');
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage(i % 2 === 0 ? [792, 612] : [612, 792]);
    page.drawText(`LARGE_PAGE_${i}`, { x: 48, y: 300, size: 14, font });
  }
  return doc.save({ updateFieldAppearances: false });
}

async function createEncryptedMetadataPdfBytes(userPassword: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle('Confidential Financial Report');
  doc.setAuthor('Grace Hopper');
  doc.setSubject('AES Encrypted Inspection');
  doc.setKeywords(['encrypted', 'audit']);
  doc.setCreator('Secure Report Writer');
  doc.setProducer('CalcTools Security Fixture');

  const dims = [
    { w: 612, h: 792, rot: 0 },
    { w: 595.28, h: 841.89, rot: 90 },
    { w: 612, h: 1008, rot: 180 },
  ];
  dims.forEach((d, idx) => {
    const page = doc.addPage([d.w, d.h]);
    page.setRotation(degrees(d.rot));
    page.drawText(`ENC_PAGE_${idx + 1}`, { x: 40, y: 300, size: 16, font });
  });

  await doc.encrypt({
    userPassword,
    ownerPassword: `${userPassword}_OWNER`,
  });
  return doc.save({ updateFieldAppearances: false });
}

describe('pdf-page-counter: page counting, geometry, metadata & security verification', () => {
  it('counts single-page PDF accurately and keeps input buffer immutable', async () => {
    const bytes = await createSinglePagePdfBytes();
    const snapshot = new Uint8Array(bytes);

    const res = await countPdfPagesV2({ fileName: 'single.pdf', bytes });
    expect(res.status).toBe('SUCCESS');
    expect(res.resolvedCanonicalId).toBe('pdf-page-counter');
    expect(bytes).toEqual(snapshot);

    const data = res.details as unknown as PdfPageCounterReportData;
    expect(data.pageCount).toBe(1);
    expect(data.pdfLibPageCount).toBe(1);
    expect(data.pdfJsPageCount).toBe(1);
    expect(data.parsersAgree).toBe(true);
    expect(data.hasUniformPageSize).toBe(true);
    expect(data.portraitPageCount).toBe(1);
    expect(data.landscapePageCount).toBe(0);
    expect(data.squarePageCount).toBe(0);
    expect(data.pages[0].paperSizePreset).toBe('US Letter');
    expect(data.pages[0].rotationDegrees).toBe(0);

    expect(res.outputFiles.map((f) => f.fileName)).toEqual([
      'single_page_count_report.txt',
      'single_page_count_report.json',
    ]);
  });

  it('inspects mixed page dimensions, rotations (0/90/180/270), and full metadata accurately', async () => {
    const bytes = await createMixedGeometryWithMetadataPdfBytes();
    const res = await countPdfPagesV2({ fileName: 'mixed.pdf', bytes });

    expect(res.status).toBe('SUCCESS');
    const data = res.details as unknown as PdfPageCounterReportData;
    expect(data.pageCount).toBe(4);
    expect(data.parsersAgree).toBe(true);
    expect(data.hasUniformPageSize).toBe(false);
    expect(data.portraitPageCount).toBe(2); // Letter 0° & Legal 180°
    expect(data.landscapePageCount).toBe(1); // A4 rotated 90° -> effective width > height
    expect(data.squarePageCount).toBe(1); // 400x400 rotated 270°
    expect(data.rotatedPageCount).toBe(3);

    expect(data.pages.map((p) => p.rotationDegrees)).toEqual([0, 90, 180, 270]);
    expect(data.pages.map((p) => p.paperSizePreset)).toEqual([
      'US Letter',
      'A4',
      'US Legal',
      'Custom (400 × 400 pt)',
    ]);

    expect(data.metadata.hasAnyMetadata).toBe(true);
    expect(data.metadata.title).toBe('Quarterly Engineering Dossier');
    expect(data.metadata.author).toBe('Ada Lovelace');
    expect(data.metadata.subject).toBe('Mixed Paper Sizes & Rotations');
    expect(data.metadata.keywords).toBe('geometry rotation inspection');
    expect(data.metadata.creator).toBe('CalcTools Fixture Builder');
    expect(data.metadata.producer).toBe('CalcTools PDF Engine Test');
    expect(data.metadata.creationDate).toContain('2025-03-15');
    expect(data.metadata.modificationDate).toContain('2025-06-01');

    expect(res.previewText).toContain('DOCUMENT METADATA:');
    expect(res.previewText).toContain('Title              : Quarterly Engineering Dossier');
    expect(res.previewText).toContain('Author             : Ada Lovelace');
    expect(res.inspectionReport?.summaryMetrics).toContainEqual({
      label: 'Title',
      value: 'Quarterly Engineering Dossier',
    });
  });

  it('falls back to XMP metadata when /Info dictionary lacks fields and returns null for missing metadata without inventing values', async () => {
    const noMetaBytes = await createNoMetadataPdfBytes();
    const resNoMeta = await countPdfPagesV2({ fileName: 'nometa.pdf', bytes: noMetaBytes });

    expect(resNoMeta.status).toBe('SUCCESS');
    const dataNoMeta = resNoMeta.details as unknown as PdfPageCounterReportData;
    expect(dataNoMeta.pageCount).toBe(2);
    expect(dataNoMeta.metadata).toEqual({
      title: null,
      author: null,
      subject: null,
      keywords: null,
      creator: null,
      producer: null,
      creationDate: null,
      modificationDate: null,
      hasAnyMetadata: false,
    });
    expect(resNoMeta.previewText).toContain('Title              : [Not set]');
    expect(resNoMeta.inspectionReport?.summaryMetrics).toContainEqual({
      label: 'Title',
      value: 'Not set',
    });

    // Now test XMP fallback when /Info is detached
    const docWithXmp = await PDFDocument.load(noMetaBytes);
    delete docWithXmp.context.trailerInfo.Info;
    attachXmpPacket(
      docWithXmp,
      `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about=""
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:xmp="http://ns.adobe.com/xap/1.0/"
            xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <dc:title><rdf:Alt><rdf:li xml:lang="x-default">XMP Only Title</rdf:li></rdf:Alt></dc:title>
            <dc:creator><rdf:Seq><rdf:li>XMP Author</rdf:li></rdf:Seq></dc:creator>
            <xmp:CreatorTool>XMP Creator Tool</xmp:CreatorTool>
            <pdf:Producer>XMP Producer</pdf:Producer>
          </rdf:Description>
        </rdf:RDF>
      </x:xmpmeta>
      <?xpacket end="w"?>`
    );
    const xmpBytes = await docWithXmp.save({ updateFieldAppearances: false });
    const resXmp = await countPdfPagesV2({ fileName: 'xmp_only.pdf', bytes: xmpBytes });
    expect(resXmp.status).toBe('SUCCESS');
    const dataXmp = resXmp.details as unknown as PdfPageCounterReportData;
    expect(dataXmp.metadata.title).toBe('XMP Only Title');
    expect(dataXmp.metadata.author).toBe('XMP Author');
    expect(dataXmp.metadata.creator).toBe('XMP Creator Tool');
    expect(dataXmp.metadata.producer).toBe('XMP Producer');
    expect(dataXmp.metadata.subject).toBeNull();
  });

  it('accurately counts large PDFs (120 pages) and includes full breakdown in downloadable files', async () => {
    const largeBytes = await createLargePdfBytes(120);
    const res = await countPdfPagesV2({ fileName: 'large_120.pdf', bytes: largeBytes });

    expect(res.status).toBe('SUCCESS');
    const data = res.details as unknown as PdfPageCounterReportData;
    expect(data.pageCount).toBe(120);
    expect(data.pdfLibPageCount).toBe(120);
    expect(data.pdfJsPageCount).toBe(120);
    expect(data.parsersAgree).toBe(true);
    expect(data.portraitPageCount).toBe(60);
    expect(data.landscapePageCount).toBe(60);
    expect(data.pages).toHaveLength(120);
    expect(data.metadata.title).toBe('Large 120-Page Benchmark');

    const txtReport = new TextDecoder().decode(res.outputFiles[0].bytes);
    expect(txtReport).toContain('Page 120:');
    expect(txtReport).toContain('Title              : Large 120-Page Benchmark');

    const jsonReport = JSON.parse(new TextDecoder().decode(res.outputFiles[1].bytes));
    expect(jsonReport.pageCount).toBe(120);
    expect(jsonReport.pages).toHaveLength(120);
    expect(jsonReport.metadata.title).toBe('Large 120-Page Benchmark');
  });

  it('handles encrypted PDFs cleanly (missing password, wrong password, valid password with clean metadata, owner-locked)', async () => {
    const encBytes = await createEncryptedMetadataPdfBytes('InspectSecret2026!');

    const missingPass = await countPdfPagesV2({ fileName: 'locked.pdf', bytes: encBytes });
    expect(missingPass.status).toBe('PASSWORD_REQUIRED');
    expect(missingPass.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const wrongPass = await countPdfPagesV2({
      fileName: 'locked.pdf',
      bytes: encBytes,
      password: 'WrongPassword!',
    });
    expect(wrongPass.status).toBe('INCORRECT_PASSWORD');
    expect(wrongPass.error?.code).toBe('ERR_INCORRECT_PASSWORD');

    const validPass = await countPdfPagesV2({
      fileName: 'locked.pdf',
      bytes: encBytes,
      password: 'InspectSecret2026!',
    });
    expect(validPass.status).toBe('SUCCESS');
    const data = validPass.details as unknown as PdfPageCounterReportData;
    expect(data.pageCount).toBe(3);
    expect(data.parsersAgree).toBe(true);
    expect(data.isEncrypted).toBe(true);
    expect(data.metadata.title).toBe('Confidential Financial Report');
    expect(data.metadata.author).toBe('Grace Hopper');
    expect(data.metadata.subject).toBe('AES Encrypted Inspection');
    expect(data.metadata.creator).toBe('Secure Report Writer');
    expect(data.metadata.producer).toBe('CalcTools Security Fixture');

    // Owner-password-only PDF should open transparently with empty user password
    const ownerDoc = await PDFDocument.create();
    ownerDoc.addPage([612, 792]);
    ownerDoc.setTitle('Owner Protected Only');
    await ownerDoc.encrypt({ ownerPassword: 'OwnerOnlySecret' });
    const ownerBytes = await ownerDoc.save({ updateFieldAppearances: false });

    const ownerRes = await countPdfPagesV2({ fileName: 'owner_locked.pdf', bytes: ownerBytes });
    expect(ownerRes.status).toBe('SUCCESS');
    const ownerData = ownerRes.details as unknown as PdfPageCounterReportData;
    expect(ownerData.pageCount).toBe(1);
    expect(ownerData.isEncrypted).toBe(true);
    expect(ownerData.metadata.title).toBe('Owner Protected Only');
  });

  it('rejects empty, non-PDF, truncated, and corrupt PDFs clearly', async () => {
    const emptyRes = await countPdfPagesV2({ fileName: 'empty.pdf', bytes: new Uint8Array(0) });
    expect(emptyRes.error?.code).toBe('ERR_EMPTY_FILE');

    const nonPdfRes = await countPdfPagesV2({
      fileName: 'photo.png',
      bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
    });
    expect(nonPdfRes.error?.code).toBe('ERR_INVALID_PDF');

    const validBytes = await createSinglePagePdfBytes();
    const truncatedBytes = validBytes.slice(0, Math.floor(validBytes.byteLength * 0.45));
    const truncatedRes = await countPdfPagesV2({ fileName: 'truncated.pdf', bytes: truncatedBytes });
    expect(truncatedRes.status).not.toBe('SUCCESS');

    const corruptBytes = new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<< /Broken >>\n%%EOF');
    const corruptRes = await countPdfPagesV2({ fileName: 'corrupt.pdf', bytes: corruptBytes });
    expect(corruptRes.status).not.toBe('SUCCESS');
  });

  it('integrates with workspace normalization and canonical/alias routing', async () => {
    const bytes = await createMixedGeometryWithMetadataPdfBytes();

    const req = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-page-counter',
      [{ fileName: 'mixed.pdf', bytes }],
      [],
      { password: '' }
    );
    expect(req.toolId).toBe('pdf-page-counter');
    expect(req.inputs).toHaveLength(1);

    const execDirect = await executePdfWorkspaceOperationV2(req);
    expect(execDirect.status).toBe('SUCCESS');
    expect(execDirect.canonicalToolId).toBe('pdf-page-counter');
    expect(execDirect.primaryOutput?.extension).toBe('txt');
    expect(execDirect.outputs.map((o) => o.extension)).toEqual(['txt', 'json']);

    const reqAlias = buildNormalizedV2RequestFromWorkspaceParams(
      'count-pdf-pages',
      [{ fileName: 'mixed.pdf', bytes }],
      [],
      {}
    );
    const execAlias = await executePdfWorkspaceOperationV2(reqAlias);
    expect(execAlias.status).toBe('SUCCESS');
    expect(execAlias.canonicalToolId).toBe('pdf-page-counter');
  });
});
