import type { Language } from '../i18n/translations.ts';
import {
  buildPdfFileName,
  downloadPrintablePdf,
  generatePrintableReportPdf,
  type PdfReportBreakdownItem,
  type PdfReportChartItem,
  type PdfReportMetricCard,
  type PdfReportNote,
  type PdfReportPrimaryCard,
  type PdfReportTable,
  type PrintableReportData
} from './pdfReportGenerator.ts';

export { buildPdfFileName, downloadPrintablePdf, generatePrintableReportPdf };
export type { PrintableReportData };

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
  'pt-BR': 'pt-BR',
  de: 'de-DE',
  it: 'it-IT',
  ja: 'ja-JP',
  zh: 'zh-CN',
  'zh-CN': 'zh-CN',
  pl: 'pl-PL'
};

export interface PrintableInputRow {
  label: string;
  value: string;
}

export interface PrintPreviewPayload {
  calculatorName: string;
  categoryLine: string;
  subtitle: string;
  generatedOnLabel: string;
  timestamp: string;
  inputsHeading: string;
  footerText: string;
  language: Language;
  inputs: PrintableInputRow[];
  htmlDocument: string;
  fileBaseName: string;
  /** Structured report snapshot consumed by the reusable pdf-lib PDF report generator */
  reportData: PrintableReportData;
}

export interface TriggerPrintOptions {
  /** Element that initiated the print action (used to resolve its owning workspace reliably) */
  triggerElement?: HTMLElement | null;
  /** 'workspace' prints inputs + results + tables/charts; 'result-only' omits file dropzones */
  scope?: 'workspace' | 'result-only';
  /** Active UI language for timestamp formatting */
  language?: Language;
  /** Optional document title applied during printing (e.g. for Save as PDF filename) */
  documentTitle?: string;
  /** Invoked ONLY if the host browser sandbox silently blocks window.print() inside an embedded iframe */
  onSandboxBlocked?: (payload: PrintPreviewPayload) => void;
}

export interface PrintExecutionResult {
  status: 'printed' | 'fallback-main' | 'sandbox-blocked' | 'no-target';
  calculatorName?: string;
  inputCount: number;
  usedIframe: boolean;
}

const PRINT_FRAME_ID = 'glovotools-print-frame';

/**
 * Formats a date/time string localized to the active Glovotools language.
 */
export function formatPrintTimestamp(language: Language, date: Date = new Date()): string {
  const locale = LOCALE_MAP[language] || 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function isEmbeddedIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    // Cross-origin frame access throws SecurityError -> definitely embedded
    return true;
  }
}

function slugifyFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'glovotools-result';
}

function collectSameOriginCss(): string {
  if (typeof document === 'undefined') return '';
  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        chunks.push(rule.cssText);
      }
    } catch {
      // Skip cross-origin stylesheets (e.g. Google Fonts) safely
    }
  }

  return chunks.join('\n');
}

const ISOLATED_PRINT_STYLES = `
:root,
html,
html.dark,
body {
  color-scheme: light !important;
  --bg-primary: #ffffff !important;
  --bg-surface: #ffffff !important;
  --bg-secondary: #f8fafc !important;
  --bg-elevated: #ffffff !important;
  --bg-hover: #f8fafc !important;
  --input-bg: #ffffff !important;
  --text-primary: #0f172a !important;
  --text-secondary: #334155 !important;
  --text-tertiary: #475569 !important;
  --border-main: #cbd5e1 !important;
  --border-subtle: #e2e8f0 !important;
  --border-strong: #94a3b8 !important;
  --accent: #0f766e !important;
  --result-bg: #f0fdf4 !important;
  --result-border: #86efac !important;
  --result-text: #064e3b !important;
  --result-text-secondary: #065f46 !important;
  --result-icon: #047857 !important;
  --result-badge-bg: #dcfce7 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10.5pt;
  line-height: 1.48;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  box-shadow: none !important;
  text-shadow: none !important;
  animation: none !important;
  transition: none !important;
}

.glovo-print-sheet {
  max-width: 820px;
  margin: 0 auto;
  padding: 18px 22px 24px;
  background: #ffffff !important;
  color: #0f172a !important;
}

.glovo-print-doc-header {
  display: block !important;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 2px solid #0f172a;
  break-after: avoid;
  page-break-after: avoid;
}

.glovo-print-brand-row {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.glovo-print-brand {
  display: flex !important;
  align-items: center;
  gap: 9px;
}

.glovo-print-brand-name {
  font-size: 13.5pt;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.15;
}

.glovo-print-category {
  font-size: 8.5pt;
  font-weight: 600;
  color: #475569;
  margin-top: 2px;
}

.glovo-print-meta {
  text-align: right;
}

.glovo-print-meta-label {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.glovo-print-meta-value {
  font-size: 9pt;
  font-weight: 600;
  color: #0f172a;
  margin-top: 2px;
}

.glovo-print-title {
  font-size: 16.5pt !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  line-height: 1.25 !important;
  margin: 0 !important;
}

.glovo-print-subtitle {
  font-size: 9.25pt !important;
  color: #475569 !important;
  margin: 4px 0 0 0 !important;
}

.glovo-print-inputs-summary {
  display: block !important;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  background: #f8fafc !important;
  break-inside: avoid;
  page-break-inside: avoid;
}

.glovo-print-section-heading {
  font-size: 9.5pt !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #334155 !important;
  margin: 0 0 8px 0 !important;
  padding-bottom: 5px;
  border-bottom: 1px solid #e2e8f0;
}

.glovo-print-kv-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 6px 18px !important;
}

.glovo-print-kv-item {
  display: flex !important;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px dotted #cbd5e1;
  font-size: 9.5pt;
}

.glovo-print-kv-label {
  color: #334155;
  font-weight: 500;
}

.glovo-print-kv-value {
  color: #0f172a;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-align: right;
  word-break: break-word;
}

.glovo-print-body {
  display: block !important;
}

.glovo-print-body > * + * {
  margin-top: 14px;
}

.glovo-print-results-panel,
.lg\\:sticky {
  position: static !important;
  top: auto !important;
}

.ui-panel {
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  padding: 14px !important;
  overflow: visible !important;
}

.glovo-print-primary-card {
  background-color: #f0fdf4 !important;
  border: 1.5px solid #86efac !important;
  color: #064e3b !important;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.print-avoid-break {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.glovo-print-readonly-val {
  display: inline-block;
  font-weight: 600;
  color: #0f172a;
  padding: 2px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f8fafc;
}

.glovo-print-keep-card {
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  color: #0f172a !important;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.no-print,
[data-print-empty="true"],
button:not(.print-keep),
input[type="range"],
input[type="file"],
a.ui-btn-result {
  display: none !important;
}

.overflow-x-auto,
.overflow-y-auto,
pre {
  overflow: visible !important;
  max-height: none !important;
}

pre {
  white-space: pre-wrap !important;
  word-break: break-word !important;
  border: 1px solid #cbd5e1 !important;
  background: #f8fafc !important;
  color: #0f172a !important;
  padding: 10px !important;
  border-radius: 6px !important;
  font-size: 8.5pt !important;
}

table,
.ui-table {
  width: 100% !important;
  border-collapse: collapse !important;
  table-layout: auto !important;
  font-size: 9pt !important;
  page-break-inside: auto !important;
}

thead {
  display: table-header-group !important;
}

tfoot {
  display: table-footer-group !important;
}

tr {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

th,
td {
  border-bottom: 1px solid #cbd5e1 !important;
  padding: 6px 8px !important;
  color: #0f172a !important;
  text-align: left;
}

th {
  background-color: #f1f5f9 !important;
  font-weight: 700 !important;
  border-bottom: 1.5px solid #94a3b8 !important;
}

svg,
img {
  max-width: 100% !important;
  height: auto;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.glovo-print-doc-footer {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #cbd5e1;
  font-size: 8pt;
  color: #64748b;
  break-inside: avoid;
  page-break-inside: avoid;
}

@media print {
  @page {
    margin: 14mm 15mm;
  }

  .glovo-print-sheet {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .glovo-print-doc-header,
  .glovo-print-inputs-summary,
  .glovo-print-body {
    display: block !important;
  }

  .glovo-print-doc-footer {
    display: flex !important;
  }

  .glovo-print-keep-card {
    display: flex !important;
  }
}
`;

function cleanLabelText(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(/\*+$/, '').trim();
}

function extractInputRows(
  workspace: HTMLElement,
  scope: 'workspace' | 'result-only',
  language: Language
): PrintableInputRow[] {
  if (scope === 'result-only') return [];

  const rows: PrintableInputRow[] = [];
  const seen = new Set<string>();
  const addRow = (label: string, value: string) => {
    const cleanLabel = cleanLabelText(label);
    const cleanVal = value.replace(/\s+/g, ' ').trim();
    if (!cleanLabel || !cleanVal) return;
    const key = `${cleanLabel.toLowerCase()}::${cleanVal.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ label: cleanLabel, value: cleanVal });
  };

  // 1. Prefer pre-formatted structured input rows (e.g. EngineCalculatorView)
  const prebuiltItems = workspace.querySelectorAll<HTMLElement>(
    '.glovo-print-inputs-summary .glovo-print-kv-item'
  );
  if (prebuiltItems.length > 0) {
    prebuiltItems.forEach((item) => {
      const lbl = item.querySelector('.glovo-print-kv-label')?.textContent || '';
      const val = item.querySelector('.glovo-print-kv-value')?.textContent || '';
      addRow(lbl, val);
    });
    if (rows.length > 0) return rows;
  }

  // 2. Extract from ToolInputPanel or ToolFieldGroup controls (custom calculators)
  const inputScope =
    workspace.querySelector<HTMLElement>('.glovo-print-input-panel') ||
    workspace.querySelector<HTMLElement>('.glovo-print-inputs-col');
  if (!inputScope || inputScope.closest('[data-print-dropzone="true"]')) {
    return rows;
  }

  const fieldGroups = inputScope.querySelectorAll<HTMLElement>('.glovo-field-group');
  fieldGroups.forEach((group) => {
    const labelEl = group.querySelector('label');
    const label = labelEl?.textContent || '';
    if (!label.trim()) return;

    // Optional unit shown in field header row
    const headerUnit =
      group.firstElementChild?.querySelector('span.font-mono')?.textContent?.trim() || '';

    // Segmented tablist control
    const activeTab = group.querySelector<HTMLElement>('[role="tablist"] [role="tab"][aria-selected="true"]');
    if (activeTab?.textContent?.trim()) {
      addRow(label, activeTab.textContent.trim());
      return;
    }

    // Select dropdown
    const selectEl = group.querySelector<HTMLSelectElement>('select');
    if (selectEl) {
      const optText = selectEl.options[selectEl.selectedIndex]?.textContent?.trim() || selectEl.value;
      if (optText) addRow(label, optText);
      return;
    }

    // Textarea
    const textareaEl = group.querySelector<HTMLTextAreaElement>('textarea');
    if (textareaEl) {
      const val = textareaEl.value.trim();
      if (val) {
        addRow(label, val.length > 180 ? `${val.slice(0, 180)}…` : val);
      }
      return;
    }

    // Input controls (excluding range/hidden/file)
    const inputEls = Array.from(
      group.querySelectorAll<HTMLInputElement>(
        'input:not([type="range"]):not([type="hidden"]):not([type="file"])'
      )
    );
    if (inputEls.length === 0) return;

    const formattedValues: string[] = [];
    for (const input of inputEls) {
      if (input.type === 'checkbox') {
        formattedValues.push(input.checked ? (language === 'es' ? 'Sí' : 'Yes') : 'No');
        continue;
      }
      if (input.type === 'radio') {
        if (input.checked) {
          const radioLabel = input.closest('label')?.textContent?.trim() || input.value;
          formattedValues.push(radioLabel);
        }
        continue;
      }

      const rawVal = input.value.trim();
      if (!rawVal) continue;

      // Detect inline currency/unit adornment inside .relative wrapper
      const wrapper = input.parentElement;
      let prefix = '';
      let suffix = '';
      if (wrapper && wrapper.classList.contains('relative')) {
        const spans = Array.from(wrapper.children).filter(
          (el): el is HTMLElement => el.tagName === 'SPAN' && Boolean(el.textContent?.trim())
        );
        for (const sp of spans) {
          const cls = sp.className || '';
          const txt = sp.textContent?.trim() || '';
          if (cls.includes('left-')) prefix = txt;
          else if (cls.includes('right-')) suffix = txt;
        }
      }

      let display = rawVal;
      if (prefix && !display.startsWith(prefix)) {
        display = prefix.length > 2 ? `${prefix} ${display}` : `${prefix}${display}`;
      }
      if (suffix && !display.endsWith(suffix)) {
        display = suffix === '%' ? `${display}%` : `${display} ${suffix}`;
      } else if (!prefix && !suffix && headerUnit && !display.includes(headerUnit)) {
        display = headerUnit === '%' ? `${display}%` : `${display} ${headerUnit}`;
      }

      formattedValues.push(display);
    }

    if (formattedValues.length > 0) {
      addRow(label, formattedValues.join(' / '));
    }
  });

  // Also check standalone checkboxes inside inputScope not wrapped in .glovo-field-group
  const checkboxes = inputScope.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    if (cb.closest('.glovo-field-group')) return;
    const lbl = cb.closest('label')?.textContent?.trim() || cb.getAttribute('aria-label') || '';
    if (lbl) {
      addRow(lbl, cb.checked ? (language === 'es' ? 'Sí' : 'Yes') : 'No');
    }
  });

  return rows;
}

function sanitizeAndSyncClone(sourceRoot: HTMLElement, targetDoc: Document): HTMLElement {
  const cloned = targetDoc.importNode(sourceRoot, true) as HTMLElement;

  // 1. Rasterize live <canvas> charts into crisp <img> snapshots
  const srcCanvases = Array.from(sourceRoot.querySelectorAll('canvas'));
  const dstCanvases = Array.from(cloned.querySelectorAll('canvas'));
  srcCanvases.forEach((srcCanvas, idx) => {
    const dstCanvas = dstCanvases[idx];
    if (!dstCanvas || !dstCanvas.parentNode) return;
    try {
      const dataUrl = srcCanvas.toDataURL('image/png');
      const img = targetDoc.createElement('img');
      img.src = dataUrl;
      img.alt = srcCanvas.getAttribute('aria-label') || 'Calculation chart';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      dstCanvas.parentNode.replaceChild(img, dstCanvas);
    } catch {
      // Tainted canvas cannot be exported; leave intact
    }
  });

  // 2. Lock live <svg> chart dimensions so D3 / Recharts charts never collapse in print
  const srcSvgs = Array.from(sourceRoot.querySelectorAll('svg'));
  const dstSvgs = Array.from(cloned.querySelectorAll('svg'));
  srcSvgs.forEach((srcSvg, idx) => {
    const dstSvg = dstSvgs[idx];
    if (!dstSvg) return;
    try {
      const rect = srcSvg.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        if (!dstSvg.getAttribute('viewBox')) {
          dstSvg.setAttribute('viewBox', `0 0 ${Math.round(rect.width)} ${Math.round(rect.height)}`);
        }
        if (!dstSvg.getAttribute('width') || dstSvg.getAttribute('width') === '100%') {
          dstSvg.style.width = '100%';
          dstSvg.style.maxWidth = `${Math.round(rect.width)}px`;
        }
        if (!dstSvg.getAttribute('height') || dstSvg.getAttribute('height') === '100%') {
          dstSvg.style.height = `${Math.round(rect.height)}px`;
        }
      }
    } catch {
      // Ignore measurement errors in non-layout environments
    }
  });

  // 3. Synchronize live form values in non-split tools (Unit Converter, Planners, Trackers)
  //    and replace interactive controls with crisp read-only spans
  const srcControls = Array.from(sourceRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
  const dstControls = Array.from(cloned.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));

  srcControls.forEach((srcCtrl, idx) => {
    const dstCtrl = dstControls[idx];
    if (!dstCtrl || !dstCtrl.parentNode) return;

    if (srcCtrl instanceof HTMLInputElement && (srcCtrl.type === 'range' || srcCtrl.type === 'hidden' || srcCtrl.type === 'file')) {
      dstCtrl.remove();
      return;
    }

    let textVal = '';
    if (srcCtrl instanceof HTMLSelectElement) {
      textVal = srcCtrl.options[srcCtrl.selectedIndex]?.textContent?.trim() || srcCtrl.value;
    } else if (srcCtrl instanceof HTMLInputElement && (srcCtrl.type === 'checkbox' || srcCtrl.type === 'radio')) {
      textVal = srcCtrl.checked ? '✓' : '—';
    } else {
      textVal = srcCtrl.value.trim();
    }

    const span = targetDoc.createElement('span');
    span.className = 'glovo-print-readonly-val';
    span.textContent = textVal || '—';
    dstCtrl.parentNode.replaceChild(span, dstCtrl);
  });

  // 4. Convert button.print-keep cards into clean <div> elements so they render as printable cards
  const keepButtons = Array.from(cloned.querySelectorAll<HTMLButtonElement>('button.print-keep'));
  keepButtons.forEach((btn) => {
    if (!btn.parentNode) return;
    const div = targetDoc.createElement('div');
    div.className = `${btn.className} glovo-print-keep-card`.trim();
    while (btn.firstChild) {
      div.appendChild(btn.firstChild);
    }
    btn.parentNode.replaceChild(div, btn);
  });

  // 5. Remove all excluded UI chrome & interactive controls
  const removeSelectors = [
    'script',
    'iframe',
    'noscript',
    '.no-print',
    '[data-print-empty="true"]',
    '[data-print-doc-header="true"]',
    '[data-print-doc-footer="true"]',
    '.glovo-print-inputs-summary',
    'button',
    'a.ui-btn-result',
    '[role="tooltip"]'
  ];
  cloned.querySelectorAll(removeSelectors.join(',')).forEach((el) => el.remove());

  return cloned;
}

function createGlovotoolsBrandSvg(doc: Document): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = doc.createElementNS(ns, 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 28 28');
  svg.setAttribute('fill', 'none');

  const rect = doc.createElementNS(ns, 'rect');
  rect.setAttribute('width', '28');
  rect.setAttribute('height', '28');
  rect.setAttribute('rx', '7');
  rect.setAttribute('fill', '#159B69');
  svg.appendChild(rect);

  const path = doc.createElementNS(ns, 'path');
  path.setAttribute('d', 'M8.5 9.5H19.5M8.5 14H15.5M8.5 18.5H13.5');
  path.setAttribute('stroke', '#FFFFFF');
  path.setAttribute('stroke-width', '2.2');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  const circle = doc.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '18.5');
  circle.setAttribute('cy', '17.5');
  circle.setAttribute('r', '2.5');
  circle.setAttribute('fill', '#FFFFFF');
  svg.appendChild(circle);

  return svg;
}

/**
 * Builds a complete, self-contained, isolated printable HTML document from the active workspace.
 */
export function buildPrintablePayload(
  workspace: HTMLElement,
  options: {
    scope: 'workspace' | 'result-only';
    language: Language;
    documentTitle?: string;
  }
): PrintPreviewPayload {
  const { scope, language, documentTitle } = options;
  const headerEl = workspace.querySelector<HTMLElement>('[data-print-doc-header="true"]');
  const footerEl = workspace.querySelector<HTMLElement>('[data-print-doc-footer="true"]');

  const calculatorName =
    documentTitle?.trim() ||
    headerEl?.getAttribute('data-print-title')?.trim() ||
    headerEl?.querySelector('.glovo-print-title')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    'Calculation Result';

  const categoryLine =
    headerEl?.getAttribute('data-print-category')?.trim() ||
    headerEl?.querySelector('.glovo-print-category')?.textContent?.trim() ||
    '';

  const subtitle =
    headerEl?.getAttribute('data-print-subtitle')?.trim() ||
    headerEl?.querySelector('.glovo-print-subtitle')?.textContent?.trim() ||
    '';

  const generatedOnLabel =
    headerEl?.getAttribute('data-print-generated-label')?.trim() ||
    headerEl?.querySelector('.glovo-print-meta-label')?.textContent?.trim() ||
    'Generated on';

  const inputsHeading =
    headerEl?.getAttribute('data-print-inputs-label')?.trim() ||
    'Input Values';

  const footerText =
    footerEl?.getAttribute('data-print-footer-text')?.trim() ||
    footerEl?.firstElementChild?.textContent?.trim() ||
    'Calculated with Glovotools';

  const timestamp = formatPrintTimestamp(language, new Date());
  const inputs = extractInputRows(workspace, scope, language);

  // Build isolated print document using safe DOM APIs (no unescaped string HTML interpolation)
  const doc = document.implementation.createHTMLDocument(`${calculatorName} — Glovotools`);
  doc.documentElement.setAttribute('lang', language);

  const metaCharset = doc.createElement('meta');
  metaCharset.setAttribute('charset', 'utf-8');
  doc.head.appendChild(metaCharset);

  const metaViewport = doc.createElement('meta');
  metaViewport.setAttribute('name', 'viewport');
  metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
  doc.head.appendChild(metaViewport);

  // Copy compiled app stylesheets synchronously so all Tailwind utilities apply immediately
  const pageCss = collectSameOriginCss();
  if (pageCss) {
    const appStyle = doc.createElement('style');
    appStyle.textContent = pageCss;
    doc.head.appendChild(appStyle);
  }

  // Append Glovotools clean white-paper print override stylesheet
  const printStyle = doc.createElement('style');
  printStyle.textContent = ISOLATED_PRINT_STYLES;
  doc.head.appendChild(printStyle);

  const sheet = doc.createElement('div');
  sheet.className = 'glovo-print-sheet';

  // 1. Branded Glovotools Header (use div so global @media print header rules never hide it)
  const header = doc.createElement('div');
  header.className = 'glovo-print-doc-header';

  const brandRow = doc.createElement('div');
  brandRow.className = 'glovo-print-brand-row';

  const brand = doc.createElement('div');
  brand.className = 'glovo-print-brand';
  brand.appendChild(createGlovotoolsBrandSvg(doc));

  const brandText = doc.createElement('div');
  const brandName = doc.createElement('div');
  brandName.className = 'glovo-print-brand-name';
  brandName.textContent = 'Glovotools';
  brandText.appendChild(brandName);

  if (categoryLine) {
    const catEl = doc.createElement('div');
    catEl.className = 'glovo-print-category';
    catEl.textContent = categoryLine;
    brandText.appendChild(catEl);
  }
  brand.appendChild(brandText);
  brandRow.appendChild(brand);

  const meta = doc.createElement('div');
  meta.className = 'glovo-print-meta';
  const metaLabel = doc.createElement('div');
  metaLabel.className = 'glovo-print-meta-label';
  metaLabel.textContent = generatedOnLabel;
  const metaVal = doc.createElement('div');
  metaVal.className = 'glovo-print-meta-value';
  metaVal.textContent = timestamp;
  meta.appendChild(metaLabel);
  meta.appendChild(metaVal);
  brandRow.appendChild(meta);

  header.appendChild(brandRow);

  const titleBlock = doc.createElement('div');
  titleBlock.className = 'glovo-print-title-block';
  const h1 = doc.createElement('h1');
  h1.className = 'glovo-print-title';
  h1.textContent = calculatorName;
  titleBlock.appendChild(h1);

  if (subtitle) {
    const subEl = doc.createElement('p');
    subEl.className = 'glovo-print-subtitle';
    subEl.textContent = subtitle;
    titleBlock.appendChild(subEl);
  }
  header.appendChild(titleBlock);
  sheet.appendChild(header);

  // 2. Structured Input Values Summary (only when non-empty inputs were supplied)
  if (inputs.length > 0) {
    const inputsSection = doc.createElement('section');
    inputsSection.className = 'glovo-print-inputs-summary';

    const inputsTitle = doc.createElement('h2');
    inputsTitle.className = 'glovo-print-section-heading';
    inputsTitle.textContent = inputsHeading;
    inputsSection.appendChild(inputsTitle);

    const kvGrid = doc.createElement('div');
    kvGrid.className = 'glovo-print-kv-grid';
    inputs.forEach((row) => {
      const item = doc.createElement('div');
      item.className = 'glovo-print-kv-item';

      const lbl = doc.createElement('span');
      lbl.className = 'glovo-print-kv-label';
      lbl.textContent = row.label;

      const val = doc.createElement('span');
      val.className = 'glovo-print-kv-value';
      val.textContent = row.value;

      item.appendChild(lbl);
      item.appendChild(val);
      kvGrid.appendChild(item);
    });
    inputsSection.appendChild(kvGrid);
    sheet.appendChild(inputsSection);
  }

  // 3. Isolated Calculation Results, Secondary KPIs, Breakdowns, Tables & Charts
  const bodyWrap = doc.createElement('div');
  bodyWrap.className = 'glovo-print-body';

  const resultsCol = workspace.querySelector<HTMLElement>('.glovo-print-results-col');
  const belowBlock = workspace.querySelector<HTMLElement>('.glovo-print-below');

  if (resultsCol) {
    // Split workspace (EngineCalculatorView + 120+ custom calculators + PDF/Doc tools)
    const fallbackNotice = workspace.querySelector<HTMLElement>('[data-testid="synthetic-fallback-notice"]');
    if (fallbackNotice) {
      bodyWrap.appendChild(sanitizeAndSyncClone(fallbackNotice, doc));
    }

    bodyWrap.appendChild(sanitizeAndSyncClone(resultsCol, doc));

    if (belowBlock && belowBlock.textContent?.trim()) {
      bodyWrap.appendChild(sanitizeAndSyncClone(belowBlock, doc));
    }
  } else {
    // Full-width specialized workspaces (UnitConverter, ScientificCalculator, Planners, Trackers)
    const contentClone = sanitizeAndSyncClone(workspace, doc);
    if (scope === 'result-only') {
      contentClone.querySelectorAll('[data-print-dropzone="true"]').forEach((el) => el.remove());
    }
    if (inputs.length > 0) {
      contentClone.querySelectorAll('.glovo-print-input-panel').forEach((el) => el.remove());
    }
    bodyWrap.appendChild(contentClone);
  }

  sheet.appendChild(bodyWrap);

  // 4. Subtle Branded Footer (use div so global @media print footer rules never hide it)
  const footer = doc.createElement('div');
  footer.className = 'glovo-print-doc-footer';
  const leftFoot = doc.createElement('span');
  leftFoot.textContent = footerText;
  const rightFoot = doc.createElement('span');
  rightFoot.textContent = 'glovotools.com';
  footer.appendChild(leftFoot);
  footer.appendChild(rightFoot);
  sheet.appendChild(footer);

  doc.body.appendChild(sheet);

  const htmlDocument = `<!doctype html>\n${doc.documentElement.outerHTML}`;

  const resultsHeading =
    headerEl?.getAttribute('data-print-results-label')?.trim() ||
    'Calculation Result';

  const reportData = extractStructuredReportData(workspace, bodyWrap, {
    calculatorName,
    categoryLine,
    subtitle,
    generatedOnLabel,
    timestamp,
    inputsHeading,
    resultsHeading,
    footerText,
    language,
    inputs,
    scope
  });

  return {
    calculatorName,
    categoryLine,
    subtitle,
    generatedOnLabel,
    timestamp,
    inputsHeading,
    footerText,
    language,
    inputs,
    htmlDocument,
    fileBaseName: buildPdfFileName(calculatorName).replace(/\.pdf$/i, ''),
    reportData
  };
}

function normText(el: Element | null | undefined): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts structured, calculator-agnostic report sections (primary result, KPI cards,
 * breakdowns, charts/SVGs, complete schedules/tables, formulas/notes) from any Glovotools workspace.
 */
function extractStructuredReportData(
  workspace: HTMLElement,
  sanitizedBody: HTMLElement,
  meta: {
    calculatorName: string;
    categoryLine: string;
    subtitle: string;
    generatedOnLabel: string;
    timestamp: string;
    inputsHeading: string;
    resultsHeading: string;
    footerText: string;
    language: Language;
    inputs: PrintableInputRow[];
    scope: 'workspace' | 'result-only';
  }
): PrintableReportData {
  const resultsRoot =
    workspace.querySelector<HTMLElement>('.glovo-print-results-col') || workspace;
  const belowRoot = workspace.querySelector<HTMLElement>('.glovo-print-below');

  // 1. Primary Result Card
  let primaryCard: PdfReportPrimaryCard | undefined;
  const primaryEl =
    resultsRoot.querySelector<HTMLElement>('.glovo-print-primary-card') ||
    workspace.querySelector<HTMLElement>('.glovo-print-primary-card');

  if (primaryEl) {
    // Check ToolResultsPanel structure vs PDF/Doc output card structure
    const labelSpan = primaryEl.querySelector<HTMLElement>(':scope > div:first-child > span:first-child');
    const badgeEl = primaryEl.querySelector<HTMLElement>(
      ':scope > div:first-child > span:nth-child(2), :scope > div:first-child > div:nth-child(2)'
    );
    const bigValSpan = primaryEl.querySelector<HTMLElement>('span.font-mono.font-bold, span.text-3xl, span.text-4xl');
    const pdfHeading = primaryEl.querySelector<HTMLElement>('h3');
    const subtextEl = primaryEl.querySelector<HTMLElement>('p');

    if (bigValSpan) {
      const valueRow = bigValSpan.parentElement;
      const unitSpan = valueRow
        ? Array.from(valueRow.children).find((c) => c !== bigValSpan && normText(c))
        : undefined;
      primaryCard = {
        label: normText(labelSpan) || undefined,
        value: normText(bigValSpan),
        unit: normText(unitSpan) || undefined,
        statusBadge: normText(badgeEl) || undefined,
        subtext: normText(subtextEl) || undefined
      };
    } else if (pdfHeading) {
      primaryCard = {
        label: meta.resultsHeading,
        value: normText(pdfHeading),
        subtext: normText(subtextEl) || undefined
      };
    } else {
      const txt = normText(primaryEl);
      if (txt) primaryCard = { label: meta.resultsHeading, value: txt };
    }
  } else {
    // UnitConverterCalculator green output box
    const unitResultBox = workspace.querySelector<HTMLElement>('[aria-live="polite"].bg-result-bg');
    const sciDisplay = workspace.querySelector<HTMLElement>('[data-testid="calc-display"]');
    if (unitResultBox) {
      const spans = Array.from(unitResultBox.querySelectorAll('span')).map((s) => normText(s)).filter(Boolean);
      const fromInput = workspace.querySelector<HTMLInputElement>('input[type="number"]');
      const selects = Array.from(workspace.querySelectorAll<HTMLSelectElement>('select'));
      const fromUnit = selects[0]?.options[selects[0].selectedIndex]?.textContent?.trim() || '';
      const toUnit = selects[1]?.options[selects[1].selectedIndex]?.textContent?.trim() || '';
      if (spans.length > 0) {
        primaryCard = {
          label: 'Converted Result',
          value: spans[0],
          unit: spans[1] || undefined,
          subtext:
            fromInput?.value && fromUnit && toUnit
              ? `${fromInput.value} ${fromUnit} = ${spans.join(' ')} (${toUnit})`
              : undefined
        };
      }
    } else if (sciDisplay) {
      const val = normText(sciDisplay);
      if (val) {
        primaryCard = {
          label: 'Display Result',
          value: val
        };
      }
    }
  }

  // 2. Secondary KPI Metric Tiles (ToolMetricTile + printable equivalent cards)
  const metrics: PdfReportMetricCard[] = [];
  const seenMetrics = new Set<string>();
  const addMetric = (label: string, value: string, hint?: string) => {
    const l = label.trim();
    const v = value.trim();
    if (!l || !v) return;
    const key = `${l.toLowerCase()}::${v.toLowerCase()}`;
    if (seenMetrics.has(key)) return;
    seenMetrics.add(key);
    metrics.push({ label: l, value: v, hint: hint?.trim() || undefined });
  };

  const metricCandidates = sanitizedBody.querySelectorAll<HTMLElement>(
    '.kpi-hover-shake, .kpi-hover-elastic, .kpi-hover-wobble, .glovo-print-keep-card'
  );
  metricCandidates.forEach((tile) => {
    if (tile.closest('.glovo-print-primary-card')) return;
    const spans = Array.from(tile.querySelectorAll('span, div'))
      .filter((el) => el.children.length === 0 && normText(el))
      .map((el) => normText(el));
    if (spans.length >= 2) {
      addMetric(spans[0], spans[1], spans[2]);
    }
  });

  // 3. Calculation Breakdown Rows
  const breakdowns: PdfReportBreakdownItem[] = [];
  const breakdownEls = sanitizedBody.querySelectorAll<HTMLElement>('.glovo-print-breakdown > div');
  breakdownEls.forEach((row) => {
    const children = Array.from(row.children);
    if (children.length >= 2) {
      const lbl = normText(children[0]);
      const val = normText(children[children.length - 1]);
      if (lbl && val) {
        const highlight =
          children[0].className.includes('font-semibold') ||
          children[children.length - 1].className.includes('text-result-icon');
        breakdowns.push({ label: lbl, value: val, highlight });
      }
    }
  });

  // 4. Charts & Graphs (live <canvas> and chart <svg> inside results/below)
  const charts: PdfReportChartItem[] = [];
  const chartScopes: HTMLElement[] = [resultsRoot];
  if (belowRoot) chartScopes.push(belowRoot);

  for (const scopeEl of chartScopes) {
    // Live <canvas> charts
    scopeEl.querySelectorAll<HTMLCanvasElement>('canvas').forEach((canvas) => {
      if (canvas.closest('.no-print')) return;
      try {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width || canvas.width || 500;
        const h = rect.height || canvas.height || 220;
        if (w < 60 || h < 40) return;
        const pngDataUrl = canvas.toDataURL('image/png');
        const containerHeading =
          canvas.closest('section, div.space-y-2, div.ui-panel')?.querySelector('h3, h4')?.textContent?.trim();
        charts.push({ title: containerHeading || undefined, pngDataUrl, width: w, height: h });
      } catch {
        // Ignore tainted canvas
      }
    });

    // Live D3 / Recharts / custom <svg> charts (skip small UI icons <= 60px)
    scopeEl.querySelectorAll<SVGSVGElement>('svg').forEach((svg) => {
      if (svg.closest('.no-print') || svg.closest('[data-print-doc-header="true"]')) return;
      const rect = svg.getBoundingClientRect();
      const vb = svg.getAttribute('viewBox');
      let w = rect.width;
      let h = rect.height;
      if ((!w || !h) && vb) {
        const parts = vb.split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          w = parts[2];
          h = parts[3];
        }
      }
      if (w < 80 || h < 60) return;

      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      if (!svgClone.getAttribute('viewBox')) {
        svgClone.setAttribute('viewBox', `0 0 ${Math.round(w)} ${Math.round(h)}`);
      }
      svgClone.setAttribute('width', String(Math.round(w)));
      svgClone.setAttribute('height', String(Math.round(h)));

      const containerHeading =
        svg.closest('div.space-y-2, section, div.ui-panel')?.querySelector('h3, h4')?.textContent?.trim();

      charts.push({
        title: containerHeading || undefined,
        svgMarkup: new XMLSerializer().serializeToString(svgClone),
        width: w,
        height: h
      });
    });
  }

  // 5. Tables & Complete Amortization Schedules
  const tables: PdfReportTable[] = [];
  let hasCompleteScheduleTable = false;

  // 5a. Prefer explicit complete schedule data (e.g. LoanCalculator fullSchedule across all months)
  const completeTableNodes = workspace.querySelectorAll<HTMLElement>('[data-print-complete-table="true"]');
  completeTableNodes.forEach((node) => {
    const rawJson = node.getAttribute('data-table-json');
    if (!rawJson) return;
    try {
      const parsed = JSON.parse(rawJson) as PdfReportTable;
      if (parsed && Array.isArray(parsed.headers) && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        tables.push({
          title: parsed.title,
          subtitle: parsed.subtitle,
          headers: parsed.headers.map(String),
          rows: parsed.rows.map((r) => (Array.isArray(r) ? r.map(String) : []))
        });
        hasCompleteScheduleTable = true;
      }
    } catch {
      // Ignore invalid JSON payload
    }
  });

  // 5b. Extract visible DOM tables (planners, trackers, schedules, breakdown tables)
  sanitizedBody.querySelectorAll<HTMLTableElement>('table').forEach((tbl) => {
    const section = tbl.closest('section, .ui-panel');
    const title = section?.querySelector('h2, h3, h4')?.textContent?.trim() || undefined;
    // Avoid duplicating LoanCalculator's partial Year-1 preview table when the complete schedule is included
    if (hasCompleteScheduleTable && title && /amortization/i.test(title)) {
      return;
    }

    const headers = Array.from(tbl.querySelectorAll('thead th')).map((th) => normText(th));
    const rows = Array.from(tbl.querySelectorAll('tbody tr'))
      .map((tr) => Array.from(tr.querySelectorAll('td, th')).map((cell) => normText(cell)))
      .filter((cells) => cells.some(Boolean));

    if (headers.length > 0 || rows.length > 0) {
      tables.push({ title, headers, rows });
    }
  });

  // 6. Explanatory Notes, Formula Expressions & <pre> Document Outputs
  const notes: PdfReportNote[] = [];
  const seenNotes = new Set<string>();
  const addNote = (text: string, title?: string, mono = false) => {
    const clean = text.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seenNotes.has(key)) return;
    seenNotes.add(key);
    notes.push({ title, text: clean, mono });
  };

  // Synthetic fallback disclaimer if present
  const fallbackNotice = sanitizedBody.querySelector<HTMLElement>('[data-testid="synthetic-fallback-notice"]');
  if (fallbackNotice) {
    addNote(normText(fallbackNotice), 'Notice');
  }

  // Formula expression panels (e.g. EngineCalculatorView)
  sanitizedBody.querySelectorAll<HTMLElement>('.ui-panel').forEach((panel) => {
    if (panel.classList.contains('glovo-print-results-panel') || panel.querySelector('table')) return;
    const heading = panel.querySelector(':scope > div:first-child')?.textContent?.trim();
    const monoEl = panel.querySelector<HTMLElement>('.font-mono');
    if (monoEl && heading && /formula/i.test(heading)) {
      addNote(normText(monoEl), heading, true);
    }
  });

  // Summary text paragraphs inside results panel
  sanitizedBody.querySelectorAll<HTMLElement>('.glovo-print-results-panel p').forEach((p) => {
    if (p.closest('.glovo-print-primary-card')) return;
    const txt = normText(p);
    if (txt.length >= 12) {
      addNote(txt);
    }
  });

  // Preformatted text previews (OCR / extracted PDF text / code formatters)
  sanitizedBody.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    const txt = (pre.textContent || '').trim();
    if (txt) {
      addNote(txt.slice(0, 6000), 'Output Text', true);
    }
  });

  // 7. Fallback paragraphs for specialized workspaces with unstructured result text
  const fallbackParagraphs: string[] = [];
  if (!primaryCard && metrics.length === 0 && tables.length === 0) {
    const rawLines = (sanitizedBody.textContent || '')
      .split(/\n+/)
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length > 0);
    fallbackParagraphs.push(...rawLines.slice(0, 40));
  }

  return {
    calculatorName: meta.calculatorName,
    categoryLine: meta.categoryLine,
    subtitle: meta.subtitle,
    generatedOnLabel: meta.generatedOnLabel,
    timestamp: meta.timestamp,
    inputsHeading: meta.inputsHeading,
    resultsHeading: meta.resultsHeading,
    footerText: meta.footerText,
    language: meta.language,
    inputs: meta.inputs,
    primaryCard,
    metrics,
    breakdowns,
    charts,
    tables,
    notes,
    fallbackParagraphs
  };
}

function getOrCreatePrintIframe(): HTMLIFrameElement {
  const existing = document.getElementById(PRINT_FRAME_ID) as HTMLIFrameElement | null;
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const iframe = document.createElement('iframe');
  iframe.id = PRINT_FRAME_ID;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.title = 'Glovotools Print Frame';
  // Keep offscreen with non-zero width (never display:none, which Safari/Firefox refuse to print)
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '900px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0';
  iframe.style.border = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);
  return iframe;
}

function triggerMainWindowPrintFallback(
  workspace: HTMLElement,
  scope: 'workspace' | 'result-only',
  timestamp: string,
  calculatorName: string
): { beforePrintFired: boolean; elapsedMs: number } {
  const timestampNodes = workspace.querySelectorAll<HTMLElement>('[data-print-timestamp="true"]');
  timestampNodes.forEach((node) => {
    node.textContent = timestamp;
  });

  if (scope === 'result-only') {
    workspace.setAttribute('data-print-scope', 'result-only');
  } else {
    workspace.removeAttribute('data-print-scope');
  }

  const previousTitle = document.title;
  document.title = `${calculatorName} — Glovotools`;

  let beforePrintFired = false;
  let cleaned = false;

  const onBefore = () => {
    beforePrintFired = true;
  };
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    workspace.removeAttribute('data-print-scope');
    document.title = previousTitle;
    window.removeEventListener('beforeprint', onBefore);
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('beforeprint', onBefore, { once: true });
  window.addEventListener('afterprint', cleanup, { once: true });

  const start = performance.now();
  try {
    window.print();
  } catch {
    cleanup();
  }
  const elapsedMs = performance.now() - start;

  // Clean up safely after a generous window only if afterprint never fired
  if (!beforePrintFired) {
    window.setTimeout(cleanup, 150);
  }

  return { beforePrintFired, elapsedMs };
}

/**
 * Reliable click-to-print entry point for all Glovotools calculators and tools:
 * 1. Resolves the exact calculator workspace from the clicked button element.
 * 2. Builds a clean, isolated, white-paper printable document containing Glovotools branding,
 *    calculator name, timestamp, non-empty user inputs, results, breakdowns, tables, and charts.
 * 3. Triggers browser-native printing synchronously inside the user's click via an isolated print iframe.
 * 4. Automatically falls back to main window.print() if iframe printing fails, or notifies
 *    onSandboxBlocked ONLY when an embedded sandboxed iframe silently suppresses window.print().
 */
export function triggerResultPrint(options: TriggerPrintOptions = {}): PrintExecutionResult {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { status: 'no-target', inputCount: 0, usedIframe: false };
  }

  const {
    triggerElement = null,
    scope = 'workspace',
    language = 'en',
    documentTitle,
    onSandboxBlocked
  } = options;

  const workspace =
    triggerElement?.closest<HTMLElement>('[data-print-workspace="true"]') ||
    document.querySelector<HTMLElement>('[data-print-workspace="true"]') ||
    triggerElement?.closest<HTMLElement>('article, main, section');

  if (!workspace) {
    return { status: 'no-target', inputCount: 0, usedIframe: false };
  }

  const payload = buildPrintablePayload(workspace, { scope, language, documentTitle });
  const embedded = isEmbeddedIframe();

  // Keep parent document.title clean during print for Save-as-PDF filename
  const previousParentTitle = document.title;
  document.title = `${payload.calculatorName} — Glovotools`;

  const restoreParentTitle = () => {
    document.title = previousParentTitle;
  };

  try {
    const iframe = getOrCreatePrintIframe();
    const iframeWin = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWin?.document;

    if (!iframeWin || !iframeDoc) {
      throw new Error('Print iframe document unavailable');
    }

    iframeDoc.open();
    iframeDoc.write(payload.htmlDocument);
    iframeDoc.close();

    let iframeBeforePrint = false;
    let iframeAfterPrint = false;

    const onIframeBefore = () => {
      iframeBeforePrint = true;
    };
    const onIframeAfter = () => {
      iframeAfterPrint = true;
      restoreParentTitle();
      iframeWin.removeEventListener('beforeprint', onIframeBefore);
      iframeWin.removeEventListener('afterprint', onIframeAfter);
      // Remove frame slightly after afterprint so Safari print spool completes cleanly
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    };

    iframeWin.addEventListener('beforeprint', onIframeBefore, { once: true });
    iframeWin.addEventListener('afterprint', onIframeAfter, { once: true });

    const start = performance.now();
    iframeWin.focus();
    iframeWin.print();
    const elapsedMs = performance.now() - start;

    // If top-level browser tab OR print dialog actually engaged (beforeprint fired or dialog blocked),
    // native printing succeeded cleanly!
    if (!embedded || iframeBeforePrint || iframeAfterPrint || elapsedMs >= 80) {
      if (!iframeAfterPrint) {
        // Restore title safely without removing the iframe prematurely
        window.setTimeout(restoreParentTitle, 4000);
      }
      return {
        status: 'printed',
        calculatorName: payload.calculatorName,
        inputCount: payload.inputs.length,
        usedIframe: true
      };
    }

    // Embedded iframe where iframeWin.print() returned immediately without beforeprint:
    // Try main window.print() once in case only nested iframe printing was restricted
    restoreParentTitle();
    const mainResult = triggerMainWindowPrintFallback(
      workspace,
      scope,
      payload.timestamp,
      payload.calculatorName
    );

    if (mainResult.beforePrintFired || mainResult.elapsedMs >= 80) {
      return {
        status: 'fallback-main',
        calculatorName: payload.calculatorName,
        inputCount: payload.inputs.length,
        usedIframe: false
      };
    }

    // Both iframe.print() and window.print() were silently ignored by the host sandboxed iframe
    // (missing allow-modals). Open the clean Print Preview & Download modal so the button ALWAYS works.
    onSandboxBlocked?.(payload);
    return {
      status: 'sandbox-blocked',
      calculatorName: payload.calculatorName,
      inputCount: payload.inputs.length,
      usedIframe: true
    };
  } catch {
    // Fallback to main window.print() if iframe creation/access failed
    restoreParentTitle();
    const mainResult = triggerMainWindowPrintFallback(
      workspace,
      scope,
      payload.timestamp,
      payload.calculatorName
    );
    if (embedded && !mainResult.beforePrintFired && mainResult.elapsedMs < 80) {
      onSandboxBlocked?.(payload);
      return {
        status: 'sandbox-blocked',
        calculatorName: payload.calculatorName,
        inputCount: payload.inputs.length,
        usedIframe: false
      };
    }
    return {
      status: 'fallback-main',
      calculatorName: payload.calculatorName,
      inputCount: payload.inputs.length,
      usedIframe: false
    };
  }
}
