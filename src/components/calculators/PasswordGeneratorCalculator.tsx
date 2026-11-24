import { useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiCheckbox } from '../ui/AppPrimitives.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', '1', 'l', 'I', '|']);

/**
 * Unbiased cryptographically secure random integer in [0, maxExclusive)
 * using Web Crypto API (crypto.getRandomValues) with rejection sampling.
 */
function cryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 + 1) % maxExclusive);
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value > limit);
  return value % maxExclusive;
}

function cryptoShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export default function PasswordGeneratorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);
  const [customExcluded, setCustomExcluded] = useState<string>('');
  const [seed, setSeed] = useState<number>(0);

  const generated = useMemo(() => {
    void seed;
    const safeLength = Math.min(64, Math.max(6, Number.isFinite(length) ? Math.floor(length) : 16));

    const excludedSet = new Set<string>(customExcluded.split(''));
    if (excludeAmbiguous) {
      AMBIGUOUS_CHARS.forEach((ch) => excludedSet.add(ch));
    }

    const filterPool = (pool: string) =>
      Array.from(pool)
        .filter((ch) => !excludedSet.has(ch))
        .join('');

    const activePools: string[] = [];
    if (includeUpper) {
      const p = filterPool(UPPER_CHARS);
      if (p) activePools.push(p);
    }
    if (includeLower) {
      const p = filterPool(LOWER_CHARS);
      if (p) activePools.push(p);
    }
    if (includeNumbers) {
      const p = filterPool(NUMBER_CHARS);
      if (p) activePools.push(p);
    }
    if (includeSymbols) {
      const p = filterPool(SYMBOL_CHARS);
      if (p) activePools.push(p);
    }

    const combinedPool = activePools.join('');
    if (!combinedPool) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Activa al menos un conjunto de caracteres o reduce los caracteres excluidos.'
          : 'Enable at least one character set or remove some excluded characters.'
      };
    }

    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Web Crypto API (crypto.getRandomValues) no está disponible en este navegador.'
          : 'Web Crypto API (crypto.getRandomValues) is not available in this browser.'
      };
    }

    // Guarantee at least one character from each active non-empty pool when length allows
    const chars: string[] = [];
    for (const pool of activePools) {
      if (chars.length < safeLength) {
        chars.push(pool[cryptoRandomInt(pool.length)]);
      }
    }
    while (chars.length < safeLength) {
      chars.push(combinedPool[cryptoRandomInt(combinedPool.length)]);
    }

    const password = cryptoShuffle(chars).join('');
    const poolSize = new Set(combinedPool.split('')).size;
    const entropy = poolSize > 1 ? Math.round(safeLength * Math.log2(poolSize)) : 0;

    let score = 0;
    if (safeLength >= 12) score += 2;
    else if (safeLength >= 8) score += 1;
    if (includeUpper && filterPool(UPPER_CHARS)) score += 1;
    if (includeLower && filterPool(LOWER_CHARS)) score += 1;
    if (includeNumbers && filterPool(NUMBER_CHARS)) score += 1;
    if (includeSymbols && filterPool(SYMBOL_CHARS)) score += 2;
    const strengthLevel = Math.min(5, Math.max(1, Math.round((score / 7) * 5)));

    const strengthLabel =
      strengthLevel >= 4
        ? isEs
          ? 'Fuerte'
          : 'Strong'
        : strengthLevel === 3
          ? isEs
            ? 'Media'
            : 'Medium'
          : isEs
            ? 'Débil'
            : 'Weak';

    const statusTone: 'success' | 'warning' | 'error' =
      strengthLevel >= 4 ? 'success' : strengthLevel === 3 ? 'warning' : 'error';

    return {
      state: 'ready' as const,
      password,
      length: safeLength,
      poolSize,
      entropy,
      strengthLevel,
      strengthLabel,
      statusTone
    };
  }, [
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    customExcluded,
    seed,
    isEs
  ]);

  const handleReset = () => {
    setLength(16);
    setIncludeUpper(true);
    setIncludeLower(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setExcludeAmbiguous(false);
    setCustomExcluded('');
    setSeed((s) => s + 1);
  };

  const activeSegmentClass =
    generated.state !== 'ready'
      ? 'bg-surface-secondary'
      : generated.strengthLevel >= 4
        ? 'bg-status-success'
        : generated.strengthLevel === 3
          ? 'bg-status-warning'
          : 'bg-status-error';

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Configuración de Contraseña Segura' : 'Secure Password Configuration'}
          subtitle={
            isEs
              ? 'Usa aleatoriedad criptográfica local (crypto.getRandomValues) sin sesgo de módulo.'
              : 'Uses unbiased cryptographic randomness (crypto.getRandomValues) strictly in your browser.'
          }
          onReset={handleReset}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Longitud de contraseña' : 'Password Length'}
            htmlFor="password-length-range"
            unit={`${length} ${isEs ? 'caracteres' : 'chars'}`}
          >
            <input
              id="password-length-range"
              type="range"
              min={6}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <UiCheckbox
              id="pw-upper"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              label={isEs ? 'Mayúsculas (A–Z)' : 'Uppercase (A–Z)'}
            />
            <UiCheckbox
              id="pw-lower"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              label={isEs ? 'Minúsculas (a–z)' : 'Lowercase (a–z)'}
            />
            <UiCheckbox
              id="pw-numbers"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              label={isEs ? 'Números (0–9)' : 'Numbers (0–9)'}
            />
            <UiCheckbox
              id="pw-symbols"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              label={isEs ? 'Símbolos (!@#$...)' : 'Symbols (!@#$...)'}
            />
          </div>

          <div className="pt-2 border-t border-border-subtle space-y-3">
            <UiCheckbox
              id="pw-exclude-ambiguous"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              label={
                isEs
                  ? 'Excluir caracteres ambiguos (0, O, o, 1, l, I, |)'
                  : 'Exclude ambiguous characters (0, O, o, 1, l, I, |)'
              }
            />

            <ToolFieldGroup
              label={isEs ? 'Excluir caracteres personalizados (opcional)' : 'Custom Excluded Characters (Optional)'}
              htmlFor="pw-custom-exclude"
              hint={
                isEs
                  ? 'Cualquier carácter escrito aquí jamás aparecerá en la contraseña generada.'
                  : 'Any character entered here will be strictly omitted from the output.'
              }
            >
              <input
                id="pw-custom-exclude"
                type="text"
                value={customExcluded}
                onChange={(e) => setCustomExcluded(e.target.value)}
                placeholder="{}[]()/\\&quot;'`"
                className="ui-input font-mono text-xs"
              />
            </ToolFieldGroup>
          </div>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="ui-btn-primary w-full"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEs ? 'Generar nueva contraseña' : 'Regenerate Password'}</span>
          </button>

          <ToolPresetBar
            label={isEs ? 'Perfiles:' : 'Presets:'}
            presets={[
              {
                label: '16 Chars (Default)',
                onSelect: () => {
                  setLength(16);
                  setIncludeUpper(true);
                  setIncludeLower(true);
                  setIncludeNumbers(true);
                  setIncludeSymbols(true);
                  setExcludeAmbiguous(false);
                }
              },
              {
                label: '32 Chars (High)',
                onSelect: () => {
                  setLength(32);
                  setIncludeUpper(true);
                  setIncludeLower(true);
                  setIncludeNumbers(true);
                  setIncludeSymbols(true);
                }
              },
              {
                label: isEs ? 'PIN (8 dígitos)' : 'PIN (8 Digits)',
                onSelect: () => {
                  setLength(8);
                  setIncludeUpper(false);
                  setIncludeLower(false);
                  setIncludeNumbers(true);
                  setIncludeSymbols(false);
                }
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Contraseña generada' : 'Generated Password'}
          state={generated.state}
          primaryLabel={isEs ? 'Contraseña criptográfica' : 'Cryptographic Password'}
          primaryValue={generated.state === 'ready' ? generated.password : undefined}
          primarySubtext={
            generated.state === 'ready'
              ? isEs
                ? `~${generated.entropy} bits de entropía • Espacio de ${generated.poolSize} caracteres.`
                : `~${generated.entropy} bits of entropy • ${generated.poolSize}-character pool.`
              : undefined
          }
          statusLabel={generated.state === 'ready' ? generated.strengthLabel : undefined}
          statusTone={generated.state === 'ready' ? generated.statusTone : 'neutral'}
          copyText={generated.state === 'ready' ? generated.password : undefined}
          copyLabel={isEs ? 'Copiar contraseña' : 'Copy password'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          errorTitle={isEs ? 'No se puede generar contraseña' : 'Cannot Generate Password'}
          errorMessage={generated.state === 'error' ? generated.errorMessage : undefined}
        >
          {generated.state === 'ready' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-secondary">
                    {isEs ? 'Fortaleza estimada' : 'Estimated Strength'}
                  </span>
                  <span className="font-mono font-semibold text-text-primary">
                    {generated.strengthLevel} / 5
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={isEs ? 'Fortaleza de contraseña' : 'Password strength'}
                  aria-valuenow={generated.strengthLevel}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  className="flex gap-1.5 w-full"
                >
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-2.5 flex-1 rounded-full transition-colors ${
                        step <= generated.strengthLevel
                          ? activeSegmentClass
                          : 'bg-surface-secondary border border-border-subtle'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'Entropía' : 'Entropy'}
                  value={`~${generated.entropy} b`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud' : 'Length'}
                  value={`${generated.length}`}
                />
                <ToolMetricTile
                  label={isEs ? 'Espacio' : 'Char Pool'}
                  value={`${generated.poolSize}`}
                />
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/70 p-3 text-xs text-text-secondary flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  {isEs
                    ? 'Generada con window.crypto.getRandomValues() localmente; nunca se envía por red.'
                    : 'Generated locally with window.crypto.getRandomValues(); never transmitted over any network.'}
                </span>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
