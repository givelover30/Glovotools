import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  FileWarning,
  Lightbulb,
  Lock,
  RefreshCw,
  RotateCcw,
  X
} from 'lucide-react';
import type { Language } from '../../i18n/translations.ts';
import type { PdfErrorCode, PdfProcessingError } from '../../services/pdf/v2/pdfTypes.ts';

export type PdfErrorObject = {
  code?: PdfErrorCode | string;
  status?: string;
  message: string;
  messageEs?: string;
  recoverableHint?: string;
  pdfError?: PdfProcessingError;
};

export type PdfErrorInput = PdfProcessingError | PdfErrorObject | Error | string;

export type PdfErrorCategory =
  | 'password'
  | 'invalid-file'
  | 'memory'
  | 'validation'
  | 'ocr'
  | 'integrity'
  | 'cancelled'
  | 'processing';

export interface NormalizedPdfErrorDisplay {
  code?: string;
  category: PdfErrorCategory;
  title: string;
  message: string;
  hint?: string;
  retryable: boolean;
}

interface PdfErrorAlertProps {
  error: PdfErrorInput | null | undefined;
  language?: Language;
  title?: string;
  compact?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

const SPANISH_HINTS_BY_CODE: Partial<Record<string, string>> = {
  ERR_INVALID_PDF: 'Verifica que el archivo tenga un encabezado %PDF- válido y no esté dañado.',
  ERR_EMPTY_FILE: 'Selecciona un archivo válido que no esté vacío.',
  ERR_FILE_TOO_LARGE: 'Usa un archivo de menos de 250 MB (100 MB en dispositivos móviles).',
  ERR_PASSWORD_REQUIRED: 'Ingresa la contraseña de usuario o propietario autorizada para este PDF.',
  ERR_INCORRECT_PASSWORD: 'Revisa la ortografía y las mayúsculas/minúsculas de la contraseña e inténtalo de nuevo.',
  ERR_PDF_LOAD_FAILED: 'Prueba la utilidad de Reparar PDF si la tabla de referencias está dañada.',
  ERR_MEMORY_LIMIT: 'Reduce la cantidad de archivos, páginas o resolución e inténtalo de nuevo.',
  ERR_OUTPUT_INTEGRITY: 'Revisa el PDF de origen por flujos dañados o intenta nuevamente.',
  ERR_INVALID_MAGIC_BYTES: 'Asegúrate de que el archivo sea un PDF real y no otro formato renombrado a .pdf.',
  ERR_INVALID_PDF_STRUCTURE: 'Usa la herramienta Reparar PDF para intentar recuperar la estructura.',
  ERR_EMPTY_PASSWORD: 'Ingresa una contraseña válida que no esté vacía.',
  ERR_SECOND_FILE_REQUIRED: 'Carga al menos dos archivos PDF antes de ejecutar la operación.',
  ERR_INVALID_PAGE_RANGE: 'Especifica números de página entre 1 y el total de páginas del documento.',
  ERR_CANNOT_DELETE_ALL_PAGES: 'Deja al menos una página sin eliminar.',
  ERR_REORDER_LENGTH_MISMATCH: 'Incluye todas las páginas del documento en la secuencia de orden.',
  ERR_INVALID_CROP_BOUNDS: 'Reduce los márgenes de recorte para mantener un área visible mínima.',
  ERR_INVALID_DIMENSIONS: 'Proporciona valores de ancho y alto positivos mayores que 10 puntos.',
  ERR_EMPTY_WATERMARK_CONTENT: 'Ingresa un texto no vacío para la marca de agua o anotación.',
  ERR_NO_IMAGES_FOUND: 'Si deseas convertir páginas completas en imágenes, usa PDF a Imágenes.',
  ERR_UNSUPPORTED_IMAGE_FORMAT: 'Carga una imagen válida en formato PNG o JPG/JPEG.',
  ERR_OCR_MODEL_LOAD_FAILED: 'Verifica tu conexión a internet para descargar el modelo OCR inicial.',
  ERR_MEMORY_LIMIT_EXCEEDED: 'Procesa menos páginas a la vez o utiliza un archivo más pequeño.',
  ERR_OPERATION_ABORTED: 'Puedes reiniciar la operación cuando estés listo.',
  ERR_OUTPUT_INTEGRITY_FAILURE: 'Intenta nuevamente o verifica si el archivo de origen está dañado.',
  ERR_PROCESSING_FAILURE: 'Verifica que el archivo sea válido y no esté bloqueado.',
};

function getTitleForCode(
  code: string | undefined,
  category: PdfErrorCategory,
  isEs: boolean,
  fallbackTitle?: string
): string {
  switch (code) {
    case 'ERR_PASSWORD_REQUIRED':
    case 'ERR_EMPTY_PASSWORD':
      return isEs ? 'Contraseña requerida' : 'Password Required';
    case 'ERR_INCORRECT_PASSWORD':
      return isEs ? 'Contraseña incorrecta' : 'Incorrect Password';
    case 'ERR_EMPTY_FILE':
      return isEs ? 'Archivo vacío' : 'Empty File';
    case 'ERR_FILE_TOO_LARGE':
    case 'ERR_MEMORY_LIMIT':
    case 'ERR_MEMORY_LIMIT_EXCEEDED':
      return isEs ? 'Límite de tamaño o memoria' : 'File Size or Memory Limit';
    case 'ERR_UNSUPPORTED_IMAGE_FORMAT':
    case 'ERR_XFA_UNSUPPORTED':
    case 'ERR_UNSUPPORTED_OPERATION':
      return isEs ? 'Formato u operación no compatible' : 'Unsupported File or Format';
    case 'ERR_INVALID_PDF':
    case 'ERR_INVALID_MAGIC_BYTES':
    case 'ERR_INVALID_PDF_STRUCTURE':
    case 'ERR_PDF_LOAD_FAILED':
    case 'ERR_REPAIR_UNRECOVERABLE':
      return isEs ? 'PDF inválido o ilegible' : 'Invalid or Unreadable PDF';
    case 'ERR_OCR_MODEL_LOAD_FAILED':
      return isEs ? 'Modelo OCR no disponible' : 'OCR Engine Unavailable';
    case 'ERR_OUTPUT_INTEGRITY':
    case 'ERR_OUTPUT_INTEGRITY_FAILURE':
      return isEs ? 'Error de verificación del resultado' : 'Output Verification Failed';
    case 'ERR_OPERATION_ABORTED':
      return isEs ? 'Operación cancelada' : 'Operation Cancelled';
    case 'ERR_SECOND_FILE_REQUIRED':
    case 'ERR_INVALID_PAGE_RANGE':
    case 'ERR_CANNOT_DELETE_ALL_PAGES':
    case 'ERR_REORDER_LENGTH_MISMATCH':
    case 'ERR_INVALID_CROP_BOUNDS':
    case 'ERR_INVALID_DIMENSIONS':
    case 'ERR_EMPTY_WATERMARK_CONTENT':
    case 'ERR_NO_IMAGES_FOUND':
      return isEs ? 'Ajusta las opciones o archivos' : 'Action Required';
    default:
      break;
  }

  switch (category) {
    case 'password':
      return isEs ? 'Contraseña requerida' : 'Password Required';
    case 'invalid-file':
      return isEs ? 'Archivo no válido' : 'Invalid or Unsupported File';
    case 'memory':
      return isEs ? 'Límite de tamaño o memoria' : 'File Size or Memory Limit';
    case 'ocr':
      return isEs ? 'Modelo OCR no disponible' : 'OCR Engine Unavailable';
    case 'cancelled':
      return isEs ? 'Operación cancelada' : 'Operation Cancelled';
    case 'validation':
      return isEs ? 'Verifica tu entrada' : 'Check Your Input';
    default:
      return fallbackTitle || (isEs ? 'No se pudo procesar el archivo' : 'Unable to Process File');
  }
}

function classifyCategory(code?: string, rawText = ''): PdfErrorCategory {
  if (code) {
    if (
      code === 'ERR_PASSWORD_REQUIRED' ||
      code === 'ERR_INCORRECT_PASSWORD' ||
      code === 'ERR_EMPTY_PASSWORD'
    ) {
      return 'password';
    }
    if (
      code === 'ERR_FILE_TOO_LARGE' ||
      code === 'ERR_MEMORY_LIMIT' ||
      code === 'ERR_MEMORY_LIMIT_EXCEEDED'
    ) {
      return 'memory';
    }
    if (code === 'ERR_OCR_MODEL_LOAD_FAILED') return 'ocr';
    if (code === 'ERR_OUTPUT_INTEGRITY' || code === 'ERR_OUTPUT_INTEGRITY_FAILURE') return 'integrity';
    if (code === 'ERR_OPERATION_ABORTED') return 'cancelled';
    if (
      code === 'ERR_INVALID_PDF' ||
      code === 'ERR_EMPTY_FILE' ||
      code === 'ERR_INVALID_MAGIC_BYTES' ||
      code === 'ERR_INVALID_PDF_STRUCTURE' ||
      code === 'ERR_PDF_LOAD_FAILED' ||
      code === 'ERR_REPAIR_UNRECOVERABLE' ||
      code === 'ERR_UNSUPPORTED_IMAGE_FORMAT' ||
      code === 'ERR_XFA_UNSUPPORTED'
    ) {
      return 'invalid-file';
    }
    if (
      code === 'ERR_SECOND_FILE_REQUIRED' ||
      code === 'ERR_INVALID_PAGE_RANGE' ||
      code === 'ERR_CANNOT_DELETE_ALL_PAGES' ||
      code === 'ERR_REORDER_LENGTH_MISMATCH' ||
      code === 'ERR_INVALID_CROP_BOUNDS' ||
      code === 'ERR_INVALID_DIMENSIONS' ||
      code === 'ERR_EMPTY_WATERMARK_CONTENT' ||
      code === 'ERR_NO_IMAGES_FOUND'
    ) {
      return 'validation';
    }
  }

  const lower = rawText.toLowerCase();
  if (lower.includes('passwordexception') || lower.includes('password') || lower.includes('encrypted')) {
    return 'password';
  }
  if (lower.includes('abort') || lower.includes('cancel')) {
    return 'cancelled';
  }
  if (lower.includes('memory') || lower.includes('too large') || lower.includes('exceeds')) {
    return 'memory';
  }
  if (lower.includes('ocr') || lower.includes('traineddata')) {
    return 'ocr';
  }
  if (
    lower.includes('%pdf-') ||
    lower.includes('magic bytes') ||
    lower.includes('unsupported') ||
    lower.includes('corrupt') ||
    lower.includes('invalid pdf') ||
    lower.includes('empty') ||
    lower.includes('zip file')
  ) {
    return 'invalid-file';
  }
  if (
    lower.includes('page range') ||
    lower.includes('at least') ||
    lower.includes('permutation') ||
    lower.includes('required')
  ) {
    return 'validation';
  }
  return 'processing';
}

function sanitizeTechnicalMessage(rawMessage: string, isEs: boolean): { message: string; hint?: string } {
  const trimmed = rawMessage.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('setting up fake worker failed') || lower.includes('failed to fetch dynamically imported module')) {
    return {
      message: isEs
        ? 'No se pudo inicializar el motor de procesamiento PDF en el navegador.'
        : 'The browser PDF engine failed to initialize for this document.',
      hint: isEs
        ? 'Recarga la página o verifica tu conexión e inténtalo de nuevo.'
        : 'Reload the page or verify your network connection, then try again.',
    };
  }

  if (lower.includes('passwordexception') || lower === 'no password given') {
    return {
      message: isEs
        ? 'Este documento PDF está protegido con contraseña.'
        : 'This PDF document is password-protected.',
      hint: isEs
        ? 'Ingresa la contraseña del documento para desbloquearlo y procesarlo.'
        : 'Enter the document password to unlock and process it.',
    };
  }

  if (lower.includes('unsupported zip file')) {
    return {
      message: isEs
        ? 'No se pudo leer la estructura comprimida del archivo cargado.'
        : 'The uploaded document archive could not be read.',
      hint: isEs
        ? 'Verifica que el archivo no esté dañado y corresponda al formato esperado.'
        : 'Verify that the file is not corrupted and matches the selected format.',
    };
  }

  return { message: trimmed };
}

export function normalizePdfDisplayError(
  error: PdfErrorInput | null | undefined,
  language: Language = 'en',
  fallbackTitle?: string
): NormalizedPdfErrorDisplay | null {
  if (!error) return null;
  const isEs = language === 'es';

  let structured: PdfProcessingError | PdfErrorObject | undefined;
  let rawMessage = '';

  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error instanceof Error) {
    const ext = error as Error & {
      code?: string;
      status?: string;
      messageEs?: string;
      recoverableHint?: string;
      pdfError?: PdfProcessingError;
    };
    structured = ext.pdfError || {
      code: ext.code,
      status: ext.status,
      message: ext.message,
      messageEs: ext.messageEs,
      recoverableHint: ext.recoverableHint,
    };
    rawMessage = structured.message || error.message;
  } else {
    const objError = error as PdfErrorObject;
    structured = objError.pdfError ?? objError;
    rawMessage = structured.message || '';
  }

  const code = structured?.code;
  const localizedRaw = isEs && structured?.messageEs ? structured.messageEs : rawMessage;
  const sanitized = sanitizeTechnicalMessage(localizedRaw || rawMessage, isEs);
  const category = classifyCategory(code, `${rawMessage} ${localizedRaw}`);
  const title = getTitleForCode(code, category, isEs, fallbackTitle);

  const hint =
    (isEs && code && SPANISH_HINTS_BY_CODE[code]) ||
    (!isEs && structured?.recoverableHint) ||
    sanitized.hint ||
    (isEs ? structured?.recoverableHint : undefined);

  const retryable =
    category === 'ocr' ||
    category === 'processing' ||
    category === 'integrity' ||
    category === 'cancelled';

  return {
    code,
    category,
    title,
    message: sanitized.message || (isEs ? 'No se pudo procesar el documento.' : 'Unable to process the document.'),
    hint,
    retryable,
  };
}

function renderCategoryIcon(category: PdfErrorCategory, compact: boolean) {
  const cls = compact ? 'w-4 h-4 shrink-0 mt-0.5' : 'w-4 h-4 shrink-0 mt-0.5';
  switch (category) {
    case 'password':
      return <Lock className={cls} aria-hidden="true" />;
    case 'invalid-file':
      return <FileWarning className={cls} aria-hidden="true" />;
    case 'memory':
    case 'ocr':
    case 'integrity':
      return <AlertTriangle className={cls} aria-hidden="true" />;
    default:
      return <AlertCircle className={cls} aria-hidden="true" />;
  }
}

export default function PdfErrorAlert({
  error,
  language = 'en',
  title,
  compact = false,
  onDismiss,
  onRetry,
  onReset,
  className = '',
}: PdfErrorAlertProps) {
  const normalized = normalizePdfDisplayError(error, language, title);
  if (!normalized) return null;

  const isEs = language === 'es';

  return (
    <div
      role="alert"
      data-pdf-error-code={normalized.code || normalized.category}
      className={`ui-error-state ${compact ? 'p-3' : ''} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {renderCategoryIcon(normalized.category, compact)}
          <div className="space-y-1 min-w-0">
            <div className="font-semibold text-xs leading-snug">
              {normalized.title}
            </div>
            <p className="text-xs font-normal leading-relaxed opacity-95 break-words">
              {normalized.message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={isEs ? 'Cerrar mensaje de error' : 'Dismiss error message'}
            className="p-1 rounded-md opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {normalized.hint && !compact && (
        <div className="mt-2.5 pt-2 border-t border-current/15 flex items-start gap-2 text-[11px] font-normal opacity-95">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{normalized.hint}</span>
        </div>
      )}

      {!compact && ((normalized.retryable && onRetry) || onReset) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {normalized.retryable && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-current/25 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isEs ? 'Reintentar' : 'Try Again'}</span>
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-current/20 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEs ? 'Probar otro archivo' : 'Upload Another File'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
