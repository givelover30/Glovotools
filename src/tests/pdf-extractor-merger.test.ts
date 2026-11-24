import { PDFDocument, StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { executePageOrganizationOperationV2 } from '../services/pdf/v2/pdfPageOrganizationEngine';
import {
  buildNormalizedV2RequestFromWorkspaceParams,
  executePdfWorkspaceOperationV2,
} from '../services/pdf/v2/pdfWorkspaceIntegration';

async function createOnePagePdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  doc.addPage([612, 792]).drawText('SINGLE_P1', { x: 40, y: 700, size: 18, font, color: rgb(0, 0, 0) });
  return doc.save({ updateFieldAppearances: false });
}

async function createMixedFourPagePdfBytes(prefix = 'FOUR'): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const specs = [
    { label: `${prefix}_P1`, w: 612, h: 792, rot: 0 },
    { label: `${prefix}_P2`, w: 595.28, h: 841.89, rot: 90 },
    { label: `${prefix}_P3`, w: 612, h: 1008, rot: 180 },
    { label: `${prefix}_P4`, w: 420, h: 595, rot: 270 },
  ];
  for (const s of specs) {
    const p = doc.addPage([s.w, s.h]);
    p.setRotation(degrees(s.rot));
    p.drawText(s.label, { x: 40, y: 240, size: 18, font, color: rgb(0, 0, 0) });
  }
  return doc.save({ updateFieldAppearances: false });
}

async function createTwoPageDistinctPdfBytes(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const p1 = doc.addPage([500, 700]);
  p1.setRotation(degrees(90));
  p1.drawText('TWO_P1', { x: 40, y: 300, size: 18, font });
  const p2 = doc.addPage([400, 600]);
  p2.setRotation(degrees(180));
  p2.drawText('TWO_P2', { x: 40, y: 300, size: 18, font });
  return doc.save({ updateFieldAppearances: false });
}

async function createEncryptedThreePagePdfBytes(password: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([612, 792]);
    p.setRotation(degrees((i - 1) * 90));
    p.drawText(`ENC_EM_P${i}`, { x: 40, y: 300, size: 18, font });
  }
  await doc.encrypt({
    userPassword: password,
    ownerPassword: `${password}_OWNER`,
  });
  return doc.save({ updateFieldAppearances: false });
}

describe('pdf-extractor-merger: single-file extraction, multi-file merge, selection normalization & error handling', () => {
  it('returns clear ERR_INVALID_PAGE_RANGE (not ERR_SECOND_FILE_REQUIRED) when 1 valid PDF is submitted without selection', async () => {
    const fourBytes = await createMixedFourPagePdfBytes();
    const snapshot = new Uint8Array(fourBytes);

    const res = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'four.pdf', bytes: fourBytes }],
        [],
        {}
      )
    );

    expect(fourBytes).toEqual(snapshot);
    expect(res.status).toBe('VALIDATION_ERROR');
    expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    expect(res.error?.message).toMatch(/With 1 PDF uploaded, select specific pages/i);
  });

  it('extracts partial thumbnail selections, all pages, and manual ranges from 1 PDF in exact order while preserving geometry', async () => {
    const fourBytes = await createMixedFourPagePdfBytes();

    // Partial thumbnail selection in custom order [2, 0] -> pages 3, 1
    const partialRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'four.pdf', bytes: fourBytes }],
        [],
        { selectedPageIndices: [2, 0] }
      )
    );
    expect(partialRes.status).toBe('SUCCESS');
    expect(partialRes.resolvedCanonicalId).toBe('pdf-extractor-merger');
    expect(partialRes.primaryOutput?.fileName).toBe('four_extracted_pages_3_1.pdf');
    expect(partialRes.primaryOutput?.pageCount).toBe(2);

    const docPartial = await PDFDocument.load(partialRes.outputBytes!);
    expect(docPartial.getPageCount()).toBe(2);
    expect(docPartial.getPages().map((p) => p.getRotation().angle)).toEqual([180, 0]);
    expect(docPartial.getPages().map((p) => Math.round(p.getWidth()))).toEqual([612, 612]);

    // Manual range "2, 4"
    const rangeRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'four.pdf', bytes: fourBytes }],
        [],
        { pageRangeText: '2, 4' }
      )
    );
    expect(rangeRes.status).toBe('SUCCESS');
    expect(rangeRes.primaryOutput?.fileName).toBe('four_extracted_pages_2_4.pdf');
    const docRange = await PDFDocument.load(rangeRes.outputBytes!);
    expect(docRange.getPageCount()).toBe(2);
    expect(docRange.getPages().map((p) => p.getRotation().angle)).toEqual([90, 270]);
    expect(docRange.getPages().map((p) => Math.round(p.getWidth()))).toEqual([595, 420]);

    // "all" preset distinguishes all pages from no selection
    const allRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'four.pdf', bytes: fourBytes }],
        [],
        { pageRangeText: 'all' }
      )
    );
    expect(allRes.status).toBe('SUCCESS');
    expect(allRes.primaryOutput?.pageCount).toBe(4);
  });

  it('merges 2+ PDFs in uploaded order and supports per-file selective extraction across multiple files', async () => {
    const fourBytes = await createMixedFourPagePdfBytes();
    const twoBytes = await createTwoPageDistinctPdfBytes();
    const oneBytes = await createOnePagePdfBytes();

    // Multi-file merge via workspace params
    const mergeAllRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [
          { fileName: 'four.pdf', bytes: fourBytes },
          { fileName: 'two.pdf', bytes: twoBytes },
          { fileName: 'one.pdf', bytes: oneBytes },
        ],
        [],
        {}
      )
    );
    expect(mergeAllRes.status).toBe('SUCCESS');
    expect(mergeAllRes.primaryOutput?.fileName).toBe('four_merged.pdf');
    expect(mergeAllRes.primaryOutput?.pageCount).toBe(7);

    const mergedDoc = await PDFDocument.load(mergeAllRes.outputBytes!);
    expect(mergedDoc.getPageCount()).toBe(7);
    expect(mergedDoc.getPages().map((p) => p.getRotation().angle)).toEqual([0, 90, 180, 270, 90, 180, 0]);
    expect(mergedDoc.getPages().map((p) => Math.round(p.getWidth()))).toEqual([612, 595, 612, 420, 500, 400, 612]);

    // Per-file selective extract & merge via engine API
    const selectiveMergeRes = await executePageOrganizationOperationV2({
      toolId: 'pdf-extractor-merger',
      inputs: [
        { fileName: 'four.pdf', bytes: fourBytes, pageSelection: { mode: 'range-string', rangeExpression: '4, 2' } },
        { fileName: 'two.pdf', bytes: twoBytes, pageSelection: { mode: 'indices', indices: [0] } },
      ],
    });
    expect(selectiveMergeRes.status).toBe('SUCCESS');
    expect(selectiveMergeRes.primaryFile?.pageCount).toBe(3);
    const selDoc = await PDFDocument.load(selectiveMergeRes.outputBytes!);
    expect(selDoc.getPages().map((p) => p.getRotation().angle)).toEqual([270, 90, 90]);
    expect(selDoc.getPages().map((p) => Math.round(p.getWidth()))).toEqual([420, 595, 500]);
  });

  it('rejects empty, corrupt, non-PDF, out-of-range, and duplicate selections cleanly', async () => {
    const fourBytes = await createMixedFourPagePdfBytes();
    const oneBytes = await createOnePagePdfBytes();

    const emptyRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'empty.pdf', bytes: new Uint8Array(0) }],
        [],
        {}
      )
    );
    expect(emptyRes.error?.code).toBe('ERR_EMPTY_FILE');

    const nonPdfRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'fake.png', bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) }],
        [],
        {}
      )
    );
    expect(nonPdfRes.error?.code).toBe('ERR_INVALID_PDF');

    const corruptRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'corrupt.pdf', bytes: new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<< /Broken >>\n%%EOF') }],
        [],
        { pageRangeText: '1' }
      )
    );
    expect(corruptRes.status).not.toBe('SUCCESS');

    const oobRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'one.pdf', bytes: oneBytes }],
        [],
        { pageRangeText: '2' }
      )
    );
    expect(oobRes.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

    const dupRes = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'four.pdf', bytes: fourBytes }],
        [],
        { pageRangeText: '1, 1' }
      )
    );
    expect(dupRes.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
  });

  it('handles encrypted PDFs cleanly in single-file and multi-file modes', async () => {
    const encBytes = await createEncryptedThreePagePdfBytes('MergeSecret2026!');
    const oneBytes = await createOnePagePdfBytes();

    const missingPass = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'locked.pdf', bytes: encBytes }],
        [],
        { pageRangeText: '1, 3' }
      )
    );
    expect(missingPass.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const missingPassNoSel = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'locked.pdf', bytes: encBytes }],
        [],
        {}
      )
    );
    expect(missingPassNoSel.error?.code).toBe('ERR_PASSWORD_REQUIRED');

    const wrongPass = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'locked.pdf', bytes: encBytes }],
        [],
        { pageRangeText: '1, 3', password: 'WrongPassword!' }
      )
    );
    expect(wrongPass.error?.code).toBe('ERR_INCORRECT_PASSWORD');

    const validSingle = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [{ fileName: 'locked.pdf', bytes: encBytes }],
        [],
        { pageRangeText: '3, 1', password: 'MergeSecret2026!' }
      )
    );
    expect(validSingle.status).toBe('SUCCESS');
    const singleDoc = await PDFDocument.load(validSingle.outputBytes!);
    expect(singleDoc.getPageCount()).toBe(2);
    expect(singleDoc.getPages().map((p) => p.getRotation().angle)).toEqual([180, 0]);

    const validMulti = await executePdfWorkspaceOperationV2(
      buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extractor-merger',
        [
          { fileName: 'locked.pdf', bytes: encBytes },
          { fileName: 'one.pdf', bytes: oneBytes },
        ],
        [],
        { password: 'MergeSecret2026!' }
      )
    );
    expect(validMulti.status).toBe('SUCCESS');
    expect(validMulti.primaryOutput?.pageCount).toBe(4);
  });
});
