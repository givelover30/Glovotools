import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { SUPPORTED_CURRENCIES, useCurrency, CurrencyCode } from '../../i18n/CurrencyContext.tsx';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CurrencySelectorProps {
  position?: 'top' | 'bottom';
  compact?: boolean;
  onlyCode?: boolean;
}

const formatCurrencyLabel = (c: { symbol: string; code: string }) => {
  return c.symbol === c.code ? c.code : `${c.symbol} ${c.code}`;
};

export default function CurrencySelector({
  position = 'top',
  compact = false
}: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();
  const { language } = useTranslation();
  const isEs = language === 'es';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentCurr = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dropdownPositionClasses =
    position === 'bottom'
      ? 'absolute top-full mt-2 right-0 w-60'
      : 'absolute bottom-full mb-2 left-0 right-0 w-full sm:w-60';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isEs ? 'Seleccionar moneda' : 'Select currency'}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-1 rounded-lg border border-border-main bg-surface hover:bg-surface-hover hover:border-border-strong text-text-primary transition-colors cursor-pointer text-xs font-medium shrink-0 ${
          compact ? 'h-8 sm:h-9 px-1.5 sm:px-2.5' : 'min-h-[40px] px-3 w-full'
        }`}
      >
        <span className="flex items-center gap-1 min-w-0">
          <span className="truncate font-semibold font-mono text-[11px] sm:text-xs">
            <span className="hidden sm:inline">{currentCurr.symbol !== currentCurr.code ? `${currentCurr.symbol} ` : ''}</span>
            <span>{currentCurr.code}</span>
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-tertiary transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={isEs ? 'Monedas disponibles' : 'Available currencies'}
          className={`${dropdownPositionClasses} rounded-xl bg-surface dark:bg-surface-elevated border border-border-main shadow-xl py-1.5 z-50 animate-fadeIn`}
        >
          <div className="px-3 py-1.5 border-b border-border-subtle mb-1">
            <div className="text-[11px] font-medium text-text-tertiary mb-1.5">
              {isEs ? 'Seleccionar Moneda' : 'Select Currency'}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar símbolo o código...' : 'Search symbol or code...'}
                className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-border-main bg-surface-secondary text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 p-1">
            {filteredCurrencies.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-text-tertiary">
                {isEs ? 'No se encontraron monedas' : 'No currencies found'}
              </div>
            ) : (
              filteredCurrencies.map((curr) => {
                const isSelected = curr.code === currency;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setCurrency(curr.code as CurrencyCode, true);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-selected text-accent font-semibold'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center justify-between w-full font-mono font-semibold">
                      <span className={isSelected ? 'text-accent font-bold' : 'text-text-primary'}>
                        {formatCurrencyLabel(curr)}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
