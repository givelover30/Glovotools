import { ShieldAlert, Mail, Wrench, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigateAbout: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export default function ContactPage({
  onNavigateHome,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms
}: ContactPageProps) {
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
              ? 'Borrador pendiente de configuración del propietario:'
              : 'Draft Pending Owner Configuration:'}
          </strong>{' '}
          {isEs
            ? 'Esta página de contacto es un borrador previo al lanzamiento. No existe un canal de correo verificado configurado todavía en el proyecto; el propietario debe agregar un destino de contacto real antes de publicar.'
            : 'This Contact page is a pre-publication draft. No verified public contact destination is configured in the codebase yet; the site owner must add a verified contact address or support channel before publication.'}
        </div>
      </div>

      <section className="ui-panel p-6 sm:p-8 space-y-6">
        <header className="space-y-2 border-b border-border-subtle pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <Mail className="w-4 h-4" />
            <span>{isEs ? 'Contacto y Soporte' : 'Contact & Support'}</span>
          </div>
          <h1 className="ui-page-title">
            {isEs ? 'Contacto (Configuración Pendiente)' : 'Contact (Configuration Pending)'}
          </h1>
          <p className="ui-body">
            {isEs
              ? 'Información de contacto para reportes de errores, dudas sobre fórmulas o consultas administrativas.'
              : 'Contact details for reporting formula issues, technical defects, or administrative inquiries.'}
          </p>
        </header>

        <div className="rounded-xl border border-dashed border-border-strong bg-surface-secondary/60 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Wrench className="w-4 h-4 text-accent shrink-0" />
            <span>
              {isEs
                ? 'Marcador de posición: destino de contacto requerido antes de publicar'
                : 'Owner Action Required: Verified Contact Destination Placeholder'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {isEs
              ? 'No se ha incluido ningún correo electrónico ficticio ni formulario sin envío funcional. Antes de publicar el sitio en producción, el propietario debe reemplazar este bloque con una dirección de correo electrónico verificada o un enlace real a su mesa de soporte.'
              : 'No placeholder email address or nonfunctional submission form has been included here. Prior to public launch, the site owner should replace this section with a monitored, verified support email address or active support portal link.'}
          </p>
          <div className="text-xs font-mono text-text-tertiary bg-surface border border-border-main rounded-lg px-3.5 py-2.5">
            {isEs
              ? '[PENDIENTE_DE_PROPIETARIO: insertar correo o canal de soporte verificado]'
              : '[OWNER_CONFIGURATION_REQUIRED: insert verified support email or helpdesk link]'}
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
          <UiButton variant="primary" size="sm" onClick={onNavigateHome}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateAbout}>
            <span>{isEs ? 'Acerca de CalcTools' : 'About CalcTools'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigatePrivacy}>
            <span>{isEs ? 'Privacidad' : 'Privacy'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateTerms}>
            <span>{isEs ? 'Términos' : 'Terms'}</span>
          </UiButton>
        </div>
      </section>
    </div>
  );
}
