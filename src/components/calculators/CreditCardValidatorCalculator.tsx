import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolPresetBar,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

const DEFAULT_CARD = '4532 7182 9381 2094';

function detectCardNetwork(clean: string): string {
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2(?:22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(clean)) {
    return 'Mastercard';
  }
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Unknown';
}

function luhnCheck(clean: string): { valid: boolean; sum: number } {
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return { valid: sum % 10 === 0, sum };
}

export default function CreditCardValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [cardNum, setCardNum] = useState<string>(DEFAULT_CARD);

  const analysis = useMemo(() => {
    const trimmed = cardNum.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }

    if (/[^0-9\s-]/.test(trimmed)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'El número de tarjeta solo debe contener dígitos, espacios o guiones.'
          : 'Card number must contain only digits, spaces, or hyphens.'
      };
    }

    const clean = trimmed.replace(/[\s-]/g, '');
    if (clean.length < 13 || clean.length > 19) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Longitud inválida (${clean.length} dígitos; se esperan entre 13 y 19 dígitos).`
          : `Invalid card length (${clean.length} digits; expected 13 to 19 digits).`
      };
    }

    const network = detectCardNetwork(clean);
    const { valid, sum } = luhnCheck(clean);
    const masked =
      clean.length >= 8
        ? `${clean.slice(0, 4)} ${'•'.repeat(Math.max(4, clean.length - 8))} ${clean.slice(-4)}`
        : clean;

    return {
      state: 'ready' as const,
      valid,
      sum,
      network,
      length: clean.length,
      iin: clean.slice(0, 6),
      masked
    };
  }, [cardNum, isEs]);

  const handleClear = () => setCardNum('');
  const handleReset = () => setCardNum(DEFAULT_CARD);

  const copySummary =
    analysis.state === 'ready'
      ? `Luhn Check: ${analysis.valid ? 'Passed' : 'Failed'} | Network: ${analysis.network} | Length: ${analysis.length} | Masked: ${analysis.masked}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Tarjetas (Algoritmo Luhn)' : 'Credit Card Luhn Validator'}
          subtitle={
            isEs
              ? 'Verifica el dígito de control Luhn (Mod 10) e identifica la red emisora 100% en tu navegador.'
              : 'Verifies the Mod-10 Luhn checksum and identifies issuer network locally in your browser.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Número de tarjeta' : 'Card Number'}
            htmlFor="credit-card-validator-input"
            unit="ISO/IEC 7812"
            hint={
              isEs
                ? 'Validación matemática local: nunca se envían números a ningún servidor.'
                : 'Local mathematical validation only — no card data is ever transmitted.'
            }
          >
            <input
              id="credit-card-validator-input"
              type="text"
              inputMode="numeric"
              value={cardNum}
              onChange={(e) => setCardNum(e.target.value)}
              placeholder="4532 0151 1283 0366"
              className="ui-input font-mono text-sm tracking-wider"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: 'Visa (Valid Luhn)',
                onSelect: () => setCardNum('4532 0151 1283 0366')
              },
              {
                label: 'Mastercard (Valid)',
                onSelect: () => setCardNum('5425 2334 3010 9903')
              },
              {
                label: 'Amex (Valid)',
                onSelect: () => setCardNum('3782 8224 6310 005')
              },
              {
                label: isEs ? 'Luhn inválido' : 'Invalid Luhn',
                onSelect: () => setCardNum(DEFAULT_CARD)
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado Luhn' : 'Luhn Check Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Suma de verificación Luhn' : 'Luhn Checksum'}
          primaryValue={
            analysis.state === 'ready'
              ? analysis.valid
                ? isEs
                  ? 'Luhn Válido'
                  : 'Luhn Passed'
                : isEs
                  ? 'Luhn Inválido'
                  : 'Luhn Failed'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? analysis.valid
                ? isEs
                  ? `Red detectada: ${analysis.network}. La suma Luhn (${analysis.sum}) es múltiplo de 10.`
                  : `Detected network: ${analysis.network}. Luhn sum (${analysis.sum}) is divisible by 10.`
                : isEs
                  ? `La suma Luhn (${analysis.sum}) no es divisible por 10 (residuo ${analysis.sum % 10}).`
                  : `Luhn sum (${analysis.sum}) is not divisible by 10 (remainder ${analysis.sum % 10}).`
              : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.valid
                ? isEs
                  ? 'Válido'
                  : 'Valid'
                : isEs
                  ? 'Inválido'
                  : 'Invalid'
              : undefined
          }
          statusTone={
            analysis.state === 'ready' && analysis.valid ? 'success' : 'error'
          }
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un número de tarjeta' : 'Enter a card number'}
          emptyDescription={
            isEs
              ? 'Escribe un número de tarjeta de prueba para verificar el dígito Luhn.'
              : 'Enter a test card number on the left to run the Luhn checksum.'
          }
          errorTitle={isEs ? 'Entrada de tarjeta inválida' : 'Invalid Card Input'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Red emisora' : 'Card Network'}
                  value={analysis.network}
                  accent={analysis.valid}
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud' : 'Digit Length'}
                  value={`${analysis.length} ${isEs ? 'dígitos' : 'digits'}`}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Prefijo IIN/BIN (6 dígitos)' : 'IIN / BIN Prefix',
                    value: analysis.iin
                  },
                  {
                    label: isEs ? 'Suma Luhn (Mod 10)' : 'Luhn Sum (Mod 10)',
                    value: `${analysis.sum} (mod 10 = ${analysis.sum % 10})`,
                    highlight: analysis.valid
                  },
                  {
                    label: isEs ? 'Referencia enmascarada' : 'Masked Preview',
                    value: analysis.masked
                  }
                ]}
              />

              <div className="rounded-xl border border-border-subtle bg-surface-secondary/70 p-3 text-xs text-text-secondary flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  {isEs
                    ? 'El algoritmo de Luhn solo verifica errores de transcripción; no confirma si una tarjeta está activa o tiene fondos.'
                    : 'Luhn checks mathematical digit integrity only; it does not verify active accounts or funds.'}
                </span>
              </div>
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
