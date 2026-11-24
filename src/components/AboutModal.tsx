import { useEffect } from 'react';
import { X, ShieldCheck, Zap, Code2, Heart } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext.tsx';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/65 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-main rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={language === 'es' ? 'Cerrar ventana' : 'Close dialog'}
          className="absolute right-5 top-5 h-9 w-9 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white mb-3.5 shadow-xs">
            <Heart className="w-5 h-5" />
          </div>
          <h2 id="about-modal-title" className="text-2xl font-bold tracking-tight text-text-primary">
            {language === 'es' ? 'Acerca de CalcTools' : 'About CalcTools'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {language === 'es'
              ? 'Calculadoras en línea gratuitas, rápidas y privadas creadas para la vida diaria.'
              : 'Free, fast, and private online calculators built for everyday life.'}
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-[13px] text-text-secondary leading-relaxed border-t border-border-subtle pt-4">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary text-sm">
                {language === 'es' ? 'Motor Instantáneo en el Cliente' : 'Instant Client-Side Engine'}
              </h4>
              <p className="mt-0.5">
                {language === 'es'
                  ? 'Cada cálculo se ejecuta directamente en su dispositivo en milisegundos, sin demoras ni llamadas a servidores externos.'
                  : 'Every calculation runs on your local machine in milliseconds without waiting for server responses.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary text-sm">
                {language === 'es' ? 'Privacidad Absoluta' : 'Absolute Privacy'}
              </h4>
              <p className="mt-0.5">
                {language === 'es'
                  ? 'No guardamos, rastreamos ni transmitimos sus datos numéricos. Toda la información permanece de manera confidencial en la memoria de su navegador.'
                  : 'We do not store, log, or track your personal numbers or calculation results. Your data remains entirely in your browser memory.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Code2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary text-sm">
                {language === 'es' ? 'Sin APIs de Pago ni Suscripciones' : 'No Paid APIs or Paywalls'}
              </h4>
              <p className="mt-0.5">
                {language === 'es'
                  ? 'Basado enteramente en fórmulas matemáticas transparentes y estándares abiertos con cero tarifas o costos ocultos.'
                  : 'Built exclusively on open mathematical standards and transparent formulas with zero subscription fees.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {language === 'es' ? 'Entendido, volver a las calculadoras' : 'Got it, take me back to calculators'}
          </button>
        </div>
      </div>
    </div>
  );
}
