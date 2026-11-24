import { ShieldAlert, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface TermsPageProps {
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
  onNavigateContact: () => void;
}

export default function TermsPage({
  onNavigateHome,
  onNavigatePrivacy,
  onNavigateContact
}: TermsPageProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-fadeIn">
      {/* Draft Review Notice */}
      <div
        role="note"
        className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/30 p-4 flex items-start gap-3"
      >
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
          <strong className="font-semibold">
            {isEs
              ? 'Borrador pendiente de revisión del propietario:'
              : 'Draft Pending Owner Review:'}
          </strong>{' '}
          {isEs
            ? 'Estos Términos de Uso constituyen un borrador previo a la publicación y deben ser revisados y aprobados por el propietario (y asesoría legal si corresponde) antes de su publicación definitiva. No constituyen asesoramiento legal ni implican cumplimiento normativo certificado.'
            : 'These Terms of Use are a pre-publication draft requiring review and approval by the site owner (and legal counsel if appropriate) before publication. They do not constitute legal advice or a claim of legal compliance.'}
        </div>
      </div>

      <section className="ui-panel p-6 sm:p-8 space-y-6">
        <header className="space-y-2 border-b border-border-subtle pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <Scale className="w-4 h-4" />
            <span>{isEs ? 'Términos y Descargos' : 'Terms & Disclaimers'}</span>
          </div>
          <h1 className="ui-page-title">
            {isEs ? 'Términos de Uso (Borrador)' : 'Terms of Use (Draft)'}
          </h1>
          <p className="ui-body">
            {isEs
              ? 'Condiciones de uso informativo de las calculadoras, conversores y utilidades disponibles en CalcTools.'
              : 'Conditions governing informational use of the calculators, converters, and browser utilities on CalcTools.'}
          </p>
        </header>

        <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
          <div className="space-y-2">
            <h2 className="ui-section-title">
              {isEs ? '1. Uso aceptable y alcance informativo' : '1. Permitted Use & Informational Scope'}
            </h2>
            <p>
              {isEs
                ? 'CalcTools proporciona herramientas interactivas de cálculo, conversión, planificación y procesamiento local de archivos con fines informativos, educativos y de referencia general. Al acceder al sitio, usted acepta utilizar estas herramientas de forma lícita y sin interferir con el funcionamiento ni realizar extracción automatizada abusiva.'
                : 'CalcTools provides interactive calculation, conversion, planning, and browser-local file tools for general informational, educational, and reference purposes. By using this website, you agree to use it lawfully and not to disrupt service availability or perform abusive automated scraping.'}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="ui-section-title flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
              <span>
                {isEs
                  ? '2. Limitaciones de cálculo y responsabilidad de verificación'
                  : '2. Calculation Limitations & User Verification Duty'}
              </span>
            </h2>
            <p>
              {isEs
                ? 'Muchos cálculos utilizan supuestos simplificados, redondeos de punto flotante o parámetros generales que pueden no reflejar leyes locales, comisiones específicas, tolerancias reales ni casos especiales. Usted es el único responsable de verificar de manera independiente cualquier resultado importante antes de tomar decisiones financieras, legales, médicas, constructivas o técnicas.'
                : 'Many tools rely on simplified models, standard assumptions, or floating-point rounding that may not account for jurisdiction-specific rules, lender fees, site conditions, or edge cases. You are solely responsible for independently verifying any material output before relying on it for financial, medical, construction, engineering, or business decisions.'}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="ui-section-title">
              {isEs ? '3. Descargos por área temática' : '3. Domain-Specific Disclaimers'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="ui-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-text-primary">
                  {isEs ? 'Finanzas, Impuestos y Negocios' : 'Financial, Tax & Business'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Solo estimaciones informativas. No constituye asesoramiento financiero, de inversión, hipotecario, contable ni fiscal.'
                    : 'Informational estimates only. Does not constitute financial, investment, lending, accounting, or tax advice.'}
                </p>
              </div>

              <div className="ui-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-text-primary">
                  {isEs ? 'Salud, Nutrición y Embarazo' : 'Health, Fitness & Pregnancy'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Solo referencia general. No sustituye el diagnóstico, consejo o tratamiento de un profesional médico calificado.'
                    : 'General reference only. Not a substitute for diagnosis, medical advice, or treatment by a qualified healthcare professional.'}
                </p>
              </div>

              <div className="ui-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-text-primary">
                  {isEs ? 'Construcción y Materiales' : 'Construction & Materials'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Cantidades orientativas sujetas a desperdicio en obra, códigos de edificación locales y especificaciones del fabricante.'
                    : 'Rough estimates only; actual material quantities depend on site waste, local building codes, and supplier specifications.'}
                </p>
              </div>

              <div className="ui-card p-4 space-y-1.5">
                <h3 className="text-xs font-bold text-text-primary">
                  {isEs ? 'Ingeniería y Electricidad' : 'Engineering & Electrical'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {isEs
                    ? 'Cálculos preliminares sin certificación profesional. No sustituye revisión de ingeniería acreditada ni normas de seguridad.'
                    : 'Preliminary reference only without professional certification. Not a substitute for licensed engineering review or safety codes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="ui-section-title">
              {isEs ? '4. Sin garantías ni certificación profesional' : '4. Disclaimer of Warranties & No Professional Certification'}
            </h2>
            <p>
              {isEs
                ? 'Las herramientas y contenidos se ofrecen «tal cual» y «según disponibilidad», sin garantías expresas ni implícitas de exactitud continua, integridad o idoneidad para un propósito específico. Ninguna herramienta del sitio cuenta con certificación profesional ni garantiza resultados libres de errores. Conserve siempre copias de respaldo de sus archivos antes de procesarlos en herramientas de documentos o PDF.'
                : 'All tools and content are provided on an "as is" and "as available" basis without warranties of any kind, express or implied, regarding accuracy, completeness, or fitness for a particular purpose. Nothing on CalcTools implies professional certification or guaranteed accuracy. Always keep backup copies of original files before processing documents in browser-local PDF or converter tools.'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
          <UiButton variant="primary" size="sm" onClick={onNavigateHome}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigatePrivacy}>
            <span>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateContact}>
            <span>{isEs ? 'Contacto' : 'Contact'}</span>
          </UiButton>
        </div>
      </section>
    </div>
  );
}
