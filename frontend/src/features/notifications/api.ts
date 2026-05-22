import { api } from '@/lib/axios';
import type {
  ListNotificationsParams,
  Notification,
  NotificationCounts,
  PaginatedNotifications,
} from '@/types/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: ListNotificationsParams) =>
    [...notificationKeys.all, 'list', params] as const,
  counts: () => [...notificationKeys.all, 'counts'] as const,
};

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<PaginatedNotifications> {
  const { data } = await api.get<PaginatedNotifications>('/notifications', { params });
  return data;
}

export async function getCounts(): Promise<NotificationCounts> {
  const { data } = await api.get<NotificationCounts>('/notifications/counts');
  return data;
}

export async function markRead(id: string): Promise<Notification> {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
  return data;
}

export async function markUnread(id: string): Promise<Notification> {
  const { data } = await api.patch<Notification>(`/notifications/${id}/unread`);
  return data;
}

export async function markAllRead(): Promise<{ updated: number }> {
  const { data } = await api.patch<{ updated: number }>('/notifications/read-all');
  return data;
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
