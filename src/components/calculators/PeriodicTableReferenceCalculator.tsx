import { useState, useMemo, useId } from 'react';
import { Atom, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: string;
  category: string;
}

const ELEMENTS: ElementData[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: '1.008', category: 'Reactive Nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', mass: '4.003', category: 'Noble Gas' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: '6.94', category: 'Alkali Metal' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: '9.012', category: 'Alkaline Earth Metal' },
  { number: 5, symbol: 'B', name: 'Boron', mass: '10.81', category: 'Metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: '12.011', category: 'Reactive Nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: '14.007', category: 'Reactive Nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: '15.999', category: 'Reactive Nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: '18.998', category: 'Halogen' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: '20.180', category: 'Noble Gas' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: '22.990', category: 'Alkali Metal' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.305', category: 'Alkaline Earth Metal' },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: '26.982', category: 'Post-transition Metal' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: '28.085', category: 'Metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: '30.974', category: 'Reactive Nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: '32.06', category: 'Reactive Nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: '35.45', category: 'Halogen' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: '39.95', category: 'Noble Gas' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: '39.098', category: 'Alkali Metal' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: '40.078', category: 'Alkaline Earth Metal' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: '55.845', category: 'Transition Metal' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: '63.546', category: 'Transition Metal' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: '65.38', category: 'Transition Metal' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: '107.87', category: 'Transition Metal' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: '196.97', category: 'Transition Metal' },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: '200.59', category: 'Transition Metal' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: '238.03', category: 'Actinide' }
];

export default function PeriodicTableReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ELEMENTS;
    return ELEMENTS.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.symbol.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.number.toString().includes(q)
    );
  }, [query]);

  const handleCopy = (text: string, symbol: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSymbol(symbol);
    window.setTimeout(() => setCopiedSymbol(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Atom className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar elemento químico' : 'Search chemical element'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar elemento por nombre, símbolo o número...'
                : 'Search element by name, symbol, or atomic number...'
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
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Search className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-xs font-mono tabular-nums text-text-secondary">
            {filtered.length} / {ELEMENTS.length}
          </span>
        </div>
      </div>

      {/* Elements Grid */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin elementos coincidentes' : 'No matching elements'}
          description={
            isEs
              ? 'Prueba buscando por nombre (Gold), símbolo (Au) o número atómico (79).'
              : 'Try searching by name (Gold), symbol (Au), or atomic number (79).'
          }
          action={
            <UiButton variant="secondary" size="sm" onClick={() => setQuery('')}>
              {isEs ? 'Limpiar filtro' : 'Clear search'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((el) => (
            <div
              key={el.number}
              className="ui-card ui-card-interactive p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-accent-light border border-accent/25 text-accent font-mono font-bold text-lg flex items-center justify-center shrink-0">
                  {el.symbol}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono tabular-nums text-text-tertiary">
                      #{el.number}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary truncate">{el.name}</h4>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <UiStatusLabel tone="neutral">{el.category}</UiStatusLabel>
                    <span className="text-[11px] font-mono tabular-nums text-text-secondary">
                      {el.mass} u
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${el.name} (${el.symbol}) - Atomic Number: ${el.number}, Mass: ${el.mass}, Category: ${el.category}`,
                    el.symbol
                  )
                }
                aria-label={isEs ? `Copiar ${el.name}` : `Copy ${el.name}`}
                className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
              >
                {copiedSymbol === el.symbol ? (
                  <Check className="w-4 h-4 text-status-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
