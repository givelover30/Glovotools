import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  DEFAULT_MAX_HEADER_OFFSET_BYTES,
  DEFAULT_SOFT_WARNING_BYTES,
  cloneIsolatedPdfBytes,
  findAsciiSequence,
  inspectByteLength,
  isBufferDetached,
  sniffFileFormat,
} from './pdfByteUtils';
import { createPdfProcessingError } from './pdfErrors';
import {
  PdfDocumentInput,
  PdfValidationLimits,
  PdfValidationResult,
} from './pdfTypes';

/**
 * Checks whether a PDF byte buffer contains an active `/Encrypt` entry in its trailer
 * or cross-reference stream dictionary.
 */
export function detectPdfEncryptionMarker(bytes: Uint8Array): boolean {
  if (!bytes || bytes.byteLength < 32) return false;
  // Scan the last 64 KB (where trailer / XRef stream dictionaries normally reside)
  // and the first 16 KB (for linearized PDFs) for '/Encrypt'
  const tailStart = Math.max(0, bytes.byteLength - 65536);
  if (findAsciiSequence(bytes, '/Encrypt', tailStart, bytes.byteLength) !== -1) {
    return true;
  }
  const headLimit = Math.min(bytes.byteLength, 16384);
  if (findAsciiSequence(bytes, '/Encrypt', 0, headLimit) !== -1) {
    return true;
  }
  return false;
}

/**
 * Checks whether a PDF byte buffer contains a trailing `%%EOF` marker.
 */
export function detectPdfEofMarker(bytes: Uint8Array): boolean {
  if (!bytes || bytes.byteLength < 16) return false;
  // Scan last 2048 bytes for '%%EOF'
  const searchStart = Math.max(0, bytes.byteLength - 2048);
  return findAsciiSequence(bytes, '%%EOF', searchStart, bytes.byteLength) !== -1;
}

/**
 * Module A — PDF Input Validation
 *
 * Performs synchronous, deterministic validation on raw input buffers:
 * 1. Rejects null, detached, or empty (0-byte) files (ERR_EMPTY_FILE).
 * 2. Enforces file-size limits (ERR_FILE_TOO_LARGE).
 * 3. Inspects binary magic headers (%PDF-1.x / %PDF-2.0) and rejects non-PDF
 *    formats or corrupted headers (ERR_INVALID_PDF).
 * 4. Checks for %%EOF trailer and /Encrypt dictionary presence.
 * 5. Never silently accepts invalid files.
 */
export function validatePdfInput(
  input: PdfDocumentInput | Uint8Array | ArrayBuffer | null | undefined,
  limits: PdfValidationLimits = {}
): PdfValidationResult {
  const maxFileSizeBytes = limits.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const softWarningBytes = limits.softWarningBytes ?? DEFAULT_SOFT_WARNING_BYTES;
  const maxHeaderOffsetBytes = limits.maxHeaderOffsetBytes ?? DEFAULT_MAX_HEADER_OFFSET_BYTES;
  const requireEofMarker = limits.requireEofMarker ?? true;

  const warnings: string[] = [];

  if (!input) {
    return {
      isValid: false,
      detectedFormat: 'empty',
      byteLength: 0,
      hasEofMarker: false,
      hasEncryptDictionary: false,
      isPasswordRequired: false,
      warnings,
      error: createPdfProcessingError('ERR_EMPTY_FILE', 'No input file or byte buffer was provided.'),
    };
  }

  const rawBytes =
    input instanceof Uint8Array || input instanceof ArrayBuffer
      ? input
      : (input as PdfDocumentInput).bytes;

  if (!rawBytes || isBufferDetached(rawBytes)) {
    return {
      isValid: false,
      detectedFormat: 'empty',
      byteLength: 0,
      hasEofMarker: false,
      hasEncryptDictionary: false,
      isPasswordRequired: false,
      warnings,
      error: createPdfProcessingError(
        rawBytes ? 'ERR_INVALID_PDF' : 'ERR_EMPTY_FILE',
        rawBytes ? 'Input ArrayBuffer has been detached.' : 'Input byte buffer is missing.'
      ),
    };
  }

  const byteLength = inspectByteLength(rawBytes);

  // 1. Empty file check
  if (byteLength === 0) {
    return {
      isValid: false,
      detectedFormat: 'empty',
      byteLength: 0,
      hasEofMarker: false,
      hasEncryptDictionary: false,
      isPasswordRequired: false,
      warnings,
      error: createPdfProcessingError('ERR_EMPTY_FILE'),
    };
  }

  // 2. File size ceiling check
  if (byteLength > maxFileSizeBytes) {
    return {
      isValid: false,
      detectedFormat: 'unknown',
      byteLength,
      hasEofMarker: false,
      hasEncryptDictionary: false,
      isPasswordRequired: false,
      warnings,
      error: createPdfProcessingError(
        'ERR_FILE_TOO_LARGE',
        `File size (${(byteLength / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit (${(maxFileSizeBytes / (1024 * 1024)).toFixed(0)} MB).`,
        { byteLength, maxFileSizeBytes }
      ),
    };
  }

  if (byteLength > softWarningBytes) {
    warnings.push(
      `Large PDF detected (${(byteLength / (1024 * 1024)).toFixed(1)} MB). Processing may require additional browser memory.`
    );
  }

  // Clone isolated view of header/tail or full buffer for safe inspection
  const view =
    rawBytes instanceof Uint8Array
      ? new Uint8Array(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength)
      : new Uint8Array(rawBytes);

  // 3. Magic-byte format detection
  const sniffed = sniffFileFormat(view, maxHeaderOffsetBytes);

  if (sniffed.format !== 'pdf') {
    const isOtherKnownFormat = sniffed.format !== 'unknown' && sniffed.format !== 'empty';
    const detailMsg = isOtherKnownFormat
      ? `Unsupported file format detected (${sniffed.format.toUpperCase()}). Expected a valid PDF document starting with %PDF-.`
      : 'Invalid magic bytes: file does not contain a valid %PDF- header within the first 1024 bytes.';

    return {
      isValid: false,
      detectedFormat: sniffed.format,
      byteLength,
      hasEofMarker: false,
      hasEncryptDictionary: false,
      isPasswordRequired: false,
      warnings,
      error: createPdfProcessingError('ERR_INVALID_PDF', detailMsg, {
        detectedFormat: sniffed.format,
        reason: isOtherKnownFormat ? 'UNSUPPORTED_FORMAT' : 'INVALID_MAGIC_BYTES',
      }),
    };
  }

  if (sniffed.pdfHeaderOffset > 0) {
    warnings.push(
      `PDF header '%PDF-${sniffed.pdfVersion}' found at non-zero byte offset ${sniffed.pdfHeaderOffset}.`
    );
  }

  // 4. Minimum viable PDF structural length & %%EOF check
  const hasEofMarker = detectPdfEofMarker(view);
  const hasEncryptDictionary = detectPdfEncryptionMarker(view);

  if (byteLength < 64 || (requireEofMarker && !hasEofMarker)) {
    return {
      isValid: false,
      detectedFormat: 'pdf',
      byteLength,
      pdfVersion: sniffed.pdfVersion,
      headerOffset: sniffed.pdfHeaderOffset,
      hasEofMarker,
      hasEncryptDictionary,
      isPasswordRequired: hasEncryptDictionary,
      warnings,
      error: createPdfProcessingError(
        'ERR_INVALID_PDF',
        !hasEofMarker
          ? 'Malformed PDF document: missing trailing %%EOF marker (file may be truncated).'
          : 'Malformed PDF document: file is too small to contain valid PDF objects.',
        { byteLength, hasEofMarker, headerOffset: sniffed.pdfHeaderOffset }
      ),
    };
  }

  return {
    isValid: true,
    detectedFormat: 'pdf',
    byteLength,
    pdfVersion: sniffed.pdfVersion,
    headerOffset: sniffed.pdfHeaderOffset,
    hasEofMarker,
    hasEncryptDictionary,
    isPasswordRequired: hasEncryptDictionary,
    warnings,
  };
}

/**
 * Extracts a clean, isolated Uint8Array starting at the '%PDF-' header
 * without mutating the caller's input buffer.
 */
export function extractIsolatedNormalizedPdfBytes(
  input: PdfDocumentInput | Uint8Array | ArrayBuffer,
  headerOffset = 0
): Uint8Array {
  const rawBytes =
    input instanceof Uint8Array || input instanceof ArrayBuffer
      ? input
      : input.bytes;
  const fullClone = cloneIsolatedPdfBytes(rawBytes);
  if (headerOffset > 0 && headerOffset < fullClone.byteLength) {
    const trimmed = new Uint8Array(fullClone.byteLength - headerOffset);
    trimmed.set(fullClone.subarray(headerOffset));
    return trimmed;
  }
  return fullClone;
}
