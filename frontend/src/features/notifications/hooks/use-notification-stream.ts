'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { getAccessToken } from '@/lib/axios';
import type { Notification } from '@/types/notifications';

import { notificationKeys } from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const RECONNECT_MIN_MS = 1500;
const RECONNECT_MAX_MS = 30_000;

/**
 * Subscribes to the backend SSE notification stream for the current user.
 *
 * Each incoming event triggers:
 *   1. a toast (via the global ToastProvider),
 *   2. a TanStack Query invalidation so the badge count and lists re-fetch.
 *
 * The connection auto-reconnects with capped exponential backoff. The
 * cleanup function tears the EventSource down on logout / unmount so we
 * never leak file descriptors.
 */
export function useNotificationStream(): void {
  const { isAuthenticated, user } = useAuth();
  const { push } = useToast();
  const qc = useQueryClient();
  const backoffRef = useRef(RECONNECT_MIN_MS);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let cancelled = false;

    function connect(): void {
      if (cancelled) return;

      const token = getAccessToken();
      if (!token) {
        // Token not hydrated yet — retry shortly.
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_MIN_MS);
        return;
      }

      const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url, { withCredentials: true });
      sourceRef.current = es;

      es.addEventListener('open', () => {
        backoffRef.current = RECONNECT_MIN_MS;
      });

      es.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data) as Notification;
          push({
            title: data.title,
            description: data.body ?? undefined,
            href: data.link ?? undefined,
            variant: variantFor(data),
          });
          void qc.invalidateQueries({ queryKey: notificationKeys.all });
        } catch {
          // Malformed payload — skip without crashing the stream.
        }
      });

      es.addEventListener('error', () => {
        es.close();
        sourceRef.current = null;
        if (cancelled) return;
        // Exponential backoff to avoid hammering the server on persistent failure.
        reconnectTimerRef.current = setTimeout(connect, backoffRef.current);
        backoffRef.current = Math.min(backoffRef.current * 2, RECONNECT_MAX_MS);
      });
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      sourceRef.current?.close();
      sourceRef.current = null;
      backoffRef.current = RECONNECT_MIN_MS;
    };
  }, [isAuthenticated, user, push, qc]);
}

function variantFor(n: Notification): 'info' | 'success' | 'warning' | 'error' {
  switch (n.type) {
    case 'new_inquiry':
    case 'requirement_match':
      return 'success';
    case 'new_review':
      return 'info';
    case 'new_message':
    default:
      return 'info';
  }
}
