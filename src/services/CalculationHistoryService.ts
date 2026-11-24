import { CalculatorId } from '../types.ts';

export interface CalculationHistoryItem {
  id: string;
  calculatorId: CalculatorId | string;
  calculatorName: string;
  timestamp: string;
  inputs: Record<string, unknown>;
  primaryResult: {
    label: string;
    value: string;
  };
  summaryText?: string;
}

const STORAGE_KEY = 'calctools_calculation_history';
const MAX_HISTORY_ITEMS = 5;

// In-memory fallback for SSR / Node test environment where localStorage is absent
let memoryStore: CalculationHistoryItem[] = [];

export const CalculationHistoryService = {
  getHistory(): CalculationHistoryItem[] {
    if (typeof window === 'undefined') {
      return memoryStore.slice(0, MAX_HISTORY_ITEMS);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_HISTORY_ITEMS);
        }
      }
    } catch {
      // Ignore storage errors
    }
    return memoryStore.slice(0, MAX_HISTORY_ITEMS);
  },

  addRecord(record: Omit<CalculationHistoryItem, 'id' | 'timestamp'>): CalculationHistoryItem[] {
    const current = CalculationHistoryService.getHistory();
    const newItem: CalculationHistoryItem = {
      ...record,
      id: `calc_hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
    memoryStore = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  },

  clearHistory(): CalculationHistoryItem[] {
    memoryStore = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    return [];
  }
};
