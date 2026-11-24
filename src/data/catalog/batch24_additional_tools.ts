import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH24_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'additional-dev',
    categoryId: 'additional-tools',
    name: 'Developer & Data Formatting Tools',
    slug: 'dev-formatting',
    description: 'JSON/CSV converters, text diff checkers, XML to JSON, and CRON schedule explainers',
    sortOrder: 1
  },
  {
    id: 'additional-web',
    categoryId: 'additional-tools',
    name: 'Web Encoding & Security Utilities',
    slug: 'web-encoding',
    description: 'URL encoders/decoders, JWT debuggers, and HTML entity encoders',
    sortOrder: 2
  },
  {
    id: 'additional-media',
    categoryId: 'additional-tools',
    name: 'Visual & Measurement Utilities',
    slug: 'visual-utils',
    description: 'CSS gradient generators, epoch timestamp converters, and image dimension calculators',
    sortOrder: 3
  }
];

export const BATCH24_METADATA: CalculatorMeta[] = [
  {
    id: 'json-csv-converter',
    name: 'JSON & CSV Data Converter',
    shortDesc: 'Convert structured JSON arrays to formatted CSV tables and parse CSV text back into valid JSON objects',
    category: 'additional-tools',
    subcategoryId: 'additional-dev',
    tags: ['tools', 'json', 'csv', 'converter', 'data', 'developer'],
    formula: 'JSON.parse() / CSV row parsing algorithms',
    isPopular: true,
    iconName: 'FileSpreadsheet',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'text-diff-checker',
    name: 'Text Diff & Comparison Checker',
    shortDesc: 'Side-by-side or unified text comparison tool highlighting added, removed, and matching lines',
    category: 'additional-tools',
    subcategoryId: 'additional-dev',
    tags: ['tools', 'diff', 'comparison', 'text', 'developer', 'merge'],
    formula: 'Line-by-line text difference comparison algorithm',
    isPopular: true,
    iconName: 'GitCompare',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT (JSON Web Token) Debugger',
    shortDesc: 'Decode JSON Web Token header and payload claims securely in your browser with expiration validation',
    category: 'additional-tools',
    subcategoryId: 'additional-web',
    tags: ['tools', 'jwt', 'token', 'decoder', 'auth', 'security', 'debugger'],
    formula: 'Base64Url decoding of header & payload segments',
    isPopular: true,
    iconName: 'Key',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'epoch-timestamp',
    name: 'Epoch Timestamp & Date Converter',
    shortDesc: 'Convert Unix epoch timestamps (seconds/milliseconds) to human-readable UTC/local dates and vice versa',
    category: 'additional-tools',
    subcategoryId: 'additional-media',
    tags: ['tools', 'timestamp', 'epoch', 'unix', 'date', 'time'],
    formula: 'Math.floor(Date.now() / 1000)',
    isPopular: false,
    iconName: 'Clock',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Linear & Radial Gradient Generator',
    shortDesc: 'Interactive CSS gradient designer with custom color stops, angles, and one-click CSS code export',
    category: 'additional-tools',
    subcategoryId: 'additional-media',
    tags: ['tools', 'css', 'gradient', 'generator', 'web-design', 'colors'],
    formula: 'linear-gradient() / radial-gradient() syntax builder',
    isPopular: false,
    iconName: 'Palette',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'html-entity-encoder',
    name: 'HTML & Markdown Entity Encoder',
    shortDesc: 'Convert special characters (<, >, &, ", \') into secure HTML entities and decode encoded markup',
    category: 'additional-tools',
    subcategoryId: 'additional-web',
    tags: ['tools', 'html', 'entities', 'encoder', 'security', 'escaping'],
    formula: 'Entity substitution table mapping',
    isPopular: false,
    iconName: 'Code',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON Data Converter',
    shortDesc: 'Parse XML document strings into clean, structured JSON objects with tag and attribute conversion',
    category: 'additional-tools',
    subcategoryId: 'additional-dev',
    tags: ['tools', 'xml', 'json', 'converter', 'parser', 'data'],
    formula: 'DOMParser XML serialization and traversal',
    isPopular: false,
    iconName: 'FileCode',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'cron-expression-calculator',
    name: 'CRON Expression Explainer & Simulator',
    shortDesc: 'Translate standard 5-field CRON schedule expressions into plain English descriptions with upcoming execution times',
    category: 'additional-tools',
    subcategoryId: 'additional-dev',
    tags: ['tools', 'cron', 'schedule', 'expression', 'explainer', 'developer'],
    formula: 'CRON syntax token parsing (minute, hour, day, month, dow)',
    isPopular: false,
    iconName: 'CalendarClock',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  {
    id: 'image-dimension-calculator',
    name: 'Image Aspect Ratio & Resolution Calculator',
    shortDesc: 'Calculate scaled image dimensions preserving aspect ratio, scale percentages, and megapixels',
    category: 'additional-tools',
    subcategoryId: 'additional-media',
    tags: ['tools', 'image', 'aspect-ratio', 'resolution', 'dimensions', 'megapixels'],
    formula: 'Width₁ / Height₁ = Width₂ / Height₂',
    isPopular: false,
    iconName: 'Maximize',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  }
];
