import { useState, useMemo, useId } from 'react';
import { Maximize2, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface SizeItem {
  name: string;
  category: 'ISO Paper Sizes' | 'US Paper Sizes' | 'Screen Resolutions';
  dimensions: string;
  pixelsOrDetails: string;
  description: string;
}

const SIZE_ITEMS: SizeItem[] = [
  { name: 'A4', category: 'ISO Paper Sizes', dimensions: '210 × 297 mm', pixelsOrDetails: '8.27 × 11.69 in', description: 'Standard international letter and document paper size.' },
  { name: 'A3', category: 'ISO Paper Sizes', dimensions: '297 × 420 mm', pixelsOrDetails: '11.69 × 16.53 in', description: 'Double the size of A4, used for blueprints, posters, and charts.' },
  { name: 'A5', category: 'ISO Paper Sizes', dimensions: '148 × 210 mm', pixelsOrDetails: '5.83 × 8.27 in', description: 'Half the size of A4, commonly used for notebooks and flyers.' },
  { name: 'US Letter', category: 'US Paper Sizes', dimensions: '215.9 × 279.4 mm', pixelsOrDetails: '8.5 × 11.0 in', description: 'Standard standard paper size in North America for business and school.' },
  { name: 'US Legal', category: 'US Paper Sizes', dimensions: '215.9 × 355.6 mm', pixelsOrDetails: '8.5 × 14.0 in', description: 'Longer format used for legal contracts and documents.' },
  { name: 'HD (1080p)', category: 'Screen Resolutions', dimensions: '1920 × 1080 px', pixelsOrDetails: '16:9 Aspect Ratio', description: 'Standard Full High Definition display resolution for monitors and video.' },
  { name: '4K Ultra HD', category: 'Screen Resolutions', dimensions: '3840 × 2160 px', pixelsOrDetails: '16:9 Aspect Ratio', description: 'High-resolution display standard for modern TVs, 4K monitors, and cameras.' },
  { name: 'Mobile Smartphone', category: 'Screen Resolutions', dimensions: '390 × 844 px', pixelsOrDetails: 'iPhone 14/15 logical viewport', description: 'Typical responsive mobile device CSS viewport screen resolution.' },
  { name: 'Tablet / iPad', category: 'Screen Resolutions', dimensions: '810 × 1080 px', pixelsOrDetails: 'iPad 10.2" logical viewport', description: 'Standard tablet responsive breakpoint resolution.' }
];

const CATEGORIES = ['all', 'ISO Paper Sizes', 'US Paper Sizes', 'Screen Resolutions'] as const;

export default function PaperResolutionReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SIZE_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.dimensions.toLowerCase().includes(q) ||
        item.pixelsOrDetails.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, selectedCategory]);

  const handleCopy = (item: SizeItem) => {
    navigator.clipboard?.writeText(`${item.name}: ${item.dimensions} (${item.pixelsOrDetails})`);
    setCopiedName(item.name);
    window.setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="ui-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Maximize2 className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar tamaño de papel o resolución' : 'Search paper size or resolution'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar tamaño o resolución (ej. A4, Letter, 1080p)...'
                : 'Search paper size or resolution (e.g. A4, Letter, 4K, Mobile)...'
            }
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={isEs ? 'Limpiar búsqueda' : 'Clear search'}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono tabular-nums text-text-secondary">
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <span>
              {filtered.length}/{SIZE_ITEMS.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {cat === 'all' ? (isEs ? 'Todas' : 'All Types') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sizes & Resolutions */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin tamaños ni resoluciones coincidentes' : 'No matching sizes or resolutions'}
          description={
            isEs
              ? 'Restaura los filtros o prueba con A4, Letter o 4K.'
              : 'Reset filters or try A4, Letter, 1080p, or 4K.'
          }
          action={
            <UiButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
            >
              {isEs ? 'Restaurar filtros' : 'Reset filters'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.name}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <UiStatusLabel tone={item.category === 'Screen Resolutions' ? 'success' : 'accent'}>
                    {item.category}
                  </UiStatusLabel>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    aria-label={isEs ? `Copiar medida ${item.name}` : `Copy size info ${item.name}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedName === item.name ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-bold text-text-primary">{item.name}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="bg-surface-secondary border border-border-subtle p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 font-mono tabular-nums text-xs">
                  <span className="font-bold text-text-primary">{item.dimensions}</span>
                  <span className="text-text-secondary">{item.pixelsOrDetails}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
