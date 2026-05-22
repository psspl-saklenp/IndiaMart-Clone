'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

const LABEL_MAP: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;
  const starSize = SIZE_MAP[size];

  return (
    <span className="star-rating" aria-label={`Rating: ${value} out of 5 stars`}>
      <span
        className="star-rating__stars"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
        onMouseLeave={() => !readonly && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={`star-btn ${starSize} ${readonly ? 'star-btn--readonly' : 'star-btn--interactive'}`}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: readonly ? 'default' : 'pointer',
              transition: 'transform 0.12s ease',
            }}
          >
            <svg
              className={starSize}
              viewBox="0 0 24 24"
              fill={star <= active ? '#F59E0B' : 'none'}
              stroke={star <= active ? '#F59E0B' : '#D1D5DB'}
              strokeWidth="1.5"
              style={{
                transition: 'fill 0.12s ease, stroke 0.12s ease',
                filter: !readonly && star <= (hovered || 0) ? 'drop-shadow(0 0 3px rgba(245,158,11,0.6))' : 'none',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </span>
      {showLabel && !readonly && active > 0 && (
        <span
          style={{
            marginLeft: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#F59E0B',
          }}
        >
          {LABEL_MAP[active]}
        </span>
      )}
    </span>
  );
}
