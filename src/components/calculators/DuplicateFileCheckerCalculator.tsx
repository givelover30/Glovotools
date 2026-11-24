import React, { useMemo, useState } from 'react';
import { FileUp, Files } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSegmentedControl,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type CheckMode = 'list' | 'files';

interface HashedFileEntry {
  name: string;
  size: number;
  sha256: string;
}

const DEFAULT_LIST = `report.pdf (2.4 MB)
image_01.png (1.1 MB)
report.pdf (2.4 MB)
backup_2025.zip (45 MB)
image_01.png (1.1 MB)`;

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function DuplicateFileCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [mode, setMode] = useState<CheckMode>('list');
  const [text, setText] = useState<string>(DEFAULT_LIST);
  const [hashedFiles, setHashedFiles] = useState<HashedFileEntry[]>([]);
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const listAnalysis = useMemo(() => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return { state: 'empty' as const };
    }

    const counts: Record<string, number> = {};
    lines.forEach((line) => {
      counts[line] = (counts[line] || 0) + 1;
    });

    const duplicates = Object.entries(counts)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    const uniqueCount = Object.keys(counts).length;
    const extraCopies = lines.length - uniqueCount;

    return {
      state: 'ready' as const,
      total: lines.length,
      unique: uniqueCount,
      duplicateGroups: duplicates,
      extraCopies
    };
  }, [text]);

  const fileAnalysis = useMemo(() => {
    if (hashedFiles.length === 0) {
      return { state: 'empty' as const };
    }

    const groups: Record<string, HashedFileEntry[]> = {};
    hashedFiles.forEach((entry) => {
      if (!groups[entry.sha256]) groups[entry.sha256] = [];
      groups[entry.sha256].push(entry);
    });

    const duplicateGroups = Object.entries(groups).filter(([, files]) => files.length > 1);
    const uniqueCount = Object.keys(groups).length;
    const extraCopies = hashedFiles.length - uniqueCount;

    return {
      state: 'ready' as const,
      total: hashedFiles.length,
      unique: uniqueCount,
      duplicateGroups,
      extraCopies
    };
  }, [hashedFiles]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setIsHashing(true);
    try {
      const results: HashedFileEntry[] = [];
      for (const file of Array.from(fileList)) {
        const buffer = await file.arrayBuffer();
        const sha256 = await sha256Hex(buffer);
        results.push({ name: file.name, size: file.size, sha256 });
      }
      setHashedFiles(results);
      setMode('files');
    } finally {
      setIsHashing(false);
      e.target.value = '';
    }
  };

  const handleClear = () => {
    if (mode === 'list') {
      setText('');
    } else {
      setHashedFiles([]);
    }
  };

  const handleReset = () => {
    setMode('list');
    setText(DEFAULT_LIST);
    setHashedFiles([]);
  };

  const activeState = mode === 'list' ? listAnalysis.state : fileAnalysis.state;

  const copySummary = useMemo(() => {
    if (mode === 'list' && listAnalysis.state === 'ready') {
      return `Total Entries: ${listAnalysis.total} | Unique: ${listAnalysis.unique} | Duplicate Groups: ${listAnalysis.duplicateGroups.length} | Extra Copies: ${listAnalysis.extraCopies}`;
    }
    if (mode === 'files' && fileAnalysis.state === 'ready') {
      return `Files Hashed (SHA-256): ${fileAnalysis.total} | Unique Contents: ${fileAnalysis.unique} | Duplicate Content Groups: ${fileAnalysis.duplicateGroups.length}`;
    }
    return undefined;
  }, [mode, listAnalysis, fileAnalysis]);

  const duplicateGroupCount =
    mode === 'list'
      ? listAnalysis.state === 'ready'
        ? listAnalysis.duplicateGroups.length
        : 0
      : fileAnalysis.state === 'ready'
        ? fileAnalysis.duplicateGroups.length
        : 0;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Detector de Archivos Duplicados' : 'Duplicate File Checker'}
          subtitle={
            isEs
              ? 'Compara listas de archivos/hashes o calcula huellas SHA-256 locales sobre archivos reales.'
              : 'Find duplicate file entries or hash multiple local files with SHA-256 directly in your browser.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolSegmentedControl
            ariaLabel={isEs ? 'Modo de verificación de duplicados' : 'Duplicate check mode'}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'list', label: isEs ? 'Lista / Nombres / Hashes' : 'List / Names / Hashes' },
              { value: 'files', label: isEs ? 'Archivos Locales (SHA-256)' : 'Local Files (SHA-256)' }
            ]}
          />

          {mode === 'list' ? (
            <>
              <ToolFieldGroup
                label={isEs ? 'Lista de archivos o hashes (uno por línea)' : 'File Names or Hashes (One per Line)'}
                htmlFor="duplicate-list-input"
                unit={isEs ? 'Línea por línea' : 'Line-by-Line'}
              >
                <textarea
                  id="duplicate-list-input"
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  placeholder={
                    isEs
                      ? 'Pega nombres de archivos o sumas de verificación...'
                      : 'Paste file names, paths, or checksums...'
                  }
                  className="ui-input font-mono text-xs leading-relaxed resize-y"
                />
              </ToolFieldGroup>

              <ToolPresetBar
                label={isEs ? 'Ejemplos:' : 'Examples:'}
                presets={[
                  {
                    label: isEs ? 'Con duplicados' : 'With Duplicates',
                    onSelect: () => setText(DEFAULT_LIST)
                  },
                  {
                    label: isEs ? 'Todos únicos' : 'All Unique',
                    onSelect: () =>
                      setText('alpha.csv\nbeta.json\ngamma.pdf\ndelta.png')
                  }
                ]}
              />
            </>
          ) : (
            <div className="space-y-3">
              <ToolFieldGroup
                label={isEs ? 'Seleccionar múltiples archivos locales' : 'Select Multiple Local Files'}
                htmlFor="duplicate-file-picker"
                unit="SHA-256"
                hint={
                  isEs
                    ? 'Los archivos nunca se suben a un servidor; el hash SHA-256 se calcula en memoria.'
                    : 'Files never leave your device; SHA-256 content hashes are computed locally via Web Crypto.'
                }
              >
                <label
                  htmlFor="duplicate-file-picker"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-surface-secondary/60 hover:bg-surface-hover p-6 text-center cursor-pointer transition-colors"
                >
                  <FileUp className="w-6 h-6 text-accent" />
                  <span className="text-xs font-semibold text-text-primary">
                    {isHashing
                      ? isEs
                        ? 'Calculando hashes SHA-256...'
                        : 'Computing SHA-256 hashes...'
                      : isEs
                        ? 'Haz clic para elegir 2 o más archivos'
                        : 'Click to select 2 or more files to compare'}
                  </span>
                </label>
                <input
                  id="duplicate-file-picker"
                  type="file"
                  multiple
                  onChange={handleFilesSelected}
                  className="sr-only"
                />
              </ToolFieldGroup>

              {hashedFiles.length > 0 && (
                <div className="rounded-xl border border-border-subtle bg-surface-secondary/50 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                  {hashedFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between gap-2 text-xs font-mono"
                    >
                      <span className="truncate text-text-primary font-medium">{f.name}</span>
                      <span className="text-text-tertiary shrink-0">
                        {f.sha256.slice(0, 12)}…
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Reporte de duplicados' : 'Duplicate Analysis'}
          state={activeState}
          primaryLabel={isEs ? 'Grupos duplicados' : 'Duplicate Groups'}
          primaryValue={
            activeState === 'ready'
              ? duplicateGroupCount === 0
                ? isEs
                  ? 'Sin Duplicados'
                  : 'No Duplicates'
                : `${duplicateGroupCount} ${isEs ? 'Duplicado(s)' : 'Duplicate Group(s)'}`
              : undefined
          }
          primarySubtext={
            activeState === 'ready'
              ? duplicateGroupCount === 0
                ? isEs
                  ? 'Todos los elementos analizados son únicos.'
                  : 'Every inspected item has a unique entry or content hash.'
                : isEs
                  ? 'Se detectaron entradas o contenidos repetidos.'
                  : 'Identical entries or matching SHA-256 file contents detected.'
              : undefined
          }
          statusLabel={
            activeState === 'ready'
              ? duplicateGroupCount === 0
                ? isEs
                  ? 'Únicos'
                  : 'Unique'
                : isEs
                  ? 'Duplicados'
                  : 'Duplicates Found'
              : undefined
          }
          statusTone={duplicateGroupCount === 0 ? 'success' : 'warning'}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={
            mode === 'list'
              ? isEs
                ? 'Ingresa una lista para analizar'
                : 'Enter a list to inspect'
              : isEs
                ? 'Selecciona archivos para comparar'
                : 'Select files to compare'
          }
          emptyDescription={
            mode === 'list'
              ? isEs
                ? 'Pega nombres de archivo o sumas de verificación a la izquierda.'
                : 'Paste filenames, paths, or hashes on the left to detect duplicates.'
              : isEs
                ? 'Elige 2 o más archivos locales para comparar sus huellas SHA-256.'
                : 'Choose 2 or more local files to compare their exact SHA-256 content hashes.'
          }
        >
          {mode === 'list' && listAnalysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Total de entradas' : 'Total Entries'}
                  value={String(listAnalysis.total)}
                />
                <ToolMetricTile
                  label={isEs ? 'Entradas únicas' : 'Unique Entries'}
                  value={String(listAnalysis.unique)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Copias extra' : 'Extra Copies'}
                  value={String(listAnalysis.extraCopies)}
                />
              </div>

              {listAnalysis.duplicateGroups.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                    <Files className="w-3.5 h-3.5 text-status-warning" />
                    <span>{isEs ? 'Elementos repetidos' : 'Repeated Items'}</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {listAnalysis.duplicateGroups.map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between gap-3 rounded-xl border border-status-warning/30 bg-status-warning-bg px-3 py-2 text-xs"
                      >
                        <span className="font-mono text-text-primary break-words [overflow-wrap:anywhere]">
                          {name}
                        </span>
                        <span className="font-mono font-bold text-status-warning shrink-0">
                          {count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'files' && fileAnalysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Archivos analizados' : 'Files Inspected'}
                  value={String(fileAnalysis.total)}
                />
                <ToolMetricTile
                  label={isEs ? 'Contenidos únicos' : 'Unique Contents'}
                  value={String(fileAnalysis.unique)}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Duplicados exactos' : 'Duplicate Copies'}
                  value={String(fileAnalysis.extraCopies)}
                />
              </div>

              {fileAnalysis.duplicateGroups.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-text-secondary">
                    {isEs ? 'Coincidencias SHA-256 idénticas' : 'Identical SHA-256 Matches'}
                  </div>
                  {fileAnalysis.duplicateGroups.map(([hash, files]) => (
                    <div
                      key={hash}
                      className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-3 space-y-1.5 text-xs"
                    >
                      <div className="font-mono text-[11px] text-status-warning break-all">
                        SHA-256: {hash}
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-text-primary font-mono">
                        {files.map((f, i) => (
                          <li key={i}>
                            {f.name} ({f.size} B)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
