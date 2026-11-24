import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Copy,
  Check,
  ArrowRightLeft,
  FileText,
  Binary,
  Shield,
  Search,
  Clock,
  Maximize2,
  Box,
  Paintbrush,
  Globe,
  Code,
  Sparkles,
  AlignJustify,
  FileCheck,
  Download,
  Database,
  Eye,
  Palette,
  PenTool,
  BarChart3,
  Terminal,
  Activity
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import * as devEngine from '../../services/developerToolsEngine';
import { UiCheckbox } from '../ui/AppPrimitives.tsx';
import {
  ToolSplitWorkspace,
  ToolInputPanel,
  ToolResultsPanel,
  ToolFieldGroup,
  ToolMetricTile,
  ToolBreakdownList,
  ToolPresetBar,
  ToolSegmentedControl
} from '../calculator/ToolWorkspacePrimitives.tsx';

interface ToolsWorkspaceProps {
  initialTool?: string;
}

const DEFAULT_WORD_TEXT =
  'CalcTools provides lightning-fast, high-precision calculation engines designed for professionals, engineers, developers, and students. Everything runs 100% locally in your browser.';
const DEFAULT_CASE_INPUT = 'hello world from calctools developer suite';
const DEFAULT_JSON_INPUT = JSON.stringify(
  {
    app: 'CalcTools',
    version: '3.4.0',
    category: 'tools',
    activeFeatures: ['word-counter', 'case-converter', 'json-validator', 'base64', 'hash'],
    metrics: { totalCalculators: 325, clientSide: true }
  },
  null,
  2
);
const DEFAULT_B64_INPUT = 'CalcTools High-Performance Developer Engine';
const DEFAULT_HASH_INPUT = 'calctools-secret-token-key';
const DEFAULT_REGEX_PATTERN = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})';
const DEFAULT_REGEX_CORPUS =
  'Contact our engineering team at support@calctools.io or sales@enterprise.com for inquiries.';
const DEFAULT_HEX_COLOR = '#2563EB';
const DEFAULT_URL_INPUT =
  'https://calctools.io/search?query=scientific+mortgage&filter=all&source=header';
const DEFAULT_HTML_INPUT =
  '<div>\n  <h1>CalcTools & Partners</h1>\n  <p>Copyright © 2026 "Deterministic" & \'Fast\'</p>\n</div>';
const DEFAULT_SQL_INPUT =
  'SELECT u.id, u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = "completed" ORDER BY o.total DESC LIMIT 10;';
const DEFAULT_MARKDOWN_INPUT =
  '# CalcTools Markdown\n\nLive **preview** with `inline code` and bullet lists:\n- Feature 1\n- Feature 2';
const DEFAULT_SVG_PATH = 'M 10 10 L 90 10 L 90 90 L 10 90 Z';
const DEFAULT_READABILITY_TEXT =
  'CalcTools provides lightning-fast calculation engines for professionals and developers.';
const DEFAULT_ASCII_TEXT = 'CALCTOOLS';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in',
  'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

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

/**
 * Pure-React safe inline Markdown renderer (zero dangerouslySetInnerHTML / zero XSS risk).
 */
function renderSafeInlineMarkdown(line: string, keyPrefix: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={`${keyPrefix}-b-${idx}`} className="font-bold text-text-primary">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={`${keyPrefix}-i-${idx}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={`${keyPrefix}-c-${idx}`}
          className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border-subtle font-mono text-xs text-accent"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = pattern.lastIndex;
    idx++;
  }
  if (lastIndex < line.length) {
    tokens.push(line.slice(lastIndex));
  }
  return tokens;
}

function SafeMarkdownBlocks({ source }: { source: string }) {
  const lines = source.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-text-primary leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <p key={i} className="text-base font-bold text-text-primary pt-1">
              {renderSafeInlineMarkdown(line.slice(4), `l-${i}`)}
            </p>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <p key={i} className="text-lg font-bold text-text-primary pt-1">
              {renderSafeInlineMarkdown(line.slice(3), `l-${i}`)}
            </p>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <p key={i} className="text-xl font-bold text-text-primary pt-0.5">
              {renderSafeInlineMarkdown(line.slice(2), `l-${i}`)}
            </p>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-accent font-bold">•</span>
              <span>{renderSafeInlineMarkdown(line.slice(2), `l-${i}`)}</span>
            </div>
          );
        }
        if (!line.trim()) {
          return <div key={i} className="h-1.5" />;
        }
        return <p key={i}>{renderSafeInlineMarkdown(line, `l-${i}`)}</p>;
      })}
    </div>
  );
}

function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0;
  const channels = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export default function ToolsWorkspace({ initialTool = 'word-character-counter' }: ToolsWorkspaceProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [activeTool, setActiveTool] = useState<string>(initialTool);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  const copyToClipboard = useCallback((text: string, key = 'default') => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
  }, []);

  // ---------------------------------------------------------------------
  // 1. Word, Character & Reading Time Counter State
  // ---------------------------------------------------------------------
  const [wordText, setWordText] = useState<string>(DEFAULT_WORD_TEXT);

  const wordMetrics = useMemo(() => {
    const trimmed = wordText.trim();
    const charactersWithSpaces = wordText.length;
    const charactersWithoutSpaces = wordText.replace(/\s+/g, '').length;
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const sentences = trimmed ? (wordText.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length : 0;
    const paragraphs = trimmed ? wordText.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
    const readingTimeMinutes = (words / 200).toFixed(1);
    const speakingTimeMinutes = (words / 130).toFixed(1);
    const readingSeconds = Math.round((words / 200) * 60);

    return {
      words,
      charactersWithSpaces,
      charactersWithoutSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      readingSeconds
    };
  }, [wordText]);

  // ---------------------------------------------------------------------
  // 2. Case Converter State
  // ---------------------------------------------------------------------
  const [caseInput, setCaseInput] = useState<string>(DEFAULT_CASE_INPUT);
  const [caseFormat, setCaseFormat] = useState<string>('title');

  const caseOutput = useMemo(() => {
    const raw = caseInput.trim();
    if (!raw) return '';
    const words = raw.split(/[\s_\-]+/).filter(Boolean);

    switch (caseFormat) {
      case 'upper':
        return raw.toUpperCase();
      case 'lower':
        return raw.toLowerCase();
      case 'title':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      case 'sentence':
        return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      case 'camel':
        return words
          .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
          .join('');
      case 'pascal':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      case 'snake':
        return words.map((w) => w.toLowerCase()).join('_');
      case 'kebab':
        return words.map((w) => w.toLowerCase()).join('-');
      case 'constant':
        return words.map((w) => w.toUpperCase()).join('_');
      default:
        return raw;
    }
  }, [caseInput, caseFormat]);

  // ---------------------------------------------------------------------
  // 3. Lorem Ipsum Generator State (internal switcher view)
  // ---------------------------------------------------------------------
  const [loremParagraphs, setLoremParagraphs] = useState<number>(3);
  const [loremWordsPerParagraph, setLoremWordsPerParagraph] = useState<number>(55);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);

  const loremText = useMemo(() => {
    const paras: string[] = [];
    let wordIdx = 0;

    for (let p = 0; p < loremParagraphs; p++) {
      const pWords: string[] = [];
      for (let w = 0; w < loremWordsPerParagraph; w++) {
        if (p === 0 && w < 8 && startWithLorem) {
          pWords.push(LOREM_WORDS[w]);
        } else {
          pWords.push(LOREM_WORDS[wordIdx % LOREM_WORDS.length]);
          wordIdx++;
        }
      }

      let sentence = '';
      const sentenceChunks: string[] = [];
      for (let i = 0; i < pWords.length; i++) {
        sentence += (sentence ? ' ' : '') + pWords[i];
        if ((i + 1) % 12 === 0 || i === pWords.length - 1) {
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
          sentenceChunks.push(sentence);
          sentence = '';
        }
      }
      paras.push(sentenceChunks.join(' '));
    }
    return paras.join('\n\n');
  }, [loremParagraphs, loremWordsPerParagraph, startWithLorem]);

  // ---------------------------------------------------------------------
  // 4. JSON Formatter & Validator State
  // ---------------------------------------------------------------------
  const [jsonInput, setJsonInput] = useState<string>(DEFAULT_JSON_INPUT);
  const [jsonSpaces, setJsonSpaces] = useState<number>(2);

  const jsonResult = useMemo(() => {
    if (!jsonInput.trim()) {
      return {
        state: 'empty' as const,
        formatted: '',
        message: isEs ? 'Entrada vacía' : 'Empty input'
      };
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = jsonSpaces === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, jsonSpaces);
      return {
        state: 'ready' as const,
        formatted,
        message: isEs ? 'Sintaxis JSON válida' : 'Valid JSON syntax'
      };
    } catch (err: unknown) {
      return {
        state: 'error' as const,
        formatted: '',
        message: err instanceof Error ? err.message : isEs ? 'Sintaxis JSON inválida' : 'Invalid JSON syntax'
      };
    }
  }, [jsonInput, jsonSpaces, isEs]);

  // ---------------------------------------------------------------------
  // 5. Base64 Encoder / Decoder State
  // ---------------------------------------------------------------------
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');
  const [b64Input, setB64Input] = useState<string>(DEFAULT_B64_INPUT);
  const [b64UrlSafe, setB64UrlSafe] = useState<boolean>(false);

  const b64Result = useMemo(() => {
    if (!b64Input) {
      return { state: 'empty' as const, output: '', error: null as string | null };
    }
    try {
      if (b64Mode === 'encode') {
        const utf8Bytes = new TextEncoder().encode(b64Input);
        let binary = '';
        for (let i = 0; i < utf8Bytes.length; i++) {
          binary += String.fromCharCode(utf8Bytes[i]);
        }
        let encoded = btoa(binary);
        if (b64UrlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return { state: 'ready' as const, output: encoded, error: null };
      } else {
        let clean = b64Input.trim();
        if (b64UrlSafe) {
          clean = clean.replace(/-/g, '+').replace(/_/g, '/');
          while (clean.length % 4) clean += '=';
        }
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        return { state: 'ready' as const, output: decoded, error: null };
      }
    } catch {
      return {
        state: 'error' as const,
        output: '',
        error: isEs
          ? 'Secuencia Base64 inválida o error de decodificación'
          : 'Invalid Base64 sequence or decoding error'
      };
    }
  }, [b64Input, b64Mode, b64UrlSafe, isEs]);

  // ---------------------------------------------------------------------
  // 6. Cryptographic Hash Generator State (Web Crypto API)
  // ---------------------------------------------------------------------
  const [hashInput, setHashInput] = useState<string>(DEFAULT_HASH_INPUT);
  const [hashes, setHashes] = useState<{ sha256: string; sha512: string; sha1: string; length: number; bytes: number }>({
    sha256: '',
    sha512: '',
    sha1: '',
    length: 0,
    bytes: 0
  });
  const [hashError, setHashError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const computeHashes = async () => {
      const msg = hashInput;
      if (!msg) {
        setHashes({ sha256: '', sha512: '', sha1: '', length: 0, bytes: 0 });
        setHashError(null);
        return;
      }
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        if (!isCancelled) {
          setHashError(isEs ? 'Web Crypto API no disponible en este contexto.' : 'Web Crypto API is unavailable in this context.');
        }
        return;
      }
      const enc = new TextEncoder();
      const data = enc.encode(msg);

      try {
        const [buf256, buf512, buf1] = await Promise.all([
          crypto.subtle.digest('SHA-256', data as BufferSource),
          crypto.subtle.digest('SHA-512', data as BufferSource),
          crypto.subtle.digest('SHA-1', data as BufferSource)
        ]);

        const toHex = (buffer: ArrayBuffer) =>
          Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        if (!isCancelled) {
          setHashError(null);
          setHashes({
            sha256: toHex(buf256),
            sha512: toHex(buf512),
            sha1: toHex(buf1),
            length: msg.length,
            bytes: data.length
          });
        }
      } catch {
        if (!isCancelled) {
          setHashError(isEs ? 'Error al calcular resúmenes criptográficos.' : 'Unable to compute cryptographic digests.');
        }
      }
    };
    computeHashes();
    return () => {
      isCancelled = true;
    };
  }, [hashInput, isEs]);

  // ---------------------------------------------------------------------
  // 7. Regex Tester State
  // ---------------------------------------------------------------------
  const [regexPattern, setRegexPattern] = useState<string>(DEFAULT_REGEX_PATTERN);
  const [regexFlags, setRegexFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false
  });
  const [regexCorpus, setRegexCorpus] = useState<string>(DEFAULT_REGEX_CORPUS);

  const regexResults = useMemo(() => {
    if (!regexPattern) {
      return { state: 'empty' as const, matches: [] as Array<{ full: string; index: number; groups: string[] }>, error: null as string | null };
    }
    let flags = '';
    if (regexFlags.g) flags += 'g';
    if (regexFlags.i) flags += 'i';
    if (regexFlags.m) flags += 'm';
    if (regexFlags.s) flags += 's';

    try {
      const re = new RegExp(regexPattern, flags);
      const matches: Array<{ full: string; index: number; groups: string[] }> = [];

      if (flags.includes('g')) {
        let match: RegExpExecArray | null;
        let count = 0;
        while ((match = re.exec(regexCorpus)) !== null && count < 100) {
          matches.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          count++;
          if (match[0].length === 0) re.lastIndex++;
        }
      } else {
        const match = re.exec(regexCorpus);
        if (match) {
          matches.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      return { state: 'ready' as const, matches, error: null };
    } catch (err: unknown) {
      return {
        state: 'error' as const,
        matches: [],
        error: err instanceof Error ? err.message : isEs ? 'Expresión regular inválida' : 'Invalid regular expression'
      };
    }
  }, [regexPattern, regexFlags, regexCorpus, isEs]);

  // ---------------------------------------------------------------------
  // 8. Unix Timestamp Converter State
  // ---------------------------------------------------------------------
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [epochInput, setEpochInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString().slice(0, 19));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const epochOutput = useMemo(() => {
    if (!epochInput.trim()) return null;
    const sec = Number(epochInput);
    if (!Number.isFinite(sec) || Math.abs(sec) > 8.64e12) return 'invalid' as const;
    const d = new Date(sec * 1000);
    if (isNaN(d.getTime())) return 'invalid' as const;
    return {
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      ms: Math.round(sec * 1000),
      daysAgo: ((Date.now() / 1000 - sec) / 86400).toFixed(1)
    };
  }, [epochInput]);

  const dateToEpochOutput = useMemo(() => {
    if (!dateInput.trim()) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'invalid' as const;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime()
    };
  }, [dateInput]);

  // ---------------------------------------------------------------------
  // 9. Aspect Ratio Solver State
  // ---------------------------------------------------------------------
  const [aspectWInput, setAspectWInput] = useState<string>('1920');
  const [aspectHInput, setAspectHInput] = useState<string>('1080');
  const [scaleTargetWInput, setScaleTargetWInput] = useState<string>('1280');

  const aspectResult = useMemo(() => {
    const w = Number(aspectWInput);
    const h = Number(aspectHInput);
    const targetW = Number(scaleTargetWInput);
    if (!aspectWInput.trim() || !aspectHInput.trim()) return { state: 'empty' as const };
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0 || !Number.isFinite(targetW) || targetW <= 0) {
      return { state: 'error' as const };
    }
    const iw = Math.round(w);
    const ih = Math.round(h);
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(iw, ih) || 1;
    const rW = iw / divisor;
    const rH = ih / divisor;
    const decimal = iw / ih;
    const targetH = Math.max(1, Math.round(targetW / decimal));
    const mp = ((iw * ih) / 1_000_000).toFixed(2);

    return {
      state: 'ready' as const,
      w: iw,
      h: ih,
      targetW: Math.round(targetW),
      ratio: `${rW}:${rH}`,
      decimal: decimal.toFixed(3),
      targetH,
      mp
    };
  }, [aspectWInput, aspectHInput, scaleTargetWInput]);

  // ---------------------------------------------------------------------
  // 10. File Download & Bandwidth Tool State
  // ---------------------------------------------------------------------
  const [fileSizeInput, setFileSizeInput] = useState<string>('10');
  const [fileSizeUnit, setFileSizeUnit] = useState<'MB' | 'GB' | 'TB'>('GB');
  const [speedInput, setSpeedInput] = useState<string>('100');
  const [speedUnit, setSpeedUnit] = useState<'Mbps' | 'Gbps' | 'MBps'>('Mbps');

  const downloadTransfer = useMemo(() => {
    const fVal = Number(fileSizeInput);
    const sVal = Number(speedInput);
    if (!fileSizeInput.trim() || !speedInput.trim()) return { state: 'empty' as const };
    if (!Number.isFinite(fVal) || !Number.isFinite(sVal) || fVal <= 0 || sVal <= 0) {
      return { state: 'error' as const };
    }

    let sizeInMB = fVal;
    if (fileSizeUnit === 'GB') sizeInMB = fVal * 1024;
    if (fileSizeUnit === 'TB') sizeInMB = fVal * 1024 * 1024;

    let speedInMbps = sVal;
    if (speedUnit === 'Gbps') speedInMbps = sVal * 1000;
    if (speedUnit === 'MBps') speedInMbps = sVal * 8;

    const totalBits = sizeInMB * 8;
    const seconds = totalBits / speedInMbps;
    const minutes = seconds / 60;
    const hours = minutes / 60;

    const formatTime = (s: number) => {
      if (s < 60) return `${Math.round(s)} ${isEs ? 'segundos' : 'seconds'}`;
      if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
      return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    };

    return {
      state: 'ready' as const,
      formatted: formatTime(seconds),
      seconds: Math.round(seconds),
      minutes: minutes.toFixed(1),
      hours: hours.toFixed(2),
      sizeInMB: Math.round(sizeInMB),
      speedInMbps: Number(speedInMbps.toFixed(2))
    };
  }, [fileSizeInput, fileSizeUnit, speedInput, speedUnit, isEs]);

  // ---------------------------------------------------------------------
  // 11. Color Converter & Picker Tool State
  // ---------------------------------------------------------------------
  const [hexColor, setHexColor] = useState<string>(DEFAULT_HEX_COLOR);

  const colorData = useMemo(() => {
    let hex = hexColor.trim();
    if (!hex) return { state: 'empty' as const };
    if (!hex.startsWith('#')) hex = '#' + hex;
    const validHex = /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    if (!validHex) return { state: 'error' as const };

    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    const rN = r / 255,
      gN = g / 255,
      bN = b / 255;
    const max = Math.max(rN, gN, bN),
      min = Math.min(rN, gN, bN);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rN:
          h = (gN - bN) / d + (gN < bN ? 6 : 0);
          break;
        case gN:
          h = (bN - rN) / d + 2;
          break;
        case bN:
          h = (rN - gN) / d + 4;
          break;
      }
      h /= 6;
    }

    const k = 1 - Math.max(rN, gN, bN);
    const c = k === 1 ? 0 : Math.round(((1 - rN - k) / (1 - k)) * 100);
    const m = k === 1 ? 0 : Math.round(((1 - gN - k) / (1 - k)) * 100);
    const y = k === 1 ? 0 : Math.round(((1 - bN - k) / (1 - k)) * 100);

    const sRGB = [rN, gN, bN].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    const lum = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    const contrastOnWhite = ((1.0 + 0.05) / (lum + 0.05)).toFixed(2);
    const contrastOnBlack = ((lum + 0.05) / 0.05).toFixed(2);

    const fullHex =
      hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toUpperCase()
        : hex.toUpperCase();

    return {
      state: 'ready' as const,
      hex: fullHex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      cmyk: `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`,
      contrastOnWhite,
      contrastOnBlack,
      isLight: lum > 0.4
    };
  }, [hexColor]);

  // ---------------------------------------------------------------------
  // 12. URL Encoder & Decoder State (internal switcher view)
  // ---------------------------------------------------------------------
  const [urlInput, setUrlInput] = useState<string>(DEFAULT_URL_INPUT);
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');

  const urlResult = useMemo(() => {
    if (!urlInput) return { state: 'empty' as const, output: '', error: null as string | null };
    try {
      const output = urlMode === 'encode' ? encodeURIComponent(urlInput) : decodeURIComponent(urlInput);
      return { state: 'ready' as const, output, error: null };
    } catch {
      return {
        state: 'error' as const,
        output: '',
        error: isEs ? 'Secuencia URI mal formada / inválida' : 'URI malformed / Invalid percent-encoded sequence'
      };
    }
  }, [urlInput, urlMode, isEs]);

  // ---------------------------------------------------------------------
  // 13. HTML Entity Converter State
  // ---------------------------------------------------------------------
  const [htmlInput, setHtmlInput] = useState<string>(DEFAULT_HTML_INPUT);
  const [htmlMode, setHtmlMode] = useState<'encode' | 'decode'>('encode');

  const htmlOutput = useMemo(() => {
    if (!htmlInput) return '';
    if (htmlMode === 'encode') {
      return htmlInput
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/©/g, '&copy;');
    }
    return htmlInput
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&copy;/g, '©');
  }, [htmlInput, htmlMode]);

  // ---------------------------------------------------------------------
  // 14. QR Code Payload Generator State
  // ---------------------------------------------------------------------
  const [qrType, setQrType] = useState<'url' | 'wifi' | 'text' | 'email'>('url');
  const [qrUrl, setQrUrl] = useState<string>('https://calctools.io');
  const [wifiSsid, setWifiSsid] = useState<string>('CalcTools_Guest_5G');
  const [wifiPass, setWifiPass] = useState<string>('FastCalculations2026');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [qrText, setQrText] = useState<string>('Quick note payload for QR scan');
  const [emailTo, setEmailTo] = useState<string>('support@calctools.io');
  const [emailSubject, setEmailSubject] = useState<string>('Engineering Feedback');

  const qrPayload = useMemo(() => {
    switch (qrType) {
      case 'url':
        return qrUrl.trim();
      case 'wifi':
        return wifiSsid.trim() ? `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};;` : '';
      case 'text':
        return qrText;
      case 'email':
        return emailTo.trim() ? `mailto:${emailTo.trim()}?subject=${encodeURIComponent(emailSubject)}` : '';
      default:
        return qrUrl;
    }
  }, [qrType, qrUrl, wifiSsid, wifiPass, wifiAuth, qrText, emailTo, emailSubject]);

  // ---------------------------------------------------------------------
  // 15–20 + adv-web-* developerToolsEngine State
  // ---------------------------------------------------------------------
  const [sqlInput, setSqlInput] = useState<string>(DEFAULT_SQL_INPUT);
  const [markdownInput, setMarkdownInput] = useState<string>(DEFAULT_MARKDOWN_INPUT);
  const [paletteHex, setPaletteHex] = useState<string>(DEFAULT_HEX_COLOR);
  const [svgPathInput, setSvgPathInput] = useState<string>(DEFAULT_SVG_PATH);
  const [readabilityText, setReadabilityText] = useState<string>(DEFAULT_READABILITY_TEXT);
  const [asciiText, setAsciiText] = useState<string>(DEFAULT_ASCII_TEXT);
  const [advMetricInput, setAdvMetricInput] = useState<string>('100');

  const sqlFormatted = useMemo(() => devEngine.formatSqlQuery(sqlInput), [sqlInput]);
  const markdownHtmlExport = useMemo(() => devEngine.renderMarkdownPreview(markdownInput), [markdownInput]);

  const isPaletteHexValid = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(paletteHex.trim());
  const colorShades = useMemo(
    () => (isPaletteHexValid ? devEngine.generateColorShadesAndTints(paletteHex) : []),
    [paletteHex, isPaletteHexValid]
  );

  const svgAnalysis = useMemo(() => devEngine.analyzeSvgPath(svgPathInput), [svgPathInput]);
  const readabilityAnalysis = useMemo(() => devEngine.analyzeTextReadability(readabilityText), [readabilityText]);
  const asciiBanner = useMemo(() => devEngine.generateAsciiBanner(asciiText), [asciiText]);

  const advParsedVal = Number(advMetricInput);
  const isAdvEmpty = advMetricInput.trim() === '';
  const isAdvValid = !isAdvEmpty && Number.isFinite(advParsedVal) && advParsedVal > 0;
  const advResult = useMemo(
    () => (activeTool.startsWith('adv-web-') && isAdvValid ? devEngine.computeAdvWebCalculator(activeTool, advParsedVal) : null),
    [activeTool, advParsedVal, isAdvValid]
  );

  const switcherItems = useMemo(
    () => [
      { id: 'word-character-counter', label: isEs ? 'Contador Palabras' : 'Word Counter', icon: AlignJustify },
      { id: 'case-converter-tool', label: isEs ? 'Mayúsculas/Min.' : 'Case Converter', icon: FileText },
      { id: 'lorem-ipsum-generator', label: 'Lorem Ipsum', icon: FileCheck },
      { id: 'json-formatter-validator', label: isEs ? 'Formateador JSON' : 'JSON Formatter', icon: Binary },
      { id: 'base64-encoder-decoder', label: 'Base64', icon: ArrowRightLeft },
      { id: 'hash-generator-tool', label: isEs ? 'Hash Cripto' : 'Hash Digest', icon: Shield },
      { id: 'regex-tester-tool', label: 'Regex Tester', icon: Search },
      { id: 'unix-timestamp-converter', label: 'Unix Timestamp', icon: Clock },
      { id: 'aspect-ratio-calculator', label: isEs ? 'Relación Aspecto' : 'Aspect Ratio', icon: Maximize2 },
      { id: 'file-size-bandwidth-tool', label: isEs ? 'Ancho de Banda' : 'File Bandwidth', icon: Box },
      { id: 'color-converter-picker', label: isEs ? 'Conversor Color' : 'Color Picker', icon: Paintbrush },
      { id: 'url-encoder-decoder', label: isEs ? 'Codificador URL' : 'URL Encoder', icon: Globe },
      { id: 'html-entity-converter', label: isEs ? 'Entidades HTML' : 'HTML Entities', icon: Code },
      { id: 'qr-code-payload-generator', label: isEs ? 'Payload QR' : 'QR Payload', icon: Sparkles },
      { id: 'sql-formatter', label: 'SQL Formatter', icon: Database },
      { id: 'markdown-preview-tool', label: 'Markdown', icon: Eye },
      { id: 'color-shade-tint-tool', label: isEs ? 'Tonos Color' : 'Shades & Tints', icon: Palette },
      { id: 'svg-path-inspector', label: 'SVG Path', icon: PenTool },
      { id: 'text-statistics-analyzer', label: isEs ? 'Legibilidad' : 'Readability', icon: BarChart3 },
      { id: 'ascii-banner-generator', label: 'ASCII Banner', icon: Terminal }
    ],
    [isEs]
  );

  const advToolReadableName = activeTool
    .replace(/^adv-web-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Native Tool Switcher Bar */}
      <nav
        aria-label={isEs ? 'Selector rápido de utilidades' : 'Quick utility switcher'}
        className="ui-panel p-2.5 overflow-hidden"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {activeTool.startsWith('adv-web-') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-accent-light text-accent border border-accent/30 shrink-0">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{advToolReadableName}</span>
            </span>
          )}
          {switcherItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveTool(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-accent-light text-accent border border-accent/30 font-semibold'
                    : 'bg-surface-secondary/60 text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 1. Word, Character & Reading Time Counter */}
      {activeTool === 'word-character-counter' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Texto de Entrada' : 'Source Text'}
              subtitle={
                isEs
                  ? 'Métricas de densidad de texto, tiempo de lectura y desglose de oraciones en vivo.'
                  : 'Live text density metrics, reading duration, and sentence breakdown.'
              }
              onClear={() => setWordText('')}
              onReset={() => setWordText(DEFAULT_WORD_TEXT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup
                label={isEs ? 'Pega o escribe tu texto' : 'Type or Paste Text'}
                htmlFor="tw-word-textarea"
                unit={`${wordMetrics.charactersWithSpaces} ${isEs ? 'car.' : 'chars'}`}
              >
                <textarea
                  id="tw-word-textarea"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  rows={8}
                  placeholder={
                    isEs
                      ? 'Escribe o pega tu texto aquí para inspeccionar palabras, caracteres y tiempo de lectura...'
                      : 'Type or paste your text here to inspect word count, characters, and reading duration...'
                  }
                  className="ui-input resize-y text-sm leading-relaxed"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Métricas de Texto' : 'Text Density Metrics'}
              state={wordText.trim() ? 'ready' : 'empty'}
              emptyTitle={isEs ? 'Sin texto para analizar' : 'No text to analyze'}
              emptyDescription={
                isEs
                  ? 'Escribe o pega texto a la izquierda para calcular palabras y tiempo de lectura.'
                  : 'Type or paste text on the left to inspect word count and reading time.'
              }
              primaryLabel={isEs ? 'Total de Palabras' : 'Total Words'}
              primaryValue={String(wordMetrics.words)}
              primaryUnit={isEs ? 'palabras' : 'words'}
              primarySubtext={
                isEs
                  ? `Lectura: ${wordMetrics.readingSeconds < 60 ? `${wordMetrics.readingSeconds}s` : `${wordMetrics.readingTimeMinutes} min`} (~200 ppm) · Locución: ${wordMetrics.speakingTimeMinutes} min (~130 ppm)`
                  : `Reading: ${wordMetrics.readingSeconds < 60 ? `${wordMetrics.readingSeconds}s` : `${wordMetrics.readingTimeMinutes}m`} (~200 wpm) · Speaking: ${wordMetrics.speakingTimeMinutes} min (~130 wpm)`
              }
              statusLabel={isEs ? 'En tiempo real' : 'Live count'}
              statusTone="accent"
              copyText={wordText}
              copyLabel={isEs ? 'Copiar Texto' : 'Copy Text'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <ToolMetricTile
                    label={isEs ? 'Caracteres' : 'Characters'}
                    value={String(wordMetrics.charactersWithSpaces)}
                    accent
                  />
                  <ToolMetricTile
                    label={isEs ? 'Sin Espacios' : 'No Spaces'}
                    value={String(wordMetrics.charactersWithoutSpaces)}
                  />
                  <ToolMetricTile
                    label={isEs ? 'Tiempo Lectura' : 'Reading Time'}
                    value={
                      wordMetrics.readingSeconds < 60
                        ? `${wordMetrics.readingSeconds}s`
                        : `${wordMetrics.readingTimeMinutes}m`
                    }
                    accent
                  />
                  <ToolMetricTile
                    label={isEs ? 'Locución (~130 ppm)' : 'Speaking (~130 wpm)'}
                    value={`${wordMetrics.speakingTimeMinutes} min`}
                  />
                </div>
                <ToolBreakdownList
                  items={[
                    { label: isEs ? 'Oraciones' : 'Sentences', value: String(wordMetrics.sentences) },
                    { label: isEs ? 'Párrafos' : 'Paragraphs', value: String(wordMetrics.paragraphs) }
                  ]}
                />
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 2. Case Converter */}
      {activeTool === 'case-converter-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Conversor de Mayúsculas y Formatos' : 'Text Case & Format Controls'}
              subtitle={
                isEs
                  ? 'Transforma texto entre UPPERCASE, Title Case, camelCase, snake_case y más.'
                  : 'Transform text between UPPERCASE, Title Case, camelCase, snake_case, and more.'
              }
              onClear={() => setCaseInput('')}
              onReset={() => {
                setCaseInput(DEFAULT_CASE_INPUT);
                setCaseFormat('title');
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Texto Original' : 'Input Text'} htmlFor="tw-case-input">
                <textarea
                  id="tw-case-input"
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  rows={5}
                  placeholder={isEs ? 'Introduce el texto a convertir...' : 'Enter text to convert case...'}
                  className="ui-input resize-y text-sm leading-relaxed"
                />
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'Formato de Destino' : 'Target Case Style'}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'upper', label: 'UPPERCASE' },
                    { id: 'lower', label: 'lowercase' },
                    { id: 'title', label: 'Title Case' },
                    { id: 'sentence', label: 'Sentence case' },
                    { id: 'camel', label: 'camelCase' },
                    { id: 'pascal', label: 'PascalCase' },
                    { id: 'snake', label: 'snake_case' },
                    { id: 'kebab', label: 'kebab-case' },
                    { id: 'constant', label: 'CONSTANT_CASE' }
                  ].map((btn) => {
                    const active = caseFormat === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCaseFormat(btn.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'bg-accent-light text-accent border-accent/40'
                            : 'bg-surface-secondary/60 text-text-secondary hover:text-text-primary hover:bg-surface-hover border-border-subtle'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Salida Transformada' : 'Transformed Output'}
              state={caseOutput ? 'ready' : 'empty'}
              emptyTitle={isEs ? 'Introduce texto para convertir' : 'Enter text to transform'}
              emptyDescription={
                isEs
                  ? 'El resultado convertido aparecerá aquí al instante.'
                  : 'Your converted string will appear here immediately.'
              }
              primaryLabel={isEs ? 'Formato Activo' : 'Active Format'}
              primaryValue={caseFormat.toUpperCase()}
              primarySubtext={`${caseOutput.length} ${isEs ? 'caracteres' : 'characters'}`}
              statusLabel={isEs ? 'Convertido' : 'Converted'}
              statusTone="accent"
              copyText={caseOutput}
              copyLabel={isEs ? 'Copiar Salida' : 'Copy Output'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-case-output"
                className="p-4 rounded-xl border border-border-main bg-surface-secondary font-mono text-sm text-text-primary whitespace-pre-wrap break-all select-all"
              >
                {caseOutput}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 3. Lorem Ipsum Generator (internal switcher view) */}
      {activeTool === 'lorem-ipsum-generator' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Configuración de Lorem Ipsum' : 'Lorem Ipsum Settings'}
              subtitle={
                isEs
                  ? 'Párrafos latinos deterministas para maquetas de diseño web.'
                  : 'Deterministic Latin placeholder paragraphs for layouts and wireframes.'
              }
              onReset={() => {
                setLoremParagraphs(3);
                setLoremWordsPerParagraph(55);
                setStartWithLorem(true);
              }}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup label={isEs ? 'Párrafos (1–20)' : 'Paragraphs (1–20)'} htmlFor="tw-lorem-paras">
                  <input
                    id="tw-lorem-paras"
                    type="number"
                    min={1}
                    max={20}
                    value={loremParagraphs}
                    onChange={(e) => setLoremParagraphs(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                    className="ui-input font-mono"
                  />
                </ToolFieldGroup>

                <ToolFieldGroup label={isEs ? 'Palabras por Párrafo (10–200)' : 'Words per Paragraph (10–200)'} htmlFor="tw-lorem-words">
                  <input
                    id="tw-lorem-words"
                    type="number"
                    min={10}
                    max={200}
                    value={loremWordsPerParagraph}
                    onChange={(e) => setLoremWordsPerParagraph(Math.max(10, Math.min(200, parseInt(e.target.value, 10) || 50)))}
                    className="ui-input font-mono"
                  />
                </ToolFieldGroup>
              </div>

              <UiCheckbox
                id="tw-start-lorem"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                label={isEs ? 'Comenzar con "Lorem ipsum..."' : 'Start with "Lorem ipsum..."'}
              />
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Texto Generado' : 'Generated Copy'}
              state="ready"
              primaryLabel={isEs ? 'Volumen Generado' : 'Generated Volume'}
              primaryValue={String(loremParagraphs)}
              primaryUnit={isEs ? 'párrafos' : 'paragraphs'}
              primarySubtext={`${loremParagraphs * loremWordsPerParagraph} ${isEs ? 'palabras totales' : 'total words'}`}
              statusLabel={isEs ? 'Listo' : 'Ready'}
              statusTone="accent"
              copyText={loremText}
              copyLabel={isEs ? 'Copiar Todo' : 'Copy All'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="p-4 rounded-xl border border-border-main bg-surface-secondary text-sm text-text-primary leading-relaxed whitespace-pre-wrap max-h-[360px] overflow-y-auto select-all">
                {loremText}
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 4. JSON Formatter & Validator */}
      {activeTool === 'json-formatter-validator' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Entrada JSON Sin Formato' : 'Raw JSON Input'}
              subtitle={
                isEs
                  ? 'Valida sintaxis RFC 8259, embellece con 2/4 espacios o minifica.'
                  : 'Validate RFC 8259 syntax, pretty-print with 2/4 spaces, or minify payloads.'
              }
              onClear={() => setJsonInput('')}
              onReset={() => {
                setJsonInput(DEFAULT_JSON_INPUT);
                setJsonSpaces(2);
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Estilo de Formato' : 'Format Mode'}>
                <ToolSegmentedControl<string>
                  ariaLabel={isEs ? 'Indentación JSON' : 'JSON indentation mode'}
                  value={String(jsonSpaces)}
                  onChange={(val) => setJsonSpaces(Number(val))}
                  options={[
                    { value: '2', label: isEs ? '2 Espacios' : '2 Spaces (Pretty)' },
                    { value: '4', label: isEs ? '4 Espacios' : '4 Spaces' },
                    { value: '0', label: isEs ? 'Minificar' : 'Minify' }
                  ]}
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={isEs ? 'Cadena JSON' : 'JSON Payload'}
                htmlFor="tw-json-input"
                error={jsonResult.state === 'error' ? jsonResult.message : undefined}
              >
                <textarea
                  id="tw-json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  placeholder={isEs ? 'Pega tu JSON aquí...' : 'Paste JSON string here...'}
                  className="ui-input font-mono text-xs resize-y leading-relaxed"
                />
              </ToolFieldGroup>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={jsonResult.state !== 'ready'}
                  onClick={() => downloadBlob(jsonResult.formatted, 'formatted.json', 'application/json;charset=utf-8')}
                  className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isEs ? 'Descargar .json' : 'Download .json'}
                </button>
              </div>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'JSON Formateado' : 'Formatted JSON Output'}
              state={jsonResult.state}
              emptyTitle={isEs ? 'Introduce JSON para formatear' : 'Enter JSON to validate & format'}
              emptyDescription={
                isEs
                  ? 'Pega un objeto o arreglo JSON válido en el panel izquierdo.'
                  : 'Paste a valid JSON object or array in the input panel.'
              }
              errorTitle={isEs ? 'Error de Sintaxis JSON' : 'JSON Syntax Error'}
              errorMessage={jsonResult.message}
              primaryLabel={isEs ? 'Estado de Validación' : 'Validation Status'}
              primaryValue={jsonResult.state === 'ready' ? (isEs ? 'Válido' : 'Valid') : '—'}
              primaryUnit={jsonSpaces === 0 ? (isEs ? 'Minificado' : 'Minified') : `${jsonSpaces} sp`}
              primarySubtext={`${new TextEncoder().encode(jsonResult.formatted).length} bytes · ${jsonResult.formatted.split('\n').length} ${isEs ? 'líneas' : 'lines'}`}
              statusLabel={jsonResult.message}
              statusTone="accent"
              copyText={jsonResult.formatted}
              copyLabel={isEs ? 'Copiar Resultado' : 'Copy Result'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-json-output"
                className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[380px] leading-relaxed select-all"
              >
                {jsonResult.formatted}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 5. Base64 Encoder / Decoder */}
      {activeTool === 'base64-encoder-decoder' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Codificador / Decodificador Base64' : 'Base64 Input & Options'}
              subtitle={
                isEs
                  ? 'Codifica cadenas UTF-8 o decodifica Base64/Base64URL localmente. Base64 es codificación, no cifrado.'
                  : 'Encode UTF-8 text or decode Base64/Base64URL locally. Encoding does not encrypt or authenticate data.'
              }
              onClear={() => setB64Input('')}
              onReset={() => {
                setB64Mode('encode');
                setB64Input(DEFAULT_B64_INPUT);
                setB64UrlSafe(false);
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Dirección de Conversión' : 'Conversion Mode'}>
                <ToolSegmentedControl<'encode' | 'decode'>
                  ariaLabel={isEs ? 'Modo Base64' : 'Base64 mode'}
                  value={b64Mode}
                  onChange={setB64Mode}
                  options={[
                    { value: 'encode', label: isEs ? 'Texto → Base64' : 'Encode Text → Base64' },
                    { value: 'decode', label: isEs ? 'Base64 → Texto' : 'Decode Base64 → Text' }
                  ]}
                />
              </ToolFieldGroup>

              <UiCheckbox
                id="tw-b64-urlsafe"
                checked={b64UrlSafe}
                onChange={(e) => setB64UrlSafe(e.target.checked)}
                label={isEs ? 'Base64URL seguro (- y _, sin relleno =)' : 'URL-safe Base64URL (- and _, unpadded)'}
              />

              <ToolFieldGroup
                label={
                  b64Mode === 'encode'
                    ? isEs
                      ? 'Texto Original (UTF-8)'
                      : 'Raw Input Text (UTF-8)'
                    : isEs
                      ? 'Cadena Base64'
                      : 'Base64 Input String'
                }
                htmlFor="tw-b64-input"
                error={b64Result.error ?? undefined}
              >
                <textarea
                  id="tw-b64-input"
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  rows={6}
                  className="ui-input font-mono text-xs resize-y leading-relaxed"
                />
              </ToolFieldGroup>

              <button
                type="button"
                onClick={() => {
                  const nextMode = b64Mode === 'encode' ? 'decode' : 'encode';
                  if (b64Result.state === 'ready' && b64Result.output) {
                    setB64Input(b64Result.output);
                  }
                  setB64Mode(nextMode);
                }}
                className="ui-btn-secondary inline-flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {isEs ? 'Intercambiar Entrada/Salida' : 'Swap Input & Output'}
              </button>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={
                b64Mode === 'encode'
                  ? isEs
                    ? 'Salida Base64'
                    : 'Encoded Base64 Output'
                  : isEs
                    ? 'Texto Decodificado'
                    : 'Decoded UTF-8 Output'
              }
              state={b64Result.state}
              emptyTitle={isEs ? 'Introduce texto arriba' : 'Enter text to process'}
              emptyDescription={
                isEs
                  ? 'La salida codificada o decodificada aparecerá aquí.'
                  : 'Encoded Base64 or decoded UTF-8 text will appear here.'
              }
              errorTitle={isEs ? 'Error de Decodificación Base64' : 'Base64 Decode Error'}
              errorMessage={b64Result.error ?? undefined}
              primaryLabel={b64UrlSafe ? 'Base64URL (RFC 4648 §5)' : 'Base64 (RFC 4648 §4)'}
              primaryValue={`${b64Result.output.length}`}
              primaryUnit={isEs ? 'caracteres' : 'chars'}
              statusLabel={b64Mode === 'encode' ? (isEs ? 'Codificado' : 'Encoded') : isEs ? 'Decodificado' : 'Decoded'}
              statusTone="accent"
              copyText={b64Result.output}
              copyLabel={isEs ? 'Copiar Salida' : 'Copy Output'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-b64-output"
                className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary whitespace-pre-wrap break-all select-all"
              >
                {b64Result.output}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 6. Cryptographic Hash Generator (Web Crypto API) */}
      {activeTool === 'hash-generator-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Generador de Resúmenes Hash (Web Crypto)' : 'Cryptographic Hash Input'}
              subtitle={
                isEs
                  ? 'Calcula SHA-256, SHA-512 y SHA-1 (heredado) localmente vía crypto.subtle. Los hashes verifican integridad, no autentican identidad.'
                  : 'Computes SHA-256, SHA-512, and legacy SHA-1 locally via Web Crypto. Hashes verify integrity and do not authenticate data.'
              }
              onClear={() => setHashInput('')}
              onReset={() => setHashInput(DEFAULT_HASH_INPUT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolPresetBar
                label={isEs ? 'Vectores de prueba' : 'Test vectors'}
                presets={[
                  { label: 'Default Token', onSelect: () => setHashInput(DEFAULT_HASH_INPUT) },
                  { label: 'NIST "abc"', onSelect: () => setHashInput('abc') },
                  { label: 'UTF-8 "café"', onSelect: () => setHashInput('café') }
                ]}
              />

              <ToolFieldGroup
                label={isEs ? 'Cadena de Entrada (UTF-8)' : 'Input Text String (UTF-8)'}
                htmlFor="tw-hash-input"
                unit={`${hashes.bytes} B`}
              >
                <textarea
                  id="tw-hash-input"
                  rows={5}
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder={isEs ? 'Introduce el mensaje para generar el hash...' : 'Enter message to hash...'}
                  className="ui-input font-mono text-sm resize-y"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Resúmenes Criptográficos' : 'Cryptographic Digests'}
              state={hashError ? 'error' : !hashInput ? 'empty' : 'ready'}
              emptyTitle={isEs ? 'Introduce un mensaje para calcular hashes' : 'Enter a message to compute hashes'}
              emptyDescription={
                isEs
                  ? 'SHA-256, SHA-512 y SHA-1 se calcularán al instante en tu navegador.'
                  : 'SHA-256, SHA-512, and SHA-1 digests will compute instantly in-browser.'
              }
              errorTitle={isEs ? 'Error de Web Crypto' : 'Web Crypto Error'}
              errorMessage={hashError ?? undefined}
              primaryLabel="SHA-256"
              primaryValue={hashes.sha256 ? `${hashes.sha256.slice(0, 16)}…` : '—'}
              primaryUnit="256-bit"
              primarySubtext={`${hashes.bytes} UTF-8 bytes · Web Crypto crypto.subtle.digest`}
              statusLabel="Web Crypto"
              statusTone="accent"
              copyText={hashes.sha256}
              copyLabel={isEs ? 'Copiar SHA-256' : 'Copy SHA-256'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-3">
                {[
                  { name: isEs ? 'SHA-256 (Recomendado 256-bit)' : 'SHA-256 (Recommended 256-bit)', value: hashes.sha256, key: 'sha256' },
                  { name: isEs ? 'SHA-512 (Alta Seguridad 512-bit)' : 'SHA-512 (High Security 512-bit)', value: hashes.sha512, key: 'sha512' },
                  { name: isEs ? 'SHA-1 (Heredado 160-bit — no usar para seguridad)' : 'SHA-1 (Legacy 160-bit — non-cryptographic only)', value: hashes.sha1, key: 'sha1' }
                ].map((item) => (
                  <div
                    key={item.key}
                    data-hash-algo={item.key}
                    className="p-3 rounded-xl border border-border-main bg-surface-secondary space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-text-secondary">
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="inline-flex items-center gap-1 text-accent hover:underline cursor-pointer shrink-0"
                      >
                        {copiedKey === item.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === item.key ? (isEs ? 'Copiado' : 'Copied') : isEs ? 'Copiar' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-text-primary break-all select-all">
                      {item.value || '…'}
                    </div>
                  </div>
                ))}
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 7. Regex Tester */}
      {activeTool === 'regex-tester-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Probador de Expresiones Regulares' : 'Regular Expression Pattern'}
              subtitle={
                isEs
                  ? 'Prueba patrones RegExp de JavaScript con grupos de captura y banderas en vivo.'
                  : 'Test JavaScript RegExp patterns with capture groups and flags in real time.'
              }
              onClear={() => {
                setRegexPattern('');
                setRegexCorpus('');
              }}
              onReset={() => {
                setRegexPattern(DEFAULT_REGEX_PATTERN);
                setRegexFlags({ g: true, i: true, m: false, s: false });
                setRegexCorpus(DEFAULT_REGEX_CORPUS);
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup
                label={isEs ? 'Patrón RegExp' : 'RegExp Pattern'}
                htmlFor="tw-regex-pattern"
                error={regexResults.error ?? undefined}
              >
                <div className="flex items-center rounded-lg border border-border-main bg-surface px-3">
                  <span className="text-text-tertiary font-mono text-sm mr-1">/</span>
                  <input
                    id="tw-regex-pattern"
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full py-2 bg-transparent font-mono text-sm text-text-primary focus:outline-none"
                  />
                  <span className="text-text-tertiary font-mono text-sm ml-1">/</span>
                </div>
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'Banderas Activas' : 'Active Flags'}>
                <div className="flex flex-wrap items-center gap-4">
                  {(['g', 'i', 'm', 's'] as const).map((flag) => (
                    <UiCheckbox
                      key={flag}
                      id={`tw-regex-flag-${flag}`}
                      checked={regexFlags[flag]}
                      onChange={(e) => setRegexFlags((prev) => ({ ...prev, [flag]: e.target.checked }))}
                      label={flag}
                    />
                  ))}
                </div>
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'Texto de Prueba (Corpus)' : 'Test Corpus String'} htmlFor="tw-regex-corpus">
                <textarea
                  id="tw-regex-corpus"
                  value={regexCorpus}
                  onChange={(e) => setRegexCorpus(e.target.value)}
                  rows={5}
                  className="ui-input text-sm resize-y"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Coincidencias Capturadas' : 'Captured Matches'}
              state={regexResults.state}
              emptyTitle={isEs ? 'Introduce un patrón RegExp' : 'Enter a RegExp pattern'}
              emptyDescription={
                isEs
                  ? 'Escribe una expresión regular válida para inspeccionar coincidencias y grupos.'
                  : 'Provide a regular expression pattern to inspect matches and capture groups.'
              }
              errorTitle={isEs ? 'Expresión Regular Inválida' : 'Invalid Regular Expression'}
              errorMessage={regexResults.error ?? undefined}
              primaryLabel={isEs ? 'Coincidencias Encontradas' : 'Matches Found'}
              primaryValue={String(regexResults.matches.length)}
              primaryUnit={regexResults.matches.length === 1 ? (isEs ? 'coincidencia' : 'match') : isEs ? 'coincidencias' : 'matches'}
              statusLabel={regexResults.matches.length > 0 ? (isEs ? 'Coincide' : 'Matched') : isEs ? 'Sin coincidencias' : 'No matches'}
              statusTone={regexResults.matches.length > 0 ? 'accent' : 'neutral'}
              copyText={regexResults.matches.map((m) => m.full).join('\n')}
              copyLabel={isEs ? 'Copiar Coincidencias' : 'Copy Matches'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              {regexResults.matches.length === 0 ? (
                <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary text-xs text-text-secondary">
                  {isEs ? 'No se encontraron coincidencias para el patrón actual.' : 'No matches found for the current pattern.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {regexResults.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-border-subtle bg-surface-secondary flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                    >
                      <span className="text-accent font-bold break-all">
                        #{idx + 1}: {m.full}
                      </span>
                      <span className="text-text-tertiary text-[11px]">
                        @{m.index}
                        {m.groups.length > 0 ? ` · [${m.groups.join(', ')}]` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ToolResultsPanel>
          }
        />
      )}

      {/* 8. Unix Timestamp Converter */}
      {activeTool === 'unix-timestamp-converter' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Conversor de Marca Temporal Unix' : 'Unix Epoch & Date Inputs'}
              subtitle={
                isEs
                  ? 'Convierte segundos POSIX desde el 1 ene 1970 UTC a fechas legibles y viceversa.'
                  : 'Convert POSIX seconds since Jan 1, 1970 UTC to human dates and back.'
              }
              onReset={() => {
                const nowSec = Math.floor(Date.now() / 1000);
                setEpochInput(String(nowSec));
                setDateInput(new Date(nowSec * 1000).toISOString().slice(0, 19));
              }}
              resetLabel={isEs ? 'Ahora' : 'Reset Now'}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-border-subtle bg-surface-secondary">
                <div className="text-xs font-mono">
                  <span className="text-text-secondary">{isEs ? 'Epoch actual:' : 'Current Epoch:'} </span>
                  <strong className="text-accent">{currentEpoch}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setEpochInput(String(currentEpoch))}
                  className="ui-btn-secondary px-2.5 py-1 text-xs"
                >
                  {isEs ? 'Usar Actual' : 'Use Current'}
                </button>
              </div>

              <ToolFieldGroup
                label={isEs ? 'Segundos Epoch → Fecha Humana' : 'Epoch Seconds → Human Date'}
                htmlFor="tw-epoch-input"
                error={
                  epochOutput === 'invalid'
                    ? isEs
                      ? 'Introduce un timestamp Unix numérico válido.'
                      : 'Enter a valid numeric Unix timestamp.'
                    : undefined
                }
              >
                <input
                  id="tw-epoch-input"
                  type="number"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  className="ui-input font-mono text-sm"
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={isEs ? 'Fecha Humana → Segundos Epoch' : 'Human Date → Epoch Seconds'}
                htmlFor="tw-date-input"
                error={
                  dateToEpochOutput === 'invalid'
                    ? isEs
                      ? 'Fecha/hora no válida.'
                      : 'Invalid date/time value.'
                    : undefined
                }
              >
                <input
                  id="tw-date-input"
                  type="datetime-local"
                  step="1"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="ui-input text-sm"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Coordenadas Temporales' : 'Converted Timestamps'}
              state={
                epochOutput === 'invalid' || dateToEpochOutput === 'invalid'
                  ? 'error'
                  : !epochOutput && !dateToEpochOutput
                    ? 'empty'
                    : 'ready'
              }
              errorTitle={isEs ? 'Fecha o Epoch no válidos' : 'Invalid Epoch or Date'}
              errorMessage={
                isEs
                  ? 'Comprueba que el timestamp Unix y la fecha tengan un formato válido.'
                  : 'Ensure both the Unix timestamp and date input are within valid ranges.'
              }
              primaryLabel={isEs ? 'ISO 8601 (UTC)' : 'ISO 8601 (UTC)'}
              primaryValue={epochOutput && epochOutput !== 'invalid' ? epochOutput.iso : '—'}
              primarySubtext={
                epochOutput && epochOutput !== 'invalid'
                  ? `${epochOutput.utc} · ${epochOutput.daysAgo} ${isEs ? 'días desde ahora' : 'days from now'}`
                  : undefined
              }
              statusLabel="POSIX UTC"
              statusTone="accent"
              copyText={epochOutput && epochOutput !== 'invalid' ? epochOutput.iso : ''}
              copyLabel={isEs ? 'Copiar ISO' : 'Copy ISO'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-4">
                {dateToEpochOutput && dateToEpochOutput !== 'invalid' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <ToolMetricTile
                      label={isEs ? 'Fecha → Segundos' : 'Date → Seconds'}
                      value={String(dateToEpochOutput.seconds)}
                      accent
                    />
                    <ToolMetricTile
                      label={isEs ? 'Milisegundos' : 'Milliseconds'}
                      value={String(dateToEpochOutput.milliseconds)}
                    />
                  </div>
                )}
                {epochOutput && epochOutput !== 'invalid' && (
                  <ToolBreakdownList
                    items={[
                      { label: 'ISO 8601', value: epochOutput.iso, highlight: true },
                      { label: 'UTC', value: epochOutput.utc },
                      { label: isEs ? 'Hora Local' : 'Local Time', value: epochOutput.local },
                      { label: isEs ? 'Epoch (ms)' : 'Epoch (ms)', value: String(epochOutput.ms) }
                    ]}
                  />
                )}
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 9. Aspect Ratio Solver */}
      {activeTool === 'aspect-ratio-calculator' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Dimensiones de Imagen y Vídeo' : 'Aspect Ratio Dimensions'}
              subtitle={
                isEs
                  ? 'Calcula proporciones exactas (16:9, 4:3, 1:1) y escalado proporcional.'
                  : 'Calculate exact aspect ratios (16:9, 4:3, 1:1) and proportional scaling.'
              }
              onClear={() => {
                setAspectWInput('');
                setAspectHInput('');
              }}
              onReset={() => {
                setAspectWInput('1920');
                setAspectHInput('1080');
                setScaleTargetWInput('1280');
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolPresetBar
                label={isEs ? 'Estándares' : 'Presets'}
                presets={[
                  { label: '16:9 (HD/4K)', onSelect: () => { setAspectWInput('1920'); setAspectHInput('1080'); } },
                  { label: '4:3 (SD)', onSelect: () => { setAspectWInput('1024'); setAspectHInput('768'); } },
                  { label: '1:1 (Square)', onSelect: () => { setAspectWInput('1080'); setAspectHInput('1080'); } },
                  { label: '21:9 (Ultrawide)', onSelect: () => { setAspectWInput('2560'); setAspectHInput('1080'); } },
                  { label: '9:16 (Vertical)', onSelect: () => { setAspectWInput('1080'); setAspectHInput('1920'); } },
                  { label: '3:2 (DSLR)', onSelect: () => { setAspectWInput('1500'); setAspectHInput('1000'); } }
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToolFieldGroup label={isEs ? 'Ancho Origen (px)' : 'Source Width (px)'} htmlFor="tw-aspect-w">
                  <input
                    id="tw-aspect-w"
                    type="number"
                    min={1}
                    value={aspectWInput}
                    onChange={(e) => setAspectWInput(e.target.value)}
                    className="ui-input font-mono"
                  />
                </ToolFieldGroup>
                <ToolFieldGroup label={isEs ? 'Alto Origen (px)' : 'Source Height (px)'} htmlFor="tw-aspect-h">
                  <input
                    id="tw-aspect-h"
                    type="number"
                    min={1}
                    value={aspectHInput}
                    onChange={(e) => setAspectHInput(e.target.value)}
                    className="ui-input font-mono"
                  />
                </ToolFieldGroup>
              </div>

              <ToolFieldGroup label={isEs ? 'Ancho Objetivo de Escala (px)' : 'Target Scaled Width (px)'} htmlFor="tw-aspect-target">
                <input
                  id="tw-aspect-target"
                  type="number"
                  min={1}
                  value={scaleTargetWInput}
                  onChange={(e) => setScaleTargetWInput(e.target.value)}
                  className="ui-input font-mono"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Relación y Escalado' : 'Ratio & Scaled Output'}
              state={aspectResult.state}
              errorTitle={isEs ? 'Dimensiones inválidas' : 'Invalid Dimensions'}
              errorMessage={isEs ? 'Introduce valores positivos mayores que 0.' : 'Enter positive pixel values greater than 0.'}
              primaryLabel={isEs ? 'Relación de Aspecto' : 'Aspect Ratio'}
              primaryValue={aspectResult.state === 'ready' ? aspectResult.ratio : '—'}
              primaryUnit={aspectResult.state === 'ready' ? `${aspectResult.decimal}:1` : undefined}
              primarySubtext={
                aspectResult.state === 'ready'
                  ? `${aspectResult.w} × ${aspectResult.h} px · ${aspectResult.mp} MP`
                  : undefined
              }
              statusLabel={isEs ? 'Proporcional' : 'Proportional'}
              statusTone="accent"
              copyText={
                aspectResult.state === 'ready'
                  ? `${aspectResult.ratio} (${aspectResult.decimal}:1) | Scaled: ${aspectResult.targetW} × ${aspectResult.targetH} px | ${aspectResult.mp} MP`
                  : ''
              }
              copyLabel={isEs ? 'Copiar Resultado' : 'Copy Result'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              {aspectResult.state === 'ready' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <ToolMetricTile
                    label={isEs ? 'Resolución Escalada' : 'Scaled Resolution'}
                    value={`${aspectResult.targetW} × ${aspectResult.targetH}`}
                    hint="px"
                    accent
                  />
                  <ToolMetricTile
                    label={isEs ? 'Megapíxeles' : 'Megapixels'}
                    value={`${aspectResult.mp} MP`}
                  />
                </div>
              )}
            </ToolResultsPanel>
          }
        />
      )}

      {/* 10. File Download & Bandwidth Tool */}
      {activeTool === 'file-size-bandwidth-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Tamaño de Archivo y Velocidad' : 'File Size & Bandwidth'}
              subtitle={
                isEs
                  ? 'Calcula el tiempo estimado de transferencia en distintas velocidades de red.'
                  : 'Calculate estimated file transfer duration across connection speeds.'
              }
              onReset={() => {
                setFileSizeInput('10');
                setFileSizeUnit('GB');
                setSpeedInput('100');
                setSpeedUnit('Mbps');
              }}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Tamaño del Archivo' : 'File Size'} htmlFor="tw-bw-size">
                <div className="flex gap-2">
                  <input
                    id="tw-bw-size"
                    type="number"
                    min={0.01}
                    step="any"
                    value={fileSizeInput}
                    onChange={(e) => setFileSizeInput(e.target.value)}
                    className="ui-input font-mono"
                  />
                  <select
                    aria-label={isEs ? 'Unidad de archivo' : 'File size unit'}
                    value={fileSizeUnit}
                    onChange={(e) => setFileSizeUnit(e.target.value as 'MB' | 'GB' | 'TB')}
                    className="ui-select w-28 shrink-0"
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'Velocidad de Conexión' : 'Connection Speed'} htmlFor="tw-bw-speed">
                <div className="flex gap-2">
                  <input
                    id="tw-bw-speed"
                    type="number"
                    min={0.01}
                    step="any"
                    value={speedInput}
                    onChange={(e) => setSpeedInput(e.target.value)}
                    className="ui-input font-mono"
                  />
                  <select
                    aria-label={isEs ? 'Unidad de velocidad' : 'Speed unit'}
                    value={speedUnit}
                    onChange={(e) => setSpeedUnit(e.target.value as 'Mbps' | 'Gbps' | 'MBps')}
                    className="ui-select w-28 shrink-0"
                  >
                    <option value="Mbps">Mbps</option>
                    <option value="Gbps">Gbps</option>
                    <option value="MBps">MB/s</option>
                  </select>
                </div>
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Tiempo Estimado de Descarga' : 'Estimated Download Time'}
              state={downloadTransfer.state}
              errorTitle={isEs ? 'Valores no válidos' : 'Invalid Transfer Inputs'}
              errorMessage={
                isEs
                  ? 'Tanto el tamaño del archivo como la velocidad deben ser mayores que 0.'
                  : 'Both file size and connection speed must be greater than 0.'
              }
              primaryLabel={isEs ? 'Duración de Transferencia' : 'Transfer Duration'}
              primaryValue={downloadTransfer.state === 'ready' ? downloadTransfer.formatted : '—'}
              primarySubtext={
                downloadTransfer.state === 'ready'
                  ? isEs
                    ? `Total ${downloadTransfer.seconds} segundos (${downloadTransfer.minutes} min)`
                    : `Total ${downloadTransfer.seconds} seconds (${downloadTransfer.minutes} minutes)`
                  : undefined
              }
              statusLabel={isEs ? 'Teórico máximo' : 'Peak rate'}
              statusTone="accent"
              copyText={
                downloadTransfer.state === 'ready'
                  ? `${fileSizeInput} ${fileSizeUnit} @ ${speedInput} ${speedUnit} = ${downloadTransfer.formatted} (${downloadTransfer.seconds}s)`
                  : ''
              }
              copyLabel={isEs ? 'Copiar Resultado' : 'Copy Result'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              {downloadTransfer.state === 'ready' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <ToolMetricTile label={isEs ? 'Volumen (MB)' : 'Payload (MB)'} value={downloadTransfer.sizeInMB.toLocaleString()} accent />
                  <ToolMetricTile label={isEs ? 'Tasa (Mbps)' : 'Throughput (Mbps)'} value={String(downloadTransfer.speedInMbps)} />
                </div>
              )}
            </ToolResultsPanel>
          }
        />
      )}

      {/* 11. Color Converter & Picker */}
      {activeTool === 'color-converter-picker' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Selector y Conversor de Color' : 'HEX, RGB, HSL & CMYK Color Input'}
              subtitle={
                isEs
                  ? 'Convierte entre espacios de color e inspecciona relaciones de contraste WCAG.'
                  : 'Convert color spaces and inspect WCAG contrast ratios on white and black.'
              }
              onReset={() => setHexColor(DEFAULT_HEX_COLOR)}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup
                label={isEs ? 'Código HEX' : 'HEX Color Code'}
                htmlFor="tw-color-hex"
                error={
                  colorData.state === 'error'
                    ? isEs
                      ? 'Introduce un HEX de 3 o 6 dígitos (ej. #2563EB).'
                      : 'Enter a valid 3- or 6-digit HEX code (e.g. #2563EB).'
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    aria-label={isEs ? 'Selector visual de color' : 'Visual color picker'}
                    value={colorData.state === 'ready' ? colorData.hex : DEFAULT_HEX_COLOR}
                    onChange={(e) => setHexColor(e.target.value.toUpperCase())}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
                  />
                  <input
                    id="tw-color-hex"
                    type="text"
                    value={hexColor}
                    onChange={(e) => setHexColor(e.target.value.toUpperCase())}
                    maxLength={7}
                    className="ui-input font-mono uppercase"
                  />
                </div>
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Coordenadas de Color' : 'Color Coordinates & Contrast'}
              state={colorData.state}
              errorTitle={isEs ? 'Color HEX no válido' : 'Invalid HEX Color'}
              errorMessage={isEs ? 'Usa formato #RGB o #RRGGBB válido.' : 'Use valid #RGB or #RRGGBB hexadecimal notation.'}
              primaryLabel="HEX"
              primaryValue={colorData.state === 'ready' ? colorData.hex : '—'}
              primarySubtext={
                colorData.state === 'ready' ? `${colorData.rgb} · ${colorData.hsl}` : undefined
              }
              statusLabel="WCAG"
              statusTone="accent"
              copyText={
                colorData.state === 'ready'
                  ? `HEX: ${colorData.hex}\nRGB: ${colorData.rgb}\nHSL: ${colorData.hsl}\nCMYK: ${colorData.cmyk}`
                  : ''
              }
              copyLabel={isEs ? 'Copiar Todos' : 'Copy All'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              {colorData.state === 'ready' && (
                <div className="space-y-4">
                  <div
                    className="h-20 rounded-xl border border-border-main flex items-center justify-center font-mono text-sm font-bold"
                    style={{
                      backgroundColor: colorData.hex,
                      color: colorData.isLight ? '#0F172A' : '#FFFFFF'
                    }}
                  >
                    {colorData.hex}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { label: 'HEX', val: colorData.hex },
                      { label: 'RGB', val: colorData.rgb },
                      { label: 'HSL', val: colorData.hsl },
                      { label: 'CMYK', val: colorData.cmyk }
                    ].map((fmt) => (
                      <div
                        key={fmt.label}
                        className="p-3 rounded-xl border border-border-subtle bg-surface-secondary flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-text-tertiary">{fmt.label}</div>
                          <div className="font-mono text-xs font-bold text-text-primary truncate">{fmt.val}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fmt.val, fmt.label)}
                          aria-label={`Copy ${fmt.label}`}
                          className="text-accent hover:underline shrink-0 cursor-pointer"
                        >
                          {copiedKey === fmt.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ToolMetricTile label={isEs ? 'Contraste / Blanco' : 'Contrast on White'} value={`${colorData.contrastOnWhite}:1`} accent />
                    <ToolMetricTile label={isEs ? 'Contraste / Negro' : 'Contrast on Black'} value={`${colorData.contrastOnBlack}:1`} />
                  </div>
                </div>
              )}
            </ToolResultsPanel>
          }
        />
      )}

      {/* 12. URL Encoder & Decoder (internal switcher view) */}
      {activeTool === 'url-encoder-decoder' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Codificador / Decodificador URL' : 'URL Percent Encoder / Decoder'}
              subtitle={
                isEs
                  ? 'Codifica caracteres reservados de URI o decodifica parámetros de consulta.'
                  : 'Encode reserved URI characters for query parameters or decode percent-encoded URLs.'
              }
              onClear={() => setUrlInput('')}
              onReset={() => {
                setUrlInput(DEFAULT_URL_INPUT);
                setUrlMode('encode');
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Modo' : 'Mode'}>
                <ToolSegmentedControl<'encode' | 'decode'>
                  ariaLabel={isEs ? 'Modo URL' : 'URL mode'}
                  value={urlMode}
                  onChange={setUrlMode}
                  options={[
                    { value: 'encode', label: isEs ? 'Codificar' : 'Encode' },
                    { value: 'decode', label: isEs ? 'Decodificar' : 'Decode' }
                  ]}
                />
              </ToolFieldGroup>

              <ToolFieldGroup label={isEs ? 'URL o Parámetro' : 'Input URL / Parameter'} htmlFor="tw-url-input" error={urlResult.error ?? undefined}>
                <textarea
                  id="tw-url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  rows={5}
                  className="ui-input font-mono text-xs resize-y"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={urlMode === 'encode' ? (isEs ? 'URL Codificada' : 'Encoded URL String') : isEs ? 'URL Decodificada' : 'Decoded URL String'}
              state={urlResult.state}
              errorTitle={isEs ? 'Secuencia URI Inválida' : 'Invalid URI Sequence'}
              errorMessage={urlResult.error ?? undefined}
              primaryLabel={urlMode === 'encode' ? 'encodeURIComponent' : 'decodeURIComponent'}
              primaryValue={`${urlResult.output.length}`}
              primaryUnit={isEs ? 'caracteres' : 'chars'}
              statusTone="accent"
              copyText={urlResult.output}
              copyLabel={isEs ? 'Copiar' : 'Copy'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary whitespace-pre-wrap break-all select-all">
                {urlResult.output}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 13. HTML Entity Converter */}
      {activeTool === 'html-entity-converter' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Conversor de Entidades HTML' : 'HTML Entity Encoder & Decoder'}
              subtitle={
                isEs
                  ? 'Convierte caracteres especiales a entidades (&lt;, &gt;, &amp;, &quot;, &#39;, &copy;) y viceversa.'
                  : 'Convert special characters to HTML entities (&lt;, &gt;, &amp;, &quot;, &#39;, &copy;) and back.'
              }
              onClear={() => setHtmlInput('')}
              onReset={() => {
                setHtmlInput(DEFAULT_HTML_INPUT);
                setHtmlMode('encode');
              }}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Modo' : 'Mode'}>
                <ToolSegmentedControl<'encode' | 'decode'>
                  ariaLabel={isEs ? 'Modo entidades HTML' : 'HTML entity mode'}
                  value={htmlMode}
                  onChange={setHtmlMode}
                  options={[
                    { value: 'encode', label: isEs ? 'Codificar Entidades' : 'Encode Entities' },
                    { value: 'decode', label: isEs ? 'Decodificar Entidades' : 'Decode Entities' }
                  ]}
                />
              </ToolFieldGroup>

              <ToolFieldGroup
                label={
                  htmlMode === 'encode'
                    ? isEs
                      ? 'HTML / Texto Sin Escapar'
                      : 'Raw HTML / Text'
                    : isEs
                      ? 'Entrada con Entidades HTML'
                      : 'HTML Entities Input'
                }
                htmlFor="tw-html-input"
              >
                <textarea
                  id="tw-html-input"
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  rows={8}
                  className="ui-input font-mono text-xs resize-y leading-relaxed"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Resultado Procesado' : 'Converted Output'}
              state={htmlOutput ? 'ready' : 'empty'}
              primaryLabel={htmlMode === 'encode' ? (isEs ? 'Entidades Escapadas' : 'Escaped Entities') : isEs ? 'Texto Decodificado' : 'Decoded Text'}
              primaryValue={String(htmlOutput.length)}
              primaryUnit={isEs ? 'caracteres' : 'chars'}
              statusLabel={htmlMode === 'encode' ? 'Encoded' : 'Decoded'}
              statusTone="accent"
              copyText={htmlOutput}
              copyLabel={isEs ? 'Copiar Salida' : 'Copy Output'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-html-output"
                className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary whitespace-pre-wrap break-all max-h-[340px] overflow-auto select-all"
              >
                {htmlOutput}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 14. QR Code Payload Generator */}
      {activeTool === 'qr-code-payload-generator' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Formateador de Payload QR y Wi-Fi' : 'QR Schema Payload Builder'}
              subtitle={
                isEs
                  ? 'Construye esquemas estándar de carga QR para URLs, redes Wi-Fi, texto y correo.'
                  : 'Generate standardized QR schema strings for URLs, Wi-Fi networks, notes, and mailto links.'
              }
              onReset={() => {
                setQrType('url');
                setQrUrl('https://calctools.io');
                setWifiSsid('CalcTools_Guest_5G');
                setWifiPass('FastCalculations2026');
                setWifiAuth('WPA');
                setQrText('Quick note payload for QR scan');
                setEmailTo('support@calctools.io');
                setEmailSubject('Engineering Feedback');
              }}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Tipo de Esquema QR' : 'QR Schema Type'}>
                <ToolSegmentedControl<'url' | 'wifi' | 'text' | 'email'>
                  ariaLabel={isEs ? 'Tipo de carga QR' : 'QR payload type'}
                  value={qrType}
                  onChange={setQrType}
                  options={[
                    { value: 'url', label: isEs ? 'URL Web' : 'Website URL' },
                    { value: 'wifi', label: 'Wi-Fi' },
                    { value: 'text', label: isEs ? 'Texto' : 'Plain Text' },
                    { value: 'email', label: 'Email' }
                  ]}
                />
              </ToolFieldGroup>

              {qrType === 'url' && (
                <ToolFieldGroup label={isEs ? 'URL Destino' : 'Target URL'} htmlFor="tw-qr-url">
                  <input id="tw-qr-url" type="text" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} className="ui-input font-mono text-sm" />
                </ToolFieldGroup>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-3">
                  <ToolFieldGroup label={isEs ? 'Nombre de Red (SSID)' : 'Network SSID'} htmlFor="tw-wifi-ssid">
                    <input id="tw-wifi-ssid" type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="ui-input" />
                  </ToolFieldGroup>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ToolFieldGroup label={isEs ? 'Contraseña' : 'Password'} htmlFor="tw-wifi-pass">
                      <input id="tw-wifi-pass" type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="ui-input font-mono" />
                    </ToolFieldGroup>
                    <ToolFieldGroup label={isEs ? 'Cifrado' : 'Encryption'} htmlFor="tw-wifi-auth">
                      <select
                        id="tw-wifi-auth"
                        value={wifiAuth}
                        onChange={(e) => setWifiAuth(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                        className="ui-select"
                      >
                        <option value="WPA">WPA/WPA2/WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">{isEs ? 'Sin Contraseña (Abierta)' : 'No Password (Open)'}</option>
                      </select>
                    </ToolFieldGroup>
                  </div>
                </div>
              )}

              {qrType === 'text' && (
                <ToolFieldGroup label={isEs ? 'Mensaje de Texto' : 'Text Message'} htmlFor="tw-qr-text">
                  <textarea id="tw-qr-text" value={qrText} onChange={(e) => setQrText(e.target.value)} rows={4} className="ui-input resize-y" />
                </ToolFieldGroup>
              )}

              {qrType === 'email' && (
                <div className="space-y-3">
                  <ToolFieldGroup label={isEs ? 'Correo Destinatario' : 'Recipient Email'} htmlFor="tw-qr-email">
                    <input id="tw-qr-email" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="ui-input" />
                  </ToolFieldGroup>
                  <ToolFieldGroup label={isEs ? 'Asunto' : 'Subject'} htmlFor="tw-qr-subject">
                    <input id="tw-qr-subject" type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="ui-input" />
                  </ToolFieldGroup>
                </div>
              )}
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Cadena de Payload QR' : 'Standard Formatted QR Payload'}
              state={qrPayload ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Esquema' : 'Schema Type'}
              primaryValue={qrType.toUpperCase()}
              primaryUnit={`${new TextEncoder().encode(qrPayload).length} B`}
              statusLabel={isEs ? 'Listo para QR' : 'QR Ready'}
              statusTone="accent"
              copyText={qrPayload}
              copyLabel={isEs ? 'Copiar Payload' : 'Copy Payload'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-qr-payload"
                className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary whitespace-pre-wrap break-all select-all"
              >
                {qrPayload}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 15. SQL Formatter (developerToolsEngine) */}
      {activeTool === 'sql-formatter' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Consulta SQL de Entrada' : 'Raw SQL Query'}
              subtitle={
                isEs
                  ? 'Formatea consultas SQL con palabras clave en mayúsculas e indentación estructurada.'
                  : 'Format SQL queries with standardized uppercase clauses and clean indentation.'
              }
              onClear={() => setSqlInput('')}
              onReset={() => setSqlInput(DEFAULT_SQL_INPUT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'SQL Original' : 'SQL Input'} htmlFor="tw-sql-input">
                <textarea
                  id="tw-sql-input"
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  rows={8}
                  className="ui-input font-mono text-xs resize-y leading-relaxed"
                />
              </ToolFieldGroup>
              <button
                type="button"
                disabled={!sqlFormatted.formatted}
                onClick={() => downloadBlob(sqlFormatted.formatted + '\n', 'formatted.sql', 'application/sql;charset=utf-8')}
                className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isEs ? 'Descargar .sql' : 'Download .sql'}
              </button>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'SQL Formateado' : 'Formatted SQL Output'}
              state={sqlFormatted.formatted ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Dialecto' : 'Dialect'}
              primaryValue={sqlFormatted.dialect.toUpperCase()}
              primaryUnit={`${sqlFormatted.formatted.split('\n').length} ${isEs ? 'líneas' : 'lines'}`}
              statusLabel="SQL"
              statusTone="accent"
              copyText={sqlFormatted.formatted}
              copyLabel={isEs ? 'Copiar SQL' : 'Copy SQL'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-sql-output"
                className="p-3.5 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[340px] leading-relaxed select-all"
              >
                {sqlFormatted.formatted}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 16. Markdown Previewer (developerToolsEngine + zero-XSS safe React preview) */}
      {activeTool === 'markdown-preview-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Editor Markdown' : 'Markdown Source'}
              subtitle={
                isEs
                  ? 'Previsualiza Markdown de forma segura y exporta el código HTML generado.'
                  : 'Preview Markdown safely in real time and export generated HTML markup.'
              }
              onClear={() => setMarkdownInput('')}
              onReset={() => setMarkdownInput(DEFAULT_MARKDOWN_INPUT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Fuente Markdown' : 'Markdown Source'} htmlFor="tw-md-input">
                <textarea
                  id="tw-md-input"
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  rows={8}
                  className="ui-input font-mono text-xs resize-y leading-relaxed"
                />
              </ToolFieldGroup>
              <button
                type="button"
                disabled={!markdownHtmlExport}
                onClick={() => downloadBlob(markdownHtmlExport, 'markdown-export.html', 'text/html;charset=utf-8')}
                className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isEs ? 'Descargar HTML' : 'Download HTML'}
              </button>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Vista Previa y HTML' : 'Live Preview & HTML Export'}
              state={markdownInput.trim() ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Salida HTML' : 'HTML Output'}
              primaryValue={`${markdownHtmlExport.length}`}
              primaryUnit={isEs ? 'caracteres' : 'chars'}
              statusLabel={isEs ? 'Seguro (sin XSS)' : 'XSS-Safe Preview'}
              statusTone="accent"
              copyText={markdownHtmlExport}
              copyLabel={isEs ? 'Copiar HTML' : 'Copy HTML'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-4">
                <div
                  data-testid="tw-md-preview"
                  className="p-4 rounded-xl border border-border-main bg-surface-secondary min-h-[120px] max-h-[240px] overflow-auto"
                >
                  <SafeMarkdownBlocks source={markdownInput} />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5">
                    {isEs ? 'HTML Generado (developerToolsEngine)' : 'Generated HTML Markup'}
                  </span>
                  <pre className="p-3 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary overflow-x-auto max-h-[160px] whitespace-pre-wrap break-all select-all">
                    {markdownHtmlExport}
                  </pre>
                </div>
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 17. Color Shade & Tint Generator (developerToolsEngine) */}
      {activeTool === 'color-shade-tint-tool' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Color Base para Tonos y Matices' : 'Base Color for Shades & Tints'}
              subtitle={
                isEs
                  ? 'Genera un espectro completo de 11 tonos (5 tintes, base y 5 sombras).'
                  : 'Generate a complete 11-step spectrum (5 tints, base color, and 5 shades).'
              }
              onReset={() => setPaletteHex(DEFAULT_HEX_COLOR)}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup
                label={isEs ? 'Color Base (HEX)' : 'Base HEX Color'}
                htmlFor="tw-shade-hex"
                error={
                  !isPaletteHexValid
                    ? isEs
                      ? 'Introduce un código HEX válido (#RGB o #RRGGBB).'
                      : 'Enter a valid #RGB or #RRGGBB hex color.'
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    aria-label={isEs ? 'Selector de color base' : 'Base color picker'}
                    value={isPaletteHexValid ? (paletteHex.startsWith('#') && paletteHex.length === 7 ? paletteHex : DEFAULT_HEX_COLOR) : DEFAULT_HEX_COLOR}
                    onChange={(e) => setPaletteHex(e.target.value.toUpperCase())}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border-main bg-surface p-1"
                  />
                  <input
                    id="tw-shade-hex"
                    type="text"
                    value={paletteHex}
                    onChange={(e) => setPaletteHex(e.target.value.toUpperCase())}
                    maxLength={7}
                    className="ui-input font-mono uppercase"
                  />
                </div>
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Espectro de 11 Tonos' : '11-Step Shade & Tint Spectrum'}
              state={isPaletteHexValid ? 'ready' : 'error'}
              errorTitle={isEs ? 'HEX no válido' : 'Invalid HEX Code'}
              errorMessage={isEs ? 'Usa formato #RRGGBB válido.' : 'Provide a valid #RRGGBB hexadecimal code.'}
              primaryLabel={isEs ? 'Muestras Generadas' : 'Generated Steps'}
              primaryValue={String(colorShades.length)}
              primaryUnit="HEX"
              statusTone="accent"
              copyText={colorShades.map((s) => `${s.name}: ${s.hex}`).join('\n')}
              copyLabel={isEs ? 'Copiar Paleta' : 'Copy Palette'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {colorShades.map((shade: devEngine.ColorShade, i: number) => {
                  const lightBg = getRelativeLuminance(shade.hex) > 0.45;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copyToClipboard(shade.hex, `shade-${i}`)}
                      aria-label={isEs ? `Copiar ${shade.name} (${shade.hex})` : `Copy ${shade.name} (${shade.hex})`}
                      className="rounded-xl border border-border-main bg-surface-secondary p-2 text-left transition-transform hover:scale-[1.01] cursor-pointer"
                    >
                      <div
                        className="w-full h-11 rounded-lg border border-black/10 dark:border-white/15 flex items-end justify-end p-1.5"
                        style={{ backgroundColor: shade.hex }}
                      >
                        <span className={`text-[10px] font-mono font-bold ${lightBg ? 'text-slate-900' : 'text-white'}`}>
                          {copiedKey === `shade-${i}` ? (isEs ? 'Copiado' : 'Copied') : shade.hex}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[11px] font-medium text-text-secondary truncate">{shade.name}</div>
                    </button>
                  );
                })}
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 18. SVG Path Inspector (developerToolsEngine) */}
      {activeTool === 'svg-path-inspector' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Datos de Ruta SVG (d="...")' : 'SVG Path Data Input'}
              subtitle={
                isEs
                  ? 'Analiza comandos de ruta SVG, nodos numéricos y tokens de dibujo.'
                  : 'Analyze SVG path command strings, numeric coordinates, and command tokens.'
              }
              onClear={() => setSvgPathInput('')}
              onReset={() => setSvgPathInput(DEFAULT_SVG_PATH)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label='SVG d="..." Path' htmlFor="tw-svg-input">
                <textarea
                  id="tw-svg-input"
                  rows={5}
                  value={svgPathInput}
                  onChange={(e) => setSvgPathInput(e.target.value)}
                  className="ui-input font-mono text-xs resize-y"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Análisis de Ruta SVG' : 'SVG Path Inspection'}
              state={svgPathInput.trim() ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Comandos Detectados' : 'Commands Detected'}
              primaryValue={String(svgAnalysis.commandsCount)}
              primaryUnit="SVG 1.1"
              primarySubtext={`${svgAnalysis.nodeCount} ${isEs ? 'nodos numéricos' : 'numeric nodes'}`}
              statusLabel="SVG 1.1"
              statusTone="accent"
              copyText={`Commands: ${svgAnalysis.commandsCount} | Nodes: ${svgAnalysis.nodeCount} | Tokens: ${svgAnalysis.tokens.join(' ')}`}
              copyLabel={isEs ? 'Copiar Análisis' : 'Copy Summary'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <ToolMetricTile label={isEs ? 'Comandos' : 'Commands'} value={String(svgAnalysis.commandsCount)} accent />
                  <ToolMetricTile label={isEs ? 'Nodos Numéricos' : 'Numeric Nodes'} value={String(svgAnalysis.nodeCount)} />
                </div>
                {svgAnalysis.tokens.length > 0 && (
                  <div className="p-3 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-text-primary">
                    <span className="text-text-tertiary mr-2">{isEs ? 'Tokens:' : 'Tokens:'}</span>
                    {svgAnalysis.tokens.join(' · ')}
                  </div>
                )}
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 19. Advanced Text Readability Analyzer (developerToolsEngine) */}
      {activeTool === 'text-statistics-analyzer' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Analizador de Legibilidad Flesch-Kincaid' : 'Readability Text Input'}
              subtitle={
                isEs
                  ? 'Calcula el grado Flesch-Kincaid, nivel de lectura, palabras y sílabas.'
                  : 'Calculate Flesch-Kincaid grade score, reading level, words, and syllables.'
              }
              onClear={() => setReadabilityText('')}
              onReset={() => setReadabilityText(DEFAULT_READABILITY_TEXT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Texto a Evaluar' : 'Sample Text'} htmlFor="tw-readability-input">
                <textarea
                  id="tw-readability-input"
                  value={readabilityText}
                  onChange={(e) => setReadabilityText(e.target.value)}
                  rows={7}
                  className="ui-input text-sm resize-y leading-relaxed"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Puntuación de Legibilidad' : 'Readability Analysis'}
              state={readabilityText.trim() ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Grado Flesch-Kincaid' : 'Flesch-Kincaid Grade'}
              primaryValue={String(readabilityAnalysis.fleschKincaid)}
              primaryUnit={readabilityAnalysis.gradeLevel}
              statusLabel="Flesch-Kincaid"
              statusTone="accent"
              copyText={`Flesch-Kincaid Grade: ${readabilityAnalysis.fleschKincaid} (${readabilityAnalysis.gradeLevel}) | Words: ${readabilityAnalysis.words} | Sentences: ${readabilityAnalysis.sentences} | Syllables: ${readabilityAnalysis.syllables}`}
              copyLabel={isEs ? 'Copiar Informe' : 'Copy Report'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <ToolMetricTile label={isEs ? 'Palabras' : 'Total Words'} value={String(readabilityAnalysis.words)} accent />
                  <ToolMetricTile label={isEs ? 'Oraciones' : 'Sentences'} value={String(readabilityAnalysis.sentences)} />
                </div>
                <ToolBreakdownList
                  items={[
                    { label: isEs ? 'Nivel de Lectura' : 'Reading Level', value: readabilityAnalysis.gradeLevel, highlight: true },
                    { label: isEs ? 'Sílabas Estimadas' : 'Estimated Syllables', value: String(readabilityAnalysis.syllables) }
                  ]}
                />
              </div>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 20. ASCII Banner Generator (developerToolsEngine) */}
      {activeTool === 'ascii-banner-generator' && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={isEs ? 'Generador de Banner ASCII' : 'ASCII Banner Text'}
              subtitle={
                isEs
                  ? 'Convierte cadenas de texto en tipografía de banner ASCII monoespaciada.'
                  : 'Convert text strings into monospace ASCII art banner typography.'
              }
              onClear={() => setAsciiText('')}
              onReset={() => setAsciiText(DEFAULT_ASCII_TEXT)}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolFieldGroup label={isEs ? 'Texto del Banner' : 'Banner Text'} htmlFor="tw-ascii-input">
                <input
                  id="tw-ascii-input"
                  type="text"
                  value={asciiText}
                  onChange={(e) => setAsciiText(e.target.value)}
                  className="ui-input font-mono uppercase"
                />
              </ToolFieldGroup>
              <button
                type="button"
                disabled={!asciiBanner}
                onClick={() => downloadBlob(asciiBanner, 'ascii-banner.txt', 'text/plain;charset=utf-8')}
                className="ui-btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isEs ? 'Descargar .txt' : 'Download .txt'}
              </button>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Banner ASCII Generado' : 'Generated ASCII Banner'}
              state={asciiBanner ? 'ready' : 'empty'}
              primaryLabel={isEs ? 'Etiqueta' : 'Banner Label'}
              primaryValue={asciiText.trim().toUpperCase() || '—'}
              statusLabel="ASCII"
              statusTone="accent"
              copyText={asciiBanner}
              copyLabel={isEs ? 'Copiar ASCII' : 'Copy ASCII'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              <pre
                data-testid="tw-ascii-output"
                className="p-4 rounded-xl border border-border-main bg-surface-secondary font-mono text-xs text-accent overflow-x-auto whitespace-pre leading-snug select-all"
              >
                {asciiBanner}
              </pre>
            </ToolResultsPanel>
          }
        />
      )}

      {/* 21–45. Advanced Web & SEO Performance Tools (adv-web-*, 25 IDs via developerToolsEngine) */}
      {activeTool.startsWith('adv-web-') && (
        <ToolSplitWorkspace
          ratio="6-6"
          inputs={
            <ToolInputPanel
              title={
                isEs
                  ? `Parámetros: ${advToolReadableName}`
                  : `${advToolReadableName} Parameters`
              }
              subtitle={
                isEs
                  ? 'Motor determinista de rendimiento web y optimización SEO.'
                  : 'Deterministic web performance & technical SEO optimization engine.'
              }
              onClear={() => setAdvMetricInput('')}
              onReset={() => setAdvMetricInput('100')}
              clearLabel={isEs ? 'Limpiar' : 'Clear'}
              resetLabel={isEs ? 'Restablecer' : 'Reset'}
            >
              <ToolPresetBar
                label={isEs ? 'Escenarios' : 'Sample volumes'}
                presets={[
                  { label: '50', onSelect: () => setAdvMetricInput('50') },
                  { label: '100', onSelect: () => setAdvMetricInput('100') },
                  { label: '250', onSelect: () => setAdvMetricInput('250') },
                  { label: '500', onSelect: () => setAdvMetricInput('500') }
                ]}
              />

              <ToolFieldGroup
                label={
                  isEs
                    ? 'Parámetro Métrico de Entrada (Volumen / Tamaño / ms)'
                    : 'Metric Input Parameter (Sample Volume / Size / ms)'
                }
                htmlFor="tw-adv-metric-input"
                error={
                  !isAdvEmpty && !isAdvValid
                    ? isEs
                      ? 'Introduce un valor numérico positivo mayor que 0.'
                      : 'Enter a positive numeric value greater than 0.'
                    : undefined
                }
              >
                <input
                  id="tw-adv-metric-input"
                  type="number"
                  min={1}
                  step="any"
                  value={advMetricInput}
                  onChange={(e) => setAdvMetricInput(e.target.value)}
                  className="ui-input font-mono text-sm"
                />
              </ToolFieldGroup>
            </ToolInputPanel>
          }
          results={
            <ToolResultsPanel
              title={isEs ? 'Resultado de Rendimiento Web' : 'Web Performance Analysis'}
              state={isAdvEmpty ? 'empty' : isAdvValid ? 'ready' : 'error'}
              emptyTitle={isEs ? 'Introduce un valor métrico' : 'Enter a metric value'}
              emptyDescription={
                isEs
                  ? 'Indica un volumen, tamaño o latencia para modelar el impacto.'
                  : 'Provide a sample volume, size, or latency to model performance impact.'
              }
              errorTitle={isEs ? 'Valor métrico inválido' : 'Invalid Metric Input'}
              errorMessage={
                isEs
                  ? 'El parámetro de entrada debe ser un número positivo mayor que 0.'
                  : 'The input parameter must be a positive number greater than 0.'
              }
              primaryLabel={isEs ? 'Resultado Calculado' : 'Computed Metric'}
              primaryValue={advResult ? advResult.primary : '—'}
              primarySubtext={`${advToolReadableName} · Input: ${advMetricInput}`}
              statusLabel="SEO / Perf"
              statusTone="accent"
              copyText={
                advResult
                  ? `${advToolReadableName}: ${advResult.primary} | ${advResult.secondary.join(' | ')}`
                  : ''
              }
              copyLabel={isEs ? 'Copiar Resultado' : 'Copy Result'}
              copiedLabel={isEs ? 'Copiado' : 'Copied'}
            >
              {advResult && (
                <ToolBreakdownList
                  items={advResult.secondary.map((entry: string, idx: number) => {
                    const sepIdx = entry.indexOf(':');
                    if (sepIdx !== -1) {
                      return {
                        label: entry.slice(0, sepIdx).trim(),
                        value: entry.slice(sepIdx + 1).trim(),
                        highlight: idx === 0
                      };
                    }
                    return { label: `#${idx + 1}`, value: entry };
                  })}
                />
              )}
            </ToolResultsPanel>
          }
        />
      )}
    </div>
  );
}
