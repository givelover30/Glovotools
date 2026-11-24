import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { deletePdfPagesV2 } from '../services/pdf/v2/pdfPageOrganizationEngine';
import { buildNormalizedV2RequestFromWorkspaceParams } from '../services/pdf/v2/pdfWorkspaceIntegration';

async function createMultiGeometryPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const specs = [
    { w: 420, h: 600, rot: 0 },
    { w: 440, h: 620, rot: 90 },
    { w: 460, h: 640, rot: 180 },
    { w: 480, h: 660, rot: 270 },
    { w: 500, h: 680, rot: 0 },
  ];
  for (const s of specs) {
    const page = doc.addPage([s.w, s.h]);
    page.setRotation(degrees(s.rot));
  }
  return doc.save();
}

async function createSinglePagePdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([400, 600]);
  return doc.save();
}

async function createEncryptedPdfBytes(password: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([410, 610]);
  doc.addPage([430, 630]);
  doc.addPage([450, 650]);
  await doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}_owner`,
  });
  return doc.save();
}

describe('pdf-delete-pages: page deletion logic & boundary verification', () => {
  it('deletes first, middle, and last single pages while preserving remaining page order, dimensions, and rotation', async () => {
    const bytes = await createMultiGeometryPdfBytes();

    const delFirst = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: '1' }
    );
    expect(delFirst.status).toBe('SUCCESS');
    expect(delFirst.details?.remainingPageNumbers).toEqual([2, 3, 4, 5]);
    const firstDoc = await PDFDocument.load(delFirst.outputBytes!);
    expect(firstDoc.getPageCount()).toBe(4);
    expect(firstDoc.getPages().map((p) => p.getWidth())).toEqual([440, 460, 480, 500]);
    expect(firstDoc.getPages().map((p) => p.getRotation().angle)).toEqual([90, 180, 270, 0]);

    const delMiddle = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: '3' }
    );
    expect(delMiddle.status).toBe('SUCCESS');
    expect(delMiddle.details?.remainingPageNumbers).toEqual([1, 2, 4, 5]);
    const midDoc = await PDFDocument.load(delMiddle.outputBytes!);
    expect(midDoc.getPages().map((p) => p.getWidth())).toEqual([420, 440, 480, 500]);

    const delLast = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: '5' }
    );
    expect(delLast.status).toBe('SUCCESS');
    expect(delLast.details?.remainingPageNumbers).toEqual([1, 2, 3, 4]);
    const lastDoc = await PDFDocument.load(delLast.outputBytes!);
    expect(lastDoc.getPages().map((p) => p.getWidth())).toEqual([420, 440, 460, 480]);
  });

  it('deletes multiple and non-sequential selections while keeping remaining pages in original order', async () => {
    const bytes = await createMultiGeometryPdfBytes();

    const nonSeqRange = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: '4, 1' }
    );
    expect(nonSeqRange.status).toBe('SUCCESS');
    expect(nonSeqRange.details?.deletedPageNumbers).toEqual([4, 1]);
    expect(nonSeqRange.details?.remainingPageNumbers).toEqual([2, 3, 5]);
    const outDoc = await PDFDocument.load(nonSeqRange.outputBytes!);
    expect(outDoc.getPages().map((p) => p.getWidth())).toEqual([440, 460, 500]);
    expect(outDoc.getPages().map((p) => p.getRotation().angle)).toEqual([90, 180, 0]);

    const thumbIndices = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: { mode: 'indices', indices: [3, 1] } }
    );
    expect(thumbIndices.status).toBe('SUCCESS');
    expect(thumbIndices.details?.remainingPageNumbers).toEqual([1, 3, 5]);
  });

  it('rejects deleting all pages on both single-page and multi-page PDFs', async () => {
    const multiBytes = await createMultiGeometryPdfBytes();
    const singleBytes = await createSinglePagePdfBytes();

    const delAllMulti = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes: multiBytes },
      { selection: '1-5' }
    );
    expect(delAllMulti.status).toBe('VALIDATION_ERROR');
    expect(delAllMulti.error?.code).toBe('ERR_CANNOT_DELETE_ALL_PAGES');

    const delAllKeyword = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes: multiBytes },
      { selection: 'all' }
    );
    expect(delAllKeyword.error?.code).toBe('ERR_CANNOT_DELETE_ALL_PAGES');

    const delAllSingle = await deletePdfPagesV2(
      { fileName: 'single.pdf', bytes: singleBytes },
      { selection: '1' }
    );
    expect(delAllSingle.error?.code).toBe('ERR_CANNOT_DELETE_ALL_PAGES');
  });

  it('rejects empty, invalid, duplicate, out-of-range selections and corrupt PDFs', async () => {
    const bytes = await createMultiGeometryPdfBytes();

    const cases = ['', '   ', '0', '6', '2, 2', '1-3, 2', 'abc', '4-2'];
    for (const sel of cases) {
      const res = await deletePdfPagesV2(
        { fileName: 'multi.pdf', bytes },
        { selection: sel }
      );
      expect(res.status).toBe('VALIDATION_ERROR');
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    }

    const emptyIndices = await deletePdfPagesV2(
      { fileName: 'multi.pdf', bytes },
      { selection: { mode: 'indices', indices: [] } }
    );
    expect(emptyIndices.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

    const corruptRes = await deletePdfPagesV2(
      { fileName: 'bad.pdf', bytes: new TextEncoder().encode('corrupt data') },
      { selection: '1' }
    );
    expect(corruptRes.error?.code).toBe('ERR_INVALID_PDF');
  });

  it('handles encrypted PDFs cleanly (missing password, wrong password, and valid password)', async () => {
    const encBytes = await createEncryptedPdfBytes('DeleteSecret!2026');

    const missingPass = await deletePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes },
      { selection: '2' }
    );
    expect(missingPass.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const wrongPass = await deletePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'WrongPassword' },
      { selection: '2' }
    );
    expect(wrongPass.error?.code).toBe('ERR_INCORRECT_PASSWORD');

    const validPass = await deletePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'DeleteSecret!2026' },
      { selection: '2' }
    );
    expect(validPass.status).toBe('SUCCESS');
    expect(validPass.details?.remainingPageNumbers).toEqual([1, 3]);
    const outDoc = await PDFDocument.load(validPass.outputBytes!);
    expect(outDoc.getPageCount()).toBe(2);
    expect(outDoc.getPages().map((p) => p.getWidth())).toEqual([410, 450]);
  });

  it('normalizes pdf-delete-pages workspace parameters consistently', () => {
    const dummy = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    const viaRange = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-delete-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '2, 4', selectedPageIndices: [1, 3] }
    );
    expect(viaRange.options?.selection).toEqual({
      mode: 'range-string',
      rangeExpression: '2, 4',
    });

    const viaIndices = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-delete-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '', selectedPageIndices: [0, 2] }
    );
    expect(viaIndices.options?.selection).toEqual({
      mode: 'indices',
      indices: [0, 2],
    });
  });
});
