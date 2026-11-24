import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import { extractPdfPagesV2 } from '../services/pdf/v2/pdfPageOrganizationEngine';
import {
  formatPageNumbersAsExpression,
  parsePageRangeExpression,
  resolvePdfPageSelection,
} from '../services/pdf/v2/pdfPageRangeParser';
import { buildNormalizedV2RequestFromWorkspaceParams } from '../services/pdf/v2/pdfWorkspaceIntegration';

async function createSamplePdfBytes(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    doc.addPage([400 + i * 20, 600]);
  }
  return doc.save();
}

describe('pdf-extract-pages: page range selection logic', () => {
  describe('parsePageRangeExpression — valid expressions & normalization', () => {
    it('parses single pages, comma lists, and contiguous ranges with arbitrary whitespace', () => {
      const single = parsePageRangeExpression('3', 5);
      expect(single.isValid).toBe(true);
      expect(single.pageNumbers).toEqual([3]);
      expect(single.pageIndices).toEqual([2]);
      expect(single.normalizedExpression).toBe('3');

      const mixed = parsePageRangeExpression(' 1 - 2 ,  4 , 5 ', 5);
      expect(mixed.isValid).toBe(true);
      expect(mixed.pageNumbers).toEqual([1, 2, 4, 5]);
      expect(mixed.pageIndices).toEqual([0, 1, 3, 4]);
      expect(mixed.normalizedExpression).toBe('1-2, 4-5');
    });

    it('handles single-page document boundaries and full-document inclusive endpoints', () => {
      const singlePageDoc = parsePageRangeExpression('1', 1);
      expect(singlePageDoc.isValid).toBe(true);
      expect(singlePageDoc.pageIndices).toEqual([0]);

      const zeroLengthRange = parsePageRangeExpression('5-5', 5);
      expect(zeroLengthRange.isValid).toBe(true);
      expect(zeroLengthRange.pageNumbers).toEqual([5]);
      expect(zeroLengthRange.pageIndices).toEqual([4]);

      const fullRange = parsePageRangeExpression('1-5', 5);
      expect(fullRange.isValid).toBe(true);
      expect(fullRange.pageNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('supports open-ended keywords (end / last) and case-insensitive presets (all, odd, even)', () => {
      const toEnd = parsePageRangeExpression('3-end', 5);
      expect(toEnd.isValid).toBe(true);
      expect(toEnd.pageNumbers).toEqual([3, 4, 5]);

      const toLast = parsePageRangeExpression('4-LAST', 5);
      expect(toLast.isValid).toBe(true);
      expect(toLast.pageNumbers).toEqual([4, 5]);

      const allPreset = parsePageRangeExpression('All Pages', 4);
      expect(allPreset.isValid).toBe(true);
      expect(allPreset.pageIndices).toEqual([0, 1, 2, 3]);
      expect(allPreset.normalizedExpression).toBe('1-4');

      const oddPreset = parsePageRangeExpression('ODD', 5);
      expect(oddPreset.isValid).toBe(true);
      expect(oddPreset.pageNumbers).toEqual([1, 3, 5]);
      expect(oddPreset.normalizedExpression).toBe('1, 3, 5');

      const evenPreset = parsePageRangeExpression('even pages', 5);
      expect(evenPreset.isValid).toBe(true);
      expect(evenPreset.pageNumbers).toEqual([2, 4]);
      expect(evenPreset.normalizedExpression).toBe('2, 4');
    });

    it('formats discrete page numbers into compact range expressions', () => {
      expect(formatPageNumbersAsExpression([])).toBe('');
      expect(formatPageNumbersAsExpression([2])).toBe('2');
      expect(formatPageNumbersAsExpression([1, 2, 3, 5, 7, 8])).toBe('1-3, 5, 7-8');
    });
  });

  describe('parsePageRangeExpression — out-of-bounds boundary conditions', () => {
    it.each([
      ['0', 5],
      ['6', 5],
      ['99', 5],
      ['0-3', 5],
      ['3-6', 5],
      ['6-end', 5],
      ['2, 10', 5],
    ])('rejects out-of-bounds expression "%s" for %i total pages', (expr, total) => {
      const res = parsePageRangeExpression(expr, total);
      expect(res.isValid).toBe(false);
      expect(res.pageIndices).toEqual([]);
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });

    it('rejects "even" preset on a 1-page document where no even pages exist', () => {
      const res = parsePageRangeExpression('even', 1);
      expect(res.isValid).toBe(false);
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });

    it.each([0, -1, 2.5, Number.NaN])(
      'rejects invalid totalPages value %s',
      (invalidTotal) => {
        const res = parsePageRangeExpression('1', invalidTotal);
        expect(res.isValid).toBe(false);
        expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
      }
    );
  });

  describe('parsePageRangeExpression — non-numeric, empty, and malformed syntax', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['null', null],
      ['undefined', undefined],
    ])('rejects %s expression', (_label, expr) => {
      const res = parsePageRangeExpression(expr, 5);
      expect(res.isValid).toBe(false);
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });

    it.each([
      'abc',
      'pages 1 to 3',
      'first',
      '1-abc',
      'abc-3',
      '1.5',
      '1.2-3',
      '-2',
      '2-',
      '1--3',
      '1..3',
      '1; 3',
      '1, , 3',
      '1, 2,',
      ',1',
      '1, xyz, 3',
      'all-5',
      '@#$',
    ])('rejects non-numeric or malformed input "%s"', (expr) => {
      const res = parsePageRangeExpression(expr, 5);
      expect(res.isValid).toBe(false);
      expect(res.pageIndices).toEqual([]);
      expect(res.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });
  });

  describe('parsePageRangeExpression — reversed & duplicate selections', () => {
    it('rejects descending ranges by default but allows them when explicitly enabled', () => {
      const rejected = parsePageRangeExpression('5-2', 5);
      expect(rejected.isValid).toBe(false);
      expect(rejected.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const allowed = parsePageRangeExpression('5-2', 5, { allowDescendingRanges: true });
      expect(allowed.isValid).toBe(true);
      expect(allowed.pageNumbers).toEqual([5, 4, 3, 2]);
      expect(allowed.pageIndices).toEqual([4, 3, 2, 1]);
    });

    it('rejects overlapping or duplicate pages by default unless allowDuplicates is true', () => {
      const dupPage = parsePageRangeExpression('2, 2', 5);
      expect(dupPage.isValid).toBe(false);
      expect(dupPage.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const overlapRange = parsePageRangeExpression('1-3, 2-4', 5);
      expect(overlapRange.isValid).toBe(false);
      expect(overlapRange.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const allowed = parsePageRangeExpression('1-3, 2-4', 5, { allowDuplicates: true });
      expect(allowed.isValid).toBe(true);
      expect(allowed.pageNumbers).toEqual([1, 2, 3, 2, 3, 4]);
    });
  });

  describe('resolvePdfPageSelection — multi-select indices & structured selection guards', () => {
    it('resolves valid 0-based thumbnail indices and rejects negative, OOB, fractional, or duplicate indices', () => {
      const valid = resolvePdfPageSelection({ mode: 'indices', indices: [0, 2, 4] }, 5);
      expect(valid.isValid).toBe(true);
      expect(valid.pageNumbers).toEqual([1, 3, 5]);
      expect(valid.normalizedExpression).toBe('1, 3, 5');

      const empty = resolvePdfPageSelection({ mode: 'indices', indices: [] }, 5);
      expect(empty.isValid).toBe(false);
      expect(empty.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const negative = resolvePdfPageSelection({ mode: 'indices', indices: [-1] }, 5);
      expect(negative.isValid).toBe(false);
      expect(negative.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const outOfBounds = resolvePdfPageSelection({ mode: 'indices', indices: [5] }, 5);
      expect(outOfBounds.isValid).toBe(false);
      expect(outOfBounds.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const nonInteger = resolvePdfPageSelection({ mode: 'indices', indices: [1.5] }, 5);
      expect(nonInteger.isValid).toBe(false);
      expect(nonInteger.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const duplicate = resolvePdfPageSelection({ mode: 'indices', indices: [1, 1] }, 5);
      expect(duplicate.isValid).toBe(false);
      expect(duplicate.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });

    it('validates orientation presets and missing selection defaults', () => {
      const noDefault = resolvePdfPageSelection(undefined, 4);
      expect(noDefault.isValid).toBe(false);
      expect(noDefault.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const withDefault = resolvePdfPageSelection(undefined, 4, { defaultToAll: true });
      expect(withDefault.isValid).toBe(true);
      expect(withDefault.pageNumbers).toEqual([1, 2, 3, 4]);

      const landscape = resolvePdfPageSelection(
        { mode: 'preset', preset: 'landscape' },
        4,
        { pageOrientations: ['portrait', 'landscape', 'portrait', 'landscape'] }
      );
      expect(landscape.isValid).toBe(true);
      expect(landscape.pageNumbers).toEqual([2, 4]);

      const noMetadata = resolvePdfPageSelection({ mode: 'preset', preset: 'portrait' }, 4);
      expect(noMetadata.isValid).toBe(false);
      expect(noMetadata.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });
  });

  describe('pdf-extract-pages workspace normalization & extraction engine boundaries', () => {
    it('normalizes typed range strings and multi-select thumbnail indices cleanly', () => {
      const dummyBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

      const fromRange = buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extract-pages',
        [{ fileName: 'sample.pdf', bytes: dummyBytes }],
        [],
        { pageRangeText: '1, 3-4', selectedPageIndices: [0, 2, 3] }
      );
      expect(fromRange.options?.selection).toEqual({
        mode: 'range-string',
        rangeExpression: '1, 3-4',
      });

      const fromThumbnails = buildNormalizedV2RequestFromWorkspaceParams(
        'pdf-extract-pages',
        [{ fileName: 'sample.pdf', bytes: dummyBytes }],
        [],
        { pageRangeText: '   ', selectedPageIndices: [1, 4] }
      );
      expect(fromThumbnails.options?.selection).toEqual({
        mode: 'indices',
        indices: [1, 4],
      });
    });

    it('extracts selected pages and rejects out-of-bounds or non-numeric selections in extractPdfPagesV2', async () => {
      const pdfBytes = await createSamplePdfBytes(5);

      const okRes = await extractPdfPagesV2(
        { fileName: 'five.pdf', bytes: pdfBytes },
        { selection: '1, 3-4' }
      );
      expect(okRes.status).toBe('SUCCESS');
      expect(okRes.primaryFile?.pageCount).toBe(3);
      expect(okRes.details?.extractedPageNumbers).toEqual([1, 3, 4]);

      const extractedDoc = await PDFDocument.load(okRes.outputBytes!);
      expect(extractedDoc.getPageCount()).toBe(3);
      expect(extractedDoc.getPages().map((p) => p.getWidth())).toEqual([420, 460, 480]);

      const oobRes = await extractPdfPagesV2(
        { fileName: 'five.pdf', bytes: pdfBytes },
        { selection: '2, 6' }
      );
      expect(oobRes.status).toBe('VALIDATION_ERROR');
      expect(oobRes.error?.code).toBe('ERR_INVALID_PAGE_RANGE');

      const nonNumericRes = await extractPdfPagesV2(
        { fileName: 'five.pdf', bytes: pdfBytes },
        { selection: 'not-a-page' }
      );
      expect(nonNumericRes.status).toBe('VALIDATION_ERROR');
      expect(nonNumericRes.error?.code).toBe('ERR_INVALID_PAGE_RANGE');
    });
  });
});
