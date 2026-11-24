import { CalculatorMeta, SubcategoryMeta } from '../../types.ts';

export const PHASE27_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'p27-sub-pdf-to-office',
    categoryId: 'document-converters',
    name: 'PDF to Office Converters',
    slug: 'pdf-to-office',
    description: 'Convert PDF documents into editable Word (DOCX), Excel (XLSX), PowerPoint (PPTX), and CSV spreadsheets',
    sortOrder: 270
  },
  {
    id: 'p27-sub-office-to-pdf',
    categoryId: 'document-converters',
    name: 'Office & Text to PDF Converters',
    slug: 'office-to-pdf',
    description: 'Convert Word (DOCX), Excel (XLSX), PowerPoint (PPTX), and plain text (TXT) documents into formatted PDFs',
    sortOrder: 271
  },
  {
    id: 'p27-sub-web-text-to-pdf',
    categoryId: 'document-converters',
    name: 'Web, Data & Rich Text to PDF',
    slug: 'web-text-to-pdf',
    description: 'Convert HTML web documents, CSV datasets, RTF rich text, and OpenDocument ODT files into paginated PDFs',
    sortOrder: 272
  },
  {
    id: 'p27-sub-office-formats',
    categoryId: 'document-converters',
    name: 'OpenDocument & Office Format Converters',
    slug: 'office-format-converters',
    description: 'Convert ODS spreadsheets and ODP presentations to PDF, DOCX to semantic HTML, and XLSX to CSV',
    sortOrder: 273
  },
  {
    id: 'p27-sub-advanced-conv',
    categoryId: 'document-converters',
    name: 'Advanced Document & Markup Converters',
    slug: 'advanced-document-converters',
    description: 'Export XLSX workbooks to JSON, render PPTX slides to PNG/JPG images, and convert PDFs to HTML or Markdown',
    sortOrder: 274
  }
];

export const PHASE27_METADATA: CalculatorMeta[] = [
  // --- GROUP 1: PDF TO OFFICE (4 tools) ---
  {
    id: 'pdf-to-word-docx',
    name: 'PDF to Word (DOCX) Converter',
    shortDesc: 'Convert PDF documents into editable Microsoft Word (.docx) files with headings, paragraphs, tables, and optional OCR',
    category: 'document-converters',
    subcategoryId: 'p27-sub-pdf-to-office',
    tags: ['document', 'converter', 'pdf', 'word', 'docx', 'office', 'ocr'],
    formula: 'PDF text & table extraction with OpenXML DOCX generation',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'pdf-to-excel-xlsx',
    name: 'PDF to Excel (XLSX) Converter',
    shortDesc: 'Extract PDF tables and aligned columns into multi-sheet Microsoft Excel (.xlsx) workbooks with distinct spreadsheet cells',
    category: 'document-converters',
    subcategoryId: 'p27-sub-pdf-to-office',
    tags: ['document', 'converter', 'pdf', 'excel', 'xlsx', 'spreadsheet', 'table'],
    formula: 'PDF X/Y coordinate clustering to multi-cell XLSX worksheets',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'pdf-to-powerpoint-pptx',
    name: 'PDF to PowerPoint (PPTX) Converter',
    shortDesc: 'Convert PDF pages into PowerPoint (.pptx) presentations via editable text/table reconstruction or high-res slide images',
    category: 'document-converters',
    subcategoryId: 'p27-sub-pdf-to-office',
    tags: ['document', 'converter', 'pdf', 'powerpoint', 'pptx', 'slides'],
    formula: 'PDF page reconstruction or canvas image embedding to PPTX',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'pdf-to-csv-converter',
    name: 'PDF to CSV Converter',
    shortDesc: 'Extract structured rows and columns from PDF documents into RFC 4180 CSV datasets locally in your browser',
    category: 'document-converters',
    subcategoryId: 'p27-sub-pdf-to-office',
    tags: ['document', 'converter', 'pdf', 'csv', 'table', 'data'],
    formula: 'PDF row/column clustering to delimited CSV output',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },

  // --- GROUP 2: OFFICE TO PDF (4 tools) ---
  {
    id: 'word-to-pdf-converter',
    name: 'Word (DOCX) to PDF Converter',
    shortDesc: 'Convert Microsoft Word (.docx) documents into formatted, paginated PDF files with custom page size, orientation, and margins',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-to-pdf',
    tags: ['document', 'converter', 'word', 'docx', 'pdf', 'office'],
    formula: 'DOCX OpenXML parsing via Mammoth to multi-page PDF layout',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'excel-to-pdf-converter',
    name: 'Excel (XLSX) to PDF Converter',
    shortDesc: 'Convert single or multi-sheet Excel (.xlsx, .xls) workbooks into cleanly bordered, paginated PDF tables',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-to-pdf',
    tags: ['document', 'converter', 'excel', 'xlsx', 'pdf', 'spreadsheet'],
    formula: 'SheetJS workbook extraction to multi-page PDF grid rendering',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'powerpoint-to-pdf-converter',
    name: 'PowerPoint (PPTX) to PDF Converter',
    shortDesc: 'Convert PowerPoint (.pptx) presentations into slide-by-slide PDF handouts preserving titles, bullets, tables, and notes',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-to-pdf',
    tags: ['document', 'converter', 'powerpoint', 'pptx', 'pdf', 'slides'],
    formula: 'PPTX XML slide & notes extraction to paginated PDF slides',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'txt-to-pdf-converter',
    name: 'Plain Text (TXT) to PDF Converter',
    shortDesc: 'Convert plain text (.txt, .log, .md) files with Unicode support into clean, wrapped, multi-page PDF documents',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-to-pdf',
    tags: ['document', 'converter', 'txt', 'text', 'pdf'],
    formula: 'UTF-8 line wrapping and multi-page PDF typesetting',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#475569',
    iconBg: '#F1F5F9'
  },

  // --- GROUP 3: TEXT & WEB TO PDF (4 tools) ---
  {
    id: 'html-to-pdf-converter',
    name: 'HTML to PDF Converter',
    shortDesc: 'Convert HTML web pages and markup (.html, .htm) into structured, multi-page PDF documents preserving headings, lists, and tables',
    category: 'document-converters',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    tags: ['document', 'converter', 'html', 'web', 'pdf'],
    formula: 'Semantic HTML tag parsing to multi-page PDF document',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'csv-to-pdf-converter',
    name: 'CSV to PDF Converter',
    shortDesc: 'Convert CSV tabular datasets (.csv, .tsv) into clean, bordered, multi-page PDF tables with repeating column headers',
    category: 'document-converters',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    tags: ['document', 'converter', 'csv', 'table', 'pdf'],
    formula: 'RFC 4180 CSV grid parsing to paginated PDF table layout',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'rtf-to-pdf-converter',
    name: 'RTF to PDF Converter',
    shortDesc: 'Convert Rich Text Format (.rtf) documents into clean, paginated PDF files with Unicode and escape decoding',
    category: 'document-converters',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    tags: ['document', 'converter', 'rtf', 'rich-text', 'pdf'],
    formula: 'RTF control-word tokenization to structured PDF rendering',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF'
  },
  {
    id: 'odt-to-pdf-converter',
    name: 'ODT to PDF Converter',
    shortDesc: 'Convert OpenDocument Text (.odt) files from LibreOffice and OpenOffice into formatted multi-page PDFs',
    category: 'document-converters',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    tags: ['document', 'converter', 'odt', 'opendocument', 'libreoffice', 'pdf'],
    formula: 'ODF content.xml parsing to paginated PDF layout',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // --- GROUP 4: OFFICE FORMAT CONVERTERS (4 tools) ---
  {
    id: 'ods-to-pdf-converter',
    name: 'ODS to PDF Converter',
    shortDesc: 'Convert OpenDocument Spreadsheets (.ods) with multiple sheets into cleanly formatted, paginated PDF tables',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-formats',
    tags: ['document', 'converter', 'ods', 'spreadsheet', 'opendocument', 'pdf'],
    formula: 'SheetJS ODS parsing to multi-sheet PDF table rendering',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'odp-to-pdf-converter',
    name: 'ODP to PDF Converter',
    shortDesc: 'Convert OpenDocument Presentations (.odp) into slide-by-slide PDF handouts preserving titles, bullets, and tables',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-formats',
    tags: ['document', 'converter', 'odp', 'presentation', 'opendocument', 'pdf'],
    formula: 'ODP content.xml draw:page extraction to PDF slides',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'docx-to-html-converter',
    name: 'DOCX to HTML Converter',
    shortDesc: 'Convert Microsoft Word (.docx) documents into clean, responsive semantic HTML5 pages locally in your browser',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-formats',
    tags: ['document', 'converter', 'docx', 'word', 'html', 'web'],
    formula: 'Mammoth.js OpenXML conversion to semantic HTML5',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'xlsx-to-csv-converter',
    name: 'XLSX to CSV Converter',
    shortDesc: 'Export single Excel worksheets or all sheets (as a ZIP archive) from .xlsx, .xls, or .ods workbooks into RFC 4180 CSV',
    category: 'document-converters',
    subcategoryId: 'p27-sub-office-formats',
    tags: ['document', 'converter', 'xlsx', 'excel', 'csv', 'spreadsheet'],
    formula: 'SheetJS sheet extraction to delimited UTF-8 CSV / ZIP',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },

  // --- GROUP 5: ADVANCED DOCUMENT CONVERTERS (4 tools) ---
  {
    id: 'xlsx-to-json-converter',
    name: 'XLSX to JSON Converter',
    shortDesc: 'Convert single or multi-sheet Excel (.xlsx, .xls, .ods) workbooks into structured, pretty-printed JSON datasets',
    category: 'document-converters',
    subcategoryId: 'p27-sub-advanced-conv',
    tags: ['document', 'converter', 'xlsx', 'excel', 'json', 'data'],
    formula: 'SheetJS multi-sheet parsing to typed JSON serialization',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  {
    id: 'pptx-to-images-converter',
    name: 'PPTX to Images Converter',
    shortDesc: 'Render PowerPoint (.pptx) presentation slides into downloadable PNG or JPEG images packaged as a ZIP gallery',
    category: 'document-converters',
    subcategoryId: 'p27-sub-advanced-conv',
    tags: ['document', 'converter', 'pptx', 'powerpoint', 'images', 'png', 'jpeg'],
    formula: 'PPTX slide XML & media rendering via HTML5 Canvas',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'pdf-to-html-converter',
    name: 'PDF to HTML Converter',
    shortDesc: 'Extract PDF pages, headings, paragraphs, and tables into clean, responsive semantic HTML5 sections',
    category: 'document-converters',
    subcategoryId: 'p27-sub-advanced-conv',
    tags: ['document', 'converter', 'pdf', 'html', 'web'],
    formula: 'PDF structure extraction to semantic HTML5 sections',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'pdf-to-markdown-converter',
    name: 'PDF to Markdown Converter',
    shortDesc: 'Convert PDF documents into clean GitHub-Flavored Markdown (.md) with headings, bullet lists, and Markdown tables',
    category: 'document-converters',
    subcategoryId: 'p27-sub-advanced-conv',
    tags: ['document', 'converter', 'pdf', 'markdown', 'md'],
    formula: 'PDF typography & column clustering to GFM Markdown',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF'
  }
];
