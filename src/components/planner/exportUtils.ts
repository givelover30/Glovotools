export type CsvCellValue = string | number | boolean | null | undefined;

/**
 * Escapes a single CSV cell per RFC 4180 while mitigating spreadsheet formula injection
 * on untrusted text values without altering valid negative numeric values.
 */
export function escapeCsvCell(value: CsvCellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  let text = String(value);
  // Neutralize formula prefixes for non-numeric text cells
  if (/^[=+\t\r@]/.test(text) || (/^-/.test(text) && !/^-\d+(\.\d+)?$/.test(text))) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsvContent(headers: string[], rows: CsvCellValue[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...dataLines].join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function downloadJsonFile(filename: string, payload: unknown): void {
  downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8;');
}

export function downloadCsvFile(filename: string, headers: string[], rows: CsvCellValue[][]): void {
  const csv = buildCsvContent(headers, rows);
  downloadTextFile(filename, `\uFEFF${csv}`, 'text/csv;charset=utf-8;');
}
