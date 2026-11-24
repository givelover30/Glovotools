import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Download,
  FileText,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react';
import { CALCULATORS } from '../../data/calculators.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { DOC_CONVERTER_LOCALE } from '../../i18n/docConverterTranslations.ts';
import { getDocumentContract } from '../../engine/contracts/phase27_document_converter_contracts.ts';
import {
  inspectSpreadsheetSheets
} from '../../services/document/documentConversionEngine.ts';
import {
  ConversionOptions,
  ConversionOutput,
  DocumentConverterId,
  MarginPreset,
  PageOrientation,
  PageSizePreset
} from '../../services/document/types.ts';
import {
  createSafeBlob,
  revokeObjectUrlSafely
} from '../../services/pdf/pdfRuntime.ts';
import {
  executeDocumentConverterWorkspaceV2
} from '../../services/pdf/v2/pdfWorkspaceIntegration.ts';
import { type PdfErrorInput } from '../common/PdfErrorAlert.tsx';
import PdfErrorDisplay from '../common/PdfErrorDisplay.tsx';
import { ToolSplitWorkspace } from '../calculator/ToolWorkspacePrimitives.tsx';

interface DocumentConvertersWorkspaceProps {
  initialTool?: string;
}

export default function DocumentConvertersWorkspace({
  initialTool = 'pdf-to-word-docx'
}: DocumentConvertersWorkspaceProps) {
  const { language } = useTranslation();
  const strings = DOC_CONVERTER_LOCALE[language] || DOC_CONVERTER_LOCALE.en;
  const isEs = language === 'es';

  const docConverters = useMemo(
    () => CALCULATORS.filter((c) => c.category === 'document-converters'),
    []
  );

  const [activeToolId, setActiveToolId] = useState<string>(initialTool);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [pdfError, setPdfError] = useState<PdfErrorInput | null>(null);
  const [result, setResult] = useState<{
    output: ConversionOutput;
    blobUrl: string;
  } | null>(null);

  // Conversion Settings (100% preserved)
  const [pageSize, setPageSize] = useState<PageSizePreset>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [margins, setMargins] = useState<MarginPreset>('normal');
  const [fontSize, setFontSize] = useState<number>(10.5);
  const [enableOcrFallback, setEnableOcrFallback] = useState<boolean>(false);
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');
  const [pptxMode, setPptxMode] = useState<'editable' | 'images'>('editable');
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t'>(',');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('__ALL__');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [jsonPretty, setJsonPretty] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const contract = useMemo(
    () =>
      getDocumentContract(activeToolId) ||
      getDocumentContract(docConverters[0]?.id || 'pdf-to-word-docx')!,
    [activeToolId, docConverters]
  );

  const currentToolMeta = useMemo(
    () => docConverters.find((t) => t.id === activeToolId) || docConverters[0],
    [docConverters, activeToolId]
  );

  const revokeActiveBlob = () => {
    if (activeBlobUrlRef.current) {
      revokeObjectUrlSafely(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
  };

  const cancelActiveConversion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelActiveConversion();
      revokeActiveBlob();
    };
  }, []);

  useEffect(() => {
    if (initialTool && initialTool !== activeToolId) {
      setActiveToolId(initialTool);
      handleReset();
    }
  }, [initialTool]);

  const handleReset = () => {
    cancelActiveConversion();
    revokeActiveBlob();
    setFile(null);
    setResult(null);
    setPdfError(null);
    setProgressPct(0);
    setProgressMsg('');
    setAvailableSheets([]);
    setSelectedSheet('__ALL__');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const acceptAndLoadFile = async (chosen: File) => {
    revokeActiveBlob();
    setResult(null);
    setPdfError(null);

    if (chosen.size === 0) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPdfError({
        code: 'ERR_EMPTY_FILE',
        message: isEs
          ? `El archivo seleccionado está vacío (0 bytes). Formatos admitidos: ${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}`
          : `The selected file is empty (0 bytes). Accepted formats: ${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}`,
      });
      return;
    }

    const ext = chosen.name.split('.').pop()?.toLowerCase() || '';
    if (!contract.acceptedExtensions.includes(ext)) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const expectsPdfOnly =
        contract.acceptedExtensions.length === 1 && contract.acceptedExtensions[0] === 'pdf';
      setPdfError({
        code: expectsPdfOnly ? 'ERR_INVALID_PDF' : 'ERR_UNSUPPORTED_OPERATION',
        message: `${strings.invalidFileError} ${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}`,
        recoverableHint: isEs
          ? `Selecciona un archivo válido con extensión ${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}.`
          : `Select a valid file ending in ${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}.`,
      });
      return;
    }

    setFile(chosen);
    setAvailableSheets([]);
    setSelectedSheet('__ALL__');

    if (contract.supportsSheetSelection) {
      try {
        const bytes = new Uint8Array(await chosen.arrayBuffer());
        const sheets = await inspectSpreadsheetSheets(bytes, ext === 'csv');
        setAvailableSheets(sheets);
        if (sheets.length === 1) {
          setSelectedSheet(sheets[0]);
        } else {
          setSelectedSheet('__ALL__');
        }
      } catch {
        setAvailableSheets([]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      void acceptAndLoadFile(f);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      void acceptAndLoadFile(f);
    }
  };

  const handleConvert = async () => {
    if (!file || processing) return;

    cancelActiveConversion();
    revokeActiveBlob();
    setResult(null);
    setPdfError(null);
    setProcessing(true);
    setProgressPct(5);
    setProgressMsg(strings.converting);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);

      const options: ConversionOptions = {
        pageSize,
        orientation,
        margins,
        fontSize,
        enableOcrFallback,
        ocrLanguage,
        pptxMode,
        csvDelimiter,
        selectedSheet,
        imageFormat,
        jsonPretty
      };

      const output = await executeDocumentConverterWorkspaceV2(
        activeToolId as DocumentConverterId,
        file.name,
        bytes,
        options,
        (pct, msg) => {
          setProgressPct(pct);
          setProgressMsg(msg);
        },
        controller.signal
      );

      const blob = createSafeBlob(output.bytes, output.mimeType);
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrlRef.current = blobUrl;

      setProgressPct(100);
      setResult({ output, blobUrl });
    } catch (err: any) {
      setPdfError(
        err?.pdfError ||
          err ||
          (isEs
            ? 'Error al convertir el documento. Verifica que el archivo sea válido e inténtalo de nuevo.'
            : 'Document conversion failed. Please verify the file is valid and try again.')
      );
    } finally {
      abortControllerRef.current = null;
      setProcessing(false);
      setProgressMsg('');
    }
  };

  const formatBytes = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  };

  const hasSettings =
    contract.supportsPageSettings ||
    contract.supportsOcrFallback ||
    contract.supportsSheetSelection ||
    contract.supportsDelimiter ||
    contract.supportsPptxMode ||
    contract.supportsImageFormat ||
    contract.supportsJsonPretty;

  return (
    <ToolSplitWorkspace
      ratio="7-5"
      inputs={
        <section className="ui-panel p-5 sm:p-6 space-y-5">
          {/* Panel Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border-subtle">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                {isEs ? 'Archivo y opciones de conversión' : 'File & Conversion Options'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{strings.privacyNote}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{strings.resetBtn}</span>
            </button>
          </div>

          {/* Active Converter Quick Selector */}
          <div className="space-y-1.5">
            <label htmlFor="doc-converter-select" className="ui-label block">
              {strings.suiteTitle} ({docConverters.length})
            </label>
            <select
              id="doc-converter-select"
              value={activeToolId}
              onChange={(e) => {
                setActiveToolId(e.target.value);
                handleReset();
              }}
              className="ui-select"
            >
              {docConverters.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Upload Zone */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-accent bg-accent-light/70 dark:bg-surface-selected/60'
                : 'border-border-main bg-surface-secondary/50 hover:border-accent/70 hover:bg-surface-hover/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={contract.acceptAttribute}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center mx-auto mb-2.5 border border-accent/20">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {file ? `${strings.selectedFile}: ${file.name}` : strings.dropzoneTitle}
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {file
                ? `${formatBytes(file.size)} · ${contract.inputLabel} → .${contract.outputExtension.toUpperCase()}`
                : `${strings.dropzoneHint} (${contract.acceptedExtensions.map((e) => '.' + e).join(', ')})`}
            </p>
          </label>

          {/* Selected File Row */}
          {file && (
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border-subtle bg-surface-secondary/50 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-accent shrink-0" />
                <span className="font-medium text-text-primary truncate">{file.name}</span>
                <span className="text-[11px] font-mono text-text-tertiary shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                aria-label={isEs ? `Quitar ${file.name}` : `Remove ${file.name}`}
                className="p-1 rounded-md text-text-tertiary hover:text-status-error hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Conversion Settings Panel */}
          {hasSettings && (
            <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-3.5">
              <div className="text-xs font-semibold text-text-primary">
                {strings.settingsTitle}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {contract.supportsPageSettings && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="doc-page-size" className="ui-label block">
                        {strings.pageSize}
                      </label>
                      <select
                        id="doc-page-size"
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as PageSizePreset)}
                        className="ui-select"
                      >
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="Letter">US Letter (8.5 × 11 in)</option>
                        <option value="Legal">US Legal (8.5 × 14 in)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="doc-orientation" className="ui-label block">
                        {strings.orientation}
                      </label>
                      <select
                        id="doc-orientation"
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                        className="ui-select"
                      >
                        <option value="portrait">{strings.portrait}</option>
                        <option value="landscape">{strings.landscape}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="doc-margins" className="ui-label block">
                        {strings.margins}
                      </label>
                      <select
                        id="doc-margins"
                        value={margins}
                        onChange={(e) => setMargins(e.target.value as MarginPreset)}
                        className="ui-select"
                      >
                        <option value="narrow">{strings.narrow} (36 pt)</option>
                        <option value="normal">{strings.normal} (54 pt)</option>
                        <option value="wide">{strings.wide} (72 pt)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="doc-font-size" className="ui-label block">
                        {strings.fontSize}
                      </label>
                      <select
                        id="doc-font-size"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="ui-select"
                      >
                        <option value={9}>9 pt</option>
                        <option value={10.5}>10.5 pt (Default)</option>
                        <option value={12}>12 pt</option>
                        <option value={14}>14 pt</option>
                      </select>
                    </div>
                  </>
                )}

                {contract.supportsPptxMode && (
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="doc-pptx-mode" className="ui-label block">
                      {strings.pptxMode}
                    </label>
                    <select
                      id="doc-pptx-mode"
                      value={pptxMode}
                      onChange={(e) => setPptxMode(e.target.value as 'editable' | 'images')}
                      className="ui-select"
                    >
                      <option value="editable">{strings.pptxEditable}</option>
                      <option value="images">{strings.pptxImages}</option>
                    </select>
                  </div>
                )}

                {contract.supportsDelimiter && (
                  <div className="space-y-1">
                    <label htmlFor="doc-csv-delim" className="ui-label block">
                      {strings.csvDelimiter}
                    </label>
                    <select
                      id="doc-csv-delim"
                      value={csvDelimiter}
                      onChange={(e) => setCsvDelimiter(e.target.value as ',' | ';' | '\t')}
                      className="ui-select"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value={'\t'}>Tab (\t)</option>
                    </select>
                  </div>
                )}

                {contract.supportsSheetSelection && availableSheets.length > 0 && (
                  <div className="space-y-1">
                    <label htmlFor="doc-worksheet" className="ui-label block">
                      {strings.worksheet}
                    </label>
                    <select
                      id="doc-worksheet"
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      className="ui-select"
                    >
                      <option value="__ALL__">
                        {strings.allSheets} ({availableSheets.length})
                      </option>
                      {availableSheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contract.supportsImageFormat && (
                  <div className="space-y-1">
                    <label htmlFor="doc-img-fmt" className="ui-label block">
                      {strings.imageFormat}
                    </label>
                    <select
                      id="doc-img-fmt"
                      value={imageFormat}
                      onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                      className="ui-select"
                    >
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpeg">JPEG (Compact)</option>
                    </select>
                  </div>
                )}

                {contract.supportsJsonPretty && (
                  <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={jsonPretty}
                      onChange={(e) => setJsonPretty(e.target.checked)}
                      className="rounded border-border-main accent-accent"
                    />
                    <span>{strings.jsonPretty}</span>
                  </label>
                )}

                {contract.supportsOcrFallback && (
                  <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableOcrFallback}
                        onChange={(e) => setEnableOcrFallback(e.target.checked)}
                        className="rounded border-border-main accent-accent"
                      />
                      <span>{strings.ocrFallback}</span>
                    </label>
                    {enableOcrFallback && (
                      <select
                        aria-label={strings.ocrLanguage}
                        value={ocrLanguage}
                        onChange={(e) => setOcrLanguage(e.target.value)}
                        className="ui-select sm:w-auto"
                      >
                        <option value="eng">English (eng)</option>
                        <option value="spa">Spanish (spa)</option>
                        <option value="por">Portuguese (por)</option>
                        <option value="fra">French (fra)</option>
                        <option value="deu">German (deu)</option>
                        <option value="ita">Italian (ita)</option>
                        <option value="nld">Dutch (nld)</option>
                        <option value="pol">Polish (pol)</option>
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Convert & Cancel CTA */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={processing || !file}
              onClick={handleConvert}
              className="ui-btn-primary flex-1 py-2.5"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressMsg || strings.converting}</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{strings.convertBtn}</span>
                </>
              )}
            </button>

            {processing && (
              <button
                type="button"
                onClick={cancelActiveConversion}
                className="ui-btn-secondary py-2.5 text-status-error border-status-error/30"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden border border-border-subtle">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${Math.max(5, progressPct)}%` }}
                />
              </div>
              <div className="text-[11px] font-mono tabular-nums text-text-tertiary text-right">
                {progressPct}%
              </div>
            </div>
          )}

          {/* Honest Contract Limitation Footer */}
          <div className="flex items-start gap-2 text-[11px] text-text-tertiary pt-3 border-t border-border-subtle">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-text-tertiary" />
            <span>{contract.limitationsNote}</span>
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
              {isEs ? 'Salida y descarga' : 'Output & Download'}
            </h2>
            {result && (
              <span className="text-xs font-mono tabular-nums text-text-tertiary">
                {formatBytes(result.output.stats.outputSizeBytes)}
              </span>
            )}
          </div>

          {pdfError ? (
            <PdfErrorDisplay
              errorMessage={pdfError}
              language={language}
              title={isEs ? 'No se pudo convertir' : 'Conversion error'}
              onDismiss={() => setPdfError(null)}
              onRetry={file ? handleConvert : undefined}
              onReset={handleReset}
            />
          ) : processing ? (
            <div className="ui-empty-state space-y-2">
              <RefreshCw className="w-5 h-5 text-accent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-text-primary">
                {progressMsg || strings.converting}
              </p>
              <p className="text-xs font-mono tabular-nums text-text-secondary">
                {progressPct}%
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-result-border bg-result-bg p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-result-icon shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-result-text break-all">
                      {result.output.fileName}
                    </h3>
                    <p className="text-xs text-result-text-secondary mt-0.5 font-mono tabular-nums">
                      {strings.inputSize}: {formatBytes(result.output.stats.inputSizeBytes)} ·{' '}
                      {strings.outputSize}: {formatBytes(result.output.stats.outputSizeBytes)} ·{' '}
                      {strings.duration}: {result.output.stats.conversionTimeMs} ms
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={result.blobUrl}
                    download={result.output.fileName}
                    className="ui-btn-result flex-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>{strings.downloadBtn}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ui-btn-secondary"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{strings.convertAnotherBtn}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed rounded-xl border border-border-subtle bg-surface-secondary/50 p-3.5">
                {result.output.summary}
              </p>

              {/* Warnings */}
              {result.output.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-text-primary space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{strings.warningsTitle}</span>
                  </div>
                  {result.output.warnings.map((w, idx) => (
                    <p key={idx} className="text-text-secondary">
                      • {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Limitations */}
              {result.output.limitations.length > 0 && (
                <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3 text-xs text-text-secondary space-y-1">
                  <div className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-accent" />
                    <span>{strings.limitationsTitle}</span>
                  </div>
                  {result.output.limitations.map((lim, idx) => (
                    <p key={idx}>• {lim}</p>
                  ))}
                </div>
              )}

              {/* Image Slide Gallery Preview */}
              {result.output.previewImages && result.output.previewImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-secondary">
                    {strings.outputPreview} ({result.output.previewImages.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-0.5">
                    {result.output.previewImages.map((img) => (
                      <div
                        key={img.name}
                        className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-2 space-y-2"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-full rounded-lg border border-border-subtle object-contain"
                        />
                        <div className="flex items-center justify-between text-[11px] text-text-secondary px-1">
                          <span>
                            {img.name} ({img.width}×{img.height})
                          </span>
                          <a
                            href={img.dataUrl}
                            download={img.name}
                            className="text-result-icon font-semibold hover:underline"
                          >
                            {isEs ? 'Descargar' : 'Download'}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Preview */}
              {result.output.previewTable && result.output.previewTable.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-secondary">
                    {strings.outputPreview}
                  </h4>
                  <div className="overflow-x-auto max-h-[260px] rounded-xl border border-border-subtle bg-surface">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody>
                        {result.output.previewTable.slice(0, 12).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx === 0
                                ? 'bg-surface-secondary font-semibold text-text-primary'
                                : 'border-t border-border-subtle text-text-secondary'
                            }
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3 py-1.5 border-r border-border-subtle last:border-r-0 truncate max-w-[200px]"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* HTML Rendered Preview */}
              {result.output.previewHtml && !result.output.previewTable && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-secondary">
                    {strings.outputPreview}
                  </h4>
                  <iframe
                    title="Document HTML Preview"
                    sandbox=""
                    srcDoc={result.output.previewHtml}
                    className="w-full h-56 rounded-xl border border-border-subtle bg-white"
                  />
                </div>
              )}

              {/* Text / Markdown / CSV / JSON Preview */}
              {result.output.previewText &&
                !result.output.previewTable &&
                !result.output.previewHtml && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-secondary">
                      {strings.outputPreview}
                    </h4>
                    <pre className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/60 text-xs font-mono text-text-primary overflow-x-auto max-h-60 whitespace-pre-wrap">
                      {result.output.previewText.slice(0, 4000)}
                    </pre>
                  </div>
                )}
            </div>
          ) : (
            <div className="ui-empty-state space-y-1.5">
              <FileText className="w-6 h-6 text-text-tertiary mx-auto" />
              <p className="text-sm font-semibold text-text-primary">
                {isEs ? 'Listo para convertir' : 'Ready to convert'}
              </p>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                {isEs
                  ? `Carga un archivo (${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}) a la izquierda y haz clic en ${strings.convertBtn}.`
                  : `Upload a file (${contract.acceptedExtensions.map((e) => '.' + e).join(', ')}) on the left and click ${strings.convertBtn}.`}
              </p>
              <p className="text-[11px] font-mono text-text-tertiary pt-1">
                {currentToolMeta?.name || contract.name}
              </p>
            </div>
          )}
        </section>
      }
      below={
        <section className="ui-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {strings.suiteTitle} ({docConverters.length})
            </h3>
            <span className="text-xs text-text-tertiary">
              {isEs
                ? 'Cambia de convertidor sin salir del espacio de trabajo'
                : 'Switch document converter without leaving this workspace'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {docConverters.map((tool) => {
              const isActive = tool.id === activeToolId;
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveToolId(tool.id);
                    handleReset();
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer truncate ${
                    isActive
                      ? 'bg-accent-light dark:bg-surface-selected text-accent border-accent/40 font-semibold'
                      : 'bg-surface-secondary/40 text-text-secondary border-border-subtle hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        </section>
      }
    />
  );
}
