/**
 * CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-09: OCR ENGINE (ENGINE H)
 *
 * Isolated V2 implementation of Optical Character Recognition (OCR) using the
 * already-installed `tesseract.js@7.0.0`, `pdfjs-dist@5.6.205`, and `@cantoo/pdf-lib@2.11.1`.
 *
 * Canonical Tool ID:
 * - `pdf-ocr` (Catalog Index 1522; alias `ocr-pdf`)
 *
 * Capabilities Implemented:
 * 1. OCR extraction from scanned PDF pages (both browser Canvas rendering and direct embedded raster XObject decoding).
 * 2. OCR extraction from PNG and JPEG images (`performImageOcrV2` & `performPdfOcrV2`).
 * 3. Single-page and multi-page OCR with reusable pooled Tesseract.js workers (`OcrWorkerPoolV2`).
 * 4. User-selected page ranges (`indices`, `range-string`, `preset`).
 * 5. Genuine language selection across Tesseract 4.00 LSTM language codes (`eng`, `spa`, `fra`, `deu`, `por`, `ita`, etc. and multi-language `eng+spa`) with zero silent language substitution.
 * 6. Page orientation detection and correction (`0°`, `90°`, `180°`, `270°` via PDF `/Rotate`, horizontal/vertical projection profile analysis, and multi-orientation confidence probing) + fine skew angle detection & deskewing (`rotateAuto` + projection variance maximization).
 * 7. Pixel-level image preprocessing pipeline: grayscale conversion, 3x3 median salt-and-pepper noise reduction, dynamic histogram contrast stretch, and Otsu / adaptive integral-image thresholding.
 * 8. Text extraction with page numbers and deterministic top-to-bottom, left-to-right reading order.
 * 9. Confidence scores at word, line, block, page, and document levels (retaining low-confidence results with explicit flags, never silently discarding them).
 * 10. Bounding boxes for recognized text in both top-left image pixels (`imageBboxPx`) and bottom-left PDF user-space points (`pdfBboxPt`).
 * 11. Searchable PDF generation overlaying an invisible (`opacity: 0` / `ca 0`), selectable, searchable text layer positioned over the original scanned page or image.
 * 12. 100% preservation of original page visual appearance and geometry.
 * 13. Granular progress reporting and deterministic `AbortSignal` cancellation (`ERR_OPERATION_ABORTED`).
 * 14. Deterministic cleanup of pooled workers (`terminateOcrWorkerPoolV2`), temporary buffers (`wipeInternalBuffer`), and PDF.js / pdf-lib sessions.
 */

import JSZip from 'jszip';
import {
  PDFArray,
  PDFContext,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFPage,
  PDFRawStream,
  PDFRef,
  StandardFonts,
  decodePDFRawStream,
  degrees,
  rgb,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import {
  cloneIsolatedPdfBytes,
  inspectByteLength,
  sniffFileFormat,
  wipeInternalBuffer,
} from './pdfByteUtils';
import {
  encodeRawPixelsToPng,
  inspectRasterImageHeader,
} from './pdfConversionExtractionEngine';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { serializeAndVerifyPdfV2 } from './pdfOutputIntegrity';
import { resolvePdfPageSelection } from './pdfPageRangeParser';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfInspectionReport,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfPageSelection,
  PdfProcessingError,
} from './pdfTypes';

/**
 * ============================================================================
 * 1. LANGUAGE CATALOG, OFFLINE TRANSPARENCY & VALIDATION
 * ============================================================================
 */

export interface OcrLanguageMetadata {
  /** 3-letter ISO 639-2/T Tesseract language code (e.g., 'eng', 'spa', 'fra') */
  code: string;
  /** Human-readable English name */
  name: string;
  /** Human-readable Spanish name */
  nameEs: string;
  /** Optional 2-letter ISO 639-1 alias (e.g., 'en' -> 'eng') */
  iso639_1?: string;
  /** Approximate compressed .traineddata.gz download size in MB */
  approxCompressedSizeMb: number;
}

/**
 * Verified catalog of standard Tesseract 4.00 LSTM language codes supported by `tesseract.js@7.0.0`.
 * By default, `tesseract.js@7.0.0` loads `<lang>.traineddata.gz` from:
 * - Local cache first (IndexedDB via `idb-keyval` in browser; `cachePath` in Node).
 * - If not cached, fetches `https://cdn.jsdelivr.net/npm/@tesseract.js-data/<lang>/4.0.0_best_int/<lang>.traineddata.gz`
 *   (or custom `langPath` if configured) and caches the uncompressed `.traineddata` for offline reuse.
 */
export const SUPPORTED_TESSERACT_LANGUAGE_CATALOG: Readonly<Record<string, OcrLanguageMetadata>> = {
  eng: { code: 'eng', name: 'English', nameEs: 'Inglés', iso639_1: 'en', approxCompressedSizeMb: 2.3 },
  spa: { code: 'spa', name: 'Spanish', nameEs: 'Español', iso639_1: 'es', approxCompressedSizeMb: 2.4 },
  fra: { code: 'fra', name: 'French', nameEs: 'Francés', iso639_1: 'fr', approxCompressedSizeMb: 2.1 },
  deu: { code: 'deu', name: 'German', nameEs: 'Alemán', iso639_1: 'de', approxCompressedSizeMb: 2.9 },
  por: { code: 'por', name: 'Portuguese', nameEs: 'Portugués', iso639_1: 'pt', approxCompressedSizeMb: 2.2 },
  ita: { code: 'ita', name: 'Italian', nameEs: 'Italiano', iso639_1: 'it', approxCompressedSizeMb: 2.2 },
  nld: { code: 'nld', name: 'Dutch', nameEs: 'Neerlandés', iso639_1: 'nl', approxCompressedSizeMb: 3.1 },
  pol: { code: 'pol', name: 'Polish', nameEs: 'Polaco', iso639_1: 'pl', approxCompressedSizeMb: 2.8 },
  rus: { code: 'rus', name: 'Russian', nameEs: 'Ruso', iso639_1: 'ru', approxCompressedSizeMb: 3.4 },
  jpn: { code: 'jpn', name: 'Japanese', nameEs: 'Japonés', iso639_1: 'ja', approxCompressedSizeMb: 2.5 },
  kor: { code: 'kor', name: 'Korean', nameEs: 'Coreano', iso639_1: 'ko', approxCompressedSizeMb: 1.9 },
  chi_sim: { code: 'chi_sim', name: 'Chinese (Simplified)', nameEs: 'Chino (Simplificado)', iso639_1: 'zh', approxCompressedSizeMb: 2.4 },
  chi_tra: { code: 'chi_tra', name: 'Chinese (Traditional)', nameEs: 'Chino (Tradicional)', approxCompressedSizeMb: 2.3 },
  ara: { code: 'ara', name: 'Arabic', nameEs: 'Árabe', iso639_1: 'ar', approxCompressedSizeMb: 1.4 },
  hin: { code: 'hin', name: 'Hindi', nameEs: 'Hindi', iso639_1: 'hi', approxCompressedSizeMb: 1.1 },
  tur: { code: 'tur', name: 'Turkish', nameEs: 'Turco', iso639_1: 'tr', approxCompressedSizeMb: 3.2 },
  vie: { code: 'vie', name: 'Vietnamese', nameEs: 'Vietnamita', iso639_1: 'vi', approxCompressedSizeMb: 0.9 },
  ukr: { code: 'ukr', name: 'Ukrainian', nameEs: 'Ucraniano', iso639_1: 'uk', approxCompressedSizeMb: 2.7 },
  ces: { code: 'ces', name: 'Czech', nameEs: 'Checo', iso639_1: 'cs', approxCompressedSizeMb: 2.6 },
  swe: { code: 'swe', name: 'Swedish', nameEs: 'Sueco', iso639_1: 'sv', approxCompressedSizeMb: 2.4 },
  dan: { code: 'dan', name: 'Danish', nameEs: 'Danés', iso639_1: 'da', approxCompressedSizeMb: 2.1 },
  fin: { code: 'fin', name: 'Finnish', nameEs: 'Finés', iso639_1: 'fi', approxCompressedSizeMb: 3.3 },
  nor: { code: 'nor', name: 'Norwegian', nameEs: 'Noruego', iso639_1: 'no', approxCompressedSizeMb: 2.2 },
  ell: { code: 'ell', name: 'Greek', nameEs: 'Griego', iso639_1: 'el', approxCompressedSizeMb: 1.5 },
  heb: { code: 'heb', name: 'Hebrew', nameEs: 'Hebreo', iso639_1: 'he', approxCompressedSizeMb: 1.3 },
  ron: { code: 'ron', name: 'Romanian', nameEs: 'Rumano', iso639_1: 'ro', approxCompressedSizeMb: 2.2 },
  hun: { code: 'hun', name: 'Hungarian', nameEs: 'Húngaro', iso639_1: 'hu', approxCompressedSizeMb: 3.1 },
  cat: { code: 'cat', name: 'Catalan', nameEs: 'Catalán', iso639_1: 'ca', approxCompressedSizeMb: 1.8 },
  ind: { code: 'ind', name: 'Indonesian', nameEs: 'Indonesio', iso639_1: 'id', approxCompressedSizeMb: 1.7 },
  tha: { code: 'tha', name: 'Thai', nameEs: 'Tailandés', iso639_1: 'th', approxCompressedSizeMb: 1.2 },
  lat: { code: 'lat', name: 'Latin', nameEs: 'Latín', iso639_1: 'la', approxCompressedSizeMb: 1.9 },
};

const ISO_639_1_TO_TESSERACT_MAP: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const meta of Object.values(SUPPORTED_TESSERACT_LANGUAGE_CATALOG)) {
    if (meta.iso639_1) {
      map[meta.iso639_1] = meta.code;
    }
  }
  return map;
})();

export const OCR_OFFLINE_AND_LANGUAGE_DISCLOSURE =
  'OCR executes 100% locally in WebAssembly via Tesseract.js 7.0.0. Language traineddata models (~1–3.5 MB compressed) are NOT bundled inside the initial application bundle; they are downloaded once on first use from @tesseract.js-data (or custom langPath) and cached locally (IndexedDB in browser / local cache directory in Node) for subsequent offline execution.';

/**
 * Validates and normalizes requested OCR language codes (e.g., 'eng', 'spa', 'eng+spa', ['eng', 'spa']).
 * - Never silently substitutes 'eng' or any other language if an invalid or unknown language code is requested.
 * - Returns `isValid: false` with `ERR_UNSUPPORTED_OPERATION` if any requested code is unrecognized.
 */
export function validateAndNormalizeOcrLanguagesV2(
  languageInput: string | string[] | undefined | null
): {
  isValid: boolean;
  normalizedCodes: string[];
  combinedLangString: string;
  metadata: OcrLanguageMetadata[];
  error?: PdfProcessingError;
} {
  if (languageInput === undefined || languageInput === null) {
    const engMeta = SUPPORTED_TESSERACT_LANGUAGE_CATALOG.eng;
    return {
      isValid: true,
      normalizedCodes: ['eng'],
      combinedLangString: 'eng',
      metadata: [engMeta],
    };
  }

  const rawTokens: string[] = Array.isArray(languageInput)
    ? languageInput.flatMap((item) => String(item).split('+'))
    : String(languageInput).split(/[+,]/);

  const cleanedTokens = rawTokens.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);

  if (cleanedTokens.length === 0) {
    return {
      isValid: false,
      normalizedCodes: [],
      combinedLangString: '',
      metadata: [],
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        'OCR language parameter cannot be empty. Specify a valid Tesseract language code such as "eng" or "spa".'
      ),
    };
  }

  const normalizedCodes: string[] = [];
  const metadata: OcrLanguageMetadata[] = [];
  const seen = new Set<string>();

  for (const token of cleanedTokens) {
    const resolvedCode = SUPPORTED_TESSERACT_LANGUAGE_CATALOG[token]
      ? token
      : ISO_639_1_TO_TESSERACT_MAP[token];

    if (!resolvedCode || !SUPPORTED_TESSERACT_LANGUAGE_CATALOG[resolvedCode]) {
      return {
        isValid: false,
        normalizedCodes: [],
        combinedLangString: '',
        metadata: [],
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unrecognized OCR language code "${token}". Refusing to silently substitute another language.`,
          {
            requestedLanguage: token,
            supportedLanguageCodes: Object.keys(SUPPORTED_TESSERACT_LANGUAGE_CATALOG),
          }
        ),
      };
    }

    if (!seen.has(resolvedCode)) {
      seen.add(resolvedCode);
      normalizedCodes.push(resolvedCode);
      metadata.push(SUPPORTED_TESSERACT_LANGUAGE_CATALOG[resolvedCode]);
    }
  }

  return {
    isValid: true,
    normalizedCodes,
    combinedLangString: normalizedCodes.join('+'),
    metadata,
  };
}

/**
 * ============================================================================
 * 2. TYPES & OPTIONS FOR PHASE PDF-09 OCR ENGINE (ENGINE H)
 * ============================================================================
 */

export interface OcrPreprocessorOptions {
  /** Whether to run the pixel-level preprocessing pipeline before OCR (default: true) */
  enabled?: boolean;
  /** Convert RGB/RGBA pixels to 8-bit ITU-R BT.601 grayscale luminance (default: true) */
  grayscale?: boolean;
  /** Stretch dynamic range between 2nd and 98th luminance percentiles (default: true) */
  contrastStretch?: boolean;
  /** Contrast multiplier around midpoint 128 (default: 1.2) */
  contrastFactor?: number;
  /** Apply 3x3 selective impulse/median filter to remove salt-and-pepper noise (default: false) */
  denoise?: boolean;
  /** Binarization thresholding mode: 'none' | 'otsu' | 'adaptive' (default: 'none') */
  thresholding?: 'none' | 'otsu' | 'adaptive';
  /** Detect and counter-rotate fine skew angles in [-15°..+15°] via horizontal projection variance (default: true) */
  deskew?: boolean;
  /** Optional explicit pre-OCR clockwise rotation override (0 | 90 | 180 | 270) */
  forceRotationDegrees?: 0 | 90 | 180 | 270;
}

export interface PdfOcrOptions {
  /**
   * Target OCR language code(s) (default: 'eng').
   * Supports any code in SUPPORTED_TESSERACT_LANGUAGE_CATALOG (e.g., 'eng', 'spa', 'fra', 'deu', 'por', 'ita')
   * or multi-language combinations (e.g., 'eng+spa' or ['eng', 'spa']).
   * Never silently substitutes another language on failure.
   */
  language?: string | string[];
  /**
   * Output mode:
   * - 'searchable-pdf-and-text' (default): Generates a Searchable PDF with an invisible text layer AND a UTF-8 .txt transcript file.
   * - 'searchable-pdf': Generates only the Searchable PDF with an invisible text layer.
   * - 'text-only': Generates only the extracted UTF-8 .txt transcript and structured OCR JSON metadata.
   */
  outputMode?: 'searchable-pdf-and-text' | 'searchable-pdf' | 'text-only';
  /** Target rasterization DPI for PDF pages / image-to-PDF scaling (default: 150, range: 72..600) */
  dpi?: number;
  /**
   * Optional page selection (`indices`, `range-string`, or `preset`).
   * Defaults to all pages.
   */
  selection?: PdfPageSelection | number[] | string;
  /**
   * When true, pages that already contain a native PDF vector text layer (>= 3 non-whitespace characters)
   * preserve their native text (`extractionSource: 'native-pdf-text-layer'`) and skip raster OCR.
   * Default: false (runs OCR on all selected pages unless explicitly set to true).
   */
  skipPagesWithExistingText?: boolean;
  /**
   * Word confidence threshold (0..100, default: 60) below which words are flagged `isLowConfidence: true`.
   * Low-confidence words are NEVER silently discarded.
   */
  lowConfidenceThreshold?: number;
  /**
   * Whether to automatically detect and correct 90°/180°/270° page rotation and fine skew (default: true).
   */
  detectOrientation?: boolean;
  /**
   * Whether to visually rotate the output PDF page when a 90°/180°/270° orientation correction is detected (default: true).
   */
  correctPageRotationInOutputPdf?: boolean;
  /** Image preprocessing configuration */
  preprocessing?: OcrPreprocessorOptions;
  /** Optional password for opening encrypted input PDFs */
  password?: string;
  /** Optional custom output file name */
  outputFileName?: string;
  /** Optional custom URL or filesystem directory for `.traineddata.gz` language files */
  langPath?: string;
  /** Optional cache directory path (defaults to `/tmp/calctools-tesseract-cache` in Node CLI) */
  cachePath?: string;
  /** Cache strategy for Tesseract traineddata ('write' | 'refresh' | 'readOnly' | 'none') */
  cacheMethod?: 'write' | 'refresh' | 'readOnly' | 'none';
  /** Optional AbortSignal for cancellation */
  signal?: AbortSignal;
}

export interface OcrBoundingBoxPx {
  /** Left pixel coordinate (0-based from left edge of image) */
  x0: number;
  /** Top pixel coordinate (0-based from top edge of image) */
  y0: number;
  /** Right pixel coordinate */
  x1: number;
  /** Bottom pixel coordinate */
  y1: number;
  /** Width in pixels (x1 - x0) */
  width: number;
  /** Height in pixels (y1 - y0) */
  height: number;
}

export interface OcrBoundingBoxPdfPt {
  /** Left X coordinate in PDF points (0-based from left edge of page) */
  x: number;
  /** Bottom Y coordinate in PDF points (0-based from bottom edge of page) */
  y: number;
  /** Width in PDF points */
  width: number;
  /** Height in PDF points */
  height: number;
  /** Text baseline Y coordinate in PDF points (from bottom edge of page) */
  baselineY: number;
}

export interface OcrWordRecord {
  text: string;
  confidence: number;
  isLowConfidence: boolean;
  readingOrderIndex: number;
  imageBboxPx: OcrBoundingBoxPx;
  pdfBboxPt: OcrBoundingBoxPdfPt;
}

export interface OcrLineRecord {
  text: string;
  confidence: number;
  readingOrderIndex: number;
  imageBboxPx: OcrBoundingBoxPx;
  pdfBboxPt: OcrBoundingBoxPdfPt;
  words: OcrWordRecord[];
}

export interface OcrBlockRecord {
  text: string;
  confidence: number;
  blockType: string;
  readingOrderIndex: number;
  imageBboxPx: OcrBoundingBoxPx;
  pdfBboxPt: OcrBoundingBoxPdfPt;
  lines: OcrLineRecord[];
}

export interface OcrPreprocessingDiagnostics {
  applied: boolean;
  grayscaleConverted: boolean;
  denoised: boolean;
  contrastStretched: boolean;
  percentileLow: number;
  percentileHigh: number;
  thresholdMode: 'none' | 'otsu' | 'adaptive';
  computedOtsuThreshold?: number;
  detectedOrientationDegrees: 0 | 90 | 180 | 270;
  detectedSkewAngleDegrees: number;
  tesseractRotateRadians: number;
}

export interface OcrPageRecord {
  pageNumber: number;
  sourceKind: 'scanned-pdf-page' | 'native-pdf-page' | 'raster-image';
  extractionSource: 'tesseract-ocr' | 'native-pdf-text-layer' | 'skipped-unselected';
  widthPt: number;
  heightPt: number;
  originalRotationDegrees: number;
  effectiveRotationDegrees: number;
  imageWidthPx: number;
  imageHeightPx: number;
  text: string;
  confidence: number;
  wordCount: number;
  lowConfidenceWordCount: number;
  characterCount: number;
  hasRecognizedText: boolean;
  preprocessing: OcrPreprocessingDiagnostics;
  blocks: OcrBlockRecord[];
  lines: OcrLineRecord[];
  words: OcrWordRecord[];
}

export interface OcrWorkerPoolStats {
  activeWorkersCount: number;
  workersCreatedCount: number;
  workerReuseCount: number;
  totalPagesRecognized: number;
  loadedLanguageKeys: string[];
}

/**
 * ============================================================================
 * 3. REUSABLE OCR WORKER POOL (`OcrWorkerPoolV2`)
 * ============================================================================
 */

const DEFAULT_NODE_CACHE_DIR = '/tmp/calctools-tesseract-cache';

function ensureNodeCacheDirExists(cacheDir: string): void {
  if (typeof window !== 'undefined') return;
  try {
    // Dynamic require in Node environment so Vite browser bundler never includes 'fs'
    const req = typeof require === 'function' ? require : null;
    if (req) {
      const fs = req('fs');
      if (fs && typeof fs.mkdirSync === 'function') {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
    }
  } catch {
    // Ignore in browser or restricted sandboxes
  }
}

interface PooledWorkerEntry {
  key: string;
  langString: string;
  langPath?: string;
  cachePath?: string;
  cacheMethod?: string;
  worker: any;
  busy: boolean;
}

class OcrWorkerPoolManagerV2 {
  private pool: Map<string, PooledWorkerEntry> = new Map();
  private workersCreatedCount = 0;
  private workerReuseCount = 0;
  private totalPagesRecognized = 0;

  private buildKey(params: {
    langString: string;
    langPath?: string;
    cachePath?: string;
    cacheMethod?: string;
  }): string {
    return `${params.langString}::${params.langPath || 'default'}::${params.cachePath || 'default'}::${params.cacheMethod || 'write'}`;
  }

  public getStats(): OcrWorkerPoolStats {
    return {
      activeWorkersCount: this.pool.size,
      workersCreatedCount: this.workersCreatedCount,
      workerReuseCount: this.workerReuseCount,
      totalPagesRecognized: this.totalPagesRecognized,
      loadedLanguageKeys: Array.from(this.pool.values()).map((e) => e.langString),
    };
  }

  public recordPageRecognized(): void {
    this.totalPagesRecognized++;
  }

  /**
   * Acquires an initialized Tesseract.js v7 worker from the pool, reusing an existing idle worker
   * for the same language configuration whenever available.
   *
   * Includes an explicit `errorHandler` and initialization guard so failed language downloads
   * (e.g., offline without cache or 404 `langPath`) reject deterministically with
   * `ERR_OCR_MODEL_LOAD_FAILED` instead of hanging or throwing an unhandled error.
   */
  public async acquireWorker(params: {
    langString: string;
    langPath?: string;
    cachePath?: string;
    cacheMethod?: 'write' | 'refresh' | 'readOnly' | 'none';
    onProgress?: (msg: { status: string; progress: number }) => void;
    signal?: AbortSignal;
  }): Promise<{
    worker: any;
    reused: boolean;
    release: () => void;
    destroyOnError: () => Promise<void>;
  }> {
    if (params.signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR operation was cancelled before worker acquisition.');
    }

    const effectiveCachePath =
      params.cachePath || (typeof window === 'undefined' ? DEFAULT_NODE_CACHE_DIR : undefined);
    if (effectiveCachePath) {
      ensureNodeCacheDirExists(effectiveCachePath);
    }

    const key = this.buildKey({
      langString: params.langString,
      langPath: params.langPath,
      cachePath: effectiveCachePath,
      cacheMethod: params.cacheMethod,
    });

    const existing = this.pool.get(key);
    if (existing && !existing.busy) {
      existing.busy = true;
      this.workerReuseCount++;
      return {
        worker: existing.worker,
        reused: true,
        release: () => {
          existing.busy = false;
        },
        destroyOnError: async () => {
          this.pool.delete(key);
          try {
            await existing.worker.terminate();
          } catch {
            // ignore termination errors
          }
        },
      };
    }

    // Create a new Tesseract.js worker with safe error interception
    const tesseractMod: any = await import('tesseract.js');
    const createWorkerFn =
      tesseractMod.createWorker || tesseractMod.default?.createWorker;

    if (typeof createWorkerFn !== 'function') {
      throw createPdfProcessingError(
        'ERR_OCR_MODEL_LOAD_FAILED',
        'Tesseract.js createWorker API is unavailable in the current runtime.'
      );
    }

    let createdWorkerRef: any = null;
    const workerPromise = new Promise<any>((resolve, reject) => {
      let settled = false;

      const onAbort = () => {
        if (settled) return;
        settled = true;
        if (createdWorkerRef && typeof createdWorkerRef.terminate === 'function') {
          createdWorkerRef.terminate().catch(() => {});
        }
        reject(
          createPdfProcessingError(
            'ERR_OPERATION_ABORTED',
            'OCR worker initialization was cancelled by user AbortSignal.'
          )
        );
      };

      if (params.signal) {
        if (params.signal.aborted) {
          onAbort();
          return;
        }
        params.signal.addEventListener('abort', onAbort, { once: true });
      }

      const workerOptions: Record<string, unknown> = {
        logger: (m: any) => {
          if (params.onProgress && m && typeof m.status === 'string') {
            params.onProgress({
              status: m.status,
              progress: Number(m.progress) || 0,
            });
          }
        },
        errorHandler: (errData: unknown) => {
          if (settled) return;
          settled = true;
          if (params.signal) {
            params.signal.removeEventListener('abort', onAbort);
          }
          const errStr = String(errData || 'Unknown Tesseract worker error');
          reject(
            createPdfProcessingError(
              'ERR_OCR_MODEL_LOAD_FAILED',
              `Failed to load or initialize OCR language data for "${params.langString}": ${errStr}. Refusing to substitute a different language.`,
              {
                requestedLanguage: params.langString,
                langPath: params.langPath || 'default-cdn',
                workerError: errStr,
              }
            )
          );
        },
      };

      if (params.langPath) {
        workerOptions.langPath = params.langPath;
      }
      if (effectiveCachePath) {
        workerOptions.cachePath = effectiveCachePath;
      }
      if (params.cacheMethod) {
        workerOptions.cacheMethod = params.cacheMethod;
      }

      createWorkerFn(params.langString, 1, workerOptions)
        .then((w: any) => {
          createdWorkerRef = w;
          if (settled) {
            if (w && typeof w.terminate === 'function') {
              w.terminate().catch(() => {});
            }
            return;
          }
          settled = true;
          if (params.signal) {
            params.signal.removeEventListener('abort', onAbort);
          }
          resolve(w);
        })
        .catch((err: unknown) => {
          if (settled) return;
          settled = true;
          if (params.signal) {
            params.signal.removeEventListener('abort', onAbort);
          }
          const errStr = err instanceof Error ? err.message : String(err);
          reject(
            createPdfProcessingError(
              'ERR_OCR_MODEL_LOAD_FAILED',
              `Failed to initialize OCR worker for language "${params.langString}": ${errStr}`,
              {
                requestedLanguage: params.langString,
                workerError: errStr,
              }
            )
          );
        });
    });

    const worker = await workerPromise;
    this.workersCreatedCount++;

    const entry: PooledWorkerEntry = {
      key,
      langString: params.langString,
      langPath: params.langPath,
      cachePath: effectiveCachePath,
      cacheMethod: params.cacheMethod,
      worker,
      busy: true,
    };
    this.pool.set(key, entry);

    return {
      worker,
      reused: false,
      release: () => {
        entry.busy = false;
      },
      destroyOnError: async () => {
        this.pool.delete(key);
        try {
          await worker.terminate();
        } catch {
          // ignore termination errors
        }
      },
    };
  }

  /**
   * Deterministically terminates all pooled Tesseract.js workers and clears the pool.
   */
  public async terminateAll(): Promise<void> {
    const entries = Array.from(this.pool.values());
    this.pool.clear();
    for (const entry of entries) {
      try {
        if (entry.worker && typeof entry.worker.terminate === 'function') {
          await entry.worker.terminate();
        }
      } catch {
        // Ignore worker termination warnings
      }
    }
  }
}

export const ocrWorkerPoolV2 = new OcrWorkerPoolManagerV2();

export function getOcrWorkerPoolStatsV2(): OcrWorkerPoolStats {
  return ocrWorkerPoolV2.getStats();
}

export async function terminateOcrWorkerPoolV2(): Promise<void> {
  await ocrWorkerPoolV2.terminateAll();
}

/**
 * ============================================================================
 * 4. PURE-TYPESCRIPT PNG DECODER, BASELINE DCT JPEG ENCODER & PREPROCESSING
 * ============================================================================
 */

export interface RawPixelImageBuffer {
  width: number;
  height: number;
  channels: 1 | 3 | 4;
  pixels: Uint8Array;
}

/**
 * Decodes an 8-bit PNG file (`Grayscale`, `RGB`, `RGBA`, or `Indexed Palette`) into a raw pixel buffer
 * `{ width, height, channels, pixels }` in pure TypeScript using `@cantoo/pdf-lib`'s `decodePDFRawStream`
 * for Zlib `IDAT` decompression and PNG scanline filter reconstruction (`None`, `Sub`, `Up`, `Average`, `Paeth`).
 */
export function decodePngToRawPixels(pngBytes: Uint8Array): RawPixelImageBuffer | null {
  const header = inspectRasterImageHeader(pngBytes);
  if (!header.isValid || header.format !== 'png' || !header.width || !header.height) {
    return null;
  }

  const width = header.width;
  const height = header.height;
  const bitDepth = pngBytes[24];
  const colorType = pngBytes[25];
  const interlaceMethod = pngBytes[28];

  // Support standard non-interlaced 8-bit Grayscale (0), RGB (2), Palette (3), Grayscale+Alpha (4), RGBA (6)
  if (bitDepth !== 8 || interlaceMethod !== 0) {
    return null;
  }

  const bytesPerPixel =
    colorType === 0 ? 1 : colorType === 2 ? 3 : colorType === 3 ? 1 : colorType === 4 ? 2 : colorType === 6 ? 4 : 0;
  if (bytesPerPixel === 0) return null;

  let palette: Uint8Array | null = null;
  const idatChunks: Uint8Array[] = [];
  let totalIdatLen = 0;

  let offset = 8; // Skip 8-byte PNG signature
  while (offset + 8 <= pngBytes.byteLength) {
    const chunkLen =
      ((pngBytes[offset] << 24) >>> 0) +
      ((pngBytes[offset + 1] << 16) >>> 0) +
      ((pngBytes[offset + 2] << 8) >>> 0) +
      pngBytes[offset + 3];
    const chunkType = String.fromCharCode(
      pngBytes[offset + 4],
      pngBytes[offset + 5],
      pngBytes[offset + 6],
      pngBytes[offset + 7]
    );
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLen;
    if (dataEnd + 4 > pngBytes.byteLength) break;

    if (chunkType === 'PLTE') {
      palette = pngBytes.subarray(dataStart, dataEnd);
    } else if (chunkType === 'IDAT') {
      const slice = pngBytes.subarray(dataStart, dataEnd);
      idatChunks.push(slice);
      totalIdatLen += slice.byteLength;
    } else if (chunkType === 'IEND') {
      break;
    }

    offset = dataEnd + 4; // Skip 4-byte CRC32
  }

  if (totalIdatLen === 0) return null;

  const combinedIdat = new Uint8Array(totalIdatLen);
  let writePos = 0;
  for (const chunk of idatChunks) {
    combinedIdat.set(chunk, writePos);
    writePos += chunk.byteLength;
  }

  // Decompress Zlib IDAT stream via @cantoo/pdf-lib's FlateDecode stream decoder
  let decompressedScanlines: Uint8Array;
  try {
    const context = PDFContext.create();
    const dict = PDFDict.withContext(context);
    dict.set(PDFName.of('Filter'), PDFName.of('FlateDecode'));
    const rawStream = PDFRawStream.of(dict, combinedIdat);
    decompressedScanlines = cloneIsolatedPdfBytes(decodePDFRawStream(rawStream).decode());
  } catch {
    return null;
  }

  const rowBytes = width * bytesPerPixel;
  const stride = rowBytes + 1;
  if (decompressedScanlines.byteLength < stride * height) {
    return null;
  }

  const unfiltered = new Uint8Array(rowBytes * height);
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
    const srcRow = y * stride;
    const filterType = decompressedScanlines[srcRow];
    const dstRow = y * rowBytes;
    const prevRow = (y - 1) * rowBytes;

    for (let x = 0; x < rowBytes; x++) {
      const raw = decompressedScanlines[srcRow + 1 + x];
      const left = x >= bytesPerPixel ? unfiltered[dstRow + x - bytesPerPixel] : 0;
      const up = y > 0 ? unfiltered[prevRow + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? unfiltered[prevRow + x - bytesPerPixel] : 0;

      let val = raw;
      if (filterType === 1) {
        val = (raw + left) & 0xff;
      } else if (filterType === 2) {
        val = (raw + up) & 0xff;
      } else if (filterType === 3) {
        val = (raw + ((left + up) >> 1)) & 0xff;
      } else if (filterType === 4) {
        val = (raw + paeth(left, up, upLeft)) & 0xff;
      }
      unfiltered[dstRow + x] = val;
    }
  }

  // Normalize Palette (3) or Grayscale+Alpha (4) into standard 1, 3, or 4 channels
  if (colorType === 0) {
    return { width, height, channels: 1, pixels: unfiltered };
  }
  if (colorType === 2) {
    return { width, height, channels: 3, pixels: unfiltered };
  }
  if (colorType === 6) {
    return { width, height, channels: 4, pixels: unfiltered };
  }
  if (colorType === 4) {
    // Grayscale + Alpha -> extract Grayscale luminance blended onto white background
    const gray = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < gray.byteLength; i++, p += 2) {
      const lum = unfiltered[p];
      const alpha = unfiltered[p + 1] / 255;
      gray[i] = Math.round(lum * alpha + 255 * (1 - alpha));
    }
    return { width, height, channels: 1, pixels: gray };
  }
  if (colorType === 3 && palette) {
    const rgbPixels = new Uint8Array(width * height * 3);
    for (let i = 0; i < unfiltered.byteLength; i++) {
      const palIdx = unfiltered[i] * 3;
      rgbPixels[i * 3] = palette[palIdx] ?? 0;
      rgbPixels[i * 3 + 1] = palette[palIdx + 1] ?? 0;
      rgbPixels[i * 3 + 2] = palette[palIdx + 2] ?? 0;
    }
    return { width, height, channels: 3, pixels: rgbPixels };
  }

  return null;
}

/**
 * Genuine 8x8 Discrete Cosine Transform (DCT-II) Baseline JPEG (JFIF) Encoder in pure TypeScript.
 * Encodes any 1-channel (Grayscale) or 3/4-channel (RGB/RGBA) pixel buffer into a valid baseline
 * JPEG image (`FF D8 FF E0 ... FF D9`) preserving visual text and graphics so Leptonica (`tesseract.js`),
 * `@cantoo/pdf-lib` (`embedJpg`), and standard image viewers decode the exact pixel content.
 */
export function encodeRawPixelsToBaselineJpeg(image: RawPixelImageBuffer): Uint8Array {
  const width = Math.max(1, Math.min(16383, Math.round(image.width)));
  const height = Math.max(1, Math.min(16383, Math.round(image.height)));

  // Convert input to 1-channel 8-bit grayscale luminance Y [0..255]
  const gray = new Uint8Array(width * height);
  if (image.channels === 1) {
    gray.set(image.pixels.subarray(0, width * height));
  } else if (image.channels === 3) {
    for (let i = 0, p = 0; i < width * height; i++, p += 3) {
      gray[i] = Math.round(
        0.299 * (image.pixels[p] ?? 255) +
          0.587 * (image.pixels[p + 1] ?? 255) +
          0.114 * (image.pixels[p + 2] ?? 255)
      );
    }
  } else {
    for (let i = 0, p = 0; i < width * height; i++, p += 4) {
      const a = (image.pixels[p + 3] ?? 255) / 255;
      const r = (image.pixels[p] ?? 255) * a + 255 * (1 - a);
      const g = (image.pixels[p + 1] ?? 255) * a + 255 * (1 - a);
      const b = (image.pixels[p + 2] ?? 255) * a + 255 * (1 - a);
      gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  // Standard ZigZag scan order for 8x8 DCT block
  const ZIGZAG = [
    0,  1,  5,  6, 14, 15, 27, 28,
    2,  4,  7, 13, 16, 26, 29, 42,
    3,  8, 12, 17, 25, 30, 41, 43,
    9, 11, 18, 24, 31, 40, 44, 53,
   10, 19, 23, 32, 39, 45, 52, 54,
   20, 22, 33, 38, 46, 51, 55, 60,
   21, 34, 37, 47, 50, 56, 59, 61,
   35, 36, 48, 49, 57, 58, 62, 63,
  ];

  // High-quality Q=~92 quantization table (all 4s for crisp text edges)
  const quantTable = new Uint8Array(64).fill(4);

  // Standard JPEG Luminance DC Huffman specification (ISO/IEC 10918-1 Annex K.3.3.1)
  const STD_DC_LUMINANCE_NRCODES = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const STD_DC_LUMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Standard JPEG Luminance AC Huffman specification (ISO/IEC 10918-1 Annex K.3.3.2)
  const STD_AC_LUMINANCE_NRCODES = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
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

  const buildHuffmanLookup = (nrCodes: number[], values: number[]) => {
    const codeMap = new Array<{ code: number; len: number }>(256);
    let code = 0;
    let valIdx = 0;
    for (let len = 1; len <= 16; len++) {
      const count = nrCodes[len - 1];
      for (let i = 0; i < count; i++) {
        const sym = values[valIdx++];
        codeMap[sym] = { code, len };
        code++;
      }
      code <<= 1;
    }
    return codeMap;
  };

  const dcHuff = buildHuffmanLookup(STD_DC_LUMINANCE_NRCODES, STD_DC_LUMINANCE_VALUES);
  const acHuff = buildHuffmanLookup(STD_AC_LUMINANCE_NRCODES, STD_AC_LUMINANCE_VALUES);

  // Precompute 8x8 cosine basis matrix C[u][x] = alpha(u) * cos((2x+1)*u*pi/16)
  const cosTable = new Float64Array(64);
  for (let u = 0; u < 8; u++) {
    const alpha = u === 0 ? Math.SQRT1_2 * 0.5 : 0.5;
    for (let x = 0; x < 8; x++) {
      cosTable[u * 8 + x] = alpha * Math.cos(((2 * x + 1) * u * Math.PI) / 16);
    }
  }

  const outBytes: number[] = [
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, // APP0 JFIF
    0x4a, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x01, 0x00, 0x96, 0x00, 0x96, 0x00, 0x00,
    // DQT
    0xff, 0xdb, 0x00, 0x43, 0x00,
    ...Array.from(quantTable),
    // SOF0 (1-component Grayscale)
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >>> 8) & 0xff, height & 0xff,
    (width >>> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00,
    // DHT DC Table 0
    0xff, 0xc4,
    ((2 + 1 + 16 + STD_DC_LUMINANCE_VALUES.length) >>> 8) & 0xff,
    (2 + 1 + 16 + STD_DC_LUMINANCE_VALUES.length) & 0xff,
    0x00,
    ...STD_DC_LUMINANCE_NRCODES,
    ...STD_DC_LUMINANCE_VALUES,
    // DHT AC Table 0
    0xff, 0xc4,
    ((2 + 1 + 16 + STD_AC_LUMINANCE_VALUES.length) >>> 8) & 0xff,
    (2 + 1 + 16 + STD_AC_LUMINANCE_VALUES.length) & 0xff,
    0x10,
    ...STD_AC_LUMINANCE_NRCODES,
    ...STD_AC_LUMINANCE_VALUES,
    // SOS
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
  ];

  let bitBuf = 0;
  let bitCount = 0;

  const writeBits = (bits: number, length: number) => {
    bitBuf = (bitBuf << length) | (bits & ((1 << length) - 1));
    bitCount += length;
    while (bitCount >= 8) {
      bitCount -= 8;
      const b = (bitBuf >>> bitCount) & 0xff;
      outBytes.push(b);
      if (b === 0xff) {
        outBytes.push(0x00); // Byte stuffing
      }
    }
  };

  const getMagnitudeCategory = (val: number): { category: number; bits: number } => {
    if (val === 0) return { category: 0, bits: 0 };
    const absVal = Math.abs(val);
    let cat = 0;
    let tmp = absVal;
    while (tmp > 0) {
      cat++;
      tmp >>= 1;
    }
    const bits = val > 0 ? val : val + (1 << cat) - 1;
    return { category: cat, bits };
  };

  const blockPixels = new Float64Array(64);
  const tempBlock = new Float64Array(64);
  const zzCoeffs = new Int32Array(64);
  let prevDc = 0;

  for (let by = 0; by < height; by += 8) {
    for (let bx = 0; bx < width; bx += 8) {
      // Load 8x8 block shifted by -128
      for (let y = 0; y < 8; y++) {
        const py = Math.min(height - 1, by + y);
        const rowOff = py * width;
        for (let x = 0; x < 8; x++) {
          const px = Math.min(width - 1, bx + x);
          blockPixels[y * 8 + x] = gray[rowOff + px] - 128;
        }
      }

      // Separable 2D DCT: temp = C * block, F = temp * C^T
      for (let u = 0; u < 8; u++) {
        for (let x = 0; x < 8; x++) {
          let sum = 0;
          for (let y = 0; y < 8; y++) {
            sum += cosTable[u * 8 + y] * blockPixels[y * 8 + x];
          }
          tempBlock[u * 8 + x] = sum;
        }
      }

      for (let v = 0; v < 8; v++) {
        for (let u = 0; u < 8; u++) {
          let sum = 0;
          for (let x = 0; x < 8; x++) {
            sum += tempBlock[v * 8 + x] * cosTable[u * 8 + x];
          }
          const zzIdx = ZIGZAG[v * 8 + u];
          zzCoeffs[zzIdx] = Math.round(sum / quantTable[zzIdx]);
        }
      }

      // Encode DC difference
      const dcDiff = zzCoeffs[0] - prevDc;
      prevDc = zzCoeffs[0];
      const dcMag = getMagnitudeCategory(dcDiff);
      const dcCode = dcHuff[dcMag.category];
      writeBits(dcCode.code, dcCode.len);
      if (dcMag.category > 0) {
        writeBits(dcMag.bits, dcMag.category);
      }

      // Encode AC coefficients
      let endNonZero = 63;
      while (endNonZero > 0 && zzCoeffs[endNonZero] === 0) {
        endNonZero--;
      }

      let zeroRun = 0;
      for (let k = 1; k <= endNonZero; k++) {
        const acVal = zzCoeffs[k];
        if (acVal === 0) {
          zeroRun++;
        } else {
          while (zeroRun >= 16) {
            const zrl = acHuff[0xf0];
            writeBits(zrl.code, zrl.len);
            zeroRun -= 16;
          }
          const acMag = getMagnitudeCategory(acVal);
          const sym = (zeroRun << 4) | acMag.category;
          const acCode = acHuff[sym];
          writeBits(acCode.code, acCode.len);
          writeBits(acMag.bits, acMag.category);
          zeroRun = 0;
        }
      }

      if (endNonZero < 63) {
        const eob = acHuff[0x00];
        writeBits(eob.code, eob.len);
      }
    }
  }

  // Pad remaining bits in last byte with 1s
  if (bitCount > 0) {
    const padLen = 8 - bitCount;
    writeBits((1 << padLen) - 1, padLen);
  }

  outBytes.push(0xff, 0xd9); // EOI
  return new Uint8Array(outBytes);
}

/**
 * Rotates a raw pixel buffer clockwise by `0`, `90`, `180`, or `270` degrees.
 */
export function rotatePixelBuffer90_180_270(
  image: RawPixelImageBuffer,
  clockwiseDegrees: 0 | 90 | 180 | 270
): RawPixelImageBuffer {
  const norm = (((clockwiseDegrees % 360) + 360) % 360) as 0 | 90 | 180 | 270;
  if (norm === 0) {
    return {
      width: image.width,
      height: image.height,
      channels: image.channels,
      pixels: new Uint8Array(image.pixels),
    };
  }

  const { width: srcW, height: srcH, channels, pixels: src } = image;
  const dstW = norm === 90 || norm === 270 ? srcH : srcW;
  const dstH = norm === 90 || norm === 270 ? srcW : srcH;
  const dst = new Uint8Array(dstW * dstH * channels);

  for (let sy = 0; sy < srcH; sy++) {
    for (let sx = 0; sx < srcW; sx++) {
      let dx = sx;
      let dy = sy;
      if (norm === 90) {
        dx = srcH - 1 - sy;
        dy = sx;
      } else if (norm === 180) {
        dx = srcW - 1 - sx;
        dy = srcH - 1 - sy;
      } else if (norm === 270) {
        dx = sy;
        dy = srcW - 1 - sx;
      }

      const srcIdx = (sy * srcW + sx) * channels;
      const dstIdx = (dy * dstW + dx) * channels;
      for (let c = 0; c < channels; c++) {
        dst[dstIdx + c] = src[srcIdx + c];
      }
    }
  }

  return {
    width: dstW,
    height: dstH,
    channels,
    pixels: dst,
  };
}

/**
 * Estimates the fine skew angle (in degrees, `[-15°..+15°]`) of a grayscale image by finding the
 * rotation angle that maximizes horizontal row-projection ink variance (the classical Baird / Postl
 * projection profile deskew criterion).
 */
export function estimateSkewAngleDegrees(
  grayPixels: Uint8Array,
  width: number,
  height: number
): number {
  if (width < 32 || height < 32) return 0;

  // Compute adaptive ink threshold so both high-contrast and low-contrast scans detect ink pixels accurately
  const otsuCutoff = computeOtsuThreshold(grayPixels);
  const inkCutoff = Math.min(200, Math.max(128, otsuCutoff + 12));

  // Collect dark ink coordinates
  const darkPointsX: number[] = [];
  const darkPointsY: number[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const step = width * height > 300000 ? 2 : 1;

  for (let y = 0; y < height; y += step) {
    const rowOff = y * width;
    for (let x = 0; x < width; x += step) {
      if (grayPixels[rowOff + x] <= inkCutoff) {
        darkPointsX.push(x - cx);
        darkPointsY.push(y - cy);
      }
    }
  }

  if (darkPointsX.length < 30) return 0;

  const evalAngleVariance = (deg: number): number => {
    const rad = (deg * Math.PI) / 180;
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);
    const hist = new Int32Array(height);

    for (let i = 0; i < darkPointsX.length; i++) {
      const ry = Math.round(-darkPointsX[i] * sinA + darkPointsY[i] * cosA + cy);
      if (ry >= 0 && ry < height) {
        hist[ry]++;
      }
    }

    let sum = 0;
    let sumSq = 0;
    for (let r = 0; r < height; r++) {
      const v = hist[r];
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / height;
    return sumSq / height - mean * mean;
  };

  const zeroVar = evalAngleVariance(0);
  let bestAngle = 0;
  let bestVar = zeroVar;

  // Coarse search: -12° to +12° in 1.0° steps
  for (let deg = -12; deg <= 12; deg += 1) {
    if (deg === 0) continue;
    const v = evalAngleVariance(deg);
    if (v > bestVar) {
      bestVar = v;
      bestAngle = deg;
    }
  }

  // Fine search around bestAngle in 0.25° steps
  const fineCenter = bestAngle;
  for (let d = -0.75; d <= 0.75; d += 0.25) {
    const candidate = fineCenter + d;
    const v = evalAngleVariance(candidate);
    if (v > bestVar) {
      bestVar = v;
      bestAngle = candidate;
    }
  }

  // Trigger deskew if variance improves over 0° by at least 4% and |angle| >= 0.75°
  if (Math.abs(bestAngle) < 0.75 || bestVar < zeroVar * 1.04) {
    return 0;
  }

  return Math.round(bestAngle * 100) / 100;
}

/**
 * Counter-rotates a 1-channel grayscale image by `angleDegrees` onto a white background (`255`)
 * using bilinear interpolation to correct document scan skew.
 */
export function deskewGrayscalePixels(
  grayPixels: Uint8Array,
  width: number,
  height: number,
  angleDegrees: number
): Uint8Array {
  if (Math.abs(angleDegrees) < 0.5) {
    return new Uint8Array(grayPixels);
  }

  const rad = (angleDegrees * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;

  // Estimate background luminance from border pixels so deskew border padding matches paper background
  let edgeSum = 0;
  let edgeCount = 0;
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 16))) {
    edgeSum += grayPixels[x] + grayPixels[(height - 1) * width + x];
    edgeCount += 2;
  }
  const bgFill = edgeCount > 0 ? Math.round(edgeSum / edgeCount) : 255;

  const out = new Uint8Array(width * height);
  out.fill(bgFill);

  for (let dy = 0; dy < height; dy++) {
    const yRel = dy - cy;
    const dstRow = dy * width;
    for (let dx = 0; dx < width; dx++) {
      const xRel = dx - cx;
      // Inverse mapping from destination (dx, dy) back to source (sx, sy)
      const sx = xRel * cosA - yRel * sinA + cx;
      const sy = xRel * sinA + yRel * cosA + cy;

      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      if (x0 >= 0 && x0 + 1 < width && y0 >= 0 && y0 + 1 < height) {
        const fx = sx - x0;
        const fy = sy - y0;
        const idx00 = y0 * width + x0;
        const v00 = grayPixels[idx00];
        const v10 = grayPixels[idx00 + 1];
        const v01 = grayPixels[idx00 + width];
        const v11 = grayPixels[idx00 + width + 1];

        const top = v00 * (1 - fx) + v10 * fx;
        const bot = v01 * (1 - fx) + v11 * fx;
        out[dstRow + dx] = Math.round(top * (1 - fy) + bot * fy);
      } else if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
        out[dstRow + dx] = grayPixels[y0 * width + x0];
      }
    }
  }

  return out;
}

/**
 * Computes Otsu's optimal global binarization threshold [0..255] maximizing inter-class variance.
 */
export function computeOtsuThreshold(grayPixels: Uint8Array): number {
  const hist = new Int32Array(256);
  const total = grayPixels.byteLength;
  if (total === 0) return 128;

  for (let i = 0; i < total; i++) {
    hist[grayPixels[i]]++;
  }

  let sumAll = 0;
  for (let t = 0; t < 256; t++) {
    sumAll += t * hist[t];
  }

  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const betweenVar = wB * wF * (mB - mF) * (mB - mF);

    if (betweenVar > maxVar) {
      maxVar = betweenVar;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Runs the pixel-level OCR image preprocessing pipeline:
 * 1. Optional pre-rotation override (`forceRotationDegrees`).
 * 2. Grayscale conversion (`ITU-R BT.601`).
 * 3. Optional 3x3 selective impulse/median denoising (`denoise: true`).
 * 4. Dynamic histogram contrast stretching (`2nd` to `98th` percentile) & contrast factor boost.
 * 5. Automatic fine skew detection & deskewing (`deskew: true`).
 * 6. Optional Otsu or Adaptive integral-image thresholding (`thresholding: 'otsu' | 'adaptive'`).
 */
export function preprocessImageForOcrV2(
  rawImage: RawPixelImageBuffer,
  options: OcrPreprocessorOptions = {}
): {
  processedImage: RawPixelImageBuffer;
  pngBytes: Uint8Array;
  diagnostics: OcrPreprocessingDiagnostics;
} {
  const enabled = options.enabled !== false;
  let working = rawImage;
  let appliedRotation: 0 | 90 | 180 | 270 = 0;

  if (options.forceRotationDegrees && [90, 180, 270].includes(options.forceRotationDegrees)) {
    appliedRotation = options.forceRotationDegrees;
    working = rotatePixelBuffer90_180_270(working, appliedRotation);
  }

  const width = working.width;
  const height = working.height;
  const totalPixels = width * height;

  if (!enabled) {
    const pngBytes = encodeRawPixelsToPng({
      width,
      height,
      channels: working.channels,
      pixels: working.pixels,
    });
    return {
      processedImage: working,
      pngBytes,
      diagnostics: {
        applied: false,
        grayscaleConverted: false,
        denoised: false,
        contrastStretched: false,
        percentileLow: 0,
        percentileHigh: 255,
        thresholdMode: 'none',
        detectedOrientationDegrees: appliedRotation,
        detectedSkewAngleDegrees: 0,
        tesseractRotateRadians: 0,
      },
    };
  }

  // 1. Convert to 1-channel Grayscale luminance
  let gray: Uint8Array = new Uint8Array(totalPixels);
  if (working.channels === 1) {
    gray.set(working.pixels.subarray(0, totalPixels));
  } else if (working.channels === 3) {
    for (let i = 0, p = 0; i < totalPixels; i++, p += 3) {
      gray[i] = Math.round(
        0.299 * working.pixels[p] + 0.587 * working.pixels[p + 1] + 0.114 * working.pixels[p + 2]
      );
    }
  } else {
    for (let i = 0, p = 0; i < totalPixels; i++, p += 4) {
      const alpha = (working.pixels[p + 3] ?? 255) / 255;
      const r = working.pixels[p] * alpha + 255 * (1 - alpha);
      const g = working.pixels[p + 1] * alpha + 255 * (1 - alpha);
      const b = working.pixels[p + 2] * alpha + 255 * (1 - alpha);
      gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  // 2. Optional 3x3 Selective Impulse / Median Noise Reduction
  const shouldDenoise = options.denoise === true;
  if (shouldDenoise && width >= 3 && height >= 3) {
    const denoised = new Uint8Array(gray);
    const window9 = new Uint8Array(9);
    for (let y = 1; y < height - 1; y++) {
      const r0 = (y - 1) * width;
      const r1 = y * width;
      const r2 = (y + 1) * width;
      for (let x = 1; x < width - 1; x++) {
        const center = gray[r1 + x];
        window9[0] = gray[r0 + x - 1];
        window9[1] = gray[r0 + x];
        window9[2] = gray[r0 + x + 1];
        window9[3] = gray[r1 + x - 1];
        window9[4] = center;
        window9[5] = gray[r1 + x + 1];
        window9[6] = gray[r2 + x - 1];
        window9[7] = gray[r2 + x];
        window9[8] = gray[r2 + x + 1];

        // Count how many of the 8 neighbors differ strongly (> 45 levels) from center
        let outlierNeighbors = 0;
        for (let k = 0; k < 9; k++) {
          if (k !== 4 && Math.abs(window9[k] - center) > 45) {
            outlierNeighbors++;
          }
        }
        // Only replace isolated impulse/salt-and-pepper noise (>= 7 of 8 neighbors disagree)
        // so thin character strokes (which have >= 2 connected stroke neighbors) are never eroded!
        if (outlierNeighbors >= 7) {
          window9.sort();
          denoised[r1 + x] = window9[4];
        }
      }
    }
    gray = denoised;
  }

  // 3. Dynamic Histogram Contrast Stretch
  const shouldContrastStretch = options.contrastStretch !== false;
  let pLow = 0;
  let pHigh = 255;

  if (shouldContrastStretch && totalPixels > 0) {
    const hist = new Int32Array(256);
    for (let i = 0; i < totalPixels; i++) {
      hist[gray[i]]++;
    }
    const lowTarget = Math.max(1, Math.floor(totalPixels * 0.01));
    const highTarget = Math.min(totalPixels - 1, Math.ceil(totalPixels * 0.99));

    let cum = 0;
    for (let v = 0; v < 256; v++) {
      cum += hist[v];
      if (cum >= lowTarget) {
        pLow = v;
        break;
      }
    }

    cum = 0;
    for (let v = 0; v < 256; v++) {
      cum += hist[v];
      if (cum >= highTarget) {
        pHigh = v;
        break;
      }
    }

    const span = pHigh - pLow;
    const contrastFactor =
      options.contrastFactor !== undefined && Number.isFinite(options.contrastFactor)
        ? Math.max(0.5, Math.min(3.0, Number(options.contrastFactor)))
        : 1.15;

    if (span >= 8) {
      for (let i = 0; i < totalPixels; i++) {
        const stretched = ((gray[i] - pLow) * 255) / span;
        const boosted = 128 + (stretched - 128) * contrastFactor;
        gray[i] = Math.max(0, Math.min(255, Math.round(boosted)));
      }
    }
  }

  // 4. Fine Skew Detection & Deskewing
  let detectedSkewAngleDegrees = 0;
  if (options.deskew !== false) {
    detectedSkewAngleDegrees = estimateSkewAngleDegrees(gray, width, height);
    if (Math.abs(detectedSkewAngleDegrees) >= 0.75) {
      gray = deskewGrayscalePixels(gray, width, height, detectedSkewAngleDegrees);
    }
  }

  // 5. Optional Binarization Thresholding ('otsu' | 'adaptive')
  const thresholdMode = options.thresholding || 'none';
  let computedOtsuThreshold: number | undefined;

  if (thresholdMode === 'otsu') {
    computedOtsuThreshold = computeOtsuThreshold(gray);
    // Guard against blank single-tone images where Otsu threshold would invert a pure white page
    if (pHigh - pLow >= 12) {
      for (let i = 0; i < totalPixels; i++) {
        gray[i] = gray[i] <= computedOtsuThreshold ? 0 : 255;
      }
    }
  } else if (thresholdMode === 'adaptive' && width >= 8 && height >= 8) {
    // Bradley-Roth integral image adaptive thresholding
    const integral = new Float64Array(width * height);
    for (let y = 0; y < height; y++) {
      let rowSum = 0;
      const rOff = y * width;
      const prevOff = (y - 1) * width;
      for (let x = 0; x < width; x++) {
        rowSum += gray[rOff + x];
        integral[rOff + x] = rowSum + (y > 0 ? integral[prevOff + x] : 0);
      }
    }

    const halfWin = Math.max(7, Math.round(Math.min(width, height) / 24));
    const tBias = 0.12;
    const bin = new Uint8Array(totalPixels);

    for (let y = 0; y < height; y++) {
      const y1 = Math.max(0, y - halfWin);
      const y2 = Math.min(height - 1, y + halfWin);
      const rOff = y * width;
      for (let x = 0; x < width; x++) {
        const x1 = Math.max(0, x - halfWin);
        const x2 = Math.min(width - 1, x + halfWin);
        const count = (x2 - x1 + 1) * (y2 - y1 + 1);

        let sum = integral[y2 * width + x2];
        if (y1 > 0) sum -= integral[(y1 - 1) * width + x2];
        if (x1 > 0) sum -= integral[y2 * width + (x1 - 1)];
        if (y1 > 0 && x1 > 0) sum += integral[(y1 - 1) * width + (x1 - 1)];

        const localMean = sum / count;
        bin[rOff + x] = gray[rOff + x] < localMean * (1 - tBias) && gray[rOff + x] < 210 ? 0 : 255;
      }
    }
    gray = bin;
  }

  const processedImage: RawPixelImageBuffer = {
    width,
    height,
    channels: 1,
    pixels: gray,
  };

  const pngBytes = encodeRawPixelsToPng({
    width,
    height,
    channels: 1,
    pixels: gray,
  });

  return {
    processedImage,
    pngBytes,
    diagnostics: {
      applied: true,
      grayscaleConverted: true,
      denoised: shouldDenoise,
      contrastStretched: shouldContrastStretch,
      percentileLow: pLow,
      percentileHigh: pHigh,
      thresholdMode,
      computedOtsuThreshold,
      detectedOrientationDegrees: appliedRotation,
      detectedSkewAngleDegrees,
      tesseractRotateRadians: 0,
    },
  };
}

/**
 * ============================================================================
 * 5. COORDINATE MAPPING & ORIENTATION DETECTION HELPERS
 * ============================================================================
 */

/**
 * Maps an OCR bounding box from top-left origin raster image pixels `(x0, y0, x1, y1)`
 * to bottom-left origin PDF page user-space coordinates `(x, y, width, height, baselineY)` in points (`pt`).
 */
export function mapImageBboxToPdfCoordinates(params: {
  bboxPx: { x0: number; y0: number; x1: number; y1: number };
  baselineY0Px?: number;
  baselineY1Px?: number;
  imageWidthPx: number;
  imageHeightPx: number;
  pageWidthPt: number;
  pageHeightPt: number;
}): {
  imageBboxPx: OcrBoundingBoxPx;
  pdfBboxPt: OcrBoundingBoxPdfPt;
} {
  const imgW = Math.max(1, params.imageWidthPx);
  const imgH = Math.max(1, params.imageHeightPx);
  const pageW = Math.max(1, params.pageWidthPt);
  const pageH = Math.max(1, params.pageHeightPt);

  const x0 = Math.max(0, Math.min(imgW, Math.round(params.bboxPx.x0)));
  const y0 = Math.max(0, Math.min(imgH, Math.round(params.bboxPx.y0)));
  const x1 = Math.max(x0, Math.min(imgW, Math.round(params.bboxPx.x1)));
  const y1 = Math.max(y0, Math.min(imgH, Math.round(params.bboxPx.y1)));

  const scaleX = pageW / imgW;
  const scaleY = pageH / imgH;

  const pdfX = Math.round(x0 * scaleX * 100) / 100;
  const pdfY = Math.round((pageH - y1 * scaleY) * 100) / 100;
  const pdfW = Math.round((x1 - x0) * scaleX * 100) / 100;
  const pdfH = Math.round((y1 - y0) * scaleY * 100) / 100;

  const rawBaselinePx =
    params.baselineY0Px !== undefined && params.baselineY1Px !== undefined
      ? (params.baselineY0Px + params.baselineY1Px) / 2
      : y1 - Math.max(1, (y1 - y0) * 0.15);

  const baselineY = Math.round((pageH - rawBaselinePx * scaleY) * 100) / 100;

  return {
    imageBboxPx: {
      x0,
      y0,
      x1,
      y1,
      width: x1 - x0,
      height: y1 - y0,
    },
    pdfBboxPt: {
      x: pdfX,
      y: pdfY,
      width: pdfW,
      height: pdfH,
      baselineY,
    },
  };
}

/**
 * Computes horizontal vs. vertical ink projection variance and bounding-box aspect ratio
 * on a grayscale image to detect whether text lines are oriented horizontally (`0°` / `180°`)
 * or vertically (`90°` / `270°`).
 */
function analyzeTextLineAxisOrientation(
  grayPixels: Uint8Array,
  width: number,
  height: number
): 'horizontal' | 'vertical' | 'empty' {
  const rowInk = new Int32Array(height);
  const colInk = new Int32Array(width);
  let totalInk = 0;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    const rOff = y * width;
    for (let x = 0; x < width; x++) {
      if (grayPixels[rOff + x] < 170) {
        rowInk[y]++;
        colInk[x]++;
        totalInk++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (totalInk < 15) return 'empty';

  const inkSpanW = Math.max(1, maxX - minX + 1);
  const inkSpanH = Math.max(1, maxY - minY + 1);

  // If the ink bounding box is significantly taller than wide (e.g., rotated single-line or vertical block),
  // flag as vertical so 90°/270° probing is evaluated
  if (inkSpanH > inkSpanW * 1.35) {
    return 'vertical';
  }

  const computeUnnormalizedPeakRatio = (arr: Int32Array): number => {
    const len = arr.length;
    if (len === 0) return 0;
    let zeroBins = 0;
    let maxBin = 0;
    for (let i = 0; i < len; i++) {
      if (arr[i] === 0) zeroBins++;
      if (arr[i] > maxBin) maxBin = arr[i];
    }
    return (zeroBins / len) * maxBin;
  };

  const rowPeakScore = computeUnnormalizedPeakRatio(rowInk);
  const colPeakScore = computeUnnormalizedPeakRatio(colInk);

  if (colPeakScore > rowPeakScore * 1.25) {
    return 'vertical';
  }
  return 'horizontal';
}

/**
 * Runs Tesseract.js recognition on a raster image (`rawPixels` or `encodedBytes`) with optional
 * 90°/180°/270° automatic orientation detection & recovery when `detectOrientation: true`.
 */
async function recognizeImageWithOrientationAndStructure(params: {
  worker: any;
  rawImage: RawPixelImageBuffer | null;
  fallbackEncodedBytes: Uint8Array;
  preprocessOptions: OcrPreprocessorOptions;
  detectOrientation: boolean;
  pageWidthPt: number;
  pageHeightPt: number;
  lowConfidenceThreshold: number;
  signal?: AbortSignal;
}): Promise<{
  text: string;
  confidence: number;
  blocks: OcrBlockRecord[];
  lines: OcrLineRecord[];
  words: OcrWordRecord[];
  lowConfidenceWordCount: number;
  imageWidthPx: number;
  imageHeightPx: number;
  effectivePageWidthPt: number;
  effectivePageHeightPt: number;
  preprocessing: OcrPreprocessingDiagnostics;
}> {
  const {
    worker,
    rawImage,
    fallbackEncodedBytes,
    preprocessOptions,
    detectOrientation,
    lowConfidenceThreshold,
    signal,
  } = params;

  if (signal?.aborted) {
    throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR recognition was cancelled.');
  }

  const runTesseractOnBytes = async (imgBytes: Uint8Array) => {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR recognition was cancelled.');
    }
    const res = await worker.recognize(
      imgBytes,
      { rotateAuto: false },
      { text: true, blocks: true }
    );
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR recognition was cancelled.');
    }
    return res?.data || { text: '', confidence: 0, blocks: [] };
  };

  const scoreCandidate = (d: any): number => {
    const rawStr = String(d?.text || '').trim();
    const alphaNum = rawStr.replace(/[^A-Za-z0-9\u00C0-\u024F]/g, '');
    const noiseChars = rawStr.replace(/[A-Za-z0-9\u00C0-\u024F\s.,:;!?'"()-]/g, '');
    const conf = Number(d?.confidence) || 0;
    if (alphaNum.length === 0) return 0;
    const purityRatio = alphaNum.length / Math.max(1, alphaNum.length + noiseChars.length * 2);
    return conf * purityRatio + Math.min(35, alphaNum.length * 1.5);
  };

  let bestData: any;
  let bestPrep: ReturnType<typeof preprocessImageForOcrV2>;
  let chosenRotation: 0 | 90 | 180 | 270 = preprocessOptions.forceRotationDegrees || 0;

  if (rawImage) {
    // Check raw axis orientation before deskewing so a vertical (90°/270° rotated) page is never distorted by horizontal deskew
    const rawAxis = analyzeTextLineAxisOrientation(
      rawImage.pixels,
      rawImage.width,
      rawImage.height
    );
    bestPrep = preprocessImageForOcrV2(
      rawImage,
      rawAxis === 'vertical' ? { ...preprocessOptions, deskew: false } : preprocessOptions
    );
    const axis =
      rawAxis === 'vertical'
        ? 'vertical'
        : analyzeTextLineAxisOrientation(
            bestPrep.processedImage.pixels,
            bestPrep.processedImage.width,
            bestPrep.processedImage.height
          );

    if (axis === 'empty') {
      // Fast-path for blank/no-text image while still verifying with Tesseract
      bestData = await runTesseractOnBytes(bestPrep.pngBytes);
    } else if (detectOrientation && !preprocessOptions.forceRotationDegrees && axis === 'vertical') {
      // Text lines are vertical (rotated 90° or 270°). Probe 0°, 90° CW, and 270° CW (90° CCW) and pick highest quality
      const data0 = await runTesseractOnBytes(bestPrep.pngBytes);

      const prep90 = preprocessImageForOcrV2(rawImage, {
        ...preprocessOptions,
        forceRotationDegrees: 90,
        deskew: false,
      });
      const data90 = await runTesseractOnBytes(prep90.pngBytes);

      const prep270 = preprocessImageForOcrV2(rawImage, {
        ...preprocessOptions,
        forceRotationDegrees: 270,
        deskew: false,
      });
      const data270 = await runTesseractOnBytes(prep270.pngBytes);

      const s0 = scoreCandidate(data0);
      const s90 = scoreCandidate(data90);
      const s270 = scoreCandidate(data270);

      if (s270 >= s90 && s270 > s0 + 5) {
        bestPrep = prep270;
        bestData = data270;
        chosenRotation = 270;
      } else if (s90 > s270 && s90 > s0 + 5) {
        bestPrep = prep90;
        bestData = data90;
        chosenRotation = 90;
      } else {
        bestData = data0;
        chosenRotation = 0;
      }
    } else {
      bestData = await runTesseractOnBytes(bestPrep.pngBytes);

      // If detectOrientation is enabled and 0° recognition has weak confidence (< 68) or high noise,
      // probe 180° (upside-down scan) and 90°/270°
      if (
        detectOrientation &&
        !preprocessOptions.forceRotationDegrees &&
        scoreCandidate(bestData) < 68
      ) {
        const prep180 = preprocessImageForOcrV2(rawImage, {
          ...preprocessOptions,
          forceRotationDegrees: 180,
          deskew: false,
        });
        const data180 = await runTesseractOnBytes(prep180.pngBytes);

        if (scoreCandidate(data180) > scoreCandidate(bestData) + 8) {
          bestPrep = prep180;
          bestData = data180;
          chosenRotation = 180;
        }

        if (scoreCandidate(bestData) < 60) {
          const prep270 = preprocessImageForOcrV2(rawImage, {
            ...preprocessOptions,
            forceRotationDegrees: 270,
            deskew: false,
          });
          const data270 = await runTesseractOnBytes(prep270.pngBytes);
          if (scoreCandidate(data270) > scoreCandidate(bestData) + 8) {
            bestPrep = prep270;
            bestData = data270;
            chosenRotation = 270;
          }

          const prep90 = preprocessImageForOcrV2(rawImage, {
            ...preprocessOptions,
            forceRotationDegrees: 90,
            deskew: false,
          });
          const data90 = await runTesseractOnBytes(prep90.pngBytes);
          if (scoreCandidate(data90) > scoreCandidate(bestData) + 8) {
            bestPrep = prep90;
            bestData = data90;
            chosenRotation = 90;
          }
        }
      }
    }
  } else {
    // Fallback when raw pixels could not be pre-decoded (e.g., direct external JPEG passed directly to Leptonica)
    const header = inspectRasterImageHeader(fallbackEncodedBytes);
    const imgW = header.width || 612;
    const imgH = header.height || 792;
    bestData = await runTesseractOnBytes(fallbackEncodedBytes);
    bestPrep = {
      processedImage: {
        width: imgW,
        height: imgH,
        channels: 1,
        pixels: new Uint8Array(0),
      },
      pngBytes: fallbackEncodedBytes,
      diagnostics: {
        applied: false,
        grayscaleConverted: false,
        denoised: false,
        contrastStretched: false,
        percentileLow: 0,
        percentileHigh: 255,
        thresholdMode: 'none',
        detectedOrientationDegrees: 0,
        detectedSkewAngleDegrees: 0,
        tesseractRotateRadians: Number(bestData?.rotateRadians) || 0,
      },
    };
  }

  ocrWorkerPoolV2.recordPageRecognized();

  const imageWidthPx = bestPrep.processedImage.width;
  const imageHeightPx = bestPrep.processedImage.height;
  const swappedAxes = chosenRotation === 90 || chosenRotation === 270;
  const effectivePageWidthPt = swappedAxes ? params.pageHeightPt : params.pageWidthPt;
  const effectivePageHeightPt = swappedAxes ? params.pageWidthPt : params.pageHeightPt;

  bestPrep.diagnostics.detectedOrientationDegrees = chosenRotation;
  bestPrep.diagnostics.tesseractRotateRadians =
    Math.round((Number(bestData?.rotateRadians) || 0) * 10000) / 10000;

  // Extract structured blocks -> lines -> words and sort in top-to-bottom, left-to-right reading order
  const rawBlocks: any[] = Array.isArray(bestData?.blocks) ? bestData.blocks : [];

  // Sort raw blocks top-to-bottom (y0), then left-to-right (x0)
  const sortedRawBlocks = [...rawBlocks].sort((a, b) => {
    const ay = Number(a?.bbox?.y0) || 0;
    const by = Number(b?.bbox?.y0) || 0;
    if (Math.abs(ay - by) > 10) return ay - by;
    return (Number(a?.bbox?.x0) || 0) - (Number(b?.bbox?.x0) || 0);
  });

  const blocks: OcrBlockRecord[] = [];
  const allLines: OcrLineRecord[] = [];
  const allWords: OcrWordRecord[] = [];
  let lowConfidenceWordCount = 0;
  let globalBlockIdx = 0;
  let globalLineIdx = 0;
  let globalWordIdx = 0;

  for (const rawBlock of sortedRawBlocks) {
    const paragraphs: any[] = Array.isArray(rawBlock?.paragraphs) ? rawBlock.paragraphs : [];
    const blockRawLines: any[] = paragraphs.flatMap((p) => (Array.isArray(p?.lines) ? p.lines : []));

    // Sort lines top-to-bottom (y0), then left-to-right (x0)
    blockRawLines.sort((a, b) => {
      const ay = Number(a?.bbox?.y0) || 0;
      const by = Number(b?.bbox?.y0) || 0;
      if (Math.abs(ay - by) > 6) return ay - by;
      return (Number(a?.bbox?.x0) || 0) - (Number(b?.bbox?.x0) || 0);
    });

    const blockLines: OcrLineRecord[] = [];

    for (const rawLine of blockRawLines) {
      const rawWords: any[] = Array.isArray(rawLine?.words) ? rawLine.words : [];
      // Sort words left-to-right (x0) within the line
      rawWords.sort((a, b) => (Number(a?.bbox?.x0) || 0) - (Number(b?.bbox?.x0) || 0));

      const lineWords: OcrWordRecord[] = [];
      for (const rw of rawWords) {
        const wText = String(rw?.text ?? '').trim();
        if (wText.length === 0) continue;

        const wConf = Math.max(0, Math.min(100, Math.round((Number(rw?.confidence) || 0) * 100) / 100));
        const isLow = wConf < lowConfidenceThreshold;
        if (isLow) lowConfidenceWordCount++;

        const mappedWord = mapImageBboxToPdfCoordinates({
          bboxPx: {
            x0: Number(rw?.bbox?.x0) || 0,
            y0: Number(rw?.bbox?.y0) || 0,
            x1: Number(rw?.bbox?.x1) || 0,
            y1: Number(rw?.bbox?.y1) || 0,
          },
          baselineY0Px: rw?.baseline?.y0 !== undefined ? Number(rw.baseline.y0) : undefined,
          baselineY1Px: rw?.baseline?.y1 !== undefined ? Number(rw.baseline.y1) : undefined,
          imageWidthPx,
          imageHeightPx,
          pageWidthPt: effectivePageWidthPt,
          pageHeightPt: effectivePageHeightPt,
        });

        const wordRec: OcrWordRecord = {
          text: wText,
          confidence: wConf,
          isLowConfidence: isLow,
          readingOrderIndex: ++globalWordIdx,
          imageBboxPx: mappedWord.imageBboxPx,
          pdfBboxPt: mappedWord.pdfBboxPt,
        };
        lineWords.push(wordRec);
        allWords.push(wordRec);
      }

      if (lineWords.length === 0) continue;

      const lineText = lineWords.map((w) => w.text).join(' ');
      const lineConf =
        rawLine?.confidence !== undefined
          ? Math.max(0, Math.min(100, Math.round((Number(rawLine.confidence) || 0) * 100) / 100))
          : Math.round(
              (lineWords.reduce((acc, w) => acc + w.confidence, 0) / lineWords.length) * 100
            ) / 100;

      const mappedLine = mapImageBboxToPdfCoordinates({
        bboxPx: {
          x0: Number(rawLine?.bbox?.x0 ?? lineWords[0].imageBboxPx.x0),
          y0: Number(rawLine?.bbox?.y0 ?? Math.min(...lineWords.map((w) => w.imageBboxPx.y0))),
          x1: Number(rawLine?.bbox?.x1 ?? lineWords[lineWords.length - 1].imageBboxPx.x1),
          y1: Number(rawLine?.bbox?.y1 ?? Math.max(...lineWords.map((w) => w.imageBboxPx.y1))),
        },
        baselineY0Px: rawLine?.baseline?.y0 !== undefined ? Number(rawLine.baseline.y0) : undefined,
        baselineY1Px: rawLine?.baseline?.y1 !== undefined ? Number(rawLine.baseline.y1) : undefined,
        imageWidthPx,
        imageHeightPx,
        pageWidthPt: effectivePageWidthPt,
        pageHeightPt: effectivePageHeightPt,
      });

      const lineRec: OcrLineRecord = {
        text: lineText,
        confidence: lineConf,
        readingOrderIndex: ++globalLineIdx,
        imageBboxPx: mappedLine.imageBboxPx,
        pdfBboxPt: mappedLine.pdfBboxPt,
        words: lineWords,
      };
      blockLines.push(lineRec);
      allLines.push(lineRec);
    }

    if (blockLines.length === 0) continue;

    const blockText = blockLines.map((l) => l.text).join('\n');
    const blockConf =
      rawBlock?.confidence !== undefined
        ? Math.max(0, Math.min(100, Math.round((Number(rawBlock.confidence) || 0) * 100) / 100))
        : Math.round(
            (blockLines.reduce((acc, l) => acc + l.confidence, 0) / blockLines.length) * 100
          ) / 100;

    const mappedBlock = mapImageBboxToPdfCoordinates({
      bboxPx: {
        x0: Number(rawBlock?.bbox?.x0 ?? Math.min(...blockLines.map((l) => l.imageBboxPx.x0))),
        y0: Number(rawBlock?.bbox?.y0 ?? Math.min(...blockLines.map((l) => l.imageBboxPx.y0))),
        x1: Number(rawBlock?.bbox?.x1 ?? Math.max(...blockLines.map((l) => l.imageBboxPx.x1))),
        y1: Number(rawBlock?.bbox?.y1 ?? Math.max(...blockLines.map((l) => l.imageBboxPx.y1))),
      },
      imageWidthPx,
      imageHeightPx,
      pageWidthPt: effectivePageWidthPt,
      pageHeightPt: effectivePageHeightPt,
    });

    blocks.push({
      text: blockText,
      confidence: blockConf,
      blockType: String(rawBlock?.blocktype || 'TEXT'),
      readingOrderIndex: ++globalBlockIdx,
      imageBboxPx: mappedBlock.imageBboxPx,
      pdfBboxPt: mappedBlock.pdfBboxPt,
      lines: blockLines,
    });
  }

  const orderedText =
    allLines.length > 0
      ? allLines.map((l) => l.text).join('\n')
      : String(bestData?.text || '').trim();

  const pageConfidence =
    allWords.length > 0
      ? Math.round(
          (allWords.reduce((acc, w) => acc + w.confidence, 0) / allWords.length) * 100
        ) / 100
      : 0;

  return {
    text: orderedText,
    confidence: pageConfidence,
    blocks,
    lines: allLines,
    words: allWords,
    lowConfidenceWordCount,
    imageWidthPx,
    imageHeightPx,
    effectivePageWidthPt,
    effectivePageHeightPt,
    preprocessing: bestPrep.diagnostics,
  };
}

/**
 * ============================================================================
 * 6. PDF PAGE RASTER EXTRACTION & INVISIBLE SEARCHABLE TEXT LAYER OVERLAY
 * ============================================================================
 */

function collectPageImageXObjects(
  resourcesDict: PDFDict | undefined,
  context: PDFDocument['context'],
  visited: Set<string>,
  out: Array<{ name: string; stream: PDFRawStream }>
): void {
  if (!resourcesDict) return;
  const xObjDict = resourcesDict.lookup(PDFName.of('XObject'));
  if (!(xObjDict instanceof PDFDict)) return;

  for (const [k, v] of xObjDict.entries()) {
    const refKey = v instanceof PDFRef ? v.toString() : k.asString();
    const resolved = v instanceof PDFRef ? context.lookup(v) : v;
    if (!(resolved instanceof PDFRawStream)) continue;

    const subtype = resolved.dict.lookup(PDFName.of('Subtype'));
    if (!(subtype instanceof PDFName)) continue;

    if (subtype.asString() === '/Image' && !visited.has(refKey)) {
      visited.add(refKey);
      out.push({ name: k.asString().replace(/^\//, ''), stream: resolved });
    } else if (subtype.asString() === '/Form' && !visited.has(`form:${refKey}`)) {
      visited.add(`form:${refKey}`);
      const formRes = resolved.dict.lookup(PDFName.of('Resources'));
      if (formRes instanceof PDFDict) {
        collectPageImageXObjects(formRes, context, visited, out);
      }
    }
  }
}

/**
 * Extracts or renders a PDF page into a raster image for Tesseract.js OCR:
 * 1. In Browser DOM environments (`typeof document !== 'undefined'`), renders the PDF page via PDF.js
 *    onto an HTMLCanvasElement at the requested `dpi` (capturing all embedded scans, rotations, and graphics),
 *    and extracts the exact raw RGBA pixel buffer via `ctx.getImageData(0, 0, widthPx, heightPx)`.
 * 2. In Headless / Node environments (or when direct embedded scan XObject extraction is used), inspects the
 *    page's `/Resources -> /XObject` dictionary for embedded `/FlateDecode` or `/DCTDecode` scan images,
 *    decodes the raw pixel buffer, and applies the page's `/Rotate` metadata (`0°`, `90°`, `180°`, `270°`)
 *    so the raster image matches the visual orientation of the PDF page.
 */
async function extractPdfPageRasterForOcr(params: {
  pdfLibPage: PDFPage;
  pdfLibDoc: PDFDocument;
  pdfJsPage: any;
  dpi: number;
}): Promise<{
  rawImage: RawPixelImageBuffer | null;
  encodedBytes: Uint8Array;
  widthPt: number;
  heightPt: number;
  pageRotationDegrees: number;
}> {
  const { pdfLibPage, pdfLibDoc, pdfJsPage, dpi } = params;
  const scale = dpi / 72;
  const viewport1x = pdfJsPage.getViewport({ scale: 1.0 });
  const widthPt = Math.round(viewport1x.width * 100) / 100;
  const heightPt = Math.round(viewport1x.height * 100) / 100;
  const pageRotationDegrees = (((Number(pdfJsPage.rotate) || 0) % 360) + 360) % 360;

  // 1. Browser DOM Canvas Path
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const vpScaled = pdfJsPage.getViewport({ scale });
    const wPx = Math.max(1, Math.round(vpScaled.width));
    const hPx = Math.max(1, Math.round(vpScaled.height));
    const canvas = document.createElement('canvas');
    canvas.width = wPx;
    canvas.height = hPx;
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, wPx, hPx);
        await pdfJsPage.render({ canvasContext: ctx, canvas, viewport: vpScaled }).promise;
        const imgData = ctx.getImageData(0, 0, wPx, hPx);
        const rgba = new Uint8Array(imgData.data.buffer, imgData.data.byteOffset, imgData.data.byteLength);
        const rawImage: RawPixelImageBuffer = {
          width: wPx,
          height: hPx,
          channels: 4,
          pixels: new Uint8Array(rgba),
        };
        const pngBytes = encodeRawPixelsToPng({
          width: wPx,
          height: hPx,
          channels: 4,
          pixels: rawImage.pixels,
        });
        return {
          rawImage,
          encodedBytes: pngBytes,
          widthPt,
          heightPt,
          pageRotationDegrees,
        };
      }
    } catch {
      // Fall through to XObject inspection path
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  // 2. Embedded Scan Image XObject Extraction Path (works identically in Browser & Headless Node CLI)
  const resources = pdfLibPage.node.Resources();
  const xObjects: Array<{ name: string; stream: PDFRawStream }> = [];
  collectPageImageXObjects(resources, pdfLibDoc.context, new Set<string>(), xObjects);

  // Pick the largest embedded Image XObject on the page (the primary scanned page bitmap)
  let bestXObj: { stream: PDFRawStream; widthPx: number; heightPx: number; filterName: string } | null = null;
  for (const xObj of xObjects) {
    const dict = xObj.stream.dict;
    const wObj = dict.lookup(PDFName.of('Width'));
    const hObj = dict.lookup(PDFName.of('Height'));
    const wPx = wObj instanceof PDFNumber ? wObj.asNumber() : 0;
    const hPx = hObj instanceof PDFNumber ? hObj.asNumber() : 0;
    if (wPx <= 0 || hPx <= 0) continue;

    const filterObj = dict.lookup(PDFName.of('Filter'));
    let filterName = 'Uncompressed';
    if (filterObj instanceof PDFName) {
      filterName = filterObj.asString();
    } else if (filterObj instanceof PDFArray && filterObj.size() > 0) {
      const last = filterObj.lookup(filterObj.size() - 1);
      if (last instanceof PDFName) filterName = last.asString();
    }

    if (!bestXObj || wPx * hPx > bestXObj.widthPx * bestXObj.heightPx) {
      bestXObj = { stream: xObj.stream, widthPx: wPx, heightPx: hPx, filterName };
    }
  }

  if (bestXObj) {
    const { stream, widthPx, heightPx, filterName } = bestXObj;
    const dict = stream.dict;

    if (filterName === '/DCTDecode') {
      const jpegBytes = cloneIsolatedPdfBytes(stream.contents);
      return {
        rawImage: null,
        encodedBytes: jpegBytes,
        widthPt,
        heightPt,
        pageRotationDegrees,
      };
    }

    if (filterName === '/FlateDecode' || filterName === 'Uncompressed') {
      try {
        const decoded = cloneIsolatedPdfBytes(decodePDFRawStream(stream).decode());
        const csObj = dict.lookup(PDFName.of('ColorSpace'));
        const resolvedCs = csObj instanceof PDFRef ? pdfLibDoc.context.lookup(csObj) : csObj;
        let channels: 1 | 3 | 4 = 3;
        if (resolvedCs instanceof PDFName) {
          const csName = resolvedCs.asString();
          if (csName === '/DeviceGray' || csName === '/CalGray') channels = 1;
          else if (csName === '/DeviceCMYK') channels = 4;
        }

        const rowBytes = widthPx * channels;
        const stride = rowBytes + 1;
        let rawPixels: Uint8Array | null = null;

        if (decoded.byteLength === rowBytes * heightPx) {
          rawPixels = decoded;
        } else if (decoded.byteLength >= stride * heightPx) {
          // Unfilter PNG predictor scanlines
          rawPixels = new Uint8Array(rowBytes * heightPx);
          const paeth = (a: number, b: number, c: number): number => {
            const p = a + b - c;
            const pa = Math.abs(p - a);
            const pb = Math.abs(p - b);
            const pc = Math.abs(p - c);
            if (pa <= pb && pa <= pc) return a;
            if (pb <= pc) return b;
            return c;
          };
          for (let y = 0; y < heightPx; y++) {
            const srcRow = y * stride;
            const fType = decoded[srcRow];
            const dstRow = y * rowBytes;
            const prevRow = (y - 1) * rowBytes;
            for (let x = 0; x < rowBytes; x++) {
              const raw = decoded[srcRow + 1 + x];
              const left = x >= channels ? rawPixels[dstRow + x - channels] : 0;
              const up = y > 0 ? rawPixels[prevRow + x] : 0;
              const upLeft = y > 0 && x >= channels ? rawPixels[prevRow + x - channels] : 0;
              let val = raw;
              if (fType === 1) val = (raw + left) & 0xff;
              else if (fType === 2) val = (raw + up) & 0xff;
              else if (fType === 3) val = (raw + ((left + up) >> 1)) & 0xff;
              else if (fType === 4) val = (raw + paeth(left, up, upLeft)) & 0xff;
              rawPixels[dstRow + x] = val;
            }
          }
        }

        if (rawPixels) {
          let rawImg: RawPixelImageBuffer = {
            width: widthPx,
            height: heightPx,
            channels,
            pixels: rawPixels,
          };

          // Apply PDF page /Rotate attribute (90, 180, 270) so the bitmap matches the page's visual orientation
          if (
            pageRotationDegrees === 90 ||
            pageRotationDegrees === 180 ||
            pageRotationDegrees === 270
          ) {
            rawImg = rotatePixelBuffer90_180_270(rawImg, pageRotationDegrees);
          }

          const pngBytes = encodeRawPixelsToPng({
            width: rawImg.width,
            height: rawImg.height,
            channels: rawImg.channels,
            pixels: rawImg.pixels,
          });

          return {
            rawImage: rawImg,
            encodedBytes: pngBytes,
            widthPt,
            heightPt,
            pageRotationDegrees,
          };
        }
      } catch {
        // Fall through to blank fallback
      }
    }
  }

  // 3. Blank page fallback (page has 0 embedded raster images and no DOM canvas)
  const fallbackW = Math.max(64, Math.round(widthPt));
  const fallbackH = Math.max(64, Math.round(heightPt));
  const whitePixels = new Uint8Array(fallbackW * fallbackH);
  whitePixels.fill(255);
  const blankImg: RawPixelImageBuffer = {
    width: fallbackW,
    height: fallbackH,
    channels: 1,
    pixels: whitePixels,
  };
  const pngBytes = encodeRawPixelsToPng({
    width: fallbackW,
    height: fallbackH,
    channels: 1,
    pixels: whitePixels,
  });

  return {
    rawImage: blankImg,
    encodedBytes: pngBytes,
    widthPt,
    heightPt,
    pageRotationDegrees,
  };
}

/**
 * Sanitizes a recognized Unicode word string for safe embedding in a StandardFont (Helvetica WinAnsi)
 * invisible text layer, preserving Latin-1 characters (`0x20..0x7E`, `0xA0..0xFF`) and replacing
 * unsupported glyphs with safe ASCII equivalents so `@cantoo/pdf-lib` never throws an encoding error.
 */
function sanitizeForWinAnsiInvisibleLayer(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      out += text[i];
    } else if (code === 0x2018 || code === 0x2019) {
      out += "'";
    } else if (code === 0x201c || code === 0x201d) {
      out += '"';
    } else if (code === 0x2013 || code === 0x2014) {
      out += '-';
    }
  }
  return out;
}

/**
 * Overlays an invisible (`opacity: 0`), selectable, searchable text layer onto a PDF page
 * at the exact mapped `pdfBboxPt` coordinates of each recognized OCR word.
 *
 * Because `opacity: 0` emits `ca 0` in the PDF graphics state while preserving standard
 * `BT ... Tf ... Td ... Tj ET` text operators:
 * 1. The original visual appearance of the scanned page is 100% unaltered.
 * 2. PDF.js (`page.getTextContent()`), Adobe Acrobat, Chrome PDF Viewer, and macOS Preview
 *    can select, copy, and search every recognized word at its exact spatial location.
 */
function overlayInvisibleOcrTextOnPdfPage(params: {
  page: PDFPage;
  words: OcrWordRecord[];
  font: any;
}): number {
  const { page, words, font } = params;
  let overlaidCount = 0;

  for (const word of words) {
    const cleanText = sanitizeForWinAnsiInvisibleLayer(word.text);
    if (!cleanText || cleanText.trim().length === 0) continue;

    const { x, width, height, baselineY } = word.pdfBboxPt;
    const rawHeight = Math.max(4, height);

    let fittedFontSize = rawHeight * 0.9;
    try {
      const naturalW = font.widthOfTextAtSize(cleanText, rawHeight);
      if (naturalW > 0 && width > 0) {
        const widthScaledSize = (width / naturalW) * rawHeight;
        fittedFontSize = Math.max(3, Math.min(rawHeight * 1.15, widthScaledSize));
      }
    } catch {
      fittedFontSize = Math.max(4, rawHeight * 0.85);
    }

    try {
      page.drawText(cleanText, {
        x: Math.max(0, x),
        y: Math.max(0, baselineY),
        size: Math.round(fittedFontSize * 100) / 100,
        font,
        color: rgb(0, 0, 0),
        opacity: 0,
      });
      overlaidCount++;
    } catch {
      // Ignore individual word draw errors
    }
  }

  return overlaidCount;
}

/**
 * ============================================================================
 * 7. PRIMARY OCR OPERATIONS (`performPdfOcrV2`, `performImageOcrV2`)
 * ============================================================================
 */

function stripFileExtension(fileName: string): string {
  const clean = (fileName || 'document').trim();
  const lastDot = clean.lastIndexOf('.');
  return lastDot > 0 ? clean.slice(0, lastDot) : clean;
}

function buildFailureResult(
  resolvedCanonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytes: number,
  warnings: string[] = []
): PdfOperationResult {
  return {
    status: error.status,
    resolvedCanonicalId,
    outputFiles: [],
    summary: error.message,
    metrics: {
      inputBytes,
      outputBytes: 0,
      durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
    },
    warnings,
    limitations: [OCR_OFFLINE_AND_LANGUAGE_DISCLOSURE],
    error,
  };
}

function coerceSelectionInput(
  optSel?: PdfPageSelection | number[] | string,
  reqSel?: PdfPageSelection
): PdfPageSelection | undefined {
  if (optSel !== undefined) {
    if (Array.isArray(optSel)) {
      return { mode: 'indices', indices: optSel };
    }
    if (typeof optSel === 'string') {
      const lower = optSel.trim().toLowerCase();
      if (['all', 'odd', 'even', 'portrait', 'landscape'].includes(lower)) {
        return { mode: 'preset', preset: lower as PdfPageSelection['preset'] };
      }
      return { mode: 'range-string', rangeExpression: optSel };
    }
    return optSel;
  }
  return reqSel;
}

/**
 * Performs browser-local OCR on 1 or more PNG/JPEG images (`performImageOcrV2`) or when image files
 * are passed to `performPdfOcrV2` / `executeOcrOperationV2`.
 * - Extracts structured OCR text, blocks, lines, words, confidence scores, and bounding boxes.
 * - Generates a Searchable PDF where each original PNG/JPEG image is embedded on a PDF page with an
 *   invisible selectable OCR text layer overlaid at exact coordinates, plus a `.txt` transcript.
 */
export async function performImageOcrV2(
  inputs: PdfDocumentInput | PdfDocumentInput[],
  options: PdfOcrOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-ocr';
  const inputList = Array.isArray(inputs) ? inputs : [inputs];
  const totalInputBytes = inputList.reduce((acc, f) => acc + inspectByteLength(f?.bytes), 0);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR operation was cancelled before execution.'),
      startTime,
      totalInputBytes
    );
  }

  if (inputList.length === 0 || !inputList[0]?.bytes || inspectByteLength(inputList[0].bytes) === 0) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'At least one non-empty PNG or JPEG image is required for OCR.'),
      startTime,
      totalInputBytes
    );
  }

  // 1. Validate language selection (never silently substitute!)
  const langCheck = validateAndNormalizeOcrLanguagesV2(options.language);
  if (!langCheck.isValid || langCheck.error) {
    return buildFailureResult(canonicalId, langCheck.error!, startTime, totalInputBytes);
  }

  const dpi = options.dpi !== undefined ? Number(options.dpi) : 150;
  if (!Number.isFinite(dpi) || dpi < 36 || dpi > 600) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_INVALID_DIMENSIONS', 'OCR resolution (DPI) must be between 36 and 600.'),
      startTime,
      totalInputBytes
    );
  }

  const outputMode = options.outputMode || 'searchable-pdf-and-text';
  const lowConfidenceThreshold =
    options.lowConfidenceThreshold !== undefined ? Number(options.lowConfidenceThreshold) : 60;
  const detectOrientation = options.detectOrientation !== false;

  // 2. Validate all input image headers before acquiring worker
  const validatedImages: Array<{
    fileName: string;
    isolatedBytes: Uint8Array;
    format: 'png' | 'jpeg';
    widthPx: number;
    heightPx: number;
    rawImage: RawPixelImageBuffer | null;
  }> = [];

  for (const inp of inputList) {
    const bytes = cloneIsolatedPdfBytes(inp.bytes);
    const header = inspectRasterImageHeader(bytes);
    if (!header.isValid || !header.format || !header.width || !header.height) {
      for (const prev of validatedImages) wipeInternalBuffer(prev.isolatedBytes);
      wipeInternalBuffer(bytes);
      return buildFailureResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_UNSUPPORTED_IMAGE_FORMAT',
          `Invalid or unsupported image file "${inp.fileName}": ${header.errorReason || 'Expected valid PNG or JPEG magic bytes.'}`
        ),
        startTime,
        totalInputBytes
      );
    }

    const rawImage = header.format === 'png' ? decodePngToRawPixels(bytes) : null;
    validatedImages.push({
      fileName: inp.fileName || 'image.png',
      isolatedBytes: bytes,
      format: header.format,
      widthPx: header.width,
      heightPx: header.height,
      rawImage,
    });
  }

  request?.onProgress?.({
    percent: 10,
    stage: 'LOADING',
    message: `Initializing Tesseract.js OCR worker (${langCheck.combinedLangString})...`,
  });

  let workerLease: Awaited<ReturnType<typeof ocrWorkerPoolV2.acquireWorker>> | null = null;
  try {
    workerLease = await ocrWorkerPoolV2.acquireWorker({
      langString: langCheck.combinedLangString,
      langPath: options.langPath,
      cachePath: options.cachePath,
      cacheMethod: options.cacheMethod,
      signal,
    });

    const outDoc = outputMode !== 'text-only' ? await PDFDocument.create() : null;
    const helveticaFont = outDoc ? await outDoc.embedFont(StandardFonts.Helvetica) : null;

    const pageRecords: OcrPageRecord[] = [];
    let totalWords = 0;
    let totalLowConfWords = 0;
    let totalChars = 0;
    let weightedConfSum = 0;

    for (let idx = 0; idx < validatedImages.length; idx++) {
      if (signal?.aborted) {
        throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR operation was cancelled.');
      }

      const img = validatedImages[idx];
      const pageNumber = idx + 1;
      const baseWidthPt = Math.round(((img.widthPx * 72) / dpi) * 100) / 100;
      const baseHeightPt = Math.round(((img.heightPx * 72) / dpi) * 100) / 100;

      request?.onProgress?.({
        percent: Math.round(15 + ((idx + 1) / validatedImages.length) * 70),
        stage: 'RUNNING_OCR',
        message: `Running OCR (${langCheck.combinedLangString}) on image ${pageNumber} of ${validatedImages.length}...`,
        currentPage: pageNumber,
        totalPages: validatedImages.length,
      });

      const rec = await recognizeImageWithOrientationAndStructure({
        worker: workerLease.worker,
        rawImage: img.rawImage,
        fallbackEncodedBytes: img.isolatedBytes,
        preprocessOptions: options.preprocessing || {},
        detectOrientation,
        pageWidthPt: baseWidthPt,
        pageHeightPt: baseHeightPt,
        lowConfidenceThreshold,
        signal,
      });

      const wordCount = rec.words.length;
      const charCount = rec.text.length;
      totalWords += wordCount;
      totalLowConfWords += rec.lowConfidenceWordCount;
      totalChars += charCount;
      weightedConfSum += rec.confidence * Math.max(1, wordCount);

      pageRecords.push({
        pageNumber,
        sourceKind: 'raster-image',
        extractionSource: 'tesseract-ocr',
        widthPt: rec.effectivePageWidthPt,
        heightPt: rec.effectivePageHeightPt,
        originalRotationDegrees: 0,
        effectiveRotationDegrees: rec.preprocessing.detectedOrientationDegrees,
        imageWidthPx: rec.imageWidthPx,
        imageHeightPx: rec.imageHeightPx,
        text: rec.text,
        confidence: rec.confidence,
        wordCount,
        lowConfidenceWordCount: rec.lowConfidenceWordCount,
        characterCount: charCount,
        hasRecognizedText: wordCount > 0,
        preprocessing: rec.preprocessing,
        blocks: rec.blocks,
        lines: rec.lines,
        words: rec.words,
      });

      if (outDoc && helveticaFont) {
        // If orientation correction rotated the image by 90/180/270 and we have rawImage, embed the upright image
        // while preserving original un-thresholded color/grayscale visual appearance!
        let imageBytesToEmbed = img.isolatedBytes;
        let embedFormat: 'png' | 'jpeg' = img.format;

        if (
          rec.preprocessing.detectedOrientationDegrees !== 0 &&
          img.rawImage &&
          options.correctPageRotationInOutputPdf !== false
        ) {
          const rotatedVisual = rotatePixelBuffer90_180_270(
            img.rawImage,
            rec.preprocessing.detectedOrientationDegrees
          );
          imageBytesToEmbed = encodeRawPixelsToPng({
            width: rotatedVisual.width,
            height: rotatedVisual.height,
            channels: rotatedVisual.channels,
            pixels: rotatedVisual.pixels,
          });
          embedFormat = 'png';
        }

        const embeddedImg =
          embedFormat === 'png'
            ? await outDoc.embedPng(imageBytesToEmbed)
            : await outDoc.embedJpg(imageBytesToEmbed);

        const pdfPage = outDoc.addPage([rec.effectivePageWidthPt, rec.effectivePageHeightPt]);
        pdfPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: rec.effectivePageWidthPt,
          height: rec.effectivePageHeightPt,
        });

        overlayInvisibleOcrTextOnPdfPage({
          page: pdfPage,
          words: rec.words,
          font: helveticaFont,
        });
      }
    }

    workerLease.release();
    workerLease = null;

    const fullText = pageRecords
      .map((p) =>
        pageRecords.length > 1 ? `--- Page ${p.pageNumber} ---\n${p.text}` : p.text
      )
      .join('\n\n');

    const meanConfidence =
      totalWords > 0
        ? Math.round((weightedConfSum / totalWords) * 100) / 100
        : 0;

    const baseName = stripFileExtension(validatedImages[0].fileName);
    const txtBytes = new TextEncoder().encode(fullText);
    const txtFile: PdfOutputFile = {
      fileName: `${baseName}_ocr.txt`,
      mimeType: 'text/plain;charset=utf-8',
      bytes: txtBytes,
      byteLength: txtBytes.byteLength,
      pageCount: validatedImages.length,
    };

    const outputFiles: PdfOutputFile[] = [];
    let primaryFile: PdfOutputFile = txtFile;

    if (outDoc) {
      request?.onProgress?.({
        percent: 92,
        stage: 'VERIFYING_OUTPUT',
        message: 'Serializing and verifying Searchable PDF output in PDF.js...',
      });

      const { bytes: pdfBytes, integrity } = await serializeAndVerifyPdfV2(
        outDoc,
        { useObjectStreams: false },
        { expectedPageCount: validatedImages.length, verifyWithPdfJs: true }
      );

      if (!integrity.isValid) {
        return buildFailureResult(
          canonicalId,
          integrity.error ??
            createPdfProcessingError(
              'ERR_OUTPUT_INTEGRITY_FAILURE',
              'Generated Searchable PDF failed independent PDF.js verification.'
            ),
          startTime,
          totalInputBytes
        );
      }

      const pdfFile: PdfOutputFile = {
        fileName: options.outputFileName || `${baseName}_searchable.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        byteLength: pdfBytes.byteLength,
        pageCount: validatedImages.length,
      };
      outputFiles.push(pdfFile);
      primaryFile = pdfFile;
    }

    if (outputMode === 'searchable-pdf-and-text' || outputMode === 'text-only') {
      outputFiles.push(txtFile);
      if (outputMode === 'text-only') {
        primaryFile = txtFile;
      }
    }

    const poolStats = ocrWorkerPoolV2.getStats();
    const warnings: string[] = [];
    if (totalWords === 0) {
      warnings.push('OCR completed cleanly, but no recognizable text was found in the provided image(s).');
    }
    if (totalLowConfWords > 0) {
      warnings.push(
        `Retained ${totalLowConfWords} low-confidence word(s) (< ${lowConfidenceThreshold}% confidence) without discarding them.`
      );
    }

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'OCR Engine', value: 'Tesseract.js 7.0.0 (WebAssembly LSTM)' },
        { label: 'Language(s)', value: langCheck.combinedLangString },
        { label: 'Images Processed', value: validatedImages.length },
        { label: 'Words Recognized', value: totalWords },
        { label: 'Mean Confidence', value: `${meanConfidence}%` },
      ],
      tableHeaders: ['Image / Page', 'Source', 'Words', 'Low-Conf Words', 'Confidence', 'Orientation / Skew'],
      tableRows: pageRecords.map((p) => [
        `Page ${p.pageNumber}`,
        p.extractionSource,
        p.wordCount,
        p.lowConfidenceWordCount,
        `${p.confidence}%`,
        `${p.effectiveRotationDegrees}° / ${p.preprocessing.detectedSkewAngleDegrees}°`,
      ]),
      rawData: {
        language: langCheck.combinedLangString,
        meanConfidence,
        totalWords,
        totalLowConfidenceWords: totalLowConfWords,
        totalCharacters: totalChars,
        workerPoolStats: poolStats,
      },
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      previewText: fullText,
      inspectionReport,
      summary: `Completed OCR (${langCheck.combinedLangString}) on ${validatedImages.length} image(s): recognized ${totalWords} word(s) (${totalChars} chars) with ${meanConfidence}% mean confidence.`,
      metrics: {
        inputBytes: totalInputBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: validatedImages.length,
        outputPageCount: validatedImages.length,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      warnings,
      limitations: [OCR_OFFLINE_AND_LANGUAGE_DISCLOSURE],
      details: {
        language: langCheck.combinedLangString,
        languageMetadata: langCheck.metadata,
        outputMode,
        dpi,
        totalWords,
        totalLowConfidenceWords: totalLowConfWords,
        totalCharacters: totalChars,
        meanConfidence,
        fullText,
        pages: pageRecords,
        workerPoolStats: poolStats,
      },
    };
  } catch (err) {
    if (workerLease) {
      await workerLease.destroyOnError();
      workerLease = null;
    }
    const procErr =
      err && typeof err === 'object' && 'code' in err && 'status' in err
        ? (err as PdfProcessingError)
        : normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildFailureResult(canonicalId, procErr, startTime, totalInputBytes);
  } finally {
    if (workerLease) {
      workerLease.release();
    }
    for (const img of validatedImages) {
      wipeInternalBuffer(img.isolatedBytes);
    }
  }
}

/**
 * Performs browser-local OCR on a PDF document (or routes PNG/JPEG image input automatically to `performImageOcrV2`):
 * - Supports single-page and multi-page scanned PDFs.
 * - Supports user-selected page ranges (`options.selection`).
 * - Clearly distinguishes native PDF vector text extraction (`native-pdf-text-layer`) from Tesseract raster OCR (`tesseract-ocr`).
 * - Reuses a single pooled Tesseract.js worker across all pages of the document.
 * - Generates a Searchable PDF overlaying an invisible (`opacity: 0`), selectable, searchable text layer over the original
 *   scanned page appearance while preserving exact page dimensions, rotation, and visual content.
 */
export async function performPdfOcrV2(
  input: PdfDocumentInput,
  options: PdfOcrOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-ocr';
  const inputByteLength = inspectByteLength(input?.bytes);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR operation was cancelled before execution.'),
      startTime,
      inputByteLength
    );
  }

  if (!input || !input.bytes || inputByteLength === 0) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'Input file is empty (0 bytes).'),
      startTime,
      0
    );
  }

  // Validate language selection upfront (never silently substitute!)
  const langCheck = validateAndNormalizeOcrLanguagesV2(options.language);
  if (!langCheck.isValid || langCheck.error) {
    return buildFailureResult(canonicalId, langCheck.error!, startTime, inputByteLength);
  }

  // Sniff magic bytes: if caller passed a PNG or JPEG image to `performPdfOcrV2`, handle via `performImageOcrV2`
  const tempClone = cloneIsolatedPdfBytes(input.bytes);
  const formatSniff = sniffFileFormat(tempClone);
  wipeInternalBuffer(tempClone);

  if (formatSniff.format === 'png' || formatSniff.format === 'jpeg') {
    return await performImageOcrV2(input, options, request);
  }

  const dpi = options.dpi !== undefined ? Number(options.dpi) : 150;
  if (!Number.isFinite(dpi) || dpi < 36 || dpi > 600) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_INVALID_DIMENSIONS', 'OCR resolution (DPI) must be between 36 and 600.'),
      startTime,
      inputByteLength
    );
  }

  // Load and validate PDF document
  const loadRes = await loadPdfDocumentV2(input, {
    password: options.password ?? input?.password,
  });

  if (!loadRes.success || !loadRes.document || !loadRes.isolatedBytes) {
    await loadRes.dispose();
    return buildFailureResult(
      canonicalId,
      loadRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF document for OCR.'),
      startTime,
      inputByteLength,
      loadRes.warnings
    );
  }

  let pdfJsSession: Awaited<ReturnType<typeof openManagedPdfDocument>> | null = null;
  let workerLease: Awaited<ReturnType<typeof ocrWorkerPoolV2.acquireWorker>> | null = null;

  try {
    const srcDoc = loadRes.document;
    const totalPages = srcDoc.getPageCount();
    const selectionObj = coerceSelectionInput(options.selection, request?.pageSelection);
    const resolvedSel = resolvePdfPageSelection(selectionObj, totalPages, { defaultToAll: true });

    if (!resolvedSel.isValid || resolvedSel.pageIndices.length === 0) {
      return buildFailureResult(
        canonicalId,
        resolvedSel.error ?? createPdfProcessingError('ERR_INVALID_PAGE_RANGE', 'Invalid page range for PDF OCR.'),
        startTime,
        inputByteLength,
        loadRes.warnings
      );
    }

    const selectedIndicesSet = new Set<number>(resolvedSel.pageIndices);
    const selectedIndices = resolvedSel.pageIndices;
    const outputMode = options.outputMode || 'searchable-pdf-and-text';
    const skipPagesWithExistingText = options.skipPagesWithExistingText === true;
    const lowConfidenceThreshold =
      options.lowConfidenceThreshold !== undefined ? Number(options.lowConfidenceThreshold) : 60;
    const detectOrientation = options.detectOrientation !== false;

    const pdfJsOpts: Record<string, unknown> = {};
    if (options.password ?? input.password) {
      pdfJsOpts.password = options.password ?? input.password;
    }
    pdfJsSession = await openManagedPdfDocument(loadRes.isolatedBytes, pdfJsOpts);

    request?.onProgress?.({
      percent: 12,
      stage: 'LOADING',
      message: `Acquiring pooled Tesseract.js worker (${langCheck.combinedLangString})...`,
    });

    workerLease = await ocrWorkerPoolV2.acquireWorker({
      langString: langCheck.combinedLangString,
      langPath: options.langPath,
      cachePath: options.cachePath,
      cacheMethod: options.cacheMethod,
      signal,
    });

    // If generating a Searchable PDF and input was encrypted, clone pages into a clean unencrypted output container
    // or modify in-place on `srcDoc` so original visual streams are 100% preserved
    let targetPdfDoc: PDFDocument = srcDoc;
    if (loadRes.validation.hasEncryptDictionary || srcDoc.isEncrypted) {
      const cleanDoc = await PDFDocument.create();
      const allIdxs = Array.from({ length: totalPages }, (_, i) => i);
      const copied = await cleanDoc.copyPages(srcDoc, allIdxs);
      for (const cp of copied) cleanDoc.addPage(cp);
      targetPdfDoc = cleanDoc;
    }

    const helveticaFont =
      outputMode !== 'text-only' ? await targetPdfDoc.embedFont(StandardFonts.Helvetica) : null;
    const pdfLibPages = targetPdfDoc.getPages();

    const pageRecords: OcrPageRecord[] = [];
    let totalWords = 0;
    let totalLowConfWords = 0;
    let totalChars = 0;
    let weightedConfSum = 0;
    let ocrPagesProcessedCount = 0;
    let nativeTextPagesPreservedCount = 0;

    for (let sIdx = 0; sIdx < selectedIndices.length; sIdx++) {
      if (signal?.aborted) {
        throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'OCR operation was cancelled by user.');
      }

      const pageIdx0 = selectedIndices[sIdx];
      const pageNumber1 = pageIdx0 + 1;
      const pdfLibPage = pdfLibPages[pageIdx0];
      const pdfJsPage = await pdfJsSession.pdfDoc.getPage(pageNumber1);

      try {
        request?.onProgress?.({
          percent: Math.round(15 + ((sIdx + 1) / selectedIndices.length) * 70),
          stage: 'RUNNING_OCR',
          message: `Processing page ${pageNumber1} of ${totalPages} (${sIdx + 1}/${selectedIndices.length})...`,
          currentPage: pageNumber1,
          totalPages,
        });

        const vp1 = pdfJsPage.getViewport({ scale: 1.0 });
        const widthPt = Math.round(vp1.width * 100) / 100;
        const heightPt = Math.round(vp1.height * 100) / 100;
        const origRot = (((Number(pdfJsPage.rotate) || 0) % 360) + 360) % 360;

        // Check if page already has a native PDF vector text layer
        const existingTc = await pdfJsPage.getTextContent().catch(() => ({ items: [] }));
        const existingItems: any[] = existingTc?.items || [];
        const nativeStrings = existingItems
          .map((it) => (typeof it?.str === 'string' ? it.str.trim() : ''))
          .filter((s) => s.length > 0);
        const nativeJoinedText = nativeStrings.join(' ');

        if (skipPagesWithExistingText && nativeJoinedText.length >= 3) {
          nativeTextPagesPreservedCount++;
          const nativeWords: OcrWordRecord[] = nativeItemsToWordRecords(
            existingItems,
            widthPt,
            heightPt
          );
          const wordCount = nativeWords.length;
          const charCount = nativeJoinedText.length;
          totalWords += wordCount;
          totalChars += charCount;
          weightedConfSum += 100 * Math.max(1, wordCount);

          pageRecords.push({
            pageNumber: pageNumber1,
            sourceKind: 'native-pdf-page',
            extractionSource: 'native-pdf-text-layer',
            widthPt,
            heightPt,
            originalRotationDegrees: origRot,
            effectiveRotationDegrees: origRot,
            imageWidthPx: Math.round(widthPt),
            imageHeightPx: Math.round(heightPt),
            text: nativeJoinedText,
            confidence: 100,
            wordCount,
            lowConfidenceWordCount: 0,
            characterCount: charCount,
            hasRecognizedText: wordCount > 0,
            preprocessing: {
              applied: false,
              grayscaleConverted: false,
              denoised: false,
              contrastStretched: false,
              percentileLow: 0,
              percentileHigh: 255,
              thresholdMode: 'none',
              detectedOrientationDegrees: 0,
              detectedSkewAngleDegrees: 0,
              tesseractRotateRadians: 0,
            },
            blocks: [],
            lines: [],
            words: nativeWords,
          });
          continue;
        }

        // Extract raster image for scanned PDF page
        const raster = await extractPdfPageRasterForOcr({
          pdfLibPage,
          pdfLibDoc: targetPdfDoc,
          pdfJsPage,
          dpi,
        });

        const rec = await recognizeImageWithOrientationAndStructure({
          worker: workerLease.worker,
          rawImage: raster.rawImage,
          fallbackEncodedBytes: raster.encodedBytes,
          preprocessOptions: options.preprocessing || {},
          detectOrientation,
          pageWidthPt: raster.widthPt,
          pageHeightPt: raster.heightPt,
          lowConfidenceThreshold,
          signal,
        });

        ocrPagesProcessedCount++;
        const wordCount = rec.words.length;
        const charCount = rec.text.length;
        totalWords += wordCount;
        totalLowConfWords += rec.lowConfidenceWordCount;
        totalChars += charCount;
        weightedConfSum += rec.confidence * Math.max(1, wordCount);

        // If an additional 90/180/270 orientation correction was detected on the page raster,
        // optionally normalize the PDF page rotation so the page displays upright
        let effectiveRot = raster.pageRotationDegrees;
        if (rec.preprocessing.detectedOrientationDegrees !== 0) {
          effectiveRot =
            (raster.pageRotationDegrees + rec.preprocessing.detectedOrientationDegrees) % 360;
          if (outputMode !== 'text-only' && options.correctPageRotationInOutputPdf !== false) {
            pdfLibPage.setRotation(degrees(effectiveRot));
          }
        }

        if (outputMode !== 'text-only' && helveticaFont && rec.words.length > 0) {
          overlayInvisibleOcrTextOnPdfPage({
            page: pdfLibPage,
            words: rec.words,
            font: helveticaFont,
          });
        }

        pageRecords.push({
          pageNumber: pageNumber1,
          sourceKind: 'scanned-pdf-page',
          extractionSource: 'tesseract-ocr',
          widthPt: rec.effectivePageWidthPt,
          heightPt: rec.effectivePageHeightPt,
          originalRotationDegrees: raster.pageRotationDegrees,
          effectiveRotationDegrees: effectiveRot,
          imageWidthPx: rec.imageWidthPx,
          imageHeightPx: rec.imageHeightPx,
          text: rec.text,
          confidence: rec.confidence,
          wordCount,
          lowConfidenceWordCount: rec.lowConfidenceWordCount,
          characterCount: charCount,
          hasRecognizedText: wordCount > 0,
          preprocessing: rec.preprocessing,
          blocks: rec.blocks,
          lines: rec.lines,
          words: rec.words,
        });
      } finally {
        if (pdfJsPage && typeof pdfJsPage.cleanup === 'function') {
          try {
            await pdfJsPage.cleanup();
          } catch {
            // ignore cleanup warnings
          }
        }
      }
    }

    workerLease.release();
    workerLease = null;

    const fullText = pageRecords
      .map((p) =>
        pageRecords.length > 1 ? `--- Page ${p.pageNumber} ---\n${p.text}` : p.text
      )
      .join('\n\n');

    const meanConfidence =
      totalWords > 0
        ? Math.round((weightedConfSum / totalWords) * 100) / 100
        : 0;

    const baseName = stripFileExtension(input.fileName);
    const txtBytes = new TextEncoder().encode(fullText);
    const txtFile: PdfOutputFile = {
      fileName: `${baseName}_ocr.txt`,
      mimeType: 'text/plain;charset=utf-8',
      bytes: txtBytes,
      byteLength: txtBytes.byteLength,
      pageCount: selectedIndices.length,
    };

    const outputFiles: PdfOutputFile[] = [];
    let primaryFile: PdfOutputFile = txtFile;

    if (outputMode !== 'text-only') {
      request?.onProgress?.({
        percent: 92,
        stage: 'VERIFYING_OUTPUT',
        message: 'Serializing and independently verifying Searchable PDF in PDF.js...',
      });

      const { bytes: pdfBytes, integrity } = await serializeAndVerifyPdfV2(
        targetPdfDoc,
        { useObjectStreams: false },
        { expectedPageCount: totalPages, verifyWithPdfJs: true }
      );

      if (!integrity.isValid) {
        return buildFailureResult(
          canonicalId,
          integrity.error ??
            createPdfProcessingError(
              'ERR_OUTPUT_INTEGRITY_FAILURE',
              'Generated Searchable PDF failed independent PDF.js verification.'
            ),
          startTime,
          inputByteLength,
          loadRes.warnings
        );
      }

      const pdfFile: PdfOutputFile = {
        fileName: options.outputFileName || `${baseName}_searchable.pdf`,
        mimeType: 'application/pdf',
        bytes: pdfBytes,
        byteLength: pdfBytes.byteLength,
        pageCount: totalPages,
      };
      outputFiles.push(pdfFile);
      primaryFile = pdfFile;
    }

    if (outputMode === 'searchable-pdf-and-text' || outputMode === 'text-only') {
      outputFiles.push(txtFile);
      if (outputMode === 'text-only') {
        primaryFile = txtFile;
      }
    }

    const poolStats = ocrWorkerPoolV2.getStats();
    const warnings = [...loadRes.warnings];
    if (totalWords === 0) {
      warnings.push('OCR completed cleanly, but no recognizable text was found on the selected page(s).');
    }
    if (totalLowConfWords > 0) {
      warnings.push(
        `Retained ${totalLowConfWords} low-confidence word(s) (< ${lowConfidenceThreshold}% confidence) without discarding them.`
      );
    }

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'OCR Engine', value: 'Tesseract.js 7.0.0 (WebAssembly LSTM)' },
        { label: 'Language(s)', value: langCheck.combinedLangString },
        { label: 'Pages Processed', value: `${selectedIndices.length} of ${totalPages}` },
        { label: 'Words Extracted', value: totalWords },
        { label: 'Mean Confidence', value: `${meanConfidence}%` },
      ],
      tableHeaders: ['Page', 'Extraction Source', 'Words', 'Low-Conf Words', 'Confidence', 'Orientation / Skew'],
      tableRows: pageRecords.map((p) => [
        `Page ${p.pageNumber}`,
        p.extractionSource === 'tesseract-ocr' ? 'Tesseract OCR (Raster)' : 'Native PDF Text Layer',
        p.wordCount,
        p.lowConfidenceWordCount,
        `${p.confidence}%`,
        `${p.effectiveRotationDegrees}° / ${p.preprocessing.detectedSkewAngleDegrees}°`,
      ]),
      rawData: {
        language: langCheck.combinedLangString,
        totalPagesInDocument: totalPages,
        selectedPageNumbers: selectedIndices.map((i) => i + 1),
        ocrPagesProcessedCount,
        nativeTextPagesPreservedCount,
        totalWords,
        totalLowConfidenceWords: totalLowConfWords,
        totalCharacters: totalChars,
        meanConfidence,
        workerPoolStats: poolStats,
      },
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      previewText: fullText,
      inspectionReport,
      summary: `Completed PDF OCR (${langCheck.combinedLangString}) across ${selectedIndices.length} of ${totalPages} page(s) (${ocrPagesProcessedCount} OCR raster page(s), ${nativeTextPagesPreservedCount} native vector page(s)): extracted ${totalWords} word(s) with ${meanConfidence}% mean confidence.`,
      metrics: {
        inputBytes: inputByteLength,
        outputBytes: primaryFile.byteLength,
        inputPageCount: totalPages,
        outputPageCount: outputMode === 'text-only' ? selectedIndices.length : totalPages,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      warnings,
      limitations: [OCR_OFFLINE_AND_LANGUAGE_DISCLOSURE],
      details: {
        language: langCheck.combinedLangString,
        languageMetadata: langCheck.metadata,
        outputMode,
        dpi,
        totalPagesInDocument: totalPages,
        selectedPageNumbers: selectedIndices.map((i) => i + 1),
        unselectedPageNumbers: Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          (n) => !selectedIndicesSet.has(n - 1)
        ),
        ocrPagesProcessedCount,
        nativeTextPagesPreservedCount,
        totalWords,
        totalLowConfidenceWords: totalLowConfWords,
        totalCharacters: totalChars,
        meanConfidence,
        fullText,
        pages: pageRecords,
        workerPoolStats: poolStats,
      },
    };
  } catch (err) {
    if (workerLease) {
      await workerLease.destroyOnError();
      workerLease = null;
    }
    const procErr =
      err && typeof err === 'object' && 'code' in err && 'status' in err
        ? (err as PdfProcessingError)
        : normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildFailureResult(canonicalId, procErr, startTime, inputByteLength, loadRes.warnings);
  } finally {
    if (workerLease) {
      workerLease.release();
    }
    if (pdfJsSession) {
      await pdfJsSession.dispose();
    }
    await loadRes.dispose();
  }
}

function nativeItemsToWordRecords(
  items: any[],
  pageWidthPt: number,
  pageHeightPt: number
): OcrWordRecord[] {
  const words: OcrWordRecord[] = [];
  let idx = 0;

  for (const it of items) {
    if (typeof it?.str !== 'string' || !Array.isArray(it.transform)) continue;
    const rawStr = it.str.trim();
    if (!rawStr) continue;

    const xPt = Math.max(0, Math.round((Number(it.transform[4]) || 0) * 100) / 100);
    const yPt = Math.max(0, Math.round((Number(it.transform[5]) || 0) * 100) / 100);
    const hPt = Math.max(6, Math.round((Math.abs(Number(it.transform[3])) || 12) * 100) / 100);
    const wPt = Math.max(4, Math.round((Number(it.width) || rawStr.length * hPt * 0.5) * 100) / 100);

    const tokens = rawStr.split(/\s+/).filter(Boolean);
    const tokenW = tokens.length > 0 ? wPt / tokens.length : wPt;

    for (let t = 0; t < tokens.length; t++) {
      const tx = Math.round((xPt + t * tokenW) * 100) / 100;
      const tw = Math.round(tokenW * 100) / 100;
      const y0Px = Math.max(0, Math.round(pageHeightPt - (yPt + hPt)));
      const y1Px = Math.min(Math.round(pageHeightPt), Math.round(pageHeightPt - yPt));

      words.push({
        text: tokens[t],
        confidence: 100,
        isLowConfidence: false,
        readingOrderIndex: ++idx,
        imageBboxPx: {
          x0: Math.round(tx),
          y0: y0Px,
          x1: Math.round(tx + tw),
          y1: y1Px,
          width: Math.round(tw),
          height: Math.max(1, y1Px - y0Px),
        },
        pdfBboxPt: {
          x: tx,
          y: yPt,
          width: tw,
          height: hPt,
          baselineY: yPt,
        },
      });
    }
  }

  return words;
}

/**
 * ============================================================================
 * 8. CANONICAL ENGINE H ROUTER (`executeOcrOperationV2`)
 * ============================================================================
 */

export const ENGINE_H_CANONICAL_IDS: ReadonlySet<string> = new Set(['pdf-ocr']);

/**
 * V2 Engine H Router for Optical Character Recognition (`pdf-ocr`):
 * - Accepts scanned PDF documents (`performPdfOcrV2`) and PNG/JPEG raster images (`performImageOcrV2`).
 * - Rejects unknown, cross-module, and non-PDF formula generator IDs with `ERR_UNSUPPORTED_OPERATION`.
 */
export async function executeOcrOperationV2(
  request: PdfOperationRequest
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const totalInputBytes = (request?.inputs || []).reduce(
    (acc, f) => acc + inspectByteLength(f?.bytes),
    0
  );

  const normalizedToolId = request?.toolId?.trim() === 'ocr-pdf' ? 'pdf-ocr' : request?.toolId;
  const resolved = resolvePdfOperationCapabilities(normalizedToolId);
  if (!resolved.supported || !resolved.capabilities) {
    return buildFailureResult(
      request?.toolId || 'unknown',
      resolved.error ??
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unregistered PDF OCR tool ID: "${request?.toolId}".`
        ),
      startTime,
      totalInputBytes
    );
  }

  const cap = resolved.capabilities;
  if (cap.module !== 'ocr' || !ENGINE_H_CANONICAL_IDS.has(cap.canonicalId)) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by the Engine H OCR router.`
      ),
      startTime,
      totalInputBytes
    );
  }

  if (!request.inputs || request.inputs.length === 0) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'At least one PDF or PNG/JPEG image file is required for OCR.'),
      startTime,
      0
    );
  }

  const ocrOptions: PdfOcrOptions = {
    ...((request.options || {}) as PdfOcrOptions),
    selection:
      (request.options as PdfOcrOptions | undefined)?.selection ?? request.pageSelection,
    signal: (request.options as PdfOcrOptions | undefined)?.signal ?? request.signal,
  };

  if (request.inputs.length > 1) {
    return await performImageOcrV2(request.inputs, ocrOptions, request);
  }

  return await performPdfOcrV2(request.inputs[0], ocrOptions, request);
}
