import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH21_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'checkers-data',
    categoryId: 'checkers',
    name: 'Data & Code Validators',
    slug: 'data-validators',
    description: 'JSON syntax checkers, HTML structure validators, and Regular Expression testers',
    sortOrder: 1
  },
  {
    id: 'checkers-net',
    categoryId: 'checkers',
    name: 'Network & Web Checkers',
    slug: 'network-checkers',
    description: 'Email address syntax checkers, URL hyperlink validators, and IP CIDR subnet checkers',
    sortOrder: 2
  },
  {
    id: 'checkers-security',
    categoryId: 'checkers',
    name: 'Security & Financial Validators',
    slug: 'security-validators',
    description: 'Password strength checkers, credit card Luhn algorithm validators, IBAN bank account checkers, and ISBN barcode validators',
    sortOrder: 3
  }
];

export const BATCH21_METADATA: CalculatorMeta[] = [
  // 1. JSON Validator
  {
    id: 'json-validator',
    name: 'JSON Syntax & Structure Validator',
    shortDesc: 'Validate JSON strings in real-time, detect syntax errors with line/column pointers, format/prettify, and copy results',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'json', 'validator', 'syntax', 'formatter', 'developer'],
    formula: 'JSON.parse(input) syntax & depth verification',
    isPopular: true,
    iconName: 'FileCode',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 2. Email Validator
  {
    id: 'email-validator',
    name: 'Email Address Syntax & Domain Checker',
    shortDesc: 'Validate email address RFC syntax, check domain MX records structure, test disposable email filters, and verify format',
    category: 'checkers',
    subcategoryId: 'checkers-net',
    tags: ['checkers', 'email', 'validator', 'domain', 'mx', 'syntax'],
    formula: 'RFC 5322 regex and domain syntax validation',
    isPopular: true,
    iconName: 'Mail',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 3. URL Validator
  {
    id: 'url-validator',
    name: 'URL & Hyperlink Syntax Validator',
    shortDesc: 'Verify URL formatting, protocol scheme (HTTP/HTTPS), domain validity, path structure, and query parameters',
    category: 'checkers',
    subcategoryId: 'checkers-net',
    tags: ['checkers', 'url', 'link', 'validator', 'http', 'domain'],
    formula: 'new URL(input) protocol and hostname analysis',
    isPopular: false,
    iconName: 'Link',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 4. IBAN Validator
  {
    id: 'iban-validator',
    name: 'IBAN & Bank Account Number Validator',
    shortDesc: 'Validate International Bank Account Number (IBAN) checksum modulo-97 algorithm across countries',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'iban', 'bank', 'account', 'finance', 'mod97'],
    formula: 'MOD-97 checksum verification per ISO 13616',
    isPopular: false,
    iconName: 'Building2',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 5. Password Strength Checker
  {
    id: 'password-strength-checker',
    name: 'Password Strength & Entropy Checker',
    shortDesc: 'Evaluate password entropy bits, character variety, crack time estimations, and security vulnerability warnings',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'password', 'entropy', 'security', 'strength', 'hash'],
    formula: 'Entropy = L × log2(R) bits estimation',
    isPopular: true,
    iconName: 'ShieldCheck',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 6. IP Subnet Validator
  {
    id: 'ip-subnet-validator',
    name: 'IPv4 / IPv6 & CIDR Subnet Validator',
    shortDesc: 'Validate IP address formats, calculate CIDR subnet masks, broadcast addresses, and usable host range calculations',
    category: 'checkers',
    subcategoryId: 'checkers-net',
    tags: ['checkers', 'ip', 'cidr', 'ipv4', 'ipv6', 'subnet', 'network'],
    formula: 'Bitwise subnet mask and IP range computation',
    isPopular: false,
    iconName: 'Network',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 7. Credit Card Validator
  {
    id: 'credit-card-validator',
    name: 'Credit Card Luhn Algorithm Validator',
    shortDesc: 'Verify credit card number validity using the Luhn checksum algorithm, detect card network (Visa, Mastercard, Amex, etc.)',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'credit-card', 'luhn', 'visa', 'mastercard', 'validator'],
    formula: 'Luhn mod-10 checksum validation algorithm',
    isPopular: true,
    iconName: 'CreditCard',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 8. HTML Tag Validator
  {
    id: 'html-tag-validator',
    name: 'HTML / XML Tag & Structure Validator',
    shortDesc: 'Check HTML/XML markup for unclosed tags, mismatched elements, tag nesting syntax errors, and DOM validity',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'html', 'xml', 'tags', 'dom', 'validator', 'syntax'],
    formula: 'Stack-based tag opening and closing balance check',
    isPopular: false,
    iconName: 'Code',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  // 9. RegEx Matcher
  {
    id: 'regex-tester',
    name: 'Regular Expression (RegEx) Matcher',
    shortDesc: 'Test regular expressions against sample text in real-time, highlight matched capture groups, and check flags',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'regex', 'regexp', 'tester', 'matcher', 'developer'],
    formula: 'RegExp.exec() and match group extraction',
    isPopular: true,
    iconName: 'SearchCode',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  },
  // 10. ISBN Validator
  {
    id: 'isbn-validator',
    name: 'ISBN-10 & ISBN-13 Barcode Validator',
    shortDesc: 'Validate International Standard Book Numbers (ISBN) checksums for books, textbooks, and publications',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'isbn', 'barcode', 'book', 'validator', 'checksum'],
    formula: 'ISBN-10 mod-11 & ISBN-13 mod-10 weight algorithm',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // Phase 9B Checkers (10 new)
  {
    id: 'yaml-validator',
    name: 'YAML Syntax & Structure Validator',
    shortDesc: 'Validate YAML configuration files, check indentation, key-value syntax, and report warnings',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'yaml', 'validator', 'syntax', 'config', 'developer'],
    formula: 'Indentation and key-value colon syntax verification',
    isPopular: true,
    iconName: 'FileCode',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  {
    id: 'toml-validator',
    name: 'TOML Configuration Validator',
    shortDesc: 'Verify TOML configuration files, check table headers [...] and key = value assignments',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'toml', 'validator', 'config', 'syntax'],
    formula: 'TOML table header and assignment parsing',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  {
    id: 'csv-validator',
    name: 'CSV File & Column Consistency Validator',
    shortDesc: 'Check tabular CSV files for row length consistency, comma delimiters, and missing columns',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'csv', 'validator', 'table', 'data'],
    formula: 'Row column count consistency verification',
    isPopular: false,
    iconName: 'Table',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  {
    id: 'markdown-syntax-checker',
    name: 'Markdown Syntax & Formatting Checker',
    shortDesc: 'Analyze markdown formatting markers, lists, and links for structural soundness and balance',
    category: 'checkers',
    subcategoryId: 'checkers-data',
    tags: ['checkers', 'markdown', 'syntax', 'formatter', 'docs'],
    formula: 'Marker balancing and list structure analysis',
    isPopular: false,
    iconName: 'BookOpen',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  {
    id: 'phone-number-checker',
    name: 'Phone Number Format & E.164 Checker',
    shortDesc: 'Validate international digit length, country codes, and E.164 phone number formatting',
    category: 'checkers',
    subcategoryId: 'checkers-net',
    tags: ['checkers', 'phone', 'validator', 'e164', 'telecom'],
    formula: 'Digit length and country code pattern analysis',
    isPopular: false,
    iconName: 'Phone',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  {
    id: 'datetime-format-validator',
    name: 'Date & Time Format Validator',
    shortDesc: 'Parse and validate ISO 8601, RFC 2822, and general date/time string formats',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'date', 'time', 'iso8601', 'validator'],
    formula: 'Date.parse() reliability and component extraction',
    isPopular: false,
    iconName: 'Calendar',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  {
    id: 'color-contrast-checker',
    name: 'Color Contrast Accessibility Checker',
    shortDesc: 'Evaluate WCAG 2.1 AA and AAA contrast ratios for foreground and background colors',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'accessibility', 'wcag', 'contrast', 'color', 'ux'],
    formula: 'WCAG 2.1 relative luminance and contrast ratio',
    isPopular: true,
    iconName: 'Eye',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  {
    id: 'mime-signature-checker',
    name: 'File Type & MIME Signature Checker',
    shortDesc: 'Identify file formats and MIME types using binary magic number hexadecimal headers',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'mime', 'signature', 'binary', 'file-type', 'security'],
    formula: 'Magic number byte sequence matching',
    isPopular: false,
    iconName: 'ShieldAlert',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF'
  },
  {
    id: 'duplicate-file-checker',
    name: 'Duplicate File & Name Checker',
    shortDesc: 'Identify duplicate items, redundant files, and repeated names within text lists',
    category: 'checkers',
    subcategoryId: 'checkers-security',
    tags: ['checkers', 'duplicate', 'files', 'names', 'cleanup'],
    formula: 'Hash frequency and string occurrence counting',
    isPopular: false,
    iconName: 'Files',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  {
    id: 'seo-checklist-checker',
    name: 'Website SEO Checklist Checker',
    shortDesc: 'Evaluate title lengths, meta descriptions, H1 tags, and on-page SEO best practices',
    category: 'checkers',
    subcategoryId: 'checkers-net',
    tags: ['checkers', 'seo', 'meta', 'title', 'audit', 'marketing'],
    formula: 'On-page SEO factor scoring (0-100)',
    isPopular: true,
    iconName: 'Globe',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF'
  }
];
