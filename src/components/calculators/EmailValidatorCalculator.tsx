import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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

const DEFAULT_EMAIL = 'support@calctools.io';

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'throwawaymail.com',
  '10minutemail.com',
  'trashmail.com',
  'guerrillamail.com',
  'mailinator.com'
]);

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default function EmailValidatorCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [email, setEmail] = useState<string>(DEFAULT_EMAIL);

  const analysis = useMemo(() => {
    const clean = email.trim();
    if (!clean) {
      return { state: 'empty' as const };
    }

    const parts = clean.split('@');
    if (parts.length !== 2) {
      return {
        state: 'error' as const,
        errorMessage: isEs
          ? 'La dirección debe contener exactamente un símbolo "@".'
          : 'Address must contain exactly one "@" symbol.'
      };
    }

    const [localPart, domain] = parts;
    const issues: string[] = [];

    if (!EMAIL_REGEX.test(clean)) {
      issues.push(
        isEs
          ? 'Formato de correo inválido (verifica usuario, "@" y dominio con extensión).'
          : 'Invalid email syntax (check local part, "@", and domain with TLD).'
      );
    }
    if (localPart.length === 0 || localPart.length > 64) {
      issues.push(
        isEs
          ? 'La parte local debe tener entre 1 y 64 caracteres.'
          : 'Local part must be between 1 and 64 characters.'
      );
    }
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      issues.push(
        isEs
          ? 'La parte local no puede iniciar ni terminar con punto ni contener "..".'
          : 'Local part cannot start/end with a dot or contain consecutive dots ("..").'
      );
    }
    if (domain.length > 253 || domain.includes('..')) {
      issues.push(
        isEs
          ? 'El dominio excede 253 caracteres o contiene puntos consecutivos.'
          : 'Domain exceeds 253 characters or contains consecutive dots.'
      );
    }

    const tld = domain.split('.').pop() || '';
    if (tld.length < 2 || !/^[A-Za-z]{2,}$/.test(tld)) {
      issues.push(
        isEs
          ? 'La extensión de dominio (TLD) debe tener al menos 2 letras.'
          : 'Top-level domain (TLD) must be at least 2 alphabetic characters.'
      );
    }

    if (issues.length > 0) {
      return {
        state: 'error' as const,
        errorMessage: issues.join(' ')
      };
    }

    const normalizedDomain = domain.toLowerCase();
    const isDisposable = DISPOSABLE_DOMAINS.has(normalizedDomain);

    return {
      state: 'ready' as const,
      clean,
      localPart,
      domain: normalizedDomain,
      tld: tld.toLowerCase(),
      isDisposable
    };
  }, [email, isEs]);

  const handleClear = () => setEmail('');
  const handleReset = () => setEmail(DEFAULT_EMAIL);

  const copySummary =
    analysis.state === 'ready'
      ? `${analysis.clean} | Valid Email | Local: ${analysis.localPart} | Domain: ${analysis.domain} | Disposable: ${analysis.isDisposable ? 'Yes' : 'No'}`
      : undefined;

  return (
    <ToolSplitWorkspace
      ratio="6-6"
      inputs={
        <ToolInputPanel
          title={isEs ? 'Validador de Correo Electrónico' : 'Email Address Validator'}
          subtitle={
            isEs
              ? 'Verifica sintaxis RFC 5322, longitud de usuario/dominio y detección de dominios temporales.'
              : 'Checks RFC 5322 syntax, local/domain length limits, TLD validity, and disposable domain detection.'
          }
          onClear={handleClear}
          onReset={handleReset}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
        >
          <ToolFieldGroup
            label={isEs ? 'Dirección de correo electrónico' : 'Email Address'}
            htmlFor="email-validator-input"
            unit="RFC 5322"
          >
            <input
              id="email-validator-input"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="ui-input font-mono text-sm"
            />
          </ToolFieldGroup>

          <ToolPresetBar
            label={isEs ? 'Ejemplos:' : 'Examples:'}
            presets={[
              {
                label: isEs ? 'Correo válido' : 'Valid Email',
                onSelect: () => setEmail(DEFAULT_EMAIL)
              },
              {
                label: isEs ? 'Dominio temporal' : 'Disposable Domain',
                onSelect: () => setEmail('temp.user@tempmail.com')
              },
              {
                label: isEs ? 'Formato inválido' : 'Invalid Format',
                onSelect: () => setEmail('bad..email@invalid')
              }
            ]}
          />
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultado de validación' : 'Validation Result'}
          state={analysis.state}
          primaryLabel={isEs ? 'Estado del correo' : 'Email Status'}
          primaryValue={
            analysis.state === 'ready'
              ? analysis.isDisposable
                ? isEs
                  ? 'Válido (Temporal)'
                  : 'Valid (Disposable)'
                : isEs
                  ? 'Correo Válido'
                  : 'Valid Email'
              : undefined
          }
          primarySubtext={
            analysis.state === 'ready'
              ? analysis.isDisposable
                ? isEs
                  ? 'La sintaxis es válida, pero el dominio pertenece a un proveedor de correo desechable.'
                  : 'Syntax is valid, but this domain is flagged as a disposable email provider.'
                : isEs
                  ? 'Cumple con las reglas de sintaxis RFC 5322 y estructura de dominio.'
                  : 'Meets RFC 5322 syntax rules, length limits, and standard domain structure.'
              : undefined
          }
          statusLabel={
            analysis.state === 'ready'
              ? analysis.isDisposable
                ? isEs
                  ? 'Advertencia'
                  : 'Warning'
                : isEs
                  ? 'Válido'
                  : 'Valid'
              : undefined
          }
          statusTone={
            analysis.state === 'ready' && analysis.isDisposable ? 'warning' : 'success'
          }
          copyText={copySummary}
          copyLabel={isEs ? 'Copiar resumen' : 'Copy summary'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa un correo electrónico' : 'Enter an email address'}
          emptyDescription={
            isEs
              ? 'Escribe una dirección de correo para inspeccionar su formato y dominio.'
              : 'Type an email address on the left to inspect syntax and domain classification.'
          }
          errorTitle={isEs ? 'Formato de correo inválido' : 'Invalid Email Syntax'}
          errorMessage={analysis.state === 'error' ? analysis.errorMessage : undefined}
        >
          {analysis.state === 'ready' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ToolMetricTile
                  label={isEs ? 'Parte local' : 'Local Part'}
                  value={analysis.localPart}
                  accent
                />
                <ToolMetricTile
                  label={isEs ? 'Dominio' : 'Domain'}
                  value={analysis.domain}
                />
              </div>

              <ToolBreakdownList
                items={[
                  {
                    label: isEs ? 'Extensión (TLD)' : 'Top-Level Domain (TLD)',
                    value: `.${analysis.tld}`
                  },
                  {
                    label: isEs ? 'Longitud parte local' : 'Local Part Length',
                    value: `${analysis.localPart.length} / 64`
                  },
                  {
                    label: isEs ? 'Longitud dominio' : 'Domain Length',
                    value: `${analysis.domain.length} / 253`
                  },
                  {
                    label: isEs ? 'Proveedor temporal' : 'Disposable Provider',
                    value: analysis.isDisposable
                      ? isEs
                        ? 'Detectado'
                        : 'Detected'
                      : isEs
                        ? 'No'
                        : 'No',
                    highlight: analysis.isDisposable
                  }
                ]}
              />

              {analysis.isDisposable && (
                <div
                  role="alert"
                  className="rounded-xl border border-status-warning/30 bg-status-warning-bg p-3 text-xs text-text-primary flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                  <span>
                    {isEs
                      ? `Dominio desechable conocido (${analysis.domain}). Considera requerir un correo permanente.`
                      : `Known disposable email domain (${analysis.domain}). Consider requiring a permanent address.`}
                  </span>
                </div>
              )}
            </div>
          )}
        </ToolResultsPanel>
      }
    />
  );
}
