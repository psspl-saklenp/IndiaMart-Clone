import Link from 'next/link';

import { listRequirements } from '@/features/requirements/api';
import type { Requirement } from '@/types/engagement';

/**
 * Server component — shows the 5 most recent open buy requirements.
 * No auth required (public endpoint). Sellers are nudged to register/login
 * to respond.
 */
export async function HomeBuyLeadsPreview() {
  let requirements: Requirement[] = [];
  try {
    const result = await listRequirements({ limit: 5, status: 'open' });
    requirements = result.data;
  } catch {
    // Silently degrade
  }

  if (requirements.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
        No open requirements yet.{' '}
        <Link href="/requirements/new" className="font-medium text-brand-700 hover:underline">
          Post the first one →
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requirements.map((req) => (
        <BuyLeadRow key={req.id} req={req} />
      ))}

      {/* Seller CTA */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-900">
          Are you a supplier? Respond to these requirements.
        </p>
        <p className="mt-1 text-xs text-brand-700">
          Register as a seller to see all buy leads and respond directly to buyers.
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700"
          >
            Register as Seller
          </Link>
          <Link
            href="/requirements"
            className="rounded-lg border border-brand-400 bg-white px-4 py-2 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            View all requirements →
          </Link>
        </div>
      </div>
    </div>
  );
}

function BuyLeadRow({ req }: { req: Requirement }) {
  const timeAgo = formatTimeAgo(req.createdAt);

  return (
    <div className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xl">
        📋
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900 line-clamp-1">{req.title}</p>
        <p className="mt-0.5 text-xs text-ink-500 line-clamp-1">{req.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-ink-400">
          <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">
            {req.category.name}
          </span>
          {req.quantity && req.unit && (
            <span>
              Qty: {req.quantity} {req.unit}
            </span>
          )}
          {req.locationCity && <span>📍 {req.locationCity}</span>}
          <span>{timeAgo}</span>
          <span className="ml-auto font-medium text-brand-600">
            {req.responseCount} response{req.responseCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
