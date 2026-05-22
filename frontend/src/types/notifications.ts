import type { ApiMeta } from './api';

export type NotificationType =
  | 'new_inquiry'
  | 'new_message'
  | 'requirement_match'
  | 'new_review';

export interface NotificationData {
  inquiryId?: string;
  requirementId?: string;
  productId?: string;
  productSlug?: string;
  reviewId?: string;
  rating?: number;
  actorId?: string;
  actorName?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  data: NotificationData | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: ApiMeta;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: NotificationType;
}
