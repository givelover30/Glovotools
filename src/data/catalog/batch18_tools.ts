import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH18_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'tools-text',
    categoryId: 'tools',
    name: 'Text Tools',
    slug: 'text-tools',
    description: 'Word and character counting, case conversion, and placeholder text generators',
    sortOrder: 1
  },
  {
    id: 'tools-developer',
    categoryId: 'tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'JSON formatting, syntax validation, Base64 encoding, cryptographic hashing, and regex testing',
    sortOrder: 2
  },
  {
    id: 'tools-datetime',
    categoryId: 'tools',
    name: 'Date & Time Tools',
    slug: 'datetime-tools',
    description: 'Unix timestamp epoch converters, UTC timezone world clocks, and date difference utilities',
    sortOrder: 3
  },
  {
    id: 'tools-image',
    categoryId: 'tools',
    name: 'Image Tools',
    slug: 'image-tools',
    description: 'Image and video aspect ratio solvers, resolution scaling, and responsive dimension helpers',
    sortOrder: 4
  },
  {
    id: 'tools-file',
    categoryId: 'tools',
    name: 'File Tools',
    slug: 'file-tools',
    description: 'File size bandwidth transfer duration, network throughput, and cloud storage calculations',
    sortOrder: 5
  },
  {
    id: 'tools-color',
    categoryId: 'tools',
    name: 'Color Tools',
    slug: 'color-tools',
    description: 'HEX, RGB, HSL, and CMYK color code converters, palette generators, and WCAG contrast evaluators',
    sortOrder: 6
  },
  {
    id: 'tools-web',
    categoryId: 'tools',
    name: 'Web Tools',
    slug: 'web-tools',
    description: 'URL percent-encoding, query string parsers, and HTML entity converters',
    sortOrder: 7
  },
  {
    id: 'tools-productivity',
    categoryId: 'tools',
    name: 'Productivity Tools',
    slug: 'productivity-tools',
    description: 'QR code payload formatters, Wi-Fi configuration generators, and workflow utilities',
    sortOrder: 8
  }
];

export const BATCH18_METADATA: CalculatorMeta[] = [
  // 1. Word & Character Counter
  {
    id: 'word-character-counter',
    name: 'Word, Character & Reading Time Counter',
    shortDesc: 'Instant word count, characters with/without spaces, sentences, paragraphs, reading and speaking duration',
    category: 'tools',
    subcategoryId: 'tools-text',
    tags: ['tools', 'text', 'word-counter', 'character-count', 'reading-time', 'writing', 'copywriting'],
    formula: 'Words = count(tokens); ReadingTime = Words / 200 wpm; SpeakingTime = Words / 130 wpm',
    isPopular: true,
    iconName: 'AlignJustify',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 2. Case Converter
  {
    id: 'case-converter-tool',
    name: 'Text Case Converter & Capitalization Tool',
    shortDesc: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and PascalCase',
    category: 'tools',
    subcategoryId: 'tools-text',
    tags: ['tools', 'text', 'case-converter', 'camelcase', 'snake-case', 'uppercase', 'lowercase'],
    formula: 'Transform text tokenization and capitalization delimiters',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 4. JSON Formatter & Validator
  {
    id: 'json-formatter-validator',
    name: 'JSON Formatter, Minifier & Syntax Validator',
    shortDesc: 'Validate, beautify with 2 or 4 spaces, minify, and inspect JSON structures with error diagnostic feedback',
    category: 'tools',
    subcategoryId: 'tools-developer',
    tags: ['tools', 'developer', 'json', 'formatter', 'validator', 'beautifier', 'minifier'],
    formula: 'JSON.stringify(JSON.parse(input), null, indentLevel)',
    isPopular: true,
    iconName: 'Binary',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 5. Base64 Encoder & Decoder
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Text & URL Encoder / Decoder',
    shortDesc: 'Encode UTF-8 text into Base64 strings or decode Base64 into readable text with standard and URL-safe formatting',
    category: 'tools',
    subcategoryId: 'tools-developer',
    tags: ['tools', 'developer', 'base64', 'encode', 'decode', 'url-safe', 'binary'],
    formula: 'Base64 RFC 4648 byte chunk encoding and decoding',
    isPopular: true,
    iconName: 'Repeat',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 6. Cryptographic Hash Generator
  {
    id: 'hash-generator-tool',
    name: 'Cryptographic Hash & Checksum Generator',
    shortDesc: 'Generate secure SHA-256, SHA-1, SHA-512, and checksum cryptographic digest hashes for text strings',
    category: 'tools',
    subcategoryId: 'tools-developer',
    tags: ['tools', 'developer', 'hash', 'sha256', 'sha512', 'checksum', 'crypto', 'security'],
    formula: 'Cryptographic digest computation via standard hashing algorithms',
    isPopular: false,
    iconName: 'Shield',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 7. Regex Tester
  {
    id: 'regex-tester-tool',
    name: 'Regular Expression Tester & Matcher',
    shortDesc: 'Test regular expressions against target text with real-time match count, captured groups, and flag toggles',
    category: 'tools',
    subcategoryId: 'tools-developer',
    tags: ['tools', 'developer', 'regex', 'regexp', 'regular-expression', 'tester', 'matcher'],
    formula: 'Pattern matching via RegExp(pattern, flags).exec(string)',
    isPopular: false,
    iconName: 'Search',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 8. Unix Timestamp Converter
  {
    id: 'unix-timestamp-converter',
    name: 'Unix Timestamp & Epoch Date Converter',
    shortDesc: 'Convert Unix epoch seconds and milliseconds to human-readable UTC/local date strings and vice versa',
    category: 'tools',
    subcategoryId: 'tools-datetime',
    tags: ['tools', 'datetime', 'unix-timestamp', 'epoch', 'time', 'converter', 'utc'],
    formula: 'EpochSeconds = UTC_ms / 1000; Date = new Date(EpochSeconds * 1000)',
    isPopular: true,
    iconName: 'Clock',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  // 9. Aspect Ratio Solver
  {
    id: 'aspect-ratio-calculator',
    name: 'Image & Video Aspect Ratio Solver',
    shortDesc: 'Calculate proportional dimensions for 16:9, 4:3, 1:1, 21:9, and custom image/video display resolutions',
    category: 'tools',
    subcategoryId: 'tools-image',
    tags: ['tools', 'image', 'aspect-ratio', 'video', '16-9', 'resolution', 'scaling'],
    formula: 'Width = Height × (RatioW / RatioH); Height = Width × (RatioH / RatioW)',
    isPopular: false,
    iconName: 'Maximize2',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 10. File Download & Bandwidth Tool
  {
    id: 'file-size-bandwidth-tool',
    name: 'File Download Time & Bandwidth Tool',
    shortDesc: 'Calculate file transfer durations across internet bandwidth speeds: Gigabit, broadband, 5G, and 4G',
    category: 'tools',
    subcategoryId: 'tools-file',
    tags: ['tools', 'file', 'bandwidth', 'download-time', 'transfer-speed', 'network'],
    formula: 'DurationSeconds = (FileSizeBytes × 8) / BandwidthBitsPerSecond',
    isPopular: false,
    iconName: 'Box',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 11. Color Converter & Palette Tool
  {
    id: 'color-converter-picker',
    name: 'HEX, RGB, HSL & CMYK Color Converter Tool',
    shortDesc: 'Convert color values across HEX, RGB, HSL, and CMYK formats with visual color preview and WCAG contrast check',
    category: 'tools',
    subcategoryId: 'tools-color',
    tags: ['tools', 'color', 'hex', 'rgb', 'hsl', 'cmyk', 'contrast', 'palette', 'designer'],
    formula: 'Standard photometric color-space coordinate transformation equations',
    isPopular: true,
    iconName: 'Paintbrush',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 12. URL Encoder & Decoder
  {
    id: 'url-encoder-decoder',
    name: 'URL Percent Encoder & Query Decoder Tool',
    shortDesc: 'Encode query parameters and URLs into percent-encoded RFC 3986 format or decode encoded URI strings',
    category: 'tools',
    subcategoryId: 'tools-web',
    tags: ['tools', 'web', 'url-encoder', 'uricomponent', 'decode', 'uri', 'developer'],
    formula: 'encodeURIComponent(str) & decodeURIComponent(str)',
    isPopular: false,
    iconName: 'Globe',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  },
  // 13. HTML Entity Converter
  {
    id: 'html-entity-converter',
    name: 'HTML Entity Encoder & Decoder Tool',
    shortDesc: 'Convert special characters into HTML named and numeric entities (&amp;, &lt;, &gt;, &quot;) and vice versa',
    category: 'tools',
    subcategoryId: 'tools-web',
    tags: ['tools', 'web', 'html-entities', 'encoder', 'decoder', 'developer'],
    formula: 'Sanitize reserved HTML characters to named entity representations',
    isPopular: false,
    iconName: 'Code',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 14. QR Code Payload Generator
  {
    id: 'qr-code-payload-generator',
    name: 'QR Code Text, URL & Wi-Fi Payload Formatter',
    shortDesc: 'Format structured QR code payload strings for website URLs, plain text, Wi-Fi access credentials, and emails',
    category: 'tools',
    subcategoryId: 'tools-productivity',
    tags: ['tools', 'productivity', 'qr-code', 'wifi', 'payload', 'formatter', 'generator'],
    formula: 'Format standardized QR payload schemas (WIFI:S:ssid;T:WPA;P:key;;, mailto:, URL)',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB'
  }
];
