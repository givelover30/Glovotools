import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  RotateCcw,
  Upload,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CALCULATORS } from '../../data/calculators.ts';
import { type PdfErrorInput } from '../common/PdfErrorAlert.tsx';
import PdfErrorDisplay from '../common/PdfErrorDisplay.tsx';
import PdfPageRangePreviewGrid from '../common/PdfPageRangePreviewGrid.tsx';
import PdfThumbnailPreview from '../common/PdfThumbnailPreview.tsx';
import {
  createSafeBlob,
  revokeObjectUrlSafely
} from '../../services/pdf/pdfRuntime.ts';
import * as pdfEngine from '../../services/pdf/pdfCoreEngine';
import {
  formatPageNumbersAsExpression,
  parsePageRangeExpression
} from '../../services/pdf/v2/pdfPageRangeParser';
import {
  executePdfWorkspaceFilesV2,
  formatByteSize,
  getWorkspaceToolUiConfigV2,
  resolvePdfWorkspaceToolV2,
  terminateOcrWorkerPoolV2
} from '../../services/pdf/v2/pdfWorkspaceIntegration';
import { ToolSplitWorkspace } from '../calculator/ToolWorkspacePrimitives.tsx';

interface PdfToolsWorkspaceProps {
  initialTool?: string;
}

interface WorkspaceGeneratedDownload {
  fileName: string;
  blobUrl: string;
  sizeText: string;
  mimeType: string;
}

export default function PdfToolsWorkspace({
  initialTool = 'pdf-merge'
}: PdfToolsWorkspaceProps) {
  const [activeToolId, setActiveToolId] = useState<string>(initialTool);
  const [files, setFiles] = useState<File[]>([]);
  const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);
  const [isDraggingSecondary, setIsDraggingSecondary] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [resultOutput, setResultOutput] = useState<{
    fileName: string;
    blobUrl: string;
    sizeText: string;
    summary: string;
    previewText?: string;
    warnings?: string[];
    limitations?: string[];
    additionalOutputs?: WorkspaceGeneratedDownload[];
    details?: Record<string, any>;
  } | null>(null);
  const [pdfError, setPdfError] = useState<PdfErrorInput | null>(null);

  // Operation-specific parameters (100% preserved)
  const [paramText, setParamText] = useState('');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageRangeText, setPageRangeText] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [metadataAuthor, setMetadataAuthor] = useState('');
  const [metadataSubject, setMetadataSubject] = useState('');
  const [metadataKeywords, setMetadataKeywords] = useState('');
  const [cropMarginPt, setCropMarginPt] = useState<number>(20);
  // pdf-add-text parameters (DEF-12R-02)
  const [textXInput, setTextXInput] = useState<string>('50');
  const [textYInput, setTextYInput] = useState<string>('700');
  const [textCoordinateOrigin, setTextCoordinateOrigin] = useState<'bottom-left' | 'top-left'>(
    'bottom-left'
  );
  const [textFontSizeInput, setTextFontSizeInput] = useState<string>('14');
  const [textFontFamily, setTextFontFamily] = useState<
    'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier'
  >('Helvetica');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textOpacityInput, setTextOpacityInput] = useState<string>('1');
  const [textRotationInput, setTextRotationInput] = useState<string>('0');
  // pdf-page-resizer parameters (DEF-12R-02)
  const [pageSizePreset, setPageSizePreset] = useState<
    'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'B5' | 'Tabloid' | 'Executive' | 'Custom'
  >('A4');
  const [customPageWidthInput, setCustomPageWidthInput] = useState<string>('612');
  const [customPageHeightInput, setCustomPageHeightInput] = useState<string>('792');
  const [pageSizeUnit, setPageSizeUnit] = useState<'pt' | 'mm' | 'in'>('pt');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape' | 'auto'>(
    'portrait'
  );
  const [pageFitMode, setPageFitMode] = useState<'contain-center' | 'stretch' | 'pad-center'>(
    'contain-center'
  );
  const [pagesPerChunk, setPagesPerChunk] = useState<number>(1);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [ocrLanguage, setOcrLanguage] = useState<'eng' | 'spa' | 'eng+spa'>('eng');
  const [enableOcrFallback, setEnableOcrFallback] = useState<boolean>(false);

  const activeBlobUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { t, language } = useTranslation();

  const revokeActiveBlobUrls = () => {
    for (const url of activeBlobUrlsRef.current) {
      revokeObjectUrlSafely(url);
    }
    activeBlobUrlsRef.current = [];
  };

  const cancelActiveOperation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelActiveOperation();
      revokeActiveBlobUrls();
      void terminateOcrWorkerPoolV2();
    };
  }, []);

  useEffect(() => {
    if (initialTool) {
      cancelActiveOperation();
      revokeActiveBlobUrls();
      setActiveToolId(initialTool);
      setFiles([]);
      setSecondaryFiles([]);
      setResultOutput(null);
      setPdfError(null);
      setParamText('');
      setSelectedPages([]);
      setPageRangeText('');
      setPasswordInput('');
      setOwnerPasswordInput('');
      setMetadataAuthor('');
      setMetadataSubject('');
      setMetadataKeywords('');
      setCropMarginPt(20);
      setTextXInput('50');
      setTextYInput('700');
      setTextCoordinateOrigin('bottom-left');
      setTextFontSizeInput('14');
      setTextFontFamily('Helvetica');
      setTextColor('#000000');
      setTextAlign('left');
      setTextOpacityInput('1');
      setTextRotationInput('0');
      setPageSizePreset('A4');
      setCustomPageWidthInput('612');
      setCustomPageHeightInput('792');
      setPageSizeUnit('pt');
      setPageOrientation('portrait');
      setPageFitMode('contain-center');
      setPagesPerChunk(1);
      setImageFormat('png');
      setOcrLanguage('eng');
      setEnableOcrFallback(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (secondaryFileInputRef.current) {
        secondaryFileInputRef.current.value = '';
      }
    }
  }, [initialTool]);

  // Keep deduplicated catalog reference for active tool verification
  const pdfTools = useMemo(() => {
    const seenIds = new Set<string>();
    return CALCULATORS.filter((c) => {
      if (c.category !== 'pdf-tools' || seenIds.has(c.id)) {
        return false;
      }
      seenIds.add(c.id);
      return true;
    });
  }, []);

  const currentTool =
    pdfTools.find((item) => item.id === activeToolId) ||
    pdfTools[0] || {
      id: initialTool,
      name: 'PDF Document Tool',
      shortDesc: 'Process PDF documents securely in your browser'
    };

  const uiConfig = useMemo(() => getWorkspaceToolUiConfigV2(activeToolId), [activeToolId]);

  const applySelectedFiles = (selected: File[], isSecondary = false) => {
    if (selected.length === 0) return;
    revokeActiveBlobUrls();
    if (isSecondary) {
      setSecondaryFiles([selected[0]]);
    } else if (uiConfig.allowMultiplePrimaryFiles) {
      setFiles((prev) => [...prev, ...selected]);
      setSelectedPages([]);
    } else {
      setFiles(
        uiConfig.requiresSecondFileDropzone
          ? selected
          : [selected[0]]
      );
      setSelectedPages([]);
      if (
        uiConfig.canonicalId === 'pdf-extract-pages' ||
        uiConfig.canonicalId === 'pdf-delete-pages' ||
        uiConfig.canonicalId === 'pdf-rotate-pages'
      ) {
        setPageRangeText('');
      }
    }
    setResultOutput(null);
    setPdfError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isSecondary = false) => {
    if (e.target.files && e.target.files.length > 0) {
      applySelectedFiles(Array.from(e.target.files), isSecondary);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, isSecondary = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSecondary) {
      setIsDraggingSecondary(false);
    } else {
      setIsDraggingPrimary(false);
    }
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      applySelectedFiles(dropped, isSecondary);
    }
  };

  const handleRemoveFile = (index: number) => {
    revokeActiveBlobUrls();
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedPages([]);
    if (
      uiConfig.canonicalId === 'pdf-extract-pages' ||
      uiConfig.canonicalId === 'pdf-delete-pages' ||
      uiConfig.canonicalId === 'pdf-rotate-pages'
    ) {
      setPageRangeText('');
    }
    setResultOutput(null);
    setPdfError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMoveFile = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    setFiles((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setResultOutput(null);
    setPdfError(null);
  };

  const handleClearPrimaryFiles = () => {
    revokeActiveBlobUrls();
    setFiles([]);
    setSelectedPages([]);
    if (
      uiConfig.canonicalId === 'pdf-extract-pages' ||
      uiConfig.canonicalId === 'pdf-delete-pages' ||
      uiConfig.canonicalId === 'pdf-rotate-pages'
    ) {
      setPageRangeText('');
    }
    setResultOutput(null);
    setPdfError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTogglePage = (pageIndex: number) => {
    if (
      uiConfig.canonicalId === 'pdf-delete-pages' ||
      uiConfig.canonicalId === 'pdf-rotate-pages'
    ) {
      const next = selectedPages.includes(pageIndex)
        ? selectedPages.filter((p) => p !== pageIndex)
        : [...selectedPages, pageIndex].sort((a, b) => a - b);
      setSelectedPages(next);
      setPageRangeText(formatPageNumbersAsExpression(next.map((idx) => idx + 1)));
      setResultOutput(null);
      setPdfError(null);
      return;
    }

    setSelectedPages((prev) =>
      prev.includes(pageIndex) ? prev.filter((p) => p !== pageIndex) : [...prev, pageIndex]
    );
  };

  const handlePageRangeTextChange = (nextText: string) => {
    setPageRangeText(nextText);
    if (
      uiConfig.canonicalId !== 'pdf-delete-pages' &&
      uiConfig.canonicalId !== 'pdf-rotate-pages'
    ) {
      return;
    }
    setResultOutput(null);
    setPdfError(null);
    const trimmed = nextText.trim();
    if (trimmed.length === 0) {
      setSelectedPages([]);
      return;
    }
    if (!/\b(all|odd|even|end|last)\b/i.test(trimmed)) {
      const parsed = parsePageRangeExpression(trimmed, 100000);
      if (parsed.isValid) {
        setSelectedPages(parsed.pageIndices);
        return;
      }
    }
    setSelectedPages([]);
  };

  const handlePageRangeSelectionChange = (nextIndices: number[], nextRangeText: string) => {
    setSelectedPages(nextIndices);
    setPageRangeText(nextRangeText);
    setResultOutput(null);
    setPdfError(null);
  };

  const handleReset = () => {
    cancelActiveOperation();
    revokeActiveBlobUrls();
    setFiles([]);
    setSecondaryFiles([]);
    setResultOutput(null);
    setPdfError(null);
    setParamText('');
    setSelectedPages([]);
    setPageRangeText('');
    setPasswordInput('');
    setOwnerPasswordInput('');
    setMetadataAuthor('');
    setMetadataSubject('');
    setMetadataKeywords('');
    setCropMarginPt(20);
    setTextXInput('50');
    setTextYInput('700');
    setTextCoordinateOrigin('bottom-left');
    setTextFontSizeInput('14');
    setTextFontFamily('Helvetica');
    setTextColor('#000000');
    setTextAlign('left');
    setTextOpacityInput('1');
    setTextRotationInput('0');
    setPageSizePreset('A4');
    setCustomPageWidthInput('612');
    setCustomPageHeightInput('792');
    setPageSizeUnit('pt');
    setPageOrientation('portrait');
    setPageFitMode('contain-center');
    setPagesPerChunk(1);
    setImageFormat('png');
    setOcrLanguage('eng');
    setEnableOcrFallback(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (secondaryFileInputRef.current) {
      secondaryFileInputRef.current.value = '';
    }
  };

  const executePdfOperation = async () => {
    if (processing) return;
    if (files.length === 0) {
      setPdfError({
        code: 'ERR_EMPTY_FILE',
        message:
          language === 'es'
            ? 'Por favor cargue al menos un archivo.'
            : 'Please upload at least one file.',
      });
      return;
    }

    // Input validation for pdf-add-text (DEF-12R-02)
    let parsedTextX = 50;
    let parsedTextY = 700;
    let parsedTextFontSize = 14;
    let parsedTextOpacity = 1;
    let parsedTextRotation = 0;
    if (uiConfig.canonicalId === 'pdf-add-text') {
      parsedTextX = Number(textXInput);
      parsedTextY = Number(textYInput);
      parsedTextFontSize = Number(textFontSizeInput);
      parsedTextOpacity = Number(textOpacityInput);
      parsedTextRotation = Number(textRotationInput);
      if (
        textXInput.trim() === '' ||
        textYInput.trim() === '' ||
        !Number.isFinite(parsedTextX) ||
        !Number.isFinite(parsedTextY)
      ) {
        setPdfError({
          code: 'ERR_INVALID_DIMENSIONS',
          message:
            language === 'es'
              ? 'Las coordenadas X e Y para insertar texto deben ser números finitos válidos.'
              : 'Text insertion coordinates X and Y must be valid finite numbers.',
        });
        return;
      }
      if (
        textFontSizeInput.trim() === '' ||
        !Number.isFinite(parsedTextFontSize) ||
        parsedTextFontSize < 2 ||
        parsedTextFontSize > 300
      ) {
        setPdfError({
          code: 'ERR_INVALID_DIMENSIONS',
          message:
            language === 'es'
              ? 'El tamaño de fuente debe estar entre 2 y 300 puntos.'
              : 'Font size must be a valid number between 2 and 300 points.',
        });
        return;
      }
      if (
        textOpacityInput.trim() === '' ||
        !Number.isFinite(parsedTextOpacity) ||
        parsedTextOpacity <= 0 ||
        parsedTextOpacity > 1
      ) {
        setPdfError({
          code: 'ERR_INVALID_DIMENSIONS',
          message:
            language === 'es'
              ? 'La opacidad del texto debe estar entre 0.05 y 1.0.'
              : 'Text opacity must be a number in the range (0, 1].',
        });
        return;
      }
      if (
        textRotationInput.trim() === '' ||
        !Number.isFinite(parsedTextRotation) ||
        parsedTextRotation < -360 ||
        parsedTextRotation > 360
      ) {
        setPdfError({
          code: 'ERR_INVALID_DIMENSIONS',
          message:
            language === 'es'
              ? 'El ángulo de rotación debe estar entre -360 y 360 grados.'
              : 'Text rotation angle must be between -360 and 360 degrees.',
        });
        return;
      }
    }

    // Input validation for pdf-page-resizer custom dimensions (DEF-12R-02)
    let parsedCustomWidth: number | undefined;
    let parsedCustomHeight: number | undefined;
    if (uiConfig.canonicalId === 'pdf-page-resizer' && pageSizePreset === 'Custom') {
      parsedCustomWidth = Number(customPageWidthInput);
      parsedCustomHeight = Number(customPageHeightInput);
      if (
        customPageWidthInput.trim() === '' ||
        customPageHeightInput.trim() === '' ||
        !Number.isFinite(parsedCustomWidth) ||
        !Number.isFinite(parsedCustomHeight) ||
        parsedCustomWidth <= 0 ||
        parsedCustomHeight <= 0
      ) {
        setPdfError({
          code: 'ERR_INVALID_DIMENSIONS',
          message:
            language === 'es'
              ? 'El ancho y alto personalizados de la página deben ser números positivos mayores que cero.'
              : 'Custom page width and height must be positive numbers greater than zero.',
        });
        return;
      }
    }

    revokeActiveBlobUrls();
    setResultOutput(null);
    setProcessing(true);
    setPdfError(null);
    setProgressText(
      language === 'es'
        ? 'Procesando documento en el navegador...'
        : 'Processing document in browser...'
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Explicit legacy V1 path ONLY for non-catalog V1 switch case `pdf-duplicate-pages`
      if (activeToolId === 'pdf-duplicate-pages') {
        const primaryFile = files[0];
        const buf = await primaryFile.arrayBuffer();
        const res = await pdfEngine.duplicatePages(buf, selectedPages);
        const blob = createSafeBlob(res.outputBytes, 'application/pdf');
        const blobUrl = URL.createObjectURL(blob);
        activeBlobUrlsRef.current.push(blobUrl);
        const outName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}_duplicated.pdf`;
        setResultOutput({
          fileName: outName,
          blobUrl,
          sizeText: formatByteSize(blob.size),
          summary: res.summary,
          details: res.details || {}
        });
        return;
      }

      const resolution = resolvePdfWorkspaceToolV2(activeToolId);
      if (!resolution.supported) {
        setPdfError(resolution.error || `Unsupported PDF operation "${activeToolId}".`);
        return;
      }

      const v2Result = await executePdfWorkspaceFilesV2({
        toolId: activeToolId,
        files,
        secondaryFiles,
        workspaceParams: {
          selectedPageIndices: selectedPages,
          pageRangeText,
          paramText,
          textX: uiConfig.canonicalId === 'pdf-add-text' ? parsedTextX : undefined,
          textY: uiConfig.canonicalId === 'pdf-add-text' ? parsedTextY : undefined,
          textCoordinateOrigin:
            uiConfig.canonicalId === 'pdf-add-text' ? textCoordinateOrigin : undefined,
          textFontSize: uiConfig.canonicalId === 'pdf-add-text' ? parsedTextFontSize : undefined,
          textFontFamily: uiConfig.canonicalId === 'pdf-add-text' ? textFontFamily : undefined,
          textColor: uiConfig.canonicalId === 'pdf-add-text' ? textColor : undefined,
          textAlign: uiConfig.canonicalId === 'pdf-add-text' ? textAlign : undefined,
          textOpacity: uiConfig.canonicalId === 'pdf-add-text' ? parsedTextOpacity : undefined,
          textRotationDegrees:
            uiConfig.canonicalId === 'pdf-add-text' ? parsedTextRotation : undefined,
          metadataTitle: paramText || undefined,
          metadataAuthor: metadataAuthor || undefined,
          metadataSubject: metadataSubject || undefined,
          metadataKeywords: metadataKeywords || undefined,
          rotationAngle: uiConfig.showsRotationSelector ? Number(paramText) || 90 : undefined,
          cropMarginPt,
          pageSizePreset,
          customPageWidth:
            uiConfig.canonicalId === 'pdf-page-resizer' && pageSizePreset === 'Custom'
              ? parsedCustomWidth
              : undefined,
          customPageHeight:
            uiConfig.canonicalId === 'pdf-page-resizer' && pageSizePreset === 'Custom'
              ? parsedCustomHeight
              : undefined,
          pageSizeUnit: uiConfig.canonicalId === 'pdf-page-resizer' ? pageSizeUnit : undefined,
          pageOrientation:
            uiConfig.canonicalId === 'pdf-page-resizer' ? pageOrientation : undefined,
          pageFitMode: uiConfig.canonicalId === 'pdf-page-resizer' ? pageFitMode : undefined,
          pagesPerChunk,
          password: passwordInput || undefined,
          userPassword: passwordInput || undefined,
          ownerPassword: ownerPasswordInput || undefined,
          imageFormat,
          ocrLanguage,
          enableOcrFallback
        },
        signal: controller.signal,
        onProgress: (prog) => {
          if (prog.message) {
            setProgressText(prog.message);
          }
        }
      });

      if (v2Result.status !== 'SUCCESS' || v2Result.error) {
        setPdfError(
          v2Result.error || {
            code: 'ERR_PROCESSING_FAILURE',
            message: v2Result.summary || 'Failed to process PDF document.',
          }
        );
        return;
      }

      const primaryOut = v2Result.primaryOutput || v2Result.outputs[0];
      if (!primaryOut && !v2Result.outputBytes) {
        setPdfError({
          code: 'ERR_OUTPUT_INTEGRITY',
          message:
            language === 'es'
              ? 'La operación finalizó sin generar bytes de salida.'
              : 'The operation completed without producing output bytes.',
        });
        return;
      }

      const primaryBytes = primaryOut ? primaryOut.bytes : v2Result.outputBytes!;
      const primaryMime = primaryOut ? primaryOut.mimeType : 'application/pdf';
      const primaryName =
        primaryOut?.fileName ||
        `${files[0].name.replace(/\.[^/.]+$/, '')}_processed.pdf`;

      const primaryBlob = createSafeBlob(primaryBytes, primaryMime);
      const primaryBlobUrl = URL.createObjectURL(primaryBlob);
      activeBlobUrlsRef.current.push(primaryBlobUrl);

      const additionalOutputs: WorkspaceGeneratedDownload[] = [];
      for (let outIdx = 0; outIdx < v2Result.outputs.length; outIdx++) {
        const outFile = v2Result.outputs[outIdx];
        if (
          outIdx === 0 &&
          primaryOut &&
          outFile.fileName === primaryOut.fileName &&
          outFile.byteLength === primaryOut.byteLength
        ) {
          continue;
        }
        const extraBlob = createSafeBlob(outFile.bytes, outFile.mimeType);
        const extraUrl = URL.createObjectURL(extraBlob);
        activeBlobUrlsRef.current.push(extraUrl);
        additionalOutputs.push({
          fileName: outFile.fileName,
          blobUrl: extraUrl,
          sizeText: formatByteSize(extraBlob.size),
          mimeType: outFile.mimeType
        });
      }

      setResultOutput({
        fileName: primaryName,
        blobUrl: primaryBlobUrl,
        sizeText: formatByteSize(primaryBlob.size),
        summary: v2Result.summary,
        previewText: v2Result.previewText,
        warnings: v2Result.warnings,
        limitations: v2Result.limitations,
        additionalOutputs: additionalOutputs.length > 0 ? additionalOutputs : undefined,
        details: v2Result.details || (v2Result.inspectionReport?.rawData as Record<string, any>)
      });
    } catch (err: any) {
      setPdfError(
        err || {
          code: 'ERR_PROCESSING_FAILURE',
          message: 'Failed to process PDF file. Ensure the file is a valid PDF document.',
        }
      );
    } finally {
      abortControllerRef.current = null;
      setProcessing(false);
      setProgressText('');
    }
  };

  const canRenderPdfThumbnails =
    files.length > 0 &&
    uiConfig.supportsThumbnailSelection &&
    files[0].name.toLowerCase().endsWith('.pdf');

  const allowsMultiple =
    uiConfig.allowMultiplePrimaryFiles || uiConfig.requiresSecondFileDropzone;

  return (
    <ToolSplitWorkspace
      ratio="7-5"
      inputs={
        <section className="ui-panel p-5 sm:p-6 space-y-5">
          {/* Panel Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border-subtle">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                {language === 'es' ? 'Archivos y opciones' : 'Files & Processing Options'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {language === 'es'
                  ? 'Procesamiento local en el navegador — tus documentos no salen de tu dispositivo.'
                  : 'Runs locally in your browser — files stay private on your device.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('btn.reset') || 'Reset'}</span>
            </button>
          </div>

          {/* Primary Dropzone */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPrimary(true);
            }}
            onDragLeave={() => setIsDraggingPrimary(false)}
            onDrop={(e) => handleDrop(e, false)}
            className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDraggingPrimary
                ? 'border-accent bg-accent-light/70 dark:bg-surface-selected/60'
                : 'border-border-main bg-surface-secondary/50 hover:border-accent/70 hover:bg-surface-hover/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={uiConfig.acceptAttribute}
              multiple={allowsMultiple}
              onChange={(e) => handleFileChange(e, false)}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-2.5 border border-accent/20">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {files.length > 0
                ? uiConfig.allowMultiplePrimaryFiles
                  ? language === 'es'
                    ? `${files.length} archivo(s) seleccionado(s) — clic o arrastra para agregar más`
                    : `${files.length} file(s) selected — click or drop to add more files`
                  : language === 'es'
                    ? `${files.length} archivo(s) seleccionado(s) — clic para reemplazar`
                    : `${files.length} file(s) selected — click or drop to replace`
                : uiConfig.canonicalId === 'pdf-images-to-pdf'
                  ? language === 'es'
                    ? 'Haz clic o arrastra imágenes (PNG/JPG)'
                    : 'Click to upload or drag & drop images (PNG/JPG)'
                  : allowsMultiple
                    ? language === 'es'
                      ? 'Haz clic o arrastra uno o más archivos PDF'
                      : 'Click to upload or drag & drop PDF files'
                    : language === 'es'
                      ? 'Haz clic o arrastra tu archivo PDF'
                      : 'Click to upload or drag & drop a PDF file'}
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {allowsMultiple
                ? language === 'es'
                  ? `Herramienta activa: ${currentTool.name} · Admite varios archivos`
                  : `Active tool: ${currentTool.name} · Multiple files supported`
                : language === 'es'
                  ? `Herramienta activa: ${currentTool.name}`
                  : `Active tool: ${currentTool.name}`}
            </p>
          </label>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold">
                  {language === 'es' ? 'Archivos seleccionados' : 'Selected files'} ({files.length})
                </span>
                <div className="flex items-center gap-2.5">
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearPrimaryFiles}
                      className="text-[11px] font-medium text-text-tertiary hover:text-status-error transition-colors cursor-pointer"
                    >
                      {language === 'es' ? 'Limpiar todo' : 'Clear all'}
                    </button>
                  )}
                  <span className="font-mono text-[11px] text-text-tertiary">
                    {formatByteSize(files.reduce((sum, f) => sum + f.size, 0))}
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-secondary/40 overflow-hidden">
                {files.map((file, idx) => (
                  <li
                    key={`${file.name}-${file.size}-${idx}`}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="font-medium text-text-primary truncate">{file.name}</span>
                      <span className="text-[11px] font-mono text-text-tertiary shrink-0">
                        {formatByteSize(file.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {uiConfig.allowMultiplePrimaryFiles && files.length > 1 && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveFile(idx, -1)}
                            aria-label={`Move ${file.name} up`}
                            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === files.length - 1}
                            onClick={() => handleMoveFile(idx, 1)}
                            aria-label={`Move ${file.name} down`}
                            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        aria-label={`Remove ${file.name}`}
                        className="p-1 rounded-md text-text-tertiary hover:text-status-error hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {uiConfig.canonicalId === 'pdf-merge' && files.length === 1 && (
                <p className="text-xs text-text-secondary">
                  {language === 'es'
                    ? 'Agrega al menos 1 archivo PDF más (se requieren 2 o más archivos para combinar).'
                    : 'Add at least 1 more PDF file using the upload area above (2 or more files required to merge).'}
                </p>
              )}
            </div>
          )}

          {/* Second File Dropzone (PDF Comparison) */}
          {uiConfig.requiresSecondFileDropzone && files.length < 2 && (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSecondary(true);
              }}
              onDragLeave={() => setIsDraggingSecondary(false)}
              onDrop={(e) => handleDrop(e, true)}
              className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                isDraggingSecondary
                  ? 'border-accent bg-accent-light/70'
                  : 'border-border-main bg-surface-secondary/40 hover:border-accent/70'
              }`}
            >
              <input
                ref={secondaryFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileChange(e, true)}
                className="hidden"
              />
              <div className="text-xs font-semibold text-text-primary">
                {secondaryFiles.length > 0
                  ? `Comparison File B: ${secondaryFiles[0].name} (${formatByteSize(secondaryFiles[0].size)})`
                  : language === 'es'
                    ? 'Seleccionar segundo archivo PDF (Documento B) para comparar'
                    : 'Select Second PDF File (Document B) for Comparison'}
              </div>
            </label>
          )}

          {/* Shared PDF Thumbnail Preview / Visual Page Range Preview Grid */}
          {canRenderPdfThumbnails &&
            (uiConfig.canonicalId === 'pdf-extract-pages' ? (
              <PdfPageRangePreviewGrid
                file={files[0]}
                pageRangeText={pageRangeText}
                selectedPageIndices={selectedPages}
                processing={processing}
                onPageSelectionChange={handlePageRangeSelectionChange}
                onExtractSelected={executePdfOperation}
              />
            ) : (
              <PdfThumbnailPreview
                file={files[0]}
                selectedPageIndices={selectedPages}
                onTogglePageSelection={handleTogglePage}
              />
            ))}

          {/* Page Range / Order Input */}
          {uiConfig.showsPageRangeInput && (
            <div className="space-y-1.5">
              <label className="ui-label block">
                {uiConfig.canonicalId.includes('reorder')
                  ? 'New Page Order (e.g. 3, 1, 2)'
                  : 'Page Range or Selection (e.g. 1-3, 5)'}
              </label>
              <input
                type="text"
                value={pageRangeText}
                onChange={(e) => handlePageRangeTextChange(e.target.value)}
                placeholder={
                  uiConfig.canonicalId.includes('reorder')
                    ? 'e.g. 3, 1, 2 (or click page thumbnails above)'
                    : 'e.g. 1-2, 4 (or click page thumbnails above)'
                }
                className="ui-input"
              />
              {uiConfig.canonicalId === 'pdf-delete-pages' && (
                <p className="text-[11px] text-text-tertiary">
                  {language === 'es'
                    ? 'Las páginas seleccionadas se eliminarán; debe quedar al menos 1 página.'
                    : 'Selected pages will be removed; at least 1 page must remain in the document.'}
                </p>
              )}
              {uiConfig.canonicalId === 'pdf-rotate-pages' && (
                <p className="text-[11px] text-text-tertiary">
                  {language === 'es'
                    ? 'Deja este campo vacío para rotar todas las páginas, o selecciona páginas específicas.'
                    : 'Leave blank to rotate all pages, or select specific pages above / enter ranges.'}
                </p>
              )}
            </div>
          )}

          {/* Split Chunk Size */}
          {uiConfig.showsSplitChunkInput && (
            <div className="space-y-1.5">
              <label className="ui-label block">Pages Per Split File</label>
              <input
                type="number"
                min={1}
                max={500}
                value={pagesPerChunk}
                onChange={(e) => setPagesPerChunk(Math.max(1, Number(e.target.value) || 1))}
                className="ui-input font-mono tabular-nums"
              />
            </div>
          )}

          {/* Text Parameter */}
          {uiConfig.showsTextInput && (
            <div className="space-y-1.5">
              <label className="ui-label block">{uiConfig.textInputLabel}</label>
              <input
                type="text"
                value={paramText}
                onChange={(e) => setParamText(e.target.value)}
                placeholder={uiConfig.textInputPlaceholder}
                className="ui-input"
              />
            </div>
          )}

          {/* Add Text Position & Styling (DEF-12R-02) */}
          {uiConfig.showsAddTextControls && (
            <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-3">
              <div className="text-xs font-semibold text-text-primary">
                {language === 'es' ? 'Posición y Estilo del Texto' : 'Text Position & Styling'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="ui-label block">Horizontal X (pt)</label>
                  <input
                    type="number"
                    value={textXInput}
                    onChange={(e) => setTextXInput(e.target.value)}
                    placeholder="50"
                    className="ui-input font-mono tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Vertical Y (pt)</label>
                  <input
                    type="number"
                    value={textYInput}
                    onChange={(e) => setTextYInput(e.target.value)}
                    placeholder="700"
                    className="ui-input font-mono tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Coordinate Origin</label>
                  <select
                    value={textCoordinateOrigin}
                    onChange={(e) =>
                      setTextCoordinateOrigin(e.target.value as 'bottom-left' | 'top-left')
                    }
                    className="ui-select"
                  >
                    <option value="bottom-left">Bottom-Left (PDF Standard)</option>
                    <option value="top-left">Top-Left</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Font Size (2–300 pt)</label>
                  <input
                    type="number"
                    min={2}
                    max={300}
                    value={textFontSizeInput}
                    onChange={(e) => setTextFontSizeInput(e.target.value)}
                    placeholder="14"
                    className="ui-input font-mono tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Font Family</label>
                  <select
                    value={textFontFamily}
                    onChange={(e) =>
                      setTextFontFamily(
                        e.target.value as 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier'
                      )
                    }
                    className="ui-select"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="HelveticaBold">Helvetica Bold</option>
                    <option value="TimesRoman">Times Roman</option>
                    <option value="Courier">Courier (Monospace)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Alignment</label>
                  <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value as 'left' | 'center' | 'right')}
                    className="ui-select"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Text Color (Hex)</label>
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#000000"
                    className="ui-input font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Opacity (0.05–1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.05}
                    max={1}
                    value={textOpacityInput}
                    onChange={(e) => setTextOpacityInput(e.target.value)}
                    placeholder="1.0"
                    className="ui-input font-mono tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Rotation (-360° to 360°)</label>
                  <input
                    type="number"
                    min={-360}
                    max={360}
                    value={textRotationInput}
                    onChange={(e) => setTextRotationInput(e.target.value)}
                    placeholder="0"
                    className="ui-input font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Metadata Editor Fields */}
          {uiConfig.showsMetadataFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="ui-label block">New PDF Title</label>
                <input
                  type="text"
                  value={paramText}
                  onChange={(e) => setParamText(e.target.value)}
                  placeholder="Document Title"
                  className="ui-input"
                />
              </div>
              <div className="space-y-1">
                <label className="ui-label block">Author</label>
                <input
                  type="text"
                  value={metadataAuthor}
                  onChange={(e) => setMetadataAuthor(e.target.value)}
                  placeholder="Author Name"
                  className="ui-input"
                />
              </div>
              <div className="space-y-1">
                <label className="ui-label block">Subject</label>
                <input
                  type="text"
                  value={metadataSubject}
                  onChange={(e) => setMetadataSubject(e.target.value)}
                  placeholder="Document Subject"
                  className="ui-input"
                />
              </div>
              <div className="space-y-1">
                <label className="ui-label block">Keywords</label>
                <input
                  type="text"
                  value={metadataKeywords}
                  onChange={(e) => setMetadataKeywords(e.target.value)}
                  placeholder="comma, separated, keywords"
                  className="ui-input"
                />
              </div>
            </div>
          )}

          {/* Rotation Angle */}
          {uiConfig.showsRotationSelector && (
            <div className="space-y-1.5">
              <label className="ui-label block">Rotation Angle (Degrees)</label>
              <select
                value={paramText || '90'}
                onChange={(e) => setParamText(e.target.value)}
                className="ui-select"
              >
                <option value="90">90° Clockwise</option>
                <option value="180">180°</option>
                <option value="270">270° Clockwise (90° Counter-Clockwise)</option>
              </select>
            </div>
          )}

          {/* Crop Margin */}
          {uiConfig.showsCropMarginInput && (
            <div className="space-y-1.5">
              <label className="ui-label block">Crop Margin (Points, 72 pt = 1 inch)</label>
              <input
                type="number"
                min={1}
                max={200}
                value={cropMarginPt}
                onChange={(e) => setCropMarginPt(Math.max(1, Number(e.target.value) || 20))}
                className="ui-input font-mono tabular-nums"
              />
            </div>
          )}

          {/* Page Size Selector (DEF-12R-02) */}
          {uiConfig.showsPageSizeSelector && (
            <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="ui-label block">Target Paper Size</label>
                  <select
                    value={pageSizePreset}
                    onChange={(e) =>
                      setPageSizePreset(
                        e.target.value as
                          | 'A4'
                          | 'Letter'
                          | 'Legal'
                          | 'A3'
                          | 'A5'
                          | 'B5'
                          | 'Tabloid'
                          | 'Executive'
                          | 'Custom'
                      )
                    }
                    className="ui-select"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="Letter">US Letter (8.5 × 11 in)</option>
                    <option value="Legal">US Legal (8.5 × 14 in)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="B5">B5 (176 × 250 mm)</option>
                    <option value="Tabloid">Tabloid / Ledger (11 × 17 in)</option>
                    <option value="Executive">Executive (7.25 × 10.5 in)</option>
                    <option value="Custom">Custom Dimensions</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Orientation</label>
                  <select
                    value={pageOrientation}
                    onChange={(e) =>
                      setPageOrientation(e.target.value as 'portrait' | 'landscape' | 'auto')
                    }
                    className="ui-select"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="auto">Auto (Match Source)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="ui-label block">Scaling Mode</label>
                  <select
                    value={pageFitMode}
                    onChange={(e) =>
                      setPageFitMode(
                        e.target.value as 'contain-center' | 'stretch' | 'pad-center'
                      )
                    }
                    className="ui-select"
                  >
                    <option value="contain-center">Contain & Center</option>
                    <option value="stretch">Stretch to Fill</option>
                    <option value="pad-center">Pad & Center (No Scale)</option>
                  </select>
                </div>
              </div>

              {pageSizePreset === 'Custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="ui-label block">Custom Width</label>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={customPageWidthInput}
                      onChange={(e) => setCustomPageWidthInput(e.target.value)}
                      placeholder="612"
                      className="ui-input font-mono tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label block">Custom Height</label>
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={customPageHeightInput}
                      onChange={(e) => setCustomPageHeightInput(e.target.value)}
                      placeholder="792"
                      className="ui-input font-mono tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label block">Units</label>
                    <select
                      value={pageSizeUnit}
                      onChange={(e) => setPageSizeUnit(e.target.value as 'pt' | 'mm' | 'in')}
                      className="ui-select"
                    >
                      <option value="pt">Points (pt)</option>
                      <option value="mm">Millimeters (mm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Output Format */}
          {uiConfig.showsImageFormatSelector && (
            <div className="space-y-1.5">
              <label className="ui-label block">Output Image Format</label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                className="ui-select"
              >
                <option value="png">PNG (Lossless High-Fidelity)</option>
                <option value="jpeg">JPG / JPEG (Compact)</option>
              </select>
            </div>
          )}

          {/* OCR Controls */}
          {uiConfig.showsOcrControls && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="ui-label block">OCR Recognition Language</label>
                <select
                  value={ocrLanguage}
                  onChange={(e) =>
                    setOcrLanguage(e.target.value as 'eng' | 'spa' | 'eng+spa')
                  }
                  className="ui-select"
                >
                  <option value="eng">English (eng)</option>
                  <option value="spa">Español (spa)</option>
                  <option value="eng+spa">Bilingual (eng+spa)</option>
                </select>
              </div>
              {uiConfig.canonicalId === 'pdf-to-text' && (
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer pt-5">
                  <input
                    type="checkbox"
                    checked={enableOcrFallback}
                    onChange={(e) => setEnableOcrFallback(e.target.checked)}
                    className="rounded border-border-main accent-accent"
                  />
                  <span>Enable OCR Fallback for Scanned Pages</span>
                </label>
              )}
            </div>
          )}

          {/* Password Inputs */}
          {uiConfig.showsPasswordInputs === 'protect' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="ui-label block">Document Open Password (Required)</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password to encrypt PDF..."
                  autoComplete="new-password"
                  className="ui-input"
                />
              </div>
              <div className="space-y-1">
                <label className="ui-label block">Owner Password (Optional)</label>
                <input
                  type="password"
                  value={ownerPasswordInput}
                  onChange={(e) => setOwnerPasswordInput(e.target.value)}
                  placeholder="Optional owner password..."
                  autoComplete="new-password"
                  className="ui-input"
                />
              </div>
            </div>
          )}

          {uiConfig.showsPasswordInputs === 'unlock-or-open' && (
            <div className="space-y-1.5">
              <label className="ui-label block">
                {uiConfig.canonicalId === 'pdf-remove-password'
                  ? 'Current PDF Password (Required to Unlock)'
                  : 'PDF Password (Optional — if encrypted)'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={
                  uiConfig.canonicalId === 'pdf-remove-password'
                    ? 'Enter current PDF password...'
                    : 'Leave blank if PDF is not password-protected'
                }
                autoComplete="current-password"
                className="ui-input"
              />
            </div>
          )}

          {/* Primary Action & Cancel */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={processing || files.length === 0}
              onClick={executePdfOperation}
              className="ui-btn-primary flex-1 py-2.5"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{language === 'es' ? 'Procesar PDF' : 'Process PDF Document'}</span>
                </>
              )}
            </button>

            {processing && (
              <button
                type="button"
                onClick={cancelActiveOperation}
                className="ui-btn-secondary py-2.5 text-status-error border-status-error/30"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            )}
          </div>
        </section>
      }
      results={
        <section
          aria-live="polite"
          className="ui-panel p-5 sm:p-6 space-y-4 lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              {language === 'es' ? 'Salida y descarga' : 'Output & Download'}
            </h2>
            {resultOutput && (
              <span className="text-xs font-mono text-text-tertiary">
                {resultOutput.sizeText}
              </span>
            )}
          </div>

          {pdfError ? (
            <PdfErrorDisplay
              errorMessage={pdfError}
              language={language}
              title={language === 'es' ? 'No se pudo procesar' : 'Processing error'}
              onDismiss={() => setPdfError(null)}
              onRetry={files.length > 0 ? executePdfOperation : undefined}
              onReset={handleReset}
            />
          ) : processing ? (
            <div className="ui-empty-state space-y-2">
              <RefreshCw className="w-5 h-5 text-accent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-text-primary">
                {progressText || (language === 'es' ? 'Procesando...' : 'Processing document...')}
              </p>
              <p className="text-xs text-text-secondary">
                {language === 'es'
                  ? 'Procesamiento seguro en el navegador.'
                  : 'Running locally in your browser.'}
              </p>
            </div>
          ) : resultOutput ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-accent/25 bg-accent-light/60 dark:bg-surface-selected/70 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary break-all">
                      {resultOutput.fileName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {language === 'es' ? 'Tamaño:' : 'Size:'} {resultOutput.sizeText}
                    </p>
                  </div>
                </div>

                <a
                  href={resultOutput.blobUrl}
                  download={resultOutput.fileName}
                  className="ui-btn-primary w-full"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'es' ? 'Descargar resultado' : 'Download Result'}</span>
                </a>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5">
                {resultOutput.summary}
              </p>

              {resultOutput.warnings && resultOutput.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-text-primary space-y-1">
                  {resultOutput.warnings.map((w, idx) => (
                    <p key={idx}>{w}</p>
                  ))}
                </div>
              )}

              {resultOutput.additionalOutputs && resultOutput.additionalOutputs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-secondary">
                    Additional Output Files ({resultOutput.additionalOutputs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {resultOutput.additionalOutputs.map((extra) => (
                      <div
                        key={extra.fileName}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-surface-secondary/40 text-xs"
                      >
                        <span className="truncate font-medium text-text-primary">
                          {extra.fileName}{' '}
                          <span className="text-text-tertiary font-mono">({extra.sizeText})</span>
                        </span>
                        <a
                          href={extra.blobUrl}
                          download={extra.fileName}
                          className="text-accent font-semibold hover:underline shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resultOutput.previewText && (
                <pre className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/60 text-xs font-mono text-text-primary overflow-x-auto max-h-64 whitespace-pre-wrap">
                  {resultOutput.previewText.slice(0, 6000)}
                </pre>
              )}
            </div>
          ) : (
            <div className="ui-empty-state space-y-1.5">
              <FileText className="w-6 h-6 text-text-tertiary mx-auto" />
              <p className="text-sm font-semibold text-text-primary">
                {language === 'es' ? 'Listo para procesar' : 'Ready to process'}
              </p>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                {language === 'es'
                  ? 'Carga tus archivos a la izquierda, ajusta las opciones y haz clic en Procesar PDF.'
                  : 'Upload your file(s) on the left, adjust any options, and click Process PDF Document.'}
              </p>
            </div>
          )}
        </section>
      }
    />
  );
}
