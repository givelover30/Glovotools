import { useState, useMemo, useId } from 'react';
import { Terminal, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface SyntaxItem {
  concept: string;
  javascript: string;
  python: string;
  java: string;
  description: string;
}

const SYNTAX_ITEMS: SyntaxItem[] = [
  { concept: 'Print / Output', javascript: 'console.log("Hello");', python: 'print("Hello")', java: 'System.out.println("Hello");', description: 'Outputs text or values to the standard output console.' },
  { concept: 'Variable Declaration', javascript: 'let x = 10; const y = 20;', python: 'x = 10\ny = 20', java: 'int x = 10;\nfinal int y = 20;', description: 'Declares mutable and immutable variables.' },
  { concept: 'For Loop', javascript: 'for (let i = 0; i < 5; i++) { }', python: 'for i in range(5):', java: 'for (int i = 0; i < 5; i++) { }', description: 'Iterates a block of code a specified number of times.' },
  { concept: 'If / Else Condition', javascript: 'if (x > 0) { } else { }', python: 'if x > 0:\n    pass\nelse:\n    pass', java: 'if (x > 0) { } else { }', description: 'Conditional branching based on boolean expressions.' },
  { concept: 'Function Definition', javascript: 'function add(a, b) {\n  return a + b;\n}', python: 'def add(a, b):\n    return a + b', java: 'int add(int a, int b) {\n    return a + b;\n}', description: 'Defines a reusable block of executable code.' },
  { concept: 'Array / List creation', javascript: 'const arr = [1, 2, 3];', python: 'arr = [1, 2, 3]', java: 'int[] arr = {1, 2, 3};', description: 'Stores ordered collections of elements.' },
  { concept: 'Dictionary / Map', javascript: 'const map = { key: "value" };', python: 'd = {"key": "value"}', java: 'Map<String, String> m = new HashMap<>();', description: 'Stores key-value data lookup pairs.' },
  { concept: 'Try / Catch Exception', javascript: 'try { } catch (e) { }', python: 'try:\n    pass\nexcept Exception as e:\n    pass', java: 'try { } catch (Exception e) { }', description: 'Handles runtime exceptions safely.' }
];

export default function ProgrammingSyntaxReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [copiedConcept, setCopiedConcept] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return SYNTAX_ITEMS;
    return SYNTAX_ITEMS.filter(
      (item) =>
        item.concept.toLowerCase().includes(q) ||
        item.javascript.toLowerCase().includes(q) ||
        item.python.toLowerCase().includes(q) ||
        item.java.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query]);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedConcept(key);
    window.setTimeout(() => setCopiedConcept(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search Bar */}
      <div className="ui-panel p-4 flex items-center gap-3">
        <Terminal className="w-4 h-4 text-accent shrink-0" />
        <label htmlFor={searchId} className="sr-only">
          {isEs ? 'Buscar concepto de programación' : 'Search programming concept'}
        </label>
        <input
          id={searchId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isEs
              ? 'Buscar concepto de programación (ej. loop, function, variable)...'
              : 'Search programming concept (e.g. loop, function, array, print)...'
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
            {filtered.length}/{SYNTAX_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Grid of Syntax Comparisons */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin conceptos coincidentes' : 'No matching syntax concepts'}
          description={
            isEs
              ? 'Limpia la búsqueda o prueba con loop, array o try.'
              : 'Clear search or try loop, array, map, or try.'
          }
          action={
            <UiButton variant="secondary" size="sm" onClick={() => setQuery('')}>
              {isEs ? 'Limpiar búsqueda' : 'Clear search'}
            </UiButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const blocks = [
              { id: '-js', label: 'JavaScript / TypeScript', code: item.javascript },
              { id: '-py', label: 'Python', code: item.python },
              { id: '-java', label: 'Java', code: item.java }
            ];
            return (
              <div
                key={item.concept}
                className="ui-card ui-card-interactive p-5 space-y-4"
              >
                <div>
                  <h4 className="text-base font-bold text-text-primary">{item.concept}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {blocks.map((block) => {
                    const copyKey = `${item.concept}${block.id}`;
                    const isCopied = copiedConcept === copyKey;
                    return (
                      <div key={block.id} className="space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-text-secondary">
                          <span className="truncate">{block.label}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(block.code, copyKey)}
                            aria-label={`${isEs ? 'Copiar' : 'Copy'} ${block.label} ${item.concept}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-status-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{isCopied ? (isEs ? 'Copiado' : 'Copied') : isEs ? 'Copiar' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="bg-surface-secondary border border-border-subtle p-3 rounded-xl font-mono text-xs text-text-primary overflow-x-auto whitespace-pre-wrap break-words">
                          {block.code}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
