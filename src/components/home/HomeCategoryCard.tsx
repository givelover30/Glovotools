import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CategoryId, CategoryMeta } from '../../types.ts';
import CalculatorIcon from '../common/CalculatorIcon.tsx';

interface HomeCategoryCardProps {
  category: CategoryMeta;
  onSelect: (catId: CategoryId) => void;
  toolsCountSuffix?: string;
}

export default function HomeCategoryCard({
  category,
  onSelect,
  toolsCountSuffix = 'tools'
}: HomeCategoryCardProps) {
  const accentColor = category.iconColor || '#159B69';
  const iconSurfaceStyle: React.CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${accentColor} 13%, transparent)`,
    color: accentColor
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="ui-card ui-card-interactive p-4 text-left flex flex-col justify-between gap-2.5 cursor-pointer group w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-border-subtle/70"
            style={iconSurfaceStyle}
          >
            <CalculatorIcon
              name={category.iconName}
              className="w-4 h-4 stroke-[2.1] dark:brightness-125"
            />
          </div>
          <div className="min-w-0">
            <h3 className="ui-card-title text-[14px] leading-snug text-text-primary group-hover:text-accent transition-colors truncate">
              {category.title}
            </h3>
            {category.count > 0 && (
              <p className="text-[11px] text-text-tertiary dark:text-[#9AADC2] tabular-nums mt-0.5">
                {category.count.toLocaleString()} {toolsCountSuffix}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>

      {(category.description || category.subtitle) && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
          {category.description || category.subtitle}
        </p>
      )}
    </button>
  );
}
