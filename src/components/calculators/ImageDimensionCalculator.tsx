import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolBreakdownList,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';

const DEFAULTS = {
  width: '1920',
  height: '1080',
  scale: 50,
};

interface InspectedImageMeta {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  naturalWidth: number;
  naturalHeight: number;
  previewUrl: string;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ImageDimensionCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [widthInput, setWidthInput] = useState<string>(DEFAULTS.width);
  const [heightInput, setHeightInput] = useState<string>(DEFAULTS.height);
  const [scale, setScale] = useState<number>(DEFAULTS.scale);

  const [inspectedImage, setInspectedImage] = useState<InspectedImageMeta | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (inspectedImage?.previewUrl) {
        URL.revokeObjectURL(inspectedImage.previewUrl);
      }
    };
  }, [inspectedImage]);

  const clearUploadedFile = () => {
    if (inspectedImage?.previewUrl) {
      URL.revokeObjectURL(inspectedImage.previewUrl);
    }
    setInspectedImage(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (inspectedImage?.previewUrl) {
      URL.revokeObjectURL(inspectedImage.previewUrl);
      setInspectedImage(null);
    }

    if (file.size === 0) {
      setUploadError(
        isEs
          ? `El archivo "${file.name}" está vacío (0 bytes) y no contiene datos de imagen.`
          : `The file "${file.name}" is empty (0 bytes) and contains no image data.`
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      if (!natW || !natH) {
        URL.revokeObjectURL(objectUrl);
        setUploadError(
          isEs
            ? `No se pudieron leer dimensiones válidas de "${file.name}".`
            : `Could not read valid dimensions from "${file.name}".`
        );
        return;
      }
      setUploadError(null);
      setWidthInput(String(natW));
      setHeightInput(String(natH));
      setInspectedImage({
        fileName: file.name,
        mimeType: file.type || 'image/unknown',
        fileSizeBytes: file.size,
        naturalWidth: natW,
        naturalHeight: natH,
        previewUrl: objectUrl,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError(
        isEs
          ? `"${file.name}" no es una imagen válida o está dañada.`
          : `"${file.name}" is not a valid or readable image file.`
      );
    };

    img.src = objectUrl;
  };

  const width = Number(widthInput);
  const height = Number(heightInput);
  const isWidthValid = widthInput.trim() !== '' && Number.isFinite(width) && width > 0;
  const isHeightValid = heightInput.trim() !== '' && Number.isFinite(height) && height > 0;
  const isValid = isWidthValid && isHeightValid;

  const stats = useMemo(() => {
    if (!isValid) return null;
    const w = Math.round(width);
    const h = Math.round(height);
    const divisor = gcd(w, h);
    const ratioW = w / divisor;
    const ratioH = h / divisor;
    const decimalRatio = (w / h).toFixed(3);
    const totalPixels = w * h;
    const megapixels = (totalPixels / 1_000_000).toFixed(2);
    const scaledW = Math.max(1, Math.round((w * scale) / 100));
    const scaledH = Math.max(1, Math.round((h * scale) / 100));
    const orientation =
      w > h ? (isEs ? 'Horizontal' : 'Landscape') : h > w ? (isEs ? 'Vertical' : 'Portrait') : isEs ? 'Cuadrada' : 'Square';

    return {
      w,
      h,
      aspectRatio: `${ratioW}:${ratioH}`,
      decimalRatio,
      totalPixels,
      megapixels,
      scaledW,
      scaledH,
      orientation,
    };
  }, [isValid, width, height, scale, isEs]);

  const copySummary = useMemo(() => {
    if (!stats) return '';
    const base = `${stats.w} × ${stats.h} px | Aspect Ratio: ${stats.aspectRatio} (${stats.decimalRatio}) | ${stats.megapixels} MP | Scaled (${scale}%): ${stats.scaledW} × ${stats.scaledH} px`;
    if (inspectedImage) {
      return `${inspectedImage.fileName} (${inspectedImage.mimeType}, ${formatFileSize(inspectedImage.fileSizeBytes)}) | ${base}`;
    }
    return base;
  }, [stats, scale, inspectedImage]);

  const handleReset = () => {
    clearUploadedFile();
    setWidthInput(DEFAULTS.width);
    setHeightInput(DEFAULTS.height);
    setScale(DEFAULTS.scale);
  };

  const handleClear = () => {
    clearUploadedFile();
    setWidthInput('');
    setHeightInput('');
  };

  const presets = [
    {
      label: '1080p HD',
      onSelect: () => {
        clearUploadedFile();
        setWidthInput('1920');
        setHeightInput('1080');
      },
    },
    {
      label: '4K UHD',
      onSelect: () => {
        clearUploadedFile();
        setWidthInput('3840');
        setHeightInput('2160');
      },
    },
    {
      label: '1:1 Square',
      onSelect: () => {
        clearUploadedFile();
        setWidthInput('1080');
        setHeightInput('1080');
      },
    },
    {
      label: '9:16 Mobile',
      onSelect: () => {
        clearUploadedFile();
        setWidthInput('1080');
        setHeightInput('1920');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Inspector y Dimensiones de Imagen' : 'Image Inspector & Dimensions'}
      subtitle={
        isEs
          ? 'Inspecciona archivos PNG/JPEG/WebP/SVG locales o calcula escala y relación de aspecto manualmente.'
          : 'Inspect local PNG/JPEG/WebP/SVG files in-browser or calculate aspect ratio and scaling manually.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Resoluciones' : 'Resolutions'} presets={presets} />

      {/* Local File Inspector */}
      <ToolFieldGroup
        label={isEs ? 'Inspeccionar Archivo de Imagen Local' : 'Inspect Local Image File'}
        htmlFor="image-dimension-file"
        hint={
          isEs
            ? 'Procesado 100% en tu navegador (PNG, JPEG, WebP, GIF, SVG). Nunca se sube a servidores.'
            : '100% browser-local (PNG, JPEG, WebP, GIF, SVG). Files never leave your device.'
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="image-dimension-file"
            className="ui-btn-secondary inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {isEs ? 'Seleccionar Imagen' : 'Choose Image File'}
          </label>
          <input
            ref={fileInputRef}
            id="image-dimension-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          {inspectedImage && (
            <button
              type="button"
              onClick={clearUploadedFile}
              className="ui-btn-secondary inline-flex items-center gap-1 text-xs"
            >
              <X className="w-3.5 h-3.5" />
              {isEs ? 'Quitar archivo' : 'Remove file'}
            </button>
          )}
        </div>

        {uploadError && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </ToolFieldGroup>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup
          label={isEs ? 'Ancho (px)' : 'Width (px)'}
          htmlFor="img-width"
          error={
            !isWidthValid
              ? isEs
                ? 'Introduce un ancho mayor que 0.'
                : 'Enter a width greater than 0.'
              : undefined
          }
        >
          <input
            id="img-width"
            type="number"
            min={1}
            value={widthInput}
            onChange={(e) => setWidthInput(e.target.value)}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Alto (px)' : 'Height (px)'}
          htmlFor="img-height"
          error={
            !isHeightValid
              ? isEs
                ? 'Introduce un alto mayor que 0.'
                : 'Enter a height greater than 0.'
              : undefined
          }
        >
          <input
            id="img-height"
            type="number"
            min={1}
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>
      </div>

      <ToolFieldGroup
        label={isEs ? 'Porcentaje de Escalado' : 'Target Scale Percentage'}
        htmlFor="img-scale"
        unit={`${scale}%`}
      >
        <input
          id="img-scale"
          type="range"
          min={10}
          max={200}
          step={5}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </ToolFieldGroup>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Resultados de Dimensión' : 'Image Analysis Results'}
      state={isValid ? 'ready' : widthInput === '' && heightInput === '' ? 'empty' : 'error'}
      emptyTitle={isEs ? 'Introduce dimensiones o carga una imagen' : 'Enter dimensions or load an image'}
      emptyDescription={
        isEs
          ? 'Calcula relación de aspecto, megapíxeles y tamaño escalado al instante.'
          : 'Inspect aspect ratio, megapixels, and scaled output instantly.'
      }
      errorTitle={isEs ? 'Dimensiones no válidas' : 'Invalid Dimensions'}
      errorMessage={
        isEs
          ? 'Tanto el ancho como el alto deben ser números positivos mayores que 0.'
          : 'Both width and height must be positive numbers greater than 0.'
      }
      primaryLabel={isEs ? 'Relación de Aspecto' : 'Aspect Ratio'}
      primaryValue={stats ? stats.aspectRatio : '—'}
      primaryUnit={stats ? `${stats.w} × ${stats.h} px` : undefined}
      primarySubtext={
        stats
          ? `${stats.megapixels} MP · ${stats.orientation} · ${isEs ? 'Decimal' : 'Decimal'} ${stats.decimalRatio}`
          : undefined
      }
      statusLabel={
        inspectedImage
          ? isEs
            ? 'Archivo inspeccionado'
            : 'File Inspected'
          : isEs
            ? 'Cálculo manual'
            : 'Manual Mode'
      }
      statusTone="accent"
      copyText={copySummary}
      copyLabel={isEs ? 'Copiar Resumen' : 'Copy Summary'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {stats && (
        <div className="space-y-4">
          {inspectedImage && (
            <div className="rounded-lg border border-border-main bg-surface-secondary p-3 flex flex-col sm:flex-row items-center gap-3.5">
              <div className="w-20 h-20 rounded-md border border-border-main bg-surface flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={inspectedImage.previewUrl}
                  alt={inspectedImage.fileName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p
                  data-testid="inspected-file-name"
                  className="text-xs font-semibold text-text-primary truncate"
                >
                  {inspectedImage.fileName}
                </p>
                <p className="text-xs font-mono text-text-secondary mt-0.5">
                  {inspectedImage.naturalWidth} × {inspectedImage.naturalHeight} px ·{' '}
                  {inspectedImage.mimeType}
                </p>
                <p className="text-[11px] font-mono text-text-tertiary mt-0.5">
                  {formatFileSize(inspectedImage.fileSizeBytes)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? `Escalado (${scale}%)` : `Scaled (${scale}%)`}
              value={`${stats.scaledW} × ${stats.scaledH}`}
              hint="px"
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Megapíxeles' : 'Megapixels'}
              value={`${stats.megapixels} MP`}
              hint={`${stats.totalPixels.toLocaleString()} px`}
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Resolución Original' : 'Original Resolution',
                value: `${stats.w} × ${stats.h} px`,
                highlight: true,
              },
              {
                label: isEs ? 'Relación de Aspecto' : 'Aspect Ratio',
                value: `${stats.aspectRatio} (${stats.decimalRatio})`,
              },
              {
                label: isEs ? 'Orientación' : 'Orientation',
                value: stats.orientation,
              },
              {
                label: isEs ? `Dimensiones al ${scale}%` : `Scaled at ${scale}%`,
                value: `${stats.scaledW} × ${stats.scaledH} px`,
                highlight: true,
              },
              ...(inspectedImage
                ? [
                    {
                      label: isEs ? 'Formato / Tamaño Archivo' : 'File Format / Size',
                      value: `${inspectedImage.mimeType} · ${formatFileSize(inspectedImage.fileSizeBytes)}`,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default ImageDimensionCalculator;
