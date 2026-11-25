import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileSignature,
  FileText,
  Lock,
  PenTool,
  Redo2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Type,
  Undo2,
  Upload,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getESignText } from '../../i18n/esignTranslations.ts';
import { ToolSplitWorkspace } from '../calculator/ToolWorkspacePrimitives.tsx';
import { type PdfErrorInput } from '../common/PdfErrorAlert.tsx';
import PdfErrorDisplay from '../common/PdfErrorDisplay.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';
import {
  clonePdfBytes,
  createSafeBlob,
  revokeObjectUrlSafely
} from '../../services/pdf/pdfRuntime.ts';
import { validatePdfInput } from '../../services/pdf/v2/pdfValidation.ts';
import { clearDocumentSession, formatByteSize } from '../../services/pdf/v2/pdfWorkspaceIntegration.ts';
import {
  applyESignatureElementsToPdfV2,
  extractPdfMetadataForESign,
  formatESignDate,
  type ESignCanonicalToolId,
  type ESignDateFormatId,
  type ESignDocumentMetadata,
  type ESignNormalizedRect
} from '../../services/pdf/v2/pdfESignatureEngine.ts';
import {
  clearAllSessionSignatures,
  useSessionSignatures,
  type SessionSignatureAsset,
  type SessionSignatureKind
} from '../../services/pdf/esign/signatureSessionStore.ts';
import InteractivePdfCanvasViewer, {
  type InteractivePdfElement
} from './InteractivePdfCanvasViewer.tsx';
import PdfMetadataEditor from './PdfMetadataEditor.tsx';
import SignatureCreatorPanel from './SignatureCreatorPanel.tsx';

export interface PdfESignWorkspaceProps {
  initialTool?: string;
  onNavigateTool?: (toolId: string) => void;
}

interface HistoryState {
  past: InteractivePdfElement[][];
  present: InteractivePdfElement[];
  future: InteractivePdfElement[][];
}

const EMPTY_HISTORY: HistoryState = {
  past: [],
  present: [],
  future: []
};

const EMPTY_METADATA: ESignDocumentMetadata = {
  title: '',
  author: '',
  subject: ''
};

function cloneElements(list: readonly InteractivePdfElement[]): InteractivePdfElement[] {
  return list.map((el) => ({
    ...el,
    rect: { ...el.rect }
  }));
}

function resolveCanonicalESignTool(raw?: string): ESignCanonicalToolId {
  if (
    raw === 'sign-pdf' ||
    raw === 'create-signature' ||
    raw === 'fill-and-sign' ||
    raw === 'add-date-initials'
  ) {
    return raw;
  }
  return 'sign-pdf';
}

export default function PdfESignWorkspace({
  initialTool = 'sign-pdf',
  onNavigateTool
}: PdfESignWorkspaceProps) {
  const { language } = useTranslation();
  const tr = (key: Parameters<typeof getESignText>[1], vars?: Record<string, string | number>) =>
    getESignText(language, key, vars);

  const canonicalTool = resolveCanonicalESignTool(initialTool);
  const session = useSessionSignatures();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileKey, setFileKey] = useState<string>('');
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState('');
  const [activePassword, setActivePassword] = useState<string | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [history, setHistory] = useState<HistoryState>(EMPTY_HISTORY);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dateFormat, setDateFormat] = useState<ESignDateFormatId>('iso');
  const [newTextDraft, setNewTextDraft] = useState<string>('');

  const [creatorModalKind, setCreatorModalKind] = useState<SessionSignatureKind | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [originalMetadata, setOriginalMetadata] = useState<ESignDocumentMetadata>(EMPTY_METADATA);
  const [metadataDraft, setMetadataDraft] = useState<ESignDocumentMetadata>(EMPTY_METADATA);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [pdfError, setPdfError] = useState<PdfErrorInput | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [exportOutput, setExportOutput] = useState<{
    fileName: string;
    blobUrl: string;
    sizeText: string;
    summary: string;
    pageCount: number;
    elementsApplied: number;
    modifiedPages: number[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeBlobUrlsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const metadataLoadSeqRef = useRef<number>(0);

  const revokeActiveBlobUrls = useCallback(() => {
    for (const url of activeBlobUrlsRef.current) {
      revokeObjectUrlSafely(url);
    }
    activeBlobUrlsRef.current = [];
  }, []);

  const cancelActiveExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Deterministic cleanup on unmount (abort pending export, revoke all Blob URLs, zero working PDF buffer)
  useEffect(() => {
    return () => {
      cancelActiveExport();
      revokeActiveBlobUrls();
      void clearDocumentSession();
    };
  }, [cancelActiveExport, revokeActiveBlobUrls]);

  // Wipe previous pdfBytes when replaced or unmounted
  const prevBytesRef = useRef<Uint8Array | null>(null);
  useEffect(() => {
    const prev = prevBytesRef.current;
    if (prev && prev !== pdfBytes) {
      prev.fill(0);
    }
    prevBytesRef.current = pdfBytes;
  }, [pdfBytes]);

  useEffect(() => {
    return () => {
      if (prevBytesRef.current) {
        prevBytesRef.current.fill(0);
        prevBytesRef.current = null;
      }
    };
  }, []);

  // Reset document state when switching between the 4 tools (while preserving RAM session signatures!)
  useEffect(() => {
    metadataLoadSeqRef.current += 1;
    cancelActiveExport();
    revokeActiveBlobUrls();
    setPdfFile(null);
    setPdfBytes(null);
    setFileKey('');
    setPasswordPromptOpen(false);
    setPasswordDraft('');
    setActivePassword(undefined);
    setCurrentPage(1);
    setTotalPages(0);
    setHistory(EMPTY_HISTORY);
    setSelectedElementId(null);
    setCreatorModalKind(null);
    setOriginalMetadata(EMPTY_METADATA);
    setMetadataDraft(EMPTY_METADATA);
    setMetadataLoading(false);
    setPdfError(null);
    setStatusNotice(null);
    setExportOutput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [canonicalTool, cancelActiveExport, revokeActiveBlobUrls]);

  // Extract PDF Title, Author, and Subject whenever a document is loaded or unlocked
  useEffect(() => {
    const seq = ++metadataLoadSeqRef.current;

    if (!pdfBytes || !pdfFile || passwordPromptOpen) {
      setOriginalMetadata(EMPTY_METADATA);
      setMetadataDraft(EMPTY_METADATA);
      setMetadataLoading(false);
      return;
    }

    setMetadataLoading(true);
    void extractPdfMetadataForESign({
      fileName: pdfFile.name,
      mimeType: 'application/pdf',
      bytes: pdfBytes,
      password: activePassword
    })
      .then((res) => {
        if (seq !== metadataLoadSeqRef.current) return;
        if (res.success) {
          setOriginalMetadata(res.metadata);
          setMetadataDraft(res.metadata);
        } else {
          setOriginalMetadata(EMPTY_METADATA);
          setMetadataDraft(EMPTY_METADATA);
        }
      })
      .catch(() => {
        if (seq !== metadataLoadSeqRef.current) return;
        setOriginalMetadata(EMPTY_METADATA);
        setMetadataDraft(EMPTY_METADATA);
      })
      .finally(() => {
        if (seq === metadataLoadSeqRef.current) {
          setMetadataLoading(false);
        }
      });
  }, [pdfBytes, pdfFile, activePassword, passwordPromptOpen]);

  const isMetadataDirty = useMemo(
    () =>
      metadataDraft.title !== originalMetadata.title ||
      metadataDraft.author !== originalMetadata.author ||
      metadataDraft.subject !== originalMetadata.subject,
    [metadataDraft, originalMetadata]
  );

  const handleMetadataChange = useCallback((next: ESignDocumentMetadata) => {
    setMetadataDraft(next);
    setExportOutput(null);
    setStatusNotice(null);
  }, []);

  const handleMetadataReset = useCallback(() => {
    setMetadataDraft(originalMetadata);
    setExportOutput(null);
    setStatusNotice(null);
  }, [originalMetadata]);

  const commitHistory = useCallback(
    (updater: (prev: InteractivePdfElement[]) => InteractivePdfElement[]) => {
      setHistory((curr) => {
        const nextPresent = updater(cloneElements(curr.present));
        return {
          past: [...curr.past.slice(-39), cloneElements(curr.present)],
          present: nextPresent,
          future: []
        };
      });
      setExportOutput(null);
      setPdfError(null);
    },
    []
  );

  const handleUndo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      return {
        past: curr.past.slice(0, -1),
        present: cloneElements(previous),
        future: [cloneElements(curr.present), ...curr.future.slice(0, 39)]
      };
    });
    setExportOutput(null);
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      return {
        past: [...curr.past.slice(-39), cloneElements(curr.present)],
        present: cloneElements(next),
        future: curr.future.slice(1)
      };
    });
    setExportOutput(null);
  }, []);

  // Keyboard shortcuts for Undo / Redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRedo, handleUndo]);

  const handleResetDocument = useCallback(() => {
    metadataLoadSeqRef.current += 1;
    cancelActiveExport();
    revokeActiveBlobUrls();
    setPdfFile(null);
    setPdfBytes(null);
    setFileKey('');
    setPasswordPromptOpen(false);
    setPasswordDraft('');
    setActivePassword(undefined);
    setCurrentPage(1);
    setTotalPages(0);
    setHistory(EMPTY_HISTORY);
    setSelectedElementId(null);
    setOriginalMetadata(EMPTY_METADATA);
    setMetadataDraft(EMPTY_METADATA);
    setMetadataLoading(false);
    setPdfError(null);
    setStatusNotice(null);
    setExportOutput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [cancelActiveExport, revokeActiveBlobUrls]);

  const handlePdfUpload = async (file: File | null) => {
    if (!file) return;
    cancelActiveExport();
    revokeActiveBlobUrls();
    setExportOutput(null);
    setPdfError(null);
    setStatusNotice(null);

    try {
      const rawBuf = await file.arrayBuffer();
      const isolated = clonePdfBytes(rawBuf);
      const check = validatePdfInput({
        bytes: isolated,
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
      });

      if (!check.isValid && check.error) {
        isolated.fill(0);
        setPdfFile(null);
        setPdfBytes(null);
        setFileKey('');
        setTotalPages(0);
        setHistory(EMPTY_HISTORY);
        setPdfError(check.error);
        return;
      }

      setPdfFile(file);
      setPdfBytes(isolated);
      setFileKey(`${file.name}-${file.size}-${Date.now()}`);
      setCurrentPage(1);
      setHistory(EMPTY_HISTORY);
      setSelectedElementId(null);
      setActivePassword(undefined);
      setPasswordDraft('');
      setPasswordPromptOpen(Boolean(check.isPasswordRequired));
    } catch {
      setPdfError({
        code: 'ERR_INVALID_PDF',
        message: tr('esign.error.invalidPdf')
      });
    }
  };

  const placeImageElement = useCallback(
    (asset: SessionSignatureAsset, targetPage = currentPage) => {
      const isInitials = asset.kind === 'initials';
      const defaultW = isInitials ? 0.14 : 0.28;
      const ratio = asset.aspectRatio > 0 ? asset.aspectRatio : isInitials ? 1.6 : 2.8;
      const defaultH = Math.max(0.045, Math.min(0.18, (defaultW / ratio) * 1.29));
      const offsetStep = (history.present.filter((e) => e.pageNumber === targetPage).length % 5) * 0.03;

      const newEl: InteractivePdfElement = {
        id: `el-${asset.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: asset.kind,
        pageNumber: Math.max(1, targetPage),
        rect: {
          u: Math.min(0.95 - defaultW, (isInitials ? 0.72 : 0.14) + offsetStep),
          v: Math.min(0.9 - defaultH, (isInitials ? 0.82 : 0.72) - offsetStep),
          w: defaultW,
          h: defaultH
        },
        imageBytes: asset.pngBytes,
        assetKey: asset.id,
        previewDataUrl: asset.dataUrl
      };

      commitHistory((prev) => [...prev, newEl]);
      setSelectedElementId(newEl.id);
    },
    [commitHistory, currentPage, history.present]
  );

  const handleAddSignatureClick = () => {
    if (!pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }
    if (session.signature) {
      placeImageElement(session.signature, currentPage);
    } else {
      setCreatorModalKind('signature');
    }
  };

  const handleAddInitialsClick = () => {
    if (!pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }
    if (session.initials) {
      placeImageElement(session.initials, currentPage);
    } else {
      setCreatorModalKind('initials');
    }
  };

  const handleAddDateClick = () => {
    if (!pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }
    const formatted = formatESignDate(new Date(), dateFormat);
    const newEl: InteractivePdfElement = {
      id: `el-date-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: 'date',
      pageNumber: currentPage,
      rect: { u: 0.62, v: 0.78, w: 0.22, h: 0.045 },
      text: formatted,
      dateFormat,
      fontSizePt: 13,
      fontFamily: 'Helvetica',
      color: '#111827'
    };
    commitHistory((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleAddTextClick = () => {
    if (!pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }
    const textVal = newTextDraft.trim() || 'Signed & Approved';
    const newEl: InteractivePdfElement = {
      id: `el-text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: 'text',
      pageNumber: currentPage,
      rect: { u: 0.14, v: 0.22, w: 0.3, h: 0.05 },
      text: textVal,
      fontSizePt: 13,
      fontFamily: 'Helvetica',
      color: '#111827'
    };
    commitHistory((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleAddCheckmarkClick = () => {
    if (!pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }
    const newEl: InteractivePdfElement = {
      id: `el-check-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: 'checkmark',
      pageNumber: currentPage,
      rect: { u: 0.16, v: 0.34, w: 0.048, h: 0.038 },
      color: '#111827'
    };
    commitHistory((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleCommitRect = useCallback(
    (id: string, nextRect: ESignNormalizedRect) => {
      commitHistory((prev) =>
        prev.map((el) => (el.id === id ? { ...el, rect: { ...nextRect } } : el))
      );
    },
    [commitHistory]
  );

  const handleUpdateElementProps = useCallback(
    (id: string, patch: Partial<InteractivePdfElement>) => {
      commitHistory((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));
    },
    [commitHistory]
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      commitHistory((prev) => prev.filter((el) => el.id !== id));
      setSelectedElementId((curr) => (curr === id ? null : curr));
    },
    [commitHistory]
  );

  const handleDuplicateElement = useCallback(
    (id: string) => {
      const target = history.present.find((el) => el.id === id);
      if (!target) return;
      const copy: InteractivePdfElement = {
        ...target,
        id: `el-${target.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        rect: {
          ...target.rect,
          u: Math.min(0.95 - target.rect.w, target.rect.u + 0.03),
          v: Math.min(0.92 - target.rect.h, target.rect.v + 0.03)
        }
      };
      commitHistory((prev) => [...prev, copy]);
      setSelectedElementId(copy.id);
    },
    [commitHistory, history.present]
  );

  const handleApplyElementToAllPages = useCallback(
    (id: string) => {
      if (totalPages <= 1) return;
      const source = history.present.find((el) => el.id === id);
      if (!source) return;

      commitHistory((prev) => {
        const next = [...prev];
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          if (pageNum === source.pageNumber) continue;
          next.push({
            ...source,
            id: `el-${source.kind}-p${pageNum}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            pageNumber: pageNum,
            rect: { ...source.rect }
          });
        }
        return next;
      });
      setStatusNotice(tr('esign.status.appliedAllPages'));
    },
    [commitHistory, history.present, totalPages, tr]
  );

  const handleClearSession = () => {
    clearAllSessionSignatures();
    setStatusNotice(tr('esign.status.sessionCleared'));
  };

  const handleExportPdf = async () => {
    if (exporting) return;
    setPdfError(null);
    setStatusNotice(null);

    if (!pdfFile || !pdfBytes) {
      setPdfError({ code: 'ERR_EMPTY_FILE', message: tr('esign.error.noPdfUploaded') });
      return;
    }

    if (history.present.length === 0 && !isMetadataDirty) {
      setPdfError({
        code: 'ERR_EMPTY_WATERMARK_CONTENT',
        message: tr('esign.error.noElementsPlaced')
      });
      return;
    }

    revokeActiveBlobUrls();
    setExportOutput(null);
    setExporting(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await applyESignatureElementsToPdfV2(
        {
          fileName: pdfFile.name,
          mimeType: 'application/pdf',
          bytes: pdfBytes,
          password: activePassword
        },
        {
          canonicalId: canonicalTool,
          elements: history.present,
          metadata: isMetadataDirty ? metadataDraft : undefined,
          signal: controller.signal
        }
      );

      if (result.status !== 'SUCCESS' || result.error || !result.primaryFile) {
        setPdfError(
          result.error || {
            code: 'ERR_PROCESSING_FAILURE',
            message: result.summary || tr('esign.error.exportFailed')
          }
        );
        return;
      }

      const outFile = result.primaryFile;
      const blob = createSafeBlob(outFile.bytes, 'application/pdf');
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrlsRef.current.push(blobUrl);

      setExportOutput({
        fileName: outFile.fileName,
        blobUrl,
        sizeText: formatByteSize(blob.size),
        summary: result.summary,
        pageCount: outFile.pageCount || totalPages,
        elementsApplied: history.present.length,
        modifiedPages: Array.isArray(result.details?.modifiedPageNumbers)
          ? (result.details.modifiedPageNumbers as number[])
          : []
      });
      setStatusNotice(tr('esign.status.exportSuccess'));
    } catch (err: any) {
      setPdfError(
        err || {
          code: 'ERR_PROCESSING_FAILURE',
          message: tr('esign.error.exportFailed')
        }
      );
    } finally {
      abortControllerRef.current = null;
      setExporting(false);
    }
  };

  const toolTitle = useMemo(() => {
    switch (canonicalTool) {
      case 'create-signature':
        return tr('esign.tool.createSignature');
      case 'fill-and-sign':
        return tr('esign.tool.fillAndSign');
      case 'add-date-initials':
        return tr('esign.tool.addDateInitials');
      case 'sign-pdf':
      default:
        return tr('esign.tool.signPdf');
    }
  }, [canonicalTool, language]);

  // Dedicated Standalone Mode: Create Signature ('create-signature')
  if (canonicalTool === 'create-signature') {
    return (
      <div className="max-w-3xl mx-auto space-y-4" data-testid="esign-workspace-create-signature">
        <section className="ui-panel p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border-subtle">
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">{toolTitle}</h2>
              <p className="text-xs text-text-secondary mt-0.5">{tr('esign.notice.localPrivacy')}</p>
            </div>
          </div>

          <SignatureCreatorPanel
            kind="signature"
            standalone
            onNavigateSignPdf={onNavigateTool ? () => onNavigateTool('sign-pdf') : undefined}
          />

          <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 px-3.5 py-2.5 flex items-start gap-2 text-[11px] text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
            <span>{tr('esign.notice.visualScope')}</span>
          </div>
        </section>
      </div>
    );
  }

  // Document Signing Modes: 'sign-pdf', 'fill-and-sign', 'add-date-initials'
  return (
    <div data-testid={`esign-workspace-${canonicalTool}`} className="space-y-4">
      <ToolSplitWorkspace
        ratio="7-5"
        inputs={
          <section className="ui-panel p-4 sm:p-6 space-y-4 min-w-0">
            {/* Header & History Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-text-primary tracking-tight">{toolTitle}</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {tr('esign.notice.localPrivacy')}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  data-testid="esign-undo-btn"
                  disabled={history.past.length === 0}
                  onClick={handleUndo}
                  title={tr('esign.action.undo')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{tr('esign.action.undo')}</span>
                </button>
                <button
                  type="button"
                  data-testid="esign-redo-btn"
                  disabled={history.future.length === 0}
                  onClick={handleRedo}
                  title={tr('esign.action.redo')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Redo2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">{tr('esign.action.redo')}</span>
                </button>
                <button
                  type="button"
                  data-testid="esign-reset-btn"
                  onClick={handleResetDocument}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tr('esign.action.resetDocument')}</span>
                </button>
              </div>
            </div>

            {/* PDF Upload Dropzone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const dropped = e.dataTransfer.files?.[0] || null;
                void handlePdfUpload(dropped);
              }}
              className={`block border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors ${
                isDraggingFile
                  ? 'border-accent bg-accent-light/70 dark:bg-surface-selected/60'
                  : 'border-border-main bg-surface-secondary/50 hover:border-accent/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                data-testid="esign-pdf-upload-input"
                onChange={(e) => {
                  const picked = e.target.files?.[0] || null;
                  void handlePdfUpload(picked);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="text-center sm:text-left min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                    {pdfFile
                      ? `${pdfFile.name} (${formatByteSize(pdfFile.size)}) — ${tr('esign.upload.replacePrompt')}`
                      : tr('esign.upload.dropPrompt')}
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{tr('esign.upload.hint')}</p>
                </div>
              </div>
            </label>

            {/* Encrypted PDF Password Prompt */}
            {passwordPromptOpen && pdfFile && (
              <div
                data-testid="esign-password-prompt"
                className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                  <span>{tr('esign.upload.passwordPrompt')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    data-testid="esign-pdf-password-input"
                    value={passwordDraft}
                    onChange={(e) => setPasswordDraft(e.target.value)}
                    placeholder={tr('esign.upload.passwordPlaceholder')}
                    className="ui-input flex-1 min-w-[180px]"
                  />
                  <button
                    type="button"
                    data-testid="esign-pdf-unlock-btn"
                    onClick={() => {
                      setActivePassword(passwordDraft);
                      setPasswordPromptOpen(false);
                      setPdfError(null);
                    }}
                    className="ui-btn-primary py-2 px-3 text-xs"
                  >
                    {tr('esign.upload.unlockButton')}
                  </button>
                </div>
              </div>
            )}

            {/* Signing & Fill Toolbar */}
            <div
              data-testid="esign-elements-toolbar"
              className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  {tr('esign.panel.elementsToolbar')}
                </span>
                <span
                  data-testid="esign-elements-count"
                  className="text-[11px] font-mono text-text-tertiary"
                >
                  {tr('esign.status.elementsCount', { count: history.present.length })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  data-testid="esign-add-signature-btn"
                  onClick={handleAddSignatureClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
                >
                  <FileSignature className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{tr('esign.action.addSignature')}</span>
                </button>

                <button
                  type="button"
                  data-testid="esign-add-initials-btn"
                  onClick={handleAddInitialsClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{tr('esign.action.addInitials')}</span>
                </button>

                <button
                  type="button"
                  data-testid="esign-add-date-btn"
                  onClick={handleAddDateClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{tr('esign.action.addDate')}</span>
                </button>

                <button
                  type="button"
                  data-testid="esign-add-text-btn"
                  onClick={handleAddTextClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{tr('esign.action.addText')}</span>
                </button>

                <button
                  type="button"
                  data-testid="esign-add-checkmark-btn"
                  onClick={handleAddCheckmarkClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span>{tr('esign.action.addCheckmark')}</span>
                </button>
              </div>

              {/* Compact Quick Inputs for Text & Date Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  data-testid="esign-quick-text-input"
                  value={newTextDraft}
                  onChange={(e) => setNewTextDraft(e.target.value)}
                  placeholder={tr('esign.element.textPlaceholder')}
                  className="ui-input py-1.5 text-xs"
                />
                <select
                  aria-label={tr('esign.element.dateFormat')}
                  data-testid="esign-quick-date-format"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as ESignDateFormatId)}
                  className="ui-select py-1.5 text-xs"
                >
                  <option value="iso">{formatESignDate(new Date(), 'iso')}</option>
                  <option value="us">{formatESignDate(new Date(), 'us')}</option>
                  <option value="eu">{formatESignDate(new Date(), 'eu')}</option>
                  <option value="long">{formatESignDate(new Date(), 'long')}</option>
                </select>
              </div>
            </div>

            {/* Interactive PDF Page Viewer */}
            {pdfBytes && (
              <InteractivePdfCanvasViewer
                pdfBytes={pdfBytes}
                fileKey={fileKey}
                password={activePassword}
                currentPage={currentPage}
                onPageChange={(nextPage) => {
                  setCurrentPage(nextPage);
                  setSelectedElementId(null);
                }}
                onPageCountLoaded={setTotalPages}
                onPasswordRequired={() => setPasswordPromptOpen(true)}
                onLoadError={(err) => setPdfError(err)}
                elements={history.present}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onCommitElementRect={handleCommitRect}
                onUpdateElementProps={handleUpdateElementProps}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onApplyElementToAllPages={handleApplyElementToAllPages}
              />
            )}
          </section>
        }
        results={
          <section
            aria-live="polite"
            className="glovo-print-results-panel ui-panel p-4 sm:p-6 space-y-4 lg:sticky lg:top-28 min-w-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                {tr('esign.panel.output')}
              </h2>
              {exportOutput && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-tertiary">
                    {exportOutput.sizeText}
                  </span>
                  <PrintResultButton scope="result-only" />
                </div>
              )}
            </div>

            {/* Session Signature Card */}
            <div
              data-testid="esign-session-card"
              className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-text-primary">
                  {tr('esign.panel.signatureLibrary')}
                </span>
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="esign-open-creator-btn"
                    onClick={() => setCreatorModalKind('signature')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-surface hover:bg-surface-hover text-accent border border-border-subtle cursor-pointer"
                  >
                    {tr('esign.action.createSignature')}
                  </button>
                  {(session.signature || session.initials) && (
                    <button
                      type="button"
                      data-testid="esign-clear-session-btn"
                      onClick={handleClearSession}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-status-error hover:bg-status-error-bg border border-border-subtle cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                      <span>{tr('esign.action.clearSession')}</span>
                    </button>
                  )}
                </div>
              </div>

              {session.signature ? (
                <div
                  data-testid="esign-session-signature-preview"
                  className="rounded-lg border border-border-subtle bg-white p-2.5 flex items-center justify-center min-h-[62px]"
                >
                  <img
                    src={session.signature.dataUrl}
                    alt={tr('esign.element.signature')}
                    className="max-h-14 max-w-full object-contain"
                  />
                </div>
              ) : (
                <p
                  data-testid="esign-session-empty-text"
                  className="text-[11px] text-text-tertiary"
                >
                  {tr('esign.status.sessionEmpty')}
                </p>
              )}

              {session.initials && (
                <div
                  data-testid="esign-session-initials-preview"
                  className="rounded-lg border border-border-subtle bg-white p-2 flex items-center justify-center min-h-[44px]"
                >
                  <img
                    src={session.initials.dataUrl}
                    alt={tr('esign.element.initials')}
                    className="max-h-10 max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Document Metadata Editor */}
            <PdfMetadataEditor
              metadata={metadataDraft}
              hasDocument={Boolean(pdfBytes && !passwordPromptOpen)}
              loading={metadataLoading}
              isDirty={isMetadataDirty}
              disabled={exporting}
              onChange={handleMetadataChange}
              onReset={handleMetadataReset}
            />

            {/* Export CTA Button */}
            <button
              type="button"
              data-testid="esign-export-pdf-btn"
              disabled={
                exporting ||
                !pdfBytes ||
                (history.present.length === 0 && !isMetadataDirty)
              }
              onClick={handleExportPdf}
              className="ui-btn-primary w-full py-2.5 text-xs sm:text-sm disabled:opacity-45 disabled:pointer-events-none"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{tr('esign.action.exporting')}</span>
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4" aria-hidden="true" />
                  <span>{tr('esign.action.exportPdf')}</span>
                </>
              )}
            </button>

            {/* Error State */}
            {pdfError && (
              <div data-testid="esign-workspace-error">
                <PdfErrorDisplay
                  errorMessage={pdfError}
                  language={language}
                  onDismiss={() => setPdfError(null)}
                  onReset={handleResetDocument}
                />
              </div>
            )}

            {/* Status Notice */}
            {statusNotice && !pdfError && !exportOutput && (
              <div
                role="status"
                data-testid="esign-status-notice"
                className="rounded-xl border border-border-subtle bg-surface-secondary/60 px-3 py-2 text-xs text-text-secondary"
              >
                {statusNotice}
              </div>
            )}

            {/* Verified Export Output Card */}
            {exportOutput ? (
              <div className="space-y-3" data-testid="esign-export-result-card">
                <div className="print-avoid-break glovo-print-primary-card kpi-hover-pulse rounded-xl border border-result-border bg-result-bg p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-5 h-5 text-result-icon shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h3
                        data-testid="esign-export-filename"
                        className="text-sm font-bold text-result-text break-all"
                      >
                        {exportOutput.fileName}
                      </h3>
                      <p className="text-xs text-result-text-secondary mt-0.5">
                        {exportOutput.sizeText} · {exportOutput.pageCount}{' '}
                        {tr('esign.panel.pages').toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <a
                    href={exportOutput.blobUrl}
                    download={exportOutput.fileName}
                    data-testid="esign-download-pdf-link"
                    className="no-print ui-btn-result w-full"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>{tr('esign.action.downloadSignedPdf')}</span>
                  </a>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed rounded-xl border border-border-subtle bg-surface-secondary/50 p-3">
                  {exportOutput.summary}
                </p>
              </div>
            ) : (
              !pdfError && (
                <div className="ui-empty-state space-y-1.5">
                  <FileText className="w-6 h-6 text-text-tertiary mx-auto" aria-hidden="true" />
                  <p className="text-sm font-semibold text-text-primary">
                    {tr('esign.status.ready')}
                  </p>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    {tr('esign.status.readyHint')}
                  </p>
                </div>
              )
            )}

            {/* Honest Legal & Functional Scope Disclosure */}
            <div className="rounded-xl border border-border-subtle bg-surface-secondary/40 px-3 py-2.5 flex items-start gap-2 text-[11px] text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <span>{tr('esign.notice.visualScope')}</span>
            </div>
          </section>
        }
      />

      {/* Signature / Initials Creator Modal (portaled to document.body to stay viewport-centered) */}
      {creatorModalKind &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            data-testid="esign-creator-modal"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                setCreatorModalKind(null);
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                <h3 className="text-sm font-bold text-text-primary">
                  {creatorModalKind === 'initials'
                    ? tr('esign.action.createInitials')
                    : tr('esign.action.createSignature')}
                </h3>
                <button
                  type="button"
                  aria-label={tr('esign.action.close')}
                  onClick={() => setCreatorModalKind(null)}
                  className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <SignatureCreatorPanel
                kind={creatorModalKind}
                onClose={() => setCreatorModalKind(null)}
                onSignatureReady={(asset) => {
                  setCreatorModalKind(null);
                  if (pdfBytes) {
                    placeImageElement(asset, currentPage);
                  }
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
