import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { clonePdfBytes } from './pdfRuntime';

export interface PdfEngineResult {
  outputBytes: Uint8Array;
  summary: string;
  details?: Record<string, any>;
}





export async function mergePdfs(pdfBuffers: ArrayBuffer[]): Promise<PdfEngineResult> {
  const mergedPdf = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const srcDoc = await PDFDocument.load(clonePdfBytes(buf), { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const outputBytes = await mergedPdf.save();
  const pageCount = mergedPdf.getPageCount();
  return {
    outputBytes,
    summary: `Successfully merged ${pdfBuffers.length} PDF files into a single document (${pageCount} total pages).`,
    details: { pageCount, fileCount: pdfBuffers.length },
  };
}

export async function extractOrSplitPdf(
  pdfBuffer: ArrayBuffer,
  pageIndices: number[]
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const srcDoc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const validIndices = pageIndices.filter((i) => i >= 0 && i < srcDoc.getPageCount());
  if (validIndices.length === 0) {
    throw new Error('No valid pages selected for extraction.');
  }
  const copiedPages = await newPdf.copyPages(srcDoc, validIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const outputBytes = await newPdf.save();
  const pageCount = newPdf.getPageCount();
  return {
    outputBytes,
    summary: `Extracted ${pageCount} pages successfully.`,
    details: { pageCount, extractedIndices: validIndices },
  };
}

export async function deletePages(
  pdfBuffer: ArrayBuffer,
  pageIndicesToDelete: number[]
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const srcDoc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const deleteSet = new Set(pageIndicesToDelete);
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      keepIndices.push(i);
    }
  }
  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from PDF.');
  }
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const outputBytes = await newPdf.save();
  return {
    outputBytes,
    summary: `Deleted ${pageIndicesToDelete.length} pages. Remaining pages: ${newPdf.getPageCount()}.`,
    details: { pageCount: newPdf.getPageCount(), deletedCount: pageIndicesToDelete.length },
  };
}

export async function duplicatePages(
  pdfBuffer: ArrayBuffer,
  pageIndicesToDuplicate: number[]
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const srcDoc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const totalPages = srcDoc.getPageCount();
  const indicesToCopy: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    indicesToCopy.push(i);
    if (pageIndicesToDuplicate.includes(i)) {
      indicesToCopy.push(i);
    }
  }
  const copiedPages = await newPdf.copyPages(srcDoc, indicesToCopy);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const outputBytes = await newPdf.save();
  return {
    outputBytes,
    summary: `Duplicated selected pages. New page count: ${newPdf.getPageCount()}.`,
    details: { pageCount: newPdf.getPageCount() },
  };
}

export async function reorderPages(
  pdfBuffer: ArrayBuffer,
  newOrderIndices: number[]
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const srcDoc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();
  const validOrder = newOrderIndices.length > 0 ? newOrderIndices : srcDoc.getPageIndices();
  const copiedPages = await newPdf.copyPages(srcDoc, validOrder);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const outputBytes = await newPdf.save();
  return {
    outputBytes,
    summary: `Reordered ${newPdf.getPageCount()} pages successfully.`,
    details: { pageCount: newPdf.getPageCount() },
  };
}

export async function rotatePages(
  pdfBuffer: ArrayBuffer,
  pageIndices: number[],
  angle: number = 90
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const pages = doc.getPages();
  const targets = pageIndices.length > 0 ? pageIndices : pages.map((_, i) => i);

  for (const idx of targets) {
    if (pages[idx]) {
      const currentRot = pages[idx].getRotation().angle;
      pages[idx].setRotation(degrees((currentRot + angle) % 360));
    }
  }
  const outputBytes = await doc.save();
  return {
    outputBytes,
    summary: `Rotated ${targets.length} pages by ${angle}° successfully.`,
    details: { pageCount: doc.getPageCount(), rotationAngle: angle },
  };
}

export async function cropPages(
  pdfBuffer: ArrayBuffer,
  margin: number = 20
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.setCropBox(margin, margin, width - margin * 2, height - margin * 2);
  }
  const outputBytes = await doc.save();
  return {
    outputBytes,
    summary: `Cropped ${pages.length} pages with margin ${margin}pt successfully.`,
    details: { pageCount: pages.length, margin },
  };
}

export async function addWatermark(
  pdfBuffer: ArrayBuffer,
  watermarkText: string,
  options: {
    opacity?: number;
    rotation?: number;
    fontSize?: number;
  } = {}
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const pages = doc.getPages();
  const opacity = options.opacity ?? 0.3;
  const rotation = options.rotation ?? 45;
  const fontSize = options.fontSize ?? 48;

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 3,
      size: fontSize,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    });
  }
  const outputBytes = await doc.save();
  return {
    outputBytes,
    summary: `Watermark "${watermarkText}" added to ${pages.length} pages successfully.`,
    details: { pageCount: pages.length, watermarkText },
  };
}

export async function addPageNumbers(
  pdfBuffer: ArrayBuffer
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    page.drawText(`Page ${idx + 1} of ${pages.length}`, {
      x: width / 2 - 30,
      y: 25,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  const outputBytes = await doc.save();
  return {
    outputBytes,
    summary: `Page numbers added to ${pages.length} pages successfully.`,
    details: { pageCount: pages.length },
  };
}

export async function updateMetadata(
  pdfBuffer: ArrayBuffer,
  title: string
): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  if (title) {
    doc.setTitle(title);
  }
  doc.setProducer('CalcTools PDF Engine');
  doc.setCreator('CalcTools Suite');
  const outputBytes = await doc.save();
  return {
    outputBytes,
    summary: `PDF metadata updated successfully (Title: "${title || 'Untitled'}").`,
    details: { title, pageCount: doc.getPageCount() },
  };
}

export async function compressOrRepairPdf(pdfBuffer: ArrayBuffer): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const outputBytes = await doc.save({ useObjectStreams: true });
  const originalSize = pdfBuffer.byteLength;
  const newSize = outputBytes.byteLength;
  const savedPct = originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0;
  return {
    outputBytes,
    summary: `PDF optimized and repaired successfully. Size reduced by ~${savedPct}% (${Math.round(originalSize / 1024)} KB -> ${Math.round(newSize / 1024)} KB).`,
    details: { pageCount: doc.getPageCount(), originalSize, newSize, savedPct },
  };
}

export async function inspectPdf(pdfBuffer: ArrayBuffer): Promise<PdfEngineResult> {
  const cloned = clonePdfBytes(pdfBuffer);
  const doc = await PDFDocument.load(cloned, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const firstPage = pageCount > 0 ? doc.getPage(0) : null;
  const size = firstPage ? firstPage.getSize() : { width: 0, height: 0 };

  const details = {
    pageCount,
    title: doc.getTitle() || 'Untitled',
    author: doc.getAuthor() || 'Unknown',
    subject: doc.getSubject() || '',
    creator: doc.getCreator() || 'CalcTools',
    producer: doc.getProducer() || 'CalcTools PDF Engine',
    pageSize: { width: Math.round(size.width), height: Math.round(size.height) },
  };

  return {
    outputBytes: new Uint8Array(cloned),
    summary: `PDF inspected successfully. Pages: ${pageCount}, Title: "${details.title}".`,
    details,
  };
}
