import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH29_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13b-sub-conv', categoryId: 'converter', name: 'Advanced Engineering & Physical Unit Converters', slug: 'advanced-engineering-converters', description: 'Electrical units, stress & strain, thermal conductivity, magnetic field, frequency, mass flow, and sound decibels', sortOrder: 20 },
  { id: 'p13b-sub-check', categoryId: 'checkers', name: 'Web, Security & Data Quality Checkers', slug: 'web-security-data-checkers', description: 'Color-blindness simulator, DNS records, HTTP headers, CSV quality, licenses, links, and JSON-LD', sortOrder: 20 }
];

export const BATCH29_METADATA: CalculatorMeta[] = [
  // --- CONVERTERS (7) ---
  {
    id: 'p13b-electrical-units-converter',
    name: 'Electrical Units & Derived Quantities Converter',
    shortDesc: 'Convert electrical quantities across Volts, Amps, Ohms, Watts, Siemens, Farads, and Henrys',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'electrical', 'volts', 'amps', 'ohms', 'watts', 'units'],
    formula: 'Ohm’s law and SI electromagnetic unit scaling (V = I × R, P = V × I)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-stress-strain-converter',
    name: 'Engineering Stress & Pressure Unit Converter',
    shortDesc: 'Convert mechanical stress and pressure between Pascals (Pa), MPa, GPa, PSI, ksi, Bar, and Atmospheres',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'stress', 'pressure', 'psi', 'mpa', 'pascal', 'mechanics'],
    formula: '1 MPa = 10^6 Pa = 145.038 PSI; 1 ksi = 6.8947 MPa',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-thermal-conductivity-converter',
    name: 'Thermal Conductivity Unit Converter',
    shortDesc: 'Convert heat transfer conductivity between W/(m·K), BTU/(hr·ft·°F), and kcal/(h·m·°C)',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'thermal', 'conductivity', 'heat-transfer', 'engineering', 'units'],
    formula: '1 W/(m·K) = 0.5778 BTU/(hr·ft·°F) = 0.8598 kcal/(h·m·°C)',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-magnetic-field-converter',
    name: 'Magnetic Field Strength & Flux Density Converter',
    shortDesc: 'Convert magnetic units between Tesla (T), Gauss (G), Oersted (Oe), and Ampere per meter (A/m)',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'magnetic', 'tesla', 'gauss', 'oersted', 'flux', 'physics'],
    formula: '1 Tesla = 10,000 Gauss; H (A/m) = B / μ0',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-freq-wavelength-converter',
    name: 'Frequency & Electromagnetic Wavelength Converter',
    shortDesc: 'Convert electromagnetic wave frequency (Hz to THz) to wavelength in meters, centimeters, nanometers, and Angstroms',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'frequency', 'wavelength', 'electromagnetic', 'speed-of-light', 'physics'],
    formula: 'Wavelength (λ) = c / frequency (v), where c = 2.99792458 × 10^8 m/s',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-mass-flow-converter',
    name: 'Mass Flow Rate Unit Converter (Replaces Pressure Head)',
    shortDesc: 'Convert mass flow rates between kg/s, kg/min, lb/s, lb/min, lb/hr, metric tons/day, and slugs/sec',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'mass-flow', 'fluid-dynamics', 'kilograms', 'pounds', 'rate'],
    formula: '1 lb/hr = 0.000126 kg/s; 1 kg/s = 3600 kg/hr',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  {
    id: 'p13b-sound-decibel-converter',
    name: 'Sound Intensity Level & Decibel (dB) Converter',
    shortDesc: 'Convert acoustic sound pressure ($\mu Pa$) and sound intensity ($W/m^2$) to Decibels (dB SPL)',
    category: 'converter',
    subcategoryId: 'p13b-sub-conv',
    tags: ['converter', 'sound', 'decibel', 'acoustic', 'intensity', 'pressure'],
    formula: 'dB SPL = 20 × log10(P / P_ref), where P_ref = 20 µPa',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },

  // --- CHECKERS (7) ---
  {
    id: 'p13b-color-blindness-simulator',
    name: 'Accessibility Color-Blindness & Contrast Simulator',
    shortDesc: 'Simulate Deuteranopia, Protanopia, Tritanopia, and Achromatopsia color filters on color codes',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'accessibility', 'color-blindness', 'wcag', 'contrast', 'simulation'],
    formula: 'LMS color space matrix transformations for dichromacy',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-dns-syntax-checker',
    name: 'DNS Record Syntax & Propagation Validator',
    shortDesc: 'Validate syntax for A, AAAA, CNAME, MX, TXT, SRV, and NS DNS resource record entries',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'dns', 'syntax', 'networking', 'records', 'domain'],
    formula: 'RFC 1035 domain name and IPv4/IPv6 validation regex rules',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-http-header-analyzer',
    name: 'HTTP Response Security Header Analyzer',
    shortDesc: 'Audit HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) for security best practices',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'http', 'headers', 'security', 'csp', 'hsts', 'analyzer'],
    formula: 'Security header presence and configuration heuristic checks',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-csv-quality-checker',
    name: 'CSV Data Quality & Consistency Inspector',
    shortDesc: 'Inspect CSV text data for ragged rows, missing values, mismatched columns, and data type inconsistencies',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'csv', 'data-quality', 'validation', 'inspector', 'dataset'],
    formula: 'Row token length consistency and null value ratio analysis',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-license-checker',
    name: 'JavaScript Dependency Open-Source License Auditor',
    shortDesc: 'Audit package license identifiers (MIT, Apache-2.0, GPL, ISC, BSD) for commercial compliance compatibility',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'license', 'open-source', 'npm', 'compliance', 'audit'],
    formula: 'OSI-approved license categorization and restriction matrix',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-link-checker',
    name: 'Broken Internal Link & Path Validator',
    shortDesc: 'Scan HTML or Markdown snippets for broken anchor hrefs, missing relative paths, and malformed URLs',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'links', 'broken-links', 'seo', 'html', 'validator'],
    formula: 'URI schema and relative path traversal validation',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'p13b-json-ld-validator',
    name: 'Structured Data & JSON-LD Schema Validator',
    shortDesc: 'Validate Schema.org JSON-LD structured data scripts for syntax correctness and required properties',
    category: 'checkers',
    subcategoryId: 'p13b-sub-check',
    tags: ['checkers', 'json-ld', 'structured-data', 'schema', 'seo', 'validator'],
    formula: '@context, @type, and required property schema compliance checks',
    isPopular: false,
    iconName: 'ShieldCheck',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  }
];
