import { createPdfProcessingError } from './pdfErrors';
import {
  PdfPageSelection,
  PdfProcessingError,
} from './pdfTypes';

export interface PageRangeParseOptions {
  /**
   * Whether duplicate pages are permitted in the selection.
   * Default: false (rejects duplicate or overlapping pages with ERR_INVALID_PAGE_RANGE).
   */
  allowDuplicates?: boolean;
  /**
   * Whether descending ranges like "5-2" are permitted.
   * Default: false (rejects reversed ranges as invalid/ambiguous with ERR_INVALID_PAGE_RANGE).
   */
  allowDescendingRanges?: boolean;
  /**
   * Optional per-page orientation array ('portrait' | 'landscape') for preset filtering.
   */
  pageOrientations?: Array<'portrait' | 'landscape'>;
}

export interface PageRangeParseResult {
  isValid: boolean;
  /** 0-based page indices in exact selected order */
  pageIndices: number[];
  /** 1-based page numbers in exact selected order */
  pageNumbers: number[];
  /** Normalized human-readable summary of the selection (e.g., "1-3, 5") */
  normalizedExpression: string;
  error?: PdfProcessingError;
}

export interface SplitRangeGroup {
  /** 1-based label for filename generation (e.g., "1-3" or "4") */
  label: string;
  /** 0-based page indices for this output document */
  pageIndices: number[];
  /** 1-based page numbers for this output document */
  pageNumbers: number[];
}

export interface SplitRangeGroupsParseResult {
  isValid: boolean;
  groups: SplitRangeGroup[];
  error?: PdfProcessingError;
}

/**
 * Formats an array of 1-based page numbers into a compact human range string (e.g., [1,2,3,5] -> "1-3, 5").
 */
export function formatPageNumbersAsExpression(pageNumbers: number[]): string {
  if (pageNumbers.length === 0) return '';
  const segments: string[] = [];
  let rangeStart = pageNumbers[0];
  let prev = pageNumbers[0];

  for (let i = 1; i < pageNumbers.length; i++) {
    const curr = pageNumbers[i];
    if (curr === prev + 1) {
      prev = curr;
    } else {
      segments.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`);
      rangeStart = curr;
      prev = curr;
    }
  }
  segments.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`);
  return segments.join(', ');
}

/**
 * Shared Page Range Parser (Phase PDF-04 — Section 3.G)
 *
 * Supports:
 * - Single pages: "1, 3, 5"
 * - Ranges: "1-3"
 * - Open-ended ranges: "4-end" (or "4-last")
 * - Combined ranges: "1-3, 5, 8-end"
 * - Odd pages: "odd" or "odd pages"
 * - Even pages: "even" or "even pages"
 * - All pages: "all" or "all pages" or "1-end"
 *
 * Strictly rejects invalid, empty, ambiguous, reversed, duplicate, or out-of-range selections
 * with `ERR_INVALID_PAGE_RANGE`.
 */
export function parsePageRangeExpression(
  expression: string | null | undefined,
  totalPages: number,
  options: PageRangeParseOptions = {}
): PageRangeParseResult {
  const allowDuplicates = options.allowDuplicates === true;
  const allowDescendingRanges = options.allowDescendingRanges === true;

  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Document total page count must be a positive integer (received ${totalPages}).`,
        { totalPages }
      ),
    };
  }

  if (typeof expression !== 'string' || expression.trim().length === 0) {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        'Page range expression cannot be empty.',
        { expression, totalPages }
      ),
    };
  }

  const trimmed = expression.trim();
  const normalizedKeyword = trimmed.toLowerCase().replace(/\s+/g, ' ');

  // 1. Check keyword presets ("all", "odd", "odd pages", "even", "even pages")
  if (normalizedKeyword === 'all' || normalizedKeyword === 'all pages') {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return {
      isValid: true,
      pageIndices: pageNumbers.map((n) => n - 1),
      pageNumbers,
      normalizedExpression: totalPages === 1 ? '1' : `1-${totalPages}`,
    };
  }

  if (normalizedKeyword === 'odd' || normalizedKeyword === 'odd pages') {
    const pageNumbers: number[] = [];
    for (let p = 1; p <= totalPages; p += 2) {
      pageNumbers.push(p);
    }
    return {
      isValid: true,
      pageIndices: pageNumbers.map((n) => n - 1),
      pageNumbers,
      normalizedExpression: formatPageNumbersAsExpression(pageNumbers),
    };
  }

  if (normalizedKeyword === 'even' || normalizedKeyword === 'even pages') {
    const pageNumbers: number[] = [];
    for (let p = 2; p <= totalPages; p += 2) {
      pageNumbers.push(p);
    }
    if (pageNumbers.length === 0) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Cannot select even pages from a ${totalPages}-page document because no even-numbered pages exist.`,
          { expression, totalPages }
        ),
      };
    }
    return {
      isValid: true,
      pageIndices: pageNumbers.map((n) => n - 1),
      pageNumbers,
      normalizedExpression: formatPageNumbersAsExpression(pageNumbers),
    };
  }

  // 2. Parse comma-separated tokens
  const rawTokens = trimmed.split(',');
  const pageNumbers: number[] = [];
  const seenPages = new Set<number>();

  for (const rawToken of rawTokens) {
    const token = rawToken.trim();
    if (token.length === 0) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Invalid empty segment in page range expression "${expression}".`,
          { expression, totalPages }
        ),
      };
    }

    // Check if token is a single positive integer
    if (/^\d+$/.test(token)) {
      const pageNum = Number(token);
      if (!Number.isSafeInteger(pageNum) || pageNum < 1 || pageNum > totalPages) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Page number ${pageNum} is out of bounds (valid range: 1 to ${totalPages}).`,
            { token, pageNum, totalPages }
          ),
        };
      }

      if (!allowDuplicates && seenPages.has(pageNum)) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Duplicate page number ${pageNum} detected in selection "${expression}".`,
            { token, duplicatePage: pageNum, expression }
          ),
        };
      }

      seenPages.add(pageNum);
      pageNumbers.push(pageNum);
      continue;
    }

    // Check if token is a range: "<start>-<end|last|number>"
    const rangeMatch = /^(\d+)\s*-\s*(\d+|end|last)$/i.exec(token);
    if (!rangeMatch) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Invalid page range syntax "${token}" in expression "${expression}".`,
          { token, expression, totalPages }
        ),
      };
    }

    const startRaw = rangeMatch[1];
    const endRaw = rangeMatch[2].toLowerCase();
    const startPage = Number(startRaw);
    const endPage = endRaw === 'end' || endRaw === 'last' ? totalPages : Number(endRaw);

    if (
      !Number.isSafeInteger(startPage) ||
      !Number.isSafeInteger(endPage) ||
      startPage < 1 ||
      endPage < 1 ||
      startPage > totalPages ||
      endPage > totalPages
    ) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Range "${token}" exceeds document bounds (valid pages: 1 to ${totalPages}).`,
          { token, startPage, endPage, totalPages }
        ),
      };
    }

    if (startPage > endPage && !allowDescendingRanges) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Ambiguous or reversed page range "${token}" (${startPage} > ${endPage}). Start page must be less than or equal to end page.`,
          { token, startPage, endPage, totalPages }
        ),
      };
    }

    const step = startPage <= endPage ? 1 : -1;
    for (let p = startPage; step > 0 ? p <= endPage : p >= endPage; p += step) {
      if (!allowDuplicates && seenPages.has(p)) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Overlapping or duplicate page ${p} in range "${token}" within selection "${expression}".`,
            { token, duplicatePage: p, expression }
          ),
        };
      }
      seenPages.add(p);
      pageNumbers.push(p);
    }
  }

  if (pageNumbers.length === 0) {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        'Page selection resolved to 0 pages.',
        { expression, totalPages }
      ),
    };
  }

  return {
    isValid: true,
    pageIndices: pageNumbers.map((n) => n - 1),
    pageNumbers,
    normalizedExpression: formatPageNumbersAsExpression(pageNumbers),
  };
}

/**
 * Resolves a structured `PdfPageSelection` object or range string into validated 0-based page indices.
 */
export function resolvePdfPageSelection(
  selection: PdfPageSelection | string | number[] | undefined | null,
  totalPages: number,
  options: PageRangeParseOptions & { defaultToAll?: boolean } = {}
): PageRangeParseResult {
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Document total page count must be a positive integer (received ${totalPages}).`,
        { totalPages }
      ),
    };
  }

  if (selection === undefined || selection === null) {
    if (options.defaultToAll) {
      return parsePageRangeExpression('all', totalPages, options);
    }
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        'A page selection is required for this operation.',
        { totalPages }
      ),
    };
  }

  if (typeof selection === 'string') {
    return parsePageRangeExpression(selection, totalPages, options);
  }

  if (Array.isArray(selection)) {
    return resolvePdfPageSelection(
      { mode: 'indices', indices: selection },
      totalPages,
      options
    );
  }

  if (selection.mode === 'range-string') {
    return parsePageRangeExpression(selection.rangeExpression, totalPages, options);
  }

  if (selection.mode === 'preset') {
    const preset = selection.preset;
    if (preset === 'all' || preset === 'odd' || preset === 'even') {
      return parsePageRangeExpression(preset, totalPages, options);
    }
    if (preset === 'portrait' || preset === 'landscape') {
      const orientations = options.pageOrientations;
      if (!orientations || orientations.length !== totalPages) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Cannot filter by "${preset}" orientation without page geometry metadata.`,
            { preset, totalPages }
          ),
        };
      }
      const pageNumbers: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (orientations[i] === preset) {
          pageNumbers.push(i + 1);
        }
      }
      if (pageNumbers.length === 0) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `No ${preset} pages were found in this ${totalPages}-page document.`,
            { preset, totalPages }
          ),
        };
      }
      return {
        isValid: true,
        pageIndices: pageNumbers.map((n) => n - 1),
        pageNumbers,
        normalizedExpression: formatPageNumbersAsExpression(pageNumbers),
      };
    }

    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Unsupported page selection preset: "${String(preset)}".`,
        { preset }
      ),
    };
  }

  if (selection.mode === 'indices') {
    const indices = selection.indices;
    if (!Array.isArray(indices) || indices.length === 0) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          'No pages were selected (indices array is empty).',
          { totalPages }
        ),
      };
    }

    const allowDuplicates = options.allowDuplicates === true;
    const seen = new Set<number>();
    const pageIndices: number[] = [];
    const pageNumbers: number[] = [];

    for (const idx of indices) {
      if (!Number.isInteger(idx) || idx < 0 || idx >= totalPages) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `0-based page index ${idx} is out of bounds (valid indices: 0 to ${totalPages - 1}).`,
            { invalidIndex: idx, totalPages }
          ),
        };
      }
      if (!allowDuplicates && seen.has(idx)) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Duplicate page index ${idx} (page ${idx + 1}) in selection.`,
            { duplicateIndex: idx, totalPages }
          ),
        };
      }
      seen.add(idx);
      pageIndices.push(idx);
      pageNumbers.push(idx + 1);
    }

    return {
      isValid: true,
      pageIndices,
      pageNumbers,
      normalizedExpression: formatPageNumbersAsExpression(pageNumbers),
    };
  }

  return {
    isValid: false,
    pageIndices: [],
    pageNumbers: [],
    normalizedExpression: '',
    error: createPdfProcessingError(
      'ERR_INVALID_PAGE_RANGE',
      `Unknown page selection mode: "${String((selection as any)?.mode)}".`
    ),
  };
}

/**
 * Validates an explicit page permutation for Reorder Pages (`pdf-reorder-pages`, `pdf-page-reordering-tool`).
 *
 * Ensures:
 * 1. The permutation length equals `totalPages`.
 * 2. Every page in the document is included exactly once (no page omitted, no page duplicated).
 * 3. Supports either 1-based page numbers (1..totalPages) or 0-based page indices (0..totalPages-1),
 *    or a string expression like "3, 1, 2" or "3-4, 1-2".
 */
export function validateReorderPermutation(
  orderInput: number[] | string | PdfPageSelection | null | undefined,
  totalPages: number,
  indexing: '1-based' | '0-based' | 'auto' = 'auto'
): PageRangeParseResult {
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Document total page count must be positive (received ${totalPages}).`
      ),
    };
  }

  let candidateZeroBased: number[] = [];

  if (typeof orderInput === 'string') {
    const parsed = parsePageRangeExpression(orderInput, totalPages, {
      allowDuplicates: false,
      allowDescendingRanges: true,
    });
    if (!parsed.isValid) {
      return parsed;
    }
    candidateZeroBased = parsed.pageIndices;
  } else if (Array.isArray(orderInput)) {
    if (orderInput.length === 0) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_REORDER_LENGTH_MISMATCH',
          `Reorder sequence is empty; expected all ${totalPages} pages.`
        ),
      };
    }

    for (const val of orderInput) {
      if (!Number.isInteger(val)) {
        return {
          isValid: false,
          pageIndices: [],
          pageNumbers: [],
          normalizedExpression: '',
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Invalid non-integer page reference "${String(val)}" in reorder permutation.`
          ),
        };
      }
    }

    let isOneBased = indexing === '1-based';
    if (indexing === 'auto') {
      const hasZero = orderInput.includes(0);
      isOneBased = !hasZero;
    }

    candidateZeroBased = isOneBased ? orderInput.map((n) => n - 1) : [...orderInput];
  } else if (orderInput && typeof orderInput === 'object') {
    const resolved = resolvePdfPageSelection(orderInput, totalPages, {
      allowDuplicates: false,
      allowDescendingRanges: true,
    });
    if (!resolved.isValid) {
      return resolved;
    }
    candidateZeroBased = resolved.pageIndices;
  } else {
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_REORDER_LENGTH_MISMATCH',
        'A page permutation is required for reordering pages.'
      ),
    };
  }

  // Verify out-of-range or duplicates first
  const seen = new Set<number>();
  for (const idx of candidateZeroBased) {
    if (idx < 0 || idx >= totalPages) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Reorder page number ${idx + 1} is out of bounds for a ${totalPages}-page document.`,
          { invalidPageNumber: idx + 1, totalPages }
        ),
      };
    }
    if (seen.has(idx)) {
      return {
        isValid: false,
        pageIndices: [],
        pageNumbers: [],
        normalizedExpression: '',
        error: createPdfProcessingError(
          'ERR_REORDER_LENGTH_MISMATCH',
          `Duplicate page ${idx + 1} detected in reorder permutation. Every page must appear exactly once.`,
          { duplicatePageNumber: idx + 1, totalPages }
        ),
      };
    }
    seen.add(idx);
  }

  // Verify length matches totalPages so no page is omitted
  if (candidateZeroBased.length !== totalPages || seen.size !== totalPages) {
    const missingPages: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!seen.has(i)) {
        missingPages.push(i + 1);
      }
    }
    return {
      isValid: false,
      pageIndices: [],
      pageNumbers: [],
      normalizedExpression: '',
      error: createPdfProcessingError(
        'ERR_REORDER_LENGTH_MISMATCH',
        `Reorder permutation must include all ${totalPages} pages without omission (received ${candidateZeroBased.length} pages; missing: ${missingPages.join(', ')}).`,
        {
          expectedCount: totalPages,
          receivedCount: candidateZeroBased.length,
          missingPages,
        }
      ),
    };
  }

  const pageNumbers = candidateZeroBased.map((i) => i + 1);
  return {
    isValid: true,
    pageIndices: candidateZeroBased,
    pageNumbers,
    normalizedExpression: pageNumbers.join(', '),
  };
}

/**
 * Parses split range specifications into individual output document groups.
 *
 * Supports:
 * 1. Explicit array of range strings: `["1-2", "3-4", "5-end"]`
 * 2. Semicolon- or comma-separated range groups: `"1-2; 3-4; 5-end"` or `"1-2, 3-4, 5"`
 *    where each token produces an independent split PDF document.
 * 3. Every-page mode (`mode: 'every-page'`): splits every page `1..totalPages` into its own 1-page PDF.
 * 4. Fixed page-count chunking (`mode: 'by-page-count'`, `pagesPerChunk: N`): splits into contiguous N-page PDFs.
 */
export function buildSplitPageGroups(
  params: {
    splitMode?: 'ranges' | 'every-page' | 'by-page-count' | 'single-selection';
    rangeGroups?: string[] | string;
    pageSelection?: PdfPageSelection | string;
    pagesPerChunk?: number;
  },
  totalPages: number
): SplitRangeGroupsParseResult {
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return {
      isValid: false,
      groups: [],
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Document total page count must be positive (received ${totalPages}).`
      ),
    };
  }

  const mode = params.splitMode || 'ranges';

  // Mode 1: Split every page into an individual 1-page PDF
  if (mode === 'every-page') {
    const groups: SplitRangeGroup[] = [];
    for (let i = 0; i < totalPages; i++) {
      groups.push({
        label: `page_${i + 1}`,
        pageIndices: [i],
        pageNumbers: [i + 1],
      });
    }
    return { isValid: true, groups };
  }

  // Mode 2: Split by fixed page count chunks (e.g. N pages per file)
  if (mode === 'by-page-count') {
    const chunkSize = Number(params.pagesPerChunk);
    if (!Number.isInteger(chunkSize) || chunkSize < 1) {
      return {
        isValid: false,
        groups: [],
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          `Pages per split chunk must be a positive integer >= 1 (received ${String(params.pagesPerChunk)}).`,
          { pagesPerChunk: params.pagesPerChunk }
        ),
      };
    }

    const groups: SplitRangeGroup[] = [];
    for (let start = 0; start < totalPages; start += chunkSize) {
      const end = Math.min(totalPages, start + chunkSize);
      const pageIndices: number[] = [];
      const pageNumbers: number[] = [];
      for (let i = start; i < end; i++) {
        pageIndices.push(i);
        pageNumbers.push(i + 1);
      }
      const label =
        pageNumbers.length === 1
          ? `page_${pageNumbers[0]}`
          : `pages_${pageNumbers[0]}-${pageNumbers[pageNumbers.length - 1]}`;
      groups.push({
        label,
        pageIndices,
        pageNumbers,
      });
    }
    return { isValid: true, groups };
  }

  // Mode 3: Single combined selection into one extracted document
  if (mode === 'single-selection') {
    const rawSel =
      params.pageSelection ??
      (typeof params.rangeGroups === 'string' ? params.rangeGroups : undefined);
    const parsed = resolvePdfPageSelection(rawSel, totalPages, { allowDuplicates: false });
    if (!parsed.isValid) {
      return {
        isValid: false,
        groups: [],
        error: parsed.error,
      };
    }
    const label =
      parsed.pageNumbers.length === 1
        ? `page_${parsed.pageNumbers[0]}`
        : `pages_${parsed.normalizedExpression.replace(/\s+/g, '').replace(/,/g, '_')}`;
    return {
      isValid: true,
      groups: [
        {
          label,
          pageIndices: parsed.pageIndices,
          pageNumbers: parsed.pageNumbers,
        },
      ],
    };
  }

  // Mode 4: Explicit range groups (each range token becomes a separate PDF file)
  let rawGroupTokens: string[] = [];
  if (Array.isArray(params.rangeGroups)) {
    rawGroupTokens = params.rangeGroups;
  } else if (typeof params.rangeGroups === 'string') {
    const trimmed = params.rangeGroups.trim();
    if (trimmed.length === 0) {
      return {
        isValid: false,
        groups: [],
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          'Split range specification cannot be empty.'
        ),
      };
    }
    // If semicolon-separated, each semicolon segment can contain comma-combined ranges;
    // otherwise each comma-separated token is a distinct split output document.
    rawGroupTokens = trimmed.includes(';') ? trimmed.split(';') : trimmed.split(',');
  } else if (params.pageSelection) {
    if (typeof params.pageSelection === 'string') {
      const trimmed = params.pageSelection.trim();
      if (trimmed.length === 0) {
        return {
          isValid: false,
          groups: [],
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            'Split page selection cannot be empty.'
          ),
        };
      }
      rawGroupTokens = trimmed.includes(';') ? trimmed.split(';') : trimmed.split(',');
    } else if (
      params.pageSelection.mode === 'range-string' &&
      typeof params.pageSelection.rangeExpression === 'string'
    ) {
      const trimmed = params.pageSelection.rangeExpression.trim();
      if (trimmed.length === 0) {
        return {
          isValid: false,
          groups: [],
          error: createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            'Split range expression cannot be empty.'
          ),
        };
      }
      rawGroupTokens = trimmed.includes(';') ? trimmed.split(';') : trimmed.split(',');
    } else {
      // Indices or preset selection: validate and split each selected page or group
      const resolved = resolvePdfPageSelection(params.pageSelection, totalPages, {
        allowDuplicates: false,
      });
      if (!resolved.isValid) {
        return {
          isValid: false,
          groups: [],
          error: resolved.error,
        };
      }
      return {
        isValid: true,
        groups: resolved.pageIndices.map((idx) => ({
          label: `page_${idx + 1}`,
          pageIndices: [idx],
          pageNumbers: [idx + 1],
        })),
      };
    }
  } else {
    // Default when no rangeGroups or pageSelection provided: split every page
    return buildSplitPageGroups({ splitMode: 'every-page' }, totalPages);
  }

  if (rawGroupTokens.length === 0) {
    return {
      isValid: false,
      groups: [],
      error: createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        'No split ranges were specified.'
      ),
    };
  }

  const groups: SplitRangeGroup[] = [];
  for (const rawToken of rawGroupTokens) {
    const token = rawToken.trim();
    if (token.length === 0) {
      return {
        isValid: false,
        groups: [],
        error: createPdfProcessingError(
          'ERR_INVALID_PAGE_RANGE',
          'Empty split range group token encountered.'
        ),
      };
    }

    const parsed = parsePageRangeExpression(token, totalPages, { allowDuplicates: false });
    if (!parsed.isValid) {
      return {
        isValid: false,
        groups: [],
        error: parsed.error,
      };
    }

    const label =
      parsed.pageNumbers.length === 1
        ? `page_${parsed.pageNumbers[0]}`
        : `pages_${parsed.normalizedExpression.replace(/\s+/g, '').replace(/,/g, '_')}`;

    groups.push({
      label,
      pageIndices: parsed.pageIndices,
      pageNumbers: parsed.pageNumbers,
    });
  }

  return {
    isValid: true,
    groups,
  };
}
