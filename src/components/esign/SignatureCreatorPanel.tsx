import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Download,
  Image as ImageIcon,
  PenTool,
  Trash2,
  Type,
  Upload
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { getESignText } from '../../i18n/esignTranslations.ts';
import SignatureCanvas, {
  SIGNATURE_INK_PRESETS,
  type SignatureCanvasHandle
} from '../common/SignatureCanvas.tsx';
import PdfErrorDisplay from '../common/PdfErrorDisplay.tsx';
import { type PdfErrorInput } from '../common/PdfErrorAlert.tsx';
import { createSafeBlob, revokeObjectUrlSafely } from '../../services/pdf/pdfRuntime.ts';
import {
  TYPED_SIGNATURE_FONTS,
  clearAllSessionSignatures,
  processUploadedSignatureImage,
  renderTypedSignatureToPng,
  setSessionSignatureAsset,
  useSessionSignatures,
  type SessionSignatureAsset,
  type SessionSignatureKind
} from '../../services/pdf/esign/signatureSessionStore.ts';

export type SignatureCreatorMode = 'draw' | 'type' | 'upload';

export interface SignatureCreatorPanelProps {
  /** Whether creating a full signature or compact initials */
  kind?: SessionSignatureKind;
  /** Standalone page mode ('create-signature') vs embedded modal mode */
  standalone?: boolean;
  /** Invoked when the user saves/applies the signature */
  onSignatureReady?: (asset: SessionSignatureAsset) => void;
  /** Optional navigation callback (e.g. jump from Create Signature -> Sign PDF) */
  onNavigateSignPdf?: () => void;
  /** Optional close handler for modal usage */
  onClose?: () => void;
}

export default function SignatureCreatorPanel({
  kind = 'signature',
  standalone = false,
  onSignatureReady,
  onNavigateSignPdf,
  onClose
}: SignatureCreatorPanelProps) {
  const { language } = useTranslation();
  const tr = (key: Parameters<typeof getESignText>[1], vars?: Record<string, string | number>) =>
    getESignText(language, key, vars);

  const session = useSessionSignatures();
  const existingAsset = kind === 'initials' ? session.initials : session.signature;

  const [mode, setMode] = useState<SignatureCreatorMode>('draw');
  const [typedText, setTypedText] = useState<string>('');
  const [fontPresetId, setFontPresetId] = useState<string>(TYPED_SIGNATURE_FONTS[0].id);
  const [typedColor, setTypedColor] = useState<string>(SIGNATURE_INK_PRESETS[0].hex);
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(true);
  const [uploadedPreview, setUploadedPreview] = useState<{
    dataUrl: string;
    pngBytes: Uint8Array;
    width: number;
    height: number;
    aspectRatio: number;
    fileName: string;
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [drawHasInk, setDrawHasInk] = useState<boolean>(false);
  const [error, setError] = useState<PdfErrorInput | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [processingUpload, setProcessingUpload] = useState<boolean>(false);

  const canvasHandleRef = useRef<SignatureCanvasHandle | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const downloadUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of downloadUrlsRef.current) {
        revokeObjectUrlSafely(url);
      }
      downloadUrlsRef.current = [];
    };
  }, []);

  // Re-render typed preview whenever inputs change
  const typedAssetPreview = useMemo(() => {
    if (mode !== 'type' || typedText.trim().length === 0) return null;
    return renderTypedSignatureToPng({
      text: typedText,
      fontPresetId,
      color: typedColor,
      fontSizePx: kind === 'initials' ? 104 : 96
    });
  }, [mode, typedText, fontPresetId, typedColor, kind]);

  // Reprocess uploaded file if removeWhiteBg toggles
  useEffect(() => {
    if (!uploadedFile) return;
    let cancelled = false;
    setProcessingUpload(true);
    setError(null);

    (async () => {
      const res = await processUploadedSignatureImage(uploadedFile, {
        removeWhiteBackground: removeWhiteBg
      });
      if (cancelled) return;
      setProcessingUpload(false);

      if (!res.ok) {
        setUploadedPreview(null);
        setUploadedFile(null);
        setError(res.error);
        if (uploadInputRef.current) {
          uploadInputRef.current.value = '';
        }
        return;
      }

      setUploadedPreview({
        dataUrl: res.dataUrl,
        pngBytes: res.pngBytes,
        width: res.width,
        height: res.height,
        aspectRatio: res.aspectRatio,
        fileName: uploadedFile.name
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [uploadedFile, removeWhiteBg]);

  const handleImageFileSelected = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setStatusMessage(null);
    setProcessingUpload(true);

    const res = await processUploadedSignatureImage(file, {
      removeWhiteBackground: removeWhiteBg
    });
    setProcessingUpload(false);

    if (!res.ok) {
      // Guarantee no partial signature state or leftover preview on invalid/corrupt image
      setUploadedPreview(null);
      setUploadedFile(null);
      setError(res.error);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = '';
      }
      return;
    }

    setUploadedFile(file);
    setUploadedPreview({
      dataUrl: res.dataUrl,
      pngBytes: res.pngBytes,
      width: res.width,
      height: res.height,
      aspectRatio: res.aspectRatio,
      fileName: file.name
    });
  };

  const buildCurrentCandidate = () => {
    if (mode === 'draw') {
      const exported = canvasHandleRef.current?.exportPng({
        trimWhitespace: true,
        paddingPx: 14,
        exportScale: 3
      });
      if (!exported) return null;
      return {
        source: 'draw' as const,
        ...exported
      };
    }

    if (mode === 'type') {
      if (!typedAssetPreview) return null;
      return {
        source: 'type' as const,
        ...typedAssetPreview
      };
    }

    if (!uploadedPreview) return null;
    return {
      source: 'upload' as const,
      dataUrl: uploadedPreview.dataUrl,
      pngBytes: uploadedPreview.pngBytes,
      width: uploadedPreview.width,
      height: uploadedPreview.height,
      aspectRatio: uploadedPreview.aspectRatio
    };
  };

  const handleSaveAndApply = () => {
    setError(null);
    setStatusMessage(null);

    const candidate = buildCurrentCandidate();
    if (!candidate) {
      setError({
        code: 'ERR_EMPTY_WATERMARK_CONTENT',
        message: tr('esign.error.emptySignature')
      });
      return;
    }

    const saved = setSessionSignatureAsset(kind, candidate);
    setStatusMessage(tr('esign.status.savedToSession'));
    onSignatureReady?.(saved);
  };

  const handleDownloadPng = () => {
    setError(null);
    const candidate = buildCurrentCandidate() || existingAsset;
    if (!candidate) {
      setError({
        code: 'ERR_EMPTY_WATERMARK_CONTENT',
        message: tr('esign.error.emptySignature')
      });
      return;
    }

    const blob = createSafeBlob(candidate.pngBytes, 'image/png');
    const url = URL.createObjectURL(blob);
    downloadUrlsRef.current.push(url);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = kind === 'initials' ? 'glovotools_initials.png' : 'glovotools_signature.png';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      revokeObjectUrlSafely(url);
      downloadUrlsRef.current = downloadUrlsRef.current.filter((u) => u !== url);
    }, 3000);
  };

  const handleClearSession = () => {
    clearAllSessionSignatures();
    canvasHandleRef.current?.clear();
    setTypedText('');
    setUploadedFile(null);
    setUploadedPreview(null);
    setError(null);
    setStatusMessage(tr('esign.status.sessionCleared'));
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const hasCurrentArtwork =
    (mode === 'draw' && drawHasInk) ||
    (mode === 'type' && Boolean(typedAssetPreview)) ||
    (mode === 'upload' && Boolean(uploadedPreview));

  return (
    <div
      data-testid={`signature-creator-${kind}`}
      className="space-y-4"
    >
      {/* Mode Switcher Tabs */}
      <div
        role="tablist"
        aria-label={tr('esign.panel.signatureLibrary')}
        className="grid grid-cols-3 gap-1.5 rounded-xl border border-border-subtle bg-surface-secondary/70 p-1"
      >
        {(
          [
            { id: 'draw', label: tr('esign.mode.draw'), icon: PenTool },
            { id: 'type', label: tr('esign.mode.type'), icon: Type },
            { id: 'upload', label: tr('esign.mode.upload'), icon: Upload }
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`esign-mode-tab-${tab.id}`}
              onClick={() => {
                setMode(tab.id);
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-surface text-text-primary shadow-xs border border-border-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode 1: Draw */}
      {mode === 'draw' && (
        <SignatureCanvas
          ref={canvasHandleRef}
          height={standalone ? 210 : 185}
          placeholder={tr('esign.draw.placeholder')}
          clearLabel={tr('esign.action.clearPad')}
          undoLabel={tr('esign.action.undo')}
          ariaLabel={tr('esign.draw.placeholder')}
          onChange={(dataUrl) => {
            setDrawHasInk(Boolean(dataUrl));
            setError(null);
          }}
        />
      )}

      {/* Mode 2: Type */}
      {mode === 'type' && (
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor={`esign-type-input-${kind}`} className="ui-label block">
              {tr('esign.type.nameLabel')}
            </label>
            <input
              id={`esign-type-input-${kind}`}
              type="text"
              data-testid="esign-type-input"
              maxLength={kind === 'initials' ? 8 : 64}
              value={typedText}
              onChange={(e) => {
                setTypedText(e.target.value);
                setError(null);
              }}
              placeholder={
                kind === 'initials'
                  ? tr('esign.type.initialsPlaceholder')
                  : tr('esign.type.namePlaceholder')
              }
              className="ui-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TYPED_SIGNATURE_FONTS.map((font) => {
              const selected = fontPresetId === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  data-testid={`esign-font-${font.id}`}
                  aria-pressed={selected}
                  onClick={() => setFontPresetId(font.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer bg-white ${
                    selected
                      ? 'border-accent ring-2 ring-accent/20'
                      : 'border-border-subtle hover:border-accent/60'
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                    {font.label}
                  </div>
                  <div
                    className="text-xl truncate leading-snug"
                    style={{
                      fontFamily: font.cssFamily,
                      fontStyle: font.fontStyle,
                      fontWeight: font.fontWeight,
                      color: typedColor
                    }}
                  >
                    {typedText.trim() ||
                      (kind === 'initials'
                        ? tr('esign.type.initialsPlaceholder')
                        : tr('esign.type.namePlaceholder'))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-text-secondary">
              {tr('esign.type.colorLabel')}
            </span>
            <div className="inline-flex items-center gap-1.5">
              {SIGNATURE_INK_PRESETS.map((preset) => {
                const selected = typedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.label}
                    aria-pressed={selected}
                    onClick={() => setTypedColor(preset.hex)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      selected
                        ? 'scale-110 border-accent ring-2 ring-accent/30'
                        : 'border-border-main hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  />
                );
              })}
            </div>
          </div>

          {typedAssetPreview && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-text-secondary">
                {tr('esign.preview.transparent')}
              </span>
              <div
                data-testid="esign-typed-preview"
                className="rounded-xl border border-border-subtle p-4 flex items-center justify-center min-h-[92px]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '14px 14px',
                  backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
                  backgroundColor: '#ffffff'
                }}
              >
                <img
                  src={typedAssetPreview.dataUrl}
                  alt={tr('esign.preview.transparent')}
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Upload PNG/JPEG */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <label
            className="block rounded-xl border-2 border-dashed border-border-main bg-surface-secondary/50 hover:border-accent/70 p-5 text-center cursor-pointer transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0] || null;
              void handleImageFileSelected(dropped);
            }}
          >
            <input
              ref={uploadInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              data-testid="esign-image-upload-input"
              onChange={(e) => {
                const picked = e.target.files?.[0] || null;
                void handleImageFileSelected(picked);
              }}
              className="hidden"
            />
            <div className="w-9 h-9 rounded-lg bg-accent-light text-accent flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-text-primary">
              {uploadedPreview ? uploadedPreview.fileName : tr('esign.upload.imageDropPrompt')}
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">{tr('esign.upload.imageHint')}</p>
          </label>

          <label className="inline-flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={removeWhiteBg}
              onChange={(e) => setRemoveWhiteBg(e.target.checked)}
              className="rounded border-border-main accent-accent"
            />
            <span>{tr('esign.upload.removeBg')}</span>
          </label>

          {processingUpload && (
            <p className="text-xs text-text-secondary">{tr('esign.status.renderingPage')}</p>
          )}

          {uploadedPreview && (
            <div
              data-testid="esign-uploaded-preview"
              className="rounded-xl border border-border-subtle p-4 flex items-center justify-center min-h-[96px]"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '14px 14px',
                backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
                backgroundColor: '#ffffff'
              }}
            >
              <img
                src={uploadedPreview.dataUrl}
                alt={uploadedPreview.fileName}
                className="max-h-20 max-w-full object-contain"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Error Display */}
      {error && (
        <div data-testid="esign-creator-error">
          <PdfErrorDisplay compact errorMessage={error} language={language} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Status Confirmation */}
      {statusMessage && !error && (
        <div
          role="status"
          data-testid="esign-creator-status"
          className="rounded-xl border border-result-border bg-result-bg px-3 py-2 text-xs font-medium text-result-text flex items-center gap-2"
        >
          <Check className="w-3.5 h-3.5 text-result-icon shrink-0" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          data-testid="esign-save-apply-btn"
          disabled={!hasCurrentArtwork}
          onClick={handleSaveAndApply}
          className="ui-btn-primary flex-1 py-2 text-xs disabled:opacity-45 disabled:pointer-events-none"
        >
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{standalone ? tr('esign.action.saveToSession') : tr('esign.action.useSignature')}</span>
        </button>

        {standalone && (
          <button
            type="button"
            data-testid="esign-download-png-btn"
            disabled={!hasCurrentArtwork && !existingAsset}
            onClick={handleDownloadPng}
            className="ui-btn-result py-2 px-3 text-xs disabled:opacity-45 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('esign.action.downloadPng')}</span>
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary py-2 px-3 text-xs"
          >
            {tr('esign.action.close')}
          </button>
        )}
      </div>

      {/* Session Preview & Cross-Tool Navigation (Standalone Create Signature) */}
      {standalone && (
        <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-text-primary">
                {tr('esign.panel.signatureLibrary')}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {existingAsset ? tr('esign.status.sessionReady') : tr('esign.status.sessionEmpty')}
              </p>
            </div>
            {(session.signature || session.initials) && (
              <button
                type="button"
                data-testid="esign-clear-session-btn"
                onClick={handleClearSession}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-status-error hover:bg-status-error-bg border border-border-subtle cursor-pointer"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                <span>{tr('esign.action.clearSession')}</span>
              </button>
            )}
          </div>

          {existingAsset && (
            <div className="space-y-3">
              <div
                data-testid="esign-session-preview-box"
                className="rounded-lg border border-border-subtle bg-white p-3 flex items-center justify-center min-h-[76px]"
              >
                <img
                  src={existingAsset.dataUrl}
                  alt={tr('esign.element.signature')}
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
              {onNavigateSignPdf && (
                <button
                  type="button"
                  data-testid="esign-open-sign-pdf-btn"
                  onClick={onNavigateSignPdf}
                  className="ui-btn-primary w-full py-2 text-xs"
                >
                  <span>{tr('esign.action.openSignPdf')}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
