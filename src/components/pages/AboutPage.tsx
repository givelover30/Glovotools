import { useMemo } from 'react';
import { ShieldAlert, Calculator, Cpu, HardDrive, Layers, ArrowLeft, Grid2X2 } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { CATEGORIES, SUBCATEGORIES, getUniqueRegisteredToolCount } from '../../data/calculators.ts';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface AboutPageProps {
  onNavigateHome: () => void;
  onNavigateAllCalculators: () => void;
  onNavigateCategories: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export default function AboutPage({
  onNavigateHome,
  onNavigateAllCalculators,
  onNavigateCategories,
  onNavigatePrivacy,
  onNavigateTerms
}: AboutPageProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const stats = useMemo(
    () => ({
      tools: getUniqueRegisteredToolCount(),
      categories: CATEGORIES.filter((c) => c.isActive && c.count > 0).length,
      subcategories: SUBCATEGORIES.length
    }),
    []
  );

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
            ? 'Esta página informativa describe únicamente capacidades verificables en la aplicación actual y requiere revisión del propietario antes de la publicación final.'
            : 'This About page reflects only verifiable project details from the current application and requires owner review prior to public launch.'}
        </div>
      </div>

      <section className="ui-panel p-6 sm:p-8 space-y-6">
        <header className="space-y-2 border-b border-border-subtle pb-5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <Calculator className="w-4 h-4" />
            <span>{isEs ? 'Acerca de la Plataforma' : 'About the Platform'}</span>
          </div>
          <h1 className="ui-page-title">
            {isEs ? 'Acerca de CalcTools (Borrador)' : 'About CalcTools (Draft)'}
          </h1>
          <p className="ui-body">
            {isEs
              ? 'Una aplicación web del lado del cliente con calculadoras, conversores, generadores, planificadores y utilidades de documentos en un solo espacio.'
              : 'A client-side web application bringing together calculators, converters, generators, planners, and document utilities in one workspace.'}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 tabular-nums">
          <div className="ui-card p-4 space-y-1">
            <div className="text-xl font-bold text-text-primary">{stats.tools.toLocaleString()}</div>
            <div className="text-xs text-text-secondary">
              {isEs ? 'Herramientas registradas activas' : 'Registered active tools'}
            </div>
          </div>
          <div className="ui-card p-4 space-y-1">
            <div className="text-xl font-bold text-text-primary">{stats.categories}</div>
            <div className="text-xs text-text-secondary">
              {isEs ? 'Categorías temáticas activas' : 'Active subject categories'}
            </div>
          </div>
          <div className="ui-card p-4 space-y-1">
            <div className="text-xl font-bold text-text-primary">{stats.subcategories}</div>
            <div className="text-xs text-text-secondary">
              {isEs ? 'Subcategorías indexadas' : 'Indexed subcategories'}
            </div>
          </div>
        </div>

        <div className="space-y-5 text-sm text-text-secondary leading-relaxed">
          <div className="flex gap-3">
            <Cpu className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {isEs ? 'Ejecución directa en el navegador' : 'Browser-Side Execution'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm">
                {isEs
                  ? 'Las calculadoras interactivas, conversores de unidades, generadores y utilidades de archivos PDF y documentos se ejecutan localmente dentro de la sesión del navegador sin necesidad de crear una cuenta.'
                  : 'Interactive calculators, unit converters, generators, and browser-based PDF and document utilities run directly inside your browser session without requiring account sign-up.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <HardDrive className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {isEs ? 'Preferencias guardadas en su dispositivo' : 'Device-Local Workspace Preferences'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm">
                {isEs
                  ? 'El modo claro/oscuro, los favoritos, las herramientas recientes y los datos de planificadores se almacenan localmente en localStorage para su comodidad entre visitas en el mismo navegador.'
                  : 'Theme mode, favorites, recently used history, and planner entries are saved locally in browser localStorage for convenience across sessions on the same device.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
          <UiButton variant="primary" size="sm" onClick={onNavigateAllCalculators}>
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>{isEs ? 'Explorar Herramientas' : 'Browse All Tools'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateCategories}>
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>{isEs ? 'Categorías' : 'Categories'}</span>
          </UiButton>
          <UiButton variant="secondary" size="sm" onClick={onNavigateHome}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEs ? 'Inicio' : 'Home'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={onNavigatePrivacy}>
            <span>{isEs ? 'Privacidad' : 'Privacy'}</span>
          </UiButton>
          <UiButton variant="ghost" size="sm" onClick={onNavigateTerms}>
            <span>{isEs ? 'Términos' : 'Terms'}</span>
          </UiButton>
        </div>
      </section>
    </div>
  );
}
