import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFName,
  PDFPage,
  StandardFonts,
  degrees,
  rgb,
} from '@cantoo/pdf-lib';
import { inspectByteLength } from './pdfByteUtils';
import { extractDocumentMetadataSummary, loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { serializeAndVerifyPdfV2 } from './pdfOutputIntegrity';
import { resolvePdfPageSelection } from './pdfPageRangeParser';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfDocumentMetadataSummary,
  PdfInspectionReport,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfPageSelection,
  PdfProcessingError,
} from './pdfTypes';
import {
  RgbColorNormalized,
  isTextEncodableByFont,
  parsePdfColorInput,
  renderUnicodeTextToPngStamp,
} from './pdfUnicodeCanvasRenderer';

/**
 * ============================================================================
 * 1. TYPES & OPTIONS FOR PHASE PDF-05 EDITING & GEOMETRY OPERATIONS
 * ============================================================================
 */

export type WatermarkPositionPreset =
  | 'center'
  | 'diagonal'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom';

export interface PdfWatermarkOptions {
  /** Watermark text string (required unless watermarkImageBytes is provided) */
  text?: string;
  /** Optional PNG or JPEG image bytes for image watermark */
  watermarkImageBytes?: Uint8Array | ArrayBuffer;
  /** Optional MIME type hint for watermarkImageBytes ('image/png' | 'image/jpeg') */
  watermarkImageMimeType?: string;
  /** Font size in points for text watermark (default: 48) */
  fontSize?: number;
  /** Opacity in (0, 1] (default: 0.28) */
  opacity?: number;
  /** Rotation angle in degrees in [-360, 360] (default: 45 for diagonal, 0 otherwise) */
  rotationDegrees?: number;
  /** Color as hex string (e.g. "#CC0000") or normalized RGB */
  color?: string | RgbColorNormalized;
  /** Placement preset (default: 'diagonal' for text, 'center' for image) */
  position?: WatermarkPositionPreset;
  /** Custom X coordinate in PDF points (when position === 'custom') */
  x?: number;
  /** Custom Y coordinate in PDF points (when position === 'custom') */
  y?: number;
  /** Scale multiplier for image watermarks in (0.05, 5] (default: 0.4) */
  imageScale?: number;
  /** Target width in points for image watermark (overrides imageScale if set) */
  imageWidthPt?: number;
  /** Target height in points for image watermark (overrides imageScale if set) */
  imageHeightPt?: number;
  /** Page selection (defaults to 'all') */
  selection?: PdfPageSelection | string | number[];
  /** Force Unicode Canvas PNG stamp path even for ASCII text (for testing) */
  forceUnicodeCanvasFallback?: boolean;
  /** Custom output file name */
  outputFileName?: string;
}

export type PageNumberFormatPreset =
  | 'n'
  | 'n-of-total'
  | 'page-n'
  | 'page-n-of-total'
  | 'roman-lower'
  | 'roman-upper'
  | 'custom';

export type PageNumberPositionPreset =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export interface PdfPageNumberingOptions {
  /** Starting page number for the first numbered page (default: 1, must be integer >= 0) */
  startNumber?: number;
  /** Number format preset (default: 'page-n-of-total') */
  format?: PageNumberFormatPreset;
  /** Custom template using {n} and {total} tokens (used when format === 'custom') */
  customTemplate?: string;
  /** Optional prefix prepended to the formatted page number */
  prefix?: string;
  /** Optional suffix appended to the formatted page number */
  suffix?: string;
  /** Placement position for the page number (default: 'bottom-center') */
  position?: PageNumberPositionPreset;
  /** Margin from page edge in points (default: 28) */
  marginPt?: number;
  /** Font size in points (default: 11) */
  fontSize?: number;
  /** Text color (default: "#333333") */
  color?: string | RgbColorNormalized;
  /** Opacity in (0, 1] (default: 1.0) */
  opacity?: number;
  /** Optional header text placed at top-center (or top-left if page number is top-center) */
  headerText?: string;
  /** Optional footer text placed at bottom-left (or bottom-center if page number is elsewhere) */
  footerText?: string;
  /** Optional simultaneous watermark options (used by pdf-page-numbering-header-watermark-tool) */
  watermark?: PdfWatermarkOptions;
  /** Page selection (defaults to 'all') */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfTextInsertionOptions {
  /** Text content to insert (must be non-empty) */
  text: string;
  /** X coordinate in points */
  x: number;
  /** Y coordinate in points */
  y: number;
  /** Coordinate origin ('bottom-left' standard PDF or 'top-left' screen space; default: 'bottom-left') */
  coordinateOrigin?: 'bottom-left' | 'top-left';
  /** Font size in points (default: 14) */
  fontSize?: number;
  /** Text color (default: "#000000") */
  color?: string | RgbColorNormalized;
  /** Opacity in (0, 1] (default: 1.0) */
  opacity?: number;
  /** Horizontal alignment relative to X coordinate ('left' | 'center' | 'right', default: 'left') */
  align?: 'left' | 'center' | 'right';
  /** Rotation angle in degrees (default: 0) */
  rotationDegrees?: number;
  /** Standard font family ('Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier') */
  fontFamily?: 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier';
  /** Require coordinates to fall strictly within the target page dimensions (default: true) */
  strictBoundsCheck?: boolean;
  /** Force Unicode Canvas PNG stamp path */
  forceUnicodeCanvasFallback?: boolean;
  /** Page selection (defaults to page 1 or 'all' if unspecified; defaults to 'all' for consistency) */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfCropMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface PdfCropBoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfCropPagesOptions {
  /** Margin insets in PDF points to trim from each visual edge */
  margins?: PdfCropMargins;
  /** Explicit target CropBox rectangle in unrotated page space (or visual space if respectRotationOnBox is true) */
  cropBox?: PdfCropBoxRect;
  /** Also update MediaBox to match the new CropBox (default: true so all viewers and PDF.js page.view reflect the cropped size immediately) */
  synchronizeMediaBox?: boolean;
  /** Page selection (defaults to 'all') */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export type StandardPdfPageSizePreset =
  | 'A3'
  | 'A4'
  | 'A5'
  | 'B5'
  | 'Letter'
  | 'Legal'
  | 'Tabloid'
  | 'Executive'
  | 'Custom';

export interface PdfResizePagesOptions {
  /** Standard page size preset (e.g. 'A4', 'Letter', 'Legal', 'A3', 'A5', 'Custom') */
  preset?: StandardPdfPageSizePreset;
  /** Custom width (required when preset === 'Custom' or when preset is omitted) */
  width?: number;
  /** Custom height (required when preset === 'Custom' or when preset is omitted) */
  height?: number;
  /** Measurement unit for custom width/height ('pt' | 'mm' | 'in', default: 'pt') */
  unit?: 'pt' | 'mm' | 'in';
  /** Target orientation ('portrait' | 'landscape' | 'auto', default: 'portrait' unless custom width > height) */
  orientation?: 'portrait' | 'landscape' | 'auto';
  /**
   * Content scaling & positioning strategy:
   * - 'contain-center': Proportionally scales page content to fit inside the new dimensions and centers it (default; avoids clipping and distortion)
   * - 'stretch': Scales X and Y independently to fill the new dimensions
   * - 'pad-center': Preserves 1:1 content scale and centers it inside the new page size (rejects if target is smaller than source to prevent unintended clipping)
   */
  fitMode?: 'contain-center' | 'stretch' | 'pad-center';
  /** Page selection (defaults to 'all') */
  selection?: PdfPageSelection | string | number[];
  /** Custom output file name */
  outputFileName?: string;
}

export interface PdfMetadataEditOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string | string[];
  creator?: string;
  producer?: string;
  /** Clear/sanitize all existing metadata fields before applying the specified fields (default: false — preserves unrelated metadata) */
  clearExistingMetadata?: boolean;
  /** Synchronize XMP catalog /Metadata XML stream with InfoDict (default: true) */
  synchronizeXmp?: boolean;
  /** Custom output file name */
  outputFileName?: string;
}

/**
 * Standard PDF page presets in points (1 inch = 72 pt, 1 mm = 72 / 25.4 pt).
 */
export const STANDARD_PDF_PAGE_SIZES_PT: Readonly<
  Record<Exclude<StandardPdfPageSizePreset, 'Custom'>, { widthPt: number; heightPt: number }>
> = {
  A3: { widthPt: 841.89, heightPt: 1190.55 },
  A4: { widthPt: 595.28, heightPt: 841.89 },
  A5: { widthPt: 419.53, heightPt: 595.28 },
  B5: { widthPt: 498.9, heightPt: 708.66 },
  Letter: { widthPt: 612, heightPt: 792 },
  Legal: { widthPt: 612, heightPt: 1008 },
  Tabloid: { widthPt: 792, heightPt: 1224 },
  Executive: { widthPt: 522, heightPt: 756 },
};

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

function toRomanNumeral(num: number): string {
  if (!Number.isInteger(num) || num <= 0) return String(num);
  const lookup: Array<[string, number]> = [
    ['M', 1000],
    ['CM', 900],
    ['D', 500],
    ['CD', 400],
    ['C', 100],
    ['XC', 90],
    ['L', 50],
    ['XL', 40],
    ['X', 10],
    ['IX', 9],
    ['V', 5],
    ['IV', 4],
    ['I', 1],
  ];
  let result = '';
  let remaining = num;
  for (const [roman, value] of lookup) {
    while (remaining >= value) {
      result += roman;
      remaining -= value;
    }
  }
  return result;
}

export function formatPageNumberLabel(params: {
  pageNumberValue: number;
  totalNumberedPages: number;
  format?: PageNumberFormatPreset;
  customTemplate?: string;
  prefix?: string;
  suffix?: string;
}): string {
  const n = params.pageNumberValue;
  const total = params.totalNumberedPages;
  const fmt = params.format || 'page-n-of-total';

  let core: string;
  switch (fmt) {
    case 'n':
      core = `${n}`;
      break;
    case 'n-of-total':
      core = `${n} / ${total}`;
      break;
    case 'page-n':
      core = `Page ${n}`;
      break;
    case 'page-n-of-total':
      core = `Page ${n} of ${total}`;
      break;
    case 'roman-lower':
      core = toRomanNumeral(n).toLowerCase();
      break;
    case 'roman-upper':
      core = toRomanNumeral(n).toUpperCase();
      break;
    case 'custom':
      core = (params.customTemplate || 'Page {n} of {total}')
        .replace(/\{n\}/g, String(n))
        .replace(/\{total\}/g, String(total));
      break;
    default:
      core = `Page ${n} of ${total}`;
      break;
  }

  const prefix = params.prefix ?? '';
  const suffix = params.suffix ?? '';
  return `${prefix}${core}${suffix}`;
}

/**
 * Draws a single text string onto `page`, automatically falling back to a transparent
 * high-DPI PNG stamp if `text` contains Unicode characters outside `font`'s WinAnsi encoding.
 */
async function drawTextWithUnicodeFallback(params: {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: RgbColorNormalized;
  opacity: number;
  rotationDegrees: number;
  align?: 'left' | 'center' | 'right';
  forceUnicodeCanvasFallback?: boolean;
}): Promise<{ usedUnicodeFallback: boolean; widthPt: number; heightPt: number }> {
  const {
    doc,
    page,
    font,
    text,
    x,
    y,
    fontSize,
    color,
    opacity,
    rotationDegrees,
    align = 'left',
    forceUnicodeCanvasFallback = false,
  } = params;

  const canUseVectorFont = !forceUnicodeCanvasFallback && isTextEncodableByFont(text, font);

  if (canUseVectorFont) {
    const lines = text.split(/\r?\n/);
    const lineHeight = fontSize * 1.25;
    let maxLineWidth = 0;
    for (const line of lines) {
      const lw = font.widthOfTextAtSize(line, fontSize);
      if (lw > maxLineWidth) maxLineWidth = lw;
    }

    let drawX = x;
    if (align === 'center') {
      drawX = x - maxLineWidth / 2;
    } else if (align === 'right') {
      drawX = x - maxLineWidth;
    }

    page.drawText(text, {
      x: drawX,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      lineHeight,
      rotate: degrees(rotationDegrees),
    });

    return {
      usedUnicodeFallback: false,
      widthPt: Math.round(maxLineWidth * 100) / 100,
      heightPt: Math.round(lines.length * lineHeight * 100) / 100,
    };
  }

  // Non-WinAnsi Unicode text: render to transparent high-DPI PNG stamp and embed
  const stamp = await renderUnicodeTextToPngStamp({
    text,
    fontSizePt: fontSize,
    color,
    opacity: 1, // Apply opacity at drawImage level so PDF graphics state controls alpha cleanly
    align,
    dpiScale: 2,
  });

  const embeddedPng = await doc.embedPng(stamp.pngBytes);

  let drawX = x;
  if (align === 'center') {
    drawX = x - stamp.widthPt / 2;
  } else if (align === 'right') {
    drawX = x - stamp.widthPt;
  }

  page.drawImage(embeddedPng, {
    x: drawX,
    y,
    width: stamp.widthPt,
    height: stamp.heightPt,
    opacity,
    rotate: degrees(rotationDegrees),
  });

  return {
    usedUnicodeFallback: true,
    widthPt: stamp.widthPt,
    heightPt: stamp.heightPt,
  };
}

/**
 * Resolves a preset position ('center', 'diagonal', 'top-left', etc.) to page coordinates.
 */
function resolvePresetPositionCoordinates(params: {
  position: WatermarkPositionPreset | PageNumberPositionPreset;
  pageBox: { x: number; y: number; width: number; height: number };
  itemWidth: number;
  itemHeight: number;
  marginPt?: number;
  customX?: number;
  customY?: number;
}): { x: number; y: number; align: 'left' | 'center' | 'right' } {
  const { position, pageBox, itemWidth, itemHeight, marginPt = 36, customX, customY } = params;
  const leftX = pageBox.x + marginPt;
  const centerX = pageBox.x + pageBox.width / 2;
  const rightX = pageBox.x + pageBox.width - marginPt;

  const bottomY = pageBox.y + marginPt;
  const centerY = pageBox.y + (pageBox.height - itemHeight) / 2;
  const topY = pageBox.y + pageBox.height - marginPt - itemHeight;

  switch (position) {
    case 'top-left':
      return { x: leftX, y: topY, align: 'left' };
    case 'top-center':
      return { x: centerX, y: topY, align: 'center' };
    case 'top-right':
      return { x: rightX, y: topY, align: 'right' };
    case 'bottom-left':
      return { x: leftX, y: bottomY, align: 'left' };
    case 'bottom-center':
      return { x: centerX, y: bottomY, align: 'center' };
    case 'bottom-right':
      return { x: rightX, y: bottomY, align: 'right' };
    case 'custom':
      return {
        x: pageBox.x + (Number.isFinite(customX) ? Number(customX) : marginPt),
        y: pageBox.y + (Number.isFinite(customY) ? Number(customY) : marginPt),
        align: 'left',
      };
    case 'diagonal':
    case 'center':
    default:
      return {
        x: pageBox.x + (pageBox.width - itemWidth) / 2,
        y: centerY,
        align: 'left',
      };
  }
}

/**
 * Embeds a PNG or JPEG image into `doc`, detecting format by magic bytes.
 */
async function embedWatermarkImageBytes(
  doc: PDFDocument,
  imageBytes: Uint8Array | ArrayBuffer
): Promise<PDFImage> {
  const view =
    imageBytes instanceof Uint8Array
      ? imageBytes
      : new Uint8Array(imageBytes);

  if (view.byteLength < 8) {
    throw createPdfProcessingError(
      'ERR_UNSUPPORTED_IMAGE_FORMAT',
      'Watermark image buffer is empty or too short.'
    );
  }

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    view[0] === 0x89 &&
    view[1] === 0x50 &&
    view[2] === 0x4e &&
    view[3] === 0x47;

  // Check JPEG signature: FF D8 FF
  const isJpeg = view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff;

  if (isPng) {
    return await doc.embedPng(view);
  }
  if (isJpeg) {
    return await doc.embedJpg(view);
  }

  throw new Error('UNSUPPORTED_WATERMARK_IMAGE_SIGNATURE');
}

/**
 * ============================================================================
 * A. WATERMARKS (`pdf-add-watermark`, alias `pdf-watermark`)
 * ============================================================================
 */
export async function addWatermarkToPdfV2(
  input: PdfDocumentInput,
  options: PdfWatermarkOptions & {
    canonicalId?: string;
    secondaryInputs?: PdfDocumentInput[];
  } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-add-watermark';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for watermarking.'),
      startTime,
      0
    );
  }

  const imageSourceBytes =
    options.watermarkImageBytes ?? options.secondaryInputs?.[0]?.bytes;
  const hasImageWatermark = inspectByteLength(imageSourceBytes) > 0;
  const hasTextWatermark =
    typeof options.text === 'string' && options.text.trim().length > 0;

  if (!hasImageWatermark && !hasTextWatermark) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_EMPTY_WATERMARK_CONTENT',
        'A non-empty watermark text or a valid PNG/JPEG watermark image is required.'
      ),
      startTime,
      inputBytes
    );
  }

  const opacity = options.opacity !== undefined ? Number(options.opacity) : 0.28;
  if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Watermark opacity must be a number in (0, 1]; received ${String(options.opacity)}.`,
        { opacity: options.opacity }
      ),
      startTime,
      inputBytes
    );
  }

  const fontSize = options.fontSize !== undefined ? Number(options.fontSize) : 48;
  if (!Number.isFinite(fontSize) || fontSize < 4 || fontSize > 400) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Watermark font size must be between 4pt and 400pt; received ${String(options.fontSize)}.`,
        { fontSize: options.fontSize }
      ),
      startTime,
      inputBytes
    );
  }

  const position: WatermarkPositionPreset =
    options.position || (hasImageWatermark ? 'center' : 'diagonal');
  const rotationDegrees =
    options.rotationDegrees !== undefined
      ? Number(options.rotationDegrees)
      : position === 'diagonal'
      ? 45
      : 0;

  if (!Number.isFinite(rotationDegrees) || rotationDegrees < -360 || rotationDegrees > 360) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Watermark rotation angle must be between -360° and 360°; received ${String(options.rotationDegrees)}.`,
        { rotationDegrees: options.rotationDegrees }
      ),
      startTime,
      inputBytes
    );
  }

  if (
    position === 'custom' &&
    (!Number.isFinite(Number(options.x)) || !Number.isFinite(Number(options.y)))
  ) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        'Custom watermark position requires finite x and y coordinates.'
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

    const parsedSelection = resolvePdfPageSelection(
      options.selection ?? input.pageSelection,
      totalPages,
      {
        defaultToAll: true,
        allowDuplicates: false,
        pageOrientations: orientations,
      }
    );

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const color = parsePdfColorInput(options.color, { r: 0.75, g: 0.1, b: 0.1 });
    let usedUnicodeFallback = false;
    let embeddedWatermarkImage: PDFImage | null = null;

    if (hasImageWatermark && imageSourceBytes) {
      try {
        embeddedWatermarkImage = await embedWatermarkImageBytes(doc, imageSourceBytes);
      } catch {
        return buildErrorResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_UNSUPPORTED_IMAGE_FORMAT',
            'Watermark image must be a valid PNG or JPEG image.'
          ),
          startTime,
          inputBytes,
          warnings
        );
      }
    }

    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    for (const pageIdx of parsedSelection.pageIndices) {
      const page = doc.getPage(pageIdx);
      const cropBox = page.getCropBox();

      if (embeddedWatermarkImage) {
        const imageScale =
          options.imageScale !== undefined ? Number(options.imageScale) : 0.4;
        if (!Number.isFinite(imageScale) || imageScale <= 0 || imageScale > 10) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_DIMENSIONS',
              `Watermark image scale must be a positive number; received ${String(options.imageScale)}.`
            ),
            startTime,
            inputBytes,
            warnings
          );
        }

        const imgWidth =
          options.imageWidthPt !== undefined
            ? Number(options.imageWidthPt)
            : embeddedWatermarkImage.width * imageScale;
        const imgHeight =
          options.imageHeightPt !== undefined
            ? Number(options.imageHeightPt)
            : embeddedWatermarkImage.height * imageScale;

        if (!Number.isFinite(imgWidth) || imgWidth <= 0 || !Number.isFinite(imgHeight) || imgHeight <= 0) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_DIMENSIONS',
              'Watermark image dimensions must be positive numbers.'
            ),
            startTime,
            inputBytes,
            warnings
          );
        }

        const coords = resolvePresetPositionCoordinates({
          position,
          pageBox: cropBox,
          itemWidth: imgWidth,
          itemHeight: imgHeight,
          customX: options.x,
          customY: options.y,
        });

        let drawX = coords.x;
        if (coords.align === 'center') drawX -= imgWidth / 2;
        else if (coords.align === 'right') drawX -= imgWidth;

        page.drawImage(embeddedWatermarkImage, {
          x: drawX,
          y: coords.y,
          width: imgWidth,
          height: imgHeight,
          opacity,
          rotate: degrees(rotationDegrees),
        });
      }

      if (hasTextWatermark && options.text) {
        const text = options.text.trim();
        const estimatedWidth = isTextEncodableByFont(text, font)
          ? font.widthOfTextAtSize(text.split(/\r?\n/)[0] || text, fontSize)
          : Array.from(text).length * fontSize * 0.7;

        const coords = resolvePresetPositionCoordinates({
          position,
          pageBox: cropBox,
          itemWidth: estimatedWidth,
          itemHeight: fontSize,
          customX: options.x,
          customY: options.y,
        });

        const drawRes = await drawTextWithUnicodeFallback({
          doc,
          page,
          font,
          text,
          x: coords.x,
          y: coords.y,
          fontSize,
          color,
          opacity,
          rotationDegrees,
          align: coords.align,
          forceUnicodeCanvasFallback: options.forceUnicodeCanvasFallback,
        });

        if (drawRes.usedUnicodeFallback) {
          usedUnicodeFallback = true;
        }
      }
    }

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
    const outputFileName = options.outputFileName || `${baseName}_watermarked.pdf`;

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
      summary: `Applied ${hasImageWatermark ? 'image' : 'text'} watermark to ${parsedSelection.pageIndices.length} page(s) (${parsedSelection.normalizedExpression}) of "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: usedUnicodeFallback
        ? ['Non-WinAnsi Unicode watermark text was rendered via transparent PNG stamp fallback.']
        : [],
      details: {
        watermarkedPageNumbers: parsedSelection.pageNumbers,
        watermarkKind: hasImageWatermark && hasTextWatermark ? 'both' : hasImageWatermark ? 'image' : 'text',
        opacity,
        rotationDegrees,
        position,
        usedUnicodeFallback,
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
 * B. PAGE NUMBERING & HEADERS/FOOTERS (`pdf-add-page-numbers`, `pdf-page-numbering-header-watermark-tool`)
 * ============================================================================
 */
export async function addPageNumbersToPdfV2(
  input: PdfDocumentInput,
  options: PdfPageNumberingOptions & {
    canonicalId?: string;
    secondaryInputs?: PdfDocumentInput[];
  } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-add-page-numbers';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for page numbering.'),
      startTime,
      0
    );
  }

  const startNumber = options.startNumber !== undefined ? Number(options.startNumber) : 1;
  if (!Number.isInteger(startNumber) || startNumber < 0) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Starting page number must be a non-negative integer; received ${String(options.startNumber)}.`,
        { startNumber: options.startNumber }
      ),
      startTime,
      inputBytes
    );
  }

  const fontSize = options.fontSize !== undefined ? Number(options.fontSize) : 11;
  if (!Number.isFinite(fontSize) || fontSize < 4 || fontSize > 120) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Page numbering font size must be between 4pt and 120pt; received ${String(options.fontSize)}.`
      ),
      startTime,
      inputBytes
    );
  }

  const marginPt = options.marginPt !== undefined ? Number(options.marginPt) : 28;
  if (!Number.isFinite(marginPt) || marginPt < 0 || marginPt > 300) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Margin must be between 0pt and 300pt; received ${String(options.marginPt)}.`
      ),
      startTime,
      inputBytes
    );
  }

  const opacity = options.opacity !== undefined ? Number(options.opacity) : 1.0;
  if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Opacity must be in (0, 1]; received ${String(options.opacity)}.`
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

    const parsedSelection = resolvePdfPageSelection(
      options.selection ?? input.pageSelection,
      totalPages,
      {
        defaultToAll: true,
        allowDuplicates: false,
        pageOrientations: orientations,
      }
    );

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    const color = parsePdfColorInput(options.color, { r: 0.15, g: 0.15, b: 0.15 });
    const position: PageNumberPositionPreset = options.position || 'bottom-center';

    let usedUnicodeFallback = false;
    const generatedLabels: Array<{ pageNumber: number; label: string }> = [];

    const totalNumberedPages = parsedSelection.pageIndices.length;

    for (let i = 0; i < parsedSelection.pageIndices.length; i++) {
      const pageIdx = parsedSelection.pageIndices[i];
      const page = doc.getPage(pageIdx);
      const cropBox = page.getCropBox();
      const currentNumberValue = startNumber + i;

      const label = formatPageNumberLabel({
        pageNumberValue: currentNumberValue,
        totalNumberedPages,
        format: options.format,
        customTemplate: options.customTemplate,
        prefix: options.prefix,
        suffix: options.suffix,
      });

      generatedLabels.push({ pageNumber: pageIdx + 1, label });

      const coords = resolvePresetPositionCoordinates({
        position,
        pageBox: cropBox,
        itemWidth: 0,
        itemHeight: fontSize,
        marginPt,
      });

      const drawNumRes = await drawTextWithUnicodeFallback({
        doc,
        page,
        font,
        text: label,
        x: coords.x,
        y: coords.y,
        fontSize,
        color,
        opacity,
        rotationDegrees: 0,
        align: coords.align,
      });
      if (drawNumRes.usedUnicodeFallback) usedUnicodeFallback = true;

      // Optional header text
      if (typeof options.headerText === 'string' && options.headerText.trim().length > 0) {
        const headerPos: PageNumberPositionPreset =
          position === 'top-center' ? 'top-left' : 'top-center';
        const headerCoords = resolvePresetPositionCoordinates({
          position: headerPos,
          pageBox: cropBox,
          itemWidth: 0,
          itemHeight: fontSize,
          marginPt,
        });
        const hdrRes = await drawTextWithUnicodeFallback({
          doc,
          page,
          font,
          text: options.headerText.trim(),
          x: headerCoords.x,
          y: headerCoords.y,
          fontSize,
          color,
          opacity,
          rotationDegrees: 0,
          align: headerCoords.align,
        });
        if (hdrRes.usedUnicodeFallback) usedUnicodeFallback = true;
      }

      // Optional footer text
      if (typeof options.footerText === 'string' && options.footerText.trim().length > 0) {
        const footerPos: PageNumberPositionPreset =
          position === 'bottom-center' ? 'bottom-left' : 'bottom-center';
        const footerCoords = resolvePresetPositionCoordinates({
          position: footerPos,
          pageBox: cropBox,
          itemWidth: 0,
          itemHeight: fontSize,
          marginPt,
        });
        const ftrRes = await drawTextWithUnicodeFallback({
          doc,
          page,
          font,
          text: options.footerText.trim(),
          x: footerCoords.x,
          y: footerCoords.y,
          fontSize,
          color,
          opacity,
          rotationDegrees: 0,
          align: footerCoords.align,
        });
        if (ftrRes.usedUnicodeFallback) usedUnicodeFallback = true;
      }

      // Optional simultaneous watermark (for pdf-page-numbering-header-watermark-tool)
      if (options.watermark && typeof options.watermark.text === 'string' && options.watermark.text.trim().length > 0) {
        const wmText = options.watermark.text.trim();
        const wmFontSize = Number(options.watermark.fontSize) || 44;
        const wmOpacity = Number(options.watermark.opacity) || 0.22;
        const wmRot = options.watermark.rotationDegrees !== undefined ? Number(options.watermark.rotationDegrees) : 45;
        const wmColor = parsePdfColorInput(options.watermark.color, { r: 0.7, g: 0.1, b: 0.1 });
        const estWidth = isTextEncodableByFont(wmText, boldFont)
          ? boldFont.widthOfTextAtSize(wmText, wmFontSize)
          : Array.from(wmText).length * wmFontSize * 0.7;

        const wmCoords = resolvePresetPositionCoordinates({
          position: options.watermark.position || 'diagonal',
          pageBox: cropBox,
          itemWidth: estWidth,
          itemHeight: wmFontSize,
        });

        const wmRes = await drawTextWithUnicodeFallback({
          doc,
          page,
          font: boldFont,
          text: wmText,
          x: wmCoords.x,
          y: wmCoords.y,
          fontSize: wmFontSize,
          color: wmColor,
          opacity: wmOpacity,
          rotationDegrees: wmRot,
          align: wmCoords.align,
        });
        if (wmRes.usedUnicodeFallback) usedUnicodeFallback = true;
      }
    }

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
    const outputFileName = options.outputFileName || `${baseName}_numbered.pdf`;

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
      summary: `Added page numbers to ${parsedSelection.pageIndices.length} page(s) (${parsedSelection.normalizedExpression}) of "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: usedUnicodeFallback
        ? ['Non-WinAnsi Unicode text was rendered via transparent PNG stamp fallback.']
        : [],
      details: {
        numberedPageNumbers: parsedSelection.pageNumbers,
        startNumber,
        position,
        generatedLabels,
        usedUnicodeFallback,
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
 * C. TEXT INSERTION (`pdf-add-text`)
 * ============================================================================
 */
export async function addTextToPdfV2(
  input: PdfDocumentInput,
  options: PdfTextInsertionOptions & { canonicalId?: string }
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options?.canonicalId || 'pdf-add-text';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for text insertion.'),
      startTime,
      0
    );
  }

  if (!options || typeof options.text !== 'string' || options.text.trim().length === 0) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_WATERMARK_CONTENT', 'Inserted text content cannot be empty.'),
      startTime,
      inputBytes
    );
  }

  const rawX = Number(options.x);
  const rawY = Number(options.y);
  if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Text coordinates (x, y) must be finite numbers; received (${String(options.x)}, ${String(options.y)}).`
      ),
      startTime,
      inputBytes
    );
  }

  const fontSize = options.fontSize !== undefined ? Number(options.fontSize) : 14;
  if (!Number.isFinite(fontSize) || fontSize < 2 || fontSize > 300) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Font size must be between 2pt and 300pt; received ${String(options.fontSize)}.`
      ),
      startTime,
      inputBytes
    );
  }

  const opacity = options.opacity !== undefined ? Number(options.opacity) : 1.0;
  if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Text opacity must be in (0, 1]; received ${String(options.opacity)}.`
      ),
      startTime,
      inputBytes
    );
  }

  const rotationDegrees = options.rotationDegrees !== undefined ? Number(options.rotationDegrees) : 0;
  if (!Number.isFinite(rotationDegrees) || rotationDegrees < -360 || rotationDegrees > 360) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Text rotation angle must be between -360° and 360°; received ${String(options.rotationDegrees)}.`
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

    const parsedSelection = resolvePdfPageSelection(
      options.selection ?? input.pageSelection,
      totalPages,
      {
        defaultToAll: true,
        allowDuplicates: false,
        pageOrientations: orientations,
      }
    );

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const fontEnum =
      options.fontFamily === 'HelveticaBold'
        ? StandardFonts.HelveticaBold
        : options.fontFamily === 'TimesRoman'
        ? StandardFonts.TimesRoman
        : options.fontFamily === 'Courier'
        ? StandardFonts.Courier
        : StandardFonts.Helvetica;

    const font = await doc.embedFont(fontEnum);
    const color = parsePdfColorInput(options.color, { r: 0, g: 0, b: 0 });
    const strictBounds = options.strictBoundsCheck !== false;
    const origin = options.coordinateOrigin || 'bottom-left';
    let usedUnicodeFallback = false;

    for (const pageIdx of parsedSelection.pageIndices) {
      const page = doc.getPage(pageIdx);
      const cropBox = page.getCropBox();

      if (strictBounds) {
        if (rawX < 0 || rawX > cropBox.width || rawY < 0 || rawY > cropBox.height) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_DIMENSIONS',
              `Text coordinates (${rawX}, ${rawY}) fall outside page #${pageIdx + 1} bounds (${cropBox.width}pt × ${cropBox.height}pt).`,
              { x: rawX, y: rawY, pageWidth: cropBox.width, pageHeight: cropBox.height }
            ),
            startTime,
            inputBytes,
            warnings
          );
        }
      }

      const targetX = cropBox.x + rawX;
      const targetY =
        origin === 'top-left'
          ? cropBox.y + cropBox.height - rawY - fontSize
          : cropBox.y + rawY;

      const drawRes = await drawTextWithUnicodeFallback({
        doc,
        page,
        font,
        text: options.text,
        x: targetX,
        y: targetY,
        fontSize,
        color,
        opacity,
        rotationDegrees,
        align: options.align || 'left',
        forceUnicodeCanvasFallback: options.forceUnicodeCanvasFallback,
      });

      if (drawRes.usedUnicodeFallback) {
        usedUnicodeFallback = true;
      }
    }

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
    const outputFileName = options.outputFileName || `${baseName}_text_added.pdf`;

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
      summary: `Inserted text on ${parsedSelection.pageIndices.length} page(s) (${parsedSelection.normalizedExpression}) of "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: usedUnicodeFallback
        ? ['Non-WinAnsi Unicode text was rendered via transparent PNG stamp fallback.']
        : [],
      details: {
        modifiedPageNumbers: parsedSelection.pageNumbers,
        x: rawX,
        y: rawY,
        coordinateOrigin: origin,
        fontSize,
        align: options.align || 'left',
        usedUnicodeFallback,
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
 * Maps visual crop margins (top, right, bottom, left as seen by a user viewing a rotated page)
 * into unrotated PDF MediaBox coordinate insets.
 */
function mapVisualMarginsToUnrotatedSpace(
  visual: Required<PdfCropMargins>,
  rotationAngle: number
): Required<PdfCropMargins> {
  const norm = ((rotationAngle % 360) + 360) % 360;
  // In @cantoo/pdf-lib / PDF spec, /Rotate is clockwise degrees (0, 90, 180, 270)
  if (norm === 90) {
    // When page is rotated 90° CW:
    // Visual Top -> Unrotated Left
    // Visual Right -> Unrotated Top
    // Visual Bottom -> Unrotated Right
    // Visual Left -> Unrotated Bottom
    return {
      left: visual.top,
      top: visual.right,
      right: visual.bottom,
      bottom: visual.left,
    };
  }
  if (norm === 180) {
    return {
      top: visual.bottom,
      right: visual.left,
      bottom: visual.top,
      left: visual.right,
    };
  }
  if (norm === 270) {
    return {
      right: visual.top,
      bottom: visual.right,
      left: visual.bottom,
      top: visual.left,
    };
  }
  return visual;
}

/**
 * ============================================================================
 * D. CROP PAGES (`pdf-crop-pages`, alias `pdf-crop`)
 * ============================================================================
 */
export async function cropPdfPagesV2(
  input: PdfDocumentInput,
  options: PdfCropPagesOptions & { canonicalId?: string } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-crop-pages';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for cropping.'),
      startTime,
      0
    );
  }

  if (!options.margins && !options.cropBox) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_CROP_BOUNDS',
        'Either crop margins (top, right, bottom, left) or an explicit cropBox (x, y, width, height) must be provided.'
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

    const parsedSelection = resolvePdfPageSelection(
      options.selection ?? input.pageSelection,
      totalPages,
      {
        defaultToAll: true,
        allowDuplicates: false,
        pageOrientations: orientations,
      }
    );

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const syncMediaBox = options.synchronizeMediaBox !== false;
    const appliedBoxes: Array<{
      pageNumber: number;
      rotation: number;
      cropBox: PdfCropBoxRect;
    }> = [];

    for (const pageIdx of parsedSelection.pageIndices) {
      const page = doc.getPage(pageIdx);
      const baseBox = page.getCropBox();
      const rot = ((page.getRotation().angle % 360) + 360) % 360;

      let targetX: number;
      let targetY: number;
      let targetW: number;
      let targetH: number;

      if (options.cropBox) {
        const cb = options.cropBox;
        const cx = Number(cb.x);
        const cy = Number(cb.y);
        const cw = Number(cb.width);
        const ch = Number(cb.height);

        if (
          !Number.isFinite(cx) ||
          !Number.isFinite(cy) ||
          !Number.isFinite(cw) ||
          !Number.isFinite(ch) ||
          cw < 10 ||
          ch < 10
        ) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_CROP_BOUNDS',
              `CropBox width and height must be at least 10pt × 10pt; received (${cw} × ${ch}).`,
              { cropBox: cb }
            ),
            startTime,
            inputBytes,
            warnings
          );
        }

        if (
          cx < baseBox.x - 0.01 ||
          cy < baseBox.y - 0.01 ||
          cx + cw > baseBox.x + baseBox.width + 0.01 ||
          cy + ch > baseBox.y + baseBox.height + 0.01
        ) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_CROP_BOUNDS',
              `CropBox (${cx}, ${cy}, ${cw}×${ch}) exceeds page #${pageIdx + 1} bounds (${baseBox.x}, ${baseBox.y}, ${baseBox.width}×${baseBox.height}).`,
              { cropBox: cb, pageBounds: baseBox }
            ),
            startTime,
            inputBytes,
            warnings
          );
        }

        targetX = cx;
        targetY = cy;
        targetW = cw;
        targetH = ch;
      } else {
        const m = options.margins!;
        const top = m.top !== undefined ? Number(m.top) : 0;
        const right = m.right !== undefined ? Number(m.right) : 0;
        const bottom = m.bottom !== undefined ? Number(m.bottom) : 0;
        const left = m.left !== undefined ? Number(m.left) : 0;

        if (
          !Number.isFinite(top) ||
          !Number.isFinite(right) ||
          !Number.isFinite(bottom) ||
          !Number.isFinite(left) ||
          top < 0 ||
          right < 0 ||
          bottom < 0 ||
          left < 0
        ) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_CROP_BOUNDS',
              'Crop margins must be non-negative finite numbers.',
              { margins: m }
            ),
            startTime,
            inputBytes,
            warnings
          );
        }

        const mapped = mapVisualMarginsToUnrotatedSpace(
          { top, right, bottom, left },
          rot
        );

        targetX = baseBox.x + mapped.left;
        targetY = baseBox.y + mapped.bottom;
        targetW = baseBox.width - mapped.left - mapped.right;
        targetH = baseBox.height - mapped.top - mapped.bottom;

        if (targetW < 10 || targetH < 10) {
          return buildErrorResult(
            canonicalId,
            createPdfProcessingError(
              'ERR_INVALID_CROP_BOUNDS',
              `Crop margins leave an invalid or zero-area visible box (${Math.round(targetW)}pt × ${Math.round(targetH)}pt) on page #${pageIdx + 1}. Remaining visible area must be at least 10pt × 10pt.`,
              { margins: m, remainingWidth: targetW, remainingHeight: targetH }
            ),
            startTime,
            inputBytes,
            warnings
          );
        }
      }

      page.setCropBox(targetX, targetY, targetW, targetH);
      if (syncMediaBox) {
        page.setMediaBox(targetX, targetY, targetW, targetH);
      }

      appliedBoxes.push({
        pageNumber: pageIdx + 1,
        rotation: rot,
        cropBox: {
          x: Math.round(targetX * 100) / 100,
          y: Math.round(targetY * 100) / 100,
          width: Math.round(targetW * 100) / 100,
          height: Math.round(targetH * 100) / 100,
        },
      });
    }

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
    const outputFileName = options.outputFileName || `${baseName}_cropped.pdf`;

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
      summary: `Cropped ${parsedSelection.pageIndices.length} page(s) (${parsedSelection.normalizedExpression}) of "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      warnings,
      limitations: [
        'Cropping adjusts the page CropBox/MediaBox viewport and does not destructively erase vector paths outside the boundary.',
      ],
      details: {
        croppedPageNumbers: parsedSelection.pageNumbers,
        appliedBoxes,
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
 * Converts a dimension in 'pt' | 'mm' | 'in' to PDF points (1/72 inch).
 */
function convertDimensionToPoints(value: number, unit: 'pt' | 'mm' | 'in' = 'pt'): number {
  if (unit === 'in') return value * 72;
  if (unit === 'mm') return (value * 72) / 25.4;
  return value;
}

/**
 * ============================================================================
 * E. PAGE RESIZING (`pdf-page-resizer`)
 * ============================================================================
 */
export async function resizePdfPagesV2(
  input: PdfDocumentInput,
  options: PdfResizePagesOptions & { canonicalId?: string } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-page-resizer';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for page resizing.'),
      startTime,
      0
    );
  }

  const preset = options.preset || (options.width || options.height ? 'Custom' : 'A4');
  const unit = options.unit || 'pt';

  let targetWidthPt: number;
  let targetHeightPt: number;

  if (preset !== 'Custom') {
    const entry = STANDARD_PDF_PAGE_SIZES_PT[preset];
    if (!entry) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_INVALID_DIMENSIONS',
          `Unknown page size preset: "${String(preset)}".`
        ),
        startTime,
        inputBytes
      );
    }
    targetWidthPt = entry.widthPt;
    targetHeightPt = entry.heightPt;
  } else {
    const rawW = Number(options.width);
    const rawH = Number(options.height);
    if (!Number.isFinite(rawW) || !Number.isFinite(rawH) || rawW <= 0 || rawH <= 0) {
      return buildErrorResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_INVALID_DIMENSIONS',
          `Custom page dimensions must be positive numbers; received (${String(options.width)} × ${String(options.height)}).`
        ),
        startTime,
        inputBytes
      );
    }
    targetWidthPt = convertDimensionToPoints(rawW, unit);
    targetHeightPt = convertDimensionToPoints(rawH, unit);
  }

  if (options.orientation === 'landscape' && targetWidthPt < targetHeightPt) {
    const tmp = targetWidthPt;
    targetWidthPt = targetHeightPt;
    targetHeightPt = tmp;
  } else if (options.orientation === 'portrait' && preset !== 'Custom' && targetWidthPt > targetHeightPt) {
    const tmp = targetWidthPt;
    targetWidthPt = targetHeightPt;
    targetHeightPt = tmp;
  }

  if (targetWidthPt < 10 || targetHeightPt < 10 || targetWidthPt > 14400 || targetHeightPt > 14400) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_INVALID_DIMENSIONS',
        `Target page dimensions (${Math.round(targetWidthPt)}pt × ${Math.round(targetHeightPt)}pt) must be between 10pt and 14400pt.`,
        { targetWidthPt, targetHeightPt }
      ),
      startTime,
      inputBytes
    );
  }

  const fitMode = options.fitMode || 'contain-center';

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

    const parsedSelection = resolvePdfPageSelection(
      options.selection ?? input.pageSelection,
      totalPages,
      {
        defaultToAll: true,
        allowDuplicates: false,
        pageOrientations: orientations,
      }
    );

    if (!parsedSelection.isValid || parsedSelection.error) {
      return buildErrorResult(
        canonicalId,
        parsedSelection.error || createPdfProcessingError('ERR_INVALID_PAGE_RANGE'),
        startTime,
        inputBytes,
        warnings
      );
    }

    const resizedPagesInfo: Array<{
      pageNumber: number;
      previousSize: { widthPt: number; heightPt: number };
      newSize: { widthPt: number; heightPt: number };
      scaleX: number;
      scaleY: number;
      offsetX: number;
      offsetY: number;
    }> = [];

    for (const pageIdx of parsedSelection.pageIndices) {
      const page = doc.getPage(pageIdx);
      const srcBox = page.getMediaBox();
      const srcW = srcBox.width;
      const srcH = srcBox.height;

      let pageTargetW = targetWidthPt;
      let pageTargetH = targetHeightPt;
      if (options.orientation === 'auto') {
        const srcIsLandscape = srcW > srcH;
        const dstIsLandscape = pageTargetW > pageTargetH;
        if (srcIsLandscape !== dstIsLandscape) {
          const tmp = pageTargetW;
          pageTargetW = pageTargetH;
          pageTargetH = tmp;
        }
      }

      if (fitMode === 'pad-center' && (pageTargetW < srcW - 0.01 || pageTargetH < srcH - 0.01)) {
        return buildErrorResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_INVALID_DIMENSIONS',
            `Cannot use 'pad-center' without scaling when target size (${Math.round(pageTargetW)}×${Math.round(pageTargetH)}pt) is smaller than source page #${pageIdx + 1} (${Math.round(srcW)}×${Math.round(srcH)}pt), as that would clip content. Use fitMode='contain-center' instead.`
          ),
          startTime,
          inputBytes,
          warnings
        );
      }

      let scaleX = 1;
      let scaleY = 1;
      if (fitMode === 'contain-center') {
        const uniform = Math.min(pageTargetW / srcW, pageTargetH / srcH);
        scaleX = uniform;
        scaleY = uniform;
      } else if (fitMode === 'stretch') {
        scaleX = pageTargetW / srcW;
        scaleY = pageTargetH / srcH;
      } else {
        // pad-center: 1:1 scale
        scaleX = 1;
        scaleY = 1;
      }

      const scaledContentW = srcW * scaleX;
      const scaledContentH = srcH * scaleY;
      const offsetX = (pageTargetW - scaledContentW) / 2 - srcBox.x * scaleX;
      const offsetY = (pageTargetH - scaledContentH) / 2 - srcBox.y * scaleY;

      page.setMediaBox(0, 0, pageTargetW, pageTargetH);
      page.setCropBox(0, 0, pageTargetW, pageTargetH);

      if (Math.abs(scaleX - 1) > 1e-6 || Math.abs(scaleY - 1) > 1e-6) {
        page.scaleContent(scaleX, scaleY);
        page.scaleAnnotations(scaleX, scaleY);
      }
      if (Math.abs(offsetX) > 1e-4 || Math.abs(offsetY) > 1e-4) {
        page.translateContent(offsetX, offsetY);
      }

      resizedPagesInfo.push({
        pageNumber: pageIdx + 1,
        previousSize: {
          widthPt: Math.round(srcW * 100) / 100,
          heightPt: Math.round(srcH * 100) / 100,
        },
        newSize: {
          widthPt: Math.round(pageTargetW * 100) / 100,
          heightPt: Math.round(pageTargetH * 100) / 100,
        },
        scaleX: Math.round(scaleX * 10000) / 10000,
        scaleY: Math.round(scaleY * 10000) / 10000,
        offsetX: Math.round(offsetX * 100) / 100,
        offsetY: Math.round(offsetY * 100) / 100,
      });
    }

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
    const outputFileName = options.outputFileName || `${baseName}_resized.pdf`;

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
      summary: `Resized ${parsedSelection.pageIndices.length} page(s) of "${input.fileName}" to ${Math.round(targetWidthPt * 100) / 100}pt × ${Math.round(targetHeightPt * 100) / 100}pt (${fitMode}).`,
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
        preset,
        fitMode,
        targetWidthPt: Math.round(targetWidthPt * 100) / 100,
        targetHeightPt: Math.round(targetHeightPt * 100) / 100,
        resizedPagesInfo,
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds an ISO 16684-1 compliant XMP metadata XML packet synchronized with the document's Info dictionary.
 */
export function buildSynchronizedXmpMetadataXml(meta: {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDateIso?: string;
  modificationDateIso?: string;
}): string {
  const titleXml = meta.title
    ? `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(meta.title)}</rdf:li></rdf:Alt></dc:title>`
    : '';
  const authorXml = meta.author
    ? `<dc:creator><rdf:Seq><rdf:li>${escapeXml(meta.author)}</rdf:li></rdf:Seq></dc:creator>`
    : '';
  const subjectXml = meta.subject
    ? `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(meta.subject)}</rdf:li></rdf:Alt></dc:description>`
    : '';
  const keywordsXml = meta.keywords
    ? `<pdf:Keywords>${escapeXml(meta.keywords)}</pdf:Keywords>`
    : '';
  const creatorXml = meta.creator
    ? `<xmp:CreatorTool>${escapeXml(meta.creator)}</xmp:CreatorTool>`
    : '';
  const producerXml = meta.producer
    ? `<pdf:Producer>${escapeXml(meta.producer)}</pdf:Producer>`
    : '';
  const createDateXml = meta.creationDateIso
    ? `<xmp:CreateDate>${escapeXml(meta.creationDateIso)}</xmp:CreateDate>`
    : '';
  const modDateXml = meta.modificationDateIso
    ? `<xmp:ModifyDate>${escapeXml(meta.modificationDateIso)}</xmp:ModifyDate>`
    : '';

  return [
    '<?xpacket begin="\uFEFF" id="W5M0MpDvWTNaNreSzNTczkc9d"?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '    <rdf:Description rdf:about=""',
    '      xmlns:dc="http://purl.org/dc/elements/1.1/"',
    '      xmlns:xmp="http://ns.adobe.com/xap/1.0/"',
    '      xmlns:pdf="http://ns.adobe.com/pdf/1.3/">',
    `      ${titleXml}`,
    `      ${authorXml}`,
    `      ${subjectXml}`,
    `      ${keywordsXml}`,
    `      ${creatorXml}`,
    `      ${producerXml}`,
    `      ${createDateXml}`,
    `      ${modDateXml}`,
    '    </rdf:Description>',
    '  </rdf:RDF>',
    '</x:xmpmeta>',
    '<?xpacket end="w"?>',
  ].join('\n');
}

/**
 * Attaches an uncompressed XMP `/Metadata` stream to the PDF document catalog.
 */
function attachXmpMetadataStreamToCatalog(doc: PDFDocument, xmpXml: string): void {
  const xmlBytes = new TextEncoder().encode(xmpXml);
  const stream = doc.context.stream(xmlBytes, {
    Type: 'Metadata',
    Subtype: 'XML',
    Length: xmlBytes.byteLength,
  });
  const streamRef = doc.context.register(stream);
  doc.catalog.set(PDFName.of('Metadata'), streamRef);
}

/**
 * Extracts the raw XMP `/Metadata` XML string from a loaded `PDFDocument` catalog if present.
 */
export function extractRawXmpXmlFromCatalog(doc: PDFDocument): string | undefined {
  try {
    const metaObj = doc.catalog.lookup(PDFName.of('Metadata'));
    if (!metaObj) return undefined;
    const rawBytes: Uint8Array | undefined =
      (metaObj as any).contents ??
      (typeof (metaObj as any).getContents === 'function'
        ? (metaObj as any).getContents()
        : undefined);
    if (rawBytes instanceof Uint8Array && rawBytes.byteLength > 0) {
      return new TextDecoder().decode(rawBytes);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * ============================================================================
 * F. METADATA EDITING (`pdf-metadata-editor` — both catalog registrations)
 * ============================================================================
 */
export async function editPdfMetadataV2(
  input: PdfDocumentInput,
  options: PdfMetadataEditOptions & { canonicalId?: string } = {}
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = options.canonicalId || 'pdf-metadata-editor';
  const inputBytes = inspectByteLength(input?.bytes);
  const warnings: string[] = [];

  if (!input || !input.bytes) {
    return buildErrorResult(
      canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'No input PDF file was provided for metadata editing.'),
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

    const doc = loadRes.document;
    const totalPages = doc.getPageCount();
    const beforeMeta = extractDocumentMetadataSummary(
      doc,
      loadRes.validation.pdfVersion || '1.7',
      loadRes.validation.hasEncryptDictionary
    );

    if (options.clearExistingMetadata) {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setCreator('');
      doc.setProducer('');
    }

    if (options.title !== undefined) {
      doc.setTitle(String(options.title));
    }
    if (options.author !== undefined) {
      doc.setAuthor(String(options.author));
    }
    if (options.subject !== undefined) {
      doc.setSubject(String(options.subject));
    }
    if (options.keywords !== undefined) {
      const kwArray = Array.isArray(options.keywords)
        ? options.keywords.map((k) => String(k).trim()).filter(Boolean)
        : String(options.keywords)
            .split(/[,;]/)
            .map((k) => k.trim())
            .filter(Boolean);
      doc.setKeywords(kwArray);
    }
    if (options.creator !== undefined) {
      doc.setCreator(String(options.creator));
    }
    if (options.producer !== undefined) {
      doc.setProducer(String(options.producer));
    }

    const now = new Date();
    doc.setModificationDate(now);

    const updatedSummary = extractDocumentMetadataSummary(
      doc,
      loadRes.validation.pdfVersion || '1.7',
      loadRes.validation.hasEncryptDictionary
    );

    const syncXmp = options.synchronizeXmp !== false;
    let generatedXmpXml: string | undefined;
    if (syncXmp) {
      generatedXmpXml = buildSynchronizedXmpMetadataXml({
        title: updatedSummary.title,
        author: updatedSummary.author,
        subject: updatedSummary.subject,
        keywords: updatedSummary.keywords,
        creator: updatedSummary.creator,
        producer: updatedSummary.producer,
        creationDateIso: updatedSummary.creationDate,
        modificationDateIso: now.toISOString(),
      });
      attachXmpMetadataStreamToCatalog(doc, generatedXmpXml);
    }

    const { bytes: verifiedBytes, integrity } = await serializeAndVerifyPdfV2(
      doc,
      { useObjectStreams: false },
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

    // Re-open the saved bytes to perform post-save metadata inspection
    const reloadRes = await loadPdfDocumentV2(
      { fileName: 'reloaded_check.pdf', bytes: verifiedBytes },
      { password: input.password }
    );
    let postSaveMetadata: PdfDocumentMetadataSummary = updatedSummary;
    let postSaveXmpXml: string | undefined;
    try {
      if (reloadRes.success && reloadRes.document) {
        postSaveMetadata =
          reloadRes.metadata ||
          extractDocumentMetadataSummary(reloadRes.document);
        postSaveXmpXml = extractRawXmpXmlFromCatalog(reloadRes.document);
      }
    } finally {
      await reloadRes.dispose();
    }

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'Title', value: postSaveMetadata.title ?? '' },
        { label: 'Author', value: postSaveMetadata.author ?? '' },
        { label: 'Subject', value: postSaveMetadata.subject ?? '' },
        { label: 'Keywords', value: postSaveMetadata.keywords ?? '' },
        { label: 'Creator', value: postSaveMetadata.creator ?? '' },
        { label: 'Producer', value: postSaveMetadata.producer ?? '' },
        { label: 'XMP Synchronized', value: Boolean(postSaveXmpXml) ? 'Yes' : 'No' },
      ],
      tableHeaders: ['Field', 'Previous Value', 'Verified Saved Value'],
      tableRows: [
        ['Title', beforeMeta.title ?? '(unset)', postSaveMetadata.title ?? '(unset)'],
        ['Author', beforeMeta.author ?? '(unset)', postSaveMetadata.author ?? '(unset)'],
        ['Subject', beforeMeta.subject ?? '(unset)', postSaveMetadata.subject ?? '(unset)'],
        ['Keywords', beforeMeta.keywords ?? '(unset)', postSaveMetadata.keywords ?? '(unset)'],
        ['Creator', beforeMeta.creator ?? '(unset)', postSaveMetadata.creator ?? '(unset)'],
        ['Producer', beforeMeta.producer ?? '(unset)', postSaveMetadata.producer ?? '(unset)'],
      ],
      rawData: {
        beforeMetadata: beforeMeta,
        verifiedMetadata: postSaveMetadata,
        xmpSynchronized: Boolean(postSaveXmpXml),
        xmpXml: postSaveXmpXml,
      },
    };

    const baseName = stripPdfExtension(input.fileName, 'document');
    const outputFileName = options.outputFileName || `${baseName}_metadata_updated.pdf`;

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
      summary: `Updated PDF metadata (InfoDict${syncXmp ? ' + XMP stream' : ''}) and verified persistence on "${input.fileName}".`,
      metrics: {
        inputBytes,
        outputBytes: verifiedBytes.byteLength,
        inputPageCount: totalPages,
        outputPageCount: totalPages,
        durationMs: Math.round((performance.now() - startTime) * 100) / 100,
      },
      inspectionReport,
      warnings,
      limitations: [],
      details: {
        beforeMetadata: beforeMeta,
        verifiedMetadata: postSaveMetadata,
        xmpSynchronized: Boolean(postSaveXmpXml),
        xmpXml: postSaveXmpXml,
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
 * CANONICAL EDITING & GEOMETRY ROUTER (`executeEditingGeometryOperationV2`)
 * ============================================================================
 * Routes all 7 unique Editing & Geometry canonical IDs (8 catalog registrations
 * including both `pdf-metadata-editor` entries) and approved aliases (`pdf-watermark`, `pdf-crop`):
 * - `pdf-add-watermark` (alias `pdf-watermark`)
 * - `pdf-add-page-numbers`
 * - `pdf-page-numbering-header-watermark-tool`
 * - `pdf-add-text`
 * - `pdf-crop-pages` (alias `pdf-crop`)
 * - `pdf-page-resizer`
 * - `pdf-metadata-editor`
 *
 * Strictly rejects any non-editing-geometry or unknown tool ID with
 * `ERR_UNSUPPORTED_OPERATION`. Never silently defaults to another operation.
 */
export async function executeEditingGeometryOperationV2(
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
  if (cap.module !== 'editing-geometry') {
    return buildErrorResult(
      cap.canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by the Editing & Geometry Engine.`,
        { canonicalId: cap.canonicalId, module: cap.module }
      ),
      startTime
    );
  }

  const inputs = Array.isArray(request.inputs) ? request.inputs : [];
  const primaryInput = inputs[0];
  const opts = (request.options || {}) as Record<string, any>;

  switch (cap.canonicalId) {
    case 'pdf-add-watermark':
      return addWatermarkToPdfV2(primaryInput, {
        canonicalId: 'pdf-add-watermark',
        text: opts.text ?? opts.watermarkText,
        watermarkImageBytes: opts.watermarkImageBytes ?? request.secondaryInputs?.[0]?.bytes,
        watermarkImageMimeType: opts.watermarkImageMimeType ?? request.secondaryInputs?.[0]?.mimeType,
        fontSize: opts.fontSize,
        opacity: opts.opacity,
        rotationDegrees: opts.rotationDegrees ?? opts.angleDegrees ?? opts.rotation,
        color: opts.color,
        position: opts.position,
        x: opts.x,
        y: opts.y,
        imageScale: opts.imageScale ?? opts.scale,
        imageWidthPt: opts.imageWidthPt,
        imageHeightPt: opts.imageHeightPt,
        selection: opts.selection ?? request.pageSelection,
        forceUnicodeCanvasFallback: opts.forceUnicodeCanvasFallback,
        outputFileName: opts.outputFileName,
        secondaryInputs: request.secondaryInputs,
      });

    case 'pdf-add-page-numbers':
      return addPageNumbersToPdfV2(primaryInput, {
        canonicalId: 'pdf-add-page-numbers',
        startNumber: opts.startNumber,
        format: opts.format,
        customTemplate: opts.customTemplate,
        prefix: opts.prefix,
        suffix: opts.suffix,
        position: opts.position,
        marginPt: opts.marginPt,
        fontSize: opts.fontSize,
        color: opts.color,
        opacity: opts.opacity,
        headerText: opts.headerText,
        footerText: opts.footerText,
        selection: opts.selection ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-page-numbering-header-watermark-tool':
      return addPageNumbersToPdfV2(primaryInput, {
        canonicalId: 'pdf-page-numbering-header-watermark-tool',
        startNumber: opts.startNumber,
        format: opts.format,
        customTemplate: opts.customTemplate,
        prefix: opts.prefix,
        suffix: opts.suffix,
        position: opts.position,
        marginPt: opts.marginPt,
        fontSize: opts.fontSize,
        color: opts.color,
        opacity: opts.opacity,
        headerText: opts.headerText,
        footerText: opts.footerText,
        watermark:
          opts.watermark ??
          (opts.watermarkText
            ? {
                text: opts.watermarkText,
                opacity: opts.watermarkOpacity,
                rotationDegrees: opts.watermarkRotation,
                color: opts.watermarkColor,
                fontSize: opts.watermarkFontSize,
              }
            : undefined),
        selection: opts.selection ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-add-text':
      return addTextToPdfV2(primaryInput, {
        canonicalId: 'pdf-add-text',
        text: opts.text,
        x: opts.x,
        y: opts.y,
        coordinateOrigin: opts.coordinateOrigin,
        fontSize: opts.fontSize,
        color: opts.color,
        opacity: opts.opacity,
        align: opts.align,
        rotationDegrees: opts.rotationDegrees ?? opts.rotation,
        fontFamily: opts.fontFamily,
        strictBoundsCheck: opts.strictBoundsCheck,
        forceUnicodeCanvasFallback: opts.forceUnicodeCanvasFallback,
        selection: opts.selection ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-crop-pages':
      return cropPdfPagesV2(primaryInput, {
        canonicalId: 'pdf-crop-pages',
        margins:
          opts.margins ??
          (opts.top !== undefined ||
          opts.right !== undefined ||
          opts.bottom !== undefined ||
          opts.left !== undefined
            ? {
                top: opts.top,
                right: opts.right,
                bottom: opts.bottom,
                left: opts.left,
              }
            : undefined),
        cropBox: opts.cropBox,
        synchronizeMediaBox: opts.synchronizeMediaBox,
        selection: opts.selection ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-page-resizer':
      return resizePdfPagesV2(primaryInput, {
        canonicalId: 'pdf-page-resizer',
        preset: opts.preset ?? opts.pageSize,
        width: opts.width,
        height: opts.height,
        unit: opts.unit,
        orientation: opts.orientation,
        fitMode: opts.fitMode,
        selection: opts.selection ?? request.pageSelection,
        outputFileName: opts.outputFileName,
      });

    case 'pdf-metadata-editor':
      return editPdfMetadataV2(primaryInput, {
        canonicalId: 'pdf-metadata-editor',
        title: opts.title,
        author: opts.author,
        subject: opts.subject,
        keywords: opts.keywords,
        creator: opts.creator,
        producer: opts.producer,
        clearExistingMetadata: opts.clearExistingMetadata,
        synchronizeXmp: opts.synchronizeXmp,
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
