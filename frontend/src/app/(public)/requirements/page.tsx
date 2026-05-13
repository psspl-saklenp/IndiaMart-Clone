import type { Metadata } from 'next';
import Link from 'next/link';

import { PublicRequirementsFeed } from '@/features/requirements/public-requirements-feed';

export const metadata: Metadata = {
  title: 'Buy Requirements',
  description: 'Browse open buy requirements from buyers across India. Register as a seller to respond.',
};

export default function PublicRequirementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">Buy Leads</p>
          <h1 className="text-2xl font-bold text-ink-900">Open Buy Requirements</h1>
          <p className="mt-1 text-sm text-ink-500">
            Buyers are actively looking for these products. Register as a seller to respond.
          </p>
        </div>
        <Link
          href="/requirements/new"
          className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          + Post a Requirement
        </Link>
      </div>

      <PublicRequirementsFeed />
    </div>
  );
}
