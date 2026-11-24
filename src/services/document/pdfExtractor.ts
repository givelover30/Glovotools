import {
  pdfjsLib,
  ensurePdfJsWorker,
  clonePdfBytes,
  cleanupPdfPage,
  destroyPdfDocument,
  releaseCanvasMemory,
} from '../pdf/pdfRuntime.ts';
import { ExtractedPdfLine, ExtractedPdfPage, ProgressCallback, StructuredBlock } from './types.ts';

export { ensurePdfJsWorker };

export interface PdfExtractionOptions {
  enableOcrFallback?: boolean;
  ocrLanguage?: string;
  onProgress?: ProgressCallback;
}

export interface PdfExtractionResult {
  pageCount: number;
  pages: ExtractedPdfPage[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
  };
  usedOcr: boolean;
}

function clusterLines(items: any[]): ExtractedPdfLine[] {
  const textItems = items
    .filter((it) => typeof it?.str === 'string' && it.str.trim().length > 0 && Array.isArray(it.transform))
    .map((it) => {
      const tx = it.transform;
      const fontSize = Math.max(6, Math.hypot(tx[0] || 0, tx[1] || 0) || Math.abs(tx[3] || 12));
      return {
        str: it.str as string,
        x: Number(tx[4]) || 0,
        y: Number(tx[5]) || 0,
        width: Number(it.width) || (it.str.length * fontSize * 0.5),
        fontSize,
      };
    });

  if (textItems.length === 0) return [];

  // Sort top-to-bottom (descending PDF Y), then left-to-right (ascending X)
  textItems.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 3.5) return b.y - a.y;
    return a.x - b.x;
  });

  const rows: Array<typeof textItems> = [];
  for (const item of textItems) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow || Math.abs(lastRow[0].y - item.y) > Math.max(3.5, lastRow[0].fontSize * 0.35)) {
      rows.push([item]);
    } else {
      lastRow.push(item);
    }
  }

  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    const cells: Array<{ x: number; text: string }> = [];
    let currentCellText = '';
    let currentCellX = row[0].x;
    let prevEndX = row[0].x;
    let maxFontSize = row[0].fontSize;

    for (let i = 0; i < row.length; i++) {
      const item = row[i];
      if (item.fontSize > maxFontSize) maxFontSize = item.fontSize;
      const trimmed = item.str;
      if (i === 0) {
        currentCellText = trimmed;
        currentCellX = item.x;
        prevEndX = item.x + item.width;
      } else {
        const gap = item.x - prevEndX;
        const spaceThreshold = Math.max(12, item.fontSize * 1.4);
        if (gap > spaceThreshold && currentCellText.trim().length > 0 && trimmed.trim().length > 0) {
          cells.push({ x: currentCellX, text: currentCellText.trim() });
          currentCellText = trimmed;
          currentCellX = item.x;
        } else {
          if (gap > Math.max(1.5, item.fontSize * 0.18) && !currentCellText.endsWith(' ') && !trimmed.startsWith(' ')) {
            currentCellText += ' ';
          }
          currentCellText += trimmed;
        }
        prevEndX = Math.max(prevEndX, item.x + item.width);
      }
    }
    if (currentCellText.trim().length > 0) {
      cells.push({ x: currentCellX, text: currentCellText.trim() });
    }

    return {
      y: row[0].y,
      minX: row[0].x,
      maxFontSize,
      text: cells.map((c) => c.text).join('  '),
      cells,
    };
  }).filter((line) => line.text.trim().length > 0);
}

function buildTableAndBlocks(lines: ExtractedPdfLine[]): { blocks: StructuredBlock[]; tableRows: string[][] } {
  if (lines.length === 0) {
    return { blocks: [], tableRows: [] };
  }

  // Median font size for heading heuristic
  const sizes = lines.map((l) => l.maxFontSize).sort((a, b) => a - b);
  const medianSize = sizes[Math.floor(sizes.length / 2)] || 12;

  // Build aligned tableRows for CSV/Excel exports
  // Collect anchor X positions from multi-cell rows
  const multiCellLines = lines.filter((l) => l.cells.length > 1);
  const columnAnchors: number[] = [];
  if (multiCellLines.length > 0) {
    const allXs = multiCellLines.flatMap((l) => l.cells.map((c) => c.x)).sort((a, b) => a - b);
    for (const x of allXs) {
      if (columnAnchors.length === 0 || x - columnAnchors[columnAnchors.length - 1] > 28) {
        columnAnchors.push(x);
      }
    }
  }

  const tableRows: string[][] = lines.map((line) => {
    if (columnAnchors.length > 1 && line.cells.length > 1) {
      const row = new Array<string>(columnAnchors.length).fill('');
      for (const cell of line.cells) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let c = 0; c < columnAnchors.length; c++) {
          const d = Math.abs(cell.x - columnAnchors[c]);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = c;
          }
        }
        row[bestIdx] = row[bestIdx] ? `${row[bestIdx]} ${cell.text}` : cell.text;
      }
      return row;
    }
    // Also support delimiter-separated lines (tab or pipe)
    if (line.text.includes('\t')) {
      return line.text.split('\t').map((s) => s.trim());
    }
    if (line.cells.length > 1) {
      return line.cells.map((c) => c.text);
    }
    return [line.text.trim()];
  });

  // Group structured blocks (headings, list items, tables, paragraphs)
  const blocks: StructuredBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Detect contiguous multi-column rows (>= 2 consecutive rows with >= 2 cells) as a table
    if (line.cells.length >= 2) {
      let j = i;
      while (j < lines.length && lines[j].cells.length >= 2) {
        j++;
      }
      if (j - i >= 2) {
        const subRows = tableRows.slice(i, j);
        const maxCols = Math.max(...subRows.map((r) => r.length));
        const normalized = subRows.map((r) => {
          const copy = [...r];
          while (copy.length < maxCols) copy.push('');
          return copy;
        });
        blocks.push({ type: 'table', rows: normalized, hasHeader: true });
        i = j;
        continue;
      }
    }

    const txt = line.text.trim();
    if (line.maxFontSize >= medianSize * 1.45 && txt.length <= 140) {
      blocks.push({ type: 'heading', level: 1, text: txt });
    } else if (line.maxFontSize >= medianSize * 1.18 && txt.length <= 140) {
      blocks.push({ type: 'heading', level: 2, text: txt });
    } else if (/^([•\-\*]|\d+[\.\)])\s+/.test(txt)) {
      const ordered = /^\d+[\.\)]\s+/.test(txt);
      const cleaned = txt.replace(/^([•\-\*]|\d+[\.\)])\s+/, '');
      blocks.push({ type: 'list-item', text: cleaned, ordered });
    } else {
      blocks.push({ type: 'paragraph', text: txt });
    }
    i++;
  }

  return { blocks, tableRows };
}

async function runOcrOnPdfPage(
  page: any,
  ocrLanguage: string
): Promise<string> {
  if (typeof document === 'undefined') {
    return '';
  }
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    await page.render({ canvasContext: ctx, canvas, viewport }).promise;

    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(ocrLanguage || 'eng');
    try {
      const result = await worker.recognize(canvas);
      return result?.data?.text || '';
    } finally {
      await worker.terminate();
    }
  } finally {
    releaseCanvasMemory(canvas);
  }
}

export async function extractPdfContent(
  bytes: Uint8Array,
  options: PdfExtractionOptions = {}
): Promise<PdfExtractionResult> {
  ensurePdfJsWorker();
  const { enableOcrFallback = false, ocrLanguage = 'eng', onProgress } = options;

  // Clone data so pdfjs transferring buffer to worker never detaches caller's Uint8Array or corrupts subarrays
  const dataCopy = clonePdfBytes(bytes);
  const loadingTask = pdfjsLib.getDocument({ data: dataCopy, verbosity: 0 });
  const pdfDoc = await loadingTask.promise;

  let anyOcr = false;
  try {
    const numPages = pdfDoc.numPages;
    const pages: ExtractedPdfPage[] = [];

    let metaInfo: PdfExtractionResult['metadata'] = {};
    try {
      const meta = await pdfDoc.getMetadata();
      const info = (meta?.info || {}) as Record<string, any>;
      metaInfo = {
        title: typeof info.Title === 'string' ? info.Title : undefined,
        author: typeof info.Author === 'string' ? info.Author : undefined,
        subject: typeof info.Subject === 'string' ? info.Subject : undefined,
        creator: typeof info.Creator === 'string' ? info.Creator : undefined,
        producer: typeof info.Producer === 'string' ? info.Producer : undefined,
      };
    } catch {
      // Metadata optional
    }

    for (let p = 1; p <= numPages; p++) {
      onProgress?.(Math.round((p / numPages) * 60), `Extracting PDF page ${p} of ${numPages}...`);
      const page = await pdfDoc.getPage(p);
      try {
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        let lines = clusterLines(textContent.items || []);
        let usedOcr = false;

        if (lines.length === 0 && enableOcrFallback) {
          onProgress?.(Math.round((p / numPages) * 60), `Running browser-local OCR on scanned page ${p} of ${numPages}...`);
          const ocrText = await runOcrOnPdfPage(page, ocrLanguage);
          if (ocrText.trim().length > 0) {
            usedOcr = true;
            anyOcr = true;
            const rawLines = ocrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            lines = rawLines.map((txt, idx) => ({
              y: viewport.height - idx * 14,
              minX: 40,
              maxFontSize: 12,
              text: txt,
              cells: txt.split(/\s{2,}|\t/).filter(Boolean).map((c, ci) => ({ x: 40 + ci * 120, text: c })),
            }));
          }
        }

        const { blocks, tableRows } = buildTableAndBlocks(lines);
        const rawText = lines.map((l) => l.text).join('\n');

        pages.push({
          pageNumber: p,
          width: viewport.width,
          height: viewport.height,
          rawText,
          lines,
          blocks,
          tableRows,
          usedOcr,
        });
      } finally {
        await cleanupPdfPage(page);
      }
    }

    return {
      pageCount: numPages,
      pages,
      metadata: metaInfo,
      usedOcr: anyOcr,
    };
  } finally {
    await destroyPdfDocument(pdfDoc, loadingTask);
  }
}

export async function renderPdfPagesToImages(
  bytes: Uint8Array,
  format: 'png' | 'jpeg' = 'png',
  scale = 1.75,
  quality = 0.9,
  onProgress?: ProgressCallback
): Promise<Array<{ pageNumber: number; width: number; height: number; dataUrl: string; bytes: Uint8Array }>> {
  if (typeof document === 'undefined') {
    throw new Error('Canvas image rendering of PDF pages requires a browser environment.');
  }
  ensurePdfJsWorker();
  const dataCopy = clonePdfBytes(bytes);
  const loadingTask = pdfjsLib.getDocument({ data: dataCopy, verbosity: 0 });
  const pdfDoc = await loadingTask.promise;

  try {
    const results: Array<{ pageNumber: number; width: number; height: number; dataUrl: string; bytes: Uint8Array }> = [];
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';

    for (let p = 1; p <= pdfDoc.numPages; p++) {
      onProgress?.(Math.round((p / pdfDoc.numPages) * 75), `Rendering PDF page ${p} of ${pdfDoc.numPages} to ${format.toUpperCase()}...`);
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        const width = canvas.width;
        const height = canvas.height;
        const dataUrl = canvas.toDataURL(mime, quality);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
        const imgBytes = blob ? new Uint8Array(await blob.arrayBuffer()) : new Uint8Array();
        results.push({
          pageNumber: p,
          width,
          height,
          dataUrl,
          bytes: imgBytes,
        });
      } finally {
        releaseCanvasMemory(canvas);
        await cleanupPdfPage(page);
      }
    }
    return results;
  } finally {
    await destroyPdfDocument(pdfDoc, loadingTask);
  }
}
