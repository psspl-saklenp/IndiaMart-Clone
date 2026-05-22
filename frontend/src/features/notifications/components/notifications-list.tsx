'use client';

import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types/notifications';

import {
  useDeleteNotification,
  useMarkAllRead,
  useMarkRead,
  useMarkUnread,
  useNotifications,
} from '../hooks/use-notifications';

const TYPE_LABELS: Record<NotificationType, string> = {
  new_inquiry: 'Inquiry',
  new_message: 'Message',
  requirement_match: 'Requirement',
  new_review: 'Review',
};

export function NotificationsList() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading } = useNotifications({ page, limit: 20, unread: unreadOnly || undefined });
  const markAllRead = useMarkAllRead();

  const items = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setUnreadOnly((v) => !v)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            unreadOnly
              ? 'bg-brand-600 text-white'
              : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
          )}
        >
          {unreadOnly ? 'Showing unread' : 'Show unread only'}
        </button>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
          className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {isLoading ? (
        <Empty>Loading notifications…</Empty>
      ) : items.length === 0 ? (
        <Empty>No notifications yet.</Empty>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-ink-200 bg-white">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="font-semibold text-brand-700 disabled:cursor-not-allowed disabled:text-ink-400"
          >
            ← Previous
          </button>
          <span className="text-xs text-ink-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="font-semibold text-brand-700 disabled:cursor-not-allowed disabled:text-ink-400"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  const markRead = useMarkRead();
  const markUnread = useMarkUnread();
  const remove = useDeleteNotification();

  function handleClick() {
    if (!item.isRead) markRead.mutate(item.id);
  }

  const body = (
    <div className="flex flex-1 items-start gap-3">
      <span
        aria-hidden
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          item.isRead ? 'bg-ink-300' : 'bg-brand-600',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
            {TYPE_LABELS[item.type] ?? item.type}
          </span>
          <p className={cn('text-sm', item.isRead ? 'text-ink-700' : 'font-semibold text-ink-900')}>
            {item.title}
          </p>
        </div>
        {item.body && <p className="mt-1 text-sm text-ink-500">{item.body}</p>}
        <p className="mt-1 text-xs text-ink-400">{new Date(item.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b border-ink-100 px-4 py-3 last:border-b-0 transition-colors hover:bg-ink-50/60',
        !item.isRead && 'bg-brand-50/40',
      )}
    >
      {item.link ? (
        <Link href={item.link} onClick={handleClick} className="flex-1">
          {body}
        </Link>
      ) : (
        <div className="flex-1">{body}</div>
      )}
      <div className="flex shrink-0 items-center gap-1 pt-1 text-xs">
        <button
          type="button"
          onClick={() =>
            item.isRead ? markUnread.mutate(item.id) : markRead.mutate(item.id)
          }
          className="rounded px-2 py-1 font-semibold text-brand-700 hover:bg-brand-50"
        >
          {item.isRead ? 'Unread' : 'Read'}
        </button>
        <button
          type="button"
          onClick={() => remove.mutate(item.id)}
          aria-label="Delete notification"
          className="rounded px-2 py-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
      {children}
    </div>
  );
}
