import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Layers, Search, X } from 'lucide-react';
import { CategoryId, CategoryMeta } from '../../types.ts';
import HomeCategoryCard from '../home/HomeCategoryCard.tsx';
import { getLocalizedCategory } from '../../i18n/esTranslations.ts';

interface DirectoryCategoryBrowserProps {
  categories: CategoryMeta[];
  language: string;
  onSelectCategoryRoute: (catId: CategoryId) => void;
  onNavigateAllCategories?: () => void;
}

export default function DirectoryCategoryBrowser({
  categories,
  language,
  onSelectCategoryRoute,
  onNavigateAllCategories
}: DirectoryCategoryBrowserProps) {
  const isEs = language === 'es';
  const [isExpanded, setIsExpanded] = useState(false);
  const [catFilter, setCatFilter] = useState('');

  const localizedCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => b.count - a.count)
      .map((cat) => getLocalizedCategory(cat, language));
  }, [categories, language]);

  const filteredCategories = useMemo(() => {
    const q = catFilter.trim().toLowerCase();
    if (!q) return localizedCategories;
    return localizedCategories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [localizedCategories, catFilter]);

  const visibleCategories =
    isExpanded || catFilter.trim().length > 0
      ? filteredCategories
      : filteredCategories.slice(0, 8);

  return (
    <section aria-labelledby="directory-categories-heading" className="space-y-3.5 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-accent shrink-0" />
          <h2 id="directory-categories-heading" className="ui-section-title text-base sm:text-lg truncate">
            {isEs ? 'Navegar por Categoría' : 'Browse by Category'}
          </h2>
          <span className="text-xs text-text-tertiary tabular-nums shrink-0">
            ({categories.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isExpanded && (
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                placeholder={isEs ? 'Filtrar categorías...' : 'Filter categories...'}
                aria-label={isEs ? 'Filtrar las 49 categorías' : 'Filter all 49 categories'}
                className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-border-main bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
              {catFilter && (
                <button
                  type="button"
                  onClick={() => setCatFilter('')}
                  aria-label={isEs ? 'Limpiar filtro de categorías' : 'Clear category filter'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsExpanded((prev) => {
                if (prev) setCatFilter('');
                return !prev;
              });
            }}
            aria-expanded={isExpanded}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-xs font-semibold text-text-primary transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>
              {isExpanded
                ? isEs
                  ? 'Mostrar menos'
                  : 'Show fewer'
                : isEs
                ? `Ver todas (${categories.length})`
                : `Show all ${categories.length} categories`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
            )}
          </button>

          {onNavigateAllCategories && (
            <button
              type="button"
              onClick={onNavigateAllCategories}
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{isEs ? 'Directorio de Categorías' : 'Categories page'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <div className="ui-empty-state py-6 text-xs text-text-secondary">
          {isEs
            ? `No hay categorías que coincidan con "${catFilter}".`
            : `No categories match "${catFilter}".`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleCategories.map((cat) => (
            <HomeCategoryCard
              key={cat.id}
              category={cat}
              onSelect={onSelectCategoryRoute}
              toolsCountSuffix={isEs ? 'herramientas' : 'tools'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
