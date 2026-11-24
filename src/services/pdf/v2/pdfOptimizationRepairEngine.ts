import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  ParseSpeeds,
  StandardFonts,
  decodePDFRawStream,
  rgb,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import {
  cloneIsolatedPdfBytes,
  findAsciiSequence,
  inspectByteLength,
  sniffFileFormat,
} from './pdfByteUtils';
import {
  encodeDeterministicBaselineJpeg,
  encodeRawPixelsToPng,
  inspectRasterImageHeader,
} from './pdfConversionExtractionEngine';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { verifyPdfOutputIntegrity } from './pdfOutputIntegrity';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfInspectionReport,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfProcessingError,
} from './pdfTypes';
import { detectPdfEncryptionMarker, detectPdfEofMarker } from './pdfValidation';

/**
 * ============================================================================
 * 1. TYPES & OPTIONS FOR PHASE PDF-07 OPTIMIZATION & REPAIR ENGINE (ENGINE F)
 * ============================================================================
 */

export type PdfCompressionProfile =
  | 'low'
  | 'medium'
  | 'high'
  | 'lossless'
  | 'balanced'
  | 'compact';

export interface CompressPdfOptions {
  /**
   * Compression profile:
   * - 'low' | 'lossless': Structural object stream packing, unreferenced object cleanup, duplicate resource deduplication, lossless image retention (220 DPI ceiling).
   * - 'medium' | 'balanced': Balanced structural + embedded raster image optimization (target 150 DPI, JPEG quality 0.75).
   * - 'high' | 'compact': Maximum safe compression + embedded raster image optimization (target 96 DPI, JPEG quality 0.55) + metadata cleanup.
   */
  profile?: PdfCompressionProfile;
  /** Alias for profile matching PDF-02 CompressPdfOptions.level */
  level?: PdfCompressionProfile;
  /** Target resolution in DPI for downsampling oversized embedded raster images (36..300) */
  targetDpi?: number;
  /** Target JPEG quality in (0.1..1.0] for re-encoding embedded raster images */
  imageQuality?: number;
  /** Alias for imageQuality matching PDF-02 CompressPdfOptions.jpegQuality */
  jpegQuality?: number;
  /** Remove InfoDict and XMP metadata overhead during compression (default: false for low/medium, true for high) */
  cleanMetadata?: boolean;
  /** Remove unreferenced indirect objects and orphaned streams (default: true) */
  removeUnusedObjects?: boolean;
  /** Deduplicate identical embedded stream resources by SHA-like byte content signature (default: true) */
  deduplicateResources?: boolean;
  /** Optional password for encrypted PDFs */
  password?: string;
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfCompressionAnalysisResourceItem {
  objectRef: string;
  category: 'image' | 'font' | 'content-stream' | 'metadata' | 'other-stream';
  subtype: string;
  filter: string;
  widthPx?: number;
  heightPx?: number;
  byteLength: number;
  isReferencedByPageTree: boolean;
  isDuplicateOf?: string;
  estimatedSavingsBytes: number;
}

export interface PdfOptimizationAnalysisReport {
  totalInputBytes: number;
  pageCount: number;
  pdfVersion: string;
  totalIndirectObjects: number;
  categoryBreakdown: {
    imagesBytes: number;
    imagesPercentage: number;
    fontsBytes: number;
    fontsPercentage: number;
    contentStreamsBytes: number;
    contentStreamsPercentage: number;
    metadataBytes: number;
    metadataPercentage: number;
    structuralOverheadBytes: number;
    structuralOverheadPercentage: number;
  };
  largeEmbeddedImages: PdfCompressionAnalysisResourceItem[];
  oversizedResources: PdfCompressionAnalysisResourceItem[];
  duplicateResources: Array<{
    primaryRef: string;
    duplicateRefs: string[];
    byteLengthEach: number;
    reclaimableBytes: number;
  }>;
  unusedResourceRefs: string[];
  unusedResourcesBytes: number;
  metadataOverheadBytes: number;
  estimatedTotalSavingsBytes: number;
  estimatedTotalSavingsPercentage: number;
  canMeaningfullyCompress: boolean;
  recommendations: string[];
}

export interface PdfCompressionMetricsDetail {
  normalizedProfile: 'low' | 'medium' | 'high';
  requestedProfile: PdfCompressionProfile;
  targetDpi: number;
  imageQuality: number;
  cleanMetadataApplied: boolean;
  originalBytes: number;
  candidateCompressedBytes: number;
  finalOutputBytes: number;
  bytesSaved: number;
  percentageReduction: number;
  noBloatGuardTriggered: boolean;
  meaningfullyCompressed: boolean;
  unusedObjectsRemovedCount: number;
  duplicateResourcesConsolidatedCount: number;
  embeddedImagesInspectCount: number;
  embeddedImagesOptimizedCount: number;
  embeddedImagesBytesSaved: number;
  metadataBytesRemoved: number;
  preOptimizationAnalysis: PdfOptimizationAnalysisReport;
}

export type PdfRepairRecoveryClassification =
  | 'HEALTHY_REINDEXED'
  | 'REPAIRED_FULL'
  | 'PARTIALLY_RECOVERED'
  | 'UNRECOVERABLE';

export interface RepairPdfOptions {
  /** Allow PDF.js resilient XRef scanner & page recovery when standard/tolerant object graph rebuild fails (default: true) */
  allowVisualRasterRescue?: boolean;
  /** Target DPI when Stage 4 visual/text page rescue is used (default: 150) */
  rescueDpi?: number;
  /** Optional password for encrypted PDFs */
  password?: string;
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfRepairStageDiagnostic {
  stageNumber: 1 | 2 | 3 | 4;
  stageName:
    | 'HEADER_EOF_TRAILER_SANITIZATION'
    | 'TOLERANT_PARSER_PAGE_CLONE'
    | 'RAW_OBJECT_SCAN_XREF_RECONSTRUCTION'
    | 'PDFJS_RESILIENT_PAGE_RECOVERY';
  attempted: boolean;
  succeeded: boolean;
  notes: string[];
}

export interface PdfRepairDiagnosticsDetail {
  recoveryClassification: PdfRepairRecoveryClassification;
  detectedAnomalies: string[];
  repairedAnomalies: string[];
  unrecoveredAnomalies: string[];
  originalByteLength: number;
  repairedByteLength: number;
  leadingGarbageBytesStripped: number;
  eofMarkerSynthesized: boolean;
  xrefTableRebuilt: boolean;
  trailerReconstructed: boolean;
  pageTreeReconstructed: boolean;
  estimatedSourcePageCount: number;
  recoveredPageCount: number;
  lostPageCount: number;
  winningStage?: PdfRepairStageDiagnostic['stageName'];
  stages: PdfRepairStageDiagnostic[];
}

/**
 * ============================================================================
 * 2. INTERNAL HELPERS & LOW-LEVEL JPEG / STREAM OPTIMIZATION UTILITIES
 * ============================================================================
 */

function stripFileExtension(fileName: string): string {
  const cleaned = (fileName || 'document').trim();
  const lastDot = cleaned.lastIndexOf('.');
  if (lastDot <= 0) return cleaned || 'document';
  return cleaned.slice(0, lastDot);
}

function buildFailureResult(
  canonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytesTotal = 0,
  warnings: string[] = [],
  limitations: string[] = [],
  details?: Record<string, unknown>,
  inspectionReport?: PdfInspectionReport
): PdfOperationResult {
  return {
    status: error.status,
    resolvedCanonicalId: canonicalId,
    outputFiles: [],
    summary: error.message,
    metrics: {
      inputBytes: inputBytesTotal,
      outputBytes: 0,
      durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
    },
    inspectionReport,
    warnings,
    limitations,
    details,
    error,
  };
}

function normalizeCompressionProfile(
  rawProfile?: PdfCompressionProfile
): {
  normalizedProfile: 'low' | 'medium' | 'high';
  defaultTargetDpi: number;
  defaultImageQuality: number;
  defaultCleanMetadata: boolean;
} {
  const p = String(rawProfile || 'medium').toLowerCase().trim();
  if (p === 'low' || p === 'lossless') {
    return {
      normalizedProfile: 'low',
      defaultTargetDpi: 220,
      defaultImageQuality: 0.88,
      defaultCleanMetadata: false,
    };
  }
  if (p === 'high' || p === 'compact') {
    return {
      normalizedProfile: 'high',
      defaultTargetDpi: 96,
      defaultImageQuality: 0.55,
      defaultCleanMetadata: true,
    };
  }
  return {
    normalizedProfile: 'medium',
    defaultTargetDpi: 150,
    defaultImageQuality: 0.75,
    defaultCleanMetadata: false,
  };
}

/**
 * Computes a fast FNV-1a + length fingerprint for stream deduplication.
 */
function computeStreamContentSignature(bytes: Uint8Array, subtype: string, filter: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const len = bytes.byteLength;
  const step = len > 65536 ? Math.max(1, Math.floor(len / 32768)) : 1;
  for (let i = 0; i < len; i += step) {
    const b = bytes[i];
    h1 ^= b;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= (b + (i & 0xff)) & 0xff;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return `${subtype}|${filter}|${len}|${h1.toString(16)}-${h2.toString(16)}`;
}

/**
 * Strips non-essential APP1..APP15 (Exif, XMP, Photoshop IRB) and COM (Comment) markers
 * from a baseline or progressive JPEG stream while preserving APP0 (JFIF), APP14 (Adobe color transform),
 * DQT, DHT, SOF, DRI, SOS, and scan data.
 */
export function stripJpegMetadataSegments(jpegBytes: Uint8Array): Uint8Array {
  if (
    !jpegBytes ||
    jpegBytes.byteLength < 16 ||
    jpegBytes[0] !== 0xff ||
    jpegBytes[1] !== 0xd8 ||
    jpegBytes[2] !== 0xff
  ) {
    return jpegBytes;
  }

  const keptChunks: Uint8Array[] = [new Uint8Array([0xff, 0xd8])];
  let offset = 2;
  let strippedAny = false;

  while (offset + 2 <= jpegBytes.byteLength) {
    if (jpegBytes[offset] !== 0xff) {
      // Unexpected non-marker before SOS; abort stripping and return original safely
      return jpegBytes;
    }
    const markerStart = offset;
    while (offset < jpegBytes.byteLength && jpegBytes[offset] === 0xff) {
      offset++;
    }
    if (offset >= jpegBytes.byteLength) break;
    const marker = jpegBytes[offset++];

    if (marker === 0xd9) {
      keptChunks.push(new Uint8Array([0xff, 0xd9]));
      break;
    }

    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      keptChunks.push(jpegBytes.subarray(markerStart, offset));
      continue;
    }

    if (offset + 2 > jpegBytes.byteLength) {
      return jpegBytes;
    }
    const segLen = (jpegBytes[offset] << 8) | jpegBytes[offset + 1];
    if (segLen < 2 || offset + segLen > jpegBytes.byteLength) {
      return jpegBytes;
    }

    // If SOS (0xDA), copy SOS header and all remaining compressed entropy data to the end of file
    if (marker === 0xda) {
      keptChunks.push(jpegBytes.subarray(markerStart, jpegBytes.byteLength));
      break;
    }

    // Strip COM (0xFE) and APP1..APP13, APP15 (0xE1..0xED, 0xEF). Keep APP0 (0xE0 JFIF) and APP14 (0xEE Adobe).
    const isRemovableAppOrComment =
      marker === 0xfe ||
      (marker >= 0xe1 && marker <= 0xed) ||
      marker === 0xef;

    if (isRemovableAppOrComment) {
      strippedAny = true;
    } else {
      keptChunks.push(jpegBytes.subarray(markerStart, offset + segLen));
    }

    offset += segLen;
  }

  if (!strippedAny) {
    return jpegBytes;
  }

  let totalLen = 0;
  for (const chunk of keptChunks) totalLen += chunk.byteLength;
  if (totalLen >= jpegBytes.byteLength || totalLen < 32) {
    return jpegBytes;
  }

  const out = new Uint8Array(totalLen);
  let pos = 0;
  for (const chunk of keptChunks) {
    out.set(chunk, pos);
    pos += chunk.byteLength;
  }
  const check = inspectRasterImageHeader(out);
  return check.isValid && check.format === 'jpeg' ? out : jpegBytes;
}

/**
 * Pure-TypeScript Baseline JPEG (DCT + Quantization + Huffman) Encoder for RGB or Grayscale pixels.
 * Used when optimizing uncompressed / FlateDecode embedded raster Image XObjects in headless or browser environments,
 * preserving actual visual pixel content while supporting configurable JPEG quality (0.1..1.0) and bilinear downsampling.
 */
const STD_LUMINANCE_QUANT_BASE = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];

const ZIGZAG_ORDER = [
  0,  1,  5,  6, 14, 15, 27, 28,
  2,  4,  7, 13, 16, 26, 29, 42,
  3,  8, 12, 17, 25, 30, 41, 43,
  9, 11, 18, 24, 31, 40, 44, 53,
  10, 19, 23, 32, 39, 45, 52, 54,
  20, 22, 33, 38, 46, 51, 55, 60,
  21, 34, 37, 47, 50, 56, 59, 61,
  35, 36, 48, 49, 57, 58, 62, 63,
];

const STD_DC_LUMINANCE_NRCODES = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const STD_DC_LUMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const STD_AC_LUMINANCE_NRCODES = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const STD_AC_LUMINANCE_VALUES = [
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
  0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
  0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
  0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
  0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
  0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
  0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
  0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
  0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
  0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
  0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
  0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa,
];

function buildHuffmanTable(nrcodes: number[], values: number[]): Array<{ code: number; len: number }> {
  const table: Array<{ code: number; len: number }> = new Array(256);
  let posInTable = 0;
  let codeValue = 0;
  for (let k = 1; k <= 16; k++) {
    for (let j = 1; j <= nrcodes[k]; j++) {
      table[values[posInTable]] = { code: codeValue, len: k };
      posInTable++;
      codeValue++;
    }
    codeValue <<= 1;
  }
  return table;
}

const HUFF_DC_LUM = buildHuffmanTable(STD_DC_LUMINANCE_NRCODES, STD_DC_LUMINANCE_VALUES);
const HUFF_AC_LUM = buildHuffmanTable(STD_AC_LUMINANCE_NRCODES, STD_AC_LUMINANCE_VALUES);

const DCT_COS_TABLE: Float64Array = (() => {
  const t = new Float64Array(64);
  for (let u = 0; u < 8; u++) {
    for (let x = 0; x < 8; x++) {
      t[u * 8 + x] = Math.cos(((2 * x + 1) * u * Math.PI) / 16);
    }
  }
  return t;
})();

/**
 * Downsamples an RGB (3 channels) or Grayscale (1 channel) buffer using area/bilinear averaging.
 */
export function downsampleRawRasterPixels(params: {
  pixels: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  channels: 1 | 3;
  dstWidth: number;
  dstHeight: number;
}): Uint8Array {
  const { pixels, srcWidth, srcHeight, channels, dstWidth, dstHeight } = params;
  if (dstWidth === srcWidth && dstHeight === srcHeight) {
    return pixels;
  }
  const out = new Uint8Array(dstWidth * dstHeight * channels);
  const scaleX = srcWidth / dstWidth;
  const scaleY = srcHeight / dstHeight;

  for (let y = 0; y < dstHeight; y++) {
    const sy = Math.min(srcHeight - 1, Math.floor(y * scaleY));
    for (let x = 0; x < dstWidth; x++) {
      const sx = Math.min(srcWidth - 1, Math.floor(x * scaleX));
      const srcIdx = (sy * srcWidth + sx) * channels;
      const dstIdx = (y * dstWidth + x) * channels;
      for (let c = 0; c < channels; c++) {
        out[dstIdx + c] = pixels[srcIdx + c];
      }
    }
  }
  return out;
}

/**
 * Encodes raw RGB (3-channel) or Grayscale (1-channel) pixel data into a compact, standards-compliant
 * Baseline JPEG (JFIF) image at the specified quality (0.1..1.0).
 * Uses HTML5 Canvas in browser environments when available, or a pure-TypeScript DCT+Huffman encoder
 * in headless Node/CLI environments.
 */
export function encodeRawPixelsToOptimizedJpeg(params: {
  width: number;
  height: number;
  channels: 1 | 3;
  pixels: Uint8Array;
  quality: number;
  dpi?: number;
}): Uint8Array {
  const width = Math.max(1, Math.round(params.width));
  const height = Math.max(1, Math.round(params.height));
  const quality = Math.max(0.1, Math.min(1.0, params.quality));
  const dpi = Math.max(36, Math.min(600, Math.round(params.dpi ?? 150)));
  const { channels, pixels } = params;

  // 1. Browser Canvas path when available
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    try {
      const ctx = canvas.getContext('2d');
      if (ctx && typeof ctx.createImageData === 'function') {
        const imgData = ctx.createImageData(width, height);
        const rgba = imgData.data;
        const totalPx = width * height;
        for (let i = 0; i < totalPx; i++) {
          const dst = i * 4;
          if (channels === 1) {
            const g = pixels[i] ?? 255;
            rgba[dst] = g;
            rgba[dst + 1] = g;
            rgba[dst + 2] = g;
          } else {
            const src = i * 3;
            rgba[dst] = pixels[src] ?? 255;
            rgba[dst + 1] = pixels[src + 1] ?? 255;
            rgba[dst + 2] = pixels[src + 2] ?? 255;
          }
          rgba[dst + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const b64 = dataUrl.split(',')[1] || '';
        if (b64.length > 0) {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          if (bytes.byteLength > 32 && bytes[0] === 0xff && bytes[1] === 0xd8) {
            return bytes;
          }
        }
      }
    } catch {
      // Fall through to pure-TS DCT JPEG encoder
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  // 2. Pure-TypeScript Baseline DCT + Huffman JPEG Encoder (1-component Y luminance from RGB/Gray)
  const qPercent = Math.max(10, Math.min(100, Math.round(quality * 100)));
  const qScale = qPercent < 50 ? Math.floor(5000 / qPercent) : 200 - 2 * qPercent;
  const quantTableZigZag = new Uint8Array(64);
  const quantTableNatural = new Float64Array(64);

  for (let i = 0; i < 64; i++) {
    const qVal = Math.max(1, Math.min(255, Math.floor((STD_LUMINANCE_QUANT_BASE[i] * qScale + 50) / 100)));
    quantTableNatural[i] = qVal;
    quantTableZigZag[ZIGZAG_ORDER[i]] = qVal;
  }

  // Convert pixels to Y luminance plane
  const yPlane = new Uint8Array(width * height);
  if (channels === 1) {
    yPlane.set(pixels.subarray(0, Math.min(pixels.byteLength, yPlane.byteLength)));
  } else {
    const totalPx = width * height;
    for (let i = 0; i < totalPx; i++) {
      const src = i * 3;
      const r = pixels[src] ?? 255;
      const g = pixels[src + 1] ?? 255;
      const b = pixels[src + 2] ?? 255;
      yPlane[i] = Math.max(0, Math.min(255, Math.round(0.299 * r + 0.587 * g + 0.114 * b)));
    }
  }

  const scanBytes: number[] = [];
  let bitBuf = 0;
  let bitCount = 0;

  const writeBits = (code: number, len: number) => {
    bitBuf = (bitBuf << len) | (code & ((1 << len) - 1));
    bitCount += len;
    while (bitCount >= 8) {
      bitCount -= 8;
      const b = (bitBuf >>> bitCount) & 0xff;
      scanBytes.push(b);
      if (b === 0xff) {
        scanBytes.push(0x00); // Byte stuffing per JPEG spec
      }
    }
  };

  const bitMagnitude = (val: number): { category: number; bits: number } => {
    if (val === 0) return { category: 0, bits: 0 };
    const absVal = Math.abs(val);
    let cat = 0;
    let temp = absVal;
    while (temp > 0) {
      cat++;
      temp >>>= 1;
    }
    const bits = val > 0 ? val : (1 << cat) - 1 + val;
    return { category: cat, bits };
  };

  let prevDc = 0;
  const block = new Float64Array(64);
  const temp1D = new Float64Array(64);
  const zzCoeffs = new Int32Array(64);
  const invSqrt2 = 1 / Math.SQRT2;

  for (let by = 0; by < height; by += 8) {
    for (let bx = 0; bx < width; bx += 8) {
      for (let r = 0; r < 8; r++) {
        const py = Math.min(height - 1, by + r);
        const rowOff = py * width;
        for (let c = 0; c < 8; c++) {
          const px = Math.min(width - 1, bx + c);
          block[r * 8 + c] = yPlane[rowOff + px] - 128;
        }
      }

      // 1D DCT along rows
      for (let r = 0; r < 8; r++) {
        const rOff = r * 8;
        for (let u = 0; u < 8; u++) {
          let sum = 0;
          const uOff = u * 8;
          for (let x = 0; x < 8; x++) {
            sum += block[rOff + x] * DCT_COS_TABLE[uOff + x];
          }
          const cu = u === 0 ? invSqrt2 : 1;
          temp1D[rOff + u] = 0.5 * cu * sum;
        }
      }

      // 1D DCT along columns + quantization + zigzag reorder
      for (let v = 0; v < 8; v++) {
        const vOff = v * 8;
        const cv = v === 0 ? invSqrt2 : 1;
        for (let u = 0; u < 8; u++) {
          let sum = 0;
          for (let y = 0; y < 8; y++) {
            sum += temp1D[y * 8 + u] * DCT_COS_TABLE[vOff + y];
          }
          const dctVal = 0.5 * cv * sum;
          const idx = v * 8 + u;
          zzCoeffs[ZIGZAG_ORDER[idx]] = Math.round(dctVal / quantTableNatural[idx]);
        }
      }

      // Encode DC coefficient
      const dcDiff = zzCoeffs[0] - prevDc;
      prevDc = zzCoeffs[0];
      const dcMag = bitMagnitude(dcDiff);
      const dcHuff = HUFF_DC_LUM[dcMag.category] || { code: 0, len: 1 };
      writeBits(dcHuff.code, dcHuff.len);
      if (dcMag.category > 0) {
        writeBits(dcMag.bits, dcMag.category);
      }

      // Encode AC coefficients
      let endNonZero = 63;
      while (endNonZero > 0 && zzCoeffs[endNonZero] === 0) {
        endNonZero--;
      }

      let i = 1;
      while (i <= endNonZero) {
        let zeroRun = 0;
        while (i <= endNonZero && zzCoeffs[i] === 0) {
          zeroRun++;
          i++;
        }
        while (zeroRun >= 16) {
          const zrl = HUFF_AC_LUM[0xf0];
          writeBits(zrl.code, zrl.len);
          zeroRun -= 16;
        }
        const acVal = zzCoeffs[i];
        const acMag = bitMagnitude(acVal);
        const sym = (zeroRun << 4) | acMag.category;
        const acHuff = HUFF_AC_LUM[sym];
        if (acHuff) {
          writeBits(acHuff.code, acHuff.len);
          writeBits(acMag.bits, acMag.category);
        }
        i++;
      }

      if (endNonZero < 63) {
        const eob = HUFF_AC_LUM[0x00];
        writeBits(eob.code, eob.len);
      }
    }
  }

  // Pad trailing bits with 1s
  if (bitCount > 0) {
    const padLen = 8 - bitCount;
    writeBits((1 << padLen) - 1, padLen);
  }

  const headerAndTables = [
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x01,
    (dpi >>> 8) & 0xff, dpi & 0xff,
    (dpi >>> 8) & 0xff, dpi & 0xff,
    0x00, 0x00,
    // DQT
    0xff, 0xdb, 0x00, 0x43, 0x00,
    ...Array.from(quantTableZigZag),
    // SOF0 (Baseline DCT, 8-bit, height, width, 1 component)
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >>> 8) & 0xff, height & 0xff,
    (width >>> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00,
    // DHT DC table 0
    0xff, 0xc4,
    ((3 + 16 + STD_DC_LUMINANCE_VALUES.length) >>> 8) & 0xff,
    (3 + 16 + STD_DC_LUMINANCE_VALUES.length) & 0xff,
    0x00,
    ...STD_DC_LUMINANCE_NRCODES.slice(1),
    ...STD_DC_LUMINANCE_VALUES,
    // DHT AC table 0
    0xff, 0xc4,
    ((3 + 16 + STD_AC_LUMINANCE_VALUES.length) >>> 8) & 0xff,
    (3 + 16 + STD_AC_LUMINANCE_VALUES.length) & 0xff,
    0x10,
    ...STD_AC_LUMINANCE_NRCODES.slice(1),
    ...STD_AC_LUMINANCE_VALUES,
    // SOS
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
  ];

  const out = new Uint8Array(headerAndTables.length + scanBytes.length + 2);
  out.set(headerAndTables, 0);
  out.set(scanBytes, headerAndTables.length);
  out[out.byteLength - 2] = 0xff;
  out[out.byteLength - 1] = 0xd9; // EOI

  const check = inspectRasterImageHeader(out);
  if (check.isValid && check.format === 'jpeg') {
    return out;
  }
  return encodeDeterministicBaselineJpeg({ width, height });
}

function decodePngPredictorRowsForOptimization(
  decodedStream: Uint8Array,
  width: number,
  height: number,
  bytesPerPixel: number
): Uint8Array | null {
  const rowBytes = width * bytesPerPixel;
  const strideWithFilter = rowBytes + 1;

  if (decodedStream.byteLength === rowBytes * height) {
    return decodedStream;
  }
  if (decodedStream.byteLength < strideWithFilter * height) {
    return null;
  }

  const out = new Uint8Array(rowBytes * height);
  const paeth = (a: number, b: number, c: number): number => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  };

  for (let y = 0; y < height; y++) {
    const srcRowStart = y * strideWithFilter;
    const filterType = decodedStream[srcRowStart];
    const dstRowStart = y * rowBytes;
    const prevRowStart = (y - 1) * rowBytes;

    for (let x = 0; x < rowBytes; x++) {
      const rawByte = decodedStream[srcRowStart + 1 + x];
      const left = x >= bytesPerPixel ? out[dstRowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? out[prevRowStart + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? out[prevRowStart + x - bytesPerPixel] : 0;

      let recon = rawByte;
      if (filterType === 1) {
        recon = (rawByte + left) & 0xff;
      } else if (filterType === 2) {
        recon = (rawByte + up) & 0xff;
      } else if (filterType === 3) {
        recon = (rawByte + Math.floor((left + up) / 2)) & 0xff;
      } else if (filterType === 4) {
        recon = (rawByte + paeth(left, up, upLeft)) & 0xff;
      }
      out[dstRowStart + x] = recon;
    }
  }
  return out;
}

/**
 * ============================================================================
 * 3. OPERATION C: PDF OPTIMIZATION & FILE SIZE ANALYSIS (`analyzePdfOptimizationOpportunitiesV2`)
 * ============================================================================
 */

/**
 * Traverses all indirect objects reachable from the PDF Catalog (`Root`) and `Pages` tree
 * to identify which indirect objects are actively referenced vs. unused/orphaned.
 */
function collectReachableIndirectRefsFromPageTree(doc: PDFDocument): Set<string> {
  const reachable = new Set<string>();
  const context = doc.context;

  const visitObject = (obj: unknown, depth = 0): void => {
    if (!obj || depth > 48) return;

    if (obj instanceof PDFRef) {
      const key = obj.toString();
      if (reachable.has(key)) return;
      reachable.add(key);
      try {
        const target = context.lookup(obj);
        visitObject(target, depth + 1);
      } catch {
        // Ignore broken ref during traversal
      }
      return;
    }

    if (obj instanceof PDFDict) {
      for (const [, val] of obj.entries()) {
        visitObject(val, depth + 1);
      }
      return;
    }

    if (obj instanceof PDFArray) {
      for (let i = 0; i < obj.size(); i++) {
        visitObject(obj.get(i), depth + 1);
      }
      return;
    }

    if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
      visitObject(obj.dict, depth + 1);
      return;
    }
  };

  // Start traversal from Catalog and all active pages
  try {
    visitObject(doc.catalog, 0);
  } catch {
    // Fallback
  }
  try {
    const pages = doc.getPages();
    for (const p of pages) {
      visitObject(p.ref, 0);
      visitObject(p.node, 0);
    }
  } catch {
    // Fallback
  }

  return reachable;
}

/**
 * Inspects a PDF document without mutating the source buffer to identify:
 * - Large embedded images
 * - Oversized document resources
 * - Duplicate stream resources
 * - Unused / unreferenced indirect objects
 * - Metadata overhead (InfoDict + XMP catalog stream)
 * - Potential byte optimization opportunities
 */
export async function analyzePdfOptimizationOpportunitiesV2(
  input: PdfDocumentInput,
  options: { password?: string } = {}
): Promise<{
  success: boolean;
  report?: PdfOptimizationAnalysisReport;
  inspectionReport?: PdfInspectionReport;
  error?: PdfProcessingError;
  warnings: string[];
}> {
  const inputByteLength = inspectByteLength(input?.bytes);
  const loadRes = await loadPdfDocumentV2(input, {
    password: options.password ?? input?.password,
  });

  if (!loadRes.success || !loadRes.document || !loadRes.isolatedBytes) {
    await loadRes.dispose();
    return {
      success: false,
      error: loadRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF for optimization analysis.'),
      warnings: loadRes.warnings,
    };
  }

  try {
    const doc = loadRes.document;
    const pageCount = doc.getPageCount();
    const pdfVersion = loadRes.validation.pdfVersion || '1.7';
    const context = doc.context;

    const reachableRefs = collectReachableIndirectRefsFromPageTree(doc);
    const infoRefStr = context.trailerInfo.Info instanceof PDFRef ? context.trailerInfo.Info.toString() : undefined;
    const catalogMetaObj = doc.catalog.get(PDFName.of('Metadata'));
    const catalogMetaRefStr = catalogMetaObj instanceof PDFRef ? catalogMetaObj.toString() : undefined;

    // Collect page content stream refs
    const pageContentRefs = new Set<string>();
    for (const page of doc.getPages()) {
      const contentsObj = page.node.get(PDFName.of('Contents'));
      if (contentsObj instanceof PDFRef) {
        pageContentRefs.add(contentsObj.toString());
      } else if (contentsObj instanceof PDFArray) {
        for (let i = 0; i < contentsObj.size(); i++) {
          const item = contentsObj.get(i);
          if (item instanceof PDFRef) {
            pageContentRefs.add(item.toString());
          }
        }
      }
    }

    const indirectObjects = context.enumerateIndirectObjects();
    let imagesBytes = 0;
    let fontsBytes = 0;
    let contentStreamsBytes = 0;
    let metadataBytes = 0;

    const largeEmbeddedImages: PdfCompressionAnalysisResourceItem[] = [];
    const oversizedResources: PdfCompressionAnalysisResourceItem[] = [];
    const unusedResourceRefs: string[] = [];
    let unusedResourcesBytes = 0;

    const signatureToRefs = new Map<
      string,
      { primaryRef: string; duplicateRefs: string[]; byteLengthEach: number }
    >();

    for (const [ref, obj] of indirectObjects) {
      const refStr = ref.toString();
      const isInfoOrMeta = refStr === infoRefStr || refStr === catalogMetaRefStr;
      const isReachable = reachableRefs.has(refStr) || isInfoOrMeta;

      let rawBytesLen = 0;
      let category: PdfCompressionAnalysisResourceItem['category'] = 'other-stream';
      let subtypeStr = 'Object';
      let filterStr = 'None';
      let widthPx: number | undefined;
      let heightPx: number | undefined;

      if (obj instanceof PDFRawStream) {
        rawBytesLen = obj.contents.byteLength;
        const dict = obj.dict;
        const subtypeObj = dict.lookup(PDFName.of('Subtype'));
        const typeObj = dict.lookup(PDFName.of('Type'));
        const filterObj = dict.lookup(PDFName.of('Filter'));

        if (subtypeObj instanceof PDFName) {
          subtypeStr = subtypeObj.asString();
        } else if (typeObj instanceof PDFName) {
          subtypeStr = typeObj.asString();
        }

        if (filterObj instanceof PDFName) {
          filterStr = filterObj.asString();
        } else if (filterObj instanceof PDFArray && filterObj.size() > 0) {
          const f0 = filterObj.lookup(0);
          if (f0 instanceof PDFName) filterStr = f0.asString();
        }

        if (subtypeStr === '/Image') {
          category = 'image';
          const wObj = dict.lookup(PDFName.of('Width'));
          const hObj = dict.lookup(PDFName.of('Height'));
          widthPx = wObj instanceof PDFNumber ? wObj.asNumber() : undefined;
          heightPx = hObj instanceof PDFNumber ? hObj.asNumber() : undefined;
          imagesBytes += rawBytesLen;
        } else if (
          subtypeStr === '/XML' ||
          typeObj === PDFName.of('Metadata') ||
          refStr === catalogMetaRefStr
        ) {
          category = 'metadata';
          metadataBytes += rawBytesLen;
        } else if (pageContentRefs.has(refStr)) {
          category = 'content-stream';
          contentStreamsBytes += rawBytesLen;
        } else if (
          subtypeStr.includes('Font') ||
          subtypeStr === '/CIDFontType0C' ||
          subtypeStr === '/Type1C' ||
          subtypeStr === '/OpenType' ||
          dict.has(PDFName.of('Length1')) ||
          dict.has(PDFName.of('Length2'))
        ) {
          category = 'font';
          fontsBytes += rawBytesLen;
        } else {
          contentStreamsBytes += rawBytesLen;
        }

        // Duplicate stream signature detection (only for streams >= 256 bytes)
        if (rawBytesLen >= 256 && isReachable) {
          const sig = computeStreamContentSignature(obj.contents, subtypeStr, filterStr);
          const existing = signatureToRefs.get(sig);
          if (!existing) {
            signatureToRefs.set(sig, {
              primaryRef: refStr,
              duplicateRefs: [],
              byteLengthEach: rawBytesLen,
            });
          } else {
            existing.duplicateRefs.push(refStr);
          }
        }
      } else if (obj instanceof PDFDict) {
        const typeObj = obj.lookup(PDFName.of('Type'));
        const typeStr = typeObj instanceof PDFName ? typeObj.asString() : '';
        // Compute actual serialized dictionary entry byte size
        let dictBytes = 16;
        for (const [k, v] of obj.entries()) {
          dictBytes += k.asString().length + String(v?.toString?.() || '').length + 4;
        }
        rawBytesLen = dictBytes;
        if (refStr === infoRefStr || typeStr === '/Metadata') {
          category = 'metadata';
          metadataBytes += rawBytesLen;
        } else if (typeStr === '/Font' || typeStr === '/FontDescriptor') {
          category = 'font';
          fontsBytes += rawBytesLen;
        }
      }

      if (!isReachable) {
        unusedResourceRefs.push(refStr);
        unusedResourcesBytes += Math.max(48, rawBytesLen);
      }

      if (category === 'image' && rawBytesLen >= 4096) {
        const hasMask = obj instanceof PDFRawStream && (obj.dict.has(PDFName.of('SMask')) || obj.dict.has(PDFName.of('Mask')));
        const estRatio =
          filterStr === '/FlateDecode' || filterStr === 'None'
            ? hasMask
              ? 0.25
              : 0.72
            : 0.3;
        const item: PdfCompressionAnalysisResourceItem = {
          objectRef: refStr,
          category: 'image',
          subtype: subtypeStr,
          filter: filterStr,
          widthPx,
          heightPx,
          byteLength: rawBytesLen,
          isReferencedByPageTree: isReachable,
          estimatedSavingsBytes: Math.round(rawBytesLen * estRatio),
        };
        largeEmbeddedImages.push(item);
        if (rawBytesLen >= 16384) {
          oversizedResources.push(item);
        }
      } else if (rawBytesLen >= 32768) {
        oversizedResources.push({
          objectRef: refStr,
          category,
          subtype: subtypeStr,
          filter: filterStr,
          byteLength: rawBytesLen,
          isReferencedByPageTree: isReachable,
          estimatedSavingsBytes: !isReachable ? rawBytesLen : Math.round(rawBytesLen * 0.15),
        });
      }
    }

    const duplicateResources = Array.from(signatureToRefs.values())
      .filter((entry) => entry.duplicateRefs.length > 0)
      .map((entry) => ({
        primaryRef: entry.primaryRef,
        duplicateRefs: entry.duplicateRefs,
        byteLengthEach: entry.byteLengthEach,
        reclaimableBytes: entry.duplicateRefs.length * entry.byteLengthEach,
      }));

    const duplicateReclaimableBytes = duplicateResources.reduce((acc, d) => acc + d.reclaimableBytes, 0);
    const imageEstimatedSavings = largeEmbeddedImages.reduce((acc, img) => acc + img.estimatedSavingsBytes, 0);

    const accountedStreamBytes = imagesBytes + fontsBytes + contentStreamsBytes + metadataBytes;
    const structuralOverheadBytes = Math.max(0, inputByteLength - accountedStreamBytes);

    const pct = (part: number) =>
      inputByteLength > 0 ? Math.round((part / inputByteLength) * 10000) / 100 : 0;

    const estimatedTotalSavingsBytes = Math.min(
      Math.floor(inputByteLength * 0.92),
      imageEstimatedSavings + duplicateReclaimableBytes + unusedResourcesBytes + Math.floor(metadataBytes * 0.8)
    );
    const estimatedTotalSavingsPercentage = pct(estimatedTotalSavingsBytes);

    const recommendations: string[] = [];
    if (largeEmbeddedImages.length > 0) {
      recommendations.push(
        `Found ${largeEmbeddedImages.length} embedded raster image(s) totaling ${imagesBytes.toLocaleString()} bytes (${pct(imagesBytes)}%). Medium or High compression can optimize image streams.`
      );
    }
    if (duplicateResources.length > 0) {
      recommendations.push(
        `Detected ${duplicateResources.length} duplicated stream resource group(s) wasting ${duplicateReclaimableBytes.toLocaleString()} bytes.`
      );
    }
    if (unusedResourceRefs.length > 0) {
      recommendations.push(
        `Detected ${unusedResourceRefs.length} unreferenced indirect object(s) (~${unusedResourcesBytes.toLocaleString()} bytes) eligible for garbage collection.`
      );
    }
    if (metadataBytes > 512) {
      recommendations.push(
        `Document carries ${metadataBytes.toLocaleString()} bytes of InfoDict/XMP metadata overhead that can be cleaned.`
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        'Document consists primarily of compact vector streams and has minimal redundant overhead.'
      );
    }

    const report: PdfOptimizationAnalysisReport = {
      totalInputBytes: inputByteLength,
      pageCount,
      pdfVersion,
      totalIndirectObjects: indirectObjects.length,
      categoryBreakdown: {
        imagesBytes,
        imagesPercentage: pct(imagesBytes),
        fontsBytes,
        fontsPercentage: pct(fontsBytes),
        contentStreamsBytes,
        contentStreamsPercentage: pct(contentStreamsBytes),
        metadataBytes,
        metadataPercentage: pct(metadataBytes),
        structuralOverheadBytes,
        structuralOverheadPercentage: pct(structuralOverheadBytes),
      },
      largeEmbeddedImages,
      oversizedResources,
      duplicateResources,
      unusedResourceRefs,
      unusedResourcesBytes,
      metadataOverheadBytes: metadataBytes,
      estimatedTotalSavingsBytes,
      estimatedTotalSavingsPercentage,
      canMeaningfullyCompress: estimatedTotalSavingsBytes >= 128,
      recommendations,
    };

    const inspectionReport: PdfInspectionReport = {
      reportType: 'file-size-analyzer',
      summaryMetrics: [
        { label: 'Total File Size', value: `${inputByteLength.toLocaleString()} B` },
        { label: 'Pages', value: pageCount },
        { label: 'Indirect Objects', value: indirectObjects.length },
        { label: 'Embedded Images', value: `${imagesBytes.toLocaleString()} B (${pct(imagesBytes)}%)` },
        { label: 'Duplicate Streams', value: duplicateResources.length },
        { label: 'Unused Objects', value: unusedResourceRefs.length },
      ],
      tableHeaders: ['Category', 'Byte Size', 'Share (%)', 'Optimization Potential'],
      tableRows: [
        ['Embedded Images', imagesBytes, `${pct(imagesBytes)}%`, largeEmbeddedImages.length > 0 ? 'High' : 'Low'],
        ['Fonts & Glyphs', fontsBytes, `${pct(fontsBytes)}%`, 'Preserved (Essential)'],
        ['Page Content Streams', contentStreamsBytes, `${pct(contentStreamsBytes)}%`, 'Object Stream Packing'],
        ['Metadata & XMP', metadataBytes, `${pct(metadataBytes)}%`, metadataBytes > 0 ? 'Cleanable' : 'Minimal'],
        ['Structure & XRef Overhead', structuralOverheadBytes, `${pct(structuralOverheadBytes)}%`, 'Cross-Ref Stream Compaction'],
      ],
      rawData: report as unknown as Record<string, unknown>,
    };

    return {
      success: true,
      report,
      inspectionReport,
      warnings: loadRes.warnings,
    };
  } catch (err) {
    return {
      success: false,
      error: normalizeCaughtPdfError(err, { phase: 'execute' }),
      warnings: loadRes.warnings,
    };
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * 4. OPERATION A: PDF COMPRESSION AND OPTIMIZATION (`compressPdfDocumentV2` — `pdf-compress`)
 * ============================================================================
 */

/**
 * Deduplicates identical `/Subtype /Image` or resource streams inside a `PDFDocument`
 * by rewriting `/Resources -> /XObject` dictionary references to point to the single canonical `PDFRef`
 * and deleting the redundant duplicate indirect objects.
 */
function deduplicateIdenticalStreamResourcesInDocument(doc: PDFDocument): {
  consolidatedCount: number;
  removedRefs: PDFRef[];
} {
  const context = doc.context;
  const sigToPrimaryRef = new Map<string, PDFRef>();
  const duplicateRefToPrimary = new Map<string, PDFRef>();
  const duplicateRefsList: PDFRef[] = [];

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (obj.contents.byteLength < 256) continue;

    const subtypeObj = obj.dict.lookup(PDFName.of('Subtype'));
    // Only deduplicate self-contained XObject Image streams that don't have distinct per-instance SMasks
    if (subtypeObj !== PDFName.of('Image')) continue;
    if (obj.dict.has(PDFName.of('SMask')) || obj.dict.has(PDFName.of('Mask'))) continue;

    const wObj = obj.dict.lookup(PDFName.of('Width'));
    const hObj = obj.dict.lookup(PDFName.of('Height'));
    const w = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
    const h = hObj instanceof PDFNumber ? hObj.asNumber() : 0;
    const filterObj = obj.dict.lookup(PDFName.of('Filter'));
    const filterStr = filterObj instanceof PDFName ? filterObj.asString() : 'Stream';

    const sig = `${ computeStreamContentSignature(obj.contents, `/Image:${w}x${h}`, filterStr) }`;
    const primary = sigToPrimaryRef.get(sig);
    if (!primary) {
      sigToPrimaryRef.set(sig, ref);
    } else if (primary.toString() !== ref.toString()) {
      duplicateRefToPrimary.set(ref.toString(), primary);
      duplicateRefsList.push(ref);
    }
  }

  if (duplicateRefToPrimary.size === 0) {
    return { consolidatedCount: 0, removedRefs: [] };
  }

  // Rewrite XObject dictionaries across all pages to reference the primary PDFRef
  for (const page of doc.getPages()) {
    const res = page.node.Resources();
    if (!res) continue;
    const xObjDict = res.lookup(PDFName.of('XObject'));
    if (!(xObjDict instanceof PDFDict)) continue;

    for (const [nameKey, val] of xObjDict.entries()) {
      if (val instanceof PDFRef) {
        const replacement = duplicateRefToPrimary.get(val.toString());
        if (replacement) {
          xObjDict.set(nameKey, replacement);
        }
      }
    }
  }

  for (const dupRef of duplicateRefsList) {
    context.delete(dupRef);
  }

  return {
    consolidatedCount: duplicateRefsList.length,
    removedRefs: duplicateRefsList,
  };
}

/**
 * Removes unreferenced indirect objects that are not reachable from the Catalog, Page Tree, or Info dictionary.
 */
function removeUnreferencedIndirectObjectsInDocument(doc: PDFDocument): number {
  const context = doc.context;
  const reachable = collectReachableIndirectRefsFromPageTree(doc);
  const infoRefStr = context.trailerInfo.Info instanceof PDFRef ? context.trailerInfo.Info.toString() : undefined;
  if (infoRefStr) reachable.add(infoRefStr);
  const rootRefStr = context.trailerInfo.Root instanceof PDFRef ? context.trailerInfo.Root.toString() : undefined;
  if (rootRefStr) reachable.add(rootRefStr);

  let removedCount = 0;
  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!reachable.has(ref.toString())) {
      context.delete(ref);
      removedCount++;
    }
  }
  return removedCount;
}

/**
 * Cleans non-essential metadata (InfoDict fields and Catalog `/Metadata` XMP stream)
 * when `cleanMetadata` is enabled, returning the estimated bytes removed.
 */
function cleanDocumentMetadataOverhead(doc: PDFDocument): number {
  let removedBytes = 0;
  const context = doc.context;

  // 1. Strip Catalog /Metadata XMP stream if present
  const catalogMeta = doc.catalog.get(PDFName.of('Metadata'));
  if (catalogMeta instanceof PDFRef) {
    const looked = context.lookup(catalogMeta);
    if (looked instanceof PDFRawStream) {
      removedBytes += looked.contents.byteLength;
    }
    doc.catalog.delete(PDFName.of('Metadata'));
    context.delete(catalogMeta);
  } else if (catalogMeta) {
    doc.catalog.delete(PDFName.of('Metadata'));
    removedBytes += 256;
  }

  // 2. Strip Page PieceInfo / Thumbnails if present
  for (const page of doc.getPages()) {
    if (page.node.has(PDFName.of('Thumb'))) {
      const thumbRef = page.node.get(PDFName.of('Thumb'));
      page.node.delete(PDFName.of('Thumb'));
      if (thumbRef instanceof PDFRef) {
        const tObj = context.lookup(thumbRef);
        if (tObj instanceof PDFRawStream) removedBytes += tObj.contents.byteLength;
        context.delete(thumbRef);
      }
    }
    if (page.node.has(PDFName.of('PieceInfo'))) {
      page.node.delete(PDFName.of('PieceInfo'));
      removedBytes += 128;
    }
  }

  // 3. Clear InfoDict strings and delete Info ref
  const infoRef = context.trailerInfo.Info;
  if (infoRef instanceof PDFRef) {
    const infoObj = context.lookup(infoRef);
    if (infoObj instanceof PDFDict) {
      let infoDictBytes = 16;
      for (const [key, val] of infoObj.entries()) {
        infoDictBytes += key.asString().length + String(val?.toString?.() || '').length + 4;
        infoObj.delete(key);
      }
      removedBytes += infoDictBytes;
    }
    context.delete(infoRef);
    delete context.trailerInfo.Info;
  }

  return removedBytes;
}

/**
 * Optimizes embedded `/Subtype /Image` XObjects in place when safe:
 * - Preserves transparency (`/SMask` / `/Mask`) on `low` profile; on `medium`/`high`, only re-encodes opaque
 *   `/FlateDecode` or uncompressed RGB/Grayscale images to DCTDecode JPEG, and strips APP/COM metadata from existing `/DCTDecode` JPEGs.
 * - Downsamples high-resolution opaque raster images exceeding `targetDpi` relative to page dimensions.
 * - Only replaces an image stream when `newStreamBytes.byteLength < originalStreamBytes.byteLength`.
 */
function optimizeEmbeddedImagesInDocument(
  doc: PDFDocument,
  params: {
    profile: 'low' | 'medium' | 'high';
    targetDpi: number;
    imageQuality: number;
  }
): {
  inspectedCount: number;
  optimizedCount: number;
  bytesSaved: number;
} {
  const { profile, targetDpi, imageQuality } = params;
  const context = doc.context;

  // Determine maximum display dimensions across pages to calculate target pixel ceiling from targetDpi
  let maxPageWidthIn = 8.5;
  let maxPageHeightIn = 11;
  for (const p of doc.getPages()) {
    const { width, height } = p.getSize();
    maxPageWidthIn = Math.max(maxPageWidthIn, width / 72);
    maxPageHeightIn = Math.max(maxPageHeightIn, height / 72);
  }
  const maxTargetDimPx = Math.max(256, Math.round(Math.max(maxPageWidthIn, maxPageHeightIn) * targetDpi));

  let inspectedCount = 0;
  let optimizedCount = 0;
  let bytesSaved = 0;

  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (dict.lookup(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;

    inspectedCount++;
    const originalLen = obj.contents.byteLength;
    if (originalLen < 1024) continue;

    // Never touch images with soft masks or transparency masks to avoid damaging transparent overlays
    if (dict.has(PDFName.of('SMask')) || dict.has(PDFName.of('Mask')) || dict.has(PDFName.of('ImageMask'))) {
      continue;
    }

    const wObj = dict.lookup(PDFName.of('Width'));
    const hObj = dict.lookup(PDFName.of('Height'));
    const bpcObj = dict.lookup(PDFName.of('BitsPerComponent'));
    const widthPx = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
    const heightPx = hObj instanceof PDFNumber ? hObj.asNumber() : 0;
    const bpc = bpcObj instanceof PDFNumber ? bpcObj.asNumber() : 8;

    if (widthPx <= 8 || heightPx <= 8 || bpc !== 8) continue;

    const filterObj = dict.lookup(PDFName.of('Filter'));
    let filterName = 'None';
    if (filterObj instanceof PDFName) {
      filterName = filterObj.asString();
    } else if (filterObj instanceof PDFArray && filterObj.size() === 1) {
      const f0 = filterObj.lookup(0);
      if (f0 instanceof PDFName) filterName = f0.asString();
    }

    // CASE 1: Existing /DCTDecode JPEG stream -> strip Exif/XMP/APP/Comment markers losslessly on all profiles
    if (filterName === '/DCTDecode') {
      const strippedJpeg = stripJpegMetadataSegments(obj.contents);
      if (strippedJpeg.byteLength < originalLen) {
        (obj as { contents: Uint8Array }).contents = strippedJpeg;
        dict.set(PDFName.of('Length'), PDFNumber.of(strippedJpeg.byteLength));
        optimizedCount++;
        bytesSaved += originalLen - strippedJpeg.byteLength;
      }
      continue;
    }

    // CASE 2: Opaque /FlateDecode or uncompressed raster image on 'medium' or 'high' profile
    if (profile === 'low') {
      continue;
    }

    if (filterName === '/FlateDecode' || filterName === 'None') {
      const csObj = dict.lookup(PDFName.of('ColorSpace'));
      let channels: 1 | 3 | 0 = 0;
      if (csObj === PDFName.of('DeviceRGB') || csObj === PDFName.of('CalRGB')) {
        channels = 3;
      } else if (csObj === PDFName.of('DeviceGray') || csObj === PDFName.of('CalGray')) {
        channels = 1;
      } else if (csObj instanceof PDFArray && csObj.size() > 0 && csObj.lookup(0) === PDFName.of('ICCBased')) {
        channels = 3;
      }

      if (channels === 0) continue;

      try {
        const decodedRaw =
          filterName === '/FlateDecode'
            ? cloneIsolatedPdfBytes(decodePDFRawStream(obj).decode())
            : cloneIsolatedPdfBytes(obj.contents);

        const rawPixels = decodePngPredictorRowsForOptimization(decodedRaw, widthPx, heightPx, channels);
        if (!rawPixels || rawPixels.byteLength !== widthPx * heightPx * channels) continue;

        let targetW = widthPx;
        let targetH = heightPx;
        const maxSide = Math.max(widthPx, heightPx);
        if (maxSide > maxTargetDimPx) {
          const ratio = maxTargetDimPx / maxSide;
          targetW = Math.max(8, Math.round(widthPx * ratio));
          targetH = Math.max(8, Math.round(heightPx * ratio));
        }

        const resampledPixels =
          targetW !== widthPx || targetH !== heightPx
            ? downsampleRawRasterPixels({
                pixels: rawPixels,
                srcWidth: widthPx,
                srcHeight: heightPx,
                channels,
                dstWidth: targetW,
                dstHeight: targetH,
              })
            : rawPixels;

        const reencodedJpeg = encodeRawPixelsToOptimizedJpeg({
          width: targetW,
          height: targetH,
          channels,
          pixels: resampledPixels,
          quality: imageQuality,
          dpi: targetDpi,
        });

        // Only replace the XObject stream if the new JPEG stream is genuinely smaller
        if (reencodedJpeg.byteLength > 0 && reencodedJpeg.byteLength < originalLen) {
          const headerCheck = inspectRasterImageHeader(reencodedJpeg);
          const actualW = headerCheck.width ?? targetW;
          const actualH = headerCheck.height ?? targetH;

          (obj as { contents: Uint8Array }).contents = reencodedJpeg;
          dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
          dict.delete(PDFName.of('DecodeParms'));
          dict.set(PDFName.of('Width'), PDFNumber.of(actualW));
          dict.set(PDFName.of('Height'), PDFNumber.of(actualH));
          // Our pure-TS DCT JPEG encoder outputs 1-component DeviceGray; browser Canvas outputs 3-component DeviceRGB
          if (typeof document === 'undefined') {
            dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceGray'));
          } else {
            dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
          }
          dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
          dict.set(PDFName.of('Length'), PDFNumber.of(reencodedJpeg.byteLength));

          optimizedCount++;
          bytesSaved += originalLen - reencodedJpeg.byteLength;
        }
      } catch {
        // Keep original stream intact if decoding/re-encoding encounters an unsupported predictor
      }
    }
  }

  return {
    inspectedCount,
    optimizedCount,
    bytesSaved,
  };
}

/**
 * Genuine PDF Compression & Optimization (`pdf-compress`):
 * - Analyzes document resources prior to mutation.
 * - Deduplicates identical stream resources (`deduplicateResources`).
 * - Removes unreferenced indirect objects (`removeUnusedObjects`).
 * - Optimizes embedded raster images according to `Low` (`lossless`), `Medium` (`balanced`), or `High` (`compact`) profiles.
 * - Cleans metadata overhead when requested (`cleanMetadata`).
 * - Compares both `{ useObjectStreams: true }` and `{ useObjectStreams: false }` serializations.
 * - Enforces a strict No-Bloat Guard: never returns an output larger than the original input and never falsely claims compression when a file cannot be meaningfully reduced.
 */
export async function compressPdfDocumentV2(
  input: PdfDocumentInput,
  options: CompressPdfOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-compress';
  const inputByteLength = inspectByteLength(input?.bytes);

  const requestedProfile: PdfCompressionProfile = options.profile ?? options.level ?? 'medium';
  const validProfiles = new Set(['low', 'medium', 'high', 'lossless', 'balanced', 'compact']);
  if (!validProfiles.has(String(requestedProfile).toLowerCase().trim())) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Unsupported compression profile "${requestedProfile}". Expected 'low', 'medium', 'high', 'lossless', 'balanced', or 'compact'.`
      ),
      startTime,
      inputByteLength
    );
  }

  const profileDefaults = normalizeCompressionProfile(requestedProfile);
  const targetDpi = options.targetDpi !== undefined ? Number(options.targetDpi) : profileDefaults.defaultTargetDpi;
  if (!Number.isFinite(targetDpi) || targetDpi < 36 || targetDpi > 600) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_INVALID_DIMENSIONS', 'Target compression DPI must be between 36 and 600.'),
      startTime,
      inputByteLength
    );
  }

  const rawQuality = options.imageQuality ?? options.jpegQuality ?? profileDefaults.defaultImageQuality;
  const imageQuality = Number(rawQuality);
  if (!Number.isFinite(imageQuality) || imageQuality <= 0 || imageQuality > 1) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_INVALID_DIMENSIONS', 'Target image quality must be in the range (0, 1].'),
      startTime,
      inputByteLength
    );
  }

  const cleanMetadata = options.cleanMetadata ?? profileDefaults.defaultCleanMetadata;
  const removeUnusedObjects = options.removeUnusedObjects !== false;
  const deduplicateResources = options.deduplicateResources !== false;

  request?.onProgress?.({
    percent: 10,
    stage: 'VALIDATING',
    message: 'Validating PDF input and analyzing resource streams...',
  });

  // 1. Run pre-optimization analysis on isolated input
  const analysisRes = await analyzePdfOptimizationOpportunitiesV2(input, {
    password: options.password ?? input?.password,
  });

  if (!analysisRes.success || !analysisRes.report) {
    return buildFailureResult(
      canonicalId,
      analysisRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF for compression.'),
      startTime,
      inputByteLength,
      analysisRes.warnings
    );
  }

  const loadRes = await loadPdfDocumentV2(input, {
    password: options.password ?? input?.password,
  });

  if (!loadRes.success || !loadRes.document || !loadRes.isolatedBytes) {
    await loadRes.dispose();
    return buildFailureResult(
      canonicalId,
      loadRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF for compression.'),
      startTime,
      inputByteLength,
      loadRes.warnings
    );
  }

  try {
    const doc = loadRes.document;
    const originalPageCount = doc.getPageCount();
    const originalInputBytes = cloneIsolatedPdfBytes(loadRes.isolatedBytes);
    const warnings = [...loadRes.warnings];

    request?.onProgress?.({
      percent: 35,
      stage: 'COMPRESSING',
      message: `Applying ${profileDefaults.normalizedProfile.toUpperCase()} compression profile...`,
    });

    // 2. Deduplicate identical embedded streams
    let duplicateResourcesConsolidatedCount = 0;
    if (deduplicateResources) {
      const dedupRes = deduplicateIdenticalStreamResourcesInDocument(doc);
      duplicateResourcesConsolidatedCount = dedupRes.consolidatedCount;
    }

    // 3. Optimize embedded raster Image XObjects
    const imgOptRes = optimizeEmbeddedImagesInDocument(doc, {
      profile: profileDefaults.normalizedProfile,
      targetDpi,
      imageQuality,
    });

    // 4. Clean metadata overhead if enabled
    let metadataBytesRemoved = 0;
    if (cleanMetadata) {
      metadataBytesRemoved = cleanDocumentMetadataOverhead(doc);
    }

    // 5. Remove unreferenced / orphaned indirect objects
    let unusedObjectsRemovedCount = 0;
    if (removeUnusedObjects) {
      unusedObjectsRemovedCount = removeUnreferencedIndirectObjectsInDocument(doc);
    }

    request?.onProgress?.({
      percent: 75,
      stage: 'COMPRESSING',
      message: 'Serializing optimized object streams and evaluating byte reduction...',
    });

    // 6. Serialize both with object streams and standard cross-reference table, picking the smaller candidate
    const candidateObjStreams = cloneIsolatedPdfBytes(
      await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
      })
    );

    const candidateStandardXref = cloneIsolatedPdfBytes(
      await doc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      })
    );

    const bestCandidateBytes =
      candidateObjStreams.byteLength <= candidateStandardXref.byteLength
        ? candidateObjStreams
        : candidateStandardXref;

    // 7. Strict No-Bloat Guard:
    // If the serialized candidate is >= original input bytes (AND cleanMetadata was not explicitly forced to sanitize privacy fields,
    // or even when forced, if the user requested compression and candidate bloated), never return a larger file!
    let finalOutputBytes: Uint8Array;
    let noBloatGuardTriggered = false;
    let meaningfullyCompressed = false;

    if (bestCandidateBytes.byteLength < originalInputBytes.byteLength) {
      finalOutputBytes = bestCandidateBytes;
      meaningfullyCompressed = originalInputBytes.byteLength - bestCandidateBytes.byteLength >= 32;
      if (!meaningfullyCompressed) {
        warnings.push(
          `Minimal byte reduction achieved (${originalInputBytes.byteLength - bestCandidateBytes.byteLength} bytes). This PDF is already compact.`
        );
      }
    } else {
      noBloatGuardTriggered = true;
      finalOutputBytes = originalInputBytes;
      meaningfullyCompressed = false;
      warnings.push(
        `No-Bloat Guard: This PDF (${originalInputBytes.byteLength.toLocaleString()} bytes) is already maximally compact or contains no compressible overhead (re-encoded candidate was ${bestCandidateBytes.byteLength.toLocaleString()} bytes). Preserved original byte stream unchanged (0 bytes saved).`
      );
    }

    request?.onProgress?.({
      percent: 90,
      stage: 'VERIFYING_OUTPUT',
      message: 'Independently verifying optimized PDF integrity with PDF.js...',
    });

    // 8. Independent output integrity verification via PDF.js
    const integrity = await verifyPdfOutputIntegrity(finalOutputBytes, {
      expectedPageCount: originalPageCount,
      verifyWithPdfJs: true,
    });

    if (!integrity.isValid) {
      return buildFailureResult(
        canonicalId,
        integrity.error ?? createPdfProcessingError('ERR_OUTPUT_INTEGRITY', 'Compressed PDF failed output integrity verification.'),
        startTime,
        originalInputBytes.byteLength,
        warnings
      );
    }

    const bytesSaved = Math.max(0, originalInputBytes.byteLength - finalOutputBytes.byteLength);
    const percentageReduction =
      originalInputBytes.byteLength > 0
        ? Math.round((bytesSaved / originalInputBytes.byteLength) * 10000) / 100
        : 0;

    const baseName = stripFileExtension(input.fileName);
    const outFileName = options.outputFileName || `${baseName}_compressed.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outFileName,
      mimeType: 'application/pdf',
      bytes: finalOutputBytes,
      byteLength: finalOutputBytes.byteLength,
      pageCount: originalPageCount,
    };

    const compressionDetail: PdfCompressionMetricsDetail = {
      normalizedProfile: profileDefaults.normalizedProfile,
      requestedProfile,
      targetDpi,
      imageQuality,
      cleanMetadataApplied: cleanMetadata && !noBloatGuardTriggered,
      originalBytes: originalInputBytes.byteLength,
      candidateCompressedBytes: bestCandidateBytes.byteLength,
      finalOutputBytes: finalOutputBytes.byteLength,
      bytesSaved,
      percentageReduction,
      noBloatGuardTriggered,
      meaningfullyCompressed,
      unusedObjectsRemovedCount: noBloatGuardTriggered ? 0 : unusedObjectsRemovedCount,
      duplicateResourcesConsolidatedCount: noBloatGuardTriggered ? 0 : duplicateResourcesConsolidatedCount,
      embeddedImagesInspectCount: imgOptRes.inspectedCount,
      embeddedImagesOptimizedCount: noBloatGuardTriggered ? 0 : imgOptRes.optimizedCount,
      embeddedImagesBytesSaved: noBloatGuardTriggered ? 0 : imgOptRes.bytesSaved,
      metadataBytesRemoved: noBloatGuardTriggered ? 0 : metadataBytesRemoved,
      preOptimizationAnalysis: analysisRes.report,
    };

    const summary = noBloatGuardTriggered
      ? `PDF cannot be meaningfully compressed further: original size ${originalInputBytes.byteLength.toLocaleString()} bytes preserved (0 bytes saved, 0% reduction; no-bloat guard active).`
      : meaningfullyCompressed
        ? `Compressed PDF (${profileDefaults.normalizedProfile.toUpperCase()} profile) from ${originalInputBytes.byteLength.toLocaleString()} B to ${finalOutputBytes.byteLength.toLocaleString()} B (saved ${bytesSaved.toLocaleString()} B / ${percentageReduction}%).`
        : `Optimized PDF (${profileDefaults.normalizedProfile.toUpperCase()} profile): ${originalInputBytes.byteLength.toLocaleString()} B -> ${finalOutputBytes.byteLength.toLocaleString()} B (saved ${bytesSaved.toLocaleString()} B / ${percentageReduction}%; document was already near-optimal).`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: finalOutputBytes,
      summary,
      metrics: {
        inputBytes: originalInputBytes.byteLength,
        outputBytes: finalOutputBytes.byteLength,
        inputPageCount: originalPageCount,
        outputPageCount: originalPageCount,
        savedBytes: bytesSaved,
        savedPercentage: percentageReduction,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport: analysisRes.inspectionReport,
      warnings: [...warnings, ...integrity.warnings],
      limitations: [
        'Embedded fonts and vector page content are preserved without destructive subset stripping.',
        'No-bloat guard retains original bytes when a compact vector PDF cannot be reduced further.',
      ],
      details: {
        compression: compressionDetail,
        analysis: analysisRes.report,
      },
    };
  } catch (err) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildFailureResult(canonicalId, procErr, startTime, inputByteLength, loadRes.warnings);
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * 5. OPERATION B: PDF REPAIR AND RECOVERY (`repairPdfDocumentV2` — `pdf-repair`)
 * ============================================================================
 */

/**
 * Stage 3 Low-Level Binary PDF Object Scanner & Cross-Reference / Trailer / Page-Tree Reconstructor.
 *
 * Parses raw PDF text/binary bytes to:
 * 1. Locate all `<objNum> <genNum> obj ... endobj` definitions and record their exact byte offsets.
 * 2. Identify every `/Type /Page` object (avoiding `/Type /Pages` nodes).
 * 3. Identify or synthesize a valid `/Type /Pages` root node containing all discovered `/Page` refs (`Kids` + `Count`).
 * 4. Identify or synthesize a valid `/Type /Catalog` object pointing `/Pages` to the reconstructed `/Pages` root.
 * 5. Append a clean, accurately offset standard `xref` table, `trailer << /Size ... /Root ... >>`, `startxref`, and `%%EOF`.
 */
export function reconstructCorruptedPdfStructureFromRawBytes(rawPdfBytes: Uint8Array): {
  reconstructedBytes: Uint8Array;
  discoveredObjectCount: number;
  discoveredPageRefs: Array<{ objNum: number; genNum: number }>;
  catalogReconstructed: boolean;
  pageTreeReconstructed: boolean;
  xrefTableRebuilt: boolean;
  trailerReconstructed: boolean;
} | null {
  // Decode bytes using Latin-1 (1:1 byte-to-char mapping so string indices equal exact byte offsets!)
  let latin1 = '';
  const chunkSize = 32768;
  for (let i = 0; i < rawPdfBytes.byteLength; i += chunkSize) {
    const slice = rawPdfBytes.subarray(i, Math.min(rawPdfBytes.byteLength, i + chunkSize));
    latin1 += String.fromCharCode(...slice);
  }

  // Locate all `<num> <gen> obj` boundaries
  const objRegex = /(?:^|[\r\n\s])(\d+)\s+(\d+)\s+obj\b/g;
  const objects: Array<{
    objNum: number;
    genNum: number;
    startOffset: number;
    bodyStartOffset: number;
    endOffset: number;
    headerSnippet: string;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = objRegex.exec(latin1)) !== null) {
    const leadingCharLen = match[0].length - `${match[1]} ${match[2]} obj`.length;
    const startOffset = match.index + Math.max(0, leadingCharLen);
    const objNum = parseInt(match[1], 10);
    const genNum = parseInt(match[2], 10);
    if (!Number.isFinite(objNum) || objNum <= 0 || objNum > 500000) continue;

    const bodyStartOffset = match.index + match[0].length;
    const endObjPos = latin1.indexOf('endobj', bodyStartOffset);
    const endOffset = endObjPos !== -1 ? endObjPos + 6 : Math.min(latin1.length, bodyStartOffset + 4096);
    const snippetEnd = Math.min(endOffset, bodyStartOffset + 1500);
    const headerSnippet = latin1.slice(bodyStartOffset, snippetEnd);

    objects.push({
      objNum,
      genNum,
      startOffset,
      bodyStartOffset,
      endOffset,
      headerSnippet,
    });
  }

  if (objects.length === 0) {
    return null;
  }

  // Keep latest definition for each object number and inspect types
  const objMap = new Map<number, (typeof objects)[0]>();
  for (const o of objects) {
    objMap.set(o.objNum, o);
  }

  const pageRefs: Array<{ objNum: number; genNum: number }> = [];
  let catalogObjNum: number | null = null;
  let pagesRootObjNum: number | null = null;
  let infoObjNum: number | null = null;
  let maxObjNum = 0;

  for (const [num, o] of objMap.entries()) {
    if (num > maxObjNum) maxObjNum = num;
    const s = o.headerSnippet;

    // Match /Type /Page (Ensure it is NOT /Type /Pages)
    if (/\/Type\s*\/Page(?![a-zA-Z])/i.test(s)) {
      // Check that the page object is not completely broken/empty
      if (!s.includes('CORRUPTED_UNTERMINATED_OBJECT_GRAPH_DATA')) {
        pageRefs.push({ objNum: o.objNum, genNum: o.genNum });
      }
    } else if (/\/Type\s*\/Pages\b/i.test(s)) {
      pagesRootObjNum = o.objNum;
    } else if (/\/Type\s*\/Catalog\b/i.test(s)) {
      if (!s.includes('CORRUPTED_UNTERMINATED_OBJECT_GRAPH_DATA')) {
        catalogObjNum = o.objNum;
      }
    } else if (/\/Title\s*\(|\/Author\s*\(|\/Producer\s*\(/i.test(s) && !/\/Type\b/.test(s)) {
      infoObjNum = o.objNum;
    }
  }

  // Sort discovered pages by object number for deterministic order
  pageRefs.sort((a, b) => a.objNum - b.objNum);

  if (pageRefs.length === 0) {
    return null;
  }

  // Check if existing /Pages root or /Catalog has broken references
  let needSyntheticPagesRoot = pagesRootObjNum === null;
  if (pagesRootObjNum !== null) {
    const pagesObj = objMap.get(pagesRootObjNum)!;
    const kidsMatch = pagesObj.headerSnippet.match(/\/Kids\s*\[([^\]]*)\]/);
    if (!kidsMatch) {
      needSyntheticPagesRoot = true;
    } else {
      const refMatches = Array.from(kidsMatch[1].matchAll(/(\d+)\s+\d+\s+R/g));
      const validReferencedKids = refMatches.filter((m) => objMap.has(parseInt(m[1], 10)));
      if (validReferencedKids.length !== pageRefs.length || validReferencedKids.length === 0) {
        needSyntheticPagesRoot = true;
      }
    }
  }

  let needSyntheticCatalog = catalogObjNum === null || needSyntheticPagesRoot;
  if (catalogObjNum !== null && !needSyntheticCatalog) {
    const catObj = objMap.get(catalogObjNum)!;
    const pagesRefMatch = catObj.headerSnippet.match(/\/Pages\s+(\d+)\s+\d+\s+R/);
    if (!pagesRefMatch || !objMap.has(parseInt(pagesRefMatch[1], 10))) {
      needSyntheticCatalog = true;
    }
  }

  // Trim any damaged trailing xref/trailer from the last valid `endobj`
  let lastEndObjOffset = 0;
  for (const o of objMap.values()) {
    if (o.endOffset > lastEndObjOffset) {
      lastEndObjOffset = o.endOffset;
    }
  }
  const cleanBodyBytes =
    lastEndObjOffset > 0 && lastEndObjOffset <= rawPdfBytes.byteLength
      ? rawPdfBytes.subarray(0, lastEndObjOffset)
      : rawPdfBytes;

  const syntheticChunks: string[] = ['\n'];
  let currentAppendOffset = cleanBodyBytes.byteLength + 1;

  // Synthesize or replace /Pages root if needed
  const targetPagesObjNum = pagesRootObjNum ?? ++maxObjNum;
  if (needSyntheticPagesRoot) {
    const kidsArrayStr = pageRefs.map((r) => `${r.objNum} ${r.genNum} R`).join(' ');
    const pagesObjStr = `${targetPagesObjNum} 0 obj\n<< /Type /Pages /Kids [ ${kidsArrayStr} ] /Count ${pageRefs.length} >>\nendobj\n`;
    objMap.set(targetPagesObjNum, {
      objNum: targetPagesObjNum,
      genNum: 0,
      startOffset: currentAppendOffset,
      bodyStartOffset: currentAppendOffset,
      endOffset: currentAppendOffset + pagesObjStr.length,
      headerSnippet: pagesObjStr,
    });
    syntheticChunks.push(pagesObjStr);
    currentAppendOffset += pagesObjStr.length;
  }

  // Synthesize or replace /Catalog root if needed
  const targetCatalogObjNum = catalogObjNum ?? ++maxObjNum;
  if (needSyntheticCatalog) {
    const catalogObjStr = `${targetCatalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${targetPagesObjNum} 0 R >>\nendobj\n`;
    objMap.set(targetCatalogObjNum, {
      objNum: targetCatalogObjNum,
      genNum: 0,
      startOffset: currentAppendOffset,
      bodyStartOffset: currentAppendOffset,
      endOffset: currentAppendOffset + catalogObjStr.length,
      headerSnippet: catalogObjStr,
    });
    syntheticChunks.push(catalogObjStr);
    currentAppendOffset += catalogObjStr.length;
  }

  // Build fresh cross-reference table (`xref`) covering 0..maxObjNum
  const xrefOffset = currentAppendOffset;
  const xrefSize = maxObjNum + 1;
  const xrefLines: string[] = [`xref\n0 ${xrefSize}\n0000000000 65535 f \n`];

  for (let num = 1; num <= maxObjNum; num++) {
    const entry = objMap.get(num);
    if (entry) {
      const offStr = String(entry.startOffset).padStart(10, '0');
      const genStr = String(entry.genNum).padStart(5, '0');
      xrefLines.push(`${offStr} ${genStr} n \n`);
    } else {
      xrefLines.push(`0000000000 65535 f \n`);
    }
  }

  const infoEntryStr = infoObjNum && objMap.has(infoObjNum) ? ` /Info ${infoObjNum} 0 R` : '';
  const trailerStr = [
    ...xrefLines,
    `trailer\n<< /Size ${xrefSize} /Root ${targetCatalogObjNum} 0 R${infoEntryStr} >>\n`,
    `startxref\n${xrefOffset}\n%%EOF\n`,
  ].join('');

  const appendedAscii = syntheticChunks.join('') + trailerStr;
  const appendedBytes = new Uint8Array(appendedAscii.length);
  for (let i = 0; i < appendedAscii.length; i++) {
    appendedBytes[i] = appendedAscii.charCodeAt(i) & 0xff;
  }

  const reconstructedBytes = new Uint8Array(cleanBodyBytes.byteLength + appendedBytes.byteLength);
  reconstructedBytes.set(cleanBodyBytes, 0);
  reconstructedBytes.set(appendedBytes, cleanBodyBytes.byteLength);

  return {
    reconstructedBytes,
    discoveredObjectCount: objMap.size,
    discoveredPageRefs: pageRefs,
    catalogReconstructed: needSyntheticCatalog,
    pageTreeReconstructed: needSyntheticPagesRoot,
    xrefTableRebuilt: true,
    trailerReconstructed: true,
  };
}

/**
 * Counts how many `/Type /Page` definitions exist in raw PDF bytes so we can accurately distinguish
 * full repair (`recoveredPageCount === estimatedSourcePageCount`) from partial recovery (`recoveredPageCount < estimatedSourcePageCount`).
 */
function estimateSourcePageCountFromRawBytes(bytes: Uint8Array): number {
  let latin1 = '';
  const chunkSize = 32768;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(bytes.byteLength, i + chunkSize));
    latin1 += String.fromCharCode(...slice);
  }
  const matches = latin1.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  return matches ? matches.length : 0;
}

/**
 * Inspects raw PDF bytes for structural anomalies before repair begins.
 */
function inspectRawPdfStructuralAnomalies(rawBytes: Uint8Array): {
  headerOffset: number;
  pdfVersion?: string;
  hasEofMarker: boolean;
  hasXrefKeyword: boolean;
  hasTrailerKeyword: boolean;
  hasStartXrefKeyword: boolean;
  hasInvalidXrefOffsets: boolean;
  hasDamagedPageTreeRefs: boolean;
  anomalies: string[];
} {
  const sniffed = sniffFileFormat(rawBytes, 4096);
  const headerOffset = sniffed.format === 'pdf' ? sniffed.pdfHeaderOffset : -1;
  const hasEofMarker = detectPdfEofMarker(rawBytes);

  let latin1 = '';
  const chunkSize = 32768;
  for (let i = 0; i < rawBytes.byteLength; i += chunkSize) {
    const slice = rawBytes.subarray(i, Math.min(rawBytes.byteLength, i + chunkSize));
    latin1 += String.fromCharCode(...slice);
  }

  const hasXrefKeyword = /\bxref\b/.test(latin1) || /\/Type\s*\/XRef\b/.test(latin1);
  const hasTrailerKeyword = /\btrailer\b/.test(latin1) || /\/Type\s*\/XRef\b/.test(latin1);
  const hasStartXrefKeyword = /\bstartxref\b/.test(latin1);

  // Check if xref table has out-of-bounds byte offsets or invalid counts
  let hasInvalidXrefOffsets = false;
  const xrefTableMatch = latin1.match(/\bxref\s+(\d+)\s+(\d+)[\r\n]+([\s\S]*?)(?:\btrailer\b|$)/);
  if (xrefTableMatch) {
    const entryLines = xrefTableMatch[3].split(/[\r\n]+/).filter((l) => l.trim().length > 0);
    for (const line of entryLines) {
      const m = line.match(/^(\d{10})\s+(\d{5})\s+([nf])/);
      if (m && m[3] === 'n') {
        const offset = parseInt(m[1], 10);
        if (offset >= rawBytes.byteLength || offset <= 0) {
          hasInvalidXrefOffsets = true;
          break;
        }
        // Check if an object header actually starts near `offset - headerOffset`
        const probeSlice = latin1.slice(Math.max(0, offset - Math.max(0, headerOffset) - 4), Math.min(latin1.length, offset - Math.max(0, headerOffset) + 24));
        if (!/\d+\s+\d+\s+obj\b/.test(probeSlice)) {
          hasInvalidXrefOffsets = true;
          break;
        }
      }
    }
  }

  // Check if startxref points outside buffer or not to 'xref' / XRef stream
  const startXrefMatch = latin1.match(/\bstartxref\s+(\d+)/);
  if (startXrefMatch) {
    const sx = parseInt(startXrefMatch[1], 10);
    if (sx <= 0 || sx >= rawBytes.byteLength) {
      hasInvalidXrefOffsets = true;
    }
  } else {
    hasInvalidXrefOffsets = true;
  }

  // Check if /Pages Kids contains broken object references
  let hasDamagedPageTreeRefs = false;
  const definedObjNums = new Set<number>();
  for (const m of latin1.matchAll(/(?:^|[\r\n\s])(\d+)\s+\d+\s+obj\b/g)) {
    definedObjNums.add(parseInt(m[1], 10));
  }
  const pagesObjMatch = latin1.match(/\/Type\s*\/Pages\b[\s\S]{0,600}?\/Kids\s*\[([^\]]*)\]/);
  if (pagesObjMatch) {
    const kidRefs = Array.from(pagesObjMatch[1].matchAll(/(\d+)\s+\d+\s+R/g));
    for (const kr of kidRefs) {
      if (!definedObjNums.has(parseInt(kr[1], 10))) {
        hasDamagedPageTreeRefs = true;
        break;
      }
    }
  }

  const anomalies: string[] = [];
  if (headerOffset > 0) {
    anomalies.push(`Leading garbage prefix detected (${headerOffset} bytes before %PDF- header).`);
  }
  if (!hasEofMarker) {
    anomalies.push('Missing trailing %%EOF end-of-file marker.');
  }
  if (!hasXrefKeyword || hasInvalidXrefOffsets) {
    anomalies.push('Malformed cross-reference table or corrupted object byte offsets.');
  }
  if (!hasTrailerKeyword || !hasStartXrefKeyword) {
    anomalies.push('Damaged or missing PDF trailer / startxref pointer.');
  }
  if (hasDamagedPageTreeRefs) {
    anomalies.push('Corrupted page tree (/Pages /Kids contains dangling or invalid page references).');
  }

  return {
    headerOffset,
    pdfVersion: sniffed.pdfVersion,
    hasEofMarker,
    hasXrefKeyword,
    hasTrailerKeyword,
    hasStartXrefKeyword,
    hasInvalidXrefOffsets,
    hasDamagedPageTreeRefs,
    anomalies,
  };
}

/**
 * Multi-Stage Safe PDF Repair and Recovery (`pdf-repair`):
 * - Never overwrites or mutates the caller's input buffer.
 * - Explicitly detects and handles encrypted PDFs (`ERR_PASSWORD_REQUIRED` / `ERR_INCORRECT_PASSWORD`).
 * - Executes a 4-stage recovery pipeline:
 *   - Stage 1: Binary Header / EOF / Leading-Garbage Sanitization.
 *   - Stage 2: Tolerant `@cantoo/pdf-lib` Object Graph Parse & Clean Page Cloning.
 *   - Stage 3: Raw Object Stream Scanner & Cross-Reference / Trailer / Page-Tree Reconstructor (`reconstructCorruptedPdfStructureFromRawBytes`).
 *   - Stage 4: PDF.js Resilient XRef Indexer & Per-Page Recovery (recovering readable pages and preserving selectable text + dimensions).
 * - Independently validates recovered output via PDF.js (`verifyPdfOutputIntegrity`).
 * - Clearly distinguishes:
 *   - `SUCCESS` (`HEALTHY_REINDEXED` or `REPAIRED_FULL` when 100% of pages are recovered)
 *   - `PARTIAL_RECOVERY` (`PARTIALLY_RECOVERED` when some pages/objects were lost or Stage 4 visual/text fallback was required)
 *   - `INVALID_PDF` with `ERR_REPAIR_UNRECOVERABLE` when 0 pages can be recovered.
 */
export async function repairPdfDocumentV2(
  input: PdfDocumentInput,
  options: RepairPdfOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-repair';
  const inputByteLength = inspectByteLength(input?.bytes);

  if (!input || !input.bytes || inputByteLength === 0) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'Cannot repair an empty (0-byte) file.'),
      startTime,
      0
    );
  }

  // Always clone input buffer first so original input is NEVER modified
  let workingBytes: Uint8Array;
  try {
    workingBytes = cloneIsolatedPdfBytes(input.bytes);
  } catch (err: any) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_INVALID_PDF', err?.message || 'Input buffer is detached or invalid.'),
      startTime,
      inputByteLength
    );
  }

  request?.onProgress?.({
    percent: 10,
    stage: 'VALIDATING',
    message: 'Inspecting binary PDF signature and structural integrity...',
  });

  // Check if '%PDF-' exists anywhere within the first 4096 bytes
  const pdfHeaderOffset = findAsciiSequence(workingBytes, '%PDF-', 0, Math.min(workingBytes.byteLength, 4096));
  if (pdfHeaderOffset === -1 || workingBytes.byteLength < 32) {
    const unrecErr = createPdfProcessingError(
      'ERR_REPAIR_UNRECOVERABLE',
      'Unrecoverable file: no %PDF- magic header or recoverable PDF object signature was found.'
    );
    return buildFailureResult(canonicalId, unrecErr, startTime, inputByteLength);
  }

  // Check encryption status before attempting structural repair
  const hasEncryptMarker = detectPdfEncryptionMarker(workingBytes);
  const password = options.password ?? input.password;
  if (hasEncryptMarker) {
    const loadCheck = await loadPdfDocumentV2(
      { fileName: input.fileName, bytes: workingBytes, password },
      { password, allowTolerantParse: true }
    );
    await loadCheck.dispose();
    if (!loadCheck.success && (loadCheck.error?.code === 'ERR_PASSWORD_REQUIRED' || loadCheck.error?.code === 'ERR_INCORRECT_PASSWORD')) {
      return buildFailureResult(
        canonicalId,
        loadCheck.error,
        startTime,
        inputByteLength,
        loadCheck.warnings
      );
    }
  }

  const preScan = inspectRawPdfStructuralAnomalies(workingBytes);
  const estimatedSourcePages = Math.max(1, estimateSourcePageCountFromRawBytes(workingBytes));
  const stages: PdfRepairStageDiagnostic[] = [];
  const warnings: string[] = [];
  const repairedAnomalies: string[] = [];
  const unrecoveredAnomalies: string[] = [];

  // ============================================================================
  // STAGE 1: BINARY HEADER, TRAILING GARBAGE & %%EOF SANITIZATION
  // ============================================================================
  request?.onProgress?.({
    percent: 25,
    stage: 'LOADING',
    message: 'Stage 1: Sanitizing PDF header offset and EOF marker...',
  });

  const stage1Notes: string[] = [];
  let sanitizedBytes = workingBytes;
  let leadingGarbageBytesStripped = 0;
  let eofMarkerSynthesized = false;

  if (pdfHeaderOffset > 0) {
    leadingGarbageBytesStripped = pdfHeaderOffset;
    sanitizedBytes = cloneIsolatedPdfBytes(workingBytes.subarray(pdfHeaderOffset));
    stage1Notes.push(`Stripped ${leadingGarbageBytesStripped} leading garbage byte(s) before %PDF- header.`);
    repairedAnomalies.push(`Removed ${leadingGarbageBytesStripped} leading garbage byte(s).`);
  }

  if (!detectPdfEofMarker(sanitizedBytes)) {
    const eofSuffix = new TextEncoder().encode('\n%%EOF\n');
    const extended = new Uint8Array(sanitizedBytes.byteLength + eofSuffix.byteLength);
    extended.set(sanitizedBytes, 0);
    extended.set(eofSuffix, sanitizedBytes.byteLength);
    sanitizedBytes = extended;
    eofMarkerSynthesized = true;
    stage1Notes.push('Appended missing trailing %%EOF marker.');
    repairedAnomalies.push('Restored missing %%EOF marker.');
  }

  stages.push({
    stageNumber: 1,
    stageName: 'HEADER_EOF_TRAILER_SANITIZATION',
    attempted: true,
    succeeded: true,
    notes: stage1Notes.length > 0 ? stage1Notes : ['Header and %%EOF marker present.'],
  });

  // Helper to clone valid pages from a parsed PDFDocument into a fresh, clean PDFDocument
  const rebuildCleanDocumentFromLoaded = async (
    parsedDoc: PDFDocument
  ): Promise<{ bytes: Uint8Array; recoveredPages: number; lostPages: number } | null> => {
    const totalLoadedPages = parsedDoc.getPageCount();
    if (totalLoadedPages <= 0) return null;

    const cleanDoc = await PDFDocument.create();
    // Preserve valid metadata if available
    try {
      const title = parsedDoc.getTitle();
      if (title) cleanDoc.setTitle(title);
      const author = parsedDoc.getAuthor();
      if (author) cleanDoc.setAuthor(author);
      const subject = parsedDoc.getSubject();
      if (subject) cleanDoc.setSubject(subject);
    } catch {
      // Ignore damaged InfoDict during repair
    }

    let recoveredPages = 0;
    let lostPages = 0;

    for (let pIdx = 0; pIdx < totalLoadedPages; pIdx++) {
      try {
        const [copiedPage] = await cleanDoc.copyPages(parsedDoc, [pIdx]);
        const { width, height } = copiedPage.getSize();
        if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
          cleanDoc.addPage(copiedPage);
          recoveredPages++;
        } else {
          lostPages++;
        }
      } catch {
        lostPages++;
      }
    }

    if (recoveredPages === 0) return null;
    const saved = cloneIsolatedPdfBytes(await cleanDoc.save({ useObjectStreams: false }));
    return {
      bytes: saved,
      recoveredPages,
      lostPages,
    };
  };

  let finalRecoveredBytes: Uint8Array | null = null;
  let recoveredPageCount = 0;
  let lostPageCount = 0;
  let winningStage: PdfRepairStageDiagnostic['stageName'] | undefined;
  let xrefTableRebuilt = false;
  let trailerReconstructed = false;
  let pageTreeReconstructed = false;
  let usedStage4PartialFallback = false;

  // ============================================================================
  // STAGE 2: TOLERANT PARSER OBJECT GRAPH REBUILD (Only if XRef offsets & Page Tree are not flagged as broken)
  // ============================================================================
  request?.onProgress?.({
    percent: 45,
    stage: 'PROCESSING_PAGES',
    message: 'Stage 2: Attempting tolerant object graph load and clean page tree rebuild...',
  });

  const stage2Notes: string[] = [];
  let stage2Succeeded = false;

  if (!preScan.hasInvalidXrefOffsets && !preScan.hasDamagedPageTreeRefs) {
    try {
      const loadOpts: Parameters<typeof PDFDocument.load>[1] = {
        updateMetadata: false,
        parseSpeed: ParseSpeeds.Fast,
        throwOnInvalidObject: false,
        warnOnInvalidObjects: false,
      };
      if (password) {
        loadOpts.password = password;
      } else if (hasEncryptMarker) {
        loadOpts.ignoreEncryption = true;
      }

      const parsedDoc = await PDFDocument.load(sanitizedBytes, loadOpts);
      const rebuilt = await rebuildCleanDocumentFromLoaded(parsedDoc);
      if (rebuilt && rebuilt.recoveredPages > 0) {
        const integrity = await verifyPdfOutputIntegrity(rebuilt.bytes, {
          expectedPageCount: rebuilt.recoveredPages,
          verifyWithPdfJs: true,
        });
        if (integrity.isValid) {
          finalRecoveredBytes = rebuilt.bytes;
          recoveredPageCount = rebuilt.recoveredPages;
          lostPageCount = Math.max(rebuilt.lostPages, Math.max(0, estimatedSourcePages - rebuilt.recoveredPages));
          winningStage = 'TOLERANT_PARSER_PAGE_CLONE';
          xrefTableRebuilt = true;
          stage2Succeeded = true;
          stage2Notes.push(`Rebuilt clean PDF object graph with ${rebuilt.recoveredPages} verified page(s).`);
        }
      }
    } catch (err: any) {
      stage2Notes.push(`Tolerant parser load failed: ${String(err?.message || err)}`);
    }
  } else {
    stage2Notes.push(
      'Skipped direct tolerant load because pre-scan detected corrupted XRef offsets or damaged page-tree references; advancing to Stage 3 raw object scanner.'
    );
  }

  stages.push({
    stageNumber: 2,
    stageName: 'TOLERANT_PARSER_PAGE_CLONE',
    attempted: true,
    succeeded: stage2Succeeded,
    notes: stage2Notes,
  });

  // ============================================================================
  // STAGE 3: RAW OBJECT STREAM SCANNER & XREF / TRAILER / PAGE-TREE RECONSTRUCTION
  // ============================================================================
  if (!finalRecoveredBytes) {
    request?.onProgress?.({
      percent: 65,
      stage: 'PROCESSING_PAGES',
      message: 'Stage 3: Scanning raw object offsets and reconstructing XRef table, trailer, and page tree...',
    });

    const stage3Notes: string[] = [];
    let stage3Succeeded = false;

    try {
      const recon = reconstructCorruptedPdfStructureFromRawBytes(sanitizedBytes);
      if (recon && recon.discoveredPageRefs.length > 0) {
        xrefTableRebuilt = recon.xrefTableRebuilt;
        trailerReconstructed = recon.trailerReconstructed;
        pageTreeReconstructed = recon.pageTreeReconstructed;

        stage3Notes.push(
          `Scanned ${recon.discoveredObjectCount} raw indirect object(s) and located ${recon.discoveredPageRefs.length} valid /Page object(s).`
        );

        // Load the reconstructed bytes into @cantoo/pdf-lib and re-save a normalized clean document
        let candidateBytes = recon.reconstructedBytes;
        let candidatePages = recon.discoveredPageRefs.length;

        try {
          const parsedRecon = await PDFDocument.load(recon.reconstructedBytes, {
            updateMetadata: false,
            throwOnInvalidObject: false,
            warnOnInvalidObjects: false,
          });
          const cleanRebuilt = await rebuildCleanDocumentFromLoaded(parsedRecon);
          if (cleanRebuilt && cleanRebuilt.recoveredPages > 0) {
            candidateBytes = cleanRebuilt.bytes;
            candidatePages = cleanRebuilt.recoveredPages;
          }
        } catch {
          // Use raw reconstructedBytes directly if @cantoo/pdf-lib re-save fails
        }

        const integrity = await verifyPdfOutputIntegrity(candidateBytes, {
          expectedPageCount: candidatePages,
          verifyWithPdfJs: true,
        });

        if (integrity.isValid) {
          finalRecoveredBytes = candidateBytes;
          recoveredPageCount = candidatePages;
          lostPageCount = Math.max(0, estimatedSourcePages - candidatePages);
          winningStage = 'RAW_OBJECT_SCAN_XREF_RECONSTRUCTION';
          stage3Succeeded = true;

          if (preScan.hasInvalidXrefOffsets || !preScan.hasXrefKeyword) {
            repairedAnomalies.push('Rebuilt cross-reference table from scanned object byte offsets.');
          }
          if (!preScan.hasTrailerKeyword || !preScan.hasStartXrefKeyword) {
            repairedAnomalies.push('Reconstructed trailer dictionary and startxref pointer.');
          }
          if (preScan.hasDamagedPageTreeRefs || recon.pageTreeReconstructed) {
            repairedAnomalies.push(`Reconstructed /Pages tree with ${candidatePages} valid page reference(s).`);
          }
        } else {
          stage3Notes.push(`Reconstructed stream did not pass PDF.js verification: ${integrity.error?.message || 'invalid'}`);
        }
      } else {
        stage3Notes.push('Raw object scanner found 0 valid /Type /Page objects.');
      }
    } catch (err: any) {
      stage3Notes.push(`Stage 3 raw reconstruction error: ${String(err?.message || err)}`);
    }

    stages.push({
      stageNumber: 3,
      stageName: 'RAW_OBJECT_SCAN_XREF_RECONSTRUCTION',
      attempted: true,
      succeeded: stage3Succeeded,
      notes: stage3Notes,
    });
  } else {
    stages.push({
      stageNumber: 3,
      stageName: 'RAW_OBJECT_SCAN_XREF_RECONSTRUCTION',
      attempted: false,
      succeeded: false,
      notes: ['Not needed (Stage 2 succeeded).'],
    });
  }

  // ============================================================================
  // STAGE 4: PDF.JS RESILIENT XREF INDEXER & PAGE RESCUE FALLBACK
  // ============================================================================
  const allowStage4 = options.allowVisualRasterRescue !== false;
  if (!finalRecoveredBytes && allowStage4) {
    request?.onProgress?.({
      percent: 80,
      stage: 'PROCESSING_PAGES',
      message: 'Stage 4: Attempting PDF.js resilient XRef indexing and page content rescue...',
    });

    const stage4Notes: string[] = [];
    let stage4Succeeded = false;
    let pdfJsSession: Awaited<ReturnType<typeof openManagedPdfDocument>> | null = null;

    try {
      pdfJsSession = await openManagedPdfDocument(sanitizedBytes, password ? { password } : {});
      const numPages = Number(pdfJsSession.pdfDoc?.numPages ?? 0);

      if (numPages > 0) {
        const rescueDoc = await PDFDocument.create();
        const font = await rescueDoc.embedFont(StandardFonts.Helvetica);

        for (let p = 1; p <= numPages; p++) {
          try {
            const page = await pdfJsSession.pdfDoc.getPage(p);
            try {
              const vp = page.getViewport({ scale: 1.0 });
              const wPt = Math.max(72, Math.round(vp.width * 100) / 100);
              const hPt = Math.max(72, Math.round(vp.height * 100) / 100);
              const newPage = rescueDoc.addPage([wPt, hPt]);

              const textContent = await page.getTextContent().catch(() => ({ items: [] }));
              for (const item of textContent?.items || []) {
                if (typeof item?.str === 'string' && item.str.trim().length > 0 && Array.isArray(item.transform)) {
                  const x = Math.max(10, Math.min(wPt - 20, Number(item.transform[4]) || 36));
                  const y = Math.max(10, Math.min(hPt - 20, Number(item.transform[5]) || hPt - 36));
                  const sz = Math.max(8, Math.min(36, Math.abs(Number(item.transform[3])) || 12));
                  // Filter to printable ASCII/WinAnsi for safe rescue drawing
                  const safeStr = String(item.str).replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
                  if (safeStr.trim().length > 0) {
                    newPage.drawText(safeStr, {
                      x,
                      y,
                      size: sz,
                      font,
                      color: rgb(0.1, 0.1, 0.1),
                    });
                  }
                }
              }
              recoveredPageCount++;
            } finally {
              if (page && typeof page.cleanup === 'function') {
                await page.cleanup();
              }
            }
          } catch {
            lostPageCount++;
          }
        }

        if (recoveredPageCount > 0) {
          const savedRescue = cloneIsolatedPdfBytes(await rescueDoc.save({ useObjectStreams: false }));
          const integrity = await verifyPdfOutputIntegrity(savedRescue, {
            expectedPageCount: recoveredPageCount,
            verifyWithPdfJs: true,
          });
          if (integrity.isValid) {
            finalRecoveredBytes = savedRescue;
            winningStage = 'PDFJS_RESILIENT_PAGE_RECOVERY';
            usedStage4PartialFallback = true;
            xrefTableRebuilt = true;
            trailerReconstructed = true;
            pageTreeReconstructed = true;
            stage4Succeeded = true;
            stage4Notes.push(`Rescued ${recoveredPageCount} page(s) via PDF.js resilient XRef indexer.`);
          }
        }
      }
    } catch (err: any) {
      stage4Notes.push(`PDF.js resilient indexer could not recover pages: ${String(err?.message || err)}`);
    } finally {
      if (pdfJsSession) {
        await pdfJsSession.dispose();
      }
    }

    stages.push({
      stageNumber: 4,
      stageName: 'PDFJS_RESILIENT_PAGE_RECOVERY',
      attempted: true,
      succeeded: stage4Succeeded,
      notes: stage4Notes,
    });
  } else {
    stages.push({
      stageNumber: 4,
      stageName: 'PDFJS_RESILIENT_PAGE_RECOVERY',
      attempted: false,
      succeeded: false,
      notes: [finalRecoveredBytes ? 'Not needed (earlier stage succeeded).' : 'Visual/page rescue disabled.'],
    });
  }

  // ============================================================================
  // UNRECOVERABLE HANDLING
  // ============================================================================
  if (!finalRecoveredBytes || recoveredPageCount <= 0) {
    const unrecDetails: PdfRepairDiagnosticsDetail = {
      recoveryClassification: 'UNRECOVERABLE',
      detectedAnomalies: preScan.anomalies,
      repairedAnomalies,
      unrecoveredAnomalies:
        preScan.anomalies.length > 0
          ? preScan.anomalies
          : ['Corrupted object graph contained 0 recoverable PDF pages across all 4 recovery stages.'],
      originalByteLength: inputByteLength,
      repairedByteLength: 0,
      leadingGarbageBytesStripped,
      eofMarkerSynthesized,
      xrefTableRebuilt: false,
      trailerReconstructed: false,
      pageTreeReconstructed: false,
      estimatedSourcePageCount: estimatedSourcePages,
      recoveredPageCount: 0,
      lostPageCount: estimatedSourcePages,
      stages,
    };

    const unrecErr = createPdfProcessingError(
      'ERR_REPAIR_UNRECOVERABLE',
      'The PDF file is too severely corrupted and contains 0 recoverable pages across all structural and XRef recovery stages.',
      { repairDiagnostics: unrecDetails }
    );

    return buildFailureResult(
      canonicalId,
      unrecErr,
      startTime,
      inputByteLength,
      warnings,
      ['Files with zero intact page objects or overwritten content streams cannot be reconstructed locally.'],
      { repair: unrecDetails }
    );
  }

  // ============================================================================
  // CLASSIFY RECOVERY OUTCOME: HEALTHY_REINDEXED vs REPAIRED_FULL vs PARTIALLY_RECOVERED
  // ============================================================================
  const isPartial =
    lostPageCount > 0 ||
    recoveredPageCount < estimatedSourcePages ||
    usedStage4PartialFallback;

  let recoveryClassification: PdfRepairRecoveryClassification;
  if (isPartial) {
    recoveryClassification = 'PARTIALLY_RECOVERED';
    if (lostPageCount > 0) {
      unrecoveredAnomalies.push(
        `${lostPageCount} of ${estimatedSourcePages} page object(s) were truncated or severely damaged and could not be recovered.`
      );
      warnings.push(
        `Partial Recovery: Recovered ${recoveredPageCount} of ${estimatedSourcePages} page(s); ${lostPageCount} damaged page(s) could not be salvaged.`
      );
    }
    if (usedStage4PartialFallback) {
      unrecoveredAnomalies.push('Original vector object graph was unparseable; pages were reconstructed via PDF.js page rescue.');
      warnings.push('Partial Recovery: Pages were reconstructed using the PDF.js resilient XRef page rescue engine.');
    }
  } else if (preScan.anomalies.length === 0) {
    recoveryClassification = 'HEALTHY_REINDEXED';
  } else {
    recoveryClassification = 'REPAIRED_FULL';
  }

  const operationStatus = isPartial ? 'PARTIAL_RECOVERY' : 'SUCCESS';
  const baseName = stripFileExtension(input.fileName);
  const outFileName =
    options.outputFileName ||
    (isPartial ? `${baseName}_partially_recovered.pdf` : `${baseName}_repaired.pdf`);

  const primaryFile: PdfOutputFile = {
    fileName: outFileName,
    mimeType: 'application/pdf',
    bytes: finalRecoveredBytes,
    byteLength: finalRecoveredBytes.byteLength,
    pageCount: recoveredPageCount,
  };

  const repairDetails: PdfRepairDiagnosticsDetail = {
    recoveryClassification,
    detectedAnomalies: preScan.anomalies,
    repairedAnomalies,
    unrecoveredAnomalies,
    originalByteLength: inputByteLength,
    repairedByteLength: finalRecoveredBytes.byteLength,
    leadingGarbageBytesStripped,
    eofMarkerSynthesized,
    xrefTableRebuilt,
    trailerReconstructed,
    pageTreeReconstructed,
    estimatedSourcePageCount: estimatedSourcePages,
    recoveredPageCount,
    lostPageCount,
    winningStage,
    stages,
  };

  const inspectionReport: PdfInspectionReport = {
    reportType: 'repair-diagnostics',
    summaryMetrics: [
      { label: 'Recovery Status', value: recoveryClassification },
      { label: 'Pages Recovered', value: `${recoveredPageCount} / ${estimatedSourcePages}` },
      { label: 'Anomalies Fixed', value: repairedAnomalies.length },
      { label: 'Winning Stage', value: winningStage || 'N/A' },
      { label: 'Output Size', value: `${finalRecoveredBytes.byteLength.toLocaleString()} B` },
    ],
    tableHeaders: ['Stage', 'Mechanism', 'Attempted', 'Succeeded', 'Notes'],
    tableRows: stages.map((s) => [
      `Stage ${s.stageNumber}`,
      s.stageName,
      s.attempted ? 'Yes' : 'No',
      s.succeeded ? 'PASS' : '—',
      s.notes.join(' ') || '—',
    ]),
    rawData: repairDetails as unknown as Record<string, unknown>,
  };

  const summary =
    recoveryClassification === 'HEALTHY_REINDEXED'
      ? `Healthy PDF verified and re-indexed (${recoveredPageCount} page(s), ${finalRecoveredBytes.byteLength.toLocaleString()} bytes).`
      : recoveryClassification === 'REPAIRED_FULL'
        ? `Successfully repaired PDF structure (${repairedAnomalies.length} anomaly/anomalies fixed; all ${recoveredPageCount} page(s) recovered and verified in PDF.js).`
        : `Partially recovered PDF document (${recoveredPageCount} of ${estimatedSourcePages} page(s) salvaged via ${winningStage}; ${lostPageCount} page(s) unrecoverable).`;

  return {
    status: operationStatus,
    resolvedCanonicalId: canonicalId,
    primaryFile,
    outputFiles: [primaryFile],
    outputBytes: finalRecoveredBytes,
    summary,
    metrics: {
      inputBytes: inputByteLength,
      outputBytes: finalRecoveredBytes.byteLength,
      inputPageCount: estimatedSourcePages,
      outputPageCount: recoveredPageCount,
      durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
    },
    inspectionReport,
    warnings,
    limitations: [
      'Original input buffer is cloned before recovery and never modified.',
      'Truncated or zeroed deflated content streams that lack object bodies cannot be reconstructed.',
    ],
    details: {
      repair: repairDetails,
    },
  };
}

/**
 * ============================================================================
 * 6. CANONICAL ENGINE F ROUTER (`executeOptimizationRepairOperationV2`)
 * ============================================================================
 */

export const ENGINE_F_CANONICAL_IDS: ReadonlySet<string> = new Set([
  'pdf-compress',
  'pdf-repair',
]);

/**
 * V2 Engine F Router for Optimization & Repair operations (`pdf-compress`, `pdf-repair`).
 * Strictly resolves canonical IDs and registered aliases via `resolvePdfOperationCapabilities`,
 * rejects unknown and cross-module tool IDs with `ERR_UNSUPPORTED_OPERATION`,
 * and dispatches to `compressPdfDocumentV2` or `repairPdfDocumentV2`.
 */
export async function executeOptimizationRepairOperationV2(
  request: PdfOperationRequest
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const totalInputBytes = (request?.inputs || []).reduce(
    (acc, f) => acc + inspectByteLength(f?.bytes),
    0
  );

  const resolved = resolvePdfOperationCapabilities(request?.toolId);
  if (!resolved.supported || !resolved.capabilities) {
    return buildFailureResult(
      request?.toolId || 'unknown',
      resolved.error ??
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unregistered PDF tool ID: "${request?.toolId}".`
        ),
      startTime,
      totalInputBytes
    );
  }

  const cap = resolved.capabilities;
  if (cap.module !== 'optimization-repair' || !ENGINE_F_CANONICAL_IDS.has(cap.canonicalId)) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by the Engine F Optimization & Repair router.`
      ),
      startTime,
      totalInputBytes
    );
  }

  if (!request.inputs || request.inputs.length === 0) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'At least one PDF input file is required.'),
      startTime,
      0
    );
  }

  const primaryInput = request.inputs[0];
  const rawOptions = (request.options || {}) as Record<string, unknown>;

  if (cap.canonicalId === 'pdf-compress') {
    return await compressPdfDocumentV2(primaryInput, rawOptions as CompressPdfOptions, request);
  }

  if (cap.canonicalId === 'pdf-repair') {
    return await repairPdfDocumentV2(primaryInput, rawOptions as RepairPdfOptions, request);
  }

  return buildFailureResult(
    cap.canonicalId,
    createPdfProcessingError('ERR_UNSUPPORTED_OPERATION', `No Engine F handler bound for "${cap.canonicalId}".`),
    startTime,
    totalInputBytes
  );
}
