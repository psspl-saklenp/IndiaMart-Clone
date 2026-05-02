'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lookupKnownSeller } from '@/features/sellers/api';
import type { KnownSellerLookup } from '@/types/dashboard';

/**
 * "Know Your Seller" page body.
 *
 * The buyer types either part of a seller's name or email; pressing
 * Enter (or the Search button) hits `GET /sellers/lookup?q=...` which
 * returns the seller's name, email, phone, company name and GST number.
 *
 * The query is gated by a separate `submittedTerm` state so we only fire
 * the request after an explicit submit — typing alone doesn't spam the
 * backend, and the result list stays stable while the user edits.
 */
export function KnowYourSeller() {
  const [term, setTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');

  const {
    data,
    isFetching,
    isError,
    error,
  } = useQuery<KnownSellerLookup[]>({
    queryKey: ['known-seller-lookup', submittedTerm],
    queryFn: () => lookupKnownSeller(submittedTerm),
    enabled: submittedTerm.length >= 2,
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    setSubmittedTerm(trimmed);
  }

  const showEmpty =
    submittedTerm.length >= 2 && !isFetching && !isError && data && data.length === 0;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          Know Your Seller
        </h1>
        <p className="text-sm text-ink-500">
          Search any seller by name or email to view their contact and business
          details before sending an inquiry.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-md border border-ink-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <Input
            name="seller-search"
            label="Seller name or email"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Acme Industries or seller@example.com"
            autoComplete="off"
            minLength={2}
          />
        </div>
        <Button type="submit" loading={isFetching} disabled={term.trim().length < 2}>
          Search
        </Button>
      </form>

      {isError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error instanceof Error ? error.message : 'Failed to look up seller'}
        </div>
      )}

      {showEmpty && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-6 text-center text-sm text-ink-500">
          No sellers matched <span className="font-medium">{submittedTerm}</span>.
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((seller) => (
            <SellerResultCard key={seller.id} seller={seller} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SellerResultCard({ seller }: { seller: KnownSellerLookup }) {
  return (
    <li className="rounded-md border border-ink-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <DetailRow label="Name" value={seller.name} />
        <DetailRow label="Email" value={seller.email} />
        <DetailRow label="Phone number" value={seller.phone ?? '—'} />
        <DetailRow label="Company name" value={seller.companyName} />
        <DetailRow
          label="GST number"
          value={seller.gstNumber ?? '—'}
          className="sm:col-span-2"
        />
      </div>
    </li>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <p className="mt-0.5 break-words text-sm text-ink-900">{value}</p>
    </div>
  );
}
