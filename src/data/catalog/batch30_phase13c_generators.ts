import { CalculatorMeta, SubcategoryMeta } from '../../types';

export const BATCH30_SUBCATEGORIES: Omit<SubcategoryMeta, 'count'>[] = [
  { id: 'p13c-sub-gen', categoryId: 'generators', name: 'Advanced Infrastructure, Code & Documentation Generators', slug: 'advanced-infra-code-generators', description: 'vCard business card QR, CSS Grid layouts, HTML email templates, OpenAPI specs, SQL DDL schemas, Docker Compose, and Project READMEs', sortOrder: 25 }
];

export const BATCH30_METADATA: CalculatorMeta[] = [
  // 1. QR Code Business Card Generator
  {
    id: 'vcard-qr-generator',
    name: 'vCard & Contact Card QR Code Generator',
    shortDesc: 'Generate structured vCard 3.0 or MECARD contact-card QR code payloads with name, phone, email, and company',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'qr-code', 'vcard', 'mecard', 'contact', 'business-card'],
    formula: 'BEGIN:VCARD\nVERSION:3.0\nN:LastName;FirstName\nFN:FullName\nTEL:Phone\nEMAIL:Email\nEND:VCARD',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 2. Responsive CSS Grid Generator
  {
    id: 'css-grid-generator',
    name: 'Responsive CSS Grid Layout & Template Generator',
    shortDesc: 'Generate customizable CSS Grid layout code with adjustable columns, rows, gap spacing, and template areas',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'css', 'grid', 'layout', 'frontend', 'stylesheet'],
    formula: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(...)); grid-gap: ...;',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 3. HTML Email Template Generator
  {
    id: 'email-template-generator',
    name: 'Responsive HTML Email Template Generator',
    shortDesc: 'Generate email-client-safe, table-structured HTML email templates with header, banner, call-to-action button, and footer',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'html', 'email', 'template', 'marketing', 'newsletter'],
    formula: 'Table-based inline-CSS email boilerplate architecture',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 4. OpenAPI Specification Generator
  {
    id: 'openapi-spec-generator',
    name: 'OpenAPI 3.0 / Swagger Specification Generator',
    shortDesc: 'Generate valid OpenAPI 3.0 YAML or JSON specification snippets from endpoint paths, methods, and parameters',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'openapi', 'swagger', 'api', 'yaml', 'json', 'developer'],
    formula: 'OpenAPI 3.0.0 schema template construction',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 5. SQL Database Schema Generator
  {
    id: 'sql-schema-generator',
    name: 'SQL Database Schema & DDL Generator',
    shortDesc: 'Generate production-ready SQL DDL statements (CREATE TABLE, PRIMARY KEY, FOREIGN KEY, INDEX) for PostgreSQL/MySQL',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'sql', 'schema', 'ddl', 'database', 'postgres', 'mysql'],
    formula: 'Relational table DDL syntax composition',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 6. Docker Compose File Generator
  {
    id: 'docker-compose-generator',
    name: 'Docker Compose YAML Configuration Generator',
    shortDesc: 'Generate multi-container Docker Compose configuration files with services, ports, environment variables, networks, and volumes',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'docker', 'docker-compose', 'yaml', 'devops', 'containers'],
    formula: 'Docker Compose file version 3.8 specification syntax',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  },
  // 7. Project README Generator
  {
    id: 'project-readme-generator',
    name: 'Professional Project README Markdown Generator',
    shortDesc: 'Generate comprehensive, structured Markdown README documentation with badges, installation, usage, API, and license sections',
    category: 'generators',
    subcategoryId: 'p13c-sub-gen',
    tags: ['generator', 'markdown', 'readme', 'documentation', 'github', 'developer'],
    formula: 'Standard GitHub README section template assembly',
    isPopular: false,
    iconName: 'Sparkles',
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF'
  }
];
