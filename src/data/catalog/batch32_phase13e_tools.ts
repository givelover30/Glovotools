import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH32_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13e-sub-tools', categoryId: 'additional-tools', name: 'Advanced File, Media & Data Utilities', slug: 'advanced-file-media-data-utilities', description: 'Image batch converter, audio metadata inspector, XML tree viewer, regex builder, CSV spreadsheet editor, and file checksum verifier', sortOrder: 35 }
];

export const BATCH32_METADATA: CalculatorMeta[] = [
  // 1. Image Format Batch Converter
  {
    id: 'image-batch-converter',
    name: 'Image Format Batch Converter & Resizer',
    shortDesc: 'Batch convert local images between PNG, JPEG, WebP, and BMP formats with quality control and preview',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'image', 'converter', 'batch', 'png', 'jpeg', 'webp'],
    formula: 'HTML5 Canvas toDataURL / toBlob encoding transformation',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. Audio Metadata Inspector
  {
    id: 'audio-metadata-inspector',
    name: 'Audio File Metadata & Properties Inspector',
    shortDesc: 'Inspect audio files (MP3, WAV, OGG, AAC) locally to display format, sample rate, channels, bitrate, and duration',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'audio', 'metadata', 'inspector', 'mp3', 'wav', 'properties'],
    formula: 'HTML5 Audio object metadata extraction and header parsing',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 4. XML Formatter & Tree Viewer
  {
    id: 'xml-formatter-tree-viewer',
    name: 'XML Formatter, Beautifier & Tree Viewer',
    shortDesc: 'Format, validate, minify, and inspect XML documents with collapsible element tree navigation',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'xml', 'formatter', 'beautifier', 'tree-view', 'parser'],
    formula: 'DOMParser DOM tree serialization and indentation formatting',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 5. Regular Expression Visual Builder
  {
    id: 'regex-visual-builder',
    name: 'Regular Expression Visual Builder & Tester',
    shortDesc: 'Build, test, and debug regular expressions interactively against sample text with live matches and capture groups',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'regex', 'regular-expression', 'builder', 'tester', 'developer'],
    formula: 'ECMAScript RegExp match execution and group tokenization',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 6. CSV Spreadsheet Preview & Editor
  {
    id: 'csv-spreadsheet-editor',
    name: 'CSV Spreadsheet Preview & Grid Editor',
    shortDesc: 'Import, preview, edit rows/columns, handle delimiters, and export CSV tabular spreadsheets locally',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'csv', 'spreadsheet', 'editor', 'grid', 'data', 'table'],
    formula: 'Delimited text parsing, grid matrix manipulation, and RFC 4180 CSV serialization',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 7. File Checksum & Hash Verifier
  {
    id: 'file-checksum-verifier',
    name: 'File Checksum & Cryptographic Hash Verifier',
    shortDesc: 'Calculate SHA-256, SHA-1, and MD5 cryptographic hashes for local files and verify against expected checksums',
    category: 'additional-tools',
    subcategoryId: 'p13e-sub-tools',
    tags: ['tools', 'checksum', 'hash', 'sha256', 'md5', 'verifier', 'security'],
    formula: 'Web Crypto API subtle.digest() cryptographic hashing over ArrayBuffers',
    isPopular: false,
    iconName: 'Wrench',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
