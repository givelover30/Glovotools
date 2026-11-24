import { useState, useMemo, useId } from 'react';
import { Binary, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface FormulaItem {
  category: string;
  title: string;
  formula: string;
  description: string;
}

const FORMULAS: FormulaItem[] = [
  { category: 'Algebra', title: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', description: 'Solves quadratic equations of form ax² + bx + c = 0' },
  { category: 'Algebra', title: 'Slope-Intercept Form', formula: 'y = mx + b', description: 'm is slope, b is y-intercept' },
  { category: 'Algebra', title: 'Logarithm Product Rule', formula: 'log_b(xy) = log_b(x) + log_b(y)', description: 'Logarithm property of multiplication' },
  { category: 'Geometry', title: 'Circle Area', formula: 'A = πr²', description: 'r is the radius of the circle' },
  { category: 'Geometry', title: 'Sphere Volume', formula: 'V = (4/3)πr³', description: 'Volume of a 3D sphere' },
  { category: 'Geometry', title: 'Pythagorean Theorem', formula: 'a² + b² = c²', description: 'For right-angled triangles where c is hypotenuse' },
  { category: 'Trigonometry', title: 'Sine Law', formula: 'a / sin(A) = b / sin(B) = c / sin(C)', description: 'Relates triangle side lengths to angles' },
  { category: 'Trigonometry', title: 'Cosine Law', formula: 'c² = a² + b² - 2ab cos(C)', description: 'Relates all three sides of a triangle to one angle' },
  { category: 'Calculus', title: 'Power Rule (Derivative)', formula: 'd/dx (xⁿ) = n·xⁿ⁻¹', description: 'Standard polynomial differentiation' },
  { category: 'Calculus', title: 'Integration by Parts', formula: '∫ u dv = uv - ∫ v du', description: 'Calculus integration technique' },
  { category: 'Calculus', title: "Euler's Identity", formula: 'e^(iπ) + 1 = 0', description: 'Fundamental relationship in complex analysis' },
  { category: 'Constants', title: 'Speed of Light (c)', formula: '299,792,458 m/s', description: 'Fundamental physical constant in vacuum' },
  { category: 'Constants', title: 'Planck Constant (h)', formula: '6.626 × 10⁻³⁴ J·s', description: 'Quantum mechanics constant' },
  { category: 'Constants', title: 'Gravitational Constant (G)', formula: '6.674 × 10⁻¹¹ m³/(kg·s²)', description: 'Newtonian constant of gravitation' },
  { category: 'Constants', title: 'Avogadro Constant (N_A)', formula: '6.022 × 10²³ mol⁻¹', description: 'Number of constituent particles in one mole' }
];

export default function MathFormulasReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return FORMULAS;
    return FORMULAS.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [query]);

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTitle(title);
    window.setTimeout(() => setCopiedTitle(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Binary className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar fórmulas matemáticas' : 'Search math formulas'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar fórmulas o constantes...'
                : 'Search math formulas or constants...'
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
            {filtered.length} / {FORMULAS.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin fórmulas coincidentes' : 'No matching formulas'}
          description={
            isEs
              ? 'Prueba buscando por tema (Algebra, Calculus) o nombre de fórmula.'
              : 'Try searching by topic (Algebra, Calculus) or formula title.'
          }
          action={
            <UiButton variant="secondary" size="sm" onClick={() => setQuery('')}>
              {isEs ? 'Limpiar filtro' : 'Clear search'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.title}
              className="ui-card ui-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <UiStatusLabel tone="accent">{item.category}</UiStatusLabel>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`${item.title}: ${item.formula} - ${item.description}`, item.title)
                    }
                    aria-label={isEs ? `Copiar ${item.title}` : `Copy ${item.title}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer"
                  >
                    {copiedTitle === item.title ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                <div className="bg-surface-secondary border border-border-subtle text-accent font-mono tabular-nums text-sm p-3 rounded-xl overflow-x-auto">
                  {item.formula}
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
