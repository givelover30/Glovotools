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

const DEFAULT_ISBN = '978-0-306-40615-7';

export default function IsbnValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [isbn, setIsbn] = useState<string>(DEFAULT_ISBN);

  const analysis = useMemo(() => {
    const clean = isbn.replace(/[\s-]/g, '').toUpperCase();
    if (!clean) {
      return { state: 'empty' as const };
    }

    if (clean.length === 10) {
      if (!/^\d{9}[\dX]$/.test(clean)) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? 'ISBN-10 debe tener 9 dígitos seguidos de un dígito o "X".'
            : 'ISBN-10 must have 9 digits followed by a check digit (0–9 or X).'
        };
      }
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        const val = clean[i] === 'X' ? 10 : parseInt(clean[i], 10);
        sum += val * (10 - i);
      }
      const remainder = sum % 11;
      if (remainder !== 0) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? `Suma de verificación ISBN-10 fallida (suma ponderada ${sum}, mod 11 = ${remainder}, se esperaba 0).`
            : `ISBN-10 checksum failed (weighted sum ${sum}, mod 11 = ${remainder}, expected 0).`
        };
      }
      return {
        state: 'ready' as const,
        format: 'ISBN-10' as const,
        clean,
        checkDigit: clean[9],
        weightedSum: sum,
        modulus: 11
      };
    }

    if (clean.length === 13) {
      if (!/^\d{13}$/.test(clean)) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? 'ISBN-13 debe contener exactamente 13 dígitos numéricos.'
            : 'ISBN-13 must consist of exactly 13 numeric digits.'
        };
      }
      let sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(clean[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const remainder = sum % 10;
      if (remainder !== 0) {
        return {
          state: 'error' as const,
          errorMessage: isEs
            ? `Suma de verificación ISBN-13 fallida (suma ponderada ${sum}, mod 10 = ${remainder}, se esperaba 0).`
            : `ISBN-13 checksum failed (weighted sum ${sum}, mod 10 = ${remainder}, expected 0).`
        };
      }
      return {
        state: 'ready' as const,
        format: 'ISBN-13' as const,
        clean,
        prefix: clean.slice(0, 3),
        checkDigit: clean[12],
        weightedSum: sum,
        modulus: 10
      };
    }

    return {
      state: 'error' as const,
      errorMessage: isEs
        ? `Longitud inválida (${clean.length} caracteres). Un ISBN debe tener 10 o 13 caracteres.`
        : `Invalid length (${clean.length} characters). An ISBN must be 10 or 13 characters long.`
    };
  }, [isbn, isEs]);

  const handleClear = () => setIsbn('');
  const handleReset = () => setIsbn(DEFAULT_ISBN);

  const copySummary =
    analysis.state === 'ready'
      ? `Valid ${analysis.format}: ${analysis.clean} | Check Digit: ${analysis.checkDigit}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador ISBN-10 / ISBN-13' : 'ISBN-10 / ISBN-13 Validator'}
          subtitle={
            isEs
              ? 'Verifica dígitos de control ISBN-10 (módulo 11 con X) e ISBN-13 (módulo 10 pesos 1/3).'
              : 'Verifies ISBN-10 (Mod 11 including X) and ISBN-13 (Mod 10 alternating 1/3 weights) checksums.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Código ISBN' : 'ISBN Code'}
            htmlFor="isbn-validator-input"
            unit="ISO 2108"
          >
            <input
              id="isbn-validator-input"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-0-306-40615-7 or 0-306-40615-2"
              className="ui-input font-mono text-sm tracking-wider"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              { label: 'ISBN-13 Valid', onSelect: () => setIsbn('978-0-306-40615-7') },
              { label: 'ISBN-10 Valid', onSelect: () => setIsbn('0-306-40615-2') },
              { label: 'ISBN-10 (X)', onSelect: () => setIsbn('0-8044-2957-X') },
              {
                label: isEs ? 'ISBN inválido' : 'Invalid ISBN',
                onSelect: () => setIsbn('978-0-306-40615-8')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado ISBN' : 'ISBN Verification Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Estado ISO 2108' : 'ISO 2108 Status'}
          primaryValue={
            analysis.state === 'ready'
              ? `${analysis.format} ${isEs ? 'Válido' : 'Valid'}`
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? isEs
                ? `Dígito de control verificado (suma ponderada ${analysis.weightedSum} mod ${analysis.modulus} = 0).`
                : `Check digit verified (weighted sum ${analysis.weightedSum} mod ${analysis.modulus} = 0).`
              : undefined
          }
          statusLabel={analysis.state === 'ready' ? analysis.format : undefined}
          statusTone="success"
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar ISBN' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un código ISBN' : 'Enter an ISBN code'}
          emptyDescription={
            isEs
              ? 'Escribe un código ISBN-10 o ISBN-13 con o sin guiones a la izquierda.'
              : 'Enter an ISBN-10 or ISBN-13 with or without hyphens on the left.'
          }
          errorTitle={isEs ? 'ISBN Inválido' : 'Invalid ISBN'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Formato' : 'Format'}
                  value={analysis.format}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Dígito de control' : 'Check Digit'}
                  value={analysis.checkDigit}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'ISBN normalizado' : 'Normalized ISBN',
                    value: analysis.clean,
                    highlight: true
                  },
                  ...(analysis.format === 'ISBN-13'
                    ? [{ label: 'EAN / GS1 Prefix', value: analysis.prefix }]
                    : []),
                  {
                    label: isEs ? 'Suma ponderada' : 'Weighted Sum',
                    value: `${analysis.weightedSum} (mod ${analysis.modulus} = 0)`
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
