import { api } from '@/lib/axios';
import type {
  CreateReviewPayload,
  ListReviewsParams,
  PaginatedReviews,
  RatingSummary,
  Review,
  UpdateReviewPayload,
} from '@/types/reviews';

export async function getReviewSummary(productId: string): Promise<RatingSummary> {
  const { data } = await api.get<RatingSummary>('/reviews/summary', {
    params: { productId },
  });
  return data;
}

export async function listReviews(params: ListReviewsParams): Promise<PaginatedReviews> {
  const { data } = await api.get<PaginatedReviews>('/reviews', { params });
  return data;
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', payload);
  return data;
}

export async function updateReview(id: string, payload: UpdateReviewPayload): Promise<Review> {
  const { data } = await api.patch<Review>(`/reviews/${id}`, payload);
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
