import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

export { pdfjsLib };

let workerConfigured = false;
let configuredWorkerSrc = '';

/**
 * Configures PDF.js to use the Vite-bundled worker from `pdfjs-dist`
 * with zero external CDN dependencies and correct MIME type handling on static hosts.
 */
export function ensurePdfJsWorker(): string {
  if (workerConfigured && configuredWorkerSrc) {
    return configuredWorkerSrc;
  }

  try {
    configuredWorkerSrc = pdfWorkerUrl;
    if (pdfjsLib?.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    }
    workerConfigured = true;
  } catch {
    // In environments where URL resolution falls back to in-thread fake worker
    workerConfigured = true;
  }

  return configuredWorkerSrc;
}

export function getPdfJsWorkerSrc(): string {
  ensurePdfJsWorker();
  return pdfjsLib?.GlobalWorkerOptions?.workerSrc || configuredWorkerSrc;
}

export function isPdfJsWorkerConfigured(): boolean {
  return workerConfigured;
}

/**
 * Safely clones any ArrayBuffer or ArrayBufferView (such as a Uint8Array subarray)
 * into a brand-new standalone Uint8Array whose backing ArrayBuffer has
 * byteOffset === 0 and byteLength === view.byteLength.
 *
 * This prevents:
 * 1. ArrayBuffer detachment when PDF.js transfers the buffer to its Web Worker.
 * 2. Corruption from non-zero byteOffset / subarray views over larger ArrayBuffers.
 */
export function clonePdfBytes(input: ArrayBuffer | ArrayBufferView): Uint8Array {
  if (!input) {
    return new Uint8Array(0);
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input.slice(0));
  }

  if (ArrayBuffer.isView(input)) {
    const sourceView = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    const copy = new Uint8Array(sourceView.byteLength);
    copy.set(sourceView);
    return copy;
  }

  throw new TypeError('Expected an ArrayBuffer or ArrayBufferView for PDF byte cloning.');
}

/**
 * Extracts an exact standalone ArrayBuffer containing only [byteOffset, byteOffset + byteLength)
 * from a Uint8Array or ArrayBuffer.
 */
export function toExactArrayBuffer(input: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (input instanceof ArrayBuffer) {
    return input.slice(0);
  }
  const copy = new Uint8Array(input.byteLength);
  copy.set(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
  return copy.buffer;
}

/**
 * Creates a Blob from a Uint8Array or ArrayBuffer while strictly respecting
 * byteOffset and byteLength so extra backing buffer bytes are never leaked.
 */
export function createSafeBlob(
  data: Uint8Array | ArrayBuffer,
  mimeType = 'application/pdf'
): Blob {
  const exactBuffer = toExactArrayBuffer(data);
  return new Blob([exactBuffer], { type: mimeType });
}

/**
 * Safely revokes a blob: object URL without throwing on null/empty strings.
 */
export function revokeObjectUrlSafely(url: string | null | undefined): void {
  if (typeof url === 'string' && url.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revocation errors on already-revoked URLs
    }
  }
}

/**
 * Releases HTMLCanvasElement backing store memory immediately.
 */
export function releaseCanvasMemory(canvas: HTMLCanvasElement | null | undefined): void {
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // Ignore cleanup errors in non-DOM environments
  }
}

/**
 * Safely cleans up a PDF.js page proxy instance.
 */
export async function cleanupPdfPage(page: any): Promise<void> {
  if (!page) return;
  try {
    if (typeof page.cleanup === 'function') {
      await page.cleanup();
    }
  } catch {
    // Ignore cleanup errors on already-cleaned pages
  }
}

/**
 * Safely cleans up and destroys a PDF.js document proxy and its loadingTask.
 */
export async function destroyPdfDocument(pdfDoc: any, loadingTask: any): Promise<void> {
  try {
    if (pdfDoc && typeof pdfDoc.cleanup === 'function') {
      await pdfDoc.cleanup();
    }
  } catch {
    // Ignore cleanup errors
  }

  try {
    if (pdfDoc && typeof pdfDoc.destroy === 'function') {
      await pdfDoc.destroy();
    }
  } catch {
    // Ignore destroy errors
  }

  try {
    if (loadingTask && typeof loadingTask.destroy === 'function') {
      await loadingTask.destroy();
    }
  } catch {
    // Ignore loadingTask destroy errors
  }
}

export interface ManagedPdfSession {
  loadingTask: any;
  pdfDoc: any;
  dispose: () => Promise<void>;
}

/**
 * Opens a PDF.js document with safe byte cloning and returns a managed session
 * with a deterministic `dispose()` method.
 */
export async function openManagedPdfDocument(
  input: ArrayBuffer | ArrayBufferView,
  options: Record<string, any> = {}
): Promise<ManagedPdfSession> {
  ensurePdfJsWorker();
  const dataCopy = clonePdfBytes(input);
  const loadingTask = pdfjsLib.getDocument({
    data: dataCopy,
    verbosity: 0,
    ...options,
  });

  try {
    const pdfDoc = await loadingTask.promise;
    let disposed = false;
    return {
      loadingTask,
      pdfDoc,
      dispose: async () => {
        if (disposed) return;
        disposed = true;
        await destroyPdfDocument(pdfDoc, loadingTask);
      },
    };
  } catch (err) {
    await destroyPdfDocument(null, loadingTask);
    throw err;
  }
}

/**
 * Executes an async callback with a managed PDF.js document and guarantees
 * full document and loadingTask cleanup in a `finally` block.
 */
export async function withPdfJsDocument<T>(
  input: ArrayBuffer | ArrayBufferView,
  fn: (pdfDoc: any) => Promise<T>,
  options: Record<string, any> = {}
): Promise<T> {
  const session = await openManagedPdfDocument(input, options);
  try {
    return await fn(session.pdfDoc);
  } finally {
    await session.dispose();
  }
}
