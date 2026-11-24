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

const DEFAULT_IBAN = 'DE89370400440532013000';

function formatIbanGroups(clean: string): string {
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export default function IbanValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [iban, setIban] = useState<string>(DEFAULT_IBAN);

  const analysis = useMemo(() => {
    const clean = iban.replace(/[\s-]/g, '').toUpperCase();
    if (!clean) {
      return { state: 'empty' as const };
    }

    if (clean.length < 15 || clean.length > 34) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? `Longitud de IBAN inválida (${clean.length} caracteres; debe tener entre 15 y 34).`
          : `Invalid IBAN length (${clean.length} characters; expected 15 to 34).`
      };
    }

    if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(clean)) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'Formato inválido: debe iniciar con 2 letras de país, 2 dígitos de control y caracteres alfanuméricos.'
          : 'Invalid IBAN format: must start with a 2-letter country code, 2 check digits, and alphanumeric BBAN.'
      };
    }

    const rearranged = clean.slice(4) + clean.slice(0, 4);
    const numericStr = rearranged.replace(/[A-Z]/g, (char) =>
      String(char.charCodeAt(0) - 55)
    );

    try {
      const remainder = BigInt(numericStr) % 97n;
      const countryCode = clean.slice(0, 2);
      const checkDigits = clean.slice(2, 4);
      const bban = clean.slice(4);
      const formatted = formatIbanGroups(clean);

      if (remainder !== 1n) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? `Fallo en la suma de verificación Mod-97 (residuo ${remainder.toString()}, se esperaba 1).`
            : `ISO 7064 Mod-97 checksum failed (remainder ${remainder.toString()}, expected 1).`
        };
      }

      return {
        state: 'ready' as const,
        clean,
        formatted,
        countryCode,
        checkDigits,
        bban,
        length: clean.length,
        remainder: remainder.toString()
      };
    } catch {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'No se pudo evaluar la suma de verificación Mod-97 del IBAN.'
          : 'Unable to evaluate ISO 7064 Mod-97 checksum.'
      };
    }
  }, [iban, isEs]);

  const handleClear = () => setIban('');
  const handleReset = () => setIban(DEFAULT_IBAN);

  const copySummary =
    analysis.state === 'ready'
      ? `Valid IBAN: ${analysis.formatted} | Country: ${analysis.countryCode} | Check: ${analysis.checkDigits} | BBAN: ${analysis.bban}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de IBAN (ISO 13616)' : 'IBAN Validator (ISO 13616)'}
          subtitle={
            isEs
              ? 'Valida el formato internacional y el dígito de control Mod-97-10 (ISO 7064) con BigInt.'
              : 'Validates international IBAN structure and ISO 7064 Mod-97-10 checksum using exact BigInt arithmetic.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Número IBAN' : 'IBAN Number'}
            htmlFor="iban-validator-input"
            unit="MOD-97"
          >
            <input
              id="iban-validator-input"
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="DE89 3704 0044 0532 0130 00"
              className="ui-input font-mono text-sm uppercase tracking-wider"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: 'DE (Valid)',
                onSelect: () => setIban('DE89370400440532013000')
              },
              {
                label: 'GB (Valid)',
                onSelect: () => setIban('GB82 WEST 1234 5698 7654 32')
              },
              {
                label: 'ES (Valid)',
                onSelect: () => setIban('ES91 2100 0418 4502 0005 1332')
              },
              {
                label: isEs ? 'Checksum inválido' : 'Invalid Checksum',
                onSelect: () => setIban('DE89370400440532013001')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado IBAN' : 'IBAN Validation Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Verificación ISO 7064' : 'ISO 7064 Checksum'}
          primaryValue={
            analysis.state === 'ready'
              ? isEs
                ? 'IBAN Válido'
                : 'Valid IBAN'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready' ? analysis.formatted : undefined
          }
          statusLabel={analysis.state === 'ready' ? 'MOD-97 = 1' : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar IBAN' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un IBAN para verificar' : 'Enter an IBAN to verify'}
          emptyDescription={
            isEs
              ? 'Escribe un número IBAN con o sin espacios para validar su código de control.'
              : 'Type an IBAN with or without spaces to validate its country code and Mod-97 checksum.'
          }
          errorTitle={isEs ? 'IBAN Inválido' : 'Invalid IBAN'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                <ToolMetricTile
                  label={isEs ? 'País' : 'Country'}
                  value={analysis.countryCode}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Control' : 'Check Digits'}
                  value={analysis.checkDigits}
                />
                <ToolMetricTile
                  label={isEs ? 'Longitud' : 'Length'}
                  value={String(analysis.length)}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: 'BBAN',
                    value: analysis.bban
                  },
                  {
                    label: isEs ? 'Formato agrupado' : 'Grouped Format',
                    value: analysis.formatted,
                    highlight: true
                  },
                  {
                    label: isEs ? 'Residuo Mod-97' : 'Mod-97 Remainder',
                    value: analysis.remainder
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
