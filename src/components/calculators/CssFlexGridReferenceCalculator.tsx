import { useState, useMemo, useId } from 'react';
import { Layout, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface CssRuleItem {
  property: string;
  target: 'Flex Container' | 'Flex Item' | 'Grid Container' | 'Grid Item';
  values: string;
  description: string;
}

const CSS_RULES: CssRuleItem[] = [
  { property: 'display: flex', target: 'Flex Container', values: 'flex / inline-flex', description: 'Defines a flex container and establishes a new flex formatting context.' },
  { property: 'flex-direction', target: 'Flex Container', values: 'row | row-reverse | column | column-reverse', description: 'Establishes the main-axis, defining the direction flex items are placed.' },
  { property: 'justify-content', target: 'Flex Container', values: 'flex-start | flex-end | center | space-between | space-around | space-evenly', description: 'Defines the alignment along the main axis.' },
  { property: 'align-items', target: 'Flex Container', values: 'stretch | flex-start | flex-end | center | baseline', description: 'Defines how flex items are laid out along the cross axis on the current line.' },
  { property: 'flex-wrap', target: 'Flex Container', values: 'nowrap | wrap | wrap-reverse', description: 'Controls whether flex items are forced onto one line or can wrap onto multiple lines.' },
  { property: 'gap', target: 'Flex Container', values: '<length> (e.g. 1rem, 16px)', description: 'Sets the gutters (gaps) between rows and columns.' },
  { property: 'flex', target: 'Flex Item', values: 'flex-grow flex-shrink flex-basis (e.g. 1 1 0%)', description: 'Shorthand for flex-grow, flex-shrink and flex-basis combined.' },
  { property: 'align-self', target: 'Flex Item', values: 'auto | flex-start | flex-end | center | baseline | stretch', description: 'Allows the default alignment (or the one specified by align-items) to be overridden for individual flex items.' },
  { property: 'display: grid', target: 'Grid Container', values: 'grid / inline-grid', description: 'Defines a grid container and establishes a new grid formatting context.' },
  { property: 'grid-template-columns', target: 'Grid Container', values: 'repeat(3, 1fr) / 200px 1fr 2fr', description: 'Defines the columns of the grid with a space-separated list of values.' },
  { property: 'grid-template-rows', target: 'Grid Container', values: 'auto 1fr auto', description: 'Defines the rows of the grid.' },
  { property: 'grid-column', target: 'Grid Item', values: '1 / span 2 / grid-column-end', description: "Determines a grid item's location within the grid by referencing specific grid lines." }
];

const TARGETS = ['all', 'Flex Container', 'Flex Item', 'Grid Container', 'Grid Item'] as const;

export default function CssFlexGridReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [copiedProp, setCopiedProp] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CSS_RULES.filter((item) => {
      const matchesTarget = selectedTarget === 'all' || item.target === selectedTarget;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.property.toLowerCase().includes(q) ||
        item.values.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q);
      return matchesTarget && matchesQuery;
    });
  }, [query, selectedTarget]);

  const handleCopy = (item: CssRuleItem) => {
    navigator.clipboard?.writeText(`${item.property}: ${item.values};`);
    setCopiedProp(item.property);
    window.setTimeout(() => setCopiedProp(null), 2000);
  };

  const getTone = (target: CssRuleItem['target']) => {
    if (target.startsWith('Flex')) return 'accent';
    return 'success';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="ui-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Layout className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar propiedad CSS' : 'Search CSS property'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar propiedad CSS (ej. flex, justify-content, grid)...'
                : 'Search CSS property (e.g. flex, justify-content, grid-template)...'
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
              {filtered.length}/{CSS_RULES.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
          {TARGETS.map((tgt) => {
            const active = selectedTarget === tgt;
            return (
              <button
                key={tgt}
                type="button"
                onClick={() => setSelectedTarget(tgt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {tgt === 'all' ? (isEs ? 'Todas' : 'All Rules') : tgt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of CSS Rules */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin propiedades CSS coincidentes' : 'No matching CSS rules'}
          description={
            isEs
              ? 'Restaura los filtros o prueba con flex, grid o gap.'
              : 'Reset filters or try another term like flex, grid, or gap.'
          }
          action={
            <UiButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setSelectedTarget('all');
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
              key={item.property}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <UiStatusLabel tone={getTone(item.target)}>{item.target}</UiStatusLabel>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    aria-label={isEs ? `Copiar regla ${item.property}` : `Copy CSS rule ${item.property}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedProp === item.property ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-mono font-bold text-text-primary">{item.property}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="bg-surface-secondary border border-border-subtle p-3 rounded-xl font-mono text-xs text-accent break-words [overflow-wrap:anywhere]">
                  <span className="text-text-tertiary">{isEs ? 'Valores: ' : 'Values: '}</span>
                  {item.values}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
