import React from 'react';
import { CalculatorMeta } from '../../types.ts';
import CalculatorIcon from './CalculatorIcon.tsx';
import PdfToolIcon from './PdfToolIcon.tsx';
import { getPdfToolIconConfig, PDF_ICON_PALETTES } from './pdfIconRegistry.ts';

export type ToolIconBadgeSize = 'xs' | 'sm' | 'md' | 'compact' | 'lg' | 'xl';

interface ToolIconBadgeProps {
  tool: Pick<CalculatorMeta, 'id' | 'category' | 'iconName'> & {
    iconColor?: string;
    iconBg?: string;
  };
  size?: ToolIconBadgeSize;
  className?: string;
}

const SIZE_PRESETS: Record<
  ToolIconBadgeSize,
  {
    container: string;
    pdfSvg: string;
    lucideIcon: string;
  }
> = {
  xs: {
    container: 'w-7 h-7 rounded-md',
    pdfSvg: 'w-[22px] h-[22px]',
    lucideIcon: 'w-3.5 h-3.5 stroke-[2.1] dark:brightness-125'
  },
  sm: {
    container: 'w-8 h-8 rounded-lg',
    pdfSvg: 'w-[24px] h-[24px]',
    lucideIcon: 'w-4 h-4 stroke-[2.1] dark:brightness-125'
  },
  compact: {
    container: 'w-9 h-9 rounded-lg',
    pdfSvg: 'w-[27px] h-[27px]',
    lucideIcon: 'w-4 h-4 stroke-[2.1] dark:brightness-125'
  },
  md: {
    container: 'w-9 h-9 rounded-[10px]',
    pdfSvg: 'w-[28px] h-[28px]',
    lucideIcon: 'w-[18px] h-[18px] stroke-[2.1] dark:brightness-125'
  },
  lg: {
    container: 'w-10 h-10 rounded-xl',
    pdfSvg: 'w-[30px] h-[30px]',
    lucideIcon: 'w-5 h-5 stroke-[2.1] dark:brightness-125'
  },
  xl: {
    container: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl',
    pdfSvg: 'w-9 h-9 sm:w-10 sm:h-10',
    lucideIcon: 'w-5 h-5 sm:w-6 sm:h-6 stroke-[2.1] dark:brightness-125'
  }
};

/**
 * Unified tool icon badge:
 * - Renders the colorful function-specific PDF vector icon family for all PDF Suite tools.
 * - Preserves the exact existing icon badge presentation for every other category.
 */
export default function ToolIconBadge({
  tool,
  size = 'md',
  className = ''
}: ToolIconBadgeProps) {
  const preset = SIZE_PRESETS[size];
  const pdfConfig = getPdfToolIconConfig(tool.id, tool.category);

  if (pdfConfig) {
    const palette = PDF_ICON_PALETTES[pdfConfig.palette];
    return (
      <div
        className={`${preset.container} flex items-center justify-center shrink-0 border ${palette.tileClass} ${className}`}
      >
        <PdfToolIcon config={pdfConfig} className={preset.pdfSvg} />
      </div>
    );
  }

  const accentColor = tool.iconColor || '#159B69';
  return (
    <div
      className={`${preset.container} flex items-center justify-center shrink-0 border border-border-subtle/70 ${className}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${accentColor} 13%, transparent)`,
        color: accentColor
      }}
    >
      <CalculatorIcon name={tool.iconName} className={preset.lucideIcon} />
    </div>
  );
}
