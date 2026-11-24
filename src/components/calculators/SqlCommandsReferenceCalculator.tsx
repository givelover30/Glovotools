import { useState, useMemo, useId } from 'react';
import { Database, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiStatusLabel, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface SqlItem {
  command: string;
  category: 'DDL (Data Definition)' | 'DML (Data Manipulation)' | 'DQL (Data Query)' | 'DCL / TCL';
  syntax: string;
  description: string;
}

const SQL_ITEMS: SqlItem[] = [
  { command: 'SELECT', category: 'DQL (Data Query)', syntax: 'SELECT column1, column2 FROM table_name WHERE condition;', description: 'Extracts data from a database table based on specified filters.' },
  { command: 'INSERT INTO', category: 'DML (Data Manipulation)', syntax: 'INSERT INTO table_name (col1, col2) VALUES (val1, val2);', description: 'Adds new rows of data into a database table.' },
  { command: 'UPDATE', category: 'DML (Data Manipulation)', syntax: 'UPDATE table_name SET col1 = val1 WHERE condition;', description: 'Modifies existing records in a database table.' },
  { command: 'DELETE', category: 'DML (Data Manipulation)', syntax: 'DELETE FROM table_name WHERE condition;', description: 'Removes existing records from a database table.' },
  { command: 'CREATE TABLE', category: 'DDL (Data Definition)', syntax: 'CREATE TABLE table_name (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);', description: 'Defines and creates a new table schema structure.' },
  { command: 'ALTER TABLE', category: 'DDL (Data Definition)', syntax: 'ALTER TABLE table_name ADD COLUMN email VARCHAR(255);', description: 'Modifies an existing database table schema (adding/dropping columns).' },
  { command: 'DROP TABLE', category: 'DDL (Data Definition)', syntax: 'DROP TABLE IF EXISTS table_name;', description: 'Permanently deletes an existing table and all its data.' },
  { command: 'JOIN (INNER / LEFT)', category: 'DQL (Data Query)', syntax: 'SELECT * FROM t1 JOIN t2 ON t1.id = t2.t1_id;', description: 'Combines rows from two or more tables based on a related column between them.' },
  { command: 'GROUP BY & HAVING', category: 'DQL (Data Query)', syntax: 'SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5;', description: 'Groups rows that share a property into summary rows and filters group results.' },
  { command: 'ORDER BY & LIMIT', category: 'DQL (Data Query)', syntax: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 10;', description: 'Sorts result sets in ascending/descending order and caps output rows.' }
];

const CATEGORIES = ['all', 'DQL (Data Query)', 'DML (Data Manipulation)', 'DDL (Data Definition)'] as const;

export default function SqlCommandsReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SQL_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.command.toLowerCase().includes(q) ||
        item.syntax.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, selectedCategory]);

  const handleCopy = (item: SqlItem) => {
    navigator.clipboard?.writeText(item.syntax);
    setCopiedCmd(item.command);
    window.setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getTone = (cat: SqlItem['category']) => {
    if (cat === 'DQL (Data Query)') return 'accent';
    if (cat === 'DML (Data Manipulation)') return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Filter Bar */}
      <div className="ui-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Database className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar comando SQL' : 'Search SQL command'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar comando SQL (ej. SELECT, JOIN, INSERT)...'
                : 'Search SQL command (e.g. SELECT, JOIN, INSERT, CREATE TABLE)...'
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
              {filtered.length}/{SQL_ITEMS.length}
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
                {cat === 'all' ? (isEs ? 'Todas' : 'All Categories') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of SQL Commands */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin comandos SQL coincidentes' : 'No matching SQL commands'}
          description={
            isEs
              ? 'Restaura los filtros o prueba con SELECT, JOIN o CREATE.'
              : 'Reset filters or try SELECT, JOIN, or CREATE.'
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
              key={item.command}
              className="ui-card ui-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <UiStatusLabel tone={getTone(item.category)}>{item.category}</UiStatusLabel>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    aria-label={isEs ? `Copiar sintaxis ${item.command}` : `Copy SQL syntax ${item.command}`}
                    className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {copiedCmd === item.command ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-primary">{item.command}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <pre className="bg-surface-secondary border border-border-subtle p-3 rounded-xl font-mono text-xs text-text-primary overflow-x-auto whitespace-pre-wrap break-words">
                  {item.syntax}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
