import { useState, useMemo, useId } from 'react';
import { ArrowRightLeft, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface ConversionFactorItem {
  dimension: string;
  fromUnit: string;
  toUnit: string;
  factor: string;
  example: string;
}

const CONVERSION_FACTORS: ConversionFactorItem[] = [
  { dimension: 'Length', fromUnit: '1 Inch (in)', toUnit: 'Millimeters (mm)', factor: '25.4 mm', example: '2 in = 50.8 mm' },
  { dimension: 'Length', fromUnit: '1 Foot (ft)', toUnit: 'Inches (in)', factor: '12 in', example: '5 ft = 60 in' },
  { dimension: 'Length', fromUnit: '1 Yard (yd)', toUnit: 'Meters (m)', factor: '0.9144 m', example: '10 yd = 9.144 m' },
  { dimension: 'Length', fromUnit: '1 Mile (mi)', toUnit: 'Kilometers (km)', factor: '1.60934 km', example: '3 mi = 4.828 km' },
  { dimension: 'Mass', fromUnit: '1 Pound (lb)', toUnit: 'Grams (g)', factor: '453.592 g', example: '2 lb = 907.18 g' },
  { dimension: 'Mass', fromUnit: '1 Ounce (oz)', toUnit: 'Grams (g)', factor: '28.3495 g', example: '8 oz = 226.79 g' },
  { dimension: 'Mass', fromUnit: '1 Kilogram (kg)', toUnit: 'Pounds (lb)', factor: '2.20462 lb', example: '70 kg = 154.32 lb' },
  { dimension: 'Temperature', fromUnit: 'Celsius (°C)', toUnit: 'Fahrenheit (°F)', factor: '(°C × 9/5) + 32', example: '25°C = 77°F' },
  { dimension: 'Temperature', fromUnit: 'Fahrenheit (°F)', toUnit: 'Celsius (°C)', factor: '({°F - 32} × 5/9)', example: '98.6°F = 37°C' },
  { dimension: 'Area', fromUnit: '1 Acre', toUnit: 'Square Meters (m²)', factor: '4,046.86 m²', example: '2 acres = 8,093.7 m²' },
  { dimension: 'Volume', fromUnit: '1 US Gallon (gal)', toUnit: 'Liters (L)', factor: '3.78541 L', example: '5 gal = 18.927 L' },
  { dimension: 'Pressure', fromUnit: '1 Atmosphere (atm)', toUnit: 'Kilopascals (kPa)', factor: '101.325 kPa', example: '1 atm = 101.325 kPa' }
];

const DIMENSIONS = ['all', 'Length', 'Mass', 'Temperature', 'Area', 'Volume', 'Pressure'] as const;

export default function UnitConversionFactorsReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [selectedDim, setSelectedDim] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CONVERSION_FACTORS.filter((item) => {
      const matchesDim = selectedDim === 'all' || item.dimension === selectedDim;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.fromUnit.toLowerCase().includes(q) ||
        item.toUnit.toLowerCase().includes(q) ||
        item.factor.toLowerCase().includes(q) ||
        item.dimension.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q);
      return matchesDim && matchesQuery;
    });
  }, [query, selectedDim]);

  const handleCopy = (item: ConversionFactorItem) => {
    navigator.clipboard?.writeText(`${item.fromUnit} = ${item.factor} (${item.toUnit})`);
    setCopiedKey(item.fromUnit);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="ui-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar factor de conversión' : 'Search conversion factor'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar factor de conversión (ej. Inch, Pound, Celsius)...'
                : 'Search conversion factor (e.g. Inch, Pound, Celsius, Gallon)...'
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
              {filtered.length}/{CONVERSION_FACTORS.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
          {DIMENSIONS.map((dim) => {
            const active = selectedDim === dim;
            return (
              <button
                key={dim}
                type="button"
                onClick={() => setSelectedDim(dim)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {dim === 'all' ? (isEs ? 'Todas' : 'All Dimensions') : dim}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Conversion Factors */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin factores de conversión coincidentes' : 'No matching conversion factors'}
          description={
            isEs
              ? 'Restaura los filtros o prueba con otra unidad o dimensión.'
              : 'Reset filters or try another unit or dimension.'
          }
          action={
            <UiButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery('');
                setSelectedDim('all');
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
              key={`${item.dimension}-${item.fromUnit}`}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <UiStatusLabel tone="accent">{item.dimension}</UiStatusLabel>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    aria-label={
                      isEs ? `Copiar factor ${item.fromUnit}` : `Copy conversion factor ${item.fromUnit}`
                    }
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === item.fromUnit ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text-primary">
                    {item.fromUnit} → {item.toUnit}
                  </h4>
                  <div className="text-xs font-mono tabular-nums font-semibold text-accent">
                    {isEs ? 'Factor: ' : 'Factor: '}
                    {item.factor}
                  </div>
                </div>

                <div className="bg-surface-secondary border border-border-subtle p-2.5 rounded-xl font-mono tabular-nums text-xs text-text-secondary">
                  {isEs ? 'Ejemplo: ' : 'Example: '}
                  {item.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
