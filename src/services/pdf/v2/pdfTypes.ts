import type { PDFDocument } from '@cantoo/pdf-lib';

/**
 * ============================================================================
 * 1. CORE INPUT, PAGE SELECTION & CAPABILITY INTERFACES (PHASE PDF-02 / PDF-03)
 * ============================================================================
 */

export type PdfInputSourceKind = 'pdf' | 'image' | 'office' | 'text' | 'html';

export type DetectedFileFormat =
  | 'pdf'
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'bmp'
  | 'svg'
  | 'zip-office'
  | 'rtf'
  | 'html'
  | 'text'
  | 'empty'
  | 'unknown';

export interface PdfDocumentInput {
  /** Original file name including extension (e.g., "contract.pdf", "scan.png") */
  fileName: string;
  /** Raw file bytes (always cloned defensively before engine mutation or worker transfer) */
  bytes: Uint8Array | ArrayBuffer;
  /** Optional browser MIME type from File.type */
  mimeType?: string;
  /** Optional user/owner password for encrypted PDF inputs */
  password?: string;
  /** Optional per-file page selection (used by multi-file extraction/merge tools) */
  pageSelection?: PdfPageSelection;
}

export type PdfPageSelectionPreset = 'all' | 'odd' | 'even' | 'portrait' | 'landscape';

export interface PdfPageSelection {
  /**
   * Selection mode:
   * - 'indices': 0-based page index array from PdfThumbnailPreview (e.g., [0, 2, 4])
   * - 'range-string': 1-based human range syntax (e.g., "1-3, 5, 8-end")
   * - 'preset': bulk filter ('all' | 'odd' | 'even' | 'portrait' | 'landscape')
   */
  mode: 'indices' | 'range-string' | 'preset';
  /** 0-based page indices (used when mode === 'indices') */
  indices?: number[];
  /** 1-based range expression string (used when mode === 'range-string') */
  rangeExpression?: string;
  /** Preset filter (used when mode === 'preset') */
  preset?: PdfPageSelectionPreset;
}

export type PdfEngineModuleId =
  | 'core'
  | 'page-organization'
  | 'editing-geometry'
  | 'conversion-extraction'
  | 'inspection-analysis'
  | 'optimization-repair'
  | 'security'
  | 'ocr'
  | 'non-pdf-generator';

export interface PdfOperationCapabilities {
  /** Canonical tool ID from CALCULATORS */
  canonicalId: string;
  /** Supported legacy aliases (e.g., ['pdf-crop'] for 'pdf-crop-pages') */
  aliases: string[];
  /** Domain module responsible for execution */
  module: PdfEngineModuleId;
  /** Accepted file input extensions and MIME types for the HTML <input type="file"> */
  acceptedFileTypes: string;
  /** Expected input source kind */
  expectedInputKind: PdfInputSourceKind;
  /** Minimum and maximum number of input files accepted */
  minFiles: number;
  maxFiles: number;
  /** Whether PdfThumbnailPreview should be displayed for primary file */
  supportsThumbnailSelection: boolean;
  /** Browser-native feasibility classification */
  browserExecutionClass:
    | 'FULLY_BROWSER_LOCAL'
    | 'BROWSER_LOCAL_WITH_OCR_MODEL_FETCH'
    | 'BROWSER_LOCAL_STRUCTURAL_CONVERSION'
    | 'BROWSER_LOCAL_BEST_EFFORT_RECOVERY'
    | 'NON_PDF_FORMULA_ENGINE';
  /** Honest capability limitation disclosures shown to user */
  disclosedLimitations: string[];
}

/**
 * ============================================================================
 * 2. PROGRESS, ERROR & RESULT STATUS TAXONOMY
 * ============================================================================
 */

export type PdfOperationStatus =
  | 'SUCCESS'
  | 'PARTIAL_RECOVERY'
  | 'VALIDATION_ERROR'
  | 'UNSUPPORTED_OPERATION'
  | 'INVALID_PDF'
  | 'PASSWORD_REQUIRED'
  | 'INCORRECT_PASSWORD'
  | 'PROCESSING_FAILURE'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'OUTPUT_INTEGRITY_FAILURE';

export type PdfErrorCode =
  | 'ERR_INVALID_PDF'
  | 'ERR_EMPTY_FILE'
  | 'ERR_FILE_TOO_LARGE'
  | 'ERR_PASSWORD_REQUIRED'
  | 'ERR_INCORRECT_PASSWORD'
  | 'ERR_UNSUPPORTED_OPERATION'
  | 'ERR_PDF_LOAD_FAILED'
  | 'ERR_MEMORY_LIMIT'
  | 'ERR_OUTPUT_INTEGRITY'
  | 'ERR_INVALID_MAGIC_BYTES'
  | 'ERR_INVALID_PDF_STRUCTURE'
  | 'ERR_MISSING_OPERATION_HANDLER'
  | 'ERR_EMPTY_PASSWORD'
  | 'ERR_SECOND_FILE_REQUIRED'
  | 'ERR_INVALID_PAGE_RANGE'
  | 'ERR_CANNOT_DELETE_ALL_PAGES'
  | 'ERR_REORDER_LENGTH_MISMATCH'
  | 'ERR_INVALID_CROP_BOUNDS'
  | 'ERR_INVALID_DIMENSIONS'
  | 'ERR_EMPTY_WATERMARK_CONTENT'
  | 'ERR_NO_IMAGES_FOUND'
  | 'ERR_UNSUPPORTED_IMAGE_FORMAT'
  | 'ERR_XFA_UNSUPPORTED'
  | 'ERR_REPAIR_UNRECOVERABLE'
  | 'ERR_OCR_MODEL_LOAD_FAILED'
  | 'ERR_MEMORY_LIMIT_EXCEEDED'
  | 'ERR_OPERATION_ABORTED'
  | 'ERR_OUTPUT_INTEGRITY_FAILURE'
  | 'ERR_PROCESSING_FAILURE';

export interface PdfProcessingError {
  /** Standardized status category */
  status: Exclude<PdfOperationStatus, 'SUCCESS' | 'PARTIAL_RECOVERY'>;
  /** Deterministic machine-testable error code */
  code: PdfErrorCode;
  /** User-facing message in English */
  message: string;
  /** User-facing message in Spanish */
  messageEs: string;
  /** Actionable recovery hint for the user */
  recoverableHint?: string;
  /** Optional technical diagnostic details */
  technicalDetails?: Record<string, unknown>;
}

export interface PdfProcessingProgress {
  /** Percentage complete (0 to 100) */
  percent: number;
  /** Current execution stage identifier */
  stage:
    | 'VALIDATING'
    | 'LOADING'
    | 'PROCESSING_PAGES'
    | 'RENDERING_IMAGES'
    | 'RUNNING_OCR'
    | 'COMPRESSING'
    | 'PACKAGING_ZIP'
    | 'VERIFYING_OUTPUT';
  /** Human-readable status text (e.g., "Extracting page 3 of 12...") */
  message: string;
  /** Optional 1-based current page index and total pages */
  currentPage?: number;
  totalPages?: number;
}

/**
 * ============================================================================
 * 3. OUTPUT ARTIFACTS, REQUEST & RESULT CONTRACTS
 * ============================================================================
 */

export interface PdfOutputFile {
  /** Suggested download file name (e.g., "report_merged.pdf", "pages_split.zip") */
  fileName: string;
  /** Standard MIME type ('application/pdf', 'application/zip', 'text/plain', 'image/png', 'image/jpeg', 'image/webp') */
  mimeType: string;
  /** Exact standalone byte array (byteOffset === 0) */
  bytes: Uint8Array;
  /** Byte length */
  byteLength: number;
  /** Optional page count if output is a PDF */
  pageCount?: number;
  /** Optional dimensions if output is an image */
  width?: number;
  height?: number;
}

export interface PdfOperationRequest<TOptions = Record<string, unknown>> {
  /** Canonical tool ID or registered alias */
  toolId: string;
  /** Primary input files (1..N) */
  inputs: PdfDocumentInput[];
  /** Optional secondary input files (e.g., Document B for pdf-comparison or watermark image) */
  secondaryInputs?: PdfDocumentInput[];
  /** Page selection state from thumbnails or range input */
  pageSelection?: PdfPageSelection;
  /** Tool-specific configuration options */
  options?: TOptions;
  /** Optional progress callback */
  onProgress?: (progress: PdfProcessingProgress) => void;
  /** Optional AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Current UI language ('en' | 'es') */
  language?: 'en' | 'es';
}

export interface PdfInspectionReport {
  reportType:
    | 'page-counter'
    | 'metadata-viewer'
    | 'blank-page-detector'
    | 'file-size-analyzer'
    | 'pdf-comparison'
    | 'repair-diagnostics';
  /** Flat key-value summary badges for top-level UI display */
  summaryMetrics: Array<{ label: string; value: string | number }>;
  /** Optional tabular rows for per-page dimensions, file-size breakdown, or comparison diffs */
  tableHeaders?: string[];
  tableRows?: Array<Array<string | number>>;
  /** Structured raw payload for programmatic test verification & JSON export */
  rawData: Record<string, unknown>;
}

export interface PdfOperationResult {
  /** Standardized outcome status */
  status: PdfOperationStatus;
  /** Canonical tool ID that executed the request (resolved from any alias) */
  resolvedCanonicalId: string;
  /** Primary downloadable output file (PDF, ZIP, TXT, PNG/JPG, or Office file) */
  primaryFile?: PdfOutputFile;
  /** Additional individual output files (e.g., split chunks or extracted images before/alongside ZIP) */
  outputFiles: PdfOutputFile[];
  /** Backward-compatible raw byte reference (aliases primaryFile.bytes for existing callers) */
  outputBytes?: Uint8Array;
  /** Human-readable completion summary */
  summary: string;
  /** Structured metrics (inputBytes, outputBytes, pageCount, savedPercentage, durationMs) */
  metrics: {
    inputBytes: number;
    outputBytes: number;
    inputPageCount?: number;
    outputPageCount?: number;
    savedBytes?: number;
    savedPercentage?: number;
    durationMs: number;
  };
  /** Structured inspection report for analysis/viewer/comparison tools */
  inspectionReport?: PdfInspectionReport;
  /** Optional in-browser previews */
  previewText?: string;
  previewHtml?: string;
  previewTable?: string[][];
  previewImages?: Array<{
    label: string;
    width: number;
    height: number;
    dataUrl: string;
    byteLength: number;
  }>;
  /** Non-fatal warnings */
  warnings: string[];
  /** Disclosed browser capability limitations */
  limitations: string[];
  /** Backward-compatible details dictionary */
  details?: Record<string, unknown>;
  /** Populated when status !== 'SUCCESS' && status !== 'PARTIAL_RECOVERY' */
  error?: PdfProcessingError;
}

/**
 * ============================================================================
 * 4. CORE FOUNDATION VALIDATION, LOADER, LIFECYCLE & INTEGRITY CONTRACTS
 * ============================================================================
 */

export interface PdfValidationLimits {
  /** Maximum single file size in bytes (default: 250 MB = 262,144,000 bytes) */
  maxFileSizeBytes?: number;
  /** Soft warning threshold in bytes (default: 50 MB = 52,428,800 bytes) */
  softWarningBytes?: number;
  /** Maximum leading garbage offset before '%PDF-' header (default: 1024 bytes per PDF spec) */
  maxHeaderOffsetBytes?: number;
  /** Whether to require a trailing '%%EOF' marker (default: true for strict, false for repair mode) */
  requireEofMarker?: boolean;
}

export interface PdfValidationResult {
  isValid: boolean;
  detectedFormat: DetectedFileFormat;
  byteLength: number;
  pdfVersion?: string;
  headerOffset?: number;
  hasEofMarker: boolean;
  hasEncryptDictionary: boolean;
  isPasswordRequired: boolean;
  warnings: string[];
  error?: PdfProcessingError;
}

export interface PdfLoadOptions {
  /** Optional user or owner password for encrypted PDF documents */
  password?: string;
  /** Allow tolerant parsing of damaged objects (default: false for normal ops, true for repair) */
  allowTolerantParse?: boolean;
  /** Custom validation limits */
  validationLimits?: PdfValidationLimits;
  /** Strip leading garbage bytes before '%PDF-' if headerOffset > 0 (default: true within 1024 bytes) */
  trimLeadingBytesToHeader?: boolean;
}

export interface PdfDocumentMetadataSummary {
  pageCount: number;
  pdfVersion: string;
  isEncrypted: boolean;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  firstPageSize?: { widthPt: number; heightPt: number; rotationDegrees: number };
}

export interface PdfLoadResult {
  success: boolean;
  status: PdfOperationStatus;
  sessionId?: string;
  document?: PDFDocument;
  isolatedBytes?: Uint8Array;
  validation: PdfValidationResult;
  metadata?: PdfDocumentMetadataSummary;
  warnings: string[];
  error?: PdfProcessingError;
  dispose: () => Promise<void>;
}

export interface PdfOutputIntegrityOptions {
  /** Verify output by independently reopening in PDF.js (default: true) */
  verifyWithPdfJs?: boolean;
  /** Expected page count (if known) to assert against independent PDF.js load */
  expectedPageCount?: number;
  /** Optional password if the output PDF was intentionally encrypted by Module G */
  passwordForEncryptedOutput?: string;
  /** Expect the output PDF to require a password when opened without credentials */
  expectEncrypted?: boolean;
}

export interface PdfOutputIntegrityResult {
  isValid: boolean;
  byteLength: number;
  hasValidMagicHeader: boolean;
  pdfVersion?: string;
  hasEofMarker: boolean;
  reopenedWithPdfJs: boolean;
  verifiedPageCount?: number;
  isEncryptedOutput: boolean;
  warnings: string[];
  error?: PdfProcessingError;
}
