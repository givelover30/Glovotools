import {
  clonePdfBytes as runtimeClonePdfBytes,
  toExactArrayBuffer as runtimeToExactArrayBuffer,
  createSafeBlob as runtimeCreateSafeBlob,
  revokeObjectUrlSafely as runtimeRevokeObjectUrlSafely,
} from '../pdfRuntime';
import { DetectedFileFormat } from './pdfTypes';
import { PdfEngineV2Error } from './pdfErrors';

/**
 * Default memory and size guardrails for browser-native PDF operations.
 */
export const DEFAULT_MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024; // 250 MB hard ceiling
export const DEFAULT_SOFT_WARNING_BYTES = 50 * 1024 * 1024;   // 50 MB warning threshold
export const DEFAULT_MAX_HEADER_OFFSET_BYTES = 1024;          // PDF spec allows '%PDF-' within first 1024 bytes

/**
 * Inspects the exact byte length of an ArrayBuffer, ArrayBufferView, or nullish value
 * without allocating a copy. Returns 0 for null/undefined or detached buffers.
 */
export function inspectByteLength(input: unknown): number {
  if (!input) return 0;
  if (input instanceof ArrayBuffer) {
    return input.byteLength;
  }
  if (ArrayBuffer.isView(input)) {
    return input.byteLength;
  }
  return 0;
}

/**
 * Checks whether an ArrayBuffer or ArrayBufferView's underlying buffer has been detached
 * (e.g., after a Web Worker postMessage transfer).
 */
export function isBufferDetached(input: ArrayBuffer | ArrayBufferView | null | undefined): boolean {
  if (!input) return true;
  try {
    const buf = input instanceof ArrayBuffer ? input : input.buffer;
    // In ES2024+ ArrayBuffer.prototype.detached exists; fallback checks byteLength abnormality
    if ('detached' in buf && typeof (buf as any).detached === 'boolean') {
      return (buf as any).detached;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Safely clones any ArrayBuffer or ArrayBufferView into an isolated Uint8Array
 * whose backing ArrayBuffer has byteOffset === 0 and byteLength === input.byteLength.
 *
 * Guarantees that mutating or transferring the returned Uint8Array will NEVER
 * mutate or detach the caller's original byte array.
 */
export function cloneIsolatedPdfBytes(
  input: ArrayBuffer | ArrayBufferView | null | undefined
): Uint8Array {
  if (input === null || input === undefined) {
    throw new PdfEngineV2Error('ERR_EMPTY_FILE', 'Input byte buffer is null or undefined.');
  }
  if (!(input instanceof ArrayBuffer) && !ArrayBuffer.isView(input)) {
    throw new PdfEngineV2Error('ERR_INVALID_PDF', 'Expected an ArrayBuffer or Uint8Array input.');
  }
  if (isBufferDetached(input)) {
    throw new PdfEngineV2Error('ERR_INVALID_PDF', 'Input ArrayBuffer has already been detached.');
  }
  return runtimeClonePdfBytes(input);
}

/**
 * Converts a Uint8Array or ArrayBuffer into a standalone ArrayBuffer [0..byteLength).
 */
export function toIsolatedArrayBuffer(input: Uint8Array | ArrayBuffer): ArrayBuffer {
  return runtimeToExactArrayBuffer(input);
}

/**
 * Zeroes out a temporary internal buffer so sensitive PDF content does not linger
 * after a processing session is disposed. Never call this on caller-owned buffers;
 * only call on internal cloned session buffers during lifecycle cleanup.
 */
export function wipeInternalBuffer(buffer: Uint8Array | null | undefined): void {
  if (!buffer || isBufferDetached(buffer)) return;
  try {
    buffer.fill(0);
  } catch {
    // Ignore errors on read-only or detached views
  }
}

/**
 * Searches for an ASCII byte sequence inside a Uint8Array within [startOffset, maxEndOffset).
 * Returns the 0-based index of the match, or -1 if not found.
 */
export function findAsciiSequence(
  bytes: Uint8Array,
  asciiPattern: string,
  startOffset = 0,
  maxEndOffset = bytes.byteLength
): number {
  const patLen = asciiPattern.length;
  if (patLen === 0 || bytes.byteLength < patLen) return -1;
  const limit = Math.min(bytes.byteLength, maxEndOffset) - patLen;
  const start = Math.max(0, startOffset);

  for (let i = start; i <= limit; i++) {
    let matched = true;
    for (let j = 0; j < patLen; j++) {
      if (bytes[i + j] !== asciiPattern.charCodeAt(j)) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
}

/**
 * Inspects the magic bytes of a buffer to identify its actual binary format.
 */
export function sniffFileFormat(
  bytes: Uint8Array,
  maxHeaderOffset = DEFAULT_MAX_HEADER_OFFSET_BYTES
): {
  format: DetectedFileFormat;
  pdfHeaderOffset: number;
  pdfVersion?: string;
} {
  if (!bytes || bytes.byteLength === 0) {
    return { format: 'empty', pdfHeaderOffset: -1 };
  }

  // 1. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.byteLength >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { format: 'png', pdfHeaderOffset: -1 };
  }

  // 2. Check JPEG: FF D8 FF
  if (bytes.byteLength >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { format: 'jpeg', pdfHeaderOffset: -1 };
  }

  // 3. Check GIF: 'GIF87a' or 'GIF89a'
  if (
    bytes.byteLength >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return { format: 'gif', pdfHeaderOffset: -1 };
  }

  // 4. Check WebP: 'RIFF' .... 'WEBP'
  if (
    bytes.byteLength >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { format: 'webp', pdfHeaderOffset: -1 };
  }

  // 5. Check BMP: 'BM' (42 4D)
  if (bytes.byteLength >= 14 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return { format: 'bmp', pdfHeaderOffset: -1 };
  }

  // 6. Check ZIP / Office OpenXML / OpenDocument: 'PK\x03\x04' (50 4B 03 04)
  if (
    bytes.byteLength >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return { format: 'zip-office', pdfHeaderOffset: -1 };
  }

  // 7. Check PDF: '%PDF-' within first maxHeaderOffset bytes
  const pdfOffset = findAsciiSequence(bytes, '%PDF-', 0, Math.min(bytes.byteLength, maxHeaderOffset));
  if (pdfOffset !== -1 && pdfOffset + 8 <= bytes.byteLength) {
    const major = String.fromCharCode(bytes[pdfOffset + 5]);
    const dot = String.fromCharCode(bytes[pdfOffset + 6]);
    const minor = String.fromCharCode(bytes[pdfOffset + 7]);
    if (dot === '.' && /[12]/.test(major) && /[0-9]/.test(minor)) {
      return {
        format: 'pdf',
        pdfHeaderOffset: pdfOffset,
        pdfVersion: `${major}.${minor}`,
      };
    }
  }

  // 8. Check RTF: '{\rtf'
  if (findAsciiSequence(bytes, '{\\rtf', 0, Math.min(bytes.byteLength, 64)) !== -1) {
    return { format: 'rtf', pdfHeaderOffset: -1 };
  }

  // 9. Check SVG / HTML in leading text snippet
  const headLen = Math.min(bytes.byteLength, 512);
  let headStr = '';
  for (let i = 0; i < headLen; i++) {
    headStr += String.fromCharCode(bytes[i]);
  }
  const trimmedLower = headStr.trimStart().toLowerCase();
  if (trimmedLower.startsWith('<svg') || (trimmedLower.startsWith('<?xml') && trimmedLower.includes('<svg'))) {
    return { format: 'svg', pdfHeaderOffset: -1 };
  }
  if (
    trimmedLower.startsWith('<!doctype html') ||
    trimmedLower.startsWith('<html') ||
    trimmedLower.startsWith('<head') ||
    trimmedLower.startsWith('<body')
  ) {
    return { format: 'html', pdfHeaderOffset: -1 };
  }

  return { format: 'unknown', pdfHeaderOffset: -1 };
}

export { runtimeCreateSafeBlob as createSafeBlob, runtimeRevokeObjectUrlSafely as revokeObjectUrlSafely };
