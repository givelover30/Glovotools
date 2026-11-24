/**
 * CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-10: CONTROLLED WORKSPACE INTEGRATION ADAPTER
 *
 * Connects the existing CALCTOOLS PDF Workspace (`PdfToolsWorkspace.tsx`) to the completed
 * V2 PDF Engines (Engines A–H) through a deterministic, privacy-preserving routing and
 * parameter-normalization layer.
 *
 * Architecture:
 *   Existing PDF Workspace -> V2 Integration Adapter (`pdfWorkspaceIntegration.ts`)
 *     -> V2 Operation Registry (`pdfRegistry.ts`)
 *     -> Engines A–H (`page-organization`, `editing-geometry`, `conversion-extraction`,
 *        `inspection-analysis`, `optimization-repair`, `security`, `ocr`)
 *     -> Verified Output (`PdfOperationResult`)
 *     -> Existing Download Workflow
 *
 * Key Guarantees:
 *   1. Every V2 canonical tool ID (33 `pdf-tools` + 20 `document-converters` = 53 canonical IDs)
 *      and all registered aliases route deterministically to their owning V2 engine.
 *   2. Unsupported tool IDs, non-PDF calculators, and legacy `generator-743` formula IDs are
 *      explicitly rejected with `ERR_UNSUPPORTED_OPERATION` — never silently redirected to compression.
 *   3. Failed V2 operations NEVER fall back to V1 (`pdfCoreEngine.ts`) to mask errors.
 *   4. Existing V1 `pdfCoreEngine.ts` functions remain intact and accessible via explicit V1 adapter helpers.
 *   5. 100% browser-local processing: zero network uploads, zero password logging, and strict
 *      input buffer immutability.
 */

import {
  ConversionOptions,
  ConversionOutput,
  DocumentConverterId,
} from '../../document/types';
import * as v1PdfEngine from '../pdfCoreEngine';
import { clonePdfBytes } from '../pdfRuntime';
import { cloneIsolatedPdfBytes, inspectByteLength } from './pdfByteUtils';

function safeCloneUint8Array(bytes: Uint8Array | ArrayBuffer | null | undefined): Uint8Array {
  if (!bytes || inspectByteLength(bytes) === 0) {
    return new Uint8Array(0);
  }
  return cloneIsolatedPdfBytes(bytes);
}
import { executeConversionExtractionOperationV2 } from './pdfConversionExtractionEngine';
import {
  StandardPdfPageSizePreset,
  executeEditingGeometryOperationV2,
} from './pdfEditingGeometryEngine';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import {
  executeInspectionAnalysisOperationV2,
  formatByteSize,
} from './pdfInspectionAnalysisEngine';
import { executeOcrOperationV2, terminateOcrWorkerPoolV2 } from './pdfOcrEngine';
import { executeOptimizationRepairOperationV2 } from './pdfOptimizationRepairEngine';
import { executePageOrganizationOperationV2 } from './pdfPageOrganizationEngine';
import {
  PDF_TOOL_ALIAS_MAP,
  PDF_TOOL_OPERATION_REGISTRY,
  resolvePdfOperationCapabilities,
} from './pdfRegistry';
import { executeSecurityOperationV2 } from './pdfSecurityEngine';
import {
  PdfDocumentInput,
  PdfEngineModuleId,
  PdfOperationCapabilities,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfPageSelection,
  PdfProcessingError,
  PdfProcessingProgress,
} from './pdfTypes';

export type PdfGeneratedFile = PdfOutputFile;
export type PdfModuleName = PdfEngineModuleId;
export type PdfProgressCallback = (progress: PdfProcessingProgress & { phase?: string }) => void;

/**
 * Extended workspace alias table mapping both primary registry aliases (`PDF_TOOL_ALIAS_MAP`)
 * and natural V2 engine aliases to their canonical `PDF_TOOL_OPERATION_REGISTRY` IDs.
 */
export const WORKSPACE_EXTENDED_ALIAS_MAP: Readonly<Record<string, string>> = {
  ...PDF_TOOL_ALIAS_MAP,
  // Module B — Page Organization aliases
  'merge-pdf': 'pdf-merge',
  'split-pdf': 'pdf-split',
  'extract-pdf-pages': 'pdf-extract-pages',
  'remove-pdf-pages': 'pdf-delete-pages',
  'delete-pdf-pages': 'pdf-delete-pages',
  'reorder-pdf-pages': 'pdf-reorder-pages',
  'organize-pdf-pages': 'pdf-reorder-pages',
  'rotate-pdf': 'pdf-rotate-pages',
  'pdf-rotate': 'pdf-rotate-pages',
  // Module C — Editing & Geometry aliases
  'add-watermark-pdf': 'pdf-add-watermark',
  'pdf-watermark': 'pdf-add-watermark',
  'add-page-numbers-pdf': 'pdf-add-page-numbers',
  'crop-pdf': 'pdf-crop-pages',
  'pdf-crop': 'pdf-crop-pages',
  'resize-pdf-page': 'pdf-page-resizer',
  'header-footer-pdf': 'pdf-page-numbering-header-watermark-tool',
  // Module D — Conversion & Extraction aliases
  'images-to-pdf': 'pdf-images-to-pdf',
  'png-to-pdf': 'pdf-images-to-pdf',
  'jpg-to-pdf': 'pdf-images-to-pdf',
  'pdf-to-png': 'pdf-to-images',
  'pdf-to-jpg': 'pdf-to-images',
  'extract-pdf-images': 'pdf-extract-images',
  // Module E — Inspection & Analysis aliases
  'count-pdf-pages': 'pdf-page-counter',
  'pdf-page-count': 'pdf-page-counter',
  'view-pdf-metadata': 'pdf-metadata-viewer',
  'inspect-pdf-metadata': 'pdf-metadata-viewer',
  'compare-pdf': 'pdf-comparison',
  'pdf-diff': 'pdf-comparison',
  'detect-blank-pdf-pages': 'pdf-blank-page-detector',
  'find-blank-pdf-pages': 'pdf-blank-page-detector',
  'analyze-pdf-file-size': 'pdf-file-size-analyzer',
  'pdf-size-breakdown': 'pdf-file-size-analyzer',
  // Module F — Optimization & Repair aliases
  'compress-pdf': 'pdf-compress',
  'repair-pdf': 'pdf-repair',
  // Module G — Security aliases
  'pdf-protect': 'pdf-protect-password',
  'protect-pdf': 'pdf-protect-password',
  'pdf-unlock': 'pdf-remove-password',
  'unlock-pdf': 'pdf-remove-password',
  // Module H — OCR aliases
  'ocr-pdf': 'pdf-ocr',
};

/**
 * Known legacy `generator-743` formula calculator IDs that contain "pdf" in their slug
 * but are mathematical/estimation calculators, NOT binary PDF document processors.
 * These are strictly rejected by the PDF V2 workspace adapter with `ERR_UNSUPPORTED_OPERATION`.
 */
export const REJECTED_NON_PDF_GENERATOR_IDS: ReadonlySet<string> = new Set([
  'pdf-to-word-converter',
  'word-to-pdf-tool',
  'pdf-page-counter-pro',
  'pdf-size-estimator',
  'pdf-compression-ratio-calculator',
  'pdf-print-cost-calculator',
  'pdf-dpi-resolution-calculator',
  'pdf-spine-width-calculator',
  'pdf-ink-coverage-calculator',
  'pdf-ocr-time-estimator',
  'pdf-storage-bandwidth-calculator',
  'pdf-batch-processing-estimator',
]);

export type PdfWorkspaceRoutingTarget =
  | 'V2_PDF_ENGINE'
  | 'V2_DOCUMENT_CONVERTER'
  | 'UNSUPPORTED';

export interface PdfWorkspaceRoutingResolution {
  supported: boolean;
  requestedToolId: string;
  canonicalId?: string;
  isAlias: boolean;
  target: PdfWorkspaceRoutingTarget;
  module?: PdfModuleName;
  capabilities?: PdfOperationCapabilities;
  error?: PdfProcessingError;
}

/**
 * Resolves any requested tool ID or alias against the canonical V2 registry.
 * Optionally enforces `expectedModule` for cross-module boundary verification.
 */
export function resolvePdfWorkspaceToolV2(
  toolId: string | null | undefined,
  options: { expectedModule?: PdfModuleName } = {}
): PdfWorkspaceRoutingResolution {
  const rawId = typeof toolId === 'string' ? toolId.trim() : '';
  if (!rawId) {
    return {
      supported: false,
      requestedToolId: rawId,
      isAlias: false,
      target: 'UNSUPPORTED',
      error: createPdfProcessingError('ERR_UNSUPPORTED_OPERATION', 'Tool ID is missing or empty.'),
    };
  }

  if (REJECTED_NON_PDF_GENERATOR_IDS.has(rawId)) {
    return {
      supported: false,
      requestedToolId: rawId,
      isAlias: false,
      target: 'UNSUPPORTED',
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${rawId}" is a formula/estimation calculator and is not a binary PDF processing operation.`,
        { requestedToolId: rawId, reason: 'NON_PDF_GENERATOR_TOOL' }
      ),
    };
  }

  const mappedCanonical = WORKSPACE_EXTENDED_ALIAS_MAP[rawId] ?? rawId;
  const resolved = resolvePdfOperationCapabilities(mappedCanonical);

  if (!resolved.supported || !resolved.capabilities) {
    return {
      supported: false,
      requestedToolId: rawId,
      isAlias: false,
      target: 'UNSUPPORTED',
      error:
        resolved.error ||
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unregistered PDF tool ID: "${rawId}".`,
          { requestedToolId: rawId }
        ),
    };
  }

  const cap = resolved.capabilities;

  if (options.expectedModule && cap.module !== options.expectedModule) {
    return {
      supported: false,
      requestedToolId: rawId,
      canonicalId: cap.canonicalId,
      isAlias: rawId !== cap.canonicalId,
      target: 'UNSUPPORTED',
      module: cap.module,
      capabilities: cap,
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}", not "${options.expectedModule}".`,
        {
          requestedToolId: rawId,
          canonicalId: cap.canonicalId,
          actualModule: cap.module,
          expectedModule: options.expectedModule,
        }
      ),
    };
  }

  const isDocConverter =
    cap.module === 'conversion-extraction' &&
    ![
      'pdf-images-to-pdf',
      'pdf-to-images',
      'pdf-extract-images',
      'pdf-image-extraction-tool',
      'pdf-to-text',
    ].includes(cap.canonicalId);

  return {
    supported: true,
    requestedToolId: rawId,
    canonicalId: cap.canonicalId,
    isAlias: rawId !== cap.canonicalId,
    target: isDocConverter ? 'V2_DOCUMENT_CONVERTER' : 'V2_PDF_ENGINE',
    module: cap.module,
    capabilities: cap,
  };
}

/**
 * UI configuration descriptor derived from the V2 registry for `PdfToolsWorkspace.tsx`
 * so the workspace dynamically adapts file input `accept`, `multiple`, second-file dropzone,
 * and tool-specific parameter controls without altering the visual theme or layout.
 */
export interface PdfWorkspaceToolUiConfigV2 {
  canonicalId: string;
  module: PdfModuleName;
  acceptAttribute: string;
  allowMultiplePrimaryFiles: boolean;
  requiresSecondFileDropzone: boolean;
  supportsThumbnailSelection: boolean;
  showsPageRangeInput: boolean;
  showsTextInput: boolean;
  textInputLabel: string;
  textInputPlaceholder: string;
  showsAddTextControls: boolean;
  showsMetadataFields: boolean;
  showsRotationSelector: boolean;
  showsCropMarginInput: boolean;
  showsPageSizeSelector: boolean;
  showsSplitChunkInput: boolean;
  showsPasswordInputs: 'none' | 'protect' | 'unlock-or-open';
  showsImageFormatSelector: boolean;
  showsOcrControls: boolean;
  disclosedLimitations: string[];
}

export function getWorkspaceToolUiConfigV2(toolId: string): PdfWorkspaceToolUiConfigV2 {
  const res = resolvePdfWorkspaceToolV2(toolId);
  const canonicalId = res.canonicalId || toolId;
  const cap = res.capabilities;

  const acceptAttribute = cap?.acceptedFileTypes || '.pdf,application/pdf';
  const allowMultiplePrimaryFiles =
    canonicalId === 'pdf-merge' ||
    canonicalId === 'pdf-extractor-merger' ||
    canonicalId === 'pdf-images-to-pdf';
  const requiresSecondFileDropzone = canonicalId === 'pdf-comparison';
  const supportsThumbnailSelection = Boolean(cap?.supportsThumbnailSelection);

  const showsPageRangeInput = [
    'pdf-split',
    'pdf-extract-pages',
    'pdf-page-extraction-tool',
    'pdf-delete-pages',
    'pdf-reorder-pages',
    'pdf-page-reordering-tool',
    'pdf-rotate-pages',
    'pdf-page-rotation-tool',
    'pdf-extractor-merger',
    'pdf-add-text',
    'pdf-page-resizer',
  ].includes(canonicalId);

  const showsTextInput = [
    'pdf-add-watermark',
    'pdf-add-text',
    'pdf-page-numbering-header-watermark-tool',
  ].includes(canonicalId);

  let textInputLabel = 'Text';
  let textInputPlaceholder = 'Enter text...';
  if (canonicalId === 'pdf-add-watermark') {
    textInputLabel = 'Watermark Text';
    textInputPlaceholder = 'CONFIDENTIAL';
  } else if (canonicalId === 'pdf-add-text') {
    textInputLabel = 'Text to Insert on Page';
    textInputPlaceholder = 'Approved / Signed Copy';
  } else if (canonicalId === 'pdf-page-numbering-header-watermark-tool') {
    textInputLabel = 'Header / Watermark Label';
    textInputPlaceholder = 'Document Header';
  }

  const showsAddTextControls = canonicalId === 'pdf-add-text';
  const showsMetadataFields = canonicalId === 'pdf-metadata-editor';
  const showsRotationSelector =
    canonicalId === 'pdf-rotate-pages' || canonicalId === 'pdf-page-rotation-tool';
  const showsCropMarginInput = canonicalId === 'pdf-crop-pages';
  const showsPageSizeSelector = canonicalId === 'pdf-page-resizer';
  const showsSplitChunkInput =
    canonicalId === 'pdf-split-by-page-count-tool' || canonicalId === 'pdf-split';

  let showsPasswordInputs: 'none' | 'protect' | 'unlock-or-open' = 'unlock-or-open';
  if (canonicalId === 'pdf-protect-password') {
    showsPasswordInputs = 'protect';
  } else if (canonicalId === 'pdf-images-to-pdf') {
    showsPasswordInputs = 'none';
  }

  const showsImageFormatSelector = canonicalId === 'pdf-to-images';
  const showsOcrControls = canonicalId === 'pdf-ocr' || canonicalId === 'pdf-to-text';

  return {
    canonicalId,
    module: cap?.module || 'page-organization',
    acceptAttribute,
    allowMultiplePrimaryFiles,
    requiresSecondFileDropzone,
    supportsThumbnailSelection,
    showsPageRangeInput,
    showsTextInput,
    textInputLabel,
    textInputPlaceholder,
    showsAddTextControls,
    showsMetadataFields,
    showsRotationSelector,
    showsCropMarginInput,
    showsPageSizeSelector,
    showsSplitChunkInput,
    showsPasswordInputs,
    showsImageFormatSelector,
    showsOcrControls,
    disclosedLimitations: cap?.disclosedLimitations || [],
  };
}

/**
 * High-level workspace parameter bag passed from `PdfToolsWorkspace.tsx` or programmatic callers.
 */
export interface PdfWorkspaceExecutionParamsV2 {
  /** 0-based page indices toggled in `PdfThumbnailPreview` */
  selectedPageIndices?: number[];
  /** 1-based page range or reorder expression (e.g. "1-3, 5" or "3, 1, 2") */
  pageRangeText?: string;
  /** Primary text input (watermark text, inserted text, header text, or metadata title) */
  paramText?: string;
  /** Text insertion parameters for `pdf-add-text` (DEF-12R-02) */
  textX?: number;
  textY?: number;
  textCoordinateOrigin?: 'bottom-left' | 'top-left';
  textFontSize?: number;
  textFontFamily?: 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  textOpacity?: number;
  textRotationDegrees?: number;
  /** Metadata fields for `pdf-metadata-editor` */
  metadataTitle?: string;
  metadataAuthor?: string;
  metadataSubject?: string;
  metadataKeywords?: string | string[];
  /** Rotation angle in degrees (90, 180, 270) */
  rotationAngle?: number;
  /** Uniform crop margin in points for `pdf-crop-pages` */
  cropMarginPt?: number;
  /** Target page size preset and custom dimensions for `pdf-page-resizer` (DEF-12R-02) */
  pageSizePreset?: StandardPdfPageSizePreset;
  customPageWidth?: number;
  customPageHeight?: number;
  pageSizeUnit?: 'pt' | 'mm' | 'in';
  pageOrientation?: 'portrait' | 'landscape' | 'auto';
  pageFitMode?: 'contain-center' | 'stretch' | 'pad-center';
  /** Pages per chunk for `pdf-split-by-page-count-tool` or `pdf-split` */
  pagesPerChunk?: number;
  /** Password to open an encrypted input PDF or remove password in `pdf-remove-password` */
  password?: string;
  /** User password to apply in `pdf-protect-password` */
  userPassword?: string;
  /** Owner password to apply in `pdf-protect-password` */
  ownerPassword?: string;
  /** Output image format for `pdf-to-images` ('png' | 'jpeg') */
  imageFormat?: 'png' | 'jpeg';
  /** OCR language for `pdf-ocr` / `pdf-to-text` ('eng' | 'spa' | 'eng+spa') */
  ocrLanguage?: 'eng' | 'spa' | 'eng+spa';
  /** Enable OCR fallback in `pdf-to-text` */
  enableOcrFallback?: boolean;
  /** Additional raw engine options forwarded directly to V2 engines */
  engineOptions?: Record<string, unknown>;
}

/**
 * Builds a normalized `PdfPageSelection` and operation-specific `options` object
 * from `PdfWorkspaceExecutionParamsV2`.
 */
export function buildNormalizedV2RequestFromWorkspaceParams(
  toolId: string,
  inputs: PdfDocumentInput[],
  secondaryInputs: PdfDocumentInput[] = [],
  params: PdfWorkspaceExecutionParamsV2 = {},
  callbacks: {
    signal?: AbortSignal;
    onProgress?: PdfProgressCallback;
  } = {}
): PdfOperationRequest<Record<string, unknown>> {
  const res = resolvePdfWorkspaceToolV2(toolId);
  const canonicalId = res.canonicalId || toolId;

  // Convert 0-based selectedPageIndices from PdfThumbnailPreview into 1-based page numbers
  const zeroBasedFromThumbnails =
    Array.isArray(params.selectedPageIndices) && params.selectedPageIndices.length > 0
      ? [...params.selectedPageIndices]
      : undefined;
  const oneBasedFromThumbnails =
    zeroBasedFromThumbnails && zeroBasedFromThumbnails.length > 0
      ? zeroBasedFromThumbnails.map((idx) => idx + 1)
      : undefined;

  const trimmedRange = typeof params.pageRangeText === 'string' ? params.pageRangeText.trim() : '';

  let pageSelection: PdfPageSelection | undefined;
  if (trimmedRange.length > 0) {
    pageSelection = {
      mode: 'range-string',
      rangeExpression: trimmedRange,
    };
  } else if (zeroBasedFromThumbnails && zeroBasedFromThumbnails.length > 0) {
    pageSelection = {
      mode: 'indices',
      indices: zeroBasedFromThumbnails,
    };
  }

  // Propagate open password onto inputs if provided
  const openPassword = params.password;
  const normalizedInputs: PdfDocumentInput[] = inputs.map((inp) => ({
    ...inp,
    bytes: safeCloneUint8Array(inp.bytes),
    password: inp.password ?? (openPassword && openPassword.length > 0 ? openPassword : undefined),
  }));

  const normalizedSecondaryInputs: PdfDocumentInput[] = secondaryInputs.map((inp) => ({
    ...inp,
    bytes: safeCloneUint8Array(inp.bytes),
    password: inp.password ?? (openPassword && openPassword.length > 0 ? openPassword : undefined),
  }));

  const opts: Record<string, unknown> = {
    ...(params.engineOptions || {}),
  };

  if (openPassword && openPassword.length > 0 && opts.password === undefined) {
    opts.password = openPassword;
  }

  switch (canonicalId) {
    case 'pdf-split': {
      if (trimmedRange.length > 0) {
        opts.splitMode = opts.splitMode ?? 'ranges';
        opts.rangeGroups = opts.rangeGroups ?? trimmedRange.split(';').map((s) => s.trim()).filter(Boolean);
      } else if (oneBasedFromThumbnails && oneBasedFromThumbnails.length > 0) {
        opts.splitMode = opts.splitMode ?? 'ranges';
        opts.rangeGroups = opts.rangeGroups ?? [oneBasedFromThumbnails.join(',')];
      } else if (typeof params.pagesPerChunk === 'number' && params.pagesPerChunk >= 1) {
        opts.splitMode = opts.splitMode ?? 'by-page-count';
        opts.pagesPerChunk = params.pagesPerChunk;
      } else {
        opts.splitMode = opts.splitMode ?? 'every-page';
      }
      break;
    }

    case 'pdf-split-by-page-count-tool': {
      opts.splitMode = 'by-page-count';
      opts.pagesPerChunk =
        opts.pagesPerChunk ??
        (typeof params.pagesPerChunk === 'number' && params.pagesPerChunk >= 1
          ? params.pagesPerChunk
          : Number(params.paramText) >= 1
            ? Number(params.paramText)
            : 1);
      break;
    }

    case 'pdf-extract-pages':
    case 'pdf-page-extraction-tool':
    case 'pdf-delete-pages': {
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-reorder-pages':
    case 'pdf-page-reordering-tool': {
      if (!opts.newOrder && !opts.order && !opts.permutation) {
        if (trimmedRange.length > 0) {
          const parsedOrder = trimmedRange
            .split(/[\s,;]+/)
            .map((tok) => Number(tok.trim()))
            .filter((n) => Number.isInteger(n) && n >= 1);
          if (parsedOrder.length > 0) {
            opts.newOrder = parsedOrder;
            opts.indexing = '1-based';
          }
        } else if (oneBasedFromThumbnails && oneBasedFromThumbnails.length > 0) {
          opts.newOrder = oneBasedFromThumbnails;
          opts.indexing = '1-based';
        }
      }
      break;
    }

    case 'pdf-rotate-pages':
    case 'pdf-page-rotation-tool': {
      const angle =
        typeof params.rotationAngle === 'number'
          ? params.rotationAngle
          : Number(params.paramText) || 90;
      opts.angleDegrees = opts.angleDegrees ?? angle;
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-add-watermark': {
      const wmText =
        typeof opts.text === 'string'
          ? opts.text
          : params.paramText && params.paramText.trim().length > 0
            ? params.paramText.trim()
            : 'CONFIDENTIAL';
      opts.text = wmText;
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-add-page-numbers': {
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-page-numbering-header-watermark-tool': {
      const label =
        params.paramText && params.paramText.trim().length > 0
          ? params.paramText.trim()
          : undefined;
      if (label && !opts.headerText) {
        opts.headerText = label;
      }
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-add-text': {
      const textVal =
        typeof opts.text === 'string'
          ? opts.text
          : params.paramText && params.paramText.trim().length > 0
            ? params.paramText.trim()
            : 'Added Text Annotation';
      opts.text = textVal;
      opts.x = opts.x !== undefined ? opts.x : params.textX !== undefined ? params.textX : 50;
      opts.y = opts.y !== undefined ? opts.y : params.textY !== undefined ? params.textY : 700;
      if (params.textCoordinateOrigin !== undefined && opts.coordinateOrigin === undefined) {
        opts.coordinateOrigin = params.textCoordinateOrigin;
      }
      if (params.textFontSize !== undefined && opts.fontSize === undefined) {
        opts.fontSize = params.textFontSize;
      }
      if (params.textFontFamily !== undefined && opts.fontFamily === undefined) {
        opts.fontFamily = params.textFontFamily;
      }
      if (params.textColor !== undefined && opts.color === undefined) {
        opts.color = params.textColor;
      }
      if (params.textAlign !== undefined && opts.align === undefined) {
        opts.align = params.textAlign;
      }
      if (params.textOpacity !== undefined && opts.opacity === undefined) {
        opts.opacity = params.textOpacity;
      }
      if (params.textRotationDegrees !== undefined && opts.rotationDegrees === undefined) {
        opts.rotationDegrees = params.textRotationDegrees;
      }
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-crop-pages': {
      const margin =
        typeof params.cropMarginPt === 'number' && params.cropMarginPt >= 0
          ? params.cropMarginPt
          : Number(params.paramText) > 0
            ? Number(params.paramText)
            : 20;
      if (!opts.margins && !opts.cropBox) {
        opts.margins = { top: margin, right: margin, bottom: margin, left: margin };
      }
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-page-resizer': {
      opts.preset = opts.preset ?? params.pageSizePreset ?? 'A4';
      if (params.customPageWidth !== undefined && opts.width === undefined) {
        opts.width = params.customPageWidth;
      }
      if (params.customPageHeight !== undefined && opts.height === undefined) {
        opts.height = params.customPageHeight;
      }
      if (params.pageSizeUnit !== undefined && opts.unit === undefined) {
        opts.unit = params.pageSizeUnit;
      }
      if (params.pageOrientation !== undefined && opts.orientation === undefined) {
        opts.orientation = params.pageOrientation;
      }
      if (params.pageFitMode !== undefined && opts.fitMode === undefined) {
        opts.fitMode = params.pageFitMode;
      }
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-metadata-editor': {
      const title =
        params.metadataTitle !== undefined
          ? params.metadataTitle
          : params.paramText && params.paramText.trim().length > 0
            ? params.paramText.trim()
            : undefined;
      if (title !== undefined && opts.title === undefined) opts.title = title;
      if (params.metadataAuthor !== undefined && opts.author === undefined) {
        opts.author = params.metadataAuthor;
      }
      if (params.metadataSubject !== undefined && opts.subject === undefined) {
        opts.subject = params.metadataSubject;
      }
      if (params.metadataKeywords !== undefined && opts.keywords === undefined) {
        opts.keywords = params.metadataKeywords;
      }
      break;
    }

    case 'pdf-to-images': {
      opts.format = opts.format ?? params.imageFormat ?? 'png';
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-to-text': {
      if (params.enableOcrFallback !== undefined && opts.enableOcrFallback === undefined) {
        opts.enableOcrFallback = params.enableOcrFallback;
      }
      if (params.ocrLanguage && opts.ocrLanguage === undefined) {
        opts.ocrLanguage = params.ocrLanguage;
      }
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-extract-images':
    case 'pdf-image-extraction-tool': {
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    case 'pdf-protect-password': {
      const userPass =
        params.userPassword ??
        params.password ??
        (params.paramText && params.paramText.length > 0 ? params.paramText : undefined);
      if (userPass !== undefined && opts.userPassword === undefined) {
        opts.userPassword = userPass;
      }
      if (params.ownerPassword !== undefined && opts.ownerPassword === undefined) {
        opts.ownerPassword = params.ownerPassword;
      }
      break;
    }

    case 'pdf-remove-password': {
      const unlockPass =
        params.password ??
        params.userPassword ??
        (params.paramText && params.paramText.length > 0 ? params.paramText : undefined);
      if (unlockPass !== undefined && opts.password === undefined) {
        opts.password = unlockPass;
      }
      break;
    }

    case 'pdf-ocr': {
      opts.language = opts.language ?? params.ocrLanguage ?? 'eng';
      if (pageSelection && !opts.selection) {
        opts.selection = pageSelection;
      }
      break;
    }

    default:
      break;
  }

  return {
    toolId,
    inputs: normalizedInputs,
    secondaryInputs: normalizedSecondaryInputs.length > 0 ? normalizedSecondaryInputs : undefined,
    pageSelection,
    options: opts,
    signal: callbacks.signal,
    onProgress: callbacks.onProgress,
  };
}

function inferExtensionFromFileName(fileName: string | undefined, mimeType?: string): string {
  if (fileName && fileName.includes('.')) {
    const ext = fileName.slice(fileName.lastIndexOf('.') + 1).trim().toLowerCase();
    if (ext.length > 0) return ext;
  }
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/zip') return 'zip';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'text/plain') return 'txt';
  if (mimeType === 'application/json') return 'json';
  return 'bin';
}

export type PdfWorkspaceOperationResultV2 = PdfOperationResult & {
  toolId?: string;
  canonicalToolId?: string;
  primaryOutput?: PdfGeneratedFile & { extension: string };
  outputs: Array<PdfGeneratedFile & { extension: string }>;
};

function enrichResultWithWorkspaceAliases(
  result: PdfOperationResult,
  requestedToolId: string,
  canonicalId: string
): PdfWorkspaceOperationResultV2 {
  const rawOutputs = Array.isArray(result.outputFiles) ? result.outputFiles : [];
  const enrichedOutputs = rawOutputs.map((f) => ({
    ...f,
    extension: inferExtensionFromFileName(f.fileName, f.mimeType),
  }));
  const rawPrimary = result.primaryFile || rawOutputs[0];
  const enrichedPrimary = rawPrimary
    ? {
        ...rawPrimary,
        extension: inferExtensionFromFileName(rawPrimary.fileName, rawPrimary.mimeType),
      }
    : undefined;

  return {
    ...result,
    resolvedCanonicalId: result.resolvedCanonicalId || canonicalId,
    toolId: requestedToolId,
    canonicalToolId: result.resolvedCanonicalId || canonicalId,
    primaryFile: rawPrimary,
    primaryOutput: enrichedPrimary,
    outputFiles: rawOutputs,
    outputs: enrichedOutputs,
    outputBytes: result.outputBytes ?? rawPrimary?.bytes,
  };
}

function buildIntegrationFailureResult(
  toolId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytes = 0
): PdfWorkspaceOperationResultV2 {
  const durationMs = Math.max(0, Math.round((performance.now() - startTime) * 100) / 100);
  const canonicalId = PDF_TOOL_ALIAS_MAP[toolId] || WORKSPACE_EXTENDED_ALIAS_MAP[toolId] || toolId;
  return {
    status: error.status,
    resolvedCanonicalId: canonicalId,
    toolId,
    canonicalToolId: canonicalId,
    outputFiles: [],
    outputs: [],
    summary: error.message,
    metrics: {
      inputBytes,
      outputBytes: 0,
      durationMs,
    },
    warnings: [],
    limitations: [],
    error,
  };
}

/**
 * Primary V2 Workspace Integration Dispatcher.
 *
 * Routes any `PdfOperationRequest` to its authoritative V2 Engine (Engines B–H) using
 * `PDF_TOOL_OPERATION_REGISTRY` (`src/services/pdf/v2/pdfRegistry.ts`).
 *
 * - Never silently redirects unknown or failed operations to compression or V1.
 * - Enforces input buffer immutability by cloning input bytes before engine dispatch
 *   and zero-wiping internal working copies upon completion.
 */
export async function executePdfWorkspaceOperationV2(
  request: PdfOperationRequest<Record<string, unknown>>,
  routingOptions: { expectedModule?: PdfModuleName } = {}
): Promise<PdfWorkspaceOperationResultV2> {
  const startTime = performance.now();
  const totalInputBytes =
    (request?.inputs || []).reduce((acc, f) => acc + inspectByteLength(f?.bytes), 0) +
    (request?.secondaryInputs || []).reduce((acc, f) => acc + inspectByteLength(f?.bytes), 0);

  if (request?.signal?.aborted) {
    return buildIntegrationFailureResult(
      request?.toolId || 'unknown',
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'PDF operation was cancelled before execution.'),
      startTime,
      totalInputBytes
    );
  }

  const resolution = resolvePdfWorkspaceToolV2(request?.toolId, routingOptions);
  if (!resolution.supported || !resolution.capabilities || !resolution.canonicalId) {
    return buildIntegrationFailureResult(
      request?.toolId || 'unknown',
      resolution.error ||
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unregistered PDF tool ID: "${request?.toolId}".`
        ),
      startTime,
      totalInputBytes
    );
  }

  const canonicalId = resolution.canonicalId;
  const moduleName = resolution.capabilities.module;

  // Clone all input and secondary input buffers so caller-owned Uint8Arrays are never mutated
  const isolatedInputs: PdfDocumentInput[] = (request.inputs || []).map((inp) => ({
    ...inp,
    bytes: safeCloneUint8Array(inp.bytes),
  }));
  const isolatedSecondaryInputs: PdfDocumentInput[] | undefined = request.secondaryInputs
    ? request.secondaryInputs.map((inp) => ({
        ...inp,
        bytes: safeCloneUint8Array(inp.bytes),
      }))
    : undefined;

  const normalizedRequest: PdfOperationRequest<Record<string, unknown>> = {
    ...request,
    toolId: canonicalId,
    inputs: isolatedInputs,
    secondaryInputs: isolatedSecondaryInputs,
  };

  try {
    let rawResult: PdfOperationResult;
    switch (moduleName) {
      case 'page-organization':
        rawResult = await executePageOrganizationOperationV2(normalizedRequest);
        break;

      case 'editing-geometry':
        rawResult = await executeEditingGeometryOperationV2(normalizedRequest);
        break;

      case 'conversion-extraction':
        rawResult = await executeConversionExtractionOperationV2(normalizedRequest);
        break;

      case 'inspection-analysis':
        rawResult = await executeInspectionAnalysisOperationV2(normalizedRequest);
        break;

      case 'optimization-repair':
        rawResult = await executeOptimizationRepairOperationV2(normalizedRequest);
        break;

      case 'security':
        rawResult = await executeSecurityOperationV2(normalizedRequest);
        break;

      case 'ocr':
        rawResult = await executeOcrOperationV2(normalizedRequest);
        break;

      default:
        return buildIntegrationFailureResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_UNSUPPORTED_OPERATION',
            `Unsupported V2 PDF module "${moduleName}" for tool "${canonicalId}".`
          ),
          startTime,
          totalInputBytes
        );
    }

    return enrichResultWithWorkspaceAliases(rawResult, request.toolId, canonicalId);
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildIntegrationFailureResult(canonicalId, procErr, startTime, totalInputBytes);
  } finally {
    // Scrub temporary cloned buffers after engine finishes
    for (const inp of isolatedInputs) {
      if (inp.bytes instanceof Uint8Array) {
        inp.bytes.fill(0);
      }
    }
    if (isolatedSecondaryInputs) {
      for (const inp of isolatedSecondaryInputs) {
        if (inp.bytes instanceof Uint8Array) {
          inp.bytes.fill(0);
        }
      }
    }
  }
}

/**
 * Browser `File[]` convenience wrapper used directly by `PdfToolsWorkspace.tsx`.
 * Reads browser `File` objects into isolated `Uint8Array` buffers, normalizes workspace UI
 * controls into V2 engine options, and executes `executePdfWorkspaceOperationV2`.
 */
export async function executePdfWorkspaceFilesV2(params: {
  toolId: string;
  files: File[];
  secondaryFiles?: File[];
  workspaceParams?: PdfWorkspaceExecutionParamsV2;
  signal?: AbortSignal;
  onProgress?: PdfProgressCallback;
}): Promise<PdfWorkspaceOperationResultV2> {
  const startTime = performance.now();
  const { toolId, files, secondaryFiles = [], workspaceParams = {}, signal, onProgress } = params;

  if (signal?.aborted) {
    return buildIntegrationFailureResult(
      toolId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'PDF operation was cancelled before execution.'),
      startTime,
      0
    );
  }

  const resolution = resolvePdfWorkspaceToolV2(toolId);
  if (!resolution.supported || !resolution.capabilities || !resolution.canonicalId) {
    return buildIntegrationFailureResult(
      toolId,
      resolution.error || createPdfProcessingError('ERR_UNSUPPORTED_OPERATION'),
      startTime,
      0
    );
  }

  if (!Array.isArray(files) || files.length === 0) {
    return buildIntegrationFailureResult(
      resolution.canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'Please upload at least one file before processing.'),
      startTime,
      0
    );
  }

  onProgress?.({
    stage: 'LOADING',
    phase: 'reading',
    percent: 5,
    message: 'Reading uploaded file(s) locally in browser memory...',
  });

  const convertFileToInput = async (f: File): Promise<PdfDocumentInput> => {
    const buf = await f.arrayBuffer();
    return {
      fileName: f.name,
      mimeType: f.type || undefined,
      bytes: clonePdfBytes(buf),
    };
  };

  // For pdf-comparison, allow user to either select 2 files in the primary dropzone or 1 primary + 1 secondary
  let primaryFilesList = files;
  let secondaryFilesList = secondaryFiles;
  if (resolution.canonicalId === 'pdf-comparison' && files.length >= 2 && secondaryFiles.length === 0) {
    primaryFilesList = [files[0]];
    secondaryFilesList = [files[1]];
  } else if (
    (resolution.canonicalId === 'pdf-merge' || resolution.canonicalId === 'pdf-extractor-merger') &&
    secondaryFiles.length > 0
  ) {
    primaryFilesList = [...files, ...secondaryFiles];
    secondaryFilesList = [];
  }

  const inputs = await Promise.all(primaryFilesList.map(convertFileToInput));
  const secInputs = await Promise.all(secondaryFilesList.map(convertFileToInput));

  const request = buildNormalizedV2RequestFromWorkspaceParams(
    resolution.canonicalId,
    inputs,
    secInputs,
    workspaceParams,
    { signal, onProgress }
  );

  return await executePdfWorkspaceOperationV2(request);
}

export type DocumentConverterV2WorkspaceResult = ConversionOutput & {
  pdfIntegrityVerified: boolean;
  v2Status: PdfOperationResult['status'];
  resolvedCanonicalId: string;
};

/**
 * V2 Document Converter Workspace Dispatcher used by `DocumentConvertersWorkspace.tsx` (DEF-12R-01).
 *
 * Routes all 20 document converters through `executePdfWorkspaceOperationV2` ->
 * `executeConversionExtractionOperationV2` -> `executeDocumentConverterV2`:
 *   - All 10 PDF-producing converters receive V2 PDF output integrity verification
 *     (`verifyPdfOutputIntegrity` with PDF.js reopening via `pdfOutputIntegrity.ts`).
 *   - All 10 non-PDF-producing converters use their format-appropriate conversion
 *     and validation pathway without forcing PDF validation onto non-PDF outputs.
 */
export async function executeDocumentConverterWorkspaceV2(
  toolId: DocumentConverterId,
  fileName: string,
  bytes: Uint8Array,
  options: ConversionOptions = {},
  onProgress?: (pct: number, msg: string) => void,
  signal?: AbortSignal
): Promise<DocumentConverterV2WorkspaceResult> {
  const res = await executePdfWorkspaceOperationV2({
    toolId,
    inputs: [{ fileName, bytes }],
    options: { ...options } as Record<string, unknown>,
    signal,
    onProgress: (prog) => {
      if (onProgress) {
        onProgress(prog.percent ?? 50, prog.message || '');
      }
    },
  });

  if (res.status !== 'SUCCESS' || res.error) {
    const errMessage = res.error?.message || res.summary || 'Document conversion failed.';
    const err = new Error(errMessage) as Error & {
      code?: string;
      status?: string;
      messageEs?: string;
      recoverableHint?: string;
      pdfError?: typeof res.error;
    };
    if (res.error) {
      err.pdfError = res.error;
      if (res.error.code) err.code = res.error.code;
      if (res.error.status) err.status = res.error.status;
      if (res.error.messageEs) err.messageEs = res.error.messageEs;
      if (res.error.recoverableHint) err.recoverableHint = res.error.recoverableHint;
    }
    throw err;
  }

  const details = (res.details || {}) as Record<string, any>;
  const rawConv = details.rawConversionOutput as ConversionOutput | undefined;
  const primary = res.primaryOutput || res.primaryFile || res.outputFiles[0];
  const outBytes = rawConv?.bytes ?? primary?.bytes ?? res.outputBytes ?? new Uint8Array(0);
  const mimeType = rawConv?.mimeType ?? primary?.mimeType ?? 'application/octet-stream';
  const outFileName = rawConv?.fileName ?? primary?.fileName ?? fileName;
  const stats = rawConv?.stats ?? details.stats ?? {
    inputSizeBytes: res.metrics.inputBytes,
    outputSizeBytes: outBytes.byteLength,
    pageCount: res.metrics.outputPageCount,
    conversionTimeMs: Math.round(res.metrics.durationMs),
  };

  return {
    fileName: outFileName,
    mimeType,
    bytes: outBytes,
    previewText: rawConv?.previewText ?? res.previewText,
    previewHtml: rawConv?.previewHtml ?? res.previewHtml,
    previewTable: rawConv?.previewTable ?? res.previewTable,
    previewImages:
      rawConv?.previewImages ??
      res.previewImages?.map((img) => ({
        name: img.label,
        dataUrl: img.dataUrl || '',
        width: img.width,
        height: img.height,
      })),
    summary: res.summary,
    warnings: res.warnings,
    limitations: res.limitations,
    stats,
    pdfIntegrityVerified: Boolean(details.pdfIntegrityVerified ?? (mimeType === 'application/pdf')),
    v2Status: res.status,
    resolvedCanonicalId: res.resolvedCanonicalId || toolId,
  };
}

/**
 * Explicit V1 legacy compatibility accessor.
 * Preserves access to `src/services/pdf/pdfCoreEngine.ts` (V1) for explicit legacy callers
 * (including `pdf-duplicate-pages`) while guaranteeing that V1 is NEVER silently used as a
 * fallback when a V2 operation fails.
 */
export const preservedV1PdfCoreEngine = v1PdfEngine;

export {
  PDF_TOOL_ALIAS_MAP,
  PDF_TOOL_OPERATION_REGISTRY,
  formatByteSize,
  resolvePdfOperationCapabilities,
  terminateOcrWorkerPoolV2,
};

