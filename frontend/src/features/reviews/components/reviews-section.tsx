'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import type { PaginatedReviews, RatingSummary, Review } from '@/types/reviews';
import { getReviewSummary, listReviews } from '../api';
import { RatingSummaryPanel } from './rating-summary';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';

interface ReviewsSectionProps {
  productId: string;
  sellerId: string;
}

const PAGE_SIZE = 6;

export function ReviewsSection({ productId, sellerId }: ReviewsSectionProps) {
  const user = useAppSelector((s) => s.auth.user);
  const authStatus = useAppSelector((s) => s.auth.status);

  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<PaginatedReviews['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // The seller of this product cannot write a review
  const isOwnProduct = user?.id === sellerId;
  // Authenticated non-seller users can write a review
  const canReview = authStatus === 'authenticated' && !isOwnProduct;

  // Check if the current user has already reviewed this product
  const myReview = reviews.find((r) => r.reviewerId === user?.id) ?? null;
  // Hide the form if they already have a review (they can edit via the card)
  const showForm = canReview && !myReview && !editingReview;
  const showEditForm = canReview && editingReview;

  const loadSummary = useCallback(async () => {
    try {
      const s = await getReviewSummary(productId);
      setSummary(s);
    } catch {
      // silently ignore — not fatal
    }
  }, [productId]);

  const loadPage = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const result = await listReviews({ productId, page: pageNum, limit: PAGE_SIZE });
        setReviews((prev) => (append ? [...prev, ...result.data] : result.data));
        setMeta(result.meta);
      } catch {
        // ignore
      }
    },
    [productId],
  );

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await Promise.all([loadSummary(), loadPage(1)]);
      setInitialLoading(false);
    })();
  }, [loadSummary, loadPage]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    await loadPage(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  }

  function handleReviewSubmitted(review: Review) {
    setEditingReview(null);
    // Refresh reviews and summary to reflect changes
    setPage(1);
    loadPage(1);
    loadSummary();
    // If this was an edit, update in place
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.id === review.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = review;
        return updated;
      }
      return [review, ...prev];
    });
  }

  function handleDeleted(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    loadSummary();
  }

  const hasMore = meta ? page < (meta.totalPages ?? 1) : false;

  return (
    <section className="reviews-section" id="product-reviews" aria-labelledby="reviews-heading">
      <h2 className="reviews-section__heading" id="reviews-heading">
        Customer Reviews
        {summary && summary.count > 0 && (
          <span className="reviews-section__count"> ({summary.count})</span>
        )}
      </h2>

      {/* Rating summary */}
      {!initialLoading && summary && (
        summary.count > 0 ? (
          <RatingSummaryPanel summary={summary} />
        ) : (
          <div className="reviews-section__empty-summary">
            <span className="reviews-section__empty-stars">☆☆☆☆☆</span>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )
      )}

      {/* Write a review form */}
      {!initialLoading && showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={handleReviewSubmitted}
        />
      )}

      {/* Edit review form */}
      {!initialLoading && showEditForm && editingReview && (
        <ReviewForm
          productId={productId}
          editingReview={editingReview}
          onSuccess={handleReviewSubmitted}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Sign in prompt */}
      {authStatus === 'unauthenticated' && (
        <div className="reviews-section__signin-prompt">
          <a href="/login" className="reviews-section__signin-link">
            Sign in
          </a>{' '}
          to write a review
        </div>
      )}

      {/* Seller note */}
      {isOwnProduct && (
        <p className="reviews-section__seller-note">
          You cannot review your own product.
        </p>
      )}

      {/* Reviews list */}
      {initialLoading ? (
        <div className="reviews-section__loading" role="status" aria-label="Loading reviews">
          {[1, 2, 3].map((i) => (
            <div key={i} className="review-card review-card--skeleton" aria-hidden="true">
              <div className="review-card__skeleton-header" />
              <div className="review-card__skeleton-body" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="reviews-section__list">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              currentUserId={user?.id ?? null}
              onEdit={(rv) => setEditingReview(rv)}
              onDeleted={handleDeleted}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              id="load-more-reviews-btn"
              className="reviews-section__load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more reviews'}
            </button>
          )}
        </div>
      ) : (
        summary && summary.count === 0 && (
          <p className="reviews-section__no-reviews">
            No reviews yet for this product.
          </p>
        )
      )}
    </section>
  );
}
