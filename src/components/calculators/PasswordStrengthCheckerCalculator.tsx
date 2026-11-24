import { useMemo, useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_PASSWORD = 'Tr0ub4dour&9!';

export default function PasswordStrengthCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [password, setPassword] = useState<string>(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const analysis = useMemo(() => {
    if (!password) {
      return { state: 'empty' as const };
    }

    const len = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSym = /[^a-zA-Z0-9]/.test(password);

    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNum) poolSize += 10;
    if (hasSym) poolSize += 32;

    const entropy = poolSize > 0 ? Math.round(len * Math.log2(poolSize)) : 0;

    let score = 0;
    if (len >= 12) score += 2;
    else if (len >= 8) score += 1;
    if (hasLower) score += 1;
    if (hasUpper) score += 1;
    if (hasNum) score += 1;
    if (hasSym) score += 2;

    const level = Math.min(5, Math.max(1, Math.round((score / 7) * 5)));

    const labelsEn = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const labelsEs = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    const tones: Array<'error' | 'warning' | 'accent' | 'success'> = [
      'error',
      'error',
      'error',
      'warning',
      'accent',
      'success'
    ];

    const checks = [
      {
        label: isEs ? 'Mínimo 12 caracteres' : '12+ characters',
        met: len >= 12
      },
      {
        label: isEs ? 'Letras minúsculas (a–z)' : 'Lowercase letters (a–z)',
        met: hasLower
      },
      {
        label: isEs ? 'Letras mayúsculas (A–Z)' : 'Uppercase letters (A–Z)',
        met: hasUpper
      },
      {
        label: isEs ? 'Números (0–9)' : 'Numbers (0–9)',
        met: hasNum
      },
      {
        label: isEs ? 'Símbolos (!@#$...)' : 'Special symbols (!@#$...)',
        met: hasSym
      }
    ];

    return {
      state: 'ready' as const,
      len,
      poolSize,
      entropy,
      level,
      strengthLabel: isEs ? labelsEs[level] : labelsEn[level],
      statusTone: tones[level],
      checks
    };
  }, [password, isEs]);

  const handleClear = () => setPassword('');
  const handleReset = () => setPassword(DEFAULT_PASSWORD);

  const copySummary =
    analysis.state === 'ready'
      ? `Password Strength: ${analysis.strengthLabel} (${analysis.level}/5) | Entropy: ~${analysis.entropy} bits | Length: ${analysis.len} | Pool: ${analysis.poolSize}`
      : undefined;

  const activeSegmentClass =
    analysis.state !== 'ready'
      ? 'bg-surface-secondary'
      : analysis.level <= 2
        ? 'bg-status-error'
        : analysis.level === 3
          ? 'bg-status-warning'
          : 'bg-status-success';

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Analizador de Fortaleza de Contraseña' : 'Password Strength & Entropy Analyzer'}
          subtitle={
            isEs
              ? 'Calcula entropía en bits, tamaño del espacio de caracteres y criterios de seguridad localmente.'
              : 'Computes Shannon pool entropy in bits, character-space size, and security checklist locally.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Contraseña a evaluar' : 'Password to Test'}
            htmlFor="password-strength-input"
            unit={isEs ? '100% Local' : '100% Local'}
            hint={
              isEs
                ? 'Evaluación completamente offline en tu dispositivo.'
                : 'Evaluated strictly offline in your browser memory.'
            }
          >
            <div className="relative flex items-center gap-2">
              <input
                id="password-strength-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEs ? 'Escribe una contraseña...' : 'Enter password to test...'}
                className="ui-input font-mono text-sm pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? isEs
                      ? 'Ocultar contraseña'
                      : 'Hide password'
                    : isEs
                      ? 'Mostrar contraseña'
                      : 'Show password'
                }
                className="absolute right-2 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Corta / Débil' : 'Short / Weak',
                onSelect: () => setPassword('abc123')
              },
              {
                label: isEs ? 'Media' : 'Moderate',
                onSelect: () => setPassword('Summer2026')
              },
              {
                label: isEs ? 'Fuerte' : 'Strong',
                onSelect: () => setPassword(DEFAULT_PASSWORD)
              },
              {
                label: isEs ? 'Frase larga' : 'Passphrase',
                onSelect: () => setPassword('Correct-Horse-Battery-99!')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Evaluación de seguridad' : 'Strength Assessment'}
          state={analysis.state}
          primaryLabel={isEs ? 'Nivel de fortaleza' : 'Strength Rating'}
          primaryValue={analysis.state === 'ready' ? analysis.strengthLabel : undefined}
          primarySubtext={
            analysis.state === 'ready'
              ? isEs
                ? `Entropía estimada de ~${analysis.entropy} bits con un espacio de ${analysis.poolSize} caracteres.`
                : `Estimated ~${analysis.entropy} bits of entropy from a ${analysis.poolSize}-character pool.`
              : undefined
          }
          statusLabel={
            analysis.state === 'ready' ? `${analysis.level} / 5` : undefined
          }
          statusTone={analysis.state === 'ready' ? analysis.statusTone : 'neutral'}
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar reporte' : 'Copy report'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa una contraseña' : 'Enter a password'}
          emptyDescription={
            isEs
              ? 'Escribe una contraseña a la izquierda para calcular su entropía y criterios.'
              : 'Type a password on the left to calculate its entropy and strength rating.'
          }
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-secondary">
                    {isEs ? 'Medidor de fortaleza' : 'Strength Meter'}
                  </span>
                  <span className="font-mono font-semibold text-text-primary">
                    {analysis.level} / 5
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={isEs ? 'Nivel de fortaleza de contraseña' : 'Password strength level'}
                  aria-valuenow={analysis.level}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  className="flex gap-1.5 w-full"
                >
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-2.5 flex-1 rounded-full transition-colors ${
                        step <= analysis.level
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
                  value={`~${analysis.entropy} b`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud' : 'Length'}
                  value={`${analysis.len}`}
                />
                <ToolMetricTile
                  label={isEs ? 'Pool' : 'Char Pool'}
                  value={`${analysis.poolSize}`}
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-text-secondary">
                  {isEs ? 'Criterios de complejidad' : 'Complexity Criteria'}
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysis.checks.map((item, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                        item.met
                          ? 'border-status-success/30 bg-status-success-bg text-text-primary'
                          : 'border-border-subtle bg-surface-secondary/50 text-text-secondary'
                      }`}
                    >
                      {item.met ? (
                        <Check className="w-3.5 h-3.5 text-status-success shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
