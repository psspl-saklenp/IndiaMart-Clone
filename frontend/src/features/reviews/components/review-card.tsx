'use client';

import { useState } from 'react';
import type { Review } from '@/types/reviews';
import { StarRating } from './star-rating';
import { deleteReview } from '../api';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string | null;
  onEdit?: (review: Review) => void;
  onDeleted?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function ReviewCard({ review, currentUserId, onEdit, onDeleted }: ReviewCardProps) {
  const [deleting, setDeleting] = useState(false);
  const isOwner = currentUserId === review.reviewerId;

  async function handleDelete() {
    if (!confirm('Delete your review?')) return;
    setDeleting(true);
    try {
      await deleteReview(review.id);
      onDeleted?.(review.id);
    } catch {
      alert('Failed to delete review. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <article className="review-card" id={`review-${review.id}`}>
      <header className="review-card__header">
        <div className="review-card__avatar" aria-hidden="true">
          {review.reviewerName.charAt(0).toUpperCase()}
        </div>
        <div className="review-card__meta">
          <div className="review-card__top-row">
            <span className="review-card__name">{review.reviewerName}</span>
            {review.isVerified && (
              <span className="review-card__verified" title="Verified purchase">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="review-card__rating-row">
            <StarRating value={review.rating} readonly size="sm" />
            <time className="review-card__date" dateTime={review.createdAt}>
              {timeAgo(review.createdAt)}
            </time>
          </div>
        </div>
        {isOwner && (
          <div className="review-card__actions">
            <button
              type="button"
              className="review-card__action-btn"
              onClick={() => onEdit?.(review)}
              aria-label="Edit review"
            >
              Edit
            </button>
            <button
              type="button"
              className="review-card__action-btn review-card__action-btn--danger"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete review"
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        )}
      </header>

      {review.title && <p className="review-card__title">{review.title}</p>}
      {review.body && <p className="review-card__body">{review.body}</p>}
    </article>
  );
}
