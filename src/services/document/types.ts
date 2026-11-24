export type DocumentConverterId =
  // Group 1: PDF to Office
  | 'pdf-to-word-docx'
  | 'pdf-to-excel-xlsx'
  | 'pdf-to-powerpoint-pptx'
  | 'pdf-to-csv-converter'
  // Group 2: Office to PDF
  | 'word-to-pdf-converter'
  | 'excel-to-pdf-converter'
  | 'powerpoint-to-pdf-converter'
  | 'txt-to-pdf-converter'
  // Group 3: Text & Web to PDF
  | 'html-to-pdf-converter'
  | 'csv-to-pdf-converter'
  | 'rtf-to-pdf-converter'
  | 'odt-to-pdf-converter'
  // Group 4: Office Format Converters
  | 'ods-to-pdf-converter'
  | 'odp-to-pdf-converter'
  | 'docx-to-html-converter'
  | 'xlsx-to-csv-converter'
  // Group 5: Advanced Document Converters
  | 'xlsx-to-json-converter'
  | 'pptx-to-images-converter'
  | 'pdf-to-html-converter'
  | 'pdf-to-markdown-converter';

export type PageSizePreset = 'A4' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'narrow' | 'normal' | 'wide';

export interface ConversionOptions {
  pageSize?: PageSizePreset;
  orientation?: PageOrientation;
  margins?: MarginPreset;
  fontSize?: number;
  enableOcrFallback?: boolean;
  ocrLanguage?: string;
  pptxMode?: 'editable' | 'images';
  imageFormat?: 'png' | 'jpeg';
  imageQuality?: number;
  csvDelimiter?: ',' | ';' | '\t';
  selectedSheet?: string; // '__ALL__' or specific sheet name
  jsonPretty?: boolean;
  includePageHeaders?: boolean;
}

export interface PreviewImageItem {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ConversionOutput {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  previewText?: string;
  previewHtml?: string;
  previewTable?: string[][];
  previewImages?: PreviewImageItem[];
  summary: string;
  warnings: string[];
  limitations: string[];
  stats: {
    inputSizeBytes: number;
    outputSizeBytes: number;
    pageCount?: number;
    sheetCount?: number;
    slideCount?: number;
    rowCount?: number;
    usedOcr?: boolean;
    conversionTimeMs: number;
  };
}

export type ProgressCallback = (progressPct: number, statusMessage: string) => void;

export type StructuredBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string; bold?: boolean; italic?: boolean }
  | { type: 'list-item'; text: string; ordered?: boolean; index?: number }
  | { type: 'code'; text: string }
  | { type: 'table'; rows: string[][]; hasHeader?: boolean }
  | { type: 'page-break' }
  | { type: 'slide'; slideNumber: number; title: string; bodyItems: string[]; tables: string[][][]; notes?: string; images?: Uint8Array[] };

export interface ExtractedPdfLine {
  y: number;
  minX: number;
  maxFontSize: number;
  text: string;
  cells: Array<{ x: number; text: string }>;
}

export interface ExtractedPdfPage {
  pageNumber: number;
  width: number;
  height: number;
  rawText: string;
  lines: ExtractedPdfLine[];
  blocks: StructuredBlock[];
  tableRows: string[][];
  usedOcr: boolean;
}
