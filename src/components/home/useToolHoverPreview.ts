import { useState, useRef, useEffect, useCallback } from 'react';
import { CalculatorMeta } from '../../types.ts';

export interface ToolHoverPreviewState {
  tool: CalculatorMeta;
  categoryLabel?: string;
  anchorRect: DOMRect;
}

export function useToolHoverPreview() {
  const [hoverPreviewState, setHoverPreviewState] = useState<ToolHoverPreviewState | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleCardHoverEnter = useCallback(
    (tool: CalculatorMeta, rect: DOMRect, categoryLabel?: string) => {
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }
      hoverTimerRef.current = window.setTimeout(() => {
        setHoverPreviewState({ tool, categoryLabel, anchorRect: rect });
      }, 250);
    },
    []
  );

  const handleCardHoverLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setHoverPreviewState(null);
    }, 220);
  }, []);

  const handleModalMouseEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleModalMouseLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setHoverPreviewState(null);
    }, 200);
  }, []);

  const closePreview = useCallback(() => {
    clearTimers();
    setHoverPreviewState(null);
  }, [clearTimers]);

  // Dismiss preview on outside tap/click (essential for mobile tap-to-preview)
  useEffect(() => {
    if (!hoverPreviewState) return;
    const handleOutsidePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[role="dialog"]')) return;
      if (target.closest(`[data-tool-card-id="${hoverPreviewState.tool.id}"]`)) return;
      setHoverPreviewState(null);
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [hoverPreviewState]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    hoverPreviewState,
    handleCardHoverEnter,
    handleCardHoverLeave,
    handleModalMouseEnter,
    handleModalMouseLeave,
    closePreview
  };
}
