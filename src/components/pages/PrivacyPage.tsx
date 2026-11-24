import { ShieldAlert, ShieldCheck, HardDrive, Globe, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface PrivacyPageProps {
  onNavigateHome: () => void;
  onNavigateTerms: () => void;
  onNavigateContact: () => void;
}

export default function PrivacyPage({
  onNavigateHome,
  onNavigateTerms,
  onNavigateContact
}: PrivacyPageProps) {
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
            ? 'Esta Política de Privacidad es un borrador previo a la publicación basado en el comportamiento técnico actual de la aplicación. No constituye asesoramiento legal ni declaración de cumplimiento normativo y debe ser revisada por el propietario antes de su publicación.'
            : 'This Privacy Policy is a pre-publication draft reflecting the current technical behavior of the application. It does not constitute legal advice or a claim of legal compliance and must be reviewed and approved by the site owner before publication.'}
        </div>
      </div>

      <section className="ui-panel p-6 sm:p-8 space-y-6">
        <header className="space-y-2 border-b border-border-subtle pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <ShieldCheck className="w-4 h-4" />
            <span>{isEs ? 'Privacidad y Datos' : 'Privacy & Data Practices'}</span>
          </div>
          <h1 className="ui-page-title">
            {isEs ? 'Política de Privacidad (Borrador)' : 'Privacy Policy (Draft)'}
          </h1>
          <p className="ui-body">
            {isEs
              ? 'Descripción transparente sobre el funcionamiento local en navegador, el almacenamiento en localStorage y las solicitudes externas realizadas por CalcTools.'
              : 'A transparent summary of browser-local processing, localStorage persistence, and external network requests in CalcTools.'}
          </p>
        </header>

        <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
          <div className="space-y-2">
            <h2 className="ui-section-title flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accent shrink-0" />
              <span>
                {isEs
                  ? '1. Procesamiento local e información que no recopilamos'
                  : '1. Browser-Local Processing & Information We Do Not Collect'}
              </span>
            </h2>
            <p>
              {isEs
                ? 'CalcTools funciona como una aplicación web del lado del cliente. No requiere registro ni cuentas de usuario, y el código actual de la aplicación no envía sus entradas numéricas, resultados de cálculo ni documentos procesados (PDF u otros archivos) a un servidor de aplicación propio de CalcTools.'
                : 'CalcTools operates as a client-side web application. It does not require user accounts or registration, and the current application code does not transmit your calculator inputs, calculation outputs, or locally processed files (such as PDFs or office documents) to a CalcTools application backend.'}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="ui-section-title">
              {isEs
                ? '2. Almacenamiento local del navegador (localStorage)'
                : '2. Browser Local Storage (localStorage)'}
            </h2>
            <p>
              {isEs
                ? 'Para recordar sus preferencias y el estado de ciertas herramientas en su propio dispositivo, la aplicación utiliza localStorage del navegador. Estos datos permanecen únicamente en su navegador y usted puede borrarlos en cualquier momento desde la configuración de datos del sitio de su navegador:'
                : 'To remember preferences and tool state on your own device, the application stores data in browser localStorage. These values stay on your device and can be cleared anytime through your browser site-data controls:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                <span className="font-mono text-text-primary">calctools_theme</span>,{' '}
                <span className="font-mono text-text-primary">calctools_lang</span>,{' '}
                <span className="font-mono text-text-primary">calctools_sidebar_collapsed</span>:{' '}
                {isEs ? 'tema visual, idioma seleccionado y estado de la barra lateral.' : 'theme preference, selected language, and sidebar state.'}
              </li>
              <li>
                <span className="font-mono text-text-primary">calctools_global_favorites</span>,{' '}
                <span className="font-mono text-text-primary">calctools_recent_calculators</span>,{' '}
                <span className="font-mono text-text-primary">calctools_recent_usage_counts</span>:{' '}
                {isEs ? 'herramientas favoritas e historial reciente local.' : 'saved favorites and local recently used tools.'}
              </li>
              <li>
                <span className="font-mono text-text-primary">calctools_user_rating_*</span>{' '}
                {isEs ? 'y claves locales de planificadores/rastreadores:' : 'and planner/tracker storage keys:'}{' '}
                {isEs
                  ? 'valoraciones locales y datos guardados opcionalmente dentro de planificadores o rastreadores.'
                  : 'local rating selections and entries you save inside interactive planner or tracker tools.'}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="ui-section-title flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent shrink-0" />
              <span>
                {isEs
                  ? '3. Servicios de terceros, fuentes y CDN'
                  : '3. Third-Party Services, Fonts & External Requests'}
              </span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong className="text-text-primary">Google Fonts:</strong>{' '}
                {isEs
                  ? 'La aplicación carga las tipografías Inter, Plus Jakarta Sans y JetBrains Mono desde fonts.googleapis.com y fonts.gstatic.com. Al cargar estas fuentes, su navegador envía solicitudes HTTP estándar (incluyendo dirección IP y agente de usuario) a Google.'
                  : 'The application loads Inter, Plus Jakarta Sans, and JetBrains Mono stylesheets and font files from fonts.googleapis.com and fonts.gstatic.com. Requesting these fonts transmits standard HTTP request metadata (such as IP address and browser user-agent) to Google.'}
              </li>
              <li>
                <strong className="text-text-primary">
                  {isEs ? 'Datos de idioma OCR bajo demanda (jsDelivr CDN):' : 'On-Demand OCR Language Data (jsDelivr CDN):'}
                </strong>{' '}
                {isEs
                  ? 'Si utiliza funciones de reconocimiento óptico de caracteres (OCR) en herramientas PDF y los datos de entrenamiento no están en caché, el navegador puede descargar modelos de idioma desde cdn.jsdelivr.net.'
                  : 'If you invoke Optical Character Recognition (OCR) inside PDF tools and the required language pack is not cached locally, your browser may download OCR training data from cdn.jsdelivr.net.'}
              </li>
              <li>
                <strong className="text-text-primary">
                  {isEs ? 'Analítica y publicidad:' : 'Analytics & Advertising:'}
                </strong>{' '}
                {isEs
                  ? 'El código fuente actual no incluye etiquetas de Google AdSense, Google Analytics ni rastreadores publicitarios de terceros. Si el propietario habilita estos servicios en el futuro, este borrador deberá actualizarse antes de activarlos.'
                  : 'The current codebase does not embed Google AdSense, Google Analytics, or third-party ad networks. If the owner adds analytics or advertising before or after launch, this policy must be updated prior to activation.'}
              </li>
              <li>
                <strong className="text-text-primary">
                  {isEs ? 'Enlaces externos para compartir:' : 'External Share Links:'}
                </strong>{' '}
                {isEs
                  ? 'Los botones opcionales para compartir en X, LinkedIn o Facebook solo contactan a esas plataformas si usted decide hacer clic en ellos.'
                  : 'Optional social share buttons (X, LinkedIn, Facebook) only open external platform URLs when you explicitly click them.'}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="ui-section-title">
              {isEs ? '4. Cookies y registros del servidor de alojamiento' : '4. Cookies & Web Hosting Logs'}
            </h2>
            <p>
              {isEs
                ? 'El código de la aplicación CalcTools no establece cookies propias mediante document.cookie. Sin embargo, los proveedores de alojamiento web, redes de entrega de contenido (CDN) o servicios de terceros solicitados por el navegador pueden procesar registros técnicos de acceso (como dirección IP, marca de tiempo y URL solicitada) o utilizar sus propias tecnologías según sus políticas.'
                : 'CalcTools application code does not set first-party HTTP cookies via document.cookie. However, the hosting provider, network infrastructure, or third-party font/CDN providers invoked by your browser may process standard server access logs (such as IP address, timestamp, and requested path) under their own operational policies.'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
          <UiButton variant="primary" size="sm" onClick={onNavigateHome}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateTerms}>
            <span>{isEs ? 'Términos de Uso' : 'Terms of Use'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateContact}>
            <span>{isEs ? 'Contacto' : 'Contact'}</span>
          </UiButton>
        </div>
      </section>
    </div>
  );
}
