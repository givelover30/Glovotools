/**
 * CALCTOOLS PDF ENGINE 2.0 — PHASE PDF-08A: INSPECTION & ANALYSIS ENGINE (ENGINE E)
 *
 * Isolated V2 implementation of the 5 canonical PDF Inspection & Analysis tools:
 *   1. `pdf-page-counter` (Catalog Index 1511) — `countPdfPagesV2`
 *   2. `pdf-metadata-viewer` (Catalog Index 1512) — `inspectPdfMetadataV2`
 *   3. `pdf-comparison` (Catalog Index 1515) — `comparePdfDocumentsV2`
 *   4. `pdf-blank-page-detector` (Catalog Index 1517) — `detectBlankPdfPagesV2`
 *   5. `pdf-file-size-analyzer` (Catalog Index 1518) — `analyzePdfFileSizeV2`
 *
 * Plus the canonical Engine E router:
 *   - `executeInspectionAnalysisOperationV2`
 *
 * Architecture & Preservation Principles:
 * - 100% browser-local execution using `@cantoo/pdf-lib@2.11.1` and `pdfjs-dist@5.6.205` (`openManagedPdfDocument`).
 * - Read-only inspection and analysis: caller input byte buffers are defensively cloned and never mutated.
 * - Independent dual-parser verification where applicable (`@cantoo/pdf-lib` + `pdfjs-dist`).
 * - Reuses Engine A (`pdfTypes.ts`, `pdfErrors.ts`, `pdfByteUtils.ts`, `pdfValidation.ts`, `pdfLifecycle.ts`,
 *   `pdfDocumentLoader.ts`, `pdfRegistry.ts`, `pdfPageRangeParser.ts`) without modifying any existing V1 or V2 engine files.
 */

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFPage,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  decodePDFRawStream,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import {
  cloneIsolatedPdfBytes,
  inspectByteLength,
  wipeInternalBuffer,
} from './pdfByteUtils';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfInspectionReport,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfProcessingError,
} from './pdfTypes';

/**
 * ============================================================================
 * 1. SHARED HELPERS & STANDARD PAPER SIZE CLASSIFICATION
 * ============================================================================
 */

export function formatByteSize(bytes: number): string {
  const b = Math.max(0, Number(bytes) || 0);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function stripFileExtension(fileName: string): string {
  const clean = (fileName || 'document').trim();
  const lastDot = clean.lastIndexOf('.');
  return lastDot > 0 ? clean.slice(0, lastDot) : clean;
}

function buildEngineEFailureResult(
  resolvedCanonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytes: number,
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
      durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
    },
    warnings,
    limitations,
    error,
  };
}

function createReportOutputFiles(
  baseFileName: string,
  suffix: string,
  textReport: string,
  jsonPayload: Record<string, unknown>
): {
  primaryFile: PdfOutputFile;
  jsonFile: PdfOutputFile;
  outputFiles: PdfOutputFile[];
} {
  const stem = stripFileExtension(baseFileName);
  const txtBytes = new TextEncoder().encode(textReport);
  const jsonBytes = new TextEncoder().encode(JSON.stringify(jsonPayload, null, 2));

  const primaryFile: PdfOutputFile = {
    fileName: `${stem}_${suffix}.txt`,
    mimeType: 'text/plain',
    bytes: txtBytes,
    byteLength: txtBytes.byteLength,
  };

  const jsonFile: PdfOutputFile = {
    fileName: `${stem}_${suffix}.json`,
    mimeType: 'application/json',
    bytes: jsonBytes,
    byteLength: jsonBytes.byteLength,
  };

  return {
    primaryFile,
    jsonFile,
    outputFiles: [primaryFile, jsonFile],
  };
}

/**
 * Classifies a PDF page's effective dimensions in points (72 pt = 1 inch) into a standard paper format
 * (`US Letter`, `A4`, `US Legal`, `A3`, `A5`, `Tabloid`, or `Custom`) with a +/- 3 pt tolerance.
 */
export function classifyStandardPaperSizePt(widthPt: number, heightPt: number): string {
  const minDim = Math.min(widthPt, heightPt);
  const maxDim = Math.max(widthPt, heightPt);

  const presets: Array<{ name: string; w: number; h: number }> = [
    { name: 'US Letter', w: 612, h: 792 },
    { name: 'A4', w: 595.28, h: 841.89 },
    { name: 'US Legal', w: 612, h: 1008 },
    { name: 'Tabloid / Ledger', w: 792, h: 1224 },
    { name: 'A3', w: 841.89, h: 1190.55 },
    { name: 'A5', w: 419.53, h: 595.28 },
    { name: 'Executive', w: 522, h: 756 },
  ];

  for (const p of presets) {
    if (Math.abs(minDim - p.w) <= 3.5 && Math.abs(maxDim - p.h) <= 3.5) {
      return p.name;
    }
  }
  return `Custom (${Math.round(widthPt * 100) / 100} × ${Math.round(heightPt * 100) / 100} pt)`;
}

export function classifyPageOrientation(
  effectiveWidthPt: number,
  effectiveHeightPt: number
): 'portrait' | 'landscape' | 'square' {
  if (Math.abs(effectiveWidthPt - effectiveHeightPt) <= 1.0) {
    return 'square';
  }
  return effectiveWidthPt > effectiveHeightPt ? 'landscape' : 'portrait';
}

function extractBoxDimensions(page: PDFPage, getter: () => { x: number; y: number; width: number; height: number }): {
  x: number;
  y: number;
  widthPt: number;
  heightPt: number;
} {
  try {
    const b = getter();
    return {
      x: Math.round(b.x * 100) / 100,
      y: Math.round(b.y * 100) / 100,
      widthPt: Math.round(b.width * 100) / 100,
      heightPt: Math.round(b.height * 100) / 100,
    };
  } catch {
    const size = page.getSize();
    return {
      x: 0,
      y: 0,
      widthPt: Math.round(size.width * 100) / 100,
      heightPt: Math.round(size.height * 100) / 100,
    };
  }
}

/**
 * Compute FNV-1a 32-bit hex digest of a byte buffer for deterministic content hashing.
 */
function computeFnv1aHex(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.byteLength; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * ============================================================================
 * 2. TOOL 1: PDF PAGE COUNTER (`pdf-page-counter`)
 * ============================================================================
 */

export interface PdfPageDimensionEntry {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  effectiveWidthPt: number;
  effectiveHeightPt: number;
  widthInches: number;
  heightInches: number;
  widthMm: number;
  heightMm: number;
  rotationDegrees: number;
  orientation: 'portrait' | 'landscape' | 'square';
  paperSizePreset: string;
  mediaBox: { x: number; y: number; widthPt: number; heightPt: number };
  cropBox: { x: number; y: number; widthPt: number; heightPt: number };
}

export interface PdfPageCounterOptions {
  password?: string;
  verifyWithIndependentParser?: boolean;
  signal?: AbortSignal;
}

export interface PdfPageCounterMetadataSummary {
  title: string | null;
  author: string | null;
  subject: string | null;
  keywords: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modificationDate: string | null;
  hasAnyMetadata: boolean;
}

export interface PdfPageCounterReportData {
  fileName: string;
  byteLength: number;
  formattedFileSize: string;
  pageCount: number;
  pdfLibPageCount: number;
  pdfJsPageCount: number;
  parsersAgree: boolean;
  pdfVersion: string;
  isEncrypted: boolean;
  hasUniformPageSize: boolean;
  portraitPageCount: number;
  landscapePageCount: number;
  squarePageCount: number;
  rotatedPageCount: number;
  metadata: PdfPageCounterMetadataSummary;
  pages: PdfPageDimensionEntry[];
}

/**
 * Canonical Tool 1: `pdf-page-counter`
 *
 * Reads the exact page count, document metadata, and per-page geometry of a PDF document using
 * `@cantoo/pdf-lib` and independently cross-verifies the page count with `pdfjs-dist` (`openManagedPdfDocument`).
 * Strictly read-only: never modifies the source PDF buffer.
 */
export async function countPdfPagesV2(
  input: PdfDocumentInput,
  options: PdfPageCounterOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-page-counter';
  const inputBytes = inspectByteLength(input?.bytes);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'Page counter operation was cancelled.'),
      startTime,
      inputBytes
    );
  }

  request?.onProgress?.({
    percent: 15,
    stage: 'VALIDATING',
    message: 'Validating and loading PDF document for page counting...',
  });

  const password = options.password ?? input?.password;
  const loaded = await loadPdfDocumentV2(input, { password });

  if (!loaded.success || !loaded.document || !loaded.isolatedBytes) {
    await loaded.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loaded.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      inputBytes,
      loaded.warnings
    );
  }

  try {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'Page counter operation was cancelled.');
    }

    const doc = loaded.document;
    const pdfLibPageCount = doc.getPageCount();
    const warnings = [...loaded.warnings];

    // Independent verification via PDF.js (also captures decrypted /Info + XMP metadata)
    let pdfJsPageCount = pdfLibPageCount;
    let pdfJsInfo: Record<string, unknown> | null = null;
    let pdfJsXmpGet: ((key: string) => unknown) | null = null;
    const shouldVerifyWithPdfJs = options.verifyWithIndependentParser !== false;
    if (shouldVerifyWithPdfJs) {
      request?.onProgress?.({
        percent: 55,
        stage: 'PROCESSING_PAGES',
        message: 'Cross-verifying page count with independent PDF.js parser...',
      });
      const hasPassword = typeof password === 'string' && password.length > 0;
      const pdfJsSession = await openManagedPdfDocument(
        loaded.isolatedBytes,
        hasPassword ? { password } : {}
      );
      try {
        pdfJsPageCount = pdfJsSession.pdfDoc.numPages;
        try {
          const pdfJsMeta = await pdfJsSession.pdfDoc.getMetadata();
          if (pdfJsMeta?.info && typeof pdfJsMeta.info === 'object') {
            pdfJsInfo = pdfJsMeta.info as Record<string, unknown>;
          }
          if (pdfJsMeta?.metadata && typeof pdfJsMeta.metadata.get === 'function') {
            const xmpObj = pdfJsMeta.metadata;
            pdfJsXmpGet = (key: string) => xmpObj.get(key);
          }
        } catch {
          // Metadata fetch via PDF.js is non-fatal; /Info and XMP inspectors remain available
        }
      } finally {
        await pdfJsSession.dispose();
      }
    }

    const parsersAgree = pdfLibPageCount === pdfJsPageCount;
    if (!parsersAgree) {
      warnings.push(
        `Parser page count discrepancy detected: pdf-lib reported ${pdfLibPageCount} page(s), while PDF.js reported ${pdfJsPageCount} page(s).`
      );
    }

    // Extract document metadata from /Info dictionary and XMP stream (without inventing values)
    let infoInspection = inspectRawPdfInfoDictionary(doc);
    const xmpInspection = inspectXmpMetadataPacket(doc);
    if (loaded.validation.hasEncryptDictionary) {
      const hasCorruptedControlChars = Object.values(infoInspection.standardFields).some(
        (entry) =>
          entry.status === 'PRESENT' &&
          entry.rawValue !== null &&
          /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(entry.rawValue)
      );
      if (hasCorruptedControlChars) {
        try {
          const rawInfoDoc = await PDFDocument.load(loaded.isolatedBytes, {
            ignoreEncryption: true,
            updateMetadata: false,
          });
          const rawInfoCandidate = inspectRawPdfInfoDictionary(rawInfoDoc);
          if (rawInfoCandidate.hasInfoDictionary) {
            infoInspection = rawInfoCandidate;
          }
        } catch {
          // Keep original infoInspection if fallback parse fails
        }
      }
    }

    const pdfJsInfoKeyMap: Record<
      'title' | 'author' | 'subject' | 'keywords' | 'creator' | 'producer' | 'creationDate' | 'modificationDate',
      { infoKey: string; xmpKeys: string[] }
    > = {
      title: { infoKey: 'Title', xmpKeys: ['dc:title'] },
      author: { infoKey: 'Author', xmpKeys: ['dc:creator'] },
      subject: { infoKey: 'Subject', xmpKeys: ['dc:description'] },
      keywords: { infoKey: 'Keywords', xmpKeys: ['pdf:keywords', 'dc:subject'] },
      creator: { infoKey: 'Creator', xmpKeys: ['xmp:creatortool', 'xap:creatortool'] },
      producer: { infoKey: 'Producer', xmpKeys: ['pdf:producer'] },
      creationDate: { infoKey: 'CreationDate', xmpKeys: ['xmp:createdate', 'xap:createdate'] },
      modificationDate: { infoKey: 'ModDate', xmpKeys: ['xmp:modifydate', 'xap:modifydate'] },
    };

    const resolvePdfJsMetaField = (
      field: keyof typeof pdfJsInfoKeyMap,
      isDate: boolean
    ): string | null => {
      const mapping = pdfJsInfoKeyMap[field];
      const rawInfoVal = pdfJsInfo?.[mapping.infoKey];
      if (typeof rawInfoVal === 'string') {
        const trimmed = rawInfoVal.trim();
        if (trimmed.length > 0 && !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(trimmed)) {
          return isDate ? parsePdfOrIsoDateString(trimmed) || trimmed : trimmed;
        }
      }
      if (pdfJsXmpGet) {
        for (const xKey of mapping.xmpKeys) {
          const xVal = pdfJsXmpGet(xKey);
          const strVal = Array.isArray(xVal)
            ? xVal.map((v) => String(v).trim()).filter(Boolean).join(', ')
            : typeof xVal === 'string'
              ? xVal.trim()
              : '';
          if (strVal.length > 0) {
            return isDate ? parsePdfOrIsoDateString(strVal) || strVal : strVal;
          }
        }
      }
      return null;
    };

    const resolveMetaField = (
      field: 'title' | 'author' | 'subject' | 'keywords' | 'creator' | 'producer' | 'creationDate' | 'modificationDate'
    ): string | null => {
      const isDate = field === 'creationDate' || field === 'modificationDate';
      if (loaded.validation.hasEncryptDictionary) {
        const decryptedFromPdfJs = resolvePdfJsMetaField(field, isDate);
        if (decryptedFromPdfJs !== null) {
          return decryptedFromPdfJs;
        }
      }
      const infoEntry = infoInspection.standardFields[field];
      if (infoEntry?.status === 'PRESENT' && infoEntry.rawValue !== null) {
        const trimmed = infoEntry.rawValue.trim();
        if (trimmed.length > 0) {
          return isDate ? parsePdfOrIsoDateString(trimmed) || trimmed : trimmed;
        }
      }
      const xmpEntry = xmpInspection.standardFields[field];
      if (xmpEntry?.status === 'PRESENT' && xmpEntry.rawValue !== null) {
        const trimmed = xmpEntry.rawValue.trim();
        if (trimmed.length > 0) {
          return isDate ? parsePdfOrIsoDateString(trimmed) || trimmed : trimmed;
        }
      }
      return resolvePdfJsMetaField(field, isDate);
    };

    const metadata: PdfPageCounterMetadataSummary = {
      title: resolveMetaField('title'),
      author: resolveMetaField('author'),
      subject: resolveMetaField('subject'),
      keywords: resolveMetaField('keywords'),
      creator: resolveMetaField('creator'),
      producer: resolveMetaField('producer'),
      creationDate: resolveMetaField('creationDate'),
      modificationDate: resolveMetaField('modificationDate'),
      hasAnyMetadata: false,
    };
    metadata.hasAnyMetadata = Boolean(
      metadata.title ||
        metadata.author ||
        metadata.subject ||
        metadata.keywords ||
        metadata.creator ||
        metadata.producer ||
        metadata.creationDate ||
        metadata.modificationDate
    );

    const pages: PdfPageDimensionEntry[] = [];
    let portraitPageCount = 0;
    let landscapePageCount = 0;
    let squarePageCount = 0;
    let rotatedPageCount = 0;

    for (let i = 0; i < pdfLibPageCount; i++) {
      const page = doc.getPage(i);
      const { width, height } = page.getSize();
      const rawRot = page.getRotation().angle;
      const rotationDegrees = (((rawRot % 360) + 360) % 360);
      if (rotationDegrees !== 0) rotatedPageCount++;

      const isQuarterTurn = rotationDegrees === 90 || rotationDegrees === 270;
      const widthPt = Math.round(width * 100) / 100;
      const heightPt = Math.round(height * 100) / 100;
      const effectiveWidthPt = isQuarterTurn ? heightPt : widthPt;
      const effectiveHeightPt = isQuarterTurn ? widthPt : heightPt;

      const orientation = classifyPageOrientation(effectiveWidthPt, effectiveHeightPt);
      if (orientation === 'portrait') portraitPageCount++;
      else if (orientation === 'landscape') landscapePageCount++;
      else squarePageCount++;

      const widthInches = Math.round((effectiveWidthPt / 72) * 100) / 100;
      const heightInches = Math.round((effectiveHeightPt / 72) * 100) / 100;
      const widthMm = Math.round(((effectiveWidthPt * 25.4) / 72) * 10) / 10;
      const heightMm = Math.round(((effectiveHeightPt * 25.4) / 72) * 10) / 10;

      pages.push({
        pageNumber: i + 1,
        widthPt,
        heightPt,
        effectiveWidthPt,
        effectiveHeightPt,
        widthInches,
        heightInches,
        widthMm,
        heightMm,
        rotationDegrees,
        orientation,
        paperSizePreset: classifyStandardPaperSizePt(effectiveWidthPt, effectiveHeightPt),
        mediaBox: extractBoxDimensions(page, () => page.getMediaBox()),
        cropBox: extractBoxDimensions(page, () => page.getCropBox()),
      });
    }

    const firstDim = pages[0];
    const hasUniformPageSize = pages.every(
      (p) =>
        Math.abs(p.effectiveWidthPt - firstDim.effectiveWidthPt) <= 0.5 &&
        Math.abs(p.effectiveHeightPt - firstDim.effectiveHeightPt) <= 0.5
    );

    const reportData: PdfPageCounterReportData = {
      fileName: input.fileName || 'document.pdf',
      byteLength: inputBytes,
      formattedFileSize: formatByteSize(inputBytes),
      pageCount: pdfLibPageCount,
      pdfLibPageCount,
      pdfJsPageCount,
      parsersAgree,
      pdfVersion: loaded.validation.pdfVersion || '1.7',
      isEncrypted: loaded.validation.hasEncryptDictionary,
      hasUniformPageSize,
      portraitPageCount,
      landscapePageCount,
      squarePageCount,
      rotatedPageCount,
      metadata,
      pages,
    };

    const textLines: string[] = [
      `========================================================================`,
      `CALCTOOLS PDF 2.0 — PDF PAGE COUNTER & INFO REPORT`,
      `========================================================================`,
      `File Name            : ${reportData.fileName}`,
      `File Size            : ${reportData.formattedFileSize} (${reportData.byteLength} bytes)`,
      `Total Page Count     : ${reportData.pageCount} (pdf-lib: ${pdfLibPageCount}, PDF.js: ${pdfJsPageCount}, Agree: ${parsersAgree})`,
      `PDF Version          : ${reportData.pdfVersion}`,
      `Encrypted            : ${reportData.isEncrypted ? 'Yes (Unlocked)' : 'No'}`,
      `Uniform Page Size    : ${reportData.hasUniformPageSize ? 'Yes' : 'No (Mixed Dimensions)'}`,
      `Orientation Summary  : ${portraitPageCount} Portrait, ${landscapePageCount} Landscape, ${squarePageCount} Square`,
      `Rotated Pages (/Rot) : ${rotatedPageCount}`,
      `------------------------------------------------------------------------`,
      `DOCUMENT METADATA:`,
      `  Title              : ${metadata.title ?? '[Not set]'}`,
      `  Author             : ${metadata.author ?? '[Not set]'}`,
      `  Subject            : ${metadata.subject ?? '[Not set]'}`,
      `  Keywords           : ${metadata.keywords ?? '[Not set]'}`,
      `  Creator            : ${metadata.creator ?? '[Not set]'}`,
      `  Producer           : ${metadata.producer ?? '[Not set]'}`,
      `  Creation Date      : ${metadata.creationDate ?? '[Not set]'}`,
      `  Modification Date  : ${metadata.modificationDate ?? '[Not set]'}`,
      `------------------------------------------------------------------------`,
      `PER-PAGE GEOMETRY BREAKDOWN:`,
      ...pages.map(
        (p) =>
          `  Page ${String(p.pageNumber).padStart(3, ' ')}: ${p.effectiveWidthPt} × ${p.effectiveHeightPt} pt (${p.widthInches}" × ${p.heightInches}", ${p.widthMm} × ${p.heightMm} mm) | ${p.orientation.toUpperCase()} | ${p.paperSizePreset} | /Rotate=${p.rotationDegrees}°`
      ),
      `========================================================================`,
    ];
    const previewText = textLines.join('\n');

    const { primaryFile, outputFiles } = createReportOutputFiles(
      reportData.fileName,
      'page_count_report',
      previewText,
      reportData as unknown as Record<string, unknown>
    );

    const inspectionReport: PdfInspectionReport = {
      reportType: 'page-counter',
      summaryMetrics: [
        { label: 'Total Pages', value: reportData.pageCount },
        { label: 'Independent Parser Agreement', value: parsersAgree ? 'Verified (pdf-lib + PDF.js)' : 'Discrepancy' },
        { label: 'Portrait / Landscape', value: `${portraitPageCount} / ${landscapePageCount}` },
        { label: 'Uniform Page Size', value: hasUniformPageSize ? 'Yes' : 'No' },
        { label: 'PDF Version', value: reportData.pdfVersion },
        { label: 'Title', value: metadata.title ?? 'Not set' },
      ],
      tableHeaders: ['Page', 'Dimensions (pt)', 'Dimensions (mm)', 'Orientation', 'Paper Preset', 'Rotation'],
      tableRows: pages.map((p) => [
        p.pageNumber,
        `${p.effectiveWidthPt} × ${p.effectiveHeightPt} pt`,
        `${p.widthMm} × ${p.heightMm} mm`,
        p.orientation,
        p.paperSizePreset,
        `${p.rotationDegrees}°`,
      ]),
      rawData: reportData as unknown as Record<string, unknown>,
    };

    const summary = `Counted ${reportData.pageCount} page(s) in "${reportData.fileName}" (verified by both @cantoo/pdf-lib and PDF.js: ${portraitPageCount} portrait, ${landscapePageCount} landscape).`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      summary,
      metrics: {
        inputBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: reportData.pageCount,
        outputPageCount: reportData.pageCount,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      previewText,
      warnings,
      limitations: [],
      details: reportData as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildEngineEFailureResult(canonicalId, procErr, startTime, inputBytes, loaded.warnings);
  } finally {
    await loaded.dispose();
  }
}

/**
 * ============================================================================
 * 3. TOOL 2: PDF METADATA VIEWER (`pdf-metadata-viewer`)
 * ============================================================================
 */

export type PdfMetadataFieldPresence = 'PRESENT' | 'EMPTY' | 'MISSING';

export interface PdfMetadataFieldComparisonRecord {
  field:
    | 'title'
    | 'author'
    | 'subject'
    | 'keywords'
    | 'creator'
    | 'producer'
    | 'creationDate'
    | 'modificationDate';
  infoStatus: PdfMetadataFieldPresence;
  infoRawValue: string | null;
  infoNormalizedValue: string | null;
  xmpStatus: PdfMetadataFieldPresence;
  xmpRawValue: string | null;
  xmpNormalizedValue: string | null;
  effectiveValue: string | null;
  effectiveStatus: PdfMetadataFieldPresence;
  consistentBetweenInfoAndXmp: boolean;
  discrepancyNote?: string;
}

export interface PdfMetadataViewerOptions {
  password?: string;
  signal?: AbortSignal;
}

export interface PdfMetadataViewerReportData {
  fileName: string;
  byteLength: number;
  formattedFileSize: string;
  pdfVersion: string;
  pageCount: number;
  isEncrypted: boolean;
  hasInfoDictionary: boolean;
  hasXmpMetadataStream: boolean;
  xmpByteLength: number;
  hasInfoXmpDisagreement: boolean;
  disagreementFields: string[];
  fields: Record<
    | 'title'
    | 'author'
    | 'subject'
    | 'keywords'
    | 'creator'
    | 'producer'
    | 'creationDate'
    | 'modificationDate',
    PdfMetadataFieldComparisonRecord
  >;
  customInfoEntries: Record<string, string>;
  pageDimensionsSummary: {
    firstPageSizePt: { widthPt: number; heightPt: number; rotationDegrees: number } | null;
    hasUniformDimensions: boolean;
    pages: Array<{
      pageNumber: number;
      widthPt: number;
      heightPt: number;
      rotationDegrees: number;
      paperSizePreset: string;
    }>;
  };
}

/**
 * Parses a raw PDF date string (`D:YYYYMMDDHHmmSSOHH'mm'`) or ISO 8601 date string into a normalized
 * ISO 8601 UTC string (`YYYY-MM-DDTHH:mm:ss.000Z`). Returns `null` if the string cannot be parsed.
 */
export function parsePdfOrIsoDateString(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  // Check PDF Date format: D:YYYYMMDDHHmmSSOHH'mm' (including D:YYYYMMDDHHmmSSZ or D:YYYYMMDDHHmmSSZ00'00')
  const pdfDateRegex =
    /^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?(?:([Zz+-])(?:(\d{2})'?(\d{2})'?)?)?$/;
  const match = trimmed.match(pdfDateRegex);
  if (match) {
    const year = Number(match[1]);
    const month = match[2] ? Number(match[2]) : 1;
    const day = match[3] ? Number(match[3]) : 1;
    const hour = match[4] ? Number(match[4]) : 0;
    const minute = match[5] ? Number(match[5]) : 0;
    const second = match[6] ? Number(match[6]) : 0;
    const tzSign = match[7] || 'Z';
    const tzHour = match[8] ? Number(match[8]) : 0;
    const tzMin = match[9] ? Number(match[9]) : 0;

    if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
      return null;
    }

    let utcMs = Date.UTC(year, month - 1, day, hour, minute, second);
    if (tzSign === '+') {
      utcMs -= (tzHour * 60 + tzMin) * 60 * 1000;
    } else if (tzSign === '-') {
      utcMs += (tzHour * 60 + tzMin) * 60 * 1000;
    }
    const d = new Date(utcMs);
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  }

  // Fallback: standard ISO 8601 Date parsing
  const parsedMs = Date.parse(trimmed);
  if (!isNaN(parsedMs)) {
    return new Date(parsedMs).toISOString();
  }
  return null;
}

/**
 * Extracts raw `/Info` dictionary entries directly from the PDF trailer so we can strictly distinguish
 * `MISSING` (key not present in `/Info`) from `EMPTY` (key present with empty string `""` or whitespace)
 * and `PRESENT` (key present with non-empty text).
 */
function inspectRawPdfInfoDictionary(doc: PDFDocument): {
  hasInfoDictionary: boolean;
  standardFields: Record<
    string,
    { status: PdfMetadataFieldPresence; rawValue: string | null }
  >;
  customEntries: Record<string, string>;
} {
  const standardKeys: Record<string, string> = {
    Title: 'title',
    Author: 'author',
    Subject: 'subject',
    Keywords: 'keywords',
    Creator: 'creator',
    Producer: 'producer',
    CreationDate: 'creationDate',
    ModDate: 'modificationDate',
  };

  const resultFields: Record<string, { status: PdfMetadataFieldPresence; rawValue: string | null }> = {};
  for (const fieldName of Object.values(standardKeys)) {
    resultFields[fieldName] = { status: 'MISSING', rawValue: null };
  }
  const customEntries: Record<string, string> = {};

  const infoRef = doc.context.trailerInfo.Info;
  if (!infoRef) {
    return {
      hasInfoDictionary: false,
      standardFields: resultFields,
      customEntries,
    };
  }

  const infoObj = infoRef instanceof PDFRef ? doc.context.lookup(infoRef) : infoRef;
  if (!(infoObj instanceof PDFDict)) {
    return {
      hasInfoDictionary: false,
      standardFields: resultFields,
      customEntries,
    };
  }

  const decodePdfObjToString = (val: unknown): string | null => {
    if (val instanceof PDFString || val instanceof PDFHexString) {
      return val.decodeText();
    }
    if (val instanceof PDFName) {
      return val.decodeText();
    }
    if (val instanceof PDFNumber) {
      return String(val.asNumber());
    }
    if (val instanceof PDFArray) {
      const items: string[] = [];
      for (let i = 0; i < val.size(); i++) {
        const sub = doc.context.lookup(val.get(i));
        const str = decodePdfObjToString(sub);
        if (str !== null) items.push(str);
      }
      return items.join(', ');
    }
    return null;
  };

  for (const [k, v] of infoObj.entries()) {
    const rawKey = k.decodeText();
    const resolvedVal = v instanceof PDFRef ? doc.context.lookup(v) : v;
    const strVal = decodePdfObjToString(resolvedVal);

    const mappedField = standardKeys[rawKey];
    if (mappedField) {
      if (strVal === null) {
        resultFields[mappedField] = { status: 'MISSING', rawValue: null };
      } else if (strVal.trim().length === 0) {
        resultFields[mappedField] = { status: 'EMPTY', rawValue: strVal };
      } else {
        resultFields[mappedField] = { status: 'PRESENT', rawValue: strVal };
      }
    } else if (strVal !== null) {
      customEntries[rawKey] = strVal;
    }
  }

  return {
    hasInfoDictionary: infoObj.entries().length > 0,
    standardFields: resultFields,
    customEntries,
  };
}

/**
 * Extracts and parses `/Root -> /Metadata` XMP XML packet stream (if present in the PDF catalog).
 */
function inspectXmpMetadataPacket(doc: PDFDocument): {
  hasXmpStream: boolean;
  xmpByteLength: number;
  rawXml: string | null;
  standardFields: Record<
    string,
    { status: PdfMetadataFieldPresence; rawValue: string | null }
  >;
} {
  const emptyFields: Record<string, { status: PdfMetadataFieldPresence; rawValue: string | null }> = {
    title: { status: 'MISSING', rawValue: null },
    author: { status: 'MISSING', rawValue: null },
    subject: { status: 'MISSING', rawValue: null },
    keywords: { status: 'MISSING', rawValue: null },
    creator: { status: 'MISSING', rawValue: null },
    producer: { status: 'MISSING', rawValue: null },
    creationDate: { status: 'MISSING', rawValue: null },
    modificationDate: { status: 'MISSING', rawValue: null },
  };

  try {
    const metaObj = doc.catalog.lookup(PDFName.of('Metadata'));
    if (!metaObj) {
      return { hasXmpStream: false, xmpByteLength: 0, rawXml: null, standardFields: emptyFields };
    }

    let xmlBytes: Uint8Array | null = null;
    if (metaObj instanceof PDFRawStream) {
      try {
        xmlBytes = decodePDFRawStream(metaObj).decode();
      } catch {
        xmlBytes = metaObj.contents;
      }
    } else if (metaObj instanceof PDFStream) {
      xmlBytes = metaObj.getContents();
    }

    if (!xmlBytes || xmlBytes.byteLength === 0) {
      return { hasXmpStream: false, xmpByteLength: 0, rawXml: null, standardFields: emptyFields };
    }

    const rawXml = new TextDecoder('utf-8', { fatal: false }).decode(xmlBytes);
    const unescapeXml = (s: string): string =>
      s
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');

    const extractXmpValue = (tagNames: string[], attrNames: string[] = []): {
      status: PdfMetadataFieldPresence;
      rawValue: string | null;
    } => {
      for (const tag of tagNames) {
        const selfClosingRegex = new RegExp(`<${tag}(?:\\s[^>]*)?\\/>`, 'i');
        if (selfClosingRegex.test(rawXml)) {
          return { status: 'EMPTY', rawValue: '' };
        }
        const tagRegex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = rawXml.match(tagRegex);
        if (m) {
          const inner = m[1];
          // Check for <rdf:li> items inside <rdf:Alt>, <rdf:Seq>, or <rdf:Bag>
          const liMatches = Array.from(inner.matchAll(/<rdf:li(?:\s[^>]*)?>([\s\S]*?)<\/rdf:li>/gi));
          if (liMatches.length > 0) {
            const joined = liMatches
              .map((li) => unescapeXml(li[1].replace(/<[^>]+>/g, '').trim()))
              .filter((v) => v.length > 0)
              .join(', ');
            return joined.length > 0
              ? { status: 'PRESENT', rawValue: joined }
              : { status: 'EMPTY', rawValue: '' };
          }
          const stripped = unescapeXml(inner.replace(/<[^>]+>/g, '').trim());
          return stripped.length > 0
            ? { status: 'PRESENT', rawValue: stripped }
            : { status: 'EMPTY', rawValue: '' };
        }
      }

      for (const attr of attrNames) {
        const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
        const m = rawXml.match(attrRegex);
        if (m) {
          const val = unescapeXml(m[1].trim());
          return val.length > 0
            ? { status: 'PRESENT', rawValue: val }
            : { status: 'EMPTY', rawValue: '' };
        }
      }

      return { status: 'MISSING', rawValue: null };
    };

    const standardFields: Record<string, { status: PdfMetadataFieldPresence; rawValue: string | null }> = {
      title: extractXmpValue(['dc:title'], ['dc:title']),
      author: extractXmpValue(['dc:creator'], ['dc:creator']),
      subject: extractXmpValue(['dc:description'], ['dc:description']),
      keywords: extractXmpValue(['pdf:Keywords', 'dc:subject'], ['pdf:Keywords']),
      creator: extractXmpValue(['xmp:CreatorTool', 'xap:CreatorTool'], ['xmp:CreatorTool', 'xap:CreatorTool']),
      producer: extractXmpValue(['pdf:Producer'], ['pdf:Producer']),
      creationDate: extractXmpValue(['xmp:CreateDate', 'xap:CreateDate'], ['xmp:CreateDate', 'xap:CreateDate']),
      modificationDate: extractXmpValue(['xmp:ModifyDate', 'xap:ModifyDate'], ['xmp:ModifyDate', 'xap:ModifyDate']),
    };

    return {
      hasXmpStream: true,
      xmpByteLength: xmlBytes.byteLength,
      rawXml,
      standardFields,
    };
  } catch {
    return { hasXmpStream: false, xmpByteLength: 0, rawXml: null, standardFields: emptyFields };
  }
}

/**
 * Canonical Tool 2: `pdf-metadata-viewer`
 *
 * Performs a read-only forensic inspection of both the PDF `/Info` dictionary and the `/Metadata`
 * XMP XML stream, distinguishing `MISSING` vs `EMPTY` vs `PRESENT` fields, parsing PDF and ISO dates,
 * and explicitly flagging any `/Info` vs XMP disagreements without inventing default placeholder values.
 */
export async function inspectPdfMetadataV2(
  input: PdfDocumentInput,
  options: PdfMetadataViewerOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-metadata-viewer';
  const inputBytes = inspectByteLength(input?.bytes);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'Metadata inspection was cancelled.'),
      startTime,
      inputBytes
    );
  }

  request?.onProgress?.({
    percent: 20,
    stage: 'LOADING',
    message: 'Loading PDF catalog, /Info dictionary, and XMP metadata stream...',
  });

  const password = options.password ?? input?.password;
  const loaded = await loadPdfDocumentV2(input, { password });

  if (!loaded.success || !loaded.document || !loaded.isolatedBytes) {
    await loaded.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loaded.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      inputBytes,
      loaded.warnings
    );
  }

  try {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'Metadata inspection was cancelled.');
    }

    const doc = loaded.document;
    const warnings = [...loaded.warnings];
    let infoInspection = inspectRawPdfInfoDictionary(doc);
    const xmpInspection = inspectXmpMetadataPacket(doc);

    if (loaded.validation.hasEncryptDictionary) {
      // @cantoo/pdf-lib's doc.encrypt() leaves the trailer /Info dictionary as plaintext UTF-16BE/ASCII
      // when saving with useObjectStreams: false, but PDFDocument.load(..., { password }) attempts to
      // run cipher decryption on /Info strings, turning valid text into binary control characters.
      // After loadPdfDocumentV2 has already verified the password, we check if raw /Info strings look
      // over-decrypted and fall back to reading the /Info dictionary without cipher transformation.
      const hasCorruptedControlChars = Object.values(infoInspection.standardFields).some(
        (entry) =>
          entry.status === 'PRESENT' &&
          entry.rawValue !== null &&
          /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(entry.rawValue)
      );
      if (hasCorruptedControlChars) {
        try {
          const rawInfoDoc = await PDFDocument.load(loaded.isolatedBytes, {
            ignoreEncryption: true,
            updateMetadata: false,
          });
          const rawInfoCandidate = inspectRawPdfInfoDictionary(rawInfoDoc);
          if (rawInfoCandidate.hasInfoDictionary) {
            infoInspection = rawInfoCandidate;
          }
        } catch {
          // Keep original infoInspection if fallback parse fails
        }
      }
    }

    const fieldList: Array<
      | 'title'
      | 'author'
      | 'subject'
      | 'keywords'
      | 'creator'
      | 'producer'
      | 'creationDate'
      | 'modificationDate'
    > = [
      'title',
      'author',
      'subject',
      'keywords',
      'creator',
      'producer',
      'creationDate',
      'modificationDate',
    ];

    const fieldsRecord = {} as PdfMetadataViewerReportData['fields'];
    const disagreementFields: string[] = [];

    for (const f of fieldList) {
      const infoEntry = infoInspection.standardFields[f] || { status: 'MISSING', rawValue: null };
      const xmpEntry = xmpInspection.standardFields[f] || { status: 'MISSING', rawValue: null };

      const isDateField = f === 'creationDate' || f === 'modificationDate';
      const infoNormalizedValue =
        infoEntry.status === 'PRESENT' && infoEntry.rawValue !== null
          ? isDateField
            ? parsePdfOrIsoDateString(infoEntry.rawValue) || infoEntry.rawValue.trim()
            : infoEntry.rawValue.trim()
          : infoEntry.status === 'EMPTY'
            ? ''
            : null;

      const xmpNormalizedValue =
        xmpEntry.status === 'PRESENT' && xmpEntry.rawValue !== null
          ? isDateField
            ? parsePdfOrIsoDateString(xmpEntry.rawValue) || xmpEntry.rawValue.trim()
            : xmpEntry.rawValue.trim()
          : xmpEntry.status === 'EMPTY'
            ? ''
            : null;

      let consistent = true;
      let discrepancyNote: string | undefined;

      if (infoEntry.status === 'PRESENT' && xmpEntry.status === 'PRESENT') {
        if (infoNormalizedValue !== xmpNormalizedValue) {
          consistent = false;
          discrepancyNote = `/Info (${JSON.stringify(infoNormalizedValue)}) disagrees with XMP (${JSON.stringify(xmpNormalizedValue)})`;
          disagreementFields.push(f);
        }
      }

      let effectiveStatus: PdfMetadataFieldPresence = 'MISSING';
      let effectiveValue: string | null = null;
      if (infoEntry.status === 'PRESENT') {
        effectiveStatus = 'PRESENT';
        effectiveValue = infoNormalizedValue;
      } else if (xmpEntry.status === 'PRESENT') {
        effectiveStatus = 'PRESENT';
        effectiveValue = xmpNormalizedValue;
      } else if (infoEntry.status === 'EMPTY' || xmpEntry.status === 'EMPTY') {
        effectiveStatus = 'EMPTY';
        effectiveValue = '';
      }

      fieldsRecord[f] = {
        field: f,
        infoStatus: infoEntry.status,
        infoRawValue: infoEntry.rawValue,
        infoNormalizedValue,
        xmpStatus: xmpEntry.status,
        xmpRawValue: xmpEntry.rawValue,
        xmpNormalizedValue,
        effectiveValue,
        effectiveStatus,
        consistentBetweenInfoAndXmp: consistent,
        discrepancyNote,
      };
    }

    if (disagreementFields.length > 0) {
      warnings.push(
        `Detected metadata disagreement between PDF /Info dictionary and XMP packet on field(s): ${disagreementFields.join(', ')}.`
      );
    }

    const pageCount = doc.getPageCount();
    const pagesSummary: PdfMetadataViewerReportData['pageDimensionsSummary']['pages'] = [];
    for (let i = 0; i < pageCount; i++) {
      const p = doc.getPage(i);
      const { width, height } = p.getSize();
      const rot = (((p.getRotation().angle % 360) + 360) % 360);
      const wPt = Math.round(width * 100) / 100;
      const hPt = Math.round(height * 100) / 100;
      pagesSummary.push({
        pageNumber: i + 1,
        widthPt: wPt,
        heightPt: hPt,
        rotationDegrees: rot,
        paperSizePreset: classifyStandardPaperSizePt(wPt, hPt),
      });
    }

    const firstPageSizePt =
      pagesSummary.length > 0
        ? {
            widthPt: pagesSummary[0].widthPt,
            heightPt: pagesSummary[0].heightPt,
            rotationDegrees: pagesSummary[0].rotationDegrees,
          }
        : null;

    const hasUniformDimensions =
      pagesSummary.length <= 1 ||
      pagesSummary.every(
        (p) =>
          Math.abs(p.widthPt - pagesSummary[0].widthPt) <= 0.5 &&
          Math.abs(p.heightPt - pagesSummary[0].heightPt) <= 0.5
      );

    const reportData: PdfMetadataViewerReportData = {
      fileName: input.fileName || 'document.pdf',
      byteLength: inputBytes,
      formattedFileSize: formatByteSize(inputBytes),
      pdfVersion: loaded.validation.pdfVersion || '1.7',
      pageCount,
      isEncrypted: loaded.validation.hasEncryptDictionary,
      hasInfoDictionary: infoInspection.hasInfoDictionary,
      hasXmpMetadataStream: xmpInspection.hasXmpStream,
      xmpByteLength: xmpInspection.xmpByteLength,
      hasInfoXmpDisagreement: disagreementFields.length > 0,
      disagreementFields,
      fields: fieldsRecord,
      customInfoEntries: infoInspection.customEntries,
      pageDimensionsSummary: {
        firstPageSizePt,
        hasUniformDimensions,
        pages: pagesSummary,
      },
    };

    const formatFieldDisplay = (rec: PdfMetadataFieldComparisonRecord): string => {
      if (rec.effectiveStatus === 'MISSING') return '[MISSING]';
      if (rec.effectiveStatus === 'EMPTY') return '[EMPTY STRING ""]';
      return rec.effectiveValue ?? '[MISSING]';
    };

    const textLines: string[] = [
      `========================================================================`,
      `CALCTOOLS PDF 2.0 — PDF METADATA VIEWER REPORT`,
      `========================================================================`,
      `File Name            : ${reportData.fileName}`,
      `File Size            : ${reportData.formattedFileSize} (${reportData.byteLength} bytes)`,
      `PDF Version          : ${reportData.pdfVersion}`,
      `Page Count           : ${reportData.pageCount}`,
      `Encrypted            : ${reportData.isEncrypted ? 'Yes (Unlocked)' : 'No'}`,
      `/Info Dictionary     : ${reportData.hasInfoDictionary ? 'Present' : 'Missing'}`,
      `XMP Metadata Stream  : ${reportData.hasXmpMetadataStream ? `Present (${reportData.xmpByteLength} bytes)` : 'Missing'}`,
      `/Info vs XMP Status  : ${reportData.hasInfoXmpDisagreement ? `DISAGREEMENT (${disagreementFields.join(', ')})` : 'Consistent'}`,
      `------------------------------------------------------------------------`,
      `STANDARD METADATA FIELDS (NO INVENTED VALUES):`,
      ...fieldList.map((f) => {
        const r = fieldsRecord[f];
        const note = r.discrepancyNote ? ` [WARNING: ${r.discrepancyNote}]` : '';
        return `  ${f.padEnd(18, ' ')}: ${formatFieldDisplay(r)} (/Info=${r.infoStatus}, XMP=${r.xmpStatus})${note}`;
      }),
      `========================================================================`,
    ];
    const previewText = textLines.join('\n');

    const { primaryFile, outputFiles } = createReportOutputFiles(
      reportData.fileName,
      'metadata_report',
      previewText,
      reportData as unknown as Record<string, unknown>
    );

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'PDF Version', value: reportData.pdfVersion },
        { label: 'Page Count', value: reportData.pageCount },
        { label: '/Info Dictionary', value: reportData.hasInfoDictionary ? 'Present' : 'Missing' },
        { label: 'XMP Stream', value: reportData.hasXmpMetadataStream ? `Present (${reportData.xmpByteLength} B)` : 'Missing' },
        { label: 'Info / XMP Consistency', value: reportData.hasInfoXmpDisagreement ? `Disagreement (${disagreementFields.length})` : 'Consistent' },
      ],
      tableHeaders: ['Field', 'Effective Value', '/Info Status', '/Info Value', 'XMP Status', 'XMP Value', 'Consistent'],
      tableRows: fieldList.map((f) => {
        const r = fieldsRecord[f];
        return [
          r.field,
          formatFieldDisplay(r),
          r.infoStatus,
          r.infoNormalizedValue ?? '[MISSING]',
          r.xmpStatus,
          r.xmpNormalizedValue ?? '[MISSING]',
          r.consistentBetweenInfoAndXmp ? 'Yes' : 'NO',
        ];
      }),
      rawData: reportData as unknown as Record<string, unknown>,
    };

    const presentCount = fieldList.filter((f) => fieldsRecord[f].effectiveStatus === 'PRESENT').length;
    const summary = `Inspected metadata for "${reportData.fileName}" (PDF ${reportData.pdfVersion}, ${pageCount} page(s), ${presentCount}/8 standard fields present, Info/XMP consistent: ${!reportData.hasInfoXmpDisagreement}).`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      summary,
      metrics: {
        inputBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: pageCount,
        outputPageCount: pageCount,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      previewText,
      warnings,
      limitations: [],
      details: reportData as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildEngineEFailureResult(canonicalId, procErr, startTime, inputBytes, loaded.warnings);
  } finally {
    await loaded.dispose();
  }
}

/**
 * ============================================================================
 * 4. TOOL 3: PDF COMPARISON (`pdf-comparison`)
 * ============================================================================
 */

export interface PdfComparisonOptions {
  passwordA?: string;
  passwordB?: string;
  ignoreCase?: boolean;
  normalizeWhitespace?: boolean;
  dimensionTolerancePt?: number;
  signal?: AbortSignal;
}

export interface PdfPageComparisonEntry {
  pageNumber: number;
  presence: 'BOTH' | 'ONLY_IN_A' | 'ONLY_IN_B';
  comparisonStatus:
    | 'IDENTICAL'
    | 'CHANGED'
    | 'ADDED_PAGE'
    | 'REMOVED_PAGE'
    | 'UNCOMPARABLE_PAGE';
  dimensionsMatch: boolean;
  dimensionsA: { widthPt: number; heightPt: number; rotationDegrees: number } | null;
  dimensionsB: { widthPt: number; heightPt: number; rotationDegrees: number } | null;
  textMatch: boolean;
  textCountA: number;
  textCountB: number;
  addedLines: string[];
  removedLines: string[];
  addedTokens: string[];
  removedTokens: string[];
  visualResourceMatch: boolean;
  imageXObjectChecksumsA: string[];
  imageXObjectChecksumsB: string[];
  contentStreamDrawingHashA: string | null;
  contentStreamDrawingHashB: string | null;
  changeCategories: Array<'TEXT' | 'DIMENSIONS' | 'VISUAL_STREAM' | 'PAGE_ADDED' | 'PAGE_REMOVED' | 'UNCOMPARABLE'>;
  uncomparableReason?: string;
}

export interface PdfComparisonReportData {
  fileNameA: string;
  fileNameB: string;
  byteLengthA: number;
  byteLengthB: number;
  areIdentical: boolean;
  binaryIdentical: boolean;
  pageCountA: number;
  pageCountB: number;
  pageCountDifference: number;
  metadataMatches: boolean;
  metadataDifferences: Array<{
    field: string;
    valueA: string | null;
    valueB: string | null;
  }>;
  identicalPageCount: number;
  changedPageCount: number;
  addedPageCount: number;
  removedPageCount: number;
  uncomparablePageCount: number;
  totalAddedLinesCount: number;
  totalRemovedLinesCount: number;
  pages: PdfPageComparisonEntry[];
}

function normalizeTextForComparison(
  rawText: string,
  options: { ignoreCase?: boolean; normalizeWhitespace?: boolean }
): string {
  let s = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (options.normalizeWhitespace !== false) {
    s = s
      .split('\n')
      .map((line) => line.replace(/[ \t\u00A0]+/g, ' ').trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }
  if (options.ignoreCase === true) {
    s = s.toLowerCase();
  }
  return s;
}

/**
 * Extracts lines and word tokens from a PDF.js page in deterministic top-to-bottom, left-to-right reading order.
 */
async function extractOrderedLinesFromPdfJsPage(pdfDoc: any, pageNumber: number): Promise<{
  success: boolean;
  lines: string[];
  rawText: string;
  errorReason?: string;
}> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const tc = await page.getTextContent();
    const items: Array<{ str: string; x: number; y: number }> = [];

    for (const item of tc.items || []) {
      const str = typeof item.str === 'string' ? item.str : '';
      if (str.trim().length === 0) continue;
      const tx = Array.isArray(item.transform) ? Number(item.transform[4]) || 0 : 0;
      const ty = Array.isArray(item.transform) ? Number(item.transform[5]) || 0 : 0;
      items.push({ str, x: tx, y: ty });
    }

    // Group items into horizontal lines using 3.5 pt vertical tolerance (top-to-bottom: higher Y first)
    items.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 3.5) return b.y - a.y;
      return a.x - b.x;
    });

    const lines: string[] = [];
    let currentLineY: number | null = null;
    let currentLineTokens: Array<{ str: string; x: number }> = [];

    const flushLine = () => {
      if (currentLineTokens.length === 0) return;
      currentLineTokens.sort((a, b) => a.x - b.x);
      const lineStr = currentLineTokens.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim();
      if (lineStr.length > 0) lines.push(lineStr);
      currentLineTokens = [];
    };

    for (const it of items) {
      if (currentLineY === null || Math.abs(it.y - currentLineY) <= 3.5) {
        if (currentLineY === null) currentLineY = it.y;
        currentLineTokens.push({ str: it.str, x: it.x });
      } else {
        flushLine();
        currentLineY = it.y;
        currentLineTokens.push({ str: it.str, x: it.x });
      }
    }
    flushLine();

    return {
      success: true,
      lines,
      rawText: lines.join('\n'),
    };
  } catch (err: any) {
    return {
      success: false,
      lines: [],
      rawText: '',
      errorReason: String(err?.message || 'Failed to extract page text content in PDF.js'),
    };
  }
}

/**
 * Inspects a `PDFPage`'s visual resources:
 * 1. Embedded `/Subtype /Image` XObject stream hashes and dimensions.
 * 2. Decompressed content stream non-text vector graphics operator fingerprint (`rg`, `RG`, `re`, `m`, `l`, `c`, `S`, `f`, `B`, `Do`).
 */
function inspectPageVisualSignature(doc: PDFDocument, pageIndex: number): {
  success: boolean;
  imageXObjectChecksums: string[];
  contentStreamDrawingHash: string | null;
  errorReason?: string;
} {
  try {
    const page = doc.getPage(pageIndex);
    const imageXObjectChecksums: string[] = [];

    const res = page.node.Resources();
    if (res) {
      const xObj = res.lookup(PDFName.of('XObject'));
      if (xObj instanceof PDFDict) {
        const sortedEntries = [...xObj.entries()].sort((a, b) =>
          a[0].decodeText().localeCompare(b[0].decodeText())
        );
        for (const [, v] of sortedEntries) {
          const resolved = v instanceof PDFRef ? doc.context.lookup(v) : v;
          if (resolved instanceof PDFRawStream) {
            const sub = resolved.dict.lookup(PDFName.of('Subtype'));
            if (sub instanceof PDFName && sub.asString() === '/Image') {
              const w = resolved.dict.lookup(PDFName.of('Width'))?.toString() || '0';
              const h = resolved.dict.lookup(PDFName.of('Height'))?.toString() || '0';
              imageXObjectChecksums.push(`${w}x${h}:${computeFnv1aHex(resolved.contents)}`);
            }
          }
        }
      }
    }

    // Extract and decompress page `/Contents` stream(s), strip `BT ... ET` text blocks (which are compared
    // separately by the text diff engine) and normalize whitespace to compute a visual vector/image operator digest
    const contentsObj = page.node.Contents();
    const decodedChunks: string[] = [];

    const appendStreamObject = (obj: unknown) => {
      const resolved = obj instanceof PDFRef ? doc.context.lookup(obj) : obj;
      if (resolved instanceof PDFRawStream) {
        let bytes: Uint8Array;
        try {
          bytes = decodePDFRawStream(resolved).decode();
        } catch {
          bytes = resolved.contents;
        }
        decodedChunks.push(new TextDecoder('latin1').decode(bytes));
      } else if (resolved instanceof PDFStream) {
        decodedChunks.push(new TextDecoder('latin1').decode(resolved.getContents()));
      }
    };

    if (contentsObj instanceof PDFArray) {
      for (let i = 0; i < contentsObj.size(); i++) {
        appendStreamObject(contentsObj.get(i));
      }
    } else if (contentsObj) {
      appendStreamObject(contentsObj);
    }

    const fullContentStr = decodedChunks.join('\n');
    // Remove BT ... ET text blocks so text-only changes aren't double-counted as vector drawing changes,
    // and normalize resource identifiers (/F1, /Im1) and floating-point whitespace
    const graphicsOnlyStr = fullContentStr
      .replace(/BT[\s\S]*?ET/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const drawingHash = computeFnv1aHex(new TextEncoder().encode(graphicsOnlyStr));

    return {
      success: true,
      imageXObjectChecksums,
      contentStreamDrawingHash: drawingHash,
    };
  } catch (err: any) {
    return {
      success: false,
      imageXObjectChecksums: [],
      contentStreamDrawingHash: null,
      errorReason: String(err?.message || 'Corrupted page content or resource dictionary'),
    };
  }
}

/**
 * Computes added and removed elements between sequence A and sequence B using Myers / LCS-style multiset & order diffing.
 */
function computeSequenceDiff(seqA: string[], seqB: string[]): {
  added: string[];
  removed: string[];
} {
  // Use LCS dynamic programming when sequence lengths are reasonable (<= 600 items)
  const m = seqA.length;
  const n = seqB.length;
  if (m === 0 && n === 0) return { added: [], removed: [] };
  if (m === 0) return { added: [...seqB], removed: [] };
  if (n === 0) return { added: [], removed: [...seqA] };

  if (m * n <= 360000) {
    const dp = new Int32Array((m + 1) * (n + 1));
    const stride = n + 1;
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        if (seqA[i] === seqB[j]) {
          dp[i * stride + j] = 1 + dp[(i + 1) * stride + (j + 1)];
        } else {
          const down = dp[(i + 1) * stride + j];
          const right = dp[i * stride + (j + 1)];
          dp[i * stride + j] = down >= right ? down : right;
        }
      }
    }

    const added: string[] = [];
    const removed: string[] = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (seqA[i] === seqB[j]) {
        i++;
        j++;
      } else if (dp[(i + 1) * stride + j] >= dp[i * stride + (j + 1)]) {
        removed.push(seqA[i]);
        i++;
      } else {
        added.push(seqB[j]);
        j++;
      }
    }
    while (i < m) {
      removed.push(seqA[i++]);
    }
    while (j < n) {
      added.push(seqB[j++]);
    }
    return { added, removed };
  }

  // Fallback frequency map diff for very large token lists
  const countA = new Map<string, number>();
  const countB = new Map<string, number>();
  for (const x of seqA) countA.set(x, (countA.get(x) || 0) + 1);
  for (const x of seqB) countB.set(x, (countB.get(x) || 0) + 1);

  const removed: string[] = [];
  const added: string[] = [];
  for (const [k, cA] of countA.entries()) {
    const cB = countB.get(k) || 0;
    for (let d = 0; d < cA - cB; d++) removed.push(k);
  }
  for (const [k, cB] of countB.entries()) {
    const cA = countA.get(k) || 0;
    for (let d = 0; d < cB - cA; d++) added.push(k);
  }
  return { added, removed };
}

/**
 * Canonical Tool 3: `pdf-comparison`
 *
 * Compares two PDF documents (`inputA` and `inputB`) across:
 * 1. Page count differences.
 * 2. Per-page dimensions and rotation differences.
 * 3. Normalized text content differences (exact added/removed lines and word tokens via LCS diffing).
 * 4. Document metadata differences (`/Info` and XMP effective values).
 * 5. Visual page differences (embedded `/Subtype /Image` XObject stream hashes and non-text vector content stream operator digests).
 * 6. Explicit reporting of any corrupted or uncomparable pages (`UNCOMPARABLE_PAGE`).
 */
export async function comparePdfDocumentsV2(
  inputA: PdfDocumentInput | undefined,
  inputB: PdfDocumentInput | undefined,
  options: PdfComparisonOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-comparison';
  const bytesLenA = inspectByteLength(inputA?.bytes);
  const bytesLenB = inspectByteLength(inputB?.bytes);
  const totalInputBytes = bytesLenA + bytesLenB;
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'PDF comparison was cancelled.'),
      startTime,
      totalInputBytes
    );
  }

  if (!inputA || !inputB) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_SECOND_FILE_REQUIRED',
        'PDF Comparison requires two PDF documents (Document A and Document B).'
      ),
      startTime,
      totalInputBytes
    );
  }

  request?.onProgress?.({
    percent: 15,
    stage: 'LOADING',
    message: 'Loading Document A and Document B for comparison...',
  });

  const passwordA = options.passwordA ?? inputA.password;
  const passwordB = options.passwordB ?? inputB.password;

  const loadedA = await loadPdfDocumentV2(inputA, { password: passwordA });
  if (!loadedA.success || !loadedA.document || !loadedA.isolatedBytes) {
    await loadedA.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loadedA.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      totalInputBytes,
      loadedA.warnings
    );
  }

  const loadedB = await loadPdfDocumentV2(inputB, { password: passwordB });
  if (!loadedB.success || !loadedB.document || !loadedB.isolatedBytes) {
    await loadedA.dispose();
    await loadedB.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loadedB.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      totalInputBytes,
      [...loadedA.warnings, ...loadedB.warnings]
    );
  }

  let pdfJsSessionA: Awaited<ReturnType<typeof openManagedPdfDocument>> | null = null;
  let pdfJsSessionB: Awaited<ReturnType<typeof openManagedPdfDocument>> | null = null;

  try {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'PDF comparison was cancelled.');
    }

    const docA = loadedA.document;
    const docB = loadedB.document;
    const warnings = [...loadedA.warnings, ...loadedB.warnings];

    const binaryIdentical =
      loadedA.isolatedBytes.byteLength === loadedB.isolatedBytes.byteLength &&
      computeFnv1aHex(loadedA.isolatedBytes) === computeFnv1aHex(loadedB.isolatedBytes);

    pdfJsSessionA = await openManagedPdfDocument(
      loadedA.isolatedBytes,
      passwordA ? { password: passwordA } : {}
    );
    pdfJsSessionB = await openManagedPdfDocument(
      loadedB.isolatedBytes,
      passwordB ? { password: passwordB } : {}
    );

    const pageCountA = docA.getPageCount();
    const pageCountB = docB.getPageCount();
    const maxPages = Math.max(pageCountA, pageCountB);
    const dimTolerance = options.dimensionTolerancePt ?? 0.5;

    // 1. Compare Metadata
    const metaA = inspectRawPdfInfoDictionary(docA);
    const metaB = inspectRawPdfInfoDictionary(docB);
    const metaFields = [
      'title',
      'author',
      'subject',
      'keywords',
      'creator',
      'producer',
      'creationDate',
      'modificationDate',
    ] as const;

    const metadataDifferences: PdfComparisonReportData['metadataDifferences'] = [];
    for (const f of metaFields) {
      const rawA = metaA.standardFields[f]?.rawValue ?? null;
      const rawB = metaB.standardFields[f]?.rawValue ?? null;
      const isDate = f === 'creationDate' || f === 'modificationDate';
      const normA = rawA !== null ? (isDate ? parsePdfOrIsoDateString(rawA) || rawA.trim() : rawA.trim()) : null;
      const normB = rawB !== null ? (isDate ? parsePdfOrIsoDateString(rawB) || rawB.trim() : rawB.trim()) : null;

      if (normA !== normB) {
        metadataDifferences.push({
          field: f,
          valueA: normA,
          valueB: normB,
        });
      }
    }

    // 2. Compare Pages
    const pages: PdfPageComparisonEntry[] = [];
    let identicalPageCount = 0;
    let changedPageCount = 0;
    let addedPageCount = 0;
    let removedPageCount = 0;
    let uncomparablePageCount = 0;
    let totalAddedLinesCount = 0;
    let totalRemovedLinesCount = 0;

    for (let idx = 0; idx < maxPages; idx++) {
      if (signal?.aborted) {
        throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'PDF comparison was cancelled.');
      }

      const pageNumber = idx + 1;
      request?.onProgress?.({
        percent: Math.round(25 + ((idx + 1) / maxPages) * 65),
        stage: 'PROCESSING_PAGES',
        message: `Comparing page ${pageNumber} of ${maxPages}...`,
        currentPage: pageNumber,
        totalPages: maxPages,
      });

      const inA = idx < pageCountA;
      const inB = idx < pageCountB;

      if (inA && !inB) {
        const pageA = docA.getPage(idx);
        const sizeA = pageA.getSize();
        const rotA = (((pageA.getRotation().angle % 360) + 360) % 360);
        const textA = await extractOrderedLinesFromPdfJsPage(pdfJsSessionA.pdfDoc, pageNumber);
        const visA = inspectPageVisualSignature(docA, idx);
        const normLinesA = textA.lines
          .map((l) => normalizeTextForComparison(l, options))
          .filter((l) => l.length > 0);
        const tokensA = normLinesA.join(' ').split(/\s+/).filter((t) => t.length > 0);

        removedPageCount++;
        totalRemovedLinesCount += normLinesA.length;

        pages.push({
          pageNumber,
          presence: 'ONLY_IN_A',
          comparisonStatus: 'REMOVED_PAGE',
          dimensionsMatch: false,
          dimensionsA: {
            widthPt: Math.round(sizeA.width * 100) / 100,
            heightPt: Math.round(sizeA.height * 100) / 100,
            rotationDegrees: rotA,
          },
          dimensionsB: null,
          textMatch: false,
          textCountA: tokensA.length,
          textCountB: 0,
          addedLines: [],
          removedLines: normLinesA,
          addedTokens: [],
          removedTokens: tokensA,
          visualResourceMatch: false,
          imageXObjectChecksumsA: visA.imageXObjectChecksums,
          imageXObjectChecksumsB: [],
          contentStreamDrawingHashA: visA.contentStreamDrawingHash,
          contentStreamDrawingHashB: null,
          changeCategories: ['PAGE_REMOVED'],
        });
        continue;
      }

      if (!inA && inB) {
        const pageB = docB.getPage(idx);
        const sizeB = pageB.getSize();
        const rotB = (((pageB.getRotation().angle % 360) + 360) % 360);
        const textB = await extractOrderedLinesFromPdfJsPage(pdfJsSessionB.pdfDoc, pageNumber);
        const visB = inspectPageVisualSignature(docB, idx);
        const normLinesB = textB.lines
          .map((l) => normalizeTextForComparison(l, options))
          .filter((l) => l.length > 0);
        const tokensB = normLinesB.join(' ').split(/\s+/).filter((t) => t.length > 0);

        addedPageCount++;
        totalAddedLinesCount += normLinesB.length;

        pages.push({
          pageNumber,
          presence: 'ONLY_IN_B',
          comparisonStatus: 'ADDED_PAGE',
          dimensionsMatch: false,
          dimensionsA: null,
          dimensionsB: {
            widthPt: Math.round(sizeB.width * 100) / 100,
            heightPt: Math.round(sizeB.height * 100) / 100,
            rotationDegrees: rotB,
          },
          textMatch: false,
          textCountA: 0,
          textCountB: tokensB.length,
          addedLines: normLinesB,
          removedLines: [],
          addedTokens: tokensB,
          removedTokens: [],
          visualResourceMatch: false,
          imageXObjectChecksumsA: [],
          imageXObjectChecksumsB: visB.imageXObjectChecksums,
          contentStreamDrawingHashA: null,
          contentStreamDrawingHashB: visB.contentStreamDrawingHash,
          changeCategories: ['PAGE_ADDED'],
        });
        continue;
      }

      // Page exists in both A and B
      let dimensionsA: PdfPageComparisonEntry['dimensionsA'] = null;
      let dimensionsB: PdfPageComparisonEntry['dimensionsB'] = null;
      let geomErrorReason: string | undefined;

      try {
        const pA = docA.getPage(idx);
        const sA = pA.getSize();
        dimensionsA = {
          widthPt: Math.round(sA.width * 100) / 100,
          heightPt: Math.round(sA.height * 100) / 100,
          rotationDegrees: (((pA.getRotation().angle % 360) + 360) % 360),
        };
      } catch (e: any) {
        geomErrorReason = `Document A page ${pageNumber} geometry unreadable: ${e?.message || 'error'}`;
      }

      try {
        const pB = docB.getPage(idx);
        const sB = pB.getSize();
        dimensionsB = {
          widthPt: Math.round(sB.width * 100) / 100,
          heightPt: Math.round(sB.height * 100) / 100,
          rotationDegrees: (((pB.getRotation().angle % 360) + 360) % 360),
        };
      } catch (e: any) {
        geomErrorReason = `Document B page ${pageNumber} geometry unreadable: ${e?.message || 'error'}`;
      }

      const textA = await extractOrderedLinesFromPdfJsPage(pdfJsSessionA.pdfDoc, pageNumber);
      const textB = await extractOrderedLinesFromPdfJsPage(pdfJsSessionB.pdfDoc, pageNumber);
      const visA = inspectPageVisualSignature(docA, idx);
      const visB = inspectPageVisualSignature(docB, idx);

      if (geomErrorReason || !textA.success || !textB.success || !visA.success || !visB.success) {
        const reason =
          geomErrorReason ||
          textA.errorReason ||
          textB.errorReason ||
          visA.errorReason ||
          visB.errorReason ||
          'Page stream could not be parsed.';
        uncomparablePageCount++;
        warnings.push(`Page ${pageNumber} could not be fully compared: ${reason}`);
        pages.push({
          pageNumber,
          presence: 'BOTH',
          comparisonStatus: 'UNCOMPARABLE_PAGE',
          dimensionsMatch: false,
          dimensionsA,
          dimensionsB,
          textMatch: false,
          textCountA: 0,
          textCountB: 0,
          addedLines: [],
          removedLines: [],
          addedTokens: [],
          removedTokens: [],
          visualResourceMatch: false,
          imageXObjectChecksumsA: visA.imageXObjectChecksums,
          imageXObjectChecksumsB: visB.imageXObjectChecksums,
          contentStreamDrawingHashA: visA.contentStreamDrawingHash,
          contentStreamDrawingHashB: visB.contentStreamDrawingHash,
          changeCategories: ['UNCOMPARABLE'],
          uncomparableReason: reason,
        });
        continue;
      }

      const dimensionsMatch =
        dimensionsA !== null &&
        dimensionsB !== null &&
        Math.abs(dimensionsA.widthPt - dimensionsB.widthPt) <= dimTolerance &&
        Math.abs(dimensionsA.heightPt - dimensionsB.heightPt) <= dimTolerance &&
        dimensionsA.rotationDegrees === dimensionsB.rotationDegrees;

      const normLinesA = textA.lines
        .map((l) => normalizeTextForComparison(l, options))
        .filter((l) => l.length > 0);
      const normLinesB = textB.lines
        .map((l) => normalizeTextForComparison(l, options))
        .filter((l) => l.length > 0);

      const lineDiff = computeSequenceDiff(normLinesA, normLinesB);
      const tokensA = normLinesA.join(' ').split(/\s+/).filter((t) => t.length > 0);
      const tokensB = normLinesB.join(' ').split(/\s+/).filter((t) => t.length > 0);
      const tokenDiff = computeSequenceDiff(tokensA, tokensB);

      const textMatch = lineDiff.added.length === 0 && lineDiff.removed.length === 0;
      totalAddedLinesCount += lineDiff.added.length;
      totalRemovedLinesCount += lineDiff.removed.length;

      const imagesMatch =
        visA.imageXObjectChecksums.length === visB.imageXObjectChecksums.length &&
        visA.imageXObjectChecksums.every((h, i) => h === visB.imageXObjectChecksums[i]);
      const drawingHashMatch = visA.contentStreamDrawingHash === visB.contentStreamDrawingHash;
      const visualResourceMatch = imagesMatch && drawingHashMatch;

      const changeCategories: PdfPageComparisonEntry['changeCategories'] = [];
      if (!textMatch) changeCategories.push('TEXT');
      if (!dimensionsMatch) changeCategories.push('DIMENSIONS');
      if (!visualResourceMatch) changeCategories.push('VISUAL_STREAM');

      const isIdenticalPage = changeCategories.length === 0;
      if (isIdenticalPage) {
        identicalPageCount++;
      } else {
        changedPageCount++;
      }

      pages.push({
        pageNumber,
        presence: 'BOTH',
        comparisonStatus: isIdenticalPage ? 'IDENTICAL' : 'CHANGED',
        dimensionsMatch,
        dimensionsA,
        dimensionsB,
        textMatch,
        textCountA: tokensA.length,
        textCountB: tokensB.length,
        addedLines: lineDiff.added,
        removedLines: lineDiff.removed,
        addedTokens: tokenDiff.added,
        removedTokens: tokenDiff.removed,
        visualResourceMatch,
        imageXObjectChecksumsA: visA.imageXObjectChecksums,
        imageXObjectChecksumsB: visB.imageXObjectChecksums,
        contentStreamDrawingHashA: visA.contentStreamDrawingHash,
        contentStreamDrawingHashB: visB.contentStreamDrawingHash,
        changeCategories,
      });
    }

    const metadataMatches = metadataDifferences.length === 0;
    const areIdentical =
      pageCountA === pageCountB &&
      metadataMatches &&
      changedPageCount === 0 &&
      addedPageCount === 0 &&
      removedPageCount === 0 &&
      uncomparablePageCount === 0;

    const reportData: PdfComparisonReportData = {
      fileNameA: inputA.fileName || 'documentA.pdf',
      fileNameB: inputB.fileName || 'documentB.pdf',
      byteLengthA: bytesLenA,
      byteLengthB: bytesLenB,
      areIdentical,
      binaryIdentical,
      pageCountA,
      pageCountB,
      pageCountDifference: pageCountB - pageCountA,
      metadataMatches,
      metadataDifferences,
      identicalPageCount,
      changedPageCount,
      addedPageCount,
      removedPageCount,
      uncomparablePageCount,
      totalAddedLinesCount,
      totalRemovedLinesCount,
      pages,
    };

    const textLines: string[] = [
      `========================================================================`,
      `CALCTOOLS PDF 2.0 — PDF DOCUMENT COMPARISON REPORT`,
      `========================================================================`,
      `Document A           : ${reportData.fileNameA} (${formatByteSize(bytesLenA)}, ${pageCountA} page(s))`,
      `Document B           : ${reportData.fileNameB} (${formatByteSize(bytesLenB)}, ${pageCountB} page(s))`,
      `Overall Verdict      : ${areIdentical ? 'IDENTICAL CONTENT & STRUCTURE' : 'DIFFERENCES DETECTED'}`,
      `Binary Bit-Identical : ${binaryIdentical ? 'Yes' : 'No'}`,
      `Page Count Delta     : ${reportData.pageCountDifference >= 0 ? `+${reportData.pageCountDifference}` : reportData.pageCountDifference} (${pageCountA} vs ${pageCountB})`,
      `Page Summary         : ${identicalPageCount} Identical, ${changedPageCount} Changed, ${addedPageCount} Added, ${removedPageCount} Removed, ${uncomparablePageCount} Uncomparable`,
      `Line Diff Summary    : +${totalAddedLinesCount} added line(s), -${totalRemovedLinesCount} removed line(s)`,
      `Metadata Differences : ${metadataDifferences.length === 0 ? 'None' : metadataDifferences.map((m) => `${m.field} (${JSON.stringify(m.valueA)} -> ${JSON.stringify(m.valueB)})`).join('; ')}`,
      `------------------------------------------------------------------------`,
      `PER-PAGE COMPARISON LEDGER:`,
      ...pages.map((p) => {
        const cats = p.changeCategories.length > 0 ? ` [${p.changeCategories.join(', ')}]` : '';
        const addPreview = p.addedLines.length > 0 ? ` | +Added: ${JSON.stringify(p.addedLines)}` : '';
        const remPreview = p.removedLines.length > 0 ? ` | -Removed: ${JSON.stringify(p.removedLines)}` : '';
        return `  Page ${String(p.pageNumber).padStart(3, ' ')}: ${p.comparisonStatus}${cats}${addPreview}${remPreview}`;
      }),
      `========================================================================`,
    ];
    const previewText = textLines.join('\n');

    const { primaryFile, outputFiles } = createReportOutputFiles(
      `${stripFileExtension(reportData.fileNameA)}_vs_${stripFileExtension(reportData.fileNameB)}`,
      'comparison_report',
      previewText,
      reportData as unknown as Record<string, unknown>
    );

    const inspectionReport: PdfInspectionReport = {
      reportType: 'pdf-comparison',
      summaryMetrics: [
        { label: 'Overall Verdict', value: areIdentical ? 'Identical' : 'Differences Found' },
        { label: 'Pages (Doc A vs Doc B)', value: `${pageCountA} vs ${pageCountB}` },
        { label: 'Identical / Changed Pages', value: `${identicalPageCount} / ${changedPageCount}` },
        { label: 'Added / Removed Lines', value: `+${totalAddedLinesCount} / -${totalRemovedLinesCount}` },
        { label: 'Metadata Differences', value: metadataDifferences.length },
      ],
      tableHeaders: ['Page', 'Status', 'Change Categories', 'Added Lines', 'Removed Lines', 'Visual Match'],
      tableRows: pages.map((p) => [
        p.pageNumber,
        p.comparisonStatus,
        p.changeCategories.length > 0 ? p.changeCategories.join(', ') : 'NONE',
        p.addedLines.length,
        p.removedLines.length,
        p.visualResourceMatch ? 'Yes' : 'No',
      ]),
      rawData: reportData as unknown as Record<string, unknown>,
    };

    const summary = areIdentical
      ? `Documents "${reportData.fileNameA}" and "${reportData.fileNameB}" are identical across all ${maxPages} page(s), text, dimensions, visual streams, and metadata.`
      : `Compared "${reportData.fileNameA}" (${pageCountA}p) and "${reportData.fileNameB}" (${pageCountB}p): ${changedPageCount} changed, ${addedPageCount} added, ${removedPageCount} removed page(s), ${metadataDifferences.length} metadata difference(s).`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      summary,
      metrics: {
        inputBytes: totalInputBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: pageCountA,
        outputPageCount: pageCountB,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      previewText,
      warnings,
      limitations: [
        'Visual comparison inspects embedded Image XObject stream checksums and decompressed non-text content stream drawing operators alongside normalized PDF.js text and page geometry.',
      ],
      details: reportData as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildEngineEFailureResult(canonicalId, procErr, startTime, totalInputBytes);
  } finally {
    if (pdfJsSessionA) await pdfJsSessionA.dispose();
    if (pdfJsSessionB) await pdfJsSessionB.dispose();
    await loadedA.dispose();
    await loadedB.dispose();
  }
}

/**
 * ============================================================================
 * 5. TOOL 4: PDF BLANK PAGE DETECTOR (`pdf-blank-page-detector`)
 * ============================================================================
 */

export type PdfPageBlankClassification =
  | 'GENUINELY_BLANK'
  | 'NEARLY_BLANK_FAINT_OR_SPARSE'
  | 'NON_BLANK_CONTENT';

export interface PdfBlankPageDetectorOptions {
  password?: string;
  /**
   * Maximum ink coverage ratio (0..1) for a page with 0 text characters and 0 visible images/vectors
   * to still be classified as `GENUINELY_BLANK` (default: 0.0005 = 0.05% pixel noise allowance).
   */
  blankInkRatioThreshold?: number;
  /**
   * Maximum ink coverage ratio (0..1) or character count below which a page with minimal marks
   * is classified as `NEARLY_BLANK_FAINT_OR_SPARSE` (default: 0.008 = 0.8%).
   */
  nearlyBlankInkRatioThreshold?: number;
  /**
   * Luminance difference from pure white (`255`) required to treat a pixel or stroke color as visible ink
   * (default: 10, so faint gray strokes like `rgb(0.92, 0.92, 0.92)` -> luminance `235`, delta `20 >= 10` are detected!).
   */
  minLuminanceDeltaFromWhite?: number;
  signal?: AbortSignal;
}

export interface PdfBlankPageAnalysisEntry {
  pageNumber: number;
  classification: PdfPageBlankClassification;
  isBlank: boolean;
  isUncertainOrFaint: boolean;
  confidence: number;
  characterCount: number;
  wordCount: number;
  imageXObjectCount: number;
  annotationCount: number;
  vectorDrawingOperatorCount: number;
  estimatedInkCoverageRatio: number;
  minDetectedLuminance: number;
  maxLuminanceDeltaFromWhite: number;
  hasFaintContentOnly: boolean;
  reason: string;
}

export interface PdfBlankPageDetectorReportData {
  fileName: string;
  byteLength: number;
  formattedFileSize: string;
  totalPages: number;
  blankPageCount: number;
  blankPageNumbers: number[];
  nearlyBlankPageCount: number;
  nearlyBlankPageNumbers: number[];
  nonBlankPageCount: number;
  nonBlankPageNumbers: number[];
  thresholds: {
    blankInkRatioThreshold: number;
    nearlyBlankInkRatioThreshold: number;
    minLuminanceDeltaFromWhite: number;
  };
  pages: PdfBlankPageAnalysisEntry[];
}

/**
 * Analyzes a page's decompressed content streams and embedded XObjects to measure:
 * 1. Embedded `/Subtype /Image` XObject pixel luminance distribution and non-white ink coverage.
 * 2. Vector path/shape drawing operators (`m`, `l`, `c`, `re`, `S`, `s`, `f`, `F`, `f*`, `B`, `b`) and
 *    their active stroke/fill colors (`rg`, `RG`, `g`, `G`, `k`, `K`), distinguishing pure-white background
 *    rectangles (`1 1 1 rg 0 0 612 792 re f`) from non-white visible vector strokes or faint marks!
 */
function analyzePageVisualAndStreamSignals(
  doc: PDFDocument,
  pageIndex: number,
  minLumDelta: number
): {
  imageXObjectCount: number;
  visibleImageCount: number;
  imageInkRatio: number;
  minLuminance: number;
  annotationCount: number;
  visibleVectorOperatorCount: number;
  faintVectorOrTextDetected: boolean;
} {
  const page = doc.getPage(pageIndex);
  const { width: pageW, height: pageH } = page.getSize();
  const pageAreaPt = Math.max(1, pageW * pageH);

  // Count page annotations (e.g., signatures, stamps, form widgets, highlights)
  let annotationCount = 0;
  try {
    const annots = page.node.Annots();
    if (annots instanceof PDFArray) {
      annotationCount = annots.size();
    }
  } catch {
    annotationCount = 0;
  }

  let imageXObjectCount = 0;
  let visibleImageCount = 0;
  let imageNonWhitePixels = 0;
  let imageTotalSampledPixels = 0;
  let minLuminance = 255;

  const res = page.node.Resources();
  if (res) {
    const xObj = res.lookup(PDFName.of('XObject'));
    if (xObj instanceof PDFDict) {
      for (const [, v] of xObj.entries()) {
        const resolved = v instanceof PDFRef ? doc.context.lookup(v) : v;
        if (resolved instanceof PDFRawStream) {
          const sub = resolved.dict.lookup(PDFName.of('Subtype'));
          if (sub instanceof PDFName && sub.asString() === '/Image') {
            imageXObjectCount++;
            let rawPixels: Uint8Array | null = null;
            try {
              rawPixels = decodePDFRawStream(resolved).decode();
            } catch {
              rawPixels = resolved.contents;
            }
            if (rawPixels && rawPixels.byteLength > 0) {
              let imgHasNonWhite = false;
              const step = Math.max(1, Math.floor(rawPixels.byteLength / 4096));
              for (let i = 0; i < rawPixels.byteLength; i += step) {
                const b = rawPixels[i];
                imageTotalSampledPixels++;
                if (b < minLuminance) minLuminance = b;
                if (255 - b >= minLumDelta) {
                  imageNonWhitePixels++;
                  imgHasNonWhite = true;
                }
              }
              if (imgHasNonWhite) visibleImageCount++;
            }
          }
        }
      }
    }
  }

  // Decode content stream(s) to inspect color states and drawing operators
  const contentsObj = page.node.Contents();
  const chunks: string[] = [];
  const decodeStream = (obj: unknown) => {
    const resolved = obj instanceof PDFRef ? doc.context.lookup(obj) : obj;
    if (resolved instanceof PDFRawStream) {
      try {
        chunks.push(new TextDecoder('latin1').decode(decodePDFRawStream(resolved).decode()));
      } catch {
        chunks.push(new TextDecoder('latin1').decode(resolved.contents));
      }
    } else if (resolved instanceof PDFStream) {
      chunks.push(new TextDecoder('latin1').decode(resolved.getContents()));
    }
  };

  if (contentsObj instanceof PDFArray) {
    for (let i = 0; i < contentsObj.size(); i++) decodeStream(contentsObj.get(i));
  } else if (contentsObj) {
    decodeStream(contentsObj);
  }

  const streamText = chunks.join('\n');

  // Track active fill and stroke luminance (0..255, default black = 0)
  let fillLum = 0;
  let strokeLum = 0;
  let visibleVectorOperatorCount = 0;
  let faintVectorOrTextDetected = false;
  let estimatedVectorAreaPt = 0;
  let pendingRectAreaPt = 0;

  const lines = streamText.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%')) continue;

    // Match RGB fill: r g b rg
    const rgMatch = line.match(/^([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+(rg|RG)$/);
    if (rgMatch) {
      const r = Math.max(0, Math.min(1, Number(rgMatch[1])));
      const g = Math.max(0, Math.min(1, Number(rgMatch[2])));
      const b = Math.max(0, Math.min(1, Number(rgMatch[3])));
      const lum = Math.round((0.299 * r + 0.587 * g + 0.114 * b) * 255);
      if (rgMatch[4] === 'rg') fillLum = lum;
      else strokeLum = lum;
      continue;
    }

    // Match Grayscale fill/stroke: gray g / G
    const gMatch = line.match(/^([0-9.]+)\s+(g|G)$/);
    if (gMatch) {
      const gray = Math.max(0, Math.min(1, Number(gMatch[1])));
      const lum = Math.round(gray * 255);
      if (gMatch[2] === 'g') fillLum = lum;
      else strokeLum = lum;
      continue;
    }

    // Match rectangle: x y w h re
    const reMatch = line.match(/^(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s+re$/);
    if (reMatch) {
      const rw = Math.abs(Number(reMatch[3]) || 0);
      const rh = Math.abs(Number(reMatch[4]) || 0);
      pendingRectAreaPt += rw * rh;
      continue;
    }

    // Match line/curve path construction: x y l
    if (/^(-?[0-9.]+\s+){2,6}(l|c|v|y)$/.test(line)) {
      pendingRectAreaPt += 24;
      continue;
    }

    // Match path paint operators: S, s, f, F, f*, B, B*, b, b*
    if (/^(S|s|f|F|f\*|B|B\*|b|b\*)$/.test(line)) {
      const isStroke = line === 'S' || line === 's';
      const isFill = line === 'f' || line === 'F' || line === 'f*';
      const activeLum = isStroke ? strokeLum : isFill ? fillLum : Math.min(fillLum, strokeLum);

      const deltaFromWhite = 255 - activeLum;
      if (deltaFromWhite >= minLumDelta) {
        // Non-white visible vector mark!
        visibleVectorOperatorCount++;
        if (activeLum < minLuminance) minLuminance = activeLum;
        if (deltaFromWhite <= 45) {
          faintVectorOrTextDetected = true;
        }
        estimatedVectorAreaPt += Math.max(16, pendingRectAreaPt);
      }
      pendingRectAreaPt = 0;
      continue;
    }

    // If text operator Tj / TJ occurs while fillLum is non-white, record its luminance
    if (/\b(Tj|TJ)\b/.test(line)) {
      const deltaFromWhite = 255 - fillLum;
      if (deltaFromWhite >= minLumDelta) {
        if (fillLum < minLuminance) minLuminance = fillLum;
        if (deltaFromWhite <= 45) {
          faintVectorOrTextDetected = true;
        }
      }
    }
  }

  const imageRatio =
    imageTotalSampledPixels > 0
      ? imageNonWhitePixels / imageTotalSampledPixels
      : visibleImageCount > 0
        ? 0.05
        : 0;
  const vectorRatio = Math.min(1, estimatedVectorAreaPt / pageAreaPt);

  return {
    imageXObjectCount,
    visibleImageCount,
    imageInkRatio: Math.max(imageRatio, vectorRatio),
    minLuminance,
    annotationCount,
    visibleVectorOperatorCount,
    faintVectorOrTextDetected,
  };
}

/**
 * Canonical Tool 4: `pdf-blank-page-detector`
 *
 * Analyzes every page of a PDF document to detect genuinely blank pages while distinguishing:
 * - `GENUINELY_BLANK`: Empty pages or pages containing only a pure-white background fill (`rgb(1,1,1)`).
 * - `NEARLY_BLANK_FAINT_OR_SPARSE`: Pages containing faint marks (e.g., light gray pencil/watermark strokes),
 *   tiny signatures, or sparse 1–3 character artifacts, explicitly flagged as `isUncertainOrFaint: true` so
 *   they are never falsely discarded as blank.
 * - `NON_BLANK_CONTENT`: Pages containing clear text, embedded non-white images, vector drawings, or annotations.
 *
 * Strictly analysis-only: never deletes or mutates pages.
 */
export async function detectBlankPdfPagesV2(
  input: PdfDocumentInput,
  options: PdfBlankPageDetectorOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-blank-page-detector';
  const inputBytes = inspectByteLength(input?.bytes);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'Blank page detection was cancelled.'),
      startTime,
      inputBytes
    );
  }

  const blankInkRatioThreshold =
    options.blankInkRatioThreshold !== undefined ? Number(options.blankInkRatioThreshold) : 0.0005;
  const nearlyBlankInkRatioThreshold =
    options.nearlyBlankInkRatioThreshold !== undefined
      ? Number(options.nearlyBlankInkRatioThreshold)
      : 0.008;
  const minLuminanceDeltaFromWhite =
    options.minLuminanceDeltaFromWhite !== undefined
      ? Number(options.minLuminanceDeltaFromWhite)
      : 10;

  request?.onProgress?.({
    percent: 15,
    stage: 'LOADING',
    message: 'Loading PDF document for blank page analysis...',
  });

  const password = options.password ?? input?.password;
  const loaded = await loadPdfDocumentV2(input, { password });

  if (!loaded.success || !loaded.document || !loaded.isolatedBytes) {
    await loaded.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loaded.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      inputBytes,
      loaded.warnings
    );
  }

  let pdfJsSession: Awaited<ReturnType<typeof openManagedPdfDocument>> | null = null;

  try {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'Blank page detection was cancelled.');
    }

    const doc = loaded.document;
    const totalPages = doc.getPageCount();
    const warnings = [...loaded.warnings];

    pdfJsSession = await openManagedPdfDocument(
      loaded.isolatedBytes,
      password ? { password } : {}
    );

    const pages: PdfBlankPageAnalysisEntry[] = [];
    const blankPageNumbers: number[] = [];
    const nearlyBlankPageNumbers: number[] = [];
    const nonBlankPageNumbers: number[] = [];

    for (let idx = 0; idx < totalPages; idx++) {
      if (signal?.aborted) {
        throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'Blank page detection was cancelled.');
      }

      const pageNumber = idx + 1;
      request?.onProgress?.({
        percent: Math.round(20 + ((idx + 1) / totalPages) * 70),
        stage: 'PROCESSING_PAGES',
        message: `Analyzing page ${pageNumber} of ${totalPages} for ink, text, vector, and image signals...`,
        currentPage: pageNumber,
        totalPages,
      });

      const textInfo = await extractOrderedLinesFromPdfJsPage(pdfJsSession.pdfDoc, pageNumber);
      const joinedText = textInfo.rawText.replace(/\s+/g, '');
      const characterCount = joinedText.length;
      const wordCount = textInfo.rawText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      const visual = analyzePageVisualAndStreamSignals(doc, idx, minLuminanceDeltaFromWhite);

      // Estimate combined ink coverage ratio from characters + images + non-white vectors
      const textInkRatio = Math.min(1, (characterCount * 35) / (612 * 792));
      const estimatedInkCoverageRatio =
        Math.round(Math.min(1, Math.max(visual.imageInkRatio, textInkRatio)) * 100000) / 100000;
      const maxLuminanceDeltaFromWhite = 255 - visual.minLuminance;

      let classification: PdfPageBlankClassification;
      let isBlank = false;
      let isUncertainOrFaint = false;
      let confidence = 99;
      let reason = '';

      const hasAnyVisibleSignal =
        characterCount > 0 ||
        visual.visibleImageCount > 0 ||
        visual.visibleVectorOperatorCount > 0 ||
        visual.annotationCount > 0;

      if (!hasAnyVisibleSignal && estimatedInkCoverageRatio <= blankInkRatioThreshold) {
        classification = 'GENUINELY_BLANK';
        isBlank = true;
        isUncertainOrFaint = false;
        confidence = 99.5;
        reason =
          visual.imageXObjectCount > 0
            ? 'Page contains only a pure-white background image with 0 text characters and 0 visible ink pixels.'
            : 'Page contains 0 text characters, 0 visible images, 0 non-white vector strokes, and 0 annotations.';
        blankPageNumbers.push(pageNumber);
      } else if (
        visual.faintVectorOrTextDetected ||
        (characterCount > 0 && characterCount <= 4 && visual.visibleImageCount === 0) ||
        (characterCount === 0 &&
          visual.visibleImageCount === 0 &&
          visual.visibleVectorOperatorCount <= 2 &&
          estimatedInkCoverageRatio <= nearlyBlankInkRatioThreshold)
      ) {
        classification = 'NEARLY_BLANK_FAINT_OR_SPARSE';
        isBlank = false;
        isUncertainOrFaint = true;
        confidence = 82.0;
        reason = visual.faintVectorOrTextDetected
          ? `Faint low-contrast mark or text detected (min luminance=${visual.minLuminance}, deltaFromWhite=${maxLuminanceDeltaFromWhite}); retained as non-blank.`
          : `Sparse content detected (${characterCount} char(s), ${visual.visibleVectorOperatorCount} vector stroke(s), inkRatio=${estimatedInkCoverageRatio}); retained as non-blank.`;
        nearlyBlankPageNumbers.push(pageNumber);
      } else {
        classification = 'NON_BLANK_CONTENT';
        isBlank = false;
        isUncertainOrFaint = false;
        confidence = 99.0;
        const parts: string[] = [];
        if (characterCount > 0) parts.push(`${characterCount} char(s) / ${wordCount} word(s)`);
        if (visual.visibleImageCount > 0) parts.push(`${visual.visibleImageCount} visible image(s)`);
        if (visual.visibleVectorOperatorCount > 0) parts.push(`${visual.visibleVectorOperatorCount} vector graphic op(s)`);
        if (visual.annotationCount > 0) parts.push(`${visual.annotationCount} annotation(s)`);
        reason = `Visible page content detected: ${parts.join(', ')}.`;
        nonBlankPageNumbers.push(pageNumber);
      }

      pages.push({
        pageNumber,
        classification,
        isBlank,
        isUncertainOrFaint,
        confidence,
        characterCount,
        wordCount,
        imageXObjectCount: visual.imageXObjectCount,
        annotationCount: visual.annotationCount,
        vectorDrawingOperatorCount: visual.visibleVectorOperatorCount,
        estimatedInkCoverageRatio,
        minDetectedLuminance: visual.minLuminance,
        maxLuminanceDeltaFromWhite,
        hasFaintContentOnly: visual.faintVectorOrTextDetected,
        reason,
      });
    }

    if (nearlyBlankPageNumbers.length > 0) {
      warnings.push(
        `Page(s) ${nearlyBlankPageNumbers.join(', ')} contain faint or sparse marks and were conservatively classified as NEARLY_BLANK_FAINT_OR_SPARSE (not blank) to prevent accidental data loss.`
      );
    }

    const reportData: PdfBlankPageDetectorReportData = {
      fileName: input.fileName || 'document.pdf',
      byteLength: inputBytes,
      formattedFileSize: formatByteSize(inputBytes),
      totalPages,
      blankPageCount: blankPageNumbers.length,
      blankPageNumbers,
      nearlyBlankPageCount: nearlyBlankPageNumbers.length,
      nearlyBlankPageNumbers,
      nonBlankPageCount: nonBlankPageNumbers.length,
      nonBlankPageNumbers,
      thresholds: {
        blankInkRatioThreshold,
        nearlyBlankInkRatioThreshold,
        minLuminanceDeltaFromWhite,
      },
      pages,
    };

    const textLines: string[] = [
      `========================================================================`,
      `CALCTOOLS PDF 2.0 — PDF BLANK PAGE DETECTOR REPORT`,
      `========================================================================`,
      `File Name            : ${reportData.fileName}`,
      `File Size            : ${reportData.formattedFileSize} (${reportData.byteLength} bytes)`,
      `Total Pages Analyzed : ${reportData.totalPages}`,
      `Genuinely Blank      : ${reportData.blankPageCount} (${blankPageNumbers.length > 0 ? `Pages: ${blankPageNumbers.join(', ')}` : 'None'})`,
      `Nearly Blank / Faint : ${reportData.nearlyBlankPageCount} (${nearlyBlankPageNumbers.length > 0 ? `Pages: ${nearlyBlankPageNumbers.join(', ')}` : 'None'})`,
      `Non-Blank Content    : ${reportData.nonBlankPageCount} (${nonBlankPageNumbers.length > 0 ? `Pages: ${nonBlankPageNumbers.join(', ')}` : 'None'})`,
      `------------------------------------------------------------------------`,
      `PER-PAGE CLASSIFICATION LEDGER:`,
      ...pages.map(
        (p) =>
          `  Page ${String(p.pageNumber).padStart(3, ' ')}: ${p.classification.padEnd(30, ' ')} | blank=${String(p.isBlank).padEnd(5, ' ')} | conf=${p.confidence}% | chars=${p.characterCount} | imgs=${p.imageXObjectCount} | vecOps=${p.vectorDrawingOperatorCount} | inkRatio=${p.estimatedInkCoverageRatio} | ${p.reason}`
      ),
      `========================================================================`,
    ];
    const previewText = textLines.join('\n');

    const { primaryFile, outputFiles } = createReportOutputFiles(
      reportData.fileName,
      'blank_page_report',
      previewText,
      reportData as unknown as Record<string, unknown>
    );

    const inspectionReport: PdfInspectionReport = {
      reportType: 'blank-page-detector',
      summaryMetrics: [
        { label: 'Total Pages', value: totalPages },
        { label: 'Genuinely Blank Pages', value: blankPageNumbers.length > 0 ? `${blankPageNumbers.length} (p. ${blankPageNumbers.join(', ')})` : 0 },
        { label: 'Nearly Blank / Faint Pages', value: nearlyBlankPageNumbers.length > 0 ? `${nearlyBlankPageNumbers.length} (p. ${nearlyBlankPageNumbers.join(', ')})` : 0 },
        { label: 'Content Pages', value: nonBlankPageNumbers.length },
      ],
      tableHeaders: ['Page', 'Classification', 'Blank?', 'Confidence', 'Chars', 'Images', 'Vector Ops', 'Ink Ratio', 'Reason'],
      tableRows: pages.map((p) => [
        p.pageNumber,
        p.classification,
        p.isBlank ? 'YES' : p.isUncertainOrFaint ? 'FAINT/SPARSE' : 'NO',
        `${p.confidence}%`,
        p.characterCount,
        p.imageXObjectCount,
        p.vectorDrawingOperatorCount,
        p.estimatedInkCoverageRatio,
        p.reason,
      ]),
      rawData: reportData as unknown as Record<string, unknown>,
    };

    const summary = `Analyzed ${totalPages} page(s) in "${reportData.fileName}": ${blankPageNumbers.length} genuinely blank, ${nearlyBlankPageNumbers.length} nearly blank/faint, and ${nonBlankPageNumbers.length} content page(s).`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      summary,
      metrics: {
        inputBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      previewText,
      warnings,
      limitations: [
        'Analysis-only operation: pages are classified and reported without modifying or deleting any pages from the source PDF.',
      ],
      details: reportData as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildEngineEFailureResult(canonicalId, procErr, startTime, inputBytes);
  } finally {
    if (pdfJsSession) await pdfJsSession.dispose();
    await loaded.dispose();
  }
}

/**
 * ============================================================================
 * 6. TOOL 5: PDF FILE SIZE ANALYZER (`pdf-file-size-analyzer`)
 * ============================================================================
 */

export type PdfResourceCategory =
  | 'IMAGES'
  | 'FONTS'
  | 'PAGE_CONTENT_STREAMS'
  | 'METADATA_AND_XMP'
  | 'OTHER_STREAMS';

export interface PdfLargeResourceEntry {
  objectRef: string;
  category: PdfResourceCategory;
  subtype: string;
  exactStreamBytes: number;
  formattedSize: string;
  percentageOfTotalFile: number;
  dimensionsOrDetails: string;
  measurementKind: 'EXACT_STREAM_LENGTH';
}

export interface PdfOptimizationRecommendation {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  estimatedSavingsCategory: PdfResourceCategory | 'XREF_STRUCTURE';
}

export interface PdfFileSizeAnalyzerOptions {
  password?: string;
  largeResourceThresholdBytes?: number;
  signal?: AbortSignal;
}

export interface PdfFileSizeAnalyzerReportData {
  fileName: string;
  totalBytes: number;
  formattedTotalSize: string;
  pageCount: number;
  averageBytesPerPage: number;
  formattedAverageBytesPerPage: string;
  pdfVersion: string;
  isEncrypted: boolean;
  totalIndirectObjectsCount: number;
  totalStreamObjectsCount: number;
  exactCategoryStreamBytes: {
    imagesBytes: number;
    imageStreamsCount: number;
    fontsBytes: number;
    fontStreamsCount: number;
    pageContentStreamsBytes: number;
    pageContentStreamsCount: number;
    metadataAndXmpBytes: number;
    metadataStreamsCount: number;
    otherStreamsBytes: number;
    otherStreamsCount: number;
    totalMeasuredStreamBytes: number;
  };
  estimatedStructuralOverheadBytes: number;
  categoryPercentages: {
    imagesPct: number;
    fontsPct: number;
    pageContentStreamsPct: number;
    metadataAndXmpPct: number;
    otherStreamsPct: number;
    estimatedStructuralOverheadPct: number;
  };
  dominantCategory: PdfResourceCategory | 'STRUCTURAL_OVERHEAD';
  largeResources: PdfLargeResourceEntry[];
  optimizationRecommendations: PdfOptimizationRecommendation[];
  measurementDisclosure: string;
}

/**
 * Canonical Tool 5: `pdf-file-size-analyzer`
 *
 * Inspects every indirect object and stream in the PDF cross-reference table (`doc.context.enumerateIndirectObjects()`)
 * to measure:
 * - Exact total file size in bytes, human-readable size, page count, and average bytes per page.
 * - Exact raw stream payload byte lengths (`EXACT_STREAM_LENGTH`) categorized into:
 *   1. Embedded Images (`/Subtype /Image` XObjects).
 *   2. Embedded Font programs (`/FontFile`, `/FontFile2`, `/FontFile3`, `/Subtype /CIDFontType0C`, `/OpenType`).
 *   3. Page Content Streams (referenced by page `/Contents`).
 *   4. Metadata & XMP Packets (`/Type /Metadata`, `/Subtype /XML`, plus `/Info` serialized dictionary bytes).
 *   5. Other Streams (ICC color profiles, XRef streams, object streams, form XObjects).
 * - Estimated structural/syntax overhead (`totalBytes - totalMeasuredStreamBytes`, explicitly labeled as an estimate).
 * - Large resource identification and actionable optimization opportunities.
 *
 * Strictly read-only: never modifies or compresses the input document.
 */
export async function analyzePdfFileSizeV2(
  input: PdfDocumentInput,
  options: PdfFileSizeAnalyzerOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-file-size-analyzer';
  const totalBytes = inspectByteLength(input?.bytes);
  const signal = options.signal ?? request?.signal;

  if (signal?.aborted) {
    return buildEngineEFailureResult(
      canonicalId,
      createPdfProcessingError('ERR_OPERATION_ABORTED', 'File size analysis was cancelled.'),
      startTime,
      totalBytes
    );
  }

  request?.onProgress?.({
    percent: 20,
    stage: 'LOADING',
    message: 'Loading PDF cross-reference table and indirect objects for file size analysis...',
  });

  const password = options.password ?? input?.password;
  const loaded = await loadPdfDocumentV2(input, { password });

  if (!loaded.success || !loaded.document || !loaded.isolatedBytes) {
    await loaded.dispose();
    return buildEngineEFailureResult(
      canonicalId,
      loaded.error || createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      totalBytes,
      loaded.warnings
    );
  }

  try {
    if (signal?.aborted) {
      throw createPdfProcessingError('ERR_OPERATION_ABORTED', 'File size analysis was cancelled.');
    }

    const doc = loaded.document;
    const pageCount = doc.getPageCount();
    const warnings = [...loaded.warnings];
    const largeThreshold = options.largeResourceThresholdBytes ?? 4096;

    // 1. Collect object reference tags for Page /Contents streams and Font descriptor FontFile* streams
    const contentStreamRefTags = new Set<string>();
    const fontStreamRefTags = new Set<string>();
    const metadataStreamRefTags = new Set<string>();

    const catalogMetaRef = doc.catalog.get(PDFName.of('Metadata'));
    if (catalogMetaRef instanceof PDFRef) {
      metadataStreamRefTags.add(catalogMetaRef.tag);
    }

    for (let i = 0; i < pageCount; i++) {
      const page = doc.getPage(i);
      const cRef = page.node.get(PDFName.of('Contents'));
      if (cRef instanceof PDFRef) {
        contentStreamRefTags.add(cRef.tag);
      } else {
        const cObj = page.node.Contents();
        if (cObj instanceof PDFArray) {
          for (let j = 0; j < cObj.size(); j++) {
            const item = cObj.get(j);
            if (item instanceof PDFRef) contentStreamRefTags.add(item.tag);
          }
        }
      }
    }

    const indirectObjects = doc.context.enumerateIndirectObjects();

    // First pass: identify FontDescriptor references to /FontFile, /FontFile2, /FontFile3
    for (const [, obj] of indirectObjects) {
      if (obj instanceof PDFDict) {
        for (const fontKey of ['FontFile', 'FontFile2', 'FontFile3']) {
          const fRef = obj.get(PDFName.of(fontKey));
          if (fRef instanceof PDFRef) {
            fontStreamRefTags.add(fRef.tag);
          }
        }
        const mRef = obj.get(PDFName.of('Metadata'));
        if (mRef instanceof PDFRef) {
          metadataStreamRefTags.add(mRef.tag);
        }
      }
    }

    let imagesBytes = 0;
    let imageStreamsCount = 0;
    let fontsBytes = 0;
    let fontStreamsCount = 0;
    let pageContentStreamsBytes = 0;
    let pageContentStreamsCount = 0;
    let metadataAndXmpBytes = 0;
    let metadataStreamsCount = 0;
    let otherStreamsBytes = 0;
    let otherStreamsCount = 0;
    let totalStreamObjectsCount = 0;

    // Measure /Info dictionary serialized text length if present
    const infoRef = doc.context.trailerInfo.Info;
    if (infoRef) {
      const infoObj = infoRef instanceof PDFRef ? doc.context.lookup(infoRef) : infoRef;
      if (infoObj instanceof PDFDict) {
        let infoChars = 0;
        for (const [k, v] of infoObj.entries()) {
          infoChars += k.asString().length + 4;
          const resolved = v instanceof PDFRef ? doc.context.lookup(v) : v;
          if (resolved instanceof PDFString || resolved instanceof PDFHexString) {
            infoChars += resolved.asString().length;
          }
        }
        metadataAndXmpBytes += infoChars;
      }
    }

    const largeResources: PdfLargeResourceEntry[] = [];

    // Second pass: classify every PDFRawStream / PDFStream by exact stream byte length
    for (const [ref, obj] of indirectObjects) {
      let streamBytes = 0;
      let dict: PDFDict | null = null;

      if (obj instanceof PDFRawStream) {
        streamBytes = obj.contents.byteLength;
        dict = obj.dict;
      } else if (obj instanceof PDFStream) {
        streamBytes = obj.getContentsSize();
        dict = obj.dict;
      } else {
        continue;
      }

      totalStreamObjectsCount++;
      const typeName = dict?.lookup(PDFName.of('Type')) instanceof PDFName
        ? (dict.lookup(PDFName.of('Type')) as PDFName).asString()
        : '';
      const subtypeName = dict?.lookup(PDFName.of('Subtype')) instanceof PDFName
        ? (dict.lookup(PDFName.of('Subtype')) as PDFName).asString()
        : '';
      const filterObj = dict?.lookup(PDFName.of('Filter'));
      const filterStr = filterObj ? filterObj.toString() : 'Uncompressed';

      let category: PdfResourceCategory = 'OTHER_STREAMS';
      let detailsStr = `Filter=${filterStr}`;

      if (subtypeName === '/Image') {
        category = 'IMAGES';
        imagesBytes += streamBytes;
        imageStreamsCount++;
        const w = dict?.lookup(PDFName.of('Width'))?.toString() || '?';
        const h = dict?.lookup(PDFName.of('Height'))?.toString() || '?';
        const bpc = dict?.lookup(PDFName.of('BitsPerComponent'))?.toString() || '8';
        detailsStr = `Image ${w}×${h}px (${bpc}-bit, ${filterStr})`;
      } else if (
        fontStreamRefTags.has(ref.tag) ||
        subtypeName === '/CIDFontType0C' ||
        subtypeName === '/Type1C' ||
        subtypeName === '/OpenType' ||
        dict?.has(PDFName.of('Length1')) ||
        dict?.has(PDFName.of('Length2')) ||
        dict?.has(PDFName.of('Length3'))
      ) {
        category = 'FONTS';
        fontsBytes += streamBytes;
        fontStreamsCount++;
        detailsStr = `Embedded Font Stream (${subtypeName || 'TrueType/Type1'}, ${filterStr})`;
      } else if (
        metadataStreamRefTags.has(ref.tag) ||
        typeName === '/Metadata' ||
        subtypeName === '/XML'
      ) {
        category = 'METADATA_AND_XMP';
        metadataAndXmpBytes += streamBytes;
        metadataStreamsCount++;
        detailsStr = `XMP Metadata Packet (${filterStr})`;
      } else if (contentStreamRefTags.has(ref.tag)) {
        category = 'PAGE_CONTENT_STREAMS';
        pageContentStreamsBytes += streamBytes;
        pageContentStreamsCount++;
        detailsStr = `Page Content Stream (${filterStr})`;
      } else {
        category = 'OTHER_STREAMS';
        otherStreamsBytes += streamBytes;
        otherStreamsCount++;
        detailsStr = `Stream (${typeName || subtypeName || 'Generic'}, ${filterStr})`;
      }

      if (streamBytes >= largeThreshold || (totalBytes > 0 && streamBytes / totalBytes >= 0.1)) {
        largeResources.push({
          objectRef: ref.tag,
          category,
          subtype: subtypeName || typeName || '/Stream',
          exactStreamBytes: streamBytes,
          formattedSize: formatByteSize(streamBytes),
          percentageOfTotalFile:
            totalBytes > 0 ? Math.round((streamBytes / totalBytes) * 10000) / 100 : 0,
          dimensionsOrDetails: detailsStr,
          measurementKind: 'EXACT_STREAM_LENGTH',
        });
      }
    }

    largeResources.sort((a, b) => b.exactStreamBytes - a.exactStreamBytes);

    const totalMeasuredStreamBytes =
      imagesBytes + fontsBytes + pageContentStreamsBytes + metadataAndXmpBytes + otherStreamsBytes;
    const estimatedStructuralOverheadBytes = Math.max(0, totalBytes - totalMeasuredStreamBytes);

    const toPct = (b: number): number =>
      totalBytes > 0 ? Math.round((b / totalBytes) * 10000) / 100 : 0;

    const categoryPercentages = {
      imagesPct: toPct(imagesBytes),
      fontsPct: toPct(fontsBytes),
      pageContentStreamsPct: toPct(pageContentStreamsBytes),
      metadataAndXmpPct: toPct(metadataAndXmpBytes),
      otherStreamsPct: toPct(otherStreamsBytes),
      estimatedStructuralOverheadPct: toPct(estimatedStructuralOverheadBytes),
    };

    const categoryPairs: Array<{ cat: PdfFileSizeAnalyzerReportData['dominantCategory']; bytes: number }> = [
      { cat: 'IMAGES', bytes: imagesBytes },
      { cat: 'FONTS', bytes: fontsBytes },
      { cat: 'PAGE_CONTENT_STREAMS', bytes: pageContentStreamsBytes },
      { cat: 'METADATA_AND_XMP', bytes: metadataAndXmpBytes },
      { cat: 'OTHER_STREAMS', bytes: otherStreamsBytes },
      { cat: 'STRUCTURAL_OVERHEAD', bytes: estimatedStructuralOverheadBytes },
    ];
    categoryPairs.sort((a, b) => b.bytes - a.bytes);
    const dominantCategory = categoryPairs[0].cat;

    // Build optimization recommendations based on actual measured payload distribution
    const optimizationRecommendations: PdfOptimizationRecommendation[] = [];

    if (imagesBytes > 8192 && categoryPercentages.imagesPct >= 30) {
      optimizationRecommendations.push({
        id: 'OPT_IMAGE_DOWNSAMPLING_OR_RECOMPRESSION',
        severity: categoryPercentages.imagesPct >= 60 ? 'HIGH' : 'MEDIUM',
        title: 'Compress or Downsample Embedded Raster Images',
        description: `Embedded images account for ${formatByteSize(imagesBytes)} (${categoryPercentages.imagesPct}% of total file size across ${imageStreamsCount} image stream(s)). Running pdf-compress can strip EXIF/APP markers or recompress high-DPI rasters.`,
        estimatedSavingsCategory: 'IMAGES',
      });
    }

    if (fontsBytes > 8192 && categoryPercentages.fontsPct >= 25) {
      optimizationRecommendations.push({
        id: 'OPT_FONT_SUBSETTING',
        severity: categoryPercentages.fontsPct >= 50 ? 'HIGH' : 'MEDIUM',
        title: 'Subset Embedded Font Programs',
        description: `Embedded font streams account for ${formatByteSize(fontsBytes)} (${categoryPercentages.fontsPct}% of total file size across ${fontStreamsCount} font stream(s)). Subsetting unused glyphs can reduce font payload.`,
        estimatedSavingsCategory: 'FONTS',
      });
    }

    if (metadataAndXmpBytes > 2048 || categoryPercentages.metadataAndXmpPct >= 15) {
      optimizationRecommendations.push({
        id: 'OPT_STRIP_XMP_METADATA_PADDING',
        severity: metadataAndXmpBytes > 16384 ? 'HIGH' : 'MEDIUM',
        title: 'Strip Redundant XMP Metadata Packet & Padding',
        description: `Metadata and XMP streams consume ${formatByteSize(metadataAndXmpBytes)} (${categoryPercentages.metadataAndXmpPct}% of file size). Stripping XMP padding via pdf-compress can reclaim this space losslessly.`,
        estimatedSavingsCategory: 'METADATA_AND_XMP',
      });
    }

    if (estimatedStructuralOverheadBytes > 4096 && categoryPercentages.estimatedStructuralOverheadPct >= 25) {
      optimizationRecommendations.push({
        id: 'OPT_OBJECT_STREAMS_COMPACTION',
        severity: 'LOW',
        title: 'Compact Cross-Reference Table & Indirect Objects',
        description: `Non-stream dictionary/xref syntax overhead is estimated at ${formatByteSize(estimatedStructuralOverheadBytes)} (${categoryPercentages.estimatedStructuralOverheadPct}% across ${indirectObjects.length} indirect objects). Saving with PDF 1.5+ compressed Object Streams (/ObjStm) can compact object headers.`,
        estimatedSavingsCategory: 'XREF_STRUCTURE',
      });
    }

    const averageBytesPerPage = pageCount > 0 ? Math.round(totalBytes / pageCount) : totalBytes;
    const measurementDisclosure =
      'Total file size, page count, and raw stream payload lengths (Images, Fonts, Page Content Streams, XMP Metadata, Other Streams) are EXACT measurements from the PDF cross-reference table. Non-stream structural/xref syntax overhead is an ESTIMATE calculated as (totalBytes - totalMeasuredStreamBytes).';

    const reportData: PdfFileSizeAnalyzerReportData = {
      fileName: input.fileName || 'document.pdf',
      totalBytes,
      formattedTotalSize: formatByteSize(totalBytes),
      pageCount,
      averageBytesPerPage,
      formattedAverageBytesPerPage: formatByteSize(averageBytesPerPage),
      pdfVersion: loaded.validation.pdfVersion || '1.7',
      isEncrypted: loaded.validation.hasEncryptDictionary,
      totalIndirectObjectsCount: indirectObjects.length,
      totalStreamObjectsCount,
      exactCategoryStreamBytes: {
        imagesBytes,
        imageStreamsCount,
        fontsBytes,
        fontStreamsCount,
        pageContentStreamsBytes,
        pageContentStreamsCount,
        metadataAndXmpBytes,
        metadataStreamsCount,
        otherStreamsBytes,
        otherStreamsCount,
        totalMeasuredStreamBytes,
      },
      estimatedStructuralOverheadBytes,
      categoryPercentages,
      dominantCategory,
      largeResources,
      optimizationRecommendations,
      measurementDisclosure,
    };

    const textLines: string[] = [
      `========================================================================`,
      `CALCTOOLS PDF 2.0 — PDF FILE SIZE ANALYZER REPORT`,
      `========================================================================`,
      `File Name            : ${reportData.fileName}`,
      `Total File Size      : ${reportData.formattedTotalSize} (${reportData.totalBytes} bytes) [EXACT]`,
      `Page Count           : ${reportData.pageCount}`,
      `Avg Size Per Page    : ${reportData.formattedAverageBytesPerPage} (${reportData.averageBytesPerPage} bytes/page) [EXACT]`,
      `Indirect Objects     : ${reportData.totalIndirectObjectsCount} total (${reportData.totalStreamObjectsCount} stream objects)`,
      `Dominant Category    : ${reportData.dominantCategory}`,
      `------------------------------------------------------------------------`,
      `RESOURCE BREAKDOWN (EXACT STREAM LENGTHS vs ESTIMATED SYNTAX OVERHEAD):`,
      `  1. Embedded Images      : ${formatByteSize(imagesBytes).padEnd(12, ' ')} (${imagesBytes} B | ${categoryPercentages.imagesPct}% | ${imageStreamsCount} stream(s)) [EXACT]`,
      `  2. Embedded Fonts       : ${formatByteSize(fontsBytes).padEnd(12, ' ')} (${fontsBytes} B | ${categoryPercentages.fontsPct}% | ${fontStreamsCount} stream(s)) [EXACT]`,
      `  3. Page Content Streams : ${formatByteSize(pageContentStreamsBytes).padEnd(12, ' ')} (${pageContentStreamsBytes} B | ${categoryPercentages.pageContentStreamsPct}% | ${pageContentStreamsCount} stream(s)) [EXACT]`,
      `  4. Metadata & XMP       : ${formatByteSize(metadataAndXmpBytes).padEnd(12, ' ')} (${metadataAndXmpBytes} B | ${categoryPercentages.metadataAndXmpPct}% | ${metadataStreamsCount} stream(s)) [EXACT]`,
      `  5. Other Streams        : ${formatByteSize(otherStreamsBytes).padEnd(12, ' ')} (${otherStreamsBytes} B | ${categoryPercentages.otherStreamsPct}% | ${otherStreamsCount} stream(s)) [EXACT]`,
      `  6. Structural Overhead  : ${formatByteSize(estimatedStructuralOverheadBytes).padEnd(12, ' ')} (${estimatedStructuralOverheadBytes} B | ${categoryPercentages.estimatedStructuralOverheadPct}%) [ESTIMATED]`,
      `------------------------------------------------------------------------`,
      `OPTIMIZATION RECOMMENDATIONS (${optimizationRecommendations.length}):`,
      ...(optimizationRecommendations.length > 0
        ? optimizationRecommendations.map((r) => `  - [${r.severity}] ${r.title}: ${r.description}`)
        : ['  - No major bloat detected; file is already compact.']),
      `------------------------------------------------------------------------`,
      `MEASUREMENT DISCLOSURE: ${measurementDisclosure}`,
      `========================================================================`,
    ];
    const previewText = textLines.join('\n');

    const { primaryFile, outputFiles } = createReportOutputFiles(
      reportData.fileName,
      'file_size_report',
      previewText,
      reportData as unknown as Record<string, unknown>
    );

    const inspectionReport: PdfInspectionReport = {
      reportType: 'file-size-analyzer',
      summaryMetrics: [
        { label: 'Total File Size', value: `${reportData.formattedTotalSize} (${totalBytes} B)` },
        { label: 'Page Count', value: pageCount },
        { label: 'Average Bytes / Page', value: `${reportData.formattedAverageBytesPerPage} (${averageBytesPerPage} B)` },
        { label: 'Dominant Category', value: dominantCategory },
        { label: 'Indirect Objects', value: indirectObjects.length },
      ],
      tableHeaders: ['Category', 'Byte Size', 'Formatted', '% of Total', 'Stream Count', 'Measurement Type'],
      tableRows: [
        ['Embedded Images', imagesBytes, formatByteSize(imagesBytes), `${categoryPercentages.imagesPct}%`, imageStreamsCount, 'EXACT_STREAM_LENGTH'],
        ['Embedded Fonts', fontsBytes, formatByteSize(fontsBytes), `${categoryPercentages.fontsPct}%`, fontStreamsCount, 'EXACT_STREAM_LENGTH'],
        ['Page Content Streams', pageContentStreamsBytes, formatByteSize(pageContentStreamsBytes), `${categoryPercentages.pageContentStreamsPct}%`, pageContentStreamsCount, 'EXACT_STREAM_LENGTH'],
        ['Metadata & XMP', metadataAndXmpBytes, formatByteSize(metadataAndXmpBytes), `${categoryPercentages.metadataAndXmpPct}%`, metadataStreamsCount, 'EXACT_STREAM_LENGTH'],
        ['Other Streams', otherStreamsBytes, formatByteSize(otherStreamsBytes), `${categoryPercentages.otherStreamsPct}%`, otherStreamsCount, 'EXACT_STREAM_LENGTH'],
        ['Structural / XRef Overhead', estimatedStructuralOverheadBytes, formatByteSize(estimatedStructuralOverheadBytes), `${categoryPercentages.estimatedStructuralOverheadPct}%`, '-', 'ESTIMATED_RESIDUAL'],
      ],
      rawData: reportData as unknown as Record<string, unknown>,
    };

    const summary = `Analyzed "${reportData.fileName}" (${reportData.formattedTotalSize}, ${pageCount} page(s), ${reportData.formattedAverageBytesPerPage}/page): Images=${categoryPercentages.imagesPct}%, Fonts=${categoryPercentages.fontsPct}%, Content=${categoryPercentages.pageContentStreamsPct}%, Metadata=${categoryPercentages.metadataAndXmpPct}%.`;

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles,
      outputBytes: primaryFile.bytes,
      summary,
      metrics: {
        inputBytes: totalBytes,
        outputBytes: primaryFile.byteLength,
        inputPageCount: pageCount,
        outputPageCount: pageCount,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      previewText,
      warnings,
      limitations: [measurementDisclosure],
      details: reportData as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildEngineEFailureResult(canonicalId, procErr, startTime, totalBytes, loaded.warnings);
  } finally {
    await loaded.dispose();
  }
}

/**
 * ============================================================================
 * 7. ENGINE E CANONICAL ROUTER (`executeInspectionAnalysisOperationV2`)
 * ============================================================================
 */

/**
 * Unified Engine E Router dispatching the 5 registered `inspection-analysis` canonical tools:
 * - `pdf-page-counter`
 * - `pdf-metadata-viewer`
 * - `pdf-comparison`
 * - `pdf-blank-page-detector`
 * - `pdf-file-size-analyzer`
 *
 * Strictly rejects any unknown tool ID or cross-module tool ID with `ERR_UNSUPPORTED_OPERATION`.
 */
export async function executeInspectionAnalysisOperationV2(
  request: PdfOperationRequest<Record<string, unknown>>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const totalInputBytes =
    (request.inputs || []).reduce((acc, f) => acc + inspectByteLength(f?.bytes), 0) +
    (request.secondaryInputs || []).reduce((acc, f) => acc + inspectByteLength(f?.bytes), 0);

  const resolved = resolvePdfOperationCapabilities(request.toolId);
  if (!resolved.supported || !resolved.capabilities) {
    const err =
      resolved.error ||
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Unsupported or unregistered PDF tool ID: "${request.toolId}".`
      );
    return buildEngineEFailureResult(request.toolId || 'unknown', err, startTime, totalInputBytes);
  }

  const cap = resolved.capabilities;
  if (cap.module !== 'inspection-analysis') {
    const err = createPdfProcessingError(
      'ERR_UNSUPPORTED_OPERATION',
      `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by Engine E (inspection-analysis).`,
      { requestedToolId: request.toolId, resolvedCanonicalId: cap.canonicalId, module: cap.module }
    );
    return buildEngineEFailureResult(cap.canonicalId, err, startTime, totalInputBytes);
  }

  const primaryInput = request.inputs?.[0];
  const opts = (request.options || {}) as Record<string, unknown>;

  switch (cap.canonicalId) {
    case 'pdf-page-counter': {
      if (!primaryInput) {
        return buildEngineEFailureResult(
          cap.canonicalId,
          createPdfProcessingError('ERR_EMPTY_FILE', 'A PDF input file is required for pdf-page-counter.'),
          startTime,
          totalInputBytes
        );
      }
      const clonedBytes = cloneIsolatedPdfBytes(primaryInput.bytes);
      const cloned: PdfDocumentInput = {
        ...primaryInput,
        bytes: clonedBytes,
      };
      try {
        return await countPdfPagesV2(cloned, opts as PdfPageCounterOptions, request);
      } finally {
        wipeInternalBuffer(clonedBytes);
      }
    }

    case 'pdf-metadata-viewer': {
      if (!primaryInput) {
        return buildEngineEFailureResult(
          cap.canonicalId,
          createPdfProcessingError('ERR_EMPTY_FILE', 'A PDF input file is required for pdf-metadata-viewer.'),
          startTime,
          totalInputBytes
        );
      }
      const clonedBytes = cloneIsolatedPdfBytes(primaryInput.bytes);
      const cloned: PdfDocumentInput = {
        ...primaryInput,
        bytes: clonedBytes,
      };
      try {
        return await inspectPdfMetadataV2(cloned, opts as PdfMetadataViewerOptions, request);
      } finally {
        wipeInternalBuffer(clonedBytes);
      }
    }

    case 'pdf-comparison': {
      const secondInput = request.inputs?.[1] ?? request.secondaryInputs?.[0];
      if (!primaryInput || !secondInput) {
        return buildEngineEFailureResult(
          cap.canonicalId,
          createPdfProcessingError(
            'ERR_SECOND_FILE_REQUIRED',
            'PDF Comparison requires two PDF files (Document A and Document B).'
          ),
          startTime,
          totalInputBytes
        );
      }
      const clonedBytesA = cloneIsolatedPdfBytes(primaryInput.bytes);
      const clonedBytesB = cloneIsolatedPdfBytes(secondInput.bytes);
      const clonedA: PdfDocumentInput = {
        ...primaryInput,
        bytes: clonedBytesA,
      };
      const clonedB: PdfDocumentInput = {
        ...secondInput,
        bytes: clonedBytesB,
      };
      try {
        return await comparePdfDocumentsV2(clonedA, clonedB, opts as PdfComparisonOptions, request);
      } finally {
        wipeInternalBuffer(clonedBytesA);
        wipeInternalBuffer(clonedBytesB);
      }
    }

    case 'pdf-blank-page-detector': {
      if (!primaryInput) {
        return buildEngineEFailureResult(
          cap.canonicalId,
          createPdfProcessingError('ERR_EMPTY_FILE', 'A PDF input file is required for pdf-blank-page-detector.'),
          startTime,
          totalInputBytes
        );
      }
      const clonedBytes = cloneIsolatedPdfBytes(primaryInput.bytes);
      const cloned: PdfDocumentInput = {
        ...primaryInput,
        bytes: clonedBytes,
      };
      try {
        return await detectBlankPdfPagesV2(cloned, opts as PdfBlankPageDetectorOptions, request);
      } finally {
        wipeInternalBuffer(clonedBytes);
      }
    }

    case 'pdf-file-size-analyzer': {
      if (!primaryInput) {
        return buildEngineEFailureResult(
          cap.canonicalId,
          createPdfProcessingError('ERR_EMPTY_FILE', 'A PDF input file is required for pdf-file-size-analyzer.'),
          startTime,
          totalInputBytes
        );
      }
      const clonedBytes = cloneIsolatedPdfBytes(primaryInput.bytes);
      const cloned: PdfDocumentInput = {
        ...primaryInput,
        bytes: clonedBytes,
      };
      try {
        return await analyzePdfFileSizeV2(cloned, opts as PdfFileSizeAnalyzerOptions, request);
      } finally {
        wipeInternalBuffer(clonedBytes);
      }
    }

    default: {
      return buildEngineEFailureResult(
        cap.canonicalId,
        createPdfProcessingError(
          'ERR_MISSING_OPERATION_HANDLER',
          `No Engine E handler implemented for "${cap.canonicalId}".`
        ),
        startTime,
        totalInputBytes
      );
    }
  }
}
