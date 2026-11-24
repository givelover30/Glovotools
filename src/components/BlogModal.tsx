import { useEffect } from 'react';
import { X, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext.tsx';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: (id: any) => void;
}

export default function BlogModal({ isOpen, onClose, onSelectCalculator }: BlogModalProps) {
  const { language } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const articles =
    language === 'es'
      ? [
          {
            title: 'Cómo Funciona la Amortización de Préstamos en 2026',
            readTime: '4 min de lectura',
            summary:
              'Aprenda cómo evoluciona la proporción entre capital e intereses con el tiempo y por qué los pagos anticipados ahorran miles en intereses compuestos.',
            calculatorId: 'loan-mortgage'
          },
          {
            title: 'Comprendiendo el IMC: Historia, Validez y Mejores Alternativas',
            readTime: '3 min de lectura',
            summary:
              'Por qué el Índice de Masa Corporal es una métrica de evaluación inicial útil y cómo se compara con el porcentaje de grasa corporal y la relación cintura-altura.',
            calculatorId: 'bmi'
          },
          {
            title: 'Guía Maestra para la Estimación Precisa de Azulejos y Pisos',
            readTime: '5 min de lectura',
            summary:
              'Regla de oro: por qué el 10% de desperdicio es estándar para patrones rectos, y por qué se requiere un 15% para patrones en espiga o diagonales.',
            calculatorId: 'construction-calc'
          }
        ]
      : [
          {
            title: 'How Loan Amortization Works in 2026',
            readTime: '4 min read',
            summary:
              'Learn how principal and interest ratios shift over time, and why extra early payments save thousands in compound interest.',
            calculatorId: 'loan-mortgage'
          },
          {
            title: 'Understanding BMI: History, Validity & Better Alternatives',
            readTime: '3 min read',
            summary:
              'Why Body Mass Index is a helpful baseline screening metric and how it compares to body fat percentage and waist-to-height ratio.',
            calculatorId: 'bmi'
          },
          {
            title: 'The Master Guide to Accurate Room & Tile Estimates',
            readTime: '5 min read',
            summary:
              'Rule of thumb: why 10% waste allowance is standard for square tiles, and why 15% is needed for herringbone and diagonal layouts.',
            calculatorId: 'construction-calc'
          }
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/65 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-main rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={language === 'es' ? 'Cerrar guías' : 'Close guides dialog'}
          className="absolute right-5 top-5 h-9 w-9 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 id="blog-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              {language === 'es' ? 'Guías y Artículos de CalcTools' : 'CalcTools Guides & Insights'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {language === 'es'
                ? 'Tutoriales prácticos, desglose de fórmulas y consejos matemáticos'
                : 'Practical tutorials, formula breakdowns, and mathematical tips'}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border-main bg-surface-secondary/60 hover:border-accent/60 transition-colors space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <span className="font-semibold text-accent">
                  {language === 'es' ? 'Guía' : 'Guide'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{art.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-text-primary">{art.title}</h3>
              <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
                {art.summary}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectCalculator(art.calculatorId);
                  }}
                  className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {language === 'es'
                      ? 'Abrir Calculadora Correspondiente'
                      : 'Launch Corresponding Calculator'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
