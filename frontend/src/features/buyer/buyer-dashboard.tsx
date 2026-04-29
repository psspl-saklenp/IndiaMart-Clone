'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listInquiries } from '@/features/inquiries/api';
import { listSaved } from '@/features/saved/api';
import { listMyRequirements } from '@/features/requirements/api';
import { useAuth } from '@/hooks/use-auth';

export function BuyerDashboard() {
  const { user } = useAuth();

  const [inqQ, savedQ, reqQ] = useQueries({
    queries: [
      { queryKey: ['inquiries', { viewer: 'buyer', limit: 5 }], queryFn: () => listInquiries({ limit: 5 }) },
      { queryKey: ['saved-products'], queryFn: listSaved },
      { queryKey: ['my-requirements'], queryFn: listMyRequirements },
    ],
  });

  const inquiries = inqQ.data?.data ?? [];
  const saved = savedQ.data ?? [];
  const requirements = reqQ.data ?? [];
  const openReqs = requirements.filter((r) => r.status === 'open');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-sm text-ink-500">A quick view of your activity.</p>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi
          label="Inquiries sent"
          value={inqQ.data?.meta.total ?? 0}
          href="/me/inquiries"
        />
        <Kpi label="Saved products" value={saved.length} href="/me/saved" />
        <Kpi
          label="Open requirements"
          value={openReqs.length}
          hint={`${requirements.length} total`}
          href="/me/requirements"
        />
        <div className="rounded-lg border border-ink-200 bg-brand-50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
            Need something?
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-900">Post a requirement</p>
          <p className="mt-1 text-xs text-ink-600">Get quotes from multiple suppliers.</p>
          <Link href="/requirements/new" className="mt-2 inline-block">
            <Button size="sm">Post now</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent inquiries" emptyText="No inquiries yet." href="/me/inquiries">
          {inquiries.slice(0, 5).map((inq) => (
            <li key={inq.id}>
              <Link
                href={`/me/inquiries/${inq.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-ink-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{inq.subject}</p>
                  <p className="truncate text-xs text-ink-500">
                    To: {inq.seller.name} · {new Date(inq.lastMessageAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={inq.status === 'new' ? 'info' : inq.status === 'responded' ? 'success' : 'neutral'}>
                  {inq.status}
                </Badge>
              </Link>
            </li>
          ))}
        </Panel>

        <Panel
          title="Recent saved products"
          emptyText="Tap the heart on any product card to save it."
          href="/me/saved"
        >
          {saved.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link
                href={`/product/${p.slug}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-ink-50"
              >
                <div className="size-10 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-500">
                    ₹{Number(p.price).toLocaleString('en-IN')} / {p.unit}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </Panel>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className="h-full rounded-lg border border-ink-200 bg-white p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">{value.toLocaleString('en-IN')}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({
  title,
  emptyText,
  href,
  children,
}: {
  title: string;
  emptyText: string;
  href: string;
  children: React.ReactNode;
}) {
  const childArray = Array.isArray(children) ? children : [children];
  const isEmpty = !childArray || childArray.flat().filter(Boolean).length === 0;

  return (
    <div className="rounded-lg border border-ink-200 bg-white">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        <Link href={href} className="text-xs font-medium text-brand-700 hover:underline">
          View all →
        </Link>
      </div>
      {isEmpty ? (
        <p className="px-4 py-6 text-center text-xs text-ink-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-ink-100">{children}</ul>
      )}
    </div>
  );
}
