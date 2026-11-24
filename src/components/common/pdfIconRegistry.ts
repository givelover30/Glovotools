export type PdfIconPaletteKey = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'teal';

export type PdfIconGlyph =
  | 'merge'
  | 'split'
  | 'extract-pages'
  | 'delete-pages'
  | 'rotate-pages'
  | 'reorder-pages'
  | 'page-counter'
  | 'extractor-merger'
  | 'watermark'
  | 'page-numbers'
  | 'add-text'
  | 'metadata-editor'
  | 'page-resizer'
  | 'crop-pages'
  | 'compress'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'extract-images'
  | 'pdf-to-text'
  | 'protect-password'
  | 'remove-password'
  | 'metadata-viewer'
  | 'comparison'
  | 'ocr'
  | 'repair'
  | 'numbering-watermark'
  | 'selection-scissors'
  | 'stacked-layers'
  | 'blank-detector'
  | 'size-analyzer'
  | 'split-count'
  | 'generic-pdf';

export interface PdfIconPaletteStyle {
  tileClass: string;
  accent: string;
  accentLight: string;
}

export interface PdfToolIconConfig {
  glyph: PdfIconGlyph;
  palette: PdfIconPaletteKey;
  label: string;
}

/**
 * Approved soft pastel palette for light mode with balanced high-contrast
 * tinted surfaces for dark mode so white PDF silhouettes and accents stay crisp.
 */
export const PDF_ICON_PALETTES: Record<PdfIconPaletteKey, PdfIconPaletteStyle> = {
  red: {
    tileClass: 'bg-[#FEE2E2] border-[#FECACA] dark:bg-[#EF4444]/20 dark:border-[#F87171]/35',
    accent: '#DC2626',
    accentLight: '#FEE2E2'
  },
  blue: {
    tileClass: 'bg-[#DBEAFE] border-[#BFDBFE] dark:bg-[#3B82F6]/20 dark:border-[#60A5FA]/35',
    accent: '#2563EB',
    accentLight: '#DBEAFE'
  },
  green: {
    tileClass: 'bg-[#DCFCE7] border-[#BBF7D0] dark:bg-[#22C55E]/20 dark:border-[#4ADE80]/35',
    accent: '#16A34A',
    accentLight: '#DCFCE7'
  },
  purple: {
    tileClass: 'bg-[#F3E8FF] border-[#E9D5FF] dark:bg-[#A855F7]/20 dark:border-[#C084FC]/35',
    accent: '#7C3AED',
    accentLight: '#F3E8FF'
  },
  orange: {
    tileClass: 'bg-[#FFEDD5] border-[#FED7AA] dark:bg-[#F97316]/20 dark:border-[#FB923C]/35',
    accent: '#EA580C',
    accentLight: '#FFEDD5'
  },
  teal: {
    tileClass: 'bg-[#CCFBF1] border-[#99F6E4] dark:bg-[#14B8A6]/20 dark:border-[#2DD4BF]/35',
    accent: '#0D9488',
    accentLight: '#CCFBF1'
  }
};

/**
 * Centralized canonical tool ID -> function-specific PDF icon mapping.
 * Covers all 33 canonical tools in the Glovotools PDF Suite (`pdf-tools`).
 */
export const PDF_TOOL_ICON_MAP: Record<string, PdfToolIconConfig> = {
  // FILE ORGANIZATION
  'pdf-merge': {
    glyph: 'merge',
    palette: 'red',
    label: 'Merge PDF Files'
  },
  'pdf-split': {
    glyph: 'split',
    palette: 'orange',
    label: 'Split PDF Document'
  },
  'pdf-extract-pages': {
    glyph: 'extract-pages',
    palette: 'blue',
    label: 'Extract PDF Pages'
  },
  'pdf-delete-pages': {
    glyph: 'delete-pages',
    palette: 'red',
    label: 'Delete PDF Pages'
  },
  'pdf-rotate-pages': {
    glyph: 'rotate-pages',
    palette: 'teal',
    label: 'Rotate PDF Pages'
  },
  'pdf-reorder-pages': {
    glyph: 'reorder-pages',
    palette: 'purple',
    label: 'Reorder PDF Pages'
  },
  'pdf-page-counter': {
    glyph: 'page-counter',
    palette: 'blue',
    label: 'PDF Page Counter & Info Inspector'
  },
  'pdf-extractor-merger': {
    glyph: 'extractor-merger',
    palette: 'teal',
    label: 'PDF Page Extractor & Merger Utility'
  },

  // PDF EDITING
  'pdf-add-watermark': {
    glyph: 'watermark',
    palette: 'purple',
    label: 'Add Watermark to PDF'
  },
  'pdf-add-page-numbers': {
    glyph: 'page-numbers',
    palette: 'blue',
    label: 'Add Page Numbers to PDF'
  },
  'pdf-add-text': {
    glyph: 'add-text',
    palette: 'orange',
    label: 'Add Text Annotations to PDF'
  },
  'pdf-metadata-editor': {
    glyph: 'metadata-editor',
    palette: 'purple',
    label: 'PDF Metadata Editor'
  },
  'pdf-page-resizer': {
    glyph: 'page-resizer',
    palette: 'green',
    label: 'PDF Page Resizer'
  },
  'pdf-crop-pages': {
    glyph: 'crop-pages',
    palette: 'orange',
    label: 'PDF Crop Pages'
  },

  // PDF OPTIMIZATION AND CONVERSION
  'pdf-compress': {
    glyph: 'compress',
    palette: 'green',
    label: 'Compress PDF File Size'
  },
  'pdf-images-to-pdf': {
    glyph: 'images-to-pdf',
    palette: 'teal',
    label: 'Images to PDF Converter'
  },
  'pdf-to-images': {
    glyph: 'pdf-to-images',
    palette: 'blue',
    label: 'PDF to Images Converter'
  },
  'pdf-extract-images': {
    glyph: 'extract-images',
    palette: 'orange',
    label: 'Extract Images from PDF'
  },
  'pdf-to-text': {
    glyph: 'pdf-to-text',
    palette: 'green',
    label: 'PDF to Text Extractor'
  },

  // PDF SECURITY
  'pdf-protect-password': {
    glyph: 'protect-password',
    palette: 'red',
    label: 'Protect PDF with Password'
  },
  'pdf-remove-password': {
    glyph: 'remove-password',
    palette: 'green',
    label: 'Remove PDF Password Security'
  },

  // PDF ANALYSIS AND ADVANCED TOOLS
  'pdf-metadata-viewer': {
    glyph: 'metadata-viewer',
    palette: 'blue',
    label: 'PDF Metadata & Properties Viewer'
  },
  'pdf-comparison': {
    glyph: 'comparison',
    palette: 'purple',
    label: 'PDF Document Comparison'
  },
  'pdf-ocr': {
    glyph: 'ocr',
    palette: 'teal',
    label: 'PDF OCR Text Recognition'
  },
  'pdf-repair': {
    glyph: 'repair',
    palette: 'orange',
    label: 'PDF Structure Repair Utility'
  },
  'pdf-page-numbering-header-watermark-tool': {
    glyph: 'numbering-watermark',
    palette: 'purple',
    label: 'PDF Page Numbering & Header Watermark'
  },
  'pdf-page-extraction-tool': {
    glyph: 'selection-scissors',
    palette: 'blue',
    label: 'PDF Page Extraction Tool'
  },
  'pdf-page-reordering-tool': {
    glyph: 'stacked-layers',
    palette: 'green',
    label: 'PDF Page Reordering Tool'
  },

  // ADDITIONAL REGISTERED PDF SUITE TOOLS
  'pdf-blank-page-detector': {
    glyph: 'blank-detector',
    palette: 'orange',
    label: 'PDF Blank Page Detector'
  },
  'pdf-image-extraction-tool': {
    glyph: 'extract-images',
    palette: 'orange',
    label: 'PDF Image Extraction Tool'
  },
  'pdf-page-rotation-tool': {
    glyph: 'rotate-pages',
    palette: 'teal',
    label: 'PDF Page Rotation Tool'
  },
  'pdf-file-size-analyzer': {
    glyph: 'size-analyzer',
    palette: 'purple',
    label: 'PDF File Size Analyzer'
  },
  'pdf-split-by-page-count-tool': {
    glyph: 'split-count',
    palette: 'red',
    label: 'PDF Split by Page Count Tool'
  }
};

export const FALLBACK_PDF_TOOL_ICON: PdfToolIconConfig = {
  glyph: 'generic-pdf',
  palette: 'red',
  label: 'PDF Tool'
};

/**
 * Resolves a PDF Suite tool icon config by canonical ID, with a safe fallback
 * scoped strictly to the `pdf-tools` category so all other categories stay unchanged.
 */
export function getPdfToolIconConfig(
  toolId?: string,
  category?: string
): PdfToolIconConfig | null {
  if (toolId && PDF_TOOL_ICON_MAP[toolId]) {
    return PDF_TOOL_ICON_MAP[toolId];
  }
  if (category === 'pdf-tools') {
    return FALLBACK_PDF_TOOL_ICON;
  }
  return null;
}
