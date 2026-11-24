import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { rotatePdfPagesV2 } from '../services/pdf/v2/pdfPageOrganizationEngine';
import { buildNormalizedV2RequestFromWorkspaceParams } from '../services/pdf/v2/pdfWorkspaceIntegration';

async function createMixedGeometryPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const specs = [
    { label: 'ROT_P1', w: 420, h: 600, rot: 0 },
    { label: 'ROT_P2', w: 440, h: 620, rot: 90 },
    { label: 'ROT_P3', w: 460, h: 640, rot: 180 },
    { label: 'ROT_P4', w: 480, h: 660, rot: 270 },
    { label: 'ROT_P5', w: 500, h: 680, rot: 0 },
  ];
  for (const s of specs) {
    const page = doc.addPage([s.w, s.h]);
    page.setRotation(degrees(s.rot));
    page.drawText(s.label, { x: 40, y: 300, size: 20, font, color: rgb(0, 0, 0) });
  }
  return doc.save();
}

async function createEncryptedMixedPdfBytes(password: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const specs = [
    { w: 410, h: 610, rot: 0 },
    { w: 430, h: 630, rot: 90 },
    { w: 450, h: 650, rot: 180 },
  ];
  for (const s of specs) {
    const page = doc.addPage([s.w, s.h]);
    page.setRotation(degrees(s.rot));
  }
  await doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}_owner`,
  });
  return doc.save();
}

describe('pdf-rotate-pages: rotation logic, geometry preservation & boundary verification', () => {
  it('rotates entire PDF clockwise and counterclockwise across 90, 180, 270, -90, -180, -270', async () => {
    const bytes = await createMixedGeometryPdfBytes();

    const r90 = await rotatePdfPagesV2({ fileName: 'mixed.pdf', bytes }, { angleDegrees: 90 });
    expect(r90.status).toBe('SUCCESS');
    const d90 = await PDFDocument.load(r90.outputBytes!);
    expect(d90.getPageCount()).toBe(5);
    expect(d90.getPages().map((p) => p.getRotation().angle)).toEqual([90, 180, 270, 0, 90]);
    expect(d90.getPages().map((p) => [p.getWidth(), p.getHeight()])).toEqual([
      [420, 600],
      [440, 620],
      [460, 640],
      [480, 660],
      [500, 680],
    ]);

    const r180 = await rotatePdfPagesV2({ fileName: 'mixed.pdf', bytes }, { angleDegrees: 180 });
    expect(r180.status).toBe('SUCCESS');
    const d180 = await PDFDocument.load(r180.outputBytes!);
    expect(d180.getPages().map((p) => p.getRotation().angle)).toEqual([180, 270, 0, 90, 180]);

    const r270 = await rotatePdfPagesV2({ fileName: 'mixed.pdf', bytes }, { angleDegrees: 270 });
    expect(r270.status).toBe('SUCCESS');
    const d270 = await PDFDocument.load(r270.outputBytes!);
    expect(d270.getPages().map((p) => p.getRotation().angle)).toEqual([270, 0, 90, 180, 270]);

    const rNeg90 = await rotatePdfPagesV2({ fileName: 'mixed.pdf', bytes }, { angleDegrees: -90 });
    expect(rNeg90.status).toBe('SUCCESS');
    const dNeg90 = await PDFDocument.load(rNeg90.outputBytes!);
    expect(dNeg90.getPages().map((p) => p.getRotation().angle)).toEqual([270, 0, 90, 180, 270]);

    const rNeg180 = await rotatePdfPagesV2({ fileName: 'mixed.pdf', bytes }, { angleDegrees: -180 });
    expect(rNeg180.status).toBe('SUCCESS');
    const dNeg180 = await PDFDocument.load(rNeg180.outputBytes!);
    expect(dNeg180.getPages().map((p) => p.getRotation().angle)).toEqual([180, 270, 0, 90, 180]);
  });

  it('rotates single, non-sequential, first, middle, and last pages while leaving unselected pages unchanged', async () => {
    const bytes = await createMixedGeometryPdfBytes();

    const firstOnly = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 90, selection: '1' }
    );
    expect(firstOnly.status).toBe('SUCCESS');
    const docFirst = await PDFDocument.load(firstOnly.outputBytes!);
    expect(docFirst.getPages().map((p) => p.getRotation().angle)).toEqual([90, 90, 180, 270, 0]);

    const midOnly = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 180, selection: '3' }
    );
    expect(midOnly.status).toBe('SUCCESS');
    const docMid = await PDFDocument.load(midOnly.outputBytes!);
    expect(docMid.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90, 0, 270, 0]);

    const lastOnly = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 270, selection: '5' }
    );
    expect(lastOnly.status).toBe('SUCCESS');
    const docLast = await PDFDocument.load(lastOnly.outputBytes!);
    expect(docLast.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90, 180, 270, 270]);

    const nonSeq = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 90, selection: '4, 1' }
    );
    expect(nonSeq.status).toBe('SUCCESS');
    const docNonSeq = await PDFDocument.load(nonSeq.outputBytes!);
    expect(docNonSeq.getPages().map((p) => p.getRotation().angle)).toEqual([90, 90, 180, 0, 0]);

    const viaIndices = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 270, selection: { mode: 'indices', indices: [1, 3] } }
    );
    expect(viaIndices.status).toBe('SUCCESS');
    const docIdx = await PDFDocument.load(viaIndices.outputBytes!);
    expect(docIdx.getPages().map((p) => p.getRotation().angle)).toEqual([0, 0, 180, 180, 0]);
  });

  it('supports repeated sequential rotations accurately modulo 360', async () => {
    const bytes = await createMixedGeometryPdfBytes();

    const step1 = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 90, selection: '2, 5' }
    );
    expect(step1.status).toBe('SUCCESS');

    const step2 = await rotatePdfPagesV2(
      { fileName: 'step1.pdf', bytes: step1.outputBytes! },
      { angleDegrees: 270, selection: '2, 5' }
    );
    expect(step2.status).toBe('SUCCESS');
    const roundTripDoc = await PDFDocument.load(step2.outputBytes!);
    expect(roundTripDoc.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90, 180, 270, 0]);
  });

  it('rejects invalid angles, invalid/duplicate/out-of-range selections, and corrupt PDFs', async () => {
    const bytes = await createMixedGeometryPdfBytes();

    for (const badAngle of [0, 45, -30, Number.NaN]) {
      const res = await rotatePdfPagesV2(
        { fileName: 'mixed.pdf', bytes },
        { angleDegrees: badAngle }
      );
      expect(res.status).toBe('VALIDATION_ERROR');
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    }

    for (const badSel of ['', '   ', '0', '6', '2, 2', '1-3, 2', 'abc', '4-2']) {
      const res = await rotatePdfPagesV2(
        { fileName: 'mixed.pdf', bytes },
        { angleDegrees: 90, selection: badSel }
      );
      expect(res.status).toBe('VALIDATION_ERROR');
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    }

    const emptyIndices = await rotatePdfPagesV2(
      { fileName: 'mixed.pdf', bytes },
      { angleDegrees: 90, selection: { mode: 'indices', indices: [] } }
    );
    expect(emptyIndices.status).toBe('VALIDATION_ERROR');
    expect(emptyIndices.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

    const corruptRes = await rotatePdfPagesV2(
      { fileName: 'corrupt.pdf', bytes: new TextEncoder().encode('not-a-pdf') },
      { angleDegrees: 90 }
    );
    expect(corruptRes.error?.code).toBe('ERR_INVALID_PDF');
  });

  it('handles encrypted PDFs cleanly (missing password, wrong password, and valid password)', async () => {
    const encBytes = await createEncryptedMixedPdfBytes('RotateSecret!2026');

    const missingPass = await rotatePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes },
      { angleDegrees: 90, selection: '1, 3' }
    );
    expect(missingPass.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const wrongPass = await rotatePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'WrongPassword' },
      { angleDegrees: 90, selection: '1, 3' }
    );
    expect(wrongPass.error?.code).toBe('ERR_INCORRECT_PASSWORD');

    const validPass = await rotatePdfPagesV2(
      { fileName: 'enc.pdf', bytes: encBytes, password: 'RotateSecret!2026' },
      { angleDegrees: 180, selection: '1, 3' }
    );
    expect(validPass.status).toBe('SUCCESS');
    const outDoc = await PDFDocument.load(validPass.outputBytes!);
    expect(outDoc.getPageCount()).toBe(3);
    expect(outDoc.getPages().map((p) => p.getRotation().angle)).toEqual([180, 90, 0]);
    expect(outDoc.getPages().map((p) => p.getWidth())).toEqual([410, 430, 450]);
  });

  it('normalizes pdf-rotate-pages and pdf-rotate workspace parameters consistently', () => {
    const dummy = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    const defaultAll = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-rotate-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '', selectedPageIndices: [], rotationAngle: 270 }
    );
    expect(defaultAll.options?.angleDegrees).toBe(270);
    expect(defaultAll.options?.selection).toBeUndefined();

    const viaRange = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-rotate-pages',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '1, 4', selectedPageIndices: [0, 3], rotationAngle: 180 }
    );
    expect(viaRange.options?.angleDegrees).toBe(180);
    expect(viaRange.options?.selection).toEqual({
      mode: 'range-string',
      rangeExpression: '1, 4',
    });

    const viaIndicesAlias = buildNormalizedV2RequestFromWorkspaceParams(
      'pdf-rotate',
      [{ fileName: 'doc.pdf', bytes: dummy }],
      [],
      { pageRangeText: '', selectedPageIndices: [1, 2], rotationAngle: 90 }
    );
    expect(viaIndicesAlias.options?.angleDegrees).toBe(90);
    expect(viaIndicesAlias.options?.selection).toEqual({
      mode: 'indices',
      indices: [1, 2],
    });
  });
});
