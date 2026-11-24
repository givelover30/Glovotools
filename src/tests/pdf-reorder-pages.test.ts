import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { reorderPdfPagesV2 } from '../services/pdf/v2/pdfPageOrganizationEngine';
import { validateReorderPermutation } from '../services/pdf/v2/pdfPageRangeParser';
import { buildNormalizedV2RequestFromWorkspaceParams } from '../services/pdf/v2/pdfWorkspaceIntegration';

async function createCustomGeometryPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const specs = [
    { label: 'ORD_P1', w: 612, h: 792, rot: 0 },
    { label: 'ORD_P2', w: 842, h: 595, rot: 90 },
    { label: 'ORD_P3', w: 500, h: 700, rot: 180 },
    { label: 'ORD_P4', w: 420, h: 595, rot: 270 },
  ];
  for (const s of specs) {
    const page = doc.addPage([s.w, s.h]);
    page.setRotation(degrees(s.rot));
    page.drawText(s.label, { x: 40, y: 300, size: 24, font, color: rgb(0, 0, 0) });
  }
  return doc.save();
}

async function createEncryptedPdfBytes(password: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([500, 700]);
    p.setRotation(degrees((i - 1) * 90));
    p.drawText(`ENC_ORD_P${i}`, { x: 40, y: 300, size: 20, font, color: rgb(0, 0, 0) });
  }
  await doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}_owner`,
  });
  return doc.save();
}

describe('pdf-reorder-pages: permutation validation, reordering logic & boundary verification', () => {
  it('validates reorder permutations correctly (accepts full permutations; rejects omissions, duplicates, and out-of-range)', () => {
    const valid = validateReorderPermutation([3, 1, 4, 2], 4);
    expect(valid.isValid).toBe(true);
    expect(valid.pageIndices).toEqual([2, 0, 3, 1]);
    expect(valid.pageNumbers).toEqual([3, 1, 4, 2]);

    const validString = validateReorderPermutation('3, 1, 4, 2', 4);
    expect(validString.isValid).toBe(true);
    expect(validString.pageIndices).toEqual([2, 0, 3, 1]);

    const omitted = validateReorderPermutation([3, 1, 2], 4);
    expect(omitted.isValid).toBe(false);
    expect(omitted.error?.code).toBe('ERR_REORDER_LENGTH_MISMATCH');

    const duplicated = validateReorderPermutation([3, 1, 1, 2], 4);
    expect(duplicated.isValid).toBe(false);
    expect(duplicated.error?.code).toBe('ERR_REORDER_LENGTH_MISMATCH');

    const outOfRange = validateReorderPermutation([3, 1, 5, 2], 4);
    expect(outOfRange.isValid).toBe(false);
    expect(outOfRange.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
  });

  it('reorders PDF pages accurately using array permutations and string expressions while preserving geometry', async () => {
    const bytes = await createCustomGeometryPdfBytes();

    const resArray = await reorderPdfPagesV2(
      { fileName: 'custom.pdf', bytes },
      { newOrder: [3, 1, 4, 2] }
    );
    expect(resArray.status).toBe('SUCCESS');
    expect(resArray.primaryFile?.pageCount).toBe(4);

    const docArray = await PDFDocument.load(resArray.outputBytes!);
    expect(docArray.getPageCount()).toBe(4);
    // Page 3 was 500x700, rot 180; Page 1 was 612x792, rot 0; Page 4 was 420x595, rot 270; Page 2 was 842x595, rot 90
    expect(docArray.getPages().map((p) => p.getRotation().angle)).toEqual([180, 0, 270, 90]);
    expect(docArray.getPages().map((p) => Math.round(p.getWidth()))).toEqual([500, 612, 420, 842]);

    const resString = await reorderPdfPagesV2(
      { fileName: 'custom.pdf', bytes },
      { newOrder: '4, 2, 1, 3' }
    );
    expect(resString.status).toBe('SUCCESS');
    const docString = await PDFDocument.load(resString.outputBytes!);
    expect(docString.getPages().map((p) => p.getRotation().angle)).toEqual([270, 90, 0, 180]);
  });

  it('rejects corrupt PDFs and invalid reorder inputs gracefully', async () => {
    const bytes = await createCustomGeometryPdfBytes();

    const badPerm = await reorderPdfPagesV2(
      { fileName: 'custom.pdf', bytes },
      { newOrder: [1, 2, 3] }
    );
    expect(badPerm.status).toBe('VALIDATION_ERROR');
    expect(badPerm.error?.code).toBe('ERR_REORDER_LENGTH_MISMATCH');

    const corruptRes = await reorderPdfPagesV2(
      { fileName: 'bad.pdf', bytes: new TextEncoder().encode('not a pdf') },
      { newOrder: [1, 2, 3, 4] }
    );
    expect(corruptRes.error?.code).toBe('ERR_INVALID_PDF');
  });

  it('handles encrypted PDFs cleanly (missing password, wrong password, and valid password)', async () => {
    const encBytes = await createEncryptedPdfBytes('ReorderSecret!2026');

    const missingPass = await reorderPdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes },
      { newOrder: [3, 1, 2] }
    );
    expect(missingPass.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const wrongPass = await reorderPdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'WrongPassword' },
      { newOrder: [3, 1, 2] }
    );
    expect(wrongPass.error?.code).toBe('ERR_INCORRECT_PASSWORD');

    const validPass = await reorderPdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'ReorderSecret!2026' },
      { newOrder: [3, 1, 2] }
    );
    expect(validPass.status).toBe('SUCCESS');
    const outDoc = await PDFDocument.load(validPass.outputBytes!);
    expect(outDoc.getPageCount()).toBe(3);
    // Original pages 3, 1, 2 (rotations 180, 0, 90)
    expect(outDoc.getPages().map((p) => p.getRotation().angle)).toEqual([180, 0, 90]);
  });

  it('normalizes pdf-reorder-pages workspace parameters consistently', () => {
    const dummy = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    const viaRange = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-reorder-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '3, 1, 2' }
    );
    expect(viaRange.options?.newOrder).toEqual([3, 1, 2]);
    expect(viaRange.options?.indexing).toBe('1-based');

    const viaThumbnails = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-reorder-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '', selectedPageIndices: [2, 0, 1] }
    );
    expect(viaThumbnails.options?.newOrder).toEqual([3, 1, 2]);
    expect(viaThumbnails.options?.indexing).toBe('1-based');
  });
});
