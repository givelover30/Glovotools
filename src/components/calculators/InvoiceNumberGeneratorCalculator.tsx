import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolPresetBar,
} from '../calculator/ToolWorkspacePrimitives';
import { UiCheckbox } from '../ui/AppPrimitives';

type DateStampFormat = 'YYYYMM' | 'YYMM' | 'YYYY';

const DEFAULTS = {
  prefix: 'INV-',
  includeDate: true,
  dateFormat: 'YYYYMM' as DateStampFormat,
  startNum: '1001',
  count: '10',
};

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const InvoiceNumberGeneratorCalculator: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [prefix, setPrefix] = useState<string>(DEFAULTS.prefix);
  const [includeDate, setIncludeDate] = useState<boolean>(DEFAULTS.includeDate);
  const [dateFormat, setDateFormat] = useState<DateStampFormat>(DEFAULTS.dateFormat);
  const [startNumInput, setStartNumInput] = useState<string>(DEFAULTS.startNum);
  const [countInput, setCountInput] = useState<string>(DEFAULTS.count);

  const parsedStart = Number(startNumInput);
  const parsedCount = Number(countInput);
  const isStartValid =
    startNumInput.trim() !== '' && Number.isInteger(parsedStart) && parsedStart >= 0 && parsedStart <= 9999999;
  const isCountValid =
    countInput.trim() !== '' && Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 100;
  const isValid = isStartValid && isCountValid;

  const { invoices, dateStamp } = useMemo(() => {
    if (!isValid) return { invoices: [] as string[], dateStamp: '' };
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const yy = yyyy.slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    let stamp = '';
    if (includeDate) {
      if (dateFormat === 'YYYYMM') stamp = `${yyyy}${mm}-`;
      else if (dateFormat === 'YYMM') stamp = `${yy}${mm}-`;
      else stamp = `${yyyy}-`;
    }

    const list = Array.from({ length: parsedCount }, (_, i) => {
      const seq = String(parsedStart + i).padStart(4, '0');
      return `${prefix}${stamp}${seq}`;
    });

    return { invoices: list, dateStamp: stamp };
  }, [isValid, prefix, includeDate, dateFormat, parsedStart, parsedCount]);

  const listText = useMemo(() => invoices.join('\n'), [invoices]);

  const handleReset = () => {
    setPrefix(DEFAULTS.prefix);
    setIncludeDate(DEFAULTS.includeDate);
    setDateFormat(DEFAULTS.dateFormat);
    setStartNumInput(DEFAULTS.startNum);
    setCountInput(DEFAULTS.count);
  };

  const handleClear = () => {
    setPrefix('');
    setStartNumInput('1');
    setCountInput('1');
  };

  const presets = [
    {
      label: isEs ? 'Estándar INV-' : 'Standard INV-',
      onSelect: handleReset,
    },
    {
      label: isEs ? 'Factura Anual FAC-' : 'Annual FAC-',
      onSelect: () => {
        setPrefix('FAC-');
        setIncludeDate(true);
        setDateFormat('YYYY');
        setStartNumInput('0001');
        setCountInput('12');
      },
    },
    {
      label: isEs ? 'Orden de Compra PO-' : 'Purchase Order PO-',
      onSelect: () => {
        setPrefix('PO-');
        setIncludeDate(true);
        setDateFormat('YYMM');
        setStartNumInput('5000');
        setCountInput('20');
      },
    },
  ];

  const inputPanel = (
    <ToolInputPanel
      title={isEs ? 'Formato de Numeración' : 'Invoice Sequence Rules'}
      subtitle={
        isEs
          ? 'Crea series consecutivas con prefijo, fecha y relleno de 4 dígitos.'
          : 'Generate sequential invoice IDs with prefix, date stamp, and 4-digit zero padding.'
      }
      onReset={handleReset}
      onClear={handleClear}
      resetLabel={isEs ? 'Restablecer' : 'Reset'}
      clearLabel={isEs ? 'Limpiar' : 'Clear'}
    >
      <ToolPresetBar label={isEs ? 'Series rápidas' : 'Quick presets'} presets={presets} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup label={isEs ? 'Prefijo' : 'Prefix'} htmlFor="inv-prefix">
          <input
            id="inv-prefix"
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="INV-"
            maxLength={20}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Formato de Fecha' : 'Date Format'}
          htmlFor="inv-date-format"
        >
          <select
            id="inv-date-format"
            value={dateFormat}
            disabled={!includeDate}
            onChange={(e) => setDateFormat(e.target.value as DateStampFormat)}
            className="ui-select font-mono disabled:opacity-50"
          >
            <option value="YYYYMM">YYYYMM (e.g. 202605-)</option>
            <option value="YYMM">YYMM (e.g. 2605-)</option>
            <option value="YYYY">YYYY (e.g. 2026-)</option>
          </select>
        </ToolFieldGroup>
      </div>

      <UiCheckbox
        id="inv-include-date"
        checked={includeDate}
        onChange={(e) => setIncludeDate(e.target.checked)}
        label={isEs ? 'Incluir sello de fecha actual' : 'Include current date stamp'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToolFieldGroup
          label={isEs ? 'Número Inicial' : 'Starting Sequence'}
          htmlFor="inv-start"
          error={
            !isStartValid
              ? isEs
                ? 'Introduce un entero ≥ 0.'
                : 'Enter a non-negative integer.'
              : undefined
          }
        >
          <input
            id="inv-start"
            type="number"
            min={0}
            value={startNumInput}
            onChange={(e) => setStartNumInput(e.target.value)}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>

        <ToolFieldGroup
          label={isEs ? 'Cantidad (1–100)' : 'Batch Count (1–100)'}
          htmlFor="inv-count"
          error={
            !isCountValid
              ? isEs
                ? 'Introduce un entero entre 1 y 100.'
                : 'Enter an integer between 1 and 100.'
              : undefined
          }
        >
          <input
            id="inv-count"
            type="number"
            min={1}
            max={100}
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            className="ui-input font-mono"
          />
        </ToolFieldGroup>
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!isValid}
          onClick={() =>
            downloadBlob(listText + '\n', 'invoice-numbers.txt', 'text/plain;charset=utf-8')
          }
          className="ui-btn-primary inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isEs ? 'Descargar lista (.txt)' : 'Download List (.txt)'}
        </button>
      </div>
    </ToolInputPanel>
  );

  const resultsPanel = (
    <ToolResultsPanel
      title={isEs ? 'Serie de Facturas Generada' : 'Generated Invoice Sequence'}
      state={isValid ? 'ready' : 'error'}
      errorTitle={isEs ? 'Rango de secuencia no válido' : 'Invalid Sequence Parameters'}
      errorMessage={
        isEs
          ? 'Introduce un número inicial ≥ 0 y una cantidad entre 1 y 100.'
          : 'Provide a non-negative starting number and a batch count between 1 and 100.'
      }
      primaryLabel={isEs ? 'Primer Número' : 'First Invoice ID'}
      primaryValue={invoices[0] || '—'}
      primarySubtext={
        invoices.length > 0
          ? isEs
            ? `Hasta ${invoices[invoices.length - 1]} (${invoices.length} códigos consecutivos)`
            : `Through ${invoices[invoices.length - 1]} (${invoices.length} sequential IDs)`
          : undefined
      }
      statusLabel={isEs ? `${invoices.length} generados` : `${invoices.length} generated`}
      statusTone="accent"
      copyText={listText}
      copyLabel={isEs ? 'Copiar Todos' : 'Copy All'}
      copiedLabel={isEs ? 'Copiado' : 'Copied'}
    >
      {isValid && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ToolMetricTile
              label={isEs ? 'Último Código' : 'Last Invoice ID'}
              value={invoices[invoices.length - 1]}
              accent
            />
            <ToolMetricTile
              label={isEs ? 'Patrón' : 'Pattern'}
              value={`${prefix || ''}${dateStamp}####`}
            />
          </div>

          <pre className="p-3.5 rounded-lg border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[340px] leading-relaxed">
            {listText}
          </pre>
        </div>
      )}
    </ToolResultsPanel>
  );

  return <ToolSplitWorkspace inputs={inputPanel} results={resultsPanel} ratio="6-6" />;
};

export default InvoiceNumberGeneratorCalculator;
