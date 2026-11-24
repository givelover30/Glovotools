import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH23_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  {
    id: 'guides-science',
    categoryId: 'guides',
    name: 'Science & Mathematics References',
    slug: 'science-math-guides',
    description: 'Periodic table of elements, mathematical formulas, and scientific constants',
    sortOrder: 1
  },
  {
    id: 'guides-dev',
    categoryId: 'guides',
    name: 'Developer & Web References',
    slug: 'dev-guides',
    description: 'HTTP status codes, Markdown syntax, CSS Flexbox/Grid, and SQL commands',
    sortOrder: 2
  },
  {
    id: 'guides-general',
    categoryId: 'guides',
    name: 'General & Engineering References',
    slug: 'general-guides',
    description: 'ASCII & Unicode character maps, programming syntax, unit conversion factors, and paper sizes',
    sortOrder: 3
  }
];

export const BATCH23_METADATA: CalculatorMeta[] = [
  // 1. Periodic Table
  {
    id: 'periodic-table-reference',
    name: 'Periodic Table of Chemical Elements Reference',
    shortDesc: 'Searchable chemical elements reference containing atomic numbers, symbols, atomic weights, categories, and properties',
    category: 'guides',
    subcategoryId: 'guides-science',
    tags: ['guides', 'science', 'chemistry', 'periodic-table', 'elements', 'reference'],
    formula: 'Atomic Number & Mass Number properties catalog',
    isPopular: true,
    iconName: 'Atom',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF'
  },
  // 2. Math Formulas
  {
    id: 'math-formulas-reference',
    name: 'Mathematical Formulas & Constants Cheat Sheet',
    shortDesc: 'Comprehensive algebra, geometry, trigonometry, and calculus formulas alongside fundamental physical and mathematical constants',
    category: 'guides',
    subcategoryId: 'guides-science',
    tags: ['guides', 'math', 'algebra', 'geometry', 'calculus', 'constants', 'formulas'],
    formula: 'Mathematical equations and physical constants catalog',
    isPopular: true,
    iconName: 'Binary',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. HTTP Status Codes
  {
    id: 'http-status-reference',
    name: 'HTTP Status Codes & API Response Reference',
    shortDesc: 'Complete reference for HTTP status codes (1xx informational, 2xx success, 3xx redirection, 4xx client errors, 5xx server errors)',
    category: 'guides',
    subcategoryId: 'guides-dev',
    tags: ['guides', 'http', 'api', 'status-codes', 'web', 'developer'],
    formula: 'RFC 7231 / RFC 9110 status code classification',
    isPopular: true,
    iconName: 'Globe',
    iconColor: '#059669',
    iconBg: '#ECFDF5'
  },
  // 4. Markdown Syntax
  {
    id: 'markdown-syntax-reference',
    name: 'Markdown Syntax & Formatting Cheat Sheet',
    shortDesc: 'Quick reference guide for Markdown syntax including headers, bold/italics, lists, links, code blocks, tables, and blockquotes',
    category: 'guides',
    subcategoryId: 'guides-dev',
    tags: ['guides', 'markdown', 'formatting', 'syntax', 'docs', 'cheatsheet'],
    formula: 'CommonMark Markdown specification standard',
    isPopular: false,
    iconName: 'FileText',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF'
  },
  // 5. ASCII & Unicode
  {
    id: 'ascii-unicode-reference',
    name: 'ASCII & Unicode Character Map Reference',
    shortDesc: 'Character reference table mapping decimal, hexadecimal, binary, and HTML entities for ASCII and Unicode symbols',
    category: 'guides',
    subcategoryId: 'guides-general',
    tags: ['guides', 'ascii', 'unicode', 'characters', 'hex', 'binary'],
    formula: 'Character code point mapping tables',
    isPopular: false,
    iconName: 'Code',
    iconColor: '#D97706',
    iconBg: '#FFFBEB'
  },
  // 6. CSS Flexbox & Grid
  {
    id: 'css-flex-grid-reference',
    name: 'CSS Flexbox & CSS Grid Cheat Sheet',
    shortDesc: 'Visual properties cheat sheet for container and item rules in CSS Flexbox and CSS Grid layout systems',
    category: 'guides',
    subcategoryId: 'guides-dev',
    tags: ['guides', 'css', 'flexbox', 'grid', 'web-design', 'layout'],
    formula: 'W3C CSS Flexible Box and Grid Layout Module specifications',
    isPopular: true,
    iconName: 'Layout',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF'
  },
  // 7. Unit Conversion Factors
  {
    id: 'unit-conversion-factors-reference',
    name: 'Standard Unit Conversion Factors Reference',
    shortDesc: 'Reference table for converting length, mass, temperature, area, volume, pressure, and energy units',
    category: 'guides',
    subcategoryId: 'guides-general',
    tags: ['guides', 'units', 'conversion', 'metrics', 'imperial', 'reference'],
    formula: 'Standard SI and Imperial dimensional multipliers',
    isPopular: false,
    iconName: 'ArrowRightLeft',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA'
  },
  // 8. Programming Syntax
  {
    id: 'programming-syntax-reference',
    name: 'Programming Language Syntax Cheat Sheet',
    shortDesc: 'Side-by-side syntax comparison across JavaScript, Python, TypeScript, Java, and C++ for loops, functions, and arrays',
    category: 'guides',
    subcategoryId: 'guides-general',
    tags: ['guides', 'programming', 'syntax', 'javascript', 'python', 'typescript'],
    formula: 'Cross-language syntax equivalents catalog',
    isPopular: false,
    iconName: 'Terminal',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2'
  },
  // 9. SQL Commands
  {
    id: 'sql-commands-reference',
    name: 'Common SQL Commands & Queries Reference',
    shortDesc: 'Reference guide for SQL DDL/DML commands (SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, WHERE, ORDER BY)',
    category: 'guides',
    subcategoryId: 'guides-dev',
    tags: ['guides', 'sql', 'database', 'queries', 'mysql', 'postgresql'],
    formula: 'ANSI SQL standard query reference syntax',
    isPopular: false,
    iconName: 'Database',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED'
  },
  // 10. Paper Sizes & Resolution
  {
    id: 'paper-resolution-reference',
    name: 'Paper Sizes & Screen Resolution Reference',
    shortDesc: 'Dimensions for international paper sizes (A4, Letter, Legal) and standard screen display resolutions (HD, 4K, mobile)',
    category: 'guides',
    subcategoryId: 'guides-general',
    tags: ['guides', 'paper', 'resolution', 'dimensions', 'print', 'screen'],
    formula: 'ISO 216 paper sizes and pixel resolution dimensions',
    isPopular: false,
    iconName: 'Maximize2',
    iconColor: '#C026D3',
    iconBg: '#FDF4FF'
  }
];
