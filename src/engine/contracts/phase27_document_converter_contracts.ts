import { CalculationContract } from '../types.ts';
import { PHASE27_METADATA } from '../../data/catalog/phase27_document_converters.ts';
import { DocumentConverterId } from '../../services/document/types.ts';

export interface DocumentConversionContract {
  id: DocumentConverterId;
  name: string;
  subcategoryId: string;
  inputLabel: string;
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  acceptAttribute: string;
  outputExtension: string;
  outputMimeType: string;
  supportsPageSettings: boolean;
  supportsOcrFallback: boolean;
  supportsSheetSelection: boolean;
  supportsDelimiter: boolean;
  supportsPptxMode: boolean;
  supportsImageFormat: boolean;
  supportsJsonPretty: boolean;
  limitationsNote: string;
}

export const DOCUMENT_CONVERSION_CONTRACTS: Record<DocumentConverterId, DocumentConversionContract> = {
  // GROUP 1: PDF TO OFFICE
  'pdf-to-word-docx': {
    id: 'pdf-to-word-docx',
    name: 'PDF to Word (DOCX) Converter',
    subcategoryId: 'p27-sub-pdf-to-office',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'docx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Reconstructs headings, paragraphs, lists, and aligned tables in reading order; absolute vector positioning is simplified.'
  },
  'pdf-to-excel-xlsx': {
    id: 'pdf-to-excel-xlsx',
    name: 'PDF to Excel (XLSX) Converter',
    subcategoryId: 'p27-sub-pdf-to-office',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'xlsx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Splits columns using X/Y coordinate clustering into actual spreadsheet cells; heavily merged visual tables may need minor cleanup.'
  },
  'pdf-to-powerpoint-pptx': {
    id: 'pdf-to-powerpoint-pptx',
    name: 'PDF to PowerPoint (PPTX) Converter',
    subcategoryId: 'p27-sub-pdf-to-office',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'pptx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: true,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Editable mode reconstructs titles, text, and tables; Slide Image mode embeds rendered PNG pages for exact visual fidelity.'
  },
  'pdf-to-csv-converter': {
    id: 'pdf-to-csv-converter',
    name: 'PDF to CSV Converter',
    subcategoryId: 'p27-sub-pdf-to-office',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'csv',
    outputMimeType: 'text/csv;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: true,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Detects column boundaries via text gap analysis and exports UTF-8 RFC 4180 CSV.'
  },

  // GROUP 2: OFFICE TO PDF
  'word-to-pdf-converter': {
    id: 'word-to-pdf-converter',
    name: 'Word (DOCX) to PDF Converter',
    subcategoryId: 'p27-sub-office-to-pdf',
    inputLabel: 'Word Document (.docx)',
    acceptedExtensions: ['docx'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    acceptAttribute: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Preserves headings, paragraphs, lists, and tables; legacy binary .doc and SmartArt diagrams are not supported.'
  },
  'excel-to-pdf-converter': {
    id: 'excel-to-pdf-converter',
    name: 'Excel (XLSX) to PDF Converter',
    subcategoryId: 'p27-sub-office-to-pdf',
    inputLabel: 'Excel Spreadsheet (.xlsx, .xls)',
    acceptedExtensions: ['xlsx', 'xls'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ],
    acceptAttribute: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: true,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Renders cell values and multi-page bordered tables across selected or all sheets; Excel charts are omitted.'
  },
  'powerpoint-to-pdf-converter': {
    id: 'powerpoint-to-pdf-converter',
    name: 'PowerPoint (PPTX) to PDF Converter',
    subcategoryId: 'p27-sub-office-to-pdf',
    inputLabel: 'PowerPoint Presentation (.pptx)',
    acceptedExtensions: ['pptx'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    acceptAttribute: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Renders slide titles, bullet lists, tables, and speaker notes per page; slide animations and theme graphics are simplified.'
  },
  'txt-to-pdf-converter': {
    id: 'txt-to-pdf-converter',
    name: 'Plain Text (TXT) to PDF Converter',
    subcategoryId: 'p27-sub-office-to-pdf',
    inputLabel: 'Text File (.txt)',
    acceptedExtensions: ['txt', 'log', 'md'],
    acceptedMimeTypes: ['text/plain'],
    acceptAttribute: '.txt,.log,.md,text/plain',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Supports UTF-8 Unicode text, word wrapping, configurable page size, orientation, and margins.'
  },

  // GROUP 3: TEXT & WEB TO PDF
  'html-to-pdf-converter': {
    id: 'html-to-pdf-converter',
    name: 'HTML to PDF Converter',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    inputLabel: 'HTML Document (.html, .htm)',
    acceptedExtensions: ['html', 'htm'],
    acceptedMimeTypes: ['text/html'],
    acceptAttribute: '.html,.htm,text/html',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Renders semantic headings, paragraphs, lists, code blocks, and tables locally without external network fetches.'
  },
  'csv-to-pdf-converter': {
    id: 'csv-to-pdf-converter',
    name: 'CSV to PDF Converter',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    inputLabel: 'CSV Dataset (.csv)',
    acceptedExtensions: ['csv', 'tsv'],
    acceptedMimeTypes: ['text/csv', 'text/tab-separated-values'],
    acceptAttribute: '.csv,.tsv,text/csv',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Formats tabular CSV rows into multi-page PDF tables with automatic header repetition.'
  },
  'rtf-to-pdf-converter': {
    id: 'rtf-to-pdf-converter',
    name: 'RTF to PDF Converter',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    inputLabel: 'Rich Text Format (.rtf)',
    acceptedExtensions: ['rtf'],
    acceptedMimeTypes: ['application/rtf', 'text/rtf'],
    acceptAttribute: '.rtf,application/rtf,text/rtf',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Extracts RTF paragraphs and Unicode/hex escapes cleanly; embedded WMF/EMF vector objects are omitted.'
  },
  'odt-to-pdf-converter': {
    id: 'odt-to-pdf-converter',
    name: 'ODT to PDF Converter',
    subcategoryId: 'p27-sub-web-text-to-pdf',
    inputLabel: 'OpenDocument Text (.odt)',
    acceptedExtensions: ['odt'],
    acceptedMimeTypes: ['application/vnd.oasis.opendocument.text'],
    acceptAttribute: '.odt,application/vnd.oasis.opendocument.text',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Parses OpenDocument content.xml headings, paragraphs, and tables into paginated PDFs.'
  },

  // GROUP 4: OFFICE FORMAT CONVERTERS
  'ods-to-pdf-converter': {
    id: 'ods-to-pdf-converter',
    name: 'ODS to PDF Converter',
    subcategoryId: 'p27-sub-office-formats',
    inputLabel: 'OpenDocument Spreadsheet (.ods)',
    acceptedExtensions: ['ods'],
    acceptedMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet'],
    acceptAttribute: '.ods,application/vnd.oasis.opendocument.spreadsheet',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: true,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Supports multi-sheet ODS spreadsheets; cell values and grids are preserved while charts are omitted.'
  },
  'odp-to-pdf-converter': {
    id: 'odp-to-pdf-converter',
    name: 'ODP to PDF Converter',
    subcategoryId: 'p27-sub-office-formats',
    inputLabel: 'OpenDocument Presentation (.odp)',
    acceptedExtensions: ['odp'],
    acceptedMimeTypes: ['application/vnd.oasis.opendocument.presentation'],
    acceptAttribute: '.odp,application/vnd.oasis.opendocument.presentation',
    outputExtension: 'pdf',
    outputMimeType: 'application/pdf',
    supportsPageSettings: true,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Renders ODP slide titles, text frames, tables, and notes onto paginated PDF pages.'
  },
  'docx-to-html-converter': {
    id: 'docx-to-html-converter',
    name: 'DOCX to HTML Converter',
    subcategoryId: 'p27-sub-office-formats',
    inputLabel: 'Word Document (.docx)',
    acceptedExtensions: ['docx'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    acceptAttribute: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    outputExtension: 'html',
    outputMimeType: 'text/html;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Produces clean semantic HTML5 with headings, lists, and tables; page headers/footers are not included.'
  },
  'xlsx-to-csv-converter': {
    id: 'xlsx-to-csv-converter',
    name: 'XLSX to CSV Converter',
    subcategoryId: 'p27-sub-office-formats',
    inputLabel: 'Excel Spreadsheet (.xlsx, .xls, .ods)',
    acceptedExtensions: ['xlsx', 'xls', 'ods'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.oasis.opendocument.spreadsheet'
    ],
    acceptAttribute: '.xlsx,.xls,.ods',
    outputExtension: 'csv',
    outputMimeType: 'text/csv;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: false,
    supportsSheetSelection: true,
    supportsDelimiter: true,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Export a single sheet as CSV or export all workbook sheets into a ZIP archive of CSV files.'
  },

  // GROUP 5: ADVANCED DOCUMENT CONVERTERS
  'xlsx-to-json-converter': {
    id: 'xlsx-to-json-converter',
    name: 'XLSX to JSON Converter',
    subcategoryId: 'p27-sub-advanced-conv',
    inputLabel: 'Excel Spreadsheet (.xlsx, .xls, .ods)',
    acceptedExtensions: ['xlsx', 'xls', 'ods'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ],
    acceptAttribute: '.xlsx,.xls,.ods',
    outputExtension: 'json',
    outputMimeType: 'application/json;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: false,
    supportsSheetSelection: true,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: true,
    limitationsNote: 'Exports single or multi-sheet Excel workbooks as structured JSON arrays or keyed sheet objects.'
  },
  'pptx-to-images-converter': {
    id: 'pptx-to-images-converter',
    name: 'PPTX to Images Converter',
    subcategoryId: 'p27-sub-advanced-conv',
    inputLabel: 'PowerPoint Presentation (.pptx)',
    acceptedExtensions: ['pptx'],
    acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    acceptAttribute: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    outputExtension: 'zip',
    outputMimeType: 'application/zip',
    supportsPageSettings: false,
    supportsOcrFallback: false,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: true,
    supportsJsonPretty: false,
    limitationsNote: 'Renders PPTX slide titles, text, and embedded slide media onto HTML5 Canvas as PNG or JPEG images.'
  },
  'pdf-to-html-converter': {
    id: 'pdf-to-html-converter',
    name: 'PDF to HTML Converter',
    subcategoryId: 'p27-sub-advanced-conv',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'html',
    outputMimeType: 'text/html;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Extracts PDF pages into structured HTML5 <section> blocks with tables and headings.'
  },
  'pdf-to-markdown-converter': {
    id: 'pdf-to-markdown-converter',
    name: 'PDF to Markdown Converter',
    subcategoryId: 'p27-sub-advanced-conv',
    inputLabel: 'PDF Document (.pdf)',
    acceptedExtensions: ['pdf'],
    acceptedMimeTypes: ['application/pdf'],
    acceptAttribute: '.pdf,application/pdf',
    outputExtension: 'md',
    outputMimeType: 'text/markdown;charset=utf-8',
    supportsPageSettings: false,
    supportsOcrFallback: true,
    supportsSheetSelection: false,
    supportsDelimiter: false,
    supportsPptxMode: false,
    supportsImageFormat: false,
    supportsJsonPretty: false,
    limitationsNote: 'Infers Markdown headings, lists, and GitHub-Flavored Markdown tables from PDF typography and coordinates.'
  }
};

export function getDocumentContract(id: string): DocumentConversionContract | undefined {
  return DOCUMENT_CONVERSION_CONTRACTS[id as DocumentConverterId];
}

// Registry compatibility contracts for CalculationRegistry integrity across all registered tools
export const PHASE27_CONTRACTS: CalculationContract<any, any>[] = PHASE27_METADATA.map((meta) => {
  const docContract = DOCUMENT_CONVERSION_CONTRACTS[meta.id as DocumentConverterId];
  return {
    id: meta.id,
    name: meta.name,
    category: 'document-converters',
    subcategoryId: meta.subcategoryId,
    inputSchema: {
      fields: [
        {
          name: 'fileSizeBytes',
          label: 'Document Size (bytes)',
          type: 'number',
          defaultValue: 1024,
          required: true,
          description: docContract ? `Accepted: ${docContract.acceptedExtensions.join(', ')}` : meta.shortDesc
        }
      ]
    },
    validate: (inputs: Record<string, unknown>) => {
      const size = Number(inputs?.fileSizeBytes ?? 0);
      if (!Number.isFinite(size) || size <= 0) {
        return [
          {
            field: 'fileSizeBytes',
            code: 'POSITIVE_NUMBER_REQUIRED',
            message: 'Document must be non-empty (> 0 bytes).'
          }
        ];
      }
      return [];
    },
    calculate: () => ({
      engineMode: 'Browser-Local Document Conversion Engine',
      outputFormat: docContract?.outputExtension.toUpperCase() || 'DOCUMENT',
      acceptedInputs: docContract?.acceptedExtensions.join(', ').toUpperCase() || 'DOCUMENT'
    }),
    formatResult: (res: Record<string, any>) => ({
      primary: {
        label: 'Target Format',
        value: String(res.outputFormat || 'READY'),
        numericValue: String(res.outputFormat || 'READY')
      },
      breakdown: [
        { label: 'Execution Engine', value: String(res.engineMode) },
        { label: 'Accepted Inputs', value: String(res.acceptedInputs) }
      ]
    }),
    formulaMeta: {
      formulaName: meta.formula,
      formulaExpression: `${docContract?.acceptedExtensions.join('/').toUpperCase()} -> ${docContract?.outputExtension.toUpperCase()}`,
      variables: [
        { symbol: 'in', name: docContract?.inputLabel || 'Input Document' },
        { symbol: 'out', name: docContract?.outputExtension.toUpperCase() || 'Output Document' }
      ],
      explanation: docContract?.limitationsNote || meta.shortDesc,
      assumptions: ['100% browser-local execution with zero external document upload.'],
      limitations: [docContract?.limitationsNote || 'Browser-local conversion capabilities apply.']
    }
  };
});
