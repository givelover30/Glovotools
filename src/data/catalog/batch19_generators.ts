import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH19_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'generators-security',
    categoryId: 'generators',
    name: 'Security & Auth Generators',
    slug: 'security-generators',
    description: 'Secure password generators, UUID v4 identifiers, and cryptographic hash utility creators',
    sortOrder: 1
  },
  {
    id: 'generators-data',
    categoryId: 'generators',
    name: 'Data & Text Generators',
    slug: 'data-generators',
    description: 'Lorem Ipsum placeholder text, random numbers, Base64 encoders, and text slug/case formatters',
    sortOrder: 2
  },
  {
    id: 'generators-web',
    categoryId: 'generators',
    name: 'Web & Design Generators',
    slug: 'web-generators',
    description: 'QR code image generators, CSS box shadow styles, and harmonized color palette generators',
    sortOrder: 3
  },
  {
    id: 'generators-code',
    categoryId: 'generators',
    name: 'Code & SEO Generators',
    slug: 'code-seo-generators',
    description: 'HTML boilerplate, CSS reset, favicons, meta tags, Open Graph, robots.txt, sitemaps, JSON/SQL mocks, and invoices',
    sortOrder: 4
  }
];

export const BATCH19_METADATA: CalculatorMeta[] = [
  // 1. Password Generator
  {
    id: 'secure-password-generator',
    name: 'Secure Password & Passphrase Generator',
    shortDesc: 'Generate strong, cryptographically secure passwords and memorable passphrases with custom length and character sets',
    category: 'generators',
    subcategoryId: 'generators-security',
    tags: ['generators', 'password', 'security', 'crypto', 'passphrase', 'auth'],
    formula: 'CryptoRandom(Length, Uppercase, Lowercase, Numbers, Symbols)',
    isPopular: true,
    iconName: 'KeyRound',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. QR Code Generator
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator & Data Matrix Creator',
    shortDesc: 'Generate high-resolution QR codes instantly from any URL, plain text, Wi-Fi configuration, or contact info with download support',
    category: 'generators',
    subcategoryId: 'generators-web',
    tags: ['generators', 'qrcode', 'barcode', 'url', 'wifi', 'image'],
    formula: 'MatrixEncoding(DataPayload, ErrorCorrectionLevel)',
    isPopular: true,
    iconName: 'QrCode',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 3. UUID v4 Generator
  {
    id: 'uuid-v4-generator',
    name: 'UUID v4 & Unique Identifier Generator',
    shortDesc: 'Generate random Version 4 UUID / GUID strings in single or bulk batches with one-click copy and JSON export',
    category: 'generators',
    subcategoryId: 'generators-security',
    tags: ['generators', 'uuid', 'guid', 'developer', 'identifier', 'unique'],
    formula: 'CryptoRandomBytes(16) formatted as 8-4-4-4-12 hex string',
    isPopular: false,
    iconName: 'Fingerprint',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Random Number Generator
  {
    id: 'random-number-generator',
    name: 'Random Number & Integer Generator',
    shortDesc: 'Generate random integers or floating-point decimals within custom minimum and maximum bounds with duplicate filtering',
    category: 'generators',
    subcategoryId: 'generators-data',
    tags: ['generators', 'random', 'number', 'integer', 'math', 'lottery'],
    formula: 'Math.floor(Math.random() * (max - min + 1)) + min',
    isPopular: true,
    iconName: 'Dice5',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 5. Lorem Ipsum Generator
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Placeholder Text Generator',
    shortDesc: 'Generate professional placeholder paragraphs, sentences, or words for wireframes, mockups, and layout design',
    category: 'generators',
    subcategoryId: 'generators-data',
    tags: ['generators', 'lorem-ipsum', 'placeholder', 'text', 'dummy', 'design'],
    formula: 'Latin lexicon token selection and sentence permutation',
    isPopular: true,
    iconName: 'FileText',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 6. Cryptographic Hash Generator
  {
    id: 'crypto-hash-generator',
    name: 'Cryptographic Hash Generator (MD5 / SHA)',
    shortDesc: 'Compute real-time MD5, SHA-256, and SHA-512 cryptographic checksum hashes for text strings and input data',
    category: 'generators',
    subcategoryId: 'generators-security',
    tags: ['generators', 'hash', 'md5', 'sha256', 'sha512', 'crypto', 'checksum'],
    formula: 'CryptoDigest(InputText, Algorithm)',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 7. Base64 Encoder / Decoder
  {
    id: 'base64-codec-generator',
    name: 'Base64 Encoder & Decoder Utility',
    shortDesc: 'Encode plain text and binary data into Base64 format or decode Base64 strings back to readable text instantly',
    category: 'generators',
    subcategoryId: 'generators-data',
    tags: ['generators', 'base64', 'encode', 'decode', 'converter', 'data'],
    formula: 'Btoa(InputText) / Atob(EncodedString)',
    isPopular: false,
    iconName: 'Binary',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 8. Color Palette Generator
  {
    id: 'color-palette-generator',
    name: 'Harmonious Color Palette Generator',
    shortDesc: 'Generate stunning, balanced color palettes with HEX, RGB, and HSL codes and one-click palette copying',
    category: 'generators',
    subcategoryId: 'generators-web',
    tags: ['generators', 'color', 'palette', 'design', 'hex', 'rgb', 'hsl'],
    formula: 'ColorTheoryHarmonies(BaseHue, Saturation, Lightness)',
    isPopular: true,
    iconName: 'Palette',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 9. CSS Box Shadow Generator
  {
    id: 'css-box-shadow-generator',
    name: 'CSS Box Shadow Code Generator',
    shortDesc: 'Visually configure box-shadow offsets, blur radius, spread, color, and opacity with live preview and CSS code export',
    category: 'generators',
    subcategoryId: 'generators-web',
    tags: ['generators', 'css', 'shadow', 'box-shadow', 'design', 'code'],
    formula: 'box-shadow: X Y Blur Spread Color',
    isPopular: false,
    iconName: 'Code',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  // 10. Text Slug & Case Generator
  {
    id: 'text-slug-case-generator',
    name: 'Text Slug & Variable Case Formatter',
    shortDesc: 'Convert any sentence or title into URL-friendly slugs, camelCase, snake_case, kebab-case, and Title Case',
    category: 'generators',
    subcategoryId: 'generators-data',
    tags: ['generators', 'slug', 'case', 'camelcase', 'kebab-case', 'url', 'seo'],
    formula: 'RegexNormalization(InputText, Delimiter)',
    isPopular: false,
    iconName: 'Type',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // --- 10 NEW PHASE 9C GENERATORS ---
  {
    id: 'html-boilerplate-generator',
    name: 'HTML5 Boilerplate Generator',
    shortDesc: 'Generate clean HTML5 document templates with custom title, lang, meta viewport, CSS, and JS links',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'html', 'boilerplate', 'template', 'web', 'developer'],
    formula: '<!DOCTYPE html> HTML5 Document Structure',
    isPopular: true,
    iconName: 'Code',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'css-reset-generator',
    name: 'CSS Reset & Normalize Generator',
    shortDesc: 'Generate modern CSS reset rules including box-sizing, margin/padding resets, and media defaults',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'css', 'reset', 'normalize', 'stylesheet', 'design'],
    formula: 'box-sizing: border-box & element normalizations',
    isPopular: false,
    iconName: 'FileCode',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'favicon-generator',
    name: 'SVG Favicon & Icon Generator',
    shortDesc: 'Create clean, scalable vector favicons with custom emojis, background colors, and rounded/circle shapes',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'favicon', 'svg', 'icon', 'image', 'branding'],
    formula: 'SVG Vector Rendering with Emoji and Background',
    isPopular: true,
    iconName: 'Image',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'meta-tags-generator',
    name: 'SEO Meta Tags Generator',
    shortDesc: 'Generate optimized HTML head meta tags for title, description, keywords, author, and robots directives',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'seo', 'meta', 'tags', 'head', 'search'],
    formula: '<meta name="description" content="...">',
    isPopular: true,
    iconName: 'Globe',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'open-graph-generator',
    name: 'Open Graph & Twitter Card Generator',
    shortDesc: 'Create social sharing meta tags for Facebook, LinkedIn, Discord, and Twitter rich preview cards',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'opengraph', 'social', 'twitter', 'og', 'sharing'],
    formula: '<meta property="og:title" content="...">',
    isPopular: false,
    iconName: 'Share2',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'robots-generator',
    name: 'Robots.txt Crawler Directives Generator',
    shortDesc: 'Generate custom robots.txt files with user-agent rules, disallow paths, crawl-delay, and sitemap reference',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'robots', 'crawler', 'seo', 'search', 'txt'],
    formula: 'User-agent: * Disallow: /admin/',
    isPopular: false,
    iconName: 'Shield',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'sitemap-generator',
    name: 'XML Sitemap Generator',
    shortDesc: 'Generate standard XML sitemaps with site URLs, last modified dates, change frequencies, and priorities',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'sitemap', 'xml', 'seo', 'urlset', 'index'],
    formula: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    isPopular: false,
    iconName: 'Network',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'json-mock-generator',
    name: 'JSON Mock Data Collection Generator',
    shortDesc: 'Generate mock JSON data arrays for users, products, and tasks with custom record counts and instant copy',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'json', 'mock', 'data', 'api', 'developer'],
    formula: 'Array.from({length: count}, generateMockRecord)',
    isPopular: true,
    iconName: 'Database',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'sql-data-generator',
    name: 'SQL Sample Data & Seed Generator',
    shortDesc: 'Generate SQL CREATE TABLE and INSERT INTO statements with realistic mock rows for testing and databases',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'sql', 'database', 'seed', 'insert', 'mysql'],
    formula: 'CREATE TABLE & INSERT INTO SQL Syntax',
    isPopular: false,
    iconName: 'Table',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'invoice-number-generator',
    name: 'Invoice Number Sequence Generator',
    shortDesc: 'Generate professional invoice number batches with custom prefixes, date stamps, and starting sequences',
    category: 'generators',
    subcategoryId: 'generators-code',
    tags: ['generators', 'invoice', 'number', 'sequence', 'billing', 'finance'],
    formula: 'Prefix + DateStamp + SequentialNumber',
    isPopular: false,
    iconName: 'FileSpreadsheet',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4'
  }
];
