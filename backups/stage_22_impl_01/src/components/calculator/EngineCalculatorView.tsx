import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorMeta } from '../../types.ts';
import { CalculationRegistry } from '../../engine/CalculationRegistry.ts';
import { CalculationExecutor } from '../../engine/CalculationExecutor.ts';
import { ExecutionResult } from '../../engine/types.ts';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { translateTerm } from '../../i18n/esTranslations.ts';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from './ToolWorkspacePrimitives.tsx';

interface EngineCalculatorViewProps {
  calculator: CalculatorMeta;
}

export default function EngineCalculatorView({ calculator }: EngineCalculatorViewProps) {
  const { language, t } = useTranslation();
  const isEs = language === 'es';

  const contract = useMemo(() => {
    return CalculationRegistry.get(calculator.id);
  }, [calculator.id]);

  // Initialize input state from contract schema default values
  const initialInputs = useMemo(() => {
    const values: Record<string, any> = {};
    if (contract && contract.inputSchema && contract.inputSchema.fields) {
      for (const field of contract.inputSchema.fields) {
        values[field.name] =
          field.defaultValue !== undefined
            ? field.defaultValue
            : field.type === 'number' ||
              field.type === 'decimal' ||
              field.type === 'integer' ||
              field.type === 'currency' ||
              field.type === 'percentage'
            ? 0
            : '';
      }
    }
    return values;
  }, [contract]);

  const [inputs, setInputs] = useState<Record<string, any>>(initialInputs);

  useEffect(() => {
    setInputs(initialInputs);
  }, [initialInputs]);

  // Execute calculation live on input change
  const executionResult: ExecutionResult = useMemo(() => {
    if (!contract) {
      return {
        success: false,
        calculatorId: calculator.id,
        errors: [
          {
            code: 'CALCULATION_EXECUTION_FAILED',
            message: 'Calculator contract not registered'
          }
        ],
        executionTimeMs: 0,
        timestamp: new Date().toISOString()
      };
    }
    return CalculationExecutor.execute(calculator.id, inputs);
  }, [calculator.id, inputs, contract]);

  const handleInputChange = (fieldName: string, value: any, type: string) => {
    let parsedValue = value;
    if (['number', 'decimal', 'currency', 'percentage', 'integer'].includes(type)) {
      if (value === '' || value === undefined) {
        parsedValue = '';
      } else {
        const num = Number(value);
        parsedValue = isNaN(num) ? value : num;
      }
    }
    setInputs((prev) => ({
      ...prev,
      [fieldName]: parsedValue
    }));
  };

  const handleReset = () => {
    setInputs(initialInputs);
  };

  const handleClear = () => {
    const cleared: Record<string, any> = {};
    if (contract?.inputSchema?.fields) {
      for (const field of contract.inputSchema.fields) {
        cleared[field.name] = field.type === 'checkbox' ? false : '';
      }
    }
    setInputs(cleared);
  };

  if (!contract) {
    return (
      <div className="ui-empty-state space-y-2">
        <AlertCircle className="w-6 h-6 mx-auto text-status-warning" />
        <h3 className="text-sm font-semibold text-text-primary">
          {isEs ? 'Contrato en inicialización' : 'Contract pending'}
        </h3>
        <p className="text-xs text-text-secondary">
          {isEs
            ? 'El contrato de la calculadora se está inicializando en el motor central.'
            : 'Calculator contract is initializing in the calculation engine.'}
        </p>
      </div>
    );
  }

  const { inputSchema } = contract;
  const { formatted, errors, success } = executionResult;

  // Build field error map for inline validation feedback
  const fieldErrors: Record<string, string> = {};
  if (errors && errors.length > 0) {
    for (const err of errors) {
      if (err.field) {
        fieldErrors[err.field] = translateTerm(err.message, language);
      }
    }
  }

  const allInputsBlank = inputSchema.fields.every((field) => {
    const v = inputs[field.name];
    return v === '' || v === undefined || v === null;
  });

  const copySummary =
    success && formatted?.primary
      ? `${calculator.name}\n${translateTerm(formatted.primary.label, language)}: ${formatted.primary.value}${
          formatted.primary.unit ? ` ${translateTerm(formatted.primary.unit, language)}` : ''
        }`
      : undefined;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={t('section.inputParameters')}
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={t('btn.reset')}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {inputSchema.fields.map((field) => {
              const hasError = Boolean(fieldErrors[field.name]);
              const fieldValue = inputs[field.name] !== undefined ? inputs[field.name] : '';
              const localizedLabel = translateTerm(field.label, language);
              const localizedDesc = field.description
                ? translateTerm(field.description, language)
                : undefined;
              const localizedUnit = field.unit ? translateTerm(field.unit, language) : undefined;

              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer py-1">
                      <input
                        type="checkbox"
                        id={field.name}
                        checked={Boolean(fieldValue)}
                        onChange={(e) => handleInputChange(field.name, e.target.checked, field.type)}
                        className="w-4 h-4 rounded border-border-strong accent-[#159B69] dark:accent-[#10B981] cursor-pointer"
                      />
                      <span>{localizedLabel}</span>
                    </label>
                    {localizedDesc && (
                      <p className="text-xs text-text-tertiary">{localizedDesc}</p>
                    )}
                  </div>
                );
              }

              return (
                <ToolFieldGroup
                  key={field.name}
                  label={localizedLabel}
                  htmlFor={field.name}
                  unit={localizedUnit}
                  hint={localizedDesc}
                  error={fieldErrors[field.name]}
                  required={field.required}
                >
                  {field.type === 'select' && field.options ? (
                    <select
                      id={field.name}
                      value={fieldValue}
                      aria-invalid={hasError}
                      onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                      className={`ui-select ${hasError ? 'border-status-error' : ''}`}
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {translateTerm(opt.label, language)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      id={field.name}
                      value={fieldValue}
                      aria-invalid={hasError}
                      onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                      className={`ui-input ${hasError ? 'border-status-error' : ''}`}
                    />
                  ) : (
                    <div className="relative">
                      {field.type === 'currency' && (
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary font-mono text-sm">
                          $
                        </span>
                      )}
                      <input
                        type="number"
                        id={field.name}
                        value={fieldValue}
                        min={field.min}
                        max={field.max}
                        step={field.step || (field.type === 'integer' ? '1' : 'any')}
                        aria-invalid={hasError}
                        onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                        className={`ui-input font-mono tabular-nums ${
                          field.type === 'currency' ? 'pl-7' : ''
                        } ${field.type === 'percentage' || localizedUnit ? 'pr-12' : ''} ${
                          hasError ? 'border-status-error' : ''
                        }`}
                        placeholder={
                          field.defaultValue !== undefined ? String(field.defaultValue) : '0'
                        }
                      />
                      {(field.type === 'percentage' || localizedUnit) && (
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-tertiary font-mono text-xs">
                          {field.type === 'percentage' ? '%' : localizedUnit}
                        </span>
                      )}
                    </div>
                  )}
                </ToolFieldGroup>
              );
            })}
          </form>
        </ToolInputPanel>
      }
      results={
        <div className="space-y-4">
          <ToolResultsPanel
            title={t('section.calculationResults')}
            state={allInputsBlank ? 'empty' : success && formatted ? 'ready' : 'error'}
            primaryLabel={
              formatted?.primary ? translateTerm(formatted.primary.label, language) : undefined
            }
            primaryValue={formatted?.primary?.value}
            primaryUnit={
              formatted?.primary?.unit
                ? translateTerm(formatted.primary.unit, language)
                : undefined
            }
            copyText={copySummary}
            copyLabel={t('btn.copy')}
            copiedLabel={t('btn.copied')}
            emptyTitle={isEs ? 'Introduce los valores para calcular' : 'Enter values to calculate'}
            emptyDescription={
              isEs
                ? 'Completa los campos para ver los resultados en tiempo real.'
                : 'Fill in the input fields to compute live formatted results.'
            }
            errorTitle={t('msg.invalidInputs')}
            errorMessage={
              errors && errors.length > 0
                ? translateTerm(errors[0].message, language)
                : t('msg.checkInputs')
            }
          >
            {success && formatted && (
              <>
                {formatted.secondary && formatted.secondary.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {formatted.secondary.map((sec, idx) => (
                      <ToolMetricTile
                        key={idx}
                        label={translateTerm(sec.label, language)}
                        value={sec.value}
                      />
                    ))}
                  </div>
                )}

                {formatted.summaryText && (
                  <p className="text-xs text-text-secondary leading-relaxed p-3 rounded-xl bg-surface-secondary/60 border border-border-subtle">
                    {translateTerm(formatted.summaryText, language)}
                  </p>
                )}

                {formatted.breakdown && formatted.breakdown.length > 0 && (
                  <ToolBreakdownList
                    items={formatted.breakdown.map((item) => ({
                      label: translateTerm(item.label, language),
                      value: item.value
                    }))}
                  />
                )}
              </>
            )}
          </ToolResultsPanel>

          {contract.formulaMeta?.formulaExpression && (
            <div className="ui-panel p-4 space-y-1.5">
              <div className="text-xs font-semibold text-text-secondary">
                {t('section.formulaExpression')}
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-accent bg-surface-secondary/70 px-3 py-2 rounded-lg border border-border-subtle overflow-x-auto">
                {contract.formulaMeta.formulaExpression}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
