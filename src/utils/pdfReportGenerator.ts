export {
  DownloadPdfService,
  type DownloadPdfResult,
  type PdfReportBreakdownItem,
  type PdfReportChartItem,
  type PdfReportInputRow,
  type PdfReportMetricCard,
  type PdfReportNote,
  type PdfReportPrimaryCard,
  type PdfReportTable,
  type PrintableReportData
} from '../services/DownloadPdfService.ts';

import {
  DownloadPdfService,
  type DownloadPdfResult,
  type PrintableReportData
} from '../services/DownloadPdfService.ts';

export function buildPdfFileName(calculatorName: string, date?: Date): string {
  return DownloadPdfService.buildFileName(calculatorName, date);
}

export function generatePrintableReportPdf(data: PrintableReportData): Promise<Uint8Array> {
  return DownloadPdfService.generatePdfBytes(data);
}

export function downloadPrintablePdf(data: PrintableReportData): Promise<DownloadPdfResult> {
  return DownloadPdfService.downloadReport(data);
}
