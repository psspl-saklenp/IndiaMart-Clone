import type { RatingSummary } from '@/types/reviews';
import { StarRating } from './star-rating';

interface RatingSummaryProps {
  summary: RatingSummary;
}

export function RatingSummaryPanel({ summary }: RatingSummaryProps) {
  const { average, count, breakdown } = summary;

  return (
    <div className="rating-summary">
      <div className="rating-summary__left">
        <span className="rating-summary__avg">
          {average !== null ? average.toFixed(1) : '—'}
        </span>
        <StarRating value={average ? Math.round(average) : 0} readonly size="md" />
        <span className="rating-summary__count">
          {count.toLocaleString()} {count === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="rating-summary__bars">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const cnt = breakdown[star] ?? 0;
          const pct = count > 0 ? Math.round((cnt / count) * 100) : 0;
          return (
            <div key={star} className="rating-summary__bar-row">
              <span className="rating-summary__bar-label">{star} ★</span>
              <div className="rating-summary__bar-track">
                <div
                  className="rating-summary__bar-fill"
                  style={{ width: `${pct}%` }}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                />
              </div>
              <span className="rating-summary__bar-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
