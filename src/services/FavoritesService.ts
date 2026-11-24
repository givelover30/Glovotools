import { CalculatorId, CategoryId } from '../types.ts';

export interface GlobalFavorites {
  calculators: CalculatorId[];
  categories: CategoryId[];
  subcategories: string[];
}

const STORAGE_KEY = 'calctools_global_favorites';
const LEGACY_CALC_KEY = 'calctools_favorite_calculators';
const LEGACY_CAT_KEY = 'calctools_favorite_categories';

export const FavoritesService = {
  getFavorites(): GlobalFavorites {
    if (typeof window === 'undefined') {
      return { calculators: [], categories: [], subcategories: [] };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          calculators: Array.isArray(parsed.calculators) ? parsed.calculators : [],
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
          subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : [],
        };
      }
      // Migrate legacy keys if present
      let legacyCalcs: CalculatorId[] = [];
      let legacyCats: CategoryId[] = [];
      try {
        const cSaved = localStorage.getItem(LEGACY_CALC_KEY);
        if (cSaved) legacyCalcs = JSON.parse(cSaved);
      } catch {}
      try {
        const catSaved = localStorage.getItem(LEGACY_CAT_KEY);
        if (catSaved) legacyCats = JSON.parse(catSaved);
      } catch {}

      const initial: GlobalFavorites = {
        calculators: Array.isArray(legacyCalcs) ? legacyCalcs : [],
        categories: Array.isArray(legacyCats) ? legacyCats : [],
        subcategories: [],
      };
      FavoritesService.saveFavorites(initial);
      return initial;
    } catch {
      return { calculators: [], categories: [], subcategories: [] };
    }
  },

  saveFavorites(favorites: GlobalFavorites): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  },

  toggleCalculator(id: CalculatorId): GlobalFavorites {
    const favs = FavoritesService.getFavorites();
    const exists = favs.calculators.includes(id);
    const updated = {
      ...favs,
      calculators: exists ? favs.calculators.filter(c => c !== id) : [...favs.calculators, id],
    };
    FavoritesService.saveFavorites(updated);
    return updated;
  },

  toggleCategory(id: CategoryId): GlobalFavorites {
    const favs = FavoritesService.getFavorites();
    const exists = favs.categories.includes(id);
    const updated = {
      ...favs,
      categories: exists ? favs.categories.filter(c => c !== id) : [...favs.categories, id],
    };
    FavoritesService.saveFavorites(updated);
    return updated;
  },

  toggleSubcategory(id: string): GlobalFavorites {
    const favs = FavoritesService.getFavorites();
    const exists = favs.subcategories.includes(id);
    const updated = {
      ...favs,
      subcategories: exists ? favs.subcategories.filter(s => s !== id) : [...favs.subcategories, id],
    };
    FavoritesService.saveFavorites(updated);
    return updated;
  },

  clearAll(): GlobalFavorites {
    const empty: GlobalFavorites = { calculators: [], categories: [], subcategories: [] };
    FavoritesService.saveFavorites(empty);
    return empty;
  }
};
