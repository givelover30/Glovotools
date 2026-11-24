import React, { useMemo } from 'react';
import { Layers, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { LANGUAGES } from '../../i18n/translations.ts';
import { getAllCategories } from '../../data/categories/categoryDiscovery.ts';

interface OdometerStatsBannerProps {
  categoriesCount?: number;
  languagesCount?: number;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reduced;
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  nl: 'nl-NL',
  pl: 'pl-PL'
};

function formatLocaleAriaNumber(value: number, language: string): string {
  try {
    return value.toLocaleString(LOCALE_MAP[language] || 'en-US');
  } catch {
    return String(value);
  }
}

function CornerScrew({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${className} w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#eef3f0] via-[#838e89] to-[#2e3633] border border-black/70 shadow-[0_1px_2px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.75)] flex items-center justify-center z-20`}
    >
      <span className="w-[70%] h-[1.5px] bg-[#1a201e]/85 rounded-full -rotate-45" />
    </span>
  );
}

function OdometerDigitWheel({
  digitChar,
  reducedMotion
}: {
  digitChar: string;
  reducedMotion: boolean;
}) {
  const numericDigit = Math.min(9, Math.max(0, parseInt(digitChar, 10) || 0));

  return (
    <div
      className="relative w-[33px] min-[400px]:w-[38px] md:w-[34px] lg:w-[40px] h-[48px] min-[400px]:h-[54px] md:h-[48px] lg:h-[56px] rounded-[6px] overflow-hidden border border-white/10 shrink-0"
      style={{
        background:
          'linear-gradient(180deg, #020202 0%, #111413 18%, #2a2f2c 38%, #151917 58%, #090b0a 82%, #010101 100%)',
        boxShadow:
          'inset 0 8px 10px rgba(0,0,0,0.95), inset 0 -8px 10px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.08)'
      }}
    >
      {/* Rolling Vertical Digit Drum */}
      <div
        className="flex flex-col will-change-transform motion-reduce:transition-none"
        style={{
          transform: `translateY(-${numericDigit * 10}%)`,
          transition: reducedMotion
            ? 'none'
            : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {DIGITS.map((d) => (
          <div
            key={d}
            className="h-[48px] min-[400px]:h-[54px] md:h-[48px] lg:h-[56px] w-full flex items-center justify-center text-[24px] min-[400px]:text-[28px] md:text-[26px] lg:text-[30px] font-bold text-white leading-none tracking-tight select-none tabular-nums"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Subtle Upper Glass Reflection & Center Drum Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-white/[0.02] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/15"
      />
    </div>
  );
}

function renderFormattedLabel(label: string) {
  if (!label) return null;
  if (label.includes(' / ')) {
    const [part1, part2] = label.split(' / ');
    return (
      <>
        <span>{part1} /</span>
        <br />
        <span>{part2}</span>
      </>
    );
  }
  return label;
}

function OdometerCounterPanel({
  icon,
  label,
  value,
  padLength = 3,
  language,
  reducedMotion,
  labelClassName = '',
  supportingText = ''
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  padLength?: number;
  language: string;
  reducedMotion: boolean;
  labelClassName?: string;
  supportingText?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(reducedMotion ? value : 0);

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 150);
    return () => clearTimeout(timer);
  }, [value, reducedMotion]);

  const safeValue = Math.max(0, Math.floor(displayValue));
  const paddedDigits = useMemo(
    () => String(safeValue).padStart(padLength, '0').split(''),
    [safeValue, padLength]
  );
  const ariaValue = useMemo(
    () => formatLocaleAriaNumber(safeValue, language),
    [safeValue, language]
  );

  return (
    <div
      className="relative w-full rounded-[20px] p-[3px] shadow-[0_14px_34px_rgba(0,0,0,0.65),0_0_26px_rgba(16,245,140,0.28)]"
      style={{
        background:
          'linear-gradient(155deg, #d2dbd7 0%, #5c6863 22%, #1d2522 50%, #55615c 78%, #b9c4bf 100%)'
      }}
      aria-label={`${label}: ${ariaValue}`}
    >
      {/* Inner Dark Chassis + Neon Green Illuminated Frame */}
      <div className="relative rounded-[17px] bg-[#04120c] p-[3px] overflow-hidden">
        {/* Top & Bottom Neon Specular Edge Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#7dffc4] to-transparent opacity-90 blur-[0.5px] z-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#00e887] to-transparent opacity-80 blur-[0.5px] z-20"
        />

        {/* Corner Screws */}
        <CornerScrew className="top-2 left-2" />
        <CornerScrew className="top-2 right-2" />
        <CornerScrew className="bottom-2 left-2" />
        <CornerScrew className="bottom-2 right-2" />

        {/* Illuminated Emerald Interior Faceplate */}
        <div
          className="kpi-card relative rounded-[14px] border border-[#10f58c]/75 px-3 min-[400px]:px-3.5 md:px-4 py-3.5 min-[400px]:py-4 flex items-center justify-between gap-2 overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 35% 15%, rgba(16, 185, 129, 0.22) 0%, rgba(4, 34, 21, 0.94) 52%, rgba(2, 12, 8, 0.98) 100%)',
            boxShadow:
              'inset 0 0 18px rgba(16, 245, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.14)'
          }}
        >
          {/* Subtle Glass Reflection Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/25"
          />

          {/* Left Group: [Icon] [Vertical Stack: Label + SupportingText] */}
          <div className="relative z-10 flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 text-[#00eb8c] drop-shadow-[0_0_10px_rgba(0,235,140,0.55)]">
              {icon}
            </div>
            <div className="text-left min-w-0 flex flex-col gap-1">
              <span className={`block text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.04em] lg:tracking-[0.06em] text-white leading-[1.2] break-normal w-auto min-w-max ${labelClassName}`}>
                {renderFormattedLabel(label)}
              </span>
              {supportingText && (
                <span className="text-[10px] sm:text-[11px] text-emerald-300/80 font-normal">
                  {supportingText}
                </span>
              )}
            </div>
          </div>

          {/* Flexible Spacer */}
          <div className="flex-1 min-w-[16px]" />

          {/* Right Group: [Counter] */}
          <div className="relative z-10 shrink-0 flex items-center">
            <div
              className="rounded-[10px] p-[2px]"
              style={{
                background:
                  'linear-gradient(180deg, #98a29e 0%, #313835 50%, #6d7773 100%)',
                boxShadow:
                  'inset 0 2px 5px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)'
              }}
            >
              <div className="rounded-[8px] bg-[#040605] p-[2px] flex items-center gap-[3px]">
                {paddedDigits.map((digitChar, idx) => (
                  <OdometerDigitWheel
                    key={idx}
                    digitChar={digitChar}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OdometerStatsBannerProps {
  categoriesCount?: number;
  languagesCount?: number;
}

export default function OdometerStatsBanner({
  categoriesCount,
  languagesCount
}: OdometerStatsBannerProps) {
  const { language } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();

  const resolvedCategoriesCount =
    typeof categoriesCount === 'number'
      ? categoriesCount
      : getAllCategories().length;

  const resolvedLanguagesCount =
    typeof languagesCount === 'number'
      ? languagesCount
      : LANGUAGES.length;

  return (
    <div className="w-full max-w-[900px] mx-auto px-0.5 sm:px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 items-stretch">
        {/* KPI CARD 1 — CATEGORIES AVAILABLE */}
        <OdometerCounterPanel
          icon={<Layers className="w-7 h-7 min-[400px]:w-8 min-[400px]:h-8 md:w-7 md:h-7 lg:w-9 lg:h-9 stroke-[2.2]" />}
          label="CATEGORIES / AVAILABLE"
          value={resolvedCategoriesCount}
          padLength={2}
          language={language}
          reducedMotion={reducedMotion}
          supportingText={language === 'es' ? 'Explora nuestras categorías' : 'Explore our categories'}
        />

        {/* KPI CARD 2 — LANGUAGES AVAILABLE */}
        <OdometerCounterPanel
          icon={<Globe className="w-7 h-7 min-[400px]:w-8 min-[400px]:h-8 md:w-7 md:h-7 lg:w-9 lg:h-9 stroke-[2.2]" />}
          label="LANGUAGES / AVAILABLE"
          value={resolvedLanguagesCount}
          padLength={2}
          language={language}
          reducedMotion={reducedMotion}
          supportingText={language === 'es' ? `Disponible en ${resolvedLanguagesCount} idiomas` : `Available in ${resolvedLanguagesCount} languages`}
          labelClassName="w-min max-w-full"
        />
      </div>
    </div>
  );
}
