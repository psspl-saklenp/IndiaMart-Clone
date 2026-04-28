/**
 * Standard API envelope contracts shared by the backend.
 * Mirrors the shape produced by the backend's response interceptor (added in a later phase).
 */

export interface ApiSuccess<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type Role = 'buyer' | 'seller' | 'admin';

export interface PaginatedQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
