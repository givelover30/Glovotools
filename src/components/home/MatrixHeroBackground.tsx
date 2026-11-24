import React, { useEffect, useState } from 'react';

type IconKind =
  | 'calc-sci'
  | 'calc-fin'
  | 'calc-basic'
  | 'calc-pct'
  | 'doc-pdf'
  | 'doc-word'
  | 'doc-excel'
  | 'doc-ppt'
  | 'doc-sheet'
  | 'table-grid'
  | 'chart-bar'
  | 'chart-pie'
  | 'chart-line'
  | 'folder'
  | 'calendar'
  | 'clock'
  | 'ruler'
  | 'scale'
  | 'geometry'
  | 'math-sqrt'
  | 'sync-convert';

interface RainIconConfig {
  id: string;
  kind: IconKind;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotate: number;
  driftX: number;
  glowColor: string;
  visibility: 'all' | 'md' | 'lg';
}

interface RainSymbolConfig {
  id: string;
  text: string;
  left: string;
  color: string;
  fontSize: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  visibility: 'all' | 'md' | 'lg';
}

interface RainTrailConfig {
  id: string;
  left: string;
  height: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
  visibility: 'all' | 'md' | 'lg';
}

interface ParticleConfig {
  id: string;
  left: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
  visibility: 'all' | 'md' | 'lg';
}

// Primary colorful falling icons calibrated for Midnight Navy (#101B35 / #172B50):
// - Prominent flank icons: 45–68% opacity with controlled neon glow
// - Subtle depth icons near inner shoulders / center: 22–34% opacity so rain feels continuous across the hero
const RAIN_ICONS: RainIconConfig[] = [
  // LEFT FLANK (1%–24%)
  {
    id: 'li-1',
    kind: 'doc-pdf',
    left: '1.8%',
    size: 42,
    duration: 12.4,
    delay: -2.1,
    opacity: 0.68,
    rotate: -7,
    driftX: 6,
    glowColor: 'rgba(239, 68, 68, 0.55)',
    visibility: 'all'
  },
  {
    id: 'li-2',
    kind: 'calc-sci',
    left: '4.5%',
    size: 44,
    duration: 14.1,
    delay: -8.6,
    opacity: 0.64,
    rotate: 6,
    driftX: -5,
    glowColor: 'rgba(59, 130, 246, 0.55)',
    visibility: 'all'
  },
  {
    id: 'li-3',
    kind: 'doc-excel',
    left: '12.5%',
    size: 40,
    duration: 11.5,
    delay: -5.3,
    opacity: 0.62,
    rotate: -5,
    driftX: 10,
    glowColor: 'rgba(22, 163, 74, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'li-4',
    kind: 'chart-pie',
    left: '7%',
    size: 36,
    duration: 15.8,
    delay: -11.2,
    opacity: 0.54,
    rotate: 9,
    driftX: 7,
    glowColor: 'rgba(139, 92, 246, 0.50)',
    visibility: 'md'
  },
  {
    id: 'li-5',
    kind: 'doc-word',
    left: '18.2%',
    size: 38,
    duration: 13.6,
    delay: -3.9,
    opacity: 0.58,
    rotate: 5,
    driftX: -9,
    glowColor: 'rgba(37, 99, 235, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'li-6',
    kind: 'calc-fin',
    left: '9.8%',
    size: 36,
    duration: 16.4,
    delay: -13.1,
    opacity: 0.56,
    rotate: -8,
    driftX: 8,
    glowColor: 'rgba(16, 185, 129, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'li-7',
    kind: 'ruler',
    left: '21.5%',
    size: 34,
    duration: 12.1,
    delay: -9.4,
    opacity: 0.48,
    rotate: -14,
    driftX: 6,
    glowColor: 'rgba(250, 204, 21, 0.45)',
    visibility: 'lg'
  },
  {
    id: 'li-8',
    kind: 'calendar',
    left: '2.5%',
    size: 34,
    duration: 14.9,
    delay: -6.8,
    opacity: 0.52,
    rotate: 4,
    driftX: 6,
    glowColor: 'rgba(139, 92, 246, 0.48)',
    visibility: 'md'
  },
  {
    id: 'li-9',
    kind: 'doc-ppt',
    left: '15.2%',
    size: 38,
    duration: 13.2,
    delay: -10.5,
    opacity: 0.58,
    rotate: -4,
    driftX: -7,
    glowColor: 'rgba(249, 115, 22, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'li-10',
    kind: 'math-sqrt',
    left: '1.2%',
    size: 32,
    duration: 11.8,
    delay: -4.2,
    opacity: 0.54,
    rotate: 7,
    driftX: 5,
    glowColor: 'rgba(168, 85, 247, 0.50)',
    visibility: 'all'
  },
  {
    id: 'li-11',
    kind: 'geometry',
    left: '24%',
    size: 30,
    duration: 15.1,
    delay: -1.7,
    opacity: 0.45,
    rotate: 10,
    driftX: -7,
    glowColor: 'rgba(6, 182, 212, 0.45)',
    visibility: 'lg'
  },
  {
    id: 'li-12',
    kind: 'table-grid',
    left: '11.5%',
    size: 35,
    duration: 14.0,
    delay: -0.9,
    opacity: 0.50,
    rotate: -6,
    driftX: 6,
    glowColor: 'rgba(16, 185, 129, 0.45)',
    visibility: 'lg'
  },
  {
    id: 'li-13',
    kind: 'sync-convert',
    left: '6%',
    size: 32,
    duration: 12.7,
    delay: -7.5,
    opacity: 0.50,
    rotate: -5,
    driftX: 6,
    glowColor: 'rgba(6, 182, 212, 0.48)',
    visibility: 'md'
  },

  // SUBTLE CENTER-BAND DEPTH ICONS (keeps animation alive across the center at gentle opacity)
  {
    id: 'ci-1',
    kind: 'calc-pct',
    left: '32%',
    size: 26,
    duration: 15.4,
    delay: -4.1,
    opacity: 0.24,
    rotate: -6,
    driftX: 5,
    glowColor: 'rgba(6, 182, 212, 0.35)',
    visibility: 'lg'
  },
  {
    id: 'ci-2',
    kind: 'doc-sheet',
    left: '44%',
    size: 24,
    duration: 16.8,
    delay: -11.4,
    opacity: 0.20,
    rotate: 5,
    driftX: -4,
    glowColor: 'rgba(59, 130, 246, 0.32)',
    visibility: 'lg'
  },
  {
    id: 'ci-3',
    kind: 'geometry',
    left: '58%',
    size: 25,
    duration: 14.9,
    delay: -7.6,
    opacity: 0.21,
    rotate: -8,
    driftX: 6,
    glowColor: 'rgba(139, 92, 246, 0.32)',
    visibility: 'lg'
  },
  {
    id: 'ci-4',
    kind: 'chart-line',
    left: '67.5%',
    size: 26,
    duration: 15.9,
    delay: -2.4,
    opacity: 0.25,
    rotate: 4,
    driftX: -5,
    glowColor: 'rgba(16, 185, 129, 0.35)',
    visibility: 'lg'
  },

  // RIGHT FLANK (74%–96%)
  {
    id: 'ri-1',
    kind: 'doc-excel',
    left: '92.5%',
    size: 42,
    duration: 12.9,
    delay: -3.4,
    opacity: 0.68,
    rotate: 6,
    driftX: -6,
    glowColor: 'rgba(22, 163, 74, 0.55)',
    visibility: 'all'
  },
  {
    id: 'ri-2',
    kind: 'doc-word',
    left: '89.5%',
    size: 40,
    duration: 14.5,
    delay: -9.8,
    opacity: 0.64,
    rotate: -6,
    driftX: 5,
    glowColor: 'rgba(37, 99, 235, 0.55)',
    visibility: 'all'
  },
  {
    id: 'ri-3',
    kind: 'chart-bar',
    left: '82%',
    size: 38,
    duration: 11.7,
    delay: -5.9,
    opacity: 0.58,
    rotate: 5,
    driftX: -9,
    glowColor: 'rgba(59, 130, 246, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'ri-4',
    kind: 'doc-ppt',
    left: '76.5%',
    size: 36,
    duration: 15.3,
    delay: -12.1,
    opacity: 0.54,
    rotate: -8,
    driftX: 7,
    glowColor: 'rgba(249, 115, 22, 0.50)',
    visibility: 'lg'
  },
  {
    id: 'ri-5',
    kind: 'calc-basic',
    left: '88%',
    size: 38,
    duration: 13.8,
    delay: -1.4,
    opacity: 0.60,
    rotate: -5,
    driftX: -6,
    glowColor: 'rgba(139, 92, 246, 0.52)',
    visibility: 'md'
  },
  {
    id: 'ri-6',
    kind: 'doc-pdf',
    left: '79%',
    size: 40,
    duration: 16.0,
    delay: -8.2,
    opacity: 0.60,
    rotate: 7,
    driftX: 9,
    glowColor: 'rgba(239, 68, 68, 0.52)',
    visibility: 'lg'
  },
  {
    id: 'ri-7',
    kind: 'clock',
    left: '91%',
    size: 34,
    duration: 12.3,
    delay: -7.1,
    opacity: 0.52,
    rotate: -9,
    driftX: -5,
    glowColor: 'rgba(6, 182, 212, 0.48)',
    visibility: 'all'
  },
  {
    id: 'ri-8',
    kind: 'folder',
    left: '94.5%',
    size: 36,
    duration: 14.7,
    delay: -11.6,
    opacity: 0.56,
    rotate: 8,
    driftX: -6,
    glowColor: 'rgba(250, 204, 21, 0.48)',
    visibility: 'md'
  },
  {
    id: 'ri-9',
    kind: 'scale',
    left: '74%',
    size: 32,
    duration: 13.5,
    delay: -4.5,
    opacity: 0.46,
    rotate: 4,
    driftX: 8,
    glowColor: 'rgba(168, 85, 247, 0.46)',
    visibility: 'lg'
  },
  {
    id: 'ri-10',
    kind: 'chart-line',
    left: '85.5%',
    size: 36,
    duration: 11.9,
    delay: -6.3,
    opacity: 0.56,
    rotate: -4,
    driftX: 7,
    glowColor: 'rgba(16, 185, 129, 0.50)',
    visibility: 'lg'
  },
  {
    id: 'ri-11',
    kind: 'sync-convert',
    left: '83.5%',
    size: 32,
    duration: 15.6,
    delay: -2.8,
    opacity: 0.48,
    rotate: 12,
    driftX: -9,
    glowColor: 'rgba(6, 182, 212, 0.48)',
    visibility: 'lg'
  },
  {
    id: 'ri-12',
    kind: 'calc-pct',
    left: '93.5%',
    size: 32,
    duration: 13.1,
    delay: -10.2,
    opacity: 0.52,
    rotate: -7,
    driftX: -4,
    glowColor: 'rgba(52, 211, 153, 0.50)',
    visibility: 'all'
  },
  {
    id: 'ri-13',
    kind: 'doc-sheet',
    left: '77%',
    size: 32,
    duration: 14.3,
    delay: -1.1,
    opacity: 0.46,
    rotate: 6,
    driftX: -6,
    glowColor: 'rgba(6, 182, 212, 0.44)',
    visibility: 'lg'
  }
];

// Secondary mathematical equations, currency, conversion tags & digital symbols (20–40% opacity)
const RAIN_SYMBOLS: RainSymbolConfig[] = [
  { id: 'sym-1', text: '∑ f(x)', left: '2.5%', color: '#34D399', fontSize: 13, duration: 9.8, delay: -1.4, opacity: 0.36, driftX: 4, visibility: 'all' },
  { id: 'sym-2', text: 'E=mc²', left: '16%', color: '#60A5FA', fontSize: 13, duration: 11.2, delay: -6.5, opacity: 0.34, driftX: -7, visibility: 'lg' },
  { id: 'sym-3', text: '√x', left: '4.8%', color: '#A78BFA', fontSize: 16, duration: 8.9, delay: -4.1, opacity: 0.38, driftX: 4, visibility: 'all' },
  { id: 'sym-4', text: 'π ≈ 3.14', left: '22.5%', color: '#22D3EE', fontSize: 12, duration: 10.6, delay: -8.3, opacity: 0.32, driftX: -5, visibility: 'lg' },
  { id: 'sym-5', text: 'a²+b²=c²', left: '14%', color: '#4ADE80', fontSize: 12, duration: 12.4, delay: -2.9, opacity: 0.33, driftX: 6, visibility: 'lg' },
  { id: 'sym-6', text: '100%', left: '5.8%', color: '#FB923C', fontSize: 13, duration: 9.4, delay: -7.2, opacity: 0.36, driftX: 4, visibility: 'md' },
  { id: 'sym-7', text: '$ → €', left: '19.5%', color: '#34D399', fontSize: 13, duration: 10.1, delay: -5.0, opacity: 0.34, driftX: -6, visibility: 'lg' },
  { id: 'sym-8', text: '∫ dx', left: '8%', color: '#C084FC', fontSize: 15, duration: 11.7, delay: -9.6, opacity: 0.35, driftX: 5, visibility: 'md' },
  { id: 'sym-9', text: '÷ ± ∞', left: '26%', color: '#22D3EE', fontSize: 12, duration: 10.9, delay: -3.2, opacity: 0.25, driftX: 4, visibility: 'lg' },
  { id: 'sym-10', text: '0110', left: '1.6%', color: '#38BDF8', fontSize: 12, duration: 8.5, delay: -4.8, opacity: 0.34, driftX: 3, visibility: 'all' },
  { id: 'sym-11', text: 'Δy/Δx', left: '80%', color: '#A78BFA', fontSize: 13, duration: 10.4, delay: -2.2, opacity: 0.34, driftX: -6, visibility: 'lg' },
  { id: 'sym-12', text: 'sin θ', left: '89.5%', color: '#22D3EE', fontSize: 13, duration: 9.6, delay: -7.7, opacity: 0.36, driftX: -4, visibility: 'all' },
  { id: 'sym-13', text: 'πr²', left: '93.5%', color: '#FB923C', fontSize: 14, duration: 11.1, delay: -4.9, opacity: 0.36, driftX: -4, visibility: 'all' },
  { id: 'sym-14', text: '£ ⇄ ¥', left: '75.5%', color: '#34D399', fontSize: 13, duration: 12.0, delay: -9.1, opacity: 0.32, driftX: 7, visibility: 'lg' },
  { id: 'sym-15', text: 'log₂n', left: '88%', color: '#60A5FA', fontSize: 13, duration: 9.2, delay: -1.6, opacity: 0.35, driftX: -4, visibility: 'md' },
  { id: 'sym-16', text: '°C ⇄ °F', left: '83.5%', color: '#F87171', fontSize: 12, duration: 10.8, delay: -6.0, opacity: 0.32, driftX: 5, visibility: 'lg' },
  { id: 'sym-17', text: '42.0', left: '94.8%', color: '#4ADE80', fontSize: 13, duration: 8.7, delay: -3.5, opacity: 0.35, driftX: -3, visibility: 'all' },
  { id: 'sym-18', text: 'f(x)=y', left: '72%', color: '#C084FC', fontSize: 12, duration: 11.6, delay: -7.4, opacity: 0.24, driftX: -5, visibility: 'lg' },
  { id: 'sym-19', text: 'kWh', left: '36%', color: '#38BDF8', fontSize: 11, duration: 12.6, delay: -5.7, opacity: 0.22, driftX: 4, visibility: 'lg' },
  { id: 'sym-20', text: '%', left: '63.5%', color: '#FACC15', fontSize: 14, duration: 10.3, delay: -8.9, opacity: 0.22, driftX: -4, visibility: 'lg' },
  { id: 'sym-21', text: '01', left: '51%', color: '#22D3EE', fontSize: 11, duration: 11.9, delay: -3.1, opacity: 0.20, driftX: 3, visibility: 'lg' }
];

// Vertical Matrix-inspired digital-rain glowing trails across Electric Blue, Cyan, Violet, Emerald
const RAIN_TRAILS: RainTrailConfig[] = [
  { id: 'tr-1', left: '3.2%', height: 96, color: '#06B6D4', duration: 5.8, delay: -1.2, opacity: 0.42, visibility: 'all' },
  { id: 'tr-2', left: '8.2%', height: 120, color: '#3B82F6', duration: 7.0, delay: -4.6, opacity: 0.38, visibility: 'md' },
  { id: 'tr-3', left: '14.8%', height: 92, color: '#8B5CF6', duration: 5.6, delay: -2.9, opacity: 0.38, visibility: 'lg' },
  { id: 'tr-4', left: '20.2%', height: 110, color: '#10B981', duration: 7.8, delay: -5.4, opacity: 0.34, visibility: 'lg' },
  { id: 'tr-5', left: '28.8%', height: 82, color: '#06B6D4', duration: 6.6, delay: -0.7, opacity: 0.24, visibility: 'lg' },
  { id: 'tr-6', left: '49.2%', height: 74, color: '#3B82F6', duration: 7.5, delay: -4.2, opacity: 0.20, visibility: 'lg' },
  { id: 'tr-7', left: '71.2%', height: 86, color: '#8B5CF6', duration: 6.9, delay: -3.8, opacity: 0.24, visibility: 'lg' },
  { id: 'tr-8', left: '80.5%', height: 114, color: '#06B6D4', duration: 6.2, delay: -1.9, opacity: 0.38, visibility: 'lg' },
  { id: 'tr-9', left: '86.2%', height: 100, color: '#10B981', duration: 7.4, delay: -5.1, opacity: 0.38, visibility: 'lg' },
  { id: 'tr-10', left: '91.8%', height: 122, color: '#3B82F6', duration: 5.7, delay: -2.4, opacity: 0.42, visibility: 'md' },
  { id: 'tr-11', left: '95.8%', height: 94, color: '#8B5CF6', duration: 6.8, delay: -4.2, opacity: 0.40, visibility: 'all' }
];

// Luminous floating particles across outer, mid, and center depth
const PARTICLES: ParticleConfig[] = [
  { id: 'pt-1', left: '4.2%', size: 5, color: '#06B6D4', duration: 8.4, delay: -2.1, opacity: 0.42, driftX: 8, visibility: 'all' },
  { id: 'pt-2', left: '9.4%', size: 4, color: '#3B82F6', duration: 9.7, delay: -5.5, opacity: 0.40, driftX: -8, visibility: 'md' },
  { id: 'pt-3', left: '17.2%', size: 6, color: '#8B5CF6', duration: 10.5, delay: -7.8, opacity: 0.38, driftX: 8, visibility: 'lg' },
  { id: 'pt-4', left: '23.1%', size: 4, color: '#10B981', duration: 8.9, delay: -3.3, opacity: 0.34, driftX: -8, visibility: 'lg' },
  { id: 'pt-5', left: '34.5%', size: 3, color: '#38BDF8', duration: 11.3, delay: -6.4, opacity: 0.24, driftX: 6, visibility: 'lg' },
  { id: 'pt-6', left: '47.5%', size: 3, color: '#A78BFA', duration: 10.1, delay: -2.8, opacity: 0.22, driftX: -5, visibility: 'lg' },
  { id: 'pt-7', left: '66.5%', size: 3, color: '#34D399', duration: 10.8, delay: -4.0, opacity: 0.24, driftX: -6, visibility: 'lg' },
  { id: 'pt-8', left: '77.8%', size: 4, color: '#F97316', duration: 9.1, delay: -1.5, opacity: 0.36, driftX: 9, visibility: 'lg' },
  { id: 'pt-9', left: '83.4%', size: 6, color: '#06B6D4', duration: 10.2, delay: -6.9, opacity: 0.40, driftX: -10, visibility: 'lg' },
  { id: 'pt-10', left: '90.7%', size: 5, color: '#FACC15', duration: 8.6, delay: -3.7, opacity: 0.40, driftX: 6, visibility: 'md' },
  { id: 'pt-11', left: '95.4%', size: 4, color: '#10B981', duration: 9.4, delay: -5.2, opacity: 0.42, driftX: -6, visibility: 'all' },
  { id: 'pt-12', left: '6.8%', size: 4, color: '#EF4444', duration: 7.8, delay: -4.4, opacity: 0.36, driftX: 6, visibility: 'md' },
  { id: 'pt-13', left: '93.8%', size: 4, color: '#3B82F6', duration: 8.1, delay: -0.9, opacity: 0.38, driftX: -6, visibility: 'all' }
];

function visibilityClass(v: 'all' | 'md' | 'lg'): string {
  if (v === 'lg') return 'hidden lg:flex';
  if (v === 'md') return 'hidden md:flex';
  return 'flex';
}

function renderGraphicIcon(kind: IconKind, size: number) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 40 40',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  };

  switch (kind) {
    case 'doc-pdf':
      return (
        <svg {...props}>
          <path d="M8 4h16l8 8v24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1E293B" fillOpacity="0.92" stroke="#EF4444" strokeWidth="1.9" />
          <path d="M24 4v8h8" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="4" y="18" width="22" height="10" rx="2.5" fill="#EF4444" />
          <text x="15" y="25.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.2" fontWeight="800" fontFamily="system-ui, sans-serif">PDF</text>
          <path d="M10 12h10M10 32h16" stroke="#FCA5A5" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'doc-word':
      return (
        <svg {...props}>
          <path d="M8 4h16l8 8v24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1E293B" fillOpacity="0.92" stroke="#3B82F6" strokeWidth="1.9" />
          <path d="M24 4v8h8" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="4" y="17" width="15" height="13" rx="2.5" fill="#2563EB" />
          <text x="11.5" y="26.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif">W</text>
          <path d="M22 19h6M22 23h6M22 27h6M10 12h10M10 33h18" stroke="#93C5FD" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'doc-excel':
      return (
        <svg {...props}>
          <path d="M8 4h16l8 8v24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1E293B" fillOpacity="0.92" stroke="#16A34A" strokeWidth="1.9" />
          <path d="M24 4v8h8" fill="#14532D" stroke="#16A34A" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="4" y="17" width="15" height="13" rx="2.5" fill="#16A34A" />
          <text x="11.5" y="26.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif">X</text>
          <rect x="21" y="17" width="8" height="13" rx="1" stroke="#86EFAC" strokeWidth="1.4" />
          <path d="M21 21.5h8M21 25.5h8M25 17v13" stroke="#86EFAC" strokeWidth="1.2" />
        </svg>
      );

    case 'doc-ppt':
      return (
        <svg {...props}>
          <path d="M8 4h16l8 8v24a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1E293B" fillOpacity="0.92" stroke="#F97316" strokeWidth="1.9" />
          <path d="M24 4v8h8" fill="#7C2D12" stroke="#F97316" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="4" y="17" width="15" height="13" rx="2.5" fill="#F97316" />
          <text x="11.5" y="26.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif">P</text>
          <circle cx="25" cy="23.5" r="4" stroke="#FDBA74" strokeWidth="1.6" />
          <path d="M25 23.5V19.5A4 4 0 0 1 29 23.5h-4z" fill="#F97316" />
        </svg>
      );

    case 'doc-sheet':
      return (
        <svg {...props}>
          <rect x="7" y="4" width="26" height="32" rx="3" fill="#172554" fillOpacity="0.9" stroke="#06B6D4" strokeWidth="1.8" />
          <rect x="11" y="9" width="18" height="4" rx="1" fill="#06B6D4" />
          <path d="M11 17h18M11 21.5h14M11 26h18M11 30.5h11" stroke="#67E8F9" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );

    case 'calc-sci':
      return (
        <svg {...props}>
          <rect x="7" y="3" width="26" height="34" rx="4" fill="#172554" fillOpacity="0.92" stroke="#3B82F6" strokeWidth="1.9" />
          <rect x="10.5" y="6.5" width="19" height="8" rx="1.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="0.7" />
          <text x="20" y="12.5" textAnchor="middle" fill="#34D399" fontSize="5.5" fontWeight="700" fontFamily="monospace">sin(π)</text>
          <rect x="11" y="17" width="4" height="3" rx="0.8" fill="#8B5CF6" />
          <rect x="18" y="17" width="4" height="3" rx="0.8" fill="#06B6D4" />
          <rect x="25" y="17" width="4" height="3" rx="0.8" fill="#F97316" />
          <rect x="11" y="22.5" width="4" height="3" rx="0.8" fill="#60A5FA" />
          <rect x="18" y="22.5" width="4" height="3" rx="0.8" fill="#60A5FA" />
          <rect x="25" y="22.5" width="4" height="3" rx="0.8" fill="#10B981" />
          <rect x="11" y="28" width="4" height="3" rx="0.8" fill="#60A5FA" />
          <rect x="18" y="28" width="4" height="3" rx="0.8" fill="#60A5FA" />
          <rect x="25" y="28" width="4" height="5" rx="0.8" fill="#FACC15" />
        </svg>
      );

    case 'calc-fin':
      return (
        <svg {...props}>
          <rect x="7" y="3" width="26" height="34" rx="4" fill="#064E3B" fillOpacity="0.92" stroke="#10B981" strokeWidth="1.9" />
          <rect x="10.5" y="6.5" width="19" height="8.5" rx="1.5" fill="#022C22" stroke="#34D399" strokeWidth="0.7" />
          <text x="20" y="12.8" textAnchor="middle" fill="#34D399" fontSize="6" fontWeight="700" fontFamily="monospace">$1,250</text>
          <circle cx="13" cy="19.5" r="2" fill="#34D399" />
          <circle cx="20" cy="19.5" r="2" fill="#34D399" />
          <circle cx="27" cy="19.5" r="2" fill="#F97316" />
          <circle cx="13" cy="25.5" r="2" fill="#6EE7B7" />
          <circle cx="20" cy="25.5" r="2" fill="#6EE7B7" />
          <circle cx="27" cy="25.5" r="2" fill="#F97316" />
          <rect x="11" y="30" width="10" height="3.5" rx="1" fill="#10B981" />
          <rect x="23" y="30" width="6" height="3.5" rx="1" fill="#FACC15" />
        </svg>
      );

    case 'calc-basic':
      return (
        <svg {...props}>
          <rect x="8" y="4" width="24" height="32" rx="4" fill="#2E1065" fillOpacity="0.92" stroke="#8B5CF6" strokeWidth="1.9" />
          <rect x="11" y="7.5" width="18" height="6.5" rx="1.2" fill="#1E1B4B" stroke="#A78BFA" strokeWidth="0.7" />
          <path d="M13 19h4M15 17v4M23 19h4" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
          <path d="M13.5 26.5l3 3m0-3l-3 3M23 28h4" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'calc-pct':
      return (
        <svg {...props}>
          <rect x="5" y="5" width="30" height="30" rx="7" fill="#0F172A" fillOpacity="0.9" stroke="#10B981" strokeWidth="1.9" />
          <text x="20" y="25" textAnchor="middle" fill="#34D399" fontSize="14.5" fontWeight="800" fontFamily="system-ui, sans-serif">%$</text>
        </svg>
      );

    case 'table-grid':
      return (
        <svg {...props}>
          <rect x="4" y="6" width="32" height="28" rx="3" fill="#0F172A" fillOpacity="0.9" stroke="#10B981" strokeWidth="1.8" />
          <rect x="4" y="6" width="32" height="7" rx="2" fill="#10B981" />
          <path d="M4 19h32M4 26h32M15 13v21M26 13v21" stroke="#34D399" strokeWidth="1.5" />
          <rect x="16.5" y="20.5" width="8" height="4" rx="0.5" fill="#3B82F6" fillOpacity="0.6" />
        </svg>
      );

    case 'chart-bar':
      return (
        <svg {...props}>
          <rect x="4" y="5" width="32" height="30" rx="4" fill="#0F172A" fillOpacity="0.88" stroke="#3B82F6" strokeWidth="1.8" />
          <rect x="9" y="21" width="4.5" height="9" rx="1" fill="#3B82F6" />
          <rect x="15.5" y="14" width="4.5" height="16" rx="1" fill="#10B981" />
          <rect x="22" y="17" width="4.5" height="13" rx="1" fill="#8B5CF6" />
          <rect x="28.5" y="10" width="4.5" height="20" rx="1" fill="#F97316" />
        </svg>
      );

    case 'chart-pie':
      return (
        <svg {...props}>
          <circle cx="20" cy="20" r="14" fill="#0F172A" fillOpacity="0.9" stroke="#8B5CF6" strokeWidth="1.7" />
          <path d="M20 20V6a14 14 0 0 1 13.3 9.7L20 20z" fill="#10B981" />
          <path d="M20 20l13.3-4.3A14 14 0 0 1 24 33.4L20 20z" fill="#3B82F6" />
          <path d="M20 20l4 13.4A14 14 0 0 1 6.5 23.8L20 20z" fill="#F97316" />
          <path d="M20 20L6.5 23.8A14 14 0 0 1 20 6v14z" fill="#A855F7" />
        </svg>
      );

    case 'chart-line':
      return (
        <svg {...props}>
          <rect x="4" y="6" width="32" height="28" rx="4" fill="#0F172A" fillOpacity="0.88" stroke="#06B6D4" strokeWidth="1.8" />
          <path d="M8 27l7-7 6 4 10-12" stroke="#10B981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="27" r="2.2" fill="#06B6D4" />
          <circle cx="15" cy="20" r="2.2" fill="#3B82F6" />
          <circle cx="21" cy="24" r="2.2" fill="#8B5CF6" />
          <circle cx="31" cy="12" r="2.4" fill="#F97316" />
        </svg>
      );

    case 'folder':
      return (
        <svg {...props}>
          <path d="M4 10a3 3 0 0 1 3-3h8l3 4h15a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10z" fill="#EAB308" fillOpacity="0.9" stroke="#F97316" strokeWidth="1.8" />
          <rect x="9" y="13" width="22" height="4" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
          <path d="M4 17h32v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V17z" fill="#FACC15" stroke="#F97316" strokeWidth="1.8" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...props}>
          <rect x="5" y="7" width="30" height="28" rx="4" fill="#0F172A" fillOpacity="0.92" stroke="#8B5CF6" strokeWidth="1.8" />
          <path d="M5 14h30" stroke="#8B5CF6" strokeWidth="1.8" />
          <rect x="5" y="7" width="30" height="7" rx="3" fill="#8B5CF6" />
          <path d="M13 4v5M27 4v5" stroke="#C4B5FD" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="10" y="18" width="5" height="4" rx="1" fill="#3B82F6" />
          <rect x="17.5" y="18" width="5" height="4" rx="1" fill="#06B6D4" />
          <rect x="25" y="18" width="5" height="4" rx="1" fill="#10B981" />
          <rect x="10" y="25" width="5" height="4" rx="1" fill="#F97316" />
          <rect x="17.5" y="25" width="5" height="4" rx="1" fill="#A855F7" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...props}>
          <circle cx="20" cy="20" r="14.5" fill="#0F172A" fillOpacity="0.92" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="20" cy="20" r="11" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="2 3" />
          <path d="M20 12v8l5.5 3.5" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="2.2" fill="#F97316" />
        </svg>
      );

    case 'ruler':
      return (
        <svg {...props}>
          <rect x="6" y="12" width="28" height="16" rx="2.5" fill="#FACC15" fillOpacity="0.92" stroke="#F97316" strokeWidth="1.8" />
          <path d="M11 12v6M15.5 12v4M20 12v7M24.5 12v4M29 12v6" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'scale':
      return (
        <svg {...props}>
          <path d="M20 7v26M12 33h16M8 13h24" stroke="#C084FC" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8 13l-4 10h8l-4-10zM32 13l-4 10h8l-4-10z" fill="#06B6D4" fillOpacity="0.45" stroke="#22D3EE" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="20" cy="7" r="2.3" fill="#FACC15" />
        </svg>
      );

    case 'geometry':
      return (
        <svg {...props}>
          <path d="M7 32L20 7l13 25H7z" fill="#0F172A" fillOpacity="0.85" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="20" cy="22" r="5" fill="#3B82F6" fillOpacity="0.45" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M16 32v-4h4" stroke="#F97316" strokeWidth="1.6" />
        </svg>
      );

    case 'math-sqrt':
      return (
        <svg {...props}>
          <rect x="5" y="5" width="30" height="30" rx="7" fill="#1E1B4B" fillOpacity="0.92" stroke="#8B5CF6" strokeWidth="1.9" />
          <path d="M10 21l3 5 5-13h12" stroke="#C084FC" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="23.5" y="25" textAnchor="middle" fill="#22D3EE" fontSize="11" fontWeight="800" fontFamily="serif">x</text>
        </svg>
      );

    case 'sync-convert':
      return (
        <svg {...props}>
          <circle cx="20" cy="20" r="14" fill="#0F172A" fillOpacity="0.92" stroke="#06B6D4" strokeWidth="1.9" />
          <path d="M12 16h14l-3.5-3.5M28 24H14l3.5 3.5" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

const MatrixHeroBackground = React.memo(function MatrixHeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="matrix-v2-root absolute inset-0 overflow-hidden pointer-events-none z-0 select-none"
    >
      <style>{`
        .matrix-v2-root {
          --matrix-opacity-scale: 1;
          --matrix-icon-scale: 0.76;
        }
        .dark .matrix-v2-root {
          --matrix-opacity-scale: 0.65;
        }
        @media (min-width: 640px) {
          .matrix-v2-root {
            --matrix-opacity-scale: 1;
            --matrix-icon-scale: 0.90;
          }
          .dark .matrix-v2-root {
            --matrix-opacity-scale: 0.85;
          }
        }
        @media (min-width: 1024px) {
          .matrix-v2-root {
            --matrix-opacity-scale: 1;
            --matrix-icon-scale: 1;
          }
          .dark .matrix-v2-root {
            --matrix-opacity-scale: 1;
          }
        }

        @keyframes matrixV2Fall {
          0% {
            transform: translate3d(0, -70px, 0) scale(var(--matrix-icon-scale, 1)) rotate(var(--icon-rot, 0deg));
            opacity: 0;
          }
          10% {
            opacity: calc(var(--drop-opacity, 0.52) * var(--matrix-opacity-scale, 1));
          }
          50% {
            transform: translate3d(var(--drift-x, 8px), 210px, 0) scale(var(--matrix-icon-scale, 1)) rotate(calc(var(--icon-rot, 0deg) + 4deg));
            opacity: calc(var(--drop-opacity, 0.52) * var(--matrix-opacity-scale, 1));
          }
          88% {
            opacity: calc(var(--drop-opacity, 0.52) * var(--matrix-opacity-scale, 1));
          }
          100% {
            transform: translate3d(0, 480px, 0) scale(var(--matrix-icon-scale, 1)) rotate(var(--icon-rot, 0deg));
            opacity: 0;
          }
        }

        @keyframes matrixTrailFall {
          0% {
            transform: translate3d(0, -135px, 0);
            opacity: 0;
          }
          15% {
            opacity: calc(var(--trail-opacity, 0.36) * var(--matrix-opacity-scale, 1));
          }
          85% {
            opacity: calc(var(--trail-opacity, 0.36) * var(--matrix-opacity-scale, 1));
          }
          100% {
            transform: translate3d(0, 480px, 0);
            opacity: 0;
          }
        }

        .matrix-v2-drop {
          position: absolute;
          top: 0;
          animation: matrixV2Fall linear infinite;
          will-change: transform, opacity;
        }

        .matrix-v2-trail {
          position: absolute;
          top: 0;
          width: 2px;
          border-radius: 9999px;
          animation: matrixTrailFall linear infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Vertical Digital Rain Trails with luminous head droplet */}
      {RAIN_TRAILS.map((trail) => (
        <div
          key={trail.id}
          className={`matrix-v2-trail flex-col justify-end items-center ${visibilityClass(trail.visibility)}`}
          style={
            {
              left: trail.left,
              height: `${trail.height}px`,
              background: `linear-gradient(to bottom, transparent 0%, ${trail.color}66 65%, ${trail.color} 100%)`,
              boxShadow: `0 4px 12px ${trail.color}aa`,
              animationDuration: `${trail.duration}s`,
              animationDelay: `${trail.delay}s`,
              '--trail-opacity': trail.opacity
            } as React.CSSProperties
          }
        >
          <span
            className="block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#FFFFFF', boxShadow: `0 0 10px 2px ${trail.color}` }}
          />
        </div>
      ))}

      {/* Luminous Floating Particles */}
      {PARTICLES.map((pt) => (
        <div
          key={pt.id}
          className={`matrix-v2-drop rounded-full ${visibilityClass(pt.visibility)}`}
          style={
            {
              left: pt.left,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              backgroundColor: pt.color,
              boxShadow: `0 0 12px ${pt.color}`,
              animationDuration: `${pt.duration}s`,
              animationDelay: `${pt.delay}s`,
              '--drop-opacity': pt.opacity,
              '--drift-x': `${pt.driftX}px`,
              '--icon-rot': '0deg'
            } as React.CSSProperties
          }
        />
      ))}

      {/* Falling Mathematical Formulas, Symbols & Numbers */}
      {RAIN_SYMBOLS.map((sym) => (
        <div
          key={sym.id}
          className={`matrix-v2-drop font-mono font-bold tracking-tight whitespace-nowrap ${visibilityClass(sym.visibility)}`}
          style={
            {
              left: sym.left,
              color: sym.color,
              fontSize: `${sym.fontSize}px`,
              textShadow: `0 0 12px ${sym.color}77`,
              animationDuration: `${sym.duration}s`,
              animationDelay: `${sym.delay}s`,
              '--drop-opacity': sym.opacity,
              '--drift-x': `${sym.driftX}px`,
              '--icon-rot': '0deg'
            } as React.CSSProperties
          }
        >
          {sym.text}
        </div>
      ))}

      {/* Primary Colorful Falling Icons (Documents, Calculators, Charts, Utilities) */}
      {RAIN_ICONS.map((item) => (
        <div
          key={item.id}
          className={`matrix-v2-drop items-center justify-center rounded-xl ${visibilityClass(item.visibility)}`}
          style={
            {
              left: item.left,
              filter: `drop-shadow(0 0 12px ${item.glowColor})`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              '--drop-opacity': item.opacity,
              '--drift-x': `${item.driftX}px`,
              '--icon-rot': `${item.rotate}deg`
            } as React.CSSProperties
          }
        >
          {renderGraphicIcon(item.kind, item.size)}
        </div>
      ))}
    </div>
  );
});

export default MatrixHeroBackground;
