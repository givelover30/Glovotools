import { useMemo, useState } from 'react';
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

const DEFAULT_PHONE = '+1 (555) 234-5678';

export default function PhoneNumberCheckerCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [phone, setPhone] = useState<string>(DEFAULT_PHONE);

  const analysis = useMemo(() => {
    const trimmed = phone.trim();
    if (!trimmed) {
      return { state: 'empty' as const };
    }

    // Reject invalid alphabetic or unexpected characters
    if (/[^0-9+\-().\s]/.test(trimmed)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'El número contiene caracteres no válidos. Usa solo dígitos, "+", espacios, guiones o paréntesis.'
          : 'Phone number contains invalid characters. Use digits, "+", spaces, hyphens, dots, or parentheses only.'
      };
    }

    // '+' may only appear once at the very beginning
    if (trimmed.indexOf('+', 1) !== -1) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'El prefijo internacional "+" solo puede aparecer al inicio del número.'
          : 'The international "+" prefix may only appear at the beginning of the number.'
      };
    }

    const digits = trimmed.replace(/\D/g, '');
    const hasPlus = trimmed.startsWith('+');

    if (digits.length < 7 || digits.length > 15) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Cantidad de dígitos inválida (${digits.length}). El estándar E.164 requiere entre 7 y 15 dígitos.`
          : `Invalid digit count (${digits.length}). E.164 international phone numbers require 7 to 15 digits.`
      };
    }

    const e164 = `+${digits}`;
    let formatted = e164;
    let regionHint = isEs ? 'Internacional (E.164)' : 'International (E.164)';

    if (digits.length === 11 && digits.startsWith('1')) {
      formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      regionHint = isEs ? 'América del Norte (NANP +1)' : 'North America (NANP +1)';
    } else if (digits.length === 10 && !hasPlus) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      regionHint = isEs ? 'Nacional 10 dígitos' : '10-Digit National';
    } else if (digits.startsWith('44')) {
      regionHint = isEs ? 'Reino Unido (+44)' : 'United Kingdom (+44)';
    } else if (digits.startsWith('34')) {
      regionHint = isEs ? 'España (+34)' : 'Spain (+34)';
    } else if (digits.startsWith('52')) {
      regionHint = isEs ? 'México (+52)' : 'Mexico (+52)';
    }

    return {
      state: 'ready' as const,
      digits,
      digitCount: digits.length,
      hasPlus,
      e164,
      formatted,
      regionHint
    };
  }, [phone, isEs]);

  const handleClear = () => setPhone('');
  const handleReset = () => setPhone(DEFAULT_PHONE);

  const copySummary =
    analysis.state === 'ready'
      ? `Valid Phone | Formatted: ${analysis.formatted} | E.164: ${analysis.e164} | Digits: ${analysis.digitCount}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Verificador de Teléfono (E.164)' : 'Phone Number Checker (E.164)'}
          subtitle={
            isEs
              ? 'Valida formato numérico, longitud internacional (7–15 dígitos) y genera formato E.164.'
              : 'Validates character syntax, international length (7–15 digits), and outputs standardized E.164 format.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Número de teléfono' : 'Phone Number'}
            htmlFor="phone-number-checker-input"
            unit="ITU-T E.164"
          >
            <input
              id="phone-number-checker-input"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              { label: 'US (+1)', onSelect: () => setPhone(DEFAULT_PHONE) },
              { label: 'UK (+44)', onSelect: () => setPhone('+44 20 7946 0958') },
              { label: 'ES (+34)', onSelect: () => setPhone('+34 612 345 678') },
              {
                label: isEs ? 'Inválido' : 'Invalid',
                onSelect: () => setPhone('abc-123')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado de validación' : 'Phone Validation Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Formato estandarizado' : 'Standardized Format'}
          primaryValue={analysis.state === 'ready' ? analysis.formatted : undefined}
          primarySubtext={
            analysis.state === 'ready'
              ? `${analysis.regionHint} • ${analysis.digitCount} ${isEs ? 'dígitos' : 'digits'}`
              : undefined
          }
          statusLabel={analysis.state === 'ready' ? 'E.164 OK' : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar teléfono' : 'Copy formatted'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un número de teléfono' : 'Enter a phone number'}
          emptyDescription={
            isEs
              ? 'Escribe un número local o internacional (ej. +1 555 234 5678) a la izquierda.'
              : 'Enter a local or international phone number (e.g. +1 555 234 5678) on the left.'
          }
          errorTitle={isEs ? 'Número de teléfono inválido' : 'Invalid Phone Number'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Dígitos detectados' : 'Digit Count'}
                  value={`${analysis.digitCount} / 15`}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Prefijo internacional' : 'International Prefix'}
                  value={analysis.hasPlus ? (isEs ? 'Presente (+)' : 'Present (+)') : isEs ? 'Local' : 'Local'}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: 'E.164',
                    value: analysis.e164,
                    highlight: true
                  },
                  {
                    label: isEs ? 'Solo dígitos' : 'Digits Only',
                    value: analysis.digits
                  },
                  {
                    label: isEs ? 'Región estimada' : 'Detected Format',
                    value: analysis.regionHint
                  }
                ]}
              />
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
