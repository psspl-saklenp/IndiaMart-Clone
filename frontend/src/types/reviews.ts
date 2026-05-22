import type { ApiMeta } from './api';

export interface Review {
  id: string;
  productId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingSummary {
  average: number | null;
  count: number;
  breakdown: RatingBreakdown;
}

export interface PaginatedReviews {
  data: Review[];
  meta: ApiMeta;
}

export interface ListReviewsParams {
  productId: string;
  page?: number;
  limit?: number;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  body?: string;
}
