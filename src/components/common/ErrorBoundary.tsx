import React from 'react';
import { AlertTriangle, Home, Grid2X2, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  scope?: 'app' | 'calculator';
  resetKey?: string | number | null;
  onNavigateHome?: () => void;
  onNavigateAllTools?: () => void;
  language?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const scope = this.props.scope || 'app';
    console.error(`[ErrorBoundary:${scope}] Unhandled rendering error:`, error, errorInfo?.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  };

  private handleGoAllTools = () => {
    this.setState({ hasError: false });
    if (this.props.onNavigateAllTools) {
      this.props.onNavigateAllTools();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.assign('/all-calculators');
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isEs =
      this.props.language === 'es' ||
      (typeof document !== 'undefined' && document.documentElement?.lang === 'es');
    const isCalculatorScope = this.props.scope === 'calculator';

    const title = isCalculatorScope
      ? isEs
        ? 'No pudimos mostrar esta herramienta'
        : 'Unable to display this tool'
      : isEs
      ? 'Algo salió mal al cargar la página'
      : 'Something went wrong loading this page';

    const description = isCalculatorScope
      ? isEs
        ? 'Se produjo un error inesperado dentro de esta herramienta. El resto de CalcTools sigue funcionando con normalidad.'
        : 'An unexpected error occurred while rendering this tool. You can retry, return home, or browse another calculator.'
      : isEs
      ? 'Se produjo un error inesperado en la aplicación. Puedes intentar recargar esta vista o volver al inicio.'
      : 'An unexpected error occurred while rendering this view. You can try again, browse all tools, or return to the homepage.';

    return (
      <div
        role="alert"
        aria-live="assertive"
        className={`${
          isCalculatorScope
            ? 'my-4 rounded-2xl border border-border-main bg-surface p-6 sm:p-8'
            : 'min-h-[60vh] flex items-center justify-center p-6'
        }`}
      >
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEs ? 'Reintentar' : 'Try Again'}</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoAllTools}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-primary text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Grid2X2 className="w-4 h-4 text-accent" />
              <span>{isEs ? 'Todas las Herramientas' : 'All Tools'}</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{isEs ? 'Ir al Inicio' : 'Go Home'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
