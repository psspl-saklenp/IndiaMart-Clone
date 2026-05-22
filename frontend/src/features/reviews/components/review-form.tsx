'use client';

import { useEffect, useState } from 'react';
import type { Review } from '@/types/reviews';
import { StarRating } from './star-rating';
import { createReview, updateReview } from '../api';

interface ReviewFormProps {
  productId: string;
  /** If provided, the form is in edit mode */
  editingReview?: Review | null;
  onSuccess: (review: Review) => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, editingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(editingReview?.rating ?? 0);
  const [title, setTitle] = useState(editingReview?.title ?? '');
  const [body, setBody] = useState(editingReview?.body ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(editingReview);

  // Sync state when editingReview prop changes
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setTitle(editingReview.title ?? '');
      setBody(editingReview.body ?? '');
    } else {
      setRating(0);
      setTitle('');
      setBody('');
    }
    setError(null);
  }, [editingReview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let saved: Review;
      if (isEditing && editingReview) {
        saved = await updateReview(editingReview.id, { rating, title: title || undefined, body: body || undefined });
      } else {
        saved = await createReview({ productId, rating, title: title || undefined, body: body || undefined });
      }
      onSuccess(saved);
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setBody('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg.includes('already reviewed') ? 'You have already reviewed this product.' : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h3 className="review-form__title">
        {isEditing ? 'Edit your review' : 'Write a review'}
      </h3>

      <div className="review-form__field">
        <label className="review-form__label">Your rating *</label>
        <StarRating value={rating} onChange={setRating} size="lg" showLabel />
      </div>

      <div className="review-form__field">
        <label htmlFor="review-title" className="review-form__label">
          Title <span className="review-form__optional">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          className="review-form__input"
          placeholder="Summarise your experience"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="review-body" className="review-form__label">
          Review <span className="review-form__optional">(optional)</span>
        </label>
        <textarea
          id="review-body"
          className="review-form__textarea"
          placeholder="Share details about your purchase experience, product quality, delivery, etc."
          rows={4}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {error && <p className="review-form__error" role="alert">{error}</p>}

      <div className="review-form__actions">
        {onCancel && (
          <button
            type="button"
            className="review-form__btn review-form__btn--ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          id="review-submit-btn"
          className="review-form__btn review-form__btn--primary"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Submit review'}
        </button>
      </div>
    </form>
  );
}
