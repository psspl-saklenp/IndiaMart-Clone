'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  addMessage,
  getInquiry,
  updateStatus,
} from '@/features/inquiries/api';
import { useAuth } from '@/hooks/use-auth';
import type { InquiryStatus } from '@/types/inquiries';

const STATUS_TONE = {
  new: 'info',
  responded: 'success',
  closed: 'neutral',
} as const;

interface Props {
  id: string;
  /** Whose inbox is this rendered in — controls subtle UI cues + back link. */
  viewer: 'buyer' | 'seller';
}

export function InquiryThread({ id, viewer }: Props) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [reply, setReply] = useState('');

  const {
    data: inquiry,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => getInquiry(id),
  });

  const sendMut = useMutation({
    mutationFn: () => addMessage(id, { message: reply.trim() }),
    onSuccess: () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['inquiry', id] });
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['inquiry-counts'] });
    },
  });

  const statusMut = useMutation({
    mutationFn: (next: InquiryStatus) => updateStatus(id, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiry', id] });
      qc.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });

  if (isLoading) return <p className="text-sm text-ink-500">Loading…</p>;
  if (isError || !inquiry) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load inquiry'}
      </div>
    );
  }

  const counterparty = viewer === 'seller' ? inquiry.buyer : inquiry.seller;
  const canCompose = inquiry.status !== 'closed';
  const canChangeStatus = viewer === 'seller' || user?.role === 'admin';
  const backHref = viewer === 'seller' ? '/seller/inquiries' : '/me/inquiries';

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref} className="text-xs text-ink-500 hover:text-ink-800">
          ← Back to inquiries
        </Link>
      </div>

      <header className="rounded-lg border border-ink-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-ink-900">{inquiry.subject}</h1>
            <p className="mt-1 text-xs text-ink-500">
              {viewer === 'seller' ? 'From' : 'To'}: <strong>{counterparty.name}</strong>
              {counterparty.email && <> · {counterparty.email}</>}
            </p>
            {inquiry.product && (
              <p className="mt-1 text-xs">
                <Link
                  href={`/product/${inquiry.product.slug}`}
                  className="text-brand-700 hover:underline"
                >
                  {inquiry.product.name}
                </Link>
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</Badge>
              {inquiry.quantity != null && (
                <span className="text-xs text-ink-500">
                  Qty: {inquiry.quantity} {inquiry.unit ?? ''}
                </span>
              )}
              {inquiry.expectedPrice && (
                <span className="text-xs text-ink-500">
                  Expected ₹
                  {Number(inquiry.expectedPrice).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
          </div>

          {canChangeStatus && (
            <div className="flex gap-2">
              {inquiry.status !== 'responded' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={statusMut.isPending && statusMut.variables === 'responded'}
                  onClick={() => statusMut.mutate('responded')}
                >
                  Mark responded
                </Button>
              )}
              {inquiry.status !== 'closed' && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={statusMut.isPending && statusMut.variables === 'closed'}
                  onClick={() => statusMut.mutate('closed')}
                >
                  Close
                </Button>
              )}
              {inquiry.status === 'closed' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={statusMut.isPending && statusMut.variables === 'new'}
                  onClick={() => statusMut.mutate('new')}
                >
                  Reopen
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <ul className="space-y-3">
        {inquiry.messages.map((m) => {
          const mine = m.senderUserId === user?.id;
          return (
            <li
              key={m.id}
              className={`max-w-[85%] rounded-lg border px-4 py-3 text-sm ${
                mine
                  ? 'ml-auto border-brand-200 bg-brand-50 text-ink-900'
                  : 'border-ink-200 bg-white text-ink-900'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-[11px] text-ink-500">
                <strong className="text-ink-700">{m.senderName}</strong>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 uppercase tracking-wide">
                  {m.senderRole}
                </span>
                <span>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-line">{m.message}</p>
            </li>
          );
        })}
      </ul>

      {canCompose ? (
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!reply.trim()) return;
            sendMut.mutate();
          }}
          className="space-y-2 rounded-lg border border-ink-200 bg-white p-4"
        >
          <Textarea
            name="reply"
            label="Reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            required
          />
          {sendMut.isError && (
            <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              {sendMut.error instanceof Error ? sendMut.error.message : 'Send failed'}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={sendMut.isPending} disabled={!reply.trim()}>
              Send reply
            </Button>
          </div>
        </form>
      ) : (
        <p className="rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500">
          This inquiry is closed. {viewer === 'seller' ? 'Reopen it from above to reply.' : 'The supplier closed this thread.'}
        </p>
      )}
    </div>
  );
}
