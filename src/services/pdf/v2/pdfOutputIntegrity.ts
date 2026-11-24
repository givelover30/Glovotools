import type { PDFDocument, SaveOptions } from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import { cloneIsolatedPdfBytes, inspectByteLength, sniffFileFormat } from './pdfByteUtils';
import { createPdfProcessingError } from './pdfErrors';
import {
  PdfOutputIntegrityOptions,
  PdfOutputIntegrityResult,
} from './pdfTypes';
import {
  detectPdfEncryptionMarker,
  detectPdfEofMarker,
} from './pdfValidation';

/**
 * Module F — PDF Output Integrity Verifier
 *
 * Performs multi-stage verification on serialized PDF output bytes:
 * 1. Verifies output is non-empty.
 * 2. Verifies output starts at offset 0 with valid `%PDF-1.x` or `%PDF-2.0` magic bytes.
 * 3. Verifies trailing `%%EOF` marker exists.
 * 4. Independently reopens the output bytes using PDF.js (`openManagedPdfDocument` from `pdfRuntime.ts`)
 *    to confirm that an independent PDF engine (separate from `@cantoo/pdf-lib`) can parse the cross-reference
 *    table and page tree and matches `expectedPageCount`.
 */
export async function verifyPdfOutputIntegrity(
  outputBytes: Uint8Array | ArrayBuffer | null | undefined,
  options: PdfOutputIntegrityOptions = {}
): Promise<PdfOutputIntegrityResult> {
  const verifyWithPdfJs = options.verifyWithPdfJs !== false;
  const warnings: string[] = [];

  if (!outputBytes) {
    return {
      isValid: false,
      byteLength: 0,
      hasValidMagicHeader: false,
      hasEofMarker: false,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError('ERR_OUTPUT_INTEGRITY', 'Generated PDF output buffer is null or undefined.'),
    };
  }

  const byteLength = inspectByteLength(outputBytes);
  if (byteLength === 0) {
    return {
      isValid: false,
      byteLength: 0,
      hasValidMagicHeader: false,
      hasEofMarker: false,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError('ERR_OUTPUT_INTEGRITY', 'Generated PDF output is empty (0 bytes).'),
    };
  }

  let isolated: Uint8Array;
  try {
    isolated = cloneIsolatedPdfBytes(outputBytes);
  } catch (err: any) {
    return {
      isValid: false,
      byteLength,
      hasValidMagicHeader: false,
      hasEofMarker: false,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError('ERR_OUTPUT_INTEGRITY', err?.message || 'Failed to clone output bytes.'),
    };
  }

  // 1. Check magic header at offset 0
  const sniffed = sniffFileFormat(isolated, 16);
  const hasValidMagicHeader = sniffed.format === 'pdf' && sniffed.pdfHeaderOffset === 0;
  if (!hasValidMagicHeader) {
    return {
      isValid: false,
      byteLength,
      hasValidMagicHeader: false,
      hasEofMarker: false,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError(
        'ERR_OUTPUT_INTEGRITY',
        'Generated output does not start with a valid %PDF- magic header at byte offset 0.',
        { detectedFormat: sniffed.format, pdfHeaderOffset: sniffed.pdfHeaderOffset }
      ),
    };
  }

  // 2. Check %%EOF marker
  const hasEofMarker = detectPdfEofMarker(isolated);
  if (!hasEofMarker) {
    return {
      isValid: false,
      byteLength,
      hasValidMagicHeader: true,
      pdfVersion: sniffed.pdfVersion,
      hasEofMarker: false,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError(
        'ERR_OUTPUT_INTEGRITY',
        'Generated PDF output is missing the required trailing %%EOF marker.'
      ),
    };
  }

  const isEncryptedOutput = detectPdfEncryptionMarker(isolated);

  if (options.expectEncrypted && !isEncryptedOutput) {
    return {
      isValid: false,
      byteLength,
      hasValidMagicHeader: true,
      pdfVersion: sniffed.pdfVersion,
      hasEofMarker: true,
      reopenedWithPdfJs: false,
      isEncryptedOutput: false,
      warnings,
      error: createPdfProcessingError(
        'ERR_OUTPUT_INTEGRITY',
        'Expected encrypted PDF output, but no /Encrypt dictionary was found in serialized bytes.'
      ),
    };
  }

  // 3. Independent reopening verification via PDF.js
  if (verifyWithPdfJs) {
    try {
      const pdfJsOpts: Record<string, unknown> = {};
      if (options.passwordForEncryptedOutput) {
        pdfJsOpts.password = options.passwordForEncryptedOutput;
      }

      const session = await openManagedPdfDocument(isolated, pdfJsOpts);
      try {
        const verifiedPageCount = Number(session.pdfDoc?.numPages ?? 0);
        if (verifiedPageCount <= 0) {
          return {
            isValid: false,
            byteLength,
            hasValidMagicHeader: true,
            pdfVersion: sniffed.pdfVersion,
            hasEofMarker: true,
            reopenedWithPdfJs: true,
            verifiedPageCount: 0,
            isEncryptedOutput,
            warnings,
            error: createPdfProcessingError(
              'ERR_OUTPUT_INTEGRITY',
              'Independent PDF.js verification reported 0 pages in the generated output.'
            ),
          };
        }

        if (
          typeof options.expectedPageCount === 'number' &&
          verifiedPageCount !== options.expectedPageCount
        ) {
          return {
            isValid: false,
            byteLength,
            hasValidMagicHeader: true,
            pdfVersion: sniffed.pdfVersion,
            hasEofMarker: true,
            reopenedWithPdfJs: true,
            verifiedPageCount,
            isEncryptedOutput,
            warnings,
            error: createPdfProcessingError(
              'ERR_OUTPUT_INTEGRITY',
              `Output page count mismatch: expected ${options.expectedPageCount} pages, but independent PDF.js verification found ${verifiedPageCount} pages.`,
              { expectedPageCount: options.expectedPageCount, verifiedPageCount }
            ),
          };
        }

        // Probe first page object in PDF.js to ensure page tree and XRef offsets resolve cleanly
        const firstPage = await session.pdfDoc.getPage(1);
        if (firstPage && typeof firstPage.cleanup === 'function') {
          await firstPage.cleanup();
        }

        return {
          isValid: true,
          byteLength,
          hasValidMagicHeader: true,
          pdfVersion: sniffed.pdfVersion,
          hasEofMarker: true,
          reopenedWithPdfJs: true,
          verifiedPageCount,
          isEncryptedOutput,
          warnings,
        };
      } finally {
        await session.dispose();
      }
    } catch (err: any) {
      const msg = String(err?.message ?? 'Unknown PDF.js error');
      return {
        isValid: false,
        byteLength,
        hasValidMagicHeader: true,
        pdfVersion: sniffed.pdfVersion,
        hasEofMarker: true,
        reopenedWithPdfJs: false,
        isEncryptedOutput,
        warnings,
        error: createPdfProcessingError(
          'ERR_OUTPUT_INTEGRITY',
          `Generated PDF failed independent PDF.js reopening verification: ${msg}`,
          { cause: msg }
        ),
      };
    }
  }

  return {
    isValid: true,
    byteLength,
    hasValidMagicHeader: true,
    pdfVersion: sniffed.pdfVersion,
    hasEofMarker: true,
    reopenedWithPdfJs: false,
    isEncryptedOutput,
    warnings,
  };
}

/**
 * Serializes a `@cantoo/pdf-lib` PDFDocument and immediately verifies output integrity.
 */
export async function serializeAndVerifyPdfV2(
  doc: PDFDocument,
  saveOptions: SaveOptions = { useObjectStreams: true },
  integrityOptions: PdfOutputIntegrityOptions = {}
): Promise<{
  bytes: Uint8Array;
  integrity: PdfOutputIntegrityResult;
}> {
  const saved = await doc.save(saveOptions);
  const isolated = cloneIsolatedPdfBytes(saved);
  const integrity = await verifyPdfOutputIntegrity(isolated, {
    expectedPageCount: integrityOptions.expectedPageCount ?? doc.getPageCount(),
    ...integrityOptions,
  });
  return {
    bytes: isolated,
    integrity,
  };
}
