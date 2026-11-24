import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FolderOpen, Search, X } from 'lucide-react';
import { CalculatorId, CalculatorMeta, CategoryId, CategoryMeta } from '../../types.ts';
import ToolIconBadge from '../common/ToolIconBadge.tsx';
import { getLocalizedCalculator, getLocalizedCategory } from '../../i18n/esTranslations.ts';

interface DirectorySearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  language: string;
  toolSuggestions: CalculatorMeta[];
  categories: CategoryMeta[];
  categoryTitleMap: Map<string, string>;
  onSelectCalculator: (id: CalculatorId) => void;
  onSelectCategoryRoute?: (catId: CategoryId) => void;
  placeholder: string;
}

type DirectorySuggestion =
  | { type: 'category'; category: CategoryMeta }
  | { type: 'tool'; tool: CalculatorMeta };

export default function DirectorySearchBar({
  query,
  onQueryChange,
  language,
  toolSuggestions,
  categories,
  categoryTitleMap,
  onSelectCalculator,
  onSelectCategoryRoute,
  placeholder
}: DirectorySearchBarProps) {
  const isEs = language === 'es';
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  // Close suggestions dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Reset highlight index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Matching categories (up to 3)
  const matchingCategories = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return categories
      .map((rawCat) => getLocalizedCategory(rawCat, language))
      .filter(
        (cat) =>
          cat.title.toLowerCase().includes(q) ||
          cat.subtitle.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q)
      )
      .slice(0, 3);
  }, [trimmed, categories, language]);

  // Deduplicated display suggestions (does NOT mutate underlying catalog)
  const displayedTools = useMemo(() => {
    if (!trimmed) return [];
    const seen = new Set<string>();
    const list: CalculatorMeta[] = [];
    for (const item of toolSuggestions) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      list.push(item);
      if (list.length >= 6) break;
    }
    return list;
  }, [trimmed, toolSuggestions]);

  const flatSuggestions = useMemo<DirectorySuggestion[]>(() => {
    const items: DirectorySuggestion[] = [];
    if (onSelectCategoryRoute) {
      matchingCategories.forEach((category) => items.push({ type: 'category', category }));
    }
    displayedTools.forEach((tool) => items.push({ type: 'tool', tool }));
    return items;
  }, [matchingCategories, displayedTools, onSelectCategoryRoute]);

  const handleSelectSuggestion = (item: DirectorySuggestion) => {
    if (item.type === 'category') {
      onSelectCategoryRoute?.(item.category.id);
    } else {
      onSelectCalculator(item.tool.id as CalculatorId);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen || flatSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? flatSuggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && flatSuggestions[activeIndex]) {
      e.preventDefault();
      handleSelectSuggestion(flatSuggestions[activeIndex]);
    }
  };

  const listboxId = 'directory-search-suggestions';
  const showDropdown = isOpen && trimmed.length >= 1 && flatSuggestions.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative flex items-center rounded-[10px] border border-border-main bg-surface transition-colors focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--focus-ring)]">
        <Search className="w-4 h-4 text-text-tertiary ml-3.5 shrink-0 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          data-no-focus-ring="true"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `dir-suggestion-${activeIndex}` : undefined
          }
          aria-label={isEs ? 'Buscar en el directorio de herramientas' : 'Search all tools directory'}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 px-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
            className="mr-2 p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl border border-border-main bg-surface dark:bg-surface-elevated shadow-[var(--shadow-md)] p-1.5 space-y-1.5 max-h-[380px] overflow-y-auto animate-fadeIn"
        >
          {onSelectCategoryRoute && matchingCategories.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[11px] font-medium text-text-tertiary flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-accent" />
                <span>{isEs ? 'Categorías' : 'Categories'}</span>
              </div>
              <div className="space-y-0.5">
                {matchingCategories.map((cat, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={cat.id}
                      id={`dir-suggestion-${idx}`}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelectSuggestion({ type: 'category', category: cat })}
                      className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-surface-selected text-accent'
                          : 'hover:bg-surface-hover text-text-primary'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{cat.title}</span>
                      <span className="text-[11px] text-text-tertiary tabular-nums shrink-0">
                        {cat.count.toLocaleString()} {isEs ? 'herramientas' : 'tools'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {displayedTools.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[11px] font-medium text-text-tertiary flex items-center justify-between">
                <span>{isEs ? 'Sugerencias directas' : 'Direct matches'}</span>
                <span className="tabular-nums">
                  {toolSuggestions.length.toLocaleString()} {isEs ? 'resultados' : 'matches'}
                </span>
              </div>
              <div className="space-y-0.5">
                {displayedTools.map((tool, tIdx) => {
                  const flatIdx = (onSelectCategoryRoute ? matchingCategories.length : 0) + tIdx;
                  const isActive = flatIdx === activeIndex;
                  const localized = getLocalizedCalculator(tool, language);
                  const catTitle = categoryTitleMap.get(tool.category);

                  return (
                    <button
                      key={tool.id}
                      id={`dir-suggestion-${flatIdx}`}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      onMouseEnter={() => setActiveIndex(flatIdx)}
                      onClick={() => handleSelectSuggestion({ type: 'tool', tool })}
                      className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-surface-selected text-accent'
                          : 'hover:bg-surface-hover text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ToolIconBadge tool={tool} size="xs" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-text-primary truncate">
                            {localized.name}
                          </div>
                          <div className="text-[11px] text-text-secondary truncate">
                            {catTitle ? `${catTitle} · ` : ''}
                            {localized.shortDesc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isActive ? 'text-accent translate-x-0.5' : 'text-text-tertiary'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
