import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import { CalculatorId, CalculatorMeta } from '../../types.ts';
import ToolIconBadge from './ToolIconBadge.tsx';

export interface CompactToolCardProps {
  tool: CalculatorMeta;
  title?: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  isFavorite?: boolean;
  onSelect: (id: CalculatorId) => void;
  onToggleFavorite?: (id: CalculatorId) => void;
  compact?: boolean;
  favoriteAddLabel?: string;
  favoriteRemoveLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  onHoverEnter?: (tool: CalculatorMeta, rect: DOMRect, categoryLabel?: string) => void;
  onHoverLeave?: () => void;
  isPreviewActive?: boolean;
}

export default function CompactToolCard({
  tool,
  title,
  categoryLabel,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  compact = false,
  favoriteAddLabel = 'Save to favorites',
  favoriteRemoveLabel = 'Remove from favorites',
  className = '',
  style,
  onHoverEnter,
  onHoverLeave,
  isPreviewActive = false
}: CompactToolCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const lastPointerTypeRef = useRef<string>('mouse');
  const displayTitle = title || tool.name;

  const handlePointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && onHoverEnter) {
      onHoverEnter(tool, e.currentTarget.getBoundingClientRect(), categoryLabel);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && onHoverLeave) {
      onHoverLeave();
    }
  };

  const handleMainClick = () => {
    if (
      (lastPointerTypeRef.current === 'touch' || lastPointerTypeRef.current === 'pen') &&
      onHoverEnter &&
      cardRef.current
    ) {
      if (!isPreviewActive) {
        onHoverEnter(tool, cardRef.current.getBoundingClientRect(), categoryLabel);
        lastPointerTypeRef.current = 'mouse';
        return;
      }
    }
    lastPointerTypeRef.current = 'mouse';
    onSelect(tool.id as CalculatorId);
  };

  const activeRingClass = isPreviewActive ? 'ring-2 ring-accent border-accent bg-surface-hover shadow-md' : '';

  if (compact) {
    return (
      <div
        data-tool-card-id={tool.id}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`ui-card ui-card-interactive relative flex items-center justify-between gap-2 p-2.5 sm:p-3 group ${activeRingClass} ${className}`}
        style={style}
      >
        <button
          type="button"
          onClick={() => onSelect(tool.id as CalculatorId)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer rounded-lg"
        >
          <ToolIconBadge tool={tool} size="compact" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
              {displayTitle}
            </div>
            {categoryLabel && (
              <div className="text-[11px] text-text-tertiary dark:text-[#9AADC2] truncate mt-0.5">
                {categoryLabel}
              </div>
            )}
          </div>
        </button>

        {onToggleFavorite && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onHoverLeave?.();
              onToggleFavorite(tool.id as CalculatorId);
            }}
            aria-label={isFavorite ? favoriteRemoveLabel : favoriteAddLabel}
            aria-pressed={isFavorite}
            title={isFavorite ? favoriteRemoveLabel : favoriteAddLabel}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isFavorite
                ? 'text-amber-500 hover:bg-amber-500/10'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  return (
    <article
      ref={cardRef}
      data-tool-card-id={tool.id}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`ui-card ui-card-interactive relative w-full min-w-0 h-[86px] flex items-center justify-between gap-2.5 px-3.5 py-2.5 group ${activeRingClass} ${className}`}
      style={style}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          lastPointerTypeRef.current = e.pointerType;
        }}
        onKeyDown={() => {
          lastPointerTypeRef.current = 'mouse';
        }}
        onClick={handleMainClick}
        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer rounded-lg"
      >
        <ToolIconBadge tool={tool} size="md" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-text-primary group-hover:text-accent transition-colors line-clamp-2 break-words">
            {displayTitle}
          </h3>
        </div>
      </button>

      {/* Favorite button placed as a clean sibling control (no nested buttons) */}
      {onToggleFavorite && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onHoverLeave?.();
            onToggleFavorite(tool.id as CalculatorId);
          }}
          aria-label={isFavorite ? favoriteRemoveLabel : favoriteAddLabel}
          aria-pressed={isFavorite}
          title={isFavorite ? favoriteRemoveLabel : favoriteAddLabel}
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
            isFavorite
              ? 'text-amber-500 hover:bg-amber-500/10'
              : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      )}
    </article>
  );
}
