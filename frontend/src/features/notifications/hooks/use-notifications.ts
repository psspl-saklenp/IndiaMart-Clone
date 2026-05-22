'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import type {
  ListNotificationsParams,
  NotificationCounts,
  PaginatedNotifications,
} from '@/types/notifications';

import {
  deleteNotification,
  getCounts,
  listNotifications,
  markAllRead,
  markRead,
  markUnread,
  notificationKeys,
} from '../api';

const COUNTS_REFRESH_MS = 60_000;

export function useNotificationCounts() {
  const { isAuthenticated } = useAuth();
  return useQuery<NotificationCounts>({
    queryKey: notificationKeys.counts(),
    queryFn: getCounts,
    enabled: isAuthenticated,
    refetchInterval: COUNTS_REFRESH_MS,
    staleTime: COUNTS_REFRESH_MS / 2,
  });
}

export function useNotifications(params: ListNotificationsParams = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery<PaginatedNotifications>({
    queryKey: notificationKeys.list(params),
    queryFn: () => listNotifications(params),
    enabled: isAuthenticated,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkUnread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markUnread,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
