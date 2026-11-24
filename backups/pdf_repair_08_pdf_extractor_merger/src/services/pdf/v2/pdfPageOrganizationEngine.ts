import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import JSZip from 'jszip';
import { cloneIsolatedPdfBytes, inspectByteLength } from './pdfByteUtils';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { serializeAndVerifyPdfV2 } from './pdfOutputIntegrity';
import {
  buildSplitPageGroups,
  resolvePdfPageSelection,
  validateReorderPermutation,
} from './pdfPageRangeParser';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfLoadResult,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfPageSelection,
  PdfProcessingError,
} from './pdfTypes';

export interface PdfMergeOptions {
  /** Custom output file name (default: "merged.pdf") */
  outputFileName?: string;
}

export interface PdfSplitOptions {
  /**
   * Split strategy:
   * - 'ranges': Split into separate PDF documents for each range group (default for pdf-split)
   * - 'every-page': Split every page into an individual 1-page PDF document
   * - 'by-page-count': Split into contiguous N-page PDF documents (default for pdf-split-by-page-count-tool)
   */
  splitMode?: 'ranges' | 'every-page' | 'by-page-count';
  /** Range expressions (e.g. ["1-2", "3-4"] or "1-2, 3-4" or "1-2; 3, 5") */
  rangeGroups?: string[] | string;
  /** Number of pages per split chunk when splitMode === 'by-page-count' */
  pagesPerChunk?: number;
  /** Always package output into a ZIP archive even when only 1 split group is produced (default: true for multi-file, false for single-file unless requested) */
  alwaysPackageZip?: boolean;
  /** Custom base file name */
  outputBaseName?: string;
}

export interface PdfExtractPagesOptions {
  /** Page selection or 1-based range string (e.g., "1-3, 5, 8-end", "odd", "even") */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfDeletePagesOptions {
  /** Pages to delete (1-based range string, PdfPageSelection, or 0-based indices via PdfPageSelection) */
  selection?: PdfPageSelection | string | number[];
  /** Explicitly allow deleting all pages (default: false — rejects with ERR_CANNOT_DELETE_ALL_PAGES) */
  allowEmptyDocument?: boolean;
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfReorderPagesOptions {
  /**
   * New page order permutation.
   * Can be 1-based page numbers (e.g. [3, 1, 2]), 0-based page indices (when indexing === '0-based'),
   * or a comma-separated 1-based range expression (e.g. "3, 1, 2").
   */
  newOrder?: number[] | string;
  /** Explicit indexing mode when passing number[] (default: 'auto' — 1-based unless 0 is present) */
  indexing?: '1-based' | '0-based' | 'auto';
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfRotatePagesOptions {
  /**
   * Rotation increment in degrees. Must be a non-zero multiple of 90 (e.g., 90, 180, 270, -90, -180, -270).
   */
  angleDegrees: number;
  /**
   * Whether `angleDegrees` is added relative to the page's current rotation (default: true)
   * or sets an absolute orientation.
   */
  relative?: boolean;
  /** Pages to rotate (defaults to 'all' if omitted) */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export type PageOrganizationOptions =
  | PdfMergeOptions
  | PdfSplitOptions
  | PdfExtractPagesOptions
  | PdfDeletePagesOptions
  | PdfReorderPagesOptions
  | PdfRotatePagesOptions
  | Record<string, unknown>;

function stripPdfExtension(fileName: string | undefined, fallback = 'document'): string {
  if (!fileName || typeof fileName !== 'string') return fallback;
  const cleaned = fileName.trim().replace(/\.pdf$/i, '');
  return cleaned.length > 0 ? cleaned : fallback;
}

function buildErrorResult(
  resolvedCanonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytes = 0,
  warnings: string[] = [],
  limitations: string[] = []
): PdfOperationResult {
  return {
    status: error.status,
    resolvedCanonicalId,
    outputFiles: [],
    summary: error.message,
    metrics: {
      inputBytes,
      outputBytes: 0,
      durationMs: Math.round((performance.now() - startTime) * 100) / 100,
    },
    warnings,
    limitations,
    error,
  };
}

function extractPageOrientations(doc: PDFDocument): Array<'portrait' | 'landscape'> {
  const count = doc.getPageCount();
  const orientations: Array<'portrait' | 'landscape'> = [];
  for (let i = 0; i < count; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const rot = ((page.getRotation().angle % 360) + 360) % 360;
    const effectiveWidth = rot === 90 || rot === 270 ? height : width;
    const effectiveHeight = rot === 90 || rot === 270 ? width : height;
    orientations.push(effectiveWidth > effectiveHeight ? 'landscape' : 'portrait');
  }
  return orientations;
}

/**
 * Copies selected pages from `sourceDoc` into `targetDoc`, explicitly preserving
 * MediaBox, CropBox (if present), and rotation angle.
 */
async function copySelectedPagesPreservingGeometry(
  sourceDoc: PDFDocument,
  targetDoc: PDFDocument,
  pageIndices: number[]
): Promise<void> {
  const copiedPages = await targetDoc.copyPages(sourceDoc, pageIndices);
  for (let i = 0; i < copiedPages.length; i++) {
    const srcPage = sourceDoc.getPage(pageIndices[i]);
    const dstPage = copiedPages[i];

    // Explicitly preserve original MediaBox and rotation
    const mediaBox = srcPage.getMediaBox();
    dstPage.setMediaBox(mediaBox.x, mediaBox.y, mediaBox.width, mediaBox.height);

    const rotAngle = srcPage.getRotation().angle;
    dstPage.setRotation(degrees(rotAngle));

    targetDoc.addPage(dstPage);
  }
}

/**
 * ============================================================================
 * A. PDF MERGE (`pdf-merge`, `pdf-extractor-merger`)
 * ============================================================================
 * Merges two or more valid PDFs (or extracts & merges selected pages across files
 * for `pdf-extractor-merger`), preserving page order, dimensions, and rotation.
 */
export async function mergePdfsV2(
  inputs: PdfDocumentInput[],
  options: PdfMergeOptions & {
    canonicalId?: string;
    allowSingleFileWithSelection?: boolean;
    globalPageSelection?: PdfPageSelection;
  } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-merge';
  const warnings: string[] = [];
  const loadedSessions: PdfLoadResult[] = [];

  const totalInputBytes = Array.isArray(inputs)
    ? inputs.reduce((acc, item) => acc + inspectByteLength(item?.bytes), 0)
    : 0;

  try {
    if (!Array.isArray(inputs) || inputs.length === 0) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF files were provided for merging.'),
        startTime,
        0
      );
    }

    const minRequired = options.allowSingleFileWithSelection ? 1 : 2;
    if (inputs.length < minRequired) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_SECOND_FILE_REQUIRED',
          `PDF Merge requires at least 2 input PDF files (received ${inputs.length}).`,
          { inputFileCount: inputs.length }
        ),
        startTime,
        totalInputBytes
      );
    }

    // Load and validate every input PDF before creating the merged output
    for (let i = 0; i < inputs.length; i++) {
      const inputItem = inputs[i];
      if (!inputItem || !inputItem.bytes) {
        return buildErrorResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_EMPTY_FILE',
            `Input file #${i + 1} is missing or empty.`
          ),
          startTime,
          totalInputBytes,
          warnings
        );
      }

      const loadRes = await loadPdfDocumentV2(inputItem, {
        password: inputItem.password,
      });
      loadedSessions.push(loadRes);
      warnings.push(...loadRes.warnings);

      if (!loadRes.success || !loadRes.document || loadRes.error) {
        return buildErrorResult(
          canonicalId,
          loadRes.error ||
            createPdfProcessingError(
              'ERR_INVALID_PDF',
              `Input file "${inputItem.fileName || `#${i + 1}`}" is not a valid PDF.`
            ),
          startTime,
          totalInputBytes,
          warnings
        );
      }
    }

    const mergedDoc = await PDFDocument.create();
    let totalInputPages = 0;
    let totalMergedPages = 0;

    for (let i = 0; i < loadedSessions.length; i++) {
      const srcDoc = loadedSessions[i].document!;
      const srcInput = inputs[i];
      const docPageCount = srcDoc.getPageCount();
      totalInputPages += docPageCount;

      const effectiveSelection =
        srcInput.pageSelection ??
        (inputs.length === 1 ? options.globalPageSelection : undefined);

      let indicesToCopy: number[];
      if (effectiveSelection) {
        const orientations = extractPageOrientations(srcDoc);
        const parsedSel = resolvePdfPageSelection(effectiveSelection, docPageCount, {
          allowDuplicates: false,
          pageOrientations: orientations,
        });
        if (!parsedSel.isValid || parsedSel.error) {
          return buildErrorResult(
            canonicalId,
            parsedSel.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
            startTime,
            totalInputBytes,
            warnings
          );
        }
        indicesToCopy = parsedSel.pageIndices;
      } else {
        indicesToCopy = Array.from({ length: docPageCount }, (_, idx) => idx);
      }

      await copySelectedPagesPreservingGeometry(srcDoc, mergedDoc, indicesToCopy);
      totalMergedPages += indicesToCopy.length;
    }

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      mergedDoc,
      { useObjectStreams: true },
      { expectedPageCount: totalMergedPages, verifyWithPdfJs: true }
    );

    if (!integrity.isValid || integrity.error) {
      return buildErrorResult(
        canonicalId,
        integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
        startTime,
        totalInputBytes,
        warnings
      );
    }

    const firstBase = stripPdfExtension(inputs[0]?.fileName, 'document');
    const outputFileName =
      options.outputFileName ||
      (canonicalId === 'pdf-extractor-merger' && inputs.length === 1
        ? `${firstBase}_extracted_merged.pdf`
        : `${firstBase}_merged.pdf`);

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: totalMergedPages,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Merged ${inputs.length} PDF document(s) into "${outputFileName}" (${totalMergedPages} pages).`,
      metrics: {
        inputBytes: totalInputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalInputPages,
        outputPageCount: totalMergedPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        mergedFileCount: inputs.length,
        inputPageCount: totalInputPages,
        outputPageCount: totalMergedPages,
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      totalInputBytes,
      warnings
    );
  } finally {
    for (const session of loadedSessions) {
      await session.dispose();
    }
  }
}

/**
 * ============================================================================
 * B. PDF SPLIT (`pdf-split`, `pdf-split-by-page-count-tool`)
 * ============================================================================
 * Splits a valid PDF into separate PDF documents by page ranges, by fixed page
 * count chunks, or every page into an individual PDF, verifying every generated
 * PDF document and packaging multiple outputs into a valid ZIP archive.
 */
export async function splitPdfV2(
  input: PdfDocumentInput,
  options: PdfSplitOptions & {
    canonicalId?: string;
    pageSelection?: PdfPageSelection;
  } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-split';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for splitting.'),
      startTime,
      0
    );
  }

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (!loadRes.success || !loadRes.document || loadRes.error) {
      return buildErrorResult(
        canonicalId,
        loadRes.error || createPdfProcessingError('ERR_INVALID_PDF'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const srcDoc = loadRes.document;
    const totalPages = srcDoc.getPageCount();

    const defaultMode =
      canonicalId === 'pdf-split-by-page-count-tool'
        ? 'by-page-count'
        : options.splitMode ||
          (options.rangeGroups || options.pageSelection || input.pageSelection
            ? 'ranges'
            : 'every-page');

    const splitGroupsResult = buildSplitPageGroups(
      {
        splitMode: defaultMode,
        rangeGroups: options.rangeGroups,
        pageSelection: options.pageSelection ?? input.pageSelection,
        pagesPerChunk:
          options.pagesPerChunk ??
          (canonicalId === 'pdf-split-by-page-count-tool' ? 1 : undefined),
      },
      totalPages
    );

    if (!splitGroupsResult.isValid || splitGroupsResult.error) {
      return buildErrorResult(
        canonicalId,
        splitGroupsResult.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const groups = splitGroupsResult.groups;
    const baseName = options.outputBaseName || stripPdfExtension(input.fileName, 'document');
    const generatedPdfFiles: PdfOutputFile[] = [];
    let totalGeneratedPages = 0;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const partDoc = await PDFDocument.create();
      await copySelectedPagesPreservingGeometry(srcDoc, partDoc, group.pageIndices);

      const { bytes: partBytes, integrity } = await serializeAndVerifyPdfV2(
        partDoc,
        { useObjectStreams: true },
        { expectedPageCount: group.pageIndices.length, verifyWithPdfJs: true }
      );

      if (!integrity.isValid || integrity.error) {
        return buildErrorResult(
          canonicalId,
          integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
          startTime,
          inputBytes,
          warnings
        );
      }

      const partFileName = `${baseName}_part_${i + 1}_${group.label}.pdf`;
      generatedPdfFiles.push({
        fileName: partFileName,
        mimeType: 'application/pdf',
        bytes: partBytes,
        byteLength: partBytes.byteLength,
        pageCount: group.pageIndices.length,
      });
      totalGeneratedPages += group.pageIndices.length;
    }

    const shouldPackageZip =
      generatedPdfFiles.length > 1 || options.alwaysPackageZip === true;

    if (shouldPackageZip) {
      const zip = new JSZip();
      for (const pdfFile of generatedPdfFiles) {
        zip.file(pdfFile.fileName, pdfFile.bytes);
      }
      const rawZipBytes = await zip.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      const zipBytes = cloneIsolatedPdfBytes(rawZipBytes);
      const zipFileName = `${baseName}_split_${generatedPdfFiles.length}_files.zip`;

      const primaryZipFile: PdfOutputFile = {
        fileName: zipFileName,
        mimeType: 'application/zip',
        bytes: zipBytes,
        byteLength: zipBytes.byteLength,
        pageCount: totalGeneratedPages,
      };

      return {
        status: 'SUCCESS',
        resolvedCanonicalId: canonicalId,
        primaryFile: primaryZipFile,
        outputFiles: generatedPdfFiles,
        outputBytes: zipBytes,
        summary: `Split "${input.fileName}" (${totalPages} pages) into ${generatedPdfFiles.length} PDF documents packaged in "${zipFileName}".`,
        metrics: {
          inputBytes,
          outputBytes: zipBytes.byteLength,
          inputPageCount: totalPages,
          outputPageCount: totalGeneratedPages,
          durationMs: Math.round((performance.now() - startTime) * 100) / 100,
        },
        warnings,
        limitations: [],
        details: {
          splitFileCount: generatedPdfFiles.length,
          packagedInZip: true,
          zipFileName,
          partFileNames: generatedPdfFiles.map((f) => f.fileName),
        },
      };
    }

    const singlePdf = generatedPdfFiles[0];
    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile: singlePdf,
      outputFiles: generatedPdfFiles,
      outputBytes: singlePdf.bytes,
      summary: `Split "${input.fileName}" into "${singlePdf.fileName}" (${singlePdf.pageCount} pages).`,
      metrics: {
        inputBytes,
        outputBytes: singlePdf.byteLength,
        inputPageCount: totalPages,
        outputPageCount: singlePdf.pageCount,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        splitFileCount: 1,
        packagedInZip: false,
        partFileNames: [singlePdf.fileName],
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      inputBytes,
      warnings
    );
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * C. EXTRACT PAGES (`pdf-extract-pages`, `pdf-page-extraction-tool`)
 * ============================================================================
 * Extracts selected pages into a new PDF in exact selected order.
 */
export async function extractPdfPagesV2(
  input: PdfDocumentInput,
  options: PdfExtractPagesOptions & { canonicalId?: string } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-extract-pages';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for page extraction.'),
      startTime,
      0
    );
  }

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (!loadRes.success || !loadRes.document || loadRes.error) {
      return buildErrorResult(
        canonicalId,
        loadRes.error || createPdfProcessingError('ERR_INVALID_PDF'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const srcDoc = loadRes.document;
    const totalPages = srcDoc.getPageCount();
    const orientations = extractPageOrientations(srcDoc);

    const rawSelection = options.selection ?? input.pageSelection;
    const parsed = resolvePdfPageSelection(rawSelection, totalPages, {
      allowDuplicates: false,
      pageOrientations: orientations,
    });

    if (!parsed.isValid || parsed.error) {
      return buildErrorResult(
        canonicalId,
        parsed.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const extractedDoc = await PDFDocument.create();
    await copySelectedPagesPreservingGeometry(srcDoc, extractedDoc, parsed.pageIndices);

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      extractedDoc,
      { useObjectStreams: true },
      { expectedPageCount: parsed.pageIndices.length, verifyWithPdfJs: true }
    );

    if (!integrity.isValid || integrity.error) {
      return buildErrorResult(
        canonicalId,
        integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const baseName = stripPdfExtension(input.fileName, 'document');
    const outputFileName =
      options.outputFileName ||
      `${baseName}_extracted_pages_${parsed.normalizedExpression.replace(/\s+/g, '').replace(/,/g, '_')}.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: parsed.pageIndices.length,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Extracted ${parsed.pageIndices.length} page(s) (${parsed.normalizedExpression}) from "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: parsed.pageIndices.length,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        extractedPageNumbers: parsed.pageNumbers,
        extractedPageIndices: parsed.pageIndices,
        normalizedExpression: parsed.normalizedExpression,
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      inputBytes,
      warnings
    );
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * D. DELETE PAGES (`pdf-delete-pages`)
 * ============================================================================
 * Removes selected pages from a PDF document while rejecting invalid selections
 * and preventing accidental empty output (`ERR_CANNOT_DELETE_ALL_PAGES`).
 */
export async function deletePdfPagesV2(
  input: PdfDocumentInput,
  options: PdfDeletePagesOptions & { canonicalId?: string } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-delete-pages';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for deleting pages.'),
      startTime,
      0
    );
  }

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (!loadRes.success || !loadRes.document || loadRes.error) {
      return buildErrorResult(
        canonicalId,
        loadRes.error || createPdfProcessingError('ERR_INVALID_PDF'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const srcDoc = loadRes.document;
    const totalPages = srcDoc.getPageCount();
    const orientations = extractPageOrientations(srcDoc);

    const rawSelection = options.selection ?? input.pageSelection;
    const parsedDelete = resolvePdfPageSelection(rawSelection, totalPages, {
      allowDuplicates: false,
      pageOrientations: orientations,
    });

    if (!parsedDelete.isValid || parsedDelete.error) {
      return buildErrorResult(
        canonicalId,
        parsedDelete.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const deleteSet = new Set<number>(parsedDelete.pageIndices);
    const remainingIndices: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!deleteSet.has(i)) {
        remainingIndices.push(i);
      }
    }

    if (remainingIndices.length === 0 && !options.allowEmptyDocument) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_CANNOT_DELETE_ALL_PAGES',
          `Cannot delete all ${totalPages} page(s) from the PDF document; at least 1 page must remain.`,
          {
            totalPages,
            deletedPageCount: deleteSet.size,
          }
        ),
        startTime,
        inputBytes,
        warnings
      );
    }

    const outDoc = await PDFDocument.create();
    if (remainingIndices.length > 0) {
      await copySelectedPagesPreservingGeometry(srcDoc, outDoc, remainingIndices);
    }

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      outDoc,
      { useObjectStreams: true },
      { expectedPageCount: remainingIndices.length, verifyWithPdfJs: remainingIndices.length > 0 }
    );

    if (!integrity.isValid || integrity.error) {
      return buildErrorResult(
        canonicalId,
        integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const baseName = stripPdfExtension(input.fileName, 'document');
    const outputFileName = options.outputFileName || `${baseName}_deleted_pages.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: remainingIndices.length,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Deleted ${deleteSet.size} page(s) (${parsedDelete.normalizedExpression}) from "${input.fileName}"; ${remainingIndices.length} page(s) remain.`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: remainingIndices.length,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        deletedPageNumbers: parsedDelete.pageNumbers,
        remainingPageNumbers: remainingIndices.map((i) => i + 1),
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      inputBytes,
      warnings
    );
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * E. REORDER PAGES (`pdf-reorder-pages`, `pdf-page-reordering-tool`)
 * ============================================================================
 * Reorders pages using an explicit page permutation and verifies that no page
 * is accidentally omitted or duplicated.
 */
export async function reorderPdfPagesV2(
  input: PdfDocumentInput,
  options: PdfReorderPagesOptions & {
    canonicalId?: string;
    pageSelection?: PdfPageSelection;
  } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-reorder-pages';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for reordering pages.'),
      startTime,
      0
    );
  }

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (!loadRes.success || !loadRes.document || loadRes.error) {
      return buildErrorResult(
        canonicalId,
        loadRes.error || createPdfProcessingError('ERR_INVALID_PDF'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const srcDoc = loadRes.document;
    const totalPages = srcDoc.getPageCount();

    const orderSource =
      options.newOrder ?? options.pageSelection ?? input.pageSelection;
    const indexingMode =
      options.indexing ??
      (options.newOrder === undefined &&
      (options.pageSelection?.mode === 'indices' || input.pageSelection?.mode === 'indices')
        ? '0-based'
        : 'auto');

    const permutation = validateReorderPermutation(orderSource, totalPages, indexingMode);
    if (!permutation.isValid || permutation.error) {
      return buildErrorResult(
        canonicalId,
        permutation.error || createPdfProcessingError('ERR_REORDER_LENGTH_MISMATCH'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const reorderedDoc = await PDFDocument.create();
    await copySelectedPagesPreservingGeometry(srcDoc, reorderedDoc, permutation.pageIndices);

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      reorderedDoc,
      { useObjectStreams: true },
      { expectedPageCount: totalPages, verifyWithPdfJs: true }
    );

    if (!integrity.isValid || integrity.error) {
      return buildErrorResult(
        canonicalId,
        integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const baseName = stripPdfExtension(input.fileName, 'document');
    const outputFileName = options.outputFileName || `${baseName}_reordered.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: totalPages,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Reordered ${totalPages} page(s) in "${input.fileName}" to sequence [${permutation.pageNumbers.join(', ')}].`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        newPageOrderNumbers: permutation.pageNumbers,
        newPageOrderIndices: permutation.pageIndices,
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      inputBytes,
      warnings
    );
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * F. ROTATE PAGES (`pdf-rotate-pages`, `pdf-page-rotation-tool`, alias `pdf-rotate`)
 * ============================================================================
 * Rotates selected pages by valid 90-degree increments while preserving
 * unselected page orientations.
 */
export async function rotatePdfPagesV2(
  input: PdfDocumentInput,
  options: PdfRotatePagesOptions & { canonicalId?: string }
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-rotate-pages';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for rotating pages.'),
      startTime,
      0
    );
  }

  const rawAngle = Number(options?.angleDegrees);
  if (
    !Number.isFinite(rawAngle) ||
    !Number.isInteger(rawAngle) ||
    rawAngle === 0 ||
    Math.abs(rawAngle) % 90 !== 0
  ) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_PAGE_RANGE',
        `Rotation angle must be a non-zero multiple of 90 degrees (90, 180, 270, -90, -180, -270); received ${String(options?.angleDegrees)}.`,
        { angleDegrees: options?.angleDegrees }
      ),
      startTime,
      inputBytes
    );
  }

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (!loadRes.success || !loadRes.document || loadRes.error) {
      return buildErrorResult(
        canonicalId,
        loadRes.error || createPdfProcessingError('ERR_INVALID_PDF'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const doc = loadRes.document;
    const totalPages = doc.getPageCount();
    const orientations = extractPageOrientations(doc);

    const rawSelection = options.selection ?? input.pageSelection;
    const parsedSelection = resolvePdfPageSelection(rawSelection, totalPages, {
      defaultToAll: true,
      allowDuplicates: false,
      pageOrientations: orientations,
    });

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const relative = options.relative !== false;
    const selectedSet = new Set<number>(parsedSelection.pageIndices);
    const updatedRotations: Array<{ pageNumber: number; previousAngle: number; newAngle: number }> = [];

    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const prevAngle = ((page.getRotation().angle % 360) + 360) % 360;
      if (selectedSet.has(i)) {
        const nextAngle = relative
          ? (((prevAngle + rawAngle) % 360) + 360) % 360
          : ((rawAngle % 360) + 360) % 360;
        page.setRotation(degrees(nextAngle));
        updatedRotations.push({
          pageNumber: i + 1,
          previousAngle: prevAngle,
          newAngle: nextAngle,
        });
      } else {
        // Explicitly preserve unselected page orientation
        page.setRotation(degrees(prevAngle));
      }
    }

    let outputDoc = doc;
    if (loadRes.validation.hasEncryptDictionary || doc.isEncrypted) {
      // Encrypted inputs opened with a valid password retain a stale /Encrypt trailer entry if saved in-place;
      // copy the rotated pages into a clean unencrypted PDFDocument (consistent with extract/delete/reorder).
      const cleanDoc = await PDFDocument.create();
      const allIndices = Array.from({ length: totalPages }, (_, idx) => idx);
      await copySelectedPagesPreservingGeometry(doc, cleanDoc, allIndices);
      delete cleanDoc.context.trailerInfo.Encrypt;
      outputDoc = cleanDoc;
    }

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      outputDoc,
      { useObjectStreams: true },
      { expectedPageCount: totalPages, verifyWithPdfJs: true }
    );

    if (!integrity.isValid || integrity.error) {
      return buildErrorResult(
        canonicalId,
        integrity.error || createPdfProcessingError('ERR_OUTPUT_INTEGRITY'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const baseName = stripPdfExtension(input.fileName, 'document');
    const outputFileName = options.outputFileName || `${baseName}_rotated.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: totalPages,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Rotated ${selectedSet.size} page(s) (${parsedSelection.normalizedExpression}) by ${rawAngle}° in "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [],
      details: {
        rotatedPageNumbers: parsedSelection.pageNumbers,
        angleDegrees: rawAngle,
        relative,
        updatedRotations,
      },
    };
  } catch (err: unknown) {
    return buildErrorResult(
      canonicalId,
      normalizeCaughtPdfError(err, { phase: 'execute' }),
      startTime,
      inputBytes,
      warnings
    );
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * CANONICAL PAGE ORGANIZATION ROUTER (`executePageOrganizationOperationV2`)
 * ============================================================================
 * Routes all 11 Page Organization canonical IDs (plus alias `pdf-rotate`)
 * defined in the approved Phase PDF-02 routing matrix:
 * - `pdf-merge`
 * - `pdf-extractor-merger`
 * - `pdf-split`
 * - `pdf-split-by-page-count-tool`
 * - `pdf-extract-pages`
 * - `pdf-page-extraction-tool`
 * - `pdf-delete-pages`
 * - `pdf-reorder-pages`
 * - `pdf-page-reordering-tool`
 * - `pdf-rotate-pages` (and alias `pdf-rotate`)
 * - `pdf-page-rotation-tool`
 *
 * Strictly rejects any non-page-organization or unknown tool ID with
 * `ERR_UNSUPPORTED_OPERATION`. Never silently defaults to another operation.
 */
export async function executePageOrganizationOperationV2(
  request: PdfOperationRequest<Record<string, unknown>>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const resolved = resolvePdfOperationCapabilities(request?.toolId);

  if (!resolved.supported || !resolved.capabilities || resolved.error) {
    return buildErrorResult(
      String(request?.toolId ?? ''),
      resolved.error || createPdfProcessingError('ERR_UNSUPPORTED_OPERATION'),
      startTime
    );
  }

  const cap = resolved.capabilities;
  if (cap.module !== 'page-organization') {
    return buildErrorResult(
      cap.canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by the Page Organization Engine.`,
        { canonicalId: cap.canonicalId, module: cap.module }
      ),
      startTime
    );
  }

  const inputs = Array.isArray(request.inputs) ? request.inputs : [];
  const opts = (request.options || {}) as Record<string, any>;

  switch (cap.canonicalId) {
    case 'pdf-merge':
      return mergePdfsV2(inputs, {
        canonicalId: 'pdf-merge',
        outputFileName: opts.outputFileName,
      });

    case 'pdf-extractor-merger': {
      // Supports merging 2+ PDFs (with optional per-file pageSelection) or
      // extracting/combining selected pages from 1+ PDFs.
      const singleInput = inputs.length === 1;
      const hasSelection = Boolean(
        request.pageSelection ||
          opts.selection ||
          inputs[0]?.pageSelection
      );
      if (singleInput && hasSelection) {
        return extractPdfPagesV2(inputs[0], {
          canonicalId: 'pdf-extractor-merger',
          selection: opts.selection ?? request.pageSelection ?? inputs[0]?.pageSelection,
          outputFileName: opts.outputFileName,
        });
      }
      return mergePdfsV2(inputs, {
        canonicalId: 'pdf-extractor-merger',
        allowSingleFileWithSelection: hasSelection,
        globalPageSelection: request.pageSelection,
        outputFileName: opts.outputFileName,
      });
    }

    case 'pdf-split':
      return splitPdfV2(inputs[0], {
        canonicalId: 'pdf-split',
        splitMode: opts.splitMode,
        rangeGroups: opts.rangeGroups ?? opts.ranges,
        pagesPerChunk: opts.pagesPerChunk ?? opts.pageCount,
        pageSelection: request.pageSelection,
        alwaysPackageZip: opts.alwaysPackageZip,
        outputBaseName: opts.outputBaseName,
      });

    case 'pdf-split-by-page-count-tool':
      return splitPdfV2(inputs[0], {
        canonicalId: 'pdf-split-by-page-count-tool',
        splitMode: 'by-page-count',
        pagesPerChunk: opts.pagesPerChunk ?? opts.pageCount ?? 1,
        alwaysPackageZip: opts.alwaysPackageZip,
        outputBaseName: opts.outputBaseName,
      });

    case 'pdf-extract-pages':
    case 'pdf-page-extraction-tool':
      return extractPdfPagesV2(inputs[0], {
        canonicalId: cap.canonicalId,
        selection: opts.selection ?? opts.rangeExpression ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-delete-pages':
      return deletePdfPagesV2(inputs[0], {
        canonicalId: 'pdf-delete-pages',
        selection: opts.selection ?? opts.rangeExpression ?? request.pageSelection,
        allowEmptyDocument: opts.allowEmptyDocument === true,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-reorder-pages':
    case 'pdf-page-reordering-tool':
      return reorderPdfPagesV2(inputs[0], {
        canonicalId: cap.canonicalId,
        newOrder: opts.newOrder ?? opts.order ?? opts.permutation,
        indexing: opts.indexing,
        pageSelection: request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-rotate-pages':
    case 'pdf-page-rotation-tool':
      return rotatePdfPagesV2(inputs[0], {
        canonicalId: cap.canonicalId,
        angleDegrees: opts.angleDegrees ?? opts.angle ?? opts.rotation ?? 90,
        relative: opts.relative,
        selection: opts.selection ?? opts.rangeExpression ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    default:
      return buildErrorResult(
        cap.canonicalId,
        createPdfProcessingError('ERR_UNSUPPORTED_OPERATION'),
        startTime
      );
  }
}
