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
  const [averageRating, setAverageRating] = useState<number>(4.8);
  const [totalCount, setTotalCount] = useState<number>(128);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    setUserRating(0);
    setHasVoted(false);
    try {
      const savedUserRating = localStorage.getItem(`calctools_user_rating_${calculatorId}`);
      const savedStats = localStorage.getItem(`calctools_rating_stats_${calculatorId}`);
      if (savedUserRating) {
        setUserRating(Number(savedUserRating));
        setHasVoted(true);
      }
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        if (parsed.avg && parsed.count) {
          setAverageRating(parsed.avg);
          setTotalCount(parsed.count);
        }
      } else {
        const base = 4.6 + (calculatorId.charCodeAt(0) % 4) * 0.1;
        const count = 85 + calculatorId.length * 7;
        setAverageRating(Number(base.toFixed(1)));
        setTotalCount(count);
      }
    } catch {
      // Ignore storage access errors
    }
  }, [calculatorId]);

  const handleRate = (rating: number) => {
    const prevRating = userRating;
    setUserRating(rating);
    setHasVoted(true);
    try {
      localStorage.setItem(`calctools_user_rating_${calculatorId}`, rating.toString());
      const newTotalCount = totalCount + (prevRating === 0 ? 1 : 0);
      const newAvg = Number(
        ((averageRating * totalCount - (prevRating || 0) + rating) / newTotalCount).toFixed(1)
      );
      setAverageRating(newAvg);
      setTotalCount(newTotalCount);
      localStorage.setItem(
        `calctools_rating_stats_${calculatorId}`,
        JSON.stringify({ avg: newAvg, count: newTotalCount })
      );
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
          {hasVoted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <CheckCircle className="w-3.5 h-3.5" />
              {isEs ? 'Gracias por valorar' : 'Rated'}
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">
          {isEs
            ? 'Califica la precisión y facilidad de uso de esta herramienta.'
            : 'Rate the accuracy and ease of use of this tool.'}
        </p>
      </div>

      <div className="flex items-center gap-3.5 shrink-0">
        <div className="flex items-center gap-0.5" role="group" aria-label={isEs ? 'Valoración con estrellas' : 'Star rating'}>
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

        <div className="text-right pl-3 border-l border-border-subtle tabular-nums">
          <div className="text-xs font-mono font-bold text-text-primary">
            {averageRating} <span className="text-[11px] font-normal text-text-tertiary">/ 5.0</span>
          </div>
          <div className="text-[11px] text-text-tertiary">
            {totalCount} {isEs ? 'votos' : 'ratings'}
          </div>
        </div>
      </div>
    </div>
  );
}
