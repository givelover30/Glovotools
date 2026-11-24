import { FileQuestion, Home, Grid2X2, Layers } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import { UiButton } from '../ui/AppPrimitives.tsx';

interface NotFoundViewProps {
  requestedPath: string;
  onNavigateHome: () => void;
  onNavigateAllCalculators: () => void;
  onNavigateCategories: () => void;
}

export default function NotFoundView({
  requestedPath,
  onNavigateHome,
  onNavigateAllCalculators,
  onNavigateCategories
}: NotFoundViewProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const isCalculatorPath = requestedPath.startsWith('/calculator');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 animate-fadeIn">
      <section
        aria-labelledby="not-found-heading"
        className="ui-panel p-6 sm:p-10 text-center space-y-5"
      >
        <div className="mx-auto w-12 h-12 rounded-2xl bg-status-warning-bg text-status-warning border border-border-main flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
            404 · {isEs ? 'Página no encontrada' : 'Page Not Found'}
          </p>
          <h1 id="not-found-heading" className="ui-page-title">
            {isCalculatorPath
              ? isEs
                ? 'Calculadora no encontrada'
                : 'Calculator Not Found'
              : isEs
              ? 'No pudimos encontrar esta página'
              : 'We could not find that page'}
          </h1>
          <p className="ui-body max-w-xl mx-auto">
            {isCalculatorPath
              ? isEs
                ? 'El identificador de calculadora en la URL no coincide con ninguna herramienta registrada.'
                : 'The calculator identifier in the URL does not match any registered tool in the directory.'
              : isEs
              ? 'La ruta solicitada no existe o ha sido movida.'
              : 'The requested URL does not match a valid page or tool route.'}
          </p>
        </div>

        {requestedPath && (
          <div className="inline-block max-w-full px-3.5 py-1.5 rounded-lg border border-border-main bg-surface-secondary text-xs font-mono text-text-secondary break-all">
            {requestedPath}
          </div>
        )}

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <UiButton variant="primary" onClick={onNavigateAllCalculators}>
            <Grid2X2 className="w-4 h-4" />
            <span>{isEs ? 'Explorar Herramientas' : 'Browse All Tools'}</span>
          </UiButton>
          <UiButton variant="secondary" onClick={onNavigateCategories}>
            <Layers className="w-4 h-4 text-accent" />
            <span>{isEs ? 'Ver Categorías' : 'Browse Categories'}</span>
          </UiButton>
          <UiButton variant="secondary" onClick={onNavigateHome}>
            <Home className="w-4 h-4" />
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </UiButton>
        </div>
      </section>
    </div>
  );
}
