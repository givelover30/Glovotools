import {
  PdfErrorCode,
  PdfOperationStatus,
  PdfProcessingError,
} from './pdfTypes';

interface ErrorCatalogEntry {
  status: Exclude<PdfOperationStatus, 'SUCCESS' | 'PARTIAL_RECOVERY'>;
  message: string;
  messageEs: string;
  recoverableHint: string;
}

const ERROR_CATALOG: Record<PdfErrorCode, ErrorCatalogEntry> = {
  ERR_INVALID_PDF: {
    status: 'INVALID_PDF',
    message: 'The uploaded file is not a valid or readable PDF document.',
    messageEs: 'El archivo cargado no es un documento PDF válido o legible.',
    recoverableHint: 'Verify that the file has a valid %PDF- header and is not corrupted.',
  },
  ERR_EMPTY_FILE: {
    status: 'VALIDATION_ERROR',
    message: 'The uploaded file is empty (0 bytes).',
    messageEs: 'El archivo cargado está vacío (0 bytes).',
    recoverableHint: 'Please select a non-empty PDF or image file.',
  },
  ERR_FILE_TOO_LARGE: {
    status: 'MEMORY_LIMIT_EXCEEDED',
    message: 'The file exceeds the safe browser memory processing limit.',
    messageEs: 'El archivo supera el límite seguro de memoria del navegador.',
    recoverableHint: 'Use a file under 250 MB (or 100 MB on mobile devices) to prevent browser memory exhaustion.',
  },
  ERR_PASSWORD_REQUIRED: {
    status: 'PASSWORD_REQUIRED',
    message: 'This PDF is password-protected. Please provide the document password to proceed.',
    messageEs: 'Este PDF está protegido con contraseña. Proporcione la contraseña del documento para continuar.',
    recoverableHint: 'Enter the authorized user or owner password for this PDF.',
  },
  ERR_INCORRECT_PASSWORD: {
    status: 'INCORRECT_PASSWORD',
    message: 'The provided password is incorrect and could not unlock this PDF.',
    messageEs: 'La contraseña proporcionada es incorrecta y no pudo desbloquear este PDF.',
    recoverableHint: 'Check the password spelling and case sensitivity and try again.',
  },
  ERR_UNSUPPORTED_OPERATION: {
    status: 'UNSUPPORTED_OPERATION',
    message: 'The requested PDF tool operation is not registered or not supported.',
    messageEs: 'La operación de herramienta PDF solicitada no está registrada o no es compatible.',
    recoverableHint: 'Select a supported canonical PDF tool ID from the registry.',
  },
  ERR_PDF_LOAD_FAILED: {
    status: 'INVALID_PDF',
    message: 'Failed to parse the internal structure of the PDF document.',
    messageEs: 'No se pudo analizar la estructura interna del documento PDF.',
    recoverableHint: 'Try running the PDF Structure Repair utility if the document cross-reference table is damaged.',
  },
  ERR_MEMORY_LIMIT: {
    status: 'MEMORY_LIMIT_EXCEEDED',
    message: 'Processing stopped to prevent exceeding browser memory limits.',
    messageEs: 'El procesamiento se detuvo para evitar superar los límites de memoria del navegador.',
    recoverableHint: 'Reduce the number of files, page count, or target DPI and try again.',
  },
  ERR_OUTPUT_INTEGRITY: {
    status: 'OUTPUT_INTEGRITY_FAILURE',
    message: 'The generated PDF output failed post-processing integrity verification.',
    messageEs: 'El archivo PDF generado no superó la verificación de integridad posterior al procesamiento.',
    recoverableHint: 'Check the source PDF for damaged streams or try again with lossless settings.',
  },
  ERR_INVALID_MAGIC_BYTES: {
    status: 'INVALID_PDF',
    message: 'File signature mismatch: the file does not start with a valid %PDF- header.',
    messageEs: 'Firma de archivo inválida: el archivo no comienza con un encabezado %PDF- válido.',
    recoverableHint: 'Ensure the file is an actual PDF document and not another format renamed to .pdf.',
  },
  ERR_INVALID_PDF_STRUCTURE: {
    status: 'INVALID_PDF',
    message: 'The PDF structure is malformed or missing required cross-reference objects.',
    messageEs: 'La estructura del PDF está dañada o carece de objetos de referencia cruzada obligatorios.',
    recoverableHint: 'Use the PDF Repair tool to attempt structural recovery.',
  },
  ERR_MISSING_OPERATION_HANDLER: {
    status: 'UNSUPPORTED_OPERATION',
    message: 'The operation is registered in the catalog, but its execution handler is not yet bound.',
    messageEs: 'La operación está registrada en el catálogo, pero su controlador aún no está vinculado.',
    recoverableHint: 'Ensure the corresponding domain module is loaded.',
  },
  ERR_EMPTY_PASSWORD: {
    status: 'VALIDATION_ERROR',
    message: 'A non-empty password is required to encrypt or unlock the PDF.',
    messageEs: 'Se requiere una contraseña no vacía para cifrar o desbloquear el PDF.',
    recoverableHint: 'Enter a valid user or owner password.',
  },
  ERR_SECOND_FILE_REQUIRED: {
    status: 'VALIDATION_ERROR',
    message: 'This operation requires at least two input PDF files.',
    messageEs: 'Esta operación requiere al menos dos archivos PDF de entrada.',
    recoverableHint: 'Upload two or more PDF files before executing.',
  },
  ERR_INVALID_PAGE_RANGE: {
    status: 'VALIDATION_ERROR',
    message: 'The specified page selection or range is invalid or out of bounds.',
    messageEs: 'La selección o rango de páginas especificado no es válido o está fuera de los límites.',
    recoverableHint: 'Specify page numbers between 1 and the total page count of the document.',
  },
  ERR_CANNOT_DELETE_ALL_PAGES: {
    status: 'VALIDATION_ERROR',
    message: 'Cannot delete all pages from a PDF document; at least one page must remain.',
    messageEs: 'No se pueden eliminar todas las páginas de un PDF; debe quedar al menos una página.',
    recoverableHint: 'Leave at least one page unselected when deleting pages.',
  },
  ERR_REORDER_LENGTH_MISMATCH: {
    status: 'VALIDATION_ERROR',
    message: 'The page reorder sequence must include a valid permutation of document pages.',
    messageEs: 'La secuencia de reordenamiento debe incluir una permutación válida de las páginas.',
    recoverableHint: 'Verify that all page indices in the reorder list are within bounds.',
  },
  ERR_INVALID_CROP_BOUNDS: {
    status: 'VALIDATION_ERROR',
    message: 'The specified crop margins exceed the page dimensions.',
    messageEs: 'Los márgenes de recorte especificados superan las dimensiones de la página.',
    recoverableHint: 'Reduce the crop margins so the remaining visible area is at least 10pt × 10pt.',
  },
  ERR_INVALID_DIMENSIONS: {
    status: 'VALIDATION_ERROR',
    message: 'The specified target page dimensions must be positive numbers.',
    messageEs: 'Las dimensiones de página especificadas deben ser números positivos.',
    recoverableHint: 'Provide width and height values greater than 10 points.',
  },
  ERR_EMPTY_WATERMARK_CONTENT: {
    status: 'VALIDATION_ERROR',
    message: 'Watermark or annotation content cannot be empty.',
    messageEs: 'El contenido de la marca de agua o anotación no puede estar vacío.',
    recoverableHint: 'Enter non-empty watermark text or provide a valid watermark image.',
  },
  ERR_NO_IMAGES_FOUND: {
    status: 'VALIDATION_ERROR',
    message: 'No embedded raster images were found in the selected PDF pages.',
    messageEs: 'No se encontraron imágenes rasterizadas incrustadas en las páginas PDF seleccionadas.',
    recoverableHint: 'If you want to convert whole PDF pages to images, use the PDF to Images tool instead.',
  },
  ERR_UNSUPPORTED_IMAGE_FORMAT: {
    status: 'VALIDATION_ERROR',
    message: 'The uploaded file is not a supported image format (PNG, JPEG, WebP, GIF, BMP, SVG).',
    messageEs: 'El archivo cargado no tiene un formato de imagen compatible (PNG, JPEG, WebP, GIF, BMP, SVG).',
    recoverableHint: 'Upload a valid PNG, JPG, WebP, or SVG image file.',
  },
  ERR_XFA_UNSUPPORTED: {
    status: 'UNSUPPORTED_OPERATION',
    message: 'Legacy Adobe XFA (XML Forms Architecture) dynamic forms are not supported in browser-native engines.',
    messageEs: 'Los formularios dinámicos Adobe XFA heredados no son compatibles con motores nativos del navegador.',
    recoverableHint: 'Standard PDF AcroForms are supported; convert XFA forms to standard AcroForms or static PDF first.',
  },
  ERR_REPAIR_UNRECOVERABLE: {
    status: 'INVALID_PDF',
    message: 'The file is too severely corrupted or contains no recoverable PDF objects or pages.',
    messageEs: 'El archivo está demasiado dañado o no contiene objetos ni páginas PDF recuperables.',
    recoverableHint: 'Verify that the file is a damaged PDF rather than a non-PDF binary file.',
  },
  ERR_OCR_MODEL_LOAD_FAILED: {
    status: 'PROCESSING_FAILURE',
    message: 'Could not load the OCR language recognition model.',
    messageEs: 'No se pudo cargar el modelo de reconocimiento de idioma OCR.',
    recoverableHint: 'Check your network connection for the initial language model download.',
  },
  ERR_MEMORY_LIMIT_EXCEEDED: {
    status: 'MEMORY_LIMIT_EXCEEDED',
    message: 'The operation exceeded the safe browser memory budget.',
    messageEs: 'La operación superó el presupuesto seguro de memoria del navegador.',
    recoverableHint: 'Try processing fewer pages or a smaller file.',
  },
  ERR_OPERATION_ABORTED: {
    status: 'PROCESSING_FAILURE',
    message: 'The PDF processing operation was cancelled.',
    messageEs: 'La operación de procesamiento de PDF fue cancelada.',
    recoverableHint: 'Restart the operation when ready.',
  },
  ERR_OUTPUT_INTEGRITY_FAILURE: {
    status: 'OUTPUT_INTEGRITY_FAILURE',
    message: 'The generated output failed byte-level PDF integrity verification.',
    messageEs: 'La salida generada no superó la verificación de integridad de bytes del PDF.',
    recoverableHint: 'Retry the operation or inspect the source file for structural corruption.',
  },
  ERR_PROCESSING_FAILURE: {
    status: 'PROCESSING_FAILURE',
    message: 'An unexpected error occurred while processing the PDF document.',
    messageEs: 'Ocurrió un error inesperado al procesar el documento PDF.',
    recoverableHint: 'Verify that the input PDF is valid and not locked.',
  },
};

export class PdfEngineV2Error extends Error {
  public readonly status: Exclude<PdfOperationStatus, 'SUCCESS' | 'PARTIAL_RECOVERY'>;
  public readonly code: PdfErrorCode;
  public readonly messageEs: string;
  public readonly recoverableHint?: string;
  public readonly technicalDetails?: Record<string, unknown>;

  constructor(
    code: PdfErrorCode,
    customMessage?: string,
    technicalDetails?: Record<string, unknown>
  ) {
    const entry = ERROR_CATALOG[code] || ERROR_CATALOG.ERR_PROCESSING_FAILURE;
    super(customMessage || entry.message);
    this.name = 'PdfEngineV2Error';
    this.status = entry.status;
    this.code = code;
    this.messageEs = entry.messageEs;
    this.recoverableHint = entry.recoverableHint;
    this.technicalDetails = technicalDetails;
  }

  public toProcessingError(): PdfProcessingError {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      messageEs: this.messageEs,
      recoverableHint: this.recoverableHint,
      technicalDetails: this.technicalDetails,
    };
  }
}

export function createPdfProcessingError(
  code: PdfErrorCode,
  customMessage?: string,
  technicalDetails?: Record<string, unknown>
): PdfProcessingError {
  return new PdfEngineV2Error(code, customMessage, technicalDetails).toProcessingError();
}

/**
 * Translates an unknown caught error (from @cantoo/pdf-lib, pdfjs-dist, or runtime)
 * into a deterministic PdfProcessingError without leaking untyped exceptions.
 */
export function normalizeCaughtPdfError(
  err: unknown,
  context: { hadPassword?: boolean; phase?: 'load' | 'validate' | 'integrity' | 'execute' } = {}
): PdfProcessingError {
  if (err instanceof PdfEngineV2Error) {
    return err.toProcessingError();
  }

  const rawMsg = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  const rawName = err instanceof Error ? err.name : '';
  const lower = `${rawName} ${rawMsg}`.toLowerCase();

  if (lower.includes('abort')) {
    return createPdfProcessingError('ERR_OPERATION_ABORTED', rawMsg);
  }

  if (
    lower.includes('passwordexception') ||
    lower.includes('password') ||
    lower.includes('encrypted') ||
    lower.includes('decrypt')
  ) {
    if (
      context.hadPassword ||
      lower.includes('incorrect') ||
      lower.includes('invalid password') ||
      lower.includes('wrong password')
    ) {
      return createPdfProcessingError('ERR_INCORRECT_PASSWORD', undefined, { cause: rawMsg });
    }
    return createPdfProcessingError('ERR_PASSWORD_REQUIRED', undefined, { cause: rawMsg });
  }

  if (lower.includes('out of memory') || lower.includes('allocation failed') || lower.includes('array buffer allocation')) {
    return createPdfProcessingError('ERR_MEMORY_LIMIT', undefined, { cause: rawMsg });
  }

  if (
    lower.includes('no pdf header') ||
    lower.includes('failed to parse') ||
    lower.includes('invalid pdf') ||
    lower.includes('bad xref') ||
    lower.includes('expected') ||
    context.phase === 'load'
  ) {
    return createPdfProcessingError('ERR_PDF_LOAD_FAILED', undefined, { cause: rawMsg });
  }

  if (context.phase === 'integrity') {
    return createPdfProcessingError('ERR_OUTPUT_INTEGRITY', undefined, { cause: rawMsg });
  }

  return createPdfProcessingError('ERR_PROCESSING_FAILURE', rawMsg);
}
