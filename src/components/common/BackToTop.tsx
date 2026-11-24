import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const label = language === 'es' ? 'Volver arriba' : 'Back to top';

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      className={`no-print fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border border-border-main bg-surface/95 dark:bg-surface-elevated/95 backdrop-blur-lg text-text-primary shadow-lg transition-all duration-200 hover:border-accent hover:text-accent hover:-translate-y-0.5 active:translate-y-0 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-3 pointer-events-none scale-95'
      }`}
    >
      <ArrowUp className="w-4 h-4 stroke-[2.4]" />
    </button>
  );
}
