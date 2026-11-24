import { PDFDocument, ParseSpeeds } from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { pdfLifecycleManager } from './pdfLifecycle';
import {
  PdfDocumentInput,
  PdfDocumentMetadataSummary,
  PdfLoadOptions,
  PdfLoadResult,
} from './pdfTypes';
import {
  extractIsolatedNormalizedPdfBytes,
  validatePdfInput,
} from './pdfValidation';

/**
 * Extracts a structured metadata summary from a loaded @cantoo/pdf-lib PDFDocument.
 */
export function extractDocumentMetadataSummary(
  doc: PDFDocument,
  pdfVersion = '1.7',
  wasEncrypted = false
): PdfDocumentMetadataSummary {
  const pageCount = doc.getPageCount();
  let firstPageSize: PdfDocumentMetadataSummary['firstPageSize'];

  if (pageCount > 0) {
    try {
      const firstPage = doc.getPage(0);
      const { width, height } = firstPage.getSize();
      const rotationDegrees = firstPage.getRotation().angle;
      firstPageSize = {
        widthPt: Math.round(width * 100) / 100,
        heightPt: Math.round(height * 100) / 100,
        rotationDegrees,
      };
    } catch {
      // Ignore geometry extraction error on damaged first page
    }
  }

  const safeGet = <T>(getter: () => T | undefined): T | undefined => {
    try {
      return getter();
    } catch {
      return undefined;
    }
  };

  const creationDate = safeGet(() => doc.getCreationDate());
  const modificationDate = safeGet(() => doc.getModificationDate());

  return {
    pageCount,
    pdfVersion,
    isEncrypted: wasEncrypted || Boolean(doc.isEncrypted),
    title: safeGet(() => doc.getTitle()),
    author: safeGet(() => doc.getAuthor()),
    subject: safeGet(() => doc.getSubject()),
    keywords: safeGet(() => doc.getKeywords()),
    creator: safeGet(() => doc.getCreator()),
    producer: safeGet(() => doc.getProducer()),
    creationDate: creationDate instanceof Date && !isNaN(creationDate.getTime()) ? creationDate.toISOString() : undefined,
    modificationDate: modificationDate instanceof Date && !isNaN(modificationDate.getTime()) ? modificationDate.toISOString() : undefined,
    firstPageSize,
  };
}

/**
 * Uses PDF.js (`openManagedPdfDocument` from `pdfRuntime.ts`) to deterministically verify
 * whether an encrypted PDF can be unlocked with the supplied password (or without a password
 * if it only has owner permission locks).
 *
 * Returns:
 * - { unlocked: true } if PDF.js opens the document with `password`
 * - { unlocked: false, code: 'ERR_PASSWORD_REQUIRED' | 'ERR_INCORRECT_PASSWORD' | 'ERR_PDF_LOAD_FAILED' }
 */
async function verifyEncryptedPdfAccessWithPdfJs(
  isolatedBytes: Uint8Array,
  password?: string
): Promise<{
  unlocked: boolean;
  code?: 'ERR_PASSWORD_REQUIRED' | 'ERR_INCORRECT_PASSWORD' | 'ERR_PDF_LOAD_FAILED';
  cause?: string;
}> {
  const hasPassword = typeof password === 'string' && password.length > 0;
  try {
    const session = await openManagedPdfDocument(
      isolatedBytes,
      hasPassword ? { password } : {}
    );
    await session.dispose();
    return { unlocked: true };
  } catch (err: any) {
    const errName = String(err?.name ?? '');
    const errCode = Number(err?.code ?? 0);
    const errMsg = String(err?.message ?? '');

    // PDF.js PasswordResponses: NEED_PASSWORD = 1, INCORRECT_PASSWORD = 2
    if (errName === 'PasswordException' || errMsg.toLowerCase().includes('password')) {
      if (errCode === 2 || hasPassword) {
        return {
          unlocked: false,
          code: 'ERR_INCORRECT_PASSWORD',
          cause: errMsg || 'Incorrect password',
        };
      }
      return {
        unlocked: false,
        code: 'ERR_PASSWORD_REQUIRED',
        cause: errMsg || 'Password required',
      };
    }

    return {
      unlocked: false,
      code: 'ERR_PDF_LOAD_FAILED',
      cause: errMsg || 'Failed to parse encrypted PDF',
    };
  }
}

/**
 * Module B — PDF Document Loader
 *
 * Loads valid PDF byte arrays using `@cantoo/pdf-lib@2.11.1`:
 * 1. Validates magic bytes, size limits, and structural markers via Module A.
 * 2. Clones input bytes into an isolated buffer so caller-owned bytes are NEVER mutated.
 * 3. Detects password-protected PDFs:
 *    - Rejects unauthenticated loads with `ERR_PASSWORD_REQUIRED`.
 *    - Rejects wrong passwords with `ERR_INCORRECT_PASSWORD`.
 *    - Allows authorized password-protected document loading.
 * 4. Registers the loaded document with Module E (`pdfLifecycleManager`) and returns
 *    a deterministic `dispose()` handle.
 */
export async function loadPdfDocumentV2(
  input: PdfDocumentInput | Uint8Array | ArrayBuffer,
  options: PdfLoadOptions = {}
): Promise<PdfLoadResult> {
  const noopDispose = async () => {};

  const fileName =
    !(input instanceof Uint8Array) && !(input instanceof ArrayBuffer) && input?.fileName
      ? input.fileName
      : 'document.pdf';

  const inputPassword =
    options.password ??
    (!(input instanceof Uint8Array) && !(input instanceof ArrayBuffer) ? input?.password : undefined);

  // 1. Validate raw input
  const validation = validatePdfInput(input, {
    ...options.validationLimits,
    requireEofMarker: options.allowTolerantParse ? false : (options.validationLimits?.requireEofMarker ?? true),
  });

  if (!validation.isValid || validation.error) {
    return {
      success: false,
      status: validation.error?.status || 'INVALID_PDF',
      validation,
      warnings: [...validation.warnings],
      error: validation.error || createPdfProcessingError('ERR_INVALID_PDF'),
      dispose: noopDispose,
    };
  }

  // 2. Clone isolated bytes (optionally trimming leading garbage before '%PDF-')
  const headerOffset =
    options.trimLeadingBytesToHeader !== false ? (validation.headerOffset || 0) : 0;
  const isolatedBytes = extractIsolatedNormalizedPdfBytes(input, headerOffset);
  const warnings = [...validation.warnings];

  const hasSuppliedPassword = typeof inputPassword === 'string' && inputPassword.length > 0;

  // 3. If encryption dictionary is detected, verify password authorization before loading
  if (validation.hasEncryptDictionary) {
    const authCheck = await verifyEncryptedPdfAccessWithPdfJs(isolatedBytes, inputPassword);
    if (!authCheck.unlocked) {
      const errCode = authCheck.code || (hasSuppliedPassword ? 'ERR_INCORRECT_PASSWORD' : 'ERR_PASSWORD_REQUIRED');
      const procError = createPdfProcessingError(errCode, undefined, {
        cause: authCheck.cause,
        fileName,
      });
      return {
        success: false,
        status: procError.status,
        validation: {
          ...validation,
          isPasswordRequired: true,
        },
        warnings,
        error: procError,
        dispose: noopDispose,
      };
    }
  }

  // 4. Load into @cantoo/pdf-lib
  try {
    const loadOpts: Parameters<typeof PDFDocument.load>[1] = {
      updateMetadata: false,
      parseSpeed: ParseSpeeds.Fast,
      throwOnInvalidObject: !options.allowTolerantParse,
      warnOnInvalidObjects: false,
    };

    if (hasSuppliedPassword) {
      loadOpts.password = inputPassword;
    } else if (validation.hasEncryptDictionary) {
      // Owner-locked PDF that opened without a user password in PDF.js check above
      loadOpts.password = '';
    }

    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(isolatedBytes, loadOpts);
    } catch (innerErr: any) {
      const msg = String(innerErr?.message ?? '').toLowerCase();
      // If @cantoo/pdf-lib throws on encrypted object streams or filter variants AFTER
      // verifyEncryptedPdfAccessWithPdfJs already confirmed valid password authorization,
      // retry parsing with throwOnInvalidObject: false (and ignoreEncryption only if needed).
      if (validation.hasEncryptDictionary) {
        try {
          pdfDoc = await PDFDocument.load(isolatedBytes, {
            ...loadOpts,
            throwOnInvalidObject: false,
          });
        } catch (tolerantErr: any) {
          const tolerantMsg = String(tolerantErr?.message ?? '').toLowerCase();
          if (tolerantMsg.includes('encrypt') || tolerantMsg.includes('password') || msg.includes('encrypt') || msg.includes('password')) {
            const authCheck = await verifyEncryptedPdfAccessWithPdfJs(isolatedBytes, inputPassword);
            if (!authCheck.unlocked) {
              const code = authCheck.code || (hasSuppliedPassword ? 'ERR_INCORRECT_PASSWORD' : 'ERR_PASSWORD_REQUIRED');
              const procError = createPdfProcessingError(code, undefined, { cause: authCheck.cause });
              return {
                success: false,
                status: procError.status,
                validation,
                warnings,
                error: procError,
                dispose: noopDispose,
              };
            }
            pdfDoc = await PDFDocument.load(isolatedBytes, {
              ...loadOpts,
              throwOnInvalidObject: false,
              ignoreEncryption: true,
            });
          } else {
            throw tolerantErr;
          }
        }
      } else {
        throw innerErr;
      }
    }

    const pageCount = pdfDoc.getPageCount();
    if (pageCount <= 0) {
      const emptyPagesErr = createPdfProcessingError(
        'ERR_PDF_LOAD_FAILED',
        'The PDF document contains 0 pages or its page tree is corrupted.'
      );
      return {
        success: false,
        status: emptyPagesErr.status,
        validation,
        warnings,
        error: emptyPagesErr,
        dispose: noopDispose,
      };
    }

    const metadata = extractDocumentMetadataSummary(
      pdfDoc,
      validation.pdfVersion || '1.7',
      validation.hasEncryptDictionary
    );

    const lifecycle = pdfLifecycleManager.registerSession({
      fileName,
      isolatedBytes,
      document: pdfDoc,
    });

    return {
      success: true,
      status: 'SUCCESS',
      sessionId: lifecycle.sessionId,
      document: pdfDoc,
      isolatedBytes,
      validation,
      metadata,
      warnings,
      dispose: lifecycle.dispose,
    };
  } catch (err: unknown) {
    const procError = normalizeCaughtPdfError(err, {
      hadPassword: hasSuppliedPassword,
      phase: 'load',
    });
    return {
      success: false,
      status: procError.status,
      validation,
      warnings,
      error: procError,
      dispose: noopDispose,
    };
  }
}
