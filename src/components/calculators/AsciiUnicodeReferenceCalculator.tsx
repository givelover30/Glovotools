import { useState, useMemo, useId } from 'react';
import { Code, Search, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton, UiEmptyState } from '../ui/AppPrimitives.tsx';

interface AsciiItem {
  dec: number;
  hex: string;
  oct: string;
  char: string;
  name: string;
}

const ASCII_ITEMS: AsciiItem[] = [
  { dec: 0, hex: '00', oct: '000', char: 'NUL', name: 'Null character' },
  { dec: 9, hex: '09', oct: '011', char: 'HT', name: 'Horizontal Tab' },
  { dec: 10, hex: '0A', oct: '012', char: 'LF', name: 'Line feed' },
  { dec: 13, hex: '0D', oct: '015', char: 'CR', name: 'Carriage return' },
  { dec: 32, hex: '20', oct: '040', char: ' ', name: 'Space' },
  { dec: 33, hex: '21', oct: '041', char: '!', name: 'Exclamation mark' },
  { dec: 34, hex: '22', oct: '042', char: '"', name: 'Quotation mark' },
  { dec: 35, hex: '23', oct: '043', char: '#', name: 'Number sign (Hash)' },
  { dec: 36, hex: '24', oct: '044', char: '$', name: 'Dollar sign' },
  { dec: 37, hex: '25', oct: '045', char: '%', name: 'Percent sign' },
  { dec: 38, hex: '26', oct: '046', char: '&', name: 'Ampersand' },
  { dec: 39, hex: '27', oct: '047', char: "'", name: 'Apostrophe' },
  { dec: 40, hex: '28', oct: '050', char: '(', name: 'Left parenthesis' },
  { dec: 41, hex: '29', oct: '051', char: ')', name: 'Right parenthesis' },
  { dec: 42, hex: '2A', oct: '052', char: '*', name: 'Asterisk' },
  { dec: 43, hex: '2B', oct: '053', char: '+', name: 'Plus sign' },
  { dec: 44, hex: '2C', oct: '054', char: ',', name: 'Comma' },
  { dec: 45, hex: '2D', oct: '055', char: '-', name: 'Hyphen-minus' },
  { dec: 46, hex: '2E', oct: '056', char: '.', name: 'Full stop (Period)' },
  { dec: 47, hex: '2F', oct: '057', char: '/', name: 'Slash' },
  { dec: 48, hex: '30', oct: '060', char: '0', name: 'Digit Zero' },
  { dec: 57, hex: '39', oct: '071', char: '9', name: 'Digit Nine' },
  { dec: 65, hex: '41', oct: '101', char: 'A', name: 'Uppercase A' },
  { dec: 90, hex: '5A', oct: '132', char: 'Z', name: 'Uppercase Z' },
  { dec: 97, hex: '61', oct: '141', char: 'a', name: 'Lowercase a' },
  { dec: 122, hex: '7A', oct: '172', char: 'z', name: 'Lowercase z' },
  { dec: 123, hex: '7B', oct: '173', char: '{', name: 'Left curly bracket' },
  { dec: 125, hex: '7D', oct: '175', char: '}', name: 'Right curly bracket' },
  { dec: 126, hex: '7E', oct: '176', char: '~', name: 'Tilde' },
  { dec: 169, hex: 'A9', oct: '251', char: '©', name: 'Copyright symbol' },
  { dec: 174, hex: 'AE', oct: '256', char: '®', name: 'Registered trademark' },
  { dec: 8364, hex: '20AC', oct: '20414', char: '€', name: 'Euro sign' }
];

export default function AsciiUnicodeReferenceCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const searchId = useId();

  const [query, setQuery] = useState('');
  const [copiedDec, setCopiedDec] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ASCII_ITEMS;
    return ASCII_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.char.toLowerCase().includes(q) ||
        item.hex.toLowerCase().includes(q) ||
        item.dec.toString().includes(q)
    );
  }, [query]);

  const handleCopy = (item: AsciiItem) => {
    navigator.clipboard?.writeText(item.char);
    setCopiedDec(item.dec);
    window.setTimeout(() => setCopiedDec(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search Bar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Code className="w-4 h-4 text-accent shrink-0" />
          <label htmlFor={searchId} className="sr-only">
            {isEs ? 'Buscar carácter ASCII o Unicode' : 'Search ASCII or Unicode character'}
          </label>
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar carácter por nombre, decimal o hex (ej. A, 65, 41)...'
                : 'Search character by name, decimal, hex, or symbol (e.g. A, 65, €)...'
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
            {filtered.length} / {ASCII_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Table of Characters */}
      {filtered.length === 0 ? (
        <UiEmptyState
          title={isEs ? 'Sin caracteres coincidentes' : 'No matching characters'}
          description={
            isEs
              ? 'Prueba buscando por decimal (65), hexadecimal (41) o nombre.'
              : 'Try searching by decimal (65), hex (41), or character name.'
          }
          action={
            <UiButton variant="secondary" size="sm" onClick={() => setQuery('')}>
              {isEs ? 'Limpiar filtro' : 'Clear search'}
            </UiButton>
          }
        />
      ) : (
        <div className="ui-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{isEs ? 'Carácter' : 'Char'}</th>
                  <th>Dec</th>
                  <th>Hex</th>
                  <th>Oct</th>
                  <th>{isEs ? 'Descripción' : 'Description'}</th>
                  <th className="text-right">{isEs ? 'Acción' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.dec}>
                    <td className="font-mono font-bold text-accent text-base">
                      {item.char === ' ' ? '␣' : item.char}
                    </td>
                    <td className="font-mono">{item.dec}</td>
                    <td className="font-mono text-text-secondary">0x{item.hex}</td>
                    <td className="font-mono text-text-secondary">0{item.oct}</td>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        aria-label={isEs ? `Copiar ${item.name}` : `Copy ${item.name}`}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium"
                      >
                        {copiedDec === item.dec ? (
                          <Check className="w-3.5 h-3.5 text-status-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {copiedDec === item.dec
                            ? isEs
                              ? 'Copiado'
                              : 'Copied'
                            : isEs
                              ? 'Copiar'
                              : 'Copy'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
