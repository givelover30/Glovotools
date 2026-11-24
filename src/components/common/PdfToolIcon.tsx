import React from 'react';
import {
  PDF_ICON_PALETTES,
  PdfIconGlyph,
  PdfToolIconConfig
} from './pdfIconRegistry.ts';

interface PdfToolIconSvgProps {
  config: PdfToolIconConfig;
  className?: string;
}

const PDF_RED = '#DC2626';
const DOC_STROKE = '#94A3B8';
const DOC_FOLD_FILL = '#E2E8F0';

/**
 * Standard white PDF document silhouette with subtle folded top-right corner
 * and recognizable red PDF ribbon badge.
 */
function SingleDocBase() {
  return (
    <g>
      <path
        d="M6.5 3.5H20.5L25.5 8.5V26.5C25.5 27.6 24.6 28.5 23.5 28.5H8.5C7.4 28.5 6.5 27.6 6.5 26.5V5.5C6.5 4.4 7.4 3.5 8.5 3.5Z"
        fill="#FFFFFF"
        stroke={DOC_STROKE}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 3.5V7.5C20.5 8.05 20.95 8.5 21.5 8.5H25.5L20.5 3.5Z"
        fill={DOC_FOLD_FILL}
        stroke={DOC_STROKE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <rect x="4.5" y="7.5" width="14.5" height="6.2" rx="1.6" fill={PDF_RED} />
      <text
        x="11.75"
        y="12.15"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="4.9"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.35"
      >
        PDF
      </text>
    </g>
  );
}

/**
 * Compact dual-document silhouette for multi-PDF operations (Merge, Compare, Extractor+Merger).
 */
function MiniPdfDoc({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M0 1.6C0 0.72 0.72 0 1.6 0H9.8L13 3.2V14.4C13 15.28 12.28 16 11.4 16H1.6C0.72 16 0 15.28 0 14.4V1.6Z"
        fill="#FFFFFF"
        stroke={DOC_STROKE}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path
        d="M9.8 0V2.6C9.8 2.93 10.07 3.2 10.4 3.2H13L9.8 0Z"
        fill={DOC_FOLD_FILL}
        stroke={DOC_STROKE}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="-1" y="3.2" width="9.8" height="4.4" rx="1.1" fill={PDF_RED} />
      <text
        x="3.9"
        y="6.6"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="3.45"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.2"
      >
        PDF
      </text>
    </g>
  );
}

function renderGlyphContent(glyph: PdfIconGlyph, accent: string, accentLight: string) {
  switch (glyph) {
    /* ---------- MULTI-DOCUMENT & CONVERSION COMPOSITIONS ---------- */
    case 'merge':
      return (
        <g>
          <MiniPdfDoc x={3.5} y={3.5} />
          <MiniPdfDoc x={15.5} y={11.5} />
          <circle cx="15" cy="17.5" r="5.2" fill={accent} stroke="#FFFFFF" strokeWidth="1.3" />
          <path
            d="M12.5 16.2L15 18.7L17.5 16.2M15 14.5V18.6"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.7 20.1H17.3"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      );

    case 'extractor-merger':
      return (
        <g>
          <MiniPdfDoc x={3} y={4.5} />
          <MiniPdfDoc x={16} y={11.5} />
          <path
            d="M17.5 7.5H23.2M21.2 5.5L23.3 7.5L21.2 9.5"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 23.5H8.8M10.8 21.5L8.7 23.5L10.8 25.5"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'comparison':
      return (
        <g>
          <MiniPdfDoc x={3} y={5} />
          <MiniPdfDoc x={16} y={10.5} />
          <circle cx="16" cy="17" r="5.1" fill={accent} stroke="#FFFFFF" strokeWidth="1.3" />
          <path
            d="M13.4 15.6H18.4M16.9 14.1L18.5 15.6L16.9 17.1M18.6 18.6H13.6M15.1 17.1L13.5 18.6L15.1 20.1"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'images-to-pdf':
      return (
        <g>
          {/* Image card on top-left */}
          <rect
            x="2.8"
            y="4"
            width="12.4"
            height="11.2"
            rx="2"
            fill="#FFFFFF"
            stroke={accent}
            strokeWidth="1.35"
          />
          <circle cx="6.2" cy="7.4" r="1.3" fill="#F59E0B" />
          <path
            d="M4.2 13.6L7.4 10.2L9.7 12.4L11.6 10.7L13.8 13.6H4.2Z"
            fill={accent}
            fillOpacity="0.85"
          />
          {/* Arrow transitioning into PDF */}
          <path
            d="M16.8 9.6H21.2M19.5 7.9L21.3 9.6L19.5 11.3"
            fill="none"
            stroke={accent}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* PDF document bottom-right */}
          <MiniPdfDoc x={16} y={12.5} />
        </g>
      );

    case 'pdf-to-images':
      return (
        <g>
          {/* PDF document top-left */}
          <MiniPdfDoc x={3} y={3.5} />
          {/* Arrow transitioning into Image */}
          <path
            d="M17.2 8.5H21.6M19.9 6.8L21.7 8.5L19.9 10.2"
            fill="none"
            stroke={accent}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Image card bottom-right */}
          <rect
            x="16.2"
            y="14.5"
            width="13"
            height="12"
            rx="2.1"
            fill="#FFFFFF"
            stroke={accent}
            strokeWidth="1.4"
          />
          <circle cx="19.8" cy="18.1" r="1.35" fill="#F59E0B" />
          <path
            d="M17.8 24.7L21.1 21.1L23.5 23.4L25.4 21.5L27.7 24.7H17.8Z"
            fill={accent}
            fillOpacity="0.9"
          />
        </g>
      );

    case 'extract-images':
      return (
        <g>
          <SingleDocBase />
          <rect
            x="9.5"
            y="15.8"
            width="11.2"
            height="9.4"
            rx="1.6"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.35"
          />
          <circle cx="12.4" cy="18.6" r="1.15" fill={accent} />
          <path
            d="M10.9 23.8L13.5 21.1L15.4 22.8L17.1 21.2L19.4 23.8H10.9Z"
            fill={accent}
          />
          <circle cx="23.5" cy="23.2" r="4.3" fill={accent} stroke="#FFFFFF" strokeWidth="1.2" />
          <path
            d="M23.5 25.1V21.3M21.9 22.8L23.5 21.2L25.1 22.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    /* ---------- SINGLE-DOCUMENT FUNCTION-SPECIFIC SYMBOLS ---------- */
    case 'split':
      return (
        <g>
          <SingleDocBase />
          <line
            x1="8.5"
            y1="20.6"
            x2="23.5"
            y2="20.6"
            stroke={accent}
            strokeWidth="1.3"
            strokeDasharray="2 1.8"
            strokeLinecap="round"
          />
          <circle cx="12.2" cy="17.8" r="1.9" fill="#FFFFFF" stroke={accent} strokeWidth="1.5" />
          <circle cx="12.2" cy="23.4" r="1.9" fill="#FFFFFF" stroke={accent} strokeWidth="1.5" />
          <path
            d="M13.9 18.8L20.8 23.1M13.9 22.4L20.8 18.1"
            fill="none"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </g>
      );

    case 'split-count':
      return (
        <g>
          <SingleDocBase />
          <line
            x1="8.8"
            y1="20.5"
            x2="23.2"
            y2="20.5"
            stroke={accent}
            strokeWidth="1.3"
            strokeDasharray="2 1.6"
            strokeLinecap="round"
          />
          <circle cx="11.8" cy="17.8" r="1.7" fill="#FFFFFF" stroke={accent} strokeWidth="1.45" />
          <circle cx="11.8" cy="23.2" r="1.7" fill="#FFFFFF" stroke={accent} strokeWidth="1.45" />
          <path
            d="M13.3 18.7L19.2 22.5M13.3 22.3L19.2 18.5"
            fill="none"
            stroke={accent}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          <text
            x="22.1"
            y="18.9"
            textAnchor="middle"
            fill={accent}
            fontSize="4.6"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            #
          </text>
        </g>
      );

    case 'extract-pages':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M16 15.6V23.2M12.8 20.2L16 23.4L19.2 20.2"
            fill="none"
            stroke={accent}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.2 25.4H20.8"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      );

    case 'delete-pages':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M11.6 17.6H20.4M14 17.6V16.2C14 15.8 14.3 15.5 14.7 15.5H17.3C17.7 15.5 18 15.8 18 16.2V17.6"
            fill="none"
            stroke={accent}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.6 17.6L13.3 24.7C13.35 25.3 13.85 25.7 14.45 25.7H17.55C18.15 25.7 18.65 25.3 18.7 24.7L19.4 17.6"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M14.9 19.8V23.4M17.1 19.8V23.4"
            stroke={accent}
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </g>
      );

    case 'rotate-pages':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M20.4 19.8A4.6 4.6 0 0 0 12.1 18.1"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M19.2 17.1L20.7 19.9L17.7 20.1"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.6 21.8A4.6 4.6 0 0 0 19.9 23.5"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M12.8 24.5L11.3 21.7L14.3 21.5"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'reorder-pages':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M11.8 16.5V24.6M9.8 18.5L11.8 16.4L13.8 18.5M9.8 22.6L11.8 24.7L13.8 22.6"
            fill="none"
            stroke={accent}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.2 17.4H22.2M16.2 20.6H22.2M16.2 23.8H20.6"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </g>
      );

    case 'page-counter':
      return (
        <g>
          <SingleDocBase />
          <rect
            x="11"
            y="15.3"
            width="10"
            height="10.8"
            rx="1.6"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.45"
          />
          <rect x="12.7" y="16.9" width="6.6" height="2.2" rx="0.6" fill={accent} />
          <circle cx="13.5" cy="21.2" r="0.85" fill={accent} />
          <circle cx="16" cy="21.2" r="0.85" fill={accent} />
          <circle cx="18.5" cy="21.2" r="0.85" fill={accent} />
          <circle cx="13.5" cy="23.8" r="0.85" fill={accent} />
          <circle cx="16" cy="23.8" r="0.85" fill={accent} />
          <circle cx="18.5" cy="23.8" r="0.85" fill={accent} />
        </g>
      );

    case 'watermark':
      return (
        <g>
          <SingleDocBase />
          {/* Stamp handle & base */}
          <path
            d="M14.3 18.2C14.3 16.7 15 15.7 16 15.7C17 15.7 17.7 16.7 17.7 18.2C17.7 19.3 17.1 20 17.1 21H14.9C14.9 20 14.3 19.3 14.3 18.2Z"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <rect
            x="10.8"
            y="21"
            width="10.4"
            height="2.7"
            rx="1.1"
            fill={accent}
          />
          <path
            d="M10.2 25.3H21.8"
            stroke={accent}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </g>
      );

    case 'page-numbers':
      return (
        <g>
          <SingleDocBase />
          <text x="10.8" y="18.8" fill={accent} fontSize="4.2" fontWeight="800" fontFamily="system-ui, sans-serif">1</text>
          <text x="10.8" y="22.4" fill={accent} fontSize="4.2" fontWeight="800" fontFamily="system-ui, sans-serif">2</text>
          <text x="10.8" y="26.0" fill={accent} fontSize="4.2" fontWeight="800" fontFamily="system-ui, sans-serif">3</text>
          <path
            d="M14.6 17.4H22.2M14.6 21.0H22.2M14.6 24.6H20.2"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      );

    case 'add-text':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M11.6 24.8L12.6 21.4L18.4 15.6C19 15 20 15 20.6 15.6L21.3 16.3C21.9 16.9 21.9 17.9 21.3 18.5L15.5 24.3L11.6 24.8Z"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M17.4 16.7L20.2 19.5"
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      );

    case 'metadata-editor':
      return (
        <g>
          <SingleDocBase />
          {/* Gear / settings edit symbol */}
          <circle cx="16" cy="20.8" r="2.3" fill={accentLight} stroke={accent} strokeWidth="1.6" />
          <path
            d="M16 16.2V17.6M16 24V25.4M11.4 20.8H12.8M19.2 20.8H20.6M12.7 17.5L13.7 18.5M18.3 23.1L19.3 24.1M19.3 17.5L18.3 18.5M13.7 23.1L12.7 24.1"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </g>
      );

    case 'page-resizer':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M11.2 24.8L20.8 16.2M16.8 16.2H20.8V20.2M15.2 24.8H11.2V20.8"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'crop-pages':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M13 15.6V23.2H21.2M10.8 17.8H18.8V25.4"
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'compress':
      return (
        <g>
          <SingleDocBase />
          {/* Compression gauge dial */}
          <path
            d="M10.8 23.6A5.4 5.4 0 1 1 21.2 23.6"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M16 22.8L19.1 19.3"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="16" cy="23.2" r="1.4" fill={accent} />
        </g>
      );

    case 'pdf-to-text':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M10.5 17.1H16.5M13.5 17.1V24.6"
            fill="none"
            stroke={accent}
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path
            d="M17.8 19.2H22.2M17.8 21.8H22.2M17.8 24.4H20.9"
            stroke={accent}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </g>
      );

    case 'protect-password':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M13.5 19.6V17.9A2.5 2.5 0 0 1 18.5 17.9V19.6"
            fill="none"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <rect
            x="11.6"
            y="19.6"
            width="8.8"
            height="6.2"
            rx="1.5"
            fill={accent}
          />
          <circle cx="16" cy="22.4" r="1" fill="#FFFFFF" />
          <path d="M16 23.2V24.3" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );

    case 'remove-password':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M13.5 19.6V17.8A2.5 2.5 0 0 1 18.2 16.6"
            fill="none"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <rect
            x="11.6"
            y="19.6"
            width="8.8"
            height="6.2"
            rx="1.5"
            fill={accent}
          />
          <circle cx="16" cy="22.4" r="1" fill="#FFFFFF" />
          <path d="M16 23.2V24.3" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );

    case 'metadata-viewer':
      return (
        <g>
          <SingleDocBase />
          <circle cx="16" cy="20.8" r="5" fill={accent} />
          <circle cx="16" cy="18.4" r="0.9" fill="#FFFFFF" />
          <path
            d="M16 20.4V23.7"
            stroke="#FFFFFF"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </g>
      );

    case 'ocr':
      return (
        <g>
          <SingleDocBase />
          {/* Scanner corners */}
          <path
            d="M10.5 18.4V16.4H12.7M19.3 16.4H21.5V18.4M10.5 23.2V25.2H12.7M19.3 25.2H21.5V23.2"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="10.2"
            y1="20.8"
            x2="21.8"
            y2="20.8"
            stroke={accent}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <text
            x="16"
            y="19.9"
            textAnchor="middle"
            fill={accent}
            fontSize="3.4"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            OCR
          </text>
        </g>
      );

    case 'repair':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M19.7 16.2A2.9 2.9 0 0 0 16.2 19.6L12.1 23.7A1.2 1.2 0 1 0 13.8 25.4L17.9 21.3A2.9 2.9 0 0 0 21.3 17.8L19.6 19.5L18 17.9L19.7 16.2Z"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'numbering-watermark':
      return (
        <g>
          <SingleDocBase />
          <text x="10.3" y="19.0" fill={accent} fontSize="4.1" fontWeight="800" fontFamily="system-ui, sans-serif">1</text>
          <text x="10.3" y="23.2" fill={accent} fontSize="4.1" fontWeight="800" fontFamily="system-ui, sans-serif">2</text>
          <path
            d="M13.6 17.7H19.4M13.6 21.9H17.4"
            stroke={accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Small stamp emblem bottom-right */}
          <circle cx="20.6" cy="23.3" r="3.2" fill={accent} stroke="#FFFFFF" strokeWidth="1" />
          <path
            d="M19.3 24.3H21.9M20.6 22V23.8"
            stroke="#FFFFFF"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </g>
      );

    case 'selection-scissors':
      return (
        <g>
          <SingleDocBase />
          <rect
            x="10"
            y="16.2"
            width="12"
            height="8.6"
            rx="1.2"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.25"
            strokeDasharray="2.2 1.5"
          />
          <circle cx="13.2" cy="18.9" r="1.4" fill="#FFFFFF" stroke={accent} strokeWidth="1.3" />
          <circle cx="13.2" cy="22.5" r="1.4" fill="#FFFFFF" stroke={accent} strokeWidth="1.3" />
          <path
            d="M14.5 19.6L19.6 22.3M14.5 21.8L19.6 19.1"
            stroke={accent}
            strokeWidth="1.45"
            strokeLinecap="round"
          />
        </g>
      );

    case 'stacked-layers':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M16 15.8L21.6 18.6L16 21.4L10.4 18.6L16 15.8Z"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
          <path
            d="M10.4 21.4L16 24.2L21.6 21.4"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.4 23.8L16 26.5L21.6 23.8"
            fill="none"
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    case 'blank-detector':
      return (
        <g>
          <SingleDocBase />
          <path
            d="M10.2 21C11.6 18.4 13.6 17.2 16 17.2C18.4 17.2 20.4 18.4 21.8 21C20.4 23.6 18.4 24.8 16 24.8C13.6 24.8 11.6 23.6 10.2 21Z"
            fill={accentLight}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="21" r="2.1" fill={accent} />
          <circle cx="16.6" cy="20.4" r="0.6" fill="#FFFFFF" />
        </g>
      );

    case 'size-analyzer':
      return (
        <g>
          <SingleDocBase />
          <rect x="11.1" y="21.4" width="2.4" height="4.1" rx="0.6" fill={accent} fillOpacity="0.65" />
          <rect x="14.8" y="18.6" width="2.4" height="6.9" rx="0.6" fill={accent} fillOpacity="0.85" />
          <rect x="18.5" y="16.2" width="2.4" height="9.3" rx="0.6" fill={accent} />
        </g>
      );

    case 'generic-pdf':
    default:
      return (
        <g>
          <SingleDocBase />
          <path
            d="M10.8 18H21.2M10.8 21.2H21.2M10.8 24.4H17.6"
            stroke={accent}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

export default function PdfToolIcon({ config, className = 'w-7 h-7' }: PdfToolIconSvgProps) {
  const palette = PDF_ICON_PALETTES[config.palette];
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-pdf-icon-glyph={config.glyph}
      data-pdf-icon-palette={config.palette}
      className={`shrink-0 ${className}`}
    >
      {renderGlyphContent(config.glyph, palette.accent, palette.accentLight)}
    </svg>
  );
}
