import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  degrees,
  rgb
} from '@cantoo/pdf-lib';
import { inspectByteLength } from './pdfByteUtils';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { serializeAndVerifyPdfV2 } from './pdfOutputIntegrity';
import {
  PdfDocumentInput,
  PdfOperationCapabilities,
  PdfOperationResult,
  PdfOutputFile,
  PdfProcessingError,
  PdfProcessingProgress
} from './pdfTypes';
import {
  RgbColorNormalized,
  isTextEncodableByFont,
  parsePdfColorInput,
  renderUnicodeTextToPngStamp
} from './pdfUnicodeCanvasRenderer';

export type ESignCanonicalToolId =
  | 'sign-pdf'
  | 'create-signature'
  | 'fill-and-sign'
  | 'add-date-initials';

export type ESignElementKind = 'signature' | 'initials' | 'date' | 'text' | 'checkmark';

export type ESignDateFormatId = 'iso' | 'us' | 'eu' | 'long';

export interface ESignNormalizedRect {
  /** Left edge in [0, 1] relative to visual page width (top-left origin) */
  u: number;
  /** Top edge in [0, 1] relative to visual page height (top-left origin) */
  v: number;
  /** Width in (0, 1] relative to visual page width */
  w: number;
  /** Height in (0, 1] relative to visual page height */
  h: number;
}

export interface ESignPlacedElement {
  id: string;
  kind: ESignElementKind;
  /** 1-based target page number */
  pageNumber: number;
  /** Visual normalized coordinates relative to the rendered upright page */
  rect: ESignNormalizedRect;
  /** Image asset key or bytes for 'signature' | 'initials' */
  imageBytes?: Uint8Array;
  /** Deduplication cache key for identical signature/initial images across pages */
  assetKey?: string;
  /** Text content for 'text' | 'date' | fallback 'initials' */
  text?: string;
  /** Date format used when kind === 'date' */
  dateFormat?: ESignDateFormatId;
  /** Font size in PDF points for 'text' | 'date' (default: 13) */
  fontSizePt?: number;
  /** Standard PDF font family for text/date */
  fontFamily?: 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier';
  /** Hex color string (default: '#111827') */
  color?: string;
  /** Opacity in (0, 1] (default: 1) */
  opacity?: number;
}

export interface ApplyESignatureOptions {
  canonicalId?: ESignCanonicalToolId;
  elements: ESignPlacedElement[];
  outputFileName?: string;
  signal?: AbortSignal;
  onProgress?: (progress: PdfProcessingProgress) => void;
}

export interface SignatureImageValidationResult {
  isValid: boolean;
  format?: 'png' | 'jpeg';
  width?: number;
  height?: number;
  byteLength: number;
  error?: PdfProcessingError;
}

export interface PdfMappedRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotateDegrees: number;
  /** Visual width in PDF points before unrotated axis swap */
  visualWidthPt: number;
  /** Visual height in PDF points before unrotated axis swap */
  visualHeightPt: number;
}

const PDF_ACCEPT = '.pdf,application/pdf';
const MAX_SIGNATURE_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ESIGNATURE_OPERATION_REGISTRY: Readonly<
  Record<ESignCanonicalToolId, PdfOperationCapabilities>
> = {
  'sign-pdf': {
    canonicalId: 'sign-pdf',
    aliases: ['pdf-sign', 'esign-pdf'],
    module: 'editing-geometry',
    acceptedFileTypes: PDF_ACCEPT,
    expectedInputKind: 'pdf',
    minFiles: 1,
    maxFiles: 1,
    supportsThumbnailSelection: true,
    browserExecutionClass: 'FULLY_BROWSER_LOCAL',
    disclosedLimitations: [
      'Places visual electronic signatures locally in your browser; does not apply cryptographic PKI/X.509 certificates.'
    ]
  },
  'create-signature': {
    canonicalId: 'create-signature',
    aliases: ['pdf-create-signature', 'signature-maker'],
    module: 'editing-geometry',
    acceptedFileTypes: '.png,.jpg,.jpeg,image/png,image/jpeg',
    expectedInputKind: 'image',
    minFiles: 0,
    maxFiles: 1,
    supportsThumbnailSelection: false,
    browserExecutionClass: 'FULLY_BROWSER_LOCAL',
    disclosedLimitations: [
      'Signatures are kept only in temporary browser memory for the active session and never uploaded.'
    ]
  },
  'fill-and-sign': {
    canonicalId: 'fill-and-sign',
    aliases: ['pdf-fill-and-sign', 'fill-sign-pdf'],
    module: 'editing-geometry',
    acceptedFileTypes: PDF_ACCEPT,
    expectedInputKind: 'pdf',
    minFiles: 1,
    maxFiles: 1,
    supportsThumbnailSelection: true,
    browserExecutionClass: 'FULLY_BROWSER_LOCAL',
    disclosedLimitations: [
      'Flattens signatures, initials, dates, text, and checkmarks onto PDF pages locally without server upload.'
    ]
  },
  'add-date-initials': {
    canonicalId: 'add-date-initials',
    aliases: ['pdf-add-initials-date', 'add-initials-pdf'],
    module: 'editing-geometry',
    acceptedFileTypes: PDF_ACCEPT,
    expectedInputKind: 'pdf',
    minFiles: 1,
    maxFiles: 1,
    supportsThumbnailSelection: true,
    browserExecutionClass: 'FULLY_BROWSER_LOCAL',
    disclosedLimitations: [
      'Places visual initials and formatted dates locally; does not apply cryptographic timestamps.'
    ]
  }
};

export function formatESignDate(date: Date, format: ESignDateFormatId = 'iso'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  switch (format) {
    case 'us':
      return `${m}/${d}/${y}`;
    case 'eu':
      return `${d}/${m}/${y}`;
    case 'long': {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${y}`;
    }
    case 'iso':
    default:
      return `${y}-${m}-${d}`;
  }
}

/**
 * Strictly validates PNG and JPEG binary structure (magic bytes, chunk/marker integrity,
 * dimensions, and file size ceiling). Rejects corrupt, truncated, empty, or spoofed-extension
 * files with `ERR_UNSUPPORTED_IMAGE_FORMAT`.
 */
export function validateSignatureImageBytes(
  rawBytes: Uint8Array | ArrayBuffer | null | undefined,
  fileName?: string
): SignatureImageValidationResult {
  if (!rawBytes) {
    return {
      isValid: false,
      byteLength: 0,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        'Signature image is empty or missing. Upload a valid PNG or JPEG file.'
      )
    };
  }

  const bytes = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  const len = bytes.byteLength;

  if (len === 0) {
    return {
      isValid: false,
      byteLength: 0,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        'Signature image file is empty (0 bytes). Upload a valid PNG or JPEG file.'
      )
    };
  }

  if (len > MAX_SIGNATURE_IMAGE_BYTES) {
    return {
      isValid: false,
      byteLength: len,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_IMAGE_FORMAT',
        'Signature image exceeds the 10 MB safety limit.'
      )
    };
  }

  // 1. Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPngHeader =
    len >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (isPngHeader) {
    // Verify IHDR chunk starts at offset 8, length === 13, type === 'IHDR'
    const ihdrLen =
      ((bytes[8] << 24) | (bytes[9] << 16) | (bytes[10] << 8) | bytes[11]) >>> 0;
    const isIhdr =
      ihdrLen === 13 &&
      bytes[12] === 0x49 && // I
      bytes[13] === 0x48 && // H
      bytes[14] === 0x44 && // D
      bytes[15] === 0x52; // R

    if (!isIhdr || len < 33) {
      return {
        isValid: false,
        byteLength: len,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          `Corrupt PNG signature file${fileName ? ` ("${fileName}")` : ''}: invalid IHDR header.`
        )
      };
    }

    const width =
      ((bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]) >>> 0;
    const height =
      ((bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]) >>> 0;

    if (width === 0 || height === 0 || width > 12000 || height > 12000) {
      return {
        isValid: false,
        byteLength: len,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          `Corrupt PNG signature file${fileName ? ` ("${fileName}")` : ''}: invalid dimensions (${width}×${height}).`
        )
      };
    }

    // Walk PNG chunks to verify both IDAT and IEND exist and lengths stay within buffer bounds
    let offset = 8;
    let hasIdat = false;
    let hasIend = false;
    while (offset + 12 <= len) {
      const chunkLen =
        ((bytes[offset] << 24) |
          (bytes[offset + 1] << 16) |
          (bytes[offset + 2] << 8) |
          bytes[offset + 3]) >>>
        0;
      const t0 = bytes[offset + 4];
      const t1 = bytes[offset + 5];
      const t2 = bytes[offset + 6];
      const t3 = bytes[offset + 7];
      const nextOffset = offset + 12 + chunkLen;
      if (nextOffset > len || chunkLen > len) {
        return {
          isValid: false,
          byteLength: len,
          error: createPdfProcessingError(
            'ERR_UNSUPPORTED_IMAGE_FORMAT',
            `Corrupt or truncated PNG signature file${fileName ? ` ("${fileName}")` : ''}.`
          )
        };
      }
      if (t0 === 0x49 && t1 === 0x44 && t2 === 0x41 && t3 === 0x54) {
        hasIdat = true;
      }
      if (t0 === 0x49 && t1 === 0x45 && t2 === 0x4e && t3 === 0x44) {
        hasIend = true;
        break;
      }
      offset = nextOffset;
    }

    if (!hasIdat || !hasIend) {
      return {
        isValid: false,
        byteLength: len,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          `Corrupt PNG signature file${fileName ? ` ("${fileName}")` : ''}: missing IDAT or IEND chunk.`
        )
      };
    }

    return {
      isValid: true,
      format: 'png',
      width,
      height,
      byteLength: len
    };
  }

  // 2. Check JPEG signature: FF D8 FF ... valid SOF marker ... FF D9
  const isJpegHeader = len >= 16 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpegHeader) {
    let offset = 2;
    let width = 0;
    let height = 0;
    let hasSos = false;
    let hasEoi = false;

    while (offset + 1 < len) {
      if (bytes[offset] !== 0xff) {
        break;
      }
      while (offset < len && bytes[offset] === 0xff) {
        offset++;
      }
      if (offset >= len) break;

      const marker = bytes[offset++];
      if (marker === 0xd9) {
        hasEoi = true;
        break;
      }
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        continue;
      }
      if (offset + 1 >= len) {
        return {
          isValid: false,
          byteLength: len,
          error: createPdfProcessingError(
            'ERR_UNSUPPORTED_IMAGE_FORMAT',
            `Corrupt JPEG signature file${fileName ? ` ("${fileName}")` : ''}: truncated segment.`
          )
        };
      }
      const segLen = (bytes[offset] << 8) | bytes[offset + 1];
      if (segLen < 2 || offset + segLen > len) {
        return {
          isValid: false,
          byteLength: len,
          error: createPdfProcessingError(
            'ERR_UNSUPPORTED_IMAGE_FORMAT',
            `Corrupt JPEG signature file${fileName ? ` ("${fileName}")` : ''}: invalid segment length.`
          )
        };
      }

      // Start of Frame markers containing dimensions
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof && segLen >= 7) {
        height = (bytes[offset + 3] << 8) | bytes[offset + 4];
        width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      }

      if (marker === 0xda) {
        // Start of Scan: entropy-coded data follows until trailing EOI (FF D9)
        hasSos = true;
        // Scan backwards from end for EOI FF D9
        for (let i = len - 2; i >= offset + segLen; i--) {
          if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
            hasEoi = true;
            break;
          }
        }
        break;
      }

      offset += segLen;
    }

    if (!hasSos || !hasEoi || width === 0 || height === 0 || width > 12000 || height > 12000) {
      return {
        isValid: false,
        byteLength: len,
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          `Corrupt or incomplete JPEG signature file${fileName ? ` ("${fileName}")` : ''}.`
        )
      };
    }

    return {
      isValid: true,
      format: 'jpeg',
      width,
      height,
      byteLength: len
    };
  }

  return {
    isValid: false,
    byteLength: len,
    error: createPdfProcessingError(
      'ERR_UNSUPPORTED_IMAGE_FORMAT',
      `Unsupported image format${fileName ? ` ("${fileName}")` : ''}. Only valid PNG and JPEG signature images are supported.`
    )
  };
}

/**
 * Converts a visual normalized top-left rectangle `(u, v, w, h)` into exact unrotated
 * PDF page coordinates accounting for `/CropBox` origin and `/Rotate` (0, 90, 180, 270).
 */
export function transformVisualRectToPdfSpace(
  rect: ESignNormalizedRect,
  cropBox: { x: number; y: number; width: number; height: number },
  rotationDegrees: number
): PdfMappedRect {
  const u = Math.max(0, Math.min(1, rect.u));
  const v = Math.max(0, Math.min(1, rect.v));
  const w = Math.max(0.005, Math.min(1 - u, rect.w));
  const h = Math.max(0.005, Math.min(1 - v, rect.h));

  const rot = ((rotationDegrees % 360) + 360) % 360;
  const cx = cropBox.x;
  const cy = cropBox.y;
  const W = cropBox.width;
  const H = cropBox.height;

  if (rot === 90) {
    // Visual width = H, visual height = W
    // For PDF /Rotate 90 CW:
    //   unrotated (0, 0) -> visual top-left (u=0, v=0)
    //   visual +u (left->right) -> unrotated +y
    //   visual +v (top->bottom) -> unrotated +x
    // Drawing with rotate: degrees(+90) CCW maps local +X -> (0, +1) and local +Y -> (-1, 0).
    // Visual bottom-left (u, v + h) maps to unrotated (cx + (v + h) * W, cy + u * H).
    const visualWidthPt = w * H;
    const visualHeightPt = h * W;
    return {
      x: cx + (v + h) * W,
      y: cy + u * H,
      width: visualWidthPt,
      height: visualHeightPt,
      rotateDegrees: 90,
      visualWidthPt,
      visualHeightPt
    };
  }

  if (rot === 180) {
    const visualWidthPt = w * W;
    const visualHeightPt = h * H;
    return {
      x: cx + (1 - u) * W,
      y: cy + (v + h) * H,
      width: visualWidthPt,
      height: visualHeightPt,
      rotateDegrees: 180,
      visualWidthPt,
      visualHeightPt
    };
  }

  if (rot === 270) {
    // Visual width = H, visual height = W
    // For PDF /Rotate 270 CW (90 CCW):
    //   unrotated (W, H) -> visual top-left (u=0, v=0)
    //   visual +u (left->right) -> unrotated -y
    //   visual +v (top->bottom) -> unrotated -x
    // Drawing with rotate: degrees(-90) maps local +X -> (0, -1) and local +Y -> (+1, 0).
    // Visual bottom-left (u, v + h) maps to unrotated (cx + (1 - v - h) * W, cy + (1 - u) * H).
    const visualWidthPt = w * H;
    const visualHeightPt = h * W;
    return {
      x: cx + (1 - v - h) * W,
      y: cy + (1 - u) * H,
      width: visualWidthPt,
      height: visualHeightPt,
      rotateDegrees: -90,
      visualWidthPt,
      visualHeightPt
    };
  }

  // Default: 0° rotation
  const visualWidthPt = w * W;
  const visualHeightPt = h * H;
  return {
    x: cx + u * W,
    y: cy + (1 - v - h) * H,
    width: visualWidthPt,
    height: visualHeightPt,
    rotateDegrees: 0,
    visualWidthPt,
    visualHeightPt
  };
}

function buildErrorResult(
  canonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytes = 0,
  warnings: string[] = []
): PdfOperationResult {
  return {
    status: error.status,
    resolvedCanonicalId: canonicalId,
    outputFiles: [],
    summary: error.message,
    metrics: {
      inputBytes,
      outputBytes: 0,
      durationMs: Math.round((performance.now() - startTime) * 100) / 100
    },
    warnings,
    limitations: [],
    error
  };
}

function stripPdfExtension(fileName: string | undefined, fallback = 'document'): string {
  if (!fileName || typeof fileName !== 'string') return fallback;
  const cleaned = fileName.trim().replace(/\.pdf$/i, '');
  return cleaned.length > 0 ? cleaned : fallback;
}

/**
 * Draws a crisp two-segment vector checkmark inside the mapped visual rectangle
 * so it renders cleanly across all PDF viewers regardless of font encoding.
 */
function drawVectorCheckmark(
  page: PDFPage,
  mapped: PdfMappedRect,
  color: RgbColorNormalized,
  opacity: number
): void {
  const rad = (mapped.rotateDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const toPdfPoint = (lx: number, ly: number) => ({
    x: mapped.x + lx * cos - ly * sin,
    y: mapped.y + lx * sin + ly * cos
  });

  const p1 = toPdfPoint(mapped.width * 0.16, mapped.height * 0.48);
  const p2 = toPdfPoint(mapped.width * 0.42, mapped.height * 0.2);
  const p3 = toPdfPoint(mapped.width * 0.86, mapped.height * 0.82);

  const thickness = Math.max(1.5, Math.min(mapped.width, mapped.height) * 0.13);
  const strokeColor = rgb(color.r, color.g, color.b);

  page.drawLine({
    start: p1,
    end: p2,
    thickness,
    color: strokeColor,
    opacity
  });
  page.drawLine({
    start: p2,
    end: p3,
    thickness,
    color: strokeColor,
    opacity
  });
}

async function drawPlacedTextElement(params: {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  text: string;
  mapped: PdfMappedRect;
  fontSizePt: number;
  color: RgbColorNormalized;
  opacity: number;
}): Promise<{ usedUnicodeFallback: boolean }> {
  const { doc, page, font, text, mapped, fontSizePt, color, opacity } = params;
  const trimmed = text.trim();
  if (!trimmed) {
    return { usedUnicodeFallback: false };
  }

  const canUseVector = isTextEncodableByFont(trimmed, font);
  if (canUseVector) {
    // Center vertically inside the placed box
    const rad = (mapped.rotateDegrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const localOffsetY = Math.max(2, (mapped.height - fontSizePt * 0.8) / 2);
    const baselineX = mapped.x - localOffsetY * sin;
    const baselineY = mapped.y + localOffsetY * cos;

    page.drawText(trimmed, {
      x: baselineX,
      y: baselineY,
      size: fontSizePt,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(mapped.rotateDegrees)
    });
    return { usedUnicodeFallback: false };
  }

  // Non-WinAnsi Unicode text (CJK, Polish, Cyrillic, Arabic, etc.) -> transparent high-DPI PNG stamp
  const stamp = await renderUnicodeTextToPngStamp({
    text: trimmed,
    fontSizePt,
    color,
    opacity: 1,
    dpiScale: 3
  });
  const embedded = await doc.embedPng(stamp.pngBytes);

  // Fit inside mapped box preserving natural aspect ratio
  const scale = Math.min(mapped.width / stamp.widthPt, mapped.height / stamp.heightPt, 1.5);
  const drawW = Math.max(4, stamp.widthPt * scale);
  const drawH = Math.max(4, stamp.heightPt * scale);

  page.drawImage(embedded, {
    x: mapped.x,
    y: mapped.y,
    width: drawW,
    height: drawH,
    opacity,
    rotate: degrees(mapped.rotateDegrees)
  });

  return { usedUnicodeFallback: true };
}

/**
 * Core browser-local PDF E-Signature flattening engine.
 *
 * Guarantees:
 * - Original caller PDF bytes are never mutated.
 * - Image signature assets are strictly validated (magic bytes + structure) and embedded once per document.
 * - All 5 Fill & Sign element types (signature, initials, date, text, checkmark) are placed accurately
 *   across rotated and cropped pages.
 * - Output is verified via `serializeAndVerifyPdfV2` (header, EOF, PDF.js independent reopen, page count).
 * - `loadRes.dispose()` is unconditionally executed in `finally` so `pdfLifecycleManager.getActiveSessionCount()`
 *   always returns to 0 after completion or error.
 */
export async function applyESignatureElementsToPdfV2(
  input: PdfDocumentInput,
  options: ApplyESignatureOptions
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options?.canonicalId || 'sign-pdf';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (options?.signal?.aborted) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'Signing operation was cancelled.'),
      startTime,
      inputBytes
    );
  }

  if (!input || !input.bytes || inputBytes === 0) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for signing.'),
      startTime,
      0
    );
  }

  const elements = Array.isArray(options?.elements) ? options.elements : [];
  if (elements.length === 0) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_EMPTY_WATERMARK_CONTENT',
        'At least one signature, initial, date, text, or checkmark element must be placed before exporting.'
      ),
      startTime,
      inputBytes
    );
  }

  // Pre-validate all image assets BEFORE loading the PDF so invalid uploads fail fast with zero leaked sessions
  for (const el of elements) {
    if ((el.kind === 'signature' || el.kind === 'initials') && el.imageBytes) {
      const imgCheck = validateSignatureImageBytes(el.imageBytes, el.assetKey || el.id);
      if (!imgCheck.isValid && imgCheck.error) {
        return buildErrorResult(canonicalId, imgCheck.error, startTime, inputBytes);
      }
    }
  }

  options.onProgress?.({
    stage: 'LOADING',
    percent: 15,
    message: 'Loading PDF document locally...'
  });

  const loadRes = await loadPdfDocumentV2(input, { password: input.password });
  warnings.push(...loadRes.warnings);

  try {
    if (options?.signal?.aborted) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError('ERR_OPERATION_ABORTED', 'Signing operation was cancelled.'),
        startTime,
        inputBytes,
        warnings
      );
    }

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

    // Validate all target page numbers before mutating
    for (const el of elements) {
      if (!Number.isInteger(el.pageNumber) || el.pageNumber < 1 || el.pageNumber > totalPages) {
        return buildErrorResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_INVALID_PAGE_RANGE',
            `Placed element targets invalid page ${String(el.pageNumber)} (document has ${totalPages} page(s)).`
          ),
          startTime,
          inputBytes,
          warnings
        );
      }
    }

    // Deduplicate embedded images and fonts across all elements & pages
    const embeddedImageCache = new Map<string, PDFImage>();
    const embeddedFontCache = new Map<string, PDFFont>();

    const getOrEmbedFont = async (
      family: 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier' = 'Helvetica'
    ): Promise<PDFFont> => {
      const existing = embeddedFontCache.get(family);
      if (existing) return existing;
      const std =
        family === 'HelveticaBold'
          ? StandardFonts.HelveticaBold
          : family === 'TimesRoman'
            ? StandardFonts.TimesRoman
            : family === 'Courier'
              ? StandardFonts.Courier
              : StandardFonts.Helvetica;
      const font = await doc.embedFont(std);
      embeddedFontCache.set(family, font);
      return font;
    };

    const getOrEmbedImage = async (el: ESignPlacedElement): Promise<PDFImage> => {
      const cacheKey = el.assetKey || el.id;
      const cached = embeddedImageCache.get(cacheKey);
      if (cached) return cached;

      if (!el.imageBytes || el.imageBytes.byteLength === 0) {
        throw createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          'Signature image bytes are missing.'
        );
      }

      const check = validateSignatureImageBytes(el.imageBytes, cacheKey);
      if (!check.isValid || !check.format) {
        throw (
          check.error ||
          createPdfProcessingError(
            'ERR_UNSUPPORTED_IMAGE_FORMAT',
            'Signature image must be a valid PNG or JPEG.'
          )
        );
      }

      try {
        const embedded =
          check.format === 'png'
            ? await doc.embedPng(el.imageBytes)
            : await doc.embedJpg(el.imageBytes);
        embeddedImageCache.set(cacheKey, embedded);
        return embedded;
      } catch {
        throw createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          'Signature image could not be decoded as a valid PNG or JPEG.'
        );
      }
    };

    options.onProgress?.({
      stage: 'PROCESSING_PAGES',
      percent: 45,
      message: `Applying ${elements.length} element(s) to PDF pages...`
    });

    const modifiedPageSet = new Set<number>();
    let usedUnicodeFallback = false;

    for (let idx = 0; idx < elements.length; idx++) {
      if (options?.signal?.aborted) {
        return buildErrorResult(
          canonicalId,
          createPdfProcessingError('ERR_OPERATION_ABORTED', 'Signing operation was cancelled.'),
          startTime,
          inputBytes,
          warnings
        );
      }

      const el = elements[idx];
      const page = doc.getPage(el.pageNumber - 1);
      const cropBox = page.getCropBox();
      const rotationAngle = page.getRotation().angle;
      const mapped = transformVisualRectToPdfSpace(el.rect, cropBox, rotationAngle);
      const opacity =
        el.opacity !== undefined && Number.isFinite(el.opacity)
          ? Math.max(0.05, Math.min(1, el.opacity))
          : 1;
      const color = parsePdfColorInput(el.color, { r: 0.067, g: 0.094, b: 0.153 });

      if (el.kind === 'signature' || (el.kind === 'initials' && el.imageBytes)) {
        const embeddedImg = await getOrEmbedImage(el);
        page.drawImage(embeddedImg, {
          x: mapped.x,
          y: mapped.y,
          width: mapped.width,
          height: mapped.height,
          opacity,
          rotate: degrees(mapped.rotateDegrees)
        });
        modifiedPageSet.add(el.pageNumber);
      } else if (el.kind === 'checkmark') {
        drawVectorCheckmark(page, mapped, color, opacity);
        modifiedPageSet.add(el.pageNumber);
      } else {
        // 'text', 'date', or text-based 'initials'
        const textValue =
          el.kind === 'date'
            ? (el.text && el.text.trim().length > 0
                ? el.text.trim()
                : formatESignDate(new Date(), el.dateFormat || 'iso'))
            : (el.text || '').trim();

        if (textValue.length > 0) {
          const font = await getOrEmbedFont(el.fontFamily || 'Helvetica');
          const fontSizePt = Math.max(
            6,
            Math.min(72, Number(el.fontSizePt) || Math.round(mapped.height * 0.65) || 13)
          );
          const drawRes = await drawPlacedTextElement({
            doc,
            page,
            font,
            text: textValue,
            mapped,
            fontSizePt,
            color,
            opacity
          });
          if (drawRes.usedUnicodeFallback) {
            usedUnicodeFallback = true;
          }
          modifiedPageSet.add(el.pageNumber);
        }
      }
    }

    options.onProgress?.({
      stage: 'VERIFYING_OUTPUT',
      percent: 82,
      message: 'Verifying signed PDF output integrity...'
    });

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      doc,
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
    const defaultSuffix =
      canonicalId === 'fill-and-sign'
        ? '_filled_signed.pdf'
        : canonicalId === 'add-date-initials'
          ? '_initialed.pdf'
          : '_signed.pdf';
    const outputFileName = options.outputFileName || `${baseName}${defaultSuffix}`;

    const primaryFile: PdfOutputFile = {
      fileName: outputFileName,
      mimeType: 'application/pdf',
      bytes: verifiedBytes,
      byteLength: verifiedBytes.byteLength,
      pageCount: totalPages
    };

    const modifiedPageNumbers = Array.from(modifiedPageSet).sort((a, b) => a - b);

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: verifiedBytes,
      summary: `Applied ${elements.length} element(s) across ${modifiedPageNumbers.length} page(s) of "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100
      },
      warnings,
      limitations: [
        'Visual electronic signature applied locally in your browser (not a PKI/X.509 cryptographic certificate).',
        ...(usedUnicodeFallback
          ? ['Non-WinAnsi Unicode text fields were rendered via high-DPI transparent PNG stamp fallback.']
          : [])
      ],
      details: {
        elementsApplied: elements.length,
        modifiedPageNumbers,
        embeddedUniqueImages: embeddedImageCache.size,
        usedUnicodeFallback
      }
    };
  } catch (err: unknown) {
    const procErr =
      err && typeof err === 'object' && 'code' in err && 'status' in err
        ? (err as PdfProcessingError)
        : normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildErrorResult(canonicalId, procErr, startTime, inputBytes, warnings);
  } finally {
    await loadRes.dispose();
  }
}
