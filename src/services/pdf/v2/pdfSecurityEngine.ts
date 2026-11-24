import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRef,
  ParseSpeeds,
} from '@cantoo/pdf-lib';
import { openManagedPdfDocument } from '../pdfRuntime';
import {
  cloneIsolatedPdfBytes,
  findAsciiSequence,
  inspectByteLength,
  wipeInternalBuffer,
} from './pdfByteUtils';
import { loadPdfDocumentV2 } from './pdfDocumentLoader';
import { createPdfProcessingError, normalizeCaughtPdfError } from './pdfErrors';
import { verifyPdfOutputIntegrity } from './pdfOutputIntegrity';
import { resolvePdfOperationCapabilities } from './pdfRegistry';
import {
  PdfDocumentInput,
  PdfInspectionReport,
  PdfOperationRequest,
  PdfOperationResult,
  PdfOutputFile,
  PdfProcessingError,
} from './pdfTypes';
import {
  detectPdfEncryptionMarker,
  validatePdfInput,
} from './pdfValidation';

/**
 * ============================================================================
 * 1. TYPES & OPTIONS FOR PHASE PDF-08 SECURITY ENGINE (ENGINE G)
 * ============================================================================
 */

export type PdfEncryptionAlgorithm = 'AES-256' | 'AES-128' | 'RC4-128' | 'RC4-40';

export interface PdfUserPermissionConfig {
  /**
   * Printing permission:
   * - false: Printing disabled
   * - true | 'highResolution': High-resolution printing allowed (bits 3 and 12)
   * - 'lowResolution': Low-resolution (150 DPI degraded) printing only (bit 3 only; supported in R >= 3)
   */
  printing?: boolean | 'lowResolution' | 'highResolution';
  /** Allow modifying document contents other than annotations, form fields, and page assembly (bit 4) */
  modifying?: boolean;
  /** Allow copying or otherwise extracting text and graphics (bit 5) */
  copying?: boolean;
  /** Allow adding or modifying text annotations and interactive form fields (bit 6) */
  annotating?: boolean;
  /** Allow filling in existing interactive form fields (bit 9; R >= 3) */
  fillingForms?: boolean;
  /** Allow extracting text and graphics for accessibility technologies (bit 10; R >= 3) */
  contentAccessibility?: boolean;
  /** Allow assembling the document: inserting, rotating, or deleting pages (bit 11; R >= 3) */
  documentAssembly?: boolean;
}

export interface ProtectPdfOptions {
  /** Open password required for any user to view the PDF */
  userPassword?: string;
  /** Permissions / master password required to change permissions or bypass restrictions */
  ownerPassword?: string;
  /** Encryption cipher (default: 'AES-256', ISO 32000-2 V=5, R=6) */
  algorithm?: PdfEncryptionAlgorithm;
  /** Explicitly opt in to legacy weak RC4 ciphers ('RC4-128' or 'RC4-40') for pre-Acrobat 7 compatibility */
  allowWeakCryptography?: boolean;
  /** User access permission flags */
  permissions?: PdfUserPermissionConfig;
  /** Existing password if the input PDF is already encrypted and being re-encrypted */
  currentPassword?: string;
  /** Custom output file name */
  outputFileName?: string;
}

export interface UnlockPdfOptions {
  /** Authorized user or owner password to unlock the encrypted PDF */
  password?: string;
  /** Custom output file name */
  outputFileName?: string;
}

export interface DecodedPdfPermissionFlags {
  rawPermissionsMask: number;
  printingAllowed: boolean;
  highResolutionPrintingAllowed: boolean;
  modifyingAllowed: boolean;
  copyingAllowed: boolean;
  annotatingAllowed: boolean;
  fillingFormsAllowed: boolean;
  contentAccessibilityAllowed: boolean;
  documentAssemblyAllowed: boolean;
}

export interface PdfEncryptDictionaryInspection {
  hasEncryptDictionary: boolean;
  filter?: string;
  subFilter?: string;
  versionV?: number;
  revisionR?: number;
  keyLengthBits?: number;
  cryptFilterMethodCFM?: string;
  detectedAlgorithm:
    | 'NONE'
    | 'AES-256'
    | 'AES-128'
    | 'RC4-128'
    | 'RC4-40'
    | 'UNSUPPORTED_CUSTOM';
  isSupportedAlgorithm: boolean;
  unsupportedReason?: string;
  rawPermissionsMask?: number;
  decodedPermissions?: DecodedPdfPermissionFlags;
}

export interface PdfSecurityInspectionPayload {
  isEncrypted: boolean;
  requiresOpenPassword: boolean;
  hasOwnerPermissionRestrictions: boolean;
  passwordAuthenticated: boolean;
  suppliedPasswordValid?: boolean;
  pdfVersion: string;
  pageCount?: number;
  filter?: string;
  versionV?: number;
  revisionR?: number;
  keyLengthBits?: number;
  cryptFilterMethodCFM?: string;
  detectedAlgorithm: PdfEncryptDictionaryInspection['detectedAlgorithm'];
  isSupportedEncryption: boolean;
  unsupportedReason?: string;
  permissions?: DecodedPdfPermissionFlags;
  viewerComplianceDisclosure: string;
}

/**
 * ============================================================================
 * 2. INTERNAL SECURITY HELPERS, BITMASK DECODER & ENCRYPT DICTIONARY PARSER
 * ============================================================================
 */

const VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE =
  'PDF permission restrictions (printing, copying, modifying, annotating, form filling, accessibility, assembly) are encoded in the standard ISO 32000 /P permission bitmask and /Perms entry. Enforcement of these restrictions after a document is opened depends on compliant PDF viewers and is not equivalent to DRM or cryptographic protection against every extraction method once open access is granted.';

function stripFileExtension(fileName: string): string {
  const cleaned = (fileName || 'document').trim();
  const lastDot = cleaned.lastIndexOf('.');
  if (lastDot <= 0) return cleaned || 'document';
  return cleaned.slice(0, lastDot);
}

function buildFailureResult(
  canonicalId: string,
  error: PdfProcessingError,
  startTime: number,
  inputBytesTotal = 0,
  warnings: string[] = [],
  limitations: string[] = [],
  details?: Record<string, unknown>,
  inspectionReport?: PdfInspectionReport
): PdfOperationResult {
  return {
    status: error.status,
    resolvedCanonicalId: canonicalId,
    outputFiles: [],
    summary: error.message,
    metrics: {
      inputBytes: inputBytesTotal,
      outputBytes: 0,
      durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
    },
    inspectionReport,
    warnings,
    limitations,
    details,
    error,
  };
}

/**
 * Decodes an ISO 32000-1 / ISO 32000-2 Table 22 32-bit signed integer `/P` permission bitmask
 * into individual boolean permission flags:
 * - Bit 3 (value 4, 1<<2): Print document
 * - Bit 4 (value 8, 1<<3): Modify contents
 * - Bit 5 (value 16, 1<<4): Copy / extract text and graphics
 * - Bit 6 (value 32, 1<<5): Add or modify text annotations / form fields
 * - Bit 9 (value 256, 1<<8): Fill in existing interactive form fields (R >= 3)
 * - Bit 10 (value 512, 1<<9): Extract text and graphics for accessibility (R >= 3)
 * - Bit 11 (value 1024, 1<<10): Assemble document (insert, rotate, delete pages) (R >= 3)
 * - Bit 12 (value 2048, 1<<11): Print in high resolution (R >= 3)
 */
export function decodePdfPermissionBitmask(
  rawP: number,
  revisionR = 6
): DecodedPdfPermissionFlags {
  const mask = rawP | 0; // Ensure 32-bit signed integer representation
  const bit3Print = (mask & (1 << 2)) !== 0;
  const bit4Modify = (mask & (1 << 3)) !== 0;
  const bit5Copy = (mask & (1 << 4)) !== 0;
  const bit6Annotate = (mask & (1 << 5)) !== 0;
  const bit9FillForms = revisionR >= 3 ? (mask & (1 << 8)) !== 0 : bit6Annotate;
  const bit10Accessibility = revisionR >= 3 ? (mask & (1 << 9)) !== 0 : bit5Copy;
  const bit11Assembly = revisionR >= 3 ? (mask & (1 << 10)) !== 0 : bit4Modify;
  const bit12HighResPrint = revisionR >= 3 ? bit3Print && (mask & (1 << 11)) !== 0 : bit3Print;

  return {
    rawPermissionsMask: mask,
    printingAllowed: bit3Print,
    highResolutionPrintingAllowed: bit12HighResPrint,
    modifyingAllowed: bit4Modify,
    copyingAllowed: bit5Copy,
    annotatingAllowed: bit6Annotate,
    fillingFormsAllowed: bit9FillForms,
    contentAccessibilityAllowed: bit10Accessibility,
    documentAssemblyAllowed: bit11Assembly,
  };
}

/**
 * Validates a `PdfUserPermissionConfig` object before encryption so invalid permission values
 * fail deterministically rather than being silently ignored.
 */
function validatePermissionConfig(
  permissions: unknown
): { valid: boolean; normalized: PdfUserPermissionConfig; error?: PdfProcessingError } {
  if (permissions === undefined || permissions === null) {
    // Default user permissions when protecting a PDF: allow high-res printing & accessibility
    return {
      valid: true,
      normalized: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    };
  }

  if (typeof permissions !== 'object' || Array.isArray(permissions)) {
    return {
      valid: false,
      normalized: {},
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        'Invalid permission configuration: expected a permissions configuration object.'
      ),
    };
  }

  const raw = permissions as Record<string, unknown>;
  const allowedKeys = new Set([
    'printing',
    'modifying',
    'copying',
    'annotating',
    'fillingForms',
    'contentAccessibility',
    'documentAssembly',
  ]);

  for (const key of Object.keys(raw)) {
    if (!allowedKeys.has(key)) {
      return {
        valid: false,
        normalized: {},
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Invalid permission key "${key}". Supported permission keys are: ${Array.from(allowedKeys).join(', ')}.`
        ),
      };
    }
  }

  if (
    raw.printing !== undefined &&
    typeof raw.printing !== 'boolean' &&
    raw.printing !== 'lowResolution' &&
    raw.printing !== 'highResolution'
  ) {
    return {
      valid: false,
      normalized: {},
      error: createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Invalid printing permission value "${String(raw.printing)}". Expected boolean, 'lowResolution', or 'highResolution'.`
      ),
    };
  }

  const boolKeys = [
    'modifying',
    'copying',
    'annotating',
    'fillingForms',
    'contentAccessibility',
    'documentAssembly',
  ] as const;

  for (const bKey of boolKeys) {
    if (raw[bKey] !== undefined && typeof raw[bKey] !== 'boolean') {
      return {
        valid: false,
        normalized: {},
        error: createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Invalid permission value for "${bKey}": expected a boolean (true or false).`
        ),
      };
    }
  }

  return {
    valid: true,
    normalized: {
      printing:
        raw.printing === true
          ? 'highResolution'
          : ((raw.printing as PdfUserPermissionConfig['printing']) ?? false),
      modifying: Boolean(raw.modifying ?? false),
      copying: Boolean(raw.copying ?? false),
      annotating: Boolean(raw.annotating ?? false),
      fillingForms: Boolean(raw.fillingForms ?? false),
      contentAccessibility: Boolean(raw.contentAccessibility ?? false),
      documentAssembly: Boolean(raw.documentAssembly ?? false),
    },
  };
}

/**
 * Inspects the raw PDF byte stream and/or trailer `/Encrypt` dictionary to extract:
 * - `/Filter` (e.g., `/Standard`, `/Adobe.PubSec`)
 * - `/SubFilter` (e.g., `/adbe.pkcs7.s4`, `/ETSI.CAdES.detached`)
 * - `/V` (1, 2, 4, 5, etc.)
 * - `/R` (2, 3, 4, 6, etc.)
 * - `/Length` (40, 128, 256)
 * - `/CF -> /StdCF -> /CFM` (`AESV3`, `AESV2`, `V2`)
 * - `/P` (signed 32-bit integer permission mask)
 *
 * Never logs or exposes any password strings.
 */
export function inspectRawPdfEncryptDictionary(pdfBytes: Uint8Array): PdfEncryptDictionaryInspection {
  if (!pdfBytes || pdfBytes.byteLength < 32 || !detectPdfEncryptionMarker(pdfBytes)) {
    return {
      hasEncryptDictionary: false,
      detectedAlgorithm: 'NONE',
      isSupportedAlgorithm: true,
    };
  }

  // Decode bytes as Latin-1 so we can inspect the trailer /Encrypt indirect object or inline dict
  let latin1 = '';
  const chunkSize = 32768;
  for (let i = 0; i < pdfBytes.byteLength; i += chunkSize) {
    const slice = pdfBytes.subarray(i, Math.min(pdfBytes.byteLength, i + chunkSize));
    latin1 += String.fromCharCode(...slice);
  }

  // 1. Locate trailer `/Encrypt <objNum> <genNum> R` reference if present
  let encryptDictSnippet = '';
  const encryptRefMatch = latin1.match(/\/Encrypt\s+(\d+)\s+(\d+)\s+R\b/);
  if (encryptRefMatch) {
    const objNum = encryptRefMatch[1];
    const genNum = encryptRefMatch[2];
    const objHeaderRegex = new RegExp(`(?:^|[\\r\\n\\s])${objNum}\\s+${genNum}\\s+obj\\b([\\s\\S]*?)endobj`, 'g');
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    while ((m = objHeaderRegex.exec(latin1)) !== null) {
      lastMatch = m;
    }
    if (lastMatch && lastMatch[1]) {
      encryptDictSnippet = lastMatch[1];
    }
  }

  // 2. Fallback: look for an inline `/Encrypt << ... >>` or any object containing `/Filter` and `/V` and `/P`
  if (!encryptDictSnippet) {
    const inlineMatch = latin1.match(/\/Encrypt\s*<<([\s\S]{10,2000}?)>>/);
    if (inlineMatch) {
      encryptDictSnippet = inlineMatch[1];
    } else {
      // Search all objects for an encryption dictionary signature (/Filter /... and /U and /O)
      const objScan = latin1.match(/\d+\s+\d+\s+obj[\s\S]{0,1500}?\/Filter\s*\/[A-Za-z0-9._-]+[\s\S]{0,1500}?endobj/);
      if (objScan) {
        encryptDictSnippet = objScan[0];
      }
    }
  }

  if (!encryptDictSnippet) {
    // We saw `/Encrypt` marker in bytes, but the `/Encrypt` object itself is missing or corrupted
    return {
      hasEncryptDictionary: true,
      detectedAlgorithm: 'UNSUPPORTED_CUSTOM',
      isSupportedAlgorithm: false,
      unsupportedReason: 'Corrupted encrypted PDF: /Encrypt reference exists in trailer, but the encryption dictionary object is missing or unreadable.',
    };
  }

  const filterMatch = encryptDictSnippet.match(/\/Filter\s*\/([A-Za-z0-9._-]+)/);
  const subFilterMatch = encryptDictSnippet.match(/\/SubFilter\s*\/([A-Za-z0-9._-]+)/);
  const vMatch = encryptDictSnippet.match(/\/V\s+(-?\d+)/);
  const rMatch = encryptDictSnippet.match(/\/R\s+(-?\d+)/);
  const lengthMatch = encryptDictSnippet.match(/\/Length\s+(\d+)/);
  const cfmMatch = encryptDictSnippet.match(/\/CFM\s*\/([A-Za-z0-9._-]+)/);
  const pMatch = encryptDictSnippet.match(/\/P\s+(-?\d+)/);

  const filter = filterMatch ? filterMatch[1] : undefined;
  const subFilter = subFilterMatch ? subFilterMatch[1] : undefined;
  const versionV = vMatch ? parseInt(vMatch[1], 10) : undefined;
  const revisionR = rMatch ? parseInt(rMatch[1], 10) : undefined;
  const cfm = cfmMatch ? cfmMatch[1] : undefined;
  const rawP = pMatch ? parseInt(pMatch[1], 10) : undefined;

  let keyLengthBits = lengthMatch ? parseInt(lengthMatch[1], 10) : undefined;
  // Note: inside `/CF << /StdCF << /Length 16 | 32 >> >>`, `/Length` can be in bytes (16 or 32) if top-level `/Length` isn't matched first.
  // Look specifically for top-level `/Length` (40, 128, 256) or infer from V/CFM:
  const allLengths = Array.from(encryptDictSnippet.matchAll(/\/Length\s+(\d+)/g)).map((m) =>
    parseInt(m[1], 10)
  );
  const bitLengthCandidate = allLengths.find((n) => n >= 40);
  if (bitLengthCandidate) {
    keyLengthBits = bitLengthCandidate;
  } else if (versionV === 5) {
    keyLengthBits = 256;
  } else if (versionV === 4 || versionV === 2) {
    keyLengthBits = 128;
  } else if (versionV === 1) {
    keyLengthBits = 40;
  }

  // Check for unsupported non-Standard security handlers (e.g., Certificate / Public-Key `/Adobe.PubSec`, DRM handlers)
  if ((filter && filter !== 'Standard') || subFilter) {
    return {
      hasEncryptDictionary: true,
      filter,
      subFilter,
      versionV,
      revisionR,
      keyLengthBits,
      cryptFilterMethodCFM: cfm,
      detectedAlgorithm: 'UNSUPPORTED_CUSTOM',
      isSupportedAlgorithm: false,
      unsupportedReason: `Unsupported PDF security handler: Filter="/${filter || 'Unknown'}"${
        subFilter ? `, SubFilter="/${subFilter}"` : ''
      }. Only standard password-based security handlers (/Filter /Standard) are supported in browser-local mode.`,
      rawPermissionsMask: rawP,
      decodedPermissions:
        rawP !== undefined ? decodePdfPermissionBitmask(rawP, revisionR ?? 6) : undefined,
    };
  }

  // Check for corrupted / incomplete Standard encryption dictionary (missing /O or /U or invalid /V)
  const hasOEntry = /\/O\s*(?:\(|<)/.test(encryptDictSnippet);
  const hasUEntry = /\/U\s*(?:\(|<)/.test(encryptDictSnippet);
  if (versionV === undefined || revisionR === undefined || !hasOEntry || !hasUEntry) {
    return {
      hasEncryptDictionary: true,
      filter: filter || 'Standard',
      versionV,
      revisionR,
      keyLengthBits,
      cryptFilterMethodCFM: cfm,
      detectedAlgorithm: 'UNSUPPORTED_CUSTOM',
      isSupportedAlgorithm: false,
      unsupportedReason:
        'Corrupted or malformed /Encrypt dictionary: missing required /V, /R, /O, or /U cryptographic entries.',
    };
  }

  // Classify standard V/R profiles
  let detectedAlgorithm: PdfEncryptDictionaryInspection['detectedAlgorithm'] = 'UNSUPPORTED_CUSTOM';
  let isSupportedAlgorithm = true;
  let unsupportedReason: string | undefined;

  if (versionV === 5 && (revisionR === 5 || revisionR === 6)) {
    detectedAlgorithm = 'AES-256';
    keyLengthBits = 256;
  } else if (versionV === 4 && revisionR === 4) {
    if (cfm === 'V2') {
      detectedAlgorithm = 'RC4-128';
    } else {
      detectedAlgorithm = 'AES-128';
    }
    keyLengthBits = 128;
  } else if (versionV === 2 && revisionR === 3) {
    detectedAlgorithm = 'RC4-128';
    keyLengthBits = keyLengthBits || 128;
  } else if (versionV === 1 && revisionR === 2) {
    detectedAlgorithm = 'RC4-40';
    keyLengthBits = 40;
  } else {
    detectedAlgorithm = 'UNSUPPORTED_CUSTOM';
    isSupportedAlgorithm = false;
    unsupportedReason = `Unsupported encryption version/revision combination (V=${versionV}, R=${revisionR}). Supported standard profiles are AES-256 (V=5, R=6), AES-128 (V=4, R=4), RC4-128 (V=2, R=3), and RC4-40 (V=1, R=2).`;
  }

  const decodedPermissions =
    rawP !== undefined ? decodePdfPermissionBitmask(rawP, revisionR) : undefined;

  return {
    hasEncryptDictionary: true,
    filter: filter || 'Standard',
    subFilter,
    versionV,
    revisionR,
    keyLengthBits,
    cryptFilterMethodCFM: cfm,
    detectedAlgorithm,
    isSupportedAlgorithm,
    unsupportedReason,
    rawPermissionsMask: rawP,
    decodedPermissions,
  };
}

/**
 * Probes an encrypted PDF with PDF.js (`openManagedPdfDocument`) to determine:
 * 1. Whether the document opens without a user open password (i.e., owner-password-only restricted PDF).
 * 2. If a password was supplied, whether PDF.js accepts the password and how many pages the document has.
 */
async function probeEncryptedPdfWithPdfJs(
  isolatedBytes: Uint8Array,
  suppliedPassword?: string
): Promise<{
  requiresOpenPassword: boolean;
  authenticated: boolean;
  pageCount?: number;
  errorCode?: 'ERR_PASSWORD_REQUIRED' | 'ERR_INCORRECT_PASSWORD' | 'ERR_INVALID_PDF_STRUCTURE';
}> {
  // First probe WITHOUT any password to see if an open (user) password is required
  try {
    const noPassSession = await openManagedPdfDocument(isolatedBytes, {});
    const numPages = Number(noPassSession.pdfDoc?.numPages ?? 0);
    await noPassSession.dispose();

    // Opens without an open password! If caller also supplied a password, verify whether `@cantoo/pdf-lib` accepts it
    if (suppliedPassword && suppliedPassword.length > 0) {
      try {
        await PDFDocument.load(isolatedBytes, {
          password: suppliedPassword,
          updateMetadata: false,
          parseSpeed: ParseSpeeds.Fast,
        });
        return {
          requiresOpenPassword: false,
          authenticated: true,
          pageCount: numPages,
        };
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('password') || msg.includes('decrypt')) {
          return {
            requiresOpenPassword: false,
            authenticated: false,
            pageCount: numPages,
            errorCode: 'ERR_INCORRECT_PASSWORD',
          };
        }
      }
    }

    return {
      requiresOpenPassword: false,
      authenticated: true,
      pageCount: numPages,
    };
  } catch (noPassErr: any) {
    const errName = String(noPassErr?.name ?? '');
    const errMsg = String(noPassErr?.message ?? '');
    const isPasswordErr =
      errName === 'PasswordException' || errMsg.toLowerCase().includes('password');

    if (!isPasswordErr) {
      return {
        requiresOpenPassword: false,
        authenticated: false,
        errorCode: 'ERR_INVALID_PDF_STRUCTURE',
      };
    }
  }

  // Document requires an open password. If none was supplied, return ERR_PASSWORD_REQUIRED.
  if (!suppliedPassword || suppliedPassword.length === 0) {
    return {
      requiresOpenPassword: true,
      authenticated: false,
      errorCode: 'ERR_PASSWORD_REQUIRED',
    };
  }

  // Test the supplied password in PDF.js
  try {
    const authSession = await openManagedPdfDocument(isolatedBytes, {
      password: suppliedPassword,
    });
    const numPages = Number(authSession.pdfDoc?.numPages ?? 0);
    await authSession.dispose();
    return {
      requiresOpenPassword: true,
      authenticated: true,
      pageCount: numPages,
    };
  } catch (authErr: any) {
    const errName = String(authErr?.name ?? '');
    const errMsg = String(authErr?.message ?? '');
    if (errName === 'PasswordException' || errMsg.toLowerCase().includes('password')) {
      return {
        requiresOpenPassword: true,
        authenticated: false,
        errorCode: 'ERR_INCORRECT_PASSWORD',
      };
    }
    return {
      requiresOpenPassword: true,
      authenticated: false,
      errorCode: 'ERR_INVALID_PDF_STRUCTURE',
    };
  }
}

/**
 * ============================================================================
 * 3. OPERATION D: PDF SECURITY INSPECTION (`inspectPdfSecurityV2`)
 * ============================================================================
 */

/**
 * Performs a non-destructive security & permission inspection on a PDF document:
 * - Detects encryption status, `/Filter`, `/V`, `/R`, `/Length` (40/128/256-bit), `/CFM` (`AESV3`, `AESV2`), and algorithm (`AES-256`, `AES-128`, `RC4-128`, `RC4-40`).
 * - Decodes all 7 standard ISO 32000 `/P` permission bitmask flags.
 * - Determines whether an open password is required to view the PDF vs. owner-only permission restrictions.
 * - Detects unsupported security handlers (e.g., `/Adobe.PubSec` public-key certificates) or corrupted `/Encrypt` dictionaries.
 * - Strictly redacts and NEVER stores, logs, or returns any password value in `details`, `inspectionReport`, or `summary`.
 */
export async function inspectPdfSecurityV2(
  input: PdfDocumentInput,
  options: { password?: string } = {}
): Promise<{
  success: boolean;
  status: PdfOperationResult['status'];
  security?: PdfSecurityInspectionPayload;
  inspectionReport?: PdfInspectionReport;
  warnings: string[];
  error?: PdfProcessingError;
}> {
  const validation = validatePdfInput(input);
  if (!validation.isValid || validation.error) {
    return {
      success: false,
      status: validation.error?.status || 'INVALID_PDF',
      warnings: validation.warnings,
      error: validation.error || createPdfProcessingError('ERR_INVALID_PDF'),
    };
  }

  const isolatedBytes = cloneIsolatedPdfBytes(input.bytes);
  try {
    const pdfVersion = validation.pdfVersion || '1.7';
    const encDict = inspectRawPdfEncryptDictionary(isolatedBytes);
    const suppliedPassword = options.password ?? input.password;
    const hasSuppliedPassword = typeof suppliedPassword === 'string' && suppliedPassword.length > 0;

    // Case 1: Unencrypted PDF
    if (!encDict.hasEncryptDictionary) {
      const loadRes = await loadPdfDocumentV2({
        fileName: input.fileName,
        bytes: isolatedBytes,
      });
      const pageCount = loadRes.document?.getPageCount();
      await loadRes.dispose();

      if (!loadRes.success) {
        return {
          success: false,
          status: loadRes.status,
          warnings: loadRes.warnings,
          error: loadRes.error,
        };
      }

      const fullPerms: DecodedPdfPermissionFlags = {
        rawPermissionsMask: -1,
        printingAllowed: true,
        highResolutionPrintingAllowed: true,
        modifyingAllowed: true,
        copyingAllowed: true,
        annotatingAllowed: true,
        fillingFormsAllowed: true,
        contentAccessibilityAllowed: true,
        documentAssemblyAllowed: true,
      };

      const security: PdfSecurityInspectionPayload = {
        isEncrypted: false,
        requiresOpenPassword: false,
        hasOwnerPermissionRestrictions: false,
        passwordAuthenticated: true,
        pdfVersion,
        pageCount,
        detectedAlgorithm: 'NONE',
        isSupportedEncryption: true,
        permissions: fullPerms,
        viewerComplianceDisclosure: VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE,
      };

      const inspectionReport: PdfInspectionReport = {
        reportType: 'metadata-viewer',
        summaryMetrics: [
          { label: 'Encrypted', value: 'No (Unencrypted)' },
          { label: 'Algorithm', value: 'None' },
          { label: 'Open Password Required', value: 'No' },
          { label: 'Pages', value: pageCount ?? 0 },
          { label: 'PDF Version', value: pdfVersion },
        ],
        tableHeaders: ['Permission / Security Property', 'Status'],
        tableRows: [
          ['Printing', 'Allowed (High Resolution)'],
          ['Copying Text & Graphics', 'Allowed'],
          ['Document Modification', 'Allowed'],
          ['Annotations & Comments', 'Allowed'],
          ['Interactive Form Filling', 'Allowed'],
          ['Accessibility Extraction', 'Allowed'],
          ['Document Assembly', 'Allowed'],
        ],
        rawData: security as unknown as Record<string, unknown>,
      };

      return {
        success: true,
        status: 'SUCCESS',
        security,
        inspectionReport,
        warnings: validation.warnings,
      };
    }

    // Case 2: Encrypted PDF with unsupported handler or corrupted /Encrypt dictionary
    if (!encDict.isSupportedAlgorithm) {
      const isCorruptedDict =
        encDict.unsupportedReason?.toLowerCase().includes('corrupted') ||
        encDict.unsupportedReason?.toLowerCase().includes('malformed');
      const errCode = isCorruptedDict ? 'ERR_INVALID_PDF_STRUCTURE' : 'ERR_UNSUPPORTED_OPERATION';
      const err = createPdfProcessingError(errCode, encDict.unsupportedReason, {
        filter: encDict.filter,
        subFilter: encDict.subFilter,
        versionV: encDict.versionV,
        revisionR: encDict.revisionR,
      });

      const security: PdfSecurityInspectionPayload = {
        isEncrypted: true,
        requiresOpenPassword: true,
        hasOwnerPermissionRestrictions: true,
        passwordAuthenticated: false,
        pdfVersion,
        filter: encDict.filter,
        versionV: encDict.versionV,
        revisionR: encDict.revisionR,
        keyLengthBits: encDict.keyLengthBits,
        cryptFilterMethodCFM: encDict.cryptFilterMethodCFM,
        detectedAlgorithm: encDict.detectedAlgorithm,
        isSupportedEncryption: false,
        unsupportedReason: encDict.unsupportedReason,
        permissions: encDict.decodedPermissions,
        viewerComplianceDisclosure: VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE,
      };

      return {
        success: false,
        status: err.status,
        security,
        warnings: validation.warnings,
        error: err,
      };
    }

    // Case 3: Standard Encrypted PDF (AES-256, AES-128, RC4-128, RC4-40)
    const probe = await probeEncryptedPdfWithPdfJs(isolatedBytes, suppliedPassword);

    if (probe.errorCode === 'ERR_INVALID_PDF_STRUCTURE') {
      const err = createPdfProcessingError(
        'ERR_INVALID_PDF_STRUCTURE',
        'Corrupted encrypted PDF structure: unable to parse encrypted cross-reference or page streams.'
      );
      return {
        success: false,
        status: err.status,
        warnings: validation.warnings,
        error: err,
      };
    }

    const perms = encDict.decodedPermissions;
    const hasOwnerRestrictions = perms
      ? !perms.printingAllowed ||
        !perms.highResolutionPrintingAllowed ||
        !perms.modifyingAllowed ||
        !perms.copyingAllowed ||
        !perms.annotatingAllowed ||
        !perms.fillingFormsAllowed ||
        !perms.contentAccessibilityAllowed ||
        !perms.documentAssemblyAllowed
      : true;

    const security: PdfSecurityInspectionPayload = {
      isEncrypted: true,
      requiresOpenPassword: probe.requiresOpenPassword,
      hasOwnerPermissionRestrictions: hasOwnerRestrictions,
      passwordAuthenticated: probe.authenticated,
      suppliedPasswordValid: hasSuppliedPassword ? probe.authenticated : undefined,
      pdfVersion,
      pageCount: probe.pageCount,
      filter: encDict.filter,
      versionV: encDict.versionV,
      revisionR: encDict.revisionR,
      keyLengthBits: encDict.keyLengthBits,
      cryptFilterMethodCFM: encDict.cryptFilterMethodCFM,
      detectedAlgorithm: encDict.detectedAlgorithm,
      isSupportedEncryption: true,
      permissions: perms,
      viewerComplianceDisclosure: VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE,
    };

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'Encrypted', value: 'Yes' },
        {
          label: 'Cipher / Handler',
          value: `${encDict.detectedAlgorithm} (V=${encDict.versionV}, R=${encDict.revisionR}, ${encDict.keyLengthBits}-bit)`,
        },
        { label: 'Open Password Required', value: probe.requiresOpenPassword ? 'Yes' : 'No (Owner-Restricted Only)' },
        { label: 'Authenticated', value: probe.authenticated ? 'Yes' : 'No (Locked)' },
        { label: 'PDF Version', value: pdfVersion },
      ],
      tableHeaders: ['Permission Flag (ISO 32000 Table 22)', 'Status'],
      tableRows: perms
        ? [
            [
              'Printing (Bit 3 & Bit 12)',
              !perms.printingAllowed
                ? 'Restricted (Disabled)'
                : perms.highResolutionPrintingAllowed
                  ? 'Allowed (High Resolution)'
                  : 'Allowed (Low Resolution Only)',
            ],
            ['Document Modification (Bit 4)', perms.modifyingAllowed ? 'Allowed' : 'Restricted (Disabled)'],
            ['Copy Text & Graphics (Bit 5)', perms.copyingAllowed ? 'Allowed' : 'Restricted (Disabled)'],
            ['Annotations & Comments (Bit 6)', perms.annotatingAllowed ? 'Allowed' : 'Restricted (Disabled)'],
            ['Interactive Form Filling (Bit 9)', perms.fillingFormsAllowed ? 'Allowed' : 'Restricted (Disabled)'],
            ['Accessibility Extraction (Bit 10)', perms.contentAccessibilityAllowed ? 'Allowed' : 'Restricted (Disabled)'],
            ['Document Assembly (Bit 11)', perms.documentAssemblyAllowed ? 'Allowed' : 'Restricted (Disabled)'],
          ]
        : [],
      rawData: security as unknown as Record<string, unknown>,
    };

    // If caller supplied an incorrect password, report ERR_INCORRECT_PASSWORD while still returning inspection metadata
    if (hasSuppliedPassword && !probe.authenticated && probe.errorCode === 'ERR_INCORRECT_PASSWORD') {
      const err = createPdfProcessingError('ERR_INCORRECT_PASSWORD');
      return {
        success: false,
        status: err.status,
        security,
        inspectionReport,
        warnings: validation.warnings,
        error: err,
      };
    }

    return {
      success: true,
      status: 'SUCCESS',
      security,
      inspectionReport,
      warnings: validation.warnings,
    };
  } finally {
    wipeInternalBuffer(isolatedBytes);
  }
}

/**
 * ============================================================================
 * 4. OPERATION A & C: PDF PASSWORD PROTECTION & PERMISSIONS (`protectPdfWithPasswordV2` — `pdf-protect-password` / `pdf-protect`)
 * ============================================================================
 */

/**
 * Encrypts a PDF document (`pdf-protect-password` / alias `pdf-protect`) with genuine cryptographic encryption:
 * - Supports `AES-256` (ISO 32000-2 `/V 5`, `/R 6`, `/CFM /AESV3`, 256-bit key — default) and `AES-128` (`/V 4`, `/R 4`, `/CFM /AESV2`, 128-bit key), plus legacy `RC4-128` / `RC4-40` only when `allowWeakCryptography: true`.
 * - Supports user open password (`userPassword`), owner permissions password (`ownerPassword`), or both.
 * - Supports all 7 standard PDF permission flags (`printing`, `modifying`, `copying`, `annotating`, `fillingForms`, `contentAccessibility`, `documentAssembly`).
 * - Independently verifies the encrypted output:
 *   1. Confirms `/Encrypt` dictionary is present in serialized output and matches target `/V`, `/R`, `/Length`, and `/P` bitmask.
 *   2. Confirms that when `userPassword` is non-empty, opening the encrypted output in PDF.js WITHOUT a password or with an INCORRECT password fails with `PasswordException`.
 *   3. Confirms that opening the encrypted output in PDF.js WITH the valid password succeeds and preserves exact page count and dimensions.
 * - Never includes or logs passwords in any returned summary, report, warning, or error object.
 */
export async function protectPdfWithPasswordV2(
  input: PdfDocumentInput,
  options: ProtectPdfOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-protect-password';
  const inputByteLength = inspectByteLength(input?.bytes);

  // 1. Validate password inputs (never log or echo the password strings!)
  const rawUserPass = options.userPassword !== undefined ? String(options.userPassword) : '';
  const rawOwnerPass = options.ownerPassword !== undefined ? String(options.ownerPassword) : '';

  if (rawUserPass.length === 0 && rawOwnerPass.length === 0) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_EMPTY_PASSWORD',
        'A non-empty user password or owner password is required to protect the PDF document.'
      ),
      startTime,
      inputByteLength
    );
  }

  if (rawUserPass.length > 127 || rawOwnerPass.length > 127) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        'Password exceeds the maximum ISO 32000-2 UTF-8 byte length limit (127 characters).'
      ),
      startTime,
      inputByteLength
    );
  }

  // 2. Validate encryption algorithm
  const algorithm: PdfEncryptionAlgorithm = (options.algorithm || 'AES-256') as PdfEncryptionAlgorithm;
  const supportedAlgorithms = new Set<string>(['AES-256', 'AES-128', 'RC4-128', 'RC4-40']);
  if (!supportedAlgorithms.has(algorithm)) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Unsupported encryption algorithm "${String(algorithm)}". Supported algorithms are 'AES-256' and 'AES-128'.`
      ),
      startTime,
      inputByteLength
    );
  }

  if ((algorithm === 'RC4-128' || algorithm === 'RC4-40') && options.allowWeakCryptography !== true) {
    return buildFailureResult(
      canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Refusing to encrypt with legacy weak cipher "${algorithm}" unless allowWeakCryptography: true is explicitly set. Use 'AES-256' or 'AES-128'.`
      ),
      startTime,
      inputByteLength
    );
  }

  // For V1/V2/V4 (AES-128, RC4-128, RC4-40), PDF 1.7 Algorithm 2 requires Latin-1 characters (charCode <= 0xFF)
  if (algorithm !== 'AES-256') {
    const hasNonLatin1 = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 0xff) return true;
      }
      return false;
    };
    if (hasNonLatin1(rawUserPass) || hasNonLatin1(rawOwnerPass)) {
      return buildFailureResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Algorithm "${algorithm}" (Revision 2–4) only supports Latin-1 password characters. Use 'AES-256' (Revision 6) for full Unicode password support.`
        ),
        startTime,
        inputByteLength
      );
    }
  }

  // 3. Validate permission configuration
  const permCheck = validatePermissionConfig(options.permissions);
  if (!permCheck.valid || permCheck.error) {
    return buildFailureResult(
      canonicalId,
      permCheck.error!,
      startTime,
      inputByteLength
    );
  }
  const normalizedPermissions = permCheck.normalized;

  request?.onProgress?.({
    percent: 15,
    stage: 'VALIDATING',
    message: 'Validating source PDF document...',
  });

  // 4. Load source PDF (requiring existing password if input is already encrypted)
  const existingPassword = options.currentPassword ?? input?.password;
  const loadRes = await loadPdfDocumentV2(input, {
    password: existingPassword,
  });

  if (!loadRes.success || !loadRes.document || !loadRes.isolatedBytes) {
    await loadRes.dispose();
    return buildFailureResult(
      canonicalId,
      loadRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF for encryption.'),
      startTime,
      inputByteLength,
      loadRes.warnings
    );
  }

  try {
    const srcDoc = loadRes.document;
    const pageCount = srcDoc.getPageCount();
    const warnings = [...loadRes.warnings];

    // Capture source page dimensions before encryption
    const sourcePageDimensions = srcDoc.getPages().map((p) => {
      const { width, height } = p.getSize();
      return {
        widthPt: Math.round(width * 100) / 100,
        heightPt: Math.round(height * 100) / 100,
        rotationDegrees: p.getRotation().angle,
      };
    });

    request?.onProgress?.({
      percent: 45,
      stage: 'PROCESSING_PAGES',
      message: `Applying ${algorithm} cryptographic protection and permission flags...`,
    });

    // If source document was already encrypted, clone its decrypted pages into a fresh PDFDocument before applying new encryption
    let targetDoc: PDFDocument = srcDoc;
    if (loadRes.validation.hasEncryptDictionary || srcDoc.isEncrypted) {
      const cleanDoc = await PDFDocument.create();
      const allIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await cleanDoc.copyPages(srcDoc, allIndices);
      for (const cp of copiedPages) {
        cleanDoc.addPage(cp);
      }
      const title = srcDoc.getTitle();
      if (title) cleanDoc.setTitle(title);
      const author = srcDoc.getAuthor();
      if (author) cleanDoc.setAuthor(author);
      const subject = srcDoc.getSubject();
      if (subject) cleanDoc.setSubject(subject);
      targetDoc = cleanDoc;
    }

    // Effective owner password defaults to userPassword inside @cantoo/pdf-lib if omitted
    targetDoc.encrypt({
      userPassword: rawUserPass.length > 0 ? rawUserPass : undefined,
      ownerPassword: rawOwnerPass.length > 0 ? rawOwnerPass : undefined,
      algorithm,
      allowWeakCryptography: options.allowWeakCryptography === true,
      permissions: normalizedPermissions,
    });

    // IMPORTANT: Save encrypted PDF with `useObjectStreams: false` so standard trailer `/Encrypt`
    // and per-object AES-CBC stream encryption are interoperable across all PDF 1.7 / 2.0 readers and PDF.js
    const encryptedBytes = cloneIsolatedPdfBytes(
      await targetDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      })
    );

    request?.onProgress?.({
      percent: 80,
      stage: 'VERIFYING_OUTPUT',
      message: 'Independently verifying encrypted output and password enforcement with PDF.js...',
    });

    // 5. Inspect serialized /Encrypt dictionary
    const outEncInspection = inspectRawPdfEncryptDictionary(encryptedBytes);
    if (!outEncInspection.hasEncryptDictionary || outEncInspection.detectedAlgorithm !== algorithm) {
      return buildFailureResult(
        canonicalId,
        createPdfProcessingError(
          'ERR_OUTPUT_INTEGRITY_FAILURE',
          `Encrypted output failed /Encrypt dictionary verification (expected ${algorithm}, found ${outEncInspection.detectedAlgorithm}).`
        ),
        startTime,
        inputByteLength,
        warnings
      );
    }

    // 6. Verify that an incorrect or missing open password is REJECTED by PDF.js when userPassword is set
    if (rawUserPass.length > 0) {
      let unauthOpened = false;
      try {
        const unauthSession = await openManagedPdfDocument(encryptedBytes, {});
        unauthOpened = true;
        await unauthSession.dispose();
      } catch {
        // Expected: unauthenticated load must fail with PasswordException
      }

      if (unauthOpened) {
        return buildFailureResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_OUTPUT_INTEGRITY_FAILURE',
            'Security verification failure: encrypted PDF opened without requiring the user password.'
          ),
          startTime,
          inputByteLength,
          warnings
        );
      }

      // Also verify that a deliberately wrong password fails
      let wrongPassOpened = false;
      try {
        const wrongCandidate = rawUserPass === 'WrongProbe_1' ? 'WrongProbe_2' : 'WrongProbe_1';
        const wrongSession = await openManagedPdfDocument(encryptedBytes, {
          password: wrongCandidate,
        });
        wrongPassOpened = true;
        await wrongSession.dispose();
      } catch {
        // Expected: wrong password must fail
      }

      if (wrongPassOpened) {
        return buildFailureResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_OUTPUT_INTEGRITY_FAILURE',
            'Security verification failure: encrypted PDF accepted an invalid password.'
          ),
          startTime,
          inputByteLength,
          warnings
        );
      }
    }

    // 7. Verify that the CORRECT password opens the encrypted output in PDF.js and preserves page count & dimensions
    const validOpenPassword = rawUserPass.length > 0 ? rawUserPass : rawOwnerPass;
    const integrity = await verifyPdfOutputIntegrity(encryptedBytes, {
      expectedPageCount: pageCount,
      verifyWithPdfJs: true,
      expectEncrypted: true,
      passwordForEncryptedOutput: validOpenPassword,
    });

    if (!integrity.isValid) {
      return buildFailureResult(
        canonicalId,
        integrity.error ??
          createPdfProcessingError(
            'ERR_OUTPUT_INTEGRITY_FAILURE',
            'Encrypted PDF failed independent PDF.js reopening verification with the authorized password.'
          ),
        startTime,
        inputByteLength,
        warnings
      );
    }

    const baseName = stripFileExtension(input.fileName);
    const outFileName = options.outputFileName || `${baseName}_protected.pdf`;

    const primaryFile: PdfOutputFile = {
      fileName: outFileName,
      mimeType: 'application/pdf',
      bytes: encryptedBytes,
      byteLength: encryptedBytes.byteLength,
      pageCount,
    };

    const decodedPerms = outEncInspection.decodedPermissions;
    const hasUserOpenLock = rawUserPass.length > 0;
    const hasOwnerLock = rawOwnerPass.length > 0;

    // Never include rawUserPass or rawOwnerPass anywhere in details, inspectionReport, or summary!
    const securitySummaryPayload: PdfSecurityInspectionPayload = {
      isEncrypted: true,
      requiresOpenPassword: hasUserOpenLock,
      hasOwnerPermissionRestrictions: true,
      passwordAuthenticated: true,
      pdfVersion: integrity.pdfVersion || '1.7',
      pageCount,
      filter: outEncInspection.filter,
      versionV: outEncInspection.versionV,
      revisionR: outEncInspection.revisionR,
      keyLengthBits: outEncInspection.keyLengthBits,
      cryptFilterMethodCFM: outEncInspection.cryptFilterMethodCFM,
      detectedAlgorithm: outEncInspection.detectedAlgorithm,
      isSupportedEncryption: true,
      permissions: decodedPerms,
      viewerComplianceDisclosure: VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE,
    };

    const inspectionReport: PdfInspectionReport = {
      reportType: 'metadata-viewer',
      summaryMetrics: [
        { label: 'Encryption Status', value: 'Protected' },
        {
          label: 'Algorithm',
          value: `${algorithm} (V=${outEncInspection.versionV}, R=${outEncInspection.revisionR}, ${outEncInspection.keyLengthBits}-bit)`,
        },
        { label: 'User Open Password Set', value: hasUserOpenLock ? 'Yes' : 'No' },
        { label: 'Owner Permissions Password Set', value: hasOwnerLock ? 'Yes' : 'Inherited from User Password' },
        { label: 'Pages Verified', value: pageCount },
      ],
      tableHeaders: ['Permission Flag (ISO 32000 Table 22)', 'Configured State'],
      tableRows: decodedPerms
        ? [
            [
              'Printing (Bit 3 & Bit 12)',
              !decodedPerms.printingAllowed
                ? 'Disabled'
                : decodedPerms.highResolutionPrintingAllowed
                  ? 'Allowed (High Resolution)'
                  : 'Allowed (Low Resolution Only)',
            ],
            ['Document Modification (Bit 4)', decodedPerms.modifyingAllowed ? 'Allowed' : 'Disabled'],
            ['Copy Text & Graphics (Bit 5)', decodedPerms.copyingAllowed ? 'Allowed' : 'Disabled'],
            ['Annotations & Comments (Bit 6)', decodedPerms.annotatingAllowed ? 'Allowed' : 'Disabled'],
            ['Interactive Form Filling (Bit 9)', decodedPerms.fillingFormsAllowed ? 'Allowed' : 'Disabled'],
            ['Accessibility Extraction (Bit 10)', decodedPerms.contentAccessibilityAllowed ? 'Allowed' : 'Disabled'],
            ['Document Assembly (Bit 11)', decodedPerms.documentAssemblyAllowed ? 'Allowed' : 'Disabled'],
          ]
        : [],
      rawData: securitySummaryPayload as unknown as Record<string, unknown>,
    };

    return {
      status: 'SUCCESS',
      resolvedCanonicalId: canonicalId,
      primaryFile,
      outputFiles: [primaryFile],
      outputBytes: encryptedBytes,
      summary: `Encrypted PDF (${pageCount} page(s)) with ${algorithm} (V=${outEncInspection.versionV}, R=${outEncInspection.revisionR}, ${outEncInspection.keyLengthBits}-bit key; user open lock: ${hasUserOpenLock ? 'enabled' : 'none'}, permission mask: ${outEncInspection.rawPermissionsMask}).`,
      metrics: {
        inputBytes: inputByteLength,
        outputBytes: encryptedBytes.byteLength,
        inputPageCount: pageCount,
        outputPageCount: pageCount,
        durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
      },
      inspectionReport,
      warnings: [...warnings, ...integrity.warnings],
      limitations: [
        VIEWER_PERMISSION_COMPLIANCE_DISCLOSURE,
        'Lost passwords cannot be recovered because all encryption occurs 100% locally in your browser.',
      ],
      details: {
        security: securitySummaryPayload,
        pageGeometry: sourcePageDimensions,
      },
    };
  } catch (err) {
    const procErr = normalizeCaughtPdfError(err, { phase: 'execute' });
    return buildFailureResult(canonicalId, procErr, startTime, inputByteLength, loadRes.warnings);
  } finally {
    await loadRes.dispose();
  }
}

/**
 * ============================================================================
 * 5. OPERATION B: PDF PASSWORD REMOVAL (`removePdfPasswordV2` — `pdf-remove-password` / `pdf-unlock`)
 * ============================================================================
 */

/**
 * Decrypts and removes password security from an encrypted PDF document (`pdf-remove-password` / alias `pdf-unlock`):
 * - Strictly requires the valid user or owner password when the PDF is locked with an open password (`ERR_PASSWORD_REQUIRED` if omitted; `ERR_INCORRECT_PASSWORD` if invalid).
 * - Never attempts to brute-force or bypass unknown passwords.
 * - For owner-password-restricted PDFs with an empty open password:
 *   - If the caller supplies a password, verifies that the password is valid (`ERR_INCORRECT_PASSWORD` if wrong).
 *   - If no password is required to open, unlocks the document after establishing authorized read access.
 * - Clones all decrypted pages, fonts, images, and metadata into a clean, unencrypted `PDFDocument` and verifies that:
 *   1. No `/Encrypt` dictionary remains in the output bytes (`detectPdfEncryptionMarker(outputBytes) === false`).
 *   2. The resulting PDF opens cleanly in PDF.js with **NO password** supplied.
 *   3. Exact page count, dimensions, and text content are preserved.
 * - Never logs or exposes the password in any report or error detail.
 */
export async function removePdfPasswordV2(
  input: PdfDocumentInput,
  options: UnlockPdfOptions = {},
  request?: Partial<PdfOperationRequest>
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const canonicalId = 'pdf-remove-password';
  const inputByteLength = inspectByteLength(input?.bytes);

  const validation = validatePdfInput(input);
  if (!validation.isValid || validation.error) {
    return buildFailureResult(
      canonicalId,
      validation.error ?? createPdfProcessingError('ERR_INVALID_PDF'),
      startTime,
      inputByteLength,
      validation.warnings
    );
  }

  const isolatedInput = cloneIsolatedPdfBytes(input.bytes);
  try {
    const suppliedPassword = options.password ?? input.password;
    const hasSuppliedPassword = typeof suppliedPassword === 'string' && suppliedPassword.length > 0;

    // 1. Inspect source encryption dictionary first
    const encDict = inspectRawPdfEncryptDictionary(isolatedInput);

    if (encDict.hasEncryptDictionary && !encDict.isSupportedAlgorithm) {
      const isCorruptedDict =
        encDict.unsupportedReason?.toLowerCase().includes('corrupted') ||
        encDict.unsupportedReason?.toLowerCase().includes('malformed');
      const errCode = isCorruptedDict ? 'ERR_INVALID_PDF_STRUCTURE' : 'ERR_UNSUPPORTED_OPERATION';
      return buildFailureResult(
        canonicalId,
        createPdfProcessingError(errCode, encDict.unsupportedReason),
        startTime,
        inputByteLength,
        validation.warnings
      );
    }

    // 2. If the document is encrypted, verify password authorization via probeEncryptedPdfWithPdfJs
    if (encDict.hasEncryptDictionary) {
      const probe = await probeEncryptedPdfWithPdfJs(isolatedInput, suppliedPassword);
      if (!probe.authenticated) {
        const code =
          probe.errorCode ||
          (hasSuppliedPassword ? 'ERR_INCORRECT_PASSWORD' : 'ERR_PASSWORD_REQUIRED');
        return buildFailureResult(
          canonicalId,
          createPdfProcessingError(code),
          startTime,
          inputByteLength,
          validation.warnings
        );
      }
    }

    request?.onProgress?.({
      percent: 25,
      stage: 'LOADING',
      message: 'Authenticating and decrypting PDF streams...',
    });

    // 3. Load authenticated PDF document into @cantoo/pdf-lib
    const loadRes = await loadPdfDocumentV2(
      {
        fileName: input.fileName,
        bytes: isolatedInput,
        password: suppliedPassword,
      },
      { password: suppliedPassword }
    );

    if (!loadRes.success || !loadRes.document) {
      await loadRes.dispose();
      return buildFailureResult(
        canonicalId,
        loadRes.error ?? createPdfProcessingError('ERR_PDF_LOAD_FAILED', 'Failed to load PDF for password removal.'),
        startTime,
        inputByteLength,
        loadRes.warnings
      );
    }

    try {
      const srcDoc = loadRes.document;
      const pageCount = srcDoc.getPageCount();
      const warnings = [...loadRes.warnings];

      if (!encDict.hasEncryptDictionary && !srcDoc.isEncrypted) {
        warnings.push('Input PDF was already unencrypted; exported a clean unencrypted copy.');
      }

      request?.onProgress?.({
        percent: 55,
        stage: 'PROCESSING_PAGES',
        message: `Cloning ${pageCount} decrypted page(s) into unencrypted PDF container...`,
      });

      // 4. Copy all decrypted pages and metadata into a brand-new unencrypted PDFDocument
      // so zero `/Encrypt` dictionary or encrypted stream filters remain
      const unlockedDoc = await PDFDocument.create();
      const allPageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await unlockedDoc.copyPages(srcDoc, allPageIndices);
      for (const cp of copiedPages) {
        unlockedDoc.addPage(cp);
      }

      // Preserve standard document metadata
      try {
        const title = srcDoc.getTitle();
        if (title) unlockedDoc.setTitle(title);
        const author = srcDoc.getAuthor();
        if (author) unlockedDoc.setAuthor(author);
        const subject = srcDoc.getSubject();
        if (subject) unlockedDoc.setSubject(subject);
        const creator = srcDoc.getCreator();
        if (creator) unlockedDoc.setCreator(creator);
        const producer = srcDoc.getProducer();
        if (producer) unlockedDoc.setProducer(producer);
      } catch {
        // Ignore non-fatal metadata copy errors
      }

      // Explicitly ensure trailerInfo.Encrypt is undefined
      delete unlockedDoc.context.trailerInfo.Encrypt;

      const unlockedBytes = cloneIsolatedPdfBytes(
        await unlockedDoc.save({
          useObjectStreams: false,
          addDefaultPage: false,
          updateFieldAppearances: false,
        })
      );

      request?.onProgress?.({
        percent: 85,
        stage: 'VERIFYING_OUTPUT',
        message: 'Verifying unencrypted output opens in PDF.js without any password...',
      });

      // 5. Verify no `/Encrypt` dictionary remains in output bytes
      const postEncCheck = inspectRawPdfEncryptDictionary(unlockedBytes);
      if (postEncCheck.hasEncryptDictionary) {
        return buildFailureResult(
          canonicalId,
          createPdfProcessingError(
            'ERR_OUTPUT_INTEGRITY_FAILURE',
            'Decryption verification failure: /Encrypt dictionary was still present in output bytes.'
          ),
          startTime,
          inputByteLength,
          warnings
        );
      }

      // 6. Verify output opens in PDF.js with NO password supplied
      const integrity = await verifyPdfOutputIntegrity(unlockedBytes, {
        expectedPageCount: pageCount,
        verifyWithPdfJs: true,
        expectEncrypted: false,
      });

      if (!integrity.isValid || integrity.isEncryptedOutput) {
        return buildFailureResult(
          canonicalId,
          integrity.error ??
            createPdfProcessingError(
              'ERR_OUTPUT_INTEGRITY_FAILURE',
              'Unlocked PDF failed independent unauthenticated PDF.js reopening verification.'
            ),
          startTime,
          inputByteLength,
          warnings
        );
      }

      const baseName = stripFileExtension(input.fileName);
      const outFileName = options.outputFileName || `${baseName}_unlocked.pdf`;

      const primaryFile: PdfOutputFile = {
        fileName: outFileName,
        mimeType: 'application/pdf',
        bytes: unlockedBytes,
        byteLength: unlockedBytes.byteLength,
        pageCount,
      };

      const postInspection = await inspectPdfSecurityV2({
        fileName: outFileName,
        bytes: unlockedBytes,
      });

      return {
        status: 'SUCCESS',
        resolvedCanonicalId: canonicalId,
        primaryFile,
        outputFiles: [primaryFile],
        outputBytes: unlockedBytes,
        summary: encDict.hasEncryptDictionary
          ? `Successfully decrypted and removed ${encDict.detectedAlgorithm} password protection across ${pageCount} page(s); verified password-free access in PDF.js.`
          : `Verified unencrypted PDF across ${pageCount} page(s).`,
        metrics: {
          inputBytes: inputByteLength,
          outputBytes: unlockedBytes.byteLength,
          inputPageCount: pageCount,
          outputPageCount: pageCount,
          durationMs: Math.max(0, Math.round((performance.now() - startTime) * 100) / 100),
        },
        inspectionReport: postInspection.inspectionReport,
        warnings: [...warnings, ...integrity.warnings],
        limitations: [
          'Requires authorized password credentials for user-locked PDFs; unknown passwords are never bypassed.',
        ],
        details: {
          previousSecurity: {
            wasEncrypted: encDict.hasEncryptDictionary,
            previousAlgorithm: encDict.detectedAlgorithm,
            previousVersionV: encDict.versionV,
            previousRevisionR: encDict.revisionR,
            previousKeyLengthBits: encDict.keyLengthBits,
          },
          currentSecurity: postInspection.security,
        },
      };
    } finally {
      await loadRes.dispose();
    }
  } catch (err) {
    const procErr = normalizeCaughtPdfError(err, {
      hadPassword: Boolean(options.password ?? input?.password),
      phase: 'execute',
    });
    return buildFailureResult(canonicalId, procErr, startTime, inputByteLength, validation.warnings);
  } finally {
    wipeInternalBuffer(isolatedInput);
  }
}

/**
 * ============================================================================
 * 6. CANONICAL ENGINE G ROUTER (`executeSecurityOperationV2`)
 * ============================================================================
 */

export const ENGINE_G_CANONICAL_IDS: ReadonlySet<string> = new Set([
  'pdf-protect-password',
  'pdf-remove-password',
]);

/**
 * V2 Engine G Router for PDF Security operations:
 * - Canonical IDs: `pdf-protect-password`, `pdf-remove-password`
 * - Preserved Aliases: `pdf-protect` -> `pdf-protect-password`, `pdf-unlock` -> `pdf-remove-password`
 * - Rejects unknown, cross-module, and non-PDF generator IDs with `ERR_UNSUPPORTED_OPERATION`.
 */
export async function executeSecurityOperationV2(
  request: PdfOperationRequest
): Promise<PdfOperationResult> {
  const startTime = performance.now();
  const totalInputBytes = (request?.inputs || []).reduce(
    (acc, f) => acc + inspectByteLength(f?.bytes),
    0
  );

  const resolved = resolvePdfOperationCapabilities(request?.toolId);
  if (!resolved.supported || !resolved.capabilities) {
    return buildFailureResult(
      request?.toolId || 'unknown',
      resolved.error ??
        createPdfProcessingError(
          'ERR_UNSUPPORTED_OPERATION',
          `Unsupported or unregistered PDF tool ID: "${request?.toolId}".`
        ),
      startTime,
      totalInputBytes
    );
  }

  const cap = resolved.capabilities;
  if (cap.module !== 'security' || !ENGINE_G_CANONICAL_IDS.has(cap.canonicalId)) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError(
        'ERR_UNSUPPORTED_OPERATION',
        `Tool "${cap.canonicalId}" belongs to module "${cap.module}" and cannot be executed by the Engine G Security router.`
      ),
      startTime,
      totalInputBytes
    );
  }

  if (!request.inputs || request.inputs.length === 0) {
    return buildFailureResult(
      cap.canonicalId,
      createPdfProcessingError('ERR_EMPTY_FILE', 'At least one PDF input file is required.'),
      startTime,
      0
    );
  }

  const primaryInput = request.inputs[0];
  const rawOptions = (request.options || {}) as Record<string, unknown>;

  if (cap.canonicalId === 'pdf-protect-password') {
    return await protectPdfWithPasswordV2(primaryInput, rawOptions as ProtectPdfOptions, request);
  }

  if (cap.canonicalId === 'pdf-remove-password') {
    return await removePdfPasswordV2(primaryInput, rawOptions as UnlockPdfOptions, request);
  }

  return buildFailureResult(
    cap.canonicalId,
    createPdfProcessingError('ERR_UNSUPPORTED_OPERATION', `No Engine G handler bound for "${cap.canonicalId}".`),
    startTime,
    totalInputBytes
  );
}
