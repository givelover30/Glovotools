import { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { CalculatorId } from '../../types.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorRatingProps {
  calculatorId: CalculatorId;
}

export default function CalculatorRating({ calculatorId }: CalculatorRatingProps) {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);

  useEffect(() => {
    setUserRating(0);
    setHasRated(false);
    try {
      const savedUserRating = localStorage.getItem(`calctools_user_rating_${calculatorId}`);
      if (savedUserRating) {
        const parsed = Number(savedUserRating);
        if (parsed >= 1 && parsed <= 5) {
          setUserRating(parsed);
          setHasRated(true);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, [calculatorId]);

  const handleRate = (rating: number) => {
    setUserRating(rating);
    setHasRated(true);
    try {
      localStorage.setItem(`calctools_user_rating_${calculatorId}`, rating.toString());
    } catch {
      // Ignore storage write errors
    }
  };

  return (
    <div className="ui-panel px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
            {isEs ? '¿Te resultó útil esta herramienta?' : 'Was this tool helpful?'}
          </h3>
          {hasRated && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <CheckCircle className="w-3.5 h-3.5" />
              {isEs ? `Guardado (${userRating}/5)` : `Saved (${userRating}/5)`}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">
          {isEs
            ? 'Tu valoración personal se guarda únicamente en este dispositivo.'
            : 'Personal feedback saved locally in your browser.'}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div
          className="flex items-center gap-0.5"
          role="group"
          aria-label={isEs ? 'Valoración personal con estrellas' : 'Personal star feedback'}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (hoverRating || userRating) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} out of 5 stars`}
                aria-pressed={userRating === star}
                className="p-1 transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${
                    active
                      ? 'fill-amber-400 stroke-amber-500 text-amber-500'
                      : 'stroke-border-strong text-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
