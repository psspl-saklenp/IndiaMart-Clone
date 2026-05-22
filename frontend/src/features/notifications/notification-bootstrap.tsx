'use client';

import { useNotificationStream } from './hooks/use-notification-stream';

/**
 * Renderless helper that opens the SSE connection once auth is ready.
 * Mounted inside <ToastProvider> so `useToast()` from the stream hook resolves.
 */
export function NotificationBootstrap() {
  useNotificationStream();
  return null;
}
