'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { Notification } from '@/types/notifications';

import {
  useDeleteNotification,
  useMarkAllRead,
  useMarkRead,
  useNotificationCounts,
  useNotifications,
} from '../hooks/use-notifications';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: counts } = useNotificationCounts();
  const unread = counts?.unread ?? 0;

  // Close the dropdown when the user clicks outside it.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications, no new items'
        }
        className={cn(
          'relative hidden flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium text-white/90 transition-all duration-150 sm:flex',
          open ? 'bg-white/20' : 'hover:bg-white/10',
        )}
      >
        <span aria-hidden className="text-white/80">
          <IconBell />
        </span>
        <span>Alerts</span>
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute right-1 top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-[var(--color-im-navy-800)]"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && <NotificationsDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useNotifications({ limit: 10 });
  const markAllRead = useMarkAllRead();
  const items = data?.data ?? [];

  return (
    <div
      role="menu"
      className="absolute right-0 mt-2 w-[22rem] max-w-[92vw] overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-800 shadow-[var(--shadow-pop)] animate-fade-in"
    >
      <div className="flex items-center justify-between border-b border-ink-100 bg-gradient-to-br from-[var(--color-im-navy-50)] to-white px-4 py-2.5">
        <p className="text-sm font-semibold text-ink-900">Notifications</p>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || items.every((n) => n.isRead)}
          className="text-xs font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <DropdownEmpty>Loading…</DropdownEmpty>
        ) : items.length === 0 ? (
          <DropdownEmpty>You&apos;re all caught up.</DropdownEmpty>
        ) : (
          items.map((n) => <NotificationRow key={n.id} item={n} onNavigate={onClose} />)
        )}
      </div>

      <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2 text-center">
        <Link
          href="/me/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-brand-700 hover:underline"
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
}

function DropdownEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-32 items-center justify-center px-4 text-center text-sm text-ink-500">
      {children}
    </div>
  );
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: Notification;
  onNavigate: () => void;
}) {
  const markRead = useMarkRead();
  const remove = useDeleteNotification();

  function handleClick() {
    if (!item.isRead) markRead.mutate(item.id);
    onNavigate();
  }

  const Wrapper = (props: { children: React.ReactNode }) =>
    item.link ? (
      <Link href={item.link} onClick={handleClick} className="block">
        {props.children}
      </Link>
    ) : (
      <button type="button" onClick={handleClick} className="block w-full text-left">
        {props.children}
      </button>
    );

  return (
    <div
      className={cn(
        'group flex items-start gap-3 border-b border-ink-100 px-4 py-3 transition-colors hover:bg-ink-50/60',
        !item.isRead && 'bg-brand-50/40',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-1.5 size-2 shrink-0 rounded-full',
          item.isRead ? 'bg-ink-300' : 'bg-brand-600',
        )}
      />
      <Wrapper>
        <p className={cn('text-sm', item.isRead ? 'text-ink-700' : 'font-semibold text-ink-900')}>
          {item.title}
        </p>
        {item.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{item.body}</p>}
        <p className="mt-1 text-[10px] uppercase tracking-wide text-ink-400">
          {formatRelative(item.createdAt)}
        </p>
      </Wrapper>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          remove.mutate(item.id);
        }}
        aria-label="Delete notification"
        className="ml-auto rounded p-1 text-ink-300 opacity-0 transition-all hover:bg-ink-100 hover:text-ink-700 group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 7 * 86400) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function IconBell() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
