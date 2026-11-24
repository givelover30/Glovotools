import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, History, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { ToolSegmentedControl } from '../calculator/ToolWorkspacePrimitives.tsx';
import PrintResultButton from '../common/PrintResultButton.tsx';

type AngleUnit = 'DEG' | 'RAD';
type CalcMode = 'scientific' | 'basic';

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenizeExpression(raw: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const pushImplicitMulIfNeeded = () => {
    const prev = tokens[tokens.length - 1];
    if (prev && (prev.type === 'num' || prev.type === 'rparen')) {
      tokens.push({ type: 'op', value: '*' });
    }
  };

  while (i < raw.length) {
    const ch = raw[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i++;
      continue;
    }

    // Numeric literal (supports decimals and scientific exponent like 1e-5 or 2.5E+3)
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      const slice = raw.slice(i);
      const match = slice.match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!match) throw new Error('Invalid number');
      const numVal = Number(match[0]);
      if (!Number.isFinite(numVal)) throw new Error('Invalid number');
      pushImplicitMulIfNeeded();
      tokens.push({ type: 'num', value: numVal });
      i += match[0].length;
      continue;
    }

    if (ch === 'π') {
      pushImplicitMulIfNeeded();
      tokens.push({ type: 'num', value: Math.PI });
      i++;
      continue;
    }

    if (ch === 'e') {
      pushImplicitMulIfNeeded();
      tokens.push({ type: 'num', value: Math.E });
      i++;
      continue;
    }

    if (ch === '(') {
      pushImplicitMulIfNeeded();
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    if (ch === '*' || ch === '×') {
      tokens.push({ type: 'op', value: '*' });
      i++;
      continue;
    }

    if (ch === '/' || ch === '÷') {
      tokens.push({ type: 'op', value: '/' });
      i++;
      continue;
    }

    throw new Error(`Unexpected token: ${ch}`);
  }

  return tokens;
}

function evaluateSafeExpression(expr: string): number {
  const tokens = tokenizeExpression(expr);
  if (tokens.length === 0) throw new Error('Empty expression');
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  function parseExpression(): number {
    let left = parseTerm();
    while (true) {
      const tok = peek();
      if (tok && tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        consume();
        const right = parseTerm();
        left = tok.value === '+' ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseUnary();
    while (true) {
      const tok = peek();
      if (tok && tok.type === 'op' && (tok.value === '*' || tok.value === '/')) {
        consume();
        const right = parseUnary();
        if (tok.value === '/') {
          if (right === 0) throw new Error('Division by zero');
          left = left / right;
        } else {
          left = left * right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): number {
    const tok = peek();
    if (tok && tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
      consume();
      const val = parseUnary();
      return tok.value === '-' ? -val : val;
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePrimary();
    const tok = peek();
    if (tok && tok.type === 'op' && tok.value === '^') {
      consume();
      // Right-associative: 2^3^2 = 2^(3^2) and 2^-1 = 0.5
      const exponent = parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePrimary(): number {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of expression');
    if (tok.type === 'num') {
      consume();
      return tok.value;
    }
    if (tok.type === 'lparen') {
      consume();
      const val = parseExpression();
      const closing = peek();
      if (!closing || closing.type !== 'rparen') {
        throw new Error('Mismatched parentheses');
      }
      consume();
      return val;
    }
    throw new Error('Expected number or parenthesis');
  }

  const result = parseExpression();
  if (pos !== tokens.length) {
    throw new Error('Trailing tokens in expression');
  }
  if (!Number.isFinite(result) || Number.isNaN(result)) {
    throw new Error('Result is not finite');
  }
  return result;
}

function formatCalcResult(val: number): string {
  if (!Number.isFinite(val) || Number.isNaN(val)) return 'Error';
  if (val === 0) return '0';
  const abs = Math.abs(val);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-8)) {
    return Number(val.toPrecision(10)).toString();
  }
  return Number(val.toFixed(10)).toString();
}

export default function ScientificCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<CalcMode>('scientific');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [copiedDisplay, setCopiedDisplay] = useState(false);

  const isScientific = mode === 'scientific';

  const handleDigit = useCallback((d: string) => {
    setDisplay((prev) => {
      if (prev === 'Error') return d === '.' ? '0.' : d;
      if (prev === '0') {
        if (d === '.') return '0.';
        if (d === '0') return '0';
        return d;
      }
      return prev + d;
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    setDisplay((prev) => {
      if (prev === 'Error') return prev;
      return `${prev} ${op} `;
    });
  }, []);

  const handleClear = useCallback(() => {
    setDisplay('0');
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (prev === 'Error' || prev.length <= 1) return '0';
      const trimmed = prev.trimEnd();
      const sliced = trimmed.slice(0, -1).trimEnd();
      return sliced.length === 0 ? '0' : sliced;
    });
  }, []);

  const handleCalculate = useCallback(() => {
    try {
      const result = evaluateSafeExpression(display);
      const resStr = formatCalcResult(result);
      if (resStr === 'Error') {
        setDisplay('Error');
        return;
      }
      if (display.trim() !== resStr) {
        setHistory((prev) => [`${display.trim()} = ${resStr}`, ...prev.slice(0, 11)]);
      }
      setDisplay(resStr);
    } catch {
      setDisplay('Error');
    }
  }, [display]);

  const handleSpecial = useCallback(
    (type: string) => {
      try {
        const val = evaluateSafeExpression(display);
        let res = 0;
        switch (type) {
          case 'sqrt':
            if (val < 0) {
              setDisplay('Error');
              return;
            }
            res = Math.sqrt(val);
            break;
          case 'square':
            res = val * val;
            break;
          case 'sin': {
            const rad = angleUnit === 'DEG' ? (val * Math.PI) / 180 : val;
            res = Math.sin(rad);
            break;
          }
          case 'cos': {
            const rad = angleUnit === 'DEG' ? (val * Math.PI) / 180 : val;
            res = Math.cos(rad);
            break;
          }
          case 'tan': {
            if (angleUnit === 'DEG' && Math.abs(((val % 180) + 180) % 180 - 90) < 1e-12) {
              setDisplay('Error');
              return;
            }
            const rad = angleUnit === 'DEG' ? (val * Math.PI) / 180 : val;
            res = Math.tan(rad);
            if (Math.abs(res) > 1e14) {
              setDisplay('Error');
              return;
            }
            break;
          }
          case 'log':
            if (val <= 0) {
              setDisplay('Error');
              return;
            }
            res = Math.log10(val);
            break;
          case 'ln':
            if (val <= 0) {
              setDisplay('Error');
              return;
            }
            res = Math.log(val);
            break;
          case 'percent':
            res = val / 100;
            break;
          case 'negate':
            res = -val;
            break;
          default:
            return;
        }
        const resStr = formatCalcResult(res);
        if (resStr === 'Error') {
          setDisplay('Error');
          return;
        }
        const fnLabel =
          type === 'square' ? `(${val})²` : type === 'percent' ? `${val}%` : `${type}(${val})`;
        setHistory((prev) => [`${fnLabel} = ${resStr}`, ...prev.slice(0, 11)]);
        setDisplay(resStr);
      } catch {
        setDisplay('Error');
      }
    },
    [display, angleUnit]
  );

  const handleMemory = useCallback(
    (action: 'MC' | 'MR' | 'M+' | 'M-') => {
      if (action === 'MC') {
        setMemory(0);
        return;
      }
      if (action === 'MR') {
        const memStr = formatCalcResult(memory);
        setDisplay((prev) => (prev === '0' || prev === 'Error' ? memStr : prev + memStr));
        return;
      }
      try {
        const current = evaluateSafeExpression(display);
        setMemory((prev) => (action === 'M+' ? prev + current : prev - current));
      } catch {
        // Ignore memory operation on invalid display
      }
    },
    [display, memory]
  );

  const handleCopyDisplay = () => {
    if (display === 'Error') return;
    navigator.clipboard?.writeText(display);
    setCopiedDisplay(true);
    window.setTimeout(() => setCopiedDisplay(false), 1800);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '(' || e.key === ')') {
        handleDigit(e.key);
      } else if (e.key === '^') {
        handleOperator('^');
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key);
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        handleSpecial('percent');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDigit, handleOperator, handleSpecial, handleCalculate, handleBackspace, handleClear]);

  const numBtnClass =
    'min-h-[44px] px-3 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-main text-text-primary font-mono tabular-nums font-semibold text-base transition-colors cursor-pointer active:scale-[0.98]';
  const opBtnClass =
    'min-h-[44px] px-3 py-2.5 rounded-xl bg-accent-light hover:bg-accent/20 border border-accent/25 text-accent font-mono tabular-nums font-bold text-base transition-colors cursor-pointer active:scale-[0.98]';
  const utilBtnClass =
    'min-h-[44px] px-3 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary font-mono tabular-nums font-semibold text-sm transition-colors cursor-pointer active:scale-[0.98]';
  const sciBtnClass =
    'min-h-[44px] px-2 py-2 rounded-xl bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-text-primary font-mono tabular-nums font-medium text-xs transition-colors cursor-pointer active:scale-[0.98]';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Toolbar */}
      <div className="ui-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ToolSegmentedControl<CalcMode>
            ariaLabel={isEs ? 'Modo de calculadora' : 'Calculator mode'}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'scientific', label: isEs ? 'Científica' : 'Scientific Mode' },
              { value: 'basic', label: isEs ? 'Básica' : 'Basic Mode' }
            ]}
          />

          <ToolSegmentedControl<AngleUnit>
            ariaLabel={isEs ? 'Unidad angular' : 'Angle unit'}
            value={angleUnit}
            onChange={setAngleUnit}
            options={[
              { value: 'DEG', label: 'DEG' },
              { value: 'RAD', label: 'RAD' }
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums border ${
              memory !== 0
                ? 'bg-accent-light border-accent/30 text-accent font-semibold'
                : 'bg-surface-secondary border-border-subtle text-text-tertiary'
            }`}
          >
            M: {formatCalcResult(memory)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Keypad */}
        <section className="lg:col-span-8 ui-panel p-4 sm:p-5 space-y-3">
          {/* Display */}
          <div className="kpi-hover-bounce bg-surface-secondary border border-border-main rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-tertiary font-mono truncate">
                {history[0] || (isEs ? `Listo (${angleUnit})` : `Ready (${angleUnit})`)}
              </span>
              <div className="no-print flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyDisplay}
                  aria-label={isEs ? 'Copiar pantalla' : 'Copy display value'}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer shrink-0"
                >
                  {copiedDisplay ? (
                    <Check className="w-3.5 h-3.5 text-status-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedDisplay ? (isEs ? 'Copiado' : 'Copied') : isEs ? 'Copiar' : 'Copy'}</span>
                </button>
                <PrintResultButton />
              </div>
            </div>
            <div
              data-testid="calc-display"
              aria-live="polite"
              className="text-right text-3xl sm:text-4xl font-mono tabular-nums font-bold text-text-primary overflow-x-auto whitespace-nowrap py-1"
            >
              {display}
            </div>
          </div>

          {/* Memory Row */}
          <div className="no-print grid grid-cols-4 gap-2">
            {(['MC', 'MR', 'M+', 'M-'] as const).map((memBtn) => (
              <button
                key={memBtn}
                type="button"
                onClick={() => handleMemory(memBtn)}
                className="min-h-[38px] px-2 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle text-xs font-mono font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {memBtn}
              </button>
            ))}
          </div>

          {/* Scientific Function Row */}
          {isScientific && (
            <div className="no-print grid grid-cols-6 gap-1.5 sm:gap-2">
              {[
                { label: 'sin', aria: 'Sine', action: () => handleSpecial('sin') },
                { label: 'cos', aria: 'Cosine', action: () => handleSpecial('cos') },
                { label: 'tan', aria: 'Tangent', action: () => handleSpecial('tan') },
                { label: '√x', aria: 'Square root', action: () => handleSpecial('sqrt') },
                { label: 'x²', aria: 'Square', action: () => handleSpecial('square') },
                { label: 'xʸ', aria: 'Power', action: () => handleOperator('^') },
                { label: 'log', aria: 'Log base 10', action: () => handleSpecial('log') },
                { label: 'ln', aria: 'Natural log', action: () => handleSpecial('ln') },
                { label: '(', aria: 'Left parenthesis', action: () => handleDigit('(') },
                { label: ')', aria: 'Right parenthesis', action: () => handleDigit(')') },
                { label: 'π', aria: 'Pi constant', action: () => handleDigit('π') },
                { label: 'e', aria: 'Euler constant', action: () => handleDigit('e') }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  aria-label={item.aria}
                  className={sciBtnClass}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Standard Keypad */}
          <div className="no-print grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleClear}
              aria-label="All Clear"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-status-error-bg hover:opacity-90 border border-status-error/25 text-status-error font-mono font-bold text-sm transition-all cursor-pointer"
            >
              AC
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Backspace"
              className={utilBtnClass}
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => handleSpecial('percent')}
              aria-label="Percent"
              className={utilBtnClass}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => handleOperator('÷')}
              aria-label="Divide"
              className={opBtnClass}
            >
              ÷
            </button>

            {['7', '8', '9'].map((n) => (
              <button key={n} type="button" onClick={() => handleDigit(n)} className={numBtnClass}>
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperator('×')}
              aria-label="Multiply"
              className={opBtnClass}
            >
              ×
            </button>

            {['4', '5', '6'].map((n) => (
              <button key={n} type="button" onClick={() => handleDigit(n)} className={numBtnClass}>
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperator('-')}
              aria-label="Subtract"
              className={opBtnClass}
            >
              -
            </button>

            {['1', '2', '3'].map((n) => (
              <button key={n} type="button" onClick={() => handleDigit(n)} className={numBtnClass}>
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleOperator('+')}
              aria-label="Add"
              className={opBtnClass}
            >
              +
            </button>

            <button
              type="button"
              onClick={() => handleSpecial('negate')}
              aria-label="Toggle sign"
              className={utilBtnClass}
            >
              ±
            </button>
            <button type="button" onClick={() => handleDigit('0')} className={numBtnClass}>
              0
            </button>
            <button
              type="button"
              onClick={() => handleDigit('.')}
              aria-label="Decimal point"
              className={numBtnClass}
            >
              .
            </button>
            <button
              type="button"
              onClick={handleCalculate}
              aria-label="Equals"
              className="min-h-[44px] px-3 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-mono font-bold text-base transition-colors cursor-pointer active:scale-[0.98]"
            >
              =
            </button>
          </div>
        </section>

        {/* Calculation History Tape */}
        <section className="lg:col-span-4 ui-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                {isEs ? 'Historial' : 'Calculation History'}
              </h2>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="inline-flex items-center gap-1 text-xs font-medium text-status-error hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEs ? 'Limpiar' : 'Clear'}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="ui-empty-state py-8">
              <p className="text-xs text-text-secondary">
                {isEs
                  ? 'Las operaciones aparecerán aquí automáticamente.'
                  : 'Calculations will appear here as you evaluate expressions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto font-mono tabular-nums text-xs">
              {history.map((item, idx) => (
                <button
                  key={`${item}-${idx}`}
                  type="button"
                  onClick={() => {
                    const eqIdx = item.lastIndexOf('=');
                    const res = eqIdx >= 0 ? item.slice(eqIdx + 1).trim() : '';
                    if (res) setDisplay(res);
                  }}
                  className="print-keep kpi-hover-elastic w-full p-2.5 rounded-lg bg-surface-secondary hover:bg-surface-hover border border-border-subtle hover:border-accent/50 transition-colors text-text-primary text-right cursor-pointer break-all"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <p className="no-print pt-3 border-t border-border-subtle text-xs text-text-tertiary leading-relaxed">
            {isEs
              ? 'Consejo: Puedes usar el teclado físico (0-9, +, -, *, /, ^, Enter, Esc) o pulsar cualquier resultado previo.'
              : 'Tip: Use keyboard shortcuts (0-9, +, -, *, /, ^, Enter, Esc) or click any history entry to recall.'}
          </p>
        </section>
      </div>
    </div>
  );
}
